import { Arrow, Axes, C, Figure, Label, plotBox, type FigureMap } from "./kit";

/** 4.1: an open pocket a cutter can reach versus a closed tunnel it cannot. */
function Mechanism() {
  const acts = ["freeze", "deform", "cut", "join", "add"];
  return (
    <Figure
      height={290}
      alt="The five acts freeze, deform, cut, join and add listed across the top; below, a bracket with an open pocket that a cutter enters and leaves, marked cut, and a block with a closed internal tunnel that the cutter cannot reach, marked add."
      caption="The geometry votes before the brand: a cutter needs a path in and out, so the closed tunnel rules cutting out and leaves adding."
    >
      {acts.map((a, i) => (
        <Label
          key={a}
          x={48 + i * 96}
          y={24}
          tone={a === "cut" || a === "add" ? "accent" : "muted"}
          weight={a === "cut" || a === "add" ? 600 : undefined}
        >
          {a}
        </Label>
      ))}

      <path d="M40,120 L100,120 L100,178 L150,178 L150,120 L210,120 L210,215 L40,215 Z" fill={C.soft} stroke={C.ink} strokeWidth={2} />
      <rect x={114} y={58} width={22} height={112} rx={2} fill={C.line} stroke={C.ink} strokeWidth={1.5} />
      <Arrow x1={180} y1={52} x2={180} y2={112} tone="accent" width={2} both />
      <Label x={190} y={70} size={15} tone="accent" anchor="start">in</Label>
      <Label x={190} y={94} size={15} tone="accent" anchor="start">out</Label>

      <rect x={270} y={120} width={170} height={95} fill={C.soft} stroke={C.ink} strokeWidth={2} />
      <rect x={298} y={152} width={114} height={32} rx={16} fill={C.surface} stroke={C.ink} strokeWidth={2} />
      <rect x={344} y={58} width={22} height={58} rx={2} fill={C.line} stroke={C.ink} strokeWidth={1.5} />
      <line x1={344} y1={126} x2={366} y2={146} stroke={C.alarm} strokeWidth={3} />
      <line x1={366} y1={126} x2={344} y2={146} stroke={C.alarm} strokeWidth={3} />
      <Label x={392} y={90} size={15} tone="alarm" anchor="start">no path</Label>

      <Label x={125} y={240} size={15} tone="muted">open pocket</Label>
      <Label x={355} y={240} size={15} tone="muted">closed tunnel</Label>
      <Label x={125} y={268} tone="accent" weight={600}>→ cut</Label>
      <Label x={355} y={268} tone="accent" weight={600}>→ add</Label>
    </Figure>
  );
}

