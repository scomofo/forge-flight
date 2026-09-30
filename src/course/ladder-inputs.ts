/** Selected teaching inputs, not certified material or process data. Units are explicit. */
export const LADDER_INPUTS = {
  water: { densityKgM3: 1000, gravityMPerS2: 9.81, totalPressureKPa: 200 },
  steelThermal: { modulusPa: 200e9, expansionPerK: 12e-6, lengthM: 1 },
  rodMaterials: [
    { name: "Steel", e: 200e9, rho: 7800 },
    { name: "Aluminum", e: 70e9, rho: 2700 },
    { name: "Polyethylene", e: 2e9, rho: 950 },
  ],
  mode: { sideM: 0.02, modulusPa: 200e9, densityKgM3: 7800 },
  creep: { referenceHours: 1000, referenceStressMPa: 100, referenceTemperatureK: 800, exponent: 5, qOverRInK: 30000 },
  panelMaterials: [
    { name: "Steel", e: 200, rho: 7.8 },
    { name: "Aluminum", e: 70, rho: 2.7 },
    { name: "Composite (along fiber)", e: 140, rho: 1.6 },
    { name: "Wood (along grain)", e: 10, rho: 0.5 },
  ],
  whirl: { diameterM: 0.02, modulusPa: 200e9, diskMassKg: 2 },
  // a in metres; ΔK in MPa√m. C has units m/cycle/(MPa√m)^3.
  crack: { parisC: 6.9e-12, exponent: 3, stressRangeMPa: 120, maximumStressMPa: 120, geometryFactor: 1.12, toughnessMPaSqrtM: 50 },
  taylor: { exponent: 0.2, coefficient: 200 }, // V in m/min, T in min
  bonus: { holeMmcMm: 10, positionDiameterAtMmcMm: 0.2 },
} as const;

/** The position allowance is a zone DIAMETER, not a radial center offset. */
export function bonusPosition(holeMm: number) {
  const { holeMmcMm, positionDiameterAtMmcMm } = LADDER_INPUTS.bonus;
  if (!Number.isFinite(holeMm) || holeMm < holeMmcMm) throw new RangeError("Hole is below MMC or is not finite");
  const bonusMm = holeMm - holeMmcMm;
  const diameterMm = positionDiameterAtMmcMm + bonusMm;
  return { bonusMm, diameterMm, radialMm: diameterMm / 2 };
}

function positive(value: number, label: string): number {
  if (!Number.isFinite(value) || value <= 0) throw new RangeError(`${label} must be positive and finite`);
  return value;
}

export function ladderCreepHours(stressMPa: number, temperatureK: number): number {
  const c = LADDER_INPUTS.creep;
  return c.referenceHours * (c.referenceStressMPa / positive(stressMPa, "Stress")) ** c.exponent
    * Math.exp(c.qOverRInK * (1 / positive(temperatureK, "Absolute temperature") - 1 / c.referenceTemperatureK));
}

export function ladderModeHz(spanM: number): number {
  const m = LADDER_INPUTS.mode;
  const inertia = m.sideM ** 4 / 12;
  const massPerLength = m.densityKgM3 * m.sideM ** 2;
  return (Math.PI / positive(spanM, "Span")) ** 2 * Math.sqrt(m.modulusPa * inertia / massPerLength) / (2 * Math.PI);
}

export function ladderWhirlRpm(lengthM: number): number {
  const s = LADDER_INPUTS.whirl;
  const inertia = Math.PI * s.diameterM ** 4 / 64;
  const stiffness = 48 * s.modulusPa * inertia / positive(lengthM, "Length") ** 3;
  return Math.sqrt(stiffness / s.diskMassKg) * 60 / (2 * Math.PI);
}

export function ladderCrackGrowth(foundMm: number): { cycles: number; criticalM: number } {
  const a0 = positive(foundMm, "Detected crack size") / 1000;
  const c = LADDER_INPUTS.crack;
  const criticalM = (c.toughnessMPaSqrtM / (c.geometryFactor * c.maximumStressMPa)) ** 2 / Math.PI;
  const b = c.parisC * (c.geometryFactor * c.stressRangeMPa * Math.sqrt(Math.PI)) ** c.exponent;
  const cycles = a0 >= criticalM ? 0 : 2 * (1 / Math.sqrt(a0) - 1 / Math.sqrt(criticalM)) / b;
  return { cycles, criticalM };
}

export function ladderToolLifeMinutes(speedMPerMin: number): number {
  const t = LADDER_INPUTS.taylor;
  return (t.coefficient / positive(speedMPerMin, "Cutting speed")) ** (1 / t.exponent);
}
