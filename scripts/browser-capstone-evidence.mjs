// Real capstone components and progress store in an isolated browser harness.
import assert from 'node:assert/strict';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { createServer, build, preview } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { chromium } from 'playwright';

const root = resolve('.');
const built = process.env.ACCEPTANCE_BUILD === '1';
const out = resolve(`screenshots/capstone-evidence${built ? '-built' : ''}`);
const entry = join(root, '__capstone_evidence.tsx');
const html = join(root, '__capstone_evidence.html');
const buildDir = resolve('artifacts/capstone-evidence-build');
const keys = ['requirement', 'model', 'test', 'mismatch', 'revision'];
const labels = ['Requirement', 'Model', 'Test', 'Mismatch', 'Justified revision'];
const packageKey = 'ff:cappackage-w30';
const checks = [];
const check = (name, condition) => { assert.ok(condition, name); checks.push(name); };
let server, browser;
await mkdir(out, { recursive: true });
try {
  await writeFile(html, '<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>Capstone evidence acceptance</title></head><body><div id="root"></div><script type="module" src="/__capstone_evidence.tsx"></script></body></html>');
  await writeFile(entry, `import React,{useState} from 'react';import{createRoot}from'react-dom/client';
import{CapPackageBench,CapPredictBench}from'./src/components/bench/engineering-w30-labs';
import{ProgressHydrator,useProgress}from'./src/course/progress';import'./src/styles.css';
function App(){const[mode,setMode]=useState('home');const pass=useProgress(s=>s.capstonePass);const ready=useProgress(s=>s.hydrated);
return <main className="mx-auto max-w-3xl p-5"><ProgressHydrator/><p data-ready={ready} data-complete={pass}>{pass?'Package complete':'Package incomplete'}</p>
<button onClick={()=>setMode('package')}>Open package</button><button onClick={()=>setMode('home')}>Home</button><button onClick={()=>setMode('predict')}>Open predictions</button>
{mode==='package'?<CapPackageBench/>:mode==='predict'?<CapPredictBench/>:null}</main>}
createRoot(document.getElementById('root')!).render(<App/>);`);
  const config = {
    configFile: false, root, cacheDir: 'node_modules/.vite-capstone-evidence',
    plugins: [react(), tailwindcss()], resolve: { alias: { '@': join(root, 'src') } },
  };
  if (built) {
    await build({ ...config, build: { outDir: buildDir, emptyOutDir: true, rolldownOptions: { input: html } } });
    server = await preview({ ...config, build: { outDir: buildDir }, preview: { host: '127.0.0.1', port: 8097, strictPort: true } });
  } else {
    server = await createServer({ ...config, server: { host: '127.0.0.1', port: 8097, strictPort: true, hmr: false } });
    await server.listen();
  }
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE_PATH, args: ['--no-sandbox'] });
  const url = 'http://127.0.0.1:8097/__capstone_evidence.html';
  for (const [viewport, width, height] of [['desktop', 1280, 900], ['mobile', 390, 844]]) {
    const ctx = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(url);
    await page.locator('[data-ready="true"]').waitFor();
    await page.evaluate(({ packageKey, keys }) => {
      localStorage.setItem('axiom-progress', JSON.stringify({ state: {
        completed: { 'physics/measure': 3 }, placement: { algebra: 4 }, practical: { 'physics/measure': true }, capstonePass: true,
      }, version: 0 }));
      localStorage.setItem(packageKey, JSON.stringify({ text: Object.fromEntries(keys.map(k=>[k,''])), scores: Object.fromEntries(keys.map(k=>[k,2])) }));
    }, { packageKey, keys });
    await page.reload();
    await page.locator('[data-ready="true"][data-complete="false"]').waitFor();
    check(`${viewport}: stale completion rejected before opening bench`, true);
    await page.getByRole('button', { name: 'Open package', exact: true }).click();
    await page.getByLabel('Requirement text', { exact: true }).waitFor();
    for (const label of labels) {
      check(`${viewport}: blank ${label} cannot be scored`, await page.getByRole('radiogroup', { name: `${label} self-score`, exact: true }).getByRole('radio', { name: '2 · strong', exact: true }).isDisabled());
    }
    check(`${viewport}: blank legacy package gate closed`, await page.locator('[data-capstone-package-gate="closed"]').count() === 1);
    for (const [i, label] of labels.entries()) {
      await page.getByLabel(`${label} text`, { exact: true }).fill(`Written ${keys[i]} evidence with a stated assumption.`);
      const radio = page.getByRole('radiogroup', { name: `${label} self-score`, exact: true }).getByRole('radio', { name: i < 2 ? '2 · strong' : '1 · weak', exact: true });
      await radio.focus();
      await page.keyboard.press('Space');
    }
    await page.locator('[data-capstone-package-gate="open"]').waitFor();
    await page.locator('[data-complete="true"]').waitFor();
    check(`${viewport}: written evidence plus 7/10 opens gate by keyboard`, true);
    await page.screenshot({ path: join(out, `${viewport}-complete.png`), fullPage: true });
    const original = await page.evaluate(key => localStorage.getItem(key), packageKey);
    page.once('dialog', dialog => dialog.dismiss());
    await page.getByRole('button', { name: 'Start a fresh package', exact: true }).click();
    check(`${viewport}: cancelled reset preserves package`, await page.evaluate(key => localStorage.getItem(key), packageKey) === original);
    await page.reload();
    await page.locator('[data-ready="true"][data-complete="true"]').waitFor();
    check(`${viewport}: completion derived from saved evidence before bench mount`, true);
    const savedProgress = await page.evaluate(() => JSON.parse(localStorage.getItem('axiom-progress')).state);
    check(`${viewport}: quiz score preserved`, savedProgress.completed['physics/measure'] === 3);
    check(`${viewport}: placement preserved`, savedProgress.placement.algebra === 4);
    check(`${viewport}: practical flag preserved`, savedProgress.practical['physics/measure'] === true);
    check(`${viewport}: completion boolean not persisted as authority`, !Object.hasOwn(savedProgress, 'capstonePass'));
    await page.getByRole('button', { name: 'Open package', exact: true }).click();
    await page.getByLabel('Requirement text', { exact: true }).waitFor();
    check(`${viewport}: mount does not erase saved evidence`, await page.evaluate(key => localStorage.getItem(key), packageKey) === original);
    await page.getByLabel('Test text', { exact: true }).fill('Changed test evidence');
    await page.locator('[data-complete="false"]').waitFor();
    check(`${viewport}: editing requires fresh self-score`, await page.getByRole('radiogroup', { name: 'Test self-score', exact: true }).getByRole('radio', { name: '0 · absent / reassess', exact: true }).getAttribute('aria-checked') === 'true');
    await page.getByRole('radiogroup', { name: 'Test self-score', exact: true }).getByRole('radio', { name: '1 · weak', exact: true }).click();
    await page.locator('[data-complete="true"]').waitFor();
    await page.getByLabel('Justified revision text', { exact: true }).fill(' \n ');
    await page.locator('[data-complete="false"]').waitFor();
    await page.reload();
    await page.locator('[data-ready="true"][data-complete="false"]').waitFor();
    check(`${viewport}: cleared evidence stays incomplete after reload`, true);
    await page.getByRole('button', { name: 'Open package', exact: true }).click();
    await page.getByLabel('Requirement text', { exact: true }).waitFor();
    page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Start a fresh package', exact: true }).click();
    await page.waitForFunction(key => Object.values(JSON.parse(localStorage.getItem(key)).text).every(text => text === ''), packageKey);
    check(`${viewport}: confirmed reset clears written sections`, true);
    await page.getByRole('button', { name: 'Open predictions', exact: true }).click();
    await page.getByLabel('Predicted aluminum tip deflection in mm').fill('0.46');
    await page.getByLabel('Predicted balsa tip deflection in mm').fill('11');
    await page.getByRole('radiogroup', { name: 'Binding constraint' }).getByRole('radio', { name: 'stiffness', exact: true }).click();
    await page.getByRole('button', { name: 'Lock predictions', exact: true }).click();
    check(`${viewport}: correct binding prediction has a tick`, /stiffness ✓/.test(await page.locator('main').innerText()));
    check(`${viewport}: uncertainty limitation is visible`, (await page.locator('main').innerText()).includes('does not establish statistical significance'));
    check(`${viewport}: no horizontal overflow`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    check(`${viewport}: no uncaught browser errors`, errors.length === 0);
    await ctx.close();
  }
  await writeFile(join(out, 'results.json'), JSON.stringify({ mode: built ? 'production-component' : 'development-component', checks }, null, 2));
  console.log(`Capstone evidence acceptance: ${checks.length} assertions passed (${built ? 'production' : 'development'} components).`);
} finally {
  await browser?.close();
  if (server?.close) await server.close();
  else if (server?.httpServer) await new Promise(resolve => server.httpServer.close(resolve));
  await Promise.all([rm(entry, { force: true }), rm(html, { force: true })]);
}
