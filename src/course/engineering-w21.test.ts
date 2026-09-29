/**
 * Validation for the Engineering 101 Week 21 batch (scout/engineering-w21).
 *
 * Run with: node --experimental-strip-types --test src/course/engineering-w21.test.ts
 * from the repo root. Imports are relative "./x.ts" so Node's type-stripping
 * resolves them without the @/ alias.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { engineeringW21Lessons } from "./engineering-w21.ts";
import {
  SAMPLE_LEDGER,
  SAMPLE_REQUIREMENTS,
  gradeRequirement,
  hasBindingForm,
  isMeasurable,
  isSingular,
  isUnambiguous,
  ledgerStats,
  matrixVerdict,
  type Requirement,
} from "./requirements.ts";
import { lessons, lessonsFor } from "./catalog.ts";

const here = dirname(fileURLToPath(import.meta.url));

test("week 21 opens the engineering track in syllabus order", () => {
  assert.equal(engineeringW21Lessons.length, 3);
  assert.deepEqual(
    engineeringW21Lessons.map((l) => l.id),
    ["requirements", "verifyvalidate", "ledger"],
  );
  assert.deepEqual(
    engineeringW21Lessons.map((l) => l.index),
    [1, 2, 3],
  );
  for (const l of engineeringW21Lessons) assert.equal(l.track, "engineering");
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
  for (const l of engineeringW21Lessons) {
    assert.ok(lessons.includes(l), `week-21 lesson ${l.id} must be in lessons`);
  }
});

test("no duplicate lesson ids across the catalog", () => {
  const seen = new Set<string>();
  for (const lesson of lessons) {
    assert.ok(!seen.has(`${lesson.track}/${lesson.id}`), `duplicate ${lesson.track}/${lesson.id}`);
    seen.add(`${lesson.track}/${lesson.id}`);
  }
});

test("week-21 lessons satisfy the lesson contract", () => {
  for (const lesson of engineeringW21Lessons) {
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
    assert.ok(lesson.bench === "reqpacket" || lesson.bench === "ledger", `${lesson.id}: bench must be registered`);
    assert.ok(lesson.prompt.split(" || ").length >= 1, `${lesson.id}: prompt must exist`);
    assert.ok(lesson.note.trim().length > 0, `${lesson.id}: note must exist`);
    assert.ok(lesson.minutes > 0, `${lesson.id}: minutes positive`);
  }
});

test("week-21 bench ids are registered in the bench index", () => {
  const indexSource = readFileSync(join(here, "..", "components", "bench", "index.tsx"), "utf8");
  const registered = new Set(
    [...indexSource.matchAll(/case\s+"([\w-]+)"/g)].map((m) => m[1]),
  );
  for (const lesson of engineeringW21Lessons) {
    assert.ok(
      registered.has(lesson.bench),
      `bench id "${lesson.bench}" from ${lesson.id} must have a case in bench/index.tsx`,
    );
  }
  const labsSource = readFileSync(join(here, "..", "components", "bench", "engineering-w21-labs.tsx"), "utf8");
  assert.ok(labsSource.includes("export function ReqPacketBench"), "ReqPacketBench must be exported");
  assert.ok(labsSource.includes("export function AssumptionLedgerBench"), "AssumptionLedgerBench must be exported");
});

test("the grader passes the lesson's clean example and flags the flawed ones", () => {
  const clean = "The light shall output at least 400 lm in high mode.";
  assert.deepEqual(gradeRequirement(clean), [], "lesson worked example must grade clean");
  assert.ok(isMeasurable(clean) && isSingular(clean) && isUnambiguous(clean) && hasBindingForm(clean));

  const compound = "The carrier shall hold the phone through a 1 m drop onto concrete and weigh at most 120 g.";
  const compoundIssues = gradeRequirement(compound).map((i) => i.code);
  assert.ok(compoundIssues.includes("compound"), "two demands in one sentence must be flagged");

  const vague = "The carrier should be light and easy to use with gloves on.";
  const vagueIssues = gradeRequirement(vague).map((i) => i.code);
  assert.ok(vagueIssues.includes("unmeasurable"), "no number+unit must be flagged");
  assert.ok(vagueIssues.includes("vague"), "weasel words without numbers must be flagged");
  assert.ok(vagueIssues.includes("weak-form"), "'should' is not a binding form");

  const drop = "The carrier shall hold the phone through a 1 m drop onto concrete.";
  assert.deepEqual(gradeRequirement(drop), [], "REQ-1 sample must grade clean");

  assert.deepEqual(gradeRequirement(""), [{ code: "unmeasurable", message: "Empty — a requirement has to say something." }]);
});

test("measurability needs both a number and a unit", () => {
  assert.ok(isMeasurable("The link shall carry 400 lb."), "number + unit");
  assert.ok(!isMeasurable("The link shall be strong."), "no number, no unit");
  assert.ok(isMeasurable("It shall survive 10 cycles."), "a counted event is its own ruler");
  assert.ok(isMeasurable("The link shall survive 10 000 open/close cycles with no visible cracking."), "counted cycles with criterion");
  assert.ok(!isUnambiguous("The case shall be robust against drops."), "robust without a number is a weasel");
  assert.ok(isUnambiguous("The case shall survive a 1 m drop with no visible cracking."), "numbered claim is fine");
});

test("sample requirements match the lesson's story", () => {
  assert.equal(SAMPLE_REQUIREMENTS.length, 3);
  assert.deepEqual(gradeRequirement(SAMPLE_REQUIREMENTS[0].text), [], "REQ-1 is the clean one");
  assert.ok(gradeRequirement(SAMPLE_REQUIREMENTS[1].text).length >= 3, "REQ-2 must carry multiple issues");
  assert.deepEqual(gradeRequirement(SAMPLE_REQUIREMENTS[2].text), [], "REQ-3 is the clean one");
});

test("matrix verdict catches missing methods and hows", () => {
  const reqs: Requirement[] = [
    { id: "REQ-1", text: "a", verification: "test", verificationNote: "bench rig" },
    { id: "REQ-2", text: "b", verification: null, verificationNote: "" },
    { id: "REQ-3", text: "c", verification: "inspection", verificationNote: "" },
  ];
  const v = matrixVerdict(reqs);
  assert.deepEqual(v.missingMethod, ["REQ-2"]);
  assert.deepEqual(v.missingNote, ["REQ-3"]);
  assert.equal(v.complete, false);
  const done: Requirement[] = [
    { id: "REQ-1", text: "a", verification: "test", verificationNote: "bench rig" },
  ];
  assert.equal(matrixVerdict(done).complete, true);
  assert.equal(matrixVerdict([]).complete, true, "empty matrix is vacuously complete");
});

test("ledger stats surface the Orbiter's A-2 pattern", () => {
  const stats = ledgerStats(SAMPLE_LEDGER);
  assert.equal(stats.total, 2);
  assert.equal(stats.resolved, 1);
  assert.equal(stats.withProvenance, 1, "A-2 has empty provenance");
  assert.equal(stats.openHighRisk, 1, "A-2 is unresolved with low confidence");
  assert.ok(Math.abs(stats.resolutionRate - 0.5) < 1e-9);

  const empty = ledgerStats([]);
  assert.equal(empty.resolutionRate, 1, "no entries means nothing outstanding");
  assert.equal(empty.openHighRisk, 0);

  const resolvedLow = ledgerStats([
    { id: "A-9", claim: "x", provenance: "test log", confidence: "low", resolved: true, resolution: "test log 7" },
  ]);
  assert.equal(resolvedLow.openHighRisk, 0, "resolved entries are not high risk");
});
