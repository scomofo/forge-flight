import type { Phase } from "@/forge/types";
import { hashCanon } from "@/forge/sim/hash";

export type LedgerEntry = {
  id: string;
  iteration: number;
  phase: Phase;
  parentHash: string | null;
  snapshot: unknown;
  action: string;
  note?: string;
  hash: string;
};

export function sealEntry(entry: Omit<LedgerEntry, "hash">): LedgerEntry {
  return { ...entry, hash: hashCanon({ ...entry, hash: "" }) };
}

export function replay(entries: LedgerEntry[]): { wall: number } | null {
  let prev: string | null = null;
  let last: { wall: number } | null = null;
  for (const entry of entries) {
    if (entry.parentHash !== prev) return null;
    const { hash, ...rest } = entry;
    if (hashCanon({ ...rest, hash: "" }) !== hash) return null;
    if (entry.snapshot && typeof entry.snapshot === "object" && "wall" in entry.snapshot) {
      last = entry.snapshot as { wall: number };
    }
    prev = entry.hash;
  }
  return last;
}

export type RubricScore = { rubricItemId: string; score: number; evidenceQuote: string; feedback: string };

export function gradeReflection(text: string, iteration: number, constraintsMet: boolean): RubricScore[] {
  const body = text.trim();
  const trade = /cost|mass|stiff|thick|light|instead|trade|heavier|lighter/i.test(body);
  const assumption = /assum|linear|tip load|model|exaggerat|small deflection/i.test(body);
  const failure = /yield|buckl|stall|deflect|margin|resonanc|pass|held/i.test(body);
  return [
    {
      rubricItemId: "constraints",
      score: constraintsMet ? 2 : 1,
      evidenceQuote: constraintsMet ? "Constraints currently pass." : "At least one constraint is still open.",
      feedback: constraintsMet ? "The limits that are on the brief are met." : "Say which limit is still open.",
    },
    {
      rubricItemId: "failure",
      score: failure ? 2 : 0,
      evidenceQuote: failure ? "Names a mode." : "",
      feedback: failure ? "A failure mode, or a pass, is named." : "Name the mode you were watching.",
    },
    {
      rubricItemId: "tradeoff",
      score: trade ? 2 : 0,
      evidenceQuote: trade ? body.slice(0, 80) : "",
      feedback: trade ? "A tradeoff is in the note." : "Say what got better and what got worse.",
    },
    {
      rubricItemId: "iteration",
      score: iteration >= 2 ? 2 : 1,
      evidenceQuote: `Iteration ${iteration}`,
      feedback: iteration >= 2 ? "You came back." : "One pass is a start. Change one thing and run it again.",
    },
    {
      rubricItemId: "assumptions",
      score: assumption ? 2 : 0,
      evidenceQuote: assumption ? "Names an assumption." : "",
      feedback: assumption ? "An assumption is on the page." : "Name something the model is pretending.",
    },
  ];
}

export function notebookMarkdown(title: string, brief: string, entries: LedgerEntry[], assumptions: string[]): string {
  const lines = [`# ${title}`, "", brief, "", "## Iterations", ""];
  for (const entry of entries) {
    lines.push(`### Iteration ${entry.iteration} — ${entry.phase}`);
    lines.push(entry.action);
    if (entry.note) lines.push(entry.note);
    lines.push("");
  }
  lines.push("## Assumptions");
  for (const line of assumptions) lines.push(`- ${line}`);
  return lines.join("\n");
}
