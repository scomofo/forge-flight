/**
 * Validation for the Physics 101 Week 3 batch (scout/physics-w3).
 *
 * Run with: node --experimental-strip-types --test src/course/physics-w3.test.ts
 * from the repo root. Imports are relative "./x.ts" so Node's type-stripping
 * resolves them without the @/ alias.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { physicsW3Lessons } from "./physics-w3.ts";
import {
  FRICTION_PAIRS,
  G,
  atwood,
  blockOnIncline,
  frictionPair,
  inclineComponents,
  muFromSlipAngle,
  springForce,
} from "./forces.ts";
import { lessons, lessonsFor } from "./catalog.ts";

const here = dirname(fileURLToPath(import.meta.url));
const approx = (a: number, b: number, tol = 1e-9) => Math.abs(a - b) <= tol;

test("week 3 opens the physics track in syllabus order", () => {
  assert.equal(physicsW3Lessons.length, 3);
  assert.deepEqual(
    physicsW3Lessons.map((l) => l.id),
    ["newton", "contact", "fbd"],
  );
  assert.deepEqual(
    physicsW3Lessons.map((l) => l.index),
    [7, 8, 9],
  );
  for (const l of physicsW3Lessons) assert.equal(l.track, "physics");
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
  for (const l of physicsW3Lessons) {
    assert.ok(lessons.includes(l), `week-3 lesson ${l.id} must be in lessons`);
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

test("week-3 lessons keep the lesson contract", () => {
  for (const lesson of physicsW3Lessons) {
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

test("week-3 bench ids are registered in the bench index", () => {
  const indexSource = readFileSync(join(here, "..", "components", "bench", "index.tsx"), "utf8");
  const registered = new Set(
    [...indexSource.matchAll(/case\s+"([\w-]+)"/g)].map((m) => m[1]),
  );
  for (const lesson of physicsW3Lessons) {
    assert.ok(
      registered.has(lesson.bench),
      `bench id "${lesson.bench}" from ${lesson.id} must have a case in bench/index.tsx`,
    );
  }
  const labsSource = readFileSync(join(here, "..", "components", "bench", "physics-labs.tsx"), "utf8");
  assert.ok(/export function FrictionInclineBench/.test(labsSource), "physics-labs.tsx must export FrictionInclineBench");
  assert.ok(/export function FbdBuilderBench/.test(labsSource), "physics-labs.tsx must export FbdBuilderBench");
});

test("incline resolution matches the lesson's worked numbers", () => {
  // Lesson 2 example: 5.0 kg on a 30° incline.
  const { along, normal } = inclineComponents(5, 30);
  assert.ok(approx(along, 5 * G * 0.5, 1e-9), `downslope pull should be 24.525 N, got ${along}`);
  assert.ok(approx(normal, 5 * G * (Math.sqrt(3) / 2), 1e-9), `normal should be ~42.48 N, got ${normal}`);
});

test("slip-angle identity recovers the static coefficient", () => {
  // Wood on wood, μs = 0.5 → slip angle atan(0.5) ≈ 26.565°.
  assert.ok(approx(muFromSlipAngle(26.56505117707799), 0.5, 1e-9));
  for (const pair of FRICTION_PAIRS) {
    const recovered = muFromSlipAngle((Math.atan(pair.muS) * 180) / Math.PI);
    assert.ok(approx(recovered, pair.muS, 1e-9), `${pair.id}: slip angle must recover μs`);
    assert.ok(pair.muS >= pair.muK, `${pair.id}: static coefficient must not be below kinetic`);
  }
});

test("friction-pair table is sane and addressable", () => {
  assert.equal(FRICTION_PAIRS.length, 5);
  const wood = frictionPair("wood");
  assert.deepEqual([wood.muS, wood.muK], [0.5, 0.3]);
  assert.throws(() => frictionPair("unobtainium"), /unknown friction pair/);
});

test("block-on-incline model reproduces the lesson verdicts", () => {
  // Lesson 2: 5 kg, 30°, μs=0.4, μk=0.3 → slides at 2.36 m/s².
  const sliding = blockOnIncline(5, 30, 0.4, 0.3);
  assert.equal(sliding.state, "sliding");
  assert.ok(approx(sliding.accel, G * (0.5 - 0.3 * (Math.sqrt(3) / 2)), 1e-9), `a should be ~2.356 m/s², got ${sliding.accel}`);
  assert.ok(approx(sliding.friction, 0.3 * sliding.normal, 1e-9), "sliding friction must be μk·N");
  assert.ok(sliding.net > 0, "net downslope force must be positive while sliding");

  // Same block at 20°: downslope pull 16.8 N < 17.0 N budget → stuck.
  const stuck = blockOnIncline(5, 20, 0.4, 0.3);
  assert.equal(stuck.state, "stuck");
  assert.equal(stuck.accel, 0);
  assert.equal(stuck.net, 0);
  const { along } = inclineComponents(5, 20);
  assert.ok(approx(stuck.friction, along, 1e-9), "static friction must match the pull exactly");
});

test("atwood machine matches the lesson's worked numbers", () => {
  // Lesson 3 example: m₁=3 kg, m₂=5 kg.
  const { accel, tension } = atwood(3, 5);
  assert.ok(approx(accel, ((5 - 3) * G) / 8, 1e-9), `a should be ~2.4525 m/s², got ${accel}`);
  assert.ok(approx(tension, (2 * 3 * 5 * G) / 8, 1e-9), `T should be ~36.79 N, got ${tension}`);
  assert.ok(tension > 3 * G && tension < 5 * G, "tension must sit between the two weights");
  const level = atwood(4, 4);
  assert.ok(approx(level.accel, 0, 1e-9), "balanced masses must not accelerate");
  assert.ok(approx(level.tension, 4 * G, 1e-9), "balanced tension must equal one weight");
});

test("spring force is restoring", () => {
  assert.equal(springForce(100, 0.1), -10);
  assert.equal(springForce(100, -0.1), 10);
  assert.ok(springForce(250, 0.04) < 0, "a stretched spring pulls back");
});
