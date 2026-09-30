import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

// The existing script test runner lacks --experimental-strip-types; keep that
// contract and load type-only course modules in an explicitly configured child.
const data = JSON.parse(execFileSync(process.execPath, [
  '--experimental-strip-types', '--input-type=module', '-e',
  `import {mathLessons} from './src/course/math.ts';
   import {getConceptHelp} from './src/course/concept-help.ts';
   console.log(JSON.stringify({lessons: mathLessons, help: getConceptHelp('material-density')}));`,
], {encoding: 'utf8'}));
const powers = data.lessons.find(l => l.id === 'powers');
const figure = readFileSync('src/components/figures/math.tsx', 'utf8').split('function Powers()')[1].split('/** 0D:')[0];

test('worked example supplies density before calculating mass', () => {
  assert.ok(powers);
  const [given, working, conclusion] = powers.example.split(' || ');
  assert.match(given, /Given: ρ\(aluminum\) ≈ 2700 kg\/m³/);
  assert.match(given, /from material tables/);
  assert.match(given, /not calculated from the dimensions/);
  assert.match(working, /Geometry gives the volume/);
  assert.match(working, /mass = density × volume/);
  assert.match(conclusion, /cubic metres cancel/);
});
test('bracket volume, mass and alternative density units agree', () => {
  const mm3 = 80 * 50 * 6;
  const m3 = mm3 / 1e9;
  const kg = 2700 * m3;
  assert.equal(mm3, 24000);
  assert.ok(Math.abs(m3 - 2.4e-5) < 1e-14);
  assert.ok(Math.abs(kg - 0.0648) < 1e-12);
  assert.equal(Math.round(kg * 1000), 65);
  assert.ok(Math.abs(2.7 * (mm3 / 1000) - kg * 1000) < 1e-9);
});
test('the help is attached to the worked example, not hidden under an unrelated idea', () => {
  assert.deepEqual(powers.exampleHelp, [{concept: 'material-density'}]);
  const view = readFileSync('src/components/lesson-view.tsx', 'utf8');
  assert.match(view, /<Example[^>]*help=\{lesson.exampleHelp\}/);
  const exampleRenderer = view.split('function Example(')[1].split('function Move(')[0];
  assert.match(exampleRenderer, /<ConceptHelp help=\{help\}/);
});
test('the shared explainer explains rho, origin, unit matching and lookup rather than memorization', () => {
  assert.ok(data.help);
  assert.equal(data.help.trigger, 'Where did 2700 come from?');
  const text = JSON.stringify(data.help);
  for (const s of ['rho', 'looked up', '2.70 g/cm³', '64.8 g', 'not need to memorize', 'mm³']) assert.ok(text.includes(s), s);
  assert.ok(data.help.sources.some(s => s.url === 'https://periodic-table.rsc.org/element/13/aluminium'));
});
test('animated figure introduces density before mass and retains it in the final frame', () => {
  const density = figure.indexOf('label: "Density (given)"');
  const mass = figure.indexOf('label: "Mass"');
  assert.ok(density >= 0 && mass > density);
  assert.match(figure, /at: 4\.1[\s\S]*Density \(given\)/);
  assert.match(figure, /at: 6\.1[\s\S]*label: "Mass"/);
  assert.match(figure, /Given · typical material-table value/);
  assert.match(figure, /ρ\(aluminum\) ≈ 2700 kg\/m³/);
  assert.match(figure, /height=\{340\}/);
  assert.match(figure, /duration=\{7\.2\}/);
  assert.match(figure, /ConceptHelp/);
});
test('math mastery thresholds and check structure remain unchanged', () => {
  assert.equal(data.lessons.length, 5);
  for (const l of data.lessons) {
    assert.equal(l.passAt, 4, l.id);
    assert.equal(l.checks.length, 4, l.id);
    assert.ok(l.checks.every(c => c.options.length === 4 && c.answer >= 0 && c.answer < 4));
  }
  assert.equal(powers.bench, 'powers');
});
test('help sources are rendered as explicit optional links and the dialog is named', () => {
  const source = readFileSync('src/components/concept-help.tsx', 'utf8');
  assert.match(source, /aria-label=\{item.title\}/);
  assert.match(source, /item.sources\?\.length/);
  assert.match(source, /href=\{source.url\}/);
});
