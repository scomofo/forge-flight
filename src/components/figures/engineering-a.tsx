import { Arrow, Axes, C, DimH, Figure, Ground, Label, WallV, plotBox, type FigureMap } from "./kit";
import { AnimatedFigure, clamp, GrowArrow, lerp, op, seg } from "./motion";

/* ---------- local helpers ---------- */

/** A table cell: outlined rectangle with centred text. */
function Cell({
  x,
  y,
  w,
  h,
  text,
  tone = "ink",
  fill = "none",
  stroke = C.line,
  weight,
  anchor = "middle",
  opacity,
  fillOpacity,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  text?: string;
  tone?: "ink" | "accent" | "muted" | "alarm";
  fill?: string;
  stroke?: string;
  weight?: number;
  anchor?: "start" | "middle";
  opacity?: number;
  fillOpacity?: number;
}) {
  return (
    <g opacity={opacity}>
      <rect x={x} y={y} width={w} height={h} fill={fill} fillOpacity={fillOpacity} stroke={stroke} strokeWidth={1.5} />
      {text ? (
        <Label x={anchor === "middle" ? x + w / 2 : x + 8} y={y + h / 2} tone={tone} size={15} weight={weight} anchor={anchor}>
          {text}
        </Label>
      ) : null}
    </g>
  );
}

/** A labelled box with a small muted title and one or two lines of text. */
function Box({
  x,
  y,
  w,
  title,
  lines,
  tone = "ink",
  opacity,
}: {
  x: number;
  y: number;
  w: number;
  title: string;
  lines: string[];
  tone?: "ink" | "accent";
  opacity?: number;
}) {
  const h = 30 + lines.length * 20;
  return (
    <g opacity={opacity}>
      <rect x={x} y={y} width={w} height={h} rx={6} fill={tone === "accent" ? C.soft : C.surface} stroke={C[tone]} strokeWidth={2} />
      <Label x={x + w / 2} y={y + 16} tone="muted" size={15}>
        {title}
      </Label>
      {lines.map((l, i) => (
        <Label key={l} x={x + w / 2} y={y + 38 + i * 20} size={15} tone={tone}>
          {l}
        </Label>
      ))}
    </g>
  );
}

/* ---------- W21 ---------- */

