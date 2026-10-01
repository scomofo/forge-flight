import type { ReactNode } from "react";
import { Axes, C, DimH, Label, plotBox, type FigureMap } from "./kit";
import { AnimatedFigure, clamp, GrowArrow, lerp, op, partial, Reveal, seg } from "./motion";

/* ---------- local helpers ---------- */

const range = (a: number, b: number, n: number) => Array.from({ length: n + 1 }, (_, i) => a + ((b - a) * i) / n);

function Dot({ x, y, tone = "accent", r = 5 }: { x: number; y: number; tone?: "ink" | "accent" | "muted" | "alarm"; r?: number }) {
  return <circle cx={x} cy={y} r={r} fill={C[tone]} stroke={C.surface} strokeWidth={1.5} />;
}

function Guide({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.muted} strokeWidth={1.2} strokeDasharray="4 4" />;
}

/** Small tick on a horizontal axis at x, with a label under it. */
function XTick({ x, y, label, tone = "muted" }: { x: number; y: number; label: string; tone?: "ink" | "accent" | "muted" | "alarm" }) {
  return (
    <g>
      <line x1={x} y1={y} x2={x} y2={y + 6} stroke={C.muted} strokeWidth={1.5} />
      <Label x={x} y={y + 18} size={15} tone={tone}>
        {label}
      </Label>
    </g>
  );
}

/** Small tick on a vertical axis at y, with a label left of it. */
function YTick({ x, y, label, tone = "muted" }: { x: number; y: number; label: string; tone?: "ink" | "accent" | "muted" | "alarm" }) {
  return (
    <g>
      <line x1={x - 6} y1={y} x2={x} y2={y} stroke={C.muted} strokeWidth={1.5} />
      <Label x={x - 10} y={y} size={15} anchor="end" tone={tone}>
        {label}
      </Label>
    </g>
  );
}

/** Alarm cross; `p` below 1 strikes it stroke by stroke. */
function Cross({ x, y, s = 8, p = 1 }: { x: number; y: number; s?: number; p?: number }) {
  const a = clamp(2 * p);
  const b = clamp(2 * p - 1);
  return (
    <g stroke={C.alarm} strokeWidth={3} strokeLinecap="round">
      {a > 0.02 ? <line x1={x - s} y1={y - s} x2={lerp(x - s, x + s, a)} y2={lerp(y - s, y + s, a)} /> : null}
      {b > 0.02 ? <line x1={x - s} y1={y + s} x2={lerp(x - s, x + s, b)} y2={lerp(y + s, y - s, b)} /> : null}
    </g>
  );
}

/* ---------- W16: fracture, fatigue, creep ---------- */

