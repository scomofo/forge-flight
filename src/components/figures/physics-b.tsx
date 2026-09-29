import { Arrow, Axes, C, DimH, DimV, Figure, Ground, Label, WallV, plotBox, type FigureMap } from "./kit";

/* ---------- local helpers ---------- */

const rad = (d: number) => (d * Math.PI) / 180;

/**
 * Circular arc arrow around (cx, cy). Angles in degrees, SVG sense (0 = right,
 * 90 = down). Going from a0 to a1 with a1 < a0 draws counterclockwise on screen.
 */
function ArcArrow({
  cx,
  cy,
  r,
  a0,
  a1,
  tone = "accent",
  width = 2.5,
}: {
  cx: number;
  cy: number;
  r: number;
  a0: number;
  a1: number;
  tone?: "ink" | "accent" | "muted" | "alarm";
  width?: number;
}) {
  const p = (a: number) => `${(cx + r * Math.cos(rad(a))).toFixed(1)},${(cy + r * Math.sin(rad(a))).toFixed(1)}`;
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  const sweep = a1 > a0 ? 1 : 0;
  return (
    <path
      d={`M${p(a0)} A${r},${r} 0 ${large} ${sweep} ${p(a1)}`}
      fill="none"
      stroke={C[tone]}
      strokeWidth={width}
      markerEnd={`url(#fig-arrow-${tone})`}
    />
  );
}

/** Sample a function into [x, y] pairs. */
function sample(f: (x: number) => number, x0: number, x1: number, n = 120): Array<[number, number]> {
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n;
    pts.push([x, f(x)]);
  }
  return pts;
}

/* ---------- Week 6 ---------- */

