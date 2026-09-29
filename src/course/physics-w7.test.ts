/**
 * Validation for the Physics 101 Week 7 batch (scout/physics-w7).
 *
 * Run with: node --experimental-strip-types --test src/course/physics-w7.test.ts
 * from the repo root. Imports are relative "./x.ts" so Node's type-stripping
 * resolves them without the @/ alias.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { physicsW7Lessons } from "./physics-w7.ts";
import {
  ELASTIC_MATS,
  allowableStress,
  areaCircle,
  areaRect,
  axialDelta,
  cantileverDelta,
  factorOfSafety,
  inertiaCircle,
  inertiaRect,
  measuredDeflection,
  percentError,
  seededNoise,
  strain,
  stress,
} from "./elasticity.ts";
import { lessons, lessonsFor } from "./catalog.ts";

const here = dirname(fileURLToPath(import.meta.url));

const approx = (actual: number, expected: number, rel = 1e-6, msg = "") => {
  assert.ok(
    Math.abs(actual - expected) <= rel * Math.max(1, Math.abs(expected)),
    `${msg} expected ~${expected}, got ${actual}`,
  );
};

test("week 7 opens the physics track in syllabus order", () => {
  assert.equal(physicsW7Lessons.length, 3);
  assert.deepEqual(
    physicsW7Lessons.map((l) => l.id),
    ["elastic", "bending", "fos"],
  );
  assert.deepEqual(
    physicsW7Lessons.map((l) => l.index),
    [19, 20, 21],
  );
  for (const l of physicsW7Lessons) assert.equal(l.track, "physics");
  const physics = lessonsFor("physics");
  assert.equal(physics.length, 30, "physics track must hold weeks 1-10");
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
    ],
  );
  assert.deepEqual(
    physics.map((l) => l.index),
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
  );
  for (const l of physicsW7Lessons) {
    assert.ok(lessons.includes(l), `week-7 lesson ${l.id} must be in lessons`);
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

test("week-7 lessons keep the lesson contract", () => {
  for (const lesson of physicsW7Lessons) {
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

test("week-7 bench ids are registered in the bench index", () => {
  const indexSource = readFileSync(join(here, "..", "components", "bench", "index.tsx"), "utf8");
  const registered = new Set(
    [...indexSource.matchAll(/case\s+"([\w-]+)"/g)].map((m) => m[1]),
  );
  for (const lesson of physicsW7Lessons) {
    assert.ok(
      registered.has(lesson.bench),
      `bench id "${lesson.bench}" from ${lesson.id} must have a case in bench/index.tsx`,
    );
  }
  const labs = readFileSync(join(here, "..", "components", "bench", "physics-labs.tsx"), "utf8");
  assert.ok(/export function StressStrainBench/.test(labs), "physics-labs.tsx must export StressStrainBench");
  assert.ok(/export function BeamDeflectionBench/.test(labs), "physics-labs.tsx must export BeamDeflectionBench");
});

test("elastic material table holds teaching values", () => {
  const byId = Object.fromEntries(ELASTIC_MATS.map((m) => [m.id, m]));
  approx(byId.steel.e, 200e9, 1e-9, "steel E");
  approx(byId.al.e, 69e9, 1e-9, "aluminum E");
  approx(byId.wood.e, 10e9, 1e-9, "wood E");
  assert.ok(byId.steel.yield > 0 && byId.al.yield > 0 && byId.wood.yield > 0);
});

test("stress, strain, and areas follow their definitions", () => {
  // σ = F/A: 20 kN on 100 mm² = 200 MPa
  approx(stress(20000, 100e-6), 200e6, 1e-9, "stress 20 kN / 100 mm²");
  // ε = ΔL/L is dimensionless
  approx(strain(0.00191, 2), 0.000955, 1e-9, "strain");
  approx(areaCircle(0.01), (Math.PI * 0.01 * 0.01) / 4, 1e-12, "circle area");
  approx(areaRect(0.04, 0.02), 0.0008, 1e-12, "rect area");
});

test("axial delta reproduces the lesson's worked rod", () => {
  // 10 mm steel rod, 2 m, 15 kN → σ = 191 MPa, δ = 1.91 mm
  const A = areaCircle(0.01);
  const sigma = stress(15000, A);
  approx(sigma / 1e6, 191, 1e-3, "rod stress MPa");
  assert.ok(sigma < 250e6, "rod stress must sit under the 250 MPa teaching yield");
  const delta = axialDelta(15000, 2, A, 200e9);
  approx(delta * 1000, 1.91, 1e-3, "rod elongation mm");
});

test("second moments of area match the closed forms", () => {
  approx(inertiaRect(0.025, 0.002), (0.025 * 0.002 ** 3) / 12, 1e-9, "rect I");
  approx(inertiaCircle(0.025), (Math.PI * 0.025 ** 4) / 64, 1e-9, "circle I");
  // doubling depth multiplies I by 8
  approx(inertiaRect(0.025, 0.004) / inertiaRect(0.025, 0.002), 8, 1e-9, "depth cubed");
});

test("cantilever delta reproduces the lesson's ruler and the 8x scaling", () => {
  // steel ruler: 300 mm span, 25 mm wide, 2 mm thick, 5 N tip → 13.5 mm
  const I = inertiaRect(0.025, 0.002);
  const delta = cantileverDelta(5, 0.3, 200e9, I);
  approx(delta * 1000, 13.5, 1e-3, "ruler droop mm");
  // halving the thickness divides I by 8, multiplying δ by 8
  const thin = cantileverDelta(5, 0.3, 200e9, inertiaRect(0.025, 0.001));
  approx(thin / delta, 8, 1e-9, "thickness halved → 8x sag");
  // doubling the span multiplies δ by 8
  approx(cantileverDelta(5, 0.6, 200e9, I) / delta, 8, 1e-9, "span doubled → 8x sag");
});

test("factor of safety reproduces the lesson's hoist", () => {
  // 45 kN ultimate, 12 kN working → n = 3.75; 60 mm² → allowable 200 MPa
  approx(factorOfSafety(45000, 12000), 3.75, 1e-9, "hoist n");
  const ultimate = stress(45000, 60e-6);
  approx(ultimate / 1e6, 750, 1e-6, "hoist ultimate MPa");
  approx(allowableStress(ultimate, 3.75) / 1e6, 200, 1e-6, "hoist allowable MPa");
});

test("bending stress check reproduces the fos flat bar", () => {
  // 30 x 5 mm flat bar laid flat, 40 N at 200 mm: M = 8 N·m, c = 2.5 mm → 64 MPa
  const I = inertiaRect(0.03, 0.005);
  approx(I, 3.125e-10, 1e-9, "flat-bar I");
  const M = 40 * 0.2;
  const sigma = (M * 0.0025) / I;
  approx(sigma / 1e6, 64, 1e-9, "flat-bar root stress MPa");
  const allow = allowableStress(250e6, 2.5);
  approx(allow / 1e6, 100, 1e-9, "flat-bar allowable MPa");
  assert.ok(sigma < allow, "64 MPa passes the 100 MPa allowable");
  approx(factorOfSafety(250e6, sigma), 3.90625, 1e-9, "flat-bar n against yield");
  // distractors: full thickness as c, load as moment, bar on edge
  approx(((M * 0.005) / I) / 1e6, 128, 1e-9, "c = h slip");
  approx(((40 * 0.0025) / I) / 1e6, 320, 1e-9, "no lever arm slip");
  approx(((M * 0.015) / inertiaRect(0.005, 0.03)) / 1e6, 10.6667, 1e-4, "on-edge slip");
});

test("seeded noise is deterministic and bounded", () => {
  const a = seededNoise("steel|rect|40|20|25|1|100");
  const b = seededNoise("steel|rect|40|20|25|1|100");
  assert.equal(a, b, "same seed must give the same noise");
  assert.ok(a >= -1 && a <= 1, "noise must sit in [-1, 1]");
  const c = seededNoise("al|rect|40|20|25|1|100");
  assert.ok(c >= -1 && c <= 1, "other seed must also sit in [-1, 1]");
});

test("measured deflection carries the named bias", () => {
  const m = measuredDeflection(6.25, "steel|rect|40|20|25|1|100");
  // support compliance ≈ +9%, scatter ±5% → measured within [1.04, 1.14] × model
  assert.ok(m > 6.25 * 1.03 && m < 6.25 * 1.15, `measured ${m} must exceed the model by the named bias`);
  assert.equal(measuredDeflection(6.25, "steel|rect|40|20|25|1|100"), m, "measurement must be stable per seed");
});

test("percent error has the right sign convention", () => {
  approx(percentError(4.2, 4.9), ((4.2 - 4.9) / 4.9) * 100, 1e-9, "under-prediction is negative");
  approx(percentError(4.9, 4.2), ((4.9 - 4.2) / 4.2) * 100, 1e-9, "over-prediction is positive");
  assert.equal(percentError(5, 5), 0, "exact prediction has zero error");
});
