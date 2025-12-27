import { useState } from 'react';
import { useKeyboardLayout } from '../providers/KeyboardLayoutProvider';
import { KEYBOARD_LAYOUTS, type KeyboardLayoutType } from '../data/keyboardLayouts';

interface CollapsedHeroProps {
  initialWpm?: number;
  onRetakeTest: () => void;
  onStartPracticing: () => void;
}

export function CollapsedHero({ initialWpm, onRetakeTest, onStartPracticing }: CollapsedHeroProps) {
  const { layout, lockLayout } = useKeyboardLayout();
  const [showLayoutPicker, setShowLayoutPicker] = useState(false);

  const layoutConfig = KEYBOARD_LAYOUTS[layout];

  return (
    <section
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        border: '3px solid #3bceac',
        borderRadius: '16px',
        padding: '24px 32px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative pixel corners */}
      <div style={{ position: 'absolute', top: '8px', left: '8px', width: '12px', height: '12px', borderTop: '3px solid #ffd93d', borderLeft: '3px solid #ffd93d' }} />
      <div style={{ position: 'absolute', top: '8px', right: '8px', width: '12px', height: '12px', borderTop: '3px solid #ffd93d', borderRight: '3px solid #ffd93d' }} />
      <div style={{ position: 'absolute', bottom: '8px', left: '8px', width: '12px', height: '12px', borderBottom: '3px solid #ffd93d', borderLeft: '3px solid #ffd93d' }} />
      <div style={{ position: 'absolute', bottom: '8px', right: '8px', width: '12px', height: '12px', borderBottom: '3px solid #ffd93d', borderRight: '3px solid #ffd93d' }} />

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
              filter: 'drop-shadow(0 0 8px rgba(59, 206, 172, 0.5))',
            }}
          >
            ⌨️
          </span>
          <div style={{ textAlign: 'left' }}>
            <div
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '10px',
                color: '#6a6a8e',
                marginBottom: '4px',
              }}
            >
              KEYBOARD
            </div>
            <div
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '12px',
                color: '#3bceac',
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
              border: '2px solid #6a6a8e',
              borderRadius: '4px',
              color: '#6a6a8e',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#3bceac';
              e.currentTarget.style.color = '#3bceac';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#6a6a8e';
              e.currentTarget.style.color = '#6a6a8e';
            }}
          >
            CHANGE
          </button>
        </div>

        {/* Divider */}
        <div
          style={{
            width: '2px',
            height: '40px',
            background: 'linear-gradient(to bottom, transparent, #3bceac, transparent)',
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
                  filter: 'drop-shadow(0 0 8px rgba(255, 217, 61, 0.5))',
                }}
              >
                ⚡
              </span>
              <div style={{ textAlign: 'left' }}>
                <div
                  style={{
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: '10px',
                    color: '#6a6a8e',
                    marginBottom: '4px',
                  }}
                >
                  STARTING SPEED
                </div>
                <div
                  style={{
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: '12px',
                    color: '#ffd93d',
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
                  border: '2px solid #6a6a8e',
                  borderRadius: '4px',
                  color: '#6a6a8e',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#ffd93d';
                  e.currentTarget.style.color = '#ffd93d';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#6a6a8e';
                  e.currentTarget.style.color = '#6a6a8e';
                }}
              >
                RETAKE
              </button>
            </div>

            {/* Divider */}
            <div
              style={{
                width: '2px',
                height: '40px',
                background: 'linear-gradient(to bottom, transparent, #3bceac, transparent)',
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
            background: 'linear-gradient(135deg, #0ead69 0%, #0a8c54 100%)',
            border: 'none',
            borderRadius: '8px',
            color: '#0f0f1b',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 4px 15px rgba(14, 173, 105, 0.4)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(14, 173, 105, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(14, 173, 105, 0.4)';
          }}
        >
          START PRACTICING
        </button>
      </div>

      {/* Layout Picker */}
      {showLayoutPicker && (
        <div
          style={{
            marginTop: '20px',
            padding: '16px',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '8px',
            border: '2px solid #3bceac',
          }}
        >
          <p
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '8px',
              color: '#ffd93d',
              marginBottom: '12px',
            }}
          >
            SELECT YOUR KEYBOARD LAYOUT:
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
                  background: layout === layoutConfig.id ? '#0ead69' : 'transparent',
                  border: `2px solid ${layout === layoutConfig.id ? '#0ead69' : '#3bceac'}`,
                  borderRadius: '4px',
                  color: layout === layoutConfig.id ? '#0f0f1b' : '#eef5db',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (layout !== layoutConfig.id) {
                    e.currentTarget.style.background = 'rgba(59, 206, 172, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (layout !== layoutConfig.id) {
                    e.currentTarget.style.background = 'transparent';
                  }
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
