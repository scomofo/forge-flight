import assert from "node:assert/strict";
import test from "node:test";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { lessons } from "./catalog.ts";
import { lessonKey } from "./types.ts";

// Figures are React components, so this test reads the figure files as text
// and checks the registry keys rather than importing them.
const dir = join(dirname(fileURLToPath(import.meta.url)), "../components/figures");
const keys = new Map<string, string>();
for (const file of readdirSync(dir).filter((f) => f.endsWith(".tsx") && f !== "kit.tsx")) {
  const text = readFileSync(join(dir, file), "utf8");
  for (const m of text.matchAll(/^\s*"([a-z0-9-]+\/[a-z0-9-]+)":\s*\w+,?\s*$/gm)) {
    assert.ok(!keys.has(m[1]), `figure ${m[1]} registered twice (${keys.get(m[1])} and ${file})`);
    keys.set(m[1], file);
  }
}

test("every lesson has exactly one figure", () => {
  const missing = lessons.map((l) => lessonKey(l.track, l.id)).filter((k) => !keys.has(k));
  assert.deepEqual(missing, [], `lessons without a figure: ${missing.join(", ")}`);
});

test("every figure belongs to a lesson", () => {
  const known = new Set(lessons.map((l) => lessonKey(l.track, l.id)));
  const stray = [...keys.keys()].filter((k) => !known.has(k));
  assert.deepEqual(stray, [], `figures with no lesson: ${stray.join(", ")}`);
});
