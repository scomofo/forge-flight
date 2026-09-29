import { Arrow, Axes, C, DimH, Figure, Ground, Label, plotBox, type FigureMap } from "./kit";

/** 0A: the same 240 mm bar read in two units, and the factor chain that cancels mm. */
function RatiosUnits() {
  const x1 = 40;
  const x2 = 440;
  return (
    <Figure
      height={260}
      alt="A 240 mm bar dimensioned above in millimeters and below as 9.4 inches, with the factor-label chain 240 mm times 1 in over 25.4 mm equals 9.4 in, millimeters struck out."
      caption="Same bar, two labels. Put the unit you want gone on the bottom of the factor; it cancels, and the unit left over is your answer's unit."
    >
      <DimH x1={x1} x2={x2} y={36} label="240 mm on the drawing" />
      <rect x={x1} y={56} width={x2 - x1} height={30} rx={3} fill={C.soft} stroke={C.ink} strokeWidth={2} />
      <circle cx={x1 + 30} cy={71} r={6} fill={C.surface} stroke={C.ink} strokeWidth={1.5} />
      <circle cx={x2 - 30} cy={71} r={6} fill={C.surface} stroke={C.ink} strokeWidth={1.5} />
      <DimH x1={x1} x2={x2} y={120} label="9.4 in on the DRO" tone="accent" />

      <g transform="translate(0,170)">
        <Label x={62} y={32} size={20} serif>240 mm</Label>
        <line x1={77} y1={43} x2={101} y2={21} stroke={C.alarm} strokeWidth={2.5} />
        <Label x={124} y={32} size={20}>×</Label>
        <Label x={196} y={12} size={19} serif>1 in</Label>
        <line x1={146} y1={32} x2={246} y2={32} stroke={C.ink} strokeWidth={1.5} />
        <Label x={196} y={54} size={19} serif>25.4 mm</Label>
        <line x1={210} y1={65} x2={234} y2={43} stroke={C.alarm} strokeWidth={2.5} />
        <Label x={270} y={32} size={20}>=</Label>
        <Label x={330} y={32} size={21} serif tone="accent" weight={600}>9.4 in</Label>
        <Arrow x1={440} y1={70} x2={360} y2={50} tone="muted" width={1.5} />
        <Label x={440} y={84} anchor="end" tone="muted" size={15}>mm cancels, in survives</Label>
      </g>
    </Figure>
  );
}

/** 0B: a bar in tension, its cross-section, and σ = F/A turned round to A = F/σ. */
function Algebra() {
  return (
    <Figure
      height={250}
      alt="A bar pulled by 12 kN at each end with its 10 by 8 mm cross-section shown beside it, and the formula sigma equals F over A rearranged to A equals F over sigma, giving 80 square millimeters."
      caption="The relationship never changes; only the unknown moves. Do the same operation to both sides until A stands alone, then substitute once."
    >
      <Arrow x1={80} y1={70} x2={20} y2={70} tone="ink" />
      <Label x={48} y={44} size={15}>12 kN</Label>
      <rect x={80} y={55} width={220} height={30} rx={3} fill={C.soft} stroke={C.ink} strokeWidth={2} />
      <line x1={190} y1={45} x2={190} y2={95} stroke={C.muted} strokeWidth={1.5} strokeDasharray="5 4" />
      <Arrow x1={300} y1={70} x2={360} y2={70} tone="ink" />
      <Label x={332} y={44} size={15}>12 kN</Label>
      <rect x={395} y={50} width={50} height={40} fill={C.soft} stroke={C.accent} strokeWidth={2.5} />
      <Label x={420} y={71} tone="accent" weight={600}>A</Label>
      <Label x={420} y={110} tone="muted" size={15}>10 × 8 mm</Label>

      <Label x={110} y={160} size={21} serif>σ = F / A</Label>
      <Arrow x1={180} y1={160} x2={290} y2={160} tone="muted" width={1.5} />
      <Label x={235} y={140} tone="muted" size={15}>× A, ÷ σ</Label>
      <Label x={360} y={160} size={21} serif tone="accent" weight={600}>A = F / σ</Label>
      <Label x={240} y={215} size={19} serif>A = 12,000 N / 150 MPa = 80 mm²</Label>
    </Figure>
  );
}

