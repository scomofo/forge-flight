import type { ReactNode } from "react";
import { Arrow, Axes, C, DimH, Figure, Label, WallV, plotBox, type FigureMap } from "./kit";

/* ---------- local helpers ---------- */

/** Short tick on an axis with a label: dir "x" puts the label below, "y" to the left. */
function Tick({ x, y, dir, label }: { x: number; y: number; dir: "x" | "y"; label: string }) {
  return dir === "x" ? (
    <g>
      <line x1={x} y1={y} x2={x} y2={y + 6} stroke={C.ink} strokeWidth={1.5} />
      <Label x={x} y={y + 18} tone="muted" size={15}>
        {label}
      </Label>
    </g>
  ) : (
    <g>
      <line x1={x - 6} y1={y} x2={x} y2={y} stroke={C.ink} strokeWidth={1.5} />
      <Label x={x - 10} y={y} tone="muted" size={15} anchor="end">
        {label}
      </Label>
    </g>
  );
}

/** Dashed guide line. */
function Guide({ x1, y1, x2, y2, tone = "muted" }: { x1: number; y1: number; x2: number; y2: number; tone?: "muted" | "alarm" | "accent" }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C[tone]} strokeWidth={1.5} strokeDasharray="5 5" />;
}

/** Label drawn on an accent fill: surface-coloured text for contrast. */
function OnAccent({ x, y, children, size = 15 }: { x: number; y: number; children: ReactNode; size?: number }) {
  return (
    <text x={x} y={y} fill={C.surface} textAnchor="middle" fontSize={size} fontWeight={600} dominantBaseline="middle">
      {children}
    </text>
  );
}

