import { useState } from "react";
import { BenchShell, Readouts, Segmented, Slider, fmt } from "./ui";

const LEN_TO_M: Record<string, number> = {
  mm: 0.001,
  cm: 0.01,
  m: 1,
  in: 0.0254,
  ft: 0.3048,
};
const LEN_UNITS = ["mm", "cm", "m", "in", "ft"] as const;
type LenUnit = (typeof LEN_UNITS)[number];

export function UnitsBench() {
  const [value, setValue] = useState(250);
  const [from, setFrom] = useState<LenUnit>("mm");
  const [to, setTo] = useState<LenUnit>("in");
  const factor = LEN_TO_M[from] / LEN_TO_M[to];
  const result = value * factor;

  return (
    <BenchShell
      prompt="Set 250 mm and convert to inches. || The readout lands near 9.84 in — about ten, matching the estimate. Now convert 6 ft to meters and watch the factor flip above 1."
      note="Length only. The method is identical for mass, force, and pressure: the unit you want to kill goes on the bottom of the factor."
      controls={
        <>
          <Slider
            label="Value"
            min={1}
            max={500}
            step={1}
            value={value}
            display={`${value}`}
            onChange={setValue}
          />
          <Segmented
            label="From"
            value={from}
            onChange={setFrom}
            options={LEN_UNITS.map((u) => ({ value: u, label: u }))}
          />
          <Segmented
            label="To"
            value={to}
            onChange={setTo}
            options={LEN_UNITS.map((u) => ({ value: u, label: u }))}
          />
        </>
      }
    >
      <Readouts
        items={[
          { label: "Result", value: `${fmt(result, 2)} ${to}` },
          { label: `1 ${from} in ${to}`, value: `${fmt(factor, 5)}` },
        ]}
      />
      <p className="text-sm leading-relaxed text-well-dim">
        {value} {from} × ({fmt(LEN_TO_M[from], 5)} m / 1 {from}) × (1 {to} / {fmt(LEN_TO_M[to], 5)} m) ={" "}
        {fmt(result, 2)} {to}. The meters cancel; only the target unit survives.
      </p>
    </BenchShell>
  );
}

type Known = {
  key: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  def: number;
};

type Formula = {
  id: string;
  label: string;
  unknowns: string[];
  formFor: (u: string) => string;
  knownsFor: (u: string) => [Known, Known];
  solve: (u: string, x: number, y: number) => string;
};

