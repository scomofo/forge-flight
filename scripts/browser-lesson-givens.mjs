// Real LessonView, figures, help, benches and quizzes in an isolated router.
// This harness never changes production routes, authentication or saved user data.
import assert from 'node:assert/strict';
import {mkdir,writeFile,rm} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {join,resolve} from 'node:path';
import {createServer,build,preview} from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import {chromium} from 'playwright';
const root=resolve('.'),out=resolve(process.env.ACCEPTANCE_OUT||'screenshots/lesson-givens');
await mkdir(out,{recursive:true});
const entry=join(root,'__givens_acceptance.tsx'),html=join(root,'__givens_acceptance.html');
const built = process.env.ACCEPTANCE_BUILD === '1';
const buildDir = resolve('artifacts/lesson-acceptance-build');
const data=JSON.parse(execFileSync(process.execPath,['--experimental-strip-types','--input-type=module','-e',`import {exampleContexts} from './src/course/example-context.ts';import {lessons} from './src/course/catalog.ts';console.log(JSON.stringify({keys:Object.keys(exampleContexts),powers:lessons.find(l=>l.track==='math'&&l.id==='powers')}));`],{encoding:'utf8'}));
const results=[],record=(name,condition)=>{assert.ok(condition,name);results.push(name);};
let server,browser,activePage;
try{
 await writeFile(html,'<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Lesson givens acceptance</title></head><body><div id="root"></div><script type="module" src="/__givens_acceptance.tsx"></script></body></html>');
 await writeFile(entry,`import React from 'react';
import {createRoot} from 'react-dom/client';
import {createRootRoute,createRoute,createRouter,createMemoryHistory,RouterProvider,Outlet} from '@tanstack/react-router';
import {LessonView} from './src/components/lesson-view';import {getLesson} from './src/course/catalog';
import {ProgressHydrator} from './src/course/progress';import './src/styles.css';
const rootRoute=createRootRoute({component:()=> <><ProgressHydrator/><Outlet/></>});
const lessonRoute=createRoute({getParentRoute:()=>rootRoute,path:'/learn/$trackId/$lessonId',component:()=>{const {trackId,lessonId}=lessonRoute.useParams();const lesson=getLesson(trackId,lessonId);return lesson?<LessonView key={trackId+'/'+lessonId} lesson={lesson}/>:<h1>Lesson not found</h1>}});
const courseRoute=createRoute({getParentRoute:()=>rootRoute,path:'/learn/$trackId',component:()=> <h1>Course navigation target</h1>});
const key=new URLSearchParams(location.search).get('lesson')||'math/powers';
const router=createRouter({routeTree:rootRoute.addChildren([lessonRoute,courseRoute]),history:createMemoryHistory({initialEntries:['/learn/'+key]})});
createRoot(document.getElementById('root')!).render(<RouterProvider router={router}/>);`);
 const config={configFile:false,root,plugins:[react(),tailwindcss()],resolve:{alias:{'@':join(root,'src')}}};
 if(built){await build({...config,build:{outDir:buildDir,emptyOutDir:true,rolldownOptions:{input:html}}});server=await preview({...config,build:{outDir:buildDir},preview:{host:'127.0.0.1',port:8094,strictPort:true}});}
 else{server=await createServer({...config,server:{host:'127.0.0.1',port:8094,strictPort:true}});await server.listen();}
 browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.CHROMIUM_EXECUTABLE_PATH}:{})});
 for(const [label,width,height,motion]of [['desktop',1280,900,'no-preference'],['mobile',390,844,'reduce']]){
  const ctx=await browser.newContext({viewport:{width,height},reducedMotion:motion});
  await ctx.addInitScript(()=>{if(!localStorage.getItem('axiom-progress'))localStorage.setItem('axiom-progress',JSON.stringify({state:{completed:{'physics/measure':3,'math/ratios-units':4},lastKey:null},version:0}));});
  const page=activePage=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const go=async key=>{await page.goto('http://127.0.0.1:8094/__givens_acceptance.html?lesson='+encodeURIComponent(key));await page.locator('[data-example-inputs="worked"]').waitFor();};
  for(const key of data.keys){
   await go(key);
   const panels=page.locator('[data-example-inputs]');
   record(`${label} ${key}: figure and example have visible inputs`,await panels.count()===2&&await panels.first().isVisible());
   record(`${label} ${key}: inputs precede figure`,await page.evaluate(()=>Boolean(document.querySelector('[data-example-inputs="figure"]').compareDocumentPosition(document.querySelector('figure'))&Node.DOCUMENT_POSITION_FOLLOWING)));
   record(`${label} ${key}: no page-wide overflow`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  }
  record(`${label}: no rendering exceptions`,errors.length===0);
  const progress=await page.evaluate(()=>JSON.parse(localStorage.getItem('axiom-progress')).state.completed);
  record(`${label}: visits preserve saved scores`,progress['physics/measure']===3&&progress['math/ratios-units']===4&&Object.keys(progress).length===2);
  await go('math/powers');
  record(`${label}: density correction remains`,(await page.locator('article').textContent()).includes('not calculated from the dimensions'));
  record(`${label}: arrows explained without popup`,(await page.locator('article').textContent()).includes('Reading this line: → means'));
  const trigger=page.getByRole('button',{name:'Where did the extra 10² come from?',exact:true});
  await trigger.focus();await page.keyboard.press('Enter');
  const dialog=page.getByRole('dialog',{name:'First change the prefix, then tidy the notation',exact:true});await dialog.waitFor();
  record(`${label}: keyboard opens explanation`,(await dialog.textContent()).includes('150,000,000'));
  const box=await dialog.boundingBox();record(`${label}: help fits viewport`,box.x>=0&&box.y>=0&&box.x+box.width<=width+1&&box.y+box.height<=height+1);
  await page.screenshot({path:join(out,`${label}-notation-help.png`)});
  await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});
  await page.waitForFunction(el=>el===document.activeElement,await trigger.elementHandle());record(`${label}: Escape restores focus`,await trigger.evaluate(el=>el===document.activeElement));
  const figure=page.locator('figure').first();
  if(motion==='reduce')record(`${label}: reduced motion remains a still`,await figure.getByRole('slider',{name:'Scrub',exact:true}).count()===0);
  else{const scrub=figure.getByRole('slider',{name:'Scrub',exact:true});await scrub.focus();await page.keyboard.press('Home');record(`${label}: keyboard scrub starts at zero`,await scrub.inputValue()==='0');await page.keyboard.press('End');record(`${label}: density mass caption reachable`,/mass|m = ρV/i.test(await figure.locator('figcaption').textContent()));}
  await page.getByRole('tab',{name:/3 Check/}).click();
  for(let i=0;i<data.powers.checks.length;i++){
   const q=data.powers.checks[i];await page.getByRole('button',{name:q.options[q.answer],exact:true}).click();
   if(i===0)record(`${label}: fourth-power feedback explains distractor`,(await page.locator('fieldset').textContent()).includes('−9 + 3 = −6'));
   if(i===1)record(`${label}: mega feedback shows normalization`,(await page.locator('fieldset').textContent()).includes('150,000,000'));
   await page.locator('fieldset').getByRole('button',{name:i===3?'See the result':'Next question',exact:true}).click();
  }
  record(`${label}: runway still requires four correct`,(await page.locator('article').textContent()).includes('Pass. 4 or more correct.'));
  await go('engineering/tradestudy');const raw=page.locator('[data-example-inputs="worked"]').getByRole('region',{name:'Raw input matrix',exact:true});
  await raw.focus();await page.keyboard.press('ArrowRight');record(`${label}: matrix keyboard-focusable`,await raw.evaluate(el=>el===document.activeElement));
  record(`${label}: matrix includes raw values and units`,(await raw.textContent()).includes('CNC aluminum')&&(await raw.textContent()).includes('Mass (g)'));
  await raw.scrollIntoViewIfNeeded();await page.screenshot({path:join(out,`${label}-trade-matrix.png`)});
  await go('manufacturing-301/bonus');await page.getByRole('tab',{name:/2 Try/}).click();
  const hole=page.getByRole('slider',{name:/Measured hole/});await hole.focus();await page.keyboard.press('Home');for(let i=0;i<4;i++)await page.keyboard.press('ArrowRight');
  const body=await page.locator('article').textContent();record(`${label}: bonus bench diameter and radius distinct`,body.includes('Zone diameter')&&body.includes('⌀0.40 mm')&&body.includes('Maximum radial offset')&&body.includes('0.20 mm'));
  await hole.scrollIntoViewIfNeeded();await page.screenshot({path:join(out,`${label}-bonus-bench.png`)});
  record(`${label}: no interaction exceptions`,errors.length===0);await ctx.close();
 }
 await writeFile(join(out,'results.json'),JSON.stringify({passed:true,count:results.length,checks:results},null,2));console.log(JSON.stringify({passed:true,count:results.length,out}));
}catch(error){
 if(activePage&&!activePage.isClosed())await activePage.screenshot({path:join(out,'failure.png'),fullPage:true}).catch(()=>{});
 await writeFile(join(out,'results.json'),JSON.stringify({passed:false,count:results.length,checks:results,error:String(error)},null,2));console.error(error);process.exitCode=1;
}finally{await browser?.close();if(server?.close)await server.close();else if(server?.httpServer)await new Promise(resolve=>server.httpServer.close(resolve));await rm(entry,{force:true});await rm(html,{force:true});}
