import {
  PB_SN,
  eutecticTieLineAt,
  PHASE_LABELS,
} from "../../course/phasediagrams";

const x = (c: number) => 48 + c * 5.1;
const y = (t: number) => 318 - (t - 60) * 0.98;

/** Same classroom boundaries as the reader and grader; no independent-looking sketch. */
export function EutecticDiagram({
  c0,
  t,
  showPoint = true,
  showTie = true,
}: {
  c0?: number;
  t?: number;
  showPoint?: boolean;
  showTie?: boolean;
}) {
  const te = PB_SN.eutecticT;
  const tie =
    c0 !== undefined && t !== undefined ? eutecticTieLineAt(c0, t) : null;
  const points = (pairs: number[][]) =>
    pairs.map(([c, temp]) => `${x(c)},${y(temp)}`).join(" ");
  const boundaries =
    t === undefined || t >= 327
      ? []
      : t < te
        ? ([
            ["α solvus", PB_SN.solvusAlpha(t)],
            ["β solvus", PB_SN.solvusBeta(t)],
          ] as const)
        : ([
            ["α solid boundary", PB_SN.solidusAlpha(t)],
            ["Pb-side liquid boundary", PB_SN.liquidusAlpha(t)],
            ...(t <= 232
              ? ([
                  ["Sn-side liquid boundary", PB_SN.liquidusBeta(t)],
                  ["β solid boundary", PB_SN.solidusBeta(t)],
                ] as const)
              : []),
          ] as const);
  return (
    <figure data-phase-diagram className="space-y-3">
      <svg
        viewBox="0 0 620 366"
        className="h-auto w-full"
        role="img"
        aria-label="Lead–tin classroom phase diagram: temperature in degrees Celsius versus mass percent tin"
      >
        <line
          x1={x(0)}
          y1={y(60)}
          x2={x(100)}
          y2={y(60)}
          stroke="currentColor"
        />
        <line
          x1={x(0)}
          y1={y(60)}
          x2={x(0)}
          y2={y(340)}
          stroke="currentColor"
        />
        {[0, 20, 40, 60, 80, 100].map((c) => (
          <g key={c}>
            <line
              x1={x(c)}
              x2={x(c)}
              y1={y(60)}
              y2={y(340)}
              stroke="currentColor"
              opacity="0.12"
            />
            <text
              x={x(c)}
              y={340}
              textAnchor="middle"
              fontSize="12"
              fill="currentColor"
            >
              {c}
            </text>
          </g>
        ))}
        {[60, 100, 150, 183, 232, 280, 327].map((temp) => (
          <g key={temp}>
            <line
              x1={x(0)}
              x2={x(100)}
              y1={y(temp)}
              y2={y(temp)}
              stroke="currentColor"
              opacity="0.12"
            />
            <text
              x={40}
              y={y(temp) + 4}
              textAnchor="end"
              fontSize="12"
              fill="currentColor"
            >
              {temp}
            </text>
          </g>
        ))}
        <text
          x={304}
          y={362}
          textAnchor="middle"
          fontSize="13"
          fill="currentColor"
        >
          Composition (wt% Sn = mass percent tin)
        </text>
        <text x={48} y={25} fontSize="13" fill="currentColor">
          Temperature (°C)
        </text>
        <polyline
          points={points([
            [0, 327],
            [61.9, 183],
            [100, 232],
          ])}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <polyline
          points={points([
            [0, 327],
            [19.2, 183],
            [PB_SN.solvusAlpha(60), 60],
          ])}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <polyline
          points={points([
            [100, 232],
            [97.5, 183],
            [PB_SN.solvusBeta(60), 60],
          ])}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line
          x1={x(19.2)}
          x2={x(97.5)}
          y1={y(te)}
          y2={y(te)}
          stroke="currentColor"
          strokeDasharray="5 3"
        />
        <text x={x(45)} y={y(280)} fontSize="14" fill="currentColor">
          L
        </text>
        <text x={x(4)} y={y(140)} fontSize="14" fill="currentColor">
          α
        </text>
        <path d={`M${x(99.2)},${y(140)} H570`} fill="none" stroke="currentColor" strokeWidth="1" />
        <text x={576} y={y(140) + 4} fontSize="14" fill="currentColor">β</text>
        <text x={x(23)} y={y(230)} fontSize="13" fill="currentColor">
          L + α
        </text>
        <g data-phase-label="L+beta">
          <path d={`M${x(95)},${y(212)} L570,${y(240)} H576`} fill="none" stroke="currentColor" strokeWidth="1" />
          <text x={578} y={y(240) + 4} fontSize="12" fill="currentColor">L + β</text>
        </g>
        <text x={x(52)} y={y(120)} fontSize="13" fill="currentColor">
          α + β
        </text>
        <circle cx={x(61.9)} cy={y(te)} r="3" fill="currentColor" />
        {showPoint && c0 !== undefined && t !== undefined && (
          <>
            {showTie && tie && (
              <g data-phase-tie>
                <line
                  x1={x(tie.cLeft)}
                  x2={x(tie.cRight)}
                  y1={y(t)}
                  y2={y(t)}
                  stroke="currentColor"
                  strokeWidth="3"
                  opacity="0.65"
                />
                <title>
                  {PHASE_LABELS[tie.leftPhase]} to{" "}
                  {PHASE_LABELS[tie.rightPhase]}
                </title>
              </g>
            )}
            <circle
              cx={x(c0)}
              cy={y(t)}
              r="5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </>
        )}
      </svg>
      <figcaption className="text-sm text-well-dim">
        L is liquid; α is lead-rich solid; β is tin-rich solid. The eutectic
        liquid is 61.9 wt% Sn at 183 °C. This is an equilibrium teaching
        approximation, not measured alloy data. Read phase compositions first,
        then calculate their mass fractions.
      </figcaption>
      {boundaries.length > 0 && (
        <details data-phase-boundaries className="text-sm">
          <summary className="cursor-pointer py-2">
            Boundary data at {t} °C (same model as the graph)
          </summary>
          <table className="w-full text-left">
            <caption className="text-left text-well-dim">
              Choose the boundaries enclosing the point; these are compositions,
              not amounts.
            </caption>
            <thead>
              <tr>
                <th scope="col">Boundary</th>
                <th scope="col">wt% Sn</th>
              </tr>
            </thead>
            <tbody>
              {boundaries.map(([name, c]) => (
                <tr key={name}>
                  <th scope="row" className="font-normal">
                    {name}
                  </th>
                  <td>{Number(c).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      )}
    </figure>
  );
}
