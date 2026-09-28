import { useEffect, useState } from "react";
import { BenchShell, fmt, Readouts, Segmented, Slider, useReducedMotion, useTicker, WellButton } from "./ui";
import {
  CANDIDATES,
  candidateBalances,
  candidateDims,
  equalDims,
  formatDims,
  type Dims,
} from "@/course/dims";
import {
  THRUST_SAMPLES,
  MOTION_DATA,
  fitConstantAccel,
  intervalVelocities,
  projectile,
  trajectoryPoints,
} from "@/course/kinematics";
import { blockOnIncline, FRICTION_PAIRS, frictionPair } from "@/course/forces";
import { MECHANISMS, type MechanismId } from "@/course/energy";
import {
  centerOfMass,
  kineticEnergy,
  momentum,
  restitution1D,
  totalKE,
  totalMomentum,
} from "@/course/momentum";
import { beamReactions, inertia, spinUp, torque as torqueFn } from "../../course/rotation.ts";
import {
  ELASTIC_MATS,
  areaCircle,
  axialDelta,
  cantileverDelta,
  factorOfSafety,
  inertiaCircle,
  inertiaRect,
  measuredDeflection,
  percentError,
  stress,
} from "@/course/elasticity";
import {
  floatFraction,
  forceBalance,
  hydrostaticPressure,
  inducedDragCoeff,
  RHO_AIR,
  RHO_MERCURY,
  RHO_SEAWATER,
  RHO_WATER,
  stabilityVerdict,
  stallSpeed,
  staticMargin,
  venturiPressureDrop,
  continuitySpeed,
  wingLoading,
} from "../../course/fluids";
import {
  jointGap,
  magnification,
  qualityFactor,
  resonantRatio,
  shmEnergy,
  shmFrequency,
  shmKinetic,
  shmOmega,
  shmPeriod,
  shmPotential,
  thermalExpansion,
  thermalStress,
  THERMAL_MATERIALS,
} from "../../course/oscillations.ts";
import {
  MASTERY_BANK,
  correctionsRequired,
  masteryPass,
  masteryPct,
  referenceGliderSynthesis,
  type MasteryItem,
} from "../../course/synthesis.ts";

export function VectorBench() {
  const [ax, setAx] = useState(3);
  const [ay, setAy] = useState(1);
  const [bx, setBx] = useState(-1);
  const [by, setBy] = useState(3);
  const rx = ax + bx;
  const ry = ay + by;
  const mag = (x: number, y: number) => Math.hypot(x, y);
  const magR = mag(rx, ry);
  const angle = magR < 1e-6 ? null : (Math.atan2(ry, rx) * 180) / Math.PI;
  const maxC = Math.max(1, Math.abs(ax), Math.abs(ay), Math.abs(bx), Math.abs(by), Math.abs(rx), Math.abs(ry));
  const scale = 100 / maxC;
  const cx = 160;
  const cy = 110;

  return (
    <BenchShell
      prompt="Set the x and y parts of vector A and vector B. || The bright arrow is A + B. Its length equals |A| + |B| only when A and B point the same way."
      note="Angle is from the +x axis, counterclockwise. Both vectors must share a unit. The drawing rescales so the resultant stays on the page."
      controls={
        <>
          <Slider label="A, x" min={-8} max={8} step={0.5} value={ax} display={fmt(ax, 1)} onChange={setAx} />
          <Slider label="A, y" min={-8} max={8} step={0.5} value={ay} display={fmt(ay, 1)} onChange={setAy} />
          <Slider label="B, x" min={-8} max={8} step={0.5} value={bx} display={fmt(bx, 1)} onChange={setBx} />
          <Slider label="B, y" min={-8} max={8} step={0.5} value={by} display={fmt(by, 1)} onChange={setBy} />
        </>
      }
    >
      <Readouts
        items={[
          { label: "Magnitude of A", value: fmt(mag(ax, ay), 2) },
          { label: "Magnitude of B", value: fmt(mag(bx, by), 2) },
          { label: "Resultant", value: angle === null ? "0" : `${fmt(magR, 2)} at ${fmt(angle, 0)}°` },
        ]}
      />
      <svg viewBox="0 0 320 220" className="h-auto w-full" aria-hidden>
        <line x1="20" y1={cy} x2="300" y2={cy} stroke="currentColor" strokeOpacity="0.25" />
        <line x1={cx} y1="16" x2={cx} y2="204" stroke="currentColor" strokeOpacity="0.25" />
        <Arrow x1={cx} y1={cy} x2={cx + ax * scale} y2={cy - ay * scale} opacity={0.55} />
        <Arrow x1={cx} y1={cy} x2={cx + bx * scale} y2={cy - by * scale} opacity={0.55} />
        <Arrow x1={cx} y1={cy} x2={cx + rx * scale} y2={cy - ry * scale} opacity={1} />
      </svg>
      <p className="mt-2 text-sm text-well-dim">
        Pale arrows are A and B. The bright arrow is A + B. |A| + |B| = {fmt(mag(ax, ay) + mag(bx, by), 2)}, which matches the resultant only when they point the same way.
      </p>
    </BenchShell>
  );
}

function Arrow({
  x1,
  y1,
  x2,
  y2,
  opacity,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  opacity: number;
}) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  if (Math.hypot(x2 - x1, y2 - y1) < 1) return null;
  const head = 9;
  const hx = x2 - head * Math.cos(angle);
  const hy = y2 - head * Math.sin(angle);
  const left = `${x2} ${y2} ${hx + 4 * Math.sin(angle)} ${hy - 4 * Math.cos(angle)} ${hx - 4 * Math.sin(angle)} ${hy + 4 * Math.cos(angle)}`;
  return (
    <g opacity={opacity} stroke="currentColor" fill="currentColor">
      <line x1={x1} y1={y1} x2={hx} y2={hy} strokeWidth="2" />
      <polygon points={left} />
    </g>
  );
}

export function KinematicsBench() {
  const [v0, setV0] = useState(4);
  const [a, setA] = useState(-0.6);
  const [t, setT] = useState(0);
  const [running, setRunning] = useState(false);
  useTicker(running, (dt) => setT((prev) => Math.min(6, prev + dt)));
  useEffect(() => {
    if (running && t >= 6) setRunning(false);
  }, [running, t]);

  const v = v0 + a * t;
  const x = v0 * t + 0.5 * a * t * t;
  const tMax = 6;
  const vExtent = Math.max(4, Math.abs(v0), Math.abs(v0 + a * tMax), Math.abs(v));
  const x0 = 28;
  const yMid = 78;
  const w = 280;
  const h = 58;
  const xt = (time: number) => x0 + (time / tMax) * w;
  const yv = (vel: number) => yMid - (vel / vExtent) * h;

  let d = "";
  if (t > 0.02) {
    for (let i = 0; i <= 48; i++) {
      const time = (i / 48) * t;
      d += `${i ? "L" : "M"}${xt(time).toFixed(1)} ${yv(v0 + a * time).toFixed(1)} `;
    }
  }
  const shade = d ? `${d} L${xt(t).toFixed(1)} ${yMid} L${x0} ${yMid} Z` : "";
  const cart = Math.min(1, Math.max(0, (x + 20) / 60));

  return (
    <BenchShell
      prompt="Set a starting velocity and an acceleration. Move Time, or press Run. || The shaded area under the velocity line is the change in position. Positive is to the right."
      note="One line, constant acceleration, x starts at 0. Positive is to the right. The track only marks a window from −20 m to +40 m; the numbers stay valid outside it."
      controls={
        <>
          <Slider label="Starting velocity" min={-6} max={10} step={0.5} value={v0} display={`${fmt(v0, 1)} m/s`} onChange={setV0} />
          <Slider label="Acceleration" min={-3} max={3} step={0.1} value={a} display={`${fmt(a, 1)} m/s²`} onChange={setA} />
          <div className="sm:col-span-2">
            <Slider
              label="Time"
              min={0}
              max={6}
              step={0.01}
              value={t}
              display={`${fmt(t, 2)} s`}
              onChange={(v) => {
                setRunning(false);
                setT(v);
              }}
            />
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <WellButton
              onClick={() => {
                if (running) {
                  setRunning(false);
                  return;
                }
                if (t >= 6) setT(0);
                setRunning(true);
              }}
            >
              {running ? "Pause" : t >= 6 ? "Replay" : "Run"}
            </WellButton>
            <WellButton
              onClick={() => {
                setRunning(false);
                setT(0);
              }}
            >
              Reset time
            </WellButton>
          </div>
        </>
      }
    >
      <Readouts
        items={[
          { label: "Position", value: `${fmt(x, 2)} m` },
          { label: "Velocity", value: `${fmt(v, 2)} m/s` },
          { label: "Acceleration", value: `${fmt(a, 1)} m/s²` },
        ]}
      />
      <svg viewBox="0 0 320 150" className="h-auto w-full" aria-hidden>
        <line x1={x0} y1={yMid} x2={x0 + w} y2={yMid} stroke="currentColor" strokeOpacity="0.3" />
        <path d={shade} fill="currentColor" opacity="0.18" />
        <path d={d} fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx={xt(t)} cy={yv(v)} r="4" fill="currentColor" />
        <line x1="28" y1="132" x2="308" y2="132" stroke="currentColor" strokeOpacity="0.4" />
        <rect x={28 + cart * 260} y="122" width="22" height="12" fill="currentColor" />
      </svg>
      <p className="mt-2 text-sm text-well-dim">
        {x < -20 || x > 40 ? "The cart has left the marked track. " : ""}
        Shaded area is displacement, negative when the velocity is negative. Constant velocity would be a flat line and zero acceleration.
      </p>
    </BenchShell>
  );
}

export function NewtonBench() {
  const g = 9.81;
  const [mass, setMass] = useState(4);
  const [push, setPush] = useState(12);
  const [mu, setMu] = useState(0.3);
  const normal = mass * g;
  const fMax = mu * normal;
  const stuck = push <= fMax + 1e-9;
  const friction = stuck ? push : fMax;
  const net = push - friction;
  const accel = net / mass;
  const hScale = 64 / Math.max(push, friction, 8);
  const vScale = 42 / Math.max(normal, 8);
  const reduce = useReducedMotion();
  const [motion, setMotion] = useState({ x: 130, v: 0 });
  useTicker(!stuck && !reduce, (dt) => {
    setMotion((m) => {
      const v = m.v + accel * dt;
      const x = m.x + v * 42 * dt;
      if (x > 250) return { x: 36, v: 0 };
      return { x, v };
    });
  });
  useEffect(() => {
    if (stuck) setMotion({ x: 130, v: 0 });
  }, [stuck]);
  const blockX = reduce ? (stuck ? 130 : 200) : motion.x;

  return (
    <BenchShell
      prompt="Lower the push until State says At rest, then raise it past the limit. || The block stays put until the push exceeds μ times its weight. Only then does it slide, and each pass starts from rest."
      note="The push is to the right. This model starts from rest, so friction holds until the push exceeds μN, then kinetic friction is taken as μN too. g = 9.81 m/s². Vertical forces cancel. With motion reduced, a sliding block is drawn once, already to the right of the start mark."
      controls={
        <>
          <Slider label="Mass" min={0.5} max={12} step={0.5} value={mass} display={`${fmt(mass, 1)} kg`} onChange={setMass} />
          <Slider label="Push" min={0} max={40} step={0.5} value={push} display={`${fmt(push, 1)} N`} onChange={setPush} />
          <div className="sm:col-span-2">
            <Slider label="Friction coefficient μ" min={0} max={0.8} step={0.01} value={mu} display={fmt(mu, 2)} onChange={setMu} />
          </div>
        </>
      }
    >
      <Readouts
        items={[
          { label: "Acceleration", value: `${fmt(accel, 2)} m/s²` },
          { label: "Friction", value: `${fmt(friction, 1)} N` },
          { label: "State", value: stuck ? "At rest" : "Sliding" },
        ]}
      />
      <svg viewBox="0 0 320 180" className="h-auto w-full" aria-hidden>
        <line x1="30" y1="120" x2="290" y2="120" stroke="currentColor" strokeOpacity="0.4" />
        <line x1="160" y1="120" x2="160" y2="128" stroke="currentColor" strokeOpacity="0.45" />
        <rect x={blockX} y="78" width="60" height="42" fill="none" stroke="currentColor" strokeWidth="2" />
        <Arrow x1={blockX + 60} y1={99} x2={blockX + 60 + push * hScale} y2={99} opacity={1} />
        <Arrow x1={blockX} y1={99} x2={blockX - friction * hScale} y2={99} opacity={0.7} />
        <Arrow x1={blockX + 30} y1={78} x2={blockX + 30} y2={78 - normal * vScale} opacity={0.7} />
        <Arrow x1={blockX + 30} y1={120} x2={blockX + 30} y2={120 + normal * vScale} opacity={0.7} />
      </svg>
      <p className="mt-2 text-sm leading-relaxed text-well-dim">
        {stuck
          ? `Static friction equals the push, ${fmt(friction, 1)} N, which is under the μN budget of ${fmt(fMax, 1)} N. Net force is zero, so velocity stays zero.`
          : `The push cleared μN. Friction stays at ${fmt(fMax, 1)} N and the leftover ${fmt(net, 1)} N accelerates the mass. Weight and the normal force are ${fmt(normal, 1)} N each, and they are not a third-law pair — both act on the block.`}
      </p>
    </BenchShell>
  );
}

export function EnergyBench() {
  const g = 9.81;
  const [mass, setMass] = useState(1.5);
  const [height, setHeight] = useState(4);
  const [s, setS] = useState(0);
  const [drag, setDrag] = useState(false);
  const h = height * (1 - s);
  const drop = height - h;
  const kept = drag ? 0.7 : 1;
  const speed = Math.sqrt(2 * g * drop * kept);
  const pe = mass * g * h;
  const ke = 0.5 * mass * speed * speed;
  const heat = mass * g * drop * (drag ? 0.3 : 0);
  const total = mass * g * height;
  const scale = total > 0 ? 100 / total : 0;
  const x = 48 + s * 230;
  const y = 36 + s * 100;
  const reduce = useReducedMotion();
  const [playing, setPlaying] = useState(false);
  useTicker(playing && !reduce, (dt) => {
    setS((prev) => Math.min(1, prev + dt * 0.28));
  });
  useEffect(() => {
    if (playing && s >= 1) setPlaying(false);
  }, [playing, s]);

  return (
    <BenchShell
      prompt="Press Play the drop. Then turn friction on and play it again. Change the mass and repeat. || Potential falls while kinetic rises. Friction sends some of that to heat. Changing the mass does not change the speed."
      note="g = 9.81 m/s². Height is measured from the bottom. With friction on, 30% of the lost potential becomes thermal energy — a teaching fraction, not a measured coefficient. Speed does not depend on mass. The play button walks the same path as the progress slider."
      controls={
        <>
          <Slider label="Mass" min={0.2} max={5} step={0.1} value={mass} display={`${fmt(mass, 1)} kg`} onChange={setMass} />
          <Slider label="Drop height" min={0.5} max={8} step={0.1} value={height} display={`${fmt(height, 1)} m`} onChange={setHeight} />
          <div className="sm:col-span-2">
            <Slider
              label="Progress down the ramp"
              min={0}
              max={1}
              step={0.01}
              value={s}
              display={`${fmt(s * 100, 0)}%`}
              onChange={(value) => {
                setPlaying(false);
                setS(value);
              }}
            />
          </div>
          <Segmented
            label="Friction"
            value={drag ? "on" : "off"}
            onChange={(v) => setDrag(v === "on")}
            options={[
              { value: "off", label: "Off — mechanical energy holds" },
              { value: "on", label: "On — some becomes heat" },
            ]}
          />
          <div className="flex items-end">
            <WellButton
              onClick={() => {
                if (reduce) return;
                if (playing) {
                  setPlaying(false);
                  return;
                }
                if (s >= 0.999) setS(0);
                setPlaying(true);
              }}
            >
              {reduce ? "Use the slider" : playing ? "Pause" : s >= 0.999 ? "Replay the drop" : "Play the drop"}
            </WellButton>
          </div>
        </>
      }
    >
      <Readouts
        items={[
          { label: "Speed", value: `${fmt(speed, 2)} m/s` },
          { label: "Potential", value: `${fmt(pe, 1)} J` },
          { label: "Kinetic", value: `${fmt(ke, 1)} J` },
        ]}
      />
      <svg viewBox="0 0 320 160" className="h-auto w-full" aria-hidden>
        <path d="M48 36 L278 136 L48 136 Z" fill="none" stroke="currentColor" strokeOpacity="0.45" />
        <circle cx={x} cy={y} r="8" fill="currentColor" />
      </svg>
      <div className="mt-4 flex flex-col gap-2 text-sm">
        <Bar label="Potential" pct={pe * scale} />
        <Bar label="Kinetic" pct={ke * scale} />
        <Bar label="Heat" pct={heat * scale} />
      </div>
      <p className="mt-3 text-sm text-well-dim">
        Mechanical energy is {fmt(pe + ke, 1)} J
        {drag ? `, with ${fmt(heat, 1)} J already thermal. The sum of all three stays ${fmt(total, 1)} J.` : `, and it stays ${fmt(total, 1)} J from top to bottom.`}
        {" "}Halve the mass and the speed at a given height does not change.
      </p>
    </BenchShell>
  );
}

function Bar({ label, pct }: { label: string; pct: number }) {
  return (
    <div className="grid grid-cols-[5.5rem_1fr] items-center gap-3">
      <span className="text-well-dim">{label}</span>
      <div className="h-2 rounded-full bg-white/15">
        <div className="h-2 rounded-full bg-well-fg" style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
      </div>
    </div>
  );
}

export function CollisionBench() {
  const [m1, setM1] = useState(2);
  const [v1, setV1] = useState(3);
  const [m2, setM2] = useState(1);
  const [v2, setV2] = useState(-1);
  const [mode, setMode] = useState<"elastic" | "stick">("elastic");
  const total = m1 + m2;
  let u1: number;
  let u2: number;
  if (mode === "stick") {
    const v = (m1 * v1 + m2 * v2) / total;
    u1 = v;
    u2 = v;
  } else {
    u1 = ((m1 - m2) / total) * v1 + ((2 * m2) / total) * v2;
    u2 = ((2 * m1) / total) * v1 + ((m2 - m1) / total) * v2;
  }
  const pBefore = m1 * v1 + m2 * v2;
  const pAfter = m1 * u1 + m2 * u2;
  const kBefore = 0.5 * m1 * v1 * v1 + 0.5 * m2 * v2 * v2;
  const kAfter = 0.5 * m1 * u1 * u1 + 0.5 * m2 * u2 * u2;
  const reduce = useReducedMotion();
  const r1 = Math.min(18, 7 + m1 * 1.6);
  const r2 = Math.min(18, 7 + m2 * 1.6);
  const start1 = 28 + r1;
  const start2 = 292 - r2;
  const [play, setPlay] = useState<"idle" | "run" | "done">("idle");
  const [sim, setSim] = useState({ x1: start1, x2: start2, after: false });
  useEffect(() => {
    setPlay("idle");
    setSim({ x1: start1, x2: start2, after: false });
  }, [m1, v1, m2, v2, mode, start1, start2]);
  useTicker(play === "run" && !reduce, (dt) => {
    setSim((s) => {
      const speed = s.after ? u1 : v1;
      const speed2 = s.after ? u2 : v2;
      let x1 = s.x1 + speed * 26 * dt;
      let x2 = s.x2 + speed2 * 26 * dt;
      let after = s.after;
      const closing = !after && v1 > v2 + 0.05 && x1 + r1 >= x2 - r2;
      if (closing) {
        const mid = (x1 + r1 + x2 - r2) / 2;
        x1 = mid - r1;
        x2 = mid + r2;
        after = true;
      }
      return { x1, x2, after };
    });
  });
  useEffect(() => {
    if (play !== "run") return;
    const goneAfter = sim.after && (sim.x1 - r1 > 300 || sim.x2 + r2 < 20 || sim.x1 < -20 || sim.x2 > 340);
    const goneBefore = !sim.after && v1 <= v2 + 0.05 && (sim.x1 < -10 || sim.x2 > 330);
    const bothGone = (sim.x1 > 340 && sim.x2 > 340) || (sim.x1 < -20 && sim.x2 < -20);
    if (goneAfter || goneBefore || bothGone) setPlay("done");
  }, [play, sim, r1, r2, v1, v2]);
  const showV1 = sim.after ? u1 : v1;
  const showV2 = sim.after ? u2 : v2;

  return (
    <BenchShell
      prompt="Press Run. Then switch to They stick and run again. || They meet only if the left one is catching the right one. Momentum matches before and after. Kinetic energy drops when they stick, and holds when the collision is elastic."
      note="One dimension, no external force during the impact. Elastic uses the standard two-body result. Stick means they share one velocity afterward. Positive velocity points right. The track is sped up so a few meters per second cross the page in a couple of seconds. With motion reduced, Before and After are still drawings."
      controls={
        <>
          <Slider label="Mass 1" min={0.5} max={8} step={0.5} value={m1} display={`${fmt(m1, 1)} kg`} onChange={setM1} />
          <Slider label="Velocity 1" min={-6} max={6} step={0.5} value={v1} display={`${fmt(v1, 1)} m/s`} onChange={setV1} />
          <Slider label="Mass 2" min={0.5} max={8} step={0.5} value={m2} display={`${fmt(m2, 1)} kg`} onChange={setM2} />
          <Slider label="Velocity 2" min={-6} max={6} step={0.5} value={v2} display={`${fmt(v2, 1)} m/s`} onChange={setV2} />
          <Segmented
            label="Collision"
            value={mode}
            onChange={setMode}
            options={[
              { value: "elastic", label: "Elastic" },
              { value: "stick", label: "They stick" },
            ]}
          />
          {reduce ? null : (
            <div className="flex items-end">
              <WellButton
                onClick={() => {
                  if (play === "run") {
                    setPlay("idle");
                    return;
                  }
                  setSim({ x1: start1, x2: start2, after: false });
                  setPlay("run");
                }}
              >
                {play === "run" ? "Pause" : play === "done" ? "Replay" : "Run"}
              </WellButton>
            </div>
          )}
        </>
      }
    >
      <Readouts
        items={[
          { label: "Momentum", value: `${fmt(pBefore, 2)} → ${fmt(pAfter, 2)}` },
          { label: "Kinetic energy", value: `${fmt(kBefore, 1)} → ${fmt(kAfter, 1)} J` },
          { label: "Energy lost", value: `${fmt(kBefore - kAfter, 1)} J` },
        ]}
      />
      {reduce ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Pair title="Before" m1={m1} v1={v1} m2={m2} v2={v2} />
          <Pair title="After" m1={m1} v1={u1} m2={m2} v2={u2} />
        </div>
      ) : (
        <div>
          <div className="text-sm text-well-dim">
            {sim.after ? "After the hit" : play === "done" ? "They never met" : "Before the hit"}
          </div>
          <svg viewBox="0 0 320 78" className="mt-1 h-20 w-full" aria-hidden>
            <line x1="8" y1="50" x2="312" y2="50" stroke="currentColor" strokeOpacity="0.35" />
            <Blob cx={sim.x1} r={r1} v={showV1} label="" />
            <Blob cx={sim.x2} r={r2} v={showV2} label="" />
          </svg>
          <p className="text-sm text-well-dim">
            Left leaves at {fmt(u1, 2)} m/s. Right leaves at {fmt(u2, 2)} m/s.
          </p>
        </div>
      )}
      <p className="mt-3 text-sm text-well-dim">
        Momentum is conserved either way
        {Math.abs(pBefore - pAfter) < 0.05 ? "" : " (check the rounding)"}
        . {mode === "stick" ? "Sticking spends kinetic energy on deformation and heat. After the hit they share one velocity." : "An elastic collision hands the kinetic energy back. Equal masses with one at rest exchange their velocities."}
      </p>
    </BenchShell>
  );
}

