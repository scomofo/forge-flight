import type { ReactNode } from "react";
import { Arrow, Axes, C, DimH, Label, WallV, plotBox, type FigureMap } from "./kit";
import { AnimatedFigure, clamp, GrowArrow, lerp, op, partial, seg } from "./motion";

/* ---------- local helpers ---------- */

// `opacity` on these helpers is for fading in; pass `op(…)` so the final frame carries no attribute.

/** Short tick on an axis with a label: dir "x" puts the label below, "y" to the left. */
function Tick({ x, y, dir, label, opacity }: { x: number; y: number; dir: "x" | "y"; label: string; opacity?: number }) {
  return dir === "x" ? (
    <g opacity={opacity}>
      <line x1={x} y1={y} x2={x} y2={y + 6} stroke={C.ink} strokeWidth={1.5} />
      <Label x={x} y={y + 18} tone="muted" size={15}>
        {label}
      </Label>
    </g>
  ) : (
    <g opacity={opacity}>
      <line x1={x - 6} y1={y} x2={x} y2={y} stroke={C.ink} strokeWidth={1.5} />
      <Label x={x - 10} y={y} tone="muted" size={15} anchor="end">
        {label}
      </Label>
    </g>
  );
}

/** Dashed guide line. */
function Guide({
  x1,
  y1,
  x2,
  y2,
  tone = "muted",
  opacity,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  tone?: "muted" | "alarm" | "accent";
  opacity?: number;
}) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C[tone]} strokeWidth={1.5} strokeDasharray="5 5" opacity={opacity} />;
}

/** Label drawn on an accent fill: surface-coloured text for contrast. */
function OnAccent({ x, y, children, size = 15, opacity }: { x: number; y: number; children: ReactNode; size?: number; opacity?: number }) {
  return (
    <text x={x} y={y} fill={C.surface} textAnchor="middle" fontSize={size} fontWeight={600} dominantBaseline="middle" opacity={opacity}>
      {children}
    </text>
  );
}

function Dot({
  x,
  y,
  tone = "accent",
  r = 6,
  opacity,
}: {
  x: number;
  y: number;
  tone?: "accent" | "ink" | "alarm";
  r?: number;
  opacity?: number;
}) {
  return <circle cx={x} cy={y} r={r} fill={C[tone]} stroke={C.surface} strokeWidth={2} opacity={opacity} />;
}

/** Point on a semicircular dial (0 → left, 1 → right). */
function dialPt(cx: number, cy: number, r: number, f: number): [number, number] {
  const a = Math.PI * (1 - f);
  return [cx + r * Math.cos(a), cy - r * Math.sin(a)];
}

/* ---------- engineering-401 ---------- */

