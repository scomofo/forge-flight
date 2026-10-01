import type { Lesson, Track, TrackId } from "./types.ts";
import { ladderLessons, ladderTracks } from "./ladder.ts";
import { manufacturingLessons, manufacturingTrack } from "./manufacturing.ts";
import { mathLessons, mathTrack } from "./math.ts";
import { physicsW1Lessons } from "./physics-w1.ts";
import { physicsW2Lessons } from "./physics-w2.ts";
import { physicsW3Lessons } from "./physics-w3.ts";
import { physicsW4Lessons } from "./physics-w4.ts";
import { physicsW5Lessons } from "./physics-w5.ts";
import { physicsW6Lessons } from "./physics-w6.ts";
import { physicsW7Lessons } from "./physics-w7.ts";
import { physicsW8Lessons } from "./physics-w8.ts";
import { physicsW9Lessons } from "./physics-w9.ts";
import { physicsW10Lessons } from "./physics-w10.ts";
import { materialsW11Lessons } from "./materials-w11.ts";
import { materialsW12Lessons } from "./materials-w12.ts";
import { materialsW13Lessons } from "./materials-w13.ts";
import { materialsW14Lessons } from "./materials-w14.ts";
import { materialsW15Lessons } from "./materials-w15.ts";
import { materialsW16Lessons } from "./materials-w16.ts";
import { materialsW17Lessons } from "./materials-w17.ts";
import { materialsW18Lessons } from "./materials-w18.ts";
import { materialsW19Lessons } from "./materials-w19.ts";
import { materialsW20Lessons } from "./materials-w20.ts";
import { engineeringW21Lessons } from "./engineering-w21.ts";
import { engineeringW22Lessons } from "./engineering-w22.ts";
import { engineeringW23Lessons } from "./engineering-w23.ts";
import { engineeringW24Lessons } from "./engineering-w24.ts";
import { engineeringW25Lessons } from "./engineering-w25.ts";
import { engineeringW26Lessons } from "./engineering-w26.ts";
import { engineeringW27Lessons } from "./engineering-w27.ts";
import { engineeringW28Lessons } from "./engineering-w28.ts";
import { engineeringW29Lessons } from "./engineering-w29.ts";
import { engineeringW30Lessons } from "./engineering-w30.ts";

export const tracks: Track[] = [
  mathTrack,
  {
    id: "physics",
    index: "01",
    title: "Physics",
    course: "Physics 101",
    lede: "Core mechanics and physical reasoning: vectors, motion, force, energy, momentum, structures, fluids, waves, and heat."
  },
  {
    id: "materials",
    index: "02",
    title: "Materials",
    course: "Materials 101",
    lede: "How bonding, structure, processing, and environment control material properties and failure."
  },
  {
    id: "engineering",
    index: "03",
    title: "Engineering",
    course: "Engineering 101",
    lede: "Turn requirements and models into design decisions, verification evidence, margins, trade studies, and reviews."
  },
  manufacturingTrack,
  ...ladderTracks,
];

export const introTrackIds = ["math", "physics", "materials", "engineering"] as const satisfies readonly TrackId[];

export const lessons: Lesson[] = [
  ...mathLessons,
  ...physicsW1Lessons,
  ...physicsW2Lessons,
  ...physicsW3Lessons,
  ...physicsW4Lessons,
  ...physicsW5Lessons,
  ...physicsW6Lessons,
  ...physicsW7Lessons,
  ...physicsW8Lessons,
  ...physicsW9Lessons,
  ...physicsW10Lessons,
  ...materialsW11Lessons,
  ...materialsW12Lessons,
  ...materialsW13Lessons,
  ...materialsW14Lessons,
  ...materialsW15Lessons,
  ...materialsW16Lessons,
  ...materialsW17Lessons,
  ...materialsW18Lessons,
  ...materialsW19Lessons,
  ...materialsW20Lessons,
  ...engineeringW21Lessons,
  ...engineeringW22Lessons,
  ...engineeringW23Lessons,
  ...engineeringW24Lessons,
  ...engineeringW25Lessons,
  ...engineeringW26Lessons,
  ...engineeringW27Lessons,
  ...engineeringW28Lessons,
  ...engineeringW29Lessons,
  ...engineeringW30Lessons,
  ...manufacturingLessons,
  ...ladderLessons,
];