/** K = Yσ√(πa) rising with crack size, crossing K_IC = 50 at a_c. */
function Fracture() {
  const b = plotBox({ x: 64, y: 40, w: 380, h: 190, xMin: 0, xMax: 25, yMin: 0, yMax: 70 });
  const K = (s: number, a: number) => s * Math.sqrt(Math.PI * (a / 1000));
  const c200 = range(0, 25, 60).map((a) => [a, K(200, a)] as [number, number]);
  const aTop = (70 / 400) ** 2 / Math.PI * 1000;
  const c400 = range(0, aTop, 40).map((a) => [a, K(400, a)] as [number, number]);
  const ac = (50 / 200) ** 2 / Math.PI * 1000; // 19.9 mm
  const base = b.y + b.h;
  // The crack grows steadily: to 5 mm over 1.0–1.6 s, then on to 25 mm over 2.4–3.8 s.
  const crack = (t: number) => 5 * clamp((t - 1) / 0.6) + 20 * clamp((t - 2.4) / 1.4);
  const tAc = 2.4 + (1.4 * (ac - 5)) / 20; // the 200 MPa curve meets K_IC
  const t400 = 4.3 + (0.6 * 5) / aTop; // the 400 MPa curve meets K_IC at 5 mm
  return (
    <AnimatedFigure
      height={290}
      duration={5.6}
      alt="Plot of stress intensity K against crack half-length for a steel plate at 200 MPa and 400 MPa, with the toughness line K_IC = 50 MPa√m; the 5 mm crack sits at K = 25.1 and the 200 MPa curve reaches K_IC at about 20 mm, the 400 MPa curve at 5 mm."
      steps={[
        {
          at: 0,
          label: "Toughness",
          caption: "Failure comes when the stress intensity K reaches the steel's fracture toughness, K_IC = 50 MPa√m.",
        },
        {
          at: 1,
          label: "Crack",
          caption: "At 200 MPa the 5 mm crack gives K = 200 × √(π × 0.005) = 25.1 MPa√m, half of K_IC: it sits still today.",
        },
        {
          at: 2.4,
          label: "Critical",
          caption: "As the crack grows, K climbs until it meets K_IC at the critical size a_c = (50/200)²/π ≈ 20 mm.",
        },
        {
          at: 4.2,
          label: "Double σ",
          caption:
            "K climbs with the square root of crack size. The 5 mm crack sits at half of K_IC; double the stress and 5 mm becomes the critical size.",
        },
      ]}
    >
      {({ t }) => {
        const kic = seg(t, 0.3, 0.9);
        const p200 = crack(t) / 25;
        const p400 = clamp((t - 4.3) / 0.6);
        return (
          <>
            <Axes box={b} xLabel="" yLabel="K (MPa√m)" />
            {kic > 0.02 ? (
              <line x1={b.px(0)} y1={b.py(50)} x2={lerp(b.px(0), b.px(25), kic)} y2={b.py(50)} stroke={C.alarm} strokeWidth={2} strokeDasharray="7 5" />
            ) : null}
            <Label x={b.px(25)} y={b.py(50) + 15} anchor="end" tone="alarm" size={15} opacity={op(seg(t, 0.6, 1.1))}>
              K_IC = 50
            </Label>
            {p200 > 0 ? <path d={b.path(partial(c200, p200))} fill="none" stroke={C.ink} strokeWidth={2.5} /> : null}
            {p400 > 0 ? <path d={b.path(partial(c400, p400))} fill="none" stroke={C.muted} strokeWidth={2.5} /> : null}
            <Label x={b.px(25)} y={b.py(K(200, 25)) - 16} anchor="end" size={15} opacity={op(seg(t, 3.6, 4.1))}>
              σ = 200 MPa
            </Label>
            <Label x={b.px(aTop) + 8} y={b.py(66)} anchor="start" tone="muted" size={15} opacity={op(seg(t, 4.8, 5.3))}>
              σ = 400 MPa
            </Label>

            <Reveal t={t} at={1.5}>
              <Guide x1={b.px(5)} y1={b.py(25.1)} x2={b.px(5)} y2={base} />
              <Dot x={b.px(5)} y={b.py(25.1)} tone="ink" />
            </Reveal>
            <Label x={b.px(5) + 12} y={b.py(25.1) + 14} anchor="start" size={15} opacity={op(seg(t, 1.7, 2.2))}>
              5 mm crack: K = 25.1
            </Label>
            <Reveal t={t} at={t400 - 0.05} dur={0.4}>
              <Dot x={b.px(5)} y={b.py(50)} tone="muted" />
            </Reveal>

            <Reveal t={t} at={tAc + 0.1}>
              <Guide x1={b.px(ac)} y1={b.py(50)} x2={b.px(ac)} y2={base} />
            </Reveal>
            <Reveal t={t} at={tAc - 0.05} dur={0.4}>
              <Dot x={b.px(ac)} y={b.py(50)} />
            </Reveal>

            {[0, 5, 10, 15].map((v) => (
              <XTick key={v} x={b.px(v)} y={base} label={String(v)} />
            ))}
            <Reveal t={t} at={tAc + 0.1}>
              <XTick x={b.px(ac)} y={base} label="a_c ≈ 20" tone="accent" />
            </Reveal>
            {[25, 50].map((v) => (
              <YTick key={v} x={b.x} y={b.py(v)} label={String(v)} />
            ))}
            <Label x={b.x + b.w / 2} y={base + 44} tone="muted" size={15}>
              crack half-length a (mm)
            </Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** Basquin line on log-log S-N axes, read at 300 MPa. */
function Fatigue() {
  const b = plotBox({ x: 70, y: 40, w: 370, h: 190, xMin: 2, xMax: 7, yMin: 2, yMax: 3 });
  const s = (N: number) => 900 * Math.pow(2 * N, -0.1);
  const line = range(2, 7, 50).map((lg) => [lg, Math.log10(s(10 ** lg))] as [number, number]);
  const n300 = 0.5 * Math.pow(3, 10); // 29,524
  const n400 = 0.5 * Math.pow(900 / 400, 10); // ≈1,660
  const base = b.y + b.h;
  const p300: [number, number] = [b.px(Math.log10(n300)), b.py(Math.log10(300))];
  const p400: [number, number] = [b.px(Math.log10(n400)), b.py(Math.log10(400))];
  const sup = ["²", "³", "⁴", "⁵", "⁶", "⁷"];
  return (
    <AnimatedFigure
      height={290}
      duration={5.4}
      alt="Log-log S-N plot of the Basquin line σ_a = 900(2N)^−0.1, with 300 MPa read across to a life of about 29,500 cycles and 400 MPa to about 1,660 cycles."
      steps={[
        {
          at: 0,
          label: "Basquin",
          caption: "On log-log axes Basquin's law, σ_a = σ_f′(2N)^b, is a straight line; this steel has σ_f′ = 900 MPa and b = −0.1.",
        },
        {
          at: 1.6,
          label: "300 MPa",
          caption: "The shaft sees σ_a = 300 MPa: read across to the line, then down to N = ½·3^10 ≈ 29,500 cycles.",
        },
        {
          at: 3.6,
          label: "400 MPa",
          caption:
            "On log-log axes Basquin's law is a straight line. Read across at 300 MPa and down: about 29,500 cycles — and a third more stress costs a factor of 18 in life.",
        },
      ]}
    >
      {({ t }) => {
        const drawn = seg(t, 0.3, 1.3);
        const across3 = seg(t, 1.8, 2.3);
        const down3 = seg(t, 2.4, 2.9);
        const across4 = seg(t, 3.7, 4.2);
        const down4 = seg(t, 4.3, 4.8);
        return (
          <>
            <Axes box={b} xLabel="" yLabel="stress amplitude σ_a (MPa)" />
            {drawn > 0 ? <path d={b.path(partial(line, drawn))} fill="none" stroke={C.ink} strokeWidth={2.5} /> : null}
            <Label x={b.px(4.9)} y={b.py(Math.log10(290)) - 6} anchor="start" size={15} opacity={op(seg(t, 1, 1.5))}>
              σ_f′ = 900, b = −0.1
            </Label>

            {across3 > 0.02 ? <Guide x1={b.x} y1={p300[1]} x2={lerp(b.x, p300[0], across3)} y2={p300[1]} /> : null}
            {down3 > 0.02 ? <Guide x1={p300[0]} y1={p300[1]} x2={p300[0]} y2={lerp(p300[1], base, down3)} /> : null}
            <Reveal t={t} at={2.2} dur={0.4}>
              <Dot x={p300[0]} y={p300[1]} />
            </Reveal>
            <Label x={p300[0] + 8} y={base - 14} anchor="start" tone="accent" size={15} weight={600} opacity={op(seg(t, 2.8, 3.3))}>
              N ≈ 29,500
            </Label>

            {across4 > 0.02 ? <Guide x1={b.x} y1={p400[1]} x2={lerp(b.x, p400[0], across4)} y2={p400[1]} /> : null}
            {down4 > 0.02 ? <Guide x1={p400[0]} y1={p400[1]} x2={p400[0]} y2={lerp(p400[1], base, down4)} /> : null}
            <Reveal t={t} at={4.1} dur={0.4}>
              <Dot x={p400[0]} y={p400[1]} tone="muted" />
            </Reveal>
            <Label x={p400[0] + 8} y={base - 14} anchor="start" tone="muted" size={15} opacity={op(seg(t, 4.7, 5.2))}>
              1,660
            </Label>

            {[2, 3, 4, 5, 6, 7].map((lg, i) => (
              <XTick key={lg} x={b.px(lg)} y={base} label={`10${sup[i]}`} />
            ))}
            <YTick x={b.x} y={b.py(2)} label="100" />
            <Reveal t={t} at={1.6}>
              <YTick x={b.x} y={p300[1]} label="300" tone="accent" />
            </Reveal>
            <Reveal t={t} at={3.6}>
              <YTick x={b.x} y={p400[1]} label="400" />
            </Reveal>
            <YTick x={b.x} y={b.py(3)} label="1000" />
            <Label x={b.x + b.w / 2} y={base + 44} tone="muted" size={15}>
              cycles to failure N (log)
            </Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** The three-stage creep curve; the steady secondary slope is the design number. */
function Creep() {
  const b = plotBox({ x: 50, y: 40, w: 390, h: 180, xMin: 0, xMax: 1, yMin: 0, yMax: 1.15 });
  const eps = (t: number) =>
    0.08 + 0.22 * (1 - Math.exp(-t / 0.06)) + 0.5 * t + (t > 0.72 ? 0.004 * (Math.exp((t - 0.72) / 0.045) - 1) : 0);
  let tEnd = 0.72;
  while (eps(tEnd) < 1.08) tEnd += 0.002;
  const curve = range(0, tEnd, 120).map((t) => [t, eps(t)] as [number, number]);
  const sec = range(0.2, 0.72, 20).map((t) => [t, eps(t)] as [number, number]);
  const base = b.y + b.h;
  // Slowed time: the whole life, 0 → tEnd, plays over 0.4–4.4 s.
  const when = (u: number) => 0.4 + (4 * u) / tEnd;
  return (
    <AnimatedFigure
      height={270}
      duration={5.8}
      alt="Creep strain against time at constant stress and temperature: a decelerating primary stage, a long straight secondary stage highlighted as the design rate, and an accelerating tertiary stage ending in rupture."
      steps={[
        {
          at: 0,
          label: "Primary",
          caption: "Under a constant load at high temperature, primary creep decelerates as the material strain-hardens.",
        },
        {
          at: when(0.2),
          label: "Secondary",
          caption: "Secondary creep settles to a steady rate and runs straight for most of the life.",
        },
        {
          at: when(0.72),
          label: "Tertiary",
          caption: "Tertiary creep accelerates as voids and necking take over, ending in rupture.",
        },
        {
          at: 4.6,
          label: "Design",
          caption:
            "Primary slows, secondary runs straight for most of the life, tertiary sprints to rupture. Size the part on the secondary slope.",
        },
      ]}
    >
      {({ t }) => {
        const life = clamp((t - 0.4) / 4);
        const rate = seg(t, 4.7, 5.3);
        return (
          <>
            <Axes box={b} xLabel="time" yLabel="strain ε" />
            {[0.2, 0.72].map((u) => (
              <g key={u} opacity={op(seg(t, when(u), when(u) + 0.5))}>
                <Guide x1={b.px(u)} y1={b.y} x2={b.px(u)} y2={base} />
              </g>
            ))}
            <Label x={b.px(0.1)} y={b.y + b.h - 14} tone="muted" size={15} opacity={op(seg(t, 0.4, 0.9))}>
              primary
            </Label>
            <Label x={b.px(0.46)} y={b.y + b.h - 14} tone="muted" size={15} opacity={op(seg(t, when(0.2), when(0.2) + 0.5))}>
              secondary
            </Label>
            <Label x={b.px(0.86)} y={b.y + b.h - 14} tone="muted" size={15} opacity={op(seg(t, when(0.72), when(0.72) + 0.5))}>
              tertiary
            </Label>
            {life > 0 ? <path d={b.path(partial(curve, life))} fill="none" stroke={C.ink} strokeWidth={2.5} /> : null}
            {rate > 0 ? <path d={b.path(partial(sec, rate))} fill="none" stroke={C.accent} strokeWidth={5} strokeLinecap="round" /> : null}
            <Label x={b.px(0.44)} y={b.py(0.86)} tone="accent" size={15} weight={600} opacity={op(seg(t, 5.1, 5.6))}>
              steady rate ε̇ₛ
            </Label>
            <Label x={b.px(0.44)} y={b.py(0.86) + 20} tone="accent" size={15} opacity={op(seg(t, 5.1, 5.6))}>
              = the design number
            </Label>
            <Cross x={b.px(tEnd)} y={b.py(eps(tEnd))} p={seg(t, 4.4, 4.8)} />
            <Label x={b.px(tEnd) - 14} y={b.py(eps(tEnd))} anchor="end" tone="alarm" size={15} opacity={op(seg(t, 4.5, 5))}>
              rupture
            </Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/* ---------- W17: phase diagrams ---------- */

/** Cu–Ni lens (linearized), Cu–30 Ni cooled through it, tie line at 1190°C. */
function PhaseDiagram() {
  const b = plotBox({ x: 70, y: 36, w: 370, h: 214, xMin: 22, xMax: 40, yMin: 1150, yMax: 1225 });
  const liq = (c: number) => 1085 + 3.7 * c;
  const sol = (c: number) => 1085 + 3.2 * c;
  const base = b.y + b.h;
  const cL = (1190 - 1085) / 3.7;
  const cA = (1190 - 1085) / 3.2;
  const ang = (-Math.atan2(3.7 * (b.h / 75), b.w / 18) * 180) / Math.PI;
  return (
    <AnimatedFigure
      height={320}
      duration={5.6}
      alt="Close-up of the copper–nickel phase diagram with liquidus and solidus as straight lines; the Cu–30 wt% Ni alloy's vertical line crosses the liquidus at 1196°C and the solidus at 1181°C, and the tie line at 1190°C runs from 28.4 wt% Ni in the liquid to 32.8 wt% Ni in the solid."
      steps={[
        {
          at: 0,
          label: "Cool",
          caption: "A Cu–30 wt% Ni alloy cools slowly: nothing happens until its vertical line meets the liquidus.",
        },
        {
          at: 1.2,
          label: "Liquidus",
          caption: "It meets the liquidus at T = 1085 + 3.7 × 30 = 1196°C, where the first α solid appears.",
        },
        {
          at: 2.2,
          label: "Solidus",
          caption: "Freezing finishes at the solidus, T = 1085 + 3.2 × 30 = 1181°C: a 15-degree freezing range.",
        },
        {
          at: 3.8,
          label: "Tie line",
          caption:
            "Drop a vertical at 30 wt% Ni: freezing starts at 1196°C and ends at 1181°C. At 1190°C the tie line's ends, 28.4 and 32.8, are the real phase compositions — neither is 30.",
        },
      ]}
    >
      {({ t }) => {
        // The alloy's vertical grows down as it cools: to the liquidus, through the freezing range, then on down.
        const yEnd = lerp(lerp(lerp(b.y - 4, b.py(1196), seg(t, 0.4, 1.2)), b.py(1181), seg(t, 2.2, 2.9)), base, seg(t, 3.1, 3.5));
        const tie = seg(t, 4.2, 4.8);
        return (
          <>
            <defs>
              <clipPath id="mb-pd-clip">
                <rect x={b.x} y={b.y} width={b.w} height={b.h} />
              </clipPath>
            </defs>
            <g clipPath="url(#mb-pd-clip)">
              <path d={`M${b.px(22)},${b.py(liq(22))} L${b.px(40)},${b.py(liq(40))} L${b.px(40)},${b.py(sol(40))} L${b.px(22)},${b.py(sol(22))} Z`} fill={C.soft} />
              <line x1={b.px(22)} y1={b.py(liq(22))} x2={b.px(40)} y2={b.py(liq(40))} stroke={C.ink} strokeWidth={2.5} />
              <line x1={b.px(22)} y1={b.py(sol(22))} x2={b.px(40)} y2={b.py(sol(40))} stroke={C.ink} strokeWidth={2.5} />
            </g>
            <Axes box={b} xLabel="" yLabel="T (°C)" />

            <Label x={b.px(25)} y={b.py(1212)} size={20} serif>
              L
            </Label>
            <Label x={b.px(37.5)} y={b.py(1165)} size={20} serif>
              α
            </Label>
            <g transform={`translate(${b.px(37.4)},${b.py((liq(37.4) + sol(37.4)) / 2)}) rotate(${ang})`}>
              <Label x={0} y={0} size={16} serif>
                L + α
              </Label>
            </g>
            <g transform={`translate(${b.px(32.6)},${b.py(liq(32.6)) - 12}) rotate(${ang})`}>
              <Label x={0} y={0} size={15} tone="muted">
                liquidus
              </Label>
            </g>
            <g transform={`translate(${b.px(25.6)},${b.py(sol(25.6)) + 13}) rotate(${ang})`}>
              <Label x={0} y={0} size={15} tone="muted">
                solidus
              </Label>
            </g>

            {/* alloy line */}
            {yEnd > b.y - 3 ? (
              <line x1={b.px(30)} y1={b.y - 4} x2={b.px(30)} y2={yEnd} stroke={C.ink} strokeWidth={1.5} strokeDasharray="6 4" />
            ) : null}
            <Label x={b.px(30)} y={b.y - 18} size={15} weight={600} opacity={op(seg(t, 0.2, 0.7))}>
              Cu–30 Ni
            </Label>
            <Reveal t={t} at={1.3}>
              <Guide x1={b.x} y1={b.py(1196)} x2={b.px(30)} y2={b.py(1196)} />
            </Reveal>
            <Reveal t={t} at={3}>
              <Guide x1={b.x} y1={b.py(1181)} x2={b.px(30)} y2={b.py(1181)} />
            </Reveal>
            <Reveal t={t} at={3.9}>
              <Guide x1={b.x} y1={b.py(1190)} x2={b.px(cL)} y2={b.py(1190)} />
            </Reveal>
            <Reveal t={t} at={1.2} dur={0.4}>
              <Dot x={b.px(30)} y={b.py(1196)} tone="ink" r={4.5} />
            </Reveal>
            <Reveal t={t} at={2.9} dur={0.4}>
              <Dot x={b.px(30)} y={b.py(1181)} tone="ink" r={4.5} />
            </Reveal>

            {/* tie line */}
            {tie > 0.02 ? (
              <line x1={lerp(b.px(30), b.px(cL), tie)} y1={b.py(1190)} x2={lerp(b.px(30), b.px(cA), tie)} y2={b.py(1190)} stroke={C.accent} strokeWidth={4} />
            ) : null}
            <Reveal t={t} at={4.7} dur={0.4}>
              <Dot x={b.px(cL)} y={b.py(1190)} />
              <Dot x={b.px(cA)} y={b.py(1190)} />
            </Reveal>
            <Reveal t={t} at={4.9}>
              <Guide x1={b.px(cL)} y1={b.py(1190)} x2={b.px(cL)} y2={base} />
              <Guide x1={b.px(cA)} y1={b.py(1190)} x2={b.px(cA)} y2={base} />
            </Reveal>

            <Reveal t={t} at={1.3}>
              <YTick x={b.x} y={b.py(1196)} label="1196" />
            </Reveal>
            <Reveal t={t} at={3.9}>
              <YTick x={b.x} y={b.py(1190)} label="1190" tone="accent" />
            </Reveal>
            <Reveal t={t} at={3}>
              <YTick x={b.x} y={b.py(1181)} label="1181" />
            </Reveal>
            <Reveal t={t} at={4.9}>
              <XTick x={b.px(cL)} y={base} label="28.4" tone="accent" />
              <XTick x={b.px(cA)} y={base} label="32.8" tone="accent" />
            </Reveal>
            <XTick x={b.px(22)} y={base} label="22" />
            <XTick x={b.px(40)} y={base} label="40" />
            <Label x={b.px(36)} y={base + 18} tone="muted" size={15}>
              wt% Ni
            </Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** The tie line as a lever: fulcrum at C₀ = 40, opposite arm over the whole. */
function LeverRule() {
  const px = (c: number) => 40 + ((c - 35) / 9) * 400;
  const beamY = 104;
  const xL = px(36.5);
  const x0 = px(40);
  const xA = px(42.2);
  const hL = 0.39 * 80;
  const hA = 0.61 * 80;
  return (
    <AnimatedFigure
      height={270}
      duration={4.9}
      alt="The 1220°C tie line for Cu–40 wt% Ni drawn as a balance beam from 36.5 (liquid) to 42.2 (solid α) resting on a fulcrum at 40; the arm opposite the liquid is 2.2 of the whole 5.7, so the liquid is 39% and α 61%."
      steps={[
        {
          at: 0,
          label: "Tie line",
          caption: "At 1220°C the Cu–40 wt% Ni tie line runs from C_L = 36.5 wt% Ni in the liquid to C_α = 42.2 in solid α.",
        },
        {
          at: 1.1,
          label: "Fulcrum",
          caption: "The alloy's own composition, C₀ = 40, is the fulcrum: it splits the tie line into two arms.",
        },
        {
          at: 2.5,
          label: "Far arm",
          caption: "The liquid's share is the far arm over the whole tie line: W_L = (42.2 − 40)/(42.2 − 36.5) = 2.2/5.7 = 0.39.",
        },
        {
          at: 3.7,
          label: "Balance",
          caption:
            "The alloy is the fulcrum. Each phase's share is the arm on the far side over the whole beam — the short arm carries the heavy weight.",
        },
      ]}
    >
      {({ t }) => {
        const beam = seg(t, 0.3, 0.9);
        const hang = op(seg(t, 3.7, 4));
        const load = seg(t, 3.8, 4.4);
        return (
          <>
            <Reveal t={t} at={2.5}>
              <DimH x1={xL} x2={xA} y={34} label="whole tie line 5.7" />
            </Reveal>
            <Reveal t={t} at={1.5}>
              <DimH x1={xL} x2={x0} y={74} label="3.5" />
            </Reveal>
            <Reveal t={t} at={1.7}>
              <DimH x1={x0} x2={xA} y={74} label="2.2" tone="accent" />
            </Reveal>

            {beam > 0.02 ? (
              <line x1={xL} y1={beamY} x2={lerp(xL, xA, beam)} y2={beamY} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
            ) : null}
            <Reveal t={t} at={1.1}>
              <path d={`M${x0},${beamY + 3} L${x0 - 16},${beamY + 30} L${x0 + 16},${beamY + 30} Z`} fill={C.accent} />
              <line x1={x0 - 30} y1={beamY + 31} x2={x0 + 30} y2={beamY + 31} stroke={C.ink} strokeWidth={2.5} />
            </Reveal>

            <line x1={xL} y1={beamY} x2={xL} y2={beamY + 16} stroke={C.ink} strokeWidth={1.5} opacity={hang} />
            {load > 0 ? <rect x={xL - 36} y={beamY + 16} width={72} height={hL * load} rx={3} fill={C.surface} stroke={C.ink} strokeWidth={2} /> : null}
            <Label x={xL} y={beamY + 16 + hL / 2} size={16} weight={600} opacity={op(seg(t, 4.2, 4.7))}>
              L 39%
            </Label>
            <line x1={xA} y1={beamY} x2={xA} y2={beamY + 16} stroke={C.ink} strokeWidth={1.5} opacity={hang} />
            {load > 0 ? <rect x={xA - 36} y={beamY + 16} width={72} height={hA * load} rx={3} fill={C.soft} stroke={C.ink} strokeWidth={2} /> : null}
            <Label x={xA} y={beamY + 16 + hA / 2} size={16} weight={600} opacity={op(seg(t, 4.2, 4.7))}>
              α 61%
            </Label>

            <line x1={40} y1={196} x2={440} y2={196} stroke={C.muted} strokeWidth={1.5} />
            <XTick x={xL} y={196} label="36.5 (C_L)" />
            <XTick x={x0} y={196} label="40 (C₀)" tone="ink" />
            <XTick x={xA} y={196} label="42.2 (C_α)" />
            <Label x={440} y={184} anchor="end" tone="muted" size={15}>
              wt% Ni
            </Label>

            <Label x={240} y={250} size={18} serif tone="accent" weight={600} opacity={op(seg(t, 2.9, 3.4))}>
              W_L = 2.2 / 5.7 = 0.39
            </Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** Pb–Sn eutectic diagram with Pb–40 Sn cooling, plus its final microstructure. */
function Transformations() {
  const b = plotBox({ x: 56, y: 36, w: 290, h: 200, xMin: 0, xMax: 100, yMin: 0, yMax: 340 });
  const base = b.y + b.h;
  const liqL = (c: number) => 327 - ((327 - 183) * c) / 61.9;
  const P = (c: number, t: number) => `${b.px(c).toFixed(1)},${b.py(t).toFixed(1)}`;
  const tStart = liqL(40);
  // microstructure inset
  const cx = 418;
  const cy = 118;
  const r = 46;
  const lam: ReactNode[] = [];
  for (let i = -60; i <= 60; i += 6) {
    lam.push(<line key={i} x1={cx + i - 40} y1={cy - 60} x2={cx + i + 40} y2={cy + 60} stroke={C.muted} strokeWidth={2} />);
  }
  const blobs: Array<[number, number, number, number, number]> = [
    [-22, -20, 15, 10, -20],
    [14, -26, 12, 9, 30],
    [-4, 4, 16, 11, 10],
    [24, 14, 11, 14, -10],
    [-26, 20, 12, 10, 40],
    [4, 32, 12, 8, -30],
  ];
  const yTop = b.py(300);
  return (
    <AnimatedFigure
      height={300}
      duration={5.4}
      alt="Lead–tin eutectic phase diagram with the Pb–40 wt% Sn alloy cooling from 300°C; just above 183°C the tie line from 19.2 to 61.9 wt% Sn gives 51% primary α and 49% liquid, which becomes lamellar α + β eutectic — shown in a microstructure circle of α blobs in striped eutectic."
      steps={[
        {
          at: 0,
          label: "Liquidus",
          caption: "Pb–40 wt% Sn cools from 300°C; at the liquidus the first α appears.",
        },
        {
          at: 1.5,
          label: "Primary α",
          caption: "Cooling on through the L + α field, chunky primary α dendrites grow.",
        },
        {
          at: 2.7,
          label: "Lever rule",
          caption: "Just above 183°C the lever rule gives W_α = 21.9/42.7 = 0.51: 51% primary α, 49% liquid at the eutectic composition.",
        },
        {
          at: 4.2,
          label: "Eutectic",
          caption:
            "Cool Pb–40 Sn: α dendrites grow first, then at 183°C the leftover 49% liquid transforms at the fixed eutectic temperature into α + β lamellae as heat is removed.",
        },
      ]}
    >
      {({ t }) => {
        // The alloy's vertical grows down as it cools: to the liquidus, to just above 183°C, then through it.
        const yEnd = lerp(lerp(lerp(yTop, b.py(tStart), seg(t, 0.4, 1.2)), b.py(183), seg(t, 1.6, 2.4)), base, seg(t, 4.2, 4.7));
        const tie = seg(t, 2.8, 3.4);
        const inset = op(seg(t, 1.5, 2));
        return (
          <>
            <defs>
              <clipPath id="mb-tr-clip">
                <circle cx={cx} cy={cy} r={r} />
              </clipPath>
            </defs>
            <Axes box={b} xLabel="" yLabel="T (°C)" />
            {/* liquidus */}
            <path d={`M${P(0, 327)} L${P(61.9, 183)} L${P(100, 232)}`} fill="none" stroke={C.ink} strokeWidth={2.5} />
            {/* solidus + solvus, α side and β side */}
            <path d={`M${P(0, 327)} L${P(19.2, 183)} L${P(0, 0)}`} fill="none" stroke={C.ink} strokeWidth={2} />
            <path d={`M${P(100, 232)} L${P(97.5, 183)} L${P(100, 0)}`} fill="none" stroke={C.ink} strokeWidth={2} />
            {/* eutectic isotherm */}
            <line x1={b.px(19.2)} y1={b.py(183)} x2={b.px(97.5)} y2={b.py(183)} stroke={C.ink} strokeWidth={2.5} />

            <Label x={b.px(50)} y={b.py(300)} size={20} serif>
              L
            </Label>
            <Label x={b.px(7)} y={b.py(130)} size={18} serif>
              α
            </Label>
            <Label x={b.px(80)} y={b.py(90)} size={18} serif>
              α + β
            </Label>
            <Label x={b.px(26)} y={b.py(228)} size={15} serif>
              L+α
            </Label>

            {/* alloy path and tie line */}
            {yEnd > yTop + 1 ? (
              <line x1={b.px(40)} y1={yTop} x2={b.px(40)} y2={yEnd} stroke={C.accent} strokeWidth={2} strokeDasharray="6 4" />
            ) : null}
            <Reveal t={t} at={1.1} dur={0.4}>
              <Dot x={b.px(40)} y={b.py(tStart)} tone="ink" r={4.5} />
            </Reveal>
            {tie > 0.02 ? (
              <line x1={lerp(b.px(40), b.px(19.2), tie)} y1={b.py(183)} x2={lerp(b.px(40), b.px(61.9), tie)} y2={b.py(183)} stroke={C.accent} strokeWidth={4} />
            ) : null}
            <Reveal t={t} at={3.3} dur={0.4}>
              <Dot x={b.px(19.2)} y={b.py(183)} />
              <Dot x={b.px(61.9)} y={b.py(183)} />
            </Reveal>
            <Reveal t={t} at={3.4}>
              <Guide x1={b.px(61.9)} y1={b.py(183)} x2={b.px(61.9)} y2={base} />
              <Guide x1={b.px(19.2)} y1={b.py(183)} x2={b.px(19.2)} y2={base} />
            </Reveal>
            <Reveal t={t} at={4.4}>
              <Guide x1={b.px(97.5)} y1={b.py(183)} x2={b.px(97.5)} y2={base} />
            </Reveal>

            <Reveal t={t} at={2.7}>
              <YTick x={b.x} y={b.py(183)} label="183" tone="accent" />
            </Reveal>
            <YTick x={b.x} y={b.py(300)} label="300" />
            <Reveal t={t} at={3.4}>
              <XTick x={b.px(19.2)} y={base} label="19.2" />
            </Reveal>
            <XTick x={b.px(40)} y={base} label="40" tone="accent" />
            <Reveal t={t} at={3.4}>
              <XTick x={b.px(61.9)} y={base} label="61.9" />
            </Reveal>
            <Reveal t={t} at={4.4}>
              <XTick x={b.px(97.5)} y={base} label="97.5" />
            </Reveal>
            <Label x={b.x + b.w / 2} y={base + 44} tone="muted" size={15}>
              wt% Sn
            </Label>

            {/* microstructure inset: α blobs grow first, the lamellae freeze at 183°C */}
            <g clipPath="url(#mb-tr-clip)">
              <rect x={cx - r} y={cy - r} width={2 * r} height={2 * r} fill={C.surface} opacity={inset} />
              <g opacity={op(seg(t, 4.4, 4.9))}>{lam}</g>
              {blobs.map(([dx, dy, rx, ry, rot], i) => {
                const g = seg(t, 1.7 + 0.1 * i, 2.3 + 0.1 * i);
                return g > 0 ? (
                  <ellipse
                    key={i}
                    cx={cx + dx}
                    cy={cy + dy}
                    rx={rx * g}
                    ry={ry * g}
                    transform={`rotate(${rot} ${cx + dx} ${cy + dy})`}
                    fill={C.soft}
                    stroke={C.accent}
                    strokeWidth={2}
                  />
                ) : null;
              })}
            </g>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.ink} strokeWidth={2} opacity={inset} />
            <Label x={cx} y={cy - r - 14} size={15} tone="muted" opacity={op(seg(t, 4.5, 5))}>
              below 183°C
            </Label>
            <Label x={cx} y={cy + r + 18} size={15} tone="accent" weight={600} opacity={op(seg(t, 3.5, 4))}>
              51% primary α
            </Label>
            <Label x={cx} y={cy + r + 38} size={15} opacity={op(seg(t, 4.7, 5.2))}>
              49% eutectic
            </Label>
            <Label x={cx} y={cy + r + 56} size={15} tone="muted" opacity={op(seg(t, 4.7, 5.2))}>
              (α + β lamellae)
            </Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/* ---------- W18: families ---------- */

/** Specific stiffness bars: the metals tie, CFRP runs away along the fiber. */
function FamLook() {
  const x0 = 140;
  const sx = (v: number) => (v / 90) * 300;
  const rows: Array<[string, number, string, "ink" | "accent"]> = [
    ["steel", 25.5, "200 / 7.85 ≈ 25.5", "ink"],
    ["aluminum", 25.6, "69 / 2.7 ≈ 25.6", "ink"],
    ["CFRP", 90, "140 / 1.55 ≈ 90", "accent"],
  ];
  // Bars grow at about the same speed: the metals together, then the composite runs on.
  const grow = (t: number, i: number) => (i < 2 ? seg(t, 1, 1.6) : seg(t, 2.4, 4.2));
  return (
    <AnimatedFigure
      height={230}
      duration={4.9}
      alt="Horizontal bar chart of specific stiffness E/ρ: steel 25.5, aluminum 25.6, and carbon-fiber composite along the fiber 90 GPa per g/cm³."
      steps={[
        {
          at: 0,
          label: "Budget",
          caption: "A tie rod must be stiff in tension, and mass is the budget: compare steel, aluminum and CFRP by specific stiffness E/ρ.",
        },
        {
          at: 1,
          label: "Metals",
          caption: "Steel gives 200/7.85 ≈ 25.5 and aluminum 69/2.7 ≈ 25.6: the two metals tie.",
        },
        {
          at: 2.4,
          label: "CFRP",
          caption: "Per unit mass, steel and aluminum are the same stiffness; the composite is 3.5× better — but only along its fibers.",
        },
      ]}
    >
      {({ t }) => (
        <>
          <Label x={x0} y={24} anchor="start" tone="muted" size={15} opacity={op(seg(t, 0.3, 0.8))}>
            specific stiffness E/ρ (GPa per g/cm³)
          </Label>
          <line x1={x0} y1={42} x2={x0} y2={190} stroke={C.ink} strokeWidth={1.5} />
          {rows.map(([name, v, text, tone], i) => {
            const y = 66 + i * 50;
            const p = grow(t, i);
            return (
              <g key={name}>
                <Label x={x0 - 10} y={y} anchor="end" size={16} weight={600} tone={tone}>
                  {name}
                </Label>
                {p > 0 ? <rect x={x0} y={y - 15} width={sx(v) * p} height={30} rx={2} fill={tone === "accent" ? C.accent : C.muted} /> : null}
                {i < 2 ? (
                  <Label x={x0 + sx(v) + 8} y={y} anchor="start" size={15} opacity={op(seg(t, 1.5, 2))}>
                    {text}
                  </Label>
                ) : (
                  <text x={x0 + sx(v) - 10} y={y} textAnchor="end" dominantBaseline="middle" fontSize={15} fontWeight={600} fill={C.surface} opacity={op(seg(t, 4, 4.5))}>
                    {text}
                  </text>
                )}
              </g>
            );
          })}
          <Label x={x0 + sx(90)} y={206} anchor="end" tone="muted" size={15} opacity={op(seg(t, 4.2, 4.7))}>
            along the fiber only
          </Label>
        </>
      )}
    </AnimatedFigure>
  );
}

/** A unidirectional CFRP block: Voigt along the fiber, Reuss across it. */
function DirTemp() {
  const bx = 150;
  const by = 86;
  const bw = 190;
  const bh = 100;
  const fibers: number[] = [];
  for (let y = by + 10; y < by + bh; y += 10) fibers.push(y);
  const midY = by + bh / 2;
  const midX = bx + bw / 2;
  return (
    <AnimatedFigure
      height={270}
      duration={4.5}
      alt="A unidirectional carbon-fiber block with fibers running left to right; pulling along the fibers gives 139.2 GPa, pulling across them gives 7.4 GPa, a ratio of 19 to 1."
      steps={[
        {
          at: 0,
          label: "Block",
          caption: "A unidirectional CFRP block: 60% carbon fiber (230 GPa) in epoxy (3 GPa), the fibers all running one way.",
        },
        {
          at: 1.1,
          label: "Along",
          caption: "Pulled along the fibers, both phases share the same strain: 0.6×230 + 0.4×3 = 139.2 GPa.",
        },
        {
          at: 2.4,
          label: "Across",
          caption: "Pulled across them, the soft epoxy takes the strain: 1/(0.6/230 + 0.4/3) ≈ 7.4 GPa.",
        },
        {
          at: 3.6,
          label: "Ratio",
          caption:
            "Same block, two directions: along the fibers the stiff fiber carries the load; across them the soft epoxy does. Design to the weak one.",
        },
      ]}
    >
      {({ t }) => {
        const laid = seg(t, 0.3, 0.9);
        const along = seg(t, 1.2, 1.7);
        const across = seg(t, 2.5, 3);
        return (
          <>
            <rect x={bx} y={by} width={bw} height={bh} rx={3} fill={C.soft} stroke={C.ink} strokeWidth={2} />
            {laid > 0.02
              ? fibers.map((y) => (
                  <line key={y} x1={bx + 4} y1={y} x2={lerp(bx + 4, bx + bw - 4, laid)} y2={y} stroke={C.ink} strokeWidth={2.5} />
                ))
              : null}
            <GrowArrow p={along} x1={bx + bw + 6} y1={midY} x2={bx + bw + 70} y2={midY} width={4} />
            <GrowArrow p={along} x1={bx - 6} y1={midY} x2={bx - 70} y2={midY} width={4} />
            <Label x={470} y={midY - 40} anchor="end" tone="accent" size={15} opacity={op(seg(t, 1.5, 2))}>
              along fiber
            </Label>
            <Label x={470} y={midY - 20} anchor="end" tone="accent" size={18} weight={600} opacity={op(seg(t, 1.5, 2))}>
              139.2 GPa
            </Label>

            <GrowArrow p={across} x1={midX} y1={by - 4} x2={midX} y2={by - 50} tone="alarm" width={3} />
            <GrowArrow p={across} x1={midX} y1={by + bh + 4} x2={midX} y2={by + bh + 50} tone="alarm" width={3} />
            <Label x={midX + 14} y={by - 40} anchor="start" tone="alarm" size={15} opacity={op(seg(t, 2.8, 3.3))}>
              across
            </Label>
            <Label x={midX + 14} y={by - 20} anchor="start" tone="alarm" size={18} weight={600} opacity={op(seg(t, 2.8, 3.3))}>
              7.4 GPa
            </Label>

            <Label x={70} y={40} size={26} serif tone="ink" weight={600} opacity={op(seg(t, 3.7, 4.2))}>
              19 : 1
            </Label>
            <Label x={240} y={258} tone="muted" size={15}>
              60% carbon fiber (230 GPa) in epoxy (3 GPa)
            </Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** Temperature screen at 900°C: families die at their ceilings; two survive. */
function ChooseFam() {
  const x0 = 130;
  const sx = (t: number) => x0 + (t / 1100) * 320;
  const rows: Array<{ name: string; t: number; note: string; kind: "dead" | "alive" | "win" }> = [
    { name: "polymers", t: 250, note: "~250°C", kind: "dead" },
    { name: "composites", t: 250, note: "~250°C matrix", kind: "dead" },
    { name: "steel, Al", t: 450, note: "~450°C creep", kind: "dead" },
    { name: "superalloy", t: 1100, note: "~20× steel cost", kind: "alive" },
    { name: "ceramic", t: 1100, note: "winner: brittle", kind: "win" },
  ];
  const screen = sx(900);
  // Raise the temperature steadily, 0 → 1100°C over 1.0–3.2 s; each bar stops at its family's ceiling.
  const reach = (temp: number) => 1 + (2.2 * temp) / 1100;
  return (
    <AnimatedFigure
      height={290}
      duration={4.7}
      alt="Bar chart of continuous-service temperature ceilings for five families against a 900°C screen line: polymers and composites stop near 250°C, steel and aluminum near 450°C, while nickel superalloys and ceramics pass; the ceramic is marked the winner at the price of brittleness."
      steps={[
        {
          at: 0,
          label: "Screen",
          caption: "The bracket must hold 50 MPa at 900°C continuous, in air, so 900°C is a hard screen.",
        },
        {
          at: 1,
          label: "Kill",
          caption: "At their best edges, polymers and composites are done by ~250°C, and steel and aluminum creep by ~450°C.",
        },
        {
          at: reach(900),
          label: "Survivors",
          caption: "Nickel superalloys and ceramics clear 900°C; the superalloy survives but costs ~20× steel.",
        },
        {
          at: 3.9,
          label: "Winner",
          caption:
            "The 900°C screen kills three families at their best edge. Of the two survivors, cost ranks ceramic first — and its price, brittleness, is stated.",
        },
      ]}
    >
      {({ t }) => {
        const temp = 1100 * clamp((t - 1) / 2.2);
        const drop = seg(t, 0.3, 0.9);
        return (
          <>
            {drop > 0.02 ? (
              <line x1={screen} y1={34} x2={screen} y2={lerp(34, 250, drop)} stroke={C.alarm} strokeWidth={2.5} strokeDasharray="7 5" />
            ) : null}
            <Label x={screen} y={20} tone="alarm" size={15} weight={600} opacity={op(seg(t, 0.4, 0.9))}>
              screen: 900°C
            </Label>
            <line x1={x0} y1={40} x2={x0} y2={250} stroke={C.ink} strokeWidth={1.5} />
            {rows.map((r, i) => {
              const y = 60 + i * 42;
              const end = sx(r.t);
              const fill = r.kind === "dead" ? C.line : r.kind === "alive" ? C.soft : C.accent;
              const stop = reach(r.t);
              const noted = r.kind === "win" ? 4 : 3.3;
              return (
                <g key={r.name}>
                  <Label x={x0 - 10} y={y} anchor="end" size={16} tone={r.kind === "dead" ? "muted" : r.kind === "win" ? "accent" : "ink"} weight={r.kind === "win" ? 600 : undefined}>
                    {r.name}
                  </Label>
                  {temp > 0 ? (
                    <rect x={x0} y={y - 13} width={sx(Math.min(temp, r.t)) - x0} height={26} rx={2} fill={fill} stroke={r.kind === "dead" ? C.muted : C.accent} strokeWidth={1.5} />
                  ) : null}
                  {r.kind === "dead" ? (
                    <>
                      <Cross x={end} y={y} s={7} p={seg(t, stop, stop + 0.35)} />
                      <Label x={end + 14} y={y} anchor="start" size={15} tone="muted" opacity={op(seg(t, stop + 0.1, stop + 0.6))}>
                        {r.note}
                      </Label>
                    </>
                  ) : (
                    <text x={x0 + 10} y={y} dominantBaseline="middle" fontSize={15} fontWeight={600} fill={r.kind === "win" ? C.surface : C.ink} opacity={op(seg(t, noted, noted + 0.5))}>
                      {r.note}
                    </text>
                  )}
                </g>
              );
            })}
            <line x1={x0} y1={250} x2={sx(1100)} y2={250} stroke={C.muted} strokeWidth={1.5} />
            {[0, 450, 900].map((v) => (
              <XTick key={v} x={sx(v)} y={250} label={`${v}°C`} tone={v === 900 ? "alarm" : "muted"} />
            ))}
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/* ---------- W19: selection, corrosion, sustainability ---------- */

/** Ashby-style log E vs log ρ: index lines of slope 1, then screens strike two. */
function ScreenRank() {
  const b = plotBox({ x: 70, y: 40, w: 360, h: 190, xMin: 0, xMax: 1, yMin: 1, yMax: Math.log10(300) });
  const base = b.y + b.h;
  const pt = (rho: number, E: number) => [b.px(Math.log10(rho)), b.py(Math.log10(E))] as const;
  /** Index line E/ρ = M from ρ = r0 to r1, drawn to the fraction p. */
  const idx = (M: number, r0: number, r1: number, p = 1) =>
    b.path([
      [Math.log10(r0), Math.log10(M * r0)],
      [lerp(Math.log10(r0), Math.log10(r1), p), lerp(Math.log10(M * r0), Math.log10(M * r1), p)],
    ]);
  const steel = pt(7.85, 200);
  const al = pt(2.7, 69);
  const cf = pt(1.55, 140);
  return (
    <AnimatedFigure
      height={290}
      duration={4.9}
      alt="Log-log chart of stiffness E against density ρ with steel, aluminum and carbon fiber plotted; steel and aluminum lie on the same index line E/ρ ≈ 25.5, carbon fiber on a higher line near 90, but carbon is struck out by the $10/kg cost screen and bare steel by the outdoor corrosion screen, leaving aluminum."
      steps={[
        {
          at: 0,
          label: "Plot",
          caption: "A 1 m tie rod must hit a stiffness target: place steel, aluminum and carbon fiber on log E against log ρ.",
        },
        {
          at: 1.1,
          label: "Index",
          caption: "Constant E/ρ is a line of slope 1: steel (25.5) and aluminum (25.6) share one, and carbon fiber sits far ahead at 90.3.",
        },
        {
          at: 2.4,
          label: "Screens",
          caption: "The cost screen kills carbon at $80/kg against a $10 ceiling; the corrosion screen kills bare steel outdoors.",
        },
        {
          at: 3.9,
          label: "Shortlist",
          caption:
            "The index line says steel and aluminum tie and carbon wins. The screens strike carbon (cost) and bare steel (corrosion): the shortlist is aluminum.",
        },
      ]}
    >
      {({ t }) => {
        const drawn = seg(t, 1.2, 1.9);
        const ring = seg(t, 4, 4.5);
        return (
          <>
            <Axes box={b} xLabel="" yLabel="E (GPa, log)" />
            {drawn > 0.02 ? <path d={idx(25.5, 1, 10, drawn)} fill="none" stroke={C.muted} strokeWidth={2} strokeDasharray="7 5" /> : null}
            {drawn > 0.02 ? <path d={idx(90.3, 1, 300 / 90.3, drawn)} fill="none" stroke={C.muted} strokeWidth={2} strokeDasharray="7 5" /> : null}
            <Label x={b.px(Math.log10(1.15))} y={b.py(Math.log10(25.5 * 1.15)) + 20} anchor="start" tone="muted" size={15} opacity={op(seg(t, 1.7, 2.2))}>
              E/ρ = 25.5
            </Label>
            <Label x={b.px(Math.log10(300 / 90.3)) + 8} y={b.y + 4} anchor="start" tone="muted" size={15} opacity={op(seg(t, 1.7, 2.2))}>
              E/ρ = 90
            </Label>

            <Reveal t={t} at={0.3} dur={0.4}>
              <Dot x={steel[0]} y={steel[1]} tone="ink" r={7} />
            </Reveal>
            <Cross x={steel[0]} y={steel[1]} s={10} p={seg(t, 3, 3.4)} />
            <Label x={464} y={steel[1] + 34} anchor="end" size={15} tone="alarm" opacity={op(seg(t, 3.2, 3.7))}>
              bare steel: rusts
            </Label>
            <Reveal t={t} at={0.45} dur={0.4}>
              <Dot x={cf[0]} y={cf[1]} tone="ink" r={7} />
            </Reveal>
            <Cross x={cf[0]} y={cf[1]} s={10} p={seg(t, 2.5, 2.9)} />
            <Label x={cf[0] + 16} y={cf[1] + 16} anchor="start" size={15} tone="alarm" opacity={op(seg(t, 2.7, 3.2))}>
              carbon: $80/kg
            </Label>
            {ring > 0 ? <circle cx={al[0]} cy={al[1]} r={lerp(7, 12, ring)} fill="none" stroke={C.accent} strokeWidth={3} opacity={op(ring)} /> : null}
            <Reveal t={t} at={0.6} dur={0.4}>
              <Dot x={al[0]} y={al[1]} r={7} />
            </Reveal>
            <Label x={al[0] + 18} y={al[1] + 16} anchor="start" size={16} tone="accent" weight={600} opacity={op(seg(t, 4.2, 4.7))}>
              6061 Al: shortlist
            </Label>

            {[1, 3, 10].map((v) => (
              <XTick key={v} x={b.px(Math.log10(v))} y={base} label={String(v)} />
            ))}
            {[10, 30, 100, 300].map((v) => (
              <YTick key={v} x={b.x} y={b.py(Math.log10(v))} label={String(v)} />
            ))}
            <Label x={b.x + b.w / 2} y={base + 44} tone="muted" size={15}>
              density ρ (g/cm³, log)
            </Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** Steel bolt through an aluminum cleat in salt spray: the galvanic cell and its crevice. */
function Corrosion() {
  const drops = [70, 110, 150, 300, 340, 380, 420];
  return (
    <AnimatedFigure
      height={280}
      duration={4.9}
      alt="Cross-section of a steel bolt through an aluminum cleat on a deck, under salt spray; aluminum at −0.75 V is the anode and steel at −0.60 V the cathode, electrons flow from the aluminum into the bolt, and pits start in the crevice under the bolt head."
      steps={[
        {
          at: 0,
          label: "Joint",
          caption: "A steel bolt fastens an aluminum cleat on a boat, and salt spray is a given.",
        },
        {
          at: 1.4,
          label: "Anode",
          caption: "In seawater aluminum sits near −0.75 V and carbon steel near −0.60 V, so aluminum is the anode by 0.15 V.",
        },
        {
          at: 2.7,
          label: "Current",
          caption: "Electrons flow from the aluminum into the bolt: the aluminum dissolves to protect it.",
        },
        {
          at: 3.8,
          label: "Crevice",
          caption:
            "Aluminum is 0.15 V more negative, so it dissolves to protect the bolt — and the crevice under the head, starved of oxygen and full of chloride, is where the pits start.",
        },
      ]}
    >
      {({ t }) => (
        <>
          {drops.map((x, i) => {
            const fall = seg(t, 0.3 + 0.08 * i, 0.9 + 0.08 * i);
            return fall > 0 ? (
              <path
                key={x}
                d={`M${x},${60 + (i % 2) * 12} q-6,10 0,14 q6,-4 0,-14 z`}
                fill={C.muted}
                transform={fall < 1 ? `translate(0,${(-30 * (1 - fall)).toFixed(1)})` : undefined}
                opacity={op(fall)}
              />
            ) : null;
          })}
          <Label x={240} y={20} tone="muted" size={15} opacity={op(seg(t, 0.7, 1.2))}>
            salt spray = electrolyte
          </Label>

          {/* deck */}
          <rect x={40} y={176} width={400} height={30} fill={C.line} stroke={C.muted} strokeWidth={1.5} />
          {/* aluminum cleat */}
          <rect x={110} y={116} width={260} height={60} rx={4} fill={C.soft} stroke={C.ink} strokeWidth={2} />
          {/* bolt shank, head, nut */}
          <rect x={228} y={100} width={24} height={128} fill={C.muted} stroke={C.ink} strokeWidth={2} />
          <rect x={204} y={96} width={72} height={20} rx={3} fill={C.muted} stroke={C.ink} strokeWidth={2} />
          <rect x={210} y={206} width={60} height={20} rx={3} fill={C.muted} stroke={C.ink} strokeWidth={2} />
          {/* pits in the crevice at the head's edges */}
          {[200, 206, 274, 280].map((x, i) => {
            const pit = seg(t, 3.9 + 0.08 * i, 4.3 + 0.08 * i);
            return pit > 0 ? <circle key={x} cx={x} cy={117} r={4 * pit} fill={C.alarm} /> : null;
          })}

          <Label x={150} y={146} size={16} weight={600}>
            Al
          </Label>
          <Label x={330} y={146} size={16} weight={600}>
            Al
          </Label>
          <GrowArrow p={seg(t, 2.8, 3.3)} x1={172} y1={158} x2={222} y2={158} width={2.5} />
          <Label x={196} y={146} tone="accent" size={15} opacity={op(seg(t, 3, 3.5))}>
            e⁻
          </Label>

          <Reveal t={t} at={1.4}>
            <Label x={20} y={98} anchor="start" size={15} weight={600}>
              anode
            </Label>
            <Label x={20} y={118} anchor="start" size={15} tone="muted">
              −0.75 V
            </Label>
            <line x1={78} y1={112} x2={112} y2={130} stroke={C.muted} strokeWidth={1.5} />
          </Reveal>

          <Reveal t={t} at={1.7}>
            <Label x={460} y={228} anchor="end" size={15} weight={600}>
              steel bolt: cathode
            </Label>
            <Label x={460} y={248} anchor="end" size={15} tone="muted">
              −0.60 V
            </Label>
            <line x1={330} y1={226} x2={272} y2={216} stroke={C.muted} strokeWidth={1.5} />
          </Reveal>

          <Reveal t={t} at={4.1}>
            <Label x={460} y={88} anchor="end" size={15} tone="alarm" weight={600}>
              crevice: pits
            </Label>
            <line x1={400} y1={98} x2={286} y2={114} stroke={C.alarm} strokeWidth={1.5} />
          </Reveal>

          <Label x={100} y={250} size={18} serif tone="accent" weight={600} opacity={op(seg(t, 2.1, 2.6))}>
            ΔV = 0.15 V
          </Label>
        </>
      )}
    </AnimatedFigure>
  );
}

/** Embodied energy of the two brackets, at the gate and after a vehicle life. */
function Sustain() {
  const x0 = 150;
  const sx = (v: number) => (v / 400) * 290;
  /** `shown` is how much of the bar is drawn so far (MJ); `lit` fades its value in. */
  const Bar = ({ y, v, fill, text, inside, shown = v, lit = 1 }: { y: number; v: number; fill: string; text: string; inside?: boolean; shown?: number; lit?: number }) => (
    <g>
      {shown > 0 ? <rect x={x0} y={y - 13} width={sx(shown)} height={26} rx={2} fill={fill} /> : null}
      {inside ? (
        <text x={x0 + sx(v) - 10} y={y} textAnchor="end" dominantBaseline="middle" fontSize={15} fontWeight={600} fill={C.surface} opacity={op(lit)}>
          {text}
        </text>
      ) : (
        <Label x={x0 + sx(v) + 8} y={y} anchor="start" size={15} opacity={op(lit)}>
          {text}
        </Label>
      )}
    </g>
  );
  // At the gate the bars fill at one rate, 400 MJ over 0.4–1.5 s; on the road, 200,000 km plays over 3.5–4.7 s.
  const gate = (t: number) => 400 * clamp((t - 0.4) / 1.1);
  const km = (t: number) => 200000 * clamp((t - 3.5) / 1.2);
  return (
    <AnimatedFigure
      height={310}
      duration={5.5}
      alt="Bar chart of embodied energy: at the factory gate a 2 kg primary aluminum bracket is 400 MJ, a 3 kg steel bracket 90 MJ and a recycled aluminum bracket 20 MJ; over 200,000 km in a vehicle the steel bracket's extra kilogram costs about 300 MJ of fuel, bringing it to 390 MJ against aluminum's 400 MJ."
      steps={[
        {
          at: 0,
          label: "Gate",
          caption: "At the factory gate a 2 kg primary aluminum bracket carries 2 × 200 = 400 MJ; a 3 kg steel one, 3 × 30 = 90 MJ.",
        },
        {
          at: 1.9,
          label: "Recycled",
          caption: "Made from recycled aluminum, 2 × 10 = 20 MJ, it beats the steel's 90 MJ before it moves at all.",
        },
        {
          at: 2.9,
          label: "Drive",
          caption: "In a vehicle, steel's extra kilogram costs roughly 1.5 MJ of fuel per 1,000 km: ~300 MJ over 200,000 km.",
        },
        {
          at: 4.8,
          label: "Break-even",
          caption:
            "At the gate, primary aluminum is over four times worse than steel and recycled aluminum beats both. In a vehicle for 200,000 km, the fuel for steel's extra kilogram brings them to about break-even.",
        },
      ]}
      readouts={(t) => [
        { label: "distance", value: `${(Math.round(km(t) / 1000) * 1000).toLocaleString("en-US")} km` },
        { label: "fuel for the extra kg", value: `${Math.round((1.5 * km(t)) / 1000)} MJ`, tone: "ink" },
      ]}
    >
      {({ t }) => {
        const made = gate(t);
        const road = op(seg(t, 2.9, 3.4));
        const fuel = (1.5 * km(t)) / 1000;
        return (
          <>
            <Label x={20} y={22} anchor="start" tone="muted" size={15} weight={600}>
              at the factory gate
            </Label>
            <Label x={x0 - 10} y={52} anchor="end" size={15}>Al, primary 2 kg</Label>
            <Bar y={52} v={400} fill={C.ink} text="400 MJ" inside shown={made} lit={seg(t, 1.4, 1.9)} />
            <Label x={x0 - 10} y={88} anchor="end" size={15}>steel 3 kg</Label>
            <Bar y={88} v={90} fill={C.muted} text="90 MJ" shown={Math.min(made, 90)} lit={seg(t, 0.7, 1.2)} />
            <Label x={x0 - 10} y={124} anchor="end" size={15} tone="accent">Al, recycled</Label>
            <Bar y={124} v={20} fill={C.accent} text="20 MJ" shown={lerp(0, 20, seg(t, 2, 2.3))} lit={seg(t, 2.2, 2.7)} />

            <g opacity={road}>
              <line x1={20} y1={152} x2={460} y2={152} stroke={C.line} strokeWidth={1.5} />
              <Label x={20} y={174} anchor="start" tone="muted" size={15} weight={600}>
                after 200,000 km in a vehicle
              </Label>
              <Label x={x0 - 10} y={206} anchor="end" size={15}>Al, primary</Label>
              <Bar y={206} v={400} fill={C.ink} text="400 MJ" inside />
              <Label x={x0 - 10} y={242} anchor="end" size={15}>steel</Label>
              <rect x={x0} y={229} width={sx(90)} height={26} rx={2} fill={C.muted} />
            </g>
            {fuel > 0 ? <rect x={x0 + sx(90)} y={229} width={sx(fuel)} height={26} rx={2} fill={C.brass} /> : null}
            <text x={x0 + sx(390) - 10} y={242} textAnchor="end" dominantBaseline="middle" fontSize={15} fontWeight={600} fill={C.surface} opacity={op(seg(t, 4.8, 5.3))}>
              90 + ~300 fuel ≈ 390
            </text>
            <line x1={x0} y1={40} x2={x0} y2={134} stroke={C.ink} strokeWidth={1.5} />
            <line x1={x0} y1={194} x2={x0} y2={256} stroke={C.ink} strokeWidth={1.5} opacity={road} />
            <Label x={x0 + sx(390) } y={278} anchor="end" tone="muted" size={15} opacity={op(seg(t, 3.2, 3.7))}>
              extra 1 kg × 1.5 MJ/kg per 1,000 km
            </Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/* ---------- W20: synthesis ---------- */

/** Carburized case: predicted 0.80 mm vs measured 0.55 mm, and the ledger line that explains it. */
function MatMethod() {
  const bx = 200;
  const bw = 260;
  const top = 64;
  const mm = 200; // units per mm
  const meas = top + 0.55 * mm;
  const pred = top + 0.8 * mm;
  // 4 h in the furnace plays over 1.9–3.1 s; the case front advances as √t (2√(Dt)).
  const hours = (t: number) => 4 * clamp((t - 1.9) / 1.2);
  return (
    <AnimatedFigure
      height={290}
      duration={5.5}
      alt="Cross-section of a carburized steel part: the measured case depth of 0.55 mm is shaded, the predicted 0.80 mm is a dashed line below it; beside it an assumption-ledger card shows 'furnace 950 °C' marked assumed and the actual ~890 °C from a thermocouple reading 60 °C high."
      steps={[
        {
          at: 0,
          label: "Predict",
          caption: "Carburizing at 950 °C for 4 h predicts a 0.80 mm diffusion length from 2√(Dt).",
        },
        {
          at: 1.8,
          label: "Measure",
          caption: "The measured depth, on the same basis, is 0.55 mm.",
        },
        {
          at: 3.4,
          label: "Ledger",
          caption: "The arithmetic is not wrong; the ledger is: 'furnace held 950 °C' was marked assumed.",
        },
        {
          at: 4.5,
          label: "Actual",
          caption: "The square root was right; the input was not. The ledger line marked 'assumed' is where the missing 0.25 mm went.",
        },
      ]}
      readouts={(t) => [
        { label: "t", value: `${hours(t).toFixed(1)} h` },
        { label: "case depth", value: `${(0.55 * Math.sqrt(hours(t) / 4)).toFixed(2)} mm`, tone: "accent" },
      ]}
    >
      {({ t }) => {
        const h = hours(t);
        const front = h >= 4 ? meas : top + 0.55 * Math.sqrt(h / 4) * mm;
        return (
          <>
            {/* part */}
            <rect x={bx} y={top} width={bw} height={210} fill={C.surface} stroke={C.ink} strokeWidth={2} />
            {front > top ? <rect x={bx} y={top} width={bw} height={front - top} fill={C.soft} /> : null}
            {front > top ? <line x1={bx} y1={front} x2={bx + bw} y2={front} stroke={C.accent} strokeWidth={3} /> : null}
            <line x1={bx} y1={pred} x2={bx + bw} y2={pred} stroke={C.muted} strokeWidth={2} strokeDasharray="7 5" opacity={op(seg(t, 0.9, 1.4))} />
            <line x1={bx} y1={top} x2={bx + bw} y2={top} stroke={C.ink} strokeWidth={3} />
            {[240, 300, 360, 420].map((x, i) => (
              <GrowArrow key={x} p={seg(t, 0.3 + 0.08 * i, 0.8 + 0.08 * i)} x1={x} y1={22} x2={x} y2={top - 6} tone="muted" width={2} />
            ))}
            <Label x={bx + bw / 2} y={14} tone="muted" size={15} opacity={op(seg(t, 0.4, 0.9))}>
              carbon in, 4 h
            </Label>
            <Label x={bx + bw - 10} y={(top + meas) / 2} anchor="end" tone="accent" size={16} weight={600} opacity={op(seg(t, 3, 3.5))}>
              measured 0.55 mm
            </Label>
            <Label x={bx + bw - 10} y={pred - 16} anchor="end" tone="muted" size={15} opacity={op(seg(t, 1.1, 1.6))}>
              predicted 0.80 mm
            </Label>

            {/* ledger card */}
            <Reveal t={t} at={3.4}>
              <rect x={12} y={64} width={174} height={170} rx={6} fill={C.surface} stroke={C.muted} strokeWidth={1.5} />
              <Label x={24} y={86} anchor="start" size={15} weight={600} tone="muted">
                LEDGER
              </Label>
              <line x1={24} y1={100} x2={174} y2={100} stroke={C.line} strokeWidth={1.5} />
              <Label x={24} y={122} anchor="start" size={15}>
                furnace 950 °C
              </Label>
            </Reveal>
            <Reveal t={t} at={3.8}>
              <rect x={24} y={136} width={76} height={22} rx={11} fill="none" stroke={C.alarm} strokeWidth={1.5} />
              <Label x={62} y={147} size={15} tone="alarm">
                assumed
              </Label>
            </Reveal>
            <Label x={24} y={180} anchor="start" size={15} tone="muted" opacity={op(seg(t, 4.5, 5))}>
              TC reads 60 °C high
            </Label>
            <Label x={24} y={210} anchor="start" size={16} tone="accent" weight={600} opacity={op(seg(t, 4.8, 5.3))}>
              actual ~890 °C
            </Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** Spar deflection bars against the 5 mm limit, with masses: stiffness binds, not strength. */
function SparSynth() {
  const x0 = 150;
  const sx = (d: number) => x0 + (d / 12) * 300;
  const lim = sx(5);
  const rows: Array<{ name: string; mass: string; d: number; fill: string; verdict: string; tone: "alarm" | "muted" | "accent" }> = [
    { name: "balsa", mass: "0.96 g", d: 11.1, fill: C.alarm, verdict: "", tone: "alarm" },
    { name: "7075-T6", mass: "16.9 g", d: 0.46, fill: C.muted, verdict: "passes, heavy", tone: "muted" },
    { name: "carbon", mass: "9.6 g", d: 0.25, fill: C.accent, verdict: "passes, lighter", tone: "accent" },
  ];
  return (
    <AnimatedFigure
      height={290}
      duration={4.8}
      alt="Bar chart of spar tip deflection against a 5 mm limit: balsa 11.1 mm fails, 7075-T6 aluminum 0.46 mm and carbon 0.25 mm pass; masses are balsa 0.96 g, aluminum 16.9 g and carbon 9.6 g, so carbon is the call."
      steps={[
        {
          at: 0,
          label: "Strength",
          caption: "The 2.45 N gust lift gives a root stress of 6.4 MPa: strength margins run 2.7× to 125×, so nothing is near yielding.",
        },
        {
          at: 1.2,
          label: "Stiffness",
          caption: "Against the 5 mm deflection limit, balsa sags 11.1 mm; aluminum at 0.46 mm and carbon at 0.25 mm pass.",
        },
        {
          at: 3.4,
          label: "Mass",
          caption: "Every candidate is far from yielding; the 5 mm deflection limit kills balsa, and mass then picks carbon over aluminum.",
        },
      ]}
    >
      {({ t }) => {
        const drop = seg(t, 1.2, 1.7);
        const sag = lerp(0, 11.1, seg(t, 1.8, 3)); // tip deflection swept so far, mm
        return (
          <>
            <Label x={x0} y={20} anchor="start" tone="muted" size={15}>
              tip deflection at the 2.5 g gust (mm)
            </Label>
            {drop > 0.02 ? <line x1={lim} y1={36} x2={lim} y2={lerp(36, 220, drop)} stroke={C.alarm} strokeWidth={2.5} strokeDasharray="7 5" /> : null}
            <Label x={lim} y={234} tone="alarm" size={15} weight={600} opacity={op(seg(t, 1.4, 1.9))}>
              limit 5 mm
            </Label>
            <line x1={x0} y1={40} x2={x0} y2={210} stroke={C.ink} strokeWidth={1.5} />
            {rows.map((r, i) => {
              const y = 66 + i * 56;
              const p = clamp(sag / r.d);
              return (
                <g key={r.name}>
                  <Label x={x0 - 10} y={y - 9} anchor="end" size={16} weight={600} tone={r.tone === "muted" ? "ink" : r.tone}>
                    {r.name}
                  </Label>
                  <Label x={x0 - 10} y={y + 11} anchor="end" size={15} tone="muted" opacity={op(seg(t, 3.5 + 0.15 * i, 4 + 0.15 * i))}>
                    {r.mass}
                  </Label>
                  {p > 0 ? <rect x={x0} y={y - 13} width={Math.max(sx(r.d) - x0, 3) * p} height={26} rx={2} fill={r.fill} /> : null}
                  {r.d > 5 ? (
                    <text x={sx(r.d) - 10} y={y} textAnchor="end" dominantBaseline="middle" fontSize={15} fontWeight={600} fill={C.surface} opacity={op(seg(t, 2.9, 3.4))}>
                      11.1 mm — too soft
                    </text>
                  ) : (
                    <>
                      <Label x={sx(r.d) + 8} y={y} anchor="start" size={15} opacity={op(seg(t, 2, 2.5))}>
                        {`${r.d} mm`}
                      </Label>
                      <Label x={lim + 12} y={y} anchor="start" size={15} tone={r.tone} weight={r.tone === "accent" ? 600 : undefined} opacity={op(seg(t, 3.6 + 0.2 * i, 4.1 + 0.2 * i))}>
                        {r.verdict}
                      </Label>
                    </>
                  )}
                </g>
              );
            })}
            <Label x={240} y={272} tone="muted" size={15} opacity={op(seg(t, 0.3, 0.8))}>
              root stress 6.4 MPa: strength margins 2.7× to 125×
            </Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** The mastery gate: 12 items in three groups, score ≥ 70% plus repairs on missed chain/failure items. */
function MatMastery() {
  const groups: Array<{ name: string; miss: number; needsFix: boolean }> = [
    { name: "chain", miss: 2, needsFix: true },
    { name: "failure", miss: 1, needsFix: true },
    { name: "mixed", miss: 3, needsFix: false },
  ];
  const t = 30;
  const gap = 6;
  const gw = 4 * t + 3 * gap;
  const gg = 26;
  const x0 = (480 - (3 * gw + 2 * gg)) / 2;
  const ty = 56;
  return (
    <AnimatedFigure
      height={280}
      duration={4.9}
      alt="Twelve question tiles in three groups of four — chain, failure, mixed — with one miss in each group; the chain and failure misses each lead to a filed correction, and the gate reads 9 of 12 = 75%, at least 70%, plus corrections, so it opens."
      steps={[
        {
          at: 0,
          label: "Sit",
          caption: "Twelve questions in one closed-book sitting: four chain, four failure, four mixed.",
        },
        {
          at: 1.9,
          label: "Score",
          caption: "Nine of twelve is 75%, which clears the 70% score gate.",
        },
        {
          at: 2.9,
          label: "Repairs",
          caption: "Every missed chain or failure item needs a filed correction: name the error, re-derive the answer, identify the failed instinct.",
        },
        {
          at: 4.1,
          label: "Gate",
          caption: "Nine of twelve clears the score; the gate also wants a filed correction for every missed chain or failure item.",
        },
      ]}
    >
      {({ t: time }) => (
        <>
          {groups.map((g, gi) => {
            const gx = x0 + gi * (gw + gg);
            return (
              <g key={g.name}>
                <Label x={gx + gw / 2} y={ty - 20} size={15} weight={600} tone={g.needsFix ? "ink" : "muted"}>
                  {g.name}
                </Label>
                {[0, 1, 2, 3].map((k) => {
                  const x = gx + k * (t + gap);
                  const missed = k === g.miss;
                  const graded = 0.3 + 0.1 * (gi * 4 + k); // tiles are marked one by one
                  return (
                    <g key={k} opacity={op(seg(time, graded, graded + 0.4))}>
                      <rect x={x} y={ty} width={t} height={t} rx={4} fill={missed ? C.surface : C.soft} stroke={missed ? C.alarm : C.accent} strokeWidth={2} />
                      <Label x={x + t / 2} y={ty + t / 2 + 1} size={16} tone={missed ? "alarm" : "accent"} weight={700}>
                        {missed ? "✗" : "✓"}
                      </Label>
                      {missed && g.needsFix && (
                        <g>
                          <GrowArrow p={seg(time, 3, 3.4)} x1={x + t / 2} y1={ty + t + 4} x2={x + t / 2} y2={ty + t + 30} tone="accent" width={2} />
                          <Reveal t={time} at={3.3}>
                            <path
                              d={`M${x - 4},${ty + t + 36} h30 l8,8 v34 h-38 z`}
                              fill={C.surface}
                              stroke={C.accent}
                              strokeWidth={2}
                            />
                            {[48, 56, 64].map((dy) => (
                              <line key={dy} x1={x + 2} y1={ty + t + dy} x2={x + 26} y2={ty + t + dy} stroke={C.accent} strokeWidth={1.5} />
                            ))}
                          </Reveal>
                        </g>
                      )}
                      {missed && !g.needsFix && (
                        <Label x={x + t} y={ty + t + 22} anchor="end" size={15} tone="muted" opacity={op(seg(time, 3.2, 3.7))}>
                          no repair needed
                        </Label>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}
          <Label x={x0 + gw / 2 + (gw + gg) / 2} y={ty + t + 96} size={15} tone="accent" opacity={op(seg(time, 3.6, 4.1))}>
            corrections filed
          </Label>
          <line x1={20} y1={196} x2={460} y2={196} stroke={C.line} strokeWidth={1.5} />
          <Label x={240} y={222} size={18} serif weight={600} opacity={op(seg(time, 1.9, 2.4))}>
            9 / 12 = 75% ≥ 70%
          </Label>
          <Label x={240} y={254} size={16} tone="accent" weight={600} opacity={op(seg(time, 4.2, 4.7))}>
            + repairs filed → gate opens
          </Label>
        </>
      )}
    </AnimatedFigure>
  );
}

export const materialsBFigures: FigureMap = {
  "materials/fracture": Fracture,
  "materials/fatigue": Fatigue,
  "materials/creep": Creep,
  "materials/phasediagram": PhaseDiagram,
  "materials/leverrule": LeverRule,
  "materials/transformations": Transformations,
  "materials/famlook": FamLook,
  "materials/dirtemp": DirTemp,
  "materials/choosefam": ChooseFam,
  "materials/screenrank": ScreenRank,
  "materials/corrosion": Corrosion,
  "materials/sustain": Sustain,
  "materials/matmethod": MatMethod,
  "materials/sparsynth": SparSynth,
  "materials/matmastery": MatMastery,
};
