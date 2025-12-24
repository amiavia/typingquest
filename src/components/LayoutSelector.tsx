import { useState } from 'react';
import type { KeyboardLayoutType } from '../data/keyboardLayouts';
import { KEYBOARD_LAYOUTS, getLayoutRegions, getLayoutsByRegion } from '../data/keyboardLayouts';

interface LayoutSelectorProps {
  currentLayout: KeyboardLayoutType;
  onLayoutChange: (layout: KeyboardLayoutType) => void;
  isOpen: boolean;
  onClose: () => void;
  onDetect: () => void;
}

export function LayoutSelector({ currentLayout, onLayoutChange, isOpen, onClose, onDetect }: LayoutSelectorProps) {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  if (!isOpen) return null;

  const regions = getLayoutRegions();

  // If a region is selected, show layouts for that region
  if (selectedRegion) {
    const layouts = getLayoutsByRegion(selectedRegion);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/80" onClick={onClose} />

        <div className="relative pixel-box p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setSelectedRegion(null)}
              className="pixel-btn"
              style={{ fontSize: '10px', padding: '8px 12px' }}
            >
              ← BACK
            </button>
            <h2 style={{ fontFamily: "'Press Start 2P'", fontSize: '12px', color: '#ffd93d' }}>
              {selectedRegion.toUpperCase()}
            </h2>
            <button
              onClick={onClose}
              className="pixel-btn pixel-btn-red"
              style={{ fontSize: '10px', padding: '8px 12px' }}
            >
              X
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {layouts.map(layout => (
              <button
                key={layout.id}
                onClick={() => {
                  onLayoutChange(layout.id);
                  onClose();
                }}
                className={`
                  w-full p-3 text-left transition-all border-4
                  ${currentLayout === layout.id
                    ? 'border-[#ffd93d] bg-[#ffd93d]/10'
                    : 'border-[#3bceac] bg-[#1a1a2e] hover:bg-[#3bceac]/10'
                  }
                `}
                style={{ boxShadow: '4px 4px 0 #0f0f1b' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: currentLayout === layout.id ? '#ffd93d' : '#eef5db' }}>
                      {layout.name}
                    </h3>
                    <p style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: '#3bceac', marginTop: '4px' }}>
                      {layout.description}
                    </p>
                  </div>
                  {currentLayout === layout.id && (
                    <span style={{ fontFamily: "'Press Start 2P'", fontSize: '14px', color: '#ffd93d' }}>
                      ★
                    </span>
                  )}
                </div>

                {/* Preview of home row */}
                <div className="flex gap-0.5 mt-2">
                  {layout.rows[1].map((key, idx) => (
                    <div
                      key={idx}
                      className="w-4 h-4 flex items-center justify-center border"
                      style={{
                        fontFamily: "'Press Start 2P'",
                        fontSize: '5px',
                        borderColor: currentLayout === layout.id ? '#ffd93d' : '#3bceac',
                        backgroundColor: idx === 3 || idx === 6 ? 'rgba(255, 217, 61, 0.2)' : 'rgba(59, 206, 172, 0.1)',
                        color: '#eef5db'
                      }}
                    >
                      {key.toUpperCase()}
                    </div>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show region selection
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />

      <div className="relative pixel-box p-6 max-w-lg w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 style={{ fontFamily: "'Press Start 2P'", fontSize: '14px', color: '#ffd93d' }}>
            KEYBOARD LAYOUT
          </h2>
          <button
            onClick={onClose}
            className="pixel-btn pixel-btn-red"
            style={{ fontSize: '10px', padding: '8px 12px' }}
          >
            X
          </button>
        </div>

        {/* Current layout display */}
        <div className="pixel-box pixel-box-green p-3 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#3bceac' }}>CURRENT:</p>
              <p style={{ fontFamily: "'Press Start 2P'", fontSize: '12px', color: '#0ead69', marginTop: '4px' }}>
                {KEYBOARD_LAYOUTS[currentLayout].name}
              </p>
            </div>
            <span style={{ fontSize: '24px' }}>⌨</span>
          </div>
        </div>

        {/* Region buttons */}
        <div className="space-y-3 mb-6">
          <p style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#3bceac', marginBottom: '8px' }}>
            SELECT REGION:
          </p>
          {regions.map(region => {
            const layoutCount = getLayoutsByRegion(region).length;
            const hasCurrentLayout = getLayoutsByRegion(region).some(l => l.id === currentLayout);

            return (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`
                  w-full p-4 text-left transition-all border-4
                  ${hasCurrentLayout
                    ? 'border-[#0ead69] bg-[#0ead69]/10'
                    : 'border-[#3bceac] bg-[#1a1a2e] hover:bg-[#3bceac]/10'
                  }
                `}
                style={{ boxShadow: '4px 4px 0 #0f0f1b' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 style={{ fontFamily: "'Press Start 2P'", fontSize: '12px', color: hasCurrentLayout ? '#0ead69' : '#eef5db' }}>
                      {region === 'Americas' ? '🌎 ' : region === 'Europe' ? '🌍 ' : region === 'Asia' ? '🌏 ' : '⌨ '}
                      {region.toUpperCase()}
                    </h3>
                    <p style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#3bceac', marginTop: '4px' }}>
                      {layoutCount} LAYOUT{layoutCount > 1 ? 'S' : ''}
                    </p>
                  </div>
                  <span style={{ fontFamily: "'Press Start 2P'", fontSize: '16px', color: '#3bceac' }}>
                    →
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Auto-detect button */}
        <div className="pt-4 border-t-2 border-[#3bceac]">
          <button
            onClick={() => {
              onClose();
              onDetect();
            }}
            className="w-full pixel-btn pixel-btn-yellow"
            style={{ fontSize: '10px' }}
          >
            🔍 AUTO-DETECT MY LAYOUT
          </button>
          <p
            className="mt-3 text-center"
            style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: '#4a4a6e' }}
          >
            TYPE YOUR HOME ROW TO DETECT
          </p>
        </div>
      </div>
    </div>
  );
}

// Settings button component
interface SettingsButtonProps {
  onClick: () => void;
}

export function SettingsButton({ onClick }: SettingsButtonProps) {
  return (
    <button
      onClick={onClick}
      className="pixel-btn"
      style={{ fontSize: '10px', padding: '8px 12px' }}
      title="Settings"
    >
      ⚙
    </button>
  );
}
