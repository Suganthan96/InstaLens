import https from 'https';

// Your Apify credentials (from .env)
const APIFY_USER_ID = process.env.APIFY_USER_ID;
const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;
const APIFY_ACTOR_ID = process.env.APIFY_ACTOR_ID;

if (!APIFY_API_TOKEN) {
  console.error('❌ APIFY_API_TOKEN not set in environment variables');
  process.exit(1);
}

// Test username - try a very public account
const testUsername = 'peppa_foodie';

console.log('🧪 Testing Apify Instagram Scraper API');
console.log('=====================================');
console.log(`User ID: ${APIFY_USER_ID}`);
console.log(`Actor ID: ${APIFY_ACTOR_ID}`);
console.log(`Testing username: @${testUsername}`);
console.log('=====================================\n');

// Make the API request
const encodedActorId = encodeURIComponent(APIFY_ACTOR_ID);
const url = `https://api.apify.com/v2/acts/${encodedActorId}/run-sync-get-dataset-items?token=${APIFY_API_TOKEN}&timeout=300`;

const payload = JSON.stringify({
  username: testUsername,
  resultsLimit: 12
});

console.log('📡 Making request to:', url);
console.log('📦 Payload:', payload);
console.log('');

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': payload.length
  }
};

const req = https.request(url, options, (res) => {
  let data = '';

  console.log(`📊 Response Status: ${res.statusCode}`);
  console.log('📊 Response Headers:', res.headers);
  console.log('');

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('✅ SUCCESS! Received data from Apify:');
      console.log(JSON.stringify(parsed, null, 2));
      
      // Check if it's an error response
      if (parsed.error || parsed.errorCode) {
        console.log('\n❌ Apify returned an error:');
        console.log('Error Code:', parsed.errorCode);
        console.log('Error Message:', parsed.message);
      } else if (Array.isArray(parsed) && parsed.length > 0) {
        console.log(`\n✅ Got ${parsed.length} posts!`);
        console.log('First post preview:');
        const first = parsed[0];
        console.log({
          id: first.id,
          caption: first.caption?.substring(0, 100),
          type: first.type,
          likes: first.likesCount,
          comments: first.commentsCount,
          owner: first.ownerUsername
        });
      } else {
        console.log('\n⚠️ Empty response - no posts found');
      }
    } catch (error) {
      console.log('❌ Failed to parse response:');
      console.log(data);
      console.error(error.message);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
});

req.write(payload);
req.end();
