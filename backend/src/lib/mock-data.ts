/**
 * Mock Instagram data for testing
 * Returns realistic sample data when real API calls fail
 */

export function getMockProfile() {
  return {
    id: '17841403123456789',
    username: 'insta_lens_business',
    name: 'InstaLens',
    biography: 'Unlock your Instagram insights 📊 | Analytics | Hashtag Research | Engagement Metrics',
    website: 'https://instalens.app',
    profile_picture_url: 'https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=123456789&height=50&width=50&ext=1234567890&hash=AeRxyz1234567890abc'
  }
}

export function getMockMedia() {
  return [
    {
      id: '18001234567890123',
      caption: 'Just launched InstaLens! 🚀 Track your #Instagram growth with our new analytics dashboard. #socialmedia #analytics #growth',
      media_type: 'IMAGE',
      media_url: 'https://platform-lookaside.fbsbx.com/platform/image/?asid=123456&height=960&width=960',
      timestamp: '2024-04-08T10:30:00+0000',
      like_count: 342,
      comments_count: 28
    },
    {
      id: '18001234567890124',
      caption: '5 hashtags that will boost your engagement 📈 #Instagram #hashtags #socialmediatips #contentcreator #engagement',
      media_type: 'IMAGE',
      media_url: 'https://platform-lookaside.fbsbx.com/platform/image/?asid=123457&height=960&width=960',
      timestamp: '2024-04-07T14:15:00+0000',
      like_count: 521,
      comments_count: 45
    },
    {
      id: '18001234567890125',
      caption: 'Your audience is waiting! Start #Analytics today and understand your followers better. #Instagram #data #insights',
      media_type: 'IMAGE',
      media_url: 'https://platform-lookaside.fbsbx.com/platform/image/?asid=123458&height=960&width=960',
      timestamp: '2024-04-06T09:45:00+0000',
      like_count: 289,
      comments_count: 19
    },
    {
      id: '18001234567890126',
      caption: 'Real talk: These #contentcreators are crushing it with #InstaLens. See their strategy! 👇 #Instagram #success #growth',
      media_type: 'IMAGE',
      media_url: 'https://platform-lookaside.fbsbx.com/platform/image/?asid=123459&height=960&width=960',
      timestamp: '2024-04-05T16:20:00+0000',
      like_count: 612,
      comments_count: 67
    },
    {
      id: '18001234567890127',
      caption: 'New feature alert! 🎉 Track mentions and replies in real-time. #Instagram #feature #Update #analytics',
      media_type: 'IMAGE',
      media_url: 'https://platform-lookaside.fbsbx.com/platform/image/?asid=123460&height=960&width=960',
      timestamp: '2024-04-04T11:00:00+0000',
      like_count: 445,
      comments_count: 32
    },
    {
      id: '18001234567890128',
      caption: 'Consistency is key! Post 3-5 times weekly for best results 📅 #Instagram #strategy #tips #contentcreator #growth',
      media_type: 'IMAGE',
      media_url: 'https://platform-lookaside.fbsbx.com/platform/image/?asid=123461&height=960&width=960',
      timestamp: '2024-04-03T13:30:00+0000',
      like_count: 356,
      comments_count: 24
    },
    {
      id: '18001234567890129',
      caption: 'Our users grew 150% in engagement this month! 📈 What\'s your growth? #Instagram #analytics #success #insights',
      media_type: 'IMAGE',
      media_url: 'https://platform-lookaside.fbsbx.com/platform/image/?asid=123462&height=960&width=960',
      timestamp: '2024-04-02T10:15:00+0000',
      like_count: 789,
      comments_count: 91
    },
    {
      id: '18001234567890130',
      caption: 'Video content is dominating 🎬 Switch up your content mix! #Instagram #video #contentcreator #tips #growth',
      media_type: 'IMAGE',
      media_url: 'https://platform-lookaside.fbsbx.com/platform/image/?asid=123463&height=960&width=960',
      timestamp: '2024-04-01T15:45:00+0000',
      like_count: 534,
      comments_count: 48
    },
    {
      id: '18001234567890131',
      caption: 'Hashtag research just got easier 🔍 Find trending tags for your niche #Instagram #hashtags #analytics #tools',
      media_type: 'IMAGE',
      media_url: 'https://platform-lookaside.fbsbx.com/platform/image/?asid=123464&height=960&width=960',
      timestamp: '2024-03-31T12:00:00+0000',
      like_count: 421,
      comments_count: 35
    },
    {
      id: '18001234567890132',
      caption: 'Join 10K+ creators using InstaLens 🌟 See what they\'re getting from our platform #Instagram #community #growth',
      media_type: 'IMAGE',
      media_url: 'https://platform-lookaside.fbsbx.com/platform/image/?asid=123465&height=960&width=960',
      timestamp: '2024-03-30T09:30:00+0000',
      like_count: 678,
      comments_count: 73
    },
    {
      id: '18001234567890133',
      caption: 'Best time to post? We analyzed 100K posts 📊 Spoiler: 6-9 PM is golden #Instagram #statistics #tips #analytics',
      media_type: 'IMAGE',
      media_url: 'https://platform-lookaside.fbsbx.com/platform/image/?asid=123466&height=960&width=960',
      timestamp: '2024-03-29T14:20:00+0000',
      like_count: 543,
      comments_count: 56
    },
    {
      id: '18001234567890134',
      caption: 'Captions matter! Check your engagement rates with different caption lengths 📝 #Instagram #copywriting #engagement #tips',
      media_type: 'IMAGE',
      media_url: 'https://platform-lookaside.fbsbx.com/platform/image/?asid=123467&height=960&width=960',
      timestamp: '2024-03-28T11:45:00+0000',
      like_count: 412,
      comments_count: 38
    }
  ]
}

