/**
 * Validation for the Materials 101 Week 18 batch (scout/materials-w18).
 *
 * Run with: node --experimental-strip-types --test src/course/materials-w18.test.ts
 * from the repo root. Imports are relative "./x.ts" so Node's type-stripping
 * resolves them without the @/ alias.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { materialsW18Lessons } from "./materials-w18.ts";
import {
  anisotropyRatio,
  creepOnsetC,
  FAMILIES,
  PROFILES,
  reussModulus,
  screenFamilies,
  specificModulus,
  specificStrength,
  survivors,
  thermalShockStress,
  voigtModulus,
} from "./families.ts";
import { lessons, lessonsFor } from "./catalog.ts";

const here = dirname(fileURLToPath(import.meta.url));

test("week 18 opens the materials track in syllabus order", () => {
  assert.equal(materialsW18Lessons.length, 3);
  assert.deepEqual(
    materialsW18Lessons.map((l) => l.id),
    ["famlook", "dirtemp", "choosefam"],
  );
  assert.deepEqual(
    materialsW18Lessons.map((l) => l.index),
    [22, 23, 24],
  );
  for (const l of materialsW18Lessons) assert.equal(l.track, "materials");
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
  for (const l of materialsW18Lessons) {
    assert.ok(lessons.includes(l), `week-18 lesson ${l.id} must be in lessons`);
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

test("week-18 lessons keep the lesson contract", () => {
  for (const lesson of materialsW18Lessons) {
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

test("week-18 bench ids are registered in the bench index", () => {
  const indexSource = readFileSync(join(here, "..", "components", "bench", "index.tsx"), "utf8");
  const registered = new Set(
    [...indexSource.matchAll(/case\s+"([\w-]+)"/g)].map((m) => m[1]),
  );
  for (const lesson of materialsW18Lessons) {
    assert.ok(
      registered.has(lesson.bench),
      `bench id "${lesson.bench}" from ${lesson.id} must have a case in bench/index.tsx`,
    );
  }
  const labsSource = readFileSync(join(here, "..", "components", "bench", "materials-labs.tsx"), "utf8");
  for (const [id, name] of [
    ["famcompare", "FamCompareBench"],
    ["templim", "TempLimitBench"],
    ["famdecision", "FamDecisionBench"],
  ] as const) {
    assert.ok(
      new RegExp(`export function ${name}\\b`).test(labsSource),
      `materials-labs.tsx must export the ${id} bench component`,
    );
  }
});

test("family profiles cover the four families with sane envelopes", () => {
  assert.deepEqual(FAMILIES, ["metal", "ceramic", "polymer", "composite"]);
  for (const f of FAMILIES) {
    const p = PROFILES[f];
    assert.ok(p.density[0] < p.density[1], `${f} density envelope inverted`);
    assert.ok(p.modulus[0] < p.modulus[1], `${f} modulus envelope inverted`);
    assert.ok(p.strength[0] < p.strength[1], `${f} strength envelope inverted`);
    assert.ok(p.serviceTemp[0] < p.serviceTemp[1], `${f} temp envelope inverted`);
    assert.ok(p.diesBy.trim().length > 0, `${f} must name its failure mode`);
    assert.ok(p.tempStory.trim().length > 0, `${f} must explain its temperature limit`);
  }
  assert.equal(PROFILES.composite.directional, true, "composites must be flagged directional");
  assert.equal(PROFILES.metal.directional, false);
});

test("hot-bracket screens leave only ceramic standing", () => {
  const results = screenFamilies({ minServiceTemp: 900, minStrength: 50, corrosion: true });
  assert.deepEqual(survivors(results), ["ceramic"]);
  const metal = results.find((r) => r.family === "metal")!;
  assert.ok(metal.failedOn.some((s) => s.includes("900")), "metal must fail on temperature");
  const polymer = results.find((r) => r.family === "polymer")!;
  assert.ok(polymer.failedOn.some((s) => s.includes("900")), "polymer must fail on temperature");
  const composite = results.find((r) => r.family === "composite")!;
  assert.ok(composite.failedOn.some((s) => s.includes("900")), "composite must fail on temperature");
});

test("light-panel screens leave only composite standing", () => {
  const results = screenFamilies({ maxDensity: 2.0, minModulus: 50, minServiceTemp: 25 });
  assert.deepEqual(survivors(results), ["composite"]);
  const metal = results.find((r) => r.family === "metal")!;
  assert.ok(metal.failedOn.some((s) => s.includes("2.7")), "metal must fail on density at its best edge");
  const ceramic = results.find((r) => r.family === "ceramic")!;
  assert.ok(ceramic.failedOn.length > 0, "ceramic must fail the panel screens");
  const polymer = results.find((r) => r.family === "polymer")!;
  assert.ok(polymer.failedOn.some((s) => s.includes("50 GPa")), "polymer must fail on stiffness");
});

test("salt-fastener screens leave ceramic and composite, killing metal and polymer", () => {
  const results = screenFamilies({ corrosion: true, minStrength: 300 });
  assert.deepEqual(survivors(results), ["ceramic", "composite"]);
  const metal = results.find((r) => r.family === "metal")!;
  assert.ok(metal.failedOn.some((s) => s.includes("corrosion")), "metal must fail uncoated corrosion");
  const polymer = results.find((r) => r.family === "polymer")!;
  assert.ok(polymer.failedOn.some((s) => s.includes("300")), "polymer must fail on strength");
});

test("rule of mixtures bounds the 60% carbon/epoxy example", () => {
  assert.ok(Math.abs(voigtModulus(0.6, 230, 3) - 139.2) < 1e-9, "Voigt bound must be 139.2 GPa");
  assert.ok(Math.abs(reussModulus(0.6, 230, 3) - 7.356) < 0.01, "Reuss bound must be ≈7.36 GPa");
  const ratio = anisotropyRatio(0.6, 230, 3);
  assert.ok(ratio > 18 && ratio < 20, `anisotropy ratio ≈19, got ${ratio}`);
  // Bounds collapse when there is no contrast.
  assert.ok(Math.abs(voigtModulus(0.6, 100, 100) - 100) < 1e-9);
  assert.ok(Math.abs(reussModulus(0.6, 100, 100) - 100) < 1e-9);
});

test("thermal shock and creep estimates match the lesson numbers", () => {
  // Alumina quenched 500 K: 300 GPa × 8e-6/K × 500 K = 1200 MPa.
  assert.ok(Math.abs(thermalShockStress(300, 8e-6, 500) - 1200) < 1e-6);
  // Steel (Tm≈1538°C): 0.4×1811K − 273 ≈ 451°C. Aluminum (Tm≈660°C): ≈100°C.
  assert.ok(Math.abs(creepOnsetC(1538) - 451.3) < 0.2, `steel creep onset, got ${creepOnsetC(1538)}`);
  assert.ok(Math.abs(creepOnsetC(660) - 100.1) < 0.2, `aluminum creep onset, got ${creepOnsetC(660)}`);
});

test("specific properties rank the lesson's stiffness-per-mass example", () => {
  const steel = specificModulus(200, 7.85);
  const aluminum = specificModulus(69, 2.7);
  const cfrp = specificModulus(140, 1.55);
  assert.ok(Math.abs(steel - aluminum) < 1, `metals tie on specific stiffness: ${steel} vs ${aluminum}`);
  assert.ok(cfrp > 3 * steel, `CFRP wins by >3×: ${cfrp} vs ${steel}`);
  assert.ok(specificStrength(1500, 1.55) > specificStrength(400, 7.85));
});
