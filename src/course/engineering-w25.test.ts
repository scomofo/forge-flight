/**
 * Validation for the Engineering 101 Week 25 batch (scout/engineering-w25).
 *
 * Run with: node --experimental-strip-types --test src/course/engineering-w25.test.ts
 * from the repo root. Imports are relative "./x.ts" so Node's type-stripping
 * resolves them without the @/ alias.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { engineeringW25Lessons } from "./engineering-w25.ts";
import {
  ASSEMBLY_BRIEFS,
  adhesiveBondArea,
  assemblyBrief,
  boltLapJoint,
  galvanicRisk,
  interfaceVerdict,
  material,
  thermalMismatchStress,
  weldVerdict,
} from "./joints.ts";
import { lessons, lessonsFor } from "./catalog.ts";

const here = dirname(fileURLToPath(import.meta.url));

test("week 25 continues the engineering track in syllabus order", () => {
  assert.equal(engineeringW25Lessons.length, 3);
  assert.deepEqual(
    engineeringW25Lessons.map((l) => l.id),
    ["indicescontext", "interfaces", "systemdecision"],
  );
  assert.deepEqual(
    engineeringW25Lessons.map((l) => l.index),
    [13, 14, 15],
  );
  for (const l of engineeringW25Lessons) assert.equal(l.track, "engineering");
  const engineering = lessonsFor("engineering");
  assert.equal(engineering.length, 41, "engineering track must hold weeks 21-30 plus the 11 legacy lessons");
  assert.deepEqual(
    engineering.map((l) => l.id),
    [
      "requirements",
      "verifyvalidate",
      "ledger",
      "modelvalid",
      "errprop",
      "sensitivity",
      "loadpath",
      "margins",
      "fmea",
      "bending",
      "buckle",
      "combined",
      "indicescontext",
      "interfaces",
      "systemdecision",
      "processes",
      "tolerances",
      "dfm",
      "doeplan",
      "smallsample",
      "honestgraph",
      "tradestudy",
      "paramsweep",
      "convergence",
      "safetyfactor",
      "standards",
      "designreview",
      "capmethod",
      "glidersynth",
      "capmastery",
      "design",
      "equilibrium",
      "stress",
      "beams",
      "tradeoffs",
      "failure",
      "notch",
      "fatigue",
      "crack",
      "bolt",
      "mean",
    ],
  );
  assert.deepEqual(
    engineering.map((l) => l.index),
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41],
  );
  for (const l of engineeringW25Lessons) {
    assert.ok(lessons.includes(l), `week-25 lesson ${l.id} must be in lessons`);
  }
});

test("no duplicate lesson ids across the catalog", () => {
  const seen = new Set<string>();
  for (const lesson of lessons) {
    assert.ok(!seen.has(`${lesson.track}/${lesson.id}`), `duplicate ${lesson.track}/${lesson.id}`);
    seen.add(`${lesson.track}/${lesson.id}`);
  }
});

test("week-25 lessons satisfy the lesson contract", () => {
  for (const lesson of engineeringW25Lessons) {
    assert.equal(lesson.start.split(" || ").length, 3, `${lesson.id}: start must have 3 parts`);
    assert.equal(lesson.use.split(" || ").length, 3, `${lesson.id}: use must have 3 parts`);
    assert.equal(lesson.example.split(" || ").length, 3, `${lesson.id}: example must have 3 parts`);
    assert.equal(lesson.ideas.length, 3, `${lesson.id}: exactly 3 ideas`);
    assert.equal(lesson.checks.length, 4, `${lesson.id}: exactly 4 checks`);
    for (const check of lesson.checks) {
      assert.equal(check.options.length, 4, `${lesson.id}: check needs 4 options`);
      assert.ok(check.answer >= 0 && check.answer <= 3, `${lesson.id}: answer in range`);
      assert.ok(check.why.trim().length > 0, `${lesson.id}: why must explain`);
    }
    assert.ok(
      lesson.bench === "jointrecord" || lesson.bench === "jointstrength",
      `${lesson.id}: bench must be registered`,
    );
    assert.ok(lesson.prompt.trim().length > 0, `${lesson.id}: prompt must exist`);
    assert.ok(lesson.note.trim().length > 0, `${lesson.id}: note must exist`);
    assert.ok(lesson.minutes > 0, `${lesson.id}: minutes positive`);
  }
});

test("week-25 bench ids are registered in the bench index", () => {
  const indexSource = readFileSync(join(here, "..", "components", "bench", "index.tsx"), "utf8");
  const registered = new Set(
    [...indexSource.matchAll(/case\s+"([\w-]+)"/g)].map((m) => m[1]),
  );
  for (const lesson of engineeringW25Lessons) {
    assert.ok(
      registered.has(lesson.bench),
      `bench id "${lesson.bench}" from ${lesson.id} must have a case in bench/index.tsx`,
    );
  }
  const labsSource = readFileSync(join(here, "..", "components", "bench", "engineering-w25-labs.tsx"), "utf8");
  assert.ok(labsSource.includes("export function JointRecordBench"), "JointRecordBench must be exported");
  assert.ok(labsSource.includes("export function JointStrengthBench"), "JointStrengthBench must be exported");
});

test("thermal mismatch matches the lesson's worked numbers", () => {
  // Steel bolt in aluminum cleat, 80 °C swing: 70 GPa × 11e-6 × 80.
  const sigma = thermalMismatchStress(70, 11e-6, 80);
  assert.ok(Math.abs(sigma - 61.6) < 0.05, `expected ≈61.6 MPa, got ${sigma}`);
  assert.ok(sigma / 240 > 0.25, "a quarter of 6061-T6 yield");
  // Aluminum on stainless, 60 °C: 68 GPa × 6e-6 × 60 ≈ 24.5 MPa.
  const mild = thermalMismatchStress(68, 6e-6, 60);
  assert.ok(Math.abs(mild - 24.48) < 0.05, `expected ≈24.5 MPa, got ${mild}`);
  assert.equal(thermalMismatchStress(200, 0, 80), 0, "no Δα means no stress");
});

test("bolted lap joint matches the lesson's worked numbers", () => {
  // M8, 3 kN, 4 mm plate, single shear.
  const { bearingMPa, shearMPa } = boltLapJoint(3000, 8, 4, 1);
  assert.ok(Math.abs(bearingMPa - 93.75) < 1e-9, `bearing: expected 93.75, got ${bearingMPa}`);
  assert.ok(Math.abs(shearMPa - 59.68) < 0.01, `shear: expected ≈59.68, got ${shearMPa}`);
  const double = boltLapJoint(3000, 8, 4, 2);
  assert.ok(Math.abs(double.shearMPa - shearMPa / 2) < 1e-9, "double shear halves bolt shear");
  assert.equal(double.bearingMPa, bearingMPa, "bearing is per plate, unchanged");
});

test("adhesive bond area matches the lesson's worked number", () => {
  // 20 kN at 15 MPa allowable → 1,333 mm².
  const area = adhesiveBondArea(20000, 15);
  assert.ok(Math.abs(area - 1333.33) < 0.01, `expected ≈1333 mm², got ${area}`);
});

test("galvanic risk flags the carbon/aluminum couple", () => {
  const cfrp = material("cfrp");
  const al = material("al6061");
  const salt = galvanicRisk(cfrp, al, "saltwater");
  assert.equal(salt.level, "high");
  assert.equal(salt.anode, "B", "aluminum is the anode");
  assert.ok(Math.abs(salt.gapV - 1.0) < 1e-9, `gap should be 1.0 V, got ${salt.gapV}`);

  const steel = material("steel1018");
  const mild = galvanicRisk(al, steel, "saltwater");
  assert.equal(mild.level, "low", "0.15 V gap is modest even in saltwater");

  const gfrp = material("gfrp");
  assert.equal(galvanicRisk(gfrp, steel, "saltwater").level, "none", "non-conductive side: no cell");
  assert.equal(galvanicRisk(steel, steel, "saltwater").level, "low");
});

test("weld verdicts follow the material table", () => {
  const al = material("al6061");
  const steel = material("steel1018");
  const cfrp = material("cfrp");

  const alAl = weldVerdict(al, al);
  assert.equal(alAl.ok, true);
  assert.equal(alAl.efficiency, 0.7, "TIG 6061-T6 keeps 70% through the HAZ");

  const steelSteel = weldVerdict(steel, steel);
  assert.equal(steelSteel.ok, true);
  assert.equal(steelSteel.efficiency, 1.0);

  assert.equal(weldVerdict(cfrp, cfrp).ok, false, "composites cannot be fusion welded");
  assert.equal(weldVerdict(al, steel).ok, false, "dissimilar Al/steel is not a TIG process");
  assert.ok(weldVerdict(material("al2024"), material("al2024")).notes.join(" ").includes("crack"), "2024 warns about cracking");
});

test("interface verdicts tell the brief stories", () => {
  const steel = material("steel1018");
  const al = material("al6061");
  const cfrp = material("cfrp");
  const ss = material("ss304");

  // Tow-hook: steel welded to steel is the boring winner.
  const steelWeld = interfaceVerdict(steel, steel, "tig", "saltwater");
  assert.equal(steelWeld.ok, true);
  assert.equal(steelWeld.strengthFraction, 1.0);

  // CFRP cannot be TIG welded to the steel receiver.
  const cfrpWeld = interfaceVerdict(cfrp, steel, "tig", "saltwater");
  assert.equal(cfrpWeld.ok, false);

  // Aluminum bolted to steel in salt spray: galvanic gap is only 0.15 V → low, stands with isolation note.
  const alBolt = interfaceVerdict(al, steel, "bolt", "saltwater");
  assert.equal(alBolt.ok, true, "0.15 V galvanic gap should not block the aluminum option");

  // Railing: stainless bolted to aluminum in saltwater → high galvanic risk blocks it.
  const ssAl = interfaceVerdict(ss, al, "bolt", "saltwater");
  assert.equal(ssAl.ok, false);
  assert.ok(ssAl.issues.join(" ").includes("Galvanic"), "the cause of death must name galvanic corrosion");

  // Adhesive always carries its classroom fraction.
  const bonded = interfaceVerdict(al, al, "adhesive", "dry");
  assert.equal(bonded.ok, true);
  assert.equal(bonded.strengthFraction, 0.5);
});

test("assembly briefs are well-formed", () => {
  assert.equal(ASSEMBLY_BRIEFS.length, 3);
  for (const brief of ASSEMBLY_BRIEFS) {
    assert.ok(brief.title.length > 0);
    assert.ok(brief.parts.length > 0);
    assert.ok(brief.interfaces.length > 0);
    for (const part of brief.parts) {
      for (const id of part.options) material(id); // throws on unknown
    }
    for (const j of brief.interfaces) {
      assert.ok(j.methods.length > 0);
    }
    assert.ok(brief.lesson.length > 0, `${brief.id}: must teach its lesson`);
  }
  assert.equal(assemblyBrief("towhook").env, "saltwater");
  assert.throws(() => assemblyBrief("nope"), /unknown brief/);
  assert.throws(() => material("unobtainium"), /unknown material/);
});
