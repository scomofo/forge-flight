/**
 * Engineering 101, Week 29 — safety, ethics & communication: pure, testable logic.
 *
 * Design-review mechanics: seeded design packages with planted issues, finding
 * severity classification, review verdicts driven by open findings, and memo
 * completeness checks. No UI here — everything is deterministic and unit-testable.
 */

export type Severity = "critical" | "major" | "minor" | "observation";

export type ReviewVerdict = "approve" | "approve-with-conditions" | "reject";

export type Verdict = ReviewVerdict;

/** One planted issue in a review design package. */
export interface DesignIssue {
  id: string;
  /** Where in the package it lives: "sheet 2", "calculation 4", ... */
  location: string;
  description: string;
  severity: Severity;
  /** The requirement or standard clause it breaks, when one applies. */
  clause: string;
}

/** A finding the reviewer filed, with its disposition. */
export interface ReviewFinding {
  issueId: string;
  severity: Severity;
  addressed: boolean;
}

/**
 * The seeded Week-29 review package: a two-page tow-bar design for a light
 * trailer. Six planted issues, spanning all four severities. The severities
 * are the course's answer key — the bench grades the learner against them.
 */
export const SEEDED_PACKAGE: DesignIssue[] = [
  {
    id: "ISS-1",
    location: "sheet 1 — tow-bar assembly",
    description:
      "Single-point failure: one shear pin carries the full tow load. Loss of the pin is loss of the trailer.",
    severity: "critical",
    clause: "REQ-TB-4: no single-point failure in the load path",
  },
  {
    id: "ISS-2",
    location: "calculation 2 — lug strength",
    description:
      "Lug factor of safety is 1.4. The drawing note requires 2.0 minimum on all load-carrying lugs.",
    severity: "major",
    clause: "drawing note 7: FoS ≥ 2.0 on load-carrying lugs",
  },
  {
    id: "ISS-3",
    location: "sheet 1 — materials and finishes",
    description:
      "No corrosion plan: steel-on-steel pin and lug in saltwater service, no coating or isolation noted.",
    severity: "major",
    clause: "REQ-TB-9: corrosion protection for marine service",
  },
  {
    id: "ISS-4",
    location: "sheet 2 — clamp bolts",
    description: "Torque value missing for the four M12 clamp bolts.",
    severity: "minor",
    clause: "drawing note 3: all fasteners torqued to a stated value",
  },
  {
    id: "ISS-5",
    location: "calculation 1 — load table",
    description: "Units mixed on one sheet: the load table uses kN in column A and lbf in column C.",
    severity: "observation",
    clause: "company drafting standard: one unit system per sheet",
  },
  {
    id: "ISS-6",
    location: "calculation 3 — fatigue check",
    description:
      "Fatigue check assumes 10⁴ cycles over the part's life with no basis stated. The assumption ledger has no entry.",
    severity: "major",
    clause: "REQ-TB-6: design life 10⁶ cycles or a stated, owned assumption",
  },
];

/** Plausible-sounding observations that are NOT planted issues — distractors for the bench. */
export const DISTRACTORS: { id: string; text: string }[] = [
  {
    id: "DIS-1",
    text: "The tow-bar is painted safety yellow; the drawing does not call out the paint brand.",
  },
  {
    id: "DIS-2",
    text: "Sheet 2 uses a 1:5 scale instead of 1:4. The scale bar is present and correct.",
  },
  {
    id: "DIS-3",
    text: "The part mass is 3.2 kg; a lighter version could exist but no mass requirement applies.",
  },
];

/**
 * The review verdict follows the open findings: any unaddressed critical is
 * a rejection, any unaddressed major is conditional approval, otherwise clean.
 */
export function verdictFor(open: Severity[]): ReviewVerdict {
  if (open.includes("critical")) return "reject";
  if (open.includes("major")) return "approve-with-conditions";
  return "approve";
}

export interface ReviewScore {
  found: string[];
  missed: string[];
  falseAlarms: string[];
  recall: number;
  severityCorrect: number;
  severityTotal: number;
}

/**
 * Grade a reviewer's filed issue ids (and their assigned severities) against
 * the seeded package.
 */
export function scoreReview(
  filedIds: string[],
  assigned: Record<string, Severity>,
): ReviewScore {
  const packageIds = new Set(SEEDED_PACKAGE.map((i) => i.id));
  const found = filedIds.filter((id) => packageIds.has(id));
  const missed = SEEDED_PACKAGE.map((i) => i.id).filter((id) => !filedIds.includes(id));
  const falseAlarms = filedIds.filter((id) => !packageIds.has(id));
  const severityTotal = found.length;
  const severityCorrect = found.filter((id) => {
    const issue = SEEDED_PACKAGE.find((i) => i.id === id);
    return issue !== undefined && assigned[id] === issue.severity;
  }).length;
  return {
    found,
    missed,
    falseAlarms,
    recall: SEEDED_PACKAGE.length === 0 ? 1 : found.length / SEEDED_PACKAGE.length,
    severityCorrect,
    severityTotal,
  };
}

