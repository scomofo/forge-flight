import type { ReactNode } from "react";
import { Arrow, Axes, C, DimH, DimV, Ground, Label, WallV, plotBox, type FigureMap } from "./kit";
import { AnimatedFigure, clamp, GrowArrow, HOLD, lerp, op, partial, seg } from "./motion";

/* ---------- local helpers ---------- */

type Tone = "ink" | "accent" | "muted" | "alarm";

/** A circular arc with an arrowhead at its end. Angles in degrees, SVG sense (clockwise from +x). */
function ArcArrow({
  cx,
  cy,
  r,
  a1,
  a2,
  tone = "accent",
  width = 3,
}: {
  cx: number;
  cy: number;
  r: number;
  a1: number;
  a2: number;
  tone?: Tone;
  width?: number;
}) {
  const p = (a: number) => [cx + r * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180)];
  const [x1, y1] = p(a1);
  const [x2, y2] = p(a2);
  const large = Math.abs(a2 - a1) > 180 ? 1 : 0;
  const sweep = a2 > a1 ? 1 : 0;
  return (
    <path
      d={`M${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 ${large},${sweep} ${x2.toFixed(1)},${y2.toFixed(1)}`}
      fill="none"
      stroke={C[tone]}
      strokeWidth={width}
      markerEnd={`url(#fig-arrow-${tone})`}
    />
  );
}

/** Data point: filled dot, or hollow when `hollow`. */
function Dot({
  x,
  y,
  tone = "accent",
  hollow = false,
  opacity,
}: {
  x: number;
  y: number;
  tone?: Tone;
  hollow?: boolean;
  opacity?: number;
}) {
  return <circle cx={x} cy={y} r={6} fill={hollow ? C.surface : C[tone]} stroke={C[tone]} strokeWidth={2.5} opacity={opacity} />;
}

/** Dashed guide line. */
function Guide({ x1, y1, x2, y2, opacity }: { x1: number; y1: number; x2: number; y2: number; opacity?: number }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.muted} strokeWidth={1.2} strokeDasharray="4 4" opacity={opacity} />;
}

/**
 * A knockout for a centred label that something moves under: the same text in the surface colour,
 * stroked wide. Only drawn while the motion runs, so the final frame never carries it.
 */
function Halo({
  x,
  y,
  size = 16,
  weight,
  opacity,
  children,
}: {
  x: number;
  y: number;
  size?: number;
  weight?: number;
  opacity?: number;
  children: string;
}) {
  return (
    <text
      x={x}
      y={y}
      fill={C.surface}
      stroke={C.surface}
      strokeWidth={8}
      strokeLinejoin="round"
      textAnchor="middle"
      fontSize={size}
      fontWeight={weight}
      dominantBaseline="middle"
      opacity={opacity}
    >
      {children}
    </text>
  );
}

/** A vertical guide dropped from (x, y1) toward y2, drawn to share p so its dashes stay put. */
function Drop({ x, y1, y2, p }: { x: number; y1: number; y2: number; p: number }) {
  return p < 0.02 ? null : <Guide x1={x} y1={y1} x2={x} y2={lerp(y1, y2, p)} />;
}

/** Sample f over [a,b] into points. */
function sample(f: (x: number) => number, a: number, b: number, n = 120): Array<[number, number]> {
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= n; i++) {
    const x = a + ((b - a) * i) / n;
    pts.push([x, f(x)]);
  }
  return pts;
}

/** Small pin support: triangle under (x,y). */
function Pin({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <path d={`M${x},${y} L${x - 10},${y + 16} L${x + 10},${y + 16} Z`} fill={C.surface} stroke={C.ink} strokeWidth={2} />
      <circle cx={x} cy={y} r={3} fill={C.ink} />
    </g>
  );
}

/* ---------- physics-201 ---------- */

