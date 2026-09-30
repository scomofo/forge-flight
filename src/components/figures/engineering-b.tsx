import type { ReactNode } from "react";
import { Arrow, Axes, C, DimH, Label, WallV, plotBox, type FigureMap } from "./kit";
import { AnimatedFigure, GrowArrow, clamp, lerp, op, partial, seg } from "./motion";

/* ---------- local helpers ---------- */

type Tone = "ink" | "accent" | "muted" | "alarm";

/** Rounded tag with centred text (severity chips, week tags). */
function Chip({
  x,
  y,
  w,
  h = 26,
  tone = "ink",
  filled = false,
  children,
  size = 15,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  tone?: Tone;
  filled?: boolean;
  children: ReactNode;
  size?: number;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={h / 2}
        fill={filled ? C[tone] : C.surface}
        stroke={C[tone]}
        strokeWidth={1.5}
      />
      <Label x={x + w / 2} y={y + h / 2 + 1} size={size} weight={600} tone={filled ? undefined : tone}>
        {filled ? <tspan fill={C.surface}>{children}</tspan> : children}
      </Label>
    </g>
  );
}

/** Small x mark (rejected) or tick (kept). */
function Mark({ x, y, ok }: { x: number; y: number; ok: boolean }) {
  return ok ? (
    <path d={`M${x - 7},${y} L${x - 2},${y + 6} L${x + 8},${y - 7}`} fill="none" stroke={C.accent} strokeWidth={3} />
  ) : (
    <g stroke={C.alarm} strokeWidth={3}>
      <line x1={x - 6} y1={y - 6} x2={x + 6} y2={y + 6} />
      <line x1={x - 6} y1={y + 6} x2={x + 6} y2={y - 6} />
    </g>
  );
}

/* ---------- W26 ---------- */

