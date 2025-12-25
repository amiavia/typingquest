# PRP-032: Keyboard Skins Implementation

**Status**: DRAFT
**Author**: Claude + Anton
**Date**: 2025-12-26
**Priority**: MEDIUM
**Estimated Effort**: 2 phases, ~15 tasks

---

## Executive Summary

This PRP implements the keyboard skins feature, allowing equipped keyboard skins from the shop to visually change the on-screen keyboard appearance. Similar to the visual themes system (PRP-016), skins use CSS variables applied dynamically based on the user's equipped skin.

---

## Problem Statement

### Current State

1. **Shop sells keyboard skins** but they have no effect when equipped
2. **Users can purchase skins** like "Wooden Keys", "Neon Glow", "Holographic" but see no visual change
3. **No differentiation** between owning and not owning a skin beyond the shop UI

### Success Criteria

- [ ] Equipped keyboard skin changes keyboard visual appearance
- [ ] Skin affects key background, borders, text colors, and special effects
- [ ] Skins work alongside themes (themes = overall UI, skins = keyboard specific)
- [ ] Default keyboard appearance when no skin equipped
- [ ] Skin preview in shop before purchase
- [ ] Smooth transition when switching skins

---

## Proposed Solution

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  KEYBOARD SKINS SYSTEM                                          │
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │ Shop         │───▶│ Equipped     │───▶│ Skin         │      │
│  │ Purchase     │    │ Inventory    │    │ Provider     │      │
│  └──────────────┘    └──────────────┘    └──────┬───────┘      │
│                                                 │               │
│                                                 ▼               │
│                                        ┌──────────────┐        │
│                                        │ CSS Variables│        │
│                                        │ Applied to   │        │
│                                        │ Keyboard     │        │
│                                        └──────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

### Skin CSS Variables

Each skin defines these CSS variables applied to the keyboard component:

```typescript
interface KeyboardSkin {
  id: string;
  name: string;
  cssVariables: {
    // Key appearance
    '--skin-key-bg': string;
    '--skin-key-bg-hover': string;
    '--skin-key-bg-active': string;
    '--skin-key-border': string;
    '--skin-key-border-width': string;
    '--skin-key-text': string;
    '--skin-key-shadow': string;

    // Special key states
    '--skin-key-highlight-bg': string;      // Current target key
    '--skin-key-highlight-border': string;
    '--skin-key-correct-bg': string;        // Correctly typed
    '--skin-key-incorrect-bg': string;      // Error state

    // Effects
    '--skin-key-glow': string;              // Optional glow effect
    '--skin-key-gradient': string;          // Optional gradient
    '--skin-key-border-radius': string;

    // Home row indicators
    '--skin-home-indicator-color': string;
  };
}
```

---

## Skin Definitions

### Default (No Skin)

```typescript
const defaultSkin: KeyboardSkin = {
  id: 'default',
  name: 'Default',
  cssVariables: {
    '--skin-key-bg': '#1a1a2e',
    '--skin-key-bg-hover': '#2a2a3e',
    '--skin-key-bg-active': '#3a3a4e',
    '--skin-key-border': '#3bceac',
    '--skin-key-border-width': '2px',
    '--skin-key-text': '#eef5db',
    '--skin-key-shadow': '2px 2px 0 #0f0f1b',
    '--skin-key-highlight-bg': '#ffd93d',
    '--skin-key-highlight-border': '#ffd93d',
    '--skin-key-correct-bg': '#0ead69',
    '--skin-key-incorrect-bg': '#e63946',
    '--skin-key-glow': 'none',
    '--skin-key-gradient': 'none',
    '--skin-key-border-radius': '4px',
    '--skin-home-indicator-color': '#ffd93d',
  },
};
```

### Wooden Keys (Common - 100 coins)

```typescript
const woodenKeysSkin: KeyboardSkin = {
  id: 'wooden-keys',
  name: 'Wooden Keys',
  cssVariables: {
    '--skin-key-bg': '#8B4513',
    '--skin-key-bg-hover': '#A0522D',
    '--skin-key-bg-active': '#CD853F',
    '--skin-key-border': '#5D3A1A',
    '--skin-key-border-width': '3px',
    '--skin-key-text': '#FFF8DC',
    '--skin-key-shadow': '3px 3px 0 #3D2314',
    '--skin-key-highlight-bg': '#DAA520',
    '--skin-key-highlight-border': '#B8860B',
    '--skin-key-correct-bg': '#228B22',
    '--skin-key-incorrect-bg': '#8B0000',
    '--skin-key-glow': 'none',
    '--skin-key-gradient': 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #8B4513 100%)',
    '--skin-key-border-radius': '6px',
    '--skin-home-indicator-color': '#DAA520',
  },
};
```

