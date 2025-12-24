import { useState, useCallback, useMemo } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { useAuthContext } from '../contexts/AuthContext'

// Try to import Convex API - will fail gracefully if not configured
let api: typeof import('../../convex/_generated/api').api | null = null
try {
  api = require('../../convex/_generated/api').api
} catch {
  // Convex not configured
}

export interface GameState {
  xp: number
  level: number
  totalXp: number
  combo: number
  maxCombo: number
  perfectStreak: number
  coins: number
  achievements: string[]
  highScores: Record<number, number>
}

export const XP_PER_LEVEL = 100
const COMBO_MULTIPLIER = 0.1

const initialState: GameState = {
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

export function useGameState() {
  const { isAuthenticated, userId } = useAuthContext()

  // Convex queries/mutations (only used when authenticated and API is available)
  const convexGameState = useQuery(
    api?.gameState?.getGameState ?? 'skip',
    userId && api ? { userId } : 'skip'
  )
  const convexAddXp = useMutation(api?.gameState?.addXp ?? 'skip')
  const convexAddCoins = useMutation(api?.gameState?.addCoins ?? 'skip')
  const convexUpdateCombo = useMutation(api?.gameState?.updateCombo ?? 'skip')
  const convexUpdatePerfectStreak = useMutation(
    api?.gameState?.updatePerfectStreak ?? 'skip'
  )
  const convexUnlockAchievement = useMutation(
    api?.gameState?.unlockAchievement ?? 'skip'
  )
  const convexSetHighScore = useMutation(
    api?.gameState?.setHighScore ?? 'skip'
  )

  // Local state for guests (session-only, no persistence)
  const [guestState, setGuestState] = useState<GameState>(initialState)

  // Determine active state based on auth status
  const state: GameState = useMemo(() => {
    if (isAuthenticated && convexGameState) {
      return {
        xp: convexGameState.xp,
        level: convexGameState.level,
        totalXp: convexGameState.totalXp,
        combo: convexGameState.combo,
        maxCombo: convexGameState.maxCombo,
        perfectStreak: convexGameState.perfectStreak,
        coins: convexGameState.coins,
        achievements: convexGameState.achievements,
        highScores: convexGameState.highScores ?? {},
      }
    }
    return guestState
  }, [isAuthenticated, convexGameState, guestState])

  // Add XP with combo bonus
  const addXp = useCallback(
    async (baseXp: number) => {
      if (isAuthenticated && userId && api) {
        await convexAddXp({ userId, baseXp })
      } else {
        setGuestState((prev) => {
          const comboBonus = Math.floor(baseXp * prev.combo * COMBO_MULTIPLIER)
          const totalGained = baseXp + comboBonus
          const newTotalXp = prev.totalXp + totalGained
          let newXp = prev.xp + totalGained
          let newLevel = prev.level

          while (newXp >= XP_PER_LEVEL) {
            newXp -= XP_PER_LEVEL
            newLevel++
          }

          return { ...prev, xp: newXp, level: newLevel, totalXp: newTotalXp }
        })
      }
    },
    [isAuthenticated, userId, convexAddXp]
  )

  // Increment combo
  const incrementCombo = useCallback(async () => {
    if (isAuthenticated && userId && api) {
      await convexUpdateCombo({ userId, action: 'increment' })
    } else {
      setGuestState((prev) => ({
        ...prev,
        combo: prev.combo + 1,
        maxCombo: Math.max(prev.maxCombo, prev.combo + 1),
      }))
    }
  }, [isAuthenticated, userId, convexUpdateCombo])

  // Reset combo
  const resetCombo = useCallback(async () => {
    if (isAuthenticated && userId && api) {
      await convexUpdateCombo({ userId, action: 'reset' })
    } else {
      setGuestState((prev) => ({ ...prev, combo: 0 }))
    }
  }, [isAuthenticated, userId, convexUpdateCombo])

  // Add coins
  const addCoins = useCallback(
    async (amount: number) => {
      if (isAuthenticated && userId && api) {
        await convexAddCoins({ userId, amount })
      } else {
        setGuestState((prev) => ({ ...prev, coins: prev.coins + amount }))
      }
    },
    [isAuthenticated, userId, convexAddCoins]
  )

  // Unlock achievement
  const unlockAchievement = useCallback(
    async (achievementId: string) => {
      if (isAuthenticated && userId && api) {
        await convexUnlockAchievement({ userId, achievementId })
      } else {
        setGuestState((prev) => {
          if (prev.achievements.includes(achievementId)) return prev
          return { ...prev, achievements: [...prev.achievements, achievementId] }
        })
      }
    },
    [isAuthenticated, userId, convexUnlockAchievement]
  )

  // Set high score
  const setHighScore = useCallback(
    async (lessonId: number, score: number) => {
      if (isAuthenticated && userId && api) {
        await convexSetHighScore({ userId, lessonId, score })
      } else {
        setGuestState((prev) => {
          if ((prev.highScores[lessonId] || 0) >= score) return prev
          return {
            ...prev,
            highScores: { ...prev.highScores, [lessonId]: score },
          }
        })
      }
    },
    [isAuthenticated, userId, convexSetHighScore]
  )

  // Increment perfect streak
  const incrementPerfectStreak = useCallback(async () => {
    if (isAuthenticated && userId && api) {
      await convexUpdatePerfectStreak({ userId, action: 'increment' })
    } else {
      setGuestState((prev) => ({
        ...prev,
        perfectStreak: prev.perfectStreak + 1,
      }))
    }
  }, [isAuthenticated, userId, convexUpdatePerfectStreak])

  // Reset perfect streak
  const resetPerfectStreak = useCallback(async () => {
    if (isAuthenticated && userId && api) {
      await convexUpdatePerfectStreak({ userId, action: 'reset' })
    } else {
      setGuestState((prev) => ({ ...prev, perfectStreak: 0 }))
    }
  }, [isAuthenticated, userId, convexUpdatePerfectStreak])

  // Get XP progress percentage
  const getXpProgress = useCallback(() => {
    return (state.xp / XP_PER_LEVEL) * 100
  }, [state.xp])

  // Get XP needed for next level
  const getXpToNextLevel = useCallback(() => {
    return XP_PER_LEVEL - state.xp
  }, [state.xp])

  return {
    ...state,
    addXp,
    incrementCombo,
    resetCombo,
    addCoins,
    unlockAchievement,
    setHighScore,
    incrementPerfectStreak,
    resetPerfectStreak,
    getXpProgress,
    getXpToNextLevel,
    XP_PER_LEVEL,
    isGuest: !isAuthenticated,
  }
}

export const ACHIEVEMENTS = {
  FIRST_LESSON: {
    id: 'first_lesson',
    name: 'ROOKIE',
    desc: 'Complete your first level',
  },
  SPEED_DEMON: {
    id: 'speed_demon',
    name: 'SPEED DEMON',
    desc: 'Reach 30 WPM',
  },
  PERFECTIONIST: {
    id: 'perfectionist',
    name: 'PERFECTIONIST',
    desc: '100% accuracy on a level',
  },
  COMBO_MASTER: {
    id: 'combo_master',
    name: 'COMBO MASTER',
    desc: 'Get a 50x combo',
  },
  HALFWAY: {
    id: 'halfway',
    name: 'HALFWAY HERO',
    desc: 'Complete 7 levels',
  },
  CHAMPION: { id: 'champion', name: 'CHAMPION', desc: 'Complete all levels' },
  LEVEL_10: { id: 'level_10', name: 'VETERAN', desc: 'Reach player level 10' },
}
