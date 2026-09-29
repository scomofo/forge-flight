import { Arrow, Axes, C, DimH, DimV, Figure, Ground, Label, WallV, plotBox, type FigureMap } from "./kit";

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
function Dot({ x, y, tone = "accent", hollow = false }: { x: number; y: number; tone?: Tone; hollow?: boolean }) {
  return <circle cx={x} cy={y} r={6} fill={hollow ? C.surface : C[tone]} stroke={C[tone]} strokeWidth={2.5} />;
}

/** Dashed guide line. */
function Guide({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.muted} strokeWidth={1.2} strokeDasharray="4 4" />;
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
    <Figure
      height={260}
      alt="A 0.25 m wrench with a 40 N push at 30 degrees on its end; the force line is extended and a 0.125 m perpendicular runs from the bolt to it, giving 5 N·m."
      caption="Only the perpendicular distance from the bolt to the force's line counts: at 30° that is half the wrench, so 5 N·m instead of 10."
    >
      <rect x={P.x} y={P.y - 7} width={E.x - P.x} height={14} rx={7} fill={C.soft} stroke={C.ink} strokeWidth={2} />
      <polygon points={hex} fill={C.surface} stroke={C.ink} strokeWidth={2.5} />
      <circle cx={P.x} cy={P.y} r={3} fill={C.ink} />
      <line x1={F.x} y1={F.y} x2={tail.x} y2={tail.y} stroke={C.muted} strokeWidth={1.5} strokeDasharray="6 5" />
      <line x1={P.x} y1={P.y} x2={F.x} y2={F.y} stroke={C.accent} strokeWidth={3} />
      <path
        d={`M${F.x + 10 * d.x},${F.y + 10 * d.y} l${10 * n.x},${10 * n.y} l${-10 * d.x},${-10 * d.y}`}
        fill="none"
        stroke={C.accent}
        strokeWidth={1.5}
      />
      <Label x={96} y={112} anchor="end" tone="accent" weight={600}>0.125 m</Label>
      <Arrow x1={tail.x} y1={tail.y} x2={E.x - 3} y2={E.y - 2} tone="ink" width={3.5} />
      <Label x={338} y={140} anchor="start">40 N</Label>
      <ArcArrow cx={E.x} cy={E.y} r={58} a1={180} a2={208} tone="muted" width={1.5} />
      <Label x={296} y={169} tone="muted" size={15}>30°</Label>
      <DimH x1={P.x} x2={E.x} y={236} label="0.25 m" />
      <Label x={450} y={38} anchor="end" tone="accent" weight={600}>τ = 0.125 × 40 = 5 N·m</Label>
      <Label x={450} y={64} anchor="end" tone="muted" size={15}>square push: 10 N·m</Label>
    </Figure>
  );
}

/** Inertia: hoop vs disk, same M and R. */
function Inertia() {
  return (
    <Figure
      height={250}
      alt="A hoop and a solid disk of the same mass and radius side by side, labelled I = MR² and I = ½MR²."
      caption="Same kilograms, same size: the hoop keeps all its mass at the rim, so it has twice the disk's inertia."
    >
      <Label x={240} y={20} tone="muted" size={15}>same mass M, same radius R</Label>
      <circle cx={130} cy={125} r={74} fill="none" stroke={C.accent} strokeWidth={12} />
      <circle cx={130} cy={125} r={4} fill={C.ink} />
      <line x1={130} y1={125} x2={130 + 80 * 0.707} y2={125 - 80 * 0.707} stroke={C.muted} strokeWidth={1.5} />
      <Label x={150} y={110} tone="muted" size={15}>R</Label>
      <circle cx={350} cy={125} r={80} fill={C.soft} stroke={C.ink} strokeWidth={2} />
      <circle cx={350} cy={125} r={4} fill={C.ink} />
      <line x1={350} y1={125} x2={350 + 80 * 0.707} y2={125 - 80 * 0.707} stroke={C.muted} strokeWidth={1.5} />
      <Label x={370} y={110} tone="muted" size={15}>R</Label>
      <Label x={130} y={226} weight={600}>hoop: I = MR²</Label>
      <Label x={350} y={226} weight={600}>disk: I = ½MR²</Label>
    </Figure>
  );
}

