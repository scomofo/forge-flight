/**
 * Validation for the Engineering 101 Week 29 batch (scout/engineering-w29).
 *
 * Run with: node --experimental-strip-types --test src/course/engineering-w29.test.ts
 * from the repo root. Imports are relative "./x.ts" so Node's type-stripping
 * resolves them without the @/ alias.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { engineeringW29Lessons } from "./engineering-w29.ts";
import {
  CLAUSE_EXERCISES,
  DISTRACTORS,
  FOS_TABLE,
  SEEDED_PACKAGE,
  gradeMemo,
  scoreReview,
  verdictFor,
  type ReviewFinding,
} from "./review.ts";
import { lessons, lessonsFor } from "./catalog.ts";

const here = dirname(fileURLToPath(import.meta.url));

test("week 29 lessons sit at their engineering-track indices in syllabus order", () => {
  assert.equal(engineeringW29Lessons.length, 3);
  assert.deepEqual(
    engineeringW29Lessons.map((l) => l.id),
    ["safetyfactor", "standards", "designreview"],
  );
  assert.deepEqual(
    engineeringW29Lessons.map((l) => l.index),
    [25, 26, 27],
  );
  for (const l of engineeringW29Lessons) assert.equal(l.track, "engineering");
  const engineering = lessonsFor("engineering");
  assert.equal(engineering.length, 30, "engineering track must hold weeks 21-30");
  assert.deepEqual(
    engineering.map((l) => l.id),
    [
      "requirements",
      "verifyvalidate",
      "ledger",
      "modelvalid",
      "errprop",
      "sensitivity",
      "loadpath",
      "margins",
      "fmea",
      "bending",
      "buckle",
      "combined",
      "indicescontext",
      "interfaces",
      "systemdecision",
      "processes",
      "tolerances",
      "dfm",
      "doeplan",
      "smallsample",
      "honestgraph",
      "tradestudy",
      "paramsweep",
      "convergence",
      "safetyfactor",
      "standards",
      "designreview",
      "capmethod",
      "glidersynth",
      "capmastery",
    ],
  );
  assert.deepEqual(
    engineering.map((l) => l.index),
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
  );
  for (const l of engineeringW29Lessons) {
    assert.ok(lessons.includes(l), `week-29 lesson ${l.id} must be in lessons`);
  }
});

test("no duplicate lesson ids across the catalog", () => {
  const seen = new Set<string>();
  for (const lesson of lessons) {
    assert.ok(!seen.has(`${lesson.track}/${lesson.id}`), `duplicate ${lesson.track}/${lesson.id}`);
    seen.add(`${lesson.track}/${lesson.id}`);
  }
});

test("week-29 lessons satisfy the lesson contract", () => {
  for (const lesson of engineeringW29Lessons) {
    assert.equal(lesson.start.split(" || ").length, 3, `${lesson.id}: start must have 3 parts`);
    assert.equal(lesson.use.split(" || ").length, 3, `${lesson.id}: use must have 3 parts`);
    assert.equal(lesson.example.split(" || ").length, 3, `${lesson.id}: example must have 3 parts`);
    assert.equal(lesson.ideas.length, 3, `${lesson.id}: exactly 3 ideas`);
    assert.equal(lesson.checks.length, 4, `${lesson.id}: exactly 4 checks`);
    for (const check of lesson.checks) {
      assert.equal(check.options.length, 4, `${lesson.id}: check needs 4 options`);
      assert.ok(check.answer >= 0 && check.answer <= 3, `${lesson.id}: answer in range`);
      assert.ok(check.why.trim().length > 0, `${lesson.id}: why must explain`);
    }
    assert.ok(
      lesson.bench === "standards" || lesson.bench === "designreview",
      `${lesson.id}: bench must be registered`,
    );
    assert.ok(lesson.prompt.split(" || ").length >= 1, `${lesson.id}: prompt must exist`);
    assert.ok(lesson.note.trim().length > 0, `${lesson.id}: note must exist`);
    assert.ok(lesson.minutes > 0, `${lesson.id}: minutes positive`);
  }
});

test("week-29 bench ids are registered in the bench index", () => {
  const indexSource = readFileSync(join(here, "..", "components", "bench", "index.tsx"), "utf8");
  const registered = new Set(
    [...indexSource.matchAll(/case\s+"([\w-]+)"/g)].map((m) => m[1]),
  );
  for (const lesson of engineeringW29Lessons) {
    assert.ok(
      registered.has(lesson.bench),
      `bench id "${lesson.bench}" from ${lesson.id} must have a case in bench/index.tsx`,
    );
  }
  const labsSource = readFileSync(join(here, "..", "components", "bench", "engineering-w29-labs.tsx"), "utf8");
  assert.ok(labsSource.includes("export function StandardsBench"), "StandardsBench must be exported");
  assert.ok(labsSource.includes("export function DesignReviewBench"), "DesignReviewBench must be exported");
});

test("the verdict follows the open findings, not the schedule", () => {
  assert.equal(verdictFor(["critical", "major"]), "reject");
  assert.equal(verdictFor(["critical"]), "reject", "an open critical rejects even alone");
  assert.equal(verdictFor(["major", "minor"]), "approve-with-conditions");
  assert.equal(verdictFor(["minor", "observation"]), "approve");
  assert.equal(verdictFor([]), "approve");
});

test("the seeded package covers all four severities", () => {
  assert.equal(SEEDED_PACKAGE.length, 6);
  const severities = new Set(SEEDED_PACKAGE.map((i) => i.severity));
  assert.deepEqual([...severities].sort(), ["critical", "major", "minor", "observation"]);
  assert.equal(
    SEEDED_PACKAGE.filter((i) => i.severity === "critical").length,
    1,
    "exactly one critical drives the worked reject",
  );
  for (const issue of SEEDED_PACKAGE) {
    assert.ok(issue.clause.trim().length > 0, `${issue.id} must cite a clause`);
    assert.ok(issue.location.trim().length > 0, `${issue.id} must name a location`);
  }
});

test("scoreReview grades recall, severity, and false alarms", () => {
  const all = scoreReview(
    SEEDED_PACKAGE.map((i) => i.id),
    Object.fromEntries(SEEDED_PACKAGE.map((i) => [i.id, i.severity])),
  );
  assert.equal(all.recall, 1);
  assert.equal(all.severityCorrect, 6);
  assert.deepEqual(all.missed, []);
  assert.deepEqual(all.falseAlarms, []);

  const partial = scoreReview(["ISS-1", "DIS-1"], { "ISS-1": "major" });
  assert.deepEqual(partial.found, ["ISS-1"]);
  assert.equal(partial.missed.length, 5);
  assert.deepEqual(partial.falseAlarms, ["DIS-1"], "distractors are false alarms");
  assert.equal(partial.severityCorrect, 0, "ISS-1 is critical, not major");

  const empty = scoreReview([], {});
  assert.equal(empty.recall, 0);
  assert.equal(empty.severityTotal, 0);
});

test("gradeMemo checks verdict logic, completeness, and the signature", () => {
  const findings: ReviewFinding[] = SEEDED_PACKAGE.map((i) => ({
    issueId: i.id,
    severity: i.severity,
    addressed: true,
  }));
  const clean = gradeMemo({
    verdict: "approve",
    findings,
    memoText: "Reviewed the two-sheet tow-bar package and three calculations. Six findings filed, all addressed with rework noted above. No open findings remain.",
    signature: "R. Alvarez, P.Eng",
  });
  assert.ok(clean.complete, `clean memo should pass, got: ${clean.issues.join("; ")}`);

  const wrongVerdict = gradeMemo({
    verdict: "approve",
    findings: findings.map((f) => ({ ...f, addressed: f.issueId !== "ISS-1" })),
    memoText: "Reviewed the package. Six findings filed; five addressed.",
    signature: "R. Alvarez",
  });
  assert.ok(!wrongVerdict.complete, "approving with an open critical must fail");
  assert.equal(wrongVerdict.expectedVerdict, "reject");
  assert.ok(wrongVerdict.issues.some((i) => i.includes("reject")), "issue must name the required verdict");

  const unsigned = gradeMemo({
    verdict: "reject",
    findings: findings.map((f) => ({ ...f, addressed: false })),
    memoText: "Reviewed the package. Critical single-point failure found; rejecting pending redesign.",
    signature: "",
  });
  assert.ok(!unsigned.complete, "unsigned memo must fail");
  assert.ok(unsigned.issues.some((i) => i.includes("Unsigned")));

  const thin = gradeMemo({ verdict: "approve", findings: [], memoText: "ok", signature: "R.A." });
  assert.ok(!thin.complete, "a thin memo must fail");
});

test("the FoS table prices consequence honestly", () => {
  assert.deepEqual(Object.keys(FOS_TABLE).sort(), ["catastrophic", "high", "low", "moderate"]);
  assert.ok(FOS_TABLE.low.fos < FOS_TABLE.moderate.fos, "FoS must rise with consequence");
  assert.ok(FOS_TABLE.moderate.fos < FOS_TABLE.high.fos);
  assert.ok(FOS_TABLE.high.fos < FOS_TABLE.catastrophic.fos);
  assert.equal(FOS_TABLE.moderate.fos, 2.0, "the tow-bar lesson's moderate class pins 2.0");
});

test("clause exercises separate shall from should", () => {
  assert.equal(CLAUSE_EXERCISES.length, 2);
  for (const ex of CLAUSE_EXERCISES) {
    const shalls = ex.claims.filter((c) => c.isShall);
    assert.ok(shalls.length >= 1, `${ex.id} must have at least one shall`);
    assert.ok(ex.claims.length > shalls.length, `${ex.id} must have non-shall distractors`);
    assert.ok(ex.compliance.why.trim().length > 0, `${ex.id} needs the compliance reasoning`);
  }
  const cl1 = CLAUSE_EXERCISES[0];
  assert.ok(
    cl1.claims.find((c) => c.text.includes("room temperature"))?.isShall === false,
    "a 'should' sentence must not classify as a shall",
  );
  assert.equal(cl1.compliance.complies, false, "2.5x against a 3x shall is a fail");
});

test("distractors are not in the seeded package", () => {
  const packageIds = new Set(SEEDED_PACKAGE.map((i) => i.id));
  assert.equal(DISTRACTORS.length, 3);
  for (const d of DISTRACTORS) {
    assert.ok(!packageIds.has(d.id), `distractor ${d.id} must not collide with a planted issue`);
  }
});
