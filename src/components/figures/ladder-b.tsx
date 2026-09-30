import type { ReactNode } from "react";
import { Arrow, C, DimH, Ground, Label, plotBox, type FigureMap } from "./kit";
import { AnimatedFigure, clamp, GrowArrow, HOLD, lerp, op, partial, seg } from "./motion";

/* ---------- local helpers ---------- */

type Box = ReturnType<typeof plotBox>;
type Tone = "ink" | "accent" | "muted" | "alarm";
/** A tick: value, label, tone, and an opacity while it fades in. */
type Tick = [number, ReactNode, Tone?, number?];

/** Sample f on [a, b] into n+1 points. */
function sample(f: (x: number) => number, a: number, b: number, n = 80): Array<[number, number]> {
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= n; i++) {
    const x = a + ((b - a) * i) / n;
    pts.push([x, f(x)]);
  }
  return pts;
}

/** The part of a curve (x increasing) left of x, ending on the curve at x; at or past its end, the curve itself. */
function upTo(pts: Array<[number, number]>, x: number): Array<[number, number]> {
  if (x >= pts[pts.length - 1][0]) return pts;
  const out: Array<[number, number]> = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = pts[i];
    if (px <= x) {
      out.push(pts[i]);
      continue;
    }
    const [qx, qy] = pts[i - 1];
    out.push([x, qy + ((py - qy) * (x - qx)) / (px - qx)]);
    break;
  }
  return out;
}

/** Axes with the x label centred under the ticks and the y label above the y axis. */
function Frame({
  b,
  xLabel,
  yLabel,
  xTicks = [],
  yTicks = [],
}: {
  b: Box;
  xLabel: string;
  yLabel: string;
  xTicks?: Tick[];
  yTicks?: Tick[];
}) {
  const { x, y, w, h } = b;
  return (
    <g>
      <Arrow x1={x} y1={y + h} x2={x + w + 14} y2={y + h} tone="ink" width={1.5} />
      <Arrow x1={x} y1={y + h} x2={x} y2={y - 14} tone="ink" width={1.5} />
      {xTicks.map(([v, t, tone, o], i) => (
        <g key={`x${i}`} opacity={o}>
          <line x1={b.px(v)} y1={y + h} x2={b.px(v)} y2={y + h + 6} stroke={C.ink} strokeWidth={1.5} />
          <Label x={b.px(v)} y={y + h + 18} size={15} tone={tone ?? "muted"}>
            {t}
          </Label>
        </g>
      ))}
      {yTicks.map(([v, t, tone, o], i) => (
        <g key={`y${i}`} opacity={o}>
          <line x1={x - 6} y1={b.py(v)} x2={x} y2={b.py(v)} stroke={C.ink} strokeWidth={1.5} />
          <Label x={x - 10} y={b.py(v)} size={15} anchor="end" tone={tone ?? "muted"}>
            {t}
          </Label>
        </g>
      ))}
      <Label x={x + w / 2} y={y + h + 42} size={15} tone="muted">
        {xLabel}
      </Label>
      <Label x={x + 10} y={y - 16} size={15} anchor="start" tone="muted">
        {yLabel}
      </Label>
    </g>
  );
}

function Dot({ x, y, tone = "accent", r = 5, opacity }: { x: number; y: number; tone?: Tone; r?: number; opacity?: number }) {
  return <circle cx={x} cy={y} r={r} fill={C[tone]} stroke={C.surface} strokeWidth={1.5} opacity={opacity} />;
}

function Curve({
  d,
  tone = "accent",
  width = 3,
  dashed = false,
  opacity,
}: {
  d: string;
  tone?: Tone;
  width?: number;
  dashed?: boolean;
  opacity?: number;
}) {
  return (
    <path
      d={d}
      fill="none"
      stroke={C[tone]}
      strokeWidth={width}
      strokeLinejoin="round"
      strokeLinecap="round"
      strokeDasharray={dashed ? "6 5" : undefined}
      opacity={opacity}
    />
  );
}

function Guide({ x1, y1, x2, y2, opacity }: { x1: number; y1: number; x2: number; y2: number; opacity?: number }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.muted} strokeWidth={1.2} strokeDasharray="4 4" opacity={opacity} />;
}

/* ---------- materials-301 ---------- */