function Pair({
  title,
  m1,
  v1,
  m2,
  v2,
}: {
  title: string;
  m1: number;
  v1: number;
  m2: number;
  v2: number;
}) {
  return (
    <div>
      <div className="text-sm text-well-dim">{title}</div>
      <svg viewBox="0 0 160 70" className="mt-1 h-16 w-full" aria-hidden>
        <Blob cx={48} r={8 + m1 * 2} v={v1} label={fmt(v1, 1)} />
        <Blob cx={112} r={8 + m2 * 2} v={v2} label={fmt(v2, 1)} />
      </svg>
    </div>
  );
}

function Blob({ cx, r, v, label }: { cx: number; r: number; v: number; label: string }) {
  const len = Math.min(36, Math.abs(v) * 8);
  const x2 = cx + Math.sign(v || 1) * len;
  return (
    <g>
      <circle cx={cx} cy="28" r={Math.min(r, 22)} fill="none" stroke="currentColor" strokeWidth="2" />
      {Math.abs(v) > 0.05 ? <Arrow x1={cx} y1={28} x2={x2} y2={28} opacity={1} /> : null}
      <text x={cx} y="62" textAnchor="middle" fill="currentColor" fontSize="11">
        {label}
      </text>
    </g>
  );
}

export function WaveBench() {
  const [amp, setAmp] = useState(0.6);
  const [freq, setFreq] = useState(1.2);
  const [lambda, setLambda] = useState(1.4);
  const [t, setT] = useState(0);
  const [running, setRunning] = useState(true);
  const reduce = useReducedMotion();
  useTicker(running && !reduce, (dt) => setT((prev) => prev + dt));
  const speed = freq * lambda;
  const width = 4;
  let d = "";
  for (let i = 0; i <= 80; i++) {
    const x = (i / 80) * 320;
    const xm = (i / 80) * width;
    const y = 70 - amp * 48 * Math.sin((2 * Math.PI * xm) / lambda - 2 * Math.PI * freq * t);
    d += `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)} `;
  }
  let crest = (lambda * (0.25 + freq * t)) % width;
  if (crest < 0) crest += width;
  const crestX = (crest / width) * 320;
  const crestY = 70 - amp * 48;

  return (
    <BenchShell
      prompt="The pattern is already moving. Change frequency and wavelength, then read wave speed. Pause if you want a still. || Wave speed equals frequency times wavelength. Amplitude changes the height of the wave, not the speed."
      note="A fixed 4 m of a transverse wave, y = A sin(2πx/λ − 2πft). The rope moves up and down; the pattern moves along it. What sets the speed on a real rope — tension and mass per length — is outside this bench. If motion is reduced, the pattern stays on one frame."
      controls={
        <>
          <Slider label="Amplitude" min={0.15} max={1} step={0.01} value={amp} display={fmt(amp, 2)} onChange={setAmp} />
          <Slider label="Frequency" min={0.4} max={3} step={0.05} value={freq} display={`${fmt(freq, 2)} Hz`} onChange={setFreq} />
          <Slider label="Wavelength" min={0.4} max={3} step={0.05} value={lambda} display={`${fmt(lambda, 2)} m`} onChange={setLambda} />
          <div className="flex items-end sm:col-span-1">
            <WellButton onClick={() => setRunning((r) => !r)}>{reduce ? "Held still" : running ? "Pause" : "Run"}</WellButton>
          </div>
        </>
      }
    >
      <Readouts
        items={[
          { label: "Wave speed", value: `${fmt(speed, 2)} m/s` },
          { label: "f × λ", value: `${fmt(freq, 2)} × ${fmt(lambda, 2)}` },
          { label: "Window", value: "4 m" },
        ]}
      />
      <svg viewBox="0 0 320 140" className="h-auto w-full" aria-hidden>
        <line x1="0" y1="70" x2="320" y2="70" stroke="currentColor" strokeOpacity="0.25" />
        <path d={d} fill="none" stroke="currentColor" strokeWidth="2" />
        <line
          x1={crestX}
          y1="70"
          x2={crestX}
          y2={crestY}
          stroke="currentColor"
          strokeOpacity="0.7"
          strokeDasharray="3 3"
        />
        <circle cx={crestX} cy={crestY} r="4" fill="currentColor" />
      </svg>
      <p className="mt-2 text-sm text-well-dim">
        The dashed stem is the amplitude, from rest up to a crest. Crest-to-crest along the rope is the wavelength. Doubling frequency at a fixed speed packs the crests tighter.
      </p>
    </BenchShell>
  );
}

export function DimCheckBench() {
  const [candidateId, setCandidateId] = useState(CANDIDATES[0].id);
  const candidate = CANDIDATES.find((c) => c.id === candidateId) ?? CANDIDATES[0];
  const [lhs, setLhs] = useState<Dims>({ M: 0, L: 0, T: 1 });
  const [rhs, setRhs] = useState<Dims>({ M: 0, L: 0, T: 0 });
  const { lhs: trueLhs, rhs: trueRhs } = candidateDims(candidate);
  const lhsOk = equalDims(lhs, trueLhs);
  const rhsOk = equalDims(rhs, trueRhs);
  const balances = candidateBalances(candidate);

  const expSlider = (
    side: "lhs" | "rhs",
    key: keyof Dims,
    label: string,
    value: number,
  ) => (
    <Slider
      key={`${side}-${key}`}
      label={label}
      min={-3}
      max={3}
      step={1}
      value={value}
      display={value > 0 ? `+${value}` : `${value}`}
      onChange={(v) =>
        (side === "lhs" ? setLhs : setRhs)((prev) => ({ ...prev, [key]: v }))
      }
    />
  );

  return (
    <BenchShell
      prompt="Pick a candidate equation and enter the M/L/T exponents for each side. || The bench shows the true dimensions beside yours — fix your entries until they match. || Then read the verdict: a mismatch kills the candidate, and the why tells you what the wrong side actually is."
      note="The checker only knows mechanical quantities — mass, length, time. Dimensionless constants like 2π and ½ never affect a dimensional check."
      controls={
        <>
          <Segmented
            label="Candidate equation"
            value={candidateId}
            onChange={setCandidateId}
            options={CANDIDATES.map((c) => ({ value: c.id, label: c.label }))}
          />
          {expSlider("lhs", "M", "Left: M", lhs.M)}
          {expSlider("lhs", "L", "Left: L", lhs.L)}
          {expSlider("lhs", "T", "Left: T", lhs.T)}
          {expSlider("rhs", "M", "Right: M", rhs.M)}
          {expSlider("rhs", "L", "Right: L", rhs.L)}
          {expSlider("rhs", "T", "Right: T", rhs.T)}
        </>
      }
    >
      <Readouts
        items={[
          { label: "Your left side", value: `${formatDims(lhs)}${lhsOk ? " ✓" : ""}` },
          { label: "True left side", value: formatDims(trueLhs) },
          { label: "Your right side", value: `${formatDims(rhs)}${rhsOk ? " ✓" : ""}` },
          { label: "True right side", value: formatDims(trueRhs) },
        ]}
      />
      <p className="mt-2 text-sm leading-relaxed text-well-dim">
        {lhsOk && rhsOk
          ? "Your dimensions are right. "
          : "Your entries do not match the true dimensions yet — adjust the exponents. "}
        {balances
          ? `The equation balances: both sides are ${formatDims(trueLhs)}. It survives dimensional analysis.`
          : `The equation does not balance: ${formatDims(trueLhs)} ≠ ${formatDims(trueRhs)}. It is dead on dimensional grounds.`}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-well-fg">{candidate.verdictWhy}</p>
    </BenchShell>
  );
}

type FermiQuestion = {
  id: string;
  title: string;
  factors: { label: string; hint: string; refExp: number }[];
  refTotal: number;
  anchor: string;
};

const FERMI_QUESTIONS: FermiQuestion[] = [
  {
    id: "tuners",
    title: "Piano tuners in Chicago",
    factors: [
      { label: "Households", hint: "3M people, ~2.5 per household", refExp: 6 },
      { label: "Fraction owning a piano", hint: "about 1 in 20", refExp: -1 },
      { label: "Tunings per piano per year", hint: "roughly annual", refExp: 0 },
      { label: "Tunings per tuner per year", hint: "2 per day × 250 days", refExp: 3 },
    ],
    refTotal: 2,
    anchor: "Directories list on the order of a hundred tuners.",
  },
  {
    id: "gasoline",
    title: "Gasoline burned per day, city of one million",
    factors: [
      { label: "People", hint: "given: one million", refExp: 6 },
      { label: "Fraction driving daily", hint: "about 1 in 2", refExp: 0 },
      { label: "km per driver per day", hint: "~30", refExp: 1 },
      { label: "Liters per km", hint: "~1 L per 12 km", refExp: -1 },
    ],
    refTotal: 6,
    anchor: "Roughly 1.2 million liters a day — order 10⁶.",
  },
];

export function FermiBench() {
  const [qid, setQid] = useState(FERMI_QUESTIONS[0].id);
  const q = FERMI_QUESTIONS.find((x) => x.id === qid) ?? FERMI_QUESTIONS[0];
  const [exps, setExps] = useState<number[]>(() => q.factors.map(() => 0));
  const [weakest, setWeakest] = useState("");
  useEffect(() => {
    setExps(q.factors.map(() => 0));
    setWeakest("");
  }, [qid, q.factors]);
  const total = exps.reduce((s, e) => s + e, 0);
  const err = Math.abs(total - q.refTotal);
  const within = err <= 1;

  return (
    <BenchShell
      prompt="Set each factor as a power of ten and watch the product assemble. || Land within one order of magnitude of the reference — the log-error readout is the judge. || Then name your weakest factor below and say why it was weak."
      note="Reference answers are anchors, not grades. A factor you set honestly to the wrong exponent teaches more than a lucky exact hit."
      controls={
        <>
          <Segmented
            label="Fermi question"
            value={qid}
            onChange={setQid}
            options={FERMI_QUESTIONS.map((x) => ({ value: x.id, label: x.title }))}
          />
          {q.factors.map((f, i) => (
            <Slider
              key={`${qid}-${f.label}`}
              label={`${f.label} (${f.hint})`}
              min={-3}
              max={7}
              step={1}
              value={exps[i] ?? 0}
              display={`10^${exps[i] ?? 0}`}
              onChange={(v) =>
                setExps((prev) => prev.map((e, j) => (j === i ? v : e)))
              }
            />
          ))}
        </>
      }
    >
      <Readouts
        items={[
          { label: "Your estimate", value: `≈ 10^${total}` },
          { label: "Reference", value: `≈ 10^${q.refTotal}` },
          { label: "Log error", value: `${err} order${err === 1 ? "" : "s"}` },
        ]}
      />
      <p className="mt-2 text-sm leading-relaxed text-well-dim">
        {within
          ? `Within an order of magnitude — that counts as a hit. ${q.anchor}`
          : `Off by more than a factor of ten. Find the lying factor: which of your exponents is furthest from plausible? ${q.anchor}`}
      </p>
      <label className="mt-4 block">
        <span className="mb-2 block text-sm text-well-dim">
          Weakest factor, and why it was weak
        </span>
        <input
          type="text"
          value={weakest}
          onChange={(e) => setWeakest(e.target.value)}
          placeholder="e.g. tuner throughput — I have no idea how many pianos one person tunes"
          className="w-full rounded-lg bg-white/10 px-3 py-2 text-well-fg ring-1 ring-white/20 placeholder:text-well-dim"
        />
      </label>
    </BenchShell>
  );
}

const MEMO_KEY = "ff:memo-w1";
const MEMO_RUBRIC = [
  "Names the measurand and its unit",
  "Reports value ± uncertainty with honest digits",
  "Justifies the instrument choice",
  "Rounds the uncertainty to one significant figure",
  "Names the dominant error source",
];

