import { LessonBlocks } from "@/components/lesson-walkthrough";
import type { ConceptHelpSection } from "@/course/types";

/** Shared readable sections for the lesson and its optional explanations. */
export function LessonSections({ sections, hideHeading = false }: { sections: ConceptHelpSection[]; hideHeading?: boolean }) {
  return <div className="mt-5 flex min-w-0 flex-col gap-6">
    {sections.map(section => <section key={section.heading}>
      {!hideHeading ? <h4 className="text-base font-semibold text-ink">{section.heading}</h4> : null}
      {section.blocks ? <div className="mt-3"><LessonBlocks blocks={section.blocks} label={section.heading} /></div> : null}
      {section.body ? <p className="mt-2 max-w-prose leading-relaxed text-muted">{section.body}</p> : null}
      {section.items?.length ? <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-muted">
        {section.items.map(line => <li key={line}>{line}</li>)}
      </ul> : null}
      {section.table ? <div role="region" aria-label={section.table.caption} tabIndex={0} className="mt-4 max-w-full overflow-x-auto rounded-lg border border-line focus-visible:outline-2 focus-visible:outline-accent">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="p-3 text-left font-medium text-ink">{section.table.caption}</caption>
          <thead className="bg-surface"><tr>{section.table.columns.map(c => <th key={c} scope="col" className="border-b border-line px-3 py-2 font-medium text-ink">{c}</th>)}</tr></thead>
          <tbody>{section.table.rows.map((row, i) => <tr key={i}>{row.map((cell, j) => j === 0
            ? <th key={j} scope="row" className="border-b border-line px-3 py-2 font-normal text-ink">{cell}</th>
            : <td key={j} className="border-b border-line px-3 py-2 text-muted">{cell}</td>)}</tr>)}</tbody>
        </table>
      </div> : null}
    </section>)}
  </div>;
}
