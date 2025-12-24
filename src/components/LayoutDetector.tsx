import { useState, useEffect, useRef } from 'react';
import type { KeyboardLayoutType } from '../data/keyboardLayouts';
import { KEYBOARD_LAYOUTS, detectLayoutFromInput, getPossibleLayouts } from '../data/keyboardLayouts';

interface LayoutDetectorProps {
  onLayoutDetected: (layout: KeyboardLayoutType) => void;
  onCancel: () => void;
}

type DetectionPhase = 'home-row' | 'disambiguation' | 'confirmed';

export function LayoutDetector({ onLayoutDetected, onCancel }: LayoutDetectorProps) {
  const [phase, setPhase] = useState<DetectionPhase>('home-row');
  const [input, setInput] = useState('');
  const [possibleLayouts, setPossibleLayouts] = useState<KeyboardLayoutType[]>([]);
  const [detectedLayout, setDetectedLayout] = useState<KeyboardLayoutType | null>(null);
  const [detectedFamily, setDetectedFamily] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [phase]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    // Wait for at least 10 characters to distinguish between layouts
    if (value.length >= 10) {
      const result = detectLayoutFromInput(value);

      if (result.needsDisambiguation) {
        // Same family (e.g., QWERTZ DE vs CH) - need to ask user
        setPossibleLayouts(result.possibleLayouts);
        setDetectedFamily(result.family || null);
        setPhase('disambiguation');
      } else if (result.layout) {
        setDetectedLayout(result.layout);
        setPhase('confirmed');
      } else if (result.possibleLayouts.length > 0) {
        // Multiple possible layouts from different families
        setPossibleLayouts(result.possibleLayouts);
        setPhase('disambiguation');
      }
    } else if (value.length >= 8) {
      // Check if we can already distinguish (unique prefix)
      const possible = getPossibleLayouts(value);
      if (possible.length === 1) {
        setDetectedLayout(possible[0]);
        setPhase('confirmed');
      }
    }
  };

  const handleLayoutSelect = (layout: KeyboardLayoutType) => {
    setDetectedLayout(layout);
    setPhase('confirmed');
  };

  const handleConfirm = () => {
    if (detectedLayout) {
      onLayoutDetected(detectedLayout);
    }
  };

  const handleRetry = () => {
    setInput('');
    setPhase('home-row');
    setDetectedLayout(null);
    setDetectedFamily(null);
    setPossibleLayouts([]);
  };

  // Phase 1: Type home row
  if (phase === 'home-row') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/80" onClick={onCancel} />

        <div className="relative pixel-box p-6 max-w-lg w-full">
          <div className="text-center mb-6">
            <h2 style={{ fontFamily: "'Press Start 2P'", fontSize: '14px', color: '#ffd93d' }}>
              DETECT KEYBOARD
            </h2>
            <p style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#3bceac', marginTop: '12px', lineHeight: '2' }}>
              TYPE YOUR HOME ROW KEYS FROM LEFT TO RIGHT
            </p>
          </div>

          {/* Visual guide showing physical keyboard positions */}
          <div className="pixel-box pixel-box-yellow p-4 mb-6">
            <p style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#eef5db', textAlign: 'center', lineHeight: '2' }}>
              PLACE YOUR FINGERS ON THE MIDDLE ROW AND TYPE ALL 10 KEYS
            </p>
            <div className="flex justify-center gap-1 mt-4">
              {['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', '?'].map((key, idx) => (
                <div
                  key={idx}
                  className="w-8 h-8 flex items-center justify-center border-2"
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '10px',
                    borderColor: input.length > idx ? '#0ead69' : '#3bceac',
                    backgroundColor: input.length > idx ? 'rgba(14, 173, 105, 0.3)' : 'rgba(59, 206, 172, 0.1)',
                    color: input.length > idx ? '#0ead69' : '#eef5db',
                    boxShadow: input.length === idx ? '0 0 10px #ffd93d' : 'none'
                  }}
                >
                  {input.length > idx ? input[idx].toUpperCase() : key}
                </div>
              ))}
            </div>
          </div>

          {/* Input field */}
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              className="w-full p-4 text-center border-4 border-[#3bceac] bg-[#1a1a2e] outline-none"
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '16px',
                color: '#eef5db',
                letterSpacing: '4px'
              }}
              placeholder="TYPE HERE..."
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
            />
          </div>

          <p
            className="mt-4 text-center animate-blink"
            style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: '#4a4a6e' }}
          >
            {input.length < 10 ? `${10 - input.length} MORE KEYS...` : 'ANALYZING...'}
          </p>

          <div className="flex justify-center mt-6">
            <button
              onClick={onCancel}
              className="pixel-btn pixel-btn-red"
              style={{ fontSize: '10px' }}
            >
              CANCEL
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Phase 2: Disambiguation (when multiple layouts match)
  if (phase === 'disambiguation') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/80" onClick={onCancel} />

        <div className="relative pixel-box p-6 max-w-lg w-full">
          <div className="text-center mb-6">
            <h2 style={{ fontFamily: "'Press Start 2P'", fontSize: '14px', color: '#ffd93d' }}>
              {detectedFamily ? `${detectedFamily.toUpperCase()} DETECTED!` : 'WHICH LAYOUT?'}
            </h2>
            <p style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#3bceac', marginTop: '12px', lineHeight: '2' }}>
              {detectedFamily
                ? 'SELECT YOUR SPECIFIC VARIANT'
                : 'WE DETECTED MULTIPLE POSSIBLE LAYOUTS'}
            </p>
          </div>

          {detectedFamily && (
            <div className="pixel-box pixel-box-green p-3 mb-4 text-center">
              <p style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#0ead69' }}>
                YOUR INPUT: {input.toUpperCase()}
              </p>
            </div>
          )}

          <div className="space-y-3">
            {possibleLayouts.map(layoutId => {
              const layout = KEYBOARD_LAYOUTS[layoutId];
              return (
                <button
                  key={layoutId}
                  onClick={() => handleLayoutSelect(layoutId)}
                  className="w-full p-4 text-left transition-all border-4 border-[#3bceac] bg-[#1a1a2e] hover:bg-[#3bceac]/10 hover:border-[#ffd93d]"
                  style={{ boxShadow: '4px 4px 0 #0f0f1b' }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 style={{ fontFamily: "'Press Start 2P'", fontSize: '12px', color: '#eef5db' }}>
                        {layout.name}
                      </h3>
                      <p style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#3bceac', marginTop: '4px' }}>
                        {layout.description}
                      </p>
                    </div>
                    <span style={{ fontFamily: "'Press Start 2P'", fontSize: '16px', color: '#3bceac' }}>
                      →
                    </span>
                  </div>

                  {/* Home row preview */}
                  <div className="flex gap-1 mt-3">
                    {layout.rows[1].map((key, idx) => (
                      <div
                        key={idx}
                        className="w-6 h-6 flex items-center justify-center border-2 border-[#3bceac]"
                        style={{
                          fontFamily: "'Press Start 2P'",
                          fontSize: '8px',
                          backgroundColor: idx === 3 || idx === 6 ? 'rgba(255, 217, 61, 0.2)' : 'rgba(59, 206, 172, 0.1)',
                          color: '#eef5db'
                        }}
                      >
                        {key.toUpperCase()}
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={handleRetry}
              className="pixel-btn"
              style={{ fontSize: '10px' }}
            >
              RETRY
            </button>
            <button
              onClick={onCancel}
              className="pixel-btn pixel-btn-red"
              style={{ fontSize: '10px' }}
            >
              CANCEL
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Phase 3: Confirmed
  if (phase === 'confirmed' && detectedLayout) {
    const layout = KEYBOARD_LAYOUTS[detectedLayout];
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/80" onClick={onCancel} />

        <div className="relative pixel-box pixel-box-green p-6 max-w-lg w-full">
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">✓</div>
            <h2 style={{ fontFamily: "'Press Start 2P'", fontSize: '14px', color: '#0ead69' }}>
              LAYOUT DETECTED!
            </h2>
          </div>

          <div className="pixel-box p-4 mb-6">
            <div className="text-center">
              <h3 style={{ fontFamily: "'Press Start 2P'", fontSize: '20px', color: '#ffd93d' }} className="text-glow-yellow">
                {layout.name}
              </h3>
              <p style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#3bceac', marginTop: '8px' }}>
                {layout.description}
              </p>
            </div>

            {/* Preview home row */}
            <div className="flex justify-center gap-1 mt-4">
              {layout.rows[1].map((key, idx) => (
                <div
                  key={idx}
                  className="w-7 h-7 flex items-center justify-center border-2 border-[#3bceac]"
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '8px',
                    backgroundColor: idx === 3 || idx === 6 ? 'rgba(255, 217, 61, 0.2)' : 'rgba(59, 206, 172, 0.1)',
                    color: '#eef5db'
                  }}
                >
                  {key.toUpperCase()}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={handleRetry}
              className="pixel-btn"
              style={{ fontSize: '10px' }}
            >
              RETRY
            </button>
            <button
              onClick={handleConfirm}
              className="pixel-btn pixel-btn-green"
              style={{ fontSize: '10px' }}
            >
              CONFIRM
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
