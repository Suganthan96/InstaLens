# Cloud Integration Setup Guide

This document provides detailed instructions for setting up each cloud integration for the Instagram extractor.

---

## Overview

The system supports 5 cloud integrations:

1. **Google Sheets** - Export analysis results to Google Sheets
2. **BigQuery** - Store analysis data in BigQuery for analytics
3. **HubSpot** - Sync leads to HubSpot CRM
4. **Mailchimp** - Add contacts to Mailchimp audiences
5. **Salesforce** - Create accounts and contacts in Salesforce

---

## 1. Google Sheets Integration

### Setup Steps

1. **Create a Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project
   - Enable the Google Sheets API

2. **Create a Service Account**
   - In Google Cloud Console, go to "Service Accounts"
   - Create a new service account
   - Download the JSON key file (this is your `GOOGLE_CLOUD_CREDENTIALS`)

3. **Create a Spreadsheet**
   - Create a new Google Sheet
   - Copy the spreadsheet ID from the URL (format: `/spreadsheets/d/{SPREADSHEET_ID}/edit`)
   - Share the sheet with the service account email

4. **Set Environment Variables**
   ```bash
   GOOGLE_CLOUD_PROJECT=your-project-id
   GOOGLE_CLOUD_CREDENTIALS='{"type":"service_account",...}'
   DEFAULT_SPREADSHEET_ID=your-spreadsheet-id
   ```

### Configuration

```typescript
const credentials = {
  google_sheets: {
    spreadsheetId: 'your-spreadsheet-id',
    sheetName: 'Instagram Leads' // Optional, defaults to 'Instagram Leads'
  }
}
```

### What Gets Exported

- Extracted Date
- Username
- Company Name
- Industry
- Website
- Email
- Phone
- Instagram Handle
- Followers
- Business Type
- Services
- Target Market
- Lead Score

---

## 2. BigQuery Integration

### Setup Steps

1. **Enable BigQuery API**
   - In Google Cloud Console, enable the BigQuery API
   - Use the same Google Cloud project as Sheets (if desired)

2. **Create Dataset**
   - In BigQuery, create a new dataset (e.g., `instagram_analysis`)
   - Note the dataset ID

3. **Grant Service Account Permissions**
   - Go to IAM & Admin
   - Give the service account "BigQuery Editor" role

4. **Set Environment Variables**
   ```bash
   GOOGLE_CLOUD_PROJECT=your-project-id
   GOOGLE_CLOUD_CREDENTIALS='{"type":"service_account",...}'
   ```

### Configuration

```typescript
const credentials = {
  bigquery: {
    projectId: 'your-project-id',
    datasetId: 'instagram_analysis',
    tableId: 'instagram_profiles_analysis' // Optional, defaults shown
  }
}
```

### Schema

Automatically creates a table with:
- timestamp
- username
- full_name
- followers
- company_name
- industry
- website
- email
- phone
- business_type
- primary_category
- services (array)
- content_themes (array)
- target_audience (array)
- tags (array)
- lead_score
- priority
- full_analysis (JSON)

---

## 3. HubSpot Integration

### Setup Steps

