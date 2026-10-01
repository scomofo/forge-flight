import test from 'node:test';
import { runNodeTests } from './run-node-tests.mjs';

test('manuscript outcome and curve-reading regressions', () => {
  runNodeTests(['src/forge/sim/editorial-results.test.ts', 'src/course/curve-reading.test.ts'], 15);
});
