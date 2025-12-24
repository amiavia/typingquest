import { useState } from "react";

interface StreakDisplayProps {
  streak: number;
  freezeCount?: number;
  longestStreak?: number;
  showDetails?: boolean;
  onClick?: () => void;
}

export function StreakDisplay({
  streak,
  freezeCount = 0,
  longestStreak,
  showDetails = false,
  onClick,
}: StreakDisplayProps) {
  const [showModal, setShowModal] = useState(false);

  // Determine fire level based on streak
  const getFireLevel = () => {
    if (streak >= 30) return 3; // Legendary fire
    if (streak >= 7) return 2; // Strong fire
    if (streak > 0) return 1; // Normal fire
    return 0; // No fire
  };

  const fireLevel = getFireLevel();

  // Fire colors based on level
  const fireColors = {
    0: "#4a4a6e",
    1: "#f97316", // orange
    2: "#ef4444", // red
    3: "#ffd93d", // gold
  };

  const fireColor = fireColors[fireLevel as keyof typeof fireColors];

  // Fire animation styles
  const fireStyle = {
    color: fireColor,
    textShadow:
      fireLevel > 0
        ? `0 0 ${5 + fireLevel * 5}px ${fireColor}, 0 0 ${10 + fireLevel * 5}px ${fireColor}`
        : "none",
    animation: fireLevel > 1 ? "pulse 1s infinite" : "none",
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (showDetails) {
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={!onClick && !showDetails}
        className={`
          flex items-center gap-2 px-3 py-2
          ${onClick || showDetails ? "cursor-pointer hover:scale-105 transition-transform" : "cursor-default"}
        `}
        style={{
          fontFamily: "'Press Start 2P', monospace",
          backgroundColor:
            fireLevel > 0 ? `${fireColor}20` : "rgba(74, 74, 110, 0.2)",
          border: `2px solid ${fireLevel > 0 ? fireColor : "#4a4a6e"}`,
        }}
      >
        {/* Fire icon */}
        <span style={{ ...fireStyle, fontSize: "14px" }}>
          {streak > 0 ? "🔥" : "❄️"}
        </span>

        {/* Streak count */}
        <span
          style={{
            fontSize: "10px",
            color: fireLevel > 0 ? fireColor : "#4a4a6e",
          }}
        >
          {streak}
        </span>

        {/* Freeze indicator */}
        {freezeCount > 0 && (
          <span
            className="flex items-center gap-1 ml-1"
            style={{
              fontSize: "8px",
              color: "#3bceac",
            }}
          >
            <span>🧊</span>
            <span>{freezeCount}</span>
          </span>
        )}
      </button>

      {/* Details Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
          onClick={() => setShowModal(false)}
        >
          <div
            className="pixel-box p-6 max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
            style={{ fontFamily: "'Press Start 2P', monospace" }}
          >
            <h3
              className="text-center mb-6"
              style={{ fontSize: "12px", color: "#eef5db" }}
            >
              STREAK STATS
            </h3>

            <div className="space-y-4">
              {/* Current Streak */}
              <div className="flex justify-between items-center">
                <span style={{ fontSize: "8px", color: "#3bceac" }}>
                  CURRENT STREAK
                </span>
                <span style={{ ...fireStyle, fontSize: "12px" }}>
                  🔥 {streak}
                </span>
              </div>

              {/* Longest Streak */}
              {longestStreak !== undefined && (
                <div className="flex justify-between items-center">
                  <span style={{ fontSize: "8px", color: "#3bceac" }}>
                    LONGEST STREAK
                  </span>
                  <span style={{ fontSize: "10px", color: "#ffd93d" }}>
                    ⭐ {longestStreak}
                  </span>
                </div>
              )}

              {/* Streak Freezes */}
              <div className="flex justify-between items-center">
                <span style={{ fontSize: "8px", color: "#3bceac" }}>
                  STREAK FREEZES
                </span>
                <span style={{ fontSize: "10px", color: "#3bceac" }}>
                  🧊 {freezeCount}
                </span>
              </div>

              {/* Streak Multiplier */}
              <div className="flex justify-between items-center">
                <span style={{ fontSize: "8px", color: "#3bceac" }}>
                  COIN MULTIPLIER
                </span>
                <span style={{ fontSize: "10px", color: "#ffd93d" }}>
                  {streak >= 30 ? "3x" : streak >= 7 ? "2x" : "1x"}
                </span>
              </div>

              {/* Next Milestone */}
              <div className="flex justify-between items-center">
                <span style={{ fontSize: "8px", color: "#3bceac" }}>
                  NEXT MILESTONE
                </span>
                <span style={{ fontSize: "10px", color: "#ff6b9d" }}>
                  {streak < 7
                    ? `${7 - streak} days`
                    : streak < 30
                      ? `${30 - streak} days`
                      : streak < 100
                        ? `${100 - streak} days`
                        : "MAX!"}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full mt-6 py-2 border-2 border-[#3bceac] hover:bg-[#3bceac] hover:text-[#1a1a2e] transition-colors"
              style={{ fontSize: "8px", color: "#3bceac" }}
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// Compact version for header
export function StreakBadge({
  streak,
  onClick,
}: {
  streak: number;
  onClick?: () => void;
}) {
  const isOnFire = streak > 0;

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`
        flex items-center gap-1
        ${onClick ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"}
      `}
      style={{ fontFamily: "'Press Start 2P', monospace" }}
    >
      <span style={{ fontSize: "12px" }}>{isOnFire ? "🔥" : "❄️"}</span>
      <span
        style={{
          fontSize: "8px",
          color: isOnFire ? "#f97316" : "#4a4a6e",
        }}
      >
        {streak}
      </span>
    </button>
  );
}
