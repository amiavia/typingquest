/**
 * PRP-027 Task 4.3: Daily Challenge Gameplay View
 *
 * Dedicated view for playing the daily challenge.
 */

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "@clerk/clerk-react";
import { TypingArea } from "./TypingArea";
import { Keyboard } from "./Keyboard";
import { RewardPopup } from "./RewardPopup";
import type { TypingStats } from "../types";
import type { KeyboardLayoutType } from "../data/keyboardLayouts";

interface DailyChallengeViewProps {
  onBack: () => void;
  keyboardLayout: KeyboardLayoutType;
}

type TierStatus = "not_started" | "pending" | "bronze" | "silver" | "gold";

export function DailyChallengeView({
  onBack,
  keyboardLayout,
}: DailyChallengeViewProps) {
  const { userId } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [rewardData, setRewardData] = useState<{
    coins: number;
    xp: number;
    tier: TierStatus;
  } | null>(null);

  // Fetch today's challenge
  const challenge = useQuery(api.dailyChallenges.getTodaysChallenge);

  // Fetch user progress
  const progress = useQuery(
    api.dailyChallenges.getUserChallengeProgress,
    userId ? { clerkId: userId } : "skip"
  );

  // Mutations
  const submitAttempt = useMutation(api.dailyChallenges.submitChallengeAttempt);
  const claimRewards = useMutation(api.dailyChallenges.claimChallengeRewards);

  // Generate practice text based on challenge type
  const getChallengeText = (): string => {
    if (!challenge) return "";

    switch (challenge.challengeType) {
      case "speed":
        return "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.";
      case "accuracy":
        return "Accuracy is more important than speed when learning to type properly. Focus on each keystroke.";
      case "endurance":
        return "Endurance typing requires sustained focus. Keep your fingers relaxed and maintain a steady rhythm throughout.";
      case "keys":
        // Use targetKeys if available
        const keys = challenge.targetKeys?.join(" ") ?? "a s d f j k l ;";
        return `Practice these keys: ${keys} ${keys} ${keys}`;
      default:
        return "Type this sentence to complete the daily challenge.";
    }
  };

  // Get tier color
  const getTierColor = (tier: TierStatus): string => {
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

  // Handle typing completion
  const handleComplete = async (stats: TypingStats) => {
    if (!userId || !challenge) return;

    // Determine the value to submit based on challenge type
    let value: number;
    switch (challenge.challengeType) {
      case "speed":
        value = stats.wpm;
        break;
      case "accuracy":
        value = stats.accuracy;
        break;
      case "endurance":
        value = stats.correctChars;
        break;
      case "keys":
        // Keys challenges measure accuracy on the target keys
        value = stats.accuracy;
        break;
      default:
        value = stats.wpm;
    }

    try {
      const result = await submitAttempt({
        clerkId: userId,
        value,
      });

      if (result && result.tier !== "pending") {
        // Claim rewards
        const rewardResult = await claimRewards({ clerkId: userId });

        setRewardData({
          coins: rewardResult?.coins ?? 0,
          xp: rewardResult?.xp ?? 0,
          tier: result.tier as TierStatus,
        });
        setShowReward(true);
      }
    } catch (error) {
      console.error("Failed to submit challenge attempt:", error);
    }

    setIsPlaying(false);
  };

  if (!challenge) {
    return (
      <div className="max-w-4xl mx-auto text-center p-8">
        <div className="pixel-box p-8 animate-pulse">
          <p style={{ fontFamily: "'Press Start 2P'", fontSize: "10px", color: "#4a4a6e" }}>
            LOADING CHALLENGE...
          </p>
        </div>
      </div>
    );
  }

  const currentTier = progress?.status as TierStatus ?? "not_started";
  const currentValue = progress?.bestValue ?? 0;

  if (!isPlaying) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Reward Popup */}
        {showReward && rewardData && (
          <RewardPopup
            coins={rewardData.coins}
            xp={rewardData.xp}
            onClose={() => setShowReward(false)}
          />
        )}

        <button
          onClick={onBack}
          className="pixel-btn"
          style={{ fontSize: "10px" }}
        >
          ← BACK
        </button>

        {/* Challenge Header */}
        <div className="text-center">
          <h1
            style={{
              fontFamily: "'Press Start 2P'",
              fontSize: "16px",
              color: "#ffd93d",
            }}
            className="mb-4"
          >
            📋 DAILY CHALLENGE
          </h1>
          <p
            style={{
              fontFamily: "'Press Start 2P'",
              fontSize: "10px",
              color: "#3bceac",
            }}
          >
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            }).toUpperCase()}
          </p>
        </div>

        {/* Challenge Details */}
        <div className="pixel-box p-6">
          <div className="flex items-center gap-4 mb-4">
            <span style={{ fontSize: "32px" }}>
              {challenge.challengeType === "speed" && "⚡"}
              {challenge.challengeType === "accuracy" && "🎯"}
              {challenge.challengeType === "endurance" && "💪"}
              {challenge.challengeType === "keys" && "⌨️"}
            </span>
            <div>
              <h2
                style={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: "12px",
                  color: "#eef5db",
                }}
              >
                {challenge.title.toUpperCase()}
              </h2>
              <p
                style={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: "8px",
                  color: "#3bceac",
                  marginTop: "4px",
                }}
              >
                {challenge.description.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Target */}
          <div
            className="p-4 border-2 border-[#ffd93d] text-center"
            style={{ backgroundColor: "rgba(255, 217, 61, 0.1)" }}
          >
            <p
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: "8px",
                color: "#4a4a6e",
              }}
            >
              TARGET
            </p>
            <p
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: "24px",
                color: "#ffd93d",
              }}
            >
              {challenge.targetValue}
              {(challenge.challengeType === "accuracy" || challenge.challengeType === "keys") && "%"}
              {challenge.challengeType === "speed" && " WPM"}
            </p>
          </div>
        </div>

        {/* Tier Progress */}
        <div className="pixel-box p-6">
          <h3
            style={{
              fontFamily: "'Press Start 2P'",
              fontSize: "10px",
              color: "#eef5db",
              marginBottom: "16px",
            }}
          >
            TIER PROGRESS
          </h3>

          <div className="flex items-center justify-between mb-4">
            {/* Bronze */}
            <div className="text-center">
              <div
                className={`w-12 h-12 mx-auto border-4 flex items-center justify-center ${
                  currentTier === "bronze" ||
                  currentTier === "silver" ||
                  currentTier === "gold"
                    ? "bg-[#cd7f32]"
                    : ""
                }`}
                style={{ borderColor: "#cd7f32" }}
              >
                <span style={{ fontSize: "20px" }}>🥉</span>
              </div>
              <p
                style={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: "6px",
                  color: "#cd7f32",
                  marginTop: "8px",
                }}
              >
                {challenge.rewards.bronze}$
              </p>
            </div>

            {/* Line */}
            <div
              className="flex-1 h-1 mx-2"
              style={{
                backgroundColor:
                  currentTier === "silver" || currentTier === "gold"
                    ? "#c0c0c0"
                    : "#4a4a6e",
              }}
            />

            {/* Silver */}
            <div className="text-center">
              <div
                className={`w-12 h-12 mx-auto border-4 flex items-center justify-center ${
                  currentTier === "silver" || currentTier === "gold"
                    ? "bg-[#c0c0c0]"
                    : ""
                }`}
                style={{ borderColor: "#c0c0c0" }}
              >
                <span style={{ fontSize: "20px" }}>🥈</span>
              </div>
              <p
                style={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: "6px",
                  color: "#c0c0c0",
                  marginTop: "8px",
                }}
              >
                {challenge.rewards.silver}$
              </p>
            </div>

            {/* Line */}
            <div
              className="flex-1 h-1 mx-2"
              style={{
                backgroundColor: currentTier === "gold" ? "#ffd93d" : "#4a4a6e",
              }}
            />

            {/* Gold */}
            <div className="text-center">
              <div
                className={`w-12 h-12 mx-auto border-4 flex items-center justify-center ${
                  currentTier === "gold" ? "bg-[#ffd93d]" : ""
                }`}
                style={{ borderColor: "#ffd93d" }}
              >
                <span style={{ fontSize: "20px" }}>🥇</span>
              </div>
              <p
                style={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: "6px",
                  color: "#ffd93d",
                  marginTop: "8px",
                }}
              >
                {challenge.rewards.gold}$
              </p>
            </div>
          </div>

          {/* Current Progress */}
          {currentValue > 0 && (
            <div className="text-center mt-4 pt-4 border-t border-[#4a4a6e]">
              <p
                style={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: "8px",
                  color: "#4a4a6e",
                }}
              >
                YOUR BEST
              </p>
              <p
                style={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: "20px",
                  color: getTierColor(currentTier),
                }}
              >
                {currentValue}
                {(challenge.challengeType === "accuracy" || challenge.challengeType === "keys") && "%"}
                {challenge.challengeType === "speed" && " WPM"}
              </p>
            </div>
          )}
        </div>

        {/* Start Button */}
        <div className="flex justify-center">
          <button
            onClick={() => setIsPlaying(true)}
            className="pixel-btn pixel-btn-yellow"
            style={{ fontSize: "12px", padding: "16px 32px" }}
          >
            {currentTier === "not_started" ? "▶ START CHALLENGE" : "▶ TRY AGAIN"}
          </button>
        </div>
      </div>
    );
  }

  // Playing state
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsPlaying(false)}
          className="pixel-btn"
          style={{ fontSize: "8px" }}
        >
          ← BACK
        </button>

        <div className="pixel-box px-4 py-2">
          <span
            style={{
              fontFamily: "'Press Start 2P'",
              fontSize: "10px",
              color: "#ffd93d",
            }}
          >
            DAILY CHALLENGE
          </span>
        </div>
      </div>

      {/* Target reminder */}
      <div className="text-center">
        <p
          style={{
            fontFamily: "'Press Start 2P'",
            fontSize: "10px",
            color: "#3bceac",
          }}
        >
          TARGET: {challenge.targetValue}
          {(challenge.challengeType === "accuracy" || challenge.challengeType === "keys") && "%"}
          {challenge.challengeType === "speed" && " WPM"}
        </p>
      </div>

      <TypingArea
        text={getChallengeText()}
        onComplete={handleComplete}
        onKeyPress={() => {}}
        isActive={true}
      />

      <Keyboard
        highlightKeys={challenge.targetKeys ?? []}
        showFingerColors={true}
        layout={keyboardLayout}
      />
    </div>
  );
}
