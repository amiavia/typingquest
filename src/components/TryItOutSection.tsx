import { useState, useEffect, useRef, useCallback } from 'react';
import { useKeyboardLayout } from '../providers/KeyboardLayoutProvider';
import { KeyboardWithHands } from './KeyboardWithHands';
import { KEYBOARD_LAYOUTS, type KeyboardLayoutType } from '../data/keyboardLayouts';

// Fun typing prompts that naturally contain detection keys (y, z, ;, etc.)
const FUN_PROMPTS = [
  { text: "crazy pizza", hint: "A classic combo!" },
  { text: "lazy yellow cat", hint: "Sounds cozy!" },
  { text: "fizzy lemonade", hint: "Refreshing!" },
  { text: "amazing journey", hint: "Let's go!" },
  { text: "jazz music rocks", hint: "Feel the rhythm!" },
  { text: "your name", hint: "Say hello!" },
  { text: "hello world", hint: "A classic!" },
  { text: "quick brown fox", hint: "The typing classic!" },
  { text: "wizard spells", hint: "Magic time!" },
  { text: "puzzle zone", hint: "Brain teaser!" },
];

function getRandomPrompt() {
  return FUN_PROMPTS[Math.floor(Math.random() * FUN_PROMPTS.length)];
}

export function TryItOutSection() {
  const { layout, isLocked, lockLayout } = useKeyboardLayout();
  const [inputText, setInputText] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState(() => getRandomPrompt());
  const [showSuccess, setShowSuccess] = useState(false);
  const [showLayoutPicker, setShowLayoutPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const successShownRef = useRef(false);

  // When layout is detected, show celebration (only once)
  useEffect(() => {
    if (isLocked && !successShownRef.current) {
      successShownRef.current = true;
      setShowSuccess(true);
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isLocked]);

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  }, []);

  // Get next random prompt
  const shufflePrompt = useCallback(() => {
    setCurrentPrompt(getRandomPrompt());
    setInputText('');
    inputRef.current?.focus();
  }, []);

  // Focus input on mount for immediate typing
  useEffect(() => {
    // Slight delay to ensure page is fully loaded
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        border: '3px solid #3bceac',
        borderRadius: '16px',
        padding: '32px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative pixel corners */}
      <div style={{ position: 'absolute', top: '8px', left: '8px', width: '16px', height: '16px', borderTop: '4px solid #ffd93d', borderLeft: '4px solid #ffd93d' }} />
      <div style={{ position: 'absolute', top: '8px', right: '8px', width: '16px', height: '16px', borderTop: '4px solid #ffd93d', borderRight: '4px solid #ffd93d' }} />
      <div style={{ position: 'absolute', bottom: '8px', left: '8px', width: '16px', height: '16px', borderBottom: '4px solid #ffd93d', borderLeft: '4px solid #ffd93d' }} />
      <div style={{ position: 'absolute', bottom: '8px', right: '8px', width: '16px', height: '16px', borderBottom: '4px solid #ffd93d', borderRight: '4px solid #ffd93d' }} />

      {/* Title */}
      <h2
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '20px',
          color: '#ffd93d',
          textShadow: '0 0 20px rgba(255, 217, 61, 0.4)',
          marginBottom: '8px',
        }}
      >
        TRY IT OUT!
      </h2>

      <p
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '10px',
          color: '#3bceac',
          marginBottom: '24px',
        }}
      >
        See your fingers light up as you type
      </p>

      {/* Typing playground */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ marginBottom: '12px' }}>
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={handleInputChange}
            placeholder={`Try: "${currentPrompt.text}"`}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '16px 24px',
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '14px',
              background: '#0f0f1b',
              border: '3px solid #3bceac',
              borderRadius: '8px',
              color: '#eef5db',
              textAlign: 'center',
              outline: 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#ffd93d';
              e.target.style.boxShadow = '0 0 20px rgba(255, 217, 61, 0.3)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#3bceac';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        <p
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '8px',
            color: '#6a6a8e',
            marginBottom: '12px',
          }}
        >
          {currentPrompt.hint}
        </p>

        {/* Shuffle button */}
        <button
          onClick={shufflePrompt}
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '8px',
            padding: '8px 16px',
            background: 'transparent',
            border: '2px solid #3bceac',
            borderRadius: '4px',
            color: '#3bceac',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(59, 206, 172, 0.2)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          NEW SUGGESTION
        </button>
      </div>

      {/* Keyboard visualization - main attraction! */}
      <div style={{ marginBottom: '16px' }}>
        <KeyboardWithHands
          layout={layout}
          showHands={true}
          showFingerColors={true}
          showDetectionStatus={true}
          activeKey={inputText.slice(-1)}
          highlightKeys={[]}
        />
      </div>

      {/* Success toast */}
      {showSuccess && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#0ead69',
            color: '#0f0f1b',
            padding: '16px 24px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '10px',
            boxShadow: '0 4px 20px rgba(14, 173, 105, 0.4)',
            animation: 'slideUp 0.3s ease',
            zIndex: 1000,
          }}
        >
          <span style={{ fontSize: '16px' }}>PERFECT!</span>
          <span>Your keyboard is all set up.</span>
          <button
            onClick={() => setShowSuccess(false)}
            style={{
              background: 'rgba(0,0,0,0.2)',
              border: 'none',
              color: '#0f0f1b',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '8px',
            }}
          >
            X
          </button>
        </div>
      )}

      {/* Subtle layout badge */}
      <div
        style={{
          marginTop: '16px',
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '8px',
          color: '#6a6a8e',
        }}
      >
        {isLocked ? (
          <span style={{ color: '#0ead69' }}>
            {layout.toUpperCase().replace('-', ' ')}
          </span>
        ) : (
          <span style={{ color: '#3bceac', animation: 'pulse 2s infinite' }}>
            Setting up...
          </span>
        )}
        <span style={{ margin: '0 8px' }}>|</span>
        <button
          onClick={() => setShowLayoutPicker(!showLayoutPicker)}
          style={{
            background: 'none',
            border: 'none',
            color: '#3bceac',
            textDecoration: 'underline',
            cursor: 'pointer',
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '8px',
          }}
        >
          {showLayoutPicker ? 'Cancel' : 'Change'}
        </button>
      </div>

      {/* Layout Picker */}
      {showLayoutPicker && (
        <div
          style={{
            marginTop: '16px',
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

      {/* Animation keyframes */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </section>
  );
}
