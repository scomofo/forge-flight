import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { BenchShell, fmt, Readouts, Slider, useReducedMotion, useTicker } from "./ui";

const jobs: { job: string; answer: string; why: string }[] = [
  {
    job: "A million identical aluminum clips, bent from sheet.",
    answer: "Deform",
    why: "The shape is a bend, repeated. Pay for the die once. Cutting each clip from a block throws the skeleton away a million times.",
  },
  {
    job: "One steel bracket, needed this week, with a precise hole and a slot.",
    answer: "Cut",
    why: "There is no second part to share a die. A cutter makes the hole and the slot from plate, and both features open onto a face the tool can enter.",
  },
  {
    job: "An engine block: thick, hollow, with passages a tool cannot enter from outside.",
    answer: "Freeze",
    why: "The metal starts as liquid. Cores occupy the passages. You machine only the faces that must be precise. A drill cannot turn a corner it never reached.",
  },
  {
    job: "Two plates that must become one load path.",
    answer: "Join",
    why: "The shape is an assembly. A weld or a fastener makes the path. It also makes a heat-affected zone or a hole. The joint is now part of the specification.",
  },
  {
    job: "One lattice, never to be repeated, with tunnels a cutter cannot enter.",
    answer: "Add",
    why: "A mold will not be paid back by a second part. The tunnels are built over, not drilled into. The price is a direction: the build axis is not the same metal as the layer.",
  },
];

const acts = ["Freeze", "Deform", "Cut", "Join", "Add"];

export function MechanismBench() {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const done = i >= jobs.length;
  const item = jobs[i];

  return (
    <BenchShell
      prompt="Read the part, then pick Freeze, Deform, Cut, Join, or Add. || The note names the constraint that decided it. A machine brand is not a reason."
      note="Another act can sometimes finish the same outline. The question is which constraint is doing the deciding."
      controls={
        <div className="sm:col-span-2">
          {done ? (
            <button
              type="button"
              className="min-h-11 rounded-lg px-4 text-sm text-well-fg ring-1 ring-white/25"
              onClick={() => {
                setI(0);
                setPicked(null);
                setCorrect(0);
              }}
            >
              Sort them again
            </button>
          ) : picked ? (
            <button
              type="button"
              className="min-h-11 rounded-lg bg-well-fg px-4 text-sm text-well"
              onClick={() => {
                if (picked === item.answer) setCorrect((c) => c + 1);
                setPicked(null);
                setI((n) => n + 1);
              }}
            >
              {i === jobs.length - 1 ? "See the tally" : "Next part"}
            </button>
          ) : (
            <p className="text-sm text-well-dim">
              Part {i + 1} of {jobs.length}
            </p>
          )}
        </div>
      }
    >
      {done ? (
        <div>
          <Readouts items={[{ label: "Matched", value: `${correct} of ${jobs.length}` }]} />
          <p className="max-w-prose text-sm leading-relaxed text-well-dim">
            {correct >= 4
              ? "The acts are separating. Next, the chip: what the cut actually costs in force."
              : "Look again at the constraint that cannot move — no entrance for a tool, a million repeats, only one part — and match that."}
          </p>
        </div>
      ) : (
        <div>
          <p className="font-serif text-2xl leading-snug text-balance">{item.job}</p>
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {acts.map((act) => {
              const show = picked !== null;
              const isAnswer = act === item.answer;
              const isPick = act === picked;
              return (
                <button
                  key={act}
                  type="button"
                  disabled={picked !== null}
                  onClick={() => setPicked(act)}
                  className={cn(
                    "min-h-11 rounded-lg px-3 text-sm transition-transform duration-150 active:scale-[0.96]",
                    !show && "ring-1 ring-white/25",
                    show && isAnswer && "bg-well-fg text-well",
                    show && isPick && !isAnswer && "ring-1 ring-well-fg",
                    show && !isAnswer && !isPick && "opacity-40 ring-1 ring-white/15",
                  )}
                >
                  {act}
                </button>
              );
            })}
          </div>
          {picked ? (
            <>
              <ActFilm act={item.answer} />
              <p className="mt-4 text-sm leading-relaxed text-well-dim">{item.why}</p>
            </>
          ) : null}
        </div>
      )}
    </BenchShell>
  );
}

