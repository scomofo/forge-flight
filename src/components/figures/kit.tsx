/**
 * Shared drawing kit for lesson figures.
 *
 * Every lesson gets one static diagram under "Picture this". Figures are
 * inline SVG so they stay sharp, use the site's colour tokens, and carry the
 * same numbers as the lesson's worked example.
 *
 * Conventions (keep every figure consistent):
 * - viewBox is 480 wide; pick a height (usually 200–320). The SVG scales to
 *   the column width, which is ~320 px on a phone (scale ≈ 0.67), so text is
 *   16 in viewBox units by default and never below 15. Keep labels short;
 *   put explanation in the caption, not the drawing.
 * - Colours come from the C tokens below, never hex literals. Ink for the
 *   object, accent for the idea the lesson is about (the force, the path, the
 *   answer), muted for guides/dimensions, alarm only for failure/danger or
 *   compression-vs-tension contrast.
 * - One idea per figure. Label with words from the lesson; numbers must match
 *   the lesson text exactly.
 * - Always pass `alt` (what the figure shows, one sentence) and `caption`
 *   (what to notice, one short sentence).
 */
import type { ReactNode } from "react";

export const C = {
  ink: "var(--color-ink)",
  muted: "var(--color-muted)",
  line: "var(--color-line)",
  accent: "var(--color-accent)",
  soft: "var(--color-accent-soft)",
  surface: "var(--color-surface)",
  alarm: "var(--color-alarm)",
  brass: "var(--color-brass)",
} as const;

export const FONT = "var(--font-sans, ui-sans-serif, system-ui, sans-serif)";
export const SERIF = "var(--font-serif, ui-serif, Georgia, serif)";

export function Figure({
  alt,
  caption,
  height,
  width = 480,
  children,
}: {
  alt: string;
  caption: string;
  height: number;
  width?: number;
  children: ReactNode;
}) {
  return (
    <figure className="mt-4 rounded-lg border border-line bg-surface p-3 sm:p-4">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={alt}
        className="h-auto w-full"
        fontFamily={FONT}
        fontSize={16}
        fill={C.ink}
      >
        <defs>
          {(["ink", "accent", "muted", "alarm"] as const).map((k) => (
            <marker
              key={k}
              id={`fig-arrow-${k}`}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M0,0 L10,5 L0,10 z" fill={C[k]} />
            </marker>
          ))}
        </defs>
        {children}
      </svg>
      <figcaption className="mt-2 text-sm leading-relaxed text-muted">{caption}</figcaption>
    </figure>
  );
}

type Tone = "ink" | "accent" | "muted" | "alarm";

/** A straight arrow from (x1,y1) to (x2,y2). `both` puts a head on each end. */
export function Arrow({
  x1,
  y1,
  x2,
  y2,
  tone = "accent",
  width = 3,
  both = false,
  dashed = false,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  tone?: Tone;
  width?: number;
  both?: boolean;
  dashed?: boolean;
}) {
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={C[tone]}
      strokeWidth={width}
      strokeDasharray={dashed ? "6 5" : undefined}
      markerEnd={`url(#fig-arrow-${tone})`}
      markerStart={both ? `url(#fig-arrow-${tone})` : undefined}
    />
  );
}

/** Text label. `anchor` is start | middle | end. */
export function Label({
  x,
  y,
  children,
  tone = "ink",
  anchor = "middle",
  size = 16,
  weight,
  serif = false,
}: {
  x: number;
  y: number;
  children: ReactNode;
  tone?: Tone;
  anchor?: "start" | "middle" | "end";
  size?: number;
  weight?: number;
  serif?: boolean;
}) {
  return (
    <text
      x={x}
      y={y}
      fill={C[tone]}
      textAnchor={anchor}
      fontSize={size}
      fontWeight={weight}
      fontFamily={serif ? SERIF : undefined}
      dominantBaseline="middle"
    >
      {children}
    </text>
  );
}

