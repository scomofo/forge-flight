import { ConceptHelp } from '@/components/concept-help';
import { LessonBlocks } from '@/components/lesson-walkthrough';
import type { EnrichmentAnchor, LessonEnrichment } from '@/course/enrichment-types';

/** Reading and practice stay separate from assessment and persisted progress. */
export function EnrichmentAt({ enrichment, at }: { enrichment?: LessonEnrichment; at: EnrichmentAnchor }) {
  const sections = enrichment?.sections.filter(section => section.at === at) ?? [];
  const sources = at === "example" ? enrichment?.sources : undefined;
  if (!sections.length && !sources?.length) return null;
  return <div className="mt-6 space-y-5" data-enrichment-anchor={at}>
    {sections.map(section => section.mode === 'inline'
      ? <section key={section.id} data-enrichment-section={section.id} className="min-w-0 border-l-2 border-line pl-4">
          <h3 className="mb-3 font-serif text-xl text-accent">{section.heading}</h3>
          <LessonBlocks blocks={section.blocks} label={section.heading} />
        </section>
      : <div key={section.id} data-enrichment-help={section.id}><ConceptHelp help={[{
          trigger: section.heading, title: section.heading, intro: '',
          sections: [{ heading: section.heading, blocks: section.blocks }],
        }]} /></div>)}
    {sources?.length ? <aside aria-label="Reference notes" className="text-sm"><p className="font-medium text-ink">Reference notes</p>{sources.map(source => <p key={source.url} className="mt-2"><a href={source.url} target="_blank" rel="noopener noreferrer" className="break-words text-accent underline">{source.label}</a></p>)}</aside> : null}
  </div>;
}

export function LessonPractice({ practice }: { practice: NonNullable<LessonEnrichment['practice']> }) {
  return <section data-lesson-practice aria-label="Additional practice" className="mb-8 rounded-lg border border-line bg-surface p-4 sm:p-5">
    <h2 className="mb-3 font-serif text-2xl text-ink">Practice</h2>
    <p className="mb-4 text-sm text-muted">Work out your answer before checking the reasoning. This exercise is ungraded.</p>
    <LessonBlocks blocks={practice.prompt} label="Practice question" />
    <details data-practice-answer className="mt-5 border-t border-line pt-3">
      <summary className="min-h-11 cursor-pointer font-medium text-accent focus-visible:outline-2 focus-visible:outline-accent">Answer and reasoning</summary>
      <div className="mt-3"><LessonBlocks blocks={practice.answer} label="Practice answer" /></div>
    </details>
  </section>;
}
