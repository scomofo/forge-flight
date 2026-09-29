import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { BenchShell, fmt, Readouts, Slider, useReducedMotion, useTicker, WellButton, Segmented } from "./ui";
import {
  chains,
  dominantIndex,
  monteCarloStd,
  normalizedSensitivities,
  rss,
  sensFunctions,
  varianceShares,
  worstCase,
  type Chain,
  type Uncertain,
} from "@/course/uncertainty";
import {
  bendingStress,
  effectiveLength,
  eulerLoad,
  marginOfSafety,
  sectionProps,
  shaftVonMises,
  torsionalShear,
  twistAngle,
  type EndCondition,
  type Section,
} from "@/course/mechanics";
import {
  BEAM_CASE,
  beamDeflectionM,
  beamMassKg,
  BRACKET_ALTERNATIVES,
  BRACKET_CRITERIA,
  dominatedAlternatives,
  firstPassingIndex,
  hasConverged,
  normalizeScores,
  rankAlternatives,
  sweep,
  weightFlipMargin,
} from "@/course/optimization";

const criteria = [
  { id: "light", label: "Light to carry" },
  { id: "cold", label: "Stays cold" },
  { id: "cheap", label: "Cheap to make" },
] as const;

type Crit = (typeof criteria)[number]["id"];

const bottles: { name: string; scores: Record<Crit, number>; line: string }[] = [
  {
    name: "Vacuum steel",
    scores: { light: 2, cold: 5, cheap: 2 },
    line: "Excellent insulation. Heavy, and costly to make.",
  },
  {
    name: "Plain HDPE",
    scores: { light: 5, cold: 2, cheap: 5 },
    line: "Light and cheap. The water warms up quickly.",
  },
  {
    name: "Plain aluminum",
    scores: { light: 4, cold: 3, cheap: 4 },
    line: "A middle road between the other two.",
  },
];

export function DesignBench() {
  const [w, setW] = useState<Record<Crit, number>>({ light: 3, cold: 3, cheap: 3 });
  const weightSum = criteria.reduce((s, c) => s + w[c.id], 0);
  const ranked = bottles
    .map((b) => ({
      ...b,
      score: criteria.reduce((s, c) => s + w[c.id] * b.scores[c.id], 0) / weightSum,
    }))
    .sort((a, b) => b.score - a.score);
  const top = ranked[0];
  const second = ranked[1];
  const tie = top.score - second.score < 0.08;
  const heaviest = criteria.slice().sort((a, b) => w[b.id] - w[a.id])[0];
  const split = criteria.filter((c) => w[c.id] === w[heaviest.id]).length > 1;

  return (
    <BenchShell
      prompt="Give each demand a weight from 1 to 5. || The winning bottle changes when you change which demand matters most. The scores of the bottles do not change."
      note="Scores are fixed judgments on a 1–5 scale, higher meaning better for the hiker. Your weights turn those judgments into a decision. This is not a heat-transfer simulation."
      controls={
        <>
          {criteria.map((c) => (
            <Slider
              key={c.id}
              label={c.label}
              min={1}
              max={5}
              step={1}
              value={w[c.id]}
              display={`${w[c.id]}`}
              onChange={(v) => setW((prev) => ({ ...prev, [c.id]: v }))}
            />
          ))}
        </>
      }
    >
      <p className="font-serif text-2xl leading-snug">
        {tie ? `${top.name} and ${second.name} are effectively tied.` : `${top.name} wins.`}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-well-dim">
        {split
          ? "Your weights are split, so no single demand is steering."
          : `${heaviest.label} is the heaviest weight in this decision.`}
      </p>
      <div className="mt-5 flex flex-col gap-3">
        {ranked.map((b, index) => (
          <div key={b.name}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span>
                {index === 0 && !tie ? "Lead · " : ""}
                {b.name}
              </span>
              <span className="tabular-nums">{fmt(b.score, 2)}</span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-white/15">
              <div className="h-1.5 rounded-full bg-well-fg" style={{ width: `${(b.score / 5) * 100}%` }} />
            </div>
            <p className="mt-1 text-sm text-well-dim">{b.line}</p>
          </div>
        ))}
      </div>
    </BenchShell>
  );
}

export function ReactionsBench() {
  const L = 4;
  const [p, setP] = useState(20);
  const [a, setA] = useState(1.6);
  const ra = (p * (L - a)) / L;
  const rb = (p * a) / L;
  const moment = (p * a * (L - a)) / L;
  const xLoad = 36 + (a / L) * 288;
  const sag = Math.min(36, moment * 0.85);
  const reduce = useReducedMotion();
  const [shownSag, setShownSag] = useState(sag);
  useTicker(!reduce && Math.abs(shownSag - sag) > 0.2, (dt) => {
    setShownSag((s) => {
      const next = s + (sag - s) * Math.min(1, dt * 6);
      return Math.abs(next - sag) < 0.12 ? sag : next;
    });
  });
  const draw = reduce ? sag : shownSag;
  const aFrac = a / L;
  const beam = Array.from({ length: 25 }, (_, i) => {
    const u = i / 24;
    const bFrac = 1 - aFrac;
    const raw =
      u <= aFrac
        ? bFrac * u * (1 - bFrac * bFrac - u * u)
        : aFrac * (1 - u) * (1 - aFrac * aFrac - (1 - u) * (1 - u));
    const peak = 2 * aFrac * aFrac * bFrac * bFrac || 1;
    const x = 36 + u * 288;
    const y = 70 + (draw * raw) / peak;
    return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
  const loadY = 70 + draw;

  return (
    <BenchShell
      prompt="Slide the load along the beam. || The two reactions add up to the load. The support closer to the load shows the larger number. The bow is that moment, exaggerated. The numbers are not."
      note="Weightless beam, pin supports at the ends, one downward force. The moment is the sagging moment under the load, P·a·b/L. The curve is that shape, exaggerated. The moment number is not."
      controls={
        <>
          <Slider label="Load" min={5} max={40} step={1} value={p} display={`${fmt(p, 0)} kN`} onChange={setP} />
          <Slider
            label="Position from left"
            min={0.4}
            max={3.6}
            step={0.1}
            value={a}
            display={`${fmt(a, 1)} m`}
            onChange={setA}
          />
        </>
      }
    >
      <Readouts
        items={[
          { label: "Left reaction", value: `${fmt(ra, 1)} kN` },
          { label: "Right reaction", value: `${fmt(rb, 1)} kN` },
          { label: "Moment", value: `${fmt(moment, 1)} kN·m` },
        ]}
      />
      <svg viewBox="0 0 360 150" className="h-auto w-full" aria-hidden>
        <path d={beam} fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M36 70 L24 92 L48 92 Z" fill="currentColor" />
        <path d="M324 70 L312 92 L336 92 Z" fill="currentColor" />
        <line x1={xLoad} y1="22" x2={xLoad} y2={loadY - 8} stroke="currentColor" strokeWidth="2" />
        <path d={`M${xLoad - 6} ${loadY - 16} L${xLoad} ${loadY - 4} L${xLoad + 6} ${loadY - 16}`} fill="none" stroke="currentColor" strokeWidth="2" />
        <line x1="36" y1="110" x2="36" y2={110 - ra} stroke="currentColor" strokeWidth="2" />
        <line x1="324" y1="110" x2="324" y2={110 - rb} stroke="currentColor" strokeWidth="2" />
        <text x="28" y="128" fill="currentColor" fontSize="11">
          {fmt(ra, 1)}
        </text>
        <text x="300" y="128" fill="currentColor" fontSize="11">
          {fmt(rb, 1)}
        </text>
      </svg>
      <p className="mt-3 text-sm text-well-dim">
        ΣF = {fmt(ra + rb - p, 1)} kN. The reactions add to the load. Slide toward one support and that reaction grows.
      </p>
    </BenchShell>
  );
}

const barMats = [
  { id: "steel", name: "Mild steel", short: "Steel", e: 200, sy: 250 },
  { id: "al", name: "Aluminum 6061-T6", short: "Aluminum", e: 69, sy: 275 },
  { id: "ti", name: "Titanium grade 5", short: "Titanium", e: 114, sy: 880 },
  { id: "nylon", name: "Nylon 6", short: "Nylon", e: 2.5, sy: 70 },
] as const;

export function AxialBench() {
  const [id, setId] = useState<(typeof barMats)[number]["id"]>("steel");
  const [force, setForce] = useState(20);
  const [diameter, setDiameter] = useState(12);
  const mat = barMats.find((m) => m.id === id) ?? barMats[0];
  const area = Math.PI * (diameter / 2) ** 2;
  const stress = (force * 1000) / area;
  const strain = stress / (mat.e * 1000);
  const delta = strain * 250;
  const n = mat.sy / stress;
  const holds = n >= 1;
  const yieldMm = (mat.sy / (mat.e * 1000)) * 250;
  const perm = holds ? 0 : Math.max(0, delta - yieldMm);
  const reduce = useReducedMotion();
  const [loaded, setLoaded] = useState(true);
  const target = loaded ? delta : perm;
  const [shown, setShown] = useState(delta);
  useTicker(!reduce && Math.abs(shown - target) > 0.015, (dt) => {
    setShown((s) => {
      const next = s + (target - s) * Math.min(1, dt * 5);
      return Math.abs(next - target) < 0.02 ? target : next;
    });
  });
  useEffect(() => {
    if (reduce) setShown(target);
  }, [reduce, target]);
  const draw = 150 + Math.min(64, shown * 2.2);

  return (
    <BenchShell
      prompt="Change the force, the diameter, and the material. Then press Unload. || Stress is force divided by area. A safety factor below 1 means this bar yields. Unload returns an elastic bar. A yielded bar keeps a set."
      note="Uniform axial stress, elastic until yield. Length is 250 mm. No notch, no stress concentration. Teaching yield values, not a code allowable. The drawing exaggerates the millimeters so the return, or the set, is visible."
      controls={
        <>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            {barMats.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setId(m.id)}
                className={cn(
                  "min-h-11 rounded-lg px-3 py-2 text-sm",
                  m.id === id ? "bg-well-fg text-well" : "ring-1 ring-white/25",
                )}
              >
                {m.short}
              </button>
            ))}
          </div>
          <Slider label="Force" min={1} max={80} step={1} value={force} display={`${fmt(force, 0)} kN`} onChange={setForce} />
          <Slider
            label="Diameter"
            min={4}
            max={40}
            step={1}
            value={diameter}
            display={`${fmt(diameter, 0)} mm`}
            onChange={setDiameter}
          />
          <div className="flex items-end">
            <WellButton onClick={() => setLoaded((on) => !on)}>{loaded ? "Unload" : "Load again"}</WellButton>
          </div>
        </>
      }
    >
      <Readouts
        items={[
          { label: "Stress", value: `${fmt(stress, 0)} MPa` },
          { label: "Elongation", value: `${fmt(delta, 2)} mm` },
          { label: "Safety factor", value: fmt(n, 2) },
        ]}
      />
      <svg viewBox="0 0 320 80" className="h-16 w-full" aria-hidden>
        <rect x="70" y="28" width="150" height="24" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.45" />
        <rect x="70" y="26" width={draw} height="28" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d={`M40 40 H64 M${70 + draw + 8} 40 H300`} stroke="currentColor" strokeWidth="2" />
      </svg>
      <p className="mt-3 text-sm leading-relaxed text-well-dim">
        {loaded
          ? holds
            ? `${mat.name} is under its ${mat.sy} MPa yield. Unload and the bar springs back.`
            : `${mat.name} is above its ${mat.sy} MPa yield. Unload and a set of about ${fmt(perm, 2)} mm remains.`
          : holds
            ? "Unloaded. The stretch came back. The dashed outline is the original 250 mm."
            : `Unloaded. About ${fmt(perm, 2)} mm stayed. That is the stretch past yield. The dashed outline is the original length.`}
        {loaded ? ` Strain is ${strain.toFixed(5)}, which is stretch over the 250 mm length.` : ""}
      </p>
    </BenchShell>
  );
}

