/**
 * Validation for the Engineering 101 Week 27 batch (scout/engineering-w27).
 *
 * Run with: node --experimental-strip-types --test src/course/engineering-w27.test.ts
 * from the repo root. Imports are relative "./x.ts" so Node's type-stripping
 * resolves them without the @/ alias.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { engineeringW27Lessons } from "./engineering-w27.ts";
import {
  confidenceInterval95,
  factorialRuns,
  grubbsCritical,
  grubbsScore,
  gravityFromSlope,
  linearFit,
  mainEffect,
  mean,
  planSummary,
  randomizedOrder,
  sampleStd,
  tCritical95,
} from "./experiments.ts";
import { lessonsFor } from "./catalog.ts";

const here = dirname(fileURLToPath(import.meta.url));

const NEW_BENCHES = ["doe", "labreport"] as const;

test("week 27 opens the engineering track in syllabus order", () => {
  assert.equal(engineeringW27Lessons.length, 3);
  assert.deepEqual(
    engineeringW27Lessons.map((l) => l.id),
    ["doeplan", "smallsample", "honestgraph"],
  );
  assert.deepEqual(
    engineeringW27Lessons.map((l) => l.index),
    [19, 20, 21],
  );
  for (const l of engineeringW27Lessons) assert.equal(l.track, "engineering");
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
});

test("lesson contract: three-part sections, three ideas, four valid checks", () => {
  for (const lesson of engineeringW27Lessons) {
    for (const field of ["start", "use", "example"] as const) {
      const parts = lesson[field].split(" || ");
      assert.equal(parts.length, 3, `${lesson.id}.${field} must have 3 parts`);
      for (const p of parts) assert.ok(p.trim().length > 0);
    }
    assert.equal(lesson.ideas.length, 3, `${lesson.id} needs exactly 3 ideas`);
    assert.equal(lesson.checks.length, 4, `${lesson.id} needs exactly 4 checks`);
    for (const check of lesson.checks) {
      assert.equal(check.options.length, 4);
      assert.ok(check.answer >= 0 && check.answer <= 3);
      assert.ok(check.why.trim().length > 20, `${lesson.id} check needs a real explanation`);
    }
    assert.ok(
      (NEW_BENCHES as readonly string[]).includes(lesson.bench),
      `${lesson.id} bench must be one of the new benches`,
    );
    assert.ok(lesson.lede.trim().length > 0);
    assert.ok(lesson.prompt.includes(" || "), `${lesson.id} prompt should be multi-part`);
  }
});

test("new benches are registered in the bench index", () => {
  const indexSrc = readFileSync(join(here, "..", "components", "bench", "index.tsx"), "utf8");
  for (const bench of NEW_BENCHES) {
    assert.ok(
      indexSrc.includes(`case "${bench}"`),
      `bench index must handle "${bench}"`,
    );
  }
  assert.ok(indexSrc.includes("engineering-w27-labs"), "bench index must import the w27 labs");
});

test("thrust worked numbers: mean, sample std, 95% interval", () => {
  const xs = [19.4, 19.8, 19.5, 19.9, 20.4];
  assert.ok(Math.abs(mean(xs) - 19.8) < 1e-9);
  assert.ok(Math.abs(sampleStd(xs) - 0.3937) < 1e-3);
  assert.equal(tCritical95(4), 2.776);
  const ci = confidenceInterval95(xs);
  assert.ok(Math.abs(ci.mean - 19.8) < 1e-9);
  assert.ok(Math.abs(ci.halfWidth - 0.489) < 0.005, `half-width ${ci.halfWidth}`);
  // The lesson reports 19.80 ± 0.49 kN.
  assert.ok(Math.abs(ci.lo - 19.31) < 0.01);
  assert.ok(Math.abs(ci.hi - 20.29) < 0.01);
});

test("grubbs screening keeps the 20.4 kN point honestly", () => {
  const xs = [19.4, 19.8, 19.5, 19.9, 20.4];
  const g = grubbsScore(xs, 20.4);
  assert.ok(Math.abs(g - 1.524) < 0.005, `grubbs score ${g}`);
  assert.equal(grubbsCritical(5), 1.715);
  assert.ok(g < 1.715, "not excludable");
  const rig6 = [19.4, 19.8, 19.5, 19.9, 20.4, 19.7];
  const ci6 = confidenceInterval95(rig6);
  assert.ok(Math.abs(ci6.mean - 19.7833) < 1e-3);
  assert.ok(Math.abs(ci6.halfWidth - 0.37) < 0.01, `rig6 half-width ${ci6.halfWidth}`);
  assert.ok(grubbsScore(rig6, 20.4) < (grubbsCritical(6) as number));
});

test("pendulum fit recovers the lesson's worked numbers", () => {
  const fit = linearFit([0.25, 0.5, 0.75, 1.0], [1.01, 2.02, 3.03, 4.06]);
  assert.ok(Math.abs(fit.slope - 4.064) < 1e-3, `slope ${fit.slope}`);
  assert.ok(Math.abs(fit.intercept - -0.01) < 1e-3, `intercept ${fit.intercept}`);
  assert.ok(fit.r2 > 0.9999);
  assert.ok(fit.residuals.every((r) => Math.abs(r) < 0.01), "residuals are static");
  const g = gravityFromSlope(fit.slope);
  assert.ok(Math.abs(g - 9.72) < 0.02, `g ${g}`);
});

test("factorial plan arithmetic", () => {
  assert.equal(factorialRuns(2, "full"), 4);
  assert.equal(factorialRuns(3, "full"), 8);
  assert.equal(factorialRuns(3, "half"), 4);
  assert.throws(() => factorialRuns(2, "half"), /at least 3 factors/);
  const plan = planSummary({
    factors: ["Glue", "Cure time"],
    levels: [
      ["Standard epoxy", "Toughened epoxy"],
      ["2 h", "24 h"],
    ],
    fraction: "full",
    centerReplicates: 2,
    blockOn: "rig drift",
  });
  assert.equal(plan.cornerRuns, 4);
  assert.equal(plan.totalRuns, 6);
  assert.equal(plan.blocks, "rig drift");
  // Lesson's worked main effect for glue A.
  assert.ok(Math.abs(mainEffect(10.8, 8.2) - 1.3) < 1e-9);
});

test("randomized run order is deterministic per seed and a permutation", () => {
  const a = randomizedOrder([0, 1, 2, 3], 7);
  const b = randomizedOrder([0, 1, 2, 3], 7);
  assert.deepEqual(a, b);
  assert.deepEqual([...a].sort((x, y) => x - y), [0, 1, 2, 3]);
});
