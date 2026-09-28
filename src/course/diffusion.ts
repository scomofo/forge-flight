/**
 * Pure diffusion and defect-concentration logic for Materials 101 Week 13.
 *
 * No UI here — these are the arithmetic kernels behind the diffusion-profile
 * bench and the vacancy-concentration readouts. All concentrations are mass
 * fractions (wt%) unless noted; D in m²/s; T in kelvin; Q in J/mol.
 */

export const GAS_CONSTANT = 8.314; // J/(mol·K)
export const BOLTZMANN_EV = 8.617333e-5; // eV/K

/**
 * erf(x) via the Abramowitz–Stegun 7.1.26 rational approximation.
 * Absolute error ≤ 1.5e-7 everywhere — plenty for a teaching bench.
 */
export function erf(x: number): number {
  if (x === 0) return 0;
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * ax);
  const y =
    1 -
    (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t +
      0.254829592) *
      t) *
      Math.exp(-ax * ax);
  return sign * y;
}

export function erfc(x: number): number {
  return 1 - erf(x);
}

/** Inverse erf by bisection. Throws for |y| >= 1. */
export function inverseErf(y: number): number {
  if (!Number.isFinite(y) || Math.abs(y) >= 1) {
    throw new Error(`inverseErf needs |y| < 1, got ${y}`);
  }
  let lo = -4;
  let hi = 4;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (erf(mid) < y) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** Arrhenius diffusivity D = D0 · exp(−Q / RT). */
export function arrheniusD(D0: number, Q: number, T: number): number {
  return D0 * Math.exp(-Q / (GAS_CONSTANT * T));
}

/**
 * Characteristic diffusion length 2√(Dt) — the distance scale over which the
 * error-function profile decays. Doubling depth costs 4× the time.
 */
export function diffusionLength(D: number, t: number): number {
  return 2 * Math.sqrt(D * t);
}

/**
 * Semi-infinite solid, constant surface concentration Cs, uniform initial C0:
 * C(x, t) = Cs − (Cs − C0) · erf(x / (2√(Dt))).
 */
export function concentrationProfile(
  Cs: number,
  C0: number,
  D: number,
  t: number,
  x: number,
): number {
  const L = 2 * Math.sqrt(D * t);
  if (L <= 0 || x < 0) return x < 0 ? Cs : C0;
  return Cs - (Cs - C0) * erf(x / L);
}

/**
 * Depth at which the concentration falls to Cx (C0 < Cx < Cs):
 * x = 2√(Dt) · erf⁻¹((Cs − Cx) / (Cs − C0)).
 */
export function caseDepth(Cs: number, C0: number, Cx: number, D: number, t: number): number {
  if (!(C0 < Cx && Cx < Cs)) {
    throw new Error(`need C0 < Cx < Cs, got ${C0}, ${Cx}, ${Cs}`);
  }
  const z = inverseErf((Cs - Cx) / (Cs - C0));
  return z * diffusionLength(D, t);
}

/**
 * Time at a second diffusivity that delivers the same Dt product —
 * the time–temperature trade. t2 = t1 · D1 / D2.
 */
export function equivalentTime(t1: number, D1: number, D2: number): number {
  if (D2 <= 0) throw new Error(`need D2 > 0, got ${D2}`);
  return (t1 * D1) / D2;
}

/** Equilibrium vacancy site fraction n/N = exp(−Qv / kT), Qv in eV. */
export function vacancyFraction(QvEv: number, T: number): number {
  return Math.exp(-QvEv / (BOLTZMANN_EV * T));
}

export type Diffusant = {
  id: string;
  label: string;
  D0: number; // m²/s
  Q: number; // J/mol
  note: string;
};

/** Classroom diffusant data — standard textbook (Callister-style) values. */
export const DIFFUSANTS: Diffusant[] = [
  {
    id: "c-gamma",
    label: "Carbon in austenite (γ-Fe)",
    D0: 2.3e-5,
    Q: 148e3,
    note: "FCC iron. Carburizing lives here: 850–950 °C.",
  },
  {
    id: "c-alpha",
    label: "Carbon in ferrite (α-Fe)",
    D0: 2.2e-4,
    Q: 122e3,
    note: "BCC iron — more open lattice, faster diffusion at the same temperature.",
  },
  {
    id: "c-titanium",
    label: "Carbon in titanium",
    D0: 5.1e-4,
    Q: 182e3,
    note: "High Q means temperature buys more leverage here than in iron.",
  },
];

export const VACANCY_QV_EV = 0.9; // copper, eV — classroom value