const beamMats = [
  { id: "steel", name: "Steel", e: 200 },
  { id: "al", name: "Aluminum", e: 69 },
  { id: "wood", name: "Wood", e: 10 },
] as const;

export function DeflectionBench() {
  const [matId, setMatId] = useState<(typeof beamMats)[number]["id"]>("steel");
  const [length, setLength] = useState(1.6);
  const [depth, setDepth] = useState(40);
  const [load, setLoad] = useState(800);
  const mat = beamMats.find((m) => m.id === matId) ?? beamMats[0];
  const b = 0.04;
  const h = depth / 1000;
  const inertia = (b * h ** 3) / 12;
  const delta = (load * length ** 3) / (48 * mat.e * 1e9 * inertia);
  const limit = length / 250;
  const broken = delta > length / 5;
  const sag = Math.min(46, (delta / length) * 220);
  const reduce = useReducedMotion();
  const [shownSag, setShownSag] = useState(sag);
  useTicker(!reduce && Math.abs(shownSag - sag) > 0.08, (dt) => {
    setShownSag((s) => {
      const next = s + (sag - s) * Math.min(1, dt * 6);
      return Math.abs(next - sag) < 0.05 ? sag : next;
    });
  });
  const drawSag = reduce ? sag : shownSag;

  return (
    <BenchShell
      prompt="Change the span, the depth, and the material. Read the deflection in millimeters. || The drawing exaggerates the sag. The number does not. Compare that number with span/250."
      note="Simply supported, center point load, rectangular section, width fixed at 40 mm. δ = PL³ / (48EI). If the sag exceeds about a fifth of the span, that formula has left its range."
      controls={
        <>
          <div className="flex gap-2 sm:col-span-2">
            {beamMats.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMatId(m.id)}
                className={cn(
                  "min-h-11 rounded-lg px-3 py-2 text-sm",
                  m.id === matId ? "bg-well-fg text-well" : "ring-1 ring-white/25",
                )}
              >
                {m.name}
              </button>
            ))}
          </div>
          <Slider label="Span" min={0.8} max={3} step={0.1} value={length} display={`${fmt(length, 1)} m`} onChange={setLength} />
          <Slider label="Depth" min={10} max={80} step={1} value={depth} display={`${fmt(depth, 0)} mm`} onChange={setDepth} />
          <div className="sm:col-span-2">
            <Slider label="Midspan load" min={100} max={2000} step={50} value={load} display={`${fmt(load, 0)} N`} onChange={setLoad} />
          </div>
        </>
      }
    >
      <Readouts
        items={[
          { label: "Deflection", value: delta < 1 ? `${fmt(delta * 1000, 1)} mm` : `${fmt(delta, 2)} m` },
          { label: "Span / 250", value: `${fmt(limit * 1000, 0)} mm` },
          { label: "I", value: `${fmt(inertia * 1e6, 2)}e-6 m⁴` },
        ]}
      />
      <svg viewBox="0 0 320 120" className="h-auto w-full" aria-hidden>
        <path
          d={`M30 36 Q160 ${36 + drawSag * 2} 290 36`}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path d="M30 36 L20 54 L42 54 Z M290 36 L278 54 L302 54 Z" fill="currentColor" />
      </svg>
      <p className="mt-2 text-sm leading-relaxed text-well-dim">
        {broken
          ? "The small-deflection model has left the building. This section is far too slender for the load — don’t trust the number past “much too saggy.”"
          : delta > limit
            ? "It may not be breaking, but it is springier than the usual span/250 serviceability rule. Strength and stiffness are different tests."
            : "Under the span/250 rule of thumb, this sag would often be accepted. Depth, cubed, is the cheap way to get stiffer."}
      </p>
    </BenchShell>
  );
}

type ShelfKey = "stiff" | "light" | "cheap" | "looks";

const shelfKeys: { id: ShelfKey; label: string }[] = [
  { id: "stiff", label: "Stiffness" },
  { id: "light", label: "Lightness" },
  { id: "cheap", label: "Low cost" },
  { id: "looks", label: "Looks" },
];

const shelves: { name: string; scores: Record<ShelfKey, number> }[] = [
  { name: "Solid oak", scores: { stiff: 4, light: 3, cheap: 3, looks: 5 } },
  { name: "Steel angle", scores: { stiff: 5, light: 4, cheap: 4, looks: 2 } },
  { name: "Acrylic", scores: { stiff: 2, light: 5, cheap: 3, looks: 4 } },
  { name: "Plywood box", scores: { stiff: 3, light: 3, cheap: 5, looks: 3 } },
  { name: "Particle board", scores: { stiff: 2, light: 2, cheap: 4, looks: 1 } },
];

function isDominated(name: string) {
  const self = shelves.find((s) => s.name === name);
  if (!self) return false;
  return shelves.some(
    (other) =>
      other.name !== name &&
      shelfKeys.every((k) => other.scores[k.id] >= self.scores[k.id]) &&
      shelfKeys.some((k) => other.scores[k.id] > self.scores[k.id]),
  );
}

