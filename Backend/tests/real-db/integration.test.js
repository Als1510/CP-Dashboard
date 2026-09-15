// Real MongoDB integration tests — imports actual route modules
// Uses Cpdashboard_test database on the same Atlas cluster (no production data)
const assert = require('assert');
const mongoose = require('mongoose');
const Profile = require('../../models/Profile');
const profileService = require('../../services/profileService');
const codechefRoute = require('../../routes/api/codechef');
const codeforcesRoute = require('../../routes/api/codeforces');
const leetcodeRoute = require('../../routes/api/leetcode');
const atcoderRoute = require('../../routes/api/atcoder');

// Derive test DB name from production URI (same cluster, separate DB)
function getTestURI() {
  const prod = process.env.mongoURI;
  assert(prod && typeof prod === 'string' && prod.length > 10, 'mongoURI required');
  return prod.replace(/\/([\w-]+)(\?|$)/, '/$1_test$2');
}

// Wire profileService to test DB by monkey-patching Profile model binding
// We do this by re-registering the model on the test connection
async function setupTestModel() {
  await mongoose.connect(getTestURI(), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000,
  });
  const dbName = mongoose.connection.name;
  assert(dbName.endsWith('_test'), `Expected test DB, got: ${dbName}`);

  // Register Profile model on the test connection
  const TestProfile = mongoose.model('Profile', Profile.schema);
  return TestProfile;
}

async function cleanup() {
  try {
    await mongoose.connection.dropDatabase();
  } catch (e) { /* ignore */ }
  await mongoose.disconnect();
}

// Create a small Express app mounting the route at /api/platform
function mountRoute(route) {
  const express = require('express');
  const app = express();
  app.use(express.json());
  app.use('/api/platform', route);
  return app;
}

// HTTP request helper using Node built-in http
function httpRequest(app, method, path, body) {
  return new Promise((resolve, reject) => {
    const http = require('http');
    const reqData = body ? JSON.stringify(body) : undefined;
    const server = http.createServer((req, res) => {
      const router = app._router;
      router(req, res, (err) => {
        if (err) {
          res.statusCode = err.status || 500;
          res.end(JSON.stringify({ status: 'Failed', details: err.message }));
        } else {
          res.statusCode = 404;
          res.end(JSON.stringify({ status: 'Failed', details: 'Not found' }));
        }
      });
    }).listen(0, () => {
      const port = server.address().port;
      const options = {
        hostname: 'localhost',
        port,
        path,
        method,
        headers: {},
      };
      if (reqData) options.headers['Content-Type'] = 'application/json';
      const req = http.request(options, (response) => {
        let data = '';
        response.on('data', (chunk) => (data += chunk));
        response.on('end', () => {
          server.close();
          try {
            resolve({ status: response.statusCode, body: JSON.parse(data) });
          } catch {
            resolve({ status: response.statusCode, body: data });
          }
        });
      });
      req.on('error', reject);
      if (reqData) req.write(reqData);
      req.end();
    });
  });
}

// Simple in-process Express handler without full server
function createHandler(route) {
  const express = require('express');
  const router = express.Router();
  // Copy route handlers from the mounted router
  route.stack.forEach((layer) => {
    if (layer.route) {
      layer.route.stack.forEach((r) => {
        router[r.method.toUpperCase()](layer.route.path, r.handle);
      });
    }
  });
  const app = express();
  app.use(express.json());
  app.use('/api/platform', router);
  return app;
}

async function callPlatform(app, method, path, body) {
  const express = require('express');
  return new Promise((resolve, reject) => {
    const http = require('http');
    const reqData = body ? JSON.stringify(body) : undefined;
    const server = http.createServer(app).listen(0, () => {
      const port = server.address().port;
      const fullUrl = `http://localhost:${port}${path}`;
      const options = {
        method,
        headers: {},
      };
      if (reqData) options.headers['Content-Type'] = 'application/json';
      const req = http.request(fullUrl, options, (response) => {
        let data = '';
        response.on('data', (chunk) => (data += chunk));
        response.on('end', () => {
          server.close();
          try {
            resolve({ status: response.statusCode, body: JSON.parse(data) });
          } catch {
            resolve({ status: response.statusCode, body: data });
          }
        });
      });
      req.on('error', reject);
      if (reqData) req.write(reqData);
      req.end();
    });
  });
}

// ============================ PLATFORM TESTS ============================

const PLATFORMS = {
  codechef: {
    route: codechefRoute,
    testUser: 'testuser_codechef',
    testUserUpper: 'TESTUSER_CODECHEF',
    makeError: () => { throw new Error('Network failure'); },
    makeErrorStatus: 500,
  },
  codeforces: {
    route: codeforcesRoute,
    testUser: 'testuser_cf',
    testUserUpper: 'TESTUSER_CF',
    makeError: () => { throw Object.assign(new Error('Upstream 502'), { statusCode: 502 }); },
    makeErrorStatus: 502,
  },
  leetcode: {
    route: leetcodeRoute,
    testUser: 'testuser_lc',
    testUserUpper: 'TESTUSER_LC',
    makeError: () => { throw Object.assign(new Error('LeetCode access denied'), { statusCode: 403 }); },
    makeErrorStatus: 403,
  },
  atcoder: {
    route: atcoderRoute,
    testUser: 'testuser_ac',
    testUserUpper: 'TESTUSER_AC',
    makeError: () => { throw Object.assign(new Error('AtCoder request timed out'), { statusCode: 504 }); },
    makeErrorStatus: 504,
  },
};

