/**
 * Validation for the Physics 101 Week 6 batch (scout/physics-w6).
 *
 * Run with: node --experimental-strip-types --test src/course/physics-w6.test.ts
 * from the repo root. Imports are relative "./x.ts" so Node's type-stripping
 * resolves them without the @/ alias.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { physicsW6Lessons } from "./physics-w6.ts";
import {
  beamReactions,
  centripetalAcceleration,
  constAlphaMotion,
  degToRad,
  inertia,
  leverArm,
  netTorque,
  parallelAxis,
  spinUp,
  tangentialSpeed,
  torque,
} from "./rotation.ts";
import { lessons, lessonsFor } from "./catalog.ts";

const here = dirname(fileURLToPath(import.meta.url));
const approx = (a: number, b: number, tol = 1e-9) => Math.abs(a - b) <= tol;

test("week 6 opens the physics track in syllabus order", () => {
  assert.equal(physicsW6Lessons.length, 3);
  assert.deepEqual(
    physicsW6Lessons.map((l) => l.id),
    ["torque", "rotation", "equilibrium"],
  );
  assert.deepEqual(
    physicsW6Lessons.map((l) => l.index),
    [16, 17, 18],
  );
  for (const l of physicsW6Lessons) assert.equal(l.track, "physics");
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
  for (const l of physicsW6Lessons) {
    assert.ok(lessons.includes(l), `week-6 lesson ${l.id} must be in lessons`);
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

test("week-6 lessons keep the lesson contract", () => {
  for (const lesson of physicsW6Lessons) {
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

test("week-6 bench ids are registered in the bench index", () => {
  const indexSource = readFileSync(join(here, "..", "components", "bench", "index.tsx"), "utf8");
  const registered = new Set(
    [...indexSource.matchAll(/case\s+"([\w-]+)"/g)].map((m) => m[1]),
  );
  for (const lesson of physicsW6Lessons) {
    assert.ok(
      registered.has(lesson.bench),
      `bench id "${lesson.bench}" from ${lesson.id} must have a case in bench/index.tsx`,
    );
  }
  const labs = readFileSync(join(here, "..", "components", "bench", "physics-labs.tsx"), "utf8");
  for (const name of ["TorqueBalanceBench", "RotInertiaBench", "BeamReactionsBench"]) {
    assert.ok(
      new RegExp(`export function ${name}\\b`).test(labs),
      `physics-labs.tsx must export ${name}`,
    );
  }
});

test("torque is rF sin θ with the lesson's worked numbers", () => {
  assert.ok(approx(torque(0.25, 80, 90), 20)); // check 1
  assert.ok(approx(torque(0.25, 80, 30), 10)); // check 2
  assert.ok(approx(torque(0.25, 400, 90), 100)); // lug-nut example
  assert.ok(approx(torque(0.25, 400, 60), 86.6025, 1e-3));
  assert.equal(torque(1, 100, 0), 0); // push along the handle: nothing turns
  assert.ok(approx(leverArm(0.25, 90), 0.25));
  assert.ok(approx(leverArm(0.25, 30), 0.125));
  assert.equal(netTorque([40, -25]), 15);
  assert.equal(netTorque([]), 0);
  assert.ok(approx(degToRad(180), Math.PI));
});

test("angular kinematics follow the constant-α forms", () => {
  const m = constAlphaMotion(0, 0, 5, 5); // rotation lesson's flywheel numbers
  assert.ok(approx(m.omega, 25));
  assert.ok(approx(m.theta, 62.5));
  assert.ok(approx(tangentialSpeed(20, 0.5), 10)); // check 2
  assert.ok(approx(centripetalAcceleration(10, 2), 200));
});

test("inertia table and parallel-axis theorem", () => {
  assert.ok(approx(inertia("solid-cylinder", 2, 0.1), 0.01)); // lesson worked case
  assert.ok(approx(inertia("hoop", 2, 0.1), 0.02)); // hoop beats disk
  assert.ok(approx(inertia("point", 3, 2), 12));
  assert.ok(approx(inertia("rod-center", 2, 3), 1.5)); // 2*9/12
  assert.ok(approx(inertia("rod-end", 2, 3), 6)); // 2*9/3
  assert.ok(approx(inertia("solid-sphere", 5, 0.2), 0.08)); // 0.4*5*0.04
  // Rod about its end via parallel axis: I_cm + m(L/2)² = mL²/12 + mL²/4 = mL²/3
  assert.ok(approx(parallelAxis(inertia("rod-center", 2, 3), 2, 1.5), inertia("rod-end", 2, 3)));
  assert.throws(() => inertia("hoop", 0, 1), /positive/);
  assert.throws(() => inertia("hoop", 1, -1), /positive/);
});

test("spin-up matches τ = Iα integrated", () => {
  const s = spinUp(0.01, 0.05, 5); // rotation lesson's worked case
  assert.ok(approx(s.omega, 25));
  assert.ok(approx(s.theta, 62.5));
  assert.ok(approx(s.ke, 3.125)); // ½·0.01·25²
  assert.throws(() => spinUp(0, 1, 1), /positive/);
});

test("beam solver returns the lesson's worked reactions", () => {
  const w = beamReactions(6, [{ x: 2, f: 800 }, { x: 5, f: 400 }], []);
  assert.ok(approx(w.ay, 600));
  assert.ok(approx(w.by, 600));
  assert.equal(w.totalLoad, 1200);
  assert.ok(approx(w.ay + w.by, w.totalLoad), "reactions must balance the load");
});

test("beam solver handles uniform loads via centroid", () => {
  const u = beamReactions(6, [], [{ from: 0, to: 6, w: 200 }]);
  assert.ok(approx(u.ay, 600));
  assert.ok(approx(u.by, 600));
  // Bench problem 2: 8 m, 1200 N at 6 m, 150 N/m over 2–6 m
  const p2 = beamReactions(8, [{ x: 6, f: 1200 }], [{ from: 2, to: 6, w: 150 }]);
  assert.equal(p2.totalLoad, 1800);
  assert.ok(approx(p2.by, 1200)); // (1200·6 + 600·4)/8
  assert.ok(approx(p2.ay, 600));
  // Bench problem 3: 5 m, 500 N at 1 m, 1500 N at 4 m
  const p3 = beamReactions(5, [{ x: 1, f: 500 }, { x: 4, f: 1500 }], []);
  assert.ok(approx(p3.by, 1300));
  assert.ok(approx(p3.ay, 700));
});

test("beam solver rejects bad input", () => {
  assert.throws(() => beamReactions(0, [], []), /positive/);
  assert.throws(() => beamReactions(6, [{ x: 7, f: 100 }], []), /off the beam/);
  assert.throws(() => beamReactions(6, [{ x: 2, f: -5 }], []), /non-negative/);
  assert.throws(() => beamReactions(6, [], [{ from: 4, to: 2, w: 10 }]), /left to right/);
  assert.throws(() => beamReactions(6, [], [{ from: 0, to: 6, w: -1 }]), /non-negative/);
});
