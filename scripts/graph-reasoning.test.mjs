import assert from "node:assert/strict";
import test from "node:test";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const data = JSON.parse(execFileSync(process.execPath, ["--experimental-strip-types", "--input-type=module", "-e", `
import { fitTwoPoints, LOAD_CELL_POINTS, LOAD_CELL_FIT, PROPORTION_PRACTICE, analyzeProportion } from './src/course/graph-reasoning.ts';
import { mathLessons } from './src/course/math.ts';
import { exampleContexts } from './src/course/example-context.ts';
const rejects=fn=>{try{fn();return false}catch{return true}};
console.log(JSON.stringify({fit:LOAD_CELL_FIT, reversed:fitTwoPoints(LOAD_CELL_POINTS[1],LOAD_CELL_POINTS[0]),
 cases:PROPORTION_PRACTICE.map(c=>({...c,...analyzeProportion(c.points)})),
 invalid:[[[0,1],[2,2],[3,3]],[[1,2],[1,3],[2,4]],[[1,2],[2,3]],[[1,2],[2,Infinity],[3,4]]].map(p=>rejects(()=>analyzeProportion(p))),
 vertical:rejects(()=>fitTwoPoints([1,2],[1,3])),
 lesson:mathLessons.find(l=>l.id==='graphs'), context:exampleContexts['math/graphs']}));
`], {encoding:"utf8"}));
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-10, `${a} != ${b}`);

test("the two supplied readings reproduce rise, run, slope and intercept",()=>{
 close(data.fit.rise,8.4); close(data.fit.run,40); close(data.fit.slope,.21); close(data.fit.intercept,0);
 close(data.reversed.rise,-8.4); close(data.reversed.run,-40); close(data.reversed.slope,.21); close(data.reversed.intercept,0);
 close((6.93-data.fit.intercept)/data.fit.slope,33);
 assert.equal(data.vertical,true);
});
test("three-pair practice separates ratio, product, offset and deceptive falling data",()=>{
 assert.deepEqual(data.cases.map(c=>c.kind),['direct','inverse','neither','neither']);
 assert.deepEqual(data.cases[0].ratios,[5,5,5]); assert.deepEqual(data.cases[1].products,[12,12,12]);
 assert.deepEqual(data.cases[2].ratios,[5,3.5,2.75]); assert.deepEqual(data.cases[3].products,[8,8,4]);
 assert.ok(data.cases.every(c=>c.points.length===3)); assert.ok(data.invalid.every(Boolean));
});
test("graph essentials are in visible content and input context, not only a popup",()=>{
 assert.ok(data.lesson.ideas[0].formulaNote.includes('(50 − 10) kg'));
 assert.ok(data.context.working.some(x=>x.includes('2.1 = 2.1 + b')));
 assert.ok(data.context.notes.some(x=>x.includes('not a rule for every load cell')));
 assert.equal(data.lesson.ideas[1].sections.filter(s=>s.table).length,3);
 assert.ok(JSON.stringify(data.lesson.ideas[1].sections).includes('not every decreasing relationship'));
 assert.ok(JSON.stringify(data.lesson.ideas[1].sections).includes('1/x'));
 assert.ok(data.lesson.exampleHelp.some(h=>h.trigger==='Why does b become zero?'));
 assert.equal(data.lesson.passAt,4); assert.equal(data.lesson.checks.length,4);
 assert.ok(data.lesson.checks[3].why.includes('rather than treating b = 0 as proof')); // the fixture separately pins all option text/answer keys
});
test("popup dimensions use available collision space and focus starts at the explanation",()=>{
 const source=readFileSync('src/components/concept-help.tsx','utf8');
 assert.match(source,/--radix-popover-content-available-height/);
 assert.match(source,/onOpenAutoFocus/); assert.match(source,/preventScroll: true/);
});
test("browser failure survives teardown and a failed or incomplete report is rejected",()=>{
 const dir=mkdtempSync(join(tmpdir(),'axiom-acceptance-'));
 try {
  const child=spawnSync(process.execPath,['scripts/browser-lesson-givens.mjs'],{env:{...process.env,ACCEPTANCE_FORCE_FAILURE:'1',ACCEPTANCE_OUT:dir},encoding:'utf8',timeout:20000});
  assert.equal(child.status,1,child.stderr);
  const path=join(dir,'results.json'); assert.equal(JSON.parse(readFileSync(path,'utf8')).passed,false);
  const verify=()=>spawnSync(process.execPath,['scripts/assert-lesson-acceptance.mjs',path],{encoding:'utf8'}).status;
  assert.equal(verify(),1);
  writeFileSync(path,JSON.stringify({passed:true,count:1,checks:['desktop only']})); assert.equal(verify(),1);
  const checks=['desktop','mobile'].flatMap(d=>[`${d}: practice does not change saved course scores`,`${d}: no interaction exceptions`]);
  writeFileSync(path,JSON.stringify({passed:true,count:checks.length,checks})); assert.equal(verify(),0);
 } finally { rmSync(dir,{recursive:true,force:true}); }
});
