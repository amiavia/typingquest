import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "@clerk/clerk-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { StreakDisplay } from "./StreakDisplay";

interface StreakSectionProps {
  onPurchaseFreeze?: () => void;
}

export function StreakSection({ onPurchaseFreeze }: StreakSectionProps) {
  const { t } = useTranslation();
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
      return t('streak.startToday');
    }
    if (streak.isActiveToday) {
      return t('streak.keepItUp', { days: streak.currentStreak });
    }
    if (streak.isAtRisk) {
      return t('streak.practiceToday');
    }
    return t('streak.dayStreak', { days: streak.currentStreak });
  };

  // Calculate next milestone
  const getNextMilestone = () => {
    const current = streak.currentStreak;
    if (current < 7) return { target: 7, reward: t('streak.reward2xCoins') };
    if (current < 30) return { target: 30, reward: t('streak.reward3xCoins') };
    if (current < 100) return { target: 100, reward: t('streak.rewardBadge') };
    return { target: 365, reward: t('streak.rewardLegend') };
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
          <span>{t('streak.title')}</span>
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
            {t('streak.next')}: {milestone.target} {t('streak.days')}
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
            {milestone.target - streak.currentStreak} {t('streak.toGo')}
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
            {t('streak.freezes')}: {streak.streakFreezeCount}
          </span>
        </div>
        <button
          onClick={handlePurchaseFreeze}
          className="px-2 py-1 border border-[#ffd93d] hover:bg-[#ffd93d] hover:text-[#1a1a2e] transition-colors"
          style={{ fontSize: "6px", color: "#ffd93d" }}
        >
          {t('streak.buy')} (75$)
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
              <div style={{ fontSize: "6px", color: "#4a4a6e" }}>{t('streak.current')}</div>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "#ff6b9d" }}>
                {streak.longestStreak}
              </div>
              <div style={{ fontSize: "6px", color: "#4a4a6e" }}>{t('streak.longest')}</div>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "#3bceac" }}>
                {streak.totalDaysActive}
              </div>
              <div style={{ fontSize: "6px", color: "#4a4a6e" }}>{t('streak.total')}</div>
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
        {showDetails ? t('streak.hideDetails') : t('streak.showDetails')}
      </button>
    </section>
  );
}
