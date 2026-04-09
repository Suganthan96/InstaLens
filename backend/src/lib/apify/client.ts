/**
 * Apify Instagram Scraper Integration
 * Uses Apify's Instagram Scraper actor to fetch real Instagram data
 */

interface ApifyActorRun {
  id: string
  actId: string
  userId: string
  status: string
  startedAt: string
  finishedAt?: string
  defaultDatasetId?: string
}

interface InstagramPostData {
  id: string
  shortCode: string
  caption: string
  timestamp: string
  likesCount: number
  commentsCount: number
  type: string
  url: string
  ownerUsername?: string
  ownerFullName?: string
  ownerBiography?: string
  ownerFollowers?: number
  ownerFollowing?: number
  ownerPostsCount?: number
  ownerProfilePicUrl?: string
  ownerVerified?: boolean
}

interface ApifyConfig {
  apiToken: string
  actorId: string
}

export class ApifyInstagramClient {
  private apiToken: string
  private actorId: string
  private apiBaseUrl = 'https://api.apify.com/v2'

  constructor(config: ApifyConfig) {
    this.apiToken = config.apiToken
    this.actorId = config.actorId
  }

  /**
   * Run Instagram scraper using async approach:
   * 1. Start actor run
   * 2. Wait for completion
   * 3. Fetch dataset
   */
  async scrapeAndWait(username: string, limit: number = 12): Promise<InstagramPostData[]> {
    try {
      console.log(`🚀 Starting Apify scrape for @${username}...`)

      // URL encode the actor ID
      const encodedActorId = encodeURIComponent(this.actorId)

      // Step 1: Start the run
      console.log(`📡 Starting actor run...`)
      const startUrl = `${this.apiBaseUrl}/acts/${encodedActorId}/runs?token=${this.apiToken}`

      const startResponse = await fetch(startUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          usernames: [username],
          resultsType: 'posts',
          resultsLimit: limit,
          searchType: 'user'
        })
      })

      if (startResponse.status !== 201) {
        const errorData = await startResponse.text()
        throw new Error(`Failed to start actor run: ${startResponse.status} - ${errorData}`)
      }

      const startData = await startResponse.json()
      const runId = startData?.data?.id

      if (!runId) {
        throw new Error('No run ID returned from Apify')
      }

      console.log(`✅ Run started: ${runId}`)

      // Step 2: Poll for completion (max 60 attempts = 60 seconds)
      console.log(`⏳ Waiting for run to complete...`)
      let runStatus = 'RUNNING'
      let pollAttempts = 0
      const maxAttempts = 60

      while (runStatus === 'RUNNING' && pollAttempts < maxAttempts) {
        pollAttempts++

        const statusUrl = `${this.apiBaseUrl}/actor-runs/${runId}?token=${this.apiToken}`
        const statusResponse = await fetch(statusUrl)
        const statusData = await statusResponse.json()
        runStatus = statusData?.data?.status

        if (runStatus !== 'RUNNING') {
          break
        }

        // Wait 1 second before next check
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      console.log(`📊 Run completed with status: ${runStatus}`)

      if (runStatus !== 'SUCCEEDED') {
        throw new Error(`Actor run failed with status: ${runStatus}`)
      }

      // Step 3: Fetch the dataset
      console.log(`📥 Fetching dataset...`)
      const datasetUrl = `${this.apiBaseUrl}/actor-runs/${runId}/dataset/items?token=${this.apiToken}&clean=true`
      const datasetResponse = await fetch(datasetUrl)
      const items = await datasetResponse.json()

      if (!Array.isArray(items) || items.length === 0) {
        throw new Error('No items returned from dataset')
      }

      // Check for error response
      if (items[0]?.error) {
        const errorMsg = items[0].errorDescription || items[0].error
        throw new Error(`Apify actor returned error: ${errorMsg}`)
      }

      // Filter out any error items
      const validItems = items.filter((item: any) => !item.error)

      if (validItems.length === 0) {
        throw new Error('All items returned were errors or invalid')
      }

      console.log(`✅ Got ${validItems.length} posts from Apify!`)
      return validItems as InstagramPostData[]
    } catch (error: any) {
      console.error('❌ Scrape failed:', error.message)
      throw error
    }
  }

  /**
   * Extract hashtags from posts
   */
  static extractHashtags(posts: InstagramPostData[]): Map<string, number> {
    const hashtags = new Map<string, number>()

    for (const post of posts) {
      const matches = (post.caption.match(/#\w+/g) || []).map(tag => tag.toLowerCase())
      matches.forEach(tag => {
        hashtags.set(tag, (hashtags.get(tag) || 0) + 1)
      })
    }

    return hashtags
  }

  /**
   * Extract mentions from posts
   */
  static extractMentions(posts: InstagramPostData[]): Map<string, number> {
    const mentions = new Map<string, number>()

    for (const post of posts) {
      const matches = (post.caption.match(/@\w+/g) || []).map(mention => mention.toLowerCase())
      matches.forEach(mention => {
        mentions.set(mention, (mentions.get(mention) || 0) + 1)
      })
    }

    return mentions
  }

  /**
   * Calculate engagement metrics
   */
  static calculateEngagement(posts: InstagramPostData[]): {
    totalPosts: number
    totalLikes: number
    totalComments: number
    avgLikes: number
    avgComments: number
    totalEngagement: number
  } {
    if (posts.length === 0) {
      return {
        totalPosts: 0,
        totalLikes: 0,
        totalComments: 0,
        avgLikes: 0,
        avgComments: 0,
        totalEngagement: 0
      }
    }

    let totalLikes = 0
    let totalComments = 0

    for (const post of posts) {
      totalLikes += post.likesCount || 0
      totalComments += post.commentsCount || 0
    }

    return {
      totalPosts: posts.length,
      totalLikes,
      totalComments,
      avgLikes: Math.round(totalLikes / posts.length),
      avgComments: Math.round(totalComments / posts.length),
      totalEngagement: totalLikes + totalComments
    }
  }
}

// Export utility functions
export function extractHashtags(posts: InstagramPostData[]): Map<string, number> {
  return ApifyInstagramClient.extractHashtags(posts)
}

export function extractMentions(posts: InstagramPostData[]): Map<string, number> {
  return ApifyInstagramClient.extractMentions(posts)
}

export function calculateEngagement(
  posts: InstagramPostData[]
): ReturnType<typeof ApifyInstagramClient.calculateEngagement> {
  return ApifyInstagramClient.calculateEngagement(posts)
}
