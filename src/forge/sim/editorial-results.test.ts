import test from "node:test";
import assert from "node:assert/strict";
import { materials, missions, processes } from "@/forge/content/catalog.ts";
import { evaluate, runAnalysis, type DesignInput } from "./evaluate.ts";
import { evaluationMessages, evaluationSummary, requiredChecksPass, REQUIRED_CHECKS } from "./result-messages.ts";

function input(id: string): DesignInput {
  const m = missions.find(m => m.id === id)!;
  return structuredClone({ parts: m.parts, vehicle: m.vehicle, environment: m.environment,
    quantity: m.constraints.quantity ?? 1, limits: m.constraints, fidelity: "L0", seed: 1 });
}
const ev = (d: DesignInput) => evaluate(d, materials, processes);
test("low lift cannot receive an all-checks-met summary; analysis names the failed criterion", () => {
  const d = input("glider"); Object.assign(d.vehicle!, { cg_fromNose_mm: 150, speed_ms: 4, alpha_deg: 0 });
  const e = ev(d);
  assert.equal(e.passAero, false);
  assert.ok(Math.abs(e.aero!.lift_N - 0.1323) < 0.0001);
  assert.ok(Math.abs(e.aero!.weight_N - 0.415054) < 0.0001);
  assert.ok(e.failures.some(f => f.mode === "insufficient_lift"));
  assert.match(evaluationSummary(e), /not met/);
  assert.match(evaluationMessages(e, d.limits).join(" "), /0.132 N; model weight 0.415 N/);
  const a = runAnalysis("aero_polar", d, materials, processes);
  assert.equal(a.pass, false); assert.ok(a.failures.some(f => f.mode === "insufficient_lift"));
});
test("payload shortfall and fin strength-limit exceedance are different, neither is a measured yield event", () => {
  const payload = input("payload"), e = ev(payload);
  assert.ok(Math.abs(e.parts[0].stress_MPa - 18.75) < 1e-8);
  assert.ok(Math.abs(e.minSafetyFactor - 1.6) < 1e-8);
  assert.ok(e.failures.some(f => f.mode === "strength_margin_shortfall"));
  assert.ok(!e.failures.some(f => f.mode === "yield" || f.mode === "strength_limit_exceeded"));
  assert.match(evaluationMessages(e, payload.limits).join(" "), /required strength margin not met/);
  const fin = ev(input("water_rocket"));
  assert.ok(fin.failures.some(f => f.mode === "strength_limit_exceeded"));
  assert.ok(runAnalysis("static_stress", payload, materials, processes).failures.some(f => f.mode === "strength_margin_shortfall"));
});
test("every required false flag blocks the summary even when named failures are missing", () => {
  const d = input("glider"); d.vehicle!.cg_fromNose_mm = 150;
  const baseline = ev(d); assert.equal(requiredChecksPass(baseline), true);
  assert.match(evaluationSummary(baseline), /^All required/);
  for (const key of REQUIRED_CHECKS) {
    const e = { ...baseline, [key]: false, failures: [] };
    assert.equal(requiredChecksPass(e), false, key);
    assert.doesNotMatch(evaluationSummary(e), /^All required/, key);
    // Missing messages must not permit the false positive that triggered this edit.
  }
});
test("minimum-wall boundary messages agree with their pass flags", () => {
  const d = input("water_rocket");
  for (const [wall, pass] of [[1, false], [1.2, true], [2, true]] as const) {
    d.parts[0].params.thickness_mm = wall;
    const check = ev(d).dfmChecks.find(c => c.id === "fin/min_wall")!;
    assert.equal(check.pass, pass); assert.match(check.message, new RegExp(pass ? "check passed" : "check not met"));
    assert.match(check.message, /classroom minimum 1.2 mm/);
    assert.doesNotMatch(check.message, /Passes:.*under|misses layers|will chatter/);
  }
});
test("draft, hole-depth and tool-access results use outcome-specific wording", () => {
  const d = input("drone_arm"); const p = d.parts[0]; p.processId = "injection_mold";
  p.params.draft_deg = 0;
  assert.match(ev(d).dfmChecks.find(c => c.id.endsWith("/draft"))!.message, /Draft check not met/);
  p.params.draft_deg = 1;
  assert.match(ev(d).dfmChecks.find(c => c.id.endsWith("/draft"))!.message, /Draft check passed/);
  p.processId = "cnc_3axis"; p.params.holeDepth_mm = 30; p.params.holeDia_mm = 4; p.params.undercut = 1;
  assert.match(ev(d).dfmChecks.find(c => c.id.endsWith("/hole_aspect"))!.message, /Hole-depth check not met/);
  assert.match(ev(d).dfmChecks.find(c => c.id.endsWith("/no_undercut"))!.message, /Tool-access check not met/);
  p.params.holeDepth_mm = 16; p.params.undercut = 0;
  assert.match(ev(d).dfmChecks.find(c => c.id.endsWith("/hole_aspect"))!.message, /Hole-depth check passed/);
  assert.match(ev(d).dfmChecks.find(c => c.id.endsWith("/no_undercut"))!.message, /Tool-access check passed/);
});
test("positive static-margin target miss is not labeled negative static instability", () => {
  const d = input("glider"); let e = ev(d);
  assert.ok(e.aero!.sm > .25); assert.ok(e.failures.some(f => f.mode === "static_margin_outside_target"));
  d.vehicle!.cg_fromNose_mm = 200; e = ev(d);
  assert.ok(e.aero!.sm < 0); assert.ok(e.failures.some(f => f.mode === "static_instability"));
});
test("invalid inputs and optional frequency warnings cannot receive a blanket green statement", () => {
  const d = input("glider"); d.parts[0].params.span_mm = 0;
  const e = ev(d); assert.equal(e.validInputs, false); assert.match(evaluationSummary(e), /No valid result/);
  assert.ok(evaluationMessages(e, d.limits).length);
  const good = input("glider"); good.vehicle!.cg_fromNose_mm = 150;
  assert.match(evaluationSummary({ ...ev(good), resonance: true }), /review the additional/);
});
