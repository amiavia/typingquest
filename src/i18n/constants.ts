/**
 * PRP-050: Internationalization Constants
 *
 * Defines supported languages and their metadata.
 */

export type SupportedLanguage = 'en' | 'de' | 'fr' | 'it' | 'es' | 'pt';

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['en', 'de', 'fr', 'it', 'es', 'pt'];

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

export const LANGUAGES: Record<SupportedLanguage, {
  name: string;
  nativeName: string;
  flag: string;
}> = {
  en: { name: 'English', nativeName: 'English', flag: '🇬🇧' },
  de: { name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  fr: { name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  it: { name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  es: { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  pt: { name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
};

export const STORAGE_KEY = 'typebit8-language';