/** Cold work: strength climbs from 250 to 490 MPa while elongation falls from 40% to about 4%. */
function ColdWork() {
  const s = plotBox({ x: 90, y: 40, w: 290, h: 180, xMin: 0, xMax: 40, yMin: 0, yMax: 500 });
  const e = plotBox({ x: 90, y: 40, w: 290, h: 180, xMin: 0, xMax: 40, yMin: 0, yMax: 50 });
  const sig = (cw: number) => 250 + 6 * cw;
  const el = (cw: number) => 40 * Math.exp(-cw / 18);
  const sigPts = sample(sig, 0, 40, 2);
  const elPts = sample(el, 0, 40);
  /** Share of the way from the annealed bar to the 40% draw. */
  const draw = (t: number) => seg(t, 1.2, 3.4);
  return (
    <AnimatedFigure
      height={290}
      duration={4.2}
      alt="Plot against percent cold work from 0 to 40: strength rises in a straight line from 250 MPa to 490 MPa while elongation falls on a curve from 40% to about 4%."
      steps={[
        { at: 0, label: "Annealed", caption: "Annealed, the bar sits at about 250 MPa and about 40% elongation." },
        { at: 1.2, label: "Cold work", caption: "Draw it: more cold work raises strength and spends elongation." },
        {
          at: 3.3,
          label: "Condition",
          caption: "Same alloy at both ends. The work bought strength and spent stretch, so the condition has to be on the drawing.",
        },
      ]}
      readouts={(t) => {
        const cw = 40 * draw(t);
        return [
          { label: "cold work", value: `${Math.round(cw)}%` },
          { label: "strength", value: `${Math.round(sig(cw))} MPa`, tone: "accent" },
          { label: "elongation", value: `${Math.round(el(cw))}%`, tone: "ink" },
        ];
      }}
    >
      {({ t }) => {
        const p = draw(t);
        const start = op(seg(t, 0.4, 0.9));
        const end = op(seg(t, 3.3, 3.8));
        return (
          <>
            <Frame
              b={s}
              xLabel="% cold work"
              yLabel=""
              xTicks={[
                [0, "0 annealed"],
                [40, "40%"],
              ]}
            />
            {p > 0 ? <Curve d={s.path(partial(sigPts, p))} /> : null}
            {p > 0 ? <Curve d={e.path(partial(elPts, p))} tone="ink" dashed /> : null}
            <Dot x={s.px(0)} y={s.py(250)} opacity={start} />
            <Dot x={s.px(40)} y={s.py(490)} opacity={end} />
            <Dot x={e.px(0)} y={e.py(40)} tone="ink" opacity={start} />
            <Dot x={e.px(40)} y={e.py(el(40))} tone="ink" opacity={end} />
            <Label x={80} y={s.py(250)} anchor="end" tone="accent" size={15} opacity={start}>250 MPa</Label>
            <Label x={80} y={e.py(40)} anchor="end" size={15} opacity={start}>40%</Label>
            <Label x={390} y={s.py(490)} anchor="start" tone="accent" size={15} opacity={end}>490 MPa</Label>
            <Label x={390} y={e.py(el(40))} anchor="start" size={15} opacity={end}>≈4%</Label>
            <Label x={s.px(24)} y={s.py(sig(24)) - 22} tone="accent" weight={600} opacity={op(seg(t, 2.4, 2.9))}>
              strength
            </Label>
            <Label x={e.px(24)} y={e.py(el(24)) - 20} opacity={op(seg(t, 2.5, 3.0))}>
              elongation
            </Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** Quench: 10 mm and 40 mm bars, both 550 HV at the skin; the thick bar's center only reaches 270 HV. */
function Quench() {
  const center = (t: number) => 200 + 350 / (1 + (t / 20) ** 2);
  const frac = (hv: number) => (hv - 200) / 350;
  return (
    <AnimatedFigure
      height={280}
      duration={4.6}
      alt="Cross-sections of a 10 mm and a 40 mm quenched steel bar, both dark at the surface marked 550 HV; the small bar's center is 480 HV and the large bar's center fades to 270 HV."
      steps={[
        {
          at: 0,
          label: "Skin",
          caption: "Quench a 10 mm and a 40 mm steel bar: the surface meets the water first, and both skins reach 550 HV.",
        },
        { at: 1.6, label: "Thin bar", caption: "The 10 mm bar's center reaches about 480 HV, while the thick bar's middle lags." },
        {
          at: 3.6,
          label: "Thick bar",
          caption: "The skin meets the water on both bars. The thick bar's middle is insulated by the metal around it, so its center is soft.",
        },
      ]}
    >
      {({ t }) => {
        // Hardness sets in from the skin inward: the 10 mm core follows fast, the 40 mm core lags and stays soft.
        const skin = seg(t, 0.4, 1.0);
        const core10 = seg(t, 1.2, 1.8);
        const mid40 = seg(t, 1.5, 2.7);
        const core40 = seg(t, 2.3, 3.9);
        const surf = op(seg(t, 0.7, 1.2));
        const at10 = op(seg(t, 1.6, 2.1));
        const at40 = op(seg(t, 3.6, 4.1));
        return (
          <>
            <defs>
              <radialGradient id="lb-q-small">
                <stop offset="0" stopColor={C.accent} stopOpacity={frac(center(10)) * core10} />
                <stop offset="1" stopColor={C.accent} stopOpacity={skin} />
              </radialGradient>
              <radialGradient id="lb-q-big">
                <stop offset="0" stopColor={C.accent} stopOpacity={frac(center(40)) * 0.6 * core40} />
                <stop offset="0.55" stopColor={C.accent} stopOpacity={0.35 * mid40} />
                <stop offset="1" stopColor={C.accent} stopOpacity={skin} />
              </radialGradient>
            </defs>
            <circle cx={100} cy={150} r={25} fill="url(#lb-q-small)" stroke={C.ink} strokeWidth={2} />
            <circle cx={320} cy={150} r={100} fill="url(#lb-q-big)" stroke={C.ink} strokeWidth={2} />

            <Label x={215} y={22} tone="accent" weight={600} opacity={surf}>surface 550 HV</Label>
            <Arrow x1={170} y1={34} x2={117} y2={128} tone="muted" width={1.5} opacity={surf} />
            <Arrow x1={255} y1={34} x2={266} y2={64} tone="muted" width={1.5} opacity={surf} />

            <Label x={320} y={138} opacity={at40}>center</Label>
            <Label x={320} y={160} weight={600} opacity={at40}>270 HV</Label>
            <circle cx={100} cy={150} r={3} fill={C.ink} opacity={at10} />
            <Arrow x1={100} y1={200} x2={100} y2={156} tone="muted" width={1.5} opacity={at10} />
            <Label x={100} y={214} opacity={at10}>center</Label>
            <Label x={100} y={234} weight={600} opacity={at10}>480 HV</Label>

            <Label x={100} y={266} tone="muted" size={15}>10 mm bar</Label>
            <Label x={320} y={266} tone="muted" size={15}>40 mm bar</Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** Lever rule: tie line from 20% B (solid) to 80% B (liquid); at 30% B overall the solid fraction is 50/60. */
function Lever() {
  const b = plotBox({ x: 60, y: 40, w: 380, h: 190, xMin: 0, xMax: 100, yMin: 0, yMax: 1.05 });
  const liq = (x: number) => 1 - (x / 100) ** 3.106;
  const sol = (x: number) => 1 - (x / 100) ** 0.4307;
  const lensPts = [...sample(liq, 0, 100), ...sample(sol, 0, 100).reverse()];
  const ty = b.py(0.5);
  const lens = b.path(lensPts) + " Z";
  const liqD = b.path(sample(liq, 0, 100));
  const solD = b.path(sample(sol, 0, 100));
  /** Overall composition, % B: the lesson's 50, slid to 30. */
  const c0 = (t: number) => lerp(50, 30, seg(t, 2.6, 4.0));
  return (
    <AnimatedFigure
      height={330}
      duration={5.2}
      alt="A two-phase lens on a temperature versus percent B diagram with a horizontal tie line from solid at 20% B to liquid at 80% B; the overall composition 30% B splits the line into a 10 arm and a 50 arm."
      steps={[
        {
          at: 0,
          label: "Tie line",
          caption: "Held at one temperature, the solid is 20% B and the liquid is 80% B: the ends of the tie line.",
        },
        {
          at: 1.8,
          label: "Slide",
          caption: "At an overall 50% B the solid fraction is 0.50; slide toward the solid end and it rises.",
        },
        {
          at: 4.0,
          label: "Read",
          caption: "The ends of the tie line stay put. The solid fraction is the arm on the far side, 50 over the whole 60.",
        },
      ]}
      readouts={(t) => {
        const c = Math.round(c0(t));
        return [
          { label: "C₀", value: `${c}% B` },
          { label: "fraction solid", value: `(80 − ${c}) / 60 = ${((80 - c) / 60).toFixed(2)}`, tone: "accent" },
        ];
      }}
    >
      {({ t }) => {
        const ends = op(seg(t, 0.4, 0.9));
        const tie = seg(t, 0.8, 1.5);
        const c = c0(t);
        const mix = op(seg(t, 1.8, 2.3));
        const read = seg(t, 4.0, 4.5);
        // The arms track the slide; their lengths only get written once it stops.
        const arm = (n: string) => (read >= 1 ? n : <tspan fillOpacity={read}>{n}</tspan>);
        return (
          <>
            <path d={lens} fill={C.soft} stroke="none" />
            <Curve d={liqD} tone="ink" width={2} />
            <Curve d={solD} tone="ink" width={2} />
            <Frame
              b={b}
              xLabel="% B"
              yLabel="temperature"
              xTicks={[
                [20, "20", undefined, ends],
                [30, "30", "accent", op(read)],
                [80, "80", undefined, ends],
              ]}
            />
            <Label x={b.px(78)} y={b.py(0.86)} tone="muted">liquid</Label>
            <Label x={b.px(10)} y={b.py(0.1)} tone="muted">solid</Label>
            <Label x={b.px(52)} y={b.py(0.68)} tone="muted" size={15}>S + L</Label>

            {tie > 0.02 ? (
              <line x1={b.px(20)} y1={ty} x2={lerp(b.px(20), b.px(80), tie)} y2={ty} stroke={C.accent} strokeWidth={3} />
            ) : null}
            <Guide x1={b.px(c)} y1={ty} x2={b.px(c)} y2={b.y + b.h} opacity={mix} />
            <Dot x={b.px(20)} y={ty} tone="ink" opacity={ends} />
            <Dot x={b.px(80)} y={ty} tone="ink" opacity={ends} />
            <Dot x={b.px(c)} y={ty} tone="accent" r={6} opacity={mix} />
            <Label x={b.px(30) + 6} y={ty - 20} anchor="start" tone="accent" size={15} weight={600} opacity={op(read)}>
              C₀ = 30
            </Label>

            <g opacity={mix}>
              <DimH x1={b.px(20)} x2={b.px(c)} y={ty + 34} label={arm("10")} />
              <DimH x1={b.px(c)} x2={b.px(80)} y={ty + 34} label={arm("50")} tone="accent" />
            </g>

            <Label x={240} y={316} tone="accent" weight={600} opacity={op(seg(t, 4.4, 4.9))}>
              fraction solid = 50 / 60 = 0.83
            </Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** Fiber direction: σ(θ) = 1 / (cos²θ/900 + sin²θ/40), 900 MPa at 0°, about 140 MPa at 30°, 40 MPa at 90°. */
function Fiber() {
  const b = plotBox({ x: 70, y: 40, w: 360, h: 180, xMin: 0, xMax: 90, yMin: 0, yMax: 1000 });
  const rad = (d: number) => (d * Math.PI) / 180;
  const sig = (d: number) => 1 / (Math.cos(rad(d)) ** 2 / 900 + Math.sin(rad(d)) ** 2 / 40);
  const ix = 300;
  const iy = 50;
  const pts = sample(sig, 0, 90, 120);
  /** The bracket load's angle off the fiber, degrees: swung from 0 to 30. */
  const swing = (t: number) => lerp(0, 30, seg(t, 2.8, 4.2));
  return (
    <AnimatedFigure
      height={290}
      duration={5}
      alt="Strength against load angle off the fiber: 900 MPa at 0 degrees collapsing to about 140 MPa at 30 degrees and 40 MPa at 90 degrees, with an inset of a fiber plate pulled 30 degrees off its fibers."
      steps={[
        { at: 0, label: "Along", caption: "Pulled along the fiber, this carbon plate is about 900 MPa." },
        {
          at: 1,
          label: "Across",
          caption: "Across the fiber it is about 40 MPa; the strength at an angle is a blend that collapses quickly.",
        },
        { at: 2.8, label: "Swing", caption: "Swing the bracket load 30° off the fiber and the estimate falls to about 140 MPa." },
        {
          at: 4.2,
          label: "Angle",
          caption: "The fiber never weakened. By 30° the load has mostly left it, and the across-fiber term sets the number.",
        },
      ]}
      readouts={(t) => {
        const th = swing(t);
        return [
          { label: "load angle", value: `${Math.round(th)}°` },
          { label: "strength", value: `≈${Math.round(sig(th) / 10) * 10} MPa`, tone: "accent" },
        ];
      }}
    >
      {({ t }) => {
        const th = swing(t);
        const a = rad(th);
        const curve = seg(t, 1, 2.4);
        const along = op(seg(t, 0.4, 0.9));
        const across = op(seg(t, 2.2, 2.7));
        const done = op(seg(t, 4.2, 4.7));
        return (
          <>
            <Frame
              b={b}
              xLabel="load angle off the fiber"
              yLabel="strength, MPa"
              xTicks={[
                [0, "0°"],
                [30, "30°", "accent", done],
                [90, "90°"],
              ]}
            />
            {curve > 0 ? <Curve d={b.path(partial(pts, curve))} /> : null}
            <Guide x1={b.px(30)} y1={b.py(sig(30))} x2={b.px(30)} y2={b.y + b.h} opacity={done} />
            <Dot x={b.px(0)} y={b.py(900)} opacity={along} />
            <Dot x={b.px(th)} y={b.py(sig(th))} r={6} opacity={op(seg(t, 2.8, 3.1))} />
            <Dot x={b.px(90)} y={b.py(40)} opacity={across} />
            <Label x={b.px(0) + 12} y={b.py(900)} anchor="start" size={15} opacity={along}>900 MPa</Label>
            <Label x={b.px(30) + 12} y={b.py(sig(30)) - 16} anchor="start" tone="accent" weight={600} opacity={done}>
              ≈140 MPa
            </Label>
            <Label x={b.px(90) - 4} y={b.py(40) - 18} anchor="end" size={15} opacity={across}>40 MPa</Label>

            {/* inset: unidirectional plate, the load swinging off the fibers */}
            <rect x={ix} y={iy} width={130} height={70} rx={3} fill={C.soft} stroke={C.ink} strokeWidth={1.5} />
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <line key={i} x1={ix + 6} y1={iy + 10 + i * 10} x2={ix + 124} y2={iy + 10 + i * 10} stroke={C.muted} strokeWidth={1.2} />
            ))}
            <Arrow
              x1={ix + 65 - 50 * Math.cos(a)}
              y1={iy + 35 + 50 * Math.sin(a)}
              x2={ix + 65 + 50 * Math.cos(a)}
              y2={iy + 35 - 50 * Math.sin(a)}
              both
            />
            {th > 0.5 ? (
              <path
                d={`M${ix + 65 + 34},${iy + 35} A34,34 0 0 0 ${ix + 65 + 34 * Math.cos(a)},${iy + 35 - 34 * Math.sin(a)}`}
                fill="none"
                stroke={C.ink}
                strokeWidth={1.5}
              />
            ) : null}
            <Label x={ix + 146} y={iy + 26} anchor="start" size={15} opacity={done}>30°</Label>
            <Label x={ix + 65} y={iy + 88} tone="muted" size={15}>fibers →</Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** Rule of mixtures: E = 230 Vf + 3.5 (1 − Vf), 3.5 GPa at no fiber, 139.4 GPa at 60%. */
function Mixture() {
  const b = plotBox({ x: 80, y: 40, w: 320, h: 180, xMin: 0, xMax: 1, yMin: 0, yMax: 250 });
  const E = (v: number) => 230 * v + 3.5 * (1 - v);
  /** Fiber fraction by volume: none, then up to 60%. */
  const vf = (t: number) => lerp(0, 0.6, seg(t, 2.6, 4));
  return (
    <AnimatedFigure
      height={290}
      duration={4.8}
      alt="Along-fiber stiffness against fiber fraction, a straight line from 3.5 GPa with no fiber to 230 GPa at all fiber, with 139.4 GPa marked at 60% fiber."
      steps={[
        { at: 0, label: "Ends", caption: "With no fiber at all you have 3.5 GPa, just the epoxy; the carbon fiber is 230 GPa." },
        {
          at: 1.4,
          label: "Mix",
          caption: "Along the fibers, the stiffness is the fiber's times the fraction that is fiber, plus the epoxy's times the rest.",
        },
        { at: 2.6, label: "60% fiber", caption: "At 60% fiber: 0.60 × 230 + 0.40 × 3.5 = 138 + 1.4 = 139.4 GPa." },
        {
          at: 4,
          label: "Along only",
          caption: "At 60% fiber, 138 of the 139.4 GPa is the carbon. This line is only for a pull along the fibers.",
        },
      ]}
      readouts={(t) => {
        const v = vf(t);
        return [
          { label: "Vf", value: v.toFixed(2) },
          { label: "E", value: `${E(v).toFixed(1)} GPa`, tone: "accent" },
        ];
      }}
    >
      {({ t }) => {
        const epoxy = op(seg(t, 0.4, 0.9));
        const carbon = op(seg(t, 0.8, 1.3));
        const line = seg(t, 1.4, 2.2);
        const v = vf(t);
        const done = op(seg(t, 4, 4.5));
        return (
          <>
            <Frame
              b={b}
              xLabel="fiber fraction by volume"
              yLabel="E along fiber, GPa"
              xTicks={[
                [0, "0"],
                [0.6, "0.60", "accent", done],
                [1, "1"],
              ]}
            />
            {line > 0 ? (
              <Curve
                d={b.path([
                  [0, E(0)],
                  [line, E(line)],
                ])}
              />
            ) : null}
            <Guide x1={b.px(0.6)} y1={b.py(E(0.6))} x2={b.px(0.6)} y2={b.y + b.h} opacity={done} />
            <Dot x={b.px(0)} y={b.py(3.5)} tone="ink" opacity={epoxy} />
            <Dot x={b.px(v)} y={b.py(E(v))} r={6} opacity={op(seg(t, 2.6, 2.9))} />
            <Dot x={b.px(1)} y={b.py(230)} tone="ink" opacity={carbon} />
            <Label x={b.x - 10} y={b.py(3.5) - 8} anchor="end" size={15} opacity={epoxy}>3.5</Label>
            <Label x={b.x - 10} y={b.py(3.5) + 12} anchor="end" size={15} tone="muted" opacity={epoxy}>epoxy</Label>
            <Label x={b.px(0.6) - 12} y={b.py(E(0.6)) - 18} anchor="end" tone="accent" weight={600} opacity={done}>
              139.4 GPa
            </Label>
            <Label x={b.px(0.6) + 12} y={b.py(E(0.6)) + 20} anchor="start" tone="muted" size={15} opacity={op(seg(t, 4.2, 4.7))}>
              138 + 1.4
            </Label>
            <Label x={b.px(1) - 10} y={b.py(230) - 18} anchor="end" size={15} opacity={carbon}>230 carbon</Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** Ductile-to-brittle transition: teaching Charpy curve 15 J → 85 J centred at 0°C. */
function Transition() {
  const b = plotBox({ x: 70, y: 40, w: 360, h: 180, xMin: -60, xMax: 60, yMin: 0, yMax: 100 });
  const J = (t: number) => 15 + 70 / (1 + Math.exp(-t / 8));
  const pts = sample(J, -60, 60, 120);
  /** The plate's temperature, °C: cooled from 20 to −20. */
  const temp = (t: number) => lerp(20, -20, seg(t, 3, 4.6));
  return (
    <AnimatedFigure
      height={290}
      duration={5.4}
      alt="Impact energy against temperature, an S-curve from a 15 J lower shelf to an 85 J upper shelf centred at 0 degrees C, with 20 J marked at minus 20 degrees as snaps and 80 J at 20 degrees as tears."
      steps={[
        {
          at: 0,
          label: "Shelves",
          caption: "On this plate's teaching curve the energy climbs from a 15 J lower shelf to an 85 J upper shelf, centered at 0°C.",
        },
        { at: 2, label: "Warm", caption: "At 20°C it absorbs about 80 J and the call is tears." },
        { at: 3, label: "Cool", caption: "Cool the same plate to −20°C: it absorbs about 20 J and the call is snaps." },
        {
          at: 4.6,
          label: "Same steel",
          caption: "Same steel, 40 degrees apart. Quote the energy with the temperature, because the shelf is steep in the middle.",
        },
      ]}
      readouts={(t) => {
        const T = temp(t);
        const deg = Math.round(T);
        return [
          { label: "T", value: `${deg < 0 ? "−" : ""}${Math.abs(deg)}°C` },
          { label: "impact energy", value: `≈${Math.round(J(T))} J`, tone: T < 0 ? "alarm" : "accent" },
        ];
      }}
    >
      {({ t }) => {
        const curve = seg(t, 0.4, 1.8);
        const warm = op(seg(t, 2, 2.5));
        const T = temp(t);
        const cold = op(seg(t, 4.6, 5.1));
        return (
          <>
            <Frame
              b={b}
              xLabel="temperature, °C"
              yLabel="impact energy"
              xTicks={[
                [-20, "−20", "alarm", cold],
                [0, "0"],
                [20, "20", "accent", warm],
              ]}
              yTicks={[
                [15, "15 J"],
                [85, "85 J"],
              ]}
            />
            <Guide x1={b.x} y1={b.py(85)} x2={b.x + b.w} y2={b.py(85)} />
            <Guide x1={b.x} y1={b.py(15)} x2={b.x + b.w} y2={b.py(15)} />
            {curve > 0 ? <Curve d={b.path(partial(pts, curve))} tone="ink" /> : null}
            {/* the cold plate leaves the 20°C point and slides down the shelf */}
            <Dot x={b.px(T)} y={b.py(J(T))} tone="alarm" r={6} opacity={op(seg(t, 3, 3.3))} />
            <Dot x={b.px(20)} y={b.py(J(20))} tone="accent" r={6} opacity={warm} />
            <Label x={b.px(-20)} y={b.py(J(-20)) - 40} tone="alarm" weight={600} opacity={cold}>20 J</Label>
            <Label x={b.px(-20)} y={b.py(J(-20)) - 20} tone="alarm" size={15} opacity={cold}>snaps</Label>
            <Label x={b.px(20) + 12} y={b.py(J(20)) + 24} anchor="start" tone="accent" weight={600} opacity={warm}>80 J</Label>
            <Label x={b.px(20) + 56} y={b.py(J(20)) + 24} anchor="start" tone="accent" size={15} opacity={warm}>tears</Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/* ---------- materials-401 ---------- */

/** Panel vs tie rod: E^(1/3)/ρ puts wood (4.31) far ahead of steel (0.75); E/ρ puts steel (25.6) ahead of wood (20). */
function Panel() {
  const base = 220;
  const H = 140;
  /** A bar grown to `p` of its height; its value rides the top and shows once it is half up. */
  const bar = (x: number, v: number, max: number, win: boolean, val: string, name: string, p: number, named?: number) => {
    const h = (v / max) * H * p;
    return (
      <g>
        <rect x={x - 26} y={base - h} width={52} height={h} fill={win ? C.accent : C.soft} stroke={win ? C.accent : C.ink} strokeWidth={1.5} />
        <Label x={x} y={base - h - 14} tone={win ? "accent" : "ink"} weight={win ? 600 : undefined} opacity={op(clamp(2 * p - 1))}>
          {val}
        </Label>
        <Label x={x} y={base + 18} size={15} opacity={named}>
          {name}
        </Label>
      </g>
    );
  };
  return (
    <AnimatedFigure
      height={260}
      duration={4}
      alt="Two bar charts: for a panel, index E to the one-third over density is 0.75 for steel and 4.31 for wood; for a tie rod, E over density is 25.6 for steel and 20 for wood."
      steps={[
        {
          at: 0,
          label: "Steel",
          caption: "For a flat panel the index is the cube root of modulus over density, and steel scores about 0.75.",
        },
        {
          at: 1.2,
          label: "Wood",
          caption: "Wood scores about 4.31, nearly six times, because the panel pays heavily for steel's density.",
        },
        {
          at: 2.4,
          label: "Tie rod",
          caption: "Wood wins the panel by nearly six times. Change the duty to a tie rod and the index changes, and steel edges ahead.",
        },
      ]}
    >
      {({ t }) => {
        const rod = op(seg(t, 2.4, 2.9));
        return (
          <>
            <Label x={125} y={24} weight={600}>
              panel: E<tspan fontSize={15} dy={-7}>1/3</tspan>
              <tspan dy={7}> / ρ</tspan>
            </Label>
            <Label x={355} y={24} weight={600} opacity={rod}>tie rod: E / ρ</Label>
            {bar(80, 0.75, 4.31, false, "0.75", "steel", seg(t, 0.4, 1))}
            {bar(170, 4.31, 4.31, true, "4.31", "wood", seg(t, 1.2, 2))}
            {bar(310, 25.6, 25.6, true, "25.6", "steel", seg(t, 2.6, 3.3), rod)}
            {bar(400, 20, 25.6, false, "20", "wood", seg(t, 2.9, 3.6), rod)}
            <line x1={30} y1={base} x2={220} y2={base} stroke={C.ink} strokeWidth={2} />
            <line x1={260} y1={base} x2={450} y2={base} stroke={C.ink} strokeWidth={2} />
            <line x1={240} y1={40} x2={240} y2={240} stroke={C.line} strokeWidth={1.5} />
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** Notch sensitivity: fatigue strength 300 / (1 + q × 1.5), 300 MPa at q = 0, about 136 MPa at q = 0.8. */
function Sensitive() {
  const b = plotBox({ x: 80, y: 40, w: 330, h: 180, xMin: 0, xMax: 1, yMin: 0, yMax: 350 });
  const S = (q: number) => 300 / (1 + q * 1.5);
  const pts = sample(S, 0, 1);
  /** The metal's notch sensitivity: 0, raised to 0.8 with the fillet unchanged. */
  const sens = (t: number) => lerp(0, 0.8, seg(t, 1.4, 3.2));
  return (
    <AnimatedFigure
      height={290}
      duration={4.2}
      alt="Notched fatigue strength against notch sensitivity q for a fixed Kt of 2.5: 300 MPa at q equals 0 where Kf is 1, falling to about 136 MPa at q equals 0.8 where Kf is 2.2."
      steps={[
        {
          at: 0,
          label: "Smooth bar",
          caption: "At sensitivity 0, Kf is 1 and the Kt = 2.5 shoulder keeps the smooth-bar 300 MPa.",
        },
        {
          at: 1.4,
          label: "Sensitivity",
          caption: "Raise the metal's sensitivity: Kf = 1 + q × 1.5 grows, and you divide the 300 MPa by it.",
        },
        {
          at: 3.2,
          label: "Same fillet",
          caption: "The fillet is the same all the way along. Only the metal's sensitivity moves, and with it the factor you divide by.",
        },
      ]}
      readouts={(t) => {
        const q = sens(t);
        return [
          { label: "q", value: q.toFixed(2) },
          { label: "Kf", value: (1 + q * 1.5).toFixed(2) },
          { label: "fatigue strength", value: `≈${Math.round(S(q))} MPa`, tone: "accent" },
        ];
      }}
    >
      {({ t }) => {
        const q = sens(t);
        const u = q + 0.2 * seg(t, 3.2, 3.6); // the curve runs on to q = 1 once the marker stops at 0.8
        const start = op(seg(t, 0.4, 0.9));
        const done = op(seg(t, 3.2, 3.7));
        return (
          <>
            <Frame
              b={b}
              xLabel="notch sensitivity q   (Kt = 2.5)"
              yLabel="fatigue strength, MPa"
              xTicks={[
                [0, "0"],
                [0.8, "0.8", "accent", done],
                [1, "1"],
              ]}
            />
            <Guide x1={b.x} y1={b.py(300)} x2={b.x + b.w} y2={b.py(300)} opacity={start} />
            {u > 0 ? <Curve d={b.path(partial(pts, u))} /> : null}
            <Guide x1={b.px(0.8)} y1={b.py(S(0.8))} x2={b.px(0.8)} y2={b.y + b.h} opacity={done} />
            <Dot x={b.px(0)} y={b.py(300)} tone="ink" r={6} opacity={start} />
            <Dot x={b.px(q)} y={b.py(S(q))} r={6} opacity={op(seg(t, 1.4, 1.7))} />
            <Label x={b.px(0) + 14} y={b.py(300) - 18} anchor="start" size={15} opacity={start}>300 MPa, Kf = 1</Label>
            <Label x={b.px(0.8) - 10} y={b.py(S(0.8)) - 38} anchor="end" tone="accent" weight={600} opacity={done}>
              ≈136 MPa
            </Label>
            <Label x={b.px(0.8) - 10} y={b.py(S(0.8)) - 18} anchor="end" tone="accent" size={15} opacity={done}>
              Kf = 2.2
            </Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** Temper: 6061-O yields at 55 MPa and stretches 25%; 6061-T6 yields at 275 MPa and stretches 12%. */
function Temper() {
  const b = plotBox({ x: 80, y: 40, w: 330, h: 180, xMin: 0, xMax: 30, yMin: 0, yMax: 350 });
  const O = [[0, 0] as [number, number], ...sample((e) => 55 + 55 * (1 - Math.exp(-(e - 0.15) / 7)), 0.15, 25, 60)];
  const T6 = [[0, 0] as [number, number], ...sample((e) => 275 + 35 * (1 - Math.exp(-(e - 0.5) / 3)), 0.5, 12, 60)];
  const oEnd = O[O.length - 1];
  const tEnd = T6[T6.length - 1];
  const X = ({ x, y, tone, opacity }: { x: number; y: number; tone: Tone; opacity?: number }) => (
    <g stroke={C[tone]} strokeWidth={2.5} opacity={opacity}>
      <line x1={x - 6} y1={y - 6} x2={x + 6} y2={y + 6} />
      <line x1={x - 6} y1={y + 6} x2={x + 6} y2={y - 6} />
    </g>
  );
  /** Strain in the pull test, %: a steady rate until the O bar breaks at 25%. */
  const strain = (t: number) => oEnd[0] * clamp((t - 0.5) / 4);
  const snap = 0.5 + (4 * tEnd[0]) / oEnd[0]; // the T6 bar breaks at 12%
  return (
    <AnimatedFigure
      height={290}
      duration={5.1}
      alt="Stress-strain curves for 6061: T6 yields at 275 MPa and breaks at 12% strain; annealed O yields at 55 MPa and stretches to 25%."
      steps={[
        { at: 0, label: "Pull", caption: "Pull two 6061 bars: annealed yields at about 55 MPa, T6 at about 275 MPa." },
        { at: 2.4, label: "T6 breaks", caption: "The T6 bar stops at about 12% stretch, while the annealed bar keeps going." },
        {
          at: 4.5,
          label: "O breaks",
          caption: "Both curves are 6061. The T6 treatment bought yield by spending stretch, so the letters are the strength.",
        },
      ]}
      readouts={(t) => [{ label: "strain", value: `${Math.round(strain(t))}%` }]}
    >
      {({ t }) => {
        const e = strain(t);
        const yields = op(seg(t, 0.6, 1.1));
        const t6 = op(seg(t, snap + 0.1, snap + 0.6));
        const o = op(seg(t, 4.6, 5.1));
        return (
          <>
            <Frame
              b={b}
              xLabel="strain"
              yLabel="stress"
              xTicks={[
                [12, "12%", "accent", t6],
                [25, "25%", undefined, o],
              ]}
              yTicks={[
                [55, "55 MPa", undefined, yields],
                [275, "275 MPa", "accent", yields],
              ]}
            />
            <Guide x1={b.px(tEnd[0])} y1={b.py(tEnd[1])} x2={b.px(tEnd[0])} y2={b.y + b.h} opacity={t6} />
            <Guide x1={b.px(oEnd[0])} y1={b.py(oEnd[1])} x2={b.px(oEnd[0])} y2={b.y + b.h} opacity={o} />
            {e > 0 ? <Curve d={b.path(upTo(T6, e))} /> : null}
            {e > 0 ? <Curve d={b.path(upTo(O, e))} tone="ink" /> : null}
            <X x={b.px(tEnd[0])} y={b.py(tEnd[1])} tone="accent" opacity={op(seg(t, snap, snap + 0.4))} />
            <X x={b.px(oEnd[0])} y={b.py(oEnd[1])} tone="ink" opacity={op(seg(t, 4.5, 4.9))} />
            <Label x={b.px(6)} y={b.py(305) - 18} tone="accent" weight={600} opacity={op(seg(t, 1.4, 1.9))}>
              6061-T6
            </Label>
            <Label x={b.px(16)} y={b.py(100) - 20} weight={600} opacity={op(seg(t, 3, 3.5))}>
              6061-O
            </Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** Four services, four impatient mechanisms. */
function Duty() {
  const tile = (x: number, y: number, art: ReactNode, cond: string, mech: string, shown?: number, named?: number) => (
    <g transform={`translate(${x},${y})`}>
      <rect x={0} y={0} width={220} height={120} rx={8} fill="none" stroke={C.line} strokeWidth={1.5} />
      {art}
      <Label x={100} y={44} anchor="start" size={15} tone="muted" opacity={shown}>
        {cond}
      </Label>
      <Label x={100} y={74} anchor="start" size={19} tone="accent" weight={600} opacity={named}>
        {mech}
      </Label>
    </g>
  );
  const bolt = (o?: number) => (
    <g opacity={o}>
      <rect x={28} y={24} width={36} height={16} fill={C.soft} stroke={C.ink} strokeWidth={1.5} />
      <rect x={38} y={40} width={16} height={56} fill={C.soft} stroke={C.ink} strokeWidth={1.5} />
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M${20 + i * 26},108 q4,-6 0,-12 q-4,-6 0,-12`}
          fill="none"
          stroke={C.alarm}
          strokeWidth={1.5}
          transform="translate(0,4)"
        />
      ))}
    </g>
  );
  const rod = (o?: number) => (
    <g opacity={o}>
      <rect x={18} y={52} width={66} height={16} rx={3} fill={C.soft} stroke={C.ink} strokeWidth={1.5} />
      <path d="M30,40 A24,12 0 0 1 72,40" fill="none" stroke={C.accent} strokeWidth={2} markerEnd="url(#fig-arrow-accent)" />
      <path d="M72,80 A24,12 0 0 1 30,80" fill="none" stroke={C.accent} strokeWidth={2} markerEnd="url(#fig-arrow-accent)" />
    </g>
  );
  const wall = (o?: number) => (
    <g opacity={o}>
      <rect x={42} y={18} width={14} height={84} fill={C.soft} stroke={C.ink} strokeWidth={1.5} />
      <path d="M42,58 l9,-3 l-6,-3 l9,-4" fill="none" stroke={C.alarm} strokeWidth={2} />
      <Arrow x1={28} y1={30} x2={28} y2={8} tone="ink" width={1.5} />
      <Arrow x1={28} y1={90} x2={28} y2={112} tone="ink" width={1.5} />
    </g>
  );
  const bracket = (o?: number) => (
    <g opacity={o}>
      <path d="M22,26 L22,96 L80,96 L80,86 L32,86 L32,26 Z" fill={C.soft} stroke={C.ink} strokeWidth={1.5} />
      {[
        [48, 30],
        [62, 46],
        [74, 26],
        [54, 62],
      ].map(([cx, cy], i) => (
        <path key={i} d={`M${cx},${cy} q4,7 0,9 q-4,-2 0,-9`} fill={C.muted} />
      ))}
    </g>
  );
  return (
    <AnimatedFigure
      height={290}
      duration={4.8}
      alt="Four tiles: a bolt at 600 degrees C for 1000 hours labeled creep, a rod reversed a million times labeled fatigue, a scratched thin wall labeled fracture, and a bracket outdoors for ten years labeled corrosion."
      steps={[
        {
          at: 0,
          label: "Service",
          caption: "Four parts on one desk: a hot bolt held for a thousand hours, a rod reversed a million times, a scratched thin wall, a bracket outdoors.",
        },
        {
          at: 2.6,
          label: "Mechanism",
          caption: "The hot bolt is creep, the rod is fatigue, the scratch is fracture, and the rust is corrosion.",
        },
        {
          at: 3.95,
          label: "Not yield",
          caption: "Read the service, not the datasheet. Room-temperature yield comes first in none of these four.",
        },
      ]}
    >
      {({ t }) => {
        // Each service first, then the mechanism it names, in the lesson's order.
        const shown = (i: number) => op(seg(t, 0.4 + 0.45 * i, 0.9 + 0.45 * i));
        const named = (i: number) => op(seg(t, 2.6 + 0.45 * i, 3.1 + 0.45 * i));
        return (
          <>
            {tile(10, 16, bolt(shown(0)), "600°C, 1000 h", "creep", shown(0), named(0))}
            {tile(250, 16, rod(shown(1)), "10⁶ reversals", "fatigue", shown(1), named(1))}
            {tile(10, 154, wall(shown(2)), "scratched wall", "fracture", shown(2), named(2))}
            {tile(250, 154, bracket(shown(3)), "10 yr outdoors", "corrosion", shown(3), named(3))}
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** Stress corrosion: zero in dry air; wet, zero under 120 MPa and 0.04 mm/yr at 200 MPa. */
function Scc() {
  const b = plotBox({ x: 80, y: 40, w: 330, h: 170, xMin: 0, xMax: 240, yMin: 0, yMax: 0.07 });
  const wet = (s: number) => (s <= 120 ? 0 : (0.04 * (s - 120)) / 80);
  const wetPts = sample(wet, 0, 240, 240);
  /** Stress on the wet tube, MPa: 200, then dropped under the threshold to 80. */
  const stress = (t: number) => lerp(200, 80, seg(t, 3.4, 4.8));
  return (
    <AnimatedFigure
      height={280}
      duration={5.4}
      alt="Crack growth rate against stress: in dry air the rate is zero everywhere; with the corrodent it is zero below a 120 MPa threshold and climbs to 0.04 mm per year at 200 MPa."
      steps={[
        { at: 0, label: "Dry air", caption: "In dry air the crack growth on this page is 0, whatever the stress." },
        {
          at: 1.6,
          label: "Wet",
          caption: "With the corrodent present, the stainless tube at 200 MPa grows its crack 0.04 mm per year.",
        },
        { at: 3.4, label: "Unload", caption: "Drop the stress under 120 MPa and the wet tube stops as well." },
        {
          at: 4.8,
          label: "Both",
          caption: "Growth needs both the tension over the threshold and the chemical. Take either away and the rate is zero.",
        },
      ]}
      readouts={(t) => {
        const s = stress(t);
        const r = wet(s);
        return [
          { label: "stress", value: `${Math.round(s)} MPa` },
          { label: "dry", value: "0 mm/yr" },
          { label: "wet", value: r > 0 ? `${r.toFixed(3)} mm/yr` : "0 mm/yr", tone: "accent" },
        ];
      }}
    >
      {({ t }) => {
        const dry = seg(t, 0.4, 1.2);
        const w = seg(t, 1.6, 2.8);
        const at200 = op(seg(t, 2.5, 3));
        const s = stress(t);
        const asleep = seg(t, 4.2, 4.7); // the tube has dropped under 120
        const at80 = op(seg(t, 4.8, 5.3));
        return (
          <>
            <rect x={b.px(0)} y={b.y} width={b.px(120) - b.px(0)} height={b.h} fill={C.soft} opacity={0.5 * asleep} />
            <Frame
              b={b}
              xLabel="stress, MPa"
              yLabel="crack growth, mm/yr"
              xTicks={[
                [80, "80", undefined, at80],
                [120, "120", undefined, op(asleep)],
                [200, "200", "accent", at200],
              ]}
            />
            <Label x={b.px(60)} y={b.y + 20} tone="muted" size={15} opacity={op(asleep)}>under 120: asleep</Label>
            {w > 0 ? <Curve d={b.path(partial(wetPts, w))} /> : null}
            {dry > 0 ? (
              <Curve
                d={b.path([
                  [0, 0.002],
                  [lerp(0, 240, dry), 0.002],
                ])}
                tone="ink"
                width={2}
                dashed
              />
            ) : null}
            <Guide x1={b.px(200)} y1={b.py(0.04)} x2={b.px(200)} y2={b.y + b.h} opacity={at200} />
            <Dot x={b.px(200)} y={b.py(0.04)} r={6} opacity={at200} />
            {/* the wet tube, unloaded from 200 MPa to 80 */}
            <Dot x={b.px(s)} y={b.py(wet(s))} tone="ink" opacity={op(seg(t, 3.4, 3.7))} />
            <Label x={b.px(200) - 12} y={b.py(0.04) - 16} anchor="end" tone="accent" weight={600} opacity={at200}>
              0.04 mm/yr
            </Label>
            <Label x={b.px(232)} y={b.py(0.06) - 18} anchor="end" tone="accent" size={15} opacity={op(seg(t, 2.8, 3.3))}>
              wet
            </Label>
            <Label x={b.px(40)} y={b.py(0) - 16} tone="ink" size={15} opacity={op(seg(t, 0.9, 1.4))}>
              dry air: 0
            </Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/* ---------- engineering-201 ---------- */

/** von Mises: 100 MPa tension plus 60 MPa shear gives √(100² + 3×60²) ≈ 144 MPa. */
function Mises() {
  const cx = 128;
  const cy = 140;
  const h = 48;
  return (
    <AnimatedFigure
      height={280}
      duration={5}
      alt="A square stress element pulled by 100 MPa of tension on its left and right faces and sheared by 60 MPa along all four faces, beside the calculation square root of 100 squared plus 3 times 60 squared, about 144 MPa."
      steps={[
        { at: 0, label: "Tension", caption: "A point with 100 MPa of tension and no shear: von Mises is just the 100 MPa." },
        { at: 1.8, label: "Shear", caption: "Add 60 MPa of shear on all four faces; the tension does not change." },
        {
          at: 3,
          label: "Combine",
          caption: "Yielding watches a combination: the square root of the tension squared plus three times the shear squared.",
        },
        {
          at: 4,
          label: "Yield check",
          caption: "The tension never changed. The shear arrived, and the number yield actually watches went from 100 to 144 MPa.",
        },
      ]}
    >
      {({ t }) => {
        const pull = seg(t, 0.4, 1);
        const shear = seg(t, 1.8, 2.5);
        return (
          <>
            <rect x={cx - h} y={cy - h} width={2 * h} height={2 * h} fill={C.soft} stroke={C.ink} strokeWidth={2} />
            {/* tension */}
            <GrowArrow p={pull} x1={cx + h + 2} y1={cy} x2={cx + h + 66} y2={cy} tone="ink" />
            <GrowArrow p={pull} x1={cx - h - 2} y1={cy} x2={cx - h - 66} y2={cy} tone="ink" />
            <Label x={cx + h + 54} y={cy + 20} size={15} opacity={op(seg(t, 0.7, 1.2))}>σ 100</Label>
            {/* shear couple */}
            <GrowArrow p={shear} x1={cx - 34} y1={cy - h - 10} x2={cx + 34} y2={cy - h - 10} />
            <GrowArrow p={shear} x1={cx + 34} y1={cy + h + 10} x2={cx - 34} y2={cy + h + 10} />
            <GrowArrow p={shear} x1={cx + h + 12} y1={cy + 34} x2={cx + h + 12} y2={cy - 34} />
            <GrowArrow p={shear} x1={cx - h - 12} y1={cy - 34} x2={cx - h - 12} y2={cy + 34} />
            <Label x={cx} y={cy - h - 30} tone="accent" size={15} opacity={op(seg(t, 2.1, 2.6))}>τ 60</Label>

            <Label x={272} y={70} anchor="start" tone="muted" size={15} opacity={op(seg(t, 1, 1.5))}>
              shear 0:  100 MPa
            </Label>
            <Label x={272} y={130} anchor="start" size={18} serif opacity={op(seg(t, 3, 3.5))}>
              √(100² + 3 × 60²)
            </Label>
            <Label x={272} y={172} anchor="start" size={22} tone="accent" weight={600} serif opacity={op(seg(t, 4, 4.5))}>
              ≈ 144 MPa
            </Label>
            <Label x={272} y={216} anchor="start" tone="muted" size={15} opacity={op(seg(t, 4.3, 4.8))}>
              compare with yield
            </Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** Torsion: 200 N·m on r = 10 mm gives about 127 MPa at the skin; on r = 20 mm about 16 MPa. */
function Torsion() {
  const tau = (r: number) => (2 * 200) / (Math.PI * (r / 1000) ** 3) / 1e6;
  const scale = 60 / tau(10);
  /** A shaft section with its stress wedge grown out from the axis to `p` of the radius. */
  const shaft = (cx: number, cy: number, R: number, rmm: number, label: string, p: number, named?: number) => {
    const L = tau(rmm) * scale;
    const r = lerp(0, R, p);
    return (
      <g>
        <circle cx={cx} cy={cy} r={R} fill={C.surface} stroke={C.ink} strokeWidth={2} />
        {p > 0.02 ? (
          <polygon points={`${cx},${cy} ${cx},${cy - r} ${cx + lerp(0, L, p)},${cy - r}`} fill={C.soft} stroke={C.accent} strokeWidth={2} />
        ) : null}
        <line x1={cx} y1={cy} x2={cx} y2={cy - R} stroke={C.ink} strokeWidth={1.5} />
        <circle cx={cx} cy={cy} r={3} fill={C.ink} />
        <Label x={cx + L + 8} y={cy - R - 2} anchor="start" tone="accent" weight={600} opacity={named}>
          {label}
        </Label>
        <Label x={cx} y={cy + R + 22} tone="muted" size={15}>
          r = {rmm} mm
        </Label>
      </g>
    );
  };
  return (
    <AnimatedFigure
      height={270}
      duration={4}
      alt="Cross-sections of a 10 mm and a 20 mm radius shaft each carrying 200 N·m, with shear stress drawn as a wedge from zero at the axis to about 127 MPa at the small shaft's surface and about 16 MPa at the large one's."
      steps={[
        { at: 0, label: "Same torque", caption: "A solid shaft of 10 mm radius and one of 20 mm carry the same 200 N·m." },
        {
          at: 0.9,
          label: "10 mm",
          caption: "The shear stress climbs from zero on the axis to about 127 MPa at the 10 mm shaft's skin.",
        },
        {
          at: 2.5,
          label: "20 mm",
          caption: "Stress is zero on the axis and peaks at the skin. Double the radius and that peak falls by eight.",
        },
      ]}
    >
      {({ t }) => (
        <>
          <Label x={240} y={20} tone="muted" size={15}>same 200 N·m on both</Label>
          {shaft(90, 140, 45, 10, "≈127 MPa", seg(t, 0.9, 1.9), op(seg(t, 1.6, 2.1)))}
          {shaft(330, 140, 90, 20, "≈16 MPa", seg(t, 2.5, 3.3), op(seg(t, 3.1, 3.6)))}
        </>
      )}
    </AnimatedFigure>
  );
}

/** Thin-walled tank: hoop 2 × 200 / 4 = 100 MPa, along the axis half, 50 MPa. */
function Hoop() {
  const x1 = 50;
  const x2 = 350;
  const top = 96;
  const bot = 216;
  const cy = (top + bot) / 2;
  const ex = 200;
  const s = 20;
  return (
    <AnimatedFigure
      height={290}
      duration={3.8}
      alt="A closed thin-walled cylindrical tank with a small wall element pulled by 100 MPa of hoop stress around the tank and 50 MPa along its axis; the tank is 200 mm radius, 4 mm wall, 2 MPa inside."
      steps={[
        { at: 0, label: "Tank", caption: "A closed tank with a 4 mm wall and a 200 mm radius holds 2 MPa." },
        { at: 1.2, label: "Hoop", caption: "Around the wall, the hoop stress is 2 × 200 / 4 = 100 MPa." },
        {
          at: 2.6,
          label: "Along",
          caption: "The around-the-middle stress is twice the lengthwise one, which is why a seam along the tank is the one to design first.",
        },
      ]}
    >
      {({ t }) => {
        const hoop = seg(t, 1.2, 1.8);
        const along = seg(t, 2.6, 3.1);
        return (
          <>
            <path
              d={`M${x1},${top} L${x2},${top} A22,${(bot - top) / 2} 0 0 1 ${x2},${bot} L${x1},${bot} A22,${(bot - top) / 2} 0 0 1 ${x1},${top} Z`}
              fill={C.soft}
              stroke={C.ink}
              strokeWidth={2}
            />
            <ellipse cx={x1} cy={cy} rx={22} ry={(bot - top) / 2} fill="none" stroke={C.ink} strokeWidth={1.5} strokeDasharray="4 4" />
            <line x1={x1 - 30} y1={cy} x2={x2 + 40} y2={cy} stroke={C.muted} strokeWidth={1.2} strokeDasharray="10 4 2 4" />
            <rect
              x={ex - s}
              y={cy - s}
              width={2 * s}
              height={2 * s}
              fill={C.surface}
              stroke={C.ink}
              strokeWidth={2}
              opacity={op(seg(t, 0.4, 0.9))}
            />
            {/* hoop (around) */}
            <GrowArrow p={hoop} x1={ex} y1={cy - s - 2} x2={ex} y2={cy - s - 44} />
            <GrowArrow p={hoop} x1={ex} y1={cy + s + 2} x2={ex} y2={cy + s + 44} />
            {/* longitudinal (along) */}
            <GrowArrow p={along} x1={ex + s + 2} y1={cy} x2={ex + s + 24} y2={cy} tone="ink" />
            <GrowArrow p={along} x1={ex - s - 2} y1={cy} x2={ex - s - 24} y2={cy} tone="ink" />
            <Label x={ex + 12} y={cy - s - 50} anchor="start" tone="accent" weight={600} opacity={op(seg(t, 1.6, 2.1))}>
              hoop 100 MPa
            </Label>
            <Label x={ex + s + 30} y={cy + 20} anchor="start" size={15} opacity={op(seg(t, 2.9, 3.4))}>
              along 50 MPa
            </Label>
            <Label x={240} y={272} tone="muted" size={15}>p = 2 MPa · r = 200 mm · t = 4 mm</Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** Eccentric load: 20 kN on a 40 mm square post, 20 mm off center, 12.5 + 37.5 = 50 MPa on the near face. */
function Eccentric() {
  const L = 180;
  const R = 300;
  const mid = (L + R) / 2;
  const base = 240;
  const k = 1.1; // px per MPa
  const x0 = L + ((R - L) * 25) / 75; // zero crossing of the stress line
  /** Share of the way from on center to the 20 mm miss. */
  const miss = (t: number) => seg(t, 1.6, 3.2);
  return (
    <AnimatedFigure
      height={330}
      duration={4.4}
      alt="A 40 mm square post loaded with 20 kN placed 20 mm off its center line, and below it the stress across the section: average 12.5 MPa dashed, rising to 50 MPa on the loaded face and dropping past zero on the far face."
      steps={[
        { at: 0, label: "On center", caption: "On center, 20 kN on a 40 mm square is only P/A = 12.5 MPa, the same everywhere." },
        {
          at: 1.6,
          label: "Offset",
          caption: "Move the same load 20 mm off center and it adds bending: high stress on one face, less on the other.",
        },
        {
          at: 3.2,
          label: "Peak",
          caption: "The load never grew. Moving its line 20 mm quadrupled the peak, so check the high face, not P/A.",
        },
      ]}
      readouts={(t) => {
        const e = 20 * miss(t);
        return [
          { label: "offset", value: `${Math.round(e)} mm` },
          { label: "P/A", value: "12.5 MPa" },
          { label: "peak", value: `${(12.5 + (37.5 * e) / 20).toFixed(1)} MPa`, tone: "accent" },
        ];
      }}
    >
      {({ t }) => {
        const p = miss(t);
        const X = lerp(mid, R, p); // the load's line of action
        // Stress across the section (compression drawn down): P/A plus the bending the miss adds at each face.
        const bend = 37.5 * p;
        const sig = (x: number) => 12.5 + (bend * (x - mid)) / (R - mid);
        const xz = bend > 12.5 ? mid - (12.5 * (R - mid)) / bend : L; // where the stress crosses zero
        const comp =
          p === 1
            ? `${x0},${base} ${R},${base} ${R},${base + 50 * k}`
            : `${xz},${base} ${R},${base} ${R},${base + sig(R) * k} ${xz},${base + sig(xz) * k}`;
        const block = op(seg(t, 0.4, 0.9));
        const end = op(seg(t, 3.2, 3.7));
        return (
          <>
            <g opacity={end}>
              <DimH x1={mid} x2={R} y={44} label="20 mm" />
            </g>
            <Arrow x1={X} y1={6} x2={X} y2={66} width={3.5} />
            <Label x={X + 12} y={16} anchor="start" tone="accent" weight={600}>20 kN</Label>
            <rect x={L} y={70} width={R - L} height={110} fill={C.soft} stroke={C.ink} strokeWidth={2} />
            <line x1={mid} y1={58} x2={mid} y2={192} stroke={C.muted} strokeWidth={1.2} strokeDasharray="10 4 2 4" />
            <Label x={L + 30} y={115} size={15} tone="muted">40 mm</Label>
            <Label x={L + 30} y={135} size={15} tone="muted">square</Label>

            {/* stress across the section, compression drawn downward */}
            <polygon points={comp} fill={C.soft} stroke={C.accent} strokeWidth={2} opacity={block} />
            {p === 1 || xz > L ? (
              <polygon
                points={p === 1 ? `${L},${base} ${x0},${base} ${L},${base - 25 * k}` : `${L},${base} ${xz},${base} ${L},${base + sig(L) * k}`}
                fill="none"
                stroke={C.alarm}
                strokeWidth={2}
              />
            ) : null}
            <line x1={L - 20} y1={base} x2={R + 20} y2={base} stroke={C.ink} strokeWidth={1.5} opacity={block} />
            <line
              x1={L}
              y1={base + 12.5 * k}
              x2={R}
              y2={base + 12.5 * k}
              stroke={C.ink}
              strokeWidth={1.5}
              strokeDasharray="6 5"
              opacity={block}
            />
            <Label x={R + 10} y={base + 50 * k} anchor="start" tone="accent" weight={600} opacity={end}>50 MPa</Label>
            <Label x={L - 10} y={base + 12.5 * k} anchor="end" size={15} opacity={block}>P/A 12.5</Label>
            <Label x={L - 10} y={base - 22} anchor="end" size={15} tone="alarm" opacity={op(seg(t, 2.6, 3.1))}>
              far face
            </Label>
            <Label x={240} y={318} tone="muted" size={15} opacity={op(seg(t, 3.5, 4))}>
              12.5 + 37.5 = 50 MPa, four times the average
            </Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** Single-shear pin: 4000 N over π d²/4: 8 mm gives 79.6 MPa, 16 mm gives 19.9 MPa. */
function PinShear() {
  return (
    <AnimatedFigure
      height={260}
      duration={4.8}
      alt="A pin through two overlapping plates pulled apart with 4000 N, cut by one shear plane, beside cross-sections of an 8 mm pin at 79.6 MPa and a 16 mm pin at 19.9 MPa."
      steps={[
        { at: 0, label: "Load", caption: "An 8 mm clevis pin carries a 4000 N cable across one face." },
        {
          at: 1.3,
          label: "Shear plane",
          caption: "Shear stress is the load divided by that one circular area, π times diameter squared over 4.",
        },
        {
          at: 2.4,
          label: "8 mm",
          caption: "The 8 mm circle is about 50 mm², so the stress is 4000 / 50, more precisely 79.6 MPa.",
        },
        {
          at: 3.4,
          label: "16 mm",
          caption: "One slice carries the whole load. Double the diameter and the circle's area grows four times, so the stress falls to a quarter.",
        },
      ]}
    >
      {({ t }) => {
        const pull = seg(t, 0.4, 1);
        const plane = seg(t, 1.3, 1.8);
        const small = op(seg(t, 2.4, 2.9));
        const grow = seg(t, 3.4, 4); // the section doubles in diameter
        const big = op(seg(t, 3.8, 4.3));
        return (
          <>
            {/* lug on top, cable plate below */}
            <rect x={30} y={80} width={160} height={34} fill={C.soft} stroke={C.ink} strokeWidth={2} />
            <rect x={110} y={114} width={130} height={34} fill={C.soft} stroke={C.ink} strokeWidth={2} />
            <rect x={140} y={66} width={20} height={96} fill={C.surface} stroke={C.ink} strokeWidth={2} />
            {plane > 0.02 ? (
              <line x1={lerp(150, 128, plane)} y1={114} x2={lerp(150, 172, plane)} y2={114} stroke={C.accent} strokeWidth={4} />
            ) : null}
            <GrowArrow p={pull} x1={30} y1={97} x2={4} y2={97} tone="ink" />
            <GrowArrow p={pull} x1={240} y1={131} x2={268} y2={131} tone="ink" />
            <Label x={250} y={106} size={15} opacity={op(seg(t, 0.7, 1.2))}>4000 N</Label>
            <Label x={150} y={186} tone="accent" size={15} opacity={op(plane)}>one shear plane</Label>
            <GrowArrow p={plane} x1={150} y1={174} x2={150} y2={120} tone="muted" width={1.5} />

            <circle cx={330} cy={110} r={16} fill={C.accent} opacity={small} />
            <circle
              cx={420}
              cy={110}
              r={lerp(16, 32, grow)}
              fill={C.soft}
              stroke={C.accent}
              strokeWidth={2}
              opacity={op(seg(t, 3.4, 3.7))}
            />
            <Label x={330} y={160} size={15} tone="muted" opacity={small}>8 mm</Label>
            <Label x={330} y={184} tone="accent" weight={600} opacity={small}>79.6 MPa</Label>
            <Label x={420} y={160} size={15} tone="muted" opacity={big}>16 mm</Label>
            <Label x={420} y={184} weight={600} opacity={big}>19.9 MPa</Label>
            <Label x={375} y={228} tone="muted" size={15} opacity={op(seg(t, 4.1, 4.6))}>
              area × 4, stress ÷ 4
            </Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** Archard wear: 1000 × 10⁻⁴ × 200 × 1000 / 1000 = 20 mm³; double H → 10, double distance → 40. */
function Wear() {
  const unit = 4; // px per mm³
  /** A result bar grown to `p` of its length; its value rides the tip. */
  const row = (y: number, name: string, v: number, hi: boolean, p: number) => (
    <g>
      <Label x={180} y={y} anchor="end" size={15} tone={hi ? "ink" : "muted"} opacity={op(p)}>
        {name}
      </Label>
      <rect x={192} y={y - 9} width={v * unit * p} height={18} fill={hi ? C.accent : C.soft} stroke={C.accent} strokeWidth={1.5} />
      <Label
        x={200 + v * unit * p}
        y={y}
        anchor="start"
        size={15}
        tone={hi ? "accent" : "ink"}
        weight={hi ? 600 : undefined}
        opacity={op(clamp(2 * p - 1))}
      >
        {v} mm³
      </Label>
    </g>
  );
  /** Share of the 1000 m slid. */
  const slid = (t: number) => seg(t, 0.6, 2.4);
  return (
    <AnimatedFigure
      height={300}
      duration={4.4}
      alt="A block pressed down with 200 N sliding 1000 m over a surface, leaving debris; bars compare 20 cubic mm lost as given, 10 with double hardness and 40 with double distance."
      steps={[
        {
          at: 0,
          label: "Slider",
          caption: "A dry slider presses 200 N on a face of hardness 1000 MPa, with a wear coefficient of 10⁻⁴.",
        },
        { at: 0.6, label: "Slide", caption: "Over 1000 m it rubs off 1000 × 10⁻⁴ × 200 × 1000 / 1000 = 20 mm³." },
        {
          at: 3.1,
          label: "Levers",
          caption: "Load, distance and hardness set the pile. Yield strength never enters Archard's rule.",
        },
      ]}
      readouts={(t) => {
        const s = 1000 * slid(t);
        return [
          { label: "slid", value: `${Math.round(s)} m` },
          { label: "worn", value: `${Math.round(0.02 * s)} mm³`, tone: "accent" },
        ];
      }}
    >
      {({ t }) => {
        const dx = lerp(-150, 0, slid(t)); // the block slides in from the left, leaving debris behind
        return (
          <>
            <Ground x={30} y={140} w={420} />
            {[50, 72, 90, 110, 128, 150].map((x, i) => (
              <circle key={i} cx={x} cy={134 - (i % 2) * 3} r={3} fill={C.muted} opacity={op(clamp((180 + dx - x) / 20))} />
            ))}
            <Label x={100} y={110} tone="muted" size={15} opacity={op(seg(t, 2.2, 2.7))}>debris</Label>
            <g transform={dx ? `translate(${dx.toFixed(1)},0)` : undefined}>
              <rect x={180} y={90} width={100} height={50} rx={3} fill={C.soft} stroke={C.ink} strokeWidth={2} />
              <Label x={230} y={115} size={15}>H 1000</Label>
              <Arrow x1={230} y1={30} x2={230} y2={86} tone="ink" />
              <Label x={242} y={40} anchor="start" size={15}>200 N</Label>
              <Arrow x1={292} y1={115} x2={430} y2={115} />
              <Label x={360} y={96} tone="accent" weight={600}>1000 m</Label>
            </g>

            {row(190, "as given", 20, true, seg(t, 2.4, 2.9))}
            {row(224, "2× hardness", 10, false, seg(t, 3.1, 3.6))}
            {row(258, "2× distance", 40, false, seg(t, 3.4, 4))}
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/* ---------- engineering-301 ---------- */

/** Critical speed falls with L^1.5: about 7300 rpm at 0.40 m, about 2600 rpm at 0.80 m. */
function Whirl() {
  const b = plotBox({ x: 80, y: 40, w: 330, h: 180, xMin: 0.3, xMax: 0.9, yMin: 0, yMax: 12000 });
  const N = (L: number) => 7329 * (0.4 / L) ** 1.5;
  const pts = sample(N, 0.3, 0.9);
  /** Shaft length, m: 0.40, stretched to 0.80 with the motor left alone. */
  const len = (t: number) => lerp(0.4, 0.8, seg(t, 2.6, 4));
  return (
    <AnimatedFigure
      height={290}
      duration={4.9}
      alt="Critical speed against shaft length, a curve falling as length to the minus 1.5: about 7300 rpm at 0.40 m and about 2600 rpm at 0.80 m."
      steps={[
        { at: 0, label: "Curve", caption: "A shaft's critical speed falls with its length to the 1.5 power." },
        { at: 1.6, label: "0.40 m", caption: "The shaft runs happily at 0.40 m long, with a critical speed of about 7300 rpm." },
        { at: 2.6, label: "Stretch", caption: "Stretch the same shaft to 0.80 m and leave the motor alone." },
        {
          at: 4,
          label: "Recompute",
          caption: "Twice the length, about 2.8 times lower critical speed. The old running rpm may now sit right on it.",
        },
      ]}
      readouts={(t) => {
        const L = len(t);
        return [
          { label: "length", value: `${L.toFixed(2)} m` },
          { label: "critical speed", value: `≈${Math.round(N(L) / 100) * 100} rpm`, tone: "accent" },
        ];
      }}
    >
      {({ t }) => {
        const curve = seg(t, 0.4, 1.6);
        const first = op(seg(t, 1.6, 2.1));
        const L = len(t);
        const done = op(seg(t, 4, 4.5));
        return (
          <>
            <Frame
              b={b}
              xLabel="shaft length, m"
              yLabel="critical speed"
              xTicks={[
                [0.4, "0.40", undefined, first],
                [0.8, "0.80", "accent", done],
              ]}
            />
            {curve > 0 ? <Curve d={b.path(partial(pts, curve))} /> : null}
            <Guide x1={b.px(0.4)} y1={b.py(N(0.4))} x2={b.px(0.4)} y2={b.y + b.h} opacity={first} />
            <Guide x1={b.px(0.8)} y1={b.py(N(0.8))} x2={b.px(0.8)} y2={b.y + b.h} opacity={done} />
            <Dot x={b.px(0.4)} y={b.py(N(0.4))} tone="ink" r={6} opacity={first} />
            <Dot x={b.px(L)} y={b.py(N(L))} r={6} opacity={op(seg(t, 2.6, 2.9))} />
            <Label x={b.px(0.4) + 12} y={b.py(N(0.4)) - 8} anchor="start" weight={600} opacity={first}>≈7300 rpm</Label>
            <Label x={b.px(0.8)} y={b.py(N(0.8)) - 26} tone="accent" weight={600} opacity={done}>≈2600 rpm</Label>
            <Label x={b.px(0.6) + 16} y={b.py(N(0.6)) - 22} anchor="start" tone="muted" size={15} opacity={op(seg(t, 4.3, 4.8))}>
              ÷ 2.8
            </Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** Spur-gear outline: trapezoid teeth around a pitch circle. */
function gearPath(cx: number, cy: number, r: number, teeth: number, depth: number, phase: number) {
  const step = (2 * Math.PI) / teeth;
  const pts: string[] = [];
  const at = (rad: number, a: number) => `${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`;
  for (let i = 0; i < teeth; i++) {
    const c = phase + i * step;
    pts.push(at(r - depth, c - step * 0.5));
    pts.push(at(r - depth, c - step * 0.28));
    pts.push(at(r + depth, c - step * 0.14));
    pts.push(at(r + depth, c + step * 0.14));
    pts.push(at(r - depth, c + step * 0.28));
  }
  return `M${pts.join(" L")} Z`;
}

/** Gear pair: 20 teeth driving 60, 10 N·m in, 30 N·m out (lossless), one third the speed. */
function Gears() {
  const r1 = 34;
  const r2 = 102;
  const cy = 150;
  const c1 = 140;
  const c2 = c1 + r1 + r2;
  const arc = (cx: number, r: number, a0: number, a1: number, sweep: 0 | 1) => {
    const p = (a: number) => `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
    return `M${p(a0)} A${r},${r} 0 0 ${sweep} ${p(a1)}`;
  };
  const big = gearPath(c2, cy, r2, 60, 4, Math.PI / 60);
  const small = gearPath(c1, cy, r1, 20, 4, 0);
  const duration = 4.4;
  const spin = 360 / (duration + HOLD); // deg/s: one small-gear turn per loop, so the loop is seamless
  return (
    <AnimatedFigure
      height={300}
      duration={duration}
      alt="A 20-tooth gear driving a 60-tooth gear: 10 N·m in on the small fast gear, 30 N·m out on the large gear at one third the speed, turning the opposite way."
      steps={[
        { at: 0, label: "Mesh", caption: "A 20-tooth gear drives a 60-tooth gear, lossless for a moment." },
        {
          at: 1.2,
          label: "Speed",
          caption: "Speed out is one third: the small gear turns faster, and the big one turns the opposite way.",
        },
        { at: 2.4, label: "Torque in", caption: "10 N·m goes in on the small, fast gear." },
        {
          at: 3.4,
          label: "Torque out",
          caption: "Three times the torque, one third the speed. Power is not tripled, and a real mesh gives a little under 30.",
        },
      ]}
    >
      {({ t, raw }) => {
        // Small gear clockwise, big gear a third as fast the other way; at raw = duration both are at the static pose.
        const a = spin * (raw - duration);
        const turn = seg(t, 1.2, 1.8);
        const teeth = op(seg(t, 0.4, 0.9));
        return (
          <>
            <path d={big} fill={C.soft} stroke={C.ink} strokeWidth={1.5} transform={a ? `rotate(${(-a / 3).toFixed(2)} ${c2} ${cy})` : undefined} />
            <path d={small} fill={C.surface} stroke={C.ink} strokeWidth={1.5} transform={a ? `rotate(${a.toFixed(2)} ${c1} ${cy})` : undefined} />
            <circle cx={c1} cy={cy} r={5} fill={C.ink} />
            <circle cx={c2} cy={cy} r={6} fill={C.ink} />
            {/* small gear clockwise, big gear counter-clockwise */}
            {turn > 0.02 ? (
              <>
                <path
                  d={arc(c1, r1 + 16, -2.6, lerp(-2.6, -0.9, turn), 1)}
                  fill="none"
                  stroke={C.ink}
                  strokeWidth={2.5}
                  markerEnd="url(#fig-arrow-ink)"
                />
                <path
                  d={arc(c2, r2 + 16, -0.9, lerp(-0.9, -2.0, turn), 0)}
                  fill="none"
                  stroke={C.accent}
                  strokeWidth={2.5}
                  markerEnd="url(#fig-arrow-accent)"
                />
              </>
            ) : null}
            <Label x={c1} y={cy + r1 + 30} size={15} tone="muted" opacity={teeth}>20 teeth</Label>
            <Label x={c1} y={cy + r1 + 54} weight={600} opacity={op(seg(t, 2.4, 2.9))}>10 N·m in</Label>
            <Label x={c1} y={cy + r1 + 76} size={15} tone="muted" opacity={op(seg(t, 1.4, 1.9))}>fast</Label>
            <Label x={c2} y={cy - 36} size={15} tone="muted" opacity={teeth}>60 teeth</Label>
            <Label x={c2} y={cy + 30} tone="accent" weight={600} opacity={op(seg(t, 3.4, 3.9))}>30 N·m out</Label>
            <Label x={c2} y={cy + 54} size={15} opacity={op(seg(t, 1.6, 2.1))}>⅓ speed</Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** Bearing L10 = (C/P)³ million rev: C = 20 kN gives 125 at 4 kN and about 15.6 at 8 kN. */
function Bearing() {
  const b = plotBox({ x: 80, y: 40, w: 330, h: 180, xMin: 3, xMax: 10, yMin: 0, yMax: 320 });
  const Lf = (P: number) => (20 / P) ** 3;
  const pts = sample(Lf, 3.1, 10);
  /** Load on the bearing, kN: 4, then doubled to 8. */
  const load = (t: number) => lerp(4, 8, seg(t, 2.6, 4));
  return (
    <AnimatedFigure
      height={290}
      duration={4.9}
      alt="Ball bearing life in millions of revolutions against load for C equals 20 kN: 125 million at 4 kN falling to about 15.6 million at 8 kN."
      steps={[
        { at: 0, label: "Curve", caption: "For a ball bearing with C = 20 kN, the L10 life is (C/P)³ million revolutions." },
        { at: 1.6, label: "4 kN", caption: "At 4 kN, (20/4)³ = 125 million revolutions." },
        { at: 2.6, label: "8 kN", caption: "Double the load to 8 kN: (20/8)³ ≈ 15.6 million, one eighth." },
        {
          at: 4,
          label: "Reprice",
          caption: "Twice the load, one eighth the life. The catalog life only held at the load it was priced for.",
        },
      ]}
      readouts={(t) => {
        const P = load(t);
        const L = Lf(P);
        return [
          { label: "P", value: `${P.toFixed(1)} kN` },
          { label: "L10", value: `${L >= 100 ? L.toFixed(0) : L.toFixed(1)} million rev`, tone: "accent" },
        ];
      }}
    >
      {({ t }) => {
        const curve = seg(t, 0.4, 1.6);
        const first = op(seg(t, 1.6, 2.1));
        const P = load(t);
        const done = op(seg(t, 4, 4.5));
        return (
          <>
            <Frame
              b={b}
              xLabel="load P, kN   (C = 20 kN)"
              yLabel="L10, million rev"
              xTicks={[
                [4, "4", undefined, first],
                [8, "8", "accent", done],
              ]}
            />
            {curve > 0 ? <Curve d={b.path(partial(pts, curve))} /> : null}
            <Guide x1={b.px(4)} y1={b.py(Lf(4))} x2={b.px(4)} y2={b.y + b.h} opacity={first} />
            <Guide x1={b.px(8)} y1={b.py(Lf(8))} x2={b.px(8)} y2={b.y + b.h} opacity={done} />
            <Dot x={b.px(4)} y={b.py(125)} tone="ink" r={6} opacity={first} />
            <Dot x={b.px(P)} y={b.py(Lf(P))} r={6} opacity={op(seg(t, 2.6, 2.9))} />
            <Label x={b.px(4) + 14} y={b.py(125) - 6} anchor="start" weight={600} opacity={first}>125</Label>
            <Label x={b.px(8)} y={b.py(Lf(8)) - 26} tone="accent" weight={600} opacity={done}>15.6</Label>
            <Label x={b.px(6)} y={b.py(150)} tone="muted" size={15} opacity={op(seg(t, 4.3, 4.8))}>
              2× load → ÷ 8
            </Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** Bolted joint: preload 15 kN, bolt takes 1/5 of new load until the joint opens at 1.25 × preload. */
function Preload() {
  const b = plotBox({ x: 80, y: 40, w: 330, h: 190, xMin: 0, xMax: 25, yMin: 0, yMax: 30 });
  const open = 15 * 1.25;
  const line: Array<[number, number]> = [
    [0, 15],
    [open, open],
    [25, 25],
  ];
  /** Bolt force for an external load P: a fifth of the new load while closed, all of it once open. */
  const bolt = (P: number) => (P < open ? 15 + P / 5 : P);
  const first = (t: number) => 10 * seg(t, 1, 2.4); // the 10 kN load arrives
  const second = (t: number) => 10 * seg(t, 4.2, 5.6); // then on to 20 kN
  return (
    <AnimatedFigure
      height={300}
      duration={6.4}
      alt="Bolt force against external load for a 15 kN preload: a shallow line rising to 17 kN at a 10 kN load, meeting the bolt-equals-load line where the joint opens, then 20 kN at a 20 kN load; a dashed line shows the wrong sum 15 plus P."
      steps={[
        { at: 0, label: "Preload", caption: "The joint is clamped to 15 kN before any external load arrives." },
        {
          at: 1,
          label: "10 kN",
          caption: "At 10 kN the bolt only rises to about 17 kN, because the clamped members take most of the new load.",
        },
        {
          at: 3.2,
          label: "Wrong sum",
          caption: "Do not add the full external load on top of 15 kN while the joint is still closed.",
        },
        {
          at: 4.2,
          label: "Opens",
          caption: "While the joint is closed the stiff members take most of a new load. Once it opens, the bolt carries all of it.",
        },
      ]}
      readouts={(t) => {
        const P = first(t) + second(t);
        return [
          { label: "P", value: `${P.toFixed(1)} kN` },
          { label: "bolt", value: `${bolt(P).toFixed(1)} kN`, tone: "accent" },
          { label: "joint", value: P < open ? "closed" : "open" },
        ];
      }}
    >
      {({ t }) => {
        const p1 = first(t);
        const P = p1 + second(t);
        const u = P + 5 * seg(t, 5.6, 6); // the line runs on to the edge once the load stops at 20
        const at10 = op(seg(t, 2.4, 2.9));
        const wrong = op(seg(t, 3.2, 3.7));
        const opened = op(seg(t, 5.25, 5.7));
        const at20 = op(seg(t, 5.6, 6.1));
        return (
          <>
            <Frame
              b={b}
              xLabel="external load P, kN"
              yLabel="bolt force, kN"
              xTicks={[
                [10, "10", undefined, at10],
                [20, "20", "accent", at20],
              ]}
              yTicks={[[15, "15"]]}
            />
            <Curve
              d={b.path([
                [0, 15],
                [15, 30],
              ])}
              tone="muted"
              width={2}
              dashed
              opacity={wrong}
            />
            <Label x={b.px(9.5)} y={b.py(27)} anchor="end" tone="muted" size={15} opacity={wrong}>not 15 + P</Label>
            <Curve
              d={b.path([
                [0, 0],
                [open, open],
              ])}
              tone="muted"
              width={1.5}
              dashed
              opacity={op(seg(t, 4.2, 4.7))}
            />
            {u > 0 ? <Curve d={b.path(upTo(line, u))} /> : null}
            <Guide x1={b.px(10)} y1={b.py(17)} x2={b.px(10)} y2={b.y + b.h} opacity={at10} />
            <Guide x1={b.px(20)} y1={b.py(20)} x2={b.px(20)} y2={b.y + b.h} opacity={at20} />
            {/* the first load rides the line to 10 kN; the second takes over from there to 20 */}
            <Dot x={b.px(p1)} y={b.py(bolt(p1))} r={6} opacity={op(seg(t, 0.4, 0.7))} />
            <Dot x={b.px(P)} y={b.py(bolt(P))} r={6} tone="ink" opacity={op(seg(t, 4.2, 4.5))} />
            <Dot x={b.px(open)} y={b.py(open)} r={4} tone="ink" opacity={opened} />
            <Label x={b.px(10)} y={b.py(17) - 22} tone="accent" weight={600} opacity={at10}>17</Label>
            <Label x={b.px(20) + 12} y={b.py(20) + 20} anchor="start" weight={600} opacity={at20}>20</Label>
            <Label x={b.px(open) - 10} y={b.py(open) - 20} anchor="middle" size={15} opacity={opened}>opens</Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** Helical spring seen side on, drawn as a zigzag of N coils; `p` winds the wire on from the left. */
function Coil({
  x1,
  x2,
  y,
  amp,
  coils,
  width,
  p = 1,
  opacity,
}: {
  x1: number;
  x2: number;
  y: number;
  amp: number;
  coils: number;
  width: number;
  p?: number;
  opacity?: number;
}) {
  const pitch = (x2 - x1) / coils;
  const pts: Array<[number, number]> = [[x1, y]];
  for (let i = 0; i < coils; i++) {
    const x = x1 + i * pitch;
    pts.push([x + pitch * 0.25, y - amp], [x + pitch * 0.75, y + amp], [x + pitch, y]);
  }
  const d = partial(pts, p)
    .map(([a, b], i) => `${i ? "L" : "M"}${a},${b}`)
    .join(" ");
  return (
    <g opacity={opacity}>
      <line x1={x1 - 12} y1={y - amp - 6} x2={x1 - 12} y2={y + amp + 6} stroke={C.ink} strokeWidth={3} />
      <line x1={x1 - 12} y1={y} x2={x1} y2={y} stroke={C.ink} strokeWidth={width} />
      {p > 0 ? <path d={d} fill="none" stroke={C.ink} strokeWidth={width} strokeLinejoin="round" /> : null}
    </g>
  );
}

/** Coil spring rate k = G d⁴ / (8 D³ N): 2 mm wire 2500 N/m, 4 mm wire 40000 N/m. */
function CoilSpring() {
  return (
    <AnimatedFigure
      height={262}
      duration={4.3}
      alt="The same 8-coil, 20 mm spring wound in 2 mm wire rated 2500 N/m and in 4 mm wire rated 40000 N/m, sixteen times stiffer."
      steps={[
        {
          at: 0,
          label: "2 mm wire",
          caption: "A return spring in 2 mm wire, 20 mm mean diameter and 8 active coils rates at 2500 N/m.",
        },
        { at: 1.9, label: "4 mm wire", caption: "Wind the same spring in 4 mm wire, twice as thick." },
        {
          at: 3.2,
          label: "16× rate",
          caption: "Same coil, same count, twice the wire: sixteen times the rate, because the wire diameter is to the fourth.",
        },
      ]}
    >
      {({ t }) => {
        const thick = op(seg(t, 1.9, 2.3));
        return (
          <>
            <Label x={48} y={28} anchor="start" size={15} tone="muted">2 mm wire</Label>
            <Coil x1={60} x2={290} y={76} amp={26} coils={8} width={2} p={seg(t, 0.4, 1.4)} />
            <Label x={310} y={76} anchor="start" weight={600} opacity={op(seg(t, 1.2, 1.7))}>2500 N/m</Label>

            <Label x={48} y={134} anchor="start" size={15} tone="muted" opacity={thick}>4 mm wire</Label>
            <Coil x1={60} x2={290} y={182} amp={26} coils={8} width={4.5} p={seg(t, 2, 3)} opacity={thick} />
            <Label x={310} y={182} anchor="start" tone="accent" weight={600} opacity={op(seg(t, 3.2, 3.7))}>
              40000 N/m
            </Label>

            <GrowArrow p={seg(t, 3.3, 3.9)} x1={350} y1={94} x2={350} y2={164} tone="accent" width={2} />
            <Label x={362} y={129} anchor="start" tone="accent" size={15} opacity={op(seg(t, 3.5, 4))}>× 16</Label>
            <Label x={175} y={242} tone="muted" size={15}>D 20 mm · 8 coils · G 80 GPa</Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** Size effect: L = (KIc/σy)² = (80/400)² m = 40 mm; 10 mm yields through, 200 mm can fracture first. */
function Scale() {
  const x0 = 40;
  const w = 400;
  const px = (mm: number) => x0 + (w * Math.log10(mm)) / 3;
  const Lx = px(40);
  const y = 110;
  return (
    <AnimatedFigure
      height={250}
      duration={4.8}
      alt="A logarithmic section-size scale from 1 to 1000 mm split at L equals 40 mm: a 10 mm section on the yield-first side and a 200 mm member on the fracture-can-come-first side."
      steps={[
        {
          at: 0,
          label: "Length",
          caption: "A KIc of 80 MPa√m and a yield of 400 MPa set a length: (80 / 400)² m = 0.04 m.",
        },
        {
          at: 1.3,
          label: "Border",
          caption: "That is 40 mm: a piece much smaller yields through, and a piece much larger can fracture first.",
        },
        { at: 2.6, label: "10 mm", caption: "A 10 mm ligament is under that length, so it yields through." },
        {
          at: 3.8,
          label: "200 mm",
          caption: "Same metal on both sides of 40 mm. The small coupon yields through; the big member can crack before its section yields.",
        },
      ]}
    >
      {({ t }) => {
        const split = op(seg(t, 1.3, 1.8));
        const sides = seg(t, 1.6, 2.1);
        const s10 = seg(t, 2.6, 3.2); // each section grows up from the scale
        const s200 = seg(t, 3.8, 4.4);
        return (
          <>
            <rect x={x0} y={y} width={Lx - x0} height={30} fill={C.soft} opacity={op(sides)} />
            <rect x={Lx} y={y} width={x0 + w - Lx} height={30} fill={C.alarm} opacity={0.18 * sides} />
            <rect x={x0} y={y} width={w} height={30} fill="none" stroke={C.ink} strokeWidth={1.5} />
            <line x1={Lx} y1={y - 10} x2={Lx} y2={y + 40} stroke={C.ink} strokeWidth={2.5} opacity={split} />
            <Label x={(x0 + Lx) / 2} y={y + 15} size={15} opacity={op(sides)}>yields first</Label>
            <Label x={(Lx + x0 + w) / 2} y={y + 15} size={15} tone="alarm" opacity={op(sides)}>fracture can win</Label>
            <Label x={Lx} y={y + 58} weight={600} opacity={split}>L = 40 mm</Label>

            {/* sections drawn above their sizes */}
            <rect x={px(10) - lerp(0, 6, s10)} y={y - 12 - lerp(0, 12, s10)} width={lerp(0, 12, s10)} height={lerp(0, 12, s10)} fill={C.accent} />
            <Label x={px(10)} y={y - 42} tone="accent" weight={600} opacity={op(seg(t, 2.9, 3.4))}>10 mm</Label>
            <rect
              x={px(200) - lerp(0, 20, s200)}
              y={y - 12 - lerp(0, 40, s200)}
              width={lerp(0, 40, s200)}
              height={lerp(0, 40, s200)}
              fill={C.alarm}
              opacity={0.8}
            />
            <Label x={px(200) + 28} y={y - 32} anchor="start" tone="alarm" weight={600} opacity={op(seg(t, 4.1, 4.6))}>
              200 mm
            </Label>

            {[1, 10, 100, 1000].map((v) => (
              <g key={v}>
                <line x1={px(v)} y1={y + 30} x2={px(v)} y2={y + 36} stroke={C.muted} strokeWidth={1.5} />
              </g>
            ))}
            <Label x={240} y={226} tone="muted" size={15} serif opacity={op(seg(t, 0.4, 0.9))}>
              (80 / 400)² m = 0.04 m
            </Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

export const ladderBFigures: FigureMap = {
  "materials-301/coldwork": ColdWork,
  "materials-301/quench": Quench,
  "materials-301/lever": Lever,
  "materials-301/fiber": Fiber,
  "materials-301/mixture": Mixture,
  "materials-301/transition": Transition,
  "materials-401/panel": Panel,
  "materials-401/sensitive": Sensitive,
  "materials-401/temper": Temper,
  "materials-401/duty": Duty,
  "materials-401/scc": Scc,
  "engineering-201/mises": Mises,
  "engineering-201/torsion": Torsion,
  "engineering-201/hoop": Hoop,
  "engineering-201/eccentric": Eccentric,
  "engineering-201/pinshear": PinShear,
  "engineering-201/wear": Wear,
  "engineering-301/whirl": Whirl,
  "engineering-301/gears": Gears,
  "engineering-301/bearing": Bearing,
  "engineering-301/preload": Preload,
  "engineering-301/coilspring": CoilSpring,
  "engineering-301/scale": Scale,
};