const FORMULAS: Formula[] = [
  {
    id: "stress",
    label: "σ = F / A",
    unknowns: ["σ", "F", "A"],
    formFor: (u) => (u === "σ" ? "σ = F / A" : u === "F" ? "F = σ · A" : "A = F / σ"),
    knownsFor: (u) => {
      const F: Known = { key: "F", label: "Force", unit: "kN", min: 1, max: 20, step: 0.5, def: 12 };
      const A: Known = { key: "A", label: "Area", unit: "mm²", min: 20, max: 400, step: 5, def: 80 };
      const S: Known = { key: "σ", label: "Stress", unit: "MPa", min: 50, max: 300, step: 5, def: 150 };
      return u === "σ" ? [F, A] : u === "F" ? [S, A] : [F, S];
    },
    solve: (u, x, y) =>
      u === "σ" ? `${fmt((x * 1000) / y, 1)} MPa` : u === "F" ? `${fmt((x * y) / 1000, 2)} kN` : `${fmt((x * 1000) / y, 1)} mm²`,
  },
  {
    id: "ohm",
    label: "V = I · R",
    unknowns: ["V", "I", "R"],
    formFor: (u) => (u === "V" ? "V = I · R" : u === "I" ? "I = V / R" : "R = V / I"),
    knownsFor: (u) => {
      const V: Known = { key: "V", label: "Voltage", unit: "V", min: 1, max: 48, step: 1, def: 12 };
      const I: Known = { key: "I", label: "Current", unit: "A", min: 0.5, max: 10, step: 0.1, def: 2 };
      const R: Known = { key: "R", label: "Resistance", unit: "Ω", min: 1, max: 100, step: 1, def: 24 };
      return u === "V" ? [I, R] : u === "I" ? [V, R] : [V, I];
    },
    solve: (u, x, y) =>
      u === "V" ? `${fmt(x * y, 1)} V` : u === "I" ? `${fmt(x / y, 2)} A` : `${fmt(x / y, 1)} Ω`,
  },
  {
    id: "density",
    label: "ρ = m / V",
    unknowns: ["ρ", "m", "V"],
    formFor: (u) => (u === "ρ" ? "ρ = m / V" : u === "m" ? "m = ρ · V" : "V = m / ρ"),
    knownsFor: (u) => {
      const M: Known = { key: "m", label: "Mass", unit: "g", min: 10, max: 2000, step: 10, def: 270 };
      const V: Known = { key: "V", label: "Volume", unit: "cm³", min: 10, max: 1000, step: 10, def: 100 };
      const D: Known = { key: "ρ", label: "Density", unit: "g/cm³", min: 0.5, max: 10, step: 0.1, def: 2.7 };
      return u === "ρ" ? [M, V] : u === "m" ? [D, V] : [M, D];
    },
    solve: (u, x, y) =>
      u === "ρ" ? `${fmt(x / y, 2)} g/cm³` : u === "m" ? `${fmt(x * y, 0)} g` : `${fmt(x / y, 1)} cm³`,
  },
];

export function RearrangeBench() {
  const [formulaId, setFormulaId] = useState("stress");
  const [unknown, setUnknown] = useState("A");
  const formula = FORMULAS.find((f) => f.id === formulaId) ?? FORMULAS[0];
  const [kx, ky] = formula.knownsFor(unknown);
  const [x, setX] = useState(kx.def);
  const [y, setY] = useState(ky.def);

  const pickFormula = (id: string) => {
    const f = FORMULAS.find((q) => q.id === id) ?? FORMULAS[0];
    const u = f.unknowns[f.unknowns.length - 1];
    const [ax, ay] = f.knownsFor(u);
    setFormulaId(id);
    setUnknown(u);
    setX(ax.def);
    setY(ay.def);
  };
  const pickUnknown = (u: string) => {
    const [ax, ay] = formula.knownsFor(u);
    setUnknown(u);
    setX(ax.def);
    setY(ay.def);
  };

  return (
    <BenchShell
      prompt="Pick σ = F/A and solve for A with F = 12 kN. || The bench shows A = F/σ and 80 mm² at 150 MPa. Now solve the same formula for F — the rearrangement is yours, the bench only checks the arithmetic."
      note="The bench does the arithmetic. Your job is the rearrangement — the bench only confirms the symbols landed where you said they would."
      controls={
        <>
          <Segmented
            label="Formula"
            value={formulaId}
            onChange={pickFormula}
            options={FORMULAS.map((f) => ({ value: f.id, label: f.label }))}
          />
          <Segmented
            label="Solve for"
            value={unknown}
            onChange={pickUnknown}
            options={formula.unknowns.map((u) => ({ value: u, label: u }))}
          />
          <Slider
            label={`${kx.label} (${kx.unit})`}
            min={kx.min}
            max={kx.max}
            step={kx.step}
            value={x}
            display={`${x} ${kx.unit}`}
            onChange={setX}
          />
          <Slider
            label={`${ky.label} (${ky.unit})`}
            min={ky.min}
            max={ky.max}
            step={ky.step}
            value={y}
            display={`${y} ${ky.unit}`}
            onChange={setY}
          />
        </>
      }
    >
      <Readouts
        items={[
          { label: "Rearranged", value: formula.formFor(unknown) },
          { label: `${unknown} =`, value: formula.solve(unknown, x, y) },
        ]}
      />
      <p className="text-sm leading-relaxed text-well-dim">
        Symbols first, numbers last: the form above answers every {kx.label.toLowerCase()} and{" "}
        {ky.label.toLowerCase()}, not just these slider positions.
      </p>
    </BenchShell>
  );
}