export interface MemoInput {
  verdict: ReviewVerdict | null;
  findings: ReviewFinding[];
  memoText: string;
  signature: string;
}

export interface MemoGrade {
  issues: string[];
  complete: boolean;
  expectedVerdict: ReviewVerdict;
}

/**
 * Check a design-review memo for completeness: a verdict, every filed
 * finding addressed, a written memo, a signature, and — the honest part —
 * whether the verdict matches what the open findings demand.
 */
export function gradeMemo(input: MemoInput): MemoGrade {
  const issues: string[] = [];
  if (input.verdict === null) issues.push("No verdict issued. A review ends in approve, approve-with-conditions, or reject.");
  const open = input.findings.filter((f) => !f.addressed).map((f) => f.severity);
  const expectedVerdict = verdictFor(open);
  if (input.verdict !== null && input.verdict !== expectedVerdict) {
    issues.push(
      `The verdict does not match the open findings. With ${open.length} unaddressed finding(s), the required verdict is "${expectedVerdict}".`,
    );
  }
  const unaddressed = input.findings.filter((f) => !f.addressed);
  if (input.findings.length > 0 && unaddressed.length === input.findings.length) {
    issues.push("No finding is addressed. A memo must say what happens next for each finding.");
  }
  if (input.memoText.trim().length < 40) {
    issues.push("The memo is too thin. Say what was reviewed, what was found, and why the verdict follows.");
  }
  if (input.signature.trim().length === 0) {
    issues.push("Unsigned. A review memo is a signature on a professional judgment.");
  }
  return { issues, complete: issues.length === 0, expectedVerdict };
}

/** Consequence classes for the Week-29 factor-of-safety table exercise. */
export type ConsequenceClass = "low" | "moderate" | "high" | "catastrophic";

export const FOS_TABLE: Record<ConsequenceClass, { label: string; fos: number; note: string }> = {
  low: {
    label: "Low — property damage only, no injury plausible",
    fos: 1.5,
    note: "Loads well known, inspection easy.",
  },
  moderate: {
    label: "Moderate — minor injury possible",
    fos: 2.0,
    note: "The default for lifting and towing hardware.",
  },
  high: {
    label: "High — serious injury plausible",
    fos: 3.0,
    note: "Uncertain loads or hard-to-inspect parts.",
  },
  catastrophic: {
    label: "Catastrophic — loss of life plausible",
    fos: 5.0,
    note: "Crewed flight, pressure vessels, elevators.",
  },
};

/** The Week-29 clause-reading exercise: excerpt, its shall-statements, and a compliance claim. */
export interface ClauseExercise {
  id: string;
  title: string;
  excerpt: string;
  /** The claims the learner must classify as shall / not-a-shall. */
  claims: { text: string; isShall: boolean }[];
  compliance: { claim: string; complies: boolean; why: string };
}

export const CLAUSE_EXERCISES: ClauseExercise[] = [
  {
    id: "CL-1",
    title: "Tow-bar standard, §4.2 — strength",
    excerpt:
      "§4.2 The tow bar shall withstand three times the rated tow load without permanent deformation. The test should be performed at room temperature. Appendix A gives guidance on fixture design.",
    claims: [
      { text: "Withstand 3× rated load without permanent deformation", isShall: true },
      { text: "Test at room temperature", isShall: false },
      { text: "Follow Appendix A for the fixture", isShall: false },
    ],
    compliance: {
      claim: "A bar tested at 2.5× rated load passes.",
      complies: false,
      why: "The shall demands 3×. 2.5× is a fail, and 'should' language around the test setup does not soften the shall.",
    },
  },
  {
    id: "CL-2",
    title: "Tow-bar standard, §5.1 — corrosion",
    excerpt:
      "§5.1 Components in marine service shall have corrosion protection. Zinc plating is one acceptable means. The designer may choose alternatives of equal or better performance.",
    claims: [
      { text: "Have corrosion protection in marine service", isShall: true },
      { text: "Use zinc plating specifically", isShall: false },
      { text: "Choose an alternative of equal or better performance", isShall: false },
    ],
    compliance: {
      claim: "An uncoated steel pin in saltwater service complies.",
      complies: false,
      why: "The shall is on protection, not on the means. No coating and no stated alternative means the shall is unmet.",
    },
  },
];
