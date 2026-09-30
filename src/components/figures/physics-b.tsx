import { Arrow, Axes, C, DimH, DimV, Ground, Label, WallV, plotBox, type FigureMap } from "./kit";
import { AnimatedFigure, clamp, GrowArrow, lerp, op, partial, seg } from "./motion";

/* ---------- local helpers ---------- */

const rad = (d: number) => (d * Math.PI) / 180;

/**
 * Circular arc arrow around (cx, cy). Angles in degrees, SVG sense (0 = right,
 * 90 = down). Going from a0 to a1 with a1 < a0 draws counterclockwise on screen.
 * `p` grows it from a0 (1 = the whole arc); under 2% it is hidden so the head doesn't spin.
 */
function ArcArrow({
  cx,
  cy,
  r,
  a0,
  a1,
  tone = "accent",
  width = 2.5,
  p = 1,
}: {
  cx: number;
  cy: number;
  r: number;
  a0: number;
  a1: number;
  tone?: "ink" | "accent" | "muted" | "alarm";
  width?: number;
  p?: number;
}) {
  if (p < 0.02) return null;
  const end = lerp(a0, a1, p);
  const pt = (a: number) => `${(cx + r * Math.cos(rad(a))).toFixed(1)},${(cy + r * Math.sin(rad(a))).toFixed(1)}`;
  const large = Math.abs(end - a0) > 180 ? 1 : 0;
  const sweep = end > a0 ? 1 : 0;
  return (
    <path
      d={`M${pt(a0)} A${r},${r} 0 ${large} ${sweep} ${pt(end)}`}
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
    <AnimatedFigure
      height={250}
      duration={5}
      alt="A 0.25 m wrench on a lug nut with a 400 N pull perpendicular to the handle giving 100 N·m, and a dashed pull at 60° giving 86.6 N·m, short of the 110 N·m spec."
      steps={[
        { at: 0, label: "Setup", caption: "A lug nut calls for 110 N·m, and you have a 0.25 m wrench: τ = rF sin θ." },
        {
          at: 1.4,
          label: "At 90°",
          caption: "Pull 400 N perpendicular to the handle: 0.25 × 400 × sin 90° = 100 N·m, still under 110.",
        },
        { at: 3, label: "At 60°", caption: "Pull at 60° instead and the lever arm shrinks with sin θ, so the same 400 N does less." },
        {
          at: 4.2,
          label: "Compare",
          caption:
            "Only the part of the pull across the handle turns the nut: at 90° you get 100 N·m, at 60° only 86.6 N·m — both short of 110.",
        },
      ]}
    >
      {({ t }) => (
        <>
          <Label x={24} y={34} anchor="start" size={18} serif opacity={op(seg(t, 0.4, 0.9))}>τ = rF sin θ</Label>
          <Label x={24} y={64} anchor="start" tone="accent" weight={600} opacity={op(seg(t, 2.4, 2.9))}>90°: 100 N·m</Label>
          <Label x={24} y={90} anchor="start" tone="muted" opacity={op(seg(t, 4.2, 4.7))}>60°: 86.6 N·m</Label>
          <Label x={24} y={116} anchor="start" tone="alarm" opacity={op(seg(t, 0.7, 1.2))}>spec: 110 N·m</Label>

          {/* wrench */}
          <rect x={bx} y={by - 10} width={fx - bx + 10} height={20} rx={5} fill={C.soft} stroke={C.ink} strokeWidth={2} />
          <circle cx={bx} cy={by} r={28} fill={C.soft} stroke={C.ink} strokeWidth={2} />
          <polygon points={hexPts} fill={C.surface} stroke={C.ink} strokeWidth={2} />
          <ArcArrow cx={bx} cy={by} r={44} a0={240} a1={125} tone="accent" p={seg(t, 2, 2.6)} />

          {/* arm extension + 60° angle */}
          <line x1={fx} y1={by} x2={fx + 60} y2={by} stroke={C.muted} strokeWidth={1.5} strokeDasharray="4 4" opacity={op(seg(t, 3, 3.4))} />
          <ArcArrow cx={fx} cy={by} r={34} a0={0} a1={-57} tone="muted" width={1.5} p={seg(t, 3.1, 3.6)} />
          <Label x={442} y={150} anchor="start" tone="muted" size={15} opacity={op(seg(t, 3.4, 3.9))}>60°</Label>
          <GrowArrow p={seg(t, 3.1, 3.7)} x1={fx} y1={by} x2={fx + 55} y2={by - 95} tone="muted" dashed />

          {/* perpendicular pull */}
          <GrowArrow p={seg(t, 1.4, 2)} x1={fx} y1={by} x2={fx} y2={70} tone="accent" width={3.5} />
          <Label x={388} y={80} anchor="end" tone="accent" weight={600} opacity={op(seg(t, 1.7, 2.2))}>400 N</Label>

          <DimH x1={bx} x2={fx} y={232} label="r = 0.25 m" />
        </>
      )}
    </AnimatedFigure>
  );
}