/** 0C: the 80 × 50 × 6 mm aluminum bracket and the mm³ → m³ jump of 10⁹. */
function Powers() {
  // Oblique box: front face 80 × 6 mm at 2.5 px/mm, depth 50 mm drawn along (80, -60) px.
  const x0 = 60;
  const y0 = 150;
  const w = 200;
  const t = 15;
  const dx = 80;
  const dy = -60;
  return (
    <Figure
      height={280}
      alt="An aluminum bracket 80 by 50 by 6 mm drawn as a flat box, with its volume 2.4 times ten to the fourth cubic millimeters converted to 2.4 times ten to the minus fifth cubic meters and a mass of about 65 grams."
      caption="Cubing the unit cubes the factor: 1 m = 10³ mm, so 1 m³ = 10⁹ mm³. A palm-sized aluminum part should come out in tens of grams."
    >
      <Label x={240} y={28} tone="muted" size={16}>1 m = 10³ mm, so 1 m³ = 10⁹ mm³</Label>
      <polygon
        points={`${x0},${y0} ${x0 + w},${y0} ${x0 + w + dx},${y0 + dy} ${x0 + dx},${y0 + dy}`}
        fill={C.soft}
        stroke={C.ink}
        strokeWidth={2}
      />
      <polygon
        points={`${x0 + w},${y0} ${x0 + w + dx},${y0 + dy} ${x0 + w + dx},${y0 + dy + t} ${x0 + w},${y0 + t}`}
        fill={C.line}
        stroke={C.ink}
        strokeWidth={2}
      />
      <rect x={x0} y={y0} width={w} height={t} fill={C.line} stroke={C.ink} strokeWidth={2} />
      <DimH x1={x0} x2={x0 + w} y={y0 + t + 30} label="80 mm" />
      <Label x={x0 + w + dx / 2 + 26} y={y0 + dy / 2 + 12} tone="muted" size={15} anchor="start">50 mm</Label>
      <Label x={x0 - 8} y={y0 + t / 2} tone="muted" size={15} anchor="end">6 mm</Label>

      <Label x={240} y={228} size={18} serif>V = 2.4 × 10⁴ mm³ = 2.4 × 10⁻⁵ m³</Label>
      <Label x={240} y={260} size={18} serif tone="accent" weight={600}>m = 2700 kg/m³ × V ≈ 65 g</Label>
    </Figure>
  );
}

