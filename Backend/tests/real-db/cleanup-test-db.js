// One-off cleanup: remove test documents from Cpdashboard_test (no dropDatabase — Atlas user lacks that privilege)
require('dotenv').config();
const mongoose = require('mongoose');
(async () => {
  await mongoose.connect(process.env.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true, serverSelectionTimeoutMS: 10000 });
  const testConn = mongoose.connection.useDb('Cpdashboard_test', { useExisting: true });
  const collections = await testConn.db.listCollections().toArray();
  for (const c of collections) {
    const r = await testConn.db.collection(c.name).deleteMany({});
    console.log('cleared', c.name, '->', r.deletedCount, 'docs');
  }
  await mongoose.disconnect();
  console.log('TEST_DB_CLEAN');
})().catch(e => { console.error('CLEANUP FAILED:', e.message); process.exit(1); });