/** requirements: a mood becomes a line a design can fail. */
function Requirements() {
  const px = (g: number) => 40 + g * 1.6;
  return (
    <AnimatedFigure
      height={250}
      duration={4.7}
      alt="A speech bubble saying 'light' turns into the requirement 'mass at most 150 g', drawn as a pass/fail line on a mass scale where a 200 g concept lands in the fail zone."
      steps={[
        { at: 0, label: "Need", caption: "The bike light's brief says 'light': a real stakeholder need, but still a mood." },
        {
          at: 1.3,
          label: "Requirement",
          caption: "Engineering gives it a number, a unit and a limit: the light shall have a mass of at most 150 g.",
        },
        {
          at: 2.7,
          label: "Pass/fail",
          caption: "On a mass scale the requirement becomes a line: 150 g or less passes, anything heavier fails.",
        },
        {
          at: 4,
          label: "Concept",
          caption:
            "The need can't lose an argument; the requirement can. A 200 g concept fails the 150 g line on day one, no taste involved.",
        },
      ]}
    >
      {({ t }) => {
        const scale = op(seg(t, 2.7, 3.2));
        const line = seg(t, 2.9, 3.4); // the 150 g line rises off the scale
        const zone = seg(t, 3.1, 3.7); // and the pass zone sweeps up to it
        const land = seg(t, 4, 4.5);
        return (
          <>
            <rect x={20} y={24} width={130} height={44} rx={20} fill={C.surface} stroke={C.muted} strokeWidth={2} />
            <path d="M50,68 L42,84 L66,68" fill={C.surface} stroke={C.muted} strokeWidth={2} />
            <line x1={51} y1={67} x2={65} y2={67} stroke={C.surface} strokeWidth={3} />
            <Label x={85} y={46} tone="muted" size={17} serif>
              “light”
            </Label>
            <Label x={85} y={100} tone="muted" size={15} opacity={op(seg(t, 0.4, 0.9))}>
              need: a mood
            </Label>
            <GrowArrow p={seg(t, 1.3, 1.8)} x1={160} y1={46} x2={206} y2={46} tone="ink" width={2} />
            <g opacity={op(seg(t, 1.6, 2.1))}>
              <rect x={214} y={24} width={246} height={44} rx={4} fill={C.soft} stroke={C.accent} strokeWidth={2} />
              <Label x={337} y={46} tone="accent" size={17} weight={600}>
                mass shall be ≤ 150 g
              </Label>
            </g>
            <Label x={337} y={100} tone="accent" size={15} opacity={op(seg(t, 1.9, 2.4))}>
              requirement: can fail
            </Label>

            {/* the pass/fail scale */}
            {zone > 0 ? <rect x={px(0)} y={160} width={lerp(0, px(150) - px(0), zone)} height={30} fill={C.soft} /> : null}
            <Label x={(px(0) + px(150)) / 2} y={175} tone="accent" size={15} opacity={op(seg(t, 3.3, 3.8))}>
              pass
            </Label>
            <Label x={px(235)} y={175} tone="alarm" size={15} opacity={op(seg(t, 3.5, 4))}>
              fail
            </Label>
            <line x1={px(0)} y1={190} x2={px(250)} y2={190} stroke={C.ink} strokeWidth={2} opacity={scale} />
            {line > 0 ? <line x1={px(150)} y1={lerp(200, 146, line)} x2={px(150)} y2={200} stroke={C.accent} strokeWidth={3} /> : null}
            {[0, 150, 200, 250].map((g) => (
              <g key={g} opacity={scale}>
                <line x1={px(g)} y1={190} x2={px(g)} y2={198} stroke={C.ink} strokeWidth={1.5} />
                <Label x={px(g)} y={214} tone="muted" size={15}>
                  {`${g} g`}
                </Label>
              </g>
            ))}
            <path
              d={`M${px(200) - 9},150 L${px(200) + 9},150 L${px(200)},166 z`}
              fill={C.alarm}
              opacity={op(land)}
              transform={land < 1 ? `translate(0,${lerp(-14, 0, land).toFixed(1)})` : undefined}
            />
            <Label x={px(200)} y={134} tone="alarm" size={15} opacity={op(seg(t, 4.1, 4.6))}>
              concept: 200 g
            </Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** verifyvalidate: two different checks against two different things. */
function VerifyValidate() {
  return (
    <AnimatedFigure
      height={270}
      duration={4.6}
      alt="Three boxes: the need 'phone charged by morning', the requirement '5.0 V ± 0.25 V up to 3.0 A', and the charger; verification links the charger to the requirement, validation links the charger back to the need."
      steps={[
        {
          at: 0,
          label: "Write",
          caption: "The need is a phone charged by morning; the requirement writes it down as 5.0 V ± 0.25 V at up to 3.0 A.",
        },
        {
          at: 1.6,
          label: "Verify",
          caption: "Verification tests the built charger against the requirement: step a load from 0 to 3 A and read the voltage.",
        },
        {
          at: 3.3,
          label: "Validate",
          caption:
            "Verification checks the charger against the requirement on a bench; validation checks it against the need, in users' hands. A pass on one says nothing about the other.",
        },
      ]}
    >
      {({ t }) => {
        // Two-headed arrows fade in over their first quarter, so the heads don't pile up while short.
        const ver = seg(t, 2, 2.6);
        const val = seg(t, 3.3, 3.9);
        return (
          <>
            <Box x={16} y={16} w={170} title="need" lines={["phone charged", "by morning"]} />
            <Box x={294} y={16} w={170} title="requirement" lines={["5.0 V ± 0.25 V", "up to 3.0 A"]} tone="accent" opacity={op(seg(t, 0.8, 1.3))} />
            <Box x={160} y={196} w={160} title="product" lines={["the charger"]} opacity={op(seg(t, 1.6, 2.1))} />
            <GrowArrow p={seg(t, 0.4, 0.9)} x1={192} y1={50} x2={286} y2={50} tone="muted" width={2} />
            <Label x={240} y={34} tone="muted" size={15} opacity={op(seg(t, 0.5, 1))}>
              write
            </Label>

            <GrowArrow p={ver} x1={300} y1={190} x2={368} y2={92} tone="accent" width={2.5} both opacity={op(4 * ver)} />
            <Label x={346} y={140} tone="accent" size={15} anchor="start" weight={600} opacity={op(seg(t, 2.4, 2.9))}>
              verification
            </Label>
            <Label x={352} y={160} tone="accent" size={15} anchor="start" opacity={op(seg(t, 2.6, 3.1))}>
              built it right?
            </Label>

            <GrowArrow p={val} x1={180} y1={190} x2={112} y2={92} tone="ink" width={2.5} both dashed opacity={op(4 * val)} />
            <Label x={134} y={140} size={15} anchor="end" weight={600} opacity={op(seg(t, 3.7, 4.2))}>
              validation
            </Label>
            <Label x={128} y={160} size={15} anchor="end" opacity={op(seg(t, 3.9, 4.4))}>
              right thing?
            </Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** ledger: the Orbiter's two entries, with the empty provenance cell. */
function Ledger() {
  const cols = [20, 70, 200, 320, 390, 460];
  const heads = ["entry", "claim", "provenance", "conf.", "resolved"];
  const rows = [
    ["A-1", "expects N·s", "spec §4.2", "high", "yes"],
    ["A-2", "sends lbf·s", "(empty)", "low", "no"],
  ];
  return (
    <AnimatedFigure
      height={230}
      duration={4.2}
      alt="An assumption ledger with two rows: A-1, trajectory software expects newton-seconds, source spec section 4.2, high confidence, resolved; A-2, subcontractor sends pound-force seconds, provenance empty, low confidence, unresolved, highlighted as the riskiest line."
      steps={[
        {
          at: 0,
          label: "A-1",
          caption: "Entry A-1: the trajectory software expects newton-seconds, sourced to spec §4.2, high confidence, resolved.",
        },
        {
          at: 1.6,
          label: "A-2",
          caption: "Entry A-2: the subcontractor sends pound-force seconds, with no provenance, low confidence, and no resolution.",
        },
        {
          at: 3.1,
          label: "Riskiest",
          caption: "Row A-2 has no source, low confidence, and no resolution: one glance finds the line that lost the Orbiter.",
        },
      ]}
    >
      {({ t }) => (
        <>
          {heads.map((h, i) => (
            <Cell key={h} x={cols[i]} y={24} w={cols[i + 1] - cols[i]} h={34} text={h} tone="muted" />
          ))}
          {rows.map((r, j) => {
            const bad = j === 1;
            return r.map((text, i) => {
              const a = 0.4 + 1.3 * j + 0.15 * i; // row by row, left to right
              return (
                <Cell
                  key={`${j}-${i}`}
                  x={cols[i]}
                  y={58 + j * 42}
                  w={cols[i + 1] - cols[i]}
                  h={42}
                  text={text}
                  tone={bad && i >= 2 ? "alarm" : i === 0 ? "muted" : "ink"}
                  weight={bad && i === 2 ? 600 : undefined}
                  opacity={op(seg(t, a, a + 0.5))}
                />
              );
            });
          })}
          <rect x={20} y={100} width={440} height={42} fill="none" stroke={C.alarm} strokeWidth={3} opacity={op(seg(t, 3.1, 3.6))} />
          <GrowArrow p={seg(t, 3.3, 3.8)} x1={260} y1={186} x2={260} y2={148} tone="alarm" width={2} />
          <Label x={260} y={202} tone="alarm" size={15} opacity={op(seg(t, 3.5, 4))}>
            riskiest line: no source, low confidence
          </Label>
        </>
      )}
    </AnimatedFigure>
  );
}

/* ---------- W22 ---------- */

function Deck({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <rect x={cx - 70} y={cy - 6} width={140} height={10} fill={C.soft} stroke={C.ink} strokeWidth={2} />
      <rect x={cx - 64} y={cy + 4} width={8} height={18} fill={C.ink} />
      <rect x={cx + 56} y={cy + 4} width={8} height={18} fill={C.ink} />
    </g>
  );
}

/** modelvalid: the model asked about a steady push; the bridge died of twisting. */
function ModelValid() {
  const onset = 2.8; // the real deck starts to twist
  const period = 0.9; // one twist cycle, s (schematic)
  return (
    <AnimatedFigure
      height={250}
      duration={5.6}
      alt="Two bridge-deck cross-sections: on the left a steady design wind pushes a deck that holds; on the right a 64 km/h wind sets the same deck twisting back and forth in torsional flutter."
      steps={[
        {
          at: 0,
          label: "Model",
          caption: "The design model asked whether the deck holds a steady design wind far stronger than 64 km/h, and it does, with margin.",
        },
        {
          at: 2,
          label: "Reality",
          caption: "In a 64 km/h wind, well below the design wind, the real deck began to twist back and forth: aeroelastic flutter.",
        },
        {
          at: 4.7,
          label: "Torn apart",
          caption:
            "The model answered its own question correctly — the deck holds a steady push. It had no vocabulary for the twist that actually tore the bridge apart.",
        },
      ]}
    >
      {({ t, raw, duration }) => {
        // Flutter feeds itself: the twist grows each cycle to the static ±12°, lands on −12° at the final
        // frame, and keeps going through the end hold.
        const u = clamp((t - onset) / (duration - onset));
        const grow = (Math.exp(2 * u) - 1) / (Math.exp(2) - 1);
        const twist = -12 * grow * Math.cos((2 * Math.PI * (raw - duration)) / period);
        const real = op(seg(t, 2, 2.5));
        const apart = seg(t, 4.7, 5.2);
        return (
          <>
            <line x1={240} y1={20} x2={240} y2={230} stroke={C.line} strokeWidth={1.5} />
            <Label x={120} y={28} size={15} weight={600}>
              modelled: steady push
            </Label>
            <Label x={360} y={28} size={15} weight={600} tone="alarm" opacity={real}>
              reality: flutter
            </Label>

            {[108, 128, 148].map((y, i) => (
              <GrowArrow key={y} p={seg(t, 0.4 + 0.1 * i, 0.9 + 0.1 * i)} x1={14} y1={y} x2={50} y2={y} tone="muted" width={2} />
            ))}
            <Deck cx={140} cy={128} />
            <Label x={120} y={184} tone="muted" size={15} opacity={op(seg(t, 0.9, 1.4))}>
              design wind ≫ 64 km/h
            </Label>
            <Label x={120} y={208} tone="accent" size={15} weight={600} opacity={op(seg(t, 1.3, 1.8))}>
              deck holds ✓
            </Label>

            {[108, 128, 148].map((y, i) => (
              <GrowArrow key={y} p={seg(t, 2.3 + 0.1 * i, 2.8 + 0.1 * i)} x1={250} y1={y} x2={278} y2={y} tone="muted" width={2} />
            ))}
            <g opacity={0.35 * apart}>
              <g transform="rotate(12 372 128)">
                <Deck cx={372} cy={128} />
              </g>
            </g>
            <g transform={`rotate(${+twist.toFixed(2)} 372 128)`} opacity={real}>
              <Deck cx={372} cy={128} />
            </g>
            <path
              d="M306,82 A80,80 0 0 1 438,82"
              fill="none"
              stroke={C.alarm}
              strokeWidth={2.5}
              markerStart="url(#fig-arrow-alarm)"
              markerEnd="url(#fig-arrow-alarm)"
              opacity={op(apart)}
            />
            <Label x={360} y={184} tone="muted" size={15} opacity={op(seg(t, 2.5, 3))}>
              wind 64 km/h
            </Label>
            <Label x={360} y={208} tone="alarm" size={15} weight={600} opacity={op(apart)}>
              deck twists apart
            </Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** errprop: two pushes add straight (worst case) or at right angles (RSS). */
function ErrProp() {
  const k = 1.3;
  const x0 = 40;
  const y0 = 172;
  const xp = x0 + 196 * k;
  const yd = y0 - 79 * k;
  return (
    <AnimatedFigure
      height={270}
      duration={4.9}
      alt="A right triangle whose legs are the pressure contribution 196 N and the diameter contribution 79 N, with hypotenuse RSS 211 N; below it the two contributions laid end to end make the worst case 275 N."
      steps={[
        {
          at: 0,
          label: "Inputs",
          caption: "F = p·A = 19.635 kN: the pressure's ±0.1 MPa moves it by 196 N, the diameter's ±0.1 mm by 79 N.",
        },
        { at: 1.9, label: "Worst case", caption: "If the two errors conspire, they add end to end: 196 + 79 = 275 N, ±1.40%." },
        {
          at: 3.5,
          label: "RSS",
          caption:
            "Independent errors combine at right angles (RSS, 211 N); conspiring errors line up end to end (worst case, 275 N). Pressure is the long leg either way.",
        },
      ]}
    >
      {({ t }) => {
        const legP = seg(t, 0.4, 0.9);
        const legD = seg(t, 1, 1.4);
        const endP = seg(t, 1.9, 2.4); // worst case: pressure first,
        const endD = seg(t, 2.4, 2.8); // then diameter on its tip
        const rss = seg(t, 3.6, 4.2);
        return (
          <>
            <Label x={40} y={26} anchor="start" size={15} tone="muted">
              F = p·A = 19.635 kN
            </Label>
            {legP > 0 ? <line x1={x0} y1={y0} x2={lerp(x0, xp, legP)} y2={y0} stroke={C.ink} strokeWidth={4} /> : null}
            {legD > 0 ? <line x1={xp} y1={y0} x2={xp} y2={lerp(y0, yd, legD)} stroke={C.brass} strokeWidth={4} /> : null}
            <path
              d={`M${xp - 12},${y0} L${xp - 12},${y0 - 12} L${xp},${y0 - 12}`}
              fill="none"
              stroke={C.muted}
              strokeWidth={1.5}
              opacity={op(seg(t, 3.5, 3.9))}
            />
            {rss > 0 ? <line x1={x0} y1={y0} x2={lerp(x0, xp, rss)} y2={lerp(y0, yd, rss)} stroke={C.accent} strokeWidth={4} /> : null}
            <Label x={(x0 + xp) / 2} y={y0 + 18} size={15} opacity={op(seg(t, 0.7, 1.2))}>
              pressure 196 N
            </Label>
            <Label x={xp + 10} y={(y0 + yd) / 2 - 10} anchor="start" size={15} opacity={op(seg(t, 1.2, 1.7))}>
              diameter
            </Label>
            <Label x={xp + 10} y={(y0 + yd) / 2 + 10} anchor="start" size={15} opacity={op(seg(t, 1.2, 1.7))}>
              79 N
            </Label>
            <Label x={140} y={96} anchor="end" tone="accent" size={16} weight={600} opacity={op(seg(t, 4, 4.5))}>
              RSS 211 N
            </Label>
            <Label x={140} y={116} anchor="end" tone="accent" size={15} opacity={op(seg(t, 4.2, 4.7))}>
              ±1.08%
            </Label>

            {endP > 0 ? <line x1={x0} y1={222} x2={lerp(x0, xp, endP)} y2={222} stroke={C.ink} strokeWidth={4} /> : null}
            {endD > 0 ? <line x1={xp} y1={222} x2={lerp(xp, xp + 79 * k, endD)} y2={222} stroke={C.brass} strokeWidth={4} /> : null}
            <line x1={x0} y1={212} x2={x0} y2={232} stroke={C.ink} strokeWidth={1.5} opacity={op(seg(t, 1.9, 2.3))} />
            <line x1={xp + 79 * k} y1={212} x2={xp + 79 * k} y2={232} stroke={C.ink} strokeWidth={1.5} opacity={op(seg(t, 2.6, 3))} />
            <Label x={(x0 + xp + 79 * k) / 2} y={246} size={15} weight={600} opacity={op(seg(t, 2.8, 3.3))}>
              worst case 275 N · ±1.40%
            </Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** sensitivity: variance shares, then what each purchase buys back. */
function Sensitivity() {
  const x0 = 40;
  const w = 400;
  const xs = x0 + w * 0.86;
  const b0 = 176;
  const bw = (v: number) => (v / 211) * 220;
  const rows: Array<[string, number, "ink" | "accent" | "muted"]> = [
    ["now", 211, "ink"],
    ["halve p ±", 126, "accent"],
    ["halve d ±", 200, "muted"],
  ];
  // Row i fades in at show[i]; "now" grows from zero, each purchase starts at today's 211 N and shrinks to what it buys.
  const show = [2.9, 3.9, 4.2];
  return (
    <AnimatedFigure
      height={280}
      duration={5.5}
      alt="A bar split 86 percent pressure and 14 percent diameter variance share, with leverages S_p = 1 and S_d = 2; below, RSS uncertainty now 211 N, 126 N after halving the pressure uncertainty, and 200 N after halving the diameter uncertainty."
      steps={[
        { at: 0, label: "Leverage", caption: "Area squares the diameter, so its leverage S_d = 2 is twice the pressure's S_p = 1." },
        {
          at: 1.3,
          label: "Shares",
          caption: "But leverage isn't the bill: with p ± 1% and d ± 0.2%, pressure owns 86% of the variance and diameter 14%.",
        },
        { at: 2.8, label: "Now", caption: "Today the two combine to an RSS uncertainty of 211 N." },
        {
          at: 3.9,
          label: "Spend",
          caption:
            "The diameter has double the leverage but owns only 14% of the scatter. Halving the pressure ± buys 85 N back; halving the diameter ± buys 11 N.",
        },
      ]}
    >
      {({ t }) => {
        const shareP = seg(t, 1.3, 2);
        const shareD = seg(t, 2, 2.4);
        return (
          <>
            <Label x={x0} y={24} anchor="start" size={15} opacity={op(seg(t, 1.6, 2.1))}>
              pressure 86%
            </Label>
            <Label x={x0 + w} y={24} anchor="end" size={15} tone="muted" opacity={op(seg(t, 2.1, 2.6))}>
              diameter 14%
            </Label>
            {shareP > 0 ? <rect x={x0} y={40} width={lerp(0, xs - x0, shareP)} height={28} fill={C.accent} /> : null}
            {shareD > 0 ? <rect x={xs} y={40} width={lerp(0, x0 + w - xs, shareD)} height={28} fill={C.muted} /> : null}
            <Label x={(x0 + xs) / 2} y={86} size={15} tone="muted">
              leverage S_p = 1
            </Label>
            <Label x={x0 + w} y={86} anchor="end" size={15} tone="muted" opacity={op(seg(t, 0.4, 0.9))}>
              S_d = 2
            </Label>

            <Label x={x0} y={132} anchor="start" size={15} tone="muted" opacity={op(seg(t, 2.8, 3.3))}>
              RSS after spending:
            </Label>
            {rows.map(([name, v, tone], i) => {
              const y = 150 + i * 38;
              const a = show[i];
              const p = i === 0 ? seg(t, a + 0.1, a + 0.7) : seg(t, a + 0.3, a + 0.9);
              const width = i === 0 ? lerp(0, bw(v), p) : lerp(bw(211), bw(v), p);
              return (
                <g key={name} opacity={op(seg(t, a, a + 0.4))}>
                  <Label x={x0} y={y + 11} anchor="start" size={15} tone={tone === "muted" ? "ink" : tone}>
                    {name}
                  </Label>
                  {width > 2 ? (
                    <rect x={b0} y={y} width={width} height={22} fill={tone === "accent" ? C.accent : tone === "muted" ? C.line : C.soft} stroke={C[tone]} strokeWidth={1.5} />
                  ) : null}
                  <Label
                    x={b0 + bw(v) + 8}
                    y={y + 11}
                    anchor="start"
                    size={15}
                    tone={tone === "muted" ? "ink" : tone}
                    weight={tone === "accent" ? 600 : undefined}
                    opacity={op(seg(t, a + 0.7, a + 1.2))}
                  >
                    {`${v} N`}
                  </Label>
                </g>
              );
            })}
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/* ---------- W23 ---------- */

/** The polyline `pts` cut `d` along its length; once `d` reaches the end, `pts` itself. */
function upTo(pts: Array<[number, number]>, d: number): Array<[number, number]> {
  const out: Array<[number, number]> = [pts[0]];
  let left = d;
  for (let i = 1; i < pts.length; i++) {
    const [xa, ya] = pts[i - 1];
    const [xb, yb] = pts[i];
    const len = Math.hypot(xb - xa, yb - ya);
    if (left < len) {
      const q = left / len;
      out.push([xa + (xb - xa) * q, ya + (yb - ya) * q]);
      return out;
    }
    out.push(pts[i]);
    left -= len;
  }
  return pts;
}

/** The load path from the rope's end to the top of the frame. */
const LOAD_PATH: Array<[number, number]> = [
  [18, 160],
  [150, 160],
  [250, 160],
  [250, 180],
  [320, 180],
  [320, 178],
  [420, 178],
  [420, 44],
];

/** loadpath: glider tow hook, rope to frame, every link with its load. */
function LoadPath() {
  return (
    <AnimatedFigure
      height={280}
      duration={5}
      alt="Side view of a glider tow hook: the rope pulls 2 kN forward on a hook pinned through a lug; the lug's bracket is held by two bolts at 1 kN shear each into the fuselage frame, and a highlighted path runs from rope to frame."
      steps={[
        { at: 0, label: "Rope", caption: "A glider tow hook rated for a 2 kN release load: the rope pulls on it with 2 kN of tension." },
        { at: 1.3, label: "Lug", caption: "The hook passes all 2 kN into the lug, through its pin hole." },
        { at: 2.4, label: "Bolts", caption: "The bracket splits it across two bolts: 1 kN of shear each." },
        {
          at: 3.6,
          label: "Frame",
          caption:
            "Every newton from the rope passes through the lug, splits across the two bolts, and runs into the frame. Each link on the path gets a named load and a check.",
        },
      ]}
    >
      {({ t }) => {
        // Trace the path link by link: to the lug's pin (132 px), past both bolts (324), up the frame (558).
        const d = lerp(0, 132, seg(t, 1.3, 1.9)) + lerp(0, 192, seg(t, 2.4, 3.1)) + lerp(0, 234, seg(t, 3.6, 4.3));
        return (
          <>
            {/* frame and its flange */}
            <rect x={410} y={40} width={20} height={190} fill={C.soft} stroke={C.ink} strokeWidth={2} />
            <rect x={200} y={170} width={210} height={16} fill={C.soft} stroke={C.ink} strokeWidth={2} />
            <Label x={420} y={24} size={15}>
              frame
            </Label>
            {/* bracket plate + lug */}
            <path d="M180,154 L370,154 L370,170 L180,170 z" fill={C.surface} stroke={C.ink} strokeWidth={2} />
            <path d="M180,146 L150,146 A12,12 0 0 0 150,170 L180,170 z" fill={C.surface} stroke={C.ink} strokeWidth={2} />
            <line x1={180} y1={146} x2={180} y2={154} stroke={C.ink} strokeWidth={2} />
            <circle cx={150} cy={158} r={5} fill={C.ink} />
            {/* bolts */}
            {[250, 320].map((x) => (
              <g key={x}>
                <rect x={x - 4} y={150} width={8} height={42} fill={C.ink} />
                <rect x={x - 9} y={144} width={18} height={8} fill={C.ink} />
                <rect x={x - 8} y={186} width={16} height={7} fill={C.ink} />
              </g>
            ))}
            {/* hook ring + rope */}
            <line x1={150} y1={158} x2={118} y2={158} stroke={C.ink} strokeWidth={3} />
            <circle cx={108} cy={158} r={10} fill="none" stroke={C.ink} strokeWidth={3} />
            <line x1={98} y1={158} x2={50} y2={158} stroke={C.ink} strokeWidth={3} strokeDasharray="2 3" />
            <GrowArrow p={seg(t, 0.4, 0.9)} x1={50} y1={158} x2={16} y2={158} tone="accent" width={3} />

            {/* highlighted load path, drawn over the parts, translucent */}
            {d > 0 ? (
              <polyline
                points={upTo(LOAD_PATH, d)
                  .map(([x, y]) => `${+x.toFixed(1)},${+y.toFixed(1)}`)
                  .join(" ")}
                fill="none"
                stroke={C.accent}
                strokeWidth={10}
                strokeLinejoin="round"
                opacity={0.4}
              />
            ) : null}
            <Label x={58} y={130} size={15} tone="accent" weight={600} opacity={op(seg(t, 0.6, 1.1))}>
              rope 2 kN
            </Label>
            <Label x={155} y={118} size={15} opacity={op(seg(t, 1.7, 2.2))}>
              lug 2 kN
            </Label>
            <Label x={285} y={118} size={15} opacity={op(seg(t, 2.8, 3.3))}>
              bolts 1 kN
            </Label>
            <Label x={285} y={136} size={15} opacity={op(seg(t, 2.8, 3.3))}>
              shear each
            </Label>

            <Label x={240} y={236} size={15} tone="accent" weight={600} opacity={op(seg(t, 4.1, 4.6))}>
              rope → hook → lug → 2 bolts → frame
            </Label>
            <Label x={240} y={260} size={15} tone="muted" opacity={op(seg(t, 4.4, 4.9))}>
              → longerons → wing
            </Label>
          </>
        );
      }}
    </AnimatedFigure>
  );
}

/** margins: two rows of the margin table, applied against allowable. */
function Margins() {
  const px = (s: number) => 126 + s * 0.95;
  const rows = [
    { name: "limit", load: "12 kN", app: 120, allow: 276, allowName: "276 yield", ms: "MS 1.30", gov: false },
    { name: "ultimate", load: "18 kN", app: 180, allow: 310, allowName: "310 ult.", ms: "MS 0.72", gov: true },
  ];
  return (
    <AnimatedFigure
      height={250}
      duration={4.8}
      alt="Two margin-table rows as bars: limit load 12 kN gives 120 MPa against 276 MPa yield, MS 1.30; ultimate load 18 kN gives 180 MPa against 310 MPa ultimate strength, MS 0.72, marked as governing."
      steps={[
        {
          at: 0,
          label: "Limit",
          caption: "At the 12 kN limit load the 100 mm² lug sees 120 MPa against a 276 MPa yield: MS = 276/120 − 1 = 1.30.",
        },
        {
          at: 2.2,
          label: "Ultimate",
          caption: "Ultimate load is 12 × 1.5 = 18 kN: 180 MPa against the 310 MPa ultimate strength, MS 0.72.",
        },
        {
          at: 4.1,
          label: "Governs",
          caption:
            "The 1.5 factor raises the applied stress more than the step from yield to ultimate raises the allowable, so the ultimate row is the worst line — and it still passes.",
        },
      ]}
    >
      {({ t }) => (
        <>
          {rows.map((r, i) => {
            const y = 56 + i * 80;
            const a = 0.3 + 1.9 * i; // the row's start
            const name = op(seg(t, a, a + 0.5));
            const allow = seg(t, a + 0.2, a + 0.8); // the allowable sweeps out,
            const app = seg(t, a + 0.7, a + 1.2); // then the applied stress climbs into it
            return (
              <g key={r.name}>
                <Label x={20} y={y + 4} anchor="start" size={15} weight={600} tone={r.gov ? "accent" : "ink"} opacity={name}>
                  {r.name}
                </Label>
                <Label x={20} y={y + 24} anchor="start" size={15} tone="muted" opacity={name}>
                  {r.load}
                </Label>
                {allow > 0.02 ? (
                  <rect x={px(0)} y={y} width={lerp(0, px(r.allow) - px(0), allow)} height={28} fill={C.soft} stroke={C.muted} strokeWidth={1.5} />
                ) : null}
                {app > 0 ? <rect x={px(0)} y={y} width={lerp(0, px(r.app) - px(0), app)} height={28} fill={C.accent} /> : null}
                <Label x={px(r.app)} y={y - 12} size={15} tone="accent" opacity={op(seg(t, a + 1, a + 1.5))}>
                  {`${r.app}`}
                </Label>
                <Label x={px(r.allow)} y={y - 12} size={15} tone="muted" opacity={op(seg(t, a + 0.5, a + 1))}>
                  {r.allowName}
                </Label>
                <Label x={(px(r.app) + px(r.allow)) / 2} y={y + 14} size={15} weight={r.gov ? 700 : undefined} opacity={op(seg(t, a + 1.3, a + 1.8))}>
                  {r.ms}
                </Label>
                {r.gov ? (
                  <Label x={(px(r.app) + px(r.allow)) / 2} y={y + 44} size={15} tone="accent" weight={600} opacity={op(seg(t, 4.1, 4.6))}>
                    governs
                  </Label>
                ) : null}
              </g>
            );
          })}
          <line x1={px(0)} y1={214} x2={px(320)} y2={214} stroke={C.ink} strokeWidth={1.5} />
          {[0, 100, 200, 300].map((s) => (
            <g key={s}>
              <line x1={px(s)} y1={214} x2={px(s)} y2={221} stroke={C.ink} strokeWidth={1.5} />
              <Label x={px(s)} y={234} size={15} tone="muted">
                {`${s}`}
              </Label>
            </g>
          ))}
          <Label x={px(320) + 6} y={214} size={15} tone="muted" anchor="start">
            MPa
          </Label>
        </>
      )}
    </AnimatedFigure>
  );
}

/** fmea: S, O, D before and after the second spring, and the RPN they multiply to. */
function Fmea() {
  const sx = (v: number) => 130 + ((v - 1) / 9) * 290;
  const scores: Array<[string, number, number, string]> = [
    ["severity", 9, 9, "9"],
    ["occurrence", 3, 1, "3 → 1"],
    ["detection", 5, 2, "5 → 2"],
  ];
  const rx = (v: number) => 130 + (v / 150) * 290;
  return (
    <Figure
      height={300}
      alt="Three 1-to-10 scales for the tow release's failure to release: severity stays 9, occurrence drops from 3 to 1, detection from 5 to 2; below, the risk priority number falls from 135 to 18."
      caption="Severity is fixed by physics, so the second spring and the load-cell check buy risk down through occurrence and detection: RPN 135 → 18."
    >
      <circle cx={300} cy={18} r={7} fill="none" stroke={C.alarm} strokeWidth={2.5} />
      <Label x={312} y={18} anchor="start" size={15} tone="muted">
        before
      </Label>
      <circle cx={386} cy={18} r={6} fill={C.accent} />
      <Label x={398} y={18} anchor="start" size={15} tone="muted">
        after
      </Label>
      {scores.map(([name, b, a, txt], i) => {
        const y = 56 + i * 40;
        return (
          <g key={name}>
            <Label x={20} y={y} anchor="start" size={15}>
              {name}
            </Label>
            <line x1={sx(1)} y1={y} x2={sx(10)} y2={y} stroke={C.line} strokeWidth={2} />
            {Array.from({ length: 10 }, (_, j) => (
              <circle key={j} cx={sx(j + 1)} cy={y} r={2.5} fill={C.muted} />
            ))}
            {a !== b ? <Arrow x1={sx(b) - 10} y1={y} x2={sx(a) + 10} y2={y} tone="accent" width={2} /> : null}
            <circle cx={sx(a)} cy={y} r={6} fill={C.accent} />
            <circle cx={sx(b)} cy={y} r={9} fill="none" stroke={C.alarm} strokeWidth={2.5} />
            <Label x={sx(10) + 16} y={y} anchor="start" size={15} weight={600}>
              {txt}
            </Label>
          </g>
        );
      })}
      <Label x={sx(1)} y={160} size={15} tone="muted">
        1
      </Label>
      <Label x={sx(10)} y={160} size={15} tone="muted">
        10
      </Label>

      <Label x={20} y={196} anchor="start" size={15} tone="muted">
        RPN = S × O × D
      </Label>
      <Label x={20} y={228} anchor="start" size={15}>
        before
      </Label>
      <rect x={rx(0)} y={216} width={rx(135) - rx(0)} height={24} fill={C.alarm} />
      <Label x={rx(135) + 8} y={228} anchor="start" size={15} tone="alarm" weight={600}>
        135
      </Label>
      <Label x={20} y={266} anchor="start" size={15}>
        after
      </Label>
      <rect x={rx(0)} y={254} width={rx(18) - rx(0)} height={24} fill={C.accent} />
      <Label x={rx(18) + 8} y={266} anchor="start" size={15} tone="accent" weight={600}>
        18
      </Label>
      <Label x={rx(150)} y={266} anchor="end" size={15} tone="muted">
        Δ = 117
      </Label>
    </Figure>
  );
}

/* ---------- W24 ---------- */

/** bending: cantilevered tube, M at the wall, linear stress across the section. */
function Bending() {
  const cy = 118;
  return (
    <Figure
      height={290}
      alt="A square aluminum tube cantilevered 1.2 m from a wall with a 500 N tip load, giving 600 N·m at the wall; beside it the 40 by 40 by 3 mm section with a linear stress profile, plus 117.7 MPa tension at the top fiber and minus 117.7 MPa compression at the bottom, zero at the neutral axis."
      caption="Stress grows linearly from zero at the neutral axis to 117.7 MPa at the outer fibers — which is why the tube puts its material out there."
    >
      <WallV x={30} y={60} h={110} side="left" />
      <rect x={30} y={cy - 9} width={220} height={18} fill={C.soft} stroke={C.ink} strokeWidth={2} />
      <Arrow x1={250} y1={42} x2={250} y2={cy - 12} tone="accent" width={3} />
      <Label x={244} y={36} anchor="end" tone="accent" size={15} weight={600}>
        500 N
      </Label>
      <DimH x1={30} x2={250} y={160} label="1.2 m" />
      <Label x={40} y={196} anchor="start" size={15} tone="accent" weight={600}>
        M = 600 N·m at wall
      </Label>

      {/* section */}
      <rect x={296} y={cy - 35} width={70} height={70} fill={C.soft} stroke={C.ink} strokeWidth={2} />
      <rect x={301} y={cy - 30} width={60} height={60} fill={C.surface} stroke={C.ink} strokeWidth={1.5} />
      <Label x={331} y={cy + 54} size={15} tone="muted">
        40×40×3
      </Label>
      <line x1={286} y1={cy} x2={470} y2={cy} stroke={C.muted} strokeWidth={1.5} strokeDasharray="5 4" />
      {/* linear stress profile */}
      <line x1={420} y1={cy - 35} x2={420} y2={cy + 35} stroke={C.ink} strokeWidth={1.5} />
      <path d={`M420,${cy - 35} L460,${cy - 35} L420,${cy} z`} fill={C.accent} opacity={0.85} />
      <path d={`M420,${cy + 35} L380,${cy + 35} L420,${cy} z`} fill={C.alarm} opacity={0.85} />
      <Label x={420} y={cy - 70} size={15} tone="accent">
        tension
      </Label>
      <Label x={420} y={cy - 50} size={15} tone="accent" weight={600}>
        +117.7 MPa
      </Label>
      <Label x={420} y={cy + 52} size={15} tone="alarm" weight={600}>
        −117.7 MPa
      </Label>
      <Label x={420} y={cy + 72} size={15} tone="alarm">
        compression
      </Label>

      <Label x={240} y={258} size={15}>
        σ = M/S = 600 / 5.10×10⁻⁶ m³ = 117.7 MPa
      </Label>
    </Figure>
  );
}

function Pin({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <path d={`M${x},${y} L${x - 12},${y + 16} L${x + 12},${y + 16} z`} fill={C.surface} stroke={C.ink} strokeWidth={2} />
      <circle cx={x} cy={y} r={4} fill={C.surface} stroke={C.ink} strokeWidth={2} />
    </g>
  );
}

/** buckle: same tube, same load, pinned-pinned vs fixed-free. */
function Buckle() {
  const top = 60;
  const bot = 220;
  const L = bot - top;
  const shape = (x0: number, f: (t: number) => number) =>
    Array.from({ length: 41 }, (_, i) => {
      const t = i / 40; // 0 at base, 1 at top
      return `${i ? "L" : "M"}${(x0 + f(t)).toFixed(1)},${(bot - t * L).toFixed(1)}`;
    }).join(" ");
  const a = 26;
  return (
    <Figure
      height={320}
      alt="Two identical 1.5 m tent-pole columns under a 686 N load: pinned at both ends it bows in a half-sine with P_cr 2910 N; with the base clamped and the top free it bows in a quarter-sine with effective length 3.0 m and P_cr 727 N."
      caption="Same tube, same camper, different ends: freeing the top doubles the effective length and quarters the buckling load, from 2910 N to 727 N."
    >
      <line x1={240} y1={16} x2={240} y2={300} stroke={C.line} strokeWidth={1.5} />
      {/* pinned–pinned */}
      <line x1={120} y1={top} x2={120} y2={bot} stroke={C.muted} strokeWidth={1.5} strokeDasharray="5 4" />
      <path d={shape(120, (t) => a * Math.sin(Math.PI * t))} fill="none" stroke={C.ink} strokeWidth={5} />
      <Pin x={120} y={bot} />
      <circle cx={120} cy={top} r={5} fill={C.surface} stroke={C.ink} strokeWidth={2} />
      <Arrow x1={120} y1={14} x2={120} y2={top - 8} tone="accent" width={3} />
      <Label x={128} y={24} anchor="start" size={15} tone="accent">
        686 N
      </Label>
      <Label x={120} y={256} size={15}>
        pinned–pinned
      </Label>
      <Label x={120} y={276} size={15} tone="muted">
        L_e = 1.5 m
      </Label>
      <Label x={120} y={298} size={15} tone="accent" weight={600}>
        P_cr = 2910 N
      </Label>

      {/* fixed–free */}
      <line x1={340} y1={top} x2={340} y2={bot} stroke={C.muted} strokeWidth={1.5} strokeDasharray="5 4" />
      <path d={shape(340, (t) => 2 * a * (1 - Math.cos((Math.PI / 2) * t)))} fill="none" stroke={C.ink} strokeWidth={5} />
      <Ground x={306} y={bot} w={68} />
      <Arrow x1={340 + 2 * a} y1={14} x2={340 + 2 * a} y2={top - 8} tone="accent" width={3} />
      <Label x={332 + 2 * a} y={24} anchor="end" size={15} tone="accent">
        686 N
      </Label>
      <Label x={360} y={256} size={15}>
        fixed base, free top
      </Label>
      <Label x={360} y={276} size={15} tone="muted">
        L_e = 3.0 m
      </Label>
      <Label x={360} y={298} size={15} tone="alarm" weight={600}>
        P_cr = 727 N
      </Label>
    </Figure>
  );
}

/** combined: von Mises stress vs diameter, with and without the torque. */
function Combined() {
  const b = plotBox({ x: 60, y: 40, w: 370, h: 196, xMin: 22, xMax: 36, yMin: 0, yMax: 320 });
  const vm = (d: number) => (32 * Math.sqrt(200 ** 2 + 0.75 * 300 ** 2)) / (Math.PI * (d / 1000) ** 3) / 1e6;
  const bend = (d: number) => (32 * 200) / (Math.PI * (d / 1000) ** 3) / 1e6;
  const pts = (f: (d: number) => number) =>
    Array.from({ length: 57 }, (_, i) => 22 + i * 0.25)
      .filter((d) => f(d) <= 320)
      .map((d) => [d, f(d)] as [number, number]);
  const yAllow = b.py(150);
  const bottom = b.y + b.h;
  return (
    <Figure
      height={310}
      alt="Von Mises stress against shaft diameter for bending plus torsion, and bending alone, falling as one over d cubed; the allowable line at 150 MPa is crossed at 23.9 mm by bending alone and 28.1 mm with torque, and the stock 30 mm shaft sits at 124 MPa."
      caption="The torque lifts the whole curve, pushing the crossing from 23.9 to 28.1 mm; round up to stock 30 mm and re-check: 124 MPa, MS 0.21."
    >
      <line x1={b.x} y1={yAllow} x2={b.x + b.w} y2={yAllow} stroke={C.alarm} strokeWidth={1.5} strokeDasharray="6 5" />
      <Label x={b.x + b.w} y={yAllow - 12} anchor="end" size={15} tone="alarm">
        allowable 150 MPa
      </Label>
      <path d={b.path(pts(bend))} fill="none" stroke={C.muted} strokeWidth={2.5} />
      <path d={b.path(pts(vm))} fill="none" stroke={C.accent} strokeWidth={3} />
      <Label x={b.px(25)} y={78} anchor="start" size={15} tone="accent">
        bending + torsion
      </Label>
      <Label x={b.px(31)} y={218} anchor="start" size={15} tone="muted">
        bending only
      </Label>

      {[
        [23.9, "muted"],
        [28.1, "accent"],
      ].map(([d, tone]) => (
        <g key={d as number}>
          <line x1={b.px(d as number)} y1={yAllow} x2={b.px(d as number)} y2={bottom} stroke={C[tone as "muted"]} strokeWidth={1.5} strokeDasharray="3 3" />
          <circle cx={b.px(d as number)} cy={yAllow} r={5} fill={C[tone as "muted"]} />
          <Label x={b.px(d as number)} y={bottom + 18} size={15} tone={tone as "muted"}>
            {`${d}`}
          </Label>
        </g>
      ))}
      <line x1={b.px(30)} y1={b.py(vm(30))} x2={b.px(30)} y2={bottom} stroke={C.ink} strokeWidth={1.5} strokeDasharray="3 3" />
      <circle cx={b.px(30)} cy={b.py(vm(30))} r={7} fill={C.ink} />
      <line x1={b.px(30) + 5} y1={b.py(vm(30)) - 6} x2={b.px(31.2)} y2={92} stroke={C.ink} strokeWidth={1.5} />
      <Label x={b.px(31.2) - 6} y={80} anchor="start" size={15} weight={600}>
        stock 30 mm: 124 MPa
      </Label>
      <Label x={b.px(30)} y={bottom + 18} size={15}>
        30
      </Label>
      <DimH x1={b.px(23.9)} x2={b.px(28.1)} y={bottom + 60} label="torque: ≈4 mm" tone="accent" />
      <Axes box={b} xLabel="d (mm)" yLabel="σ_vm (MPa)" />
    </Figure>
  );
}

/* ---------- W25 ---------- */

/** indicescontext: CFRP wins the index; the 53 mm bond becomes the design. */
function IndicesContext() {
  const bx = 120;
  const bw = (v: number) => (v / 375) * 270;
  const bars: Array<[string, number]> = [
    ["steel", 47],
    ["aluminum", 102],
    ["CFRP", 375],
  ];
  return (
    <Figure
      height={310}
      alt="Bar chart of strength index sigma over rho: steel 47, aluminum 102, CFRP 375; below, a CFRP strap bonded to a steel end fitting over a 53 mm epoxy lap carrying 20 kN."
      caption="The index crowns CFRP by a landslide, and the prize is a 53 mm bondline at 15 MPa that is now the weakest link on the rig."
    >
      <Label x={20} y={20} anchor="start" size={15} tone="muted">
        strength index σ/ρ (MPa per g/cm³)
      </Label>
      {bars.map(([n, v], i) => {
        const y = 42 + i * 32;
        const win = n === "CFRP";
        return (
          <g key={n}>
            <Label x={bx - 10} y={y + 10} anchor="end" size={15}>
              {n}
            </Label>
            <rect x={bx} y={y} width={bw(v)} height={20} fill={win ? C.accent : C.soft} stroke={win ? C.accent : C.muted} strokeWidth={1.5} />
            <Label x={bx + bw(v) + 8} y={y + 10} anchor="start" size={15} weight={win ? 600 : undefined} tone={win ? "accent" : "ink"}>
              {`${v}`}
            </Label>
          </g>
        );
      })}

      <line x1={20} y1={150} x2={460} y2={150} stroke={C.line} strokeWidth={1.5} />
      <DimH x1={230} x2={300} y={186} label="53 mm bond" tone="accent" />
      <rect x={50} y={204} width={250} height={16} fill={C.ink} opacity={0.85} />
      <rect x={230} y={220} width={70} height={5} fill={C.accent} />
      <rect x={230} y={225} width={200} height={16} fill={C.soft} stroke={C.ink} strokeWidth={2} />
      <Label x={140} y={236} size={15} tone="muted">
        CFRP strap
      </Label>
      <Label x={370} y={206} size={15} tone="muted">
        steel fitting
      </Label>
      <Arrow x1={50} y1={212} x2={14} y2={212} tone="accent" width={3} />
      <Arrow x1={430} y1={233} x2={466} y2={233} tone="accent" width={3} />
      <Label x={30} y={188} size={15} tone="accent">
        20 kN
      </Label>
      <Label x={452} y={258} size={15} tone="accent">
        20 kN
      </Label>
      <Label x={240} y={286} size={15}>
        epoxy 15 MPa → 1,333 mm² on a 25 mm strap
      </Label>
    </Figure>
  );
}

/** interfaces: three families moving the same 3 kN, each with its own arithmetic. */
function Interfaces() {
  return (
    <Figure
      height={250}
      alt="Three lap joints each carrying 3 kN: a single M8 bolt through 4 mm aluminum with 93.8 MPa bearing and 59.7 MPa shear; a TIG weld whose heat-affected zone keeps about 70 percent of base strength; an epoxy bond needing 200 mm² of lap at 15 MPa."
      caption="Same 3 kN, three arithmetics: the bolt pays in hole bearing, the weld in its heat-affected zone, the glue in lap area — and peel."
    >
      <line x1={160} y1={16} x2={160} y2={234} stroke={C.line} strokeWidth={1.5} />
      <line x1={320} y1={16} x2={320} y2={234} stroke={C.line} strokeWidth={1.5} />
      <Label x={80} y={26} size={16} weight={600}>
        bolt
      </Label>
      <Label x={240} y={26} size={16} weight={600}>
        weld
      </Label>
      <Label x={400} y={26} size={16} weight={600}>
        bond
      </Label>

      {/* bolt: single-shear lap */}
      <rect x={24} y={92} width={86} height={12} fill={C.soft} stroke={C.ink} strokeWidth={1.5} />
      <rect x={50} y={104} width={86} height={12} fill={C.soft} stroke={C.ink} strokeWidth={1.5} />
      <rect x={76} y={84} width={10} height={40} fill={C.ink} />
      <rect x={70} y={80} width={22} height={7} fill={C.ink} />
      <rect x={71} y={121} width={20} height={6} fill={C.ink} />
      <Arrow x1={24} y1={98} x2={8} y2={98} tone="accent" width={2.5} />
      <Arrow x1={136} y1={110} x2={152} y2={110} tone="accent" width={2.5} />
      <Label x={80} y={160} size={15}>
        bearing
      </Label>
      <Label x={80} y={180} size={15} tone="accent" weight={600}>
        93.8 MPa
      </Label>
      <Label x={80} y={204} size={15}>
        bolt shear
      </Label>
      <Label x={80} y={224} size={15} tone="accent" weight={600}>
        59.7 MPa
      </Label>

      {/* weld: butt with HAZ */}
      <rect x={218} y={86} width={44} height={40} fill={C.alarm} opacity={0.15} />
      <rect x={184} y={100} width={52} height={12} fill={C.soft} stroke={C.ink} strokeWidth={1.5} />
      <rect x={244} y={100} width={52} height={12} fill={C.soft} stroke={C.ink} strokeWidth={1.5} />
      <path d="M234,100 Q240,90 246,100 L246,112 Q240,120 234,112 z" fill={C.ink} />
      <Arrow x1={184} y1={106} x2={168} y2={106} tone="accent" width={2.5} />
      <Arrow x1={296} y1={106} x2={312} y2={106} tone="accent" width={2.5} />
      <Label x={240} y={72} size={15} tone="alarm">
        HAZ
      </Label>
      <Label x={240} y={160} size={15}>
        HAZ keeps
      </Label>
      <Label x={240} y={180} size={15} tone="accent" weight={600}>
        ≈70%
      </Label>
      <Label x={240} y={204} size={15}>
        of base
      </Label>
      <Label x={240} y={224} size={15}>
        (6061-T6)
      </Label>

      {/* bond: lap with glue line */}
      <rect x={338} y={92} width={86} height={12} fill={C.soft} stroke={C.ink} strokeWidth={1.5} />
      <rect x={370} y={104} width={54} height={5} fill={C.accent} />
      <rect x={370} y={109} width={86} height={12} fill={C.soft} stroke={C.ink} strokeWidth={1.5} />
      <Arrow x1={338} y1={98} x2={326} y2={98} tone="accent" width={2.5} />
      <Arrow x1={456} y1={115} x2={470} y2={115} tone="accent" width={2.5} />
      <Label x={400} y={160} size={15}>
        epoxy 15 MPa
      </Label>
      <Label x={400} y={180} size={15} tone="accent" weight={600}>
        200 mm² lap
      </Label>
      <Label x={400} y={204} size={15}>
        peel kills it;
      </Label>
      <Label x={400} y={224} size={15}>
        soft by 120 °C
      </Label>

    </Figure>
  );
}

/** systemdecision: the columns the property table doesn't have. */
function SystemDecision() {
  const cols = [20, 130, 200, 260, 360, 460];
  const heads = ["", "≤ 4 kg", "cost", "lead time", "risk"];
  const rows = [
    ["CFRP", "pass", "8×", "6 weeks", "new process"],
    ["6061-T6", "pass", "2×", "2 days", "routine"],
    ["1018 steel", "pass", "1×", "days", "routine"],
  ];
  return (
    <Figure
      height={250}
      alt="A decision table for the tow-hook bracket: CFRP, aluminum 6061-T6 and 1018 steel all pass the 4 kg mass limit; cost 8×, 2× and 1×; lead time weeks, 2 days and days; risk new process, routine and routine. The steel row is highlighted as the winner."
      caption="All three pass the only mass requirement, so CFRP's lightness earns nothing; on the columns that do count, steel wins as a system."
    >
      {heads.map((h, i) => (
        <Cell key={i} x={cols[i]} y={20} w={cols[i + 1] - cols[i]} h={34} text={h} tone="muted" />
      ))}
      {rows.map((r, j) => {
        const win = j === 2;
        return r.map((t, i) => (
          <Cell
            key={`${j}-${i}`}
            x={cols[i]}
            y={54 + j * 40}
            w={cols[i + 1] - cols[i]}
            h={40}
            text={t}
            fill={win ? C.soft : "none"}
            anchor={i === 0 ? "start" : "middle"}
            tone={j === 0 && i >= 2 ? "alarm" : win && i === 0 ? "accent" : "ink"}
            weight={win ? 600 : undefined}
          />
        ));
      })}
      <rect x={20} y={134} width={440} height={40} fill="none" stroke={C.accent} strokeWidth={3} />
      <Label x={240} y={198} size={15} tone="accent" weight={600}>
        steel wins as a system, not on the index
      </Label>
      <Label x={240} y={222} size={15} tone="muted">
        no requirement pays for the lighter bracket
      </Label>
    </Figure>
  );
}

export const engineeringAFigures: FigureMap = {
  "engineering/requirements": Requirements,
  "engineering/verifyvalidate": VerifyValidate,
  "engineering/ledger": Ledger,
  "engineering/modelvalid": ModelValid,
  "engineering/errprop": ErrProp,
  "engineering/sensitivity": Sensitivity,
  "engineering/loadpath": LoadPath,
  "engineering/margins": Margins,
  "engineering/fmea": Fmea,
  "engineering/bending": Bending,
  "engineering/buckle": Buckle,
  "engineering/combined": Combined,
  "engineering/indicescontext": IndicesContext,
  "engineering/interfaces": Interfaces,
  "engineering/systemdecision": SystemDecision,
};
