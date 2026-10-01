// Real LessonView in an isolated router/storage harness; never production auth.
import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {createServer,build,preview} from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import {chromium} from 'playwright';
const root=resolve('.'),built=process.env.ACCEPTANCE_BUILD==='1';
const out=resolve(process.env.ACCEPTANCE_OUT||`screenshots/materials-import${built?'-built':''}`);
const entry=join(root,'__materials_acceptance.tsx'),html=join(root,'__materials_acceptance.html');
const buildDir=resolve('artifacts/materials-acceptance-build');
const manifest=JSON.parse(await readFile('docs/materials-import-manifest.json','utf8'));
const checks=[],record=(name,condition)=>{assert.ok(condition,name);checks.push(name);};
let server,browser,activePage;
await mkdir(out,{recursive:true});
try{
 await writeFile(html,'<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>Materials import acceptance</title></head><body><div id="root"></div><script type="module" src="/__materials_acceptance.tsx"></script></body></html>');
 await writeFile(entry,`import React from 'react';import{createRoot}from'react-dom/client';
import{createRootRoute,createRoute,createRouter,createMemoryHistory,RouterProvider,Outlet}from'@tanstack/react-router';
import{LessonView}from'./src/components/lesson-view';import{getLesson}from'./src/course/catalog';import{ProgressHydrator}from'./src/course/progress';import'./src/styles.css';
const r=createRootRoute({component:()=> <><ProgressHydrator/><Outlet/></>});
const l=createRoute({getParentRoute:()=>r,path:'/learn/$trackId/$lessonId',component:()=>{const{trackId,lessonId}=l.useParams();const lesson=getLesson(trackId,lessonId);return lesson?<LessonView key={trackId+'/'+lessonId} lesson={lesson}/>:<h1>Missing lesson</h1>}});
const t=createRoute({getParentRoute:()=>r,path:'/learn/$trackId',component:()=> <h1>Course index</h1>});
const key=new URLSearchParams(location.search).get('lesson')||'materials/bondzoo';
const router=createRouter({routeTree:r.addChildren([l,t]),history:createMemoryHistory({initialEntries:['/learn/'+key]})});
createRoot(document.getElementById('root')!).render(<RouterProvider router={router}/>);`);
 const config={configFile:false,root,plugins:[react(),tailwindcss()],resolve:{alias:{'@':join(root,'src')}}};
 if(built){await build({...config,build:{outDir:buildDir,emptyOutDir:true,rolldownOptions:{input:html}}});server=await preview({...config,build:{outDir:buildDir},preview:{host:'127.0.0.1',port:8096,strictPort:true}});}
 else{server=await createServer({...config,server:{host:'127.0.0.1',port:8096,strictPort:true}});await server.listen();}
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 for(const[label,width,height,motion]of[['desktop',1280,900,'no-preference'],['mobile',390,844,'reduce']]){
  const ctx=await browser.newContext({viewport:{width,height},reducedMotion:motion});
  await ctx.addInitScript(()=>{if(!localStorage.getItem('axiom-progress'))localStorage.setItem('axiom-progress',JSON.stringify({state:{completed:{'physics/measure':3,'materials/bondzoo':4},lastKey:null},version:0}));});
  const page=activePage=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const row of manifest.lessons){
   const prefix=`${label} materials/${row.lessonId}`;
   await page.goto(`http://127.0.0.1:8096/__materials_acceptance.html?lesson=materials/${row.lessonId}`);
   const panel=page.locator(`[data-lesson-walkthrough="${row.lessonId}"]`);await panel.waitFor();
   record(`${prefix}: exactly one mapping`,await panel.count()===1);
   record(`${prefix}: initially closed`,await panel.evaluate(e=>!e.open));
   const summary=panel.locator(':scope > summary');await summary.focus();await page.keyboard.press('Enter');
   record(`${prefix}: opens by keyboard`,await panel.evaluate(e=>e.open));
   record(`${prefix}: all sections`,await panel.locator('h3[id]').count()===row.sections);
   record(`${prefix}: all tables`,await panel.locator('table').count()===row.tables);
   record(`${prefix}: no page overflow`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   const links=panel.locator('nav a');await links.last().click();
   record(`${prefix}: section navigation`,await links.last().getAttribute('href')===await page.evaluate(()=>location.hash));
   const tables=panel.locator('[role="region"]');if(await tables.count()){
    await tables.first().focus();await page.keyboard.press('ArrowRight');record(`${prefix}: table focus`,await tables.first().evaluate(e=>e===document.activeElement));
   }
   const answer=panel.locator('[data-walkthrough-answer]');
   if(row.practice){
    record(`${prefix}: answer initially hidden`,await answer.count()===1&&await answer.evaluate(e=>!e.open));
    await answer.locator(':scope > summary').focus();await page.keyboard.press('Space');
    record(`${prefix}: answer reveals by keyboard`,await answer.evaluate(e=>e.open)&&(await answer.innerText()).length>60);
    await page.keyboard.press('Space');record(`${prefix}: answer hides again`,await answer.evaluate(e=>!e.open));
   }else record(`${prefix}: mastery review, not invented practice`,await answer.count()===0);
   const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('axiom-progress')).state.completed);
   record(`${prefix}: saved scores unchanged`,JSON.stringify(saved)===JSON.stringify({'physics/measure':3,'materials/bondzoo':4}));
   record(`${prefix}: no export chatter`,!/(<script>|Do you want me to carry|The tab is on|## Materials 101)/.test(await panel.innerText()));
   if(['bondzoo','diffusion','sparsynth'].includes(row.lessonId)){
    const table=panel.locator('table').first();if(await table.count())await table.scrollIntoViewIfNeeded();else await summary.scrollIntoViewIfNeeded();
    await page.screenshot({path:join(out,`${label}-${row.lessonId}.png`)});
   }
   await page.getByRole('tab',{name:/2 Try/}).click();
   record(`${prefix}: original bench accessible`,await page.getByRole('button',{name:'Take the check',exact:true}).isVisible());
   await page.getByRole('tab',{name:/3 Check/}).click();record(`${prefix}: original assessment accessible`,await page.locator('fieldset').count()>0);
  }
  record(`${label}: no runtime errors`,errors.length===0);await ctx.close();
 }
 await writeFile(join(out,'results.json'),JSON.stringify({passed:true,built,lessons:30,checks:checks.length,details:checks},null,2));console.log(JSON.stringify({passed:true,built,checks:checks.length,out}));
}catch(error){
 await activePage?.screenshot({path:join(out,'failure.png')}).catch(()=>{});
 await writeFile(join(out,'results.json'),JSON.stringify({passed:false,built,checks:checks.length,error:String(error)},null,2));console.error(error);process.exitCode=1;
}finally{await browser?.close();await server?.close();await rm(entry,{force:true});await rm(html,{force:true});}
