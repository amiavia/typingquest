import type { WordEntry, WordDatabase } from '../data/wordDatabases/types';

export interface FilterOptions {
  minLength?: number;
  maxLength?: number;
  mustInclude?: string[];  // Must use at least one of these keys
  limit?: number;
  shuffled?: boolean;      // Randomize order before limiting
}

// Compute the set of unique letters in a word
export function computeLetterSet(word: string): Set<string> {
  return new Set(word.toLowerCase().split(''));
}

// Check if all letters in a word are available
export function wordUsesOnlyAvailableKeys(
  wordLetters: Set<string>,
  availableKeys: Set<string>
): boolean {
  for (const letter of wordLetters) {
    if (!availableKeys.has(letter.toLowerCase())) {
      return false;
    }
  }
  return true;
}

// Check if a word uses at least one of the required keys
export function wordIncludesRequiredKey(
  wordLetters: Set<string>,
  requiredKeys: string[]
): boolean {
  return requiredKeys.some(key => wordLetters.has(key.toLowerCase()));
}

// Get valid words from a database filtered by available keys
export function getValidWords(
  database: WordDatabase | { words: WordEntry[] },
  availableKeys: Set<string>,
  options: FilterOptions = {}
): string[] {
  const {
    minLength = 1,
    maxLength = Infinity,
    mustInclude,
    limit,
    shuffled = false,
  } = options;

  // Filter words
  let filtered = database.words.filter(entry => {
    // Check length constraints
    if (entry.word.length < minLength || entry.word.length > maxLength) {
      return false;
    }

    // Check all letters are available
    if (!wordUsesOnlyAvailableKeys(entry.letters, availableKeys)) {
      return false;
    }

    // Check must include constraint
    if (mustInclude && mustInclude.length > 0) {
      if (!wordIncludesRequiredKey(entry.letters, mustInclude)) {
        return false;
      }
    }

    return true;
  });

  // Sort by frequency (highest first)
  filtered.sort((a, b) => b.frequency - a.frequency);

  // Optionally shuffle
  if (shuffled) {
    filtered = shuffleArray(filtered);
  }

  // Apply limit
  if (limit && limit > 0) {
    filtered = filtered.slice(0, limit);
  }

  return filtered.map(entry => entry.word);
}

// Get words that prioritize newly learned keys
export function getWordsForNewKeys(
  database: WordDatabase | { words: WordEntry[] },
  allAvailableKeys: Set<string>,
  newKeys: string[],
  options: FilterOptions = {}
): string[] {
  // First, get words that use the new keys
  const wordsWithNewKeys = getValidWords(database, allAvailableKeys, {
    ...options,
    mustInclude: newKeys,
    limit: options.limit ? Math.ceil(options.limit * 0.7) : undefined,
  });

  // Then, get reinforcement words (using only old keys)
  const remainingLimit = options.limit
    ? Math.max(0, options.limit - wordsWithNewKeys.length)
    : undefined;

  const reinforcementWords = remainingLimit
    ? getValidWords(database, allAvailableKeys, {
        ...options,
        mustInclude: undefined,
        limit: remainingLimit,
      }).filter(w => !wordsWithNewKeys.includes(w))
    : [];

  return [...wordsWithNewKeys, ...reinforcementWords];
}

// Shuffle array using Fisher-Yates algorithm
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Validate that a word only uses available keys (for runtime checking)
export function validateWord(word: string, availableKeys: Set<string>): boolean {
  const letters = computeLetterSet(word);
  return wordUsesOnlyAvailableKeys(letters, availableKeys);
}

// Validate an entire word list
export function validateWordList(words: string[], availableKeys: Set<string>): {
  valid: string[];
  invalid: string[];
} {
  const valid: string[] = [];
  const invalid: string[] = [];

  for (const word of words) {
    if (validateWord(word, availableKeys)) {
      valid.push(word);
    } else {
      invalid.push(word);
    }
  }

  return { valid, invalid };
}
