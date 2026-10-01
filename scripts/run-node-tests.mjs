import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

/** Run a real child test process, not a nested Node test-runner worker.
 * An exit code alone is insufficient: require an executed, clean TAP summary.
 */
export function runNodeTests(files, minimumTests = 1) {
  assert.ok(files.length > 0 && Number.isSafeInteger(minimumTests) && minimumTests > 0);
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  const result = spawnSync(process.execPath, [
    '--experimental-strip-types', '--import', './scripts/register-alias.mjs',
    '--test', '--test-reporter=tap', ...files,
  ], { env, encoding: 'utf8', timeout: 120000, maxBuffer: 8 * 1024 * 1024 });
  const output = (result.stdout ?? '') + (result.stderr ?? '');
  assert.ifError(result.error);
  assert.equal(result.status, 0, output);
  const count = label => Number(result.stdout.match(new RegExp(`^# ${label} (\\d+)$`, 'm'))?.[1] ?? NaN);
  const tests = count('tests'), passed = count('pass');
  assert.ok(Number.isFinite(tests) && tests >= minimumTests, `Child tests did not execute the expected suite.\n${output}`);
  assert.equal(passed, tests, output);
  for (const label of ['fail', 'cancelled', 'skipped', 'todo']) assert.equal(count(label), 0, output);
  return { tests, passed };
}
