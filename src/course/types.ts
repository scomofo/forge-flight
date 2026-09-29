export type TrackId =
  | "math"
  | "materials"
  | "engineering"
  | "physics"
  | "manufacturing"
  | "physics-201"
  | "physics-301"
  | "physics-401"
  | "materials-201"
  | "materials-301"
  | "materials-401"
  | "engineering-201"
  | "engineering-301"
  | "engineering-401"
  | "manufacturing-201"
  | "manufacturing-301"
  | "manufacturing-401";

export type LadderBenchId =
  | "torque"
  | "inertia"
  | "spin"
  | "period"
  | "depth"
  | "bernoulli"
  | "drag"
  | "thermal"
  | "rodspeed"
  | "modeshape"
  | "impact"
  | "resonance"
  | "creeprate"
  | "hardness"
  | "leak"
  | "thinning"
  | "coldwork"
  | "quench"
  | "lever"
  | "fiber"
  | "panel"
  | "sensitive"
  | "temper"
  | "duty"
  | "mises"
  | "torsion"
  | "hoop"
  | "eccentric"
  | "whirl"
  | "gears"
  | "bearing"
  | "preload"
  | "miner"
  | "thermomech"
  | "interval"
  | "review"
  | "rolling"
  | "taylor"
  | "pattern"
  | "distort"
  | "bonus"
  | "surface"
  | "travel"
  | "passes"
  | "bottleneck"
  | "piececost"
  | "dfa"
  | "scrap"
  | "float"
  | "pipe"
  | "turn"
  | "diffuse"
  | "mixture"
  | "pinshear"
  | "coilspring"
  | "locate"
  | "layers"
  | "takt"
  | "face"
  | "transition"
  | "scc"
  | "wear"
  | "scale"
  | "clocks";

export type BenchId =
  | "families"
  | "bonding"
  | "curve"
  | "compare"
  | "grains"
  | "ashby"
  | "shortlist"
  | "corrocheck"
  | "strain"
  | "matledger"
  | "sparlab"
  | "matcheck"
  | "curveread"
  | "propcompare"
  | "allowable"
  | "bondenergy"
  | "bondpredict"
  | "design"
  | "designreview"
  | "standards"
  | "jointrecord"
  | "jointstrength"
  | "reqpacket"
  | "ledger"
  | "units"
  | "rearrange"
  | "powers"
  | "slope"
  | "trig"
  | "beam-reactions"
  | "axial"
  | "deflection"
  | "tradeoffs"
  | "buckling"
  | "notch"
  | "fatigue"
  | "crack"
  | "bolt"
  | "mean"
  | "doe"
  | "labreport"
  | "tolstack"
  | "procchoice"
  | "loadpath"
  | "fmea"
  | "errbudget"
  | "sensbench"
  | "vectors"
  | "kinematics"
  | "newton"
  | "incline"
  | "fbdbuilder"
  | "energy"
  | "energyaudit"
  | "dropspeed"
  | "collision"
  | "wave"
  | "hydro"
  | "venturi"
  | "gliderprelab"
  | "beamdefl"
  | "stressstrain"
  | "impactlab"
  | "cmexplore"
  | "restitute"
  | "mechanism"
  | "chip"
  | "shmlab"
  | "resonancesweep"
  | "thermalstress"
  | "springback"
  | "freeze"
  | "haz"
  | "spread"
  | "stack"
  | "cappackage"
  | "cappredict"
  | "capreview"
  | "tradestudy"
  | "sweepconv"
  | "sections"
  | "sizebeam"
  | "famcompare"
  | "templim"
  | "famdecision"
  | "phaseset"
  | "solidify"
  | "forensics"
  | "snlife"
  | "creeplife"
  | "strengthlab"
  | "processmemo"
  | "defects"
  | "diffprofile"
  | "unitcell"
  | "microinterp"
  | "glassform"
  | "synthledger"
  | "gliderlab"
  | "mastery"
  | "torquebal"
  | "rotinertia"
  | "beamrxn"
  | "motionrecon"
  | "projrange"
  | "dimcheck"
  | "fermi"
  | "memo"
  | LadderBenchId;

export type ConceptHelpSection = {
  heading: string;
  body?: string;
  items?: string[];
};

export type ConceptHelp = {
  trigger: string;
  title: string;
  intro: string;
  sections: ConceptHelpSection[];
  caution?: string;
};

export type ConceptHelpRef = {
  concept: string;
  trigger?: string;
  addSections?: ConceptHelpSection[];
  addCaution?: string;
};

export type IdeaHelp = ConceptHelp | ConceptHelpRef;

export type Idea = {
  heading: string;
  body: string;
  formula?: string;
  help?: IdeaHelp[];
};

export type LessonOpening = {
  /** "steps" keeps labeled chunks; "prose" reads as a short instructor introduction. */
  mode: "steps" | "prose";
  heading?: string;
  labels?: [string, string, string];
};

export type LessonReadBlock =
  | { kind: "idea"; idea: 0 | 1 | 2; label?: string }
  | { kind: "example"; heading?: string }
  | { kind: "move"; heading?: string }
  | { kind: "aside"; heading: string; body: string };

export type Check = {
  prompt: string;
  options: [string, string, string, string];
  answer: 0 | 1 | 2 | 3;
  why: string;
};

export type Clip = {
  youtubeId?: string;
  src?: string;
  title: string;
  channel: string;
  start?: number;
  end?: number;
  watch: string;
  leave: string;
};

export type Lesson = {
  id: string;
  track: TrackId;
  index: number;
  title: string;
  minutes: number;
  lede: string;
  /** Legacy source text. Three parts separated by " || ". Presentation can vary through opening. */
  start: string;
  /** Optional presentation treatment for the same start text. */
  opening?: LessonOpening;
  /** When you are here, what you do, and when you stop. Three parts separated by " || ". */
  use: string;
  /** One worked case. Three parts separated by " || ": the object, the arithmetic, the call. */
  example: string;
  ideas: [Idea, Idea, Idea];
  /**
   * Optional read-tab sequence. When omitted, lessons keep the legacy order:
   * ideas 1–3, worked example, then move. Blocks reuse the canonical fields
   * above so presentation can vary without duplicating curriculum text.
   */
  readFlow?: LessonReadBlock[];
  bench: BenchId;
  prompt: string;
  note: string;
  clip?: Clip;
  checks: [Check, Check, Check, Check];
  /**
   * Correct answers required to pass this lesson's check. Defaults to
   * PASS_AT (3 of 4). The math runway sets 4: full marks on a
   * four-question check.
   */
  passAt?: number;
};

export type Track = {
  id: TrackId;
  index: string;
  title: string;
  course: string;
  lede: string;
};

export const PASS_AT = 3;

export function lessonKey(track: TrackId, id: string) {
  return `${track}/${id}`;
}

export function isPassed(score: number | undefined, passAt: number = PASS_AT) {
  return score !== undefined && score >= passAt;
}
