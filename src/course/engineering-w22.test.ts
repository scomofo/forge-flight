/**
 * Validation for the Engineering 101 Week 22 batch (scout/engineering-w22).
 *
 * Run with: node --experimental-strip-types --test src/course/engineering-w22.test.ts
 * from the repo root. Imports are relative "./x.ts" so Node's type-stripping
 * resolves them without the @/ alias.
 */
import assert from "node:assert/strict";
import test from "node:test";

import { engineeringW22Lessons } from "./engineering-w22.ts";
import {
  chains,
  dominantIndex,
  monteCarloStd,
  normalizedSensitivities,
  partial,
  rss,
  sensFunctions,
  thrustSI,
  varianceShares,
  worstCase,
} from "./uncertainty.ts";
import { lessonsFor } from "./catalog.ts";

const approx = (a: number, b: number, tol: number, msg: string) =>
  assert.ok(Math.abs(a - b) <= tol, `${msg}: got ${a}, want ${b} ± ${tol}`);

test("week 22 opens the engineering track in syllabus order", () => {
  assert.equal(engineeringW22Lessons.length, 3);
  assert.deepEqual(
    engineeringW22Lessons.map((l) => l.id),
    ["modelvalid", "errprop", "sensitivity"],
  );
  assert.deepEqual(
    engineeringW22Lessons.map((l) => l.index),
    [4, 5, 6],
  );
  for (const l of engineeringW22Lessons) assert.equal(l.track, "engineering");
  const eng = lessonsFor("engineering");
  assert.equal(eng.length, 41, "engineering track must hold weeks 21-30 plus the 11 legacy lessons");
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
    eng.map((l) => l.index),
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41],
  );
});

test("week 22 lessons satisfy the lesson contract", () => {
  const ids = new Set<string>();
  for (const l of engineeringW22Lessons) {
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
    engineeringW22Lessons.map((l) => l.bench),
    ["sensbench", "errbudget", "errbudget"],
  );
});

test("thrust worked example: nominal, worst-case, RSS", () => {
  // Lesson 2: p = 10.0 ± 0.1 MPa, d = 50.0 ± 0.1 mm.
  const f = thrustSI;
  const xs = [
    { nominal: 10e6, unc: 0.1e6 },
    { nominal: 0.05, unc: 0.0001 },
  ];
  approx(f([10e6, 0.05]), 19635, 1, "nominal thrust");
  approx(worstCase(f, xs), 275, 2, "worst-case total");
  approx(rss(f, xs), 211, 2, "RSS total");
  // Pressure owns ~86% of the variance.
  const shares = varianceShares(f, xs);
  approx(shares[0], 0.86, 0.02, "pressure variance share");
  assert.equal(dominantIndex(f, xs), 0, "pressure must dominate");
});

test("numerical partials match analytic derivatives", () => {
  const f = thrustSI;
  const xs = [10e6, 0.05];
  // dF/dp = A, dF/dd = p·π·d/2
  const A = Math.PI * 0.025 ** 2;
  approx(partial(f, xs, 0), A, A * 1e-6, "dF/dp");
  approx(partial(f, xs, 1), 10e6 * Math.PI * 0.025, 1, "dF/dd");
});

test("normalized sensitivities recover power-law exponents", () => {
  for (const sfn of sensFunctions) {
    const s = normalizedSensitivities(sfn.evaluate, sfn.inputs.map(() => 1));
    assert.equal(s.length, sfn.inputs.length);
  }
  const thrust = sensFunctions.find((s) => s.id === "thrust")!;
  assert.deepEqual(
    normalizedSensitivities(thrust.evaluate, [1, 1]).map((v) => Math.round(v * 1e9) / 1e9),
    [1, 2],
  );
  const beam = sensFunctions.find((s) => s.id === "beam")!;
  assert.deepEqual(
    normalizedSensitivities(beam.evaluate, [1, 1, 1, 1]).map((v) => Math.round(v * 1e9) / 1e9),
    [1, 3, -1, -1],
  );
  const hoop = sensFunctions.find((s) => s.id === "hoop")!;
  assert.deepEqual(
    normalizedSensitivities(hoop.evaluate, [1, 1, 1]).map((v) => Math.round(v * 1e9) / 1e9),
    [1, 1, -1],
  );
});

test("halving the dominant link buys the lesson-3 improvement", () => {
  const f = thrustSI;
  const halfP = [
    { nominal: 10e6, unc: 0.05e6 },
    { nominal: 0.05, unc: 0.0001 },
  ];
  const halfD = [
    { nominal: 10e6, unc: 0.1e6 },
    { nominal: 0.05, unc: 0.00005 },
  ];
  approx(rss(f, halfP), 126, 2, "halve pressure");
  approx(rss(f, halfD), 200, 2, "halve diameter");
  assert.ok(rss(f, halfP) < rss(f, halfD), "pressure upgrade must win");
});

test("monte carlo agrees with rss/sqrt(3) for the near-linear thrust model", () => {
  const f = thrustSI;
  const xs = [
    { nominal: 10e6, unc: 0.1e6 },
    { nominal: 0.05, unc: 0.0001 },
  ];
  const mc = monteCarloStd(f, xs, 200000, 22);
  const expected = rss(f, xs) / Math.sqrt(3);
  assert.ok(
    Math.abs(mc - expected) / expected < 0.05,
    `MC ${mc} should land near RSS/√3 = ${expected}`,
  );
});

test("chains evaluate and stay positive over their slider ranges", () => {
  for (const chain of chains) {
    const vals = chain.links.map((l) => l.nominal);
    const y = chain.evaluate(vals);
    assert.ok(Number.isFinite(y) && y > 0, `${chain.id}: nominal result must be positive`);
    const xs = chain.links.map((l) => ({ nominal: l.nominal, unc: l.defaultUnc }));
    const f = (v: number[]) => chain.evaluate(v);
    assert.ok(worstCase(f, xs) >= rss(f, xs), `${chain.id}: worst case must bound RSS`);
    const shares = varianceShares(f, xs);
    approx(
      shares.reduce((a, b) => a + b, 0),
      1,
      1e-9,
      `${chain.id}: shares sum to 1`,
    );
  }
  const thrust = chains.find((c) => c.id === "thrust")!;
  approx(thrust.evaluate([10, 50]), 19635, 1, "thrust chain nominal");
});
