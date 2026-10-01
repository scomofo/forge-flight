import test from "node:test";
import { runNodeTests } from "./run-node-tests.mjs";
test("phase identities, stability and bonding execute independent regression suite", () => {
  runNodeTests(["src/course/scientific-consistency.test.ts"], 13);
});
