import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "@clerk/clerk-react";

interface DailyChallengeButtonProps {
  onClick: () => void;
}

export function DailyChallengeButton({ onClick }: DailyChallengeButtonProps) {
  const { userId } = useAuth();

  // Get today's challenge
  const challenge = useQuery(api.dailyChallenges.getTodaysChallenge);

  // Get user's progress if logged in
  const progress = useQuery(
    api.dailyChallenges.getUserChallengeProgress,
    userId ? { clerkId: userId } : "skip"
  );

  const isCompleted = progress?.status === 'gold' || progress?.status === 'silver' || progress?.status === 'bronze';
  const hasAttempted = progress?.status && progress.status !== 'not_started';

  // Don't show if no challenge available
  if (!challenge) {
    return null;
  }

  return (
    <button
      onClick={onClick}
      className="relative group"
      style={{
        fontFamily: "'Press Start 2P'",
        fontSize: '7px',
        padding: '8px 12px',
        border: `2px solid ${isCompleted ? '#0ead69' : '#ffd93d'}`,
        background: isCompleted ? 'rgba(14, 173, 105, 0.2)' : 'transparent',
        color: isCompleted ? '#0ead69' : '#ffd93d',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        animation: !isCompleted ? 'pulse-glow 2s infinite' : 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = isCompleted
          ? '0 0 15px rgba(14, 173, 105, 0.4)'
          : '0 0 15px rgba(255, 217, 61, 0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {isCompleted ? (
        <>✓ DONE</>
      ) : hasAttempted ? (
        <>⚡ RETRY</>
      ) : (
        <>⚡ CHALLENGE</>
      )}

      {/* Tooltip on hover */}
      <div
        className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-[#1a1a2e] border-2 border-[#3bceac] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50"
        style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: '#eef5db' }}
      >
        {isCompleted ? (
          'COMPLETED TODAY!'
        ) : (
          <>
            <span style={{ color: '#ffd93d' }}>REWARD:</span> {challenge.rewards?.gold || 100} XP
          </>
        )}
      </div>

      {/* Pulsing animation styles */}
      <style>{`
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 5px rgba(255, 217, 61, 0.3);
          }
          50% {
            box-shadow: 0 0 15px rgba(255, 217, 61, 0.6);
          }
        }
      `}</style>
    </button>
  );
}
