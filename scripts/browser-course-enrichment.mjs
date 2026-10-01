// Real LessonView in an isolated router/storage harness; never production auth.
import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {createServer,build,preview} from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import {chromium} from 'playwright';
const scope=process.env.ACCEPTANCE_SCOPE;
const root=resolve('.'),built=process.env.ACCEPTANCE_BUILD==='1';
const out=resolve(process.env.ACCEPTANCE_OUT||`screenshots/course-enrichment${built?'-built':''}`);
const entry=join(root,'__enrichment_acceptance.tsx'),html=join(root,'__enrichment_acceptance.html');
const buildDir=resolve('artifacts/enrichment-acceptance-build');
const manifest=JSON.parse(await readFile('docs/course-enrichment-coverage.json','utf8'));
const checks=[],record=(name,condition)=>{assert.ok(condition,name);checks.push(name);};
let server,browser,activePage;
await mkdir(out,{recursive:true});
try{
 await writeFile(html,'<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>Course enrichment acceptance</title></head><body><div id="root"></div><script type="module" src="/__enrichment_acceptance.tsx"></script></body></html>');
 await writeFile(entry,`import React from 'react';import{createRoot}from'react-dom/client';
import{createRootRoute,createRoute,createRouter,createMemoryHistory,RouterProvider,Outlet}from'@tanstack/react-router';
import{LessonView}from'./src/components/lesson-view';import{getLesson}from'./src/course/catalog';import{ProgressHydrator}from'./src/course/progress';import'./src/styles.css';
const r=createRootRoute({component:()=> <><ProgressHydrator/><Outlet/></>});
const l=createRoute({getParentRoute:()=>r,path:'/learn/$trackId/$lessonId',component:()=>{const{trackId,lessonId}=l.useParams();const lesson=getLesson(trackId,lessonId);if(lesson){(window as any).__acceptanceTaskExpected=Boolean((lesson.prompt||'').trim()||(lesson.note||'').trim());(window as any).__acceptanceNoteExpected=Boolean((lesson.note||'').trim());}return lesson?<LessonView key={trackId+'/'+lessonId} lesson={lesson}/>:<h1>Missing lesson</h1>}});
const t=createRoute({getParentRoute:()=>r,path:'/learn/$trackId',component:()=> <h1>Course index</h1>});
const m=createRoute({getParentRoute:()=>r,path:'/mission/$missionId',component:()=> <h1>Mission</h1>});
const j=createRoute({getParentRoute:()=>r,path:'/learn/job',component:()=> <h1>Shelf job</h1>});
const key=new URLSearchParams(location.search).get('lesson')||'materials/bondzoo';
const router=createRouter({routeTree:r.addChildren([l,t,m,j]),history:createMemoryHistory({initialEntries:['/learn/'+key]})});
createRoot(document.getElementById('root')!).render(<RouterProvider router={router}/>);`);
 const config={configFile:false,root,cacheDir:'node_modules/.vite-enrichment-acceptance',plugins:[react(),tailwindcss()],resolve:{alias:{'@':join(root,'src')}}};
 if(built){await build({...config,build:{outDir:buildDir,emptyOutDir:true,rolldownOptions:{input:html}}});server=await preview({...config,build:{outDir:buildDir},preview:{host:'127.0.0.1',port:8096,strictPort:true}});}
 else{server=await createServer({...config,server:{host:'127.0.0.1',port:8096,strictPort:true,hmr:false,watch:{ignored:['**/.vercel/**','**/artifacts/**']}}});await server.listen();}
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,args:['--no-sandbox']});
 for(const[label,width,height,motion]of[['desktop',1280,900,'no-preference'],['mobile',390,844,'reduce']]){
  const ctx=await browser.newContext({viewport:{width,height},reducedMotion:motion});
  await ctx.addInitScript(()=>{if(!localStorage.getItem('axiom-progress'))localStorage.setItem('axiom-progress',JSON.stringify({state:{completed:{'physics/measure':3,'materials/bondzoo':4},lastKey:null},version:0}));});
  const page=activePage=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  let visited=0;
  for(const row of manifest.lessons.filter(row=>!scope||row.key.startsWith(scope+'/'))){
   const prefix=`${label} ${row.key}`;
   activePage.__case=prefix;
   await page.goto(`http://127.0.0.1:8096/__enrichment_acceptance.html?lesson=${row.key}`);
   await page.getByRole('heading',{name:row.title,exact:true}).waitFor();
   const inline=page.locator('[data-enrichment-section]'),help=page.locator('[data-enrichment-help]');
   record(`${prefix}: all main-text additions`,await inline.count()===row.sections.filter(s=>s.mode==='inline').length);
   record(`${prefix}: all contextual triggers`,await help.count()===row.sections.filter(s=>s.mode==='help').length);
   record(`${prefix}: no lesson-sized transcript disclosure`,await page.locator('[data-lesson-walkthrough]').count()===0);
   let tableCount=await inline.locator('table').count();
   for(const section of row.sections){
    const selector=section.mode==='inline'?'data-enrichment-section':'data-enrichment-help';
    const placed=page.locator(`[${selector}="${section.id}"]`);
    record(`${prefix} ${section.id}: correct reading location`,await placed.evaluate(e=>e.closest('[data-enrichment-anchor]').dataset.enrichmentAnchor)===section.at);
    if(section.mode==='inline'){
     record(`${prefix} ${section.id}: rendered main text`,(await placed.innerText()).length>section.heading.length+10);
     continue;
    }
    const trigger=placed.getByRole('button',{name:section.heading,exact:true});
    await trigger.scrollIntoViewIfNeeded();await trigger.focus();await page.keyboard.press('Enter');
    const dialog=page.getByRole('dialog',{name:section.heading,exact:true});await dialog.waitFor();
    record(`${prefix} ${section.id}: keyboard opens readable help`,(await dialog.innerText()).length>section.heading.length+20);
    tableCount+=await dialog.locator('table').count();
    if(['materials/bondzoo','physics/veccomp'].includes(row.key)&&section===row.sections.find(s=>s.mode==='help'))await page.screenshot({path:join(out,`${label}-${row.key.replaceAll('/','-')}-help.png`)});
    const tables=dialog.locator('[role="region"]');
    if(await tables.count()){
     await tables.first().focus();await page.keyboard.press('ArrowRight');
     record(`${prefix} ${section.id}: table keyboard focus`,await tables.first().evaluate(e=>e===document.activeElement));
    }
    record(`${prefix} ${section.id}: popover contained`,await dialog.evaluate(e=>{const r=e.getBoundingClientRect();return r.left>=-1&&r.right<=innerWidth+1&&r.height<=innerHeight;}));
    await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});
    await page.waitForFunction(e=>e===document.activeElement,await trigger.elementHandle());
    record(`${prefix} ${section.id}: Escape restores focus`,await trigger.evaluate(e=>e===document.activeElement));
   }
   record(`${prefix}: no reading overflow`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   record(`${prefix}: no export chatter`,!/(Do you want me to carry|The tab is on|Walk me through this lesson|## Materials 101)/.test(await page.locator('article').innerText()));
   if(['materials/diffusion','physics/kingraphs','engineering/glidersynth','manufacturing-301/bonus'].includes(row.key)){
    await inline.first().scrollIntoViewIfNeeded();await page.screenshot({path:join(out,`${label}-${row.key.replaceAll('/','-')}.png`)});
   }
   await page.getByRole('tab',{name:/2 Try/}).click();
   // Authored prompt/note must be visibly rendered on the Try tab — the data
   // existing in the lesson is not enough. The harness entry exposes what the
   // lesson authors so the check asserts rendered output, not data presence.
   const taskExpected=await page.evaluate(()=>Boolean(window.__acceptanceTaskExpected));
   const noteExpected=await page.evaluate(()=>Boolean(window.__acceptanceNoteExpected));
   const task=page.locator('[data-lesson-task]');
   record(`${prefix}: authored task block ${taskExpected?'rendered':'absent when not authored'}`,(await task.count()>0)===taskExpected);
   if(taskExpected){
    record(`${prefix}: authored task visible`,await task.first().isVisible());
    record(`${prefix}: authored task carries readable steps`,(await task.first().innerText()).length>40);
    const note=page.locator('[data-lesson-note]');
    record(`${prefix}: authored note ${noteExpected?'rendered':'absent when not authored'}`,(await note.count()>0)===noteExpected);
    if(noteExpected)record(`${prefix}: authored note visible`,await note.first().isVisible());
   }
   const answer=page.locator('[data-practice-answer]');
   if(row.practice){
    await answer.waitFor();
    record(`${prefix}: answer initially hidden`,await answer.count()===1&&await answer.evaluate(e=>!e.open));
    await answer.locator(':scope > summary').focus();await page.keyboard.press('Space');
    record(`${prefix}: answer reveals by keyboard`,await answer.evaluate(e=>e.open)&&(await answer.innerText()).length>60);
    tableCount+=await page.locator('[data-lesson-practice] table').count();
    record(`${prefix}: no practice overflow`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    if(row.key==='materials/bondzoo')await page.screenshot({path:join(out,`${label}-materials-practice.png`)});
    await answer.locator(':scope > summary').focus();await page.keyboard.press('Space');record(`${prefix}: answer hides again`,await answer.evaluate(e=>!e.open));
   }else record(`${prefix}: mastery guidance has no invented exercise`,await answer.count()===0);
   record(`${prefix}: every enrichment table accessible`,tableCount===row.sections.reduce((n,s)=>n+s.tables,0)+row.practiceTables);
   const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('axiom-progress')).state.completed);
   record(`${prefix}: saved scores unchanged`,JSON.stringify(saved)===JSON.stringify({'physics/measure':3,'materials/bondzoo':4}));
   record(`${prefix}: original bench accessible`,await page.getByRole('button',{name:'Take the check',exact:true}).isVisible());
   await page.getByRole('tab',{name:/3 Check/}).click();record(`${prefix}: original assessment accessible`,await page.locator('fieldset').count()>0);
   const endings={'manufacturing/stack':'/learn/manufacturing-201','manufacturing-201/locate':'/learn/manufacturing-301','manufacturing-301/layers':'/learn/manufacturing-401','manufacturing-401/takt':'/mission/glider'};
   if(endings[row.key])record(`${prefix}: next section available`,await page.getByRole('link',{name:/Next section/}).getAttribute('href')===endings[row.key]);
   if(++visited%10===0)console.log(`${label}: ${visited} lessons checked`);
  }
  record(`${label}: no runtime errors`,errors.length===0);await ctx.close();
 }
 await writeFile(join(out,'results.json'),JSON.stringify({passed:true,built,lessons:manifest.lessons.filter(row=>!scope||row.key.startsWith(scope+'/')).length,checks:checks.length,details:checks},null,2));console.log(JSON.stringify({passed:true,built,checks:checks.length,out}));
}catch(error){
 await activePage?.screenshot({path:join(out,'failure.png')}).catch(()=>{});
 await writeFile(join(out,'results.json'),JSON.stringify({passed:false,built,checks:checks.length,case:activePage?.__case,error:String(error)},null,2));console.error(error);process.exitCode=1;
}finally{await browser?.close();await server?.close();await rm(entry,{force:true});await rm(html,{force:true});}
