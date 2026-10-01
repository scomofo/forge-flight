import { Axes, C, DimH, Label, plotBox, type FigureMap } from "./kit";
import { AnimatedFigure, clamp, GrowArrow, lerp, op, partial, Reveal, seg } from "./motion";

/* ------------------------------------------------------------------ helpers */

/** Deterministic pseudo-random in [0,1) so figures render identically every time. */
function hash(i: number, j: number, seed = 1) {
  const s = Math.sin(i * 127.1 + j * 311.7 + seed * 74.7) * 43758.5453;
  // Rounded: the server's and the browser's Math.sin can differ in the last
  // bits, which this amplifies into attribute mismatches on hydration.
  return Math.round((s - Math.floor(s)) * 1e6) / 1e6;
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

/** The part of a polyline (x increasing) left of x, ending on the interpolated point; the array itself once x reaches its end. */
function upTo(pts: Array<[number, number]>, x: number): Array<[number, number]> {
  if (x >= pts[pts.length - 1][0]) return pts;
  if (x <= pts[0][0]) return pts.slice(0, 1);
  let i = 1;
  while (pts[i][0] < x) i++;
  const [x0, y0] = pts[i - 1];
  const [x1, y1] = pts[i];
  return [...pts.slice(0, i), [x, y0 + ((y1 - y0) * (x - x0)) / (x1 - x0)]];
}

/** A plotted polyline traced at an even pen speed: `at(s)` is its first s px on screen, and the array itself once s reaches `len`. */
function tracer(b: { px: (v: number) => number; py: (v: number) => number }, pts: Array<[number, number]>) {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(b.px(pts[i][0]) - b.px(pts[i - 1][0]), b.py(pts[i][1]) - b.py(pts[i - 1][1])));
  }
  const len = cum[cum.length - 1];
  const at = (s: number): Array<[number, number]> => {
    if (s >= len) return pts;
    if (s <= 0) return pts.slice(0, 1);
    let i = 1;
    while (cum[i] < s) i++;
    const q = (s - cum[i - 1]) / (cum[i] - cum[i - 1]);
    return [...pts.slice(0, i), [lerp(pts[i - 1][0], pts[i][0], q), lerp(pts[i - 1][1], pts[i][1], q)]];
  };
  return { cum, len, at };
}

/** Edge dislocation symbol ⊥ centred on (x,y), on a slip plane at y. */
function Disloc({
  x,
  y,
  tone = "accent",
  s = 1,
  opacity,
}: {
  x: number;
  y: number;
  tone?: "accent" | "ink" | "muted";
  s?: number;
  opacity?: number;
}) {
  return (
    <g stroke={C[tone]} strokeWidth={3} strokeLinecap="round" opacity={opacity}>
      <line x1={x - 9 * s} y1={y} x2={x + 9 * s} y2={y} />
      <line x1={x} y1={y} x2={x} y2={y - 16 * s} />
    </g>
  );
}