export type CourseTerm = { term: string; body: string };

export const courseIntro: { heading: string; approach: string[]; terms: CourseTerm[] } = {
  heading: "How this course works",
  approach: [
    "The course is built around concrete engineering situations: drawings, shop measurements, structures, gliders, joints, tests, and design decisions. The examples usually start with the physical picture and introduce the formula after the problem is clear. Each lesson includes a worked example, key ideas, an interactive bench, and four checks. Most lessons pass at three out of four; the Math Runway requires four out of four.",
    "The Math Runway comes first because later lessons assume you can convert units, rearrange formulas, work with powers, read graphs, and resolve simple vectors. You do not have to take every module. The diagnostic assigns only the topics that need review.",
    "Two habits run through the whole course. Keep units attached to quantities throughout the calculation, and do a rough estimate before trusting the exact arithmetic. Those two checks catch a surprising number of mistakes early.",
    "After the runway, the core sequence is Physics, Materials, Engineering, and Manufacturing. The 201, 301, and 401 tracks are shorter applied extensions for topics you want to take further."
  ],
  terms: [
    { term: "DRO", body: "Digital readout: the position display on the mill or lathe. It reads in inches or millimeters depending on how it’s set. The stock list prices by the inch, and the mill’s DRO reads in inches — while your drawing says millimeters." },
    { term: "Stock", body: "Raw material as the supplier sells it: bar, sheet, tube. The stock list prices it, usually by the inch or foot, usually imperial even when your drawing is metric." },
    { term: "Mill / lathe", body: "The machine tools. Most of this course’s examples live within arm’s reach of one." },
    { term: "Caliper / micrometer", body: "The measuring tools. They show up wherever measurement error matters." },
    { term: "Track", body: "One course: Math Runway, Physics 101, Materials 101, Engineering 101, Manufacturing, and the deeper 201/301/401 ladder tracks." },
    { term: "Lesson", body: "One sitting, with a minute estimate up top. The estimate is honest; the bench is where the time goes." },
    { term: "Bench", body: "The interactive workbench inside each lesson. Not a quiz — the place where you change a value and watch what happens." },
    { term: "Checks", body: "The four questions at the end of each lesson. Three out of four records a quiz pass; the Math Runway wants four. A quiz pass never locks or unlocks anything — every lesson stays open." },
    { term: "Quiz passed", body: "What the checks record. It says you answered the questions; it does not say the bench work is done." },
    { term: "Bench done", body: "You marked the bench work done on the Try tab. It records your own call that you worked through the task — nothing here checks your work, and it stays separate from the check score." },
    { term: "Capstone complete", body: "The one completion that is not a quiz score. The capstone design package passes its rubric gate — every section present, 70% total — and only then counts as complete." },
    { term: "Diagnostic", body: "The 24-question placement quiz for the Math Runway. It assigns modules. It doesn’t grade you." },
  ],
};

const coreOrder: TrackId[] = ["math", "physics", "materials", "engineering"];

export function isIntroTrack(track: string) {
  return (introTrackIds as readonly string[]).includes(track);
}

export function getTrack(id: string) {
  return tracks.find((t) => t.id === id);
}

export function lessonsFor(track: TrackId) {
  return lessons.filter((l) => l.track === track).sort((a, b) => a.index - b.index);
}

export function getLesson(track: string, id: string) {
  return lessons.find((l) => l.track === track && l.id === id);
}

export function lessonNeighbors(track: TrackId, id: string) {
  const ordered = isIntroTrack(track)
    ? coreOrder.flatMap((t) => lessonsFor(t))
    : lessonsFor(track);
  const i = ordered.findIndex((l) => l.track === track && l.id === id);
  return {
    prev: i > 0 ? ordered[i - 1] : undefined,
    next: i >= 0 && i < ordered.length - 1 ? ordered[i + 1] : undefined,
  };
}
