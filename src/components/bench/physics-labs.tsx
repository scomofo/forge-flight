import { useEffect, useState } from "react";
import { BenchShell, fmt, Readouts, Segmented, Slider, useReducedMotion, useTicker, WellButton } from "./ui";

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
