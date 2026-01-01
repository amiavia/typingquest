import { useMemo, useCallback } from 'react';
import type { KeyboardLayoutType } from '../data/keyboardLayouts';
import { KEYBOARD_LAYOUTS, getFingerForPosition } from '../data/keyboardLayouts';
import { useKeyboardSkin } from '../providers/KeyboardSkinProvider';
import { useKeyboardLayout } from '../providers/KeyboardLayoutProvider';
import { PixelHands, charToFinger, type FingerType } from './PixelHands';

interface KeyboardWithHandsProps {
  // Display options
  layout?: KeyboardLayoutType;
  showFingerColors?: boolean;
  showHands?: boolean;
  showDetectionStatus?: boolean;
  compact?: boolean;

  // Key highlighting
  highlightKeys?: string[];
  activeKey?: string;
  pressedKey?: string;
  incorrectKey?: boolean;

  // Detection callbacks
  onLayoutDetected?: (layout: KeyboardLayoutType) => void;
  onLayoutLocked?: (layout: KeyboardLayoutType) => void;
}

// 8-bit color palette for fingers
const PIXEL_FINGER_COLORS: Record<string, string> = {
  'left-pinky': '#e63946',
  'left-ring': '#ff6b35',
  'left-middle': '#ffd93d',
  'left-index': '#0ead69',
  'right-index': '#3bceac',
  'right-middle': '#0f4c75',
  'right-ring': '#9d4edd',
  'right-pinky': '#ff6b9d',
  'thumb': '#6c757d',
};

