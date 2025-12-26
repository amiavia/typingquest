import { useState, useEffect } from 'react';

const LOADING_MESSAGES = [
  "WARMING UP FINGERS...",
  "LOADING PIXELS...",
  "CALIBRATING KEYBOARD...",
  "PREPARING CHALLENGE...",
  "POWERING UP...",
  "INSERTING COIN...",
  "LOADING LEVEL...",
  "BUFFERING AWESOMENESS...",
  "COMPILING FUN...",
  "INITIALIZING TYPING MODE...",
];

const TIPS = [
  "TIP: Keep your fingers on the home row!",
  "TIP: Don't look at your keyboard!",
  "TIP: Practice makes perfect!",
  "TIP: Speed comes with accuracy!",
  "TIP: Take breaks to avoid fatigue!",
  "TIP: Use all 10 fingers for max speed!",
  "FUN FACT: The average typing speed is 40 WPM",
  "FUN FACT: The world record is 216 WPM!",
  "PRO TIP: Rhythm is key to fast typing!",
];

interface RetroLoadingScreenProps {
  message?: string;
}

export function RetroLoadingScreen({ message }: RetroLoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [loadingMessage] = useState(() =>
    message || LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]
  );
  const [tip] = useState(() =>
    TIPS[Math.floor(Math.random() * TIPS.length)]
  );

  // Animate progress bar
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        // Accelerate towards the end
        const increment = prev < 60 ? 8 : prev < 80 ? 12 : 20;
        return Math.min(prev + increment, 100);
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Calculate filled blocks (out of 20)
  const filledBlocks = Math.floor(progress / 5);
  const progressBar = '█'.repeat(filledBlocks) + '░'.repeat(20 - filledBlocks);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#0f0f1b',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      {/* Scanline effect */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.1) 0px, rgba(0,0,0,0.1) 1px, transparent 1px, transparent 2px)',
          pointerEvents: 'none',
        }}
      />

      {/* Pixel art decoration */}
      <div
        style={{
          fontSize: '48px',
          marginBottom: '32px',
          animation: 'bounce 0.5s infinite alternate',
        }}
      >
        ⌨️
      </div>

      {/* Loading message */}
      <h2
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '16px',
          color: '#ffd93d',
          textShadow: '0 0 20px rgba(255, 217, 61, 0.5)',
          marginBottom: '24px',
          animation: 'pulse 1s infinite',
        }}
      >
        {loadingMessage}
      </h2>

      {/* Progress bar container */}
      <div
        style={{
          background: '#1a1a2e',
          border: '3px solid #3bceac',
          borderRadius: '4px',
          padding: '8px 16px',
          marginBottom: '16px',
        }}
      >
        <div
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '12px',
            color: '#0ead69',
            letterSpacing: '2px',
          }}
        >
          [{progressBar}]
        </div>
      </div>

      {/* Percentage */}
      <div
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '10px',
          color: '#3bceac',
          marginBottom: '32px',
        }}
      >
        {progress}%
      </div>

      {/* Tip */}
      <div
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '8px',
          color: '#6a6a8e',
          maxWidth: '400px',
          textAlign: 'center',
          lineHeight: '1.6',
        }}
      >
        {tip}
      </div>

      {/* Decorative corners */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', width: '24px', height: '24px', borderTop: '4px solid #3bceac', borderLeft: '4px solid #3bceac' }} />
      <div style={{ position: 'absolute', top: '20px', right: '20px', width: '24px', height: '24px', borderTop: '4px solid #3bceac', borderRight: '4px solid #3bceac' }} />
      <div style={{ position: 'absolute', bottom: '20px', left: '20px', width: '24px', height: '24px', borderBottom: '4px solid #3bceac', borderLeft: '4px solid #3bceac' }} />
      <div style={{ position: 'absolute', bottom: '20px', right: '20px', width: '24px', height: '24px', borderBottom: '4px solid #3bceac', borderRight: '4px solid #3bceac' }} />

      {/* Animation keyframes */}
      <style>{`
        @keyframes bounce {
          from { transform: translateY(0); }
          to { transform: translateY(-10px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
