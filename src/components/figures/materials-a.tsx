import { Arrow, Axes, C, DimH, Figure, Label, plotBox, type FigureMap } from "./kit";

/* ------------------------------------------------------------------ helpers */

/** Deterministic pseudo-random in [0,1) so figures render identically every time. */
function hash(i: number, j: number, seed = 1) {
  const s = Math.sin(i * 127.1 + j * 311.7 + seed * 74.7) * 43758.5453;
  return s - Math.floor(s);
}

/** Abramowitz–Stegun 7.1.26 error function (|error| < 1.5e-7). */
function erf(x: number) {
  const s = Math.sign(x);
  const a = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * a);
  const y =
    1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-a * a);
  return s * y;
}

function sample(f: (x: number) => number, a: number, b: number, n = 80): Array<[number, number]> {
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= n; i++) {
    const x = a + ((b - a) * i) / n;
    pts.push([x, f(x)]);
  }
  return pts;
}

/** Edge dislocation symbol ⊥ centred on (x,y), on a slip plane at y. */
function Disloc({ x, y, tone = "accent", s = 1 }: { x: number; y: number; tone?: "accent" | "ink" | "muted"; s?: number }) {
  return (
    <g stroke={C[tone]} strokeWidth={3} strokeLinecap="round">
      <line x1={x - 9 * s} y1={y} x2={x + 9 * s} y2={y} />
      <line x1={x} y1={y} x2={x} y2={y - 16 * s} />
    </g>
  );
}

/** Jittered-grid "micrograph": n×n grains in a square of side `size`. */
function Grains({ x, y, size, n, seed }: { x: number; y: number; size: number; n: number; seed: number }) {
  const cell = size / n;
  const v = (i: number, j: number): [number, number] => {
    const jx = i === 0 || i === n ? 0 : (hash(i, j, seed) - 0.5) * 0.55 * cell;
    const jy = j === 0 || j === n ? 0 : (hash(j, i, seed + 7) - 0.5) * 0.55 * cell;
    return [x + i * cell + jx, y + j * cell + jy];
  };
  const polys = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const pts = [v(i, j), v(i + 1, j), v(i + 1, j + 1), v(i, j + 1)];
      polys.push(
        <polygon
          key={`${i}-${j}`}
          points={pts.map((p) => p.join(",")).join(" ")}
          fill={C.soft}
          fillOpacity={0.35 + 0.5 * hash(i, j, seed + 3)}
          stroke={C.ink}
          strokeWidth={n > 4 ? 1.2 : 2}
          strokeLinejoin="round"
        />,
      );
    }
  }
  return (
    <g>
      {polys}
      <rect x={x} y={y} width={size} height={size} fill="none" stroke={C.ink} strokeWidth={2} />
    </g>
  );
}

/** Mild-steel engineering curve (1020): E = 200 GPa, yield 350, UTS 420 at ε = 0.20, fracture at 0.36. */
function mildSteel(): Array<[number, number]> {
  const pts: Array<[number, number]> = [
    [0, 0],
    [350 / 200000, 350],
    [0.02, 350],
  ];
  for (let e = 0.03; e <= 0.2001; e += 0.01) pts.push([e, 350 + 70 * (1 - ((0.2 - e) / 0.18) ** 2)]);
  for (let e = 0.22; e <= 0.3601; e += 0.02) pts.push([e, 420 - 50 * ((e - 0.2) / 0.16) ** 2]);
  return pts;
}

/* ------------------------------------------------------------------ week 11 */

/** 11.1: four panels, one per bond, each with what the bond lets move. */
function BondZoo() {
  const panels = [
    { x: 8, y: 8, title: "Metallic", note: "electrons drift" },
    { x: 248, y: 8, title: "Ionic", note: "charges locked" },
    { x: 8, y: 186, title: "Covalent network", note: "pairs shared, directional" },
    { x: 248, y: 186, title: "Secondary", note: "chains weakly held" },
  ];
  const W = 224;
  const H = 166;
  return (
    <Figure
      height={360}
      alt="Four panels: metal ion cores in a sea of free electrons, a lattice of alternating plus and minus ions, atoms joined by directional covalent bonds, and long chains held to each other only by weak dashed links."
      caption="Same question in every panel: what is free to move? Electrons and slip planes in the metal, nothing in the ionic and covalent lattices, whole chains past each other in the polymer."
    >
      {panels.map((p) => (
        <g key={p.title}>
          <rect x={p.x} y={p.y} width={W} height={H} rx={6} fill="none" stroke={C.line} strokeWidth={1.5} />
          <Label x={p.x + W / 2} y={p.y + 20} weight={600}>
            {p.title}
          </Label>
          <Label x={p.x + W / 2} y={p.y + H - 18} tone="accent" size={15}>
            {p.note}
          </Label>
        </g>
      ))}

      {/* metallic: ion cores + free electrons */}
      <g transform="translate(8,8)">
        {[0, 1, 2, 3, 4].flatMap((i) =>
          [0, 1].map((j) => (
            <g key={`m${i}${j}`}>
              <circle cx={36 + i * 38} cy={62 + j * 38} r={12} fill={C.soft} stroke={C.ink} strokeWidth={1.5} />
              <Label x={36 + i * 38} y={63 + j * 38} size={15}>+</Label>
            </g>
          )),
        )}
        {Array.from({ length: 15 }, (_, k) => {
          const i = k % 5;
          const j = Math.floor(k / 5);
          const cx = 17 + i * 38 + (hash(k, 1, 5) - 0.5) * 12 + (j === 1 ? 19 : 0);
          const cy = 43 + j * 38 + (hash(k, 2, 5) - 0.5) * 8;
          return <circle key={`e${k}`} cx={cx} cy={cy} r={3.5} fill={C.accent} />;
        })}
      </g>

      {/* ionic: alternating charges */}
      <g transform="translate(248,8)">
        {[0, 1, 2, 3, 4].flatMap((i) =>
          [0, 1].map((j) => {
            const plus = (i + j) % 2 === 0;
            return (
              <g key={`i${i}${j}`}>
                <circle
                  cx={36 + i * 38}
                  cy={62 + j * 38}
                  r={plus ? 11 : 15}
                  fill={plus ? C.soft : C.surface}
                  stroke={C.ink}
                  strokeWidth={1.5}
                />
                <Label x={36 + i * 38} y={63 + j * 38} size={16}>
                  {plus ? "+" : "−"}
                </Label>
              </g>
            );
          }),
        )}
      </g>

      {/* covalent network: directional bonds on a lattice */}
      <g transform="translate(8,186)">
        {[0, 1, 2, 3, 4].flatMap((i) =>
          [0, 1, 2].map((j) => {
            const cx = 36 + i * 38;
            const cy = 46 + j * 30 + (i % 2 ? 15 : 0);
            return (
              <g key={`c${i}${j}`}>
                {i < 4 && (
                  <line x1={cx} y1={cy} x2={cx + 38} y2={cy + (i % 2 ? -15 : 15)} stroke={C.accent} strokeWidth={2.5} />
                )}
                {j < 2 && <line x1={cx} y1={cy} x2={cx} y2={cy + 30} stroke={C.accent} strokeWidth={2.5} />}
              </g>
            );
          }),
        )}
        {[0, 1, 2, 3, 4].flatMap((i) =>
          [0, 1, 2].map((j) => (
            <circle key={`ca${i}${j}`} cx={36 + i * 38} cy={46 + j * 30 + (i % 2 ? 15 : 0)} r={7} fill={C.surface} stroke={C.ink} strokeWidth={1.5} />
          )),
        )}
      </g>

      {/* secondary: chains with weak links */}
      <g transform="translate(248,186)">
        {[0, 1, 2].map((j) => {
          const y0 = 50 + j * 30;
          const pts = Array.from({ length: 11 }, (_, k) => `${24 + k * 18},${y0 + (k % 2 ? 7 : -7)}`).join(" ");
          return <polyline key={`p${j}`} points={pts} fill="none" stroke={C.ink} strokeWidth={2.5} strokeLinejoin="round" />;
        })}
        {[0, 1].flatMap((j) =>
          [1, 4, 7].map((k) => (
            <line
              key={`w${j}${k}`}
              x1={24 + k * 18 + 9}
              y1={50 + j * 30 + 3}
              x2={24 + k * 18 + 9}
              y2={50 + (j + 1) * 30 - 3}
              stroke={C.accent}
              strokeWidth={2}
              strokeDasharray="3 3"
            />
          )),
        )}
      </g>
    </Figure>
  );
}

