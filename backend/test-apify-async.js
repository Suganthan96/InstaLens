import https from 'https';

// Your Apify credentials (from .env)
const APIFY_USER_ID = process.env.APIFY_USER_ID;
const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;
const APIFY_ACTOR_ID = process.env.APIFY_ACTOR_ID;

if (!APIFY_API_TOKEN) {
  console.error('❌ APIFY_API_TOKEN not set in environment variables');
  process.exit(1);
}

// Test username
const testUsername = 'peppa_foodie';

console.log('🧪 Testing Apify Instagram Scraper - ASYNC Approach');
console.log('=====================================================');
console.log(`User ID: ${APIFY_USER_ID}`);
console.log(`Actor ID: ${APIFY_ACTOR_ID}`);
console.log(`Testing username: @${testUsername}`);
console.log('=====================================================\n');

// Encode the actor ID properly
const encodedActorId = encodeURIComponent(APIFY_ACTOR_ID);

// Step 1: Start the actor run asynchronously
console.log('📍 STEP 1: Starting actor run asynchronously...\n');

const runPayload = JSON.stringify({
  username: testUsername,
  resultsLimit: 12
});

const runUrl = `https://api.apify.com/v2/acts/${encodedActorId}/runs?token=${APIFY_API_TOKEN}`;

const runOptions = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': runPayload.length
  }
};

const runReq = https.request(runUrl, runOptions, (runRes) => {
  let runData = '';

  runRes.on('data', (chunk) => {
    runData += chunk;
  });

  runRes.on('end', () => {
    try {
      const runResult = JSON.parse(runData);
      
      if (runRes.statusCode !== 201) {
        console.log('❌ Failed to start run:', runData);
        return;
      }

      console.log(`✅ Actor run started!`);
      console.log(`Run ID: ${runResult.data?.id}`);
      console.log(`Status: ${runResult.data?.status}`);
      console.log('');

      if (!runResult.data?.id) {
        console.log('❌ No run ID returned');
        return;
      }

      // Step 2: Get the results from the dataset
      console.log('📍 STEP 2: Fetching results from dataset...\n');

      const datasetUrl = `https://api.apify.com/v2/actor-runs/${runResult.data.id}/dataset/items?token=${APIFY_API_TOKEN}&clean=true`;

      https.get(datasetUrl, (dataRes) => {
        let dataContent = '';

        dataRes.on('data', (chunk) => {
          dataContent += chunk;
        });

        dataRes.on('end', () => {
          try {
            const items = JSON.parse(dataContent);

            if (Array.isArray(items) && items.length > 0) {
              console.log(`✅ Got ${items.length} items from dataset!`);
              console.log('\nFirst item:');
              console.log(JSON.stringify(items[0], null, 2));
            } else {
              console.log('⚠️ Dataset is empty');
              console.log('Full response:', dataContent);
            }
          } catch (err) {
            console.log('❌ Failed to parse dataset:', dataContent);
          }
        });
      });

    } catch (err) {
      console.log('❌ Failed to parse run response:', runData);
    }
  });
});

runReq.on('error', (err) => {
  console.error('❌ Request error:', err.message);
});

runReq.write(runPayload);
runReq.end();
