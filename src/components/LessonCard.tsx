import type { Lesson, LessonProgress } from '../types';
import { getTierForLevel } from '../data/levels';

interface LessonCardProps {
  lesson: Lesson;
  progress?: LessonProgress;
  isLocked?: boolean;
  isNew?: boolean;
  onClick: () => void;
}

export function LessonCard({ lesson, progress, isLocked = false, isNew = false, onClick }: LessonCardProps) {
  const isCompleted = progress?.completed && progress?.quizPassed;
  const isStarted = progress && !isCompleted;

  // Get tier info for this lesson
  const tier = getTierForLevel(lesson.id);
  const tierColor = tier?.color ?? '#3bceac';

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
      disabled={isLocked}
      className={`
        w-full p-4 text-left transition-all
        ${isLocked
          ? 'pixel-box opacity-50 cursor-not-allowed'
          : isCompleted
            ? 'pixel-box pixel-box-green hover:translate-x-1 hover:-translate-y-1'
            : isStarted
              ? 'pixel-box pixel-box-yellow hover:translate-x-1 hover:-translate-y-1'
              : 'pixel-box hover:translate-x-1 hover:-translate-y-1'
        }
      `}
      style={{ fontFamily: "'Press Start 2P', monospace" }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`
              w-10 h-10 flex items-center justify-center border-4
              ${isCompleted
                ? 'border-[#0ead69] bg-[#0ead69] text-[#0f0f1b]'
                : isLocked
                  ? 'border-[#4a4a6e] bg-[#16213e] text-[#4a4a6e]'
                  : 'bg-[#1a1a2e]'
              }
            `}
            style={{
              fontSize: '14px',
              boxShadow: isCompleted ? '0 0 15px #0ead69' : 'none',
              borderColor: isCompleted ? '#0ead69' : isLocked ? '#4a4a6e' : tierColor,
              color: isCompleted ? '#0f0f1b' : isLocked ? '#4a4a6e' : tierColor,
            }}
          >
            {isCompleted ? '★' : isLocked ? '🔒' : lesson.id}
          </div>
          <div>
            <h3
              style={{
                fontSize: '10px',
                color: isLocked ? '#4a4a6e' : '#eef5db',
                lineHeight: '1.5'
              }}
            >
              LVL {lesson.id}
            </h3>
            {/* Tier badge */}
            {tier && (
              <span
                style={{
                  fontSize: '6px',
                  color: isLocked ? '#4a4a6e' : tierColor,
                }}
              >
                {tier.name}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          {/* NEW badge */}
          {isNew && !isCompleted && !isLocked && (
            <span
              className="px-2 py-0.5"
              style={{
                fontSize: '6px',
                backgroundColor: '#ff6b9d',
                color: '#1a1a2e',
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
                    color: i <= stars ? '#ffd93d' : '#4a4a6e',
                    textShadow: i <= stars ? '0 0 10px #ffd93d' : 'none',
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
          fontSize: '8px',
          color: isLocked ? '#4a4a6e' : '#3bceac',
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
            className="w-6 h-6 flex items-center justify-center border-2"
            style={{
              fontSize: '8px',
              borderColor: isLocked ? '#4a4a6e' : '#3bceac',
              backgroundColor: isLocked ? 'transparent' : 'rgba(59, 206, 172, 0.1)',
              color: isLocked ? '#4a4a6e' : '#eef5db'
            }}
          >
            {key === ' ' ? '⎵' : key.toUpperCase()}
          </span>
        ))}
        {lesson.keys.length > 8 && (
          <span
            className="w-6 h-6 flex items-center justify-center border-2"
            style={{
              fontSize: '6px',
              borderColor: '#4a4a6e',
              color: '#4a4a6e'
            }}
          >
            +{lesson.keys.length - 8}
          </span>
        )}
      </div>

      <div
        className="flex items-center justify-between border-t-2 pt-2"
        style={{ borderColor: isLocked ? '#2a2a4e' : '#3bceac' }}
      >
        <div className="flex gap-4">
          <span style={{ fontSize: '6px', color: '#ffd93d' }}>
            {lesson.minWPM} WPM
          </span>
          <span style={{ fontSize: '6px', color: '#0ead69' }}>
            {lesson.minAccuracy}% ACC
          </span>
        </div>

        {progress && progress.bestWPM > 0 && (
          <span style={{ fontSize: '6px', color: '#ff6b9d' }}>
            BEST: {progress.bestWPM}
          </span>
        )}
      </div>

      {isStarted && !isCompleted && (
        <div
          className="mt-3 pt-2 border-t-2 border-[#ffd93d]"
          style={{ fontSize: '6px', color: '#ffd93d' }}
        >
          ▶ IN PROGRESS
        </div>
      )}
    </button>
  );
}