/** 4.2: orthogonal cut — uncut layer h, chip up the rake face, force F and speed v. */
function Chip() {
  return (
    <Figure
      height={310}
      alt="A cutting tool lifting an uncut layer 0.10 mm thick off a steel workpiece moving at speed v, the layer leaving as a chip up the tool face, with the cutting force F of 750 N on the tool and the formula F equals u times b times h."
      caption="Force follows the layer's cross-section; speed only multiplies it into power. Thicker chip, more force. Faster surface, same force, more watts."
    >
      <rect x={20} y={150} width={420} height={85} fill={C.soft} stroke={C.ink} strokeWidth={2} />
      <rect x={20} y={128} width={250} height={22} fill={C.line} stroke={C.ink} strokeWidth={2} />
      <Label x={140} y={140} size={15}>uncut h = 0.10 mm</Label>
      <path d="M238,128 L270,150 L284,84 C282,60 262,46 244,52 C236,70 244,100 238,128 Z" fill={C.line} stroke={C.ink} strokeWidth={2} />
      <line x1={238} y1={128} x2={270} y2={150} stroke={C.muted} strokeWidth={1.5} strokeDasharray="4 3" />
      <polygon points="270,150 290,64 336,64 336,140" fill={C.surface} stroke={C.ink} strokeWidth={2.5} />
      <Label x={313} y={48} size={15} tone="muted">tool</Label>
      <Label x={206} y={78} size={15} tone="muted" anchor="end">chip</Label>

      <Arrow x1={60} y1={205} x2={180} y2={205} tone="ink" width={2.5} />
      <Label x={196} y={205} anchor="start">v</Label>
      <Label x={330} y={205} size={15} tone="muted">steel, b = 3 mm</Label>

      <Arrow x1={346} y1={110} x2={440} y2={110} tone="accent" />
      <Label x={396} y={88} tone="accent" weight={600}>F = 750 N</Label>

      <Label x={240} y={262} size={17} serif>F = u·b·h = 2500 × 3 × 0.10 = 750 N</Label>
      <Label x={240} y={292} size={15} tone="muted">2h → 1500 N   ·   2v → same F, 2× power</Label>
    </Figure>
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
  return (
    <Figure
      height={300}
      alt="A 1 mm strip bent 90 degrees on a 15 mm radius, shown dashed under the punch, then after release: aluminum opens 15.6 degrees to an 18.1 mm radius and titanium opens 31.8 degrees to a 23.2 mm radius."
      caption="Same punch, same bend. Titanium's higher yield over modulus leaves more elastic bend to come back, so it opens about twice as far."
    >
      <Label x={24} y={30} size={15} tone="muted" anchor="start">Al 270 MPa / 70 GPa</Label>
      <Label x={24} y={54} size={15} tone="muted" anchor="start">Ti 880 MPa / 110 GPa</Label>
      <line x1={40} y1={y0} x2={x0} y2={y0} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
      <path d={punch.d} fill="none" stroke={C.muted} strokeWidth={3} strokeDasharray="7 5" />
      <path d={al.d} fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
      <path d={ti.d} fill="none" stroke={C.accent} strokeWidth={5} strokeLinecap="round" />
      <Label x={punch.ex - 8} y={punch.ey + 6} size={15} tone="muted" anchor="end">punch 90°</Label>
      <Label x={al.ex + 10} y={al.ey - 6} size={15} anchor="start">Al opens 15.6°</Label>
      <Label x={ti.ex + 10} y={ti.ey + 4} size={15} tone="accent" weight={600} anchor="start">Ti opens 31.8°</Label>
      <Label x={24} y={282} size={15} tone="muted" anchor="start">R 15 mm → 18.1 mm (Al), 23.2 mm (Ti)</Label>
    </Figure>
  );
}

/** One plate-and-riser section for the Freeze figure. Scale 1.2 px/mm. */
function PlateRiser({ x, d, good }: { x: number; d: number; good: boolean }) {
  const k = 1.2;
  const pw = 120 * k;
  const pt = 20 * k;
  const py = 196;
  const rd = d * k;
  const rx = x + pw / 2 - rd / 2;
  const cx = x + pw / 2;
  return (
    <g>
      <rect x={x} y={py} width={pw} height={pt} fill={C.soft} stroke={C.ink} strokeWidth={2} />
      <rect x={rx} y={py - rd} width={rd} height={rd} fill={C.soft} stroke={C.ink} strokeWidth={2} />
      <line x1={rx + 2} y1={py} x2={rx + rd - 2} y2={py} stroke={C.soft} strokeWidth={3} />
      {good ? (
        <path d={`M${cx - 18},${py - rd} L${cx},${py - rd + 44} L${cx + 18},${py - rd} Z`} fill={C.surface} stroke={C.accent} strokeWidth={2} />
      ) : (
        <ellipse cx={cx} cy={py + pt / 2} rx={16} ry={6} fill={C.surface} stroke={C.alarm} strokeWidth={2.5} />
      )}
      <Label x={cx} y={88} size={15}>riser D = {d} mm</Label>
      <Label x={cx} y={110} size={15} tone={good ? "accent" : "alarm"}>V/A = {good ? 10 : 5} mm</Label>
      <Label x={cx} y={240} size={15} tone="muted">plate V/A = 7.06 mm</Label>
      <Label x={cx} y={270} size={15} tone={good ? "accent" : "alarm"} weight={600}>
        {good ? "riser freezes last" : "riser freezes first"}
      </Label>
      <Label x={cx} y={294} size={15} tone={good ? "accent" : "alarm"}>
        {good ? "≈ 2.0× later than plate" : "void left in plate"}
      </Label>
    </g>
  );
}

/** 4.4: a 60 mm riser that freezes last versus a 30 mm riser that leaves the void in the plate. */
function Freeze() {
  return (
    <Figure
      height={310}
      alt="Two sections of a 120 by 80 by 20 mm plate with a riser on top: a 60 mm riser with casting modulus 10 mm holds the shrinkage cavity, while a 30 mm riser with modulus 5 mm freezes first and leaves a void inside the plate."
      caption="Freeze time goes as (V/A)². The riser must out-chunk the plate's 7.06 mm, or the shrinkage hole ends up in the part you keep."
    >
      <PlateRiser x={36} d={60} good />
      <PlateRiser x={300} d={30} good={false} />
      <line x1={240} y1={80} x2={240} y2={300} stroke={C.line} strokeWidth={1.5} />
    </Figure>
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
    const pts: string[] = [];
    for (let x = 20; x <= 460; x += 2) {
      const d = Math.abs(x - cx);
      let y = 196;
      if (d < 20) y = 166;
      else if (d < 20 + w) y = 196 + depth * (1 - (d - 20) / w);
      pts.push(`${pts.length ? "L" : "M"}${x},${y.toFixed(1)}`);
    }
    return pts.join(" ");
  };
  return (
    <Figure
      height={300}
      alt="Cross-section of a butt weld showing the filler bead, a heat-affected band on each side, and the plate beyond; below, a strength profile across the joint that is highest in the filler and dips lowest in the band beside the bead, with a wider, deeper dip for more heat."
      caption="The filler is the strong part. The joint gives way in the band beside it, and more heat per length makes that band wider and weaker."
    >
      <rect x={20} y={top} width={440} height={bot - top} fill={C.soft} stroke={C.ink} strokeWidth={2} />
      <path d={bead(55)} fill="none" stroke={C.accent} strokeWidth={1.5} strokeDasharray="5 4" />
      <path d={bead(25)} fill={C.brass} fillOpacity={0.45} stroke={C.ink} strokeWidth={1} />
      <path d={bead(0)} fill={C.line} stroke={C.ink} strokeWidth={2} />
      <Label x={cx} y={24} size={15}>filler</Label>
      <Label x={80} y={24} size={15} tone="muted">plate</Label>
      <Label x={400} y={24} size={15} tone="muted">plate</Label>
      <Label x={cx - 60} y={104} size={15}>HAZ</Label>
      <Label x={cx + 60} y={104} size={15}>HAZ</Label>
      <Label x={cx + 100} y={104} size={15} tone="accent" anchor="start">more heat</Label>

      <Axes box={box} xLabel="across the joint" yLabel="strength" />
      <path d={prof(55, 40)} fill="none" stroke={C.accent} strokeWidth={2} strokeDasharray="6 4" />
      <path d={prof(25, 22)} fill="none" stroke={C.ink} strokeWidth={2.5} />
      <Arrow x1={130} y1={246} x2={214} y2={222} tone="alarm" width={2} />
      <Label x={80} y={250} size={15} tone="alarm" weight={600}>weak line</Label>
      <Label x={cx + 100} y={244} size={15} tone="accent" anchor="start">more heat</Label>
    </Figure>
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
  const tail: Array<[number, number]> = [[10.1, 0]];
  for (let x = 10.1; x <= 10.06 + 4 * sd + 1e-9; x += 0.002) tail.push([x, pdf(x, 10.06, sd)]);
  tail.push([10.06 + 4 * sd, 0]);
  const peak = b.py(pdf(0, 0, sd));
  return (
    <Figure
      height={290}
      alt="Two identical bell curves of pin diameter with standard deviation 0.025 mm inside limits of 9.90 and 10.10 mm: one centered on 10.00 with Cpk 1.33, the other shifted 0.06 mm toward the upper limit with Cpk 0.53 and a tail past the limit."
      caption="Same width, so Cp stays 1.33. The shifted pile sits only 0.04 mm from the upper wall, so Cpk falls to 0.53 and a tail of pins misses."
    >
      <path d={b.path(tail) + " Z"} fill={C.alarm} fillOpacity={0.35} stroke="none" />
      <path d={b.path(curve(10))} fill="none" stroke={C.ink} strokeWidth={2} />
      <path d={b.path(curve(10.06))} fill="none" stroke={C.accent} strokeWidth={2.5} />
      {[9.9, 10.1].map((v) => (
        <line key={v} x1={b.px(v)} y1={b.py(0)} x2={b.px(v)} y2={b.y - 8} stroke={C.ink} strokeWidth={2} strokeDasharray="6 4" />
      ))}
      <Label x={b.px(9.9)} y={b.y - 22} size={15}>LSL</Label>
      <Label x={b.px(10.1)} y={b.y - 22} size={15}>USL</Label>
      <Arrow x1={b.px(10)} y1={peak - 10} x2={b.px(10.06)} y2={peak - 10} tone="accent" width={2} />
      <Label x={(b.px(10) + b.px(10.06)) / 2} y={peak - 26} size={15} tone="accent">0.06</Label>
      <line x1={b.x} y1={b.py(0)} x2={b.x + b.w} y2={b.py(0)} stroke={C.ink} strokeWidth={1.5} />
      {[9.9, 10, 10.1].map((v) => (
        <Label key={v} x={b.px(v)} y={b.py(0) + 18} size={15} tone="muted">
          {v.toFixed(2)}
        </Label>
      ))}
      <Label x={b.x + b.w} y={b.py(0) + 44} size={15} tone="muted" anchor="end">diameter (mm)</Label>
      <Label x={b.px(9.9) + 8} y={b.py(12)} size={15} anchor="start">centered</Label>
      <Label x={b.px(9.9) + 8} y={b.py(12) + 20} size={15} anchor="start">Cpk 1.33</Label>
      <Label x={b.px(10.1) + 16} y={b.py(9)} size={15} tone="accent" anchor="start">shifted</Label>
      <Label x={b.px(10.1) + 16} y={b.py(9) + 20} size={15} tone="accent" weight={600} anchor="start">Cpk 0.53</Label>
    </Figure>
  );
}

/** 4.7: three ±0.20 mm blocks, worst case versus root sum square against ±0.50 mm. */
function Stack() {
  const x0 = 150;
  const k = 300 / 0.7; // px per mm of tolerance
  const bar = (y: number, v: number, fill: string, inner: string, lbl: string, tone: "alarm" | "accent") => (
    <g>
      <rect x={x0} y={y} width={v * k} height={30} fill={fill} />
      <text x={x0 + 10} y={y + 16} fill={C.surface} fontSize={15} dominantBaseline="middle">
        {inner}
      </text>
      <Label x={x0 + v * k + 8} y={y + 15} size={15} tone={tone} weight={600} anchor="start">
        {lbl}
      </Label>
    </g>
  );
  const ax = x0 + 0.5 * k;
  return (
    <Figure
      height={270}
      alt="Three blocks each toleranced plus or minus 0.20 mm stacked end to end; below, a worst-case bar of plus or minus 0.60 mm runs past the plus or minus 0.50 mm allowance line, while a root-sum-square bar of plus or minus 0.35 mm stops inside it."
      caption="Worst case promises every stack and misses. RSS fits only because it bets the three errors won't all land long together."
    >
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={90 + i * 100} y={30} width={100} height={46} fill={C.soft} stroke={C.ink} strokeWidth={2} />
          <Label x={140 + i * 100} y={53} size={16}>±0.20</Label>
        </g>
      ))}
      <Label x={140} y={138} anchor="end" size={15}>worst case</Label>
      {bar(123, 0.6, C.alarm, "3 × 0.20", "±0.60", "alarm")}
      <Label x={140} y={188} anchor="end" size={15}>RSS</Label>
      {bar(173, 0.2 * Math.sqrt(3), C.accent, "0.20 × √3", "±0.35", "accent")}
      <line x1={x0} y1={110} x2={x0} y2={218} stroke={C.ink} strokeWidth={1.5} />
      <line x1={ax} y1={104} x2={ax} y2={222} stroke={C.ink} strokeWidth={2} strokeDasharray="6 4" />
      <Label x={ax} y={244} size={15}>allowance ±0.50</Label>
    </Figure>
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
