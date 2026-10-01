// Diagnostic probe for the original audit entry; no product-code mutations.
import { readFile, writeFile, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
let s = await readFile('scripts/browser-curriculum-audit.mjs', 'utf8');
s = s.replace('const benches = await registeredBenches();', "const benches = Array(3000).fill('curveread');");
s = s.replace('for (const lesson of lessons)', 'for (const lesson of [])');
s = s.replace('for (const mission of missions)', 'for (const mission of [])');
s = s.replace("[['desktop', 1280, 900], ['mobile', 390, 844]]", "[['desktop', 1280, 900]]");
s = s.replace("createRoot(document.getElementById('root')!).render", "(window as any).__audit.router=router;createRoot(document.getElementById('root')!).render");
s = s.replace('const page = await ctx.newPage(), errors = [];', `const page = await ctx.newPage(), errors = [];
page.__diagnostics = [];
for (const event of ['console', 'pageerror', 'request', 'requestfailed', 'requestfinished', 'response']) page.on(event, x => {
  const detail = event === 'console' ? { type:x.type(),text:x.text() } : event === 'response' ? { url:x.url(),status:x.status(),headers:x.headers() } : event === 'requestfailed' ? { url:x.url(),error:x.failure() } : ['request','requestfinished'].includes(event) ? { url:x.url(),type:x.resourceType() } : { message:x.message };
  page.__diagnostics.push({event,time:Date.now(),...detail});
});`);
s = s.replace('const begin = checks.length;', 'const begin = checks.length; page.__diagnostics.length = 0;');
s = s.replace('failures.push(detail); cases.push', `detail.diagnostics = [...page.__diagnostics];
detail.state = await page.evaluate(() => {
  const r=window.__audit?.router;
  return {readyState:document.readyState,html:document.documentElement.outerHTML,auditReady:!!window.__audit,
    resources:performance.getEntriesByType('resource').map(e=>({name:e.name,type:e.initiatorType,start:e.startTime,duration:e.duration,bytes:e.decodedBodySize,status:e.responseStatus})),
    router:r?{status:r.state.status,isLoading:r.state.isLoading,matches:r.state.matches.map(m=>({id:m.id,status:m.status,error:String(m.error||'')}))}:null};
}).catch(e=>({error:String(e)}));
failures.push(detail); cases.push`);
s = s.replace('for (const id of benches) {', 'for (const id of benches) { if (failures.length) break;');
const file = 'scripts/__curveread_probe.mjs';
try {
  await writeFile(file, s);
  const run = spawnSync(process.execPath, ['--experimental-strip-types','--import','./scripts/register-alias.mjs',file], { stdio:'inherit' });
  process.exitCode = run.status ?? 1;
} finally { await rm(file, { force:true }); }
