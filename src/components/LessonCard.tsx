import type { Lesson, LessonProgress } from '../types';
import { getTierForLevel } from '../data/levels';

interface LessonCardProps {
  lesson: Lesson;
  progress?: LessonProgress;
  isLocked?: boolean;
  isPremiumLocked?: boolean;
  isGuestLocked?: boolean;
  isNew?: boolean;
  onClick: () => void;
}

export function LessonCard({ lesson, progress, isLocked = false, isPremiumLocked = false, isGuestLocked = false, isNew = false, onClick }: LessonCardProps) {
  const isCompleted = progress?.completed && progress?.quizPassed;
  const isStarted = progress && !isCompleted;

  // Get tier info for this lesson
  const tier = getTierForLevel(lesson.id);
  const tierColor = tier?.color ?? 'var(--accent-cyan)';

  // Calculate stars based on performance
  const getStars = () => {
    if (!progress?.bestWPM || !progress?.bestAccuracy) return 0;
    let stars = 0;
    if (progress.quizPassed) stars = 1;
    if (progress.bestWPM >= lesson.minWPM * 1.5) stars = 2;
    if (progress.bestAccuracy >= 95 && progress.bestWPM >= lesson.minWPM * 1.5) stars = 3;
    return stars;
  };

  const stars = getStars();

  return (
    <button
      onClick={onClick}
      disabled={isLocked && !isPremiumLocked && !isGuestLocked}
      className={`
        w-full p-4 text-left transition-all
        ${isGuestLocked
          ? 'pixel-box hover:translate-x-1 hover:-translate-y-1 cursor-pointer'
          : isPremiumLocked
            ? 'pixel-box hover:translate-x-1 hover:-translate-y-1 cursor-pointer'
            : isLocked
              ? 'pixel-box opacity-50 cursor-not-allowed'
              : isCompleted
                ? 'pixel-box pixel-box-green hover:translate-x-1 hover:-translate-y-1'
                : isStarted
                  ? 'pixel-box pixel-box-yellow hover:translate-x-1 hover:-translate-y-1'
                  : 'pixel-box hover:translate-x-1 hover:-translate-y-1'
        }
      `}
      style={{
        fontFamily: "'Press Start 2P', monospace",
        borderColor: isGuestLocked ? 'var(--accent-cyan)' : isPremiumLocked ? 'var(--accent-yellow)' : undefined,
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 flex items-center justify-center border-4"
            style={{
              fontSize: '14px',
              backgroundColor: isCompleted ? 'var(--accent-green)' : 'var(--bg-elevated)',
              boxShadow: isCompleted ? '0 0 15px var(--accent-green)' : isGuestLocked ? '0 0 10px var(--glow-cyan)' : isPremiumLocked ? '0 0 10px var(--glow-yellow)' : 'none',
              borderColor: isCompleted ? 'var(--accent-green)' : isGuestLocked ? 'var(--accent-cyan)' : isPremiumLocked ? 'var(--accent-yellow)' : isLocked ? 'var(--text-muted)' : tierColor,
              color: isCompleted ? 'var(--bg-primary)' : isGuestLocked ? 'var(--accent-cyan)' : isPremiumLocked ? 'var(--accent-yellow)' : isLocked ? 'var(--text-muted)' : tierColor,
            }}
          >
            {isCompleted ? '★' : isGuestLocked ? '🔐' : isPremiumLocked ? '👑' : isLocked ? '🔒' : lesson.id}
          </div>
          <div>
            <h3
              style={{
                fontSize: '10px',
                color: isGuestLocked ? 'var(--accent-cyan)' : isPremiumLocked ? 'var(--accent-yellow)' : isLocked ? 'var(--text-muted)' : 'var(--text-primary)',
                lineHeight: '1.5'
              }}
            >
              LVL {lesson.id}
            </h3>
            {/* Tier badge */}
            {tier && (
              <span
                style={{
                  fontSize: '10px',
                  color: isPremiumLocked ? 'var(--accent-yellow)' : isLocked ? 'var(--text-muted)' : tierColor,
                }}
              >
                {tier.name}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          {/* SIGN UP badge for guest-locked levels */}
          {isGuestLocked && (
            <span
              className="px-2 py-0.5"
              style={{
                fontSize: '8px',
                backgroundColor: 'var(--accent-cyan)',
                color: 'var(--bg-secondary)',
              }}
            >
              SIGN UP
            </span>
          )}

          {/* PREMIUM badge */}
          {isPremiumLocked && !isGuestLocked && (
            <span
              className="px-2 py-0.5"
              style={{
                fontSize: '8px',
                backgroundColor: 'var(--accent-yellow)',
                color: 'var(--bg-secondary)',
              }}
            >
              PREMIUM
            </span>
          )}

          {/* NEW badge */}
          {isNew && !isCompleted && !isLocked && !isPremiumLocked && (
            <span
              className="px-2 py-0.5"
              style={{
                fontSize: '8px',
                backgroundColor: 'var(--accent-pink)',
                color: 'var(--bg-secondary)',
                animation: 'pulse 1s infinite',
              }}
            >
              NEW
            </span>
          )}

          {/* Star rating */}
          {isCompleted && (
            <div className="flex gap-1">
              {[1, 2, 3].map(i => (
                <span
                  key={i}
                  style={{
                    fontSize: '12px',
                    color: i <= stars ? 'var(--accent-yellow)' : 'var(--text-muted)',
                    textShadow: i <= stars ? '0 0 10px var(--accent-yellow)' : 'none',
                  }}
                >
                  ★
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <p
        style={{
          fontSize: '10px',
          color: isLocked ? 'var(--text-muted)' : 'var(--accent-cyan)',
          marginBottom: '12px',
          lineHeight: '1.8'
        }}
      >
        {lesson.title.toUpperCase()}
      </p>

      <div className="flex flex-wrap gap-1 mb-3">
        {lesson.keys.slice(0, 8).map(key => (
          <span
            key={key}
            className="w-7 h-7 flex items-center justify-center border-2"
            style={{
              fontSize: '10px',
              borderColor: isLocked ? 'var(--text-muted)' : 'var(--accent-cyan)',
              backgroundColor: isLocked ? 'transparent' : 'var(--gradient-cyan-box)',
              color: isLocked ? 'var(--text-muted)' : 'var(--text-primary)'
            }}
          >
            {key === ' ' ? '⎵' : key.toUpperCase()}
          </span>
        ))}
        {lesson.keys.length > 8 && (
          <span
            className="w-7 h-7 flex items-center justify-center border-2"
            style={{
              fontSize: '10px',
              borderColor: 'var(--text-muted)',
              color: 'var(--text-muted)'
            }}
          >
            +{lesson.keys.length - 8}
          </span>
        )}
      </div>

      <div
        className="flex items-center justify-between border-t-2 pt-2"
        style={{ borderColor: isLocked ? 'var(--bg-tertiary)' : 'var(--accent-cyan)' }}
      >
        <div className="flex gap-4">
          <span style={{ fontSize: '10px', color: 'var(--accent-yellow)' }}>
            {lesson.minWPM} WPM
          </span>
          <span style={{ fontSize: '10px', color: 'var(--accent-green)' }}>
            {lesson.minAccuracy}% ACC
          </span>
        </div>

        {progress && progress.bestWPM > 0 && (
          <span style={{ fontSize: '10px', color: 'var(--accent-pink)' }}>
            BEST: {progress.bestWPM}
          </span>
        )}
      </div>

      {isStarted && !isCompleted && (
        <div
          className="mt-3 pt-2"
          style={{
            fontSize: '10px',
            color: 'var(--accent-yellow)',
            borderTop: '2px solid var(--accent-yellow)',
          }}
        >
          ▶ IN PROGRESS
        </div>
      )}
    </button>
  );
}
