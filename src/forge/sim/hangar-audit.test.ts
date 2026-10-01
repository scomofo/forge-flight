/** Independent closed-form benchmarks for the educational Hangar models.
 * These test the implemented idealizations, not real structures or flight. */
import assert from 'node:assert/strict';
import test from 'node:test';
import { materials, missions, processes, type Mission } from '@/forge/content/catalog.ts';
import { evaluate, runAnalysis, type DesignInput } from './evaluate.ts';

function design(id: string): DesignInput {
  const mission = missions.find(m => m.id === id) as Mission;
  assert.ok(mission, id);
  return structuredClone({ parts: mission.parts, vehicle: mission.vehicle,
    environment: mission.environment, quantity: mission.constraints.quantity ?? 1,
    limits: mission.constraints, fidelity: 'L0', seed: 1 });
}
function close(actual: number, expected: number, relative = 1e-9) {
  assert.ok(Math.abs(actual - expected) <= relative * Math.max(1, Math.abs(expected)), `${actual} != ${expected}`);
}
const run = (d: DesignInput) => evaluate(d, materials, processes);
const passes = (d: DesignInput) => {
  const e = run(d);
  for (const field of ['validInputs', 'passStress', 'passBuckling', 'passMass', 'passCost', 'passDeflection', 'passDfm', 'passAero', 'passStability'] as const) assert.equal(e[field], true, field);
  assert.deepEqual(e.modelWarnings, []);
};

