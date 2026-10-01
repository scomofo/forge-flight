import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {parseBlocks,splitLessons,parseLesson} from './lib/walkthrough-markdown.mjs';
const {walkthroughs,lessons,numeric}=JSON.parse(execFileSync(process.execPath,['--experimental-strip-types','--input-type=module','-e',`
import {materialsWalkthroughs} from './src/course/materials-walkthroughs.ts';
import {lessonsFor} from './src/course/catalog.ts';
import {arrheniusD,caseDepth,diffusionLength} from './src/course/diffusion.ts';
const D=arrheniusD(2.3e-5,148e3,1223.15);
console.log(JSON.stringify({walkthroughs:materialsWalkthroughs,lessons:lessonsFor('materials').map(l=>({id:l.id,index:l.index,title:l.title})),numeric:{D,depth:caseDepth(1.1,.2,.4,D,14400),scale:diffusionLength(D,14400)}}));
`],{encoding:'utf8',maxBuffer:8e6}));
const raw=readFileSync(new URL('../docs/lesson-sources/materials.txt',import.meta.url),'utf8');
const reviewed=readFileSync(new URL('../docs/lesson-sources/materials-reviewed.md',import.meta.url),'utf8');
const manifest=JSON.parse(readFileSync(new URL('../docs/materials-import-manifest.json',import.meta.url),'utf8'));
const original=splitLessons(raw);
const allBlocks=w=>[...w.intro,...w.sections.flatMap(s=>s.blocks),...(w.practice?.prompt??[]),...(w.practice?.answer??[])];
const countTables=blocks=>blocks.reduce((n,b)=>n+(b.kind==='table'?1:b.kind==='list'?b.items.reduce((s,i)=>s+countTables(i.children??[]),0):0),0);
const near=(a,b,tolerance)=>assert.ok(Math.abs(a-b)<=tolerance,`${a} not within ${tolerance} of ${b}`);