/** 17: same mass and radius, disk vs hoop, same torque. */
function Rotation() {
  const cy = 125;
  const R = 70;
  const disk = 130;
  const hoop = 350;
  /** Seconds of spin: 5 s from rest under the 0.05 N·m, in real time after a 0.4 s lead-in. */
  const spin = (t: number) => clamp(t - 0.4, 0, 5);
  /** Outer end of a radius line turned `a` rad counterclockwise (on screen) from level. */
  const end = (cx: number, len: number, a: number) =>
    a === 0 ? { x: cx + len, y: cy } : { x: cx + len * Math.cos(a), y: cy - len * Math.sin(a) };
  return (
    <AnimatedFigure
      height={290}
      duration={5.4}
      alt="A solid disk and a hoop, both 2 kg and 0.10 m radius, each driven by 0.05 N·m; the disk has I = 0.01 kg·m² and α = 5 rad/s², the hoop I = 0.02 kg·m² and α = 2.5 rad/s²."
      steps={[
        {
          at: 0,
          label: "Same torque",
          caption: "Both are 2 kg with a 0.10 m radius, and both get the same 0.05 N·m torque from rest.",
        },
        { at: 1.5, label: "Inertia", caption: "The disk's I = ½mr² is 0.01 kg·m²; the hoop's I = mr² is 0.02 kg·m², double." },
        {
          at: 3,
          label: "Spin-up",
          caption:
            "Same mass, same radius, same torque — the hoop keeps all its mass at the rim, so it has double the inertia and spins up half as fast.",
        },
      ]}
      readouts={(t) => [
        { label: "t", value: `${spin(t).toFixed(1)} s` },
        { label: "ω disk", value: `${(5 * spin(t)).toFixed(1)} rad/s`, tone: "accent" },
        { label: "ω hoop", value: `${(2.5 * spin(t)).toFixed(1)} rad/s`, tone: "accent" },
      ]}
    >
      {({ t }) => {
        const s = spin(t);
        // θ = ½αs², counted back from s = 5 s so both lines finish level, as drawn.
        const d = end(disk, R, 2.5 * (s * s - 25));
        const h = end(hoop, R - 10, 1.25 * (s * s - 25));
        return (
          <>
            <Label x={240} y={22} tone="muted" size={15}>each: 2 kg, r = 0.10 m, τ = 0.05 N·m</Label>

            <circle cx={disk} cy={cy} r={R} fill={C.soft} stroke={C.ink} strokeWidth={2} />
            <circle cx={disk} cy={cy} r={4} fill={C.ink} />
            <line x1={disk} y1={cy} x2={d.x} y2={d.y} stroke={C.muted} strokeWidth={1.5} />
            <ArcArrow cx={disk} cy={cy} r={R + 16} a0={235} a1={125} />

            <circle cx={hoop} cy={cy} r={R - 5} fill="none" stroke={C.ink} strokeWidth={10} />
            <circle cx={hoop} cy={cy} r={4} fill={C.ink} />
            <line x1={hoop} y1={cy} x2={h.x} y2={h.y} stroke={C.muted} strokeWidth={1.5} />
            <ArcArrow cx={hoop} cy={cy} r={R + 16} a0={235} a1={125} />

            <Label x={disk} y={226}>solid disk</Label>
            <Label x={hoop} y={226}>hoop</Label>
            <Label x={disk} y={252} size={15} opacity={op(seg(t, 1.5, 2))}>I = ½mr² = 0.01 kg·m²</Label>
            <Label x={hoop} y={252} size={15} opacity={op(seg(t, 1.7, 2.2))}>I = mr² = 0.02 kg·m²</Label>
            <Label x={disk} y={276} tone="accent" weight={600} opacity={op(seg(t, 3, 3.5))}>α = 5 rad/s²</Label>
            <Label x={hoop} y={276} tone="accent" weight={600} opacity={op(seg(t, 3.2, 3.7))}>α = 2.5 rad/s²</Label>
          </>
        );
      }}
    </AnimatedFigure>
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
    <AnimatedFigure
      height={305}
      duration={4.5}
      alt="A 6 m beam with a pin at the left and a roller at the right, loaded by 800 N at 2 m and 400 N at 5 m, with both support reactions pointing up at 600 N."
      steps={[
        { at: 0, label: "Loads", caption: "A 6 m beam on a pin and a roller carries 800 N at 2 m and 400 N at 5 m." },
        { at: 1.9, label: "Moments", caption: "Moments about the pin: B_y × 6 = 800 × 2 + 400 × 5 = 3600, so B_y = 600 N." },
        {
          at: 3.4,
          label: "Balance",
          caption:
            "Take moments about the pin and A_y drops out: B_y × 6 = 800 × 2 + 400 × 5, so B_y = 600 N, and A_y is the other 600 N.",
        },
      ]}
    >
      {({ t }) => (
        <>
          {/* loads */}
          <GrowArrow p={seg(t, 0.4, 1)} x1={X(2)} y1={42} x2={X(2)} y2={top - 2} tone="ink" width={3} />
          <Label x={X(2)} y={26} weight={600} opacity={op(seg(t, 0.6, 1.1))}>800 N</Label>
          <GrowArrow p={seg(t, 0.9, 1.5)} x1={X(5)} y1={62} x2={X(5)} y2={top - 2} tone="ink" width={3} />
          <Label x={X(5)} y={46} weight={600} opacity={op(seg(t, 1.1, 1.6))}>400 N</Label>

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
          <GrowArrow p={seg(t, 3.4, 4)} x1={X(0)} y1={228} x2={X(0)} y2={bot + 32} tone="accent" width={3.5} />
          <GrowArrow p={seg(t, 1.9, 2.5)} x1={X(6)} y1={228} x2={X(6)} y2={bot + 32} tone="accent" width={3.5} />
          <Label x={24} y={246} anchor="start" tone="accent" weight={600} opacity={op(seg(t, 3.7, 4.2))}>A_y = 600 N</Label>
          <Label x={456} y={246} anchor="end" tone="accent" weight={600} opacity={op(seg(t, 2.2, 2.7))}>B_y = 600 N</Label>
          <Label x={X(0) + 28} y={bot + 16} anchor="start" tone="muted" size={15}>pin</Label>
          <Label x={X(6) - 28} y={bot + 16} anchor="end" tone="muted" size={15}>roller</Label>

          <DimH x1={X(0)} x2={X(2)} y={290} label="2 m" />
          <DimH x1={X(2)} x2={X(5)} y={290} label="3 m" />
          <DimH x1={X(5)} x2={X(6)} y={290} label="1 m" />
        </>
      )}
    </AnimatedFigure>
  );
}

/* ---------- Week 7 ---------- */

