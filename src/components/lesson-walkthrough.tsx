import type { ReactNode } from "react";
import type { LessonWalkthrough, WalkthroughBlock } from "@/course/walkthrough-types";

/** A deliberately small inline grammar. Strings are React text, never HTML. */
function Inline({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  const tokens = /\*\*([^*]+)\*\*|\*([^*\n]+)\*|`([^`]+)`/g;
  let end = 0;
  for (const match of text.matchAll(tokens)) {
    const start = match.index ?? 0;
    if (start > end) nodes.push(text.slice(end, start));
    if (match[1]) nodes.push(<strong key={start} className="font-semibold text-ink">{match[1]}</strong>);
    else if (match[2]) nodes.push(<em key={start}>{match[2]}</em>);
    else nodes.push(<code key={start} className="break-words rounded bg-bg px-1 text-sm">{match[3]}</code>);
    end = start + match[0].length;
  }
  if (end < text.length) nodes.push(text.slice(end));
  return <>{nodes}</>;
}

function Blocks({ blocks, label }: { blocks: WalkthroughBlock[]; label: string }) {
  return <div className="space-y-4 leading-relaxed text-ink">
    {blocks.map((block, index) => {
      if (block.kind === "paragraph") return <p key={index} className="max-w-prose break-words"><Inline text={block.text} /></p>;
      if (block.kind === "quote") return <blockquote key={index} className="border-l-2 border-accent pl-4"><Inline text={block.text} /></blockquote>;
      if (block.kind === "list") {
        const Tag = block.ordered ? "ol" : "ul";
        return <Tag key={index} className={`space-y-2 pl-6 ${block.ordered ? "list-decimal" : "list-disc"}`}>
          {block.items.map((item, i) => <li key={i} className="break-words pl-1"><Inline text={item.text} />{item.children?.length ? <div className="mt-2"><Blocks blocks={item.children} label={label} /></div> : null}</li>)}
        </Tag>;
      }
      if (block.kind !== "table") return null;
      return <div key={index} role="region" aria-label={`${label}: table ${index + 1}`} tabIndex={0}
        className="max-w-full overflow-x-auto rounded-lg border border-line focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">{label}</caption>
          <thead className="bg-bg"><tr>{block.columns.map((column, i) => <th key={i} scope="col" className="min-w-24 border-b border-line px-3 py-3 align-top font-medium"><Inline text={column || "Comparison"} /></th>)}</tr></thead>
          <tbody>{block.rows.map((row, i) => <tr key={i} className="border-b border-line last:border-0">{row.map((cell, j) => j === 0
            ? <th key={j} scope="row" className="px-3 py-3 align-top font-normal"><Inline text={cell} /></th>
            : <td key={j} className="px-3 py-3 align-top"><Inline text={cell} /></td>)}</tr>)}</tbody>
        </table>
      </div>;
    })}
  </div>;
}

/** Optional reading support; no grading or progress state enters this component. */
export function LessonWalkthroughPanel({ walkthrough }: { walkthrough: LessonWalkthrough }) {
  const id = `walkthrough-${walkthrough.lessonId}`;
  return <details data-lesson-walkthrough={walkthrough.lessonId} className="mt-8 min-w-0 rounded-lg border border-line bg-surface">
    <summary className="min-h-11 cursor-pointer rounded-lg px-4 py-4 font-medium text-accent focus-visible:outline-2 focus-visible:outline-accent sm:px-5">
      Walk me through this lesson
      <span className="mt-1 block text-sm font-normal text-muted">The animation, worked steps, and a practice question{walkthrough.practice ? " with a separate answer" : " review"}.</span>
    </summary>
    <div className="min-w-0 space-y-7 border-t border-line px-4 py-6 sm:px-5">
      <header>
        <h2 id={id} className="font-serif text-2xl text-ink">{walkthrough.title} — step by step</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">Example properties, coefficients and costs are supplied classroom inputs unless marked as measured or calculated. They are not certified design values, current prices or repair instructions.</p>
        <div className="mt-4"><Blocks blocks={walkthrough.intro} label={walkthrough.title} /></div>
      </header>
      {walkthrough.notes.length ? <aside className="space-y-2 border-l-2 border-accent pl-4" aria-label="Givens and model limits"><h3 className="font-medium text-accent">Before the calculation</h3>{walkthrough.notes.map((note, i) => <p key={i} className="text-sm leading-relaxed text-ink">{note}</p>)}</aside> : null}
      <nav aria-label="Walkthrough sections" className="rounded-lg border border-line p-4">
        <p className="mb-2 text-sm font-medium text-accent">Find the step you need</p>
        <ol className="space-y-1">{walkthrough.sections.map((section, i) => <li key={i}><a className="inline-flex min-h-11 items-center text-sm text-ink underline decoration-line underline-offset-4 focus-visible:outline-2 focus-visible:outline-accent" href={`#${id}-section-${i}`}>{section.heading}</a></li>)}</ol>
      </nav>
      {walkthrough.sections.map((section, i) => <section key={i} aria-labelledby={`${id}-section-${i}`} className="border-t border-line pt-6">
        <h3 id={`${id}-section-${i}`} className="mb-4 scroll-mt-40 font-serif text-xl text-accent">{section.heading}</h3>
        <Blocks blocks={section.blocks} label={section.heading} />
      </section>)}
      {walkthrough.practice ? <section data-walkthrough-practice className="border-t border-line pt-6" aria-label="Ungraded practice">
        <h3 className="mb-3 font-serif text-xl text-accent">Try one yourself</h3>
        <p className="mb-4 text-sm text-muted">This practice does not change your lesson score. Try it before opening the answer.</p>
        <Blocks blocks={walkthrough.practice.prompt} label="Practice question" />
        <details data-walkthrough-answer className="mt-4 rounded-lg border border-line p-4">
          <summary className="min-h-11 cursor-pointer font-medium text-accent focus-visible:outline-2 focus-visible:outline-accent">Show the answer and reasoning</summary>
          <div className="mt-4"><Blocks blocks={walkthrough.practice.answer} label="Practice answer" /></div>
        </details>
      </section> : null}
      {walkthrough.sources?.length ? <aside aria-label="Reference notes" className="border-t border-line pt-4"><h3 className="mb-2 text-sm font-medium text-accent">Reference notes</h3>{walkthrough.sources.map(source => <p key={source.url} className="mt-2 text-sm"><a href={source.url} target="_blank" rel="noopener noreferrer" className="break-words text-accent underline underline-offset-4">{source.label}</a></p>)}</aside> : null}
    </div>
  </details>;
}