/** 11.2: bond-energy wells — depth sets melting, curvature sets stiffness. */
function BondPacks() {
  const b = plotBox({ x: 56, y: 40, w: 390, h: 200, xMin: 0.6, xMax: 3.0, yMin: -1.65, yMax: 0.6 });
  const morse = (D: number, a: number, r0: number) => (r: number) => D * ((1 - Math.exp(-a * (r - r0))) ** 2 - 1);
  const clip = (pts: Array<[number, number]>) => pts.filter(([, u]) => u <= 0.6);
  const deep = clip(sample(morse(1, 3.4, 1.0), 0.78, 3.0, 120));
  const shallow = clip(sample(morse(0.2, 1.7, 1.7), 1.1, 3.0, 120));
  return (
    <Figure
      height={280}
      alt="Bond energy against atomic separation: a deep, narrow well labelled tungsten about 850 kilojoules per mole, and a shallow, wide well labelled secondary bonds 1 to 40 kilojoules per mole."
      caption="One curve, two properties: the well's depth sets how hot it must get to melt, and its steepness at the bottom sets the stiffness. Depths not to scale."
    >
      <Axes box={b} xLabel="atom separation r" yLabel="bond energy" />
      <line x1={b.px(0.6)} y1={b.py(0)} x2={b.px(3)} y2={b.py(0)} stroke={C.muted} strokeWidth={1.5} strokeDasharray="5 5" />
      <Label x={b.px(0.6) - 8} y={b.py(0)} anchor="end" tone="muted" size={15}>0</Label>
      <path d={b.path(shallow)} fill="none" stroke={C.ink} strokeWidth={2.5} />
      <path d={b.path(deep)} fill="none" stroke={C.accent} strokeWidth={3} />
      <Label x={b.px(0.98)} y={b.py(-1.22)} anchor="start" tone="accent" size={15} weight={600}>
        tungsten ~850 kJ/mol
      </Label>
      <Label x={b.px(0.98)} y={b.py(-1.22) + 20} anchor="start" tone="accent" size={15}>
        deep: melts 3422°C, stiff
      </Label>
      <Label x={b.px(1.95)} y={b.py(-0.2) + 22} anchor="start" size={15} weight={600}>
        secondary 1–40 kJ/mol
      </Label>
      <Label x={b.px(1.95)} y={b.py(-0.2) + 42} anchor="start" size={15}>
        shallow: soft, compliant
      </Label>
    </Figure>
  );
}

