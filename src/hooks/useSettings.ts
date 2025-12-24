import { useState, useCallback, useMemo } from 'react'
import { useMutation, useQuery } from 'convex/react'
import type {
  LanguageCode,
  LayoutFamily,
  ThemeId,
  UserSettings,
} from '../types/settings'
import {
  getLayoutFamily,
  type KeyboardLayoutType,
} from '../data/keyboardLayouts'
import { useAuthContext } from '../contexts/AuthContext'

// Try to import Convex API - will fail gracefully if not configured
let api: typeof import('../../convex/_generated/api').api | null = null
try {
  api = require('../../convex/_generated/api').api
} catch {
  // Convex not configured
}

// Default settings
const DEFAULT_SETTINGS: UserSettings = {
  keyboardLayout: 'qwerty-us',
  language: 'en',
  wordLanguage: undefined,
  mixEnglishWords: true,
  englishMixRatio: 0.3,
  activeThemes: [],
  themeMixRatio: 0.2,
}

// Language suggestions based on keyboard layout
const LAYOUT_LANGUAGE_MAP: Partial<Record<string, LanguageCode>> = {
  'qwertz-de': 'de',
  'qwertz-ch': 'de',
  'azerty-fr': 'fr',
  'azerty-be': 'fr',
}

export interface UseSettingsResult {
  settings: UserSettings
  layoutFamily: LayoutFamily
  effectiveWordLanguage: LanguageCode
  updateSettings: (updates: Partial<UserSettings>) => void
  setKeyboardLayout: (layout: string) => void
  setLanguage: (language: LanguageCode) => void
  setWordLanguage: (language: LanguageCode | undefined) => void
  setMixEnglishWords: (mix: boolean) => void
  setEnglishMixRatio: (ratio: number) => void
  setActiveThemes: (themes: ThemeId[]) => void
  toggleTheme: (themeId: ThemeId) => void
  setThemeMixRatio: (ratio: number) => void
  resetSettings: () => void
  suggestLanguageForLayout: (layout: string) => LanguageCode | undefined
  isGuest: boolean
}

