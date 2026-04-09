#!/usr/bin/env node

/**
 * Debug script to check Apify API response structure
 */

const API_TOKEN = process.env.APIFY_API_TOKEN
const ACTOR_ID = process.env.APIFY_ACTOR_ID
const username = process.argv[2] || 'instagram'

if (!API_TOKEN || !ACTOR_ID) {
  console.error('❌ APIFY_API_TOKEN and APIFY_ACTOR_ID must be set in environment variables');
  process.exit(1);
}

async function debugApifyResponse() {
  try {
    console.log(`\n🔍 Debugging Apify API Response...\n`)
    console.log(`Using token: ${API_TOKEN.substring(0, 20)}...`)
    console.log(`Actor ID: ${ACTOR_ID}`)
    console.log(`Username: @${username}\n`)

    const apiUrl = `https://api.apify.com/v2/acts/${ACTOR_ID}/run-sync-get-dataset-items?token=${API_TOKEN}&timeout=300`

    console.log(`Request URL: ${apiUrl.replace(API_TOKEN, 'TOKEN')}\n`)

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        usernames: [username],
        resultsType: 'posts',
        resultsLimit: 5
      })
    })

    console.log(`Response Status: ${response.status} ${response.statusText}`)
    console.log(`Content-Type: ${response.headers.get('content-type')}\n`)

    const rawText = await response.text()
    console.log(`Raw Response Body (first 2000 chars):\n`)
    console.log(rawText.substring(0, 2000))

    if (rawText.length > 2000) {
      console.log(`\n... (${rawText.length - 2000} more characters)`)
    }

    console.log(`\n\nTrying to parse as JSON...`)
    try {
      const data = JSON.parse(rawText)
      console.log(`\n✅ Valid JSON! Structure:`)
      console.log(JSON.stringify(data, null, 2).substring(0, 1500))
      
      if (Array.isArray(data)) {
        console.log(`\n📊 Array with ${data.length} items`)
        if (data.length > 0) {
          console.log(`\nFirst item keys: ${Object.keys(data[0]).join(', ')}`)
        }
      } else if (typeof data === 'object') {
        console.log(`\n📊 Object with keys: ${Object.keys(data).join(', ')}`)
      }
    } catch (e) {
      console.error(`❌ Not valid JSON`)
    }
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`)
    process.exit(1)
  }
}

debugApifyResponse()
