/**
 * Engineering 101, Week 21 — requirements & design decisions.
 *
 * Pure, testable logic for the requirements-packet and assumption-ledger
 * benches: requirement-quality heuristics, verification-matrix completeness,
 * and the assumption ledger that every decision number traces back to.
 */

export type VerificationMethod =
  | "test"
  | "inspection"
  | "analysis"
  | "demonstration";

export const VERIFICATION_METHODS: { value: VerificationMethod; label: string; hint: string }[] = [
  { value: "test", label: "Test", hint: "Exercise the article and measure the outcome." },
  { value: "inspection", label: "Inspection", hint: "Look at it — dimensions, finish, markings." },
  { value: "analysis", label: "Analysis", hint: "Calculate or simulate; no article needed." },
  { value: "demonstration", label: "Demonstration", hint: "Operate it and watch it behave." },
];

export type Requirement = {
  id: string;
  text: string;
  verification: VerificationMethod | null;
  verificationNote: string;
};

export type RequirementIssue = {
  code: "unmeasurable" | "compound" | "vague" | "weak-form";
  message: string;
};

const UNIT_TOKENS = [
  "mm", "cm", "m", "km", "in", "ft",
  "mg", "g", "kg", "t", "lb",
  "ms", "s", "min", "h", "hr", "hour", "day", "year",
  "N", "kN", "lbf",
  "Pa", "kPa", "MPa", "GPa", "psi",
  "W", "kW", "hp",
  "J", "kJ", "kWh",
  "V", "A", "mA", "Ω", "ohm",
  "°C", "°F", "K", "degC", "degF",
  "lm", "lux",
  "dB", "Hz", "kHz", "rpm",
  "%", "percent",
  // Countable events are their own ruler: "10 000 cycles" needs no conversion.
  "cycle", "cycles", "drop", "drops", "insertion", "insertions", "operation", "operations",
];

const WEASEL_WORDS = [
  "bright", "easy", "easily", "simple", "simply", "user-friendly",
  "fast", "quick", "slow", "adequate", "adequately", "sufficient", "sufficiently",
  "robust", "efficient", "reliable", "durable", "comfortable", "nice", "good",
  "bad", "reasonable", "reasonably", "as needed", "as necessary", "timely",
  "promptly", "minimal", "maximal", "optimal", "best", "worst",
];

const unitPattern = new RegExp(
  `(?:^|\\s|[\\d(])(${UNIT_TOKENS.map((u) => u.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})(?:\\b|s\\b|/s\\b)`,
  "i",
);

const numberPattern = /-?\d+(?:\.\d+)?(?:\s*[×x]\s*10\^?-?\d+)?/;

/** A requirement is measurable when it names a number AND the ruler for that number. */
export function isMeasurable(text: string): boolean {
  return numberPattern.test(text) && unitPattern.test(text);
}

/** A requirement is singular when it makes one demand — no "and/or" compounds. */
export function isSingular(text: string): boolean {
  const lowered = ` ${text.toLowerCase()} `;
  const compounds = [" and ", " or ", ";", " as well as ", " plus "];
  const modalCount = (lowered.match(/\b(shall|must|will)\b/g) ?? []).length;
  return !compounds.some((c) => lowered.includes(c)) && modalCount <= 1;
}

/** A requirement is unambiguous when no unmeasured weasel word does the real work. */
export function isUnambiguous(text: string): boolean {
  const lowered = text.toLowerCase();
  return !WEASEL_WORDS.some((w) => lowered.includes(w) && !numberPattern.test(text));
}

/** A requirement uses the binding form: "shall" (preferred) or "must". */
export function hasBindingForm(text: string): boolean {
  return /\b(shall|must)\b/i.test(text);
}