/** Spin: arms out I 1.2, ω 4 → arms in I 0.6, ω 8. */
function Spin() {
  const L = { x: 120, y: 140 };
  const R = { x: 360, y: 140 };
  return (
    <Figure
      height={280}
      alt="Top view of a skater with arms out (I 1.2 kg·m², 4 rad/s) and with arms in (I 0.6 kg·m², 8 rad/s), both with angular momentum 4.8 kg·m²/s."
      caption="Nothing twisted the skater: halving the inertia doubles the spin so Iω stays 4.8."
    >
      <Label x={240} y={18} tone="muted" size={15}>Iω = 4.8 kg·m²/s both times</Label>
      <line x1={L.x - 80} y1={L.y} x2={L.x + 80} y2={L.y} stroke={C.ink} strokeWidth={4} />
      <circle cx={L.x - 80} cy={L.y} r={8} fill={C.accent} />
      <circle cx={L.x + 80} cy={L.y} r={8} fill={C.accent} />
      <circle cx={L.x} cy={L.y} r={18} fill={C.soft} stroke={C.ink} strokeWidth={2} />
      <ArcArrow cx={L.x} cy={L.y} r={92} a1={215} a2={325} tone="muted" width={2} />
      <Label x={L.x} y={200}>I = 1.2 kg·m²</Label>
      <Label x={L.x} y={226} weight={600}>ω = 4 rad/s</Label>

      <Arrow x1={220} y1={L.y} x2={275} y2={L.y} tone="muted" width={2} />
      <Label x={247} y={L.y - 18} tone="muted" size={15}>arms in</Label>

      <line x1={R.x - 30} y1={R.y} x2={R.x + 30} y2={R.y} stroke={C.ink} strokeWidth={4} />
      <circle cx={R.x - 30} cy={R.y} r={8} fill={C.accent} />
      <circle cx={R.x + 30} cy={R.y} r={8} fill={C.accent} />
      <circle cx={R.x} cy={R.y} r={18} fill={C.soft} stroke={C.ink} strokeWidth={2} />
      <ArcArrow cx={R.x} cy={R.y} r={50} a1={200} a2={340} tone="accent" width={3} />
      <ArcArrow cx={R.x} cy={R.y} r={50} a1={20} a2={160} tone="accent" width={3} />
      <Label x={R.x} y={200}>I = 0.6 kg·m²</Label>
      <Label x={R.x} y={226} tone="accent" weight={600}>ω = 8 rad/s</Label>
    </Figure>
  );
}

/** Period vs mass on a 100 N/m spring. */
function Period() {
  const b = plotBox({ x: 70, y: 40, w: 360, h: 190, xMin: 0, xMax: 2.5, yMin: 0, yMax: 1.4 });
  const T = (m: number) => 2 * Math.PI * Math.sqrt(m / 100);
  return (
    <Figure
      height={275}
      alt="Period of a 100 N/m spring against mass: a square-root curve through 0.63 s at 1 kg and 0.89 s at 2 kg, with a hollow point at 1.26 s showing what doubling would have given."
      caption="Doubling the mass stretches the period by 1.41, not 2: the curve bends under the square root."
    >
      <Axes box={b} xLabel="mass (kg)" yLabel="period T (s)" />
      <path d={b.path(sample(T, 0, 2.5))} fill="none" stroke={C.accent} strokeWidth={3} />
      <Guide x1={b.px(1)} y1={b.py(T(1))} x2={b.px(1)} y2={b.py(0)} />
      <Guide x1={b.px(2)} y1={b.py(2 * T(1))} x2={b.px(2)} y2={b.py(0)} />
      <Dot x={b.px(1)} y={b.py(T(1))} />
      <Dot x={b.px(2)} y={b.py(T(2))} />
      <Dot x={b.px(2)} y={b.py(2 * T(1))} tone="alarm" hollow />
      <Label x={b.px(1) - 10} y={b.py(T(1)) - 16} anchor="end" weight={600}>0.63 s</Label>
      <Label x={b.px(2) + 12} y={b.py(T(2)) + 4} anchor="start" weight={600}>0.89 s</Label>
      <Label x={b.px(2) - 12} y={b.py(2 * T(1))} anchor="end" tone="alarm" size={15}>not 2×: 1.26 s</Label>
      <Label x={b.px(1)} y={b.py(0) + 18} tone="muted" size={15}>1</Label>
      <Label x={b.px(2)} y={b.py(0) + 18} tone="muted" size={15}>2</Label>
      <Label x={90} y={62} anchor="start" tone="muted" size={15}>k = 100 N/m</Label>
    </Figure>
  );
}

/** Float: pine half under, steel on the bottom. */
function Float() {
  return (
    <Figure
      height={265}
      alt="A water tank with a pine block floating half under and a same-size steel block resting on the bottom."
      caption="Pine at 500 kg/m³ sinks only until half its volume is under; steel is still too heavy when fully under, so it sinks."
    >
      <rect x={40} y={100} width={400} height={130} fill={C.soft} />
      <line x1={40} y1={100} x2={440} y2={100} stroke={C.accent} strokeWidth={2} />
      <Ground x={40} y={230} w={400} />
      <rect x={100} y={60} width={100} height={80} fill={C.brass} fillOpacity={0.55} stroke={C.ink} strokeWidth={2} />
      <DimV x={214} y1={100} y2={140} label="0.50 under" tone="accent" />
      <Arrow x1={150} y1={190} x2={150} y2={146} tone="accent" />
      <Label x={150} y={206} tone="accent" size={15}>buoyancy</Label>
      <Label x={150} y={40} weight={600}>pine 500 kg/m³</Label>
      <rect x={320} y={150} width={100} height={80} fill={C.muted} fillOpacity={0.5} stroke={C.ink} strokeWidth={2} />
      <Label x={370} y={125} tone="alarm" weight={600}>steel sinks</Label>
      <Label x={440} y={80} anchor="end" tone="muted" size={15}>water 1000 kg/m³</Label>
    </Figure>
  );
}

