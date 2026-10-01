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
let Panel;try{Panel=(await import(`file://${file}`)).LessonWalkthroughPanel;}finally{unlinkSync(file);}
const data=JSON.parse(execFileSync(process.execPath,['--experimental-strip-types','--input-type=module','-e',`import{materialsWalkthroughs}from'./src/course/materials-walkthroughs.ts';console.log(JSON.stringify(Object.values(materialsWalkthroughs)));`],{encoding:'utf8',maxBuffer:8e6}));
for(const w of data)test(`render materials/${w.lessonId}: semantic sections and separate answer`,()=>{
 const html=renderToStaticMarkup(React.createElement(Panel,{walkthrough:w}));
 assert.match(html,new RegExp(`data-lesson-walkthrough="${w.lessonId}"`));
 assert.equal((html.match(/id="walkthrough-[^"]+-section-/g)||[]).length,w.sections.length);
 assert.equal((html.match(/data-walkthrough-answer/g)||[]).length,w.practice?1:0);
 assert.doesNotMatch(html,/<details[^>]*\bopen[=> ]/,'do not reveal practice answers initially');
 assert.doesNotMatch(html,/\*\*[A-Za-z]/,'bold Markdown should be rendered');
 assert.match(html,/Walk me through this lesson/);
});
test('render escapes HTML in paragraphs, tables, lists and answer text',()=>{
 const payload='<img src=x onerror=alert(1)>';
 const w={lessonId:'safe',lessonNumber:1,title:payload,intro:[{kind:'paragraph',text:payload}],notes:[],sections:[{heading:'A',blocks:[{kind:'table',columns:['A'],rows:[[payload]]},{kind:'list',ordered:false,items:[{text:payload}]}]}],practice:{prompt:[{kind:'paragraph',text:'Q'}],answer:[{kind:'paragraph',text:payload}]}};
 const html=renderToStaticMarkup(React.createElement(Panel,{walkthrough:w}));
 assert.doesNotMatch(html,/<img/);assert.match(html,/&lt;img/);
});