/** 11.3: the protocol worked on the gray solid — structure → bond → written prediction → check. */
function BondRead() {
  const rows = [
    { step: "structure", text: "4 unlike neighbors, one network" },
    { step: "bond", text: "covalent network: every electron spoken for" },
    { step: "predict", text: "hard · brittle · insulating · very high melting" },
    { step: "check", text: "silicon carbide — prediction holds" },
  ];
  const rowY = (i: number) => 34 + i * 66;
  return (
    <Figure
      height={290}
      alt="A four-step flow down the page: structure (four unlike neighbors in one network), bond (covalent network), written prediction (hard, brittle, insulating, very high melting), and the check (silicon carbide, prediction holds)."
      caption="Write line three before you look at line four — only a committed prediction can miss, and the miss is where the learning is."
    >
      {rows.map((r, i) => (
        <g key={r.step}>
          <rect x={8} y={rowY(i) - 22} width={96} height={44} rx={6} fill={i === 2 ? C.soft : "none"} stroke={i === 2 ? C.accent : C.line} strokeWidth={1.5} />
          <Label x={56} y={rowY(i)} weight={600} tone={i === 2 ? "accent" : "ink"}>
            {r.step}
          </Label>
          <Label x={118} y={rowY(i)} anchor="start" size={i === 2 ? 16 : 15} tone={i === 3 ? "accent" : "ink"} weight={i === 2 ? 600 : undefined}>
            {r.text}
          </Label>
          {i < 3 && <Arrow x1={56} y1={rowY(i) + 23} x2={56} y2={rowY(i + 1) - 24} tone="muted" width={2} />}
        </g>
      ))}
      {/* tiny tetrahedral-network sketch beside the structure row */}
      <g transform="translate(398,12)">
        {[
          [14, 10, 40, 22],
          [40, 22, 66, 10],
          [40, 22, 40, 46],
          [14, 10, 14, -6],
          [66, 10, 66, -6],
        ].map(([a, bb, c, d], k) => (
          <line key={k} x1={a} y1={bb} x2={c} y2={d} stroke={C.accent} strokeWidth={2} />
        ))}
        {[
          [14, 10, true],
          [40, 22, false],
          [66, 10, true],
          [40, 46, true],
        ].map(([cx, cy, dark], k) => (
          <circle key={k} cx={cx as number} cy={cy as number} r={6} fill={dark ? C.ink : C.surface} stroke={C.ink} strokeWidth={1.5} />
        ))}
      </g>
      <Label x={472} y={rowY(2) + 30} anchor="end" tone="muted" size={15}>written before the reveal</Label>
    </Figure>
  );
}

/* ------------------------------------------------------------------ week 12 */

/** 12.1: FCC aluminum cube face, drawn to scale — the face diagonal holds four radii. */
function Crystal() {
  const r = 143;
  const a = 404;
  const s = 190 / a; // px per pm
  const x0 = 36;
  const y0 = 50;
  const A = a * s;
  const R = r * s;
  const atoms: Array<[number, number]> = [
    [x0, y0],
    [x0 + A, y0],
    [x0, y0 + A],
    [x0 + A, y0 + A],
    [x0 + A / 2, y0 + A / 2],
  ];
  return (
    <Figure
      height={300}
      alt="One face of the aluminum FCC unit cell drawn to scale: quarter atoms at the four corners and a whole atom at the face centre touching along the diagonal, with the edge dimensioned 404 picometres and the atom count and density listed beside it."
      caption="Atoms touch along the face diagonal, not the edge — so the diagonal is 4r, the edge is 2√2·r, and the density follows from the count."
    >
      <defs>
        <clipPath id="matA-fcc-face">
          <rect x={x0} y={y0} width={A} height={A} />
        </clipPath>
      </defs>
      <g clipPath="url(#matA-fcc-face)">
        {atoms.map(([cx, cy], k) => (
          <circle key={k} cx={cx} cy={cy} r={R} fill={C.soft} stroke={C.ink} strokeWidth={2} />
        ))}
      </g>
      <rect x={x0} y={y0} width={A} height={A} fill="none" stroke={C.ink} strokeWidth={2} />
      <line x1={x0} y1={y0 + A} x2={x0 + A} y2={y0} stroke={C.accent} strokeWidth={3} />
      {/* tick marks at r, 3r along the diagonal (atom boundaries) */}
      {[R, 3 * R].map((d, k) => {
        const u = d / Math.SQRT2;
        const cx = x0 + u;
        const cy = y0 + A - u;
        return <line key={k} x1={cx - 6} y1={cy - 6} x2={cx + 6} y2={cy + 6} stroke={C.accent} strokeWidth={2.5} />;
      })}
      <Label x={x0 + A / 2} y={24} tone="accent" weight={600}>diagonal = 4r</Label>
      <DimH x1={x0} x2={x0 + A} y={y0 + A + 26} label="a ≈ 404 pm" />

      <g transform="translate(262,0)">
        <Label x={0} y={62} anchor="start" weight={600}>Aluminum, FCC</Label>
        <Label x={0} y={98} anchor="start">r = 143 pm</Label>
        <Label x={0} y={128} anchor="start">a = 2√2·r ≈ 404 pm</Label>
        <Label x={0} y={170} anchor="start" size={15} tone="muted">corners 8 × 1/8 = 1</Label>
        <Label x={0} y={192} anchor="start" size={15} tone="muted">faces 6 × 1/2 = 3</Label>
        <Label x={0} y={218} anchor="start">4 atoms per cell</Label>
        <Label x={0} y={256} anchor="start" tone="accent" size={20} weight={600} serif>
          ρ ≈ 2.70 g/cm³
        </Label>
      </g>
    </Figure>
  );
}

/** 12.2: same steel, two grain sizes, Hall–Petch yield for each. */
function GrainTex() {
  const S = 168;
  return (
    <Figure
      height={290}
      alt="Two square micrograph sketches of the same steel: on the left four large grains, 100 micrometres, yield 150 MPa; on the right sixty-four small grains, 25 micrometres, yield 200 MPa."
      caption="Each boundary is a wall dislocations pile up against. A quarter of the grain size means far more wall per volume — 50 MPa more yield with the chemistry untouched."
    >
      <Grains x={34} y={20} size={S} n={2} seed={3} />
      <Grains x={278} y={20} size={S} n={8} seed={9} />
      <Arrow x1={214} y1={104} x2={266} y2={104} tone="accent" width={3} />
      <Label x={240} y={84} tone="accent" size={15}>refine</Label>

      <Label x={34 + S / 2} y={214}>d = 100 μm</Label>
      <Label x={34 + S / 2} y={240} size={18} weight={600} serif>σy = 150 MPa</Label>
      <Label x={278 + S / 2} y={214}>d = 25 μm</Label>
      <Label x={278 + S / 2} y={240} size={18} weight={600} serif tone="accent">σy = 200 MPa</Label>
      <Label x={240} y={274} tone="muted" size={15}>σy = σ₀ + k/√d,  σ₀ = 100 MPa, k = 0.50 MPa·√m</Label>
    </Figure>
  );
}

