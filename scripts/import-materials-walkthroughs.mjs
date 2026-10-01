/** Deterministic build-time import. No user-state writes or runtime Markdown. */
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { splitLessons, parseLesson } from './lib/walkthrough-markdown.mjs';
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const read=p=>readFileSync(resolve(root,p),'utf8');
const sha=text=>createHash('sha256').update(text).digest('hex');
const source=read('docs/lesson-sources/materials.txt');
const reviewed=read('docs/lesson-sources/materials-reviewed.md');
const review=JSON.parse(read('docs/lesson-sources/materials-review.json'));
assert.equal(sha(source),review.sourceSha256,'Review belongs to a different source upload');
const map=JSON.parse(execFileSync(process.execPath,['--experimental-strip-types','--input-type=module','-e',`import {lessonsFor} from './src/course/catalog.ts';console.log(JSON.stringify(lessonsFor('materials').map(l=>({id:l.id,index:l.index,title:l.title}))));`],{cwd:root,encoding:'utf8'}));
const original=splitLessons(source),edited=splitLessons(reviewed);
assert.equal(map.length,30);
const sources={
  1:[{label:'Diamond graphitization — original study (abstract)',url:'https://www.nature.com/articles/185522a0'}, {label:'Glass transition — University of Bath',url:'https://www.bath.ac.uk/announcements/another-way-to-measure-the-glass-transition-in-polymers/'}, {label:'SiC semiconductor exception — NIST',url:'https://www.nist.gov/publications/characterization-and-modeling-silicon-carbide-power-devices'}],
  2:[{label:'Tungsten processing and room-temperature ductility — original study',url:'https://impact.ornl.gov/en/publications/tungsten-w-laminate-pipes-for-innovative-high-temperature-energy-/'}],
  3:[{label:'Silicon carbide is a semiconductor — NIST',url:'https://www.nist.gov/publications/characterization-and-modeling-silicon-carbide-power-devices'}],
  6:[{label:'Glass transition and rubbery behaviour — University of Bath',url:'https://www.bath.ac.uk/announcements/another-way-to-measure-the-glass-transition-in-polymers/'}],
  8:[{label:'Diffusion mechanisms and flux — Cambridge DoITPoMS',url:'https://eng.libretexts.org/Workbench/Materials_Science_for_Electrical_Engineering/02%3A_Solids/2.02%3A_Diffusion/2.2.02%3A_Fick%27s_First_Law_of_Diffusion'}],
  10:[{label:'Offset yield construction — Mississippi State University',url:'https://www.ae.msstate.edu/vlsm/materials/strength_chars/yield.htm'},{label:'0.2% proof stress — ZwickRoell',url:'https://www.zwickroell.com/industries/materials-testing/tensile-test/yield-point/'}],
  12:[{label:'Population tolerance bounds — NIST',url:'https://www.itl.nist.gov/div898/handbook/prc/section2/prc263.htm'}],
  19:[{label:'Phase diagrams and the lever rule — Cambridge DoITPoMS',url:'https://www.doitpoms.ac.uk/tlplib/phase-diagrams/printall.php'}],
  20:[{label:'Phase mass balance — Cambridge DoITPoMS',url:'https://www.doitpoms.ac.uk/tlplib/phase-diagrams/printall.php'}],
  21:[{label:'Eutectic equilibrium — Princeton University',url:'https://www.princeton.edu/~maelabs/mae324/glos324/eutectic.htm'}],
  23:[{label:'Polymer service above and below Tg — Protolabs',url:'https://www.protolabs.com/en-gb/resources/design-tips/glass-transition-temperature-of-polymers/'}],
};
const normalize=s=>s.toLowerCase().replace(/[^a-z0-9]/g,'');
const items=edited.map((item,i)=>{
 const entry=map[i];assert.equal(item.number,entry.index);
 assert.equal(normalize(item.title),normalize(entry.title),`Wrong lesson mapping: ${item.title}`);
 const notes=[...(review.notes[item.number]??[])];
 return parseLesson(item,entry.id,notes,sources[item.number]??[]);
});
const blocks=item=>[...item.intro,...item.sections.flatMap(s=>s.blocks),...(item.practice?.prompt??[]),...(item.practice?.answer??[])];
function countTables(bs){return bs.reduce((n,b)=>n+(b.kind==='table'?1:b.kind==='list'?b.items.reduce((s,i)=>s+countTables(i.children??[]),0):0),0);}
const records=items.map((item,i)=>{
 const orig=parseLesson(original[i],map[i].id);
 assert.equal(item.sections.length,orig.sections.length,`Dropped sections in ${item.lessonId}`);
 assert.equal(countTables(blocks(item)),countTables(blocks(orig)),`Dropped a table in ${item.lessonId}`);
 assert.equal(Boolean(item.practice),Boolean(orig.practice),`Dropped practice in ${item.lessonId}`);
 return {track:'materials',lessonId:item.lessonId,lessonNumber:item.lessonNumber,title:item.title,source:'materials.txt',status:'integrated',sections:item.sections.length,tables:countTables(blocks(item)),practice:!!item.practice};
});
const manifest={source:'materials.txt',sourceSha256:sha(source),reviewedSha256:sha(reviewed),lessonCount:items.length,sectionCount:records.reduce((n,r)=>n+r.sections,0),tableCount:records.reduce((n,r)=>n+r.tables,0),practiceCount:records.filter(r=>r.practice).length,reviewEditCount:review.edits.length,lessons:records};
const outputs={
 'src/course/materials-walkthroughs.ts':`// Generated by scripts/import-materials-walkthroughs.mjs. Edit the reviewed Markdown, then regenerate.\nimport type { LessonWalkthrough } from './walkthrough-types.ts';\nexport const materialsWalkthroughs: Readonly<Record<string, LessonWalkthrough>> = ${JSON.stringify(Object.fromEntries(items.map(i=>[i.lessonId,i])),null,2)};\n`,
 'docs/materials-import-manifest.json':JSON.stringify(manifest,null,2)+'\n',
};
for(const [path,text] of Object.entries(outputs)){
 if(process.argv.includes('--check')) assert.equal(read(path),text,`${path} is stale; rerun the importer`);
 else {mkdirSync(resolve(root,path,'..'),{recursive:true});writeFileSync(resolve(root,path),text);}
}
console.log(JSON.stringify({mode:process.argv.includes('--check')?'check':'write',...Object.fromEntries(Object.entries(manifest).filter(([k])=>k!=='lessons'))},null,2));
