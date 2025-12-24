import type { LanguageCode } from '../../types/settings';

// A single word entry with metadata
export interface WordEntry {
  word: string;
  letters: Set<string>;  // Unique letters in the word (precomputed for filtering)
  frequency: number;     // 1-10, higher = more common
  category?: 'common' | 'technical' | 'native-specific';
}

// A word database for a specific language
export interface WordDatabase {
  language: LanguageCode;
  words: WordEntry[];
}

// Raw word data (before Set conversion)
export interface RawWordEntry {
  word: string;
  frequency: number;
  category?: 'common' | 'technical' | 'native-specific';
}

// Helper to create a WordEntry from raw data
export function createWordEntry(raw: RawWordEntry): WordEntry {
  return {
    word: raw.word,
    letters: new Set(raw.word.toLowerCase().split('')),
    frequency: raw.frequency,
    category: raw.category,
  };
}

// Helper to create multiple WordEntries
export function createWordEntries(rawWords: RawWordEntry[]): WordEntry[] {
  return rawWords.map(createWordEntry);
}

// Simple helper: create word entry from just word and frequency
export function w(word: string, frequency: number = 5): RawWordEntry {
  return { word, frequency };
}