function ActFilm({ act }: { act: string }) {
  const [t, setT] = useState(0);
  const reduce = useReducedMotion();
  useTicker(!reduce, (dt) => setT((s) => s + dt));
  const p = reduce ? 1 : (t % 2.6) / 2.6;
  const grow = Math.min(1, p / 0.72);
  const line =
    act === "Freeze"
      ? "Freeze: the level rises in the mold. The shape was a liquid."
      : act === "Deform"
        ? "Deform: the punch comes down. The sheet keeps the bend."
        : act === "Cut"
          ? "Cut: the tool needs a path in. A chip leaves."
          : act === "Join"
            ? "Join: a bead runs the seam. The two plates become one path."
            : "Add: layers stack. The tunnel is built over, not drilled.";
  return (
    <div className="mt-5">
      <svg viewBox="0 0 320 78" className="h-20 w-full" aria-hidden>
        {act === "Freeze" ? (
          <>
            <path d="M90 18 H230 V68 H90 Z" fill="none" stroke="currentColor" strokeWidth="2" />
            <rect x="108" y={62 - grow * 36} width="104" height={grow * 36} fill="currentColor" opacity="0.35" />
          </>
        ) : null}
        {act === "Deform" ? (
          <>
            <rect x="148" y={4 + grow * 18} width="24" height="16" fill="currentColor" />
            <path
              d={`M40 58 Q160 ${58 + grow * 16} 280 58`}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
          </>
        ) : null}
        {act === "Cut" ? (
          <>
            <rect x="24" y="40" width="180" height="22" fill="none" stroke="currentColor" strokeWidth="2" />
            <path
              d={`M${150 + grow * 70} 28 L${186 + grow * 70} 18 L${196 + grow * 70} 36 L${156 + grow * 70} 40 Z`}
              fill="currentColor"
            />
            <path
              d={`M${168 + grow * 40} 40 Q${190 + grow * 50} 22 ${210 + grow * 40} 16`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </>
        ) : null}
        {act === "Join" ? (
          <>
            <rect x="40" y="28" width="110" height="28" fill="none" stroke="currentColor" strokeWidth="2" />
            <rect x="170" y="28" width="110" height="28" fill="none" stroke="currentColor" strokeWidth="2" />
            <path
              d={`M150 28 L${150 + grow * 20} 12 L${170 + grow * 20} 28`}
              fill="currentColor"
              opacity="0.85"
            />
          </>
        ) : null}
        {act === "Add" ? (
          <>
            {[0, 1, 2, 3, 4].map((i) =>
              grow * 5 > i ? (
                <rect
                  key={i}
                  x={70 + i * 6}
                  y={62 - (i + 1) * 10}
                  width={180 - i * 12}
                  height="8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              ) : null,
            )}
          </>
        ) : null}
      </svg>
      <p className="mt-2 text-sm leading-relaxed text-well-dim">{line}</p>
    </div>
  );
}

const chipMats = [
  { id: "al", name: "Aluminum", short: "Aluminum", u: 800 },
  { id: "steel", name: "Mild steel", short: "Steel", u: 2500 },
  { id: "ti", name: "Titanium", short: "Titanium", u: 3500 },
];

export function ChipBench() {
  const [id, setId] = useState("steel");
  const [h, setH] = useState(0.1);
  const [v, setV] = useState(80);
  const mat = chipMats.find((m) => m.id === id) ?? chipMats[1];
  const width = 3;
  const area = width * h;
  const force = mat.u * area;
  const powerKw = (force * (v / 60)) / 1000;
  const chipPx = 10 + h * 90;
  const [clock, setClock] = useState(0);
  useTicker(true, (dt) => setClock((s) => s + dt));
  const feed = (clock * (12 + v / 8)) % 56;

  return (
    <BenchShell
      prompt="Set steel and 0.10 mm uncut thickness, then double the thickness. || Force doubles. Power doubles if you left the speed alone."
      note="u is a teaching specific energy in N/mm², equal to J/mm³ times 1000. Width is fixed at 3 mm. No rake friction, no built-up edge, no wear. Real specific energy falls a little as the chip gets thicker. The chip curls off on a sped-up clock. Thickness sets its size. Speed sets how fast it leaves. Neither one is the force."
      controls={
        <>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            {chipMats.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setId(m.id)}
                className={cn(
                  "min-h-11 rounded-lg px-3 py-2 text-sm",
                  m.id === id ? "bg-well-fg text-well" : "ring-1 ring-white/25",
                )}
              >
                {m.short}
              </button>
            ))}
          </div>
          <Slider
            label="Uncut thickness"
            min={0.05}
            max={0.4}
            step={0.01}
            value={h}
            display={`${fmt(h, 2)} mm`}
            onChange={setH}
          />
          <Slider
            label="Speed"
            min={20}
            max={200}
            step={5}
            value={v}
            display={`${fmt(v, 0)} m/min`}
            onChange={setV}
          />
        </>
      }
    >
      <Readouts
        items={[
          { label: "Uncut area", value: `${fmt(area, 2)} mm²` },
          { label: "Force", value: `${fmt(force, 0)} N` },
          { label: "Power", value: `${fmt(powerKw, 2)} kW` },
        ]}
      />
      <svg viewBox="0 0 320 130" className="h-32 w-full" aria-hidden>
        <rect x="20" y="78" width="168" height="34" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M188 78 L262 48 L262 104 L210 104 Z" fill="none" stroke="currentColor" strokeWidth="2" />
        <path
          d={`M188 78 L${(188 - chipPx * 0.45).toFixed(1)} ${(78 - chipPx).toFixed(1)} L${(230 - chipPx * 0.2).toFixed(1)} ${(52 - chipPx).toFixed(1)} L236 56 Z`}
          fill="currentColor"
          transform={`translate(${(-feed).toFixed(1)} ${(-feed * 0.35).toFixed(1)})`}
        />
      </svg>
      <p className="mt-3 text-sm leading-relaxed text-well-dim">
        {`${mat.name} at ${fmt(mat.u, 0)} N/mm². Force is that energy times ${fmt(area, 2)} mm². Speed does not change the force here. It does change the power, because power is force times speed.`}
      </p>
    </BenchShell>
  );
}