export function useSettings(): UseSettingsResult {
  const { isAuthenticated, userId } = useAuthContext()

  // Convex queries/mutations (only used when authenticated)
  const convexSettings = useQuery(
    api?.settings?.getSettings ?? 'skip',
    userId && api ? { userId } : 'skip'
  )
  const convexUpsertSettings = useMutation(
    api?.settings?.upsertSettings ?? 'skip'
  )
  const convexUpdateSetting = useMutation(
    api?.settings?.updateSetting ?? 'skip'
  )
  const convexToggleTheme = useMutation(api?.settings?.toggleTheme ?? 'skip')

  // Local state for guests (session-only, starts with defaults)
  const [guestSettings, setGuestSettings] =
    useState<UserSettings>(DEFAULT_SETTINGS)

  // Determine active settings
  const settings: UserSettings = useMemo(() => {
    if (isAuthenticated && convexSettings) {
      return {
        keyboardLayout: convexSettings.keyboardLayout,
        language: convexSettings.language as LanguageCode,
        wordLanguage: convexSettings.wordLanguage as LanguageCode | undefined,
        mixEnglishWords: convexSettings.mixEnglishWords,
        englishMixRatio: convexSettings.englishMixRatio,
        activeThemes: convexSettings.activeThemes as ThemeId[],
        themeMixRatio: convexSettings.themeMixRatio,
      }
    }
    return guestSettings
  }, [isAuthenticated, convexSettings, guestSettings])

  // Computed values
  const layoutFamily = getLayoutFamily(
    settings.keyboardLayout as KeyboardLayoutType
  )
  const effectiveWordLanguage = settings.wordLanguage || settings.language

  // Update multiple settings at once
  const updateSettings = useCallback(
    async (updates: Partial<UserSettings>) => {
      if (isAuthenticated && userId && api) {
        await convexUpsertSettings({
          userId,
          ...settings,
          ...updates,
        })
      } else {
        setGuestSettings((prev) => ({ ...prev, ...updates }))
      }
    },
    [isAuthenticated, userId, settings, convexUpsertSettings]
  )

  // Individual setters
  const setKeyboardLayout = useCallback(
    async (layout: string) => {
      if (isAuthenticated && userId && api) {
        await convexUpdateSetting({ userId, key: 'keyboardLayout', value: layout })
      } else {
        setGuestSettings((prev) => ({ ...prev, keyboardLayout: layout }))
      }
    },
    [isAuthenticated, userId, convexUpdateSetting]
  )

  const setLanguage = useCallback(
    async (language: LanguageCode) => {
      if (isAuthenticated && userId && api) {
        await convexUpdateSetting({ userId, key: 'language', value: language })
      } else {
        setGuestSettings((prev) => ({ ...prev, language }))
      }
    },
    [isAuthenticated, userId, convexUpdateSetting]
  )

  const setWordLanguage = useCallback(
    async (language: LanguageCode | undefined) => {
      if (isAuthenticated && userId && api) {
        await convexUpdateSetting({ userId, key: 'wordLanguage', value: language })
      } else {
        setGuestSettings((prev) => ({ ...prev, wordLanguage: language }))
      }
    },
    [isAuthenticated, userId, convexUpdateSetting]
  )

  const setMixEnglishWords = useCallback(
    async (mix: boolean) => {
      if (isAuthenticated && userId && api) {
        await convexUpdateSetting({ userId, key: 'mixEnglishWords', value: mix })
      } else {
        setGuestSettings((prev) => ({ ...prev, mixEnglishWords: mix }))
      }
    },
    [isAuthenticated, userId, convexUpdateSetting]
  )

  const setEnglishMixRatio = useCallback(
    async (ratio: number) => {
      const clampedRatio = Math.max(0, Math.min(1, ratio))
      if (isAuthenticated && userId && api) {
        await convexUpdateSetting({
          userId,
          key: 'englishMixRatio',
          value: clampedRatio,
        })
      } else {
        setGuestSettings((prev) => ({ ...prev, englishMixRatio: clampedRatio }))
      }
    },
    [isAuthenticated, userId, convexUpdateSetting]
  )

  const setActiveThemes = useCallback(
    async (themes: ThemeId[]) => {
      if (isAuthenticated && userId && api) {
        await convexUpdateSetting({ userId, key: 'activeThemes', value: themes })
      } else {
        setGuestSettings((prev) => ({ ...prev, activeThemes: themes }))
      }
    },
    [isAuthenticated, userId, convexUpdateSetting]
  )

  const toggleTheme = useCallback(
    async (themeId: ThemeId) => {
      if (isAuthenticated && userId && api) {
        await convexToggleTheme({ userId, themeId })
      } else {
        setGuestSettings((prev) => {
          const isActive = prev.activeThemes.includes(themeId)
          return {
            ...prev,
            activeThemes: isActive
              ? prev.activeThemes.filter((t) => t !== themeId)
              : [...prev.activeThemes, themeId],
          }
        })
      }
    },
    [isAuthenticated, userId, convexToggleTheme]
  )

  const setThemeMixRatio = useCallback(
    async (ratio: number) => {
      const clampedRatio = Math.max(0, Math.min(1, ratio))
      if (isAuthenticated && userId && api) {
        await convexUpdateSetting({
          userId,
          key: 'themeMixRatio',
          value: clampedRatio,
        })
      } else {
        setGuestSettings((prev) => ({ ...prev, themeMixRatio: clampedRatio }))
      }
    },
    [isAuthenticated, userId, convexUpdateSetting]
  )

  const resetSettings = useCallback(async () => {
    if (isAuthenticated && userId && api) {
      await convexUpsertSettings({
        userId,
        ...DEFAULT_SETTINGS,
      })
    } else {
      setGuestSettings(DEFAULT_SETTINGS)
    }
  }, [isAuthenticated, userId, convexUpsertSettings])

  // Suggest a language based on keyboard layout
  const suggestLanguageForLayout = useCallback(
    (layout: string): LanguageCode | undefined => {
      return LAYOUT_LANGUAGE_MAP[layout]
    },
    []
  )

  return {
    settings,
    layoutFamily,
    effectiveWordLanguage,
    updateSettings,
    setKeyboardLayout,
    setLanguage,
    setWordLanguage,
    setMixEnglishWords,
    setEnglishMixRatio,
    setActiveThemes,
    toggleTheme,
    setThemeMixRatio,
    resetSettings,
    suggestLanguageForLayout,
    isGuest: !isAuthenticated,
  }
}

// Export default settings for testing
export { DEFAULT_SETTINGS }
