import type { TrackId } from './types.ts';

export const manufacturingSequence = ['manufacturing', 'manufacturing-201', 'manufacturing-301', 'manufacturing-401'] as const;
export function nextManufacturingSection(track: TrackId): TrackId | 'glider' | undefined {
  const index = manufacturingSequence.findIndex(id => id === track);
  if (index < 0) return undefined;
  return manufacturingSequence[index + 1] ?? 'glider';
}
