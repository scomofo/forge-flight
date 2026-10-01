/** Server-render the actual component, independent of browser navigation policy. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,unlinkSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const here=dirname(fileURLToPath(import.meta.url));
const source=readFileSync(join(here,'../src/components/lesson-walkthrough.tsx'),'utf8');
const code=ts.transpileModule(source,{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
// Put generated module beside scripts so package imports resolve normally.
const file=join(here,`.walkthrough-render-${process.pid}.mjs`);writeFileSync(file,code);
let Blocks;try{Blocks=(await import(`file://${file}`)).LessonBlocks;}finally{unlinkSync(file);}
const data=JSON.parse(execFileSync(process.execPath,['--experimental-strip-types','--input-type=module','-e',`import{materialsWalkthroughs}from'./src/course/materials-walkthroughs.ts';console.log(JSON.stringify(Object.values(materialsWalkthroughs)));`],{encoding:'utf8',maxBuffer:8e6}));
const allBlocks=w=>[...w.intro,...w.sections.flatMap(s=>s.blocks),...(w.practice?.prompt??[]),...(w.practice?.answer??[])];
const countTables=blocks=>blocks.reduce((n,b)=>n+(b.kind==='table'?1:b.kind==='list'?b.items.reduce((s,i)=>s+countTables(i.children??[]),0):0),0);
for(const w of data)test(`render materials/${w.lessonId}: safe formatting and accessible tables`,()=>{
 const blocks=allBlocks(w),html=renderToStaticMarkup(React.createElement(Blocks,{blocks,label:w.title}));
 assert.equal((html.match(/<table /g)||[]).length,countTables(blocks));
 assert.equal((html.match(/role="region"/g)||[]).length,countTables(blocks));
 assert.equal((html.match(/tabindex="0"/g)||[]).length,countTables(blocks));
 assert.doesNotMatch(html,/\*\*[A-Za-z]/,'bold Markdown should be rendered');
});
test('render escapes HTML in paragraphs, tables and nested lists',()=>{
 const payload='<img src=x onerror=alert(1)>';
 const blocks=[{kind:'paragraph',text:payload},{kind:'table',columns:['A'],rows:[[payload]]},{kind:'list',ordered:false,items:[{text:payload,children:[{kind:'paragraph',text:payload}]}]}];
 const html=renderToStaticMarkup(React.createElement(Blocks,{blocks,label:'Safe text'}));
 assert.doesNotMatch(html,/<img/);assert.equal((html.match(/&lt;img/g)||[]).length,4);
});
