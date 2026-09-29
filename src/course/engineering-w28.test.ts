/**
 * Validation for the Engineering 101 Week 28 batch (scout/engineering-w28).
 *
 * Run with: node --experimental-strip-types --test src/course/engineering-w28.test.ts
 * from the repo root. Imports are relative "./x.ts" so Node's type-stripping
 * resolves them without the @/ alias.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { engineeringW28Lessons } from "./engineering-w28.ts";
import {
  argMax,
  argMin,
  BEAM_CASE,
  beamDeflectionM,
  beamMassKg,
  BRACKET_ALTERNATIVES,
  BRACKET_CRITERIA,
  BRACKET_WINNER_ID,
  dominatedAlternatives,
  dominates,
  firstPassingIndex,
  hasConverged,
  normalizeScores,
  rankAlternatives,
  sweep,
  weightedTotal,
  weightFlipMargin,
} from "./optimization.ts";
import { lessonsFor } from "./catalog.ts";

const approx = (a: number, b: number, tol: number, msg: string) =>
  assert.ok(Math.abs(a - b) <= tol, `${msg}: got ${a}, want ${b} ± ${tol}`);

test("week 28 lessons sit at their engineering-track indices in syllabus order", () => {
  assert.equal(engineeringW28Lessons.length, 3);
  assert.deepEqual(
    engineeringW28Lessons.map((l) => l.id),
    ["tradestudy", "paramsweep", "convergence"],
  );
  assert.deepEqual(
    engineeringW28Lessons.map((l) => l.index),
    [22, 23, 24],
  );
  for (const l of engineeringW28Lessons) assert.equal(l.track, "engineering");
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
});

test("week 28 lessons satisfy the lesson contract", () => {
  const ids = new Set<string>();
  for (const l of engineeringW28Lessons) {
    assert.ok(!ids.has(l.id), `duplicate lesson id ${l.id}`);
    ids.add(l.id);
    assert.equal(l.start.split(" || ").length, 3, `${l.id}: start needs 3 parts`);
    assert.equal(l.use.split(" || ").length, 3, `${l.id}: use needs 3 parts`);
    assert.equal(l.example.split(" || ").length, 3, `${l.id}: example needs 3 parts`);
    assert.equal(l.ideas.length, 3, `${l.id}: needs 3 ideas`);
    assert.equal(l.checks.length, 4, `${l.id}: needs 4 checks`);
    assert.ok(l.lede.length > 20, `${l.id}: lede too short`);
    assert.ok(l.prompt.split(" || ").length >= 2, `${l.id}: prompt needs parts`);
    for (const c of l.checks) {
      assert.equal(c.options.length, 4, `${l.id}: check needs 4 options`);
      assert.ok(c.answer >= 0 && c.answer <= 3, `${l.id}: answer index out of range`);
      assert.ok(c.why.length > 10, `${l.id}: check needs an explanation`);
    }
  }
  assert.deepEqual(
    engineeringW28Lessons.map((l) => l.bench),
    ["tradestudy", "sweepconv", "sweepconv"],
  );
});

test("new bench ids are registered in the bench index", () => {
  const index = readFileSync(new URL("../components/bench/index.tsx", import.meta.url), "utf8");
  for (const id of ["tradestudy", "sweepconv"]) {
    assert.ok(index.includes(`case "${id}":`), `bench index missing case "${id}"`);
  }
});

test("bracket trade study: totals and winner match the lesson", () => {
  const ranked = rankAlternatives(BRACKET_ALTERNATIVES, BRACKET_CRITERIA);
  const totals: Record<string, number> = Object.fromEntries(ranked.map((r) => [r.id, r.total]));
  approx(totals.nylon, 0.694, 0.002, "nylon total");
  approx(totals.cnc, 0.632, 0.002, "cnc total");
  approx(totals.steel, 0.505, 0.002, "steel total");
  approx(totals.cfrp, 0.5, 0.002, "cfrp total");
  assert.deepEqual(
    ranked.map((r) => r.id),
    ["nylon", "cnc", "steel", "cfrp"],
    "ranking order",
  );
  assert.equal(ranked[0].id, BRACKET_WINNER_ID, "winner");
  // Every normalized score sits in [0, 1] and every criterion's best is 1.
  const norm = normalizeScores(BRACKET_ALTERNATIVES, BRACKET_CRITERIA);
  for (const c of BRACKET_CRITERIA) {
    const col = BRACKET_ALTERNATIVES.map((a) => norm[a.id][c.id]);
    for (const v of col) assert.ok(v >= 0 && v <= 1, "normalized in [0,1]");
    assert.ok(col.some((v) => v === 1), `${c.id} has a best-observed 1`);
  }
});

test("no bracket alternative dominates another", () => {
  assert.deepEqual(dominatedAlternatives(BRACKET_ALTERNATIVES, BRACKET_CRITERIA), []);
  const norm = normalizeScores(BRACKET_ALTERNATIVES, BRACKET_CRITERIA);
  // Dominance smoke test on synthetic alternatives.
  const good = { mass: 1, cost: 1, stiffness: 1, lead: 1, confidence: 1 };
  const bad = { mass: 0, cost: 0, stiffness: 0, lead: 0, confidence: 0 };
  assert.ok(dominates(good, bad, BRACKET_CRITERIA), "strictly-better dominates");
  assert.ok(!dominates(bad, good, BRACKET_CRITERIA), "strictly-worse does not dominate");
  assert.ok(!dominates(norm.nylon, norm.cnc, BRACKET_CRITERIA), "nylon does not dominate cnc");
});

test("weight flip margins are sane", () => {
  for (const c of BRACKET_CRITERIA) {
    const m = weightFlipMargin(BRACKET_ALTERNATIVES, BRACKET_CRITERIA, c.id);
    assert.ok(m.up >= 0 || m.up === Infinity, `${c.id}: up margin`);
    assert.ok(m.down >= 0 || m.down === Infinity, `${c.id}: down margin`);
  }
  // Confidence is nylon's weak spot (0.33 vs aluminum's 1): raising its
  // weight must eventually flip the winner to CNC aluminum.
  const conf = weightFlipMargin(BRACKET_ALTERNATIVES, BRACKET_CRITERIA, "confidence");
  assert.ok(conf.up < Infinity, "raising confidence weight flips the winner");
});

test("degenerate criterion normalizes to 1 for everyone", () => {
  const alts = [
    { id: "a", name: "a", scores: { same: 5 } },
    { id: "b", name: "b", scores: { same: 5 } },
  ];
  const crit = [{ id: "same", name: "Same", unit: "-", direction: "max" as const, weight: 1 }];
  const norm = normalizeScores(alts, crit);
  assert.equal(norm.a.same, 1);
  assert.equal(norm.b.same, 1);
  assert.equal(weightedTotal(norm.a, crit), 1);
});

test("beam sweep: 53 mm is the minimal whole-mm passing depth", () => {
  assert.ok(
    beamDeflectionM(BEAM_CASE.answerDepthMm) <= BEAM_CASE.deflectionLimitM,
    "answer depth passes",
  );
  assert.ok(
    beamDeflectionM(BEAM_CASE.answerDepthMm - 1) > BEAM_CASE.deflectionLimitM,
    "one mm less fails",
  );
  // Lesson's worked numbers: 52 mm → 2.03 mm (fail), 53 mm → 1.92 mm (pass).
  approx(beamDeflectionM(52) * 1000, 2.03, 0.02, "52 mm deflection");
  approx(beamDeflectionM(53) * 1000, 1.92, 0.02, "53 mm deflection");
  approx(beamDeflectionM(20) * 1000, 35.7, 0.2, "20 mm deflection");
  approx(beamDeflectionM(40) * 1000, 4.46, 0.05, "40 mm deflection");
  approx(beamMassKg(53), 5.72, 0.02, "53 mm mass");
});

test("sweep machinery finds the pass/fail boundary", () => {
  const pts = sweep(beamDeflectionM, 20, 80, 60);
  assert.equal(pts.length, 61);
  const passing = firstPassingIndex(pts, (p) => p.y <= BEAM_CASE.deflectionLimitM);
  assert.ok(passing > 0, "some depth passes");
  approx(pts[passing].x, 53, 1.01, "first passing depth is 53 mm");
  const best = argMin(pts);
  assert.ok(best !== undefined && best.x === 80, "deepest is stiffest");
  const heaviest = argMax(pts.map((p) => ({ x: p.x, y: beamMassKg(p.x) })));
  assert.ok(heaviest !== undefined && heaviest.x === 80, "deepest is heaviest");
});

test("hasConverged implements the written stopping rule", () => {
  // Beam refinement history: 60 → 54 → 53 mm answers.
  assert.ok(!hasConverged([35.7, 4.46, 2.03, 1.92], 0.05, 2), "5.7% change still exceeds the 5% tolerance");
  assert.ok(hasConverged([2.1, 2.03, 1.99, 1.97], 0.05, 2), "two sub-tolerance changes converge");
  assert.ok(!hasConverged([2.1, 2.03, 1.99, 1.97], 0.005, 2), "tight tolerance does not trip");
  assert.ok(!hasConverged([1.0], 0.05, 2), "needs enough history");
  assert.ok(!hasConverged([], 0.05, 2), "empty history never converges");
  // Lesson's depth history: 11% then 1.9% — only one sub-tolerance change.
  approx((60 - 54) / 54, 0.111, 0.001, "first relative change");
  approx((54 - 53) / 53, 0.019, 0.001, "second relative change");
  assert.ok(!hasConverged([60, 54, 53], 0.05, 2), "one sub-tolerance change is not two");
});