### Neon Glow (Rare - 250 coins)

```typescript
const neonGlowSkin: KeyboardSkin = {
  id: 'neon-glow',
  name: 'Neon Glow',
  cssVariables: {
    '--skin-key-bg': '#0a0a0f',
    '--skin-key-bg-hover': '#1a1a2f',
    '--skin-key-bg-active': '#2a2a3f',
    '--skin-key-border': '#00ffff',
    '--skin-key-border-width': '2px',
    '--skin-key-text': '#00ffff',
    '--skin-key-shadow': '0 0 10px #00ffff, 0 0 20px #00ffff',
    '--skin-key-highlight-bg': '#ff00ff',
    '--skin-key-highlight-border': '#ff00ff',
    '--skin-key-correct-bg': '#00ff00',
    '--skin-key-incorrect-bg': '#ff0066',
    '--skin-key-glow': '0 0 15px currentColor',
    '--skin-key-gradient': 'none',
    '--skin-key-border-radius': '4px',
    '--skin-home-indicator-color': '#ff00ff',
  },
};
```

### Holographic (Epic - 550 coins)

```typescript
const holographicSkin: KeyboardSkin = {
  id: 'holographic',
  name: 'Holographic',
  cssVariables: {
    '--skin-key-bg': 'linear-gradient(135deg, #ff6b6b 0%, #feca57 25%, #48dbfb 50%, #ff9ff3 75%, #ff6b6b 100%)',
    '--skin-key-bg-hover': 'linear-gradient(135deg, #feca57 0%, #48dbfb 25%, #ff9ff3 50%, #ff6b6b 75%, #feca57 100%)',
    '--skin-key-bg-active': 'linear-gradient(135deg, #48dbfb 0%, #ff9ff3 25%, #ff6b6b 50%, #feca57 75%, #48dbfb 100%)',
    '--skin-key-border': '#ffffff',
    '--skin-key-border-width': '2px',
    '--skin-key-text': '#ffffff',
    '--skin-key-shadow': '0 0 10px rgba(255,255,255,0.5)',
    '--skin-key-highlight-bg': '#ffffff',
    '--skin-key-highlight-border': '#ffffff',
    '--skin-key-correct-bg': '#00ff88',
    '--skin-key-incorrect-bg': '#ff4444',
    '--skin-key-glow': '0 0 20px rgba(255,255,255,0.3)',
    '--skin-key-gradient': 'linear-gradient(135deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3)',
    '--skin-key-border-radius': '8px',
    '--skin-home-indicator-color': '#ffffff',
  },
};
```

### Mechanical RGB (Legendary - 400 coins, Premium)

```typescript
const mechanicalRgbSkin: KeyboardSkin = {
  id: 'mechanical-rgb',
  name: 'Mechanical RGB',
  cssVariables: {
    '--skin-key-bg': '#1a1a1a',
    '--skin-key-bg-hover': '#2a2a2a',
    '--skin-key-bg-active': '#3a3a3a',
    '--skin-key-border': 'transparent',
    '--skin-key-border-width': '0',
    '--skin-key-text': '#ffffff',
    '--skin-key-shadow': '0 4px 0 #000000, 0 0 15px rgba(255,0,255,0.5)',
    '--skin-key-highlight-bg': '#ff00ff',
    '--skin-key-highlight-border': '#ff00ff',
    '--skin-key-correct-bg': '#00ff00',
    '--skin-key-incorrect-bg': '#ff0000',
    '--skin-key-glow': '0 0 20px currentColor, inset 0 -5px 10px rgba(255,0,255,0.3)',
    '--skin-key-gradient': 'none',
    '--skin-key-border-radius': '4px',
    '--skin-home-indicator-color': '#ff00ff',
  },
};
```

---

## Implementation

### Phase 1: Skin Data & Provider

#### 1.1 Create Skin Definitions

**New file: `src/data/keyboardSkins.ts`**

```typescript
export interface KeyboardSkin {
  id: string;
  name: string;
  cssVariables: Record<string, string>;
}

export const KEYBOARD_SKINS: Record<string, KeyboardSkin> = {
  'default': defaultSkin,
  'wooden-keys': woodenKeysSkin,
  'neon-glow': neonGlowSkin,
  'holographic': holographicSkin,
  'mechanical-rgb': mechanicalRgbSkin,
};

export function getKeyboardSkin(skinId: string | undefined): KeyboardSkin {
  if (!skinId || !KEYBOARD_SKINS[skinId]) {
    return KEYBOARD_SKINS['default'];
  }
  return KEYBOARD_SKINS[skinId];
}

export function applySkin(skin: KeyboardSkin, element: HTMLElement): void {
  Object.entries(skin.cssVariables).forEach(([key, value]) => {
    element.style.setProperty(key, value);
  });
}
```