/** 12.3: metallic glass vs crystalline steel as springs — stored elastic energy, and how each ends. */
function Disorder() {
  const b = plotBox({ x: 62, y: 36, w: 370, h: 200, xMin: 0, xMax: 3.2, yMin: 0, yMax: 2.4 });
  const glass: Array<[number, number]> = [
    [0, 0],
    [2, 1.9],
  ];
  const steel: Array<[number, number]> = [
    [0, 0],
    [0.75, 1.5],
    [1.2, 1.54],
    [2, 1.58],
    [3.0, 1.6],
  ];
  return (
    <Figure
      height={290}
      alt="Stress against strain for a metallic glass, straight up to 1.9 GPa at 2 percent then dropping to zero, and a crystalline steel, straight to 1.5 GPa at 0.75 percent then yielding along a plateau; shaded triangles mark stored elastic energy of 19 and 5.6 megajoules per cubic metre."
      caption="The glass stores several times more spring energy — then a single shear band ends it without warning. The steel stops springing sooner but yields and keeps going."
    >
      <Axes box={b} xLabel="strain (%)" yLabel="stress (GPa)" />
      <polygon
        points={`${b.px(0)},${b.py(0)} ${b.px(2)},${b.py(1.9)} ${b.px(2)},${b.py(0)}`}
        fill={C.soft}
        fillOpacity={0.8}
      />
      <polygon
        points={`${b.px(0)},${b.py(0)} ${b.px(0.75)},${b.py(1.5)} ${b.px(0.75)},${b.py(0)}`}
        fill={C.muted}
        fillOpacity={0.3}
      />
      <path d={b.path(steel)} fill="none" stroke={C.ink} strokeWidth={2.5} />
      <path d={b.path(glass)} fill="none" stroke={C.accent} strokeWidth={3} />
      <line x1={b.px(2)} y1={b.py(1.9)} x2={b.px(2)} y2={b.py(0)} stroke={C.alarm} strokeWidth={2.5} strokeDasharray="5 4" />
      <Label x={b.px(2) + 8} y={b.py(0.95)} anchor="start" tone="alarm" size={15}>one shear band</Label>

      <Label x={b.px(2) - 10} y={b.py(1.9) - 2} anchor="end" tone="accent" size={15} weight={600}>metallic glass</Label>
      <Label x={b.px(3.15)} y={b.py(1.6) + 20} anchor="end" size={15}>steel yields</Label>
      <line x1={b.x} y1={b.py(1.9)} x2={b.px(2)} y2={b.py(1.9)} stroke={C.line} strokeWidth={1} strokeDasharray="4 4" />
      <line x1={b.x} y1={b.py(1.5)} x2={b.px(0.75)} y2={b.py(1.5)} stroke={C.line} strokeWidth={1} strokeDasharray="4 4" />
      <Label x={b.x - 8} y={b.py(1.9)} anchor="end" size={15} tone="accent">1.9</Label>
      <Label x={b.x - 8} y={b.py(1.5)} anchor="end" size={15}>1.5</Label>

      <Label x={b.px(1.5)} y={b.py(0.3)} tone="accent" size={16} weight={600}>19 MJ/m³</Label>
      <Arrow x1={b.px(0.3)} y1={b.py(1.12)} x2={b.px(0.58)} y2={b.py(0.62)} tone="muted" width={1.5} />
      <Label x={b.px(0.3)} y={b.py(1.12) - 12} size={15}>5.6</Label>
      <Label x={b.px(0.75)} y={b.y + b.h + 16} size={15}>0.75</Label>
      <Label x={b.px(2)} y={b.y + b.h + 16} tone="accent" size={15}>2</Label>
    </Figure>
  );
}

/* ------------------------------------------------------------------ week 13 */

/** 13.1: copper equilibrium vacancy fraction, log scale, 300 K → 1000 K. */
function Defects() {
  const k = 8.617e-5;
  const Qv = 0.9;
  const lg = (T: number) => -Qv / (k * T) / Math.LN10;
  const b = plotBox({ x: 76, y: 36, w: 350, h: 200, xMin: 300, xMax: 1000, yMin: -16, yMax: -4 });
  const pts = sample(lg, 300, 1000, 100);
  const p300: [number, number] = [300, lg(300)];
  const p1000: [number, number] = [1000, lg(1000)];
  return (
    <Figure
      height={290}
      alt="Copper's equilibrium vacancy fraction on a logarithmic axis against temperature, rising from 7.6 times ten to the minus 16 at 300 kelvin to 2.9 times ten to the minus 5 at 1000 kelvin."
      caption="n/N = exp(−Qv/kT) is exponential in temperature: 700 K of heating moves the vacancy population about ten orders of magnitude — and a quench freezes the hot value in."
    >
      <Axes box={b} xLabel="" yLabel="vacant fraction n/N" />
      <Label x={b.x + b.w + 18} y={b.y + b.h} anchor="start" tone="muted" size={15}>K</Label>
      {[-4, -8, -12, -16].map((e) => (
        <g key={e}>
          <line x1={b.px(300)} y1={b.py(e)} x2={b.px(1000)} y2={b.py(e)} stroke={C.line} strokeWidth={1} />
          <Label x={b.x - 8} y={b.py(e)} anchor="end" tone="muted" size={15}>
            {`10${e === -4 ? "⁻⁴" : e === -8 ? "⁻⁸" : e === -12 ? "⁻¹²" : "⁻¹⁶"}`}
          </Label>
        </g>
      ))}
      <path d={b.path(pts)} fill="none" stroke={C.accent} strokeWidth={3} />
      <circle cx={b.px(p300[0])} cy={b.py(p300[1])} r={5} fill={C.ink} />
      <circle cx={b.px(p1000[0])} cy={b.py(p1000[1])} r={5} fill={C.accent} />
      <Label x={b.px(300) + 12} y={b.py(p300[1]) - 16} anchor="start" size={15}>300 K: 7.6×10⁻¹⁶</Label>
      <Label x={b.px(1000) - 12} y={b.py(p1000[1]) - 20} anchor="end" size={15} tone="accent" weight={600}>
        1000 K: 2.9×10⁻⁵
      </Label>
      <Label x={b.px(760)} y={b.py(-13)} size={15} tone="muted">Cu, Qv ≈ 0.9 eV</Label>
      <Label x={b.px(300)} y={b.y + b.h + 16} tone="muted" size={15}>300</Label>
      <Label x={b.px(1000)} y={b.y + b.h + 16} tone="muted" size={15}>1000</Label>
    </Figure>
  );
}

