import type { WordDatabase } from './types';
import type { LanguageCode } from '../../types/settings';

// Lazy-loaded word databases
const databases: Partial<Record<LanguageCode, WordDatabase>> = {};

// Import functions for lazy loading
const loaders: Record<LanguageCode, () => Promise<{ default: WordDatabase }>> = {
  en: () => import('./en'),
  de: () => import('./de'),
  fr: () => import('./fr'),
  // Placeholder loaders for future languages - will fall back to English
  es: () => import('./en'),
  pt: () => import('./en'),
  it: () => import('./en'),
  nl: () => import('./en'),
  sv: () => import('./en'),
  pl: () => import('./en'),
  tr: () => import('./en'),
};

// Get a word database by language code (lazy loaded)
export async function getWordDatabase(language: LanguageCode): Promise<WordDatabase> {
  // Return cached if available
  if (databases[language]) {
    return databases[language]!;
  }

  // Load the database
  try {
    const module = await loaders[language]();
    databases[language] = module.default;
    return module.default;
  } catch (error) {
    console.warn(`Failed to load word database for ${language}, falling back to English`);
    // Fall back to English
    if (language !== 'en') {
      return getWordDatabase('en');
    }
    throw error;
  }
}

// Get multiple word databases (for mixing languages)
export async function getWordDatabases(languages: LanguageCode[]): Promise<WordDatabase[]> {
  return Promise.all(languages.map(getWordDatabase));
}

// Check if a language has a dedicated word database
export function hasNativeDatabase(language: LanguageCode): boolean {
  return ['en', 'de', 'fr'].includes(language);
}

// Get available languages with native databases
export function getAvailableLanguages(): LanguageCode[] {
  return ['en', 'de', 'fr'];
}

// Preload databases for faster access
export async function preloadDatabases(languages: LanguageCode[]): Promise<void> {
  await Promise.all(languages.map(getWordDatabase));
}

// Re-export types
export type { WordDatabase, WordEntry, RawWordEntry } from './types';
export { createWordEntry, createWordEntries, w } from './types';
