/**
 * Validation for the Engineering 101 Week 23 batch (scout/engineering-w23).
 *
 * Run with: node --experimental-strip-types --test src/course/engineering-w23.test.ts
 * from the repo root. Imports are relative "./x.ts" so Node's type-stripping
 * resolves them without the @/ alias.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { engineeringW23Lessons } from "./engineering-w23.ts";
import {
  buildMarginTable,
  factorOfSafety,
  fmeaRanking,
  fmeaScore,
  lowestMargin,
  marginOfSafety,
  marginVerdict,
  riskPriority,
  tableVerdict,
  ultimateLoad,
  type FmeaRow,
} from "./loads.ts";
import { lessons, lessonsFor } from "./catalog.ts";

const here = dirname(fileURLToPath(import.meta.url));

test("week 23 opens the engineering track in syllabus order", () => {
  assert.equal(engineeringW23Lessons.length, 3);
  assert.deepEqual(
    engineeringW23Lessons.map((l) => l.id),
    ["loadpath", "margins", "fmea"],
  );
  assert.deepEqual(
    engineeringW23Lessons.map((l) => l.index),
    [7, 8, 9],
  );
  for (const l of engineeringW23Lessons) assert.equal(l.track, "engineering");
  const engineering = lessonsFor("engineering");
  assert.equal(engineering.length, 41, "engineering track must hold weeks 21-30 plus the 11 legacy lessons");
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
      "design",
      "equilibrium",
      "stress",
      "beams",
      "tradeoffs",
      "failure",
      "notch",
      "fatigue",
      "crack",
      "bolt",
      "mean",
    ],
  );
  assert.deepEqual(
    engineering.map((l) => l.index),
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41],
  );
  for (const l of engineeringW23Lessons) {
    assert.ok(lessons.includes(l), `week-23 lesson ${l.id} must be in lessons`);
  }
});

test("no duplicate lesson ids across the catalog", () => {
  const seen = new Set<string>();
  for (const lesson of lessons) {
    assert.ok(!seen.has(`${lesson.track}/${lesson.id}`), `duplicate ${lesson.track}/${lesson.id}`);
    seen.add(`${lesson.track}/${lesson.id}`);
  }
});

test("week-23 lessons satisfy the lesson contract", () => {
  for (const lesson of engineeringW23Lessons) {
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
    assert.ok(lesson.bench === "loadpath" || lesson.bench === "fmea", `${lesson.id}: bench must be registered`);
    assert.ok(lesson.prompt.trim().length > 0, `${lesson.id}: prompt must exist`);
    assert.ok(lesson.note.trim().length > 0, `${lesson.id}: note must exist`);
    assert.ok(lesson.minutes > 0, `${lesson.id}: minutes positive`);
  }
});

test("week-23 bench ids are registered in the bench index", () => {
  const indexSource = readFileSync(join(here, "..", "components", "bench", "index.tsx"), "utf8");
  const registered = new Set(
    [...indexSource.matchAll(/case\s+"([\w-]+)"/g)].map((m) => m[1]),
  );
  for (const lesson of engineeringW23Lessons) {
    assert.ok(
      registered.has(lesson.bench),
      `bench id "${lesson.bench}" from ${lesson.id} must have a case in bench/index.tsx`,
    );
  }
  const labsSource = readFileSync(join(here, "..", "components", "bench", "engineering-w23-labs.tsx"), "utf8");
  assert.ok(labsSource.includes("export function LoadPathBench"), "LoadPathBench must be exported");
  assert.ok(labsSource.includes("export function FmeaBench"), "FmeaBench must be exported");
});

test("margin arithmetic reproduces the lesson's tow-hook worked numbers", () => {
  // 100 mm² lug, 12 kN limit load → 120 MPa applied; 250 MPa yield / 1.5 → 167 MPa allowable
  assert.equal(ultimateLoad(12000), 18000, "ultimate = 1.5 × limit");
  assert.ok(Math.abs(factorOfSafety(167, 120) - 1.3917) < 1e-3);
  assert.ok(Math.abs(marginOfSafety(167, 120) - 0.3917) < 1e-3);
  assert.equal(marginVerdict(marginOfSafety(167, 120)), "passes");
  // ultimate row: 180 MPa applied vs 310 MPa allowable
  assert.ok(Math.abs(marginOfSafety(310, 180) - 0.7222) < 1e-3);
});

test("margin verdicts classify fail, thin, and pass", () => {
  assert.equal(marginVerdict(-0.02), "fails");
  assert.equal(marginVerdict(0), "thin", "zero margin is not a failure but it is thin");
  assert.equal(marginVerdict(0.05), "thin");
  assert.equal(marginVerdict(0.4), "passes");
  assert.throws(() => factorOfSafety(100, 0), /positive/);
  assert.throws(() => factorOfSafety(100, -5), /positive/);
  assert.throws(() => ultimateLoad(-1), /non-negative/);
});

test("the margin table is only as good as its worst line", () => {
  const results = buildMarginTable([
    { label: "limit tension", applied: 120, allowable: 167 },
    { label: "limit bending", applied: 90, allowable: 167 },
    { label: "overtorqued case", applied: 200, allowable: 167 },
  ]);
  assert.equal(results.length, 3);
  assert.ok(Math.abs(results[0]!.fos - 167 / 120) < 1e-9);
  assert.equal(results[2]!.verdict, "fails");
  assert.equal(tableVerdict(results), "fails", "one negative line fails the table");
  assert.equal(lowestMargin(results)!.label, "overtorqued case");
  assert.equal(
    tableVerdict(buildMarginTable([{ label: "ok", applied: 100, allowable: 110 }])),
    "thin",
    "10% margin is thin, not failed",
  );
  assert.equal(lowestMargin([]), null);
});

test("FMEA scoring reproduces the lesson's tow-release worked numbers", () => {
  assert.equal(riskPriority(9, 3, 5), 135, "lesson RPN before mitigation");
  const row: FmeaRow = {
    mode: "Fails to release under load",
    effect: "Glider cannot separate from the tow plane",
    cause: "Return-spring corrosion after a wet season",
    severity: 9,
    occurrence: 3,
    detection: 5,
    mitigation: "Redundant release spring plus a documented spring-replacement interval",
    occurrenceAfter: 1,
    detectionAfter: 2,
  };
  const score = fmeaScore(row);
  assert.equal(score.before, 135);
  assert.equal(score.after, 18, "9 × 1 × 2");
  assert.equal(score.delta, 117);
  assert.ok(Math.abs(score.deltaPct - (117 / 135) * 100) < 1e-9);
  assert.throws(() => riskPriority(11, 1, 1), /1–10/);
  assert.throws(() => riskPriority(5, 0, 5), /1–10/);
});

test("FMEA ranking orders worst-first by pre-mitigation RPN", () => {
  const mild: FmeaRow = {
    mode: "paint chips",
    effect: "cosmetic",
    cause: "abrasion",
    severity: 2,
    occurrence: 4,
    detection: 3,
    mitigation: "tougher coating",
    occurrenceAfter: 2,
    detectionAfter: 3,
  };
  const bad: FmeaRow = {
    mode: "bolt shears",
    effect: "strut detaches",
    cause: "fatigue",
    severity: 9,
    occurrence: 4,
    detection: 6,
    mitigation: "larger bolt + inspection",
    occurrenceAfter: 2,
    detectionAfter: 3,
  };
  const ranking = fmeaRanking([mild, bad]);
  assert.equal(ranking[0]!.row.mode, "bolt shears");
  assert.equal(ranking[0]!.score.before, 9 * 4 * 6);
  assert.equal(ranking[1]!.row.mode, "paint chips");
});
