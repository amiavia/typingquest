import { useAccessibilityMode } from '../providers/AccessibilityModeProvider';

interface AccessibilityModeToggleProps {
  className?: string;
}

export function AccessibilityModeToggle({ className = '' }: AccessibilityModeToggleProps) {
  const { mode, toggle } = useAccessibilityMode();
  const isMuted = mode === 'muted';

  return (
    <button
      onClick={toggle}
      className={className}
      aria-label={isMuted ? 'Switch to vibrant mode' : 'Switch to muted mode'}
      title={isMuted ? 'Vibrant mode' : 'Calm mode'}
      style={{
        fontFamily: "'Press Start 2P', monospace",
        fontSize: '10px',
        padding: '6px 10px',
        background: 'transparent',
        border: '2px solid var(--border-color)',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        transition: 'all 0.2s ease',
        borderRadius: '4px',
        minWidth: '36px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--bg-secondary)';
        e.currentTarget.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {isMuted ? (
        // Sun icon for vibrant mode (currently in muted)
        <span style={{ fontSize: '12px' }} role="img" aria-hidden="true">
          ☼
        </span>
      ) : (
        // Half-moon/dim icon for muted mode (currently vibrant)
        <span style={{ fontSize: '12px' }} role="img" aria-hidden="true">
          ◐
        </span>
      )}
    </button>
  );
}