test('standalone fin uses full root-to-tip span, not half of it', () => {
  const e = run(design('water_rocket')), r = e.parts[0];
  const F = 10, L = .1, b = .06, h = .001, E = 2.1e9, I = b * h ** 3 / 12;
  close(r.length_m, L); close(r.inertia_m4, I);
  close(r.stress_MPa, F * L * (h / 2) / I / 1e6);
  close(r.deflection_mm, F * L ** 3 / (3 * E * I) * 1000);
  close(r.mass_g, 1240 * b * h * L * 1000);
  close(r.safetyFactor, .3);
  assert.equal(e.passStress, false); assert.equal(e.passDeflection, false); assert.equal(e.passDfm, false);
  assert.match(e.modelWarnings.join(' '), /out-of-domain/);
});
test('payload uses full rail spacing and simply supported center-load coefficients', () => {
  const e = run(design('payload')), r = e.parts[0];
  const F = 30, L = .2, b = .12, h = .002, E = 2.1e9, I = b * h ** 3 / 12;
  close(r.length_m, L); close(r.stress_MPa, (F * L / 4) * h / 2 / I / 1e6);
  close(r.deflection_mm, F * L ** 3 / (48 * E * I) * 1000);
  close(r.safetyFactor, 1.6);
  assert.equal(e.passStress, false); assert.equal(e.passDeflection, false);
});
test('full-span glider wing still uses one half-span as the cantilever', () => {
  const d = design('glider'), e = run(d), r = e.parts.find(p => p.id === d.vehicle!.wingId)!;
  const wing = d.parts.find(p => p.id === d.vehicle!.wingId)!;
  close(r.length_m, wing.params.span_mm / 2000);
  const F = e.aero!.lift_N / 2, h = wing.params.thickness_mm / 1000;
  close(r.stress_MPa, F * r.length_m * h / 2 / r.inertia_m4 / 1e6);
});
test('RC half-spar benchmark independently reproduces annular geometry and sag', () => {
  const r = run(design('rc_aircraft')).parts[0];
  const I = Math.PI * (.008 ** 4 - .0064 ** 4) / 64;
  close(r.inertia_m4, I);
  close(r.deflection_mm, 6 * .45 ** 3 / (3 * 68.9e9 * I) * 1000);
  close(r.stress_MPa, 6 * .45 * .004 / I / 1e6);
  close(r.mass_g, Math.PI * (.008 ** 2 - .0064 ** 2) / 4 * .45 * 2700 * 1000);
});
for (const [id, modify] of [
  ['water_rocket', (d: DesignInput) => Object.assign(d.parts[0].params, { span_mm: 60, chord_mm: 40, thickness_mm: 3.5 })],
  ['payload', (d: DesignInput) => Object.assign(d.parts[0].params, { span_mm: 150, thickness_mm: 4.8 })],
  ['rc_aircraft', (d: DesignInput) => Object.assign(d.parts[0].params, { outer_mm: 10, wall_mm: 1 })],
  ['drone_arm', (d: DesignInput) => { d.parts[0].materialId = 'al6061'; }],
  ['glider', (d: DesignInput) => { d.vehicle!.cg_fromNose_mm = 150; }],
] as const) test(`${id}: at least one attainable revision meets the unchanged classroom limits`, () => {
  const d = design(id); modify(d); passes(d);
  const m = missions.find(m => m.id === id)!;
  for (const p of d.parts) for (const spec of m.parts.find(x => x.id === p.id)!.specs) {
    assert.ok(p.params[spec.key] >= spec.min && p.params[spec.key] <= spec.max, `${p.id}/${spec.key}`);
  }
});
for (const id of ['water_rocket', 'payload', 'rc_aircraft']) test(`${id}: linear scaling and length/thickness powers hold`, () => {
  const d = design(id), base = run(d).parts[0];
  d.parts[0].loads[0].magnitude_N *= 2;
  close(run(d).parts[0].stress_MPa, base.stress_MPa * 2);
  close(run(d).parts[0].deflection_mm, base.deflection_mm * 2);
  d.parts[0].loads[0].magnitude_N /= 2;
  const length = id === 'rc_aircraft' ? 'length_mm' : 'span_mm';
  d.parts[0].params[length] *= 2;
  close(run(d).parts[0].deflection_mm, base.deflection_mm * 8);
  close(run(d).parts[0].stress_MPa, base.stress_MPa * 2);
  close(run(d).parts[0].mass_g, base.mass_g * 2);
});
for (const id of ['water_rocket', 'payload']) test(`${id}: doubling plate thickness reduces sag eightfold and stress fourfold`, () => {
  const d = design(id), base = run(d).parts[0]; d.parts[0].params.thickness_mm *= 2;
  const next = run(d).parts[0]; close(next.deflection_mm, base.deflection_mm / 8);
  close(next.stress_MPa, base.stress_MPa / 4); close(next.mass_g, base.mass_g * 2);
});
for (const [name, mutate] of [
  ['zero span', (d: DesignInput) => { d.parts[0].params.span_mm = 0; }],
  ['negative load', (d: DesignInput) => { d.parts[0].loads[0].magnitude_N = -1; }],
  ['nonfinite load', (d: DesignInput) => { d.parts[0].loads[0].magnitude_N = NaN; }],
  ['unknown material', (d: DesignInput) => { d.parts[0].materialId = 'missing'; }],
  ['fractional quantity', (d: DesignInput) => { d.quantity = 1.5; }],
  ['unimplemented L2', (d: DesignInput) => { d.fidelity = 'L2'; }],
  ['empty parts', (d: DesignInput) => { d.parts = []; }],
  ['negative density', (d: DesignInput) => { d.environment.rho_kgm3 = -1; }],
  ['missing vehicle', (d: DesignInput) => { d.parts[0].liftFed = true; }],
] as const) test(`invalid input fails closed: ${name}`, () => {
  const d = design('water_rocket'); mutate(d); const e = run(d);
  assert.equal(e.validInputs, false); assert.ok(e.modelWarnings.length);
  for (const kind of ['static_stress', 'buckling', 'aero_polar', 'stability', 'dfm', 'cost', 'modal'] as const) assert.equal(runAnalysis(kind, d, materials, processes).pass, false);
});
test('tube wall cannot exceed radius', () => {
  const d = design('rc_aircraft'); d.parts[0].params.wall_mm = 5;
  assert.equal(run(d).validInputs, false);
});
test('unloaded structure has infinite strength ratio, not zero, but no static-analysis pass', () => {
  const d = design('water_rocket'); d.parts[0].loads[0].magnitude_N = 0;
  const e = run(d); assert.equal(e.minSafetyFactor, Infinity); close(e.maxDeflection_mm, 0);
  assert.equal(runAnalysis('static_stress', d, materials, processes).pass, false);
});
test('missing process cannot pass either manufacturing or quoted cost', () => {
  const d = design('rc_aircraft'); d.parts[0].processId = null;
  assert.equal(run(d).passCost, false); assert.equal(run(d).passDfm, false);
});
test('unmodeled aerodynamics and buckling do not receive vacuous analysis passes', () => {
  const d = design('payload');
  for (const kind of ['aero_polar', 'stability', 'buckling', 'modal'] as const) {
    const r = runAnalysis(kind, d, materials, processes);
    assert.equal(r.pass, false); assert.match(r.warnings.join(' '), /not applicable/);
  }
});
test('model identity covers environment, frequency, and teaching tables', () => {
  const d = design('glider'), a = run(d).inputHash;
  const e = structuredClone(d); e.environment.rho_kgm3 *= 1.01; assert.notEqual(run(e).inputHash, a);
  e.environment = d.environment; e.excitation_hz = 200; assert.notEqual(run(e).inputHash, a);
  const table = structuredClone(materials); table[0].E_GPa += 1;
  assert.notEqual(evaluate(d, table, processes).inputHash, a);
  assert.equal(run(d).inputHash, a);
});
test('L1 frequency uses correct supported span and beam mass per length', () => {
  for (const id of ['payload', 'glider', 'rc_aircraft']) {
    const d = design(id); d.fidelity = 'L1'; const e = run(d), r = e.parts[0];
    const half = d.parts[0].liftFed ? .5 : 1;
    const mu = r.mass_g / 1000 * half / r.length_m;
    const beta = id === 'payload' ? Math.PI : 1.875104;
    close(e.modal_hz!, beta ** 2 / (2 * Math.PI) * Math.sqrt(r.e_GPa * 1e9 * r.inertia_m4 / (mu * r.length_m ** 4)));
    assert.match(e.assumptions.join(' '), /attached motors\/payload.*omitted/);
  }
});
test('cost arithmetic remains explicit per primary part at selected quantity', () => {
  const d = design('water_rocket'), e = run(d);
  const material = materials.find(m => m.id === d.parts[0].materialId)!;
  const p = processes.find(p => p.id === d.parts[0].processId)!;
  close(e.cost!.unit, e.parts[0].mass_g / 1000 * material.cost_usd_per_kg * p.scrapFactor + p.machineRate_usd_per_hr * p.cycleTime_hr + (p.setupCost_usd + p.toolingCost_usd) / d.quantity + p.labor_usd + p.finishing_usd);
});