function Dot({ x, y, tone = "accent", r = 6 }: { x: number; y: number; tone?: "accent" | "ink" | "alarm"; r?: number }) {
  return <circle cx={x} cy={y} r={r} fill={C[tone]} stroke={C.surface} strokeWidth={2} />;
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
  let acc = 0;
  return (
    <Figure
      height={270}
      alt="Three bars show the mild, middle and severe blocks each spending 0.20, 0.20 and 0.70 of their own life, all under 1, and a stacked bar adds them to 1.10, past the line at 1."
      caption="No block reached its own life, yet the fractions add to 1.10: the sum crossed 1 first."
    >
      <Label x={130} y={base - s - 20} tone="muted" size={15}>
        each block's own life = 1
      </Label>
      {blocks.map((b, i) => {
        const x = 40 + i * 64;
        return (
          <g key={b.name}>
            <rect x={x} y={base - s} width={44} height={s} fill="none" stroke={C.muted} strokeWidth={1.5} strokeDasharray="5 4" />
            <rect
              x={x}
              y={base - b.f * s}
              width={44}
              height={b.f * s}
              fill={i === 2 ? C.accent : C.soft}
              stroke={C.ink}
              strokeWidth={1.5}
            />
            <Label x={x + 22} y={base - b.f * s - 12} size={15}>
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
        const y0 = base - (acc + b.f) * s;
        const h = b.f * s;
        acc += b.f;
        return (
          <g key={`s${b.name}`}>
            <rect x={stackX} y={y0} width={60} height={h} fill={i === 2 ? C.accent : C.soft} stroke={C.ink} strokeWidth={1.5} />
            {i === 2 ? (
              <OnAccent x={stackX + 30} y={y0 + h / 2}>{b.f.toFixed(2)}</OnAccent>
            ) : (
              <Label x={stackX + 30} y={y0 + h / 2} size={15}>
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
      <Label x={stackX + 30} y={base - 1.1 * s - 16} tone="accent" weight={700} size={18}>
        Σ n/N = 1.10
      </Label>
      <line x1={310} y1={base} x2={470} y2={base} stroke={C.ink} strokeWidth={1.5} />
      <line x1={30} y1={base} x2={230} y2={base} stroke={C.ink} strokeWidth={1.5} />
    </Figure>
  );
}

/** Thermomech: +40 mechanical, −96 thermal, net −56 on a stress line. */
function Thermomech() {
  const x0 = 290;
  const k = 2.3; // px per MPa
  const X = (s: number) => x0 + s * k;
  const ax = 232;
  return (
    <Figure
      height={300}
      alt="A steel bar held between two walls, and a stress number line where a +40 MPa tension arrow is followed by a −96 MPa thermal arrow, landing at a net −56 MPa compression."
      caption="Heating a held bar adds compression; the 96 MPa thermal term outweighs the 40 MPa load, so the net flips to 56 MPa compression."
    >
      <WallV x={60} y={20} h={56} side="left" />
      <WallV x={420} y={20} h={56} side="right" />
      <rect x={60} y={34} width={360} height={28} fill={C.soft} stroke={C.ink} strokeWidth={2} />
      <Label x={240} y={48} size={15}>ends held, heated 40°</Label>
      <Arrow x1={66} y1={92} x2={102} y2={92} tone="alarm" width={2.5} />
      <Arrow x1={414} y1={92} x2={378} y2={92} tone="alarm" width={2.5} />
      <Label x={240} y={92} tone="alarm" size={15}>wants to grow, walls push back</Label>

      <Arrow x1={X(0)} y1={140} x2={X(40)} y2={140} tone="ink" width={3} />
      <Label x={X(20)} y={124} size={15}>+40 load</Label>
      <Arrow x1={X(40)} y1={182} x2={X(-56)} y2={182} tone="alarm" width={3} />
      <Label x={X(-44)} y={166} tone="alarm" size={15}>−96 thermal (E α ΔT)</Label>
      <Guide x1={X(0)} y1={130} x2={X(0)} y2={ax} />
      <Guide x1={X(40)} y1={130} x2={X(40)} y2={192} />
      <Guide x1={X(-56)} y1={182} x2={X(-56)} y2={ax} tone="accent" />

      <line x1={X(-110)} y1={ax} x2={X(70)} y2={ax} stroke={C.ink} strokeWidth={1.5} />
      {[-100, -50, 0, 50].map((v) => (
        <line key={v} x1={X(v)} y1={ax - 5} x2={X(v)} y2={ax + 5} stroke={C.ink} strokeWidth={1.5} />
      ))}
      <Label x={X(0)} y={ax + 18} tone="muted" size={15}>0</Label>
      <Dot x={X(-56)} y={ax} />
      <Label x={X(-56)} y={ax + 20} tone="accent" weight={700}>net −56 MPa</Label>
      <Label x={X(-110)} y={ax + 50} anchor="start" tone="muted" size={15}>← compression</Label>
      <Label x={X(70)} y={ax + 50} anchor="end" tone="muted" size={15}>tension →</Label>
    </Figure>
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
  return (
    <Figure
      height={330}
      alt="Crack length against cycles: the crack crawls for most of its life and then runs to 44 mm; found at 0.5 mm it has 0.86 million cycles left, found at 2 mm only 0.38 million."
      caption="The slow early growth is where the cycles are: a 4× later find costs about half the life, not three quarters."
    >
      <Axes box={b} xLabel="cycles (millions)" yLabel="crack length, mm" />
      <Guide x1={b.px(0)} y1={b.py(ac)} x2={b.px(0.9)} y2={b.py(ac)} tone="alarm" />
      <Label x={b.px(0.02)} y={b.py(ac) + 14} anchor="start" tone="alarm" size={15}>
        critical ≈ 44 mm
      </Label>
      <path d={b.path(pts)} fill="none" stroke={C.accent} strokeWidth={3} />
      <Dot x={b.px(0)} y={b.py(a0)} />
      <Dot x={b.px(n2)} y={b.py(2)} tone="ink" />
      <Guide x1={b.px(n2)} y1={b.py(2)} x2={b.px(n2)} y2={b.py(14)} />
      <Label x={b.px(n2)} y={b.py(14) - 12} size={15}>2 mm find</Label>
      <Label x={b.px(0.02)} y={b.py(6)} anchor="start" size={15}>0.5 mm find</Label>
      <DimH x1={b.px(0)} x2={b.px(life)} y={268} label="from 0.5 mm: 0.86 M cycles" tone="accent" />
      <DimH x1={b.px(n2)} x2={b.px(life)} y={312} label="from 2 mm: 0.38 M" tone="ink" />
    </Figure>
  );
}

/** Review: four parts, four mechanisms. */
function Review() {
  const cell = (x: number, y: number, icon: ReactNode, mode: string, cue: string) => (
    <g transform={`translate(${x},${y})`}>
      <rect x={0} y={0} width={228} height={112} rx={6} fill="none" stroke={C.line} strokeWidth={1.5} />
      {icon}
      <Label x={104} y={42} anchor="start" tone="accent" weight={700} size={18}>
        {mode}
      </Label>
      <Label x={104} y={70} anchor="start" tone="muted" size={15}>
        {cue}
      </Label>
    </g>
  );
  return (
    <Figure
      height={250}
      alt="Four panels: a long thin strut pushed on its end labelled buckling, a spinning stepped shaft labelled fatigue, a cracked shell labelled fracture, and a hot hanger labelled creep."
      caption="Say the sentence first: the service condition picks the chapter, then you calculate that one."
    >
      {cell(
        8,
        10,
        <g>
          <Arrow x1={48} y1={6} x2={48} y2={24} tone="ink" width={2.5} />
          <line x1={48} y1={26} x2={48} y2={102} stroke={C.ink} strokeWidth={3} />
          <path d="M48,26 Q72,64 48,102" fill="none" stroke={C.accent} strokeWidth={2} strokeDasharray="5 4" />
          <line x1={34} y1={104} x2={62} y2={104} stroke={C.ink} strokeWidth={2.5} />
        </g>,
        "buckling",
        "long, thin, pushed",
      )}
      {cell(
        244,
        10,
        <g>
          <rect x={14} y={38} width={44} height={38} fill={C.soft} stroke={C.ink} strokeWidth={2} />
          <rect x={58} y={46} width={34} height={22} fill={C.soft} stroke={C.ink} strokeWidth={2} />
          <line x1={58} y1={46} x2={63} y2={53} stroke={C.alarm} strokeWidth={2.5} />
          <path d="M22,28 A30,10 0 0 1 82,32" fill="none" stroke={C.accent} strokeWidth={2} markerEnd="url(#fig-arrow-accent)" />
        </g>,
        "fatigue",
        "shoulder, spinning",
      )}
      {cell(
        8,
        128,
        <g>
          <circle cx={50} cy={56} r={36} fill={C.soft} stroke={C.ink} strokeWidth={4} />
          <line x1={33} y1={24} x2={40} y2={36} stroke={C.alarm} strokeWidth={3} />
          <line x1={40} y1={36} x2={36} y2={42} stroke={C.alarm} strokeWidth={2} />
        </g>,
        "fracture",
        "crack present",
      )}
      {cell(
        244,
        128,
        <g>
          <line x1={20} y1={14} x2={82} y2={14} stroke={C.ink} strokeWidth={3} />
          <line x1={51} y1={14} x2={51} y2={66} stroke={C.ink} strokeWidth={2.5} />
          <rect x={36} y={66} width={30} height={26} fill={C.soft} stroke={C.ink} strokeWidth={2} />
          <path d="M20,40 q5,-6 0,-12 M84,40 q5,-6 0,-12" fill="none" stroke={C.alarm} strokeWidth={2} />
          <Arrow x1={51} y1={96} x2={51} y2={108} tone="accent" width={2} />
        </g>,
        "creep",
        "hot for a year",
      )}
    </Figure>
  );
}

/** Clocks: fatigue and creep fractions on one life. */
function Clocks() {
  const r = 54;
  const dial = (cx: number, f: number, name: string) => {
    const cy = 100;
    const [ex, ey] = dialPt(cx, cy, r, f);
    const [nx, ny] = dialPt(cx, cy, r - 12, f);
    return (
      <g>
        <path d={`M${cx - r},${cy} A${r},${r} 0 0 1 ${cx + r},${cy}`} fill="none" stroke={C.line} strokeWidth={10} />
        <path d={`M${cx - r},${cy} A${r},${r} 0 0 1 ${ex.toFixed(1)},${ey.toFixed(1)}`} fill="none" stroke={C.accent} strokeWidth={10} />
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={C.ink} strokeWidth={2.5} />
        <circle cx={cx} cy={cy} r={4} fill={C.ink} />
        <Label x={cx - r} y={cy + 16} tone="muted" size={15}>0</Label>
        <Label x={cx + r} y={cy + 16} tone="muted" size={15}>1</Label>
        <Label x={cx} y={cy + 20} weight={700}>{f.toFixed(2)}</Label>
        <Label x={cx} y={cy + 44} tone="muted" size={15}>{name}</Label>
      </g>
    );
  };
  const x0 = 40;
  const s = 300;
  const by = 214;
  return (
    <Figure
      height={270}
      alt="Two dials show 0.40 of the fatigue life and 0.70 of the creep-rupture life, each under 1; a bar below adds them to 1.10, past the retire line at 1."
      caption="Each clock alone says there is life left; on the one shared life they add to 1.10, so the part retires."
    >
      {dial(120, 0.4, "fatigue n/N")}
      <Label x={240} y={80} size={24} tone="muted">+</Label>
      {dial(360, 0.7, "creep t/t_r")}
      <rect x={x0} y={by} width={0.4 * s} height={26} fill={C.soft} stroke={C.ink} strokeWidth={1.5} />
      <Label x={x0 + 0.2 * s} y={by + 13} size={15}>0.40</Label>
      <rect x={x0 + 0.4 * s} y={by} width={0.7 * s} height={26} fill={C.accent} stroke={C.ink} strokeWidth={1.5} />
      <OnAccent x={x0 + 0.75 * s} y={by + 13}>0.70</OnAccent>
      <line x1={x0 + s} y1={by - 20} x2={x0 + s} y2={by + 40} stroke={C.alarm} strokeWidth={2} strokeDasharray="6 4" />
      <Label x={x0 + s} y={by - 30} tone="alarm" size={15}>1: retire</Label>
      <Label x={x0 + 1.1 * s + 8} y={by + 13} anchor="start" tone="accent" weight={700}>1.10</Label>
    </Figure>
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
  return (
    <Figure
      height={290}
      alt="Rolling force against draft rises as a square-root curve through 520 kN at a 2 mm draft and 820 kN at 5 mm, well below a dashed straight line drawn in proportion."
      caption="The draft went from 2 to 5 mm, but the force only follows the contact length √(R Δh): 520 kN to 820, not in proportion."
    >
      <Axes box={b} xLabel="draft Δh, mm" yLabel="force, kN" />
      <path d={b.path([[0, 0], [1000 / slope, 1000]])} fill="none" stroke={C.muted} strokeWidth={2} strokeDasharray="6 5" />
      <Label x={b.px(1000 / slope) + 8} y={b.py(985)} anchor="start" tone="muted" size={15}>in proportion</Label>
      <path d={b.path(pts)} fill="none" stroke={C.accent} strokeWidth={3} />
      <Guide x1={b.px(0)} y1={b.py(F(2))} x2={b.px(2)} y2={b.py(F(2))} />
      <Guide x1={b.px(2)} y1={b.py(F(2))} x2={b.px(2)} y2={b.py(0)} />
      <Guide x1={b.px(0)} y1={b.py(F(5))} x2={b.px(5)} y2={b.py(F(5))} />
      <Guide x1={b.px(5)} y1={b.py(F(5))} x2={b.px(5)} y2={b.py(0)} />
      <Tick x={b.px(0)} y={b.py(520)} dir="y" label="520" />
      <Tick x={b.px(0)} y={b.py(820)} dir="y" label="820" />
      <Tick x={b.px(2)} y={b.py(0)} dir="x" label="2" />
      <Tick x={b.px(5)} y={b.py(0)} dir="x" label="5" />
      <Dot x={b.px(2)} y={b.py(F(2))} />
      <Dot x={b.px(5)} y={b.py(F(5))} />
      <Label x={b.px(2) + 12} y={b.py(F(2)) + 20} anchor="start" size={15}>8 mm exit</Label>
      <Label x={b.px(5) + 10} y={b.py(F(5)) + 22} anchor="start" size={15}>5 mm exit</Label>
      <Label x={b.px(6.9)} y={b.py(330)} anchor="end" tone="accent" serif size={18}>L ≈ √(R Δh)</Label>
    </Figure>
  );
}

/** Taylor: life collapses with speed. */
function Taylor() {
  const b = plotBox({ x: 60, y: 40, w: 360, h: 190, xMin: 90, xMax: 200, yMin: 0, yMax: 45 });
  const T = (v: number) => (200 / v) ** 5;
  const pts: Array<[number, number]> = [];
  for (let v = 95; v <= 200; v += 1) pts.push([v, T(v)]);
  return (
    <Figure
      height={290}
      alt="Tool life against cutting speed: a steep curve drops from 32 minutes at 100 m/min to about 4 minutes at 150 m/min."
      caption="Half again the speed, about an eighth of the life: V times T to the 0.2 stays 200 while life falls from 32 min to about 4."
    >
      <Axes box={b} xLabel="speed, m/min" yLabel="tool life, min" />
      <path d={b.path(pts)} fill="none" stroke={C.accent} strokeWidth={3} />
      <Guide x1={b.px(90)} y1={b.py(32)} x2={b.px(100)} y2={b.py(32)} />
      <Guide x1={b.px(100)} y1={b.py(32)} x2={b.px(100)} y2={b.py(0)} />
      <Guide x1={b.px(90)} y1={b.py(T(150))} x2={b.px(150)} y2={b.py(T(150))} />
      <Guide x1={b.px(150)} y1={b.py(T(150))} x2={b.px(150)} y2={b.py(0)} />
      <Tick x={b.px(90)} y={b.py(32)} dir="y" label="32" />
      <Tick x={b.px(90)} y={b.py(T(150))} dir="y" label="4" />
      <Tick x={b.px(100)} y={b.py(0)} dir="x" label="100" />
      <Tick x={b.px(150)} y={b.py(0)} dir="x" label="150" />
      <Dot x={b.px(100)} y={b.py(32)} />
      <Dot x={b.px(150)} y={b.py(T(150))} />
      <Label x={b.px(104)} y={b.py(32)} anchor="start" size={15}>32 min</Label>
      <Label x={b.px(150)} y={b.py(T(150)) - 20} size={15}>about 4 min</Label>
      <text x={b.px(195)} y={b.py(36)} textAnchor="end" fill={C.accent} fontFamily="var(--font-serif, ui-serif, Georgia, serif)" fontSize={18} dominantBaseline="middle">
        V T<tspan dy={-8} fontSize={15}>0.2</tspan>
        <tspan dy={8}> = 200</tspan>
      </text>
    </Figure>
  );
}

/** Pattern: cavity starts bigger than the drawing. */
function Pattern() {
  const pL = 50;
  const pR = 430;
  const shrinkPx = 18; // exaggerated each side
  return (
    <Figure
      height={280}
      alt="A pattern dimensioned 202.6 mm above a shorter cooled casting dimensioned 200 mm, with dashed lines showing the shrink at each end."
      caption="Shrink drawn exaggerated: the pattern is 200 × 1.013 = 202.6 mm so the cold casting lands on the drawing's 200."
    >
      <DimH x1={pL} x2={pR} y={32} label="pattern 202.6 mm" tone="accent" />
      <rect x={pL} y={52} width={pR - pL} height={48} rx={4} fill={C.soft} stroke={C.accent} strokeWidth={2.5} />
      <Guide x1={pL} y1={100} x2={pL} y2={190} />
      <Guide x1={pR} y1={100} x2={pR} y2={190} />
      <Arrow x1={240} y1={110} x2={240} y2={146} tone="muted" width={2} />
      <Label x={252} y={128} anchor="start" tone="muted" size={15}>cools, shrinks 1.3%</Label>
      <rect x={pL + shrinkPx} y={156} width={pR - pL - 2 * shrinkPx} height={48} rx={4} fill={C.surface} stroke={C.ink} strokeWidth={2.5} />
      <DimH x1={pL + shrinkPx} x2={pR - shrinkPx} y={236} label="casting 200 mm" />
      <Label x={240} y={266} serif size={17}>200 × (1 + 0.013) = 202.6</Label>
    </Figure>
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
  return (
    <Figure
      height={250}
      alt="Three welded plates: at 100 J/mm and 6 mm the plate bows 3 mm, doubling the heat bows it 6 mm, and doubling the thickness to 12 mm bows it only 0.75 mm."
      caption="Heat enters once, thickness squared: double the heat doubles the bow, double the thickness cuts it by four (bows exaggerated)."
    >
      {cases.map((c, i) => {
        const half = 62;
        const lift = c.bow * k;
        const d = `M${c.x - half},${cy - lift} Q${c.x},${cy + lift} ${c.x + half},${cy - lift}`;
        return (
          <g key={i}>
            <Label x={c.x} y={40} size={15}>{c.heat}</Label>
            <Label x={c.x} y={62} size={15} tone={i === 2 ? "accent" : "ink"}>{`t = ${c.t} mm`}</Label>
            <line x1={c.x - half} y1={cy} x2={c.x + half} y2={cy} stroke={C.line} strokeWidth={1.5} strokeDasharray="4 4" />
            <path d={d} fill="none" stroke={C.ink} strokeWidth={c.t * 0.9} strokeLinecap="butt" />
            <circle cx={c.x} cy={cy - c.t * 0.45 - 1} r={i === 1 ? 7 : 5} fill={C.alarm} />
            <Label x={c.x} y={205} weight={700} tone={i === 0 ? "ink" : "accent"}>{c.lab}</Label>
          </g>
        );
      })}
      <Label x={240} y={236} tone="muted" size={15}>bow ∝ heat / t²</Label>
    </Figure>
  );
}

/** Locate: 3-2-1 in plan view. */
function Locate() {
  const L = 130;
  const R = 390;
  const T = 70;
  const B = 190;
  return (
    <Figure
      height={290}
      alt="Plan view of a block with three base contacts underneath, two pins on the side and one pin on the end, plus a dashed fourth base contact that removes nothing."
      caption="3 on the base, 2 on the side, 1 on the end takes all six motions; a fourth base dot has no seventh motion to take."
    >
      <rect x={L} y={T} width={R - L} height={B - T} fill={C.soft} stroke={C.ink} strokeWidth={2.5} />
      {[
        [175, 100],
        [175, 162],
        [345, 131],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={9} fill={C.surface} stroke={C.accent} strokeWidth={3} />
      ))}
      <Label x={260} y={98} size={15} tone="accent">3 on base (under)</Label>
      <circle cx={262} cy={150} r={9} fill="none" stroke={C.alarm} strokeWidth={2.5} strokeDasharray="4 3" />
      <Label x={262} y={174} size={15} tone="alarm">4th: removes nothing</Label>
      {[175, 345].map((x) => (
        <circle key={x} cx={x} cy={B + 11} r={10} fill={C.accent} />
      ))}
      <Label x={260} y={B + 12} size={15} tone="accent">2 on side</Label>
      <circle cx={L - 11} cy={131} r={10} fill={C.accent} />
      <Label x={L - 26} y={131} anchor="end" size={15} tone="accent">1 on end</Label>
      <Label x={240} y={36} serif size={17}>6 − 3 − 2 − 1 = 0 motions left</Label>
      <Label x={240} y={262} tone="muted" size={15}>block in the vise, seen from above</Label>
    </Figure>
  );
}

/* ---------- manufacturing-301 ---------- */

/** Bonus: allowed position grows with hole size above MMC. */
function Bonus() {
  const b = plotBox({ x: 80, y: 40, w: 340, h: 180, xMin: 9.95, xMax: 10.35, yMin: 0, yMax: 0.5 });
  return (
    <Figure
      height={290}
      alt="Allowed position tolerance against measured hole size: 0.20 mm at the 10.0 mm maximum-material size, rising one-for-one to 0.40 mm at 10.2 mm, the extra 0.20 marked as bonus."
      caption="Every bit of size above the 10.0 mm MMC hole is added to the stated 0.20: a 10.2 mm hole may sit 0.40 off, if the callout is at MMC."
    >
      <Axes box={b} xLabel="hole size, mm" yLabel="position allowed, mm" />
      <Guide x1={b.px(9.95)} y1={b.py(0.2)} x2={b.px(10.35)} y2={b.py(0.2)} />
      <Label x={b.px(10.03)} y={b.py(0.2) + 16} anchor="start" tone="muted" size={15}>stated 0.20</Label>
      <path d={b.path([[10.0, 0.2], [10.2, 0.4]])} fill="none" stroke={C.accent} strokeWidth={3} />
      <Guide x1={b.px(10.0)} y1={b.py(0.2)} x2={b.px(10.0)} y2={b.py(0)} />
      <Guide x1={b.px(10.2)} y1={b.py(0.4)} x2={b.px(10.2)} y2={b.py(0)} />
      <Guide x1={b.px(9.95)} y1={b.py(0.4)} x2={b.px(10.2)} y2={b.py(0.4)} />
      <Tick x={b.px(9.95)} y={b.py(0.2)} dir="y" label="0.20" />
      <Tick x={b.px(9.95)} y={b.py(0.4)} dir="y" label="0.40" />
      <Tick x={b.px(10.0)} y={b.py(0)} dir="x" label="10.0 MMC" />
      <Tick x={b.px(10.2)} y={b.py(0)} dir="x" label="10.2" />
      <Arrow x1={b.px(10.2) + 16} y1={b.py(0.2)} x2={b.px(10.2) + 16} y2={b.py(0.4)} tone="accent" width={2} both />
      <Label x={b.px(10.2) + 26} y={b.py(0.3)} anchor="start" tone="accent" weight={700} size={15}>bonus 0.20</Label>
      <Dot x={b.px(10.0)} y={b.py(0.2)} />
      <Dot x={b.px(10.2)} y={b.py(0.4)} />
    </Figure>
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
  const top = (x: number, y: number, kind: number) => {
    const w = 90;
    if (kind === 0) return `M${x},${y} L${x + w},${y}`;
    let d = `M${x},${y}`;
    const n = kind === 1 ? 9 : 12;
    const amps = kind === 1 ? [4] : [7, 3, 9, 5, 2, 8, 4, 10, 3, 6, 9, 4];
    for (let i = 1; i <= n; i++) {
      const xx = x + (w * i) / n;
      const a = amps[(i - 1) % amps.length];
      d += ` L${(xx - w / n / 2).toFixed(1)},${y - a} L${xx.toFixed(1)},${y}`;
    }
    return d;
  };
  return (
    <Figure
      height={290}
      alt="Three bars of fatigue strength for the same steel: polished 300 MPa, machined 240 MPa, forged 150 MPa, with the top of each bar drawn smooth, grooved and rough."
      caption="Same alloy, different skin: the surface factor multiplies the polished 300 MPa plateau before you claim a fatigue life."
    >
      {bars.map((b) => {
        const y = base - b.v * s;
        return (
          <g key={b.name}>
            <rect x={b.x} y={y} width={90} height={b.v * s} fill={b.rough === 0 ? C.soft : b.rough === 1 ? C.soft : C.soft} stroke="none" />
            <path d={`${top(b.x, y, b.rough)} L${b.x + 90},${base} L${b.x},${base} Z`} fill={C.soft} stroke={C.ink} strokeWidth={2} />
            <Label x={b.x + 45} y={y - 22} weight={700} tone={b.rough === 2 ? "accent" : "ink"}>{`${b.v} MPa`}</Label>
            <Label x={b.x + 45} y={base + 18} size={15}>{b.name}</Label>
            <Label x={b.x + 45} y={base + 40} size={15} tone="muted">{b.f}</Label>
          </g>
        );
      })}
      <line x1={30} y1={base} x2={460} y2={base} stroke={C.ink} strokeWidth={1.5} />
    </Figure>
  );
}

/** Travel: one minute of the same arc, spread over 300 mm or 150 mm. */
function Travel() {
  const x0 = 40;
  const k = 1.1; // px per mm
  const row = (y: number, mm: number, hi: string, strong: boolean) => (
    <g>
      <Label x={x0} y={y - 30} anchor="start" size={15}>{`${mm} mm/min`}</Label>
      <rect x={x0} y={y - 4} width={360} height={22} fill={C.surface} stroke={C.line} strokeWidth={1.5} />
      <rect x={x0} y={y - (strong ? 4 : 0)} width={mm * k} height={strong ? 16 : 8} rx={4} fill={strong ? C.accent : C.soft} stroke={C.accent} strokeWidth={1.5} />
      <path d={`M${x0 + mm * k - 8},${y - 26} L${x0 + mm * k + 8},${y - 26} L${x0 + mm * k},${y - 8} Z`} fill={C.ink} />
      <DimH x1={x0} x2={x0 + mm * k} y={y + 44} label={`${mm} mm in one minute`} />
      <Label x={470} y={y - 30} anchor="end" tone="accent" weight={700}>{hi}</Label>
    </g>
  );
  return (
    <Figure
      height={290}
      alt="The same 20 V, 150 A arc run for one minute lays heat over 300 mm at 0.60 kJ/mm, or over 150 mm at 1.20 kJ/mm when the travel is halved."
      caption="Same 20 V and 150 A, same minute of arc: halve the travel and each millimeter gets twice the heat."
    >
      <Label x={240} y={18} tone="muted" size={15}>20 V × 150 A, one minute of arc</Label>
      {row(84, 300, "0.60 kJ/mm", false)}
      {row(214, 150, "1.20 kJ/mm", true)}
    </Figure>
  );
}

/** Passes: FPY = 0.98^n. */
function Passes() {
  const b = plotBox({ x: 70, y: 40, w: 350, h: 190, xMin: 0, xMax: 45, yMin: 0, yMax: 100 });
  const pts: Array<[number, number]> = [];
  for (let n = 0; n <= 45; n++) pts.push([n, 100 * 0.98 ** n]);
  return (
    <Figure
      height={290}
      alt="First-pass yield against number of steps: each step keeps 98%, yet the product falls to about 82% at 10 steps and about 45% at 40 steps."
      caption="Every step is 98%, but the yield multiplies: 10 steps ship about 82%, 40 steps under half."
    >
      <Axes box={b} xLabel="steps" yLabel="first-pass yield, %" />
      <Guide x1={b.px(0)} y1={b.py(98)} x2={b.px(45)} y2={b.py(98)} />
      <Label x={b.px(44)} y={b.py(98) - 14} anchor="end" tone="muted" size={15}>each step 98%</Label>
      <path d={b.path(pts)} fill="none" stroke={C.accent} strokeWidth={3} />
      <Guide x1={b.px(10)} y1={b.py(82)} x2={b.px(10)} y2={b.py(0)} />
      <Guide x1={b.px(40)} y1={b.py(45)} x2={b.px(40)} y2={b.py(0)} />
      <Guide x1={b.px(0)} y1={b.py(45)} x2={b.px(40)} y2={b.py(45)} />
      <Tick x={b.px(10)} y={b.py(0)} dir="x" label="10" />
      <Tick x={b.px(40)} y={b.py(0)} dir="x" label="40" />
      <Tick x={b.px(0)} y={b.py(45)} dir="y" label="45%" />
      <Tick x={b.px(0)} y={b.py(82)} dir="y" label="82%" />
      <Dot x={b.px(10)} y={b.py(81.7)} />
      <Dot x={b.px(40)} y={b.py(44.6)} />
      <Label x={b.px(40)} y={b.py(45) - 22} serif size={17}>0.98⁴⁰</Label>
      <Label x={b.px(9)} y={b.py(82) + 22} anchor="end" serif size={17}>0.98¹⁰</Label>
    </Figure>
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
  return (
    <Figure
      height={290}
      alt="Side view of a printed stack of layers: a pull along the roads is labelled 40 MPa, a peel pulling layers apart is labelled 40 / 2 = 20 MPa at the seam."
      caption="Same plastic, two directions: along a road it is 40 MPa, but a peel only fights the bond, 40 / 2 = 20 MPa."
    >
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={L} y={T + i * h} width={R - L} height={h - 2} rx={9} fill={C.soft} stroke={C.ink} strokeWidth={1.5} />
      ))}
      <line x1={L - 6} y1={T + weak * h - 1} x2={R + 6} y2={T + weak * h - 1} stroke={C.alarm} strokeWidth={2.5} strokeDasharray="6 4" />
      <Arrow x1={L - 4} y1={T + 50} x2={L - 70} y2={T + 50} tone="ink" width={3} />
      <Arrow x1={R + 4} y1={T + 50} x2={R + 70} y2={T + 50} tone="ink" width={3} />
      <Label x={R + 10} y={T + 76} anchor="start" size={15}>along: 40 MPa</Label>
      <Arrow x1={240} y1={T - 4} x2={240} y2={T - 52} tone="alarm" width={3} />
      <Arrow x1={240} y1={T + n * h + 2} x2={240} y2={T + n * h + 50} tone="alarm" width={3} />
      <Label x={254} y={T - 36} anchor="start" tone="alarm" weight={700} size={15}>peel: 40 / 2 = 20 MPa</Label>
      <Label x={L - 10} y={T + weak * h + 22} anchor="end" tone="alarm" size={15}>weak bond</Label>
      <Label x={L - 12} y={T + n * h + 30} anchor="end" tone="muted" size={15}>printed layers</Label>
    </Figure>
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
  return (
    <Figure
      height={280}
      alt="Three rows of three stations drawn to length by cycle time: 20, 45, 30 s makes 80 per hour; cutting station 1 to 10 s still makes 80; cutting station 2 to 25 s makes 120 with station 3 now the slow one."
      caption="The longest box sets the pace: speed an idle station and nothing moves; speed the 45 s one and the rate finally rises."
    >
      {rows.map((r) => {
        const max = Math.max(...r.t);
        let x = 20;
        return (
          <g key={r.note}>
            <Label x={20} y={r.y - 16} anchor="start" size={15} tone="muted">{r.note}</Label>
            {r.t.map((t, i) => {
              const w = t * k;
              const g = (
                <g key={i}>
                  <rect x={x} y={r.y} width={w} height={36} rx={4} fill={t === max ? C.accent : C.soft} stroke={C.ink} strokeWidth={1.5} />
                  {t === max ? (
                    <OnAccent x={x + w / 2} y={r.y + 18}>{`${t} s`}</OnAccent>
                  ) : (
                    <Label x={x + w / 2} y={r.y + 18} size={15}>{`${t} s`}</Label>
                  )}
                </g>
              );
              x += w + 8;
              return g;
            })}
            <Label x={470} y={r.y + 18} anchor="end" weight={700} tone={r.rate === "120 / h" ? "accent" : "ink"}>{r.rate}</Label>
          </g>
        );
      })}
    </Figure>
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
  return (
    <Figure
      height={290}
      alt="Unit cost against batch size on a log scale: 86.40 at 100 parts falling toward the 6.40 floor of material and cycle time, reaching 7.20 at 10000 parts."
      caption="The 8000 die is shared by the batch: 80 a part at 100, 0.80 at 10000, while the 6.40 of material and minutes never moves."
    >
      <Axes box={b} xLabel="batch size" yLabel="unit cost" />
      <Guide x1={b.px(2)} y1={b.py(6.4)} x2={b.px(4.8)} y2={b.py(6.4)} />
      <Label x={b.px(4.32)} y={b.py(38)} tone="muted" size={15}>material +</Label>
      <Label x={b.px(4.32)} y={b.py(28)} tone="muted" size={15}>minutes 6.40</Label>
      <Arrow x1={b.px(4.32)} y1={b.py(22)} x2={b.px(4.32)} y2={b.py(6.4) - 3} tone="muted" width={1.5} />
      <path d={b.path(pts)} fill="none" stroke={C.accent} strokeWidth={3} />
      <Tick x={b.px(2)} y={b.py(0)} dir="x" label="100" />
      <Tick x={b.px(3)} y={b.py(0)} dir="x" label="1000" />
      <Tick x={b.px(4)} y={b.py(0)} dir="x" label="10000" />
      <Dot x={b.px(2)} y={b.py(86.4)} />
      <Dot x={b.px(4)} y={b.py(7.2)} />
      <Label x={b.px(2) + 14} y={b.py(86.4)} anchor="start" weight={700}>86.40</Label>
      <Label x={b.px(4) - 8} y={b.py(7.2) - 24} anchor="end" weight={700}>7.20</Label>
      <Label x={b.px(3.3)} y={b.py(62)} serif size={17}>6.40 + 8000 / N</Label>
    </Figure>
  );
}

/** DFA: handling time by part count. */
function Dfa() {
  const k = 6;
  const x0 = 40;
  const row = (y: number, parts: number, total: number) => {
    const extras = parts - 1;
    return (
      <g>
        <Label x={x0} y={y - 16} anchor="start" size={15} tone="muted">{`${parts} parts`}</Label>
        <rect x={x0} y={y} width={20 * k} height={34} fill={C.soft} stroke={C.ink} strokeWidth={1.5} />
        <Label x={x0 + 10 * k} y={y + 17} size={15}>20 s base</Label>
        {Array.from({ length: extras }, (_, i) => (
          <g key={i}>
            <rect x={x0 + 20 * k + i * 8 * k} y={y} width={8 * k} height={34} fill={C.accent} stroke={C.ink} strokeWidth={1.5} />
            <OnAccent x={x0 + 20 * k + i * 8 * k + 4 * k} y={y + 17}>8</OnAccent>
          </g>
        ))}
        <Label x={x0 + total * k + 10} y={y + 17} anchor="start" weight={700}>{`${total} s`}</Label>
      </g>
    );
  };
  return (
    <Figure
      height={230}
      alt="Two time bars: six parts take a 20 s base plus five 8 s handlings, 60 s; three parts take 20 s plus two handlings, 36 s, saving 16 s."
      caption="Each part you delete is one 8 s handling you no longer do, but only if the joint still holds without it."
    >
      {row(50, 6, 60)}
      {row(140, 3, 36)}
      <rect x={x0 + 36 * k} y={140} width={24 * k} height={34} fill="none" stroke={C.muted} strokeWidth={1.5} strokeDasharray="5 4" />
      <DimH x1={x0 + 36 * k} x2={x0 + 60 * k} y={206} label="16 s saved" tone="accent" />
    </Figure>
  );
}

/** Scrap: the good parts carry the bad ones. */
function Scrap() {
  const w = 36;
  const gap = 6;
  const x0 = 30;
  return (
    <Figure
      height={260}
      alt="Ten parts that each cost 10 to process, two of them scrapped; the 100 spent is carried by the eight good parts at 12.50 each, not 8."
      caption="Every part was processed, so the 8 good ones carry all 100: divide by yield, 10 / 0.80 = 12.50."
    >
      {Array.from({ length: 10 }, (_, i) => {
        const x = x0 + i * (w + gap);
        const bad = i >= 8;
        return (
          <g key={i}>
            <rect x={x} y={60} width={w} height={w} rx={4} fill={bad ? C.surface : C.soft} stroke={bad ? C.alarm : C.ink} strokeWidth={2} />
            {bad && (
              <path d={`M${x + 8},${68} L${x + w - 8},${60 + w - 8} M${x + w - 8},${68} L${x + 8},${60 + w - 8}`} stroke={C.alarm} strokeWidth={2.5} />
            )}
            <Label x={x + w / 2} y={44} size={15} tone="muted">10</Label>
          </g>
        );
      })}
      <Label x={x0 + 4 * (w + gap) - gap / 2} y={120} size={15}>8 good ship</Label>
      <Label x={x0 + 9 * (w + gap) - gap / 2} y={120} size={15} tone="alarm">2 scrap</Label>
      <Label x={240} y={16} tone="muted" size={15}>each part costs 10 to process: 100 spent</Label>
      <Label x={240} y={168} serif size={19} tone="accent" weight={600}>100 / 8 = 10 / 0.80 = 12.50</Label>
      <Label x={240} y={210} size={15} tone="alarm">not 10 − 2 = 8</Label>
      <line x1={180} y1={211} x2={300} y2={211} stroke={C.alarm} strokeWidth={2} />
      <Label x={240} y={240} size={15} tone="muted">at 95% yield: 10 / 0.95 ≈ 10.53</Label>
    </Figure>
  );
}

/** Takt: the demand's pace vs the station's 4 min cycle. */
function Takt() {
  const x0 = 40;
  const k = 40; // px per minute
  return (
    <Figure
      height={270}
      alt="Two timelines: owing 50 parts, takt is 8 minutes and the 4 minute station leaves 4 minutes of slack; owing 200, takt is 2 minutes and the station runs 2 minutes late on every part."
      caption="Takt is 400 min divided by demand; the station's 4 min is early against 8, late against 2."
    >
      <Label x={x0} y={30} anchor="start" size={15} tone="muted">50 parts: takt 400 / 50 = 8 min</Label>
      <rect x={x0} y={50} width={8 * k} height={36} fill="none" stroke={C.ink} strokeWidth={2} strokeDasharray="6 4" />
      <rect x={x0} y={56} width={4 * k} height={24} rx={3} fill={C.accent} />
      <OnAccent x={x0 + 2 * k} y={68}>station 4 min</OnAccent>
      <Label x={x0 + 6 * k} y={68} size={15} tone="accent" weight={700}>4 min slack</Label>
      <Label x={x0 + 8 * k + 8} y={68} anchor="start" size={15} tone="muted">8</Label>

      <Label x={x0} y={150} anchor="start" size={15} tone="muted">200 parts: takt 400 / 200 = 2 min</Label>
      <rect x={x0} y={170} width={2 * k} height={36} fill="none" stroke={C.ink} strokeWidth={2} strokeDasharray="6 4" />
      <rect x={x0} y={176} width={2 * k} height={24} rx={3} fill={C.accent} />
      <rect x={x0 + 2 * k} y={176} width={2 * k} height={24} rx={3} fill={C.alarm} />
      <OnAccent x={x0 + 1 * k} y={188}>2</OnAccent>
      <Label x={x0 + 4 * k + 10} y={188} anchor="start" size={15} tone="alarm" weight={700}>2 min late, every part</Label>
      <line x1={x0} y1={236} x2={x0 + 8 * k} y2={236} stroke={C.muted} strokeWidth={1.5} />
      {[0, 2, 4, 6, 8].map((m) => (
        <g key={m}>
          <line x1={x0 + m * k} y1={231} x2={x0 + m * k} y2={241} stroke={C.muted} strokeWidth={1.5} />
          <Label x={x0 + m * k} y={256} size={15} tone="muted">{`${m}`}</Label>
        </g>
      ))}
      <Label x={x0 + 8 * k + 12} y={256} anchor="start" size={15} tone="muted">min</Label>
    </Figure>
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
