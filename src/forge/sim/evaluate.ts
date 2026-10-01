import { aeroModel, type Material, type Process } from "@/forge/content/catalog";
import type { AnalysisKind, GeomKind, LoadKind, ProcessId } from "@/forge/types";
import {
  axialStress,
  bendingStress,
  cantileverTipDeflection,
  drag,
  eulerBuckling,
  finiteWingSlope,
  inducedDragCoeff,
  lift,
  liftCoeff,
  rectangleInertia,
  safetyFactor,
  simplySupportedCenterDeflection,
  staticMargin,
  tubeArea,
  tubeInertia,
  unitCost,
  utilization,
  type CostTerms,
} from "@/forge/sim/formulas";
import { hashCanon } from "@/forge/sim/hash";
import { designInputErrors } from "@/forge/sim/input-validation";

export const MODEL_REVISION = "hangar-full-span-2026-10-01";

export type LoadInput = { id: string; kind: LoadKind; magnitude_N: number; k: number };

export type PartInput = {
  id: string;
  name: string;
  kind: GeomKind;
  params: Record<string, number>;
  materialId: string;
  processId: ProcessId | null;
  loads: LoadInput[];
  liftFed?: boolean;
};

export type VehicleInput = {
  alpha_deg: number;
  speed_ms: number;
  cg_fromNose_mm: number;
  noseToWingLe_mm: number;
  wingId: string;
  tailId: string;
  fuselageId: string;
};

export type DesignInput = {
  parts: PartInput[];
  vehicle: VehicleInput | null;
  environment: { rho_kgm3: number; g: number; temp_C: number };
  quantity: number;
  limits: {
    maxMass_g?: number;
    maxCost_usd?: number;
    minSafetyFactor?: number;
    maxDeflection_mm?: number;
    dfmScoreMin?: number;
    bodyMass_g?: number;
    armCount?: number;
  };
  fidelity: "L0" | "L1" | "L2";
  seed: number;
  excitation_hz?: number;
};

export type FailureMode = {
  mode: string;
  location: string;
  utilization: number;
  explanationId: string;
};

export type DfmCheck = { id: string; severity: "error" | "warn"; pass: boolean; message: string };

export type PartResult = {
  id: string;
  name: string;
  mass_g: number;
  area_m2: number;
  inertia_m4: number;
  length_m: number;
  stress_MPa: number;
  deflection_mm: number;
  safetyFactor: number;
  utilization: number;
  buckling_N: number | null;
  axial_N: number;
  allowable_MPa: number;
  e_GPa: number;
};

export type ProcessQuote = { id: ProcessId; name: string; terms: CostTerms };

export type AeroResult = {
  lift_N: number;
  drag_N: number;
  cl: number;
  cd: number;
  cdi: number;
  sm: number;
  stable: boolean;
  stalled: boolean;
  aspectRatio: number;
  weight_N: number;
  thrustToWeight: number | null;
  points: { x_m: number; h_m: number }[];
};

export type Evaluation = {
  validInputs: boolean;
  modelWarnings: string[];
  mass_g: number;
  vehicleMass_g: number;
  minSafetyFactor: number;
  maxUtilization: number;
  maxDeflection_mm: number;
  cost: CostTerms | null;
  recommended: ProcessQuote | null;
  quotes: ProcessQuote[];
  dfmScore: number;
  dfmChecks: DfmCheck[];
  incompatible: string[];
  parts: PartResult[];
  aero: AeroResult | null;
  modal_hz: number | null;
  resonance: boolean;
  passStress: boolean;
  passBuckling: boolean;
  passMass: boolean;
  passCost: boolean;
  passDeflection: boolean;
  passDfm: boolean;
  passAero: boolean;
  passStability: boolean;
  thrustToWeight: number | null;
  assumptions: string[];
  failures: FailureMode[];
  inputHash: string;
};

const MM = 1e-3;

