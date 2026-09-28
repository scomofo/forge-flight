/**
 * Validation for the Physics 101 Week 5 batch (scout/physics-w5).
 *
 * Run with: node --experimental-strip-types --test src/course/physics-w5.test.ts
 * from the repo root. Imports are relative "./x.ts" so Node's type-stripping
 * resolves them without the @/ alias.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { physicsW5Lessons } from "./physics-w5.ts";
import {
  avgForce,
  centerOfMass,
  deltaP,
  elastic1D,
  impulse,
  kineticEnergy,
  momentum,
  restitution1D,
  restitutionFromData,
  stick1D,
  totalKE,
  totalMomentum,
} from "./momentum.ts";
import { lessons, lessonsFor } from "./catalog.ts";

const here = dirname(fileURLToPath(import.meta.url));

test("week 5 opens the physics track in syllabus order", () => {
  assert.equal(physicsW5Lessons.length, 3);
  assert.deepEqual(
    physicsW5Lessons.map((l) => l.id),
    ["impulse", "conserve", "collisions"],
  );
  assert.deepEqual(
    physicsW5Lessons.map((l) => l.index),
    [13, 14, 15],
  );
  for (const l of physicsW5Lessons) assert.equal(l.track, "physics");
  const physics = lessonsFor("physics");
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
  for (const l of physicsW5Lessons) {
    assert.ok(lessons.includes(l), `week-5 lesson ${l.id} must be in lessons`);
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

test("week-5 lessons keep the lesson contract", () => {
  for (const lesson of physicsW5Lessons) {
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

test("week-5 bench ids are registered in the bench index", () => {
  const indexSource = readFileSync(join(here, "..", "components", "bench", "index.tsx"), "utf8");
  const registered = new Set(
    [...indexSource.matchAll(/case\s+"([\w-]+)"/g)].map((m) => m[1]),
  );
  for (const lesson of physicsW5Lessons) {
    assert.ok(
      registered.has(lesson.bench),
      `bench id "${lesson.bench}" from ${lesson.id} must have a case in bench/index.tsx`,
    );
  }
  const labsSource = readFileSync(join(here, "..", "components", "bench", "physics-labs.tsx"), "utf8");
  for (const [id, name] of [
    ["impactlab", "ImpactLab"],
    ["cmexplore", "CmExplore"],
    ["restitute", "RestitutionLab"],
  ] as const) {
    assert.ok(
      new RegExp(`export function ${name}Bench`).test(labsSource),
      `physics-labs.tsx must export the ${id} bench component`,
    );
  }
});

test("impulse lesson worked numbers: the baseball catch", () => {
  assert.equal(deltaP(0.15, 40, 0), -6.0);
  assert.equal(impulse(50, 0.12), 6.0);
  assert.ok(Math.abs(avgForce(6.0, 0.12) - 50) < 1e-9);
  assert.ok(Math.abs(avgForce(6.0, 0.01) - 600) < 1e-9);
});

test("conservation lesson worked numbers: the skaters and the balance point", () => {
  assert.equal(totalMomentum([{ m: 70, v: 2.0 }, { m: 50, v: -2.8 }]), 0);
  assert.equal(centerOfMass([{ m: 3, x: 0 }, { m: 1, x: 8 }]), 2);
  assert.equal(centerOfMass([{ m: 70, x: -2 }, { m: 50, x: 2.8 }]), 0);
});

test("elastic1D solves the textbook 2-vs-3 kg collision", () => {
  const { u1, u2 } = elastic1D(2, 4, 3, 0);
  assert.ok(Math.abs(u1 - -0.8) < 1e-9, `u1 = ${u1}`);
  assert.ok(Math.abs(u2 - 3.2) < 1e-9, `u2 = ${u2}`);
  const before = totalKE([{ m: 2, v: 4 }, { m: 3, v: 0 }]);
  const after = totalKE([{ m: 2, v: u1 }, { m: 3, v: u2 }]);
  assert.ok(Math.abs(before - 16) < 1e-9);
  assert.ok(Math.abs(after - before) < 1e-9, "elastic collision conserves kinetic energy");
});

test("stick1D and the energy cost of sticking", () => {
  const v = stick1D(2, 4, 3, 0);
  assert.ok(Math.abs(v - 1.6) < 1e-9);
  const lost = 16 - totalKE([{ m: 5, v }]);
  assert.ok(Math.abs(lost - 9.6) < 1e-9);
});

test("restitution1D interpolates between elastic and stick", () => {
  const e1 = restitution1D(2, 4, 3, 0, 1);
  const el = elastic1D(2, 4, 3, 0);
  assert.ok(Math.abs(e1.u1 - el.u1) < 1e-9 && Math.abs(e1.u2 - el.u2) < 1e-9);
  const e0 = restitution1D(2, 4, 3, 0, 0);
  assert.ok(Math.abs(e0.u1 - e0.u2) < 1e-9, "e = 0 must share one velocity");
  assert.ok(Math.abs(e0.u1 - stick1D(2, 4, 3, 0)) < 1e-9);
  // every e conserves momentum
  for (const e of [0, 0.25, 0.6, 1]) {
    const r = restitution1D(2, 4, 3, 0, e);
    const pB = totalMomentum([{ m: 2, v: 4 }, { m: 3, v: 0 }]);
    const pA = totalMomentum([{ m: 2, v: r.u1 }, { m: 3, v: r.u2 }]);
    assert.ok(Math.abs(pA - pB) < 1e-9, `momentum must hold at e = ${e}`);
  }
});

test("restitutionFromData recovers the bench's e = 0.6 impact", () => {
  assert.ok(Math.abs(restitutionFromData(0.8, -0.5, 0.02, 0.8) - 0.6) < 1e-9);
});

test("momentum and kinetic energy basics", () => {
  assert.equal(momentum(2, 3), 6);
  assert.equal(kineticEnergy(2, 3), 9);
  assert.equal(impulse(60, 0.1), 6);
});
