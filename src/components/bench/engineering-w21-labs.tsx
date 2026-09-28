import { useEffect, useState } from "react";
import { BenchShell, Readouts, Segmented, WellButton } from "./ui";
import {
  VERIFICATION_METHODS,
  SAMPLE_REQUIREMENTS,
  SAMPLE_LEDGER,
  gradeRequirement,
  matrixVerdict,
  ledgerStats,
  type LedgerConfidence,
  type LedgerEntry,
  type Requirement,
  type VerificationMethod,
} from "@/course/requirements";

const PACKET_KEY = "ff:reqpacket-w21";
const PACKET_RUBRIC = [
  "Every requirement uses “shall”/“must” and makes exactly one demand.",
  "Every requirement is measurable — number plus unit, with a pass/fail line.",
  "Every requirement has a verification method assigned.",
  "Every verification method has a “how” — rig, instrument, procedure.",
  "At least one validation activity is scheduled that could falsify the packet.",
];

const ISSUE_LABEL: Record<string, string> = {
  unmeasurable: "Not measurable",
  compound: "Compound",
  vague: "Vague",
  "weak-form": "Weak form",
};

function loadPacket(): Requirement[] {
  try {
    const raw = localStorage.getItem(PACKET_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Requirement[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    /* private browsing: fall through to samples */
  }
  return SAMPLE_REQUIREMENTS.map((r) => ({ ...r }));
}

export function ReqPacketBench() {
  const [reqs, setReqs] = useState<Requirement[]>(loadPacket);
  const [checked, setChecked] = useState<boolean[]>(() => PACKET_RUBRIC.map(() => false));

  useEffect(() => {
    try {
      localStorage.setItem(PACKET_KEY, JSON.stringify(reqs));
    } catch {
      /* the packet simply does not persist */
    }
  }, [reqs]);

  const grades = reqs.map((r) => gradeRequirement(r.text));
  const clean = grades.filter((g) => g.length === 0).length;
  const verdict = matrixVerdict(reqs);

  const update = (id: string, patch: Partial<Requirement>) =>
    setReqs((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const add = () =>
    setReqs((prev) => [
      ...prev,
      { id: `REQ-${prev.length + 1}`, text: "", verification: null, verificationNote: "" },
    ]);

  const remove = (id: string) => setReqs((prev) => prev.filter((r) => r.id !== id));

  return (
    <BenchShell
      prompt="Fix the two flawed sample requirements until the checker goes quiet, then write two of your own. || Assign each requirement a verification method and say exactly how the check will run. || Persist the packet and grade it against the 5-item rubric."
      note="The checker grades sentence mechanics — measurability, singularity, form — not whether the requirement is the right one for the job. Judgment of the right requirement still belongs to you."
      controls={
        <div className="sm:col-span-2">
          <div className="mb-2 text-sm text-well-dim">Rubric — check what the packet earns</div>
          <div className="flex flex-col gap-2">
            {PACKET_RUBRIC.map((item, i) => (
              <label key={item} className="flex cursor-pointer items-start gap-3 text-sm text-well-fg">
                <input
                  type="checkbox"
                  checked={checked[i] ?? false}
                  onChange={() =>
                    setChecked((prev) => prev.map((c, j) => (j === i ? !c : c)))
                  }
                  className="mt-0.5 h-4 w-4 shrink-0 accent-white"
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </div>
      }
    >
      <Readouts
        items={[
          { label: "Requirements", value: `${reqs.length}` },
          { label: "Clean statements", value: `${clean} / ${reqs.length}` },
          {
            label: "Matrix",
            value: verdict.complete ? "Complete" : "Incomplete",
          },
        ]}
      />
      <div className="flex flex-col gap-4">
        {reqs.map((req) => {
          const issues = gradeRequirement(req.text);
          return (
            <div key={req.id} className="rounded-lg bg-white/5 p-3 ring-1 ring-white/15">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-well-fg">{req.id}</span>
                <div className="flex gap-2">
                  {issues.length === 0 ? (
                    <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-xs text-emerald-200">
                      Clean
                    </span>
                  ) : (
                    issues.map((issue) => (
                      <span
                        key={issue.code}
                        title={issue.message}
                        className="rounded-full bg-amber-400/20 px-2 py-0.5 text-xs text-amber-200"
                      >
                        {ISSUE_LABEL[issue.code]}
                      </span>
                    ))
                  )}
                </div>
              </div>
              <textarea
                value={req.text}
                onChange={(e) => update(req.id, { text: e.target.value })}
                placeholder="The … shall … (number + unit, one demand)"
                rows={2}
                className="w-full rounded-lg bg-white/10 p-2 text-sm text-well-fg ring-1 ring-white/20 placeholder:text-well-dim"
              />
              {issues.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {issues.map((issue) => (
                    <li key={issue.code} className="text-xs leading-relaxed text-amber-200/90">
                      {issue.message}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-3">
                <Segmented<VerificationMethod | "none">
                  label="Verification method"
                  value={req.verification ?? "none"}
                  onChange={(v) => update(req.id, { verification: v === "none" ? null : v })}
                  options={[
                    { value: "none", label: "— unassigned —" },
                    ...VERIFICATION_METHODS.map((m) => ({
                      value: m.value as VerificationMethod | "none",
                      label: `${m.label} — ${m.hint}`,
                    })),
                  ]}
                />
              </div>
              <input
                value={req.verificationNote}
                onChange={(e) => update(req.id, { verificationNote: e.target.value })}
                placeholder="How: rig, instrument, procedure…"
                className="mt-2 w-full rounded-lg bg-white/10 p-2 text-sm text-well-fg ring-1 ring-white/20 placeholder:text-well-dim"
              />
              <div className="mt-2 flex justify-end">
                <WellButton onClick={() => remove(req.id)}>Remove</WellButton>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <WellButton onClick={add}>Add requirement</WellButton>
        <WellButton onClick={() => setReqs(SAMPLE_REQUIREMENTS.map((r) => ({ ...r })))}>
          Reset to samples
        </WellButton>
      </div>
      {!verdict.complete && (
        <p className="mt-3 text-sm leading-relaxed text-well-dim">
          Matrix gaps:{" "}
          {[
            verdict.missingMethod.length > 0 && `${verdict.missingMethod.join(", ")} need a method`,
            verdict.missingNote.length > 0 && `${verdict.missingNote.join(", ")} need a how`,
          ]
            .filter(Boolean)
            .join("; ")}
          .
        </p>
      )}
    </BenchShell>
  );
}

const LEDGER_KEY = "ff:ledger-w21";
const LEDGER_RUBRIC = [
  "Every borrowed number in my analysis appears as a ledger entry.",
  "Every entry names a provenance — no empty source cells.",
  "Every low-confidence entry has an owner and a resolution date.",
  "Open high-risk count is zero, or the risk is explicitly accepted.",
  "Entries are resolved by evidence (test, document, signature), not by feeling.",
];

const CONFIDENCE_OPTIONS: { value: LedgerConfidence; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

function loadLedger(): LedgerEntry[] {
  try {
    const raw = localStorage.getItem(LEDGER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as LedgerEntry[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    /* private browsing: fall through to samples */
  }
  return SAMPLE_LEDGER.map((e) => ({ ...e }));
}

export function AssumptionLedgerBench() {
  const [entries, setEntries] = useState<LedgerEntry[]>(loadLedger);
  const [checked, setChecked] = useState<boolean[]>(() => LEDGER_RUBRIC.map(() => false));

  useEffect(() => {
    try {
      localStorage.setItem(LEDGER_KEY, JSON.stringify(entries));
    } catch {
      /* the ledger simply does not persist */
    }
  }, [entries]);

  const stats = ledgerStats(entries);
  const update = (id: string, patch: Partial<LedgerEntry>) =>
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  const add = () =>
    setEntries((prev) => [
      ...prev,
      { id: `A-${prev.length + 1}`, claim: "", provenance: "", confidence: "low" as LedgerConfidence, resolved: false, resolution: "" },
    ]);
  const remove = (id: string) => setEntries((prev) => prev.filter((e) => e.id !== id));

  return (
    <BenchShell
      prompt="Open the sample ledger and find the entry that killed the Orbiter. || Add three entries for your own packet's borrowed numbers — loads, properties, interface constants. || Close what you can cite, own what you cannot, and watch the risk count."
      note="The ledger tracks claims, not tasks. A claim is resolved when evidence replaces belief: a test result, a cited document, a signed interface — never when you feel better about it."
      controls={
        <div className="sm:col-span-2">
          <div className="mb-2 text-sm text-well-dim">Rubric — check what the ledger earns</div>
          <div className="flex flex-col gap-2">
            {LEDGER_RUBRIC.map((item, i) => (
              <label key={item} className="flex cursor-pointer items-start gap-3 text-sm text-well-fg">
                <input
                  type="checkbox"
                  checked={checked[i] ?? false}
                  onChange={() =>
                    setChecked((prev) => prev.map((c, j) => (j === i ? !c : c)))
                  }
                  className="mt-0.5 h-4 w-4 shrink-0 accent-white"
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </div>
      }
    >
      <Readouts
        items={[
          { label: "Entries", value: `${stats.total}` },
          { label: "Resolved", value: `${stats.resolved} / ${stats.total}` },
          { label: "Open high-risk", value: `${stats.openHighRisk}` },
        ]}
      />
      <div className="flex flex-col gap-4">
        {entries.map((entry) => {
          const highRisk = !entry.resolved && entry.confidence === "low";
          return (
            <div
              key={entry.id}
              className={`rounded-lg p-3 ring-1 ${
                highRisk ? "bg-red-400/10 ring-red-300/40" : "bg-white/5 ring-white/15"
              }`}
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-well-fg">{entry.id}</span>
                <div className="flex items-center gap-2">
                  {highRisk && (
                    <span className="rounded-full bg-red-400/25 px-2 py-0.5 text-xs text-red-200">
                      High risk
                    </span>
                  )}
                  <label className="flex cursor-pointer items-center gap-2 text-xs text-well-fg">
                    <input
                      type="checkbox"
                      checked={entry.resolved}
                      onChange={(e) => update(entry.id, { resolved: e.target.checked })}
                      className="h-4 w-4 shrink-0 accent-white"
                    />
                    Resolved
                  </label>
                </div>
              </div>
              <input
                value={entry.claim}
                onChange={(e) => update(entry.id, { claim: e.target.value })}
                placeholder="Claim — the number you are using as if true"
                className="w-full rounded-lg bg-white/10 p-2 text-sm text-well-fg ring-1 ring-white/20 placeholder:text-well-dim"
              />
              <input
                value={entry.provenance}
                onChange={(e) => update(entry.id, { provenance: e.target.value })}
                placeholder="Provenance — who said it, which document, which test"
                className="mt-2 w-full rounded-lg bg-white/10 p-2 text-sm text-well-fg ring-1 ring-white/20 placeholder:text-well-dim"
              />
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <Segmented<LedgerConfidence>
                  label="Confidence"
                  value={entry.confidence}
                  onChange={(v) => update(entry.id, { confidence: v })}
                  options={CONFIDENCE_OPTIONS}
                />
                <div className="sm:col-span-1">
                  <div className="mb-2 text-sm text-well-dim">Resolution (owner, date, evidence)</div>
                  <input
                    value={entry.resolution}
                    onChange={(e) => update(entry.id, { resolution: e.target.value })}
                    placeholder="Resolved by… / owner + date if not"
                    className="w-full rounded-lg bg-white/10 p-2 text-sm text-well-fg ring-1 ring-white/20 placeholder:text-well-dim"
                  />
                </div>
              </div>
              <div className="mt-2 flex justify-end">
                <WellButton onClick={() => remove(entry.id)}>Remove</WellButton>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <WellButton onClick={add}>Add entry</WellButton>
        <WellButton onClick={() => setEntries(SAMPLE_LEDGER.map((e) => ({ ...e })))}>
          Reset to samples
        </WellButton>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-well-dim">
        {stats.openHighRisk === 0
          ? "No open low-confidence entries. The riskiest line in the project is visible — or resolved."
          : `${stats.openHighRisk} open low-confidence ${stats.openHighRisk === 1 ? "entry" : "entries"} — each one is the Orbiter's A-2 pattern until it gets an owner and a date.`}
      </p>
    </BenchShell>
  );
}