const bendMats = [
  { id: "mild", name: "Mild steel", short: "Mild steel", e: 200000, y: 250 },
  { id: "hs", name: "HS steel", short: "HS steel", e: 200000, y: 800 },
  { id: "al", name: "Aluminum", short: "Aluminum", e: 70000, y: 270 },
  { id: "ti", name: "Titanium", short: "Titanium", e: 110000, y: 880 },
];

function bendArc(r: number, deg: number) {
  const a = (Math.min(deg, 179.9) * Math.PI) / 180;
  const cx = 150;
  const cy = 128;
  const x1 = cx - r;
  const y1 = cy;
  const x2 = cx + r * Math.cos(Math.PI - a);
  const y2 = cy - r * Math.sin(a);
  return `M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`;
}

export function SpringbackBench() {
  const [id, setId] = useState("al");
  const [t, setT] = useState(1);
  const [radius, setRadius] = useState(15);
  const mat = bendMats.find((m) => m.id === id) ?? bendMats[2];
  const kappa = 1 / radius;
  const kappaY = (2 * mat.y) / (mat.e * t);
  const flat = kappa <= kappaY + 1e-12;
  const kappaF = flat ? 0 : kappa - 1.5 * kappaY + (0.5 * kappaY ** 3) / (kappa * kappa);
  const lose = kappa - kappaF;
  const rf = flat ? Infinity : 1 / kappaF;
  const turning = flat ? 0 : 90 * (radius / rf);
  const included = flat ? 180 : 180 - turning;
  const opened = flat ? 90 : 90 - turning;
  const drawR = 36;
  const drawRf = flat ? drawR : Math.min(78, drawR * (rf / radius));
  const [clock, setClock] = useState(0);
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);
  useTicker(!reduce, (dt) => setClock((s) => s + dt));
  const phase = clock % 2.6;
  const openedFrac = reduce
    ? 1
    : phase < 1.1
      ? phase / 1.1
      : phase < 2.15
        ? 1
        : Math.max(0, 1 - (phase - 2.15) / 0.45);
  const shownTurning = flat ? 90 * (1 - openedFrac) : 90 - (90 - turning) * openedFrac;
  const shownR = flat ? drawR : drawR + (drawRf - drawR) * openedFrac;

  return (
    <BenchShell
      prompt="Bend aluminum at 1 mm thick on a 15 mm radius. Then switch to titanium, same thickness and radius. || Titanium opens further. Yield over modulus is higher, so more of the bend was elastic."
      note="Pure bending of an elastic-perfectly plastic strip, solved exactly. First yield is at curvature κ_y = 2 σ_y / (E t). At or below it the bend is all elastic and springs flat. Above it the curvature left is κ − 1.5 κ_y + 0.5 κ_y³ / κ². For sharp bends the curvature lost tends to 3 σ_y / (E t). Stretch-bending or bottoming the bend would cut springback. No friction. The bright arc opens from the punch, then the loop repeats. The angle after you let go is the readout."
      controls={
        <>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            {bendMats.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setId(m.id)}
                className={cn(
                  "min-h-11 rounded-lg px-3 py-2 text-sm",
                  m.id === id ? "bg-well-fg text-well" : "ring-1 ring-white/25",
                )}
              >
                {m.short}
              </button>
            ))}
          </div>
          <Slider
            label="Thickness"
            min={0.8}
            max={4}
            step={0.1}
            value={t}
            display={`${fmt(t, 1)} mm`}
            onChange={setT}
          />
          <Slider
            label="Radius under load"
            min={8}
            max={50}
            step={1}
            value={radius}
            display={`${fmt(radius, 0)} mm`}
            onChange={setRadius}
          />
        </>
      }
    >
      <Readouts
        items={[
          { label: "Under the punch", value: "90°" },
          { label: "After you let go", value: flat ? "Flat" : `${fmt(included, 1)}°` },
          { label: "Opens by", value: flat ? "Flat" : `${fmt(opened, 1)}°` },
          { label: "Radius after", value: flat ? "—" : `${fmt(rf, 1)} mm` },
        ]}
      />
      <svg viewBox="0 0 320 150" className="h-36 w-full" aria-hidden>
        <path d={bendArc(drawR, 90)} fill="none" stroke="currentColor" strokeWidth="2" opacity="0.35" />
        {flat && openedFrac > 0.92 ? (
          <path d="M114 128 H186" fill="none" stroke="currentColor" strokeWidth="2.5" />
        ) : (
          <path d={bendArc(shownR, Math.max(shownTurning, 0.5))} fill="none" stroke="currentColor" strokeWidth="2.5" />
        )}
      </svg>
      <p className="mt-3 text-sm leading-relaxed text-well-dim">
        {flat
          ? `${mat.name} never yields at this radius. 1/R is ${fmt(kappa, 4)} per mm, and first yield needs 2 σ/E t = ${fmt(kappaY, 4)} per mm. The whole bend was elastic, so it springs flat.`
          : `${mat.name}: σ/E is ${fmt(mat.y / mat.e, 5)}. It gives back ${fmt(lose, 4)} per mm of curvature. The angle between the legs goes from 90° to ${fmt(included, 1)}°. It opened ${fmt(opened, 1)}°. The faint arc is under the punch. The bright arc is after you let go.`}
      </p>
    </BenchShell>
  );
}

