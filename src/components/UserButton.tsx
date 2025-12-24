import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton as ClerkUserButton,
} from '@clerk/clerk-react'
import { useAuthContext } from '../contexts/AuthContext'

export function UserButton() {
  const { hasLocalData, migrateLocalData, migrationStatus } = useAuthContext()

  return (
    <div className="flex items-center gap-3">
      <SignedOut>
        <SignInButton mode="modal">
          <button
            className="pixel-box px-4 py-2 cursor-pointer transition-all hover:scale-105"
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '8px',
              color: '#3bceac',
              background: 'rgba(59, 206, 172, 0.1)',
              border: '2px solid #3bceac',
            }}
          >
            SIGN IN
          </button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        {/* Show sync button if user has local data to migrate */}
        {hasLocalData && migrationStatus === 'idle' && (
          <button
            onClick={migrateLocalData}
            className="pixel-box px-3 py-2 cursor-pointer transition-all hover:scale-105 animate-pulse"
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '7px',
              color: '#ffd93d',
              background: 'rgba(255, 217, 61, 0.1)',
              border: '2px solid #ffd93d',
            }}
          >
            SYNC DATA
          </button>
        )}

        {migrationStatus === 'pending' && (
          <span
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '7px',
              color: '#ffd93d',
            }}
          >
            SYNCING...
          </span>
        )}

        {migrationStatus === 'success' && (
          <span
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '7px',
              color: '#0ead69',
            }}
          >
            SYNCED!
          </span>
        )}

        {migrationStatus === 'error' && (
          <span
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '7px',
              color: '#ff6b6b',
            }}
          >
            ERROR
          </span>
        )}

        <ClerkUserButton
          appearance={{
            elements: {
              avatarBox: {
                width: '36px',
                height: '36px',
                border: '3px solid #3bceac',
                borderRadius: '4px',
              },
            },
          }}
        />
      </SignedIn>
    </div>
  )
}
