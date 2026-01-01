import { SignInButton } from '@clerk/clerk-react'
import { useTranslation } from 'react-i18next'
import { useAuthContext } from '../contexts/AuthContext'

export function GuestBanner() {
  const { t } = useTranslation()
  const { isAuthenticated, isLoading } = useAuthContext()

  // Don't show banner if loading or authenticated
  if (isLoading || isAuthenticated) {
    return null
  }

  return (
    <div
      className="w-full py-3 px-4 flex items-center justify-center gap-4"
      style={{
        background: 'linear-gradient(90deg, rgba(255, 107, 107, 0.1) 0%, rgba(255, 217, 61, 0.1) 50%, rgba(59, 206, 172, 0.1) 100%)',
        borderBottom: '2px solid rgba(255, 217, 61, 0.3)',
      }}
    >
      <span
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '8px',
          color: '#ffd93d',
        }}
      >
        {t('guest.mode')}
      </span>

      <SignInButton mode="modal">
        <button
          className="px-3 py-1 cursor-pointer transition-all hover:scale-105"
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '7px',
            color: '#0e0e12',
            background: '#3bceac',
            border: 'none',
            borderRadius: '2px',
          }}
        >
          {t('guest.signInToSave')}
        </button>
      </SignInButton>
    </div>
  )
}
