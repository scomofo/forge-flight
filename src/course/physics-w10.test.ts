/**
 * Validation for the Physics 101 Week 10 batch (scout/physics-w10).
 *
 * Run with: node --experimental-strip-types --test src/course/physics-w10.test.ts
 * from the repo root. Imports are relative "./x.ts" so Node's type-stripping
 * resolves them without the @/ alias.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { physicsW10Lessons } from "./physics-w10.ts";
import {
  MASTERY_BANK,
  MASTERY_GATE_PCT,
  aspectRatio,
  correctionsRequired,
  glideRange,
  masteryPass,
  masteryPct,
  polarAt,
  referenceGliderSynthesis,
  sinkRate,
  speedDeficitDrop,
  staticMarginPct,
  steadyGlide,
  towEnergy,
  trimSpeed,
  wingArea,
} from "./synthesis.ts";
import { lessons } from "./catalog.ts";

const here = dirname(fileURLToPath(import.meta.url));

function closeTo(actual: number, expected: number, tol: number, name: string) {
  assert.ok(
    Math.abs(actual - expected) <= tol,
    `${name}: expected ${expected} ± ${tol}, got ${actual}`,
  );
}

test("week 10 opens the physics track in syllabus order", () => {
  assert.equal(physicsW10Lessons.length, 3);
  assert.deepEqual(
    physicsW10Lessons.map((l) => l.id),
    ["synthmethod", "towlaunch", "masterycheck"],
  );
  assert.deepEqual(
    physicsW10Lessons.map((l) => l.index),
    [28, 29, 30],
  );
  for (const l of physicsW10Lessons) assert.equal(l.track, "physics");
  const physics = lessons.filter((l) => l.track === "physics");
  assert.equal(physics.length, 36, "physics track must hold weeks 1-10 plus the 6 legacy lessons");
  assert.deepEqual(
    physics.map((l) => l.id),
    [
      "measure",
      "sigfigs",
      "fermi",
      "veccomp",
      "kingraphs",
      "projectiles",
      "newton",
      "contact",
      "fbd",
      "work",
      "potential",
      "power",
      "impulse",
      "conserve",
      "collisions",
      "torque",
      "rotation",
      "equilibrium",
      "elastic",
      "bending",
      "fos",
      "pressure",
      "movingfluids",
      "lift",
      "shm",
      "reswaves",
      "thermal",
      "synthmethod",
      "towlaunch",
      "masterycheck",
      "vectors",
      "kinematics",
      "forces",
      "energy",
      "momentum",
      "waves",
    ],
  );
  assert.deepEqual(
    physics.map((l) => l.index),
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36],
  );
  for (const l of physicsW10Lessons) {
    assert.ok(lessons.includes(l), `week-10 lesson ${l.id} must be in lessons`);
  }
});

test("no duplicate lesson ids across the catalog", () => {
  const seen = new Set<string>();
  for (const l of lessons) {
    const key = `${l.track}/${l.id}`;
    assert.ok(!seen.has(key), `duplicate lesson ${key}`);
    seen.add(key);
  }
});

test("week-10 lessons keep the lesson contract", () => {
  for (const lesson of physicsW10Lessons) {
    for (const field of ["start", "use", "example"] as const) {
      const portions = lesson[field].split(" || ");
      assert.equal(portions.length, 3, `${lesson.id}.${field} must have exactly 3 portions`);
      for (const p of portions) assert.ok(p.trim().length > 0, `${lesson.id}.${field} portion must be non-empty`);
    }
    assert.equal(lesson.ideas.length, 3, `${lesson.id} must have exactly 3 ideas`);
    for (const idea of lesson.ideas) {
      assert.ok(idea.heading.trim().length > 0);
      assert.ok(idea.body.trim().length > 0);
    }
    assert.equal(lesson.checks.length, 4, `${lesson.id} must have exactly 4 checks`);
    for (const check of lesson.checks) {
      assert.ok(
        Number.isInteger(check.answer) && check.answer >= 0 && check.answer <= 3,
        `${lesson.id} check answer index out of range`,
      );
      assert.equal(check.options.length, 4, `${lesson.id} check must have 4 options`);
      assert.ok(check.prompt.trim().length > 0);
      assert.ok(check.why.trim().length > 0, `${lesson.id} check must explain itself`);
    }
    assert.ok(lesson.bench.trim().length > 0, `${lesson.id} must name a bench`);
    assert.ok(lesson.prompt.trim().length > 0, `${lesson.id} must have a bench task line`);
    assert.ok(lesson.note.trim().length > 0, `${lesson.id} must have a note`);
    assert.ok(lesson.minutes > 0, `${lesson.id} must state minutes`);
  }
});

test("week-10 bench ids are registered in the bench index", () => {
  const indexSource = readFileSync(join(here, "..", "components", "bench", "index.tsx"), "utf8");
  const registered = new Set(
    [...indexSource.matchAll(/case\s+"([\w-]+)"/g)].map((m) => m[1]),
  );
  for (const lesson of physicsW10Lessons) {
    assert.ok(
      registered.has(lesson.bench),
      `bench id "${lesson.bench}" from ${lesson.id} must have a case in bench/index.tsx`,
    );
  }
  const labs = readFileSync(join(here, "..", "components", "bench", "physics-labs.tsx"), "utf8");
  for (const name of ["SynthLedgerBench", "GliderLabBench", "MasteryBench"]) {
    assert.ok(
      new RegExp(`export function ${name}\\b`).test(labs),
      `physics-labs.tsx must export ${name}`,
    );
  }
});

test("glider chain geometry is consistent", () => {
  closeTo(wingArea(0.5, 0.09), 0.045, 1e-12, "wing area");
  closeTo(aspectRatio(0.5, 0.09), 5.5555556, 1e-6, "aspect ratio");
});

test("drag polar reproduces the lesson's worked numbers", () => {
  const polar = polarAt(4, 0.03, 5.5555556, 0.85);
  closeTo(polar.cl, 0.322536, 1e-4, "CL at 4°");
  closeTo(polar.cd, 0.037012, 1e-5, "CD");
  closeTo(polar.ld, 8.714295, 1e-3, "L/D");
});

test("tow-launch chain pins every worked number", () => {
  const s = referenceGliderSynthesis();
  closeTo(s.weightN, 0.981, 1e-9, "weight");
  closeTo(s.trimSpeedMs, 10.504758, 1e-3, "trim speed");
  closeTo(s.gammaDeg, 6.546284, 1e-3, "glide angle");
  closeTo(s.liftN, 0.9746, 1e-3, "lift");
  closeTo(s.dragN, 0.1118, 1e-3, "drag");
  closeTo(s.rangeM, 261.428859, 1e-2, "range from 30 m");
  closeTo(s.sinkMs, 1.197603, 1e-3, "sink rate");
  closeTo(s.marginPct, 16.666667, 1e-3, "static margin %");
  closeTo(s.tow.keJ, 3.2, 1e-9, "tow KE");
  closeTo(s.tow.peJ, 29.43, 1e-9, "tow PE");
  closeTo(s.tow.totalJ, 32.63, 1e-9, "tow total");
  closeTo(s.deficitDropM, 2.362382, 1e-3, "speed-buy altitude");
});

test("synthesis helpers behave at the limits", () => {
  // Still air, infinite L/D: range is unbounded, sink vanishes.
  assert.equal(glideRange(30, 8.714295) > 260, true);
  closeTo(sinkRate(10.5, 1e9), 0, 1e-6, "infinite L/D sinks nothing");
  // Released at trim: no altitude spent buying speed.
  assert.equal(speedDeficitDrop(10.5, 10.5), 0);
  assert.equal(speedDeficitDrop(12, 10.5), 0);
  // Steady glide at L/D -> infinity is level flight: drag -> 0, gamma -> 0.
  const level = steadyGlide(0.981, 1e9);
  closeTo(level.dragN, 0, 1e-6, "level drag");
  closeTo(level.gammaDeg, 0, 1e-6, "level gamma");
  closeTo(level.liftN, 0.981, 1e-6, "level lift = weight");
  // Trim speed from L = W directly.
  closeTo(trimSpeed(0.981, 1.225, 0.045, 0.322536), 10.504758, 1e-3, "trim speed direct");
  // Static margin: neutral point behind CG is positive, in the 5–25% band.
  const m = staticMarginPct(135, 120, 90);
  assert.ok(m > 5 && m < 25, `margin ${m}% must sit in the 5–25% band`);
  // Tow ledger balances.
  const tow = towEnergy(0.1, 8, 30);
  closeTo(tow.totalJ, tow.keJ + tow.peJ, 1e-12, "tow ledger balances");
});

test("mastery bank is weighted as the syllabus demands", () => {
  assert.equal(MASTERY_BANK.length, 12);
  const topics = MASTERY_BANK.map((m) => m.topic);
  assert.equal(topics.filter((t) => t === "conservation").length, 4);
  assert.equal(topics.filter((t) => t === "fbd").length, 4);
  assert.equal(topics.filter((t) => t === "mixed").length, 4);
  const ids = new Set(MASTERY_BANK.map((m) => m.id));
  assert.equal(ids.size, 12, "mastery item ids must be unique");
  for (const m of MASTERY_BANK) {
    assert.ok(m.prompt.trim().length > 0);
    assert.equal(m.options.length, 4);
    assert.ok(Number.isInteger(m.answer) && m.answer >= 0 && m.answer <= 3);
    assert.ok(m.why.trim().length > 0, `${m.id} must explain itself`);
  }
});

test("mastery gate enforces the 70% block rule", () => {
  assert.equal(MASTERY_GATE_PCT, 70);
  assert.equal(masteryPct(9, 12), 75);
  assert.ok(Math.abs(masteryPct(8, 12) - 66.6667) < 0.01);
  assert.equal(masteryPass(9, 12), true, "9/12 = 75% clears the gate");
  assert.equal(masteryPass(8, 12), false, "8/12 = 66.7% does not clear the gate");
  assert.equal(masteryPass(12, 12), true);
  assert.equal(masteryPass(0, 12), false);
  assert.equal(masteryPass(0, 0), false, "no sitting is not a pass");
});

test("corrections are required exactly for missed conservation/FBD items", () => {
  const cons = MASTERY_BANK.filter((m) => m.topic === "conservation");
  const fbd = MASTERY_BANK.filter((m) => m.topic === "fbd");
  const mixed = MASTERY_BANK.filter((m) => m.topic === "mixed");
  const required = correctionsRequired([...cons.slice(0, 1), ...fbd.slice(0, 2), ...mixed.slice(0, 2)]);
  assert.equal(required.length, 3, "only the conservation + FBD misses require corrections");
  assert.ok(required.every((m) => m.topic === "conservation" || m.topic === "fbd"));
  assert.deepEqual(correctionsRequired([]), []);
  assert.deepEqual(
    correctionsRequired(mixed).map((m) => m.id),
    [],
    "mixed misses need no correction",
  );
});