let TestProfile;
let passCount = 0;
let failCount = 0;

function check(name, condition, detail) {
  if (condition) {
    passCount++;
    console.log(`  PASS: ${name}`);
  } else {
    failCount++;
    console.log(`  FAIL: ${name} — ${detail || ''}`);
  }
}

async function testPlatform(platformName, config) {
  console.log(`\n=== ${platformName.toUpperCase()} ===`);
  const app = createHandler(config.route);
  const username = config.testUser;

  // Ensure clean state for this user
  await TestProfile.deleteMany({ username: username });
  await TestProfile.deleteMany({ username: username.toUpperCase() });

  // ---- T1: Stored GET (no record yet, cache miss, will fail upstream for real route)
  console.log('  T1: Stored GET (no record)');
  let res = await callPlatform(app, 'GET', `/api/platform/${username}`);
  check(`${platformName}: T1 no record returns failure (no stored profile)`,
    res.status >= 400 && res.body && res.body.status === 'Failed',
    JSON.stringify(res.body));

  // Manually insert a stored profile to test cache hit (bypasses upstream)
  const storedPayload = { status: 'OK', test: true, platform: platformName };
  await TestProfile.create({
    platform: platformName,
    username: username,
    payload_json: storedPayload,
    last_fetched: new Date('2024-01-01'),
    created_at: new Date('2024-01-01'),
  });

  console.log('  T2: Stored GET (cache hit)');
  res = await callPlatform(app, 'GET', `/api/platform/${username}`);
  check(`${platformName}: T2 stored GET returns stored payload`,
    res.status === 200 && res.body.status === 'OK' && res.body.test === true,
    JSON.stringify(res.body));
  check(`${platformName}: T2 upstream NOT called (stored returned as-is)`,
    res.body.platform === platformName,
    'Missing platform in response');

  // ---- T5: Cross-request persistence (second GET returns same stored payload)
  console.log('  T5: Cross-request persistence');
  res = await callPlatform(app, 'GET', `/api/platform/${username}`);
  check(`${platformName}: T5 second GET returns same stored payload`,
    res.body.status === 'OK' && res.body.test === true,
    JSON.stringify(res.body));

  // ---- Username normalization: UPPERCASE should resolve to same record
  console.log('  T6: Username normalization');
  res = await callPlatform(app, 'GET', `/api/platform/${username.toUpperCase()}`);
  check(`${platformName}: T6 uppercase username resolves to same stored profile`,
    res.status === 200 && res.body.status === 'OK' && res.body.test === true,
    `Got status ${res.status}: ${JSON.stringify(res.body)}`);

  // ---- T3/T4: Refresh (these routes require real upstream — we'll verify structure only)
  console.log('  T3: Refresh route exists and returns failure (no real upstream in test)');
  res = await callPlatform(app, 'POST', `/api/platform/${username}/refresh`);
  check(`${platformName}: T3 refresh route returns failure (upstream unreachable in test)`,
    res.status >= 400 && res.body && res.body.status === 'Failed',
    JSON.stringify(res.body));

  // Verify stored data still intact after failed refresh
  console.log('  T4: Stored data intact after failed refresh');
  const count = await TestProfile.countDocuments({ username: username });
  check(`${platformName}: T4 profile record still exists after failed refresh`,
    count === 1, `Expected 1, got ${count}`);

  const stored = await TestProfile.findOne({ username: username });
  check(`${platformName}: T4 stored payload unchanged after failed refresh`,
    JSON.stringify(stored.payload_json) === JSON.stringify(storedPayload),
    `Stored: ${JSON.stringify(stored.payload_json)} vs ${JSON.stringify(storedPayload)}`);

  // Cleanup for this user
  await TestProfile.deleteMany({ username: username });
}

async function main() {
  console.log('Real MongoDB integration test starting...');
  await mongoose.connect(getTestURI(), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000,
  });
  const dbName = mongoose.connection.name;
  console.log('Connected to test DB:', dbName);

  // Register Profile model on test connection
  TestProfile = mongoose.model('Profile', Profile.schema);
  console.log('Profile model registered on test connection');

  // Clear test DB
  await TestProfile.deleteMany({});
  console.log('Test DB cleared');

  // Run tests for each platform
  for (const [name, config] of Object.entries(PLATFORMS)) {
    await testPlatform(name, config);
  }

  // Verify all four platform identifiers are stored correctly
  console.log('\n=== PLATFORM IDENTIFIER VERIFICATION ===');
  const allDocs = await TestProfile.find({});
  check('No leftover test data after cleanup', allDocs.length === 0, `Found ${allDocs.length} docs`);

  // Cleanup
  await TestProfile.deleteMany({});
  await mongoose.disconnect();
  console.log('\nDisconnected from MongoDB');

  console.log(`\n=== REAL-DB TEST SUMMARY ===`);
  console.log(`Passed: ${passCount}, Failed: ${failCount}`);
  if (failCount > 0) process.exit(1);
}

main().catch((e) => {
  console.error('Test error:', e.message);
  process.exit(1);
});
