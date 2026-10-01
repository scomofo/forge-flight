import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

// Keep the focused TypeScript suite in the existing scripts/**/*.test.mjs
// discovery path without adding dependencies or changing the test command.
test('capstone package evidence and storage regressions', () => {
  const result = spawnSync(process.execPath, [
    '--experimental-strip-types', '--test', 'src/course/capstone-package.test.ts',
  ], { cwd: fileURLToPath(new URL('../', import.meta.url)), encoding: 'utf8' });
  assert.equal(result.error, undefined);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});
