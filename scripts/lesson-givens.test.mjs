import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

const data = JSON.parse(execFileSync(process.execPath, ['--experimental-strip-types','--input-type=module','-e', `
import {lessons} from './src/course/catalog.ts';
import {exampleContexts} from './src/course/example-context.ts';
import {getConceptHelp} from './src/course/concept-help.ts';
import {LADDER_INPUTS,bonusPosition,ladderCreepHours,ladderModeHz,ladderWhirlRpm,ladderCrackGrowth,ladderToolLifeMinutes} from './src/course/ladder-inputs.ts';
import {BEAM_CASE,beamDeflectionM,beamMassKg,BRACKET_ALTERNATIVES,BRACKET_CRITERIA,rankAlternatives} from './src/course/optimization.ts';
import {REFERENCE_SPAR,SPAR_MATERIALS} from './src/course/matsynthesis.ts';
import {CAP_REFERENCE,CAP_MATERIALS,CAP_MISMATCH} from './src/course/capstone.ts';
const refs=lessons.flatMap(l=>[...(l.exampleHelp??[]),...l.ideas.flatMap(i=>i.help??[])]).filter(h=>'concept' in h);
const invalidBonus=[NaN,Infinity,9.99].map(x=>{try{bonusPosition(x);return false}catch{return true}});
console.log(JSON.stringify({lessons,contexts:exampleContexts,missingHelp:refs.filter(h=>!getConceptHelp(h.concept)),
 helpers:{bonus:[bonusPosition(10),bonusPosition(10.2)],invalidBonus,creep:[ladderCreepHours(100,800),ladderCreepHours(200,800),ladderCreepHours(100,850)],mode:[ladderModeHz(.6),ladderModeHz(1.2)],whirl:[ladderWhirlRpm(.4),ladderWhirlRpm(.8)],crack:[ladderCrackGrowth(.5),ladderCrackGrowth(2),ladderCrackGrowth(50)],tool:[ladderToolLifeMinutes(100),ladderToolLifeMinutes(150)],beam:[beamDeflectionM(52),beamDeflectionM(53),beamMassKg(53)]},
 inputs:LADDER_INPUTS,beam:BEAM_CASE,spar:REFERENCE_SPAR,materials:SPAR_MATERIALS,cap:CAP_REFERENCE,capMaterials:CAP_MATERIALS,mismatch:CAP_MISMATCH,ranked:rankAlternatives(BRACKET_ALTERNATIVES,BRACKET_CRITERIA)}));
`], {encoding:'utf8'}));
const lesson = key => data.lessons.find(l=>`${l.track}/${l.id}`===key);
const text = key => JSON.stringify({lesson:lesson(key),context:data.contexts[key]});
const close = (a,b,t=1e-8)=>assert.ok(Math.abs(a-b)<=t,`${a} ≠ ${b} (tolerance ${t})`);
const source = file => readFileSync(file,'utf8');

