/**
 * Validation for the Materials 101 Week 11 batch (scout/materials-w11).
 *
 * Run with: node --experimental-strip-types --test src/course/materials-w11.test.ts
 * from the repo root. Imports are relative "./x.ts" so Node's type-stripping
 * resolves them without the @/ alias.
 */
import assert from "node:assert/strict";
import test from "node:test";

import { materialsW11Lessons } from "./materials-w11.ts";
import {
  BOND_PROFILES,
  SUBSTANCES,
  meltingRegime,
  predictProperties,
  scorePrediction,
  type BondKind,
  type PropertyPack,
} from "./bonding.ts";
import { lessons, lessonsFor } from "./catalog.ts";

function split3(s: string): string[] {
  return s.split(" || ").map((p) => p.trim());
}

test("week 11 opens the materials track in syllabus order", () => {
  assert.equal(materialsW11Lessons.length, 3);
  assert.deepEqual(
    materialsW11Lessons.map((l) => l.id),
    ["bondzoo", "bondpacks", "bondread"],
  );
  assert.deepEqual(
    materialsW11Lessons.map((l) => l.index),
    [1, 2, 3],
  );
  for (const l of materialsW11Lessons) assert.equal(l.track, "materials");
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
  for (const l of materialsW11Lessons) {
    assert.ok(lessons.includes(l), `week-11 lesson ${l.id} must be in lessons`);
  }
});

test("no duplicate track/id lesson keys across the catalog", () => {
  const seen = new Set<string>();
  for (const l of lessons) {
    const key = `${l.track}/${l.id}`;
    assert.ok(!seen.has(key), `duplicate lesson ${key}`);
    seen.add(key);
  }
});

test("week 11 lessons satisfy the Lesson contract", () => {
  for (const l of materialsW11Lessons) {
    for (const field of ["start", "use", "example"] as const) {
      const parts = split3(l[field]);
      assert.equal(parts.length, 3, `${l.id}.${field} must have 3 " || " parts`);
      for (const p of parts) assert.ok(p.length > 0, `${l.id}.${field} has an empty part`);
    }
    assert.equal(l.ideas.length, 3, `${l.id} must have exactly 3 ideas`);
    for (const idea of l.ideas) {
      assert.ok(idea.heading.length > 0, `${l.id} idea missing heading`);
      assert.ok(idea.body.length > 0, `${l.id} idea missing body`);
    }
    assert.equal(l.checks.length, 4, `${l.id} must have exactly 4 checks`);
    for (const c of l.checks) {
      assert.equal(c.options.length, 4, `${l.id} check must have 4 options`);
      assert.ok(c.answer >= 0 && c.answer <= 3, `${l.id} check answer out of range`);
      assert.ok(c.why.length > 0, `${l.id} check missing explanation`);
    }
    assert.ok(l.lede.length > 0, `${l.id} missing lede`);
    assert.ok(l.prompt.length > 0, `${l.id} missing bench prompt`);
    assert.ok(l.minutes > 0, `${l.id} missing minutes`);
  }
});

test("week 11 benches are registered", () => {
  const benches = materialsW11Lessons.map((l) => l.bench);
  assert.deepEqual(benches, ["bonding", "bondenergy", "bondpredict"]);
});

test("bond profiles cover every bond kind with a coherent pack", () => {
  const kinds: BondKind[] = ["metallic", "ionic", "covalent-network", "covalent-molecular", "secondary"];
  for (const k of kinds) {
    const p = BOND_PROFILES[k];
    assert.ok(p, `missing profile for ${k}`);
    assert.ok(p.energyRangeKJ[0] < p.energyRangeKJ[1], `${k} energy range inverted`);
    assert.ok(p.energyRangeKJ[0] > 0, `${k} energy range must be positive`);
    assert.ok(p.examples.length > 0, `${k} missing examples`);
    assert.ok(p.why.length > 0, `${k} missing explanation`);
    const pack = predictProperties(k);
    assert.deepEqual(pack, { conduction: p.conduction, mechanical: p.mechanical, thermal: p.thermal });
  }
  // The pack logic the lessons teach: metal conducts and yields, ionic is brittle.
  assert.equal(predictProperties("metallic").conduction, "conductor");
  assert.equal(predictProperties("metallic").mechanical, "ductile");
  assert.equal(predictProperties("ionic").mechanical, "brittle");
  assert.equal(predictProperties("ionic").conduction, "insulator-until-molten");
  assert.equal(predictProperties("secondary").thermal, "decomposes-or-softens");
});

test("challenge substances name real bond kinds and distinct packs", () => {
  assert.ok(SUBSTANCES.length >= 5, "need a real prediction set");
  const kinds = new Set(SUBSTANCES.map((s) => s.kind));
  assert.ok(kinds.size >= 4, "substances should span most bond kinds");
  for (const s of SUBSTANCES) {
    assert.ok(s.name.length > 0 && s.hint.length > 0 && s.why.length > 0, `substance missing fields: ${s.name}`);
    assert.ok(BOND_PROFILES[s.kind], `substance ${s.name} names unknown bond kind ${s.kind}`);
  }
  // Graphite is the deliberate mixed-bonding trap: covalent-network label,
  // but the hint must flag the in-plane/between-plane split.
  const graphite = SUBSTANCES.find((s) => s.name === "Graphite");
  assert.ok(graphite, "graphite must be in the prediction set");
  assert.match(graphite.hint + graphite.why, /between|plane/i, "graphite must teach mixed bonding");
});

test("scoring counts per-property matches", () => {
  const full: PropertyPack = { conduction: "conductor", mechanical: "ductile", thermal: "high-melting" };
  assert.equal(scorePrediction(full, full), 3);
  assert.equal(
    scorePrediction({ ...full, thermal: "low-melting" }, full),
    2,
  );
  assert.equal(
    scorePrediction(
      { conduction: "insulator", mechanical: "brittle", thermal: "low-melting" },
      full,
    ),
    0,
  );
});

test("melting regime is a rough, monotonic mapping", () => {
  assert.equal(meltingRegime(5), "low");
  assert.equal(meltingRegime(300), "moderate");
  assert.equal(meltingRegime(3000), "high");
});
