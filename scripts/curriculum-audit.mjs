/** Exhaustive inventory and mechanical checks, not a scientific certificate.
 * Run with Node 22 --experimental-strip-types. New items are discovered,
 * never silently marked independently reviewed because a schema check passes. */
import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lessons, tracks } from '../src/course/catalog.ts';
import { getLessonEnrichment } from '../src/course/lesson-enrichment.ts';
import { getExampleContext } from '../src/course/example-context.ts';
import { missions, materials, processes } from '../src/forge/content/catalog.ts';
import { evaluate, MODEL_REVISION } from '../src/forge/sim/evaluate.ts';

export async function sourceFiles(dir) {
  const rows = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) rows.push(...await sourceFiles(path));
    else if (/\.(ts|tsx|mjs)$/.test(entry.name)) rows.push(path);
  }
  return rows.sort();
}
export async function registeredBenches() {
  const index = await readFile('src/components/bench/index.tsx', 'utf8');
  const ladder = (await readFile('src/components/bench/ladder-labs.tsx', 'utf8')).split('const specs:')[1]?.split('type FormulaId')[0] ?? '';
  return [...new Set([...index.matchAll(/case "([\w-]+)"/g)].map(m => m[1])
    .concat([...ladder.matchAll(/^  ([\w-]+): \{/gm)].map(m => m[1]), ['duty', 'review', 'face']))].sort();
}
export function missionDesign(mission) {
  return structuredClone({ parts: mission.parts, vehicle: mission.vehicle, environment: mission.environment,
    limits: mission.constraints, quantity: mission.constraints.quantity ?? 1, fidelity: 'L0', seed: 1 });
}
export function revisedDesign(mission) {
  const d = missionDesign(mission);
  if (mission.id === 'glider') d.vehicle.cg_fromNose_mm = 150;
  if (mission.id === 'drone_arm') d.parts[0].materialId = 'al6061';
  if (mission.id === 'water_rocket') Object.assign(d.parts[0].params, { span_mm: 60, chord_mm: 40, thickness_mm: 3.5 });
  if (mission.id === 'rc_aircraft') Object.assign(d.parts[0].params, { outer_mm: 10, wall_mm: 1 });
  if (mission.id === 'payload') Object.assign(d.parts[0].params, { span_mm: 150, thickness_mm: 4.8 });
  return d;
}

async function main() {
  const out = resolve(process.env.AUDIT_OUT || 'artifacts/curriculum-audit');
  await mkdir(out, { recursive: true });
  const files = [...await sourceFiles('src/course'), ...await sourceFiles('src/forge'), ...await sourceFiles('src/components/bench'), ...await sourceFiles('src/components/figures')];
  const contents = new Map(await Promise.all(files.map(async p => [p, await readFile(p, 'utf8')])));
  const testFiles = (await sourceFiles('src')).filter(p => p.endsWith('.test.ts')).concat((await sourceFiles('scripts')).filter(p => p.endsWith('.test.mjs')));
  const tests = new Map(await Promise.all(testFiles.map(async p => [p, await readFile(p, 'utf8')])));
  const benches = await registeredBenches();
  const figureText = [...contents].filter(([p]) => p.includes('/figures/')).map(([, text]) => text).join('\n');
  const keys = new Set(), failures = [];
  const verify = (key, condition, label) => { if (!condition) failures.push({ key, criterion: label }); return condition; };
  const lessonRows = lessons.map(l => {
    const key = `${l.track}/${l.id}`;
    const checks = {
      uniqueKey: verify(key, !keys.has(key), 'unique lesson key'),
      registeredTrack: verify(key, tracks.some(t => t.id === l.track), 'registered track'),
      learningObjective: verify(key, l.lede.trim().length > 0, 'learning objective'),
      reading: verify(key, !!l.start.trim() && l.ideas.length > 0 && l.ideas.every(i => i.body.trim()), 'nonempty reading'),
      workedExample: verify(key, !!l.example.trim(), 'worked example'),
      benchRegistered: verify(key, benches.includes(l.bench), 'registered bench'),
      taskAndLimit: verify(key, !!l.prompt.trim() && !!l.note.trim(), 'task and authored note'),
      figureRegistered: verify(key, figureText.includes(`"${key}"`), 'registered figure'),
      answerSchema: verify(key, l.checks.length === 4 && l.checks.every(q => q.options.length === 4 && Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length && !!q.why.trim()), 'four valid answer keys with feedback'),
      readFlow: verify(key, !l.readFlow || l.readFlow.every(b => b.kind !== 'idea' || !!l.ideas[b.idea]), 'reading flow references'),
    };
    keys.add(key);
    const source = [...contents].filter(([p, s]) => p.startsWith('src/course/') && !p.includes('.test.') && s.includes(`title: ${JSON.stringify(l.title)}`)).map(([p]) => p);
    const enrichment = getLessonEnrichment(l), context = getExampleContext(l.track, l.id);
    const allText = JSON.stringify({ lesson: l, enrichment, context });
    return { key, title: l.title, track: l.track, bench: l.bench, source, checks,
      questionCount: l.checks.length, enriched: !!enrichment, practice: !!enrichment?.practice,
      visibleFormulaCount: l.ideas.filter(i => i.formula).length,
      citedUrls: [...new Set(allText.match(/https?:\/\/[^\s"\\]+/g) ?? [])],
      automatedScope: 'Schema, reachability and supplied-answer wiring only; see browser results for execution.',
      scientificCertification: 'NOT CERTIFIED: complete independent claim/example/feedback/figure validation has not been established.',
      remainingEvidence: ['Verify every numerical and qualitative claim, including enrichment and visual captions, against independent references.', 'Validate every graded answer against the problem assumptions, not only its authored index.', 'Check transfer and understanding with representative learners.'] };
  });
  const benchRows = benches.map(id => ({ id, lessons: lessonRows.filter(l => l.bench === id).map(l => l.key),
    implementation: 'src/components/bench (registry and ladder dispatch)',
    coverage: 'Browser runner visits every registered bench, including benches with no current lesson.',
    scientificCertification: 'NOT CERTIFIED: rendered controls and finite readouts are not model validation.' }));
  const modelRows = [...contents].filter(([p, s]) => !p.includes('.test.') && (p.startsWith('src/course/') || p.startsWith('src/forge/sim/')) && /export (?:async )?function /.test(s)).map(([path, s]) => {
    const stem = path.split('/').at(-1).replace(/\.ts$/, '');
    const references = [...tests].filter(([, text]) => text.includes(`/${stem}`)).map(([p]) => p);
    return { path, sha256: createHash('sha256').update(s).digest('hex'), exportedFunctions: [...s.matchAll(/export (?:async )?function (\w+)/g)].map(m => m[1]),
      testsMentioningModule: references, evidenceMeaning: 'A mention is traceability, not proof that every branch or function was exercised.',
      scientificCertification: path === 'src/forge/sim/evaluate.ts' ? 'Independent closed-form mission benchmarks supplied; physical validation absent.' : 'Independent validation of all functions and allowed domains not established.' };
  });
  const hangarRows = missions.map(m => {
    const summarize = d => {
      const e = evaluate(d, materials, processes);
      return { input: d, modelRevision: MODEL_REVISION, inputHash: e.inputHash,
        parts: e.parts, mass_g: e.mass_g, cost_usd: e.cost?.unit ?? null,
        checks: Object.fromEntries(Object.entries(e).filter(([k]) => k.startsWith('pass'))), warnings: e.modelWarnings, assumptions: e.assumptions };
    };
    return { id: m.id, title: m.title, starter: summarize(missionDesign(m)), feasibleRevision: summarize(revisedDesign(m)),
      scientificCertification: 'NOT CERTIFIED for real use. Closed-form verification is limited to the documented classroom idealizations.' };
  });
  let revision = 'unknown';
  try { revision = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(); } catch { /* report unavailable */ }
  const report = { generatedAt: new Date().toISOString(), revision, modelRevision: MODEL_REVISION,
    verdict: 'NOT CERTIFIED', criterion: 'No blanket scientific, pedagogical, airworthiness or safety certification is issued by these checks.',
    counts: { tracks: tracks.length, lessons: lessonRows.length, questions: lessonRows.reduce((n, l) => n + l.questionCount, 0), registeredBenches: benchRows.length, unassignedBenches: benchRows.filter(b => !b.lessons.length).length, helperModules: modelRows.length, missions: hangarRows.length },
    mechanicalFailures: failures, lessons: lessonRows, benches: benchRows, helperModules: modelRows, hangar: hangarRows,
    sourceHashes: Object.fromEntries([...contents].map(([p, text]) => [p, createHash('sha256').update(text).digest('hex')])) };
  await writeFile(`${out}/inventory.json`, JSON.stringify(report, null, 2));
  const lines = ['# Curriculum certification register', '', `Revision: ${revision}`, '', '**Verdict: NOT CERTIFIED.** This is an exhaustive item inventory with mechanical screens, not completed independent scientific validation.', '',
    '| Lesson | Bench | Mechanical screen | Scientific certification |', '|---|---|---|---|'];
  for (const l of lessonRows) lines.push(`| ${l.key} — ${l.title.replaceAll('|', '/')} | ${l.bench} | ${Object.values(l.checks).every(Boolean) ? 'Pass' : 'FAIL'} | Not established |`);
  lines.push('', '## Every registered bench', '', '| Bench | Lessons | Scientific certification |', '|---|---|---|');
  for (const b of benchRows) lines.push(`| ${b.id} | ${b.lessons.join(', ') || 'No current lesson; still in browser audit'} | Not established |`);
  lines.push('', '## Model/helper modules', '', '| Module | Exported functions | Direct test-file mentions |', '|---|---|---|');
  for (const m of modelRows) lines.push(`| ${m.path} | ${m.exportedFunctions.join(', ')} | ${m.testsMentioningModule.length} |`);
  await writeFile(`${out}/register.md`, lines.join('\n') + '\n');
  console.log(JSON.stringify({ ...report.counts, mechanicalFailures: failures, verdict: report.verdict }));
  if (failures.length || process.argv.includes('--require-certification')) process.exitCode = 1;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
