import test from "node:test";
import assert from "node:assert/strict";
import { curveReadingRanges } from "./curve-reading.ts";
import { MATERIALS, generateCurve, extractParams } from "./mechresponse.ts";
import { materialsW14Lessons } from "./materials-w14.ts";
import { materialsWalkthroughs } from "./materials-walkthroughs.ts";
for (const [round, i] of [0, 2, 3, 1, 5].entries()) test(`curve-reading axes contain the actual record and offset intersection: ${MATERIALS[i].name}`, () => {
  const curve = generateCurve(MATERIALS[i], { noise: .008, seed: 101 + round });
  const copy = JSON.stringify(curve), e = extractParams(curve), r = curveReadingRanges(curve, e.E);
  assert.ok(r.fullStrain >= e.elongation);
  assert.ok(r.initialStrain >= .002 + e.yieldStrength! / e.E);
  assert.ok(r.stress > e.uts);
  assert.ok(r.initialStrain <= r.fullStrain);
  assert.equal(JSON.stringify(curve), copy, "plot setup cannot change grading data");
});
test("invalid figure inputs fail explicitly", () => {
  assert.throws(() => curveReadingRanges([], 1));
  assert.throws(() => curveReadingRanges([{ strain: 0, stress: 0 }, { strain: .1, stress: 1 }], NaN));
});
test("steel example preserves the observations without inventing an offset-intersection force", () => {
  const l = materialsW14Lessons[0], w = JSON.stringify(materialsWalkthroughs.readcurve);
  const A = Math.PI * 12.5 ** 2 / 4;
  assert.ok(Math.abs(42900 / A - 350) < .5);
  assert.ok(Math.abs(51500 / A - 420) < .5);
  assert.match(l.example, /No offset-intersection force is provided/);
  assert.match(l.example, /stress at departure from linearity ≈ 350 MPa/);
  assert.match(l.example, /E = 200 GPa/);
  assert.doesNotMatch(l.example, /350, 420, 200 GPa/);
  assert.match(w, /No offset-intersection force is supplied/);
  assert.match(l.checks[3].prompt, /stress at that reported force/);
});
test("first-use symbols, construction and simulated provenance are explicit", () => {
  const l = materialsW14Lessons[0];
  assert.match(l.start, /sigma/); assert.match(l.start, /epsilon/); assert.match(l.start, /original gauge length/);
  assert.match(l.ideas[0].body, /not the exact first onset/);
  assert.match(l.note, /±0.8%/); assert.match(l.note, /not physical specimens/);
  assert.doesNotMatch(l.prompt + l.note, /miss is a reading error|like a lab tech|book value/);
});
