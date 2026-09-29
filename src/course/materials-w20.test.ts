/**
 * Validation for the Materials 101 Week 20 batch (scout/materials-w20).
 *
 * Run with: node --experimental-strip-types --test src/course/materials-w20.test.ts
 * from the repo root. Imports are relative "./x.ts" so Node's type-stripping
 * resolves them without the @/ alias.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { materialsW20Lessons } from "./materials-w20.ts";
import {
  MAT_MASTERY_BANK,
  MAT_MASTERY_GATE_PCT,
  REFERENCE_SPAR,
  SPAR_MATERIALS,
  basquinLifeMultiplier,
  bendingStress,
  correctionsRequired,
  criticalCrackSize,
  designAllowable,
  diffusionLength,
  gustLift,
  hallPetch,
  leverFractions,
  masteryPass,
  masteryPct,
  rootMoment,
  sectionProps,
  sparChain,
  tipDeflection,
} from "./matsynthesis.ts";
import { lessons } from "./catalog.ts";

const here = dirname(fileURLToPath(import.meta.url));

function closeTo(actual: number, expected: number, tol: number, name: string) {
  assert.ok(
    Math.abs(actual - expected) <= tol,
    `${name}: expected ${expected} ± ${tol}, got ${actual}`,
  );
}

test("week 20 opens the materials track in syllabus order", () => {
  assert.equal(materialsW20Lessons.length, 3);
  assert.deepEqual(
    materialsW20Lessons.map((l) => l.id),
    ["matmethod", "sparsynth", "matmastery"],
  );
  assert.deepEqual(
    materialsW20Lessons.map((l) => l.index),
    [28, 29, 30],
  );
  for (const l of materialsW20Lessons) assert.equal(l.track, "materials");
  const materials = lessons.filter((l) => l.track === "materials");
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
  for (const l of materialsW20Lessons) {
    assert.ok(lessons.includes(l), `week-20 lesson ${l.id} must be in lessons`);
  }
});

test("no duplicate lesson ids across the catalog", () => {
  const ids = lessons.map((l) => `${l.track}/${l.id}`);
  assert.equal(new Set(ids).size, ids.length, "duplicate lesson keys found");
});

test("week-20 lessons keep the lesson contract", () => {
  for (const lesson of materialsW20Lessons) {
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

test("week-20 bench ids are registered in the bench index", () => {
  const indexSource = readFileSync(join(here, "..", "components", "bench", "index.tsx"), "utf8");
  const registered = new Set(
    [...indexSource.matchAll(/case\s+"([\w-]+)"/g)].map((m) => m[1]),
  );
  for (const lesson of materialsW20Lessons) {
    assert.ok(
      registered.has(lesson.bench),
      `bench id "${lesson.bench}" from ${lesson.id} must have a case in bench/index.tsx`,
    );
  }
  const labs = readFileSync(join(here, "..", "components", "bench", "materials-labs.tsx"), "utf8");
  for (const name of ["MatLedgerBench", "SparLabBench", "MatCheckBench"]) {
    assert.ok(
      new RegExp(`export function ${name}\\b`).test(labs),
      `materials-labs.tsx must export ${name}`,
    );
  }
});

test("spar chain geometry is consistent", () => {
  const sp = REFERENCE_SPAR;
  const lift = gustLift(sp.gliderMassKg, sp.gustFactor);
  closeTo(lift, 0.1 * 9.81 * 2.5, 1e-9, "gust lift");
  const m = rootMoment(lift, sp.halfSpanM);
  closeTo(m, (lift * sp.halfSpanM) / 4, 1e-12, "root moment identity");
  const sec = sectionProps(sp.sectionBMm / 1000, sp.sectionHMm / 1000);
  closeTo(sec.inertiaM4, 72e-12, 1e-15, "section inertia = 72 mm^4");
  closeTo(sec.cM, 0.003, 1e-12, "half-depth");
  // Limit behavior: no span -> no moment; infinite stiffness -> no deflection
  assert.equal(rootMoment(lift, 0), 0);
  assert.equal(tipDeflection(4.905, 0.25, Infinity, sec.inertiaM4), 0);
  assert.ok(bendingStress(m, 0, sec.inertiaM4) === 0, "zero depth arm gives zero stress");
});

test("spar chain pins the lesson's worked numbers", () => {
  const chain = sparChain();
  closeTo(chain.liftN, 2.4525, 1e-4, "gust lift");
  closeTo(chain.momentNm, 0.15328, 1e-5, "root moment");
  closeTo(chain.stressMPa, 6.39, 0.05, "root bending stress");
  assert.equal(chain.bindingConstraint, "stiffness");

  const byId = Object.fromEntries(chain.results.map((r) => [r.material.id, r]));
  // Deflections: balsa sags ~11 mm, aluminum ~0.46 mm, carbon ~0.25 mm
  closeTo(byId.balsa.deflectionMm, 11.1, 0.2, "balsa deflection");
  closeTo(byId.al7075.deflectionMm, 0.46, 0.03, "aluminum deflection");
  closeTo(byId.cfrp.deflectionMm, 0.25, 0.03, "carbon deflection");
  assert.ok(!byId.balsa.stiffnessPass, "balsa must fail the 5 mm screen");
  assert.ok(byId.al7075.stiffnessPass && byId.cfrp.stiffnessPass, "metal and carbon pass stiffness");
  // Strength is not the constraint: every margin well above 1
  for (const r of chain.results) assert.ok(r.strengthMargin > 2, `${r.material.id} strength margin`);
  assert.ok(byId.al7075.strengthMargin > 40, "aluminum strength margin ~53x");
  // Masses: balsa lightest, aluminum heaviest
  closeTo(byId.balsa.massG, 0.96, 0.05, "balsa mass");
  closeTo(byId.al7075.massG, 16.9, 0.2, "aluminum mass");
  closeTo(byId.cfrp.massG, 9.6, 0.2, "carbon mass");
  // Fatigue sanity: operating stress well below each candidate's long-life
  // fatigue strength (aluminum has no true endurance limit; 5e8-cycle value).
  // Aluminum and carbon sit at a few percent (effectively infinite life);
  // balsa at ~53% still sees far too few gust cycles in a glider's life to matter.
  const ratios = Object.fromEntries(chain.results.map((r) => [r.material.id, r.fatigueRatio]));
  assert.ok(ratios.al7075 < 0.05, "aluminum fatigue ratio ~4%");
  assert.ok(ratios.cfrp < 0.02, "carbon fatigue ratio");
  assert.ok(ratios.balsa < 0.6, "balsa fatigue ratio");
  // Fracture sanity for aluminum: critical crack far longer than the spar
  assert.ok(byId.al7075.criticalCrackM > 1, "aluminum critical crack in meters, not millimeters");
});

test("chain helpers reproduce the mastery bank's worked numbers", () => {
  // Bending stress item: 0.15 N·m on 4x6 mm -> ~6.3 MPa
  const sec = sectionProps(0.004, 0.006);
  closeTo(bendingStress(0.15, sec.cM, sec.inertiaM4) / 1e6, 6.25, 0.05, "mastery bending stress");
  // Hall-Petch item: 25 um -> 200 MPa, 100 um -> 150 MPa pins k = 500, sigma0 = 100
  closeTo(hallPetch(100, 500, 25), 200, 1e-9, "hall-petch pin 1");
  closeTo(hallPetch(100, 500, 100), 150, 1e-9, "hall-petch pin 2");
  closeTo(hallPetch(100, 500, 6.25), 300, 1e-9, "hall-petch refined");
  // Lever rule item: 40% B between 20 and 80 -> 33% beta
  const f = leverFractions(40, 20, 80);
  closeTo(f.beta, 1 / 3, 1e-9, "beta fraction");
  closeTo(f.alpha + f.beta, 1, 1e-12, "fractions sum to 1");
  // Diffusion item: D = 1.1e-11, t = 4 h -> 0.80 mm
  closeTo(diffusionLength(1.1e-11, 4 * 3600) * 1000, 0.80, 0.02, "diffusion length");
  // Fatigue item: halving stress with b = -0.1 -> 1024x life
  closeTo(basquinLifeMultiplier(0.5, -0.1), 1024, 1, "basquin multiplier");
  // Fracture item: halving stress -> 4x critical crack
  const a1 = criticalCrackSize(29e6, 200e6);
  const a2 = criticalCrackSize(29e6, 100e6);
  closeTo(a2 / a1, 4, 1e-9, "crack size quadruples at half stress");
  // Allowable identity
  closeTo(designAllowable(505e6, 1.5) / 1e6, 336.7, 0.1, "7075-T6 allowable");
});

test("mastery bank is weighted as the syllabus demands", () => {
  assert.equal(MAT_MASTERY_BANK.length, 12);
  const counts = { chain: 0, failure: 0, mixed: 0 };
  for (const item of MAT_MASTERY_BANK) {
    counts[item.topic] += 1;
    assert.ok(item.id.length > 0);
    assert.equal(item.options.length, 4);
    assert.ok(item.answer >= 0 && item.answer <= 3);
    assert.ok(item.why.trim().length > 0, `${item.id} must explain itself`);
  }
  assert.deepEqual(counts, { chain: 4, failure: 4, mixed: 4 });
  const ids = MAT_MASTERY_BANK.map((i) => i.id);
  assert.equal(new Set(ids).size, 12, "mastery ids must be unique");
});

test("mastery gate enforces the 70% block rule", () => {
  assert.equal(MAT_MASTERY_GATE_PCT, 70);
  assert.equal(masteryPct(9, 12), 75);
  assert.ok(masteryPass(9, 12), "9/12 clears");
  assert.ok(!masteryPass(8, 12), "8/12 does not clear");
  assert.equal(masteryPct(0, 0), 0);
});

test("corrections are required exactly for missed chain/failure items", () => {
  const missed = MAT_MASTERY_BANK.filter((i) => i.topic !== "mixed");
  const required = correctionsRequired(missed);
  assert.equal(required.length, 8);
  assert.ok(required.every((i) => i.topic === "chain" || i.topic === "failure"));
  const mixedMissed = MAT_MASTERY_BANK.filter((i) => i.topic === "mixed");
  assert.equal(correctionsRequired(mixedMissed).length, 0, "mixed items need no correction");
  assert.equal(correctionsRequired([]).length, 0);
});

test("spar material table is complete", () => {
  assert.equal(SPAR_MATERIALS.length, 3);
  for (const m of SPAR_MATERIALS) {
    assert.ok(m.ePa > 0 && m.strengthPa > 0 && m.densityKgM3 > 0 && m.fos >= 1);
    assert.ok(m.route.trim().length > 0, `${m.id} must name its processing route`);
  }
});
