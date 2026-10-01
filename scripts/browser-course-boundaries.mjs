// Real-app checks in fresh browser contexts; no learner's saved progress is used.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {chromium} from 'playwright';
const base=process.env.ACCEPTANCE_URL||'http://127.0.0.1:8092';
const out=resolve(process.env.ACCEPTANCE_OUT||'screenshots/course-boundaries');
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,args:['--no-sandbox']});
const checks=[];let page;
try{
 for(const [label,width,height]of[['desktop',1280,900],['mobile',390,844]]){
  const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
  page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`${base}/mission/glider`);
  const worked=page.locator('details').filter({has:page.locator('summary',{hasText:'Default glider: mass and stability calculations'})});
  await worked.waitFor();
  const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('forge-flight-v1')).state.runs.glider);
  await worked.locator('summary').click();
  assert.match(await worked.innerText(),/42.3 g/);assert.match(await worked.innerText(),/144–161 mm/);
  const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('forge-flight-v1')).state.runs.glider);
  assert.deepEqual(after,before);checks.push(`${label}: reading the default calculation leaves the design and Ledger unchanged`);
  const constraints=page.getByRole('heading',{name:'Constraints',exact:true}).locator('..');
  assert.equal(await constraints.locator('li').count(),6);assert.match(await constraints.innerText(),/Static margin\s+0.51/);
  checks.push(`${label}: constraints include the failing default margin`);
  await worked.scrollIntoViewIfNeeded();await page.screenshot({path:join(out,`${label}-brief.png`)});
  await page.getByRole('button',{name:'Accept brief',exact:true}).click();
  await page.getByText('The nose is heavy.',{exact:false}).first().waitFor();
  const cg=page.getByRole('slider',{name:/CG from nose/});await cg.fill('150');
  await page.getByText('The CG is ahead of the neutral point within the target static-margin band.',{exact:true}).waitFor();
  assert.match(await constraints.innerText(),/Static margin\s+0.18/);
  checks.push(`${label}: moving CG aft to 150 mm reaches the target band`);
  await cg.fill('165');await page.getByText('The CG is only slightly ahead of the neutral point.',{exact:false}).waitFor();
  await cg.fill('170');await page.getByText('The CG is behind the neutral point.',{exact:false}).waitFor();
  checks.push(`${label}: weak and negative margins have the correct descriptions`);
  await cg.fill('120');await page.getByText('The nose is heavy.',{exact:false}).first().waitFor();
  await page.getByText('Predict which number will move before changing a slider',{exact:false}).scrollIntoViewIfNeeded();
  await page.screenshot({path:join(out,`${label}-design.png`)});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.goto(`${base}/learn/job`);
  await page.getByText('If no thickness works for a material, the screens have eliminated it.',{exact:false}).waitFor();
  assert.equal(await page.getByRole('link',{name:/Next section: Manufacturing/}).getAttribute('href'),'/learn/manufacturing');
  checks.push(`${label}: shelf explains elimination and offers the next section`);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  assert.deepEqual(errors,[]);await context.close();
 }
 await writeFile(join(out,'results.json'),JSON.stringify({passed:true,base,checks},null,2));console.log(JSON.stringify({passed:true,base,checks:checks.length}));
}catch(error){await page?.screenshot({path:join(out,'failure.png')}).catch(()=>{});throw error;}
finally{await browser.close();}
