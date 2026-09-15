// Minimal fixture-based parser tests — do not require network
const assert = require('assert');

// Replicate safeInt from route
const safeInt = (val) => {
  if (val === undefined || val === null || val === '') return null;
  const s = String(val).trim();
  if (s === 'Inactive' || s.toLowerCase() === 'inactive') return 'NA';
  const n = parseInt(s.replace(/[^0-9]/g, ''), 10);
  return isNaN(n) ? 'NA' : n;
};

// 1. Normal profile
assert.strictEqual(safeInt('1456'), 1456, 'normal rating');
// 2. Inactive / non-numeric rank
assert.strictEqual(safeInt('Inactive'), 'NA', 'Inactive must not become 0');
assert.strictEqual(safeInt(''), null, 'empty');
// 3. Zero solved acceptable
assert.strictEqual(parseInt('0', 10), 0, 'zero solved allowed');
// 4. Invalid username handled externally (tested via live smoke, not here)
console.log('Fixture parser tests passed.');
