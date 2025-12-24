import { useTranslation } from 'react-i18next';
import type { LanguageCode } from '../types/settings';

interface LanguageSelectorProps {
  value: LanguageCode;
  onChange: (language: LanguageCode) => void;
  label?: string;
  showFlags?: boolean;
}

const LANGUAGE_FLAGS: Record<LanguageCode, string> = {
  en: '🇬🇧',
  de: '🇩🇪',
  fr: '🇫🇷',
  es: '🇪🇸',
  pt: '🇵🇹',
  it: '🇮🇹',
  nl: '🇳🇱',
  sv: '🇸🇪',
  pl: '🇵🇱',
  tr: '🇹🇷',
};

const AVAILABLE_LANGUAGES: LanguageCode[] = ['en', 'de', 'fr'];

export function LanguageSelector({
  value,
  onChange,
  label,
  showFlags = true,
}: LanguageSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="language-selector">
      {label && <label className="language-selector-label">{label}</label>}
      <select
        className="language-selector-select"
        value={value}
        onChange={(e) => onChange(e.target.value as LanguageCode)}
      >
        {AVAILABLE_LANGUAGES.map((lang) => (
          <option key={lang} value={lang}>
            {showFlags && LANGUAGE_FLAGS[lang]} {t(`languages.${lang}`)}
          </option>
        ))}
      </select>
    </div>
  );
}

export default LanguageSelector;