export function FreezeBench() {
  const [thick, setThick] = useState(20);
  const [d, setD] = useState(60);
  const length = 120;
  const width = 80;
  const volume = length * width * thick;
  const area = 2 * (length * width + length * thick + width * thick);
  const plate = volume / area;
  const riser = d / 6;
  const plateLast = plate > riser;
  const timeRatio = (riser * riser) / (plate * plate);
  const [clock, setClock] = useState(0);
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);
  useTicker(!reduce, (dt) => setClock((s) => s + dt));
  const plateDur = 1.7;
  const riserDur = 1.7 * Math.max(0.35, timeRatio);
  const cycle = Math.max(plateDur, riserDur) + 0.7;
  const phase = reduce ? cycle : clock % cycle;
  const plateSolid = Math.min(1, phase / plateDur);
  const riserSolid = Math.min(1, phase / riserDur);
  const plateH = Math.max(18, thick);
  const liquid = (1 - plateSolid) * 70;
  const riserR = Math.max(8, d * 0.28);
  const voidOpen = plateLast && plateSolid > 0.96 && riserSolid > 0.96;

  return (
    <BenchShell
      prompt="Set a plate thickness, then shrink the riser until its V/A drops below the plate. || A hollow opens in the plate. The riser froze first, so the shrinkage stayed in the part."
      note="Plate is 120 by 80 mm. Riser is a cylinder with height equal to diameter, so its V/A is D/6. The face they share is ignored. C cancels. The liquid shrinks from the outside. The hollow appears only if the plate is still liquid after the riser has frozen."
      controls={
        <>
          <Slider
            label="Plate thickness"
            min={8}
            max={40}
            step={1}
            value={thick}
            display={`${fmt(thick, 0)} mm`}
            onChange={setThick}
          />
          <Slider
            label="Riser diameter"
            min={20}
            max={90}
            step={1}
            value={d}
            display={`${fmt(d, 0)} mm`}
            onChange={setD}
          />
        </>
      }
    >
      <Readouts
        items={[
          { label: "Plate V/A", value: `${fmt(plate, 2)} mm` },
          { label: "Riser V/A", value: `${fmt(riser, 2)} mm` },
          { label: "Riser time / plate time", value: fmt(timeRatio, 2) },
        ]}
      />
      <svg viewBox="0 0 320 140" className="h-32 w-full" aria-hidden>
        <rect x="70" y="58" width="180" height={plateH} fill="none" stroke="currentColor" strokeWidth="2" />
        {liquid > 2 ? (
          <rect
            x={70 + (180 - liquid * 1.6) / 2}
            y={58 + (plateH - Math.min(plateH - 4, liquid * 0.45)) / 2}
            width={Math.max(4, liquid * 1.6)}
            height={Math.max(3, Math.min(plateH - 4, liquid * 0.45))}
            fill="currentColor"
            opacity="0.55"
          />
        ) : null}
        <circle cx="160" cy="58" r={riserR} fill="none" stroke="currentColor" strokeWidth="2" />
        {riserSolid < 0.98 ? (
          <circle cx="160" cy="58" r={Math.max(1.5, riserR * (1 - riserSolid))} fill="currentColor" opacity="0.75" />
        ) : null}
        {voidOpen ? (
          <ellipse cx="160" cy={58 + plateH / 2} rx="22" ry="7" fill="currentColor" opacity="0.8" />
        ) : null}
      </svg>
      <p className="mt-3 text-sm leading-relaxed text-well-dim">
        {plateLast
          ? "The plate's modulus is larger, so the plate freezes later. The hollow is the shrinkage the riser was supposed to take."
          : "The riser freezes later. Cut it off and the plate stays sound. A thinner plate freezes sooner and, in the same mold, grows a finer grain."}
      </p>
    </BenchShell>
  );
}