/** 0D: the load-cell calibration line through two points, read back at 6.93 mV. */
function Graphs() {
  const b = plotBox({ x: 64, y: 40, w: 370, h: 190, xMin: 0, xMax: 60, yMin: 0, yMax: 13 });
  const m = 0.21;
  const W = 6.93 / m;
  return (
    <Figure
      height={290}
      alt="A straight calibration line V equals 0.21 times W through the points 10 kg at 2.1 mV and 50 kg at 10.5 mV, with a rise-over-run triangle and a reading of 6.93 mV traced across to 33 kg."
      caption="Rise 8.4 mV over run 40 kg gives the slope; the line passes through zero. A new reading goes across to the line and down to the weight."
    >
      <Axes box={b} xLabel="load W (kg)" yLabel="V (mV)" />
      <path d={b.path([[0, 0], [60, 60 * m]])} fill="none" stroke={C.accent} strokeWidth={2.5} />
      <line x1={b.px(10)} y1={b.py(2.1)} x2={b.px(50)} y2={b.py(2.1)} stroke={C.muted} strokeWidth={1.5} strokeDasharray="5 4" />
      <line x1={b.px(50)} y1={b.py(2.1)} x2={b.px(50)} y2={b.py(10.5)} stroke={C.muted} strokeWidth={1.5} strokeDasharray="5 4" />
      <Label x={b.px(21.5)} y={b.py(2.1) + 16} tone="muted" size={15}>run 40 kg</Label>
      <Label x={b.px(50) + 8} y={b.py(6.3)} tone="muted" size={15} anchor="start">rise 8.4 mV</Label>
      <circle cx={b.px(10)} cy={b.py(2.1)} r={5} fill={C.ink} />
      <circle cx={b.px(50)} cy={b.py(10.5)} r={5} fill={C.ink} />
      <Label x={b.px(10) - 6} y={b.py(2.1) - 18} size={15} anchor="end">(10, 2.1)</Label>
      <Label x={b.px(50) + 10} y={b.py(10.5) + 16} size={15} anchor="start">(50, 10.5)</Label>

      <line x1={b.px(0)} y1={b.py(6.93)} x2={b.px(W)} y2={b.py(6.93)} stroke={C.ink} strokeWidth={1.5} strokeDasharray="3 4" />
      <Arrow x1={b.px(W)} y1={b.py(6.93)} x2={b.px(W)} y2={b.py(0) - 2} tone="ink" width={1.5} dashed />
      <Label x={b.px(0) - 6} y={b.py(6.93)} size={15} anchor="end">6.93</Label>
      <Label x={b.px(W)} y={b.py(0) + 18} size={15} tone="accent" weight={600}>33 kg</Label>
      <Label x={b.px(56)} y={b.py(12.5)} size={16} tone="accent" anchor="end">V = 0.21·W</Label>
    </Figure>
  );
}

/** 0E: the 500 N cable pull at 35° split into horizontal shear and vertical lift. */
function TrianglesVectors() {
  const ox = 80;
  const oy = 205;
  const s = 0.6; // px per N
  const th = (35 * Math.PI) / 180;
  const fx = 500 * Math.cos(th) * s;
  const fy = 500 * Math.sin(th) * s;
  const r = 52;
  return (
    <Figure
      height={300}
      alt="A 500 N cable pull at 35 degrees above horizontal leaving a bracket, drawn as the hypotenuse of a right triangle whose sides are the components Fx equals 410 N and Fy equals 287 N."
      caption="The bolt feels the two legs, not the diagonal: 500·cos 35° sliding it, 500·sin 35° lifting it. Recombine them and you get the 500 N back."
    >
      <Ground x={10} y={250} w={460} />
      <rect x={20} y={175} width={60} height={75} fill={C.soft} stroke={C.ink} strokeWidth={2} />
      <circle cx={50} cy={212} r={6} fill={C.surface} stroke={C.ink} strokeWidth={1.5} />
      <Arrow x1={ox} y1={oy} x2={ox + fx} y2={oy} tone="accent" />
      <Arrow x1={ox + fx} y1={oy} x2={ox + fx} y2={oy - fy} tone="accent" />
      <Arrow x1={ox} y1={oy} x2={ox + fx} y2={oy - fy} tone="ink" />
      <path
        d={`M${ox + r},${oy} A${r},${r} 0 0 0 ${ox + r * Math.cos(th)},${oy - r * Math.sin(th)}`}
        fill="none"
        stroke={C.muted}
        strokeWidth={1.5}
      />
      <Label x={ox + r + 22} y={oy - 16} size={15} tone="muted">35°</Label>
      <Label x={ox + fx / 2 - 22} y={oy - fy / 2 - 22} weight={600}>500 N</Label>
      <Label x={ox + fx / 2} y={oy + 22} tone="accent">Fx = 410 N</Label>
      <Label x={ox + fx + 10} y={oy - fy / 2} tone="accent" anchor="start">Fy = 287 N</Label>
      <Label x={240} y={283} size={16} serif>√(410² + 287²) ≈ 500 N</Label>
    </Figure>
  );
}

export const mathFigures: FigureMap = {
  "math/ratios-units": RatiosUnits,
  "math/algebra": Algebra,
  "math/powers": Powers,
  "math/graphs": Graphs,
  "math/triangles-vectors": TrianglesVectors,
};
