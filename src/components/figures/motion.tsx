/**
 * Motion kit for lesson figures: one clock per figure, and the figure box
 * that plays it (steps, readouts, transport). Drawing rules are in kit.tsx.
 *
 * A figure renders `AnimatedFigure` and draws its SVG as a function of the
 * clock's `t` (seconds, capped at `duration`). The server render, print and
 * reduced motion all pin `t` to `duration`, so the final frame must be the
 * static figure.
 */
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { flushSync } from "react-dom";
import { useReducedMotion, useTicker } from "@/components/bench/ui";
import { cn } from "@/lib/cn";
import { Arrow, FIGCAPTION, FIGURE_BOX, FigureSvg, type Tone } from "./kit";

/* ---------- timing helpers ---------- */

export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
/** easeInOutQuad */
export const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
/** 0→1 eased progress of t through the window [a, b] seconds. */
export const seg = (t: number, a: number, b: number) => ease(clamp((t - a) / (b - a)));
/** Exact at p = 1, so a finished tween lands on the static value. */
export const lerp = (a: number, b: number, p: number) => (p === 1 ? b : a + (b - a) * p);
/** Opacity attribute: omitted at full strength, so the final frame carries none. */
export const op = (v: number) => (v >= 1 ? undefined : Math.max(0, v));

/** The leading fraction p (0–1) of a polyline sampled evenly in its parameter; p = 1 returns `pts` itself. */
export function partial<P extends readonly [number, number]>(pts: readonly P[], p: number): P[] {
  if (p >= 1) return pts as P[];
  if (p <= 0 || pts.length === 0) return pts.slice(0, 1) as P[];
  const f = p * (pts.length - 1);
  const i = Math.floor(f);
  const q = f - i;
  const [x0, y0] = pts[i];
  const [x1, y1] = pts[i + 1];
  return [...pts.slice(0, i + 1), [x0 + (x1 - x0) * q, y0 + (y1 - y0) * q] as unknown as P];
}

/** Final-frame hold before the sequence loops, seconds. */
export const HOLD = 1.8;
/** Share of the figure that must be on screen for it to play. */
const VISIBLE = 0.4;

/* ---------- clock ---------- */

export type FigureClock = {
  /** Seconds into the sequence, capped at `duration`. Draw from this. */
  t: number;
  /** Uncapped seconds: keeps running through the end hold, for ambient motion. */
  raw: number;
  duration: number;
  playing: boolean;
  /** `t` has reached the final frame. */
  done: boolean;
  /** Reduced motion: pinned to the final frame, no controls. */
  still: boolean;
  toggle: () => void;
  /** Back to 0; plays unless `play` is false. */
  restart: (play?: boolean) => void;
  /** Jump to `s` seconds. Pauses, unless `keepPlaying` and already playing. */
  seek: (s: number, keepPlaying?: boolean) => void;
  /** The reader has used a control, so step captions may be announced. */
  engaged: boolean;
};

/**
 * One clock per figure. The first render is the final frame (server HTML,
 * print). It rewinds to 0 and plays the first time `target` is at least 40%
 * on screen, pauses offscreen, and loops after a 1.8 s hold. With reduced
 * motion it stays on the final frame.
 */
export function useFigureClock(duration: number, target?: RefObject<Element | null>): FigureClock {
  const reduced = useReducedMotion();
  const [raw, setRaw] = useState(duration);
  const [playing, setPlaying] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const started = useRef(false); // rewound to 0 on first view
  const held = useRef(false); // the reader paused or scrubbed: don't resume on scroll
  const visible = useRef(false);

  useTicker(playing && !reduced, (dt) => setRaw((r) => (r + dt > duration + HOLD ? 0 : r + dt)));

  useEffect(() => {
    if (reduced) return;
    const show = () => {
      visible.current = true;
      if (!started.current) {
        started.current = true;
        setRaw(0);
        setPlaying(true);
      } else if (!held.current) setPlaying(true);
    };
    const el = target?.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      show();
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= VISIBLE - 0.01) show();
        else if (visible.current) {
          visible.current = false;
          setPlaying(false);
        }
      },
      { threshold: VISIBLE },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced, target]);

  // Print the static figure, whatever frame is on screen.
  useEffect(() => {
    const before = () =>
      flushSync(() => {
        started.current = true;
        held.current = true;
        setPlaying(false);
        setRaw(duration);
      });
    window.addEventListener("beforeprint", before);
    return () => window.removeEventListener("beforeprint", before);
  }, [duration]);

  const take = () => {
    started.current = true;
    setEngaged(true);
  };
  const t = reduced ? duration : Math.min(raw, duration);
  return {
    t,
    raw: reduced ? duration : raw,
    duration,
    playing: playing && !reduced,
    done: t >= duration,
    still: reduced,
    engaged,
    toggle: () => {
      take();
      if (playing) {
        held.current = true;
        setPlaying(false);
      } else {
        held.current = false;
        if (raw >= duration) setRaw(0);
        setPlaying(true);
      }
    },
    restart: (play = true) => {
      take();
      held.current = !play;
      setRaw(0);
      setPlaying(play);
    },
    seek: (s, keepPlaying = false) => {
      take();
      setRaw(clamp(s, 0, duration));
      if (!keepPlaying || !playing) {
        held.current = true;
        setPlaying(false);
      }
    },
  };
}

const ClockContext = createContext<FigureClock | null>(null);

