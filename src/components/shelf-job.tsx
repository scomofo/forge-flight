import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { fmt, Slider } from "@/components/bench/ui";
import {
  evaluateShelf,
  jobChecks,
  shelfBrief,
  shelfMaterials,
  type ShelfMaterialId,
} from "@/course/job";
import { PASS_AT } from "@/course/types";
import { cn } from "@/lib/cn";

export function ShelfJob({
  alreadyPassed,
  onPassed,
}: {
  alreadyPassed: boolean;
  onPassed: (correct: number) => void;
}) {
  const [id, setId] = useState<ShelfMaterialId>("steel");
  const [thickness, setThickness] = useState(12);
  const [locked, setLocked] = useState<{ id: ShelfMaterialId; thickness: number } | null>(null);
  const [q, setQ] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const design = evaluateShelf(id, thickness);
  const question = jobChecks[q];

  return (
    <div className="flex flex-col gap-8">
      {alreadyPassed ? (
        <p className="max-w-prose leading-relaxed text-ink">
          You already finished this job. The bench stays open. Another thickness that still passes is also a valid board, just a heavier one.
        </p>
      ) : null}

      <section>
        <h2 className="font-serif text-2xl text-ink">The brief</h2>
        <p className="mt-3 max-w-prose leading-relaxed text-ink">
          A hallway shelf. The opening is already built. You do not get to move the walls.
        </p>
        <dl className="mt-4 max-w-prose">
          {[
            ["Span", "1.2 m", "Fixed"],
            ["Load at the center", "400 N", "Fixed. About 40 kg of books."],
            ["Depth", "220 mm", "Fixed. Deep enough for the books."],
            ["Material", "You choose", "Wood, aluminum, steel, or acrylic."],
            ["Thickness", "6 to 40 mm", "This is your other choice."],
          ].map(([term, value, note]) => (
            <div key={term} className="grid grid-cols-[8.5rem_1fr] gap-3 border-b border-line py-3 text-sm sm:grid-cols-[11rem_1fr]">
              <dt className="text-muted">{term}</dt>
              <dd>
                <span className="text-ink">{value}</span>
                <span className="mt-0.5 block text-muted">{note}</span>
              </dd>
            </div>
          ))}
        </dl>
        <h3 className="mt-8 font-serif text-xl text-ink">Properties you are allowed to use</h3>
        <ul className="mt-3 max-w-prose">
          {shelfMaterials.map((m) => (
            <li key={m.id} className="border-b border-line py-2 text-sm text-ink">
              {m.name}. E {m.eGpa} GPa. Allowable bending stress {m.allowMpa} MPa. Density {m.density} kg/m³.
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg border border-line bg-surface px-4 py-4 sm:px-5">
        <p className="text-sm font-medium text-accent">Do this</p>
        <p className="mt-1 text-lg leading-relaxed text-ink">
          Pick a material. Drag the thickness. Stop only when all three requirements say Pass.
        </p>
        <p className="mt-4 text-sm font-medium text-accent">You should see</p>
        <p className="mt-1 leading-relaxed text-ink">
          A pass on stress does not give you a pass on sag. A pass on sag can still fail the mass limit. One miss rejects the board.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-ink">Requirements</h2>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">All three are screens. They are not a score you can average. If no thickness works for a material, the screens have eliminated it. Try another material instead of searching indefinitely.</p>
        <ul className="mt-4">
          <Requirement
            name="Strength"
            pass={design.passStress}
            detail={`Safety factor ${fmt(design.safetyShown, 2)}. Need at least ${shelfBrief.minSafety}.`}
            hint="The board is over its allowable bending stress. Thickness lowers stress with the square of thickness."
          />
          <Requirement
            name="Sag"
            pass={design.passSag}
            detail={`Sag ${fmt(design.sagShown, 1)} mm. Limit ${shelfBrief.sagLimitMm} mm, which is span / 250.`}
            hint="Stiffness is a different test from strength. Sag drops with thickness cubed, and with a higher Young’s modulus."
          />
          <Requirement
            name="Mass"
            pass={design.passMass}
            detail={`Mass ${fmt(design.massShown, 1)} kg. Limit ${shelfBrief.maxMassKg} kg, so you can carry it up the stairs.`}
            hint="This solid board is too heavy. More thickness adds mass. A lighter material is the way through. A hollow steel shape is not allowed on this brief."
          />
        </ul>
      </section>

      <div className="overflow-hidden rounded-lg bg-well text-well-fg">
        <div className="px-4 py-5 sm:px-6">
          <ShelfDrawing sagMm={design.sagShown} thickness={thickness} name={design.mat.name} />
          <div className="mt-5 flex flex-col gap-2 text-sm leading-relaxed text-well-dim">
            <p>{design.mat.name}. E = {design.mat.eGpa} GPa. Allowable = {design.mat.allowMpa} MPa. Density = {design.mat.density} kg/m³.</p>
            <p>Moment = {shelfBrief.loadN} × {shelfBrief.spanM} / 4 = {fmt(design.moment, 0)} N·m</p>
            <p>
              Stress = 6 × {fmt(design.moment, 0)} / ({shelfBrief.depthM} × {fmt(design.h, 3)}²) = {fmt(design.stressShown, 2)} MPa
            </p>
            <p>
              Safety factor = {design.mat.allowMpa} / {fmt(design.stressShown, 2)} = {fmt(design.safetyShown, 2)}
            </p>
            <p>Sag = PL³ / (48EI) = {fmt(design.sagShown, 1)} mm</p>
            <p>
              Mass = {design.mat.density} × {shelfBrief.depthM} × {fmt(design.h, 3)} × {shelfBrief.spanM} = {fmt(design.massShown, 1)} kg
            </p>
          </div>
        </div>
        <div className="grid gap-x-6 gap-y-1 border-t border-white/15 px-4 py-4 sm:px-6">
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            {shelfMaterials.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setId(m.id)}
                className={cn(
                  "min-h-11 rounded-lg px-3 py-2 text-sm",
                  m.id === id ? "bg-well-fg text-well" : "ring-1 ring-white/25",
                )}
              >
                {m.name}
              </button>
            ))}
          </div>
          <div className="sm:col-span-2">
            <Slider
              label="Thickness"
              min={shelfBrief.thicknessMinMm}
              max={shelfBrief.thicknessMaxMm}
              step={1}
              value={thickness}
              display={`${fmt(thickness, 0)} mm`}
              onChange={setThickness}
            />
          </div>
        </div>
      </div>

      <p className="max-w-prose text-sm leading-relaxed text-muted">
        <span className="font-medium text-ink">This model leaves out. </span>
        Solid rectangle only, simply supported, load at midspan. No notch, no creep, no person sitting on it. Allowable stresses are teaching values. A steel angle or a hollow section could win on mass, and this brief does not let you change the shape.
      </p>

      <div>
        <Button
          disabled={!design.pass}
          onClick={() => {
            setLocked({ id, thickness });
            setQ(0);
            setPicked(null);
            setCorrect(0);
            setDone(false);
          }}
        >
          {design.pass ? "Lock this design" : "Not yet — all three must say Pass"}
        </Button>
        {locked ? (
          <p className="mt-4 max-w-prose leading-relaxed text-ink">
            Locked: {locked.thickness} mm {shelfMaterials.find((m) => m.id === locked.id)?.name}. That board meets the brief. Thicker wood would still pass, and it would weigh more. The lightest board that passes is the one you keep, unless a stock size forces the next step up.
          </p>
        ) : null}
      </div>

      {locked && !done ? (
        <section className="border-t border-line pt-8">
          <h2 className="font-serif text-2xl text-ink">Say why it works</h2>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">
            Four questions. Pick one answer, read the reason, then continue. Three correct finishes the job.
          </p>
          <p className="mt-6 text-sm text-muted">
            Question {q + 1} of {jobChecks.length}
          </p>
          <h3 className="mt-2 max-w-prose font-serif text-2xl text-ink">{question.prompt}</h3>
          <div className="mt-5 flex flex-col gap-2" role="radiogroup" aria-label={question.prompt}>
            {question.options.map((option, i) => {
              const show = picked !== null;
              const isAnswer = i === question.answer;
              return (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={picked === i}
                  disabled={picked !== null}
                  onClick={() => setPicked(i)}
                  className={cn(
                    "min-h-11 rounded-lg border px-3 py-3 text-left text-sm",
                    !show && "border-line",
                    show && isAnswer && "border-accent text-ink",
                    show && !isAnswer && picked === i && "border-line text-muted",
                    show && picked !== i && !isAnswer && "border-line text-muted",
                  )}
                >
                  {option}
                </button>
              );
            })}
          </div>
          {picked !== null ? (
            <div className="mt-5">
              <p className="max-w-prose leading-relaxed text-ink">
                {picked === question.answer ? "Yes. " : "No. "}
                {question.why}
              </p>
              <Button
                className="mt-4"
                onClick={() => {
                  const nextCorrect = correct + (picked === question.answer ? 1 : 0);
                  if (q + 1 >= jobChecks.length) {
                    setCorrect(nextCorrect);
                    setDone(true);
                    if (nextCorrect >= PASS_AT) onPassed(nextCorrect);
                  } else {
                    setCorrect(nextCorrect);
                    setQ(q + 1);
                    setPicked(null);
                  }
                }}
              >
                {q + 1 >= jobChecks.length ? "Finish" : "Next question"}
              </Button>
            </div>
          ) : null}
        </section>
      ) : null}

      {done ? (
        <section className="border-t border-line pt-8">
          <p className="font-serif text-3xl text-ink">
            {correct} of {jobChecks.length}.
          </p>
          <p className="mt-3 max-w-prose leading-relaxed text-ink">
            {correct >= PASS_AT
              ? "You specified a board that holds the load, stays inside the sag limit, and is light enough to carry. That is the job. It is not a license to stamp drawings. It is the same kind of decision, on one part, with the numbers showing."
              : "Not yet. You need 3 of 4. The locked board still meets the brief. Retake the questions and use the reasons."}
          </p>
          {correct >= PASS_AT ? (
            <Link to="/learn/$trackId" params={{ trackId: "manufacturing" }} className="mt-6 inline-flex min-h-11 items-center text-ink">
              Next section: Manufacturing →
            </Link>
          ) : (
            <Button
              className="mt-4"
              variant="ghost"
              onClick={() => {
                setQ(0);
                setPicked(null);
                setCorrect(0);
                setDone(false);
              }}
            >
              Try the questions again
            </Button>
          )}
        </section>
      ) : null}
    </div>
  );
}