/* ---------- physics-301 ---------- */

/** Depth: gauge pressure grows 9.81 kPa per metre. */
function Depth() {
  const top = 60;
  const per = 18; // px per metre
  const bot = top + 10 * per;
  return (
    <Figure
      height={300}
      alt="Cross-section of a lake 10 m deep with a pressure wedge beside it growing from 0 kPa gauge at the surface to 98 kPa gauge at 10 m."
      caption="Every metre adds the same 9.81 kPa; at 10 m the gauge reads 98 kPa, and the air adds about one more atmosphere on top."
    >
      <Label x={160} y={24} tone="muted" size={15}>air ≈ 1 atm</Label>
      <rect x={60} y={top} width={200} height={bot - top + 10} fill={C.soft} />
      <line x1={60} y1={top} x2={260} y2={top} stroke={C.accent} strokeWidth={2} />
      <Ground x={60} y={bot + 10} w={200} />
      <Label x={52} y={top} anchor="end" tone="muted" size={15}>0 m</Label>
      <Label x={52} y={bot} anchor="end" tone="muted" size={15}>10 m</Label>
      <circle cx={160} cy={top} r={6} fill={C.ink} />
      <circle cx={160} cy={bot} r={6} fill={C.ink} />
      <Guide x1={166} y1={bot} x2={290} y2={bot} />
      <path d={`M290,${top} L290,${bot} L440,${bot} Z`} fill={C.soft} stroke={C.accent} strokeWidth={2} />
      <Label x={296} y={top - 12} anchor="start" tone="muted" size={15}>0 kPa gauge</Label>
      <Label x={384} y={118} anchor="start" tone="accent" size={15}>+9.81 kPa</Label>
      <Label x={384} y={138} anchor="start" tone="accent" size={15}>per m</Label>
      <Label x={440} y={bot + 22} anchor="end" tone="accent" weight={600}>98 kPa gauge</Label>
      <Label x={440} y={bot + 46} anchor="end" tone="muted" size={15}>≈ 2 atm absolute</Label>
    </Figure>
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
  return (
    <Figure
      height={265}
      alt="A level venturi pipe with gauge tubes: 200 kPa in the wide part where the water barely moves, 150 kPa in the throat at 10 m/s."
      caption="The throat buys 10 m/s with 50 kPa of pressure; the pipe is level, so the drop is all speed."
    >
      <path d={pipe} fill={C.soft} fillOpacity={0.5} stroke={C.ink} strokeWidth={2} />
      {tube(100, wallTop(40), 200)}
      {tube(260, wallTop(20), 150)}
      <Guide x1={107} y1={cy - k * 200} x2={330} y2={cy - k * 200} />
      <DimV x={330} y1={cy - k * 200} y2={cy - k * 150} label="½ρv² = 50 kPa" tone="accent" />
      <Label x={88} y={cy - k * 200} anchor="end" weight={600}>200 kPa</Label>
      <Label x={248} y={cy - k * 150 + 20} anchor="end" weight={600}>150 kPa</Label>
      <Label x={100} y={cy} tone="muted" size={15}>v ≈ 0</Label>
      <Label x={260} y={cy} tone="accent" weight={600}>10 m/s</Label>
    </Figure>
  );
}

/** Drag: 0.03 v² against a 2.0 N weight. */
function Drag() {
  const b = plotBox({ x: 70, y: 40, w: 350, h: 190, xMin: 0, xMax: 11, yMin: 0, yMax: 3 });
  const D = (v: number) => 0.5 * 1.2 * v * v * 0.05;
  const W = 0.2 * 9.81;
  const vt = Math.sqrt(W / 0.03);
  return (
    <Figure
      height={275}
      alt="Drag on the plate rising as speed squared, meeting the 2.0 N weight line near 8 m/s; at 4 m/s drag is a quarter of the weight."
      caption="Drag climbs with v², so half the terminal speed gives only a quarter of the drag."
    >
      <Axes box={b} xLabel="speed (m/s)" yLabel="force (N)" />
      <line x1={b.px(0)} y1={b.py(W)} x2={b.px(11)} y2={b.py(W)} stroke={C.ink} strokeWidth={2} strokeDasharray="8 5" />
      <Label x={80} y={b.py(W) - 14} anchor="start">weight 2.0 N</Label>
      <path d={b.path(sample(D, 0, 10.5))} fill="none" stroke={C.accent} strokeWidth={3} />
      <Label x={b.px(11)} y={b.py(1.3)} anchor="end" tone="accent" size={15}>drag</Label>
      <Guide x1={b.px(vt)} y1={b.py(W)} x2={b.px(vt)} y2={b.py(0)} />
      <Guide x1={b.px(4)} y1={b.py(D(4))} x2={b.px(4)} y2={b.py(0)} />
      <Dot x={b.px(vt)} y={b.py(W)} />
      <Dot x={b.px(4)} y={b.py(D(4))} />
      <Label x={b.px(vt) - 12} y={b.py(W) - 20} anchor="end" tone="accent" weight={600}>terminal ≈ 8 m/s</Label>
      <Label x={b.px(4) + 12} y={b.py(D(4)) + 14} anchor="start" size={15}>¼ of weight</Label>
      <Label x={b.px(4)} y={b.py(0) + 18} tone="muted" size={15}>4</Label>
      <Label x={b.px(8)} y={b.py(0) + 18} tone="muted" size={15}>8</Label>
    </Figure>
  );
}

/** Thermal: free bar grows 0.60 mm; fixed bar takes 120 MPa. */
function Thermal() {
  return (
    <Figure
      height={265}
      alt="Two 1 m steel bars heated 50 degrees: the free one grows 0.60 mm with no stress; the one between fixed walls does not grow and is squeezed to 120 MPa."
      caption="Same bar, same 50°: you get the growth or the stress, never both."
    >
      <Label x={60} y={30} anchor="start" weight={600}>free</Label>
      <rect x={60} y={50} width={300} height={26} fill={C.soft} stroke={C.ink} strokeWidth={2} />
      <rect x={360} y={50} width={30} height={26} fill="none" stroke={C.accent} strokeWidth={2} strokeDasharray="5 4" />
      <DimH x1={360} x2={390} y={30} label="+0.60 mm" tone="accent" />
      <Label x={404} y={64} anchor="start">σ = 0</Label>

      <Label x={60} y={122} anchor="start" weight={600}>ends fixed</Label>
      <WallV x={58} y={140} h={60} side="left" />
      <WallV x={362} y={140} h={60} side="right" />
      <rect x={60} y={157} width={300} height={26} fill={C.soft} stroke={C.ink} strokeWidth={2} />
      <Arrow x1={64} y1={170} x2={112} y2={170} tone="alarm" />
      <Arrow x1={356} y1={170} x2={308} y2={170} tone="alarm" />
      <Label x={210} y={171} tone="alarm" weight={600}>σ = 120 MPa</Label>
      <Label x={384} y={170} anchor="start">growth 0</Label>
      <Label x={240} y={240} tone="muted" size={15}>1 m steel bar, heated 50°</Label>
    </Figure>
  );
}

/** Pipe: 0.010 m³/s through 0.010 m² then 0.005 m². */
function Pipe() {
  const cy = 120;
  const duct = `M20,${cy - 50} L200,${cy - 50} L250,${cy - 25} L460,${cy - 25} L460,${cy + 25} L250,${cy + 25} L200,${cy + 50} L20,${cy + 50} Z`;
  return (
    <Figure
      height={230}
      alt="A duct that necks from 0.010 m² to 0.005 m², with an arrow for 1 m/s in the wide part and an arrow twice as long for 2 m/s in the neck."
      caption="Half the area, twice the speed: the same 0.010 m³ has to get through each second."
    >
      <path d={duct} fill={C.soft} fillOpacity={0.6} stroke={C.ink} strokeWidth={2} />
      <Label x={110} y={cy - 66}>0.010 m²</Label>
      <Label x={355} y={cy - 42}>0.005 m²</Label>
      <Arrow x1={85} y1={cy - 8} x2={135} y2={cy - 8} tone="accent" />
      <Label x={110} y={cy + 20} tone="accent" weight={600}>1 m/s</Label>
      <Arrow x1={305} y1={cy} x2={405} y2={cy} tone="accent" />
      <Label x={355} y={cy + 42} tone="accent" weight={600}>2 m/s</Label>
      <Label x={240} y={206} tone="muted" size={15}>Q = 0.010 m³/s in both</Label>
    </Figure>
  );
}

/* ---------- physics-401 ---------- */

/** Rod speed: steel vs polyethylene pulse after the same time. */
function RodSpeed() {
  const x0 = 60;
  const len = 380;
  const steel = x0 + 0.9 * len;
  const pe = x0 + 0.9 * len * (1450 / 5060);
  const rod = (y: number, front: number, tone: Tone) => (
    <g>
      <rect x={x0} y={y - 8} width={len} height={16} rx={3} fill={C.surface} stroke={C.ink} strokeWidth={2} />
      <rect x={x0} y={y - 8} width={front - x0} height={16} rx={3} fill={C.soft} />
      <rect x={front - 5} y={y - 12} width={10} height={24} rx={3} fill={C[tone]} />
      <Arrow x1={front + 8} y1={y} x2={front + 34} y2={y} tone={tone} width={2.5} />
      <Arrow x1={x0 - 40} y1={y} x2={x0 - 4} y2={y} tone="muted" width={2} />
    </g>
  );
  return (
    <Figure
      height={225}
      alt="A steel rod and a polyethylene rod tapped at the left end; at the same moment the pulse is near the far end of the steel rod but under a third of the way along the polyethylene."
      caption="Steel is eight times denser but a hundred times stiffer, so its pulse runs about 3.5 times as far in the same time."
    >
      <Label x={x0} y={36} anchor="start" weight={600}>steel</Label>
      <Label x={x0 + len} y={36} anchor="end" tone="accent" weight={600}>≈ 5060 m/s</Label>
      {rod(70, steel, "accent")}
      <Label x={x0} y={126} anchor="start" weight={600}>polyethylene</Label>
      <Label x={x0 + len} y={126} anchor="end" tone="accent" weight={600}>≈ 1450 m/s</Label>
      {rod(160, pe, "accent")}
      <Label x={x0 - 22} y={96} tone="muted" size={15}>tap</Label>
      <Label x={250} y={206} tone="muted" size={15}>same moment after the tap</Label>
    </Figure>
  );
}

/** Mode shape: pinned bar, 0.60 m at 128 Hz, 1.20 m at 32 Hz. */
function ModeShape() {
  const beam = (x: number, y: number, w: number, amp: number) => {
    const down = sample((t) => Math.sin(Math.PI * t), 0, 1, 60)
      .map(([t, s], i) => `${i ? "L" : "M"}${(x + t * w).toFixed(1)},${(y + amp * s).toFixed(1)}`)
      .join(" ");
    const up = sample((t) => Math.sin(Math.PI * t), 0, 1, 60)
      .map(([t, s], i) => `${i ? "L" : "M"}${(x + t * w).toFixed(1)},${(y - amp * s).toFixed(1)}`)
      .join(" ");
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
    <Figure
      height={260}
      alt="Two pinned steel bars ringing in their first mode: a 0.60 m span at 128 Hz and a 1.20 m span at 32 Hz."
      caption="Double the span and the note falls by four, because span is squared."
    >
      {beam(60, 60, 180, 20)}
      <DimH x1={60} x2={240} y={112} label="0.60 m" />
      <Label x={270} y={60} anchor="start" tone="accent" size={20} weight={600}>128 Hz</Label>
      {beam(60, 172, 360, 26)}
      <DimH x1={60} x2={420} y={236} label="1.20 m" />
      <Label x={420} y={134} anchor="end" tone="accent" size={20} weight={600}>32 Hz</Label>
    </Figure>
  );
}

/** Impact: peak force vs drop height, 2 kg on 1 MN/m. */
function Impact() {
  const b = plotBox({ x: 80, y: 40, w: 340, h: 190, xMin: 0, xMax: 0.7, yMin: 0, yMax: 5 });
  const Fk = (h: number) => Math.sqrt(2 * 2 * 9.81 * h * 1e6) / 1000;
  const F5 = Fk(0.5);
  return (
    <Figure
      height={275}
      alt="Peak force against drop height for 2 kg on a 1 MN/m spring: 1.98 kN at 0.10 m and 4.43 kN at 0.50 m on a square-root curve, with the 20 N weight a line along the bottom."
      caption="Five times the drop is only 2.24 times the peak, and both dwarf the 20 N static weight."
    >
      <Axes box={b} xLabel="drop (m)" yLabel="peak force (kN)" />
      <line x1={b.px(0)} y1={b.py(0.02)} x2={b.px(0.7)} y2={b.py(0.02)} stroke={C.ink} strokeWidth={2.5} />
      <Label x={b.px(0.7)} y={b.py(0) - 14} anchor="end" size={15}>weight 20 N</Label>
      <line x1={b.px(0)} y1={b.py(0)} x2={b.px(0.5)} y2={b.py(F5)} stroke={C.alarm} strokeWidth={1.5} strokeDasharray="6 5" />
      <Label x={b.px(0.5) - 8} y={b.py(1.3)} anchor="end" tone="alarm" size={15}>if force ∝ height</Label>
      <path d={b.path(sample(Fk, 0, 0.66))} fill="none" stroke={C.accent} strokeWidth={3} />
      <Guide x1={b.px(0.1)} y1={b.py(Fk(0.1))} x2={b.px(0.1)} y2={b.py(0)} />
      <Guide x1={b.px(0.5)} y1={b.py(F5)} x2={b.px(0.5)} y2={b.py(0)} />
      <Dot x={b.px(0.1)} y={b.py(Fk(0.1))} />
      <Dot x={b.px(0.5)} y={b.py(F5)} />
      <Label x={b.px(0.1) - 8} y={b.py(Fk(0.1)) - 42} anchor="start" weight={600}>1.98 kN</Label>
      <Label x={b.px(0.5) - 12} y={b.py(F5) - 18} anchor="end" weight={600}>4.43 kN</Label>
      <Label x={b.px(0.1)} y={b.py(0) + 18} tone="muted" size={15}>0.10</Label>
      <Label x={b.px(0.5)} y={b.py(0) + 18} tone="muted" size={15}>0.50</Label>
    </Figure>
  );
}

/** Resonance: magnification vs frequency ratio, ζ = 0.05. */
function Resonance() {
  const b = plotBox({ x: 70, y: 40, w: 350, h: 190, xMin: 0, xMax: 2.2, yMin: 0, yMax: 11 });
  const z = 0.05;
  const M = (r: number) => 1 / Math.sqrt((1 - r * r) ** 2 + (2 * z * r) ** 2);
  return (
    <Figure
      height={275}
      alt="Motion divided by steady sag against drive-to-natural frequency ratio for damping 0.05: a sharp peak of about 10 at a ratio of 1, falling to 0.79 at 1.5, below the steady-sag line at 1."
      caption="On the match only damping caps the motion at about 10 times the steady sag; at 1.5 times the natural frequency it drops below the sag."
    >
      <Axes box={b} xLabel="drive ÷ natural" yLabel="motion ÷ steady sag" />
      <line x1={b.px(0)} y1={b.py(1)} x2={b.px(2.2)} y2={b.py(1)} stroke={C.muted} strokeWidth={1.5} strokeDasharray="6 5" />
      <Label x={b.px(2.2)} y={b.py(1) - 14} anchor="end" tone="muted" size={15}>steady sag</Label>
      <path d={b.path(sample(M, 0, 2.2, 440))} fill="none" stroke={C.accent} strokeWidth={3} />
      <Dot x={b.px(1)} y={b.py(M(1))} />
      <Dot x={b.px(1.5)} y={b.py(M(1.5))} />
      <Label x={b.px(1) + 14} y={b.py(M(1))} anchor="start" weight={600}>≈ 10× on the match</Label>
      <Label x={b.px(1.5)} y={b.py(M(1.5)) - 50} weight={600}>0.79 at 1.5</Label>
      <Guide x1={b.px(1.5)} y1={b.py(M(1.5)) - 38} x2={b.px(1.5)} y2={b.py(M(1.5)) - 8} />
      <Label x={b.px(2.2)} y={b.py(6)} anchor="end" tone="muted" size={15}>ζ = 0.05</Label>
      <Label x={b.px(1)} y={b.py(0) + 18} tone="muted" size={15}>1</Label>
      <Label x={b.px(1.5)} y={b.py(0) + 18} tone="muted" size={15}>1.5</Label>
    </Figure>
  );
}

/** Turn: 10 m/s on a 2 m and a 1 m boom. */
function Turn() {
  const cy = 150;
  const boom = (cx: number, r: number, acc: number, rLabel: string, aLabel: string) => {
    const mx = cx + r;
    return (
      <g>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.muted} strokeWidth={1.5} strokeDasharray="5 5" />
        <line x1={cx} y1={cy} x2={mx} y2={cy} stroke={C.muted} strokeWidth={2} />
        <circle cx={cx} cy={cy} r={5} fill={C.ink} />
        <Label x={cx + r / 2 - 4} y={cy + 20} size={15}>{rLabel}</Label>
        <Arrow x1={mx} y1={cy - 10} x2={mx} y2={cy - 60} tone="muted" width={2} />
        <Label x={mx + 6} y={cy - 76} anchor="start" tone="muted" size={15}>10 m/s</Label>
        <Arrow x1={mx - 10} y1={cy} x2={mx - 10 - acc} y2={cy} tone="accent" width={2.5} />
        <rect x={mx - 9} y={cy - 9} width={18} height={18} rx={3} fill={C.soft} stroke={C.ink} strokeWidth={2} />
        <Label x={cx} y={cy + r + 26} tone="accent" weight={600}>{aLabel}</Label>
      </g>
    );
  };
  return (
    <Figure
      height={295}
      alt="Two booms seen from above carrying a camera at a steady 10 m/s: on the 2 m boom the inward acceleration is 50 m/s², on the 1 m boom it is 100 m/s², drawn twice as long and pointing at the pivot."
      caption="Same 10 m/s, half the radius, twice the inward pull: steady speed is not zero acceleration."
    >
      {boom(120, 110, 25, "2 m", "50 m/s² inward")}
      {boom(365, 55, 50, "1 m", "100 m/s² inward")}
    </Figure>
  );
}

