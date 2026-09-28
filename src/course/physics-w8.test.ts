/**
 * Validation for the Physics 101 Week 8 batch (scout/physics-w8).
 *
 * Run with: node --experimental-strip-types --test src/course/physics-w8.test.ts
 * from the repo root. Imports are relative "./x.ts" so Node's type-stripping
 * resolves them without the @/ alias.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { physicsW8Lessons } from "./physics-w8.ts";
import {
  buoyantForce,
  continuitySpeed,
  dynamicPressure,
  floatFraction,
  forceBalance,
  hydrostaticPressure,
  RHO_AIR,
  RHO_SEAWATER,
  RHO_WATER,
  stabilityVerdict,
  stallSpeed,
  staticMargin,
  venturiPressureDrop,
  wingLoading,
} from "./fluids.ts";
import { lessons, lessonsFor } from "./catalog.ts";

const here = dirname(fileURLToPath(import.meta.url));

test("week 8 opens the physics track in syllabus order", () => {
  assert.equal(physicsW8Lessons.length, 3);
  assert.deepEqual(
    physicsW8Lessons.map((l) => l.id),
    ["pressure", "movingfluids", "lift"],
  );
  assert.deepEqual(
    physicsW8Lessons.map((l) => l.index),
    [22, 23, 24],
  );
  for (const l of physicsW8Lessons) assert.equal(l.track, "physics");
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
  for (const l of physicsW8Lessons) {
    assert.ok(lessons.includes(l), `week-8 lesson ${l.id} must be in lessons`);
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

test("week-8 lessons keep the lesson contract", () => {
  for (const lesson of physicsW8Lessons) {
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

test("week-8 bench ids are registered in the bench index", () => {
  const indexSource = readFileSync(join(here, "..", "components", "bench", "index.tsx"), "utf8");
  const registered = new Set(
    [...indexSource.matchAll(/case\s+"([\w-]+)"/g)].map((m) => m[1]),
  );
  for (const lesson of physicsW8Lessons) {
    assert.ok(
      registered.has(lesson.bench),
      `bench id "${lesson.bench}" from ${lesson.id} must have a case in bench/index.tsx`,
    );
  }
  const labs = readFileSync(join(here, "..", "components", "bench", "physics-labs.tsx"), "utf8");
  for (const [id, name] of [
    ["hydro", "HydroBench"],
    ["venturi", "VenturiBench"],
    ["gliderprelab", "GliderPreLabBench"],
  ] as const) {
    assert.ok(
      new RegExp(`export function ${name}\\b`).test(labs),
      `physics-labs.tsx must export ${name} for bench "${id}"`,
    );
  }
});

test("hydrostatic pressure and buoyancy match the lesson numbers", () => {
  // Lesson 1 worked case: 10 m of fresh water.
  assert.ok(Math.abs(hydrostaticPressure(RHO_WATER, 9.81, 10) - 98100) < 1);
  // Lesson 1 worked case: 2 m^3 hull displacing seawater.
  assert.ok(Math.abs(buoyantForce(RHO_SEAWATER, 9.81, 2.0) - 20110.5) < 0.1);
  // Zero depth is zero gauge pressure.
  assert.equal(hydrostaticPressure(RHO_WATER, 9.81, 0), 0);
});

test("float fraction follows displaced-weight balance", () => {
  // Lesson 1 check: 800 kg/m^3 in water rides 80% under.
  assert.ok(Math.abs(floatFraction(800, RHO_WATER) - 0.8) < 1e-12);
  // Denser than the fluid: ratio above 1, i.e. sinks.
  assert.ok(floatFraction(7800, RHO_WATER) > 1);
  // Neutrally buoyant.
  assert.ok(Math.abs(floatFraction(1025, RHO_SEAWATER) - 1) < 1e-12);
});

test("continuity and venturi follow the lesson numbers", () => {
  // Halving the diameter quarters the area: 1 m/s in, 4 m/s out.
  const aIn = Math.PI * 0.05 ** 2;
  const aOut = Math.PI * 0.025 ** 2;
  assert.ok(Math.abs(continuitySpeed(1, aIn, aOut) - 4) < 1e-9);
  // Lesson 2 worked case: 1 -> 4 m/s in water drops 7.5 kPa.
  assert.ok(Math.abs(venturiPressureDrop(RHO_WATER, 1, 4) - 7500) < 1);
  // No speedup, no drop.
  assert.equal(venturiPressureDrop(RHO_WATER, 2, 2), 0);
});

test("stall speed and static margin match the glider pre-lab numbers", () => {
  // Lesson 3 worked case: 0.25 kg, 0.06 m^2, CLmax 1.1 -> ~7.79 m/s.
  const v = stallSpeed(0.25, 9.81, RHO_AIR, 0.06, 1.1);
  assert.ok(Math.abs(v - 7.79) < 0.02, `stall speed ${v} should be ~7.79 m/s`);
  // Lesson 3 worked case: (0.30 - 0.27) / 0.12 = 0.25.
  assert.ok(Math.abs(staticMargin(0.3, 0.27, 0.12) - 0.25) < 1e-12);
  // Wing loading drives stall speed: double the loading, sqrt(2) the speed.
  const v1 = stallSpeed(0.25, 9.81, RHO_AIR, 0.06, 1.1);
  const v2 = stallSpeed(0.5, 9.81, RHO_AIR, 0.06, 1.1);
  assert.ok(Math.abs(v2 / v1 - Math.SQRT2) < 1e-9);
  assert.ok(Math.abs(wingLoading(0.25, 9.81, 0.06) - 2.4525 / 0.06) < 1e-9);
});

test("stability verdict follows the glider model's teaching band", () => {
  assert.equal(stabilityVerdict(-0.02), "unstable");
  assert.equal(stabilityVerdict(0.049), "unstable");
  assert.equal(stabilityVerdict(0.05), "stable");
  assert.equal(stabilityVerdict(0.25), "stable");
  assert.equal(stabilityVerdict(0.3), "overstable");
});

test("force balance reproduces the lesson's cruise numbers", () => {
  // Lesson 3 worked case: 9 m/s, CL 0.6 on the 0.06 m^2 wing.
  const q = dynamicPressure(RHO_AIR, 9);
  assert.ok(Math.abs(q - 49.6125) < 1e-9);
  const fb = forceBalance({
    mass_kg: 0.25,
    g: 9.81,
    rho_kgm3: RHO_AIR,
    speed_ms: 9,
    wingArea_m2: 0.06,
    cl: 0.6,
    cd: 0.05,
  });
  assert.ok(Math.abs(fb.lift_N - 1.786) < 0.01, `lift ${fb.lift_N} should be ~1.79 N`);
  assert.ok(Math.abs(fb.weight_N - 2.4525) < 1e-9);
  assert.ok(!fb.balanced, "1.79 N of lift cannot carry 2.45 N of weight");
  assert.ok(Math.abs(fb.glideRatio - fb.lift_N / fb.drag_N) < 1e-12);
  // At the stall-speed edge with CLmax, lift just carries the weight.
  const vStall = stallSpeed(0.25, 9.81, RHO_AIR, 0.06, 1.1);
  const edge = forceBalance({
    mass_kg: 0.25,
    g: 9.81,
    rho_kgm3: RHO_AIR,
    speed_ms: vStall,
    wingArea_m2: 0.06,
    cl: 1.1,
    cd: 0.08,
  });
  assert.ok(Math.abs(edge.liftOverWeight - 1) < 1e-9, "stall speed is defined by L = W");
  assert.ok(edge.balanced);
});
