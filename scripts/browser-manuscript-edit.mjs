// Desktop acceptance for the manuscript edit using actual lesson and Hangar
// components. Only routing and starting storage are fixtures; workers are real.
import assert from 'node:assert/strict';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createServer, build, preview } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { chromium } from 'playwright';
import { revisedDesign } from './curriculum-audit.mjs';
import { missionById } from '../src/forge/content/catalog.ts';

const root = resolve('.'), built = process.env.ACCEPTANCE_BUILD === '1';
const out = resolve(`artifacts/manuscript-edit/${built ? 'production' : 'development'}`);
const entry = join(root, '__manuscript_edit.tsx'), html = join(root, '__manuscript_edit.html');
const buildDir = resolve('artifacts/manuscript-edit-build');
const cases = [], checks = [], failures = [];
let browser, server;
await mkdir(out, { recursive: true });
function check(key, message, condition) {
  checks.push({ key, message, pass: Boolean(condition) });
  assert.ok(condition, `${key}: ${message}`);
}
async function attempt(key, action) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  const page = await context.newPage(), errors = [];
  page.setDefaultTimeout(15000);
  page.on('pageerror', error => errors.push(error.message));
  const before = checks.length;
  try {
    await action(page, (label, value) => check(key, label, value));
    check(key, 'no uncaught browser errors', errors.length === 0);
    check(key, 'no horizontal overflow', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    cases.push({ key, pass: true, checks: checks.length - before });
  } catch (error) {
    const detail = { key, error: String(error.stack || error), errors, pageText: await page.locator('body').innerText().catch(() => '') };
    failures.push(detail); cases.push({ key, pass: false, checks: checks.length - before });
    await page.screenshot({ path: join(out, `${key}-failure.png`), fullPage: true }).catch(() => {});
    console.error(JSON.stringify(detail));
  } finally { await context.close(); }
}
const url = (mode, key) => `http://127.0.0.1:8098/__manuscript_edit.html?mode=${mode}&key=${key}`;
async function setupMission(page, id, phase, revision) {
  await page.goto(url('mission', id));
  await page.getByText('Iteration 1', { exact: true }).waitFor();
  await page.evaluate(({ id, phase, revision }) => {
    const store = window.__editor.useForge.getState();
    if (revision) store.patch(id, { parts: revision.parts, vehicle: revision.vehicle, quantity: revision.quantity });
    store.patch(id, { phase, maxReached: 6, everSealed: true, testDone: false });
  }, { id, phase, revision });
}
async function virtualTest(page) {
  await page.getByRole('button', { name: 'Run the virtual test', exact: true }).click();
  await page.locator('[data-virtual-result]').waitFor();
  return page.locator('[data-virtual-result]').innerText();
}
try {
  await writeFile(html, '<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>Manuscript acceptance</title></head><body><div id="root"></div><script type="module" src="/__manuscript_edit.tsx"></script></body></html>');
  await writeFile(entry, `import React from 'react';import{createRoot}from'react-dom/client';
import{createRootRoute,createRoute,createRouter,createMemoryHistory,RouterProvider,Outlet}from'@tanstack/react-router';
import{LessonView}from'./src/components/lesson-view';import{Bench}from'./src/components/bench';
import{MissionBench}from'./src/components/forge/bench';import{getLesson}from'./src/course/catalog';
import{ProgressHydrator}from'./src/course/progress';import{useForge}from'./src/forge/store';
import{missions}from'./src/forge/content/catalog';import'./src/styles.css';
const params=new URLSearchParams(location.search),mode=params.get('mode'),key=params.get('key')||'curveread';
(window as any).__editor={useForge};
if(mode==='mission'){for(const m of missions){useForge.getState().ensure(m.id);useForge.getState().patch(m.id,{sealedCount:3,bestRubric:80});}}
const r=createRootRoute({component:()=> <><ProgressHydrator/><Outlet/></>});
const l=createRoute({getParentRoute:()=>r,path:'/learn/$trackId/$lessonId',component:()=>{const {trackId,lessonId}=l.useParams();return <LessonView lesson={getLesson(trackId,lessonId)!}/>} });
const b=createRoute({getParentRoute:()=>r,path:'/bench',component:()=> <main className="mx-auto max-w-3xl p-5"><Bench id="curveread"/></main>});
const m=createRoute({getParentRoute:()=>r,path:'/mission/$missionId',component:()=> <MissionBench missionId={m.useParams().missionId}/>});
const t=createRoute({getParentRoute:()=>r,path:'/learn/$trackId',component:()=> <h1>Course</h1>});
const j=createRoute({getParentRoute:()=>r,path:'/learn/job',component:()=> <h1>Job</h1>});
const h=createRoute({getParentRoute:()=>r,path:'/',component:()=> <h1>Home</h1>});
const path=mode==='mission'?'/mission/'+key:mode==='lesson'?'/learn/materials/readcurve':'/bench';
const router=createRouter({routeTree:r.addChildren([l,b,m,t,j,h]),history:createMemoryHistory({initialEntries:[path]})});
createRoot(document.getElementById('root')!).render(<RouterProvider router={router}/>);`);
  const config = { configFile: false, root, cacheDir: 'node_modules/.vite-manuscript-edit', plugins: [react(), tailwindcss()], resolve: { alias: { '@': join(root, 'src') } } };
  if (built) {
    await build({ ...config, build: { outDir: buildDir, emptyOutDir: true, rolldownOptions: { input: html } } });
    server = await preview({ ...config, build: { outDir: buildDir }, preview: { host: '127.0.0.1', port: 8098, strictPort: true } });
  } else {
    server = await createServer({ ...config, server: { host: '127.0.0.1', port: 8098, strictPort: true, hmr: false, watch: { ignored: ['**/artifacts/**', '**/.vercel/**'] } } });
    await server.listen();
  }
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE_PATH, args: ['--no-sandbox', '--enable-unsafe-swiftshader'] });
  await attempt('visible-data-practical', async (page, ok) => {
    await page.goto(url('bench', 'curveread'));
    const submit = () => page.getByRole('button', { name: 'Check against the extraction', exact: true });
    await submit().waitFor();
    ok('blank estimates cannot be submitted', await submit().isDisabled());
    for (let round = 0; round < 5; round++) {
      await page.getByText(`Specimen ${round + 1} of 5 — an unidentified engineering material`, { exact: true }).waitFor();
      const plots = page.locator('[data-curve-reading]');
      ok(`specimen ${round + 1}: two labeled plots with numeric ticks`, await plots.locator('svg').count() === 2 && await plots.locator('[data-strain-tick]').count() === 10 && await plots.locator('[data-stress-tick]').count() === 10);
      const guide = page.getByRole('checkbox', { name: 'Show 0.2% offset guide', exact: true });
      ok('a new specimen starts without the offset guide', !(await guide.isChecked()));
      await guide.focus(); await page.keyboard.press('Space');
      ok('offset guide responds to keyboard', await plots.locator('[data-offset-guide]').count() === 1);
      const cursor = page.getByRole('slider', { name: /Curve sample cursor/ });
      await cursor.focus(); await page.keyboard.press('End');
      ok('cursor reaches last sample by keyboard', (await plots.locator('[data-curve-cursor]').innerText()).includes('Sample 200 of 200'));
      await page.keyboard.press('Home'); await page.keyboard.press('ArrowRight');
      ok('cursor returns and steps by keyboard', (await plots.locator('[data-curve-cursor]').innerText()).includes('Sample 2 of 200'));
      await page.getByText('View curve data', { exact: true }).click();
      const rows = await plots.locator('tbody tr').evaluateAll(nodes => nodes.map(n => {
        const cells = [...n.querySelectorAll('td')].map(c => Number(c.textContent));
        return { strain: cells[0], stress: cells[2] };
      }));
      ok('all 200 scored samples are available as visible data', rows.length === 200 && rows.every(r => Number.isFinite(r.strain) && Number.isFinite(r.stress)));
      // Independent classroom calculation from the displayed, rounded table:
      // initial through-origin slope (first five nonzero samples), shifted-line
      // crossing by linear interpolation, peak stress, final strain. No import
      // of the application's extraction function or hidden specimen parameters.
      const initial = rows.slice(1, 6);
      const E = initial.reduce((s, p) => s + p.strain * p.stress, 0) / initial.reduce((s, p) => s + p.strain ** 2, 0);
      let proof;
      for (let i = 1; i < rows.length; i++) {
        const a = rows[i - 1], b = rows[i];
        const fa = a.stress - E * (a.strain - .002), fb = b.stress - E * (b.strain - .002);
        if (fa >= 0 && fb <= 0) { proof = a.stress + (b.stress - a.stress) * fa / (fa - fb); break; }
      }
      const values = [E / 1000, proof, Math.max(...rows.map(p => p.stress)), rows.at(-1).strain * 100];
      ok('the displayed data support all four estimates', values.every(Number.isFinite));
      await page.getByText('View curve data', { exact: true }).click();
      if (round === 0) {
        await plots.screenshot({ path: join(out, 'curve-reading-figure.png') });
        for (const field of ['E', 'sy', 'uts', 'el']) await page.locator(`#curveread-${field}`).fill('0');
        await submit().click();
        ok('incorrect feedback invites checking rather than blaming the learner', await page.getByText(/outside this exercise’s tolerance; check units/).count() === 4);
      }
      for (const [i, field] of ['E', 'sy', 'uts', 'el'].entries()) await page.locator(`#curveread-${field}`).fill(String(values[i]));
      ok('editing removes old feedback', await page.getByText(/^[✓✗] extraction:/).count() === 0);
      await submit().focus(); await page.keyboard.press('Enter');
      ok(`specimen ${round + 1}: all estimates from visible data accepted`, await page.getByText(/✓ extraction:/).count() === 4);
      await page.getByRole('button', { name: round === 4 ? 'See the tally' : 'Next specimen', exact: true }).click();
    }
    await page.getByText('20 of 20', { exact: true }).waitFor();
    ok('completion does not assert professional competence', !(await page.locator('body').innerText()).includes('like a lab tech'));
    await page.getByRole('button', { name: 'Run the practical again', exact: true }).click();
    ok('restart clears all four estimates', (await page.getByRole('spinbutton').evaluateAll(ns => ns.map(n => n.value))).every(v => v === ''));
  });
  await attempt('lesson-copy-and-figure', async (page, ok) => {
    await page.goto(url('lesson', 'readcurve'));
    const article = page.locator('article'); await article.waitFor();
    ok('missing yield datum stays explicit in the lesson', (await article.innerText()).includes('No offset-intersection force is provided'));
    ok('symbols and original dimensions are introduced', (await article.innerText()).includes('original gauge length'));
    const schematic = article.locator('figure').first();
    ok('schematic labels the unconfirmed stress as departure, not offset yield', (await schematic.innerText()).includes('departure ≈ 350 MPa') && (await schematic.innerText()).includes('does not establish offset yield'));
    await schematic.screenshot({ path: join(out, 'lesson-reading-schematic.png') });
    await page.getByRole('tab', { name: /2 Try/ }).click();
    await page.locator('[data-curve-reading]').waitFor();
    ok('the lesson embeds the new full and initial-region plots', await page.locator('[data-curve-reading] svg').count() === 2);
    ok('lesson task uses simulated provenance', (await page.locator('[data-lesson-note]').innerText()).includes('not physical specimens'));
    await page.locator('[data-curve-reading]').screenshot({ path: join(out, 'lesson-curve-figure.png') });
  });
  await attempt('insufficient-lift-result', async (page, ok) => {
    await setupMission(page, 'glider', 'test');
    await page.evaluate(() => window.__editor.useForge.getState().setVehicle('glider', { cg_fromNose_mm: 150, speed_ms: 4, alpha_deg: 0 }));
    ok('validation limitation is visible before testing', await page.locator('[data-virtual-test-limit]').isVisible());
    const text = await virtualTest(page);
    ok('failed lift is not an all-passing summary', text.includes('Lift requirement not met') && !text.includes('All required classroom checks are met'));
    ok('actual force comparison is shown', text.includes('0.132 N') && text.includes('0.415 N'));
    ok('validation limitation remains after a result', await page.locator('[data-virtual-test-limit]').isVisible());
    await page.locator('[data-virtual-result]').screenshot({ path: join(out, 'insufficient-lift-result.png') });
  });
  await attempt('payload-strength-margin-result', async (page, ok) => {
    await setupMission(page, 'payload', 'test');
    const text = await virtualTest(page);
    ok('payload names margin shortfall not yielding', text.includes('required strength margin not met') && text.includes('not an observed yield event'));
    ok('actual stress, allowable and factor shown', text.includes('18.75 MPa') && text.includes('30.00 MPa') && text.includes('1.60'));
    ok('out-of-domain deflection explained', text.includes('out-of-domain warning, not a physical deflection prediction') && text.includes('10% of the modeled span'));
    await page.locator('[data-virtual-result]').screenshot({ path: join(out, 'payload-result.png') });
  });
  await attempt('passing-virtual-result', async (page, ok) => {
    await setupMission(page, 'water_rocket', 'test', revisedDesign(missionById('water_rocket')));
    const text = await virtualTest(page);
    ok('genuinely passing design receives bounded success', text.includes('All required classroom checks are met for these inputs.'));
    ok('success still states this is not independent validation', (await page.locator('[data-virtual-test-limit]').innerText()).includes('not a physical measurement or independent validation'));
  });
  await attempt('manufacturing-and-unlock-copy', async (page, ok) => {
    await setupMission(page, 'water_rocket', 'make');
    await page.evaluate(() => window.__editor.useForge.getState().setParam('water_rocket', 'fin', 'thickness_mm', 1.2));
    await page.getByText(/Minimum-wall check passed/).waitFor();
    let text = await page.locator('main').innerText();
    ok('at-limit wall passes without a failure-specific explanation', text.includes('Minimum-wall check passed') && !text.includes('Passes: Wall is under'));
    ok('cost arithmetic has unambiguous parentheses', text.includes('(Setup + tooling) / quantity'));
    ok('override explicitly remains virtual', text.includes('Continue the virtual exercise'));
    await page.evaluate(() => window.__editor.useForge.getState().setParam('water_rocket', 'fin', 'thickness_mm', 1));
    await page.getByText(/Minimum-wall check not met/).waitFor();
    ok('below-limit wall has an outcome-specific explanation', (await page.locator('main').innerText()).includes('Minimum-wall check not met'));
    await page.getByRole('button', { name: 'Review', exact: true }).click();
    await page.getByRole('textbox').fill('I changed thickness because the span and stress indicated a stiffness shortfall. I would check the attachment separately.');
    await page.getByRole('button', { name: 'Seal this iteration', exact: true }).click();
    text = await page.locator('main').innerText();
    ok('unlock copy requires a best score, not three high-scoring attempts', text.includes('best reflection score of at least 70%') && !text.includes('Three at 70 or better'));
    ok('dimensions are model inputs, not claimed measurements', text.includes('Model length') && !text.includes('Measured length'));
  });
} catch (error) { failures.push({ key: 'harness', error: String(error.stack || error) }); }
finally {
  if (cases.length !== 6) failures.push({ key: 'coverage', error: `Expected 6 cases; received ${cases.length}` });
  await writeFile(join(out, 'results.json'), JSON.stringify({ mode: built ? 'production-components' : 'development-components', browser: browser?.version(), cases, checks, failures,
    scope: 'Desktop real-component acceptance; curve estimates independently calculated from visible rounded sample data. Real virtual-test workers. Not physical model validation or an authenticated deployment test.' }, null, 2));
  await browser?.close();
  if (server?.close) await server.close();
  else if (server?.httpServer) await new Promise(done => server.httpServer.close(done));
  await Promise.all([rm(entry, { force: true }), rm(html, { force: true })]);
}
console.log(JSON.stringify({ cases: cases.length, checks: checks.length, failures: failures.length, out }));
if (failures.length) process.exitCode = 1;