export function HazBench() {
  const [q, setQ] = useState(40);
  const fused = q >= 100;
  const width = 0.28 * Math.sqrt(q);
  const base = 400;
  const filler = 460;
  const haz = fused ? Math.max(200, base - Math.max(0, width - 2.2) * 40) : 0;
  const weak = fused ? Math.min(filler, haz, base) : 0;
  const where = !fused ? "No fusion" : haz < base ? "Heat-affected zone" : "Base metal";
  const band = Math.min(54, width * 8);
  const reduce = useReducedMotion();
  const [clock, setClock] = useState(0);
  useTicker(fused && !reduce, (dt) => setClock((s) => s + dt));
  const soak = fused ? (reduce ? 1 : (clock % 2.2) / 2.2) : 0;

  return (
    <BenchShell
      prompt="Start below fusion. Raise the heat until the joint fuses, then keep going. || The filler stays stronger than the plate. The weak line is the band beside the bead, and that band gets weaker as it gets wider."
      note="Fusion is a teaching threshold at 100 J/mm. Band width grows with the square root of heat per length. Strength in the band falls once the band is wider than 2.2 mm. No preheat and no second pass. The bright edge walks out from the bead and repeats. The full band is the number."
      controls={
        <Slider
          label="Heat per length"
          min={40}
          max={500}
          step={10}
          value={q}
          display={`${fmt(q, 0)} J/mm`}
          onChange={setQ}
        />
      }
    >
      <Readouts
        items={[
          { label: "Band width", value: fused ? `${fmt(width, 1)} mm` : "—" },
          { label: "Weak line", value: `${fmt(weak, 0)} MPa` },
          { label: "Where it fails", value: where },
        ]}
      />
      <svg viewBox="0 0 320 110" className="h-28 w-full" aria-hidden>
        <rect x="20" y="40" width={120 - band} height="36" fill="none" stroke="currentColor" strokeWidth="2" />
        <rect x={180 + band} y="40" width={120 - band} height="36" fill="none" stroke="currentColor" strokeWidth="2" />
        {fused ? (
          <>
            <rect x={140 - band} y="40" width={band} height="36" fill="currentColor" opacity="0.18" />
            <rect x="180" y="40" width={band} height="36" fill="currentColor" opacity="0.18" />
            <rect x={140 - band * soak} y="40" width={band * soak} height="36" fill="currentColor" opacity="0.45" />
            <rect x="180" y="40" width={band * soak} height="36" fill="currentColor" opacity="0.45" />
            <path d="M150 40 L170 22 L190 40" fill="currentColor" opacity="0.9" />
          </>
        ) : (
          <path d="M158 40 H182" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3" />
        )}
      </svg>
      <p className="mt-3 text-sm leading-relaxed text-well-dim">
        {!fused
          ? "The plates are not one piece. Filler strength is 460 MPa and does not matter yet, because nothing fused."
          : `Filler is ${filler} MPa. Untouched plate is ${base} MPa. The band beside the bead is ${fmt(haz, 0)} MPa, so the joint is ${fmt(weak, 0)} MPa.`}
      </p>
    </BenchShell>
  );
}

