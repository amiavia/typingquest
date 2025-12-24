// Mix words from multiple sources based on ratios

export interface WordSource {
  words: string[];
  ratio: number; // 0.0 - 1.0
}

// Mix words from multiple sources according to their ratios
export function mixWordSources(sources: WordSource[], totalCount: number = 100): string[] {
  // Normalize ratios
  const totalRatio = sources.reduce((sum, s) => sum + s.ratio, 0);
  if (totalRatio === 0) return [];

  const normalizedSources = sources.map(s => ({
    ...s,
    ratio: s.ratio / totalRatio,
  }));

  // Calculate how many words from each source
  const selectedWords: string[] = [];

  for (const source of normalizedSources) {
    if (source.words.length === 0) continue;

    const count = Math.ceil(totalCount * source.ratio);
    const shuffled = shuffleArray([...source.words]);
    const selected = shuffled.slice(0, Math.min(count, shuffled.length));
    selectedWords.push(...selected);
  }

  // Shuffle the final result
  return shuffleArray(selectedWords).slice(0, totalCount);
}

// Mix two word arrays with a simple ratio
export function mixTwoSources(
  primary: string[],
  secondary: string[],
  primaryRatio: number = 0.7
): string[] {
  return mixWordSources([
    { words: primary, ratio: primaryRatio },
    { words: secondary, ratio: 1 - primaryRatio },
  ]);
}

// Shuffle array using Fisher-Yates
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Pick N random items from an array
export function pickRandom<T>(array: T[], count: number): T[] {
  const shuffled = shuffleArray(array);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// Deduplicate words while preserving order
export function deduplicateWords(words: string[]): string[] {
  const seen = new Set<string>();
  return words.filter(word => {
    const lower = word.toLowerCase();
    if (seen.has(lower)) return false;
    seen.add(lower);
    return true;
  });
}