export function extractHashtagsFromCaption(caption: string): string[] {
  const regex = /#\w+/g
  const matches = caption.match(regex) || []
  return matches.map(tag => tag.toLowerCase())
}

export function extractMentionsFromCaption(caption: string): string[] {
  const regex = /@\w+/g
  const matches = caption.match(regex) || []
  return matches.map(mention => mention.toLowerCase())
}

export function parseMediaData(media: any[]) {
  const hashtags = new Map<string, number>()
  const mentions = new Map<string, number>()
  let totalEngagement = 0
  let totalPosts = media.length
  let totalLikes = 0
  let totalComments = 0

  for (const post of media) {
    const likes = post.like_count || 0
    const comments = post.comments_count || 0
    const engagement = likes + comments

    totalLikes += likes
    totalComments += comments
    totalEngagement += engagement

    // Extract hashtags
    const postHashtags = extractHashtagsFromCaption(post.caption || '')
    postHashtags.forEach(tag => {
      hashtags.set(tag, (hashtags.get(tag) || 0) + 1)
    })

    // Extract mentions
    const postMentions = extractMentionsFromCaption(post.caption || '')
    postMentions.forEach(mention => {
      mentions.set(mention, (mentions.get(mention) || 0) + 1)
    })
  }

  // Sort by frequency
  const topHashtags = Array.from(hashtags.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([tag, count]) => ({ tag, count }))

  const topMentions = Array.from(mentions.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([mention, count]) => ({ mention, count }))

  return {
    hashtags: topHashtags,
    mentions: topMentions,
    engagement: {
      totalPosts,
      totalLikes,
      totalComments,
      totalEngagement,
      avgLikesPerPost: Math.round(totalLikes / totalPosts),
      avgCommentsPerPost: Math.round(totalComments / totalPosts),
      avgEngagementPerPost: Math.round(totalEngagement / totalPosts)
    },
    contentAnalysis: {
      totalHashtagsUsed: hashtags.size,
      totalMentionsUsed: mentions.size,
      averageHashtagsPerPost: Math.round(
        Array.from(hashtags.values()).reduce((a, b) => a + b, 0) / totalPosts
      ),
      averageMentionsPerPost: Math.round(
        Array.from(mentions.values()).reduce((a, b) => a + b, 0) / totalPosts
      )
    }
  }
}
