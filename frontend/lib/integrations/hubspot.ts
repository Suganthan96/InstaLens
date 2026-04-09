import { Client } from '@hubspot/api-client'

interface HubSpotConfig {
  listId?: string
}

export class HubSpotIntegration {
  private client: Client

  constructor() {
    this.client = new Client({
      accessToken: process.env.HUBSPOT_ACCESS_TOKEN,
    })
  }

  async push(data: any, config: HubSpotConfig) {
    const lead = data.lead || {}
    const enrichment = data.enrichmentData || {}
    const segmentation = data.segmentation || {}

    try {
      // Create or update contact
      const contactData = {
        properties: {
          email: lead.email,
          firstname: lead.companyName?.split(' ')[0],
          lastname: lead.companyName?.split(' ').slice(1).join(' '),
          company: lead.companyName,
          website: lead.website,
          phone: lead.phone,
          industry: lead.industry,

          // Custom properties (must be created in HubSpot first)
          instagram_handle: lead.socialProfiles?.instagram?.handle,
          instagram_followers: String(
            lead.socialProfiles?.instagram?.followers || 0
          ),
          instagram_profile_url: lead.socialProfiles?.instagram?.url,
          business_type: enrichment.businessType,
          target_market: enrichment.targetMarket,
          brand_voice: enrichment.brandVoice,
          primary_category: enrichment.primaryCategory,
          lead_score: String(segmentation.leadScore || 0),
          lead_priority: segmentation.priority,
          lead_lifecycle: segmentation.lifecycle,
        },
      }

      const response = await this.client.crm.contacts.basicApi.create(
        contactData
      )

      // Add to list if specified
      if (config.listId) {
        try {
          await this.client.crm.lists.membershipsApi.add(config.listId, {
            inputs: [
              {
                id: response.id,
              },
            ],
          })
        } catch (error) {
          console.warn(`Failed to add contact to list ${config.listId}:`, error)
          // Non-critical error, continue
        }
      }

      // Add tags
      if (segmentation.tags && segmentation.tags.length > 0) {
        try {
          await this.addTags(response.id, segmentation.tags)
        } catch (error) {
          console.warn('Failed to add tags:', error)
          // Non-critical error, continue
        }
      }

      return {
        contactId: response.id,
        email: lead.email,
        status: 'success',
        listAdded: !!config.listId,
      }
    } catch (error: any) {
      console.error('HubSpot integration failed:', error)
      throw error
    }
  }

  private async addTags(contactId: string, tags: string[]) {
    try {
      // HubSpot tags via associations
      // Note: This simplified approach adds tags as a custom field
      // For full tag support, use the Engagements API

      const tagString = tags
        .slice(0, 5)
        .map((tag) => String(tag).substring(0, 50))
        .join(';')

      await this.client.crm.contacts.basicApi.update(contactId, {
        properties: {
          hs_analytics_label: tagString,
        },
      })
    } catch (error) {
      console.warn('Error adding tags:', error)
      throw error
    }
  }
}
