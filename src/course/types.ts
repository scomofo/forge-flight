export type TrackId =
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
  | "strain"
  | "design"
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
  | "vectors"
  | "kinematics"
  | "newton"
  | "energy"
  | "collision"
  | "wave"
  | "mechanism"
  | "chip"
  | "springback"
  | "freeze"
  | "haz"
  | "spread"
  | "stack"
  | LadderBenchId;

export type Idea = {
  heading: string;
  body: string;
  formula?: string;
};

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
  /** Taught from a familiar picture. Three parts separated by " || ": the picture, the word, why the rule has that shape. */
  start: string;
  /** When you are here, what you do, and when you stop. Three parts separated by " || ". */
  use: string;
  /** One worked case. Three parts separated by " || ": the object, the arithmetic, the call. */
  example: string;
  ideas: [Idea, Idea, Idea];
  bench: BenchId;
  prompt: string;
  note: string;
  clip?: Clip;
  checks: [Check, Check, Check, Check];
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

export function isPassed(score: number | undefined) {
  return score !== undefined && score >= PASS_AT;
}