/** Jittered-grid "micrograph": n×n grains in a square of side `size`. */
function Grains({ x, y, size, n, seed, opacity }: { x: number; y: number; size: number; n: number; seed: number; opacity?: number }) {
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
    <g opacity={opacity}>
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
  const noteAt = [1.3, 2.4, 3.4, 5.2]; // each panel's answer to "what moves?"
  return (
    <AnimatedFigure
      height={360}
      duration={6}
      alt="Four panels: metal ion cores in a sea of free electrons, a lattice of alternating plus and minus ions, atoms joined by directional covalent bonds, and long chains held to each other only by weak dashed links."
      steps={[
        {
          at: 0,
          label: "Metallic",
          caption: "Metallic: the valence electrons are a sea shared by the whole lattice, free to drift and carry current.",
        },
        {
          at: 1.9,
          label: "Ionic, covalent",
          caption: "Ionic charges are locked in their lattice and covalent pairs are shared and directional: no electron is free to move.",
        },
        {
          at: 4,
          label: "Secondary",
          caption: "Secondary: the strong bonds are internal to chains that barely hold each other, so whole chains can slide.",
        },
        {
          at: 5.7,
          label: "What moves",
          caption:
            "Same question in every panel: what is free to move? Electrons and slip planes in the metal, nothing in the ionic and covalent lattices, whole chains past each other in the polymer.",
        },
      ]}
    >
      {({ t }) => {
        const ions = op(seg(t, 0.3, 0.8));
        const sea = op(seg(t, 0.5, 1));
        const drift = 14 * (1 - seg(t, 0.5, 1.8)); // the electron sea drifts right past the fixed cores
        const salt = op(seg(t, 2, 2.5));
        const atoms = op(seg(t, 2.8, 3.3));
        const bonds = op(seg(t, 3.05, 3.55));
        const chains = op(seg(t, 4.1, 4.6));
        const slide = 18 * (1 - seg(t, 4.1, 5.2)); // the middle chain slides past its neighbours
        const links = op(seg(t, 4.9, 5.4));
        return (
          <>
            {panels.map((p, i) => (
              <g key={p.title}>
                <rect x={p.x} y={p.y} width={W} height={H} rx={6} fill="none" stroke={C.line} strokeWidth={1.5} />
                <Label x={p.x + W / 2} y={p.y + 20} weight={600}>
                  {p.title}
                </Label>
                <Label x={p.x + W / 2} y={p.y + H - 18} tone="accent" size={15} opacity={op(seg(t, noteAt[i], noteAt[i] + 0.5))}>
                  {p.note}
                </Label>
              </g>
            ))}

            {/* metallic: ion cores + free electrons */}
            <g transform="translate(8,8)">
              {[0, 1, 2, 3, 4].flatMap((i) =>
                [0, 1].map((j) => (
                  <g key={`m${i}${j}`} opacity={ions}>
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
                return <circle key={`e${k}`} cx={cx - drift} cy={cy} r={3.5} fill={C.accent} opacity={sea} />;
              })}
            </g>

            {/* ionic: alternating charges */}
            <g transform="translate(248,8)">
              {[0, 1, 2, 3, 4].flatMap((i) =>
                [0, 1].map((j) => {
                  const plus = (i + j) % 2 === 0;
                  return (
                    <g key={`i${i}${j}`} opacity={salt}>
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
                    <g key={`c${i}${j}`} opacity={bonds}>
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
                  <circle key={`ca${i}${j}`} cx={36 + i * 38} cy={46 + j * 30 + (i % 2 ? 15 : 0)} r={7} fill={C.surface} stroke={C.ink} strokeWidth={1.5} opacity={atoms} />
                )),
              )}
            </g>

            {/* secondary: chains with weak links */}
            <g transform="translate(248,186)">
              {[0, 1, 2].map((j) => {
                const y0 = 50 + j * 30;
                const dx = j === 1 ? -slide : 0;
                const pts = Array.from({ length: 11 }, (_, k) => `${24 + k * 18 + dx},${y0 + (k % 2 ? 7 : -7)}`).join(" ");
                return <polyline key={`p${j}`} points={pts} fill="none" stroke={C.ink} strokeWidth={2.5} strokeLinejoin="round" opacity={chains} />;
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
                    opacity={links}
                  />
                )),
              )}
            </g>
          </>
        );
      }}
    </AnimatedFigure>
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
    <AnimatedFigure
      height={280}
      duration={4.5}
      alt="Bond energy against atomic separation: a deep, narrow well labelled tungsten about 850 kilojoules per mole, and a shallow, wide well labelled secondary bonds 1 to 40 kilojoules per mole."
      steps={[
        {
          at: 0,
          label: "Deep well",
          caption: "Tungsten's metallic bond is a very deep well, about 850 kJ/mol: breaking it takes enormous heat, so it melts at 3422°C.",
        },
        {
          at: 2.3,
          label: "Shallow well",
          caption: "Secondary bonds are shallow wells of 1–40 kJ/mol, so polymers are compliant at room temperature.",
        },
        {
          at: 4.1,
          label: "Compare",
          caption:
            "One curve, two properties: the well's depth sets how hot it must get to melt, and its steepness at the bottom sets the stiffness. Depths not to scale.",
        },
      ]}
    >
      {({ t }) => (
        <>
          <Axes box={b} xLabel="atom separation r" yLabel="bond energy" />
          <line x1={b.px(0.6)} y1={b.py(0)} x2={b.px(3)} y2={b.py(0)} stroke={C.muted} strokeWidth={1.5} strokeDasharray="5 5" />
          <Label x={b.px(0.6) - 8} y={b.py(0)} anchor="end" tone="muted" size={15}>0</Label>
          <path d={b.path(partial(shallow, seg(t, 2.4, 3.4)))} fill="none" stroke={C.ink} strokeWidth={2.5} />
          <path d={b.path(partial(deep, seg(t, 0.4, 1.5)))} fill="none" stroke={C.accent} strokeWidth={3} />
          <Label x={b.px(0.98)} y={b.py(-1.22)} anchor="start" tone="accent" size={15} weight={600} opacity={op(seg(t, 1.3, 1.8))}>
            tungsten ~850 kJ/mol
          </Label>
          <Label x={b.px(0.98)} y={b.py(-1.22) + 20} anchor="start" tone="accent" size={15} opacity={op(seg(t, 1.6, 2.1))}>
            deep: melts 3422°C, stiff
          </Label>
          <Label x={b.px(1.95)} y={b.py(-0.2) + 22} anchor="start" size={15} weight={600} opacity={op(seg(t, 3.2, 3.7))}>
            secondary 1–40 kJ/mol
          </Label>
          <Label x={b.px(1.95)} y={b.py(-0.2) + 42} anchor="start" size={15} opacity={op(seg(t, 3.5, 4))}>
            shallow: soft, compliant
          </Label>
        </>
      )}
    </AnimatedFigure>
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
  const rowAt = [0.3, 1.6, 2.9, 4.6]; // each line of the protocol, in writing order
  return (
    <AnimatedFigure
      height={290}
      duration={5.6}
      alt="A four-step flow down the page: structure (four unlike neighbors in one network), bond (covalent network), written prediction (hard, brittle, insulating, very high melting), and the check (silicon carbide, prediction holds)."
      steps={[
        {
          at: 0,
          label: "Structure",
          caption: "Start from the structure alone: the atoms form a continuous tetrahedral network.",
        },
        {
          at: 1.3,
          label: "Bond",
          caption: "Name the bond: directional covalent, with poor electron mobility and limited easy slip.",
        },
        {
          at: 2.6,
          label: "Predict",
          caption: "Read the pack off the bond and write it down: hard, brittle, insulating, very high melting.",
        },
        {
          at: 4.3,
          label: "Check",
          caption: "Write line three before you look at line four — only a committed prediction can miss, and the miss is where the learning is.",
        },
      ]}
    >
      {({ t }) => (
        <>
          {rows.map((r, i) => {
            const box = op(seg(t, rowAt[i], rowAt[i] + 0.5));
            return (
              <g key={r.step}>
                <rect x={8} y={rowY(i) - 22} width={96} height={44} rx={6} fill={i === 2 ? C.soft : "none"} stroke={i === 2 ? C.accent : C.line} strokeWidth={1.5} opacity={box} />
                <Label x={56} y={rowY(i)} weight={600} tone={i === 2 ? "accent" : "ink"} opacity={box}>
                  {r.step}
                </Label>
                <Label x={118} y={rowY(i)} anchor="start" size={i === 2 ? 16 : 15} tone={i === 3 ? "accent" : "ink"} weight={i === 2 ? 600 : undefined} opacity={op(seg(t, rowAt[i] + 0.2, rowAt[i] + 0.7))}>
                  {r.text}
                </Label>
                {i < 3 && (
                  <GrowArrow p={seg(t, rowAt[i + 1] - 0.3, rowAt[i + 1] + 0.1)} x1={56} y1={rowY(i) + 23} x2={56} y2={rowY(i + 1) - 24} tone="muted" width={2} />
                )}
              </g>
            );
          })}
          {/* tiny tetrahedral-network sketch beside the structure row */}
          <g transform="translate(398,12)" opacity={op(seg(t, 0.6, 1.1))}>
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
          <Label x={472} y={rowY(2) + 30} anchor="end" tone="muted" size={15} opacity={op(seg(t, 3.5, 4))}>written before the reveal</Label>
        </>
      )}
    </AnimatedFigure>
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
    <AnimatedFigure
      height={300}
      duration={5.6}
      alt="One face of the aluminum FCC unit cell drawn to scale: quarter atoms at the four corners and a whole atom at the face centre touching along the diagonal, with the edge dimensioned 404 picometres and the atom count and density listed beside it."
      steps={[
        {
          at: 0,
          label: "Cell face",
          caption: "Given FCC aluminum with radius 143 pm. Supplied molar mass is 26.98 g/mol; Avogadro’s constant is 6.02214076 × 10²³ mol⁻¹. Geometry alone cannot supply atom mass.",
        },
        {
          at: 1.4,
          label: "Diagonal",
          caption: "The face diagonal holds four radii, so the cell edge is a = 2√2 × 143 pm ≈ 404 pm.",
        },
        {
          at: 3.2,
          label: "Count",
          caption: "Corners contribute 8 × 1/8 = 1 atom and faces 6 × 1/2 = 3, for 4 atoms per cell.",
        },
        {
          at: 4.8,
          label: "Density",
          caption: "Mass per cell = 4 × 26.98/N_A ≈ 1.792 × 10⁻²² g. Divide by the cell volume using the unrounded edge: density ≈ 2.71 g/cm³, close to the 2.70 reference.",
        },
      ]}
    >
      {({ t }) => {
        const grow = seg(t, 1.5, 2.3); // the diagonal, drawn from the bottom-left corner
        return (
          <>
            <defs>
              <clipPath id="matA-fcc-face">
                <rect x={x0} y={y0} width={A} height={A} />
              </clipPath>
            </defs>
            <g clipPath="url(#matA-fcc-face)" opacity={op(seg(t, 0.3, 0.8))}>
              {atoms.map(([cx, cy], k) => (
                <circle key={k} cx={cx} cy={cy} r={R} fill={C.soft} stroke={C.ink} strokeWidth={2} />
              ))}
            </g>
            <rect x={x0} y={y0} width={A} height={A} fill="none" stroke={C.ink} strokeWidth={2} />
            {grow > 0 ? (
              <line x1={x0} y1={y0 + A} x2={lerp(x0, x0 + A, grow)} y2={lerp(y0 + A, y0, grow)} stroke={C.accent} strokeWidth={3} />
            ) : null}
            {/* tick marks at r, 3r along the diagonal (atom boundaries) */}
            {[R, 3 * R].map((d, k) => {
              const u = d / Math.SQRT2;
              const cx = x0 + u;
              const cy = y0 + A - u;
              const at = k ? 2.02 : 1.78; // when the growing diagonal reaches this boundary
              return <line key={k} x1={cx - 6} y1={cy - 6} x2={cx + 6} y2={cy + 6} stroke={C.accent} strokeWidth={2.5} opacity={op(seg(t, at, at + 0.4))} />;
            })}
            <Label x={x0 + A / 2} y={24} tone="accent" weight={600} opacity={op(seg(t, 2.2, 2.7))}>diagonal = 4r</Label>
            <Reveal t={t} at={2.6}>
              <DimH x1={x0} x2={x0 + A} y={y0 + A + 26} label="a ≈ 404 pm" />
            </Reveal>

            <g transform="translate(262,0)">
              <Label x={0} y={62} anchor="start" weight={600} opacity={op(seg(t, 0.4, 0.9))}>Aluminum, FCC</Label>
              <Label x={0} y={98} anchor="start" opacity={op(seg(t, 0.7, 1.2))}>r = 143 pm</Label>
              <Label x={0} y={128} anchor="start" opacity={op(seg(t, 2.4, 2.9))}>a = 2√2·r ≈ 404 pm</Label>
              <Label x={0} y={170} anchor="start" size={15} tone="muted" opacity={op(seg(t, 3.3, 3.8))}>corners 8 × 1/8 = 1</Label>
              <Label x={0} y={192} anchor="start" size={15} tone="muted" opacity={op(seg(t, 3.7, 4.2))}>faces 6 × 1/2 = 3</Label>
              <Label x={0} y={218} anchor="start" opacity={op(seg(t, 4.1, 4.6))}>4 atoms per cell</Label>
              <Label x={0} y={256} anchor="start" tone="accent" size={20} weight={600} serif opacity={op(seg(t, 4.9, 5.4))}>
                ρ ≈ 2.71 g/cm³
              </Label>
            </g>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** 12.2: same steel, two grain sizes, Hall–Petch yield for each. */
function GrainTex() {
  const S = 168;
  return (
    <AnimatedFigure
      height={290}
      duration={5}
      alt="Two square micrograph sketches of the same steel: on the left four large grains, 100 micrometres, yield 150 MPa; on the right sixty-four small grains, 25 micrometres, yield 200 MPa."
      steps={[
        { at: 0, label: "Coarse", caption: "Two coupons of the same steel; the first has grains 100 μm across." },
        {
          at: 1.3,
          label: "Refine",
          caption: "The second is refined to 25 μm: the finer the grains, the more wall per volume.",
        },
        {
          at: 2.8,
          label: "Hall–Petch",
          caption: "With σ₀ = 100 MPa and k = 0.50 MPa·√m, the 100 μm grains give σy = 100 + 0.50/0.01 = 150 MPa.",
        },
        {
          at: 4.1,
          label: "Result",
          caption:
            "Each boundary is a wall dislocations pile up against. A quarter of the grain size means far more wall per volume — 50 MPa more yield with the chemistry untouched.",
        },
      ]}
    >
      {({ t }) => (
        <>
          <Grains x={34} y={20} size={S} n={2} seed={3} opacity={op(seg(t, 0.3, 0.8))} />
          <Grains x={278} y={20} size={S} n={8} seed={9} opacity={op(seg(t, 1.8, 2.3))} />
          <GrowArrow p={seg(t, 1.4, 1.9)} x1={214} y1={104} x2={266} y2={104} tone="accent" width={3} />
          <Label x={240} y={84} tone="accent" size={15} opacity={op(seg(t, 1.5, 2))}>refine</Label>

          <Label x={34 + S / 2} y={214} opacity={op(seg(t, 0.6, 1.1))}>d = 100 μm</Label>
          <Label x={34 + S / 2} y={240} size={18} weight={600} serif opacity={op(seg(t, 3.3, 3.8))}>σy = 150 MPa</Label>
          <Label x={278 + S / 2} y={214} opacity={op(seg(t, 2.1, 2.6))}>d = 25 μm</Label>
          <Label x={278 + S / 2} y={240} size={18} weight={600} serif tone="accent" opacity={op(seg(t, 4.2, 4.7))}>σy = 200 MPa</Label>
          <Label x={240} y={274} tone="muted" size={15} opacity={op(seg(t, 2.9, 3.4))}>σy = σ₀ + k/√d,  σ₀ = 100 MPa, k = 0.50 MPa·√m</Label>
        </>
      )}
    </AnimatedFigure>
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
    <AnimatedFigure
      height={290}
      duration={6.7}
      alt="Stress against strain for a metallic glass, straight up to 1.9 GPa at 2 percent then dropping to zero, and a crystalline steel, straight to 1.5 GPa at 0.75 percent then yielding along a plateau; shaded triangles mark stored elastic energy of 19 and 5.6 megajoules per cubic metre."
      steps={[
        {
          at: 0,
          label: "Spring",
          caption: "Load both: the steel stays elastic only to 1.5 GPa at 0.75%, the metallic glass to 1.9 GPa at 2%.",
        },
        {
          at: 2.9,
          label: "Energy",
          caption: "The area under each straight line is stored spring energy, σ²/2E: 19 MJ/m³ for the glass, 5.6 for the steel.",
        },
        {
          at: 4.3,
          label: "Shear band",
          caption: "Bend the glass past 2% and a single shear band takes the whole deformation: catastrophic, silent, total.",
        },
        {
          at: 5.2,
          label: "Yield",
          caption:
            "The glass stores several times more spring energy — then a single shear band ends it without warning. The steel stops springing sooner but yields and keeps going.",
        },
      ]}
    >
      {({ t }) => {
        const e = 2 * clamp((t - 0.4) / 2); // strain (%), both loaded at the same steady rate
        const es = t < 5.3 ? Math.min(e, 0.75) : lerp(0.75, 3, seg(t, 5.3, 6.3)); // the steel waits at its limit, then yields on
        const fill = seg(t, 3, 3.6); // stored energy, swept up to each elastic limit
        const band = seg(t, 4.4, 4.8);
        const steelKnee = op(seg(t, 1.15, 1.65));
        const glassTop = op(seg(t, 2.4, 2.9));
        return (
          <>
            <Axes box={b} xLabel="strain (%)" yLabel="stress (GPa)" />
            <polygon
              points={`${b.px(0)},${b.py(0)} ${b.px(lerp(0, 2, fill))},${b.py(lerp(0, 1.9, fill))} ${b.px(lerp(0, 2, fill))},${b.py(0)}`}
              fill={C.soft}
              fillOpacity={0.8}
            />
            <polygon
              points={`${b.px(0)},${b.py(0)} ${b.px(lerp(0, 0.75, fill))},${b.py(lerp(0, 1.5, fill))} ${b.px(lerp(0, 0.75, fill))},${b.py(0)}`}
              fill={C.muted}
              fillOpacity={0.3}
            />
            <path d={b.path(upTo(steel, es))} fill="none" stroke={C.ink} strokeWidth={2.5} />
            <path d={b.path(upTo(glass, e))} fill="none" stroke={C.accent} strokeWidth={3} />
            {band > 0.02 ? (
              <line x1={b.px(2)} y1={b.py(1.9)} x2={b.px(2)} y2={lerp(b.py(1.9), b.py(0), band)} stroke={C.alarm} strokeWidth={2.5} strokeDasharray="5 4" />
            ) : null}
            <Label x={b.px(2) + 8} y={b.py(0.95)} anchor="start" tone="alarm" size={15} opacity={op(seg(t, 4.6, 5.1))}>one shear band</Label>

            <Label x={b.px(2) - 10} y={b.py(1.9) - 2} anchor="end" tone="accent" size={15} weight={600} opacity={glassTop}>metallic glass</Label>
            <Label x={b.px(3.15)} y={b.py(1.6) + 20} anchor="end" size={15} opacity={op(seg(t, 6, 6.5))}>steel yields</Label>
            <line x1={b.x} y1={b.py(1.9)} x2={b.px(2)} y2={b.py(1.9)} stroke={C.line} strokeWidth={1} strokeDasharray="4 4" opacity={glassTop} />
            <line x1={b.x} y1={b.py(1.5)} x2={b.px(0.75)} y2={b.py(1.5)} stroke={C.line} strokeWidth={1} strokeDasharray="4 4" opacity={steelKnee} />
            <Label x={b.x - 8} y={b.py(1.9)} anchor="end" size={15} tone="accent" opacity={glassTop}>1.9</Label>
            <Label x={b.x - 8} y={b.py(1.5)} anchor="end" size={15} opacity={steelKnee}>1.5</Label>

            <Label x={b.px(1.5)} y={b.py(0.3)} tone="accent" size={16} weight={600} opacity={op(seg(t, 3.4, 3.9))}>19 MJ/m³</Label>
            <GrowArrow p={seg(t, 3.6, 4.1)} x1={b.px(0.3)} y1={b.py(1.12)} x2={b.px(0.58)} y2={b.py(0.62)} tone="muted" width={1.5} />
            <Label x={b.px(0.3)} y={b.py(1.12) - 12} size={15} opacity={op(seg(t, 3.7, 4.2))}>5.6</Label>
            <Label x={b.px(0.75)} y={b.y + b.h + 16} size={15} opacity={steelKnee}>0.75</Label>
            <Label x={b.px(2)} y={b.y + b.h + 16} tone="accent" size={15} opacity={glassTop}>2</Label>
          </>
        );
      }}
    </AnimatedFigure>
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
  const heat = (t: number) => lerp(300, 1000, seg(t, 1.6, 3.7)); // K
  /** 7.6×10⁻¹⁶ from a base-10 logarithm. */
  const sci = (l: number) => {
    let e = Math.floor(l);
    let m = 10 ** (l - e);
    if (m >= 9.95) {
      m /= 10;
      e += 1;
    }
    const sup = String(e).replace(/./g, (c) => "⁻⁰¹²³⁴⁵⁶⁷⁸⁹"["-0123456789".indexOf(c)]);
    return `${m.toFixed(1)}×10${sup}`;
  };
  return (
    <AnimatedFigure
      height={290}
      duration={4.5}
      alt="Copper's equilibrium vacancy fraction on a logarithmic axis against temperature, rising from 7.6 times ten to the minus 16 at 300 kelvin to 2.9 times ten to the minus 5 at 1000 kelvin."
      steps={[
        {
          at: 0,
          label: "Room temp",
          caption: "Copper, Qv ≈ 0.9 eV: at 300 K only exp(−34.8) ≈ 7.6×10⁻¹⁶ of its sites are empty.",
        },
        {
          at: 1.4,
          label: "Heat",
          caption: "Heat it toward 1000 K: temperature is a dial, not a nudge, and the vacancy fraction climbs with it.",
        },
        {
          at: 3.7,
          label: "Ten orders",
          caption:
            "n/N = exp(−Qv/kT) is exponential in temperature: 700 K of heating moves the vacancy population about ten orders of magnitude — and a quench freezes the hot value in.",
        },
      ]}
      readouts={(t) => {
        const T = heat(t);
        return [
          { label: "T", value: `${Math.round(T)} K` },
          { label: "n/N", value: sci(lg(T)), tone: "accent" },
        ];
      }}
    >
      {({ t }) => {
        const T = heat(t);
        const cold = op(seg(t, 0.6, 1.1));
        return (
          <>
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
            <path d={b.path(partial(pts, (T - 300) / 700))} fill="none" stroke={C.accent} strokeWidth={3} />
            <circle cx={b.px(p300[0])} cy={b.py(p300[1])} r={5} fill={C.ink} opacity={cold} />
            {/* the metal's state, carried up the curve as it heats */}
            <circle cx={b.px(T)} cy={b.py(lg(T))} r={5} fill={C.accent} opacity={op(seg(t, 1.4, 1.7))} />
            <Label x={b.px(300) + 12} y={b.py(p300[1]) - 16} anchor="start" size={15} opacity={cold}>300 K: 7.6×10⁻¹⁶</Label>
            <Label x={b.px(1000) - 12} y={b.py(p1000[1]) - 20} anchor="end" size={15} tone="accent" weight={600} opacity={op(seg(t, 3.7, 4.2))}>
              1000 K: 2.9×10⁻⁵
            </Label>
            <Label x={b.px(760)} y={b.py(-13)} size={15} tone="muted" opacity={op(seg(t, 0.3, 0.8))}>Cu, Qv ≈ 0.9 eV</Label>
            <Label x={b.px(300)} y={b.y + b.h + 16} tone="muted" size={15}>300</Label>
            <Label x={b.px(1000)} y={b.y + b.h + 16} tone="muted" size={15}>1000</Label>
          </>
        );
      }}
    </AnimatedFigure>
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
  const profile = sample(conc, 0, 2, 100); // after the full 4 h
  const hours = (t: number) => 4 * clamp((t - 1.4) / 3); // furnace time, running at a steady rate
  return (
    <AnimatedFigure
      height={290}
      duration={5}
      alt="Carbon concentration against depth into a steel gear at 950 degrees Celsius after 4 hours: an error-function curve falling from 1.1 weight percent at the surface to 0.2 in the core, crossing 0.4 weight percent at 0.69 millimetres."
      steps={[
        {
          at: 0,
          label: "Surface",
          caption: "Carburize at 950 °C: the surface holds Cs = 1.1 wt% carbon and the core starts at C₀ = 0.2 wt%.",
        },
        {
          at: 1.3,
          label: "Diffuse",
          caption: "Carbon diffuses in from the surface, and the profile spreads over the length 2√(Dt).",
        },
        {
          at: 4.4,
          label: "Case depth",
          caption:
            "The profile's length scale is 2√(Dt) = 0.80 mm, so case depth grows only as the square root of time — twice as deep costs four times the hours.",
        },
      ]}
      readouts={(t) => {
        const f = Math.sqrt(hours(t) / 4);
        return [
          { label: "t", value: `${hours(t).toFixed(1)} h` },
          { label: "2√(Dt)", value: `${(L * f).toFixed(2)} mm` },
          { label: "case depth", value: `${(xd * f).toFixed(2)} mm`, tone: "accent" },
        ];
      }}
    >
      {({ t }) => {
        const h = hours(t);
        const f = Math.sqrt(h / 4); // every length in the profile grows as √t
        const Lt = Math.max(L * f, 0.004);
        const pts = h >= 4 ? profile : sample((x) => Cs - (Cs - C0) * erf(x / Lt), 0, 2, 100);
        const xc = xd * f; // the 0.4 wt% contour
        const edge = op(seg(t, 1.4, 1.8));
        return (
          <>
            <Axes box={b} xLabel="depth x (mm)" yLabel="carbon (wt%)" />
            <line x1={b.px(0)} y1={b.py(C0)} x2={b.px(2)} y2={b.py(C0)} stroke={C.muted} strokeWidth={1.5} strokeDasharray="5 5" />
            <line x1={b.px(0)} y1={b.py(0.4)} x2={b.px(xc)} y2={b.py(0.4)} stroke={C.accent} strokeWidth={1.5} strokeDasharray="5 4" opacity={edge} />
            <line x1={b.px(xc)} y1={b.py(0.4)} x2={b.px(xc)} y2={b.py(0)} stroke={C.accent} strokeWidth={1.5} strokeDasharray="5 4" opacity={edge} />
            <path d={b.path(pts)} fill="none" stroke={C.ink} strokeWidth={3} />
            <circle cx={b.px(xc)} cy={b.py(0.4)} r={5} fill={C.accent} opacity={edge} />

            <Label x={b.x - 8} y={b.py(Cs)} anchor="end" size={15} opacity={op(seg(t, 0.3, 0.8))}>1.1</Label>
            <Label x={b.x - 8} y={b.py(0.4)} anchor="end" size={15} tone="accent" opacity={edge}>0.4</Label>
            <Label x={b.x - 8} y={b.py(C0) + 4} anchor="end" size={15} tone="muted" opacity={op(seg(t, 0.5, 1))}>0.2</Label>
            <Label x={b.px(xd)} y={b.y + b.h + 16} tone="accent" size={15} weight={600} opacity={op(seg(t, 4.4, 4.9))}>0.69</Label>
            <Label x={b.px(2)} y={b.py(C0) - 14} anchor="end" tone="muted" size={15} opacity={op(seg(t, 0.5, 1))}>core C₀</Label>
            <Label x={b.px(0.12)} y={b.py(Cs) - 12} anchor="start" size={15} opacity={op(seg(t, 0.3, 0.8))}>surface Cs</Label>
            <Label x={b.px(1.95)} y={b.py(0.9)} anchor="end" tone="accent" size={16} weight={600} opacity={op(seg(t, 0.7, 1.2))}>950 °C, 4 h</Label>
            <Label x={b.px(xc) + 10} y={b.py(0.4) - 18} anchor="start" size={15} opacity={edge}>case edge</Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** A small temperature-vs-time path for one thermal history, traced up to plot time `upto`; `show` fades in its result. */
function ThermalRow({
  y,
  path,
  title,
  result,
  note,
  tone,
  marks,
  upto,
  show,
}: {
  y: number;
  path: Array<[number, number]>;
  title: string;
  result: string;
  note: string;
  tone: "ink" | "accent" | "alarm";
  marks?: Array<{ t: number; T: number; text: string }>;
  upto: number;
  show: number;
}) {
  const b = plotBox({ x: 30, y, w: 230, h: 62, xMin: 0, xMax: 10, yMin: 0, yMax: 900 });
  return (
    <g>
      <line x1={b.x} y1={b.y + b.h} x2={b.x + b.w} y2={b.y + b.h} stroke={C.muted} strokeWidth={1.5} />
      <line x1={b.x} y1={b.y - 6} x2={b.x} y2={b.y + b.h} stroke={C.muted} strokeWidth={1.5} />
      <path d={b.path(upTo(path, upto))} fill="none" stroke={C[tone]} strokeWidth={3} strokeLinejoin="round" />
      {marks?.map((m) => (
        <Label key={m.text} x={b.px(m.t)} y={b.py(m.T) - 12} size={15} tone="muted" opacity={op(seg(upto, m.t, m.t + 3))}>
          {m.text}
        </Label>
      ))}
      <Label x={290} y={y + 16} anchor="start" weight={600}>{title}</Label>
      <Label x={290} y={y + 42} anchor="start" size={19} tone={tone === "ink" ? "ink" : tone} serif weight={600} opacity={op(show)}>
        {result}
      </Label>
      <Label x={472} y={y + 42} anchor="end" size={15} tone="muted" opacity={op(show)}>{note}</Label>
    </g>
  );
}

/** 13.3: 4140, three thermal histories, three hardnesses. */
function HeatTreatW13() {
  const slow: Array<[number, number]> = [[0, 850], [3, 850]];
  for (let t = 3; t <= 10.001; t += 0.25) slow.push([t, 30 + 820 * Math.exp(-(t - 3) / 2)]);
  return (
    <AnimatedFigure
      height={300}
      duration={5.8}
      alt="Three small temperature-time sketches for 4140 steel: a slow cool giving about 200 HB, a quench from 850 degrees Celsius giving about 58 HRC, and a quench followed by a 400 degree temper giving about 42 HRC."
      steps={[
        { at: 0, label: "Anneal", caption: "Annealed 4140 comes out at about 200 HB: soft, machinable, the baseline." },
        {
          at: 2,
          label: "Quench",
          caption: "Quenched from 850 °C: about 58 HRC, hard enough to scratch glass, brittle enough to fear.",
        },
        {
          at: 3.7,
          label: "Temper",
          caption: "Quenched, then tempered at 400 °C: about 42 HRC with real toughness, the working compromise.",
        },
        {
          at: 5.4,
          label: "Compare",
          caption:
            "Same chemistry in all three rows. Only the thermal path differs — and the hardness goes from machinable to glass-scratching to the working compromise.",
        },
      ]}
    >
      {({ t }) => {
        const run = (a: number) => 10 * clamp((t - a) / 1.2); // each history plays out in 1.2 s
        return (
          <>
            <ThermalRow y={30} path={slow} title="Annealed" result="~200 HB" note="soft baseline" tone="ink" upto={run(0.4)} show={seg(t, 1.5, 2)} />
            <ThermalRow
              y={126}
              path={[[0, 850], [3, 850], [3.3, 30], [10, 30]]}
              title="Quenched"
              result="~58 HRC"
              note="brittle"
              tone="alarm"
              marks={[{ t: 1.5, T: 850, text: "850 °C" }]}
              upto={run(2.1)}
              show={seg(t, 3.2, 3.7)}
            />
            <ThermalRow
              y={222}
              path={[[0, 850], [3, 850], [3.3, 30], [4.6, 30], [5.2, 400], [8, 400], [8.6, 30], [10, 30]]}
              title="Quench + temper"
              result="~42 HRC"
              note="tough"
              tone="accent"
              marks={[{ t: 6.6, T: 400, text: "400 °C" }]}
              upto={run(3.8)}
              show={seg(t, 4.9, 5.4)}
            />
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/* ------------------------------------------------------------------ week 14 */

/** 14.1: 1020 steel curve with its three landmarks. */
function ReadCurve() {
  const b = plotBox({ x: 60, y: 40, w: 380, h: 200, xMin: -0.012, xMax: 0.4, yMin: 0, yMax: 480 });
  const pts = mildSteel();
  const end = pts[pts.length - 1];
  const pen = tracer(b, pts);
  const knee = pen.cum[1];
  const peak = pen.cum[pts.findIndex(([e]) => e > 0.1999)];
  return (
    <AnimatedFigure
      height={290}
      duration={5}
      alt="Engineering stress-strain curve for 1020 steel: a near-vertical elastic line of slope 200 GPa, a reported departure from linearity near 350 MPa (not an established offset yield), a peak of 420 MPa, then a fall to fracture."
      steps={[
        {
          at: 0,
          label: "Slope",
          caption: "The machine pulls and the record starts as a steep straight line; its slope, E = 200 GPa, is the stiffness.",
        },
        {
          at: 1.4,
          label: "Reported departure",
          caption: "The reported departure is at 42.9 kN: stress = 42,900 N / 122.718… mm² ≈ 350 MPa. The givens do not identify an offset-yield intersection.",
        },
        {
          at: 3,
          label: "Peak",
          caption: "The load peaks at 51.5 kN: σuts = 51,500 / 122.7 = 420 MPa, before the bar necks and breaks.",
        },
        {
          at: 4.3,
          label: "Fracture",
          caption: "This is a schematic of the supplied landmarks, not the measured record. E = 200 GPa is the initial slope; UTS ≈ 420 MPa is peak engineering stress. A departure from linearity alone does not establish offset yield.",
        },
      ]}
    >
      {({ t }) => {
        // The pen runs at an even speed on screen and pauses at each landmark.
        const s = t < 1.6 ? lerp(0, knee, seg(t, 0.4, 1.2)) : t < 3.2 ? lerp(knee, peak, seg(t, 2, 3)) : lerp(peak, pen.len, seg(t, 3.5, 4.3));
        return (
          <>
            <Axes box={b} xLabel="strain ε" yLabel="stress σ (MPa)" />
            {[350, 420].map((v) => (
              <line key={v} x1={b.x} y1={b.py(v)} x2={b.px(0.2)} y2={b.py(v)} stroke={C.line} strokeWidth={1.5} strokeDasharray="4 4" opacity={op(v === 350 ? seg(t, 1.5, 2) : seg(t, 3.1, 3.6))} />
            ))}
            <path d={b.path(pen.at(s))} fill="none" stroke={C.ink} strokeWidth={3} strokeLinejoin="round" />
            <circle cx={b.px(350 / 200000)} cy={b.py(350)} r={5} fill={C.accent} opacity={op(seg(t, 1.4, 1.8))} />
            <circle cx={b.px(0.2)} cy={b.py(420)} r={5} fill={C.accent} opacity={op(seg(t, 3, 3.4))} />
            <g stroke={C.alarm} strokeWidth={2.5} opacity={op(seg(t, 4.3, 4.7))}>
              <line x1={b.px(end[0]) - 6} y1={b.py(end[1]) - 6} x2={b.px(end[0]) + 6} y2={b.py(end[1]) + 6} />
              <line x1={b.px(end[0]) - 6} y1={b.py(end[1]) + 6} x2={b.px(end[0]) + 6} y2={b.py(end[1]) - 6} />
            </g>

            <Label x={b.x - 8} y={b.py(350)} anchor="end" size={15} tone="accent" opacity={op(seg(t, 1.5, 2))}>350</Label>
            <Label x={b.x - 8} y={b.py(420)} anchor="end" size={15} tone="accent" opacity={op(seg(t, 3.1, 3.6))}>420</Label>
            <Label x={b.px(0.07)} y={b.py(350) + 22} anchor="start" size={15} tone="accent" weight={600} opacity={op(seg(t, 1.6, 2.1))}>departure ≈ 350 MPa</Label>
            <Label x={b.px(0.2)} y={b.py(420) - 18} size={15} tone="accent" weight={600} opacity={op(seg(t, 3.2, 3.7))}>peak σuts = 420 MPa</Label>
            <Label x={b.px(end[0])} y={b.py(end[1]) - 20} tone="alarm" size={15} opacity={op(seg(t, 4.4, 4.9))}>fracture</Label>
            <GrowArrow p={seg(t, 0.9, 1.4)} x1={b.px(0.07)} y1={b.py(180)} x2={b.px(0.004)} y2={b.py(180)} tone="accent" width={2} />
            <Label x={b.px(0.075)} y={b.py(180)} anchor="start" size={15} tone="accent" weight={600} opacity={op(seg(t, 1, 1.5))}>slope E = 200 GPa</Label>
          </>
        );
      }}
    </AnimatedFigure>
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
  const penM = tracer(b, mild);
  const penH = tracer(b, hs);
  const endM = mild[mild.length - 1][0];
  const endH = hs[hs.length - 1][0];
  return (
    <AnimatedFigure
      height={290}
      duration={6.4}
      alt="Stress-strain curves for two steels on one set of axes: high-strength steel rises steeply to 1500 MPa and breaks at 3 percent, enclosing about 40 megajoules per cubic metre; mild steel yields at 350 MPa and stretches to 36 percent, enclosing about 140."
      steps={[
        { at: 0, label: "Strong", caption: "The high-strength bar carries 1500 MPa but snaps at 3% elongation." },
        { at: 1.8, label: "Ductile", caption: "The mild bar yields at only 350 MPa but stretches to 36% before breaking." },
        {
          at: 3.7,
          label: "Spike",
          caption: "Toughness is the area under the curve: the tall, thin spike absorbs about 40 MJ/m³.",
        },
        {
          at: 5,
          label: "Broad curve",
          caption: "Toughness is the shaded area, not the height. The low, wide curve absorbs over three times the energy of the tall spike.",
        },
      ]}
    >
      {({ t }) => (
        <>
          <Axes box={b} xLabel="strain ε" yLabel="stress (MPa)" />
          <path d={area(upTo(mild, lerp(0, endM, seg(t, 5.1, 5.9))))} fill={C.soft} fillOpacity={0.9} />
          <path d={area(upTo(hs, lerp(0, endH, seg(t, 3.8, 4.4))))} fill={C.alarm} fillOpacity={0.2} />
          <path d={b.path(penM.at(lerp(0, penM.len, seg(t, 1.9, 3.3))))} fill="none" stroke={C.accent} strokeWidth={3} />
          <path d={b.path(penH.at(lerp(0, penH.len, seg(t, 0.4, 1.4))))} fill="none" stroke={C.alarm} strokeWidth={3} />

          <Label x={b.px(0.03) + 10} y={b.py(1500) + 2} anchor="start" size={15} tone="alarm" weight={600} opacity={op(seg(t, 1.2, 1.7))}>high-strength: 1500 MPa, 3%</Label>
          <GrowArrow p={seg(t, 4.3, 4.8)} x1={b.px(0.09)} y1={b.py(900)} x2={b.px(0.022)} y2={b.py(800)} tone="alarm" width={1.5} />
          <Label x={b.px(0.095)} y={b.py(900)} anchor="start" size={16} tone="alarm" weight={600} opacity={op(seg(t, 4.3, 4.8))}>≈ 40 MJ/m³</Label>
          <Label x={b.px(0.36)} y={b.py(420) - 20} anchor="end" size={15} tone="accent" weight={600} opacity={op(seg(t, 3.1, 3.6))}>mild: 350 MPa, 36%</Label>
          <Label x={b.px(0.2)} y={b.py(180)} size={17} tone="accent" weight={600} opacity={op(seg(t, 5.7, 6.2))}>≈ 140 MJ/m³</Label>
        </>
      )}
    </AnimatedFigure>
  );
}

/** 14.3: three Ti-6Al-4V specimens → characteristic value → allowable. */
function Allowables() {
  const zx = (v: number) => 40 + ((v - 860) / 30) * 400;
  const fx = (v: number) => 40 + (v / 900) * 400;
  const zy = 70;
  const readAt: Record<number, number> = { 872: 0.4, 885: 0.7, 879: 1 }; // in the order the readings come in
  return (
    <AnimatedFigure
      height={300}
      duration={5.8}
      alt="Top: a zoomed axis from 860 to 890 MPa with three yield readings at 872, 879 and 885, the mean 879 and a characteristic value 866 two standard deviations lower. Bottom: full-scale bars showing the characteristic 866 MPa divided by a factor of safety of 1.5 to give an allowable of 577 MPa."
      steps={[
        { at: 0, label: "Specimens", caption: "Three Ti-6Al-4V specimens give yield readings of 872, 885 and 879 MPa." },
        {
          at: 1.8,
          label: "Mean − 2s",
          caption: "Mean 879 and standard deviation ≈ 6.5 MPa give a low-tail characteristic value of 879 − 2 × 6.5 = 866 MPa.",
        },
        {
          at: 3.4,
          label: "Safety factor",
          caption: "Divide by a factor of safety of 1.5 for a static-strength check: allowable = 866 / 1.5 ≈ 577 MPa.",
        },
        {
          at: 5.3,
          label: "The gap",
          caption: "Scatter costs only 13 MPa here; the factor of safety costs almost 300. None of that gap is on the curve.",
        },
      ]}
    >
      {({ t }) => {
        const full = op(seg(t, 3.5, 4));
        const cut = seg(t, 4.5, 5.1); // ÷ 1.5 pulls the bar back from 866 to 577
        return (
          <>
            {/* zoomed strip */}
            <line x1={40} y1={zy} x2={440} y2={zy} stroke={C.ink} strokeWidth={1.5} />
            {[860, 870, 880, 890].map((v) => (
              <g key={v}>
                <line x1={zx(v)} y1={zy - 5} x2={zx(v)} y2={zy + 5} stroke={C.muted} strokeWidth={1.5} />
                <Label x={zx(v)} y={zy + 20} tone="muted" size={15}>{v}</Label>
              </g>
            ))}
            {[872, 879, 885].map((v) => (
              <circle key={v} cx={zx(v)} cy={zy - 16} r={6} fill={C.ink} opacity={op(seg(t, readAt[v], readAt[v] + 0.4))} />
            ))}
            <Label x={zx(878.5)} y={zy - 44} size={15} opacity={op(seg(t, 1.2, 1.7))}>specimens 872 · 879 · 885</Label>
            <line x1={zx(879)} y1={zy - 26} x2={zx(879)} y2={zy + 8} stroke={C.ink} strokeWidth={2} strokeDasharray="3 3" opacity={op(seg(t, 1.9, 2.3))} />
            <GrowArrow p={seg(t, 2.2, 2.8)} x1={zx(879)} y1={zy + 40} x2={zx(866)} y2={zy + 40} tone="accent" width={2} />
            <Label x={zx(879) + 8} y={zy + 40} anchor="start" size={15} opacity={op(seg(t, 2.2, 2.7))}>mean − 2s</Label>
            <circle cx={zx(866)} cy={zy} r={6} fill={C.accent} opacity={op(seg(t, 2.7, 3.1))} />
            <Label x={zx(866)} y={zy + 60} tone="accent" size={15} weight={600} opacity={op(seg(t, 2.8, 3.2))}>866</Label>

            {/* zoom connector */}
            <line x1={zx(866)} y1={zy + 70} x2={fx(866)} y2={170} stroke={C.line} strokeWidth={1.5} strokeDasharray="4 4" opacity={full} />

            {/* full scale */}
            <rect x={fx(0)} y={172} width={lerp(0, fx(866) - fx(0), seg(t, 3.6, 4.2))} height={30} fill={C.line} fillOpacity={0.6} stroke={C.ink} strokeWidth={1.5} />
            <Label x={fx(0) + 10} y={187} anchor="start" size={15} opacity={op(seg(t, 3.9, 4.4))}>characteristic 866 MPa</Label>
            <rect x={fx(0)} y={222} width={lerp(fx(866) - fx(0), fx(577) - fx(0), cut)} height={30} fill={C.soft} stroke={C.accent} strokeWidth={2} opacity={op(seg(t, 4.3, 4.7))} />
            <Label x={fx(0) + 10} y={237} anchor="start" size={15} tone="accent" weight={600} opacity={op(seg(t, 5, 5.5))}>allowable 577 MPa</Label>
            <GrowArrow p={cut} x1={fx(866) - 4} y1={206} x2={fx(577) + 6} y2={234} tone="accent" width={2} />
            <Label x={fx(740)} y={246} tone="accent" size={16} weight={600} opacity={op(seg(t, 4.6, 5.1))}>÷ 1.5</Label>
            <line x1={fx(0)} y1={266} x2={fx(900)} y2={266} stroke={C.ink} strokeWidth={1.5} opacity={full} />
            {[0, 300, 600, 900].map((v) => (
              <g key={v} opacity={full}>
                <line x1={fx(v)} y1={262} x2={fx(v)} y2={270} stroke={C.muted} strokeWidth={1.5} />
                <Label x={fx(v)} y={284} tone="muted" size={15}>{v}</Label>
              </g>
            ))}
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/* ------------------------------------------------------------------ week 15 */

/** 15.1: one slip plane, four kinds of obstacle, each with its price. */
function Strengthen() {
  const rows = ["grain boundaries", "tangled dislocations", "solute atoms", "precipitates"];
  const prices = ["ductility barely touched", "ductility collapses", "alloy cost, √c returns", "furnace schedule, overaging"];
  const ry = (i: number) => 40 + i * 72;
  const obstacle = (i: number) => 1.4 + 0.45 * i; // each obstacle lands in its slip plane
  const price = (i: number) => 4 + 0.35 * i;
  return (
    <AnimatedFigure
      height={310}
      duration={5.8}
      alt="Four rows, each a slip plane with an edge dislocation moving right toward an obstacle: a grain boundary, a tangle of other dislocations, scattered solute atoms, and precipitate particles it must bow between; each row names the obstacle and its price."
      steps={[
        {
          at: 0,
          label: "Glide",
          caption: "Plastic deformation is carried by dislocations gliding along slip planes, and strengthening makes that motion more difficult.",
        },
        {
          at: 1.3,
          label: "Obstacles",
          caption: "Each mechanism installs its own obstacle: grain boundaries, tangled dislocations, solute atoms, or precipitates to bow between.",
        },
        {
          at: 3.9,
          label: "Price",
          caption: "Strength is friction against dislocation motion. Every mechanism installs a different obstacle in the slip plane — and charges a different price.",
        },
      ]}
    >
      {({ t }) => {
        const setup = op(seg(t, 0.3, 0.8));
        const showObstacle = (i: number) => op(seg(t, obstacle(i), obstacle(i) + 0.5));
        return (
          <>
            {rows.map((name, i) => {
              const y = ry(i);
              return (
                <g key={name}>
                  <line x1={20} y1={y} x2={236} y2={y} stroke={C.muted} strokeWidth={1.5} strokeDasharray="6 5" opacity={setup} />
                  <Disloc x={40} y={y} opacity={setup} />
                  <GrowArrow p={seg(t, 0.6, 1.1)} x1={58} y1={y - 8} x2={104} y2={y - 8} tone="accent" width={2} />
                  <Label x={256} y={y - 10} anchor="start" weight={600} size={16} opacity={op(seg(t, obstacle(i) + 0.1, obstacle(i) + 0.6))}>{name}</Label>
                  <Label x={256} y={y + 12} anchor="start" size={15} tone="muted" opacity={op(seg(t, price(i), price(i) + 0.5))}>{prices[i]}</Label>
                </g>
              );
            })}
            {/* grain boundary */}
            <polyline
              points={`176,${ry(0) - 28} 170,${ry(0) - 12} 178,${ry(0)} 172,${ry(0) + 14} 179,${ry(0) + 28}`}
              fill="none"
              stroke={C.ink}
              strokeWidth={3}
              opacity={showObstacle(0)}
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
              <g key={k} transform={`rotate(${rot} ${x} ${ry(1) + dy})`} opacity={showObstacle(1)}>
                <Disloc x={x} y={ry(1) + dy + 8} tone="ink" s={0.7} />
              </g>
            ))}
            {/* solute atoms */}
            {[140, 160, 178, 196, 216].map((x, k) => (
              <circle key={k} cx={x} cy={ry(2) + (k % 2 ? -4 : 4)} r={5} fill={C.brass} stroke={C.ink} strokeWidth={1} opacity={showObstacle(2)} />
            ))}
            {/* precipitates with bowing line */}
            <circle cx={170} cy={ry(3) - 25} r={9} fill={C.ink} opacity={showObstacle(3)} />
            <circle cx={170} cy={ry(3) + 25} r={9} fill={C.ink} opacity={showObstacle(3)} />
            <path
              d={`M 170 ${ry(3) - 16} Q ${lerp(170, 196, seg(t, 3, 3.6))} ${ry(3)} 170 ${ry(3) + 16}`}
              fill="none"
              stroke={C.accent}
              strokeWidth={2.5}
              opacity={showObstacle(3)}
            />
            <Label x={206} y={ry(3) + 2} size={15} tone="accent" opacity={op(seg(t, 3.3, 3.8))}>bows</Label>
          </>
        );
      }}
    </AnimatedFigure>
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
  const zoneAt = [0.5, 1.7, 3.3]; // each act opens as the anneal reaches it
  return (
    <AnimatedFigure
      height={290}
      duration={5.3}
      alt="Yield strength of a cold-worked metal against annealing time in three zones: recovery with a slight dip, recrystallization with a steep fall, and grain growth with a slow further drift down."
      steps={[
        {
          at: 0,
          label: "Recovery",
          caption: "Recovery first: dislocations untangle, and the strength dips only slightly.",
        },
        {
          at: 1.7,
          label: "Recrystallize",
          caption: "Recrystallization: new strain-free grains nucleate, and the strength falls hard.",
        },
        {
          at: 3.3,
          label: "Grain growth",
          caption:
            "Most of the softening happens in recrystallization, when strain-free grains replace the worked ones. Grain growth then quietly lowers the yield further — Hall-Petch in reverse.",
        },
      ]}
    >
      {({ t }) => {
        // Anneal time traced so far: the pen eases to a stop at each zone boundary.
        const tau = t < 1.7 ? lerp(0, 2, seg(t, 0.7, 1.5)) : t < 3.3 ? lerp(2, 5, seg(t, 1.9, 3.2)) : lerp(5, 10, seg(t, 3.4, 4.8));
        const cold = op(seg(t, 0.3, 0.8));
        return (
          <>
            {zones.map((z, i) => (
              <g key={z.name} opacity={op(seg(t, zoneAt[i], zoneAt[i] + 0.5))}>
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
            <path d={b.path(partial(pts, tau / 10))} fill="none" stroke={C.accent} strokeWidth={3} />
            <circle cx={b.px(0)} cy={b.py(f(0))} r={5} fill={C.ink} opacity={cold} />
            <Label x={b.px(0) + 10} y={b.py(f(0)) - 16} anchor="start" size={15} opacity={cold}>cold-worked</Label>
            <Label x={b.px(9.8)} y={b.py(f(9.8)) - 18} anchor="end" size={15} opacity={op(seg(t, 4.5, 5))}>coarse grains, soft</Label>
          </>
        );
      }}
    </AnimatedFigure>
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
  const rowAt = [1.4, 1.9, 3.1, 3.6]; // screened first, then the survivors
  return (
    <AnimatedFigure
      height={290}
      duration={5.3}
      alt="Horizontal bars of yield strength for four alloy-route pairs against a dashed 800 MPa floor: cold-worked 1045 at 560 and aged 2024 at 345 fall short and are out; quenched-and-tempered 1045 at 850 and 12 percent and quenched-and-tempered 4140 at 1300 and 11 percent clear it."
      steps={[
        {
          at: 0,
          label: "Floor",
          caption: "Write the requirement as numbers first: the bolt needs 800 MPa yield and 10% elongation.",
        },
        {
          at: 1.3,
          label: "Screen",
          caption: "Cold-worked 1045 gives 560 MPa and aged 2024 only 345: both miss the floor and are out.",
        },
        {
          at: 3,
          label: "Survivors",
          caption: "Q&T 1045 clears it with 850 MPa and 12% at 1.9× cost; Q&T 4140 gives 1300 MPa and 11% at 2.3×.",
        },
        {
          at: 4.8,
          label: "Rank",
          caption:
            "The floor is a guillotine: two candidates are out before ranking starts. Of the survivors, 4140 costs more but carries a 1.6 margin instead of 1.06.",
        },
      ]}
    >
      {({ t }) => (
        <>
          <line x1={px(800)} y1={26} x2={px(800)} y2={lerp(26, 260, seg(t, 0.3, 0.9))} stroke={C.alarm} strokeWidth={2} strokeDasharray="6 5" />
          <Label x={px(800)} y={16} tone="alarm" size={15} weight={600} opacity={op(seg(t, 0.4, 0.9))}>800 MPa floor</Label>
          {rows.map((r, i) => {
            const name = op(seg(t, rowAt[i], rowAt[i] + 0.4));
            const tag = op(seg(t, rowAt[i] + 0.8, rowAt[i] + 1.2));
            return (
              <g key={r.name}>
                <Label x={10} y={ry(i) - (r.sub ? 8 : 0)} anchor="start" size={16} weight={600} tone={r.tone === "muted" ? "muted" : "ink"} opacity={name}>
                  {r.name}
                </Label>
                {r.sub && (
                  <Label x={10} y={ry(i) + 12} anchor="start" size={15} tone="muted" opacity={name}>
                    {r.sub}
                  </Label>
                )}
                <rect
                  x={px(0)}
                  y={ry(i) - 14}
                  width={lerp(0, px(r.v) - px(0), seg(t, rowAt[i] + 0.1, rowAt[i] + 0.9))}
                  height={28}
                  rx={3}
                  fill={r.tone === "accent" ? C.soft : r.tone === "ink" ? C.line : "none"}
                  stroke={C[r.tone]}
                  strokeWidth={r.tone === "accent" ? 2.5 : 1.5}
                  strokeDasharray={r.tone === "muted" ? "4 3" : undefined}
                />
                {r.tone === "ink" ? (
                  <Label x={px(r.v) + 8} y={ry(i)} anchor="start" size={15} opacity={tag}>
                    {r.tag}
                  </Label>
                ) : (
                  <Label x={px(r.v) - 8} y={ry(i)} anchor="end" size={15} tone={r.tone} weight={r.tone === "accent" ? 600 : undefined} opacity={tag}>
                    {r.tag}
                  </Label>
                )}
              </g>
            );
          })}
          <Label x={px(0)} y={276} anchor="start" tone="muted" size={15} opacity={op(seg(t, 0.6, 1.1))}>yield strength (MPa) · elongation floor 10%</Label>
        </>
      )}
    </AnimatedFigure>
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
