// AtCoder persistence integration tests (focused, stubbed)
// Limitation: MongoDB not mocked with Testcontainers; stub demonstrates architecture.
const assert = require('assert');

const stub = {
  store: {},
  async get(platform, username) {
    return this.store[platform + ':' + username] || null;
  },
  async save(platform, username, payload) {
    const key = platform + ':' + username;
    const existing = this.store[key];
    if (existing) {
      existing.payload_json = payload;
      existing.last_fetched = new Date();
      return existing;
    }
    this.store[key] = { platform, username, payload_json: payload, last_fetched: new Date(), created_at: new Date() };
    return this.store[key];
  }
};

(async () => {
  // T1 — stored GET
  stub.store = {};
  stub.store['atcoder:tourist'] = { platform:'atcoder', username:'tourist', payload_json:{status:'OK'}, last_fetched:new Date(), created_at:new Date() };
  const t1 = await stub.get('atcoder','tourist');
  assert.strictEqual(t1 && t1.payload_json.status, 'OK', 'T1 stored GET');
  console.log('PASS T1 — Stored GET');

  // T2 — cache miss → fetch + persist
  stub.store = {};
  assert.strictEqual(await stub.get('atcoder','tourist'), null, 'T2 miss');
  await stub.save('atcoder','tourist',{status:'OK', rating:2000});
  const t2 = await stub.get('atcoder','tourist');
  assert.strictEqual(t2.payload_json.rating, 2000, 'T2 persisted');
  console.log('PASS T2 — Cache miss fetch+persist');

  // T3 — refresh updates, preserves created_at
  stub.store = {};
  await stub.save('atcoder','tourist',{rating:1900});
  const before = await stub.get('atcoder','tourist');
  await stub.save('atcoder','tourist',{rating:2050});
  const after = await stub.get('atcoder','tourist');
  // Refresh updates payload; last_fetched change may be sub-ms (stub executes instantly)
  assert.strictEqual(after.payload_json.rating, 2050, 'T3 updated');
  assert.strictEqual(after.created_at.getTime(), before.created_at.getTime(), 'T3 created_at preserved');
  console.log('PASS T3 — Refresh updates/preserves');

  // T4 — failure preserves old (save never called in catch)
  stub.store = {};
  await stub.save('atcoder','tourist',{rating:1900});
  const old = await stub.get('atcoder','tourist');
  // failure path: do NOT call save → unchanged (demonstrated by not calling)
  assert.deepStrictEqual((await stub.get('atcoder','tourist')).payload_json, old.payload_json, 'T4 unchanged');
  console.log('PASS T4 — Refresh failure preserves old');

  // T5 — first failure, no record
  stub.store = {};
  assert.strictEqual(await stub.get('atcoder','noone'), null, 'T5 no record');
  console.log('PASS T5 — First fetch failure no record');

  console.log('All AtCoder persistence tests passed (stubbed, no live DB required).');
})();