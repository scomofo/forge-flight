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
const data=JSON.parse(execFileSync(process.execPath,['--experimental-strip-types','--input-type=module','-e',`import {exampleContexts} from './src/course/example-context.ts';import {lessons} from './src/course/catalog.ts';console.log(JSON.stringify({keys:Object.keys(exampleContexts),powers:lessons.find(l=>l.track==='math'&&l.id==='powers'),trig:lessons.find(l=>l.track==='math'&&l.id==='triangles-vectors')}));`],{encoding:'utf8'}));
const results=[],record=(name,condition)=>{assert.ok(condition,name);results.push(name);};
let server,browser,activePage;
let failed = false;
try{
 if(process.env.ACCEPTANCE_FORCE_FAILURE === "1") throw new Error("Deliberate browser acceptance failure");
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
  await page.waitForFunction(() => {
   const el=document.querySelector('[role="dialog"]'); if(!el)return false;
   const b=el.getBoundingClientRect(); return b.width>0&&b.height>0&&b.x>=0&&b.y>=0&&b.right<=innerWidth+1&&b.bottom<=innerHeight+1;
  });
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
  await go('math/graphs');
  const before=page.locator('[data-example-inputs="figure"]');
  record(`${label}: calibration points supplied before animation`,(await before.textContent()).includes('10 kg gives 2.1 mV')&&(await before.textContent()).includes('50 kg gives 10.5 mV'));
  const worked=page.locator('[data-example-inputs="worked"]');
  record(`${label}: run and intercept have complete working`,(await worked.textContent()).includes('(50 − 10) kg = 40 kg')&&(await worked.textContent()).includes('b = 2.1 − 2.1 = 0 mV'));
  for(const name of ['Ideal spring: supplied k = 5 N/mm','Fixed work: supplied 12 kJ','An offset line: y = 2x + 3']){
   record(`${label}: visible comparison ${name}`,await page.getByRole('region',{name,exact:true}).count()===1);
  }
  const interceptTrigger=page.getByRole('button',{name:'Why does b become zero?',exact:true});
  await interceptTrigger.focus(); await page.keyboard.press('Enter');
  const interceptHelp=page.getByRole('dialog',{name:'Find the voltage left at zero load',exact:true});
  await interceptHelp.waitFor();
  await page.waitForFunction(()=>{const d=document.querySelector('[role="dialog"]');if(!d)return false;const b=d.getBoundingClientRect();return b.y>=0&&b.bottom<=innerHeight+1&&b.x>=0&&b.right<=innerWidth+1;});
  record(`${label}: intercept popup opens at start`,await interceptHelp.evaluate(el=>el.scrollTop===0));
  await page.screenshot({path:join(out,`${label}-calibration-help.png`)});
  await page.keyboard.press('Escape'); await interceptHelp.waitFor({state:'hidden'});
  await page.waitForFunction(el=>el===document.activeElement,await interceptTrigger.elementHandle());
  record(`${label}: intercept popup returns keyboard focus`,await interceptTrigger.evaluate(el=>el===document.activeElement));
  await page.getByRole('region',{name:'Fixed work: supplied 12 kJ',exact:true}).scrollIntoViewIfNeeded();
  await page.screenshot({path:join(out,`${label}-proportion-tables.png`)});
  await page.getByRole('tab',{name:/2 Try/}).click();
  const practice=page.getByRole('region',{name:'Direct, inverse, or neither?',exact:true});
  const completedBeforePractice=await page.evaluate(()=>JSON.stringify(JSON.parse(localStorage.getItem('axiom-progress')).state.completed));
  record(`${label}: practice requires a choice`,await practice.getByRole('button',{name:'Check relationship',exact:true}).isDisabled());
  record(`${label}: practice does not reveal answer before attempt`,await practice.getByRole('columnheader',{name:'y ÷ x',exact:true}).count()===0);
  const choose=async name=>{const radio=practice.getByRole('radio',{name,exact:true});await radio.focus();await page.keyboard.press('Space');await practice.getByRole('button',{name:'Check relationship',exact:true}).click();};
  await choose('Inverse');
  record(`${label}: incorrect practice answer gives reasoning`,(await practice.getByRole('status').textContent()).includes('Not quite.')&&(await practice.getByRole('status').textContent()).includes('5 N/mm'));
  await practice.getByRole('button',{name:'Try this set again',exact:true}).click();
  record(`${label}: retry clears previous selection`,await practice.getByRole('button',{name:'Check relationship',exact:true}).isDisabled());
  await choose('Direct');
  record(`${label}: direct practice verifies ratio`,(await practice.getByRole('status').textContent()).includes('That’s right.'));
  await practice.getByRole('button',{name:'Next set',exact:true}).click(); await choose('Inverse');
  record(`${label}: inverse practice verifies constant work`,(await practice.getByRole('status').textContent()).includes('12 kJ'));
  await practice.getByRole('button',{name:'Next set',exact:true}).click(); await choose('Neither');
  record(`${label}: offset practice catches linear trap`,(await practice.getByRole('status').textContent()).includes('linear, but not directly proportional'));
  await practice.scrollIntoViewIfNeeded(); await page.screenshot({path:join(out,`${label}-proportion-practice.png`)});
  record(`${label}: practice stays within page width`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await practice.getByRole('button',{name:'Next set',exact:true}).click(); await choose('Neither');
  record(`${label}: falling pattern requires third point`,(await practice.getByRole('status').textContent()).includes('third pair breaks'));
  await practice.getByRole('button',{name:'Start again',exact:true}).click();
  record(`${label}: practice restart clears answer`,await practice.getByRole('button',{name:'Check relationship',exact:true}).isDisabled()&&(await practice.textContent()).includes('Set 1 of 4'));
  record(`${label}: practice does not change saved course scores`,await page.evaluate(()=>JSON.stringify(JSON.parse(localStorage.getItem('axiom-progress')).state.completed))===completedBeforePractice);
  await go('manufacturing-301/bonus');await page.getByRole('tab',{name:/2 Try/}).click();
  const hole=page.getByRole('slider',{name:/Measured hole/});await hole.focus();await page.keyboard.press('Home');for(let i=0;i<4;i++)await page.keyboard.press('ArrowRight');
  const body=await page.locator('article').textContent();record(`${label}: bonus bench diameter and radius distinct`,body.includes('Zone diameter')&&body.includes('⌀0.40 mm')&&body.includes('Maximum radial offset')&&body.includes('0.20 mm'));
  await hole.scrollIntoViewIfNeeded();await page.screenshot({path:join(out,`${label}-bonus-bench.png`)});
  await go('math/triangles-vectors');
  const trigScoresBefore=await page.evaluate(()=>JSON.stringify(JSON.parse(localStorage.getItem('axiom-progress')).state.completed));
  const names=page.getByRole('heading',{name:'Label the sides, then choose the ratio',exact:true});
  const cableExample=page.getByRole('heading',{name:'Resolve the cable force',exact:true});
  record(`${label}: side names are introduced before cable arithmetic`,await names.evaluate((el,other)=>Boolean(el.compareDocumentPosition(other)&Node.DOCUMENT_POSITION_FOLLOWING),await cableExample.elementHandle()));
  const trigArticle=await page.locator('article').textContent();
  record(`${label}: side names and angle units are visible without opening help`,trigArticle.includes('across from the 90° corner')&&trigArticle.includes('SOH-CAH-TOA')&&trigArticle.includes('π/2 rad'));
  record(`${label}: the angle-measurement limit is locally visible`,trigArticle.includes('Correct arithmetic cannot repair an inaccurate input'));
  const openTrigHelp=async (triggerName,title,fragments,screenshotName)=>{
   const button=page.getByRole('button',{name:triggerName,exact:true});
   await button.focus();await page.keyboard.press('Enter');
   const popup=page.getByRole('dialog',{name:title,exact:true});await popup.waitFor();
   await page.waitForFunction(()=>{const d=document.querySelector('[role="dialog"]');if(!d)return false;const b=d.getBoundingClientRect();return b.x>=0&&b.y>=0&&b.right<=innerWidth+1&&b.bottom<=innerHeight+1;});
   const text=await popup.textContent();record(`${label}: trig help content ${title}`,fragments.every(x=>text.includes(x)));
   record(`${label}: trig help begins at the top ${title}`,await popup.evaluate(el=>el.scrollTop===0));
   if(screenshotName)await page.screenshot({path:join(out,`${label}-${screenshotName}.png`)});
   // The explicit close control must remain reachable even in long help.
   const closeButton=popup.getByRole('button',{name:'Close',exact:true});await closeButton.focus();
   record(`${label}: trig help close reachable ${title}`,await closeButton.isVisible());
   await page.keyboard.press('Escape');await popup.waitFor({state:'hidden'});
   await page.waitForFunction(el=>el===document.activeElement,await button.elementHandle());
   record(`${label}: trig help restores focus ${title}`,await button.evaluate(el=>el===document.activeElement));
  };
  await openTrigHelp('Work through the 30° brace','Choose the ratio from the two sides',['24 in','13.9 in','27.7 in'],'trig-brace-help');
  await openTrigHelp('What does one radian mean?','A radian is one radius along the circle',['57.3°','without slipping','15.7 in'],'trig-radian-help');
  await openTrigHelp('Which calculator mode should I use?','Match the angle unit to the calculation',['−0.428','180/π','2 × 30° = 60°'],'trig-mode-help');
  await openTrigHelp('What if the angle is a little wrong?','How an angle error changes the components',['pounds-force','529.9 lbf','34°'],'trig-measurement-help');
  await openTrigHelp('Work through the two pulls','Turn two pulls into one resultant',['Rx = 650','259.8','do not oppose each other']);
  await page.getByRole('tab',{name:/2 Try/}).click();
  const angle=page.getByRole('slider',{name:'Angle θ',exact:true});await angle.focus();await page.keyboard.press('Home');
  for(let i=0;i<34;i++)await page.keyboard.press('ArrowRight');
  record(`${label}: 34-degree bench components`,(await page.locator('article').textContent()).includes('415 N')&&(await page.locator('article').textContent()).includes('280 N'));
  await page.keyboard.press('ArrowRight');
  record(`${label}: 35-degree bench components`,(await page.locator('article').textContent()).includes('410 N')&&(await page.locator('article').textContent()).includes('287 N'));
  await page.keyboard.press('ArrowRight');
  record(`${label}: 36-degree bench components`,(await page.locator('article').textContent()).includes('405 N')&&(await page.locator('article').textContent()).includes('294 N'));
  await openTrigHelp('What if the angle is a little wrong?','How an angle error changes the components',['Same 1,000 lbf','pounds-force']);
  record(`${label}: trig help and bench preserve saved scores`,await page.evaluate(()=>JSON.stringify(JSON.parse(localStorage.getItem('axiom-progress')).state.completed))===trigScoresBefore);
  await page.getByRole('tab',{name:/3 Check/}).click();
  for(let attempt=0;attempt<2;attempt++){
   for(let i=0;i<data.trig.checks.length;i++){
    const q=data.trig.checks[i],field=page.locator('fieldset');
    record(`${label}: trig feedback hidden before attempt ${attempt} question ${i}`,await field.getByRole('region',{name:'Two pulls resolved along the same axes',exact:true}).count()===0);
    const pick=i===3&&attempt===0?1:q.answer;
    const answer=field.getByRole('button',{name:q.options[pick],exact:true});await answer.focus();await page.keyboard.press('Enter');
    if(i===3){
     const table=field.getByRole('region',{name:'Two pulls resolved along the same axes',exact:true});
     record(`${label}: vector feedback contains component table ${attempt}`,await table.count()===1&&(await table.textContent()).includes('Rx = 650'));
     record(`${label}: vector feedback teaches rather than changing grading ${attempt}`,(await field.textContent()).includes(attempt===0?'Not quite.':'Yes.')&&(await field.textContent()).includes('do not oppose each other'));
     await table.focus();await page.keyboard.press('ArrowRight');
     record(`${label}: vector feedback table keyboard accessible ${attempt}`,await table.evaluate(el=>el===document.activeElement));
     record(`${label}: vector feedback has no page-wide overflow ${attempt}`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
     if(attempt===0){
      await table.scrollIntoViewIfNeeded();await page.screenshot({path:join(out,`${label}-vector-feedback.png`)});
      await openTrigHelp('What does atan2 mean?','Find an angle from two signed components',['different argument order','returns radians','zero vector'],'trig-atan2-help');
     }
    }
    await field.getByRole('button',{name:i===3?'See the result':'Next question',exact:true}).click();
   }
   const result=await page.locator('article').textContent();
   record(`${label}: trig score is ${attempt===0?'3 of 4, not a pass':'4 of 4, pass'}`,result.includes(attempt===0?'3 of 4.':'4 of 4.')&&result.includes(attempt===0?'Not a pass.':'Pass. 4 or more correct.'));
   if(attempt===0)await page.getByRole('button',{name:'Try the check again',exact:true}).click();
  }
  const trigSaved=await page.evaluate(()=>JSON.parse(localStorage.getItem('axiom-progress')).state.completed);
  record(`${label}: trig retake saves best score without altering existing scores`,trigSaved['math/triangles-vectors']===4&&trigSaved['physics/measure']===3&&trigSaved['math/ratios-units']===4);
  await go('physics/measure');
  const pendulumBefore=await page.evaluate(()=>JSON.stringify(JSON.parse(localStorage.getItem('axiom-progress')).state.completed));
  const pendulumContext=page.locator('[data-example-inputs="figure"]');
  const pendulumText=await pendulumContext.textContent();
  record(`${label}: pendulum symbols visible before the diagram`,['back-and-forth','pivot','not a force','No numerical value','T means time'].every(x => pendulumText.includes(x)));
  const pendulumFigure=page.locator('figure').first();
  if(motion==='reduce') record(`${label}: pendulum reduced motion uses a still`,await pendulumFigure.getByRole('slider',{name:'Scrub',exact:true}).count()===0);
  else {
   const scrub=pendulumFigure.getByRole('slider',{name:'Scrub',exact:true}); await scrub.focus();await page.keyboard.press('Home');
   record(`${label}: pendulum setup names period and acceleration`,(await pendulumFigure.locator('figcaption').textContent()).includes('full back-and-forth cycle'));
   await page.keyboard.press('End');
  }
  record(`${label}: pendulum final caption does not claim proof`,(await pendulumFigure.locator('figcaption').textContent()).includes('does not prove'));
  record(`${label}: pendulum diagram uses real units and explains dimension letters`,(await pendulumFigure.textContent()).includes('√(m ÷ (m/s²))')&&(await pendulumFigure.textContent()).includes('L means length'));
  record(`${label}: pendulum labels fit inside the diagram`,await pendulumFigure.locator('svg').first().evaluate(svg=>{const vb=svg.viewBox.baseVal;return [...svg.querySelectorAll('text')].every(el=>{const b=el.getBBox();return b.x>=vb.x-1&&b.x+b.width<=vb.x+vb.width+1&&b.y>=vb.y-1&&b.y+b.height<=vb.y+vb.height+1;});}));
  await pendulumFigure.scrollIntoViewIfNeeded();await page.screenshot({path:join(out,`${label}-pendulum-units.png`)});
  const candidates=page.getByRole('region',{name:'Three pendulum candidates checked in metres and seconds',exact:true});
  await candidates.focus();await page.keyboard.press('ArrowRight');
  record(`${label}: pendulum table accessible by keyboard`,await candidates.evaluate(el=>el===document.activeElement));
  await openTrigHelp('Walk through the pendulum unit check','Why only one candidate has time units',['T⁻² = 1/T²','5√(l/g)','unit scale'],'pendulum-help');
  record(`${label}: pendulum help preserves saved scores`,await page.evaluate(()=>JSON.stringify(JSON.parse(localStorage.getItem('axiom-progress')).state.completed))===pendulumBefore);
  record(`${label}: pendulum page has no horizontal overflow`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  record(`${label}: no interaction exceptions`,errors.length===0);await ctx.close();
 }
 await writeFile(join(out,'results.json'),JSON.stringify({passed:true,count:results.length,checks:results},null,2));console.log(JSON.stringify({passed:true,count:results.length,out}));
}catch(error){
 failed = true;
 if(activePage&&!activePage.isClosed())await activePage.screenshot({path:join(out,'failure.png'),fullPage:true}).catch(()=>{});
 await writeFile(join(out,'results.json'),JSON.stringify({passed:false,count:results.length,checks:results,error:String(error)},null,2));console.error(error);process.exitCode=1;
}finally{await browser?.close();if(server?.close)await server.close();else if(server?.httpServer)await new Promise(resolve=>server.httpServer.close(resolve));await rm(entry,{force:true});await rm(html,{force:true});}

// Vite shutdown may overwrite process.exitCode. Exit only after cleanup is finished.
if (failed) process.exit(1);
