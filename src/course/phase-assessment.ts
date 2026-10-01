/** Grade ordered phase identities, not a position-only answer key. */
import {
  eutecticRegionAt,
  eutecticTieLineAt,
  leverFractions,
  PHASE_LABELS,
  EUTECTIC_REGION_LABELS,
} from "./phasediagrams.ts";

export interface PhaseAnswer {
  region: string;
  cLeft: string;
  cRight: string;
  wLeft: string;
  wRight: string;
}
const number = (s: string) => (s.trim() === "" ? NaN : Number(s));
export function gradePhaseAnswer(c0: number, t: number, answer: PhaseAnswer) {
  const region = eutecticRegionAt(c0, t),
    tie = eutecticTieLineAt(c0, t);
  const regionOk = answer.region === region;
  if (!tie) {
    const underdetermined = region === "eutectic" || region === "pure-melting";
    return {
      regionOk,
      tieOk: answer.cLeft.trim() === "" && answer.cRight.trim() === "",
      fracOk: answer.wLeft.trim() === "" && answer.wRight.trim() === "",
      expRegion: EUTECTIC_REGION_LABELS[region],
      expTie:
        "no two-phase tie line for this state; leave both endpoints blank",
      expFrac: underdetermined
        ? "coexisting phase amounts are not fixed by composition and temperature alone; leave the two-phase fields blank"
        : `100% ${EUTECTIC_REGION_LABELS[region]} in the limiting single-phase state; leave the two-phase fields blank`,
    };
  }
  const a = number(answer.cLeft),
    b = number(answer.cRight),
    fa = number(answer.wLeft),
    fb = number(answer.wRight);
  const fractions = leverFractions(c0, tie.cLeft, tie.cRight);
  return {
    regionOk,
    tieOk:
      Number.isFinite(a) &&
      Number.isFinite(b) &&
      a < b &&
      a >= 0 &&
      b <= 100 &&
      a <= c0 &&
      c0 <= b &&
      Math.abs(a - tie.cLeft) <= 1.5 &&
      Math.abs(b - tie.cRight) <= 1.5,
    fracOk:
      [fa, fb].every((v) => Number.isFinite(v) && v >= 0 && v <= 1) &&
      Math.abs(fa + fb - 1) <= 0.02 &&
      Math.abs(fa - fractions.wA) <= 0.03 &&
      Math.abs(fb - fractions.wB) <= 0.03,
    expRegion: EUTECTIC_REGION_LABELS[region],
    expTie: `${PHASE_LABELS[tie.leftPhase]} ${tie.cLeft.toFixed(2)} → ${PHASE_LABELS[tie.rightPhase]} ${tie.cRight.toFixed(2)} wt% Sn`,
    expFrac: `${fractions.wA.toFixed(3)} ${PHASE_LABELS[tie.leftPhase]} (low end), ${fractions.wB.toFixed(3)} ${PHASE_LABELS[tie.rightPhase]} (high end); mass fractions sum to 1`,
  };
}
