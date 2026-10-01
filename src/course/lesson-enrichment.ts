import type { Lesson } from './types.ts';
import type { LessonEnrichment } from './enrichment-types.ts';
import { materialsEnrichment } from './materials-placement.ts';
import { physicsEnrichment } from './physics-enrichment.ts';
import { engineeringEnrichment } from './engineering-enrichment.ts';
import { manufacturingEnrichment } from './manufacturing-enrichment.ts';

export function getLessonEnrichment(lesson: Pick<Lesson, 'track' | 'id'>): LessonEnrichment | undefined {
  if (lesson.track === 'materials') return materialsEnrichment(lesson.id);
  if (lesson.track === 'physics') return physicsEnrichment[lesson.id];
  if (lesson.track === 'engineering') return engineeringEnrichment[lesson.id];
  return manufacturingEnrichment[`${lesson.track}/${lesson.id}`];
}