/** Torque: 40 N at 30° to a 0.25 m wrench; perpendicular lever 0.125 m. */
function Torque() {
  const P = { x: 70, y: 190 };
  const E = { x: 370, y: 190 };
  const d = { x: Math.cos(Math.PI / 6), y: Math.sin(Math.PI / 6) }; // force direction (down-right)
  const proj = (E.x - P.x) * d.x; // 259.8
  const F = { x: E.x - proj * d.x, y: E.y - proj * d.y }; // foot of perpendicular from pivot
  const n = { x: (P.x - F.x) / 150, y: (P.y - F.y) / 150 };
  const tail = { x: E.x - 100 * d.x, y: E.y - 100 * d.y };
  const hex = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i + Math.PI / 6;
    return `${(P.x + 18 * Math.cos(a)).toFixed(1)},${(P.y + 18 * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
  return (
    <AnimatedFigure
      height={260}
      duration={4.5}
      alt="A 0.25 m wrench with a 40 N push at 30 degrees on its end; the force line is extended and a 0.125 m perpendicular runs from the bolt to it, giving 5 N·m."
      steps={[
        { at: 0, label: "Push", caption: "A 0.25 m lug wrench with 40 N on its end, pushed at 30° to the wrench." },
        { at: 1.5, label: "Square", caption: "Pushed square to the wrench, the whole 0.25 m would count: 0.25 × 40 = 10 N·m." },
        {
          at: 2.4,
          label: "Lever arm",
          caption: "At 30° the lever is the perpendicular from the bolt to the force's line: 0.125 m, half the wrench.",
        },
        {
          at: 3.8,
          label: "Torque",
          caption:
            "Only the perpendicular distance from the bolt to the force's line counts: at 30° that is half the wrench, so 5 N·m instead of 10.",
        },
      ]}
    >
      {({ t }) => {
        const arm = seg(t, 2.8, 3.4); // the perpendicular grows out from the bolt to the force's line
        return (
          <>
            <rect x={P.x} y={P.y - 7} width={E.x - P.x} height={14} rx={7} fill={C.soft} stroke={C.ink} strokeWidth={2} />
            <polygon points={hex} fill={C.surface} stroke={C.ink} strokeWidth={2.5} />
            <circle cx={P.x} cy={P.y} r={3} fill={C.ink} />
            <line
              x1={F.x}
              y1={F.y}
              x2={tail.x}
              y2={tail.y}
              stroke={C.muted}
              strokeWidth={1.5}
              strokeDasharray="6 5"
              opacity={op(seg(t, 2.4, 2.9))}
            />
            {arm > 0.02 ? (
              <line x1={P.x} y1={P.y} x2={lerp(P.x, F.x, arm)} y2={lerp(P.y, F.y, arm)} stroke={C.accent} strokeWidth={3} />
            ) : null}
            <path
              d={`M${F.x + 10 * d.x},${F.y + 10 * d.y} l${10 * n.x},${10 * n.y} l${-10 * d.x},${-10 * d.y}`}
              fill="none"
              stroke={C.accent}
              strokeWidth={1.5}
              opacity={op(seg(t, 3.3, 3.7))}
            />
            <Label x={96} y={112} anchor="end" tone="accent" weight={600} opacity={op(seg(t, 3.3, 3.8))}>0.125 m</Label>
            <GrowArrow p={seg(t, 0.4, 1)} x1={tail.x} y1={tail.y} x2={E.x - 3} y2={E.y - 2} tone="ink" width={3.5} />
            <Label x={338} y={140} anchor="start" opacity={op(seg(t, 0.8, 1.3))}>40 N</Label>
            <g opacity={op(seg(t, 0.9, 1.4))}>
              <ArcArrow cx={E.x} cy={E.y} r={58} a1={180} a2={208} tone="muted" width={1.5} />
              <Label x={296} y={169} tone="muted" size={15}>30°</Label>
            </g>
            <DimH x1={P.x} x2={E.x} y={236} label="0.25 m" />
            <Label x={450} y={38} anchor="end" tone="accent" weight={600} opacity={op(seg(t, 3.8, 4.3))}>τ = 0.125 × 40 = 5 N·m</Label>
            <Label x={450} y={64} anchor="end" tone="muted" size={15} opacity={op(seg(t, 1.5, 2))}>square push: 10 N·m</Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** Inertia: hoop vs disk, same M and R. */
function Inertia() {
  return (
    <AnimatedFigure
      height={250}
      duration={3.6}
      alt="A hoop and a solid disk of the same mass and radius side by side, labelled I = MR² and I = ½MR²."
      steps={[
        { at: 0, label: "Hoop", caption: "A hoop of mass M and radius R keeps all of its mass at the rim: I = MR²." },
        {
          at: 1.3,
          label: "Disk",
          caption: "A disk of the same mass and radius keeps part of its mass near the middle, where it hardly has to move: I = ½MR².",
        },
        {
          at: 2.6,
          label: "Compare",
          caption: "Same kilograms, same size: the hoop keeps all its mass at the rim, so it has twice the disk's inertia.",
        },
      ]}
    >
      {({ t }) => (
        <>
          <Label x={240} y={20} tone="muted" size={15}>same mass M, same radius R</Label>
          <circle cx={130} cy={125} r={74} fill="none" stroke={C.accent} strokeWidth={12} opacity={op(seg(t, 0.4, 0.9))} />
          <circle cx={130} cy={125} r={4} fill={C.ink} />
          <line x1={130} y1={125} x2={130 + 80 * 0.707} y2={125 - 80 * 0.707} stroke={C.muted} strokeWidth={1.5} />
          <Label x={150} y={110} tone="muted" size={15}>R</Label>
          <circle cx={350} cy={125} r={80} fill={C.soft} stroke={C.ink} strokeWidth={2} opacity={op(seg(t, 1.3, 1.8))} />
          <circle cx={350} cy={125} r={4} fill={C.ink} />
          <line x1={350} y1={125} x2={350 + 80 * 0.707} y2={125 - 80 * 0.707} stroke={C.muted} strokeWidth={1.5} />
          <Label x={370} y={110} tone="muted" size={15}>R</Label>
          <Label x={130} y={226} weight={600} opacity={op(seg(t, 0.8, 1.3))}>hoop: I = MR²</Label>
          <Label x={350} y={226} weight={600} opacity={op(seg(t, 1.8, 2.3))}>disk: I = ½MR²</Label>
        </>
      )}
    </AnimatedFigure>
  );
}

/** Spin: arms out I 1.2, ω 4 → arms in I 0.6, ω 8. */
function Spin() {
  const L = { x: 120, y: 140 };
  const R = { x: 360, y: 140 };
  return (
    <AnimatedFigure
      height={280}
      // With the end hold, one loop lasts 2π s: a whole number of half-turns at both 4 and 8 rad/s.
      duration={2 * Math.PI - HOLD}
      alt="Top view of a skater with arms out (I 1.2 kg·m², 4 rad/s) and with arms in (I 0.6 kg·m², 8 rad/s), both with angular momentum 4.8 kg·m²/s."
      steps={[
        { at: 0, label: "Arms out", caption: "Arms out, the inertia is 1.2 kg·m², so the spin is 4.8 / 1.2 = 4 rad/s." },
        { at: 1.2, label: "Arms in", caption: "Pull the arms in until the inertia is 0.6 kg·m², and the spin rises to 8 rad/s." },
        { at: 2.7, label: "Same Iω", caption: "Nothing twisted the skater: halving the inertia doubles the spin so Iω stays 4.8." },
      ]}
    >
      {({ t, raw, duration }) => {
        // Both spin clockwise in real time, phased so the final frame has the arms level.
        const a = raw - duration;
        const turn = (w: number, c: { x: number; y: number }) =>
          a ? `rotate(${((w * a * 180) / Math.PI).toFixed(1)} ${c.x} ${c.y})` : undefined;
        const iOut = op(seg(t, 0.3, 0.8));
        const wOut = op(seg(t, 0.5, 1));
        return (
          <>
            <Label x={240} y={18} tone="muted" size={15} opacity={op(seg(t, 2.7, 3.2))}>Iω = 4.8 kg·m²/s both times</Label>
            <g transform={turn(4, L)}>
              <line x1={L.x - 80} y1={L.y} x2={L.x + 80} y2={L.y} stroke={C.ink} strokeWidth={4} />
              <circle cx={L.x - 80} cy={L.y} r={8} fill={C.accent} />
              <circle cx={L.x + 80} cy={L.y} r={8} fill={C.accent} />
            </g>
            <circle cx={L.x} cy={L.y} r={18} fill={C.soft} stroke={C.ink} strokeWidth={2} />
            <ArcArrow cx={L.x} cy={L.y} r={92} a1={215} a2={325} tone="muted" width={2} />
            {/* the long arms sweep under their own labels, so knock the labels out while they spin */}
            {a ? <Halo x={L.x} y={200} opacity={iOut}>I = 1.2 kg·m²</Halo> : null}
            <Label x={L.x} y={200} opacity={iOut}>I = 1.2 kg·m²</Label>
            {a ? <Halo x={L.x} y={226} weight={600} opacity={wOut}>ω = 4 rad/s</Halo> : null}
            <Label x={L.x} y={226} weight={600} opacity={wOut}>ω = 4 rad/s</Label>

            <GrowArrow p={seg(t, 1.2, 1.7)} x1={220} y1={L.y} x2={275} y2={L.y} tone="muted" width={2} />
            <Label x={247} y={L.y - 18} tone="muted" size={15} opacity={op(seg(t, 1.3, 1.8))}>arms in</Label>

            <g opacity={op(seg(t, 1.5, 2))}>
              <g transform={turn(8, R)}>
                <line x1={R.x - 30} y1={R.y} x2={R.x + 30} y2={R.y} stroke={C.ink} strokeWidth={4} />
                <circle cx={R.x - 30} cy={R.y} r={8} fill={C.accent} />
                <circle cx={R.x + 30} cy={R.y} r={8} fill={C.accent} />
              </g>
              <circle cx={R.x} cy={R.y} r={18} fill={C.soft} stroke={C.ink} strokeWidth={2} />
              <ArcArrow cx={R.x} cy={R.y} r={50} a1={200} a2={340} tone="accent" width={3} />
              <ArcArrow cx={R.x} cy={R.y} r={50} a1={20} a2={160} tone="accent" width={3} />
            </g>
            <Label x={R.x} y={200} opacity={op(seg(t, 1.8, 2.3))}>I = 0.6 kg·m²</Label>
            <Label x={R.x} y={226} tone="accent" weight={600} opacity={op(seg(t, 2, 2.5))}>ω = 8 rad/s</Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** Period vs mass on a 100 N/m spring. */
function Period() {
  const b = plotBox({ x: 70, y: 40, w: 360, h: 190, xMin: 0, xMax: 2.5, yMin: 0, yMax: 1.4 });
  const T = (m: number) => 2 * Math.PI * Math.sqrt(m / 100);
  const curve = sample(T, 0, 2.5);
  return (
    <AnimatedFigure
      height={275}
      duration={4}
      alt="Period of a 100 N/m spring against mass: a square-root curve through 0.63 s at 1 kg and 0.89 s at 2 kg, with a hollow point at 1.26 s showing what doubling would have given."
      steps={[
        { at: 0, label: "1 kg", caption: "A 1 kg mass on a 100 N/m spring: 2π times the square root of 1/100 is about 0.63 s." },
        { at: 1.7, label: "2 kg", caption: "At 2 kg on the same spring the period is about 0.89 s, which is 1.41 times longer." },
        { at: 3.1, label: "Not 2×", caption: "Doubling the mass stretches the period by 1.41, not 2: the curve bends under the square root." },
      ]}
    >
      {({ t }) => {
        const m = seg(t, 0.4, 1.2) + 1.5 * seg(t, 1.7, 2.7); // the curve is drawn out to this mass, kg
        return (
          <>
            <Axes box={b} xLabel="mass (kg)" yLabel="period T (s)" />
            {m > 0 ? <path d={b.path(partial(curve, m / 2.5))} fill="none" stroke={C.accent} strokeWidth={3} /> : null}
            <Drop x={b.px(1)} y1={b.py(T(1))} y2={b.py(0)} p={seg(t, 1.2, 1.6)} />
            <Drop x={b.px(2)} y1={b.py(2 * T(1))} y2={b.py(0)} p={seg(t, 3.2, 3.7)} />
            <Dot x={b.px(1)} y={b.py(T(1))} opacity={op(seg(t, 1.1, 1.5))} />
            <Dot x={b.px(2)} y={b.py(T(2))} opacity={op(seg(t, 2.3, 2.7))} />
            <Dot x={b.px(2)} y={b.py(2 * T(1))} tone="alarm" hollow opacity={op(seg(t, 3.1, 3.5))} />
            <Label x={b.px(1) - 10} y={b.py(T(1)) - 16} anchor="end" weight={600} opacity={op(seg(t, 1.2, 1.7))}>0.63 s</Label>
            <Label x={b.px(2) + 12} y={b.py(T(2)) + 4} anchor="start" weight={600} opacity={op(seg(t, 2.4, 2.9))}>0.89 s</Label>
            <Label x={b.px(2) - 12} y={b.py(2 * T(1))} anchor="end" tone="alarm" size={15} opacity={op(seg(t, 3.2, 3.7))}>
              not 2×: 1.26 s
            </Label>
            <Label x={b.px(1)} y={b.py(0) + 18} tone="muted" size={15}>1</Label>
            <Label x={b.px(2)} y={b.py(0) + 18} tone="muted" size={15}>2</Label>
            <Label x={90} y={62} anchor="start" tone="muted" size={15}>k = 100 N/m</Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** Float: pine half under, steel on the bottom. */
function Float() {
  const settle = (t: number) => seg(t, 0.4, 1.6); // pine: from resting on the surface to half under
  return (
    <AnimatedFigure
      height={265}
      duration={4}
      alt="A water tank with a pine block floating half under and a same-size steel block resting on the bottom."
      steps={[
        {
          at: 0,
          label: "Pine",
          caption: "Pine at 500 kg/m³ over water at 1000 is 0.50, so the block goes down until half of it is under.",
        },
        {
          at: 2,
          label: "Steel",
          caption: "Steel is several times 1000 kg/m³, so even fully under, the water it pushes aside weighs less than the block.",
        },
        {
          at: 3.4,
          label: "Result",
          caption: "Pine at 500 kg/m³ sinks only until half its volume is under; steel is still too heavy when fully under, so it sinks.",
        },
      ]}
      readouts={(t) => [{ label: "pine under", value: (0.5 * settle(t)).toFixed(2), tone: "accent" }]}
    >
      {({ t }) => {
        const sink = settle(t);
        const fall = seg(t, 2.2, 3.2); // steel: from just under the surface to the bottom
        return (
          <>
            <rect x={40} y={100} width={400} height={130} fill={C.soft} />
            <line x1={40} y1={100} x2={440} y2={100} stroke={C.accent} strokeWidth={2} />
            <Ground x={40} y={230} w={400} />
            <rect x={100} y={lerp(20, 60, sink)} width={100} height={80} fill={C.brass} fillOpacity={0.55} stroke={C.ink} strokeWidth={2} />
            <g opacity={op(seg(t, 1.5, 2))}>
              <DimV x={214} y1={100} y2={140} label="0.50 under" tone="accent" />
            </g>
            {/* buoyancy grows with the depth under, from the block's bottom face */}
            {sink > 0.05 ? <Arrow x1={150} y1={lerp(106, 190, sink)} x2={150} y2={lerp(106, 146, sink)} tone="accent" /> : null}
            <Label x={150} y={206} tone="accent" size={15} opacity={op(seg(t, 1.3, 1.8))}>buoyancy</Label>
            <Label x={150} y={40} weight={600} opacity={op(seg(t, 1.2, 1.7))}>pine 500 kg/m³</Label>
            <rect
              x={320}
              y={lerp(100, 150, fall)}
              width={100}
              height={80}
              fill={C.muted}
              fillOpacity={0.5}
              stroke={C.ink}
              strokeWidth={2}
              opacity={op(seg(t, 2, 2.4))}
            />
            <Label x={370} y={125} tone="alarm" weight={600} opacity={op(seg(t, 3, 3.5))}>steel sinks</Label>
            <Label x={440} y={80} anchor="end" tone="muted" size={15}>water 1000 kg/m³</Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/* ---------- physics-301 ---------- */

/** Depth: gauge pressure grows 9.81 kPa per metre. */
function Depth() {
  const top = 60;
  const per = 18; // px per metre
  const bot = top + 10 * per;
  const dive = (t: number) => 10 * seg(t, 0.5, 3.3); // metres below the surface
  return (
    <AnimatedFigure
      height={300}
      duration={4.2}
      alt="Cross-section of a lake 10 m deep with a pressure wedge beside it growing from 0 kPa gauge at the surface to 98 kPa gauge at 10 m."
      steps={[
        {
          at: 0,
          label: "Surface",
          caption: "At the surface the gauge reads 0 kPa, though the air above is already pressing with about 1 atm.",
        },
        { at: 1.2, label: "Per metre", caption: "Going down, each metre of fresh water adds the same 9.81 kPa to the gauge." },
        {
          at: 3.3,
          label: "10 m",
          caption: "Every metre adds the same 9.81 kPa; at 10 m the gauge reads 98 kPa, and the air adds about one more atmosphere on top.",
        },
      ]}
      readouts={(t) => {
        const h = dive(t);
        return [
          { label: "depth", value: `${h.toFixed(1)} m` },
          { label: "gauge", value: `${(9.81 * h).toFixed(0)} kPa`, tone: "accent" },
          { value: `absolute ≈ ${(1 + h / 10).toFixed(1)} atm` },
        ];
      }}
    >
      {({ t }) => {
        const h = dive(t);
        const y = top + h * per; // the diver, and the foot of the wedge
        return (
          <>
            <Label x={160} y={24} tone="muted" size={15}>air ≈ 1 atm</Label>
            <rect x={60} y={top} width={200} height={bot - top + 10} fill={C.soft} />
            <line x1={60} y1={top} x2={260} y2={top} stroke={C.accent} strokeWidth={2} />
            <Ground x={60} y={bot + 10} w={200} />
            <Label x={52} y={top} anchor="end" tone="muted" size={15}>0 m</Label>
            <Label x={52} y={bot} anchor="end" tone="muted" size={15}>10 m</Label>
            <circle cx={160} cy={top} r={6} fill={C.ink} />
            <circle cx={160} cy={y} r={6} fill={C.ink} />
            <Guide x1={166} y1={y} x2={290} y2={y} opacity={op(clamp(h / 0.5))} />
            {h > 0 ? <path d={`M290,${top} L290,${y} L${290 + 15 * h},${y} Z`} fill={C.soft} stroke={C.accent} strokeWidth={2} /> : null}
            <Label x={296} y={top - 12} anchor="start" tone="muted" size={15}>0 kPa gauge</Label>
            <Label x={384} y={118} anchor="start" tone="accent" size={15} opacity={op(seg(t, 1.3, 1.8))}>+9.81 kPa</Label>
            <Label x={384} y={138} anchor="start" tone="accent" size={15} opacity={op(seg(t, 1.3, 1.8))}>per m</Label>
            <Label x={440} y={bot + 22} anchor="end" tone="accent" weight={600} opacity={op(seg(t, 3.3, 3.8))}>98 kPa gauge</Label>
            <Label x={440} y={bot + 46} anchor="end" tone="muted" size={15} opacity={op(seg(t, 3.5, 4))}>≈ 2 atm absolute</Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** Flow: venturi, 200 kPa at rest, 150 kPa at 10 m/s. */
function Flow() {
  const cy = 210;
  const k = 0.6; // px per kPa for the gauge columns
  const wallTop = (hw: number) => cy - hw;
  const pipe = `M20,${cy - 40} L170,${cy - 40} L220,${cy - 20} L300,${cy - 20} L350,${cy - 40} L460,${cy - 40} L460,${cy + 40} L350,${cy + 40} L300,${cy + 20} L220,${cy + 20} L170,${cy + 40} L20,${cy + 40} Z`;
  const tube = (x: number, wall: number, p: number) => (
    <g>
      <rect x={x - 7} y={cy - k * p} width={14} height={wall - (cy - k * p)} fill={C.soft} />
      <line x1={x - 7} y1={40} x2={x - 7} y2={wall} stroke={C.ink} strokeWidth={2} />
      <line x1={x + 7} y1={40} x2={x + 7} y2={wall} stroke={C.ink} strokeWidth={2} />
      <line x1={x - 7} y1={cy - k * p} x2={x + 7} y2={cy - k * p} stroke={C.accent} strokeWidth={3} />
    </g>
  );
  const speed = (t: number) => lerp(0, 10, seg(t, 0.5, 2.5)); // water speed in the throat, m/s
  const drop = (v: number) => (v * v) / 2; // ½ρv² in kPa, ρ = 1000 kg/m³
  return (
    <AnimatedFigure
      height={265}
      duration={3.6}
      alt="A level venturi pipe with gauge tubes: 200 kPa in the wide part where the water barely moves, 150 kPa in the throat at 10 m/s."
      steps={[
        { at: 0, label: "Still", caption: "With the water barely moving, the pressure is 200 kPa at both gauges." },
        {
          at: 0.5,
          label: "Speed up",
          caption: "Speed the throat up to 10 m/s: half of 1000 times 10 squared is 50 kPa, and it comes out of the 200.",
        },
        { at: 2.6, label: "Budget", caption: "The throat buys 10 m/s with 50 kPa of pressure; the pipe is level, so the drop is all speed." },
      ]}
      readouts={(t) => {
        const v = speed(t);
        return [
          { label: "throat v", value: `${v.toFixed(1)} m/s`, tone: "accent" },
          { label: "½ρv²", value: `${drop(v).toFixed(0)} kPa`, tone: "accent" },
          { label: "throat P", value: `${(200 - drop(v)).toFixed(0)} kPa` },
        ];
      }}
    >
      {({ t }) => (
        <>
          <path d={pipe} fill={C.soft} fillOpacity={0.5} stroke={C.ink} strokeWidth={2} />
          {tube(100, wallTop(40), 200)}
          {tube(260, wallTop(20), 200 - drop(speed(t)))}
          <Guide x1={107} y1={cy - k * 200} x2={330} y2={cy - k * 200} opacity={op(seg(t, 0.5, 1))} />
          <g opacity={op(seg(t, 2.4, 2.9))}>
            <DimV x={330} y1={cy - k * 200} y2={cy - k * 150} label="½ρv² = 50 kPa" tone="accent" />
          </g>
          <Label x={88} y={cy - k * 200} anchor="end" weight={600}>200 kPa</Label>
          <Label x={248} y={cy - k * 150 + 20} anchor="end" weight={600} opacity={op(seg(t, 2.4, 2.9))}>150 kPa</Label>
          <Label x={100} y={cy} tone="muted" size={15}>v ≈ 0</Label>
          <Label x={260} y={cy} tone="accent" weight={600} opacity={op(seg(t, 2.2, 2.7))}>10 m/s</Label>
        </>
      )}
    </AnimatedFigure>
  );
}

/** Drag: 0.03 v² against a 2.0 N weight. */
function Drag() {
  const b = plotBox({ x: 70, y: 40, w: 350, h: 190, xMin: 0, xMax: 11, yMin: 0, yMax: 3 });
  const D = (v: number) => 0.5 * 1.2 * v * v * 0.05;
  const W = 0.2 * 9.81;
  const vt = Math.sqrt(W / 0.03);
  const curve = sample(D, 0, 10.5);
  const meet = 0.5 + (2.2 * vt) / 10.5; // when the drawn curve reaches the weight line
  return (
    <AnimatedFigure
      height={275}
      duration={3.9}
      alt="Drag on the plate rising as speed squared, meeting the 2.0 N weight line near 8 m/s; at 4 m/s drag is a quarter of the weight."
      steps={[
        { at: 0, label: "Weight", caption: "The 200 g plate weighs about 2.0 N: the force drag has to reach." },
        {
          at: 0.5,
          label: "Drag",
          caption: "Drag is ½ × 1.2 × v² × 0.05: it climbs with speed squared and catches the weight near 8 m/s.",
        },
        { at: 3, label: "Half speed", caption: "Drag climbs with v², so half the terminal speed gives only a quarter of the drag." },
      ]}
    >
      {({ t }) => {
        const p = clamp((t - 0.5) / 2.2); // share of the curve drawn, sweeping speed at a steady rate
        return (
          <>
            <Axes box={b} xLabel="speed (m/s)" yLabel="force (N)" />
            <line x1={b.px(0)} y1={b.py(W)} x2={b.px(11)} y2={b.py(W)} stroke={C.ink} strokeWidth={2} strokeDasharray="8 5" />
            <Label x={80} y={b.py(W) - 14} anchor="start">weight 2.0 N</Label>
            {p > 0 ? <path d={b.path(partial(curve, p))} fill="none" stroke={C.accent} strokeWidth={3} /> : null}
            <Label x={b.px(11)} y={b.py(1.3)} anchor="end" tone="accent" size={15} opacity={op(seg(t, 1.8, 2.3))}>drag</Label>
            <Drop x={b.px(vt)} y1={b.py(W)} y2={b.py(0)} p={seg(t, meet + 0.1, meet + 0.6)} />
            <Drop x={b.px(4)} y1={b.py(D(4))} y2={b.py(0)} p={seg(t, 3, 3.5)} />
            <Dot x={b.px(vt)} y={b.py(W)} opacity={op(seg(t, meet, meet + 0.4))} />
            <Dot x={b.px(4)} y={b.py(D(4))} opacity={op(seg(t, 3, 3.4))} />
            <Label x={b.px(vt) - 12} y={b.py(W) - 20} anchor="end" tone="accent" weight={600} opacity={op(seg(t, meet + 0.1, meet + 0.6))}>
              terminal ≈ 8 m/s
            </Label>
            <Label x={b.px(4) + 12} y={b.py(D(4)) + 14} anchor="start" size={15} opacity={op(seg(t, 3.1, 3.6))}>¼ of weight</Label>
            <Label x={b.px(4)} y={b.py(0) + 18} tone="muted" size={15}>4</Label>
            <Label x={b.px(8)} y={b.py(0) + 18} tone="muted" size={15}>8</Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** Thermal: free bar grows 0.60 mm; fixed bar takes 120 MPa. */
function Thermal() {
  const heat = (t: number) => seg(t, 0.5, 2.7); // share of the 50° rise
  return (
    <AnimatedFigure
      height={265}
      duration={3.9}
      alt="Two 1 m steel bars heated 50 degrees: the free one grows 0.60 mm with no stress; the one between fixed walls does not grow and is squeezed to 120 MPa."
      steps={[
        { at: 0, label: "Two bars", caption: "Two 1 m steel bars, one free and one between fixed walls, are both heated by 50°." },
        {
          at: 0.5,
          label: "Heat",
          caption: "The free bar grows 0.012 mm per degree; the fixed one cannot grow, so it takes 2.4 MPa per degree instead.",
        },
        { at: 2.9, label: "Result", caption: "Same bar, same 50°: you get the growth or the stress, never both." },
      ]}
      readouts={(t) => {
        const dT = 50 * heat(t);
        return [
          { label: "ΔT", value: `${dT.toFixed(0)}°` },
          { label: "free growth", value: `${(0.012 * dT).toFixed(2)} mm`, tone: "accent" },
          { label: "fixed σ", value: `${(2.4 * dT).toFixed(0)} MPa`, tone: "alarm" },
        ];
      }}
    >
      {({ t }) => {
        const h = heat(t);
        return (
          <>
            <Label x={60} y={30} anchor="start" weight={600}>free</Label>
            <rect x={60} y={50} width={300} height={26} fill={C.soft} stroke={C.ink} strokeWidth={2} />
            {h > 0.02 ? (
              <rect x={360} y={50} width={30 * h} height={26} fill="none" stroke={C.accent} strokeWidth={2} strokeDasharray="5 4" />
            ) : null}
            <g opacity={op(seg(t, 2.6, 3.1))}>
              <DimH x1={360} x2={390} y={30} label="+0.60 mm" tone="accent" />
            </g>
            <Label x={404} y={64} anchor="start" opacity={op(seg(t, 1, 1.5))}>σ = 0</Label>

            <Label x={60} y={122} anchor="start" weight={600}>ends fixed</Label>
            <WallV x={58} y={140} h={60} side="left" />
            <WallV x={362} y={140} h={60} side="right" />
            <rect x={60} y={157} width={300} height={26} fill={C.soft} stroke={C.ink} strokeWidth={2} />
            <GrowArrow p={h} x1={64} y1={170} x2={112} y2={170} tone="alarm" />
            <GrowArrow p={h} x1={356} y1={170} x2={308} y2={170} tone="alarm" />
            <Label x={210} y={171} tone="alarm" weight={600} opacity={op(seg(t, 2.6, 3.1))}>σ = 120 MPa</Label>
            <Label x={384} y={170} anchor="start" opacity={op(seg(t, 1, 1.5))}>growth 0</Label>
            <Label x={240} y={240} tone="muted" size={15}>1 m steel bar, heated 50°</Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** Pipe: 0.010 m³/s through 0.010 m² then 0.005 m². */
function Pipe() {
  const cy = 120;
  const duct = `M20,${cy - 50} L200,${cy - 50} L250,${cy - 25} L460,${cy - 25} L460,${cy + 25} L250,${cy + 25} L200,${cy + 50} L20,${cy + 50} Z`;
  /** Half-height of the duct at x: 50 in the wide part, 25 in the neck, a straight taper between. */
  const half = (x: number) => (x <= 200 ? 50 : x >= 250 ? 25 : 50 - (x - 200) / 2);
  /**
   * A slice of air that sets off from x = 85 at 0.6 s, in real time at 50 px per m, so its speed is
   * v = Q/A = 2500/half px/s: 2.3 s to the taper, 0.75 s through it, then 1.55 s to x = 405.
   */
  const slice = (t: number) => {
    const s = Math.max(0, t - 0.6);
    if (s <= 2.3) return 85 + 50 * s;
    if (s <= 3.05) return 300 - 100 * Math.sqrt(1 - (s - 2.3));
    return Math.min(405, 250 + 100 * (s - 3.05));
  };
  return (
    <AnimatedFigure
      height={230}
      duration={5.7}
      alt="A duct that necks from 0.010 m² to 0.005 m², with an arrow for 1 m/s in the wide part and an arrow twice as long for 2 m/s in the neck."
      steps={[
        {
          at: 0,
          label: "Wide",
          caption: "The duct must pass 0.010 m³ of air each second: through 0.010 m² that takes 1 m/s.",
        },
        { at: 2.9, label: "Neck", caption: "Where the duct necks down to 0.005 m², the same air has to speed up to 2 m/s." },
        { at: 5.2, label: "Same Q", caption: "Half the area, twice the speed: the same 0.010 m³ has to get through each second." },
      ]}
      readouts={(t) => {
        const h = half(slice(t));
        const A = (0.01 * h) / 50;
        const v = 50 / h;
        return [
          { label: "A", value: `${A.toFixed(3)} m²` },
          { label: "v", value: `${v.toFixed(2)} m/s`, tone: "accent" },
          { label: "Q = A·v", value: `${(A * v).toFixed(3)} m³/s` },
        ];
      }}
    >
      {({ t }) => {
        const x = slice(t);
        const show = seg(t, 0.2, 0.6) * (1 - seg(t, 5.2, 5.6));
        return (
          <>
            <path d={duct} fill={C.soft} fillOpacity={0.6} stroke={C.ink} strokeWidth={2} />
            {/* the slice of air crossing the duct; gone by the final frame */}
            {show > 0 ? (
              <line
                x1={x}
                y1={cy - half(x) + 3}
                x2={x}
                y2={cy + half(x) - 3}
                stroke={C.accent}
                strokeWidth={2.5}
                strokeLinecap="round"
                opacity={show}
              />
            ) : null}
            <Label x={110} y={cy - 66}>0.010 m²</Label>
            <Label x={355} y={cy - 42} opacity={op(seg(t, 3.3, 3.8))}>0.005 m²</Label>
            <GrowArrow p={clamp((x - 85) / 50)} x1={85} y1={cy - 8} x2={135} y2={cy - 8} tone="accent" />
            <Label x={110} y={cy + 20} tone="accent" weight={600} opacity={op(seg(t, 1.5, 2))}>1 m/s</Label>
            <GrowArrow p={clamp((x - 305) / 100)} x1={305} y1={cy} x2={405} y2={cy} tone="accent" />
            <Label x={355} y={cy + 42} tone="accent" weight={600} opacity={op(seg(t, 5.1, 5.6))}>2 m/s</Label>
            <Label x={240} y={206} tone="muted" size={15}>Q = 0.010 m³/s in both</Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/* ---------- physics-401 ---------- */

/** Rod speed: steel vs polyethylene pulse after the same time. */
function RodSpeed() {
  const x0 = 60;
  const len = 380;
  const steel = x0 + 0.9 * len;
  const pe = x0 + 0.9 * len * (1450 / 5060);
  const rod = (y: number, front: number, tone: Tone, tap: number, pulse: number) => (
    <g>
      <rect x={x0} y={y - 8} width={len} height={16} rx={3} fill={C.surface} stroke={C.ink} strokeWidth={2} />
      <rect x={x0} y={y - 8} width={front - x0} height={16} rx={3} fill={C.soft} />
      <g opacity={op(pulse)}>
        <rect x={front - 5} y={y - 12} width={10} height={24} rx={3} fill={C[tone]} />
        <Arrow x1={front + 8} y1={y} x2={front + 34} y2={y} tone={tone} width={2.5} />
      </g>
      <GrowArrow p={tap} x1={x0 - 40} y1={y} x2={x0 - 4} y2={y} tone="muted" width={2} />
    </g>
  );
  return (
    <AnimatedFigure
      height={225}
      duration={3.7}
      alt="A steel rod and a polyethylene rod tapped at the left end; at the same moment the pulse is near the far end of the steel rod but under a third of the way along the polyethylene."
      steps={[
        { at: 0, label: "Tap", caption: "Tap the left end of a steel rod and of a polyethylene rod at the same moment." },
        {
          at: 0.7,
          label: "Run",
          caption: "Each pulse runs at √(E/ρ): about 5060 m/s in steel and 1450 m/s in polyethylene (slowed down here).",
        },
        {
          at: 3.1,
          label: "Same moment",
          caption: "Steel is eight times denser but a hundred times stiffer, so its pulse runs about 3.5 times as far in the same time.",
        },
      ]}
    >
      {({ t }) => {
        const tap = seg(t, 0.3, 0.7);
        const pulse = seg(t, 0.5, 0.9);
        const run = clamp((t - 0.7) / 2.4); // both pulses at constant speed, slowed to the same clock
        return (
          <>
            <Label x={x0} y={36} anchor="start" weight={600}>steel</Label>
            <Label x={x0 + len} y={36} anchor="end" tone="accent" weight={600} opacity={op(seg(t, 0.9, 1.4))}>≈ 5060 m/s</Label>
            {rod(70, lerp(x0, steel, run), "accent", tap, pulse)}
            <Label x={x0} y={126} anchor="start" weight={600}>polyethylene</Label>
            <Label x={x0 + len} y={126} anchor="end" tone="accent" weight={600} opacity={op(seg(t, 1.1, 1.6))}>≈ 1450 m/s</Label>
            {rod(160, lerp(x0, pe, run), "accent", tap, pulse)}
            <Label x={x0 - 22} y={96} tone="muted" size={15} opacity={op(tap)}>tap</Label>
            <Label x={250} y={206} tone="muted" size={15} opacity={op(seg(t, 3.1, 3.6))}>same moment after the tap</Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** Mode shape: pinned bar, 0.60 m at 128 Hz, 1.20 m at 32 Hz. */
function ModeShape() {
  const shape = sample((u) => Math.sin(Math.PI * u), 0, 1, 60);
  /** A pinned bar; its solid curve is the first mode scaled by c (1 = the drawn, downward swing). */
  const beam = (x: number, y: number, w: number, amp: number, c: number) => {
    const down = shape.map(([u, s], i) => `${i ? "L" : "M"}${(x + u * w).toFixed(1)},${(y + amp * c * s).toFixed(1)}`).join(" ");
    const up = shape.map(([u, s], i) => `${i ? "L" : "M"}${(x + u * w).toFixed(1)},${(y - amp * s).toFixed(1)}`).join(" ");
    return (
      <g>
        <line x1={x} y1={y} x2={x + w} y2={y} stroke={C.muted} strokeWidth={1.5} />
        <path d={up} fill="none" stroke={C.accent} strokeWidth={1.5} strokeDasharray="5 4" />
        <path d={down} fill="none" stroke={C.accent} strokeWidth={3.5} />
        <Pin x={x} y={y} />
        <Pin x={x + w} y={y} />
      </g>
    );
  };
  return (
    <AnimatedFigure
      height={260}
      duration={4.2}
      alt="Two pinned steel bars ringing in their first mode: a 0.60 m span at 128 Hz and a 1.20 m span at 32 Hz."
      steps={[
        {
          at: 0,
          label: "0.60 m",
          caption: "Pinned at both ends, the bar on a 0.60 m span rings in its first mode at about 128 Hz (slowed 64× here).",
        },
        { at: 1.3, label: "1.20 m", caption: "Double the span to 1.20 m and the first mode drops to about 32 Hz, a quarter." },
        { at: 2.7, label: "Squared", caption: "Double the span and the note falls by four, because span is squared." },
      ]}
    >
      {({ t, raw, duration }) => {
        // 128 Hz and 32 Hz slowed 64× to 2 Hz and 0.5 Hz, phased so the final frame is the drawn swing.
        // With the end hold a loop is 6 s: a whole number of cycles for both, so the ringing never jumps.
        const a = raw - duration;
        return (
          <>
            {beam(60, 60, 180, 20, Math.cos(2 * Math.PI * 2 * a))}
            <DimH x1={60} x2={240} y={112} label="0.60 m" />
            <Label x={270} y={60} anchor="start" tone="accent" size={20} weight={600} opacity={op(seg(t, 0.3, 0.8))}>128 Hz</Label>
            <g opacity={op(seg(t, 1.3, 1.8))}>
              {beam(60, 172, 360, 26, Math.cos(2 * Math.PI * 0.5 * a))}
              <DimH x1={60} x2={420} y={236} label="1.20 m" />
            </g>
            <Label x={420} y={134} anchor="end" tone="accent" size={20} weight={600} opacity={op(seg(t, 1.8, 2.3))}>32 Hz</Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** Impact: peak force vs drop height, 2 kg on 1 MN/m. */
function Impact() {
  const b = plotBox({ x: 80, y: 40, w: 340, h: 190, xMin: 0, xMax: 0.7, yMin: 0, yMax: 5 });
  const Fk = (h: number) => Math.sqrt(2 * 2 * 9.81 * h * 1e6) / 1000;
  const F5 = Fk(0.5);
  const curve = sample(Fk, 0, 0.66);
  return (
    <AnimatedFigure
      height={275}
      duration={4.1}
      alt="Peak force against drop height for 2 kg on a 1 MN/m spring: 1.98 kN at 0.10 m and 4.43 kN at 0.50 m on a square-root curve, with the 20 N weight a line along the bottom."
      steps={[
        { at: 0, label: "Weight", caption: "Two kilograms weigh about 20 N: on this scale, a line along the bottom." },
        {
          at: 0.5,
          label: "Peak force",
          caption: "Dropped onto a 1 MN/m spring, the 2 kg peaks at about 4.43 kN from 0.50 m and 1.98 kN from 0.10 m.",
        },
        { at: 2.9, label: "Not 5×", caption: "Five times the drop is only 2.24 times the peak, and both dwarf the 20 N static weight." },
      ]}
    >
      {({ t }) => {
        const p = clamp((t - 0.5) / 1.2); // share of the curve drawn, sweeping the drop at a steady rate
        const prop = seg(t, 2.9, 3.5); // the straight line grows out from the origin
        return (
          <>
            <Axes box={b} xLabel="drop (m)" yLabel="peak force (kN)" />
            <line x1={b.px(0)} y1={b.py(0.02)} x2={b.px(0.7)} y2={b.py(0.02)} stroke={C.ink} strokeWidth={2.5} />
            <Label x={b.px(0.7)} y={b.py(0) - 14} anchor="end" size={15}>weight 20 N</Label>
            {prop > 0.02 ? (
              <line
                x1={b.px(0)}
                y1={b.py(0)}
                x2={lerp(b.px(0), b.px(0.5), prop)}
                y2={lerp(b.py(0), b.py(F5), prop)}
                stroke={C.alarm}
                strokeWidth={1.5}
                strokeDasharray="6 5"
              />
            ) : null}
            <Label x={b.px(0.5) - 8} y={b.py(1.3)} anchor="end" tone="alarm" size={15} opacity={op(seg(t, 3.3, 3.8))}>
              if force ∝ height
            </Label>
            {p > 0 ? <path d={b.path(partial(curve, p))} fill="none" stroke={C.accent} strokeWidth={3} /> : null}
            <Drop x={b.px(0.1)} y1={b.py(Fk(0.1))} y2={b.py(0)} p={seg(t, 2.3, 2.8)} />
            <Drop x={b.px(0.5)} y1={b.py(F5)} y2={b.py(0)} p={seg(t, 1.8, 2.3)} />
            <Dot x={b.px(0.1)} y={b.py(Fk(0.1))} opacity={op(seg(t, 2.2, 2.6))} />
            <Dot x={b.px(0.5)} y={b.py(F5)} opacity={op(seg(t, 1.7, 2.1))} />
            <Label x={b.px(0.1) - 8} y={b.py(Fk(0.1)) - 42} anchor="start" weight={600} opacity={op(seg(t, 2.3, 2.8))}>
              1.98 kN
            </Label>
            <Label x={b.px(0.5) - 12} y={b.py(F5) - 18} anchor="end" weight={600} opacity={op(seg(t, 1.8, 2.3))}>4.43 kN</Label>
            <Label x={b.px(0.1)} y={b.py(0) + 18} tone="muted" size={15}>0.10</Label>
            <Label x={b.px(0.5)} y={b.py(0) + 18} tone="muted" size={15}>0.50</Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** Resonance: magnification vs frequency ratio, ζ = 0.05. */
function Resonance() {
  const b = plotBox({ x: 70, y: 40, w: 350, h: 190, xMin: 0, xMax: 2.2, yMin: 0, yMax: 11 });
  const z = 0.05;
  const M = (r: number) => 1 / Math.sqrt((1 - r * r) ** 2 + (2 * z * r) ** 2);
  const curve = sample(M, 0, 2.2, 440);
  const match = 0.5 + 2 / 2.2; // when the drawn curve reaches a ratio of 1
  return (
    <AnimatedFigure
      height={275}
      duration={3.5}
      alt="Motion divided by steady sag against drive-to-natural frequency ratio for damping 0.05: a sharp peak of about 10 at a ratio of 1, falling to 0.79 at 1.5, below the steady-sag line at 1."
      steps={[
        { at: 0, label: "Steady sag", caption: "The dashed line is the sag the same force would cause if it were steady." },
        {
          at: match,
          label: "Match",
          caption: "Drive the bracket at its natural frequency and, with damping 0.05, the motion is about 10 times that sag.",
        },
        {
          at: 2.5,
          label: "Off match",
          caption:
            "On the match only damping caps the motion at about 10 times the steady sag; at 1.5 times the natural frequency it drops below the sag.",
        },
      ]}
    >
      {({ t }) => {
        const p = clamp((t - 0.5) / 2); // share of the curve drawn, sweeping the drive at a steady rate
        const off = op(seg(t, 2.6, 3.1));
        return (
          <>
            <Axes box={b} xLabel="drive ÷ natural" yLabel="motion ÷ steady sag" />
            <line x1={b.px(0)} y1={b.py(1)} x2={b.px(2.2)} y2={b.py(1)} stroke={C.muted} strokeWidth={1.5} strokeDasharray="6 5" />
            <Label x={b.px(2.2)} y={b.py(1) - 14} anchor="end" tone="muted" size={15}>steady sag</Label>
            {p > 0 ? <path d={b.path(partial(curve, p))} fill="none" stroke={C.accent} strokeWidth={3} /> : null}
            <Dot x={b.px(1)} y={b.py(M(1))} opacity={op(seg(t, match, match + 0.4))} />
            <Dot x={b.px(1.5)} y={b.py(M(1.5))} opacity={op(seg(t, 2.5, 2.9))} />
            <Label x={b.px(1) + 14} y={b.py(M(1))} anchor="start" weight={600} opacity={op(seg(t, match + 0.1, match + 0.6))}>
              ≈ 10× on the match
            </Label>
            <Label x={b.px(1.5)} y={b.py(M(1.5)) - 50} weight={600} opacity={off}>0.79 at 1.5</Label>
            <Guide x1={b.px(1.5)} y1={b.py(M(1.5)) - 38} x2={b.px(1.5)} y2={b.py(M(1.5)) - 8} opacity={off} />
            <Label x={b.px(2.2)} y={b.py(6)} anchor="end" tone="muted" size={15}>ζ = 0.05</Label>
            <Label x={b.px(1)} y={b.py(0) + 18} tone="muted" size={15}>1</Label>
            <Label x={b.px(1.5)} y={b.py(0) + 18} tone="muted" size={15}>1.5</Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** Turn: 10 m/s on a 2 m and a 1 m boom. */
function Turn() {
  const cy = 150;
  /**
   * `turn` rotates the boom, its arrows and the camera about the pivot; `v` and `a` grow the speed
   * and inward arrows, `aText` shows the acceleration label. The turning parts sweep across the
   * labels, so while they turn, knocked-out copies of the labels are drawn on top.
   */
  const boom = (
    cx: number,
    r: number,
    acc: number,
    rLabel: string,
    aLabel: string,
    turn: string | undefined,
    v: number,
    a: number,
    aText: number,
  ) => {
    const mx = cx + r;
    return (
      <g>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.muted} strokeWidth={1.5} strokeDasharray="5 5" />
        <line x1={cx} y1={cy} x2={mx} y2={cy} stroke={C.muted} strokeWidth={2} transform={turn} />
        <circle cx={cx} cy={cy} r={5} fill={C.ink} />
        <Label x={cx + r / 2 - 4} y={cy + 20} size={15}>{rLabel}</Label>
        <g transform={turn}>
          <GrowArrow p={v} x1={mx} y1={cy - 10} x2={mx} y2={cy - 60} tone="muted" width={2} />
        </g>
        <Label x={mx + 6} y={cy - 76} anchor="start" tone="muted" size={15} opacity={op(v)}>10 m/s</Label>
        <g transform={turn}>
          <GrowArrow p={a} x1={mx - 10} y1={cy} x2={mx - 10 - acc} y2={cy} tone="accent" width={2.5} />
          <rect x={mx - 9} y={cy - 9} width={18} height={18} rx={3} fill={C.soft} stroke={C.ink} strokeWidth={2} />
        </g>
        <Label x={cx} y={cy + r + 26} tone="accent" weight={600} opacity={op(aText)}>{aLabel}</Label>
        {turn ? (
          <>
            <Halo x={cx + r / 2 - 4} y={cy + 20} size={15}>{rLabel}</Halo>
            <Label x={cx + r / 2 - 4} y={cy + 20} size={15}>{rLabel}</Label>
            <Halo x={cx} y={cy + r + 26} weight={600} opacity={op(aText)}>{aLabel}</Halo>
            <Label x={cx} y={cy + r + 26} tone="accent" weight={600} opacity={op(aText)}>{aLabel}</Label>
          </>
        ) : null}
      </g>
    );
  };
  return (
    <AnimatedFigure
      height={295}
      // With the end hold a loop lasts 2π s: whole turns for both booms, so they come round without a jump.
      duration={2 * Math.PI - HOLD}
      alt="Two booms seen from above carrying a camera at a steady 10 m/s: on the 2 m boom the inward acceleration is 50 m/s², on the 1 m boom it is 100 m/s², drawn twice as long and pointing at the pivot."
      steps={[
        {
          at: 0,
          label: "Steady speed",
          caption: "A camera on a 2 m boom and one on a 1 m boom both swing at a steady 10 m/s (slowed 5× here).",
        },
        {
          at: 1.2,
          label: "2 m boom",
          caption: "The speed never changes but the direction does: 10² / 2 = 50 m/s², pointed at the pivot.",
        },
        { at: 2.4, label: "1 m boom", caption: "Same 10 m/s, half the radius, twice the inward pull: steady speed is not zero acceleration." },
      ]}
    >
      {({ t, raw, duration }) => {
        // 10 m/s slowed 5×: the 2 m boom turns at 1 rad/s and the 1 m boom at 2 rad/s, counterclockwise,
        // phased so the final frame is the drawn pose.
        const a = raw - duration;
        const turn = (w: number, cx: number) => (a ? `rotate(${((-w * a * 180) / Math.PI).toFixed(1)} ${cx} ${cy})` : undefined);
        const v = seg(t, 0.4, 0.9);
        return (
          <>
            {boom(120, 110, 25, "2 m", "50 m/s² inward", turn(1, 120), v, seg(t, 1.2, 1.8), seg(t, 1.6, 2.1))}
            {boom(365, 55, 50, "1 m", "100 m/s² inward", turn(2, 365), v, seg(t, 2.4, 3), seg(t, 2.8, 3.3))}
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/* ---------- materials-201 ---------- */

/** Creep: time to 1% strain, base vs 2× stress vs +50 K. */
function CreepRate() {
  const base = 220;
  const full = 150;
  /** `show` fades the case in, `drop` shrinks its bar from today's full life to its own, `tag` shows the ratio. */
  const bar = (cx: number, frac: number, top: string, l1: string, l2: string, hot: 0 | 1 | 2, show = 1, drop = 1, tag = 1) => {
    const h = lerp(full, full * frac, drop);
    return (
      <g opacity={op(show)}>
        <rect x={cx - 35} y={base - h} width={70} height={h} fill={hot ? C.alarm : C.accent} fillOpacity={hot ? 0.8 : 0.8} />
        <Label x={cx} y={base - h - 16} weight={600} tone={hot ? "alarm" : "accent"} opacity={op(tag)}>{top}</Label>
        <Label x={cx} y={base + 20} size={15} tone={hot === 1 ? "alarm" : "ink"}>{l1}</Label>
        <Label x={cx} y={base + 42} size={15} tone={hot === 2 ? "alarm" : "ink"}>{l2}</Label>
      </g>
    );
  };
  return (
    <AnimatedFigure
      height={275}
      duration={4.4}
      alt="Bar chart of time to 1% strain for a hanger: the 800 K, 100 MPa case is full height, doubling stress to 200 MPa cuts it to one thirty-second, and raising temperature to 850 K cuts it to a tenth."
      steps={[
        { at: 0, label: "Today", caption: "A hanger at 800 K and 100 MPa takes a time t to creep to 1% strain." },
        {
          at: 0.5,
          label: "Stress ×2",
          caption: "Double the stress to 200 MPa: stress is raised to a power, and the time falls by about 32.",
        },
        {
          at: 2.4,
          label: "+50 K",
          caption: "Instead raise the temperature 50 K: it sits in an exponential, and the time falls to about a tenth.",
        },
        { at: 3.8, label: "Life", caption: "Double the stress and the life falls by 32; add 50 K and it falls to a tenth." },
      ]}
    >
      {({ t }) => (
        <>
          <Label x={30} y={28} anchor="start" tone="muted" size={15}>time to 1% strain</Label>
          <line x1={40} y1={base} x2={450} y2={base} stroke={C.ink} strokeWidth={2} />
          {bar(110, 1, "t", "100 MPa", "800 K", 0)}
          {bar(245, 1 / 32, "t ÷ 32", "200 MPa", "800 K", 1, seg(t, 0.5, 1), seg(t, 1.1, 1.9), seg(t, 1.8, 2.3))}
          {bar(380, 1 / 10, "t ÷ 10", "100 MPa", "850 K", 2, seg(t, 2.4, 2.9), seg(t, 3, 3.8), seg(t, 3.7, 4.2))}
        </>
      )}
    </AnimatedFigure>
  );
}

/** Hardness: Vickers dent → 3 × HV estimate. */
function Hardness() {
  const block = "M40,120 L127,120 L145,134 L163,120 L250,120 L250,220 L40,220 Z";
  return (
    <AnimatedFigure
      height={250}
      duration={4}
      alt="A pyramid indenter pressed into a steel block leaving a 200 HV dent, with an arrow to the estimate UTS ≈ 3 × 200 = 600 MPa and a note that elongation is not measured."
      steps={[
        { at: 0, label: "Dent", caption: "Press a sharp point into the steel and measure the dent: this one reads 200 HV." },
        {
          at: 1.8,
          label: "Estimate",
          caption: "For many steels the ultimate strength in MPa is roughly three times the Vickers number: 3 × 200 = 600 MPa.",
        },
        {
          at: 3.1,
          label: "Elongation",
          caption: "The dent gives a strength guess by the factor of 3; it tells you nothing about how far the steel stretches.",
        },
      ]}
    >
      {({ t }) => {
        const q = seg(t, 0.4, 1.3); // how far the point has pressed in: from touching the surface to the full dent
        const dent =
          q < 1
            ? `M40,120 L${(145 - 18 * q).toFixed(1)},120 L145,${(120 + 14 * q).toFixed(1)} L${(145 + 18 * q).toFixed(1)},120 L250,120 L250,220 L40,220 Z`
            : block;
        return (
          <>
            <g transform={q < 1 ? `translate(0,${(14 * q - 14).toFixed(1)})` : undefined}>
              <Arrow x1={145} y1={16} x2={145} y2={50} tone="ink" />
              <path d="M115,58 L175,58 L145,134 Z" fill={C.muted} fillOpacity={0.4} stroke={C.ink} strokeWidth={2} />
            </g>
            <path d={dent} fill={C.soft} stroke={C.ink} strokeWidth={2} />
            <Label x={145} y={176} weight={600} opacity={op(seg(t, 1.2, 1.7))}>200 HV</Label>
            <GrowArrow p={seg(t, 1.8, 2.3)} x1={262} y1={120} x2={292} y2={120} tone="accent" width={2.5} />
            <Label x={300} y={108} anchor="start" opacity={op(seg(t, 2, 2.5))}>UTS ≈ 3 × 200</Label>
            <Label x={300} y={134} anchor="start" tone="accent" size={20} weight={600} opacity={op(seg(t, 2.4, 2.9))}>≈ 600 MPa</Label>
            <Label x={300} y={186} anchor="start" tone="muted" size={15} opacity={op(seg(t, 3.1, 3.6))}>elongation:</Label>
            <Label x={300} y={206} anchor="start" tone="alarm" size={15} opacity={op(seg(t, 3.3, 3.8))}>not measured</Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** Leak before break: critical crack vs 8 mm wall. */
function Leak() {
  const x0 = 40;
  const s = 400 / 30; // px per mm
  const X = (mm: number) => x0 + mm * s;
  const crack: Array<[number, number]> = [
    [X(0), 118],
    [X(0) + 10, 114],
    [X(0) + 18, 120],
    [X(0) + 28, 116],
  ];
  return (
    <AnimatedFigure
      height={255}
      duration={4}
      alt="A scale from 0 to 30 mm with the 8 mm pipe wall shaded; the critical crack is 28 mm at toughness 50, beyond the wall, and 7.0 mm at toughness 25, inside the wall."
      steps={[
        { at: 0, label: "Wall", caption: "A pipe wall 8 mm thick, at 150 MPa, with an edge crack growing in from one face." },
        {
          at: 1.2,
          label: "K 50",
          caption: "At toughness 50 the critical crack is about 28 mm, longer than the 8 mm wall, so the wall opens through and weeps.",
        },
        {
          at: 2.4,
          label: "K 25",
          caption: "Drop the toughness to 25 and the critical crack falls to about 7.0 mm, inside the wall, so it can burst first.",
        },
        {
          at: 3.4,
          label: "Which first",
          caption: "If the critical crack is longer than the wall, the crack gets through and weeps first; if it fits inside, the wall can burst.",
        },
      ]}
    >
      {({ t }) => {
        const k50 = seg(t, 1.2, 1.7); // critical lengths rise off the scale
        const k25 = seg(t, 2.4, 2.9);
        return (
          <>
            <rect x={X(0)} y={70} width={X(8) - X(0)} height={70} fill={C.soft} stroke={C.ink} strokeWidth={2} />
            <path
              d={partial(crack, seg(t, 0.4, 1))
                .map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`)
                .join(" ")}
              fill="none"
              stroke={C.ink}
              strokeWidth={2.5}
            />
            <Label x={(X(0) + X(8)) / 2} y={92} size={15}>wall</Label>
            {k25 > 0.02 ? <line x1={X(7)} y1={lerp(150, 58, k25)} x2={X(7)} y2={150} stroke={C.alarm} strokeWidth={3} /> : null}
            <Label x={X(7) - 4} y={44} anchor="end" tone="alarm" weight={600} opacity={op(seg(t, 2.7, 3.2))}>7.0 mm</Label>
            {k50 > 0.02 ? <line x1={X(28)} y1={lerp(150, 58, k50)} x2={X(28)} y2={150} stroke={C.accent} strokeWidth={3} /> : null}
            <Label x={X(28)} y={44} tone="accent" weight={600} opacity={op(seg(t, 1.5, 2))}>28 mm</Label>
            <line x1={X(0)} y1={160} x2={X(30)} y2={160} stroke={C.ink} strokeWidth={1.5} />
            {[0, 8, 20, 30].map((v) => (
              <g key={v}>
                <line x1={X(v)} y1={154} x2={X(v)} y2={166} stroke={C.ink} strokeWidth={1.5} />
                <Label x={X(v)} y={180} tone="muted" size={15}>{v === 30 ? "30 mm" : String(v)}</Label>
              </g>
            ))}
            <Label x={x0} y={212} anchor="start" tone="accent" size={15} opacity={op(seg(t, 1.7, 2.2))}>
              K 50 → 28 mm, past the wall: leaks first
            </Label>
            <Label x={x0} y={236} anchor="start" tone="alarm" size={15} opacity={op(seg(t, 2.9, 3.4))}>
              K 25 → 7.0 mm, inside the wall: can burst
            </Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** Thinning: 20 × 6 link to 20 × 4 after 20 years at 8 kN. */