/* ---------- materials-201 ---------- */

/** Creep: time to 1% strain, base vs 2× stress vs +50 K. */
function CreepRate() {
  const base = 220;
  const full = 150;
  const bar = (cx: number, frac: number, top: string, l1: string, l2: string, hot: 0 | 1 | 2) => {
    const h = full * frac;
    return (
      <g>
        <rect x={cx - 35} y={base - h} width={70} height={h} fill={hot ? C.alarm : C.accent} fillOpacity={hot ? 0.8 : 0.8} />
        <Label x={cx} y={base - h - 16} weight={600} tone={hot ? "alarm" : "accent"}>{top}</Label>
        <Label x={cx} y={base + 20} size={15} tone={hot === 1 ? "alarm" : "ink"}>{l1}</Label>
        <Label x={cx} y={base + 42} size={15} tone={hot === 2 ? "alarm" : "ink"}>{l2}</Label>
      </g>
    );
  };
  return (
    <Figure
      height={275}
      alt="Bar chart of time to 1% strain for a hanger: the 800 K, 100 MPa case is full height, doubling stress to 200 MPa cuts it to one thirty-second, and raising temperature to 850 K cuts it to a tenth."
      caption="Double the stress and the life falls by 32; add 50 K and it falls to a tenth."
    >
      <Label x={30} y={28} anchor="start" tone="muted" size={15}>time to 1% strain</Label>
      <line x1={40} y1={base} x2={450} y2={base} stroke={C.ink} strokeWidth={2} />
      {bar(110, 1, "t", "100 MPa", "800 K", 0)}
      {bar(245, 1 / 32, "t ÷ 32", "200 MPa", "800 K", 1)}
      {bar(380, 1 / 10, "t ÷ 10", "100 MPa", "850 K", 2)}
    </Figure>
  );
}