/** processes: tolerance screen on a log axis; only processes left of ±0.05 survive. */
function Processes() {
  const x0 = 190;
  const w = 260;
  const lo = Math.log10(0.003);
  const px = (v: number) => x0 + ((Math.log10(v) - lo) / (0 - lo)) * w;
  const rows: Array<[string, string, number]> = [
    ["grinding", "±0.005", 0.005],
    ["CNC milling", "±0.025", 0.025],
    ["die casting", "±0.1", 0.1],
    ["FDM print", "±0.2", 0.2],
    ["sand casting", "±0.5", 0.5],
  ];
  const req = px(0.05);
  const top = 50;
  const dy = 36;
  const axisY = top + rows.length * dy;
  return (
    <AnimatedFigure
      height={300}
      duration={5.2}
      alt="Five manufacturing processes plotted by routine tolerance on a log axis, with a vertical line at the required ±0.05 mm; grinding and CNC milling fall left of the line and pass, die casting, FDM and sand casting fall right and fail."
      steps={[
        {
          at: 0,
          label: "Processes",
          caption:
            "Every process holds a routine tolerance: grinding ±0.005 mm, CNC milling ±0.025, die casting ±0.1, FDM ±0.2, sand casting ±0.5.",
        },
        {
          at: 1.9,
          label: "Requirement",
          caption: "The bracket's two hole positions need ±0.05 mm; a process coarser than that is out unless a secondary operation is added.",
        },
        {
          at: 3.1,
          label: "Screen",
          caption: "Grinding and CNC milling pass; die casting at ±0.1 fails outright, and FDM at ±0.2 is out four times over.",
        },
        {
          at: 4.4,
          label: "Winner",
          caption:
            "Tolerance is the first screen: only processes left of the ±0.05 mm line can hold the bracket's holes. CNC milling clears it and wins at about $42 a part.",
        },
      ]}
    >
      {({ t }) => {
        const drop = seg(t, 2, 2.5); // the requirement line comes down
        const band = seg(t, 2.3, 2.9); // the passing band sweeps out to it
        const crown = seg(t, 4.4, 4.9); // CNC milling named the winner
        return (
          <>
            {band > 0 ? <rect x={x0} y={top - 16} width={lerp(0, req - x0, band)} height={axisY - top + 16} fill={C.soft} /> : null}
            {drop > 0 ? (
              <line x1={req} y1={top - 24} x2={req} y2={lerp(top - 24, axisY, drop)} stroke={C.accent} strokeWidth={2.5} strokeDasharray="6 4" />
            ) : null}
            <Label x={req} y={top - 36} tone="accent" weight={600} opacity={op(seg(t, 2.1, 2.6))}>
              required ±0.05
            </Label>
            {rows.map(([name, tol, v], i) => {
              const y = top + i * dy + 4;
              const pass = v <= 0.05;
              const win = name === "CNC milling";
              const a = 0.4 + 0.25 * i;
              const judged = seg(t, 3.2 + 0.15 * i, 3.7 + 0.15 * i); // dot takes its pass/fail colour
              return (
                <g key={name} opacity={op(seg(t, a, a + 0.5))}>
                  <line x1={x0} y1={y} x2={x0 + w} y2={y} stroke={C.line} strokeWidth={1} />
                  {win && crown < 1 ? (
                    <Label x={x0 - 12} y={y} anchor="end" size={15} opacity={op(1 - crown)}>
                      {name} <tspan fill={C.muted}>{tol}</tspan>
                    </Label>
                  ) : null}
                  <Label
                    x={x0 - 12}
                    y={y}
                    anchor="end"
                    size={15}
                    tone={win ? "accent" : "ink"}
                    weight={win ? 700 : undefined}
                    opacity={win ? op(crown) : undefined}
                  >
                    {name} <tspan fill={C.muted}>{tol}</tspan>
                  </Label>
                  {judged < 1 ? <circle cx={px(v)} cy={y} r={7} fill={C.muted} /> : null}
                  <circle cx={px(v)} cy={y} r={7} fill={pass ? C.accent : C.alarm} opacity={op(judged)} />
                </g>
              );
            })}
            <line x1={x0} y1={axisY} x2={x0 + w} y2={axisY} stroke={C.ink} strokeWidth={1.5} />
            {[0.01, 0.1, 1].map((t) => (
              <g key={t}>
                <line x1={px(t)} y1={axisY} x2={px(t)} y2={axisY + 6} stroke={C.ink} strokeWidth={1.5} />
                <Label x={px(t)} y={axisY + 20} size={15} tone="muted" anchor={t === 1 ? "end" : "middle"}>
                  {t === 1 ? "1 mm" : String(t)}
                </Label>
              </g>
            ))}
            <Label x={20} y={axisY + 20} anchor="start" size={15} tone="muted">
              routine tolerance ± (log)
            </Label>
            <Label x={x0 + (req - x0) / 2} y={axisY + 44} size={15} tone="accent" opacity={op(seg(t, 2.6, 3.1))}>
              passes
            </Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** tolerances: 50/30/20 stack in a 100.20 cavity; worst-case 100.25 fails, RSS 100.15 passes. */
function Tolerances() {
  const s = 3.8;
  const x0 = 40;
  const cavR = x0 + 100.2 * s;
  const yT = 70;
  const hB = 44;
  const parts: Array<[string, number]> = [
    ["50 ± 0.10", 50],
    ["30 ± 0.05", 30],
    ["20 ± 0.10", 20],
  ];
  const lefts: number[] = []; // each part's left edge, stacked from the cavity wall
  let cx = x0;
  for (const [, len] of parts) {
    lefts.push(cx);
    cx += len * s;
  }
  // number line
  const nx0 = 60;
  const nx1 = 440;
  const nv = (v: number) => nx0 + ((v - 100) / 0.3) * (nx1 - nx0);
  const ny = 230;
  // Each stack adds one part at a time (0.45 s apiece): worst case adds 0.10 + 0.05 + 0.10,
  // RSS adds the same three in quadrature.
  const worst = [100, 100.1, 100.15, 100.25];
  const rss = [100, 100.1, 100 + Math.sqrt(0.1 ** 2 + 0.05 ** 2), 100.15];
  const stack = (t: number, at: number, v: number[]) => {
    let x = v[0];
    for (let i = 1; i < v.length; i++) {
      const p = seg(t, at + 0.45 * (i - 1), at + 0.45 * i);
      if (p > 0) x = lerp(v[i - 1], v[i], p);
    }
    return x;
  };
  return (
    <AnimatedFigure
      height={300}
      duration={5.5}
      alt="Three blocks of 50, 30 and 20 mm stacked in a 100.20 mm cavity, above a number line where the RSS stack reaches 100.15 inside the cavity wall and the worst-case stack reaches 100.25 beyond it."
      steps={[
        {
          at: 0,
          label: "Parts",
          caption: "A 50 ± 0.10 bracket, a 30 ± 0.05 spacer and a 20 ± 0.10 cover stack to 100.00 mm nominal in a 100.20 mm cavity.",
        },
        {
          at: 1.9,
          label: "Worst case",
          caption: "Worst case puts every part at its limit at once: 0.10 + 0.05 + 0.10 = 0.25 mm, so the stack can reach 100.25.",
        },
        {
          at: 3.7,
          label: "RSS",
          caption: "RSS adds them in quadrature: √(0.10² + 0.05² + 0.10²) = 0.15 mm, so the stack reaches 100.15.",
        },
        {
          at: 4.9,
          label: "Verdict",
          caption:
            "Same three parts, two verdicts: worst-case (0.25) pushes past the 100.20 wall, RSS (0.15) stays inside. The consequence of a jam picks which one you trust.",
        },
      ]}
      readouts={(t) => [
        { label: "worst case", value: `${stack(t, 2, worst).toFixed(2)} mm`, tone: "alarm" },
        { label: "RSS", value: `${stack(t, 3.8, rss).toFixed(2)} mm`, tone: "accent" },
      ]}
    >
      {({ t }) => (
        <>
          <DimH x1={x0} x2={cavR} y={36} label="cavity 100.20" />
          <path
            d={`M${x0},${yT - 8} L${x0},${yT + hB} L${cavR},${yT + hB} L${cavR},${yT - 8}`}
            fill="none"
            stroke={C.ink}
            strokeWidth={3}
          />
          {parts.map(([lab, len], i) => {
            const x = lefts[i];
            const p = seg(t, 0.4 + 0.3 * i, 0.9 + 0.3 * i); // each part drops into the cavity
            return (
              <g key={lab} opacity={op(p)} transform={p < 1 ? `translate(0,${lerp(-22, 0, p).toFixed(1)})` : undefined}>
                <rect x={x} y={yT} width={len * s} height={hB - 2} fill={i === 1 ? C.surface : C.soft} stroke={C.ink} strokeWidth={1.5} />
                <Label x={x + (len * s) / 2} y={yT + hB / 2 - 1} size={15}>
                  {lab}
                </Label>
              </g>
            );
          })}
          <Label x={(x0 + cavR) / 2} y={yT + hB + 22} size={15} tone="muted" opacity={op(seg(t, 1.3, 1.8))}>
            bracket + spacer + cover = 100.00 nominal
          </Label>

          {/* stack bars */}
          <rect x={nx0} y={ny - 62} width={nv(stack(t, 2, worst)) - nx0} height={16} fill={C.alarm} opacity={0.85} />
          <Label x={nv(100.25) + 8} y={ny - 54} anchor="start" size={15} tone="alarm" weight={600} opacity={op(seg(t, 3.2, 3.7))}>
            worst 100.25
          </Label>
          <rect x={nx0} y={ny - 36} width={nv(stack(t, 3.8, rss)) - nx0} height={16} fill={C.accent} />
          <Label x={nv(100.15) - 8} y={ny - 28} anchor="end" size={15} tone="accent" weight={600} opacity={op(seg(t, 4.9, 5.4))}>
            <tspan fill={C.surface}>RSS 100.15</tspan>
          </Label>
          <line x1={nx0} y1={ny} x2={nx1} y2={ny} stroke={C.ink} strokeWidth={1.5} />
          {[100, 100.1, 100.2, 100.3].map((t) => (
            <g key={t}>
              <line x1={nv(t)} y1={ny} x2={nv(t)} y2={ny + 6} stroke={C.ink} strokeWidth={1.5} />
              <Label x={nv(t)} y={ny + 20} size={15} tone="muted">
                {t.toFixed(2)}
              </Label>
            </g>
          ))}
          <line x1={nv(100.2)} y1={ny - 76} x2={nv(100.2)} y2={ny} stroke={C.ink} strokeWidth={3} />
          <Label x={nv(100.2)} y={ny + 46} size={15} weight={600}>
            cavity wall
          </Label>
        </>
      )}
    </AnimatedFigure>
  );
}

/** dfm: the bracket's vanity face tolerance relaxed, functional hole tolerance kept. */
function Dfm() {
  const x0 = 80;
  const x1 = 400;
  const y0 = 110;
  const y1 = 190;
  return (
    <AnimatedFigure
      height={290}
      duration={4}
      alt="A 60 mm bracket plate: its top cosmetic face tolerance of ±0.01 mm is struck out and replaced by ±0.25 mm, while the two hole positions keep ±0.05 mm because they locate the mating part."
      steps={[
        { at: 0, label: "Drawing", caption: "The first drawing of the 60 mm 6061 bracket carried ±0.01 mm on its cosmetic face." },
        { at: 1.2, label: "Face", caption: "Nothing assembles, seals or aligns against that face, so loosen it to ±0.25 mm." },
        {
          at: 2.9,
          label: "Holes",
          caption:
            "Tight tolerance only where a function lives: the holes sit in a real stack, the face only has to look right. The re-quote drops about 30%.",
        },
      ]}
    >
      {({ t }) => {
        const face = seg(t, 0.4, 0.9); // the face and its tolerance called out
        const strike = seg(t, 1.8, 2.2);
        return (
          <>
            {/* cosmetic face callout */}
            <g opacity={op(face)}>
              <Label x={150} y={28} size={15} tone="muted">
                cosmetic face
              </Label>
              <Label x={284} y={28} size={17} serif>
                ±0.01
              </Label>
            </g>
            {strike > 0 ? (
              <line x1={260} y1={37} x2={lerp(260, 308, strike)} y2={lerp(37, 19, strike)} stroke={C.alarm} strokeWidth={2.5} />
            ) : null}
            <GrowArrow p={seg(t, 2.1, 2.5)} x1={318} y1={28} x2={352} y2={28} tone="muted" width={1.5} />
            <Label x={396} y={28} size={17} serif tone="accent" weight={600} opacity={op(seg(t, 2.3, 2.8))}>
              ±0.25
            </Label>
            <line x1={x0} y1={y0} x2={x1} y2={y0} stroke={C.brass} strokeWidth={7} strokeLinecap="round" opacity={op(face)} />
            <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill={C.soft} stroke={C.ink} strokeWidth={2} />
            <line x1={x0} y1={y0} x2={x1} y2={y0} stroke={C.brass} strokeWidth={4} opacity={op(face)} />
            <Label x={240} y={80} size={15} tone="muted" opacity={op(seg(t, 1.3, 1.8))}>
              nothing mates, seals or aligns here
            </Label>
            {[150, 330].map((hx) => (
              <g key={hx}>
                <circle cx={hx} cy={150} r={13} fill={C.surface} stroke={C.accent} strokeWidth={3} />
                <line x1={hx - 20} y1={150} x2={hx + 20} y2={150} stroke={C.muted} strokeWidth={1} strokeDasharray="4 3" />
                <line x1={hx} y1={130} x2={hx} y2={170} stroke={C.muted} strokeWidth={1} strokeDasharray="4 3" />
              </g>
            ))}
            <g opacity={op(seg(t, 3, 3.5))}>
              <DimH x1={150} x2={330} y={178} label={<tspan fill={C.accent} fontWeight={600}>±0.05 kept</tspan>} tone="accent" />
            </g>
            <DimH x1={x0} x2={x1} y={232} label="60 mm, 6061" />
            <Label x={240} y={268} size={15} tone="accent" opacity={op(seg(t, 3.3, 3.8))}>
              holes locate the mating part: functional
            </Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/* ---------- W27 ---------- */

/** doeplan: interaction plot for glue × cure; toughened epoxy line bends up, 1.0 MPa above the additive 12.0. */
function DoePlan() {
  const b = plotBox({ x: 90, y: 40, w: 250, h: 190, xMin: -0.12, xMax: 1, yMin: 6.5, yMax: 14 });
  const L = b.px(0);
  const R = b.px(1);
  // Corner dots appear as their lines reach them; the (+,+) corner only once it is measured.
  const stdAt = [0.4, 1];
  const toughAt = [1.3, 3.3];
  return (
    <AnimatedFigure
      height={300}
      duration={4.9}
      alt="Interaction plot of lap-joint shear strength against cure time: standard epoxy rises from 8.0 to 8.4 MPa, toughened epoxy rises from 8.6 to 13.0 MPa, 1.0 MPa above the additive prediction of 12.0."
      steps={[
        {
          at: 0,
          label: "Corners",
          caption: "Corner means: standard epoxy gives 8.0 MPa at 2 h cure and 8.4 at 24 h; toughened epoxy gives 8.6 at 2 h.",
        },
        {
          at: 1.8,
          label: "Additive",
          caption: "The additive prediction for toughened epoxy at 24 h is 9.50 + 1.30 + 1.20 = 12.0 MPa.",
        },
        { at: 2.9, label: "Measured", caption: "The (+,+) corner, toughened epoxy with the full 24 h cure, measured 13.0 MPa." },
        {
          at: 3.9,
          label: "Interaction",
          caption:
            "If glue and cure acted alone, the lines would be parallel and the (+,+) corner would sit at 12.0. It measured 13.0: the extra 1.0 MPa is the interaction one-factor-at-a-time never visits.",
        },
      ]}
    >
      {({ t }) => {
        const std = seg(t, 0.6, 1.1);
        const add = seg(t, 1.9, 2.4);
        const tough = seg(t, 3, 3.5);
        const gap = seg(t, 4, 4.4);
        return (
          <>
            <Axes box={b} xLabel="" yLabel="shear strength (MPa)" />
            {[8, 10, 12, 14].map((t) => (
              <g key={t}>
                <line x1={b.x - 6} y1={b.py(t)} x2={b.x} y2={b.py(t)} stroke={C.ink} strokeWidth={1.5} />
                <Label x={b.x - 10} y={b.py(t)} anchor="end" size={15} tone="muted">
                  {t}
                </Label>
              </g>
            ))}
            <Label x={L} y={b.y + b.h + 20} size={15} tone="muted">
              cure 2 h
            </Label>
            <Label x={R} y={b.y + b.h + 20} size={15} tone="muted">
              24 h
            </Label>
            {std > 0 ? <line x1={L} y1={b.py(8.0)} x2={lerp(L, R, std)} y2={lerp(b.py(8.0), b.py(8.4), std)} stroke={C.ink} strokeWidth={3} /> : null}
            {tough > 0 ? (
              <line x1={L} y1={b.py(8.6)} x2={lerp(L, R, tough)} y2={lerp(b.py(8.6), b.py(13.0), tough)} stroke={C.accent} strokeWidth={3} />
            ) : null}
            {add > 0 ? (
              <line
                x1={L}
                y1={b.py(8.6)}
                x2={lerp(L, R, add)}
                y2={lerp(b.py(8.6), b.py(12.0), add)}
                stroke={C.muted}
                strokeWidth={1.5}
                strokeDasharray="6 5"
              />
            ) : null}
            {[
              [L, 8.0],
              [R, 8.4],
            ].map(([x, v], i) => (
              <circle key={`s${x}`} cx={x} cy={b.py(v)} r={6} fill={C.ink} opacity={op(seg(t, stdAt[i], stdAt[i] + 0.4))} />
            ))}
            {[
              [L, 8.6],
              [R, 13.0],
            ].map(([x, v], i) => (
              <circle key={`t${x}`} cx={x} cy={b.py(v)} r={6} fill={C.accent} opacity={op(seg(t, toughAt[i], toughAt[i] + 0.4))} />
            ))}
            <circle cx={R} cy={b.py(12.0)} r={6} fill={C.surface} stroke={C.muted} strokeWidth={2} opacity={op(seg(t, 2.2, 2.6))} />
            <Label x={L} y={b.py(8.6) - 18} size={15} tone="accent" opacity={op(seg(t, 1.3, 1.7))}>
              8.6
            </Label>
            <Label x={L} y={b.py(8.0) + 18} size={15} opacity={op(seg(t, 0.4, 0.8))}>
              8.0
            </Label>
            <Label x={R + 12} y={b.py(13.0)} anchor="start" size={15} tone="accent" weight={600} opacity={op(seg(t, 3.3, 3.7))}>
              13.0 toughened
            </Label>
            <Label x={R + 12} y={b.py(12.0) + 4} anchor="start" size={15} tone="muted" opacity={op(seg(t, 2.2, 2.6))}>
              12.0 additive
            </Label>
            <Label x={R + 12} y={b.py(8.4)} anchor="start" size={15} opacity={op(seg(t, 1, 1.4))}>
              8.4 standard
            </Label>
            {gap > 0 ? (
              <line x1={R - 12} y1={lerp(b.py(12.0), b.py(13.0), gap)} x2={R - 12} y2={b.py(12.0)} stroke={C.alarm} strokeWidth={3} />
            ) : null}
            <Label x={R - 22} y={b.py(13.0) - 8} anchor="end" size={15} tone="alarm" weight={600} opacity={op(seg(t, 4.2, 4.7))}>
              +1.0 interaction
            </Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** smallsample: five thrust readings, mean 19.80, 95% t-interval ±0.49, suspect 20.4 kept. */
function SmallSample() {
  const b = plotBox({ x: 40, y: 0, w: 400, h: 1, xMin: 19.2, xMax: 20.6, yMin: 0, yMax: 1 });
  const readings = [19.4, 19.8, 19.5, 19.9, 20.4];
  const dotY = 150;
  const axisY = 190;
  const lo = 19.8 - 0.49;
  const hi = 19.8 + 0.49;
  const mid = b.px(19.8);
  return (
    <AnimatedFigure
      height={270}
      duration={5}
      alt="Five thrust readings plotted on a kilonewton axis from 19.2 to 20.6, with the mean 19.80 marked and a 95% confidence bracket from 19.31 to 20.29; the high reading 20.4 is circled with Grubbs score 1.52 below the critical 1.72."
      steps={[
        { at: 0, label: "Readings", caption: "Five firings measure 19.4, 19.8, 19.5, 19.9 and 20.4 kN of thrust." },
        { at: 1.9, label: "Mean", caption: "Their mean is 99.0 / 5 = 19.80 kN." },
        {
          at: 2.8,
          label: "Interval",
          caption: "The standard error is 0.176 kN; times t = 2.776 for four degrees of freedom, the 95% half-width is 0.49 kN.",
        },
        {
          at: 3.8,
          label: "Suspect",
          caption:
            "Report the band, not just the dot: 19.80 ± 0.49 kN from five firings. The 20.4 looks lonely but scores 1.52 < 1.72, so it stays in the data.",
        },
      ]}
    >
      {({ t }) => {
        const open = seg(t, 2.9, 3.5); // the interval opens out from the mean
        const xl = lerp(mid, b.px(lo), open);
        const xr = lerp(mid, b.px(hi), open);
        const mean = seg(t, 2, 2.5);
        return (
          <>
            <g opacity={op(seg(t, 2.9, 3.2))}>
              <line x1={xl} y1={70} x2={xr} y2={70} stroke={C.accent} strokeWidth={3} />
              <line x1={xl} y1={60} x2={xl} y2={80} stroke={C.accent} strokeWidth={3} />
              <line x1={xr} y1={60} x2={xr} y2={80} stroke={C.accent} strokeWidth={3} />
            </g>
            <Label x={b.px(19.8)} y={40} tone="accent" weight={600} opacity={op(seg(t, 3.2, 3.7))}>
              19.80 ± 0.49 kN (95%, n = 5)
            </Label>
            {mean > 0 ? (
              <line x1={b.px(19.8)} y1={80} x2={b.px(19.8)} y2={lerp(80, axisY, mean)} stroke={C.accent} strokeWidth={2} strokeDasharray="5 4" />
            ) : null}
            <Label x={b.px(19.8) - 8} y={100} anchor="end" size={15} tone="accent" opacity={op(seg(t, 2.2, 2.7))}>
              mean
            </Label>
            {readings.map((r, i) => {
              const p = seg(t, 0.4 + 0.25 * i, 0.8 + 0.25 * i); // readings land one firing at a time
              return <circle key={r} cx={b.px(r)} cy={lerp(dotY - 18, dotY, p)} r={8} fill={C.ink} opacity={op(p)} />;
            })}
            <circle
              cx={b.px(20.4)}
              cy={dotY}
              r={15}
              fill="none"
              stroke={C.muted}
              strokeWidth={2}
              strokeDasharray="4 3"
              opacity={op(seg(t, 3.9, 4.4))}
            />
            <Label x={b.px(20.4)} y={dotY - 52} size={15} tone="muted" opacity={op(seg(t, 4.1, 4.6))}>
              G = 1.52 &lt; 1.72
            </Label>
            <Label x={b.px(20.4)} y={dotY - 32} size={15} tone="muted" opacity={op(seg(t, 4.4, 4.9))}>
              stays
            </Label>
            <line x1={b.px(19.2)} y1={axisY} x2={b.px(20.6)} y2={axisY} stroke={C.ink} strokeWidth={1.5} />
            {[19.2, 19.6, 20.0, 20.4].map((t) => (
              <g key={t}>
                <line x1={b.px(t)} y1={axisY} x2={b.px(t)} y2={axisY + 6} stroke={C.ink} strokeWidth={1.5} />
                <Label x={b.px(t)} y={axisY + 20} size={15} tone="muted">
                  {t.toFixed(1)}
                </Label>
              </g>
            ))}
            <Label x={b.px(20.6)} y={axisY + 46} anchor="end" size={15} tone="muted">
              thrust (kN)
            </Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** honestgraph: T² vs L straight through the origin, and residuals that look like static. */
function HonestGraph() {
  const b = plotBox({ x: 70, y: 40, w: 330, h: 170, xMin: 0, xMax: 1.1, yMin: 0, yMax: 4.5 });
  const r = plotBox({ x: 70, y: 262, w: 330, h: 56, xMin: 0, xMax: 1.1, yMin: -0.012, yMax: 0.012 });
  const L = [0.25, 0.5, 0.75, 1.0];
  const T2 = [1.01, 2.02, 3.03, 4.06];
  const res = [0.004, -0.002, -0.008, 0.006];
  const fit = (x: number) => 4.064 * x - 0.01;
  return (
    <AnimatedFigure
      height={360}
      duration={4.4}
      alt="Pendulum data plotted as T squared against length: four points on a straight line through the origin with slope 4.064, and below it a residual strip with values +0.004, −0.002, −0.008 and +0.006 scattered with no pattern."
      steps={[
        { at: 0, label: "Data", caption: "The pendulum gives T² = 1.01, 2.02, 3.03 and 4.06 s² at L = 0.25, 0.50, 0.75 and 1.00 m." },
        {
          at: 1.5,
          label: "Fit",
          caption: "Theory says T² = (4π²/g)·L, a line through the origin; the fit's slope of 4.064 s²/m gives g = 9.71 m/s².",
        },
        {
          at: 3,
          label: "Residuals",
          caption:
            "Linearize so theory predicts a line, then judge the residuals, not the R²: here they are static and the intercept is zero within error, so g = 9.71 m/s² stands.",
        },
      ]}
    >
      {({ t }) => {
        const u = lerp(0, 1.08, seg(t, 1.6, 2.2)); // the fitted line draws out from the origin
        const strip = seg(t, 3.1, 3.6);
        return (
          <>
            <Axes box={b} xLabel="" yLabel="T² (s²)" />
            {[1, 2, 3, 4].map((t) => (
              <g key={t}>
                <line x1={b.x - 6} y1={b.py(t)} x2={b.x} y2={b.py(t)} stroke={C.ink} strokeWidth={1.5} />
                <Label x={b.x - 10} y={b.py(t)} anchor="end" size={15} tone="muted">
                  {t}
                </Label>
              </g>
            ))}
            {u > 0 ? (
              <path d={b.path([
                [0, fit(0)],
                [u, fit(u)],
              ])} stroke={C.accent} strokeWidth={2.5} fill="none" />
            ) : null}
            {L.map((l, i) => (
              <circle key={l} cx={b.px(l)} cy={b.py(T2[i])} r={6} fill={C.ink} opacity={op(seg(t, 0.4 + 0.2 * i, 0.8 + 0.2 * i))} />
            ))}
            <Label x={b.x + 16} y={b.y + 14} anchor="start" size={15} tone="accent" weight={600} opacity={op(seg(t, 2, 2.5))}>
              slope 4.064 s²/m
            </Label>
            <Label x={b.x + 16} y={b.y + 36} anchor="start" size={15} tone="accent" opacity={op(seg(t, 2.2, 2.7))}>
              g = 4π² ÷ 4.064 = 9.71 m/s²
            </Label>
            <Label x={b.x + 16} y={b.y + 58} anchor="start" size={15} tone="muted" opacity={op(seg(t, 2.4, 2.9))}>
              intercept −0.01 ≈ 0
            </Label>

            {/* residual strip */}
            <Label x={r.x} y={r.y - 20} anchor="start" size={15} tone="muted" opacity={op(strip)}>
              residuals (s²): static, no pattern
            </Label>
            <rect x={r.x} y={r.y} width={r.w} height={r.h} fill={C.soft} opacity={0.5} />
            <line x1={r.x} y1={r.py(0)} x2={r.x + r.w} y2={r.py(0)} stroke={C.muted} strokeWidth={1.5} />
            {L.map((l, i) => {
              const p = seg(t, 3.4 + 0.12 * i, 3.8 + 0.12 * i); // each residual grows out of the zero line
              const y = lerp(r.py(0), r.py(res[i]), p);
              return (
                <g key={l} opacity={op(p)}>
                  <line x1={r.px(l)} y1={r.py(0)} x2={r.px(l)} y2={y} stroke={C.ink} strokeWidth={2} />
                  <circle cx={r.px(l)} cy={y} r={5} fill={C.ink} />
                  <Label x={r.px(l) + 10} y={r.py(res[i]) + (res[i] < 0 ? 8 : -6)} anchor="start" size={15} tone="muted">
                    {(res[i] > 0 ? "+" : "−") + Math.abs(res[i]).toFixed(3)}
                  </Label>
                </g>
              );
            })}
            {L.map((l) => (
              <Label key={`t${l}`} x={r.px(l)} y={r.y + r.h + 18} size={15} tone="muted">
                {l.toFixed(2)}
              </Label>
            ))}
            <Label x={r.x + r.w + 10} y={r.y + r.h + 18} anchor="start" size={15} tone="muted">
              L (m)
            </Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/* ---------- W28 ---------- */

/** tradestudy: min-max normalization of mass, then weighted totals. */
function TradeStudy() {
  const ax0 = 70;
  const ax1 = 410;
  const mx = (g: number) => ax0 + ((g - 45) / (160 - 45)) * (ax1 - ax0);
  const bx = 160;
  const bw = 350; // px per unit score
  const bars: Array<[string, number, boolean]> = [
    ["printed nylon", 0.694, true],
    ["CNC aluminum", 0.632, false],
    ["steel weldment", 0.505, false],
    ["CFRP layup", 0.5, false],
  ];
  const ay = 62;
  return (
    <AnimatedFigure
      height={320}
      duration={4.6}
      alt="Top: a mass scale from 45 g scoring 1 to 160 g scoring 0, with printed nylon at 60 g scoring 0.87. Bottom: weighted totals as bars, printed nylon 0.694, CNC aluminum 0.632, steel weldment 0.505, CFRP layup 0.500."
      steps={[
        {
          at: 0,
          label: "Normalize",
          caption: "Less mass is better, so the lightest observed, 45 g, scores 1 and the heaviest, 160 g, scores 0.",
        },
        { at: 1.2, label: "Score", caption: "Printed nylon's 60 g normalizes to (160 − 60) ÷ (160 − 45) = 0.87." },
        {
          at: 2.4,
          label: "Weigh",
          caption: "Weighted 0.30, 0.25, 0.20, 0.15 and 0.10, the totals are nylon 0.694, aluminum 0.632, steel 0.505 and CFRP 0.500.",
        },
        {
          at: 3.9,
          label: "Winner",
          caption:
            "Each criterion is stretched to 0–1 between the best and worst observed before the weights touch it. Under this brief, nylon wins by being cheap, fast and light.",
        },
      ]}
    >
      {({ t }) => {
        const pin = seg(t, 1.3, 1.7); // nylon's 60 g placed on the scale
        return (
          <>
            <Label x={ax0} y={20} anchor="start" size={15} tone="muted">
              normalize mass (less is better)
            </Label>
            <line x1={ax0} y1={ay} x2={ax1} y2={ay} stroke={C.ink} strokeWidth={2} />
            {[45, 160].map((g, i) => (
              <g key={g}>
                <line x1={mx(g)} y1={ay - 8} x2={mx(g)} y2={ay + 8} stroke={C.ink} strokeWidth={2} />
                <Label x={mx(g)} y={ay + 22} size={15}>
                  {g} g
                </Label>
                <Label x={mx(g)} y={ay + 42} size={15} tone="muted" opacity={op(seg(t, 0.4 + 0.25 * i, 0.9 + 0.25 * i))}>
                  {g === 45 ? "score 1" : "score 0"}
                </Label>
              </g>
            ))}
            <circle cx={mx(60)} cy={lerp(ay - 16, ay, pin)} r={7} fill={C.accent} opacity={op(pin)} />
            <GrowArrow p={seg(t, 1.6, 2)} x1={mx(60) + 60} y1={ay - 22} x2={mx(60) + 10} y2={ay - 6} tone="accent" width={1.5} />
            <Label x={mx(60) + 66} y={ay - 24} anchor="start" size={15} tone="accent" weight={600} opacity={op(seg(t, 1.8, 2.3))}>
              nylon 60 g → 0.87
            </Label>

            <g opacity={op(seg(t, 2.5, 3))}>
              <line x1={20} y1={126} x2={460} y2={126} stroke={C.line} strokeWidth={1} />
              <Label x={20} y={146} anchor="start" size={15} tone="muted">
                weighted total (0.30 · 0.25 · 0.20 · 0.15 · 0.10)
              </Label>
            </g>
            {bars.map(([name, v, win], i) => {
              const y = 170 + i * 36;
              const a = 2.8 + 0.25 * i;
              const grow = seg(t, a, a + 0.6); // each weighted total grows out to its value
              return (
                <g key={name}>
                  <Label
                    x={bx - 10}
                    y={y + 12}
                    anchor="end"
                    size={15}
                    tone={win ? "accent" : "ink"}
                    weight={win ? 700 : undefined}
                    opacity={op(seg(t, a, a + 0.4))}
                  >
                    {name}
                  </Label>
                  {grow > 0 ? <rect x={bx} y={y} width={lerp(0, v * bw, grow)} height={24} fill={win ? C.accent : C.line} /> : null}
                  <Label
                    x={bx + v * bw + 8}
                    y={y + 12}
                    anchor="start"
                    size={15}
                    weight={win ? 700 : undefined}
                    tone={win ? "accent" : "ink"}
                    opacity={op(seg(t, a + 0.5, a + 0.9))}
                  >
                    {v.toFixed(3)}
                  </Label>
                </g>
              );
            })}
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** paramsweep: cantilever tip deflection vs depth, 1/h³, crossing the 2 mm limit at 53 mm. */
function ParamSweep() {
  const b = plotBox({ x: 70, y: 50, w: 360, h: 180, xMin: 20, xMax: 80, yMin: 0, yMax: 10 });
  const d = (h: number) => 35.71 * Math.pow(20 / h, 3);
  const hStart = 20 * Math.pow(35.71 / 10, 1 / 3);
  const pts: Array<[number, number]> = [];
  for (let h = hStart; h <= 80.001; h += 0.5) pts.push([h, d(h)]);
  pts.unshift([hStart, 10]);
  // The sweep steps depth from 20 to 80 mm at a steady rate (off scale until hStart), then walks
  // back along the curve to the smallest passing depth.
  const hEnd = pts[pts.length - 1][0];
  const reach = (h: number) => 0.4 + ((h - 20) / 60) * 2.8; // when the sweep reaches depth h
  const swept = (t: number) => Math.min(hEnd, 20 + 60 * clamp((t - 0.4) / 2.8));
  const probe = (t: number) => {
    const back = seg(t, 3.4, 4.1);
    return back > 0 ? lerp(hEnd, 53, back) : swept(t);
  };
  const drawn = (h: number): Array<[number, number]> => (h >= hEnd ? pts : [...pts.filter(([x]) => x < h), [h, d(h)]]);
  const at40 = reach(40);
  const at52 = reach(52);
  return (
    <AnimatedFigure
      height={300}
      duration={4.5}
      alt="Tip deflection of a 1 m aluminum cantilever falling as one over depth cubed as depth sweeps from 20 to 80 mm, crossing the 2 mm limit between 52 mm at 2.03 mm and 53 mm at 1.92 mm."
      steps={[
        {
          at: 0,
          label: "Sweep",
          caption: "Sweep the 1 m cantilever's depth from 20 to 80 mm: at 20 mm the tip sags 35.7 mm, at 40 mm only 4.46.",
        },
        { at: 1.9, label: "Limit", caption: "52 mm still fails at 2.03 mm; 53 mm is the first depth under the 2 mm limit, at 1.92." },
        {
          at: 3.4,
          label: "Design point",
          caption:
            "Deflection falls as 1/h³: the first millimeters of depth buy enormously, the last buy almost nothing. The smallest passing depth, 53 mm, is the design point.",
        },
      ]}
      readouts={(t) => {
        const h = Math.round(probe(t)); // the sweep's 1 mm steps
        const v = d(h);
        return [
          { label: "depth h", value: `${h} mm` },
          { label: "tip deflection", value: `${v.toFixed(v >= 10 ? 1 : 2)} mm`, tone: v > 2 ? "alarm" : "accent" },
        ];
      }}
    >
      {({ t }) => {
        const hs = swept(t);
        const hp = probe(t);
        const gone = seg(t, 4.05, 4.35); // the probe settles onto the design point
        return (
          <>
            <Axes box={b} xLabel="" yLabel="tip deflection (mm)" />
            <Label x={b.x + b.w} y={b.y + b.h + 44} anchor="end" size={15} tone="muted">
              beam depth h (mm)
            </Label>
            {[20, 40, 60, 80].map((t) => (
              <g key={t}>
                <line x1={b.px(t)} y1={b.y + b.h} x2={b.px(t)} y2={b.y + b.h + 6} stroke={C.ink} strokeWidth={1.5} />
                <Label x={b.px(t)} y={b.y + b.h + 20} size={15} tone="muted">
                  {t}
                </Label>
              </g>
            ))}
            {[2, 5, 10].map((t) => (
              <g key={t}>
                <line x1={b.x - 6} y1={b.py(t)} x2={b.x} y2={b.py(t)} stroke={C.ink} strokeWidth={1.5} />
                <Label x={b.x - 10} y={b.py(t)} anchor="end" size={15} tone="muted">
                  {t}
                </Label>
              </g>
            ))}
            <line x1={b.x} y1={b.py(2)} x2={b.x + b.w} y2={b.py(2)} stroke={C.alarm} strokeWidth={2} strokeDasharray="6 5" />
            <Label x={b.x + b.w} y={b.py(2) - 14} anchor="end" size={15} tone="alarm">
              limit 2 mm
            </Label>
            {hs > hStart ? <path d={b.path(drawn(hs))} stroke={C.ink} strokeWidth={3} fill="none" /> : null}
            <g opacity={op(seg(t, 0.4, 0.9))}>
              <Arrow x1={b.px(hStart)} y1={b.py(9.4)} x2={b.px(hStart)} y2={b.y - 6} tone="muted" width={1.5} />
              <Label x={b.px(hStart) + 24} y={b.y + 6} anchor="start" size={15} tone="muted">
                20 mm sags 35.7 (off scale)
              </Label>
            </g>
            <g opacity={op(seg(t, at40, at40 + 0.4))}>
              <circle cx={b.px(40)} cy={b.py(4.46)} r={5} fill={C.ink} />
              <Label x={b.px(40) - 8} y={b.py(4.46) + 18} anchor="end" size={15}>
                40 mm: 4.46
              </Label>
            </g>
            <circle cx={b.px(52)} cy={b.py(2.03)} r={5} fill={C.surface} stroke={C.alarm} strokeWidth={2} opacity={op(seg(t, at52, at52 + 0.4))} />
            <circle cx={b.px(53)} cy={b.py(1.92)} r={6} fill={C.accent} opacity={op(seg(t, at52 + 0.05, at52 + 0.45))} />
            <g opacity={op(seg(t, at52 + 0.1, at52 + 0.6))}>
              <line x1={b.px(53) + 4} y1={b.py(2.2)} x2={b.px(53) + 24} y2={b.py(4.2)} stroke={C.muted} strokeWidth={1.5} />
              <Label x={b.px(53) + 28} y={b.py(5.6)} anchor="start" size={15} tone="alarm">
                52 mm: 2.03 fails
              </Label>
              <Label x={b.px(53) + 28} y={b.py(4.4)} anchor="start" size={15} tone="accent" weight={600}>
                53 mm: 1.92 passes
              </Label>
            </g>
            {hp > hStart && gone < 1 ? (
              <circle cx={b.px(hp)} cy={b.py(d(hp))} r={6} fill={C.surface} stroke={C.ink} strokeWidth={2} opacity={op(1 - gone)} />
            ) : null}
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** convergence: 60 → 54 → 53 mm, relative change 11% then 1.9% against a 5% tolerance. */
function Convergence() {
  const b = plotBox({ x: 80, y: 90, w: 330, h: 150, xMin: 0, xMax: 3, yMin: 0, yMax: 16 });
  const bars: Array<[number, number, string]> = [
    [0.5, 11.1, "60 → 54"],
    [1.5, 1.9, "54 → 53"],
  ];
  const bw = 64;
  const barAt = [1.4, 2.5]; // each refinement's bar grows as its step of the history is written
  // The history is wiped on left to right: "60 → 54" with the first bar, "→ 53 mm" with the second.
  // Edges are the measured glyph extents of the title (it spans about x 158–322).
  const wipe = (t: number) => (t < 2.4 ? lerp(150, 234, seg(t, 1.3, 1.8)) : lerp(234, 330, seg(t, 2.4, 2.9)));
  return (
    <AnimatedFigure
      height={300}
      duration={4.4}
      alt="Iteration history of the minimal passing beam depth, 60 then 54 then 53 mm, with bars of relative change 11% and 1.9% against a dashed 5% tolerance line, and a dashed third refinement labeled as swallowed by the ±0.5 mm stock tolerance."
      steps={[
        {
          at: 0,
          label: "Rule",
          caption: "Write the tolerance before iterating: each refinement's relative change is judged against 5%.",
        },
        { at: 1.2, label: "Refine", caption: "The first refinement moved the minimal passing depth from 60 to 54 mm, an 11% change." },
        { at: 2.3, label: "Converge", caption: "The next refinement, 54 → 53 mm, changed it only 1.9%, under the 5% line." },
        {
          at: 3.3,
          label: "Stop",
          caption:
            "Each refinement moved the answer less. The next step would only split 52.5 from 53.0 mm, which the ±0.5 mm stock tolerance swallows, so stop at 53 mm and write that down.",
        },
      ]}
    >
      {({ t }) => {
        const edge = wipe(t);
        const wiping = edge < 330;
        return (
          <>
            {wiping ? (
              <clipPath id="fig-convergence-history">
                <rect x={0} y={0} width={edge} height={44} />
              </clipPath>
            ) : null}
            <g clipPath={wiping ? "url(#fig-convergence-history)" : undefined}>
              <Label x={240} y={24} size={20} serif>
                60 → 54 → <tspan fill={C.accent} fontWeight={600}>53 mm</tspan>
              </Label>
            </g>
            <Axes box={b} xLabel="" yLabel="relative change (%)" />
            {[5, 10].map((t) => (
              <g key={t}>
                <line x1={b.x - 6} y1={b.py(t)} x2={b.x} y2={b.py(t)} stroke={C.ink} strokeWidth={1.5} />
                <Label x={b.x - 10} y={b.py(t)} anchor="end" size={15} tone="muted">
                  {t}
                </Label>
              </g>
            ))}
            {bars.map(([x, v, lab], i) => {
              const a = barAt[i];
              const h = lerp(0, v, seg(t, a, a + 0.6));
              return (
                <g key={lab}>
                  <rect x={b.px(x) - bw / 2} y={b.py(h)} width={bw} height={b.py(0) - b.py(h)} fill={i ? C.accent : C.line} />
                  <Label x={b.px(x)} y={b.py(v) - 14} size={15} weight={600} tone={i ? "accent" : "ink"} opacity={op(seg(t, a + 0.4, a + 0.8))}>
                    {v.toFixed(1).replace(".0", "")}%
                  </Label>
                  <Label x={b.px(x)} y={b.y + b.h + 20} size={15} tone="muted" opacity={op(seg(t, a, a + 0.4))}>
                    {lab}
                  </Label>
                </g>
              );
            })}
            <rect
              x={b.px(2.5) - bw / 2}
              y={b.py(1)}
              width={bw}
              height={b.py(0) - b.py(1)}
              fill="none"
              stroke={C.muted}
              strokeWidth={1.5}
              strokeDasharray="4 3"
              opacity={op(seg(t, 3.4, 3.9))}
            />
            <Label x={b.px(2.5)} y={b.y + b.h + 20} size={15} tone="muted" opacity={op(seg(t, 3.5, 4))}>
              52.5?
            </Label>
            <Label x={b.px(2.5)} y={b.y + b.h + 42} size={15} tone="muted" opacity={op(seg(t, 3.7, 4.2))}>
              lost in ±0.5 stock
            </Label>
            {t > 0.4 ? (
              <line
                x1={b.x}
                y1={b.py(5)}
                x2={lerp(b.x, b.x + b.w, seg(t, 0.4, 0.9))}
                y2={b.py(5)}
                stroke={C.alarm}
                strokeWidth={2}
                strokeDasharray="6 5"
              />
            ) : null}
            <Label x={b.x + b.w} y={b.py(5) - 14} anchor="end" size={15} tone="alarm" opacity={op(seg(t, 0.6, 1.1))}>
              tolerance 5%
            </Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/* ---------- W29 ---------- */

/** safetyfactor: 12 kN lug, yield 250 MPa ÷ FoS 2.0 = allowable 125, 100 mm² gives 120 MPa. */
function SafetyFactor() {
  const sy = (s: number) => 250 - s * 0.8; // MPa → y
  const cx = 300;
  const cw = 34;
  return (
    <AnimatedFigure
      height={290}
      duration={4.9}
      alt="A tow-bar lug pulled by 12 kN beside a stress column: yield at 250 MPa, divided by a factor of safety of 2.0 to an allowable 125 MPa, with the lug's actual 120 MPa filling the column just under the allowable line."
      steps={[
        { at: 0, label: "Demand", caption: "A tow-bar lug must carry a 12 kN demand, and its material yields at 250 MPa." },
        {
          at: 1.6,
          label: "Factor",
          caption: "The consequence is moderate, so the class says FoS 2.0: allowable stress = 250 ÷ 2.0 = 125 MPa.",
        },
        { at: 2.8, label: "Area", caption: "Required area = 12,000 N ÷ 125 MPa = 96 mm², and the designer picks 100 mm²." },
        {
          at: 3.7,
          label: "Stress",
          caption:
            "The area is arithmetic; the 2.0 is the judgment. Half the yield strength is held back for loads nobody measured, and the drawing says so.",
        },
      ]}
    >
      {({ t }) => {
        const yieldIn = seg(t, 1, 1.5);
        const allow = seg(t, 2.2, 2.7);
        const fill = lerp(0, 120, seg(t, 3.8, 4.5)); // the lug's stress rises in the column
        return (
          <>
            {/* lug */}
            <WallV x={36} y={100} h={80} side="left" />
            <path d="M36,112 L180,112 A28,28 0 0 1 180,168 L36,168 Z" fill={C.soft} stroke={C.ink} strokeWidth={2} />
            <circle cx={180} cy={140} r={13} fill={C.surface} stroke={C.ink} strokeWidth={2} />
            <circle cx={186} cy={140} r={8} fill={C.ink} />
            <GrowArrow p={seg(t, 0.4, 0.9)} x1={194} y1={140} x2={252} y2={140} tone="accent" width={4} />
            <Label x={224} y={116} tone="accent" weight={600} opacity={op(seg(t, 0.6, 1.1))}>
              12 kN
            </Label>
            <Label x={110} y={196} size={15} opacity={op(seg(t, 2.9, 3.4))}>
              area 100 mm²
            </Label>
            <Label x={110} y={216} size={15} tone="muted" opacity={op(seg(t, 3.1, 3.6))}>
              (96 required)
            </Label>
            <Label x={110} y={82} size={15} tone="muted">
              tow-bar lug
            </Label>

            {/* stress column */}
            <rect x={cx} y={sy(250)} width={cw} height={250 * 0.8} fill={C.surface} stroke={C.ink} strokeWidth={1.5} />
            {fill > 0 ? <rect x={cx} y={sy(fill)} width={cw} height={fill * 0.8} fill={C.accent} /> : null}
            <line x1={cx - 6} y1={sy(250)} x2={cx + cw + 6} y2={sy(250)} stroke={C.alarm} strokeWidth={3} opacity={op(yieldIn)} />
            <line
              x1={cx - 6}
              y1={sy(125)}
              x2={cx + cw + 6}
              y2={sy(125)}
              stroke={C.ink}
              strokeWidth={2.5}
              strokeDasharray="5 3"
              opacity={op(allow)}
            />
            <Label x={cx + cw + 12} y={sy(250)} anchor="start" size={15} tone="alarm" weight={600} opacity={op(yieldIn)}>
              yield 250 MPa
            </Label>
            <Label x={cx + cw + 12} y={sy(125)} anchor="start" size={15} weight={600} opacity={op(allow)}>
              allowable 125
            </Label>
            <Label x={cx + cw + 12} y={sy(60)} anchor="start" size={15} tone="accent" opacity={op(seg(t, 4.2, 4.7))}>
              lug 120
            </Label>
            <GrowArrow p={seg(t, 1.7, 2.2)} x1={cx + cw + 30} y1={sy(240)} x2={cx + cw + 30} y2={sy(135)} tone="muted" width={1.5} />
            <Label x={cx + cw + 40} y={sy(188)} anchor="start" size={15} tone="muted" opacity={op(seg(t, 1.9, 2.4))}>
              ÷ FoS 2.0
            </Label>
            <Label x={cx + cw / 2} y={sy(0) + 20} size={15} tone="muted">
              stress
            </Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** standards: shall → compliance row with evidence; should and appendix → no row. */
function Standards() {
  const rows: Array<{ tag: string; text: string; out: string; tone: Tone; row: boolean }> = [
    { tag: "shall", text: "withstand 3× rated load", out: "§4.2 · pull-test report", tone: "accent", row: true },
    { tag: "should", text: "test at room temperature", out: "advice: no row", tone: "muted", row: false },
    { tag: "App. A", text: "fixture guidance", out: "informative: no row", tone: "muted", row: false },
  ];
  return (
    <AnimatedFigure
      height={290}
      duration={4.6}
      alt="Three clauses from a tow-bar standard: the shall-statement to withstand three times rated load maps to a compliance-table row with a pull-test report, while the should about room temperature and the Appendix A fixture guidance map to no row."
      steps={[
        {
          at: 0,
          label: "Clauses",
          caption:
            "Tow-bar standard §4.2: the bar shall withstand 3× rated load, should be tested at room temperature, and Appendix A adds fixture guidance.",
        },
        { at: 1.5, label: "Shall", caption: "The shall is a demand, so it earns a compliance row and named evidence: the pull-test report." },
        { at: 2.5, label: "Should", caption: "A should is advice: break it and you owe an explanation, but it gets no row." },
        {
          at: 3.5,
          label: "Appendix",
          caption:
            "Hunt the shalls: each one earns a row in the compliance table and a named piece of evidence. Shoulds and appendices are advice, and get no row.",
        },
      ]}
    >
      {({ t }) => (
        <>
          <Label x={20} y={22} anchor="start" size={15} tone="muted">
            tow-bar standard §4.2
          </Label>
          <Label x={290} y={22} anchor="start" size={15} tone="muted">
            compliance table
          </Label>
          <rect x={16} y={40} width={236} height={236} fill="none" stroke={C.line} strokeWidth={1.5} />
          {rows.map((r, i) => {
            const y = 52 + i * 76;
            const a = 1.5 + i; // this clause's verdict: shall, then should, then the appendix
            return (
              <g key={r.tag}>
                <g opacity={op(seg(t, 0.4 + 0.25 * i, 0.85 + 0.25 * i))}>
                  <Chip x={28} y={y} w={76} tone={r.tone} filled={r.row}>
                    {r.tag}
                  </Chip>
                  <Label x={30} y={y + 46} anchor="start" size={15} tone={r.row ? "ink" : "muted"}>
                    {r.text}
                  </Label>
                </g>
                <GrowArrow
                  p={seg(t, a + 0.1, a + 0.5)}
                  x1={242}
                  y1={y + 30}
                  x2={282}
                  y2={y + 30}
                  tone={r.row ? "accent" : "muted"}
                  width={r.row ? 2.5 : 1.5}
                  dashed={!r.row}
                />
                {r.row ? (
                  <g opacity={op(seg(t, a + 0.4, a + 0.9))}>
                    <rect x={290} y={y + 12} width={174} height={38} fill={C.soft} stroke={C.accent} strokeWidth={2} />
                    <Label x={377} y={y + 31} size={15} weight={600}>
                      {r.out}
                    </Label>
                  </g>
                ) : (
                  <Label x={292} y={y + 31} anchor="start" size={15} tone="muted" opacity={op(seg(t, a + 0.4, a + 0.9))}>
                    {r.out}
                  </Label>
                )}
              </g>
            );
          })}
        </>
      )}
    </AnimatedFigure>
  );
}

/** designreview: six findings by severity; an open critical forces reject. */
function DesignReview() {
  const f: Array<[string, Tone, boolean, string]> = [
    ["critical", "alarm", true, "one shear pin carries it all"],
    ["major", "alarm", false, "lug FoS 1.4 vs 2.0 note"],
    ["major", "alarm", false, "no saltwater corrosion plan"],
    ["major", "alarm", false, "fatigue life unstated"],
    ["minor", "ink", false, "missing torque value"],
    ["obs.", "muted", false, "mixed units on a sheet"],
  ];
  const top = 16;
  const dy = 34;
  const endY = top + f.length * dy;
  return (
    <AnimatedFigure
      height={330}
      duration={4.5}
      alt="Six review findings listed by severity: one critical single-point shear pin, three majors, one minor and one observation, with an arrow from the open critical to a reject verdict."
      steps={[
        {
          at: 0,
          label: "Critical",
          caption: "The worst finding: one shear pin carries the full tow load, a single-point failure, so it is graded critical.",
        },
        { at: 1, label: "Findings", caption: "Three majors, a minor and an observation complete the six findings." },
        { at: 2.5, label: "Verdict", caption: "An open critical is a rejection no matter how much schedule pressure is in the room." },
        {
          at: 3.5,
          label: "Sign",
          caption:
            "The verdict is arithmetic on the open findings: one open critical means reject, however good the other five pages look. Then someone signs it.",
        },
      ]}
    >
      {({ t }) => (
        <>
          {f.map(([sev, tone, filled, text], i) => {
            const y = top + i * dy;
            const a = i ? 1.1 + 0.2 * (i - 1) : 0.4; // the critical first, then the rest in order
            return (
              <g key={text} opacity={op(seg(t, a, a + 0.45))}>
                <Chip x={20} y={y} w={96} tone={tone} filled={filled}>
                  {sev}
                </Chip>
                <Label x={130} y={y + 14} anchor="start" size={15} tone={i === 0 ? "alarm" : "ink"} weight={i === 0 ? 600 : undefined}>
                  {text}
                </Label>
              </g>
            );
          })}
          <line x1={20} y1={endY + 6} x2={460} y2={endY + 6} stroke={C.line} strokeWidth={1.5} />
          <Label x={20} y={endY + 32} anchor="start" size={15} tone="muted">
            open critical → reject
          </Label>
          <Label x={20} y={endY + 54} anchor="start" size={15} tone="muted">
            open major → conditional
          </Label>
          <GrowArrow p={seg(t, 2.6, 3)} x1={210} y1={endY + 32} x2={286} y2={endY + 32} tone="alarm" width={2.5} />
          <g opacity={op(seg(t, 2.9, 3.4))}>
            <rect x={294} y={endY + 14} width={150} height={40} rx={4} fill={C.alarm} />
            <Label x={369} y={endY + 35} size={18} weight={700}>
              <tspan fill={C.surface}>REJECT</tspan>
            </Label>
          </g>
          {t > 3.6 ? (
            <line x1={294} y1={endY + 84} x2={lerp(294, 444, seg(t, 3.6, 4.1))} y2={endY + 84} stroke={C.ink} strokeWidth={1.5} />
          ) : null}
          <Label x={369} y={endY + 70} size={16} serif tone="muted" opacity={op(seg(t, 3.8, 4.3))}>
            signed: reviewer
          </Label>
        </>
      )}
    </AnimatedFigure>
  );
}

/* ---------- W30 ---------- */

/** capmethod: clamped-root model (0.46) vs glued root that rotates (0.61), revised with a root spring. */
function CapMethod() {
  const x0 = 60;
  const x1 = 290;
  const y0 = 190;
  const k = 170; // px per mm of tip deflection (exaggerated)
  const f = (xi: number) => (xi * xi * (6 - 4 * xi + xi * xi)) / 3;
  const curve = (tip: number, rot: number) => {
    const pts: string[] = [];
    for (let i = 0; i <= 40; i++) {
      const xi = i / 40;
      const d = tip * f(xi) + rot * xi;
      pts.push(`${i ? "L" : "M"}${(x0 + xi * (x1 - x0)).toFixed(1)},${(y0 - d * k).toFixed(1)}`);
    }
    return pts.join(" ");
  };
  // The root spring: two turns about the root, drawn out from the centre.
  const coil: Array<[number, number]> = [];
  for (let i = 0; i <= 60; i++) {
    const a = (i / 60) * Math.PI * 4;
    const rr = 3 + (i / 60) * 12;
    coil.push([x0 + rr * Math.cos(a), y0 + rr * Math.sin(a)]);
  }
  const spiral = (pts: Array<[number, number]>) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  return (
    <AnimatedFigure
      height={290}
      duration={4.5}
      alt="A spar cantilevered from a wall under upward gust lift: the model with a clamped root predicts 0.46 mm tip deflection, the test measures 0.61 mm, and the revision adds a torsional spring at the glued root so the whole beam starts with a rotation."
      steps={[
        { at: 0, label: "Requirement", caption: "The requirement: at most 5 mm of tip deflection under the 2.5 g gust." },
        { at: 1.2, label: "Model", caption: "The uniform-beam model, with its root clamped, predicts 0.46 mm at the tip." },
        {
          at: 2.4,
          label: "Test",
          caption: "The static rig measures 0.61 ± 0.05 mm: a 33% mismatch, and the uncertainty bars do not touch.",
        },
        {
          at: 3.1,
          label: "Revision",
          caption:
            "Deflection exaggerated. The model clamps the root; the build glues it into a socket that rotates a little. One change, a root spring, explains the 33% gap.",
        },
      ]}
    >
      {({ t }) => {
        const bend = seg(t, 1.3, 2); // the clamped model takes the gust
        const model = seg(t, 1.8, 2.3);
        const test = seg(t, 2.5, 3);
        const glued = seg(t, 3.2, 3.7); // the suspect: the root is glued, not clamped
        const wind = seg(t, 3.4, 3.9); // modelled as a torsional spring
        const lift = seg(t, 3.6, 4.3); // which rotates the whole beam up to the test value
        return (
          <>
            <WallV x={x0} y={y0 - 70} h={110} side="left" />
            <line x1={x0} y1={y0} x2={x1} y2={y0} stroke={C.line} strokeWidth={2} strokeDasharray="5 4" />
            {bend > 0 ? <path d={curve(0.46 * bend, 0)} stroke={C.ink} strokeWidth={2.5} fill="none" strokeDasharray="7 5" /> : null}
            {lift > 0 ? (
              <path d={curve(0.46, 0.15 * lift)} stroke={C.accent} strokeWidth={4} fill="none" opacity={op(seg(t, 3.6, 3.9))} />
            ) : null}
            {wind > 0 ? <path d={spiral(partial(coil, wind))} stroke={C.accent} strokeWidth={2} fill="none" /> : null}
            {[180, 230, 280].map((x, i) => (
              <GrowArrow key={x} p={seg(t, 0.4 + 0.1 * i, 0.8 + 0.1 * i)} x1={x} y1={y0 + 48} x2={x} y2={y0 + 14} tone="muted" width={2} />
            ))}
            <Label x={230} y={y0 + 66} size={15} tone="muted" opacity={op(seg(t, 0.6, 1.1))}>
              2.5 g gust lift
            </Label>
            {/* tip readouts */}
            <line x1={x1} y1={y0 - 0.61 * k} x2={x1 + 16} y2={y0 - 0.61 * k} stroke={C.accent} strokeWidth={2} opacity={op(test)} />
            <line x1={x1} y1={y0 - 0.46 * k} x2={x1 + 16} y2={y0 - 0.46 * k} stroke={C.ink} strokeWidth={2} opacity={op(model)} />
            <Label x={x1 + 24} y={y0 - 0.61 * k - 4} anchor="start" size={15} tone="accent" weight={600} opacity={op(test)}>
              test 0.61 ± 0.05 mm
            </Label>
            <Label x={x1 + 24} y={y0 - 0.46 * k + 6} anchor="start" size={15} opacity={op(model)}>
              model 0.46 mm
            </Label>
            <Label x={x1 + 24} y={y0 - 0.46 * k + 26} anchor="start" size={15} tone="muted" opacity={op(model)}>
              (clamped root)
            </Label>
            <Label x={x0 + 20} y={y0 + 34} anchor="start" size={15} tone="accent" weight={600} opacity={op(seg(t, 3.5, 4))}>
              root spring
            </Label>
            <Label x={x0 + 4} y={34} anchor="start" size={15} tone="muted" opacity={op(glued)}>
              glued socket: root rotates
            </Label>
            <line x1={x0 + 10} y1={44} x2={x0 + 6} y2={y0 - 20} stroke={C.muted} strokeWidth={1.5} opacity={op(glued)} />
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** glidersynth: each week's tool as one line of the glider's package, in cycle order. */
function GliderSynth() {
  const rows: Array<[string, string, string, Tone]> = [
    ["W21", "requirement", "δ ≤ 5 mm", "ink"],
    ["phys", "model", "δ = 0.46 mm", "ink"],
    ["W22", "error budget", "gust factor", "ink"],
    ["W23", "margins", "MS = 52", "ink"],
    ["W25", "joints", "bonded root", "ink"],
    ["W26", "tolerance stack", "0.25 > 0.20", "ink"],
    ["W28", "trade study", "aluminum", "ink"],
    ["W27", "test", "0.61 ± 0.05 mm", "alarm"],
    ["→", "revision", "root spring", "accent"],
  ];
  const top = 14;
  const dy = 32;
  // Each link joins in cycle order; the spine grows down to meet it in the 0.3 s before it lands.
  const rowAt = [0, 0.6, 1.4, 1.7, 2, 2.3, 2.6, 3.2, 4];
  const spine = (t: number) => rowAt.reduce((n, a, i) => (i ? n + clamp((t - (a - 0.3)) / 0.3) : n), 0);
  return (
    <AnimatedFigure
      height={310}
      duration={4.6}
      alt="A vertical chain of the glider's engineering package: requirement 5 mm, model 0.46 mm, error budget, margins MS 52, bonded root joint, tolerance stack 0.25 over 0.20, trade study aluminum, test 0.61 mm, and the root-spring revision."
      steps={[
        { at: 0, label: "Predict", caption: "The requirement allows δ ≤ 5 mm, and the beam model predicts δ = 0.46 mm." },
        {
          at: 1.1,
          label: "Chain",
          caption: "Error budget, margins, joints, tolerance stack and trade study each add their link to the same spar.",
        },
        { at: 2.9, label: "Test", caption: "The test measures 0.61 ± 0.05 mm: a 33% mismatch with the model, bars not touching." },
        {
          at: 3.7,
          label: "Revision",
          caption:
            "Every week adds one link to the same spar. The test at the bottom disagrees with the model near the top, and only the full chain can say why.",
        },
      ]}
    >
      {({ t }) => {
        const n = spine(t);
        return (
          <>
            {n > 0 ? <line x1={50} y1={top + 13} x2={50} y2={top + n * dy + 13} stroke={C.line} strokeWidth={3} /> : null}
            {rows.map(([wk, name, val, tone], i) => {
              const y = top + i * dy;
              const strong = tone !== "ink";
              return (
                <g key={name} opacity={i ? op(seg(t, rowAt[i], rowAt[i] + 0.4)) : undefined}>
                  <Chip x={22} y={y} w={56} tone={tone === "ink" ? "muted" : tone} filled={strong}>
                    {wk}
                  </Chip>
                  <Label x={94} y={y + 14} anchor="start" size={15} tone={strong ? tone : "ink"} weight={strong ? 600 : undefined}>
                    {name}
                  </Label>
                  <Label x={460} y={y + 14} anchor="end" size={15} tone={strong ? tone : "muted"} weight={strong ? 600 : undefined}>
                    {val}
                  </Label>
                </g>
              );
            })}
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** capmastery: the first move on a 0.61 vs 0.46 mismatch is the assumption ledger, not the arithmetic. */
function CapMastery() {
  const opts: Array<[string, string, boolean]> = [
    ["recheck the arithmetic", "checked twice", false],
    ["average the two", "theology", false],
    ["rebuild it stiffer", "a patch", false],
    ["read the ledger", "root clamp: assumed", true],
  ];
  const top = 100;
  const dy = 44;
  const optAt = [0.6, 1.1, 1.6, 2.6]; // the three tempting answers, then the cycle's
  /** The branch from the question to answer row y, grown along its length: down, then across. */
  const branch = (y: number, p: number) => {
    const down = y + 16 - 64;
    const s = p * (down + 16);
    return s <= down ? `M60,64 L60,${64 + s}` : `M60,64 L60,${y + 16} L${60 + (s - down)},${y + 16}`;
  };
  return (
    <AnimatedFigure
      height={320}
      duration={4.3}
      alt="A decision fork from the question 'measured 0.61 mm against predicted 0.46 mm, first move?' to four answers: recheck arithmetic, average, and rebuild stiffer are crossed out; reading the assumption ledger, where the root clamp is marked assumed, is ticked."
      steps={[
        { at: 0, label: "Question", caption: "The test measured 0.61 mm against the model's 0.46 mm: what is the first move?" },
        {
          at: 0.6,
          label: "Tempting",
          caption: "The tempting answers: recheck the arithmetic (checked twice), average the two (theology), rebuild it stiffer (a patch).",
        },
        { at: 2.5, label: "Ledger", caption: "The cycle's answer is the assumption ledger, where the root clamp is marked assumed." },
        {
          at: 3.5,
          label: "Correction",
          caption:
            "Three tempting answers reach for numbers or hardware; the cycle reaches for the assumption ledger first. That sentence is what a filed correction carries forward.",
        },
      ]}
    >
      {({ t }) => (
        <>
          <rect x={90} y={14} width={300} height={50} rx={6} fill={C.soft} stroke={C.ink} strokeWidth={1.5} />
          <Label x={240} y={32} size={15}>
            test 0.61 mm vs model 0.46 mm
          </Label>
          <Label x={240} y={52} size={15} weight={600}>
            first move?
          </Label>
          {opts.map(([a, why, ok], i) => {
            const y = top + i * dy;
            const s0 = optAt[i];
            const grow = seg(t, s0, s0 + 0.4);
            const verdict = op(seg(t, s0 + 0.4, s0 + 0.8)); // its mark and reason
            return (
              <g key={a}>
                {grow > 0 ? <path d={branch(y, grow)} fill="none" stroke={ok ? C.accent : C.line} strokeWidth={ok ? 3 : 1.5} /> : null}
                <g opacity={verdict}>
                  <Mark x={94} y={y + 16} ok={ok} />
                </g>
                <Label
                  x={114}
                  y={y + 16}
                  anchor="start"
                  size={15}
                  tone={ok ? "accent" : "muted"}
                  weight={ok ? 700 : undefined}
                  opacity={op(seg(t, s0 + 0.2, s0 + 0.6))}
                >
                  {a}
                </Label>
                <Label x={460} y={y + 16} anchor="end" size={15} tone={ok ? "accent" : "muted"} opacity={verdict}>
                  {why}
                </Label>
              </g>
            );
          })}
          <Label x={240} y={top + 4 * dy + 20} size={18} serif tone="accent" opacity={op(seg(t, 3.6, 4.1))}>
            assumptions before arithmetic
          </Label>
        </>
      )}
    </AnimatedFigure>
  );
}

export const engineeringBFigures: FigureMap = {
  "engineering/processes": Processes,
  "engineering/tolerances": Tolerances,
  "engineering/dfm": Dfm,
  "engineering/doeplan": DoePlan,
  "engineering/smallsample": SmallSample,
  "engineering/honestgraph": HonestGraph,
  "engineering/tradestudy": TradeStudy,
  "engineering/paramsweep": ParamSweep,
  "engineering/convergence": Convergence,
  "engineering/safetyfactor": SafetyFactor,
  "engineering/standards": Standards,
  "engineering/designreview": DesignReview,
  "engineering/capmethod": CapMethod,
  "engineering/glidersynth": GliderSynth,
  "engineering/capmastery": CapMastery,
};
