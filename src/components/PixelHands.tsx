import { useMemo } from 'react';

export type FingerType =
  | 'l-pinky' | 'l-ring' | 'l-mid' | 'l-index'
  | 'r-index' | 'r-mid' | 'r-ring' | 'r-pinky'
  | 'thumb';

interface PixelHandsProps {
  activeFinger?: FingerType | null;
  compact?: boolean;
}

// Finger colors matching keyboard key colors
const fingerColors: Record<FingerType, string> = {
  'l-pinky': '#e63946',   // Red
  'l-ring': '#ff6b35',    // Orange
  'l-mid': '#ffd93d',     // Yellow
  'l-index': '#0ead69',   // Green
  'r-index': '#3bceac',   // Teal
  'r-mid': '#0f4c75',     // Blue
  'r-ring': '#9d4edd',    // Purple
  'r-pinky': '#ff6b9d',   // Pink
  'thumb': '#6c757d',     // Gray
};

// Left hand finger configs (pinky to index, left to right)
const leftFingers: { type: FingerType; height: number; marginTop: number }[] = [
  { type: 'l-pinky', height: 18, marginTop: 6 },
  { type: 'l-ring', height: 24, marginTop: 0 },
  { type: 'l-mid', height: 26, marginTop: -2 },
  { type: 'l-index', height: 22, marginTop: 2 },
];

// Right hand finger configs (index to pinky, left to right)
const rightFingers: { type: FingerType; height: number; marginTop: number }[] = [
  { type: 'r-index', height: 22, marginTop: 2 },
  { type: 'r-mid', height: 26, marginTop: -2 },
  { type: 'r-ring', height: 24, marginTop: 0 },
  { type: 'r-pinky', height: 18, marginTop: 6 },
];

export function PixelHands({ activeFinger, compact = false }: PixelHandsProps) {
  const scale = compact ? 0.7 : 1;

  const containerStyle = useMemo(() => ({
    display: 'flex',
    justifyContent: 'center',
    gap: compact ? '60px' : '100px',
    marginTop: compact ? '15px' : '30px',
    transform: `scale(${scale})`,
    transformOrigin: 'top center',
  }), [compact, scale]);

  return (
    <div style={containerStyle}>
      {/* Left Hand */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '8px',
          marginBottom: '10px',
          color: '#3bceac',
        }}>
          LEFT HAND
        </div>

        {/* Fingers */}
        <div style={{ display: 'flex', gap: '2px' }}>
          {leftFingers.map((finger) => {
            const isActive = activeFinger === finger.type;
            return (
              <div
                key={finger.type}
                style={{
                  width: '16px',
                  height: `${finger.height}px`,
                  marginTop: `${finger.marginTop}px`,
                  backgroundColor: fingerColors[finger.type],
                  borderRadius: '8px 8px 4px 4px',
                  transition: 'all 0.15s ease',
                  transform: isActive ? 'scale(1.3)' : 'scale(1)',
                  boxShadow: isActive ? `0 0 15px ${fingerColors[finger.type]}` : 'none',
                }}
              />
            );
          })}
        </div>

        {/* Left Thumb */}
        <div
          style={{
            width: '28px',
            height: '18px',
            backgroundColor: fingerColors.thumb,
            borderRadius: '4px',
            marginTop: '8px',
            marginLeft: '50px',
            transition: 'all 0.15s ease',
            transform: activeFinger === 'thumb' ? 'scale(1.3)' : 'scale(1)',
            boxShadow: activeFinger === 'thumb' ? `0 0 15px ${fingerColors.thumb}` : `0 0 8px ${fingerColors.thumb}`,
          }}
        />
        <div style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '6px',
          color: fingerColors.thumb,
          marginTop: '4px',
        }}>
          THUMB
        </div>
      </div>

      {/* Right Hand */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '8px',
          marginBottom: '10px',
          color: '#3bceac',
        }}>
          RIGHT HAND
        </div>

        {/* Fingers */}
        <div style={{ display: 'flex', gap: '2px' }}>
          {rightFingers.map((finger) => {
            const isActive = activeFinger === finger.type;
            return (
              <div
                key={finger.type}
                style={{
                  width: '16px',
                  height: `${finger.height}px`,
                  marginTop: `${finger.marginTop}px`,
                  backgroundColor: fingerColors[finger.type],
                  borderRadius: '8px 8px 4px 4px',
                  transition: 'all 0.15s ease',
                  transform: isActive ? 'scale(1.3)' : 'scale(1)',
                  boxShadow: isActive ? `0 0 15px ${fingerColors[finger.type]}` : 'none',
                }}
              />
            );
          })}
        </div>

        {/* Right Thumb */}
        <div
          style={{
            width: '28px',
            height: '18px',
            backgroundColor: fingerColors.thumb,
            borderRadius: '4px',
            marginTop: '8px',
            marginRight: '50px',
            transition: 'all 0.15s ease',
            transform: activeFinger === 'thumb' ? 'scale(1.3)' : 'scale(1)',
            boxShadow: activeFinger === 'thumb' ? `0 0 15px ${fingerColors.thumb}` : `0 0 8px ${fingerColors.thumb}`,
          }}
        />
        <div style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '6px',
          color: fingerColors.thumb,
          marginTop: '4px',
        }}>
          THUMB
        </div>
      </div>
    </div>
  );
}

