// Every lesson, answer key and registered bench in real React components.
// Uses isolated fixture storage/router only; does not bypass production auth.
import assert from 'node:assert/strict';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createServer, build, preview } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { chromium } from 'playwright';
import { lessons } from '../src/course/catalog.ts';
import { missions } from '../src/forge/content/catalog.ts';
import { registeredBenches, revisedDesign } from './curriculum-audit.mjs';

const root = resolve('.'), built = process.env.ACCEPTANCE_BUILD === '1';
const out = resolve(`artifacts/curriculum-audit/browser${built ? '-built' : ''}`);
const entry = join(root, '__curriculum_audit.tsx'), html = join(root, '__curriculum_audit.html');
const buildDir = resolve('artifacts/curriculum-audit-build');
const checks = [], failures = [], cases = [];
let browser, server;
await mkdir(out, { recursive: true });
function check(key, label, condition) {
  checks.push({ key, label, pass: !!condition });
  assert.ok(condition, `${key}: ${label}`);
}
async function attempt(key, fn, page) {
  const begin = checks.length;
  try { await fn(); cases.push({ key, pass: true, checks: checks.length - begin }); }
  catch (error) {
    const detail = { key, error: String(error.message), checks: checks.length - begin };
    failures.push(detail); cases.push({ ...detail, pass: false });
    console.error(JSON.stringify(detail));
    await page.screenshot({ path: join(out, `${key.replaceAll(/[^a-zA-Z0-9-]/g, '-')}-failure.png`), fullPage: true }).catch(() => {});
  }
}
try {
  await writeFile(html, '<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>Curriculum audit</title></head><body><div id="root"></div><script type="module" src="/__curriculum_audit.tsx"></script></body></html>');
  await writeFile(entry, `import React from 'react';import{createRoot}from'react-dom/client';
import{createRootRoute,createRoute,createRouter,createMemoryHistory,RouterProvider,Outlet}from'@tanstack/react-router';
import{LessonView}from'./src/components/lesson-view';import{Bench}from'./src/components/bench';
import{MissionBench}from'./src/components/forge/bench';import{getLesson}from'./src/course/catalog';
import{ProgressHydrator,useProgress}from'./src/course/progress';import{useForge,toDesign}from'./src/forge/store';
import{missions,missionById,materials,processes}from'./src/forge/content/catalog';
import{evaluate,runAnalysis}from'./src/forge/sim/evaluate';import type{BenchId}from'./src/course/types';import'./src/styles.css';
const params=new URLSearchParams(location.search), mode=params.get('mode')||'lesson', key=params.get('key')||'math/ratios-units';
(window as any).__audit={useProgress,useForge,toDesign,evaluate,runAnalysis,missionById,materials,processes};
if(mode==='mission'){for(const m of missions){useForge.getState().ensure(m.id);}for(const id of ['glider','drone_arm'])useForge.getState().patch(id,{sealedCount:3,bestRubric:80});}
const r=createRootRoute({component:()=> <><ProgressHydrator/><Outlet/></>});
const l=createRoute({getParentRoute:()=>r,path:'/learn/$trackId/$lessonId',component:()=>{const{trackId,lessonId}=l.useParams();const lesson=getLesson(trackId,lessonId);return lesson?<LessonView key={trackId+'/'+lessonId} lesson={lesson}/>:<h1>Missing lesson</h1>}});
const b=createRoute({getParentRoute:()=>r,path:'/audit/bench',component:()=> <main className="mx-auto max-w-3xl p-5" data-audit-bench={key}><Bench id={key as BenchId}/></main>});
const m=createRoute({getParentRoute:()=>r,path:'/mission/$missionId',component:()=> <MissionBench missionId={m.useParams().missionId}/>});
const t=createRoute({getParentRoute:()=>r,path:'/learn/$trackId',component:()=> <h1>Course</h1>});
const j=createRoute({getParentRoute:()=>r,path:'/learn/job',component:()=> <h1>Job</h1>});
const h=createRoute({getParentRoute:()=>r,path:'/',component:()=> <h1>Home</h1>});
const path=mode==='bench'?'/audit/bench':mode==='mission'?'/mission/'+key:'/learn/'+key;
const router=createRouter({routeTree:r.addChildren([l,b,m,t,j,h]),history:createMemoryHistory({initialEntries:[path]})});
createRoot(document.getElementById('root')!).render(<RouterProvider router={router}/>);`);
  const config = { configFile: false, root, cacheDir: 'node_modules/.vite-curriculum-audit', plugins: [react(), tailwindcss()], resolve: { alias: { '@': join(root, 'src') } } };
  if (built) {
    await build({ ...config, build: { outDir: buildDir, emptyOutDir: true, rolldownOptions: { input: html } } });
    server = await preview({ ...config, build: { outDir: buildDir }, preview: { host: '127.0.0.1', port: 8099, strictPort: true } });
  } else {
    server = await createServer({ ...config, server: { host: '127.0.0.1', port: 8099, strictPort: true, hmr: false, watch: { ignored: ['**/artifacts/**', '**/.vercel/**'] } } });
    await server.listen();
  }
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE_PATH, args: ['--no-sandbox', '--enable-unsafe-swiftshader'] });
  const benches = await registeredBenches();
  const url = (mode, key) => `http://127.0.0.1:8099/__curriculum_audit.html?mode=${mode}&key=${encodeURIComponent(key)}`;
  for (const [viewport, width, height] of [['desktop', 1280, 900], ['mobile', 390, 844]]) {
    const ctx = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
    const page = await ctx.newPage(), errors = [];
    page.setDefaultTimeout(7000);
    page.on('pageerror', e => errors.push(e.message));
    for (const lesson of lessons) {
      const key = `${viewport}/lesson/${lesson.track}/${lesson.id}`, errorStart = errors.length;
      await attempt(key, async () => {
        await page.goto(url('lesson', `${lesson.track}/${lesson.id}`));
        await page.getByRole('heading', { name: lesson.title, exact: true }).waitFor();
        check(key, 'reading visible', (await page.locator('article').innerText()).includes(lesson.lede));
        check(key, 'reading stays within viewport', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
        await page.getByRole('tab', { name: /2 Try/ }).click();
        check(key, 'authored task visible', await page.locator('[data-lesson-task]').isVisible());
        check(key, 'authored note visible', await page.locator('[data-lesson-note]').isVisible());
        check(key, 'bench rendered', await page.locator('article').locator('svg, input, textarea, select, canvas, [role="radiogroup"]').count() > 0);
        check(key, 'try has no NaN readout', !/\bNaN\b/.test(await page.locator('article').innerText()));
        await page.getByRole('tab', { name: /3 Check/ }).click();
        for (const q of lesson.checks) {
          const option = page.locator('fieldset').getByRole('button', { name: q.options[q.answer], exact: true });
          await option.focus(); await page.keyboard.press('Enter');
          check(key, `answer ${lesson.checks.indexOf(q) + 1}: authored key grades correctly by keyboard`, await page.getByText('Yes.', { exact: true }).isVisible());
          await page.getByRole('button', { name: lesson.checks.indexOf(q) === lesson.checks.length - 1 ? 'See the result' : 'Next question', exact: true }).click();
        }
        await page.getByText('4 of 4.', { exact: true }).waitFor();
        check(key, 'all four answers saved', await page.evaluate(k => window.__audit.useProgress.getState().completed[k], `${lesson.track}/${lesson.id}`) === 4);
        check(key, 'no uncaught page errors', errors.length === errorStart);
      }, page);
    }
    // Includes 19 legacy/unassigned benches: no simulation disappears from the inventory.
    for (const id of benches) {
      const key = `${viewport}/bench/${id}`, errorStart = errors.length;
      await attempt(key, async () => {
        await page.goto(url('bench', id));
        const main = page.locator('[data-audit-bench]');
        await main.waitFor();
        check(key, 'nonempty bench', (await main.innerText()).trim().length > 30);
        const sliders = main.locator('input[type="range"]');
        const count = await sliders.count();
        for (let i = 0; i < count; i++) {
          const slider = sliders.nth(i), initial = await slider.inputValue();
          for (const button of ['Home', 'End']) {
            await slider.focus(); await page.keyboard.press(button);
            check(key, `slider ${i + 1} ${button}: finite displayed readouts`, !/\bNaN\b/.test(await main.innerText()));
          }
          await slider.fill(initial);
        }
        check(key, 'no horizontal overflow', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
        check(key, 'no uncaught page errors', errors.length === errorStart);
      }, page);
    }
    for (const mission of missions) {
      const key = `${viewport}/hangar/${mission.id}`, errorStart = errors.length;
      await attempt(key, async () => {
        await page.goto(url('mission', mission.id));
        await page.getByText('Iteration 1', { exact: true }).waitFor();
        check(key, 'module brief visible', (await page.locator('main').innerText()).includes(mission.brief.split('\n')[0]));
        if (['water_rocket', 'payload'].includes(mission.id)) check(key, 'correct plate support diagram', await page.locator(`[data-hangar-diagram="${mission.id}"]`).count() === 1);
        const result = await page.evaluate(({ id, revision }) => {
          const a = window.__audit, store = a.useForge.getState(), m = a.missionById(id);
          store.patch(id, { parts: revision.parts, vehicle: revision.vehicle, quantity: revision.quantity });
          const input = a.toDesign(a.useForge.getState().runs[id], m), e = a.evaluate(input, a.materials, a.processes);
          const old = a.runAnalysis('static_stress', input, a.materials, a.processes);
          store.recordAnalysis(id, 'static_stress', old.inputHash);
          store.recordTest(id, 'static_stress', old.inputHash);
          const p = input.parts[0], dim = p.kind === 'tube' ? 'length_mm' : 'span_mm';
          store.setParam(id, p.id, dim, p.params[dim] + 1);
          const invalidated = a.useForge.getState().runs[id];
          const staleRejected = !store.recordAnalysis(id, 'static_stress', old.inputHash) && !store.recordTest(id, 'static_stress', old.inputHash);
          store.patch(id, { parts: revision.parts, vehicle: revision.vehicle });
          store.patch(id, { reflection: 'I changed the section because stiffness governed. Stress and mass must both pass. The model omits the joint and I would measure its displacement before a real design decision.' });
          store.submit(id, true); const firstCount = a.useForge.getState().runs[id].sealedCount;
          store.submit(id, true); const duplicatePrevented = a.useForge.getState().runs[id].sealedCount === firstCount;
          return { allPass: ['validInputs','passStress','passBuckling','passMass','passCost','passDeflection','passDfm','passAero','passStability'].every(k => e[k]), invalidated: !invalidated.testDone && invalidated.analyses.length === 0, staleRejected, duplicatePrevented };
        }, { id: mission.id, revision: revisedDesign(mission) });
        for (const [criterion, pass] of Object.entries(result)) check(key, criterion, pass);
        await page.screenshot({ path: join(out, `${viewport}-${mission.id}.png`), fullPage: true });
        check(key, 'no horizontal overflow', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
        check(key, 'no uncaught browser errors', errors.length === errorStart);
      }, page);
    }
    await ctx.close();
  }
} catch (error) {
  failures.push({ key: 'harness', error: String(error.stack || error) });
} finally {
  await writeFile(join(out, 'results.json'), JSON.stringify({ mode: built ? 'production-components' : 'development-components', checks, cases, failures,
    scope: 'All lessons: reading/task/note/quiz wiring. All registered benches: default rendering and individual slider endpoints. All Hangar modules: visible brief/model diagram, attainable design, stale result rejection and duplicate seal guard.',
    excluded: 'Not an independent review of every scientific claim, every interaction combination, external media availability, assistive-technology certification, authenticated deployment or physical validation.' }, null, 2));
  await browser?.close();
  if (server?.close) await server.close();
  else if (server?.httpServer) await new Promise(resolveClose => server.httpServer.close(resolveClose));
  await Promise.all([rm(entry, { force: true }), rm(html, { force: true })]);
}
console.log(JSON.stringify({ cases: cases.length, checks: checks.length, failures: failures.length, out }));
if (failures.length) process.exitCode = 1;