test('all 166 lesson identities, benches, pass marks, answer positions and reviewed option text remain stable',()=>{
 const {contracts}=JSON.parse(source('scripts/fixtures/lesson-assessment-contract.json'));
 assert.equal(data.lessons.length,contracts.length);
 for(const c of contracts){
  const l=lesson(c.key); assert.ok(l,c.key);
  assert.equal(l.index,c.index,c.key);assert.equal(l.bench,c.bench,c.key);assert.equal(l.passAt??3,c.passAt,c.key);
  assert.deepEqual(l.checks.map(c=>c.answer),c.answers,c.key);
  assert.equal(createHash('sha256').update(JSON.stringify(l.checks.map(c=>c.options))).digest('hex'),c.optionsSha256,c.key);
 }
});
test('every authored context points at a real lesson and contains complete, renderable inputs and tables',()=>{
 assert.equal(Object.keys(data.contexts).length,55);
 for(const [key,c] of Object.entries(data.contexts)){
  assert.ok(lesson(key),key);assert.ok(c.inputs.length,key);
  for(const i of c.inputs){assert.ok(i.label?.trim());assert.ok(i.value?.trim());assert.ok(['Given','Reference','Assumed','Calculated','Measured example'].includes(i.origin));}
  assert.equal(new Set(c.inputs.map(i=>i.label)).size,c.inputs.length,`${key} duplicate labels`);
  for(const t of c.tables??[]){assert.ok(t.caption);assert.ok(t.columns.length>1);assert.ok(t.rows.length);for(const row of t.rows)assert.equal(row.length,t.columns.length,key);}
 }
});
test('no lesson help reference is silently missing from the registry',()=>assert.deepEqual(data.missingHelp,[]));
test('essential input panels precede the figure and the worked-example arithmetic',()=>{
 const view=source('src/components/lesson-view.tsx');
 assert.match(view,/<ExampleInputs[^>]*compact\s*\/>[\s\n]*<Figure\s*\/>/);
 const example=view.split('function Example(')[1].split('function Move(')[0];
 assert.ok(example.indexOf('<ExampleInputs')<example.indexOf('<ol'));
 assert.match(view,/idea\.formulaNote/);
 const ui=source('src/components/example-inputs.tsx');
 assert.match(ui,/scope="col"/);assert.match(ui,/scope="row"/);assert.match(ui,/overflow-x-auto/);assert.match(ui,/aria-labelledby=\{headingId\}/);
});
test('the learner-reported notation gaps have local definitions and complete exponent working',()=>{
 const p=lesson('math/powers');
 assert.match(p.ideas[2].formulaNote,/→ means “becomes” here/);
 assert.match(p.ideas[2].formulaNote,/⇒ means “implies[.”]/);
 assert.match(p.ideas[2].formulaNote,/1000× only if density/);
 assert.match(p.start,/cross-section geometry/);assert.match(p.start,/length²/);
 assert.match(p.ideas[0].body,/150 as 1\.5 × 10²/);
 assert.match(p.checks[1].why,/150,000,000/);
 assert.match(p.checks[0].why,/−9 \+ 3 = −6/);
 assert.match(p.checks[0].why,/10⁻⁶ also passes/);
});
test('audited first-use quantities are defined locally, including scientific and empirical constants',()=>{
 const expected={
  'physics/projectiles':['9.81','4.905','−g'], 'physics/elastic':['200 × 10⁹','250 MPa'],
  'physics/bending':['200 GPa','2 mm'], 'physics/lift':['1.225 kg/m³','atmospher'],
  'physics/thermal':['Stefan–Boltzmann','not mechanical stress','emitted'],
  'materials/crystal':['6.02214076','26.98','not from geometry alone'],
  'materials/diffusion':['148,000','8.314','273.15','function lookup'],
  'materials/fracture':['Y = 1','half-length','fatigue'],
  'materials/creep':['C = 20','same applied stress','hours'],
  'materials/phasediagram':['1085','3.7','20–45','not 0.30'],
  'materials/leverrule':['1085','3.2','teaching'],
  'materials/famlook':['E (GPa)','ρ (g/cm³)','along'],
  'materials/sustain':['200 MJ/kg','10 MJ/kg','scenario'],
  'engineering/loadpath':['equal stiffness','no load eccentricity'],
  'engineering/bending':['34 mm','101,972','5099'],
  'engineering/buckle':['21 mm','144.5','9628','K = 2'],
  'engineering/interfaces':['68,900','24.8','classroom assumptions'],
  'engineering/processes':['hypothetical','12,000','current market'],
  'engineering/smallsample':['0.975','2.776','0.05','approximately normal'],
  'engineering/doeplan':['9.50','categorical','8.6','hypothetical'],
  'engineering/paramsweep':['70 GPa','2700','5.724'],
  'engineering/safetyfactor':['Fictional teaching example','not a real code'],
  'engineering/standards':['fictional teaching excerpt','not an identified real'],
  'manufacturing/chip':['2500 N/mm²','supplied classroom'],
  'manufacturing/freeze':['27,200','D/6','shared face'],
  'manufacturing/spread':['standard deviation','3σ = 0.075','0.04 mm'],
  'manufacturing-301/travel':['seconds per minute','joules per kilojoule'],
  'engineering-201/wear':['unit conversion','N/mm²'],
 };
 for(const [key,fragments]of Object.entries(expected))for(const part of fragments)assert.ok(text(key).includes(part),`${key}: ${part}`);
});
test('reference tables are produced from shared simulation inputs, not a conflicting second material list',()=>{
 const s=data.contexts['materials/sparsynth'].tables[0].rows;
 assert.deepEqual(s.map(r=>Number(r[1])),data.materials.map(m=>m.ePa/1e9));
 assert.deepEqual(s.map(r=>Number(r[3])),data.materials.map(m=>m.densityKgM3));
 assert.deepEqual(s.map(r=>Number(r[4])),data.materials.map(m=>m.fos));
 const c=data.contexts['engineering/capmethod'].tables[0].rows;
 assert.deepEqual(c.map(r=>Number(r[1])),data.capMaterials.map(m=>m.ePa/1e9));
 assert.ok(c.every(r=>Number(r[4])===data.cap.fosStrength));
 const scores=data.contexts['engineering/tradestudy'].tables[2].rows;
 assert.deepEqual(scores.map(r=>r.at(-1)),data.ranked.map(a=>a.total.toFixed(3)));
 assert.equal(data.beam.modulusPa,70e9);
});
test('capstone comparison does not invent a prediction error bar or pretend the example is a performed test',()=>{
 for(const key of ['engineering/capmethod','engineering/glidersynth']){
  assert.match(text(key),/hypothetical/i);assert.match(text(key),/uncertainty.*(unquantified|not.*quantified|not yet quantified)/i);
  assert.doesNotMatch(lesson(key).example,/bars (not touching|do not touch)/);
 }
 assert.doesNotMatch(source('src/components/figures/engineering-b.tsx'),/bars (not touching|do not touch)/);
 assert.match(data.mismatch.description,/distributed-load/);
});
test('assembly-time and material-ranking errors are repaired in prose and animation',()=>{
 assert.match(lesson('manufacturing-401/dfa').example,/24 s saving/);
 assert.match(source('src/components/figures/ladder-c.tsx'),/24 s saved/);
 assert.doesNotMatch(source('src/components/figures/ladder-c.tsx'),/saving 16 s|16 s saved/);
 assert.match(lesson('materials/screenrank').example,/index favored carbon/);
});
test('GD&T zone diameter is not confused with radial offset at either test size',()=>{
 close(data.helpers.bonus[0].diameterMm,.2);close(data.helpers.bonus[0].radialMm,.1);
 close(data.helpers.bonus[1].diameterMm,.4);close(data.helpers.bonus[1].radialMm,.2);
 assert.ok(data.helpers.invalidBonus.every(Boolean));
 assert.match(lesson('manufacturing-301/bonus').example,/not 0\.40 mm/);
 assert.match(source('src/components/bench/ladder-labs.tsx'),/Maximum radial offset/);
 assert.doesNotMatch(source('src/components/figures/ladder-c.tsx'),/hole may sit 0\.40 off/);
});

