/**
 * PRP-050: Language Switcher Component
 *
 * Premium minimalist dropdown to switch between available languages.
 * Shows flag emoji with clean, solid styling.
 */

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageProvider';
import type { SupportedLanguage } from '../i18n/constants';

interface LanguageSwitcherProps {
  /** Compact mode shows only flag */
  compact?: boolean;
}

export function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const { language, setLanguage, availableLanguages, supportedLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang = availableLanguages[language];

  // Show all supported languages
  const displayLanguages = supportedLanguages;

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 transition-all"
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '7px',
          padding: compact ? '8px 10px' : '10px 14px',
          background: '#1a1a2e',
          border: '2px solid #2d2d44',
          borderRadius: '4px',
          color: '#e0e0e0',
          cursor: 'pointer',
          minWidth: compact ? 'auto' : '100px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#242440';
          e.currentTarget.style.borderColor = '#3d3d5c';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#1a1a2e';
          e.currentTarget.style.borderColor = '#2d2d44';
        }}
        title={`Language: ${currentLang.name}`}
        aria-label={`Change language, currently ${currentLang.name}`}
      >
        <span style={{ fontSize: '16px', lineHeight: 1 }}>{currentLang.flag}</span>
        {!compact && (
          <>
            <span style={{ letterSpacing: '0.5px' }}>{language.toUpperCase()}</span>
            <span style={{ fontSize: '6px', opacity: 0.6, marginLeft: '2px' }}>
              {isOpen ? '▲' : '▼'}
            </span>
          </>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute top-full right-0 mt-2 z-50"
          style={{
            background: '#1a1a2e',
            border: '2px solid #2d2d44',
            borderRadius: '4px',
            minWidth: '160px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
            overflow: 'hidden',
          }}
        >
          {displayLanguages.map((lang, index) => {
            const langInfo = availableLanguages[lang as SupportedLanguage];
            const isActive = lang === language;
            const isLast = index === displayLanguages.length - 1;

            return (
              <button
                key={lang}
                onClick={() => {
                  setLanguage(lang as SupportedLanguage);
                  setIsOpen(false);
                }}
                className="w-full text-left flex items-center gap-3 transition-all"
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '7px',
                  padding: '12px 14px',
                  background: isActive ? '#00d4aa' : 'transparent',
                  color: isActive ? '#0a0a14' : '#e0e0e0',
                  border: 'none',
                  cursor: 'pointer',
                  borderBottom: isLast ? 'none' : '1px solid #2d2d44',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = '#242440';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <span style={{ fontSize: '14px', lineHeight: 1 }}>{langInfo.flag}</span>
                <span style={{ flex: 1, letterSpacing: '0.5px' }}>{langInfo.nativeName}</span>
                {isActive && (
                  <span style={{ fontSize: '8px', color: '#0a0a14' }}>●</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Compact icon-only version for tight spaces
 */
export function LanguageSwitcherIcon() {
  return <LanguageSwitcher compact />;
}
