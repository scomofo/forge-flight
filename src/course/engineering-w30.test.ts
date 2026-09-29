/**
 * Validation for the Engineering 101 Week 30 batch (scout/engineering-w30).
 *
 * Run with: node --experimental-strip-types --test src/course/engineering-w30.test.ts
 * from the repo root. Imports are relative "./x.ts" so Node's type-stripping
 * resolves them without the @/ alias.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { engineeringW30Lessons } from "./engineering-w30.ts";
import {
  CAP_GATE_PCT,
  CAP_MASTERY_BANK,
  CAP_MASTERY_GATE_PCT,
  CAP_MAX_TOTAL,
  CAP_MISMATCH,
  CAP_REFERENCE,
  CAP_SECTIONS,
  MISMATCH_SUSPECTS,
  capBendingStress,
  capChain,
  capCorrectionsRequired,
  capGustLift,
  capMasteryPass,
  capMasteryPct,
  capPct,
  capRootMoment,
  capSection,
  capTipDeflection,
  capTotal,
  capstoneGate,
  revisedDeflection,
} from "./capstone.ts";
import { lessons } from "./catalog.ts";

const here = dirname(fileURLToPath(import.meta.url));

function closeTo(actual: number, expected: number, tol: number, name: string) {
  assert.ok(
    Math.abs(actual - expected) <= tol,
    `${name}: expected ${expected} ± ${tol}, got ${actual}`,
  );
}

test("week 30 opens the engineering track in syllabus order", () => {
  assert.equal(engineeringW30Lessons.length, 3);
  assert.deepEqual(
    engineeringW30Lessons.map((l) => l.id),
    ["capmethod", "glidersynth", "capmastery"],
  );
  assert.deepEqual(
    engineeringW30Lessons.map((l) => l.index),
    [28, 29, 30],
  );
  for (const l of engineeringW30Lessons) assert.equal(l.track, "engineering");
  const engineering = lessons.filter((l) => l.track === "engineering");
  assert.equal(engineering.length, 30, "engineering track must hold weeks 21-30");
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
    ],
  );
  assert.deepEqual(
    engineering.map((l) => l.index),
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
  );
  for (const l of engineeringW30Lessons) {
    assert.ok(lessons.includes(l), `week-30 lesson ${l.id} must be in lessons`);
  }
});

test("no duplicate lesson ids across the catalog", () => {
  const ids = lessons.map((l) => `${l.track}/${l.id}`);
  assert.equal(new Set(ids).size, ids.length, "duplicate lesson keys found");
});

test("week-30 lessons keep the lesson contract", () => {
  for (const lesson of engineeringW30Lessons) {
    for (const field of ["start", "use", "example"] as const) {
      const parts = lesson[field].split(" || ");
      assert.equal(parts.length, 3, `${lesson.id}.${field} must have exactly 3 parts`);
      for (const p of parts) assert.ok(p.trim().length > 0, `${lesson.id}.${field} has an empty part`);
    }
    assert.equal(lesson.ideas.length, 3, `${lesson.id} must have exactly 3 ideas`);
    for (const idea of lesson.ideas) {
      assert.ok(idea.heading.trim().length > 0);
      assert.ok(idea.body.trim().length > 0);
    }
    assert.equal(lesson.checks.length, 4, `${lesson.id} must have exactly 4 checks`);
    for (const check of lesson.checks) {
      assert.equal(check.options.length, 4, `${lesson.id} check must have 4 options`);
      assert.ok(check.answer >= 0 && check.answer <= 3, `${lesson.id} check answer out of range`);
      assert.ok(check.why.trim().length > 20, `${lesson.id} check needs a real explanation`);
    }
    assert.ok(lesson.lede.trim().length > 0);
    assert.ok(lesson.prompt.trim().length > 0);
    assert.ok(lesson.note.trim().length > 0);
  }
});

test("week-30 benches are registered", () => {
  const benches = ["cappackage", "cappredict", "capreview"] as const;
  assert.deepEqual(
    engineeringW30Lessons.map((l) => l.bench),
    benches,
  );
  const indexSrc = readFileSync(join(here, "..", "components", "bench", "index.tsx"), "utf8");
  for (const b of benches) {
    assert.ok(indexSrc.includes(`case "${b}":`), `bench index must handle "${b}"`);
  }
});

test("capstone rubric: gate demands every section and 70%", () => {
  assert.equal(CAP_SECTIONS.length, 5);
  assert.equal(CAP_MAX_TOTAL, 10);
  const perfect = { requirement: 2, model: 2, test: 2, mismatch: 2, revision: 2 } as const;
  assert.equal(capTotal(perfect), 10);
  assert.equal(capPct(perfect), 100);
  assert.ok(capstoneGate(perfect).pass, "perfect package must pass");

  // Simulation alone is insufficient: strong model, nothing else.
  const simOnly = { requirement: 0, model: 2, test: 0, mismatch: 0, revision: 0 } as const;
  const g1 = capstoneGate(simOnly);
  assert.ok(!g1.pass, "model-only package must fail the gate");
  assert.ok(g1.reasons.length === 5, "every absent section must be named");

  // All present but weak overall: 5 ones = 50% -> fails on total.
  const weak = { requirement: 1, model: 1, test: 1, mismatch: 1, revision: 1 } as const;
  const g2 = capstoneGate(weak);
  assert.ok(!g2.pass, "50% total must fail the 70% gate");
  assert.ok(g2.reasons.some((r) => r.includes("70")), "total failure must cite the gate");

  // Boundary: 7/10 = 70% with all present -> passes.
  const boundary = { requirement: 2, model: 2, test: 1, mismatch: 1, revision: 1 } as const;
  assert.equal(capPct(boundary), 70);
  assert.ok(capstoneGate(boundary).pass, "70% with all sections present must pass");
  assert.equal(CAP_GATE_PCT, 70);
});

test("cumulative worked design recovers the reference numbers", () => {
  closeTo(capGustLift(CAP_REFERENCE.gliderMassKg, CAP_REFERENCE.gustFactor), 2.4525, 1e-6, "gust lift");
  closeTo(capRootMoment(2.4525, 0.25), 0.15328125, 1e-9, "root moment");
  const sec = capSection(0.004, 0.006);
  closeTo(sec.inertiaM4, 72e-12, 1e-15, "section I");
  closeTo(capBendingStress(0.15328125, sec.cM, sec.inertiaM4) / 1e6, 6.3867, 0.01, "bending stress MPa");

  const chain = capChain();
  closeTo(chain.stressMPa, 6.3867, 0.01, "chain stress");
  const al = chain.results.find((r) => r.material.id === "al7075")!;
  const balsa = chain.results.find((r) => r.material.id === "balsa")!;
  closeTo(al.deflectionMm, 0.464, 0.01, "aluminum deflection");
  closeTo(balsa.deflectionMm, 11.09, 0.05, "balsa deflection");
  closeTo(al.massG, 16.86, 0.05, "aluminum mass");
  closeTo(balsa.massG, 0.96, 0.02, "balsa mass");
  assert.ok(al.strengthMargin > 50, "aluminum strength margin must clear 50x");
  assert.ok(!balsa.passesStiffness, "balsa must fail the 5 mm stiffness screen");
  assert.ok(al.passesStiffness, "aluminum must pass the stiffness screen");
  assert.equal(chain.bindingConstraint, "stiffness");

  // Tip deflection unit check: uniform cantilever δ = wL⁴/8EI.
  const w = 2.4525 / 2 / 0.25;
  closeTo(capTipDeflection(w, 0.25, 71.7e9, 72e-12) * 1000, 0.464, 0.01, "direct deflection");
});

test("the engineered mismatch and its revision are honest", () => {
  assert.ok(
    CAP_MISMATCH.measuredDeflectionMm - CAP_MISMATCH.measurementUncertaintyMm >
      CAP_MISMATCH.predictedDeflectionMm,
    "the uncertainty bars must not touch — this is a real disagreement",
  );
  const primes = MISMATCH_SUSPECTS.filter((s) => s.prime);
  assert.equal(primes.length, 1, "exactly one prime suspect");
  assert.equal(primes[0].id, "adhesive");
  // The revised model closes the gap: 0.6 mrad of root rotation over 0.25 m.
  closeTo(revisedDeflection(0.46, 0.0006, 0.25), 0.61, 1e-9, "revised deflection");
});

test("final gate: 12-item bank, 70% gate, cycle corrections", () => {
  assert.equal(CAP_MASTERY_BANK.length, 12);
  const topics = CAP_MASTERY_BANK.map((m) => m.topic);
  assert.equal(topics.filter((t) => t === "cycle").length, 4, "four full-cycle items");
  assert.equal(topics.filter((t) => t === "integration").length, 4, "four integration items");
  assert.equal(topics.filter((t) => t === "mixed").length, 4, "four mixed items");
  for (const item of CAP_MASTERY_BANK) {
    assert.equal(item.options.length, 4);
    assert.ok(item.answer >= 0 && item.answer <= 3);
    assert.ok(item.why.trim().length > 20);
  }
  assert.equal(CAP_MASTERY_GATE_PCT, 70);
  assert.ok(capMasteryPass(9, 12), "9 of 12 must pass");
  assert.ok(!capMasteryPass(8, 12), "8 of 12 must fail");
  assert.equal(capMasteryPct(9, 12), 75);

  const missed = [CAP_MASTERY_BANK[0], CAP_MASTERY_BANK[4], CAP_MASTERY_BANK[8]];
  const required = capCorrectionsRequired(missed);
  assert.deepEqual(
    required.map((m) => m.id),
    [CAP_MASTERY_BANK[0].id],
    "only missed cycle items require corrections",
  );
});
