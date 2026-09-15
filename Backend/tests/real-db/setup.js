// test-setup.js — loads .env and connects to real MongoDB for integration tests
// Usage: node -r dotenv/config test-setup.js
require('dotenv').config();
const mongoose = require('mongoose');
const Profile = require('../../models/Profile');
const profileService = require('../../services/profileService');

const uri = process.env.mongoURI;
const TEST_DB = 'Cpdashboard_test';

async function setup() {
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverSelectionTimeoutMS: 10000 });
  console.log('Connected to MongoDB');

  // Switch to test database
  const testConn = mongoose.connection.useDb(TEST_DB, { useExisting: true });
  console.log('Using test DB:', TEST_DB);

  // Clear test DB to start fresh
  await testConn.dropDatabase();
  console.log('Test DB cleared');

  return { testConn };
}

async function teardown() {
  try {
    const testConn = mongoose.connection.useDb(TEST_DB, { useExisting: true });
    await testConn.dropDatabase();
    console.log('Test DB cleaned up');
  } catch (e) { /* ignore */ }
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

module.exports = { setup, teardown, Profile, profileService };