export function SpreadBench() {
  const [mean, setMean] = useState(10);
  const [sigma, setSigma] = useState(0.04);
  const lsl = 9.9;
  const usl = 10.1;
  const cp = (usl - lsl) / (6 * sigma);
  const cpk = Math.min(usl - mean, mean - lsl) / (3 * sigma);
  const gate = cpk >= 1.33;
  const x0 = 9.7;
  const x1 = 10.3;
  const px = (x: number) => 24 + ((x - x0) / (x1 - x0)) * 272;
  let peak = 0;
  const samples: { x: number; y: number }[] = [];
  for (let i = 0; i <= 64; i++) {
    const x = x0 + ((x1 - x0) * i) / 64;
    const z = (x - mean) / sigma;
    const y = Math.exp(-0.5 * z * z);
    samples.push({ x, y });
    if (y > peak) peak = y;
  }
  const line = samples
    .map((s) => `${px(s.x).toFixed(1)},${(108 - (s.y / peak) * 78).toFixed(1)}`)
    .join(" ");
  const reduce = useReducedMotion();
  const [dots, setDots] = useState<{ x: number; y: number }[]>([]);
  const wait = useRef(0);
  useEffect(() => {
    setDots([]);
    wait.current = 0;
  }, [mean, sigma]);
  useTicker(!reduce, (dt) => {
    wait.current += dt;
    const spawn = wait.current > 0.2;
    if (spawn) wait.current = 0;
    setDots((prev) => {
      const fallen = prev.map((d) => ({ x: d.x, y: Math.min(112, d.y + dt * 90) }));
      if (!spawn) return fallen;
      const u1 = Math.max(1e-6, Math.random());
      const u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      return [...fallen, { x: mean + z * sigma, y: 16 }].slice(-24);
    });
  });

  return (
    <BenchShell
      prompt="Center the mean on 10.00 mm and shrink the spread until Cpk reaches 1.33. Then shift the mean by 0.06 mm. || Cp stays. Cpk falls. Parts keep landing on the axis. The pile is the same width and sits closer to one wall. Marks outside the two lines missed the window."
      note="Normal, stable process. The window is fixed at 10.00 ± 0.10 mm. 1.33 is a common shop gate, about four standard deviations to the nearer limit, not a law. Each mark is one part landing on the size axis. Marks outside the two walls missed the window."
      controls={
        <>
          <Slider
            label="Mean"
            min={9.8}
            max={10.2}
            step={0.01}
            value={mean}
            display={`${fmt(mean, 2)} mm`}
            onChange={setMean}
          />
          <Slider
            label="Standard deviation"
            min={0.01}
            max={0.08}
            step={0.005}
            value={sigma}
            display={`${fmt(sigma, 3)} mm`}
            onChange={setSigma}
          />
        </>
      }
    >
      <Readouts
        items={[
          { label: "Cp", value: fmt(cp, 2) },
          { label: "Cpk", value: fmt(cpk, 2) },
          { label: "1.33 gate", value: gate ? "Met" : "Short" },
        ]}
      />
      <svg viewBox="0 0 320 130" className="h-32 w-full" aria-hidden>
        <line x1={px(lsl)} y1="22" x2={px(lsl)} y2="112" stroke="currentColor" strokeWidth="1.5" />
        <line x1={px(usl)} y1="22" x2={px(usl)} y2="112" stroke="currentColor" strokeWidth="1.5" />
        <line
          x1={px(mean)}
          y1="28"
          x2={px(mean)}
          y2="112"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
        <polyline points={line} fill="none" stroke="currentColor" strokeWidth="2" />
        {dots.map((d, i) => (
          <rect
            key={i}
            x={px(d.x) - 2}
            y={d.y}
            width="4"
            height="4"
            fill="currentColor"
            opacity={d.x < lsl || d.x > usl ? 1 : 0.55}
          />
        ))}
      </svg>
      <p className="mt-3 text-sm leading-relaxed text-well-dim">
        {gate
          ? `Cpk is ${fmt(cpk, 2)}. The nearer limit is far enough for this gate. Cp is ${fmt(cp, 2)} and does not know whether you are centered.`
          : `Cpk is ${fmt(cpk, 2)}, short of 1.33. Cp is ${fmt(cp, 2)}. If those two disagree, the pile fits the window in width and misses it in location.`}
      </p>
    </BenchShell>
  );
}

