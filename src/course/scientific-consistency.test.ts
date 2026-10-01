import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  eutecticRegionAt as region,
  eutecticTieLineAt as tie,
  leverFractions as fractions,
  isoSolidificationPath,
  isoRegionAt,
  PB_SN,
  CU_NI,
} from "./phasediagrams.ts";
import { gradePhaseAnswer } from "./phase-assessment.ts";
import { stabilityVerdict, STABILITY_LABELS } from "./fluids.ts";
import {
  SUBSTANCES,
  profileProperties,
  substanceProperties,
} from "./bonding.ts";
import { materialsW11Lessons } from "./materials-w11.ts";
import { materialsW17Lessons } from "./materials-w17.ts";
const close = (a: number, b: number, tol = 1e-9) =>
  assert.ok(Math.abs(a - b) <= tol, `${a} != ${b}`);
const source = (p: string) => readFileSync(p, "utf8");

// Values from independent straight-line interpolation of the stated endpoint data,
// not calls to the solver under test. Fractions are independently calculated below.
const fixtures = [
  {
    c: 20,
    t: 250,
    r: "L+alpha",
    a: 10.266666666666667,
    b: 33.09930555555555,
    ph: ["alpha", "L"],
  },
  {
    c: 70,
    t: 150,
    r: "alpha+beta",
    a: 15.737704918032787,
    b: 97.95081967213115,
    ph: ["alpha", "beta"],
  },
  {
    c: 40,
    t: 200,
    r: "L+alpha",
    a: 16.933333333333334,
    b: 54.59236111111111,
    ph: ["alpha", "L"],
  },
  {
    c: 90,
    t: 210,
    r: "L+beta",
    a: 82.89387755102041,
    b: 98.87755102040816,
    ph: ["L", "beta"],
  },
  {
    c: 90,
    t: 200,
    r: "L+beta",
    a: 75.11836734693877,
    b: 98.36734693877551,
    ph: ["L", "beta"],
  },
];
for (const f of fixtures)
  test(`independent phase identity and mass balances: ${f.c} wt% at ${f.t} C`, () => {
    assert.equal(region(f.c, f.t), f.r);
    const ends = tie(f.c, f.t)!;
    assert.ok(ends);
    assert.deepEqual([ends.leftPhase, ends.rightPhase], f.ph);
    close(ends.cLeft, f.a);
    close(ends.cRight, f.b);
    const { wA, wB } = fractions(f.c, ends.cLeft, ends.cRight);
    const right = (f.c - f.a) / (f.b - f.a);
    close(wB, right);
    close(wA, 1 - right);
    close(wA + wB, 1);
    close(wA * f.a + wB * f.b, f.c);
    const input = {
      region: f.r,
      cLeft: f.a.toFixed(3),
      cRight: f.b.toFixed(3),
      wLeft: (1 - right).toFixed(4),
      wRight: right.toFixed(4),
    };
    const good = gradePhaseAnswer(f.c, f.t, input);
    assert.ok(good.regionOk && good.tieOk && good.fracOk);
    assert.equal(
      gradePhaseAnswer(f.c, f.t, {
        ...input,
        cLeft: input.cRight,
        cRight: input.cLeft,
      }).tieOk,
      false,
    );
    assert.equal(
      gradePhaseAnswer(f.c, f.t, {
        ...input,
        wLeft: input.wRight,
        wRight: input.wLeft,
      }).fracOk,
      false,
    );
  });
