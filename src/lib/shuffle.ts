/**
 * Deterministic option shuffling shared by the lesson quiz and the placement
 * diagnostic. The order is seeded, so it is stable across renders and
 * server/client, and changes when the seed changes (e.g. on retake).
 *
 * Callers keep grading on the canonical option index: the shuffled order maps
 * display position -> option index, and the authored `answer` index still
 * points at the correct option.
 */
export function hashSeed(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function shuffledOrder(count: number, seed: string): number[] {
  const order = Array.from({ length: count }, (_, i) => i);
  let state = hashSeed(seed) || 1;
  for (let i = count - 1; i > 0; i--) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    const j = state % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}
