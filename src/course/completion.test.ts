/**
 * Validation for Pass 3 completion semantics (scout/curriculum-review-fixes).
 *
 * "Completed" must have one clear meaning per lesson: the capstone completes
 * on its rubric gate, ordinary lessons on their quiz pass mark, and practical
 * bench evidence is the learner's explicit mark — never inferred, never a
 * quiz score.
 *
 * Run with: node --experimental-strip-types --test src/course/completion.test.ts
 * from the repo root. Imports are relative "./x.ts" so Node's type-stripping
 * resolves them without the @/ alias.
 */
import assert from "node:assert/strict";
import test, { afterEach } from "node:test";

// In-memory localStorage for the zustand persist middleware. The store is
// created with skipHydration, so storage is only touched on writes. zustand's
// default storage reads `window.localStorage`, which does not exist in Node,
// so alias window to globalThis.
const backing = new Map<string, string>();
const storageStub = {
  getItem: (key: string) => (backing.has(key) ? backing.get(key)! : null),
  setItem: (key: string, value: string) => {
    backing.set(key, value);
  },
  removeItem: (key: string) => {
    backing.delete(key);
  },
};
(globalThis as Record<string, unknown>).localStorage = storageStub;
(globalThis as Record<string, unknown>).window = globalThis;

const { lessonComplete } = await import("./types.ts");
const { useProgress } = await import("./progress.ts");

afterEach(() => {
  useProgress.getState().reset();
  backing.clear();
});

test("lessonComplete routes the capstone through its rubric gate, not its quiz", () => {
  const capstone = { bench: "cappackage" };
  // A perfect quiz score with the gate closed is not completion.
  assert.equal(lessonComplete(capstone, 4, false), false);
  // An open gate completes the capstone even with no quiz score on record.
  assert.equal(lessonComplete(capstone, undefined, true), true);
  assert.equal(lessonComplete(capstone, 4, true), true);
  assert.equal(lessonComplete(capstone, 2, true), true);
});

test("lessonComplete keeps ordinary lessons on the quiz pass mark", () => {
  const lesson = { bench: "units", passAt: 4 };
  assert.equal(lessonComplete(lesson, 4, false), true);
  assert.equal(lessonComplete(lesson, 3, false), false);
  assert.equal(lessonComplete(lesson, undefined, false), false);
  // The capstone gate never leaks into other lessons.
  assert.equal(lessonComplete(lesson, 3, true), false);
  assert.equal(lessonComplete(lesson, 4, true), true);
});

test("markPractical records practical evidence per lesson, apart from quiz scores", () => {
  assert.deepEqual(useProgress.getState().practical, {});
  useProgress.getState().markPractical("physics/measure");
  const state = useProgress.getState();
  assert.equal(state.practical["physics/measure"], true);
  assert.equal(state.practical["physics/vecadd"], undefined);
  // Quiz completion is untouched by the practical mark.
  assert.deepEqual(state.completed, {});
});

test("practical evidence is persisted and reset clears it", () => {
  useProgress.getState().markPractical("physics/measure");
  const raw = backing.get("axiom-progress");
  assert.ok(raw, "progress must be written to storage");
  const saved = JSON.parse(raw!).state;
  assert.equal(saved.practical["physics/measure"], true);
  useProgress.getState().reset();
  assert.deepEqual(useProgress.getState().practical, {});
  assert.equal(useProgress.getState().capstonePass, false);
});
