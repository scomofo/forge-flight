import * as Popover from "@radix-ui/react-popover";
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
              sideOffset={8}
              collisionPadding={16}
              className="z-50 max-h-[min(70vh,36rem)] w-[min(92vw,34rem)] overflow-y-auto rounded-xl border border-line bg-bg p-5 shadow-xl"
            >
              <p className="text-sm font-medium text-accent">Explain this</p>
              <h3 className="mt-1 font-serif text-2xl leading-tight text-ink">{item.title}</h3>
              <p className="mt-3 leading-relaxed text-ink">{item.intro}</p>

              <div className="mt-5 flex flex-col gap-5">
                {item.sections.map((section) => (
                  <section key={section.heading}>
                    <h4 className="text-sm font-semibold text-ink">{section.heading}</h4>
                    {section.body ? (
                      <p className="mt-2 leading-relaxed text-muted">{section.body}</p>
                    ) : null}
                    {section.items?.length ? (
                      <ul className="mt-2 space-y-1.5 pl-5 text-sm leading-relaxed text-muted">
                        {section.items.map((line) => (
                          <li key={line} className="list-disc">
                            {line}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </section>
                ))}
              </div>

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