/** Hardness: Vickers dent → 3 × HV estimate. */
function Hardness() {
  return (
    <Figure
      height={250}
      alt="A pyramid indenter pressed into a steel block leaving a 200 HV dent, with an arrow to the estimate UTS ≈ 3 × 200 = 600 MPa and a note that elongation is not measured."
      caption="The dent gives a strength guess by the factor of 3; it tells you nothing about how far the steel stretches."
    >
      <Arrow x1={145} y1={16} x2={145} y2={50} tone="ink" />
      <path d="M115,58 L175,58 L145,134 Z" fill={C.muted} fillOpacity={0.4} stroke={C.ink} strokeWidth={2} />
      <path d="M40,120 L127,120 L145,134 L163,120 L250,120 L250,220 L40,220 Z" fill={C.soft} stroke={C.ink} strokeWidth={2} />
      <Label x={145} y={176} weight={600}>200 HV</Label>
      <Arrow x1={262} y1={120} x2={292} y2={120} tone="accent" width={2.5} />
      <Label x={300} y={108} anchor="start">UTS ≈ 3 × 200</Label>
      <Label x={300} y={134} anchor="start" tone="accent" size={20} weight={600}>≈ 600 MPa</Label>
      <Label x={300} y={186} anchor="start" tone="muted" size={15}>elongation:</Label>
      <Label x={300} y={206} anchor="start" tone="alarm" size={15}>not measured</Label>
    </Figure>
  );
}

