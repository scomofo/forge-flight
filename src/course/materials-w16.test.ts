/**
 * Validation for the Materials 101 Week 16 batch (scout/materials-w16).
 *
 * Run with: node --experimental-strip-types --test src/course/materials-w16.test.ts
 * from the repo root. Imports are relative "./x.ts" so Node's type-stripping
 * resolves them without the @/ alias.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { materialsW16Lessons } from "./materials-w16.ts";
import {
  basquinLife,
  basquinStress,
  criticalCrackSize,
  criticalStress,
  griffithStress,
  larsonMiller,
  minersDamage,
  nortonRate,
  parisGrowth,
  ruptureTime,
  stressConcentration,
  stressIntensity,
} from "./fracture.ts";
import { lessons, lessonsFor } from "./catalog.ts";

const here = dirname(fileURLToPath(import.meta.url));

test("week 16 opens the materials track in syllabus order", () => {
  assert.equal(materialsW16Lessons.length, 3);
  assert.deepEqual(
    materialsW16Lessons.map((l) => l.id),
    ["fracture", "fatigue", "creep"],
  );
  assert.deepEqual(
    materialsW16Lessons.map((l) => l.index),
    [16, 17, 18],
  );
  for (const l of materialsW16Lessons) assert.equal(l.track, "materials");
  const materials = lessonsFor("materials");
  assert.equal(materials.length, 30, "materials track must hold weeks 11-20");
  assert.deepEqual(
    materials.map((l) => l.id),
    [
      "bondzoo",
      "bondpacks",
      "bondread",
      "crystal",
      "graintex",
      "disorder",
      "defects",
      "diffusion",
      "heat-treat",
      "readcurve",
      "toughduct",
      "allowables",
      "strengthen",
      "heattreat",
      "processchoice",
      "fracture",
      "fatigue",
      "creep",
      "phasediagram",
      "leverrule",
      "transformations",
      "famlook",
      "dirtemp",
      "choosefam",
      "screenrank",
      "corrosion",
      "sustain",
      "matmethod",
      "sparsynth",
      "matmastery",
    ],
  );
  assert.deepEqual(
    materials.map((l) => l.index),
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
  );
  for (const l of materialsW16Lessons) {
    assert.ok(lessons.includes(l), `week-16 lesson ${l.id} must be in lessons`);
  }
});

test("no duplicate track/id lesson keys across the catalog", () => {
  const seen = new Set<string>();
  for (const l of lessons) {
    const key = `${l.track}/${l.id}`;
    assert.ok(!seen.has(key), `duplicate lesson ${key}`);
    seen.add(key);
  }
});

test("week-16 lessons keep the lesson contract", () => {
  for (const lesson of materialsW16Lessons) {
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

test("week-16 bench ids are registered in the bench index", () => {
  const indexSource = readFileSync(join(here, "..", "components", "bench", "index.tsx"), "utf8");
  const registered = new Set(
    [...indexSource.matchAll(/case\s+"([\w-]+)"/g)].map((m) => m[1]),
  );
  for (const lesson of materialsW16Lessons) {
    assert.ok(
      registered.has(lesson.bench),
      `bench id "${lesson.bench}" from ${lesson.id} must have a case in bench/index.tsx`,
    );
  }
  const labsSource = readFileSync(join(here, "..", "components", "bench", "materials-labs.tsx"), "utf8");
  for (const [id, component] of [
    ["forensics", "ForensicsBench"],
    ["snlife", "SnLifeBench"],
    ["creeplife", "CreepLifeBench"],
  ] as const) {
    assert.ok(
      new RegExp(`export function ${component}\\b`).test(labsSource),
      `materials-labs.tsx must export the ${id} bench component`,
    );
  }
});

test("stress concentration and intensity follow the definitions", () => {
  assert.equal(stressConcentration(3, 100), 300);
  // Lesson 1 worked case: 200 MPa, 5 mm half-length crack, Y = 1
  const K = stressIntensity(200e6, 0.005, 1);
  assert.ok(Math.abs(K - 25.07e6) / 25.07e6 < 0.01, `K should be ≈25.1 MPa√m, got ${K}`);
});

test("critical crack size matches the lesson's worked numbers", () => {
  // K_IC = 50 MPa√m at 200 MPa → a_c ≈ 20 mm
  const ac = criticalCrackSize(50e6, 200e6, 1);
  assert.ok(Math.abs(ac - 0.0199) < 1e-4, `a_c should be ≈0.0199 m, got ${ac}`);
  // Doubling the stress quarters the critical size (lesson check 2)
  const ac2 = criticalCrackSize(50e6, 400e6, 1);
  assert.ok(Math.abs(ac2 - ac / 4) / ac < 1e-9, "a_c must scale as 1/σ²");
  // Round trip: critical stress of the critical crack is the original stress
  const sc = criticalStress(50e6, ac, 1);
  assert.ok(Math.abs(sc - 200e6) / 200e6 < 1e-9, "criticalStress must invert criticalCrackSize");
});

test("griffith stress falls with crack length", () => {
  const s1 = griffithStress(200e9, 1, 1e-3);
  const s4 = griffithStress(200e9, 1, 4e-3);
  assert.ok(Math.abs(s1 - 1.128e7) / 1.128e7 < 0.05, `Griffith stress ≈11.3 MPa, got ${s1}`);
  assert.ok(Math.abs(s4 - s1 / 2) / s1 < 1e-9, "Griffith stress must scale as 1/√a");
});

test("basquin life matches the lesson's worked numbers", () => {
  // Lesson 2 worked case: 300 MPa amplitude, σ_f′ = 900 MPa, b = −0.1 → ≈29,500 cycles
  const N = basquinLife(300e6, 900e6, -0.1);
  assert.ok(Math.abs(N - 29524.5) / 29524.5 < 1e-9, `N should be ≈29524.5, got ${N}`);
  // Inverted: the allowable stress at that life is the original amplitude
  const s = basquinStress(N, 900e6, -0.1);
  assert.ok(Math.abs(s - 300e6) / 300e6 < 1e-9, "basquinStress must invert basquinLife");
});

test("miner's rule adds damage fractions", () => {
  assert.equal(minersDamage([[100000, 200000], [100000, 400000]]), 0.75);
  assert.equal(minersDamage([]), 0);
});

test("paris growth extends the crack and detects fracture", () => {
  const grown = parisGrowth({
    a0: 1e-3,
    C: 1e-29,
    m: 3,
    deltaSigma: 100e6,
    sigmaMax: 100e6,
    kic: 50e6,
    cycles: 1e5,
  });
  assert.equal(grown.fractured, false);
  assert.equal(grown.cyclesToFracture, null);
  assert.ok(grown.aFinal > 1e-3, "crack must grow");
  assert.ok(grown.aFinal < 2e-3, `growth must stay modest, got ${grown.aFinal}`);
  // A crack already past critical at max stress fractures immediately
  const broken = parisGrowth({
    a0: 0.02,
    C: 1e-29,
    m: 3,
    deltaSigma: 100e6,
    sigmaMax: 200e6,
    kic: 50e6,
    cycles: 1e5,
  });
  assert.equal(broken.fractured, true);
  assert.equal(broken.cyclesToFracture, 0);
});

test("larson-miller matches the lesson's worked numbers", () => {
  // 1000 h at 800 °C → P = 24,679
  const P = larsonMiller(1073, 1000);
  assert.equal(P, 24679);
  // Same parameter at 700 °C → ≈2.3×10⁵ h
  const t = ruptureTime(P, 973);
  assert.ok(t > 2e5 && t < 2.6e5, `rupture time should be ≈2.3e5 h, got ${t}`);
  // Round trip
  assert.ok(Math.abs(larsonMiller(973, t) - P) / P < 1e-9, "larsonMiller must invert ruptureTime");
});

test("norton creep rate rises with temperature and stress", () => {
  const base = nortonRate(1e-12, 100e6, 5, 300e3, 1000);
  assert.ok(nortonRate(1e-12, 100e6, 5, 300e3, 1100) > base, "hotter must creep faster");
  assert.ok(nortonRate(1e-12, 200e6, 5, 300e3, 1000) > base, "higher stress must creep faster");
  assert.ok(base > 0, "rate must be positive");
});
