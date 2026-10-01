import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

test('Hangar golden tests and independent full-span regressions', () => {
  const result = spawnSync(process.execPath, ['--experimental-strip-types', '--import', './scripts/register-alias.mjs', '--test', 'src/forge/sim/golden.test.ts', 'src/forge/sim/hangar-audit.test.ts'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stdout + result.stderr);
});