export function MemoBench() {
  const [text, setText] = useState(() => {
    try {
      return localStorage.getItem(MEMO_KEY) ?? "";
    } catch {
      return "";
    }
  });
  const [checked, setChecked] = useState<boolean[]>(() => MEMO_RUBRIC.map(() => false));
  useEffect(() => {
    try {
      localStorage.setItem(MEMO_KEY, text);
    } catch {
      /* private browsing: the memo simply does not persist */
    }
  }, [text]);
  const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const done = checked.filter(Boolean).length;

  return (
    <BenchShell
      prompt="Write the measurement memo: take the bracket density measurement from the lesson, or one of your own, and defend it. || State the measurand with its unit, report value ± uncertainty with honest digits, justify the instrument, and name the dominant error source. || Check each rubric box only when a stranger could verify it from your text alone."
      note="The memo saves in this browser as you type. Evidence is the memo plus the rubric — both are yours to defend."
      controls={
        <div className="sm:col-span-2">
          <div className="mb-2 text-sm text-well-dim">Rubric — check what the memo earns</div>
          <div className="flex flex-col gap-2">
            {MEMO_RUBRIC.map((item, i) => (
              <label key={item} className="flex cursor-pointer items-start gap-3 text-sm text-well-fg">
                <input
                  type="checkbox"
                  checked={checked[i] ?? false}
                  onChange={() =>
                    setChecked((prev) => prev.map((c, j) => (j === i ? !c : c)))
                  }
                  className="mt-0.5 h-4 w-4 shrink-0 accent-white"
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </div>
      }
    >
      <Readouts
        items={[
          { label: "Words", value: `${words}` },
          { label: "Rubric", value: `${done} / ${MEMO_RUBRIC.length}` },
        ]}
      />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Measurand, value ± uncertainty, instrument and why, dominant error source…"
        className="min-h-44 w-full rounded-lg bg-white/10 p-3 text-well-fg ring-1 ring-white/20 placeholder:text-well-dim"
      />
      <p className="mt-2 text-sm leading-relaxed text-well-dim">
        {done === MEMO_RUBRIC.length
          ? "Full rubric. If every box is honestly earned, the memo is evidence."
          : "Aim for a memo a stranger could grade without asking you anything."}
      </p>
    </BenchShell>
  );
}

const numInputClass =
  "w-full rounded-lg bg-white/10 px-3 py-2 text-well-fg ring-1 ring-white/20 placeholder:text-well-dim";

const RECON_INTERVALS = [0, 2, 4, 6, 8, 10];
const VEL_TOL = 0.08;
const ACC_TOL = 0.12;
const TRUE_ACCEL = 0.9;

export function MotionReconBench() {
  const vels = intervalVelocities(MOTION_DATA);
  const [entries, setEntries] = useState<Record<number, string>>({});
  const [segment, setSegment] = useState<string>("unanswered");
  const [accelEntry, setAccelEntry] = useState("");
  const fit = fitConstantAccel(THRUST_SAMPLES);

  const velOk = (i: number) => {
    const raw = entries[i];
    if (raw === undefined || raw.trim() === "") return null;
    const v = Number(raw);
    return Number.isFinite(v) && Math.abs(v - vels[i]) <= VEL_TOL;
  };
  const allVelOk = RECON_INTERVALS.every((i) => velOk(i) === true);
  const segmentOk = segment === "cruise";
  const accelNum = Number(accelEntry);
  const accelOk =
    accelEntry.trim() !== "" && Number.isFinite(accelNum) && Math.abs(accelNum - TRUE_ACCEL) <= ACC_TOL;
  const done = allVelOk && segmentOk && accelOk;

  return (
    <BenchShell
      prompt="Reconstruct the cart's motion from its position log. || Enter the interval velocities by finite differences, identify the cruise segment, and fit the thrust segment's acceleration. || The bench checks each entry against the data — the fitted curve at the bottom is the reconstruction you're defending."
      note="Sensor jitter is ±2 cm, so your velocities won't be perfectly clean. The fit uses all seven thrust samples at once, which is why it beats any two-point estimate."
      controls={
        <>
          <Segmented
            label="Which intervals show (near-)constant velocity?"
            value={segment}
            onChange={setSegment}
            options={[
              { value: "unanswered", label: "Pick one…" },
              { value: "cruise", label: "Intervals 0–4" },
              { value: "thrust", label: "Intervals 5–11" },
              { value: "all", label: "All twelve intervals" },
              { value: "none", label: "None — it never settles" },
            ]}
          />
          <div className="sm:col-span-2">
            <div className="mb-2 text-sm text-well-dim">
              Thrust-segment acceleration, m/s² (fit from t = 2.5–6 s)
            </div>
            <input
              type="number"
              step="0.01"
              value={accelEntry}
              onChange={(e) => setAccelEntry(e.target.value)}
              placeholder="e.g. 0.90"
              className={numInputClass}
              aria-label="Fitted acceleration in meters per second squared"
            />
            {accelEntry.trim() !== "" && (
              <p className="mt-1 text-sm text-well-dim">
                {accelOk ? "✓ Within tolerance of the fitted 0.90 m/s²." : "Not yet — the fit says 0.90 m/s². Check your arithmetic."}
              </p>
            )}
          </div>
        </>
      }
    >
      <Readouts
        items={[
          { label: "Fitted acceleration", value: `${fmt(fit.a, 2)} m/s²` },
          { label: "Fitted v at t = 2.5 s", value: `${fmt(fit.v0, 2)} m/s` },
          { label: "Fit RMS residual", value: `${fmt(fit.rms * 100, 1)} cm` },
          { label: "Reconstruction", value: done ? "Complete ✓" : "Incomplete" },
        ]}
      />
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-sm text-well-dim">Position log (cart on a track)</p>
          <table className="w-full text-sm tabular-nums text-well-fg">
            <thead>
              <tr className="text-left text-well-dim">
                <th className="py-1 pr-3 font-medium">t (s)</th>
                <th className="py-1 pr-3 font-medium">x (m)</th>
                <th className="py-1 font-medium">v on interval → (m/s)</th>
              </tr>
            </thead>
            <tbody>
              {MOTION_DATA.map((s, i) => (
                <tr key={s.t} className="border-t border-white/10">
                  <td className="py-1 pr-3">{fmt(s.t, 1)}</td>
                  <td className="py-1 pr-3">{fmt(s.x, 2)}</td>
                  <td className="py-1">
                    {i < MOTION_DATA.length - 1 ? (
                      RECON_INTERVALS.includes(i) ? (
                        <span className="inline-flex items-center gap-2">
                          <input
                            type="number"
                            step="0.01"
                            value={entries[i] ?? ""}
                            onChange={(e) => setEntries((p) => ({ ...p, [i]: e.target.value }))}
                            placeholder="?"
                            aria-label={`Velocity on interval ${i}`}
                            className={`${numInputClass} !w-24 !py-1`}
                          />
                          {velOk(i) === true && <span aria-label="correct">✓</span>}
                          {velOk(i) === false && <span aria-label="incorrect">✗</span>}
                        </span>
                      ) : (
                        <span className="text-well-dim">{fmt(vels[i], 2)}</span>
                      )
                    ) : (
                      <span className="text-well-dim">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <p className="mb-2 text-sm text-well-dim">Interval velocities from your entries</p>
          <p className="text-sm leading-relaxed text-well-fg">
            Cruise intervals (0–4) hold near 1.60 m/s; thrust intervals (5–11) climb steadily.
            {segment !== "unanswered" && !segmentOk && (
              <> Your pick is off — look for where the velocities stop changing.</>
            )}
            {segmentOk && <> You found the cruise segment: five intervals of near-constant velocity.</>}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-well-dim">
            The reconstruction: x(t) ≈ {fmt(fit.x0, 2)} + {fmt(fit.v0, 2)}·τ + ½·{fmt(fit.a, 2)}·τ²
            for τ = t − 2.5 s, with an RMS miss of {fmt(fit.rms * 100, 1)} cm — inside the sensor
            jitter, so the constant-acceleration model is consistent with the log.
          </p>
          {done && (
            <p className="mt-3 text-sm font-medium text-well-fg">
              Reconstruction complete. You turned a position log into velocities, a segment
              classification, and a fitted acceleration — that is motion reconstruction.
            </p>
          )}
        </div>
      </div>
    </BenchShell>
  );
}

const TARGETS = [
  { id: "near", label: "Near berm — 25 m", distance: 25 },
  { id: "mid", label: "Mid field — 40 m", distance: 40 },
  { id: "far", label: "Far ridge — 60 m", distance: 60 },
];
const HIT_TOL = 1.5;
const MAX_TRIES = 3;

export function ProjectileBench() {
  const [targetId, setTargetId] = useState("mid");
  const [speed, setSpeed] = useState(18);
  const [angle, setAngle] = useState(40);
  const [shots, setShots] = useState<number[]>([]);
  const target = TARGETS.find((t) => t.id === targetId) ?? TARGETS[1];
  const pred = projectile(speed, angle);

  const fire = () => setShots((p) => [...p, pred.range]);
  const reset = (id: string) => {
    setTargetId(id);
    setShots([]);
  };
  const hits = shots.filter((r) => Math.abs(r - target.distance) <= HIT_TOL).length;
  const solved = hits > 0 && shots.length <= MAX_TRIES;

  const pts = trajectoryPoints(speed, angle);
  const maxX = Math.max(pred.range * 1.08, target.distance + 6, 10);
  const maxY = Math.max(pred.maxHeight * 1.35, 4);
  const px = (x: number) => 12 + (x / maxX) * 296;
  const py = (y: number) => 188 - (y / maxY) * 168;
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${px(p.x).toFixed(1)},${py(Math.max(p.y, 0)).toFixed(1)}`).join(" ");

  return (
    <BenchShell
      prompt="Hit the target with vacuum ballistics. || Set launch speed and angle, read the predicted range from the equations, then fire. || Land within ±1.5 m in three shots or fewer."
      note="No drag, flat range, g = 9.81 m/s². The predictor is R = v₀²sin2θ/g — the bench is honest about which equation does the aiming."
      controls={
        <>
          <Segmented
            label="Target"
            value={targetId}
            onChange={reset}
            options={TARGETS.map((t) => ({ value: t.id, label: t.label }))}
          />
          <Slider label="Launch speed" min={5} max={30} step={0.5} value={speed} display={`${fmt(speed, 1)} m/s`} onChange={setSpeed} />
          <Slider label="Launch angle" min={10} max={80} step={1} value={angle} display={`${fmt(angle, 0)}°`} onChange={setAngle} />
          <div className="sm:col-span-2">
            <WellButton onClick={fire}>Fire</WellButton>
          </div>
        </>
      }
    >
      <Readouts
        items={[
          { label: "Predicted range", value: `${fmt(pred.range, 1)} m` },
          { label: "Time of flight", value: `${fmt(pred.timeOfFlight, 2)} s` },
          { label: "Max height", value: `${fmt(pred.maxHeight, 1)} m` },
          { label: "Shots / hits", value: `${shots.length} / ${hits}` },
        ]}
      />
      <svg viewBox="0 0 320 200" className="h-auto w-full" aria-label="Projectile trajectory">
        <line x1={12} y1={188} x2={308} y2={188} stroke="currentColor" strokeOpacity="0.4" />
        <rect
          x={px(target.distance - HIT_TOL)}
          y={178}
          width={px(target.distance + HIT_TOL) - px(target.distance - HIT_TOL)}
          height={10}
          fill="currentColor"
          opacity={0.35}
        />
        <text x={px(target.distance)} y={172} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.7}>
          {target.distance} m
        </text>
        <path d={path} fill="none" stroke="currentColor" strokeWidth={2} />
        {shots.map((r, i) => (
          <circle
            key={i}
            cx={px(Math.min(r, maxX))}
            cy={188}
            r={4}
            fill="currentColor"
            opacity={Math.abs(r - target.distance) <= HIT_TOL ? 1 : 0.45}
          />
        ))}
      </svg>
      <p className="mt-2 text-sm leading-relaxed text-well-dim">
        {shots.length === 0 && "No shots yet — the curve is your prediction. Fire when the predicted range covers the target."}
        {shots.length > 0 && hits === 0 && `Missed by ${fmt(Math.abs(shots[shots.length - 1] - target.distance), 1)} m. Adjust: range scales with v₀² and sin2θ.`}
        {hits > 0 && !solved && `Hit — but after ${shots.length} shots. Reset the target and do it in ${MAX_TRIES} or fewer.`}
        {solved && `Target hit in ${shots.length} ${shots.length === 1 ? "shot" : "shots"}. The aiming was done by R = v₀²sin2θ/g.`}
      </p>
    </BenchShell>
  );
}

/* ------------------------------------------------------------------ */
/* Physics 101, Week 3 benches                                         */
/* ------------------------------------------------------------------ */

export function FrictionInclineBench() {
  const [pairId, setPairId] = useState("wood");
  const [mass, setMass] = useState(5);
  const [angle, setAngle] = useState(20);
  const pair = frictionPair(pairId);
  const result = blockOnIncline(mass, angle, pair.muS, pair.muK);
  const slipAngle = (Math.atan(pair.muS) * 180) / Math.PI;
  const tanNow = Math.tan((angle * Math.PI) / 180);

  const theta = (angle * Math.PI) / 180;
  const sx = 40;
  const sy = 152;
  const L = 250;
  const ex = sx + L * Math.cos(theta);
  const ey = sy - L * Math.sin(theta);
  const mx = sx + (L / 2) * Math.cos(theta);
  const my = sy - (L / 2) * Math.sin(theta);

  return (
    <BenchShell
      prompt="Pick a material pair and raise the incline angle until the block slips. || Read the slip angle, compute μs = tan θ, and compare it against the pair's stated value — then push past the angle and watch kinetic friction take the smaller share. || Run all five pairs: the slip angle moves, but one quantity never depends on the mass."
      note="The μ values are classroom values, not tribology data — real friction depends on finish, humidity, and history. The identity μs = tan θ is exact inside the model, which is why the slip angle is the lab's instrument."
      controls={
        <>
          <Segmented
            label="Material pair"
            value={pairId}
            onChange={setPairId}
            options={FRICTION_PAIRS.map((p) => ({ value: p.id, label: p.label }))}
          />
          <Slider label="Mass" min={0.5} max={12} step={0.5} value={mass} display={`${fmt(mass, 1)} kg`} onChange={setMass} />
          <Slider label="Incline angle" min={0} max={50} step={0.5} value={angle} display={`${fmt(angle, 1)}°`} onChange={setAngle} />
        </>
      }
    >
      <Readouts
        items={[
          { label: "Normal force", value: `${fmt(result.normal, 1)} N` },
          { label: "Static budget μs·N", value: `${fmt(pair.muS * result.normal, 1)} N` },
          { label: "State", value: result.state === "stuck" ? "Stuck" : "Sliding" },
          { label: "Acceleration", value: `${fmt(result.accel, 2)} m/s²` },
          { label: "Slip angle", value: `${fmt(slipAngle, 1)}°` },
          { label: "tan θ now", value: fmt(tanNow, 3) },
        ]}
      />
      <svg viewBox="0 0 320 180" className="h-auto w-full" aria-hidden>
        <line x1="20" y1={sy} x2="300" y2={sy} stroke="currentColor" strokeOpacity="0.4" />
        <line x1={sx} y1={sy} x2={ex} y2={ey} stroke="currentColor" strokeWidth="2" />
        <path d={`M ${sx + 34} ${sy} A 34 34 0 0 0 ${sx + 34 * Math.cos(theta)} ${sy - 34 * Math.sin(theta)}`} fill="none" stroke="currentColor" strokeOpacity="0.5" strokeDasharray="3 3" />
        <g transform={`rotate(${-angle} ${mx} ${my})`}>
          <rect x={mx - 26} y={my - 34} width="52" height="34" fill="none" stroke="currentColor" strokeWidth="2" />
        </g>
      </svg>
      <p className="mt-2 text-sm leading-relaxed text-well-dim">
        {result.state === "stuck"
          ? `Holding: the downslope pull mg·sinθ is inside the μs·N budget, so friction matches it exactly and nothing moves. At the slip angle tan θ equals μs = ${fmt(pair.muS, 2)} — the mass canceled out of that identity.`
          : `Sliding: the pull exceeded the static budget, so kinetic friction μk·N = ${fmt(result.friction, 1)} N opposes the motion and the remainder accelerates the block at ${fmt(result.accel, 2)} m/s².`}
      </p>
    </BenchShell>
  );
}

type FbdForce = {
  id: string;
  label: string;
  /** Whether the force genuinely acts in this scenario. */
  present: boolean;
  directions: string[];
  /** Index into directions of the correct direction (only meaningful when present). */
  correctDir: number;
  why: string;
};

type FbdScenario = {
  id: string;
  title: string;
  setup: string;
  forces: FbdForce[];
};

const FBD_SCENARIOS: FbdScenario[] = [
  {
    id: "slope",
    title: "Block on a rough incline",
    setup: "A block slides down a rough incline. The diagram is for the block alone.",
    forces: [
      {
        id: "weight",
        label: "Weight",
        present: true,
        directions: ["Straight down", "Perpendicular into the slope", "Down the slope"],
        correctDir: 0,
        why: "Gravity acts on the block always, straight down — it does not tilt with the slope.",
      },
      {
        id: "normal",
        label: "Normal force",
        present: true,
        directions: ["Perpendicular out of the slope", "Straight up", "Down the slope"],
        correctDir: 0,
        why: "The surface pushes back perpendicular to itself. Straight up is wrong on a slope — that is the flat-ground habit misfiring.",
      },
      {
        id: "friction",
        label: "Kinetic friction",
        present: true,
        directions: ["Up the slope", "Down the slope", "Perpendicular out of the slope"],
        correctDir: 0,
        why: "The block slides down, so kinetic friction opposes the motion: up the slope, at μk·N.",
      },
      {
        id: "motion",
        label: "Force of motion",
        present: false,
        directions: ["Down the slope"],
        correctDir: 0,
        why: "Invented. Motion needs no force to sustain it — only changes in motion do. This arrow explains nothing and predicts nothing.",
      },
      {
        id: "tension",
        label: "Tension",
        present: false,
        directions: ["Up the slope"],
        correctDir: 0,
        why: "No string, no tension. Every force needs an agent you can point at.",
      },
    ],
  },
  {
    id: "pulley",
    title: "Mass over a pulley (the 3 kg side)",
    setup: "A 3 kg mass hangs from a massless string over an ideal pulley, the other side holding 5 kg. The diagram is for the 3 kg mass alone.",
    forces: [
      {
        id: "weight",
        label: "Weight",
        present: true,
        directions: ["Straight down", "Straight up", "Toward the pulley"],
        correctDir: 0,
        why: "m₁g straight down, always. 3.0 × 9.81 = 29.4 N.",
      },
      {
        id: "tension",
        label: "Tension",
        present: true,
        directions: ["Straight up, along the string", "Toward the 5 kg mass", "Straight down"],
        correctDir: 0,
        why: "The string pulls the mass up along itself. Tension is uniform in the ideal string — the 5 kg side feels the same pull.",
      },
      {
        id: "normal",
        label: "Normal force",
        present: false,
        directions: ["Straight up"],
        correctDir: 0,
        why: "Nothing touches the mass — no contact, no normal force. Hanging is not resting.",
      },
      {
        id: "pulley-side",
        label: "Sideways pull from the pulley",
        present: false,
        directions: ["Toward the pulley"],
        correctDir: 0,
        why: "The pulley acts on the string, not on the mass. The mass feels only what touches it: the string above, and gravity.",
      },
    ],
  },
  {
    id: "crate",
    title: "Crate pushed at constant velocity",
    setup: "You push a crate across a warehouse floor and it moves at constant velocity. The diagram is for the crate alone.",
    forces: [
      {
        id: "weight",
        label: "Weight",
        present: true,
        directions: ["Straight down", "Backward", "Straight up"],
        correctDir: 0,
        why: "mg straight down, as always — the one force that needs no contact.",
      },
      {
        id: "normal",
        label: "Normal force",
        present: true,
        directions: ["Straight up", "Forward", "Perpendicular to the push"],
        correctDir: 0,
        why: "The floor pushes up, perpendicular to itself. On flat ground that is straight up, equal to the weight here.",
      },
      {
        id: "push",
        label: "Applied push",
        present: true,
        directions: ["Forward, horizontal", "Downward", "Backward"],
        correctDir: 0,
        why: "Your hand is an agent you can point at — the push is a legitimate arrow, forward and horizontal.",
      },
      {
        id: "friction",
        label: "Kinetic friction",
        present: true,
        directions: ["Backward, opposing the motion", "Forward, with the motion", "Straight down"],
        correctDir: 0,
        why: "The crate slides forward, so kinetic friction points backward at μk·N. Constant velocity means it exactly balances the push — read the push's value off the friction.",
      },
      {
        id: "motion",
        label: "Force of motion",
        present: false,
        directions: ["Forward"],
        correctDir: 0,
        why: "Invented again. The crate moves at constant velocity because the net force is zero, not because a forward force sustains it.",
      },
    ],
  },
];

const FBD_KEY = "ff:fbd-w3";

export function FbdBuilderBench() {
  const [scenarioId, setScenarioId] = useState("slope");
  const scenario = FBD_SCENARIOS.find((s) => s.id === scenarioId) ?? FBD_SCENARIOS[0];
  const [included, setIncluded] = useState<Record<string, boolean>>({});
  const [dirs, setDirs] = useState<Record<string, number>>({});
  const [checked, setChecked] = useState(false);
  const [done, setDone] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(FBD_KEY) ?? "[]");
    } catch {
      return [];
    }
  });

  const selectScenario = (id: string) => {
    setScenarioId(id);
    setIncluded({});
    setDirs({});
    setChecked(false);
  };

  const toggle = (fid: string) =>
    setIncluded((prev) => ({ ...prev, [fid]: !prev[fid] }));
  const setDir = (fid: string, i: number) => {
    setDirs((prev) => ({ ...prev, [fid]: i }));
    setIncluded((prev) => ({ ...prev, [fid]: true }));
  };

  const grade = () => {
    let setRight = 0;
    let dirRight = 0;
    let presentCount = 0;
    const lines: string[] = [];
    for (const f of scenario.forces) {
      const on = included[f.id] ?? false;
      if (on === f.present) {
        setRight += 1;
      } else {
        lines.push(on ? `“${f.label}” does not act here — ${f.why}` : `Missing “${f.label}” — ${f.why}`);
      }
      if (f.present) {
        presentCount += 1;
        if (on && (dirs[f.id] ?? -1) === f.correctDir) {
          dirRight += 1;
        } else if (on) {
          lines.push(`“${f.label}” points the wrong way — ${f.why}`);
        }
      }
    }
    return { setRight, dirRight, presentCount, total: scenario.forces.length, lines };
  };

  const result = checked ? grade() : null;
  const perfect = result !== null && result.setRight === result.total && result.dirRight === result.presentCount;

  useEffect(() => {
    if (!perfect || done.includes(scenario.id)) return;
    const next = [...done, scenario.id];
    setDone(next);
    try {
      localStorage.setItem(FBD_KEY, JSON.stringify(next));
    } catch {
      /* private browsing: the portfolio simply does not persist */
    }
  }, [perfect, scenario.id, done]);

  return (
    <BenchShell
      prompt="Build the diagram: toggle every force the scenario exerts — and none it does not — then set each arrow's direction. || The bench grades the force set first and the directions second, the way a grader does. || Get all three scenarios green, then name the two forces beginners invent most often."
      note="Your portfolio saves in this browser. The two classic invented arrows are the “force of motion” sustaining movement and a centrifugal arrow drawn in an inertial frame — if either is on your diagram, ask what agent exerts it."
      controls={
        <>
          <Segmented
            label="Scenario"
            value={scenarioId}
            onChange={selectScenario}
            options={FBD_SCENARIOS.map((s) => ({ value: s.id, label: s.title }))}
          />
          <div className="sm:col-span-2">
            <div className="mb-2 text-sm text-well-dim">Portfolio</div>
            <div className="flex flex-wrap gap-2">
              {FBD_SCENARIOS.map((s) => (
                <span
                  key={s.id}
                  className={
                    done.includes(s.id)
                      ? "rounded-lg bg-well-fg px-3 py-1 text-sm text-well"
                      : "rounded-lg px-3 py-1 text-sm text-well-fg ring-1 ring-white/25"
                  }
                >
                  {done.includes(s.id) ? "✓ " : "○ "}{s.title}
                </span>
              ))}
            </div>
          </div>
        </>
      }
    >
      <Readouts
        items={[
          { label: "Scenario", value: scenario.title },
          { label: "Portfolio", value: `${done.length} / ${FBD_SCENARIOS.length}` },
          {
            label: "Last check",
            value: result === null ? "—" : perfect ? "Green" : `${result.setRight}/${result.total} set · ${result.dirRight}/${result.presentCount} dirs`,
          },
        ]}
      />
      <p className="mb-4 text-sm leading-relaxed text-well-dim">{scenario.setup}</p>
      <div className="flex flex-col gap-3">
        {scenario.forces.map((f) => {
          const on = included[f.id] ?? false;
          return (
            <div key={f.id} className="rounded-lg ring-1 ring-white/15 p-3">
              <label className="flex cursor-pointer items-center gap-3 text-sm text-well-fg">
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => {
                    toggle(f.id);
                    setChecked(false);
                  }}
                  className="h-4 w-4 shrink-0 accent-white"
                />
                <span className="font-medium">{f.label}</span>
              </label>
              {on && (
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3" role="radiogroup" aria-label={`${f.label} direction`}>
                  {f.directions.map((d, i) => {
                    const sel = (dirs[f.id] ?? -1) === i;
                    return (
                      <button
                        key={d}
                        type="button"
                        role="radio"
                        aria-checked={sel}
                        onClick={() => {
                          setDir(f.id, i);
                          setChecked(false);
                        }}
                        className={
                          sel
                            ? "min-h-11 rounded-lg bg-well-fg px-3 py-2 text-left text-sm text-well"
                            : "min-h-11 rounded-lg px-3 py-2 text-left text-sm text-well-fg ring-1 ring-white/25"
                        }
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4">
        <WellButton onClick={() => setChecked(true)}>Check this diagram</WellButton>
      </div>
      {result !== null && (
        <div className="mt-3">
          {perfect ? (
            <p className="text-sm leading-relaxed text-well-fg">
              Green. Every force placed, every arrow defended — this scenario joins the portfolio.
              {done.length === FBD_SCENARIOS.length && (
                <> Portfolio complete. The two invented forces to retire: a “force of motion” pushing along the velocity, and a centrifugal arrow drawn in an inertial frame.</>
              )}
            </p>
          ) : (
            <ul className="flex flex-col gap-1">
              {result.lines.map((line) => (
                <li key={line} className="text-sm leading-relaxed text-well-dim">
                  {line}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </BenchShell>
  );
}

const AUDIT_KEY = "ff:audit-w4";

export function EnergyAuditBench() {
  const [mech, setMech] = useState<MechanismId>("lever");
  const [force, setForce] = useState(120);
  const [distance, setDistance] = useState(1.5);
  const [mass, setMass] = useState(40);
  const [lift, setLift] = useState(1.2);
  const [note, setNote] = useState(() => {
    try {
      return localStorage.getItem(AUDIT_KEY) ?? "";
    } catch {
      return "";
    }
  });

  const inputWork = force * distance;
  const usefulWork = mass * 9.81 * lift;
  const lost = inputWork - usefulWork;
  const eff = inputWork > 0 ? (usefulWork / inputWork) * 100 : 0;
  const balanced = usefulWork <= inputWork;
  const mechanism = MECHANISMS.find((m) => m.id === mech);

  return (
    <BenchShell
      prompt="Pick a mechanism and set the input stroke and the lifted load. || Read the audit: input work, useful work, losses, efficiency. If useful exceeds input, the measurement is wrong — say which one."
      note="Work in = force × distance of the input stroke. Useful work out = mgh of the lifted load. The rest is losses — the mechanism's note names where they hide. Your audit note persists in this browser."
      controls={
        <>
          <Segmented
            label="Mechanism"
            value={mech}
            onChange={setMech}
            options={MECHANISMS.map((m) => ({ value: m.id as MechanismId, label: m.name }))}
          />
          <Slider label="Input force" min={10} max={400} step={5} value={force} display={`${fmt(force, 0)} N`} onChange={setForce} />
          <Slider label="Input distance" min={0.2} max={4} step={0.1} value={distance} display={`${fmt(distance, 1)} m`} onChange={setDistance} />
          <Slider label="Load mass" min={5} max={200} step={5} value={mass} display={`${fmt(mass, 0)} kg`} onChange={setMass} />
          <Slider label="Lift height" min={0.2} max={3} step={0.1} value={lift} display={`${fmt(lift, 1)} m`} onChange={setLift} />
        </>
      }
    >
      <Readouts
        items={[
          { label: "Work in", value: `${fmt(inputWork, 1)} J` },
          { label: "Useful out", value: `${fmt(usefulWork, 1)} J` },
          { label: "Losses", value: `${fmt(Math.max(0, lost), 1)} J` },
          { label: "Efficiency", value: `${fmt(Math.min(100, eff), 1)}%` },
        ]}
      />
      <div className="mt-4 flex flex-col gap-2 text-sm">
        <Bar label="Useful" pct={(usefulWork / Math.max(1, inputWork)) * 100} />
        <Bar label="Losses" pct={Math.max(0, Math.min(100, (lost / Math.max(1, inputWork)) * 100))} />
      </div>
      <p className="mt-3 text-sm text-well-dim">
        {balanced
          ? `${fmt(lost, 1)} J did not become lift. ${mechanism?.losses ?? ""} Efficiency ${fmt(eff, 1)}% — the rest is the price of the mechanism.`
          : `Impossible: useful output (${fmt(usefulWork, 1)} J) exceeds input (${fmt(inputWork, 1)} J). Recheck the input stroke — the error almost always hides there.`}
      </p>
      <label className="mt-4 block text-sm">
        <span className="text-well-dim">Audit note — one sentence: where did the losses go?</span>
        <textarea
          className="mt-1 w-full rounded-md border border-white/20 bg-white/5 p-2 text-sm"
          rows={2}
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
            try {
              localStorage.setItem(AUDIT_KEY, e.target.value);
            } catch {
              /* storage unavailable */
            }
          }}
          placeholder="e.g. 38% of the input heated the gear mesh and bearings; the lever's own weight accounts for most of the rest."
        />
      </label>
    </BenchShell>
  );
}

export function SpeedPredictBench() {
  const [height, setHeight] = useState(20);
  const [v0, setV0] = useState(0);
  const [mass, setMass] = useState(2);
  const [mass2, setMass2] = useState(20);

  const speed = Math.sqrt(v0 * v0 + 2 * 9.81 * height);
  const speed2 = Math.sqrt(2 * 9.81 * height);
  const px = 40 + Math.min(1, speed / 30) * 240;

  return (
    <BenchShell
      prompt="Set a drop height and an initial speed. || Read the predicted speed from conservation alone. Then change both masses and watch the prediction refuse to move."
      note="v = √(v₀² + 2gh) — pure conservation, no friction. The mass sliders are a controlled experiment: identical predictions for a 2 kg and a 20 kg body. Friction would subtract from reality, never from this formula."
      controls={
        <>
          <Slider label="Drop height" min={0.5} max={50} step={0.5} value={height} display={`${fmt(height, 1)} m`} onChange={setHeight} />
          <Slider label="Initial speed" min={0} max={20} step={0.5} value={v0} display={`${fmt(v0, 1)} m/s`} onChange={setV0} />
          <Slider label="Mass A" min={0.5} max={50} step={0.5} value={mass} display={`${fmt(mass, 1)} kg`} onChange={setMass} />
          <Slider label="Mass B" min={0.5} max={50} step={0.5} value={mass2} display={`${fmt(mass2, 1)} kg`} onChange={setMass2} />
        </>
      }
    >
      <Readouts
        items={[
          { label: "Predicted speed", value: `${fmt(speed, 2)} m/s` },
          { label: "Mass A prediction", value: `${fmt(speed2, 2)} m/s` },
          { label: "Mass B prediction", value: `${fmt(speed2, 2)} m/s` },
        ]}
      />
      <svg viewBox="0 0 320 120" className="h-auto w-full" aria-hidden>
        <line x1="40" y1="20" x2="40" y2="100" stroke="currentColor" strokeOpacity="0.45" strokeDasharray="4 3" />
        <circle cx="40" cy="20" r="7" fill="currentColor" opacity="0.7" />
        <Arrow x1={40} y1={100} x2={px} y2={100} opacity={1} />
        <text x="40" y="115" fill="currentColor" opacity="0.6" fontSize="10" textAnchor="middle">
          h = {fmt(height, 1)} m
        </text>
        <text x={Math.min(300, px + 4)} y="96" fill="currentColor" opacity="0.6" fontSize="10">
          v = {fmt(speed, 1)} m/s
        </text>
      </svg>
      <p className="mt-2 text-sm text-well-dim">
        The arrow length scales with the predicted speed. Mass A ({fmt(mass, 1)} kg) and mass B ({fmt(mass2, 1)} kg) fall to the
        same speed because the m in mgh and the m in ½mv² cancel — Galileo's result, one line of algebra.
      </p>
    </BenchShell>
  );
}

/* ------------------------------------------------------------------ */
/* Physics 101, Week 5 — Momentum & collisions                          */
/* ------------------------------------------------------------------ */

function NumEntry({
  label,
  value,
  onChange,
  state,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  state: boolean | null;
}) {
  return (
    <div>
      <div className="mb-2 text-sm text-well-dim">{label}</div>
      <span className="inline-flex items-center gap-2">
        <input
          type="number"
          step="0.01"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="?"
          aria-label={label}
          className={`${numInputClass} !w-28 !py-1`}
        />
        {state === true && <span aria-label="correct">✓</span>}
        {state === false && <span aria-label="incorrect">✗</span>}
      </span>
    </div>
  );
}

// Frame log from the collision footage: 0.1 s between frames, the carts
// meet between t = 0.2 s and t = 0.4 s. Masses: 0.5 kg and 0.3 kg.
const IMPACT_FRAMES = [
  { t: 0.0, x1: 0.0, x2: 0.55 },
  { t: 0.1, x1: 0.08, x2: 0.5 },
  { t: 0.2, x1: 0.16, x2: 0.45 },
  { t: 0.4, x1: 0.242, x2: 0.48 },
  { t: 0.5, x1: 0.244, x2: 0.56 },
  { t: 0.6, x1: 0.246, x2: 0.64 },
];
const IMPACT_M1 = 0.5;
const IMPACT_M2 = 0.3;
const IMPACT_TRUE = { v1b: 0.8, v2b: -0.5, v1a: 0.02, v2a: 0.8 };
const IMPACT_TOL = 0.05;

export function ImpactLabBench() {
  const [entries, setEntries] = useState<Record<string, string>>({});
  const set = (k: string) => (v: string) => setEntries((p) => ({ ...p, [k]: v }));
  const ok = (k: string): boolean | null => {
    const raw = entries[k];
    if (raw === undefined || raw.trim() === "") return null;
    const n = Number(raw);
    if (!Number.isFinite(n)) return false;
    return Math.abs(n - IMPACT_TRUE[k as keyof typeof IMPACT_TRUE]) <= IMPACT_TOL;
  };
  const keys = ["v1b", "v2b", "v1a", "v2a"];
  const allOk = keys.every((k) => ok(k) === true);
  const pBefore = momentum(IMPACT_M1, IMPACT_TRUE.v1b) + momentum(IMPACT_M2, IMPACT_TRUE.v2b);
  const pAfter = momentum(IMPACT_M1, IMPACT_TRUE.v1a) + momentum(IMPACT_M2, IMPACT_TRUE.v2a);
  const kBefore =
    kineticEnergy(IMPACT_M1, IMPACT_TRUE.v1b) + kineticEnergy(IMPACT_M2, IMPACT_TRUE.v2b);
  const kAfter =
    kineticEnergy(IMPACT_M1, IMPACT_TRUE.v1a) + kineticEnergy(IMPACT_M2, IMPACT_TRUE.v2a);

  return (
    <BenchShell
      prompt="The footage is a frame log: positions every 0.1 s, the collision between t = 0.2 and t = 0.4. || Differentiate the frames to get each cart's velocity before and after, and enter all four. The bench audits each entry against the tape. || Then read the momentum and energy accounts — and say what the tape cannot tell you."
      note="Differentiate within a segment only: never difference across the collision gap. Positive velocity points right. The audit tolerance is ±0.05 m/s."
      controls={
        <div className="grid gap-4 sm:grid-cols-2">
          <NumEntry label="Cart 1 velocity before, m/s" value={entries.v1b ?? ""} onChange={set("v1b")} state={ok("v1b")} />
          <NumEntry label="Cart 2 velocity before, m/s" value={entries.v2b ?? ""} onChange={set("v2b")} state={ok("v2b")} />
          <NumEntry label="Cart 1 velocity after, m/s" value={entries.v1a ?? ""} onChange={set("v1a")} state={ok("v1a")} />
          <NumEntry label="Cart 2 velocity after, m/s" value={entries.v2a ?? ""} onChange={set("v2a")} state={ok("v2a")} />
        </div>
      }
    >
      <Readouts
        items={[
          { label: "Momentum", value: allOk ? `${fmt(pBefore, 3)} → ${fmt(pAfter, 3)} kg·m/s` : "—" },
          { label: "Kinetic energy", value: allOk ? `${fmt(kBefore, 4)} → ${fmt(kAfter, 4)} J` : "—" },
          { label: "Energy lost", value: allOk ? `${fmt(kBefore - kAfter, 4)} J` : "—" },
          { label: "Audit", value: allOk ? "Complete ✓" : "Incomplete" },
        ]}
      />
      <p className="mb-2 text-sm text-well-dim">Frame log (masses 0.5 kg and 0.3 kg)</p>
      <table className="w-full text-sm tabular-nums text-well-fg">
        <thead>
          <tr className="text-left text-well-dim">
            <th className="py-1 pr-3 font-medium">t (s)</th>
            <th className="py-1 pr-3 font-medium">x₁ (m)</th>
            <th className="py-1 font-medium">x₂ (m)</th>
          </tr>
        </thead>
        <tbody>
          {IMPACT_FRAMES.map((f) => (
            <tr key={f.t} className="border-t border-white/10">
              <td className="py-1 pr-3">{fmt(f.t, 1)}</td>
              <td className="py-1 pr-3">{fmt(f.x1, 3)}</td>
              <td className="py-1">{fmt(f.x2, 3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {allOk && (
        <p className="mt-3 text-sm text-well-dim">
          Momentum balances to the millijoule-second; about half the kinetic energy is gone — spent on
          deformation and heat, which no frame log can itemize. The tape gives you velocities; e and the
          energy address are inferred, not measured.
        </p>
      )}
    </BenchShell>
  );
}

export function CmExploreBench() {
  const [m1, setM1] = useState(3);
  const [x1, setX1] = useState(-2);
  const [m2, setM2] = useState(2);
  const [x2, setX2] = useState(2);
  const [guess, setGuess] = useState("");
  const xcm = centerOfMass([
    { m: m1, x: x1 },
    { m: m2, x: x2 },
  ]);
  const guessOk: boolean | null =
    guess.trim() === "" ? null : Math.abs(Number(guess) - xcm) <= 0.1;

  const M = 4;
  const [frac, setFrac] = useState(0.5);
  const [va, setVa] = useState(2);
  const ma = M * frac;
  const mb = M * (1 - frac);
  const vax = -va;
  const vbx = (ma * va) / mb;
  const [play, setPlay] = useState(false);
  const [t, setT] = useState(0);
  useTicker(play, (dt) => setT((p) => (p + dt > 2.5 ? 0 : p + dt)));
  const mapX = (x: number) => 20 + ((x + 5) / 10) * 280;
  const xa = vax * t;
  const xb = vbx * t;
  const xcmNow = (ma * xa + mb * xb) / M;

  return (
    <BenchShell
      prompt="Two masses sit on a line. Predict their balance point, then check it. || Then detonate the firecracker: an internal explosion flings the fragments apart — watch the dashed center-of-mass line and say whether it moved. || Write the one-sentence rule for which forces can move a center of mass."
      note="The balance-point audit tolerance is ±0.1 m. In the firecracker the fragments start together at rest, so the center of mass starts at the origin — and has nowhere else to go."
      controls={
        <>
          <Slider label="Mass 1" min={1} max={5} step={0.5} value={m1} display={`${fmt(m1, 1)} kg`} onChange={setM1} />
          <Slider label="Position 1" min={-4} max={0} step={0.5} value={x1} display={`${fmt(x1, 1)} m`} onChange={setX1} />
          <Slider label="Mass 2" min={1} max={5} step={0.5} value={m2} display={`${fmt(m2, 1)} kg`} onChange={setM2} />
          <Slider label="Position 2" min={0} max={4} step={0.5} value={x2} display={`${fmt(x2, 1)} m`} onChange={setX2} />
          <div>
            <div className="mb-2 text-sm text-well-dim">Balance point x_cm, m</div>
            <span className="inline-flex items-center gap-2">
              <input
                type="number"
                step="0.1"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="?"
                aria-label="Predicted center of mass in meters"
                className={`${numInputClass} !w-28 !py-1`}
              />
              {guessOk === true && <span aria-label="correct">✓</span>}
              {guessOk === false && <span aria-label="incorrect">✗</span>}
            </span>
          </div>
          <Slider label="Fragment A share" min={0.25} max={0.75} step={0.05} value={frac} display={`${fmt(ma, 2)} kg`} onChange={setFrac} />
          <Slider label="Fragment A speed" min={1} max={3} step={0.25} value={va} display={`${fmt(va, 2)} m/s`} onChange={setVa} />
          <div className="flex items-end">
            <WellButton
              onClick={() => {
                setT(0);
                setPlay((p) => !p);
              }}
            >
              {play ? "Pause" : "Detonate"}
            </WellButton>
          </div>
        </>
      }
    >
      <Readouts
        items={[
          { label: "Balance point", value: guessOk === true ? `${fmt(xcm, 2)} m ✓` : "—" },
          { label: "COM at t = 0", value: "0.00 m" },
          { label: "COM now", value: `${fmt(xcmNow, 2)} m` },
          { label: "Fragment B speed", value: `${fmt(vbx, 2)} m/s` },
        ]}
      />
      <svg viewBox="0 0 320 90" className="mt-2 h-24 w-full" aria-hidden>
        <line x1="20" y1="45" x2="300" y2="45" stroke="currentColor" strokeOpacity="0.35" />
        <line x1={mapX(0)} y1="10" x2={mapX(0)} y2="80" stroke="currentColor" strokeDasharray="5 4" strokeOpacity="0.7" />
        <circle cx={mapX(xa)} cy="45" r={6 + ma * 2} fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx={mapX(xb)} cy="45" r={6 + mb * 2} fill="none" stroke="currentColor" strokeWidth="2" />
        <text x={mapX(0)} y="88" textAnchor="middle" fill="currentColor" fontSize="10" opacity="0.7">
          x_cm
        </text>
      </svg>
      <p className="mt-3 text-sm text-well-dim">
        The fragments carry equal and opposite momentum — that is the whole content of the explosion
        being internal. The dashed line never moves: only an external force can accelerate a center
        of mass.
      </p>
    </BenchShell>
  );
}

export function RestitutionLabBench() {
  const [m1, setM1] = useState(2);
  const [v1, setV1] = useState(3);
  const [m2, setM2] = useState(3);
  const [v2, setV2] = useState(-1);
  const [e, setE] = useState(1);
  const { u1, u2 } = restitution1D(m1, v1, m2, v2, e);
  const [pred, setPred] = useState({ u1: "", u2: "" });
  const setP = (k: "u1" | "u2") => (v: string) => setPred((p) => ({ ...p, [k]: v }));
  const ok = (k: "u1" | "u2"): boolean | null => {
    const raw = pred[k];
    if (raw.trim() === "") return null;
    const n = Number(raw);
    if (!Number.isFinite(n)) return false;
    return Math.abs(n - (k === "u1" ? u1 : u2)) <= 0.05;
  };
  const pB = totalMomentum([
    { m: m1, v: v1 },
    { m: m2, v: v2 },
  ]);
  const pA = totalMomentum([
    { m: m1, v: u1 },
    { m: m2, v: u2 },
  ]);
  const kB = totalKE([
    { m: m1, v: v1 },
    { m: m2, v: v2 },
  ]);
  const kA = totalKE([
    { m: m1, v: u1 },
    { m: m2, v: u2 },
  ]);

  return (
    <BenchShell
      prompt="Set the masses, the approach, and the restitution. || Predict both outgoing velocities before the solver shows its hand — the bench grades your prediction against the analytic answer. || Sweep e from 0 to 1 on the same impact and watch the energy loss die while the momentum never flinches."
      note="One dimension, no external impulse during the hit. The solver enforces momentum conservation plus u₂ − u₁ = e·(v₁ − v₂). Prediction tolerance ±0.05 m/s."
      controls={
        <>
          <Slider label="Mass 1" min={0.5} max={5} step={0.5} value={m1} display={`${fmt(m1, 1)} kg`} onChange={setM1} />
          <Slider label="Velocity 1" min={-4} max={4} step={0.5} value={v1} display={`${fmt(v1, 1)} m/s`} onChange={setV1} />
          <Slider label="Mass 2" min={0.5} max={5} step={0.5} value={m2} display={`${fmt(m2, 1)} kg`} onChange={setM2} />
          <Slider label="Velocity 2" min={-4} max={4} step={0.5} value={v2} display={`${fmt(v2, 1)} m/s`} onChange={setV2} />
          <Slider label="Restitution e" min={0} max={1} step={0.05} value={e} display={fmt(e, 2)} onChange={setE} />
          <NumEntry label="Your u₁, m/s" value={pred.u1} onChange={setP("u1")} state={ok("u1")} />
          <NumEntry label="Your u₂, m/s" value={pred.u2} onChange={setP("u2")} state={ok("u2")} />
        </>
      }
    >
      <Readouts
        items={[
          { label: "Momentum", value: `${fmt(pB, 2)} → ${fmt(pA, 2)} kg·m/s` },
          { label: "Kinetic energy", value: `${fmt(kB, 2)} → ${fmt(kA, 2)} J` },
          { label: "Energy lost", value: `${fmt(kB - kA, 2)} J` },
          {
            label: "Verdict",
            value:
              e === 1
                ? "Elastic — energy fully returned"
                : e === 0
                  ? "Stuck — maximum energy spent"
                  : `Partially elastic — e = ${fmt(e, 2)}`,
          },
        ]}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Pair title="Before" m1={m1} v1={v1} m2={m2} v2={v2} />
        <Pair title="After" m1={m1} v1={u1} m2={m2} v2={u2} />
      </div>
      <p className="mt-3 text-sm text-well-dim">
        Momentum is conserved at every e — the readouts agree to rounding. The energy loss is the
        signature of the collision, and e = 1 is the only setting that leaves it at zero.
      </p>
    </BenchShell>
  );
}

// ---------------------------------------------------------------------------
// Week 6: torque, rotation & equilibrium
// ---------------------------------------------------------------------------

const numInputCls =
  "w-full rounded-lg bg-white/10 px-3 py-2 text-well-fg ring-1 ring-white/20 placeholder:text-well-dim";

const G = 9.81;

export function TorqueBalanceBench() {
  const [tab, setTab] = useState<"seesaw" | "wrench">("seesaw");
  // See-saw: 30 kg rider fixed at 1.5 m left of pivot; learner places the 20 kg rider.
  const [m2, setM2] = useState(20);
  const [d2, setD2] = useState(2.25);
  // Wrench explorer.
  const [r, setR] = useState(0.25);
  const [f, setF] = useState(400);
  const [theta, setTheta] = useState(90);

  const tauNet = G * (30 * 1.5 - m2 * d2); // CCW positive
  const balanced = Math.abs(tauNet) <= 3;
  const tiltDeg = Math.max(-1, Math.min(1, tauNet / 150)) * 8;

  const tau = torqueFn(r, f, theta);
  const tauMax = r * f;
  const ratio = tauMax > 0 ? tau / tauMax : 0;
  const halfFound = theta > 0 && Math.abs(ratio - 0.5) < 0.03;

  return (
    <BenchShell
      prompt="Balance the see-saw: move the 20 kg rider until the net torque reads zero. || Then switch to the wrench tab and find the pull angle that gives exactly half the maximum torque."
      note="The see-saw is massless and the pivot frictionless — a real board's own weight shifts the balance point. The wrench assumes the force stays in the plane of the page."
      controls={
        <>
          <Segmented
            label="Explorer"
            value={tab}
            onChange={setTab}
            options={[
              { value: "seesaw", label: "See-saw balance" },
              { value: "wrench", label: "Wrench angle" },
            ]}
          />
          {tab === "seesaw" ? (
            <>
              <Slider label="Right rider mass" min={10} max={50} step={1} value={m2} display={`${m2} kg`} onChange={setM2} />
              <Slider label="Right rider distance" min={0.5} max={3} step={0.05} value={d2} display={`${fmt(d2, 2)} m`} onChange={setD2} />
            </>
          ) : (
            <>
              <Slider label="Wrench length" min={0.1} max={0.6} step={0.05} value={r} display={`${fmt(r, 2)} m`} onChange={setR} />
              <Slider label="Pull force" min={0} max={500} step={10} value={f} display={`${f} N`} onChange={setF} />
              <Slider label="Pull angle to handle" min={0} max={90} step={1} value={theta} display={`${theta}°`} onChange={setTheta} />
            </>
          )}
        </>
      }
    >
      {tab === "seesaw" ? (
        <>
          <Readouts
            items={[
              { label: "Left torque", value: `+${fmt(G * 30 * 1.5, 1)} N·m` },
              { label: "Right torque", value: `−${fmt(G * m2 * d2, 1)} N·m` },
              { label: "Net torque", value: `${fmt(tauNet, 1)} N·m` },
              { label: "Balance", value: balanced ? "Balanced ✓" : tauNet > 0 ? "Tips left" : "Tips right" },
            ]}
          />
          <svg viewBox="0 0 320 190" className="h-auto w-full" aria-hidden>
            <polygon points="150,160 170,160 160,132" fill="currentColor" opacity={0.6} />
            <g transform={`rotate(${-tiltDeg} 160 132)`}>
              <line x1="30" y1="132" x2="290" y2="132" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
              <rect x={160 - 1.5 * 43 - 14} y="96" width="28" height="36" rx="4" fill="currentColor" opacity={0.85} />
              <rect x={160 + d2 * 43 - 14} y="96" width="28" height="36" rx="4" fill="currentColor" opacity={0.45} />
            </g>
            <text x="160" y="182" textAnchor="middle" fill="currentColor" opacity={0.6} fontSize="11">
              30 kg at 1.5 m (fixed) vs {m2} kg at {fmt(d2, 2)} m
            </text>
          </svg>
          <p className="mt-2 text-sm text-well-dim">
            Balance is m₁d₁ = m₂d₂: {30 * 1.5} = {fmt(m2 * d2, 2)} kg·m. The 30 kg rider's moment is fixed at 45 kg·m — match it.
          </p>
        </>
      ) : (
        <>
          <Readouts
            items={[
              { label: "Torque", value: `${fmt(tau, 1)} N·m` },
              { label: "Maximum (at 90°)", value: `${fmt(tauMax, 1)} N·m` },
              { label: "Fraction of max", value: `${fmt(ratio * 100, 0)}%` },
              { label: "Half-torque angle", value: halfFound ? "Found ✓ (30°)" : "Not yet" },
            ]}
          />
          <svg viewBox="0 0 320 190" className="h-auto w-full" aria-hidden>
            <circle cx="60" cy="120" r="10" fill="none" stroke="currentColor" strokeWidth="3" />
            <line x1="60" y1="120" x2={60 + r * 380} y2="120" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
            <Arrow
              x1={60 + r * 380}
              y1={120}
              x2={60 + r * 380 - Math.cos((theta * Math.PI) / 180) * 46}
              y2={120 - Math.sin((theta * Math.PI) / 180) * 46}
              opacity={0.9}
            />
            <text x="60" y="160" fill="currentColor" opacity={0.6} fontSize="11">
              τ = rF sin θ = {fmt(r, 2)} × {f} × sin {theta}°
            </text>
          </svg>
          <p className="mt-2 text-sm text-well-dim">
            The arrow is your pull at the handle's end. At 90° the full force turns; at 0° none of it does. Half torque lives at sin θ = ½.
          </p>
        </>
      )}
    </BenchShell>
  );
}

type RotShape = "solid-cylinder" | "hoop" | "rod-center" | "solid-sphere";

const ROT_SHAPES: { value: RotShape; label: string }[] = [
  { value: "solid-cylinder", label: "Solid disk" },
  { value: "hoop", label: "Hoop" },
  { value: "rod-center", label: "Rod, about center" },
  { value: "solid-sphere", label: "Solid sphere" },
];

export function RotInertiaBench() {
  const [shape, setShape] = useState<RotShape>("solid-cylinder");
  const [m, setM] = useState(2);
  const [size, setSize] = useState(0.1);
  const [applied, setApplied] = useState(0.05);
  const [t, setT] = useState(0);
  const [running, setRunning] = useState(false);

  useTicker(running, (dt) => {
    setT((prev) => {
      const next = prev + dt;
      if (next >= 3) {
        setRunning(false);
        return 3;
      }
      return next;
    });
  });

  const I = inertia(shape, m, size);
  const alpha = applied / I;
  const { omega, theta, ke } = spinUp(I, applied, t);
  const revs = theta / (2 * Math.PI);
  const hoopAlpha = applied / inertia("hoop", m, size);
  const isRod = shape === "rod-center";

  return (
    <BenchShell
      prompt="Pick a shape and spin it: set a torque and watch the three-second spin-up. || Now switch the shape to a hoop at the same mass and size and explain, in one sentence, why the angular acceleration changed."
      note="No friction, no air drag — the spin-up is ideal, so the rotor never reaches a terminal rate. The shape-to-shape comparison is exact; absolute times would be longer on a real bearing."
      controls={
        <>
          <Segmented label="Shape" value={shape} onChange={setShape} options={ROT_SHAPES} />
          <Slider label="Mass" min={0.5} max={10} step={0.5} value={m} display={`${fmt(m, 1)} kg`} onChange={setM} />
          <Slider
            label={isRod ? "Length" : "Radius"}
            min={0.05}
            max={0.5}
            step={0.01}
            value={size}
            display={`${fmt(size, 2)} m`}
            onChange={setSize}
          />
          <Slider label="Applied torque" min={0} max={2} step={0.05} value={applied} display={`${fmt(applied, 2)} N·m`} onChange={setApplied} />
          <div className="flex items-end gap-3 sm:col-span-2">
            <WellButton
              onClick={() => {
                setT(0);
                setRunning(true);
              }}
            >
              {running ? "Spinning…" : t > 0 ? "Spin again" : "Spin 3 s"}
            </WellButton>
            <WellButton
              onClick={() => {
                setRunning(false);
                setT(0);
              }}
            >
              Reset
            </WellButton>
          </div>
        </>
      }
    >
      <Readouts
        items={[
          { label: "Moment of inertia", value: `${fmt(I, 4)} kg·m²` },
          { label: "Angular accel α = τ/I", value: `${fmt(alpha, 2)} rad/s²` },
          { label: "ω after 3 s", value: `${fmt(spinUp(I, applied, 3).omega, 1)} rad/s` },
          { label: "KE after 3 s", value: `${fmt(spinUp(I, applied, 3).ke, 2)} J` },
        ]}
      />
      <svg viewBox="0 0 320 150" className="h-auto w-full" aria-hidden>
        <g transform={`translate(160 75) rotate(${(theta * 180) / Math.PI})`}>
          {shape === "rod-center" ? (
            <rect x={-size * 260} y="-6" width={size * 520} height="12" rx="6" fill="currentColor" opacity={0.85} />
          ) : (
            <>
              <circle r={size * 260} fill="none" stroke="currentColor" strokeWidth={shape === "hoop" ? 10 : 3} opacity={0.85} />
              {shape !== "hoop" && <circle r={size * 260} fill="currentColor" opacity={0.15} />}
              <line x1="0" y1="0" x2={size * 260} y2="0" stroke="currentColor" strokeWidth="2" />
            </>
          )}
        </g>
        <text x="160" y="140" textAnchor="middle" fill="currentColor" opacity={0.6} fontSize="11">
          t = {fmt(t, 2)} s · ω = {fmt(omega, 1)} rad/s · {fmt(revs, 1)} rev
        </text>
      </svg>
      <p className="mt-2 text-sm text-well-dim">
        Same {fmt(m, 1)} kg and {fmt(size, 2)} m as a hoop would give α = {fmt(hoopAlpha, 2)} rad/s² —
        {hoopAlpha < alpha ? " slower, because all its mass rides at full radius." : " faster, because its mass sits closer to the axis."}{" "}
        Spin-up energy so far: {fmt(ke, 2)} J.
      </p>
    </BenchShell>
  );
}

type BeamPointSpec = { x: number; f: number; fMax: number };
type BeamProblem = {
  id: string;
  label: string;
  L: number;
  points: BeamPointSpec[];
  uniform: { from: number; to: number; w: number; wMax: number } | null;
};

const BEAM_PROBLEMS: BeamProblem[] = [
  {
    id: "p1",
    label: "Problem 1 — the worked case",
    L: 6,
    points: [
      { x: 2, f: 800, fMax: 2000 },
      { x: 5, f: 400, fMax: 2000 },
    ],
    uniform: null,
  },
  {
    id: "p2",
    label: "Problem 2 — point plus distributed",
    L: 8,
    points: [{ x: 6, f: 1200, fMax: 2000 }],
    uniform: { from: 2, to: 6, w: 150, wMax: 400 },
  },
  {
    id: "p3",
    label: "Problem 3 — short beam, heavy end",
    L: 5,
    points: [
      { x: 1, f: 500, fMax: 2000 },
      { x: 4, f: 1500, fMax: 2000 },
    ],
    uniform: null,
  },
];

const BEAM_KEY = "ff:beam-w6";

function loadSolved(): string[] {
  try {
    const raw = localStorage.getItem(BEAM_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function BeamProblemView({ problem }: { problem: BeamProblem }) {
  const [loads, setLoads] = useState(() => ({
    points: problem.points.map((p) => ({ ...p })),
    w: problem.uniform ? problem.uniform.w : 0,
  }));
  const [ayEntry, setAyEntry] = useState("");
  const [byEntry, setByEntry] = useState("");
  const [solved, setSolved] = useState<string[]>(loadSolved);

  const uniforms = problem.uniform
    ? [{ from: problem.uniform.from, to: problem.uniform.to, w: loads.w }]
    : [];
  const solution = beamReactions(
    problem.L,
    loads.points.map((p) => ({ x: p.x, f: p.f })),
    uniforms,
  );
  const tol = (v: number) => Math.max(1, 0.02 * Math.abs(v));
  const ayOk = ayEntry.trim() !== "" && Math.abs(Number(ayEntry) - solution.ay) <= tol(solution.ay);
  const byOk = byEntry.trim() !== "" && Math.abs(Number(byEntry) - solution.by) <= tol(solution.by);
  const done = ayOk && byOk;

  useEffect(() => {
    if (done && !solved.includes(problem.id)) {
      const next = [...solved, problem.id];
      setSolved(next);
      try {
        localStorage.setItem(BEAM_KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable — the checkmarks still show */
      }
    }
  }, [done, problem.id, solved]);

  const xToPx = (x: number) => 20 + (x / problem.L) * 300;
  const maxF = Math.max(1, ...loads.points.map((p) => p.f), loads.w * (problem.uniform ? problem.uniform.to - problem.uniform.from : 0));

  return (
    <>
      <Readouts
        items={[
          { label: "Span", value: `${problem.L} m` },
          { label: "Total load", value: `${fmt(solution.totalLoad, 0)} N` },
          { label: "A_y (pin)", value: ayEntry.trim() === "" ? "—" : ayOk ? `${fmt(solution.ay, 0)} N ✓` : "✗" },
          { label: "B_y (roller)", value: byEntry.trim() === "" ? "—" : byOk ? `${fmt(solution.by, 0)} N ✓` : "✗" },
          { label: "Problem set", value: `${solved.length}/${BEAM_PROBLEMS.length} solved` },
        ]}
      />
      <svg viewBox="0 0 340 170" className="h-auto w-full" aria-hidden>
        <line x1="20" y1="90" x2="320" y2="90" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
        <polygon points={`${xToPx(0) - 9},108 ${xToPx(0) + 9},108 ${xToPx(0)},92`} fill="currentColor" opacity={0.7} />
        <polygon points={`${xToPx(problem.L) - 9},104 ${xToPx(problem.L) + 9},104 ${xToPx(problem.L)},92`} fill="currentColor" opacity={0.7} />
        <circle cx={xToPx(problem.L)} cy="112" r="5" fill="none" stroke="currentColor" strokeWidth="2" opacity={0.7} />
        {loads.points.map((p, i) => {
          const h = 12 + (p.f / maxF) * 34;
          return (
            <g key={i}>
              <Arrow x1={xToPx(p.x)} y1={90 - h} x2={xToPx(p.x)} y2={86} opacity={0.9} />
              <text x={xToPx(p.x)} y={84 - h} textAnchor="middle" fill="currentColor" fontSize="10" opacity={0.8}>
                {fmt(p.f, 0)} N
              </text>
            </g>
          );
        })}
        {problem.uniform && loads.w > 0 && (
          <g opacity={0.55}>
            <rect x={xToPx(problem.uniform.from)} y="52" width={xToPx(problem.uniform.to) - xToPx(problem.uniform.from)} height="34" fill="currentColor" opacity={0.15} />
            {[0, 0.25, 0.5, 0.75, 1].map((q) => {
              const x = xToPx(problem.uniform!.from + q * (problem.uniform!.to - problem.uniform!.from));
              return <Arrow key={q} x1={x} y1={56} x2={x} y2={82} opacity={0.7} />;
            })}
            <text x={(xToPx(problem.uniform.from) + xToPx(problem.uniform.to)) / 2} y="46" textAnchor="middle" fill="currentColor" fontSize="10">
              w = {fmt(loads.w, 0)} N/m
            </text>
          </g>
        )}
        {(["ay", "by"] as const).map((side) => {
          const x = side === "ay" ? xToPx(0) : xToPx(problem.L);
          const ok = side === "ay" ? ayOk : byOk;
          return (
            <g key={side} opacity={ok ? 0.95 : 0.35}>
              <Arrow x1={x} y1={128} x2={x} y2={96} opacity={ok ? 1 : 0.5} />
              <text x={x} y="142" textAnchor="middle" fill="currentColor" fontSize="10">
                {ok ? `${fmt(side === "ay" ? solution.ay : solution.by, 0)} N` : `${side === "ay" ? "A_y" : "B_y"} = ?`}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <div>
          <div className="mb-2 text-sm text-well-dim">A_y at the pin, N upward</div>
          <input
            type="number"
            step="1"
            value={ayEntry}
            onChange={(e) => setAyEntry(e.target.value)}
            placeholder="e.g. 600"
            aria-label="Left support reaction in newtons"
            className={numInputCls}
          />
          {ayEntry.trim() !== "" && (
            <p className="mt-1 text-sm text-well-dim">{ayOk ? "✓ Correct." : "Not yet — take moments about the roller and solve for the pin."}</p>
          )}
        </div>
        <div>
          <div className="mb-2 text-sm text-well-dim">B_y at the roller, N upward</div>
          <input
            type="number"
            step="1"
            value={byEntry}
            onChange={(e) => setByEntry(e.target.value)}
            placeholder="e.g. 600"
            aria-label="Right support reaction in newtons"
            className={numInputCls}
          />
          {byEntry.trim() !== "" && (
            <p className="mt-1 text-sm text-well-dim">{byOk ? "✓ Correct." : "Not yet — take moments about the pin and solve for the roller."}</p>
          )}
        </div>
      </div>
      {done && (
        <p className="mt-3 text-sm text-well-dim">
          ✓ Problem solved and recorded. Reactions sum to {fmt(solution.ay + solution.by, 0)} N against {fmt(solution.totalLoad, 0)} N of load — equilibrium holds.
        </p>
      )}
      <div className="mt-4 border-t border-white/10 pt-4">
        <p className="mb-3 text-sm text-well-dim">Move the loads (the solver follows):</p>
        <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
          {loads.points.map((p, i) => (
            <div key={i} className="contents">
              <Slider
                label={`Load ${i + 1} position`}
                min={0}
                max={problem.L}
                step={0.1}
                value={p.x}
                display={`${fmt(p.x, 1)} m`}
                onChange={(v) =>
                  setLoads((s) => ({ ...s, points: s.points.map((q, j) => (j === i ? { ...q, x: v } : q)) }))
                }
              />
              <Slider
                label={`Load ${i + 1} magnitude`}
                min={0}
                max={p.fMax}
                step={10}
                value={p.f}
                display={`${fmt(p.f, 0)} N`}
                onChange={(v) =>
                  setLoads((s) => ({ ...s, points: s.points.map((q, j) => (j === i ? { ...q, f: v } : q)) }))
                }
              />
            </div>
          ))}
          {problem.uniform && (
            <Slider
              label={`Uniform load ${problem.uniform.from}–${problem.uniform.to} m`}
              min={0}
              max={problem.uniform.wMax}
              step={5}
              value={loads.w}
              display={`${fmt(loads.w, 0)} N/m`}
              onChange={(v) => setLoads((s) => ({ ...s, w: v }))}
            />
          )}
        </div>
      </div>
    </>
  );
}

export function BeamReactionsBench() {
  const [problemId, setProblemId] = useState(BEAM_PROBLEMS[0].id);
  const problem = BEAM_PROBLEMS.find((p) => p.id === problemId) ?? BEAM_PROBLEMS[0];
  return (
    <BenchShell
      prompt="Solve the beam: read each problem's loads, compute the two reactions, enter them. || All three problems must pass the ±2% tolerance — the beam problem set is the evidence for this week."
      note="Weightless beam, vertical loads only, ideal supports. A real beam carries its own weight as a uniform load, and real supports settle — both nudge the reactions."
      controls={
        <Segmented
          label="Problem set"
          value={problemId}
          onChange={setProblemId}
          options={BEAM_PROBLEMS.map((p) => ({ value: p.id, label: p.label }))}
        />
      }
    >
      <BeamProblemView key={problem.id} problem={problem} />
    </BenchShell>
  );
}

type ElasticMatId = (typeof ELASTIC_MATS)[number]["id"];

function matById(id: ElasticMatId) {
  return ELASTIC_MATS.find((m) => m.id === id) ?? ELASTIC_MATS[0];
}

export function StressStrainBench() {
  const [matId, setMatId] = useState<ElasticMatId>("steel");
  const [diameter, setDiameter] = useState(10);
  const [length, setLength] = useState(2);
  const [force, setForce] = useState(15);
  const mat = matById(matId);
  const area = areaCircle(diameter / 1000);
  const sigma = stress(force * 1000, area);
  const eps = sigma / mat.e;
  const delta = axialDelta(force * 1000, length, area, mat.e);
  const n = factorOfSafety(mat.yield, sigma);
  const holds = n >= 1;
  const yieldStrain = mat.yield / mat.e;
  const draw = Math.min(60, (delta / Math.max(length, 1e-9)) * 4000);

  return (
    <BenchShell
      prompt="Pick a material, a diameter, and a load. || Find the load where the safety factor first drops below 1 — that boundary is the whole story of the elastic range. The marker on the curve shows where your bar sits."
      note="Uniform axial stress, elastic until yield, no notch, no bending. Teaching yield values, not code allowables. The bar drawing exaggerates the stretch so it is visible."
      controls={
        <>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            {ELASTIC_MATS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMatId(m.id)}
                className={
                  m.id === matId
                    ? "min-h-11 rounded-lg bg-well-fg px-3 py-2 text-sm text-well"
                    : "min-h-11 rounded-lg px-3 py-2 text-sm ring-1 ring-white/25"
                }
              >
                {m.short}
              </button>
            ))}
          </div>
          <Slider label="Diameter" min={4} max={40} step={1} value={diameter} display={`${fmt(diameter, 0)} mm`} onChange={setDiameter} />
          <Slider label="Length" min={0.5} max={4} step={0.1} value={length} display={`${fmt(length, 1)} m`} onChange={setLength} />
          <div className="sm:col-span-2">
            <Slider label="Tensile force" min={0.5} max={80} step={0.5} value={force} display={`${fmt(force, 1)} kN`} onChange={setForce} />
          </div>
        </>
      }
    >
      <Readouts
        items={[
          { label: "Stress σ", value: `${fmt(sigma / 1e6, 0)} MPa` },
          { label: "Strain ε", value: fmt(eps, 5) },
          { label: "Elongation", value: `${fmt(delta * 1000, 2)} mm` },
          { label: "Safety factor", value: fmt(n, 2) },
        ]}
      />
      <svg viewBox="0 0 320 96" className="h-24 w-full" aria-hidden>
        <rect x="40" y="30" width="180" height="20" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.45" />
        <rect x="40" y="28" width={180 + draw} height="24" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M20 40 H34" stroke="currentColor" strokeWidth="2" />
        <path d={`M${226 + draw} 40 H300`} stroke="currentColor" strokeWidth="2" />
        <path d={`M${292 + draw} 34 l8 6 -8 6`} fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
      <svg viewBox="0 0 320 110" className="mt-2 h-auto w-full" aria-hidden>
        <line x1="30" y1="96" x2="306" y2="96" stroke="currentColor" strokeOpacity="0.35" />
        <line x1="30" y1="96" x2="30" y2="10" stroke="currentColor" strokeOpacity="0.35" />
        <line
          x1="30"
          y1="96"
          x2={30 + (yieldStrain / (yieldStrain * 1.6)) * 260}
          y2={96 - (mat.yield / (mat.yield * 1.3)) * 80}
          stroke="currentColor"
          strokeWidth="2"
        />
        <line
          x1={30 + (yieldStrain / (yieldStrain * 1.6)) * 260}
          y1={96 - (mat.yield / (mat.yield * 1.3)) * 80}
          x2="300"
          y2={96 - (mat.yield / (mat.yield * 1.3)) * 80}
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="5 4"
          opacity="0.6"
        />
        <circle
          cx={30 + Math.min(1, eps / (yieldStrain * 1.6)) * 260}
          cy={96 - Math.min(1, sigma / (mat.yield * 1.3)) * 80}
          r="5"
          fill={holds ? "currentColor" : "#f87171"}
        />
        <text x="30" y="106" fontSize="9" fill="currentColor" opacity="0.6">strain ε</text>
        <text x="4" y="20" fontSize="9" fill="currentColor" opacity="0.6">stress σ</text>
      </svg>
      <p className="mt-2 text-sm leading-relaxed text-well-dim">
        {holds
          ? `${mat.name} at ${fmt(sigma / 1e6, 0)} MPa is under its ${fmt(mat.yield / 1e6, 0)} MPa yield. The strain is ${fmt(eps, 5)} — stretch over the ${fmt(length, 1)} m length.`
          : `${mat.name} is past its ${fmt(mat.yield / 1e6, 0)} MPa yield. Hooke's law has left the building: the bar takes a permanent set and the elastic formulas no longer describe it.`}
      </p>
    </BenchShell>
  );
}

const ERROR_SOURCES = [
  { value: "support", label: "Support compliance — the clamp is never perfectly fixed" },
  { value: "position", label: "Load position — the weight was not exactly at the tip" },
  { value: "material", label: "Material scatter — this E is not the handbook E" },
  { value: "model", label: "Model limits — δ/L is leaving the small-deflection range" },
] as const;

type ErrorSource = (typeof ERROR_SOURCES)[number]["value"];

export function BeamDeflectionBench() {
  const [matId, setMatId] = useState<ElasticMatId>("steel");
  const [section, setSection] = useState<"rect" | "circle">("rect");
  const [width, setWidth] = useState(40);
  const [depth, setDepth] = useState(20);
  const [diam, setDiam] = useState(25);
  const [length, setLength] = useState(1);
  const [load, setLoad] = useState(100);
  const [prediction, setPrediction] = useState("");
  const [measured, setMeasured] = useState<number | null>(null);
  const [lockedPrediction, setLockedPrediction] = useState<number | null>(null);
  const [source, setSource] = useState<ErrorSource | "">("");
  const [saved, setSaved] = useState<string | null>(() => {
    try {
      return localStorage.getItem("ff:beam-w7");
    } catch {
      return null;
    }
  });

  const mat = matById(matId);
  const inertia =
    section === "rect"
      ? inertiaRect(width / 1000, depth / 1000)
      : inertiaCircle(diam / 1000);
  const model = cantileverDelta(load, length, mat.e, inertia);
  const seed = `${matId}|${section}|${width}|${depth}|${diam}|${length}|${load}`;
  const ratio = model / length;
  const smallOk = ratio < 0.1;

  const predictionNum = Number(prediction);
  const canMeasure = prediction.trim() !== "" && Number.isFinite(predictionNum) && predictionNum > 0 && measured === null;

  function doMeasure() {
    if (!canMeasure) return;
    const m = measuredDeflection(model, seed);
    setMeasured(m);
    setLockedPrediction(predictionNum);
  }

  function reset() {
    setPrediction("");
    setMeasured(null);
    setLockedPrediction(null);
    setSource("");
  }

  const err = measured !== null && lockedPrediction !== null ? percentError(lockedPrediction / 1000, measured) : null;

  function saveRun() {
    if (err === null || measured === null || source === "") return;
    const entry = JSON.stringify({
      material: mat.name,
      loadN: load,
      lengthM: length,
      predictedMm: lockedPrediction,
      measuredMm: measured * 1000,
      errorPct: err,
      source,
    });
    try {
      localStorage.setItem("ff:beam-w7", entry);
      setSaved(entry);
    } catch {
      /* storage unavailable */
    }
  }

  const sagPx = Math.min(64, (model / length) * 420);

  return (
    <BenchShell
      prompt="Choose a material, a section, a length, and a load. Type your predicted tip deflection in millimeters, then press Measure. || The prediction locks when you measure — that is the discipline. The error, not the agreement, is the lesson."
      note="Cantilever, tip load, slender beam, small deflections: δ = FL³/3EI. The 'measurement' is simulated with named, deliberate bias — about 9% support compliance plus ±5% material scatter — so the gap has something to teach. Check δ/L before trusting the model."
      controls={
        <>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            {ELASTIC_MATS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setMatId(m.id);
                  reset();
                }}
                className={
                  m.id === matId
                    ? "min-h-11 rounded-lg bg-well-fg px-3 py-2 text-sm text-well"
                    : "min-h-11 rounded-lg px-3 py-2 text-sm ring-1 ring-white/25"
                }
              >
                {m.short}
              </button>
            ))}
          </div>
          <Segmented
            label="Section"
            value={section}
            onChange={(v) => {
              setSection(v);
              reset();
            }}
            options={[
              { value: "rect", label: "Rectangle" },
              { value: "circle", label: "Solid circle" },
            ]}
          />
          {section === "rect" ? (
            <>
              <Slider label="Width" min={20} max={100} step={1} value={width} display={`${fmt(width, 0)} mm`} onChange={(v) => { setWidth(v); reset(); }} />
              <Slider label="Depth" min={5} max={100} step={1} value={depth} display={`${fmt(depth, 0)} mm`} onChange={(v) => { setDepth(v); reset(); }} />
            </>
          ) : (
            <Slider label="Diameter" min={5} max={80} step={1} value={diam} display={`${fmt(diam, 0)} mm`} onChange={(v) => { setDiam(v); reset(); }} />
          )}
          <Slider label="Length" min={0.2} max={2} step={0.05} value={length} display={`${fmt(length, 2)} m`} onChange={(v) => { setLength(v); reset(); }} />
          <Slider label="Tip load" min={1} max={500} step={1} value={load} display={`${fmt(load, 0)} N`} onChange={(v) => { setLoad(v); reset(); }} />
          <label className="flex min-w-0 flex-col">
            <span className="mb-1 flex items-baseline justify-between gap-3 text-sm">
              <span className="text-well-dim">Your prediction</span>
              <span className="shrink-0 tabular-nums text-well-fg">mm</span>
            </span>
            <input
              className="min-h-11 rounded-lg bg-white/10 px-3 text-sm tabular-nums text-well-fg ring-1 ring-white/25 placeholder:text-well-dim"
              type="number"
              min="0"
              step="any"
              value={prediction}
              disabled={measured !== null}
              placeholder="e.g. 6.2"
              onChange={(e) => setPrediction(e.target.value)}
            />
          </label>
          <div className="flex items-end gap-2">
            {measured === null ? (
              <WellButton onClick={doMeasure}>Measure</WellButton>
            ) : (
              <WellButton onClick={reset}>New prediction</WellButton>
            )}
          </div>
        </>
      }
    >
      <Readouts
        items={[
          { label: "Model δ", value: `${fmt(model * 1000, 2)} mm` },
          { label: "δ / L", value: fmt(ratio, 3) },
          { label: "I", value: `${fmt(inertia * 1e12, 2)}e-12 m⁴` },
          {
            label: "Bending stress",
            value: `${fmt(((load * length * (section === "rect" ? depth / 2000 : diam / 2000)) / inertia) / 1e6, 0)} MPa`,
          },
        ]}
      />
      <svg viewBox="0 0 320 120" className="h-auto w-full" aria-hidden>
        <rect x="8" y="18" width="14" height="60" fill="currentColor" opacity="0.5" />
        <path
          d={`M22 40 Q170 ${40 + sagPx * 1.2} 298 ${40 + sagPx * 2}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path d="M22 40 H150" stroke="currentColor" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
        <line x1="298" y1={40 + sagPx * 2 - 22} x2="298" y2={40 + sagPx * 2} stroke="currentColor" strokeWidth="2" />
        <path d={`M290 ${40 + sagPx * 2} l8 8 -8 8`} fill="none" stroke="currentColor" strokeWidth="2" />
        <line x1="150" y1="96" x2="298" y2="96" stroke="currentColor" strokeOpacity="0.3" strokeDasharray="4 3" />
      </svg>
      {!smallOk && (
        <p className="mt-2 text-sm text-well-dim">
          δ/L is {fmt(ratio, 3)} — past a tenth of the span, the linear formula is leaving its honest range. Treat the number as a scaling hint, not a prediction.
        </p>
      )}
      {measured !== null && err !== null && (
        <div className="mt-4 rounded-lg bg-white/5 p-4">
          <div className="text-sm text-well-dim">Predict → measure</div>
          <div className="mt-1 font-serif text-xl tabular-nums">
            Predicted {fmt(lockedPrediction ?? 0, 2)} mm · Measured {fmt(measured * 1000, 2)} mm · Error {fmt(err, 1)}%
          </div>
          <p className="mt-2 text-sm leading-relaxed text-well-dim">
            The simulated measurement carries about 9% support compliance plus ±5% scatter — the gap is the
            error budget doing its job. Name the dominant source:
          </p>
          <div className="mt-2">
            <Segmented
              label="Dominant error source"
              value={source === "" ? "support" : source}
              onChange={(v) => setSource(v)}
              options={ERROR_SOURCES.map((o) => ({ value: o.value, label: o.label }))}
            />
          </div>
          <div className="mt-3 flex items-end">
            <WellButton onClick={saveRun}>Save this run</WellButton>
          </div>
          {saved !== null && (
            <p className="mt-2 text-sm text-well-dim">
              Saved in this browser: {(() => {
                try {
                  const s = JSON.parse(saved);
                  return `${s.material}, ${s.loadN} N, predicted ${fmt(s.predictedMm, 2)} mm, measured ${fmt(s.measuredMm, 2)} mm, error ${fmt(s.errorPct, 1)}%`;
                } catch {
                  return "a previous run";
                }
              })()}
              .
            </p>
          )}
        </div>
      )}
    </BenchShell>
  );
}

/* ------------------------------------------------------------------ */
/* Physics 101, Week 8 — fluids & flight benches                        */
/* ------------------------------------------------------------------ */

type FluidKey = "fresh" | "sea" | "mercury";

const FLUIDS: Record<FluidKey, { label: string; rho: number }> = {
  fresh: { label: "Fresh water", rho: RHO_WATER },
  sea: { label: "Seawater", rho: RHO_SEAWATER },
  mercury: { label: "Mercury", rho: RHO_MERCURY },
};

export function HydroBench() {
  const [fluid, setFluid] = useState<FluidKey>("fresh");
  const [depth, setDepth] = useState(10);
  const [objRho, setObjRho] = useState(800);
  const rho = FLUIDS[fluid].rho;
  const pGauge = hydrostaticPressure(rho, 9.81, depth);
  const atm = pGauge / 101325;
  const frac = floatFraction(objRho, rho);
  const floats = frac <= 1;
  const pct = Math.min(1, Math.max(0, frac)) * 100;

  return (
    <BenchShell
      prompt="Set the fluid and the depth, read the gauge pressure, and name the weight it represents. || Then set an object density against the fluid and predict float or sink before the bench tells you. || Finish with the ship sentence: why does steel float?"
      note="Pressures here are gauge — above atmosphere. The float test uses average density: a ship's slider value would sit far below water's, because a ship is mostly enclosed air."
      controls={
        <>
          <Segmented
            label="Fluid"
            value={fluid}
            onChange={setFluid}
            options={[
              { value: "fresh", label: "Fresh water" },
              { value: "sea", label: "Seawater" },
              { value: "mercury", label: "Mercury" },
            ]}
          />
          <Slider label="Depth" min={0} max={20} step={0.5} value={depth} display={`${fmt(depth, 1)} m`} onChange={setDepth} />
          <Slider
            label="Object average density"
            min={200}
            max={2000}
            step={10}
            value={objRho}
            display={`${fmt(objRho, 0)} kg/m³`}
            onChange={setObjRho}
          />
        </>
      }
    >
      <Readouts
        items={[
          { label: "Gauge pressure", value: `${fmt(pGauge / 1000, 1)} kPa` },
          { label: "In atmospheres", value: `${fmt(atm, 2)} atm` },
          {
            label: "Float test",
            value: floats ? `Floats — ${fmt(pct, 0)}% submerged` : "Sinks",
          },
        ]}
      />
      <svg viewBox="0 0 320 140" className="h-auto w-full" aria-hidden>
        <rect x="20" y="10" width="120" height="120" fill="currentColor" opacity="0.08" />
        <line x1="20" y1="10" x2="140" y2="10" stroke="currentColor" strokeOpacity="0.5" />
        <line x1="20" y1={10 + (depth / 20) * 120} x2="140" y2={10 + (depth / 20) * 120} stroke="currentColor" strokeWidth="2" />
        <rect x="180" y={floats ? 130 - (pct / 100) * 100 - 20 : 60} width="100" height="20" fill="currentColor" opacity={floats ? 0.7 : 0.25} />
        <line x1="170" y1="130" x2="290" y2="130" stroke="currentColor" strokeOpacity="0.25" strokeDasharray="4 3" />
      </svg>
      <p className="mt-2 text-sm text-well-dim">
        Left: the marked level sits at your depth in a 20 m column — the pressure is the weight of everything
        above the mark. Right: the block floats only when its average density is below the fluid's; at{" "}
        {fmt(objRho, 0)} kg/m³ in {FLUIDS[fluid].label.toLowerCase()} it {floats ? `rides ${fmt(pct, 0)}% under` : "goes straight down"}.
        A steel ship lives near 500 kg/m³ on this slider — mostly air wearing a steel skin.
      </p>
    </BenchShell>
  );
}

type AssumptionKey = "steady" | "incompressible" | "inviscid" | "streamline";

const ASSUMPTIONS: { key: AssumptionKey; label: string; broken: string }[] = [
  { key: "steady", label: "Steady", broken: "Gusts and pulses mean the flow field itself is changing — the constant is not constant in time." },
  { key: "incompressible", label: "Incompressible", broken: "Near Mach 1 the density changes along the streamline, so Av = const and the energy ledger both fail." },
  { key: "inviscid", label: "Inviscid", broken: "Viscosity (honey, boundary layers, separated flow) dissipates energy the equation assumes is conserved." },
  { key: "streamline", label: "One streamline", broken: "Across a pump or turbine, work crosses the boundary — the Bernoulli constant jumps by the work added." },
];

export function VenturiBench() {
  const [dIn, setDIn] = useState(10);
  const [dThroat, setDThroat] = useState(5);
  const [vIn, setVIn] = useState(1);
  const [on, setOn] = useState<Record<AssumptionKey, boolean>>({
    steady: true,
    incompressible: true,
    inviscid: true,
    streamline: true,
  });
  const aIn = Math.PI * (dIn / 200) ** 2;
  const aThroat = Math.PI * (dThroat / 200) ** 2;
  const vThroat = continuitySpeed(vIn, aIn, aThroat);
  const dp = venturiPressureDrop(RHO_WATER, vIn, vThroat);
  const broken = ASSUMPTIONS.filter((a) => !on[a.key]);
  const trusted = broken.length === 0;

  return (
    <BenchShell
      prompt="Narrow the throat and watch the speed rise and the pressure fall — then break each assumption in turn. || For each broken assumption, say in one sentence why the Bernoulli number can no longer be trusted. || Leave able to state when a Venturi meter is lying."
      note="The bench computes the ideal Bernoulli answer and separately flags broken assumptions. A flagged answer is not approximately right — it is outside the theory."
      controls={
        <>
          <Slider label="Inlet diameter" min={4} max={16} step={0.5} value={dIn} display={`${fmt(dIn, 1)} cm`} onChange={setDIn} />
          <Slider
            label="Throat diameter"
            min={2}
            max={16}
            step={0.5}
            value={Math.min(dThroat, dIn)}
            display={`${fmt(Math.min(dThroat, dIn), 1)} cm`}
            onChange={(v) => setDThroat(Math.min(v, dIn))}
          />
          <Slider label="Inlet speed" min={0.2} max={3} step={0.1} value={vIn} display={`${fmt(vIn, 1)} m/s`} onChange={setVIn} />
          <div className="sm:col-span-2">
            <div className="mb-2 text-sm text-well-dim">Bernoulli assumptions — toggle to break</div>
            <div className="flex flex-wrap gap-2">
              {ASSUMPTIONS.map((a) => (
                <WellButton key={a.key} onClick={() => setOn((s) => ({ ...s, [a.key]: !s[a.key] }))}>
                  {on[a.key] ? a.label : `${a.label} ✕`}
                </WellButton>
              ))}
            </div>
          </div>
        </>
      }
    >
      <Readouts
        items={[
          { label: "Throat speed", value: `${fmt(vThroat, 2)} m/s` },
          { label: "Pressure drop", value: trusted ? `${fmt(dp / 1000, 2)} kPa` : "not trustworthy" },
          { label: "Assumptions", value: trusted ? "all four hold" : `${broken.length} broken` },
        ]}
      />
      <svg viewBox="0 0 320 110" className="h-auto w-full" aria-hidden>
        <path
          d={`M10 55 L110 55 L150 ${55 - 22} L210 ${55 - 22} L250 55 L310 55 L310 ${55 + 22} L250 ${55 + 22} L210 ${55 + 22} L150 ${55 + 22} L110 ${55 + 22} L10 ${55 + 22} Z`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <line x1="60" y1="30" x2="60" y2="80" stroke="currentColor" strokeOpacity="0.4" />
        <line x1="180" y1="18" x2="180" y2="92" stroke="currentColor" strokeOpacity="0.4" />
      </svg>
      {trusted ? (
        <p className="mt-2 text-sm text-well-dim">
          Continuity first: the throat is {(aIn / aThroat).toFixed(1)}× smaller in area, so the water moves{" "}
          {(aIn / aThroat).toFixed(1)}× faster. Bernoulli then prices the speedup: the throat pressure sits{" "}
          {fmt(dp / 1000, 2)} kPa below the inlet. A Venturi meter is this diagram with two pressure taps.
        </p>
      ) : (
        <div className="mt-2 text-sm text-well-dim">
          <p className="font-semibold text-well-fg">The meter is lying. Broken:</p>
          <ul className="list-disc pl-5">
            {broken.map((a) => (
              <li key={a.key}>
                <span className="font-semibold text-well-fg">{a.label}:</span> {a.broken}
              </li>
            ))}
          </ul>
        </div>
      )}
    </BenchShell>
  );
}

type StabilityPick = "unstable" | "stable" | "overstable";

export function GliderPreLabBench() {
  const [mass, setMass] = useState(0.25);
  const [area, setArea] = useState(0.06);
  const [clMax, setClMax] = useState(1.1);
  const [xCg, setXCg] = useState(0.27);
  const [xNp, setXNp] = useState(0.3);
  const [mac, setMac] = useState(0.12);
  const [speed, setSpeed] = useState(9);
  const [cl, setCl] = useState(0.6);
  const [ar, setAr] = useState(5);
  const [predV, setPredV] = useState("");
  const [predS, setPredS] = useState<StabilityPick>("stable");
  const [checked, setChecked] = useState(false);
  const [note, setNote] = useState(() => {
    try {
      return localStorage.getItem("ff:forcebalance-w8") ?? "";
    } catch {
      return "";
    }
  });
  const [rubric, setRubric] = useState([false, false, false]);

  const vStall = stallSpeed(mass, 9.81, RHO_AIR, area, clMax);
  const sm = staticMargin(xNp, xCg, Math.max(mac, 1e-6));
  const verdict = stabilityVerdict(sm);
  const wl = wingLoading(mass, 9.81, area);
  const cd = 0.03 + inducedDragCoeff(cl, ar, 0.8);
  const fb = forceBalance({ mass_kg: mass, g: 9.81, rho_kgm3: RHO_AIR, speed_ms: speed, wingArea_m2: area, cl, cd });
  const words = note.trim() ? note.trim().split(/\s+/).length : 0;

  const predVNum = parseFloat(predV);
  const vOk = checked && Number.isFinite(predVNum) && Math.abs(predVNum - vStall) / vStall <= 0.1;
  const sOk = checked && predS === verdict;

  useEffect(() => {
    try {
      localStorage.setItem("ff:forcebalance-w8", note);
    } catch {
      /* storage unavailable — the bench still works */
    }
  }, [note]);

  return (
    <BenchShell
      prompt="Predict the stall speed and the stability verdict for the given glider — on paper, before touching a slider. || Then set the model to match and compare: where did your prediction miss, and which input drove the miss? || Write the force balance: at your chosen cruise, does lift carry the weight, what is the margin, and what would you change?"
      note="The pre-lab uses the same lift, drag, and static-margin formulas Glider Lab evaluates — your predictions are checked against the model you will meet in the lab, not a simplified copy."
      controls={
        <>
          <Slider label="Mass" min={0.1} max={0.6} step={0.01} value={mass} display={`${fmt(mass * 1000, 0)} g`} onChange={setMass} />
          <Slider label="Wing area" min={0.02} max={0.12} step={0.005} value={area} display={`${fmt(area, 3)} m²`} onChange={setArea} />
          <Slider label="C_L max" min={0.8} max={1.4} step={0.05} value={clMax} display={fmt(clMax, 2)} onChange={setClMax} />
          <Slider label="CG from nose" min={0.15} max={0.4} step={0.005} value={xCg} display={`${fmt(xCg * 100, 1)} cm`} onChange={setXCg} />
          <Slider label="Neutral point from nose" min={0.15} max={0.45} step={0.005} value={xNp} display={`${fmt(xNp * 100, 1)} cm`} onChange={setXNp} />
          <Slider label="Mean chord" min={0.08} max={0.2} step={0.005} value={mac} display={`${fmt(mac * 100, 1)} cm`} onChange={setMac} />
          <Slider label="Cruise speed" min={4} max={16} step={0.5} value={speed} display={`${fmt(speed, 1)} m/s`} onChange={setSpeed} />
          <Slider label="Cruise C_L" min={0.2} max={1.2} step={0.05} value={cl} display={fmt(cl, 2)} onChange={setCl} />
          <Slider label="Aspect ratio" min={3} max={10} step={0.5} value={ar} display={fmt(ar, 1)} onChange={setAr} />
        </>
      }
    >
      <Readouts
        items={[
          { label: "Wing loading", value: `${fmt(wl, 1)} N/m²` },
          { label: "Stall speed", value: `${fmt(vStall, 2)} m/s` },
          { label: "Static margin", value: `${fmt(sm * 100, 1)}% — ${verdict}` },
        ]}
      />
      <div className="mt-4 rounded-lg p-3 ring-1 ring-white/15">
        <div className="mb-2 text-sm font-semibold text-well-fg">Predict first</div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-sm text-well-dim">
            Stall speed (m/s)
            <input
              type="number"
              value={predV}
              onChange={(e) => {
                setPredV(e.target.value);
                setChecked(false);
              }}
              className="ml-2 w-24 rounded bg-black/30 px-2 py-1 text-well-fg"
            />
          </label>
          <Segmented
            label="Stability"
            value={predS}
            onChange={(v) => {
              setPredS(v);
              setChecked(false);
            }}
            options={[
              { value: "unstable", label: "Unstable" },
              { value: "stable", label: "Stable" },
              { value: "overstable", label: "Overstable" },
            ]}
          />
          <WellButton onClick={() => setChecked(true)}>Check against model</WellButton>
        </div>
        {checked && (
          <p className="mt-2 text-sm text-well-dim">
            Stall speed: {vOk ? "✓ within 10% — your wing-loading arithmetic holds." : `✕ the model says ${fmt(vStall, 2)} m/s — recheck √(2(W/S)/(ρ·C_Lmax)).`}{" "}
            Stability: {sOk ? "✓ you read the margin correctly." : `✕ the model says ${verdict} (SM ${fmt(sm * 100, 1)}%) — recheck (x_NP − x_CG)/MAC.`}
          </p>
        )}
      </div>
      <div className="mt-4">
        <div className="mb-2 text-sm font-semibold text-well-fg">Force balance at cruise</div>
        <Readouts
          items={[
            { label: "Lift", value: `${fmt(fb.lift_N, 2)} N` },
            { label: "Weight", value: `${fmt(fb.weight_N, 2)} N` },
            { label: "Drag", value: `${fmt(fb.drag_N, 2)} N` },
            { label: "L / W", value: fmt(fb.liftOverWeight, 2) },
            { label: "Glide ratio L/D", value: fmt(fb.glideRatio, 1) },
            { label: "Verdict", value: fb.balanced ? "Balanced — lift carries the weight" : "Not balanced" },
          ]}
        />
        <svg viewBox="0 0 320 90" className="mt-2 h-auto w-full" aria-hidden>
          <line x1="160" y1="10" x2="160" y2="80" stroke="currentColor" strokeOpacity="0.25" />
          <Arrow x1={160} y1={45} x2={160} y2={45 - Math.min(30, fb.lift_N * 12)} opacity={1} />
          <Arrow x1={160} y1={45} x2={160} y2={45 + Math.min(30, fb.weight_N * 12)} opacity={0.55} />
          <Arrow x1={160} y1={45} x2={160 - Math.min(60, fb.drag_N * 30)} y2={45} opacity={0.55} />
        </svg>
        <p className="mt-1 text-sm text-well-dim">
          Bright arrow up is lift, pale arrow down is weight, pale arrow left is drag — all drawn from the same
          point, the way a free-body diagram demands. {fb.balanced ? "They balance: this is steady glide." : "Lift does not carry the weight here — fly faster, raise the angle of attack, or lighten the glider."}
        </p>
      </div>
      <div className="mt-4">
        <div className="mb-2 text-sm font-semibold text-well-fg">Write the force balance ({words} words)</div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          placeholder="At my chosen cruise… lift is … N against … N of weight. The static margin is …%, so the glider is …. To fix the imbalance I would …"
          className="w-full rounded-lg bg-black/30 p-2 text-sm text-well-fg ring-1 ring-white/15"
        />
        <div className="mt-2 space-y-1 text-sm text-well-dim">
          {[
            "States the stall speed and what it forbids",
            "States the stability verdict with the margin that produced it",
            "Names one concrete change if the balance fails",
          ].map((label, i) => (
            <label key={label} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={rubric[i]}
                onChange={() => setRubric((r) => r.map((v, j) => (j === i ? !v : v)))}
              />
              {label}
            </label>
          ))}
        </div>
      </div>
    </BenchShell>
  );
}

export function ShmBench() {
  const [m, setM] = useState(0.5);
  const [k, setK] = useState(20);
  const [A, setA] = useState(0.1);
  const [phase, setPhase] = useState(0);
  const [running, setRunning] = useState(true);
  const reduce = useReducedMotion();

  const omega = shmOmega(k, m);
  const f = shmFrequency(k, m);
  const T = shmPeriod(k, m);
  const E = shmEnergy(k, A);

  useTicker(running && !reduce, (dt) => setPhase((p) => p + omega * dt));

  const x = reduce ? A : A * Math.cos(phase);
  const ke = shmKinetic(k, A, x);
  const pe = shmPotential(k, x);
  const keFrac = E > 0 ? Math.max(0, Math.min(1, ke / E)) : 0;
  const peFrac = E > 0 ? Math.max(0, Math.min(1, pe / E)) : 0;

  // Vertical spring-mass drawing: anchor at top, mass hangs below.
  const cx = 160;
  const anchorY = 24;
  const restLen = 110;
  const pxPerM = 350;
  const springEnd = anchorY + restLen + x * pxPerM;
  const massTop = springEnd + 6;
  const massH = 36;
  const coils = 8;
  let pts = `${cx},${anchorY} ${cx},${anchorY + 10}`;
  for (let i = 0; i <= coils; i++) {
    const yy = anchorY + 10 + ((springEnd - 10 - anchorY) * i) / coils;
    const xx = i === 0 || i === coils ? cx : cx + (i % 2 === 0 ? 14 : -14);
    pts += ` ${xx},${yy.toFixed(1)}`;
  }

  return (
    <BenchShell
      prompt="Set the mass and stiffness, pick a release amplitude, and watch the spring. || Read ω, f, and T from the bench and confirm them against √(k/m) by hand. || Then track one full cycle and write down where the kinetic energy peaks and where the potential does — the bench's energy bars are the evidence."
      note="The bench's clock is real seconds, so the period you read is the period you computed. If motion is reduced on your device, the oscillator holds still at full stretch and the readouts carry the lesson."
      controls={
        <>
          <Slider label="Mass" min={0.1} max={2} step={0.05} value={m} display={`${fmt(m, 2)} kg`} onChange={setM} />
          <Slider label="Stiffness" min={5} max={80} step={1} value={k} display={`${fmt(k, 0)} N/m`} onChange={setK} />
          <Slider label="Release amplitude" min={0.02} max={0.3} step={0.01} value={A} display={`${fmt(A * 100, 1)} cm`} onChange={setA} />
          <div className="flex items-end sm:col-span-1">
            <WellButton onClick={() => setRunning((r) => !r)}>{reduce ? "Held still" : running ? "Pause" : "Run"}</WellButton>
          </div>
        </>
      }
    >
      <Readouts
        items={[
          { label: "ω = √(k/m)", value: `${fmt(omega, 2)} rad/s` },
          { label: "Frequency", value: `${fmt(f, 2)} Hz` },
          { label: "Period", value: `${fmt(T, 2)} s` },
          { label: "Total energy", value: `${fmt(E, 3)} J` },
        ]}
      />
      <svg viewBox="0 0 320 300" className="h-auto w-full" aria-hidden>
        <line x1={cx - 40} y1={anchorY} x2={cx + 40} y2={anchorY} stroke="currentColor" strokeWidth="3" />
        <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="2" />
        <rect x={cx - 32} y={massTop} width="64" height={massH} rx="6" fill="currentColor" opacity="0.85" />
        <line x1={cx - 56} y1={anchorY + restLen} x2={cx + 56} y2={anchorY + restLen} stroke="currentColor" strokeOpacity="0.3" strokeDasharray="4 3" />
      </svg>
      <p className="mt-1 text-sm text-well-dim">The dashed line is the equilibrium position. Displacement now: {fmt(x * 100, 1)} cm.</p>
      <div className="mt-3 space-y-2">
        <div>
          <div className="mb-1 flex justify-between text-sm">
            <span>Kinetic</span>
            <span className="text-well-dim">{fmt(ke, 3)} J</span>
          </div>
          <div className="h-2 overflow-hidden rounded bg-white/10">
            <div className="h-full rounded bg-well-fg transition-[width] duration-75" style={{ width: `${(keFrac * 100).toFixed(1)}%` }} />
          </div>
        </div>
        <div>
          <div className="mb-1 flex justify-between text-sm">
            <span>Potential</span>
            <span className="text-well-dim">{fmt(pe, 3)} J</span>
          </div>
          <div className="h-2 overflow-hidden rounded bg-white/10">
            <div className="h-full rounded bg-well-fg opacity-50 transition-[width] duration-75" style={{ width: `${(peFrac * 100).toFixed(1)}%` }} />
          </div>
        </div>
      </div>
      <p className="mt-2 text-sm text-well-dim">
        The bars always sum to the total: energy pours between motion and stretch, and the total sits still. Kinetic peaks as the mass crosses equilibrium; potential peaks at the turnarounds.
      </p>
    </BenchShell>
  );
}

export function ResonanceSweepBench() {
  const [zeta, setZeta] = useState(0.05);
  const [r, setR] = useState(1);
  const [peakEntry, setPeakEntry] = useState("");
  const [heightEntry, setHeightEntry] = useState("");
  const [verdict, setVerdict] = useState<string | null>(null);

  const rStar = resonantRatio(zeta);
  const Q = qualityFactor(zeta);
  const peakM = magnification(rStar, zeta);
  const nowM = magnification(r, zeta);

  // Response curve, auto-scaled so the peak stays on the page.
  const yMax = peakM * 1.12;
  const W = 320;
  const H = 180;
  const padL = 10;
  const padB = 15;
  const px = (rr: number) => padL + (rr / 2) * (W - padL * 2);
  const py = (mm: number) => H - padB - (mm / yMax) * (H - padB - 12);
  let d = "";
  const N = 140;
  for (let i = 0; i <= N; i++) {
    const rr = 0.02 + ((2 - 0.02) * i) / N;
    d += `${i === 0 ? "M" : "L"}${px(rr).toFixed(1)},${py(magnification(rr, zeta)).toFixed(1)} `;
  }
  const dotX = px(r);
  const dotY = py(nowM);

  const check = () => {
    const p = parseFloat(peakEntry);
    const h = parseFloat(heightEntry);
    if (!Number.isFinite(p) || !Number.isFinite(h)) {
      setVerdict("Enter both numbers first — the ratio where the peak sits and its height.");
      return;
    }
    const pOk = Math.abs(p - rStar) <= 0.05;
    const hOk = Math.abs(h - peakM) / peakM <= 0.1;
    if (pOk && hOk) {
      setVerdict(`Accepted: peak at r ≈ ${fmt(rStar, 3)} with height ≈ ${fmt(peakM, 1)} (Q = ${fmt(Q, 1)}). That is the investigation — damping alone set that ceiling.`);
    } else {
      const miss = [
        pOk ? null : `peak ratio (true ≈ ${fmt(rStar, 3)})`,
        hOk ? null : `peak height (true ≈ ${fmt(peakM, 1)})`,
      ]
        .filter(Boolean)
        .join(" and ");
      setVerdict(`Not yet — recheck the ${miss}. Sweep r slowly through 1 and watch the dot climb.`);
    }
  };

  return (
    <BenchShell
      prompt="Sweep the drive ratio r through 1 and record where the amplitude peaks and how high it gets. || Compare the peak's location to r* = √(1−2ζ²) and its height to Q = 1/(2ζ). || Then double the damping and sweep again: the investigation is the record of what the peak did."
      note="The curve is the exact steady-state response, not a noisy simulation — the peak you find is the peak the formula predicts. The vertical axis auto-scales to the peak, so compare heights via the readouts, not the picture. The two checked entries are the evidence for the resonance investigation."
      controls={
        <>
          <Slider label="Drive ratio r = ω/ωₙ" min={0.02} max={2} step={0.01} value={r} display={fmt(r, 2)} onChange={setR} />
          <Slider label="Damping ratio ζ" min={0.01} max={0.3} step={0.005} value={zeta} display={fmt(zeta, 3)} onChange={setZeta} />
        </>
      }
    >
      <Readouts
        items={[
          { label: "Magnification at r", value: fmt(nowM, 2) },
          { label: "Predicted peak r*", value: fmt(rStar, 3) },
          { label: "Predicted peak height Q", value: fmt(Q, 1) },
          { label: "Vertical scale", value: `0–${fmt(yMax, 1)}` },
        ]}
      />
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" aria-hidden>
        <line x1={padL} y1={H - padB} x2={W - padL} y2={H - padB} stroke="currentColor" strokeOpacity="0.25" />
        <line x1={px(1)} y1={8} x2={px(1)} y2={H - padB} stroke="currentColor" strokeOpacity="0.35" strokeDasharray="4 3" />
        <path d={d} fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx={dotX} cy={dotY} r="5" fill="currentColor" />
        <circle cx={px(rStar)} cy={py(peakM)} r="4" fill="none" stroke="currentColor" strokeOpacity="0.6" strokeDasharray="2 2" />
      </svg>
      <p className="mt-1 text-sm text-well-dim">
        The dashed ring marks the predicted peak. The dashed vertical line is r = 1, the natural frequency. Drag r across it and watch the dot — off-resonance the response falls back toward the static deflection.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block text-well-dim">Peak ratio r* you found</span>
          <input
            type="number"
            step="0.01"
            value={peakEntry}
            onChange={(e) => setPeakEntry(e.target.value)}
            className="w-full rounded-lg bg-white/10 px-3 py-2 text-well-fg outline-none ring-1 ring-white/25 focus:ring-2"
            placeholder="e.g. 1.00"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-well-dim">Peak height you found</span>
          <input
            type="number"
            step="0.1"
            value={heightEntry}
            onChange={(e) => setHeightEntry(e.target.value)}
            className="w-full rounded-lg bg-white/10 px-3 py-2 text-well-fg outline-none ring-1 ring-white/25 focus:ring-2"
            placeholder="e.g. 10.0"
          />
        </label>
      </div>
      <div className="mt-2">
        <WellButton onClick={check}>Check the investigation</WellButton>
      </div>
      {verdict && <p className="mt-2 text-sm text-well-fg">{verdict}</p>}
    </BenchShell>
  );
}

type StressQuestion = {
  id: string;
  text: string;
  unit: string;
  answer: number;
  tol: number;
};

const STRESS_SET: StressQuestion[] = [
  {
    id: "q1",
    text: "A 25 m steel rail warms 35 °C. How far would it freely expand?",
    unit: "mm",
    answer: 10.5,
    tol: 0.03,
  },
  {
    id: "q2",
    text: "An aluminum pipe is fully constrained and cools 30 °C. What is the magnitude of the thermal stress?",
    unit: "MPa",
    answer: 48.3,
    tol: 0.03,
  },
  {
    id: "q3",
    text: "A 2 m copper bar warms 60 °C with room to expand. What gap must the joint provide?",
    unit: "mm",
    answer: 2.04,
    tol: 0.03,
  },
];

export function ThermalStressBench() {
  const [matIdx, setMatIdx] = useState(0);
  const [L, setL] = useState(10);
  const [dT, setDT] = useState(40);
  const [mode, setMode] = useState<"free" | "constrained">("free");
  const [entries, setEntries] = useState<Record<string, string>>({});
  const [graded, setGraded] = useState<Record<string, boolean>>({});

  const mat = THERMAL_MATERIALS[matIdx];
  const dL = thermalExpansion(L, mat.alpha, dT); // m, signed
  const gap = jointGap(L, mat.alpha, dT); // m
  const sigma = thermalStress(mat.E, mat.alpha, dT); // Pa, tensile-positive
  const sigmaMPa = sigma / 1e6;
  const dirName = sigma < 0 ? "compression" : sigma > 0 ? "tension" : "none";
  const pctYield = mat.yieldPa > 0 ? (Math.abs(sigma) / mat.yieldPa) * 100 : 0;
  const verdict =
    pctYield >= 100
      ? "At or past yield — this swing would permanently deform the part."
      : pctYield >= 50
        ? "Over half the yield strength, spent on weather alone. Reconsider the constraint."
        : pctYield >= 10
          ? "A noticeable bite of the margin. Size the joint or accept the stress deliberately."
          : "Small against yield — but the gap still has to go somewhere.";

  const grade = (q: StressQuestion) => {
    const v = parseFloat(entries[q.id] ?? "");
    setGraded((g) => ({ ...g, [q.id]: Number.isFinite(v) && Math.abs(v - q.answer) / q.answer <= q.tol }));
  };
  const done = STRESS_SET.filter((q) => graded[q.id]).length;

  return (
    <BenchShell
      prompt="Pick a material and a temperature swing, then decide: free or constrained? || Read the free expansion and size the joint gap; switch to constrained and read the stress as a fraction of yield. || Then complete the three-question stress set — the set is the evidence, and every answer is checked against the formulas above."
      note="Yield strengths are representative classroom values, not datasheet guarantees — the point is the comparison, not the catalogue. Compression is negative by the tensile-positive convention; the bench reports the magnitude with the direction named."
      controls={
        <>
          <Segmented
            label="Material"
            value={String(matIdx)}
            onChange={(v) => setMatIdx(parseInt(v, 10))}
            options={THERMAL_MATERIALS.map((mm, i) => ({ value: String(i), label: mm.name }))}
          />
          <Slider label="Length" min={1} max={50} step={1} value={L} display={`${fmt(L, 0)} m`} onChange={setL} />
          <Slider label="Temperature change" min={-50} max={80} step={1} value={dT} display={`${dT >= 0 ? "+" : ""}${dT} °C`} onChange={setDT} />
          <Segmented
            label="Ends"
            value={mode}
            onChange={setMode}
            options={[
              { value: "free", label: "Free to expand" },
              { value: "constrained", label: "Constrained" },
            ]}
          />
        </>
      }
    >
      <Readouts
        items={[
          { label: "Free expansion ΔL", value: `${fmt(dL * 1000, 2)} mm` },
          { label: "Joint gap needed", value: `${fmt(gap * 1000, 2)} mm` },
          {
            label: "Thermal stress",
            value: mode === "constrained" ? `${fmt(Math.abs(sigmaMPa), 1)} MPa ${dirName}` : "— (free)",
          },
          {
            label: "% of yield",
            value: mode === "constrained" ? `${fmt(pctYield, 1)}%` : "—",
          },
        ]}
      />
      {mode === "constrained" && <p className="mt-2 text-sm text-well-fg">{verdict}</p>}
      {mode === "free" && (
        <p className="mt-2 text-sm text-well-dim">
          Free means the {fmt(Math.abs(dL * 1000), 2)} mm has somewhere to go — a joint, a bend, a bellows. Take that away and it becomes stress instead.
        </p>
      )}
      <h4 className="mt-4 text-sm font-semibold text-well-fg">Thermal stress set — {done}/3</h4>
      <div className="mt-2 space-y-3">
        {STRESS_SET.map((q) => {
          const ok = graded[q.id] === true;
          const tried = graded[q.id] !== undefined;
          return (
            <div key={q.id} className="rounded-lg p-3 ring-1 ring-white/15">
              <p className="text-sm">{q.text}</p>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="number"
                  step="any"
                  value={entries[q.id] ?? ""}
                  onChange={(e) => setEntries((en) => ({ ...en, [q.id]: e.target.value }))}
                  className="w-32 rounded-lg bg-white/10 px-3 py-2 text-sm text-well-fg outline-none ring-1 ring-white/25 focus:ring-2"
                  placeholder="value"
                  aria-label={q.text}
                />
                <span className="text-sm text-well-dim">{q.unit}</span>
                <WellButton onClick={() => grade(q)}>Check</WellButton>
                {tried &&
                  (ok ? (
                    <span className="text-sm text-well-fg">Correct.</span>
                  ) : (
                    <span className="text-sm text-well-dim">Not quite — recompute with ΔL = αL₀ΔT or σ = EαΔT.</span>
                  ))}
              </div>
            </div>
          );
        })}
      </div>
      {done === 3 && (
        <p className="mt-2 text-sm text-well-fg">
          Set complete. The pattern to keep: millimeters of movement become megapascals of stress the moment the movement is forbidden.
        </p>
      )}
    </BenchShell>
  );
}

// ---------------------------------------------------------------------------
// Week 10 — Physics synthesis (scout/physics-w10)
// ---------------------------------------------------------------------------

const inputCls =
  "w-full rounded-lg bg-white/5 px-3 py-2 text-sm text-well-fg ring-1 ring-white/25 placeholder:text-well-dim/60";

type LedgerStatus = "assumed" | "derived" | "measured";
type LedgerRow = {
  id: number;
  assumption: string;
  status: LedgerStatus;
  breaksIf: string;
  limitTest: string;
};
type LedgerScenario = "glider" | "beam" | "pipe";

const LEDGER_SCENARIOS: Record<LedgerScenario, { title: string; brief: string }> = {
  glider: {
    title: "Glider range",
    brief: "Predict the reference glider's range from a 30 m release in still air.",
  },
  beam: {
    title: "Beam deflection",
    brief: "Predict a balsa cantilever's tip deflection under a 40 N tip load.",
  },
  pipe: {
    title: "Frozen pipe",
    brief: "Predict whether a water-filled copper pipe bursts when it freezes.",
  },
};

const LEDGER_STORE = "ff:ledger-w10";

function seedLedgerRows(s: LedgerScenario): LedgerRow[] {
  if (s === "glider")
    return [
      {
        id: 1,
        assumption: "Still air — no wind, gusts, or turbulence",
        status: "assumed",
        breaksIf: "A headwind shortens the range directly; gusts break the steady-glide balance",
        limitTest: "Wind → 0 must recover the still-air range",
      },
      {
        id: 2,
        assumption: "Parasite drag cd0 = 0.030",
        status: "assumed",
        breaksIf: "Rough surfaces or protrusions raise CD and collapse L/D",
        limitTest: "cd0 → 0 gives the induced-drag-only L/D ≈ 46 — absurd, which is why cd0 matters",
      },
      {
        id: 3,
        assumption: "The wing holds its 4° trim all the way down",
        status: "assumed",
        breaksIf: "A gust or mistrim moves CL off the polar point used",
        limitTest: "α → 12° (stall) must show L/D collapsing",
      },
    ];
  if (s === "beam")
    return [
      {
        id: 1,
        assumption: "Small deflections — the linear regime holds",
        status: "assumed",
        breaksIf: "Large sag invalidates δ = FL³/3EI",
        limitTest: "F → 0 must give δ → 0, linearly",
      },
      {
        id: 2,
        assumption: "E is the handbook value for balsa",
        status: "assumed",
        breaksIf: "A particular stick can be far off the book value",
        limitTest: "E → ∞ must drive δ → 0",
      },
    ];
  return [
    {
      id: 1,
      assumption: "Ice expands against a fully constrained pipe",
      status: "assumed",
      breaksIf: "An open faucet relieves the pressure — no burst",
      limitTest: "An open end must give zero burst pressure",
    },
    {
      id: 2,
      assumption: "Copper yields before it bursts",
      status: "derived",
      breaksIf: "Cold embrittlement changes the failure mode",
      limitTest: "Wall → thick must drive hoop stress below yield",
    },
  ];
}

type LedgerState = {
  scenario: LedgerScenario;
  rows: Record<LedgerScenario, LedgerRow[]>;
  suspectId: number | null;
  suspectNote: string;
};

function loadLedger(): LedgerState {
  const fallback: LedgerState = {
    scenario: "glider",
    rows: {
      glider: seedLedgerRows("glider"),
      beam: seedLedgerRows("beam"),
      pipe: seedLedgerRows("pipe"),
    },
    suspectId: null,
    suspectNote: "",
  };
  try {
    const raw = localStorage.getItem(LEDGER_STORE);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<LedgerState>;
    if (!parsed.rows || !parsed.scenario || !LEDGER_SCENARIOS[parsed.scenario]) return fallback;
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}

export function SynthLedgerBench() {
  const [state, setState] = useState<LedgerState>(loadLedger);
  useEffect(() => {
    try {
      localStorage.setItem(LEDGER_STORE, JSON.stringify(state));
    } catch {
      /* private mode — the ledger simply won't persist */
    }
  }, [state ]);

  const rows = state.rows[state.scenario];
  const patchRow = (id: number, patch: Partial<LedgerRow>) =>
    setState((s) => ({
      ...s,
      rows: { ...s.rows, [s.scenario]: s.rows[s.scenario].map((r) => (r.id === id ? { ...r, ...patch } : r)) },
    }));
  const addRow = () =>
    setState((s) => {
      const cur = s.rows[s.scenario];
      const nextId = cur.reduce((m, r) => Math.max(m, r.id), 0) + 1;
      return {
        ...s,
        rows: { ...s.rows, [s.scenario]: [...cur, { id: nextId, assumption: "", status: "assumed", breaksIf: "", limitTest: "" }] },
      };
    });
  const removeRow = (id: number) =>
    setState((s) => ({
      ...s,
      suspectId: s.suspectId === id ? null : s.suspectId,
      rows: { ...s.rows, [s.scenario]: s.rows[s.scenario].filter((r) => r.id !== id) },
    }));

  const complete = rows.filter((r) => r.assumption.trim() && r.breaksIf.trim() && r.limitTest.trim()).length;
  const untested = rows.filter((r) => r.status === "assumed").length;

  return (
    <BenchShell
      prompt="Pick a scenario and build its assumption ledger: each assumption, whether it is assumed, derived, or measured, what breaks if it is false, and which limiting case would expose it. || Name the assumption most likely to be wrong — that name is the most valuable line on the page."
      note="A ledger is never finished, only audited. Revisit it after every disagreement between prediction and reality: the culprit is usually already listed."
      controls={
        <Segmented
          label="Scenario"
          value={state.scenario}
          onChange={(v) => setState((s) => ({ ...s, scenario: v, suspectId: null }))}
          options={(Object.keys(LEDGER_SCENARIOS) as LedgerScenario[]).map((v) => ({
            value: v,
            label: LEDGER_SCENARIOS[v].title,
          }))}
        />
      }
    >
      <p className="text-sm text-well-dim">{LEDGER_SCENARIOS[state.scenario].brief}</p>
      <Readouts
        items={[
          { label: "Ledger completeness", value: rows.length ? `${Math.round((100 * complete) / rows.length)}%` : "—" },
          { label: "Untested assumptions", value: `${untested}` },
        ]}
      />
      <div className="mt-4 flex flex-col gap-3">
        {rows.map((row) => (
          <div key={row.id} className="rounded-lg ring-1 ring-white/15 p-3">
            <div className="flex items-start gap-2">
              <input
                className={inputCls}
                placeholder="Assumption — e.g. still air, no gusts"
                value={row.assumption}
                onChange={(e) => patchRow(row.id, { assumption: e.target.value })}
                aria-label="Assumption"
              />
              <button
                type="button"
                onClick={() => removeRow(row.id)}
                className="shrink-0 rounded-lg px-2 py-2 text-sm text-well-dim ring-1 ring-white/25"
                aria-label="Remove assumption"
              >
                ×
              </button>
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              <div className="flex gap-1" role="radiogroup" aria-label="Evidence status">
                {(["assumed", "derived", "measured"] as LedgerStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    role="radio"
                    aria-checked={row.status === st}
                    onClick={() => patchRow(row.id, { status: st })}
                    className={
                      "min-h-9 flex-1 rounded-lg px-2 py-1 text-xs " +
                      (row.status === st ? "bg-well-fg text-well" : "text-well-fg ring-1 ring-white/25")
                    }
                  >
                    {st}
                  </button>
                ))}
              </div>
              <input
                className={inputCls}
                placeholder="Breaks if…"
                value={row.breaksIf}
                onChange={(e) => patchRow(row.id, { breaksIf: e.target.value })}
                aria-label="What breaks if false"
              />
              <input
                className={inputCls}
                placeholder="Limit that exposes it…"
                value={row.limitTest}
                onChange={(e) => patchRow(row.id, { limitTest: e.target.value })}
                aria-label="Limiting case"
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3">
        <WellButton onClick={addRow}>Add assumption</WellButton>
      </div>
      <div className="mt-4">
        <div className="mb-2 text-sm text-well-dim">Most likely to be wrong</div>
        <div className="grid gap-2 sm:grid-cols-2">
          <select
            className={inputCls}
            value={state.suspectId ?? ""}
            onChange={(e) =>
              setState((s) => ({ ...s, suspectId: e.target.value ? Number(e.target.value) : null }))
            }
            aria-label="Most likely wrong assumption"
          >
            <option value="">Pick one…</option>
            {rows
              .filter((r) => r.assumption.trim())
              .map((r) => (
                <option key={r.id} value={r.id}>
                  {r.assumption.slice(0, 60)}
                </option>
              ))}
          </select>
          <input
            className={inputCls}
            placeholder="Why this one? One sentence."
            value={state.suspectNote}
            onChange={(e) => setState((s) => ({ ...s, suspectNote: e.target.value }))}
            aria-label="Why this assumption is most likely wrong"
          />
        </div>
        {untested > 0 && (
          <p className="mt-2 text-sm text-well-dim">
            {untested} assumption{untested === 1 ? " is" : "s are"} still marked assumed — those are the entries an
            autopsy will read first.
          </p>
        )}
      </div>
    </BenchShell>
  );
}

// ---------------------------------------------------------------------------

const GLIDERLAB_STORE = "ff:gliderlab-w10";

const AUTOPSY_SUSPECTS = [
  { value: "parasite", label: "The cd0 = 0.030 estimate — a guess wearing a number's clothes" },
  { value: "wind", label: "Still air — any real field has wind and gusts" },
  { value: "rigid", label: "Rigid wing — balsa flexes under load" },
  { value: "transient", label: "Instant trim — the model skips the 2.4 m speed-buy transient" },
  { value: "tips", label: "2D polar plus an Oswald factor — real tips shed real vortices" },
  { value: "density", label: "Constant air density — over 30 m this one is nearly innocent" },
];

type GliderLabState = {
  predictions: { trim: string; margin: string; range: string } | null;
  suspect: string;
  note: string;
  filed: boolean;
};

function loadGliderLab(): GliderLabState {
  const fallback: GliderLabState = { predictions: null, suspect: "", note: "", filed: false };
  try {
    const raw = localStorage.getItem(GLIDERLAB_STORE);
    if (!raw) return fallback;
    return { ...fallback, ...(JSON.parse(raw) as Partial<GliderLabState>) };
  } catch {
    return fallback;
  }
}

export function GliderLabBench() {
  const [state, setState] = useState<GliderLabState>(loadGliderLab);
  const [draft, setDraft] = useState({ trim: "", margin: "", range: "" });
  const [draftError, setDraftError] = useState("");
  useEffect(() => {
    try {
      localStorage.setItem(GLIDERLAB_STORE, JSON.stringify(state));
    } catch {
      /* private mode */
    }
  }, [state]);

  const model = referenceGliderSynthesis();
  const locked = state.predictions !== null;

  const lock = () => {
    const nums = [draft.trim, draft.margin, draft.range].map(Number);
    if (nums.some((n) => !Number.isFinite(n) || draft.trim.trim() === "")) {
      setDraftError("Enter a number for all three predictions before locking.");
      return;
    }
    setDraftError("");
    setState((s) => ({ ...s, predictions: { ...draft } }));
  };
  const reset = () =>
    setState((s) => ({ ...s, predictions: null, suspect: "", note: "", filed: false }));

  const rows = locked
    ? [
        { label: "Trim speed", unit: "m/s", pred: Number(state.predictions!.trim), actual: model.trimSpeedMs },
        { label: "Static margin", unit: "% chord", pred: Number(state.predictions!.margin), actual: model.marginPct },
        { label: "Glide range", unit: "m", pred: Number(state.predictions!.range), actual: model.rangeM },
      ]
    : [];

  return (
    <BenchShell
      prompt="Predict the reference glider's trim speed, static margin, and glide range from a 30 m release — then lock the predictions. || Run the model, read your deltas, and file the disagreement autopsy: which model omission most likely owns your largest error."
      note="The model is the forge glider's own reduced-order analysis: finite-wing lift slope, parasite plus induced drag, steady-glide force balance. It omits gusts, wing flex, tip-vortex detail, Reynolds effects, and the trim transient — the autopsy list."
      controls={
        locked ? (
          <div className="sm:col-span-2">
            <WellButton onClick={reset}>Unlock and re-predict</WellButton>
          </div>
        ) : (
          <>
            <label className="flex min-w-0 flex-col">
              <span className="text-sm text-well-dim">Trim speed (m/s)</span>
              <input
                className={inputCls}
                inputMode="decimal"
                value={draft.trim}
                onChange={(e) => setDraft((d) => ({ ...d, trim: e.target.value }))}
                placeholder="e.g. 9"
              />
            </label>
            <label className="flex min-w-0 flex-col">
              <span className="text-sm text-well-dim">Static margin (% chord)</span>
              <input
                className={inputCls}
                inputMode="decimal"
                value={draft.margin}
                onChange={(e) => setDraft((d) => ({ ...d, margin: e.target.value }))}
                placeholder="e.g. 12"
              />
            </label>
            <label className="flex min-w-0 flex-col">
              <span className="text-sm text-well-dim">Glide range from 30 m (m)</span>
              <input
                className={inputCls}
                inputMode="decimal"
                value={draft.range}
                onChange={(e) => setDraft((d) => ({ ...d, range: e.target.value }))}
                placeholder="e.g. 200"
              />
            </label>
            <div className="flex items-end">
              <WellButton onClick={lock}>Lock predictions</WellButton>
            </div>
          </>
        )
      }
    >
      {!locked && (
        <>
          <p className="text-sm text-well-dim">
            Reference glider: 0.10 kg, wing 500 × 90 mm, balsa, 4° trim, CG 120 mm from the nose, released at 8 m/s
            from 30 m. Commit to numbers — the model runs only after you lock.
          </p>
          {draftError && <p className="mt-2 text-sm text-well-dim">{draftError}</p>}
        </>
      )}
      {locked && (
        <>
          <Readouts
            items={rows.map((r) => ({
              label: r.label,
              value: `you ${fmt(r.pred, 1)} ${r.unit} · model ${fmt(r.actual, 1)} ${r.unit} · Δ ${fmt(
                (100 * Math.abs(r.pred - r.actual)) / r.actual,
                0,
              )}%`,
            }))}
          />
          <div className="mt-4">
            <div className="mb-2 text-sm text-well-dim">
              Disagreement autopsy — which omission most likely owns your largest error?
            </div>
            <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Autopsy suspect">
              {AUTOPSY_SUSPECTS.map((s) => {
                const on = state.suspect === s.value;
                return (
                  <button
                    key={s.value}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    disabled={state.filed}
                    onClick={() => setState((st) => ({ ...st, suspect: s.value }))}
                    className={
                      "min-h-11 rounded-lg px-3 py-2 text-left text-sm " +
                      (on ? "bg-well-fg text-well" : "text-well-fg ring-1 ring-white/25") +
                      (state.filed ? " opacity-60" : "")
                    }
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
            <textarea
              className={inputCls + " mt-2 min-h-20"}
              placeholder="One sentence: why does this omission explain the gap?"
              value={state.note}
              disabled={state.filed}
              onChange={(e) => setState((s) => ({ ...s, note: e.target.value }))}
              aria-label="Autopsy explanation"
            />
            <div className="mt-2">
              {state.filed ? (
                <p className="text-sm text-well-dim">Autopsy filed. Glider Lab I evidence: predictions + autopsy.</p>
              ) : (
                <WellButton
                  onClick={() => {
                    if (state.suspect && state.note.trim()) setState((s) => ({ ...s, filed: true }));
                  }}
                >
                  File autopsy
                </WellButton>
              )}
            </div>
          </div>
        </>
      )}
    </BenchShell>
  );
}

// ---------------------------------------------------------------------------

const MASTERY_STORE = "ff:mastery-w10";

type MasteryPhase = "intro" | "running" | "results";
type MasteryState = {
  phase: MasteryPhase;
  answers: (number | null)[];
  corrections: Record<string, string>;
};

function loadMastery(): MasteryState {
  const fallback: MasteryState = {
    phase: "intro",
    answers: MASTERY_BANK.map(() => null),
    corrections: {},
  };
  try {
    const raw = localStorage.getItem(MASTERY_STORE);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<MasteryState>;
    const answers = Array.isArray(parsed.answers) ? parsed.answers : fallback.answers;
    return {
      phase: parsed.phase === "running" || parsed.phase === "results" ? parsed.phase : "intro",
      answers: MASTERY_BANK.map((_, i) => (typeof answers[i] === "number" ? answers[i] : null)),
      corrections: typeof parsed.corrections === "object" && parsed.corrections !== null ? parsed.corrections : {},
    };
  } catch {
    return fallback;
  }
}

const TOPIC_LABEL: Record<MasteryItem["topic"], string> = {
  conservation: "Conservation",
  fbd: "Free-body diagram",
  mixed: "Mixed",
};

export function MasteryBench() {
  const [state, setState] = useState<MasteryState>(loadMastery);
  const [qIndex, setQIndex] = useState(0);
  useEffect(() => {
    try {
      localStorage.setItem(MASTERY_STORE, JSON.stringify(state));
    } catch {
      /* private mode */
    }
  }, [state]);

  const setAnswer = (qi: number, opt: number) =>
    setState((s) => ({ ...s, answers: s.answers.map((a, i) => (i === qi ? opt : a)) }));

  const correct = state.answers.filter((a, i) => a === MASTERY_BANK[i].answer).length;
  const pct = masteryPct(correct, MASTERY_BANK.length);
  const passed = masteryPass(correct, MASTERY_BANK.length);
  const missed = MASTERY_BANK.filter((item, i) => state.answers[i] !== item.answer);
  const required = correctionsRequired(missed);
  const filedCount = required.filter((m) => (state.corrections[m.id] ?? "").trim().length > 0).length;
  const gateOpen = passed && filedCount === required.length;

  const start = () =>
    setState((s) => ({ ...s, phase: "running", answers: MASTERY_BANK.map(() => null) }));
  const retake = () => {
    setQIndex(0);
    setState((s) => ({ ...s, phase: "running", answers: MASTERY_BANK.map(() => null) }));
  };

  return (
    <BenchShell
      prompt="Sit the check: twelve questions, one sitting, closed book — four conservation, four free-body diagrams, four mixed. || 70% clears the score gate; then file a corrected solution for every missed conservation or FBD item. The gate opens on score plus repairs."
      note="Closed book means derive, don't recall. Your answers, score, and filed corrections persist in this browser; the gate state is always visible."
      controls={
        state.phase === "intro" ? (
          <div className="sm:col-span-2">
            <WellButton onClick={start}>Start the check</WellButton>
          </div>
        ) : state.phase === "running" ? (
          <div className="sm:col-span-2 flex flex-wrap gap-2">
            <WellButton onClick={() => setQIndex((i) => Math.max(0, i - 1))}>Previous</WellButton>
            {qIndex < MASTERY_BANK.length - 1 ? (
              <WellButton onClick={() => setQIndex((i) => Math.min(MASTERY_BANK.length - 1, i + 1))}>
                Next
              </WellButton>
            ) : (
              <WellButton
                onClick={() => {
                  if (state.answers.every((a) => a !== null)) setState((s) => ({ ...s, phase: "results" }));
                }}
              >
                Score the check
              </WellButton>
            )}
          </div>
        ) : (
          <div className="sm:col-span-2 flex flex-wrap gap-2">
            <WellButton onClick={retake}>Retake the check</WellButton>
          </div>
        )
      }
    >
      {state.phase === "intro" && (
        <div className="text-sm leading-relaxed text-well-dim">
          <p>
            Twelve items, one sitting, no references. The bank is weighted on purpose: conservation laws and
            free-body diagrams are the load-bearing skills of the whole course.
          </p>
          <Readouts
            items={[
              { label: "Questions", value: "12" },
              { label: "Gate", value: "≥ 70% (9 of 12)" },
              { label: "Corrections", value: "every missed conservation / FBD item" },
            ]}
          />
        </div>
      )}
      {state.phase === "running" && (
        <div>
          <p className="text-sm text-well-dim">
            Question {qIndex + 1} of {MASTERY_BANK.length} · {TOPIC_LABEL[MASTERY_BANK[qIndex].topic]}
          </p>
          <p className="mt-2 text-lg text-well-fg">{MASTERY_BANK[qIndex].prompt}</p>
          <div className="mt-3 grid gap-2" role="radiogroup" aria-label="Answer options">
            {MASTERY_BANK[qIndex].options.map((opt, oi) => {
              const on = state.answers[qIndex] === oi;
              return (
                <button
                  key={oi}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setAnswer(qIndex, oi)}
                  className={
                    "min-h-11 rounded-lg px-3 py-2 text-left text-sm " +
                    (on ? "bg-well-fg text-well" : "text-well-fg ring-1 ring-white/25")
                  }
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {qIndex === MASTERY_BANK.length - 1 && !state.answers.every((a) => a !== null) && (
            <p className="mt-2 text-sm text-well-dim">
              Answer all twelve to score — unanswered items count as missed.
            </p>
          )}
        </div>
      )}
      {state.phase === "results" && (
        <div>
          <Readouts
            items={[
              { label: "Score", value: `${correct} / ${MASTERY_BANK.length} (${fmt(pct, 1)}%)` },
              { label: "Score gate", value: passed ? "cleared ≥ 70%" : "below 70% — retake" },
              { label: "Corrections filed", value: `${filedCount} / ${required.length}` },
            ]}
          />
          {gateOpen ? (
            <p className="mt-3 rounded-lg bg-well-fg px-3 py-2 text-sm text-well">
              Gate open. Score clears 70% and every missed conservation/FBD item has a filed correction — Materials
              101 is yours.
            </p>
          ) : (
            <p className="mt-3 text-sm text-well-dim">
              {passed
                ? "Score gate cleared. File corrections for the remaining items below to open the gate."
                : "Score gate not cleared. Retake the check — and file corrections for the missed items below regardless."}
            </p>
          )}
          {missed.length > 0 && (
            <div className="mt-4">
              <div className="mb-2 text-sm text-well-dim">Missed items</div>
              <div className="flex flex-col gap-3">
                {missed.map((m) => {
                  const needsCorrection = m.topic === "conservation" || m.topic === "fbd";
                  const filed = (state.corrections[m.id] ?? "").trim().length > 0;
                  return (
                    <div key={m.id} className="rounded-lg p-3 ring-1 ring-white/15">
                      <p className="text-sm text-well-fg">
                        {m.prompt}{" "}
                        <span className="text-well-dim">({TOPIC_LABEL[m.topic]})</span>
                      </p>
                      <p className="mt-1 text-sm text-well-dim">{m.why}</p>
                      {needsCorrection && (
                        <div className="mt-2">
                          <textarea
                            className={inputCls + " min-h-20"}
                            placeholder="Correction: name the error, re-derive the answer, identify the failed instinct."
                            value={state.corrections[m.id] ?? ""}
                            disabled={filed}
                            onChange={(e) =>
                              setState((s) => ({
                                ...s,
                                corrections: { ...s.corrections, [m.id]: e.target.value },
                              }))
                            }
                            aria-label={`Correction for: ${m.prompt}`}
                          />
                          {filed ? (
                            <p className="mt-1 text-sm text-well-dim">Correction filed.</p>
                          ) : (
                            <div className="mt-1">
                              <WellButton
                                onClick={() => {
                                  const v = (state.corrections[m.id] ?? "").trim();
                                  if (v)
                                    setState((s) => ({
                                      ...s,
                                      corrections: { ...s.corrections, [m.id]: v },
                                    }));
                                }}
                              >
                                File correction
                              </WellButton>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </BenchShell>
  );
}
