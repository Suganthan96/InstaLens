import { createHash } from 'crypto'

interface MailchimpConfig {
  listId: string
  groupId?: string
  tags?: string[]
}

interface MailchimpSubscriber {
  email_address: string
  status: 'subscribed' | 'unsubscribed' | 'cleaned' | 'pending'
  merge_fields?: Record<string, any>
  tags?: Array<{ name: string; status: 'active' | 'inactive' }>
}

export class MailchimpIntegration {
  private apiKey: string
  private apiServer: string
  private apiUrl: string

  constructor() {
    this.apiKey = process.env.MAILCHIMP_API_KEY || ''
    // Extract server from API key (e.g., us1, us2, etc.)
    this.apiServer = this.apiKey.split('-')[1] || 'us1'
    this.apiUrl = `https://${this.apiServer}.api.mailchimp.com/3.0`
  }

  async push(data: any, config: MailchimpConfig) {
    const { listId, tags = [] } = config
    const lead = data.lead || {}
    const enrichment = data.enrichmentData || {}
    const segmentation = data.segmentation || {}

    try {
      // Prepare subscriber data
      const subscriber: MailchimpSubscriber = {
        email_address: lead.email || '',
        status: 'pending',
        merge_fields: {
          FNAME: lead.companyName?.split(' ')[0] || '',
          LNAME: lead.companyName?.split(' ')[1] || '',
          COMPANY: lead.companyName || '',
          PHONE: lead.phone || '',
          ADDRESS: {
            addr1: '',
            city: '',
            state: '',
            zip: '',
            country: '',
          },
        },
        tags: [
          ...tags,
          ...segmentation.tags.slice(0, 3), // Max 3 tags from segmentation
          enrichment.businessType,
          enrichment.primaryCategory,
        ]
          .filter(Boolean)
          .map((tag) => ({
            name: String(tag).substring(0, 50), // Mailchimp max 50 chars
            status: 'active' as const,
          })),
      }

      // Add to audience
      const response = await this.addOrUpdateSubscriber(listId, subscriber)

      // Add custom properties via PATCH if they exist
      if (response.id) {
        await this.updateCustomFields(listId, response.id, {
          instagram_handle: lead.socialProfiles?.instagram?.handle,
          follower_count: lead.socialProfiles?.instagram?.followers,
          business_type: enrichment.businessType,
          lead_score: segmentation.leadScore,
          engagement_rate: enrichment.engagementRate,
        })
      }

      return {
        listId,
        subscriberId: response.id,
        email: subscriber.email_address,
        status: 'success',
        timestamp: new Date().toISOString(),
      }
    } catch (error: any) {
      console.error('Mailchimp integration failed:', error.message)
      throw error
    }
  }

  private makeAuthHeader(): string {
    const credentials = `anystring:${this.apiKey}`
    return 'Basic ' + Buffer.from(credentials).toString('base64')
  }

  private async addOrUpdateSubscriber(
    listId: string,
    subscriber: MailchimpSubscriber
  ) {
    try {
      // Try to get existing subscriber first
      const email = subscriber.email_address.toLowerCase()
      const hash = this.md5(email)

      try {
        // Attempt to update existing subscriber
        const response = await fetch(
          `${this.apiUrl}/lists/${listId}/members/${hash}`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': this.makeAuthHeader(),
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(subscriber),
          }
        )

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data = await response.json()
        console.log(`Updated subscriber: ${email}`)
        return data
      } catch (error: any) {
        if (
          error.message?.includes('404') ||
          error.message?.includes('400')
        ) {
          // Subscriber doesn't exist, create new
          const response = await fetch(
            `${this.apiUrl}/lists/${listId}/members`,
            {
              method: 'POST',
              headers: {
                'Authorization': this.makeAuthHeader(),
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(subscriber),
            }
          )

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
          }

          const data = await response.json()
          console.log(`Created new subscriber: ${email}`)
          return data
        }
        throw error
      }
    } catch (error) {
      console.error('Error adding/updating subscriber:', error)
      throw error
    }
  }

  private async updateCustomFields(
    listId: string,
    subscriberId: string,
    customFields: Record<string, any>
  ) {
    try {
      const mergeFields: Record<string, any> = {}

      // Map custom fields to merge fields (must be pre-created in Mailchimp)
      if (customFields.instagram_handle) {
        mergeFields.INSTA_HANDLE = customFields.instagram_handle
      }
      if (customFields.follower_count) {
        mergeFields.FOLLOW_COUNT = String(customFields.follower_count)
      }
      if (customFields.business_type) {
        mergeFields.BIZ_TYPE = customFields.business_type
      }
      if (customFields.lead_score) {
        mergeFields.LEAD_SCORE = String(customFields.lead_score)
      }

      if (Object.keys(mergeFields).length > 0) {
        await fetch(
          `${this.apiUrl}/lists/${listId}/members/${subscriberId}`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': this.makeAuthHeader(),
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ merge_fields: mergeFields }),
          }
        )
      }
    } catch (error) {
      console.error('Error updating custom fields:', error)
      // Don't throw - this is non-critical
    }
  }

  private md5(str: string): string {
    return createHash('md5').update(str.toLowerCase()).digest('hex')
  }
}
