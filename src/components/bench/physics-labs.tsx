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

/* ------------------------------------------------------------------ */
/* Physics 101, Week 3 benches                                         */
/* ------------------------------------------------------------------ */

import { blockOnIncline, FRICTION_PAIRS, frictionPair } from "@/course/forces";

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
