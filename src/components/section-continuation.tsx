import { Link } from '@tanstack/react-router';
import { nextManufacturingSection } from '@/course/section-navigation';
import { getTrack } from '@/course/catalog';
import type { TrackId } from '@/course/types';

export function SectionContinuation({ track }: { track: TrackId }) {
  const next = nextManufacturingSection(track);
  if (next === 'glider') return <Link to="/mission/$missionId" params={{ missionId: 'glider' }} className="inline-flex min-h-11 items-center text-ink">Next section: Balsa glider →</Link>;
  if (!next) return null;
  return <Link to="/learn/$trackId" params={{ trackId: next }} className="inline-flex min-h-11 items-center text-ink">Next section: {getTrack(next)?.course} →</Link>;
}
