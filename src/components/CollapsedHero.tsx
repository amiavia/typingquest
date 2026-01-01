import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useKeyboardLayout } from '../providers/KeyboardLayoutProvider';
import { KEYBOARD_LAYOUTS, type KeyboardLayoutType } from '../data/keyboardLayouts';

interface CollapsedHeroProps {
  initialWpm?: number;
  onRetakeTest: () => void;
  onStartPracticing: () => void;
}

export function CollapsedHero({ initialWpm, onRetakeTest, onStartPracticing }: CollapsedHeroProps) {
  const { t } = useTranslation();
  const { layout, lockLayout } = useKeyboardLayout();
  const [showLayoutPicker, setShowLayoutPicker] = useState(false);

  const layoutConfig = KEYBOARD_LAYOUTS[layout];

  return (
    <section
      style={{
        background: 'var(--gradient-feature)',
        border: '3px solid var(--border-color)',
        borderRadius: '16px',
        padding: '24px 32px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative pixel corners */}
      <div style={{ position: 'absolute', top: '8px', left: '8px', width: '12px', height: '12px', borderTop: '3px solid var(--accent-yellow)', borderLeft: '3px solid var(--accent-yellow)' }} />
      <div style={{ position: 'absolute', top: '8px', right: '8px', width: '12px', height: '12px', borderTop: '3px solid var(--accent-yellow)', borderRight: '3px solid var(--accent-yellow)' }} />
      <div style={{ position: 'absolute', bottom: '8px', left: '8px', width: '12px', height: '12px', borderBottom: '3px solid var(--accent-yellow)', borderLeft: '3px solid var(--accent-yellow)' }} />
      <div style={{ position: 'absolute', bottom: '8px', right: '8px', width: '12px', height: '12px', borderBottom: '3px solid var(--accent-yellow)', borderRight: '3px solid var(--accent-yellow)' }} />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '32px',
          flexWrap: 'wrap',
        }}
      >
        {/* Keyboard info */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span
            style={{
              fontSize: '24px',
              filter: 'drop-shadow(0 0 8px var(--glow-cyan))',
            }}
          >
            ⌨️
          </span>
          <div style={{ textAlign: 'left' }}>
            <div
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '10px',
                color: 'var(--text-muted)',
                marginBottom: '4px',
              }}
            >
              {t('keyboard.title')}
            </div>
            <div
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '12px',
                color: 'var(--accent-cyan)',
              }}
            >
              {layoutConfig?.name || layout.toUpperCase().replace('-', ' ')}
            </div>
          </div>
          <button
            onClick={() => setShowLayoutPicker(!showLayoutPicker)}
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '7px',
              padding: '6px 10px',
              background: 'transparent',
              border: '2px solid var(--text-muted)',
              borderRadius: '4px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-cyan)';
              e.currentTarget.style.color = 'var(--accent-cyan)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--text-muted)';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            {t('keyboard.change')}
          </button>
        </div>

        {/* Divider */}
        <div
          style={{
            width: '2px',
            height: '40px',
            background: 'linear-gradient(to bottom, transparent, var(--accent-cyan), transparent)',
          }}
        />

        {/* Baseline WPM */}
        {initialWpm !== undefined && (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <span
                style={{
                  fontSize: '24px',
                  filter: 'drop-shadow(0 0 8px var(--glow-yellow))',
                }}
              >
                ⚡
              </span>
              <div style={{ textAlign: 'left' }}>
                <div
                  style={{
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                    marginBottom: '4px',
                  }}
                >
                  {t('keyboard.startingSpeed')}
                </div>
                <div
                  style={{
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: '12px',
                    color: 'var(--accent-yellow)',
                  }}
                >
                  {initialWpm} WPM
                </div>
              </div>
              <button
                onClick={onRetakeTest}
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '7px',
                  padding: '6px 10px',
                  background: 'transparent',
                  border: '2px solid var(--text-muted)',
                  borderRadius: '4px',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-yellow)';
                  e.currentTarget.style.color = 'var(--accent-yellow)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--text-muted)';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }}
              >
                {t('keyboard.retake')}
              </button>
            </div>

            {/* Divider */}
            <div
              style={{
                width: '2px',
                height: '40px',
                background: 'linear-gradient(to bottom, transparent, var(--accent-cyan), transparent)',
              }}
            />
          </>
        )}

        {/* Start Practicing Button */}
        <button
          onClick={onStartPracticing}
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '12px',
            padding: '16px 32px',
            background: 'var(--btn-primary-bg)',
            border: 'none',
            borderRadius: '8px',
            color: 'var(--btn-primary-text)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 4px 15px var(--glow-cyan)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {t('buttons.startPracticing')}
        </button>
      </div>

      {/* Layout Picker */}
      {showLayoutPicker && (
        <div
          style={{
            marginTop: '20px',
            padding: '16px',
            background: 'var(--card-bg)',
            borderRadius: '8px',
            border: '2px solid var(--border-color)',
          }}
        >
          <p
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '8px',
              color: 'var(--accent-yellow)',
              marginBottom: '12px',
            }}
          >
            {t('keyboard.selectLayout')}
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              justifyContent: 'center',
            }}
          >
            {Object.values(KEYBOARD_LAYOUTS).map((layoutConfig) => (
              <button
                key={layoutConfig.id}
                onClick={() => {
                  lockLayout(layoutConfig.id as KeyboardLayoutType);
                  setShowLayoutPicker(false);
                }}
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '7px',
                  padding: '8px 12px',
                  background: layout === layoutConfig.id ? 'var(--accent-green)' : 'transparent',
                  border: `2px solid ${layout === layoutConfig.id ? 'var(--accent-green)' : 'var(--accent-cyan)'}`,
                  borderRadius: '4px',
                  color: layout === layoutConfig.id ? 'var(--bg-primary)' : 'var(--text-primary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {layoutConfig.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
