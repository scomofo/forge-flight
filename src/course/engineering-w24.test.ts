/**
 * Validation for the Engineering 101 Week 24 batch (scout/engineering-w24).
 *
 * Run with: node --experimental-strip-types --test src/course/engineering-w24.test.ts
 * from the repo root. Imports are relative "./x.ts" so Node's type-stripping
 * resolves them without the @/ alias.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { engineeringW24Lessons } from "./engineering-w24.ts";
import {
  bendingStress,
  effectiveLength,
  eulerLoad,
  marginOfSafety,
  requiredSectionModulus,
  sectionProps,
  shaftDiameterVonMises,
  shaftVonMises,
  torsionalShear,
  twistAngle,
  vonMises,
} from "./mechanics.ts";
import { lessons, lessonsFor } from "./catalog.ts";

const here = dirname(fileURLToPath(import.meta.url));

const approx = (actual: number, expected: number, rel = 1e-3, label = "") => {
  assert.ok(
    Math.abs(actual - expected) / Math.abs(expected) <= rel,
    `${label}: expected ~${expected}, got ${actual}`,
  );
};

test("week 24 opens the engineering track in syllabus order", () => {
  assert.equal(engineeringW24Lessons.length, 3);
  assert.deepEqual(
    engineeringW24Lessons.map((l) => l.id),
    ["bending", "buckle", "combined"],
  );
  assert.deepEqual(
    engineeringW24Lessons.map((l) => l.index),
    [10, 11, 12],
  );
  for (const l of engineeringW24Lessons) assert.equal(l.track, "engineering");
  const eng = lessonsFor("engineering");
  assert.equal(eng.length, 30, "engineering track must hold weeks 21-30");
  assert.deepEqual(
    eng.map((l) => l.id),
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
    ],
  );
  assert.deepEqual(
    eng.map((l) => l.index),
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
  );
  for (const l of engineeringW24Lessons) {
    assert.ok(lessons.includes(l), `week-24 lesson ${l.id} must be in lessons`);
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

test("week-24 lessons keep the lesson contract", () => {
  for (const lesson of engineeringW24Lessons) {
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

test("week-24 bench ids are registered in the bench index", () => {
  const indexSource = readFileSync(join(here, "..", "components", "bench", "index.tsx"), "utf8");
  const registered = new Set(
    [...indexSource.matchAll(/case\s+"([\w-]+)"/g)].map((m) => m[1]),
  );
  for (const lesson of engineeringW24Lessons) {
    assert.ok(
      registered.has(lesson.bench),
      `bench id "${lesson.bench}" from ${lesson.id} must have a case in bench/index.tsx`,
    );
  }
  const labs = readFileSync(join(here, "..", "components", "bench", "engineering-labs.tsx"), "utf8");
  assert.ok(/export function SectionExplorerBench/.test(labs), "engineering-labs.tsx must export SectionExplorerBench");
  assert.ok(/export function ComponentSizingBench/.test(labs), "engineering-labs.tsx must export ComponentSizingBench");
});

test("section properties recover the lesson's worked numbers", () => {
  const tube = sectionProps({ kind: "rect-tube", b: 0.04, h: 0.04, t: 0.003 });
  approx(tube.S, 5.0986e-6, 1e-3, "tube S");
  approx(tube.A, 4.44e-4, 1e-3, "tube A");
  approx(2700 * tube.A, 1.199, 1e-3, "tube mass/m");

  const solid = sectionProps({ kind: "rectangle", b: 0.04, h: 0.04 });
  approx(solid.S, 1.06667e-5, 1e-3, "solid S");

  // bending stress for the 600 N·m workbench case
  approx(bendingStress(600, tube.S) / 1e6, 117.68, 1e-3, "beam stress MPa");
  approx(bendingStress(600, solid.S) / 1e6, 56.25, 1e-3, "solid stress MPa");

  // section modulus scales as h^2
  const tall = sectionProps({ kind: "rectangle", b: 0.04, h: 0.08 });
  approx(tall.S / solid.S, 4, 1e-9, "S quadruples with doubled depth");

  // I-beam teaching section
  const ib = sectionProps({ kind: "i-beam", bf: 0.1, tf: 0.01, hw: 0.18, tw: 0.008 });
  approx(ib.I, 2.1955e-5, 1e-3, "i-beam I");
  approx(ib.S, 2.1955e-4, 1e-3, "i-beam S");
  approx(ib.A, 3.44e-3, 1e-3, "i-beam A");

  // closed tube: J = 2I
  const rt = sectionProps({ kind: "round-tube", d: 0.025, t: 0.002 });
  approx(rt.J / rt.I, 2, 1e-9, "tube J = 2I");
  approx(rt.I, 9.6282e-9, 1e-3, "column I");

  // required section modulus inverts the stress formula
  approx(requiredSectionModulus(600, 276e6), 600 / 276e6, 1e-12, "required S");
});

test("buckling logic matches the tent-pole worked case", () => {
  assert.equal(effectiveLength(1.5, "pinned-pinned"), 1.5);
  assert.equal(effectiveLength(1.5, "fixed-free"), 3.0);
  assert.equal(effectiveLength(1.5, "fixed-fixed"), 0.75);

  const col = sectionProps({ kind: "round-tube", d: 0.025, t: 0.002 });
  const pcr = eulerLoad(68.9e9, col.I, effectiveLength(1.5, "pinned-pinned"));
  approx(pcr, 2909.9, 1e-3, "Euler load N");
  approx(pcr / col.A / 1e6, 20.136, 1e-3, "buckling stress MPa");
  approx(pcr / 686, 4.24, 1e-2, "FoS vs 70 kg camper");
  approx((276e6 * col.A) / pcr, 13.7, 1e-2, "crush load ≈ 14× buckling load");

  // fixed-free quarters the pinned-pinned value
  const pcrFree = eulerLoad(68.9e9, col.I, effectiveLength(1.5, "fixed-free"));
  approx(pcrFree, pcr / 4, 1e-9, "fixed-free = Pcr/4");
});

test("torsion logic matches the drive-shaft worked case", () => {
  const J = (Math.PI * 0.03 ** 4) / 32;
  approx(torsionalShear(300, 0.015, J) / 1e6, 56.588, 1e-3, "torsional shear MPa");
  approx((twistAngle(300, 0.8, 79e9, J) * 180) / Math.PI, 2.1889, 1e-3, "twist degrees");
  // doubling torque doubles stress
  approx(torsionalShear(600, 0.015, J), 2 * torsionalShear(300, 0.015, J), 1e-12, "tau linear in T");
});

test("combined loading: von Mises and shaft sizing", () => {
  approx(vonMises(75.451e6, 0, 56.588e6) / 1e6, 123.69, 1e-3, "von Mises MPa");
  approx(vonMises(100, 0, 0), 100, 1e-12, "uniaxial reduces to sigma");
  approx(vonMises(0, 0, 100), 100 * Math.sqrt(3), 1e-12, "pure shear = sqrt(3)*tau");

  // lesson's shaft: M=200, T=300, allowable 150 MPa -> 28.13 mm, round up to 30
  approx(shaftDiameterVonMises(200, 300, 150e6) * 1000, 28.132, 1e-3, "shaft diameter mm");
  const vm30 = shaftVonMises(200, 300, 0.03);
  approx(vm30 / 1e6, 123.69, 1e-3, "vm at 30 mm");
  // bending-only size for comparison: 23.9 mm
  approx(Math.cbrt((32 * 200) / (Math.PI * 150e6)) * 1000, 23.86, 1e-3, "bending-only diameter mm");
  assert.ok(vm30 < 150e6, "30 mm shaft must clear the allowable");

  // margin of safety semantics
  approx(marginOfSafety(276, 118), 276 / 118 - 1, 1e-12, "MS");
  approx(marginOfSafety(276, 117.68), 1.345, 1e-3, "bending example MS (unrounded σ)");
  assert.ok(marginOfSafety(150, 200) < 0, "negative MS means failure");
});

test("the bench's graded sizing answers are correct", () => {
  const ALLOW = 276e6;
  // Task 1: 40 mm tube, 500 N at 1.2 m — 2 mm wall passes, 1 mm fails
  const w2 = sectionProps({ kind: "rect-tube", b: 0.04, h: 0.04, t: 0.002 });
  const w1 = sectionProps({ kind: "rect-tube", b: 0.04, h: 0.04, t: 0.001 });
  assert.ok(marginOfSafety(ALLOW, bendingStress(600, w2.S)) > 0, "2 mm wall must pass");
  assert.ok(marginOfSafety(ALLOW, bendingStress(600, w1.S)) < 0, "1 mm wall must fail");
  // Task 2: column buckling within 10% of 2.914 kN
  const col = sectionProps({ kind: "round-tube", d: 0.025, t: 0.002 });
  const pcr = eulerLoad(69e9, col.I, 1.5) / 1000;
  assert.ok(Math.abs(pcr - 2.914) / 2.914 <= 0.1, "Pcr must be ~2.914 kN");
  // Task 3: 29 mm is the smallest whole-mm shaft diameter clearing 150 MPa
  assert.ok(shaftVonMises(200, 300, 0.029) < 150e6, "29 mm must pass");
  assert.ok(shaftVonMises(200, 300, 0.028) > 150e6, "28 mm must fail");
});
