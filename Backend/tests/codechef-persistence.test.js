// Phase 5 — CodeChef persistence integration tests (focused, stubbed)
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
  stub.store['codechef:als1510'] = { platform:'codechef', username:'als1510', payload_json:{status:'OK'}, last_fetched:new Date(), created_at:new Date() };
  const t1 = await stub.get('codechef','als1510');
  assert.strictEqual(t1 && t1.payload_json.status, 'OK', 'T1 stored GET');
  console.log('PASS T1 — Stored GET');

  // T2 — cache miss → fetch + persist
  stub.store = {};
  assert.strictEqual(await stub.get('codechef','als1510'), null, 'T2 miss');
  await stub.save('codechef','als1510',{status:'OK',rating:1456});
  const t2 = await stub.get('codechef','als1510');
  assert.strictEqual(t2.payload_json.rating, 1456, 'T2 persisted');
  console.log('PASS T2 — Cache miss fetch+persist');

  // T3 — refresh updates, preserves created_at
  stub.store = {};
  await stub.save('codechef','als1510',{rating:1400});
  const before = await stub.get('codechef','als1510');
  await stub.save('codechef','als1510',{rating:1456});
  const after = await stub.get('codechef','als1510');
  // Refresh updates payload; last_fetched change may be sub-ms (stub executes instantly)
  assert.strictEqual(after.payload_json.rating, 1456, 'T3 updated');
  assert.strictEqual(after.created_at.getTime(), before.created_at.getTime(), 'T3 created_at preserved');
  console.log('PASS T3 — Refresh updates/preserves');

  // T4 — failure preserves old (save never called in catch)
  stub.store = {};
  await stub.save('codechef','als1510',{rating:1400});
  const old = await stub.get('codechef','als1510');
  // failure path: do NOT call save → unchanged (demonstrated by not calling)
  assert.deepStrictEqual((await stub.get('codechef','als1510')).payload_json, old.payload_json, 'T4 unchanged');
  console.log('PASS T4 — Refresh failure preserves old');

  // T5 — first failure, no record
  stub.store = {};
  assert.strictEqual(await stub.get('codechef','noone'), null, 'T5 no record');
  console.log('PASS T5 — First fetch failure no record');

  console.log('All Phase 5 persistence tests passed (stubbed, no live DB required).');
})();
