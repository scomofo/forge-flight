import type { CurvePoint } from "./mechresponse.ts";

/** Axis ranges for a full record and a readable initial-region view.
 * No interpolation, model refit or alteration of the scored samples.
 */
export function curveReadingRanges(curve: CurvePoint[], E: number) {
  if (curve.length < 2 || !Number.isFinite(E) || E <= 0 || curve.some(p => !Number.isFinite(p.strain) || !Number.isFinite(p.stress))) {
    throw new Error("Curve reading requires finite samples and a positive fitted modulus");
  }
  const maxStrain = Math.max(...curve.map(p => p.strain));
  const maxStress = Math.max(...curve.map(p => p.stress));
  if (maxStrain <= 0 || maxStress <= 0) throw new Error("Curve reading requires a positive axis range");
  const niceCeiling = (value: number) => {
    const step = 10 ** Math.floor(Math.log10(value)) / 2;
    return Math.ceil(value / step) * step;
  };
  return {
    fullStrain: niceCeiling(maxStrain),
    initialStrain: Math.min(niceCeiling(maxStrain), niceCeiling(0.002 + 1.25 * maxStress / E)),
    stress: niceCeiling(maxStress * 1.05),
  };
}
