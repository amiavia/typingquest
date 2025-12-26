import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export type AccessibilityMode = 'vibrant' | 'muted';

interface AccessibilityModeContextValue {
  mode: AccessibilityMode;
  setMode: (mode: AccessibilityMode) => void;
  toggle: () => void;
  isMuted: boolean;
}

const AccessibilityModeContext = createContext<AccessibilityModeContextValue | null>(null);

const STORAGE_KEY = 'typebit8-accessibility-mode';

interface AccessibilityModeProviderProps {
  children: ReactNode;
}

export function AccessibilityModeProvider({ children }: AccessibilityModeProviderProps) {
  const [mode, setModeState] = useState<AccessibilityMode>(() => {
    // Check localStorage first
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'muted' || saved === 'vibrant') {
        return saved;
      }

      // Check system preference for reduced motion (often correlates with visual sensitivity)
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return 'muted';
      }
    }
    return 'vibrant';
  });

  // Apply mode to document
  useEffect(() => {
    document.documentElement.setAttribute('data-accessibility-mode', mode);
    localStorage.setItem(STORAGE_KEY, mode);

    // Log for debugging
    console.log('[AccessibilityMode] Mode set to:', mode);
  }, [mode]);

  const setMode = useCallback((newMode: AccessibilityMode) => {
    setModeState(newMode);
  }, []);

  const toggle = useCallback(() => {
    setModeState(current => current === 'vibrant' ? 'muted' : 'vibrant');
  }, []);

  const value: AccessibilityModeContextValue = {
    mode,
    setMode,
    toggle,
    isMuted: mode === 'muted',
  };

  return (
    <AccessibilityModeContext.Provider value={value}>
      {children}
    </AccessibilityModeContext.Provider>
  );
}

export function useAccessibilityMode(): AccessibilityModeContextValue {
  const context = useContext(AccessibilityModeContext);
  if (!context) {
    throw new Error('useAccessibilityMode must be used within AccessibilityModeProvider');
  }
  return context;
}