export function TradeoffBench() {
  const [w, setW] = useState<Record<ShelfKey, number>>({
    stiff: 4,
    light: 2,
    cheap: 3,
    looks: 2,
  });
  const sum = shelfKeys.reduce((s, k) => s + w[k.id], 0);
  const ranked = shelves
    .map((shelf) => ({
      ...shelf,
      dominated: isDominated(shelf.name),
      score: shelfKeys.reduce((s, k) => s + w[k.id] * shelf.scores[k.id], 0) / sum,
    }))
    .sort((a, b) => b.score - a.score);

  return (
    <BenchShell
      prompt="Give each criterion a weight from 1 to 5. || Particle board stays last, because plywood beats it on every criterion. Among the others, your weights choose the winner."
      note="Scores are 1–5, higher is better, written down in advance. Dominated means another concept is at least as good on every criterion and better on one. No positive weights can save it. These weights assume every shelf already holds the books — that was a screen, not a score."
      controls={
        <>
          {shelfKeys.map((k) => (
            <Slider
              key={k.id}
              label={k.label}
              min={1}
              max={5}
              step={1}
              value={w[k.id]}
              display={`${w[k.id]}`}
              onChange={(v) => setW((prev) => ({ ...prev, [k.id]: v }))}
            />
          ))}
        </>
      }
    >
      <div className="flex flex-col gap-3">
        {ranked.map((shelf, index) => (
          <div key={shelf.name} className={cn(shelf.dominated && "opacity-50")}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span>
                {index + 1}. {shelf.name}
                {shelf.dominated ? " · dominated" : ""}
              </span>
              <span className="tabular-nums">{fmt(shelf.score, 2)}</span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-white/15">
              <div
                className="h-1.5 rounded-full bg-well-fg"
                style={{ width: `${(shelf.score / 5) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm leading-relaxed text-well-dim">
        Particle board loses to the plywood box on every criterion listed, so it stays last no matter how you weight them. The lead among the others is your priorities, not a law of nature.
      </p>
    </BenchShell>
  );
}

export function BucklingBench() {
  const [side, setSide] = useState(20);
  const [length, setLength] = useState(1.2);
  const [frac, setFrac] = useState(0.7);
  const s = side / 1000;
  const area = s * s;
  const inertia = s ** 4 / 12;
  const e = 200e9;
  const sy = 250e6;
  const pCrush = sy * area;
  const pEuler = (Math.PI ** 2 * e * inertia) / (length * length);
  const mode = pEuler < pCrush ? "buckling" : "yield";
  const limit = Math.min(pEuler, pCrush);
  const load = frac * limit;
  const failed = frac > 1;
  const bow = failed && mode === "buckling" ? Math.min(70, (frac - 1) * 90) : 0;
  const squat = failed && mode === "yield";
  const [shown, setShown] = useState(bow);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setShown(bow);
  }, [bow]);
  useTicker(true, (dt) => {
    setShown((s) => {
      const next = s + (bow - s) * Math.min(1, dt * 8);
      return Math.abs(next - bow) < 0.2 ? bow : next;
    });
  });

  return (
    <BenchShell
      prompt="Change the side and the length, then move the load past 1 on the last slider. || Governs says whether buckling or yield arrives first. Past 1, the column drawing shows that failure."
      note="Square section, pinned ends, mild steel with E = 200 GPa and yield 250 MPa. Euler ignores imperfections, so a real column bows earlier. Fatigue and corrosion are in the reading; this bench only settles buckling against yield."
      controls={
        <>
          <Slider label="Side" min={8} max={40} step={1} value={side} display={`${fmt(side, 0)} mm`} onChange={setSide} />
          <Slider label="Length" min={0.3} max={2.5} step={0.05} value={length} display={`${fmt(length, 2)} m`} onChange={setLength} />
          <div className="sm:col-span-2">
            <Slider
              label="Load, as a fraction of the lower limit"
              min={0}
              max={1.5}
              step={0.01}
              value={frac}
              display={`${fmt(load / 1000, 1)} kN`}
              onChange={setFrac}
            />
          </div>
        </>
      }
    >
      <Readouts
        items={[
          { label: "Euler load", value: `${fmt(pEuler / 1000, 1)} kN` },
          { label: "Yield load", value: `${fmt(pCrush / 1000, 1)} kN` },
          { label: "Governs", value: mode === "buckling" ? "Buckling" : "Yield" },
        ]}
      />
      <svg viewBox="0 0 200 180" className="mx-auto h-40 w-full" aria-hidden>
        <path
          d={
            squat
              ? "M70 150 H130 V48 H70 Z"
              : `M100 156 Q${100 + shown} 90 100 28`
          }
          fill="none"
          stroke="currentColor"
          strokeWidth={Math.max(3, side / 4)}
        />
        <circle cx="100" cy="24" r="3" fill="currentColor" />
        <circle cx="100" cy="160" r="3" fill="currentColor" />
      </svg>
      <p className="mt-3 text-sm leading-relaxed text-well-dim">
        {mode === "buckling"
          ? failed
            ? "The column bows while the steel is still below yield. A stronger alloy with the same modulus would not raise this Euler load. Shorten it, thicken it, or brace the middle."
            : "Buckling is the impatient mechanism. You can still add load; the straight shape is what runs out first."
          : failed
            ? "This one is stocky enough to squash at yield before it can bow. Area and yield strength are the story. Euler is watching, but it is not first."
            : "Yield will arrive before buckling. Making the steel stronger actually helps here, unlike the slender case."}
      </p>
    </BenchShell>
  );
}

export function NotchBench() {
  const [r, setR] = useState(0.5);
  const d = 20;
  const thick = 5;
  const big = 30;
  const force = 8;
  const avg = (force * 1000) / (d * thick);
  const kt = 1 + 0.75 * Math.sqrt((big - d) / (2 * r));
  const peak = kt * avg;
  const sy = 250;
  const fillet = Math.min(16, 2 + r * 2.4);

  return (
    <BenchShell
      prompt="Set the fillet to 0.5 mm, then to 4 mm. || Average stress stays at 80 MPa. Peak stress falls. At 0.5 mm the peak is past the 250 MPa yield while the average still looks safe."
      note="Flat bar, 8 kN tension. Net section 20 mm by 5 mm, so the average cannot move. The step is 30 mm down to 20 mm. Kt = 1 + 0.75 √((D − d) / (2r)), a teaching curve with the right shape, not a Peterson chart."
      controls={
        <Slider
          label="Fillet radius"
          min={0.5}
          max={6}
          step={0.1}
          value={r}
          display={`${fmt(r, 1)} mm`}
          onChange={setR}
        />
      }
    >
      <Readouts
        items={[
          { label: "Average", value: `${fmt(avg, 0)} MPa` },
          { label: "Kt", value: fmt(kt, 2) },
          { label: "Peak", value: `${fmt(peak, 0)} MPa` },
        ]}
      />
      <svg viewBox="0 0 320 140" className="h-32 w-full" aria-hidden>
        <path
          d={`M24 28 H148 V${46 - fillet} Q148 46 ${148 + fillet} 46 H292 V94 H${148 + fillet} Q148 94 148 ${94 + fillet} V112 H24 Z`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx={148 + fillet * 0.35} cy={46 - fillet * 0.35} r="3.5" fill="currentColor" />
      </svg>
      <p className="mt-3 text-sm leading-relaxed text-well-dim">
        {peak > sy
          ? `The average is ${fmt(avg, 0)} MPa, under the ${sy} MPa yield. The peak at the fillet is ${fmt(peak, 0)} MPa. The average is the wrong number to trust.`
          : `Both numbers are under the ${sy} MPa yield. The average did not move. The fillet did. A sharper corner splits them apart again.`}
      </p>
    </BenchShell>
  );
}

const fatigueMats = [
  { id: "al", name: "Aluminum", sy: 280, s1000: 360, send: 100, nEnd: 1e8, knee: false },
  { id: "steel", name: "Steel", sy: 480, s1000: 540, send: 300, nEnd: 1e6, knee: true },
] as const;

function fatigueLife(mat: (typeof fatigueMats)[number], stress: number) {
  if (stress >= mat.sy) return { kind: "yield" as const, n: 1 };
  if (mat.knee && stress <= mat.send) return { kind: "runout" as const, n: Infinity };
  const b = Math.log(mat.send / mat.s1000) / Math.log(mat.nEnd / 1000);
  const n = 1000 * (stress / mat.s1000) ** (1 / b);
  return { kind: "finite" as const, n };
}

function cycleLabel(n: number) {
  if (!Number.isFinite(n)) return "Runout";
  if (n >= 1e6) return `${fmt(n / 1e6, 1)} million`;
  if (n >= 1e3) return `${fmt(n / 1e3, 0)} thousand`;
  return `${fmt(n, 0)}`;
}

export function FatigueBench() {
  const [id, setId] = useState<(typeof fatigueMats)[number]["id"]>("al");
  const [stress, setStress] = useState(120);
  const mat = fatigueMats.find((m) => m.id === id) ?? fatigueMats[0];
  const life = fatigueLife(mat, stress);
  const b = Math.log(mat.send / mat.s1000) / Math.log(mat.nEnd / 1000);
  const xOf = (n: number) => 36 + ((Math.log10(n) - 3) / 5) * 260;
  const yOf = (s: number) => 118 - (s / 600) * 96;
  const curve: string[] = [];
  for (let i = 0; i <= 32; i++) {
    const n = 1000 * 10 ** ((Math.log10(mat.nEnd / 1000) * i) / 32);
    const s = mat.s1000 * (n / 1000) ** b;
    curve.push(`${xOf(n).toFixed(1)},${yOf(s).toFixed(1)}`);
  }
  if (mat.knee) curve.push(`${xOf(1e8).toFixed(1)},${yOf(mat.send).toFixed(1)}`);
  const dotN = life.kind === "yield" ? 1000 : life.kind === "runout" ? 1e7 : Math.min(life.n, 1e8);
  const [spin, setSpin] = useState(0);
  useTicker(life.kind === "finite", (dt) => setSpin((s) => s + dt));
  const cycle = life.kind === "finite" ? (spin % 4.2) / 4.2 : life.kind === "yield" ? 0 : 0;
  const crack = life.kind === "finite" ? 4 + cycle * 52 : life.kind === "runout" ? 3 : 0;
  const pull = life.kind === "finite" ? (Math.floor(spin / 0.45) % 2 === 0 ? 1 : -1) : life.kind === "yield" ? 1 : 0;

  return (
    <BenchShell
      prompt="Set aluminum to 120 MPa. || It is under the 280 MPa yield, and the life is still a finite number. The coupon under the chart grows a nick. Switch to steel at 200 MPa. The line has flattened and the nick stays put. This model calls that a runout."
      note="Fully reversed, polished, no notch. Steel is given a plateau at half of 600 MPa after a million cycles. Aluminum keeps sloping out to 100 million. Corrosion can erase the plateau. A fillet multiplies the stress you bring to this chart. Not an ASME life."
      controls={
        <>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            {fatigueMats.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setId(m.id)}
                className={cn(
                  "min-h-11 rounded-lg px-3 py-2 text-sm",
                  m.id === id ? "bg-well-fg text-well" : "ring-1 ring-white/25",
                )}
              >
                {m.name}
              </button>
            ))}
          </div>
          <Slider
            label="Alternating stress"
            min={40}
            max={500}
            step={10}
            value={stress}
            display={`${fmt(stress, 0)} MPa`}
            onChange={setStress}
          />
        </>
      }
    >
      <Readouts
        items={[
          { label: "Yield", value: `${mat.sy} MPa` },
          { label: "Life", value: life.kind === "yield" ? "Yields first" : cycleLabel(life.n) },
          { label: "Versus yield", value: stress < mat.sy ? "Under" : "At or over" },
        ]}
      />
      <svg viewBox="0 0 320 196" className="h-48 w-full" aria-hidden>
        <polyline points={curve.join(" ")} fill="none" stroke="currentColor" strokeWidth="2" />
        {life.kind === "yield" ? null : <circle cx={xOf(dotN)} cy={yOf(stress)} r="4" fill="currentColor" />}
        <line x1="36" y1="168" x2="284" y2="168" stroke="currentColor" strokeOpacity="0.35" />
        <rect x="78" y="150" width={168 - (life.kind === "yield" ? 8 : 0)} height="16" fill="none" stroke="currentColor" strokeWidth="2" />
        {crack > 0 ? <line x1="162" y1="150" x2="162" y2={150 + crack * 0.28} stroke="currentColor" strokeWidth="2" /> : null}
        {pull !== 0 ? (
          <path
            d={pull > 0 ? "M250 158 H286 M278 152 L286 158 L278 164" : "M70 158 H36 M44 152 L36 158 L44 164"}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        ) : null}
      </svg>
      <p className="mt-3 text-sm leading-relaxed text-well-dim">
        {life.kind === "yield"
          ? `${mat.name} yields on the first pull at ${mat.sy} MPa. The coupon does not get a cycle. Fatigue is the wrong chapter until the stress is back under yield.`
          : life.kind === "runout"
            ? `${stress} MPa is under the ${mat.sy} MPa yield and under the ${mat.send} MPa plateau. The nick stays put. This model stops counting. Salt water, a notch, or a bigger part can start it again.`
            : `${stress} MPa is under the ${mat.sy} MPa yield, and the nick still lengthens. The loop is the life sped up, not one cycle. The life is ${cycleLabel(life.n)} cycles. Below yield is not the same sentence as safe forever.`}
      </p>
    </BenchShell>
  );
}

export function BoltBench() {
  const [clamp, setClamp] = useState(12);
  const [shear, setShear] = useState(1);
  const [threads, setThreads] = useState(false);
  const mu = 0.2;
  const capacity = mu * clamp;
  const slips = shear > capacity + 1e-6;
  const reduce = useReducedMotion();
  const [slipX, setSlipX] = useState(0);
  const slipTarget = slips ? 22 : 0;
  useTicker(!reduce && Math.abs(slipX - slipTarget) > 0.4, (dt) => {
    setSlipX((s) => {
      const next = s + (slipTarget - s) * Math.min(1, dt * 7);
      return Math.abs(next - slipTarget) < 0.3 ? slipTarget : next;
    });
  });
  useEffect(() => {
    if (reduce) setSlipX(slipTarget);
  }, [reduce, slipTarget]);
  const tensileArea = 36.6;
  const shankArea = (Math.PI * 8 * 8) / 4;
  const shearArea = threads ? tensileArea : shankArea;
  const tension = (clamp * 1000) / tensileArea;
  const shearStress = slips ? (shear * 1000) / shearArea : 0;

  return (
    <BenchShell
      prompt="Set the clamp to 12 kN and the shear to 1 kN. || Friction holds, so the shank shear is zero. Raise the shear to 4 kN. || The joint slips and the bolt becomes a pin. Put the threads in the shear plane. || The shear stress rises. The load did not."
      note="One M8 bolt, one interface, μ = 0.20. That friction is a teaching value for dry steel, not a grade of bolt. Thread area used here is the 36.6 mm² tensile stress area. Shank area is πd²/4. No prying, no gasket."
      controls={
        <>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <button
              type="button"
              onClick={() => setThreads(false)}
              className={cn(
                "min-h-11 rounded-lg px-3 py-2 text-sm",
                threads ? "ring-1 ring-white/25" : "bg-well-fg text-well",
              )}
            >
              Shank in the plane
            </button>
            <button
              type="button"
              onClick={() => setThreads(true)}
              className={cn(
                "min-h-11 rounded-lg px-3 py-2 text-sm",
                threads ? "bg-well-fg text-well" : "ring-1 ring-white/25",
              )}
            >
              Threads in the plane
            </button>
          </div>
          <Slider
            label="Clamp"
            min={2}
            max={20}
            step={1}
            value={clamp}
            display={`${fmt(clamp, 0)} kN`}
            onChange={setClamp}
          />
          <Slider
            label="Shear load"
            min={0.5}
            max={8}
            step={0.5}
            value={shear}
            display={`${fmt(shear, 1)} kN`}
            onChange={setShear}
          />
        </>
      }
    >
      <Readouts
        items={[
          { label: "Friction holds to", value: `${fmt(capacity, 1)} kN` },
          { label: "Bolt tension", value: `${fmt(tension, 0)} MPa` },
          { label: "Bolt shear", value: slips ? `${fmt(shearStress, 0)} MPa` : "0 MPa" },
        ]}
      />
      <svg viewBox="0 0 320 120" className="h-28 w-full" aria-hidden>
        <rect x="50" y="40" width="190" height="22" fill="none" stroke="currentColor" strokeWidth="2" />
        <rect x={50 + (reduce ? slipTarget : slipX)} y="62" width="190" height="22" fill="none" stroke="currentColor" strokeWidth="2" />
        <rect x="148" y="28" width="14" height="78" fill="currentColor" />
      </svg>
      <p className="mt-3 text-sm leading-relaxed text-well-dim">
        {slips
          ? `The shear load is past μ times the clamp, so the plates slip. Shear stress uses the ${threads ? "thread area, 36.6 mm²" : "shank area, 50.3 mm²"}. Tension is still the clamp divided by 36.6 mm².`
          : "Friction carries the shear. The bolt's job right now is the clamp, which is tension. The shank shear is zero until the plates actually move."}
      </p>
    </BenchShell>
  );
}

const crackMats = [
  { id: "steel", name: "Steel", c: 6.9e-12, m: 3, kic: 50, threshold: 5 },
  { id: "al", name: "Aluminum", c: 6.9e-11, m: 3, kic: 26, threshold: 3 },
] as const;

function growCrack(mat: (typeof crackMats)[number], stress: number, a0mm: number) {
  const y = 1.12;
  const a0 = a0mm / 1000;
  const aCrit = (mat.kic / (y * stress)) ** 2 / Math.PI;
  const dK0 = y * stress * Math.sqrt(Math.PI * a0);
  const rate0 = dK0 < mat.threshold ? 0 : mat.c * dK0 ** mat.m;
  if (a0 >= aCrit) return { kind: "broken" as const, dK0, rate0, aCrit, n: 0, points: [] as { n: number; a: number }[] };
  if (dK0 < mat.threshold) return { kind: "sit" as const, dK0, rate0, aCrit, n: Infinity, points: [] as { n: number; a: number }[] };
  let a = a0;
  let n = 0;
  const points = [{ n: 0, a: a0 }];
  for (let i = 0; i < 500; i++) {
    const dK = y * stress * Math.sqrt(Math.PI * a);
    const dadn = mat.c * dK ** mat.m;
    const da = Math.min(aCrit - a, a * 0.04);
    n += da / dadn;
    a += da;
    if (i % 12 === 0) points.push({ n, a });
    if (a >= aCrit * 0.999 || n > 1e9) break;
  }
  points.push({ n, a: Math.min(a, aCrit) });
  return { kind: n > 1e9 ? ("long" as const) : ("grew" as const), dK0, rate0, aCrit, n, points };
}

function lifeLabel(n: number) {
  if (!Number.isFinite(n)) return "Sits";
  if (n <= 0) return "Already critical";
  if (n > 1e9) return "Past a billion";
  if (n >= 1e6) return `${fmt(n / 1e6, 1)} million`;
  if (n >= 1e3) return `${fmt(n / 1e3, 0)} thousand`;
  return fmt(n, 0);
}

export function CrackBench() {
  const [id, setId] = useState<(typeof crackMats)[number]["id"]>("steel");
  const [stress, setStress] = useState(120);
  const [a0, setA0] = useState(0.5);
  const mat = crackMats.find((item) => item.id === id) ?? crackMats[0];
  const grown = growCrack(mat, stress, a0);
  const [tick, setTick] = useState(0);
  useTicker(grown.kind === "grew", (dt) => setTick((s) => s + dt));
  const lifeFrac = (tick % 6) / 6;
  let dotX = 28;
  let dotY = 108;
  if (grown.kind === "grew" && grown.points.length > 1) {
    const target = lifeFrac * grown.n;
    let prev = grown.points[0];
    for (const point of grown.points) {
      if (point.n >= target) {
        const span = point.n - prev.n || 1;
        const f = Math.min(1, Math.max(0, (target - prev.n) / span));
        const crack = prev.a + (point.a - prev.a) * f;
        dotX = 28 + (target / grown.n) * 270;
        dotY = 108 - (crack / grown.aCrit) * 78;
        break;
      }
      prev = point;
    }
  }
  const line =
    grown.points.length > 1 && grown.n > 0
      ? grown.points
          .map((point) => {
            const x = 28 + (point.n / grown.n) * 270;
            const y = 108 - (point.a / grown.aCrit) * 78;
            return `${x.toFixed(1)},${y.toFixed(1)}`;
          })
          .join(" ")
      : "";

  return (
    <BenchShell
      prompt="Set steel, a 0.50 mm crack, and 120 MPa. Then double the stress to 240 MPa. || Growth on the first cycle rises about eightfold. Life falls by a little more than that, and the critical length shrinks. The curve stays low, then stands up."
      note="Edge crack, Y = 1.12, stress from zero to the range so the faces stay open. Steel is the Barsom ferrite-pearlite pair, C = 6.9×10⁻¹² and m = 3, with a teaching toughness of 50 MPa√m and a threshold of 5. Aluminum uses ten times that C, toughness 26, threshold 3. Y = 1.12 stops being honest once the crack is no longer short beside the plate, so the last rise is the shape of the law."
      controls={
        <>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            {crackMats.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setId(item.id)}
                className={cn(
                  "min-h-11 rounded-lg px-3 py-2 text-sm",
                  item.id === id ? "bg-well-fg text-well" : "ring-1 ring-white/25",
                )}
              >
                {item.name}
              </button>
            ))}
          </div>
          <Slider
            label="Stress range"
            min={40}
            max={240}
            step={10}
            value={stress}
            display={`${fmt(stress, 0)} MPa`}
            onChange={setStress}
          />
          <Slider
            label="Starter crack"
            min={0.2}
            max={2}
            step={0.1}
            value={a0}
            display={`${fmt(a0, 1)} mm`}
            onChange={setA0}
          />
        </>
      }
    >
      <Readouts
        items={[
          { label: "ΔK now", value: `${fmt(grown.dK0, 1)} MPa√m` },
          { label: "This cycle", value: grown.rate0 === 0 ? "Sits" : `${fmt(grown.rate0 * 1e9, 1)} nm` },
          { label: "Life", value: lifeLabel(grown.n) },
          { label: "Breaks at", value: `${fmt(grown.aCrit * 1000, 0)} mm` },
        ]}
      />
      <svg viewBox="0 0 320 130" className="h-32 w-full" aria-hidden>
        {line ? <polyline points={line} fill="none" stroke="currentColor" strokeWidth="2" /> : null}
        {grown.kind === "grew" ? <circle cx={dotX} cy={dotY} r="4" fill="currentColor" /> : null}
      </svg>
      <p className="mt-3 text-sm leading-relaxed text-well-dim">
        {grown.kind === "sit"
          ? `ΔK is ${fmt(grown.dK0, 1)}, under the threshold of ${mat.threshold}. This model does not grow the crack. Raise the stress or start with a longer crack and it can leave the floor.`
          : grown.kind === "broken"
            ? "The starter crack is already past the toughness at this stress. There is no fatigue life left to integrate."
            : `Most of the ${lifeLabel(grown.n)} cycles pass while the crack is still short. It stands up at the end because ΔK grew with the square root of the length. Critical length is ${fmt(grown.aCrit * 1000, 0)} mm.`}
      </p>
    </BenchShell>
  );
}

export function MeanBench() {
  const [alternating, setAlternating] = useState(200);
  const [mean, setMean] = useState(0);
  const endurance = 300;
  const ultimate = 600;
  const yieldStress = 480;
  const goodman = alternating / endurance + mean / ultimate;
  const peak = mean + alternating;
  const yields = peak >= yieldStress;
  const inside = goodman <= 1 + 1e-9 && !yields;
  const xOf = (value: number) => 36 + (value / ultimate) * 250;
  const yOf = (value: number) => 112 - (value / endurance) * 84;

  return (
    <BenchShell
      prompt="Set alternating stress to 200 MPa and the mean to 0. || The point is inside the line. That 200 MPa was a runout on the fully reversed bench, which had no mean. Raise the mean to 250 MPa. || The same wiggle is now outside the line."
      note="Goodman line for the steel whose fully reversed plateau is 300 MPa and whose ultimate is 600 MPa. Yield is 480 MPa. Tensile mean only. Gerber would bow this line upward and let more points through. A compressive mean is not drawn."
      controls={
        <>
          <Slider
            label="Alternating"
            min={40}
            max={280}
            step={10}
            value={alternating}
            display={`${fmt(alternating, 0)} MPa`}
            onChange={setAlternating}
          />
          <Slider
            label="Mean"
            min={0}
            max={400}
            step={10}
            value={mean}
            display={`${fmt(mean, 0)} MPa`}
            onChange={setMean}
          />
        </>
      }
    >
      <Readouts
        items={[
          { label: "Goodman sum", value: fmt(goodman, 2) },
          { label: "Peak", value: `${fmt(peak, 0)} MPa` },
          { label: "Call", value: yields ? "Yields first" : inside ? "Inside" : "Outside" },
        ]}
      />
      <svg viewBox="0 0 320 130" className="h-32 w-full" aria-hidden>
        <line x1={xOf(0)} y1={yOf(endurance)} x2={xOf(ultimate)} y2={yOf(0)} stroke="currentColor" strokeWidth="2" />
        <circle cx={xOf(mean)} cy={yOf(Math.min(alternating, endurance * 1.15))} r="4" fill="currentColor" />
      </svg>
      <p className="mt-3 text-sm leading-relaxed text-well-dim">
        {yields
          ? `The top of the cycle is ${fmt(peak, 0)} MPa, at or over the ${yieldStress} MPa yield. Fatigue is the wrong chapter until the first pull stays elastic.`
          : inside
            ? `Sum ${fmt(goodman, 2)} is on or under 1. Fully reversed, this alternating stress can sit on the plateau. A tensile mean spends some of the ${ultimate} MPa ultimate.`
            : `Sum ${fmt(goodman, 2)} is over 1. The wiggle did not grow. The mean moved the point off the plateau the other bench allowed.`}
      </p>
    </BenchShell>
  );
}

/* ------------------------------------------------------------------ */
/* Week 22 — Models, assumptions & uncertainty                         */
/* ------------------------------------------------------------------ */

function chainUncertains(chain: Chain, uncs: number[]): Uncertain[] {
  return chain.links.map((link, i) => ({ nominal: link.nominal, unc: uncs[i] }));
}

function chainOf(chain: Chain) {
  return (vals: number[]) => chain.evaluate(vals);
}

export function ErrorBudgetBench() {
  const [chainId, setChainId] = useState<string>("thrust");
  const chain = chains.find((c) => c.id === chainId) ?? chains[0];
  const [uncs, setUncs] = useState<number[]>(() => chains[0].links.map((l) => l.defaultUnc));
  const [upgrade, setUpgrade] = useState<string>("none");
  const [grade, setGrade] = useState<{ q: number; ok: boolean; msg: string }[]>([]);
  const [numeric, setNumeric] = useState("");

  useEffect(() => {
    setUncs(chain.links.map((l) => l.defaultUnc));
    setUpgrade("none");
    setGrade([]);
    setNumeric("");
  }, [chain]);

  const f = chainOf(chain);
  const xs = chainUncertains(chain, uncs);
  const nominal = chain.evaluate(chain.links.map((l) => l.nominal));
  const wc = worstCase(f, xs);
  const total = rss(f, xs);
  const shares = varianceShares(f, xs);
  const dom = dominantIndex(f, xs);

  const upIdx = chain.links.findIndex((l) => l.id === upgrade);
  const upXs: Uncertain[] =
    upIdx >= 0 ? xs.map((x, i) => (i === upIdx ? { ...x, unc: x.unc / 2 } : x)) : xs;
  const upTotal = upIdx >= 0 ? rss(f, upXs) : total;

  const pct = (u: number) => `${fmt((u / nominal) * 100, 2)}%`;
  const val = (u: number) => `${fmt(u, chain.resultDecimals)} ${chain.resultUnit}`;

  const mark = (q: number, ok: boolean, msg: string) =>
    setGrade((g) => [...g.filter((r) => r.q !== q), { q, ok, msg }]);
  const score = grade.filter((r) => r.ok).length;

  const answerDominant = (i: number) =>
    mark(
      1,
      i === dom,
      i === dom
        ? `Correct — ${chain.links[dom].label} owns ${fmt(shares[dom] * 100, 0)}% of the variance.`
        : `Not quite — ${chain.links[dom].label} owns ${fmt(shares[dom] * 100, 0)}% of the variance. Follow the shares, not the leverage.`,
    );
  const answerMethod = (method: "rss" | "worst") =>
    mark(
      2,
      method === "rss",
      method === "rss"
        ? "Correct — independent random errors get the RSS discount; worst case is the signable guarantee."
        : "Worst case assumes conspiracy. For independent random errors, RSS is the honest expectation.",
    );
  const answerNumeric = () => {
    const guess = Number(numeric);
    if (!Number.isFinite(guess) || guess <= 0) {
      mark(3, false, "Enter a positive number first.");
      return;
    }
    const expected = upIdx >= 0 ? upTotal : total;
    const err = Math.abs(guess - expected) / expected;
    mark(
      3,
      err <= 0.1,
      err <= 0.1
        ? `Within 10% — the upgraded RSS is ${val(expected)}.`
        : `Off by ${fmt(err * 100, 0)}% — the upgraded RSS is ${val(expected)}. Halving the dominant link does not halve the total; the other links are still there.`,
    );
  };

  return (
    <BenchShell
      prompt="Pick a measurement chain and set each link's ± with the sliders. || The budget shows the nominal result with worst-case and RSS totals, and names the link owning the largest variance share. || Answer the three graded questions, then halve the dominant link's uncertainty and read what the upgrade actually buys."
      note="Uncertainties are stated as ± bounds at the same confidence; RSS treats them as independent and random. If two links share an instrument or a temperature drift, they are correlated and the RSS total understates the risk — say so in the budget."
      controls={
        <>
          <Segmented<string>
            label="Measurement chain"
            value={chainId}
            onChange={setChainId}
            options={chains.map((c) => ({ value: c.id, label: c.name }))}
          />
          {chain.links.map((link, i) => (
            <Slider
              key={link.id}
              label={`± ${link.label} (${link.unit})`}
              min={link.minUnc}
              max={link.maxUnc}
              step={link.step}
              value={uncs[i]}
              display={`±${fmt(uncs[i], link.decimals)} ${link.unit}`}
              onChange={(v) => setUncs((prev) => prev.map((u, j) => (j === i ? v : u)))}
            />
          ))}
          <Segmented<string>
            label="Proposed upgrade: halve one link's uncertainty"
            value={upgrade}
            onChange={(v) => {
              setUpgrade(v);
              setNumeric("");
              setGrade((g) => g.filter((r) => r.q !== 3));
            }}
            options={[
              { value: "none", label: "No upgrade" },
              ...chain.links.map((l) => ({ value: l.id, label: `Halve ± ${l.label}` })),
            ]}
          />
        </>
      }
    >
      <p className="text-sm text-well-dim">{chain.blurb}</p>
      <div className="mt-3">
        <Readouts
          items={[
            { label: "Nominal result", value: `${fmt(nominal, chain.resultDecimals)} ${chain.resultUnit}` },
            { label: "Worst case ±", value: `${val(wc)} (${pct(wc)})` },
            { label: "RSS ±", value: `${val(total)} (${pct(total)})` },
            ...(upIdx >= 0
              ? [{ label: "RSS after upgrade", value: `${val(upTotal)} (${pct(upTotal)})` }]
              : []),
          ]}
        />
      </div>
      <p className="font-serif text-2xl leading-snug">
        {chain.links[dom].label} dominates — {fmt(shares[dom] * 100, 0)}% of the variance.
      </p>
      <div className="mt-5 flex flex-col gap-3">
        {chain.links.map((link, i) => (
          <div key={link.id}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span>
                {i === dom ? "Dominant · " : ""}
                {link.label} ±{fmt(uncs[i], link.decimals)} {link.unit}
              </span>
              <span className="tabular-nums">{fmt(shares[i] * 100, 1)}%</span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-white/15">
              <div className="h-1.5 rounded-full bg-well-fg" style={{ width: `${shares[i] * 100}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-white/15 pt-5">
        <p className="text-sm font-medium text-accent">Graded — {score}/3</p>
        <div className="mt-3">
          <p className="text-sm">1. Which link dominates this chain's uncertainty?</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {chain.links.map((link, i) => (
              <WellButton key={link.id} onClick={() => answerDominant(i)}>
                {link.label}
              </WellButton>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm">2. The errors are independent and random. Which total is the honest expectation?</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <WellButton onClick={() => answerMethod("rss")}>RSS — {val(total)}</WellButton>
            <WellButton onClick={() => answerMethod("worst")}>Worst case — {val(wc)}</WellButton>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm">
            3. With {upIdx >= 0 ? `± ${chain.links[upIdx].label} halved` : "no upgrade chosen"} the RSS total is
            about… ({chain.resultUnit})
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input
              type="number"
              min={0}
              value={numeric}
              onChange={(e) => setNumeric(e.target.value)}
              aria-label="Upgraded RSS total"
              className="min-h-11 w-32 rounded-lg bg-white/10 px-3 text-sm tabular-nums text-well-fg ring-1 ring-white/25"
            />
            <WellButton onClick={answerNumeric}>Check</WellButton>
          </div>
        </div>
        {grade.length > 0 && (
          <ul className="mt-4 flex flex-col gap-2">
            {grade
              .slice()
              .sort((a, b) => a.q - b.q)
              .map((r) => (
                <li key={r.q} className="text-sm leading-relaxed text-well-dim">
                  <span className={r.ok ? "text-well-fg" : ""}>{r.ok ? "✓" : "✗"} Q{r.q}:</span> {r.msg}
                </li>
              ))}
          </ul>
        )}
      </div>
    </BenchShell>
  );
}

export function SensitivityBench() {
  const [fnId, setFnId] = useState<string>("thrust");
  const fn = sensFunctions.find((s) => s.id === fnId) ?? sensFunctions[0];
  const [relUnc, setRelUnc] = useState<number[]>(() => sensFunctions[0].inputs.map(() => 1));
  const [pick, setPick] = useState<string | null>(null);

  useEffect(() => {
    setRelUnc(fn.inputs.map(() => 1));
    setPick(null);
  }, [fn]);

  const nominals = fn.inputs.map(() => 1);
  const sens = normalizedSensitivities(fn.evaluate, nominals);
  const xs: Uncertain[] = nominals.map((n, i) => ({ nominal: n, unc: (relUnc[i] / 100) * n }));
  const shares = varianceShares(fn.evaluate, xs);
  const dom = dominantIndex(fn.evaluate, xs);
  const mc = monteCarloStd(fn.evaluate, xs, 20000, 22);
  const rssTotal = rss(fn.evaluate, xs);
  const mcRatio = mc / (rssTotal / Math.sqrt(3));

  const answerPick = (id: string) => setPick(id);
  const correct = pick !== null && fn.inputs[dom].id === pick;

  return (
    <BenchShell
      prompt="Pick a formula and set each input's relative uncertainty. || The bars show each input's normalized sensitivity — percent the output moves per percent the input moves — and its share of the output's scatter. || Find which input the beam-deflection formula is most tender to, and say why the exponent 3 is the reason."
      note="Sensitivities are first-order and scale-invariant: they describe the formula's shape, not your numbers. A Monte Carlo check runs alongside the RSS total — if the two ever disagree badly, the linear approximation is breaking, not the arithmetic."
      controls={
        <>
          <Segmented<string>
            label="Formula"
            value={fnId}
            onChange={setFnId}
            options={sensFunctions.map((s) => ({ value: s.id, label: `${s.name} — ${s.formula}` }))}
          />
          {fn.inputs.map((input, i) => (
            <Slider
              key={input.id}
              label={`Relative ± on ${input.label}`}
              min={0.1}
              max={5}
              step={0.1}
              value={relUnc[i]}
              display={`${fmt(relUnc[i], 1)}%`}
              onChange={(v) => setRelUnc((prev) => prev.map((u, j) => (j === i ? v : u)))}
            />
          ))}
        </>
      }
    >
      <Readouts
        items={[
          { label: "RSS total (relative)", value: `${fmt((rssTotal / fn.evaluate(nominals)) * 100, 2)}%` },
          { label: "Monte Carlo / (RSS/√3)", value: fmt(mcRatio, 2) },
        ]}
      />
      <div className="mt-2 flex flex-col gap-4">
        {fn.inputs.map((input, i) => (
          <div key={input.id}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span>
                {i === dom ? "Dominant · " : ""}
                {input.label} — S = {fmt(sens[i], 2)}
              </span>
              <span className="tabular-nums">{fmt(shares[i] * 100, 1)}% of variance</span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-white/15">
              <div className="h-1.5 rounded-full bg-well-fg" style={{ width: `${shares[i] * 100}%` }} />
            </div>
            <p className="mt-1 text-sm text-well-dim">
              {sens[i] < 0
                ? `Negative leverage: more ${input.label.split(" ").pop()} means less output — the share still counts.`
                : `A 1% move here moves the output ${fmt(Math.abs(sens[i]), 2)}%.`}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-6 border-t border-white/15 pt-5">
        <p className="text-sm font-medium text-accent">Graded — which input deserves the better instrument?</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {fn.inputs.map((input) => (
            <WellButton key={input.id} onClick={() => answerPick(input.id)}>
              {input.label}
            </WellButton>
          ))}
        </div>
        {pick !== null && (
          <p className="mt-3 text-sm leading-relaxed text-well-dim">
            {correct ? (
              <>
                <span className="text-well-fg">✓ Correct.</span> {fn.inputs[dom].label} owns{" "}
                {fmt(shares[dom] * 100, 0)}% of the variance — leverage times sloppiness, not leverage alone.
              </>
            ) : (
              <>
                <span className="text-well-fg">✗ Not quite.</span> {fn.inputs[dom].label} owns{" "}
                {fmt(shares[dom] * 100, 0)}% of the variance. The most leveraged input is not always the
                sloppiest — follow the shares.
              </>
            )}
          </p>
        )}
      </div>
    </BenchShell>
  );
}

/* ------------------------------------------------------------------ */
/* Week 24 benches: sections explorer + component sizing               */
/* ------------------------------------------------------------------ */

const RHO_AL = 2700; // kg/m^3, 6061 aluminum — stated in the note

type SecKind = "rect-tube" | "rectangle" | "round-tube" | "solid-round" | "i-beam";

const SEC_LABELS: { value: SecKind; label: string }[] = [
  { value: "rect-tube", label: "Square tube" },
  { value: "rectangle", label: "Solid rectangle" },
  { value: "round-tube", label: "Round tube" },
  { value: "solid-round", label: "Solid round" },
  { value: "i-beam", label: "I-beam" },
];

function buildSection(kind: SecKind, a: number, b: number): Section {
  const m = (mm: number) => mm / 1000;
  switch (kind) {
    case "rect-tube":
      return { kind, b: m(a), h: m(a), t: m(b) };
    case "rectangle":
      return { kind, b: m(a), h: m(b) };
    case "round-tube":
      return { kind, d: m(a), t: m(b) };
    case "solid-round":
      return { kind, d: m(a) };
    case "i-beam": {
      const H = m(a);
      return { kind, bf: 0.5 * H, tf: 0.05 * H, hw: 0.9 * H, tw: 0.04 * H };
    }
  }
}

export function SectionExplorerBench() {
  const [kind, setKind] = useState<SecKind>("rect-tube");
  const [a, setA] = useState(40);
  const [b, setB] = useState(3);
  const [sAnswer, setSAnswer] = useState("");
  const [sResult, setSResult] = useState<"idle" | "right" | "wrong">("idle");
  const [depthPick, setDepthPick] = useState<string | null>(null);

  const section = buildSection(kind, a, b);
  const p = sectionProps(section);
  const massPerM = RHO_AL * p.A;
  const sPerKg = p.S / massPerM;

  const sliderSpec =
    kind === "rect-tube"
      ? [
          { label: "Outer size", value: a, min: 20, max: 80, step: 1, set: setA, unit: "mm" },
          { label: "Wall", value: b, min: 1, max: 8, step: 0.5, set: setB, unit: "mm" },
        ]
      : kind === "rectangle"
        ? [
            { label: "Width", value: a, min: 10, max: 60, step: 1, set: setA, unit: "mm" },
            { label: "Depth", value: b, min: 10, max: 120, step: 1, set: setB, unit: "mm" },
          ]
        : kind === "round-tube"
          ? [
              { label: "Diameter", value: a, min: 10, max: 80, step: 1, set: setA, unit: "mm" },
              { label: "Wall", value: b, min: 1, max: 8, step: 0.5, set: setB, unit: "mm" },
            ]
          : kind === "solid-round"
            ? [{ label: "Diameter", value: a, min: 10, max: 60, step: 1, set: setA, unit: "mm" }]
            : [{ label: "Depth", value: a, min: 100, max: 300, step: 5, set: setA, unit: "mm" }];

  const checkS = () => {
    const v = Number(sAnswer);
    if (!Number.isFinite(v)) return;
    const truth = p.S * 1e6;
    setSResult(Math.abs(v - truth) / truth <= 0.05 ? "right" : "wrong");
  };

  return (
    <BenchShell
      prompt="Pick the square tube and set 40 mm outer, 3 mm wall. || Read S and the mass per meter, then switch to the solid rectangle at 40×40 and compare S per kilogram. || Answer the two checks: the hollow section wins per kilogram because its material sits far from the neutral axis."
      note="Properties are computed from closed-form geometry (mechanics.ts), not catalog tables. Density is 6061 aluminum, 2700 kg/m³. The I-beam uses fixed proportions scaled by depth — a teaching section, not a rolled shape."
      controls={
        <>
          <Segmented label="Section" value={kind} onChange={(v) => { setKind(v); setSResult("idle"); }} options={SEC_LABELS} />
          {sliderSpec.map((s) => (
            <Slider
              key={s.label}
              label={s.label}
              min={s.min}
              max={s.max}
              step={s.step}
              value={s.value}
              display={`${fmt(s.value, 1)} ${s.unit}`}
              onChange={s.set}
            />
          ))}
        </>
      }
    >
      <Readouts
        items={[
          { label: "S", value: `${fmt(p.S * 1e6, 2)} ×10⁻⁶ m³` },
          { label: "Mass / m", value: `${fmt(massPerM, 2)} kg` },
          { label: "S per kg", value: `${fmt(sPerKg * 1e6, 2)} ×10⁻⁶ m³/kg` },
          { label: "I", value: `${fmt(p.I * 1e12, 2)} ×10⁻¹² m⁴` },
          { label: "J", value: `${fmt(p.J * 1e12, 2)} ×10⁻¹² m⁴` },
        ]}
      />
      <div className="mt-2 rounded-lg border border-white/15 p-4">
        <p className="text-sm font-medium text-accent">Check 1 — read the section modulus</p>
        <p className="mt-1 text-sm text-well-dim">
          With the 40×40×3 mm square tube, enter S in units of 10⁻⁶ m³ (within 5%).
        </p>
        <div className="mt-2 flex items-center gap-2">
          <input
            className="w-28 rounded-md bg-white/10 px-2 py-1.5 text-sm tabular-nums"
            value={sAnswer}
            onChange={(e) => { setSAnswer(e.target.value); setSResult("idle"); }}
            inputMode="decimal"
            aria-label="Section modulus in 1e-6 m^3"
          />
          <WellButton onClick={checkS}>Check</WellButton>
          {sResult === "right" && <span className="text-sm text-emerald-300">Correct — 5.10 ×10⁻⁶ m³.</span>}
          {sResult === "wrong" && <span className="text-sm text-amber-300">Not quite — read S from the readout above.</span>}
        </div>
      </div>
      <div className="mt-3 rounded-lg border border-white/15 p-4">
        <p className="text-sm font-medium text-accent">Check 2 — what quadruples S?</p>
        <p className="mt-1 text-sm text-well-dim">For a solid rectangle, which change multiplies the section modulus by 4?</p>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {["Double the width", "Double the depth", "Double both", "Halve the width"].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setDepthPick(opt)}
              className={cn(
                "min-h-11 rounded-lg px-3 py-2 text-left text-sm transition-transform active:scale-[0.96]",
                depthPick === opt
                  ? opt === "Double the depth"
                    ? "bg-emerald-400/20 text-emerald-200 ring-1 ring-emerald-300/40"
                    : "bg-red-400/20 text-red-200 ring-1 ring-red-300/40"
                  : "text-well-fg ring-1 ring-white/25",
              )}
            >
              {opt}
            </button>
          ))}
        </div>
        {depthPick === "Double the depth" && (
          <p className="mt-2 text-sm text-emerald-300">Right — S = b·h²/6 goes as depth squared.</p>
        )}
        {depthPick !== null && depthPick !== "Double the depth" && (
          <p className="mt-2 text-sm text-amber-300">No — S = b·h²/6. Width is linear, depth is squared.</p>
        )}
      </div>
    </BenchShell>
  );
}

type SizeCase = "beam" | "column" | "shaft";

const END_LABELS: { value: EndCondition; label: string }[] = [
  { value: "pinned-pinned", label: "Pinned–pinned (K=1)" },
  { value: "fixed-free", label: "Fixed–free (K=2)" },
  { value: "fixed-fixed", label: "Fixed–fixed (K=0.5)" },
  { value: "fixed-pinned", label: "Fixed–pinned (K=0.7)" },
];

const ALLOW_AL = 276e6; // Pa, 6061-T6 yield used as the design allowable in this bench
const ALLOW_SHAFT = 150e6; // Pa
const E_AL = 68.9e9;
const G_STEEL = 79e9;

export function ComponentSizingBench() {
  const [mode, setMode] = useState<SizeCase>("beam");
  // beam
  const [P, setP] = useState(500);
  const [Lb, setLb] = useState(1.2);
  const [outer, setOuter] = useState(40);
  const [wall, setWall] = useState(3);
  // column
  const [Dc, setDc] = useState(25);
  const [wallc, setWallc] = useState(2);
  const [Lc, setLc] = useState(1.5);
  const [ends, setEnds] = useState<EndCondition>("pinned-pinned");
  // shaft
  const [M, setM] = useState(200);
  const [T, setT] = useState(300);
  const [Ds, setDs] = useState(30);
  // graded tasks
  const [t1, setT1] = useState("");
  const [t2, setT2] = useState("");
  const [t3, setT3] = useState("");
  const [graded, setGraded] = useState<boolean[]>([false, false, false]);

  const beamSec = sectionProps({ kind: "rect-tube", b: outer / 1000, h: outer / 1000, t: wall / 1000 });
  const beamMoment = P * Lb;
  const beamSigma = bendingStress(beamMoment, beamSec.S);
  const beamMS = marginOfSafety(ALLOW_AL, beamSigma);

  const colSec = sectionProps({ kind: "round-tube", d: Dc / 1000, t: wallc / 1000 });
  const le = effectiveLength(Lc, ends);
  const pcr = eulerLoad(E_AL, colSec.I, le);
  const crush = colSec.A * ALLOW_AL;
  const govern = Math.min(pcr, crush);

  const dM = Ds / 1000;
  const sigmaS = (32 * M) / (Math.PI * dM ** 3);
  const tauS = torsionalShear(T, dM / 2, (Math.PI * dM ** 4) / 32);
  const vmS = shaftVonMises(M, T, dM);
  const msS = marginOfSafety(ALLOW_SHAFT, vmS);
  const twistDeg = (twistAngle(T, 1.0, G_STEEL, (Math.PI * dM ** 4) / 32) * 180) / Math.PI;

  const mark = (i: number, ok: boolean) => setGraded((g) => g.map((v, j) => (j === i ? ok : v)));
  const score = graded.filter(Boolean).length;

  return (
    <BenchShell
      prompt="Pick a case — beam, column, or shaft — and move the sliders. || Watch the margin of safety: it must stay positive, and for the column the governing load is the lower of buckling and crush. || Then do the three sizing tasks: each asks for the smallest whole-millimeter size that passes."
      note="Euler is an upper bound for perfect columns; real codes knock it down for crookedness. Shaft twist is shown per meter of length. Allowables are stated in each case — 6061-T6 at 276 MPa for beam/column, 150 MPa for the shaft."
      controls={
        <>
          <Segmented
            label="Component"
            value={mode}
            onChange={setMode}
            options={[
              { value: "beam", label: "Cantilever beam" },
              { value: "column", label: "Column" },
              { value: "shaft", label: "Shaft" },
            ]}
          />
          {mode === "beam" && (
            <>
              <Slider label="Tip load" min={100} max={1000} step={10} value={P} display={`${fmt(P, 0)} N`} onChange={setP} />
              <Slider label="Length" min={0.5} max={2} step={0.1} value={Lb} display={`${fmt(Lb, 1)} m`} onChange={setLb} />
              <Slider label="Tube outer" min={20} max={80} step={1} value={outer} display={`${fmt(outer, 0)} mm`} onChange={setOuter} />
              <Slider label="Wall" min={1} max={8} step={0.5} value={wall} display={`${fmt(wall, 1)} mm`} onChange={setWall} />
            </>
          )}
          {mode === "column" && (
            <>
              <Slider label="Diameter" min={15} max={50} step={1} value={Dc} display={`${fmt(Dc, 0)} mm`} onChange={setDc} />
              <Slider label="Wall" min={1} max={5} step={0.5} value={wallc} display={`${fmt(wallc, 1)} mm`} onChange={setWallc} />
              <Slider label="Length" min={0.5} max={3} step={0.1} value={Lc} display={`${fmt(Lc, 1)} m`} onChange={setLc} />
              <Segmented label="End conditions" value={ends} onChange={setEnds} options={END_LABELS} />
            </>
          )}
          {mode === "shaft" && (
            <>
              <Slider label="Bending moment" min={50} max={500} step={10} value={M} display={`${fmt(M, 0)} N·m`} onChange={setM} />
              <Slider label="Torque" min={50} max={500} step={10} value={T} display={`${fmt(T, 0)} N·m`} onChange={setT} />
              <Slider label="Diameter" min={15} max={50} step={1} value={Ds} display={`${fmt(Ds, 0)} mm`} onChange={setDs} />
            </>
          )}
        </>
      }
    >
      {mode === "beam" && (
        <Readouts
          items={[
            { label: "Moment", value: `${fmt(beamMoment, 0)} N·m` },
            { label: "Stress", value: `${fmt(beamSigma / 1e6, 1)} MPa` },
            { label: "Margin", value: fmt(beamMS, 2) },
            { label: "Verdict", value: beamMS > 0 ? "PASSES" : "FAILS" },
          ]}
        />
      )}
      {mode === "column" && (
        <>
          <Readouts
            items={[
              { label: "Buckling load", value: `${fmt(pcr / 1000, 2)} kN` },
              { label: "Buckling stress", value: `${fmt(pcr / colSec.A / 1e6, 1)} MPa` },
              { label: "Crush load", value: `${fmt(crush / 1000, 1)} kN` },
              { label: "Governs", value: pcr < crush ? "Buckling" : "Crush" },
            ]}
          />
          <p className="text-sm text-well-dim">
            Effective length {fmt(le, 2)} m. Against a 2 kN service load the factor is {fmt(govern / 2000, 2)} —{" "}
            {govern >= 2000 ? "it stands." : "it fails."}
          </p>
        </>
      )}
      {mode === "shaft" && (
        <>
          <Readouts
            items={[
              { label: "Bending σ", value: `${fmt(sigmaS / 1e6, 1)} MPa` },
              { label: "Torsion τ", value: `${fmt(tauS / 1e6, 1)} MPa` },
              { label: "Von Mises", value: `${fmt(vmS / 1e6, 1)} MPa` },
              { label: "Margin", value: fmt(msS, 2) },
              { label: "Twist / m", value: `${fmt(twistDeg, 2)}°` },
            ]}
          />
          <p className="text-sm text-well-dim">
            {msS > 0 ? "Von Mises clears the 150 MPa allowable." : "Von Mises exceeds the allowable — grow the diameter."}{" "}
            Twist is shown per meter of shaft; long shafts need a twist check too.
          </p>
        </>
      )}

      <div className="mt-4 rounded-lg border border-white/15 p-4">
        <p className="text-sm font-medium text-accent">
          Sizing tasks — {score}/3 correct
        </p>
        <div className="mt-3 flex flex-col gap-4 text-sm">
          <div>
            <p className="text-well-dim">
              1. Beam: 500 N at 1.2 m on a 40 mm square tube. Smallest whole-mm wall that keeps the margin
              positive?
            </p>
            <div className="mt-1 flex items-center gap-2">
              <input className="w-24 rounded-md bg-white/10 px-2 py-1.5 tabular-nums" value={t1}
                onChange={(e) => setT1(e.target.value)} inputMode="numeric" aria-label="Wall thickness in mm" />
              <WellButton onClick={() => mark(0, Number(t1) === 2)}>Check</WellButton>
              {graded[0] && <span className="text-emerald-300">Correct — 2 mm (σ = 164 MPa).</span>}
            </div>
          </div>
          <div>
            <p className="text-well-dim">
              2. Column: 25 mm OD, 2 mm wall, 1.5 m, pinned–pinned. Euler buckling load in kN (±10%)?
            </p>
            <div className="mt-1 flex items-center gap-2">
              <input className="w-24 rounded-md bg-white/10 px-2 py-1.5 tabular-nums" value={t2}
                onChange={(e) => setT2(e.target.value)} inputMode="decimal" aria-label="Buckling load in kN" />
              <WellButton onClick={() => {
                const v = Number(t2);
                mark(1, Number.isFinite(v) && Math.abs(v - 2.914) / 2.914 <= 0.1);
              }}>Check</WellButton>
              {graded[1] && <span className="text-emerald-300">Correct — 2.91 kN, buckling stress 20.2 MPa.</span>}
            </div>
          </div>
          <div>
            <p className="text-well-dim">
              3. Shaft: M = 200 N·m, T = 300 N·m, allowable 150 MPa. Smallest whole-mm diameter with
              von Mises under the allowable?
            </p>
            <div className="mt-1 flex items-center gap-2">
              <input className="w-24 rounded-md bg-white/10 px-2 py-1.5 tabular-nums" value={t3}
                onChange={(e) => setT3(e.target.value)} inputMode="numeric" aria-label="Shaft diameter in mm" />
              <WellButton onClick={() => mark(2, Number(t3) === 29)}>Check</WellButton>
              {graded[2] && <span className="text-emerald-300">Correct — 29 mm (28.1 mm exact, rounded up).</span>}
            </div>
          </div>
        </div>
      </div>
    </BenchShell>
  );
}

// ---------------------------------------------------------------------------
// Week 28 — Iteration & optimization
// ---------------------------------------------------------------------------

const TRADE_RECORD_KEY = "ff:tradestudy-w28";
const SWEEP_RECORD_KEY = "ff:sweepconv-w28";

const TRADE_RUBRIC = [
  "Every alternative is scored on the same criteria and the same scale",
  "Scores are normalized 0..1 before weighting — no raw units were summed",
  "Dominated alternatives are named and rejected without touching the weights",
  "The winner's margin and the weight that would flip it are stated",
  "The baseline (incumbent) earned its scores honestly, with no protected row",
];

const SWEEP_RUBRIC = [
  "The sweep covers the full plausible range, not just the interesting end",
  "Refinement was spent near the pass/fail boundary and the knee",
  "The stopping rule (tolerance + consecutive iterations) was written before iterating",
  "The declaration names what dominates further precision (shop tolerance, budget, physics)",
];

function usePersisted(key: string, initial: string) {
  const [value, setValue] = useState(() => {
    try {
      return localStorage.getItem(key) ?? initial;
    } catch {
      return initial;
    }
  });
  const save = (v: string) => {
    setValue(v);
    try {
      localStorage.setItem(key, v);
    } catch {
      /* storage unavailable; the record stays in memory */
    }
  };
  return [value, save] as const;
}

export function TradeStudyBench() {
  const [weights, setWeights] = useState<Record<string, number>>(() =>
    Object.fromEntries(BRACKET_CRITERIA.map((c) => [c.id, Math.round(c.weight * 100)])),
  );
  const [grade, setGrade] = useState<{ q: number; ok: boolean; msg: string }[]>([]);
  const [record, setRecord] = usePersisted(TRADE_RECORD_KEY, "");
  const [rubric, setRubric] = useState<boolean[]>(() => TRADE_RUBRIC.map(() => false));

  const criteria = BRACKET_CRITERIA.map((c) => ({ ...c, weight: weights[c.id] ?? 0 }));
  const ranked = rankAlternatives(BRACKET_ALTERNATIVES, criteria);
  const norm = normalizeScores(BRACKET_ALTERNATIVES, criteria);
  const dominated = dominatedAlternatives(BRACKET_ALTERNATIVES, criteria);
  const winner = ranked[0];
  const runnerUp = ranked[1];
  const margins = BRACKET_CRITERIA.map((c) => ({
    id: c.id,
    name: c.name,
    ...weightFlipMargin(BRACKET_ALTERNATIVES, criteria, c.id),
  }));

  const gradeAll = () => {
    const results: { q: number; ok: boolean; msg: string }[] = [];
    results.push({
      q: 0,
      ok: winner.id === "nylon",
      msg:
        winner.id === "nylon"
          ? "Correct — at the syllabus weights, printed nylon's cheap/fast/light mix wins."
          : `At the syllabus weights the winner is printed nylon, not ${winner.name}. Reset the sliders and recheck the totals.`,
    });
    const massBest = Object.entries(norm)
      .map(([id, n]) => ({ id, v: n.mass }))
      .sort((a, b) => b.v - a.v)[0];
    results.push({
      q: 1,
      ok: massBest.id === "cfrp" && massBest.v === 1,
      msg:
        massBest.id === "cfrp"
          ? "Correct — CFRP's 45 g is the lightest observed, so it normalizes to 1 on mass."
          : "Recheck: on a minimize criterion, the lowest raw score normalizes to 1.",
    });
    results.push({
      q: 2,
      ok: dominated.length === 0,
      msg:
        dominated.length === 0
          ? "Correct — no alternative dominates another here; the ranking genuinely depends on the weights."
          : "Recheck the dominance definition: every alternative here is best at something.",
    });
    setGrade(results);
  };

  return (
    <BenchShell
      prompt="Set the five criterion weights with the sliders. || The table normalizes every score 0..1, ranks the four bracket concepts, names any dominated options, and shows how far each weight can move before the winner flips. || Answer the three graded checks, then write the decision record: winner, rejects, and the weight that would flip it."
      note="Scores in this study are honest estimates, not certified data — garbage scores in, garbage ranking out. The bench checks the machinery of the comparison, not the honesty of the inputs."
      controls={
        <>
          {BRACKET_CRITERIA.map((c) => (
            <Slider
              key={c.id}
              label={`${c.name} weight`}
              min={0}
              max={60}
              step={1}
              value={weights[c.id] ?? 0}
              display={`${weights[c.id] ?? 0} pts`}
              onChange={(v) => setWeights((w) => ({ ...w, [c.id]: v }))}
            />
          ))}
          <div className="sm:col-span-2">
            <WellButton onClick={gradeAll}>Grade the three checks</WellButton>
          </div>
        </>
      }
    >
      <Readouts
        items={[
          { label: "Winner", value: winner.name },
          {
            label: "Margin over runner-up",
            value: runnerUp ? fmt(winner.total - runnerUp.total, 3) : "—",
          },
          {
            label: "Dominated",
            value: dominated.length === 0 ? "none" : dominated.join(", "),
          },
        ]}
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm tabular-nums">
          <thead>
            <tr className="text-left text-well-dim">
              <th className="py-1 pr-3 font-medium">Concept</th>
              {BRACKET_CRITERIA.map((c) => (
                <th key={c.id} className="py-1 pr-3 font-medium">
                  {c.name}
                </th>
              ))}
              <th className="py-1 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((r, i) => (
              <tr key={r.id} className={cn(i === 0 && "text-accent")}>
                <td className="py-1 pr-3">
                  {i + 1}. {r.name}
                </td>
                {BRACKET_CRITERIA.map((c) => {
                  const alt = BRACKET_ALTERNATIVES.find((a) => a.id === r.id)!;
                  return (
                    <td key={c.id} className="py-1 pr-3 text-well-dim">
                      {alt.scores[c.id]} {c.unit} → {fmt(r.normalized[c.id], 2)}
                    </td>
                  );
                })}
                <td className="py-1 font-medium">{fmt(r.total, 3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm font-medium text-well-fg">Weight robustness — flip margins (pts)</p>
      <div className="mt-1 grid gap-2 sm:grid-cols-2">
        {margins.map((m) => (
          <div key={m.id} className="text-sm text-well-dim">
            {m.name}: up {m.up === Infinity ? "∞" : `+${m.up}`}, down{" "}
            {m.down === Infinity ? "∞" : `−${m.down}`} before the winner changes
          </div>
        ))}
      </div>
      {grade.length > 0 && (
        <div className="mt-4 space-y-2">
          {grade.map((g) => (
            <p key={g.q} className={cn("text-sm leading-relaxed", g.ok ? "text-accent" : "text-well-dim")}>
              {g.ok ? "✓" : "✗"} {g.msg}
            </p>
          ))}
        </div>
      )}
      <div className="mt-5">
        <p className="text-sm font-medium text-well-fg">Decision record (persisted)</p>
        <textarea
          value={record}
          onChange={(e) => setRecord(e.target.value)}
          rows={4}
          placeholder="Winner, rejects with causes, the weight that would flip it…"
          className="mt-2 w-full rounded-lg bg-black/20 p-3 text-sm text-well-fg ring-1 ring-white/15 placeholder:text-well-dim"
        />
        <div className="mt-3 space-y-1">
          {TRADE_RUBRIC.map((item, i) => (
            <label key={item} className="flex items-start gap-2 text-sm text-well-dim">
              <input
                type="checkbox"
                checked={rubric[i]}
                onChange={() => setRubric((r) => r.map((v, j) => (j === i ? !v : v)))}
                className="mt-1"
              />
              {item}
            </label>
          ))}
        </div>
        <p className="mt-2 text-sm text-well-dim">
          Rubric: {rubric.filter(Boolean).length}/{TRADE_RUBRIC.length} self-checked
        </p>
      </div>
    </BenchShell>
  );
}

type SweepRun = { step: number; minPass: number; points: number };

export function SweepBench() {
  const [step, setStep] = useState<number>(10);
  const [runs, setRuns] = useState<SweepRun[]>([]);
  const [tol, setTol] = useState(5);
  const [answer, setAnswer] = useState("");
  const [graded, setGraded] = useState<{ ok: boolean; msg: string } | null>(null);
  const [record, setRecord] = usePersisted(SWEEP_RECORD_KEY, "");
  const [rubric, setRubric] = useState<boolean[]>(() => SWEEP_RUBRIC.map(() => false));

  const n = Math.round((80 - 20) / step);
  const pts = sweep(beamDeflectionM, 20, 80, n);
  const passIdx = firstPassingIndex(pts, (p) => p.y <= BEAM_CASE.deflectionLimitM);
  const minPass = passIdx >= 0 ? pts[passIdx].x : NaN;

  const runSweep = () => {
    if (passIdx < 0) return;
    setRuns((r) => [...r, { step, minPass, points: pts.length }]);
  };

  const history = runs.map((r) => r.minPass);
  const converged = hasConverged(history, tol / 100, 2);

  const gradeAnswer = () => {
    const v = Number(answer);
    const ok = Number.isFinite(v) && Math.abs(v - BEAM_CASE.answerDepthMm) <= 0.5;
    setGraded({
      ok,
      msg: ok
        ? "Correct — 53 mm is the minimal whole-mm depth under the 2 mm limit; 52 mm deflects 2.03 mm."
        : `Not quite — refine around the boundary: 52 mm gives 2.03 mm (fail), 53 mm gives 1.92 mm (pass).`,
    });
  };

  const w = 320;
  const h = 130;
  const pad = 26;
  const xOf = (x: number) => pad + ((x - 20) / 60) * (w - pad * 2);
  const maxY = 40;
  const yOf = (yMm: number) => h - pad - (Math.min(yMm, maxY) / maxY) * (h - pad * 2);
  const line = pts.map((p) => `${xOf(p.x)},${yOf(p.y * 1000)}`).join(" ");

  return (
    <BenchShell
      prompt="Pick a step size and run the depth sweep from 20 to 80 mm. || The curve shows deflection against the 2 mm limit; each run logs the minimal passing depth into the iteration history, and the convergence test checks your written tolerance against it. || Enter the minimal passing whole-mm depth, then write the stopping declaration: converged or budget-stopped, with the evidence."
      note="Euler-Bernoulli bending only: shear deflection, self-weight, and buckling are ignored, the width is frozen at 40 mm, and the load is a single 200 N tip force. The stopping-rule machinery is the point; the beam is the vehicle."
      controls={
        <>
          <Segmented
            label="Sweep step"
            value={String(step)}
            onChange={(v) => setStep(Number(v))}
            options={[
              { value: "10", label: "10 mm" },
              { value: "5", label: "5 mm" },
              { value: "2", label: "2 mm" },
              { value: "1", label: "1 mm" },
            ]}
          />
          <Slider
            label="Convergence tolerance"
            min={1}
            max={20}
            step={1}
            value={tol}
            display={`${tol}%`}
            onChange={setTol}
          />
          <div className="sm:col-span-2 flex flex-wrap gap-3">
            <WellButton onClick={runSweep}>Run sweep & log iteration</WellButton>
            <WellButton
              onClick={() => {
                setRuns([]);
                setGraded(null);
              }}
            >
              Clear history
            </WellButton>
          </div>
        </>
      }
    >
      <Readouts
        items={[
          { label: "This sweep's min passing depth", value: Number.isFinite(minPass) ? `${fmt(minPass, 0)} mm` : "—" },
          {
            label: "Deflection there",
            value: Number.isFinite(minPass) ? `${fmt(beamDeflectionM(minPass) * 1000, 2)} mm` : "—",
          },
          {
            label: "Mass there",
            value: Number.isFinite(minPass) ? `${fmt(beamMassKg(minPass), 2)} kg` : "—",
          },
          {
            label: "Converged (±tol, 2 iters)",
            value: runs.length < 3 ? "need 3 runs" : converged ? "yes" : "not yet",
          },
        ]}
      />
      <svg viewBox={`0 0 ${w} ${h}`} className="h-40 w-full" role="img" aria-label="Deflection versus depth sweep">
        <line
          x1={xOf(20)}
          y1={yOf(BEAM_CASE.deflectionLimitM * 1000)}
          x2={xOf(80)}
          y2={yOf(BEAM_CASE.deflectionLimitM * 1000)}
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="4 3"
          opacity="0.6"
        />
        <polyline points={line} fill="none" stroke="currentColor" strokeWidth="2" />
        {Number.isFinite(minPass) && (
          <circle cx={xOf(minPass)} cy={yOf(beamDeflectionM(minPass) * 1000)} r="4" fill="currentColor" />
        )}
      </svg>
      <p className="mt-2 text-sm text-well-dim">
        Dashed line: the 2 mm requirement. The curve is a 1/h³ hyperbola — each added millimeter buys
        less than the last. The dot marks this sweep's first passing depth.
      </p>
      {runs.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-well-fg">Iteration history</p>
          <div className="mt-1 space-y-1 text-sm tabular-nums text-well-dim">
            {runs.map((r, i) => {
              const prev = i > 0 ? runs[i - 1].minPass : null;
              const change = prev !== null ? Math.abs((r.minPass - prev) / r.minPass) * 100 : null;
              return (
                <div key={i}>
                  Run {i + 1}: {r.step} mm step, {r.points} points → min passing {fmt(r.minPass, 0)} mm
                  {change !== null && ` (Δ ${fmt(change, 1)}%)`}
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="flex flex-col text-sm text-well-dim">
          Minimal passing whole-mm depth
          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            inputMode="decimal"
            placeholder="mm"
            className="mt-1 w-28 rounded-lg bg-black/20 p-2 text-sm text-well-fg ring-1 ring-white/15 placeholder:text-well-dim"
          />
        </label>
        <WellButton onClick={gradeAnswer}>Check</WellButton>
        {graded && (
          <p className={graded.ok ? "text-sm text-accent" : "text-sm text-well-dim"}>
            {graded.ok ? "✓" : "✗"} {graded.msg}
          </p>
        )}
      </div>
      <div className="mt-5">
        <p className="text-sm font-medium text-well-fg">Stopping declaration (persisted)</p>
        <textarea
          value={record}
          onChange={(e) => setRecord(e.target.value)}
          rows={4}
          placeholder="Converged or budget-stopped? Evidence, and what dominates further precision…"
          className="mt-2 w-full rounded-lg bg-black/20 p-3 text-sm text-well-fg ring-1 ring-white/15 placeholder:text-well-dim"
        />
        <div className="mt-3 space-y-1">
          {SWEEP_RUBRIC.map((item, i) => (
            <label key={item} className="flex items-start gap-2 text-sm text-well-dim">
              <input
                type="checkbox"
                checked={rubric[i]}
                onChange={() => setRubric((r) => r.map((v, j) => (j === i ? !v : v)))}
                className="mt-1"
              />
              {item}
            </label>
          ))}
        </div>
        <p className="mt-2 text-sm text-well-dim">
          Rubric: {rubric.filter(Boolean).length}/{SWEEP_RUBRIC.length} self-checked
        </p>
      </div>
    </BenchShell>
  );
}
