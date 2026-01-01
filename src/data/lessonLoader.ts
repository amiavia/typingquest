/**
 * PRP-050: Localized Lesson Loader
 *
 * Loads lesson content based on the user's selected language.
 * Uses a hybrid approach:
 * - Beginner levels (1-6): Native language content for learning fundamentals
 * - Advanced levels (7+): English content with translated UI, or native if available
 */

import { levels as levelsEN } from './levels';
import { levelsDE } from './levels-de';
import { levelsFR } from './levels-fr';
import { levelsIT } from './levels-it';
import { levelsES } from './levels-es';
import { levelsPT } from './levels-pt';
import type { Lesson } from '../types';
import type { SupportedLanguage } from '../i18n/constants';

// Map of available lesson content by language
const lessonsByLanguage: Partial<Record<SupportedLanguage, Lesson[]>> = {
  en: levelsEN,
  de: levelsDE,
  fr: levelsFR,
  it: levelsIT,
  es: levelsES,
  pt: levelsPT,
};

/**
 * Get lessons for the specified language.
 * Falls back to English if no translations available.
 */
export function getLessonsForLanguage(language: SupportedLanguage): Lesson[] {
  // For themed/advanced levels (31+), check if native content exists
  const nativeLessons = lessonsByLanguage[language];

  if (nativeLessons && nativeLessons.length > 0) {
    return nativeLessons;
  }

  // Fallback to English
  return levelsEN;
}

/**
 * Get a specific lesson by ID for the given language.
 * Returns English lesson if not found in the target language.
 */
export function getLessonById(id: number, language: SupportedLanguage): Lesson | undefined {
  const lessons = getLessonsForLanguage(language);
  const lesson = lessons.find(l => l.id === id);

  // Fallback to English if lesson not found
  if (!lesson) {
    return levelsEN.find(l => l.id === id);
  }

  return lesson;
}

/**
 * Check if a lesson has native content for the given language.
 */
export function hasNativeContent(id: number, language: SupportedLanguage): boolean {
  const nativeLessons = lessonsByLanguage[language];
  if (!nativeLessons) return false;
  return nativeLessons.some(l => l.id === id);
}

/**
 * Get available languages that have lesson content.
 */
export function getLanguagesWithContent(): SupportedLanguage[] {
  return Object.keys(lessonsByLanguage) as SupportedLanguage[];
}
