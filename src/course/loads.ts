/**
 * Engineering 101, Week 23 — load paths, margins, and FMEA.
 *
 * Pure structural-margin and failure-mode arithmetic. No UI, no side
 * effects; everything here is deterministic and unit-testable.
 *
 * Conventions used across the lessons:
 *  - FoS (factor of safety) = allowable / applied. A ratio, always >= 0.
 *  - MS (margin of safety) = FoS − 1. Zero means the design exactly
 *    consumes the allowable; negative means it fails the case.
 *  - Limit load is the worst the design is expected to see in service.
 *    Ultimate load = limit × ultimate factor (1.5 is the aircraft
 *    convention); ultimate must not break the part.
 *  - FMEA RPN = severity × occurrence × detection, each 1–10.
 */

export type MarginVerdict = "fails" | "thin" | "passes";

const THIN_BELOW = 0.15; // MS under 15% is a flag, not a failure

export function factorOfSafety(allowable: number, applied: number): number {
  if (!(applied > 0)) throw new Error("applied load/stress must be positive");
  return allowable / applied;
}

export function marginOfSafety(allowable: number, applied: number): number {
  return factorOfSafety(allowable, applied) - 1;
}

export function marginVerdict(ms: number): MarginVerdict {
  if (!Number.isFinite(ms)) throw new Error("margin must be finite");
  if (ms < 0) return "fails";
  if (ms < THIN_BELOW) return "thin";
  return "passes";
}

/** Ultimate load from the limit load and the ultimate factor (1.5 aircraft default). */
export function ultimateLoad(limitLoad: number, ultimateFactor = 1.5): number {
  if (!(limitLoad >= 0)) throw new Error("limit load must be non-negative");
  if (!(ultimateFactor > 0)) throw new Error("ultimate factor must be positive");
  return limitLoad * ultimateFactor;
}

/** One line of a margin table: what the design sees vs what it tolerates. */
export interface MarginRow {
  label: string;
  /** load or stress the design actually sees (units are the row's own) */
  applied: number;
  /** load or stress the part tolerates (same units as applied) */
  allowable: number;
}

export interface MarginResult extends MarginRow {
  fos: number;
  ms: number;
  verdict: MarginVerdict;
}

export function buildMarginTable(rows: MarginRow[]): MarginResult[] {
  return rows.map((row) => {
    const fos = factorOfSafety(row.allowable, row.applied);
    const ms = fos - 1;
    return { ...row, fos, ms, verdict: marginVerdict(ms) };
  });
}

/** The table is only as good as its worst line. */
export function tableVerdict(results: MarginResult[]): MarginVerdict {
  if (results.some((r) => r.verdict === "fails")) return "fails";
  if (results.some((r) => r.verdict === "thin")) return "thin";
  return "passes";
}

/** The governing line — the one with the smallest margin. */
export function lowestMargin(results: MarginResult[]): MarginResult | null {
  if (results.length === 0) return null;
  return results.reduce((worst, r) => (r.ms < worst.ms ? r : worst));
}

// ---------------------------------------------------------------------------
// FMEA: failure modes, effects, causes; severity/occurrence/detection; RPN.
// ---------------------------------------------------------------------------

function checkScale(name: string, value: number): void {
  if (!Number.isInteger(value) || value < 1 || value > 10) {
    throw new Error(`${name} must be an integer 1–10`);
  }
}

/** Risk priority number: severity × occurrence × detection. Higher is worse. */
export function riskPriority(severity: number, occurrence: number, detection: number): number {
  checkScale("severity", severity);
  checkScale("occurrence", occurrence);
  checkScale("detection", detection);
  return severity * occurrence * detection;
}

export interface FmeaRow {
  mode: string;
  effect: string;
  cause: string;
  severity: number;
  occurrence: number;
  detection: number;
  /** what changes so the failure gets rarer or easier to catch */
  mitigation: string;
  occurrenceAfter: number;
  detectionAfter: number;
}

export interface FmeaScore {
  before: number;
  after: number;
  delta: number;
  deltaPct: number;
}

export function fmeaScore(row: FmeaRow): FmeaScore {
  const before = riskPriority(row.severity, row.occurrence, row.detection);
  const after = riskPriority(row.severity, row.occurrenceAfter, row.detectionAfter);
  const delta = before - after;
  return { before, after, delta, deltaPct: before > 0 ? (delta / before) * 100 : 0 };
}

/** Rows ranked worst-first by their pre-mitigation RPN. */
export function fmeaRanking(rows: FmeaRow[]): { row: FmeaRow; score: FmeaScore }[] {
  return rows
    .map((row) => ({ row, score: fmeaScore(row) }))
    .sort((a, b) => b.score.before - a.score.before);
}
