import { ConceptHelp } from "@/components/concept-help";
import { LOAD_CELL_POINTS, LOAD_CELL_FIT } from "@/course/graph-reasoning";
import { Axes, C, DimH, Ground, Label, plotBox, type FigureMap } from "./kit";
import { AnimatedFigure, GrowArrow, lerp, op, partial, seg } from "./motion";

/** 0A: the same 240 mm bar read in two units, and the factor chain that cancels mm. */
function RatiosUnits() {
  const x1 = 40;
  const x2 = 440;
  return (
    <AnimatedFigure
      height={260}
      duration={5}
      alt="A 240 mm bar dimensioned above in millimeters and below as 9.4 inches, with the factor-label chain 240 mm times 1 in over 25.4 mm equals 9.4 in, millimeters struck out."
      steps={[
        { at: 0, label: "Drawing", caption: "The drawing says 240 mm, and the stock list is in inches." },
        {
          at: 1.2,
          label: "Factor",
          caption: "Write the conversion as a fraction, 1 in / 25.4 mm: top and bottom are the same length, so it changes only the unit.",
        },
        {
          at: 2.5,
          label: "Cancel",
          caption: "Cancel the units like algebraic factors: the mm on top strikes out against the mm on the bottom.",
        },
        {
          at: 3.8,
          label: "Answer",
          caption:
            "Same bar, two labels. Put the unit you want gone on the bottom of the factor; it cancels, and the unit left over is your answer's unit.",
        },
      ]}
    >
      {({ t }) => {
        const strike1 = seg(t, 2.6, 3);
        const strike2 = seg(t, 2.9, 3.3);
        const factor = op(seg(t, 1.6, 2.1));
        const answer = op(seg(t, 3.8, 4.3));
        return (
          <>
            <g opacity={op(seg(t, 0.3, 0.8))}>
              <DimH x1={x1} x2={x2} y={36} label="240 mm on the drawing" />
            </g>
            <rect x={x1} y={56} width={x2 - x1} height={30} rx={3} fill={C.soft} stroke={C.ink} strokeWidth={2} />
            <circle cx={x1 + 30} cy={71} r={6} fill={C.surface} stroke={C.ink} strokeWidth={1.5} />
            <circle cx={x2 - 30} cy={71} r={6} fill={C.surface} stroke={C.ink} strokeWidth={1.5} />
            <g opacity={op(seg(t, 4.1, 4.6))}>
              <DimH x1={x1} x2={x2} y={120} label="9.4 in on the DRO" tone="accent" />
            </g>

            <g transform="translate(0,170)">
              <Label x={62} y={32} size={20} serif opacity={op(seg(t, 1.2, 1.7))}>240 mm</Label>
              {strike1 > 0.02 ? (
                <line x1={77} y1={43} x2={lerp(77, 101, strike1)} y2={lerp(43, 21, strike1)} stroke={C.alarm} strokeWidth={2.5} />
              ) : null}
              <Label x={124} y={32} size={20} opacity={factor}>×</Label>
              <Label x={196} y={12} size={19} serif opacity={factor}>1 in</Label>
              <line x1={146} y1={32} x2={246} y2={32} stroke={C.ink} strokeWidth={1.5} opacity={factor} />
              <Label x={196} y={54} size={19} serif opacity={factor}>25.4 mm</Label>
              {strike2 > 0.02 ? (
                <line x1={210} y1={65} x2={lerp(210, 234, strike2)} y2={lerp(65, 43, strike2)} stroke={C.alarm} strokeWidth={2.5} />
              ) : null}
              <Label x={270} y={32} size={20} opacity={answer}>=</Label>
              <Label x={330} y={32} size={21} serif tone="accent" weight={600} opacity={answer}>9.4 in</Label>
              <GrowArrow p={seg(t, 4.4, 4.9)} x1={440} y1={70} x2={360} y2={50} tone="muted" width={1.5} />
              <Label x={440} y={84} anchor="end" tone="muted" size={15} opacity={op(seg(t, 4.3, 4.8))}>mm cancels, in survives</Label>
            </g>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** 0B: a bar in tension, its cross-section, and σ = F/A turned round to A = F/σ. */
function Algebra() {
  return (
    <AnimatedFigure
      height={250}
      duration={4.9}
      alt="A bar pulled by 12 kN at each end with its 10 by 8 mm cross-section shown beside it, and the formula sigma equals F over A rearranged to A equals F over sigma, giving 80 square millimeters."
      steps={[
        {
          at: 0,
          label: "Load",
          caption: "The load is 12 kN and the allowable stress is 150 MPa: what cross-section area A does the bar need?",
        },
        { at: 1.6, label: "Formula", caption: "σ = F/A gives stress when you know force and area; here it has to run backward." },
        {
          at: 2.7,
          label: "Rearrange",
          caption: "Undo what the formula does to A, doing the same to both sides: multiply by A, then divide by σ.",
        },
        {
          at: 4,
          label: "Substitute",
          caption:
            "The relationship never changes; only the unknown moves. Do the same operation to both sides until A stands alone, then substitute once.",
        },
      ]}
    >
      {({ t }) => {
        const pull = seg(t, 0.3, 0.8);
        const load = op(seg(t, 0.5, 1));
        const section = op(seg(t, 0.9, 1.4));
        return (
          <>
            <GrowArrow p={pull} x1={80} y1={70} x2={20} y2={70} tone="ink" />
            <Label x={48} y={44} size={15} opacity={load}>12 kN</Label>
            <rect x={80} y={55} width={220} height={30} rx={3} fill={C.soft} stroke={C.ink} strokeWidth={2} />
            <line x1={190} y1={45} x2={190} y2={95} stroke={C.muted} strokeWidth={1.5} strokeDasharray="5 4" opacity={section} />
            <GrowArrow p={pull} x1={300} y1={70} x2={360} y2={70} tone="ink" />
            <Label x={332} y={44} size={15} opacity={load}>12 kN</Label>
            <rect x={395} y={50} width={50} height={40} fill={C.soft} stroke={C.accent} strokeWidth={2.5} opacity={section} />
            <Label x={420} y={71} tone="accent" weight={600} opacity={section}>A</Label>
            <Label x={420} y={110} tone="muted" size={15} opacity={op(seg(t, 4.3, 4.8))}>10 × 8 mm</Label>

            <Label x={110} y={160} size={21} serif opacity={op(seg(t, 1.6, 2.1))}>σ = F / A</Label>
            <GrowArrow p={seg(t, 2.7, 3.2)} x1={180} y1={160} x2={290} y2={160} tone="muted" width={1.5} />
            <Label x={235} y={140} tone="muted" size={15} opacity={op(seg(t, 2.9, 3.4))}>× A, ÷ σ</Label>
            <Label x={360} y={160} size={21} serif tone="accent" weight={600} opacity={op(seg(t, 3.2, 3.7))}>A = F / σ</Label>
            <Label x={240} y={215} size={19} serif opacity={op(seg(t, 4, 4.5))}>A = 12,000 N / 150 MPa = 80 mm²</Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** 0C: the 80 × 50 × 6 mm aluminum bracket and the mm³ → m³ jump of 10⁹. */
function Powers() {
  // Oblique box: front face 80 × 6 mm at 2.5 px/mm, depth 50 mm drawn along (80, -60) px.
  const x0 = 60;
  const y0 = 150;
  const w = 200;
  const tk = 15;
  const dx = 80;
  const dy = -60;
  return (
    <AnimatedFigure
      height={340}
      duration={7.2}
      toolbar={<ConceptHelp help={[{ concept: "material-density" }]} />}
      alt="An aluminum bracket measures 80 by 50 by 6 mm. Geometry gives volume 2.4 times ten to the minus fifth cubic metres. Density is a separate given: aluminum is approximately 2700 kilograms per cubic metre, from a material table. Mass equals density times volume, giving 0.0648 kg, or about 65 grams."
      steps={[
        { at: 0, label: "Bracket", caption: "An aluminum bracket measures 80 × 50 × 6 mm; estimate its mass." },
        {
          at: 1.5,
          label: "Cube it",
          caption: "Since 1 m = 10³ mm, 1 m³ = (10³)³ = 10⁹ mm³: the exponent triples because the unit is cubed.",
        },
        { at: 2.8, label: "Volume", caption: "80 × 50 × 6 = 24,000 mm³ = 2.4 × 10⁴ mm³, which is 2.4 × 10⁻⁵ m³." },
        {
          at: 4.1,
          label: "Density (given)",
          caption: "ρ (rho) is density: mass per unit volume. For this example, use aluminum ≈ 2700 kg/m³, a typical value from a material table. The dimensions did not produce this number.",
        },
        {
          at: 6.1,
          label: "Mass",
          caption: "Geometry gave V = 2.4 × 10⁻⁵ m³. The material table supplied ρ ≈ 2700 kg/m³. Multiply: m = ρV = 0.0648 kg = 64.8 g ≈ 65 g. Density is looked up; mass is calculated.",
        },
      ]}
    >
      {({ t }) => (
        <>
          <Label x={240} y={28} tone="muted" size={16} opacity={op(seg(t, 1.5, 2))}>1 m = 10³ mm, so 1 m³ = 10⁹ mm³</Label>
          <polygon
            points={`${x0},${y0} ${x0 + w},${y0} ${x0 + w + dx},${y0 + dy} ${x0 + dx},${y0 + dy}`}
            fill={C.soft}
            stroke={C.ink}
            strokeWidth={2}
          />
          <polygon
            points={`${x0 + w},${y0} ${x0 + w + dx},${y0 + dy} ${x0 + w + dx},${y0 + dy + tk} ${x0 + w},${y0 + tk}`}
            fill={C.line}
            stroke={C.ink}
            strokeWidth={2}
          />
          <rect x={x0} y={y0} width={w} height={tk} fill={C.line} stroke={C.ink} strokeWidth={2} />
          <g opacity={op(seg(t, 0.3, 0.8))}>
            <DimH x1={x0} x2={x0 + w} y={y0 + tk + 30} label="80 mm" />
          </g>
          <Label x={x0 + w + dx / 2 + 26} y={y0 + dy / 2 + 12} tone="muted" size={15} anchor="start" opacity={op(seg(t, 0.5, 1))}>50 mm</Label>
          <Label x={x0 - 8} y={y0 + tk / 2} tone="muted" size={15} anchor="end" opacity={op(seg(t, 0.7, 1.2))}>6 mm</Label>

          <Label x={240} y={228} size={18} serif opacity={op(seg(t, 2.8, 3.3))}>V = 2.4 × 10⁴ mm³ = 2.4 × 10⁻⁵ m³</Label>
          <Label x={240} y={264} size={18} serif tone="accent" opacity={op(seg(t, 4.1, 4.6))}>ρ(aluminum) ≈ 2700 kg/m³</Label>
          <Label x={240} y={289} size={14} tone="muted" opacity={op(seg(t, 4.1, 4.6))}>Given · typical material-table value</Label>
          <Label x={240} y={323} size={18} serif tone="accent" weight={600} opacity={op(seg(t, 6.1, 6.6))}>m = ρV = 0.0648 kg ≈ 65 g</Label>
        </>
      )}
    </AnimatedFigure>
  );
}

/** 0D: the load-cell calibration line through two points, read back at 6.93 mV. */
function Graphs() {
  const b = plotBox({ x: 64, y: 40, w: 370, h: 190, xMin: 0, xMax: 60, yMin: 0, yMax: 13 });
  const m = LOAD_CELL_FIT.slope;
  const [[w1, v1], [w2, v2]] = LOAD_CELL_POINTS;
  const W = 6.93 / m;
  const fit: Array<[number, number]> = [[0, 0], [60, 60 * m]];
  return (
    <AnimatedFigure
      height={290}
      duration={9.6}
      alt="A straight calibration line V equals 0.21 times W through the points 10 kg at 2.1 mV and 50 kg at 10.5 mV, with a rise-over-run triangle and a reading of 6.93 mV traced across to 33 kg."
      steps={[
        { at: 0, label: "Points", caption: `Supplied calibration readings: ${w1} kg gives ${v1} mV; ${w2} kg gives ${v2} mV. The horizontal axis is load (kg); the vertical axis is voltage (mV).` },
        { at: 1.5, label: "Run", caption: "Run = (50 − 10) kg = 40 kg: the change between the two supplied calibration loads. Rise = (10.5 − 2.1) mV = 8.4 mV. Subtract second minus first in both." },
        { at: 3, label: "Slope", caption: "Slope = rise/run = 8.4 mV ÷ 40 kg = 0.21 mV/kg. Reversing both differences gives (−8.4)/(−40) = 0.21 too." },
        { at: 4.5, label: "Intercept", caption: "Find b using V = mW + b and the 10 kg reading: 2.1 = 0.21 × 10 + b = 2.1 + b. Subtract 2.1 from both sides: b = 0 mV." },
        { at: 6, label: "Line", caption: "Check the second point: b = 10.5 − 0.21 × 50 = 0 mV too. For these readings the fitted line is V = 0.21·W. A real sensor may have a zero-load offset." },
        {
          at: 7.3,
          label: "Read",
          caption:
            "Given 6.93 mV, follow the fitted line to W = (6.93 − 0)/0.21 = 33 kg. This is interpolation between the two calibration loads; check the model with another reading.",
        },
      ]}
    >
      {({ t }) => {
        const line = seg(t, 6, 6.8);
        const run = seg(t, 1.5, 2.1);
        const rise = seg(t, 2.1, 2.7);
        const across = seg(t, 7.4, 8);
        const first = op(seg(t, 0.3, 0.8));
        const second = op(seg(t, 0.6, 1.1));
        return (
          <>
            <Axes box={b} xLabel="load W (kg)" yLabel="V (mV)" />
            {line > 0 ? <path d={b.path(partial(fit, line))} fill="none" stroke={C.accent} strokeWidth={2.5} /> : null}
            {run > 0 ? (
              <line x1={b.px(10)} y1={b.py(2.1)} x2={lerp(b.px(10), b.px(50), run)} y2={b.py(2.1)} stroke={C.muted} strokeWidth={1.5} strokeDasharray="5 4" />
            ) : null}
            {rise > 0 ? (
              <line x1={b.px(50)} y1={b.py(2.1)} x2={b.px(50)} y2={lerp(b.py(2.1), b.py(10.5), rise)} stroke={C.muted} strokeWidth={1.5} strokeDasharray="5 4" />
            ) : null}
            <Label x={b.px(30)} y={b.py(2.1) + 16} tone="muted" size={15} opacity={op(seg(t, 1.8, 2.3))}>run = 50 − 10 = 40 kg</Label>
            <Label x={b.px(50) + 8} y={b.py(6.3)} tone="muted" size={15} anchor="start" opacity={op(seg(t, 2.4, 2.9))}>rise 8.4 mV</Label>
            <circle cx={b.px(10)} cy={b.py(2.1)} r={5} fill={C.ink} opacity={first} />
            <circle cx={b.px(50)} cy={b.py(10.5)} r={5} fill={C.ink} opacity={second} />
            <Label x={b.px(10) - 6} y={b.py(2.1) - 18} size={15} anchor="end" opacity={first}>(10, 2.1)</Label>
            <Label x={b.px(50) + 10} y={b.py(10.5) + 16} size={15} anchor="start" opacity={second}>(50, 10.5)</Label>

            {across > 0 ? (
              <line x1={b.px(0)} y1={b.py(6.93)} x2={lerp(b.px(0), b.px(W), across)} y2={b.py(6.93)} stroke={C.ink} strokeWidth={1.5} strokeDasharray="3 4" />
            ) : null}
            <GrowArrow p={seg(t, 8, 8.5)} x1={b.px(W)} y1={b.py(6.93)} x2={b.px(W)} y2={b.py(0) - 2} tone="ink" width={1.5} dashed />
            <Label x={b.px(0) - 6} y={b.py(6.93)} size={15} anchor="end" opacity={op(seg(t, 7.3, 7.7))}>6.93</Label>
            <Label x={b.px(W)} y={b.py(0) + 18} size={15} tone="accent" weight={600} opacity={op(seg(t, 8.3, 8.8))}>33 kg</Label>
            <Label x={b.px(56)} y={b.py(12.5)} size={16} tone="accent" anchor="end" opacity={op(seg(t, 6.5, 7))}>V = 0.21·W</Label>
          </>
        );
      }}
    </AnimatedFigure>
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
    <AnimatedFigure
      height={300}
      duration={4.5}
      alt="A 500 N cable pull at 35 degrees above horizontal leaving a bracket, drawn as the hypotenuse of a right triangle whose sides are the components Fx equals 410 N and Fy equals 287 N."
      steps={[
        { at: 0, label: "Pull", caption: "A cable pulls the bracket with 500 N at 35° above horizontal." },
        { at: 1.5, label: "Across", caption: "The adjacent side is Fx = 500·cos 35° ≈ 500 × 0.819 = 410 N." },
        { at: 2.7, label: "Up", caption: "The opposite side is Fy = 500·sin 35° ≈ 500 × 0.574 = 287 N." },
        {
          at: 3.9,
          label: "Check",
          caption:
            "The bolt feels the two legs, not the diagonal: 500·cos 35° sliding it, 500·sin 35° lifting it. Recombine them and you get the 500 N back.",
        },
      ]}
    >
      {({ t }) => {
        const angle = op(seg(t, 0.8, 1.3));
        return (
          <>
            <Ground x={10} y={250} w={460} />
            <rect x={20} y={175} width={60} height={75} fill={C.soft} stroke={C.ink} strokeWidth={2} />
            <circle cx={50} cy={212} r={6} fill={C.surface} stroke={C.ink} strokeWidth={1.5} />
            <GrowArrow p={seg(t, 1.5, 2.1)} x1={ox} y1={oy} x2={ox + fx} y2={oy} tone="accent" />
            <GrowArrow p={seg(t, 2.7, 3.3)} x1={ox + fx} y1={oy} x2={ox + fx} y2={oy - fy} tone="accent" />
            <GrowArrow p={seg(t, 0.3, 0.9)} x1={ox} y1={oy} x2={ox + fx} y2={oy - fy} tone="ink" />
            <path
              d={`M${ox + r},${oy} A${r},${r} 0 0 0 ${ox + r * Math.cos(th)},${oy - r * Math.sin(th)}`}
              fill="none"
              stroke={C.muted}
              strokeWidth={1.5}
              opacity={angle}
            />
            <Label x={ox + r + 22} y={oy - 16} size={15} tone="muted" opacity={angle}>35°</Label>
            <Label x={ox + fx / 2 - 22} y={oy - fy / 2 - 22} weight={600} opacity={op(seg(t, 0.6, 1.1))}>500 N</Label>
            <Label x={ox + fx / 2} y={oy + 22} tone="accent" opacity={op(seg(t, 1.8, 2.3))}>Fx = 410 N</Label>
            <Label x={ox + fx + 10} y={oy - fy / 2} tone="accent" anchor="start" opacity={op(seg(t, 3, 3.5))}>Fy = 287 N</Label>
            <Label x={240} y={283} size={16} serif opacity={op(seg(t, 3.9, 4.4))}>√(410² + 287²) ≈ 500 N</Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

export const mathFigures: FigureMap = {
  "math/ratios-units": RatiosUnits,
  "math/algebra": Algebra,
  "math/powers": Powers,
  "math/graphs": Graphs,
  "math/triangles-vectors": TrianglesVectors,
};
