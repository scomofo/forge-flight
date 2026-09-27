import { useEffect, useMemo, useState } from "react";
import { specificStrength, stocks, type Family, type Stock } from "@/course/stocks";
import { BenchShell, fmt, Readouts, Slider, useReducedMotion, useTicker, WellButton } from "./ui";
import { cn } from "@/lib/cn";

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
