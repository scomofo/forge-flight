import type { ReactNode } from "react";
import type { WalkthroughBlock } from "@/course/walkthrough-types";

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

export function LessonBlocks({ blocks, label }: { blocks: WalkthroughBlock[]; label: string }) {
  return <div className="space-y-4 leading-relaxed text-ink">
    {blocks.map((block, index) => {
      if (block.kind === "paragraph") return <p key={index} className="max-w-prose break-words"><Inline text={block.text} /></p>;
      if (block.kind === "quote") return <blockquote key={index} className="border-l-2 border-accent pl-4"><Inline text={block.text} /></blockquote>;
      if (block.kind === "list") {
        const Tag = block.ordered ? "ol" : "ul";
        return <Tag key={index} className={`space-y-2 pl-6 ${block.ordered ? "list-decimal" : "list-disc"}`}>
          {block.items.map((item, i) => <li key={i} className="break-words pl-1"><Inline text={item.text} />{item.children?.length ? <div className="mt-2"><LessonBlocks blocks={item.children} label={label} /></div> : null}</li>)}
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
