import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const path = process.argv[2];
assert.ok(path, "Supply the browser results.json path");
const report = JSON.parse(readFileSync(path, "utf8"));
assert.equal(report.passed, true, report.error || "Browser acceptance failed");
assert.ok(Array.isArray(report.checks) && report.checks.length > 0, "Missing browser checks");
assert.equal(report.count, report.checks.length, "Incomplete browser report");
for (const device of ["desktop", "mobile"]) {
  assert.ok(report.checks.includes(`${device}: practice does not change saved course scores`), `${device} practice was not tested`);
  assert.ok(report.checks.includes(`${device}: trig retake saves best score without altering existing scores`), `${device} trig feedback was not tested`);
  assert.ok(report.checks.includes(`${device}: pendulum help preserves saved scores`), `${device} pendulum was not tested`);
  assert.ok(report.checks.includes(`${device}: no interaction exceptions`), `${device} did not finish`);
}
console.log(`Verified browser report: ${report.count} checks passed.`);
