/**
 * Validation for the Physics 101 Week 4 batch (scout/physics-w4).
 *
 * Run with: node --experimental-strip-types --test src/course/physics-w4.test.ts
 * from the repo root. Imports are relative "./x.ts" so Node's type-stripping
 * resolves them without the @/ alias.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { physicsW4Lessons } from "./physics-w4.ts";
import {
  elasticPotential,
  energyAudit,
  G,
  gravPotential,
  kineticEnergy,
  mechPower,
  MECHANISMS,
  netWork,
  power,
  speedAfterDrop,
  speedFromDrop,
  speedFromKE,
  work,
} from "./energy.ts";
import { lessons, lessonsFor } from "./catalog.ts";

const here = dirname(fileURLToPath(import.meta.url));

test("week 4 opens the physics track in syllabus order", () => {
  assert.equal(physicsW4Lessons.length, 3);
  assert.deepEqual(
    physicsW4Lessons.map((l) => l.id),
    ["work", "potential", "power"],
  );
  assert.deepEqual(
    physicsW4Lessons.map((l) => l.index),
    [10, 11, 12],
  );
  for (const l of physicsW4Lessons) assert.equal(l.track, "physics");
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
  for (const l of physicsW4Lessons) {
    assert.ok(lessons.includes(l), `week-4 lesson ${l.id} must be in lessons`);
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

test("week-4 lessons keep the lesson contract", () => {
  for (const lesson of physicsW4Lessons) {
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

test("week-4 bench ids are registered in the bench index", () => {
  const indexSource = readFileSync(join(here, "..", "components", "bench", "index.tsx"), "utf8");
  const registered = new Set(
    [...indexSource.matchAll(/case\s+"([\w-]+)"/g)].map((m) => m[1]),
  );
  const expected = new Set(physicsW4Lessons.map((l) => l.bench));
  assert.deepEqual([...expected].sort(), ["dropspeed", "energy", "energyaudit"]);
  for (const id of expected) {
    assert.ok(registered.has(id), `bench "${id}" must be registered in the bench index`);
  }
});

test("work honors the dot product and its sign", () => {
  assert.ok(Math.abs(work(60, 3, 60) - 90) < 1e-9);
  assert.equal(work(90, 5), 450);
  assert.ok(Math.abs(work(30, 5, 180) - -150) < 1e-9);
  assert.ok(Math.abs(work(100, 10, 90)) < 1e-9);
  // lesson 1 worked case: applied 450 J, friction -150 J
  assert.ok(Math.abs(netWork([work(90, 5), work(30, 5, 180)]) - 300) < 1e-9);
});

test("work-energy theorem reproduces the lesson's crate speed", () => {
  const v = speedFromKE(300, 10);
  assert.ok(Math.abs(v - Math.sqrt(60)) < 1e-9);
  assert.ok(Math.abs(v - 7.75) < 0.01);
  assert.equal(kineticEnergy(10, v), 300);
});

test("potentials store what the lessons claim", () => {
  assert.equal(gravPotential(5, 2), 5 * G * 2);
  assert.ok(Math.abs(gravPotential(5, 2) - 98.1) < 0.01);
  assert.equal(elasticPotential(400, 0.15), 4.5);
});

test("free-fall speed is mass-independent and matches the coaster", () => {
  const v = speedFromDrop(20);
  assert.ok(Math.abs(v - Math.sqrt(2 * G * 20)) < 1e-9);
  assert.ok(Math.abs(v - 19.81) < 0.01, `coaster speed should be ~19.81 m/s, got ${v}`);
  // with an initial speed the energies add
  assert.ok(Math.abs(speedAfterDrop(5, 20) - Math.sqrt(25 + 2 * G * 20)) < 1e-9);
});

test("power and efficiency match the lesson's hoist", () => {
  const useful = gravPotential(200, 3);
  assert.ok(Math.abs(useful - 5886) < 1, `hoist work should be ~5886 J, got ${useful}`);
  const p = power(useful, 12);
  assert.ok(Math.abs(p - 490.5) < 0.1, `hoist power should be ~490.5 W, got ${p}`);
  assert.equal(mechPower(50, 2), 100);
  // motor draws 800 W for the same 12 s: input 9600 J, useful 5886 J
  const motor = energyAudit(800 * 12, useful);
  assert.ok(Math.abs(motor.efficiency - 0.613) < 0.002, `motor efficiency should be ~61.3%, got ${motor.efficiency}`);
  assert.equal(motor.balanced, true);
});

test("energy audit balances the books and flags impossibilities", () => {
  const ok = energyAudit(180, 110.6);
  assert.ok(Math.abs(ok.lost - 69.4) < 0.01);
  assert.ok(Math.abs(ok.efficiency - 110.6 / 180) < 1e-9);
  assert.equal(ok.balanced, true);
  const bad = energyAudit(100, 150);
  assert.equal(bad.balanced, false);
  assert.ok(bad.lost < 0);
  const empty = energyAudit(0, 0);
  assert.equal(empty.efficiency, 0);
});

test("audit bench mechanisms are all described", () => {
  assert.deepEqual(
    MECHANISMS.map((m) => m.id),
    ["lever", "pulley", "crank"],
  );
  for (const m of MECHANISMS) {
    assert.ok(m.name.trim().length > 0);
    assert.ok(m.losses.trim().length > 0);
  }
});
