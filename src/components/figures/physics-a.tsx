import { Arrow, Axes, C, DimH, DimV, Figure, Ground, Label, plotBox, type FigureMap } from "./kit";

/* ---------- local helpers ---------- */

/** Arc of radius r about (cx,cy) from angle a0 to a1, degrees, math convention (CCW positive, y up). */
function arc(cx: number, cy: number, r: number, a0: number, a1: number) {
  const p = (a: number) => [cx + r * Math.cos((a * Math.PI) / 180), cy - r * Math.sin((a * Math.PI) / 180)];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  const sweep = a1 > a0 ? 0 : 1;
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  return `M${x0.toFixed(1)},${y0.toFixed(1)} A${r},${r} 0 ${large} ${sweep} ${x1.toFixed(1)},${y1.toFixed(1)}`;
}

function ArcMark({ cx, cy, r, a0, a1 }: { cx: number; cy: number; r: number; a0: number; a1: number }) {
  return <path d={arc(cx, cy, r, a0, a1)} fill="none" stroke={C.muted} strokeWidth={1.5} />;
}

/** Small cart: body on two wheels, resting on a track at y. */
function Cart({ x, y, w, label, dashed = false }: { x: number; y: number; w: number; label: string; dashed?: boolean }) {
  return (
    <g>
      <rect
        x={x}
        y={y - 36}
        width={w}
        height={26}
        rx={3}
        fill={dashed ? "none" : C.soft}
        stroke={C.ink}
        strokeWidth={2}
        strokeDasharray={dashed ? "5 4" : undefined}
      />
      <circle cx={x + 10} cy={y - 5} r={5} fill={C.surface} stroke={C.ink} strokeWidth={1.5} />
      <circle cx={x + w - 10} cy={y - 5} r={5} fill={C.surface} stroke={C.ink} strokeWidth={1.5} />
      <Label x={x + w / 2} y={y - 23} size={15}>
        {label}
      </Label>
    </g>
  );
}

/* ---------- Week 1 ---------- */

/** measure: pendulum and the three candidate period formulas, checked by dimensions. */
function Measure() {
  const rows: Array<[string, string, string, boolean]> = [
    ["T = 2π√(l/g)", "T", "time ✓", true],
    ["T = 2π√(g/l)", "T⁻¹", "1/time ✗", false],
    ["T = 2π·l/g", "T²", "time² ✗", false],
  ];
  const bob = { x: 70 + 130 * Math.sin(Math.PI / 12), y: 44 + 130 * Math.cos(Math.PI / 12) };
  return (
    <Figure
      height={230}
      alt="A pendulum of length l under gravity g beside three candidate period formulas; only T = 2π√(l/g) comes out with the dimension of time."
      caption="Swap in [l] = L and [g] = LT⁻²: only one candidate returns a time, and no experiment was needed to reject the other two."
    >
      <Ground x={30} y={44} w={80} side="above" />
      <line x1={70} y1={44} x2={70} y2={190} stroke={C.muted} strokeWidth={1.5} strokeDasharray="5 4" />
      <line x1={70} y1={44} x2={bob.x} y2={bob.y} stroke={C.ink} strokeWidth={2} />
      <circle cx={bob.x} cy={bob.y} r={12} fill={C.soft} stroke={C.ink} strokeWidth={2} />
      <Label x={96} y={100} serif size={18}>
        l
      </Label>
      <Arrow x1={36} y1={150} x2={36} y2={206} tone="ink" width={2} />
      <Label x={22} y={178} serif size={18}>
        g
      </Label>

      <Label x={175} y={30} anchor="start" tone="muted" size={15}>
        [l] = L,  [g] = LT⁻²
      </Label>
      {rows.map(([f, d, v, ok], i) => {
        const y = 80 + i * 52;
        return (
          <g key={f}>
            <Label x={175} y={y} anchor="start" serif size={18} tone={ok ? "accent" : "ink"} weight={ok ? 600 : undefined}>
              {f}
            </Label>
            <Label x={345} y={y} size={18} serif tone={ok ? "accent" : "alarm"}>
              {d}
            </Label>
            <Label x={470} y={y} anchor="end" size={16} tone={ok ? "accent" : "alarm"}>
              {v}
            </Label>
          </g>
        );
      })}
    </Figure>
  );
}