/** Leak before break: critical crack vs 8 mm wall. */
function Leak() {
  const x0 = 40;
  const s = 400 / 30; // px per mm
  const X = (mm: number) => x0 + mm * s;
  return (
    <Figure
      height={255}
      alt="A scale from 0 to 30 mm with the 8 mm pipe wall shaded; the critical crack is 28 mm at toughness 50, beyond the wall, and 7.0 mm at toughness 25, inside the wall."
      caption="If the critical crack is longer than the wall, the crack gets through and weeps first; if it fits inside, the wall can burst."
    >
      <rect x={X(0)} y={70} width={X(8) - X(0)} height={70} fill={C.soft} stroke={C.ink} strokeWidth={2} />
      <path d={`M${X(0)},118 L${X(0) + 10},114 L${X(0) + 18},120 L${X(0) + 28},116`} fill="none" stroke={C.ink} strokeWidth={2.5} />
      <Label x={(X(0) + X(8)) / 2} y={92} size={15}>wall</Label>
      <line x1={X(7)} y1={58} x2={X(7)} y2={150} stroke={C.alarm} strokeWidth={3} />
      <Label x={X(7) - 4} y={44} anchor="end" tone="alarm" weight={600}>7.0 mm</Label>
      <line x1={X(28)} y1={58} x2={X(28)} y2={150} stroke={C.accent} strokeWidth={3} />
      <Label x={X(28)} y={44} tone="accent" weight={600}>28 mm</Label>
      <line x1={X(0)} y1={160} x2={X(30)} y2={160} stroke={C.ink} strokeWidth={1.5} />
      {[0, 8, 20, 30].map((v) => (
        <g key={v}>
          <line x1={X(v)} y1={154} x2={X(v)} y2={166} stroke={C.ink} strokeWidth={1.5} />
          <Label x={X(v)} y={180} tone="muted" size={15}>{v === 30 ? "30 mm" : String(v)}</Label>
        </g>
      ))}
      <Label x={x0} y={212} anchor="start" tone="accent" size={15}>K 50 → 28 mm, past the wall: leaks first</Label>
      <Label x={x0} y={236} anchor="start" tone="alarm" size={15}>K 25 → 7.0 mm, inside the wall: can burst</Label>
    </Figure>
  );
}

