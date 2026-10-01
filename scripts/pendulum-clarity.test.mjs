import assert from "node:assert/strict";
import test from "node:test";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const data = JSON.parse(execFileSync(process.execPath, ["--experimental-strip-types", "--input-type=module", "-e", `
import { physicsW1Lessons } from './src/course/physics-w1.ts';
import { getConceptHelp } from './src/course/concept-help.ts';
import { getExampleContext } from './src/course/example-context.ts';
import { PENDULUM_UNIT_CANDIDATES, pendulumUnitSections } from './src/course/pendulum-help.ts';
import { dimsOf, subDims, powDims } from './src/course/dims.ts';
const ratio = subDims(dimsOf('length'), dimsOf('acceleration'));
console.log(JSON.stringify({ lesson: physicsW1Lessons[0], help: getConceptHelp('pendulum-unit-check'),
  context: getExampleContext('physics','measure'), rows: PENDULUM_UNIT_CANDIDATES,
  sections: pendulumUnitSections, dimensions: [powDims(ratio,.5), powDims(ratio,-.5),ratio] }));
`], { encoding: "utf8" }));

 test("pendulum variables and full cycle are defined without an unexplained numerical input", () => {
  const text = JSON.stringify(data.context);
  for (const term of ["back-and-forth", "half a cycle", "pivot", "not a force", "No numerical", "schematic", "small swing"]) assert.ok(text.includes(term), term);
  assert.equal(data.context.heading, "What the symbols stand for");
  assert.match(data.context.intro, /No lengths or times have to be measured/);
});

test("the three candidates produce time, inverse time and time squared", () => {
  assert.deepEqual(data.dimensions, [{ M: 0, L: 0, T: 1 }, { M: 0, L: 0, T: -1 }, { M: 0, L: 0, T: 2 }]);
  assert.deepEqual(data.rows.map(row => row.units), ["s", "1/s", "s²"]);
  assert.deepEqual(data.rows.map(row => row.possible), [true, false, false]);
  assert.match(data.context.working[0], /m × s²\/m = s²/);
  assert.deepEqual(data.lesson.ideas[1].sections, data.sections);
});

test("brackets, negative powers and the two uses of T are explained locally", () => {
  const text = JSON.stringify(data.sections);
  for (const term of ["[l] = L", "[g] = LT⁻²", "T⁻² = 1/T²", "period variable", "not for its numerical value"]) assert.ok(text.includes(term), term);
  assert.match(data.lesson.ideas[1].formulaNote, /dimension labels/);
});

test("correct units are not sold as model validation or a unit-conversion check", () => {
  const text = JSON.stringify(data.help);
  for (const term of ["5√(l/g)", "small-angle approximation", "unit scale", "pound-force-second"]) assert.ok(text.includes(term), term);
  assert.match(data.lesson.start, /matching dimensions alone would not catch/);
  assert.match(data.lesson.example, /not proved the survivor/);
  assert.ok(data.lesson.exampleHelp.some(help => help.concept === "pendulum-unit-check"));
});

test("the figure reuses the same unit candidates and retains model limits", () => {
  const source = readFileSync("src/components/figures/physics-a.tsx", "utf8").split("function SigFigs()")[0];
  assert.match(source, /PENDULUM_UNIT_CANDIDATES\.map/);
  assert.match(source, /not a timed experiment/);
  assert.match(source, /Correct units are a check, not proof/);
  assert.match(source, /L means length; T means time here/);
});
