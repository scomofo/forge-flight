import { useId } from "react";
import type { ExampleContext } from "@/course/types";

/** Required inputs are visible, including on direct entry to an animated example. */
export function ExampleInputs({ context, compact = false }: { context?: ExampleContext; compact?: boolean }) {
  const headingId = useId();
  if (!context) return null;
  return (
    <aside aria-labelledby={headingId} data-example-inputs={compact ? "figure" : "worked"} className="my-5 min-w-0 rounded-lg border border-line bg-surface p-4 sm:p-5">
      <h3 id={headingId} className="font-serif text-lg text-ink">{compact ? "Before the animation" : "Where these numbers come from"}</h3>
      <p className="mt-1 text-sm leading-relaxed text-muted">These values are supplied for this example. You do not need to guess them or memorize a material table.</p>
      <dl className="mt-4 grid min-w-0 gap-4 sm:grid-cols-2">
        {context.inputs.map((input) => (
          <div key={input.label} className="min-w-0 break-words">
            <dt className="text-sm font-medium text-ink">{input.label}</dt>
            <dd className="mt-1 text-sm leading-relaxed text-ink">
              <span className="font-medium">{input.value}</span>
              <span className="mt-1 block text-xs font-medium text-accent">{input.origin}</span>
              {input.detail ? <span className="mt-1 block text-muted">{input.detail}</span> : null}
            </dd>
          </div>
        ))}
      </dl>
      {context.tables?.map((table) => (
        <div key={table.caption} role="region" aria-label={table.caption} tabIndex={0} className="mt-5 max-w-full overflow-x-auto rounded border border-line focus-visible:outline-2 focus-visible:outline-accent">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="px-3 py-3 text-left font-medium text-ink">{table.caption}</caption>
            <thead className="bg-bg"><tr>{table.columns.map((column) => <th key={column} scope="col" className="border-b border-line px-3 py-2 font-medium text-ink">{column}</th>)}</tr></thead>
            <tbody>{table.rows.map((row, i) => <tr key={i}>{row.map((cell, j) => j === 0 ? <th key={j} scope="row" className="border-b border-line px-3 py-2 font-normal text-ink">{cell}</th> : <td key={j} className="border-b border-line px-3 py-2 text-muted">{cell}</td>)}</tr>)}</tbody>
          </table>
        </div>
      ))}
      {!compact && context.working?.length ? (
        <div className="mt-5 border-t border-line pt-4">
          <h4 className="text-sm font-medium text-ink">Follow the calculation</h4>
          <ol className="mt-2 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-ink">{context.working.map((line, i) => <li key={i} className="break-words pl-1">{line}</li>)}</ol>
        </div>
      ) : null}
      {context.notes?.map((note) => <p key={note} className="mt-4 text-sm leading-relaxed text-muted">{note}</p>)}
      {context.sources?.length ? <p className="mt-4 text-sm text-muted">References: {context.sources.map((source, i) => <span key={source.url}>{i ? " · " : ""}<a className="text-accent underline underline-offset-2" href={source.url} target="_blank" rel="noreferrer">{source.label}</a></span>)}</p> : null}
    </aside>
  );
}
