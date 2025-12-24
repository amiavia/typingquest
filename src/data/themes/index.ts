import type { ThemeId, LanguageCode } from '../../types/settings';
import type { Theme } from './types';
import type { WordEntry } from '../wordDatabases/types';
import { christmasTheme } from './christmas';
import { vibeCodingTheme } from './vibe-coding';
import { gamingTheme } from './gaming';

// Theme registry
const THEMES: Record<ThemeId, Theme> = {
  christmas: christmasTheme,
  'vibe-coding': vibeCodingTheme,
  gaming: gamingTheme,
  // Placeholder themes - will be implemented in Phase 7
  easter: createPlaceholderTheme('easter', '🐰', { startMonth: 3, endMonth: 4 }),
  halloween: createPlaceholderTheme('halloween', '🎃', { startMonth: 10, endMonth: 10 }),
  summer: createPlaceholderTheme('summer', '☀️', { startMonth: 6, endMonth: 8 }),
  science: createPlaceholderTheme('science', '🔬'),
  nature: createPlaceholderTheme('nature', '🌿'),
  food: createPlaceholderTheme('food', '🍕'),
  sports: createPlaceholderTheme('sports', '⚽'),
  music: createPlaceholderTheme('music', '🎵'),
  travel: createPlaceholderTheme('travel', '✈️'),
};

// Create a placeholder theme with minimal words
function createPlaceholderTheme(
  id: ThemeId,
  icon: string,
  seasonal?: { startMonth: number; endMonth: number }
): Theme {
  return {
    id,
    name: `themes.${id}.name`,
    description: `themes.${id}.description`,
    icon,
    seasonal,
    words: {
      en: [],
      de: [],
      fr: [],
    },
  };
}

// Get a theme by ID
export function getTheme(id: ThemeId): Theme {
  return THEMES[id];
}

// Get all themes
export function getAllThemes(): Theme[] {
  return Object.values(THEMES);
}

// Get available themes (with words)
export function getAvailableThemes(): Theme[] {
  return Object.values(THEMES).filter(
    theme => Object.values(theme.words).some(words => words.length > 0)
  );
}

// Get seasonal themes for current date
export function getSeasonalThemes(date: Date = new Date()): Theme[] {
  const month = date.getMonth() + 1; // 1-12
  return Object.values(THEMES).filter(theme => {
    if (!theme.seasonal) return false;
    const { startMonth, endMonth } = theme.seasonal;
    if (startMonth <= endMonth) {
      return month >= startMonth && month <= endMonth;
    }
    // Handle wrap-around (e.g., Nov-Dec to Jan)
    return month >= startMonth || month <= endMonth;
  });
}

// Get theme words for a language
export function getThemeWords(
  themeId: ThemeId,
  language: LanguageCode
): WordEntry[] {
  const theme = THEMES[themeId];
  if (!theme) return [];
  return theme.words[language] || theme.words['en'] || [];
}

// Get words from multiple themes
export function getThemesWords(
  themeIds: ThemeId[],
  language: LanguageCode
): WordEntry[] {
  const allWords: WordEntry[] = [];
  for (const id of themeIds) {
    allWords.push(...getThemeWords(id, language));
  }
  return allWords;
}

// Export types
export type { Theme, ThemeWordDatabase } from './types';
