import { stabilityVerdict, STABILITY_LABELS } from "../../course/fluids";

/** Positions increase aft; a static tendency is not a flight trajectory. */
export function StabilitySketch({
  cg,
  np,
  chord,
}: {
  cg: number;
  np: number;
  chord: number;
}) {
  const sm = (np - cg) / chord;
  const pos = (m: number) => 36 + ((m - 0.15) / 0.3) * 520;
  return (
    <figure data-stability-sketch className="my-4 space-y-2">
      <svg
        viewBox="0 0 620 122"
        className="h-auto w-full"
        role="img"
        aria-label={`Static margin ${(sm * 100).toFixed(2)} percent. ${STABILITY_LABELS[stabilityVerdict(sm)]}`}
      >
        <line x1="36" x2="556" y1="56" y2="56" stroke="currentColor" />
        <text x="36" y="108" fontSize="12" fill="currentColor">
          Forward ← position from nose (m) → aft
        </text>
        {[0.15, 0.25, 0.35, 0.45].map((m) => (
          <g key={m}>
            <line
              x1={pos(m)}
              x2={pos(m)}
              y1="52"
              y2="62"
              stroke="currentColor"
            />
            <text
              x={pos(m)}
              y="80"
              textAnchor="middle"
              fontSize="12"
              fill="currentColor"
            >
              {m.toFixed(2)}
            </text>
          </g>
        ))}
        <circle cx={pos(cg)} cy="56" r="5" fill="currentColor" />
        <line x1={pos(cg)} x2={pos(cg)} y1="24" y2="48" stroke="currentColor" />
        <text
          x={pos(cg)}
          y="18"
          textAnchor="middle"
          fontSize="13"
          fill="currentColor"
        >
          CG {cg.toFixed(3)} m
        </text>
        <path
          d={`M${pos(np) - 5} 56 L${pos(np)} 48 L${pos(np) + 5} 56 Z`}
          fill="none"
          stroke="currentColor"
        />
        <text
          x={pos(np)}
          y="40"
          textAnchor="middle"
          fontSize="13"
          fill="currentColor"
        >
          NP {np.toFixed(3)} m
        </text>
      </svg>
      <figcaption className="text-sm text-well-dim">
        CG = center of gravity; NP = neutral point. SM = (NP − CG) / mean
        aerodynamic chord. Positive SM is restoring, zero is neutral, negative
        is destabilizing in this linear attached-flow model. The inclusive 5–25%
        target is a classroom choice, not proof of trim, dynamic stability or
        safe flight.
      </figcaption>
    </figure>
  );
}
