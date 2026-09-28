/**
 * Validation for the Materials 101 Week 15 batch (scout/materials-w15).
 *
 * Run with: node --experimental-strip-types --test src/course/materials-w15.test.ts
 * from the repo root. Imports are relative "./x.ts" so Node's type-stripping
 * resolves them without the @/ alias.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { materialsW15Lessons } from "./materials-w15.ts";
import {
  MECHANISMS,
  REQUIREMENTS,
  hallPetch,
  judge,
  outcome,
  solidSolution,
  workHarden,
} from "./strengthening.ts";
import { lessons, lessonsFor } from "./catalog.ts";

const here = dirname(fileURLToPath(import.meta.url));
const approx = (a: number, b: number, tol = 0.6) => Math.abs(a - b) <= tol;

test("week 15 opens the materials track in syllabus order", () => {
  assert.equal(materialsW15Lessons.length, 3);
  assert.deepEqual(
    materialsW15Lessons.map((l) => l.id),
    ["strengthen", "heattreat", "processchoice"],
  );
  assert.deepEqual(
    materialsW15Lessons.map((l) => l.index),
    [13, 14, 15],
  );
  for (const l of materialsW15Lessons) assert.equal(l.track, "materials");
  const materials = lessonsFor("materials");
  assert.equal(materials.length, 37, "materials track must hold weeks 11-20 plus the 7 legacy lessons");
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
      "families",
      "bonding",
      "curve",
      "compare",
      "grains",
      "selection",
      "birth",
    ],
  );
  assert.deepEqual(
    materials.map((l) => l.index),
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37],
  );
  for (const l of materialsW15Lessons) {
    assert.ok(lessons.includes(l), `week-15 lesson ${l.id} must be in lessons`);
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

test("week-15 lessons keep the lesson contract", () => {
  for (const lesson of materialsW15Lessons) {
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

test("week-15 bench ids are registered in the bench index", () => {
  const indexSource = readFileSync(join(here, "..", "components", "bench", "index.tsx"), "utf8");
  const registered = new Set(
    [...indexSource.matchAll(/case\s+"([\w-]+)"/g)].map((m) => m[1]),
  );
  for (const lesson of materialsW15Lessons) {
    assert.ok(
      registered.has(lesson.bench),
      `bench id "${lesson.bench}" from ${lesson.id} must have a case in bench/index.tsx`,
    );
  }
  const labsSource = readFileSync(join(here, "..", "components", "bench", "materials-labs.tsx"), "utf8");
  assert.ok(/export function StrengthExplorerBench/.test(labsSource), "materials-labs.tsx must export StrengthExplorerBench");
  assert.ok(/export function ProcessMemoBench/.test(labsSource), "materials-labs.tsx must export ProcessMemoBench");
});

test("Hall-Petch matches the lesson's worked numbers", () => {
  // Lesson 1 example: 1045 steel, σ₀=110 MPa, k=0.65 MPa·m^1/2
  assert.ok(approx(hallPetch(110, 0.65, 20), 255.3), "20 μm grains → ~255 MPa");
  assert.ok(approx(hallPetch(110, 0.65, 5), 400.7), "5 μm grains → ~401 MPa");
  assert.ok(approx(hallPetch(110, 0.65, 200), 156.0), "200 μm grains → ~156 MPa");
  assert.throws(() => hallPetch(110, 0.65, 0), /positive/);
  assert.throws(() => hallPetch(110, 0.65, -5), /positive/);
});

test("work hardening saturates and solid solution follows root-c", () => {
  // copper: annealed 70 MPa, saturating toward 330 MPa
  assert.ok(approx(workHarden(70, 330, 0.5), 272.0), "50% cold work → ~272 MPa");
  assert.equal(workHarden(70, 330, 0), 70, "no work, no gain");
  assert.ok(workHarden(70, 330, 0.9) < 330, "gain must saturate below the ceiling");
  assert.ok(workHarden(70, 330, 0.9) > workHarden(70, 330, 0.5), "more work, more strength");
  assert.throws(() => workHarden(70, 330, 1.5), /\[0, 1\]/);
  // Cu-30Zn brass
  assert.ok(approx(solidSolution(70, 350, 0.3), 261.7), "30% solute → ~262 MPa");
  assert.equal(solidSolution(70, 350, 0), 70, "no solute, no gain");
  assert.throws(() => solidSolution(70, 350, -0.1), /\[0, 1\]/);
});

test("mechanism table covers the four obstacles", () => {
  assert.equal(MECHANISMS.length, 4);
  assert.deepEqual(
    MECHANISMS.map((m) => m.id),
    ["grain", "work", "solution", "precip"],
  );
  for (const m of MECHANISMS) {
    assert.ok(m.obstacle.trim().length > 0, `${m.id} must name its obstacle`);
    assert.ok(m.price.trim().length > 0, `${m.id} must name its price`);
    assert.ok(m.gainRange[0] < m.gainRange[1], `${m.id} gain range must be ordered`);
  }
});

test("outcome table pins the lesson's worked cases", () => {
  const qt4140 = outcome("4140", "quench-temper");
  assert.ok(qt4140.compatible);
  assert.equal(qt4140.yield, 1300);
  assert.equal(qt4140.elong, 11);
  const cw1045 = outcome("1045", "coldwork");
  assert.ok(cw1045.compatible);
  assert.equal(cw1045.yield, 560);
  assert.equal(cw1045.elong, 6);
  const age2024 = outcome("2024", "solution-age");
  assert.ok(age2024.compatible);
  assert.equal(age2024.yield, 345);
  // metallurgical nonsense must be refused, with a reason
  const bad1 = outcome("2024", "quench-temper");
  assert.ok(!bad1.compatible);
  assert.ok((bad1.reason ?? "").length > 0);
  const bad2 = outcome("cu", "solution-age");
  assert.ok(!bad2.compatible);
  const bad3 = outcome("1045", "solution-age");
  assert.ok(!bad3.compatible);
});

test("judge screens against the requirement floors", () => {
  const bolt = REQUIREMENTS.find((r) => r.id === "bolt")!;
  const pass = judge(bolt, outcome("4140", "quench-temper"));
  assert.ok(pass.ok, "4140 Q&T must clear the bolt floors");
  assert.ok(approx(pass.margin ?? 0, 1300 / 800, 0.01), "margin is yield over floor");
  const fail = judge(bolt, outcome("1045", "coldwork"));
  assert.ok(!fail.ok, "cold-worked 1045 must miss the bolt floors");
  assert.ok(fail.reasons.length >= 2, "it misses both strength and elongation");
  const incompat = judge(bolt, outcome("2024", "quench-temper"));
  assert.ok(!incompat.ok);
  assert.ok(incompat.reasons.length === 1);
  const tool = REQUIREMENTS.find((r) => r.id === "tool")!;
  const hard = judge(tool, outcome("4140", "quench-only"));
  assert.ok(hard.ok, "untempered 4140 clears the 58 HRC tool floor");
  const soft = judge(tool, outcome("4140", "quench-temper"));
  assert.ok(!soft.ok, "tempered 4140 is too soft for the tool floor");
});
