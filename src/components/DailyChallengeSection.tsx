import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "@clerk/clerk-react";
import { DailyChallengeCard } from "./DailyChallengeCard";

interface DailyChallengeSectionProps {
  onStartChallenge?: () => void;
}

export function DailyChallengeSection({ onStartChallenge }: DailyChallengeSectionProps) {
  const { userId } = useAuth();

  // Get today's challenge
  const challenge = useQuery(api.dailyChallenges.getTodaysChallenge);

  // Get user's progress if logged in
  const progress = useQuery(
    api.dailyChallenges.getUserChallengeProgress,
    userId ? { clerkId: userId } : "skip"
  );

  if (!challenge) {
    return (
      <div className="pixel-box p-6 animate-pulse">
        <div className="h-4 bg-[#4a4a6e] rounded w-3/4 mb-4" />
        <div className="h-3 bg-[#4a4a6e] rounded w-1/2" />
      </div>
    );
  }

  return (
    <section className="mb-8">
      <h3
        className="mb-4 flex items-center gap-3"
        style={{ fontFamily: "'Press Start 2P'", fontSize: "12px", color: "#ffd93d" }}
      >
        <span>📋</span>
        <span>DAILY CHALLENGE</span>
        <span
          className="px-2 py-1"
          style={{
            fontSize: "6px",
            backgroundColor: "#ff6b9d",
            color: "#1a1a2e",
          }}
        >
          NEW TODAY
        </span>
      </h3>

      <DailyChallengeCard
        challenge={challenge}
        progress={progress ? {
          ...progress,
          status: progress.status as "not_started" | "pending" | "bronze" | "silver" | "gold",
        } : undefined}
        onStart={onStartChallenge}
        compact={false}
      />

      {!userId && (
        <p
          className="mt-3 text-center"
          style={{ fontFamily: "'Press Start 2P'", fontSize: "6px", color: "#4a4a6e" }}
        >
          SIGN IN TO SAVE YOUR PROGRESS
        </p>
      )}
    </section>
  );
}
