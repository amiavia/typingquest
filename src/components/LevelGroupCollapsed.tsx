import { useState } from 'react';

interface LevelGroupCollapsedProps {
  type: 'premium' | 'themed';
  isUnlocked: boolean;
  isPremium: boolean;
  onUpgrade: () => void;
  onExpand?: () => void;
  levelRange: string;
  totalLevels: number;
}

export function LevelGroupCollapsed({
  type,
  isUnlocked,
  isPremium,
  onUpgrade,
  onExpand,
  levelRange,
  totalLevels,
}: LevelGroupCollapsedProps) {
  const [isHovered, setIsHovered] = useState(false);

  if (type === 'premium') {
    return (
      <div
        className="relative overflow-hidden transition-all duration-300"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 217, 61, 0.05) 0%, rgba(255, 217, 61, 0.02) 100%)',
          border: '3px solid #ffd93d',
          boxShadow: isHovered ? '0 0 30px rgba(255, 217, 61, 0.3)' : '0 0 15px rgba(255, 217, 61, 0.1)',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header */}
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{
            background: 'rgba(255, 217, 61, 0.1)',
            borderBottom: '2px solid rgba(255, 217, 61, 0.3)',
          }}
        >
          <div className="flex items-center gap-3">
            <span style={{ fontSize: '20px' }}>⭐</span>
            <span
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '10px',
                color: '#ffd93d',
                textShadow: '0 0 10px rgba(255, 217, 61, 0.5)',
              }}
            >
              PREMIUM LEVELS {levelRange}
            </span>
          </div>
          {!isPremium && (
            <span
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '7px',
                color: '#4a4a6e',
              }}
            >
              🔒 LOCKED
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
                  color: '#3bceac',
                  background: 'rgba(59, 206, 172, 0.1)',
                  border: '2px solid #3bceac',
                  padding: '12px 24px',
                }}
              >
                ▼ SHOW {totalLevels} ADVANCED LEVELS
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
                    color: '#ffd93d',
                    marginTop: '12px',
                    textShadow: '0 0 15px rgba(255, 217, 61, 0.3)',
                  }}
                >
                  UNLOCK {totalLevels} ADVANCED LEVELS
                </h3>
              </div>

              <p
                className="text-center"
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '7px',
                  color: '#eef5db',
                  lineHeight: '1.8',
                  maxWidth: '400px',
                  margin: '0 auto',
                }}
              >
                Master advanced typing patterns and build your speed to 80+ WPM
              </p>

              {/* Benefits grid */}
              <div className="grid grid-cols-2 gap-3 mt-6 max-w-md mx-auto">
                {[
                  { icon: '🎯', text: 'Advanced finger training' },
                  { icon: '⚡', text: 'Speed building exercises' },
                  { icon: '📝', text: 'Real-world text practice' },
                  { icon: '🎮', text: 'Accuracy challenges' },
                ].map((benefit, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2"
                    style={{
                      background: 'rgba(255, 217, 61, 0.05)',
                      border: '1px solid rgba(255, 217, 61, 0.2)',
                    }}
                  >
                    <span style={{ fontSize: '14px' }}>{benefit.icon}</span>
                    <span
                      style={{
                        fontFamily: "'Press Start 2P', monospace",
                        fontSize: '5px',
                        color: '#eef5db',
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
                    color: '#1a1a2e',
                    background: 'linear-gradient(135deg, #ffd93d 0%, #ffb800 100%)',
                    border: 'none',
                    padding: '14px 28px',
                    boxShadow: '0 4px 20px rgba(255, 217, 61, 0.4)',
                  }}
                >
                  👑 UPGRADE TO PREMIUM
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
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(59, 206, 172, 0.05) 100%)',
        border: '3px solid #8b5cf6',
        boxShadow: isHovered ? '0 0 30px rgba(139, 92, 246, 0.3)' : '0 0 15px rgba(139, 92, 246, 0.1)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{
          background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.15) 0%, rgba(59, 206, 172, 0.15) 100%)',
          borderBottom: '2px solid rgba(139, 92, 246, 0.3)',
        }}
      >
        <div className="flex items-center gap-3">
          <span style={{ fontSize: '20px' }}>⚡</span>
          <span
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '10px',
              color: '#8b5cf6',
              textShadow: '0 0 10px rgba(139, 92, 246, 0.5)',
            }}
          >
            THEMED LEVELS {levelRange}
          </span>
        </div>
        {!isPremium && (
          <span
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '7px',
              color: '#4a4a6e',
            }}
          >
            🔒 LOCKED
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
                color: '#8b5cf6',
                background: 'rgba(139, 92, 246, 0.1)',
                border: '2px solid #8b5cf6',
                padding: '12px 24px',
              }}
            >
              ▼ SHOW {totalLevels} THEMED LEVELS
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
                  color: '#8b5cf6',
                  marginTop: '12px',
                  textShadow: '0 0 15px rgba(139, 92, 246, 0.3)',
                }}
              >
                TYPE AT THE SPEED OF THOUGHT
              </h3>
            </div>

            <p
              className="text-center"
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '6px',
                color: '#eef5db',
                lineHeight: '2',
                maxWidth: '450px',
                margin: '0 auto',
              }}
            >
              Unlock the secrets of outstanding prompting while building lightning-fast typing skills.
              Learn expert techniques through muscle memory.
            </p>

            {/* Theme cards */}
            <div className="grid grid-cols-2 gap-4 mt-6 max-w-lg mx-auto">
              {[
                { emoji: '🤖', name: 'AI PROMPTS', desc: 'Master ChatGPT & Claude techniques' },
                { emoji: '💻', name: 'DEVELOPER', desc: 'Code patterns, terminal fluency' },
                { emoji: '📧', name: 'BUSINESS', desc: 'Professional communication' },
                { emoji: '🔮', name: 'COMING SOON', desc: 'Legal, Medical, Academic' },
              ].map((theme, i) => (
                <div
                  key={i}
                  className="p-3 text-center"
                  style={{
                    background: 'rgba(139, 92, 246, 0.05)',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                  }}
                >
                  <span style={{ fontSize: '24px' }}>{theme.emoji}</span>
                  <h4
                    style={{
                      fontFamily: "'Press Start 2P', monospace",
                      fontSize: '6px',
                      color: '#3bceac',
                      marginTop: '8px',
                    }}
                  >
                    {theme.name}
                  </h4>
                  <p
                    style={{
                      fontFamily: "'Press Start 2P', monospace",
                      fontSize: '4px',
                      color: '#4a4a6e',
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
                borderTop: '1px solid rgba(139, 92, 246, 0.2)',
                borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
              }}
            >
              <p
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '7px',
                  color: '#ffd93d',
                  fontStyle: 'italic',
                }}
              >
                "Type it. Learn it. Never forget it."
              </p>
              <p
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '5px',
                  color: '#4a4a6e',
                  marginTop: '8px',
                }}
              >
                Ultimate efficiency: Faster typing + Better prompts
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
                  color: '#1a1a2e',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #3bceac 100%)',
                  border: 'none',
                  padding: '12px 24px',
                  boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
                }}
              >
                ⚡ INCLUDED WITH PREMIUM
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
