import type { Material, Process } from "@/forge/content/catalog";
import type { DesignInput } from "@/forge/sim/evaluate";

/** Validate the teaching model's domain before evaluating, rather than clamping
 * invalid dimensions into an apparently successful design. Units follow DesignInput. */
export function designInputErrors(input: DesignInput, materials: Material[], processes: Process[]): string[] {
  const errors: string[] = [];
  const positive = (v: number) => Number.isFinite(v) && v > 0;
  if (!input.parts.length) errors.push("Add at least one part before running an analysis.");
  if (new Set(input.parts.map(p => p.id)).size !== input.parts.length) errors.push("Part IDs must be unique.");
  if (!Number.isInteger(input.quantity) || input.quantity < 1) errors.push("Quantity must be a positive whole number.");
  if (!positive(input.environment.rho_kgm3) || !positive(input.environment.g) || !Number.isFinite(input.environment.temp_C)) errors.push("Environment values must be finite, with positive density and gravity.");
  if (input.fidelity !== "L0" && input.fidelity !== "L1") errors.push("Only L0 and L1 are implemented; L2 is not a higher-fidelity result.");
  if (input.excitation_hz !== undefined && (!Number.isFinite(input.excitation_hz) || input.excitation_hz < 0)) errors.push("Excitation frequency must be finite and nonnegative.");
  for (const [key, value] of Object.entries(input.limits)) {
    if (value !== undefined && (!Number.isFinite(value) || value < 0)) errors.push(`${key}: use a finite, nonnegative limit.`);
  }
  for (const part of input.parts) {
    const keys = part.kind === "plate" ? ["span_mm", "chord_mm", "thickness_mm"] : part.kind === "tube" ? ["length_mm", "outer_mm", "wall_mm"] : ["length_mm", "width_mm", "height_mm"];
    if (!["plate", "tube", "box"].includes(part.kind)) errors.push(`${part.name}: unsupported geometry.`);
    for (const key of keys) if (!positive(part.params[key])) errors.push(`${part.name}: ${key} must be finite and positive.`);
    for (const [key, value] of Object.entries(part.params)) if (!Number.isFinite(value)) errors.push(`${part.name}: ${key} must be finite.`);
    if (part.kind === "tube" && part.params.wall_mm * 2 > part.params.outer_mm) errors.push(`${part.name}: wall thickness cannot exceed the outer radius.`);
    const material = materials.find(m => m.id === part.materialId);
    if (!material) errors.push(`${part.name}: select a known material.`);
    else if (![material.E_GPa, material.yield_MPa, material.density_kgm3, material.anisotropy?.knockdownFactor ?? 1].every(positive)) errors.push(`${part.name}: material stiffness, allowable, density and knockdown must be positive.`);
    if (part.processId && !processes.some(p => p.id === part.processId)) errors.push(`${part.name}: unknown process.`);
    if (part.liftFed && !input.vehicle) errors.push(`${part.name}: computed wing loading requires a vehicle model.`);
    for (const load of part.loads) {
      if (!["axial", "bending_tip", "bending_center"].includes(load.kind)) errors.push(`${part.name}: unsupported load case.`);
      if (!Number.isFinite(load.magnitude_N) || load.magnitude_N < 0) errors.push(`${part.name}: load magnitude must be finite and nonnegative; axial denotes compression.`);
      if (load.kind === "axial" && !positive(load.k)) errors.push(`${part.name}: buckling effective-length factor K must be positive.`);
    }
  }
  if (input.vehicle) {
    const v = input.vehicle;
    for (const id of [v.wingId, v.tailId, v.fuselageId]) if (!input.parts.some(p => p.id === id)) errors.push(`Vehicle references missing part ${id}.`);
    if (![v.alpha_deg, v.speed_ms, v.cg_fromNose_mm, v.noseToWingLe_mm].every(Number.isFinite) || v.speed_ms < 0) errors.push("Vehicle values must be finite and speed nonnegative.");
    for (const id of [v.wingId, v.tailId]) if (input.parts.find(p => p.id === id)?.kind !== "plate") errors.push(`${id}: this aerodynamic model requires a plate planform.`);
  }
  return errors;
}
