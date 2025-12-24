import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { useUser } from '@clerk/clerk-react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  userId: Id<'users'> | null
  username: string | null
  hasLocalData: boolean
  migrateLocalData: () => Promise<void>
  migrationStatus: 'idle' | 'pending' | 'success' | 'error'
  clearMigrationStatus: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

// Check if there's any local storage data to migrate
function checkForLocalData(): boolean {
  return Boolean(
    localStorage.getItem('typingQuestGameState') ||
      localStorage.getItem('typingQuestProgress') ||
      localStorage.getItem('typequest_settings')
  )
}

// Get localStorage data for migration
function getLocalStorageData() {
  const gameStateStr = localStorage.getItem('typingQuestGameState')
  const progressStr = localStorage.getItem('typingQuestProgress')
  const settingsStr = localStorage.getItem('typequest_settings')

  const gameState = gameStateStr
    ? JSON.parse(gameStateStr)
    : {
        xp: 0,
        level: 1,
        totalXp: 0,
        combo: 0,
        maxCombo: 0,
        perfectStreak: 0,
        coins: 0,
        achievements: [],
        highScores: {},
      }

  const progressRecord = progressStr ? JSON.parse(progressStr) : {}
  const lessonProgress = Object.values(progressRecord) as Array<{
    lessonId: number
    completed: boolean
    bestWPM: number
    bestAccuracy: number
    attempts: number
    quizPassed: boolean
  }>

  const settings = settingsStr
    ? JSON.parse(settingsStr)
    : {
        keyboardLayout: 'qwerty-us',
        language: 'en',
        wordLanguage: undefined,
        mixEnglishWords: true,
        englishMixRatio: 0.3,
        activeThemes: [],
        themeMixRatio: 0.2,
      }

  return { gameState, lessonProgress, settings }
}

// Clear localStorage after migration
function clearLocalStorage() {
  localStorage.removeItem('typingQuestGameState')
  localStorage.removeItem('typingQuestProgress')
  localStorage.removeItem('typequest_settings')
  localStorage.removeItem('typingQuestLayout')
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, user } = useUser()
  const [migrationStatus, setMigrationStatus] = useState<
    'idle' | 'pending' | 'success' | 'error'
  >('idle')
  const [hasLocalData, setHasLocalData] = useState(checkForLocalData)
  const [userId, setUserId] = useState<Id<'users'> | null>(null)

  // Convex mutations
  const getOrCreateUser = useMutation(api.users.getOrCreateUser)
  const importData = useMutation(api.migrations.importLocalStorageData)

  // Get current user from Convex
  const convexUser = useQuery(api.users.getCurrentUser)

  // Sync user on auth change
  useEffect(() => {
    if (isSignedIn) {
      getOrCreateUser().then((id) => {
        if (id) setUserId(id)
      })
    } else {
      setUserId(null)
    }
  }, [isSignedIn, getOrCreateUser])

  // Update userId when convexUser changes
  useEffect(() => {
    if (convexUser?._id) {
      setUserId(convexUser._id)
    }
  }, [convexUser])

  // Migrate localStorage data to Convex
  const migrateLocalData = useCallback(async () => {
    if (!userId || migrationStatus === 'pending') return

    setMigrationStatus('pending')

    try {
      const { gameState, lessonProgress, settings } = getLocalStorageData()

      await importData({
        userId,
        gameState,
        lessonProgress,
        settings,
      })

      // Clear localStorage after successful migration
      clearLocalStorage()
      setHasLocalData(false)
      setMigrationStatus('success')
    } catch (error) {
      console.error('Migration failed:', error)
      setMigrationStatus('error')
    }
  }, [userId, migrationStatus, importData])

  const clearMigrationStatus = useCallback(() => {
    setMigrationStatus('idle')
  }, [])

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: isSignedIn ?? false,
        isLoading: !isLoaded,
        userId,
        username: convexUser?.username ?? user?.firstName ?? null,
        hasLocalData,
        migrateLocalData,
        migrationStatus,
        clearMigrationStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    // Return a default context for when providers aren't configured
    return {
      isAuthenticated: false,
      isLoading: false,
      userId: null,
      username: null,
      hasLocalData: false,
      migrateLocalData: async () => {},
      migrationStatus: 'idle' as const,
      clearMigrationStatus: () => {},
    }
  }
  return context
}
