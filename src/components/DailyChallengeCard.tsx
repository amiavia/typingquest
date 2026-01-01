import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface DailyChallenge {
  _id?: string;
  date: string;
  challengeType: string;
  title: string;
  description: string;
  targetValue: number;
  targetKeys?: string[];
  rewards: {
    bronze: number;
    silver: number;
    gold: number;
    xp: number;
  };
}

interface ChallengeProgress {
  status: "not_started" | "pending" | "bronze" | "silver" | "gold";
  bestValue: number;
  attempts: number;
  rewardsClaimed: boolean;
}

interface DailyChallengeCardProps {
  challenge: DailyChallenge;
  progress?: ChallengeProgress;
  onStart?: () => void;
  onClaim?: () => void;
  compact?: boolean;
}

export function DailyChallengeCard({
  challenge,
  progress,
  onStart,
  onClaim,
  compact = false,
}: DailyChallengeCardProps) {
  const { t } = useTranslation();
  const [timeRemaining, setTimeRemaining] = useState("");

  // Calculate time until midnight (UTC)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setUTCDate(midnight.getUTCDate() + 1);
      midnight.setUTCHours(0, 0, 0, 0);

      const diff = midnight.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeRemaining(`${hours}h ${minutes}m`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Get tier thresholds
  const getTierProgress = () => {
    const value = progress?.bestValue ?? 0;
    const target = challenge.targetValue;

    return {
      bronze: Math.min(100, (value / (target * 0.5)) * 100),
      silver: Math.min(100, (value / (target * 0.75)) * 100),
      gold: Math.min(100, (value / target) * 100),
    };
  };

  const tierProgress = getTierProgress();

  // Get challenge type icon
  const getTypeIcon = () => {
    switch (challenge.challengeType) {
      case "speed":
        return "⚡";
      case "accuracy":
        return "🎯";
      case "endurance":
        return "💪";
      case "keys":
        return "⌨️";
      default:
        return "📋";
    }
  };

  // Get tier color
  const getTierColor = (tier: string) => {
    switch (tier) {
      case "gold":
        return "#ffd93d";
      case "silver":
        return "#c0c0c0";
      case "bronze":
        return "#cd7f32";
      default:
        return "#4a4a6e";
    }
  };

  const currentTier = progress?.status ?? "not_started";
  const canClaim =
    currentTier !== "not_started" &&
    currentTier !== "pending" &&
    !progress?.rewardsClaimed;

  if (compact) {
    return (
      <button
        onClick={onStart}
        disabled={!onStart}
        className={`
          flex items-center gap-3 px-3 py-2 w-full
          ${onStart ? "cursor-pointer hover:scale-[1.02] transition-transform" : "cursor-default"}
        `}
        style={{
          fontFamily: "'Press Start 2P', monospace",
          backgroundColor: "rgba(59, 206, 172, 0.1)",
          border: "2px solid #3bceac",
        }}
      >
        <span style={{ fontSize: "14px" }}>{getTypeIcon()}</span>
        <div className="flex-1 text-left">
          <div style={{ fontSize: "8px", color: "#eef5db" }}>
            {challenge.title}
          </div>
          <div style={{ fontSize: "6px", color: "#3bceac" }}>
            {t('challenge.timeLeft', { time: timeRemaining })}
          </div>
        </div>
        {currentTier !== "not_started" && currentTier !== "pending" && (
          <span style={{ color: getTierColor(currentTier), fontSize: "10px" }}>
            {currentTier === "gold" ? "🥇" : currentTier === "silver" ? "🥈" : "🥉"}
          </span>
        )}
      </button>
    );
  }

  return (
    <div
      className="pixel-box p-4"
      style={{ fontFamily: "'Press Start 2P', monospace" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 flex items-center justify-center border-2 border-[#3bceac]"
            style={{
              backgroundColor: "rgba(59, 206, 172, 0.2)",
              fontSize: "16px",
            }}
          >
            {getTypeIcon()}
          </div>
          <div>
            <h3 style={{ fontSize: "10px", color: "#eef5db", marginBottom: "4px" }}>
              {challenge.title}
            </h3>
            <p style={{ fontSize: "6px", color: "#3bceac" }}>
              {t('challenge.daily')}
            </p>
          </div>
        </div>

        {/* Timer */}
        <div className="text-right">
          <div style={{ fontSize: "6px", color: "#ff6b9d" }}>{t('challenge.endsIn')}</div>
          <div style={{ fontSize: "10px", color: "#ff6b9d" }}>
            {timeRemaining}
          </div>
        </div>
      </div>

      {/* Description */}
      <p
        className="mb-4"
        style={{ fontSize: "8px", color: "#eef5db", lineHeight: "1.8" }}
      >
        {challenge.description}
      </p>

      {/* Target Keys (if applicable) */}
      {challenge.targetKeys && challenge.targetKeys.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {challenge.targetKeys.map((key) => (
            <span
              key={key}
              className="w-6 h-6 flex items-center justify-center border-2 border-[#3bceac]"
              style={{
                fontSize: "10px",
                backgroundColor: "rgba(59, 206, 172, 0.1)",
                color: "#eef5db",
              }}
            >
              {key.toUpperCase()}
            </span>
          ))}
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <span style={{ fontSize: "6px", color: "#3bceac" }}>{t('challenge.progress')}</span>
          <span style={{ fontSize: "6px", color: "#eef5db" }}>
            {progress?.bestValue ?? 0} / {challenge.targetValue}
          </span>
        </div>

        {/* Multi-tier progress bar */}
        <div className="relative h-4 bg-[#16213e] border-2 border-[#3bceac]">
          {/* Bronze marker */}
          <div
            className="absolute top-0 bottom-0 w-0.5"
            style={{
              left: "50%",
              backgroundColor: "#cd7f32",
            }}
          />
          {/* Silver marker */}
          <div
            className="absolute top-0 bottom-0 w-0.5"
            style={{
              left: "75%",
              backgroundColor: "#c0c0c0",
            }}
          />
          {/* Progress fill */}
          <div
            className="absolute top-0 bottom-0 left-0 transition-all duration-500"
            style={{
              width: `${tierProgress.gold}%`,
              backgroundColor:
                tierProgress.gold >= 100
                  ? "#ffd93d"
                  : tierProgress.silver >= 100
                    ? "#c0c0c0"
                    : tierProgress.bronze >= 100
                      ? "#cd7f32"
                      : "#3bceac",
            }}
          />
        </div>

        {/* Tier labels */}
        <div className="flex justify-between mt-1">
          <span style={{ fontSize: "6px", color: "#cd7f32" }}>{t('challenge.bronze')}</span>
          <span style={{ fontSize: "6px", color: "#c0c0c0" }}>{t('challenge.silver')}</span>
          <span style={{ fontSize: "6px", color: "#ffd93d" }}>{t('challenge.gold')}</span>
        </div>
      </div>

      {/* Rewards */}
      <div
        className="flex justify-between items-center py-3 px-2 mb-4"
        style={{
          backgroundColor: "rgba(255, 217, 61, 0.1)",
          border: "2px solid #ffd93d",
        }}
      >
        <span style={{ fontSize: "6px", color: "#ffd93d" }}>{t('challenge.rewards')}</span>
        <div className="flex gap-4">
          <div className="text-center">
            <span
              style={{
                fontSize: "8px",
                color: "#cd7f32",
                display: "block",
              }}
            >
              🥉
            </span>
            <span style={{ fontSize: "6px", color: "#eef5db" }}>
              {challenge.rewards.bronze}$
            </span>
          </div>
          <div className="text-center">
            <span
              style={{
                fontSize: "8px",
                color: "#c0c0c0",
                display: "block",
              }}
            >
              🥈
            </span>
            <span style={{ fontSize: "6px", color: "#eef5db" }}>
              {challenge.rewards.silver}$
            </span>
          </div>
          <div className="text-center">
            <span
              style={{
                fontSize: "8px",
                color: "#ffd93d",
                display: "block",
              }}
            >
              🥇
            </span>
            <span style={{ fontSize: "6px", color: "#eef5db" }}>
              {challenge.rewards.gold}$
            </span>
          </div>
          <div className="text-center">
            <span
              style={{
                fontSize: "8px",
                color: "#3bceac",
                display: "block",
              }}
            >
              ⭐
            </span>
            <span style={{ fontSize: "6px", color: "#eef5db" }}>
              {challenge.rewards.xp} XP
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      {canClaim ? (
        <button
          onClick={onClaim}
          className="w-full py-3 border-4 border-[#ffd93d] hover:bg-[#ffd93d] hover:text-[#1a1a2e] transition-colors"
          style={{
            fontSize: "10px",
            color: "#ffd93d",
            boxShadow: "0 0 20px #ffd93d",
          }}
        >
          {t('challenge.claimRewards')}
        </button>
      ) : (
        <button
          onClick={onStart}
          disabled={!onStart}
          className={`
            w-full py-3 border-4 border-[#3bceac]
            ${onStart ? "hover:bg-[#3bceac] hover:text-[#1a1a2e]" : "opacity-50 cursor-not-allowed"}
            transition-colors
          `}
          style={{ fontSize: "10px", color: "#3bceac" }}
        >
          {progress?.status === "not_started" ? t('challenge.start') : t('challenge.continue')}
        </button>
      )}
    </div>
  );
}
