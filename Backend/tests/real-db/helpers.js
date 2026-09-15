// Real-DB test helper — points Profile/profileService at a test database on the same Atlas cluster.
// No production data is touched; only the test DB is used and cleaned up.
require('dotenv').config();
const mongoose = require('mongoose');
const assert = require('assert');

// Derive test DB URI from the production URI by swapping the database name.
// This targets a separate database on the same cluster — no production data is involved.
function getTestURI() {
  const prod = process.env.mongoURI;
  assert(prod && typeof prod === 'string' && prod.length > 10, 'mongoURI must be set in .env');
  // Replace the database name in the URI path with a test database name
  return prod.replace(/\/(\w+)\?/, '/$1_test?').replace(/\/(\w+)$/, '/$1_test');
}

async function connectTestDB() {
  const testURI = getTestURI();
  await mongoose.connect(testURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000,
  });
  // Verify it's a test DB by checking the connection name
  const dbName = mongoose.connection.name;
  assert(dbName.endsWith('_test'), `Expected test DB name ending in _test, got: ${dbName}`);
  return dbName;
}

async function dropTestDB() {
  await mongoose.connection.dropDatabase();
}

async function disconnect() {
  await mongoose.disconnect();
}

// Create a fresh Express app that mounts a router at the given prefix
function createTestApp(router, prefix) {
  const express = require('express');
  const app = express();
  app.use(express.json());
  app.use(prefix, router);
  return app;
}

// Helper: make HTTP request against a test app without external deps
async function httpRequest(app, method, path, body) {
  return new Promise((resolve, reject) => {
    const http = require('http');
    const reqData = body ? JSON.stringify(body) : undefined;
    const url = new URL(path, 'http://localhost:0');
    const options = {
      hostname: 'localhost',
      port: 0, // let OS assign
      path: url.pathname + url.search,
      method,
      headers: {},
    };
    if (reqData) options.headers['Content-Type'] = 'application/json';

    const server = http.createServer(app).listen(0, () => {
      const port = server.address().port;
      options.port = port;
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          server.close();
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, body: data });
          }
        });
      });
      req.on('error', reject);
      if (reqData) req.write(reqData);
      req.end();
    });
  });
}

module.exports = { connectTestDB, dropTestDB, disconnect, createTestApp, httpRequest, getTestURI };
