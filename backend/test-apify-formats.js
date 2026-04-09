import https from 'https';

// Your Apify credentials (from .env)
const APIFY_USER_ID = process.env.APIFY_USER_ID;
const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;
const APIFY_ACTOR_ID = process.env.APIFY_ACTOR_ID;

if (!APIFY_API_TOKEN) {
  console.error('❌ APIFY_API_TOKEN not set in environment variables');
  process.exit(1);
}

// Test different input formats
const testCases = [
  {
    name: 'Format 1: username (string)',
    input: { username: 'peppa_foodie' }
  },
  {
    name: 'Format 2: Instagram URL',
    input: { url: 'https://www.instagram.com/peppa_foodie/' }
  },
  {
    name: 'Format 3: urls array',
    input: { urls: ['https://www.instagram.com/peppa_foodie/'] }
  },
  {
    name: 'Format 4: handle',
    input: { handle: 'peppa_foodie' }
  }
];

console.log('🧪 Testing Different Input Formats for Apify Instagram Scraper');
console.log('==============================================================\n');

const encodedActorId = encodeURIComponent(APIFY_ACTOR_ID);

let testIndex = 0;

function runTest(testCase) {
  testIndex++;
  
  console.log(`\n📍 Test ${testIndex}: ${testCase.name}`);
  console.log(`Input: ${JSON.stringify(testCase.input)}`);
  console.log('');

  const payload = JSON.stringify(testCase.input);
  const url = `https://api.apify.com/v2/acts/${encodedActorId}/run-sync-get-dataset-items?token=${APIFY_API_TOKEN}&timeout=300`;

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': payload.length
    }
  };

  const req = https.request(url, options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const parsed = JSON.parse(data);

        if (Array.isArray(parsed)) {
          if (parsed[0]?.error) {
            console.log(`❌ Error: ${parsed[0].errorDescription || parsed[0].error}`);
          } else if (parsed.length > 0) {
            console.log(`✅ SUCCESS! Got ${parsed.length} items`);
            console.log('First item keys:', Object.keys(parsed[0]));
          } else {
            console.log('⚠️ Empty array returned');
          }
        } else {
          console.log('✅ Got object response');
          console.log('Keys:', Object.keys(parsed));
        }

        // Run next test after a small delay
        if (testIndex < testCases.length) {
          setTimeout(() => runTest(testCases[testIndex]), 1000);
        } else {
          console.log('\n✅ All tests completed!');
          process.exit(0);
        }
      } catch (err) {
        console.log('❌ Parse error:', data);
        if (testIndex < testCases.length) {
          setTimeout(() => runTest(testCases[testIndex]), 1000);
        }
      }
    });
  });

  req.on('error', (err) => {
    console.error('❌ Request error:', err.message);
  });

  req.write(payload);
  req.end();
}

// Start with first test
runTest(testCases[0]);
