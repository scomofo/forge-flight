import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const {lessons,rows,walkthroughs,next}=JSON.parse(execFileSync(process.execPath,['--experimental-strip-types','--input-type=module','-e',`
import{lessons}from'./src/course/catalog.ts';import{getLessonEnrichment}from'./src/course/lesson-enrichment.ts';
import{materialsWalkthroughs}from'./src/course/materials-walkthroughs.ts';import{nextManufacturingSection}from'./src/course/section-navigation.ts';
console.log(JSON.stringify({lessons,rows:lessons.flatMap(l=>{const e=getLessonEnrichment(l);return e?[{key:l.track+'/'+l.id,e}]:[]}),walkthroughs:materialsWalkthroughs,next:['manufacturing','manufacturing-201','manufacturing-301','manufacturing-401','physics'].map(nextManufacturingSection)}));
`],{encoding:'utf8',maxBuffer:16e6}));
const manifest=JSON.parse(readFileSync('docs/course-enrichment-coverage.json','utf8'));
const blocks=e=>[...e.sections.flatMap(s=>s.blocks),...(e.practice?.prompt??[]),...(e.practice?.answer??[])];
const text=key=>JSON.stringify(rows.find(r=>r.key===key).e);
const near=(actual,expected,tolerance)=>assert.ok(Math.abs(actual-expected)<=tolerance,`${actual} ≉ ${expected}`);
test('110 transcript lessons and 107 practices are covered, with no orphan IDs',()=>{
 assert.equal(rows.length,110);assert.equal(rows.filter(r=>r.e.practice).length,107);
 assert.deepEqual(Object.fromEntries(['physics','materials','engineering','manufacturing'].map(t=>[t,rows.filter(r=>r.key.startsWith(t)).length])),{physics:28,materials:30,engineering:30,manufacturing:22});
 assert.deepEqual(new Set(manifest.lessons.map(r=>r.key)),new Set(rows.map(r=>r.key)));
 execFileSync(process.execPath,['--experimental-strip-types','scripts/course-enrichment-coverage.mjs','--check'],{stdio:'pipe'});
});
for(const {key,e}of rows)test(`${key}: every addition has a reachable anchor and usable content`,()=>{
 const lesson=lessons.find(l=>`${l.track}/${l.id}`===key);
 const anchors=new Set(['opening',...(lesson.readFlow??[{kind:'idea',idea:0},{kind:'idea',idea:1},{kind:'idea',idea:2},{kind:'example'},{kind:'move'}]).map(b=>b.kind==='idea'?`idea-${b.idea}`:b.kind)]);
 assert.equal(new Set(e.sections.map(s=>s.id)).size,e.sections.length,'section IDs must be unique');
 assert.ok(e.sections.length,'each mapped lesson must contain an explanation');
 for(const s of e.sections){assert.ok(anchors.has(s.at),`unreachable ${s.at}`);assert.ok(s.blocks.length);assert.doesNotMatch(s.heading,/^(?:walk me through(?: this)?|expand|explain this|here)[.!?]*$/i);}
 for(const b of blocks(e))if(b.kind==='table')for(const row of b.rows)assert.equal(row.length,b.columns.length);
 assert.doesNotMatch(JSON.stringify(e),/Do you want me to (?:carry|continue)|The tab is on|Walk me through this lesson/);
 if(e.practice){assert.ok(e.practice.prompt.length);assert.ok(e.practice.answer.length);}
});
for(const [id,w]of Object.entries(walkthroughs))test(`materials/${id}: placement preserves every source block, note, reference and practice exactly once`,()=>{
 const e=rows.find(r=>r.key===`materials/${id}`).e;
 assert.deepEqual(e.sections.find(s=>s.id==='context').blocks,w.intro);
 for(const [index,s]of w.sections.entries())assert.deepEqual(e.sections.filter(s=>s.id===`materials-${index}`).map(s=>s.blocks),[s.blocks]);
 assert.deepEqual(e.practice,w.practice);assert.deepEqual(e.sources,w.sources);
 assert.deepEqual(e.sections.find(s=>s.id==='model-limits')?.blocks.map(b=>b.text)??[],w.notes);
});
test('new manufacturing continuations reach the next track and finally the glider',()=>{
 assert.deepEqual(next,['manufacturing-201','manufacturing-301','manufacturing-401','glider',null]);
});
test('worked openings resolve their original givens',()=>{
 near(Math.hypot(15,40),42.7,.03);near(Math.atan2(40,15)*180/Math.PI,69.4,.05);
 near(2000*40*Math.cos(20*Math.PI/180)/1000,75.175,.001);
 assert.match(text('physics/veccomp'),/42.7/);assert.match(text('physics/work'),/75.2|75,175|75 kJ/);assert.match(text('physics/equilibrium'),/600 N/);
});
test('practice distinguishes force, frames and resonance definitions',()=>{
 near(80*4/.02,16000,.001);near(80*4/.2,1600,.001);
 assert.match(text('physics/impulse'),/ground|weight/);assert.match(text('physics/conserve'),/bank/);
 near(1/Math.hypot(1-3**2,2*.05*3),.125,.001);
 assert.match(text('physics/reswaves'),/displacement ratios, not force transmissibility/);
});
test('uncertainty and sample calculations use stated assumptions',()=>{
 near(Math.hypot(2,2*1),2.828,.001);near(15000/(Math.PI*10**2/4)*Math.hypot(.02,.02),5.4,.01);
 const readings=[11.8,12.1,12.2,12.4,13.5],mean=readings.reduce((a,b)=>a+b)/5;
 const s=Math.sqrt(readings.reduce((a,b)=>a+(b-mean)**2,0)/4);
 near(mean,12.4,1e-8);near(s,.652,.001);near(2.776*s/Math.sqrt(5),.81,.01);near((13.5-mean)/s,1.69,.01);
 assert.match(text('engineering/smallsample'),/1.69/);
});
test('manufacturing practice preserves dimensional and yield reasoning',()=>{
 near(24*200*.8/(300/60)/1000,.768,.0001);
 near(.98**20,.668,.001);near(.985**20,.739,.001);near(.98**15,.739,.001);
 near(2*Math.hypot(.06,.07),.1844,.0001);
 assert.match(text('manufacturing-401/takt'),/Customer takt remains 5 min/);
 assert.match(text('manufacturing-301/bonus'),/0.25/);
});
