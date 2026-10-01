/** Regenerate with Node 22: node --experimental-strip-types scripts/course-enrichment-coverage.mjs */
import assert from 'node:assert/strict';
import {readFileSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {lessons} from '../src/course/catalog.ts';
import {getLessonEnrichment} from '../src/course/lesson-enrichment.ts';
const sourcePath='docs/lesson-sources/axiom-course-changes-2026-09-30.md';
const source=readFileSync(sourcePath,'utf8'), lines=source.split('\n');
const start=lines.findIndex(line=>line.startsWith('## 4.'));
const end=lines.findIndex(line=>line.startsWith('### Forge'));
const entries=[];
for(let i=start;i<end;i++)if(/^\*\*[^*]+\*\*/.test(lines[i])&&!lines[i].startsWith('**Shelf job**')){
 let j=i+1;while(j<end&&!/^(\*\*|###)/.test(lines[j]))j++;
 entries.push({line:i+1,request:lines.slice(i,j).join('\n').trim()});
}
const trackOrder=['physics','materials','engineering','manufacturing','manufacturing-201','manufacturing-301','manufacturing-401'];
const enriched=[...lessons].sort((a,b)=>trackOrder.indexOf(a.track)-trackOrder.indexOf(b.track)||a.index-b.index).map(lesson=>({lesson,enrichment:getLessonEnrichment(lesson)})).filter(row=>row.enrichment);
assert.equal(entries.length,110,'Transcript lesson list changed; review the source mapping');
assert.equal(enriched.length,110,'Every transcript lesson must be implemented');
const tables=blocks=>blocks.reduce((n,b)=>n+(b.kind==='table'?1:b.kind==='list'?b.items.reduce((sum,item)=>sum+tables(item.children??[]),0):0),0);
const rows=enriched.map(({lesson,enrichment},i)=>({
 key:`${lesson.track}/${lesson.id}`,title:lesson.title,transcriptLine:entries[i].line,requested:entries[i].request,
 sections:enrichment.sections.map(s=>({id:s.id,heading:s.heading,at:s.at,mode:s.mode,tables:tables(s.blocks)})),
 practice:Boolean(enrichment.practice),practiceTables:tables([...(enrichment.practice?.prompt??[]),...(enrichment.practice?.answer??[])]),
 contentSha256:createHash('sha256').update(JSON.stringify(enrichment)).digest('hex'),
}));
const manufacturingSource='docs/lesson-sources/manfu.txt';
const result={manufacturingSource,manufacturingSourceSha256:createHash('sha256').update(readFileSync(manufacturingSource)).digest('hex'),source:sourcePath,sourceSha256:createHash('sha256').update(source).digest('hex'),lessonCount:rows.length,
 inlineSections:rows.reduce((n,r)=>n+r.sections.filter(s=>s.mode==='inline').length,0),
 contextualHelp:rows.reduce((n,r)=>n+r.sections.filter(s=>s.mode==='help').length,0),
 practices:rows.filter(r=>r.practice).length,
 additionalItems:[
 {request:'§1 and §3.1–3.3: trig, radians, measurement error, vector feedback',implementation:['src/course/math.ts','src/components/bench/math-labs.tsx'],status:'Already present; retained'},
 {request:'§3.4: pendulum units and dimension checks',implementation:['src/components/figures/physics-a.tsx'],status:'Already present; retained'},
 {request:'§2.1 and glider: margin regimes, constraint table, hand mass check, design levers',implementation:['src/forge/content/catalog.ts','src/components/forge/bench.tsx'],status:'Integrated into Brief and Design'},
 {request:'§2.2: finish survey, tow-work and scaffold openings',implementation:['src/course/physics-enrichment.ts'],status:'Integrated as opening explanations with stated assumptions'},
 {request:'§2.3: explain shelf material elimination',implementation:['src/components/shelf-job.tsx'],status:'Visible with the requirements'},
 {request:'§2.4: continue after shelf and Manufacturing 101–401',implementation:['src/routes/learn/job.tsx','src/components/shelf-job.tsx','src/components/section-continuation.tsx','src/components/quiz.tsx','src/components/lesson-view.tsx'],status:'Next-section links available'},
 ],lessons:rows};
const output=JSON.stringify(result,null,2)+'\n',target='docs/course-enrichment-coverage.json';
if(process.argv.includes('--check'))assert.equal(readFileSync(target,'utf8'),output,'Coverage is stale; regenerate and review');
else writeFileSync(target,output);
console.log(JSON.stringify({lessons:result.lessonCount,inline:result.inlineSections,help:result.contextualHelp,practice:result.practices,checked:process.argv.includes('--check')}));
