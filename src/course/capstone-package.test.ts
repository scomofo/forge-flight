import assert from "node:assert/strict";
import test from "node:test";
import {
  PACKAGE_STORE, emptyPackage, normalizePackage, editPackageText,
  scorePackageSection, loadPackage, savePackage,
} from "./capstone-package.ts";

const keys = ["requirement", "model", "test", "mismatch", "revision"] as const;
const written = () => ({
  text: Object.fromEntries(keys.map((key) => [key, `Evidence for ${key}`])),
  scores: Object.fromEntries(keys.map((key) => [key, 2])),
});

test("blank text cannot receive credit from legacy perfect self-scores", () => {
  const value = written();
  for (const key of keys) value.text[key] = " \n\t ";
  assert.deepEqual(normalizePackage(value).scores, emptyPackage().scores);
});

test("complete valid legacy packages retain every text and score", () => {
  const value = written();
  assert.deepEqual(normalizePackage(value), value);
});

test("missing evidence invalidates only the affected section", () => {
  const value = written();
  value.text.test = "";
  const next = normalizePackage(value);
  assert.equal(next.scores.test, 0);
  assert.equal(next.scores.model, 2);
  assert.equal(next.text.model, value.text.model);
});

test("invalid saved scores never become passing scores", () => {
  for (const score of [null, undefined, NaN, Infinity, -1, 0.5, 3, "2", true, {}, []]) {
    const value = written();
    const next = normalizePackage({ ...value, scores: { ...value.scores, test: score } });
    assert.equal(next.scores.test, 0, `score ${String(score)}`);
  }
});

test("non-object and malformed records normalize without throwing", () => {
  for (const value of [null, undefined, 42, true, "text", [], { text: [], scores: [] }]) {
    assert.deepEqual(normalizePackage(value), emptyPackage());
  }
});

test("non-string evidence cannot earn credit", () => {
  const value = written();
  for (const text of [null, 42, {}, [], true]) {
    assert.equal(normalizePackage({ ...value, text: { ...value.text, model: text } }).scores.model, 0);
  }
});

test("editing evidence invalidates its self-score without altering other work", () => {
  const original = normalizePackage(written());
  const next = editPackageText(original, "model", "A revised model and assumptions");
  assert.equal(next.scores.model, 0);
  assert.equal(next.scores.test, 2);
  assert.equal(original.scores.model, 2);
  assert.equal(next.text.model, "A revised model and assumptions");
});

test("an unchanged field does not discard its self-score", () => {
  const original = normalizePackage(written());
  assert.deepEqual(editPackageText(original, "model", original.text.model), original);
});

test("clearing evidence revokes credit and retyping does not silently restore it", () => {
  const initial = normalizePackage(written());
  const cleared = editPackageText(initial, "revision", "");
  const restored = editPackageText(cleared, "revision", initial.text.revision);
  assert.equal(restored.scores.revision, 0);
  assert.equal(scorePackageSection(restored, "revision", 2).scores.revision, 2);
});

test("scoring an empty section stays at zero", () => {
  for (const key of keys) {
    assert.equal(scorePackageSection(emptyPackage(), key, 2).scores[key], 0);
  }
});

test("written sections can be self-scored 0, 1, or 2", () => {
  const state = normalizePackage(written());
  for (const score of [0, 1, 2] as const) {
    assert.equal(scorePackageSection(state, "model", score).scores.model, score);
  }
});

test("normalization ignores unknown keys and preserves literal prose", () => {
  const value = written();
  value.text.model = "  <script>not executable</script>\nMy model  ";
  const result = normalizePackage({ ...value, surprise: true });
  assert.equal(result.text.model, value.text.model);
  assert.deepEqual(Object.keys(result), ["text", "scores"]);
  assert.deepEqual(Object.keys(result.scores), [...keys]);
});

test("reload reads and normalizes the package, not a cached completion flag", () => {
  const value = written();
  value.text.test = "";
  const result = loadPackage({ getItem: (key) => {
    assert.equal(key, PACKAGE_STORE);
    return JSON.stringify({ ...value, capstonePass: true });
  } });
  assert.equal(result.scores.test, 0);
});

test("unavailable, malformed, and blocked storage fail closed", () => {
  assert.deepEqual(loadPackage(), emptyPackage());
  assert.deepEqual(loadPackage({ getItem: () => null }), emptyPackage());
  assert.deepEqual(loadPackage({ getItem: () => "not JSON" }), emptyPackage());
  assert.deepEqual(loadPackage({ getItem: () => { throw new Error("blocked"); } }), emptyPackage());
  assert.equal(savePackage(emptyPackage()), false);
  assert.equal(savePackage(emptyPackage(), { setItem: () => { throw new Error("full"); } }), false);
});

test("saving and reloading round-trips valid work without mutating it", () => {
  const state = normalizePackage(written());
  let saved: string | null = null;
  assert.equal(savePackage(state, { setItem: (key, value) => {
    assert.equal(key, PACKAGE_STORE);
    saved = value;
  } }), true);
  assert.deepEqual(loadPackage({ getItem: () => saved }), state);
});

test("a fresh package has independent text and score records", () => {
  const first = emptyPackage();
  first.text.model = "changed";
  first.scores.model = 2;
  assert.deepEqual(emptyPackage().text, Object.fromEntries(keys.map((key) => [key, ""])));
  assert.deepEqual(emptyPackage().scores, Object.fromEntries(keys.map((key) => [key, 0])));
});
