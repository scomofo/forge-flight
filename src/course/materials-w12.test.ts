/**
 * Validation for the Materials 101 Week 12 batch (scout/materials-w12).
 *
 * Run with: node --experimental-strip-types --test src/course/materials-w12.test.ts
 * from the repo root. Imports are relative "./x.ts" so Node's type-stripping
 * resolves them without the @/ alias.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { materialsW12Lessons } from "./materials-w12.ts";
import {
  STRUCTURES,
  boundaryAreaPerVolume,
  cubicCellVolumeCm3,
  hallPetch,
  hcpCellVolumeCm3,
  latticeParameterPm,
  theoreticalDensity,
  type CrystalStructure,
} from "./microstructure.ts";
import { lessons, lessonsFor } from "./catalog.ts";

const here = dirname(fileURLToPath(import.meta.url));

test("week 12 opens the materials track in syllabus order", () => {
  assert.equal(materialsW12Lessons.length, 3);
  assert.deepEqual(
    materialsW12Lessons.map((l) => l.id),
    ["crystal", "graintex", "disorder"],
  );
  assert.deepEqual(
    materialsW12Lessons.map((l) => l.index),
    [4, 5, 6],
  );
  for (const l of materialsW12Lessons) assert.equal(l.track, "materials");
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
  for (const l of materialsW12Lessons) {
    assert.ok(lessons.includes(l), `week-12 lesson ${l.id} must be in lessons`);
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

test("week-12 lessons keep the lesson contract", () => {
  for (const lesson of materialsW12Lessons) {
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

test("week-12 bench ids are registered in the bench index", () => {
  const indexSource = readFileSync(join(here, "..", "components", "bench", "index.tsx"), "utf8");
  const registered = new Set(
    [...indexSource.matchAll(/case\s+"([\w-]+)"/g)].map((m) => m[1]),
  );
  for (const lesson of materialsW12Lessons) {
    assert.ok(
      registered.has(lesson.bench),
      `bench id "${lesson.bench}" from ${lesson.id} must have a case in bench/index.tsx`,
    );
  }
  const labsSource = readFileSync(join(here, "..", "components", "bench", "materials-labs.tsx"), "utf8");
  for (const [id, component] of [
    ["unitcell", "UnitCell"],
    ["microinterp", "MicroInterp"],
    ["glassform", "GlassForm"],
  ] as const) {
    assert.ok(
      new RegExp(`export function ${component}Bench`).test(labsSource),
      `materials-labs.tsx must export the ${id} bench component`,
    );
  }
});

test("structure table holds the standard crystallography numbers", () => {
  const expect = (
    s: CrystalStructure,
    atoms: number,
    coordination: number,
    packing: number,
    slip: number,
  ) => {
    const row = STRUCTURES[s];
    assert.equal(row.atomsPerCell, atoms, `${s} atoms per cell`);
    assert.equal(row.coordination, coordination, `${s} coordination`);
    assert.ok(Math.abs(row.packing - packing) < 0.005, `${s} packing`);
    assert.equal(row.slipSystems, slip, `${s} slip systems`);
  };
  expect("sc", 1, 6, 0.52, 6);
  expect("bcc", 2, 8, 0.68, 12);
  expect("fcc", 4, 12, 0.74, 12);
  expect("hcp", 6, 12, 0.74, 3);
});

test("lattice parameter follows the hard-sphere geometry", () => {
  const r = 143; // pm, aluminum
  assert.ok(Math.abs(latticeParameterPm("sc", r) - 2 * r) < 1e-9);
  assert.ok(Math.abs(latticeParameterPm("bcc", r) - (4 * r) / Math.sqrt(3)) < 1e-9);
  assert.ok(Math.abs(latticeParameterPm("fcc", r) - 2 * Math.SQRT2 * r) < 1e-9);
  assert.ok(Math.abs(latticeParameterPm("hcp", r) - 2 * r) < 1e-9);
  // The lesson's worked case: Al, r = 143 pm -> a ≈ 404 pm
  assert.ok(Math.abs(latticeParameterPm("fcc", 143) - 404) < 1, "Al lattice parameter ≈ 404 pm");
});

test("theoretical density recovers the aluminum datasheet number", () => {
  const a = latticeParameterPm("fcc", 143);
  const rho = theoreticalDensity(26.98, STRUCTURES.fcc.atomsPerCell, cubicCellVolumeCm3(a));
  assert.ok(Math.abs(rho - 2.7) < 0.05, `Al density ${rho} should be ≈ 2.70 g/cm³`);
  // Iron BCC sanity: a = 286.6 pm -> r = a√3/4 ≈ 124 pm -> ~7.87 g/cm³
  // (metallic radii shrink slightly at lower coordination — the bench's note says so)
  const aFe = latticeParameterPm("bcc", 124);
  const rhoFe = theoreticalDensity(55.85, STRUCTURES.bcc.atomsPerCell, cubicCellVolumeCm3(aFe));
  assert.ok(Math.abs(rhoFe - 7.87) < 0.05, `Fe density ${rhoFe} should be ≈ 7.87 g/cm³`);
  // HCP cell volume exceeds the cubic formula's; magnesium check ≈ 1.74 g/cm³
  const aMg = latticeParameterPm("hcp", 160);
  const rhoMg = theoreticalDensity(24.31, STRUCTURES.hcp.atomsPerCell, hcpCellVolumeCm3(aMg));
  assert.ok(Math.abs(rhoMg - 1.74) < 0.1, `Mg density ${rhoMg} should be ≈ 1.74 g/cm³`);
});

test("hall-petch matches the lesson's worked numbers", () => {
  // 25 µm -> 200 MPa, 100 µm -> 150 MPa (σ₀ = 100, k = 0.50)
  assert.ok(Math.abs(hallPetch(100, 0.5, 25) - 200) < 0.5);
  assert.ok(Math.abs(hallPetch(100, 0.5, 100) - 150) < 0.5);
  // Finer is stronger, monotonic
  assert.ok(hallPetch(100, 0.5, 10) > hallPetch(100, 0.5, 25));
});

test("boundary area per volume scales as 1/d", () => {
  const fine = boundaryAreaPerVolume(10);
  const coarse = boundaryAreaPerVolume(100);
  assert.ok(Math.abs(fine / coarse - 10) < 1e-9, "ten times finer -> ten times the boundary area");
  assert.ok(fine > 0);
});
