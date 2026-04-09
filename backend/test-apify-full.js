import https from 'https';

// Your Apify credentials (from .env)
const APIFY_USER_ID = process.env.APIFY_USER_ID;
const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;
const APIFY_ACTOR_ID = process.env.APIFY_ACTOR_ID;

if (!APIFY_API_TOKEN) {
  console.error('❌ APIFY_API_TOKEN not set in environment variables');
  process.exit(1);
}

// Test with comprehensive input based on common Apify patterns
const testInput = {
  usernames: ['peppa_foodie'],
  resultsType: 'posts',
  resultsLimit: 12,
  searchType: 'user',
  proxy: {
    useApifyProxy: true
  }
};

console.log('🧪 Testing Apify with Full Input Parameters');
console.log('===========================================');
console.log('Input:', JSON.stringify(testInput, null, 2));
console.log('');

const encodedActorId = encodeURIComponent(APIFY_ACTOR_ID);
const url = `https://api.apify.com/v2/acts/${encodedActorId}/run-sync-get-dataset-items?token=${APIFY_API_TOKEN}&timeout=600`;

const payload = JSON.stringify(testInput);

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': payload.length
  }
};

console.log(`📡 Request URL: ${url}`);
console.log('');

const req = https.request(url, options, (res) => {
  let data = '';

  console.log(`Response Status: ${res.statusCode}`);
  console.log('');

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);

      if (Array.isArray(parsed)) {
        if (parsed[0]?.error) {
          console.log(`❌ Apify Error: ${parsed[0].errorDescription || parsed[0].error}`);
          console.log('\nFull response:', JSON.stringify(parsed, null, 2));
        } else if (parsed.length > 0) {
          console.log(`✅ SUCCESS! Got ${parsed.length} items`);
          console.log('\nFirst item (preview):');
          const first = parsed[0];
          console.log({
            id: first.id || 'N/A',
            caption: (first.caption || 'N/A').substring(0, 50),
            likes: first.likesCount || 'N/A',
            comments: first.commentsCount || 'N/A',
            type: first.type || 'N/A',
            owner: first.ownerUsername || 'N/A'
          });
          
          // Show all available fields in first item
          console.log('\nAvailable fields:', Object.keys(first).sort());
        } else {
          console.log('⚠️ Empty array returned');
        }
      } else {
        console.log('Got object response:');
        console.log(JSON.stringify(parsed, null, 2));
      }
    } catch (err) {
      console.log('❌ Parse error:');
      console.log(data);
    }
  });
});

req.on('error', (err) => {
  console.error('❌ Request error:', err.message);
});

req.write(payload);
req.end();
