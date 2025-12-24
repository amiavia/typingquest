// Language codes supported by the application
export type LanguageCode =
  | 'en'  // English
  | 'de'  // German
  | 'fr'  // French
  | 'es'  // Spanish
  | 'pt'  // Portuguese
  | 'it'  // Italian
  | 'nl'  // Dutch
  | 'sv'  // Swedish
  | 'pl'  // Polish
  | 'tr'; // Turkish

// Layout families group keyboards with similar key arrangements
export type LayoutFamily =
  | 'qwerty'   // Standard QWERTY (US, UK, etc.)
  | 'qwertz'   // German/Swiss (Z and Y swapped)
  | 'azerty'   // French/Belgian (A/Q and Z/W swapped)
  | 'dvorak'   // Dvorak layout
  | 'colemak'; // Colemak layout

// Theme identifiers for word packs
export type ThemeId =
  | 'christmas'
  | 'easter'
  | 'halloween'
  | 'summer'
  | 'vibe-coding'
  | 'gaming'
  | 'science'
  | 'nature'
  | 'food'
  | 'sports'
  | 'music'
  | 'travel';

// User settings stored in localStorage
export interface UserSettings {
  // Keyboard layout (existing)
  keyboardLayout: string;

  // UI language
  language: LanguageCode;

  // Override for practice words (if different from UI language)
  wordLanguage?: LanguageCode;

  // Include English words when using non-English language
  mixEnglishWords: boolean;

  // Ratio of English words to include (0.0 - 1.0)
  englishMixRatio: number;

  // Active thematic word packs
  activeThemes: ThemeId[];

  // Ratio of theme words to include (0.0 - 1.0)
  themeMixRatio: number;
}

// Default settings
export const DEFAULT_SETTINGS: UserSettings = {
  keyboardLayout: 'qwerty-us',
  language: 'en',
  mixEnglishWords: true,
  englishMixRatio: 0.3,
  activeThemes: [],
  themeMixRatio: 0.2,
};

// Language display info
export const LANGUAGE_INFO: Record<LanguageCode, { name: string; nativeName: string; flag: string }> = {
  en: { name: 'English', nativeName: 'English', flag: '🇬🇧' },
  de: { name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  fr: { name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  es: { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  pt: { name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  it: { name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  nl: { name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  sv: { name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
  pl: { name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  tr: { name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
};
