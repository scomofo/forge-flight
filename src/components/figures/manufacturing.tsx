import { useId } from "react";
import { Axes, C, Label, plotBox, type FigureMap } from "./kit";
import { AnimatedFigure, clamp, GrowArrow, lerp, op, partial, seg } from "./motion";

/** 4.1: an open pocket a cutter can reach versus a closed tunnel it cannot. */
function Mechanism() {
  const acts = ["freeze", "deform", "cut", "join", "add"];
  const chosen = (a: string) => a === "cut" || a === "add";
  /** Act i fades in across the top, left to right. */
  const listed = (t: number, i: number) => seg(t, 0.3 + 0.12 * i, 0.7 + 0.12 * i);
  return (
    <AnimatedFigure
      height={290}
      duration={4.8}
      alt="The five acts freeze, deform, cut, join and add listed across the top; below, a bracket with an open pocket that a cutter enters and leaves, marked cut, and a block with a closed internal tunnel that the cutter cannot reach, marked add."
      steps={[
        { at: 0, label: "Acts", caption: "Every process makes shape by one act: freeze, deform, cut, join or add." },
        { at: 1.3, label: "Pocket", caption: "The bracket's pocket is open, so a cutter has a path in and a path out." },
        { at: 2.7, label: "Tunnel", caption: "The lattice's tunnel is closed, and a rigid tool cannot get into it." },
        {
          at: 4,
          label: "Verdict",
          caption:
            "The geometry votes before the brand: a cutter needs a path in and out, so the closed tunnel rules cutting out and leaves adding.",
        },
      ]}
    >
      {({ t }) => {
        const vote = seg(t, 4.2, 4.7);
        const reach = seg(t, 1.4, 2); // the cutter plunges into the pocket
        const stop = seg(t, 2.8, 3.2); // and comes down onto the closed block
        const cross1 = seg(t, 3.2, 3.6);
        const cross2 = seg(t, 3.35, 3.75);
        const pocket = op(seg(t, 1.3, 1.7));
        const tunnel = op(seg(t, 2.7, 3.1));
        const verdict = op(seg(t, 4, 4.5));
        return (
          <>
            {/* cut and add sit in the list unmarked until the geometry picks them */}
            {vote < 1
              ? acts.map((a, i) =>
                  chosen(a) ? (
                    <Label key={a} x={48 + i * 96} y={24} tone="muted" opacity={op(listed(t, i) * (1 - vote))}>
                      {a}
                    </Label>
                  ) : null,
                )
              : null}
            {acts.map((a, i) => (
              <Label
                key={a}
                x={48 + i * 96}
                y={24}
                tone={chosen(a) ? "accent" : "muted"}
                weight={chosen(a) ? 600 : undefined}
                opacity={op(chosen(a) ? vote : listed(t, i))}
              >
                {a}
              </Label>
            ))}

            <path d="M40,120 L100,120 L100,178 L150,178 L150,120 L210,120 L210,215 L40,215 Z" fill={C.soft} stroke={C.ink} strokeWidth={2} />
            {reach > 0.02 ? (
              <rect x={114} y={58} width={22} height={lerp(0, 112, reach)} rx={2} fill={C.line} stroke={C.ink} strokeWidth={1.5} />
            ) : null}
            <GrowArrow p={seg(t, 1.8, 2.3)} x1={180} y1={52} x2={180} y2={112} tone="accent" width={2} both />
            <Label x={190} y={70} size={15} tone="accent" anchor="start" opacity={op(seg(t, 2, 2.4))}>in</Label>
            <Label x={190} y={94} size={15} tone="accent" anchor="start" opacity={op(seg(t, 2.1, 2.5))}>out</Label>

            <rect x={270} y={120} width={170} height={95} fill={C.soft} stroke={C.ink} strokeWidth={2} />
            <rect x={298} y={152} width={114} height={32} rx={16} fill={C.surface} stroke={C.ink} strokeWidth={2} />
            {stop > 0.02 ? (
              <rect x={344} y={58} width={22} height={lerp(0, 58, stop)} rx={2} fill={C.line} stroke={C.ink} strokeWidth={1.5} />
            ) : null}
            {cross1 > 0.02 ? (
              <line x1={344} y1={126} x2={lerp(344, 366, cross1)} y2={lerp(126, 146, cross1)} stroke={C.alarm} strokeWidth={3} />
            ) : null}
            {cross2 > 0.02 ? (
              <line x1={366} y1={126} x2={lerp(366, 344, cross2)} y2={lerp(126, 146, cross2)} stroke={C.alarm} strokeWidth={3} />
            ) : null}
            <Label x={392} y={90} size={15} tone="alarm" anchor="start" opacity={op(seg(t, 3.4, 3.8))}>no path</Label>

            <Label x={125} y={240} size={15} tone="muted" opacity={pocket}>open pocket</Label>
            <Label x={355} y={240} size={15} tone="muted" opacity={tunnel}>closed tunnel</Label>
            <Label x={125} y={268} tone="accent" weight={600} opacity={verdict}>→ cut</Label>
            <Label x={355} y={268} tone="accent" weight={600} opacity={verdict}>→ add</Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** 4.2: orthogonal cut — uncut layer h, chip up the rake face, force F and speed v. */
function Chip() {
  const clip = `chip-rise${useId().replace(/[^\w-]/g, "")}`;
  return (
    <AnimatedFigure
      height={310}
      duration={4.5}
      alt="A cutting tool lifting an uncut layer 0.10 mm thick off a steel workpiece moving at speed v, the layer leaving as a chip up the tool face, with the cutting force F of 750 N on the tool and the formula F equals u times b times h."
      steps={[
        { at: 0, label: "Layer", caption: "A steel cut 3 mm wide takes an uncut layer 0.10 mm thick." },
        {
          at: 1.2,
          label: "Shear",
          caption: "The work moves at speed v, and the layer is driven up a thin shear zone and leaves as a chip.",
        },
        {
          at: 2.7,
          label: "Force",
          caption: "Force is specific energy times the uncut area: F = 2500 × 3 × 0.10 = 750 N.",
        },
        {
          at: 3.9,
          label: "Knobs",
          caption:
            "Force follows the layer's cross-section; speed only multiplies it into power. Thicker chip, more force. Faster surface, same force, more watts.",
        },
      ]}
    >
      {({ t }) => {
        const layer = op(seg(t, 0.3, 0.8));
        const rise = seg(t, 1.7, 2.4); // the chip climbs the tool face from the edge
        const top = lerp(152, 44, rise);
        return (
          <>
            <rect x={20} y={150} width={420} height={85} fill={C.soft} stroke={C.ink} strokeWidth={2} />
            <rect x={20} y={128} width={250} height={22} fill={C.line} stroke={C.ink} strokeWidth={2} opacity={layer} />
            <Label x={140} y={140} size={15} opacity={layer}>uncut h = 0.10 mm</Label>
            {rise > 0 && rise < 1 ? (
              <clipPath id={clip}>
                <rect x={220} y={top} width={80} height={152 - top} />
              </clipPath>
            ) : null}
            {rise > 0 ? (
              <path
                d="M238,128 L270,150 L284,84 C282,60 262,46 244,52 C236,70 244,100 238,128 Z"
                fill={C.line}
                stroke={C.ink}
                strokeWidth={2}
                clipPath={rise < 1 ? `url(#${clip})` : undefined}
              />
            ) : null}
            <line x1={238} y1={128} x2={270} y2={150} stroke={C.muted} strokeWidth={1.5} strokeDasharray="4 3" opacity={op(seg(t, 1.5, 1.9))} />
            <polygon points="270,150 290,64 336,64 336,140" fill={C.surface} stroke={C.ink} strokeWidth={2.5} />
            <Label x={313} y={48} size={15} tone="muted">tool</Label>
            <Label x={206} y={78} size={15} tone="muted" anchor="end" opacity={op(seg(t, 2.1, 2.5))}>chip</Label>

            <GrowArrow p={seg(t, 1.2, 1.7)} x1={60} y1={205} x2={180} y2={205} tone="ink" width={2.5} />
            <Label x={196} y={205} anchor="start" opacity={op(seg(t, 1.4, 1.8))}>v</Label>
            <Label x={330} y={205} size={15} tone="muted" opacity={op(seg(t, 0.5, 1))}>steel, b = 3 mm</Label>

            <GrowArrow p={seg(t, 2.7, 3.2)} x1={346} y1={110} x2={440} y2={110} tone="accent" />
            <Label x={396} y={88} tone="accent" weight={600} opacity={op(seg(t, 2.9, 3.3))}>F = 750 N</Label>

            <Label x={240} y={262} size={17} serif opacity={op(seg(t, 3.1, 3.6))}>F = u·b·h = 2500 × 3 × 0.10 = 750 N</Label>
            <Label x={240} y={292} size={15} tone="muted" opacity={op(seg(t, 3.9, 4.4))}>2h → 1500 N   ·   2v → same F, 2× power</Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** Arc + straight leg of a bent strip that turns by `deg` on radius `r` (px) from (x0, y0). */
function bentLeg(x0: number, y0: number, r: number, deg: number, leg: number) {
  const th = (deg * Math.PI) / 180;
  const ax = x0 + r * Math.sin(th);
  const ay = y0 - r + r * Math.cos(th);
  const ex = ax + leg * Math.cos(th);
  const ey = ay - leg * Math.sin(th);
  return { d: `M${x0},${y0} A${r},${r} 0 0 0 ${ax.toFixed(1)},${ay.toFixed(1)} L${ex.toFixed(1)},${ey.toFixed(1)}`, ex, ey };
}

/** 4.3: the same 90° bend after release — aluminum opens 15.6°, titanium 31.8°. */
function Springback() {
  const s = 4; // px per mm
  const x0 = 180;
  const y0 = 250;
  const leg = 120;
  // Arc length is kept: R·θ = 15 mm × 90°.
  const punch = bentLeg(x0, y0, 15 * s, 90, leg);
  const al = bentLeg(x0, y0, 18.1 * s, 90 - 15.6, leg);
  const ti = bentLeg(x0, y0, 23.2 * s, 90 - 31.8, leg);
  const arc = 15 * s * (Math.PI / 2); // px of strip in the bend
  const bend = (t: number) => seg(t, 0.4, 1.8); // the punch folds the flat strip to 90°
  const release = (t: number) => seg(t, 2.2, 3.6); // let go: the elastic part comes back
  /** The strip at time t: folded on the kept arc, then opening by `open`° as R grows to `r` mm. */
  const strip = (t: number, r: number, open: number) => {
    const p = release(t);
    if (p > 0) return bentLeg(x0, y0, lerp(15 * s, r * s, p), lerp(90, 90 - open, p), leg).d;
    const deg = 90 * bend(t);
    if (deg < 0.5) return `M${x0},${y0} L${(x0 + arc + leg).toFixed(1)},${y0}`; // still flat
    return bentLeg(x0, y0, arc / ((deg * Math.PI) / 180), deg, leg).d;
  };
  return (
    <AnimatedFigure
      height={300}
      duration={4.3}
      alt="A 1 mm strip bent 90 degrees on a 15 mm radius, shown dashed under the punch, then after release: aluminum opens 15.6 degrees to an 18.1 mm radius and titanium opens 31.8 degrees to a 23.2 mm radius."
      steps={[
        {
          at: 0,
          label: "Bend",
          caption: "Under the punch, a 1 mm strip of aluminum and one of titanium take the same 90° bend on a 15 mm radius.",
        },
        {
          at: 2.2,
          label: "Release",
          caption: "Unload, and the elastic part of the bend comes back: the radius grows and the strip opens.",
        },
        {
          at: 3.6,
          label: "Compare",
          caption:
            "Same punch, same bend. Titanium's higher yield over modulus leaves more elastic bend to come back, so it opens about twice as far.",
        },
      ]}
      readouts={(t) => [
        { label: "bend", value: `${Math.round(90 * bend(t))}°` },
        { label: "Al opens", value: `${(15.6 * release(t)).toFixed(1)}°`, tone: "ink" },
        { label: "Ti opens", value: `${(31.8 * release(t)).toFixed(1)}°`, tone: "accent" },
      ]}
    >
      {({ t }) => {
        const opened = op(seg(t, 3.4, 3.9));
        return (
          <>
            <Label x={24} y={30} size={15} tone="muted" anchor="start">Al 270 MPa / 70 GPa</Label>
            <Label x={24} y={54} size={15} tone="muted" anchor="start">Ti 880 MPa / 110 GPa</Label>
            <line x1={40} y1={y0} x2={x0} y2={y0} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
            <path d={punch.d} fill="none" stroke={C.muted} strokeWidth={3} strokeDasharray="7 5" opacity={op(seg(t, 1.4, 1.8))} />
            <path d={strip(t, 18.1, 15.6)} fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
            {/* one strip under the punch; titanium shows once the two part ways */}
            <path d={strip(t, 23.2, 31.8)} fill="none" stroke={C.accent} strokeWidth={5} strokeLinecap="round" opacity={op(seg(t, 2.2, 2.6))} />
            <Label x={punch.ex - 8} y={punch.ey + 6} size={15} tone="muted" anchor="end" opacity={op(seg(t, 1.5, 1.9))}>punch 90°</Label>
            <Label x={al.ex + 10} y={al.ey - 6} size={15} anchor="start" opacity={opened}>Al opens 15.6°</Label>
            <Label x={ti.ex + 10} y={ti.ey + 4} size={15} tone="accent" weight={600} anchor="start" opacity={opened}>Ti opens 31.8°</Label>
            <Label x={24} y={282} size={15} tone="muted" anchor="start" opacity={op(seg(t, 3.7, 4.2))}>R 15 mm → 18.1 mm (Al), 23.2 mm (Ti)</Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** Freeze figure clock: plate V/A (mm), seconds before freezing starts, seconds per plate freeze time. */
const FREEZE = { plate: 7.06, lead: 0.5, unit: 2.2 };
/** A section's freeze time in plate freeze times: t_s = C (V/A)², and C cancels in the same mold. */
const freezeAt = (m: number) => (m / FREEZE.plate) ** 2;
/** Seconds into the sequence when a section of freeze time `f` goes solid. */
const frozenBy = (f: number) => FREEZE.lead + f * FREEZE.unit;

/**
 * One plate-and-riser section for the Freeze figure. Scale 1.2 px/mm. `f` is
 * time in plate freeze times: liquid (brass) shrinks from the walls inward and
 * the cavity opens where the last of it was.
 */
function PlateRiser({ x, d, good, t, f }: { x: number; d: number; good: boolean; t: number; f: number }) {
  const k = 1.2;
  const pw = 120 * k;
  const pt = 20 * k;
  const py = 196;
  const rd = d * k;
  const rx = x + pw / 2 - rd / 2;
  const cx = x + pw / 2;
  const fr = freezeAt(d / 6); // a riser with height = D has V/A = D/6
  /** Liquid left in a box that goes solid at `fe`: the solid shell grows as √t. */
  const pool = (bx: number, by: number, bw: number, bh: number, fe: number) => {
    if (f >= fe) return null;
    const g = 1 - Math.sqrt(clamp(f / fe));
    return (
      <rect x={bx + (bw * (1 - g)) / 2} y={by + (bh * (1 - g)) / 2} width={bw * g} height={bh * g} fill={C.brass} fillOpacity={0.7} />
    );
  };
  const riserDone = seg(t, frozenBy(fr), frozenBy(fr) + 0.5);
  const plateDone = seg(t, frozenBy(1), frozenBy(1) + 0.5);
  const hole = op(good ? seg(t, frozenBy(fr), frozenBy(fr) + 0.4) : seg(t, frozenBy(1), frozenBy(1) + 0.4));
  return (
    <g>
      <rect x={x} y={py} width={pw} height={pt} fill={C.soft} stroke={C.ink} strokeWidth={2} />
      <rect x={rx} y={py - rd} width={rd} height={rd} fill={C.soft} stroke={C.ink} strokeWidth={2} />
      <line x1={rx + 2} y1={py} x2={rx + rd - 2} y2={py} stroke={C.soft} strokeWidth={3} />
      {pool(x + 1, py + 1, pw - 2, pt - 2, 1)}
      {pool(rx + 1, py - rd + 1, rd - 2, rd, fr)}
      {good ? (
        <path d={`M${cx - 18},${py - rd} L${cx},${py - rd + 44} L${cx + 18},${py - rd} Z`} fill={C.surface} stroke={C.accent} strokeWidth={2} opacity={hole} />
      ) : (
        <ellipse cx={cx} cy={py + pt / 2} rx={16} ry={6} fill={C.surface} stroke={C.alarm} strokeWidth={2.5} opacity={hole} />
      )}
      <Label x={cx} y={88} size={15}>riser D = {d} mm</Label>
      <Label x={cx} y={110} size={15} tone={good ? "accent" : "alarm"}>V/A = {good ? 10 : 5} mm</Label>
      <Label x={cx} y={240} size={15} tone="muted">plate V/A = 7.06 mm</Label>
      <Label x={cx} y={270} size={15} tone={good ? "accent" : "alarm"} weight={600} opacity={op(riserDone)}>
        {good ? "riser freezes last" : "riser freezes first"}
      </Label>
      <Label x={cx} y={294} size={15} tone={good ? "accent" : "alarm"} opacity={op(good ? riserDone : plateDone)}>
        {good ? "≈ 2.0× later than plate" : "void left in plate"}
      </Label>
    </g>
  );
}

/** 4.4: a 60 mm riser that freezes last versus a 30 mm riser that leaves the void in the plate. */
function Freeze() {
  const last = freezeAt(60 / 6);
  const clock = (t: number) => clamp((t - FREEZE.lead) / FREEZE.unit, 0, last);
  return (
    <AnimatedFigure
      height={310}
      duration={5.5}
      alt="Two sections of a 120 by 80 by 20 mm plate with a riser on top: a 60 mm riser with casting modulus 10 mm holds the shrinkage cavity, while a 30 mm riser with modulus 5 mm freezes first and leaves a void inside the plate."
      steps={[
        {
          at: 0,
          label: "Pour",
          caption: "The same 120 × 80 × 20 mm plate, V/A = 7.06 mm, is poured with a 60 mm riser and with a 30 mm one.",
        },
        {
          at: frozenBy(freezeAt(30 / 6)),
          label: "Thin riser",
          caption: "The 30 mm riser's V/A is only 5 mm, so it freezes first and can no longer feed the plate.",
        },
        {
          at: frozenBy(1),
          label: "Plates",
          caption: "Metal shrinks as it freezes: the left plate still draws on its liquid riser, the right one is left with a void.",
        },
        {
          at: frozenBy(last),
          label: "Last liquid",
          caption:
            "Freeze time goes as (V/A)². The riser must out-chunk the plate's 7.06 mm, or the shrinkage hole ends up in the part you keep.",
        },
      ]}
      readouts={(t) => [{ label: "t", value: `${clock(t).toFixed(1)}× plate` }]}
    >
      {({ t }) => (
        <>
          <PlateRiser x={36} d={60} good t={t} f={clock(t)} />
          <PlateRiser x={300} d={30} good={false} t={t} f={clock(t)} />
          <line x1={240} y1={80} x2={240} y2={300} stroke={C.line} strokeWidth={1.5} />
        </>
      )}
    </AnimatedFigure>
  );
}

/** 4.5: butt-weld section with the heat-affected band, and strength across the joint. */
function Haz() {
  const cx = 240;
  const top = 44;
  const bot = 84;
  const bead = (w: number) =>
    `M${cx - 30 - w},${top} L${cx + 30 + w},${top} L${cx + 8 + w},${bot} L${cx - 8 - w},${bot} Z`;
  const box = { x: 20, y: 150, w: 430, h: 110 };
  // Strength across the joint: filler strong, HAZ softest at the fusion line, plate recovers.
  const prof = (w: number, depth: number) => {
    const pts: Array<[number, number]> = [];
    for (let x = 20; x <= 460; x += 2) {
      const d = Math.abs(x - cx);
      let y = 196;
      if (d < 20) y = 166;
      else if (d < 20 + w) y = 196 + depth * (1 - (d - 20) / w);
      pts.push([x, y]);
    }
    return pts;
  };
  const trace = (pts: Array<[number, number]>) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x},${y.toFixed(1)}`).join(" ");
  const usual = prof(25, 22);
  return (
    <AnimatedFigure
      height={300}
      duration={5.3}
      alt="Cross-section of a butt weld showing the filler bead, a heat-affected band on each side, and the plate beyond; below, a strength profile across the joint that is highest in the filler and dips lowest in the band beside the bead, with a wider, deeper dip for more heat."
      steps={[
        {
          at: 0,
          label: "Weld",
          caption: "The filler bead is a small casting poured between two plates, and it is stronger than the plate.",
        },
        {
          at: 1.2,
          label: "HAZ",
          caption: "The heat also rewrites the plate beside the bead: that band is the heat-affected zone.",
        },
        {
          at: 2.5,
          label: "Strength",
          caption: "Walk across the joint: strength peaks in the filler and dips lowest in the band beside it, the weak line.",
        },
        {
          at: 4.3,
          label: "More heat",
          caption:
            "The filler is the strong part. The joint gives way in the band beside it, and more heat per length makes that band wider and weaker.",
        },
      ]}
    >
      {({ t }) => {
        const band = seg(t, 1.2, 1.9); // the heat-affected band spreads out from the bead
        const walk = seg(t, 2.7, 3.9); // strength traced across the joint
        const hot = seg(t, 4.3, 5); // more heat: wider band, deeper dip
        const names = op(seg(t, 0.3, 0.8));
        const haz = op(seg(t, 1.6, 2.1));
        const more = op(seg(t, 4.7, 5.2));
        return (
          <>
            <rect x={20} y={top} width={440} height={bot - top} fill={C.soft} stroke={C.ink} strokeWidth={2} />
            {hot > 0 ? <path d={bead(lerp(25, 55, hot))} fill="none" stroke={C.accent} strokeWidth={1.5} strokeDasharray="5 4" /> : null}
            {band > 0 ? <path d={bead(lerp(0, 25, band))} fill={C.brass} fillOpacity={0.45} stroke={C.ink} strokeWidth={1} /> : null}
            <path d={bead(0)} fill={C.line} stroke={C.ink} strokeWidth={2} />
            <Label x={cx} y={24} size={15} opacity={names}>filler</Label>
            <Label x={80} y={24} size={15} tone="muted" opacity={names}>plate</Label>
            <Label x={400} y={24} size={15} tone="muted" opacity={names}>plate</Label>
            <Label x={cx - 60} y={104} size={15} opacity={haz}>HAZ</Label>
            <Label x={cx + 60} y={104} size={15} opacity={haz}>HAZ</Label>
            <Label x={cx + 100} y={104} size={15} tone="accent" anchor="start" opacity={more}>more heat</Label>

            <g opacity={op(seg(t, 2.5, 2.9))}>
              <Axes box={box} xLabel="across the joint" yLabel="strength" />
            </g>
            {hot > 0 ? (
              <path d={trace(prof(lerp(25, 55, hot), lerp(22, 40, hot)))} fill="none" stroke={C.accent} strokeWidth={2} strokeDasharray="6 4" />
            ) : null}
            {walk > 0 ? <path d={trace(partial(usual, walk))} fill="none" stroke={C.ink} strokeWidth={2.5} /> : null}
            <GrowArrow p={seg(t, 3.6, 4)} x1={130} y1={246} x2={214} y2={222} tone="alarm" width={2} />
            <Label x={80} y={250} size={15} tone="alarm" weight={600} opacity={op(seg(t, 3.7, 4.1))}>weak line</Label>
            <Label x={cx + 100} y={244} size={15} tone="accent" anchor="start" opacity={more}>more heat</Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** Normal pdf. */
const pdf = (x: number, mu: number, sd: number) =>
  Math.exp(-0.5 * ((x - mu) / sd) ** 2) / (sd * Math.sqrt(2 * Math.PI));

/** 4.6: a centered pile and the same pile shifted 0.06 mm toward the upper limit. */
function Spread() {
  const b = plotBox({ x: 40, y: 50, w: 400, h: 170, xMin: 9.85, xMax: 10.2, yMin: 0, yMax: 17 });
  const sd = 0.025;
  const curve = (mu: number) => {
    const pts: Array<[number, number]> = [];
    for (let x = mu - 4 * sd; x <= mu + 4 * sd + 1e-9; x += 0.002) pts.push([x, pdf(x, mu, sd)]);
    return pts;
  };
  /** The part of the pile centered on `mu` that lies past the upper limit. */
  const tail = (mu: number) => {
    const pts: Array<[number, number]> = [[10.1, 0]];
    for (let x = 10.1; x <= mu + 4 * sd + 1e-9; x += 0.002) pts.push([x, pdf(x, mu, sd)]);
    pts.push([mu + 4 * sd, 0]);
    return pts;
  };
  const centered = curve(10);
  const peak = b.py(pdf(0, 0, sd));
  const shift = (t: number) => seg(t, 1.8, 3.6); // the mean walks 0.06 mm toward the upper limit
  const mean = (t: number) => lerp(10, 10.06, shift(t));
  return (
    <AnimatedFigure
      height={290}
      duration={4.1}
      alt="Two identical bell curves of pin diameter with standard deviation 0.025 mm inside limits of 9.90 and 10.10 mm: one centered on 10.00 with Cpk 1.33, the other shifted 0.06 mm toward the upper limit with Cpk 0.53 and a tail past the limit."
      steps={[
        {
          at: 0,
          label: "Centered",
          caption: "Pins aimed at 10.00 mm with σ = 0.025 mm fit the ±0.10 mm window: Cp = 0.20 / 0.15 = 1.33.",
        },
        {
          at: 1.6,
          label: "Shift",
          caption: "Shift the mean 0.06 mm toward the upper limit: the pile keeps its width, but it walks toward one wall.",
        },
        {
          at: 3.5,
          label: "Cpk",
          caption:
            "Same width, so Cp stays 1.33. The shifted pile sits only 0.04 mm from the upper wall, so Cpk falls to 0.53 and a tail of pins misses.",
        },
      ]}
      readouts={(t) => {
        const mu = mean(t);
        return [
          { label: "mean", value: `${mu.toFixed(2)} mm` },
          { label: "Cp", value: "1.33, steady" },
          { label: "Cpk", value: ((10.1 - mu) / (3 * sd)).toFixed(2), tone: "accent" },
        ];
      }}
    >
      {({ t }) => {
        const mu = mean(t);
        const draw = seg(t, 0.3, 1.1);
        const before = op(seg(t, 0.9, 1.4));
        const after = op(seg(t, 3.5, 4));
        return (
          <>
            {mu + 4 * sd > 10.1 ? <path d={b.path(tail(mu)) + " Z"} fill={C.alarm} fillOpacity={0.35} stroke="none" /> : null}
            {draw > 0 ? <path d={b.path(partial(centered, draw))} fill="none" stroke={C.ink} strokeWidth={2} /> : null}
            {t >= 1.6 ? <path d={b.path(curve(mu))} fill="none" stroke={C.accent} strokeWidth={2.5} opacity={op(seg(t, 1.6, 1.9))} /> : null}
            {[9.9, 10.1].map((v) => (
              <line key={v} x1={b.px(v)} y1={b.py(0)} x2={b.px(v)} y2={b.y - 8} stroke={C.ink} strokeWidth={2} strokeDasharray="6 4" />
            ))}
            <Label x={b.px(9.9)} y={b.y - 22} size={15}>LSL</Label>
            <Label x={b.px(10.1)} y={b.y - 22} size={15}>USL</Label>
            <GrowArrow p={shift(t)} x1={b.px(10)} y1={peak - 10} x2={b.px(10.06)} y2={peak - 10} tone="accent" width={2} />
            <Label x={(b.px(10) + b.px(10.06)) / 2} y={peak - 26} size={15} tone="accent" opacity={after}>0.06</Label>
            <line x1={b.x} y1={b.py(0)} x2={b.x + b.w} y2={b.py(0)} stroke={C.ink} strokeWidth={1.5} />
            {[9.9, 10, 10.1].map((v) => (
              <Label key={v} x={b.px(v)} y={b.py(0) + 18} size={15} tone="muted">
                {v.toFixed(2)}
              </Label>
            ))}
            <Label x={b.x + b.w} y={b.py(0) + 44} size={15} tone="muted" anchor="end">diameter (mm)</Label>
            <Label x={b.px(9.9) + 8} y={b.py(12)} size={15} anchor="start" opacity={before}>centered</Label>
            <Label x={b.px(9.9) + 8} y={b.py(12) + 20} size={15} anchor="start" opacity={before}>Cpk 1.33</Label>
            <Label x={b.px(10.1) + 16} y={b.py(9)} size={15} tone="accent" anchor="start" opacity={after}>shifted</Label>
            <Label x={b.px(10.1) + 16} y={b.py(9) + 20} size={15} tone="accent" weight={600} anchor="start" opacity={after}>Cpk 0.53</Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** 4.7: three ±0.20 mm blocks, worst case versus root sum square against ±0.50 mm. */
function Stack() {
  const x0 = 150;
  const k = 300 / 0.7; // px per mm of tolerance
  const bar = (
    y: number,
    v: number,
    fill: string,
    inner: string,
    lbl: string,
    tone: "alarm" | "accent",
    grow: number,
    show: number,
  ) => (
    <g>
      {grow > 0 ? <rect x={x0} y={y} width={lerp(0, v * k, grow)} height={30} fill={fill} /> : null}
      <text x={x0 + 10} y={y + 16} fill={C.surface} fontSize={15} dominantBaseline="middle" opacity={op(show)}>
        {inner}
      </text>
      <Label x={x0 + v * k + 8} y={y + 15} size={15} tone={tone} weight={600} anchor="start" opacity={op(show)}>
        {lbl}
      </Label>
    </g>
  );
  const ax = x0 + 0.5 * k;
  return (
    <AnimatedFigure
      height={270}
      duration={4.4}
      alt="Three blocks each toleranced plus or minus 0.20 mm stacked end to end; below, a worst-case bar of plus or minus 0.60 mm runs past the plus or minus 0.50 mm allowance line, while a root-sum-square bar of plus or minus 0.35 mm stops inside it."
      steps={[
        { at: 0, label: "Allowance", caption: "Three blocks, each ±0.20 mm, have to stack inside a ±0.50 mm allowance." },
        {
          at: 1.3,
          label: "Worst case",
          caption: "Worst case lets every block land long: 3 × 0.20 = ±0.60 mm, and it does not fit.",
        },
        {
          at: 3.2,
          label: "RSS",
          caption: "Worst case promises every stack and misses. RSS fits only because it bets the three errors won't all land long together.",
        },
      ]}
    >
      {({ t }) => {
        // Each block's 0.20 lands long in turn; RSS grows once to 0.20 × √3.
        const worst = (seg(t, 1.5, 1.9) + seg(t, 1.9, 2.3) + seg(t, 2.3, 2.7)) / 3;
        const frame = seg(t, 0.3, 0.8);
        return (
          <>
            {[0, 1, 2].map((i) => (
              <g key={i}>
                <rect x={90 + i * 100} y={30} width={100} height={46} fill={C.soft} stroke={C.ink} strokeWidth={2} />
                <Label x={140 + i * 100} y={53} size={16}>±0.20</Label>
              </g>
            ))}
            <Label x={140} y={138} anchor="end" size={15} opacity={op(seg(t, 1.3, 1.7))}>worst case</Label>
            {bar(123, 0.6, C.alarm, "3 × 0.20", "±0.60", "alarm", worst, seg(t, 2.6, 3))}
            <Label x={140} y={188} anchor="end" size={15} opacity={op(seg(t, 3.2, 3.6))}>RSS</Label>
            {bar(173, 0.2 * Math.sqrt(3), C.accent, "0.20 × √3", "±0.35", "accent", seg(t, 3.3, 4), seg(t, 3.8, 4.3))}
            {frame > 0.02 ? <line x1={x0} y1={110} x2={x0} y2={lerp(110, 218, frame)} stroke={C.ink} strokeWidth={1.5} /> : null}
            {frame > 0.02 ? (
              <line x1={ax} y1={104} x2={ax} y2={lerp(104, 222, frame)} stroke={C.ink} strokeWidth={2} strokeDasharray="6 4" />
            ) : null}
            <Label x={ax} y={244} size={15} opacity={op(seg(t, 0.5, 1))}>allowance ±0.50</Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

export const manufacturingFigures: FigureMap = {
  "manufacturing/mechanism": Mechanism,
  "manufacturing/chip": Chip,
  "manufacturing/springback": Springback,
  "manufacturing/freeze": Freeze,
  "manufacturing/haz": Haz,
  "manufacturing/spread": Spread,
  "manufacturing/stack": Stack,
};