export function PowersBench() {
  const [k, setK] = useState(1);
  const side = 10 * k;
  const mass = 2.7 * k * k * k;
  const px = Math.min(30 * k, 130);

  return (
    <BenchShell
      prompt="Double the cube: set k = 2. || Side ×2, area ×4, volume ×8, mass ×8 — the exponent matches the dimension. Now halve it: k = 0.5."
      note="The bench cube is aluminum at 2.7 g/cm³. The scaling rule does not care about the material — k² and k³ are pure geometry."
      controls={
        <Slider
          label="Scale factor k"
          min={0.5}
          max={4}
          step={0.1}
          value={k}
          display={`× ${fmt(k, 1)}`}
          onChange={setK}
        />
      }
    >
      <Readouts
        items={[
          { label: "Side", value: `${fmt(side, 1)} mm` },
          { label: "Area", value: `× ${fmt(k * k, 2)}` },
          { label: "Volume", value: `× ${fmt(k * k * k, 2)}` },
          { label: "Mass", value: `${fmt(mass, 1)} g` },
        ]}
      />
      <svg viewBox="0 0 160 120" className="mx-auto h-32" aria-hidden>
        <rect
          x={80 - px / 2}
          y={60 - px / 2}
          width={px}
          height={px}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <rect x={80 - 15} y={60 - 15} width={30} height={30} fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
      </svg>
      <p className="mt-2 text-center text-sm text-well-dim">
        Dashed: the original 10 mm cube. Solid: ×{fmt(k, 1)}.
      </p>
    </BenchShell>
  );
}

const SX = (x: number) => 160 + x * 24;
const SY = (y: number) => 100 - y * 14;

export function SlopeBench() {
  const [m, setM] = useState(0.5);
  const [b, setB] = useState(1);
  const tm = 0.5;
  const tb = 1;
  const dev = Math.max(
    Math.abs((m - tm) * -5 + (b - tb)),
    Math.abs(b - tb),
    Math.abs((m - tm) * 5 + (b - tb)),
  );

  return (
    <BenchShell
      prompt="Match the dashed calibration line with the sliders. || The error readout hits zero exactly on the target. Then break the match and watch which slider moves the line at x = 0."
      note="The bench line is exact. Real calibration data scatters around the line — the bench is the idealization the noisy data is judged against."
      controls={
        <>
          <Slider
            label="Slope m"
            min={-2}
            max={2}
            step={0.25}
            value={m}
            display={fmt(m, 2)}
            onChange={setM}
          />
          <Slider
            label="Intercept b"
            min={-5}
            max={5}
            step={0.5}
            value={b}
            display={fmt(b, 1)}
            onChange={setB}
          />
        </>
      }
    >
      <Readouts
        items={[
          { label: "Your line", value: `y = ${fmt(m, 2)}x + ${fmt(b, 1)}` },
          { label: "Match error", value: dev < 0.005 ? "0 — on the line" : fmt(dev, 2) },
        ]}
      />
      <svg viewBox="0 0 320 200" className="h-48 w-full" aria-hidden>
        {[-5, -4, -3, -2, -1, 1, 2, 3, 4, 5].map((g) => (
          <g key={g} opacity="0.18" stroke="currentColor" strokeWidth="1">
            <line x1={SX(g)} y1={SY(-6)} x2={SX(g)} y2={SY(6)} />
            <line x1={SX(-6)} y1={SY(g)} x2={SX(6)} y2={SY(g)} />
          </g>
        ))}
        <line x1={SX(-6)} y1={SY(0)} x2={SX(6)} y2={SY(0)} stroke="currentColor" strokeWidth="1.5" />
        <line x1={SX(0)} y1={SY(-6)} x2={SX(0)} y2={SY(6)} stroke="currentColor" strokeWidth="1.5" />
        <line
          x1={SX(-6)}
          y1={SY(tm * -6 + tb)}
          x2={SX(6)}
          y2={SY(tm * 6 + tb)}
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="7 5"
          opacity="0.65"
        />
        <line
          x1={SX(-6)}
          y1={SY(m * -6 + b)}
          x2={SX(6)}
          y2={SY(m * 6 + b)}
          stroke="currentColor"
          strokeWidth="2.5"
        />
      </svg>
      <p className="mt-2 text-center text-sm text-well-dim">
        Dashed: the target calibration line, y = 0.50x + 1. Solid: your line.
      </p>
    </BenchShell>
  );
}

