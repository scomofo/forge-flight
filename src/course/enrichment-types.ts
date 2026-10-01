import type { WalkthroughBlock } from './walkthrough-types.ts';

export type EnrichmentAnchor = 'opening' | 'idea-0' | 'idea-1' | 'idea-2' | 'example' | 'move';
export type LessonAddition = {
  id: string;
  at: EnrichmentAnchor;
  mode: 'inline' | 'help';
  heading: string;
  blocks: WalkthroughBlock[];
};
export type LessonEnrichment = {
  sources?: { label: string; url: string }[];
  sections: LessonAddition[];
  practice?: { prompt: WalkthroughBlock[]; answer: WalkthroughBlock[] };
};

export const p = (text: string): WalkthroughBlock => ({ kind: 'paragraph', text });
export const list = (...items: string[]): WalkthroughBlock => ({ kind: 'list', ordered: false, items: items.map(text => ({ text })) });
export const table = (columns: string[], rows: string[][]): WalkthroughBlock => ({ kind: 'table', columns, rows });
export const inline = (at: EnrichmentAnchor, heading: string, ...blocks: WalkthroughBlock[]): LessonAddition => ({ id: heading.toLowerCase().replace(/[^a-z0-9]+/g, '-'), at, mode: 'inline', heading, blocks });
export const help = (at: EnrichmentAnchor, heading: string, ...blocks: WalkthroughBlock[]): LessonAddition => ({ ...inline(at, heading, ...blocks), mode: 'help' });
export const practice = (prompt: string, answer: string): LessonEnrichment['practice'] => ({ prompt: [p(prompt)], answer: [p(answer)] });