/** 13.2: carburizing profile at 950 °C, 4 h — the 0.4 wt% contour sits at 0.69 mm. */
function Diffusion() {
  const Cs = 1.1;
  const C0 = 0.2;
  const L = 0.8; // 2√(Dt) in mm
  const conc = (x: number) => Cs - (Cs - C0) * erf(x / L);
  const b = plotBox({ x: 70, y: 40, w: 370, h: 190, xMin: 0, xMax: 2, yMin: 0, yMax: 1.25 });
  const xd = 0.69;
  return (
    <Figure
      height={290}
      alt="Carbon concentration against depth into a steel gear at 950 degrees Celsius after 4 hours: an error-function curve falling from 1.1 weight percent at the surface to 0.2 in the core, crossing 0.4 weight percent at 0.69 millimetres."
      caption="The profile's length scale is 2√(Dt) = 0.80 mm, so case depth grows only as the square root of time — twice as deep costs four times the hours."
    >
      <Axes box={b} xLabel="depth x (mm)" yLabel="carbon (wt%)" />
      <line x1={b.px(0)} y1={b.py(C0)} x2={b.px(2)} y2={b.py(C0)} stroke={C.muted} strokeWidth={1.5} strokeDasharray="5 5" />
      <line x1={b.px(0)} y1={b.py(0.4)} x2={b.px(xd)} y2={b.py(0.4)} stroke={C.accent} strokeWidth={1.5} strokeDasharray="5 4" />
      <line x1={b.px(xd)} y1={b.py(0.4)} x2={b.px(xd)} y2={b.py(0)} stroke={C.accent} strokeWidth={1.5} strokeDasharray="5 4" />
      <path d={b.path(sample(conc, 0, 2, 100))} fill="none" stroke={C.ink} strokeWidth={3} />
      <circle cx={b.px(xd)} cy={b.py(0.4)} r={5} fill={C.accent} />

      <Label x={b.x - 8} y={b.py(Cs)} anchor="end" size={15}>1.1</Label>
      <Label x={b.x - 8} y={b.py(0.4)} anchor="end" size={15} tone="accent">0.4</Label>
      <Label x={b.x - 8} y={b.py(C0) + 4} anchor="end" size={15} tone="muted">0.2</Label>
      <Label x={b.px(xd)} y={b.y + b.h + 16} tone="accent" size={15} weight={600}>0.69</Label>
      <Label x={b.px(2)} y={b.py(C0) - 14} anchor="end" tone="muted" size={15}>core C₀</Label>
      <Label x={b.px(0.12)} y={b.py(Cs) - 12} anchor="start" size={15}>surface Cs</Label>
      <Label x={b.px(1.95)} y={b.py(0.9)} anchor="end" tone="accent" size={16} weight={600}>950 °C, 4 h</Label>
      <Label x={b.px(xd) + 10} y={b.py(0.4) - 18} anchor="start" size={15}>case edge</Label>
    </Figure>
  );
}

/** A small temperature-vs-time path for one thermal history. */
function ThermalRow({
  y,
  path,
  title,
  result,
  note,
  tone,
  marks,
}: {
  y: number;
  path: Array<[number, number]>;
  title: string;
  result: string;
  note: string;
  tone: "ink" | "accent" | "alarm";
  marks?: Array<{ t: number; T: number; text: string }>;
}) {
  const b = plotBox({ x: 30, y, w: 230, h: 62, xMin: 0, xMax: 10, yMin: 0, yMax: 900 });
  return (
    <g>
      <line x1={b.x} y1={b.y + b.h} x2={b.x + b.w} y2={b.y + b.h} stroke={C.muted} strokeWidth={1.5} />
      <line x1={b.x} y1={b.y - 6} x2={b.x} y2={b.y + b.h} stroke={C.muted} strokeWidth={1.5} />
      <path d={b.path(path)} fill="none" stroke={C[tone]} strokeWidth={3} strokeLinejoin="round" />
      {marks?.map((m) => (
        <Label key={m.text} x={b.px(m.t)} y={b.py(m.T) - 12} size={15} tone="muted">
          {m.text}
        </Label>
      ))}
      <Label x={290} y={y + 16} anchor="start" weight={600}>{title}</Label>
      <Label x={290} y={y + 42} anchor="start" size={19} tone={tone === "ink" ? "ink" : tone} serif weight={600}>
        {result}
      </Label>
      <Label x={472} y={y + 42} anchor="end" size={15} tone="muted">{note}</Label>
    </g>
  );
}

/** 13.3: 4140, three thermal histories, three hardnesses. */
function HeatTreatW13() {
  const slow: Array<[number, number]> = [[0, 850], [3, 850]];
  for (let t = 3; t <= 10.001; t += 0.25) slow.push([t, 30 + 820 * Math.exp(-(t - 3) / 2)]);
  return (
    <Figure
      height={300}
      alt="Three small temperature-time sketches for 4140 steel: a slow cool giving about 200 HB, a quench from 850 degrees Celsius giving about 58 HRC, and a quench followed by a 400 degree temper giving about 42 HRC."
      caption="Same chemistry in all three rows. Only the thermal path differs — and the hardness goes from machinable to glass-scratching to the working compromise."
    >
      <ThermalRow y={30} path={slow} title="Annealed" result="~200 HB" note="soft baseline" tone="ink" />
      <ThermalRow
        y={126}
        path={[[0, 850], [3, 850], [3.3, 30], [10, 30]]}
        title="Quenched"
        result="~58 HRC"
        note="brittle"
        tone="alarm"
        marks={[{ t: 1.5, T: 850, text: "850 °C" }]}
      />
      <ThermalRow
        y={222}
        path={[[0, 850], [3, 850], [3.3, 30], [4.6, 30], [5.2, 400], [8, 400], [8.6, 30], [10, 30]]}
        title="Quench + temper"
        result="~42 HRC"
        note="tough"
        tone="accent"
        marks={[{ t: 6.6, T: 400, text: "400 °C" }]}
      />
    </Figure>
  );
}