/** Thinning: 20 × 6 link to 20 × 4 after 20 years at 8 kN. */
function Thinning() {
  const s = 8;
  return (
    <Figure
      height={250}
      alt="Cross-sections of a steel link: today 20 by 6 mm, 120 mm², 67 MPa; after 20 years 20 by 4 mm, 80 mm², 100 MPa; the same 8 kN in both."
      caption="The load never changed; 2 mm of corrosion took a third of the area, so the stress rose from 67 to 100 MPa."
    >
      <Label x={130} y={22} weight={600}>today</Label>
      <rect x={50} y={80} width={20 * s} height={6 * s} fill={C.soft} stroke={C.ink} strokeWidth={2} />
      <Label x={130} y={104} size={15}>6 mm</Label>
      <Label x={130} y={150}>120 mm²</Label>
      <Label x={130} y={176} tone="accent" weight={600}>67 MPa</Label>

      <Label x={350} y={22} weight={600}>after 20 years</Label>
      <rect x={270} y={80} width={20 * s} height={6 * s} fill="none" stroke={C.muted} strokeWidth={1.5} strokeDasharray="5 4" />
      <rect x={270} y={88} width={20 * s} height={4 * s} fill={C.soft} stroke={C.ink} strokeWidth={2} />
      <Label x={350} y={104} size={15}>4 mm</Label>
      <Label x={350} y={150}>80 mm²</Label>
      <Label x={350} y={176} tone="alarm" weight={600}>100 MPa</Label>
      <DimH x1={50} x2={210} y={64} label="20 mm" />
      <DimH x1={270} x2={430} y={64} label="20 mm" />
      <Label x={240} y={224} tone="muted" size={15}>same 8 kN on both</Label>
    </Figure>
  );
}

