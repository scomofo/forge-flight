/**
 * Validation for the Materials 101 Week 17 batch (scout/materials-w17).
 *
 * Run with: node --experimental-strip-types --test src/course/materials-w17.test.ts
 * from the repo root. Imports are relative "./x.ts" so Node's type-stripping
 * resolves them without the @/ alias.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { materialsW17Lessons } from "./materials-w17.ts";
import {
  CU_NI,
  PB_SN,
  coringSpread,
  eutecticRegionAt,
  eutecticTieLineAt,
  isoRegionAt,
  isoSolidificationPath,
  isoTieLineAt,
  leverFractions,
} from "./phasediagrams.ts";
import { lessons, lessonsFor } from "./catalog.ts";

const here = dirname(fileURLToPath(import.meta.url));
const close = (a: number, b: number, tol: number, msg: string) =>
  assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);

test("week 17 opens the materials track in syllabus order", () => {
  assert.equal(materialsW17Lessons.length, 3);
  assert.deepEqual(
    materialsW17Lessons.map((l) => l.id),
    ["phasediagram", "leverrule", "transformations"],
  );
  assert.deepEqual(
    materialsW17Lessons.map((l) => l.index),
    [19, 20, 21],
  );
  for (const l of materialsW17Lessons) assert.equal(l.track, "materials");
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
  for (const l of materialsW17Lessons) {
    assert.ok(lessons.includes(l), `week-17 lesson ${l.id} must be in lessons`);
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

test("week-17 lessons keep the lesson contract", () => {
  for (const lesson of materialsW17Lessons) {
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

test("week-17 bench ids are registered in the bench index", () => {
  const indexSource = readFileSync(join(here, "..", "components", "bench", "index.tsx"), "utf8");
  const registered = new Set(
    [...indexSource.matchAll(/case\s+"([\w-]+)"/g)].map((m) => m[1]),
  );
  for (const lesson of materialsW17Lessons) {
    assert.ok(
      registered.has(lesson.bench),
      `bench id "${lesson.bench}" from ${lesson.id} must have a case in bench/index.tsx`,
    );
  }
  const labs = readFileSync(join(here, "..", "components", "bench", "materials-labs.tsx"), "utf8");
  for (const name of ["PhaseSetBench", "SolidifyBench"]) {
    assert.ok(
      new RegExp(`export function ${name}\\b`).test(labs),
      `materials-labs.tsx must export ${name}`,
    );
  }
});

test("lever rule follows from the weighted average", () => {
  // Lesson 2 worked example: Cu–40Ni at 1220°C, tie 36.5 → 42.2.
  const { wA, wB } = leverFractions(40, 36.5, 42.2);
  close(wA, 0.386, 0.002, "liquid fraction");
  close(wB, 0.614, 0.002, "solid fraction");
  close(wA + wB, 1, 1e-12, "fractions sum to one");
  // Midpoint alloy splits 50/50.
  const mid = leverFractions(50, 30, 70);
  close(mid.wA, 0.5, 1e-12, "midpoint");
  // Alloy on a tie-line end is 100% that phase.
  const end = leverFractions(36.5, 36.5, 42.2);
  close(end.wA, 1, 1e-12, "on the end");
  assert.throws(() => leverFractions(40, 40, 40), /zero length/);
});

test("Cu–Ni model pins the lesson worked numbers", () => {
  // Lesson 1: Cu–30Ni — liquidus 1196°C, solidus 1181°C.
  close(CU_NI.liquidus(30), 1196, 1e-9, "liquidus at 30%");
  close(CU_NI.solidus(30), 1181, 1e-9, "solidus at 30%");
  // Tie line at 1190°C: 28.4 liquid, 32.8 solid.
  const tie = isoTieLineAt(30, 1190);
  assert.ok(tie, "30% Ni at 1190°C must be two-phase");
  close(tie.cLeft, 28.38, 0.05, "liquid composition");
  close(tie.cRight, 32.81, 0.05, "solid composition");
  assert.equal(isoRegionAt(30, 1400), "L");
  assert.equal(isoRegionAt(30, 1100), "alpha");
  assert.equal(isoRegionAt(30, 1190), "L+alpha");
  assert.equal(isoTieLineAt(30, 1400), null);
});

test("Pb–Sn model reads the problem-set fields correctly", () => {
  assert.equal(eutecticRegionAt(20, 250), "L+alpha");
  assert.equal(eutecticRegionAt(70, 150), "alpha+beta");
  assert.equal(eutecticRegionAt(61.9, 183), "eutectic");
  assert.equal(eutecticRegionAt(10, 100), "alpha");
  assert.equal(eutecticRegionAt(40, 200), "L+alpha");
  assert.equal(eutecticRegionAt(90, 210), "L+beta");
  assert.equal(eutecticRegionAt(50, 400), "L");
  // Corrected valley topology: above Te the liquid sits between the liquidus lines.
  assert.equal(eutecticRegionAt(70, 210), "L");
  assert.equal(eutecticRegionAt(30, 210), "L+alpha");
  // Problem 5: Pb–40Sn at 200°C — tie line and primary fractions.
  const tie = eutecticTieLineAt(40, 200);
  assert.ok(tie, "40% Sn at 200°C must be two-phase");
  close(tie.cLeft, 16.9, 0.2, "solidus (low) end");
  close(tie.cRight, 54.6, 0.2, "liquidus (high) end");
  const { wA, wB } = leverFractions(40, tie.cLeft, tie.cRight);
  close(wA, 0.39, 0.02, "primary alpha (low-end) fraction");
  close(wB, 0.61, 0.02, "liquid (high-end) fraction");
  // Lesson 3 worked example: primary α just above the eutectic.
  const prim = leverFractions(40, PB_SN.solvusAlpha(183), PB_SN.eutecticC);
  close(prim.wA, 0.513, 0.003, "primary alpha at eutectic");
  assert.equal(eutecticTieLineAt(61.9, 183), null, "eutectic point has no single tie line");
});

test("solidification path runs liquidus to solidus with lever fractions", () => {
  const path = isoSolidificationPath(30, 5);
  assert.ok(path.length >= 3, "path must have several steps");
  close(path[0].t, 1196, 1e-9, "path starts at liquidus");
  close(path[path.length - 1].t, 1181, 1e-9, "path ends at solidus");
  for (const s of path) {
    close(s.wL + s.wS, 1, 1e-9, "fractions sum to one");
    assert.ok(s.cL <= 30 && 30 <= s.cS, "alloy lies between tie-line ends");
  }
  close(path[0].wL, 1, 1e-9, "all liquid at liquidus");
  close(path[path.length - 1].wS, 1, 1e-9, "all solid at solidus");
  // Coring: first solid is Ni-rich, last solid is the alloy itself.
  const spread = coringSpread(30);
  close(spread.core, 34.7, 0.1, "cored dendrite core");
  close(spread.rim, 30, 1e-9, "rim is the alloy composition");
  assert.throws(() => isoSolidificationPath(0), /\(0, 100\)/);
});