/* ------------------------------------------------------------------ week 14 */

/** 14.1: 1020 steel curve with its three landmarks. */
function ReadCurve() {
  const b = plotBox({ x: 60, y: 40, w: 380, h: 200, xMin: -0.012, xMax: 0.4, yMin: 0, yMax: 480 });
  const pts = mildSteel();
  const end = pts[pts.length - 1];
  return (
    <Figure
      height={290}
      alt="Engineering stress-strain curve for 1020 steel: a near-vertical elastic line of slope 200 GPa, yield at 350 MPa, a peak of 420 MPa, then a fall to fracture."
      caption="Three landmarks, three properties: the slope is stiffness, the knee is where it stops springing back, the peak is the most it ever carried."
    >
      <Axes box={b} xLabel="strain ε" yLabel="stress σ (MPa)" />
      {[350, 420].map((v) => (
        <line key={v} x1={b.x} y1={b.py(v)} x2={b.px(0.2)} y2={b.py(v)} stroke={C.line} strokeWidth={1.5} strokeDasharray="4 4" />
      ))}
      <path d={b.path(pts)} fill="none" stroke={C.ink} strokeWidth={3} strokeLinejoin="round" />
      <circle cx={b.px(350 / 200000)} cy={b.py(350)} r={5} fill={C.accent} />
      <circle cx={b.px(0.2)} cy={b.py(420)} r={5} fill={C.accent} />
      <g stroke={C.alarm} strokeWidth={2.5}>
        <line x1={b.px(end[0]) - 6} y1={b.py(end[1]) - 6} x2={b.px(end[0]) + 6} y2={b.py(end[1]) + 6} />
        <line x1={b.px(end[0]) - 6} y1={b.py(end[1]) + 6} x2={b.px(end[0]) + 6} y2={b.py(end[1]) - 6} />
      </g>

      <Label x={b.x - 8} y={b.py(350)} anchor="end" size={15} tone="accent">350</Label>
      <Label x={b.x - 8} y={b.py(420)} anchor="end" size={15} tone="accent">420</Label>
      <Label x={b.px(0.07)} y={b.py(350) + 22} anchor="start" size={15} tone="accent" weight={600}>yield σy = 350 MPa</Label>
      <Label x={b.px(0.2)} y={b.py(420) - 18} size={15} tone="accent" weight={600}>peak σuts = 420 MPa</Label>
      <Label x={b.px(end[0])} y={b.py(end[1]) - 20} tone="alarm" size={15}>fracture</Label>
      <Arrow x1={b.px(0.07)} y1={b.py(180)} x2={b.px(0.004)} y2={b.py(180)} tone="accent" width={2} />
      <Label x={b.px(0.075)} y={b.py(180)} anchor="start" size={15} tone="accent" weight={600}>slope E = 200 GPa</Label>
    </Figure>
  );
}

/** 14.2: tall thin spike vs long broad curve — toughness is the area. */
function ToughDuct() {
  const b = plotBox({ x: 64, y: 40, w: 376, h: 200, xMin: 0, xMax: 0.4, yMin: 0, yMax: 1700 });
  const mild = mildSteel();
  const hs: Array<[number, number]> = [[0, 0], [0.0065, 1300]];
  for (let e = 0.009; e <= 0.0301; e += 0.003) hs.push([e, 1300 + 200 * Math.sqrt((e - 0.0065) / 0.0235)]);
  const area = (pts: Array<[number, number]>) => {
    const last = pts[pts.length - 1];
    return `${b.path(pts)} L${b.px(last[0]).toFixed(1)},${b.py(0).toFixed(1)} Z`;
  };
  return (
    <Figure
      height={290}
      alt="Stress-strain curves for two steels on one set of axes: high-strength steel rises steeply to 1500 MPa and breaks at 3 percent, enclosing about 40 megajoules per cubic metre; mild steel yields at 350 MPa and stretches to 36 percent, enclosing about 140."
      caption="Toughness is the shaded area, not the height. The low, wide curve absorbs over three times the energy of the tall spike."
    >
      <Axes box={b} xLabel="strain ε" yLabel="stress (MPa)" />
      <path d={area(mild)} fill={C.soft} fillOpacity={0.9} />
      <path d={area(hs)} fill={C.alarm} fillOpacity={0.2} />
      <path d={b.path(mild)} fill="none" stroke={C.accent} strokeWidth={3} />
      <path d={b.path(hs)} fill="none" stroke={C.alarm} strokeWidth={3} />

      <Label x={b.px(0.03) + 10} y={b.py(1500) + 2} anchor="start" size={15} tone="alarm" weight={600}>high-strength: 1500 MPa, 3%</Label>
      <Arrow x1={b.px(0.09)} y1={b.py(900)} x2={b.px(0.022)} y2={b.py(800)} tone="alarm" width={1.5} />
      <Label x={b.px(0.095)} y={b.py(900)} anchor="start" size={16} tone="alarm" weight={600}>≈ 40 MJ/m³</Label>
      <Label x={b.px(0.36)} y={b.py(420) - 20} anchor="end" size={15} tone="accent" weight={600}>mild: 350 MPa, 36%</Label>
      <Label x={b.px(0.2)} y={b.py(180)} size={17} tone="accent" weight={600}>≈ 140 MJ/m³</Label>
          </Figure>
  );
}

