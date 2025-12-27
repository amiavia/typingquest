import { useState, useEffect, useCallback } from 'react';

interface KeyboardVerificationProps {
  onVerified: () => void;
  onCancel: () => void;
}

const REQUIRED_KEYS = ['a', 's', 'd', 'f'];

/**
 * Verifies that user has a physical keyboard attached.
 * Tests the home row keys (A, S, D, F) which require proper keydown events.
 * Touch keyboards don't fire reliable keyCode/code events.
 */
export function KeyboardVerification({ onVerified, onCancel }: KeyboardVerificationProps) {
  const [keysPressed, setKeysPressed] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Physical keyboards fire events with proper code like "KeyA", "KeyS", etc.
    // Touch keyboards often don't have reliable codes
    if (e.code && e.code.startsWith('Key')) {
      const key = e.key.toLowerCase();
      if (REQUIRED_KEYS.includes(key) && !keysPressed.includes(key)) {
        setKeysPressed(prev => [...prev, key]);
      }
    }
  }, [keysPressed]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Check if all keys are pressed
  useEffect(() => {
    if (REQUIRED_KEYS.every(k => keysPressed.includes(k))) {
      setShowSuccess(true);
      // Brief delay to show success state before proceeding
      const timer = setTimeout(() => {
        onVerified();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [keysPressed, onVerified]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0f0f1b' }}>
      <div
        className="pixel-box p-8 max-w-md w-full text-center"
        style={{
          background: '#1a1a2e',
          border: showSuccess ? '4px solid #0ead69' : '4px solid #3bceac',
        }}
      >
        {showSuccess ? (
          <>
            {/* Success State */}
            <div className="text-6xl mb-6 animate-pulse">
              ✓
            </div>
            <h2
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '14px',
                color: '#0ead69',
                marginBottom: '16px',
              }}
            >
              KEYBOARD VERIFIED!
            </h2>
            <p
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '8px',
                color: '#3bceac',
                lineHeight: '2',
              }}
            >
              LOADING TYPEBIT8...
            </p>
          </>
        ) : (
          <>
            {/* Verification State */}
            <div className="text-5xl mb-6">
              ⌨️
            </div>
            <h2
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '14px',
                color: '#ffd93d',
                marginBottom: '16px',
              }}
            >
              VERIFY KEYBOARD
            </h2>
            <p
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '8px',
                color: '#eef5db',
                lineHeight: '2.2',
                marginBottom: '24px',
              }}
            >
              PLACE YOUR FINGERS ON THE<br />
              HOME ROW AND PRESS:
            </p>

            {/* Key Indicators */}
            <div className="flex justify-center gap-3 mb-8">
              {REQUIRED_KEYS.map(key => {
                const isPressed = keysPressed.includes(key);
                return (
                  <div
                    key={key}
                    className="transition-all duration-200"
                    style={{
                      width: '56px',
                      height: '56px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: "'Press Start 2P'",
                      fontSize: '18px',
                      background: isPressed ? '#0ead69' : '#2a2a3e',
                      color: isPressed ? '#0f0f1b' : '#eef5db',
                      border: `4px solid ${isPressed ? '#0ead69' : '#4a4a6e'}`,
                      boxShadow: isPressed
                        ? '0 0 20px rgba(14, 173, 105, 0.5)'
                        : 'inset 0 -4px 0 rgba(0,0,0,0.3)',
                      transform: isPressed ? 'translateY(2px)' : 'none',
                    }}
                  >
                    {key.toUpperCase()}
                  </div>
                );
              })}
            </div>

            {/* Progress indicator */}
            <div className="mb-8">
              <div
                className="h-2 bg-[#2a2a3e] overflow-hidden"
                style={{ border: '2px solid #4a4a6e' }}
              >
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${(keysPressed.length / REQUIRED_KEYS.length) * 100}%`,
                    background: 'linear-gradient(90deg, #3bceac, #0ead69)',
                  }}
                />
              </div>
              <p
                style={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: '6px',
                  color: '#4a4a6e',
                  marginTop: '8px',
                }}
              >
                {keysPressed.length}/{REQUIRED_KEYS.length} KEYS PRESSED
              </p>
            </div>

            {/* Cancel Button */}
            <button
              onClick={onCancel}
              className="px-6 py-3 transition-all hover:brightness-125"
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '8px',
                color: '#4a4a6e',
                background: 'transparent',
                border: '2px solid #4a4a6e',
                cursor: 'pointer',
              }}
            >
              NEVER MIND, USE DESKTOP
            </button>
          </>
        )}
      </div>
    </div>
  );
}
