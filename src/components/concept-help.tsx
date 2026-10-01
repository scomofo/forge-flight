import * as Popover from "@radix-ui/react-popover";
import { LessonSections } from "@/components/lesson-sections";
import { getConceptHelp } from "@/course/concept-help";
import type { ConceptHelp as ConceptHelpContent, IdeaHelp } from "@/course/types";

function resolveHelp(item: IdeaHelp): ConceptHelpContent | null {
  if ("title" in item) return item;
  const base = getConceptHelp(item.concept);
  if (!base) return null;
  return {
    ...base,
    trigger: item.trigger ?? base.trigger,
    sections: [...base.sections, ...(item.addSections ?? [])],
    caution: item.addCaution ?? base.caution,
  };
}

export function ConceptHelp({ help }: { help: IdeaHelp[] }) {
  const resolved = help.map(resolveHelp).filter((item): item is ConceptHelpContent => item !== null);
  if (!resolved.length) return null;

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {resolved.map((item) => (
        <Popover.Root key={item.title}>
          <Popover.Trigger asChild>
            <button
              type="button"
              className="inline-flex min-h-10 items-center rounded-full border border-line bg-surface px-3 text-sm font-medium text-accent transition-transform duration-150 active:scale-[0.96]"
            >
              {item.trigger}
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              aria-label={item.title}
              tabIndex={-1}
              onOpenAutoFocus={(event) => {
                // Start at the explanation, not the Close button at its bottom.
                event.preventDefault();
                if (event.target instanceof HTMLElement) event.target.focus({ preventScroll: true });
              }}
              sideOffset={8}
              collisionPadding={16}
              style={{ maxHeight: "min(70dvh, 36rem, var(--radix-popover-content-available-height))" }}
              className="z-50 w-[min(92vw,34rem)] max-w-[calc(100vw-2rem)] overflow-y-auto overscroll-contain break-words rounded-xl border border-line bg-bg p-5 shadow-xl"
            >
              <p className="text-sm font-medium text-accent">Further detail</p>
              <h3 className="mt-1 font-serif text-2xl leading-tight text-ink">{item.title}</h3>
              {item.intro ? <p className="mt-3 leading-relaxed text-ink">{item.intro}</p> : null}

              <LessonSections sections={item.sections} hideHeading={item.sections.length === 1 && item.sections[0].heading === item.title} />

              {item.caution ? (
                <div className="mt-5 rounded-lg border border-line bg-surface px-4 py-3">
                  <p className="text-sm font-medium text-ink">Watch out</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{item.caution}</p>
                </div>
              ) : null}

              {item.sources?.length ? (
                <div className="mt-5 border-t border-line pt-3">
                  <p className="text-sm font-medium text-ink">Property sources</p>
                  <ul className="mt-2 space-y-2 text-sm">
                    {item.sources.map((source) => (
                      <li key={source.url}>
                        <a className="text-accent underline underline-offset-4" href={source.url} target="_blank" rel="noopener noreferrer">
                          {source.label} (opens in a new tab)
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="mt-5 flex justify-end">
                <Popover.Close asChild>
                  <button
                    type="button"
                    className="inline-flex min-h-10 items-center rounded-lg border border-line px-3 text-sm font-medium text-ink"
                  >
                    Close
                  </button>
                </Popover.Close>
              </div>
              <Popover.Arrow className="fill-line" />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      ))}
    </div>
  );
}
