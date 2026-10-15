// Unit tests for .claude/skills/flaky-triage/flaky.mjs. Run: node --test scripts/tests/
// Fixtures: five Playwright JSON reports whose directory names sort opposite to their start times.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const script = path.join(here, '../../.claude/skills/flaky-triage/flaky.mjs');
const runsDir = path.join(here, 'fixtures/flaky/runs');

const triage = (...args) => JSON.parse(execFileSync(process.execPath, [script, runsDir, ...args], { encoding: 'utf8' }));
const byTitle = (out, title) => {
  const s = out.scenarios.find(x => x.title === title);
  assert.ok(s, `scenario "${title}" missing from output`);
  return s;
};

const all = triage();

test('orders runs by start time, not directory name', () => {
  assert.equal(all.window, 5);
  assert.deepEqual(all.runs, ['e-run', 'd-run', 'c-run', 'b-run', 'a-run']);
});

test('stable-pass: every counted run passed', () => {
  const s = byTitle(all, 'Total is stable');
  assert.equal(s.verdict, 'stable-pass');
  assert.deepEqual([s.counted, s.passes, s.fails, s.flips, s.flipRate], [5, 5, 0, 0, 0]);
});

test('consistent-fail: every counted run failed', () => {
  const s = byTitle(all, 'Expired code is always rejected');
  assert.equal(s.verdict, 'consistent-fail');
  assert.deepEqual([s.counted, s.passes, s.fails, s.flips], [5, 0, 5, 0]);
  assert.match(s.history[0].error, /toHaveText/);
  assert.ok(!s.history[0].error.includes('\n'), 'error is cut to its first line');
});

test('flaky: pass/fail flips, sorted first by flip rate', () => {
  const s = byTitle(all, 'Discount flips between runs');
  assert.equal(s.verdict, 'flaky');
  assert.deepEqual([s.counted, s.passes, s.fails, s.flips, s.flipRate], [5, 3, 2, 4, 1]);
  assert.equal(all.scenarios[0].title, 'Discount flips between runs');
  assert.equal(s.unquarantine, false, 'quarantined but not 10 straight passes');
});

test('insufficient-data: fewer than 3 counted outcomes', () => {
  const s = byTitle(all, 'Newly added scenario');
  assert.equal(s.verdict, 'insufficient-data');
  assert.equal(s.counted, 2);
});

test('baseline creation is recorded but not counted', () => {
  const s = byTitle(all, 'Cart matches visual baseline');
  assert.equal(s.history[0].outcome, 'no-baseline');
  assert.equal(s.verdict, 'stable-pass');
  assert.deepEqual([s.counted, s.fails, s.flips], [4, 0, 0]);
});

test('network errors are recorded but not counted as flips', () => {
  const s = byTitle(all, 'Survives staging network blips');
  assert.deepEqual(s.history.map(h => h.outcome), ['pass', 'network', 'pass', 'network', 'pass']);
  assert.equal(s.verdict, 'stable-pass');
  assert.deepEqual([s.counted, s.fails, s.flips], [3, 0, 0]);
});

test('skipped results are ignored entirely', () => {
  assert.equal(all.scenarios.find(x => x.title === 'Skipped scenario'), undefined);
});

test('scenario key and feature path strip .features-gen/<project>/', () => {
  const s = byTitle(all, 'Total is stable');
  assert.equal(s.feature, 'checkout/discount.feature');
  assert.equal(s.key, 'chromium|checkout/discount.feature|Total is stable');
  assert.equal(s.changedDuringWindow, false);
});

test('window keeps only the latest N runs', () => {
  const last3 = triage('3');
  assert.deepEqual(last3.runs, ['c-run', 'b-run', 'a-run']);
  const s = byTitle(last3, 'Discount flips between runs');
  assert.deepEqual([s.counted, s.flips], [3, 2]);
  assert.equal(byTitle(last3, 'Survives staging network blips').verdict, 'insufficient-data');
});