// Map physical key codes to finger types
export const codeToFinger: Record<string, FingerType> = {
  // Top row
  'KeyQ': 'l-pinky', 'KeyW': 'l-ring', 'KeyE': 'l-mid',
  'KeyR': 'l-index', 'KeyT': 'l-index',
  'KeyY': 'r-index', 'KeyU': 'r-index',
  'KeyI': 'r-mid', 'KeyO': 'r-ring', 'KeyP': 'r-pinky',
  // Home row
  'KeyA': 'l-pinky', 'KeyS': 'l-ring', 'KeyD': 'l-mid',
  'KeyF': 'l-index', 'KeyG': 'l-index',
  'KeyH': 'r-index', 'KeyJ': 'r-index',
  'KeyK': 'r-mid', 'KeyL': 'r-ring', 'Semicolon': 'r-pinky',
  // Bottom row
  'KeyZ': 'l-pinky', 'KeyX': 'l-ring', 'KeyC': 'l-mid',
  'KeyV': 'l-index', 'KeyB': 'l-index',
  'KeyN': 'r-index', 'KeyM': 'r-index',
  'Comma': 'r-mid', 'Period': 'r-ring', 'Slash': 'r-pinky',
  // Space
  'Space': 'thumb',
};

// Map characters to finger types (for when we only have the character)
export const charToFinger: Record<string, FingerType> = {
  // Left hand
  'q': 'l-pinky', 'a': 'l-pinky', 'z': 'l-pinky',
  'w': 'l-ring', 's': 'l-ring', 'x': 'l-ring',
  'e': 'l-mid', 'd': 'l-mid', 'c': 'l-mid',
  'r': 'l-index', 'f': 'l-index', 'v': 'l-index',
  't': 'l-index', 'g': 'l-index', 'b': 'l-index',
  // Right hand
  'y': 'r-index', 'h': 'r-index', 'n': 'r-index',
  'u': 'r-index', 'j': 'r-index', 'm': 'r-index',
  'i': 'r-mid', 'k': 'r-mid', ',': 'r-mid',
  'o': 'r-ring', 'l': 'r-ring', '.': 'r-ring',
  'p': 'r-pinky', ';': 'r-pinky', '/': 'r-pinky',
  // German umlauts (on QWERTZ pinky positions)
  'ö': 'r-pinky', 'ä': 'r-pinky', 'ü': 'r-pinky', 'ß': 'r-pinky',
  // Space
  ' ': 'thumb',
};

export { fingerColors };
