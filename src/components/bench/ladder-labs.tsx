import { useState } from "react";
import { LADDER_INPUTS as L, bonusPosition, ladderCreepHours, ladderModeHz, ladderWhirlRpm, ladderCrackGrowth, ladderToolLifeMinutes } from "@/course/ladder-inputs";
import type { LadderBenchId } from "@/course/types";
import { cn } from "@/lib/cn";
import { BenchShell, fmt, Readouts, Slider, useReducedMotion, useTicker } from "./ui";

type SliderSpec = {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  digits: number;
  suffix: string;
};

type ChoiceSpec = { key: string; options: { value: number; label: string }[] };

type LabView = {
  readouts: { label: string; value: string }[];
  sentence: string;
  aux: Record<string, number>;
};

type SketchKind =
  | "spring"
  | "spin"
  | "wave"
  | "creep"
  | "quench"
  | "gear"
  | "roll"
  | "whirl"
  | "crack"
  | "torch"
  | "line"
  | "meter"
  | "station"
  | "flow"
  | "drop"
  | "rim"
  | "lever"
  | "seam"
  | "shaft"
  | "bow"
  | "fibers"
  | "offset"
  | "hull"
  | "front"
  | "pin"
  | "coil"
  | "nest"
  | "layers"
  | "race"
  | "snap"
  | "scar";

type LabSpec = {
  prompt: string;
  note: string;
  animate: boolean;
  sketch: SketchKind;
  sliders: SliderSpec[];
  choices?: ChoiceSpec;
  initial: Record<string, number>;
  view: (v: Record<string, number>) => LabView;
};

function n(v: Record<string, number>, key: string) {
  return v[key] ?? 0;
}

