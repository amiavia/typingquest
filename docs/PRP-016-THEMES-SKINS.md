# PRP-016: Visual Themes and Skins System

**Status**: DRAFT
**Author**: Claude + Anton
**Date**: 2025-12-25
**Priority**: MEDIUM
**Estimated Effort**: 5 phases, ~60 tasks

---

## Executive Summary

This PRP introduces a comprehensive visual theming system for TypeBit8 (the typing practice game), allowing users to customize the visual appearance with multiple color themes. Themes can be unlocked through level progression or purchased with in-game coins, providing both progression incentives and personalization. The system includes default themes (default, dark, light), specialty themes (neon, retro green, ocean), and seasonal exclusive themes, all implemented using CSS variables for maintainability and performance.

---

## Problem Statement

### Current State

1. **Single visual style**: The app currently has one fixed color scheme with no customization options
2. **No personalization**: Users cannot express preferences or adapt the UI to different environments (e.g., dark mode for night use)
3. **Missed progression opportunity**: No visual rewards for leveling up or achieving milestones
4. **No coin sink**: In-game currency has limited uses beyond essential features
5. **Static experience**: The visual experience doesn't change with seasons or special events

### Impact

| Issue | User Impact |
|-------|-------------|
| No dark mode | Eye strain in low-light environments, reduced accessibility |
| No personalization | Lower engagement, less sense of ownership |
| Limited progression rewards | Reduced motivation to continue practicing |
| Unused coins | Currency feels meaningless after initial purchases |
| No seasonal variety | App feels stale, misses engagement opportunities |

### Success Criteria

- [ ] Users can select from 6+ color themes
- [ ] Themes affect background, keyboard colors, UI elements consistently
- [ ] Theme preferences persist across sessions (stored in Convex)
- [ ] Users can preview themes before applying
- [ ] Themes can be unlocked via level progression or coin purchase
- [ ] Seasonal exclusive themes appear during appropriate periods
- [ ] CSS variable-based implementation for easy maintenance
- [ ] Theme switching has no performance impact
- [ ] All themes meet WCAG 2.1 AA accessibility standards for contrast
- [ ] Themes work correctly with all existing UI components

---

## Proposed Solution

### Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  THEME SYSTEM ARCHITECTURE                                                   │
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│  │ Theme        │    │  Unlock      │    │  Theme       │                  │
│  │ Definitions  │ +  │  System      │ +  │  Application │                  │
│  │ (CSS vars)   │    │  (coins/level│    │  (React)     │                  │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘                  │
│         │                   │                   │                           │
│         └───────────────────┼───────────────────┘                           │
│                             ▼                                               │
│                   ┌──────────────────┐                                      │
│                   │ User Preferences │                                      │
│                   │ (Convex DB)      │                                      │
│                   └────────┬─────────┘                                      │
│                            ▼                                                │
│                   ┌──────────────────┐                                      │
│                   │ Applied Theme    │                                      │
│                   │ - Background     │                                      │
│                   │ - Keyboard       │                                      │
│                   │ - UI Elements    │                                      │
│                   └──────────────────┘                                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Architecture / Design

#### 1. Theme Definition Structure

```typescript
// src/data/themes/types.ts

export type ThemeId =
  | 'default'
  | 'dark'
  | 'light'
  | 'neon'
  | 'retro-green'
  | 'ocean'
  | 'autumn-harvest'    // Seasonal: Sep-Nov
  | 'winter-frost'      // Seasonal: Dec-Feb
  | 'spring-bloom';     // Seasonal: Mar-May

export interface ThemeDefinition {
  id: ThemeId;
  name: string;              // Display name (localized key)
  description: string;       // Description (localized key)
  icon: string;              // Emoji or icon identifier
  unlockRequirement: UnlockRequirement;
  cssVariables: ThemeCSSVariables;
  preview: ThemePreview;
  seasonal?: {
    startMonth: number;      // 1-12
    endMonth: number;        // 1-12
    exclusive: boolean;      // Only available during season
  };
}

export interface UnlockRequirement {
  type: 'default' | 'level' | 'coins' | 'seasonal';
  level?: number;            // Required level (if type: 'level')
  coins?: number;            // Cost in coins (if type: 'coins')
}

export interface ThemeCSSVariables {
  // Background
  '--bg-primary': string;
  '--bg-secondary': string;
  '--bg-tertiary': string;

  // Text
  '--text-primary': string;
  '--text-secondary': string;
  '--text-muted': string;

  // Keyboard
  '--key-bg': string;
  '--key-bg-hover': string;
  '--key-bg-active': string;
  '--key-text': string;
  '--key-border': string;
  '--key-highlight': string;      // For current target key
  '--key-correct': string;        // For correctly typed keys
  '--key-incorrect': string;      // For incorrectly typed keys

  // UI Elements
  '--border-color': string;
  '--accent-primary': string;
  '--accent-secondary': string;
  '--success': string;
  '--error': string;
  '--warning': string;
  '--info': string;

  // Interactive
  '--button-bg': string;
  '--button-bg-hover': string;
  '--button-text': string;
  '--input-bg': string;
  '--input-border': string;

  // Special effects
  '--glow-color'?: string;        // For neon theme
  '--shadow-color'?: string;      // For depth effects
  '--gradient-start'?: string;    // For gradient themes
  '--gradient-end'?: string;
}

export interface ThemePreview {
  thumbnail: string;             // Preview image path
  colors: string[];              // Main color swatches for quick preview
}
```

#### 2. Theme Definitions

```typescript
// src/data/themes/definitions.ts

export const THEME_DEFINITIONS: Record<ThemeId, ThemeDefinition> = {
  default: {
    id: 'default',
    name: 'theme.default.name',
    description: 'theme.default.description',
    icon: '🎨',
    unlockRequirement: { type: 'default' },
    cssVariables: {
      '--bg-primary': '#1a1a2e',
      '--bg-secondary': '#16213e',
      '--bg-tertiary': '#0f3460',
      '--text-primary': '#e4e4e4',
      '--text-secondary': '#c4c4c4',
      '--text-muted': '#8a8a8a',
      '--key-bg': '#2d3561',
      '--key-bg-hover': '#3d4571',
      '--key-bg-active': '#4d5581',
      '--key-text': '#e4e4e4',
      '--key-border': '#4d5581',
      '--key-highlight': '#ffd700',
      '--key-correct': '#4caf50',
      '--key-incorrect': '#f44336',
      '--border-color': '#4d5581',
      '--accent-primary': '#ffd700',
      '--accent-secondary': '#00d4ff',
      '--success': '#4caf50',
      '--error': '#f44336',
      '--warning': '#ff9800',
      '--info': '#2196f3',
      '--button-bg': '#ffd700',
      '--button-bg-hover': '#ffed4e',
      '--button-text': '#1a1a2e',
      '--input-bg': '#16213e',
      '--input-border': '#4d5581',
    },
    preview: {
      thumbnail: '/themes/default-preview.png',
      colors: ['#1a1a2e', '#ffd700', '#00d4ff'],
    },
  },

  dark: {
    id: 'dark',
    name: 'theme.dark.name',
    description: 'theme.dark.description',
    icon: '🌙',
    unlockRequirement: { type: 'default' },
    cssVariables: {
      '--bg-primary': '#0d0d0d',
      '--bg-secondary': '#1a1a1a',
      '--bg-tertiary': '#262626',
      '--text-primary': '#ffffff',
      '--text-secondary': '#cccccc',
      '--text-muted': '#808080',
      '--key-bg': '#1a1a1a',
      '--key-bg-hover': '#2a2a2a',
      '--key-bg-active': '#3a3a3a',
      '--key-text': '#ffffff',
      '--key-border': '#3a3a3a',
      '--key-highlight': '#bb86fc',
      '--key-correct': '#03dac6',
      '--key-incorrect': '#cf6679',
      '--border-color': '#3a3a3a',
      '--accent-primary': '#bb86fc',
      '--accent-secondary': '#03dac6',
      '--success': '#03dac6',
      '--error': '#cf6679',
      '--warning': '#ffb74d',
      '--info': '#64b5f6',
      '--button-bg': '#bb86fc',
      '--button-bg-hover': '#d0a3ff',
      '--button-text': '#000000',
      '--input-bg': '#1a1a1a',
      '--input-border': '#3a3a3a',
    },
    preview: {
      thumbnail: '/themes/dark-preview.png',
      colors: ['#0d0d0d', '#bb86fc', '#03dac6'],
    },
  },

  light: {
    id: 'light',
    name: 'theme.light.name',
    description: 'theme.light.description',
    icon: '☀️',
    unlockRequirement: { type: 'level', level: 5 },
    cssVariables: {
      '--bg-primary': '#f5f5f5',
      '--bg-secondary': '#ffffff',
      '--bg-tertiary': '#e0e0e0',
      '--text-primary': '#212121',
      '--text-secondary': '#424242',
      '--text-muted': '#757575',
      '--key-bg': '#ffffff',
      '--key-bg-hover': '#f5f5f5',
      '--key-bg-active': '#e0e0e0',
      '--key-text': '#212121',
      '--key-border': '#bdbdbd',
      '--key-highlight': '#1976d2',
      '--key-correct': '#388e3c',
      '--key-incorrect': '#d32f2f',
      '--border-color': '#bdbdbd',
      '--accent-primary': '#1976d2',
      '--accent-secondary': '#388e3c',
      '--success': '#388e3c',
      '--error': '#d32f2f',
      '--warning': '#f57c00',
      '--info': '#0288d1',
      '--button-bg': '#1976d2',
      '--button-bg-hover': '#1565c0',
      '--button-text': '#ffffff',
      '--input-bg': '#ffffff',
      '--input-border': '#bdbdbd',
    },
    preview: {
      thumbnail: '/themes/light-preview.png',
      colors: ['#f5f5f5', '#1976d2', '#388e3c'],
    },
  },

  neon: {
    id: 'neon',
    name: 'theme.neon.name',
    description: 'theme.neon.description',
    icon: '💡',
    unlockRequirement: { type: 'coins', coins: 500 },
    cssVariables: {
      '--bg-primary': '#0a0a0a',
      '--bg-secondary': '#151515',
      '--bg-tertiary': '#1f1f1f',
      '--text-primary': '#00ffff',
      '--text-secondary': '#00cccc',
      '--text-muted': '#008888',
      '--key-bg': '#1a1a1a',
      '--key-bg-hover': '#2a2a2a',
      '--key-bg-active': '#3a3a3a',
      '--key-text': '#00ffff',
      '--key-border': '#00ffff',
      '--key-highlight': '#ff00ff',
      '--key-correct': '#00ff00',
      '--key-incorrect': '#ff0066',
      '--border-color': '#00ffff',
      '--accent-primary': '#ff00ff',
      '--accent-secondary': '#00ff00',
      '--success': '#00ff00',
      '--error': '#ff0066',
      '--warning': '#ffff00',
      '--info': '#00ffff',
      '--button-bg': '#ff00ff',
      '--button-bg-hover': '#ff66ff',
      '--button-text': '#0a0a0a',
      '--input-bg': '#151515',
      '--input-border': '#00ffff',
      '--glow-color': '#00ffff',
      '--shadow-color': 'rgba(0, 255, 255, 0.5)',
    },
    preview: {
      thumbnail: '/themes/neon-preview.png',
      colors: ['#0a0a0a', '#00ffff', '#ff00ff'],
    },
  },

  'retro-green': {
    id: 'retro-green',
    name: 'theme.retro-green.name',
    description: 'theme.retro-green.description',
    icon: '🖥️',
    unlockRequirement: { type: 'level', level: 10 },
    cssVariables: {
      '--bg-primary': '#0d1b0d',
      '--bg-secondary': '#0f1f0f',
      '--bg-tertiary': '#132613',
      '--text-primary': '#33ff33',
      '--text-secondary': '#29cc29',
      '--text-muted': '#1f991f',
      '--key-bg': '#0f1f0f',
      '--key-bg-hover': '#132613',
      '--key-bg-active': '#1a331a',
      '--key-text': '#33ff33',
      '--key-border': '#33ff33',
      '--key-highlight': '#66ff66',
      '--key-correct': '#99ff99',
      '--key-incorrect': '#ffff33',
      '--border-color': '#33ff33',
      '--accent-primary': '#66ff66',
      '--accent-secondary': '#99ff99',
      '--success': '#99ff99',
      '--error': '#ffff33',
      '--warning': '#ffcc33',
      '--info': '#33ff33',
      '--button-bg': '#33ff33',
      '--button-bg-hover': '#66ff66',
      '--button-text': '#0d1b0d',
      '--input-bg': '#0f1f0f',
      '--input-border': '#33ff33',
      '--shadow-color': 'rgba(51, 255, 51, 0.3)',
    },
    preview: {
      thumbnail: '/themes/retro-green-preview.png',
      colors: ['#0d1b0d', '#33ff33', '#66ff66'],
    },
  },

  ocean: {
    id: 'ocean',
    name: 'theme.ocean.name',
    description: 'theme.ocean.description',
    icon: '🌊',
    unlockRequirement: { type: 'coins', coins: 750 },
    cssVariables: {
      '--bg-primary': '#001f3f',
      '--bg-secondary': '#003366',
      '--bg-tertiary': '#004d7a',
      '--text-primary': '#e6f7ff',
      '--text-secondary': '#b3e5ff',
      '--text-muted': '#80d4ff',
      '--key-bg': '#003d6b',
      '--key-bg-hover': '#004d7a',
      '--key-bg-active': '#006699',
      '--key-text': '#e6f7ff',
      '--key-border': '#0099cc',
      '--key-highlight': '#00ccff',
      '--key-correct': '#00e6ac',
      '--key-incorrect': '#ff6b6b',
      '--border-color': '#0099cc',
      '--accent-primary': '#00ccff',
      '--accent-secondary': '#00e6ac',
      '--success': '#00e6ac',
      '--error': '#ff6b6b',
      '--warning': '#ffd93d',
      '--info': '#00ccff',
      '--button-bg': '#00ccff',
      '--button-bg-hover': '#33d9ff',
      '--button-text': '#001f3f',
      '--input-bg': '#003366',
      '--input-border': '#0099cc',
      '--gradient-start': '#001f3f',
      '--gradient-end': '#004d7a',
    },
    preview: {
      thumbnail: '/themes/ocean-preview.png',
      colors: ['#001f3f', '#00ccff', '#00e6ac'],
    },
  },

  'winter-frost': {
    id: 'winter-frost',
    name: 'theme.winter-frost.name',
    description: 'theme.winter-frost.description',
    icon: '❄️',
    unlockRequirement: { type: 'seasonal' },
    seasonal: {
      startMonth: 12,
      endMonth: 2,
      exclusive: true,
    },
    cssVariables: {
      '--bg-primary': '#e6f2ff',
      '--bg-secondary': '#f0f8ff',
      '--bg-tertiary': '#d9ecff',
      '--text-primary': '#1a3d5c',
      '--text-secondary': '#2d5473',
      '--text-muted': '#7099b3',
      '--key-bg': '#ffffff',
      '--key-bg-hover': '#f0f8ff',
      '--key-bg-active': '#d9ecff',
      '--key-text': '#1a3d5c',
      '--key-border': '#b3d9ff',
      '--key-highlight': '#0066cc',
      '--key-correct': '#009973',
      '--key-incorrect': '#cc3333',
      '--border-color': '#b3d9ff',
      '--accent-primary': '#0066cc',
      '--accent-secondary': '#80c1ff',
      '--success': '#009973',
      '--error': '#cc3333',
      '--warning': '#ff8800',
      '--info': '#0066cc',
      '--button-bg': '#0066cc',
      '--button-bg-hover': '#0052a3',
      '--button-text': '#ffffff',
      '--input-bg': '#ffffff',
      '--input-border': '#b3d9ff',
      '--gradient-start': '#e6f2ff',
      '--gradient-end': '#f0f8ff',
    },
    preview: {
      thumbnail: '/themes/winter-frost-preview.png',
      colors: ['#e6f2ff', '#0066cc', '#80c1ff'],
    },
  },
};
```

#### 3. Theme Management System

```typescript
// src/hooks/useTheme.ts

export interface UseThemeReturn {
  currentTheme: ThemeId;
  availableThemes: ThemeDefinition[];
  unlockedThemes: ThemeId[];
  setTheme: (themeId: ThemeId) => Promise<void>;
  unlockTheme: (themeId: ThemeId, cost: number) => Promise<boolean>;
  isThemeUnlocked: (themeId: ThemeId) => boolean;
  isThemeAvailable: (themeId: ThemeId) => boolean;  // Checks seasonal availability
  previewTheme: (themeId: ThemeId) => void;
  cancelPreview: () => void;
}

export function useTheme(): UseThemeReturn {
  const user = useUser();
  const updateUser = useMutation(api.users.update);
  const [previewThemeId, setPreviewThemeId] = useState<ThemeId | null>(null);

  // Apply CSS variables to document root
  useEffect(() => {
    const themeId = previewThemeId || user?.theme || 'default';
    const theme = THEME_DEFINITIONS[themeId];

    const root = document.documentElement;
    Object.entries(theme.cssVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    return () => {
      if (previewThemeId) {
        // Restore original theme on unmount
        const originalTheme = THEME_DEFINITIONS[user?.theme || 'default'];
        Object.entries(originalTheme.cssVariables).forEach(([key, value]) => {
          root.style.setProperty(key, value);
        });
      }
    };
  }, [previewThemeId, user?.theme]);

  const setTheme = async (themeId: ThemeId) => {
    if (!isThemeUnlocked(themeId)) {
      throw new Error('Theme not unlocked');
    }
    await updateUser({ theme: themeId });
  };

  const unlockTheme = async (themeId: ThemeId, cost: number) => {
    const theme = THEME_DEFINITIONS[themeId];
    if (theme.unlockRequirement.type !== 'coins') {
      return false;
    }

    if (user.coins < cost) {
      return false;
    }

    await updateUser({
      unlockedThemes: [...(user.unlockedThemes || []), themeId],
      coins: user.coins - cost,
    });

    return true;
  };

  const isThemeUnlocked = (themeId: ThemeId): boolean => {
    const theme = THEME_DEFINITIONS[themeId];

    if (theme.unlockRequirement.type === 'default') {
      return true;
    }

    if (theme.unlockRequirement.type === 'level') {
      return (user?.level || 1) >= (theme.unlockRequirement.level || 0);
    }

    if (theme.unlockRequirement.type === 'coins') {
      return user?.unlockedThemes?.includes(themeId) || false;
    }

    if (theme.unlockRequirement.type === 'seasonal') {
      return isThemeAvailable(themeId);
    }

    return false;
  };

  const isThemeAvailable = (themeId: ThemeId): boolean => {
    const theme = THEME_DEFINITIONS[themeId];

    if (!theme.seasonal) {
      return true;
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12

    const { startMonth, endMonth } = theme.seasonal;

    // Handle cross-year seasons (e.g., Dec-Feb)
    if (startMonth > endMonth) {
      return currentMonth >= startMonth || currentMonth <= endMonth;
    }

    return currentMonth >= startMonth && currentMonth <= endMonth;
  };

  return {
    currentTheme: user?.theme || 'default',
    availableThemes: Object.values(THEME_DEFINITIONS).filter(isThemeAvailable),
    unlockedThemes: user?.unlockedThemes || [],
    setTheme,
    unlockTheme,
    isThemeUnlocked,
    isThemeAvailable,
    previewTheme: setPreviewThemeId,
    cancelPreview: () => setPreviewThemeId(null),
  };
}
```

#### 4. Theme Selector UI Component

```typescript
// src/components/ThemeSelector.tsx

export function ThemeSelector() {
  const { t } = useTranslation();
  const {
    currentTheme,
    availableThemes,
    unlockedThemes,
    setTheme,
    unlockTheme,
    isThemeUnlocked,
    previewTheme,
    cancelPreview,
  } = useTheme();

  const [selectedTheme, setSelectedTheme] = useState<ThemeId | null>(null);

  const handleThemeClick = (themeId: ThemeId) => {
    setSelectedTheme(themeId);
    previewTheme(themeId);
  };

  const handleApply = async () => {
    if (selectedTheme && isThemeUnlocked(selectedTheme)) {
      await setTheme(selectedTheme);
      setSelectedTheme(null);
      cancelPreview();
    }
  };

  const handleUnlock = async (themeId: ThemeId, cost: number) => {
    const success = await unlockTheme(themeId, cost);
    if (success) {
      await setTheme(themeId);
    }
  };

  return (
    <div className="theme-selector">
      <h2>{t('theme.selector.title')}</h2>

      <div className="theme-grid">
        {availableThemes.map((theme) => {
          const unlocked = isThemeUnlocked(theme.id);
          const active = currentTheme === theme.id;
          const previewing = selectedTheme === theme.id;

          return (
            <ThemeCard
              key={theme.id}
              theme={theme}
              unlocked={unlocked}
              active={active}
              previewing={previewing}
              onClick={() => handleThemeClick(theme.id)}
              onUnlock={() => handleUnlock(theme.id, theme.unlockRequirement.coins!)}
            />
          );
        })}
      </div>

      {selectedTheme && (
        <div className="theme-preview-actions">
          <button onClick={handleApply}>
            {t('theme.selector.apply')}
          </button>
          <button onClick={() => {
            setSelectedTheme(null);
            cancelPreview();
          }}>
            {t('theme.selector.cancel')}
          </button>
        </div>
      )}
    </div>
  );
}
```

#### 5. Convex Schema Updates

```typescript
// convex/schema.ts

export default defineSchema({
  users: defineTable({
    // ... existing fields
    theme: v.optional(v.string()),  // Current active theme
    unlockedThemes: v.optional(v.array(v.string())),  // Purchased themes
  }),
});
```

---

## File Structure

```
src/
├── data/
│   └── themes/
│       ├── types.ts           # Theme type definitions
│       ├── definitions.ts     # All theme configurations
│       └── index.ts           # Theme registry exports
├── hooks/
│   └── useTheme.ts            # Theme management hook
├── components/
│   ├── ThemeSelector.tsx      # Theme selection UI
│   ├── ThemeCard.tsx          # Individual theme preview card
│   └── ThemePreview.tsx       # Theme preview modal
├── styles/
│   ├── themes.css             # CSS variables base
│   └── theme-effects.css      # Special effects (neon glow, etc.)
└── i18n/
    └── locales/
        ├── en.json            # Theme names/descriptions
        ├── de.json
        └── ...

convex/
└── users.ts                   # Updated with theme fields

public/
└── themes/
    ├── default-preview.png
    ├── dark-preview.png
    ├── light-preview.png
    ├── neon-preview.png
    ├── retro-green-preview.png
    ├── ocean-preview.png
    └── winter-frost-preview.png
```

---

## Implementation Order

### Phase 1: Foundation (CSS Variables & Types)
1. Create theme type definitions
2. Define CSS variable structure
3. Set up base CSS with variables
4. Update existing components to use CSS variables

### Phase 2: Theme Definitions
1. Create all theme definitions with CSS variables
2. Implement default, dark, and light themes
3. Add specialty themes (neon, retro-green, ocean)
4. Create seasonal theme definitions

### Phase 3: Theme Management
1. Create useTheme hook
2. Implement theme switching logic
3. Add theme preview functionality
4. Update Convex schema for theme persistence

### Phase 4: UI Components
1. Create ThemeSelector component
2. Create ThemeCard component
3. Add theme preview modal
4. Implement unlock/purchase flow

### Phase 5: Integration & Polish
1. Add theme unlock via level progression
2. Implement seasonal theme availability
3. Add theme preview images
4. Test accessibility (contrast ratios)
5. Add animations/transitions

---

## Notes

### Accessibility Considerations
- All themes must meet WCAG 2.1 AA standards (4.5:1 contrast ratio for normal text)
- Provide theme descriptions for screen readers
- Support prefers-color-scheme media query as fallback
- Ensure keyboard navigation works in theme selector

### Performance Considerations
- Use CSS variables for instant theme switching (no re-render)
- Lazy load theme preview images
- Cache theme definitions in memory
- Debounce theme preview to avoid excessive DOM updates

### Future Enhancements
- Theme creator/customizer for advanced users
- Community themes marketplace
- Animated themes with gradient transitions
- Theme-specific sound effects
- Export/import custom themes

### Seasonal Theme Schedule
- **Winter Frost** (Dec-Feb): Icy blues, white, silver
- **Spring Bloom** (Mar-May): Pastels, greens, florals
- **Summer Heat** (Jun-Aug): Bright, warm colors
- **Autumn Harvest** (Sep-Nov): Orange, brown, warm tones

### Unlock Progression
- **Default & Dark**: Always available
- **Light**: Unlock at level 5
- **Neon**: 500 coins
- **Retro Green**: Level 10
- **Ocean**: 750 coins
- **Seasonal**: Auto-unlock during season, exclusive to that period