export function KeyboardWithHands({
  layout: propLayout,
  showFingerColors = true,
  showHands = true,
  showDetectionStatus = false,
  compact = false,
  highlightKeys = [],
  activeKey,
  pressedKey,
  incorrectKey = false,
}: KeyboardWithHandsProps) {
  // Get layout from context or prop
  const keyboardContext = useKeyboardLayout();
  const layout = propLayout || keyboardContext.layout;
  const { detectionState, isLocked } = keyboardContext;

  const layoutConfig = KEYBOARD_LAYOUTS[layout];
  const rows = layoutConfig.rows;
  const { currentSkin } = useKeyboardSkin();
  const skin = currentSkin.cssVariables;

  const normalizedHighlight = useMemo(
    () => highlightKeys.map(k => k.toLowerCase()),
    [highlightKeys]
  );
  const normalizedActive = activeKey?.toLowerCase();
  const normalizedPressed = pressedKey?.toLowerCase();

  // Get finger to highlight based on active key
  const activeFinger = useMemo((): FingerType | null => {
    if (!activeKey) return null;
    return charToFinger[activeKey.toLowerCase()] || null;
  }, [activeKey]);

  const getKeyStyle = useCallback((key: string, rowIndex: number, colIndex: number): React.CSSProperties => {
    const keyLower = key.toLowerCase();
    const finger = getFingerForPosition(rowIndex, colIndex);
    const isHighlighted = normalizedHighlight.includes(keyLower);
    const isActive = normalizedActive === keyLower;
    const isPressed = normalizedPressed === keyLower;
    const hasHighlightedKeys = normalizedHighlight.length > 0;

    // Use skin CSS variables with fallbacks
    let bgColor = skin['--skin-key-bg'] || '#1a1a2e';
    let borderColor = skin['--skin-key-border'] || '#3bceac';
    let textColor = skin['--skin-key-text'] || '#eef5db';
    let boxShadow = skin['--skin-key-shadow'] || '4px 4px 0 #0f0f1b, inset -2px -2px 0 rgba(0,0,0,0.3), inset 2px 2px 0 rgba(255,255,255,0.1)';
    const glow = skin['--skin-key-glow'] || 'none';

    if (isPressed && incorrectKey) {
      bgColor = skin['--skin-key-incorrect-bg'] || '#e63946';
      borderColor = skin['--skin-key-incorrect-bg'] || '#ff6b6b';
      boxShadow = `2px 2px 0 #0f0f1b, 0 0 20px ${bgColor}`;
    } else if (isPressed) {
      bgColor = skin['--skin-key-correct-bg'] || '#0ead69';
      borderColor = skin['--skin-key-border'] || '#3bceac';
      boxShadow = `2px 2px 0 #0f0f1b, 0 0 20px ${bgColor}`;
    } else if (isActive) {
      bgColor = skin['--skin-key-highlight-bg'] || '#ffd93d';
      borderColor = skin['--skin-key-highlight-border'] || '#ffd93d';
      textColor = '#0f0f1b';
      boxShadow = glow !== 'none' ? `4px 4px 0 #0f0f1b, ${glow}` : `4px 4px 0 #0f0f1b, 0 0 30px ${bgColor}`;
    } else if (showFingerColors && (isHighlighted || !hasHighlightedKeys)) {
      // Show finger colors for: highlighted keys, OR all keys when no specific keys are highlighted
      const color = PIXEL_FINGER_COLORS[finger];
      borderColor = color;
      bgColor = `${color}33`;
    } else if (hasHighlightedKeys && !isHighlighted) {
      // Dim non-highlighted keys only when there ARE highlighted keys
      borderColor = '#2a2a4e';
      bgColor = skin['--skin-key-bg-hover'] || '#16213e';
      textColor = '#4a4a6e';
    }

    return {
      backgroundColor: bgColor,
      borderColor: borderColor,
      color: textColor,
      boxShadow,
      transform: isPressed ? 'translate(2px, 2px)' : 'none',
      borderRadius: skin['--skin-key-border-radius'] || '4px',
      borderWidth: skin['--skin-key-border-width'] || '4px',
    };
  }, [normalizedHighlight, normalizedActive, normalizedPressed, showFingerColors, incorrectKey, skin]);

  // Detection status indicator
  const DetectionIndicator = () => {
    if (!showDetectionStatus) return null;

    let statusColor = '#3bceac';
    let statusText = 'DETECTING...';
    let statusIcon = '...';

    if (detectionState === 'detected') {
      statusColor = '#ffd93d';
      statusText = layoutConfig.name;
      statusIcon = '...';
    } else if (detectionState === 'locked' || isLocked) {
      statusColor = '#0ead69';
      statusText = layoutConfig.name;
      statusIcon = '';
    }

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '6px 12px',
          marginBottom: '12px',
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '8px',
          color: statusColor,
          border: `2px solid ${statusColor}`,
          backgroundColor: `${statusColor}15`,
          borderRadius: '4px',
          transition: 'all 0.3s ease',
        }}
      >
        <span>{statusText}</span>
        {statusIcon && <span style={{ animation: 'pulse 1s infinite' }}>{statusIcon}</span>}
        {isLocked && <span style={{ marginLeft: '4px' }}>LOCKED</span>}
      </div>
    );
  };

  const scale = compact ? 0.75 : 1;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        className="pixel-box"
        style={{
          padding: compact ? '12px' : '16px 24px',
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
        }}
      >
        {/* Detection Status Indicator */}
        <DetectionIndicator />

        {/* Layout indicator (shown when not showing detection status) */}
        {!showDetectionStatus && (
          <div style={{ textAlign: 'center', marginBottom: '12px' }}>
            <span
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '10px',
                color: 'var(--accent-cyan)',
                padding: '4px 8px',
                border: '2px solid var(--accent-cyan)',
                backgroundColor: 'var(--card-cyan-bg)'
              }}
            >
              {layoutConfig.name}
            </span>
          </div>
        )}

        {/* Keyboard Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {rows.map((row, rowIndex) => (
            <div
              key={rowIndex}
              style={{
                display: 'flex',
                gap: '6px',
                justifyContent: 'center',
                marginLeft: rowIndex === 1 ? '16px' : rowIndex === 2 ? '32px' : '0',
              }}
            >
              {row.map((key, keyIndex) => {
                const isHomeKey = rowIndex === 1 && (keyIndex === 3 || keyIndex === 6);
                const isSpace = key === ' ';

                return (
                  <div
                    key={`${rowIndex}-${keyIndex}`}
                    style={{
                      ...getKeyStyle(key, rowIndex, keyIndex),
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: isSpace ? '200px' : '36px',
                      height: '36px',
                      fontFamily: "'Press Start 2P', monospace",
                      fontSize: '10px',
                      borderStyle: 'solid',
                      transition: 'all 0.075s ease',
                    }}
                  >
                    {isSpace ? 'SPACE' : key.toUpperCase()}
                    {isHomeKey && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '4px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '8px',
                          height: '4px',
                          backgroundColor: '#ffd93d',
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Finger Legend */}
        {showFingerColors && highlightKeys.length > 0 && (
          <div
            style={{
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '2px solid var(--accent-cyan)',
            }}
          >
            <FingerLegend />
          </div>
        )}
      </div>

      {/* Pixel Hands */}
      {showHands && (
        <PixelHands activeFinger={activeFinger} compact={compact} />
      )}
    </div>
  );
}

function FingerLegend() {
  const fingers = [
    { finger: 'left-pinky', label: 'L.PINKY' },
    { finger: 'left-ring', label: 'L.RING' },
    { finger: 'left-middle', label: 'L.MID' },
    { finger: 'left-index', label: 'L.INDEX' },
    { finger: 'right-index', label: 'R.INDEX' },
    { finger: 'right-middle', label: 'R.MID' },
    { finger: 'right-ring', label: 'R.RING' },
    { finger: 'right-pinky', label: 'R.PINKY' },
  ];

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
      {fingers.map(({ finger, label }) => (
        <div
          key={finger}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '10px',
          }}
        >
          <div
            style={{
              width: '12px',
              height: '12px',
              backgroundColor: PIXEL_FINGER_COLORS[finger],
              borderColor: PIXEL_FINGER_COLORS[finger],
              borderWidth: '2px',
              borderStyle: 'solid',
              boxShadow: `0 0 5px ${PIXEL_FINGER_COLORS[finger]}`,
            }}
          />
          <span style={{ color: 'var(--text-primary)' }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

// Re-export for convenience
export { fingerColors, type FingerType } from './PixelHands';
