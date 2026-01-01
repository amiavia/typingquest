/**
 * PRP-051: New Year 2026 Promotion Banner
 *
 * Displays a promotional banner for the New Year sale (Jan 1-14, 2026)
 * with countdown timer and link to premium page.
 */

import { useState, useEffect } from 'react';

// Promotion end date: Jan 14, 2026 23:59:59 UTC
const PROMO_END_DATE = new Date('2026-01-14T23:59:59Z').getTime();
const PROMO_START_DATE = new Date('2026-01-01T00:00:00Z').getTime();
const PROMO_CODE = 'NEWYEAR26';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(): TimeLeft | null {
  const now = Date.now();

  // Check if promotion is active
  if (now < PROMO_START_DATE || now > PROMO_END_DATE) {
    return null;
  }

  const difference = PROMO_END_DATE - now;

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

export function NewYearBanner() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(calculateTimeLeft());
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem('typebit8_newyear_banner_dismissed') === 'true';
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Don't show if dismissed, promotion not active, or ended
  if (dismissed || !timeLeft) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('typebit8_newyear_banner_dismissed', 'true');
  };

  const handleClick = () => {
    // Navigate to premium page
    window.location.href = '/premium';
  };

  // Format countdown
  const countdownText = timeLeft.days > 0
    ? `${timeLeft.days}d ${timeLeft.hours}h`
    : `${timeLeft.hours}h ${timeLeft.minutes}m`;

  return (
    <div
      className="w-full py-2 px-4 flex items-center justify-center gap-3 relative cursor-pointer"
      onClick={handleClick}
      style={{
        background: 'linear-gradient(90deg, rgba(255, 217, 61, 0.15) 0%, rgba(59, 206, 172, 0.15) 50%, rgba(255, 107, 157, 0.15) 100%)',
        borderBottom: '2px solid rgba(255, 217, 61, 0.4)',
      }}
    >
      {/* Confetti emoji */}
      <span style={{ fontSize: '14px' }}>🎉</span>

      {/* Main text */}
      <span
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '7px',
          color: 'var(--accent-yellow)',
        }}
      >
        NEW YEAR SALE: 50% OFF PREMIUM
      </span>

      {/* Divider */}
      <span
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '7px',
          color: 'var(--text-muted)',
        }}
      >
        |
      </span>

      {/* Promo code */}
      <span
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '7px',
          color: 'var(--accent-cyan)',
        }}
      >
        CODE: {PROMO_CODE}
      </span>

      {/* Divider */}
      <span
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '7px',
          color: 'var(--text-muted)',
        }}
      >
        |
      </span>

      {/* Countdown */}
      <span
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '7px',
          color: 'var(--accent-pink)',
        }}
      >
        ⏰ {countdownText}
      </span>

      {/* Dismiss button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDismiss();
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '10px',
          color: 'var(--text-muted)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
        }}
        aria-label="Dismiss banner"
      >
        ×
      </button>
    </div>
  );
}
