import type { ThemeId } from '../../types/settings';
import type { WordEntry, RawWordEntry } from '../wordDatabases/types';
import { createWordEntry } from '../wordDatabases/types';

// Theme definition
export interface Theme {
  id: ThemeId;
  name: string;               // i18n key for display name
  description: string;        // i18n key for description
  icon: string;               // Emoji or icon
  seasonal?: {                // Auto-enable during season
    startMonth: number;       // 1-12
    endMonth: number;         // 1-12
  };
  premium?: boolean;          // Future: monetization
  words: ThemeWordDatabase;   // Words per language
}

// Words organized by language
export interface ThemeWordDatabase {
  [languageCode: string]: WordEntry[];
}

// Raw theme words before Set conversion
export interface RawThemeWordDatabase {
  [languageCode: string]: RawWordEntry[];
}

// Helper to create a theme from raw data
export function createTheme(
  id: ThemeId,
  config: {
    icon: string;
    seasonal?: { startMonth: number; endMonth: number };
    premium?: boolean;
  },
  rawWords: RawThemeWordDatabase
): Theme {
  const words: ThemeWordDatabase = {};

  for (const [lang, entries] of Object.entries(rawWords)) {
    words[lang] = entries.map(createWordEntry);
  }

  return {
    id,
    name: `themes.${id}.name`,
    description: `themes.${id}.description`,
    icon: config.icon,
    seasonal: config.seasonal,
    premium: config.premium,
    words,
  };
}

// Helper: simple word entry
export function tw(word: string, frequency: number = 5): RawWordEntry {
  return { word, frequency };
}
