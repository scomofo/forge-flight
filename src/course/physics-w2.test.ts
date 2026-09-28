/**
 * Validation for the Physics 101 Week 2 batch (scout/physics-w2).
 *
 * Run with: node --experimental-strip-types --test src/course/physics-w2.test.ts
 * from the repo root. Imports are relative "./x.ts" so Node's type-stripping
 * resolves them without the @/ alias.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { physicsW2Lessons } from "./physics-w2.ts";
import {
  CRUISE_INTERVALS,
  THRUST_INTERVALS,
  THRUST_SAMPLES,
  MOTION_DATA,
  centralVelocity,
  fitConstantAccel,
  intervalVelocities,
  launchSpeedForRange,
  projectile,
  trajectoryPoints,
  vadd,
  vangleDeg,
  vdot,
  vfromPolar,
  vmag,
  vproject,
  vscale,
  vsub,
} from "./kinematics.ts";
import { lessons, lessonsFor } from "./catalog.ts";

const here = dirname(fileURLToPath(import.meta.url));

test("week 2 opens the physics track in syllabus order", () => {
  assert.equal(physicsW2Lessons.length, 3);
  assert.deepEqual(
    physicsW2Lessons.map((l) => l.id),
    ["veccomp", "kingraphs", "projectiles"],
  );
  assert.deepEqual(
    physicsW2Lessons.map((l) => l.index),
    [4, 5, 6],
  );
  for (const l of physicsW2Lessons) assert.equal(l.track, "physics");
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
  for (const l of physicsW2Lessons) {
    assert.ok(lessons.includes(l), `week-2 lesson ${l.id} must be in lessons`);
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

test("week-2 lessons keep the lesson contract", () => {
  for (const lesson of physicsW2Lessons) {
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

test("week-2 bench ids are registered in the bench index", () => {
  const indexSource = readFileSync(join(here, "..", "components", "bench", "index.tsx"), "utf8");
  const registered = new Set(
    [...indexSource.matchAll(/case\s+"([\w-]+)"/g)].map((m) => m[1]),
  );
  for (const lesson of physicsW2Lessons) {
    assert.ok(
      registered.has(lesson.bench),
      `bench id "${lesson.bench}" from ${lesson.id} must have a case in bench/index.tsx`,
    );
  }
  const labsSource = readFileSync(join(here, "..", "components", "bench", "physics-labs.tsx"), "utf8");
  for (const name of ["MotionReconBench", "ProjectileBench"]) {
    assert.ok(
      new RegExp(`export function ${name}`).test(labsSource),
      `physics-labs.tsx must export ${name}`,
    );
  }
});

test("vector ops follow the component rules", () => {
  assert.deepEqual(vadd({ x: 3, y: 4 }, { x: -3, y: 4 }), { x: 0, y: 8 });
  assert.deepEqual(vsub({ x: 3, y: 4 }, { x: 1, y: 1 }), { x: 2, y: 3 });
  assert.deepEqual(vscale({ x: 3, y: 4 }, 2), { x: 6, y: 8 });
  assert.equal(vdot({ x: 3, y: 4 }, { x: -3, y: 4 }), 7);
  assert.equal(vmag({ x: 3, y: 4 }), 5);
  assert.equal(vdot({ x: 1, y: 0 }, { x: 0, y: 1 }), 0);
  // polar round-trip
  const p = vfromPolar(5, 36.87);
  assert.ok(Math.abs(vmag(p) - 5) < 1e-9);
  assert.ok(Math.abs(vangleDeg(p) - 36.87) < 1e-9);
  // projection of (3,4) onto x-axis is 3
  assert.ok(Math.abs(vproject({ x: 3, y: 4 }, { x: 1, y: 0 }) - 3) < 1e-9);
  // work example from the lesson: 10 N at 60° → 5 N along the displacement
  const f = vfromPolar(10, 60);
  assert.ok(Math.abs(vproject(f, { x: 1, y: 0 }) - 5) < 1e-9);
});

test("finite differences recover exact motion on clean data", () => {
  const linear = [0, 1, 2, 3].map((t) => ({ t, x: 0.3 + 1.6 * t }));
  for (const v of intervalVelocities(linear)) assert.ok(Math.abs(v - 1.6) < 1e-12);
  assert.ok(Math.abs(centralVelocity(linear, 2) - 1.6) < 1e-12);
  const quad = [0, 1, 2, 3, 4].map((t) => ({ t, x: 1 + 2 * t + 0.5 * 3 * t * t }));
  const fit = fitConstantAccel(quad);
  assert.ok(Math.abs(fit.x0 - 1) < 1e-9, `x0 ${fit.x0}`);
  assert.ok(Math.abs(fit.v0 - 2) < 1e-9, `v0 ${fit.v0}`);
  assert.ok(Math.abs(fit.a - 3) < 1e-9, `a ${fit.a}`);
  assert.ok(fit.rms < 1e-9, `rms ${fit.rms}`);
});

test("motion dataset matches the lesson's stated motion", () => {
  assert.equal(MOTION_DATA.length, 13);
  assert.deepEqual(CRUISE_INTERVALS, [0, 1, 2, 3, 4]);
  assert.deepEqual(THRUST_INTERVALS, [5, 6, 7, 8, 9, 10, 11]);
  const vels = intervalVelocities(MOTION_DATA);
  assert.equal(vels.length, 12);
  for (const i of CRUISE_INTERVALS) {
    assert.ok(Math.abs(vels[i] - 1.6) < 0.1, `cruise interval ${i}: ${vels[i]}`);
  }
  for (let i = 0; i < THRUST_INTERVALS.length - 1; i++) {
    assert.ok(
      vels[THRUST_INTERVALS[i + 1]] > vels[THRUST_INTERVALS[i]],
      "thrust velocities must increase",
    );
  }
  const fit = fitConstantAccel(THRUST_SAMPLES);
  assert.ok(Math.abs(fit.a - 0.9) < 0.15, `fitted a ${fit.a}`);
  assert.ok(Math.abs(fit.v0 - 1.6) < 0.15, `fitted v0 ${fit.v0}`);
  assert.ok(fit.rms < 0.05, `rms ${fit.rms} must sit inside the 2 cm jitter`);
});

test("projectile ballistics match the closed forms", () => {
  // 45°, 10 m/s: R = v²/g, T = 2v·sin45/g, H = (v·sin45)²/2g
  const p = projectile(10, 45);
  assert.ok(Math.abs(p.range - 100 / 9.81) < 1e-9, `range ${p.range}`);
  assert.ok(Math.abs(p.timeOfFlight - (2 * 10 * Math.SQRT1_2) / 9.81) < 1e-9);
  assert.ok(Math.abs(p.maxHeight - (10 * Math.SQRT1_2) ** 2 / (2 * 9.81)) < 1e-9);
  // lesson example: 20 m/s at 30°
  const q = projectile(20, 30);
  assert.ok(Math.abs(q.range - 35.3) < 0.05, `range ${q.range}`);
  assert.ok(Math.abs(q.maxHeight - 5.1) < 0.05, `height ${q.maxHeight}`);
  assert.ok(Math.abs(q.timeOfFlight - 2.04) < 0.01, `time ${q.timeOfFlight}`);
  // launchSpeedForRange inverts the range
  const v0 = launchSpeedForRange(40, 40);
  assert.ok(Math.abs(projectile(v0, 40).range - 40) < 1e-9);
  // trajectory starts at launch and ends at the range on the ground
  const pts = trajectoryPoints(20, 30);
  assert.equal(pts.length, 41);
  assert.ok(Math.abs(pts[0].x) < 1e-12 && Math.abs(pts[0].y) < 1e-12);
  const last = pts[pts.length - 1];
  assert.ok(Math.abs(last.x - q.range) < 1e-9);
  assert.ok(Math.abs(last.y) < 1e-9);
});
