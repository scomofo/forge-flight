import test from 'node:test';
import { runNodeTests } from './run-node-tests.mjs';

test('Hangar golden tests and independent full-span regressions', () => {
  runNodeTests(['src/forge/sim/golden.test.ts', 'src/forge/sim/hangar-audit.test.ts'], 54);
});
