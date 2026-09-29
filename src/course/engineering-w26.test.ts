/**
 * Validation for the Engineering 101 Week 26 batch (scout/engineering-w26).
 *
 * Run with: node --experimental-strip-types --test src/course/engineering-w26.test.ts
 * from the repo root. Imports are relative "./x.ts" so Node's type-stripping
 * resolves them without the @/ alias.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { engineeringW26Lessons } from "./engineering-w26.ts";
import {
  PROCESSES,
  classifyFit,
  rssStack,
  screenProcesses,
  stackVerdict,
  worstCaseStack,
  type StackPart,
} from "./tolerances.ts";
import { lessons, lessonsFor } from "./catalog.ts";

const here = dirname(fileURLToPath(import.meta.url));

const LESSON_STACK: StackPart[] = [
  { label: "Bracket flange", nominal: 50, tol: 0.1 },
  { label: "Spacer", nominal: 30, tol: 0.05 },
  { label: "Cover", nominal: 20, tol: 0.1 },
];

test("week 26 opens the engineering track in syllabus order", () => {
  assert.equal(engineeringW26Lessons.length, 3);
  assert.deepEqual(
    engineeringW26Lessons.map((l) => l.id),
    ["processes", "tolerances", "dfm"],
  );
  assert.deepEqual(
    engineeringW26Lessons.map((l) => l.index),
    [16, 17, 18],
  );
  for (const l of engineeringW26Lessons) assert.equal(l.track, "engineering");
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
  for (const l of engineeringW26Lessons) {
    assert.ok(lessons.includes(l), `week-26 lesson ${l.id} must be in lessons`);
  }
});

test("no duplicate lesson ids across the catalog", () => {
  const seen = new Set<string>();
  for (const lesson of lessons) {
    assert.ok(!seen.has(`${lesson.track}/${lesson.id}`), `duplicate ${lesson.track}/${lesson.id}`);
    seen.add(`${lesson.track}/${lesson.id}`);
  }
});

test("week-26 lessons satisfy the lesson contract", () => {
  for (const lesson of engineeringW26Lessons) {
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
      lesson.bench === "tolstack" || lesson.bench === "procchoice",
      `${lesson.id}: bench must be registered`,
    );
    assert.ok(lesson.prompt.trim().length > 0, `${lesson.id}: prompt must exist`);
    assert.ok(lesson.note.trim().length > 0, `${lesson.id}: note must exist`);
    assert.ok(lesson.minutes > 0, `${lesson.id}: minutes positive`);
  }
  assert.equal(
    engineeringW26Lessons.find((l) => l.id === "tolerances")!.bench,
    "tolstack",
  );
  assert.equal(
    engineeringW26Lessons.find((l) => l.id === "processes")!.bench,
    "procchoice",
  );
  assert.equal(engineeringW26Lessons.find((l) => l.id === "dfm")!.bench, "procchoice");
});

test("week-26 bench ids are registered in the bench index", () => {
  const indexSource = readFileSync(join(here, "..", "components", "bench", "index.tsx"), "utf8");
  const registered = new Set(
    [...indexSource.matchAll(/case\s+"([\w-]+)"/g)].map((m) => m[1]),
  );
  for (const lesson of engineeringW26Lessons) {
    assert.ok(
      registered.has(lesson.bench),
      `bench id "${lesson.bench}" from ${lesson.id} must have a case in bench/index.tsx`,
    );
  }
  const labsSource = readFileSync(
    join(here, "..", "components", "bench", "engineering-w26-labs.tsx"),
    "utf8",
  );
  assert.ok(labsSource.includes("export function TolStackBench"), "TolStackBench must be exported");
  assert.ok(labsSource.includes("export function ProcChoiceBench"), "ProcChoiceBench must be exported");
});

test("stack arithmetic reproduces the lesson's worked numbers", () => {
  assert.equal(worstCaseStack(LESSON_STACK), 0.25);
  const rss = rssStack(LESSON_STACK);
  assert.ok(Math.abs(rss - 0.15) < 1e-9, `RSS should be 0.15, got ${rss}`);
  // 100.20 mm cavity against 100.00 nominal: worst-case 100.25 fails, RSS 100.15 passes
  assert.equal(stackVerdict(0.2, 0.25, 0.15), "passes-rss-only");
  assert.equal(stackVerdict(0.3, 0.25, 0.15), "passes-worst-case");
  assert.equal(stackVerdict(0.1, 0.25, 0.15), "fails");
});

test("fit classification matches the lesson's worked cases", () => {
  const clearance = classifyFit({ holeMin: 25.0, holeMax: 25.05, shaftMin: 24.96, shaftMax: 25.0 });
  assert.equal(clearance.kind, "clearance");
  assert.ok(Math.abs(clearance.maxClearance - 0.09) < 1e-9);
  assert.ok(Math.abs(clearance.minClearance - 0.0) < 1e-9);

  const interference = classifyFit({ holeMin: 25.0, holeMax: 25.02, shaftMin: 25.02, shaftMax: 25.05 });
  assert.equal(interference.kind, "interference");
  assert.ok(Math.abs(interference.maxClearance - 0.0) < 1e-9);
  assert.ok(Math.abs(interference.minClearance - -0.05) < 1e-9);

  const transition = classifyFit({ holeMin: 25.0, holeMax: 25.04, shaftMin: 24.99, shaftMax: 25.02 });
  assert.equal(transition.kind, "transition");
  assert.ok(Math.abs(transition.maxClearance - 0.05) < 1e-9);
  assert.ok(Math.abs(transition.minClearance - -0.02) < 1e-9);
});

test("process screening reproduces the lesson's bracket verdict", () => {
  const screenings = screenProcesses({ material: "aluminum 6061", volume: 500, tightestTolMm: 0.05 });
  assert.equal(screenings.length, PROCESSES.length);
  const byId = new Map(screenings.map((s) => [s.process.id, s]));

  const cnc = byId.get("cnc-mill")!;
  assert.ok(cnc.viable, "CNC milling must clear all screens for the bracket");
  assert.ok(cnc.reasons.some((r) => r.includes("holds")), "CNC reasons must cite tolerance");

  const dieCast = byId.get("die-cast")!;
  assert.ok(!dieCast.viable, "die casting must fail the tolerance screen");
  assert.ok(
    dieCast.reasons.some((r) => r.includes("cannot hold")),
    "die-cast rejection must name tolerance",
  );

  const fdm = byId.get("fdm")!;
  assert.ok(!fdm.viable, "FDM must fail the tolerance screen");

  const grinding = byId.get("grinding")!;
  assert.ok(!grinding.viable, "grinding must fail the material screen for aluminum");

  // High-volume housing: die casting wins, CNC is uneconomical at 20k units.
  const housing = screenProcesses({ material: "aluminum", volume: 20000, tightestTolMm: 0.15 });
  const housingById = new Map(housing.map((s) => [s.process.id, s]));
  assert.ok(housingById.get("die-cast")!.viable, "die casting must clear the housing screens");
  const housingCnc = housingById.get("cnc-mill")!;
  assert.ok(!housingCnc.viable, "CNC must be uneconomical at 20,000 units");
  assert.ok(
    housingCnc.reasons.some((r) => r.includes("uneconomical")),
    "CNC rejection must name volume economics",
  );

  // One-off steel jig: CNC clears; die casting fails material.
  const jig = screenProcesses({ material: "steel", volume: 3, tightestTolMm: 0.1 });
  const jigById = new Map(jig.map((s) => [s.process.id, s]));
  assert.ok(jigById.get("cnc-mill")!.viable, "CNC milling must clear the jig screens");
  assert.ok(!jigById.get("die-cast")!.viable, "die casting must fail material for steel");
});
