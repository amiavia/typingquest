import { useState, useCallback, useMemo } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { useAuthContext } from '../contexts/AuthContext'
import type { LessonProgress } from '../types'
import { api } from '../../convex/_generated/api'

export interface UseLessonProgressResult {
  progress: Record<number, LessonProgress>
  updateProgress: (lessonId: number, data: Partial<LessonProgress>) => Promise<void>
  getCompletedCount: () => number
  isLessonUnlocked: (lessonId: number) => boolean
  isGuest: boolean
}

export function useLessonProgress(): UseLessonProgressResult {
  const { isAuthenticated, userId } = useAuthContext()

  // Convex queries/mutations
  const convexProgress = useQuery(
    api.lessonProgress.getAllProgress,
    userId ? { userId } : 'skip'
  )
  const convexUpdateProgress = useMutation(api.lessonProgress.updateLessonProgress)

  // Local state for guests (session-only)
  const [guestProgress, setGuestProgress] = useState<
    Record<number, LessonProgress>
  >({})

  // Determine active progress
  const progress: Record<number, LessonProgress> = useMemo(() => {
    if (isAuthenticated && convexProgress) {
      return convexProgress as Record<number, LessonProgress>
    }
    return guestProgress
  }, [isAuthenticated, convexProgress, guestProgress])

  // Update lesson progress
  const updateProgress = useCallback(
    async (lessonId: number, data: Partial<LessonProgress>) => {
      const existing = progress[lessonId] || {
        lessonId,
        completed: false,
        bestWPM: 0,
        bestAccuracy: 0,
        attempts: 0,
        quizPassed: false,
      }

      const updated: LessonProgress = {
        lessonId,
        completed: data.completed ?? existing.completed,
        bestWPM: Math.max(data.bestWPM ?? 0, existing.bestWPM),
        bestAccuracy: Math.max(data.bestAccuracy ?? 0, existing.bestAccuracy),
        attempts: data.attempts ?? existing.attempts,
        quizPassed: data.quizPassed ?? existing.quizPassed,
      }

      if (isAuthenticated && userId) {
        await convexUpdateProgress({
          userId,
          ...updated,
        })
      } else {
        setGuestProgress((prev) => ({
          ...prev,
          [lessonId]: updated,
        }))
      }
    },
    [isAuthenticated, userId, progress, convexUpdateProgress]
  )

  // Get count of completed lessons
  const getCompletedCount = useCallback(() => {
    return Object.values(progress).filter((p) => p.quizPassed).length
  }, [progress])

  // Check if a lesson is unlocked
  const isLessonUnlocked = useCallback(
    (lessonId: number) => {
      // First lesson is always unlocked
      if (lessonId === 1) return true
      // Other lessons require the previous lesson's quiz to be passed
      const prevProgress = progress[lessonId - 1]
      return prevProgress?.quizPassed ?? false
    },
    [progress]
  )

  return {
    progress,
    updateProgress,
    getCompletedCount,
    isLessonUnlocked,
    isGuest: !isAuthenticated,
  }
}