/** 16: wrench on a lug nut — perpendicular pull vs 60° pull. */
function Torque() {
  const bx = 90;
  const by = 180;
  const fx = 400;
  const hexPts = Array.from({ length: 6 }, (_, i) => {
    const a = rad(60 * i + 30);
    return `${(bx + 16 * Math.cos(a)).toFixed(1)},${(by + 16 * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
  return (
    <Figure
      height={250}
      alt="A 0.25 m wrench on a lug nut with a 400 N pull perpendicular to the handle giving 100 N·m, and a dashed pull at 60° giving 86.6 N·m, short of the 110 N·m spec."
      caption="Only the part of the pull across the handle turns the nut: at 90° you get 100 N·m, at 60° only 86.6 N·m — both short of 110."
    >
      <Label x={24} y={34} anchor="start" size={18} serif>τ = rF sin θ</Label>
      <Label x={24} y={64} anchor="start" tone="accent" weight={600}>90°: 100 N·m</Label>
      <Label x={24} y={90} anchor="start" tone="muted">60°: 86.6 N·m</Label>
      <Label x={24} y={116} anchor="start" tone="alarm">spec: 110 N·m</Label>

      {/* wrench */}
      <rect x={bx} y={by - 10} width={fx - bx + 10} height={20} rx={5} fill={C.soft} stroke={C.ink} strokeWidth={2} />
      <circle cx={bx} cy={by} r={28} fill={C.soft} stroke={C.ink} strokeWidth={2} />
      <polygon points={hexPts} fill={C.surface} stroke={C.ink} strokeWidth={2} />
      <ArcArrow cx={bx} cy={by} r={44} a0={240} a1={125} tone="accent" />

      {/* arm extension + 60° angle */}
      <line x1={fx} y1={by} x2={fx + 60} y2={by} stroke={C.muted} strokeWidth={1.5} strokeDasharray="4 4" />
      <ArcArrow cx={fx} cy={by} r={34} a0={0} a1={-57} tone="muted" width={1.5} />
      <Label x={442} y={150} anchor="start" tone="muted" size={15}>60°</Label>
      <Arrow x1={fx} y1={by} x2={fx + 55} y2={by - 95} tone="muted" dashed />

      {/* perpendicular pull */}
      <Arrow x1={fx} y1={by} x2={fx} y2={70} tone="accent" width={3.5} />
      <Label x={388} y={80} anchor="end" tone="accent" weight={600}>400 N</Label>

      <DimH x1={bx} x2={fx} y={232} label="r = 0.25 m" />
    </Figure>
  );
}

/** 17: same mass and radius, disk vs hoop, same torque. */
function Rotation() {
  const cy = 125;
  const R = 70;
  const disk = 130;
  const hoop = 350;
  return (
    <Figure
      height={290}
      alt="A solid disk and a hoop, both 2 kg and 0.10 m radius, each driven by 0.05 N·m; the disk has I = 0.01 kg·m² and α = 5 rad/s², the hoop I = 0.02 kg·m² and α = 2.5 rad/s²."
      caption="Same mass, same radius, same torque — the hoop keeps all its mass at the rim, so it has double the inertia and spins up half as fast."
    >
      <Label x={240} y={22} tone="muted" size={15}>each: 2 kg, r = 0.10 m, τ = 0.05 N·m</Label>

      <circle cx={disk} cy={cy} r={R} fill={C.soft} stroke={C.ink} strokeWidth={2} />
      <circle cx={disk} cy={cy} r={4} fill={C.ink} />
      <line x1={disk} y1={cy} x2={disk + R} y2={cy} stroke={C.muted} strokeWidth={1.5} />
      <ArcArrow cx={disk} cy={cy} r={R + 16} a0={235} a1={125} />

      <circle cx={hoop} cy={cy} r={R - 5} fill="none" stroke={C.ink} strokeWidth={10} />
      <circle cx={hoop} cy={cy} r={4} fill={C.ink} />
      <line x1={hoop} y1={cy} x2={hoop + R - 10} y2={cy} stroke={C.muted} strokeWidth={1.5} />
      <ArcArrow cx={hoop} cy={cy} r={R + 16} a0={235} a1={125} />

      <Label x={disk} y={226}>solid disk</Label>
      <Label x={hoop} y={226}>hoop</Label>
      <Label x={disk} y={252} size={15}>I = ½mr² = 0.01 kg·m²</Label>
      <Label x={hoop} y={252} size={15}>I = mr² = 0.02 kg·m²</Label>
      <Label x={disk} y={276} tone="accent" weight={600}>α = 5 rad/s²</Label>
      <Label x={hoop} y={276} tone="accent" weight={600}>α = 2.5 rad/s²</Label>
    </Figure>
  );
}

/** 18: simply supported 6 m beam, 800 N at 2 m and 400 N at 5 m. */
function Equilibrium() {
  const x0 = 40;
  const s = 400 / 6;
  const X = (m: number) => x0 + m * s;
  const top = 120;
  const bot = 136;
  return (
    <Figure
      height={305}
      alt="A 6 m beam with a pin at the left and a roller at the right, loaded by 800 N at 2 m and 400 N at 5 m, with both support reactions pointing up at 600 N."
      caption="Take moments about the pin and A_y drops out: B_y × 6 = 800 × 2 + 400 × 5, so B_y = 600 N, and A_y is the other 600 N."
    >
      {/* loads */}
      <Arrow x1={X(2)} y1={42} x2={X(2)} y2={top - 2} tone="ink" width={3} />
      <Label x={X(2)} y={26} weight={600}>800 N</Label>
      <Arrow x1={X(5)} y1={62} x2={X(5)} y2={top - 2} tone="ink" width={3} />
      <Label x={X(5)} y={46} weight={600}>400 N</Label>

      {/* beam */}
      <rect x={X(0)} y={top} width={400} height={bot - top} fill={C.soft} stroke={C.ink} strokeWidth={2} />

      {/* pin */}
      <polygon points={`${X(0)},${bot} ${X(0) - 16},${bot + 26} ${X(0) + 16},${bot + 26}`} fill={C.surface} stroke={C.ink} strokeWidth={2} />
      <circle cx={X(0)} cy={bot + 4} r={3} fill={C.ink} />
      {/* roller */}
      <circle cx={X(6)} cy={bot + 13} r={12} fill={C.surface} stroke={C.ink} strokeWidth={2} />
      <line x1={X(6) - 20} y1={bot + 26} x2={X(6) + 20} y2={bot + 26} stroke={C.ink} strokeWidth={2} />
      <line x1={X(0) - 20} y1={bot + 26} x2={X(0) + 20} y2={bot + 26} stroke={C.ink} strokeWidth={2} />

      {/* reactions */}
      <Arrow x1={X(0)} y1={228} x2={X(0)} y2={bot + 32} tone="accent" width={3.5} />
      <Arrow x1={X(6)} y1={228} x2={X(6)} y2={bot + 32} tone="accent" width={3.5} />
      <Label x={24} y={246} anchor="start" tone="accent" weight={600}>A_y = 600 N</Label>
      <Label x={456} y={246} anchor="end" tone="accent" weight={600}>B_y = 600 N</Label>
      <Label x={X(0) + 28} y={bot + 16} anchor="start" tone="muted" size={15}>pin</Label>
      <Label x={X(6) - 28} y={bot + 16} anchor="end" tone="muted" size={15}>roller</Label>

      <DimH x1={X(0)} x2={X(2)} y={290} label="2 m" />
      <DimH x1={X(2)} x2={X(5)} y={290} label="3 m" />
      <DimH x1={X(5)} x2={X(6)} y={290} label="1 m" />
    </Figure>
  );
}

/* ---------- Week 7 ---------- */

/** 19: 10 mm rod, 2 m long, 15 kN hanging load. */
function Elastic() {
  return (
    <Figure
      height={300}
      alt="A 10 mm steel rod 2 m long hanging from a ceiling with a 15 kN load, next to its circular cross-section and the results: stress 191 MPa against a 250 MPa yield, stretch 1.91 mm."
      caption="Divide the load by the area: 15 kN over 7.85×10⁻⁵ m² is 191 MPa — under yield — and the 2 m rod stretches 1.91 mm."
    >
      <Ground x={70} y={40} w={120} side="above" />
      <rect x={125} y={40} width={10} height={170} fill={C.soft} stroke={C.ink} strokeWidth={2} />
      <rect x={95} y={210} width={70} height={40} rx={3} fill={C.soft} stroke={C.ink} strokeWidth={2} />
      <Arrow x1={130} y1={252} x2={130} y2={292} tone="accent" width={3} />
      <Label x={142} y={278} anchor="start" tone="accent" weight={600}>F = 15 kN</Label>
      <DimV x={60} y1={40} y2={210} label="2 m" />

      <circle cx={262} cy={78} r={24} fill={C.soft} stroke={C.ink} strokeWidth={2} />
      <line x1={238} y1={78} x2={286} y2={78} stroke={C.muted} strokeWidth={1.5} />
      <Label x={298} y={78} anchor="start" size={15}>Ø10 mm</Label>
      <Label x={236} y={128} anchor="start" size={15}>A = 7.85×10⁻⁵ m²</Label>
      <Label x={236} y={162} anchor="start" tone="accent" size={18} weight={600}>σ = F/A = 191 MPa</Label>
      <Label x={236} y={188} anchor="start" tone="muted" size={15}>mild-steel yield ≈ 250 MPa</Label>
      <Label x={236} y={228} anchor="start" tone="accent" weight={600}>δ = FL/AE = 1.91 mm</Label>
      <Label x={236} y={254} anchor="start" tone="muted" size={15}>strain ε ≈ 0.001</Label>
    </Figure>
  );
}

/** 20: cantilevered steel ruler, 300 mm, 5 N at the tip. */
function Bending() {
  const x0 = 50;
  const L = 370;
  const y0 = 90;
  const tip = 60; // exaggerated droop in px
  const shape = (xi: number) => (xi * xi * (3 - xi)) / 2;
  const pts: Array<[number, number]> = sample((xi) => y0 + tip * shape(xi), 0, 1, 60).map(([xi, y]) => [x0 + xi * L, y]);
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  return (
    <Figure
      height={260}
      alt="A steel ruler clamped at a wall and sticking out 300 mm, bending down 13.5 mm under 5 N at the tip, with tension on its top surface and compression on its bottom at the root."
      caption="The top face stretches and the bottom squeezes; depth is the lever — I = bh³/12, so halving the 2 mm thickness makes the droop eightfold."
    >
      <WallV x={x0} y={40} h={130} side="left" />
      <DimH x1={x0} x2={x0 + L} y={30} label="300 mm" />
      <line x1={x0} y1={y0} x2={x0 + L + 10} y2={y0} stroke={C.muted} strokeWidth={1.5} strokeDasharray="5 5" />
      <path d={d} fill="none" stroke={C.ink} strokeWidth={9} strokeLinecap="butt" />

      {/* tension / compression at the root */}
      <Arrow x1={118} y1={70} x2={78} y2={70} tone="accent" width={2} />
      <Arrow x1={126} y1={70} x2={166} y2={70} tone="accent" width={2} />
      <Label x={176} y={62} anchor="start" tone="accent" size={15}>tension</Label>
      <Arrow x1={70} y1={114} x2={108} y2={114} tone="alarm" width={2} />
      <Arrow x1={176} y1={116} x2={136} y2={116} tone="alarm" width={2} />
      <Label x={186} y={124} anchor="start" tone="alarm" size={15}>compression</Label>

      {/* tip load and droop */}
      <Arrow x1={x0 + L} y1={y0 + tip + 6} x2={x0 + L} y2={y0 + tip + 56} tone="accent" width={3} />
      <Label x={x0 + L - 12} y={y0 + tip + 44} anchor="end" tone="accent" weight={600}>5 N</Label>
      <Label x={430} y={112} anchor="end" tone="accent" size={15}>δ = 13.5 mm</Label>
      <Arrow x1={448} y1={y0 + 2} x2={448} y2={y0 + tip - 2} tone="accent" width={1.5} both />

      <Label x={24} y={200} anchor="start" size={15}>25 × 2 mm: I = 1.67×10⁻¹¹ m⁴</Label>
      <Label x={24} y={226} anchor="start" size={15}>root σ = My/I = 90 MPa</Label>
    </Figure>
  );
}

/** 21: factor of safety — load bar and stress bar at the same ratio. */
function Fos() {
  const x0 = 40;
  const W = 400;
  const f = 12 / 45;
  const cut = x0 + W * f;
  const Bar = ({ y, used, spare }: { y: number; used: string; spare: string }) => (
    <g>
      <rect x={x0} y={y} width={W} height={38} rx={3} fill={C.soft} stroke={C.ink} strokeWidth={2} />
      <rect x={x0} y={y} width={W * f} height={38} rx={3} fill={C.accent} />
      <Label x={(x0 + cut) / 2} y={y + 19} weight={600}>
        <tspan fill={C.surface}>{used}</tspan>
      </Label>
      <Label x={(cut + x0 + W) / 2} y={y + 19} tone="muted" size={15}>{spare}</Label>
    </g>
  );
  return (
    <Figure
      height={260}
      alt="Two bars on the same scale: the load bar shows 12 kN used of a 45 kN ultimate, and the stress bar shows 200 MPa allowable of a 750 MPa ultimate, both at a factor of safety of 3.75."
      caption="The 33 kN left over is the margin for unknown loads, materials and models — and it is the same 3.75 whether you speak in load or stress."
    >
      <Label x={x0} y={28} anchor="start" size={15} tone="muted">load</Label>
      <Label x={x0 + W} y={28} anchor="end" size={15}>ultimate 45 kN</Label>
      <Bar y={42} used="12 kN" spare="33 kN margin" />

      <Label x={x0} y={122} anchor="start" size={15} tone="muted">stress (60 mm²)</Label>
      <Label x={x0 + W} y={122} anchor="end" size={15}>ultimate 750 MPa</Label>
      <Bar y={136} used="200 MPa" spare="allowable = 750 / 3.75" />

      <line x1={cut} y1={36} x2={cut} y2={184} stroke={C.ink} strokeWidth={1.5} strokeDasharray="4 4" />
      <Label x={240} y={226} size={20} serif tone="accent" weight={600}>n = 45 / 12 = 3.75</Label>
    </Figure>
  );
}

/* ---------- Week 8 ---------- */

/** 22: pressure at 10 m depth, and the linear profile. */
function Pressure() {
  const surf = 60;
  const deep = 220;
  const px = 170;
  const arrows = Array.from({ length: 8 }, (_, i) => {
    const a = rad(45 * i);
    const c = Math.cos(a);
    const s = Math.sin(a);
    return <Arrow key={i} x1={px + 40 * c} y1={deep + 40 * s} x2={px + 12 * c} y2={deep + 12 * s} tone="accent" width={2} />;
  });
  return (
    <Figure
      height={290}
      alt="A water tank with a point 10 m below the surface pushed on equally from all directions, and a pressure profile beside it rising linearly from zero at the surface to 98.1 kPa at 10 m."
      caption="Pressure is the weight of the water column above: it grows in a straight line with depth and pushes equally from every side."
    >
      <rect x={30} y={surf} width={260} height={220} fill={C.soft} stroke={C.ink} strokeWidth={2} />
      <line x1={30} y1={surf} x2={290} y2={surf} stroke={C.accent} strokeWidth={2.5} />
      <polygon points={`236,${surf - 16} 252,${surf - 16} 244,${surf - 4}`} fill={C.accent} />
      <DimV x={60} y1={surf} y2={deep} label="10 m" />
      {arrows}
      <circle cx={px} cy={deep} r={6} fill={C.ink} />
      <Label x={218} y={186} anchor="start" tone="accent" weight={600}>98.1 kPa</Label>

      {/* profile */}
      <polygon points={`330,${surf} 330,${deep} 440,${deep}`} fill={C.soft} stroke={C.accent} strokeWidth={2} />
      <line x1={330} y1={surf} x2={330} y2={deep + 10} stroke={C.ink} strokeWidth={1.5} />
      <line x1={290} y1={deep} x2={330} y2={deep} stroke={C.muted} strokeWidth={1} strokeDasharray="3 4" />
      <Label x={342} y={surf + 2} anchor="start" size={15} tone="muted">0</Label>
      <Label x={432} y={deep + 20} size={15} tone="accent">98.1 kPa</Label>
      <Label x={385} y={30} serif size={18}>p = ρgh</Label>
    </Figure>
  );
}

/** 23: Venturi — 10 cm to 5 cm, 1.0 to 4.0 m/s, 7.5 kPa drop. */
function MovingFluids() {
  const cy = 200;
  const top = `20,150 150,150 200,175 310,175 370,150 460,150`;
  const bot = `460,250 370,250 310,225 200,225 150,250 20,250`;
  return (
    <Figure
      height={290}
      alt="A horizontal pipe narrowing from 10 cm to 5 cm diameter, water speeding from 1.0 m/s to 4.0 m/s, with two standpipes showing the throat pressure 7.5 kPa lower than the inlet."
      caption="A quarter of the area means four times the speed, and the push for that speed-up comes from a 7.5 kPa pressure drop in the throat."
    >
      {/* standpipes */}
      <rect x={83} y={50} width={14} height={100} fill={C.soft} />
      <rect x={248} y={110} width={14} height={65} fill={C.soft} />
      <polyline points="83,30 83,150" fill="none" stroke={C.ink} strokeWidth={1.5} />
      <polyline points="97,30 97,150" fill="none" stroke={C.ink} strokeWidth={1.5} />
      <polyline points="248,30 248,175" fill="none" stroke={C.ink} strokeWidth={1.5} />
      <polyline points="262,30 262,175" fill="none" stroke={C.ink} strokeWidth={1.5} />
      <line x1={97} y1={50} x2={330} y2={50} stroke={C.muted} strokeWidth={1.5} strokeDasharray="4 4" />
      <line x1={262} y1={110} x2={330} y2={110} stroke={C.muted} strokeWidth={1.5} strokeDasharray="4 4" />
      <DimV x={318} y1={50} y2={110} label="Δp = 7.5 kPa" tone="accent" />

      {/* pipe */}
      <polygon points={`${top} ${bot}`} fill={C.soft} stroke="none" />
      <polyline points={top} fill="none" stroke={C.ink} strokeWidth={2.5} />
      <polyline points={bot} fill="none" stroke={C.ink} strokeWidth={2.5} />
      <rect x={84.5} y={146} width={11} height={8} fill={C.soft} />
      <rect x={249.5} y={171} width={11} height={8} fill={C.soft} />

      <Arrow x1={38} y1={cy} x2={60} y2={cy} tone="accent" width={3} />
      <Label x={68} y={cy} anchor="start" tone="accent" weight={600}>1.0 m/s</Label>
      <Arrow x1={215} y1={cy} x2={295} y2={cy} tone="accent" width={3} />
      <Label x={255} y={244} tone="accent" weight={600}>4.0 m/s</Label>
      <Label x={85} y={272} tone="muted" size={15}>Ø10 cm</Label>
      <Label x={255} y={272} tone="muted" size={15}>Ø5 cm</Label>
    </Figure>
  );
}

/** 24: lift curve with cruise point and stall. */
function Lift() {
  const b = plotBox({ x: 60, y: 44, w: 370, h: 186, xMin: 0, xMax: 25, yMin: 0, yMax: 1.3 });
  const a = 4.25 * (Math.PI / 180); // per degree
  const x1 = 11;
  const d = (2 * (1.1 - a * x1)) / a;
  const k = a / (2 * d);
  const peak = x1 + d;
  const CL = (al: number) =>
    al <= x1 ? a * al : al <= peak ? 1.1 - k * (peak - al) ** 2 : 1.1 - 0.022 * (al - peak) ** 2;
  const aCruise = 0.6 / a;
  return (
    <Figure
      height={280}
      alt="The glider's lift coefficient rising in a straight line with angle of attack at slope 4.25 per radian, a cruise point at C_L 0.6, and a peak at C_Lmax 1.1 where the wing stalls and lift falls away."
      caption="C_L climbs with angle of attack until the flow lets go at C_Lmax = 1.1; that ceiling is what sets the 7.8 m/s stall speed."
    >
      <Axes box={b} xLabel="angle of attack α" yLabel="C_L" />
      <line x1={b.x} y1={b.py(1.1)} x2={b.px(peak)} y2={b.py(1.1)} stroke={C.muted} strokeWidth={1.5} strokeDasharray="4 4" />
      <line x1={b.x} y1={b.py(0.6)} x2={b.px(aCruise)} y2={b.py(0.6)} stroke={C.muted} strokeWidth={1.5} strokeDasharray="4 4" />
      <Label x={b.x - 8} y={b.py(1.1)} anchor="end" tone="muted" size={15}>1.1</Label>
      <Label x={b.x - 8} y={b.py(0.6)} anchor="end" tone="muted" size={15}>0.6</Label>
      <path d={b.path(sample(CL, 0, 23.5))} fill="none" stroke={C.accent} strokeWidth={3} />
      <circle cx={b.px(aCruise)} cy={b.py(0.6)} r={5.5} fill={C.accent} />
      <circle cx={b.px(peak)} cy={b.py(1.1)} r={5.5} fill={C.alarm} />
      <Label x={b.px(aCruise) + 14} y={b.py(0.6) + 18} anchor="start" size={15}>cruise, 9 m/s</Label>
      <Label x={b.px(peak) - 12} y={b.py(1.1) - 20} anchor="end" tone="alarm" size={15}>stall · v ≈ 7.8 m/s</Label>
      <Label x={b.px(9)} y={b.py(0.28)} anchor="start" tone="muted" size={15}>slope a = 4.25 /rad</Label>
    </Figure>
  );
}

/* ---------- Week 9 ---------- */

/** 25: spring–mass and its displacement trace. */
function Shm() {
  const b = plotBox({ x: 160, y: 40, w: 280, h: 170, xMin: 0, xMax: 2.2, yMin: -0.12, yMax: 0.12 });
  const w = Math.sqrt(40);
  const T = (2 * Math.PI) / w;
  const x = (t: number) => -0.1 * Math.cos(w * t);
  const zig = Array.from({ length: 9 }, (_, i) => `${i % 2 ? 56 : 84},${56 + i * 10}`).join(" ");
  return (
    <Figure
      height={260}
      alt="A 0.50 kg mass on a 20 N/m spring beside its displacement plotted against time: a cosine of amplitude 0.10 m repeating every 0.99 s, passing the middle at 0.63 m/s."
      caption="Stiffness and mass alone set the beat: ω = √(20/0.50) ≈ 6.32 rad/s, so one bounce every 0.99 s whatever the amplitude."
    >
      {/* spring and mass */}
      <Ground x={30} y={36} w={80} side="above" />
      <polyline points={`70,36 70,50 ${zig} 70,146 70,152`} fill="none" stroke={C.ink} strokeWidth={2} />
      <rect x={40} y={152} width={60} height={36} rx={3} fill={C.soft} stroke={C.ink} strokeWidth={2} />
      <Label x={70} y={170} size={15}>0.50 kg</Label>
      <Label x={70} y={212} size={15} tone="muted">k = 20 N/m</Label>

      {/* axes through x = 0 */}
      <Arrow x1={b.x} y1={b.py(0)} x2={b.x + b.w + 14} y2={b.py(0)} tone="ink" width={1.5} />
      <Arrow x1={b.x} y1={b.py(-0.12)} x2={b.x} y2={b.y - 10} tone="ink" width={1.5} />
      <Label x={472} y={b.py(0) - 16} anchor="end" tone="muted" size={15}>t (s)</Label>
      <Label x={b.x - 8} y={b.py(0.1)} anchor="end" tone="muted" size={15}>0.10</Label>
      <Label x={b.x - 8} y={b.py(-0.1)} anchor="end" tone="muted" size={15}>−0.10</Label>
      <line x1={b.x - 4} y1={b.py(0.1)} x2={b.x + 4} y2={b.py(0.1)} stroke={C.ink} strokeWidth={1.5} />
      <line x1={b.x - 4} y1={b.py(-0.1)} x2={b.x + 4} y2={b.py(-0.1)} stroke={C.ink} strokeWidth={1.5} />
      <Label x={b.x - 8} y={b.py(0)} anchor="end" tone="muted" size={15}>x (m)</Label>

      <path d={b.path(sample(x, 0, 2.2, 160))} fill="none" stroke={C.accent} strokeWidth={3} />
      <DimH x1={b.px(T / 2)} x2={b.px(1.5 * T)} y={b.py(0.1) - 14} label="T ≈ 0.99 s" tone="ink" />
      <circle cx={b.px(T / 4)} cy={b.py(0)} r={5} fill={C.accent} />
      <line x1={b.px(T / 4)} y1={b.py(0) + 6} x2={b.px(T / 4)} y2={228} stroke={C.accent} strokeWidth={1} strokeDasharray="3 3" />
      <Label x={b.px(T / 4) - 6} y={242} anchor="start" tone="accent" size={15}>v_max ≈ 0.63 m/s through the middle</Label>
    </Figure>
  );
}

/** 26: magnification curve for ζ = 0.05. */
function ResWaves() {
  const b = plotBox({ x: 60, y: 40, w: 380, h: 190, xMin: 0, xMax: 2, yMin: 0, yMax: 11 });
  const z = 0.05;
  const M = (r: number) => 1 / Math.sqrt((1 - r * r) ** 2 + (2 * z * r) ** 2);
  return (
    <Figure
      height={280}
      alt="Response magnification against frequency ratio for 5% damping: a sharp peak of 10 at r = 1, and 2.7 at r = 0.8."
      caption="Driven right at its natural frequency the machine moves ten times its static deflection; 20% off, only 2.7 times."
    >
      <Axes box={b} xLabel="r = ω/ωₙ" yLabel="X ÷ static" />
      <line x1={b.x} y1={b.py(10)} x2={b.px(1)} y2={b.py(10)} stroke={C.muted} strokeWidth={1.5} strokeDasharray="4 4" />
      <line x1={b.x} y1={b.py(1)} x2={b.px(2)} y2={b.py(1)} stroke={C.muted} strokeWidth={1} strokeDasharray="2 5" />
      <line x1={b.px(0.8)} y1={b.py(M(0.8))} x2={b.px(0.8)} y2={b.y + b.h} stroke={C.muted} strokeWidth={1.5} strokeDasharray="4 4" />
      <line x1={b.px(1)} y1={b.py(10)} x2={b.px(1)} y2={b.y + b.h} stroke={C.muted} strokeWidth={1.5} strokeDasharray="4 4" />
      <Label x={b.x - 8} y={b.py(10)} anchor="end" tone="muted" size={15}>10</Label>
      <Label x={b.x - 8} y={b.py(1)} anchor="end" tone="muted" size={15}>1</Label>
      <Label x={b.px(0.8)} y={b.y + b.h + 18} tone="muted" size={15}>0.8</Label>
      <Label x={b.px(1)} y={b.y + b.h + 18} tone="muted" size={15}>1</Label>

      <path d={b.path(sample(M, 0, 2, 400))} fill="none" stroke={C.accent} strokeWidth={3} />
      <circle cx={b.px(1)} cy={b.py(10)} r={5.5} fill={C.alarm} />
      <circle cx={b.px(0.8)} cy={b.py(M(0.8))} r={5.5} fill={C.accent} />
      <Label x={b.px(1) + 12} y={b.py(10)} anchor="start" tone="alarm" weight={600}>10× at r = 1</Label>
      <Label x={b.px(0.8) - 12} y={b.py(M(0.8)) - 6} anchor="end" tone="accent" weight={600}>2.7× at r = 0.8</Label>
      <Label x={b.px(1.5)} y={b.py(5)} tone="muted" size={15}>ζ = 0.05</Label>
    </Figure>
  );
}

/** 27: 10 m rail, free vs welded, 40 °C swing. */
function Thermal() {
  return (
    <Figure
      height={265}
      alt="Two 10 m steel rails heated 40 °C: the free one grows 4.8 mm, the one welded between fixed ends cannot grow and carries 96 MPa of compression instead."
      caption="Let it grow and it moves 4.8 mm; stop it growing and that same strain turns into 96 MPa of compression — 38% of yield, with no train on it."
    >
      <DimH x1={40} x2={400} y={34} label="10 m rail" />
      <rect x={40} y={52} width={360} height={18} fill={C.soft} stroke={C.ink} strokeWidth={2} />
      <rect x={400} y={52} width={30} height={18} fill="none" stroke={C.accent} strokeWidth={2} strokeDasharray="4 3" />
      <Label x={40} y={92} anchor="start" tone="muted" size={15}>free</Label>
      <Label x={440} y={92} anchor="end" tone="accent" weight={600}>ΔL = 4.8 mm</Label>

      <Label x={220} y={124} tone="muted" size={15}>ΔT = 40 °C, α = 12×10⁻⁶ /°C</Label>

      <WallV x={40} y={146} h={56} side="left" />
      <WallV x={400} y={146} h={56} side="right" />
      <rect x={40} y={165} width={360} height={18} fill={C.soft} stroke={C.ink} strokeWidth={2} />
      <Arrow x1={52} y1={156} x2={104} y2={156} tone="alarm" width={2.5} />
      <Arrow x1={388} y1={156} x2={336} y2={156} tone="alarm" width={2.5} />
      <Label x={220} y={224} tone="alarm" weight={600}>welded: σ = EαΔT = 96 MPa compression</Label>
      <Label x={220} y={250} tone="muted" size={15}>38% of a 250 MPa yield, before any load</Label>
    </Figure>
  );
}

/* ---------- Week 10 ---------- */

/** 28: 20 m drop, predicted 2.02 s vs measured 2.3 s. */
function SynthMethod() {
  const tx = (t: number) => 220 + 92 * t;
  const ay = 210;
  return (
    <Figure
      height={260}
      alt="A crate falling 20 m with an ignored drag force drawn dashed, beside a time line where the prediction of 2.02 s falls short of the measured 2.3 s."
      caption="The algebra was right; the gap between 2.02 s and 2.3 s is the unwritten assumption that drag is negligible."
    >
      <Ground x={20} y={40} w={70} />
      <Ground x={20} y={240} w={150} />
      <DimV x={150} y1={40} y2={240} label="20 m" />
      <rect x={96} y={118} width={34} height={34} rx={2} fill={C.soft} stroke={C.ink} strokeWidth={2} />
      <Arrow x1={113} y1={154} x2={113} y2={206} tone="ink" width={2.5} />
      <Label x={124} y={196} anchor="start" size={15}>mg</Label>
      <Arrow x1={113} y1={116} x2={113} y2={70} tone="alarm" width={2.5} dashed />
      <Label x={100} y={86} anchor="end" tone="alarm" size={15}>drag?</Label>

      <Label x={330} y={40} serif size={18}>t = √(2h/g)</Label>
      <Arrow x1={tx(0)} y1={ay} x2={460} y2={ay} tone="ink" width={1.5} />
      {[0, 1, 2].map((t) => (
        <g key={t}>
          <line x1={tx(t)} y1={ay - 5} x2={tx(t)} y2={ay + 5} stroke={C.ink} strokeWidth={1.5} />
          <Label x={tx(t)} y={ay + 20} tone="muted" size={15}>{t === 2 ? "2 s" : String(t)}</Label>
        </g>
      ))}
      <line x1={tx(2.02)} y1={ay} x2={tx(2.02)} y2={150} stroke={C.accent} strokeWidth={3} />
      <Label x={tx(2.02) - 8} y={142} anchor="end" tone="accent" weight={600}>predicted 2.02 s</Label>
      <line x1={tx(2.3)} y1={ay} x2={tx(2.3)} y2={100} stroke={C.alarm} strokeWidth={3} />
      <Label x={tx(2.3) - 8} y={92} anchor="end" tone="alarm" weight={600}>measured 2.3 s</Label>
    </Figure>
  );
}

/** 29: glide from 30 m release to 261 m, with the 210–345 m band. */
function TowLaunch() {
  const X = (m: number) => 40 + m * 1.15;
  const g = 220;
  const rel = 70;
  return (
    <Figure
      height={275}
      alt="A glider released at 30 m and 8 m/s gliding down a 6.5° path at L/D 8.71 to land 261 m away, with the honest range band of 210 to 345 m marked on the ground."
      caption="Height times L/D gives 261 m, but the parasite-drag estimate swings it from 210 to 345 m — report the band (vertical scale exaggerated)."
    >
      <line x1={X(0)} y1={rel} x2={X(261)} y2={g} stroke={C.accent} strokeWidth={3} />
      <rect x={X(210)} y={g - 6} width={X(345) - X(210)} height={12} fill={C.soft} stroke={C.muted} strokeWidth={1} />
      <Ground x={20} y={g} w={440} />
      <circle cx={X(261)} cy={g} r={5} fill={C.accent} />

      {/* glider */}
      <polygon points={`${X(0) - 14},${rel - 6} ${X(0) + 14},${rel + 4} ${X(0) + 2},${rel + 4}`} fill={C.ink} />
      <Arrow x1={X(0) + 22} y1={rel - 4} x2={X(0) + 72} y2={rel + 21} tone="ink" width={2} />
      <Label x={X(0) + 10} y={rel - 22} anchor="start" size={15}>release 30 m, 8 m/s</Label>
      <DimV x={24} y1={rel} y2={g} label="30 m" />

      <Label x={230} y={120} anchor="start" tone="accent" weight={600}>γ = 6.5°, L/D = 8.71</Label>
      <Label x={X(261) + 10} y={g - 18} anchor="start" tone="accent" weight={600}>261 m</Label>
      <Label x={(X(210) + X(345)) / 2} y={g + 26} tone="muted" size={15}>report 210–345 m</Label>
      <Label x={140} y={g + 26} tone="muted" size={15}>30 × 8.71</Label>
    </Figure>
  );
}

/** 30: the incline correction — resolve mg along and into the plane. */
function MasteryCheck() {
  const bl = { x: 80, y: 262 };
  const br = { x: 440, y: 262 };
  const tl = { x: 80, y: 262 - 360 * Math.tan(rad(30)) };
  const c30 = Math.cos(rad(30));
  const s30 = Math.sin(rad(30));
  const sAlong = 220;
  const S = { x: br.x - c30 * sAlong, y: br.y - s30 * sAlong };
  const cx = S.x + 25 * s30;
  const cy = S.y - 25 * c30;
  const W = 120;
  const along = { x: cx + W * s30 * c30, y: cy + W * s30 * s30 };
  const into = { x: cx - W * c30 * s30, y: cy + W * c30 * c30 };
  const N = { x: cx + W * c30 * s30, y: cy - W * c30 * c30 };
  return (
    <Figure
      height={280}
      alt="A block on a 30° incline with its weight mg split into mg sin 30° down the slope and mg cos 30° into the slope, balanced by the normal force N; the acceleration is g sin 30° ≈ 4.9 m/s²."
      caption="Draw the FBD first: cosine is the into-the-plane part that sets N; the sine part runs down the slope and gives a = g·sin30°."
    >
      <polygon points={`${bl.x},${bl.y} ${br.x},${br.y} ${tl.x},${tl.y}`} fill="none" stroke={C.ink} strokeWidth={2.5} />
      <polyline points={`${bl.x},${bl.y - 14} ${bl.x + 14},${bl.y - 14} ${bl.x + 14},${bl.y}`} fill="none" stroke={C.muted} strokeWidth={1.5} />
      <ArcArrow cx={br.x} cy={br.y} r={50} a0={180} a1={208} tone="muted" width={1.5} />
      <Label x={378} y={250} tone="muted" size={15}>30°</Label>

      <rect x={cx - 25} y={cy - 25} width={50} height={50} fill={C.soft} stroke={C.ink} strokeWidth={2} transform={`rotate(30 ${cx} ${cy})`} />

      <Arrow x1={cx} y1={cy} x2={cx} y2={cy + W} tone="ink" width={3} />
      <Label x={cx + 10} y={cy + W - 6} anchor="start" weight={600}>mg</Label>
      <Arrow x1={cx} y1={cy} x2={along.x} y2={along.y} tone="accent" width={3} />
      <Label x={along.x + 10} y={along.y - 16} anchor="start" tone="accent" size={15}>mg sin30°</Label>
      <Arrow x1={cx} y1={cy} x2={into.x} y2={into.y} tone="muted" width={2} dashed />
      <Label x={into.x - 8} y={into.y + 8} anchor="end" tone="muted" size={15}>mg cos30°</Label>
      <Arrow x1={cx} y1={cy} x2={N.x} y2={N.y} tone="ink" width={2.5} />
      <Label x={N.x + 10} y={N.y} anchor="start" weight={600}>N</Label>

      <Label x={100} y={22} anchor="start" tone="accent" weight={600}>a = g·sin30° ≈ 4.9 m/s²</Label>
      <Label x={100} y={44} anchor="start" tone="alarm" size={15}>not g·cos30°</Label>
    </Figure>
  );
}

export const physicsBFigures: FigureMap = {
  "physics/torque": Torque,
  "physics/rotation": Rotation,
  "physics/equilibrium": Equilibrium,
  "physics/elastic": Elastic,
  "physics/bending": Bending,
  "physics/fos": Fos,
  "physics/pressure": Pressure,
  "physics/movingfluids": MovingFluids,
  "physics/lift": Lift,
  "physics/shm": Shm,
  "physics/reswaves": ResWaves,
  "physics/thermal": Thermal,
  "physics/synthmethod": SynthMethod,
  "physics/towlaunch": TowLaunch,
  "physics/masterycheck": MasteryCheck,
};
