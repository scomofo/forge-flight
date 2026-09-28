import { useEffect, useState } from "react";
import { BenchShell, Readouts, Segmented, Slider, fmt } from "./ui";
import {
  ASSEMBLY_BRIEFS,
  FIXED_SIDES,
  JOINT_METHODS,
  assemblyBrief,
  boltLapJoint,
  adhesiveBondArea,
  galvanicRisk,
  interfaceVerdict,
  material,
  weldVerdict,
  type AssemblyBrief,
  type JointMethod,
} from "@/course/joints";

const RECORD_KEY = "ff:jointrecord-w25";

const RECORD_RUBRIC = [
  "Every part has a material chosen.",
  "Every interface has a joint method and its verdict read — no unread verdicts.",
  "No interface is blocked, or every blocked interface names its mitigation.",
  "Rejected options are named with their causes of death.",
  "Risks accepted are written down, not just felt.",
];

type RecordState = {
  briefId: string;
  partMats: Record<string, string>;
  methods: Record<string, JointMethod>;
  winner: string;
  rejects: string;
  risks: string;
  rubric: boolean[];
};

function defaultRecord(): RecordState {
  const brief = ASSEMBLY_BRIEFS[0];
  const partMats: Record<string, string> = {};
  for (const p of brief.parts) partMats[p.id] = p.options[0];
  const methods: Record<string, JointMethod> = {};
  for (const j of brief.interfaces) methods[j.id] = j.methods[0];
  return { briefId: brief.id, partMats, methods, winner: "", rejects: "", risks: "", rubric: RECORD_RUBRIC.map(() => false) };
}

function loadRecord(): RecordState {
  try {
    const raw = localStorage.getItem(RECORD_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<RecordState>;
      if (parsed && typeof parsed.briefId === "string" && assemblyBrief(parsed.briefId)) {
        const base = defaultRecord();
        return { ...base, ...parsed, rubric: RECORD_RUBRIC.map((_, i) => parsed.rubric?.[i] ?? false) };
      }
    }
  } catch {
    /* private browsing: fall through to defaults */
  }
  return defaultRecord();
}

function resolvePartMaterial(brief: AssemblyBrief, partId: string, partMats: Record<string, string>) {
  const part = brief.parts.find((p) => p.id === partId);
  if (part) return material(partMats[partId] ?? part.options[0]);
  return material(FIXED_SIDES[partId]);
}