/** Horizontal dimension line with end ticks and a centred label above it. */
export function DimH({ x1, x2, y, label, tone = "muted" }: { x1: number; x2: number; y: number; label: ReactNode; tone?: Tone }) {
  return (
    <g>
      <Arrow x1={x1} y1={y} x2={x2} y2={y} tone={tone} width={1.5} both />
      <line x1={x1} y1={y - 8} x2={x1} y2={y + 8} stroke={C[tone]} strokeWidth={1.5} />
      <line x1={x2} y1={y - 8} x2={x2} y2={y + 8} stroke={C[tone]} strokeWidth={1.5} />
      <Label x={(x1 + x2) / 2} y={y - 14} tone={tone} size={15}>
        {label}
      </Label>
    </g>
  );
}

/** Vertical dimension line with end ticks and a label to its right. */
export function DimV({ x, y1, y2, label, tone = "muted" }: { x: number; y1: number; y2: number; label: ReactNode; tone?: Tone }) {
  return (
    <g>
      <Arrow x1={x} y1={y1} x2={x} y2={y2} tone={tone} width={1.5} both />
      <line x1={x - 8} y1={y1} x2={x + 8} y2={y1} stroke={C[tone]} strokeWidth={1.5} />
      <line x1={x - 8} y1={y2} x2={x + 8} y2={y2} stroke={C[tone]} strokeWidth={1.5} />
      <Label x={x + 12} y={(y1 + y2) / 2} tone={tone} size={15} anchor="start">
        {label}
      </Label>
    </g>
  );
}

/**
 * Simple plot frame: axes with labels, mapping data coordinates to the box.
 * Returns helpers so a figure can draw curves in data units.
 */
export function plotBox(opts: {
  x: number;
  y: number;
  w: number;
  h: number;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}) {
  const { x, y, w, h, xMin, xMax, yMin, yMax } = opts;
  const px = (v: number) => x + ((v - xMin) / (xMax - xMin)) * w;
  const py = (v: number) => y + h - ((v - yMin) / (yMax - yMin)) * h;
  const path = (pts: Array<[number, number]>) =>
    pts.map(([a, b], i) => `${i ? "L" : "M"}${px(a).toFixed(1)},${py(b).toFixed(1)}`).join(" ");
  return { px, py, path, ...opts };
}

export function Axes({
  box,
  xLabel,
  yLabel,
}: {
  box: { x: number; y: number; w: number; h: number };
  xLabel: string;
  yLabel: string;
}) {
  const { x, y, w, h } = box;
  return (
    <g>
      <Arrow x1={x} y1={y + h} x2={x + w + 14} y2={y + h} tone="ink" width={1.5} />
      <Arrow x1={x} y1={y + h} x2={x} y2={y - 14} tone="ink" width={1.5} />
      <Label x={x + w + 10} y={y + h + 22} anchor="end" tone="muted" size={15}>
        {xLabel}
      </Label>
      <Label x={x + 8} y={y - 14} anchor="start" tone="muted" size={15}>
        {yLabel}
      </Label>
    </g>
  );
}

/** Ground / wall hatch: a thick line with short diagonal ticks below or beside it. */
export function Ground({ x, y, w, side = "below" }: { x: number; y: number; w: number; side?: "below" | "above" }) {
  const ticks = [];
  for (let i = 0; i <= w; i += 12) {
    const dy = side === "below" ? 10 : -10;
    ticks.push(<line key={i} x1={x + i} y1={y} x2={x + i - 8} y2={y + dy} stroke={C.muted} strokeWidth={1.5} />);
  }
  return (
    <g>
      <line x1={x} y1={y} x2={x + w} y2={y} stroke={C.ink} strokeWidth={2.5} />
      {ticks}
    </g>
  );
}

export function WallV({ x, y, h, side = "left" }: { x: number; y: number; h: number; side?: "left" | "right" }) {
  const ticks = [];
  for (let i = 0; i <= h; i += 12) {
    const dx = side === "left" ? -10 : 10;
    ticks.push(<line key={i} x1={x} y1={y + i} x2={x + dx} y2={y + i + 8} stroke={C.muted} strokeWidth={1.5} />);
  }
  return (
    <g>
      <line x1={x} y1={y} x2={x} y2={y + h} stroke={C.ink} strokeWidth={2.5} />
      {ticks}
    </g>
  );
}

export type FigureMap = Record<string, () => ReactNode>;
