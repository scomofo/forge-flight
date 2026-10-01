import { useState } from "react";
import { BOND_PROFILES, SUBSTANCES, profileProperties, substanceProperties, scorePrediction, type BondKind, type ReferencePropertyPack } from "@/course/bonding";
import { BenchShell, Readouts, WellButton, Segmented } from "./ui";

const electrical = [
  { value: "conductor", label: "Conductor" },
  { value: "insulator", label: "Insulator" },
  { value: "semiconductor", label: "Semiconductor" },
  { value: "insulator-until-molten", label: "Insulates solid, conducts molten" },
  { value: "material-dependent", label: "Not determined by bond alone" },
] as const;
const mechanical = [
  { value: "ductile", label: "Ductile" },
  { value: "brittle", label: "Brittle" },
  { value: "material-dependent", label: "Needs material and conditions" },
  { value: "soft", label: "Soft / easy layer sliding" },
] as const;
const thermal = [
  { value: "material-dependent", label: "Needs material and conditions" },
  { value: "high-melting", label: "High melting point" },
  { value: "high-temperature", label: "High-temperature resistance" },
  { value: "low-melting", label: "Low melting point" },
  { value: "decomposes-or-softens", label: "Softening / degradation: distinguish the process" },
] as const;
const label = (items: readonly { value: string; label: string }[], value: string) => items.find(i => i.value === value)?.label ?? value;
const blank = (): ReferencePropertyPack => ({ conduction: "conductor", mechanical: "ductile", thermal: "high-melting" });
// The old bank awarded incorrect SiC/graphite answers. Retain its stored value
// untouched but do not present it as a score on this corrected bank.
const SCORE_KEY = "ff:bondpredict-reference-v2";
function loadScore(): number | null {
  try {
    const raw = localStorage.getItem(SCORE_KEY);
    if (raw === null) return null;
    const score = Number(raw);
    return Number.isInteger(score) && score >= 0 && score <= SUBSTANCES.length * 3 ? score : null;
  } catch { return null; }
}

export function BondEnergyBench() {
  const [kind, setKind] = useState<BondKind>("metallic");
  const profile = BOND_PROFILES[kind], pack = profileProperties(kind);
  return <BenchShell
    prompt="Compare the bond families. || Use each property package as a qualified tendency, then identify the material-specific exception."
    note="Energy ranges are illustrative orders of magnitude, not melting-point calculations or design allowables. Electrical behavior needs the named material. Temperature capability also depends on atmosphere and phase changes."
    controls={<div className="flex flex-wrap gap-2 sm:col-span-2">{(Object.keys(BOND_PROFILES) as BondKind[]).map(k => <button type="button" key={k} aria-pressed={kind === k} onClick={() => setKind(k)} className="min-h-11 rounded-lg px-3 py-2 ring-1 ring-white/25">{BOND_PROFILES[k].label}</button>)}</div>}
  >
    <Readouts items={[
      { label: "Illustrative separation energy", value: `${profile.energyRangeKJ[0]}–${profile.energyRangeKJ[1]} kJ/mol` },
      { label: "Electrical behavior", value: label(electrical, pack.conduction) },
      { label: "Typical mechanical behavior", value: label(mechanical, pack.mechanical) },
      { label: "Thermal tendency", value: label(thermal, pack.thermal) },
    ]}/>
    <p className="text-sm leading-relaxed text-well-dim">Reference basis: {profile.energyBasis}.</p>
    <p className="mt-3 text-sm leading-relaxed text-well-dim">{profile.why}</p>
    <p className="mt-3 text-sm text-well-dim">Examples: {profile.examples}.</p>
  </BenchShell>;
}

export function BondPredictBench() {
  const [index, setIndex] = useState(0), [guess, setGuess] = useState(blank);
  const [revealed, setRevealed] = useState(false), [total, setTotal] = useState(0);
  const [best, setBest] = useState<number | null>(loadScore);
  const item = SUBSTANCES[index], done = !item;
  const actual = item ? substanceProperties(item) : null;
  const next = () => {
    if (!actual || !revealed) return;
    const score = total + scorePrediction(guess, actual);
    setTotal(score);
    if (index === SUBSTANCES.length - 1) {
      const record = Math.max(score, best ?? 0); setBest(record);
      try { localStorage.setItem(SCORE_KEY, String(record)); } catch { /* in-memory score remains available */ }
    }
    setIndex(index + 1); setRevealed(false); setGuess(blank());
  };
  return <BenchShell
    prompt="Read the named substance and its structural hint. || Predict the electrical, mechanical and thermal behavior under the stated conditions, then reveal the reference explanation."
    note="These are qualitative classifications, not measured design properties. Graphite uses conduction along a sheet and sliding between sheets. A high-temperature classification is not a claim of stability in air. Earlier scores from the incorrect bank are not reused."
    controls={done ? <div className="sm:col-span-2"><WellButton onClick={() => { setIndex(0); setGuess(blank()); setTotal(0); setRevealed(false); }}>Run it again</WellButton></div> : <>
      {!revealed ? <>
        <Segmented label="Electrical" value={guess.conduction} onChange={v => setGuess({ ...guess, conduction: v })} options={[...electrical]}/>
        <Segmented label="Mechanical" value={guess.mechanical} onChange={v => setGuess({ ...guess, mechanical: v })} options={[...mechanical]}/>
        <Segmented label="Thermal" value={guess.thermal} onChange={v => setGuess({ ...guess, thermal: v })} options={[...thermal]}/>
      </> : null}
      <div className="sm:col-span-2"><WellButton onClick={revealed ? next : () => setRevealed(true)}>{revealed ? index === SUBSTANCES.length - 1 ? "Finish" : "Next substance" : "Reveal the reference"}</WellButton></div>
    </>}
  >
    {done ? <Readouts items={[{ label: "Correct property choices", value: `${total} / ${SUBSTANCES.length * 3}` }, { label: "Best on corrected bank", value: `${best ?? total} / ${SUBSTANCES.length * 3}` }]}/> : <>
      <p className="text-sm text-well-dim">Substance {index + 1} of {SUBSTANCES.length}</p>
      <h3 className="mt-2 font-serif text-2xl">{item.name}</h3>
      <p className="mt-3 text-sm leading-relaxed text-well-dim">{item.hint}</p>
      {revealed && actual ? <div className="mt-5" data-bonding-reference={item.name}>
        <Readouts items={[
          { label: "Electrical", value: label(electrical, actual.conduction) },
          { label: "Mechanical", value: label(mechanical, actual.mechanical) },
          { label: "Thermal", value: label(thermal, actual.thermal) },
          { label: "This round", value: `${scorePrediction(guess, actual)} / 3` },
        ]}/>
        <p className="text-sm leading-relaxed text-well-dim">{item.why}</p>
      </div> : null}
    </>}
  </BenchShell>;
}