test('all 30 materials IDs are mapped, in order, without creating course lessons',()=>{
 assert.equal(lessons.length,30);assert.deepEqual(Object.keys(walkthroughs),lessons.map(l=>l.id));
 assert.equal(manifest.lessonCount,30);assert.equal(manifest.sectionCount,218);assert.equal(manifest.tableCount,103);assert.equal(manifest.practiceCount,29);
});
test('exact upload and reviewed hashes are recorded',()=>{
 const hash=s=>createHash('sha256').update(s).digest('hex');
 assert.equal(hash(raw),manifest.sourceSha256);assert.equal(hash(reviewed),manifest.reviewedSha256);
});
for(const [i,lesson] of lessons.entries())test(`materials/${lesson.id}: sections, tables, practice and identity survive import`,()=>{
 const w=walkthroughs[lesson.id],o=parseLesson(original[i],lesson.id);
 assert.equal(w.lessonId,lesson.id);assert.equal(w.lessonNumber,lesson.index);
 assert.equal(w.sections.length,o.sections.length);assert.equal(countTables(allBlocks(w)),countTables(allBlocks(o)));
 assert.equal(Boolean(w.practice),lesson.index<30);assert.equal(Boolean(w.practice),Boolean(o.practice));
 assert.ok(w.intro.length);assert.ok(w.sections.every(s=>s.heading&&s.blocks.length));
 if(w.practice){assert.ok(w.practice.prompt.length);assert.ok(w.practice.answer.length);}
 const text=JSON.stringify(w);assert.doesNotMatch(text,/The tab is on|Do you want me to (?:keep|carry)|I went through all 30/);
 assert.doesNotMatch(text,/## Materials 101/,'joined heading leaked into preceding lesson');
 for(const b of allBlocks(w))if(b.kind==='table')for(const row of b.rows)assert.equal(row.length,b.columns.length);
});
test('importer output is deterministic and not stale',()=>{
 execFileSync(process.execPath,['scripts/import-materials-walkthroughs.mjs','--check'],{stdio:'pipe'});
});
test('partial and duplicate source exports fail loudly',()=>{
 assert.throws(()=>splitLessons(raw.split('Lesson 15:')[0]),/Expected 30/);
 assert.throws(()=>splitLessons(raw.replace('Lesson 15:','Lesson 14:')),/Missing, duplicate/);
});
test('nested ordered/unordered list items are preserved',()=>{
 const blocks=parseBlocks('1. Choose.\n   - First\n   - Second\n2. Check.');
 assert.equal(blocks[0].ordered,true);assert.equal(blocks[0].items.length,2);assert.equal(blocks[0].items[0].children[0].items.length,2);
});
test('tables preserve empty header and cells and reject malformed rows',()=>{
 const b=parseBlocks('| | B |\n|---|---|\n| A | |')[0];assert.deepEqual(b.columns,['','B']);assert.deepEqual(b.rows,[['A','']]);
 assert.throws(()=>parseBlocks('| A | B |\n|---|---|\n| 1 |'),/Malformed table/);
});
test('raw HTML stays a text block for React escaping',()=>{
 assert.deepEqual(parseBlocks('<script>alert(1)</script>'),[{kind:'paragraph',text:'<script>alert(1)</script>'}]);
 const component=readFileSync(new URL('../src/components/lesson-walkthrough.tsx',import.meta.url),'utf8');
 assert.doesNotMatch(component,/dangerouslySetInnerHTML|localStorage|useProgress|\bmark\(/);
});
test('practice answer on same line is split from question',()=>{
 const p=parseLesson({number:1,title:'T',body:'Intro\n\n### A\nBody\n\n**Try one:** What is 2+2? You should get 4.'},'example');
 assert.equal(p.practice.prompt[0].text,'What is 2+2?');assert.equal(p.practice.answer[0].text,'You should get 4.');
});
test('figure definition and grading code are not replaced by reading imports',()=>{
 const view=readFileSync(new URL('../src/components/lesson-view.tsx',import.meta.url),'utf8');
 assert.match(view,/lesson\.track === "materials" \? materialsWalkthroughs\[lesson\.id\]/);
 assert.match(view,/LessonWalkthroughPanel key=\{key\}/);assert.match(view,/<ReadFlow lesson=\{lesson\}/);
 assert.match(view,/onResult=\{\(n\) => mark\(key, n\)\}/);
});
test('diffusion length and concentration-defined depth remain distinct and correct',()=>{
 near(numeric.D,1.0994e-11,1e-15);near(numeric.scale*1000,.7958,.0001);near(numeric.depth*1000,.6869,.0001);
 const text=JSON.stringify(walkthroughs.diffusion);assert.match(text,/interstitial/);assert.match(text,/unit area per second/);assert.match(text,/not the same/);
});
test('Hall-Petch examples and practice use metres',()=>{
 near(100+.5/Math.sqrt(100e-6),150,1e-8);near(100+.5/Math.sqrt(25e-6),200,1e-8);
 near(100+.5/Math.sqrt(50e-6),171,1);near(100+.5/Math.sqrt(10e-6),258,1);
 near(110+.65/Math.sqrt(10e-6),316,1);
});
test('fatigue examples and practice arithmetic use reversals consistently',()=>{
 const n=s=>.5*(s/900)**-10;near(n(300),29500,30);near(n(400),1660,3);near(n(250),183000,200);
 near(10000/n(300)+50000/n(250),.61,.004);
 assert.match(JSON.stringify(walkthroughs.fatigue),/damage budget/);
});
test('allowable example and sample spread have correct arithmetic without certification',()=>{
 const data=[872,879,885],mean=data.reduce((a,b)=>a+b)/3;
 const s=Math.sqrt(data.reduce((a,b)=>a+(b-mean)**2,0)/2);
 near(mean-2*s,866,1);near((mean-2*s)/1.5,577,1);
 assert.match(JSON.stringify(walkthroughs.allowables),/does not establish a certified lower bound/);
});
test('spar chain is reproducible from the supplied geometry and properties',()=>{
 const load=.1*9.81*2.5/2,I=.004*.006**3/12,M=load*.125;
 near(I*1e12,72,1e-8);near(M*.003/I/1e6,6.39,.01);
 const droop=E=>(load/.25)*.25**4/(8*E*I)*1000;
 near(droop(3e9),11.1,.02);near(droop(71.7e9),.464,.001);near(droop(135e9),.246,.001);
 near(droop(3e9)*(6/8)**3,4.68,.01);near(160*.004*.008*.25*1000,1.28,1e-8);
});
test('phase fractions and physical bounds are respected',()=>{
 const cL=(1220-1085)/3.7,cS=(1220-1085)/3.2;
 const liquid=(cS-40)/(cS-cL);near(liquid,.39,.01);assert.ok(liquid>=0&&liquid<=1);
 near((61.9-40)/(61.9-19.2),.513,.001);
});
test('index and embodied-energy examples retain their unit basis',()=>{
 near(Math.cbrt(10)/.6,3.59,.01);near(Math.cbrt(69)/2.7,1.52,.01);
 near((400-90)/1.5*1000,206667,1);near(70e9*9e-6*100/1e6,63,1e-8);
});
test('known unsafe shortcuts are corrected in the student copy',()=>{
 const text=JSON.stringify(walkthroughs);
 assert.match(text,/silicon carbide is a semiconductor/i);
 assert.doesNotMatch(text,/any crack is safe|wrong everywhere|it effectively lasts forever|is a bookkeeping effect/);
 assert.match(text,/stop-drilling is not a general repair approval/);
 assert.match(text,/not all polymers operate below Tg/);
 assert.match(text,/exceeds this lesson/);
});