export function StackBench() {
  const [tol, setTol] = useState(0.2);
  const count = 3;
  const worst = count * tol;
  const rss = tol * Math.sqrt(count);
  const allow = 0.5;
  const worstFits = worst <= allow + 1e-9;
  const rssFits = rss <= allow + 1e-9;
  const reduce = useReducedMotion();
  const [clock, setClock] = useState(0);
  useTicker(!reduce, (dt) => setClock((s) => s + dt));
  const roll = Math.floor(clock / 1.8);
  const unit = (seed: number) => {
    const x = Math.sin(seed * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  };
  const extras = [0, 1, 2].map((i) => (unit(roll * 3 + i + 1) * 2 - 1) * tol);
  const stack = extras.reduce((sum, part) => sum + part, 0);
  const showExtras = reduce ? [tol, tol, tol] : extras;
  const showStack = reduce ? worst : stack;

  return (
    <BenchShell
      prompt="Set each part to ±0.20 mm. || Worst case misses the ±0.50 mm allowance. The root-sum-square number still fits. The boxes keep changing length. The bright whisker does not. It is the unlucky stack, every error long together."
      note="Three parts in a row, the same ± tolerance on each. Worst case adds them. Root sum square multiplies by √3, and only if the errors are independent and centered. It does not promise the next assembly. The drawing picks a new assembly every couple of seconds. The whisker above it is every error long, together."
      controls={
        <Slider
          label="Tolerance on each part"
          min={0.05}
          max={0.4}
          step={0.05}
          value={tol}
          display={`±${fmt(tol, 2)} mm`}
          onChange={setTol}
        />
      }
    >
      <Readouts
        items={[
          { label: "Worst case", value: `${fmt(worst, 2)} mm` },
          { label: "Root sum square", value: `${fmt(rss, 2)} mm` },
          { label: "Allowance", value: "±0.50 mm" },
        ]}
      />
      <svg viewBox="0 0 320 110" className="h-28 w-full" aria-hidden>
        {showExtras.map((extra, i) => {
          const w = 62 + (extra / Math.max(tol, 0.05)) * 10;
          return (
            <rect
              key={i}
              x={24 + i * 78 + (70 - w) / 2}
              y="46"
              width={w}
              height="28"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          );
        })}
        <line x1="258" y1="18" x2="258" y2="86" stroke="currentColor" strokeWidth="1.5" />
        <line x1="258" y1="28" x2={258 + Math.min(52, worst * 28)} y2="28" stroke="currentColor" strokeWidth="2" />
        <line
          x1="258"
          y1="78"
          x2={258 + Math.min(52, Math.abs(showStack) * 28)}
          y2="78"
          stroke="currentColor"
          strokeWidth="2"
          opacity="0.55"
        />
      </svg>
      <p className="mt-3 text-sm leading-relaxed text-well-dim">
        {reduce
          ? "Motion is reduced, so the boxes are drawn at the long extreme. That is the worst case, not a typical stack."
          : `This assembly lands at ${fmt(showStack, 2)} mm. The bright whisker is the worst case, ${fmt(worst, 2)} mm. The pale one is this draw.`}
        {" "}
        {worstFits
          ? "Worst case fits inside ±0.50 mm, so every stack fits, including the unlucky one."
          : rssFits
            ? "Worst case is over ±0.50 mm. Root sum square is under it. You are betting the errors scatter. You are not guaranteed the next three parts."
            : "Both numbers miss ±0.50 mm. Tighten a part or open the allowance. Averaging the two numbers does not create a pass."}
      </p>
    </BenchShell>
  );
}