1. **Create HubSpot Account**
   - Sign up at [hubspot.com](https://hubspot.com)
   - Go to Settings → API & Integrations → Private Apps

2. **Create Private App**
   - Click "Create app"
   - Name: "Instagram Extractor"
   - In Scopes tab, select: `crm.objects.contacts.read`, `crm.objects.contacts.write`
   - Create and copy the access token

3. **Create a Contact List (Optional)**
   - In HubSpot, create a new list for Instagram leads
   - Copy the list ID from the URL or list settings

4. **Set Environment Variables**
   ```bash
   HUBSPOT_ACCESS_TOKEN=pat-na1-your-token-here
   ```

### Configuration

```typescript
const credentials = {
  hubspot: {
    listId: 'optional-list-id' // Optional, if you want to add to a specific list
  }
}
```

### Custom Properties

The integration creates/uses these custom properties:
- `instagram_handle` - Profile username
- `instagram_followers` - Follower count
- `instagram_profile_url` - Profile URL
- `business_type` - Type of business
- `target_market` - Target market description
- `brand_voice` - Brand voice/tone
- `primary_category` - Business category
- `lead_score` - AI-calculated lead score
- `lead_priority` - Priority (high/medium/low)
- `lead_lifecycle` - Lifecycle stage

**Note:** Custom properties must be created in HubSpot first. Go to Settings → Data Management → Objects → Contacts → Properties to add them.

---

## 4. Mailchimp Integration

### Setup Steps

1. **Get Mailchimp API Key**
   - Log into Mailchimp
   - Go to Account → API keys
   - Create a new API key and copy it

2. **Get Audience List ID**
   - Go to Audience
   - Select or create an audience
   - Go to Settings → Audience name and defaults
   - Copy the Audience ID

3. **Create Custom Fields (Optional)**
   - In Mailchimp, go to Audience → All contacts → Manage audience fields
   - Create custom fields for:
     - `INSTA_HANDLE` (Text)
     - `FOLLOW_COUNT` (Text)
     - `BIZ_TYPE` (Text)
     - `LEAD_SCORE` (Number)

4. **Set Environment Variables**
   ```bash
   MAILCHIMP_API_KEY=your-api-key-us1
   ```

### Configuration

```typescript
const credentials = {
  mailchimp: {
    listId: 'your-audience-id',
    tags: ['instagram', 'extracted'] // Optional tags to add
  }
}
```

### What Gets Synced

- Email
- Full Name
- Company
- Phone
- Tags (from segmentation)
- Custom fields (if created):
  - Instagram Handle
  - Follower Count
  - Business Type
  - Lead Score

---

## 5. Salesforce Integration

### Setup Steps

1. **Create Salesforce Account**
   - Sign up for a Salesforce developer account at [developer.salesforce.com](https://developer.salesforce.com)

2. **Get Connected App Credentials**
   - Go to Setup → Apps → App Manager
   - Create a new connected app
   - Set OAuth Scopes: `api`, `refresh_token`
   - Copy Client ID and Client Secret

3. **Get Your Instance URL**
   - Your instance URL is shown in the top right (format: `https://your-instance.salesforce.com`)

4. **Set Environment Variables**
   ```bash
   SALESFORCE_INSTANCE_URL=https://your-instance.salesforce.com
   SALESFORCE_CLIENT_ID=your-client-id
   SALESFORCE_CLIENT_SECRET=your-client-secret
   SALESFORCE_USERNAME=your-email@company.com
   SALESFORCE_PASSWORD=your-password
   # Optional if you have an existing token
   SALESFORCE_ACCESS_TOKEN=existing-token
   ```

### Configuration

```typescript
const credentials = {
  salesforce: {
    instanceUrl: 'https://your-instance.salesforce.com'
  }
}
```

### What Gets Created

- **Account**: Company record with website, industry, phone
- **Contact**: Contact linked to the account
- **Lead**: Lead record with enriched data

---

## Usage Example

### Single Integration

```typescript
import { IntegrationManager } from '@/lib/integrations'

const manager = new IntegrationManager()

// Push to a single integration
const result = await manager.pushToSingle(
  analysisData,
  'google_sheets',
  {
    spreadsheetId: 'your-spreadsheet-id',
    sheetName: 'Leads'
  }
)

console.log(result) // { target: 'google_sheets', status: 'fulfilled', data: {...}, error: null }
```

### Multiple Integrations

```typescript
// Push to multiple integrations simultaneously
const results = await manager.pushToIntegrations(
  analysisData,
  ['google_sheets', 'hubspot', 'bigquery'],
  {
    google_sheets: {
      spreadsheetId: 'your-spreadsheet-id',
      sheetName: 'Leads'
    },
    hubspot: {
      listId: 'optional-list-id'
    },
    bigquery: {
      projectId: 'your-project',
      datasetId: 'instagram_analysis'
    }
  }
)

// Results is an array of IntegrationResult
results.forEach(result => {
  console.log(`${result.target}: ${result.status}`)
  if (result.error) {
    console.error(`Error: ${result.error}`)
  }
})
```

### Check Configured Integrations

```typescript
const manager = new IntegrationManager()

// Get all available integrations
const available = manager.getAvailableIntegrations()
// ['google_sheets', 'bigquery', 'hubspot', 'mailchimp', 'salesforce']

// Get only configured integrations (those with credentials set)
const configured = manager.getConfiguredIntegrations()
// ['google_sheets', 'hubspot'] (if only these have env vars set)

// Validate credentials before pushing
const isValid = manager.validateCredentials('hubspot', { listId: '123' })
```

---

## Troubleshooting

### Google Sheets / BigQuery

**Error: "Invalid Credentials"**
- Ensure `GOOGLE_CLOUD_CREDENTIALS` is a valid JSON string
- Check that the service account has the correct permissions
- Verify the sheet/dataset exists and is accessible

### HubSpot

**Error: "Unauthorized"**
- Verify the access token is correct and not expired
- Check that the app has the required scopes
- Ensure the contact's email is unique in the workspace

**Custom properties not working**
- Custom properties must be created in HubSpot first
- Use the exact internal property names (snake_case)

### Mailchimp

**Error: "Invalid audience"**
- Verify the `listId` (Audience ID) is correct
- Ensure the audience exists and you have permission
- Check that the API key matches the audience region (us1, us2, etc.)

**Emails not being added**
- Ensure emails are in valid format and unique
- Check subscriber status (pending, subscribed, etc.)
- Verify the API key has the correct permissions

### Salesforce

**Error: "Authentication failed"**
- Verify username and password are correct
- Check that the connected app is enabled
- Ensure the user account is active in Salesforce
- For security tokens, append token to password: `password+token`

**Custom fields not syncing**
- Field names must match Salesforce internal names exactly
- Use API names, not display names
- Ensure the user has permission to edit those fields

---

## Cost Considerations

| Integration | Free Tier | Cost |
|-------------|-----------|------|
| Google Sheets | Unlimited | Free |
| BigQuery | 1TB/month free query | $6.25 per TB after |
| HubSpot | 500 contacts free | Free plan available |
| Mailchimp | 500 contacts free | Paid plans start at $13/month |
| Salesforce | $165/month minimum | Professional/Enterprise editions |

---

## Best Practices

1. **Start with Google Sheets** - Easiest to set up and no cost
2. **Add BigQuery later** - For analytics and historical data
3. **Use HubSpot for CRM** - Better than Sheets for larger teams
4. **Mailchimp for marketing** - Great for email automation
5. **Salesforce for enterprise** - Only if you already use it

4. **Test with sample data** - Always validate with test profiles first
5. **Monitor integration results** - Check the returned status and errors
6. **Update custom properties** - Keep HubSpot/Salesforce in sync

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review API documentation for each service
3. Check environment variables are set correctly
4. Review logs in the API response for detailed errors
