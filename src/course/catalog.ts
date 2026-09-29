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