/** Miner: three blocks each under their own life, summed past 1. */
function Miner() {
  const base = 230;
  const s = 140; // px per 1.0 of damage
  const blocks = [
    { name: "mild", f: 0.2 },
    { name: "middle", f: 0.2 },
    { name: "severe", f: 0.7 },
  ];
  const stackX = 330;
  // The blocks run one after another; each block's bar and its slice of the stack grow together.
  const when = [
    [0.4, 1.1],
    [1.3, 2],
    [2.3, 4.3],
  ];
  const run = (t: number) => when.map(([a, b]) => seg(t, a, b));
  return (
    <AnimatedFigure
      height={270}
      duration={5}
      alt="Three bars show the mild, middle and severe blocks each spending 0.20, 0.20 and 0.70 of their own life, all under 1, and a stacked bar adds them to 1.10, past the line at 1."
      steps={[
        { at: 0, label: "Mild, middle", caption: "The mild block spends 0.20 of its own life, and the middle block another 0.20." },
        { at: 2.3, label: "Severe", caption: "The severe level allows 10000 cycles; 7000 of them spend 0.70, still under its own life." },
        { at: 4.3, label: "Sum", caption: "No block reached its own life, yet the fractions add to 1.10: the sum crossed 1 first." },
      ]}
      readouts={(t) => {
        const p = run(t);
        const sum = blocks.reduce((a, b, i) => a + b.f * p[i], 0);
        return [
          { label: "Σ n/N", value: sum.toFixed(2), tone: sum >= 1 ? "alarm" : "accent" },
          { label: "severe n", value: `${Math.round(7000 * p[2])} of 10000` },
        ];
      }}
    >
      {({ t }) => {
        const p = run(t);
        const f = blocks.map((b, i) => lerp(0, b.f, p[i]));
        const shown = when.map(([, b]) => op(seg(t, b - 0.2, b + 0.3)));
        let acc = 0;
        return (
          <>
            <Label x={130} y={base - s - 20} tone="muted" size={15}>
              each block's own life = 1
            </Label>
            {blocks.map((b, i) => {
              const x = 40 + i * 64;
              return (
                <g key={b.name}>
                  <rect x={x} y={base - s} width={44} height={s} fill="none" stroke={C.muted} strokeWidth={1.5} strokeDasharray="5 4" />
                  {f[i] > 0 ? (
                    <rect
                      x={x}
                      y={base - f[i] * s}
                      width={44}
                      height={f[i] * s}
                      fill={i === 2 ? C.accent : C.soft}
                      stroke={C.ink}
                      strokeWidth={1.5}
                    />
                  ) : null}
                  <Label x={x + 22} y={base - b.f * s - 12} size={15} opacity={shown[i]}>
                    {b.f.toFixed(2)}
                  </Label>
                  <Label x={x + 22} y={base + 16} tone="muted" size={15}>
                    {b.name}
                  </Label>
                </g>
              );
            })}
            <Arrow x1={232} y1={160} x2={300} y2={160} tone="muted" width={2} />
            <Label x={266} y={140} tone="muted" size={15}>add</Label>
            {blocks.map((b, i) => {
              const y0 = base - (acc + f[i]) * s;
              const h = f[i] * s;
              acc += f[i];
              return (
                <g key={`s${b.name}`}>
                  {h > 0 ? (
                    <rect x={stackX} y={y0} width={60} height={h} fill={i === 2 ? C.accent : C.soft} stroke={C.ink} strokeWidth={1.5} />
                  ) : null}
                  {i === 2 ? (
                    <OnAccent x={stackX + 30} y={y0 + h / 2} opacity={shown[i]}>{b.f.toFixed(2)}</OnAccent>
                  ) : (
                    <Label x={stackX + 30} y={y0 + h / 2} size={15} opacity={shown[i]}>
                      {b.f.toFixed(2)}
                    </Label>
                  )}
                </g>
              );
            })}
            <line x1={310} y1={base - s} x2={470} y2={base - s} stroke={C.alarm} strokeWidth={2} strokeDasharray="6 4" />
            <Label x={470} y={base - s + 16} anchor="end" tone="alarm" size={15}>
              1: done
            </Label>
            <Label x={stackX + 30} y={base - 1.1 * s - 16} tone="accent" weight={700} size={18} opacity={op(seg(t, 4.3, 4.8))}>
              Σ n/N = 1.10
            </Label>
            <line x1={310} y1={base} x2={470} y2={base} stroke={C.ink} strokeWidth={1.5} />
            <line x1={30} y1={base} x2={230} y2={base} stroke={C.ink} strokeWidth={1.5} />
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** Thermomech: +40 mechanical, −96 thermal, net −56 on a stress line. */
function Thermomech() {
  const x0 = 290;
  const k = 2.3; // px per MPa
  const X = (s: number) => x0 + s * k;
  const ax = 232;
  const load = (t: number) => seg(t, 0.4, 1.2); // the 40 MPa load comes on
  const heat = (t: number) => clamp((t - 1.8) / 2.4); // ΔT climbs steadily to 40°: σ = 40 − 2.4·ΔT
  const net = (t: number) => lerp(lerp(0, 40, load(t)), -56, heat(t));
  const mpa = (v: number) => {
    const r = Math.round(v);
    return `${r > 0 ? "+" : r < 0 ? "−" : ""}${Math.abs(r)} MPa`;
  };
  return (
    <AnimatedFigure
      height={300}
      duration={5}
      alt="A steel bar held between two walls, and a stress number line where a +40 MPa tension arrow is followed by a −96 MPa thermal arrow, landing at a net −56 MPa compression."
      steps={[
        { at: 0, label: "Load", caption: "The held steel bar already carries 40 MPa of tension from its load." },
        {
          at: 1.6,
          label: "Heat",
          caption: "Heat it 40° with the ends held: the bar wants to grow, so the thermal term E α ΔT is compressive.",
        },
        { at: 2.8, label: "Flip", caption: "Past about 17° the net flips from tension to compression." },
        {
          at: 4.2,
          label: "Net",
          caption:
            "Heating a held bar adds compression; the 96 MPa thermal term outweighs the 40 MPa load, so the net flips to 56 MPa compression.",
        },
      ]}
      readouts={(t) => [
        { label: "ΔT", value: `${Math.round(40 * heat(t))}°` },
        { label: "thermal", value: mpa(-96 * heat(t)), tone: "alarm" },
        { label: "net", value: mpa(net(t)), tone: "accent" },
      ]}
    >
      {({ t }) => {
        const hot = op(seg(t, 1.6, 2.1));
        const pH = heat(t);
        const tip = X(lerp(40, -56, pH));
        return (
          <>
            <WallV x={60} y={20} h={56} side="left" />
            <WallV x={420} y={20} h={56} side="right" />
            <rect x={60} y={34} width={360} height={28} fill={C.soft} stroke={C.ink} strokeWidth={2} />
            <Label x={240} y={48} size={15}>ends held, heated 40°</Label>
            <Arrow x1={66} y1={92} x2={102} y2={92} tone="alarm" width={2.5} opacity={hot} />
            <Arrow x1={414} y1={92} x2={378} y2={92} tone="alarm" width={2.5} opacity={hot} />
            <Label x={240} y={92} tone="alarm" size={15} opacity={hot}>wants to grow, walls push back</Label>

            <GrowArrow p={load(t)} x1={X(0)} y1={140} x2={X(40)} y2={140} tone="ink" width={3} />
            <Label x={X(20)} y={124} size={15} opacity={op(seg(t, 0.8, 1.3))}>+40 load</Label>
            <GrowArrow p={pH} x1={X(40)} y1={182} x2={X(-56)} y2={182} tone="alarm" width={3} />
            <Label x={X(-44)} y={166} tone="alarm" size={15} opacity={op(seg(t, 3.8, 4.3))}>−96 thermal (E α ΔT)</Label>
            <Guide x1={X(0)} y1={130} x2={X(0)} y2={ax} opacity={op(seg(t, 0.3, 0.8))} />
            <Guide x1={X(40)} y1={130} x2={X(40)} y2={192} opacity={op(seg(t, 1, 1.5))} />
            {pH > 0 ? <Guide x1={tip} y1={182} x2={tip} y2={ax} tone="accent" opacity={op(seg(t, 1.8, 2.3))} /> : null}

            <line x1={X(-110)} y1={ax} x2={X(70)} y2={ax} stroke={C.ink} strokeWidth={1.5} />
            {[-100, -50, 0, 50].map((v) => (
              <line key={v} x1={X(v)} y1={ax - 5} x2={X(v)} y2={ax + 5} stroke={C.ink} strokeWidth={1.5} />
            ))}
            <Label x={X(0)} y={ax + 18} tone="muted" size={15}>0</Label>
            <Dot x={X(net(t))} y={ax} />
            <Label x={X(-56)} y={ax + 20} tone="accent" weight={700} opacity={op(seg(t, 4.2, 4.7))}>net −56 MPa</Label>
            <Label x={X(-110)} y={ax + 50} anchor="start" tone="muted" size={15}>← compression</Label>
            <Label x={X(70)} y={ax + 50} anchor="end" tone="muted" size={15}>tension →</Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** Interval: crack growth curve, found at 0.5 mm vs 2 mm. */
function Interval() {
  const b = plotBox({ x: 60, y: 40, w: 370, h: 170, xMin: 0, xMax: 0.9, yMin: 0, yMax: 46 });
  const a0 = 0.5;
  const ac = 44;
  const life = 0.86;
  const k = (1 / Math.sqrt(a0) - 1 / Math.sqrt(ac)) / life;
  const aAt = (n: number) => 1 / (1 / Math.sqrt(a0) - k * n) ** 2;
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= 120; i++) {
    const n = life * (1 - (1 - i / 120) ** 2.5);
    pts.push([n, aAt(n)]);
  }
  const n2 = (1 / Math.sqrt(a0) - 1 / Math.sqrt(2)) / k; // ≈ 0.48 M
  // Cycles tick over at a steady rate, so the drawing crawls and then runs.
  const cyc = (t: number) => life * clamp((t - 0.5) / 3.6);
  const t2 = 0.5 + 3.6 * (n2 / life); // the crack passes 2 mm
  /** The curve up to n million cycles; the whole sampled curve once the crack is critical. */
  const upTo = (n: number): Array<[number, number]> => (n >= life ? pts : [...pts.filter(([m]) => m < n), [n, aAt(n)]]);
  return (
    <AnimatedFigure
      height={330}
      duration={5.4}
      alt="Crack length against cycles: the crack crawls for most of its life and then runs to 44 mm; found at 0.5 mm it has 0.86 million cycles left, found at 2 mm only 0.38 million."
      steps={[
        { at: 0, label: "0.5 mm find", caption: "Found at 0.5 mm, the crack is short, and a short crack grows slowly." },
        {
          at: 2.5,
          label: "2 mm find",
          caption: "A 2 mm find, four times longer, comes after that slow early growth; from here the crack runs to 44 mm.",
        },
        {
          at: 4.1,
          label: "Life left",
          caption: "The slow early growth is where the cycles are: a 4× later find costs about half the life, not three quarters.",
        },
      ]}
      readouts={(t) => {
        const a = aAt(cyc(t));
        return [
          { label: "cycles", value: `${cyc(t).toFixed(2)} M` },
          { label: "crack", value: `${a < 10 ? a.toFixed(1) : a.toFixed(0)} mm`, tone: "accent" },
        ];
      }}
    >
      {({ t }) => {
        const found = op(seg(t, t2, t2 + 0.4));
        return (
          <>
            <Axes box={b} xLabel="cycles (millions)" yLabel="crack length, mm" />
            <Guide x1={b.px(0)} y1={b.py(ac)} x2={b.px(0.9)} y2={b.py(ac)} tone="alarm" />
            <Label x={b.px(0.02)} y={b.py(ac) + 14} anchor="start" tone="alarm" size={15}>
              critical ≈ 44 mm
            </Label>
            <path d={b.path(upTo(cyc(t)))} fill="none" stroke={C.accent} strokeWidth={3} />
            <Dot x={b.px(0)} y={b.py(a0)} />
            <Dot x={b.px(n2)} y={b.py(2)} tone="ink" opacity={found} />
            <Guide x1={b.px(n2)} y1={b.py(2)} x2={b.px(n2)} y2={b.py(14)} opacity={found} />
            <Label x={b.px(n2)} y={b.py(14) - 12} size={15} opacity={found}>2 mm find</Label>
            <Label x={b.px(0.02)} y={b.py(6)} anchor="start" size={15}>0.5 mm find</Label>
            <g opacity={op(seg(t, 4.1, 4.6))}>
              <DimH x1={b.px(0)} x2={b.px(life)} y={268} label="from 0.5 mm: 0.86 M cycles" tone="accent" />
            </g>
            <g opacity={op(seg(t, 4.5, 5))}>
              <DimH x1={b.px(n2)} x2={b.px(life)} y={312} label="from 2 mm: 0.38 M" tone="ink" />
            </g>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** Review: four parts, four mechanisms. */
function Review() {
  const cell = (x: number, y: number, icon: ReactNode, mode: string, cue: string, look: number, name: number) => (
    <g transform={`translate(${x},${y})`}>
      <rect x={0} y={0} width={228} height={112} rx={6} fill="none" stroke={C.line} strokeWidth={1.5} />
      {icon}
      <Label x={104} y={42} anchor="start" tone="accent" weight={700} size={18} opacity={op(name)}>
        {mode}
      </Label>
      <Label x={104} y={70} anchor="start" tone="muted" size={15} opacity={op(look)}>
        {cue}
      </Label>
    </g>
  );
  // Each part: first its condition (the sentence), then its mechanism and name (the chapter).
  const lookAt = (i: number) => 0.4 + 0.45 * i;
  const nameAt = (i: number) => 2.5 + 0.45 * i;
  return (
    <AnimatedFigure
      height={250}
      duration={4.8}
      alt="Four panels: a long thin strut pushed on its end labelled buckling, a spinning stepped shaft labelled fatigue, a cracked shell labelled fracture, and a hot hanger labelled creep."
      steps={[
        {
          at: 0,
          label: "Look",
          caption: "Before you multiply anything, look at each part: long and pushed, a spinning shoulder, a crack, a year of heat.",
        },
        { at: 2.5, label: "Name", caption: "That sentence picks the chapter: buckling, fatigue, fracture, or creep." },
        {
          at: 4,
          label: "Calculate",
          caption: "Say the sentence first: the service condition picks the chapter, then you calculate that one.",
        },
      ]}
    >
      {({ t }) => {
        const look = [0, 1, 2, 3].map((i) => seg(t, lookAt(i), lookAt(i) + 0.5));
        const act = [0, 1, 2, 3].map((i) => seg(t, nameAt(i), nameAt(i) + 0.7)); // bow, crack, —, sag
        const name = [0, 1, 2, 3].map((i) => seg(t, nameAt(i) + 0.2, nameAt(i) + 0.7));
        const sag = lerp(58, 66, act[3]);
        return (
          <>
            {cell(
              8,
              10,
              <g opacity={op(look[0])}>
                <Arrow x1={48} y1={6} x2={48} y2={24} tone="ink" width={2.5} />
                <line x1={48} y1={26} x2={48} y2={102} stroke={C.ink} strokeWidth={3} />
                {act[0] > 0 ? (
                  <path
                    d={`M48,26 Q${lerp(48, 72, act[0])},64 48,102`}
                    fill="none"
                    stroke={C.accent}
                    strokeWidth={2}
                    strokeDasharray="5 4"
                    opacity={op(act[0])}
                  />
                ) : null}
                <line x1={34} y1={104} x2={62} y2={104} stroke={C.ink} strokeWidth={2.5} />
              </g>,
              "buckling",
              "long, thin, pushed",
              look[0],
              name[0],
            )}
            {cell(
              244,
              10,
              <g opacity={op(look[1])}>
                <rect x={14} y={38} width={44} height={38} fill={C.soft} stroke={C.ink} strokeWidth={2} />
                <rect x={58} y={46} width={34} height={22} fill={C.soft} stroke={C.ink} strokeWidth={2} />
                {act[1] > 0.02 ? (
                  <line x1={58} y1={46} x2={lerp(58, 63, act[1])} y2={lerp(46, 53, act[1])} stroke={C.alarm} strokeWidth={2.5} />
                ) : null}
                <path d="M22,28 A30,10 0 0 1 82,32" fill="none" stroke={C.accent} strokeWidth={2} markerEnd="url(#fig-arrow-accent)" />
              </g>,
              "fatigue",
              "shoulder, spinning",
              look[1],
              name[1],
            )}
            {cell(
              8,
              128,
              <g opacity={op(look[2])}>
                <circle cx={50} cy={56} r={36} fill={C.soft} stroke={C.ink} strokeWidth={4} />
                <line x1={33} y1={24} x2={40} y2={36} stroke={C.alarm} strokeWidth={3} />
                <line x1={40} y1={36} x2={36} y2={42} stroke={C.alarm} strokeWidth={2} />
              </g>,
              "fracture",
              "crack present",
              look[2],
              name[2],
            )}
            {cell(
              244,
              128,
              <g opacity={op(look[3])}>
                <line x1={20} y1={14} x2={82} y2={14} stroke={C.ink} strokeWidth={3} />
                <line x1={51} y1={14} x2={51} y2={sag} stroke={C.ink} strokeWidth={2.5} />
                <rect x={36} y={sag} width={30} height={26} fill={C.soft} stroke={C.ink} strokeWidth={2} />
                <path d="M20,40 q5,-6 0,-12 M84,40 q5,-6 0,-12" fill="none" stroke={C.alarm} strokeWidth={2} />
                <GrowArrow p={act[3]} x1={51} y1={96} x2={51} y2={108} tone="accent" width={2} />
              </g>,
              "creep",
              "hot for a year",
              look[3],
              name[3],
            )}
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** Clocks: fatigue and creep fractions on one life. */
function Clocks() {
  const r = 54;
  /** A dial for fraction f, its arc and needle at p (0…f), its number at opacity `shown`. */
  const dial = (cx: number, f: number, name: string, p: number, shown: number | undefined) => {
    const cy = 100;
    const [ex, ey] = dialPt(cx, cy, r, p);
    const [nx, ny] = dialPt(cx, cy, r - 12, p);
    return (
      <g>
        <path d={`M${cx - r},${cy} A${r},${r} 0 0 1 ${cx + r},${cy}`} fill="none" stroke={C.line} strokeWidth={10} />
        {p > 0 ? (
          <path d={`M${cx - r},${cy} A${r},${r} 0 0 1 ${ex.toFixed(1)},${ey.toFixed(1)}`} fill="none" stroke={C.accent} strokeWidth={10} />
        ) : null}
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={C.ink} strokeWidth={2.5} />
        <circle cx={cx} cy={cy} r={4} fill={C.ink} />
        <Label x={cx - r} y={cy + 16} tone="muted" size={15}>0</Label>
        <Label x={cx + r} y={cy + 16} tone="muted" size={15}>1</Label>
        <Label x={cx} y={cy + 20} weight={700} opacity={shown}>{f.toFixed(2)}</Label>
        <Label x={cx} y={cy + 44} tone="muted" size={15}>{name}</Label>
      </g>
    );
  };
  const x0 = 40;
  const s = 300;
  const by = 214;
  const fatigue = (t: number) => lerp(0, 0.4, seg(t, 0.4, 1.4));
  // Creep first reaches 0.30 (sum 0.70, still in), then 0.70 (sum 1.10).
  const creep = (t: number) => lerp(lerp(0, 0.3, seg(t, 1.8, 2.6)), 0.7, seg(t, 3.1, 3.9));
  return (
    <AnimatedFigure
      height={270}
      duration={4.8}
      alt="Two dials show 0.40 of the fatigue life and 0.70 of the creep-rupture life, each under 1; a bar below adds them to 1.10, past the retire line at 1."
      steps={[
        { at: 0, label: "Fatigue", caption: "Cycles spend n/N of the fatigue life: this disk has used 0.40." },
        {
          at: 1.7,
          label: "Creep",
          caption: "Time at temperature spends t/t_r of the creep-rupture life: 0.40 plus 0.30 is 0.70, and the part is still in.",
        },
        {
          at: 3.9,
          label: "Retire",
          caption: "Each clock alone says there is life left; on the one shared life they add to 1.10, so the part retires.",
        },
      ]}
      readouts={(t) => {
        const d = fatigue(t) + creep(t);
        return [
          { label: "n/N", value: fatigue(t).toFixed(2) },
          { label: "t/t_r", value: creep(t).toFixed(2) },
          { label: "D", value: d.toFixed(2), tone: d >= 1 ? "alarm" : "accent" },
        ];
      }}
    >
      {({ t }) => {
        const fat = fatigue(t);
        const cr = creep(t);
        const fatShown = op(seg(t, 1.2, 1.6));
        const crShown = op(seg(t, 3.7, 4.1));
        return (
          <>
            {dial(120, 0.4, "fatigue n/N", fat, fatShown)}
            <Label x={240} y={80} size={24} tone="muted">+</Label>
            {dial(360, 0.7, "creep t/t_r", cr, crShown)}
            {fat > 0 ? <rect x={x0} y={by} width={fat * s} height={26} fill={C.soft} stroke={C.ink} strokeWidth={1.5} /> : null}
            <Label x={x0 + 0.2 * s} y={by + 13} size={15} opacity={fatShown}>0.40</Label>
            {cr > 0 ? <rect x={x0 + 0.4 * s} y={by} width={cr * s} height={26} fill={C.accent} stroke={C.ink} strokeWidth={1.5} /> : null}
            <OnAccent x={x0 + 0.75 * s} y={by + 13} opacity={crShown}>0.70</OnAccent>
            <line x1={x0 + s} y1={by - 20} x2={x0 + s} y2={by + 40} stroke={C.alarm} strokeWidth={2} strokeDasharray="6 4" />
            <Label x={x0 + s} y={by - 30} tone="alarm" size={15}>1: retire</Label>
            <Label x={x0 + 1.1 * s + 8} y={by + 13} anchor="start" tone="accent" weight={700} opacity={op(seg(t, 3.9, 4.4))}>
              1.10
            </Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/* ---------- manufacturing-201 ---------- */

/** Rolling: force vs draft follows √draft. */
function Rolling() {
  const b = plotBox({ x: 70, y: 40, w: 350, h: 190, xMin: 0, xMax: 7, yMin: 0, yMax: 1000 });
  const F = (d: number) => (300 * 100 * Math.sqrt(150 * d)) / 1000; // kN
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= 60; i++) pts.push([(6 * i) / 60, F((6 * i) / 60)]);
  const slope = F(2) / 2;
  // The curve is drawn out in draft at a steady rate: to 2 mm, a pause, then on to 6 mm (5 mm at 2.8 s).
  const drawn = (t: number) => lerp(lerp(0, 1 / 3, clamp((t - 0.4) / 0.9)), 1, clamp((t - 1.9) / 1.2));
  return (
    <AnimatedFigure
      height={290}
      duration={4.8}
      alt="Rolling force against draft rises as a square-root curve through 520 kN at a 2 mm draft and 820 kN at 5 mm, well below a dashed straight line drawn in proportion."
      steps={[
        { at: 0, label: "8 mm exit", caption: "Stock is 10 mm: exiting at 8 mm is a 2 mm draft and about 520 kN." },
        { at: 1.8, label: "5 mm exit", caption: "Exiting at 5 mm is a 5 mm draft, more than double, and about 820 kN." },
        {
          at: 3.4,
          label: "Square root",
          caption: "The draft went from 2 to 5 mm, but the force only follows the contact length √(R Δh): 520 kN to 820, not in proportion.",
        },
      ]}
    >
      {({ t }) => {
        const two = op(seg(t, 1.2, 1.7));
        const five = op(seg(t, 2.8, 3.3));
        const pp = seg(t, 3.4, 4);
        return (
          <>
            <Axes box={b} xLabel="draft Δh, mm" yLabel="force, kN" />
            {pp > 0 ? (
              <path
                d={b.path([[0, 0], [lerp(0, 1000 / slope, pp), lerp(0, 1000, pp)]])}
                fill="none"
                stroke={C.muted}
                strokeWidth={2}
                strokeDasharray="6 5"
              />
            ) : null}
            <Label x={b.px(1000 / slope) + 8} y={b.py(985)} anchor="start" tone="muted" size={15} opacity={op(seg(t, 3.8, 4.3))}>
              in proportion
            </Label>
            <path d={b.path(partial(pts, drawn(t)))} fill="none" stroke={C.accent} strokeWidth={3} />
            <Guide x1={b.px(0)} y1={b.py(F(2))} x2={b.px(2)} y2={b.py(F(2))} opacity={two} />
            <Guide x1={b.px(2)} y1={b.py(F(2))} x2={b.px(2)} y2={b.py(0)} opacity={two} />
            <Guide x1={b.px(0)} y1={b.py(F(5))} x2={b.px(5)} y2={b.py(F(5))} opacity={five} />
            <Guide x1={b.px(5)} y1={b.py(F(5))} x2={b.px(5)} y2={b.py(0)} opacity={five} />
            <Tick x={b.px(0)} y={b.py(520)} dir="y" label="520" opacity={two} />
            <Tick x={b.px(0)} y={b.py(820)} dir="y" label="820" opacity={five} />
            <Tick x={b.px(2)} y={b.py(0)} dir="x" label="2" opacity={two} />
            <Tick x={b.px(5)} y={b.py(0)} dir="x" label="5" opacity={five} />
            <Dot x={b.px(2)} y={b.py(F(2))} opacity={two} />
            <Dot x={b.px(5)} y={b.py(F(5))} opacity={five} />
            <Label x={b.px(2) + 12} y={b.py(F(2)) + 20} anchor="start" size={15} opacity={two}>8 mm exit</Label>
            <Label x={b.px(5) + 10} y={b.py(F(5)) + 22} anchor="start" size={15} opacity={five}>5 mm exit</Label>
            <Label x={b.px(6.9)} y={b.py(330)} anchor="end" tone="accent" serif size={18} opacity={op(seg(t, 4, 4.5))}>
              L ≈ √(R Δh)
            </Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** Taylor: life collapses with speed. */
function Taylor() {
  const b = plotBox({ x: 60, y: 40, w: 360, h: 190, xMin: 90, xMax: 200, yMin: 0, yMax: 45 });
  const T = (v: number) => (200 / v) ** 5;
  const pts: Array<[number, number]> = [];
  for (let v = 95; v <= 200; v += 1) pts.push([v, T(v)]);
  const speed = (t: number) => lerp(100, 150, seg(t, 1.9, 3.3)); // the same cut, sped up from 100 to 150 m/min
  return (
    <AnimatedFigure
      height={290}
      duration={4.4}
      alt="Tool life against cutting speed: a steep curve drops from 32 minutes at 100 m/min to about 4 minutes at 150 m/min."
      steps={[
        { at: 0, label: "100 m/min", caption: "At 100 m/min the tool lasts about 32 minutes." },
        { at: 1.8, label: "150 m/min", caption: "Raise the speed by half, to 150 m/min, and the tool lasts about 4 minutes." },
        {
          at: 3.5,
          label: "Constant",
          caption: "Half again the speed, about an eighth of the life: V times T to the 0.2 stays 200 while life falls from 32 min to about 4.",
        },
      ]}
      readouts={(t) => [
        { label: "V", value: `${Math.round(speed(t))} m/min` },
        { label: "T", value: `${Math.round(T(speed(t)))} min`, tone: "accent" },
      ]}
    >
      {({ t }) => {
        const v = speed(t);
        const first = op(seg(t, 1, 1.5));
        const moving = op(seg(t, 1.9, 2.2));
        const last = op(seg(t, 3.2, 3.7));
        return (
          <>
            <Axes box={b} xLabel="speed, m/min" yLabel="tool life, min" />
            <path d={b.path(partial(pts, seg(t, 0.3, 1.1)))} fill="none" stroke={C.accent} strokeWidth={3} />
            <Guide x1={b.px(90)} y1={b.py(32)} x2={b.px(100)} y2={b.py(32)} opacity={first} />
            <Guide x1={b.px(100)} y1={b.py(32)} x2={b.px(100)} y2={b.py(0)} opacity={first} />
            <Guide x1={b.px(90)} y1={b.py(T(v))} x2={b.px(v)} y2={b.py(T(v))} opacity={moving} />
            <Guide x1={b.px(v)} y1={b.py(T(v))} x2={b.px(v)} y2={b.py(0)} opacity={moving} />
            <Tick x={b.px(90)} y={b.py(32)} dir="y" label="32" opacity={first} />
            <Tick x={b.px(90)} y={b.py(T(150))} dir="y" label="4" opacity={last} />
            <Tick x={b.px(100)} y={b.py(0)} dir="x" label="100" opacity={first} />
            <Tick x={b.px(150)} y={b.py(0)} dir="x" label="150" opacity={last} />
            <Dot x={b.px(100)} y={b.py(32)} opacity={first} />
            <Dot x={b.px(v)} y={b.py(T(v))} opacity={first} />
            <Label x={b.px(104)} y={b.py(32)} anchor="start" size={15} opacity={first}>32 min</Label>
            <Label x={b.px(150)} y={b.py(T(150)) - 20} size={15} opacity={last}>about 4 min</Label>
            <text
              x={b.px(195)}
              y={b.py(36)}
              textAnchor="end"
              fill={C.accent}
              fontFamily="var(--font-serif, ui-serif, Georgia, serif)"
              fontSize={18}
              dominantBaseline="middle"
              opacity={op(seg(t, 3.5, 4))}
            >
              V T<tspan dy={-8} fontSize={15}>0.2</tspan>
              <tspan dy={8}> = 200</tspan>
            </text>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** Pattern: cavity starts bigger than the drawing. */
function Pattern() {
  const pL = 50;
  const pR = 430;
  const shrinkPx = 18; // exaggerated each side
  const cool = (t: number) => seg(t, 1.4, 3); // the poured casting shrinks as it cools
  return (
    <AnimatedFigure
      height={280}
      duration={4.2}
      alt="A pattern dimensioned 202.6 mm above a shorter cooled casting dimensioned 200 mm, with dashed lines showing the shrink at each end."
      steps={[
        { at: 0, label: "Pattern", caption: "For this 1.3% aluminum the pattern is 202.6 mm, and the poured metal fills that cavity." },
        { at: 1, label: "Cool", caption: "Metal castings shrink as they cool: this one by 1.3%." },
        {
          at: 3,
          label: "Drawing",
          caption: "Shrink drawn exaggerated: the pattern is 200 × 1.013 = 202.6 mm so the cold casting lands on the drawing's 200.",
        },
      ]}
      readouts={(t) => [{ label: "casting", value: `${lerp(202.6, 200, cool(t)).toFixed(1)} mm`, tone: "ink" }]}
    >
      {({ t }) => {
        const c = cool(t);
        const cooling = op(seg(t, 1, 1.5));
        return (
          <>
            <DimH x1={pL} x2={pR} y={32} label="pattern 202.6 mm" tone="accent" />
            <rect x={pL} y={52} width={pR - pL} height={48} rx={4} fill={C.soft} stroke={C.accent} strokeWidth={2.5} />
            <Guide x1={pL} y1={100} x2={pL} y2={190} />
            <Guide x1={pR} y1={100} x2={pR} y2={190} />
            <Arrow x1={240} y1={110} x2={240} y2={146} tone="muted" width={2} opacity={cooling} />
            <Label x={252} y={128} anchor="start" tone="muted" size={15} opacity={cooling}>cools, shrinks 1.3%</Label>
            <rect
              x={lerp(pL, pL + shrinkPx, c)}
              y={156}
              width={lerp(pR - pL, pR - pL - 2 * shrinkPx, c)}
              height={48}
              rx={4}
              fill={C.surface}
              stroke={C.ink}
              strokeWidth={2.5}
              opacity={op(seg(t, 0.4, 0.9))}
            />
            <g opacity={op(seg(t, 3, 3.5))}>
              <DimH x1={pL + shrinkPx} x2={pR - shrinkPx} y={236} label="casting 200 mm" />
            </g>
            <Label x={240} y={266} serif size={17} opacity={op(seg(t, 3.3, 3.8))}>200 × (1 + 0.013) = 202.6</Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** Distort: bow ∝ heat / t². */
function Distort() {
  const cases = [
    { x: 80, heat: "100 J/mm", t: 6, bow: 3, lab: "bow 3 mm" },
    { x: 240, heat: "200 J/mm", t: 6, bow: 6, lab: "bow 6 mm" },
    { x: 400, heat: "100 J/mm", t: 12, bow: 0.75, lab: "bow 0.75 mm" },
  ];
  const k = 5; // px per mm of bow (exaggerated)
  const cy = 150;
  // Each plate in turn: laid flat (the first is there from the start), the bead goes down, then it bows as the weld cools.
  const at = [0.1, 1.6, 2.9];
  return (
    <AnimatedFigure
      height={250}
      duration={5}
      alt="Three welded plates: at 100 J/mm and 6 mm the plate bows 3 mm, doubling the heat bows it 6 mm, and doubling the thickness to 12 mm bows it only 0.75 mm."
      steps={[
        { at: 0, label: "Base", caption: "On this teaching picture, a 6 mm plate welded at 100 J/mm bows 3 mm." },
        { at: 1.6, label: "Double heat", caption: "Double the heat to 200 J/mm and the bow doubles, to 6 mm." },
        { at: 2.9, label: "Double thickness", caption: "Double the thickness to 12 mm instead, and the bow falls by four, to 0.75 mm." },
        {
          at: 4.2,
          label: "Powers",
          caption: "Heat enters once, thickness squared: double the heat doubles the bow, double the thickness cuts it by four (bows exaggerated).",
        },
      ]}
    >
      {({ t }) => (
        <>
          {cases.map((c, i) => {
            const half = 62;
            const a = at[i];
            const lift = lerp(0, c.bow * k, seg(t, a + 0.5, a + 1.2));
            const d = `M${c.x - half},${cy - lift} Q${c.x},${cy + lift} ${c.x + half},${cy - lift}`;
            const plate = i === 0 ? undefined : op(seg(t, a, a + 0.5));
            return (
              <g key={i}>
                <Label x={c.x} y={40} size={15} opacity={plate}>{c.heat}</Label>
                <Label x={c.x} y={62} size={15} tone={i === 2 ? "accent" : "ink"} opacity={plate}>{`t = ${c.t} mm`}</Label>
                <line x1={c.x - half} y1={cy} x2={c.x + half} y2={cy} stroke={C.line} strokeWidth={1.5} strokeDasharray="4 4" />
                <path d={d} fill="none" stroke={C.ink} strokeWidth={c.t * 0.9} strokeLinecap="butt" opacity={plate} />
                <circle cx={c.x} cy={cy - c.t * 0.45 - 1} r={i === 1 ? 7 : 5} fill={C.alarm} opacity={op(seg(t, a + 0.3, a + 0.7))} />
                <Label x={c.x} y={205} weight={700} tone={i === 0 ? "ink" : "accent"} opacity={op(seg(t, a + 0.9, a + 1.3))}>
                  {c.lab}
                </Label>
              </g>
            );
          })}
          <Label x={240} y={236} tone="muted" size={15} opacity={op(seg(t, 4.2, 4.7))}>bow ∝ heat / t²</Label>
        </>
      )}
    </AnimatedFigure>
  );
}

/** Locate: 3-2-1 in plan view. */
function Locate() {
  const L = 130;
  const R = 390;
  const T = 70;
  const B = 190;
  // Contacts go on in the lesson's order: 3 under the base, 2 on the side, 1 on the end, then a spare 4th on the base.
  const baseAt = [0.4, 0.65, 0.9];
  const sideAt = [1.7, 1.95];
  const endAt = 2.5;
  const fourthAt = 3.9;
  const on = (t: number, a: number) => seg(t, a, a + 0.4);
  /** A contact counts once it is half on. */
  const placed = (t: number, a: number) => t >= a + 0.2;
  return (
    <AnimatedFigure
      height={290}
      duration={5}
      alt="Plan view of a block with three base contacts underneath, two pins on the side and one pin on the end, plus a dashed fourth base contact that removes nothing."
      steps={[
        { at: 0, label: "Base", caption: "A free block has six motions; three contacts under the base stop three of them." },
        { at: 1.6, label: "Side, end", caption: "Two on the side and one on the end stop the other three: nothing is left to rattle." },
        {
          at: 3.9,
          label: "Fourth dot",
          caption: "3 on the base, 2 on the side, 1 on the end takes all six motions; a fourth base dot has no seventh motion to take.",
        },
      ]}
      readouts={(t) => {
        const n = [...baseAt, ...sideAt, endAt].filter((a) => placed(t, a)).length;
        return [
          { label: "contacts", value: `${n + (placed(t, fourthAt) ? 1 : 0)}` },
          { label: "motions left", value: `${6 - n}`, tone: "accent" },
        ];
      }}
    >
      {({ t }) => (
        <>
          <rect x={L} y={T} width={R - L} height={B - T} fill={C.soft} stroke={C.ink} strokeWidth={2.5} />
          {[
            [175, 100],
            [175, 162],
            [345, 131],
          ].map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={lerp(5, 9, on(t, baseAt[i]))}
              fill={C.surface}
              stroke={C.accent}
              strokeWidth={3}
              opacity={op(on(t, baseAt[i]))}
            />
          ))}
          <Label x={260} y={98} size={15} tone="accent" opacity={op(seg(t, 1.1, 1.6))}>3 on base (under)</Label>
          <circle
            cx={262}
            cy={150}
            r={lerp(5, 9, on(t, fourthAt))}
            fill="none"
            stroke={C.alarm}
            strokeWidth={2.5}
            strokeDasharray="4 3"
            opacity={op(on(t, fourthAt))}
          />
          <Label x={262} y={174} size={15} tone="alarm" opacity={op(seg(t, 4.2, 4.7))}>4th: removes nothing</Label>
          {[175, 345].map((x, i) => (
            <circle key={x} cx={x} cy={B + 11} r={lerp(6, 10, on(t, sideAt[i]))} fill={C.accent} opacity={op(on(t, sideAt[i]))} />
          ))}
          <Label x={260} y={B + 12} size={15} tone="accent" opacity={op(seg(t, 2.2, 2.7))}>2 on side</Label>
          <circle cx={L - 11} cy={131} r={lerp(6, 10, on(t, endAt))} fill={C.accent} opacity={op(on(t, endAt))} />
          <Label x={L - 26} y={131} anchor="end" size={15} tone="accent" opacity={op(seg(t, 2.7, 3.2))}>1 on end</Label>
          <Label x={240} y={36} serif size={17} opacity={op(seg(t, 3.1, 3.6))}>6 − 3 − 2 − 1 = 0 motions left</Label>
          <Label x={240} y={262} tone="muted" size={15}>block in the vise, seen from above</Label>
        </>
      )}
    </AnimatedFigure>
  );
}

/* ---------- manufacturing-301 ---------- */

/** Bonus: allowed position grows with hole size above MMC. */
function Bonus() {
  const b = plotBox({ x: 80, y: 40, w: 340, h: 180, xMin: 9.95, xMax: 10.35, yMin: 0, yMax: 0.5 });
  const grow = (t: number) => seg(t, 1.3, 3.1); // the measured hole grows from 10.0 to 10.2 mm
  return (
    <AnimatedFigure
      height={290}
      duration={4.2}
      alt="Allowed position tolerance against measured hole size: 0.20 mm at the 10.0 mm maximum-material size, rising one-for-one to 0.40 mm at 10.2 mm, the extra 0.20 marked as bonus."
      steps={[
        {
          at: 0,
          label: "MMC",
          caption: "A hole at its smallest, 10.0 mm, is the maximum-material condition, and the stated 0.20 mm applies there.",
        },
        {
          at: 1.2,
          label: "Bonus",
          caption: "A larger hole has more clearance to give away: the bonus is the measured size minus 10.0 mm.",
        },
        {
          at: 3.1,
          label: "10.2 mm",
          caption:
            "Every bit of size above the 10.0 mm MMC hole is added to the stated 0.20: a 10.2 mm hole may sit 0.40 off, if the callout is at MMC.",
        },
      ]}
      readouts={(t) => {
        const p = grow(t);
        return [
          { label: "hole", value: `${lerp(10, 10.2, p).toFixed(2)} mm` },
          { label: "bonus", value: `${lerp(0, 0.2, p).toFixed(2)} mm` },
          { label: "allowed", value: `${lerp(0.2, 0.4, p).toFixed(2)} mm`, tone: "accent" },
        ];
      }}
    >
      {({ t }) => {
        const p = grow(t);
        const size = lerp(10.0, 10.2, p);
        const allowed = lerp(0.2, 0.4, p);
        const mmc = op(seg(t, 0.3, 0.8));
        const end = op(seg(t, 3, 3.5));
        return (
          <>
            <Axes box={b} xLabel="hole size, mm" yLabel="position allowed, mm" />
            <Guide x1={b.px(9.95)} y1={b.py(0.2)} x2={b.px(10.35)} y2={b.py(0.2)} opacity={mmc} />
            <Label x={b.px(10.03)} y={b.py(0.2) + 16} anchor="start" tone="muted" size={15} opacity={mmc}>stated 0.20</Label>
            {p > 0 ? <path d={b.path([[10.0, 0.2], [size, allowed]])} fill="none" stroke={C.accent} strokeWidth={3} /> : null}
            <Guide x1={b.px(10.0)} y1={b.py(0.2)} x2={b.px(10.0)} y2={b.py(0)} opacity={mmc} />
            <Guide x1={b.px(10.2)} y1={b.py(0.4)} x2={b.px(10.2)} y2={b.py(0)} opacity={end} />
            <Guide x1={b.px(9.95)} y1={b.py(0.4)} x2={b.px(10.2)} y2={b.py(0.4)} opacity={end} />
            <Tick x={b.px(9.95)} y={b.py(0.2)} dir="y" label="0.20" opacity={mmc} />
            <Tick x={b.px(9.95)} y={b.py(0.4)} dir="y" label="0.40" opacity={end} />
            <Tick x={b.px(10.0)} y={b.py(0)} dir="x" label="10.0 MMC" opacity={mmc} />
            <Tick x={b.px(10.2)} y={b.py(0)} dir="x" label="10.2" opacity={end} />
            <Arrow
              x1={b.px(10.2) + 16}
              y1={b.py(0.2)}
              x2={b.px(10.2) + 16}
              y2={b.py(0.4)}
              tone="accent"
              width={2}
              both
              opacity={op(seg(t, 3.2, 3.7))}
            />
            <Label x={b.px(10.2) + 26} y={b.py(0.3)} anchor="start" tone="accent" weight={700} size={15} opacity={op(seg(t, 3.2, 3.7))}>
              bonus 0.20
            </Label>
            <Dot x={b.px(10.0)} y={b.py(0.2)} opacity={mmc} />
            <Dot x={b.px(size)} y={b.py(allowed)} opacity={mmc} />
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** Surface: same 300 MPa bar, three skins. */
function Surface() {
  const base = 230;
  const s = 0.6; // px per MPa
  const bars = [
    { x: 50, v: 300, f: "×1", name: "polished", rough: 0 },
    { x: 195, v: 240, f: "×0.8", name: "machined", rough: 1 },
    { x: 340, v: 150, f: "×0.5", name: "forged", rough: 2 },
  ];
  /** The bar's top edge: smooth, or tool marks / scale at `amp` (0–1) of full depth. */
  const top = (x: number, y: number, kind: number, amp: number) => {
    const w = 90;
    if (kind === 0) return `M${x},${y} L${x + w},${y}`;
    let d = `M${x},${y}`;
    const n = kind === 1 ? 9 : 12;
    const amps = kind === 1 ? [4] : [7, 3, 9, 5, 2, 8, 4, 10, 3, 6, 9, 4];
    for (let i = 1; i <= n; i++) {
      const xx = x + (w * i) / n;
      const a = amps[(i - 1) % amps.length] * amp;
      d += ` L${(xx - w / n / 2).toFixed(1)},${y - a} L${xx.toFixed(1)},${y}`;
    }
    return d;
  };
  // Every bar starts as the polished 300 MPa plateau; then each skin multiplies it down.
  const skinAt = [0, 1.2, 2.6];
  return (
    <AnimatedFigure
      height={290}
      duration={4.4}
      alt="Three bars of fatigue strength for the same steel: polished 300 MPa, machined 240 MPa, forged 150 MPa, with the top of each bar drawn smooth, grooved and rough."
      steps={[
        { at: 0, label: "Polished", caption: "Measured on a polished bar, this steel's fully reversed plateau is 300 MPa." },
        { at: 1.2, label: "Machined", caption: "A machined skin multiplies it by about 0.8, so 240 MPa." },
        { at: 2.6, label: "Forged", caption: "A forged skin multiplies it by about 0.5, so 150 MPa. The alloy did not change." },
        {
          at: 3.8,
          label: "Multiply",
          caption: "Same alloy, different skin: the surface factor multiplies the polished 300 MPa plateau before you claim a fatigue life.",
        },
      ]}
    >
      {({ t }) => (
        <>
          {bars.map((b, i) => {
            const p = i === 0 ? 1 : seg(t, skinAt[i], skinAt[i] + 1);
            const v = lerp(300, b.v, p);
            const y = base - v * s;
            const lab = i === 0 ? seg(t, 0.3, 0.8) : seg(t, skinAt[i] + 0.8, skinAt[i] + 1.2);
            return (
              <g key={b.name}>
                <rect x={b.x} y={y} width={90} height={v * s} fill={b.rough === 0 ? C.soft : b.rough === 1 ? C.soft : C.soft} stroke="none" />
                <path d={`${top(b.x, y, b.rough, p)} L${b.x + 90},${base} L${b.x},${base} Z`} fill={C.soft} stroke={C.ink} strokeWidth={2} />
                <Label x={b.x + 45} y={y - 22} weight={700} tone={b.rough === 2 ? "accent" : "ink"} opacity={op(lab)}>{`${b.v} MPa`}</Label>
                <Label x={b.x + 45} y={base + 18} size={15}>{b.name}</Label>
                <Label x={b.x + 45} y={base + 40} size={15} tone="muted" opacity={op(i === 0 ? lab : seg(t, skinAt[i], skinAt[i] + 0.5))}>
                  {b.f}
                </Label>
              </g>
            );
          })}
          <line x1={30} y1={base} x2={460} y2={base} stroke={C.ink} strokeWidth={1.5} />
        </>
      )}
    </AnimatedFigure>
  );
}

/** Travel: one minute of the same arc, spread over 300 mm or 150 mm. */
function Travel() {
  const x0 = 40;
  const k = 1.1; // px per mm
  /**
   * One torch after `tau` of the minute (0–1), riding `drop` px lower while the arc is on (clear of the
   * row label); its dimension and heat label at the given opacities.
   */
  const row = (
    y: number,
    mm: number,
    hi: string,
    strong: boolean,
    tau: number,
    drop: number,
    dim: number | undefined,
    heat: number | undefined,
  ) => {
    const X = x0 + mm * k * tau;
    const Y = y + drop;
    return (
      <g>
        <Label x={x0} y={y - 30} anchor="start" size={15}>{`${mm} mm/min`}</Label>
        <rect x={x0} y={y - 4} width={360} height={22} fill={C.surface} stroke={C.line} strokeWidth={1.5} />
        {tau > 0 ? (
          <rect x={x0} y={y - (strong ? 4 : 0)} width={mm * k * tau} height={strong ? 16 : 8} rx={4} fill={strong ? C.accent : C.soft} stroke={C.accent} strokeWidth={1.5} />
        ) : null}
        <path d={`M${X - 8},${Y - 26} L${X + 8},${Y - 26} L${X},${Y - 8} Z`} fill={C.ink} />
        <g opacity={dim}>
          <DimH x1={x0} x2={x0 + mm * k} y={y + 44} label={`${mm} mm in one minute`} />
        </g>
        <Label x={470} y={y - 30} anchor="end" tone="accent" weight={700} opacity={heat}>{hi}</Label>
      </g>
    );
  };
  const run = (t: number) => clamp((t - 0.5) / 3); // one minute of arc in 3 s; both torches travel at a steady speed
  return (
    <AnimatedFigure
      height={290}
      duration={4.6}
      alt="The same 20 V, 150 A arc run for one minute lays heat over 300 mm at 0.60 kJ/mm, or over 150 mm at 1.20 kJ/mm when the travel is halved."
      steps={[
        { at: 0, label: "Same arc", caption: "The same arc, 20 V and 150 A, runs for one minute at two travel speeds." },
        { at: 0.5, label: "Travel", caption: "In that minute the torch covers 300 mm at 300 mm/min, but only 150 mm at 150 mm/min." },
        {
          at: 3.5,
          label: "Heat per mm",
          caption: "Same 20 V and 150 A, same minute of arc: halve the travel and each millimeter gets twice the heat.",
        },
      ]}
      readouts={(t) => {
        const tau = run(t);
        return [
          { label: "arc on", value: `${Math.round(60 * tau)} s${tau > 0 && tau < 1 ? " · sped up" : ""}` },
          { label: "fast torch", value: `${Math.round(300 * tau)} mm` },
          { label: "slow torch", value: `${Math.round(150 * tau)} mm`, tone: "accent" },
        ];
      }}
    >
      {({ t }) => {
        const tau = run(t);
        const drop = lerp(4, 0, seg(t, 3.5, 3.9)); // the torches lift off when the minute is up
        const dim = op(seg(t, 3.5, 4));
        const heat = op(seg(t, 3.8, 4.3));
        return (
          <>
            <Label x={240} y={18} tone="muted" size={15}>20 V × 150 A, one minute of arc</Label>
            {row(84, 300, "0.60 kJ/mm", false, tau, drop, dim, heat)}
            {row(214, 150, "1.20 kJ/mm", true, tau, drop, dim, heat)}
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** Passes: FPY = 0.98^n. */
function Passes() {
  const b = plotBox({ x: 70, y: 40, w: 350, h: 190, xMin: 0, xMax: 45, yMin: 0, yMax: 100 });
  const pts: Array<[number, number]> = [];
  for (let n = 0; n <= 45; n++) pts.push([n, 100 * 0.98 ** n]);
  // Steps are added at a steady rate (about 17 a second): to 10, a pause, then on to 45, passing 40 at 3.4 s.
  const drawn = (t: number) => lerp(lerp(0, 10 / 45, clamp((t - 0.4) / 0.6)), 1, clamp((t - 1.6) / 2.1));
  return (
    <AnimatedFigure
      height={290}
      duration={4.4}
      alt="First-pass yield against number of steps: each step keeps 98%, yet the product falls to about 82% at 10 steps and about 45% at 40 steps."
      steps={[
        { at: 0, label: "Each step", caption: "Each step keeps 98% of the parts it receives." },
        { at: 1, label: "10 steps", caption: "Ten steps in a row keep 0.98 to the 10th, about 82%." },
        { at: 3.4, label: "40 steps", caption: "Every step is 98%, but the yield multiplies: 10 steps ship about 82%, 40 steps under half." },
      ]}
    >
      {({ t }) => {
        const ten = op(seg(t, 1, 1.5));
        const forty = op(seg(t, 3.4, 3.9));
        return (
          <>
            <Axes box={b} xLabel="steps" yLabel="first-pass yield, %" />
            <Guide x1={b.px(0)} y1={b.py(98)} x2={b.px(45)} y2={b.py(98)} />
            <Label x={b.px(44)} y={b.py(98) - 14} anchor="end" tone="muted" size={15}>each step 98%</Label>
            <path d={b.path(partial(pts, drawn(t)))} fill="none" stroke={C.accent} strokeWidth={3} />
            <Guide x1={b.px(10)} y1={b.py(82)} x2={b.px(10)} y2={b.py(0)} opacity={ten} />
            <Guide x1={b.px(40)} y1={b.py(45)} x2={b.px(40)} y2={b.py(0)} opacity={forty} />
            <Guide x1={b.px(0)} y1={b.py(45)} x2={b.px(40)} y2={b.py(45)} opacity={forty} />
            <Tick x={b.px(10)} y={b.py(0)} dir="x" label="10" opacity={ten} />
            <Tick x={b.px(40)} y={b.py(0)} dir="x" label="40" opacity={forty} />
            <Tick x={b.px(0)} y={b.py(45)} dir="y" label="45%" opacity={forty} />
            <Tick x={b.px(0)} y={b.py(82)} dir="y" label="82%" opacity={ten} />
            <Dot x={b.px(10)} y={b.py(81.7)} opacity={ten} />
            <Dot x={b.px(40)} y={b.py(44.6)} opacity={forty} />
            <Label x={b.px(40)} y={b.py(45) - 22} serif size={17} opacity={forty}>0.98⁴⁰</Label>
            <Label x={b.px(9)} y={b.py(82) + 22} anchor="end" serif size={17} opacity={ten}>0.98¹⁰</Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** Layers: road strength vs bond strength. */
function Layers() {
  const L = 150;
  const R = 330;
  const T = 90;
  const n = 6;
  const h = 20;
  const weak = 3;
  // Printed from the bottom up: the first layer is down at the start, the rest follow.
  const layerAt = (i: number) => 0.3 + 0.22 * (n - 2 - i);
  return (
    <AnimatedFigure
      height={290}
      duration={4.4}
      alt="Side view of a printed stack of layers: a pull along the roads is labelled 40 MPa, a peel pulling layers apart is labelled 40 / 2 = 20 MPa at the seam."
      steps={[
        { at: 0, label: "Print", caption: "Printed plastic is a stack: roads of plastic, each layer bonded to the one below." },
        { at: 1.7, label: "Along", caption: "Pulled along the roads, the part has the plastic's own 40 MPa." },
        {
          at: 2.9,
          label: "Peel",
          caption: "Same plastic, two directions: along a road it is 40 MPa, but a peel only fights the bond, 40 / 2 = 20 MPa.",
        },
      ]}
    >
      {({ t }) => {
        const along = seg(t, 1.8, 2.4);
        const peel = seg(t, 3.1, 3.7);
        const bond = op(seg(t, 2.9, 3.4));
        return (
          <>
            {Array.from({ length: n }, (_, i) => {
              const p = i === n - 1 ? 1 : seg(t, layerAt(i), layerAt(i) + 0.4);
              return (
                <rect
                  key={i}
                  x={L}
                  y={T + i * h - lerp(8, 0, p)}
                  width={R - L}
                  height={h - 2}
                  rx={9}
                  fill={C.soft}
                  stroke={C.ink}
                  strokeWidth={1.5}
                  opacity={op(p)}
                />
              );
            })}
            <line x1={L - 6} y1={T + weak * h - 1} x2={R + 6} y2={T + weak * h - 1} stroke={C.alarm} strokeWidth={2.5} strokeDasharray="6 4" opacity={bond} />
            <GrowArrow p={along} x1={L - 4} y1={T + 50} x2={L - 70} y2={T + 50} tone="ink" width={3} />
            <GrowArrow p={along} x1={R + 4} y1={T + 50} x2={R + 70} y2={T + 50} tone="ink" width={3} />
            <Label x={R + 10} y={T + 76} anchor="start" size={15} opacity={op(seg(t, 2.1, 2.6))}>along: 40 MPa</Label>
            <GrowArrow p={peel} x1={240} y1={T - 4} x2={240} y2={T - 52} tone="alarm" width={3} />
            <GrowArrow p={peel} x1={240} y1={T + n * h + 2} x2={240} y2={T + n * h + 50} tone="alarm" width={3} />
            <Label x={254} y={T - 36} anchor="start" tone="alarm" weight={700} size={15} opacity={op(seg(t, 3.4, 3.9))}>
              peel: 40 / 2 = 20 MPa
            </Label>
            <Label x={L - 10} y={T + weak * h + 22} anchor="end" tone="alarm" size={15} opacity={bond}>weak bond</Label>
            <Label x={L - 12} y={T + n * h + 30} anchor="end" tone="muted" size={15} opacity={op(seg(t, 0.6, 1.1))}>printed layers</Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/* ---------- manufacturing-401 ---------- */

/** Bottleneck: three rows of stations; the longest box sets the rate. */
function Bottleneck() {
  const k = 3.5;
  const rows = [
    { y: 44, t: [20, 45, 30], rate: "80 / h", note: "as built" },
    { y: 132, t: [10, 45, 30], rate: "80 / h", note: "station 1 → 10 s" },
    { y: 220, t: [20, 25, 30], rate: "120 / h", note: "station 2 → 25 s" },
  ];
  const built = rows[0].t;
  // Each row appears as built, then its one station is cut (row 0 has no cut); its rate shows once the cut is done.
  const showAt = [0.3, 1.4, 3];
  const cutAt = [0, 2, 3.6];
  const cut = (t: number, r: number) => (r === 0 ? 1 : seg(t, cutAt[r], cutAt[r] + 0.8));
  /** Station times of row r at time t, going from the built line to the row's change. */
  const times = (t: number, r: number) => built.map((b, i) => lerp(b, rows[r].t[i], cut(t, r)));
  return (
    <AnimatedFigure
      height={280}
      duration={5.2}
      alt="Three rows of three stations drawn to length by cycle time: 20, 45, 30 s makes 80 per hour; cutting station 1 to 10 s still makes 80; cutting station 2 to 25 s makes 120 with station 3 now the slow one."
      steps={[
        { at: 0, label: "As built", caption: "Three stations at 20 s, 45 s and 30 s: the 45 s one sets the pace, 3600 / 45 = 80 parts an hour." },
        { at: 1.4, label: "Station 1", caption: "Cut the 20 s station to 10 s and you still make 80: it was already waiting on the 45 s one." },
        { at: 3, label: "Station 2", caption: "Cut the 45 s station to 25 s instead, and the 30 s station becomes the slow one." },
        {
          at: 4.4,
          label: "Rate",
          caption: "The longest box sets the pace: speed an idle station and nothing moves; speed the 45 s one and the rate finally rises.",
        },
      ]}
      readouts={(t) => {
        const r = showAt.filter((a) => t >= a).length - 1; // the row being worked on
        const slowest = Math.max(...times(t, Math.max(0, r)));
        return [
          { label: "slowest", value: `${Math.round(slowest)} s` },
          { label: "rate", value: `${Math.round(3600 / slowest)} / h`, tone: "accent" },
        ];
      }}
    >
      {({ t }) => (
        <>
          {rows.map((r, ri) => {
            const cur = times(t, ri);
            const q = cut(t, ri);
            const max = Math.max(...cur);
            const shown = op(seg(t, showAt[ri], showAt[ri] + 0.5));
            let x = 20;
            return (
              <g key={r.note}>
                <Label x={20} y={r.y - 16} anchor="start" size={15} tone="muted" opacity={shown}>{r.note}</Label>
                {cur.map((c, i) => {
                  const w = c * k;
                  const changed = built[i] !== r.t[i];
                  // A cut station's number fades out, and back in as the new time.
                  const label = `${changed && q < 0.5 ? built[i] : r.t[i]} s`;
                  const lab = changed ? op(Math.abs(2 * q - 1)) : undefined;
                  const g = (
                    <g key={i} opacity={shown}>
                      <rect x={x} y={r.y} width={w} height={36} rx={4} fill={c === max ? C.accent : C.soft} stroke={C.ink} strokeWidth={1.5} />
                      {c === max ? (
                        <OnAccent x={x + w / 2} y={r.y + 18} opacity={lab}>{label}</OnAccent>
                      ) : (
                        <Label x={x + w / 2} y={r.y + 18} size={15} opacity={lab}>{label}</Label>
                      )}
                    </g>
                  );
                  x += w + 8;
                  return g;
                })}
                <Label
                  x={470}
                  y={r.y + 18}
                  anchor="end"
                  weight={700}
                  tone={r.rate === "120 / h" ? "accent" : "ink"}
                  opacity={op(ri === 0 ? seg(t, 0.9, 1.3) : seg(t, cutAt[ri] + 0.8, cutAt[ri] + 1.2))}
                >
                  {r.rate}
                </Label>
              </g>
            );
          })}
        </>
      )}
    </AnimatedFigure>
  );
}

/** Piece cost: 6.40 + 8000/N on a log quantity axis. */
function PieceCost() {
  const b = plotBox({ x: 70, y: 40, w: 350, h: 190, xMin: 2, xMax: 4.8, yMin: 0, yMax: 100 });
  const cost = (n: number) => 6.4 + 8000 / n;
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= 80; i++) {
    const lg = 2 + (2.15 * i) / 80;
    pts.push([lg, cost(10 ** lg)]);
  }
  // The batch grows at a steady log rate, a decade a second: the curve is drawn out to its end and the dot stops at 10000.
  const drawn = (t: number) => clamp((t - 1.9) / 2.15);
  const batchLg = (t: number) => Math.min(lerp(2, 4.15, drawn(t)), 4);
  return (
    <AnimatedFigure
      height={290}
      duration={5}
      alt="Unit cost against batch size on a log scale: 86.40 at 100 parts falling toward the 6.40 floor of material and cycle time, reaching 7.20 at 10000 parts."
      steps={[
        { at: 0, label: "Floor", caption: "Material 4 and 2.40 of cycle time are on every part: 6.40 that never moves." },
        { at: 1, label: "100 parts", caption: "At 100 parts the 8000 die adds 80 to each one, so a part costs 86.40." },
        { at: 1.8, label: "More parts", caption: "Make more parts and the same 8000 die is divided over all of them." },
        {
          at: 3.9,
          label: "10000 parts",
          caption: "The 8000 die is shared by the batch: 80 a part at 100, 0.80 at 10000, while the 6.40 of material and minutes never moves.",
        },
      ]}
      readouts={(t) => {
        const n = 10 ** batchLg(t);
        return [
          { label: "N", value: `${Math.round(n)}` },
          { label: "8000 / N", value: (8000 / n).toFixed(2) },
          { label: "unit cost", value: cost(n).toFixed(2), tone: "accent" },
        ];
      }}
    >
      {({ t }) => {
        const floor = op(seg(t, 0.3, 0.8));
        const first = op(seg(t, 1.1, 1.6));
        const lg = batchLg(t);
        return (
          <>
            <Axes box={b} xLabel="batch size" yLabel="unit cost" />
            <Guide x1={b.px(2)} y1={b.py(6.4)} x2={b.px(4.8)} y2={b.py(6.4)} opacity={floor} />
            <Label x={b.px(4.32)} y={b.py(38)} tone="muted" size={15} opacity={floor}>material +</Label>
            <Label x={b.px(4.32)} y={b.py(28)} tone="muted" size={15} opacity={floor}>minutes 6.40</Label>
            <Arrow x1={b.px(4.32)} y1={b.py(22)} x2={b.px(4.32)} y2={b.py(6.4) - 3} tone="muted" width={1.5} opacity={floor} />
            <path d={b.path(partial(pts, drawn(t)))} fill="none" stroke={C.accent} strokeWidth={3} />
            <Tick x={b.px(2)} y={b.py(0)} dir="x" label="100" />
            <Tick x={b.px(3)} y={b.py(0)} dir="x" label="1000" />
            <Tick x={b.px(4)} y={b.py(0)} dir="x" label="10000" />
            <Dot x={b.px(2)} y={b.py(86.4)} opacity={first} />
            <Dot x={b.px(lg)} y={b.py(lg >= 4 ? 7.2 : cost(10 ** lg))} opacity={first} />
            <Label x={b.px(2) + 14} y={b.py(86.4)} anchor="start" weight={700} opacity={first}>86.40</Label>
            <Label x={b.px(4) - 8} y={b.py(7.2) - 24} anchor="end" weight={700} opacity={op(seg(t, 3.9, 4.4))}>7.20</Label>
            <Label x={b.px(3.3)} y={b.py(62)} serif size={17} opacity={op(seg(t, 4.1, 4.6))}>6.40 + 8000 / N</Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** DFA: handling time by part count. */
function Dfa() {
  const k = 6;
  const x0 = 40;
  const rate = 40; // assembly seconds drawn per second of animation
  /** Seconds of assembly done on a bar that starts at `at` and totals `total` s. */
  const done = (t: number, at: number, total: number) => total * clamp((t - at) / (total / rate));
  /** Fades in as the bar reaches `s` seconds. */
  const reached = (t: number, at: number, s: number) => op(seg(t, at + s / rate - 0.1, at + s / rate + 0.3));
  const row = (y: number, parts: number, total: number, t: number, at: number, named: number | undefined) => {
    const extras = parts - 1;
    const s = done(t, at, total);
    return (
      <g>
        <Label x={x0} y={y - 16} anchor="start" size={15} tone="muted" opacity={named}>{`${parts} parts`}</Label>
        {s > 0 ? <rect x={x0} y={y} width={clamp(s, 0, 20) * k} height={34} fill={C.soft} stroke={C.ink} strokeWidth={1.5} /> : null}
        <Label x={x0 + 10 * k} y={y + 17} size={15} opacity={reached(t, at, 20)}>20 s base</Label>
        {Array.from({ length: extras }, (_, i) => (
          <g key={i}>
            {s > 20 + 8 * i ? (
              <rect x={x0 + 20 * k + i * 8 * k} y={y} width={clamp(s - 20 - 8 * i, 0, 8) * k} height={34} fill={C.accent} stroke={C.ink} strokeWidth={1.5} />
            ) : null}
            <OnAccent x={x0 + 20 * k + i * 8 * k + 4 * k} y={y + 17} opacity={reached(t, at, 28 + 8 * i)}>8</OnAccent>
          </g>
        ))}
        <Label x={x0 + total * k + 10} y={y + 17} anchor="start" weight={700} opacity={reached(t, at, total)}>{`${total} s`}</Label>
      </g>
    );
  };
  return (
    <AnimatedFigure
      height={230}
      duration={5}
      alt="Two time bars: six parts take a 20 s base plus five 8 s handlings, 60 s; three parts take 20 s plus two handlings, 36 s, saving 16 s."
      steps={[
        { at: 0, label: "6 parts", caption: "Six parts take 20 + 5 × 8 = 60 s: a 20 s base, then 8 s to handle each extra part." },
        { at: 2.5, label: "3 parts", caption: "Three parts take 20 + 2 × 8 = 36 s." },
        {
          at: 3.8,
          label: "Delete",
          caption: "Each part you delete is one 8 s handling you no longer do, but only if the joint still holds without it.",
        },
      ]}
      readouts={(t) => [
        { label: "6 parts", value: `${Math.round(done(t, 0.4, 60))} s` },
        { label: "3 parts", value: `${Math.round(done(t, 2.6, 36))} s`, tone: "accent" },
      ]}
    >
      {({ t }) => (
        <>
          {row(50, 6, 60, t, 0.4, undefined)}
          {row(140, 3, 36, t, 2.6, op(seg(t, 2.3, 2.8)))}
          <rect
            x={x0 + 36 * k}
            y={140}
            width={24 * k}
            height={34}
            fill="none"
            stroke={C.muted}
            strokeWidth={1.5}
            strokeDasharray="5 4"
            opacity={op(seg(t, 3.8, 4.3))}
          />
          <g opacity={op(seg(t, 4.1, 4.6))}>
            <DimH x1={x0 + 36 * k} x2={x0 + 60 * k} y={206} label="16 s saved" tone="accent" />
          </g>
        </>
      )}
    </AnimatedFigure>
  );
}

/** Scrap: the good parts carry the bad ones. */
function Scrap() {
  const w = 36;
  const gap = 6;
  const x0 = 30;
  const madeAt = (i: number) => 0.3 + 0.12 * i; // processed one after another
  const scrapAt = 2; // then two of them are thrown away
  const made = (t: number) => Array.from({ length: 10 }, (_, i) => i).filter((i) => t >= madeAt(i) + 0.2).length;
  /** The X over a scrapped part, stroke by stroke (q 0–1). */
  const cross = (x: number, q: number) => {
    const a = clamp(q * 2);
    const b = clamp(q * 2 - 1);
    const first = `M${x + 8},${68} L${lerp(x + 8, x + w - 8, a)},${lerp(68, 60 + w - 8, a)}`;
    return b > 0 ? `${first} M${x + w - 8},${68} L${lerp(x + w - 8, x + 8, b)},${lerp(68, 60 + w - 8, b)}` : first;
  };
  return (
    <AnimatedFigure
      height={260}
      duration={5.2}
      alt="Ten parts that each cost 10 to process, two of them scrapped; the 100 spent is carried by the eight good parts at 12.50 each, not 8."
      steps={[
        { at: 0, label: "Process", caption: "Every part costs 10 to process: ten parts, 100 spent." },
        { at: 2, label: "Scrap", caption: "At 80% yield, 2 of the 10 are thrown away, after they were already processed." },
        { at: 3.2, label: "Divide", caption: "Every part was processed, so the 8 good ones carry all 100: divide by yield, 10 / 0.80 = 12.50." },
      ]}
      readouts={(t) => {
        const n = made(t);
        const good = n - (t >= scrapAt ? 2 : 0);
        return [
          { label: "spent", value: `${10 * n}` },
          { label: "good parts", value: `${good}` },
          { label: "per good part", value: good ? ((10 * n) / good).toFixed(2) : "–", tone: "accent" },
        ];
      }}
    >
      {({ t }) => (
        <>
          {Array.from({ length: 10 }, (_, i) => {
            const x = x0 + i * (w + gap);
            const q = i >= 8 ? seg(t, scrapAt, scrapAt + 0.6) : 0;
            const bad = q > 0;
            const shown = op(seg(t, madeAt(i), madeAt(i) + 0.4));
            return (
              <g key={i}>
                <rect x={x} y={60} width={w} height={w} rx={4} fill={bad ? C.surface : C.soft} stroke={bad ? C.alarm : C.ink} strokeWidth={2} opacity={shown} />
                {bad && <path d={cross(x, q)} stroke={C.alarm} strokeWidth={2.5} />}
                <Label x={x + w / 2} y={44} size={15} tone="muted" opacity={shown}>10</Label>
              </g>
            );
          })}
          <Label x={x0 + 4 * (w + gap) - gap / 2} y={120} size={15} opacity={op(seg(t, 2.5, 3))}>8 good ship</Label>
          <Label x={x0 + 9 * (w + gap) - gap / 2} y={120} size={15} tone="alarm" opacity={op(seg(t, 2.5, 3))}>2 scrap</Label>
          <Label x={240} y={16} tone="muted" size={15} opacity={op(seg(t, 1.4, 1.9))}>each part costs 10 to process: 100 spent</Label>
          <Label x={240} y={168} serif size={19} tone="accent" weight={600} opacity={op(seg(t, 3.2, 3.7))}>100 / 8 = 10 / 0.80 = 12.50</Label>
          <Label x={240} y={210} size={15} tone="alarm" opacity={op(seg(t, 3.8, 4.3))}>not 10 − 2 = 8</Label>
          {t >= 4.1 ? <line x1={180} y1={211} x2={lerp(180, 300, seg(t, 4.1, 4.5))} y2={211} stroke={C.alarm} strokeWidth={2} /> : null}
          <Label x={240} y={240} size={15} tone="muted" opacity={op(seg(t, 4.4, 4.9))}>at 95% yield: 10 / 0.95 ≈ 10.53</Label>
        </>
      )}
    </AnimatedFigure>
  );
}

/** Takt: the demand's pace vs the station's 4 min cycle. */
function Takt() {
  const x0 = 40;
  const k = 40; // px per minute
  // Each demand in turn: its takt window opens, then the 4 min station runs against it at 5 min per second.
  const work = (t: number, at: number, min: number) => clamp((t - at) / (min / 5));
  return (
    <AnimatedFigure
      height={270}
      duration={5.2}
      alt="Two timelines: owing 50 parts, takt is 8 minutes and the 4 minute station leaves 4 minutes of slack; owing 200, takt is 2 minutes and the station runs 2 minutes late on every part."
      steps={[
        {
          at: 0,
          label: "50 parts",
          caption: "Owing 50 parts in 400 minutes, takt is 400 / 50 = 8 minutes, so the 4 minute station has 4 minutes of slack.",
        },
        { at: 2.6, label: "200 parts", caption: "Owing 200 parts in the same shift, takt is 2 minutes, and every part is 2 minutes late." },
        { at: 4.3, label: "Compare", caption: "Takt is 400 min divided by demand; the station's 4 min is early against 8, late against 2." },
      ]}
    >
      {({ t }) => {
        const inside = work(t, 3.5, 2); // the first 2 min of the station fit the 2 min takt
        const late = work(t, 3.9, 2); // the other 2 run late
        return (
          <>
            <Label x={x0} y={30} anchor="start" size={15} tone="muted" opacity={op(seg(t, 0.3, 0.8))}>50 parts: takt 400 / 50 = 8 min</Label>
            <rect
              x={x0}
              y={50}
              width={lerp(0, 8 * k, seg(t, 0.5, 1.2))}
              height={36}
              fill="none"
              stroke={C.ink}
              strokeWidth={2}
              strokeDasharray="6 4"
            />
            <rect x={x0} y={56} width={4 * k * work(t, 1.4, 4)} height={24} rx={3} fill={C.accent} />
            <OnAccent x={x0 + 2 * k} y={68} opacity={op(seg(t, 2, 2.4))}>station 4 min</OnAccent>
            <Label x={x0 + 6 * k} y={68} size={15} tone="accent" weight={700} opacity={op(seg(t, 2.2, 2.7))}>4 min slack</Label>
            <Label x={x0 + 8 * k + 8} y={68} anchor="start" size={15} tone="muted" opacity={op(seg(t, 1, 1.4))}>8</Label>

            <Label x={x0} y={150} anchor="start" size={15} tone="muted" opacity={op(seg(t, 2.7, 3.2))}>
              200 parts: takt 400 / 200 = 2 min
            </Label>
            <rect
              x={x0}
              y={170}
              width={lerp(0, 2 * k, seg(t, 2.9, 3.4))}
              height={36}
              fill="none"
              stroke={C.ink}
              strokeWidth={2}
              strokeDasharray="6 4"
            />
            <rect x={x0} y={176} width={2 * k * inside} height={24} rx={3} fill={C.accent} />
            <rect x={x0 + 2 * k} y={176} width={2 * k * late} height={24} rx={3} fill={C.alarm} />
            <OnAccent x={x0 + 1 * k} y={188} opacity={op(seg(t, 3.8, 4.2))}>2</OnAccent>
            <Label x={x0 + 4 * k + 10} y={188} anchor="start" size={15} tone="alarm" weight={700} opacity={op(seg(t, 4.3, 4.8))}>
              2 min late, every part
            </Label>
            <line x1={x0} y1={236} x2={x0 + 8 * k} y2={236} stroke={C.muted} strokeWidth={1.5} />
            {[0, 2, 4, 6, 8].map((m) => (
              <g key={m}>
                <line x1={x0 + m * k} y1={231} x2={x0 + m * k} y2={241} stroke={C.muted} strokeWidth={1.5} />
                <Label x={x0 + m * k} y={256} size={15} tone="muted">{`${m}`}</Label>
              </g>
            ))}
            <Label x={x0 + 8 * k + 12} y={256} anchor="start" size={15} tone="muted">min</Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

export const ladderCFigures: FigureMap = {
  "engineering-401/miner": Miner,
  "engineering-401/thermomech": Thermomech,
  "engineering-401/interval": Interval,
  "engineering-401/review": Review,
  "engineering-401/clocks": Clocks,
  "manufacturing-201/rolling": Rolling,
  "manufacturing-201/taylor": Taylor,
  "manufacturing-201/pattern": Pattern,
  "manufacturing-201/distort": Distort,
  "manufacturing-201/locate": Locate,
  "manufacturing-301/bonus": Bonus,
  "manufacturing-301/surface": Surface,
  "manufacturing-301/travel": Travel,
  "manufacturing-301/passes": Passes,
  "manufacturing-301/layers": Layers,
  "manufacturing-401/bottleneck": Bottleneck,
  "manufacturing-401/piececost": PieceCost,
  "manufacturing-401/dfa": Dfa,
  "manufacturing-401/scrap": Scrap,
  "manufacturing-401/takt": Takt,
};
