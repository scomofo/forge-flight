import type { ReactNode } from "react";
import { Arrow, C, DimH, Figure, Ground, Label, plotBox, type FigureMap } from "./kit";

/* ---------- local helpers ---------- */

type Box = ReturnType<typeof plotBox>;
type Tone = "ink" | "accent" | "muted" | "alarm";

/** Sample f on [a, b] into n+1 points. */
function sample(f: (x: number) => number, a: number, b: number, n = 80): Array<[number, number]> {
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= n; i++) {
    const x = a + ((b - a) * i) / n;
    pts.push([x, f(x)]);
  }
  return pts;
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
  xTicks?: Array<[number, ReactNode, Tone?]>;
  yTicks?: Array<[number, ReactNode, Tone?]>;
}) {
  const { x, y, w, h } = b;
  return (
    <g>
      <Arrow x1={x} y1={y + h} x2={x + w + 14} y2={y + h} tone="ink" width={1.5} />
      <Arrow x1={x} y1={y + h} x2={x} y2={y - 14} tone="ink" width={1.5} />
      {xTicks.map(([v, t, tone], i) => (
        <g key={`x${i}`}>
          <line x1={b.px(v)} y1={y + h} x2={b.px(v)} y2={y + h + 6} stroke={C.ink} strokeWidth={1.5} />
          <Label x={b.px(v)} y={y + h + 18} size={15} tone={tone ?? "muted"}>
            {t}
          </Label>
        </g>
      ))}
      {yTicks.map(([v, t, tone], i) => (
        <g key={`y${i}`}>
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

function Dot({ x, y, tone = "accent", r = 5 }: { x: number; y: number; tone?: Tone; r?: number }) {
  return <circle cx={x} cy={y} r={r} fill={C[tone]} stroke={C.surface} strokeWidth={1.5} />;
}

function Curve({ d, tone = "accent", width = 3, dashed = false }: { d: string; tone?: Tone; width?: number; dashed?: boolean }) {
  return (
    <path
      d={d}
      fill="none"
      stroke={C[tone]}
      strokeWidth={width}
      strokeLinejoin="round"
      strokeLinecap="round"
      strokeDasharray={dashed ? "6 5" : undefined}
    />
  );
}

function Guide({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.muted} strokeWidth={1.2} strokeDasharray="4 4" />;
}

/* ---------- materials-301 ---------- */

/** Cold work: strength climbs from 250 to 490 MPa while elongation falls from 40% to about 4%. */
function ColdWork() {
  const s = plotBox({ x: 90, y: 40, w: 290, h: 180, xMin: 0, xMax: 40, yMin: 0, yMax: 500 });
  const e = plotBox({ x: 90, y: 40, w: 290, h: 180, xMin: 0, xMax: 40, yMin: 0, yMax: 50 });
  const sig = (cw: number) => 250 + 6 * cw;
  const el = (cw: number) => 40 * Math.exp(-cw / 18);
  return (
    <Figure
      height={290}
      alt="Plot against percent cold work from 0 to 40: strength rises in a straight line from 250 MPa to 490 MPa while elongation falls on a curve from 40% to about 4%."
      caption="Same alloy at both ends. The work bought strength and spent stretch, so the condition has to be on the drawing."
    >
      <Frame
        b={s}
        xLabel="% cold work"
        yLabel=""
        xTicks={[
          [0, "0 annealed"],
          [40, "40%"],
        ]}
      />
      <Curve d={s.path(sample(sig, 0, 40, 2))} />
      <Curve d={e.path(sample(el, 0, 40))} tone="ink" dashed />
      <Dot x={s.px(0)} y={s.py(250)} />
      <Dot x={s.px(40)} y={s.py(490)} />
      <Dot x={e.px(0)} y={e.py(40)} tone="ink" />
      <Dot x={e.px(40)} y={e.py(el(40))} tone="ink" />
      <Label x={80} y={s.py(250)} anchor="end" tone="accent" size={15}>250 MPa</Label>
      <Label x={80} y={e.py(40)} anchor="end" size={15}>40%</Label>
      <Label x={390} y={s.py(490)} anchor="start" tone="accent" size={15}>490 MPa</Label>
      <Label x={390} y={e.py(el(40))} anchor="start" size={15}>≈4%</Label>
      <Label x={s.px(24)} y={s.py(sig(24)) - 22} tone="accent" weight={600}>strength</Label>
      <Label x={e.px(24)} y={e.py(el(24)) - 20}>elongation</Label>
    </Figure>
  );
}

/** Quench: 10 mm and 40 mm bars, both 550 HV at the skin; the thick bar's center only reaches 270 HV. */
function Quench() {
  const center = (t: number) => 200 + 350 / (1 + (t / 20) ** 2);
  const frac = (hv: number) => (hv - 200) / 350;
  return (
    <Figure
      height={280}
      alt="Cross-sections of a 10 mm and a 40 mm quenched steel bar, both dark at the surface marked 550 HV; the small bar's center is 480 HV and the large bar's center fades to 270 HV."
      caption="The skin meets the water on both bars. The thick bar's middle is insulated by the metal around it, so its center is soft."
    >
      <defs>
        <radialGradient id="lb-q-small">
          <stop offset="0" stopColor={C.accent} stopOpacity={frac(center(10))} />
          <stop offset="1" stopColor={C.accent} stopOpacity={1} />
        </radialGradient>
        <radialGradient id="lb-q-big">
          <stop offset="0" stopColor={C.accent} stopOpacity={frac(center(40)) * 0.6} />
          <stop offset="0.55" stopColor={C.accent} stopOpacity={0.35} />
          <stop offset="1" stopColor={C.accent} stopOpacity={1} />
        </radialGradient>
      </defs>
      <circle cx={100} cy={150} r={25} fill="url(#lb-q-small)" stroke={C.ink} strokeWidth={2} />
      <circle cx={320} cy={150} r={100} fill="url(#lb-q-big)" stroke={C.ink} strokeWidth={2} />

      <Label x={215} y={22} tone="accent" weight={600}>surface 550 HV</Label>
      <Arrow x1={170} y1={34} x2={117} y2={128} tone="muted" width={1.5} />
      <Arrow x1={255} y1={34} x2={266} y2={64} tone="muted" width={1.5} />

      <Label x={320} y={138}>center</Label>
      <Label x={320} y={160} weight={600}>270 HV</Label>
      <circle cx={100} cy={150} r={3} fill={C.ink} />
      <Arrow x1={100} y1={200} x2={100} y2={156} tone="muted" width={1.5} />
      <Label x={100} y={214}>center</Label>
      <Label x={100} y={234} weight={600}>480 HV</Label>

      <Label x={100} y={266} tone="muted" size={15}>10 mm bar</Label>
      <Label x={320} y={266} tone="muted" size={15}>40 mm bar</Label>
    </Figure>
  );
}

/** Lever rule: tie line from 20% B (solid) to 80% B (liquid); at 30% B overall the solid fraction is 50/60. */
function Lever() {
  const b = plotBox({ x: 60, y: 40, w: 380, h: 190, xMin: 0, xMax: 100, yMin: 0, yMax: 1.05 });
  const liq = (x: number) => 1 - (x / 100) ** 3.106;
  const sol = (x: number) => 1 - (x / 100) ** 0.4307;
  const lensPts = [...sample(liq, 0, 100), ...sample(sol, 0, 100).reverse()];
  const ty = b.py(0.5);
  return (
    <Figure
      height={330}
      alt="A two-phase lens on a temperature versus percent B diagram with a horizontal tie line from solid at 20% B to liquid at 80% B; the overall composition 30% B splits the line into a 10 arm and a 50 arm."
      caption="The ends of the tie line stay put. The solid fraction is the arm on the far side, 50 over the whole 60."
    >
      <path d={b.path(lensPts) + " Z"} fill={C.soft} stroke="none" />
      <Curve d={b.path(sample(liq, 0, 100))} tone="ink" width={2} />
      <Curve d={b.path(sample(sol, 0, 100))} tone="ink" width={2} />
      <Frame
        b={b}
        xLabel="% B"
        yLabel="temperature"
        xTicks={[
          [20, "20"],
          [30, "30", "accent"],
          [80, "80"],
        ]}
      />
      <Label x={b.px(78)} y={b.py(0.86)} tone="muted">liquid</Label>
      <Label x={b.px(10)} y={b.py(0.1)} tone="muted">solid</Label>
      <Label x={b.px(52)} y={b.py(0.68)} tone="muted" size={15}>S + L</Label>

      <line x1={b.px(20)} y1={ty} x2={b.px(80)} y2={ty} stroke={C.accent} strokeWidth={3} />
      <Guide x1={b.px(30)} y1={ty} x2={b.px(30)} y2={b.y + b.h} />
      <Dot x={b.px(20)} y={ty} tone="ink" />
      <Dot x={b.px(80)} y={ty} tone="ink" />
      <Dot x={b.px(30)} y={ty} tone="accent" r={6} />
      <Label x={b.px(30) + 6} y={ty - 20} anchor="start" tone="accent" size={15} weight={600}>C₀ = 30</Label>

      <DimH x1={b.px(20)} x2={b.px(30)} y={ty + 34} label="10" />
      <DimH x1={b.px(30)} x2={b.px(80)} y={ty + 34} label="50" tone="accent" />

      <Label x={240} y={316} tone="accent" weight={600}>fraction solid = 50 / 60 = 0.83</Label>
    </Figure>
  );
}

/** Fiber direction: σ(θ) = 1 / (cos²θ/900 + sin²θ/40), 900 MPa at 0°, about 140 MPa at 30°, 40 MPa at 90°. */
function Fiber() {
  const b = plotBox({ x: 70, y: 40, w: 360, h: 180, xMin: 0, xMax: 90, yMin: 0, yMax: 1000 });
  const rad = (d: number) => (d * Math.PI) / 180;
  const sig = (d: number) => 1 / (Math.cos(rad(d)) ** 2 / 900 + Math.sin(rad(d)) ** 2 / 40);
  const ix = 300;
  const iy = 50;
  const a = rad(30);
  return (
    <Figure
      height={290}
      alt="Strength against load angle off the fiber: 900 MPa at 0 degrees collapsing to about 140 MPa at 30 degrees and 40 MPa at 90 degrees, with an inset of a fiber plate pulled 30 degrees off its fibers."
      caption="The fiber never weakened. By 30° the load has mostly left it, and the across-fiber term sets the number."
    >
      <Frame
        b={b}
        xLabel="load angle off the fiber"
        yLabel="strength, MPa"
        xTicks={[
          [0, "0°"],
          [30, "30°", "accent"],
          [90, "90°"],
        ]}
      />
      <Curve d={b.path(sample(sig, 0, 90, 120))} />
      <Guide x1={b.px(30)} y1={b.py(sig(30))} x2={b.px(30)} y2={b.y + b.h} />
      <Dot x={b.px(0)} y={b.py(900)} />
      <Dot x={b.px(30)} y={b.py(sig(30))} r={6} />
      <Dot x={b.px(90)} y={b.py(40)} />
      <Label x={b.px(0) + 12} y={b.py(900)} anchor="start" size={15}>900 MPa</Label>
      <Label x={b.px(30) + 12} y={b.py(sig(30)) - 16} anchor="start" tone="accent" weight={600}>≈140 MPa</Label>
      <Label x={b.px(90) - 4} y={b.py(40) - 18} anchor="end" size={15}>40 MPa</Label>

      {/* inset: unidirectional plate with a load 30° off the fibers */}
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
      <path
        d={`M${ix + 65 + 34},${iy + 35} A34,34 0 0 0 ${ix + 65 + 34 * Math.cos(a)},${iy + 35 - 34 * Math.sin(a)}`}
        fill="none"
        stroke={C.ink}
        strokeWidth={1.5}
      />
      <Label x={ix + 146} y={iy + 26} anchor="start" size={15}>30°</Label>
      <Label x={ix + 65} y={iy + 88} tone="muted" size={15}>fibers →</Label>
    </Figure>
  );
}

/** Rule of mixtures: E = 230 Vf + 3.5 (1 − Vf), 3.5 GPa at no fiber, 139.4 GPa at 60%. */
function Mixture() {
  const b = plotBox({ x: 80, y: 40, w: 320, h: 180, xMin: 0, xMax: 1, yMin: 0, yMax: 250 });
  const E = (v: number) => 230 * v + 3.5 * (1 - v);
  return (
    <Figure
      height={290}
      alt="Along-fiber stiffness against fiber fraction, a straight line from 3.5 GPa with no fiber to 230 GPa at all fiber, with 139.4 GPa marked at 60% fiber."
      caption="At 60% fiber, 138 of the 139.4 GPa is the carbon. This line is only for a pull along the fibers."
    >
      <Frame
        b={b}
        xLabel="fiber fraction by volume"
        yLabel="E along fiber, GPa"
        xTicks={[
          [0, "0"],
          [0.6, "0.60", "accent"],
          [1, "1"],
        ]}
      />
      <Curve d={b.path([
        [0, E(0)],
        [1, E(1)],
      ])} />
      <Guide x1={b.px(0.6)} y1={b.py(E(0.6))} x2={b.px(0.6)} y2={b.y + b.h} />
      <Dot x={b.px(0)} y={b.py(3.5)} tone="ink" />
      <Dot x={b.px(0.6)} y={b.py(E(0.6))} r={6} />
      <Dot x={b.px(1)} y={b.py(230)} tone="ink" />
      <Label x={b.x - 10} y={b.py(3.5) - 8} anchor="end" size={15}>3.5</Label>
      <Label x={b.x - 10} y={b.py(3.5) + 12} anchor="end" size={15} tone="muted">epoxy</Label>
      <Label x={b.px(0.6) - 12} y={b.py(E(0.6)) - 18} anchor="end" tone="accent" weight={600}>139.4 GPa</Label>
      <Label x={b.px(0.6) + 12} y={b.py(E(0.6)) + 20} anchor="start" tone="muted" size={15}>138 + 1.4</Label>
      <Label x={b.px(1) - 10} y={b.py(230) - 18} anchor="end" size={15}>230 carbon</Label>
    </Figure>
  );
}

/** Ductile-to-brittle transition: teaching Charpy curve 15 J → 85 J centred at 0°C. */
function Transition() {
  const b = plotBox({ x: 70, y: 40, w: 360, h: 180, xMin: -60, xMax: 60, yMin: 0, yMax: 100 });
  const J = (t: number) => 15 + 70 / (1 + Math.exp(-t / 8));
  return (
    <Figure
      height={290}
      alt="Impact energy against temperature, an S-curve from a 15 J lower shelf to an 85 J upper shelf centred at 0 degrees C, with 20 J marked at minus 20 degrees as snaps and 80 J at 20 degrees as tears."
      caption="Same steel, 40 degrees apart. Quote the energy with the temperature, because the shelf is steep in the middle."
    >
      <Frame
        b={b}
        xLabel="temperature, °C"
        yLabel="impact energy"
        xTicks={[
          [-20, "−20", "alarm"],
          [0, "0"],
          [20, "20", "accent"],
        ]}
        yTicks={[
          [15, "15 J"],
          [85, "85 J"],
        ]}
      />
      <Guide x1={b.x} y1={b.py(85)} x2={b.x + b.w} y2={b.py(85)} />
      <Guide x1={b.x} y1={b.py(15)} x2={b.x + b.w} y2={b.py(15)} />
      <Curve d={b.path(sample(J, -60, 60, 120))} tone="ink" />
      <Dot x={b.px(-20)} y={b.py(J(-20))} tone="alarm" r={6} />
      <Dot x={b.px(20)} y={b.py(J(20))} tone="accent" r={6} />
      <Label x={b.px(-20)} y={b.py(J(-20)) - 40} tone="alarm" weight={600}>20 J</Label>
      <Label x={b.px(-20)} y={b.py(J(-20)) - 20} tone="alarm" size={15}>snaps</Label>
      <Label x={b.px(20) + 12} y={b.py(J(20)) + 24} anchor="start" tone="accent" weight={600}>80 J</Label>
      <Label x={b.px(20) + 56} y={b.py(J(20)) + 24} anchor="start" tone="accent" size={15}>tears</Label>
    </Figure>
  );
}

/* ---------- materials-401 ---------- */

/** Panel vs tie rod: E^(1/3)/ρ puts wood (4.31) far ahead of steel (0.75); E/ρ puts steel (25.6) ahead of wood (20). */
function Panel() {
  const base = 220;
  const H = 140;
  const bar = (x: number, v: number, max: number, win: boolean, val: string, name: string) => {
    const h = (v / max) * H;
    return (
      <g>
        <rect x={x - 26} y={base - h} width={52} height={h} fill={win ? C.accent : C.soft} stroke={win ? C.accent : C.ink} strokeWidth={1.5} />
        <Label x={x} y={base - h - 14} tone={win ? "accent" : "ink"} weight={win ? 600 : undefined}>
          {val}
        </Label>
        <Label x={x} y={base + 18} size={15}>
          {name}
        </Label>
      </g>
    );
  };
  return (
    <Figure
      height={260}
      alt="Two bar charts: for a panel, index E to the one-third over density is 0.75 for steel and 4.31 for wood; for a tie rod, E over density is 25.6 for steel and 20 for wood."
      caption="Wood wins the panel by nearly six times. Change the duty to a tie rod and the index changes, and steel edges ahead."
    >
      <Label x={125} y={24} weight={600}>
        panel: E<tspan fontSize={15} dy={-7}>1/3</tspan>
        <tspan dy={7}> / ρ</tspan>
      </Label>
      <Label x={355} y={24} weight={600}>tie rod: E / ρ</Label>
      {bar(80, 0.75, 4.31, false, "0.75", "steel")}
      {bar(170, 4.31, 4.31, true, "4.31", "wood")}
      {bar(310, 25.6, 25.6, true, "25.6", "steel")}
      {bar(400, 20, 25.6, false, "20", "wood")}
      <line x1={30} y1={base} x2={220} y2={base} stroke={C.ink} strokeWidth={2} />
      <line x1={260} y1={base} x2={450} y2={base} stroke={C.ink} strokeWidth={2} />
      <line x1={240} y1={40} x2={240} y2={240} stroke={C.line} strokeWidth={1.5} />
    </Figure>
  );
}

/** Notch sensitivity: fatigue strength 300 / (1 + q × 1.5), 300 MPa at q = 0, about 136 MPa at q = 0.8. */
function Sensitive() {
  const b = plotBox({ x: 80, y: 40, w: 330, h: 180, xMin: 0, xMax: 1, yMin: 0, yMax: 350 });
  const S = (q: number) => 300 / (1 + q * 1.5);
  return (
    <Figure
      height={290}
      alt="Notched fatigue strength against notch sensitivity q for a fixed Kt of 2.5: 300 MPa at q equals 0 where Kf is 1, falling to about 136 MPa at q equals 0.8 where Kf is 2.2."
      caption="The fillet is the same all the way along. Only the metal's sensitivity moves, and with it the factor you divide by."
    >
      <Frame
        b={b}
        xLabel="notch sensitivity q   (Kt = 2.5)"
        yLabel="fatigue strength, MPa"
        xTicks={[
          [0, "0"],
          [0.8, "0.8", "accent"],
          [1, "1"],
        ]}
      />
      <Guide x1={b.x} y1={b.py(300)} x2={b.x + b.w} y2={b.py(300)} />
      <Curve d={b.path(sample(S, 0, 1))} />
      <Guide x1={b.px(0.8)} y1={b.py(S(0.8))} x2={b.px(0.8)} y2={b.y + b.h} />
      <Dot x={b.px(0)} y={b.py(300)} tone="ink" r={6} />
      <Dot x={b.px(0.8)} y={b.py(S(0.8))} r={6} />
      <Label x={b.px(0) + 14} y={b.py(300) - 18} anchor="start" size={15}>300 MPa, Kf = 1</Label>
      <Label x={b.px(0.8) - 10} y={b.py(S(0.8)) - 38} anchor="end" tone="accent" weight={600}>≈136 MPa</Label>
      <Label x={b.px(0.8) - 10} y={b.py(S(0.8)) - 18} anchor="end" tone="accent" size={15}>Kf = 2.2</Label>
    </Figure>
  );
}

/** Temper: 6061-O yields at 55 MPa and stretches 25%; 6061-T6 yields at 275 MPa and stretches 12%. */
function Temper() {
  const b = plotBox({ x: 80, y: 40, w: 330, h: 180, xMin: 0, xMax: 30, yMin: 0, yMax: 350 });
  const O = [[0, 0] as [number, number], ...sample((e) => 55 + 55 * (1 - Math.exp(-(e - 0.15) / 7)), 0.15, 25, 60)];
  const T6 = [[0, 0] as [number, number], ...sample((e) => 275 + 35 * (1 - Math.exp(-(e - 0.5) / 3)), 0.5, 12, 60)];
  const oEnd = O[O.length - 1];
  const tEnd = T6[T6.length - 1];
  const X = ({ x, y, tone }: { x: number; y: number; tone: Tone }) => (
    <g stroke={C[tone]} strokeWidth={2.5}>
      <line x1={x - 6} y1={y - 6} x2={x + 6} y2={y + 6} />
      <line x1={x - 6} y1={y + 6} x2={x + 6} y2={y - 6} />
    </g>
  );
  return (
    <Figure
      height={290}
      alt="Stress-strain curves for 6061: T6 yields at 275 MPa and breaks at 12% strain; annealed O yields at 55 MPa and stretches to 25%."
      caption="Both curves are 6061. The T6 treatment bought yield by spending stretch, so the letters are the strength."
    >
      <Frame
        b={b}
        xLabel="strain"
        yLabel="stress"
        xTicks={[
          [12, "12%", "accent"],
          [25, "25%"],
        ]}
        yTicks={[
          [55, "55 MPa"],
          [275, "275 MPa", "accent"],
        ]}
      />
      <Guide x1={b.px(tEnd[0])} y1={b.py(tEnd[1])} x2={b.px(tEnd[0])} y2={b.y + b.h} />
      <Guide x1={b.px(oEnd[0])} y1={b.py(oEnd[1])} x2={b.px(oEnd[0])} y2={b.y + b.h} />
      <Curve d={b.path(T6)} />
      <Curve d={b.path(O)} tone="ink" />
      <X x={b.px(tEnd[0])} y={b.py(tEnd[1])} tone="accent" />
      <X x={b.px(oEnd[0])} y={b.py(oEnd[1])} tone="ink" />
      <Label x={b.px(6)} y={b.py(305) - 18} tone="accent" weight={600}>6061-T6</Label>
      <Label x={b.px(16)} y={b.py(100) - 20} weight={600}>6061-O</Label>
    </Figure>
  );
}

/** Four services, four impatient mechanisms. */
function Duty() {
  const tile = (x: number, y: number, art: ReactNode, cond: string, mech: string) => (
    <g transform={`translate(${x},${y})`}>
      <rect x={0} y={0} width={220} height={120} rx={8} fill="none" stroke={C.line} strokeWidth={1.5} />
      {art}
      <Label x={100} y={44} anchor="start" size={15} tone="muted">
        {cond}
      </Label>
      <Label x={100} y={74} anchor="start" size={19} tone="accent" weight={600}>
        {mech}
      </Label>
    </g>
  );
  const bolt = (
    <g>
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
  const rod = (
    <g>
      <rect x={18} y={52} width={66} height={16} rx={3} fill={C.soft} stroke={C.ink} strokeWidth={1.5} />
      <path d="M30,40 A24,12 0 0 1 72,40" fill="none" stroke={C.accent} strokeWidth={2} markerEnd="url(#fig-arrow-accent)" />
      <path d="M72,80 A24,12 0 0 1 30,80" fill="none" stroke={C.accent} strokeWidth={2} markerEnd="url(#fig-arrow-accent)" />
    </g>
  );
  const wall = (
    <g>
      <rect x={42} y={18} width={14} height={84} fill={C.soft} stroke={C.ink} strokeWidth={1.5} />
      <path d="M42,58 l9,-3 l-6,-3 l9,-4" fill="none" stroke={C.alarm} strokeWidth={2} />
      <Arrow x1={28} y1={30} x2={28} y2={8} tone="ink" width={1.5} />
      <Arrow x1={28} y1={90} x2={28} y2={112} tone="ink" width={1.5} />
    </g>
  );
  const bracket = (
    <g>
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
    <Figure
      height={290}
      alt="Four tiles: a bolt at 600 degrees C for 1000 hours labeled creep, a rod reversed a million times labeled fatigue, a scratched thin wall labeled fracture, and a bracket outdoors for ten years labeled corrosion."
      caption="Read the service, not the datasheet. Room-temperature yield comes first in none of these four."
    >
      {tile(10, 16, bolt, "600°C, 1000 h", "creep")}
      {tile(250, 16, rod, "10⁶ reversals", "fatigue")}
      {tile(10, 154, wall, "scratched wall", "fracture")}
      {tile(250, 154, bracket, "10 yr outdoors", "corrosion")}
    </Figure>
  );
}

/** Stress corrosion: zero in dry air; wet, zero under 120 MPa and 0.04 mm/yr at 200 MPa. */
function Scc() {
  const b = plotBox({ x: 80, y: 40, w: 330, h: 170, xMin: 0, xMax: 240, yMin: 0, yMax: 0.07 });
  const wet = (s: number) => (s <= 120 ? 0 : (0.04 * (s - 120)) / 80);
  return (
    <Figure
      height={280}
      alt="Crack growth rate against stress: in dry air the rate is zero everywhere; with the corrodent it is zero below a 120 MPa threshold and climbs to 0.04 mm per year at 200 MPa."
      caption="Growth needs both the tension over the threshold and the chemical. Take either away and the rate is zero."
    >
      <rect x={b.px(0)} y={b.y} width={b.px(120) - b.px(0)} height={b.h} fill={C.soft} opacity={0.5} />
      <Frame
        b={b}
        xLabel="stress, MPa"
        yLabel="crack growth, mm/yr"
        xTicks={[
          [80, "80"],
          [120, "120"],
          [200, "200", "accent"],
        ]}
      />
      <Label x={b.px(60)} y={b.y + 20} tone="muted" size={15}>under 120: asleep</Label>
      <Curve d={b.path(sample(wet, 0, 240, 240))} />
      <Curve d={b.path([
        [0, 0.002],
        [240, 0.002],
      ])} tone="ink" width={2} dashed />
      <Guide x1={b.px(200)} y1={b.py(0.04)} x2={b.px(200)} y2={b.y + b.h} />
      <Dot x={b.px(200)} y={b.py(0.04)} r={6} />
      <Dot x={b.px(80)} y={b.py(0)} tone="ink" />
      <Label x={b.px(200) - 12} y={b.py(0.04) - 16} anchor="end" tone="accent" weight={600}>0.04 mm/yr</Label>
      <Label x={b.px(232)} y={b.py(0.06) - 18} anchor="end" tone="accent" size={15}>wet</Label>
      <Label x={b.px(40)} y={b.py(0) - 16} tone="ink" size={15}>dry air: 0</Label>
    </Figure>
  );
}

/* ---------- engineering-201 ---------- */

/** von Mises: 100 MPa tension plus 60 MPa shear gives √(100² + 3×60²) ≈ 144 MPa. */
function Mises() {
  const cx = 128;
  const cy = 140;
  const h = 48;
  return (
    <Figure
      height={280}
      alt="A square stress element pulled by 100 MPa of tension on its left and right faces and sheared by 60 MPa along all four faces, beside the calculation square root of 100 squared plus 3 times 60 squared, about 144 MPa."
      caption="The tension never changed. The shear arrived, and the number yield actually watches went from 100 to 144 MPa."
    >
      <rect x={cx - h} y={cy - h} width={2 * h} height={2 * h} fill={C.soft} stroke={C.ink} strokeWidth={2} />
      {/* tension */}
      <Arrow x1={cx + h + 2} y1={cy} x2={cx + h + 66} y2={cy} tone="ink" />
      <Arrow x1={cx - h - 2} y1={cy} x2={cx - h - 66} y2={cy} tone="ink" />
      <Label x={cx + h + 54} y={cy + 20} size={15}>σ 100</Label>
      {/* shear couple */}
      <Arrow x1={cx - 34} y1={cy - h - 10} x2={cx + 34} y2={cy - h - 10} />
      <Arrow x1={cx + 34} y1={cy + h + 10} x2={cx - 34} y2={cy + h + 10} />
      <Arrow x1={cx + h + 12} y1={cy + 34} x2={cx + h + 12} y2={cy - 34} />
      <Arrow x1={cx - h - 12} y1={cy - 34} x2={cx - h - 12} y2={cy + 34} />
      <Label x={cx} y={cy - h - 30} tone="accent" size={15}>τ 60</Label>

      <Label x={272} y={70} anchor="start" tone="muted" size={15}>shear 0:  100 MPa</Label>
      <Label x={272} y={130} anchor="start" size={18} serif>√(100² + 3 × 60²)</Label>
      <Label x={272} y={172} anchor="start" size={22} tone="accent" weight={600} serif>≈ 144 MPa</Label>
      <Label x={272} y={216} anchor="start" tone="muted" size={15}>compare with yield</Label>
    </Figure>
  );
}

/** Torsion: 200 N·m on r = 10 mm gives about 127 MPa at the skin; on r = 20 mm about 16 MPa. */
function Torsion() {
  const tau = (r: number) => (2 * 200) / (Math.PI * (r / 1000) ** 3) / 1e6;
  const scale = 60 / tau(10);
  const shaft = (cx: number, cy: number, R: number, rmm: number, label: string) => {
    const L = tau(rmm) * scale;
    return (
      <g>
        <circle cx={cx} cy={cy} r={R} fill={C.surface} stroke={C.ink} strokeWidth={2} />
        <polygon points={`${cx},${cy} ${cx},${cy - R} ${cx + L},${cy - R}`} fill={C.soft} stroke={C.accent} strokeWidth={2} />
        <line x1={cx} y1={cy} x2={cx} y2={cy - R} stroke={C.ink} strokeWidth={1.5} />
        <circle cx={cx} cy={cy} r={3} fill={C.ink} />
        <Label x={cx + L + 8} y={cy - R - 2} anchor="start" tone="accent" weight={600}>
          {label}
        </Label>
        <Label x={cx} y={cy + R + 22} tone="muted" size={15}>
          r = {rmm} mm
        </Label>
      </g>
    );
  };
  return (
    <Figure
      height={270}
      alt="Cross-sections of a 10 mm and a 20 mm radius shaft each carrying 200 N·m, with shear stress drawn as a wedge from zero at the axis to about 127 MPa at the small shaft's surface and about 16 MPa at the large one's."
      caption="Stress is zero on the axis and peaks at the skin. Double the radius and that peak falls by eight."
    >
      <Label x={240} y={20} tone="muted" size={15}>same 200 N·m on both</Label>
      {shaft(90, 140, 45, 10, "≈127 MPa")}
      {shaft(330, 140, 90, 20, "≈16 MPa")}
    </Figure>
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
    <Figure
      height={290}
      alt="A closed thin-walled cylindrical tank with a small wall element pulled by 100 MPa of hoop stress around the tank and 50 MPa along its axis; the tank is 200 mm radius, 4 mm wall, 2 MPa inside."
      caption="The around-the-middle stress is twice the lengthwise one, which is why a seam along the tank is the one to design first."
    >
      <path
        d={`M${x1},${top} L${x2},${top} A22,${(bot - top) / 2} 0 0 1 ${x2},${bot} L${x1},${bot} A22,${(bot - top) / 2} 0 0 1 ${x1},${top} Z`}
        fill={C.soft}
        stroke={C.ink}
        strokeWidth={2}
      />
      <ellipse cx={x1} cy={cy} rx={22} ry={(bot - top) / 2} fill="none" stroke={C.ink} strokeWidth={1.5} strokeDasharray="4 4" />
      <line x1={x1 - 30} y1={cy} x2={x2 + 40} y2={cy} stroke={C.muted} strokeWidth={1.2} strokeDasharray="10 4 2 4" />
      <rect x={ex - s} y={cy - s} width={2 * s} height={2 * s} fill={C.surface} stroke={C.ink} strokeWidth={2} />
      {/* hoop (around) */}
      <Arrow x1={ex} y1={cy - s - 2} x2={ex} y2={cy - s - 44} />
      <Arrow x1={ex} y1={cy + s + 2} x2={ex} y2={cy + s + 44} />
      {/* longitudinal (along) */}
      <Arrow x1={ex + s + 2} y1={cy} x2={ex + s + 24} y2={cy} tone="ink" />
      <Arrow x1={ex - s - 2} y1={cy} x2={ex - s - 24} y2={cy} tone="ink" />
      <Label x={ex + 12} y={cy - s - 50} anchor="start" tone="accent" weight={600}>hoop 100 MPa</Label>
      <Label x={ex + s + 30} y={cy + 20} anchor="start" size={15}>along 50 MPa</Label>
      <Label x={240} y={272} tone="muted" size={15}>p = 2 MPa · r = 200 mm · t = 4 mm</Label>
    </Figure>
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
  return (
    <Figure
      height={330}
      alt="A 40 mm square post loaded with 20 kN placed 20 mm off its center line, and below it the stress across the section: average 12.5 MPa dashed, rising to 50 MPa on the loaded face and dropping past zero on the far face."
      caption="The load never grew. Moving its line 20 mm quadrupled the peak, so check the high face, not P/A."
    >
      <DimH x1={mid} x2={R} y={44} label="20 mm" />
      <Arrow x1={R} y1={6} x2={R} y2={66} width={3.5} />
      <Label x={R + 12} y={16} anchor="start" tone="accent" weight={600}>20 kN</Label>
      <rect x={L} y={70} width={R - L} height={110} fill={C.soft} stroke={C.ink} strokeWidth={2} />
      <line x1={mid} y1={58} x2={mid} y2={192} stroke={C.muted} strokeWidth={1.2} strokeDasharray="10 4 2 4" />
      <Label x={L + 30} y={115} size={15} tone="muted">40 mm</Label>
      <Label x={L + 30} y={135} size={15} tone="muted">square</Label>

      {/* stress across the section, compression drawn downward */}
      <polygon points={`${x0},${base} ${R},${base} ${R},${base + 50 * k}`} fill={C.soft} stroke={C.accent} strokeWidth={2} />
      <polygon points={`${L},${base} ${x0},${base} ${L},${base - 25 * k}`} fill="none" stroke={C.alarm} strokeWidth={2} />
      <line x1={L - 20} y1={base} x2={R + 20} y2={base} stroke={C.ink} strokeWidth={1.5} />
      <line x1={L} y1={base + 12.5 * k} x2={R} y2={base + 12.5 * k} stroke={C.ink} strokeWidth={1.5} strokeDasharray="6 5" />
      <Label x={R + 10} y={base + 50 * k} anchor="start" tone="accent" weight={600}>50 MPa</Label>
      <Label x={L - 10} y={base + 12.5 * k} anchor="end" size={15}>P/A 12.5</Label>
      <Label x={L - 10} y={base - 22} anchor="end" size={15} tone="alarm">far face</Label>
      <Label x={240} y={318} tone="muted" size={15}>12.5 + 37.5 = 50 MPa, four times the average</Label>
    </Figure>
  );
}

/** Single-shear pin: 4000 N over π d²/4: 8 mm gives 79.6 MPa, 16 mm gives 19.9 MPa. */
function PinShear() {
  return (
    <Figure
      height={260}
      alt="A pin through two overlapping plates pulled apart with 4000 N, cut by one shear plane, beside cross-sections of an 8 mm pin at 79.6 MPa and a 16 mm pin at 19.9 MPa."
      caption="One slice carries the whole load. Double the diameter and the circle's area grows four times, so the stress falls to a quarter."
    >
      {/* lug on top, cable plate below */}
      <rect x={30} y={80} width={160} height={34} fill={C.soft} stroke={C.ink} strokeWidth={2} />
      <rect x={110} y={114} width={130} height={34} fill={C.soft} stroke={C.ink} strokeWidth={2} />
      <rect x={140} y={66} width={20} height={96} fill={C.surface} stroke={C.ink} strokeWidth={2} />
      <line x1={128} y1={114} x2={172} y2={114} stroke={C.accent} strokeWidth={4} />
      <Arrow x1={30} y1={97} x2={4} y2={97} tone="ink" />
      <Arrow x1={240} y1={131} x2={268} y2={131} tone="ink" />
      <Label x={250} y={106} size={15}>4000 N</Label>
      <Label x={150} y={186} tone="accent" size={15}>one shear plane</Label>
      <Arrow x1={150} y1={174} x2={150} y2={120} tone="muted" width={1.5} />

      <circle cx={330} cy={110} r={16} fill={C.accent} />
      <circle cx={420} cy={110} r={32} fill={C.soft} stroke={C.accent} strokeWidth={2} />
      <Label x={330} y={160} size={15} tone="muted">8 mm</Label>
      <Label x={330} y={184} tone="accent" weight={600}>79.6 MPa</Label>
      <Label x={420} y={160} size={15} tone="muted">16 mm</Label>
      <Label x={420} y={184} weight={600}>19.9 MPa</Label>
      <Label x={375} y={228} tone="muted" size={15}>area × 4, stress ÷ 4</Label>
    </Figure>
  );
}

/** Archard wear: 1000 × 10⁻⁴ × 200 × 1000 / 1000 = 20 mm³; double H → 10, double distance → 40. */
function Wear() {
  const unit = 4; // px per mm³
  const row = (y: number, name: string, v: number, hi = false) => (
    <g>
      <Label x={180} y={y} anchor="end" size={15} tone={hi ? "ink" : "muted"}>
        {name}
      </Label>
      <rect x={192} y={y - 9} width={v * unit} height={18} fill={hi ? C.accent : C.soft} stroke={C.accent} strokeWidth={1.5} />
      <Label x={200 + v * unit} y={y} anchor="start" size={15} tone={hi ? "accent" : "ink"} weight={hi ? 600 : undefined}>
        {v} mm³
      </Label>
    </g>
  );
  return (
    <Figure
      height={300}
      alt="A block pressed down with 200 N sliding 1000 m over a surface, leaving debris; bars compare 20 cubic mm lost as given, 10 with double hardness and 40 with double distance."
      caption="Load, distance and hardness set the pile. Yield strength never enters Archard's rule."
    >
      <Ground x={30} y={140} w={420} />
      {[50, 72, 90, 110, 128, 150].map((x, i) => (
        <circle key={i} cx={x} cy={134 - (i % 2) * 3} r={3} fill={C.muted} />
      ))}
      <Label x={100} y={110} tone="muted" size={15}>debris</Label>
      <rect x={180} y={90} width={100} height={50} rx={3} fill={C.soft} stroke={C.ink} strokeWidth={2} />
      <Label x={230} y={115} size={15}>H 1000</Label>
      <Arrow x1={230} y1={30} x2={230} y2={86} tone="ink" />
      <Label x={242} y={40} anchor="start" size={15}>200 N</Label>
      <Arrow x1={292} y1={115} x2={430} y2={115} />
      <Label x={360} y={96} tone="accent" weight={600}>1000 m</Label>

      {row(190, "as given", 20, true)}
      {row(224, "2× hardness", 10)}
      {row(258, "2× distance", 40)}
    </Figure>
  );
}

/* ---------- engineering-301 ---------- */

/** Critical speed falls with L^1.5: about 7300 rpm at 0.40 m, about 2600 rpm at 0.80 m. */
function Whirl() {
  const b = plotBox({ x: 80, y: 40, w: 330, h: 180, xMin: 0.3, xMax: 0.9, yMin: 0, yMax: 12000 });
  const N = (L: number) => 7329 * (0.4 / L) ** 1.5;
  return (
    <Figure
      height={290}
      alt="Critical speed against shaft length, a curve falling as length to the minus 1.5: about 7300 rpm at 0.40 m and about 2600 rpm at 0.80 m."
      caption="Twice the length, about 2.8 times lower critical speed. The old running rpm may now sit right on it."
    >
      <Frame
        b={b}
        xLabel="shaft length, m"
        yLabel="critical speed"
        xTicks={[
          [0.4, "0.40"],
          [0.8, "0.80", "accent"],
        ]}
      />
      <Curve d={b.path(sample(N, 0.3, 0.9))} />
      <Guide x1={b.px(0.4)} y1={b.py(N(0.4))} x2={b.px(0.4)} y2={b.y + b.h} />
      <Guide x1={b.px(0.8)} y1={b.py(N(0.8))} x2={b.px(0.8)} y2={b.y + b.h} />
      <Dot x={b.px(0.4)} y={b.py(N(0.4))} tone="ink" r={6} />
      <Dot x={b.px(0.8)} y={b.py(N(0.8))} r={6} />
      <Label x={b.px(0.4) + 12} y={b.py(N(0.4)) - 8} anchor="start" weight={600}>≈7300 rpm</Label>
      <Label x={b.px(0.8)} y={b.py(N(0.8)) - 26} tone="accent" weight={600}>≈2600 rpm</Label>
      <Label x={b.px(0.6) + 16} y={b.py(N(0.6)) - 22} anchor="start" tone="muted" size={15}>÷ 2.8</Label>
    </Figure>
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
  return (
    <Figure
      height={300}
      alt="A 20-tooth gear driving a 60-tooth gear: 10 N·m in on the small fast gear, 30 N·m out on the large gear at one third the speed, turning the opposite way."
      caption="Three times the torque, one third the speed. Power is not tripled, and a real mesh gives a little under 30."
    >
      <path d={gearPath(c2, cy, r2, 60, 4, Math.PI / 60)} fill={C.soft} stroke={C.ink} strokeWidth={1.5} />
      <path d={gearPath(c1, cy, r1, 20, 4, 0)} fill={C.surface} stroke={C.ink} strokeWidth={1.5} />
      <circle cx={c1} cy={cy} r={5} fill={C.ink} />
      <circle cx={c2} cy={cy} r={6} fill={C.ink} />
      {/* small gear clockwise, big gear counter-clockwise */}
      <path d={arc(c1, r1 + 16, -2.6, -0.9, 1)} fill="none" stroke={C.ink} strokeWidth={2.5} markerEnd="url(#fig-arrow-ink)" />
      <path d={arc(c2, r2 + 16, -0.9, -2.0, 0)} fill="none" stroke={C.accent} strokeWidth={2.5} markerEnd="url(#fig-arrow-accent)" />
      <Label x={c1} y={cy + r1 + 30} size={15} tone="muted">20 teeth</Label>
      <Label x={c1} y={cy + r1 + 54} weight={600}>10 N·m in</Label>
      <Label x={c1} y={cy + r1 + 76} size={15} tone="muted">fast</Label>
      <Label x={c2} y={cy - 36} size={15} tone="muted">60 teeth</Label>
      <Label x={c2} y={cy + 30} tone="accent" weight={600}>30 N·m out</Label>
      <Label x={c2} y={cy + 54} size={15}>⅓ speed</Label>
    </Figure>
  );
}

/** Bearing L10 = (C/P)³ million rev: C = 20 kN gives 125 at 4 kN and about 15.6 at 8 kN. */
function Bearing() {
  const b = plotBox({ x: 80, y: 40, w: 330, h: 180, xMin: 3, xMax: 10, yMin: 0, yMax: 320 });
  const Lf = (P: number) => (20 / P) ** 3;
  return (
    <Figure
      height={290}
      alt="Ball bearing life in millions of revolutions against load for C equals 20 kN: 125 million at 4 kN falling to about 15.6 million at 8 kN."
      caption="Twice the load, one eighth the life. The catalog life only held at the load it was priced for."
    >
      <Frame
        b={b}
        xLabel="load P, kN   (C = 20 kN)"
        yLabel="L10, million rev"
        xTicks={[
          [4, "4"],
          [8, "8", "accent"],
        ]}
      />
      <Curve d={b.path(sample(Lf, 3.1, 10))} />
      <Guide x1={b.px(4)} y1={b.py(Lf(4))} x2={b.px(4)} y2={b.y + b.h} />
      <Guide x1={b.px(8)} y1={b.py(Lf(8))} x2={b.px(8)} y2={b.y + b.h} />
      <Dot x={b.px(4)} y={b.py(125)} tone="ink" r={6} />
      <Dot x={b.px(8)} y={b.py(Lf(8))} r={6} />
      <Label x={b.px(4) + 14} y={b.py(125) - 6} anchor="start" weight={600}>125</Label>
      <Label x={b.px(8)} y={b.py(Lf(8)) - 26} tone="accent" weight={600}>15.6</Label>
      <Label x={b.px(6)} y={b.py(150)} tone="muted" size={15}>2× load → ÷ 8</Label>
    </Figure>
  );
}

/** Bolted joint: preload 15 kN, bolt takes 1/5 of new load until the joint opens at 1.25 × preload. */
function Preload() {
  const b = plotBox({ x: 80, y: 40, w: 330, h: 190, xMin: 0, xMax: 25, yMin: 0, yMax: 30 });
  const open = 15 * 1.25;
  return (
    <Figure
      height={300}
      alt="Bolt force against external load for a 15 kN preload: a shallow line rising to 17 kN at a 10 kN load, meeting the bolt-equals-load line where the joint opens, then 20 kN at a 20 kN load; a dashed line shows the wrong sum 15 plus P."
      caption="While the joint is closed the stiff members take most of a new load. Once it opens, the bolt carries all of it."
    >
      <Frame
        b={b}
        xLabel="external load P, kN"
        yLabel="bolt force, kN"
        xTicks={[
          [10, "10"],
          [20, "20", "accent"],
        ]}
        yTicks={[[15, "15"]]}
      />
      <Curve d={b.path([
        [0, 15],
        [15, 30],
      ])} tone="muted" width={2} dashed />
      <Label x={b.px(9.5)} y={b.py(27)} anchor="end" tone="muted" size={15}>not 15 + P</Label>
      <Curve d={b.path([
        [0, 0],
        [open, open],
      ])} tone="muted" width={1.5} dashed />
      <Curve d={b.path([
        [0, 15],
        [open, open],
        [25, 25],
      ])} />
      <Guide x1={b.px(10)} y1={b.py(17)} x2={b.px(10)} y2={b.y + b.h} />
      <Guide x1={b.px(20)} y1={b.py(20)} x2={b.px(20)} y2={b.y + b.h} />
      <Dot x={b.px(10)} y={b.py(17)} r={6} />
      <Dot x={b.px(20)} y={b.py(20)} r={6} tone="ink" />
      <Dot x={b.px(open)} y={b.py(open)} r={4} tone="ink" />
      <Label x={b.px(10)} y={b.py(17) - 22} tone="accent" weight={600}>17</Label>
      <Label x={b.px(20) + 12} y={b.py(20) + 20} anchor="start" weight={600}>20</Label>
      <Label x={b.px(open) - 10} y={b.py(open) - 20} anchor="middle" size={15}>opens</Label>
    </Figure>
  );
}

/** Helical spring seen side on, drawn as a zigzag of N coils. */
function Coil({ x1, x2, y, amp, coils, width }: { x1: number; x2: number; y: number; amp: number; coils: number; width: number }) {
  const pitch = (x2 - x1) / coils;
  let d = `M${x1},${y}`;
  for (let i = 0; i < coils; i++) {
    const x = x1 + i * pitch;
    d += ` L${x + pitch * 0.25},${y - amp} L${x + pitch * 0.75},${y + amp} L${x + pitch},${y}`;
  }
  return (
    <g>
      <line x1={x1 - 12} y1={y - amp - 6} x2={x1 - 12} y2={y + amp + 6} stroke={C.ink} strokeWidth={3} />
      <line x1={x1 - 12} y1={y} x2={x1} y2={y} stroke={C.ink} strokeWidth={width} />
      <path d={d} fill="none" stroke={C.ink} strokeWidth={width} strokeLinejoin="round" />
    </g>
  );
}

/** Coil spring rate k = G d⁴ / (8 D³ N): 2 mm wire 2500 N/m, 4 mm wire 40000 N/m. */
function CoilSpring() {
  return (
    <Figure
      height={262}
      alt="The same 8-coil, 20 mm spring wound in 2 mm wire rated 2500 N/m and in 4 mm wire rated 40000 N/m, sixteen times stiffer."
      caption="Same coil, same count, twice the wire: sixteen times the rate, because the wire diameter is to the fourth."
    >
      <Label x={48} y={28} anchor="start" size={15} tone="muted">2 mm wire</Label>
      <Coil x1={60} x2={290} y={76} amp={26} coils={8} width={2} />
      <Label x={310} y={76} anchor="start" weight={600}>2500 N/m</Label>

      <Label x={48} y={134} anchor="start" size={15} tone="muted">4 mm wire</Label>
      <Coil x1={60} x2={290} y={182} amp={26} coils={8} width={4.5} />
      <Label x={310} y={182} anchor="start" tone="accent" weight={600}>40000 N/m</Label>

      <Arrow x1={350} y1={94} x2={350} y2={164} tone="accent" width={2} />
      <Label x={362} y={129} anchor="start" tone="accent" size={15}>× 16</Label>
      <Label x={175} y={242} tone="muted" size={15}>D 20 mm · 8 coils · G 80 GPa</Label>
    </Figure>
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
    <Figure
      height={250}
      alt="A logarithmic section-size scale from 1 to 1000 mm split at L equals 40 mm: a 10 mm section on the yield-first side and a 200 mm member on the fracture-can-come-first side."
      caption="Same metal on both sides of 40 mm. The small coupon yields through; the big member can crack before its section yields."
    >
      <rect x={x0} y={y} width={Lx - x0} height={30} fill={C.soft} />
      <rect x={Lx} y={y} width={x0 + w - Lx} height={30} fill={C.alarm} opacity={0.18} />
      <rect x={x0} y={y} width={w} height={30} fill="none" stroke={C.ink} strokeWidth={1.5} />
      <line x1={Lx} y1={y - 10} x2={Lx} y2={y + 40} stroke={C.ink} strokeWidth={2.5} />
      <Label x={(x0 + Lx) / 2} y={y + 15} size={15}>yields first</Label>
      <Label x={(Lx + x0 + w) / 2} y={y + 15} size={15} tone="alarm">fracture can win</Label>
      <Label x={Lx} y={y + 58} weight={600}>L = 40 mm</Label>

      {/* sections drawn above their sizes */}
      <rect x={px(10) - 6} y={y - 24} width={12} height={12} fill={C.accent} />
      <Label x={px(10)} y={y - 42} tone="accent" weight={600}>10 mm</Label>
      <rect x={px(200) - 20} y={y - 52} width={40} height={40} fill={C.alarm} opacity={0.8} />
      <Label x={px(200) + 28} y={y - 32} anchor="start" tone="alarm" weight={600}>200 mm</Label>

      {[1, 10, 100, 1000].map((v) => (
        <g key={v}>
          <line x1={px(v)} y1={y + 30} x2={px(v)} y2={y + 36} stroke={C.muted} strokeWidth={1.5} />
        </g>
      ))}
      <Label x={240} y={226} tone="muted" size={15} serif>(80 / 400)² m = 0.04 m</Label>
    </Figure>
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
