import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

test('manuscript outcome and curve-reading regressions', () => {
  const run = spawnSync(process.execPath, ['--experimental-strip-types', '--import', './scripts/register-alias.mjs', '--test',
    'src/forge/sim/editorial-results.test.ts', 'src/course/curve-reading.test.ts'], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stdout + run.stderr);
});