function Requirement({
  name,
  pass,
  detail,
  hint,
}: {
  name: string;
  pass: boolean;
  detail: string;
  hint: string;
}) {
  return (
    <li className="border-b border-line py-4">
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-serif text-xl text-ink">{name}</p>
        <p className={cn("text-sm font-medium", pass ? "text-accent" : "text-ink")}>{pass ? "Pass" : "Not yet"}</p>
      </div>
      <p className="mt-1 text-sm text-ink">{detail}</p>
      {pass ? null : <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">{hint}</p>}
    </li>
  );
}

function ShelfDrawing({ sagMm, thickness, name }: { sagMm: number; thickness: number; name: string }) {
  const sag = Math.min(36, sagMm * 1.4);
  const thick = Math.min(14, 4 + thickness / 8);
  return (
    <div>
      <svg viewBox="0 0 320 110" className="h-auto w-full" aria-hidden>
        <path d={`M36 ${28} Q160 ${28 + sag} 284 ${28}`} fill="none" stroke="currentColor" strokeWidth={thick} />
        <path d="M36 40 L24 58 L48 58 Z M284 40 L272 58 L296 58 Z" fill="currentColor" />
        <path d="M160 8 V22" stroke="currentColor" strokeWidth="2" />
        <path d="M154 16 L160 24 L166 16" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
      <p className="mt-2 text-sm text-well-dim">
        {name}, {thickness} mm. The drawing exaggerates the sag. The millimeters in the formula do not.
      </p>
    </div>
  );
}
