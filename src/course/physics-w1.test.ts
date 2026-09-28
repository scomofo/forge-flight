/**
 * Validation for the Physics 101 Week 1 batch (scout/physics-w1).
 *
 * Run with: node --experimental-strip-types --test src/course/physics-w1.test.ts
 * from the repo root. Imports are relative "./x.ts" so Node's type-stripping
 * resolves them without the @/ alias.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { physicsW1Lessons } from "./physics-w1.ts";
import {
  CANDIDATES,
  addDims,
  candidateBalances,
  candidateDims,
  combineFactors,
  dimsOf,
  equalDims,
  formatDims,
  isDimensionless,
  powDims,
  subDims,
  type Dims,
} from "./dims.ts";
import { lessons, lessonsFor } from "./catalog.ts";

const here = dirname(fileURLToPath(import.meta.url));

test("week 1 opens the physics track in syllabus order", () => {
  assert.equal(physicsW1Lessons.length, 3);
  assert.deepEqual(
    physicsW1Lessons.map((l) => l.id),
    ["measure", "sigfigs", "fermi"],
  );
  assert.deepEqual(
    physicsW1Lessons.map((l) => l.index),
    [1, 2, 3],
  );
  for (const l of physicsW1Lessons) assert.equal(l.track, "physics");
  const physics = lessonsFor("physics");
  assert.equal(physics.length, 36, "physics track must hold weeks 1-10 plus the 6 legacy lessons");
  assert.deepEqual(
    physics.map((l) => l.id),
    [
      "measure",
      "sigfigs",
      "fermi",
      "veccomp",
      "kingraphs",
      "projectiles",
      "newton",
      "contact",
      "fbd",
      "work",
      "potential",
      "power",
      "impulse",
      "conserve",
      "collisions",
      "torque",
      "rotation",
      "equilibrium",
      "elastic",
      "bending",
      "fos",
      "pressure",
      "movingfluids",
      "lift",
      "shm",
      "reswaves",
      "thermal",
      "synthmethod",
      "towlaunch",
      "masterycheck",
      "vectors",
      "kinematics",
      "forces",
      "energy",
      "momentum",
      "waves",
    ],
  );
  assert.deepEqual(
    physics.map((l) => l.index),
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36],
  );
  for (const l of physicsW1Lessons) {
    assert.ok(lessons.includes(l), `week-1 lesson ${l.id} must be in lessons`);
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

test("week-1 lessons keep the lesson contract", () => {
  for (const lesson of physicsW1Lessons) {
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

test("week-1 bench ids are registered in the bench index", () => {
  const indexSource = readFileSync(join(here, "..", "components", "bench", "index.tsx"), "utf8");
  const registered = new Set(
    [...indexSource.matchAll(/case\s+"([\w-]+)"/g)].map((m) => m[1]),
  );
  for (const lesson of physicsW1Lessons) {
    assert.ok(
      registered.has(lesson.bench),
      `bench id "${lesson.bench}" from ${lesson.id} must have a case in bench/index.tsx`,
    );
  }
  for (const id of ["dimcheck", "fermi", "memo"]) {
    const start = readFileSync(join(here, "..", "components", "bench", "physics-labs.tsx"), "utf8");
    assert.ok(
      new RegExp(`export function \\w*${id === "dimcheck" ? "DimCheck" : id === "fermi" ? "Fermi" : "Memo"}Bench`).test(start),
      `physics-labs.tsx must export the ${id} bench component`,
    );
  }
});

test("dims table holds the standard mechanical dimensions", () => {
  const expect = (name: string, dims: Dims) =>
    assert.ok(equalDims(dimsOf(name), dims), `${name} has wrong dimensions`);
  expect("force", { M: 1, L: 1, T: -2 });
  expect("energy", { M: 1, L: 2, T: -2 });
  expect("power", { M: 1, L: 2, T: -3 });
  expect("pressure", { M: 1, L: -1, T: -2 });
  expect("velocity", { M: 0, L: 1, T: -1 });
  expect("acceleration", { M: 0, L: 1, T: -2 });
  expect("density", { M: 1, L: -3, T: 0 });
  expect("frequency", { M: 0, L: 0, T: -1 });
  assert.throws(() => dimsOf("nope"), /unknown quantity/);
});

test("dims arithmetic follows the exponent rules", () => {
  assert.ok(equalDims(addDims(dimsOf("velocity"), dimsOf("time")), dimsOf("length")));
  assert.ok(equalDims(subDims(dimsOf("force"), dimsOf("mass")), dimsOf("acceleration")));
  assert.ok(equalDims(powDims(dimsOf("velocity"), 2), { M: 0, L: 2, T: -2 }));
  // ρ¹·v²·A¹ = MLT⁻² (dynamic pressure × area = force)
  const drag = combineFactors([
    { dims: dimsOf("density"), power: 1 },
    { dims: dimsOf("velocity"), power: 2 },
    { dims: dimsOf("area"), power: 1 },
  ]);
  assert.ok(equalDims(drag, dimsOf("force")));
  assert.ok(isDimensionless(combineFactors([])));
  assert.ok(!isDimensionless(dimsOf("force")));
});

test("formatDims renders the M/L/T triple", () => {
  assert.equal(formatDims({ M: 0, L: 0, T: 0 }), "1");
  assert.equal(formatDims({ M: 1, L: 1, T: -2 }), "M L T⁻²");
  assert.equal(formatDims({ M: 1, L: 2, T: -2 }), "M L² T⁻²");
  assert.equal(formatDims({ M: 0, L: 0, T: 1 }), "T");
});

test("candidate equations balance exactly when their verdict says so", () => {
  assert.equal(CANDIDATES.length, 4);
  for (const c of CANDIDATES) {
    const { lhs, rhs } = candidateDims(c);
    assert.equal(
      candidateBalances(c),
      c.verdict === "valid",
      `${c.label}: balance must agree with verdict`,
    );
    assert.ok(c.verdictWhy.trim().length > 0, `${c.label} must explain its verdict`);
    if (c.verdict === "valid") {
      assert.ok(equalDims(lhs, rhs), `${c.label} marked valid must balance`);
    } else {
      assert.ok(!equalDims(lhs, rhs), `${c.label} marked invalid must not balance`);
    }
  }
});
