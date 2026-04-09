#!/usr/bin/env node

const token = 'qiwCFWcpX1KMLRtoOHD98xDRXfkc3s1TWBdc'
const url = `https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items?token=${token}`

fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ usernames: ['instagram'], resultsType: 'posts', resultsLimit: 3 })
})
  .then(r => r.json())
  .then(d => console.log(JSON.stringify(d, null, 2)))
  .catch(e => console.error(e.message))
