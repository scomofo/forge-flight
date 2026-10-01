import test from 'node:test';
import { runNodeTests } from './run-node-tests.mjs';

test('capstone package evidence and storage regressions', () => {
  runNodeTests(['src/course/capstone-package.test.ts'], 16);
});