function Thinning() {
  const s = 8;
  const years = (t: number) => 20 * seg(t, 0.6, 2.8);
  return (
    <AnimatedFigure
      height={250}
      duration={3.9}
      alt="Cross-sections of a steel link: today 20 by 6 mm, 120 mm², 67 MPa; after 20 years 20 by 4 mm, 80 mm², 100 MPa; the same 8 kN in both."
      steps={[
        { at: 0, label: "Today", caption: "Today the 20 × 6 mm link has 120 mm² and carries 8 kN at about 67 MPa." },
        {
          at: 0.6,
          label: "20 years",
          caption: "Losing 0.10 mm a year, the link is 2 mm thinner after 20 years, and the load cell still reads 8 kN.",
        },
        {
          at: 2.9,
          label: "Stress",
          caption: "The load never changed; 2 mm of corrosion took a third of the area, so the stress rose from 67 to 100 MPa.",
        },
      ]}
      readouts={(t) => {
        const left = 6 - 0.1 * years(t); // mm of thickness left
        return [
          { label: "years", value: years(t).toFixed(0) },
          { label: "thickness", value: `${left.toFixed(1)} mm` },
          { label: "area", value: `${(20 * left).toFixed(0)} mm²` },
          { label: "σ", value: `${(8000 / (20 * left)).toFixed(0)} MPa`, tone: "alarm" },
        ];
      }}
    >
      {({ t }) => {
        const q = seg(t, 0.6, 2.8); // share of the 2 mm lost, 1 mm off each face
        const after = op(seg(t, 2.7, 3.2));
        return (
          <>
            <Label x={130} y={22} weight={600}>today</Label>
            <rect x={50} y={80} width={20 * s} height={6 * s} fill={C.soft} stroke={C.ink} strokeWidth={2} />
            <Label x={130} y={104} size={15}>6 mm</Label>
            <Label x={130} y={150}>120 mm²</Label>
            <Label x={130} y={176} tone="accent" weight={600}>67 MPa</Label>

            <Label x={350} y={22} weight={600} opacity={op(seg(t, 0.6, 1.1))}>after 20 years</Label>
            <rect x={270} y={80} width={20 * s} height={6 * s} fill="none" stroke={C.muted} strokeWidth={1.5} strokeDasharray="5 4" />
            <rect x={270} y={lerp(80, 88, q)} width={20 * s} height={lerp(6 * s, 4 * s, q)} fill={C.soft} stroke={C.ink} strokeWidth={2} />
            <Label x={350} y={104} size={15} opacity={after}>4 mm</Label>
            <Label x={350} y={150} opacity={after}>80 mm²</Label>
            <Label x={350} y={176} tone="alarm" weight={600} opacity={op(seg(t, 2.9, 3.4))}>100 MPa</Label>
            <DimH x1={50} x2={210} y={64} label="20 mm" />
            <DimH x1={270} x2={430} y={64} label="20 mm" />
            <Label x={240} y={224} tone="muted" size={15}>same 8 kN on both</Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** Diffusion: x = √(Dt), D = 0.25 mm²/h. */
function Diffuse() {
  const b = plotBox({ x: 70, y: 40, w: 350, h: 190, xMin: 0, xMax: 20, yMin: 0, yMax: 2.4 });
  const x = (t: number) => Math.sqrt(0.25 * t);
  const curve = sample(x, 0, 19.5);
  /** When each marked hour's point, guide and label come in, s. */
  const mark: Record<number, number> = { 4: 1, 8: 2.3, 16: 3.4 };
  return (
    <AnimatedFigure
      height={275}
      duration={4.3}
      alt="Case depth against time for D = 0.25 mm²/h: 1 mm at 4 hours, only 1.4 mm at 8 hours, and 2 mm at 16 hours on a square-root curve."
      steps={[
        { at: 0, label: "4 hours", caption: "With D = 0.25 mm²/h, the carburizing front reaches 1 mm in 4 hours." },
        { at: 1.8, label: "8 hours", caption: "Doubling the time to 8 hours only gets the front to about 1.4 mm." },
        {
          at: 3.4,
          label: "16 hours",
          caption: "Twice the depth costs four times the hours: 16 h for 2 mm, while 8 h only reaches about 1.4 mm.",
        },
      ]}
    >
      {({ t }) => {
        const hours = 4 * seg(t, 0.4, 1) + 4 * seg(t, 1.8, 2.3) + 11.5 * seg(t, 2.9, 3.7); // the front has run this long
        return (
          <>
            <Axes box={b} xLabel="time (h)" yLabel="depth (mm)" />
            {hours > 0 ? <path d={b.path(partial(curve, hours / 19.5))} fill="none" stroke={C.accent} strokeWidth={3} /> : null}
            {[4, 8, 16].map((h) => (
              <g key={h}>
                <Drop x={b.px(h)} y1={b.py(x(h))} y2={b.py(0)} p={seg(t, mark[h], mark[h] + 0.5)} />
                <Label x={b.px(h)} y={b.py(0) + 18} tone="muted" size={15}>{String(h)}</Label>
              </g>
            ))}
            <Dot x={b.px(4)} y={b.py(1)} opacity={op(seg(t, 1, 1.4))} />
            <Dot x={b.px(8)} y={b.py(x(8))} tone="alarm" hollow opacity={op(seg(t, 2.3, 2.7))} />
            <Dot x={b.px(16)} y={b.py(2)} opacity={op(seg(t, 3.4, 3.8))} />
            <Label x={b.px(4) - 12} y={b.py(1) - 6} anchor="end" weight={600} opacity={op(seg(t, 1.1, 1.6))}>1 mm</Label>
            <Label x={b.px(8) - 8} y={b.py(x(8)) - 22} anchor="end" tone="alarm" weight={600} opacity={op(seg(t, 2.4, 2.9))}>
              1.4 mm
            </Label>
            <Label x={b.px(16) - 12} y={b.py(2) - 18} anchor="end" weight={600} opacity={op(seg(t, 3.5, 4))}>2 mm</Label>
            <Label x={90} y={62} anchor="start" tone="muted" size={15}>D = 0.25 mm²/h</Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** Fracture face: fatigue thumbnail with beach marks, final overload patch. */
function Face() {
  const cx = 170;
  const cy = 145;
  const R = 110;
  const ox = cx;
  const oy = cy - R;
  const fatigueR = 150; // reaches about two thirds of the diameter
  const dots: ReactNode[] = [];
  for (let y = cy - R; y <= cy + R; y += 9) {
    for (let x = cx - R; x <= cx + R; x += 9) {
      const jx = x + ((y / 9) % 2 ? 4.5 : 0);
      if ((jx - cx) ** 2 + (y - cy) ** 2 < (R - 3) ** 2 && (jx - ox) ** 2 + (y - oy) ** 2 > fatigueR ** 2)
        dots.push(<circle key={`${jx}-${y}`} cx={jx} cy={y} r={1.6} fill={C.muted} />);
    }
  }
  return (
    <AnimatedFigure
      height={290}
      duration={4.3}
      alt="End view of a broken shaft: a smooth thumbnail from a surface origin with curved beach marks over about two thirds of the face, and a dull fibrous patch over the last third."
      steps={[
        { at: 0, label: "Origin", caption: "The crack started from one small origin at the shaft's surface." },
        {
          at: 1,
          label: "Fatigue",
          caption: "Over many cycles it grew as a smooth thumbnail across about two thirds of the face, leaving beach marks behind it.",
        },
        {
          at: 3.2,
          label: "Overload",
          caption: "The beach marks bowing out from the origin say fatigue; the dull patch is only how it finished.",
        },
      ]}
    >
      {({ t }) => {
        const front = fatigueR * seg(t, 1, 2.8); // radius the fatigue crack has reached from the origin
        const origin = op(seg(t, 0.4, 0.9));
        const beach = op(seg(t, 2.6, 3.1));
        const overload = op(seg(t, 3.3, 3.8));
        return (
          <>
            <defs>
              <clipPath id="ladA-face">
                <circle cx={cx} cy={cy} r={R} />
              </clipPath>
            </defs>
            <circle cx={cx} cy={cy} r={R} fill={C.line} fillOpacity={0.5} />
            <g opacity={op(seg(t, 3.2, 3.7))}>{dots}</g>
            <g clipPath="url(#ladA-face)">
              {front > 0.5 ? <circle cx={ox} cy={oy} r={front} fill={C.soft} stroke={C.ink} strokeWidth={2} /> : null}
              {/* each beach mark is left behind as the front passes it */}
              {[35, 65, 95, 125].map((r) => (
                <circle key={r} cx={ox} cy={oy} r={r} fill="none" stroke={C.accent} strokeWidth={1.8} opacity={op(clamp((front - r) / 10))} />
              ))}
            </g>
            <circle cx={cx} cy={cy} r={R} fill="none" stroke={C.ink} strokeWidth={2.5} />
            <circle cx={ox} cy={oy} r={5} fill={C.alarm} opacity={origin} />

            <line x1={ox + 6} y1={oy} x2={318} y2={oy} stroke={C.muted} strokeWidth={1.2} opacity={origin} />
            <Label x={324} y={oy} anchor="start" tone="alarm" weight={600} opacity={origin}>origin</Label>
            <line x1={cx + 70} y1={110} x2={318} y2={110} stroke={C.muted} strokeWidth={1.2} opacity={beach} />
            <Label x={324} y={100} anchor="start" size={15} opacity={beach}>beach marks:</Label>
            <Label x={324} y={122} anchor="start" tone="accent" weight={600} opacity={beach}>fatigue</Label>
            <line x1={cx + 50} y1={225} x2={318} y2={225} stroke={C.muted} strokeWidth={1.2} opacity={overload} />
            <Label x={324} y={215} anchor="start" size={15} opacity={overload}>dull patch:</Label>
            <Label x={324} y={237} anchor="start" weight={600} opacity={overload}>final overload</Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

export const ladderAFigures: FigureMap = {
  "physics-201/torque": Torque,
  "physics-201/inertia": Inertia,
  "physics-201/spin": Spin,
  "physics-201/period": Period,
  "physics-201/float": Float,
  "physics-301/depth": Depth,
  "physics-301/flow": Flow,
  "physics-301/drag": Drag,
  "physics-301/thermal": Thermal,
  "physics-301/pipe": Pipe,
  "physics-401/rodspeed": RodSpeed,
  "physics-401/modeshape": ModeShape,
  "physics-401/impact": Impact,
  "physics-401/resonance": Resonance,
  "physics-401/turn": Turn,
  "materials-201/creeprate": CreepRate,
  "materials-201/hardness": Hardness,
  "materials-201/leak": Leak,
  "materials-201/thinning": Thinning,
  "materials-201/diffuse": Diffuse,
  "materials-201/face": Face,
};
