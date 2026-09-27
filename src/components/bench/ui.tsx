import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export function fmt(n: number, digits = 1) {
  if (!Number.isFinite(n)) return "—";
  return n.toFixed(digits);
}

export function BenchShell({
  prompt,
  note,
  children,
  controls,
}: {
  prompt: string;
  note: string;
  children: ReactNode;
  controls: ReactNode;
}) {
  const [task, expect] = prompt.split(" || ");
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-lg border border-line bg-surface px-4 py-4 sm:px-5">
        <p className="text-sm font-medium text-accent">Do this</p>
        <p className="mt-1 text-lg leading-relaxed text-ink">{task}</p>
        {expect ? (
          <>
            <p className="mt-4 text-sm font-medium text-accent">You should see</p>
            <p className="mt-1 leading-relaxed text-ink">{expect}</p>
          </>
        ) : null}
      </div>
      <div className="overflow-hidden rounded-lg bg-well text-well-fg">
        <div className="px-4 py-5 sm:px-6">{children}</div>
        <div className="grid gap-x-6 gap-y-1 border-t border-white/15 px-4 py-4 sm:grid-cols-2 sm:px-6">
          {controls}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-ink">This model leaves out</p>
        <p className="mt-1 text-sm leading-relaxed text-muted">{note}</p>
      </div>
    </div>
  );
}

export function Readouts({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div
      className={cn(
        "mb-5 grid gap-4",
        items.length >= 3 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2",
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <div className="text-sm text-well-dim">{item.label}</div>
          <div className="mt-1 font-serif text-xl tabular-nums leading-tight sm:text-2xl">
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex min-w-0 flex-col">
      <span className="flex items-baseline justify-between gap-3 text-sm">
        <span className="text-well-dim">{label}</span>
        <span className="shrink-0 tabular-nums text-well-fg">{display}</span>
      </span>
      <input
        className="axiom-range"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

export function Segmented<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="sm:col-span-2">
      <div className="mb-2 text-sm text-well-dim">{label}</div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2" role="radiogroup" aria-label={label}>
        {options.map((option) => {
          const on = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(option.value)}
              className={cn(
                "min-h-11 rounded-lg px-3 py-2 text-left text-sm transition-transform duration-150 ease-out active:scale-[0.96]",
                on ? "bg-well-fg text-well" : "text-well-fg ring-1 ring-white/25",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function WellButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-11 rounded-lg px-4 text-sm text-well-fg ring-1 ring-white/25 transition-transform duration-150 ease-out active:scale-[0.96]"
    >
      {children}
    </button>
  );
}

export function useReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(media.matches);
    const onChange = () => setReduce(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);
  return reduce;
}

export function useTicker(running: boolean, onFrame: (dt: number) => void) {
  const ref = useRef(onFrame);
  ref.current = onFrame;
  useEffect(() => {
    if (!running) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let id = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ref.current(dt);
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [running]);
}
