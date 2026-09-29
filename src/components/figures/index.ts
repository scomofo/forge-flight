import type { FigureMap } from "./kit";
import { mathFigures } from "./math";
import { manufacturingFigures } from "./manufacturing";
import { physicsAFigures } from "./physics-a";
import { physicsBFigures } from "./physics-b";
import { materialsAFigures } from "./materials-a";
import { materialsBFigures } from "./materials-b";
import { engineeringAFigures } from "./engineering-a";
import { engineeringBFigures } from "./engineering-b";
import { ladderAFigures } from "./ladder-a";
import { ladderBFigures } from "./ladder-b";
import { ladderCFigures } from "./ladder-c";

/** Lesson figures keyed by lessonKey(track, id), i.e. "track/id". */
export const lessonFigures: FigureMap = {
  ...mathFigures,
  ...manufacturingFigures,
  ...physicsAFigures,
  ...physicsBFigures,
  ...materialsAFigures,
  ...materialsBFigures,
  ...engineeringAFigures,
  ...engineeringBFigures,
  ...ladderAFigures,
  ...ladderBFigures,
  ...ladderCFigures,
};
