// Focused component/browser acceptance; does not bypass or change app authentication.
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm, mkdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { chromium } from 'playwright';

const root = resolve('.');
const out = process.env.ACCEPTANCE_OUT || join(await mkdtemp(join(tmpdir(), 'density-acceptance-')), 'results');
await mkdir(out, { recursive: true });
const entry = join(root, '__density_acceptance.tsx');
const html = join(root, '__density_acceptance.html');
const results = [];
let server, browser, activePage;
const record = (name, condition) => { assert.ok(condition, name); results.push(name); };
try {
  await writeFile(html, '<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>Density component acceptance</title></head><body><div id="root"></div><script type="module" src="/__density_acceptance.tsx"></script></body></html>');
  await writeFile(entry, `import React from 'react';
    import {createRoot} from 'react-dom/client';
    import {mathFigures} from './src/components/figures/math';
    import {mathLessons} from './src/course/math';
    import {ConceptHelp} from './src/components/concept-help';
    import {LessonAnimation} from './src/components/lesson-animation';
    import './src/styles.css';
    const Figure=mathFigures['math/powers'];
    const lesson=mathLessons.find(l=>l.id==='powers');
    createRoot(document.getElementById('root')!).render(<main style={{maxWidth:760,padding:20,margin:'auto'}}><h1>Density comes from the material table</h1><Figure/><section><h2>Worked example</h2><p>{lesson!.example.split(' || ')[0]}</p><ConceptHelp help={lesson!.exampleHelp!}/></section><LessonAnimation id="01-equality-balance"/></main>);`);
  server = await createServer({ configFile: false, root, plugins: [react(), tailwindcss()], resolve: { alias: { '@': join(root, 'src') } }, server: { host: '127.0.0.1', port: 8093, strictPort: true } });
  await server.listen();
  browser = await chromium.launch({ headless: true });
  for (const [label, width, height, reduced] of [['desktop', 1280, 900, 'no-preference'], ['mobile', 390, 844, 'reduce']]) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: reduced });
    const page = activePage = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('http://127.0.0.1:8093/__density_acceptance.html');
    const trigger = page.getByRole('button', { name: 'Where did 2700 come from?', exact: true }).first();
    await trigger.waitFor();
    record(label + ' has help in figure and worked example', await page.getByRole('button', { name: 'Where did 2700 come from?', exact: true }).count() === 2);
    await trigger.focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', { name: 'Density is a looked-up material property', exact: true });
    await dialog.waitFor();
    record(label + ' explains input provenance', (await dialog.textContent()).includes('not an answer hidden in the geometry'));
    const rect = await dialog.boundingBox();
    record(label + ' help stays inside viewport', rect.x >= 0 && rect.y >= 0 && rect.x + rect.width <= width + 1 && rect.y + rect.height <= height + 1);
    record(label + ' has explicit source links', await dialog.getByRole('link').count() === 3);
    await page.screenshot({ path: join(out, label + '-help.png') });
    await dialog.evaluate(el => { el.scrollTop = el.scrollHeight; });
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'hidden' });
    record(label + ' Escape closes popup', await dialog.count() === 0);
    // Radix restores focus after the portal unmounts; do not force focus in the test.
    await page.waitForFunction(el => el === document.activeElement, await trigger.elementHandle(), { timeout: 3000 });
    record(label + ' focus returns to the original trigger', await trigger.evaluate(el => el === document.activeElement));
    if (reduced === 'reduce') {
      // The existing figure deliberately hides motion controls and shows its final still.
      record(label + ' reduced motion has no step controls', await page.getByRole('group', { name: 'Steps', exact: true }).count() === 0);
      record(label + ' reduced motion has no scrubber', await page.getByRole('slider', { name: 'Scrub', exact: true }).count() === 0);
    } else {
      record(label + ' density step is available', await page.getByRole('button', { name: /Density \(given\)/ }).count() === 1);
      const scrub = page.getByRole('slider', { name: 'Scrub', exact: true });
      await scrub.focus();
      await page.keyboard.press('End');
    }
    const bounds = await page.locator('svg text').evaluateAll(els => els.filter(e => /ρ\(aluminum\)|Given · typical|m = ρV/.test(e.textContent)).map(e => {
      const b = e.getBBox(), v = e.ownerSVGElement.viewBox.baseVal;
      let opacity = 1;
      for (let node = e; node && node instanceof SVGElement; node = node.parentElement) opacity *= Number(getComputedStyle(node).opacity);
      return { text: e.textContent, x: b.x, y: b.y, right: b.x + b.width, bottom: b.y + b.height, w: v.width, h: v.height, opacity };
    }));
    record(label + ' all three density labels are visible in the final frame', bounds.length === 3 && bounds.every(b => b.opacity > 0.95));
    record(label + ' SVG density labels fit viewBox', bounds.every(b => b.x >= 0 && b.y >= 0 && b.right <= b.w && b.bottom <= b.h));
    record(label + ' no initial video autoplay', await page.locator('video').count() === 0);
    await page.getByRole('button', { name: 'Play animation', exact: true }).click();
    const video = page.locator('video');
    await video.waitFor();
    await video.evaluate(v => v.play());
    await page.waitForFunction(() => document.querySelector('video')?.currentTime > 0.15);
    record(label + ' opted-in MP4 plays with native controls', await video.evaluate(v => v.controls && v.muted && !v.paused));
    await page.getByRole('button', { name: 'Show still image', exact: true }).click();
    await video.waitFor({ state: 'detached' });
    record(label + ' still mode removes video', await page.locator('video').count() === 0);
    record(label + ' no horizontal overflow', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({ path: join(out, label + '.png'), fullPage: true });
    record(label + ' no runtime errors', errors.length === 0);
    await context.close();
    activePage = undefined;
  }
  const page = activePage = await browser.newPage();
  await page.goto('http://127.0.0.1:8093/learn-media/index.html');
  record('gallery has twelve clips', await page.locator('video').count() === 12);
  for (let i = 0; i < 12; i++) {
    const video = page.locator('video').nth(i);
    await video.scrollIntoViewIfNeeded();
    await video.evaluate(v => v.play());
    await page.waitForFunction(i => document.querySelectorAll('video')[i].currentTime > 0.1, i);
    record('gallery clip ' + (i + 1) + ' plays', await video.evaluate(v => v.readyState >= 2 && !v.error));
    await video.evaluate(v => v.pause());
  }
  const manifest = JSON.parse(await readFile('tools/lesson-animations/manifest.json', 'utf8'));
  record('manifest has twelve unique IDs', manifest.length === 12 && new Set(manifest.map(a => a.id)).size === 12);
  await writeFile(join(out, 'browser-results.json'), JSON.stringify({ passed: results.length, checks: results }, null, 2));
  console.log(JSON.stringify({ passed: results.length, checks: results }, null, 2));
} catch (error) {
  await writeFile(join(out, 'failure.json'), JSON.stringify({ passed: results.length, checks: results, error: String(error), stack: error.stack }, null, 2));
  if (activePage && !activePage.isClosed()) await activePage.screenshot({ path: join(out, 'failure.png'), fullPage: true }).catch(() => {});
  throw error;
} finally {
  await browser?.close();
  await server?.close();
  await Promise.all([rm(entry, { force: true }), rm(html, { force: true })]);
}
