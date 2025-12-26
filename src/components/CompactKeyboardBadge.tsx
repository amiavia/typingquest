import { useState } from 'react';
import { useKeyboardLayout } from '../providers/KeyboardLayoutProvider';
import { KEYBOARD_LAYOUTS } from '../data/keyboardLayouts';
import { TryItOutSection } from './TryItOutSection';

export function CompactKeyboardBadge() {
  const { layout, resetDetection } = useKeyboardLayout();
  const [expanded, setExpanded] = useState(false);

  const layoutConfig = KEYBOARD_LAYOUTS[layout];

  if (expanded) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => setExpanded(false)}
            className="px-3 py-2 border-2 border-[#3bceac] hover:bg-[#3bceac] hover:text-[#1a1a2e] transition-colors"
            style={{ fontFamily: "'Press Start 2P'", fontSize: '7px', color: '#3bceac' }}
          >
            ✕ COLLAPSE
          </button>
        </div>
        <TryItOutSection />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div
        className="flex items-center justify-center gap-4 py-3 px-6 border-2 border-[#0ead69] rounded-lg"
        style={{
          background: 'rgba(14, 173, 105, 0.1)',
        }}
      >
        {/* Keyboard icon and layout name */}
        <div className="flex items-center gap-2">
          <span style={{ fontSize: '16px' }}>⌨</span>
          <span
            style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '10px',
              color: '#0ead69',
            }}
          >
            {layoutConfig.name.toUpperCase()}
          </span>
        </div>

        {/* Divider */}
        <div
          style={{
            width: '2px',
            height: '20px',
            background: '#3bceac',
            opacity: 0.3,
          }}
        />

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={resetDetection}
            className="hover:underline"
            style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '7px',
              color: '#3bceac',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            CHANGE
          </button>

          <button
            onClick={() => setExpanded(true)}
            className="hover:underline"
            style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '7px',
              color: '#3bceac',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            TRY IT
          </button>
        </div>
      </div>
    </div>
  );
}
