import { useAuthContext } from '../contexts/AuthContext'

export function MigrationModal() {
  const {
    hasLocalData,
    migrateLocalData,
    migrationStatus,
    isAuthenticated,
  } = useAuthContext()

  // Only show on first login with existing local data
  if (!isAuthenticated || !hasLocalData || migrationStatus !== 'idle') {
    return null
  }

  const handleStartFresh = () => {
    // Clear all localStorage data
    localStorage.removeItem('typingQuestGameState')
    localStorage.removeItem('typingQuestProgress')
    localStorage.removeItem('typequest_settings')
    localStorage.removeItem('typingQuestLayout')
    // Force refresh to update state
    window.location.reload()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(14, 14, 18, 0.9)' }}
      />

      {/* Modal */}
      <div
        className="relative pixel-box p-8 max-w-md w-full text-center"
        style={{
          background: '#1a1a2e',
          border: '4px solid #3bceac',
        }}
      >
        {/* Icon */}
        <div className="text-5xl mb-6">💾</div>

        {/* Title */}
        <h2
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '14px',
            color: '#ffd93d',
            marginBottom: '16px',
          }}
        >
          SAVE DATA FOUND!
        </h2>

        {/* Description */}
        <p
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '8px',
            color: '#eef5db',
            lineHeight: '2',
            marginBottom: '24px',
          }}
        >
          WE FOUND EXISTING PROGRESS ON THIS DEVICE.
          <br />
          WOULD YOU LIKE TO SYNC IT TO YOUR ACCOUNT?
        </p>

        {/* Stats preview */}
        <div
          className="pixel-box p-4 mb-6"
          style={{
            background: 'rgba(59, 206, 172, 0.1)',
            border: '2px solid rgba(59, 206, 172, 0.3)',
          }}
        >
          <LocalDataPreview />
        </div>

        {/* Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={migrateLocalData}
            className="pixel-box px-6 py-3 cursor-pointer transition-all hover:scale-105"
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '10px',
              color: '#0e0e12',
              background: '#3bceac',
              border: '3px solid #0ead69',
            }}
          >
            SYNC IT
          </button>

          <button
            onClick={handleStartFresh}
            className="pixel-box px-6 py-3 cursor-pointer transition-all hover:scale-105"
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '10px',
              color: '#eef5db',
              background: 'transparent',
              border: '3px solid #4a4a5a',
            }}
          >
            START FRESH
          </button>
        </div>
      </div>
    </div>
  )
}

// Preview component to show local data stats
function LocalDataPreview() {
  try {
    const gameStateStr = localStorage.getItem('typingQuestGameState')
    const progressStr = localStorage.getItem('typingQuestProgress')

    const gameState = gameStateStr ? JSON.parse(gameStateStr) : null
    const progress = progressStr ? JSON.parse(progressStr) : {}

    const completedLessons = Object.values(progress).filter(
      (p: any) => p.quizPassed
    ).length

    if (!gameState) {
      return (
        <span
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '7px',
            color: '#9a9ab0',
          }}
        >
          NO STATS AVAILABLE
        </span>
      )
    }

    return (
      <div className="flex justify-around">
        <div className="text-center">
          <div
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '14px',
              color: '#ffd93d',
            }}
          >
            {gameState.level || 1}
          </div>
          <div
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '6px',
              color: '#9a9ab0',
            }}
          >
            LEVEL
          </div>
        </div>

        <div className="text-center">
          <div
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '14px',
              color: '#3bceac',
            }}
          >
            {completedLessons}
          </div>
          <div
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '6px',
              color: '#9a9ab0',
            }}
          >
            CLEARED
          </div>
        </div>

        <div className="text-center">
          <div
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '14px',
              color: '#ff6b6b',
            }}
          >
            {gameState.coins || 0}
          </div>
          <div
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '6px',
              color: '#9a9ab0',
            }}
          >
            COINS
          </div>
        </div>
      </div>
    )
  } catch {
    return null
  }
}
