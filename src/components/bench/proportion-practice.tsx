import { useId, useRef, useState } from "react";
import { analyzeProportion, PROPORTION_PRACTICE, type Relationship } from "@/course/graph-reasoning";

const choices = ["direct", "inverse", "neither"] as const;
const label = (choice: Relationship) => choice[0].toUpperCase() + choice.slice(1);
const number = (value: number) => Number(value.toFixed(4)).toString();

export function ProportionPractice() {
  const id = useId();
  const heading = useRef<HTMLHeadingElement>(null);
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<Relationship | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const exercise = PROPORTION_PRACTICE[index];
  const result = analyzeProportion(exercise.points);
  const next = () => {
    setIndex((index + 1) % PROPORTION_PRACTICE.length);
    setChoice(null);
    setSubmitted(false);
    heading.current?.focus();
  };
  return <section aria-labelledby={`${id}-title`} className="mt-8 rounded-lg border border-line bg-surface p-4 sm:p-5">
    <h3 id={`${id}-title`} ref={heading} tabIndex={-1} className="font-serif text-xl text-ink focus-visible:outline-2 focus-visible:outline-accent">Direct, inverse, or neither?</h3>
    <p className="mt-2 text-sm leading-relaxed text-muted">Practice only — this does not change your course score. Each set has three exact data pairs. Decide first, then see the ratio and product calculations.</p>
    <p className="mt-4 font-medium text-ink">Set {index + 1} of {PROPORTION_PRACTICE.length}</p>
    <p className="mt-2 leading-relaxed text-ink">{exercise.setup}</p>
    <div role="region" aria-label="Practice data" tabIndex={0} className="mt-4 max-w-full overflow-x-auto rounded border border-line focus-visible:outline-2 focus-visible:outline-accent">
      <table className="w-full text-left text-sm">
        <caption className="p-3 text-left text-muted">Exact pairs for set {index + 1}</caption>
        <thead><tr>{[exercise.xLabel, exercise.yLabel, ...(submitted ? ["y ÷ x", "x × y"] : [])].map(c => <th key={c} scope="col" className="border-b border-line p-3 font-medium text-ink">{c}</th>)}</tr></thead>
        <tbody>{exercise.points.map(([x, y], i) => <tr key={x}>
          <th scope="row" className="border-b border-line p-3 font-normal text-ink">{x}</th><td className="border-b border-line p-3 text-ink">{y}</td>
          {submitted ? <><td className="border-b border-line p-3 text-ink">{y} ÷ {x} = {number(result.ratios[i])}</td><td className="border-b border-line p-3 text-ink">{x} × {y} = {number(result.products[i])}</td></> : null}
        </tr>)}</tbody>
      </table>
    </div>
    <fieldset className="mt-5" disabled={submitted}>
      <legend className="text-sm font-medium text-ink">Which relationship fits all three pairs?</legend>
      <div className="mt-3 flex flex-wrap gap-3">{choices.map(c => <label key={c} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-line px-3 text-ink">
        <input type="radio" name={`${id}-choice`} value={c} checked={choice === c} onChange={() => setChoice(c)} className="h-4 w-4" />{label(c)}
      </label>)}</div>
    </fieldset>
    <div role="status" aria-live="polite" aria-atomic="true" className="mt-4 leading-relaxed text-ink">{submitted ? <>
      <p className="font-medium">{choice === result.kind ? "That’s right." : "Not quite."} This set is {result.kind}.</p>
      <p className="mt-2">{exercise.explanation}</p>
    </> : null}</div>
    <div className="mt-4 flex flex-wrap gap-3">{!submitted ? <button type="button" disabled={!choice} onClick={() => setSubmitted(true)} className="min-h-11 rounded-lg bg-accent px-4 font-medium text-accent-ink disabled:cursor-not-allowed disabled:opacity-50">Check relationship</button> : <>
      <button type="button" onClick={() => {setChoice(null); setSubmitted(false); heading.current?.focus();}} className="min-h-11 rounded-lg border border-line px-4 text-ink">Try this set again</button>
      <button type="button" onClick={next} className="min-h-11 rounded-lg bg-accent px-4 font-medium text-accent-ink">{index === PROPORTION_PRACTICE.length - 1 ? "Start again" : "Next set"}</button>
    </>}</div>
  </section>;
}
