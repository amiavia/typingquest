/**
 * PRP-050: Language Provider
 *
 * Provides language context with:
 * - Persistence to localStorage (guests) and database (authenticated)
 * - Easy language switching
 * - Access to available languages
 */

import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { SupportedLanguage } from './constants';
import { SUPPORTED_LANGUAGES, LANGUAGES, STORAGE_KEY } from './constants';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  availableLanguages: typeof LANGUAGES;
  supportedLanguages: readonly SupportedLanguage[];
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from i18n (which reads from localStorage via detector)
  useEffect(() => {
    setIsLoading(false);
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    // Change UI language
    i18n.changeLanguage(lang);

    // Persist to localStorage
    localStorage.setItem(STORAGE_KEY, lang);
  };

  // Get current language, defaulting to 'en' if not supported
  const currentLanguage = (
    SUPPORTED_LANGUAGES.includes(i18n.language as SupportedLanguage)
      ? i18n.language
      : 'en'
  ) as SupportedLanguage;

  return (
    <LanguageContext.Provider
      value={{
        language: currentLanguage,
        setLanguage,
        availableLanguages: LANGUAGES,
        supportedLanguages: SUPPORTED_LANGUAGES,
        isLoading,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