const checks=[
 ['mega and normalization',()=>{close(150*1e6,1.5e8);close(1.5*1e2*1e6,150000000)}],
 ['fourth-power conversion',()=>close(2.4e-9*1000**4,2400)],
 ['scaling length, area, volume',()=>{assert.equal(10**2,100);assert.equal(10**3,1000)}],
 ['bracket volume and supplied density',()=>close(2700*80*50*6/1e9,.0648)],
 ['half of gravity',()=>close(.5*9.81,4.905)],
 ['rod area and stretch',()=>close(15000*2/(Math.PI*.005**2*200e9)*1000,1.9098593171,1e-8)],
 ['ruler deflection',()=>close(5*.3**3/(3*200e9*(.025*.002**3/12))*1000,13.5)],
 ['glider stall speed',()=>close(Math.sqrt(2*.25*9.81/(1.225*.06*1.1)),7.7890273,1e-4)],
 ['water pressure per metre',()=>close(1000*9.81/1000,9.81)],
 ['dynamic pressure',()=>close(.5*1000*10**2/1000,50)],
 ['thermal stress and free growth',()=>{close(200e9*12e-6*50/1e6,120);close(12e-6*50*1000,.6)}],
 ['atomic density with unrounded edge',()=>close(4*26.98/6.02214076e23/(2*Math.SQRT2*143e-10)**3,2.708369668,1e-8)],
 ['Arrhenius prefactor and energy units',()=>close(2.3e-5*Math.exp(-148000/(8.314*1223)),1.1e-11,1e-13)],
 ['fracture half-length',()=>close((50/200)**2/Math.PI,.0198943679,1e-9)],
 ['Larson–Miller rounded working',()=>close(1073*(20+Math.log10(1000)),24679)],
 ['phase boundaries',()=>{close(1085+3.7*30,1196);close(1085+3.2*30,1181)}],
 ['lever-rule rounded endpoints',()=>close((42.2-40)/(42.2-36.5),.3859649123,1e-9)],
 ['spar section and loading',()=>{close(4*6**3/12,72);close(.1*9.81*2.5*.25/4,.15328125)}],
 ['square tube geometry and mass',()=>{close((40**4-34**4)/12/20,5098.6);close(2700*(.04**2-.034**2),1.1988)}],
 ['tube column geometry',()=>{close(Math.PI*(25**2-21**2)/4,144.513262,1e-6);close(Math.PI*(25**4-21**4)/64,9628.1961,1e-4)}],
 ['mismatch one-axis estimate',()=>close(68900*6e-6*60,24.804)],
 ['sample mean and standard error',()=>{const x=[19.4,19.8,19.5,19.9,20.4];const mean=x.reduce((a,b)=>a+b)/5;close(mean,19.8);const s=Math.sqrt(x.reduce((a,b)=>a+(b-mean)**2,0)/4);close(s/Math.sqrt(5),.1760681686,1e-9);close(2.776*s/Math.sqrt(5),.488763,1e-5)}],
 ['DOE grand mean and extra given',()=>{close((8+8.6+8.4+13)/4,9.5);close((8.4+8.6+11+11.2)/4-9.5,.3)}],
 ['trade totals',()=>{assert.equal(data.ranked[0].id,'nylon');close(data.ranked[0].total,.69420289855,1e-9)}],
 ['beam sweep boundary and mass',()=>{assert.ok(data.helpers.beam[0]>.002);assert.ok(data.helpers.beam[1]<.002);close(data.helpers.beam[2],5.724)}],
 ['casting surface and cylinder modulus',()=>{close(2*(120*80+120*20+80*20),27200);close((Math.PI*60**3/4)/(1.5*Math.PI*60**2),10)}],
 ['capability intermediate quantities',()=>{close(6*.025,.15);close(3*.025,.075);close(10.1-10.06,.04);close(.04/.075,.5333333333,1e-9)}],
 ['welding time/energy conversions',()=>{close(20*150/(300/60)/1000,.6);close(20*150/(150/60)/1000,1.2)}],
 ['wear distance conversion',()=>close(1e-4*(200/1000)*(1000*1000),20)],
 ['assembly savings',()=>{close((20+5*8)-(20+2*8),24);close(2*8,16)}],
 ['creep shared model',()=>{close(data.helpers.creep[0],1000);close(data.helpers.creep[1],31.25);close(data.helpers.creep[2],110.15328833,1e-8)}],
 ['beam-frequency shared model',()=>{close(data.helpers.mode[0],127.562918,1e-6);close(data.helpers.mode[0]/data.helpers.mode[1],4)}],
 ['whirl shared model',()=>{close(data.helpers.whirl[0],7329.0376785,1e-6);close(data.helpers.whirl[0]/data.helpers.whirl[1],Math.sqrt(8))}],
 ['crack-growth shared model',()=>{close(data.helpers.crack[0].cycles,856744.258,1);close(data.helpers.crack[1].cycles,377593,1000);close(data.helpers.crack[2].cycles,0)}],
 ['Taylor fit shared model',()=>{close(data.helpers.tool[0],32);close(data.helpers.tool[1],(4/3)**5)}],
];
for(const [name,fn] of checks)test(`givens arithmetic: ${name}`,fn);
