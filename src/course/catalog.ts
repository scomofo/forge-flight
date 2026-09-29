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
    lede: "Start here. Vectors, motion, force, energy, momentum, and waves — the laws the later checks are built on.",
  },
  {
    id: "materials",
    index: "02",
    title: "Materials",
    course: "Materials 101",
    lede: "Next. Why a family bends, snaps, or sags, and how to compare materials against a job instead of a vibe.",
  },
  {
    id: "engineering",
    index: "03",
    title: "Engineering",
    course: "Engineering 101",
    lede: "Then the decisions. Requirements, balance, stress, sag, tradeoffs, and failure. The shelf at the end uses these.",
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
    "This course has one student. It assumes your shop: drawings in millimeters, a stock list priced by the inch, a mill whose DRO reads in inches. Every lesson starts from something you can picture — a bracket called out on a drawing, that DRO, a glider on a windy day — and the formula comes after the picture, never before. Each lesson follows the same shape: the picture and what it means, when the idea applies and when to stop, one worked case with the arithmetic shown, three key ideas, then a bench where you try it yourself, and four checks. Three out of four passes, except on the Math Runway, where it’s four out of four.",
    "The Math Runway comes first, because everything later assumes you can convert units, rearrange a formula, and read a graph. You don’t have to take all of it. The diagnostic is 24 questions, open-resource, about 45 minutes, and it assigns only the modules you need — test out of the rest. It never hands you a pass/fail label.",
    "Two habits run through the whole course. First, units are part of the number: every quantity carries its unit from the first line to the last, and the benches speak SI — meters, kilograms, seconds, newtons. Second, estimate before you compute: round to one digit, do it in your head, and let the rough answer catch the wrong ones before they cost you.",
    "After the runway: Physics, then Materials, then Engineering, then Manufacturing. Each one assumes the ones before it. The 201, 301, and 401 tracks go deeper wherever you want more.",
  ],
  terms: [
    { term: "DRO", body: "Digital readout: the position display on the mill or lathe. It reads in inches or millimeters depending on how it’s set. The stock list prices by the inch, and the mill’s DRO reads in inches — while your drawing says millimeters." },
    { term: "Stock", body: "Raw material as the supplier sells it: bar, sheet, tube. The stock list prices it, usually by the inch or foot, usually imperial even when your drawing is metric." },
    { term: "Mill / lathe", body: "The machine tools. Most of this course’s examples live within arm’s reach of one." },
    { term: "Caliper / micrometer", body: "The measuring tools. They show up wherever measurement error matters." },
    { term: "Track", body: "One course: Math Runway, Physics 101, Materials 101, Engineering 101, Manufacturing, and the deeper 201/301/401 ladder tracks." },
    { term: "Lesson", body: "One sitting, with a minute estimate up top. The estimate is honest; the bench is where the time goes." },
    { term: "Bench", body: "The interactive workbench inside each lesson. Not a quiz — the place where you change a value and watch what happens." },
    { term: "Checks", body: "The four questions at the end of each lesson. Three out of four moves you on; the Math Runway wants four." },
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
