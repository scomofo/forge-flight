import { ResultSummary, VirtualTestLimit } from "./result-summary";
import { requiredChecksPass } from "@/forge/sim/result-messages";
import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { concepts, materialById, materials, missionById, processById, processes } from "@/forge/content/catalog";
import { notebookMarkdown } from "@/forge/ledger";
import { evaluate, type Evaluation } from "@/forge/sim/evaluate";
import { canEnter, rubricPercent, toDesign, unlocked, useForge } from "@/forge/store";
import { PHASES, type AnalysisKind, type Phase } from "@/forge/types";
import { runInWorker } from "@/forge/worker-client";
import { palette } from "@/forge/palette";
import { ForgeViewport } from "@/components/forge/viewport";

const phaseLabel: Record<Phase, string> = {
  brief: "Brief",
  design: "Design",
  materials: "Materials",
  simulate: "Simulate",
  make: "Make",
  test: "Test",
  review: "Review",
};

const conceptClips: Record<string, { src: string; caption: string }> = {
  stall: {
    src: "/clips/stall.mp4",
    caption: "The lines leave the wing. This is a picture of the idea. Your stall is still the 12° teaching limit.",
  },
  buckling: {
    src: "/clips/buckle.mp4",
    caption: "The column bows. In the model the load is along the column. The picture only shows the bow.",
  },
  yield: {
    src: "/clips/yield.mp4",
    caption: "This clip illustrates permanent deformation in a ductile metal. The model compares calculated stress with a supplied strength limit; a missed safety-factor target is not an observed yield event.",
  },
  margin: {
    src: "/clips/pitch.mp4",
    caption: "This animation illustrates pitch motion. Read the static margin to identify the stability regime; the animation does not simulate your current design.",
  },
  resonance: {
    src: "/clips/resonance.mp4",
    caption: "This clip illustrates one vibration mode. The frequency estimate uses the beam formula for the displayed supports; it does not predict a forced vibration response.",
  },
};

const nudges: Record<string, string> = {
  yield: "How does calculated stress compare with the supplied strength limit and the required safety factor?",
  inertia: "Thickness changed. What happened to the second moment, not just the area?",
  buckling: "This load is compression. Is yield the first thing a slender column does?",
  stall: "The angle is past the teaching stall. What happens to lift after the flow lets go?",
  dfm: "The shape solved. Can the tool still reach it?",
  tooling: "Quantity changed the winner. Which cost was divided, and which was not?",
  margin: "Where is the center of gravity relative to the neutral point?",
  lift: "Speed is squared. What happens to lift if speed falls by half?",
  resonance: "The supplied excitation and first bending-frequency estimate are close. What additional evidence would establish the vibration response?",
};

function ConceptFilm({ id }: { id: string }) {
  const clip = conceptClips[id];
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) ref.current?.pause();
  }, [id]);
  if (!clip) return null;
  return (
    <figure className="mt-3">
      <video ref={ref} className="aspect-video w-full rounded-lg bg-hangar" src={clip.src} muted playsInline loop autoPlay aria-label={clip.caption} />
      <figcaption className="mt-2 text-xs leading-relaxed text-dust">{clip.caption}</figcaption>
    </figure>
  );
}

