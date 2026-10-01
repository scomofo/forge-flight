import { materialsWalkthroughs } from './materials-walkthroughs.ts';
import type { EnrichmentAnchor, LessonEnrichment } from './enrichment-types.ts';

// Editorial placement, one entry for every source section, in source order.
// 0/1/2: visible beside that idea; x: example; m: method; o: opening.
// Prefix h for optional contextual help. Chat commands never choose placement.
export const materialsPlacement: Readonly<Record<string, string>> = {
  bondzoo: '0 h0 h0 h0 h1 h2 ho hx h0 m',
  bondpacks: '0 ho h0 1 h1 2 hm m',
  bondread: '0 ho hx 1 2 hm m',
  crystal: 'h0 h0 0 hx 1 h0 2 m',
  graintex: 'h0 0 h0 h1 ho 1 2 m',
  disorder: 'h0 0 1 ho h2 2 m',
  defects: 'h0 0 h0 h1 ho h2 2 m',
  diffusion: 'h0 h0 0 1 2 hx h2 x m',
  'heat-treat': 'o ho 0 h1 1 2 h1 m',
  readcurve: 'h0 h0 ho hx 0 1 2 m',
  toughduct: '0 ho h0 1 2 m',
  allowables: 'h0 1 0 2 h2 m',
  strengthen: 'h0 0 ho h1 h2 h2 2 m',
  heattreat: 'ho 0 1 hx 2 m',
  processchoice: 'ho 0 hx 1 h1 2 m',
  fracture: '0 h1 2 hx h2 h2 m',
  fatigue: 'h0 0 ho h0 h0 1 2 m hm',
  creep: '0 ho 1 hx 2 h1 m',
  phasediagram: '0 1 ho 2 h2 m',
  leverrule: 'h0 0 1 hx m 2 h1 hm',
  transformations: '0 hx 1 2 m',
  famlook: '0 h0 hx 1 h1 2 m',
  dirtemp: '0 hx 1 hx 2 m',
  choosefam: '0 hx 1 2 m',
  screenrank: 'h2 hx 1 h1 0 hm m',
  corrosion: 'h0 0 h0 hx 1 2 m hm',
  sustain: '0 hx 1 2 m',
  matmethod: 'hx h0 0 1 2 m',
  sparsynth: 'x hx hx hx hx hx hx ho 0 1 hm 2',
  matmastery: 'h0 0 hx 2 1 m',
};
const anchors: Record<string, EnrichmentAnchor> = { '0': 'idea-0', '1': 'idea-1', '2': 'idea-2', x: 'example', m: 'move', o: 'opening' };

export function materialsEnrichment(id: string): LessonEnrichment | undefined {
  const w = materialsWalkthroughs[id];
  if (!w) return undefined;
  const placements = materialsPlacement[id].split(' ');
  return {
    sections: [
      { id: 'context', at: 'opening', mode: 'inline', heading: 'Connecting the ideas', blocks: w.intro },
      ...w.sections.map((section, index) => {
        const placement = placements[index];
        return { id: `materials-${index}`, at: anchors[placement.replace('h', '')], mode: placement.startsWith('h') ? 'help' as const : 'inline' as const,
          heading: section.heading.replace(/^\d+\.\s*/, ''), blocks: section.blocks };
      }),
      ...(w.notes.length ? [{ id: 'model-limits', at: 'example' as const, mode: 'inline' as const, heading: 'Givens and model limits', blocks: w.notes.map(text => ({ kind: 'paragraph' as const, text })) }] : []),
    ],
    practice: w.practice,
    sources: w.sources,
  };
}
