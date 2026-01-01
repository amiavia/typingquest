/**
 * PRP-050: i18n Configuration
 *
 * Sets up react-i18next with language detection and persistence.
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import de from './locales/de.json';
import fr from './locales/fr.json';
import it from './locales/it.json';
import es from './locales/es.json';
import pt from './locales/pt.json';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, STORAGE_KEY } from './constants';

export const defaultNS = 'translation';
export const resources = {
  en: { translation: en },
  de: { translation: de },
  fr: { translation: fr },
  it: { translation: it },
  es: { translation: es },
  pt: { translation: pt },
} as const;

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass i18n instance to react-i18next
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGES,
    defaultNS,

    // Detection configuration
    detection: {
      order: ['localStorage', 'querystring', 'navigator'],
      lookupQuerystring: 'lang',
      lookupLocalStorage: STORAGE_KEY,
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;
export { SUPPORTED_LANGUAGES, LANGUAGES, type SupportedLanguage } from './constants';
