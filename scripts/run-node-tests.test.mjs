import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runNodeTests } from './run-node-tests.mjs';

function fixture(source, action) {
  const dir = mkdtempSync(join(tmpdir(), 'forge-test-runner-'));
  const file = join(dir, 'case.test.mjs');
  try { writeFileSync(file, source); action(file); }
  finally { rmSync(dir, { recursive: true, force: true }); }
}
test('a wrapper executes child tests even inside the parent test runner', () => {
  fixture("import test from 'node:test'; test('child actually executes',()=>{});", file => {
    assert.deepEqual(runNodeTests([file]), { tests: 1, passed: 1 });
  });
});
test('a failing child must make its wrapper fail', () => {
  fixture("import test from 'node:test'; test('intentional failure',()=>{throw new Error('sentinel failure')});", file => {
    assert.throws(() => runNodeTests([file]), /sentinel failure/);
  });
});
test('an empty child suite cannot be counted as a passing regression', () => {
  fixture('', file => { assert.throws(() => runNodeTests([file], 2), /did not execute/); });
});
test('skipped tests cannot silently satisfy a wrapper', () => {
  fixture("import test from 'node:test'; test.skip('must run',()=>{});", file => {
    assert.throws(() => runNodeTests([file]));
  });
});
