import { useEffect, useState } from "react";
import { BenchShell, Readouts, Segmented, WellButton } from "./ui";
import {
  CLAUSE_EXERCISES,
  DISTRACTORS,
  FOS_TABLE,
  SEEDED_PACKAGE,
  gradeMemo,
  scoreReview,
  type ConsequenceClass,
  type DesignIssue,
  type ReviewFinding,
  type ReviewVerdict,
  type Severity,
} from "@/course/review";

/* ------------------------------------------------------------------ */
/* StandardsBench — FoS table exercise + clause reading                */
/* ------------------------------------------------------------------ */

const STANDARDS_KEY = "ff:standards-w29";
const STANDARDS_RUBRIC = [
  "Every scenario's FoS is read off the consequence class, not guessed.",
  "At least one FoS assignment is defended in writing (consequence + load knowledge).",
  "Every claim is correctly classified as shall or not-a-shall.",
  "Both compliance judgments are correct, with the right reasoning.",
  "The consequence class is written next to every FoS you would use.",
];

const FOS_SCENARIOS: { id: string; text: string; expected: ConsequenceClass }[] = [
  {
    id: "FOS-A",
    text: "A bookshelf bracket in a home office. Failure drops books onto carpet.",
    expected: "low",
  },
  {
    id: "FOS-B",
    text: "A trailer tow-bar lug in highway service, backed by a safety chain. Loads are ordinary but unmeasured.",
    expected: "moderate",
  },
  {
    id: "FOS-C",
    text: "A pressure vessel in a crewed habitat module.",
    expected: "catastrophic",
  },
];

const SEVERITY_ORDER: Severity[] = ["critical", "major", "minor", "observation"];

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    /* private browsing: fall through */
  }
  return fallback;
}

