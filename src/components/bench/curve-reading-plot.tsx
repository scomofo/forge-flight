import { useId, useMemo, useState } from "react";
import type { CurvePoint } from "@/course/mechresponse";
import { curveReadingRanges } from "@/course/curve-reading";

function Chart({ curve, maxStrain, maxStress, initial = false, guideE, sample }: {
  curve: CurvePoint[]; maxStrain: number; maxStress: number; initial?: boolean; guideE?: number; sample: CurvePoint;
}) {
  const clip = useId();
  const left = 70, top = 22, width = 400, height = 170;
  const x = (strain: number) => left + strain / maxStrain * width;
  const y = (stress: number) => top + height - stress / maxStress * height;
  const path = curve.map((p, i) => `${i ? "L" : "M"}${x(p.strain).toFixed(3)} ${y(p.stress).toFixed(3)}`).join(" ");
  return <svg viewBox="0 0 520 248" className="block w-full" role="img"
    aria-label={initial ? "Initial elastic and offset region, stress in MPa and strain in percent" : "Stress-strain curve, full simulated record, stress in MPa and strain in percent"}>
    <defs><clipPath id={clip}><rect x={left} y={top} width={width} height={height} /></clipPath></defs>
    {[0, 1, 2, 3, 4].map(i => {
      const strain = maxStrain * i / 4, stress = maxStress * i / 4;
      return <g key={i}>
        <line x1={x(strain)} y1={top} x2={x(strain)} y2={top + height} stroke="currentColor" opacity="0.16" />
        <line x1={left} y1={y(stress)} x2={left + width} y2={y(stress)} stroke="currentColor" opacity="0.16" />
        <text x={x(strain)} y={top + height + 20} textAnchor="middle" fontSize="12" fill="currentColor" data-strain-tick>{Number((strain * 100).toPrecision(3))}</text>
        <text x={left - 8} y={y(stress) + 4} textAnchor="end" fontSize="12" fill="currentColor" data-stress-tick>{Number(stress.toPrecision(4))}</text>
      </g>;
    })}
    <path data-curve-path d={path} clipPath={`url(#${clip})`} fill="none" stroke="currentColor" strokeWidth="2" />
    {guideE !== undefined && <line data-offset-guide clipPath={`url(#${clip})`}
      x1={x(0.002)} y1={y(0)} x2={x(0.002 + maxStress / guideE)} y2={y(maxStress)}
      stroke="currentColor" strokeWidth="2" strokeDasharray="6 4" />}
    <circle data-sample-marker cx={x(sample.strain)} cy={y(sample.stress)} r="4" fill="none" stroke="currentColor" strokeWidth="2" clipPath={`url(#${clip})`} />
    <text x={left + width / 2} y="239" textAnchor="middle" fontSize="13" fill="currentColor">Engineering strain ε (%)</text>
    <text transform="translate(18 112) rotate(-90)" textAnchor="middle" fontSize="13" fill="currentColor">Engineering stress σ (MPa)</text>
  </svg>;
}

export function CurveReadingPlot({ curve, E }: { curve: CurvePoint[]; E: number }) {
  const [guide, setGuide] = useState(false);
  const [sample, setSample] = useState(0);
  const cursorId = useId();
  const ranges = useMemo(() => curveReadingRanges(curve, E), [curve, E]);
  const point = curve[Math.min(sample, curve.length - 1)];
  return <div className="space-y-4" data-curve-reading>
    <div><h3 className="font-medium">Full simulated record</h3><Chart curve={curve} maxStrain={ranges.fullStrain} maxStress={ranges.stress} sample={point} /></div>
    <div><h3 className="font-medium">Enlarged initial region</h3><Chart curve={curve} maxStrain={ranges.initialStrain} maxStress={ranges.stress} initial guideE={guide ? E : undefined} sample={point} /></div>
    <p className="text-sm text-well-dim">σ (sigma) is engineering stress; ε (epsilon) is strain. The horizontal axes show percent: 0.2% = 0.002 as a ratio. For E, divide a stress difference in MPa by a strain difference as a ratio, then divide by 1000 to report GPa. Compare several initial samples rather than relying on one noisy pair.</p>
    <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={guide} onChange={e => setGuide(e.target.checked)} />Show 0.2% offset guide</label>
    {guide && <p className="text-sm text-well-dim">Dashed line: σ = E(ε − 0.002), using the reference fit of the initial slope. Read its intersection with the solid curve. This guide is a construction aid, not another measured record.</p>}
    <div className="space-y-2 text-sm">
      <label htmlFor={cursorId}>Curve sample cursor (circle on graph; arrow keys, Home and End)</label>
      <input id={cursorId} type="range" min={0} max={curve.length - 1} step={1} value={sample}
        onChange={e => setSample(Number(e.target.value))} className="w-full" />
      <p role="status" data-curve-cursor>Sample {sample + 1} of {curve.length}: ε = {point.strain.toFixed(6)} ({(point.strain * 100).toFixed(4)}%); σ = {point.stress.toFixed(3)} MPa.</p>
    </div>
    <details>
      <summary className="min-h-11 cursor-pointer text-sm">View curve data</summary>
      <div className="max-h-64 overflow-auto" role="region" aria-label="Simulated tensile samples" tabIndex={0}>
        <table className="w-full text-left text-xs tabular-nums">
          <caption className="py-2 text-left">The same simulated samples used for the graph and reference extraction. Strain coordinates have no added noise; stress has bounded ±0.8% numerical noise.</caption>
          <thead><tr><th scope="col">Sample</th><th scope="col">Strain (ratio)</th><th scope="col">Strain (%)</th><th scope="col">Stress (MPa)</th></tr></thead>
          <tbody>{curve.map((p, i) => <tr key={i}><th scope="row">{i + 1}</th><td>{p.strain.toFixed(6)}</td><td>{(p.strain * 100).toFixed(4)}</td><td>{p.stress.toFixed(3)}</td></tr>)}</tbody>
        </table>
      </div>
    </details>
  </div>;
}
