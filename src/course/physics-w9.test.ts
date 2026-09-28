/**
 * Validation for the Physics 101 Week 9 batch (scout/physics-w9).
 *
 * Run with: node --experimental-strip-types --test src/course/physics-w9.test.ts
 * from the repo root. Imports are relative "./x.ts" so Node's type-stripping
 * resolves them without the @/ alias.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { physicsW9Lessons } from "./physics-w9.ts";
import {
  jointGap,
  magnification,
  qualityFactor,
  resonantRatio,
  shmEnergy,
  shmFrequency,
  shmKinetic,
  shmOmega,
  shmPeriod,
  shmPosition,
  shmPotential,
  shmVelocity,
  standingFreq,
  steadyAmplitude,
  thermalExpansion,
  thermalStress,
  THERMAL_MATERIALS,
  wavelength,
  waveSpeed,
} from "./oscillations.ts";
import { lessons, lessonsFor } from "./catalog.ts";

const here = dirname(fileURLToPath(import.meta.url));

function approx(actual: number, expected: number, tol = 1e-6, label = ""): void {
  const diff = Math.abs(actual - expected);
  const scale = Math.max(1, Math.abs(expected));
  assert.ok(diff / scale <= tol, `${label}: expected ${expected}, got ${actual}`);
}

test("week 9 opens the physics track in syllabus order", () => {
  assert.equal(physicsW9Lessons.length, 3);
  assert.deepEqual(
    physicsW9Lessons.map((l) => l.id),
    ["shm", "reswaves", "thermal"],
  );
  assert.deepEqual(
    physicsW9Lessons.map((l) => l.index),
    [25, 26, 27],
  );
  for (const l of physicsW9Lessons) assert.equal(l.track, "physics");
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
  for (const l of physicsW9Lessons) {
    assert.ok(lessons.includes(l), `week-9 lesson ${l.id} must be in lessons`);
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

test("week-9 lessons keep the lesson contract", () => {
  for (const lesson of physicsW9Lessons) {
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

test("week-9 bench ids are registered in the bench index", () => {
  const indexSource = readFileSync(join(here, "..", "components", "bench", "index.tsx"), "utf8");
  const registered = new Set(
    [...indexSource.matchAll(/case\s+"([\w-]+)"/g)].map((m) => m[1]),
  );
  for (const lesson of physicsW9Lessons) {
    assert.ok(
      registered.has(lesson.bench),
      `bench id "${lesson.bench}" from ${lesson.id} must have a case in bench/index.tsx`,
    );
  }
  const labs = readFileSync(join(here, "..", "components", "bench", "physics-labs.tsx"), "utf8");
  for (const [id, fn] of [
    ["shmlab", "ShmBench"],
    ["resonancesweep", "ResonanceSweepBench"],
    ["thermalstress", "ThermalStressBench"],
  ] as const) {
    assert.ok(
      new RegExp(`export function ${fn}\\b`).test(labs),
      `physics-labs.tsx must export the ${id} bench component (${fn})`,
    );
  }
});

test("SHM numbers match the lesson's worked example (m=0.5 kg, k=20 N/m, A=0.10 m)", () => {
  approx(shmOmega(20, 0.5), Math.sqrt(40), 1e-12, "omega");
  approx(shmFrequency(20, 0.5), Math.sqrt(40) / (2 * Math.PI), 1e-12, "f");
  approx(shmPeriod(20, 0.5), (2 * Math.PI) / Math.sqrt(40), 1e-12, "T");
  approx(shmEnergy(20, 0.1), 0.1, 1e-12, "E = 1/2 k A^2");
  // v_max from energy: 1/2 m v^2 = 0.1 -> v = sqrt(0.4)
  approx(Math.sqrt((2 * shmEnergy(20, 0.1)) / 0.5), Math.sqrt(0.4), 1e-12, "v_max");
  // energy ledger: KE + PE = E everywhere
  for (const x of [-0.1, -0.05, 0, 0.07, 0.1]) {
    approx(shmKinetic(20, 0.1, x) + shmPotential(20, x), 0.1, 1e-12, `ledger at x=${x}`);
  }
  // position/velocity consistency: x(0)=A, v(0)=0 from rest
  approx(shmPosition(0.1, shmOmega(20, 0.5), 0, 0), 0.1, 1e-12, "x(0)");
  approx(shmVelocity(0.1, shmOmega(20, 0.5), 0, 0), 0, 1e-12, "v(0)");
  // quarter period later: mass crosses equilibrium moving fastest
  const T = shmPeriod(20, 0.5);
  approx(shmPosition(0.1, shmOmega(20, 0.5), 0, T / 4), 0, 1e-9, "x(T/4)");
});

test("resonance response matches the lesson's worked numbers", () => {
  // zeta = 0.05 at r = 1 -> magnification 10
  approx(magnification(1, 0.05), 10, 1e-12, "M(1, 0.05)");
  approx(qualityFactor(0.05), 10, 1e-12, "Q");
  // detuned to r = 0.8 -> ~2.7
  approx(magnification(0.8, 0.05), 2.71, 1e-2, "M(0.8, 0.05)");
  // peak sits essentially at r = 1 for light damping
  approx(resonantRatio(0.05), Math.sqrt(1 - 2 * 0.05 * 0.05), 1e-12, "r*");
  assert.ok(Math.abs(resonantRatio(0.05) - 1) < 0.01, "r* near 1");
  // heavy damping kills the peak below r = 1
  assert.ok(resonantRatio(0.5) < 1, "r* drops with damping");
  // flanks: r -> 0 tends to static response, r -> inf tends to 0
  approx(magnification(0.01, 0.05), 1, 1e-2, "static limit");
  assert.ok(magnification(10, 0.05) < 0.02, "mass line falls off");
  // steady amplitude scales the static deflection
  approx(steadyAmplitude(100, 20, 1, 0.05), (100 / 20) * 10, 1e-9, "X at resonance");
});

test("wave relations give the lesson's numbers", () => {
  approx(waveSpeed(440, 343 / 440), 343, 1e-9, "v = f lambda");
  approx(wavelength(343, 440), 343 / 440, 1e-9, "lambda ~ 0.78 m");
  assert.ok(wavelength(343, 440) > 0.77 && wavelength(343, 440) < 0.79, "concert-A wavelength");
  // 0.65 m string, v = 260 m/s -> fundamental 200 Hz
  approx(standingFreq(1, 260, 0.65), 200, 1e-9, "f1");
  approx(standingFreq(2, 260, 0.65), 400, 1e-9, "f2");
});

test("thermal expansion and stress match the lesson's rail example", () => {
  const steel = THERMAL_MATERIALS.find((m) => m.name === "Steel");
  assert.ok(steel, "steel must be in the material table");
  // 10 m rail, dT = 40 C -> 4.8 mm free expansion
  approx(thermalExpansion(10, steel.alpha, 40), 0.0048, 1e-12, "dL");
  approx(jointGap(10, steel.alpha, 40), 0.0048, 1e-12, "gap");
  // constrained -> 96 MPa compression (tensile-positive sign: negative)
  approx(thermalStress(steel.E, steel.alpha, 40), -96e6, 1e-9, "sigma");
  // cooling a constrained bar gives tension
  assert.ok(thermalStress(steel.E, steel.alpha, -40) > 0, "cooling -> tension");
  // material table sanity
  for (const m of THERMAL_MATERIALS) {
    assert.ok(m.alpha > 0 && m.E > 0 && m.yieldPa > 0, `${m.name} needs positive constants`);
  }
  // the thermal-stress-set answers baked into the bench
  approx(thermalExpansion(25, 12e-6, 35) * 1000, 10.5, 1e-9, "set q1 mm");
  const alu = THERMAL_MATERIALS.find((m) => m.name === "Aluminum");
  assert.ok(alu);
  approx(Math.abs(thermalStress(alu.E, alu.alpha, -30)) / 1e6, 48.3, 1e-9, "set q2 MPa");
  approx(jointGap(2, 17e-6, 60) * 1000, 2.04, 1e-9, "set q3 mm");
});
