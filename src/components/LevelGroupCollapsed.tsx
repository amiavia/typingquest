import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface LevelGroupCollapsedProps {
  type: 'premium' | 'themed';
  isPremium: boolean;
  onUpgrade: () => void;
  onExpand?: () => void;
  levelRange: string;
  totalLevels: number;
}

export function LevelGroupCollapsed({
  type,
  isPremium,
  onUpgrade,
  onExpand,
  levelRange,
  totalLevels,
}: LevelGroupCollapsedProps) {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);

  if (type === 'premium') {
    return (
      <div
        className="relative overflow-hidden transition-all duration-300"
        style={{
          background: 'var(--gradient-yellow-box)',
          border: '3px solid var(--accent-yellow)',
          boxShadow: isHovered ? '0 0 30px var(--glow-yellow)' : 'none',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header */}
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{
            background: 'var(--gradient-yellow-box)',
            borderBottom: '2px solid var(--accent-yellow)',
          }}
        >
          <div className="flex items-center gap-3">
            <span style={{ fontSize: '20px' }}>⭐</span>
            <span
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '10px',
                color: 'var(--accent-yellow)',
              }}
            >
              {t('levelGroup.premiumLevels', { range: levelRange })}
            </span>
          </div>
          {!isPremium && (
            <span
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '7px',
                color: 'var(--text-muted)',
              }}
            >
              🔒 {t('levelGroup.locked')}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {isPremium ? (
            // Expanded view for premium users
            <div className="text-center">
              <button
                onClick={onExpand}
                className="cursor-pointer transition-all hover:scale-105"
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '8px',
                  color: 'var(--accent-cyan)',
                  background: 'var(--gradient-cyan-box)',
                  border: '2px solid var(--accent-cyan)',
                  padding: '12px 24px',
                }}
              >
                ▼ {t('levelGroup.showAdvanced', { count: totalLevels })}
              </button>
            </div>
          ) : (
            // Locked marketing view
            <div className="space-y-4">
              <div className="text-center mb-6">
                <span style={{ fontSize: '32px' }}>🔒</span>
                <h3
                  style={{
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: '12px',
                    color: 'var(--accent-yellow)',
                    marginTop: '12px',
                  }}
                >
                  {t('levelGroup.unlockAdvanced', { count: totalLevels })}
                </h3>
              </div>

              <p
                className="text-center"
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '7px',
                  color: 'var(--text-primary)',
                  lineHeight: '1.8',
                  maxWidth: '400px',
                  margin: '0 auto',
                }}
              >
                {t('levelGroup.masterAdvanced')}
              </p>

              {/* Benefits grid */}
              <div className="grid grid-cols-2 gap-3 mt-6 max-w-md mx-auto">
                {[
                  { icon: '🎯', text: t('levelGroup.advancedFinger') },
                  { icon: '⚡', text: t('levelGroup.speedBuilding') },
                  { icon: '📝', text: t('levelGroup.realWorld') },
                  { icon: '🎮', text: t('levelGroup.accuracyChallenges') },
                ].map((benefit, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2"
                    style={{
                      background: 'var(--gradient-yellow-box)',
                      border: '1px solid var(--accent-yellow)',
                    }}
                  >
                    <span style={{ fontSize: '14px' }}>{benefit.icon}</span>
                    <span
                      style={{
                        fontFamily: "'Press Start 2P', monospace",
                        fontSize: '5px',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {benefit.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <div className="text-center mt-6">
                <button
                  onClick={onUpgrade}
                  className="cursor-pointer transition-all hover:scale-105 animate-pulse"
                  style={{
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: '9px',
                    color: 'var(--btn-secondary-text)',
                    background: 'var(--btn-secondary-bg)',
                    border: 'none',
                    padding: '14px 28px',
                    boxShadow: '0 4px 20px var(--glow-yellow)',
                  }}
                >
                  👑 {t('levelGroup.upgradeToPremium')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Themed levels section
  return (
    <div
      className="relative overflow-hidden transition-all duration-300"
      style={{
        background: 'var(--gradient-premium)',
        border: '3px solid var(--accent-purple)',
        boxShadow: isHovered ? '0 0 30px rgba(var(--accent-purple-rgb, 139, 92, 246), 0.3)' : 'none',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{
          background: 'rgba(var(--accent-purple-rgb, 139, 92, 246), 0.15)',
          borderBottom: '2px solid var(--accent-purple)',
        }}
      >
        <div className="flex items-center gap-3">
          <span style={{ fontSize: '20px' }}>⚡</span>
          <span
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '10px',
              color: 'var(--accent-purple)',
            }}
          >
            {t('levelGroup.themedLevels', { range: levelRange })}
          </span>
        </div>
        {!isPremium && (
          <span
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '7px',
              color: 'var(--text-muted)',
            }}
          >
            🔒 {t('levelGroup.locked')}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {isPremium ? (
          // Expanded view for premium users
          <div className="text-center">
            <button
              onClick={onExpand}
              className="cursor-pointer transition-all hover:scale-105"
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '8px',
                color: 'var(--accent-purple)',
                background: 'rgba(var(--accent-purple-rgb, 139, 92, 246), 0.1)',
                border: '2px solid var(--accent-purple)',
                padding: '12px 24px',
              }}
            >
              ▼ {t('levelGroup.showThemed', { count: totalLevels })}
            </button>
          </div>
        ) : (
          // Locked marketing view
          <div className="space-y-4">
            <div className="text-center mb-4">
              <span style={{ fontSize: '32px' }}>⚡</span>
              <h3
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '11px',
                  color: 'var(--accent-purple)',
                  marginTop: '12px',
                }}
              >
                {t('levelGroup.speedOfThought')}
              </h3>
            </div>

            <p
              className="text-center"
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '6px',
                color: 'var(--text-primary)',
                lineHeight: '2',
                maxWidth: '450px',
                margin: '0 auto',
              }}
            >
              {t('levelGroup.unlockSecrets')}
            </p>

            {/* Theme cards */}
            <div className="grid grid-cols-2 gap-4 mt-6 max-w-lg mx-auto">
              {[
                { emoji: '🤖', name: t('levelGroup.themeAI'), desc: t('levelGroup.themeAIDesc') },
                { emoji: '💻', name: t('levelGroup.themeDev'), desc: t('levelGroup.themeDevDesc') },
                { emoji: '📧', name: t('levelGroup.themeBusiness'), desc: t('levelGroup.themeBusinessDesc') },
                { emoji: '🔮', name: t('levelGroup.themeComingSoon'), desc: t('levelGroup.themeComingSoonDesc') },
              ].map((theme, i) => (
                <div
                  key={i}
                  className="p-3 text-center"
                  style={{
                    background: 'rgba(var(--accent-purple-rgb, 139, 92, 246), 0.05)',
                    border: '1px solid var(--accent-purple)',
                  }}
                >
                  <span style={{ fontSize: '24px' }}>{theme.emoji}</span>
                  <h4
                    style={{
                      fontFamily: "'Press Start 2P', monospace",
                      fontSize: '6px',
                      color: 'var(--accent-cyan)',
                      marginTop: '8px',
                    }}
                  >
                    {theme.name}
                  </h4>
                  <p
                    style={{
                      fontFamily: "'Press Start 2P', monospace",
                      fontSize: '4px',
                      color: 'var(--text-muted)',
                      marginTop: '4px',
                    }}
                  >
                    {theme.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Tagline */}
            <div
              className="text-center py-4 mt-4"
              style={{
                borderTop: '1px solid var(--accent-purple)',
                borderBottom: '1px solid var(--accent-purple)',
              }}
            >
              <p
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '7px',
                  color: 'var(--accent-yellow)',
                  fontStyle: 'italic',
                }}
              >
                "{t('levelGroup.tagline')}"
              </p>
              <p
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '5px',
                  color: 'var(--text-muted)',
                  marginTop: '8px',
                }}
              >
                {t('levelGroup.efficiency')}
              </p>
            </div>

            {/* CTA Button */}
            <div className="text-center mt-4">
              <button
                onClick={onUpgrade}
                className="cursor-pointer transition-all hover:scale-105"
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '8px',
                  color: 'var(--text-on-accent)',
                  background: 'var(--btn-premium-bg)',
                  border: 'none',
                  padding: '12px 24px',
                  boxShadow: '0 4px 20px rgba(var(--accent-purple-rgb, 139, 92, 246), 0.4)',
                }}
              >
                ⚡ {t('levelGroup.includedPremium')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
