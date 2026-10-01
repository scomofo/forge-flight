import assert from "node:assert/strict";
import test from "node:test";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const data = JSON.parse(execFileSync(process.execPath, ["--experimental-strip-types", "--input-type=module", "-e", `
import { mathLessons } from './src/course/math.ts';
import { getConceptHelp } from './src/course/concept-help.ts';
import { vectorResultantSections, TRIG_MEASUREMENT_NOTE } from './src/course/trig-help.ts';
import { exampleContexts } from './src/course/example-context.ts';
const keys=['right-triangle-ratios','radians','angle-unit-choice','angle-measurement','vector-resultant','atan2-direction'];
console.log(JSON.stringify({lesson:mathLessons.find(l=>l.id==='triangles-vectors'),
  help:Object.fromEntries(keys.map(k=>[k,getConceptHelp(k)])),sections:vectorResultantSections,
  note:TRIG_MEASUREMENT_NOTE,context:exampleContexts['math/triangles-vectors']}));
`], { encoding: "utf8" }));
const rad = degrees => degrees * Math.PI / 180;
const close = (actual, expected, tolerance = 1e-10) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);
const source = path => readFileSync(path, "utf8");

test("side names and ratio choice are visible before the numerical cable example", () => {
  const { lesson } = data;
  assert.equal(lesson.readFlow[0].idea, 0);
  assert.equal(lesson.readFlow[1].idea, 1);
  assert.equal(lesson.readFlow[2].kind, "example");
  for (const word of ["90°", "Opposite", "adjacent", "swap", "hypotenuse"]) assert.ok(lesson.ideas[0].body.includes(word));
  assert.match(lesson.ideas[0].formulaNote, /SOH-CAH-TOA/);
  assert.equal(lesson.ideas[0].sections[0].table.rows.length, 3);
  assert.ok(data.context.notes.some(n => n.includes("adjacent to 35°")));
});

test("the 30-degree brace uses tangent for height and cosine for length", () => {
  const h = 24 * Math.tan(rad(30));
  const length = 24 / Math.cos(rad(30));
  assert.equal(h.toFixed(1), "13.9");
  assert.equal(length.toFixed(1), "27.7");
  close(Math.hypot(24, h), length);
  const help = JSON.stringify(data.help["right-triangle-ratios"]);
  for (const text of ["24 in", "13.9 in", "27.7 in", "Multiply both sides", "DEG"]) assert.ok(help.includes(text));
});

test("radian definition, two-way conversions, rim distance and calculator mode agree", () => {
  close(rad(90), Math.PI / 2);
  close(rad(30), Math.PI / 6);
  close((Math.PI / 2) * 180 / Math.PI, 90);
  assert.equal((180 / Math.PI).toFixed(1), "57.3");
  assert.equal((10 * rad(90)).toFixed(1), "15.7");
  close(10 * rad(90), 2 * Math.PI * 10 / 4);
  assert.equal(Math.sin(rad(35)).toFixed(3), "0.574");
  assert.equal(Math.sin(35).toFixed(3), "-0.428");
  assert.match(JSON.stringify(data.help.radians), /without slipping/);
  assert.match(JSON.stringify(data.help["angle-unit-choice"]), /Multiplication alone is not the test/);
  assert.match(data.lesson.ideas[1].body, /Follow the units the formula expects/);
});

test("the 500 N angle-sensitivity table preserves total force at every angle", () => {
  const table = data.help["angle-measurement"].sections.find(s => s.table?.caption.startsWith("Same 500 N")).table;
  for (const [angle, fx, fy] of table.rows) {
    const theta = rad(parseFloat(angle));
    close(500 * Math.cos(theta), parseFloat(fx), .05);
    close(500 * Math.sin(theta), parseFloat(fy), .05);
    close(Math.hypot(500 * Math.cos(theta), 500 * Math.sin(theta)), 500);
  }
  assert.equal(data.lesson.note, data.note);
  assert.match(source("src/components/bench/math-labs.tsx"), /note=\{TRIG_MEASUREMENT_NOTE\}/);
  assert.match(data.note, /calculated components/);
});

test("the 1000 lbf example distinguishes force from mass and the input from arithmetic", () => {
  close(1000 * Math.sin(rad(30)), 500);
  close(1000 * Math.sin(rad(32)), 529.919264233205);
  assert.equal((1000 * (Math.sin(rad(32)) - Math.sin(rad(30)))).toFixed(0), "30");
  const text = JSON.stringify(data.help["angle-measurement"]);
  for (const fragment of ["pounds-force", "529.9 lbf", "30 lbf", "not a universal allowance"]) assert.ok(text.includes(fragment));
});

test("the two-pull answer is reproduced without rounding intermediate components", () => {
  const x = 500 + 300 * Math.cos(rad(60));
  const y = 300 * Math.sin(rad(60));
  close(x, 650); close(y, 259.8076211353316);
  close(Math.hypot(x, y), 700);
  assert.equal((Math.atan2(y, x) * 180 / Math.PI).toFixed(1), "21.8");
  assert.equal(Math.hypot(650, 260).toFixed(1), "700.1");
  assert.deepEqual(data.lesson.checks[3].feedbackSections, data.sections);
  assert.equal(data.sections[0].table.rows[2][1], "Rx = 650");
});

test("distractors correspond to the documented mistakes, not opposing forces", () => {
  assert.equal(Math.hypot(500, 300).toFixed(0), "583");
  const wrongX = 500 + 300 * Math.sin(rad(60));
  const wrongY = 300 * Math.cos(rad(60));
  assert.equal(Math.hypot(wrongX, wrongY).toFixed(0), "774");
  assert.equal((Math.atan2(wrongY, wrongX) * 180 / Math.PI).toFixed(1), "11.2");
  assert.match(JSON.stringify(data.sections), /do not oppose each other/);
  assert.doesNotMatch(JSON.stringify(data.sections), /partly work against/);
});

test("atan2 retains quadrant information and its output is converted to degrees", () => {
  close(Math.atan2(1, 1) * 180 / Math.PI, 45);
  close(Math.atan2(1, -1) * 180 / Math.PI, 135);
  close(Math.atan2(-1, -1) * 180 / Math.PI, -135);
  close(Math.atan2(1, 0) * 180 / Math.PI, 90);
  const text = JSON.stringify(data.help["atan2-direction"]);
  for (const phrase of ["not mean the reciprocal", "different argument order", "returns radians", "zero vector"]) assert.ok(text.includes(phrase));
});

test("structured feedback and optional help are rendered only in the answered branch", () => {
  const quiz = source("src/components/quiz.tsx");
  const answered = quiz.indexOf("{picked !== null ? (");
  assert.ok(answered > 0);
  for (const element of ["<LessonSections", "<ConceptHelp"]) assert.ok(quiz.indexOf(element) > answered);
  for (const entry of Object.values(data.help)) assert.ok(entry?.sections?.length);
  assert.equal(data.lesson.checks.length, 4);
  assert.equal(data.lesson.passAt, 4);
  assert.deepEqual(data.lesson.checks.map(c => c.answer), [0, 0, 0, 0]);
});
