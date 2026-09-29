/**
 * Validation for the Math Runway batch (scout/math-runway).
 *
 * Run with: node --experimental-strip-types --test src/course/math-runway.test.ts
 * from the repo root. Imports are relative "./x.ts" so Node's type-stripping
 * resolves them without the @/ alias.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { diagnosticQuestions, DIAGNOSTIC_TOPICS, recommendModules, TEST_OUT_AT, type DiagnosticTopic } from "./diagnostic.ts";
import { mathLessons, mathTrack } from "./math.ts";
import { tracks, lessons, introTrackIds, lessonsFor, lessonNeighbors } from "./catalog.ts";
import { isPassed, lessonKey, type TrackId } from "./types.ts";

const here = dirname(fileURLToPath(import.meta.url));

test("math track is registered and leads the core", () => {
  assert.equal(mathTrack.id, "math");
  assert.equal(mathTrack.index, "00");
  assert.equal(mathTrack.course, "Math Runway");
  assert.ok(tracks.some((t) => t.id === "math"), "mathTrack must be in tracks");
  assert.equal(tracks[0].id, "math", "math must sort before physics in tracks");
  const order = ["math", "physics", "materials", "engineering"];
  assert.deepEqual(
    tracks.slice(0, 4).map((t) => t.id),
    order,
    "core progression must start with math",
  );
  assert.equal(introTrackIds[0], "math", "intro navigation must start with math");
  for (const lesson of mathLessons) {
    assert.ok(lessons.includes(lesson), `math lesson ${lesson.id} must be in lessons`);
  }
  assert.deepEqual(
    lessonsFor("math").map((l) => l.id),
    mathLessons.map((l) => l.id),
    "lessonsFor(math) must return exactly the five runway lessons in order",
  );
  const last = lessonNeighbors("math", "triangles-vectors");
  assert.equal(last.prev?.id, "graphs", "previous of 0E is 0D");
  assert.equal(last.next?.track, "physics", "0E hands off into the physics track");
  assert.equal(last.next?.id, "measure", "0E is followed by the first physics lesson");
});

test("math lessons keep the lesson contract", () => {
  assert.equal(mathLessons.length, 5);
  const ids = new Set<string>();
  for (const lesson of mathLessons) {
    assert.ok(!ids.has(lesson.id), `duplicate lesson id ${lesson.id}`);
    ids.add(lesson.id);
    for (const field of ["start", "use", "example"] as const) {
      const portions = lesson[field].split(" || ");
      assert.equal(portions.length, 3, `${lesson.id}.${field} must have exactly 3 portions`);
      for (const p of portions) assert.ok(p.trim().length > 0, `${lesson.id}.${field} portion must be non-empty`);
    }
    assert.equal(lesson.ideas.length, 3, `${lesson.id} must have exactly 3 ideas`);
    assert.equal(lesson.checks.length, 4, `${lesson.id} must have exactly 4 checks`);
    for (const check of lesson.checks) {
      assert.ok(
        Number.isInteger(check.answer) && check.answer >= 0 && check.answer <= 3,
        `${lesson.id} check answer index out of range: ${check.answer}`,
      );
      assert.equal(check.options.length, 4, `${lesson.id} check must have 4 options`);
      assert.ok(check.why.trim().length > 0, `${lesson.id} check must explain itself`);
    }
    assert.ok(lesson.bench.trim().length > 0, `${lesson.id} must name a bench`);
    assert.ok(lesson.prompt.trim().length > 0, `${lesson.id} must have a bench task line`);
  }
});

test("math benches each carry a two-beat prompt", () => {
  const source = readFileSync(join(here, "..", "components", "bench", "math-labs.tsx"), "utf8");
  const benches = ["UnitsBench", "RearrangeBench", "PowersBench", "SlopeBench", "TrigBench"];
  for (const name of benches) {
    const start = source.indexOf(`export function ${name}`);
    assert.ok(start >= 0, `${name} must exist in math-labs.tsx`);
    const next = source.indexOf("export function", start + 1);
    const chunk = source.slice(start, next === -1 ? undefined : next);
    assert.ok(
      /prompt="[^"]*\|\|[^"]*"/.test(chunk),
      `${name} must carry a two-beat BenchShell prompt`,
    );
  }
});

test("math lessons use the stricter 4/4 gate", () => {
  for (const lesson of mathLessons) {
    assert.equal(lesson.passAt, 4, `${lesson.id} must gate at 4 of 4`);
  }
  assert.ok(isPassed(4, 4));
  assert.ok(!isPassed(3, 4));
  assert.ok(isPassed(3), "default 3/4 behavior must be unchanged");
  assert.ok(!isPassed(2));
  assert.equal(lessonKey("math" as TrackId, "ratios-units"), "math/ratios-units");
});

test("math bench ids are registered in the bench index", () => {
  const indexSource = readFileSync(join(here, "..", "components", "bench", "index.tsx"), "utf8");
  const registered = new Set(
    [...indexSource.matchAll(/case\s+"([\w-]+)"/g)].map((m) => m[1]),
  );
  for (const lesson of mathLessons) {
    assert.ok(
      registered.has(lesson.bench),
      `bench id "${lesson.bench}" from ${lesson.id} must have a case in bench/index.tsx`,
    );
  }
});

test("diagnostic has exactly four questions per topic", () => {
  assert.equal(diagnosticQuestions.length, 24);
  const ids = new Set<string>();
  const perTopic = new Map<string, number>();
  for (const q of diagnosticQuestions) {
    assert.ok(!ids.has(q.id), `duplicate diagnostic id ${q.id}`);
    ids.add(q.id);
    assert.ok(DIAGNOSTIC_TOPICS.includes(q.topic), `unknown topic ${q.topic}`);
    perTopic.set(q.topic, (perTopic.get(q.topic) ?? 0) + 1);
    assert.equal(q.options.length, 4);
    assert.ok(
      Number.isInteger(q.answer) && q.answer >= 0 && q.answer <= 3,
      `${q.id} answer index out of range`,
    );
    assert.ok(q.prompt.trim().length > 0);
    assert.ok(q.why.trim().length > 0);
  }
  for (const topic of DIAGNOSTIC_TOPICS) {
    assert.equal(perTopic.get(topic), 4, `topic ${topic} must have exactly 4 questions`);
  }
});

test("diagnostic recommendation logic", () => {
  const full = {
    "ratios-units": { correct: 4, total: 4 },
    algebra: { correct: 4, total: 4 },
    powers: { correct: 4, total: 4 },
    graphs: { correct: 4, total: 4 },
    "geometry-trig": { correct: 4, total: 4 },
    vectors: { correct: 4, total: 4 },
  } as Record<DiagnosticTopic, { correct: number; total: number }>;
  const allOut = recommendModules(full);
  assert.equal(allOut.length, 5, "one recommendation per runway module");
  assert.ok(allOut.every((r) => !r.take), "4/4 everywhere tests out of everything");

  const weak = structuredClone(full);
  weak.algebra = { correct: 2, total: 4 };
  const withAlgebra = recommendModules(weak);
  const algebraRec = withAlgebra.find((r) => r.moduleId === "algebra");
  assert.ok(algebraRec?.take, "2/4 algebra assigns module 0B");
  assert.ok(withAlgebra.filter((r) => r.take).length === 1, "only algebra is assigned");

  const weakVector = structuredClone(full);
  weakVector.vectors = { correct: 1, total: 4 };
  const withVector = recommendModules(weakVector);
  const vecRec = withVector.find((r) => r.moduleId === "triangles-vectors");
  assert.ok(vecRec?.take, "weak vectors assigns 0E even when geometry-trig is strong");
  assert.ok(withVector.find((r) => r.moduleId === "graphs")?.take === false);

  // Boundary: the test-out bar equals the module's own pass mark, so 3 of 4
  // takes the module and 0 of 4 takes it too.
  assert.equal(TEST_OUT_AT, mathLessons[0].passAt, "diagnostic bar matches the module gate");
  const boundary = structuredClone(full);
  boundary.graphs = { correct: 3, total: 4 };
  boundary.powers = { correct: 0, total: 4 };
  const b = recommendModules(boundary);
  assert.ok(b.find((r) => r.moduleId === "graphs")?.take === true, "3/4 takes the module");
  assert.ok(b.find((r) => r.moduleId === "powers")?.take === true, "0/4 takes the module");
});
