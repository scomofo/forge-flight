/**
 * Validation for the Materials 101 Week 19 batch (scout/materials-w19).
 *
 * Run with: node --experimental-strip-types --test src/course/materials-w19.test.ts
 * from the repo root. Imports are relative "./x.ts" so Node's type-stripping
 * resolves them without the @/ alias.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { materialsW19Lessons } from "./materials-w19.ts";
import {
  corrosionModes,
  galvanicRisk,
  galvanicSeries,
  propertyIndex,
  rankMaterials,
  screenMaterials,
  selMaterials,
  tradeStudy,
} from "./selection.ts";
import { lessons, lessonsFor } from "./catalog.ts";

const here = dirname(fileURLToPath(import.meta.url));

const mat = (id: string) => {
  const m = selMaterials.find((s) => s.id === id);
  assert.ok(m, `material ${id} must exist in the database`);
  return m;
};

test("week 19 opens the materials track in syllabus order", () => {
  assert.equal(materialsW19Lessons.length, 3);
  assert.deepEqual(
    materialsW19Lessons.map((l) => l.id),
    ["screenrank", "corrosion", "sustain"],
  );
  assert.deepEqual(
    materialsW19Lessons.map((l) => l.index),
    [25, 26, 27],
  );
  for (const l of materialsW19Lessons) assert.equal(l.track, "materials");
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
  for (const l of materialsW19Lessons) {
    assert.ok(lessons.includes(l), `week-19 lesson ${l.id} must be in lessons`);
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

test("week-19 lessons keep the lesson contract", () => {
  for (const lesson of materialsW19Lessons) {
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

test("week-19 bench ids are registered in the bench index", () => {
  const indexSource = readFileSync(join(here, "..", "components", "bench", "index.tsx"), "utf8");
  const registered = new Set(
    [...indexSource.matchAll(/case\s+"([\w-]+)"/g)].map((m) => m[1]),
  );
  for (const lesson of materialsW19Lessons) {
    assert.ok(
      registered.has(lesson.bench),
      `bench id "${lesson.bench}" from ${lesson.id} must have a case in bench/index.tsx`,
    );
  }
  const labsSource = readFileSync(join(here, "..", "components", "bench", "materials-labs.tsx"), "utf8");
  for (const [id, component] of [
    ["shortlist", "ShortlistBench"],
    ["corrocheck", "CorroCheckBench"],
  ] as const) {
    assert.ok(
      new RegExp(`export function ${component}\\b`).test(labsSource),
      `materials-labs.tsx must export the ${id} bench component`,
    );
  }
  const typesSource = readFileSync(join(here, "types.ts"), "utf8");
  for (const id of ["shortlist", "corrocheck"]) {
    assert.ok(typesSource.includes(`"${id}"`), `types.ts BenchId must include "${id}"`);
  }
});

test("property indices match the lesson's worked numbers", () => {
  // Lesson 1 worked case: tie rod, stiffness-limited, M = E/ρ
  const steel = propertyIndex(mat("steel1045"), "tie-stiffness");
  const al = propertyIndex(mat("al6061"), "tie-stiffness");
  const cfrp = propertyIndex(mat("cfrp"), "tie-stiffness");
  assert.ok(Math.abs(steel - 210 / 7.85) / (210 / 7.85) < 1e-9);
  assert.ok(Math.abs(al - 69 / 2.7) / (69 / 2.7) < 1e-9);
  assert.ok(Math.abs(cfrp - 140 / 1.55) / (140 / 1.55) < 1e-9);
  // steel and aluminum within 5% on the index, carbon far ahead
  assert.ok(Math.abs(steel - al) / steel < 0.05, `steel ${steel} and al ${al} should be within 5%`);
  assert.ok(cfrp > 3 * steel, "carbon fiber should lead the index by a wide margin");
  // beam-strength index uses the σ^2/3 exponent
  const beam = propertyIndex(mat("ti64"), "beam-strength");
  const expected = Math.cbrt(900 * 900) / 4.43;
  assert.ok(Math.abs(beam - expected) / expected < 1e-9);
});

test("hard screens reject with named causes", () => {
  const { pass, fail } = screenMaterials(selMaterials, {
    minStrength: 200,
    maxDensity: 9,
    maxCost: 10,
    minCorrosion: 3,
    maxEmbodied: 600,
  });
  const passIds = pass.map((m) => m.id);
  const failIds = new Map(fail.map((f) => [f.mat.id, f.reasons.join(" ")]));
  assert.ok(passIds.includes("al6061"), "6061 aluminum should clear every screen");
  assert.ok(failIds.has("cfrp"), "CFRP must die on the cost screen");
  assert.ok(failIds.get("cfrp")!.includes("cost"), "CFRP's cause of death must name cost");
  assert.ok(failIds.has("steel1045"), "bare carbon steel must die on the corrosion screen");
  assert.ok(failIds.get("steel1045")!.includes("corrosion"), "steel's cause of death must name corrosion");
  assert.ok(failIds.has("hdpe"), "HDPE must die on the strength screen");
  for (const f of fail) assert.ok(f.reasons.length > 0, "every reject must name its cause");
});

test("ranking and trade study behave", () => {
  const survivors = rankMaterials(selMaterials, "tie-stiffness");
  assert.equal(survivors[0].id, "alumina", "alumina's extreme stiffness tops E/ρ");
  for (let i = 1; i < survivors.length; i++) {
    assert.ok(
      propertyIndex(survivors[i - 1], "tie-stiffness") >= propertyIndex(survivors[i], "tie-stiffness"),
      "ranking must be non-increasing in the index",
    );
  }
  const trade = tradeStudy([mat("al6061"), mat("steel1045"), mat("ss316")], "tie-stiffness", {
    performance: 50,
    cost: 25,
    carbon: 25,
  });
  assert.equal(trade.length, 3);
  for (let i = 1; i < trade.length; i++) {
    assert.ok(trade[i - 1].score >= trade[i].score, "trade study must be non-increasing in score");
  }
  for (const t of trade) {
    assert.ok(t.score >= 0 && t.score <= 1, "scores must be normalized to [0,1]");
  }
  assert.deepEqual(tradeStudy([], "tie-stiffness", { performance: 1, cost: 0, carbon: 0 }), []);
});

test("galvanic verdicts name the anode and scale with the cell", () => {
  const aluminum = galvanicSeries.find((m) => m.id === "aluminum")!;
  const steel = galvanicSeries.find((m) => m.id === "steel")!;
  // Lesson 2 worked case: aluminum bolted to steel in salt splash, small anode
  const v = galvanicRisk(aluminum, steel, "splash", true);
  assert.equal(v.anode.id, "aluminum", "the more negative metal dissolves");
  assert.equal(v.cathode.id, "steel");
  assert.ok(Math.abs(v.dV - 0.15) < 1e-9, `ΔV should be 0.15 V, got ${v.dV}`);
  assert.equal(v.level, "high", "0.15 V + splash + small anode should read high");
  assert.ok(v.advice.length > 0, "verdict must advise how to break the cell");
  // dry air: no electrolyte, no cell
  assert.equal(galvanicRisk(aluminum, steel, "dry", true).level, "negligible");
  // same metal: no driving voltage
  const same = galvanicRisk(steel, steel, "immersed", false);
  assert.equal(same.dV, 0);
  assert.equal(same.level, "low");
});

test("corrosion mode catalog is complete", () => {
  assert.equal(corrosionModes.length, 5);
  for (const mode of corrosionModes) {
    for (const field of ["name", "morphology", "driver", "protection"] as const) {
      assert.ok(mode[field].trim().length > 0, `corrosion mode ${mode.id} needs ${field}`);
    }
  }
  const ids = corrosionModes.map((m) => m.id);
  for (const id of ["galvanic", "pitting", "crevice", "scc", "uniform"]) {
    assert.ok(ids.includes(id), `corrosion catalog must cover ${id}`);
  }
});
