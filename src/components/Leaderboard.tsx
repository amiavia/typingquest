import { useQuery } from 'convex/react'
import { useAuthContext } from '../contexts/AuthContext'
import { api } from '../../convex/_generated/api'

interface LeaderboardProps {
  lessonId?: number
  limit?: number
  showGlobal?: boolean
}

export function Leaderboard({
  lessonId,
  limit = 10,
  showGlobal = true,
}: LeaderboardProps) {
  const { userId, isAuthenticated } = useAuthContext()

  // Get leaderboard data
  const globalScores = useQuery(
    api.leaderboard.getGlobalTopScores,
    showGlobal ? { limit } : 'skip'
  )

  const lessonScores = useQuery(
    api.leaderboard.getTopScores,
    lessonId ? { lessonId, limit } : 'skip'
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
          🏆 {lessonId ? `LEVEL ${lessonId}` : 'GLOBAL'} LEADERBOARD
        </h3>

        {leaderboardStats && (
          <span
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '7px',
              color: '#9a9ab0',
            }}
          >
            {leaderboardStats.totalPlayers} PLAYERS
          </span>
        )}
      </div>

      {/* Scores table */}
      {scores && scores.length > 0 ? (
        <div className="space-y-2">
          {scores.map((entry: any, index: number) => (
            <LeaderboardEntry
              key={`${entry.userId}-${entry.lessonId || 'global'}`}
              rank={entry.rank}
              username={entry.username}
              score={entry.score}
              accuracy={entry.accuracy}
              lessonId={entry.lessonId}
              isCurrentUser={userId === entry.userId}
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
            NO SCORES YET
          </p>
          <p
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '7px',
              color: '#6a6a7a',
              marginTop: '8px',
            }}
          >
            BE THE FIRST TO SET A RECORD!
          </p>
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
            username="YOU"
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
            SIGN IN TO JOIN THE LEADERBOARD
          </p>
        </div>
      )}
    </div>
  )
}

interface LeaderboardEntryProps {
  rank: number
  username: string
  score: number
  accuracy: number
  lessonId?: number
  isCurrentUser?: boolean
  showLesson?: boolean
}

function LeaderboardEntry({
  rank,
  username,
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

      {/* Username */}
      <div
        className="flex-1 truncate"
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '8px',
          color: isCurrentUser ? '#3bceac' : '#eef5db',
        }}
      >
        {username}
      </div>

      {/* Lesson (if showing global) */}
      {showLesson && lessonId && (
        <div
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '6px',
            color: '#6a6a7a',
          }}
        >
          LV{lessonId}
        </div>
      )}

      {/* Score (WPM) */}
      <div
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '10px',
          color: '#ffd93d',
        }}
      >
        {score}
        <span
          style={{
            fontSize: '6px',
            color: '#9a9ab0',
            marginLeft: '2px',
          }}
        >
          WPM
        </span>
      </div>

      {/* Accuracy */}
      <div
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '8px',
          color: accuracy >= 95 ? '#0ead69' : accuracy >= 80 ? '#ffd93d' : '#ff6b6b',
        }}
      >
        {accuracy}%
      </div>
    </div>
  )
}