#### 1.2 Create Skin Provider

**New file: `src/providers/KeyboardSkinProvider.tsx`**

```typescript
import { useEffect, createContext, useContext } from 'react';
import { useQuery } from 'convex/react';
import { useAuth } from '@clerk/clerk-react';
import { api } from '../../convex/_generated/api';
import { getKeyboardSkin, type KeyboardSkin } from '../data/keyboardSkins';

interface SkinContextValue {
  currentSkin: KeyboardSkin;
  skinId: string | undefined;
}

const SkinContext = createContext<SkinContextValue>({
  currentSkin: getKeyboardSkin('default'),
  skinId: undefined,
});

export function useKeyboardSkin() {
  return useContext(SkinContext);
}

export function KeyboardSkinProvider({ children }: { children: React.ReactNode }) {
  const { userId } = useAuth();

  const equippedItems = useQuery(
    api.shop.getEquippedItems,
    userId ? { clerkId: userId } : 'skip'
  );

  const skinId = equippedItems?.['keyboard-skin']?.itemId;
  const currentSkin = getKeyboardSkin(skinId);

  return (
    <SkinContext.Provider value={{ currentSkin, skinId }}>
      {children}
    </SkinContext.Provider>
  );
}
```

### Phase 2: Keyboard Component Integration

#### 2.1 Update Keyboard Component

**Modify: `src/components/Keyboard.tsx`**

```typescript
import { useKeyboardSkin } from '../providers/KeyboardSkinProvider';

export function Keyboard({ ... }) {
  const { currentSkin } = useKeyboardSkin();
  const keyboardRef = useRef<HTMLDivElement>(null);

  // Apply skin CSS variables to keyboard container
  useEffect(() => {
    if (keyboardRef.current) {
      Object.entries(currentSkin.cssVariables).forEach(([key, value]) => {
        keyboardRef.current!.style.setProperty(key, value);
      });
    }
  }, [currentSkin]);

  return (
    <div ref={keyboardRef} className="keyboard-container">
      {/* Keys use CSS variables like var(--skin-key-bg) */}
    </div>
  );
}
```

#### 2.2 Update Key Styles

**Modify: `src/index.css` or keyboard styles**

```css
.keyboard-key {
  background: var(--skin-key-bg);
  border: var(--skin-key-border-width) solid var(--skin-key-border);
  border-radius: var(--skin-key-border-radius);
  color: var(--skin-key-text);
  box-shadow: var(--skin-key-shadow);
  transition: all 0.1s ease;
}

.keyboard-key:hover {
  background: var(--skin-key-bg-hover);
}

.keyboard-key.active,
.keyboard-key:active {
  background: var(--skin-key-bg-active);
}

.keyboard-key.highlight {
  background: var(--skin-key-highlight-bg);
  border-color: var(--skin-key-highlight-border);
  box-shadow: var(--skin-key-glow);
}

.keyboard-key.correct {
  background: var(--skin-key-correct-bg);
}

.keyboard-key.incorrect {
  background: var(--skin-key-incorrect-bg);
}

.keyboard-key .home-indicator {
  background: var(--skin-home-indicator-color);
}
```

#### 2.3 Add Provider to App

**Modify: `src/main.tsx`**

```typescript
import { KeyboardSkinProvider } from './providers/KeyboardSkinProvider';

// Add inside providers chain:
<KeyboardSkinProvider>
  {children}
</KeyboardSkinProvider>
```

---

## File Structure

```
src/
├── data/
│   └── keyboardSkins.ts          (new) - Skin definitions
├── providers/
│   └── KeyboardSkinProvider.tsx  (new) - Skin context provider
├── components/
│   └── Keyboard.tsx              (modify) - Apply skin CSS vars
├── index.css                     (modify) - Add skin CSS variables
└── main.tsx                      (modify) - Add KeyboardSkinProvider
```

---

## Testing Checklist

- [ ] Default skin appears when no skin equipped
- [ ] Wooden Keys skin changes keyboard to wood appearance
- [ ] Neon Glow skin adds glow effects
- [ ] Holographic skin shows rainbow gradient
- [ ] Mechanical RGB skin shows floating keys with underglow
- [ ] Skin changes instantly when equipped in shop
- [ ] Skins work with all keyboard layouts (QWERTY, QWERTZ, etc.)
- [ ] Skins work alongside themes (don't conflict)
- [ ] Key states (hover, active, highlight, correct, incorrect) work with all skins

---

## Notes

- Skins are keyboard-specific, themes are app-wide
- CSS variables are scoped to the keyboard component
- Gradient backgrounds may need special handling for key states
- Performance: CSS variables are very fast, no re-renders needed
- Accessibility: Ensure contrast ratios meet WCAG standards for all skins