/** Diffusion: x = √(Dt), D = 0.25 mm²/h. */
function Diffuse() {
  const b = plotBox({ x: 70, y: 40, w: 350, h: 190, xMin: 0, xMax: 20, yMin: 0, yMax: 2.4 });
  const x = (t: number) => Math.sqrt(0.25 * t);
  return (
    <Figure
      height={275}
      alt="Case depth against time for D = 0.25 mm²/h: 1 mm at 4 hours, only 1.4 mm at 8 hours, and 2 mm at 16 hours on a square-root curve."
      caption="Twice the depth costs four times the hours: 16 h for 2 mm, while 8 h only reaches about 1.4 mm."
    >
      <Axes box={b} xLabel="time (h)" yLabel="depth (mm)" />
      <path d={b.path(sample(x, 0, 19.5))} fill="none" stroke={C.accent} strokeWidth={3} />
      {[4, 8, 16].map((t) => (
        <g key={t}>
          <Guide x1={b.px(t)} y1={b.py(x(t))} x2={b.px(t)} y2={b.py(0)} />
          <Label x={b.px(t)} y={b.py(0) + 18} tone="muted" size={15}>{String(t)}</Label>
        </g>
      ))}
      <Dot x={b.px(4)} y={b.py(1)} />
      <Dot x={b.px(8)} y={b.py(x(8))} tone="alarm" hollow />
      <Dot x={b.px(16)} y={b.py(2)} />
      <Label x={b.px(4) - 12} y={b.py(1) - 6} anchor="end" weight={600}>1 mm</Label>
      <Label x={b.px(8) - 8} y={b.py(x(8)) - 22} anchor="end" tone="alarm" weight={600}>1.4 mm</Label>
      <Label x={b.px(16) - 12} y={b.py(2) - 18} anchor="end" weight={600}>2 mm</Label>
      <Label x={90} y={62} anchor="start" tone="muted" size={15}>D = 0.25 mm²/h</Label>
    </Figure>
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
  const dots = [];
  for (let y = cy - R; y <= cy + R; y += 9) {
    for (let x = cx - R; x <= cx + R; x += 9) {
      const jx = x + ((y / 9) % 2 ? 4.5 : 0);
      if ((jx - cx) ** 2 + (y - cy) ** 2 < (R - 3) ** 2 && (jx - ox) ** 2 + (y - oy) ** 2 > fatigueR ** 2)
        dots.push(<circle key={`${jx}-${y}`} cx={jx} cy={y} r={1.6} fill={C.muted} />);
    }
  }
  return (
    <Figure
      height={290}
      alt="End view of a broken shaft: a smooth thumbnail from a surface origin with curved beach marks over about two thirds of the face, and a dull fibrous patch over the last third."
      caption="The beach marks bowing out from the origin say fatigue; the dull patch is only how it finished."
    >
      <defs>
        <clipPath id="ladA-face">
          <circle cx={cx} cy={cy} r={R} />
        </clipPath>
      </defs>
      <circle cx={cx} cy={cy} r={R} fill={C.line} fillOpacity={0.5} />
      {dots}
      <g clipPath="url(#ladA-face)">
        <circle cx={ox} cy={oy} r={fatigueR} fill={C.soft} stroke={C.ink} strokeWidth={2} />
        {[35, 65, 95, 125].map((r) => (
          <circle key={r} cx={ox} cy={oy} r={r} fill="none" stroke={C.accent} strokeWidth={1.8} />
        ))}
      </g>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={C.ink} strokeWidth={2.5} />
      <circle cx={ox} cy={oy} r={5} fill={C.alarm} />

      <line x1={ox + 6} y1={oy} x2={318} y2={oy} stroke={C.muted} strokeWidth={1.2} />
      <Label x={324} y={oy} anchor="start" tone="alarm" weight={600}>origin</Label>
      <line x1={cx + 70} y1={110} x2={318} y2={110} stroke={C.muted} strokeWidth={1.2} />
      <Label x={324} y={100} anchor="start" size={15}>beach marks:</Label>
      <Label x={324} y={122} anchor="start" tone="accent" weight={600}>fatigue</Label>
      <line x1={cx + 50} y1={225} x2={318} y2={225} stroke={C.muted} strokeWidth={1.2} />
      <Label x={324} y={215} anchor="start" size={15}>dull patch:</Label>
      <Label x={324} y={237} anchor="start" weight={600}>final overload</Label>
    </Figure>
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