/* ---------- the figure box ---------- */

export type FigureStep = { at: number; label: string; caption: string };
export type Readout = { label?: string; value: string; tone?: Tone };

const READOUT_TONE: Record<Tone, string> = {
  ink: "text-ink",
  accent: "font-medium text-accent",
  muted: "",
  alarm: "font-medium text-alarm",
};

/**
 * A lesson figure that plays as a short sequence. Order inside the box:
 * toolbar, SVG, readouts, step chips, transport, caption of the current step.
 * The last step's caption is the figure's static caption.
 */
export function AnimatedFigure({
  alt,
  height,
  width = 480,
  duration,
  steps,
  readouts,
  toolbar,
  children,
}: {
  alt: string;
  height: number;
  width?: number;
  duration: number;
  steps: FigureStep[];
  readouts?: (t: number) => Readout[];
  /** Rendered above the SVG, e.g. a `CompareSwitch`. */
  toolbar?: ReactNode;
  children: (clock: FigureClock) => ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const clock = useFigureClock(duration, ref);
  const { t, still } = clock;
  let idx = 0;
  steps.forEach((s, i) => {
    if (t >= s.at - 1e-6) idx = i;
  });
  const rows = still || !readouts ? [] : readouts(t);
  return (
    <ClockContext.Provider value={clock}>
      <figure ref={ref} className={FIGURE_BOX}>
        {toolbar ? <div className="mb-3">{toolbar}</div> : null}
        <FigureSvg alt={alt} height={height} width={width}>
          {children(clock)}
        </FigureSvg>
        {rows.length ? (
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[13px] text-muted print:hidden">
            {rows.map((r, i) => (
              <span key={r.label ?? i} className={READOUT_TONE[r.tone ?? "muted"]}>
                {r.label ? `${r.label} = ` : ""}
                {r.value}
              </span>
            ))}
          </div>
        ) : null}
        {still ? null : (
          <>
            <div
              className="mt-3 flex flex-wrap gap-1.5 print:hidden"
              role="group"
              aria-label="Steps"
            >
              {steps.map((s, i) => (
                <button
                  key={s.label}
                  type="button"
                  aria-current={i === idx ? "step" : undefined}
                  onClick={() => clock.seek(s.at, true)}
                  className={cn(
                    "min-h-9 whitespace-nowrap rounded-full border px-3 py-1 text-[13px] font-medium transition-colors duration-150",
                    i === idx
                      ? "border-accent bg-accent text-accent-ink"
                      : i < idx
                        ? "border-line text-ink"
                        : "border-line text-muted",
                  )}
                >
                  {`${i + 1}\u2002${s.label}`}
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-3 print:hidden">
              <button
                type="button"
                onClick={clock.toggle}
                className="min-h-11 min-w-20 rounded-[8px] bg-accent px-4 text-sm font-medium text-accent-ink transition-transform duration-150 ease-out active:scale-[0.96]"
              >
                {clock.playing ? "Pause" : clock.raw >= duration ? "Replay" : "Play"}
              </button>
              <input
                type="range"
                min={0}
                max={1000}
                value={Math.round((t / duration) * 1000)}
                onChange={(e) => clock.seek((Number(e.target.value) / 1000) * duration)}
                aria-label="Scrub"
                aria-valuetext={`${t.toFixed(1)} of ${duration.toFixed(1)} seconds`}
                className="axiom-range axiom-range-light min-w-0 flex-1"
                style={{ "--fill": `${((t / duration) * 100).toFixed(2)}%` } as CSSProperties}
              />
              <span className="min-w-11 text-right font-mono text-[13px] tabular-nums text-muted">
                {t.toFixed(1)} s
              </span>
            </div>
          </>
        )}
        <figcaption className={FIGCAPTION} aria-live={clock.engaged ? "polite" : undefined}>
          {steps[idx].caption}
        </figcaption>
      </figure>
    </ClockContext.Provider>
  );
}

/**
 * Two cases on the same axes, as the figure's `toolbar`. Picking a case
 * restarts the clock at 0 and plays.
 */
export function CompareSwitch<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  const clock = useContext(ClockContext);
  return (
    <div role="radiogroup" aria-label={label} className="grid grid-cols-2 gap-1.5 print:hidden">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => {
              onChange(o.value);
              clock?.restart();
            }}
            className={cn(
              "min-h-11 rounded-[8px] border px-3 text-sm font-medium transition-transform duration-150 ease-out active:scale-[0.96]",
              on ? "border-accent bg-accent text-accent-ink" : "border-line text-ink",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- drawing helpers ---------- */

/** Fades its children in over [at, at + dur] seconds of `t`. */
export function Reveal({
  t,
  at,
  dur = 0.5,
  children,
}: {
  t: number;
  at: number;
  dur?: number;
  children: ReactNode;
}) {
  const v = seg(t, at, at + dur);
  return <g opacity={op(v)}>{children}</g>;
}

/**
 * An arrow grown from its tail: `p` = 0 is nothing, 1 is the full arrow.
 * Hidden under 2% so the head doesn't spin on a zero-length line.
 */
export function GrowArrow({
  p,
  x1,
  y1,
  x2,
  y2,
  ...rest
}: Parameters<typeof Arrow>[0] & { p: number }) {
  if (p < 0.02) return null;
  return <Arrow x1={x1} y1={y1} x2={lerp(x1, x2, p)} y2={lerp(y1, y2, p)} {...rest} />;
}