/** The joint/material decision record — the Week 25 evidence task. */
export function JointRecordBench() {
  const [state, setState] = useState<RecordState>(loadRecord);

  useEffect(() => {
    try {
      localStorage.setItem(RECORD_KEY, JSON.stringify(state));
    } catch {
      /* the record simply does not persist */
    }
  }, [state]);

  const brief = assemblyBrief(state.briefId);

  const setBrief = (briefId: string) => {
    const b = assemblyBrief(briefId);
    const partMats: Record<string, string> = {};
    for (const p of b.parts) partMats[p.id] = p.options[0];
    const methods: Record<string, JointMethod> = {};
    for (const j of b.interfaces) methods[j.id] = j.methods[0];
    setState((s) => ({ ...s, briefId, partMats, methods }));
  };

  const verdicts = brief.interfaces.map((j) => {
    const a = resolvePartMaterial(brief, j.between[0], state.partMats);
    const b = resolvePartMaterial(brief, j.between[1], state.partMats);
    const method = state.methods[j.id] ?? j.methods[0];
    return { iface: j, a, b, method, verdict: interfaceVerdict(a, b, method, brief.env) };
  });
  const blocked = verdicts.filter((v) => !v.verdict.ok).length;

  const methodLabel = (m: JointMethod) => JOINT_METHODS.find((x) => x.value === m)?.label ?? m;

  return (
    <BenchShell
      prompt="Pick a brief and configure every part and interface. || Read each interface verdict — name what dies and why. || Write the one-page decision record: winner, joint plan, rejected options with causes of death, risks accepted."
      note="Verdicts use classroom-grade numbers (15 MPa bond shear, handbook-typical galvanic potentials, weld factors). Honest enough to choose with; too coarse to certify with."
      controls={
        <>
          <Segmented
            label="Assembly brief"
            value={state.briefId}
            onChange={setBrief}
            options={ASSEMBLY_BRIEFS.map((b) => ({ value: b.id, label: b.title }))}
          />
          {brief.parts.map((p) => (
            <Segmented
              key={p.id}
              label={p.label}
              value={state.partMats[p.id] ?? p.options[0]}
              onChange={(v) => setState((s) => ({ ...s, partMats: { ...s.partMats, [p.id]: v } }))}
              options={p.options.map((id) => ({ value: id, label: material(id).name }))}
            />
          ))}
          {brief.interfaces.map((j) => (
            <Segmented
              key={j.id}
              label={`${j.label} — joint method`}
              value={state.methods[j.id] ?? j.methods[0]}
              onChange={(v) => setState((s) => ({ ...s, methods: { ...s.methods, [j.id]: v } }))}
              options={j.methods.map((m) => ({ value: m, label: methodLabel(m) }))}
            />
          ))}
          <div className="sm:col-span-2">
            <div className="mb-2 text-sm text-well-dim">Rubric — check what the record earns</div>
            <div className="flex flex-col gap-2">
              {RECORD_RUBRIC.map((item, i) => (
                <label key={item} className="flex cursor-pointer items-start gap-3 text-sm text-well-fg">
                  <input
                    type="checkbox"
                    checked={state.rubric[i] ?? false}
                    onChange={() =>
                      setState((s) => ({ ...s, rubric: s.rubric.map((c, k) => (k === i ? !c : c)) }))
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
      <Readouts
        items={[
          { label: "Interfaces", value: `${brief.interfaces.length}` },
          { label: "Passing", value: `${brief.interfaces.length - blocked}` },
          { label: "Blocked", value: `${blocked}` },
        ]}
      />
      <p className="mb-5 text-sm leading-relaxed text-well-dim">{brief.description}</p>
      <div className="mb-5 flex flex-col gap-4">
        {verdicts.map((v) => (
          <div key={v.iface.id} className="rounded-lg bg-white/5 p-3 ring-1 ring-white/15">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-well-fg">
                {v.iface.label}: {v.a.name} ↔ {v.b.name} ({methodLabel(v.method)})
              </span>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                  v.verdict.ok ? "bg-emerald-400/20 text-emerald-200" : "bg-red-400/20 text-red-200"
                }`}
              >
                {v.verdict.ok ? "Stands" : "Blocked"}
              </span>
            </div>
            <div className="text-sm text-well-dim">
              Joint carries ≈{Math.round(v.verdict.strengthFraction * 100)}% of the weaker member.
            </div>
            {v.verdict.issues.map((issue) => (
              <p key={issue} className="mt-1 text-sm text-red-200">
                ✕ {issue}
              </p>
            ))}
            {v.verdict.notes.map((note) => (
              <p key={note} className="mt-1 text-sm text-well-dim">
                · {note}
              </p>
            ))}
          </div>
        ))}
      </div>
      <div className="mb-5 rounded-lg bg-white/5 p-3 ring-1 ring-white/15">
        <p className="mb-1 text-sm font-medium text-well-fg">The lesson of this brief</p>
        <p className="text-sm leading-relaxed text-well-dim">{brief.lesson}</p>
      </div>
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-sm text-well-dim">Decision — winner and joint plan (one paragraph)</span>
          <textarea
            value={state.winner}
            onChange={(e) => setState((s) => ({ ...s, winner: e.target.value }))}
            rows={3}
            placeholder="e.g. 1018 steel bracket, TIG welded to the receiver. …"
            className="rounded-lg bg-white/5 p-3 text-sm text-well-fg ring-1 ring-white/15 placeholder:text-well-dim/60"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm text-well-dim">Rejected options and their causes of death</span>
          <textarea
            value={state.rejects}
            onChange={(e) => setState((s) => ({ ...s, rejects: e.target.value }))}
            rows={3}
            placeholder="e.g. CFRP — cannot weld to steel receiver; bonded insert adds cost and failure modes; galvanic gap to steel in salt spray. …"
            className="rounded-lg bg-white/5 p-3 text-sm text-well-fg ring-1 ring-white/15 placeholder:text-well-dim/60"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm text-well-dim">Risks accepted</span>
          <textarea
            value={state.risks}
            onChange={(e) => setState((s) => ({ ...s, risks: e.target.value }))}
            rows={2}
            placeholder="e.g. Weld inspection is visual only; accepting HAZ softening at 100%→… "
            className="rounded-lg bg-white/5 p-3 text-sm text-well-fg ring-1 ring-white/15 placeholder:text-well-dim/60"
          />
        </label>
      </div>
    </BenchShell>
  );
}

/** Size one bolted lap three ways — bolt, weld, bond — and see which check governs. */
export function JointStrengthBench() {
  const [loadN, setLoadN] = useState(3000);
  const [diaMm, setDiaMm] = useState("8");
  const [thickMm, setThickMm] = useState(4);
  const [planes, setPlanes] = useState("1");
  const [plateId, setPlateId] = useState("al6061");

  const dia = Number(diaMm);
  const shearPlanes = Number(planes);
  const plate = material(plateId);
  const { bearingMPa, shearMPa } = boltLapJoint(loadN, dia, thickMm, shearPlanes);

  // Classroom allowables, flagged as such: bearing 1.5× yield with e ≥ 2d; bolt shear 300 MPa.
  const bearingAllow = 1.5 * plate.strength;
  const boltShearAllow = 300;
  const bearingMargin = bearingAllow / bearingMPa;
  const shearMargin = boltShearAllow / shearMPa;
  const governing = bearingMargin < shearMargin ? "bearing on the plate" : "shear in the bolt";

  const weld = weldVerdict(plate, plate);
  const bondArea = adhesiveBondArea(loadN, 15);

  return (
    <BenchShell
      prompt="Size a bolted lap for the load — diameter, thickness, shear planes. || Compare the same load through a weld and a bond. || Find which check governs: bearing, shear, or the joint efficiency."
      note="Bearing allowables assume proper edge distance (e ≥ 2d) and 1.5× yield — classroom values. Bolt shear allowable 300 MPa is a teaching number for a medium-strength bolt."
      controls={
        <>
          <Slider label="Tensile load" value={loadN} min={500} max={10000} step={100} display={`${loadN} N`} onChange={setLoadN} />
          <Slider label="Plate thickness" value={thickMm} min={2} max={12} step={0.5} display={`${fmt(thickMm)} mm`} onChange={setThickMm} />
          <Segmented
            label="Bolt diameter"
            value={diaMm}
            onChange={setDiaMm}
            options={["6", "8", "10", "12"].map((d) => ({ value: d, label: `M${d}` }))}
          />
          <Segmented
            label="Plate material"
            value={plateId}
            onChange={setPlateId}
            options={[
              { value: "al6061", label: "6061-T6 aluminum" },
              { value: "steel1018", label: "1018 steel" },
            ]}
          />
          <Segmented
            label="Shear planes"
            value={planes}
            onChange={setPlanes}
            options={[
              { value: "1", label: "Single shear (lap)" },
              { value: "2", label: "Double shear (clevis)" },
            ]}
          />
        </>
      }
    >
      <Readouts
        items={[
          { label: "Bearing stress", value: `${fmt(bearingMPa)} MPa` },
          { label: "Bolt shear stress", value: `${fmt(shearMPa)} MPa` },
          { label: "Bearing margin", value: `${fmt(bearingMargin, 2)}×` },
          { label: "Shear margin", value: `${fmt(shearMargin, 2)}×` },
          { label: "Governs", value: governing },
        ]}
      />
      <div className="flex flex-col gap-3">
        <div className="rounded-lg bg-white/5 p-3 ring-1 ring-white/15">
          <p className="text-sm font-medium text-well-fg">Same {loadN} N through a TIG weld</p>
          <p className="mt-1 text-sm text-well-dim">
            {weld.ok
              ? `Weld keeps ≈${Math.round(weld.efficiency * 100)}% of ${plate.name} — size the member for ${(plate.strength * weld.efficiency).toFixed(0)} MPa at the joint, not the catalog ${plate.strength} MPa.`
              : weld.notes[0]}
          </p>
        </div>
        <div className="rounded-lg bg-white/5 p-3 ring-1 ring-white/15">
          <p className="text-sm font-medium text-well-fg">Same {loadN} N through an epoxy bond</p>
          <p className="mt-1 text-sm text-well-dim">
            At 15 MPa allowable shear the lap needs {fmt(bondArea, 0)} mm² of bond area — no holes, no
            heat-affected zone, but peel and 120 °C will end it before shear does.
          </p>
        </div>
        <div className="rounded-lg bg-white/5 p-3 ring-1 ring-white/15">
          <p className="text-sm font-medium text-well-fg">Galvanic note</p>
          <p className="mt-1 text-sm text-well-dim">
            {(() => {
              const g = galvanicRisk(plate, material("steel1018"), "humid");
              return `Steel fastener in ${plate.name}, humid air: ${g.level} risk — ${g.note}`;
            })()}
          </p>
        </div>
      </div>
    </BenchShell>
  );
}
