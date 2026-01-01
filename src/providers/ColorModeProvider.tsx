/**
 * PRP-049: Color Mode Provider (Light/Dark Theme)
 *
 * Manages light/dark mode preference with:
 * - localStorage persistence
 * - System preference detection (prefers-color-scheme)
 * - data-theme attribute on document for CSS targeting
 */

import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

type ColorMode = "dark" | "light";

interface ColorModeContextType {
  colorMode: ColorMode;
  toggleColorMode: () => void;
  setColorMode: (mode: ColorMode) => void;
  isDark: boolean;
  isLight: boolean;
}

const ColorModeContext = createContext<ColorModeContextType | undefined>(undefined);

const STORAGE_KEY = "typebit8-color-mode";

// Light theme CSS variables (must use inline styles to override shop themes)
const LIGHT_THEME_VARS: Record<string, string> = {
  // Core backgrounds
  "--bg-primary": "#faf6eb",
  "--bg-secondary": "#f0ebe0",
  "--bg-tertiary": "#e5dfd2",
  "--bg-elevated": "#fff9f0",
  // Text colors - maximum contrast
  "--text-primary": "#1a1a28",
  "--text-secondary": "#0a4a3a",
  "--text-muted": "#4a4a5a",
  "--text-on-accent": "#faf6eb",
  // Accent colors - high contrast
  "--accent-yellow": "#9a7209",
  "--accent-cyan": "#0a6a5a",
  "--accent-green": "#086a3a",
  "--accent-pink": "#a8325a",
  "--accent-red": "#9a2238",
  "--accent-orange": "#a84a1a",
  "--accent-purple": "#5b21b6",
  "--accent-blue": "#0a4a7a",
  // UI elements
  "--border-color": "#1a5a4a",
  "--border-color-muted": "rgba(26, 90, 74, 0.3)",
  "--key-bg": "#f0ebe0",
  "--key-border": "#1a5a4a",
  "--key-text": "#2a2a3e",
  "--key-highlight": "#b8860b",
  // Card/box backgrounds
  "--card-bg": "#f5f0e5",
  "--card-bg-alt": "#ebe5da",
  "--card-border": "#1a5a4a",
  // Gradients
  "--gradient-feature": "linear-gradient(135deg, #f5f0e5 0%, #ebe5da 50%, #e5dfd2 100%)",
  "--gradient-premium": "linear-gradient(135deg, #fff5e6 0%, #ffe8cc 50%, #ffd9b3 100%)",
  "--gradient-cyan-box": "linear-gradient(135deg, rgba(26, 138, 122, 0.1) 0%, rgba(26, 138, 122, 0.05) 100%)",
  "--gradient-yellow-box": "linear-gradient(135deg, rgba(184, 134, 11, 0.1) 0%, rgba(196, 92, 38, 0.1) 100%)",
  "--gradient-green-box": "linear-gradient(135deg, rgba(10, 138, 80, 0.15) 0%, rgba(26, 138, 122, 0.15) 100%)",
  // Buttons
  "--btn-primary-bg": "#1a8a7a",
  "--btn-primary-text": "#faf6eb",
  "--btn-secondary-bg": "#b8860b",
  "--btn-secondary-text": "#faf6eb",
  "--btn-premium-bg": "linear-gradient(135deg, #b8860b 0%, #c45c26 100%)",
  // Shadows
  "--shadow-color": "rgba(42, 42, 62, 0.12)",
  "--shadow-soft": "rgba(42, 42, 62, 0.08)",
  "--glow-cyan": "rgba(26, 138, 122, 0.2)",
  "--glow-yellow": "rgba(184, 134, 11, 0.2)",
  "--glow-opacity": "0",
  // Header
  "--header-bg": "#f5f0e5",
  "--header-border": "#1a5a4a",
  // RGB values for rgba() usage - high contrast values
  "--bg-primary-rgb": "250, 246, 235",
  "--accent-pink-rgb": "168, 50, 90",
  "--accent-purple-rgb": "91, 33, 182",
  "--accent-cyan-rgb": "10, 106, 90",
  "--accent-green-rgb": "8, 106, 58",
  "--accent-yellow-rgb": "154, 114, 9",
};

// Apply light theme inline styles (to override shop theme inline styles)
function applyLightThemeStyles() {
  const root = document.documentElement;
  Object.entries(LIGHT_THEME_VARS).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

// Remove inline styles to let CSS (or shop theme) take over
function clearInlineThemeStyles() {
  const root = document.documentElement;
  Object.keys(LIGHT_THEME_VARS).forEach((key) => {
    root.style.removeProperty(key);
  });
}

function getInitialColorMode(): ColorMode {
  // Check localStorage first
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(STORAGE_KEY) as ColorMode;
    if (saved === "dark" || saved === "light") {
      return saved;
    }

    // Check system preference
    if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      return "light";
    }
  }

  // Default to dark (original theme)
  return "dark";
}

export function ColorModeProvider({ children }: { children: ReactNode }) {
  const [colorMode, setColorModeState] = useState<ColorMode>(getInitialColorMode);

  // Apply theme to document on mount and when colorMode changes
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", colorMode);
    localStorage.setItem(STORAGE_KEY, colorMode);

    // Apply/clear inline styles based on color mode
    // This is needed because shop themes use inline styles which override CSS
    if (colorMode === "light") {
      applyLightThemeStyles();
    } else {
      clearInlineThemeStyles();
      // Note: In dark mode, the shop ThemeProvider will re-apply its theme
    }
  }, [colorMode]);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");

    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't manually set a preference
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        setColorModeState(e.matches ? "light" : "dark");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const toggleColorMode = () => {
    setColorModeState((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const setColorMode = (mode: ColorMode) => {
    setColorModeState(mode);
  };

  return (
    <ColorModeContext.Provider
      value={{
        colorMode,
        toggleColorMode,
        setColorMode,
        isDark: colorMode === "dark",
        isLight: colorMode === "light",
      }}
    >
      {children}
    </ColorModeContext.Provider>
  );
}

export function useColorMode() {
  const context = useContext(ColorModeContext);
  if (!context) {
    throw new Error("useColorMode must be used within ColorModeProvider");
  }
  return context;
}
