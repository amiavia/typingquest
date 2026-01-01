import { useState } from 'react'
import { useQuery } from 'convex/react'
import { useTranslation } from 'react-i18next'
import { useAuthContext } from '../contexts/AuthContext'
import { api } from '../../convex/_generated/api'
import { Avatar } from './Avatar'

interface LeaderboardProps {
  lessonId?: number
  limit?: number
  showGlobal?: boolean
}

const COMPACT_LIMIT = 10
const FULL_LIMIT = 100

export function Leaderboard({
  lessonId,
  limit = COMPACT_LIMIT,
  showGlobal = true,
}: LeaderboardProps) {
  const { t } = useTranslation()
  const { userId, isAuthenticated } = useAuthContext()
  const [showFull, setShowFull] = useState(false)

  const currentLimit = showFull ? FULL_LIMIT : limit

  // Get leaderboard data
  const globalScores = useQuery(
    api.leaderboard.getGlobalTopScores,
    showGlobal ? { limit: currentLimit } : 'skip'
  )

  const lessonScores = useQuery(
    api.leaderboard.getTopScores,
    lessonId ? { lessonId, limit: currentLimit } : 'skip'
  )

  const userRank = useQuery(
    api.leaderboard.getUserRank,
    userId && lessonId ? { userId, lessonId } : 'skip'
  )

  const leaderboardStats = useQuery(
    api.leaderboard.getLeaderboardStats,
    showGlobal ? {} : 'skip'
  )

  const scores = lessonId ? lessonScores : globalScores

  return (
    <div
      className="pixel-box p-6"
      style={{
        background: 'rgba(59, 206, 172, 0.05)',
        border: '3px solid rgba(59, 206, 172, 0.3)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '12px',
            color: '#ffd93d',
          }}
        >
          🏆 {lessonId ? t('leaderboard.level', { level: lessonId }) : t('leaderboard.global')} {t('leaderboard.title')}
        </h3>

        {leaderboardStats && (
          <span
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '7px',
              color: '#9a9ab0',
            }}
          >
            {t('leaderboard.playersCount', { count: leaderboardStats.totalPlayers })}
          </span>
        )}
      </div>

      {/* Scores table */}
      {scores && scores.length > 0 ? (
        <div className="space-y-2" style={{ maxHeight: showFull ? '60vh' : 'none', overflowY: showFull ? 'auto' : 'visible' }}>
          {scores.map((entry: any, index: number) => (
            <LeaderboardEntry
              key={`${index}-${entry.lessonId || 'global'}`}
              rank={entry.rank}
              displayName={entry.displayName}
              avatarId={entry.avatarId}
              score={entry.score}
              accuracy={entry.accuracy}
              lessonId={entry.lessonId}
              isCurrentUser={false}
              showLesson={showGlobal && !lessonId}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '8px',
              color: '#9a9ab0',
            }}
          >
            {t('leaderboard.noScores')}
          </p>
          <p
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '7px',
              color: '#6a6a7a',
              marginTop: '8px',
            }}
          >
            {t('leaderboard.beFirst')}
          </p>
        </div>
      )}

      {/* Show Full / Show Less toggle */}
      {scores && leaderboardStats && leaderboardStats.totalPlayers > scores.length && !showFull && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowFull(true)}
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '7px',
              color: '#3bceac',
              background: 'transparent',
              border: '2px solid #3bceac',
              padding: '8px 16px',
              cursor: 'pointer',
            }}
          >
            ▼ {t('leaderboard.showAll', { count: leaderboardStats.totalPlayers })}
          </button>
        </div>
      )}
      {showFull && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowFull(false)}
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '7px',
              color: '#9a9ab0',
              background: 'transparent',
              border: '2px solid #9a9ab0',
              padding: '8px 16px',
              cursor: 'pointer',
            }}
          >
            ▲ {t('leaderboard.showLess')}
          </button>
        </div>
      )}

      {/* User's rank (if not in top 10) */}
      {userRank && userRank.rank > limit && (
        <div
          className="mt-4 pt-4"
          style={{ borderTop: '2px dashed rgba(59, 206, 172, 0.3)' }}
        >
          <LeaderboardEntry
            rank={userRank.rank}
            displayName={t('leaderboard.you')}
            score={userRank.score}
            accuracy={userRank.accuracy}
            isCurrentUser={true}
          />
        </div>
      )}

      {/* Sign in CTA for guests */}
      {!isAuthenticated && (
        <div
          className="mt-4 pt-4 text-center"
          style={{ borderTop: '2px dashed rgba(255, 217, 61, 0.3)' }}
        >
          <p
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '7px',
              color: '#ffd93d',
            }}
          >
            {t('leaderboard.signInToJoin')}
          </p>
        </div>
      )}
    </div>
  )
}

interface LeaderboardEntryProps {
  rank: number
  displayName: string
  avatarId?: string
  score: number
  accuracy: number
  lessonId?: number
  isCurrentUser?: boolean
  showLesson?: boolean
}

function LeaderboardEntry({
  rank,
  displayName,
  avatarId,
  score,
  accuracy,
  lessonId,
  isCurrentUser,
  showLesson,
}: LeaderboardEntryProps) {
  const getRankColor = (rank: number) => {
    if (rank === 1) return '#ffd93d' // Gold
    if (rank === 2) return '#c0c0c0' // Silver
    if (rank === 3) return '#cd7f32' // Bronze
    return '#9a9ab0'
  }

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '👑'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return ''
  }

  return (
    <div
      className="flex items-center gap-4 p-3"
      style={{
        background: isCurrentUser
          ? 'rgba(59, 206, 172, 0.15)'
          : 'rgba(255, 255, 255, 0.02)',
        border: isCurrentUser ? '2px solid #3bceac' : '2px solid transparent',
        borderRadius: '4px',
      }}
    >
      {/* Rank */}
      <div
        className="w-8 text-center"
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '10px',
          color: getRankColor(rank),
        }}
      >
        {getRankEmoji(rank) || `#${rank}`}
      </div>

      {/* Avatar */}
      <Avatar avatarId={avatarId} size="sm" />

      {/* Display Name (PRP-029: nickname, never email) */}
      <div
        className="flex-1 truncate"
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '8px',
          color: isCurrentUser ? '#3bceac' : '#eef5db',
        }}
      >
        {displayName}
      </div>

      {/* Lesson (if showing global) */}
      {showLesson && lessonId && (
        <div
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '10px',
            color: 'var(--text-muted)',
          }}
        >
          LV{lessonId}
        </div>
      )}

      {/* Score (WPM) */}
      <div
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '12px',
          color: 'var(--accent-yellow)',
        }}
      >
        {score}
        <span
          style={{
            fontSize: '10px',
            color: 'var(--text-muted)',
            marginLeft: '4px',
          }}
        >
          WPM
        </span>
      </div>

      {/* Accuracy */}
      <div
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '10px',
          color: accuracy >= 95 ? 'var(--accent-green)' : accuracy >= 80 ? 'var(--accent-yellow)' : 'var(--accent-red)',
        }}
      >
        {accuracy}%
      </div>
    </div>
  )
}