/** sigfigs: the density's uncertainty band, and the quadrature triangle that sets it. */
function SigFigs() {
  const nx = (v: number) => 60 + (v - 2.6) * 1800;
  // quadrature triangle, 60 px per percent, right angle at bottom right
  const A = { x: 200, y: 250 };
  const B = { x: A.x - 1.6 * 60, y: A.y };
  const Cc = { x: A.x, y: A.y - 1.7 * 60 };
  return (
    <Figure
      height={280}
      alt="A number line from 2.60 to 2.80 kg/L with the band 2.71 ± 0.06 shaded, above a right triangle whose legs are 1.6% and 1.7% and whose hypotenuse is 2.3%."
      caption="Relative uncertainties add like perpendicular sides: 1.6% and 1.7% make 2.3%, which puts the honest last digit of 2.712 in the second decimal place."
    >
      <Label x={nx(2.71)} y={28} tone="accent" weight={600} size={18}>
        ρ = 2.71 ± 0.06 kg/L
      </Label>
      <rect x={nx(2.65)} y={74} width={nx(2.77) - nx(2.65)} height={30} fill={C.soft} stroke={C.accent} strokeWidth={1.5} />
      <line x1={50} y1={89} x2={430} y2={89} stroke={C.ink} strokeWidth={2} />
      {[2.6, 2.65, 2.7, 2.75, 2.8].map((v) => (
        <g key={v}>
          <line x1={nx(v)} y1={82} x2={nx(v)} y2={96} stroke={C.ink} strokeWidth={1.5} />
          <Label x={nx(v)} y={120} tone="muted" size={15}>
            {v.toFixed(2)}
          </Label>
        </g>
      ))}
      <circle cx={nx(2.712)} cy={89} r={6} fill={C.accent} />

      <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${Cc.x},${Cc.y}`} fill={C.soft} stroke="none" />
      <line x1={B.x} y1={B.y} x2={A.x} y2={A.y} stroke={C.ink} strokeWidth={2} />
      <line x1={A.x} y1={A.y} x2={Cc.x} y2={Cc.y} stroke={C.ink} strokeWidth={2} />
      <line x1={B.x} y1={B.y} x2={Cc.x} y2={Cc.y} stroke={C.accent} strokeWidth={3} />
      <rect x={A.x - 10} y={A.y - 10} width={10} height={10} fill="none" stroke={C.muted} strokeWidth={1.2} />
      <Label x={(A.x + B.x) / 2} y={266} size={15}>
        mass 1.6%
      </Label>
      <Label x={A.x + 8} y={(A.y + Cc.y) / 2} anchor="start" size={15}>
        vol. 1.7%
      </Label>
      <Label x={(B.x + Cc.x) / 2 - 10} y={(B.y + Cc.y) / 2 - 12} anchor="end" tone="accent" weight={600}>
        2.3%
      </Label>

      <Label x={470} y={175} anchor="end" size={15} tone="muted">
        √(1.6² + 1.7²) = 2.3%
      </Label>
      <Label x={470} y={230} anchor="end" size={15} tone="muted">
        2.712 × 0.023 = 0.063
      </Label>
    </Figure>
  );
}

/** fermi: the piano-tuner chain walked down a log axis, landing inside the ±1 order band. */
function Fermi() {
  const b = plotBox({ x: 80, y: 30, w: 380, h: 200, xMin: -0.3, xMax: 3.4, yMin: 1, yMax: 7 });
  const pts: Array<[number, number]> = [
    [0, Math.log10(3e6)],
    [1, Math.log10(1.2e6)],
    [2, Math.log10(6e4)],
    [3, Math.log10(120)],
  ];
  const sup = ["¹", "²", "³", "⁴", "⁵", "⁶", "⁷"];
  return (
    <Figure
      height={272}
      alt="Four points on a powers-of-ten axis: 3 million people, 1.2 million households, 60,000 pianos, and 120 tuners, with the last point inside a band from 10 to 1,000 around the roughly 100 listed tuners."
      caption="Each factor is a short, boundable hop in log space; the chain lands at 120, inside an order of magnitude of the ~100 in directories."
    >
      <line x1={b.x} y1={b.py(1)} x2={b.x} y2={b.py(7)} stroke={C.ink} strokeWidth={1.5} />
      {sup.map((s, i) => (
        <g key={s}>
          <line x1={b.x} y1={b.py(i + 1)} x2={b.x + b.w} y2={b.py(i + 1)} stroke={C.line} strokeWidth={1} />
          <Label x={b.x - 8} y={b.py(i + 1)} anchor="end" tone="muted" size={15}>
            10{s}
          </Label>
        </g>
      ))}
      <rect x={b.px(2.72)} y={b.py(3)} width={b.px(3.28) - b.px(2.72)} height={b.py(1) - b.py(3)} fill={C.soft} stroke={C.accent} strokeWidth={1} strokeDasharray="4 3" />
      <line x1={b.px(2.72)} y1={b.py(2)} x2={b.px(3.28)} y2={b.py(2)} stroke={C.muted} strokeWidth={2} />
      <Label x={b.px(3)} y={250} tone="muted" size={15}>
        ~100 listed
      </Label>
      <path d={b.path(pts)} fill="none" stroke={C.accent} strokeWidth={2.5} />
      {pts.map(([x, y]) => (
        <circle key={x} cx={b.px(x)} cy={b.py(y)} r={6} fill={C.accent} />
      ))}
      <Label x={b.px(0) + 10} y={b.py(pts[0][1]) - 16} anchor="start" size={15}>
        3M people
      </Label>
      <Label x={b.px(1) - 6} y={b.py(pts[1][1]) + 22} anchor="end" size={15}>
        1.2M homes
      </Label>
      <Label x={b.px(2) + 10} y={b.py(pts[2][1]) - 16} anchor="start" size={15}>
        60,000 pianos
      </Label>
      <Label x={b.px(3) - 40} y={b.py(pts[3][1]) + 16} anchor="end" size={15} tone="accent" weight={600}>
        120 tuners
      </Label>
      <Label x={(b.px(1) + b.px(2)) / 2 + 6} y={(b.py(pts[1][1]) + b.py(pts[2][1])) / 2 - 14} anchor="start" tone="muted" size={15}>
        1 in 20
      </Label>
      <Label x={(b.px(2) + b.px(3)) / 2 + 10} y={(b.py(pts[2][1]) + b.py(pts[3][1])) / 2 - 8} anchor="start" tone="muted" size={15}>
        ÷ 500/yr
      </Label>
    </Figure>
  );
}

/* ---------- Week 2 ---------- */

/** veccomp: two tug forces added tip to tail; the resultant is shorter than 8.0 kN. */
function VecComp() {
  const s = 50; // px per kN
  const O = { x: 40, y: 175 };
  const rad = (d: number) => (d * Math.PI) / 180;
  const T1 = { x: O.x + s * 5 * Math.cos(rad(30)), y: O.y - s * 5 * Math.sin(rad(30)) };
  const T2 = { x: T1.x + s * 3 * Math.cos(rad(-20)), y: T1.y - s * 3 * Math.sin(rad(-20)) };
  return (
    <Figure
      height={250}
      alt="Force F1 of 5.0 kN at 30 degrees above the dock axis, with F2 of 3.0 kN at 20 degrees below drawn from its tip; the resultant R of 7.30 kN at 11.6 degrees runs from the start to the end."
      caption="Tip to tail, the vertical parts partly cancel: the barge feels 7.30 kN, not the 8.0 kN the magnitudes add to."
    >
      <line x1={20} y1={O.y} x2={465} y2={O.y} stroke={C.muted} strokeWidth={1.5} strokeDasharray="6 5" />
      <Label x={465} y={O.y + 18} anchor="end" tone="muted" size={15}>
        dock axis
      </Label>
      <line x1={T1.x} y1={T1.y} x2={T1.x + 70} y2={T1.y} stroke={C.muted} strokeWidth={1.2} strokeDasharray="4 4" />
      <line x1={T2.x} y1={T2.y} x2={T2.x} y2={O.y} stroke={C.muted} strokeWidth={1.2} strokeDasharray="4 4" />
      <Label x={T2.x + 8} y={(T2.y + O.y) / 2} anchor="start" tone="muted" size={15}>
        1.47
      </Label>

      <Arrow x1={O.x} y1={O.y} x2={T1.x} y2={T1.y} tone="ink" />
      <Arrow x1={T1.x} y1={T1.y} x2={T2.x} y2={T2.y} tone="ink" />
      <Arrow x1={O.x} y1={O.y} x2={T2.x} y2={T2.y} tone="accent" width={3.5} />

      <ArcMark cx={O.x} cy={O.y} r={62} a0={11.6} a1={30} />
      <ArcMark cx={T1.x} cy={T1.y} r={50} a0={-20} a1={0} />
      <Label x={O.x + 74} y={O.y - 34} anchor="start" size={15}>
        30°
      </Label>
      <Label x={T1.x + 56} y={T1.y + 13} anchor="start" size={15}>
        20°
      </Label>

      <Label x={(O.x + T1.x) / 2 - 12} y={(O.y + T1.y) / 2 - 16} anchor="end">
        F₁ 5.0 kN
      </Label>
      <Label x={(T1.x + T2.x) / 2 + 18} y={(T1.y + T2.y) / 2 - 22} anchor="start">
        F₂ 3.0 kN
      </Label>
      <Label x={(O.x + T2.x) / 2 + 20} y={(O.y + T2.y) / 2 + 22} tone="accent" weight={600}>
        R 7.30 kN
      </Label>
      <Label x={240} y={214} tone="muted" size={15}>
        R = (7.15, 1.47) kN, at 11.6°
      </Label>
      <Label x={240} y={236} tone="muted" size={15}>
        |F₁| + |F₂| = 8.0 kN
      </Label>
    </Figure>
  );
}

/** kingraphs: the derived v–t line; its slope is 4 m/s², its area from 1 to 3 s is 16 m. */
function KinGraphs() {
  const b = plotBox({ x: 70, y: 36, w: 370, h: 190, xMin: 0, xMax: 3.3, yMin: 0, yMax: 14 });
  return (
    <Figure
      height={276}
      alt="A velocity-time graph rising in a straight line through 4, 8 and 12 m/s at 1, 2 and 3 s, with the trapezoid under it from 1 to 3 s shaded and labelled 16 m."
      caption="The slope of v–t is the acceleration; the shaded area is the displacement, and it must return the logged 18 − 2 = 16 m."
    >
      <path d={`${b.path([[1, 0], [1, 4], [3, 12], [3, 0]])} Z`} fill={C.soft} stroke="none" />
      <Axes box={b} xLabel="t (s)" yLabel="v (m/s)" />
      <path d={b.path([[0, 0], [3, 12]])} stroke={C.accent} strokeWidth={3} fill="none" />
      {[1, 2, 3].map((t) => (
        <g key={t}>
          <line x1={b.px(t)} y1={b.py(0)} x2={b.px(t)} y2={b.py(0) + 6} stroke={C.ink} strokeWidth={1.5} />
          <Label x={b.px(t)} y={b.py(0) + 18} tone="muted" size={15}>
            {t}
          </Label>
          <line x1={b.x - 6} y1={b.py(4 * t)} x2={b.x} y2={b.py(4 * t)} stroke={C.ink} strokeWidth={1.5} />
          <Label x={b.x - 10} y={b.py(4 * t)} anchor="end" tone="muted" size={15}>
            {4 * t}
          </Label>
          <line x1={b.x} y1={b.py(4 * t)} x2={b.px(t)} y2={b.py(4 * t)} stroke={C.line} strokeWidth={1} strokeDasharray="4 4" />
          <circle cx={b.px(t)} cy={b.py(4 * t)} r={6} fill={t === 3 ? C.surface : C.accent} stroke={C.accent} strokeWidth={2} />
        </g>
      ))}
      <Label x={b.px(1.2)} y={b.py(9.6)} anchor="end" tone="accent" weight={600}>
        slope 4 m/s²
      </Label>
      <Label x={b.px(2.25)} y={b.py(4)} weight={600}>
        area = 16 m
      </Label>
      <Label x={b.px(2.25)} y={b.py(4) + 22} tone="muted" size={15}>
        = x(3) − x(1)
      </Label>
    </Figure>
  );
}

/** projectiles: the 20 m/s, 30° trajectory to true scale, with its range and peak. */
function Projectiles() {
  const g = 9.81;
  const vx = 20 * Math.cos(Math.PI / 6);
  const vy = 20 * Math.sin(Math.PI / 6);
  const T = (2 * vy) / g;
  const s = 11.5; // px per m
  const X0 = 30;
  const Y0 = 180;
  const P = (t: number) => [X0 + vx * t * s, Y0 - (vy * t - 0.5 * g * t * t) * s];
  const pts = Array.from({ length: 61 }, (_, i) => P((T * i) / 60));
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const dots = Array.from({ length: 9 }, (_, i) => P((T * (i + 1)) / 10));
  const apex = P(T / 2);
  const land = P(T);
  return (
    <Figure
      height={240}
      alt="A true-scale trajectory launched at 20 m/s and 30 degrees, peaking at 5.10 m at 1.02 s and landing 35.3 m away at 2.04 s, with evenly spaced time dots."
      caption="Dots at equal time steps are evenly spaced across: x runs at a steady 17.3 m/s, because gravity only works on y."
    >
      <Ground x={16} y={Y0} w={452} />
      <path d={d} fill="none" stroke={C.accent} strokeWidth={3} />
      {dots.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3.5} fill={C.muted} />
      ))}
      <Arrow x1={X0} y1={Y0} x2={X0 + 100 * Math.cos(Math.PI / 6)} y2={Y0 - 100 * Math.sin(Math.PI / 6)} tone="ink" width={2.5} />
      <ArcMark cx={X0} cy={Y0} r={42} a0={0} a1={30} />
      <Label x={X0 + 50} y={Y0 - 12} anchor="start" size={15}>
        30°
      </Label>
      <Label x={X0 + 70} y={Y0 - 74} anchor="start">
        v₀ = 20 m/s
      </Label>
      <line x1={apex[0]} y1={apex[1]} x2={apex[0]} y2={Y0} stroke={C.muted} strokeWidth={1} strokeDasharray="4 4" />
      <DimV x={apex[0] + 16} y1={apex[1]} y2={Y0} label="5.10 m" />
      <Label x={apex[0]} y={apex[1] - 18} tone="muted" size={15}>
        t = 1.02 s
      </Label>
      <Label x={470} y={Y0 - 58} anchor="end" tone="muted" size={15}>
        t = 2.04 s
      </Label>
      <DimH x1={X0} x2={land[0]} y={220} label="range 35.3 m" tone="accent" />
    </Figure>
  );
}

/* ---------- Week 3 ---------- */

/** newton: car free-body along the road — engine 4400 N forward, drag 800 N back, net 3600 N. */
function Newton() {
  const k = 0.03; // px per N
  return (
    <Figure
      height={220}
      alt="A 1200 kg car with a 4400 N forward force and an 800 N drag force, and above it the 3600 N net force giving 3.0 m/s squared."
      caption="The engine must beat drag before anything is left for acceleration: 4400 − 800 = 3600 N, and 3600 N on 1200 kg is 3.0 m/s²."
    >
      <Ground x={16} y={180} w={452} />
      <rect x={150} y={120} width={160} height={40} rx={6} fill={C.soft} stroke={C.ink} strokeWidth={2} />
      <path d="M185,120 L200,94 L262,94 L280,120" fill={C.soft} stroke={C.ink} strokeWidth={2} />
      <circle cx={185} cy={166} r={14} fill={C.surface} stroke={C.ink} strokeWidth={2} />
      <circle cx={275} cy={166} r={14} fill={C.surface} stroke={C.ink} strokeWidth={2} />
      <Label x={230} y={141} size={15}>
        1200 kg
      </Label>

      <Arrow x1={312} y1={138} x2={312 + 4400 * k} y2={138} tone="ink" />
      <Label x={312 + 2200 * k} y={120} size={15}>
        engine 4400 N
      </Label>
      <Arrow x1={148} y1={138} x2={148 - 800 * k} y2={138} tone="alarm" />
      <Label x={118} y={138} anchor="end" size={15} tone="alarm">
        drag 800 N
      </Label>

      <Arrow x1={176} y1={50} x2={176 + 3600 * k} y2={50} tone="accent" width={4} />
      <Label x={176 + 1800 * k} y={30} tone="accent" weight={600}>
        ΣF = 3600 N
      </Label>
      <Label x={176 + 3600 * k + 14} y={50} anchor="start" tone="accent">
        a = 3.0 m/s²
      </Label>
    </Figure>
  );
}

/** contact: block on a 30° incline — weight, normal, and the friction that loses to the downslope pull. */
function Contact() {
  const d = { x: Math.cos(Math.PI / 6), y: Math.sin(Math.PI / 6) }; // down-slope, screen coords
  const n = { x: Math.sin(Math.PI / 6), y: -Math.cos(Math.PI / 6) }; // outward normal
  const top = { x: 50, y: 70 };
  const L = 360;
  const bot = { x: top.x + L * d.x, y: top.y + L * d.y };
  const P = { x: top.x + 170 * d.x, y: top.y + 170 * d.y };
  const hh = 18;
  const hw = 30;
  const Cb = { x: P.x + hh * n.x, y: P.y + hh * n.y };
  const k = 1.8; // px per N
  const rear = { x: P.x - hw * d.x, y: P.y - hw * d.y };
  const front = { x: P.x + hw * d.x, y: P.y + hw * d.y };
  return (
    <Figure
      height={276}
      alt="A 5.0 kg block on a 30 degree incline with weight 49.1 N down, normal 42.5 N perpendicular to the slope, a 24.5 N downslope pull, and 12.7 N kinetic friction up the slope."
      caption="The downslope pull (24.5 N) beats the static limit μs·N (17.0 N), so the block slides and kinetic friction takes only 12.7 N back."
    >
      <polygon points={`${top.x},${top.y} ${top.x},${bot.y} ${bot.x},${bot.y}`} fill={C.line} fillOpacity={0.35} stroke={C.ink} strokeWidth={2} />
      <Ground x={16} y={bot.y} w={452} />
      <ArcMark cx={bot.x} cy={bot.y} r={56} a0={150} a1={180} />
      <Label x={bot.x - 76} y={bot.y - 14} size={15}>
        30°
      </Label>

      <g transform={`translate(${Cb.x.toFixed(1)},${Cb.y.toFixed(1)}) rotate(30)`}>
        <rect x={-hw} y={-hh} width={hw * 2} height={hh * 2} rx={2} fill={C.soft} stroke={C.ink} strokeWidth={2} />
      </g>

      <Arrow x1={Cb.x} y1={Cb.y} x2={Cb.x} y2={Cb.y + 49.1 * k} tone="ink" />
      <Label x={Cb.x - 8} y={Cb.y + 49.1 * k - 4} anchor="end" size={15}>
        mg 49.1 N
      </Label>
      <Arrow x1={Cb.x} y1={Cb.y} x2={Cb.x + 42.5 * k * n.x} y2={Cb.y + 42.5 * k * n.y} tone="ink" />
      <Label x={Cb.x + 42.5 * k * n.x + 8} y={Cb.y + 42.5 * k * n.y - 8} anchor="start" size={15}>
        N 42.5 N
      </Label>
      <Arrow x1={front.x} y1={front.y} x2={front.x + 24.5 * k * d.x} y2={front.y + 24.5 * k * d.y} tone="muted" dashed />
      <Label x={front.x + 24.5 * k * d.x + 6} y={front.y + 24.5 * k * d.y - 14} anchor="start" size={15} tone="muted">
        24.5 N
      </Label>
      <Arrow x1={rear.x} y1={rear.y} x2={rear.x - 12.7 * k * d.x} y2={rear.y - 12.7 * k * d.y} tone="alarm" />
      <Label x={rear.x - 12.7 * k * d.x - 2} y={rear.y - 12.7 * k * d.y + 30} anchor="end" size={15} tone="alarm">
        fk 12.7 N
      </Label>

      <Label x={470} y={112} anchor="end" size={15}>
        pull 24.5 N
      </Label>
      <Label x={470} y={134} anchor="end" size={15}>
        &gt; μs·N 17.0 N
      </Label>
      <Label x={470} y={162} anchor="end" tone="accent" weight={600}>
        slides: a = 2.36 m/s²
      </Label>
    </Figure>
  );
}

/** fbd: Atwood machine, each mass with only its own two forces. */
function Fbd() {
  const k = 1.5; // px per N
  const m1 = { x: 160, y: 140, w: 60, h: 44 };
  const m2 = { x: 258, y: 170, w: 64, h: 56 };
  const cx1 = m1.x + m1.w / 2;
  const cx2 = m2.x + m2.w / 2;
  return (
    <Figure
      height={310}
      alt="Two masses of 3.0 kg and 5.0 kg hang from an ideal pulley; each carries tension 36.8 N up and its own weight down, 29.4 N and 49.1 N, and they accelerate at 2.45 m/s squared."
      caption="Each block gets exactly two arrows, T up and its own weight down; the same T on both is why the tension lands between the two weights."
    >
      <Ground x={200} y={14} w={80} side="above" />
      <line x1={240} y1={14} x2={240} y2={60} stroke={C.ink} strokeWidth={2} />
      <circle cx={240} cy={60} r={50} fill="none" stroke={C.ink} strokeWidth={2} />
      <circle cx={240} cy={60} r={5} fill={C.ink} />
      <line x1={cx1} y1={60} x2={cx1} y2={m1.y} stroke={C.muted} strokeWidth={1.5} />
      <line x1={cx2} y1={60} x2={cx2} y2={m2.y} stroke={C.muted} strokeWidth={1.5} />

      <rect {...{ x: m1.x, y: m1.y, width: m1.w, height: m1.h }} rx={3} fill={C.soft} stroke={C.ink} strokeWidth={2} />
      <Label x={cx1} y={m1.y + m1.h / 2} size={15}>
        3.0 kg
      </Label>
      <rect {...{ x: m2.x, y: m2.y, width: m2.w, height: m2.h }} rx={3} fill={C.soft} stroke={C.ink} strokeWidth={2} />
      <Label x={cx2} y={m2.y + m2.h / 2} size={15}>
        5.0 kg
      </Label>

      <Arrow x1={cx1} y1={m1.y} x2={cx1} y2={m1.y - 36.8 * k} tone="accent" />
      <Label x={cx1 - 10} y={m1.y - 30} anchor="end" size={15} tone="accent">
        T 36.8 N
      </Label>
      <Arrow x1={cx1} y1={m1.y + m1.h} x2={cx1} y2={m1.y + m1.h + 29.4 * k} tone="ink" />
      <Label x={cx1 - 10} y={m1.y + m1.h + 26} anchor="end" size={15}>
        m₁g 29.4 N
      </Label>

      <Arrow x1={cx2} y1={m2.y} x2={cx2} y2={m2.y - 36.8 * k} tone="accent" />
      <Label x={cx2 + 10} y={m2.y - 30} anchor="start" size={15} tone="accent">
        T 36.8 N
      </Label>
      <Arrow x1={cx2} y1={m2.y + m2.h} x2={cx2} y2={m2.y + m2.h + 49.1 * k} tone="ink" />
      <Label x={cx2 + 10} y={m2.y + m2.h + 40} anchor="start" size={15}>
        m₂g 49.1 N
      </Label>

      <Arrow x1={130} y1={m1.y + 36} x2={130} y2={m1.y - 4} tone="muted" width={2} />
      <Label x={120} y={m1.y + 16} anchor="end" tone="muted" size={15}>
        a
      </Label>
      <Arrow x1={352} y1={m2.y + 4} x2={352} y2={m2.y + 44} tone="muted" width={2} />
      <Label x={362} y={m2.y + 24} anchor="start" tone="muted" size={15}>
        a
      </Label>
      <Label x={470} y={40} anchor="end" tone="muted" size={15}>
        a = 2.45 m/s²
      </Label>
    </Figure>
  );
}

/* ---------- Week 4 ---------- */

/** work: crate pushed 5 m, and the signed work ledger that gives its speed. */
function Work() {
  const s = 0.5; // px per J
  const x0 = 130;
  const rows: Array<{ y: number; from: number; to: number; tone: "accent" | "alarm" | "ink"; name: string; val: string }> = [
    { y: 176, from: 0, to: 450, tone: "accent", name: "push", val: "+450 J" },
    { y: 206, from: 450, to: 300, tone: "alarm", name: "friction", val: "−150 J" },
    { y: 236, from: 0, to: 300, tone: "ink", name: "net", val: "300 J → v = 7.75 m/s" },
  ];
  return (
    <Figure
      height={256}
      alt="A 10 kg crate pushed 5 m by 90 N against 30 N friction, above a ledger of +450 J from the push, −150 J from friction, and 300 J net giving 7.75 m/s."
      caption="Work is signed: the push adds 450 J, friction takes 150 J back, and the 300 J left over is the crate's kinetic energy."
    >
      <Ground x={16} y={126} w={452} />
      <rect x={40} y={66} width={60} height={60} rx={2} fill="none" stroke={C.muted} strokeWidth={1.5} strokeDasharray="5 4" />
      <rect x={300} y={66} width={60} height={60} rx={2} fill={C.soft} stroke={C.ink} strokeWidth={2} />
      <Label x={330} y={96} size={15}>
        10 kg
      </Label>
      <DimH x1={70} x2={330} y={40} label="5 m" />
      <Arrow x1={208} y1={88} x2={298} y2={88} tone="accent" />
      <Label x={253} y={72} size={15} tone="accent">
        90 N
      </Label>
      <Arrow x1={298} y1={116} x2={268} y2={116} tone="alarm" />
      <Label x={262} y={112} anchor="end" size={15} tone="alarm">
        30 N
      </Label>

      {rows.map((r) => {
        const a = x0 + Math.min(r.from, r.to) * s;
        const w = Math.abs(r.to - r.from) * s;
        return (
          <g key={r.name}>
            <Label x={x0 - 10} y={r.y} anchor="end" size={15} tone="muted">
              {r.name}
            </Label>
            <rect x={a} y={r.y - 9} width={w} height={18} fill={r.tone === "ink" ? C.soft : C[r.tone]} fillOpacity={r.tone === "ink" ? 1 : 0.8} stroke={C[r.tone]} strokeWidth={1.5} />
            <Label x={x0 + Math.max(r.from, r.to) * s + 8} y={r.y} anchor="start" size={15} tone={r.tone === "ink" ? "accent" : r.tone} weight={r.tone === "ink" ? 600 : undefined}>
              {r.val}
            </Label>
          </g>
        );
      })}
      <line x1={x0} y1={160} x2={x0} y2={248} stroke={C.ink} strokeWidth={1.5} />
    </Figure>
  );
}

/** potential: coaster crest 20 m above the dip; all U at the top becomes K at the bottom. */
function Potential() {
  const crest = { x: 110, y: 60 };
  const dip = { x: 290, y: 220 };
  return (
    <Figure
      height={262}
      alt="A roller-coaster track dropping 20 m from a crest to a dip, with the car at rest on the crest and moving at 19.81 m/s at the bottom."
      caption="Height in, speed out: mgh at the crest becomes ½mv² at the dip, the mass cancels, and v = √(2gh) ≈ 20 m/s."
    >
      <line x1={20} y1={dip.y} x2={465} y2={dip.y} stroke={C.muted} strokeWidth={1.2} strokeDasharray="6 5" />
      <path
        d={`M20,90 C60,70 80,${crest.y} ${crest.x},${crest.y} C180,${crest.y} 210,${dip.y} ${dip.x},${dip.y} C360,${dip.y} 410,190 465,140`}
        fill="none"
        stroke={C.ink}
        strokeWidth={3}
      />
      <rect x={crest.x - 18} y={crest.y - 20} width={36} height={16} rx={3} fill={C.soft} stroke={C.ink} strokeWidth={2} />
      <circle cx={crest.x - 10} cy={crest.y - 3} r={3.5} fill={C.ink} />
      <circle cx={crest.x + 10} cy={crest.y - 3} r={3.5} fill={C.ink} />
      <Label x={crest.x + 26} y={crest.y - 28} anchor="start" size={15}>
        K = 0, U = mgh
      </Label>

      <rect x={dip.x - 18} y={dip.y - 20} width={36} height={16} rx={3} fill={C.soft} stroke={C.ink} strokeWidth={2} />
      <circle cx={dip.x - 10} cy={dip.y - 3} r={3.5} fill={C.ink} />
      <circle cx={dip.x + 10} cy={dip.y - 3} r={3.5} fill={C.ink} />
      <Arrow x1={dip.x + 24} y1={dip.y - 30} x2={dip.x + 110} y2={dip.y - 30} tone="accent" />
      <Label x={dip.x + 67} y={dip.y - 50} tone="accent" weight={600}>
        19.81 m/s
      </Label>
      <Label x={dip.x} y={dip.y + 22} size={15}>
        U = 0, K = ½mv²
      </Label>

      <DimV x={40} y1={crest.y} y2={dip.y} label="h = 20 m" />
    </Figure>
  );
}

/** power: hoist energy budget — 800 W in splits into 490.5 W of lift and 309.5 W of losses. */
function Power() {
  const k = 0.1; // px per W
  const top = 64;
  const inH = 800 * k;
  const useH = 490.5 * k;
  const lossH = 309.5 * k;
  const split = 210;
  const lossMid = top + useH + lossH / 2;
  const lx = split + 70;
  return (
    <Figure
      height={250}
      alt="An energy-flow band: 800 W of electrical input splits into 490.5 W of useful lifting power, 61.3 percent, and 309.5 W of losses turning downward."
      caption="The budget must close: 490.5 W lifts the load and the other 309.5 W leaves as heat, friction and noise, so η = 61.3%."
    >
      <Label x={240} y={24} tone="muted" size={15}>
        200 kg up 3 m in 12 s
      </Label>
      <rect x={30} y={top} width={split - 30} height={inH} fill={C.soft} stroke={C.accent} strokeWidth={1.5} />
      <Label x={(30 + split) / 2} y={top + inH / 2} weight={600}>
        800 W in
      </Label>
      <path
        d={`M${split},${top} L420,${top} L450,${top + useH / 2} L420,${top + useH} L${split},${top + useH} Z`}
        fill={C.accent}
        fillOpacity={0.3}
        stroke={C.accent}
        strokeWidth={1.5}
      />
      <Label x={325} y={top + useH / 2} weight={600}>
        490.5 W lift
      </Label>
      <path
        d={`M${split},${lossMid} C${lx - 20},${lossMid} ${lx},${lossMid + 20} ${lx},${lossMid + 60}`}
        fill="none"
        stroke={C.alarm}
        strokeOpacity={0.35}
        strokeWidth={lossH}
      />
      <polygon
        points={`${lx - lossH / 2 - 6},${lossMid + 60} ${lx + lossH / 2 + 6},${lossMid + 60} ${lx},${lossMid + 88}`}
        fill={C.alarm}
        fillOpacity={0.5}
      />
      <Label x={lx + 30} y={lossMid + 40} anchor="start" tone="alarm">
        309.5 W lost
      </Label>
      <Label x={lx + 30} y={lossMid + 62} anchor="start" tone="muted" size={15}>
        heat, friction, hum
      </Label>
      <Label x={470} y={top - 16} anchor="end" tone="accent" weight={600}>
        η = 61.3%
      </Label>
    </Figure>
  );
}

/* ---------- Week 5 ---------- */

/** impulse: force–time pulses of equal area — glove 50 N × 0.12 s, wall 600 N × 0.01 s. */
function Impulse() {
  const b = plotBox({ x: 70, y: 40, w: 370, h: 190, xMin: 0, xMax: 0.14, yMin: 0, yMax: 650 });
  return (
    <Figure
      height={280}
      alt="A force-time graph with a tall narrow 600 N pulse lasting 0.01 s and a low wide 50 N pulse lasting 0.12 s, both enclosing 6.0 newton-seconds."
      caption="Same area, same momentum change: stretch the stop twelve times longer and the average force drops twelve times."
    >
      <rect x={b.px(0)} y={b.py(50)} width={b.px(0.12) - b.px(0)} height={b.py(0) - b.py(50)} fill={C.accent} fillOpacity={0.35} stroke={C.accent} strokeWidth={2} />
      <rect x={b.px(0)} y={b.py(600)} width={b.px(0.01) - b.px(0)} height={b.py(0) - b.py(600)} fill={C.alarm} fillOpacity={0.3} stroke={C.alarm} strokeWidth={2} />
      <Axes box={b} xLabel="t (s)" yLabel="F (N)" />
      {[0.01, 0.12].map((t) => (
        <g key={t}>
          <line x1={b.px(t)} y1={b.py(0)} x2={b.px(t)} y2={b.py(0) + 6} stroke={C.ink} strokeWidth={1.5} />
          <Label x={b.px(t)} y={b.py(0) + 18} tone="muted" size={15}>
            {t.toFixed(2)}
          </Label>
        </g>
      ))}
      <Label x={b.px(0.01) + 10} y={b.py(560)} anchor="start" tone="alarm" weight={600}>
        wall: 600 N for 0.01 s
      </Label>
      <Label x={b.px(0.06)} y={b.py(50) - 18} tone="accent" weight={600}>
        glove: 50 N for 0.12 s
      </Label>
      <Label x={b.px(0.075)} y={b.py(300)} size={15}>
        each area = 6.0 N·s = Δp
      </Label>
    </Figure>
  );
}

/** conserve: two skaters push apart; momenta cancel and the center of mass stays put. */
function Conserve() {
  const cm = 240;
  const s = 60; // px per m, positions one second after the push
  const a0 = cm + 15;
  const b0 = cm - 21;
  const a1 = a0 + 2.0 * s;
  const b1 = b0 - 2.8 * s;
  const y = 140;
  return (
    <Figure
      height={236}
      alt="Two skaters of 70 kg and 50 kg push apart from rest; one second later the 70 kg skater is 2.0 m to the right and the 50 kg skater 2.8 m to the left, with the center of mass unmoved."
      caption="Momenta of +140 and −140 kg·m/s cancel, so the center of mass never moves: the push is internal to the two-skater system."
    >
      <Ground x={16} y={170} w={452} />
      <line x1={cm} y1={36} x2={cm} y2={170} stroke={C.accent} strokeWidth={2} strokeDasharray="6 5" />
      <Label x={cm} y={194} tone="accent" weight={600}>
        CM stays put
      </Label>
      <circle cx={a0} cy={y} r={26} fill="none" stroke={C.muted} strokeWidth={1.5} strokeDasharray="4 4" />
      <circle cx={b0} cy={y + 4} r={22} fill="none" stroke={C.muted} strokeWidth={1.5} strokeDasharray="4 4" />

      <circle cx={a1} cy={y} r={26} fill={C.soft} stroke={C.ink} strokeWidth={2} />
      <Label x={a1} y={y} size={15}>
        70 kg
      </Label>
      <circle cx={b1} cy={y + 4} r={22} fill={C.soft} stroke={C.ink} strokeWidth={2} />
      <Label x={b1} y={y + 4} size={15}>
        50 kg
      </Label>

      <Arrow x1={cm + 16} y1={72} x2={cm + 16 + 2.0 * 30} y2={72} tone="ink" />
      <Label x={cm + 16 + 30} y={52} size={15}>
        +2.0 m/s
      </Label>
      <Arrow x1={cm - 16} y1={72} x2={cm - 16 - 2.8 * 30} y2={72} tone="ink" />
      <Label x={cm - 16 - 42} y={52} size={15}>
        −2.8 m/s
      </Label>

      <Label x={a1} y={194} size={15} tone="muted">
        p = +140
      </Label>
      <Label x={b1 - 22} y={194} anchor="start" size={15} tone="muted">
        p = −140
      </Label>
      <Label x={470} y={222} anchor="end" size={15} tone="muted">
        kg·m/s, 1 s after the push
      </Label>
    </Figure>
  );
}

/** collisions: one impact, two outcomes — momentum 8 kg·m/s both ways, kinetic energy 16 J vs 6.4 J. */
function Collisions() {
  const v = 18; // px per m/s
  const rows = [52, 146, 240];
  return (
    <Figure
      height={272}
      alt="Three rows of carts: before, a 2 kg cart at 4 m/s approaches a 3 kg cart at rest; elastic, they leave at −0.8 and 3.2 m/s with 16 J; stuck, they move together at 1.6 m/s with 6.4 J."
      caption="Momentum stays 8 kg·m/s in every row; only the kinetic energy depends on e, and sticking spends 9.6 J on deformation and heat."
    >
      {rows.map((y) => (
        <line key={y} x1={20} y1={y + 16} x2={350} y2={y + 16} stroke={C.muted} strokeWidth={1.5} />
      ))}
      {/* before */}
      <Label x={20} y={rows[0] - 34} anchor="start" size={15} tone="muted">
        before
      </Label>
      <Cart x={110} y={rows[0] + 16} w={44} label="2 kg" />
      <Arrow x1={156} y1={rows[0] - 6} x2={156 + 4 * v} y2={rows[0] - 6} tone="ink" />
      <Label x={156 + 2 * v} y={rows[0] - 24} size={15}>
        4 m/s
      </Label>
      <Cart x={240} y={rows[0] + 16} w={56} label="3 kg" />
      <Label x={470} y={rows[0] - 2} anchor="end" size={15}>
        p = 8 kg·m/s
      </Label>
      <Label x={470} y={rows[0] + 18} anchor="end" size={15}>
        K = 16 J
      </Label>

      {/* elastic */}
      <Label x={20} y={rows[1] - 34} anchor="start" size={15} tone="muted">
        elastic, e = 1
      </Label>
      <Cart x={110} y={rows[1] + 16} w={44} label="2 kg" />
      <Arrow x1={108} y1={rows[1] - 6} x2={108 - 0.8 * v} y2={rows[1] - 6} tone="accent" />
      <Label x={84} y={rows[1] - 6} anchor="end" size={15} tone="accent">
        0.8 m/s
      </Label>
      <Cart x={240} y={rows[1] + 16} w={56} label="3 kg" />
      <Arrow x1={298} y1={rows[1] - 6} x2={298 + 3.2 * v} y2={rows[1] - 6} tone="accent" />
      <Label x={298 + 1.6 * v} y={rows[1] - 24} size={15} tone="accent">
        3.2 m/s
      </Label>
      <Label x={470} y={rows[1] - 2} anchor="end" size={15}>
        p = 8 kg·m/s
      </Label>
      <Label x={470} y={rows[1] + 18} anchor="end" size={15} tone="accent" weight={600}>
        K = 16 J
      </Label>

      {/* stick */}
      <Label x={20} y={rows[2] - 34} anchor="start" size={15} tone="muted">
        stick, e = 0
      </Label>
      <Cart x={164} y={rows[2] + 16} w={44} label="2 kg" />
      <Cart x={208} y={rows[2] + 16} w={56} label="3 kg" />
      <Arrow x1={266} y1={rows[2] - 6} x2={266 + 1.6 * v} y2={rows[2] - 6} tone="alarm" />
      <Label x={266 + 0.8 * v} y={rows[2] - 24} size={15} tone="alarm">
        1.6 m/s
      </Label>
      <Label x={470} y={rows[2] - 2} anchor="end" size={15}>
        p = 8 kg·m/s
      </Label>
      <Label x={470} y={rows[2] + 18} anchor="end" size={15} tone="alarm" weight={600}>
        K = 6.4 J
      </Label>
    </Figure>
  );
}

export const physicsAFigures: FigureMap = {
  "physics/measure": Measure,
  "physics/sigfigs": SigFigs,
  "physics/fermi": Fermi,
  "physics/veccomp": VecComp,
  "physics/kingraphs": KinGraphs,
  "physics/projectiles": Projectiles,
  "physics/newton": Newton,
  "physics/contact": Contact,
  "physics/fbd": Fbd,
  "physics/work": Work,
  "physics/potential": Potential,
  "physics/power": Power,
  "physics/impulse": Impulse,
  "physics/conserve": Conserve,
  "physics/collisions": Collisions,
};
