import { useEffect, useMemo, useState } from "react";
import { specificStrength, stocks, type Family, type Stock } from "@/course/stocks";
import { BenchShell, fmt, Readouts, Slider, useReducedMotion, useTicker, WellButton, Segmented, Segmented as SegmentedControl } from "./ui";
import { cn } from "@/lib/cn";
import {
  BOND_PROFILES,
  SUBSTANCES,
  meltingRegime,
  predictProperties,
  scorePrediction,
  type BondKind,
  type Conduction,
  type Mechanical,
  type PropertyPack,
  type Thermal,
} from "@/course/bonding";
import {
  STRUCTURES,
  cubicCellVolumeCm3,
  hcpCellVolumeCm3,
  latticeParameterPm,
  theoreticalDensity,
  type CrystalStructure,
} from "@/course/microstructure";
import {
  arrheniusD,
  caseDepth,
  concentrationProfile,
  DIFFUSANTS,
  diffusionLength,
  equivalentTime,
  VACANCY_QV_EV,
  vacancyFraction,
} from "@/course/diffusion";
import {
  extractParams,
  generateCurve,
  MATERIALS,
  type ExtractedParams,
  type MaterialParams,
} from "@/course/mechresponse";
import {
  ALLOYS,
  MECHANISMS,
  REQUIREMENTS,
  ROUTES,
  hallPetch,
  judge,
  outcome,
  solidSolution,
  workHarden,
  type AlloyId,
  type MechanismId,
  type Requirement,
  type RouteId,
} from "@/course/strengthening";
import { basquinLife, larsonMiller, ruptureTime } from "@/course/fracture";
import {
  CU_NI,
  EUTECTIC_REGION_LABELS,
  PB_SN,
  coringSpread,
  eutecticRegionAt,
  eutecticTieLineAt,
  isoRegionAt,
  isoSolidificationPath,
  isoTieLineAt,
  leverFractions,
  type EutecticRegion,
} from "@/course/phasediagrams";
import {
  FAMILIES,
  FAMILY_LABEL,
  PROFILES,
  screenFamilies,
  type Constraints,
  type FamilyId,
} from "@/course/families";
import {
  corrosionModes,
  galvanicRisk,
  galvanicSeries,
  indexInfo,
  propertyIndex,
  rankMaterials,
  screenMaterials,
  selMaterials,
  tradeStudy,
  type Environment,
  type IndexKind,
} from "@/course/selection";
import {
  MAT_MASTERY_BANK,
  correctionsRequired,
  masteryPass,
  masteryPct,
  sparChain,
  type MatMasteryItem,
  type MatMasteryTopic,
} from "@/course/matsynthesis";

const cases: { job: string; answer: Family; why: string }[] = [
  {
    job: "A wire that must be drawn very thin and then carry current.",
    answer: "metal",
    why: "Metallic bonding allows slip, so the wire can be drawn, and it leaves electrons free to carry current. A ceramic would crack. A plain polymer would not conduct.",
  },
  {
    job: "The lining of a kiln near 1400°C. Brittleness is acceptable. Melting is not.",
    answer: "ceramic",
    why: "A covalent or ionic network still stands when polymers are gone and many metals have softened. The usual price is that it snaps instead of yielding.",
  },
  {
    job: "A grocery bag: large stretch, very little mass, thrown out after one use.",
    answer: "polymer",
    why: "Long-chain molecules give that stretch near a density of 1 g/cm³, and commodity thermoplastics are cheap to extrude as film.",
  },
  {
    job: "A wing skin that must be light and stiff along the span. The other direction can be weaker.",
    answer: "composite",
    why: "Align the fibers with the load and let a matrix hold them. You are buying a direction, and you inherit the weakness across it.",
  },
  {
    job: "A hammer head. Hard, dense, and able to survive a blow without shattering.",
    answer: "metal",
    why: "A ceramic is hard and then shatters: the area under its stress–strain curve is thin. A metal’s ductility absorbs the impact. Hardness comes from alloy and heat treatment.",
  },
];

const familyLabel: Record<Family, string> = {
  metal: "Metal",
  ceramic: "Ceramic",
  polymer: "Polymer",
  composite: "Composite",
};

export function FamiliesBench() {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<Family | null>(null);
  const [correct, setCorrect] = useState(0);
  const done = i >= cases.length;
  const item = cases[i];

  return (
    <BenchShell
      prompt="Read the job, then pick Metal, Ceramic, Polymer, or Composite. || The note names the demand that decided it. Prestige is not a reason."
      note="Real parts mix families. The sort is about which demand is doing the deciding."
      controls={
        <div className="sm:col-span-2">
          {done ? (
            <button
              type="button"
              className="min-h-11 rounded-lg px-4 text-sm text-well-fg ring-1 ring-white/25"
              onClick={() => {
                setI(0);
                setPicked(null);
                setCorrect(0);
              }}
            >
              Sort them again
            </button>
          ) : picked ? (
            <button
              type="button"
              className="min-h-11 rounded-lg bg-well-fg px-4 text-sm text-well"
              onClick={() => {
                if (picked === item.answer) setCorrect((c) => c + 1);
                setPicked(null);
                setI((n) => n + 1);
              }}
            >
              {i === cases.length - 1 ? "See the tally" : "Next job"}
            </button>
          ) : (
            <p className="text-sm text-well-dim">Job {i + 1} of {cases.length}</p>
          )}
        </div>
      }
    >
      {done ? (
        <div>
          <Readouts items={[{ label: "Matched", value: `${correct} of ${cases.length}` }]} />
          <p className="max-w-prose text-sm leading-relaxed text-well-dim">
            {correct >= 4
              ? "The families are separating. The next benches explain the bonding underneath those instincts."
              : "Look back at which demand was actually strict — heat, conduction, impact, direction — and match that, not the prestige of the material."}
          </p>
        </div>
      ) : (
        <div>
          <p className="font-serif text-2xl leading-snug text-balance">{item.job}</p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            {(Object.keys(familyLabel) as Family[]).map((family) => {
              const show = picked !== null;
              const isAnswer = family === item.answer;
              const isPick = family === picked;
              return (
                <button
                  key={family}
                  type="button"
                  disabled={picked !== null}
                  onClick={() => setPicked(family)}
                  className={cn(
                    "min-h-11 rounded-lg px-3 text-sm transition-transform duration-150 active:scale-[0.96]",
                    !show && "ring-1 ring-white/25",
                    show && isAnswer && "bg-well-fg text-well",
                    show && isPick && !isAnswer && "ring-1 ring-well-fg",
                    show && !isAnswer && !isPick && "opacity-40 ring-1 ring-white/15",
                  )}
                >
                  {familyLabel[family]}
                </button>
              );
            })}
          </div>
          {picked ? (
            <>
              <FamilyFilm family={item.answer} />
              <p className="mt-4 text-sm leading-relaxed text-well-dim">{item.why}</p>
            </>
          ) : null}
        </div>
      )}
    </BenchShell>
  );
}

function FamilyFilm({ family }: { family: Family }) {
  const [t, setT] = useState(0);
  const reduce = useReducedMotion();
  useTicker(!reduce, (dt) => setT((s) => s + dt));
  const p = reduce ? 1 : (t % 2.8) / 2.8;
  const hold = p < 0.62 ? p / 0.62 : 1;
  const caption =
    family === "metal"
      ? "Metal: it dents or bends, and it stays one piece."
      : family === "ceramic"
        ? "Ceramic: it holds, then snaps. The pieces do not stretch."
        : family === "polymer"
          ? "Polymer: it stretches a long way, then stays long."
          : "Composite: stiff along the fibers. Across them, it splits.";
  return (
    <div className="mt-5">
      <svg viewBox="0 0 320 64" className="h-16 w-full" aria-hidden>
        {family === "metal" ? (
          <path
            d={`M36 40 Q160 ${40 + hold * 22} 284 40`}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
          />
        ) : null}
        {family === "ceramic" ? (
          hold < 0.82 ? (
            <path
              d={`M48 36 Q160 ${36 + hold * 16} 272 36`}
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
            />
          ) : (
            <>
              <path d="M48 34 L150 46" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
              <path d="M178 46 L272 34" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
            </>
          )
        ) : null}
        {family === "polymer" ? (
          <rect
            x="36"
            y={32 - 8 + hold * 3}
            width={70 + hold * 170}
            height={16 - hold * 6}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        ) : null}
        {family === "composite" ? (
          <>
            {[0, 1, 2, 3].map((i) => (
              <line
                key={i}
                x1="40"
                x2={hold > 0.55 ? 150 : 280}
                y1={18 + i * 10}
                y2={18 + i * 10}
                stroke="currentColor"
                strokeWidth="2"
              />
            ))}
            {hold > 0.55
              ? [0, 1, 2, 3].map((i) => (
                  <line
                    key={`b${i}`}
                    x1="176"
                    x2="280"
                    y1={18 + i * 10}
                    y2={18 + i * 10}
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                ))
              : null}
          </>
        ) : null}
      </svg>
      <p className="mt-2 text-sm leading-relaxed text-well-dim">{caption}</p>
    </div>
  );
}

const bonds = [
  {
    id: "metallic",
    label: "Metallic",
    conduction: "High",
    melt: "Wide",
    ductility: "High",
    title: "A sea of electrons",
    body: "Positive cores sit in shared electrons. The electrons carry current and still hold the metal together after atomic planes slip, so it conducts and it bends.",
  },
  {
    id: "ionic",
    label: "Ionic",
    conduction: "Low as a solid",
    melt: "High",
    ductility: "Low",
    title: "Charges, locked",
    body: "Electrons have been transferred. Opposite ions make a strong, high-melting lattice. Slide a plane and like charges meet, so the crystal cracks. Melt it, and the ions themselves can move and conduct.",
  },
  {
    id: "network",
    label: "Covalent network",
    conduction: "Low",
    melt: "Very high",
    ductility: "Low",
    title: "One giant molecule",
    body: "Atoms share electrons across the whole solid, as in diamond or silica. Breaking it means breaking covalent bonds, not peeling neighbors apart. Hard, brittle, and unwilling to melt.",
  },
  {
    id: "molecular",
    label: "Molecular",
    conduction: "Low",
    melt: "Low",
    ductility: "Varies",
    title: "Strong inside, weak between",
    body: "Covalent bonds hold each molecule together. Only weak forces hold molecules to each other, so the solid melts early. Polymers are the long-chain version: strong backbones, weak ties between chains.",
  },
] as const;

export function BondBench() {
  const [id, setId] = useState<(typeof bonds)[number]["id"]>("metallic");
  const bond = bonds.find((b) => b.id === id) ?? bonds[0];
  return (
    <BenchShell
      prompt="Select one bond type. || Conduction, melting, and ductility change together. They are not three separate choices."
      note="These are the textbook extremes. Graphite is covalent in the sheet and weak between sheets. Many ceramics are partly ionic and partly covalent."
      controls={
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          {bonds.map((b) => (
            <button
              key={b.id}
              type="button"
              aria-pressed={b.id === id}
              onClick={() => setId(b.id)}
              className={cn(
                "min-h-11 rounded-lg px-3 py-2 text-sm transition-transform duration-150 active:scale-[0.96]",
                b.id === id ? "bg-well-fg text-well" : "ring-1 ring-white/25",
              )}
            >
              {b.label}
            </button>
          ))}
        </div>
      }
    >
      <BondSketch id={bond.id} />
      {bond.id === "metallic" ? (
        <p className="mt-2 text-sm text-well-dim">The small dots keep drifting. The cores stay put. That drift is the current.</p>
      ) : null}
      <h3 className="mt-4 font-serif text-2xl">{bond.title}</h3>
      <p className="mt-2 max-w-prose text-sm leading-relaxed text-well-dim">{bond.body}</p>
      <dl className="mt-5 grid grid-cols-3 gap-3 text-sm">
        <Meter label="Conduction" value={bond.conduction} />
        <Meter label="Melting" value={bond.melt} />
        <Meter label="Ductility" value={bond.ductility} />
      </dl>
    </BenchShell>
  );
}

function Meter({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-well-dim">{label}</dt>
      <dd className="mt-1 font-serif text-lg leading-snug">{value}</dd>
    </div>
  );
}

function BondSketch({ id }: { id: string }) {
  const [t, setT] = useState(0);
  useTicker(id === "metallic", (dt) => setT((s) => s + dt));
  const drift = (t * 28) % 44;
  return (
    <svg viewBox="0 0 320 72" className="h-16 w-full" aria-hidden>
      {id === "metallic" && (
        <>
          <rect x="16" y="28" width="288" height="16" rx="8" fill="currentColor" opacity="0.18" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <circle key={i} cx={48 + i * 44} cy="36" r="10" fill="currentColor" />
          ))}
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <circle
              key={`e${i}`}
              cx={16 + ((i * 44 + drift) % 288)}
              cy={i % 2 === 0 ? 32 : 40}
              r="2.2"
              fill="currentColor"
            />
          ))}
        </>
      )}
      {id === "ionic" &&
        [0, 1, 2, 3, 4, 5].map((i) => (
          <circle
            key={i}
            cx={48 + i * 44}
            cy="36"
            r={i % 2 ? 8 : 12}
            fill={i % 2 ? "none" : "currentColor"}
            stroke="currentColor"
            strokeWidth="2"
          />
        ))}
      {id === "network" && (
        <>
          {[
            [80, 36],
            [140, 36],
            [200, 36],
            [260, 36],
            [110, 16],
            [170, 16],
            [230, 16],
            [110, 56],
            [170, 56],
            [230, 56],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="4" fill="currentColor" />
          ))}
          <path
            d="M80 36 H260 M110 16 L80 36 L110 56 M170 16 L140 36 L170 56 M230 16 L200 36 L230 56 M260 36 L230 16 M260 36 L230 56 M110 16 H230 M110 56 H230"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </>
      )}
      {id === "molecular" &&
        [0, 1, 2].map((g) => (
          <g key={g}>
            <circle cx={70 + g * 96} cy="36" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx={92 + g * 96} cy="36" r="8" fill="currentColor" />
            <line
              x1={78 + g * 96}
              y1="36"
              x2={84 + g * 96}
              y2="36"
              stroke="currentColor"
              strokeWidth="2"
            />
          </g>
        ))}
    </svg>
  );
}

type CurveId = "steel" | "alumina" | "hdpe";

const curves: Record<
  CurveId,
  {
    name: string;
    modulus: string;
    eMax: number;
    sMax: number;
    points: { e: number; s: number }[];
    region: (e: number) => string;
  }
> = {
  steel: {
    name: "Mild steel",
    modulus: "200 GPa",
    eMax: 0.28,
    sMax: 480,
    points: [
      { e: 0, s: 0 },
      { e: 0.00125, s: 250 },
      { e: 0.02, s: 250 },
      { e: 0.08, s: 360 },
      { e: 0.16, s: 420 },
      { e: 0.22, s: 360 },
      { e: 0.28, s: 300 },
    ],
    region: (e) =>
      e < 0.00125 ? "Elastic" : e < 0.02 ? "Yielding" : e < 0.16 ? "Hardening" : "Necking",
  },
  alumina: {
    name: "Alumina",
    modulus: "300 GPa",
    eMax: 0.001,
    sMax: 360,
    points: [
      { e: 0, s: 0 },
      { e: 0.001, s: 300 },
    ],
    region: (e) => (e >= 0.00098 ? "Fracture" : "Elastic"),
  },
  hdpe: {
    name: "HDPE",
    modulus: "0.8 GPa",
    eMax: 2.2,
    sMax: 48,
    points: [
      { e: 0, s: 0 },
      { e: 0.02, s: 18 },
      { e: 0.12, s: 24 },
      { e: 0.6, s: 30 },
      { e: 1.4, s: 34 },
      { e: 2.2, s: 30 },
    ],
    region: (e) => (e < 0.02 ? "Elastic" : e < 1.6 ? "Drawing" : "Thinning"),
  },
};

function stressAt(points: { e: number; s: number }[], e: number) {
  if (e <= points[0].e) return points[0].s;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    if (e <= b.e) {
      const t = (e - a.e) / (b.e - a.e || 1);
      return a.s + (b.s - a.s) * t;
    }
  }
  return points[points.length - 1].s;
}

function energyTo(points: { e: number; s: number }[], e: number) {
  const steps = 48;
  let acc = 0;
  let prev = 0;
  for (let i = 1; i <= steps; i++) {
    const ee = (e * i) / steps;
    const s = stressAt(points, ee);
    acc += ((prev + s) / 2) * (e / steps);
    prev = s;
  }
  return acc;
}

function PullSpecimen({ region, frac }: { region: string; frac: number }) {
  const neck = region === "Necking" || region === "Thinning";
  const snap = region === "Fracture";
  const drawn = region === "Drawing" || region === "Hardening" || region === "Yielding";
  const len = 56 + frac * 180;
  const endH = 16;
  const midH = snap ? 16 : neck ? 5 : drawn ? 11 : 16;
  const x = 28;
  const cy = 22;
  const a = x + len * 0.38;
  const b = x + len * 0.62;
  const right = x + len;
  const d = `M ${x} ${cy - endH / 2} L ${a} ${cy - midH / 2} L ${b} ${cy - midH / 2} L ${right} ${cy - endH / 2} L ${right} ${cy + endH / 2} L ${b} ${cy + midH / 2} L ${a} ${cy + midH / 2} L ${x} ${cy + endH / 2} Z`;
  return (
    <svg viewBox="0 0 320 44" className="mb-3 h-11 w-full" aria-hidden>
      {snap ? (
        <>
          <rect x="28" y="14" width="78" height="16" fill="none" stroke="currentColor" strokeWidth="2" />
          <rect x="128" y="14" width="78" height="16" fill="none" stroke="currentColor" strokeWidth="2" />
        </>
      ) : (
        <path d={d} fill="none" stroke="currentColor" strokeWidth="2" />
      )}
    </svg>
  );
}

export function CurveBench() {
  const [id, setId] = useState<CurveId>("steel");
  const curve = curves[id];
  const [strain, setStrain] = useState(0.002);
  const e = Math.min(strain, curve.eMax);
  const stress = stressAt(curve.points, e);
  const tough = energyTo(curve.points, e);

  const d = useMemo(() => {
    const x0 = 28;
    const y0 = 12;
    const w = 280;
    const h = 140;
    return curve.points
      .map((p, i) => {
        const x = x0 + (p.e / curve.eMax) * w;
        const y = y0 + h - (p.s / curve.sMax) * h;
        return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
  }, [curve]);

  const px = 28 + (e / curve.eMax) * 280;
  const py = 12 + 140 - (stress / curve.sMax) * 140;
  const reduce = useReducedMotion();
  const [playing, setPlaying] = useState(false);
  useTicker(playing && !reduce, (dt) => {
    setStrain((prev) => Math.min(curve.eMax, prev + curve.eMax * dt * 0.22));
  });
  useEffect(() => {
    if (playing && e >= curve.eMax - curve.eMax / 200) setPlaying(false);
  }, [playing, e, curve.eMax]);

  return (
    <BenchShell
      prompt="Pick a material and press Play the pull. || The bar changes shape as Region changes. Elastic is a small stretch. Necking thins the middle. Alumina snaps. Drag Strain if you want one spot."
      note="Teaching curves, not a certificate. Axes rescale with the material: steel is done by a strain of 0.28, while this polymer is still drawing past 2. Area is toughness, in MJ/m³. The bar's stretch is exaggerated so you can see it. The strain number is not."
      controls={
        <>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            {(Object.keys(curves) as CurveId[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setPlaying(false);
                  setId(key);
                  setStrain(curves[key].eMax * 0.35);
                }}
                className={cn(
                  "min-h-11 rounded-lg px-3 py-2 text-sm",
                  key === id ? "bg-well-fg text-well" : "ring-1 ring-white/25",
                )}
              >
                {curves[key].name}
              </button>
            ))}
          </div>
          <div className="sm:col-span-2">
            <Slider
              label="Strain"
              min={0}
              max={curve.eMax}
              step={curve.eMax / 200}
              value={e}
              display={e < 0.01 ? e.toFixed(4) : fmt(e, 2)}
              onChange={(value) => {
                setPlaying(false);
                setStrain(value);
              }}
            />
          </div>
          <div className="flex items-end">
            <WellButton
              onClick={() => {
                if (reduce) return;
                if (playing) {
                  setPlaying(false);
                  return;
                }
                if (e >= curve.eMax * 0.98) setStrain(0);
                setPlaying(true);
              }}
            >
              {reduce ? "Drag strain" : playing ? "Pause" : e >= curve.eMax * 0.98 ? "Replay the pull" : "Play the pull"}
            </WellButton>
          </div>
        </>
      }
    >
      <Readouts
        items={[
          { label: "Region", value: curve.region(e) },
          { label: "Stress", value: `${fmt(stress, 0)} MPa` },
          { label: "Energy so far", value: `${fmt(tough, 1)}` },
        ]}
      />
      <PullSpecimen region={curve.region(e)} frac={e / curve.eMax} />
      <svg viewBox="0 0 320 180" className="h-auto w-full" aria-hidden>
        <line x1="28" y1="152" x2="308" y2="152" stroke="currentColor" strokeOpacity="0.35" />
        <line x1="28" y1="12" x2="28" y2="152" stroke="currentColor" strokeOpacity="0.35" />
        <path d={d} fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx={px} cy={py} r="5" fill="currentColor" />
        <text x="28" y="172" fill="currentColor" opacity="0.6" fontSize="11">
          0
        </text>
        <text x="250" y="172" fill="currentColor" opacity="0.6" fontSize="11">
          strain {curve.eMax}
        </text>
      </svg>
      <p className="mt-2 text-sm text-well-dim">
        {curve.name} · modulus about {curve.modulus}. The slope in the first straight part is stiffness, not strength.
      </p>
    </BenchShell>
  );
}

const compareProps = [
  { key: "density", label: "Density", unit: "g/cm³", max: 9 },
  { key: "modulus", label: "Modulus", unit: "GPa", max: 300 },
  { key: "strength", label: "Strength", unit: "MPa", max: 1500 },
  { key: "temp", label: "Service temp", unit: "°C", max: 1400 },
] as const;