/** 14.3: three Ti-6Al-4V specimens → characteristic value → allowable. */
function Allowables() {
  const zx = (v: number) => 40 + ((v - 860) / 30) * 400;
  const fx = (v: number) => 40 + (v / 900) * 400;
  const zy = 70;
  return (
    <Figure
      height={300}
      alt="Top: a zoomed axis from 860 to 890 MPa with three yield readings at 872, 879 and 885, the mean 879 and a characteristic value 866 two standard deviations lower. Bottom: full-scale bars showing the characteristic 866 MPa divided by a factor of safety of 1.5 to give an allowable of 577 MPa."
      caption="Scatter costs only 13 MPa here; the factor of safety costs almost 300. None of that gap is on the curve."
    >
      {/* zoomed strip */}
      <line x1={40} y1={zy} x2={440} y2={zy} stroke={C.ink} strokeWidth={1.5} />
      {[860, 870, 880, 890].map((v) => (
        <g key={v}>
          <line x1={zx(v)} y1={zy - 5} x2={zx(v)} y2={zy + 5} stroke={C.muted} strokeWidth={1.5} />
          <Label x={zx(v)} y={zy + 20} tone="muted" size={15}>{v}</Label>
        </g>
      ))}
      {[872, 879, 885].map((v) => (
        <circle key={v} cx={zx(v)} cy={zy - 16} r={6} fill={C.ink} />
      ))}
      <Label x={zx(878.5)} y={zy - 44} size={15}>specimens 872 · 879 · 885</Label>
      <line x1={zx(879)} y1={zy - 26} x2={zx(879)} y2={zy + 8} stroke={C.ink} strokeWidth={2} strokeDasharray="3 3" />
      <Arrow x1={zx(879)} y1={zy + 40} x2={zx(866)} y2={zy + 40} tone="accent" width={2} />
      <Label x={zx(879) + 8} y={zy + 40} anchor="start" size={15}>mean − 2s</Label>
      <circle cx={zx(866)} cy={zy} r={6} fill={C.accent} />
      <Label x={zx(866)} y={zy + 60} tone="accent" size={15} weight={600}>866</Label>

      {/* zoom connector */}
      <line x1={zx(866)} y1={zy + 70} x2={fx(866)} y2={170} stroke={C.line} strokeWidth={1.5} strokeDasharray="4 4" />

      {/* full scale */}
      <rect x={fx(0)} y={172} width={fx(866) - fx(0)} height={30} fill={C.line} fillOpacity={0.6} stroke={C.ink} strokeWidth={1.5} />
      <Label x={fx(0) + 10} y={187} anchor="start" size={15}>characteristic 866 MPa</Label>
      <rect x={fx(0)} y={222} width={fx(577) - fx(0)} height={30} fill={C.soft} stroke={C.accent} strokeWidth={2} />
      <Label x={fx(0) + 10} y={237} anchor="start" size={15} tone="accent" weight={600}>allowable 577 MPa</Label>
      <Arrow x1={fx(866) - 4} y1={206} x2={fx(577) + 6} y2={234} tone="accent" width={2} />
      <Label x={fx(740)} y={246} tone="accent" size={16} weight={600}>÷ 1.5</Label>
      <line x1={fx(0)} y1={266} x2={fx(900)} y2={266} stroke={C.ink} strokeWidth={1.5} />
      {[0, 300, 600, 900].map((v) => (
        <g key={v}>
          <line x1={fx(v)} y1={262} x2={fx(v)} y2={270} stroke={C.muted} strokeWidth={1.5} />
          <Label x={fx(v)} y={284} tone="muted" size={15}>{v}</Label>
        </g>
      ))}
    </Figure>
  );
}

/* ------------------------------------------------------------------ week 15 */

/** 15.1: one slip plane, four kinds of obstacle, each with its price. */
function Strengthen() {
  const rows = ["grain boundaries", "tangled dislocations", "solute atoms", "precipitates"];
  const prices = ["ductility barely touched", "ductility collapses", "alloy cost, √c returns", "furnace schedule, overaging"];
  const ry = (i: number) => 40 + i * 72;
  return (
    <Figure
      height={310}
      alt="Four rows, each a slip plane with an edge dislocation moving right toward an obstacle: a grain boundary, a tangle of other dislocations, scattered solute atoms, and precipitate particles it must bow between; each row names the obstacle and its price."
      caption="Strength is friction against dislocation motion. Every mechanism installs a different obstacle in the slip plane — and charges a different price."
    >
      {rows.map((name, i) => {
        const y = ry(i);
        return (
          <g key={name}>
            <line x1={20} y1={y} x2={236} y2={y} stroke={C.muted} strokeWidth={1.5} strokeDasharray="6 5" />
            <Disloc x={40} y={y} />
            <Arrow x1={58} y1={y - 8} x2={104} y2={y - 8} tone="accent" width={2} />
            <Label x={256} y={y - 10} anchor="start" weight={600} size={16}>{name}</Label>
            <Label x={256} y={y + 12} anchor="start" size={15} tone="muted">{prices[i]}</Label>
          </g>
        );
      })}
      {/* grain boundary */}
      <polyline
        points={`176,${ry(0) - 28} 170,${ry(0) - 12} 178,${ry(0)} 172,${ry(0) + 14} 179,${ry(0) + 28}`}
        fill="none"
        stroke={C.ink}
        strokeWidth={3}
      />
      {/* forest of dislocations */}
      {[
        [150, 6, 0],
        [172, -12, 90],
        [192, 10, 200],
        [210, -6, 45],
        [168, 22, 270],
        [200, -24, 150],
      ].map(([x, dy, rot], k) => (
        <g key={k} transform={`rotate(${rot} ${x} ${ry(1) + dy})`}>
          <Disloc x={x} y={ry(1) + dy + 8} tone="ink" s={0.7} />
        </g>
      ))}
      {/* solute atoms */}
      {[140, 160, 178, 196, 216].map((x, k) => (
        <circle key={k} cx={x} cy={ry(2) + (k % 2 ? -4 : 4)} r={5} fill={C.brass} stroke={C.ink} strokeWidth={1} />
      ))}
      {/* precipitates with bowing line */}
      <circle cx={170} cy={ry(3) - 25} r={9} fill={C.ink} />
      <circle cx={170} cy={ry(3) + 25} r={9} fill={C.ink} />
      <path
        d={`M 170 ${ry(3) - 16} Q 196 ${ry(3)} 170 ${ry(3) + 16}`}
        fill="none"
        stroke={C.accent}
        strokeWidth={2.5}
      />
      <Label x={206} y={ry(3) + 2} size={15} tone="accent">bows</Label>
    </Figure>
  );
}