export function TrigBench() {
  const [deg, setDeg] = useState(35);
  const th = (deg * Math.PI) / 180;
  const F = 500;
  const L = 110;
  const ox = 40;
  const oy = 140;
  const ex = ox + L * Math.cos(th);
  const ey = oy - L * Math.sin(th);
  const fx = F * Math.cos(th);
  const fy = F * Math.sin(th);
  const arcR = 26;
  const arcEndX = ox + arcR * Math.cos(th);
  const arcEndY = oy - arcR * Math.sin(th);

  return (
    <BenchShell
      prompt="Set 35° and read the components of a 500 N pull. || Fx ≈ 410 N, Fy ≈ 287 N. Swing to 90° and watch the horizontal component die to zero."
      note="The bench triangle is exact geometry. Real cable angles are measured, not set — the bench teaches the decomposition, not the measurement."
      controls={
        <Slider
          label="Angle θ"
          min={0}
          max={90}
          step={1}
          value={deg}
          display={`${deg}°`}
          onChange={setDeg}
        />
      }
    >
      <Readouts
        items={[
          { label: "sin θ", value: fmt(Math.sin(th), 3) },
          { label: "cos θ", value: fmt(Math.cos(th), 3) },
          { label: "Fx = 500·cos θ", value: `${fmt(fx, 0)} N` },
          { label: "Fy = 500·sin θ", value: `${fmt(fy, 0)} N` },
        ]}
      />
      <svg viewBox="0 0 320 170" className="h-44 w-full" aria-hidden>
        <line x1={ox} y1={oy} x2={ex} y2={oy} stroke="currentColor" strokeWidth="1" opacity="0.4" strokeDasharray="4 3" />
        <line x1={ox} y1={oy} x2={ex} y2={ey} stroke="currentColor" strokeWidth="2.5" />
        <line x1={ox} y1={oy} x2={ex} y2={oy} stroke="currentColor" strokeWidth="2" />
        <line x1={ex} y1={ey} x2={ex} y2={oy} stroke="currentColor" strokeWidth="2" />
        <rect x={ex - 8} y={oy - 8} width={8} height={8} fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6" />
        <path
          d={`M ${ox + arcR} ${oy} A ${arcR} ${arcR} 0 0 0 ${arcEndX} ${arcEndY}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <text x={ox + arcR + 6} y={oy - 4} fill="currentColor" fontSize="12">
          {deg}°
        </text>
        <text x={(ox + ex) / 2 - 8} y={(oy + ey) / 2 - 8} fill="currentColor" fontSize="12">
          500 N
        </text>
        <text x={(ox + ex) / 2 - 6} y={oy + 18} fill="currentColor" fontSize="12" opacity="0.75">
          Fx
        </text>
        <text x={ex + 8} y={(ey + oy) / 2 + 4} fill="currentColor" fontSize="12" opacity="0.75">
          Fy
        </text>
      </svg>
      <p className="mt-2 text-center text-sm text-well-dim">
        The hypotenuse is the pull; the legs are what the bolt actually feels.
      </p>
    </BenchShell>
  );
}