/** Grade a requirement statement; returns the list of problems found (empty = clean). */
export function gradeRequirement(text: string): RequirementIssue[] {
  const issues: RequirementIssue[] = [];
  if (text.trim().length === 0) {
    return [{ code: "unmeasurable", message: "Empty — a requirement has to say something." }];
  }
  if (!isMeasurable(text)) {
    issues.push({
      code: "unmeasurable",
      message: "Not measurable: a number plus its unit (or an explicit pass/fail criterion) is missing.",
    });
  }
  if (!isSingular(text)) {
    issues.push({
      code: "compound",
      message: "Compound: more than one demand hides in this sentence. Split it so each can pass or fail alone.",
    });
  }
  if (!isUnambiguous(text)) {
    issues.push({
      code: "vague",
      message: "Vague word without a number doing the real work. Replace the adjective with the number it stands for.",
    });
  }
  if (!hasBindingForm(text)) {
    issues.push({
      code: "weak-form",
      message: "Weak form: use \"shall\" (or \"must\") so the sentence is a demand, not a wish.",
    });
  }
  return issues;
}

/** Completeness of the verification matrix: every requirement traced to a method and a how. */
export type MatrixVerdict = {
  missingMethod: string[];
  missingNote: string[];
  complete: boolean;
};

export function matrixVerdict(requirements: Requirement[]): MatrixVerdict {
  const missingMethod = requirements.filter((r) => r.verification === null).map((r) => r.id);
  const missingNote = requirements
    .filter((r) => r.verification !== null && r.verificationNote.trim().length === 0)
    .map((r) => r.id);
  return { missingMethod, missingNote, complete: missingMethod.length === 0 && missingNote.length === 0 };
}

/* ------------------------------------------------------------------ */
/* Assumption ledger                                                   */
/* ------------------------------------------------------------------ */

export type LedgerConfidence = "low" | "medium" | "high";

export type LedgerEntry = {
  id: string;
  claim: string;
  provenance: string;
  confidence: LedgerConfidence;
  resolved: boolean;
  resolution: string;
};

export type LedgerStats = {
  total: number;
  resolved: number;
  withProvenance: number;
  resolutionRate: number;
  openHighRisk: number;
};

/** Ledger statistics. An entry is "high risk" while it is unresolved AND confidence is low. */
export function ledgerStats(entries: LedgerEntry[]): LedgerStats {
  const total = entries.length;
  const resolved = entries.filter((e) => e.resolved).length;
  const withProvenance = entries.filter((e) => e.provenance.trim().length > 0).length;
  const openHighRisk = entries.filter((e) => !e.resolved && e.confidence === "low").length;
  return {
    total,
    resolved,
    withProvenance,
    resolutionRate: total === 0 ? 1 : resolved / total,
    openHighRisk,
  };
}

/** The three sample requirements the packet bench opens with — two flawed, one clean. */
export const SAMPLE_REQUIREMENTS: Requirement[] = [
  {
    id: "REQ-1",
    text: "The carrier shall hold the phone through a 1 m drop onto concrete.",
    verification: null,
    verificationNote: "",
  },
  {
    id: "REQ-2",
    text: "The carrier should be light and easy to use with gloves on.",
    verification: null,
    verificationNote: "",
  },
  {
    id: "REQ-3",
    text: "The carrier shall survive 10 000 clip open/close cycles with no visible cracking.",
    verification: null,
    verificationNote: "",
  },
];

/** The sample ledger: Mars Climate Orbiter's missing conversion, as a ledger entry. */
export const SAMPLE_LEDGER: LedgerEntry[] = [
  {
    id: "A-1",
    claim: "Trajectory software expects impulse in newton-seconds.",
    provenance: "Interface spec, section 4.2",
    confidence: "high",
    resolved: true,
    resolution: "Verified against the spec; both teams sign the same page.",
  },
  {
    id: "A-2",
    claim: "Subcontractor delivers small-force telemetry in pound-force seconds; conversion is handled.",
    provenance: "",
    confidence: "low",
    resolved: false,
    resolution: "",
  },
];
