export function createSeededRandom(seed: number): () => number {
  let currentSeed = seed;

  return () => {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return currentSeed / 233280;
  };
}

export function pickOne<T>(items: readonly T[], rng: () => number): T {
  if (items.length === 0) {
    throw new Error("pickOne: items must not be empty");
  }

  const index = Math.floor(rng() * items.length);
  return items[index];
}

export function shuffleWithSeed<T>(array: readonly T[], seed: number): T[] {
  const shuffled = [...array];
  const rng = createSeededRandom(seed);

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}