test("every model two-phase grid point has ordered physical fractions and conserves composition", () => {
  let cases = 0;
  for (let t = 60; t <= 340; t += 1)
    for (let c = 0; c <= 100; c += 0.5) {
      const e = tie(c, t);
      if (!e) continue;
      cases++;
      assert.ok(e.cLeft < e.cRight && e.cLeft >= 0 && e.cRight <= 100);
      const { wA, wB } = fractions(c, e.cLeft, e.cRight);
      assert.ok(wA >= 0 && wA <= 1 && wB >= 0 && wB <= 1);
      close(wA + wB, 1);
      close(wA * e.cLeft + wB * e.cRight, c);
    }
  assert.ok(cases > 20000);
});
test("pure-component melting and eutectic amounts are explicitly undetermined", () => {
  assert.equal(region(0, 327), "pure-melting");
  assert.equal(region(100, 232), "pure-melting");
  for (const [c, t] of [
    [0, 327],
    [100, 232],
    [40, 183],
    [61.9, 183],
    [90, 183],
  ]) {
    assert.equal(tie(c, t), null);
    const g = gradePhaseAnswer(c, t, {
      region: region(c, t),
      cLeft: "",
      cRight: "",
      wLeft: "",
      wRight: "",
    });
    assert.ok(g.regionOk && g.tieOk && g.fracOk);
    assert.match(g.expFrac, /not fixed/);
  }
  assert.equal(region(61.9, 183.1), "L");
  assert.equal(region(61.9, 182.9), "alpha+beta");
  assert.equal(region(90, 183.1), "L+beta");
  assert.equal(region(40, 183.1), "L+alpha");
  close(PB_SN.liquidusBeta(232), 100);
  close(PB_SN.liquidusAlpha(183), 61.9);
});
test("single-phase boundaries never create zero-length tie lines or grade blank as zero", () => {
  for (const [c, t, r] of [
    [10, 100, "alpha"],
    [100, 100, "beta"],
    [50, 400, "L"],
  ] as const) {
    assert.equal(region(c, t), r);
    assert.equal(tie(c, t), null);
  }
  const bad = gradePhaseAnswer(90, 210, {
    region: "L+beta",
    cLeft: "",
    cRight: "",
    wLeft: "",
    wRight: "",
  });
  assert.equal(bad.tieOk, false);
  assert.equal(bad.fracOk, false);
  const badRange = gradePhaseAnswer(90, 210, {
    region: "L+beta",
    cLeft: "82.89",
    cRight: "98.88",
    wLeft: "55.5",
    wRight: "44.5",
  });
  assert.equal(badRange.fracOk, false);
  for (const temp of [183.1, 200, 231])
    for (const c of [
      PB_SN.solidusAlpha(temp),
      PB_SN.liquidusAlpha(temp),
      PB_SN.liquidusBeta(temp),
      PB_SN.solidusBeta(temp),
    ])
      assert.equal(tie(c, temp), null);
});
test("phase helpers reject invalid or unsupported data instead of extrapolating", () => {
  for (const args of [
    [NaN, 200],
    [-1, 200],
    [101, 200],
    [40, NaN],
    [40, -1],
    [40, Infinity],
  ])
    assert.throws(() => tie(args[0], args[1]));
  for (const xs of [
    [40, 40, 40],
    [40, 60, 20],
    [20, 30, 50],
    [50, NaN, 80],
    [50, -1, 101],
  ])
    assert.throws(() => fractions(xs[0], xs[1], xs[2]));
  assert.throws(() => isoRegionAt(90, 1400), /20–45/);
  assert.throws(() => isoRegionAt(30, NaN));
});
test("solidification includes exact final boundary for nondividing steps and is bounded", () => {
  for (const c of [20, 30, 45])
    for (const step of [2, 4, 9, 100]) {
      const p = isoSolidificationPath(c, step);
      close(p[0].t, CU_NI.liquidus(c));
      close(p.at(-1)!.t, CU_NI.solidus(c));
      close(p[0].wL, 1);
      close(p.at(-1)!.wS, 1);
      for (const x of p) {
        close(x.wL + x.wS, 1);
        close(x.cL * x.wL + x.cS * x.wS, c);
      }
    }
  for (const step of [0, -1, NaN, Infinity, 1e-12])
    assert.throws(() => isoSolidificationPath(30, step));
});
test("static stability sign is independent of classroom target boundaries", () => {
  const checks = [
    [-0.01, "unstable"],
    [-1e-8, "unstable"],
    [0, "neutral"],
    [1e-8, "marginal"],
    [0.01, "marginal"],
    [0.049, "marginal"],
    [0.05, "stable"],
    [0.25, "stable"],
    [0.251, "overstable"],
    [NaN, "invalid"],
    [Infinity, "invalid"],
  ] as const;
  for (const [v, expected] of checks)
    assert.equal(stabilityVerdict(v), expected);
  assert.match(STABILITY_LABELS.marginal, /Statically stable/);
  assert.match(STABILITY_LABELS.overstable, /above classroom target/);
  assert.match(STABILITY_LABELS.neutral, /zero/);
});
test("reference bank retains named-material answers while family predictions stay conditional", () => {
  const expected = [
    ["semiconductor", "brittle", "high-temperature"],
    ["conductor", "ductile", "high-melting"],
    ["insulator", "soft", "decomposes-or-softens"],
    ["insulator-until-molten", "brittle", "high-melting"],
    ["insulator", "brittle", "low-melting"],
    ["conductor", "soft", "high-temperature"],
  ];
  SUBSTANCES.forEach((s, i) => {
    const p = substanceProperties(s);
    assert.deepEqual([p.conduction, p.mechanical, p.thermal], expected[i]);
  });
  assert.equal(
    profileProperties("covalent-network").conduction,
    "material-dependent",
  );
  assert.equal(profileProperties("metallic").mechanical, "material-dependent");
  assert.equal(profileProperties("secondary").thermal, "material-dependent");
});
test("edited prose, practice and figures no longer reward the identified scientific generalizations", () => {
  const prose = JSON.stringify(materialsW11Lessons);
  assert.doesNotMatch(
    prose,
    /survives past 3500|must be broken wholesale|same well depth gives/,
  );
  assert.match(prose, /glass.transition|Glass.transition/);
  assert.match(prose, /cohesive energy|Cohesive energy/);
  assert.match(prose, /processing|Processing/);
  const fig = source("src/components/figures/materials-a.tsx")
    .split("function BondRead()")[1]
    .split("function ")[0];
  assert.match(fig, /silicon carbide: a semiconductor/);
  assert.doesNotMatch(fig, /insulating · very high melting|prediction holds/);
  const labs = source("src/components/bench/materials-labs.tsx");
  assert.doesNotMatch(labs, /Cored: the dendrite core/);
  assert.match(labs, /not predict a quenched rim/);
  assert.match(labs, /eRegion === "pure-melting"/);
  assert.match(JSON.stringify(materialsW17Lessons), /mass fractions/);
  assert.match(JSON.stringify(materialsW17Lessons), /not a computed coring/);
});
