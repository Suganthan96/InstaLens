import { BigQuery } from '@google-cloud/bigquery'

interface BigQueryConfig {
  projectId: string
  datasetId: string
  tableId?: string
}

export class BigQueryIntegration {
  private bigquery: BigQuery

  constructor() {
    this.bigquery = new BigQuery({
      projectId: process.env.GOOGLE_CLOUD_PROJECT,
      credentials: JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS || '{}'),
    })
  }

  async push(data: any, config: BigQueryConfig) {
    const {
      projectId,
      datasetId,
      tableId = 'instagram_profiles_analysis',
    } = config

    try {
      const dataset = this.bigquery.dataset(datasetId)
      const table = dataset.table(tableId)

      // Ensure table exists
      const [exists] = await table.exists()
      if (!exists) {
        await this.createTable(dataset, tableId)
      }

      // Prepare row data
      const rowData = this.formatDataForBigQuery(data)

      // Insert data
      await table.insert(rowData, {
        skipInvalidRows: false,
        ignoreUnknownValues: true,
      })

      return {
        projectId,
        datasetId,
        tableId,
        rowsInserted: 1,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      console.error('BigQuery integration failed:', error)
      throw error
    }
  }

  private async createTable(dataset: any, tableId: string) {
    const schema = [
      { name: 'timestamp', type: 'TIMESTAMP', mode: 'NULLABLE' },
      { name: 'username', type: 'STRING', mode: 'NULLABLE' },
      { name: 'full_name', type: 'STRING', mode: 'NULLABLE' },
      { name: 'followers', type: 'INTEGER', mode: 'NULLABLE' },
      { name: 'company_name', type: 'STRING', mode: 'NULLABLE' },
      { name: 'industry', type: 'STRING', mode: 'NULLABLE' },
      { name: 'website', type: 'STRING', mode: 'NULLABLE' },
      { name: 'email', type: 'STRING', mode: 'NULLABLE' },
      { name: 'phone', type: 'STRING', mode: 'NULLABLE' },
      { name: 'business_type', type: 'STRING', mode: 'NULLABLE' },
      { name: 'primary_category', type: 'STRING', mode: 'NULLABLE' },
      { name: 'services', type: 'STRING', mode: 'REPEATED' },
      { name: 'content_themes', type: 'STRING', mode: 'REPEATED' },
      { name: 'target_audience', type: 'STRING', mode: 'REPEATED' },
      { name: 'tags', type: 'STRING', mode: 'REPEATED' },
      { name: 'lead_score', type: 'FLOAT64', mode: 'NULLABLE' },
      { name: 'priority', type: 'STRING', mode: 'NULLABLE' },
      {
        name: 'full_analysis',
        type: 'JSON',
        mode: 'NULLABLE',
      },
    ]

    await dataset.createTable(tableId, {
      schema: schema,
      description: 'Instagram business profile analysis results',
      location: 'US',
    })

    console.log(`Table ${tableId} created successfully`)
  }

  private formatDataForBigQuery(data: any): any {
    const lead = data.lead || {}
    const enrichment = data.enrichmentData || {}
    const segmentation = data.segmentation || {}
    const marketing = data.marketingIntel || {}

    return {
      timestamp: new Date().toISOString(),
      username: lead.socialProfiles?.instagram?.handle || '',
      full_name: lead.companyName || '',
      followers: lead.socialProfiles?.instagram?.followers || 0,
      company_name: lead.companyName || '',
      industry: lead.industry || '',
      website: lead.website || '',
      email: lead.email || '',
      phone: lead.phone || '',
      business_type: enrichment.businessType || '',
      primary_category: enrichment.primaryCategory || '',
      services: enrichment.services || [],
      content_themes: marketing.contentThemes || [],
      target_audience: segmentation.targetAudience || [],
      tags: segmentation.tags || [],
      lead_score: segmentation.leadScore || 0,
      priority: segmentation.priority || 'medium',
      full_analysis: JSON.stringify(data),
    }
  }
}
