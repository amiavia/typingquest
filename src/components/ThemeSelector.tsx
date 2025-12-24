import { useTranslation } from 'react-i18next';
import type { ThemeId } from '../types/settings';
import { getAvailableThemes, getSeasonalThemes } from '../data/themes';

interface ThemeSelectorProps {
  activeThemes: ThemeId[];
  onToggleTheme: (themeId: ThemeId) => void;
  themeMixRatio: number;
  onThemeMixRatioChange: (ratio: number) => void;
}

export function ThemeSelector({
  activeThemes,
  onToggleTheme,
  themeMixRatio,
  onThemeMixRatioChange,
}: ThemeSelectorProps) {
  const { t } = useTranslation();
  const availableThemes = getAvailableThemes();
  const seasonalThemes = getSeasonalThemes();
  const seasonalIds = new Set(seasonalThemes.map(t => t.id));

  return (
    <div className="theme-selector">
      <h3 className="theme-selector-title">{t('settings.themes')}</h3>

      {/* Seasonal themes */}
      {seasonalThemes.length > 0 && (
        <div className="theme-section">
          <h4 className="theme-section-title">Seasonal</h4>
          <div className="theme-grid">
            {seasonalThemes.map(theme => (
              <ThemeCard
                key={theme.id}
                id={theme.id}
                icon={theme.icon}
                name={t(theme.name)}
                description={t(theme.description)}
                isActive={activeThemes.includes(theme.id)}
                isSeasonal={true}
                onToggle={() => onToggleTheme(theme.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Other themes */}
      <div className="theme-section">
        <h4 className="theme-section-title">Topical</h4>
        <div className="theme-grid">
          {availableThemes
            .filter(t => !seasonalIds.has(t.id))
            .map(theme => (
              <ThemeCard
                key={theme.id}
                id={theme.id}
                icon={theme.icon}
                name={t(theme.name)}
                description={t(theme.description)}
                isActive={activeThemes.includes(theme.id)}
                isSeasonal={false}
                onToggle={() => onToggleTheme(theme.id)}
              />
            ))}
        </div>
      </div>

      {/* Mix ratio slider */}
      {activeThemes.length > 0 && (
        <div className="theme-mix-slider">
          <label htmlFor="theme-mix">{t('settings.themeMixRatio')}: {Math.round(themeMixRatio * 100)}%</label>
          <input
            id="theme-mix"
            type="range"
            min="0"
            max="50"
            value={themeMixRatio * 100}
            onChange={(e) => onThemeMixRatioChange(Number(e.target.value) / 100)}
          />
        </div>
      )}
    </div>
  );
}

interface ThemeCardProps {
  id: ThemeId;
  icon: string;
  name: string;
  description: string;
  isActive: boolean;
  isSeasonal: boolean;
  onToggle: () => void;
}

function ThemeCard({
  icon,
  name,
  description,
  isActive,
  isSeasonal,
  onToggle,
}: ThemeCardProps) {
  return (
    <button
      className={`theme-card ${isActive ? 'active' : ''} ${isSeasonal ? 'seasonal' : ''}`}
      onClick={onToggle}
      title={description}
    >
      <span className="theme-icon">{icon}</span>
      <span className="theme-name">{name}</span>
      <span className="theme-status">{isActive ? 'ON' : 'OFF'}</span>
    </button>
  );
}

export default ThemeSelector;