/** 15.2: annealing a cold-worked metal — strength against time, three acts. */
function HeatTreatW15() {
  const b = plotBox({ x: 60, y: 56, w: 390, h: 176, xMin: 0, xMax: 10, yMin: 0, yMax: 1.1 });
  const f = (t: number) => {
    const rec = 1 - 0.07 * (1 - Math.exp(-t / 0.8));
    const rex = 0.47 / (1 + Math.exp(-(t - 3.5) / 0.35));
    const gg = t > 5 ? 0.1 * (1 - 1 / Math.sqrt(1 + (t - 5) / 1.2)) : 0;
    return rec - rex - gg;
  };
  const pts = sample(f, 0, 10, 160);
  const zones = [
    { a: 0, z: 2, name: "recovery" },
    { a: 2, z: 5, name: "recrystallization" },
    { a: 5, z: 10, name: "grain growth" },
  ];
  return (
    <Figure
      height={290}
      alt="Yield strength of a cold-worked metal against annealing time in three zones: recovery with a slight dip, recrystallization with a steep fall, and grain growth with a slow further drift down."
      caption="Most of the softening happens in recrystallization, when strain-free grains replace the worked ones. Grain growth then quietly lowers the yield further — Hall-Petch in reverse."
    >
      {zones.map((z, i) => (
        <g key={z.name}>
          {i > 0 && (
            <line x1={b.px(z.a)} y1={b.y - 20} x2={b.px(z.a)} y2={b.y + b.h} stroke={C.line} strokeWidth={1.5} strokeDasharray="4 4" />
          )}
          <Label x={b.px((z.a + z.z) / 2)} y={b.y - 34} size={15} tone={i === 1 ? "accent" : "ink"} weight={i === 1 ? 600 : undefined}>
            {z.name}
          </Label>
        </g>
      ))}
      <Axes box={b} xLabel="anneal time" yLabel="" />
      <Label x={b.x - 8} y={b.y + b.h / 2} anchor="end" tone="muted" size={15}>yield</Label>
      <path d={b.path(pts)} fill="none" stroke={C.accent} strokeWidth={3} />
      <circle cx={b.px(0)} cy={b.py(f(0))} r={5} fill={C.ink} />
      <Label x={b.px(0) + 10} y={b.py(f(0)) - 16} anchor="start" size={15}>cold-worked</Label>
      <Label x={b.px(9.8)} y={b.py(f(9.8)) - 18} anchor="end" size={15}>coarse grains, soft</Label>
    </Figure>
  );
}

/** 15.3: screen the candidates against the 800 MPa floor before ranking. */
function ProcessChoice() {
  const px = (v: number) => 130 + (v / 1300) * 300;
  const rows = [
    { name: "CW 1045", sub: "", v: 560, tag: "560 out", tone: "muted" as const },
    { name: "aged 2024", sub: "", v: 345, tag: "345 out", tone: "muted" as const },
    { name: "Q&T 1045", sub: "1.9× cost", v: 850, tag: "850 · 12%", tone: "ink" as const },
    { name: "Q&T 4140", sub: "2.3× cost", v: 1300, tag: "1300 · 11% ✓", tone: "accent" as const },
  ];
  const ry = (i: number) => 56 + i * 58;
  return (
    <Figure
      height={290}
      alt="Horizontal bars of yield strength for four alloy-route pairs against a dashed 800 MPa floor: cold-worked 1045 at 560 and aged 2024 at 345 fall short and are out; quenched-and-tempered 1045 at 850 and 12 percent and quenched-and-tempered 4140 at 1300 and 11 percent clear it."
      caption="The floor is a guillotine: two candidates are out before ranking starts. Of the survivors, 4140 costs more but carries a 1.6 margin instead of 1.06."
    >
      <line x1={px(800)} y1={26} x2={px(800)} y2={260} stroke={C.alarm} strokeWidth={2} strokeDasharray="6 5" />
      <Label x={px(800)} y={16} tone="alarm" size={15} weight={600}>800 MPa floor</Label>
      {rows.map((r, i) => (
        <g key={r.name}>
          <Label x={10} y={ry(i) - (r.sub ? 8 : 0)} anchor="start" size={16} weight={600} tone={r.tone === "muted" ? "muted" : "ink"}>
            {r.name}
          </Label>
          {r.sub && (
            <Label x={10} y={ry(i) + 12} anchor="start" size={15} tone="muted">
              {r.sub}
            </Label>
          )}
          <rect
            x={px(0)}
            y={ry(i) - 14}
            width={px(r.v) - px(0)}
            height={28}
            rx={3}
            fill={r.tone === "accent" ? C.soft : r.tone === "ink" ? C.line : "none"}
            stroke={C[r.tone]}
            strokeWidth={r.tone === "accent" ? 2.5 : 1.5}
            strokeDasharray={r.tone === "muted" ? "4 3" : undefined}
          />
          {r.tone === "ink" ? (
            <Label x={px(r.v) + 8} y={ry(i)} anchor="start" size={15}>
              {r.tag}
            </Label>
          ) : (
            <Label x={px(r.v) - 8} y={ry(i)} anchor="end" size={15} tone={r.tone} weight={r.tone === "accent" ? 600 : undefined}>
              {r.tag}
            </Label>
          )}
        </g>
      ))}
      <Label x={px(0)} y={276} anchor="start" tone="muted" size={15}>yield strength (MPa) · elongation floor 10%</Label>
    </Figure>
  );
}

export const materialsAFigures: FigureMap = {
  "materials/bondzoo": BondZoo,
  "materials/bondpacks": BondPacks,
  "materials/bondread": BondRead,
  "materials/crystal": Crystal,
  "materials/graintex": GrainTex,
  "materials/disorder": Disorder,
  "materials/defects": Defects,
  "materials/diffusion": Diffusion,
  "materials/heat-treat": HeatTreatW13,
  "materials/readcurve": ReadCurve,
  "materials/toughduct": ToughDuct,
  "materials/allowables": Allowables,
  "materials/strengthen": Strengthen,
  "materials/heattreat": HeatTreatW15,
  "materials/processchoice": ProcessChoice,
};
