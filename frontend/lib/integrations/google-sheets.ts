import { google } from 'googleapis'

interface GoogleSheetsConfig {
  spreadsheetId: string
  sheetName?: string
}

export class GoogleSheetsIntegration {
  private sheets: any

  constructor() {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS || '{}'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    this.sheets = google.sheets({ version: 'v4', auth })
  }

  async push(data: any, config: GoogleSheetsConfig) {
    const { spreadsheetId, sheetName = 'Instagram Leads' } = config

    try {
      // Ensure sheet exists
      await this.ensureSheetExists(spreadsheetId, sheetName)

      // Prepare row data
      const rowData = this.formatDataForSheets(data)

      // Append to sheet
      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A:Z`,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: {
          values: [rowData],
        },
      })

      return {
        spreadsheetId,
        sheetName,
        rowCount: response.data.updates.updatedRows,
        updatedRange: response.data.updates.updatedRange,
      }
    } catch (error) {
      console.error('Google Sheets integration failed:', error)
      throw error
    }
  }

  private async ensureSheetExists(spreadsheetId: string, sheetName: string) {
    try {
      // Check if sheet exists
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId,
      })

      const sheetExists = response.data.sheets.some(
        (sheet: any) => sheet.properties.title === sheetName
      )

      if (!sheetExists) {
        // Create sheet with headers
        await this.sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          resource: {
            requests: [
              {
                addSheet: {
                  properties: {
                    title: sheetName,
                  },
                },
              },
            ],
          },
        })

        // Add headers
        await this.sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${sheetName}!A1:M1`,
          valueInputOption: 'RAW',
          resource: {
            values: [
              [
                'Extracted Date',
                'Username',
                'Company Name',
                'Industry',
                'Website',
                'Email',
                'Phone',
                'Instagram Handle',
                'Followers',
                'Business Type',
                'Services',
                'Target Market',
                'Lead Score',
              ],
            ],
          },
        })

        console.log(`Created new sheet: ${sheetName}`)
      }
    } catch (error) {
      console.error('Error ensuring sheet exists:', error)
      throw error
    }
  }

  private formatDataForSheets(data: any): any[] {
    const lead = data.lead || {}
    const enrichment = data.enrichmentData || {}
    const segmentation = data.segmentation || {}

    return [
      new Date().toISOString(),
      lead.socialProfiles?.instagram?.handle || '',
      lead.companyName || '',
      lead.industry || '',
      lead.website || '',
      lead.email || '',
      lead.phone || '',
      lead.socialProfiles?.instagram?.handle || '',
      lead.socialProfiles?.instagram?.followers || 0,
      enrichment.businessType || '',
      (enrichment.services || []).join('; '),
      enrichment.targetMarket || '',
      segmentation.leadScore || 0,
    ]
  }
}