function n(params: Record<string, number>, key: string, fallback = 0): number {
  const v = params[key];
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function section(part: PartInput): { area: number; inertia: number; c: number; length: number; volume: number; wall_mm: number } {
  if (part.kind === "tube") {
    const length = n(part.params, "length_mm") * MM;
    const outer = n(part.params, "outer_mm") * MM;
    const wall = n(part.params, "wall_mm") * MM;
    const inner = Math.max(0, outer - 2 * wall);
    const area = tubeArea(outer, inner);
    return { area, inertia: tubeInertia(outer, inner), c: outer / 2, length, volume: area * length, wall_mm: n(part.params, "wall_mm") };
  }
  if (part.kind === "plate") {
    const span = n(part.params, "span_mm") * MM;
    const chord = n(part.params, "chord_mm") * MM;
    const thick = n(part.params, "thickness_mm") * MM;
    // Only the full-span, lift-fed wing consists of two half-span cantilevers.
    // A standalone fin uses its full root-to-tip span; a bay uses rail spacing.
    const length = part.liftFed ? span / 2 : span;
    return {
      area: chord * thick,
      inertia: rectangleInertia(chord, thick),
      c: thick / 2,
      length,
      volume: span * chord * thick,
      wall_mm: n(part.params, "thickness_mm"),
    };
  }
  const length = n(part.params, "length_mm") * MM;
  const width = n(part.params, "width_mm") * MM;
  const height = n(part.params, "height_mm") * MM;
  return {
    area: width * height,
    inertia: rectangleInertia(width, height),
    c: height / 2,
    length,
    volume: width * height * length,
    wall_mm: Math.min(n(part.params, "width_mm"), n(part.params, "height_mm")),
  };
}

export function processQuote(mass_kg: number, material: Material, process: Process, quantity: number): ProcessQuote {
  return {
    id: process.id,
    name: process.name,
    terms: unitCost({
      mass_kg,
      cost_usd_per_kg: material.cost_usd_per_kg,
      machineRate_usd_per_hr: process.machineRate_usd_per_hr,
      cycleTime_hr: process.cycleTime_hr,
      setupCost_usd: process.setupCost_usd,
      toolingCost_usd: process.toolingCost_usd,
      quantity,
      labor_usd: process.labor_usd,
      finishing_usd: process.finishing_usd,
      scrapFactor: process.scrapFactor,
    }),
  };
}

function dfmFor(part: PartInput, process: Process, wall_mm: number): DfmCheck[] {
  return process.rules.map((rule) => {
    if (rule.check === "min_wall") {
      return { id: rule.id, severity: rule.severity, pass: wall_mm + 1e-9 >= process.minWall_mm, message: rule.message };
    }
    if (rule.check === "max_hole_aspect") {
      const dia = n(part.params, "holeDia_mm");
      const depth = n(part.params, "holeDepth_mm");
      const aspect = dia > 0 ? depth / dia : 0;
      return { id: rule.id, severity: rule.severity, pass: aspect <= process.maxAspectRatio_hole + 1e-9, message: rule.message };
    }
    if (rule.check === "draft") {
      return {
        id: rule.id,
        severity: rule.severity,
        pass: n(part.params, "draft_deg") + 1e-9 >= process.draftAngle_deg,
        message: rule.message,
      };
    }
    return { id: rule.id, severity: rule.severity, pass: n(part.params, "undercut") < 0.5, message: rule.message };
  });
}

export function recommendProcess(mass_kg: number, material: Material, quantity: number, table: Process[]): ProcessQuote | null {
  const allowed = table.filter((p) => material.processes.includes(p.id));
  let best: ProcessQuote | null = null;
  for (const process of allowed) {
    const q = processQuote(mass_kg, material, process, quantity);
    if (!best || q.terms.unit < best.terms.unit) best = q;
  }
  return best;
}

function glidePoints(mass_kg: number, rho: number, g: number, s: number, cd0: number, ar: number, e: number, cl0: number, slope: number, stall: number, alpha: number, v0: number) {
  const points: { x_m: number; h_m: number }[] = [];
  let x = 0;
  let h = 8;
  let v = Math.max(2, v0);
  let gamma = 0;
  const dt = 0.05;
  const m = Math.max(mass_kg, 1e-4);
  for (let i = 0; i < 120; i++) {
    points.push({ x_m: x, h_m: h });
    const cl = liftCoeff(alpha, cl0, slope, stall);
    const cdi = inducedDragCoeff(cl, ar, e);
    const cd = cd0 + cdi;
    const L = lift(rho, v, s, cl);
    const D = drag(rho, v, s, cd);
    const vDot = -g * Math.sin(gamma) - D / m;
    const gDot = v > 0.5 ? (L / m - g * Math.cos(gamma)) / v : 0;
    v = Math.max(0.5, v + vDot * dt);
    gamma = gamma + gDot * dt;
    x += v * Math.cos(gamma) * dt;
    h += v * Math.sin(gamma) * dt;
    if (h <= 0) {
      points.push({ x_m: x, h_m: 0 });
      break;
    }
  }
  return points;
}

/** Identity used by both the worker and the UI when accepting completed work. */
export function evaluationInputHash(input: DesignInput, materials: Material[], processTable: Process[]): string {
  return hashCanon({ modelRevision: MODEL_REVISION, input, materials, processes: processTable });
}
export function analysisInputHash(kind: AnalysisKind, input: DesignInput, materials: Material[], processTable: Process[]): string {
  return hashCanon({ kind, hash: evaluationInputHash(input, materials, processTable) });
}

export function evaluate(input: DesignInput, materials: Material[], processTable: Process[]): Evaluation {
  const inputHash = evaluationInputHash(input, materials, processTable);
  const errors = designInputErrors(input, materials, processTable);
  if (errors.length) return {
    validInputs: false, modelWarnings: errors, inputHash,
    mass_g: 0, vehicleMass_g: 0, minSafetyFactor: 0, maxUtilization: 0, maxDeflection_mm: 0,
    cost: null, recommended: null, quotes: [], dfmScore: 0, dfmChecks: [], incompatible: errors,
    parts: [], aero: null, modal_hz: null, resonance: false, thrustToWeight: null,
    passStress: false, passBuckling: false, passMass: false, passCost: false,
    passDeflection: false, passDfm: false, passAero: false, passStability: false,
    assumptions: ["No result is valid until the input errors are corrected."],
    failures: [{ mode: "invalid_input", location: "design", utilization: 0, explanationId: "inertia" }],
  };
  const modelWarnings: string[] = [];
  const assumptions = [
    "Educational model. Not a certification, a drawing release, or a safety case.",
    "Linear elastic. Small-deflection beam formulas. No stress concentration.",
    "Cantilever tip deflection is FL³/(3EI). A simply supported center load uses FL³/(48EI).",
    "Euler buckling uses P_cr = π²EI/(KL)². The load case carries its own K.",
    "Only a lift-fed full wing uses half span. Standalone fins use full root-to-tip span; a center-loaded plate uses full support spacing.",
    "Loads are separate screening cases, not simultaneous vector loads. Axial inputs are compressive magnitudes; combined-load interaction is not calculated.",
    "Temperature is recorded, but these room-temperature material constants do not vary with it. Cost quotes cover the primary part only, not an assembled vehicle.",
  ];

  const incompatible: string[] = [];
  const failures: FailureMode[] = [];
  const partResults: PartResult[] = [];
  let dfmChecks: DfmCheck[] = [];

  const sections = input.parts.map((part) => ({ part, sec: section(part) }));
  const mass_kg = sections.reduce((sum, row) => {
    const mat = materials.find((m) => m.id === row.part.materialId);
    return sum + (mat ? mat.density_kgm3 * row.sec.volume : 0);
  }, 0);

  let aero: AeroResult | null = null;
  let liftTotal = 0;
  if (input.vehicle) {
    const wing = input.parts.find((p) => p.id === input.vehicle!.wingId);
    const tail = input.parts.find((p) => p.id === input.vehicle!.tailId);
    const fuse = input.parts.find((p) => p.id === input.vehicle!.fuselageId);
    if (wing && tail && fuse) {
      const span = n(wing.params, "span_mm") * MM;
      const chord = n(wing.params, "chord_mm") * MM;
      const sWing = span * chord;
      const sTail = n(tail.params, "span_mm") * MM * n(tail.params, "chord_mm") * MM;
      const ar = chord > 0 ? span / chord : 1;
      const slope = finiteWingSlope(Math.max(ar, 0.2));
      const stall = (aeroModel.stall_deg * Math.PI) / 180;
      const alpha = (input.vehicle.alpha_deg * Math.PI) / 180;
      const cl = liftCoeff(alpha, aeroModel.cl0, slope, stall);
      const cdi = inducedDragCoeff(cl, Math.max(ar, 0.2), aeroModel.oswald);
      const cd = aeroModel.cd0 + cdi;
      const speed = input.vehicle.speed_ms;
      liftTotal = lift(input.environment.rho_kgm3, speed, sWing, cl);
      const drag_N = drag(input.environment.rho_kgm3, speed, sWing, cd);
      const weight_N = mass_kg * input.environment.g;
      const xAc = (input.vehicle.noseToWingLe_mm + 0.25 * n(wing.params, "chord_mm")) * MM;
      const fuseLen = n(fuse.params, "length_mm") * MM;
      const tailChord = n(tail.params, "chord_mm") * MM;
      const xTail = fuseLen - 0.25 * tailChord;
      const lt = xTail - xAc;
      const xNp = xAc + aeroModel.tailFactor * (sWing > 0 ? sTail / sWing : 0) * lt;
      const xCg = input.vehicle.cg_fromNose_mm * MM;
      const sm = staticMargin(xNp, xCg, Math.max(chord, 1e-6));
      const stalled = input.vehicle.alpha_deg > aeroModel.stall_deg;
      const stable = sm >= 0.05 && sm <= 0.25;
      aero = {
        lift_N: liftTotal,
        drag_N,
        cl,
        cd,
        cdi,
        sm,
        stable,
        stalled,
        aspectRatio: ar,
        weight_N,
        thrustToWeight: null,
        points: glidePoints(mass_kg, input.environment.rho_kgm3, input.environment.g, sWing, aeroModel.cd0, Math.max(ar, 0.2), aeroModel.oswald, aeroModel.cl0, slope, stall, alpha, speed),
      };
      assumptions.push(aeroModel.citation);
      assumptions.push("Heading is fixed. The path is a longitudinal point-mass glide from 8 m, wings level. Stall and static margin are named checks, not a 6-degree-of-freedom motion.");
    }
  }

  for (const row of sections) {
    const mat = materials.find((m) => m.id === row.part.materialId);
    if (!mat) {
      incompatible.push(`${row.part.name} has no material.`);
      continue;
    }
    const knock = mat.anisotropy?.knockdownFactor ?? 1;
    const e = mat.E_GPa * 1e9 * knock;
    const allowable = mat.yield_MPa * knock;
    let stress = 0;
    let deflection = 0;
    let buckling: number | null = null;
    let axial = 0;
    const loads = row.part.loads.map((load) => ({ ...load }));
    if (row.part.liftFed && liftTotal > 0) {
      loads.push({ id: "lift", kind: "bending_tip", magnitude_N: liftTotal / 2, k: 2 });
      assumptions.push(`${row.part.name}: half the computed lift is a tip force on a half-span cantilever.`);
    }
    for (const load of loads) {
      if (load.kind === "axial") {
        axial = Math.max(axial, load.magnitude_N);
        const sig = axialStress(load.magnitude_N, Math.max(row.sec.area, 1e-12)) / 1e6;
        stress = Math.max(stress, sig);
        const pcr = eulerBuckling(e, row.sec.inertia, load.k, Math.max(row.sec.length, 1e-6));
        buckling = buckling === null ? pcr : Math.min(buckling, pcr);
      } else if (load.kind === "bending_tip") {
        const moment = load.magnitude_N * row.sec.length;
        const sig = bendingStress(moment, row.sec.c, Math.max(row.sec.inertia, 1e-18)) / 1e6;
        stress = Math.max(stress, sig);
        const defl = cantileverTipDeflection(load.magnitude_N, row.sec.length, e, Math.max(row.sec.inertia, 1e-18));
        deflection = Math.max(deflection, defl * 1000);
      } else {
        const moment = (load.magnitude_N * row.sec.length) / 4;
        const sig = bendingStress(moment, row.sec.c, Math.max(row.sec.inertia, 1e-18)) / 1e6;
        stress = Math.max(stress, sig);
        const defl = simplySupportedCenterDeflection(load.magnitude_N, row.sec.length, e, Math.max(row.sec.inertia, 1e-18));
        deflection = Math.max(deflection, defl * 1000);
      }
    }
    if (deflection > row.sec.length * 1000 * 0.1) {
      modelWarnings.push(`${row.part.name}: linear-model sag exceeds 10% of the modeled span. Treat it as an out-of-domain warning, not a physical deflection prediction. This classroom screen is not a general accuracy guarantee below 10%.`);
    }
    const sf = safetyFactor(allowable, stress);
    const util = utilization(stress, allowable);
    partResults.push({
      id: row.part.id,
      name: row.part.name,
      mass_g: mat.density_kgm3 * row.sec.volume * 1000,
      area_m2: row.sec.area,
      inertia_m4: row.sec.inertia,
      length_m: row.sec.length,
      stress_MPa: stress,
      deflection_mm: deflection,
      safetyFactor: sf,
      utilization: util,
      buckling_N: buckling,
      axial_N: axial,
      allowable_MPa: allowable,
      e_GPa: e / 1e9,
    });
    if (row.part.processId) {
      const process = processTable.find((p) => p.id === row.part.processId);
      if (!process || !mat.processes.includes(row.part.processId)) {
        incompatible.push(`${mat.name} is not made by ${row.part.processId} in this shop.`);
      } else {
        dfmChecks = dfmChecks.concat(dfmFor(row.part, process, row.sec.wall_mm));
      }
    }
    if (knock !== 1) {
      assumptions.push(`${mat.name}: allowable and modulus are multiplied by ${knock} (${mat.anisotropy?.direction}).`);
    }
  }

  const primary = input.parts[0];
  const primaryMat = primary ? materials.find((m) => m.id === primary.materialId) : undefined;
  const primaryMass = partResults[0] ? partResults[0].mass_g / 1000 : mass_kg;
  const quotes: ProcessQuote[] = [];
  if (primary && primaryMat) {
    for (const id of primaryMat.processes) {
      const process = processTable.find((p) => p.id === id);
      if (process) quotes.push(processQuote(primaryMass, primaryMat, process, input.quantity));
    }
  }
  const recommended = quotes.slice().sort((a, b) => a.terms.unit - b.terms.unit)[0] ?? null;
  const selected = quotes.find((q) => q.id === primary?.processId) ?? null;

  const scored = dfmChecks.length
    ? (dfmChecks.reduce((sum, check) => sum + (check.pass ? 1 : check.severity === "warn" ? 0.5 : 0), 0) / dfmChecks.length) * 100
    : 100;

  const minSf = partResults.reduce((m, p) => Math.min(m, p.safetyFactor), Number.POSITIVE_INFINITY);
  const maxUtil = partResults.reduce((m, p) => Math.max(m, p.utilization), 0);
  const maxDefl = partResults.reduce((m, p) => Math.max(m, p.deflection_mm), 0);
  const mass_g = partResults.reduce((s, p) => s + p.mass_g, 0);
  const armCount = input.limits.armCount ?? 1;
  const vehicleMass_g = input.limits.bodyMass_g ? mass_g * armCount + input.limits.bodyMass_g : mass_g;

  let thrustToWeight: number | null = null;
  if (input.limits.armCount && input.limits.bodyMass_g) {
    const tip = input.parts[0]?.loads.find((l) => l.kind === "bending_tip")?.magnitude_N ?? 0;
    const weight = (vehicleMass_g / 1000) * input.environment.g;
    thrustToWeight = weight > 0 ? (tip * armCount) / weight : null;
  }
  if (aero && thrustToWeight !== null) aero.thrustToWeight = thrustToWeight;

  const needSf = input.limits.minSafetyFactor ?? 1;
  const passStress = partResults.every((p) => p.safetyFactor + 1e-9 >= needSf);
  const passBuckling = partResults.every((p) => p.buckling_N === null || p.axial_N * needSf <= p.buckling_N);
  const passMass = input.limits.maxMass_g === undefined || mass_g <= input.limits.maxMass_g + 1e-6;
  const passCost = selected !== null && (input.limits.maxCost_usd === undefined || selected.terms.unit <= input.limits.maxCost_usd + 1e-6);
  const passDeflection = modelWarnings.length === 0 && (input.limits.maxDeflection_mm === undefined || maxDefl <= input.limits.maxDeflection_mm + 1e-6);
  const passDfm = input.parts.every(p => Boolean(p.processId)) && incompatible.length === 0 && scored + 1e-6 >= (input.limits.dfmScoreMin ?? 70) && dfmChecks.every((c) => c.severity !== "error" || c.pass);
  const passAero = !aero || aero.lift_N + 1e-6 >= aero.weight_N;
  const passStability = !aero || (aero.stable && !aero.stalled);

  if (!passStress) {
    const hot = partResults.slice().sort((a, b) => b.utilization - a.utilization)[0];
    if (hot) failures.push({ mode: "yield", location: hot.name, utilization: hot.utilization, explanationId: "yield" });
  }
  if (!passDeflection) {
    const hot = partResults.slice().sort((a, b) => b.deflection_mm - a.deflection_mm)[0];
    if (hot) failures.push({ mode: "excessive_deflection", location: hot.name, utilization: hot.deflection_mm / (input.limits.maxDeflection_mm || 1), explanationId: "inertia" });
  }
  if (!passBuckling) {
    failures.push({ mode: "buckling", location: partResults[0]?.name ?? "part", utilization: 1, explanationId: "buckling" });
  }
  if (!passMass) failures.push({ mode: "mass_overrun", location: "vehicle", utilization: mass_g / (input.limits.maxMass_g || 1), explanationId: "inertia" });
  if (!passCost) failures.push({ mode: "cost_overrun", location: "unit cost", utilization: (selected?.terms.unit ?? 0) / (input.limits.maxCost_usd || 1), explanationId: "tooling" });
  if (!passDfm) failures.push({ mode: "dfm_violation", location: "process", utilization: scored / 100, explanationId: "dfm" });
  if (aero?.stalled) failures.push({ mode: "stall", location: "wing", utilization: 1, explanationId: "stall" });
  if (aero && !aero.stable) failures.push({ mode: "static_instability", location: "cg", utilization: aero.sm, explanationId: "margin" });

  let modal_hz: number | null = null;
  let resonance = false;
  const arm = partResults[0];
  if (arm && input.fidelity !== "L0") {
    // The wing result stores both halves' mass; each cantilever has half of it.
    const modalMassKg = arm.mass_g / 1000 * (primary?.liftFed ? 0.5 : 1);
    const mu = modalMassKg / Math.max(arm.length_m, 1e-6);
    const e = arm.e_GPa * 1e9;
    const supported = primary?.loads.some(l => l.kind === "bending_center") ?? false;
    const beta = (supported ? Math.PI : 1.875104) ** 2;
    modal_hz = (beta / (2 * Math.PI)) * Math.sqrt(e * arm.inertia_m4 / (mu * arm.length_m ** 4));
    const ex = input.excitation_hz ?? 0;
    resonance = ex > 0 && Math.abs(modal_hz - ex) / modal_hz <= 0.15;
    assumptions.push(`L1 modal: uniform Euler-Bernoulli beam, ${supported ? "simply supported, βL = π" : "cantilever, βL = 1.875"}. Beam mass only; attached motors/payload, joints and damping are omitted. One mode only.`);
    if (resonance) failures.push({ mode: "resonance", location: arm.name, utilization: 1, explanationId: "resonance" });
  } else {
    assumptions.push("Fidelity is L0. The first bending frequency is not computed until you turn on L1.");
  }

  return {
    validInputs: true,
    modelWarnings,
    mass_g,
    vehicleMass_g,
    minSafetyFactor: minSf,
    maxUtilization: maxUtil,
    maxDeflection_mm: maxDefl,
    cost: selected?.terms ?? null,
    recommended,
    quotes,
    dfmScore: scored,
    dfmChecks,
    incompatible,
    parts: partResults,
    aero,
    modal_hz,
    resonance,
    passStress,
    passBuckling,
    passMass,
    passCost,
    passDeflection,
    passDfm,
    passAero,
    passStability,
    thrustToWeight,
    assumptions,
    failures,
    inputHash,
  };
}

export type SimResult = {
  kind: AnalysisKind;
  fidelity: "L0" | "L1" | "L2";
  pass: boolean;
  scalarResults: Record<string, { value: number; unit: string }>;
  failures: FailureMode[];
  warnings: string[];
  assumptions: string[];
  computeMs: number;
  inputHash: string;
};

export function runAnalysis(kind: AnalysisKind, input: DesignInput, materials: Material[], processTable: Process[]): SimResult {
  const ev = evaluate(input, materials, processTable);
  const scalars: Record<string, { value: number; unit: string }> = {
    mass_g: { value: ev.mass_g, unit: "g" },
    safetyFactor: { value: ev.minSafetyFactor, unit: "" },
    deflection_mm: { value: ev.maxDeflection_mm, unit: "mm" },
    utilization: { value: ev.maxUtilization, unit: "" },
  };
  if (ev.cost) scalars.unitCost_usd = { value: ev.cost.unit, unit: "USD" };
  if (ev.aero) {
    scalars.lift_N = { value: ev.aero.lift_N, unit: "N" };
    scalars.drag_N = { value: ev.aero.drag_N, unit: "N" };
    scalars.staticMargin = { value: ev.aero.sm, unit: "" };
  }
  if (ev.modal_hz !== null) scalars.modal_hz = { value: ev.modal_hz, unit: "Hz" };

  const applicable = kind === "buckling" ? ev.parts.some(p => p.buckling_N !== null)
    : kind === "aero_polar" || kind === "stability" ? ev.aero !== null
    : kind === "modal" ? ev.modal_hz !== null
    : kind === "cost" ? ev.cost !== null
    : kind === "static_stress" ? input.parts.some(p => p.liftFed || p.loads.some(l => l.magnitude_N > 0))
    : true;
  const pass = ev.validInputs && applicable && (
    kind === "static_stress"
      ? ev.passStress && ev.passDeflection
      : kind === "buckling"
        ? ev.passBuckling
        : kind === "aero_polar"
          ? ev.passAero && !(ev.aero?.stalled ?? false)
          : kind === "stability"
            ? ev.passStability
            : kind === "dfm"
              ? ev.passDfm
              : kind === "cost"
                ? ev.passCost
                : kind === "modal"
                  ? input.fidelity !== "L0" && !ev.resonance
                  : false);

  const warnings = [...ev.incompatible, ...ev.modelWarnings];
  if (!applicable) warnings.push(`${kind}: not applicable to the supplied model; no pass is awarded.`);
  if (kind === "modal" && input.fidelity === "L0") warnings.push("Modal is an L1 check. L0 does not invent a frequency.");

  return {
    kind,
    fidelity: input.fidelity,
    pass,
    scalarResults: scalars,
    failures: ev.failures.filter((f) => relevant(kind, f.mode)),
    warnings,
    assumptions: ev.assumptions,
    computeMs: 0,
    inputHash: hashCanon({ kind, hash: ev.inputHash }),
  };
}

function relevant(kind: AnalysisKind, mode: string): boolean {
  if (kind === "static_stress") return mode === "yield" || mode === "excessive_deflection";
  if (kind === "buckling") return mode === "buckling";
  if (kind === "aero_polar") return mode === "stall";
  if (kind === "stability") return mode === "static_instability";
  if (kind === "dfm") return mode === "dfm_violation";
  if (kind === "cost") return mode === "cost_overrun";
  if (kind === "modal") return mode === "resonance";
  return true;
}
