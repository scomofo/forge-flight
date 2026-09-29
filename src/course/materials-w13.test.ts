/**
 * Validation for the Materials 101 Week 13 batch (scout/materials-w13).
 *
 * Run with: node --experimental-strip-types --test src/course/materials-w13.test.ts
 * from the repo root. Imports are relative "./x.ts" so Node's type-stripping
 * resolves them without the @/ alias.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { materialsW13Lessons } from "./materials-w13.ts";
import {
  arrheniusD,
  caseDepth,
  concentrationProfile,
  DIFFUSANTS,
  diffusionLength,
  equivalentTime,
  erfc,
  erf,
  inverseErf,
  vacancyFraction,
  VACANCY_QV_EV,
} from "./diffusion.ts";
import { lessons, lessonsFor } from "./catalog.ts";

const here = dirname(fileURLToPath(import.meta.url));

test("week 13 opens the materials track in syllabus order", () => {
  assert.equal(materialsW13Lessons.length, 3);
  assert.deepEqual(
    materialsW13Lessons.map((l) => l.id),
    ["defects", "diffusion", "heat-treat"],
  );
  assert.deepEqual(
    materialsW13Lessons.map((l) => l.index),
    [7, 8, 9],
  );
  for (const l of materialsW13Lessons) assert.equal(l.track, "materials");
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
  for (const l of materialsW13Lessons) {
    assert.ok(lessons.includes(l), `week-13 lesson ${l.id} must be in lessons`);
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

test("week-13 lessons keep the lesson contract", () => {
  for (const lesson of materialsW13Lessons) {
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

test("week-13 bench ids are registered in the bench index", () => {
  const indexSource = readFileSync(join(here, "..", "components", "bench", "index.tsx"), "utf8");
  const registered = new Set(
    [...indexSource.matchAll(/case\s+"([\w-]+)"/g)].map((m) => m[1]),
  );
  for (const lesson of materialsW13Lessons) {
    assert.ok(
      registered.has(lesson.bench),
      `bench id "${lesson.bench}" from ${lesson.id} must have a case in bench/index.tsx`,
    );
  }
  const labsSource = readFileSync(join(here, "..", "components", "bench", "materials-labs.tsx"), "utf8");
  assert.ok(/export function DefectBench/.test(labsSource), "materials-labs.tsx must export DefectBench");
  assert.ok(/export function DiffProfileBench/.test(labsSource), "materials-labs.tsx must export DiffProfileBench");
});

test("erf matches known values", () => {
  assert.ok(Math.abs(erf(0) - 0) < 1e-9);
  assert.ok(Math.abs(erf(0.5) - 0.5204998778) < 1e-6, `erf(0.5) = ${erf(0.5)}`);
  assert.ok(Math.abs(erf(1) - 0.8427007929) < 1e-6, `erf(1) = ${erf(1)}`);
  assert.ok(Math.abs(erf(-0.7) + erf(0.7)) < 1e-12, "erf must be odd");
  assert.ok(Math.abs(erfc(0.5) - (1 - 0.5204998778)) < 1e-6);
});

test("inverseErf inverts erf", () => {
  for (const y of [0, 0.2, 0.5, 0.7778, -0.9]) {
    assert.ok(Math.abs(erf(inverseErf(y)) - y) < 1e-9, `inverseErf(${y})`);
  }
  assert.throws(() => inverseErf(1), /inverseErf/);
});

test("arrheniusD gives the lesson's carburizing number", () => {
  const D = arrheniusD(2.3e-5, 148e3, 950 + 273.15);
  assert.ok(Math.abs(D - 1.0994e-11) / 1.0994e-11 < 1e-3, `D(950C) = ${D}`);
  const D900 = arrheniusD(2.3e-5, 148e3, 900 + 273.15);
  assert.ok(D900 < D, "D must fall with temperature");
  assert.ok(Math.abs(D / D900 - 1.86) < 0.02, `D ratio 950/900 = ${D / D900}`);
});

test("diffusionLength and the 4-hour carburizing case", () => {
  const D = arrheniusD(2.3e-5, 148e3, 1223.15);
  const L = diffusionLength(D, 4 * 3600);
  assert.ok(Math.abs(L * 1000 - 0.7958) < 0.005, `2sqrt(Dt) = ${L * 1000} mm`);
});

test("concentrationProfile honors its boundary conditions", () => {
  const D = arrheniusD(2.3e-5, 148e3, 1223.15);
  assert.ok(Math.abs(concentrationProfile(1.1, 0.2, D, 14400, 0) - 1.1) < 1e-12, "surface must be Cs");
  const deep = concentrationProfile(1.1, 0.2, D, 14400, 0.1);
  assert.ok(Math.abs(deep - 0.2) < 1e-3, `deep inside must be ~C0, got ${deep}`);
  const mid = concentrationProfile(1.1, 0.2, D, 14400, 0.0004);
  assert.ok(mid < 1.1 && mid > 0.2, "profile must decay monotonically-ish between bounds");
});

test("caseDepth matches the lesson's worked number", () => {
  const D = arrheniusD(2.3e-5, 148e3, 1223.15);
  const x = caseDepth(1.1, 0.2, 0.4, D, 4 * 3600);
  assert.ok(Math.abs(x * 1000 - 0.6869) < 0.005, `case depth = ${x * 1000} mm`);
  // round-trip: the profile at the case depth must read Cx
  const c = concentrationProfile(1.1, 0.2, D, 4 * 3600, x);
  assert.ok(Math.abs(c - 0.4) < 1e-6, `profile at case depth = ${c}`);
  assert.throws(() => caseDepth(1.1, 0.2, 1.5, D, 3600), /C0 < Cx < Cs/);
});

test("equivalentTime prices the time-temperature trade", () => {
  const D950 = arrheniusD(2.3e-5, 148e3, 1223.15);
  const D900 = arrheniusD(2.3e-5, 148e3, 1173.15);
  const t2 = equivalentTime(4 * 3600, D950, D900) / 3600;
  assert.ok(Math.abs(t2 - 7.438) < 0.02, `equivalent time = ${t2} h`);
  assert.throws(() => equivalentTime(3600, D950, 0), /D2 > 0/);
});

test("vacancyFraction matches the lesson's worked numbers", () => {
  assert.ok(
    Math.abs(vacancyFraction(VACANCY_QV_EV, 1000) - 2.9121e-5) / 2.9121e-5 < 1e-3,
    `nv(1000K) = ${vacancyFraction(VACANCY_QV_EV, 1000)}`,
  );
  assert.ok(
    Math.abs(vacancyFraction(VACANCY_QV_EV, 300) - 7.5974e-16) / 7.5974e-16 < 1e-3,
    `nv(300K) = ${vacancyFraction(VACANCY_QV_EV, 300)}`,
  );
});

test("DIFFUSANTS table is sane", () => {
  assert.ok(DIFFUSANTS.length >= 2);
  const ids = new Set(DIFFUSANTS.map((d) => d.id));
  assert.equal(ids.size, DIFFUSANTS.length, "diffusant ids must be unique");
  for (const d of DIFFUSANTS) {
    assert.ok(d.D0 > 0 && d.Q > 0, `${d.id} needs positive D0 and Q`);
    const D = arrheniusD(d.D0, d.Q, 1200);
    assert.ok(D > 0 && D < d.D0, `${d.id} D(1200K) must be positive and below D0`);
  }
});