function Sketch({ kind, t, aux }: { kind: SketchKind; t: number; aux: Record<string, number> }) {
  if (kind === "spring") {
    const period = Math.max(0.2, aux.period || 0.6);
    const y = 78 + Math.sin((2 * Math.PI * t) / period) * 26;
    return (
      <svg viewBox="0 0 320 140" className="h-32 w-full" aria-hidden>
        <line x1="160" y1="12" x2="160" y2={y - 14} stroke="currentColor" strokeWidth="2" />
        <circle cx="160" cy={y} r="12" fill="currentColor" />
      </svg>
    );
  }
  if (kind === "spin") {
    const reach = aux.reach ?? 78;
    const ang = t * (aux.omega || 1);
    const x2 = 160 + Math.cos(ang) * reach;
    const y2 = 70 + Math.sin(ang) * reach * 0.46;
    return (
      <svg viewBox="0 0 320 140" className="h-32 w-full" aria-hidden>
        <circle cx="160" cy="70" r="4" fill="currentColor" />
        <line x1="160" y1="70" x2={x2} y2={y2} stroke="currentColor" strokeWidth="3" />
        <circle cx={x2} cy={y2} r="7" fill="currentColor" />
      </svg>
    );
  }
  if (kind === "wave") {
    const pts: string[] = [];
    for (let i = 0; i <= 32; i++) {
      const x = 20 + i * 8.5;
      const y = 70 + Math.sin(i * 0.55 - t * (aux.pace || 2)) * 22;
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return (
      <svg viewBox="0 0 320 140" className="h-32 w-full" aria-hidden>
        <polyline points={pts.join(" ")} fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }
  if (kind === "creep") {
    const pace = Math.max(0.35, aux.pace || 1);
    const sag = 8 + (((t * pace) % 5) / 5) * 36;
    return (
      <svg viewBox="0 0 320 140" className="h-32 w-full" aria-hidden>
        <path d={`M30 50 Q160 ${50 + sag} 290 50`} fill="none" stroke="currentColor" strokeWidth="3" />
        <line x1="30" y1="40" x2="30" y2="64" stroke="currentColor" strokeWidth="2" />
        <line x1="290" y1="40" x2="290" y2="64" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }
  if (kind === "quench") {
    const thick = Math.max(0.15, Math.min(1, aux.core || 0.45));
    const cool = (t / (1.6 + thick * 3.2)) % 1;
    const hot = (1 - cool) * (10 + thick * 26);
    return (
      <svg viewBox="0 0 320 140" className="h-32 w-full" aria-hidden>
        <rect x="90" y="36" width="140" height="68" fill="none" stroke="currentColor" strokeWidth="2" />
        <rect
          x={160 - hot}
          y={70 - hot * 0.85}
          width={Math.max(4, hot * 2)}
          height={Math.max(6, hot * 1.7)}
          fill="currentColor"
          opacity={0.35 + (1 - cool) * 0.55}
        />
      </svg>
    );
  }
  if (kind === "gear") {
    const ratio = Math.max(1, aux.ratio || 3);
    const a = t * 1.4;
    const x2 = 168 + Math.cos(-a / ratio) * 28;
    const y2 = 70 + Math.sin(-a / ratio) * 28;
    const x1 = 104 + Math.cos(a) * 16;
    const y1 = 70 + Math.sin(a) * 16;
    return (
      <svg viewBox="0 0 320 140" className="h-32 w-full" aria-hidden>
        <circle cx="104" cy="70" r="22" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="168" cy="70" r="36" fill="none" stroke="currentColor" strokeWidth="2" />
        <line x1="104" y1="70" x2={x1} y2={y1} stroke="currentColor" strokeWidth="2" />
        <line x1="168" y1="70" x2={x2} y2={y2} stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }
  if (kind === "roll") {
    const h = 18 + (aux.thin || 0.4) * 28;
    const ang = t * 3;
    const spoke = (cx: number, cy: number, r: number, dir: number) => {
      const x2 = cx + Math.cos(ang * dir) * r;
      const y2 = cy + Math.sin(ang * dir) * r;
      return <line x1={cx} y1={cy} x2={x2} y2={y2} stroke="currentColor" strokeWidth="2" />;
    };
    return (
      <svg viewBox="0 0 320 140" className="h-32 w-full" aria-hidden>
        <circle cx="150" cy="46" r="22" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="150" cy="96" r="22" fill="none" stroke="currentColor" strokeWidth="2" />
        {spoke(150, 46, 14, 1)}
        {spoke(150, 96, 14, -1)}
        <rect x="20" y={70 - h / 2} width="110" height={h} fill="none" stroke="currentColor" strokeWidth="2" />
        <rect x="170" y={78 - h * 0.35} width="120" height={h * 0.7} fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }
  if (kind === "whirl") {
    const amp = Math.max(2, Math.min(36, aux.amp || 4));
    const rate = Math.max(1.5, aux.pace || 6);
    const y = 70 + Math.sin(t * rate) * amp;
    return (
      <svg viewBox="0 0 320 140" className="h-32 w-full" aria-hidden>
        <line x1="40" y1="70" x2="280" y2={y} stroke="currentColor" strokeWidth="3" />
        <circle cx="160" cy={(70 + y) / 2} r="8" fill="currentColor" />
      </svg>
    );
  }
  if (kind === "crack") {
    const len = aux.hold ? 36 : 24 + 200 * ((t % 5) / 5) ** 3;
    return (
      <svg viewBox="0 0 320 140" className="h-32 w-full" aria-hidden>
        <rect x="30" y="48" width="260" height="40" fill="none" stroke="currentColor" strokeWidth="2" />
        <line x1="30" y1="68" x2={30 + len} y2="68" stroke="currentColor" strokeWidth="3" />
      </svg>
    );
  }
  if (kind === "torch") {
    const x = 40 + ((t * 40) % 240);
    return (
      <svg viewBox="0 0 320 140" className="h-32 w-full" aria-hidden>
        <rect x="24" y="78" width="272" height="16" fill="none" stroke="currentColor" strokeWidth="2" />
        <rect x="24" y="62" width="272" height="16" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d={`M${x} 20 L${x - 8} 62 L${x + 8} 62 Z`} fill="currentColor" />
      </svg>
    );
  }
  if (kind === "station") {
    const times = [aux.a || 1, aux.b || 1, aux.c || 1];
    const total = times.reduce((s, x) => s + x, 0) || 1;
    let along = (t % (total / 10)) * 10;
    let index = 0;
    for (let i = 0; i < 3; i++) {
      if (along <= times[i]) {
        index = i;
        break;
      }
      along -= times[i];
      index = i;
    }
    return (
      <svg viewBox="0 0 320 140" className="h-32 w-full" aria-hidden>
        {[0, 1, 2].map((i) => (
          <rect
            key={i}
            x={30 + i * 96}
            y="48"
            width="70"
            height="44"
            fill={i === index ? "currentColor" : "none"}
            opacity={i === index ? 0.85 : 1}
            stroke="currentColor"
            strokeWidth="2"
          />
        ))}
      </svg>
    );
  }
  if (kind === "meter") {
    const level = Math.max(0, Math.min(1, aux.level || 0));
    return (
      <svg viewBox="0 0 320 140" className="h-28 w-full" aria-hidden>
        <rect x="30" y="58" width="260" height="16" fill="none" stroke="currentColor" strokeWidth="2" />
        <rect x="30" y="58" width={260 * level} height="16" fill="currentColor" />
      </svg>
    );
  }
  if (kind === "flow") {
    const speed = 0.25 + Math.max(0, aux.speed || 0) * 2.4;
    const level = Math.max(0, Math.min(1, aux.level ?? 1));
    const dots = [0, 1, 2, 3, 4, 5].map((i) => {
      let u = (t * speed * 0.22 + i / 6) % 1;
      if (u > 0.38 && u < 0.62) u = 0.38 + (u - 0.38) * (0.55 + speed * 0.25);
      const x = 28 + Math.min(0.98, u) * 264;
      const narrow = x > 118 && x < 202 ? 10 : 22;
      return { x, narrow };
    });
    return (
      <svg viewBox="0 0 320 140" className="h-32 w-full" aria-hidden>
        <path d="M24 48 H118 L150 62 H170 L202 48 H296 V92 H202 L170 78 H150 L118 92 H24 Z" fill="none" stroke="currentColor" strokeWidth="2" />
        {dots.map((dot, index) => (
          <circle key={index} cx={dot.x} cy="70" r="3.5" fill="currentColor" />
        ))}
        <rect x="24" y="108" width="120" height="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <rect x="24" y="108" width={120 * level} height="8" fill="currentColor" />
      </svg>
    );
  }
  if (kind === "drop") {
    const h = Math.max(0.15, Math.min(1, aux.drop || 0.5));
    const cycle = 2.2;
    const phase = (t % cycle) / cycle;
    let y = 24;
    let squash = 4;
    if (phase < 0.58) {
      const f = phase / 0.58;
      y = 24 + f * f * 62 * h;
      squash = 4;
    } else if (phase < 0.78) {
      const f = (phase - 0.58) / 0.2;
      y = 24 + 62 * h;
      squash = 4 + Math.sin(f * Math.PI) * (8 + 16 * h);
    } else {
      y = 24 + 62 * h;
      squash = 4;
    }
    return (
      <svg viewBox="0 0 320 140" className="h-32 w-full" aria-hidden>
        <rect x="108" y={108 - squash} width="104" height={squash} fill="currentColor" opacity="0.85" />
        <line x1="96" y1="112" x2="224" y2="112" stroke="currentColor" strokeWidth="2" />
        <circle cx="160" cy={y} r="10" fill="currentColor" />
      </svg>
    );
  }
  if (kind === "rim") {
    return (
      <svg viewBox="0 0 320 140" className="h-32 w-full" aria-hidden>
        <circle cx="96" cy="70" r="36" fill="currentColor" opacity="0.85" />
        <circle cx="96" cy="70" r="4" fill="none" stroke="currentColor" strokeWidth="0" />
        <circle cx="224" cy="70" r="36" fill="none" stroke="currentColor" strokeWidth="8" />
      </svg>
    );
  }
  if (kind === "lever") {
    const th = ((aux.twist || 0) * Math.PI) / 180;
    const x2 = 78 + Math.sin(th) * 92;
    const y2 = 108 - Math.cos(th) * 78;
    return (
      <svg viewBox="0 0 320 140" className="h-32 w-full" aria-hidden>
        <circle cx="78" cy="108" r="5" fill="currentColor" />
        <line x1="78" y1="108" x2={x2} y2={y2} stroke="currentColor" strokeWidth="3" />
        <line x1={x2} y1={y2} x2={x2} y2={y2 + 28} stroke="currentColor" strokeWidth="2" />
        <path d={`M${x2 - 5} ${y2 + 20} L${x2} ${y2 + 28} L${x2 + 5} ${y2 + 20}`} fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }
  if (kind === "seam") {
    const frac = Math.max(0, aux.frac || 0);
    const reach = Math.min(1, frac) * 200;
    const leak = frac > 1;
    const drip = 78 + ((t * 36) % 40);
    return (
      <svg viewBox="0 0 320 140" className="h-32 w-full" aria-hidden>
        <rect x="50" y="48" width="220" height="28" fill="none" stroke="currentColor" strokeWidth="2" />
        <line x1="50" y1="62" x2={50 + reach} y2="62" stroke="currentColor" strokeWidth="3" />
        {leak ? <circle cx={250} cy={drip} r="3" fill="currentColor" /> : null}
      </svg>
    );
  }
  if (kind === "shaft") {
    const ang = t * 0.9;
    const twist = ((aux.twist || 0) * Math.PI) / 180;
    const x1 = 160 + Math.cos(ang) * 36;
    const y1 = 70 + Math.sin(ang) * 36;
    const x2 = 160 + Math.cos(ang + twist) * 36;
    const y2 = 70 + Math.sin(ang + twist) * 36;
    return (
      <svg viewBox="0 0 320 140" className="h-32 w-full" aria-hidden>
        <circle cx="160" cy="70" r="40" fill="none" stroke="currentColor" strokeWidth="2" />
        <line x1="160" y1="70" x2={x1} y2={y1} stroke="currentColor" strokeWidth="2" opacity="0.4" />
        <line x1="160" y1="70" x2={x2} y2={y2} stroke="currentColor" strokeWidth="3" />
      </svg>
    );
  }
  if (kind === "bow") {
    const amp = Math.min(46, Math.max(4, (aux.bow || 1) * 6));
    const phase = t % 3.2;
    const grown = phase < 1.3 ? phase / 1.3 : phase < 2.5 ? 1 : Math.max(0, 1 - (phase - 2.5) / 0.7);
    const sag = amp * grown;
    return (
      <svg viewBox="0 0 320 140" className="h-32 w-full" aria-hidden>
        <path d={`M36 58 Q160 ${58 + sag} 284 58`} fill="none" stroke="currentColor" strokeWidth="3" />
        <line x1="36" y1="48" x2="36" y2="70" stroke="currentColor" strokeWidth="2" />
        <line x1="284" y1="48" x2="284" y2="70" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }
  if (kind === "fibers") {
    const th = ((aux.twist || 0) * Math.PI) / 180;
    const lines = [-28, -14, 0, 14, 28].map((offset) => {
      const cx = 150;
      const cy = 78 + offset * Math.cos(th);
      const dx = Math.cos(th) * 70;
      const dy = Math.sin(th) * 28;
      return `M${cx - dx} ${cy - dy} L${cx + dx} ${cy + dy}`;
    });
    return (
      <svg viewBox="0 0 320 140" className="h-32 w-full" aria-hidden>
        {lines.map((d) => (
          <path key={d} d={d} fill="none" stroke="currentColor" strokeWidth="2" />
        ))}
        <line x1="250" y1="18" x2="250" y2="52" stroke="currentColor" strokeWidth="2" />
        <path d="M245 44 L250 54 L255 44" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }
  if (kind === "offset") {
    const x = 160 + Math.min(36, aux.twist || 0);
    return (
      <svg viewBox="0 0 320 140" className="h-32 w-full" aria-hidden>
        <line x1="160" y1="28" x2="160" y2="118" stroke="currentColor" strokeWidth="1" opacity="0.35" />
        <rect x="132" y="48" width="56" height="64" fill="none" stroke="currentColor" strokeWidth="2" />
        <line x1={x} y1="16" x2={x} y2="48" stroke="currentColor" strokeWidth="2" />
        <path d={`M${x - 5} 40 L${x} 48 L${x + 5} 40`} fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }
  if (kind === "hull") {
    const sub = Math.max(0, Math.min(1, aux.level ?? 0));
    const sunk = (aux.sink ?? 0) > 0.5;
    const top = 28;
    const h = 64;
    const waterY = sunk ? 16 : top + (1 - sub) * h;
    return (
      <svg viewBox="0 0 320 140" className="h-32 w-full" aria-hidden>
        <rect x="118" y={top} width="84" height={h} fill="none" stroke="currentColor" strokeWidth="2" />
        <rect x="36" y={waterY} width="248" height={Math.max(0, 128 - waterY)} fill="currentColor" opacity="0.22" />
        <line x1="36" y1={waterY} x2="284" y2={waterY} stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }
  if (kind === "front") {
    const level = Math.max(0.04, Math.min(1, aux.level || 0));
    return (
      <svg viewBox="0 0 320 140" className="h-28 w-full" aria-hidden>
        <rect x="28" y="52" width="264" height="36" fill="none" stroke="currentColor" strokeWidth="2" />
        <rect x="28" y="52" width={264 * level} height="36" fill="currentColor" opacity="0.8" />
      </svg>
    );
  }
  if (kind === "pin") {
    const r = 6 + Math.max(0, Math.min(1, aux.level || 0)) * 16;
    return (
      <svg viewBox="0 0 320 140" className="h-32 w-full" aria-hidden>
        <rect x="48" y="40" width="78" height="60" fill="none" stroke="currentColor" strokeWidth="2" />
        <rect x="194" y="40" width="78" height="60" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="160" cy="70" r={r} fill="currentColor" />
      </svg>
    );
  }
  if (kind === "coil") {
    const squash = Math.max(0, Math.min(1, aux.level || 0));
    const span = 210 * (1 - 0.62 * squash);
    const left = 160 - span / 2;
    const turns = 8;
    let d = `M${left.toFixed(1)} 70`;
    for (let i = 0; i < turns; i++) {
      const x = left + ((i + 0.5) * span) / turns;
      const y = i % 2 === 0 ? 40 : 100;
      const end = left + ((i + 1) * span) / turns;
      d += ` Q${x.toFixed(1)} ${y} ${end.toFixed(1)} 70`;
    }
    return (
      <svg viewBox="0 0 320 140" className="h-32 w-full" aria-hidden>
        <path d={d} fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }
  if (kind === "nest") {
    const base = Math.max(0, Math.round(aux.a || 0));
    const side = Math.max(0, Math.round(aux.b || 0));
    const end = Math.max(0, Math.round(aux.c || 0));
    const dots: Array<[number, number]> = [];
    for (let i = 0; i < base; i++) dots.push([108 + i * 26, 112]);
    for (let i = 0; i < side; i++) dots.push([78, 46 + i * 24]);
    for (let i = 0; i < end; i++) dots.push([248, 78]);
    return (
      <svg viewBox="0 0 320 140" className="h-32 w-full" aria-hidden>
        <rect x="96" y="36" width="128" height="68" fill="none" stroke="currentColor" strokeWidth="2" />
        {dots.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="5" fill="currentColor" />
        ))}
      </svg>
    );
  }
  if (kind === "layers") {
    const gap = 3 + Math.min(3, Math.max(0, aux.gap || 0)) * 6;
    return (
      <svg viewBox="0 0 320 140" className="h-32 w-full" aria-hidden>
        {[0, 1, 2].map((i) => (
          <rect key={i} x="70" y={28 + i * (16 + gap)} width="180" height="14" fill="currentColor" opacity="0.85" />
        ))}
      </svg>
    );
  }
  if (kind === "race") {
    const takt = Math.max(0.2, aux.takt || 1);
    const cycle = Math.max(0.2, aux.cycle || 1);
    const max = Math.max(takt, cycle);
    return (
      <svg viewBox="0 0 320 140" className="h-28 w-full" aria-hidden>
        <rect x="28" y="36" width="250" height="16" fill="none" stroke="currentColor" strokeWidth="2" />
        <rect x="28" y="36" width={250 * (takt / max)} height="16" fill="currentColor" opacity="0.35" />
        <rect x="28" y="78" width="250" height="16" fill="none" stroke="currentColor" strokeWidth="2" />
        <rect x="28" y="78" width={250 * (cycle / max)} height="16" fill="currentColor" />
      </svg>
    );
  }
  if (kind === "snap") {
    const cold = (aux.cold || 0) > 0.5;
    return (
      <svg viewBox="0 0 320 140" className="h-32 w-full" aria-hidden>
        {cold ? (
          <>
            <rect x="36" y="58" width="100" height="18" fill="none" stroke="currentColor" strokeWidth="2" />
            <rect x="184" y="64" width="100" height="18" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M136 67 L160 80 L184 67" fill="none" stroke="currentColor" strokeWidth="2" />
          </>
        ) : (
          <path d="M36 52 H120 Q160 96 200 52 H284 M36 82 H120 Q160 38 200 82 H284" fill="none" stroke="currentColor" strokeWidth="2" />
        )}
      </svg>
    );
  }
  if (kind === "scar") {
    const depth = 6 + Math.min(1, Math.max(0, aux.level || 0)) * 36;
    return (
      <svg viewBox="0 0 320 140" className="h-32 w-full" aria-hidden>
        <rect x="40" y="36" width="240" height="70" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d={`M70 50 Q160 ${50 + depth} 250 50`} fill="none" stroke="currentColor" strokeWidth="3" />
      </svg>
    );
  }
  const twist = ((aux.twist || 0) * Math.PI) / 180;
  const y = 70 + Math.sin(twist) * 24;
  return (
    <svg viewBox="0 0 320 140" className="h-32 w-full" aria-hidden>
      <line x1="40" y1="70" x2="280" y2={y} stroke="currentColor" strokeWidth="4" />
      <circle cx="280" cy={y} r="6" fill="currentColor" />
    </svg>
  );
}

function FormulaBench({ spec }: { spec: LabSpec }) {
  const [values, setValues] = useState(spec.initial);
  const [t, setT] = useState(0);
  const reduce = useReducedMotion();
  useTicker(spec.animate && !reduce, (dt) => setT((s) => s + dt));
  const view = spec.view(values);
  const shownT = spec.animate && reduce ? 1.7 : t;
  return (
    <BenchShell
      prompt={spec.prompt}
      note={spec.note}
      controls={
        <>
          {spec.choices ? (
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              {spec.choices.options.map((option) => {
                const choiceKey = spec.choices?.key ?? "";
                return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setValues((prev) => ({ ...prev, [choiceKey]: option.value }))}
                  className={cn(
                    "min-h-11 rounded-lg px-3 py-2 text-sm",
                    values[choiceKey] === option.value ? "bg-well-fg text-well" : "ring-1 ring-white/25",
                  )}
                >
                  {option.label}
                </button>
                );
              })}
            </div>
          ) : null}
          {spec.sliders.map((slider) => (
            <Slider
              key={slider.key}
              label={slider.label}
              min={slider.min}
              max={slider.max}
              step={slider.step}
              value={n(values, slider.key)}
              display={`${fmt(n(values, slider.key), slider.digits)}${slider.suffix}`}
              onChange={(next) => setValues((prev) => ({ ...prev, [slider.key]: next }))}
            />
          ))}
        </>
      }
    >
      <Readouts items={view.readouts} />
      <Sketch kind={spec.sketch} t={shownT} aux={view.aux} />
      <p className="mt-3 text-sm leading-relaxed text-well-dim">{view.sentence}</p>
    </BenchShell>
  );
}

const sortJobs = {
  duty: {
    prompt:
      "Read the service, then pick the damage that is impatient. || The note names the one that arrives first. Room-temperature yield is not always that one.",
    note: "Another mechanism can still be in the room. The question is which one you have to calculate before the others are worth arguing about.",
    doneGood: "The impatient mechanism is separating from the one you happen to know how to calculate.",
    doneBad: "Read the condition that cannot be ignored — time, a returning stress, a crack, or a slenderness — and match that.",
    jobs: [
      {
        job: "A bolt held at 600°C for a thousand hours.",
        answer: "Creep",
        why: "The temperature is high and the clock is long. The yield strength from a room-temperature datasheet has left the problem.",
      },
      {
        job: "A polished steel rod, fully reversed, a million cycles, in room air.",
        answer: "Fatigue",
        why: "The stress returns. Surviving one pull is a different sentence from surviving the millionth.",
      },
      {
        job: "A thin wall, a scratch, a steady load, and a modest toughness.",
        answer: "Fracture",
        why: "The scratch is already a crack. Stress intensity against toughness decides, not the average stress across the wall.",
      },
      {
        job: "A steel bracket outdoors for ten years. The load never changes.",
        answer: "Corrosion",
        why: "The force stays. The area does not. Stress climbs because the denominator rusts away.",
      },
    ],
    acts: ["Creep", "Fatigue", "Fracture", "Corrosion"],
  },
  review: {
    prompt:
      "Name the impatient mechanism for each part. || Buckling, fatigue, fracture, or creep. The material can be strong and still lose.",
    note: "A real review writes the one that arrives first, then checks the others. This sort only asks for the first.",
    doneGood: "The impatient mechanism is separating from the one you happen to know how to calculate.",
    doneBad: "Read the condition that cannot be ignored — time, a returning stress, a crack, or a slenderness — and match that.",
    jobs: [
      {
        job: "A long thin strut in compression. Yield strength is generous.",
        answer: "Buckling",
        why: "Euler does not consult the yield strength until the strut is stocky. Length and the second moment get there first.",
      },
      {
        job: "A rotating shaft with a shoulder. The nominal stress is under yield.",
        answer: "Fatigue",
        why: "The shoulder is a notch, and the stress returns every revolution. Below yield is not a life.",
      },
      {
        job: "A pressure shell with a long crack and a low toughness.",
        answer: "Fracture",
        why: "The crack can be unstable while the average hoop stress still looks calm. K is the check.",
      },
      {
        job: "A hanger near 0.6 of the melting temperature, loaded for a year.",
        answer: "Creep",
        why: "A year at that temperature is not a statics problem. The part keeps moving.",
      },
    ],
    acts: ["Buckling", "Fatigue", "Fracture", "Creep"],
  },
  face: {
    prompt:
      "Read the face, then name the mode. || Dimples, a flat chevron face, beach marks, or grains. The last dull patch does not rename the marks behind it.",
    note: "A diagram of the description, not a micrograph. Real faces mix. Name the mode that ran for the life, not the tear that finished it.",
    doneGood: "The face is naming the mode. The calculation comes after the name.",
    doneBad: "Match the marks. Dimples tear. A flat bright face cleaves. Beach marks fatigue. Grains are intergranular.",
    jobs: [
      {
        job: "The break is a cup and cone. The surface is dull and full of tiny dimples.",
        answer: "Ductile",
        why: "Each dimple was a void that grew and joined. The metal used its ductility. This is overload.",
      },
      {
        job: "The break is flat and bright, with chevron marks pointing back to one origin. Almost no neck.",
        answer: "Cleavage",
        why: "It parted on crystal planes. Little plasticity. Cold, a high rate, or a coarse grain pushes a steel here.",
      },
      {
        job: "A thumbnail sits at the surface. Curved beach marks bow out from it. The last patch is dull.",
        answer: "Fatigue",
        why: "The thumbnail is the origin and the bands are cycles. The dull patch is only how it finished.",
      },
      {
        job: "The face looks like rock candy. The crack followed the grain boundaries.",
        answer: "Intergranular",
        why: "The boundary was the weak path. That can be embrittlement or a chemical film. The grains themselves did not tear.",
      },
    ],
    acts: ["Ductile", "Cleavage", "Fatigue", "Intergranular"],
  },
} as const;

function DamageFilm({ kind }: { kind: string }) {
  const [t, setT] = useState(0);
  const reduce = useReducedMotion();
  useTicker(!reduce, (dt) => setT((s) => s + dt));
  const p = reduce ? 1 : (t % 2.8) / 2.8;
  const grow = Math.min(1, p / 0.72);
  const caption =
    kind === "Creep"
      ? "Creep: the load stays. The bar keeps sagging."
      : kind === "Fatigue"
        ? "Fatigue: the load reverses. The nick advances."
        : kind === "Fracture"
          ? "Fracture: the crack runs while the average can still look calm."
          : kind === "Corrosion"
            ? "Corrosion: the force stays. The wall gets thinner."
            : "Buckling: the ends are pushed. The strut bows before it yields.";
  return (
    <div className="mt-5">
      <svg viewBox="0 0 320 72" className="h-16 w-full" aria-hidden>
        {kind === "Creep" ? (
          <path
            d={`M28 28 Q160 ${28 + grow * 32} 292 28`}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
        ) : null}
        {kind === "Fatigue" ? (
          <>
            <rect x="70" y="24" width="180" height="22" fill="none" stroke="currentColor" strokeWidth="2" />
            <line x1="160" y1="24" x2="160" y2={24 + 4 + grow * 18} stroke="currentColor" strokeWidth="2" />
            <path
              d={Math.floor(t / 0.45) % 2 === 0 ? "M262 35 H292 M284 29 L292 35 L284 41" : "M58 35 H28 M36 29 L28 35 L36 41"}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </>
        ) : null}
        {kind === "Fracture" ? (
          grow < 0.78 ? (
            <>
              <rect x="36" y="26" width="248" height="20" fill="none" stroke="currentColor" strokeWidth="2" />
              <line x1="36" y1="36" x2={36 + grow * 200} y2="36" stroke="currentColor" strokeWidth="2" />
            </>
          ) : (
            <>
              <rect x="36" y="22" width="110" height="20" fill="none" stroke="currentColor" strokeWidth="2" />
              <rect x="174" y="30" width="110" height="20" fill="none" stroke="currentColor" strokeWidth="2" />
            </>
          )
        ) : null}
        {kind === "Corrosion" ? (
          <rect
            x="48"
            y={22 + grow * 8}
            width="224"
            height={28 - grow * 16}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        ) : null}
        {kind === "Buckling" ? (
          <path
            d={`M160 64 Q${160 + grow * 48} 36 160 8`}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
        ) : null}
      </svg>
      <p className="mt-2 text-sm leading-relaxed text-well-dim">{caption}</p>
    </div>
  );
}

function FaceFilm({ kind }: { kind: string }) {
  return (
    <div className="mt-5">
      <svg viewBox="0 0 320 72" className="h-16 w-full" aria-hidden>
        {kind === "Ductile" ? (
          <>
            <path d="M36 22 H120 Q160 58 200 22 H284" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M36 50 H110 Q160 18 210 50 H284" fill="none" stroke="currentColor" strokeWidth="2" />
          </>
        ) : null}
        {kind === "Cleavage" ? (
          <>
            <path d="M40 16 H150 L168 36 L150 56 H40" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M280 16 H170 L152 36 L170 56 H280" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M168 36 L210 28 M168 36 L214 36 M168 36 L210 44" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </>
        ) : null}
        {kind === "Fatigue" ? (
          <>
            <rect x="36" y="16" width="248" height="40" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M36 36 Q90 20 110 36 Q90 52 36 36" fill="currentColor" opacity="0.35" />
            <path d="M36 36 Q140 14 160 36 M36 36 Q180 10 210 36" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </>
        ) : null}
        {kind === "Intergranular" ? (
          <path
            d="M40 36 L70 18 L100 40 L130 16 L160 44 L190 20 L220 40 L250 18 L284 36"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        ) : null}
      </svg>
      <p className="mt-2 text-sm leading-relaxed text-well-dim">
        {kind === "Ductile"
          ? "Ductile: a neck, then a dull face of dimples."
          : kind === "Cleavage"
            ? "Cleavage: flat, bright, chevrons back to the origin."
            : kind === "Fatigue"
              ? "Fatigue: a thumbnail origin and beach marks. The last patch can still be dull."
              : "Intergranular: the crack followed the boundaries."}
      </p>
    </div>
  );
}

function SortBench({ id }: { id: "duty" | "review" | "face" }) {
  const spec = sortJobs[id];
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const done = i >= spec.jobs.length;
  const item = spec.jobs[Math.min(i, spec.jobs.length - 1)];
  return (
    <BenchShell
      prompt={spec.prompt}
      note={spec.note}
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
                setI((value) => value + 1);
              }}
            >
              {i === spec.jobs.length - 1 ? "See the tally" : "Next part"}
            </button>
          ) : (
            <p className="text-sm text-well-dim">
              Part {i + 1} of {spec.jobs.length}
            </p>
          )}
        </div>
      }
    >
      {done ? (
        <div>
          <Readouts items={[{ label: "Matched", value: `${correct} of ${spec.jobs.length}` }]} />
          <p className="text-sm leading-relaxed text-well-dim">
            {correct >= 3 ? spec.doneGood : spec.doneBad}
          </p>
        </div>
      ) : (
        <div>
          <p className="font-serif text-2xl leading-snug text-balance">{item.job}</p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            {spec.acts.map((act) => {
              const show = picked !== null;
              const isAnswer = act === item.answer;
              const isPick = act === picked;
              return (
                <button
                  key={act}
                  type="button"
                  disabled={picked !== null}
                  onClick={() => setPicked(act)}
                  className={cn(
                    "min-h-11 rounded-lg px-3 text-sm",
                    !show && "ring-1 ring-white/25",
                    show && isAnswer && "bg-well-fg text-well",
                    show && isPick && !isAnswer && "ring-1 ring-well-fg",
                    show && !isAnswer && !isPick && "opacity-40 ring-1 ring-white/15",
                  )}
                >
                  {act}
                </button>
              );
            })}
          </div>
          {picked ? (
            <>
              {id === "face" ? <FaceFilm kind={item.answer} /> : <DamageFilm kind={item.answer} />}
              <p className="mt-4 text-sm leading-relaxed text-well-dim">{item.why}</p>
            </>
          ) : null}
        </div>
      )}
    </BenchShell>
  );
}

const specs: Record<Exclude<LadderBenchId, "duty" | "review" | "face">, LabSpec> = {
  torque: {
    prompt:
      "Set the angle to 90°, then to 30°. || The force is unchanged. The torque halves, because sin 30° is one half.",
    note: "One force, one lever, measured from the line of the force to the pivot. No distributed load. Straight up, the force aims through the pivot and the arm does not turn.",
    animate: false,
    sketch: "lever",
    sliders: [
      { key: "force", label: "Force", min: 10, max: 80, step: 5, digits: 0, suffix: " N" },
      { key: "arm", label: "Lever", min: 0.1, max: 0.6, step: 0.05, digits: 2, suffix: " m" },
      { key: "angle", label: "Angle", min: 0, max: 90, step: 5, digits: 0, suffix: "°" },
    ],
    initial: { force: 40, arm: 0.25, angle: 90 },
    view: (v) => {
      const tau = n(v, "arm") * n(v, "force") * Math.sin((n(v, "angle") * Math.PI) / 180);
      return {
        readouts: [
          { label: "Torque", value: `${fmt(tau, 2)} N·m` },
          { label: "sin of the angle", value: fmt(Math.sin((n(v, "angle") * Math.PI) / 180), 2) },
          { label: "Force", value: `${fmt(n(v, "force"), 0)} N` },
        ],
        sentence: `Torque is lever times force times sin of the angle. At ${fmt(n(v, "angle"), 0)}° that product is ${fmt(tau, 2)} N·m.`,
        aux: { twist: n(v, "angle") },
      };
    },
  },
  inertia: {
    prompt:
      "Set the radius to 0.20 m. || The hoop's inertia is twice the disk's. The mass is the same. The hoop keeps all of it at the rim.",
    note: "Disk is ½MR² about its center. Hoop is MR², a thin rim. Mass is fixed at 2 kg. The filled circle is the disk. The ring is the hoop.",
    animate: false,
    sketch: "rim",
    sliders: [{ key: "radius", label: "Radius", min: 0.1, max: 0.5, step: 0.05, digits: 2, suffix: " m" }],
    initial: { radius: 0.2 },
    view: (v) => {
      const r = n(v, "radius");
      const disk = 0.5 * 2 * r * r;
      const hoop = 2 * r * r;
      return {
        readouts: [
          { label: "Disk", value: `${fmt(disk, 3)} kg·m²` },
          { label: "Hoop", value: `${fmt(hoop, 3)} kg·m²` },
          { label: "Hoop / disk", value: fmt(hoop / disk, 2) },
        ],
        sentence: "Same mass, same radius. The hoop is twice the disk because none of its mass sits near the axis.",
        aux: { level: disk / hoop },
      };
    },
  },
  spin: {
    prompt:
      "Set inertia to 1.2, then to 0.6. || Spin doubles. Nothing pushed. The mass moved closer in, and angular momentum stayed.",
    note: "No external torque, so Iω is constant. The drawing spins at the new rate. Friction is left out.",
    animate: true,
    sketch: "spin",
    sliders: [{ key: "inertia", label: "Inertia", min: 0.3, max: 2, step: 0.1, digits: 1, suffix: " kg·m²" }],
    initial: { inertia: 1.2 },
    view: (v) => {
      const inertia = n(v, "inertia");
      const omega = 4.8 / inertia;
      return {
        readouts: [
          { label: "Angular momentum", value: "4.8 kg·m²/s" },
          { label: "Spin", value: `${fmt(omega, 2)} rad/s` },
          { label: "Inertia", value: fmt(inertia, 1) },
        ],
        sentence: `Spin is 4.8 divided by the inertia. At ${fmt(inertia, 1)} that is ${fmt(omega, 2)} rad/s. Halve the inertia and the spin doubles.`,
        aux: { omega },
      };
    },
  },
  period: {
    prompt:
      "Set mass to 1 kg and stiffness to 100 N/m. Then set mass to 2 kg. || The period rises by about 1.41, not by 2.",
    note: "Undamped spring and mass. T = 2π√(m/k). The bob moves at that period. Air and the spring's own mass are left out.",
    animate: true,
    sketch: "spring",
    sliders: [
      { key: "mass", label: "Mass", min: 0.5, max: 4, step: 0.5, digits: 1, suffix: " kg" },
      { key: "stiff", label: "Stiffness", min: 50, max: 400, step: 50, digits: 0, suffix: " N/m" },
    ],
    initial: { mass: 1, stiff: 100 },
    view: (v) => {
      const period = 2 * Math.PI * Math.sqrt(n(v, "mass") / n(v, "stiff"));
      return {
        readouts: [
          { label: "Period", value: `${fmt(period, 2)} s` },
          { label: "√(m/k)", value: fmt(Math.sqrt(n(v, "mass") / n(v, "stiff")), 3) },
          { label: "Mass", value: `${fmt(n(v, "mass"), 1)} kg` },
        ],
        sentence: `Period is 2π times the square root of mass over stiffness. Doubling the mass multiplies the period by √2, about 1.41, not by 2.`,
        aux: { period },
      };
    },
  },
  depth: {
    prompt:
      "Move from the surface to 10 m. || Gauge pressure is about 98 kPa. That is the water's extra. The atmosphere was already there at the surface.",
    note: "Fresh water, 1000 kg/m³, g = 9.81. Gauge pressure is ρgh. Absolute pressure is this plus the air.",
    animate: false,
    sketch: "meter",
    sliders: [{ key: "depth", label: "Depth", min: 0, max: 20, step: 1, digits: 0, suffix: " m" }],
    initial: { depth: 0 },
    view: (v) => {
      const gauge = (L.water.densityKgM3 * L.water.gravityMPerS2 * n(v, "depth")) / 1000;
      return {
        readouts: [
          { label: "Gauge pressure", value: `${fmt(gauge, 1)} kPa` },
          { label: "Depth", value: `${fmt(n(v, "depth"), 0)} m` },
          { label: "Per meter", value: "9.8 kPa" },
        ],
        sentence: `Each meter of fresh water adds 9.81 kPa. At ${fmt(n(v, "depth"), 0)} m the gauge reading is ${fmt(gauge, 1)} kPa.`,
        aux: { level: n(v, "depth") / 20 },
      };
    },
  },
  bernoulli: {
    prompt:
      "Raise speed from 0 to 10 m/s. || Pressure falls by 50 kPa. Height did not change. The energy moved into motion.",
    note: "Same height, water density 1000 kg/m³, loss-free. P + ½ρv² stays at 200 kPa. Real pipes lose some of that to friction. The dots speed up in the throat. The short bar is the pressure left, not a second measurement.",
    animate: true,
    sketch: "flow",
    sliders: [{ key: "speed", label: "Speed", min: 0, max: 16, step: 1, digits: 0, suffix: " m/s" }],
    initial: { speed: 0 },
    view: (v) => {
      const dynamic = (0.5 * L.water.densityKgM3 * n(v, "speed") ** 2) / 1000;
      const pressure = L.water.totalPressureKPa - dynamic;
      return {
        readouts: [
          { label: "Pressure", value: `${fmt(pressure, 1)} kPa` },
          { label: "½ρv²", value: `${fmt(dynamic, 1)} kPa` },
          { label: "Speed", value: `${fmt(n(v, "speed"), 0)} m/s` },
        ],
        sentence:
          pressure > 0
            ? `Dynamic pressure is ½ρv². It is subtracted from 200 kPa. At ${fmt(n(v, "speed"), 0)} m/s the remainder is ${fmt(pressure, 1)} kPa.`
            : "The ideal sum has gone negative. A real stream would have cavitated or the assumption would have broken before this.",
        aux: { speed: n(v, "speed") / 16, level: Math.max(0, pressure / 200) },
      };
    },
  },
  drag: {
    prompt:
      "Raise speed until drag meets the weight. || They meet near 8 m/s. Below that, weight is larger. Above that, drag is.",
    note: "Air at 1.2 kg/m³, Cd = 1, area 0.05 m², mass 0.2 kg. Drag is ½ρv²CdA. No lift.",
    animate: false,
    sketch: "meter",
    sliders: [{ key: "speed", label: "Speed", min: 1, max: 20, step: 1, digits: 0, suffix: " m/s" }],
    initial: { speed: 4 },
    view: (v) => {
      const drag = 0.5 * 1.2 * n(v, "speed") ** 2 * 0.05;
      const weight = 0.2 * 9.81;
      return {
        readouts: [
          { label: "Drag", value: `${fmt(drag, 2)} N` },
          { label: "Weight", value: `${fmt(weight, 2)} N` },
          { label: "Drag / weight", value: fmt(drag / weight, 2) },
        ],
        sentence:
          drag < weight
            ? "Weight is still larger. The object keeps speeding up, and drag will climb with speed squared."
            : "Drag has met or passed the weight. Past this speed the net force points back. Terminal speed is where they match.",
        aux: { level: Math.min(1, drag / (weight * 1.5)) },
      };
    },
  },
  thermal: {
    prompt:
      "Heat a fixed steel bar by 50°. || Stress is 120 MPa and the length cannot change. Switch to free. || Stress drops to zero and a 1 m bar grows about 0.60 mm.",
    note: "Steel, E = 200 GPa, α = 12×10⁻⁶ per kelvin. A bar held along its length only. Fully fixed or fully free. A real restraint is somewhere between.",
    animate: false,
    sketch: "meter",
    choices: {
      key: "fixed",
      options: [
        { value: 1, label: "Fixed ends" },
        { value: 0, label: "Free ends" },
      ],
    },
    sliders: [{ key: "rise", label: "Temperature rise", min: 0, max: 80, step: 5, digits: 0, suffix: "°" }],
    initial: { fixed: 1, rise: 0 },
    view: (v) => {
      const { modulusPa, expansionPerK, lengthM } = L.steelThermal;
      const stress = n(v, "fixed") * modulusPa / 1e6 * expansionPerK * n(v, "rise");
      const growth = (1 - n(v, "fixed")) * expansionPerK * lengthM * 1000 * n(v, "rise");
      return {
        readouts: [
          { label: "Stress", value: `${fmt(stress, 0)} MPa` },
          { label: "Growth", value: `${fmt(growth, 2)} mm` },
          { label: "Rise", value: `${fmt(n(v, "rise"), 0)}°` },
        ],
        sentence:
          n(v, "fixed") > 0.5
            ? `Fixed, so σ = EαΔT = 2.4 MPa per degree. At ${fmt(n(v, "rise"), 0)}° that is ${fmt(stress, 0)} MPa, and the length does not change.`
            : `Free, so the stress is zero. A 1 m bar grows 0.012 mm per degree, ${fmt(growth, 2)} mm at this rise.`,
        aux: { level: stress / 200 },
      };
    },
  },
  rodspeed: {
    prompt:
      "Select steel, then aluminum, then polyethylene. || Steel and aluminum are close. Polyethylene is slower, because its modulus fell by more than its density.",
    note: "c = √(E/ρ) for a long thin rod. Steel 200 GPa and 7800 kg/m³. Aluminum 70 GPa and 2700. Polyethylene 2 GPa and 950. The drawing is slowed so you can see a wave at all.",
    animate: true,
    sketch: "wave",
    choices: {
      key: "mat",
      options: [
        { value: 0, label: "Steel" },
        { value: 1, label: "Aluminum" },
        { value: 2, label: "Polyethylene" },
      ],
    },
    sliders: [],
    initial: { mat: 0 },
    view: (v) => {
      const table = L.rodMaterials;
      const mat = table[n(v, "mat")] ?? table[0];
      const speed = Math.sqrt(mat.e / mat.rho);
      return {
        readouts: [
          { label: "Wave speed", value: `${fmt(speed, 0)} m/s` },
          { label: "Modulus", value: `${fmt(mat.e / 1e9, 0)} GPa` },
          { label: "Density", value: `${fmt(mat.rho, 0)} kg/m³` },
        ],
        sentence: `${mat.name}: √(E/ρ) is ${fmt(speed, 0)} m/s. A lighter metal is not automatically slower. Both E and ρ moved.`,
        aux: { pace: Math.max(0.45, speed / 2600) },
      };
    },
  },
  modeshape: {
    prompt:
      "Set the span to 0.60 m, then to 1.20 m. || Frequency falls by four. The bar did not get softer. Span is squared.",
    note: "Pinned-pinned first mode, steel square bar 20 mm, ω = (π/L)² √(EI/μ). The drawing shakes at a slowed stand-in for that frequency.",
    animate: true,
    sketch: "whirl",
    sliders: [{ key: "span", label: "Span", min: 0.4, max: 1.6, step: 0.2, digits: 2, suffix: " m" }],
    initial: { span: 0.6 },
    view: (v) => {
      const span = n(v, "span");
      const freq = ladderModeHz(span);
      return {
        readouts: [
          { label: "Frequency", value: `${fmt(freq, 1)} Hz` },
          { label: "Span", value: `${fmt(span, 2)} m` },
          { label: "Versus 0.60 m", value: fmt(127.6 / freq, 2) },
        ],
        sentence: `First-mode frequency scales as 1/L². At ${fmt(span, 2)} m it is ${fmt(freq, 1)} Hz. Double the span and it falls by four.`,
        aux: { amp: 16, pace: Math.max(2, Math.min(14, freq / 12)) },
      };
    },
  },
  impact: {
    prompt:
      "Drop from 0.50 m, then from 0.10 m. || Peak force falls by about 2.2, the square root of five, not by five. The weight is about 20 N either way.",
    note: "2 kg onto a spring of stiffness 1 MN/m. Energy mgh becomes ½kδ². No bounce loss, no mass in the target. The mass drops on a short loop. Peak force is the readout. The squash is only so you can see a hit, not the weight.",
    animate: true,
    sketch: "drop",
    sliders: [{ key: "height", label: "Drop height", min: 0.1, max: 1, step: 0.1, digits: 2, suffix: " m" }],
    initial: { height: 0.5 },
    view: (v) => {
      const energy = 2 * 9.81 * n(v, "height");
      const force = Math.sqrt(2 * energy * 1e6);
      return {
        readouts: [
          { label: "Peak force", value: `${fmt(force / 1000, 2)} kN` },
          { label: "Weight", value: "0.020 kN" },
          { label: "Peak / weight", value: fmt(force / 19.62, 0) },
        ],
        sentence: `mgh = ½kδ², and force is kδ, so force scales with the square root of height. From ${fmt(n(v, "height"), 2)} m the peak is ${fmt(force / 1000, 2)} kN.`,
        aux: { drop: n(v, "height") },
      };
    },
  },
  resonance: {
    prompt:
      "Set damping to 0.05 and the frequency ratio to 1. || The amplitude is about 10 times the static sag. Move the ratio to 1.5. || It falls below the static sag.",
    note: "One degree of freedom. Amplitude over static sag is 1/√((1−r²)²+(2ζr)²). r is drive frequency over natural frequency. The clip shows a beam growing; this bench is the number.",
    animate: true,
    sketch: "whirl",
    sliders: [
      { key: "ratio", label: "Frequency ratio", min: 0.2, max: 2, step: 0.1, digits: 1, suffix: "" },
      { key: "zeta", label: "Damping ζ", min: 0.02, max: 0.4, step: 0.01, digits: 2, suffix: "" },
    ],
    initial: { ratio: 0.5, zeta: 0.05 },
    view: (v) => {
      const r = n(v, "ratio");
      const z = n(v, "zeta");
      const amp = 1 / Math.sqrt((1 - r * r) ** 2 + (2 * z * r) ** 2);
      return {
        readouts: [
          { label: "Amplitude / static", value: fmt(amp, 2) },
          { label: "Ratio r", value: fmt(r, 1) },
          { label: "ζ", value: fmt(z, 2) },
        ],
        sentence:
          Math.abs(r - 1) < 0.05
            ? `On resonance the magnification is about 1/(2ζ) = ${fmt(1 / (2 * z), 1)}. Damping is the only thing standing between you and a large motion.`
            : `Off resonance, at r = ${fmt(r, 1)}, the magnification is ${fmt(amp, 2)}. Leaving the natural frequency is often a bigger fix than a small change in stiffness.`,
        aux: { amp: Math.min(36, 4 + amp) },
      };
    },
  },
  creeprate: {
    prompt:
      "Set 100 MPa and 800 K. Double the stress. || Time to 1% falls by 32. Put the stress back and set 850 K. || Time falls to about a tenth. The rise was 50 K.",
    note: "Teaching creep: t = 1000 h × (100/σ)⁵ × exp[30000(1/T − 1/800)], T in kelvin. Not a certified alloy. The bar in the drawing sags on a sped-up clock. The hours are the readout.",
    animate: true,
    sketch: "creep",
    sliders: [
      { key: "stress", label: "Stress", min: 50, max: 200, step: 10, digits: 0, suffix: " MPa" },
      { key: "temp", label: "Temperature", min: 700, max: 950, step: 10, digits: 0, suffix: " K" },
    ],
    initial: { stress: 100, temp: 800 },
    view: (v) => {
      const hours = ladderCreepHours(n(v, "stress"), n(v, "temp"));
      return {
        readouts: [
          { label: "Time to 1%", value: hours >= 100 ? `${fmt(hours, 0)} h` : `${fmt(hours, 1)} h` },
          { label: "Stress", value: `${fmt(n(v, "stress"), 0)} MPa` },
          { label: "Temperature", value: `${fmt(n(v, "temp"), 0)} K` },
        ],
        sentence: `The stress enters to the fifth power, so doubling it divides the time by 32. Temperature is inside an exponential, so 50 K is not a small change.`,
        aux: { pace: Math.min(3.2, Math.max(0.4, 400 / Math.max(hours, 40))) },
      };
    },
  },
  hardness: {
    prompt:
      "Set 200 HV. || The estimate is 600 MPa. It is a steel rule of thumb. It does not tell you the elongation.",
    note: "Ultimate strength in MPa is taken as about 3 times the Vickers number, for steels in a mid range. It is not a law, and it says nothing about ductility.",
    animate: false,
    sketch: "meter",
    sliders: [{ key: "hv", label: "Hardness", min: 100, max: 600, step: 10, digits: 0, suffix: " HV" }],
    initial: { hv: 200 },
    view: (v) => ({
      readouts: [
        { label: "Estimated UTS", value: `${fmt(3 * n(v, "hv"), 0)} MPa` },
        { label: "Hardness", value: `${fmt(n(v, "hv"), 0)} HV` },
        { label: "Rule", value: "× 3" },
      ],
      sentence: `${fmt(n(v, "hv"), 0)} HV times 3 is ${fmt(3 * n(v, "hv"), 0)} MPa. Use it to estimate a steel's tensile strength, then go measure ductility separately.`,
      aux: { level: n(v, "hv") / 600 },
    }),
  },
  leak: {
    prompt:
      "Set toughness 50, stress 150 MPa, wall 8 mm. || The critical crack is longer than the wall, so it opens through first. Drop toughness to 25. || The critical crack is now shorter than the wall.",
    note: "Edge crack, Y = 1.12, a_crit from KIc = Yσ√(πa). Leak-before-break here means a_crit is longer than the thickness. A real assessment has a defined crack shape and a code. The line is the critical crack against the wall. A drip means it is longer than the wall.",
    animate: true,
    sketch: "seam",
    sliders: [
      { key: "kic", label: "Toughness", min: 15, max: 80, step: 5, digits: 0, suffix: " MPa√m" },
      { key: "stress", label: "Stress", min: 50, max: 250, step: 10, digits: 0, suffix: " MPa" },
      { key: "wall", label: "Wall", min: 4, max: 40, step: 1, digits: 0, suffix: " mm" },
    ],
    initial: { kic: 50, stress: 150, wall: 8 },
    view: (v) => {
      const aCrit = ((n(v, "kic") / (1.12 * n(v, "stress"))) ** 2 / Math.PI) * 1000;
      const leak = aCrit > n(v, "wall");
      return {
        readouts: [
          { label: "Critical crack", value: `${fmt(aCrit, 1)} mm` },
          { label: "Wall", value: `${fmt(n(v, "wall"), 0)} mm` },
          { label: "Call", value: leak ? "Leaks first" : "Breaks first" },
        ],
        sentence: leak
          ? `Critical length ${fmt(aCrit, 1)} mm is past the ${fmt(n(v, "wall"), 0)} mm wall. The wall opens through while the crack is still stable. That is leak before break, in this model.`
          : `Critical length ${fmt(aCrit, 1)} mm is inside the wall. A part-through crack can go unstable before it weeps.`,
        aux: { frac: aCrit / n(v, "wall") },
      };
    },
  },
  thinning: {
    prompt:
      "Set 0.10 mm per year and 20 years. || Thickness goes from 6 mm to 4 mm. Stress rises from 67 MPa to 100 MPa. The force stayed 8 kN.",
    note: "Flat bar, 20 mm wide, 8 kN, starting at 6 mm. Rate is constant. Real corrosion often slows or localizes into pits, which is worse than this even loss.",
    animate: false,
    sketch: "meter",
    sliders: [
      { key: "rate", label: "Rate", min: 0.02, max: 0.2, step: 0.02, digits: 2, suffix: " mm/y" },
      { key: "years", label: "Years", min: 0, max: 30, step: 1, digits: 0, suffix: " y" },
    ],
    initial: { rate: 0.1, years: 0 },
    view: (v) => {
      const thick = Math.max(0.4, 6 - n(v, "rate") * n(v, "years"));
      const stress = 8000 / (20 * thick);
      return {
        readouts: [
          { label: "Thickness", value: `${fmt(thick, 2)} mm` },
          { label: "Stress", value: `${fmt(stress, 0)} MPa` },
          { label: "Force", value: "8 kN" },
        ],
        sentence: `Stress is 8 kN over 20 mm times the thickness left. At ${fmt(thick, 2)} mm that is ${fmt(stress, 0)} MPa. The force never changed.`,
        aux: { level: thick / 6 },
      };
    },
  },
  coldwork: {
    prompt:
      "Raise cold work from 0 to 40%. || Strength rises from 250 MPa toward 490. Elongation falls from 40% to about 4%. Same alloy.",
    note: "Teaching curves: strength 250 + 6×(percent cold work), elongation 40×exp(−cw/18). Not a specific temper.",
    animate: false,
    sketch: "meter",
    sliders: [{ key: "cw", label: "Cold work", min: 0, max: 40, step: 5, digits: 0, suffix: "%" }],
    initial: { cw: 0 },
    view: (v) => {
      const strength = 250 + 6 * n(v, "cw");
      const elong = 40 * Math.exp(-n(v, "cw") / 18);
      return {
        readouts: [
          { label: "Strength", value: `${fmt(strength, 0)} MPa` },
          { label: "Elongation", value: `${fmt(elong, 1)}%` },
          { label: "Cold work", value: `${fmt(n(v, "cw"), 0)}%` },
        ],
        sentence: `Cold work stores dislocations. Strength climbs and the metal has less stretch left. At ${fmt(n(v, "cw"), 0)}% cold work, elongation is ${fmt(elong, 1)}%.`,
        aux: { level: n(v, "cw") / 40 },
      };
    },
  },
  quench: {
    prompt:
      "Set thickness to 10 mm, then to 40 mm. || The surface stays 550 HV. The center falls. The quench did not reach the middle.",
    note: "Surface fixed at 550 HV. Center = 200 + 350 / (1 + (thickness/20 mm)²). A teaching cool-down, not a Jominy curve. The bright core shrinks from the outside. A thicker bar takes longer on that clock. The hardness numbers are the readout. The clip is the same direction of heat.",
    animate: true,
    sketch: "quench",
    sliders: [{ key: "thick", label: "Thickness", min: 5, max: 50, step: 5, digits: 0, suffix: " mm" }],
    initial: { thick: 10 },
    view: (v) => {
      const center = 200 + 350 / (1 + (n(v, "thick") / 20) ** 2);
      return {
        readouts: [
          { label: "Surface", value: "550 HV" },
          { label: "Center", value: `${fmt(center, 0)} HV` },
          { label: "Thickness", value: `${fmt(n(v, "thick"), 0)} mm` },
        ],
        sentence: `The surface always sees the quenchant. The center of a ${fmt(n(v, "thick"), 0)} mm section only reaches about ${fmt(center, 0)} HV in this model.`,
        aux: { core: Math.min(1, n(v, "thick") / 50) },
      };
    },
  },
  lever: {
    prompt:
      "Set the overall composition to 50% B, then to 30% B. || Solid fraction rises from 0.50 to 0.83. The tie-line ends stayed put.",
    note: "One temperature inside a two-phase field. Solid sits at 20% B, liquid at 80% B. Fraction solid = (80 − overall) / 60. Equilibrium, no coring.",
    animate: false,
    sketch: "meter",
    sliders: [{ key: "comp", label: "Overall % B", min: 20, max: 80, step: 5, digits: 0, suffix: "%" }],
    initial: { comp: 50 },
    view: (v) => {
      const solid = (80 - n(v, "comp")) / 60;
      return {
        readouts: [
          { label: "Fraction solid", value: fmt(solid, 2) },
          { label: "Fraction liquid", value: fmt(1 - solid, 2) },
          { label: "Overall", value: `${fmt(n(v, "comp"), 0)}% B` },
        ],
        sentence: `The ends of the tie line are 20% and 80%. Moving the overall composition from the liquid end toward the solid end raises the solid fraction. At ${fmt(n(v, "comp"), 0)}% B it is ${fmt(solid, 2)}.`,
        aux: { level: solid },
      };
    },
  },
  fiber: {
    prompt:
      "Set the load along the fiber, then at 30°. || Strength falls from 900 MPa to about 140. The fiber did not weaken. The load left its direction.",
    note: "Teaching directional strength: 1 / (cos²θ / 900 + sin²θ / 40), in MPa. It is not a full Tsai-Wu check. Transverse strength is 40 MPa. The lines are the fiber. The arrow is the load, and it stays put.",
    animate: false,
    sketch: "fibers",
    sliders: [{ key: "angle", label: "Load angle", min: 0, max: 90, step: 5, digits: 0, suffix: "°" }],
    initial: { angle: 0 },
    view: (v) => {
      const c = Math.cos((n(v, "angle") * Math.PI) / 180) ** 2;
      const s = Math.sin((n(v, "angle") * Math.PI) / 180) ** 2;
      const strength = 1 / (c / 900 + s / 40);
      return {
        readouts: [
          { label: "Strength", value: `${fmt(strength, 0)} MPa` },
          { label: "Angle", value: `${fmt(n(v, "angle"), 0)}°` },
          { label: "Along fiber", value: "900 MPa" },
        ],
        sentence: `At ${fmt(n(v, "angle"), 0)}° to the fiber the estimated strength is ${fmt(strength, 0)} MPa. Along the fiber it is 900. Across it, 40.`,
        aux: { twist: n(v, "angle") },
      };
    },
  },
  panel: {
    prompt:
      "Select steel, then wood. || Wood's index is several times steel's. Steel is stiffer and much denser. This index is for a light stiff panel, not a tie rod.",
    note: "For a flat panel of fixed width and stiffness, mass scales as ρ / E^(1/3). The index plotted is E^(1/3)/ρ with E in GPa and ρ in g/cm³. Teaching points, not a grade.",
    animate: false,
    sketch: "meter",
    choices: {
      key: "mat",
      options: [
        { value: 0, label: "Steel" },
        { value: 1, label: "Aluminum" },
        { value: 2, label: "Composite" },
        { value: 3, label: "Wood" },
      ],
    },
    sliders: [],
    initial: { mat: 0 },
    view: (v) => {
      const table = L.panelMaterials;
      const mat = table[n(v, "mat")] ?? table[0];
      const index = Math.cbrt(mat.e) / mat.rho;
      const wood = Math.cbrt(table[3].e) / table[3].rho;
      return {
        readouts: [
          { label: mat.name, value: fmt(index, 2) },
          { label: "Wood", value: fmt(wood, 2) },
          { label: "Steel", value: fmt(Math.cbrt(table[0].e) / table[0].rho, 2) },
        ],
        sentence: `${mat.name} has panel index ${fmt(index, 2)}. Wood leads this set because a panel pays heavily for density. A tie rod, which wants E/ρ or strength/ρ, ranks them differently.`,
        aux: { level: index / wood },
      };
    },
  },
  sensitive: {
    prompt:
      "Set sensitivity to 0, then to 0.8. || Kf goes from 1 to 2.2 and the fatigue strength falls from 300 MPa to about 136. The notch geometry did not change.",
    note: "Kf = 1 + q(Kt − 1), with Kt fixed at 2.5. Fully reversed fatigue strength 300 MPa is then divided by Kf. q is a material's notch sensitivity, not a load.",
    animate: false,
    sketch: "meter",
    sliders: [{ key: "q", label: "Sensitivity q", min: 0, max: 1, step: 0.1, digits: 1, suffix: "" }],
    initial: { q: 0 },
    view: (v) => {
      const kf = 1 + n(v, "q") * 1.5;
      const se = 300 / kf;
      return {
        readouts: [
          { label: "Kf", value: fmt(kf, 2) },
          { label: "Fatigue strength", value: `${fmt(se, 0)} MPa` },
          { label: "Kt", value: "2.50" },
        ],
        sentence: `Kt is 2.5 either way. q = ${fmt(n(v, "q"), 1)} turns that into Kf = ${fmt(kf, 2)}. The 300 MPa smooth-bar strength becomes ${fmt(se, 0)} MPa.`,
        aux: { level: se / 300 },
      };
    },
  },
  temper: {
    prompt:
      "Switch from annealed to T6. || Yield rises from 55 MPa to 275. Elongation falls from 25% to 12%. The alloy can still be called 6061. The condition is the specification.",
    note: "Teaching values for 6061-O and 6061-T6, rounded. A real spec also names the product form and the standard.",
    animate: false,
    sketch: "meter",
    choices: {
      key: "cond",
      options: [
        { value: 0, label: "Annealed" },
        { value: 1, label: "T6" },
      ],
    },
    sliders: [],
    initial: { cond: 0 },
    view: (v) => {
      const aged = n(v, "cond") > 0.5;
      const yieldStress = aged ? 275 : 55;
      const elong = aged ? 12 : 25;
      return {
        readouts: [
          { label: "Condition", value: aged ? "T6" : "Annealed" },
          { label: "Yield", value: `${yieldStress} MPa` },
          { label: "Elongation", value: `${elong}%` },
        ],
        sentence: aged
          ? "T6 is a heat treatment, not a different element list. Yield is up. The metal gives less warning before it breaks."
          : "Annealed 6061 is soft and relatively ductile. Writing only the alloy number would have allowed either this or T6.",
        aux: { level: yieldStress / 275 },
      };
    },
  },
  mises: {
    prompt:
      "Set tension to 100 MPa and shear to 0. Then set shear to 60 MPa. || von Mises rises from 100 to about 144. The tension did not change.",
    note: "Plane stress with one normal stress and one shear. σ_vm = √(σ² + 3τ²). No second normal stress. Yield when this reaches the tensile yield.",
    animate: false,
    sketch: "meter",
    sliders: [
      { key: "sigma", label: "Tension", min: 0, max: 200, step: 10, digits: 0, suffix: " MPa" },
      { key: "tau", label: "Shear", min: 0, max: 120, step: 10, digits: 0, suffix: " MPa" },
    ],
    initial: { sigma: 100, tau: 0 },
    view: (v) => {
      const vm = Math.sqrt(n(v, "sigma") ** 2 + 3 * n(v, "tau") ** 2);
      return {
        readouts: [
          { label: "von Mises", value: `${fmt(vm, 0)} MPa` },
          { label: "Tension", value: `${fmt(n(v, "sigma"), 0)} MPa` },
          { label: "Shear", value: `${fmt(n(v, "tau"), 0)} MPa` },
        ],
        sentence: `√(σ² + 3τ²) = ${fmt(vm, 0)} MPa. Shear is not a small add-on. Three times τ² sits inside the square root.`,
        aux: { level: Math.min(1, vm / 250) },
      };
    },
  },
  torsion: {
    prompt:
      "Set 200 N·m and a 10 mm radius, then 20 mm. || Shear stress falls by 8. J grew by 16 and the outer fiber only moved out by 2.",
    note: "Solid round shaft. τ = Tr/J and J = πr⁴/2. Elastic, no stress concentration at a shoulder. The faint radius is one end. The bright radius is the other, twisted by the stress. The spin is only so you can see a shaft.",
    animate: true,
    sketch: "shaft",
    sliders: [
      { key: "torque", label: "Torque", min: 50, max: 400, step: 10, digits: 0, suffix: " N·m" },
      { key: "radius", label: "Radius", min: 8, max: 30, step: 1, digits: 0, suffix: " mm" },
    ],
    initial: { torque: 200, radius: 10 },
    view: (v) => {
      const r = n(v, "radius") / 1000;
      const j = (Math.PI * r ** 4) / 2;
      const tau = (n(v, "torque") * r) / j / 1e6;
      return {
        readouts: [
          { label: "Shear stress", value: `${fmt(tau, 1)} MPa` },
          { label: "Radius", value: `${fmt(n(v, "radius"), 0)} mm` },
          { label: "Torque", value: `${fmt(n(v, "torque"), 0)} N·m` },
        ],
        sentence: `J grows with radius to the fourth, and stress still multiplies by radius once more, so stress scales as 1/r³. Doubling the radius divides the stress by 8.`,
        aux: { twist: Math.min(40, tau / 8) },
      };
    },
  },
  hoop: {
    prompt:
      "Set 2 MPa, radius 200 mm, thickness 4 mm. || Hoop stress is 100 MPa. The long direction is 50. A seam along the length sees the hoop stress.",
    note: "Thin wall, closed ends. Hoop = pr/t. Longitudinal = pr/(2t). Thin means the wall is small beside the radius, which 4 mm against 200 mm is.",
    animate: false,
    sketch: "meter",
    sliders: [
      { key: "p", label: "Pressure", min: 0.5, max: 5, step: 0.5, digits: 1, suffix: " MPa" },
      { key: "radius", label: "Radius", min: 50, max: 400, step: 10, digits: 0, suffix: " mm" },
      { key: "thick", label: "Thickness", min: 2, max: 12, step: 1, digits: 0, suffix: " mm" },
    ],
    initial: { p: 2, radius: 200, thick: 4 },
    view: (v) => {
      const hoop = (n(v, "p") * n(v, "radius")) / n(v, "thick");
      return {
        readouts: [
          { label: "Hoop", value: `${fmt(hoop, 0)} MPa` },
          { label: "Longitudinal", value: `${fmt(hoop / 2, 0)} MPa` },
          { label: "Thickness", value: `${fmt(n(v, "thick"), 0)} mm` },
        ],
        sentence: `pr/t = ${fmt(hoop, 0)} MPa around the shell. Along the axis it is half of that, ${fmt(hoop / 2, 0)} MPa. The longitudinal seam carries the larger one.`,
        aux: { level: Math.min(1, hoop / 300) },
      };
    },
  },
  eccentric: {
    prompt:
      "Set eccentricity to 0, then to 20 mm. || Stress rises from 12.5 MPa to 50. The load is still 20 kN. It no longer points through the center.",
    note: "40 mm square bar, 20 kN compression. σ = P/A ± Pec/I. This shows the larger face. Buckling is a separate check if the bar is long. The faint line is the center. The arrow is where the load actually lands.",
    animate: false,
    sketch: "offset",
    sliders: [{ key: "ecc", label: "Eccentricity", min: 0, max: 30, step: 2, digits: 0, suffix: " mm" }],
    initial: { ecc: 0 },
    view: (v) => {
      const axial = 12.5;
      const bend = (20000 * (n(v, "ecc") / 1000) * 0.02) / 2.1333e-7 / 1e6;
      const peak = axial + bend;
      return {
        readouts: [
          { label: "Peak", value: `${fmt(peak, 1)} MPa` },
          { label: "P/A", value: "12.5 MPa" },
          { label: "Bending", value: `${fmt(bend, 1)} MPa` },
        ],
        sentence: `P/A stays 12.5 MPa. The bending term is P times eccentricity times 20 mm, over I. At ${fmt(n(v, "ecc"), 0)} mm offset the peak is ${fmt(peak, 1)} MPa.`,
        aux: { twist: Math.min(35, n(v, "ecc")) },
      };
    },
  },
  whirl: {
    prompt:
      "Set the length to 0.40 m, then to 0.80 m. || Critical speed falls by about 2.8. The disk did not get heavier. Length is cubed inside the stiffness, then square-rooted.",
    note: "Light steel shaft, 20 mm diameter, disk of 2 kg at midspan. k = 48EI/L³, critical speed √(k/m). No gyroscopic terms. The drawing exaggerates the whirl.",
    animate: true,
    sketch: "whirl",
    sliders: [{ key: "length", label: "Length", min: 0.3, max: 1, step: 0.1, digits: 2, suffix: " m" }],
    initial: { length: 0.4 },
    view: (v) => {
      const length = n(v, "length");
      const rpm = ladderWhirlRpm(length);
      return {
        readouts: [
          { label: "Critical speed", value: `${fmt(rpm, 0)} rpm` },
          { label: "Length", value: `${fmt(length, 2)} m` },
          { label: "Disk", value: "2 kg" },
        ],
        sentence: `Stiffness falls with L³ and critical speed follows the square root, so speed scales as 1/L^1.5. At ${fmt(length, 2)} m this shaft wants to whirl near ${fmt(rpm, 0)} rpm.`,
        aux: { amp: 14, pace: Math.max(2, Math.min(14, rpm / 800)) },
      };
    },
  },
  gears: {
    prompt:
      "Drive 20 teeth into 60. || Output torque is about 29 N·m, not 30, because 2% is lost. Output speed is one third. Power does not multiply.",
    note: "Input torque fixed at 10 N·m. Efficiency 0.98, constant. The clip shows the small gear turning faster. The teeth count that sets the ratio is this bench.",
    animate: true,
    sketch: "gear",
    sliders: [
      { key: "inTeeth", label: "Input teeth", min: 12, max: 40, step: 2, digits: 0, suffix: "" },
      { key: "outTeeth", label: "Output teeth", min: 20, max: 80, step: 2, digits: 0, suffix: "" },
    ],
    initial: { inTeeth: 20, outTeeth: 60 },
    view: (v) => {
      const ratio = n(v, "outTeeth") / n(v, "inTeeth");
      const torque = 10 * ratio * 0.98;
      return {
        readouts: [
          { label: "Output torque", value: `${fmt(torque, 1)} N·m` },
          { label: "Speed ratio", value: fmt(1 / ratio, 2) },
          { label: "Teeth ratio", value: fmt(ratio, 2) },
        ],
        sentence: `Torque scales with the teeth ratio and then with 0.98. Speed scales with the inverse. Power out is 98% of power in, not the teeth ratio times power in.`,
        aux: { ratio },
      };
    },
  },
  bearing: {
    prompt:
      "Set the load to 4 kN, then to 8 kN. || Life falls by 8. The load only doubled. A ball bearing takes the cube.",
    note: "Ball bearing, L10 = (C/P)³ million revolutions, C = 20 kN. Rated life is a 90% survival statistic, not a promise for one bearing. Roller bearings use a different exponent.",
    animate: false,
    sketch: "meter",
    sliders: [{ key: "load", label: "Load", min: 2, max: 16, step: 1, digits: 0, suffix: " kN" }],
    initial: { load: 4 },
    view: (v) => {
      const life = (20 / n(v, "load")) ** 3;
      return {
        readouts: [
          { label: "L10", value: `${fmt(life, 1)} million rev` },
          { label: "C/P", value: fmt(20 / n(v, "load"), 2) },
          { label: "Load", value: `${fmt(n(v, "load"), 0)} kN` },
        ],
        sentence: `(20 / ${fmt(n(v, "load"), 0)})³ million revolutions is ${fmt(life, 1)}. Double the load and the life falls by 8, because the exponent is 3.`,
        aux: { level: Math.min(1, life / 200) },
      };
    },
  },
  preload: {
    prompt:
      "Set preload to 15 kN and the external load to 10 kN. || The bolt rises only to 17 kN. Raise the external load to 20 kN. || The joint separates and the bolt sees all 20.",
    note: "Bolt stiffness 1, member stiffness 4, so the bolt takes 1/5 of a new external load until the clamp reaches zero. No prying.",
    animate: false,
    sketch: "meter",
    sliders: [
      { key: "preload", label: "Preload", min: 5, max: 20, step: 1, digits: 0, suffix: " kN" },
      { key: "external", label: "External load", min: 0, max: 24, step: 1, digits: 0, suffix: " kN" },
    ],
    initial: { preload: 15, external: 0 },
    view: (v) => {
      const limit = n(v, "preload") * 1.25;
      const separated = n(v, "external") > limit;
      const bolt = separated ? n(v, "external") : n(v, "preload") + n(v, "external") * 0.2;
      const clamp = separated ? 0 : n(v, "preload") - n(v, "external") * 0.8;
      return {
        readouts: [
          { label: "Bolt force", value: `${fmt(bolt, 1)} kN` },
          { label: "Clamp left", value: `${fmt(Math.max(0, clamp), 1)} kN` },
          { label: "Joint", value: separated ? "Separated" : "Closed" },
        ],
        sentence: separated
          ? "The clamp has gone to zero. Separation means the members are no longer sharing, and the bolt carries the whole external load."
          : `While the joint stays closed the bolt only picks up a fifth of the new load. Clamp left is ${fmt(clamp, 1)} kN.`,
        aux: { level: Math.min(1, bolt / 24) },
      };
    },
  },
  miner: {
    prompt:
      "Raise the severe block from 1000 cycles to 7000. || The sum crosses 1. No single block used up its own life. The sum did.",
    note: "Three blocks. Mild: 200000 of 1 million allowed. Middle: 20000 of 100000 allowed. Severe: you choose, out of 10000 allowed. Miner adds n/N. Order is ignored, and a real sequence can care about order.",
    animate: false,
    sketch: "meter",
    sliders: [{ key: "severe", label: "Severe cycles", min: 0, max: 8000, step: 500, digits: 0, suffix: "" }],
    initial: { severe: 1000 },
    view: (v) => {
      const damage = 0.2 + 0.2 + n(v, "severe") / 10000;
      return {
        readouts: [
          { label: "Damage sum", value: fmt(damage, 2) },
          { label: "Severe n/N", value: fmt(n(v, "severe") / 10000, 2) },
          { label: "Call", value: damage >= 1 ? "Used up" : "Life left" },
        ],
        sentence: `Mild contributes 0.20 and the middle block contributes 0.20, whatever you do here. The severe block adds ${fmt(n(v, "severe") / 10000, 2)}. The part cares about the total.`,
        aux: { level: Math.min(1, damage) },
      };
    },
  },
  thermomech: {
    prompt:
      "Add a 40° rise the bar is not free to grow into. || Thermal stress is 96 MPa of compression. Mechanical stress is still 40 MPa of tension. The net is about 56 MPa compression. A load cell on the applied force would have missed the larger term.",
    note: "Same steel as the thermal bench, Eα = 2.4 MPa per degree, a bar fully held along its length, plus a mechanical tension of 40 MPa. Heating a held bar makes the thermal term compressive, so the net is 40 minus the thermal term in this one-axis model.",
    animate: false,
    sketch: "meter",
    sliders: [{ key: "rise", label: "Temperature rise", min: 0, max: 60, step: 5, digits: 0, suffix: "°" }],
    initial: { rise: 0 },
    view: (v) => {
      const thermal = 2.4 * n(v, "rise");
      const net = 40 - thermal;
      const netSense = net < 0 ? "compression" : "tension";
      return {
        readouts: [
          { label: "Net", value: `${fmt(Math.abs(net), 0)} MPa ${netSense}` },
          { label: "Thermal (compression)", value: `${fmt(thermal, 0)} MPa` },
          { label: "Mechanical (tension)", value: "40 MPa" },
        ],
        sentence: `40 MPa of tension from the load, and 2.4 MPa of compression for every degree the bar cannot expand. At ${fmt(n(v, "rise"), 0)}° the thermal term is ${fmt(thermal, 0)} MPa and the net is ${fmt(Math.abs(net), 0)} MPa ${netSense}.`,
        aux: { level: Math.min(1, Math.abs(net) / 200) },
      };
    },
  },
  interval: {
    prompt:
      "Set the smallest crack you can find to 0.5 mm, then to 2.0 mm. || Life falls from about 0.86 million cycles to about 0.38 million. The crack got four times longer. The life did not fall by four.",
    note: "Same steel Paris pair as the crack lesson, m = 3, C = 6.9×10⁻¹², 120 MPa, Y = 1.12, toughness 50 MPa√m. Closed-form integral for m = 3. The drawing crawls, then runs, on a sped-up clock.",
    animate: true,
    sketch: "crack",
    sliders: [{ key: "found", label: "Smallest crack found", min: 0.3, max: 3, step: 0.1, digits: 1, suffix: " mm" }],
    initial: { found: 0.5 },
    view: (v) => {
      const { cycles, criticalM: ac } = ladderCrackGrowth(n(v, "found"));
      return {
        readouts: [
          { label: "Model growth life", value: cycles >= 1e6 ? `${fmt(cycles / 1e6, 2)} million` : `${fmt(cycles / 1e3, 0)} thousand` },
          { label: "Found", value: `${fmt(n(v, "found"), 1)} mm` },
          { label: "Critical", value: `${fmt(ac * 1000, 0)} mm` },
        ],
        sentence: `For m = 3 the integral is heaviest at the short crack. Starting at ${fmt(n(v, "found"), 1)} mm leaves ${cycles >= 1e6 ? fmt(cycles / 1e6, 2) + " million" : fmt(cycles / 1e3, 0) + " thousand"} cycles before ${fmt(ac * 1000, 0)} mm.`,
        aux: {},
      };
    },
  },
  rolling: {
    prompt:
      "Reduce 10 mm stock to 8 mm, then to 5 mm. || Force rises from about 520 kN to about 820. Draft more than doubled. Contact length only follows the square root.",
    note: "Flow stress 300 MPa, width 100 mm, roll radius 150 mm. Contact length √(R × draft). Force is flow stress times width times that length. No friction hill.",
    animate: true,
    sketch: "roll",
    sliders: [{ key: "hf", label: "Exit thickness", min: 4, max: 9, step: 1, digits: 0, suffix: " mm" }],
    initial: { hf: 8 },
    view: (v) => {
      const draft = 10 - n(v, "hf");
      const contact = Math.sqrt(150 * draft);
      const force = (300 * 100 * contact) / 1000;
      return {
        readouts: [
          { label: "Force", value: `${fmt(force, 0)} kN` },
          { label: "Contact", value: `${fmt(contact, 1)} mm` },
          { label: "Draft", value: `${fmt(draft, 0)} mm` },
        ],
        sentence: `Draft is ${fmt(draft, 0)} mm, contact is √(150 × draft) = ${fmt(contact, 1)} mm, and force is 300 MPa times 100 mm times that contact.`,
        aux: { thin: n(v, "hf") / 10 },
      };
    },
  },
  taylor: {
    prompt:
      "Cut at 100 m/min, then at 150. || Tool life falls from 32 minutes to about 4. Speed rose by half. With n = 0.2, life takes the fifth power.",
    note: "Taylor, V T^n = C, with n = 0.2 and C = 200 in these units. One tool, one material, no wear-land definition on the page. A shop still has to say what 'worn' means.",
    animate: false,
    sketch: "meter",
    sliders: [{ key: "speed", label: "Cutting speed", min: 80, max: 180, step: 10, digits: 0, suffix: " m/min" }],
    initial: { speed: 100 },
    view: (v) => {
      const life = ladderToolLifeMinutes(n(v, "speed"));
      return {
        readouts: [
          { label: "Tool life", value: `${fmt(life, 1)} min` },
          { label: "Speed", value: `${fmt(n(v, "speed"), 0)} m/min` },
          { label: "n", value: "0.20" },
        ],
        sentence: `T = (200 / V)⁵. At ${fmt(n(v, "speed"), 0)} m/min that is ${fmt(life, 1)} minutes. A small increase in speed is a large cut in life.`,
        aux: { level: Math.min(1, life / 40) },
      };
    },
  },
  pattern: {
    prompt:
      "Set a 200 mm aluminum part. || The pattern is 202.6 mm. The cavity starts long, because the casting ends at the number on the drawing.",
    note: "Linear shrinkage 1.3% for this aluminum teaching value. Pattern = part × 1.013. The alloy, the mold, and the constraint of cores all move the real number.",
    animate: false,
    sketch: "meter",
    sliders: [{ key: "part", label: "Part length", min: 50, max: 400, step: 10, digits: 0, suffix: " mm" }],
    initial: { part: 200 },
    view: (v) => {
      const pattern = n(v, "part") * 1.013;
      return {
        readouts: [
          { label: "Pattern", value: `${fmt(pattern, 1)} mm` },
          { label: "Part", value: `${fmt(n(v, "part"), 0)} mm` },
          { label: "Shrink", value: "1.3%" },
        ],
        sentence: `Add 1.3% before you cut the pattern. A ${fmt(n(v, "part"), 0)} mm part wants a ${fmt(pattern, 1)} mm cavity.`,
        aux: { level: pattern / 420 },
      };
    },
  },
  distort: {
    prompt:
      "Set heat to 100 J/mm and thickness to 6 mm. Double the heat. || The bow doubles. Put the heat back and double the thickness. || The bow falls by four.",
    note: "Teaching bow δ = 1.08 × heat / thickness², with heat in J/mm and thickness in mm, giving millimeters. It uses teaching powers (real plate stiffness goes as thickness cubed) and a made-up coefficient. Restraint and sequence matter as much as the heat. The plate bows and holds, then the loop repeats. The millimeters are the readout.",
    animate: true,
    sketch: "bow",
    sliders: [
      { key: "heat", label: "Heat per length", min: 40, max: 200, step: 10, digits: 0, suffix: " J/mm" },
      { key: "thick", label: "Thickness", min: 3, max: 16, step: 1, digits: 0, suffix: " mm" },
    ],
    initial: { heat: 100, thick: 6 },
    view: (v) => {
      const bow = (1.08 * n(v, "heat")) / n(v, "thick") ** 2;
      return {
        readouts: [
          { label: "Bow", value: `${fmt(bow, 2)} mm` },
          { label: "Heat", value: `${fmt(n(v, "heat"), 0)} J/mm` },
          { label: "Thickness", value: `${fmt(n(v, "thick"), 0)} mm` },
        ],
        sentence: `Bow tracks heat, and it tracks 1 over thickness squared. At ${fmt(n(v, "thick"), 0)} mm and ${fmt(n(v, "heat"), 0)} J/mm the teaching bow is ${fmt(bow, 2)} mm.`,
        aux: { bow },
      };
    },
  },
  bonus: {
    prompt:
      "Measure the hole at 10.0 mm, then at 10.2 mm. || The position-zone diameter grows from ⌀0.20 mm to ⌀0.40 mm; the radial allowance grows from 0.10 to 0.20 mm. The stated position did not change. The bonus is the extra size, and only because this callout is at maximum material.",
    note: "Hole MMC is 10.0 mm. Position-zone diameter at MMC is ⌀0.20 mm. Bonus = measured size − 10.0, and it is not allowed to go negative. No datum shift.",
    animate: false,
    sketch: "meter",
    sliders: [{ key: "size", label: "Measured hole", min: 10, max: 10.4, step: 0.05, digits: 2, suffix: " mm" }],
    initial: { size: 10 },
    view: (v) => {
      const { bonusMm: bonus, diameterMm: allowed, radialMm } = bonusPosition(n(v, "size"));
      return {
        readouts: [
          { label: "Zone diameter", value: `⌀${fmt(allowed, 2)} mm` },
          { label: "Bonus", value: `${fmt(bonus, 2)} mm` },
          { label: "Maximum radial offset", value: `${fmt(radialMm, 2)} mm` },
        ],
        sentence: `A ${fmt(n(v, "size"), 2)} mm hole is ${fmt(bonus, 2)} mm larger than the maximum-material size, so the position zone is ⌀${fmt(allowed, 2)} mm: maximum radial axis offset ${fmt(radialMm, 2)} mm, not ${fmt(allowed, 2)} mm.`,
        aux: { level: allowed / 0.6 },
      };
    },
  },
  surface: {
    prompt:
      "Select polished, then forged. || Fatigue strength falls from 300 MPa to 150. The alloy did not change. The surface did.",
    note: "Fully reversed steel plateau 300 MPa, multiplied by a teaching surface factor: polished 1, machined 0.8, forged 0.5. Real factors also depend on tensile strength.",
    animate: false,
    sketch: "meter",
    choices: {
      key: "face",
      options: [
        { value: 1, label: "Polished" },
        { value: 0.8, label: "Machined" },
        { value: 0.5, label: "Forged" },
      ],
    },
    sliders: [],
    initial: { face: 1 },
    view: (v) => {
      const factor = n(v, "face") || 1;
      const name = factor > 0.9 ? "Polished" : factor > 0.6 ? "Machined" : "Forged";
      return {
        readouts: [
          { label: "Surface", value: name },
          { label: "Factor", value: fmt(factor, 1) },
          { label: "Fatigue strength", value: `${fmt(300 * factor, 0)} MPa` },
        ],
        sentence: `${name} multiplies the 300 MPa plateau by ${fmt(factor, 1)}. The chemistry is the same bar.`,
        aux: { level: factor },
      };
    },
  },
  travel: {
    prompt:
      "Set travel to 300 mm/min, then to 150. || Heat per length doubles. Current and voltage stayed. The arc simply stayed longer on each millimeter.",
    note: "Heat input = voltage × current × 60 / (travel in mm/min) / 1000, in kJ/mm. Voltage 20 V, current 150 A. Efficiency of the arc is left at 1.",
    animate: true,
    sketch: "torch",
    sliders: [{ key: "travel", label: "Travel speed", min: 100, max: 400, step: 10, digits: 0, suffix: " mm/min" }],
    initial: { travel: 300 },
    view: (v) => {
      const heat = (20 * 150 * 60) / n(v, "travel") / 1000;
      return {
        readouts: [
          { label: "Heat per length", value: `${fmt(heat, 2)} kJ/mm` },
          { label: "Travel", value: `${fmt(n(v, "travel"), 0)} mm/min` },
          { label: "Current", value: "150 A" },
        ],
        sentence: `20 V times 150 A, spread over ${fmt(n(v, "travel"), 0)} mm each minute, is ${fmt(heat, 2)} kJ/mm. Slow the travel and every millimeter gets more heat.`,
        aux: {},
      };
    },
  },
  passes: {
    prompt:
      "Set 10 chances, then 40, each with a 2% chance of a defect. || First-pass yield falls from about 82% to about 45%. No single step looked alarming.",
    note: "Independent chances, each with probability 0.02 of a defect. First-pass yield is 0.98 to the power of the count. Real defects cluster, so independence is the hopeful case.",
    animate: false,
    sketch: "meter",
    sliders: [{ key: "count", label: "Chances to go wrong", min: 5, max: 60, step: 5, digits: 0, suffix: "" }],
    initial: { count: 10 },
    view: (v) => {
      const yieldFrac = 0.98 ** n(v, "count");
      return {
        readouts: [
          { label: "First-pass yield", value: `${fmt(yieldFrac * 100, 0)}%` },
          { label: "Chances", value: fmt(n(v, "count"), 0) },
          { label: "Each step", value: "98% ok" },
        ],
        sentence: `0.98 raised to ${fmt(n(v, "count"), 0)} is ${fmt(yieldFrac * 100, 1)}%. A 2% step risk is quiet. Forty of them are not.`,
        aux: { level: yieldFrac },
      };
    },
  },
  bottleneck: {
    prompt:
      "Leave the stations at 20, 45, and 30 seconds. Speed the first to 10 s. || Throughput stays 80 per hour. Then cut the middle station to 25 s. || Throughput rises, and the 30 s station is now the constraint.",
    note: "Three stations in series. Throughput is 3600 divided by the slowest station, in parts per hour. No buffers, no breakdowns. The token waits in the slow box.",
    animate: true,
    sketch: "station",
    sliders: [
      { key: "a", label: "Station 1", min: 10, max: 60, step: 5, digits: 0, suffix: " s" },
      { key: "b", label: "Station 2", min: 10, max: 60, step: 5, digits: 0, suffix: " s" },
      { key: "c", label: "Station 3", min: 10, max: 60, step: 5, digits: 0, suffix: " s" },
    ],
    initial: { a: 20, b: 45, c: 30 },
    view: (v) => {
      const slow = Math.max(n(v, "a"), n(v, "b"), n(v, "c"));
      const rate = 3600 / slow;
      const who = n(v, "a") === slow ? "Station 1" : n(v, "b") === slow ? "Station 2" : "Station 3";
      return {
        readouts: [
          { label: "Throughput", value: `${fmt(rate, 0)} / h` },
          { label: "Slowest", value: `${fmt(slow, 0)} s` },
          { label: "Constraint", value: who },
        ],
        sentence: `${who} takes ${fmt(slow, 0)} s, so the line makes ${fmt(rate, 0)} parts an hour. Speeding a station that is not the slowest does not change that.`,
        aux: { a: n(v, "a"), b: n(v, "b"), c: n(v, "c") },
      };
    },
  },
  piececost: {
    prompt:
      "Set 100 parts, then 10000. || Unit cost falls from 86.40 to 7.20. The material and the minutes did not change. The tool was divided by the count.",
    note: "Material 4, process 2.40, tooling 8000, split across the batch. No learning curve and no scrap. Currency is unnamed on purpose.",
    animate: false,
    sketch: "meter",
    sliders: [{ key: "batch", label: "Batch", min: 100, max: 10000, step: 100, digits: 0, suffix: "" }],
    initial: { batch: 100 },
    view: (v) => {
      const tool = 8000 / n(v, "batch");
      const unit = 4 + 2.4 + tool;
      return {
        readouts: [
          { label: "Unit cost", value: fmt(unit, 2) },
          { label: "Tooling each", value: fmt(tool, 2) },
          { label: "Material + time", value: "6.40" },
        ],
        sentence: `6.40 is there at any batch size. Tooling adds ${fmt(tool, 2)} at a batch of ${fmt(n(v, "batch"), 0)}. A process with an expensive tool is a bet on quantity.`,
        aux: { level: Math.min(1, 7.2 / unit) },
      };
    },
  },
  dfa: {
    prompt:
      "Set 6 parts, then 3. || Assembly time falls from 60 s to 36 s. Each part you delete removes its handling. The model does not know whether the remaining joint is strong enough.",
    note: "One essential part at 20 s, and 8 s of handling for every extra part. No fasteners versus snaps distinction beyond the count. The middle station stays lit longer as the part count rises. The seconds are the readout.",
    animate: true,
    sketch: "station",
    sliders: [{ key: "parts", label: "Parts", min: 1, max: 12, step: 1, digits: 0, suffix: "" }],
    initial: { parts: 6 },
    view: (v) => {
      const time = 20 + (n(v, "parts") - 1) * 8;
      return {
        readouts: [
          { label: "Assembly time", value: `${fmt(time, 0)} s` },
          { label: "Parts", value: fmt(n(v, "parts"), 0) },
          { label: "Each extra", value: "8 s" },
        ],
        sentence: `${fmt(n(v, "parts"), 0)} parts take ${fmt(time, 0)} s in this count. Deleting a part deletes its 8 s only if the product still does the job.`,
        aux: { a: 8, b: Math.max(8, n(v, "parts") * 4), c: 8 },
      };
    },
  },
  scrap: {
    prompt:
      "Set yield to 80%, then to 95%. || Cost per good part falls from 12.50 to about 10.53. You divide by the yield. Subtracting the scrap fraction from the price is the wrong arithmetic.",
    note: "Every part, good or not, costs 10 to process. Cost per good part is 10 / yield. Rework is not in the model. Yield is the fraction that ship.",
    animate: false,
    sketch: "meter",
    sliders: [{ key: "yield", label: "Yield", min: 0.7, max: 0.99, step: 0.01, digits: 2, suffix: "" }],
    initial: { yield: 0.8 },
    view: (v) => {
      const each = 10 / n(v, "yield");
      return {
        readouts: [
          { label: "Cost per good", value: fmt(each, 2) },
          { label: "Process cost", value: "10" },
          { label: "Yield", value: `${fmt(n(v, "yield") * 100, 0)}%` },
        ],
        sentence: `10 divided by ${fmt(n(v, "yield"), 2)} is ${fmt(each, 2)}. The bad parts were paid for. Their cost lands on the good ones.`,
        aux: { level: n(v, "yield") },
      };
    },
  },
  float: {
    prompt:
      "Decide whether the block floats, and how much of it is under. Set 500 kg/m³, then 1500. || At 500 it floats half under, because half the water's density carries the whole block. At 1500 it sinks. Stop. The floating fraction is only valid while it is at most 1.",
    note: "Block volume is 0.002 m³. Fresh water is 1000 kg/m³. g is 9.81. A floating block sinks until the displaced water weighs as much as the block. A denser block is fully under and still short.",
    animate: false,
    sketch: "hull",
    sliders: [{ key: "density", label: "Block density", min: 200, max: 2000, step: 50, digits: 0, suffix: " kg/m³" }],
    initial: { density: 500 },
    view: (v) => {
      const density = n(v, "density");
      const floats = density <= 1000;
      const frac = floats ? density / 1000 : 1;
      const weight = (density * 0.002 * 9.81);
      const fb = 1000 * frac * 0.002 * 9.81;
      return {
        readouts: [
          { label: floats ? "Under" : "State", value: floats ? `${fmt(frac * 100, 0)}%` : "Sinks" },
          { label: "Buoyancy", value: `${fmt(fb, 2)} N` },
          { label: "Weight", value: `${fmt(weight, 2)} N` },
        ],
        sentence: floats
          ? `At ${fmt(density, 0)} kg/m³ the block floats with ${fmt(frac * 100, 0)}% of its volume under. That displaced water weighs the same as the block.`
          : `At ${fmt(density, 0)} kg/m³ the block weighs ${fmt(weight, 2)} N and the full tank push is only ${fmt(fb, 2)} N. It sinks.`,
        aux: { level: frac, sink: floats ? 0 : 1 },
      };
    },
  },
  pipe: {
    prompt:
      "The flow stays 0.010 m³/s. Find the speed after the pipe narrows. Set the area to 0.010 m², then to 0.005 m². || Speed goes from 1 m/s to 2 m/s. The cubic meters per second did not change. This is not a pressure.",
    note: "Q is 0.010 m³/s. Nothing is stored and nothing leaks. Speed is Q divided by area. Pressure is not on this page.",
    animate: true,
    sketch: "flow",
    sliders: [{ key: "area", label: "Area", min: 0.004, max: 0.02, step: 0.001, digits: 3, suffix: " m²" }],
    initial: { area: 0.01 },
    view: (v) => {
      const speed = 0.01 / n(v, "area");
      return {
        readouts: [
          { label: "Speed", value: `${fmt(speed, 2)} m/s` },
          { label: "Flow", value: "0.010 m³/s" },
          { label: "Area", value: `${fmt(n(v, "area"), 3)} m²` },
        ],
        sentence: `0.010 divided by ${fmt(n(v, "area"), 3)} is ${fmt(speed, 2)} m/s. Halve the area and the speed doubles.`,
        aux: { speed, level: Math.min(1, n(v, "area") / 0.02) },
      };
    },
  },
  turn: {
    prompt:
      "Speed stays 10 m/s. Find the inward acceleration on the tighter curve. Set the radius to 2 m, then to 1 m. || Acceleration goes from 50 to 100 m/s², toward the center. The speed did not change. A steady speed is not zero acceleration.",
    note: "a = v² / r with v fixed at 10 m/s. The number is the inward acceleration. The arm length in the drawing is the radius.",
    animate: true,
    sketch: "spin",
    sliders: [{ key: "radius", label: "Radius", min: 0.5, max: 4, step: 0.5, digits: 1, suffix: " m" }],
    initial: { radius: 2 },
    view: (v) => {
      const a = 100 / n(v, "radius");
      return {
        readouts: [
          { label: "Inward acceleration", value: `${fmt(a, 0)} m/s²` },
          { label: "Speed", value: "10 m/s" },
          { label: "Radius", value: `${fmt(n(v, "radius"), 1)} m` },
        ],
        sentence: `100 divided by ${fmt(n(v, "radius"), 1)} is ${fmt(a, 0)} m/s². Half the radius, same speed, double the acceleration.`,
        aux: { omega: 2.2, reach: 28 + n(v, "radius") * 16 },
      };
    },
  },
  diffuse: {
    prompt:
      "The front is at 1 mm after 4 hours. You need it at 2 mm. Set 4 hours, then 16. || The front moves from 1 mm to 2 mm. Four times the time, twice the distance. Do not double the hours and expect double the distance.",
    note: "x = √(D t) with D fixed at 0.25 mm²/h. One dimension. Temperature is not a slider, so D cannot change.",
    animate: false,
    sketch: "front",
    sliders: [{ key: "hours", label: "Time", min: 1, max: 36, step: 1, digits: 0, suffix: " h" }],
    initial: { hours: 4 },
    view: (v) => {
      const x = Math.sqrt(0.25 * n(v, "hours"));
      return {
        readouts: [
          { label: "Distance", value: `${fmt(x, 2)} mm` },
          { label: "Time", value: `${fmt(n(v, "hours"), 0)} h` },
          { label: "D", value: "0.25 mm²/h" },
        ],
        sentence: `The square root of 0.25 times ${fmt(n(v, "hours"), 0)} is ${fmt(x, 2)} mm. Four times the hours is twice the distance, not four times.`,
        aux: { level: x / 3 },
      };
    },
  },
  mixture: {
    prompt:
      "The pull is along the fibers. Find the modulus with no fiber, then at 0.60, and say which term did the work. || Modulus goes from 3.5 GPa to 139.4 GPa. Almost all of the 139 is the fiber. Across the fibers, do not use it.",
    note: "E = 230 Vf + 3.5 (1 − Vf), in GPa. Longitudinal rule of mixtures. The transverse modulus is not drawn and not reported.",
    animate: false,
    sketch: "fibers",
    sliders: [{ key: "vf", label: "Fiber fraction", min: 0, max: 0.7, step: 0.05, digits: 2, suffix: "" }],
    initial: { vf: 0 },
    view: (v) => {
      const vf = n(v, "vf");
      const e = 230 * vf + 3.5 * (1 - vf);
      return {
        readouts: [
          { label: "Along the fibers", value: `${fmt(e, 1)} GPa` },
          { label: "Fiber term", value: `${fmt(230 * vf, 1)}` },
          { label: "Epoxy term", value: `${fmt(3.5 * (1 - vf), 1)}` },
        ],
        sentence: `At a fiber fraction of ${fmt(vf, 2)} the modulus along the fibers is ${fmt(e, 1)} GPa. ${fmt(230 * vf, 1)} of that is the fiber and ${fmt(3.5 * (1 - vf), 1)} is the epoxy. Across the fibers, do not use this.`,
        aux: { twist: 0 },
      };
    },
  },
  pinshear: {
    prompt:
      "The load stays 4000 N on one plane. Find the stress at 8 mm, then at 16 mm. || Shear stress falls from 79.6 MPa to 19.9 MPa, a quarter, not a half. If the pin has two shear planes, this number is the wrong joint.",
    note: "One shear plane. τ = 4000 / (π d² / 4). A pin through two lugs would be double shear and about half of this. Bending of the pin is left out.",
    animate: false,
    sketch: "pin",
    sliders: [{ key: "d", label: "Diameter", min: 4, max: 20, step: 1, digits: 0, suffix: " mm" }],
    initial: { d: 8 },
    view: (v) => {
      const d = n(v, "d") / 1000;
      const tau = 4000 / ((Math.PI * d * d) / 4) / 1e6;
      return {
        readouts: [
          { label: "Shear stress", value: `${fmt(tau, 1)} MPa` },
          { label: "Load", value: "4000 N" },
          { label: "Planes", value: "1" },
        ],
        sentence: `4000 N across one ${fmt(n(v, "d"), 0)} mm circle is ${fmt(tau, 1)} MPa. Double the diameter and the stress falls to a quarter.`,
        aux: { level: n(v, "d") / 20 },
      };
    },
  },
  coilspring: {
    prompt:
      "You need a rate, and the lever you have is the wire. Set 2 mm, then 4 mm. || The rate goes from 2500 N/m to 40000 N/m. The wire only doubled. The fourth power made it sixteen times. This is not the stress in the wire.",
    note: "k = G d⁴ / (8 D³ N). G is 80 GPa. Mean diameter is 20 mm. Active coils are 8. This is rate, not the stress in the wire. The coil draws shorter as the rate rises, so the picture matches the stiffness, not a load.",
    animate: false,
    sketch: "coil",
    sliders: [{ key: "wire", label: "Wire", min: 1, max: 5, step: 0.5, digits: 1, suffix: " mm" }],
    initial: { wire: 2 },
    view: (v) => {
      const d = n(v, "wire") / 1000;
      const k = (80e9 * d ** 4) / (8 * 0.02 ** 3 * 8);
      return {
        readouts: [
          { label: "Rate", value: `${fmt(k, 0)} N/m` },
          { label: "Wire", value: `${fmt(n(v, "wire"), 1)} mm` },
          { label: "Coils", value: "8" },
        ],
        sentence: `With a ${fmt(n(v, "wire"), 1)} mm wire the rate is ${fmt(k, 0)} N/m. Doubling the wire multiplies the rate by 16, because diameter is to the fourth.`,
        aux: { level: Math.min(1, k / 40000) },
      };
    },
  },
  locate: {
    prompt:
      "Locate the part. Then try to locate it more. Set 3 on the base, 2 on the side, and 1 on the end. Then set the base to 4. || At 3, 2, and 1, no motion is left. The fourth contact removes nothing. A face that is already full cannot stop a new motion.",
    note: "A free part has 6 motions. The base caps at 3, the side at 2, the end at 1. Contacts past a cap are wasted. The picture shows every contact you placed, including the wasted ones.",
    animate: false,
    sketch: "nest",
    sliders: [
      { key: "base", label: "Base", min: 0, max: 4, step: 1, digits: 0, suffix: "" },
      { key: "side", label: "Side", min: 0, max: 3, step: 1, digits: 0, suffix: "" },
      { key: "end", label: "End", min: 0, max: 2, step: 1, digits: 0, suffix: "" },
    ],
    initial: { base: 3, side: 2, end: 1 },
    view: (v) => {
      const used = Math.min(n(v, "base"), 3) + Math.min(n(v, "side"), 2) + Math.min(n(v, "end"), 1);
      const placed = n(v, "base") + n(v, "side") + n(v, "end");
      const left = 6 - used;
      return {
        readouts: [
          { label: "Motions left", value: fmt(left, 0) },
          { label: "Contacts that count", value: fmt(used, 0) },
          { label: "Wasted", value: fmt(placed - used, 0) },
        ],
        sentence:
          left === 0
            ? placed === used
              ? "All 6 motions are taken. No contact is wasted."
              : `${fmt(placed - used, 0)} contact${placed - used === 1 ? " is" : "s are"} past a cap. The part was already located.`
            : `${fmt(left, 0)} motion${left === 1 ? " is" : "s are"} still free. A face only stops so many: 3 on the base, 2 on the side, 1 on the end.`,
        aux: { a: n(v, "base"), b: n(v, "side"), c: n(v, "end") },
      };
    },
  },
  layers: {
    prompt:
      "The load peels one layer off the next. Read the bond at a knockdown of 2. Then set it to 1 and put it back. || At 2, the bond is 20 MPa and the road is still 40. Use 20 for that pull. Knockdown 1 is a claim that you measured, not a usual print.",
    note: "Strength along a road is 40 MPa. Strength between layers is 40 divided by the knockdown. Voids beyond that ratio are not in the model. The gaps in the drawing grow with the knockdown. They are a picture, not a measured thickness.",
    animate: false,
    sketch: "layers",
    sliders: [{ key: "knock", label: "Knockdown", min: 1, max: 5, step: 0.5, digits: 1, suffix: "" }],
    initial: { knock: 2 },
    view: (v) => {
      const bond = 40 / n(v, "knock");
      return {
        readouts: [
          { label: "Between layers", value: `${fmt(bond, 1)} MPa` },
          { label: "Along the road", value: "40 MPa" },
          { label: "Knockdown", value: fmt(n(v, "knock"), 1) },
        ],
        sentence: `40 divided by ${fmt(n(v, "knock"), 1)} is ${fmt(bond, 1)} MPa between layers. The road is still 40. A pull that peels the layers must use the smaller number.`,
        aux: { gap: n(v, "knock") - 1 },
      };
    },
  },
  takt: {
    prompt:
      "You have 400 minutes. Find the pace, then say if the 4-minute station is late. Set demand to 50, then to 200. || Takt goes from 8 min to 2 min. At 50 you have slack. At 200 you are 2 minutes late on every part. Speeding a station that is already inside the pace does not serve this demand.",
    note: "400 minutes available. One station takes 4 minutes. Takt is 400 divided by demand. No breaks and no scrap. The pale bar is takt. The solid bar is the station.",
    animate: false,
    sketch: "race",
    sliders: [{ key: "demand", label: "Demand", min: 40, max: 200, step: 10, digits: 0, suffix: " parts" }],
    initial: { demand: 50 },
    view: (v) => {
      const takt = 400 / n(v, "demand");
      const late = 4 - takt;
      return {
        readouts: [
          { label: "Takt", value: `${fmt(takt, 1)} min` },
          { label: "Station", value: "4 min" },
          { label: late > 0 ? "Late each part" : "Slack each part", value: `${fmt(Math.abs(late), 1)} min` },
        ],
        sentence:
          late > 0
            ? `Demand of ${fmt(n(v, "demand"), 0)} sets takt at ${fmt(takt, 1)} min. The station takes 4, so every part is ${fmt(late, 1)} min late.`
            : `Demand of ${fmt(n(v, "demand"), 0)} sets takt at ${fmt(takt, 1)} min. The station's 4 min fits, with ${fmt(-late, 1)} min of slack.`,
        aux: { takt, cycle: 4 },
      };
    },
  },
  transition: {
    prompt:
      "Set the temperature to −20°C, then to 20°C. || Energy goes from about 20 J to about 80 J. Same steel. Cold, it snaps. Warm, it tears.",
    note: "Teaching Charpy curve centered at 0°C. Lower shelf 15 J, upper shelf 85 J. Not a named plate. Thickness, notch sharpness, and rate move a real transition.",
    animate: false,
    sketch: "snap",
    sliders: [{ key: "temp", label: "Temperature", min: -40, max: 40, step: 5, digits: 0, suffix: "°C" }],
    initial: { temp: -20 },
    view: (v) => {
      const temp = n(v, "temp");
      const energy = 15 + 70 / (1 + Math.exp(-temp / 8));
      const call = temp <= -10 ? "Snaps" : temp >= 10 ? "Tears" : "In between";
      return {
        readouts: [
          { label: "Energy", value: `${fmt(energy, 0)} J` },
          { label: "Temperature", value: `${fmt(temp, 0)}°C` },
          { label: "Call", value: call },
        ],
        sentence:
          temp < 0
            ? `At ${fmt(temp, 0)}°C the energy is about ${fmt(energy, 0)} J. You are on the cold side of 0°C, so this teaching steel snaps.`
            : `At ${fmt(temp, 0)}°C the energy is about ${fmt(energy, 0)} J. You are on the warm side of 0°C, so it tears instead.`,
        aux: { cold: temp < 0 ? 1 : 0 },
      };
    },
  },
  scc: {
    prompt:
      "Hold 200 MPa in dry air. || The rate is zero. Switch the environment on. || It grows at 0.04 mm per year. Then drop the stress under 120 MPa. || It stops, even though the chemical is still there.",
    note: "Threshold 120 MPa. Wet rate is 0.04 mm/year at 200 MPa and falls to zero at the threshold. Dry rate is always zero. Not a named alloy-environment pair.",
    animate: true,
    sketch: "crack",
    choices: {
      key: "env",
      options: [
        { value: 0, label: "Dry air" },
        { value: 1, label: "Wet" },
      ],
    },
    sliders: [{ key: "stress", label: "Stress", min: 40, max: 280, step: 20, digits: 0, suffix: " MPa" }],
    initial: { env: 0, stress: 200 },
    view: (v) => {
      const wet = n(v, "env") > 0.5;
      const stress = n(v, "stress");
      const rate = wet && stress > 120 ? (0.04 * (stress - 120)) / 80 : 0;
      return {
        readouts: [
          { label: "Growth", value: `${fmt(rate, 3)} mm/y` },
          { label: "Stress", value: `${fmt(stress, 0)} MPa` },
          { label: "Environment", value: wet ? "Wet" : "Dry" },
        ],
        sentence:
          rate > 0
            ? `Both partners are present. Above 120 MPa in the wet environment the rate is ${fmt(rate, 3)} mm per year.`
            : wet
              ? `The chemical is here, but ${fmt(stress, 0)} MPa is not over the 120 MPa threshold. The rate is zero.`
              : "Dry air. The stress has no chemical partner, so this crack does not grow.",
        aux: { hold: rate > 0 ? 0 : 1 },
      };
    },
  },
  wear: {
    prompt:
      "Set 200 N, 1000 m, and 1000 MPa. || The volume lost is 20 mm³. Then set hardness to 2000 MPa. || The volume falls to 10 mm³. Hardness was the lever. Yield was not.",
    note: "V in mm³ = 1000 × k × F × s / H, with k = 10⁻⁴ and H in MPa. The 1000 turns newtons, meters, and megapascals into cubic millimeters. Dry sliding. No grit and no oil.",
    animate: false,
    sketch: "scar",
    sliders: [
      { key: "load", label: "Load", min: 50, max: 400, step: 50, digits: 0, suffix: " N" },
      { key: "distance", label: "Distance", min: 200, max: 2000, step: 100, digits: 0, suffix: " m" },
      { key: "hard", label: "Hardness", min: 250, max: 2000, step: 50, digits: 0, suffix: " MPa" },
    ],
    initial: { load: 200, distance: 1000, hard: 1000 },
    view: (v) => {
      const volume = (1e-4 * n(v, "load") * n(v, "distance")) / n(v, "hard") * 1000;
      return {
        readouts: [
          { label: "Volume lost", value: `${fmt(volume, 1)} mm³` },
          { label: "Load", value: `${fmt(n(v, "load"), 0)} N` },
          { label: "Hardness", value: `${fmt(n(v, "hard"), 0)} MPa` },
        ],
        sentence: `1000 × 10⁻⁴ × ${fmt(n(v, "load"), 0)} × ${fmt(n(v, "distance"), 0)} / ${fmt(n(v, "hard"), 0)} = ${fmt(volume, 1)} mm³. Hardness is in MPa. Double it and the pile halves.`,
        aux: { level: Math.min(1, volume / 80) },
      };
    },
  },
  scale: {
    prompt:
      "Set the section to 10 mm, then to 200 mm. || Toughness and yield stay put. L is 40 mm. The 10 mm section yields through. The 200 mm section can fracture first.",
    note: "KIc = 80 MPa√m and yield = 400 MPa, so L = (KIc / yield)² = 40 mm. Under L the call is yield-first. Over L, fracture can come first. No crack shape is specified.",
    animate: false,
    sketch: "meter",
    sliders: [{ key: "size", label: "Section", min: 5, max: 300, step: 5, digits: 0, suffix: " mm" }],
    initial: { size: 10 },
    view: (v) => {
      const size = n(v, "size");
      const limit = 40;
      const fracture = size > limit;
      return {
        readouts: [
          { label: "Section", value: `${fmt(size, 0)} mm` },
          { label: "L", value: "40 mm" },
          { label: "Call", value: fracture ? "Fracture can be first" : "Yields first" },
        ],
        sentence: fracture
          ? `${fmt(size, 0)} mm is over 40 mm. The same metal can fracture while the net section is still under yield.`
          : `${fmt(size, 0)} mm is under 40 mm. This section yields through before a crack outruns it.`,
        aux: { level: Math.min(1, size / 300) },
      };
    },
  },
  clocks: {
    prompt:
      "Set fatigue to 0.40 and creep to 0.30. || The sum is 0.70, so the part is still in. Raise creep to 0.70. || The sum is 1.10. Each clock alone was under 1. Together they are done.",
    note: "D = n/N + t/t_r. Retire at 1. Linear sum only. A hold inside a cycle can be worse, and order is left out.",
    animate: false,
    sketch: "meter",
    sliders: [
      { key: "fat", label: "Fatigue n/N", min: 0, max: 1, step: 0.05, digits: 2, suffix: "" },
      { key: "creep", label: "Creep t/tr", min: 0, max: 1, step: 0.05, digits: 2, suffix: "" },
    ],
    initial: { fat: 0.4, creep: 0.3 },
    view: (v) => {
      const damage = n(v, "fat") + n(v, "creep");
      const done = damage >= 1;
      return {
        readouts: [
          { label: "Sum", value: fmt(damage, 2) },
          { label: "Fatigue", value: fmt(n(v, "fat"), 2) },
          { label: "Creep", value: fmt(n(v, "creep"), 2) },
        ],
        sentence: done
          ? `${fmt(n(v, "fat"), 2)} + ${fmt(n(v, "creep"), 2)} = ${fmt(damage, 2)}. The part is done, even though each fraction is under 1.`
          : `${fmt(n(v, "fat"), 2)} + ${fmt(n(v, "creep"), 2)} = ${fmt(damage, 2)}. Still under 1. Do not clear the clocks separately and stop.`,
        aux: { level: Math.min(1, damage) },
      };
    },
  },
};

type FormulaId = keyof typeof specs;

export function isLadderBench(id: string): id is LadderBenchId {
  return id in specs || id === "duty" || id === "review" || id === "face";
}

export function LadderBench({ id }: { id: LadderBenchId }) {
  if (id === "duty" || id === "review" || id === "face") return <SortBench id={id} />;
  return <FormulaBench spec={specs[id as FormulaId]} />;
}