export function CompareBench() {
  const [picked, setPicked] = useState<string[]>(["steel", "al", "cfrp"]);

  function toggle(id: string) {
    setPicked((cur) => {
      if (cur.includes(id)) return cur.filter((x) => x !== id);
      if (cur.length >= 3) return cur;
      return [...cur, id];
    });
  }

  const chosen = picked
    .map((id) => stocks.find((s) => s.id === id))
    .filter((s): s is Stock => Boolean(s));

  return (
    <BenchShell
      prompt="Pin up to three materials. Unpin one if you want a different third. || Bars are scaled to the whole set. Then read specific strength, which is strength divided by density."
      note="Order-of-magnitude teaching values, not a datasheet. Wood and fiber composites are shown for their strong direction. Glass is much stronger in compression than the tensile number here."
      controls={
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          {stocks.map((s) => {
            const on = picked.includes(s.id);
            const blocked = !on && picked.length >= 3;
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={on}
                disabled={blocked}
                onClick={() => toggle(s.id)}
                className={cn(
                  "min-h-11 rounded-lg px-3 text-sm",
                  on ? "bg-well-fg text-well" : "ring-1 ring-white/25",
                  blocked && "opacity-40",
                )}
              >
                {s.name}
              </button>
            );
          })}
        </div>
      }
    >
      {chosen.length === 0 ? (
        <p className="text-sm text-well-dim">Pin a material to start the comparison.</p>
      ) : (
        <div className="flex flex-col gap-5">
          {compareProps.map((prop) => (
            <div key={prop.key}>
              <div className="mb-2 text-sm text-well-dim">
                {prop.label} · {prop.unit}
              </div>
              <div className="flex flex-col gap-2">
                {chosen.map((s) => {
                  const value = s[prop.key];
                  const pct = Math.max(4, (value / prop.max) * 100);
                  return (
                    <div key={s.id} className="grid grid-cols-[6.5rem_1fr_auto] items-center gap-3">
                      <span className="truncate text-sm">{s.name}</span>
                      <div className="h-2 rounded-full bg-white/15">
                        <div className="h-2 rounded-full bg-well-fg" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-14 text-right text-sm tabular-nums">{fmt(value, value < 10 ? 1 : 0)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          <div>
            <div className="mb-2 text-sm text-well-dim">Specific strength · MPa per g/cm³</div>
            {chosen
              .slice()
              .sort((a, b) => specificStrength(b) - specificStrength(a))
              .map((s) => (
                <p key={s.id} className="text-sm leading-relaxed">
                  <span className="tabular-nums">{fmt(specificStrength(s), 0)}</span>
                  <span className="text-well-dim"> · {s.name}. {s.note}</span>
                </p>
              ))}
          </div>
        </div>
      )}
    </BenchShell>
  );
}

export function GrainBench() {
  const [logD, setLogD] = useState(Math.log10(20));
  const dUm = 10 ** logD;
  const dM = dUm * 1e-6;
  const sy = 120 + 0.6 / Math.sqrt(dM);
  const n = dUm < 8 ? 8 : dUm < 20 ? 6 : dUm < 50 ? 4 : dUm < 120 ? 3 : 2;
  const cell = 160 / n;
  const reduce = useReducedMotion();
  const [playing, setPlaying] = useState(false);
  const coarse = Math.log10(200);
  useTicker(playing && !reduce, (dt) => {
    setLogD((prev) => Math.min(coarse, prev + dt * 0.42));
  });
  useEffect(() => {
    if (playing && logD >= coarse - 0.01) setPlaying(false);
  }, [playing, logD, coarse]);

  return (
    <BenchShell
      prompt="Press Play the anneal, or drag grain size from fine to coarse. || The cells get larger and yield strength falls. A few drawn cells stand in for millions of real grains."
      note="A generic metal: σ0 = 120 MPa and k = 0.6 MPa·√m. Real constants depend on the alloy, and extremely fine grains can change the mechanism. The drawing uses a handful of cells to stand in for millions. The play button is a hot hold that grows grains. It is not a measured time."
      controls={
        <>
          <Slider
            label="Grain size"
            min={Math.log10(2)}
            max={coarse}
            step={0.01}
            value={logD}
            display={dUm >= 10 ? `${fmt(dUm, 0)} μm` : `${fmt(dUm, 1)} μm`}
            onChange={(value) => {
              setPlaying(false);
              setLogD(value);
            }}
          />
          <div className="flex items-end">
            <WellButton
              onClick={() => {
                if (reduce) return;
                if (playing) {
                  setPlaying(false);
                  return;
                }
                if (logD >= coarse - 0.02) setLogD(Math.log10(2));
                setPlaying(true);
              }}
            >
              {reduce ? "Drag grain size" : playing ? "Pause" : logD >= coarse - 0.02 ? "Replay the anneal" : "Play the anneal"}
            </WellButton>
          </div>
        </>
      }
    >
      <Readouts
        items={[
          { label: "Yield strength", value: `${fmt(sy, 0)} MPa` },
          { label: "Grains across", value: `${n}` },
        ]}
      />
      <svg viewBox="0 0 160 160" className="mx-auto h-40 w-40" aria-hidden>
        {Array.from({ length: n * n }, (_, i) => {
          const r = Math.floor(i / n);
          const c = i % n;
          return (
            <rect
              key={i}
              x={c * cell + 1.5}
              y={r * cell + 1.5}
              width={cell - 3}
              height={cell - 3}
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.75"
            />
          );
        })}
      </svg>
      <p className="mt-4 text-sm leading-relaxed text-well-dim">
        Finer grains, more boundary, higher yield. A long hot anneal that grows grains walks this slider to the right and usually softens the metal.
      </p>
    </BenchShell>
  );
}

export function AshbyBench() {
  const [logS, setLogS] = useState(Math.log10(100));
  const [density, setDensity] = useState(5);
  const [active, setActive] = useState("cfrp");
  const minS = 10 ** logS;

  const survivors = stocks.filter((s) => s.strength >= minS && s.density <= density);
  const best = survivors.slice().sort((a, b) => specificStrength(b) - specificStrength(a))[0];
  const selected = stocks.find((s) => s.id === active) ?? stocks[0];

  return (
    <BenchShell
      prompt="Set a minimum strength and a maximum density. || Dim points failed a limit. The sentence under the chart names who leads on strength per density inside the window."
      note="Teaching chart. Strength is a generic allowable. Composites and wood are plotted for their strong direction. Price, corrosion, and fatigue are not on the axes."
      controls={
        <>
          <Slider
            label="Minimum strength"
            min={Math.log10(15)}
            max={Math.log10(800)}
            step={0.01}
            value={logS}
            display={`${fmt(minS, 0)} MPa`}
            onChange={setLogS}
          />
          <Slider
            label="Maximum density"
            min={0.6}
            max={9}
            step={0.1}
            value={density}
            display={`${fmt(density, 1)} g/cm³`}
            onChange={setDensity}
          />
        </>
      }
    >
      <Chart
        minS={minS}
        maxD={density}
        active={active}
        onPick={setActive}
      />
      <p className="mt-3 text-sm leading-relaxed">
        {survivors.length === 0
          ? "Nothing in the set clears that screen. Loosen a constraint — that is a real selection move."
          : `${best.name} leads the window on specific strength, at ${fmt(specificStrength(best), 0)} MPa per g/cm³.`}
      </p>
      <div className="mt-4 flex flex-col gap-2">
        {stocks.map((s) => {
          const live = s.strength >= minS && s.density <= density;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setActive(s.id)}
              className={cn(
                "min-h-11 rounded-lg px-3 text-left text-sm",
                s.id === selected.id ? "bg-well-fg text-well" : "ring-1 ring-white/20",
                !live && s.id !== selected.id && "opacity-45",
              )}
            >
              <span className="font-medium">{s.name}</span>
              <span className={cn("ml-2", s.id === selected.id ? "text-well/70" : "text-well-dim")}>
                {live ? "inside" : "screened out"} · {fmt(specificStrength(s), 0)} specific
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-sm leading-relaxed text-well-dim">{selected.note}</p>
    </BenchShell>
  );
}

function xOf(density: number) {
  const min = Math.log10(0.35);
  const max = Math.log10(12);
  return 42 + ((Math.log10(density) - min) / (max - min)) * 300;
}

function yOf(strength: number) {
  const min = Math.log10(12);
  const max = Math.log10(2200);
  return 16 + (1 - (Math.log10(strength) - min) / (max - min)) * 150;
}

function Chart({
  minS,
  maxD,
  active,
  onPick,
}: {
  minS: number;
  maxD: number;
  active: string;
  onPick: (id: string) => void;
}) {
  const xCut = xOf(maxD);
  const yCut = yOf(minS);
  return (
    <svg viewBox="0 0 360 190" className="h-auto w-full">
      <rect x="42" y="16" width="300" height="150" fill="none" stroke="currentColor" strokeOpacity="0.25" />
      <line x1={xCut} y1="16" x2={xCut} y2="166" stroke="currentColor" strokeDasharray="3 3" strokeOpacity="0.45" />
      <line x1="42" y1={yCut} x2="342" y2={yCut} stroke="currentColor" strokeDasharray="3 3" strokeOpacity="0.45" />
      {stocks.map((s) => {
        const live = s.strength >= minS && s.density <= maxD;
        const cx = xOf(s.density);
        const cy = yOf(s.strength);
        return (
          <g key={s.id} opacity={live ? 1 : 0.28} onClick={() => onPick(s.id)} className="cursor-pointer">
            <Shape family={s.family} cx={cx} cy={cy} selected={s.id === active} />
          </g>
        );
      })}
      <text x="42" y="184" fill="currentColor" opacity="0.55" fontSize="11">
        density →
      </text>
      <text x="8" y="20" fill="currentColor" opacity="0.55" fontSize="11">
        strength
      </text>
    </svg>
  );
}

function Shape({
  family,
  cx,
  cy,
  selected,
}: {
  family: Family;
  cx: number;
  cy: number;
  selected: boolean;
}) {
  const sw = selected ? 2.5 : 1.4;
  if (family === "metal") return <circle cx={cx} cy={cy} r="7" fill="none" stroke="currentColor" strokeWidth={sw} />;
  if (family === "ceramic") {
    return (
      <rect
        x={cx - 6}
        y={cy - 6}
        width="12"
        height="12"
        fill="none"
        stroke="currentColor"
        strokeWidth={sw}
      />
    );
  }
  if (family === "polymer") {
    return (
      <path
        d={`M${cx} ${cy - 8} L${cx + 7} ${cy + 6} L${cx - 7} ${cy + 6} Z`}
        fill="none"
        stroke="currentColor"
        strokeWidth={sw}
      />
    );
  }
  return (
    <path
      d={`M${cx} ${cy - 8} L${cx + 7} ${cy} L${cx} ${cy + 8} L${cx - 7} ${cy} Z`}
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
    />
  );
}

const strainSteels = [
  { id: "hard", name: "Hard steel", e: 200000, sf: 1800, ef: 0.25 },
  { id: "mild", name: "Mild steel", e: 200000, sf: 900, ef: 0.7 },
] as const;

const strainB = -0.09;
const strainC = -0.6;

function strainLife(mat: (typeof strainSteels)[number], amplitude: number) {
  let lo = 1;
  let hi = 1e10;
  for (let i = 0; i < 70; i++) {
    const n = Math.sqrt(lo * hi);
    const two = 2 * n;
    const predicted = (mat.sf / mat.e) * two ** strainB + mat.ef * two ** strainC;
    if (predicted > amplitude) lo = n;
    else hi = n;
  }
  const n = Math.sqrt(lo * hi);
  const two = 2 * n;
  const elastic = (mat.sf / mat.e) * two ** strainB;
  const plastic = mat.ef * two ** strainC;
  return { n, elastic, plastic };
}

function strainLabel(n: number) {
  if (n >= 1e8) return "Past 100 million";
  if (n >= 1e6) return `${fmt(n / 1e6, 1)} million`;
  if (n >= 1e3) return `${fmt(n / 1e3, 0)} thousand`;
  return `${fmt(n, 0)} cycles`;
}

function reversalLabel(n: number) {
  const two = 2 * n;
  if (two >= 1e6) return `${fmt(two / 1e6, 1)} million`;
  if (two >= 1e3) return `${fmt(two / 1e3, 0)} thousand`;
  return fmt(two, 0);
}

export function StrainBench() {
  const [percent, setPercent] = useState(0.2);
  const amplitude = percent / 100;
  const lives = strainSteels.map((mat) => ({ mat, ...strainLife(mat, amplitude) }));
  const winner = lives[0].n >= lives[1].n ? lives[0] : lives[1];
  const xOf = (logTwoN: number) => 28 + ((logTwoN - 1) / 7) * 272;
  const yOf = (value: number) => 112 - ((Math.log10(value) + 3.4) / 2) * 90;
  const curves = strainSteels.map((mat) => {
    const pts: string[] = [];
    for (let i = 0; i <= 28; i++) {
      const logTwoN = 1 + (7 * i) / 28;
      const two = 10 ** logTwoN;
      const value = (mat.sf / mat.e) * two ** strainB + mat.ef * two ** strainC;
      pts.push(`${xOf(logTwoN).toFixed(1)},${yOf(value).toFixed(1)}`);
    }
    return pts.join(" ");
  });

  return (
    <BenchShell
      prompt="Set the strain amplitude to 0.2%. || Hard steel lasts longer. Its elastic term is almost the whole 0.00200, and the plastic term is the remainder. Then set 1.0%. || Mild steel lasts longer. For both steels the plastic term is now the larger piece."
      note="Same exponents for both: b = −0.09, c = −0.6. Hard steel σ_f′ = 1800 MPa and ε_f′ = 0.25. Mild steel σ_f′ = 900 MPa and ε_f′ = 0.70. E = 200 GPa. N is cycles. 2N is reversals, two per cycle. The bench searches for N because the powers do not combine. Teaching coefficients, not a fitted alloy. A scratch or a weld toe can skip the birth of the crack and make this life too long."
      controls={
        <Slider
          label="Strain amplitude"
          min={0.2}
          max={2}
          step={0.1}
          value={percent}
          display={`${fmt(percent, 1)}%`}
          onChange={setPercent}
        />
      }
    >
      <Readouts
        items={[
          { label: "Hard steel", value: strainLabel(lives[0].n) },
          { label: "Mild steel", value: strainLabel(lives[1].n) },
          { label: "Lasts longer", value: winner.mat.name },
        ]}
      />
      <svg viewBox="0 0 320 130" className="h-32 w-full" aria-hidden>
        <polyline points={curves[0]} fill="none" stroke="currentColor" strokeWidth="2" />
        <polyline points={curves[1]} fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5 4" />
        <line x1="28" x2="300" y1={yOf(amplitude)} y2={yOf(amplitude)} stroke="currentColor" strokeOpacity="0.45" />
      </svg>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-well-dim">
        <p>
          {`Target strain ${fmt(amplitude, 5)}. Life is the N whose elastic term and plastic term add up to that. 2N is twice N, because the powers were fitted on reversals.`}
        </p>
        {lives.map((row) => (
          <p key={row.mat.id}>
            {`${row.mat.name}, N = ${strainLabel(row.n)}, 2N = ${reversalLabel(row.n)}. Elastic (${fmt(row.mat.sf, 0)} / 200000) × (2N)^(−0.09) = ${fmt(row.elastic, 5)}. Plastic ${fmt(row.mat.ef, 2)} × (2N)^(−0.6) = ${fmt(row.plastic, 5)}. Sum ${fmt(row.elastic + row.plastic, 5)}.`}
          </p>
        ))}
      </div>
    </BenchShell>
  );
}

/* ------------------------------------------------------------------ */
/* Materials 101 Week 11 — bond-energy explorer and property predictor */
/* ------------------------------------------------------------------ */

const bondKinds: BondKind[] = ["metallic", "ionic", "covalent-network", "covalent-molecular", "secondary"];

const conductionLabel: Record<Conduction, string> = {
  conductor: "Conducts",
  insulator: "Insulates",
  "insulator-until-molten": "Insulates solid · conducts molten",
};

const mechanicalLabel: Record<Mechanical, string> = {
  ductile: "Ductile",
  brittle: "Brittle",
  soft: "Soft / deforms easily",
};

const thermalLabel: Record<Thermal, string> = {
  "high-melting": "High melting point",
  "decomposes-or-softens": "Softens or decomposes early",
  "low-melting": "Low melting point",
};

const regimeLabel = { low: "Low — waxes, polymers, molecular solids", moderate: "Moderate — most metals", high: "High — ceramics, refractory metals, networks" } as const;

export function BondEnergyBench() {
  const [kind, setKind] = useState<BondKind>("metallic");
  const profile = BOND_PROFILES[kind];
  const [lo, hi] = profile.energyRangeKJ;
  return (
    <BenchShell
      prompt="Select each bond type. || Read its energy range against its melting behavior and property pack. || Find the widest and narrowest energy ranges, and say what that width means for prediction precision."
      note="Energy numbers are orders of magnitude. The correlation between bond energy and melting point has wide scatter — network topology, entropy, and decomposition all move the real number. If you want a melting point, measure it."
      controls={
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          {bondKinds.map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={k === kind}
              onClick={() => setKind(k)}
              className={cn(
                "min-h-11 rounded-lg px-3 py-2 text-sm transition-transform duration-150 active:scale-[0.96]",
                k === kind ? "bg-well-fg text-well" : "ring-1 ring-white/25",
              )}
            >
              {BOND_PROFILES[k].label}
            </button>
          ))}
        </div>
      }
    >
      <Readouts
        items={[
          { label: "Bond energy", value: `${lo}–${hi} kJ/mol` },
          { label: "Rough melting regime", value: regimeLabel[meltingRegime(hi)] },
          { label: "Examples", value: profile.examples },
        ]}
      />
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div>
          <div className="text-well-dim">Conduction</div>
          <div className="mt-1 font-medium">{conductionLabel[profile.conduction]}</div>
        </div>
        <div>
          <div className="text-well-dim">Mechanical</div>
          <div className="mt-1 font-medium">{mechanicalLabel[profile.mechanical]}</div>
        </div>
        <div>
          <div className="text-well-dim">Thermal</div>
          <div className="mt-1 font-medium">{thermalLabel[profile.thermal]}</div>
        </div>
      </div>
      <p className="mt-4 max-w-prose text-sm leading-relaxed text-well-dim">{profile.why}</p>
    </BenchShell>
  );
}

const BEST_KEY = "ff:bondpredict-w11";

function loadBest(): number | null {
  try {
    const raw = localStorage.getItem(BEST_KEY);
    if (raw == null) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export function BondPredictBench() {
  const [i, setI] = useState(0);
  const [guess, setGuess] = useState<PropertyPack>({ conduction: "conductor", mechanical: "ductile", thermal: "high-melting" });
  const [revealed, setRevealed] = useState(false);
  const [total, setTotal] = useState(0);
  const [best, setBest] = useState<number | null>(() => loadBest());
  const done = i >= SUBSTANCES.length;
  const item = SUBSTANCES[i];
  const actual = item ? predictProperties(item.kind) : null;
  const roundScore = actual && revealed ? scorePrediction(guess, actual) : 0;

  const next = () => {
    const t = total + (actual ? scorePrediction(guess, actual) : 0);
    setTotal(t);
    if (i + 1 >= SUBSTANCES.length) {
      if (best == null || t > best) {
        setBest(t);
        try {
          localStorage.setItem(BEST_KEY, String(t));
        } catch {
          /* storage unavailable — the score still shows */
        }
      }
    }
    setI(i + 1);
    setRevealed(false);
    setGuess({ conduction: "conductor", mechanical: "ductile", thermal: "high-melting" });
  };

  return (
    <BenchShell
      prompt="Read the structural hint, then predict all three properties before revealing. || The reveal names the bond behind the answer — score yourself 0–3 per round. || When you finish, write down the cause of each miss."
      note="Six substances, three properties each. Graphite is in there on purpose: it punishes anyone who assigns one bond per material. Your best score is saved on this device."
      controls={
        done ? (
          <div className="sm:col-span-2">
            <WellButton
              onClick={() => {
                setI(0);
                setTotal(0);
                setRevealed(false);
                setGuess({ conduction: "conductor", mechanical: "ductile", thermal: "high-melting" });
              }}
            >
              Run it again
            </WellButton>
          </div>
        ) : (
          <>
            <Segmented<Conduction>
              label="Electrical"
              value={guess.conduction}
              onChange={(v) => setGuess({ ...guess, conduction: v })}
              options={[
                { value: "conductor", label: "Conductor" },
                { value: "insulator", label: "Insulator" },
                { value: "insulator-until-molten", label: "Insulates solid, conducts molten" },
              ]}
            />
            <Segmented<Mechanical>
              label="Mechanical"
              value={guess.mechanical}
              onChange={(v) => setGuess({ ...guess, mechanical: v })}
              options={[
                { value: "ductile", label: "Ductile — bends" },
                { value: "brittle", label: "Brittle — snaps" },
                { value: "soft", label: "Soft — deforms easily" },
              ]}
            />
            <Segmented<Thermal>
              label="Thermal"
              value={guess.thermal}
              onChange={(v) => setGuess({ ...guess, thermal: v })}
              options={[
                { value: "high-melting", label: "High melting point" },
                { value: "low-melting", label: "Low melting point" },
                { value: "decomposes-or-softens", label: "Softens or decomposes early" },
              ]}
            />
            <div className="sm:col-span-2">
              {revealed ? (
                <WellButton onClick={next}>{i + 1 >= SUBSTANCES.length ? "Finish" : "Next substance"}</WellButton>
              ) : (
                <WellButton onClick={() => setRevealed(true)}>Reveal the bond</WellButton>
              )}
            </div>
          </>
        )
      }
    >
      {done ? (
        <div>
          <Readouts
            items={[
              { label: "Score", value: `${total} / ${SUBSTANCES.length * 3}` },
              { label: "Best on this device", value: best != null ? `${best} / ${SUBSTANCES.length * 3}` : "—" },
            ]}
          />
          <p className="max-w-prose text-sm leading-relaxed text-well-dim">
            Now the actual work: for each round you missed, name the cause. “Missed the second bond” and “called it a network when it was molecular” are diagnoses. “Guessed wrong” is not.
          </p>
        </div>
      ) : (
        <div>
          <Readouts
            items={[
              { label: "Substance", value: `${i + 1} of ${SUBSTANCES.length}` },
              { label: "Running score", value: `${total}` },
            ]}
          />
          <h3 className="font-serif text-2xl">{item.name}</h3>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-well-dim">{item.hint}</p>
          {revealed && actual ? (
            <div className="mt-4 rounded-lg ring-1 ring-white/25 p-4">
              <p className="text-sm">
                <span className="text-well-dim">Bond: </span>
                <span className="font-medium">{BOND_PROFILES[item.kind].label}</span>
                <span className="text-well-dim"> · this round: </span>
                <span className="font-medium">{roundScore} / 3</span>
              </p>
              <dl className="mt-3 grid grid-cols-3 gap-3 text-sm">
                <div>
                  <div className="text-well-dim">Conduction</div>
                  <div className="mt-1">{conductionLabel[actual.conduction]}</div>
                </div>
                <div>
                  <div className="text-well-dim">Mechanical</div>
                  <div className="mt-1">{mechanicalLabel[actual.mechanical]}</div>
                </div>
                <div>
                  <div className="text-well-dim">Thermal</div>
                  <div className="mt-1">{thermalLabel[actual.thermal]}</div>
                </div>
              </dl>
              <p className="mt-3 max-w-prose text-sm leading-relaxed text-well-dim">{item.why}</p>
            </div>
          ) : null}
        </div>
      )}
    </BenchShell>
  );
}

/* ---------------- Materials 101, Week 12 benches ---------------- */

const structureOrder: CrystalStructure[] = ["sc", "bcc", "fcc", "hcp"];

const elementPresets = [
  { name: "Aluminum", gPerMol: 26.98, radiusPm: 143, known: 2.7 },
  { name: "Iron", gPerMol: 55.85, radiusPm: 126, known: 7.87 },
  { name: "Copper", gPerMol: 63.55, radiusPm: 128, known: 8.96 },
  { name: "Magnesium", gPerMol: 24.31, radiusPm: 160, known: 1.74 },
] as const;

export function UnitCellBench() {
  const [structure, setStructure] = useState<CrystalStructure>("fcc");
  const [element, setElement] = useState<(typeof elementPresets)[number]>(elementPresets[0]);
  const [radiusPm, setRadiusPm] = useState<number>(elementPresets[0].radiusPm);
  const info = STRUCTURES[structure];
  const a = latticeParameterPm(structure, radiusPm);
  const volume = structure === "hcp" ? hcpCellVolumeCm3(a) : cubicCellVolumeCm3(a);
  const rho = theoreticalDensity(element.gPerMol, info.atomsPerCell, volume);
  const err = Math.abs(rho - element.known) / element.known;
  return (
    <BenchShell
      prompt="Pick a structure and an element, then compute the theoretical density from the structure alone. || It should land within a few percent of the datasheet value — structure predicts the number. || Then answer: which structure would you specify for a part that must be forged?"
      note="Hard-sphere model: atoms as touching balls. Radii shift slightly with coordination in reality, so “within a few percent” is the honest bar."
      controls={
        <>
          <Segmented
            label="Crystal structure"
            value={structure}
            onChange={setStructure}
            options={structureOrder.map((s) => ({ value: s, label: STRUCTURES[s].label }))}
          />
          <Segmented
            label="Element"
            value={element.name}
            onChange={(name) => {
              const next = elementPresets.find((e) => e.name === name) ?? elementPresets[0];
              setElement(next);
              setRadiusPm(next.radiusPm);
            }}
            options={elementPresets.map((e) => ({ value: e.name, label: e.name }))}
          />
          <Slider
            label="Atomic radius"
            value={radiusPm}
            min={100}
            max={200}
            step={1}
            display={`${radiusPm} pm`}
            onChange={setRadiusPm}
          />
        </>
      }
    >
      <Readouts
        items={[
          { label: "Atoms per cell", value: String(info.atomsPerCell) },
          { label: "Packing", value: `${fmt(info.packing * 100, 0)}%` },
          { label: "Slip systems", value: String(info.slipSystems) },
          { label: "Lattice parameter a", value: `${fmt(a, 0)} pm` },
          { label: "Computed density", value: `${fmt(rho, 2)} g/cm³` },
          { label: "Datasheet", value: `${fmt(element.known, 2)} g/cm³` },
        ]}
      />
      <p className="text-sm leading-relaxed text-well-dim">
        {err < 0.05
          ? `Off by ${fmt(err * 100, 1)}% — the structure called it. ${info.examples.split(" — ")[0]} ${
              info.slipSystems >= 12 ? "forges readily: twelve slip systems." : info.slipSystems <= 3 ? "needs care in forming: only three easy slip systems." : "is a compromise: decent packing, middling ductility."
            }`
          : `Off by ${fmt(err * 100, 1)}% — that is the wrong structure for this element. The radius is right; the tiling is not. Try another structure.`}
      </p>
    </BenchShell>
  );
}

type MicroCase = {
  title: string;
  scene: string;
  featureQ: string;
  featureOptions: [string, string, string, string];
  featureAnswer: 0 | 1 | 2 | 3;
  featureWhy: string;
  consequenceQ: string;
  consequenceOptions: [string, string, string, string];
  consequenceAnswer: 0 | 1 | 2 | 3;
  consequenceWhy: string;
};

const microCases: MicroCase[] = [
  {
    title: "Etched 1045 steel, optical",
    scene:
      "Polygonal light regions outlined in dark lines, with scattered dark colonies that look like fingerprints inside some grains.",
    featureQ: "The key features are…",
    featureOptions: [
      "Grain boundaries plus a second phase (pearlite colonies)",
      "Porosity from bad casting",
      "Scratches from polishing",
      "A single crystal — no features at all",
    ],
    featureAnswer: 0,
    featureWhy:
      "The dark outlines are etched grain boundaries; the fingerprint colonies are pearlite (alternating ferrite/cementite lamellae). Two features, two phases.",
    consequenceQ: "Property consequence?",
    consequenceOptions: [
      "Higher hardness, lower ductility than pure ferrite",
      "It will behave like pure iron",
      "It cannot be heat treated",
      "It is necessarily brittle at room temperature",
    ],
    consequenceAnswer: 0,
    consequenceWhy:
      "Pearlite's hard cementite lamellae raise strength and hardness while costing ductility. Structure → properties: the colony fraction sets the trade.",
  },
  {
    title: "Annealed copper, optical",
    scene: "Enormous polygonal grains — only a handful fill the whole field of view. Twin lines cross several grains.",
    featureQ: "The key feature is…",
    featureOptions: [
      "A cracked sample",
      "Very coarse grains from a long hot anneal",
      "Dendritic solidification",
      "An amorphous structure",
    ],
    featureAnswer: 1,
    featureWhy:
      "Few, huge grains: the anneal let boundaries migrate until almost none remained. Twins are common in annealed FCC copper.",
    consequenceQ: "Property consequence?",
    consequenceOptions: [
      "Low yield strength (Hall–Petch), high ductility",
      "Maximum strength — big grains are strong grains",
      "It will shatter like glass",
      "No effect — grain size is cosmetic",
    ],
    consequenceAnswer: 0,
    consequenceWhy:
      "Boundary area per volume is tiny, so dislocations glide easily: soft, ductile, easy to form — and the yield strength shows it.",
  },
  {
    title: "As-cast aluminum, optical",
    scene: "Tree-like branching arms radiating from scattered centers, with darker material pooled between the branches.",
    featureQ: "The key feature is…",
    featureOptions: [
      "Fatigue striations",
      "Dendrites — a cored solidification structure",
      "Grain growth from service",
      "Delamination of a coating",
    ],
    featureAnswer: 1,
    featureWhy:
      "Dendrites: the first solid to freeze grows as branching arms, and solute is rejected into the liquid between them (coring).",
    consequenceQ: "Property consequence?",
    consequenceOptions: [
      "Composition varies across the part — expect segregation and anisotropy until homogenized",
      "It is at full strength as-cast",
      "The branches are cracks",
      "Nothing — dendrites dissolve at room temperature",
    ],
    consequenceAnswer: 0,
    consequenceWhy:
      "Coring means the chemistry is not uniform, so neither are the properties. Homogenization heat treatment exists to erase exactly this.",
  },
  {
    title: "Fracture surface, SEM",
    scene: "The whole surface is covered in tiny cup-shaped dimples, like the skin of a golf ball at high magnification.",
    featureQ: "The key feature is…",
    featureOptions: [
      "Cleavage facets",
      "Dimpled rupture — microvoid coalescence",
      "Intergranular corrosion",
      "Machining marks",
    ],
    featureAnswer: 1,
    featureWhy:
      "Dimples are the cups left where microvoids nucleated, grew, and joined. The material stretched locally before it parted.",
    consequenceQ: "Failure mode?",
    consequenceOptions: [
      "Ductile overload — it warned by stretching",
      "Brittle fracture with no warning",
      "Fatigue from cyclic load",
      "Hydrogen embrittlement",
    ],
    consequenceAnswer: 0,
    consequenceWhy:
      "Dimpled rupture is the signature of ductile overload: energy absorbed, visible deformation, warning given. Design for this when failure must be graceful.",
  },
  {
    title: "Fracture surface, SEM",
    scene: "Flat, shiny facets with sharp steps between them — like broken rock candy. No dimples anywhere.",
    featureQ: "The key feature is…",
    featureOptions: [
      "Dimpled ductile rupture",
      "Cleavage facets — transgranular brittle fracture",
      "A polished surface",
      "A coating spalling off",
    ],
    featureAnswer: 1,
    featureWhy:
      "Flat facets are cleavage planes: the crack ran along crystal planes with almost no plastic deformation. River patterns on the facets point back to the origin.",
    consequenceQ: "What do you check first?",
    consequenceOptions: [
      "Temperature, notch sharpness, and strain rate — the brittle triggers",
      "The alloy's carbon content only",
      "Whether it was painted",
      "The grain size — finer is always worse",
    ],
    consequenceAnswer: 0,
    consequenceWhy:
      "Cleavage means the ductile-to-brittle triggers lined up: low temperature, sharp notch, fast load. Same steel can be ductile on a warm day and treacherous in winter.",
  },
];

export function MicroInterpBench() {
  const [i, setI] = useState(0);
  const [feature, setFeature] = useState<number | null>(null);
  const [consequence, setConsequence] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const done = i >= microCases.length;
  const item = microCases[i];
  const bothAnswered = feature !== null && consequence !== null;
  const correct =
    bothAnswered && feature === item.featureAnswer && consequence === item.consequenceAnswer;

  const next = () => {
    if (correct) setScore((s) => s + 1);
    setI((v) => v + 1);
    setFeature(null);
    setConsequence(null);
  };

  return (
    <BenchShell
      prompt="Five micrographs, five scenes from the structure → properties chain. || For each one, name the key feature, then predict the property consequence. || Both must be right to score — interpretation is feature plus consequence, never one alone."
      note="The micrographs are described, not photographed — the cues (grain contrast, phases, dimples, facets) are exactly what etched samples and SEM images show."
      controls={
        <div className="sm:col-span-2 flex items-center gap-3">
          <span className="text-sm text-well-dim">
            {done ? `Set complete: ${score} / ${microCases.length}` : `Case ${i + 1} of ${microCases.length} · Score ${score}`}
          </span>
          <div className="ml-auto flex gap-2">
            {done ? (
              <WellButton
                onClick={() => {
                  setI(0);
                  setScore(0);
                }}
              >
                Run the set again
              </WellButton>
            ) : (
              <WellButton onClick={next}>Next case</WellButton>
            )}
          </div>
        </div>
      }
    >
      {done ? (
        <p className="text-sm leading-relaxed text-well-dim">
          {score === microCases.length
            ? "Five for five. You read a microstructure the way the evidence demands: feature first, consequence second, and the processing history behind both."
            : `You scored ${score} of ${microCases.length}. Re-run the set and, for each miss, say out loud which link of structure → processing → properties → performance you skipped.`}
        </p>
      ) : (
        <div className="space-y-5">
          <div>
            <p className="font-serif text-xl">{item.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-well-dim">{item.scene}</p>
          </div>
          <Segmented
            label={item.featureQ}
            value={feature === null ? "" : String(feature)}
            onChange={(v) => setFeature(Number(v))}
            options={item.featureOptions.map((label, v) => ({ value: String(v), label }))}
          />
          <Segmented
            label={item.consequenceQ}
            value={consequence === null ? "" : String(consequence)}
            onChange={(v) => setConsequence(Number(v))}
            options={item.consequenceOptions.map((label, v) => ({ value: String(v), label }))}
          />
          {bothAnswered && (
            <div className="space-y-2 text-sm leading-relaxed">
              <p className={feature === item.featureAnswer ? "text-well-fg" : "text-well-dim"}>
                {feature === item.featureAnswer ? "✓ Feature: " : "✗ Feature: "}{item.featureWhy}
              </p>
              <p className={consequence === item.consequenceAnswer ? "text-well-fg" : "text-well-dim"}>
                {consequence === item.consequenceAnswer ? "✓ Consequence: " : "✗ Consequence: "}{item.consequenceWhy}
              </p>
            </div>
          )}
        </div>
      )}
    </BenchShell>
  );
}

const quenchAlloys = [
  { name: "Window glass", criticalKs: 1, note: "A messy silicate network crystallizes sluggishly — almost any cooling makes glass." },
  { name: "Zr-based metallic glass", criticalKs: 10, note: "A confused multi-element alloy; water quenching a thin section suffices." },
  { name: "Aluminum-rich binary alloy", criticalKs: 1e6, note: "Crystallizes eagerly — needs melt spinning. Pure aluminum would need ~10¹² K/s, beyond any quench." },
] as const;

export function GlassFormBench() {
  const [alloy, setAlloy] = useState<(typeof quenchAlloys)[number]>(quenchAlloys[1]);
  const [logRate, setLogRate] = useState(2); // log10(K/s)
  const rate = 10 ** logRate;
  const isGlass = rate >= alloy.criticalKs;
  return (
    <BenchShell
      prompt="Pick an alloy and slide the cooling rate. || Find the slowest rate that still freezes in glass — that is the critical cooling rate. || Then state what the glass buys and what it costs, in one sentence each."
      note="Critical rates are order-of-magnitude honest, not datasheet values. The point is the race: cooling rate versus the alloy's eagerness to crystallize."
      controls={
        <>
          <Segmented
            label="Alloy"
            value={alloy.name}
            onChange={(name) => setAlloy(quenchAlloys.find((a) => a.name === name) ?? quenchAlloys[1])}
            options={quenchAlloys.map((a) => ({ value: a.name, label: a.name }))}
          />
          <Slider
            label="Cooling rate"
            value={logRate}
            min={-1}
            max={7}
            step={0.1}
            display={`${rate >= 1000 ? `${fmt(rate / 1000, 1)}×10³` : fmt(rate, 1)} K/s`}
            onChange={setLogRate}
          />
        </>
      }
    >
      <Readouts
        items={[
          { label: "Outcome", value: isGlass ? "Glass" : "Crystal" },
          { label: "Critical rate", value: `${alloy.criticalKs >= 1000 ? `${fmt(alloy.criticalKs / 1000, 0)}×10³` : alloy.criticalKs} K/s` },
          { label: "Strength", value: isGlass ? "Near theoretical" : "Ordinary" },
          { label: "Elastic limit", value: isGlass ? "≈ 2%" : "≈ 0.2%" },
          { label: "Failure mode", value: isGlass ? "One shear band, no warning" : "Gradual, dimpled" },
          { label: "Grain boundaries", value: isGlass ? "None — corrosion resistant" : "Present" },
        ]}
      />
      <p className="text-sm leading-relaxed text-well-dim">
        {isGlass
          ? `Glass. ${alloy.note} You bought enormous strength and a 2% spring — and paid with silent, total failure past the limit.`
          : `Crystal — the atoms had time to organize. Ordinary strength, ordinary warning. To freeze this alloy as glass you must beat ${alloy.criticalKs} K/s.`}
      </p>
    </BenchShell>
  );
}

const numInputClass =
  "w-full rounded-lg bg-white/10 px-3 py-2 text-well-fg ring-1 ring-white/20 placeholder:text-well-dim";

type DefectKind = "vacancy" | "dislocation" | "boundary";

const DEFECTS: Record<DefectKind, { label: string; signature: string }> = {
  vacancy: {
    label: "Vacancy (0D)",
    signature:
      "A missing atom. Equilibrium fraction n/N = exp(−Qv/kT) — exponential in temperature, which is why a quench freezes in a supersaturated population.",
  },
  dislocation: {
    label: "Dislocation (1D)",
    signature:
      "An extra half-plane of atoms. Glides at stresses ~100× below whole-plane shear — the mechanism behind Frenkel's missing strength.",
  },
  boundary: {
    label: "Grain boundary (2D)",
    signature:
      "Where two crystal orientations meet. Blocks dislocation glide — the wall behind Hall–Petch strengthening and the thing annealing deletes.",
  },
};

function LatticeDots({ missing, extraHalf }: { missing?: [number, number]; extraHalf?: number }) {
  const pts: React.ReactNode[] = [];
  const s = 26;
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 8; c++) {
      if (missing && missing[0] === c && missing[1] === r) continue;
      if (extraHalf !== undefined && c === extraHalf && r > 2) continue;
      pts.push(
        <circle key={`${c}-${r}`} cx={30 + c * s} cy={24 + r * s} r={7} fill="currentColor" opacity={0.75} />,
      );
    }
  }
  if (extraHalf !== undefined) {
    pts.push(
      <text key="core" x={30 + extraHalf * s} y={24 + 3 * s + 22} textAnchor="middle" fontSize={16} fill="currentColor">
        ⊥
      </text>,
    );
  }
  return <g>{pts}</g>;
}

export function DefectBench() {
  const [kind, setKind] = useState<DefectKind>("vacancy");
  const [tempK, setTempK] = useState(1000);
  const frac = vacancyFraction(VACANCY_QV_EV, tempK);
  const room = vacancyFraction(VACANCY_QV_EV, 300);

  return (
    <BenchShell
      prompt="Pick a defect family and read its signature. || Drag the temperature and watch the equilibrium vacancy fraction swing ten orders of magnitude. || Then say which defect each step targets: quench, cold work, anneal."
      note="Vacancy numbers use copper's 0.9 eV as a classroom value; real Qv runs roughly 0.5–1.5 eV by metal. The lattice drawings are cartoons — a few dozen atoms standing in for 10²³."
      controls={
        <>
          <Segmented
            label="Defect family"
            value={kind}
            onChange={setKind}
            options={(Object.keys(DEFECTS) as DefectKind[]).map((k) => ({
              value: k,
              label: DEFECTS[k].label,
            }))}
          />
          <Slider
            label="Temperature"
            min={300}
            max={1400}
            step={10}
            value={tempK}
            display={`${tempK} K`}
            onChange={setTempK}
          />
        </>
      }
    >
      <Readouts
        items={[
          { label: "Equilibrium vacancy fraction", value: frac.toExponential(1) },
          { label: "Vacancies per million sites", value: (frac * 1e6).toExponential(1) },
          { label: "× the room-temperature value", value: (frac / room).toExponential(1) },
        ]}
      />
      <svg viewBox="0 0 260 170" className="h-auto w-full" aria-hidden>
        {kind === "vacancy" && (
          <>
            <LatticeDots missing={[4, 2]} />
            <circle cx={30 + 4 * 26} cy={24 + 2 * 26} r={10} fill="none" stroke="currentColor" strokeDasharray="4 3" />
          </>
        )}
        {kind === "dislocation" && <LatticeDots extraHalf={4} />}
        {kind === "boundary" && (
          <>
            <g opacity={0.75}>
              {Array.from({ length: 5 }, (_, r) =>
                Array.from({ length: 4 }, (_, c) => (
                  <circle key={`l${c}${r}`} cx={30 + c * 24} cy={24 + r * 26 + c * 3} r={7} fill="currentColor" />
                )),
              )}
              {Array.from({ length: 5 }, (_, r) =>
                Array.from({ length: 4 }, (_, c) => (
                  <circle key={`r${c}${r}`} cx={150 + c * 24} cy={24 + r * 26 - c * 3} r={7} fill="currentColor" opacity={0.55} />
                )),
              )}
            </g>
            <line x1={138} y1={14} x2={138} y2={156} stroke="currentColor" strokeDasharray="6 4" strokeWidth={2} />
          </>
        )}
      </svg>
      <p className="mt-2 text-sm leading-relaxed text-well-dim">{DEFECTS[kind].signature}</p>
    </BenchShell>
  );
}

export function DiffProfileBench() {
  const [diffusantId, setDiffusantId] = useState("c-gamma");
  const [tempC, setTempC] = useState(950);
  const [logHours, setLogHours] = useState(Math.log10(4));
  const [Cs, setCs] = useState(1.1);
  const [C0, setC0] = useState(0.2);
  const [Cx, setCx] = useState(0.4);
  const [guess, setGuess] = useState("");

  const diffusant = DIFFUSANTS.find((d) => d.id === diffusantId) ?? DIFFUSANTS[0];
  const T = tempC + 273.15;
  const D = arrheniusD(diffusant.D0, diffusant.Q, T);
  const t = 10 ** logHours * 3600;
  const L = diffusionLength(D, t);
  const target = Math.min(Math.max(Cx, C0 + 0.05), Cs - 0.05);
  const depth = caseDepth(Cs, C0, target, D, t);
  const depthMm = depth * 1000;
  const equivH = equivalentTime(t, D, arrheniusD(diffusant.D0, diffusant.Q, T - 50)) / 3600;

  const xMax = Math.max(3 * L, depth * 1.4, 1e-6);
  const yMax = Math.max(Cs, 1.2);
  const W = 320;
  const H = 200;
  const padL = 40;
  const padB = 26;
  const xOf = (x: number) => padL + (x / xMax) * (W - padL - 8);
  const yOf = (c: number) => 10 + (1 - c / yMax) * (H - 10 - padB);
  const curve = Array.from({ length: 81 }, (_, i) => {
    const x = (i / 80) * xMax;
    return `${xOf(x).toFixed(1)},${yOf(concentrationProfile(Cs, C0, D, t, x)).toFixed(1)}`;
  }).join(" ");

  const guessNum = Number(guess);
  const guessOk =
    guess.trim() !== "" && Number.isFinite(guessNum) && Math.abs(guessNum - depthMm) / depthMm <= 0.1;

  return (
    <BenchShell
      prompt="Set temperature, time, and concentrations, and read the case depth off the profile. || Hold Dt constant while dropping the temperature 50 K — watch what happens to the time. || Enter your own case-depth prediction and let the bench grade it."
      note="D0/Q values are standard textbook numbers for carbon in iron and titanium. The model is a semi-infinite solid in one dimension with constant surface concentration — honest about what it is, and what a real furnace adds on top."
      controls={
        <>
          <Segmented
            label="Diffusant"
            value={diffusantId}
            onChange={setDiffusantId}
            options={DIFFUSANTS.map((d) => ({ value: d.id, label: d.label }))}
          />
          <Slider label="Temperature" min={700} max={1100} step={5} value={tempC} display={`${tempC} °C`} onChange={setTempC} />
          <Slider
            label="Time"
            min={Math.log10(0.5)}
            max={Math.log10(24)}
            step={0.01}
            value={logHours}
            display={`${fmt(10 ** logHours, 1)} h`}
            onChange={setLogHours}
          />
          <Slider label="Surface C (Cs)" min={0.6} max={1.4} step={0.05} value={Cs} display={`${fmt(Cs, 2)} wt%`} onChange={setCs} />
          <Slider label="Initial C (C₀)" min={0.1} max={0.4} step={0.05} value={C0} display={`${fmt(C0, 2)} wt%`} onChange={setC0} />
          <Slider
            label="Target C (Cx)"
            min={0.3}
            max={0.9}
            step={0.05}
            value={target}
            display={`${fmt(target, 2)} wt%`}
            onChange={setCx}
          />
        </>
      }
    >
      <Readouts
        items={[
          { label: "Diffusivity D", value: `${D.toExponential(2)} m²/s` },
          { label: "2√(Dt)", value: `${fmt(L * 1000, 2)} mm` },
          { label: `Case depth to ${fmt(target, 2)} wt%`, value: `${fmt(depthMm, 2)} mm` },
          { label: "Same profile at −50 °C needs", value: `${fmt(equivH, 1)} h` },
        ]}
      />
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" aria-hidden>
        <line x1={padL} y1={yOf(0)} x2={W - 8} y2={yOf(0)} stroke="currentColor" strokeOpacity={0.4} />
        <line x1={xOf(depth)} y1={10} x2={xOf(depth)} y2={yOf(0)} stroke="currentColor" strokeDasharray="5 4" strokeWidth={1.5} />
        <line x1={padL} y1={yOf(target)} x2={W - 8} y2={yOf(target)} stroke="currentColor" strokeOpacity={0.4} strokeDasharray="3 4" />
        <polyline points={curve} fill="none" stroke="currentColor" strokeWidth={2.5} />
        <text x={W - 8} y={yOf(0) + 18} textAnchor="end" fontSize={11} fill="currentColor" opacity={0.7}>
          depth (mm)
        </text>
        <text x={padL - 6} y={yOf(target) + 4} textAnchor="end" fontSize={11} fill="currentColor" opacity={0.7}>
          Cx
        </text>
      </svg>
      <p className="mt-2 text-sm leading-relaxed text-well-dim">{diffusant.note}</p>
      <div className="mt-4 max-w-sm">
        <div className="mb-2 text-sm text-well-dim">Your case-depth prediction (mm)</div>
        <input
          type="number"
          step={0.01}
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          placeholder="e.g. 0.70"
          className={numInputClass}
          aria-label="Predicted case depth in millimetres"
        />
        {guess.trim() !== "" && (
          <p className="mt-1 text-sm text-well-dim">
            {guessOk
              ? `✓ Within 10% of the profile's ${fmt(depthMm, 2)} mm. Evidence recorded.`
              : `Not yet — the profile says ${fmt(depthMm, 2)} mm. Recompute x = 2√(Dt)·erf⁻¹((Cs − Cx)/(Cs − C0)).`}
          </p>
        )}
      </div>
    </BenchShell>
  );
}

/* ------------------------------------------------------------------ */
/* Week 14 — Mechanical response benches                               */
/* ------------------------------------------------------------------ */


/** Materials rotated through the curve-reading practical (all ductile). */
const PRACTICAL_MATERIALS: MaterialParams[] = [
  MATERIALS[0],
  MATERIALS[2],
  MATERIALS[3],
  MATERIALS[1],
  MATERIALS[5],
];

type PracticalTruth = {
  params: MaterialParams;
  extracted: ExtractedParams;
};

function practicalTruths(): PracticalTruth[] {
  return PRACTICAL_MATERIALS.map((params, i) => ({
    params,
    extracted: extractParams(generateCurve(params, { noise: 0.008, seed: 101 + i })),
  }));
}

function CurvePlot({ params, seed }: { params: MaterialParams; seed: number }) {
  const d = useMemo(() => {
    const curve = generateCurve(params, { noise: 0.008, seed });
    const eMax = params.fractureStrain;
    let sMax = 0;
    for (const p of curve) if (p.stress > sMax) sMax = p.stress;
    sMax *= 1.08;
    const x0 = 34;
    const y0 = 8;
    const w = 272;
    const h = 128;
    const path = curve
      .map((p, i) => {
        const x = x0 + (p.strain / eMax) * w;
        const y = y0 + h - (p.stress / sMax) * h;
        return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
    return { path, x0, y0, w, h, eMax, sMax };
  }, [params, seed]);
  return (
    <div>
      <svg viewBox="0 0 320 160" className="h-44 w-full" role="img" aria-label={`Stress-strain curve, strain to ${(d.eMax * 100).toFixed(1)} percent`}>
        <line x1={d.x0} y1={d.y0 + d.h} x2={d.x0 + d.w} y2={d.y0 + d.h} stroke="currentColor" strokeOpacity="0.4" />
        <line x1={d.x0} y1={d.y0} x2={d.x0} y2={d.y0 + d.h} stroke="currentColor" strokeOpacity="0.4" />
        <path d={d.path} fill="none" stroke="currentColor" strokeWidth="2" />
        <text x={d.x0 + d.w} y={d.y0 + d.h + 14} textAnchor="end" fontSize="10" fill="currentColor" opacity="0.7">
          ε to {(d.eMax * 100).toFixed(1)}%
        </text>
        <text x={d.x0 - 4} y={d.y0 + 4} textAnchor="end" fontSize="10" fill="currentColor" opacity="0.7">
          σ to {d.sMax.toFixed(0)} MPa
        </text>
      </svg>
    </div>
  );
}

const PRACTICAL_FIELDS = [
  { key: "E", label: "Young's modulus E, GPa", rel: 0.08, get: (t: PracticalTruth) => t.extracted.E / 1000 },
  { key: "sy", label: "0.2%-offset yield σy, MPa", rel: 0.12, get: (t: PracticalTruth) => t.extracted.yieldStrength ?? NaN },
  { key: "uts", label: "Ultimate strength σuts, MPa", rel: 0.06, get: (t: PracticalTruth) => t.extracted.uts },
  { key: "el", label: "Elongation at fracture, %", rel: 0.1, get: (t: PracticalTruth) => t.extracted.elongation * 100 },
] as const;

export function CurveReadBench() {
  const truths = useMemo(practicalTruths, []);
  const [round, setRound] = useState(0);
  const [entries, setEntries] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const done = round >= truths.length;
  const truth = truths[Math.min(round, truths.length - 1)];

  const fieldOk = (key: string): boolean | null => {
    if (!checked) return null;
    const raw = entries[key];
    const v = Number(raw);
    const field = PRACTICAL_FIELDS.find((f) => f.key === key)!;
    const target = field.get(truth);
    if (raw === undefined || raw.trim() === "" || !Number.isFinite(v)) return false;
    return Math.abs(v - target) <= field.rel * target;
  };

  const roundScore = PRACTICAL_FIELDS.filter((f) => fieldOk(f.key) === true).length;

  const next = () => {
    if (checked) setScore((s) => s + roundScore);
    setRound((r) => r + 1);
    setEntries({});
    setChecked(false);
  };

  return (
    <BenchShell
      prompt="Five tensile records, each with measurement noise. Read E, the 0.2%-offset yield, UTS, and elongation off each curve. || Check against the extraction: the machine's fit is the referee, and its own error is a few percent. || Five materials, four quantities each — twenty readings."
      note="Simulated from real engineering values with ~1% load-cell noise. The offset construction on these curves lands within ~3% of the book yield; the tolerance bands are wider than the method's error, so a miss is a reading error."
      controls={
        <>
          <div className="sm:col-span-2">
            {done ? (
              <div>
                <Readouts items={[{ label: "Readings in tolerance", value: `${score} of 20` }]} />
                <p className="mt-2 max-w-prose text-sm leading-relaxed text-well-dim">
                  {score >= 16
                    ? "You read curves like a lab tech. Lesson 3 turns these readings into numbers you can design to."
                    : "Revisit the misses: E is the initial slope (watch the axis scale), yield is the offset crossing — not the first bend you see — and UTS is the peak, not the fracture point."}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setRound(0);
                    setEntries({});
                    setChecked(false);
                    setScore(0);
                  }}
                  className="mt-3 min-h-11 rounded-lg px-4 text-sm text-well-fg ring-1 ring-white/25"
                >
                  Run the practical again
                </button>
              </div>
            ) : (
              <p className="text-sm text-well-dim">
                Specimen {round + 1} of {truths.length} — an unidentified engineering material
              </p>
            )}
          </div>
          {!done &&
            PRACTICAL_FIELDS.map((field) => {
              const ok = fieldOk(field.key);
              const target = field.get(truth);
              return (
                <div key={field.key}>
                  <label className="mb-1 block text-sm text-well-dim" htmlFor={`curveread-${field.key}`}>
                    {field.label}
                  </label>
                  <input
                    id={`curveread-${field.key}`}
                    type="number"
                    step="any"
                    value={entries[field.key] ?? ""}
                    onChange={(e) => {
                      setChecked(false);
                      setEntries((prev) => ({ ...prev, [field.key]: e.target.value }));
                    }}
                    className={numInputClass}
                  />
                  {checked && (
                    <p className="mt-1 text-sm text-well-dim">
                      {ok ? "✓" : "✗"} extraction:{" "}
                      {field.key === "E"
                        ? target.toFixed(1)
                        : field.key === "el"
                          ? target.toFixed(1)
                          : target.toFixed(0)}
                      {ok === false && " — read the landmark again"}
                    </p>
                  )}
                </div>
              );
            })}
          {!done && (
            <div className="sm:col-span-2">
              {!checked ? (
                <button
                  type="button"
                  onClick={() => setChecked(true)}
                  disabled={PRACTICAL_FIELDS.some((f) => (entries[f.key] ?? "").trim() === "")}
                  className="min-h-11 rounded-lg px-4 text-sm text-well-fg ring-1 ring-white/25 disabled:opacity-40"
                >
                  Check against the extraction
                </button>
              ) : (
                <WellButton onClick={next}>
                  {round === truths.length - 1 ? "See the tally" : "Next specimen"}
                </WellButton>
              )}
            </div>
          )}
        </>
      }
    >
      {!done && (
        <>
          <CurvePlot params={truth.params} seed={101 + round} />
          <p className="mt-2 text-sm text-well-dim">
            {checked
              ? `This was ${truth.params.name}. ${roundScore} of 4 readings in tolerance.`
              : "Read the curve before you touch the numbers. The axes rescale per material — the shape alone tells you nothing."}
          </p>
        </>
      )}
    </BenchShell>
  );
}

type CompareJob = {
  job: string;
  answer: string;
  why: string;
};

const COMPARE_JOBS: CompareJob[] = [
  {
    job: "A crash rail that must absorb the most energy per volume before breaking.",
    answer: "1020 mild steel",
    why: "Toughness is the area under the curve: mild steel's ≈141 MJ/m³ beats everything in the table. The high-strength entries have taller peaks but far less area.",
  },
  {
    job: "The highest yield strength available, mass no object.",
    answer: "Ti-6Al-4V",
    why: "σy ≈ 880 MPa — above even the cold-worked steel. You pay in cost and machining difficulty, which is why it is not the answer to every question.",
  },
  {
    job: "A blank that must be deep-drawn — the largest elongation before fracture wins.",
    answer: "Annealed copper",
    why: "45% elongation. Forming is a ductility contest, and annealed copper's long hardening tail is exactly what a draw needs.",
  },
  {
    job: "The stiffest material in the table, for a deflection-limited part.",
    answer: "Alumina",
    why: "E ≈ 380 GPa, nearly double steel's. Stiffness is the slope — and note the price: 0.08% elongation. Deflection-limited and brittle is a combination that demands respect.",
  },
];

export function PropCompareBench() {
  const rows = useMemo(
    () =>
      MATERIALS.map((params, i) => ({
        params,
        extracted: extractParams(generateCurve(params, { noise: 0.008, seed: 201 + i })),
      })),
    [],
  );
  const [job, setJob] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const done = job >= COMPARE_JOBS.length;
  const item = COMPARE_JOBS[Math.min(job, COMPARE_JOBS.length - 1)];

  return (
    <BenchShell
      prompt="Eight materials, one table of extracted curve parameters. Four jobs. || For each job, pick the material the physics points to — and name the landmark that decided it. || Prestige is not a landmark."
      note="Values are extracted from the same curve model as the lesson-1 practical, so E, yield, UTS, elongation, and toughness are mutually consistent. Toughness is the integrated area in MJ/m³."
      controls={
        <div className="sm:col-span-2">
          {done ? (
            <div>
              <Readouts items={[{ label: "Correct", value: `${correct} of ${COMPARE_JOBS.length}` }]} />
              <p className="mt-2 max-w-prose text-sm leading-relaxed text-well-dim">
                {correct >= 3
                  ? "You are selecting by landmark, not by reputation. That is the whole skill."
                  : "For each miss, ask which single column of the table actually answers the job — area, slope, peak, or width."}
              </p>
              <button
                type="button"
                onClick={() => {
                  setJob(0);
                  setPicked(null);
                  setCorrect(0);
                }}
                className="mt-3 min-h-11 rounded-lg px-4 text-sm text-well-fg ring-1 ring-white/25"
              >
                Run the comparison again
              </button>
            </div>
          ) : (
            <>
              <p className="font-serif text-2xl leading-snug text-balance">{item.job}</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {rows.map(({ params }) => {
                  const show = picked !== null;
                  const isAnswer = params.name === item.answer;
                  const isPick = params.name === picked;
                  return (
                    <button
                      key={params.name}
                      type="button"
                      disabled={show}
                      onClick={() => setPicked(params.name)}
                      className={cn(
                        "min-h-11 rounded-lg px-3 py-2 text-left text-sm ring-1",
                        show && isAnswer
                          ? "bg-well-fg text-well ring-well-fg"
                          : show && isPick
                            ? "text-well-fg ring-red-400"
                            : "text-well-fg ring-white/25",
                      )}
                    >
                      {params.name}
                    </button>
                  );
                })}
              </div>
              {picked !== null && (
                <div className="mt-4">
                  <p className="text-sm leading-relaxed text-well-dim">
                    {picked === item.answer ? "✓ " : "✗ "} {item.why}
                  </p>
                  <div className="mt-3">
                    <WellButton
                      onClick={() => {
                        if (picked === item.answer) setCorrect((c) => c + 1);
                        setPicked(null);
                        setJob((j) => j + 1);
                      }}
                    >
                      {job === COMPARE_JOBS.length - 1 ? "See the tally" : "Next job"}
                    </WellButton>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="text-well-dim">
              <th className="py-1 pr-3 font-medium">Material</th>
              <th className="py-1 pr-3 font-medium">E, GPa</th>
              <th className="py-1 pr-3 font-medium">σy, MPa</th>
              <th className="py-1 pr-3 font-medium">σuts, MPa</th>
              <th className="py-1 pr-3 font-medium">Elong., %</th>
              <th className="py-1 font-medium">Tough., MJ/m³</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ params, extracted }) => (
              <tr key={params.name} className="border-t border-white/10">
                <td className="py-1 pr-3">{params.name}</td>
                <td className="py-1 pr-3">{(extracted.E / 1000).toFixed(1)}</td>
                <td className="py-1 pr-3">
                  {extracted.yieldStrength == null ? "— (brittle)" : extracted.yieldStrength.toFixed(0)}
                </td>
                <td className="py-1 pr-3">{extracted.uts.toFixed(0)}</td>
                <td className="py-1 pr-3">{(extracted.elongation * 100).toFixed(1)}</td>
                <td className="py-1">{extracted.toughness.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </BenchShell>
  );
}

/** Five specimens from one heat of 6061-T6, with realistic heat scatter. */
const HEAT_SCATTER = [-0.045, 0.028, -0.012, 0.052, -0.023];

function heatSpecimens() {
  const base = MATERIALS[2];
  return HEAT_SCATTER.map((s, i) => {
    const params: MaterialParams = {
      ...base,
      yieldStrength: base.yieldStrength * (1 + s),
      uts: base.uts * (1 + s * 0.5),
    };
    const extracted = extractParams(generateCurve(params, { noise: 0.008, seed: 301 + i }));
    return { params, yield: extracted.yieldStrength ?? NaN };
  });
}

export function AllowableBench() {
  const specimens = useMemo(heatSpecimens, []);
  const yields = specimens.map((s) => s.yield);
  const mean = yields.reduce((a, b) => a + b, 0) / yields.length;
  const variance = yields.reduce((a, b) => a + (b - mean) * (b - mean), 0) / (yields.length - 1);
  const std = Math.sqrt(variance);
  const minYield = Math.min(...yields);

  const [meanEntry, setMeanEntry] = useState("");
  const [stdEntry, setStdEntry] = useState("");
  const [charEntry, setCharEntry] = useState("");
  const [fos, setFos] = useState("1.5");
  const [allowEntry, setAllowEntry] = useState("");
  const [checked, setChecked] = useState(false);

  const num = (s: string) => {
    const v = Number(s);
    return s.trim() !== "" && Number.isFinite(v) ? v : NaN;
  };
  const meanOk = checked && Math.abs(num(meanEntry) - mean) <= 1.5;
  const stdOk = checked && Math.abs(num(stdEntry) - std) <= 1.5;
  const charV = num(charEntry);
  const charOk = checked && Number.isFinite(charV) && charV <= minYield && charV >= mean - 4 * std && charV > 0;
  const fosV = Number(fos);
  const allowV = num(allowEntry);
  const allowOk =
    checked &&
    charOk &&
    Number.isFinite(allowV) &&
    Math.abs(allowV - charV / fosV) / (charV / fosV) <= 0.03;

  return (
    <BenchShell
      prompt="Five specimens from one heat of 6061-T6, extracted yields on the table. The bracket you are sizing holds a load over a workspace — failure injures. || Compute the mean and the sample standard deviation, choose a characteristic strength the scatter justifies, pick a factor of safety for the consequence, and issue the allowable. || '1.5 because everyone uses 1.5' is not a defense."
      note="Heat scatter here is a few percent, typical of a controlled alloy. The characteristic value must sit at or below the weakest specimen — the low tail is what you design to, never the mean."
      controls={
        <>
          <div>
            <label className="mb-1 block text-sm text-well-dim" htmlFor="allow-mean">
              Mean yield, MPa
            </label>
            <input id="allow-mean" type="number" step="any" value={meanEntry} onChange={(e) => { setChecked(false); setMeanEntry(e.target.value); }} className={numInputClass} />
            {checked && <p className="mt-1 text-sm text-well-dim">{meanOk ? `✓ ${mean.toFixed(1)}` : `✗ ${mean.toFixed(1)} — sum of five over five`}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm text-well-dim" htmlFor="allow-std">
              Sample std dev, MPa
            </label>
            <input id="allow-std" type="number" step="any" value={stdEntry} onChange={(e) => { setChecked(false); setStdEntry(e.target.value); }} className={numInputClass} />
            {checked && <p className="mt-1 text-sm text-well-dim">{stdOk ? `✓ ${std.toFixed(1)}` : `✗ ${std.toFixed(1)} — divide by n−1, not n`}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm text-well-dim" htmlFor="allow-char">
              Characteristic strength, MPa
            </label>
            <input id="allow-char" type="number" step="any" value={charEntry} onChange={(e) => { setChecked(false); setCharEntry(e.target.value); }} className={numInputClass} />
            {checked && (
              <p className="mt-1 text-sm text-well-dim">
                {charOk ? "✓ at or below the weakest specimen" : `✗ must be ≤ ${minYield.toFixed(0)} (the weakest reading) and defensible against the scatter`}
              </p>
            )}
          </div>
          <div>
            <Segmented
              label="Factor of safety — failure drops the load on a workspace"
              value={fos}
              onChange={(v) => { setChecked(false); setFos(v); }}
              options={[
                { value: "1.25", label: "1.25" },
                { value: "1.5", label: "1.5" },
                { value: "2.0", label: "2.0" },
                { value: "3.0", label: "3.0" },
              ]}
            />
            {checked && Number(fos) < 1.5 && (
              <p className="mt-1 text-sm text-well-dim">✗ below 1.5 for an injury-consequence part — the factor prices the consequence</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm text-well-dim" htmlFor="allow-allow">
              Design allowable, MPa
            </label>
            <input id="allow-allow" type="number" step="any" value={allowEntry} onChange={(e) => { setChecked(false); setAllowEntry(e.target.value); }} className={numInputClass} />
            {checked && (
              <p className="mt-1 text-sm text-well-dim">
                {allowOk ? "✓ characteristic ÷ factor, arithmetic checks out" : "✗ allowable must equal your characteristic ÷ your factor"}
              </p>
            )}
          </div>
          <div className="sm:col-span-2">
            {!checked ? (
              <WellButton onClick={() => setChecked(true)}>Issue the allowable</WellButton>
            ) : (
              <div>
                <Readouts
                  items={[
                    { label: "Mean", value: meanOk ? "✓" : "✗" },
                    { label: "Std dev", value: stdOk ? "✓" : "✗" },
                    { label: "Characteristic", value: charOk ? "✓" : "✗" },
                    { label: "Factor ≥ 1.5", value: Number(fos) >= 1.5 ? "✓" : "✗" },
                    { label: "Allowable", value: allowOk ? "✓" : "✗" },
                  ]}
                />
                <p className="mt-2 max-w-prose text-sm leading-relaxed text-well-dim">
                  {meanOk && stdOk && charOk && allowOk && Number(fos) >= 1.5
                    ? `Allowable ≈ ${(charV / fosV).toFixed(0)} MPa = ${charV.toFixed(0)} characteristic ÷ ${fos}. The curve said ~${mean.toFixed(0)}; the design uses less. That gap is scatter, uncertainty, and consequence.`
                    : "Fix the ✗ entries. The mean is not the allowable — half the heat is weaker than the mean."}
                </p>
              </div>
            )}
          </div>
        </>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[320px] text-left text-sm">
          <thead>
            <tr className="text-well-dim">
              <th className="py-1 pr-3 font-medium">Specimen</th>
              <th className="py-1 font-medium">Extracted σy, MPa</th>
            </tr>
          </thead>
          <tbody>
            {yields.map((y, i) => (
              <tr key={i} className="border-t border-white/10">
                <td className="py-1 pr-3">Heat A-{i + 1}</td>
                <td className="py-1">{y.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </BenchShell>
  );
}

/* ------------------------------------------------------------------ */
/* Materials 101, Week 15 — strengthening & heat treatment benches.    */
/* ------------------------------------------------------------------ */

const HP_SIGMA0 = 110; // MPa, classroom steel
const HP_K = 0.65; // MPa·m^1/2

const MECHANISM_OPTIONS: { value: MechanismId; label: string }[] = MECHANISMS.map((m) => ({
  value: m.id,
  label: m.name,
}));

/** Schematic aging curve: rises to a peak near 8 h, then overages. Illustrative, not data. */
function agedStrength(tHours: number): number {
  const t = Math.max(tHours, 0.5);
  return 75 + 270 * (t / 8) * Math.exp(1 - t / 8);
}

export function StrengthExplorerBench() {
  const [mech, setMech] = useState<MechanismId>("grain");
  const [logGrain, setLogGrain] = useState(Math.log10(20));
  const [coldWork, setColdWork] = useState(50);
  const [solute, setSolute] = useState(30);
  const [ageTime, setAgeTime] = useState(8);
  const [annealed, setAnnealed] = useState(false);

  const grainUm = Math.round(10 ** logGrain);
  const hp = hallPetch(HP_SIGMA0, HP_K, grainUm);
  const wh = workHarden(70, 330, coldWork / 100);
  const ss = solidSolution(70, 350, solute / 100);
  const aged = agedStrength(ageTime);

  const anneal = () => {
    setColdWork(0);
    setLogGrain(Math.log10(150));
    setAnnealed(true);
  };

  const active = MECHANISMS.find((m) => m.id === mech);

  return (
    <BenchShell
      prompt="Four obstacles, four prices. Pick a mechanism, move its slider, and watch what strength costs. || Then press anneal and watch two mechanisms die at once: the cold-work forest recrystallizes away and the grains grow. || For each mechanism, write its obstacle and its price in one sentence."
      note="Classroom estimates — right shape, approximate magnitude. The anneal button is the undo for cold work and the eraser for fine grains."
      controls={
        <>
          <SegmentedControl label="Strengthening mechanism" value={mech} onChange={setMech} options={MECHANISM_OPTIONS} />
          {mech === "grain" && (
            <Slider
              label="Grain size"
              value={logGrain}
              min={0}
              max={Math.log10(500)}
              step={0.01}
              display={`${grainUm} μm`}
              onChange={(v) => {
                setLogGrain(v);
                setAnnealed(false);
              }}
            />
          )}
          {mech === "work" && (
            <Slider
              label="Cold reduction"
              value={coldWork}
              min={0}
              max={90}
              step={1}
              display={`${coldWork}%`}
              onChange={(v) => {
                setColdWork(v);
                setAnnealed(false);
              }}
            />
          )}
          {mech === "solution" && (
            <Slider label="Solute content" value={solute} min={0} max={40} step={1} display={`${solute}%`} onChange={setSolute} />
          )}
          {mech === "precip" && (
            <Slider label="Aging time at 190°C" value={ageTime} min={0.5} max={24} step={0.5} display={`${ageTime} h`} onChange={setAgeTime} />
          )}
          <div className="sm:col-span-2">
            <WellButton onClick={anneal}>Anneal: recrystallize + grow the grains</WellButton>
          </div>
        </>
      }
    >
      <Readouts
        items={
          mech === "grain"
            ? [
                { label: "Yield (Hall-Petch)", value: `${fmt(hp, 0)} MPa` },
                { label: "Boundary term", value: `${fmt(hp - HP_SIGMA0, 0)} MPa` },
              ]
            : mech === "work"
              ? [
                  { label: "Yield (work-hardened Cu)", value: `${fmt(wh, 0)} MPa` },
                  { label: "Gain over annealed", value: `${fmt(wh - 70, 0)} MPa` },
                ]
              : mech === "solution"
                ? [
                    { label: "Yield (Cu alloy)", value: `${fmt(ss, 0)} MPa` },
                    { label: "Solute contribution", value: `${fmt(ss - 70, 0)} MPa` },
                  ]
                : [
                    { label: "Yield (aged 2024)", value: `${fmt(aged, 0)} MPa` },
                    {
                      label: "Regime",
                      value: ageTime < 6 ? "underaged" : ageTime <= 10 ? "peak-aged" : "overaged",
                    },
                  ]
        }
      />
      {annealed && (
        <p className="mt-2 text-sm leading-relaxed text-well-dim">
          Annealed: cold work erased by recrystallization, grains grown to 150 μm — the yield fell on both counts.
          Recovery nibbled, recrystallization feasted, grain growth took the leftovers.
        </p>
      )}
      {active && (
        <div className="mt-3 space-y-2 text-sm leading-relaxed text-well-dim">
          <p>
            <span className="text-well-fg">{active.name}.</span> {active.obstacle}
          </p>
          <p>
            Typical gain {active.gainRange[0]}–{active.gainRange[1]} MPa · ductility loss {active.ductilityLoss} ·
            cost {active.costIndex}/3. {active.price}
          </p>
        </div>
      )}
    </BenchShell>
  );
}

const MEMO15_KEY = "ff:processmemo-w15";
const MEMO15_RUBRIC = [
  "States the requirement numbers (floors, not adjectives)",
  "Names the chosen alloy, route, and heat-treatment schedule",
  "Cites predicted yield and elongation against the floors, with margin",
  "Names the strengthening mechanism doing the work",
  "Names what was traded away (ductility, cost, or process control)",
];

export function ProcessMemoBench() {
  const [reqId, setReqId] = useState("bolt");
  const [alloyId, setAlloyId] = useState<AlloyId>("4140");
  const [routeId, setRouteId] = useState<RouteId>("quench-temper");
  const [text, setText] = useState(() => {
    try {
      return localStorage.getItem(MEMO15_KEY) ?? "";
    } catch {
      return "";
    }
  });
  const [checked, setChecked] = useState<boolean[]>(() => MEMO15_RUBRIC.map(() => false));
  useEffect(() => {
    try {
      localStorage.setItem(MEMO15_KEY, text);
    } catch {
      /* private browsing: the memo simply does not persist */
    }
  }, [text]);

  const req: Requirement = REQUIREMENTS.find((r) => r.id === reqId) ?? REQUIREMENTS[0];
  const alloy = ALLOYS.find((a) => a.id === alloyId) ?? ALLOYS[0];
  const route = ROUTES.find((r) => r.id === routeId) ?? ROUTES[0];
  const o = outcome(alloyId, routeId);
  const v = judge(req, o);
  const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const done = checked.filter(Boolean).length;

  return (
    <BenchShell
      prompt="Design the process, then defend it. Pick a part requirement, an alloy, and a route — the bench predicts the properties and judges the pair against the floors. || Iterate until a pair clears every screen, then write the memo: requirement numbers, choice, predicted properties with margin, the mechanism doing the work, and the trade. || Check each rubric box only when a stranger could verify it from your text alone."
      note="Predicted properties are typical handbook values for choosing routes — not certifiable data. The memo saves in this browser as you type."
      controls={
        <>
          <SegmentedControl
            label="Part requirement"
            value={reqId}
            onChange={setReqId}
            options={REQUIREMENTS.map((r) => ({ value: r.id, label: r.name }))}
          />
          <SegmentedControl
            label="Alloy"
            value={alloyId}
            onChange={setAlloyId}
            options={ALLOYS.map((a) => ({ value: a.id, label: a.name }))}
          />
          <SegmentedControl
            label="Process route"
            value={routeId}
            onChange={setRouteId}
            options={ROUTES.map((r) => ({ value: r.id, label: r.name }))}
          />
        </>
      }
    >
      <p className="text-sm leading-relaxed text-well-dim">{req.brief}</p>
      <p className="mt-1 text-sm leading-relaxed text-well-dim">
        <span className="text-well-fg">{alloy.name}.</span> {alloy.notes}{" "}
        <span className="text-well-fg">{route.name}:</span> {route.blurb}
      </p>
      {o.compatible ? (
        <Readouts
          items={[
            { label: "Predicted yield", value: `${fmt(o.yield ?? 0, 0)} MPa` },
            { label: "Predicted elongation", value: `${fmt(o.elong ?? 0, 0)}%` },
            ...(o.hrc !== undefined ? [{ label: "Hardness", value: `~${fmt(o.hrc, 0)} HRC` }] : []),
            { label: "Relative cost", value: `×${fmt((o.costMult ?? 1) * alloy.cost, 2)}` },
            {
              label: "Verdict",
              value: v.ok
                ? `CLEARS${v.margin !== undefined ? ` — margin ×${fmt(v.margin, 2)}` : ""}`
                : "MISSES",
            },
          ]}
        />
      ) : (
        <p className="mt-2 text-sm leading-relaxed text-well-fg">
          Incompatible: {o.reason} Pick a route this alloy can actually take.
        </p>
      )}
      {o.compatible && !v.ok && (
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-well-dim">
          {v.reasons.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      )}
      {o.compatible && o.note && (
        <p className="mt-2 text-sm leading-relaxed text-well-dim">{o.note}</p>
      )}
      <div className="mt-4">
        <div className="mb-2 text-sm text-well-dim">Rubric — check what the memo earns</div>
        <div className="flex flex-col gap-2">
          {MEMO15_RUBRIC.map((item, i) => (
            <label key={item} className="flex cursor-pointer items-start gap-3 text-sm text-well-fg">
              <input
                type="checkbox"
                checked={checked[i] ?? false}
                onChange={() => setChecked((prev) => prev.map((c, j) => (j === i ? !c : j)) && prev.map((c, j) => (j === i ? !c : c)))}
                className="mt-0.5 h-4 w-4 shrink-0 accent-white"
              />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </div>
      <Readouts
        items={[
          { label: "Words", value: `${words}` },
          { label: "Rubric", value: `${done} / ${MEMO15_RUBRIC.length}` },
        ]}
      />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Requirement numbers, alloy + route + schedule, predicted properties with margin, the mechanism, the trade…"
        className="min-h-44 w-full rounded-lg bg-white/10 p-3 text-well-fg ring-1 ring-white/20 placeholder:text-well-dim"
      />
      <p className="mt-2 text-sm leading-relaxed text-well-dim">
        {done === MEMO15_RUBRIC.length
          ? "Full rubric. If every box is honestly earned, the memo is evidence."
          : "Aim for a memo a stranger could grade without asking you anything."}
      </p>
    </BenchShell>
  );
}

/* ------------------------------------------------------------------ */
/* Materials 101, Week 16 — fracture, fatigue & creep benches          */
/* ------------------------------------------------------------------ */

type FailureMode = "Brittle fracture" | "Fatigue" | "Creep" | "Ductile overload";

const FORENSICS_CASES: {
  title: string;
  context: string;
  surface: string;
  mode: FailureMode;
  modeWhy: string;
  tests: [string, string, string];
  testAnswer: number;
  testWhy: string;
  lesson: string;
}[] = [
  {
    title: "The cold-water hull",
    context:
      "Welded structural-steel hull, in winter North Atlantic service. No storm, no collision — the crack ran at anchor.",
    surface:
      "Flat, crystalline fracture face. Chevron marks converge on a weld defect at a sharp hatch corner.",
    mode: "Brittle fracture",
    modeWhy:
      "Flat crystalline faces plus chevrons pointing at a weld defect in cold service is textbook low-temperature brittle fracture. The steel was fine at room temperature; the ocean was not.",
    tests: [
      "Charpy impact tests across temperatures to find the ductile-to-brittle transition",
      "Dye-penetrant inspection of an unrelated weld",
      "A hardness survey of the deck plate",
    ],
    testAnswer: 0,
    testWhy:
      "Only the Charpy series answers the actual question: at what temperature does this steel's toughness collapse? The defect explains where; the transition explains why now.",
    lesson: "The designer should have specified steel with a transition temperature below the service temperature — or kept the hull riveted so a crack stopped at a plate edge.",
  },
  {
    title: "The square window",
    context:
      "Aluminum fuselage skin from a pressurized airliner, ~1,000 pressurization cycles in service. Static proof tests all passed.",
    surface:
      "Crack origin at the corner of a square cutout. A smooth thumbnail-shaped region around the origin; fine striations visible under the electron microscope.",
    mode: "Fatigue",
    modeWhy:
      "Striations are the fingerprint of fatigue — one per cycle. The thumbnail shape and the origin at a sharp corner (stress concentration again) complete the diagnosis. Static strength was never the question.",
    tests: [
      "SEM of the origin for striations, plus a review of the pressurization-cycle history",
      "A tensile test of a pristine skin panel",
      "X-ray of rivets far from the crack",
    ],
    testAnswer: 0,
    testWhy:
      "Striations confirm cyclic growth and the cycle history sets the rate — together they let you back out when the crack was born. A tensile test would only re-prove the irrelevant static strength.",
    lesson: "Round the windows — remove the stress concentration — and design the fuselage for damage tolerance: assume cracks exist, and set inspection intervals from their growth rate.",
  },
  {
    title: "The stretching blade",
    context:
      "Nickel-superalloy turbine blade, ~8,000 h at 900°C under centrifugal load. Removed when tip clearance closed up.",
    surface:
      "The blade is 2 mm longer than new. Fracture face is intergranular, with grain-boundary voids and microcracks near the fracture.",
    mode: "Creep",
    modeWhy:
      "Slow elongation in hot service plus intergranular fracture with boundary voids is creep, not fatigue and not overload. The part did not break from a load — it flowed on a clock.",
    tests: [
      "Metallographic section for grain-boundary voids and cavitation",
      "A room-temperature tensile test",
      "Magnetic-particle inspection of the root",
    ],
    testAnswer: 0,
    testWhy:
      "Grain-boundary cavitation is the microstructural signature of creep damage. Room-temperature tests cannot see a high-temperature mechanism.",
    lesson: "Size hot parts against the secondary creep rate for the required life — or delete the grain boundaries entirely, the way single-crystal blades do.",
  },
  {
    title: "The bent hook",
    context:
      "Forged-steel crane hook, one lift far above its rating. The hook is visibly opened up.",
    surface:
      "Gross plastic deformation. Slant fracture at 45° with shear lips; dimpled surface under the microscope.",
    mode: "Ductile overload",
    modeWhy:
      "Dimples are microvoid coalescence — the signature of ductile tearing — and the 45° shear lips plus the bent hook say a single load exceeded the strength. No cycles, no time, no cold: just too much force, once.",
    tests: [
      "SEM confirmation of dimple rupture, plus a review of the lift's load history",
      "Ultrasonic thickness gauging",
      "A creep test at service temperature",
    ],
    testAnswer: 0,
    testWhy:
      "The dimples close the case on mechanism; the load history closes it on cause. Everything else measures something that did not happen.",
    lesson: "The hook did its job — it deformed before it parted, which is what ductility buys. The fix is procedural: the overload should never have been rigged.",
  },
];

export function ForensicsBench() {
  const [i, setI] = useState(0);
  const [mode, setMode] = useState<FailureMode | null>(null);
  const [test, setTest] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const done = i >= FORENSICS_CASES.length;
  const item = FORENSICS_CASES[i];
  const modes: FailureMode[] = ["Brittle fracture", "Fatigue", "Creep", "Ductile overload"];

  const next = () => {
    if (mode === item.mode) setCorrect((c) => c + 1);
    setMode(null);
    setTest(null);
    setI((n) => n + 1);
  };

  return (
    <BenchShell
      prompt="Read the history, then the fracture surface. Name the failure mode — then pick the test that would confirm it. || The surface testifies first: chevrons point at origins, striations count cycles, dimples confess overload. || Finish all four cases, and for each one say what the designer should have done differently."
      note="Anonymized and simplified from real failures. Real forensics starts with preserving the fracture surface — every touch after the break destroys evidence."
      controls={
        <div className="sm:col-span-2">
          {done ? (
            <button
              type="button"
              className="min-h-11 rounded-lg px-4 text-sm text-well-fg ring-1 ring-white/25"
              onClick={() => {
                setI(0);
                setMode(null);
                setTest(null);
                setCorrect(0);
              }}
            >
              Run the cases again
            </button>
          ) : mode !== null && test !== null ? (
            <button
              type="button"
              className="min-h-11 rounded-lg bg-well-fg px-4 text-sm text-well"
              onClick={next}
            >
              {i === FORENSICS_CASES.length - 1 ? "See the tally" : "Next case"}
            </button>
          ) : (
            <p className="text-sm text-well-dim">Case {i + 1} of {FORENSICS_CASES.length}</p>
          )}
        </div>
      }
    >
      {done ? (
        <div className="space-y-3">
          <Readouts
            items={[
              { label: "Failure modes right", value: `${correct} / ${FORENSICS_CASES.length}` },
              {
                label: "Verdict",
                value: correct === 4 ? "Forensic engineer" : correct >= 2 ? "Getting there" : "Keep looking at surfaces",
              },
            ]}
          />
          <p className="text-sm leading-relaxed text-well-dim">
            The case report is the evidence this week asks for: mode, confirming test, and the design change — written down, not just clicked.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <div>
            <p className="font-serif text-xl text-well-fg">{item.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-well-dim">{item.context}</p>
            <p className="mt-2 text-sm leading-relaxed text-well-dim">
              <span className="text-well-fg">Fracture surface: </span>
              {item.surface}
            </p>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-well-fg">1. Name the failure mode</p>
            <div className="flex flex-wrap gap-2">
              {modes.map((m) => (
                <button
                  key={m}
                  type="button"
                  disabled={mode !== null}
                  onClick={() => setMode(m)}
                  className={cn(
                    "min-h-11 rounded-lg px-4 text-sm ring-1",
                    mode === null
                      ? "text-well-fg ring-white/25 hover:ring-white/60"
                      : m === item.mode
                        ? "bg-well-fg text-well ring-well-fg"
                        : m === mode
                          ? "text-well-fg ring-red-400/70"
                          : "text-well-dim ring-white/15",
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
            {mode !== null && (
              <p className="mt-2 text-sm leading-relaxed text-well-dim">
                {mode === item.mode ? "Correct. " : `Not quite — this was ${item.mode}. `}
                {item.modeWhy}
              </p>
            )}
          </div>
          {mode !== null && (
            <div>
              <p className="mb-2 text-sm font-medium text-well-fg">2. Pick the confirming test</p>
              <div className="flex flex-col gap-2">
                {item.tests.map((t, ti) => (
                  <button
                    key={t}
                    type="button"
                    disabled={test !== null}
                    onClick={() => setTest(ti)}
                    className={cn(
                      "min-h-11 rounded-lg px-4 py-2 text-left text-sm ring-1",
                      test === null
                        ? "text-well-fg ring-white/25 hover:ring-white/60"
                        : ti === item.testAnswer
                          ? "bg-well-fg text-well ring-well-fg"
                          : ti === test
                            ? "text-well-fg ring-red-400/70"
                            : "text-well-dim ring-white/15",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {test !== null && (
                <div className="mt-2 space-y-2 text-sm leading-relaxed text-well-dim">
                  <p>
                    {test === item.testAnswer ? "Correct. " : "Not the one. "}
                    {item.testWhy}
                  </p>
                  <p>
                    <span className="text-well-fg">Design lesson: </span>
                    {item.lesson}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </BenchShell>
  );
}

function formatCycles(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (n >= 1e9) return `${fmt(n / 1e9, 2)}B cycles`;
  if (n >= 1e6) return `${fmt(n / 1e6, 2)}M cycles`;
  if (n >= 1e3) return `${fmt(n / 1e3, 1)}k cycles`;
  return `${fmt(n, 0)} cycles`;
}

const SN_MATERIALS = [
  {
    id: "steel",
    name: "1045 steel",
    sfPrime: 900,
    b: -0.09,
    endurance: 310,
    note: "Endurance limit ≈ 310 MPa — below it, life is effectively infinite.",
  },
  {
    id: "aluminum",
    name: "7075-T6 aluminum",
    sfPrime: 1300,
    b: -0.12,
    endurance: null,
    note: "No endurance limit — every cycle debits the account. Design to a finite life.",
  },
  {
    id: "titanium",
    name: "Ti-6Al-4V",
    sfPrime: 1400,
    b: -0.08,
    endurance: null,
    note: "High strength, moderate notch sensitivity. Teaching coefficients throughout.",
  },
] as const;

export function SnLifeBench() {
  const [matId, setMatId] = useState<string>("steel");
  const [sigmaA, setSigmaA] = useState(300);
  const [sigma1, setSigma1] = useState(350);
  const [n1, setN1] = useState(20000);
  const [sigma2, setSigma2] = useState(200);
  const [n2, setN2] = useState(500000);
  const mat = SN_MATERIALS.find((m) => m.id === matId) ?? SN_MATERIALS[0];

  const life = useMemo(() => {
    if (mat.endurance !== null && sigmaA <= mat.endurance) return Infinity;
    return basquinLife(sigmaA * 1e6, mat.sfPrime * 1e6, mat.b);
  }, [mat, sigmaA]);
  const N1 = basquinLife(sigma1 * 1e6, mat.sfPrime * 1e6, mat.b);
  const N2 = basquinLife(sigma2 * 1e6, mat.sfPrime * 1e6, mat.b);
  const damage = n1 / N1 + n2 / N2;

  return (
    <BenchShell
      prompt="Pick a material and set the stress amplitude; read the Basquin life and check it against the endurance limit. Then spend two load blocks and watch Miner's sum decide. || Drop the amplitude below the steel's endurance limit and watch the life go effectively infinite — then try the same trick on aluminum. || Finish with a Miner sum under 0.7 after spending both blocks, and say in one sentence why the margin is not cowardice."
      note="Teaching coefficients, not a fitted alloy: σ_f′ and b are representative, and the bench ignores surface finish, notches, and mean stress — all of which shorten real life. A scratch or a weld toe can skip the crack's birth entirely."
      controls={
        <>
          <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
            {SN_MATERIALS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMatId(m.id)}
                className={cn(
                  "min-h-11 rounded-lg px-4 text-sm ring-1",
                  m.id === matId
                    ? "bg-well-fg text-well ring-well-fg"
                    : "text-well-fg ring-white/25 hover:ring-white/60",
                )}
              >
                {m.name}
              </button>
            ))}
          </div>
          <Slider
            label="Stress amplitude (S-N)"
            min={50}
            max={800}
            step={10}
            value={sigmaA}
            display={`${sigmaA} MPa`}
            onChange={setSigmaA}
          />
          <Slider
            label="Block 1 amplitude"
            min={50}
            max={800}
            step={10}
            value={sigma1}
            display={`${sigma1} MPa`}
            onChange={setSigma1}
          />
          <Slider
            label="Block 1 cycles spent"
            min={0}
            max={2000000}
            step={10000}
            value={n1}
            display={formatCycles(n1)}
            onChange={setN1}
          />
          <Slider
            label="Block 2 amplitude"
            min={50}
            max={800}
            step={10}
            value={sigma2}
            display={`${sigma2} MPa`}
            onChange={setSigma2}
          />
          <Slider
            label="Block 2 cycles spent"
            min={0}
            max={2000000}
            step={10000}
            value={n2}
            display={formatCycles(n2)}
            onChange={setN2}
          />
        </>
      }
    >
      <Readouts
        items={[
          { label: "Basquin life", value: life === Infinity ? "∞ (below endurance)" : formatCycles(life) },
          { label: "Block 1 life", value: formatCycles(N1) },
          { label: "Block 2 life", value: formatCycles(N2) },
          { label: "Miner sum Σ n/N", value: fmt(damage, 2) },
          {
            label: "Verdict",
            value: damage >= 1 ? "Predicted failure" : damage >= 0.7 ? "Too close — derate" : "Within budget",
          },
        ]}
      />
      <div className="space-y-2 text-sm leading-relaxed text-well-dim">
        <p>
          {mat.name}: σ_f′ = {mat.sfPrime} MPa, b = {mat.b}. {mat.note}
        </p>
        <p>
          Miner spends {formatCycles(n1)} of {formatCycles(N1)} and {formatCycles(n2)} of{" "}
          {formatCycles(N2)}: damage {fmt(n1 / N1, 2)} + {fmt(n2 / N2, 2)} = {fmt(damage, 2)}.
          Fatigue scatters by factors, not percents — the 0.7 target is calibration, not cowardice.
        </p>
      </div>
    </BenchShell>
  );
}

function formatHours(h: number): string {
  if (!Number.isFinite(h)) return "—";
  if (h >= 8760) return `${fmt(h, 0)} h (${fmt(h / 8760, 1)} yr)`;
  return `${fmt(h, 0)} h`;
}

export function CreepLifeBench() {
  const [testC, setTestC] = useState(800);
  const [testLogH, setTestLogH] = useState(3);
  const [serviceC, setServiceC] = useState(700);

  const testH = Math.pow(10, testLogH);
  const P = larsonMiller(testC + 273.15, testH);
  const predicted = ruptureTime(P, serviceC + 273.15);
  const ratio = predicted / testH;
  const extrapolated = ratio > 10 || ratio < 0.1;

  return (
    <BenchShell
      prompt="Run the hot short test: set the temperature and rupture time, and read off the Larson-Miller parameter. Then dial the service temperature down and watch the predicted life move. || Push the extrapolation past ten-to-one in time and watch the warning appear — then say why the warning exists. || Finish with a service life above 20,000 h from a test of at least 2,000 h, and name the mechanism change that would void your prediction."
      note="C = 20 suits most alloys in the teaching range. Real qualification runs multiple temperatures and stresses, checks that one mechanism owns the data, and still applies a factor on life. The bench's warning at ten-to-one extrapolation is industry manners, not physics."
      controls={
        <>
          <Slider
            label="Test temperature"
            min={600}
            max={1100}
            step={10}
            value={testC}
            display={`${testC} °C`}
            onChange={setTestC}
          />
          <Slider
            label="Test rupture time"
            min={1}
            max={4}
            step={0.1}
            value={testLogH}
            display={formatHours(testH)}
            onChange={setTestLogH}
          />
          <Slider
            label="Service temperature"
            min={400}
            max={1000}
            step={10}
            value={serviceC}
            display={`${serviceC} °C`}
            onChange={setServiceC}
          />
        </>
      }
    >
      <Readouts
        items={[
          { label: "Larson-Miller P", value: fmt(P, 0) },
          { label: "Predicted life", value: formatHours(predicted) },
          { label: "Time ratio", value: `${fmt(ratio, 1)}×` },
          { label: "Verdict", value: extrapolated ? "Extrapolation warning" : "Within manners" },
        ]}
      />
      <div className="space-y-2 text-sm leading-relaxed text-well-dim">
        <p>
          P = {(testC + 273.15).toFixed(0)} K × (20 + log₁₀ {fmt(testH, 0)} h) = {fmt(P, 0)}. At{" "}
          {serviceC} °C ({(serviceC + 273.15).toFixed(0)} K) the same parameter gives{" "}
          {formatHours(predicted)}.
        </p>
        {extrapolated && (
          <p className="text-well-fg">
            Ten-to-one in time is the manners limit: past it, a mechanism change — dislocation
            creep giving way to diffusional creep, a precipitate coarsening — can move the master
            curve without asking.
          </p>
        )}
      </div>
    </BenchShell>
  );
}

/* ------------------------------------------------------------------ */
/* Materials 101, Week 17 — phase diagrams & transformations           */
/* ------------------------------------------------------------------ */

const W = 320;
const H = 220;
/** Eutectic-diagram SVG mapping: 0–100 wt% Sn → x, 60–340 °C → y. */
const ex = (c: number) => 28 + (c / 100) * 264;
const ey = (t: number) => 196 - ((t - 60) / 280) * 176;

function EutecticDiagram({
  c0,
  t,
  showPoint = true,
}: {
  c0?: number;
  t?: number;
  showPoint?: boolean;
}) {
  const liq = `${ex(0)},${ey(327)} ${ex(PB_SN.eutecticC)},${ey(PB_SN.eutecticT)} ${ex(100)},${ey(232)}`;
  const solA = `${ex(0)},${ey(327)} ${ex(19.2)},${ey(PB_SN.eutecticT)}`;
  const solB = `${ex(100)},${ey(232)} ${ex(97.5)},${ey(PB_SN.eutecticT)}`;
  const svA = `${ex(19.2)},${ey(PB_SN.eutecticT)} ${ex(0)},${ey(60)}`;
  const svB = `${ex(97.5)},${ey(PB_SN.eutecticT)} ${ex(100)},${ey(60)}`;
  const tie = eutecticTieLineAt(c0 ?? -1, t ?? -1);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Lead tin phase diagram">
      <line x1={28} y1={196} x2={292} y2={196} stroke="currentColor" strokeOpacity="0.4" />
      <line x1={28} y1={196} x2={28} y2={20} stroke="currentColor" strokeOpacity="0.4" />
      <text x={286} y={212} fontSize="9" fill="currentColor" opacity="0.7" textAnchor="end">wt% Sn →</text>
      <text x={22} y={28} fontSize="9" fill="currentColor" opacity="0.7">T °C</text>
      <polyline points={liq} fill="none" stroke="currentColor" strokeWidth="2" />
      <polyline points={solA} fill="none" stroke="currentColor" strokeWidth="1.4" strokeOpacity="0.75" />
      <polyline points={solB} fill="none" stroke="currentColor" strokeWidth="1.4" strokeOpacity="0.75" />
      <polyline points={svA} fill="none" stroke="currentColor" strokeWidth="1.4" strokeOpacity="0.75" />
      <polyline points={svB} fill="none" stroke="currentColor" strokeWidth="1.4" strokeOpacity="0.75" />
      <line
        x1={ex(19.2)} y1={ey(PB_SN.eutecticT)} x2={ex(97.5)} y2={ey(PB_SN.eutecticT)}
        stroke="currentColor" strokeWidth="1.2" strokeDasharray="5 3" strokeOpacity="0.8"
      />
      <text x={ex(30)} y={ey(280)} fontSize="10" fill="currentColor" opacity="0.8">L</text>
      <text x={ex(8)} y={ey(140)} fontSize="10" fill="currentColor" opacity="0.8">α</text>
      <text x={ex(99)} y={ey(140)} fontSize="10" fill="currentColor" opacity="0.8" textAnchor="end">β</text>
      <text x={ex(30)} y={ey(215)} fontSize="9" fill="currentColor" opacity="0.65">L + α</text>
      <text x={ex(88)} y={ey(215)} fontSize="9" fill="currentColor" opacity="0.65">L + β</text>
      <text x={ex(58)} y={ey(120)} fontSize="9" fill="currentColor" opacity="0.65">α + β</text>
      <circle cx={ex(PB_SN.eutecticC)} cy={ey(PB_SN.eutecticT)} r="3" fill="currentColor" />
      <text x={ex(PB_SN.eutecticC)} y={ey(PB_SN.eutecticT) - 8} fontSize="9" fill="currentColor" opacity="0.8" textAnchor="middle">
        eutectic 183°C
      </text>
      {showPoint && c0 !== undefined && t !== undefined && (
        <>
          {tie && (
            <line
              x1={ex(tie.cLeft)} y1={ey(t)} x2={ex(tie.cRight)} y2={ey(t)}
              stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.45"
            />
          )}
          <circle cx={ex(c0)} cy={ey(t)} r="4.5" fill="none" stroke="currentColor" strokeWidth="2" />
        </>
      )}
    </svg>
  );
}

interface PhaseProblem {
  c0: number;
  t: number;
  hint: string;
}

const PHASE_PROBLEMS: PhaseProblem[] = [
  { c0: 20, t: 250, hint: "Between the liquidus and the solidus on the lead side." },
  { c0: 70, t: 150, hint: "Below the eutectic temperature, mid-composition." },
  { c0: 61.9, t: 183, hint: "Exactly on the marked point." },
  { c0: 10, t: 100, hint: "Low tin, low temperature — check the solvus." },
  { c0: 40, t: 200, hint: "Above the eutectic temperature, off the lead side." },
  { c0: 90, t: 210, hint: "Above the eutectic temperature, tin-rich side." },
];

const REGION_OPTIONS: { value: EutecticRegion; label: string }[] = (
  Object.keys(EUTECTIC_REGION_LABELS) as EutecticRegion[]
).map((r) => ({ value: r, label: EUTECTIC_REGION_LABELS[r] }));

function numInput(value: string, set: (v: string) => void, placeholder: string) {
  return (
    <input
      type="number"
      step="any"
      value={value}
      placeholder={placeholder}
      onChange={(e) => set(e.target.value)}
      className="w-28 rounded-md bg-white/10 px-2 py-1.5 text-sm tabular-nums text-well-fg placeholder:text-well-dim/60"
    />
  );
}

export function PhaseSetBench() {
  const [mode, setMode] = useState<"problems" | "explore">("problems");
  const [pi, setPi] = useState(0);
  const [region, setRegion] = useState<EutecticRegion | "">("");
  const [cA, setCA] = useState("");
  const [cB, setCB] = useState("");
  const [wA, setWA] = useState("");
  const [wB, setWB] = useState("");
  const [graded, setGraded] = useState<null | {
    regionOk: boolean;
    tieOk: boolean;
    fracOk: boolean;
    expRegion: string;
    expTie: string;
    expFrac: string;
  }>(null);
  const [scores, setScores] = useState<boolean[]>(() => PHASE_PROBLEMS.map(() => false));
  // explore mode
  const [ec0, setEc0] = useState(40);
  const [et, setEt] = useState(200);

  const problem = PHASE_PROBLEMS[pi];
  const resetFor = (i: number) => {
    setPi(i);
    setRegion("");
    setCA("");
    setCB("");
    setWA("");
    setWB("");
    setGraded(null);
  };

  const grade = () => {
    const { c0, t } = problem;
    const expRegion = eutecticRegionAt(c0, t);
    const tie = eutecticTieLineAt(c0, t);
    const regionOk = region === expRegion;
    let tieOk: boolean;
    let expTie: string;
    let fracOk: boolean;
    let expFrac: string;
    if (!tie) {
      tieOk = cA.trim() === "" && cB.trim() === "";
      expTie = "no tie line — single phase or the eutectic point (leave both blank)";
      fracOk = wA.trim() === "" && wB.trim() === "";
      expFrac = "no fractions to compute (leave both blank)";
    } else {
      const a = Number(cA);
      const b = Number(cB);
      tieOk =
        Number.isFinite(a) &&
        Number.isFinite(b) &&
        Math.abs(a - tie.cLeft) <= 1.5 &&
        Math.abs(b - tie.cRight) <= 1.5;
      expTie = `${fmt(tie.cLeft, 1)} wt% Sn → ${fmt(tie.cRight, 1)} wt% Sn`;
      const { wA: ewA, wB: ewB } = leverFractions(c0, tie.cLeft, tie.cRight);
      const fa = Number(wA);
      const fb = Number(wB);
      fracOk =
        Number.isFinite(fa) &&
        Number.isFinite(fb) &&
        Math.abs(fa - ewA) <= 0.03 &&
        Math.abs(fb - ewB) <= 0.03;
      expFrac = `${fmt(ewA, 3)} of the low-end phase, ${fmt(ewB, 3)} of the high-end phase`;
    }
    setGraded({ regionOk, tieOk, fracOk, expRegion: EUTECTIC_REGION_LABELS[expRegion], expTie, expFrac });
    if (regionOk && tieOk && fracOk) {
      setScores((s) => s.map((v, i) => (i === pi ? true : v)));
    }
  };

  const eRegion = eutecticRegionAt(ec0, et);
  const eTie = eutecticTieLineAt(ec0, et);
  const eFrac = eTie ? leverFractions(ec0, eTie.cLeft, eTie.cRight) : null;
  const solved = scores.filter(Boolean).length;

  return (
    <BenchShell
      prompt="Six alloys, six temperatures. For each: name the phase field, read the tie-line ends, and compute the phase fractions. || The diagram is drawn with your point marked; the tie line appears only after you grade, so read before you check. || Clear all six — the eutectic problem has no tie line to draw, which is itself the test."
      note="Teaching linearization of Pb–Sn: real boundaries curve and the numbers are rounded, but every reading rule here transfers to a real diagram."
      controls={
        <>
          <Segmented
            label="Mode"
            value={mode}
            onChange={setMode}
            options={[
              { value: "problems", label: "Problem set" },
              { value: "explore", label: "Explore the diagram" },
            ]}
          />
          {mode === "explore" && (
            <>
              <Slider label="Composition" min={0} max={100} step={0.5} value={ec0} display={`${fmt(ec0, 1)} wt% Sn`} onChange={setEc0} />
              <Slider label="Temperature" min={60} max={340} step={1} value={et} display={`${fmt(et, 0)} °C`} onChange={setEt} />
            </>
          )}
        </>
      }
    >
      {mode === "explore" ? (
        <>
          <Readouts
            items={[
              { label: "Phase field", value: EUTECTIC_REGION_LABELS[eRegion] },
              { label: "Tie-line ends", value: eTie ? `${fmt(eTie.cLeft, 1)} → ${fmt(eTie.cRight, 1)} wt%` : "—" },
              {
                label: "Phase fractions",
                value: eFrac ? `${fmt(eFrac.wA, 2)} / ${fmt(eFrac.wB, 2)}` : "—",
              },
            ]}
          />
          <EutecticDiagram c0={ec0} t={et} />
          <p className="mt-2 text-sm text-well-dim">
            Move the sliders and watch the point cross boundaries. The tie line only exists in two-phase
            fields; at the eutectic point three phases meet and the lever rule takes the day off.
          </p>
        </>
      ) : (
        <>
          <Readouts
            items={[
              { label: "Problem", value: `${pi + 1} of ${PHASE_PROBLEMS.length}` },
              { label: "Alloy", value: `${fmt(problem.c0, 1)} wt% Sn` },
              { label: "Temperature", value: `${fmt(problem.t, 0)} °C` },
              { label: "Solved", value: `${solved} of ${PHASE_PROBLEMS.length}` },
            ]}
          />
          <EutecticDiagram c0={problem.c0} t={problem.t} />
          <p className="mt-2 text-sm text-well-dim">Hint: {problem.hint}</p>
          <div className="mt-4 space-y-4">
            <Segmented label="Phase field" value={region} onChange={(v) => { setRegion(v); setGraded(null); }} options={REGION_OPTIONS} />
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <div className="mb-2 text-sm text-well-dim">Tie-line ends (wt% Sn, low → high)</div>
                <div className="flex items-center gap-2">
                  {numInput(cA, (v) => { setCA(v); setGraded(null); }, "left end")}
                  <span className="text-well-dim">→</span>
                  {numInput(cB, (v) => { setCB(v); setGraded(null); }, "right end")}
                </div>
              </div>
              <div>
                <div className="mb-2 text-sm text-well-dim">Phase fractions (low-end phase, high-end phase)</div>
                <div className="flex items-center gap-2">
                  {numInput(wA, (v) => { setWA(v); setGraded(null); }, "W low")}
                  <span className="text-well-dim">/</span>
                  {numInput(wB, (v) => { setWB(v); setGraded(null); }, "W high")}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <WellButton onClick={grade}>Check this problem</WellButton>
              <WellButton onClick={() => resetFor((pi + 1) % PHASE_PROBLEMS.length)}>
                {pi + 1 < PHASE_PROBLEMS.length ? "Next problem" : "Back to problem 1"}
              </WellButton>
            </div>
            {graded && (
              <div className="space-y-1 text-sm leading-relaxed">
                <p className={graded.regionOk ? "text-well-fg" : "text-well-dim"}>
                  {graded.regionOk ? "✓" : "✗"} Field: expected {graded.expRegion}.
                </p>
                <p className={graded.tieOk ? "text-well-fg" : "text-well-dim"}>
                  {graded.tieOk ? "✓" : "✗"} Tie line: expected {graded.expTie}.
                </p>
                <p className={graded.fracOk ? "text-well-fg" : "text-well-dim"}>
                  {graded.fracOk ? "✓" : "✗"} Fractions: expected {graded.expFrac}.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </BenchShell>
  );
}

/** Isomorphous-diagram SVG mapping: 0–60 wt% Ni → x, 1050–1480 °C → y. */
const ix = (c: number) => 28 + (c / 60) * 264;
const iy = (t: number) => 196 - ((t - 1050) / 430) * 176;

export function SolidifyBench() {
  const [c0, setC0] = useState(30);
  const [t, setT] = useState(1210);
  const [coring, setCoring] = useState(false);

  const tLiq = CU_NI.liquidus(c0);
  const tSol = CU_NI.solidus(c0);
  const tMin = Math.floor(tSol - 30);
  const tMax = Math.ceil(tLiq + 30);
  const region = isoRegionAt(c0, t);
  const tie = isoTieLineAt(c0, t);
  const frac = tie ? leverFractions(c0, tie.cLeft, tie.cRight) : null;
  const path = isoSolidificationPath(c0, 5);
  const spread = coringSpread(c0);
  const regionLabel = region === "L" ? "Liquid" : region === "alpha" ? "α (solid)" : "L + α (mushy)";

  return (
    <BenchShell
      prompt="Pick a Cu–Ni alloy and cool it through freezing, step by step. || Watch the tie line sweep across the lens: liquid and solid compositions at each temperature, the fractions, the width of the mushy zone. || Then flip on coring and compare the dendrite core to its rim — that gradient is what a quench freezes in."
      note="Linearized Cu–Ni: real liquidus and solidus curve, and real coring follows the Scheil equation. The core-to-rim story — first solid Ni-rich, last solid lean — is the same."
      controls={
        <>
          <Slider label="Alloy composition" min={5} max={60} step={1} value={c0} display={`${fmt(c0, 0)} wt% Ni`} onChange={(v) => { setC0(v); setT(CU_NI.liquidus(v) + 14); }} />
          <Slider label="Temperature" min={tMin} max={tMax} step={2} value={Math.min(Math.max(t, tMin), tMax)} display={`${fmt(Math.min(Math.max(t, tMin), tMax), 0)} °C`} onChange={setT} />
          <Segmented
            label="Solid diffusion"
            value={coring ? "coring" : "equilibrium"}
            onChange={(v) => setCoring(v === "coring")}
            options={[
              { value: "equilibrium", label: "Equilibrium — diffusion keeps up" },
              { value: "coring", label: "Coring — quenched, no solid diffusion" },
            ]}
          />
        </>
      }
    >
      <Readouts
        items={[
          { label: "State", value: regionLabel },
          { label: "Liquid", value: tie ? `${fmt(tie.cLeft, 1)} wt% Ni` : "—" },
          { label: "Solid α", value: tie ? `${fmt(tie.cRight, 1)} wt% Ni` : region === "alpha" ? `${fmt(c0, 1)} wt% Ni` : "—" },
          { label: "Fractions L / α", value: frac ? `${fmt(frac.wA, 2)} / ${fmt(frac.wB, 2)}` : region === "alpha" ? "0 / 1" : "1 / 0" },
          { label: "Mushy-zone width", value: `${fmt(tLiq - tSol, 1)} °C` },
          coring
            ? { label: "Dendrite core → rim", value: `${fmt(spread.core, 1)} → ${fmt(spread.rim, 1)} wt% Ni` }
            : { label: "Freezing range", value: `${fmt(tSol, 0)}–${fmt(tLiq, 0)} °C` },
        ]}
      />
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Copper nickel phase diagram">
        <line x1={28} y1={196} x2={292} y2={196} stroke="currentColor" strokeOpacity="0.4" />
        <line x1={28} y1={196} x2={28} y2={20} stroke="currentColor" strokeOpacity="0.4" />
        <text x={286} y={212} fontSize="9" fill="currentColor" opacity="0.7" textAnchor="end">wt% Ni →</text>
        <polyline
          points={`${ix(0)},${iy(1085)} ${ix(60)},${iy(CU_NI.liquidus(60))}`}
          fill="none" stroke="currentColor" strokeWidth="2"
        />
        <polyline
          points={`${ix(0)},${iy(1085)} ${ix(60)},${iy(CU_NI.solidus(60))}`}
          fill="none" stroke="currentColor" strokeWidth="1.6" strokeOpacity="0.75"
        />
        <text x={ix(46)} y={iy(1330)} fontSize="10" fill="currentColor" opacity="0.8">L</text>
        <text x={ix(46)} y={iy(1210)} fontSize="9" fill="currentColor" opacity="0.65">L + α</text>
        <text x={ix(46)} y={iy(1130)} fontSize="10" fill="currentColor" opacity="0.8">α</text>
        <line x1={ix(c0)} y1={iy(tMax)} x2={ix(c0)} y2={iy(tMin)} stroke="currentColor" strokeWidth="1.2" strokeDasharray="5 3" strokeOpacity="0.6" />
        {tie && (
          <line
            x1={ix(tie.cLeft)} y1={iy(t)} x2={ix(tie.cRight)} y2={iy(t)}
            stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.5"
          />
        )}
        <circle cx={ix(c0)} cy={iy(Math.min(Math.max(t, tMin), tMax))} r="4.5" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
      <div className="mt-3 space-y-1 text-sm leading-relaxed text-well-dim">
        <p>
          {`First solid appears at ${fmt(tLiq, 0)}°C; the last liquid freezes at ${fmt(tSol, 0)}°C. Between them the alloy is mushy — which is why castings shrink and feeders exist.`}
        </p>
        {coring && (
          <p>
            {`Cored: the dendrite core froze first at ${fmt(spread.core, 1)} wt% Ni and the rim last at ${fmt(spread.rim, 1)} wt% Ni. The average is still ${fmt(c0, 0)}% — coring redistributes, it never creates or destroys solute. A homogenizing anneal erases the gradient.`}
          </p>
        )}
        <p className="opacity-75">
          {`Equilibrium path (${path.length} steps): ${path.map((s) => `${fmt(s.t, 0)}°C`).join(" → ")}`}
        </p>
      </div>
    </BenchShell>
  );
}

/* ------------------------------------------------------------------ */
/* Materials 101, Week 18 benches                                      */
/* ------------------------------------------------------------------ */

type AxisKey = "modulus" | "strength" | "density" | "temp";

const AXES: Record<
  AxisKey,
  { label: string; unit: string; min: number; max: number; log: boolean; get: (f: FamilyId) => [number, number] }
> = {
  modulus: { label: "Stiffness", unit: "GPa", min: 0.1, max: 400, log: true, get: (f) => PROFILES[f].modulus },
  strength: { label: "Strength", unit: "MPa", min: 20, max: 1500, log: true, get: (f) => PROFILES[f].strength },
  density: { label: "Density", unit: "g/cm³", min: 0.9, max: 8, log: false, get: (f) => PROFILES[f].density },
  temp: { label: "Service temperature", unit: "°C", min: -50, max: 1400, log: false, get: (f) => PROFILES[f].serviceTemp },
};

function axisPos(axis: (typeof AXES)[AxisKey], v: number): number {
  const t = axis.log
    ? (Math.log10(v) - Math.log10(axis.min)) / (Math.log10(axis.max) - Math.log10(axis.min))
    : (v - axis.min) / (axis.max - axis.min);
  return Math.max(0, Math.min(100, t * 100));
}

const COMPARE_QS: { prompt: string; answer: FamilyId; why: string }[] = [
  {
    prompt: "Highest specific stiffness — E/ρ at the family's best edge?",
    answer: "composite",
    why: "CFRP along the fiber: 140/1.55 ≈ 90 GPa per g/cm³. The metals sit near 25. The composite wins by 3.5× — in one direction only.",
  },
  {
    prompt: "Which family is still in service at 1200°C continuous?",
    answer: "ceramic",
    why: "Only the ceramic envelope reaches past 1000°C. The composite's matrix is done by ~250°C, ordinary metals creep by ~450°C, polymers are long gone.",
  },
  {
    prompt: "Which two families overlap most on raw stiffness?",
    answer: "metal",
    why: "Glass at ~70 GPa is as stiff as aluminum at ~69 GPa. Stiffness alone barely separates metals from ceramics — temperature ceiling and toughness do. (Either of the pair counts here.)",
  },
];

export function FamCompareBench() {
  const [axis, setAxis] = useState<AxisKey>("modulus");
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<FamilyId | null>(null);
  const [score, setScore] = useState(0);
  const done = qi >= COMPARE_QS.length;
  const q = COMPARE_QS[qi];
  const a = AXES[axis];
  // Q3 accepts metal or ceramic; grade accordingly.
  const correctFor = (fam: FamilyId, idx: number) =>
    idx === 2 ? fam === "metal" || fam === "ceramic" : fam === COMPARE_QS[idx].answer;

  return (
    <BenchShell
      prompt="Put the four family envelopes on one axis at a time. || Find where the metals tie, where the ceramic stands alone, and where the composite runs away. || Then answer the three questions — each one is decided by an envelope, not a brand."
      note="Envelopes are best-edge: each family shown at its most flattering. Strength for ceramics is flaw-limited tensile; composites are plotted along the fiber."
      controls={
        <Segmented
          label="Axis"
          value={axis}
          onChange={setAxis}
          options={(Object.keys(AXES) as AxisKey[]).map((k) => ({
            value: k,
            label: `${AXES[k].label} (${AXES[k].unit})`,
          }))}
        />
      }
    >
      <div className="mb-6 flex flex-col gap-3">
        {FAMILIES.map((f) => {
          const [lo, hi] = a.get(f);
          const left = axisPos(a, lo);
          const width = Math.max(2, axisPos(a, hi) - left);
          return (
            <div key={f}>
              <div className="mb-1 flex items-baseline justify-between text-sm">
                <span className="text-well-fg">{FAMILY_LABEL[f]}</span>
                <span className="tabular-nums text-well-dim">
                  {lo}–{hi} {a.unit}
                </span>
              </div>
              <div className="relative h-3 rounded-full bg-white/10">
                <div
                  className="absolute top-0 h-3 rounded-full bg-well-fg/80"
                  style={{ left: `${left}%`, width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="rounded-lg ring-1 ring-white/15 px-4 py-4">
        {done ? (
          <div>
            <p className="text-sm text-well-fg">
              {score}/3. {score === 3 ? "Every answer came from an envelope." : "Re-read the envelopes — the answers are all on the bars above."}
            </p>
            <div className="mt-3">
              <WellButton
                onClick={() => {
                  setQi(0);
                  setPicked(null);
                  setScore(0);
                }}
              >
                Run it again
              </WellButton>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm font-medium text-well-fg">{q.prompt}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {FAMILIES.map((f) => (
                <button
                  key={f}
                  type="button"
                  disabled={picked !== null}
                  onClick={() => {
                    setPicked(f);
                    if (correctFor(f, qi)) setScore((s) => s + 1);
                  }}
                  className={cn(
                    "min-h-11 rounded-lg px-3 text-sm",
                    picked === null && "text-well-fg ring-1 ring-white/25",
                    picked !== null && correctFor(f, qi) && "bg-well-fg text-well",
                    picked === f && !correctFor(f, qi) && "text-well-fg ring-1 ring-red-400/60",
                    picked !== null && picked !== f && !correctFor(f, qi) && "text-well-dim ring-1 ring-white/10",
                  )}
                >
                  {FAMILY_LABEL[f]}
                </button>
              ))}
            </div>
            {picked !== null && (
              <div className="mt-3">
                <p className="text-sm leading-relaxed text-well-dim">{q.why}</p>
                <div className="mt-3">
                  <WellButton
                    onClick={() => {
                      setQi((i) => i + 1);
                      setPicked(null);
                    }}
                  >
                    {qi + 1 === COMPARE_QS.length ? "Finish" : "Next question"}
                  </WellButton>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </BenchShell>
  );
}

const OVER_TEMP_DEATH: Record<FamilyId, string> = {
  metal: "Creep regime — sustained load flows (onset ≈ 0.4 × T_melt).",
  ceramic: "Past the service ceiling — grain boundaries soften; thermal shock risk extreme.",
  polymer: "Through the glass transition — chains unlock, modulus collapses.",
  composite: "Matrix degrades — the fiber is fine, the glue is not.",
};

export function TempLimitBench() {
  const [temp, setTemp] = useState(20);
  const alive = FAMILIES.filter((f) => temp <= PROFILES[f].serviceTemp[1]);

  return (
    <BenchShell
      prompt="Drag the service temperature from −50°C to 1600°C and watch families die. || Note the temperature and the mechanism of each death — softening, creep, matrix loss. || Decide which family you would trust at 900°C continuous, and name what would still kill it."
      note="Continuous-service ceilings. Short excursions buy a little room; sustained load buys none. Ceramics also demand slow temperature changes — the slider does not model shock."
      controls={
        <Slider
          label="Service temperature"
          min={-50}
          max={1600}
          step={10}
          value={temp}
          display={`${temp}°C`}
          onChange={setTemp}
        />
      }
    >
      <Readouts
        items={[
          { label: "Families in service", value: `${alive.length} / 4` },
          {
            label: "At 900°C",
            value: FAMILIES.filter((f) => 900 <= PROFILES[f].serviceTemp[1])
              .map((f) => FAMILY_LABEL[f])
              .join(", "),
          },
        ]}
      />
      <div className="flex flex-col gap-2">
        {FAMILIES.map((f) => {
          const p = PROFILES[f];
          const ok = temp <= p.serviceTemp[1];
          return (
            <div
              key={f}
              className={cn("rounded-lg px-3 py-3 ring-1", ok ? "ring-white/20" : "ring-red-400/40 opacity-80")}
            >
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-medium text-well-fg">{FAMILY_LABEL[f]}</span>
                <span className={cn("text-sm", ok ? "text-well-dim" : "text-red-300")}>
                  {ok ? `in service (ceiling ${p.serviceTemp[1]}°C)` : "FAILED"}
                </span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-well-dim">
                {ok ? p.tempStory : OVER_TEMP_DEATH[f]}
              </p>
            </div>
          );
        })}
      </div>
    </BenchShell>
  );
}

type BriefConstraint = { key: string; label: string; patch: Constraints };

type Brief = {
  id: string;
  title: string;
  story: string;
  constraints: BriefConstraint[];
  challenges: { prompt: string; options: string[]; answer: number; why: string }[];
  debrief: string;
};

const BRIEFS: Brief[] = [
  {
    id: "hot-bracket",
    title: "Exhaust bracket",
    story:
      "A bracket holds 50 MPa at 900°C continuous, in air, bolted to a steel frame. No coating allowed — the coating shop is the bottleneck.",
    constraints: [
      { key: "temp", label: "≥ 900°C continuous", patch: { minServiceTemp: 900 } },
      { key: "strength", label: "≥ 50 MPa at temperature", patch: { minStrength: 50 } },
      { key: "air", label: "Survive air, uncoated", patch: { corrosion: true } },
    ],
    challenges: [
      {
        prompt: "The bracket bolts to a steel frame. Steel expands ~12×10⁻⁶/K, alumina ~8×10⁻⁶/K. You…",
        options: [
          "Bolt it rigid — stiffness is stiffness",
          "Use slotted holes / compliant mounts",
          "Make the bracket from steel instead",
          "Ignore it — 900°C is steady state",
        ],
        answer: 1,
        why: "Hundreds of degrees of differential expansion shear rigid joints. Compliance absorbs the mismatch; rigidity cracks the ceramic at the bolt.",
      },
      {
        prompt: "The drawing calls for a threaded hole in the bracket. You…",
        options: [
          "Cut threads in the ceramic",
          "Clamp the part or use a captured metal insert",
          "Threads are fine if you cut them slowly",
          "Switch to a polymer and accept the temperature",
        ],
        answer: 1,
        why: "Ceramics don't take threads — thread roots are stress concentrations, and the flaw they invite is the one that kills the part. Put the thread in metal; let the ceramic be clamped.",
      },
    ],
    debrief:
      "Temperature did the deciding: at their honest best edges, metals creep, polymers are gone, composites lose their matrix. The ceramic wins and charges brittleness — so the design pays with compliant mounts, generous radii, and no threads.",
  },
  {
    id: "light-panel",
    title: "Drone arm panel",
    story:
      "A drone arm panel is bending-stiffness driven with a 200 g mass budget, at room temperature. Load direction is known and constant. Cost matters, but mass matters more.",
    constraints: [
      { key: "mass", label: "Density ≤ 2.0 g/cm³", patch: { maxDensity: 2.0 } },
      { key: "stiff", label: "Stiffness ≥ 50 GPa", patch: { minModulus: 50 } },
      { key: "room", label: "Room-temperature service", patch: { minServiceTemp: 25 } },
    ],
    challenges: [
      {
        prompt: "The load direction is known and constant. The composite's anisotropy is…",
        options: [
          "A disqualifier — anisotropy is always bad",
          "An advantage — aim the fibers at the load",
          "Irrelevant to the decision",
          "A reason to pick aluminum instead",
        ],
        answer: 1,
        why: "Known load direction turns anisotropy from a risk into a tool: align the fibers with the bending axis and the weak direction never gets loaded. Unknown direction would be a different story.",
      },
      {
        prompt: "CFRP costs ~10× aluminum per kg, but the panel needs ~1/4 the mass. The honest cost comparison is…",
        options: [
          "Per kg — CFRP loses",
          "Per finished part at equal stiffness",
          "Per cubic meter of material",
          "Cost is irrelevant for drones",
        ],
        answer: 1,
        why: "Tradeoffs rank survivors on the finished part. A quarter of the mass at ten times the $/kg is 2.5× the material cost — which the mass budget may still justify. Per-kg pricing mis-screens composites.",
      },
    ],
    debrief:
      "The mass screen kills the metals honestly (even aluminum's best edge is 2.7 g/cm³); the stiffness screen kills the polymers. Composite stands alone — and its price is directionality plus cost, both manageable here because the load direction is known.",
  },
  {
    id: "salt-fastener",
    title: "Saltwater fastener",
    story:
      "A cleat bolt on a saltwater dock: 300 MPa, no coating allowed, must take threads and survive impact tightening. Off-the-shelf, this week.",
    constraints: [
      { key: "salt", label: "Survive salt water, uncoated", patch: { corrosion: true } },
      { key: "load", label: "≥ 300 MPa", patch: { minStrength: 300 } },
    ],
    challenges: [
      {
        prompt: "The written screens leave ceramic and composite standing — but neither takes threads or impact well. You…",
        options: [
          "Ship the ceramic bolt — it passed the screens",
          "State the missing screens (threads, toughness), then relax “uncoated” to admit stainless or titanium",
          "Drop the strength to 50 MPa and use nylon",
          "Use a bigger ceramic bolt",
        ],
        answer: 1,
        why: "The written screens were incomplete: threads and impact are real constraints. Stated fully, no generic family stands — so the engineering move is to renegotiate a screen. Relaxing “uncoated” admits passivating alloys. That renegotiation gets a signature, not a shrug.",
      },
      {
        prompt: "You pair a stainless bolt with an aluminum cleat in salt water. You get…",
        options: [
          "No issue — both are metals",
          "Galvanic corrosion — the aluminum becomes the anode",
          "The stainless rusts first",
          "Galvanic series don't apply in salt water",
        ],
        answer: 1,
        why: "Dissimilar metals in an electrolyte make a battery, and the less noble metal — aluminum — corrodes faster. Isolation or matched nobility is part of the environment constraint the brief didn't write down.",
      },
    ],
    debrief:
      "This brief is the lesson: the first screen set lies by omission. Ceramic and composite survive the written constraints and die on the unwritten ones. The deliverable is not a family — it is a renegotiated constraint: allow a passivating metal, and say so in writing.",
  },
];

const DECISION_KEY = "ff:famdecision-w18";

const DECISION_RUBRIC = [
  "Names the winning family for each brief — or the renegotiated answer for the fastener.",
  "Names the hard screen that killed the strongest competitor in each brief.",
  "States the winner's price: what was sacrificed and how the design compensates.",
  "Names a processing or environment constraint considered (threads, galvanic, expansion, cost per part).",
  "Says what would change the decision — which relaxed constraint flips the winner.",
];

export function FamDecisionBench() {
  const [briefId, setBriefId] = useState(BRIEFS[0].id);
  const brief = BRIEFS.find((b) => b.id === briefId) ?? BRIEFS[0];
  const [onKeys, setOnKeys] = useState<string[]>(() => brief.constraints.map((c) => c.key));
  const [picked, setPicked] = useState<FamilyId | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [memo, setMemo] = useState(() => {
    try {
      return localStorage.getItem(DECISION_KEY) ?? "";
    } catch {
      return "";
    }
  });
  const [rubric, setRubric] = useState<boolean[]>(() => DECISION_RUBRIC.map(() => false));

  useEffect(() => {
    setOnKeys(brief.constraints.map((c) => c.key));
    setPicked(null);
    setAnswers({});
  }, [brief]);

  useEffect(() => {
    try {
      localStorage.setItem(DECISION_KEY, memo);
    } catch {
      /* private browsing: the memo simply does not persist */
    }
  }, [memo]);

  const activePatch: Constraints = brief.constraints
    .filter((c) => onKeys.includes(c.key))
    .reduce<Constraints>((acc, c) => ({ ...acc, ...c.patch }), {});
  const results = screenFamilies(activePatch);
  const words = memo.trim() === "" ? 0 : memo.trim().split(/\s+/).length;

  const toggle = (key: string) =>
    setOnKeys((ks) => (ks.includes(key) ? ks.filter((k) => k !== key) : [...ks, key]));

  return (
    <BenchShell
      prompt="Take three constrained briefs. || Apply the hard screens — toggle a constraint off and watch a dead family walk again — pick the survivor, and survive its two challenges. || Then write the decision memo: winner, the demand that forced it, and the price, in your own words."
      note="The screener judges families at their best envelope edge. If you disagree with a kill, say which constraint you would renegotiate — that is the engineering decision. The memo saves in this browser as you type."
      controls={
        <>
          <Segmented
            label="Brief"
            value={briefId}
            onChange={setBriefId}
            options={BRIEFS.map((b) => ({ value: b.id, label: b.title }))}
          />
          <div className="sm:col-span-2">
            <div className="mb-2 text-sm text-well-dim">Hard screens — toggle to test each kill</div>
            <div className="flex flex-col gap-2">
              {brief.constraints.map((c) => (
                <label key={c.key} className="flex cursor-pointer items-center gap-3 text-sm text-well-fg">
                  <input
                    type="checkbox"
                    className="h-5 w-5 accent-white"
                    checked={onKeys.includes(c.key)}
                    onChange={() => toggle(c.key)}
                  />
                  {c.label}
                </label>
              ))}
            </div>
          </div>
        </>
      }
    >
      <p className="mb-4 text-sm leading-relaxed text-well-fg">{brief.story}</p>
      <div className="mb-5 flex flex-col gap-2">
        {results.map((r) => (
          <div key={r.family} className={cn("rounded-lg px-3 py-2 ring-1", r.passes ? "ring-white/20" : "ring-red-400/40 opacity-80")}>
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-medium text-well-fg">{FAMILY_LABEL[r.family]}</span>
              <span className={cn("text-sm", r.passes ? "text-well-dim" : "text-red-300")}>
                {r.passes ? "survives" : "screened out"}
              </span>
            </div>
            {!r.passes && (
              <ul className="mt-1 list-disc pl-5 text-sm leading-relaxed text-well-dim">
                {r.failedOn.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
      <div className="mb-5">
        <div className="mb-2 text-sm text-well-dim">Defend a survivor — pick the family you would specify</div>
        <div className="grid grid-cols-2 gap-2">
          {FAMILIES.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setPicked(f)}
              className={cn(
                "min-h-11 rounded-lg px-3 text-sm",
                picked === f ? "bg-well-fg text-well" : "text-well-fg ring-1 ring-white/25",
              )}
            >
              {FAMILY_LABEL[f]}
            </button>
          ))}
        </div>
      </div>
      {picked !== null && (
        <div className="mb-5 flex flex-col gap-4">
          {brief.challenges.map((ch, ci) => {
            const answered = answers[`${brief.id}:${ci}`];
            return (
              <div key={ch.prompt} className="rounded-lg px-4 py-3 ring-1 ring-white/15">
                <p className="text-sm font-medium text-well-fg">{ch.prompt}</p>
                <div className="mt-2 grid grid-cols-1 gap-2">
                  {ch.options.map((opt, oi) => (
                    <button
                      key={opt}
                      type="button"
                      disabled={answered !== undefined}
                      onClick={() => setAnswers((a) => ({ ...a, [`${brief.id}:${ci}`]: oi }))}
                      className={cn(
                        "min-h-11 rounded-lg px-3 text-left text-sm",
                        answered === undefined && "text-well-fg ring-1 ring-white/25",
                        answered === oi && oi === ch.answer && "bg-well-fg text-well",
                        answered === oi && oi !== ch.answer && "text-well-fg ring-1 ring-red-400/60",
                        answered !== undefined && oi === ch.answer && answered !== oi && "text-well-fg ring-1 ring-white/40",
                        answered !== undefined && answered !== oi && oi !== ch.answer && "text-well-dim ring-1 ring-white/10",
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {answered !== undefined && (
                  <p className="mt-2 text-sm leading-relaxed text-well-dim">{ch.why}</p>
                )}
              </div>
            );
          })}
          <p className="text-sm leading-relaxed text-well-dim">{brief.debrief}</p>
        </div>
      )}
      <div className="rounded-lg px-4 py-4 ring-1 ring-white/15">
        <div className="mb-2 flex items-baseline justify-between">
          <div className="text-sm font-medium text-well-fg">Decision memo — the evidence</div>
          <div className="text-sm tabular-nums text-well-dim">{words} words</div>
        </div>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={6}
          placeholder="Winner, the demand that forced it, and the price — for all three briefs. Name the screen that killed the strongest competitor each time."
          className="w-full rounded-lg bg-white/5 px-3 py-2 text-sm leading-relaxed text-well-fg ring-1 ring-white/20 placeholder:text-well-dim/60"
        />
        <div className="mt-3">
          <div className="mb-2 text-sm text-well-dim">Rubric — check what the memo earns</div>
          <div className="flex flex-col gap-2">
            {DECISION_RUBRIC.map((item, i) => (
              <label key={item} className="flex cursor-pointer items-start gap-3 text-sm text-well-fg">
                <input
                  type="checkbox"
                  className="mt-0.5 h-5 w-5 shrink-0 accent-white"
                  checked={rubric[i]}
                  onChange={() =>
                    setRubric((r) => r.map((v, j) => (j === i ? !v : v)))
                  }
                />
                {item}
              </label>
            ))}
          </div>
          <p className="mt-3 text-sm text-well-dim">
            {rubric.filter(Boolean).length}/{DECISION_RUBRIC.length} rubric boxes checked. Check a box
            only when a stranger could verify it from your text alone.
          </p>
        </div>
      </div>
    </BenchShell>
  );
}

// ---------------------------------------------------------------------------
// Materials 101, Week 19 — Selection, corrosion & sustainability
// ---------------------------------------------------------------------------

const SHORTLIST_KEY = "ff:shortlist-w19";

const briefOptions: { value: IndexKind; label: string }[] = [
  { value: "tie-stiffness", label: "Tie · stiffness" },
  { value: "beam-strength", label: "Beam · strength" },
  { value: "plate-stiffness", label: "Panel · stiffness" },
];

const envOptions: { value: Environment; label: string }[] = [
  { value: "dry", label: "Dry indoors" },
  { value: "humid", label: "Humid air" },
  { value: "splash", label: "Salt splash" },
  { value: "immersed", label: "Immersed seawater" },
];

/**
 * The evidence task for Week 19: an Ashby-style shortlist. Set hard
 * screens, watch candidates die with their reasons named, rank the
 * survivors by the brief's index, then run the weighted trade study and
 * write the one-paragraph verdict.
 */
export function ShortlistBench() {
  const [brief, setBrief] = useState<IndexKind>("tie-stiffness");
  const [minStrength, setMinStrength] = useState(100);
  const [maxDensity, setMaxDensity] = useState(9);
  const [logCost, setLogCost] = useState(Math.log10(100));
  const [minCorrosion, setMinCorrosion] = useState(1);
  const [logEmbodied, setLogEmbodied] = useState(Math.log10(600));
  const [wPerf, setWPerf] = useState(50);
  const [wCost, setWCost] = useState(25);
  const [wCarbon, setWCarbon] = useState(25);
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [note, setNote] = useState(() => {
    try {
      return localStorage.getItem(SHORTLIST_KEY) ?? "";
    } catch {
      return "";
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(SHORTLIST_KEY, note);
    } catch {
      /* private browsing: the note simply does not persist */
    }
  }, [note]);

  const maxCost = 10 ** logCost;
  const maxEmbodied = 10 ** logEmbodied;

  const { pass, fail } = useMemo(
    () =>
      screenMaterials(selMaterials, {
        minStrength,
        maxDensity,
        maxCost,
        minCorrosion,
        maxEmbodied,
      }),
    [minStrength, maxDensity, maxCost, minCorrosion, maxEmbodied],
  );
  const ranked = useMemo(() => rankMaterials(pass, brief), [pass, brief]);
  const trade = useMemo(
    () =>
      tradeStudy(pass, brief, {
        performance: wPerf,
        cost: wCost,
        carbon: wCarbon,
      }),
    [pass, brief, wPerf, wCost, wCarbon],
  );
  const topIndex = ranked.length > 0 ? propertyIndex(ranked[0], brief) : 1;
  const words = note.trim() === "" ? 0 : note.trim().split(/\s+/).length;
  const winner = trade.find((t) => t.mat.id === winnerId) ?? trade[0];

  return (
    <BenchShell
      prompt="Set the brief, then the hard screens. || Survivors rank by the index the brief derives — the dead are listed with their cause of death. || The trade study weighs performance, cost, and carbon; your evidence is the written verdict naming the winner and every reject."
      note="Teaching values, not datasheet values. A real shortlist ends at a real supplier's datasheet."
      controls={
        <>
          <Segmented label="Design brief" value={brief} onChange={setBrief} options={briefOptions} />
          <Slider
            label="Minimum strength"
            min={10}
            max={800}
            step={10}
            value={minStrength}
            display={`${minStrength} MPa`}
            onChange={setMinStrength}
          />
          <Slider
            label="Maximum density"
            min={0.4}
            max={9}
            step={0.1}
            value={maxDensity}
            display={`${fmt(maxDensity, 1)} g/cm³`}
            onChange={setMaxDensity}
          />
          <Slider
            label="Maximum cost"
            min={0}
            max={2}
            step={0.01}
            value={logCost}
            display={`$${fmt(maxCost, maxCost < 10 ? 1 : 0)}/kg`}
            onChange={setLogCost}
          />
          <Slider
            label="Minimum corrosion rating"
            min={1}
            max={5}
            step={1}
            value={minCorrosion}
            display={`${minCorrosion} / 5`}
            onChange={setMinCorrosion}
          />
          <Slider
            label="Maximum embodied energy"
            min={1}
            max={Math.log10(600)}
            step={0.01}
            value={logEmbodied}
            display={`${fmt(maxEmbodied, 0)} MJ/kg`}
            onChange={setLogEmbodied}
          />
        </>
      }
    >
      <p className="text-sm text-well-dim">
        {indexInfo[brief].formula} — {indexInfo[brief].blurb}
      </p>

      <h4 className="mt-4 text-sm font-semibold text-well-fg">
        Survivors ({ranked.length}) — ranked by index
      </h4>
      {ranked.length === 0 ? (
        <p className="mt-2 text-sm leading-relaxed text-well-fg">
          Nothing clears the screens. That is a result, not an error: loosen one constraint and
          name the design freedom it costs you.
        </p>
      ) : (
        <div className="mt-2 space-y-2">
          {ranked.map((m) => {
            const v = propertyIndex(m, brief);
            return (
              <div key={m.id} className="text-sm">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-well-fg">{m.name}</span>
                  <span className="text-well-dim">{fmt(v, 1)}</span>
                </div>
                <div className="mt-1 h-2 rounded bg-white/10">
                  <div
                    className="h-2 rounded bg-well-fg/70"
                    style={{ width: `${Math.max(2, (v / topIndex) * 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {fail.length > 0 && (
        <>
          <h4 className="mt-4 text-sm font-semibold text-well-fg">
            Rejected ({fail.length}) — cause of death
          </h4>
          <ul className="mt-2 space-y-1 text-sm text-well-dim">
            {fail.map((f) => (
              <li key={f.mat.id}>
                <span className="text-well-fg">{f.mat.name}:</span> {f.reasons.join("; ")}
              </li>
            ))}
          </ul>
        </>
      )}

      {trade.length > 0 && (
        <>
          <h4 className="mt-4 text-sm font-semibold text-well-fg">Trade study</h4>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Slider
              label="Weight: performance"
              min={0}
              max={100}
              step={5}
              value={wPerf}
              display={`${wPerf}%`}
              onChange={setWPerf}
            />
            <Slider
              label="Weight: cost"
              min={0}
              max={100}
              step={5}
              value={wCost}
              display={`${wCost}%`}
              onChange={setWCost}
            />
            <Slider
              label="Weight: carbon"
              min={0}
              max={100}
              step={5}
              value={wCarbon}
              display={`${wCarbon}%`}
              onChange={setWCarbon}
            />
          </div>
          <div className="mt-2 space-y-2">
            {trade.slice(0, 3).map((t) => (
              <button
                key={t.mat.id}
                type="button"
                onClick={() => setWinnerId(t.mat.id)}
                className={cn(
                  "w-full rounded-lg px-3 py-2 text-left text-sm ring-1 ring-white/20 transition-transform duration-150 ease-out active:scale-[0.98]",
                  winner?.mat.id === t.mat.id && "ring-2 ring-well-fg",
                )}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-medium text-well-fg">{t.mat.name}</span>
                  <span className="text-well-dim">score {fmt(t.score, 2)}</span>
                </div>
                <div className="mt-1 grid grid-cols-3 gap-2 text-xs text-well-dim">
                  {(
                    [
                      ["performance", t.perfNorm],
                      ["cost", t.costNorm],
                      ["carbon", t.carbonNorm],
                    ] as const
                  ).map(([label, v]) => (
                    <div key={label}>
                      <div className="mb-0.5 flex justify-between">
                        <span>{label}</span>
                        <span>{fmt(v, 2)}</span>
                      </div>
                      <div className="h-1.5 rounded bg-white/10">
                        <div
                          className="h-1.5 rounded bg-well-fg/60"
                          style={{ width: `${Math.max(2, v * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-1 text-xs text-well-dim">{t.mat.note}</p>
              </button>
            ))}
          </div>
          <div className="mt-3">
            <label
              htmlFor="shortlist-note"
              className="mb-1 block text-sm font-medium text-well-fg"
            >
              Your verdict ({words} words) — winner, and why each reject died
            </label>
            <textarea
              id="shortlist-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              placeholder="e.g. 6061 aluminum wins the tie-rod: it clears every screen, ranks within 5% of steel on E/ρ, and survives outdoors uncoated. CFRP died on cost ($80/kg vs $10 ceiling); bare steel died on corrosion…"
              className="w-full rounded-lg bg-white/5 p-3 text-sm leading-relaxed text-well-fg ring-1 ring-white/20 placeholder:text-well-dim/60"
            />
          </div>
        </>
      )}
    </BenchShell>
  );
}

/**
 * Corrosion compatibility checker: couple two metals, pick the
 * environment, set the area ratio — then call the risk, name the anode,
 * and read the mechanism that matches the morphology.
 */
export function CorroCheckBench() {
  const [metalA, setMetalA] = useState("aluminum");
  const [metalB, setMetalB] = useState("steel");
  const [env, setEnv] = useState<Environment>("splash");
  const [anodeSmall, setAnodeSmall] = useState(true);
  const [modeId, setModeId] = useState("galvanic");

  const a = galvanicSeries.find((m) => m.id === metalA) ?? galvanicSeries[0];
  const b = galvanicSeries.find((m) => m.id === metalB) ?? galvanicSeries[0];
  const verdict = useMemo(() => galvanicRisk(a, b, env, anodeSmall), [a, b, env, anodeSmall]);
  const mode = corrosionModes.find((m) => m.id === modeId) ?? corrosionModes[0];
  const metalOptions = galvanicSeries.map((m) => ({ value: m.id, label: m.name }));

  const levelTone: Record<string, string> = {
    negligible: "text-well-dim",
    low: "text-well-fg",
    moderate: "text-well-fg",
    high: "text-well-fg",
    severe: "text-well-fg",
  };

  return (
    <BenchShell
      prompt="Couple two metals and pick the environment. || The verdict names the anode, the driving voltage, and the risk — then match a mechanism to the morphology. || Your call must name the protection that breaks the cell, not just the risk."
      note="Seawater potentials are approximate teaching values. Real work measures potentials in the actual electrolyte."
      controls={
        <>
          <Segmented label="Metal A" value={metalA} onChange={setMetalA} options={metalOptions} />
          <Segmented label="Metal B" value={metalB} onChange={setMetalB} options={metalOptions} />
          <Segmented label="Environment" value={env} onChange={setEnv} options={envOptions} />
          <div className="sm:col-span-2">
            <WellButton onClick={() => setAnodeSmall((v) => !v)}>
              {anodeSmall ? "Anode area: SMALL (worst case)" : "Anode area: large"}
            </WellButton>
          </div>
        </>
      }
    >
      <Readouts
        items={[
          { label: "Anode (dissolves)", value: verdict.anode.name },
          { label: "Cathode", value: verdict.cathode.name },
          { label: "Driving ΔV", value: `${fmt(verdict.dV, 2)} V` },
          { label: "Risk", value: verdict.level },
        ]}
      />
      <p className={cn("mt-3 text-sm leading-relaxed", levelTone[verdict.level])}>
        {verdict.advice}
      </p>

      <h4 className="mt-5 text-sm font-semibold text-well-fg">Mechanism lookup</h4>
      <div className="mt-2">
        <Segmented
          label="Observed morphology"
          value={modeId}
          onChange={setModeId}
          options={corrosionModes.map((m) => ({ value: m.id, label: m.name }))}
        />
      </div>
      <div className="mt-3 space-y-2 text-sm leading-relaxed">
        <p>
          <span className="font-medium text-well-fg">Looks like: </span>
          <span className="text-well-dim">{mode.morphology}</span>
        </p>
        <p>
          <span className="font-medium text-well-fg">Driven by: </span>
          <span className="text-well-dim">{mode.driver}</span>
        </p>
        <p>
          <span className="font-medium text-well-fg">Stop it by: </span>
          <span className="text-well-dim">{mode.protection}</span>
        </p>
      </div>
    </BenchShell>
  );
}

// ---------------------------------------------------------------------------
// Week 20 — Materials synthesis (scout/materials-w20)
// ---------------------------------------------------------------------------

const inputCls =
  "w-full rounded-lg bg-white/5 px-3 py-2 text-sm text-well-fg ring-1 ring-white/25 placeholder:text-well-dim/60";

// --- MatLedgerBench: the assumption ledger for materials claims --------------

type LedgerProvenance = "assumed" | "structure" | "processing" | "measured";
type MatLedgerRow = {
  id: number;
  assumption: string;
  provenance: LedgerProvenance;
  breaksIf: string;
  limitTest: string;
};
type MatLedgerScenario = "spar" | "temper" | "fatigue";

const MAT_LEDGER_SCENARIOS: Record<MatLedgerScenario, { title: string; brief: string }> = {
  spar: {
    title: "Spar cap material",
    brief: "Pick the 100 g glider's wing spar material and defend the choice with a ledger.",
  },
  temper: {
    title: "Heat-treatment route",
    brief: "Take 7075 from solution treatment to the T6 temper; ledger every step's claim.",
  },
  fatigue: {
    title: "Root-joint fatigue life",
    brief: "Gust cycles against the endurance limit — ledger what the 'infinite life' verdict rests on.",
  },
};

function seedMatLedgerRows(s: MatLedgerScenario): MatLedgerRow[] {
  if (s === "spar")
    return [
      {
        id: 1,
        assumption: "Gust factor 2.5 g bounds the worst bending load",
        provenance: "assumed",
        breaksIf: "A harder gust overloads the spar — stress scales linearly with g",
        limitTest: "g → 0 must give σ → 0",
      },
      {
        id: 2,
        assumption: "Balsa E = 3 GPa (handbook value)",
        provenance: "assumed",
        breaksIf: "A light stick can be 2× softer; the 11 mm deflection doubles",
        limitTest: "E → ∞ must drive δ → 0",
      },
      {
        id: 3,
        assumption: "Uniform lift distribution over the wing panel",
        provenance: "assumed",
        breaksIf: "Elliptical loading shifts the root moment up ~15%",
        limitTest: "span → 0 must give M → 0",
      },
      {
        id: 4,
        assumption: "7075-T6 yields at 505 MPa after the T6 route",
        provenance: "processing",
        breaksIf: "Under-aging or over-aging leaves strength on the table",
        limitTest: "No aging must recover the annealed ≈ 145 MPa",
      },
    ];
  if (s === "temper")
    return [
      {
        id: 1,
        assumption: "Solution treatment at 480 °C dissolves the Cu fully",
        provenance: "processing",
        breaksIf: "Undissolved Cu never precipitates; strength caps early",
        limitTest: "T below the solvus must leave coarse θ phase",
      },
      {
        id: 2,
        assumption: "The water quench freezes the supersaturation",
        provenance: "processing",
        breaksIf: "A slow quench lets grain-boundary precipitates rob the matrix",
        limitTest: "Quench delay → 0 is the ideal limit",
      },
      {
        id: 3,
        assumption: "Aging 120 °C / 24 h hits peak hardness",
        provenance: "assumed",
        breaksIf: "Over-aging coarsens precipitates and softens the alloy",
        limitTest: "t → ∞ must show softening",
      },
    ];
  return [
    {
      id: 1,
      assumption: "Gust cycles stay below the endurance limit",
      provenance: "structure",
      breaksIf: "Above it, every cycle spends life and Miner's sum climbs",
      limitTest: "Stress → 0 must give effectively infinite life",
    },
    {
      id: 2,
      assumption: "No stress concentration at the root joint",
      provenance: "assumed",
      breaksIf: "A hole or sharp corner multiplies local stress ~3×",
      limitTest: "Kt → 1 must recover the nominal stress",
    },
    {
      id: 3,
      assumption: "Endurance estimate 160 MPa applies to this temper and finish",
      provenance: "assumed",
      breaksIf: "A different temper or a rough surface moves the limit down",
      limitTest: "Polished vs as-machined must differ",
    },
  ];
}

type MatLedgerState = {
  scenario: MatLedgerScenario;
  rows: Record<MatLedgerScenario, MatLedgerRow[]>;
  suspectId: number | null;
  suspectNote: string;
};

const MAT_LEDGER_STORE = "ff:matledger-w20";

function loadMatLedger(): MatLedgerState {
  const fallback: MatLedgerState = {
    scenario: "spar",
    rows: {
      spar: seedMatLedgerRows("spar"),
      temper: seedMatLedgerRows("temper"),
      fatigue: seedMatLedgerRows("fatigue"),
    },
    suspectId: null,
    suspectNote: "",
  };
  try {
    const raw = localStorage.getItem(MAT_LEDGER_STORE);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<MatLedgerState>;
    if (!parsed.rows || !parsed.scenario || !MAT_LEDGER_SCENARIOS[parsed.scenario]) return fallback;
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}

const PROVENANCE_LABEL: Record<LedgerProvenance, string> = {
  assumed: "assumed",
  structure: "structure",
  processing: "processing",
  measured: "measured",
};

export function MatLedgerBench() {
  const [state, setState] = useState<MatLedgerState>(loadMatLedger);
  useEffect(() => {
    try {
      localStorage.setItem(MAT_LEDGER_STORE, JSON.stringify(state));
    } catch {
      /* private mode — the ledger simply won't persist */
    }
  }, [state]);

  const rows = state.rows[state.scenario];
  const patchRow = (id: number, patch: Partial<MatLedgerRow>) =>
    setState((s) => ({
      ...s,
      rows: { ...s.rows, [s.scenario]: s.rows[s.scenario].map((r) => (r.id === id ? { ...r, ...patch } : r)) },
    }));
  const addRow = () =>
    setState((s) => {
      const cur = s.rows[s.scenario];
      const nextId = cur.reduce((m, r) => Math.max(m, r.id), 0) + 1;
      return {
        ...s,
        rows: { ...s.rows, [s.scenario]: [...cur, { id: nextId, assumption: "", provenance: "assumed", breaksIf: "", limitTest: "" }] },
      };
    });
  const removeRow = (id: number) =>
    setState((s) => ({
      ...s,
      suspectId: s.suspectId === id ? null : s.suspectId,
      rows: { ...s.rows, [s.scenario]: s.rows[s.scenario].filter((r) => r.id !== id) },
    }));

  const complete = rows.filter((r) => r.assumption.trim() && r.breaksIf.trim() && r.limitTest.trim()).length;
  const unmeasured = rows.filter((r) => r.provenance !== "measured").length;

  return (
    <BenchShell
      prompt="Pick a scenario and build its assumption ledger: each claim, whether it traces to structure, processing, measurement — or is merely assumed — what breaks if it is false, and which limiting case would expose it. || Name the assumption most likely to be wrong — that name is the most valuable line on the page."
      note="A number with no provenance is a rumor wearing units. Revisit the ledger after every disagreement between prediction and test: the culprit is usually already listed."
      controls={
        <Segmented
          label="Scenario"
          value={state.scenario}
          onChange={(v) => setState((s) => ({ ...s, scenario: v, suspectId: null }))}
          options={(Object.keys(MAT_LEDGER_SCENARIOS) as MatLedgerScenario[]).map((v) => ({
            value: v,
            label: MAT_LEDGER_SCENARIOS[v].title,
          }))}
        />
      }
    >
      <p className="text-sm text-well-dim">{MAT_LEDGER_SCENARIOS[state.scenario].brief}</p>
      <Readouts
        items={[
          { label: "Ledger completeness", value: rows.length ? `${Math.round((100 * complete) / rows.length)}%` : "—" },
          { label: "Claims not measured", value: `${unmeasured}` },
        ]}
      />
      <div className="mt-4 flex flex-col gap-3">
        {rows.map((row) => (
          <div key={row.id} className="rounded-lg ring-1 ring-white/15 p-3">
            <div className="flex items-start gap-2">
              <input
                className={inputCls}
                placeholder="Claim — e.g. gust factor 2.5 g bounds the load"
                value={row.assumption}
                onChange={(e) => patchRow(row.id, { assumption: e.target.value })}
                aria-label="Assumption"
              />
              <button
                type="button"
                onClick={() => removeRow(row.id)}
                className="shrink-0 rounded-lg px-2 py-2 text-sm text-well-dim ring-1 ring-white/25"
                aria-label="Remove assumption"
              >
                ×
              </button>
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              <div className="flex gap-1" role="radiogroup" aria-label="Provenance">
                {(Object.keys(PROVENANCE_LABEL) as LedgerProvenance[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    role="radio"
                    aria-checked={row.provenance === st}
                    onClick={() => patchRow(row.id, { provenance: st })}
                    className={
                      "min-h-9 flex-1 rounded-lg px-2 py-1 text-xs " +
                      (row.provenance === st ? "bg-well-fg text-well" : "text-well-fg ring-1 ring-white/25")
                    }
                  >
                    {PROVENANCE_LABEL[st]}
                  </button>
                ))}
              </div>
              <input
                className={inputCls}
                placeholder="Breaks if…"
                value={row.breaksIf}
                onChange={(e) => patchRow(row.id, { breaksIf: e.target.value })}
                aria-label="What breaks if false"
              />
              <input
                className={inputCls}
                placeholder="Limit that exposes it…"
                value={row.limitTest}
                onChange={(e) => patchRow(row.id, { limitTest: e.target.value })}
                aria-label="Limiting case"
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3">
        <WellButton onClick={addRow}>Add assumption</WellButton>
      </div>
      <div className="mt-4">
        <div className="mb-2 text-sm text-well-dim">Most likely to be wrong</div>
        <div className="grid gap-2 sm:grid-cols-2">
          <select
            className={inputCls}
            value={state.suspectId ?? ""}
            onChange={(e) =>
              setState((s) => ({ ...s, suspectId: e.target.value ? Number(e.target.value) : null }))
            }
            aria-label="Most likely wrong assumption"
          >
            <option value="">Pick one…</option>
            {rows
              .filter((r) => r.assumption.trim())
              .map((r) => (
                <option key={r.id} value={r.id}>
                  {r.assumption.slice(0, 60)}
                </option>
              ))}
          </select>
          <input
            className={inputCls}
            placeholder="Why this one? One sentence."
            value={state.suspectNote}
            onChange={(e) => setState((s) => ({ ...s, suspectNote: e.target.value }))}
            aria-label="Why this assumption is most likely wrong"
          />
        </div>
        {unmeasured > 0 && (
          <p className="mt-2 text-sm text-well-dim">
            {unmeasured} claim{unmeasured === 1 ? " is" : "s are"} not traced to a measurement — those are the
            entries an autopsy will read first.
          </p>
        )}
      </div>
    </BenchShell>
  );
}

// --- SparLabBench: Glider Lab II — locked predictions vs the chain ---------

const SPARLAB_STORE = "ff:sparlab-w20";

const SPAR_AUTOPSY_SUSPECTS = [
  { value: "uniform", label: "Uniform lift — real lift is closer to elliptical, shifting the root moment" },
  { value: "root", label: "Perfect cantilever root — the fuselage joint flexes and adds deflection" },
  { value: "balsa-e", label: "Balsa E = 3 GPa is a book value — a real stick varies 2–4× with density" },
  { value: "gust", label: "2.5 g gust factor — a guess wearing a number's clothes" },
  { value: "shear", label: "Euler–Bernoulli only — a short deep beam carries shear deflection too" },
];

type SparBinding = "" | "strength" | "stiffness" | "mass";

type SparLabState = {
  predictions: { stress: string; balsaDefl: string; alDefl: string; binding: SparBinding } | null;
  suspect: string;
  note: string;
  filed: boolean;
};

function loadSparLab(): SparLabState {
  const fallback: SparLabState = { predictions: null, suspect: "", note: "", filed: false };
  try {
    const raw = localStorage.getItem(SPARLAB_STORE);
    if (!raw) return fallback;
    return { ...fallback, ...(JSON.parse(raw) as Partial<SparLabState>) };
  } catch {
    return fallback;
  }
}

function withinTol(pred: string, actual: number, tol: number): boolean {
  const v = Number(pred);
  if (!Number.isFinite(v) || actual === 0) return false;
  return Math.abs(v - actual) / Math.abs(actual) <= tol;
}

export function SparLabBench() {
  const [state, setState] = useState<SparLabState>(loadSparLab);
  const [draft, setDraft] = useState({ stress: "", balsaDefl: "", alDefl: "", binding: "" as SparBinding });
  useEffect(() => {
    try {
      localStorage.setItem(SPARLAB_STORE, JSON.stringify(state));
    } catch {
      /* private mode */
    }
  }, [state]);

  const chain = sparChain();
  const balsa = chain.results.find((r) => r.material.id === "balsa")!;
  const al = chain.results.find((r) => r.material.id === "al7075")!;
  const locked = state.predictions !== null;

  const marks = locked
    ? [
        withinTol(state.predictions!.stress, chain.stressMPa, 0.3),
        withinTol(state.predictions!.balsaDefl, balsa.deflectionMm, 0.4),
        withinTol(state.predictions!.alDefl, al.deflectionMm, 0.4),
        state.predictions!.binding === chain.bindingConstraint,
      ]
    : [];
  const hits = marks.filter(Boolean).length;

  const lock = () => {
    if (!draft.stress.trim() || !draft.balsaDefl.trim() || !draft.alDefl.trim() || !draft.binding) return;
    setState((s) => ({ ...s, predictions: { ...draft } }));
  };
  const reset = () => {
    setDraft({ stress: "", balsaDefl: "", alDefl: "", binding: "" });
    setState((s) => ({ ...s, predictions: null, suspect: "", note: "", filed: false }));
  };

  return (
    <BenchShell
      prompt="Glider Lab II: lock your predictions for the reference spar — root bending stress, tip deflection in balsa and in 7075-T6, and which constraint binds. || Then face the chain's numbers and autopsy any disagreement: name the suspect assumption."
      note="Section 4×6 mm, half-span 250 mm, 2.5 g gust on the 100 g glider, uniform lift, deflection limit 5 mm. Locked predictions cannot be edited after reveal — that is the point."
      controls={
        !locked ? (
          <div className="sm:col-span-2">
            <WellButton onClick={lock}>Lock predictions</WellButton>
          </div>
        ) : (
          <div className="sm:col-span-2 flex flex-wrap gap-2">
            <WellButton onClick={reset}>Predict again</WellButton>
          </div>
        )
      }
    >
      <Readouts
        items={[
          { label: "Gust lift", value: `${fmt(chain.liftN, 2)} N` },
          { label: "Root moment", value: `${fmt(chain.momentNm, 3)} N·m` },
          { label: "Deflection limit", value: "5 mm" },
        ]}
      />
      {!locked && (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm text-well-dim">
            Root bending stress (MPa)
            <input
              className={inputCls}
              inputMode="decimal"
              placeholder="e.g. 6.4"
              value={draft.stress}
              onChange={(e) => setDraft((d) => ({ ...d, stress: e.target.value }))}
              aria-label="Predicted root bending stress in MPa"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-well-dim">
            Balsa tip deflection (mm)
            <input
              className={inputCls}
              inputMode="decimal"
              placeholder="e.g. 11"
              value={draft.balsaDefl}
              onChange={(e) => setDraft((d) => ({ ...d, balsaDefl: e.target.value }))}
              aria-label="Predicted balsa tip deflection in mm"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-well-dim">
            Aluminum tip deflection (mm)
            <input
              className={inputCls}
              inputMode="decimal"
              placeholder="e.g. 0.5"
              value={draft.alDefl}
              onChange={(e) => setDraft((d) => ({ ...d, alDefl: e.target.value }))}
              aria-label="Predicted aluminum tip deflection in mm"
            />
          </label>
          <div className="flex flex-col gap-1 text-sm text-well-dim">
            <span>Binding constraint</span>
            <div className="flex gap-1" role="radiogroup" aria-label="Binding constraint">
              {(["strength", "stiffness", "mass"] as const).map((b) => (
                <button
                  key={b}
                  type="button"
                  role="radio"
                  aria-checked={draft.binding === b}
                  onClick={() => setDraft((d) => ({ ...d, binding: b }))}
                  className={
                    "min-h-9 flex-1 rounded-lg px-2 py-1 text-xs " +
                    (draft.binding === b ? "bg-well-fg text-well" : "text-well-fg ring-1 ring-white/25")
                  }
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {locked && (
        <div>
          <Readouts
            items={[
              { label: "Chain stress", value: `${fmt(chain.stressMPa, 2)} MPa` },
              { label: "Balsa δ", value: `${fmt(balsa.deflectionMm, 1)} mm` },
              { label: "Aluminum δ", value: `${fmt(al.deflectionMm, 2)} mm` },
              { label: "Score", value: `${hits} / 4` },
            ]}
          />
          <div className="grid gap-2 text-sm">
            {[
              { label: "Root stress", ok: marks[0], yours: state.predictions!.stress, mine: `${fmt(chain.stressMPa, 2)} MPa` },
              { label: "Balsa deflection", ok: marks[1], yours: state.predictions!.balsaDefl, mine: `${fmt(balsa.deflectionMm, 1)} mm` },
              { label: "Aluminum deflection", ok: marks[2], yours: state.predictions!.alDefl, mine: `${fmt(al.deflectionMm, 2)} mm` },
              { label: "Binding constraint", ok: marks[3], yours: state.predictions!.binding || "—", mine: chain.bindingConstraint },
            ].map((row) => (
              <div key={row.label} className="flex items-baseline justify-between gap-3 rounded-lg p-2 ring-1 ring-white/15">
                <span className="text-well-dim">{row.label}</span>
                <span className="text-well-fg">
                  you: {row.yours} · chain: {row.mine} {row.ok ? "✓" : "✗"}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {chain.results.map((r) => (
              <div key={r.material.id} className="rounded-lg p-3 ring-1 ring-white/15">
                <div className="text-sm font-medium text-well-fg">{r.material.name}</div>
                <div className="mt-1 text-sm text-well-dim">
                  δ {fmt(r.deflectionMm, r.deflectionMm < 1 ? 2 : 1)} mm {r.stiffnessPass ? "· passes" : "· FAILS"} ·
                  mass {fmt(r.massG, 1)} g · strength margin {fmt(r.strengthMargin, 1)}×
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-well-dim">
            The chain's verdict: stiffness binds — balsa, the lightest at {fmt(balsa.massG, 1)} g, fails the 5 mm
            screen, and carbon ({fmt(chain.results[2].massG, 1)} g) beats aluminum ({fmt(al.massG, 1)} g) on mass.
            Strength margins run {fmt(balsa.strengthMargin, 1)}× to {fmt(chain.results[2].strengthMargin, 0)}×:
            nothing is near yielding.
          </p>
          <div className="mt-4">
            <div className="mb-2 text-sm text-well-dim">Disagreement autopsy — name the suspect</div>
            <div className="grid gap-2">
              <select
                className={inputCls}
                value={state.suspect}
                onChange={(e) => setState((s) => ({ ...s, suspect: e.target.value, filed: false }))}
                aria-label="Suspect assumption"
                disabled={state.filed}
              >
                <option value="">Pick the assumption most likely to be wrong…</option>
                {SPAR_AUTOPSY_SUSPECTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <input
                className={inputCls}
                placeholder="What would prove it? One sentence."
                value={state.note}
                onChange={(e) => setState((s) => ({ ...s, note: e.target.value }))}
                aria-label="What would prove the suspect wrong"
                disabled={state.filed}
              />
              {state.filed ? (
                <p className="text-sm text-well-dim">Autopsy filed.</p>
              ) : (
                <div>
                  <WellButton
                    onClick={() => {
                      if (state.suspect && state.note.trim())
                        setState((s) => ({ ...s, filed: true, note: s.note.trim() }));
                    }}
                  >
                    File autopsy
                  </WellButton>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </BenchShell>
  );
}

// --- MatCheckBench: the closed-book mastery check ----------------------------

const MATCHECK_STORE = "ff:matcheck-w20";

const MAT_TOPIC_LABEL: Record<MatMasteryTopic, string> = {
  chain: "Chain",
  failure: "Failure",
  mixed: "Mixed",
};

type MatCheckState = {
  phase: "intro" | "running" | "results";
  answers: (number | null)[];
  corrections: Record<string, string>;
};

function loadMatCheck(): MatCheckState {
  const fallback: MatCheckState = {
    phase: "intro",
    answers: MAT_MASTERY_BANK.map(() => null),
    corrections: {},
  };
  try {
    const raw = localStorage.getItem(MATCHECK_STORE);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<MatCheckState>;
    if (!parsed.answers || parsed.answers.length !== MAT_MASTERY_BANK.length) return fallback;
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}

export function MatCheckBench() {
  const [state, setState] = useState<MatCheckState>(loadMatCheck);
  const [qIndex, setQIndex] = useState(0);
  useEffect(() => {
    try {
      localStorage.setItem(MATCHECK_STORE, JSON.stringify(state));
    } catch {
      /* private mode */
    }
  }, [state]);

  const setAnswer = (qi: number, opt: number) =>
    setState((s) => ({ ...s, answers: s.answers.map((a, i) => (i === qi ? opt : a)) }));

  const correct = state.answers.filter((a, i) => a === MAT_MASTERY_BANK[i].answer).length;
  const pct = masteryPct(correct, MAT_MASTERY_BANK.length);
  const passed = masteryPass(correct, MAT_MASTERY_BANK.length);
  const missed = MAT_MASTERY_BANK.filter((item, i) => state.answers[i] !== item.answer);
  const required = correctionsRequired(missed);
  const filedCount = required.filter((m) => (state.corrections[m.id] ?? "").trim().length > 0).length;
  const gateOpen = passed && filedCount === required.length;

  const start = () =>
    setState((s) => ({ ...s, phase: "running", answers: MAT_MASTERY_BANK.map(() => null) }));
  const retake = () => {
    setQIndex(0);
    setState((s) => ({ ...s, phase: "running", answers: MAT_MASTERY_BANK.map(() => null) }));
  };

  return (
    <BenchShell
      prompt="Sit the check: twelve questions, one sitting, closed book — four chain, four failure, four mixed. || 70% clears the score gate; then file a corrected solution for every missed chain or failure item. The gate opens on score plus repairs."
      note="Closed book means derive, don't recall. Your answers, score, and filed corrections persist in this browser; the gate state is always visible."
      controls={
        state.phase === "intro" ? (
          <div className="sm:col-span-2">
            <WellButton onClick={start}>Start the check</WellButton>
          </div>
        ) : state.phase === "running" ? (
          <div className="sm:col-span-2 flex flex-wrap gap-2">
            <WellButton onClick={() => setQIndex((i) => Math.max(0, i - 1))}>Previous</WellButton>
            {qIndex < MAT_MASTERY_BANK.length - 1 ? (
              <WellButton onClick={() => setQIndex((i) => Math.min(MAT_MASTERY_BANK.length - 1, i + 1))}>
                Next
              </WellButton>
            ) : (
              <WellButton
                onClick={() => {
                  if (state.answers.every((a) => a !== null)) setState((s) => ({ ...s, phase: "results" }));
                }}
              >
                Score the check
              </WellButton>
            )}
          </div>
        ) : (
          <div className="sm:col-span-2 flex flex-wrap gap-2">
            <WellButton onClick={retake}>Retake the check</WellButton>
          </div>
        )
      }
    >
      {state.phase === "intro" && (
        <div className="text-sm leading-relaxed text-well-dim">
          <p>
            Twelve items, one sitting, no references. The bank is weighted on purpose: chaining the weeks and
            diagnosing failure modes are the load-bearing skills of Materials 101.
          </p>
          <Readouts
            items={[
              { label: "Questions", value: "12" },
              { label: "Gate", value: "≥ 70% (9 of 12)" },
              { label: "Corrections", value: "every missed chain / failure item" },
            ]}
          />
        </div>
      )}
      {state.phase === "running" && (
        <div>
          <p className="text-sm text-well-dim">
            Question {qIndex + 1} of {MAT_MASTERY_BANK.length} · {MAT_TOPIC_LABEL[MAT_MASTERY_BANK[qIndex].topic]}
          </p>
          <p className="mt-2 text-lg text-well-fg">{MAT_MASTERY_BANK[qIndex].prompt}</p>
          <div className="mt-3 grid gap-2" role="radiogroup" aria-label="Answer options">
            {MAT_MASTERY_BANK[qIndex].options.map((opt, oi) => {
              const on = state.answers[qIndex] === oi;
              return (
                <button
                  key={oi}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setAnswer(qIndex, oi)}
                  className={
                    "min-h-11 rounded-lg px-3 py-2 text-left text-sm " +
                    (on ? "bg-well-fg text-well" : "text-well-fg ring-1 ring-white/25")
                  }
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {qIndex === MAT_MASTERY_BANK.length - 1 && !state.answers.every((a) => a !== null) && (
            <p className="mt-2 text-sm text-well-dim">
              Answer all twelve to score — unanswered items count as missed.
            </p>
          )}
        </div>
      )}
      {state.phase === "results" && (
        <div>
          <Readouts
            items={[
              { label: "Score", value: `${correct} / ${MAT_MASTERY_BANK.length} (${fmt(pct, 1)}%)` },
              { label: "Score gate", value: passed ? "cleared ≥ 70%" : "below 70% — retake" },
              { label: "Corrections filed", value: `${filedCount} / ${required.length}` },
            ]}
          />
          {gateOpen ? (
            <p className="mt-3 rounded-lg bg-well-fg px-3 py-2 text-sm text-well">
              Gate open. Score clears 70% and every missed chain/failure item has a filed correction —
              Materials 101 is yours. Engineering 101 is next.
            </p>
          ) : (
            <p className="mt-3 text-sm text-well-dim">
              {passed
                ? "Score gate cleared. File corrections for the remaining items below to open the gate."
                : "Score gate not cleared. Retake the check — and file corrections for the missed items below regardless."}
            </p>
          )}
          {missed.length > 0 && (
            <div className="mt-4">
              <div className="mb-2 text-sm text-well-dim">Missed items</div>
              <div className="flex flex-col gap-3">
                {missed.map((m: MatMasteryItem) => {
                  const needsCorrection = m.topic === "chain" || m.topic === "failure";
                  const filed = (state.corrections[m.id] ?? "").trim().length > 0;
                  return (
                    <div key={m.id} className="rounded-lg p-3 ring-1 ring-white/15">
                      <p className="text-sm text-well-fg">
                        {m.prompt} <span className="text-well-dim">({MAT_TOPIC_LABEL[m.topic]})</span>
                      </p>
                      <p className="mt-1 text-sm text-well-dim">{m.why}</p>
                      {needsCorrection && (
                        <div className="mt-2">
                          <textarea
                            className={inputCls + " min-h-20"}
                            placeholder="Correction: name the error, re-derive the answer, identify the failed instinct."
                            value={state.corrections[m.id] ?? ""}
                            disabled={filed}
                            onChange={(e) =>
                              setState((s) => ({
                                ...s,
                                corrections: { ...s.corrections, [m.id]: e.target.value },
                              }))
                            }
                            aria-label={`Correction for: ${m.prompt}`}
                          />
                          {filed ? (
                            <p className="mt-1 text-sm text-well-dim">Correction filed.</p>
                          ) : (
                            <div className="mt-1">
                              <WellButton
                                onClick={() => {
                                  const v = (state.corrections[m.id] ?? "").trim();
                                  if (v)
                                    setState((s) => ({
                                      ...s,
                                      corrections: { ...s.corrections, [m.id]: v },
                                    }));
                                }}
                              >
                                File correction
                              </WellButton>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </BenchShell>
  );
}
