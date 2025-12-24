import type { KeyboardLayoutType } from '../data/keyboardLayouts';
import { KEYBOARD_LAYOUTS, getFingerForPosition } from '../data/keyboardLayouts';

interface KeyboardProps {
  highlightKeys?: string[];
  activeKey?: string;
  showFingerColors?: boolean;
  pressedKey?: string;
  incorrectKey?: boolean;
  layout?: KeyboardLayoutType;
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

export function Keyboard({
  highlightKeys = [],
  activeKey,
  showFingerColors = true,
  pressedKey,
  incorrectKey = false,
  layout = 'qwerty-us'
}: KeyboardProps) {
  const layoutConfig = KEYBOARD_LAYOUTS[layout];
  const rows = layoutConfig.rows;

  const normalizedHighlight = highlightKeys.map(k => k.toLowerCase());
  const normalizedActive = activeKey?.toLowerCase();
  const normalizedPressed = pressedKey?.toLowerCase();

  const getKeyStyle = (key: string, rowIndex: number, colIndex: number): React.CSSProperties => {
    const keyLower = key.toLowerCase();
    const finger = getFingerForPosition(rowIndex, colIndex);
    const isHighlighted = normalizedHighlight.includes(keyLower);
    const isActive = normalizedActive === keyLower;
    const isPressed = normalizedPressed === keyLower;

    let bgColor = '#1a1a2e';
    let borderColor = '#3bceac';
    let textColor = '#eef5db';
    let boxShadow = '4px 4px 0 #0f0f1b, inset -2px -2px 0 rgba(0,0,0,0.3), inset 2px 2px 0 rgba(255,255,255,0.1)';

    if (isPressed && incorrectKey) {
      bgColor = '#e63946';
      borderColor = '#ff6b6b';
      boxShadow = '2px 2px 0 #0f0f1b, 0 0 20px #e63946';
    } else if (isPressed) {
      bgColor = '#0ead69';
      borderColor = '#3bceac';
      boxShadow = '2px 2px 0 #0f0f1b, 0 0 20px #0ead69';
    } else if (isActive) {
      bgColor = '#ffd93d';
      borderColor = '#ffd93d';
      textColor = '#0f0f1b';
      boxShadow = '4px 4px 0 #0f0f1b, 0 0 30px #ffd93d';
    } else if (isHighlighted && showFingerColors) {
      const color = PIXEL_FINGER_COLORS[finger];
      borderColor = color;
      bgColor = `${color}33`;
    } else if (!isHighlighted) {
      borderColor = '#2a2a4e';
      bgColor = '#16213e';
      textColor = '#4a4a6e';
    }

    return {
      backgroundColor: bgColor,
      borderColor: borderColor,
      color: textColor,
      boxShadow,
      transform: isPressed ? 'translate(2px, 2px)' : 'none',
    };
  };

  return (
    <div className="pixel-box p-4 sm:p-6">
      {/* Layout indicator */}
      <div className="text-center mb-4">
        <span
          style={{
            fontFamily: "'Press Start 2P'",
            fontSize: '8px',
            color: '#3bceac',
            padding: '4px 8px',
            border: '2px solid #3bceac',
            backgroundColor: 'rgba(59, 206, 172, 0.1)'
          }}
        >
          {layoutConfig.name}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="flex gap-1 sm:gap-2 justify-center"
            style={{ marginLeft: rowIndex === 1 ? '16px' : rowIndex === 2 ? '32px' : '0' }}
          >
            {row.map((key, keyIndex) => {
              const isHomeKey = rowIndex === 1 && (keyIndex === 3 || keyIndex === 6);
              const isSpace = key === ' ';

              return (
                <div
                  key={`${rowIndex}-${keyIndex}`}
                  className="relative flex items-center justify-center border-4 transition-all duration-75"
                  style={{
                    ...getKeyStyle(key, rowIndex, keyIndex),
                    width: isSpace ? '200px' : '36px',
                    height: '36px',
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: '10px',
                  }}
                >
                  {isSpace ? 'SPACE' : key.toUpperCase()}
                  {isHomeKey && (
                    <div
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-1"
                      style={{ backgroundColor: '#ffd93d' }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {showFingerColors && highlightKeys.length > 0 && (
        <div className="mt-4 pt-4 border-t-2 border-[#3bceac]">
          <FingerLegend />
        </div>
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
    <div className="flex flex-wrap gap-3 justify-center">
      {fingers.map(({ finger, label }) => (
        <div key={finger} className="flex items-center gap-1" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '6px' }}>
          <div
            className="w-3 h-3 border-2"
            style={{
              backgroundColor: PIXEL_FINGER_COLORS[finger],
              borderColor: PIXEL_FINGER_COLORS[finger],
              boxShadow: `0 0 5px ${PIXEL_FINGER_COLORS[finger]}`,
            }}
          />
          <span style={{ color: '#eef5db' }}>{label}</span>
        </div>
      ))}
    </div>
  );
}
