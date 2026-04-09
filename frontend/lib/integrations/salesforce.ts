interface SalesforceConfig {
  instanceUrl: string
  clientId?: string
  clientSecret?: string
}

interface SalesforceAccount {
  Name: string
  Website?: string
  Phone?: string
  BillingCity?: string
  BillingCountry?: string
  Industry?: string
  Description?: string
}

interface SalesforceContact {
  LastName: string
  FirstName?: string
  Email?: string
  Phone?: string
  Title?: string
  AccountId?: string
}

export class SalesforceIntegration {
  private accessToken: string = ''
  private instanceUrl: string

  constructor() {
    this.instanceUrl = process.env.SALESFORCE_INSTANCE_URL || ''
    this.accessToken = process.env.SALESFORCE_ACCESS_TOKEN || ''
  }

  async push(data: any, config: SalesforceConfig) {
    const lead = data.lead || {}
    const enrichment = data.enrichmentData || {}
    const segmentation = data.segmentation || {}

    try {
      // Ensure we have a valid access token
      if (!this.accessToken) {
        await this.authenticate()
      }

      // Step 1: Create or update Account
      const accountId = await this.createOrUpdateAccount({
        Name: lead.companyName || 'Unidentified',
        Website: lead.website,
        Phone: lead.phone,
        Industry: lead.industry,
        Description: enrichment.businessType,
      })

      // Step 2: Create Contact
      const contactId = await this.createContact(
        {
          LastName: lead.companyName?.split(' ').pop() || 'Contact',
          FirstName: lead.companyName?.split(' ')[0],
          Email: lead.email,
          Phone: lead.phone,
          Title: enrichment.businessType,
          AccountId: accountId,
        },
        accountId
      )

      // Step 3: Create custom Lead record with enrichment data
      const leadId = await this.createLead({
        Company: lead.companyName || 'Unidentified',
        LastName: lead.companyName?.split(' ').pop() || 'Lead',
        FirstName: lead.companyName?.split(' ')[0],
        Email: lead.email,
        Phone: lead.phone,
        Website: lead.website,
        Status: 'New',
        Rating: this.mapLeadScoreTo5Star(segmentation.leadScore),
        Description: JSON.stringify({
          instagram_handle: lead.socialProfiles?.instagram?.handle,
          followers: lead.socialProfiles?.instagram?.followers,
          business_type: enrichment.businessType,
          target_market: enrichment.targetMarket,
          services: enrichment.services,
        }),
      })

      return {
        accountId,
        contactId,
        leadId,
        status: 'success',
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      console.error('Salesforce integration failed:', error)
      throw error
    }
  }

  private async authenticate() {
    try {
      const params = new URLSearchParams()
      params.append('grant_type', 'password')
      params.append('client_id', process.env.SALESFORCE_CLIENT_ID || '')
      params.append('client_secret', process.env.SALESFORCE_CLIENT_SECRET || '')
      params.append('username', process.env.SALESFORCE_USERNAME || '')
      params.append('password', process.env.SALESFORCE_PASSWORD || '')

      const response = await fetch(
        `${this.instanceUrl}/services/oauth2/token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        }
      )

      if (!response.ok) {
        throw new Error(
          `Authentication failed: ${response.status} ${response.statusText}`
        )
      }

      const data = (await response.json()) as any
      this.accessToken = data.access_token
      const newInstanceUrl = data.instance_url
      if (newInstanceUrl) {
        this.instanceUrl = newInstanceUrl
      }
    } catch (error) {
      console.error('Salesforce authentication failed:', error)
      throw new Error('Failed to authenticate with Salesforce')
    }
  }

  private async createOrUpdateAccount(account: SalesforceAccount) {
    try {
      // First, try to find existing account by name
      const query = `SELECT Id FROM Account WHERE Name = '${account.Name?.replace(/'/g, "''")}'`
      const queryResponse = await fetch(
        `${this.instanceUrl}/services/data/v57.0/query?q=${encodeURIComponent(query)}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      )

      if (!queryResponse.ok) {
        throw new Error(`Query failed: ${queryResponse.status}`)
      }

      const queryData = (await queryResponse.json()) as any

      if (queryData.records.length > 0) {
        // Update existing account
        const accountId = queryData.records[0].Id
        const updateResponse = await fetch(
          `${this.instanceUrl}/services/data/v57.0/sobjects/Account/${accountId}`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(account),
          }
        )

        if (!updateResponse.ok) {
          throw new Error(`Update failed: ${updateResponse.status}`)
        }

        return accountId
      }

      // Create new account
      const createResponse = await fetch(
        `${this.instanceUrl}/services/data/v57.0/sobjects/Account`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(account),
        }
      )

      if (!createResponse.ok) {
        throw new Error(`Create failed: ${createResponse.status}`)
      }

      const createData = (await createResponse.json()) as any
      return createData.id
    } catch (error) {
      console.error('Error creating/updating account:', error)
      throw error
    }
  }

  private async createContact(contact: SalesforceContact, accountId: string) {
    try {
      const contactData = {
        ...contact,
        AccountId: accountId,
      }

      const response = await fetch(
        `${this.instanceUrl}/services/data/v57.0/sobjects/Contact`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(contactData),
        }
      )

      if (!response.ok) {
        throw new Error(`Contact creation failed: ${response.status}`)
      }

      const data = (await response.json()) as any
      return data.id
    } catch (error) {
      console.error('Error creating contact:', error)
      // Return a placeholder if contact creation fails
      return 'contact_creation_failed'
    }
  }

  private async createLead(leadData: Record<string, any>) {
    try {
      const response = await fetch(
        `${this.instanceUrl}/services/data/v57.0/sobjects/Lead`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(leadData),
        }
      )

      if (!response.ok) {
        throw new Error(`Lead creation failed: ${response.status}`)
      }

      const data = (await response.json()) as any
      return data.id
    } catch (error) {
      console.error('Error creating lead:', error)
      throw error
    }
  }

  private mapLeadScoreTo5Star(score: number): string {
    if (score >= 80) return 'Hot'
    if (score >= 60) return 'Warm'
    if (score >= 40) return 'Lukewarm'
    return 'Cold'
  }
}
