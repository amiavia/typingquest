import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "@clerk/clerk-react";
import { useState } from "react";
import { StreakDisplay } from "./StreakDisplay";

interface StreakSectionProps {
  onPurchaseFreeze?: () => void;
}

export function StreakSection({ onPurchaseFreeze }: StreakSectionProps) {
  const { userId } = useAuth();
  const [showDetails, setShowDetails] = useState(false);

  // Get streak info
  const streak = useQuery(
    api.streaks.getStreak,
    userId ? { clerkId: userId } : "skip"
  );

  // Purchase freeze mutation
  const purchaseFreeze = useMutation(api.streaks.purchaseStreakFreeze);

  if (!userId) {
    return null;
  }

  if (!streak) {
    return (
      <div className="pixel-box p-4 animate-pulse">
        <div className="h-4 bg-[#4a4a6e] rounded w-1/2" />
      </div>
    );
  }

  // Determine streak status message
  const getStreakMessage = () => {
    if (streak.currentStreak === 0) {
      return "Start your streak today!";
    }
    if (streak.isActiveToday) {
      return `${streak.currentStreak} day streak! Keep it up!`;
    }
    if (streak.isAtRisk) {
      return "Practice today to keep your streak!";
    }
    return `${streak.currentStreak} day streak!`;
  };

  // Calculate next milestone
  const getNextMilestone = () => {
    const current = streak.currentStreak;
    if (current < 7) return { target: 7, reward: "2x coins" };
    if (current < 30) return { target: 30, reward: "3x coins" };
    if (current < 100) return { target: 100, reward: "Special badge" };
    return { target: 365, reward: "Legend status" };
  };

  const milestone = getNextMilestone();
  const progressToMilestone = Math.min(
    100,
    (streak.currentStreak / milestone.target) * 100
  );

  const handlePurchaseFreeze = async () => {
    if (userId) {
      try {
        await purchaseFreeze({ clerkId: userId });
        onPurchaseFreeze?.();
      } catch (error) {
        console.error("Failed to purchase freeze:", error);
      }
    }
  };

  return (
    <section
      className="pixel-box p-4"
      style={{ fontFamily: "'Press Start 2P'" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3
          className="flex items-center gap-2"
          style={{ fontSize: "10px", color: "#eef5db" }}
        >
          <span>🔥</span>
          <span>STREAK</span>
        </h3>
        <StreakDisplay
          streak={streak.currentStreak}
          freezeCount={streak.streakFreezeCount}
          longestStreak={streak.longestStreak}
          showDetails={true}
        />
      </div>

      {/* Status Message */}
      <p
        className="mb-4"
        style={{
          fontSize: "8px",
          color: streak.isAtRisk ? "#ff6b9d" : "#3bceac",
          animation: streak.isAtRisk ? "pulse 1s infinite" : "none",
        }}
      >
        {getStreakMessage().toUpperCase()}
      </p>

      {/* Milestone Progress */}
      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <span style={{ fontSize: "6px", color: "#4a4a6e" }}>
            NEXT: {milestone.target} DAYS
          </span>
          <span style={{ fontSize: "6px", color: "#ffd93d" }}>
            {milestone.reward.toUpperCase()}
          </span>
        </div>
        <div className="h-2 bg-[#16213e] border border-[#3bceac]">
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${progressToMilestone}%`,
              background: "linear-gradient(90deg, #f97316, #ffd93d)",
            }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span style={{ fontSize: "6px", color: "#eef5db" }}>
            {streak.currentStreak} / {milestone.target}
          </span>
          <span style={{ fontSize: "6px", color: "#4a4a6e" }}>
            {milestone.target - streak.currentStreak} TO GO
          </span>
        </div>
      </div>

      {/* Streak Freezes */}
      <div
        className="flex items-center justify-between py-2 px-3 border border-[#3bceac]"
        style={{ backgroundColor: "rgba(59, 206, 172, 0.1)" }}
      >
        <div className="flex items-center gap-2">
          <span>🧊</span>
          <span style={{ fontSize: "8px", color: "#eef5db" }}>
            STREAK FREEZES: {streak.streakFreezeCount}
          </span>
        </div>
        <button
          onClick={handlePurchaseFreeze}
          className="px-2 py-1 border border-[#ffd93d] hover:bg-[#ffd93d] hover:text-[#1a1a2e] transition-colors"
          style={{ fontSize: "6px", color: "#ffd93d" }}
        >
          BUY (75$)
        </button>
      </div>

      {/* Streak Stats */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-[#4a4a6e]">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div style={{ fontSize: "12px", color: "#ffd93d" }}>
                {streak.currentStreak}
              </div>
              <div style={{ fontSize: "6px", color: "#4a4a6e" }}>CURRENT</div>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "#ff6b9d" }}>
                {streak.longestStreak}
              </div>
              <div style={{ fontSize: "6px", color: "#4a4a6e" }}>LONGEST</div>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "#3bceac" }}>
                {streak.totalDaysActive}
              </div>
              <div style={{ fontSize: "6px", color: "#4a4a6e" }}>TOTAL</div>
            </div>
          </div>
        </div>
      )}

      {/* Toggle details button */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full mt-3 text-center"
        style={{ fontSize: "6px", color: "#4a4a6e" }}
      >
        {showDetails ? "HIDE DETAILS" : "SHOW DETAILS"}
      </button>
    </section>
  );
}
