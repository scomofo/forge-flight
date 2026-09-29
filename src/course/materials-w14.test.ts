/**
 * Validation for the Materials 101 Week 14 batch (scout/materials-w14).
 *
 * Run with: node --experimental-strip-types --test src/course/materials-w14.test.ts
 * from the repo root. Imports are relative "./x.ts" so Node's type-stripping
 * resolves them without the @/ alias.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { materialsW14Lessons } from "./materials-w14.ts";
import {
  designAllowable,
  estimateModulus,
  extractParams,
  generateCurve,
  MATERIALS,
  offsetYield,
  reductionOfArea,
  toughness,
} from "./mechresponse.ts";
import { lessons, lessonsFor } from "./catalog.ts";

const here = dirname(fileURLToPath(import.meta.url));

test("week 14 opens the materials track in syllabus order", () => {
  assert.equal(materialsW14Lessons.length, 3);
  assert.deepEqual(
    materialsW14Lessons.map((l) => l.id),
    ["readcurve", "toughduct", "allowables"],
  );
  assert.deepEqual(
    materialsW14Lessons.map((l) => l.index),
    [10, 11, 12],
  );
  for (const l of materialsW14Lessons) assert.equal(l.track, "materials");
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
  for (const l of materialsW14Lessons) {
    assert.ok(lessons.includes(l), `week-14 lesson ${l.id} must be in lessons`);
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

test("week-14 lessons keep the lesson contract", () => {
  for (const lesson of materialsW14Lessons) {
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

test("week-14 bench ids are registered in the bench index", () => {
  const indexSource = readFileSync(join(here, "..", "components", "bench", "index.tsx"), "utf8");
  const registered = new Set(
    [...indexSource.matchAll(/case\s+"([\w-]+)"/g)].map((m) => m[1]),
  );
  for (const lesson of materialsW14Lessons) {
    assert.ok(
      registered.has(lesson.bench),
      `bench id "${lesson.bench}" from ${lesson.id} must have a case in bench/index.tsx`,
    );
  }
  const labsSource = readFileSync(join(here, "..", "components", "bench", "materials-labs.tsx"), "utf8");
  for (const [id, component] of [
    ["curveread", "CurveReadBench"],
    ["propcompare", "PropCompareBench"],
    ["allowable", "AllowableBench"],
  ] as const) {
    assert.ok(
      new RegExp(`export function ${component}`).test(labsSource),
      `materials-labs.tsx must export the ${id} bench component`,
    );
  }
});

test("materials table holds sane engineering values", () => {
  assert.ok(MATERIALS.length >= 8);
  for (const m of MATERIALS) {
    assert.ok(m.E > 0, `${m.name}: E must be positive`);
    assert.ok(m.uts >= m.yieldStrength, `${m.name}: UTS must be >= yield`);
    assert.ok(m.fractureStrain > 0, `${m.name}: fracture strain must be positive`);
    if (m.brittle) {
      assert.equal(m.uts, m.yieldStrength, `${m.name}: brittle materials fracture in the elastic line`);
    }
  }
});

test("generated curves are well-formed", () => {
  const steel = MATERIALS[0];
  const curve = generateCurve(steel, { noise: 0, seed: 1 });
  assert.equal(curve.length, 200);
  assert.equal(curve[0].strain, 0);
  assert.equal(curve[0].stress, 0);
  for (let i = 1; i < curve.length; i++) {
    assert.ok(curve[i].strain > curve[i - 1].strain, "strain must increase monotonically");
    assert.ok(curve[i].stress >= 0, "stress must not go negative");
  }
  const last = curve[curve.length - 1];
  assert.ok(Math.abs(last.strain - steel.fractureStrain) < 1e-9, "curve must end at fracture strain");
});

test("offset yield recovers the book value on clean data", () => {
  for (const m of [MATERIALS[0], MATERIALS[2], MATERIALS[3]]) {
    const curve = generateCurve(m, { noise: 0, seed: 1 });
    const found = offsetYield(curve, m.E);
    assert.ok(found !== null, `${m.name}: offset yield must be found`);
    assert.ok(
      Math.abs(found - m.yieldStrength) / m.yieldStrength < 0.03,
      `${m.name}: offset yield ${found?.toFixed(1)} too far from ${m.yieldStrength}`,
    );
  }
});

test("offset yield returns null for brittle materials", () => {
  const glass = MATERIALS.find((m) => m.name === "Soda-lime glass")!;
  const curve = generateCurve(glass, { noise: 0, seed: 1 });
  assert.equal(offsetYield(curve, glass.E), null);
});

test("modulus estimation stops at the proportional limit", () => {
  for (const m of MATERIALS) {
    const curve = generateCurve(m, { noise: 0.008, seed: 7 });
    const E = estimateModulus(curve);
    assert.ok(
      Math.abs(E - m.E) / m.E < 0.03,
      `${m.name}: estimated E ${(E / 1000).toFixed(1)} GPa too far from ${(m.E / 1000).toFixed(1)} GPa`,
    );
  }
});

test("toughness separates the brittle from the ductile", () => {
  const steel = generateCurve(MATERIALS[0], { noise: 0, seed: 1 });
  const glass = generateCurve(MATERIALS.find((m) => m.name === "Soda-lime glass")!, { noise: 0, seed: 1 });
  const steelTough = toughness(steel);
  const glassTough = toughness(glass);
  assert.ok(steelTough > 100, `steel toughness ${steelTough.toFixed(1)} MJ/m³ should be large`);
  assert.ok(glassTough < 1, `glass toughness ${glassTough.toFixed(3)} MJ/m³ should be tiny`);
  assert.ok(steelTough / glassTough > 100, "toughness ratio must span orders of magnitude");
});

test("extraction recovers parameters from noisy data within bench tolerances", () => {
  // Bench tolerances: E ±8%, yield ±12%, UTS ±6%, elongation ±10%.
  for (const m of [MATERIALS[0], MATERIALS[2], MATERIALS[3], MATERIALS[1], MATERIALS[5]]) {
    const curve = generateCurve(m, { noise: 0.008, seed: 42 });
    const e = extractParams(curve);
    assert.ok(Math.abs(e.E - m.E) / m.E < 0.08, `${m.name}: E extraction out of bench tolerance`);
    assert.ok(e.yieldStrength !== null, `${m.name}: practical materials must have a findable yield`);
    assert.ok(
      Math.abs(e.yieldStrength - m.yieldStrength) / m.yieldStrength < 0.12,
      `${m.name}: yield extraction out of bench tolerance`,
    );
    assert.ok(Math.abs(e.uts - m.uts) / m.uts < 0.06, `${m.name}: UTS extraction out of bench tolerance`);
    assert.ok(
      Math.abs(e.elongation - m.fractureStrain) / m.fractureStrain < 0.1,
      `${m.name}: elongation extraction out of bench tolerance`,
    );
  }
});

test("lesson worked numbers check out", () => {
  // Lesson 1: 12.5 mm bar, 42.9 kN at yield -> ~350 MPa.
  const area = (Math.PI / 4) * 12.5 * 12.5;
  const yieldStress = 42900 / area;
  assert.ok(Math.abs(yieldStress - 350) < 1, `bar yield stress ${yieldStress.toFixed(1)} MPa should be ~350 MPa`);
  // Lesson 3: 865 MPa characteristic / 1.5 -> ~577 MPa allowable.
  assert.ok(Math.abs(designAllowable(865, 1.5) - 576.7) < 0.5);
});

test("designAllowable and reductionOfArea are the stated ratios", () => {
  assert.equal(designAllowable(600, 2), 300);
  assert.ok(Math.abs(reductionOfArea(100, 40) - 0.6) < 1e-12);
});
