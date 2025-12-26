import { useEffect, useState } from 'react';
import { usePowerUps } from '../providers/PowerUpProvider';

const POWER_UP_INFO: Record<string, { name: string; icon: string; color: string }> = {
  'xp-boost': { name: 'XP BOOST', icon: '⚡', color: '#ffd93d' },
  'coin-magnet': { name: 'COIN MAGNET', icon: '🧲', color: '#f4a261' },
  'hint-token': { name: 'HINTS', icon: '💡', color: '#3bceac' },
  'streak-freeze': { name: 'STREAK FREEZE', icon: '❄️', color: '#48cae4' },
};

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function ActivePowerUps() {
  const { activePowerUps, xpMultiplier, coinMultiplier } = usePowerUps();
  const [, setTick] = useState(0);

  // Update every second for timers
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  if (activePowerUps.length === 0) {
    return null;
  }

  const now = Date.now();

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {activePowerUps.map((powerUp) => {
        const info = POWER_UP_INFO[powerUp.powerUpType];
        if (!info) return null;

        const timeRemaining = powerUp.expiresAt ? powerUp.expiresAt - now : null;
        const isExpiringSoon = timeRemaining !== null && timeRemaining < 5 * 60 * 1000; // < 5 min

        return (
          <div
            key={powerUp._id}
            className="flex items-center gap-2 px-3 py-1.5 rounded"
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '8px',
              backgroundColor: 'rgba(0,0,0,0.6)',
              border: `2px solid ${info.color}`,
              boxShadow: `0 0 10px ${info.color}40`,
              animation: isExpiringSoon ? 'pulse 1s infinite' : undefined,
            }}
          >
            <span style={{ fontSize: '12px' }}>{info.icon}</span>
            <div className="flex flex-col">
              <span style={{ color: info.color }}>{info.name}</span>
              {timeRemaining !== null && timeRemaining > 0 && (
                <span style={{ color: isExpiringSoon ? '#e63946' : '#eef5db' }}>
                  {formatTime(timeRemaining)}
                </span>
              )}
              {powerUp.remainingUses !== undefined && (
                <span style={{ color: '#eef5db' }}>
                  x{powerUp.remainingUses}
                </span>
              )}
            </div>
          </div>
        );
      })}

      {/* Show multipliers if active */}
      {(xpMultiplier > 1 || coinMultiplier > 1) && (
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded"
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '8px',
            backgroundColor: 'rgba(0,0,0,0.6)',
            border: '2px solid #ff6b9d',
            boxShadow: '0 0 10px #ff6b9d40',
          }}
        >
          <span style={{ fontSize: '12px' }}>📈</span>
          <div className="flex flex-col" style={{ color: '#ff6b9d' }}>
            {xpMultiplier > 1 && <span>XP x{xpMultiplier}</span>}
            {coinMultiplier > 1 && <span>COINS x{coinMultiplier}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

// Compact version for in-game display
export function ActivePowerUpsCompact() {
  const { xpMultiplier, coinMultiplier, getHintTokensRemaining, hasActivePowerUp } = usePowerUps();
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const hasXpBoost = xpMultiplier > 1;
  const hasCoinMagnet = coinMultiplier > 1;
  const hintTokens = getHintTokensRemaining();
  const hasStreakFreeze = hasActivePowerUp('streak-freeze');

  if (!hasXpBoost && !hasCoinMagnet && hintTokens === 0 && !hasStreakFreeze) {
    return null;
  }

  return (
    <div className="flex gap-2">
      {hasXpBoost && (
        <span
          title={`XP Boost Active (x${xpMultiplier})`}
          style={{ fontSize: '16px', filter: 'drop-shadow(0 0 4px #ffd93d)' }}
        >
          ⚡
        </span>
      )}
      {hasCoinMagnet && (
        <span
          title={`Coin Magnet Active (x${coinMultiplier})`}
          style={{ fontSize: '16px', filter: 'drop-shadow(0 0 4px #f4a261)' }}
        >
          🧲
        </span>
      )}
      {hintTokens > 0 && (
        <span
          title={`${hintTokens} Hint Tokens`}
          style={{ fontSize: '16px', filter: 'drop-shadow(0 0 4px #3bceac)' }}
        >
          💡
        </span>
      )}
      {hasStreakFreeze && (
        <span
          title="Streak Freeze Available"
          style={{ fontSize: '16px', filter: 'drop-shadow(0 0 4px #48cae4)' }}
        >
          ❄️
        </span>
      )}
    </div>
  );
}
