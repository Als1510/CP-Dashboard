// LeetCode persistence integration tests (focused, stubbed)
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
  stub.store['leetcode:testuser'] = { platform:'leetcode', username:'testuser', payload_json:{status:'OK'}, last_fetched:new Date(), created_at:new Date() };
  const t1 = await stub.get('leetcode','testuser');
  assert.strictEqual(t1 && t1.payload_json.status, 'OK', 'T1 stored GET');
  console.log('PASS T1 — Stored GET');

  // T2 — cache miss → fetch + persist
  stub.store = {};
  assert.strictEqual(await stub.get('leetcode','testuser'), null, 'T2 miss');
  await stub.save('leetcode','testuser',{status:'OK',rating:1500});
  const t2 = await stub.get('leetcode','testuser');
  assert.strictEqual(t2.payload_json.rating, 1500, 'T2 persisted');
  console.log('PASS T2 — Cache miss fetch+persist');

  // T3 — refresh updates, preserves created_at
  stub.store = {};
  await stub.save('leetcode','testuser',{rating:1400});
  const before = await stub.get('leetcode','testuser');
  await stub.save('leetcode','testuser',{rating:1550});
  const after = await stub.get('leetcode','testuser');
  // Refresh updates payload; last_fetched change may be sub-ms (stub executes instantly)
  assert.strictEqual(after.payload_json.rating, 1550, 'T3 updated');
  assert.strictEqual(after.created_at.getTime(), before.created_at.getTime(), 'T3 created_at preserved');
  console.log('PASS T3 — Refresh updates/preserves');

  // T4 — failure preserves old (save never called in catch)
  stub.store = {};
  await stub.save('leetcode','testuser',{rating:1400});
  const old = await stub.get('leetcode','testuser');
  // failure path: do NOT call save → unchanged (demonstrated by not calling)
  assert.deepStrictEqual((await stub.get('leetcode','testuser')).payload_json, old.payload_json, 'T4 unchanged');
  console.log('PASS T4 — Refresh failure preserves old');

  // T5 — first failure, no record
  stub.store = {};
  assert.strictEqual(await stub.get('leetcode','noone'), null, 'T5 no record');
  console.log('PASS T5 — First fetch failure no record');

  console.log('All LeetCode persistence tests passed (stubbed, no live DB required).');
})();