export function StandardsBench() {
  const [fosPicks, setFosPicks] = useState<Record<string, ConsequenceClass>>(() =>
    loadJSON(STANDARDS_KEY + ":fos", {}),
  );
  const [defense, setDefense] = useState<string>(() => loadJSON(STANDARDS_KEY + ":defense", ""));
  const [claimPicks, setClaimPicks] = useState<Record<string, boolean>>(() =>
    loadJSON(STANDARDS_KEY + ":claims", {}),
  );
  const [compliancePicks, setCompliancePicks] = useState<Record<string, boolean>>(() =>
    loadJSON(STANDARDS_KEY + ":compliance", {}),
  );
  const [checked, setChecked] = useState<boolean[]>(() => STANDARDS_RUBRIC.map(() => false));

  useEffect(() => {
    try {
      localStorage.setItem(STANDARDS_KEY + ":fos", JSON.stringify(fosPicks));
      localStorage.setItem(STANDARDS_KEY + ":defense", JSON.stringify(defense));
      localStorage.setItem(STANDARDS_KEY + ":claims", JSON.stringify(claimPicks));
      localStorage.setItem(STANDARDS_KEY + ":compliance", JSON.stringify(compliancePicks));
    } catch {
      /* the exercise simply does not persist */
    }
  }, [fosPicks, defense, claimPicks, compliancePicks]);

  const fosCorrect = FOS_SCENARIOS.filter((s) => fosPicks[s.id] === s.expected).length;
  const fosDone = FOS_SCENARIOS.filter((s) => fosPicks[s.id] !== undefined).length;

  const totalClaims = CLAUSE_EXERCISES.reduce((n, ex) => n + ex.claims.length, 0);
  const claimKeys = CLAUSE_EXERCISES.flatMap((ex, ei) =>
    ex.claims.map((_, ci) => `${ei}:${ci}`),
  );
  const claimsDone = claimKeys.filter((k) => claimPicks[k] !== undefined).length;
  const claimsCorrect = CLAUSE_EXERCISES.flatMap((ex, ei) =>
    ex.claims.map((c, ci) => claimPicks[`${ei}:${ci}`] === c.isShall),
  ).filter(Boolean).length;

  const complianceDone = CLAUSE_EXERCISES.filter((_, ei) => compliancePicks[`${ei}`] !== undefined).length;
  const complianceCorrect = CLAUSE_EXERCISES.filter(
    (ex, ei) => compliancePicks[`${ei}`] === ex.compliance.complies,
  ).length;

  return (
    <BenchShell
      prompt="Read the consequence-class table and assign the correct FoS to three scenarios. || Classify each claim as a shall or not-a-shall, then judge the two compliance claims. || Persist the exercise and grade it against the 5-item rubric."
      note="The table values are classroom-grade conventions, not a real code. Real codes (ASME, API, Eurocode) set their own numbers — the skill being graded is the reasoning, not the number."
      controls={
        <>
          <div className="sm:col-span-2">
            <div className="mb-2 text-sm text-well-dim">Rubric — check what the exercise earns</div>
            <div className="flex flex-col gap-2">
              {STANDARDS_RUBRIC.map((item, i) => (
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
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <div>
          <h3 className="text-base font-semibold text-well-fg">Part 1 — price the factor of safety</h3>
          <div className="mt-2 grid gap-2">
            {(Object.keys(FOS_TABLE) as ConsequenceClass[]).map((c) => (
              <div key={c} className="rounded-lg bg-white/5 px-3 py-2 text-sm text-well-fg">
                <span className="font-medium">FoS {FOS_TABLE[c].fos.toFixed(1)}</span>
                {" — "}
                {FOS_TABLE[c].label}. <span className="text-well-dim">{FOS_TABLE[c].note}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-4">
            {FOS_SCENARIOS.map((s) => (
              <div key={s.id} className="rounded-lg ring-1 ring-white/15 px-3 py-3">
                <p className="text-sm text-well-fg">{s.text}</p>
                <Segmented<ConsequenceClass>
                  label="Consequence class"
                  value={fosPicks[s.id] ?? "low"}
                  onChange={(v) => setFosPicks((prev) => ({ ...prev, [s.id]: v }))}
                  options={(Object.keys(FOS_TABLE) as ConsequenceClass[]).map((c) => ({
                    value: c,
                    label: `${c} — FoS ${FOS_TABLE[c].fos.toFixed(1)}`,
                  }))}
                />
                {fosPicks[s.id] !== undefined && (
                  <p className="mt-2 text-sm text-well-dim">
                    {fosPicks[s.id] === s.expected
                      ? `Correct — FoS ${FOS_TABLE[s.expected].fos.toFixed(1)}, class ${s.expected}.`
                      : "Not the class this course would assign — re-read the consequence."}
                  </p>
                )}
              </div>
            ))}
          </div>
          <div className="mt-3">
            <label className="mb-2 block text-sm text-well-dim" htmlFor="fos-defense">
              Defend one assignment in writing (consequence + load knowledge)
            </label>
            <textarea
              id="fos-defense"
              value={defense}
              onChange={(e) => setDefense(e.target.value)}
              rows={3}
              className="w-full rounded-lg bg-white/5 px-3 py-2 text-sm text-well-fg ring-1 ring-white/15"
              placeholder="Scenario FOS-B: moderate, because…"
            />
          </div>
          <Readouts
            items={[
              { label: "FoS assignments", value: `${fosCorrect}/${FOS_SCENARIOS.length} correct` },
              { label: "Answered", value: `${fosDone}/${FOS_SCENARIOS.length}` },
            ]}
          />
        </div>

        <div>
          <h3 className="text-base font-semibold text-well-fg">Part 2 — read the standard</h3>
          <div className="mt-3 flex flex-col gap-5">
            {CLAUSE_EXERCISES.map((ex, ei) => (
              <div key={ex.id} className="rounded-lg ring-1 ring-white/15 px-3 py-3">
                <p className="text-sm font-medium text-well-fg">{ex.title}</p>
                <p className="mt-1 text-sm text-well-dim">{ex.excerpt}</p>
                <div className="mt-3 flex flex-col gap-3">
                  {ex.claims.map((c, ci) => {
                    const key = `${ei}:${ci}`;
                    const picked = claimPicks[key];
                    return (
                      <div key={key}>
                        <p className="text-sm text-well-fg">{c.text}</p>
                        <Segmented<string>
                          label="Classification"
                          value={picked === undefined ? "" : picked ? "shall" : "not-shall"}
                          onChange={(v) => setClaimPicks((prev) => ({ ...prev, [key]: v === "shall" }))}
                          options={[
                            { value: "shall", label: "shall — a demand" },
                            { value: "not-shall", label: "not a shall — advice or permission" },
                          ]}
                        />
                        {picked !== undefined && (
                          <p className="mt-1 text-sm text-well-dim">
                            {picked === c.isShall ? "Correct." : "Wrong — re-read the verbs."}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3">
                  <p className="text-sm text-well-fg">Compliance: {ex.compliance.claim}</p>
                  <Segmented<string>
                    label="Your judgment"
                    value={
                      compliancePicks[`${ei}`] === undefined
                        ? ""
                        : compliancePicks[`${ei}`]
                          ? "complies"
                          : "not-complies"
                    }
                    onChange={(v) =>
                      setCompliancePicks((prev) => ({ ...prev, [`${ei}`]: v === "complies" }))
                    }
                    options={[
                      { value: "complies", label: "Complies" },
                      { value: "not-complies", label: "Does not comply" },
                    ]}
                  />
                  {compliancePicks[`${ei}`] !== undefined && (
                    <p className="mt-1 text-sm text-well-dim">
                      {compliancePicks[`${ei}`] === ex.compliance.complies
                        ? `Correct. ${ex.compliance.why}`
                        : `Wrong. ${ex.compliance.why}`}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Readouts
            items={[
              { label: "Shall classification", value: `${claimsCorrect}/${totalClaims} correct (${claimsDone} answered)` },
              { label: "Compliance", value: `${complianceCorrect}/${CLAUSE_EXERCISES.length} correct (${complianceDone} answered)` },
            ]}
          />
        </div>
      </div>
    </BenchShell>
  );
}

/* ------------------------------------------------------------------ */
/* DesignReviewBench — the seeded tow-bar review + memo                */
/* ------------------------------------------------------------------ */

const REVIEW_KEY = "ff:designreview-w29";
const REVIEW_RUBRIC = [
  "All six planted issues are filed (recall 6/6); no distractors filed.",
  "Every filed finding carries the correct severity.",
  "The verdict matches the open findings (open critical → reject).",
  "Every finding is addressed or explicitly accepted as a signed risk.",
  "The memo says what was reviewed, what was found, and why the verdict follows — and it is signed.",
];

/** Candidate observations: the six planted issues interleaved with three distractors. */
const CANDIDATES: ({ kind: "issue"; issue: DesignIssue } | { kind: "distractor"; id: string; text: string })[] = [
  { kind: "issue", issue: SEEDED_PACKAGE[0] },
  { kind: "distractor", id: DISTRACTORS[0].id, text: DISTRACTORS[0].text },
  { kind: "issue", issue: SEEDED_PACKAGE[1] },
  { kind: "issue", issue: SEEDED_PACKAGE[2] },
  { kind: "distractor", id: DISTRACTORS[1].id, text: DISTRACTORS[1].text },
  { kind: "issue", issue: SEEDED_PACKAGE[3] },
  { kind: "issue", issue: SEEDED_PACKAGE[4] },
  { kind: "distractor", id: DISTRACTORS[2].id, text: DISTRACTORS[2].text },
  { kind: "issue", issue: SEEDED_PACKAGE[5] },
];

const VERDICT_LABEL: Record<ReviewVerdict, string> = {
  approve: "Approve",
  "approve-with-conditions": "Approve with conditions",
  reject: "Reject",
};

export function DesignReviewBench() {
  const [filed, setFiled] = useState<Record<string, boolean>>(() => loadJSON(REVIEW_KEY + ":filed", {}));
  const [severities, setSeverities] = useState<Record<string, Severity>>(() =>
    loadJSON(REVIEW_KEY + ":sev", {}),
  );
  const [addressed, setAddressed] = useState<Record<string, boolean>>(() =>
    loadJSON(REVIEW_KEY + ":addr", {}),
  );
  const [verdict, setVerdict] = useState<ReviewVerdict | null>(() =>
    loadJSON<ReviewVerdict | null>(REVIEW_KEY + ":verdict", null),
  );
  const [memo, setMemo] = useState<string>(() => loadJSON(REVIEW_KEY + ":memo", ""));
  const [signature, setSignature] = useState<string>(() => loadJSON(REVIEW_KEY + ":sig", ""));
  const [graded, setGraded] = useState(false);
  const [checked, setChecked] = useState<boolean[]>(() => REVIEW_RUBRIC.map(() => false));

  useEffect(() => {
    try {
      localStorage.setItem(REVIEW_KEY + ":filed", JSON.stringify(filed));
      localStorage.setItem(REVIEW_KEY + ":sev", JSON.stringify(severities));
      localStorage.setItem(REVIEW_KEY + ":addr", JSON.stringify(addressed));
      localStorage.setItem(REVIEW_KEY + ":verdict", JSON.stringify(verdict));
      localStorage.setItem(REVIEW_KEY + ":memo", JSON.stringify(memo));
      localStorage.setItem(REVIEW_KEY + ":sig", JSON.stringify(signature));
    } catch {
      /* the review simply does not persist */
    }
  }, [filed, severities, addressed, verdict, memo, signature]);

  const filedIds = Object.keys(filed).filter((id) => filed[id]);
  const reviewScore = scoreReview(filedIds, severities);
  const findings: ReviewFinding[] = filedIds
    .filter((id) => SEEDED_PACKAGE.some((i) => i.id === id))
    .map((id) => ({
      issueId: id,
      severity: severities[id] ?? "observation",
      addressed: addressed[id] ?? false,
    }));
  const memoGrade = graded ? gradeMemo({ verdict, findings, memoText: memo, signature }) : null;

  const toggleFiled = (id: string) =>
    setFiled((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <BenchShell
      prompt="Review the tow-bar package below: file each observation that is a genuine finding, grade its severity, and ignore the distractors. || Issue the verdict the open findings demand, write the memo, and sign it. || Grade the memo, persist the review, and check it against the 5-item rubric."
      note="Six issues are planted across all four severities, plus three distractors that are not findings. The bench grades recall, severity accuracy, verdict logic, and memo completeness — the same four things a real review chair checks."
      controls={
        <>
          <div className="sm:col-span-2">
            <div className="mb-2 text-sm text-well-dim">Rubric — check what the review earns</div>
            <div className="flex flex-col gap-2">
              {REVIEW_RUBRIC.map((item, i) => (
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
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <div>
          <h3 className="text-base font-semibold text-well-fg">The package — ATLAS-2 tow bar</h3>
          <p className="mt-1 text-sm text-well-dim">
            Two sheets and three calculations. Sheet 1: tow-bar assembly, single shear pin at the
            coupler, steel pin in a steel lug, saltwater service noted. Sheet 2: four M12 clamp
            bolts, no torque stated. Calculation 1: load table mixing kN and lbf columns.
            Calculation 2: lug strength at FoS 1.4 against drawing note 7 (FoS ≥ 2.0). Calculation 3:
            fatigue check assuming 10⁴ cycles with no basis. Read it like a reviewer: what breaks this?
          </p>
        </div>

        <div>
          <h3 className="text-base font-semibold text-well-fg">File your findings</h3>
          <div className="mt-3 flex flex-col gap-3">
            {CANDIDATES.map((c) => {
              const id = c.kind === "issue" ? c.issue.id : c.id;
              const text = c.kind === "issue" ? c.issue.description : c.text;
              const location = c.kind === "issue" ? c.issue.location : "—";
              const isFiled = filed[id] ?? false;
              return (
                <div key={id} className="rounded-lg ring-1 ring-white/15 px-3 py-3">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isFiled}
                      onChange={() => toggleFiled(id)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-white"
                    />
                    <span className="text-sm text-well-fg">
                      <span className="text-well-dim">{location} — </span>
                      {text}
                    </span>
                  </label>
                  {isFiled && (
                    <div className="mt-2">
                      <Segmented<Severity>
                        label="Severity"
                        value={severities[id] ?? "observation"}
                        onChange={(v) => setSeverities((prev) => ({ ...prev, [id]: v }))}
                        options={SEVERITY_ORDER.map((s) => ({ value: s, label: s }))}
                      />
                      {c.kind === "issue" && (
                        <label className="mt-2 flex cursor-pointer items-center gap-3 text-sm text-well-fg">
                          <input
                            type="checkbox"
                            checked={addressed[id] ?? false}
                            onChange={() =>
                              setAddressed((prev) => ({ ...prev, [id]: !prev[id] }))
                            }
                            className="h-4 w-4 shrink-0 accent-white"
                          />
                          <span>Addressed (rework assigned or risk explicitly accepted)</span>
                        </label>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <Readouts
            items={[
              { label: "Recall", value: `${reviewScore.found.length}/${SEEDED_PACKAGE.length} planted issues` },
              { label: "Severity accuracy", value: `${reviewScore.severityCorrect}/${reviewScore.severityTotal}` },
              { label: "False alarms", value: `${reviewScore.falseAlarms.length}` },
              { label: "Missed", value: reviewScore.missed.join(", ") || "none" },
            ]}
          />
        </div>

        <div>
          <h3 className="text-base font-semibold text-well-fg">Issue the verdict and write the memo</h3>
          <div className="mt-3">
            <Segmented<ReviewVerdict>
              label="Verdict"
              value={verdict ?? "approve"}
              onChange={(v) => {
                setVerdict(v);
                setGraded(false);
              }}
              options={(Object.keys(VERDICT_LABEL) as ReviewVerdict[]).map((v) => ({
                value: v,
                label: VERDICT_LABEL[v],
              }))}
            />
          </div>
          <div className="mt-3">
            <label className="mb-2 block text-sm text-well-dim" htmlFor="review-memo">
              Memo — what was reviewed, what was found, why this verdict follows
            </label>
            <textarea
              id="review-memo"
              value={memo}
              onChange={(e) => {
                setMemo(e.target.value);
                setGraded(false);
              }}
              rows={4}
              className="w-full rounded-lg bg-white/5 px-3 py-2 text-sm text-well-fg ring-1 ring-white/15"
              placeholder="Reviewed the two-sheet ATLAS-2 tow-bar package…"
            />
          </div>
          <div className="mt-3">
            <label className="mb-2 block text-sm text-well-dim" htmlFor="review-sig">
              Signature
            </label>
            <input
              id="review-sig"
              value={signature}
              onChange={(e) => {
                setSignature(e.target.value);
                setGraded(false);
              }}
              className="w-full rounded-lg bg-white/5 px-3 py-2 text-sm text-well-fg ring-1 ring-white/15"
              placeholder="Your name — the review becomes yours"
            />
          </div>
          <div className="mt-3">
            <WellButton onClick={() => setGraded(true)}>Grade the memo</WellButton>
          </div>
          {memoGrade && (
            <div className="mt-3 rounded-lg bg-white/5 px-3 py-3">
              {memoGrade.complete ? (
                <p className="text-sm font-medium text-well-fg">
                  Memo complete. The verdict ({verdict}) follows from the open findings, every
                  finding is addressed, and it is signed.
                </p>
              ) : (
                <div>
                  <p className="text-sm font-medium text-well-fg">The memo does not yet hold up:</p>
                  <ul className="mt-1 list-disc pl-5 text-sm text-well-dim">
                    {memoGrade.issues.map((issue) => (
                      <li key={issue}>{issue}</li>
                    ))}
                  </ul>
                  <p className="mt-2 text-sm text-well-dim">
                    The open findings demand: <span className="font-medium text-well-fg">{memoGrade.expectedVerdict}</span>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </BenchShell>
  );
}
