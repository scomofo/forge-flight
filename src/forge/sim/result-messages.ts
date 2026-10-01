import type { DesignInput, Evaluation } from "./evaluate.ts";

// Shared by the result panel and regression tests. The absence of a named
// failure never implies a pass: every required boolean is checked explicitly.
export const REQUIRED_CHECKS = ["validInputs", "passStress", "passBuckling", "passMass", "passCost", "passDeflection", "passDfm", "passAero", "passStability"] as const;
export function requiredChecksPass(ev: Evaluation): boolean {
  return REQUIRED_CHECKS.every(key => ev[key] === true);
}
export function evaluationSummary(ev: Evaluation): string {
  if (!ev.validInputs) return "No valid result: correct the model inputs.";
  if (!requiredChecksPass(ev)) return "One or more required classroom checks are not met.";
  if (ev.resonance || ev.modelWarnings.length || ev.failures.length) return "Required classroom checks met; review the additional model warnings.";
  return "All required classroom checks are met for these inputs.";
}
export function evaluationMessages(ev: Evaluation, limits: DesignInput["limits"]): string[] {
  if (!ev.validInputs) return ev.modelWarnings.length ? [...ev.modelWarnings] : ["Input validation failed; no engineering verdict is available."];
  const messages: string[] = [];
  const sf = limits.minSafetyFactor ?? 1;
  if (!ev.passStress) {
    for (const p of ev.parts.filter(p => p.safetyFactor + 1e-9 < sf)) {
      messages.push(`${p.name}: ${p.stress_MPa > p.allowable_MPa ? "supplied strength limit exceeded" : "required strength margin not met"}. Calculated stress ${p.stress_MPa.toFixed(2)} MPa; supplied allowable ${p.allowable_MPa.toFixed(2)} MPa; safety factor ${p.safetyFactor.toFixed(2)}, required at least ${sf}. This is a model comparison, not an observed yield event.`);
    }
    if (!ev.parts.length) messages.push("Strength check not met: no part result is available.");
  }
  if (!ev.passBuckling) messages.push(`Buckling-margin check not met: the compression screening case does not meet the required factor ${sf}.`);
  if (!ev.passMass) messages.push(`Mass limit not met: modeled parts ${ev.mass_g.toFixed(1)} g; maximum ${limits.maxMass_g} g.`);
  if (!ev.passCost) messages.push(ev.cost
    ? `Primary-part cost limit not met: USD ${ev.cost.unit.toFixed(2)} per part; maximum USD ${limits.maxCost_usd}.`
    : "Cost check not met: no compatible primary-part quote is available.");
  if (!ev.passDeflection) messages.push(`Deflection check not met: linear-model sag ${ev.maxDeflection_mm.toFixed(2)} mm${limits.maxDeflection_mm !== undefined ? `; maximum ${limits.maxDeflection_mm} mm` : ""}. Read the model-validity warnings before interpreting this value.`);
  if (!ev.passDfm) messages.push("Manufacturing-rule check not met. Review process compatibility, the rule details and the required design-for-manufacture score.");
  if (!ev.passAero) messages.push(ev.aero
    ? `Lift requirement not met. Calculated lift ${ev.aero.lift_N.toFixed(3)} N; model weight ${ev.aero.weight_N.toFixed(3)} N. Revise the design or flight settings and rerun the check.`
    : "Lift check not met: no aerodynamic result is available.");
  if (!ev.passStability) {
    if (ev.aero?.stalled) messages.push("The angle exceeds the model's stall threshold; the flight-condition check is not met.");
    if (ev.aero && !ev.aero.stable) messages.push(`${ev.aero.sm < 0 ? "Negative static margin: the model is statically unstable" : "Static margin is outside the classroom target, not a demonstrated instability"}. Margin ${(ev.aero.sm * 100).toFixed(1)}% of chord; target 5% to 25%.`);
    if (!ev.aero) messages.push("Stability check not met: no aerodynamic result is available.");
  }
  if (ev.resonance) messages.push("Frequency-proximity warning: the first bending-frequency estimate is within the classroom band around the supplied excitation. This is not proof of a resonant response.");
  return [...messages, ...ev.modelWarnings];
}
