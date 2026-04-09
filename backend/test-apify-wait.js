import https from 'https';

// Your Apify credentials (from .env)
const APIFY_USER_ID = process.env.APIFY_USER_ID;
const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;
const APIFY_ACTOR_ID = process.env.APIFY_ACTOR_ID;

if (!APIFY_API_TOKEN) {
  console.error('❌ APIFY_API_TOKEN not set in environment variables');
  process.exit(1);
}

console.log('🧪 Testing Apify with Async Run + Wait + Fetch');
console.log('==============================================\n');

const encodedActorId = encodeURIComponent(APIFY_ACTOR_ID);

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = `https://api.apify.com/v2${path}`;
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (body) {
      const payload = typeof body === 'string' ? body : JSON.stringify(body);
      options.headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = https.request(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (err) {
          resolve({ status: res.statusCode, data: data, error: true });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      const payload = typeof body === 'string' ? body : JSON.stringify(body);
      req.write(payload);
    }
    req.end();
  });
}

async function runTest() {
  try {
    // Step 1: Start actor run
    console.log('📍 Step 1: Starting actor run...');
    const runInput = {
      usernames: ['nasa'],
      resultsType: 'posts',
      resultsLimit: 12,
      searchType: 'user'
    };

    const runResult = await makeRequest(
      'POST',
      `/acts/${encodedActorId}/runs?token=${APIFY_API_TOKEN}`,
      runInput
    );

    console.log(`Status: ${runResult.status}`);

    if (runResult.status !== 201) {
      console.log('⚠️ Unexpected status code');
      console.log('Response:', runResult.data);
      return;
    }

    const runId = runResult.data?.data?.id;
    if (!runId) {
      console.log('❌ No run ID in response');
      console.log('Response:', JSON.stringify(runResult.data, null, 2));
      return;
    }

    console.log(`✅ Run started: ${runId}\n`);

    // Step 2: Poll for completion
    console.log('📍 Step 2: Waiting for run to complete...');
    let runStatus = 'RUNNING';
    let attempts = 0;
    const maxAttempts = 60; // 60 attempts with 1 second delay = 60 seconds max

    while (runStatus === 'RUNNING' && attempts < maxAttempts) {
      attempts++;
      
      const statusResult = await makeRequest(
        'GET',
        `/actor-runs/${runId}?token=${APIFY_API_TOKEN}`
      );

      runStatus = statusResult.data?.data?.status;
      console.log(`  Attempt ${attempts}: Status = ${runStatus}`);

      if (runStatus !== 'RUNNING') {
        break;
      }

      // Wait 1 second before next check
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`Final Status: ${runStatus}\n`);

    // Step 3: Fetch dataset
    console.log('📍 Step 3: Fetching dataset...');
    const datasetResult = await makeRequest(
      'GET',
      `/actor-runs/${runId}/dataset/items?token=${APIFY_API_TOKEN}&clean=true`
    );

    console.log(`Status: ${datasetResult.status}`);

    if (Array.isArray(datasetResult.data) && datasetResult.data.length > 0) {
      console.log(`✅ Got ${datasetResult.data.length} items!\n`);

      const first = datasetResult.data[0];
      if (first.error) {
        console.log(`⚠️ First item is an error: ${first.errorDescription}`);
      } else {
        console.log('First item preview:');
        console.log({
          id: first.id || 'N/A',
          caption: (first.caption || 'N/A').substring(0, 60),
          type: first.type || 'N/A',
          likes: first.likesCount || 'N/A',
          owner: first.ownerUsername || 'N/A'
        });

        console.log('\nAll available fields in first item:');
        console.log(Object.keys(first).sort().join(', '));
      }
    } else {
      console.log('⚠️ Empty dataset or invalid response');
      console.log('Response:', datasetResult.data);
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

runTest();