/** 19: 10 mm rod, 2 m long, 15 kN hanging load. */
function Elastic() {
  return (
    <AnimatedFigure
      height={300}
      duration={5.3}
      alt="A 10 mm steel rod 2 m long hanging from a ceiling with a 15 kN load, next to its circular cross-section and the results: stress 191 MPa against a 250 MPa yield, stretch 1.91 mm."
      steps={[
        { at: 0, label: "Load", caption: "A 10 mm diameter steel rod, 2 m long, hangs a 15 kN load." },
        { at: 1.4, label: "Area", caption: "Its cross-section is A = π(0.005)² = 7.85×10⁻⁵ m²." },
        { at: 2.8, label: "Stress", caption: "σ = 15000 / 7.85×10⁻⁵ = 191 MPa, under the roughly 250 MPa where mild steel yields." },
        {
          at: 4.2,
          label: "Stretch",
          caption: "Divide the load by the area: 15 kN over 7.85×10⁻⁵ m² is 191 MPa — under yield — and the 2 m rod stretches 1.91 mm.",
        },
      ]}
    >
      {({ t }) => {
        const section = op(seg(t, 1.4, 1.9));
        return (
          <>
            <Ground x={70} y={40} w={120} side="above" />
            <rect x={125} y={40} width={10} height={170} fill={C.soft} stroke={C.ink} strokeWidth={2} />
            <rect x={95} y={210} width={70} height={40} rx={3} fill={C.soft} stroke={C.ink} strokeWidth={2} />
            <GrowArrow p={seg(t, 0.4, 1)} x1={130} y1={252} x2={130} y2={292} tone="accent" width={3} />
            <Label x={142} y={278} anchor="start" tone="accent" weight={600} opacity={op(seg(t, 0.7, 1.2))}>F = 15 kN</Label>
            <DimV x={60} y1={40} y2={210} label="2 m" />

            <circle cx={262} cy={78} r={24} fill={C.soft} stroke={C.ink} strokeWidth={2} opacity={section} />
            <line x1={238} y1={78} x2={286} y2={78} stroke={C.muted} strokeWidth={1.5} opacity={section} />
            <Label x={298} y={78} anchor="start" size={15} opacity={section}>Ø10 mm</Label>
            <Label x={236} y={128} anchor="start" size={15} opacity={op(seg(t, 1.7, 2.2))}>A = 7.85×10⁻⁵ m²</Label>
            <Label x={236} y={162} anchor="start" tone="accent" size={18} weight={600} opacity={op(seg(t, 2.8, 3.3))}>σ = F/A = 191 MPa</Label>
            <Label x={236} y={188} anchor="start" tone="muted" size={15} opacity={op(seg(t, 3.1, 3.6))}>mild-steel yield ≈ 250 MPa</Label>
            <Label x={236} y={228} anchor="start" tone="accent" weight={600} opacity={op(seg(t, 4.2, 4.7))}>δ = FL/AE = 1.91 mm</Label>
            <Label x={236} y={254} anchor="start" tone="muted" size={15} opacity={op(seg(t, 4.5, 5))}>strain ε ≈ 0.001</Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** 20: cantilevered steel ruler, 300 mm, 5 N at the tip. */
function Bending() {
  const x0 = 50;
  const L = 370;
  const y0 = 90;
  const tip = 60; // exaggerated droop in px
  const shape = (xi: number) => (xi * xi * (3 - xi)) / 2;
  /** The ruler under a share k of the 5 N tip load: the droop is linear in the load. */
  const ruler = (k: number) =>
    sample((xi) => y0 + tip * k * shape(xi), 0, 1, 60)
      .map(([xi, y], i) => `${i ? "L" : "M"}${(x0 + xi * L).toFixed(1)},${y.toFixed(1)}`)
      .join(" ");
  const d = ruler(1);
  const load = (t: number) => seg(t, 1.4, 2.8);
  return (
    <AnimatedFigure
      height={260}
      duration={4.8}
      alt="A steel ruler clamped at a wall and sticking out 300 mm, bending down 13.5 mm under 5 N at the tip, with tension on its top surface and compression on its bottom at the root."
      steps={[
        {
          at: 0,
          label: "Setup",
          caption: "A steel ruler, 25 mm wide and 2 mm thick, sticks out 300 mm: I = bh³/12 = 1.67×10⁻¹¹ m⁴.",
        },
        { at: 1.4, label: "Load", caption: "Hang 5 N on the tip and it droops δ = FL³/3EI = 13.5 mm, about a twentieth of the span." },
        {
          at: 3.4,
          label: "Faces",
          caption:
            "The top face stretches and the bottom squeezes; depth is the lever — I = bh³/12, so halving the 2 mm thickness makes the droop eightfold.",
        },
      ]}
      readouts={(t) => [
        { label: "F", value: `${(5 * load(t)).toFixed(1)} N` },
        { label: "δ", value: `${(13.5 * load(t)).toFixed(1)} mm`, tone: "accent" },
      ]}
    >
      {({ t }) => {
        const k = load(t);
        const ten = op(seg(t, 3.4, 3.9));
        const com = op(seg(t, 3.7, 4.2));
        return (
          <>
            <WallV x={x0} y={40} h={130} side="left" />
            <DimH x1={x0} x2={x0 + L} y={30} label="300 mm" />
            <line x1={x0} y1={y0} x2={x0 + L + 10} y2={y0} stroke={C.muted} strokeWidth={1.5} strokeDasharray="5 5" />
            <path d={k < 1 ? ruler(k) : d} fill="none" stroke={C.ink} strokeWidth={9} strokeLinecap="butt" />

            {/* tension / compression at the root */}
            <Arrow x1={118} y1={70} x2={78} y2={70} tone="accent" width={2} opacity={ten} />
            <Arrow x1={126} y1={70} x2={166} y2={70} tone="accent" width={2} opacity={ten} />
            <Label x={176} y={62} anchor="start" tone="accent" size={15} opacity={ten}>tension</Label>
            <Arrow x1={70} y1={114} x2={108} y2={114} tone="alarm" width={2} opacity={com} />
            <Arrow x1={176} y1={116} x2={136} y2={116} tone="alarm" width={2} opacity={com} />
            <Label x={186} y={124} anchor="start" tone="alarm" size={15} opacity={com}>compression</Label>

            {/* tip load and droop */}
            <GrowArrow p={k} x1={x0 + L} y1={y0 + tip * k + 6} x2={x0 + L} y2={y0 + tip * k + 56} tone="accent" width={3} />
            <Label x={x0 + L - 12} y={y0 + tip * k + 44} anchor="end" tone="accent" weight={600} opacity={op(seg(t, 2.4, 2.9))}>5 N</Label>
            <Label x={430} y={112} anchor="end" tone="accent" size={15} opacity={op(seg(t, 2.7, 3.2))}>δ = 13.5 mm</Label>
            <Arrow x1={448} y1={y0 + 2} x2={448} y2={y0 + tip - 2} tone="accent" width={1.5} both opacity={op(seg(t, 2.7, 3.2))} />

            <Label x={24} y={200} anchor="start" size={15} opacity={op(seg(t, 0.4, 0.9))}>25 × 2 mm: I = 1.67×10⁻¹¹ m⁴</Label>
            <Label x={24} y={226} anchor="start" size={15} opacity={op(seg(t, 4, 4.5))}>root σ = My/I = 90 MPa</Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** 21: factor of safety — load bar and stress bar at the same ratio. */
function Fos() {
  const x0 = 40;
  const W = 400;
  const f = 12 / 45;
  const cut = x0 + W * f;
  /** `fill` sweeps the used share in; `a` and `b` fade the two labels; `o` fades the whole bar. */
  const Bar = ({ y, used, spare, fill, a, b, o = 1 }: { y: number; used: string; spare: string; fill: number; a: number; b: number; o?: number }) => (
    <g opacity={op(o)}>
      <rect x={x0} y={y} width={W} height={38} rx={3} fill={C.soft} stroke={C.ink} strokeWidth={2} />
      <rect x={x0} y={y} width={lerp(0, W * f, fill)} height={38} rx={3} fill={C.accent} />
      <Label x={(x0 + cut) / 2} y={y + 19} weight={600} opacity={op(a)}>
        <tspan fill={C.surface}>{used}</tspan>
      </Label>
      <Label x={(cut + x0 + W) / 2} y={y + 19} tone="muted" size={15} opacity={op(b)}>{spare}</Label>
    </g>
  );
  return (
    <AnimatedFigure
      height={260}
      duration={5.5}
      alt="Two bars on the same scale: the load bar shows 12 kN used of a 45 kN ultimate, and the stress bar shows 200 MPa allowable of a 750 MPa ultimate, both at a factor of safety of 3.75."
      steps={[
        { at: 0, label: "Load", caption: "A hoist cable with a 45 kN ultimate strength must lift 12 kN, day after day." },
        { at: 1.8, label: "Factor", caption: "Its factor of safety is the failure load over the working load: n = 45 / 12 = 3.75." },
        {
          at: 3,
          label: "Stress",
          caption: "On its 60 mm² section the ultimate is 750 MPa, so the allowable stress is 750 / 3.75 = 200 MPa.",
        },
        {
          at: 4.6,
          label: "Same n",
          caption: "The 33 kN left over is the margin for unknown loads, materials and models — and it is the same 3.75 whether you speak in load or stress.",
        },
      ]}
    >
      {({ t }) => {
        const stress = seg(t, 3, 3.5);
        const line = seg(t, 4.6, 5.2);
        return (
          <>
            <Label x={x0} y={28} anchor="start" size={15} tone="muted">load</Label>
            <Label x={x0 + W} y={28} anchor="end" size={15}>ultimate 45 kN</Label>
            <Bar y={42} used="12 kN" spare="33 kN margin" fill={seg(t, 0.4, 1)} a={seg(t, 0.7, 1.2)} b={seg(t, 1, 1.5)} />

            <Label x={x0} y={122} anchor="start" size={15} tone="muted" opacity={op(stress)}>stress (60 mm²)</Label>
            <Label x={x0 + W} y={122} anchor="end" size={15} opacity={op(stress)}>ultimate 750 MPa</Label>
            <Bar
              y={136}
              used="200 MPa"
              spare="allowable = 750 / 3.75"
              fill={seg(t, 3.3, 3.9)}
              a={seg(t, 3.6, 4.1)}
              b={seg(t, 3.9, 4.4)}
              o={stress}
            />

            {line > 0.02 ? (
              <line x1={cut} y1={36} x2={cut} y2={lerp(36, 184, line)} stroke={C.ink} strokeWidth={1.5} strokeDasharray="4 4" />
            ) : null}
            <Label x={240} y={226} size={20} serif tone="accent" weight={600} opacity={op(seg(t, 1.8, 2.3))}>n = 45 / 12 = 3.75</Label>
          </>
        );
      }}
    </AnimatedFigure>
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
  /** Share of the 10 m descent, from the surface down. */
  const sink = (t: number) => seg(t, 1, 3.4);
  return (
    <AnimatedFigure
      height={290}
      duration={4.5}
      alt="A water tank with a point 10 m below the surface pushed on equally from all directions, and a pressure profile beside it rising linearly from zero at the surface to 98.1 kPa at 10 m."
      steps={[
        { at: 0, label: "Surface", caption: "At the surface the gauge pressure is 0; below it, p = ρgh counts the weight of the water above." },
        { at: 1, label: "Descend", caption: "Deeper points hold up a taller column of water, so the pressure climbs with depth." },
        {
          at: 3.5,
          label: "10 m",
          caption: "Pressure is the weight of the water column above: it grows in a straight line with depth and pushes equally from every side.",
        },
      ]}
      readouts={(t) => {
        const h = 10 * sink(t);
        return [
          { label: "h", value: `${h.toFixed(1)} m` },
          { label: "p", value: `${(9.81 * h).toFixed(1)} kPa`, tone: "accent" },
        ];
      }}
    >
      {({ t }) => {
        const k = sink(t);
        const y = lerp(surf, deep, k);
        // The push arrows scale with the pressure; they are drawn as-is at 10 m.
        const push =
          k >= 1 ? (
            arrows
          ) : k > 0.02 ? (
            <g transform={`translate(${px} ${y.toFixed(1)}) scale(${k.toFixed(3)}) translate(${-px} ${-deep})`}>{arrows}</g>
          ) : null;
        const done = op(seg(t, 3.5, 4));
        return (
          <>
            <rect x={30} y={surf} width={260} height={220} fill={C.soft} stroke={C.ink} strokeWidth={2} />
            <line x1={30} y1={surf} x2={290} y2={surf} stroke={C.accent} strokeWidth={2.5} />
            <polygon points={`236,${surf - 16} 252,${surf - 16} 244,${surf - 4}`} fill={C.accent} />
            <DimV x={60} y1={surf} y2={deep} label="10 m" />
            {push}
            <circle cx={px} cy={y} r={6} fill={C.ink} />
            <Label x={218} y={186} anchor="start" tone="accent" weight={600} opacity={done}>98.1 kPa</Label>

            {/* profile */}
            {k > 0.01 ? (
              <polygon points={`330,${surf} 330,${y} ${330 + 110 * k},${y}`} fill={C.soft} stroke={C.accent} strokeWidth={2} />
            ) : null}
            <line x1={330} y1={surf} x2={330} y2={deep + 10} stroke={C.ink} strokeWidth={1.5} />
            <line x1={290} y1={deep} x2={330} y2={deep} stroke={C.muted} strokeWidth={1} strokeDasharray="3 4" opacity={done} />
            <Label x={342} y={surf + 2} anchor="start" size={15} tone="muted">0</Label>
            <Label x={432} y={deep + 20} size={15} tone="accent" opacity={op(seg(t, 3.7, 4.2))}>98.1 kPa</Label>
            <Label x={385} y={30} serif size={18} opacity={op(seg(t, 0.4, 0.9))}>p = ρgh</Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** 23: Venturi — 10 cm to 5 cm, 1.0 to 4.0 m/s, 7.5 kPa drop. */
function MovingFluids() {
  const cy = 200;
  const top = `20,150 150,150 200,175 310,175 370,150 460,150`;
  const bot = `460,250 370,250 310,225 200,225 150,250 20,250`;
  /** Inlet speed as a share of 1.0 m/s while the flow starts up. */
  const flow = (t: number) => seg(t, 1, 3);
  return (
    <AnimatedFigure
      height={290}
      duration={4.2}
      alt="A horizontal pipe narrowing from 10 cm to 5 cm diameter, water speeding from 1.0 m/s to 4.0 m/s, with two standpipes showing the throat pressure 7.5 kPa lower than the inlet."
      steps={[
        { at: 0, label: "Setup", caption: "A horizontal water pipe narrows from 10 cm to 5 cm diameter." },
        {
          at: 1,
          label: "Flow",
          caption: "Water enters at 1.0 m/s, and continuity, A₁v₁ = A₂v₂, speeds it up to 4.0 m/s in the throat.",
        },
        {
          at: 3.4,
          label: "Pressure",
          caption: "A quarter of the area means four times the speed, and the push for that speed-up comes from a 7.5 kPa pressure drop in the throat.",
        },
      ]}
      readouts={(t) => {
        const v = flow(t);
        return [
          { label: "v₁", value: `${v.toFixed(1)} m/s` },
          { label: "v₂", value: `${(4 * v).toFixed(1)} m/s`, tone: "accent" },
          { label: "Δp", value: `${(7.5 * v * v).toFixed(1)} kPa`, tone: "accent" },
        ];
      }}
    >
      {({ t }) => {
        const v = flow(t);
        const lvl = lerp(50, 110, v * v); // the throat column falls with ½ρ(v₂² − v₁²)
        const drop = op(seg(t, 3.4, 3.9));
        return (
          <>
            {/* standpipes */}
            <rect x={83} y={50} width={14} height={100} fill={C.soft} />
            <rect x={248} y={lvl} width={14} height={175 - lvl} fill={C.soft} />
            <polyline points="83,30 83,150" fill="none" stroke={C.ink} strokeWidth={1.5} />
            <polyline points="97,30 97,150" fill="none" stroke={C.ink} strokeWidth={1.5} />
            <polyline points="248,30 248,175" fill="none" stroke={C.ink} strokeWidth={1.5} />
            <polyline points="262,30 262,175" fill="none" stroke={C.ink} strokeWidth={1.5} />
            <line x1={97} y1={50} x2={330} y2={50} stroke={C.muted} strokeWidth={1.5} strokeDasharray="4 4" opacity={drop} />
            <line x1={262} y1={110} x2={330} y2={110} stroke={C.muted} strokeWidth={1.5} strokeDasharray="4 4" opacity={drop} />
            <g opacity={drop}>
              <DimV x={318} y1={50} y2={110} label="Δp = 7.5 kPa" tone="accent" />
            </g>

            {/* pipe */}
            <polygon points={`${top} ${bot}`} fill={C.soft} stroke="none" />
            <polyline points={top} fill="none" stroke={C.ink} strokeWidth={2.5} />
            <polyline points={bot} fill="none" stroke={C.ink} strokeWidth={2.5} />
            <rect x={84.5} y={146} width={11} height={8} fill={C.soft} />
            <rect x={249.5} y={171} width={11} height={8} fill={C.soft} />

            <GrowArrow p={v} x1={38} y1={cy} x2={60} y2={cy} tone="accent" width={3} />
            <Label x={68} y={cy} anchor="start" tone="accent" weight={600} opacity={op(seg(t, 2.7, 3.2))}>1.0 m/s</Label>
            <GrowArrow p={v} x1={215} y1={cy} x2={295} y2={cy} tone="accent" width={3} />
            <Label x={255} y={244} tone="accent" weight={600} opacity={op(seg(t, 2.9, 3.4))}>4.0 m/s</Label>
            <Label x={85} y={272} tone="muted" size={15} opacity={op(seg(t, 0.4, 0.9))}>Ø10 cm</Label>
            <Label x={255} y={272} tone="muted" size={15} opacity={op(seg(t, 0.4, 0.9))}>Ø5 cm</Label>
          </>
        );
      }}
    </AnimatedFigure>
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
  const curve = sample(CL, 0, 23.5);
  /** Angle of attack swept steadily from 0 to 23.5° over 4 s. */
  const sweep = (t: number) => clamp((t - 0.4) / 4);
  return (
    <AnimatedFigure
      height={280}
      duration={4.7}
      alt="The glider's lift coefficient rising in a straight line with angle of attack at slope 4.25 per radian, a cruise point at C_L 0.6, and a peak at C_Lmax 1.1 where the wing stalls and lift falls away."
      steps={[
        { at: 0, label: "Climb", caption: "C_L rises in a straight line with angle of attack, at a lift slope of a = 4.25 per radian." },
        { at: 1.8, label: "Cruise", caption: "At the 9 m/s cruise the wing works at C_L = 0.6, on the straight part of the curve." },
        {
          at: 3.6,
          label: "Stall",
          caption: "C_L climbs with angle of attack until the flow lets go at C_Lmax = 1.1; that ceiling is what sets the 7.8 m/s stall speed.",
        },
      ]}
    >
      {({ t }) => {
        const cruise = op(seg(t, 1.8, 2.3));
        const stall = op(seg(t, 3.6, 4.1));
        return (
          <>
            <Axes box={b} xLabel="angle of attack α" yLabel="C_L" />
            <line x1={b.x} y1={b.py(1.1)} x2={b.px(peak)} y2={b.py(1.1)} stroke={C.muted} strokeWidth={1.5} strokeDasharray="4 4" opacity={stall} />
            <line x1={b.x} y1={b.py(0.6)} x2={b.px(aCruise)} y2={b.py(0.6)} stroke={C.muted} strokeWidth={1.5} strokeDasharray="4 4" opacity={cruise} />
            <Label x={b.x - 8} y={b.py(1.1)} anchor="end" tone="muted" size={15} opacity={stall}>1.1</Label>
            <Label x={b.x - 8} y={b.py(0.6)} anchor="end" tone="muted" size={15} opacity={cruise}>0.6</Label>
            <path d={b.path(partial(curve, sweep(t)))} fill="none" stroke={C.accent} strokeWidth={3} />
            <circle cx={b.px(aCruise)} cy={b.py(0.6)} r={5.5} fill={C.accent} opacity={cruise} />
            <circle cx={b.px(peak)} cy={b.py(1.1)} r={5.5} fill={C.alarm} opacity={stall} />
            <Label x={b.px(aCruise) + 14} y={b.py(0.6) + 18} anchor="start" size={15} opacity={cruise}>cruise, 9 m/s</Label>
            <Label x={b.px(peak) - 12} y={b.py(1.1) - 20} anchor="end" tone="alarm" size={15} opacity={stall}>stall · v ≈ 7.8 m/s</Label>
            <Label x={b.px(9)} y={b.py(0.28)} anchor="start" tone="muted" size={15} opacity={op(seg(t, 1, 1.5))}>slope a = 4.25 /rad</Label>
          </>
        );
      }}
    </AnimatedFigure>
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
  const coil = `70,36 70,50 ${zig} 70,146 70,152`;
  /** The spring with its lower end moved dy px; the coils share the stretch. */
  const spring = (dy: number) => {
    const s = (96 + dy) / 96;
    const z = Array.from({ length: 9 }, (_, i) => `${i % 2 ? 56 : 84},${(50 + (6 + i * 10) * s).toFixed(1)}`).join(" ");
    return `70,36 70,50 ${z} 70,${146 + dy} 70,${152 + dy}`;
  };
  const trace = sample(x, 0, 2.2, 160);
  const lead = 0.4;
  const run = 5 * T; // five whole bounces in real time, ending back at the release point, as drawn
  return (
    <AnimatedFigure
      height={260}
      duration={lead + run}
      alt="A 0.50 kg mass on a 20 N/m spring beside its displacement plotted against time: a cosine of amplitude 0.10 m repeating every 0.99 s, passing the middle at 0.63 m/s."
      steps={[
        {
          at: 0,
          label: "Release",
          caption: "A 0.50 kg mass on a 20 N/m spring is pulled 0.10 m down and released from rest.",
        },
        { at: 1.9, label: "Period", caption: "The trace repeats every T ≈ 0.99 s: about one bounce per second." },
        { at: 3, label: "Middle", caption: "At the middle all 0.10 J is kinetic, so the mass passes through at v_max ≈ 0.63 m/s." },
        {
          at: 4.1,
          label: "Beat",
          caption: "Stiffness and mass alone set the beat: ω = √(20/0.50) ≈ 6.32 rad/s, so one bounce every 0.99 s whatever the amplitude.",
        },
      ]}
    >
      {({ t }) => {
        const s = clamp(t - lead, 0, run); // real seconds since release
        const dy = Math.round(-(x(s) + 0.1) * 1800) / 10; // px from the drawn (release) pose, up negative; 0.10 m of travel is 18 px
        const vmax = op(seg(t, 3, 3.5));
        return (
          <>
            {/* spring and mass */}
            <Ground x={30} y={36} w={80} side="above" />
            <polyline points={dy ? spring(dy) : coil} fill="none" stroke={C.ink} strokeWidth={2} />
            <rect x={40} y={152 + dy} width={60} height={36} rx={3} fill={C.soft} stroke={C.ink} strokeWidth={2} />
            <Label x={70} y={170 + dy} size={15}>0.50 kg</Label>
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

            <path d={b.path(partial(trace, clamp((t - lead) / 2.2)))} fill="none" stroke={C.accent} strokeWidth={3} />
            <g opacity={op(seg(t, 1.9, 2.4))}>
              <DimH x1={b.px(T / 2)} x2={b.px(1.5 * T)} y={b.py(0.1) - 14} label="T ≈ 0.99 s" tone="ink" />
            </g>
            <circle cx={b.px(T / 4)} cy={b.py(0)} r={5} fill={C.accent} opacity={vmax} />
            <line x1={b.px(T / 4)} y1={b.py(0) + 6} x2={b.px(T / 4)} y2={228} stroke={C.accent} strokeWidth={1} strokeDasharray="3 3" opacity={vmax} />
            <Label x={b.px(T / 4) - 6} y={242} anchor="start" tone="accent" size={15} opacity={vmax}>v_max ≈ 0.63 m/s through the middle</Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** 26: magnification curve for ζ = 0.05. */
function ResWaves() {
  const b = plotBox({ x: 60, y: 40, w: 380, h: 190, xMin: 0, xMax: 2, yMin: 0, yMax: 11 });
  const z = 0.05;
  const M = (r: number) => 1 / Math.sqrt((1 - r * r) ** 2 + (2 * z * r) ** 2);
  const curve = sample(M, 0, 2, 400);
  return (
    <AnimatedFigure
      height={280}
      duration={4.5}
      alt="Response magnification against frequency ratio for 5% damping: a sharp peak of 10 at r = 1, and 2.7 at r = 0.8."
      steps={[
        {
          at: 0,
          label: "Sweep",
          caption: "With 5% damping, ζ = 0.05, the response grows much stronger as the drive nears the natural frequency.",
        },
        {
          at: 2.5,
          label: "Resonance",
          caption: "At r = 1 the magnification is 1/(2 × 0.05) = 10: a 1 mm static deflection becomes 10 mm of motion.",
        },
        {
          at: 3.7,
          label: "Detune",
          caption: "Driven right at its natural frequency the machine moves ten times its static deflection; 20% off, only 2.7 times.",
        },
      ]}
    >
      {({ t }) => {
        const res = op(seg(t, 2.5, 3));
        const off = op(seg(t, 3.7, 4.2));
        return (
          <>
            <Axes box={b} xLabel="r = ω/ωₙ" yLabel="X ÷ static" />
            <line x1={b.x} y1={b.py(10)} x2={b.px(1)} y2={b.py(10)} stroke={C.muted} strokeWidth={1.5} strokeDasharray="4 4" opacity={res} />
            <line x1={b.x} y1={b.py(1)} x2={b.px(2)} y2={b.py(1)} stroke={C.muted} strokeWidth={1} strokeDasharray="2 5" />
            <line x1={b.px(0.8)} y1={b.py(M(0.8))} x2={b.px(0.8)} y2={b.y + b.h} stroke={C.muted} strokeWidth={1.5} strokeDasharray="4 4" opacity={off} />
            <line x1={b.px(1)} y1={b.py(10)} x2={b.px(1)} y2={b.y + b.h} stroke={C.muted} strokeWidth={1.5} strokeDasharray="4 4" opacity={res} />
            <Label x={b.x - 8} y={b.py(10)} anchor="end" tone="muted" size={15} opacity={res}>10</Label>
            <Label x={b.x - 8} y={b.py(1)} anchor="end" tone="muted" size={15}>1</Label>
            <Label x={b.px(0.8)} y={b.y + b.h + 18} tone="muted" size={15} opacity={off}>0.8</Label>
            <Label x={b.px(1)} y={b.y + b.h + 18} tone="muted" size={15} opacity={res}>1</Label>

            <path d={b.path(partial(curve, clamp((t - 0.4) / 2)))} fill="none" stroke={C.accent} strokeWidth={3} />
            <circle cx={b.px(1)} cy={b.py(10)} r={5.5} fill={C.alarm} opacity={res} />
            <circle cx={b.px(0.8)} cy={b.py(M(0.8))} r={5.5} fill={C.accent} opacity={off} />
            <Label x={b.px(1) + 12} y={b.py(10)} anchor="start" tone="alarm" weight={600} opacity={res}>10× at r = 1</Label>
            <Label x={b.px(0.8) - 12} y={b.py(M(0.8)) - 6} anchor="end" tone="accent" weight={600} opacity={off}>2.7× at r = 0.8</Label>
            <Label x={b.px(1.5)} y={b.py(5)} tone="muted" size={15} opacity={op(seg(t, 1.9, 2.4))}>ζ = 0.05</Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** 27: 10 m rail, free vs welded, 40 °C swing. */
function Thermal() {
  /** Share of the 40 °C swing while both rails warm. */
  const heat = (t: number) => seg(t, 0.4, 2.4);
  return (
    <AnimatedFigure
      height={265}
      duration={4.7}
      alt="Two 10 m steel rails heated 40 °C: the free one grows 4.8 mm, the one welded between fixed ends cannot grow and carries 96 MPa of compression instead."
      steps={[
        { at: 0, label: "Heat", caption: "Two 10 m steel rails see a 40 °C summer swing, with α = 12×10⁻⁶ per °C." },
        { at: 2.4, label: "Free", caption: "Free, it grows ΔL = 12×10⁻⁶ × 10 × 40 = 4.8 mm." },
        {
          at: 3.6,
          label: "Welded",
          caption: "Let it grow and it moves 4.8 mm; stop it growing and that same strain turns into 96 MPa of compression — 38% of yield, with no train on it.",
        },
      ]}
      readouts={(t) => {
        const k = heat(t);
        return [
          { label: "ΔT", value: `${(40 * k).toFixed(0)} °C` },
          { label: "ΔL free", value: `${(4.8 * k).toFixed(1)} mm`, tone: "accent" },
          { label: "σ welded", value: `${(96 * k).toFixed(0)} MPa`, tone: "alarm" },
        ];
      }}
    >
      {({ t }) => {
        const k = heat(t);
        return (
          <>
            <DimH x1={40} x2={400} y={34} label="10 m rail" />
            <rect x={40} y={52} width={360} height={18} fill={C.soft} stroke={C.ink} strokeWidth={2} />
            {k > 0.02 ? (
              <rect x={400} y={52} width={lerp(0, 30, k)} height={18} fill="none" stroke={C.accent} strokeWidth={2} strokeDasharray="4 3" />
            ) : null}
            <Label x={40} y={92} anchor="start" tone="muted" size={15}>free</Label>
            <Label x={440} y={92} anchor="end" tone="accent" weight={600} opacity={op(seg(t, 2.4, 2.9))}>ΔL = 4.8 mm</Label>

            <Label x={220} y={124} tone="muted" size={15}>ΔT = 40 °C, α = 12×10⁻⁶ /°C</Label>

            <WallV x={40} y={146} h={56} side="left" />
            <WallV x={400} y={146} h={56} side="right" />
            <rect x={40} y={165} width={360} height={18} fill={C.soft} stroke={C.ink} strokeWidth={2} />
            <GrowArrow p={k} x1={52} y1={156} x2={104} y2={156} tone="alarm" width={2.5} />
            <GrowArrow p={k} x1={388} y1={156} x2={336} y2={156} tone="alarm" width={2.5} />
            <Label x={220} y={224} tone="alarm" weight={600} opacity={op(seg(t, 3.6, 4.1))}>welded: σ = EαΔT = 96 MPa compression</Label>
            <Label x={220} y={250} tone="muted" size={15} opacity={op(seg(t, 3.9, 4.4))}>38% of a 250 MPa yield, before any load</Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/* ---------- Week 10 ---------- */

/** 28: 20 m drop, predicted 2.02 s vs measured 2.3 s. */
function SynthMethod() {
  const tx = (t: number) => 220 + 92 * t;
  const ay = 210;
  return (
    <AnimatedFigure
      height={260}
      duration={4.3}
      alt="A crate falling 20 m with an ignored drag force drawn dashed, beside a time line where the prediction of 2.02 s falls short of the measured 2.3 s."
      steps={[
        { at: 0, label: "Predict", caption: "Predict how long a 20 m drop takes: t = √(2h/g) = 2.02 s." },
        { at: 1.9, label: "Measure", caption: "The measured time is 2.3 s, not the 2.02 s predicted." },
        {
          at: 3.2,
          label: "Ledger",
          caption: "The algebra was right; the gap between 2.02 s and 2.3 s is the unwritten assumption that drag is negligible.",
        },
      ]}
    >
      {({ t }) => {
        const pred = seg(t, 0.8, 1.4);
        const meas = seg(t, 1.9, 2.5);
        return (
          <>
            <Ground x={20} y={40} w={70} />
            <Ground x={20} y={240} w={150} />
            <DimV x={150} y1={40} y2={240} label="20 m" />
            <rect x={96} y={118} width={34} height={34} rx={2} fill={C.soft} stroke={C.ink} strokeWidth={2} />
            <Arrow x1={113} y1={154} x2={113} y2={206} tone="ink" width={2.5} />
            <Label x={124} y={196} anchor="start" size={15}>mg</Label>
            <GrowArrow p={seg(t, 3.2, 3.8)} x1={113} y1={116} x2={113} y2={70} tone="alarm" width={2.5} dashed />
            <Label x={100} y={86} anchor="end" tone="alarm" size={15} opacity={op(seg(t, 3.5, 4))}>drag?</Label>

            <Label x={330} y={40} serif size={18} opacity={op(seg(t, 0.4, 0.9))}>t = √(2h/g)</Label>
            <Arrow x1={tx(0)} y1={ay} x2={460} y2={ay} tone="ink" width={1.5} />
            {[0, 1, 2].map((s) => (
              <g key={s}>
                <line x1={tx(s)} y1={ay - 5} x2={tx(s)} y2={ay + 5} stroke={C.ink} strokeWidth={1.5} />
                <Label x={tx(s)} y={ay + 20} tone="muted" size={15}>{s === 2 ? "2 s" : String(s)}</Label>
              </g>
            ))}
            {pred > 0.02 ? <line x1={tx(2.02)} y1={ay} x2={tx(2.02)} y2={lerp(ay, 150, pred)} stroke={C.accent} strokeWidth={3} /> : null}
            <Label x={tx(2.02) - 8} y={142} anchor="end" tone="accent" weight={600} opacity={op(seg(t, 1.1, 1.6))}>predicted 2.02 s</Label>
            {meas > 0.02 ? <line x1={tx(2.3)} y1={ay} x2={tx(2.3)} y2={lerp(ay, 100, meas)} stroke={C.alarm} strokeWidth={3} /> : null}
            <Label x={tx(2.3) - 8} y={92} anchor="end" tone="alarm" weight={600} opacity={op(seg(t, 2.2, 2.7))}>measured 2.3 s</Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** 29: glide from 30 m release to 261 m, with the 210–345 m band. */
function TowLaunch() {
  const X = (m: number) => 40 + m * 1.15;
  const g = 220;
  const rel = 70;
  return (
    <AnimatedFigure
      height={275}
      duration={4.4}
      alt="A glider released at 30 m and 8 m/s gliding down a 6.5° path at L/D 8.71 to land 261 m away, with the honest range band of 210 to 345 m marked on the ground."
      steps={[
        { at: 0, label: "Glide", caption: "Released at 30 m and 8 m/s, the glider comes down a 6.5° path at L/D = 8.71." },
        { at: 2.1, label: "Range", caption: "In still air the range is altitude × L/D: 30 × 8.71 = 261 m." },
        {
          at: 3.3,
          label: "Band",
          caption: "Height times L/D gives 261 m, but the parasite-drag estimate swings it from 210 to 345 m — report the band (vertical scale exaggerated).",
        },
      ]}
    >
      {({ t }) => {
        const glide = clamp((t - 0.4) / 1.8); // steady glide from release to touchdown
        const band = seg(t, 3.3, 3.9); // opens from 261 m out to 210 and 345 m
        const land = op(seg(t, 2.1, 2.6));
        return (
          <>
            {glide > 0 ? (
              <line x1={X(0)} y1={rel} x2={lerp(X(0), X(261), glide)} y2={lerp(rel, g, glide)} stroke={C.accent} strokeWidth={3} />
            ) : null}
            {band > 0 ? (
              <rect
                x={lerp(X(261), X(210), band)}
                y={g - 6}
                width={lerp(X(261), X(345), band) - lerp(X(261), X(210), band)}
                height={12}
                fill={C.soft}
                stroke={C.muted}
                strokeWidth={1}
              />
            ) : null}
            <Ground x={20} y={g} w={440} />
            <circle cx={X(261)} cy={g} r={5} fill={C.accent} opacity={land} />

            {/* glider */}
            <polygon points={`${X(0) - 14},${rel - 6} ${X(0) + 14},${rel + 4} ${X(0) + 2},${rel + 4}`} fill={C.ink} />
            <Arrow x1={X(0) + 22} y1={rel - 4} x2={X(0) + 72} y2={rel + 21} tone="ink" width={2} />
            <Label x={X(0) + 10} y={rel - 22} anchor="start" size={15}>release 30 m, 8 m/s</Label>
            <DimV x={24} y1={rel} y2={g} label="30 m" />

            <Label x={230} y={120} anchor="start" tone="accent" weight={600} opacity={op(seg(t, 1.2, 1.7))}>γ = 6.5°, L/D = 8.71</Label>
            <Label x={X(261) + 10} y={g - 18} anchor="start" tone="accent" weight={600} opacity={land}>261 m</Label>
            <Label x={(X(210) + X(345)) / 2} y={g + 26} tone="muted" size={15} opacity={op(seg(t, 3.6, 4.1))}>report 210–345 m</Label>
            <Label x={140} y={g + 26} tone="muted" size={15} opacity={op(seg(t, 2.3, 2.8))}>30 × 8.71</Label>
          </>
        );
      }}
    </AnimatedFigure>
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
    <AnimatedFigure
      height={280}
      duration={4.8}
      alt="A block on a 30° incline with its weight mg split into mg sin 30° down the slope and mg cos 30° into the slope, balanced by the normal force N; the acceleration is g sin 30° ≈ 4.9 m/s²."
      steps={[
        { at: 0, label: "Weight", caption: "The correction starts from the FBD: on the 30° incline, the block's weight mg points straight down." },
        {
          at: 1.5,
          label: "Into plane",
          caption: "Across the slope, mg·cos30° presses into the plane and the normal force N balances it.",
        },
        {
          at: 3.1,
          label: "Down slope",
          caption: "Draw the FBD first: cosine is the into-the-plane part that sets N; the sine part runs down the slope and gives a = g·sin30°.",
        },
      ]}
    >
      {({ t }) => (
        <>
          <polygon points={`${bl.x},${bl.y} ${br.x},${br.y} ${tl.x},${tl.y}`} fill="none" stroke={C.ink} strokeWidth={2.5} />
          <polyline points={`${bl.x},${bl.y - 14} ${bl.x + 14},${bl.y - 14} ${bl.x + 14},${bl.y}`} fill="none" stroke={C.muted} strokeWidth={1.5} />
          <ArcArrow cx={br.x} cy={br.y} r={50} a0={180} a1={208} tone="muted" width={1.5} />
          <Label x={378} y={250} tone="muted" size={15}>30°</Label>

          <rect x={cx - 25} y={cy - 25} width={50} height={50} fill={C.soft} stroke={C.ink} strokeWidth={2} transform={`rotate(30 ${cx} ${cy})`} />

          <GrowArrow p={seg(t, 0.4, 1)} x1={cx} y1={cy} x2={cx} y2={cy + W} tone="ink" width={3} />
          <Label x={cx + 10} y={cy + W - 6} anchor="start" weight={600} opacity={op(seg(t, 0.7, 1.2))}>mg</Label>
          <GrowArrow p={seg(t, 3.1, 3.7)} x1={cx} y1={cy} x2={along.x} y2={along.y} tone="accent" width={3} />
          <Label x={along.x + 10} y={along.y - 16} anchor="start" tone="accent" size={15} opacity={op(seg(t, 3.4, 3.9))}>mg sin30°</Label>
          <GrowArrow p={seg(t, 1.5, 2.1)} x1={cx} y1={cy} x2={into.x} y2={into.y} tone="muted" width={2} dashed />
          <Label x={into.x - 8} y={into.y + 8} anchor="end" tone="muted" size={15} opacity={op(seg(t, 1.8, 2.3))}>mg cos30°</Label>
          <GrowArrow p={seg(t, 2.1, 2.7)} x1={cx} y1={cy} x2={N.x} y2={N.y} tone="ink" width={2.5} />
          <Label x={N.x + 10} y={N.y} anchor="start" weight={600} opacity={op(seg(t, 2.4, 2.9))}>N</Label>

          <Label x={100} y={22} anchor="start" tone="accent" weight={600} opacity={op(seg(t, 3.7, 4.2))}>a = g·sin30° ≈ 4.9 m/s²</Label>
          <Label x={100} y={44} anchor="start" tone="alarm" size={15} opacity={op(seg(t, 4, 4.5))}>not g·cos30°</Label>
        </>
      )}
    </AnimatedFigure>
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