function GlidePlay({ points }: { points: { x_m: number; h_m: number }[] }) {
  const dot = useRef<SVGCircleElement>(null);
  const maxX = Math.max(...points.map((p) => p.x_m), 1);
  const maxH = Math.max(...points.map((p) => p.h_m), 1);
  const X = (x: number) => 12 + (x / maxX) * 300;
  const Y = (h: number) => 132 - (h / maxH) * 112;
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"}${X(p.x_m).toFixed(1)} ${Y(p.h_m).toFixed(1)}`).join(" ");
  useEffect(() => {
    const X = (x: number) => 12 + (x / maxX) * 300;
    const Y = (h: number) => 132 - (h / maxH) * 112;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const place = (u: number) => {
      const i = Math.min(points.length - 1, Math.floor(u * Math.max(points.length - 1, 1)));
      const p = points[i];
      if (!p || !dot.current) return;
      dot.current.setAttribute("cx", X(p.x_m).toFixed(1));
      dot.current.setAttribute("cy", Y(p.h_m).toFixed(1));
    };
    place(reduce ? 1 : 0);
    if (reduce) return;
    let frame = 0;
    let start = 0;
    const loop = (now: number) => {
      if (!start) start = now;
      place(((now - start) / 5000) % 1);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [points, maxX, maxH]);
  return (
    <div>
      <svg viewBox="0 0 328 148" className="h-40 w-full text-bone" role="img" aria-label="Glide path from 8 meters">
        <path d={d} fill="none" stroke="currentColor" strokeWidth="2" />
        <circle ref={dot} r="4" className="fill-brass" cx={X(points[0]?.x_m ?? 0)} cy={Y(points[0]?.h_m ?? 0)} />
      </svg>
      <p className="text-xs text-dust">The dot follows the path this model computed. Distance is across. Height is up. It is not a filmed flight.</p>
    </div>
  );
}

function money(n: number) {
  return `$${n.toFixed(2)}`;
}
function num(n: number, d = 1) {
  if (!Number.isFinite(n)) return "—";
  return n.toFixed(d);
}

export function MissionBench({ missionId }: { missionId: string }) {
  const mission = missionById(missionId);
  const run = useForge((s) => s.runs[missionId]);
  const runs = useForge((s) => s.runs);
  const seen = useForge((s) => s.seen);
  const ensure = useForge((s) => s.ensure);
  const [hydrated, setHydrated] = useState(false);
  const [exaggerate, setExaggerate] = useState(8);
  const [ortho, setOrtho] = useState(false);
  const [cut, setCut] = useState(0);
  const [concept, setConcept] = useState<string | null>(null);
  const [nudge, setNudge] = useState<string | null>(null);
  const [workerNote, setWorkerNote] = useState<string | null>(null);
  const [replay, setReplay] = useState(0);
  const [why, setWhy] = useState<string | null>(null);

  useEffect(() => {
    const open = () => {
      ensure(missionId);
      setHydrated(true);
    };
    if (useForge.persist.hasHydrated()) open();
    else return useForge.persist.onFinishHydration(open);
  }, [ensure, missionId]);

  const evaluation = useMemo(() => {
    if (!mission || !run) return null;
    return evaluate(toDesign(run, mission), materials, processes);
  }, [mission, run]);

  useEffect(() => {
    if (!evaluation) return;
    const id = evaluation.failures[0]?.explanationId;
    if (!id || seen.includes(id)) return;
    setConcept(id);
    if (useForge.getState().nudge()) setNudge(nudges[id] ?? null);
  }, [evaluation, seen]);

  if (!mission || mission.locked) {
    return (
      <main className="forge min-h-dvh bg-hangar px-5 py-8 text-bone">
        <p className="font-forge text-2xl">That mission is still locked.</p>
        <Link to="/" className="mt-4 inline-flex min-h-11 items-center text-brass">
          Back to the bay
        </Link>
      </main>
    );
  }
  if (!hydrated || !run || !evaluation) {
    return (
      <main className="forge min-h-dvh bg-hangar px-5 py-8 text-bone">
        <p>Opening the bench.</p>
      </main>
    );
  }
  if (!unlocked(runs, mission) && mission.unlockAfter.length > 0) {
    return (
      <main className="forge min-h-dvh bg-hangar px-5 py-8 text-bone">
        <p className="font-forge text-2xl">{mission.title} stays shut.</p>
        <p className="mt-3 max-w-prose text-dust">
          Complete three distinct iterations of {mission.unlockAfter.map(id => missionById(id)?.title ?? id).join(" and ")}, with a best reflection score of at least 70%, to open this module.
        </p>
        <Link to="/mission/$missionId" params={{ missionId: mission.unlockAfter[0] ?? "glider" }} className="mt-4 inline-flex min-h-11 items-center text-brass">
          Return to the prerequisite module
        </Link>
      </main>
    );
  }

  const ready = exitReady(run.phase, run, evaluation, mission.requiredAnalyses);
  const hot = evaluation.failures[0];

  return (
    <main className="forge min-h-dvh bg-hangar text-bone">
      <header className="flex flex-wrap items-center gap-3 border-b border-line-forge px-4 py-3">
        <Link to="/" className="font-forge text-lg tracking-tight">
          Forge & Flight
        </Link>
        <span className="text-dust">{mission.title}</span>
        <span className="font-mono text-sm text-dust">Iteration {run.iteration}</span>
        <span className="ml-auto text-xs text-dust">Educational model. Not a build or flight approval.</span>
      </header>
      <div className="flex gap-2 overflow-x-auto px-4 py-3">
        {PHASES.map((phase) => {
          const open = canEnter(run, phase);
          const on = run.phase === phase;
          return (
            <button
              key={phase}
              type="button"
              disabled={!open}
              onClick={() => useForge.getState().go(missionId, phase)}
              className={`min-h-11 shrink-0 rounded-lg px-3 text-sm ${on ? "bg-brass text-brass-ink" : "bg-panel text-bone"} disabled:opacity-40`}
            >
              {phaseLabel[phase]}
            </button>
          );
        })}
      </div>
      <div className="grid gap-4 px-4 pb-8 lg:grid-cols-[16rem_minmax(0,1fr)_18rem]">
        <aside className="order-2 space-y-3 lg:order-1">
          <ConstraintList missionId={mission.id} evaluation={evaluation} />
          {evaluation.modelWarnings.length ? <div role="status" className="rounded-lg border border-alarm p-3 text-sm">
            <p className="font-medium">Model validity warning</p>
            {evaluation.modelWarnings.map(line => <p key={line} className="mt-2">{line}</p>)}
          </div> : null}
        </aside>
        <section className="order-1 min-w-0 space-y-4 lg:order-2">
          <div className="relative h-56 overflow-hidden rounded-lg border border-line-forge lg:h-[28rem]">
            <ForgeViewport
              artifact={mission.artifactType}
              parts={run.parts}
              vehicle={run.vehicle}
              evaluation={evaluation}
              exaggerate={exaggerate}
              replay={replay}
              ortho={ortho}
              cut={cut}
            />
            <div className="pointer-events-none absolute bottom-2 left-2 right-2 flex items-center gap-2 text-xs text-dust">
              <span>Low</span>
              <span className="h-2 flex-1 rounded-full" style={{ background: `linear-gradient(90deg, ${palette.bone}, ${palette.alarm})` }} />
              <span>At model allowable</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="flex min-h-11 items-center gap-2 text-sm text-dust">
              Exaggeration {exaggerate}×
              <input type="range" min={1} max={40} value={exaggerate} onChange={(e) => setExaggerate(Number(e.target.value))} />
            </label>
            <button type="button" className="min-h-11 rounded-lg bg-panel px-3 text-sm" onClick={() => setReplay((n) => n + 1)}>
              Play the sag
            </button>
            <button type="button" className="min-h-11 rounded-lg bg-panel px-3 text-sm" onClick={() => setOrtho((v) => !v)}>
              {ortho ? "Perspective" : "Orthographic"}
            </button>
            <label className="flex min-h-11 items-center gap-2 text-sm text-dust">
              Section
              <input type="range" min={0} max={1} step={0.05} value={cut} onChange={(e) => setCut(Number(e.target.value))} />
            </label>
          </div>
          <p className="text-xs text-dust">The shape is schematic and deflection is exaggerated. Read numerical sag together with any model-validity warning. The supported plate has its greatest bending moment at midspan; a cantilever has its greatest at the root.</p>
          <Hud evaluation={evaluation} missionId={mission.id} why={why} setWhy={setWhy} />
          {concept ? (
            <aside className="rounded-lg border border-line-forge bg-panel p-4">
              <p className="font-forge text-xl">{concepts[concept]?.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-dust">{concepts[concept]?.body}</p>
              <ConceptFilm id={concept} />
              {nudge ? <p className="mt-3 text-sm">{nudge}</p> : null}
              <button
                type="button"
                className="mt-3 min-h-11 rounded-lg bg-brass px-4 text-sm text-brass-ink"
                onClick={() => {
                  useForge.getState().see(concept);
                  setConcept(null);
                  setNudge(null);
                }}
              >
                Dismiss
              </button>
            </aside>
          ) : null}
          {hot ? (
            <p className="text-sm text-alarm">
              {hot.mode === "static_instability"
                ? `Static margin is ${num(hot.utilization, 2)}. The band is 0.05 to 0.25 of the chord.`
                : hot.mode === "stall"
                  ? "Past the teaching stall. Lift is no longer climbing with angle."
                  : `${hot.mode.replaceAll("_", " ")} at ${hot.location}. ${["strength_limit_exceeded", "strength_margin_shortfall"].includes(hot.mode) ? `Stress / supplied limit: ${num(hot.utilization, 2)}.` : ""}`}
            </p>
          ) : (
            <p className="text-sm text-dust">No named failure on the current numbers.</p>
          )}
          <PhaseBody
            missionId={mission.id}
            evaluation={evaluation}
            workerNote={workerNote}
            setWorkerNote={setWorkerNote}
          />
          <button
            type="button"
            disabled={!ready || run.phase === "review"}
            onClick={() => useForge.getState().advance(missionId)}
            className="min-h-11 rounded-lg bg-brass px-4 text-sm text-brass-ink disabled:opacity-40"
          >
            {run.phase === "brief" ? "Accept brief" : run.phase === "review" ? "Sealed above" : "Continue"}
          </button>
        </section>
        <aside className="order-3 space-y-4">
          <Inspector missionId={mission.id} />
        </aside>
      </div>
      <Ledger missionId={mission.id} assumptions={evaluation.assumptions} />
    </main>
  );
}

function exitReady(phase: Phase, run: NonNullable<ReturnType<typeof useForge.getState>["runs"][string]>, ev: Evaluation, required: string[]) {
  if (phase === "brief") return true;
  if (phase === "design") return run.parts.every((part) => Object.values(part.params).every((v) => Number.isFinite(v)));
  if (phase === "materials") return run.parts.every((part) => part.materialId && part.processId);
  if (phase === "simulate") {
    const need = required.filter((k) => k !== "dfm" && k !== "cost");
    return need.every((k) => run.analyses.includes(k));
  }
  if (phase === "make") return (ev.passDfm || run.dfmOverride) && run.analyses.includes("cost");
  if (phase === "test") return run.testDone;
  return run.sealed;
}

function ConstraintList({ missionId, evaluation }: { missionId: string; evaluation: Evaluation }) {
  const mission = missionById(missionId)!;
  const c = mission.constraints;
  const rows = [
    evaluation.aero ? ["Lift / model weight", `${num(evaluation.aero.lift_N, 3)} / ${num(evaluation.aero.weight_N, 3)} N`, evaluation.passAero] : null,
    c.maxMass_g !== undefined ? ["Mass", `${num(evaluation.mass_g, 1)} / ${c.maxMass_g} g`, evaluation.passMass] : null,
    c.maxCost_usd !== undefined ? ["Primary-part unit cost", `${evaluation.cost ? money(evaluation.cost.unit) : "Not quoted"} / ${money(c.maxCost_usd)}`, evaluation.passCost] : null,
    c.minSafetyFactor !== undefined ? ["Safety factor", `${num(evaluation.minSafetyFactor, 2)} / ${c.minSafetyFactor}`, evaluation.passStress] : null,
    c.maxDeflection_mm !== undefined ? ["Sag", `${num(evaluation.maxDeflection_mm, 2)} / ${c.maxDeflection_mm} mm`, evaluation.passDeflection] : null,
    ["Design for manufacture (DFM)", `${num(evaluation.dfmScore, 0)} / ${c.dfmScoreMin ?? 70}`, evaluation.passDfm],
    evaluation.aero ? ["Static margin", `${num(evaluation.aero.sm, 2)} / 0.05–0.25`, evaluation.aero.stable] : null,
  ].filter(Boolean) as [string, string, boolean][];
  return (
    <div className="rounded-lg border border-line-forge bg-panel p-4">
      <h2 className="font-forge text-lg">Constraints</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {rows.map(([label, value, ok]) => (
          <li key={label} className="flex justify-between gap-3">
            <span className="text-dust">{label}</span>
            <span className={ok ? "font-mono" : "font-mono text-alarm"}>{value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Hud({
  evaluation,
  missionId,
  why,
  setWhy,
}: {
  evaluation: Evaluation;
  missionId: string;
  why: string | null;
  setWhy: (v: string | null) => void;
}) {
  const mission = missionById(missionId)!;
  const chips = [
    ["Mass", `${num(evaluation.mass_g, 1)} g`, "mass"],
    ["Part quote", evaluation.cost ? money(evaluation.cost.unit) : "Not quoted", "cost"],
    ["Safety", num(evaluation.minSafetyFactor, 2), "sf"],
    ["Design for manufacture (DFM)", num(evaluation.dfmScore, 0), "dfm"],
  ];
  if (evaluation.aero) chips.push(["Drag", `${num(evaluation.aero.drag_N, 2)} N`, "drag"]);
  if (mission.constraints.armCount && evaluation.thrustToWeight !== null) {
    chips.push(["Thrust / weight", num(evaluation.thrustToWeight, 2), "tw"]);
  }
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {chips.map(([label, value, id]) => (
          <button
            key={id}
            type="button"
            onClick={() => setWhy(why === id ? null : id)}
            aria-label={`${label} ${value}. ${chipState(id, evaluation)}`}
            className="min-h-11 rounded-lg bg-panel px-3 text-left"
          >
            <span className="block text-xs text-dust">{label}</span>
            <span className="font-mono text-sm">{value}</span>
          </button>
        ))}
      </div>
      {why ? <p className="mt-2 text-sm text-dust">{explain(why, evaluation)}</p> : null}
    </div>
  );
}

function chipState(id: string, ev: Evaluation) {
  if (id === "mass") return ev.passMass ? "inside the limit" : "over the limit";
  if (id === "cost") return ev.passCost ? "inside the limit" : "over the limit";
  if (id === "sf") return ev.passStress ? "meets the factor" : "under the factor";
  if (id === "dfm") return ev.passDfm ? "process accepts it" : "process objects";
  return "from the current model";
}

function explain(id: string, ev: Evaluation) {
  if (id === "mass") return `Mass is density times volume of every part. ${ev.mass_g.toFixed(1)} g. Classroom densities, not a weigh-in.`;
  if (id === "cost") return "The primary-part quote adds material, machine time, setup and tooling divided by quantity, labor, and finishing. Scrap multiplies material only. Other parts, assembly and real supplier qualification are not included.";
  if (id === "sf") return `Safety factor is allowable divided by the stress in the model. The smallest one is ${ev.minSafetyFactor.toFixed(2)}.`;
  if (id === "dfm") return "Design for manufacture (DFM) is a classroom rule score, not fabrication approval. A passing rule earns full credit, a failed warning earns half, and a failed blocking rule earns zero.";
  if (id === "drag") return "Drag = ½ρV²S·CD: ρ is air density (kg/m³), V is airspeed (m/s), S is wing area (m²), and CD is the dimensionless drag coefficient. The result is in newtons. CD adds a teaching zero-lift term to induced drag.";
  return ev.assumptions[0] ?? "";
}

function stabilityDescription(sm: number) {
  if (sm < 0) return "The CG is behind the neutral point. Static margin is negative and the glider is statically unstable.";
  if (sm < 0.05) return "The CG is only slightly ahead of the neutral point. Restoring margin is weak; move the CG forward to reach the target band.";
  if (sm > 0.25) return "The nose is heavy. The CG sits too far ahead of the neutral point; move it aft to reduce the margin.";
  return "The CG is ahead of the neutral point within the target static-margin band.";
}

function GliderCalculations() {
  return <details className="rounded-lg border border-line-forge p-3">
    <summary className="min-h-11 cursor-pointer font-medium text-bone">Default glider: mass and stability calculations</summary>
    <div className="mt-3 space-y-3 text-sm text-dust">
      <p>These worked numbers use the starting balsa geometry and density 160 kg/m³. Your current design is shown in Constraints.</p>
      <div role="region" aria-label="Default part masses" tabIndex={0} className="overflow-x-auto">
        <table className="w-full text-left"><caption className="sr-only">Volume times density for the default glider</caption><thead><tr><th scope="col">Part (mm)</th><th scope="col">Volume (cm³)</th><th scope="col">Mass (g)</th></tr></thead><tbody>
          <tr><th scope="row">Wing 500 × 90 × 4</th><td>180</td><td>28.8</td></tr>
          <tr><th scope="row">Fuselage 420 × 12 × 12</th><td>60.48</td><td>9.68</td></tr>
          <tr><th scope="row">Tail 160 × 50 × 3</th><td>24</td><td>3.84</td></tr>
        </tbody></table>
      </div>
      <p>Total mass ≈ 42.3 g. Static margin = (neutral point − CG)/chord. At the starting margin of about 0.51, CG 120 mm and chord 90 mm, the neutral point is about 166 mm from the nose.</p>
      <p>The target band corresponds to CG about 144–161 mm. A middle target is about 152 mm; with the slider’s 5 mm steps, try 150 mm (margin about 0.18) and read the updated result. Passing the neutral point makes the margin negative.</p>
      <p>Once stability passes, predict a thickness change from 4 to 3 mm: wing mass falls by 7.2 g and sag rises by (4/3)³ ≈ 2.37, from about 1.75 to 4.1 mm at unchanged load. Recheck every limit. PLA is denser than balsa, and printed-layer strength depends on load direction.</p>
    </div>
  </details>;
}

function PhaseBody({
  missionId,
  evaluation,
  workerNote,
  setWorkerNote,
}: {
  missionId: string;
  evaluation: Evaluation;
  workerNote: string | null;
  setWorkerNote: (v: string | null) => void;
}) {
  const mission = missionById(missionId)!;
  const run = useForge((s) => s.runs[missionId])!;
  if (run.phase === "brief") {
    return (
      <div className="space-y-3 text-sm leading-relaxed">
        {mission.brief.split("\n\n").map((p) => (
          <p key={p.slice(0, 24)}>{p}</p>
        ))}
        {missionId === "glider" ? <GliderCalculations /> : null}
      </div>
    );
  }
  if (run.phase === "design") {
    return <div className="space-y-4 text-sm leading-relaxed"><p>Change a dimension. Mass, sag, and stress come from the same model as the checks. A marked number is outside the brief.</p>{missionId === "glider" ? <><p>{stabilityDescription(evaluation.aero?.sm ?? 0)}</p><p>Predict which number will move before changing a slider, then compare. Moving the CG aft reduces static margin; changing tail size or fuselage length also moves the neutral point.</p><GliderCalculations /></> : null}</div>;
  }
  if (run.phase === "materials") {
    return <p className="text-sm leading-relaxed">Choose a material compatible with a process in this classroom shop. Read the teaching-input note beneath its name; an overview reference is not a grade-specific data certificate. The manufacturing step flags incompatible choices.</p>;
  }
  if (run.phase === "simulate") {
    const kinds = mission.requiredAnalyses.filter((k) => k !== "dfm" && k !== "cost") as AnalysisKind[];
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {kinds.map((kind) => (
            <button
              key={kind}
              type="button"
              className="min-h-11 rounded-lg bg-panel px-3 text-sm"
              onClick={() => {
                void runInWorker(kind, toDesign(run, mission)).then((result) => {
                  if (!useForge.getState().recordAnalysis(missionId, kind, result.inputHash)) {
                    setWorkerNote("The design changed while the solver was running. Run the check again for the current inputs.");
                    return;
                  }
                  setWorkerNote(`${kind.replaceAll("_", " ")} ${result.pass ? "passes" : "does not pass"}. ${result.warnings.join(" ")} Hash ${result.inputHash.slice(0, 8)}.`);
                }).catch(() => setWorkerNote("The solver could not finish. No analysis was recorded; retry the check."));
              }}
            >
              Run {kind.replaceAll("_", " ")}
              {run.analyses.includes(kind) ? " · done" : ""}
            </button>
          ))}
          <button
            type="button"
            className="min-h-11 rounded-lg bg-panel px-3 text-sm"
            onClick={() => useForge.getState().patch(missionId, { fidelity: run.fidelity === "L0" ? "L1" : "L0" })}
          >
            {run.fidelity === "L0" ? "Add first bending-frequency estimate (L1)" : "First bending-frequency estimate (L1) is on"}
          </button>
        </div>
        {run.fidelity === "L1" && evaluation.modal_hz !== null ? (
          <p className="text-sm">First beam-only mode {num(evaluation.modal_hz, 0)} Hz. The 180 Hz excitation is a supplied classroom comparison, not a measured motor speed or a load spectrum. Attached mass and joint flexibility are omitted.</p>
        ) : null}
        {workerNote ? <p className="text-sm text-dust">{workerNote}</p> : null}
        <AssumptionList lines={evaluation.assumptions} />
      </div>
    );
  }
  if (run.phase === "make") {
    return (
      <div className="space-y-3 text-sm">
        <label className="flex min-h-11 items-center gap-3">
          Quantity {run.quantity}
          <input
            type="range"
            min={1}
            max={10000}
            step={1}
            value={run.quantity}
            onChange={(e) => useForge.getState().patch(missionId, { quantity: Number(e.target.value) })}
          />
        </label>
        <ul className="space-y-1">
          {evaluation.quotes.map((quote) => (
            <li key={quote.id} className="flex justify-between gap-3">
              <span>
                {quote.name}
                {evaluation.recommended?.id === quote.id ? " · lowest classroom quote" : ""}
              </span>
              <span className="font-mono">{money(quote.terms.unit)}</span>
            </li>
          ))}
        </ul>
        {evaluation.cost ? (
          <ul className="space-y-1 text-dust">
            <li className="flex justify-between"><span>Material, with scrap</span><span className="font-mono">{money(evaluation.cost.material)}</span></li>
            <li className="flex justify-between"><span>Machine time</span><span className="font-mono">{money(evaluation.cost.machine)}</span></li>
            <li className="flex justify-between"><span>(Setup + tooling) / quantity</span><span className="font-mono">{money(evaluation.cost.amortised)}</span></li>
            <li className="flex justify-between"><span>Labor</span><span className="font-mono">{money(evaluation.cost.labor)}</span></li>
            <li className="flex justify-between"><span>Finishing</span><span className="font-mono">{money(evaluation.cost.finishing)}</span></li>
          </ul>
        ) : null}
        <p className="text-dust">
          Quotes are for the primary part, not a complete vehicle. Compare only material-compatible processes, then check geometry and manufacturing rules: the lowest quote is not proof that a process can make the part. Setup and tooling are spread over quantity; cycle time is charged per part.
        </p>
        {evaluation.dfmChecks.map((check) => (
          <p key={check.id} className={check.pass ? "text-dust" : "text-alarm"}>
            {!check.pass && (check.severity === "error" ? "Blocking rule: " : "Warning: ")}{check.message}
          </p>
        ))}
        {evaluation.incompatible.map((line) => (
          <p key={line} className="text-alarm">{line}</p>
        ))}
        <label className="flex min-h-11 items-center gap-2">
          <input
            type="checkbox"
            checked={run.dfmOverride}
            onChange={(e) => useForge.getState().patch(missionId, { dfmOverride: e.target.checked })}
          />
          Continue the virtual exercise with a recorded manufacturing-rule override. This does not approve fabrication or remove the failed check.
        </label>
        <button type="button" className="min-h-11 rounded-lg bg-panel px-3" onClick={() => useForge.getState().recordAnalysis(missionId, "cost")}>
          {run.analyses.includes("cost") ? "Cost checked" : "Check the cost"}
        </button>
      </div>
    );
  }
  if (run.phase === "test") {
    return (
      <div className="space-y-3 text-sm">
        <button
          type="button"
          className="min-h-11 rounded-lg bg-brass px-4 text-brass-ink"
          onClick={() => {
            const kind: AnalysisKind = mission.artifactType === "glider" ? "aero_polar" : "static_stress";
            void runInWorker(kind, toDesign(run, mission)).then((result) => {
              if (!useForge.getState().recordTest(missionId, kind, result.inputHash)) setWorkerNote("The design changed during the virtual test. Run it again for the current inputs.");
            }).catch(() => setWorkerNote("The virtual test could not finish. Retry it; no test completion was recorded."));
          }}
        >
          Run the virtual test
        </button>
        {run.dfmOverride ? <p>You recorded a manufacturing override. This test does not erase it.</p> : null}
        {run.testDone && evaluation.aero ? <GlidePlay points={evaluation.aero.points} /> : null}
        {run.testDone && <ResultSummary evaluation={evaluation} limits={mission.constraints} />}
        <VirtualTestLimit glider={mission.artifactType === "glider"} />
      </div>
    );
  }
  const pct = run.rubric ? rubricPercent(run.rubric) : null;
  return (
    <div className="space-y-3 text-sm">
      {mission.reflectionPrompts.map((prompt) => (
        <p key={prompt}>{prompt}</p>
      ))}
      <textarea
        value={run.reflection}
        onChange={(e) => useForge.getState().patch(missionId, { reflection: e.target.value })}
        className="min-h-32 w-full rounded-lg border border-line-forge bg-panel p-3 text-bone"
        placeholder="What you changed, what it cost you, and what the model is pretending."
      />
      <button
        type="button"
        className="min-h-11 rounded-lg bg-brass px-4 text-brass-ink disabled:opacity-40"
        disabled={run.reflection.trim().length < 30 || run.sealed}
        onClick={() => {
          const met = requiredChecksPass(evaluation);
          useForge.getState().submit(missionId, met);
        }}
      >
        Seal this iteration
      </button>
      {pct !== null ? <p>Rubric {pct.toFixed(0)}%. {run.sealedCount} sealed. Complete three distinct sealed iterations and achieve a best reflection score of at least 70% to unlock modules that depend on this one.</p> : null}
      {run.rubric?.map((item) => (
        <p key={item.rubricItemId} className="text-dust">
          {item.rubricItemId}: {item.score}/2. {item.feedback}
        </p>
      ))}
    </div>
  );
}

function Inspector({ missionId }: { missionId: string }) {
  const mission = missionById(missionId)!;
  const run = useForge((s) => s.runs[missionId]);
  if (!run) return null;
  return (
    <div className="space-y-4">
      {run.parts.map((part) => {
        const spec = mission.parts.find((p) => p.id === part.id);
        const mat = materialById(part.materialId);
        return (
          <div key={part.id} className="rounded-lg border border-line-forge bg-panel p-4">
            <h3 className="font-forge text-lg">{part.name}</h3>
            <p className="text-xs text-dust">Model length {num(part.params.length_mm ?? part.params.span_mm ?? 0, 0)} mm</p>
            {spec?.specs.map((slider) => (
              <label key={slider.key} className="mt-3 block text-sm">
                <span className="flex justify-between text-dust">
                  <span>{slider.label}</span>
                  <span className="font-mono text-bone">
                    {num(part.params[slider.key] ?? 0, slider.step < 1 ? 1 : 0)} {slider.unit}
                  </span>
                </span>
                <input
                  className="mt-1 w-full"
                  type="range"
                  min={slider.min}
                  max={slider.max}
                  step={slider.step}
                  value={part.params[slider.key] ?? slider.min}
                  onChange={(e) => useForge.getState().setParam(missionId, part.id, slider.key, Number(e.target.value))}
                />
              </label>
            ))}
            <div className="mt-3 flex flex-wrap gap-2">
              {materials.filter((m) => mission.artifactType === "glider" ? m.id === "balsa" || m.id === "pla" : true).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    const process = m.processes.includes(part.processId ?? "cnc_3axis") ? part.processId : m.processes[0];
                    useForge.getState().setPart(missionId, part.id, { materialId: m.id, processId: process ?? null });
                  }}
                  className={`min-h-11 rounded-lg px-3 text-sm ${part.materialId === m.id ? "bg-brass text-brass-ink" : "bg-panel-2"}`}
                >
                  {m.name}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-dust">{mat.source.citation}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {mat.processes.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => useForge.getState().setPart(missionId, part.id, { processId: id })}
                  className={`min-h-11 rounded-lg px-3 text-sm ${part.processId === id ? "bg-brass text-brass-ink" : "bg-panel-2"}`}
                >
                  {processById(id).name}
                </button>
              ))}
            </div>
          </div>
        );
      })}
      {run.vehicle ? (
        <div className="rounded-lg border border-line-forge bg-panel p-4">
          <h3 className="font-forge text-lg">Flight</h3>
          <SliderRow label="Angle" unit="°" min={0} max={18} step={0.5} value={run.vehicle.alpha_deg} onChange={(v) => useForge.getState().setVehicle(missionId, { alpha_deg: v })} />
          <SliderRow label="Speed" unit="m/s" min={4} max={16} step={0.5} value={run.vehicle.speed_ms} onChange={(v) => useForge.getState().setVehicle(missionId, { speed_ms: v })} />
          <SliderRow label="CG from nose" unit="mm" min={60} max={320} step={5} value={run.vehicle.cg_fromNose_mm} onChange={(v) => useForge.getState().setVehicle(missionId, { cg_fromNose_mm: v })} />
          <p className="mt-2 text-xs text-dust">The brass point is the center of gravity. Static margin wants it in the 5% to 25% band.</p>
        </div>
      ) : null}
    </div>
  );
}

function SliderRow({ label, unit, min, max, step, value, onChange }: { label: string; unit: string; min: number; max: number; step: number; value: number; onChange: (v: number) => void }) {
  return (
    <label className="mt-3 block text-sm">
      <span className="flex justify-between text-dust">
        <span>{label}</span>
        <span className="font-mono text-bone">{num(value, step < 1 ? 1 : 0)} {unit}</span>
      </span>
      <input className="mt-1 w-full" type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

function AssumptionList({ lines }: { lines: string[] }) {
  return (
    <ul className="space-y-2 text-sm text-dust">
      {lines.map((line) => (
        <li key={line}>{line}</li>
      ))}
    </ul>
  );
}

function Ledger({ missionId, assumptions }: { missionId: string; assumptions: string[] }) {
  const mission = missionById(missionId)!;
  const run = useForge((s) => s.runs[missionId]);
  if (!run) return null;
  return (
    <section className="border-t border-line-forge px-4 py-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-forge text-lg">Ledger</h2>
        <button
          type="button"
          className="min-h-11 rounded-lg bg-panel px-3 text-sm"
          onClick={() => {
            const text = notebookMarkdown(mission.title, mission.brief, run.ledger, assumptions);
            const blob = new Blob([text], { type: "text/markdown" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${mission.id}-notebook.md`;
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          Export notebook
        </button>
      </div>
      <ol className="mt-3 space-y-2 text-sm text-dust">
        {run.ledger.length === 0 ? <li>Nothing sealed yet. Leaving a phase writes a line.</li> : null}
        {run.ledger.map((entry) => (
          <li key={entry.id}>
            Iteration {entry.iteration} · {entry.phase} · {entry.action}
            {entry.note ? ` — ${entry.note.slice(0, 140)}` : ""}
          </li>
        ))}
      </ol>
    </section>
  );
}
