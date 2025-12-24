# PRP-018: Visual Keyboard Customization System

**Status**: DRAFT
**Author**: Claude + Anton
**Date**: 2025-12-25
**Priority**: MEDIUM
**Estimated Effort**: 3 phases, ~28 tasks

---

## Executive Summary

This PRP introduces a visual keyboard customization system for TypeBit8. Users will be able to customize the on-screen practice keyboard with multiple visual styles (mechanical, retro, minimal, RGB), color schemes that match game themes, and different key cap styles. Keyboards can be unlocked through achievements or in-game purchases, previewed before applying, and preferences persist across sessions.

---

## Problem Statement

### Current State

1. **Single keyboard style**: The practice keyboard has one fixed visual style
2. **No personalization**: Users cannot customize their typing practice environment
3. **Limited engagement**: No progression system tied to visual customization
4. **Monotonous experience**: Same keyboard appearance becomes stale over time

### Impact

| Issue | User Impact |
|-------|-------------|
| Fixed style | Reduces sense of ownership and personalization |
| No variety | Long-term users lose visual interest |
| Missing progression | No cosmetic rewards for achievements |
| Limited monetization | No optional purchases for cosmetic upgrades |

### Success Criteria

- [ ] 5+ distinct keyboard visual styles available
- [ ] 8+ color schemes matching TypeBit8 themes
- [ ] 3+ key cap shape options (round, square, flat)
- [ ] Animated key press feedback for each style
- [ ] Unlock system via achievements and/or purchase
- [ ] Preview system before applying changes
- [ ] Keyboard preference persists in Convex database
- [ ] Smooth transitions between keyboard styles

---

## Keyboard Design System

### Design Principles

1. **8-bit Aesthetic**: All styles maintain retro gaming feel
2. **Clear Readability**: Key labels must remain highly legible
3. **Performance**: Animations must be smooth (60fps)
4. **Accessibility**: High contrast options for readability
5. **Modularity**: Styles, colors, and shapes can be mixed and matched

### Keyboard Styles

| Style | Description | Unlock Method |
|-------|-------------|---------------|
| **Default** | Classic pixel keyboard, simple and clean | Default (unlocked) |
| **Mechanical** | Chunky keys with visible switches, depth shadows | Level 5 |
| **Retro Terminal** | Green-on-black CRT aesthetic, scanlines effect | Complete 10 lessons |
| **Neon RGB** | Colorful RGB lighting effects, modern gaming | Level 10 |
| **Minimal Flat** | Ultra-clean, flat design, no shadows | Achievement: 95% accuracy |
| **Cyberpunk** | Glitchy effects, angular design, futuristic | Purchase (500 coins) |
| **Arcade Cabinet** | Button-style keys, arcade machine aesthetic | Level 15 |

### Color Schemes

All color schemes use TypeBit8's core palette as foundation:

| Scheme | Base | Accent | Text | Unlock |
|--------|------|--------|------|--------|
| **Classic Yellow** | `#ffd93d` | `#3bceac` | `#1a1a2e` | Default |
| **Cyber Cyan** | `#3bceac` | `#ffd93d` | `#1a1a2e` | Level 3 |
| **Matrix Green** | `#0ead69` | `#ffd93d` | `#1a1a2e` | Level 5 |
| **Bubblegum Pink** | `#ff6b9d` | `#ffd93d` | `#1a1a2e` | Level 7 |
| **Dark Mode** | `#1a1a2e` | `#ffd93d` | `#eef5db` | Level 10 |
| **Sunset Gradient** | `#ff6b9d → #ffd93d` | `#3bceac` | `#1a1a2e` | Achievement |
| **Ocean Waves** | `#3bceac → #0ead69` | `#ffd93d` | `#1a1a2e` | Achievement |
| **Retro CRT** | `#0ead69` | `#0ead69` | `#1a1a2e` | Purchase |

### Key Cap Styles

| Style | Description | Visual |
|-------|-------------|--------|
| **Square** | Default, classic keyboard keys | Sharp corners, pixel-perfect |
| **Rounded** | Softer, friendlier appearance | 4px border-radius |
| **Flat** | Ultra-minimal, no depth | No shadows, flat surface |

### Animation Variants

Each keyboard style has unique press animations:

- **Default**: Simple scale down + brightness increase
- **Mechanical**: Key depresses with switch click, shadow shifts
- **Retro Terminal**: Character flicker + scanline pulse
- **Neon RGB**: Color wave ripple on press
- **Minimal Flat**: Subtle opacity change
- **Cyberpunk**: Glitch effect + pixel distortion
- **Arcade Cabinet**: Button push with spring-back

---

## Phase 1: Data Models & Storage

### 1.1 Keyboard Configuration Types

**New file: `src/types/keyboard.ts`**

```typescript
export type KeyboardStyle =
  | 'default'
  | 'mechanical'
  | 'retro-terminal'
  | 'neon-rgb'
  | 'minimal-flat'
  | 'cyberpunk'
  | 'arcade-cabinet';

export type ColorScheme =
  | 'classic-yellow'
  | 'cyber-cyan'
  | 'matrix-green'
  | 'bubblegum-pink'
  | 'dark-mode'
  | 'sunset-gradient'
  | 'ocean-waves'
  | 'retro-crt';

export type KeyCapStyle = 'square' | 'rounded' | 'flat';

export interface KeyboardConfig {
  style: KeyboardStyle;
  colorScheme: ColorScheme;
  keyCapStyle: KeyCapStyle;
}

export interface KeyboardStyleDefinition {
  id: KeyboardStyle;
  name: string;
  description: string;
  unlockRequirement: UnlockRequirement;
  previewImage: string;
  cssClass: string;
  animationClass: string;
}

export interface ColorSchemeDefinition {
  id: ColorScheme;
  name: string;
  baseColor: string;
  accentColor: string;
  textColor: string;
  backgroundColor?: string;
  unlockRequirement: UnlockRequirement;
}

export type UnlockRequirement =
  | { type: 'default' }
  | { type: 'level'; level: number }
  | { type: 'achievement'; achievementId: string }
  | { type: 'purchase'; cost: number };
```

### 1.2 Keyboard Metadata

**New file: `src/data/keyboards.ts`**

```typescript
import type {
  KeyboardStyleDefinition,
  ColorSchemeDefinition,
  KeyboardConfig
} from '../types/keyboard';

export const KEYBOARD_STYLES: KeyboardStyleDefinition[] = [
  {
    id: 'default',
    name: 'Classic Pixel',
    description: 'Clean and simple pixel keyboard',
    unlockRequirement: { type: 'default' },
    previewImage: '/keyboard-previews/default.png',
    cssClass: 'keyboard-default',
    animationClass: 'key-press-default',
  },
  {
    id: 'mechanical',
    name: 'Mechanical',
    description: 'Chunky keys with visible switches',
    unlockRequirement: { type: 'level', level: 5 },
    previewImage: '/keyboard-previews/mechanical.png',
    cssClass: 'keyboard-mechanical',
    animationClass: 'key-press-mechanical',
  },
  {
    id: 'retro-terminal',
    name: 'Retro Terminal',
    description: 'Classic CRT monitor aesthetic',
    unlockRequirement: { type: 'achievement', achievementId: 'complete_10_lessons' },
    previewImage: '/keyboard-previews/retro-terminal.png',
    cssClass: 'keyboard-retro',
    animationClass: 'key-press-retro',
  },
  {
    id: 'neon-rgb',
    name: 'Neon RGB',
    description: 'Colorful RGB lighting effects',
    unlockRequirement: { type: 'level', level: 10 },
    previewImage: '/keyboard-previews/neon-rgb.png',
    cssClass: 'keyboard-neon',
    animationClass: 'key-press-neon',
  },
  {
    id: 'minimal-flat',
    name: 'Minimal Flat',
    description: 'Ultra-clean flat design',
    unlockRequirement: { type: 'achievement', achievementId: 'accuracy_95' },
    previewImage: '/keyboard-previews/minimal-flat.png',
    cssClass: 'keyboard-minimal',
    animationClass: 'key-press-minimal',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Glitchy futuristic aesthetic',
    unlockRequirement: { type: 'purchase', cost: 500 },
    previewImage: '/keyboard-previews/cyberpunk.png',
    cssClass: 'keyboard-cyberpunk',
    animationClass: 'key-press-cyberpunk',
  },
  {
    id: 'arcade-cabinet',
    name: 'Arcade Cabinet',
    description: 'Retro arcade button style',
    unlockRequirement: { type: 'level', level: 15 },
    previewImage: '/keyboard-previews/arcade.png',
    cssClass: 'keyboard-arcade',
    animationClass: 'key-press-arcade',
  },
];

export const COLOR_SCHEMES: ColorSchemeDefinition[] = [
  {
    id: 'classic-yellow',
    name: 'Classic Yellow',
    baseColor: '#ffd93d',
    accentColor: '#3bceac',
    textColor: '#1a1a2e',
    unlockRequirement: { type: 'default' },
  },
  {
    id: 'cyber-cyan',
    name: 'Cyber Cyan',
    baseColor: '#3bceac',
    accentColor: '#ffd93d',
    textColor: '#1a1a2e',
    unlockRequirement: { type: 'level', level: 3 },
  },
  {
    id: 'matrix-green',
    name: 'Matrix Green',
    baseColor: '#0ead69',
    accentColor: '#ffd93d',
    textColor: '#1a1a2e',
    unlockRequirement: { type: 'level', level: 5 },
  },
  {
    id: 'bubblegum-pink',
    name: 'Bubblegum Pink',
    baseColor: '#ff6b9d',
    accentColor: '#ffd93d',
    textColor: '#1a1a2e',
    unlockRequirement: { type: 'level', level: 7 },
  },
  {
    id: 'dark-mode',
    name: 'Dark Mode',
    baseColor: '#1a1a2e',
    accentColor: '#ffd93d',
    textColor: '#eef5db',
    backgroundColor: '#0f0f1e',
    unlockRequirement: { type: 'level', level: 10 },
  },
  {
    id: 'sunset-gradient',
    name: 'Sunset Gradient',
    baseColor: '#ff6b9d',
    accentColor: '#3bceac',
    textColor: '#1a1a2e',
    unlockRequirement: { type: 'achievement', achievementId: 'speed_demon' },
  },
  {
    id: 'ocean-waves',
    name: 'Ocean Waves',
    baseColor: '#3bceac',
    accentColor: '#ffd93d',
    textColor: '#1a1a2e',
    unlockRequirement: { type: 'achievement', achievementId: 'accuracy_master' },
  },
  {
    id: 'retro-crt',
    name: 'Retro CRT',
    baseColor: '#0ead69',
    accentColor: '#0ead69',
    textColor: '#1a1a2e',
    backgroundColor: '#000000',
    unlockRequirement: { type: 'purchase', cost: 300 },
  },
];

export const DEFAULT_KEYBOARD_CONFIG: KeyboardConfig = {
  style: 'default',
  colorScheme: 'classic-yellow',
  keyCapStyle: 'square',
};

export function getKeyboardStyle(id: string): KeyboardStyleDefinition | undefined {
  return KEYBOARD_STYLES.find(s => s.id === id);
}

export function getColorScheme(id: string): ColorSchemeDefinition | undefined {
  return COLOR_SCHEMES.find(c => c.id === id);
}

export function isKeyboardUnlocked(
  style: KeyboardStyleDefinition,
  userLevel: number,
  achievements: string[],
  purchasedItems: string[]
): boolean {
  const req = style.unlockRequirement;

  if (req.type === 'default') return true;
  if (req.type === 'level') return userLevel >= req.level;
  if (req.type === 'achievement') return achievements.includes(req.achievementId);
  if (req.type === 'purchase') return purchasedItems.includes(style.id);

  return false;
}
```

### 1.3 Convex Schema Update

**Modify: `convex/schema.ts`**

```typescript
users: defineTable({
  clerkId: v.string(),
  email: v.optional(v.string()),
  username: v.optional(v.string()),
  imageUrl: v.optional(v.string()),
  avatarId: v.optional(v.string()),
  // NEW: Keyboard customization
  keyboardStyle: v.optional(v.string()),
  keyboardColorScheme: v.optional(v.string()),
  keyboardKeyCapStyle: v.optional(v.string()),
  // NEW: Unlocks and purchases
  purchasedKeyboards: v.optional(v.array(v.string())),
  coins: v.optional(v.number()),
  createdAt: v.number(),
})
```

### 1.4 Convex Functions

**Modify: `convex/users.ts`**

```typescript
export const updateKeyboardConfig = mutation({
  args: {
    style: v.optional(v.string()),
    colorScheme: v.optional(v.string()),
    keyCapStyle: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    const updates: any = {};
    if (args.style) updates.keyboardStyle = args.style;
    if (args.colorScheme) updates.keyboardColorScheme = args.colorScheme;
    if (args.keyCapStyle) updates.keyboardKeyCapStyle = args.keyCapStyle;

    await ctx.db.patch(user._id, updates);
    return { success: true };
  },
});

export const getKeyboardConfig = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return null;

    return {
      style: user.keyboardStyle || 'default',
      colorScheme: user.keyboardColorScheme || 'classic-yellow',
      keyCapStyle: user.keyboardKeyCapStyle || 'square',
    };
  },
});

export const purchaseKeyboard = mutation({
  args: { keyboardId: v.string(), cost: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    const currentCoins = user.coins || 0;
    if (currentCoins < args.cost) {
      throw new Error("Insufficient coins");
    }

    const purchased = user.purchasedKeyboards || [];
    if (purchased.includes(args.keyboardId)) {
      throw new Error("Already purchased");
    }

    await ctx.db.patch(user._id, {
      coins: currentCoins - args.cost,
      purchasedKeyboards: [...purchased, args.keyboardId],
    });

    return { success: true };
  },
});
```

---

## Phase 2: Keyboard Styles & CSS

### 2.1 Base Keyboard Component Structure

**Modify: `src/components/Keyboard.tsx`**

Update existing keyboard component to support dynamic styling:

```typescript
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { getKeyboardStyle, getColorScheme } from '../data/keyboards';
import type { KeyboardConfig } from '../types/keyboard';

interface KeyboardProps {
  activeKey?: string;
  nextKey?: string;
}

export function Keyboard({ activeKey, nextKey }: KeyboardProps) {
  const config = useQuery(api.users.getKeyboardConfig);

  const style = config ? getKeyboardStyle(config.style) : undefined;
  const colorScheme = config ? getColorScheme(config.colorScheme) : undefined;

  return (
    <div
      className={`keyboard-container ${style?.cssClass || 'keyboard-default'}`}
      style={{
        '--key-base-color': colorScheme?.baseColor || '#ffd93d',
        '--key-accent-color': colorScheme?.accentColor || '#3bceac',
        '--key-text-color': colorScheme?.textColor || '#1a1a2e',
      } as React.CSSProperties}
    >
      <div className="keyboard-layout">
        {/* Keyboard rows */}
        {KEYBOARD_LAYOUT.map((row, rowIndex) => (
          <div key={rowIndex} className="keyboard-row">
            {row.map(key => (
              <Key
                key={key}
                keyChar={key}
                isActive={key === activeKey}
                isNext={key === nextKey}
                animationClass={style?.animationClass}
                keyCapStyle={config?.keyCapStyle || 'square'}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 2.2 Individual Key Component

**New file: `src/components/Key.tsx`**

```typescript
interface KeyProps {
  keyChar: string;
  isActive: boolean;
  isNext: boolean;
  animationClass?: string;
  keyCapStyle: 'square' | 'rounded' | 'flat';
}

export function Key({ keyChar, isActive, isNext, animationClass, keyCapStyle }: KeyProps) {
  return (
    <div
      className={`
        keyboard-key
        key-cap-${keyCapStyle}
        ${isActive ? `active ${animationClass || ''}` : ''}
        ${isNext ? 'next' : ''}
      `}
      data-key={keyChar}
    >
      <span className="key-label">{keyChar}</span>
    </div>
  );
}
```

### 2.3 Keyboard Styles CSS

**New file: `src/styles/keyboards.css`**

```css
/* ========================================
   BASE KEYBOARD STYLES
   ======================================== */

.keyboard-container {
  padding: 1rem;
  border-radius: 8px;
  background: var(--key-base-color, #ffd93d);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}

.keyboard-layout {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.keyboard-row {
  display: flex;
  gap: 6px;
  justify-content: center;
}

.keyboard-key {
  min-width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  color: var(--key-text-color, #1a1a2e);
  background: var(--key-accent-color, #3bceac);
  border: 3px solid var(--key-text-color, #1a1a2e);
  cursor: default;
  transition: all 0.1s ease;
  image-rendering: pixelated;
}

/* Key Cap Styles */
.key-cap-square {
  border-radius: 0;
}

.key-cap-rounded {
  border-radius: 4px;
}

.key-cap-flat {
  border: 2px solid var(--key-text-color, #1a1a2e);
  box-shadow: none;
}

/* ========================================
   DEFAULT STYLE
   ======================================== */

.keyboard-default .keyboard-key {
  box-shadow:
    0 4px 0 var(--key-text-color, #1a1a2e),
    0 4px 8px rgba(0, 0, 0, 0.3);
}

.keyboard-default .keyboard-key.active {
  transform: translateY(4px);
  box-shadow: none;
}

/* ========================================
   MECHANICAL STYLE
   ======================================== */

.keyboard-mechanical .keyboard-key {
  background: linear-gradient(
    180deg,
    var(--key-accent-color) 0%,
    color-mix(in srgb, var(--key-accent-color) 80%, black) 100%
  );
  box-shadow:
    0 6px 0 var(--key-text-color, #1a1a2e),
    inset 0 -2px 4px rgba(0, 0, 0, 0.3),
    0 8px 12px rgba(0, 0, 0, 0.4);
  border-width: 4px;
}

.keyboard-mechanical .keyboard-key.active {
  transform: translateY(4px);
  box-shadow:
    0 2px 0 var(--key-text-color, #1a1a2e),
    inset 0 2px 4px rgba(0, 0, 0, 0.5);
}

@keyframes mechanical-click {
  0% { transform: translateY(0); }
  50% { transform: translateY(6px); }
  100% { transform: translateY(4px); }
}

.keyboard-mechanical .key-press-mechanical.active {
  animation: mechanical-click 0.15s ease-out;
}

/* ========================================
   RETRO TERMINAL STYLE
   ======================================== */

.keyboard-retro {
  background: #000000;
  box-shadow:
    inset 0 0 100px rgba(0, 234, 105, 0.2),
    0 0 20px rgba(0, 234, 105, 0.3);
}

.keyboard-retro .keyboard-key {
  background: transparent;
  border: 2px solid #0ead69;
  color: #0ead69;
  box-shadow:
    0 0 10px rgba(0, 234, 105, 0.5),
    inset 0 0 10px rgba(0, 234, 105, 0.2);
  text-shadow: 0 0 8px #0ead69;
}

.keyboard-retro .keyboard-key.active {
  background: rgba(0, 234, 105, 0.3);
  box-shadow:
    0 0 20px rgba(0, 234, 105, 0.8),
    inset 0 0 20px rgba(0, 234, 105, 0.5);
}

@keyframes scanline-pulse {
  0%, 100% { background-position: 0 0; }
  50% { background-position: 0 100%; }
}

.keyboard-retro .keyboard-key.active {
  animation: scanline-pulse 0.3s ease-out;
  background-image: repeating-linear-gradient(
    0deg,
    rgba(0, 234, 105, 0.1) 0px,
    transparent 2px,
    transparent 4px,
    rgba(0, 234, 105, 0.1) 4px
  );
  background-size: 100% 200%;
}

/* ========================================
   NEON RGB STYLE
   ======================================== */

.keyboard-neon .keyboard-key {
  background: var(--key-accent-color);
  border: 3px solid var(--key-base-color);
  box-shadow:
    0 0 10px var(--key-base-color),
    0 4px 0 var(--key-text-color),
    inset 0 0 10px rgba(255, 255, 255, 0.3);
}

.keyboard-neon .keyboard-key.active {
  animation: neon-ripple 0.5s ease-out;
}

@keyframes neon-ripple {
  0% {
    box-shadow:
      0 0 10px var(--key-base-color),
      0 4px 0 var(--key-text-color);
  }
  50% {
    box-shadow:
      0 0 30px var(--key-base-color),
      0 0 20px #ff6b9d,
      0 0 40px #3bceac,
      0 2px 0 var(--key-text-color);
    transform: translateY(2px);
  }
  100% {
    box-shadow:
      0 0 10px var(--key-base-color),
      0 4px 0 var(--key-text-color);
  }
}

/* ========================================
   MINIMAL FLAT STYLE
   ======================================== */

.keyboard-minimal {
  background: transparent;
  box-shadow: none;
  padding: 0.5rem;
}

.keyboard-minimal .keyboard-key {
  background: var(--key-accent-color);
  border: 2px solid var(--key-text-color);
  box-shadow: none;
  border-radius: 2px;
}

.keyboard-minimal .keyboard-key.active {
  opacity: 0.7;
  background: color-mix(in srgb, var(--key-accent-color) 80%, white);
}

@keyframes minimal-press {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 0.7; }
}

.keyboard-minimal .key-press-minimal.active {
  animation: minimal-press 0.2s ease-out;
}

/* ========================================
   CYBERPUNK STYLE
   ======================================== */

.keyboard-cyberpunk {
  background: #1a1a2e;
  box-shadow:
    0 0 20px rgba(59, 206, 172, 0.5),
    inset 0 0 30px rgba(255, 107, 157, 0.2);
}

.keyboard-cyberpunk .keyboard-key {
  background: linear-gradient(135deg, #3bceac 0%, #ff6b9d 100%);
  border: 3px solid #ffd93d;
  clip-path: polygon(
    5% 0%, 95% 0%, 100% 5%, 100% 95%, 95% 100%, 5% 100%, 0% 95%, 0% 5%
  );
  box-shadow: 0 0 10px rgba(255, 217, 61, 0.5);
}

.keyboard-cyberpunk .keyboard-key.active {
  animation: glitch-press 0.3s ease-out;
}

@keyframes glitch-press {
  0%, 100% {
    transform: translate(0, 0);
    filter: none;
  }
  20% {
    transform: translate(-2px, 0);
    filter: hue-rotate(90deg);
  }
  40% {
    transform: translate(2px, 0);
    filter: hue-rotate(-90deg);
  }
  60% {
    transform: translate(-1px, 0);
    filter: hue-rotate(45deg);
  }
  80% {
    transform: translate(1px, 0);
    filter: hue-rotate(-45deg);
  }
}

/* ========================================
   ARCADE CABINET STYLE
   ======================================== */

.keyboard-arcade .keyboard-key {
  background: radial-gradient(
    circle at 30% 30%,
    color-mix(in srgb, var(--key-accent-color) 120%, white),
    var(--key-accent-color)
  );
  border: 4px solid var(--key-text-color);
  border-radius: 50%;
  box-shadow:
    0 6px 0 var(--key-text-color),
    0 8px 12px rgba(0, 0, 0, 0.5),
    inset 0 -4px 8px rgba(0, 0, 0, 0.3);
  width: 45px;
  height: 45px;
}

.keyboard-arcade .keyboard-key.active {
  animation: arcade-bounce 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes arcade-bounce {
  0% { transform: translateY(0) scale(1); }
  30% { transform: translateY(6px) scale(0.95); }
  50% { transform: translateY(4px) scale(0.97); }
  70% { transform: translateY(2px) scale(0.99); }
  100% { transform: translateY(0) scale(1); }
}

/* ========================================
   NEXT KEY HIGHLIGHT
   ======================================== */

.keyboard-key.next {
  animation: next-key-pulse 1s ease-in-out infinite;
}

@keyframes next-key-pulse {
  0%, 100% {
    box-shadow: 0 0 0 rgba(255, 217, 61, 0);
  }
  50% {
    box-shadow: 0 0 20px rgba(255, 217, 61, 0.8);
  }
}
```

---

## Phase 3: UI Components

### 3.1 Keyboard Customization Modal

**New file: `src/components/KeyboardCustomizer.tsx`**

```typescript
import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import {
  KEYBOARD_STYLES,
  COLOR_SCHEMES,
  getKeyboardStyle,
  getColorScheme,
  isKeyboardUnlocked
} from '../data/keyboards';
import type { KeyboardConfig } from '../types/keyboard';

interface KeyboardCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardCustomizer({ isOpen, onClose }: KeyboardCustomizerProps) {
  const currentConfig = useQuery(api.users.getKeyboardConfig);
  const updateConfig = useMutation(api.users.updateKeyboardConfig);
  const purchaseKeyboard = useMutation(api.users.purchaseKeyboard);

  const userProfile = useQuery(api.users.getUserProfile);
  const userLevel = userProfile?.level || 1;
  const achievements = userProfile?.achievements || [];
  const purchased = userProfile?.purchasedKeyboards || [];
  const coins = userProfile?.coins || 0;

  const [previewConfig, setPreviewConfig] = useState<KeyboardConfig | null>(null);
  const [activeTab, setActiveTab] = useState<'style' | 'color' | 'keycap'>('style');

  if (!isOpen || !currentConfig) return null;

  const config = previewConfig || currentConfig;

  const handleApply = async () => {
    if (!previewConfig) return;

    await updateConfig({
      style: previewConfig.style,
      colorScheme: previewConfig.colorScheme,
      keyCapStyle: previewConfig.keyCapStyle,
    });

    setPreviewConfig(null);
    onClose();
  };

  const handlePurchase = async (keyboardId: string, cost: number) => {
    try {
      await purchaseKeyboard({ keyboardId, cost });
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="pixel-box p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 style={{ fontFamily: "'Press Start 2P'", fontSize: '16px', color: '#ffd93d' }}>
            KEYBOARD CUSTOMIZATION
          </h2>
          <button onClick={onClose} className="pixel-btn" style={{ padding: '4px 12px' }}>
            X
          </button>
        </div>

        {/* Preview */}
        <div className="mb-8 p-6 bg-[#1a1a2e] rounded-lg">
          <p className="text-xs mb-4" style={{ fontFamily: "'Press Start 2P'", color: '#ffd93d' }}>
            PREVIEW
          </p>
          <KeyboardPreview config={config} />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['style', 'color', 'keycap'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pixel-btn ${activeTab === tab ? 'bg-[#ffd93d]' : 'bg-[#3bceac]'}`}
              style={{ fontSize: '10px', padding: '8px 16px' }}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Style Selection */}
        {activeTab === 'style' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {KEYBOARD_STYLES.map(style => {
              const unlocked = isKeyboardUnlocked(style, userLevel, achievements, purchased);
              const req = style.unlockRequirement;

              return (
                <button
                  key={style.id}
                  onClick={() => {
                    if (unlocked) {
                      setPreviewConfig({ ...config, style: style.id });
                    } else if (req.type === 'purchase') {
                      handlePurchase(style.id, req.cost);
                    }
                  }}
                  disabled={!unlocked && req.type !== 'purchase'}
                  className={`p-4 border-4 transition-all ${
                    config.style === style.id
                      ? 'border-[#ffd93d] bg-[#ffd93d]/20'
                      : unlocked
                      ? 'border-[#3bceac] hover:border-[#ffd93d]'
                      : 'border-gray-600 opacity-50'
                  }`}
                >
                  <img
                    src={style.previewImage}
                    alt={style.name}
                    className="w-full aspect-video mb-2"
                    style={{ imageRendering: 'pixelated' }}
                  />
                  <p className="text-xs mb-1" style={{ fontFamily: "'Press Start 2P'" }}>
                    {style.name}
                  </p>
                  <p className="text-[8px] text-gray-400">
                    {style.description}
                  </p>

                  {!unlocked && (
                    <div className="mt-2 text-[8px]" style={{ fontFamily: "'Press Start 2P'" }}>
                      {req.type === 'level' && `Level ${req.level}`}
                      {req.type === 'achievement' && 'Achievement'}
                      {req.type === 'purchase' && (
                        <span className="text-[#ffd93d]">{req.cost} coins</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Color Scheme Selection */}
        {activeTab === 'color' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {COLOR_SCHEMES.map(scheme => (
              <button
                key={scheme.id}
                onClick={() => setPreviewConfig({ ...config, colorScheme: scheme.id })}
                className={`p-4 border-4 ${
                  config.colorScheme === scheme.id
                    ? 'border-[#ffd93d]'
                    : 'border-[#3bceac] hover:border-[#ffd93d]'
                }`}
              >
                <div
                  className="w-full h-16 mb-2"
                  style={{ background: scheme.baseColor }}
                />
                <p className="text-xs" style={{ fontFamily: "'Press Start 2P'" }}>
                  {scheme.name}
                </p>
              </button>
            ))}
          </div>
        )}

        {/* Key Cap Style Selection */}
        {activeTab === 'keycap' && (
          <div className="grid grid-cols-3 gap-4">
            {['square', 'rounded', 'flat'].map(style => (
              <button
                key={style}
                onClick={() => setPreviewConfig({ ...config, keyCapStyle: style as any })}
                className={`p-6 border-4 ${
                  config.keyCapStyle === style
                    ? 'border-[#ffd93d]'
                    : 'border-[#3bceac] hover:border-[#ffd93d]'
                }`}
              >
                <div
                  className={`w-16 h-16 mx-auto mb-2 bg-[#3bceac] border-2 border-[#1a1a2e] ${
                    style === 'rounded' ? 'rounded-md' : ''
                  }`}
                />
                <p className="text-xs" style={{ fontFamily: "'Press Start 2P'" }}>
                  {style.toUpperCase()}
                </p>
              </button>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={() => setPreviewConfig(null)}
            className="pixel-btn bg-gray-600"
            style={{ padding: '8px 24px' }}
          >
            RESET
          </button>
          <button
            onClick={handleApply}
            disabled={!previewConfig}
            className="pixel-btn bg-[#ffd93d]"
            style={{ padding: '8px 24px' }}
          >
            APPLY
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 3.2 Keyboard Preview Component

**New file: `src/components/KeyboardPreview.tsx`**

```typescript
import type { KeyboardConfig } from '../types/keyboard';
import { getKeyboardStyle, getColorScheme } from '../data/keyboards';

interface KeyboardPreviewProps {
  config: KeyboardConfig;
}

const PREVIEW_KEYS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y'],
  ['A', 'S', 'D', 'F', 'G', 'H'],
];

export function KeyboardPreview({ config }: KeyboardPreviewProps) {
  const style = getKeyboardStyle(config.style);
  const colorScheme = getColorScheme(config.colorScheme);

  return (
    <div
      className={`keyboard-container ${style?.cssClass || 'keyboard-default'}`}
      style={{
        '--key-base-color': colorScheme?.baseColor || '#ffd93d',
        '--key-accent-color': colorScheme?.accentColor || '#3bceac',
        '--key-text-color': colorScheme?.textColor || '#1a1a2e',
        transform: 'scale(0.8)',
        transformOrigin: 'top center',
      } as React.CSSProperties}
    >
      <div className="keyboard-layout">
        {PREVIEW_KEYS.map((row, idx) => (
          <div key={idx} className="keyboard-row">
            {row.map(key => (
              <div
                key={key}
                className={`keyboard-key key-cap-${config.keyCapStyle}`}
              >
                <span className="key-label">{key}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 3.3 Integration into App

**Modify: `src/App.tsx`**

```typescript
import { KeyboardCustomizer } from './components/KeyboardCustomizer';

// In App component:
const [showKeyboardCustomizer, setShowKeyboardCustomizer] = useState(false);

// Add button in settings/menu:
<button
  onClick={() => setShowKeyboardCustomizer(true)}
  className="pixel-btn"
>
  CUSTOMIZE KEYBOARD
</button>

// Add modal:
<KeyboardCustomizer
  isOpen={showKeyboardCustomizer}
  onClose={() => setShowKeyboardCustomizer(false)}
/>
```

---

## File Structure (New/Modified)

```
typingquest/
├── public/
│   └── keyboard-previews/           (new) - Preview images
│       ├── default.png
│       ├── mechanical.png
│       ├── retro-terminal.png
│       ├── neon-rgb.png
│       ├── minimal-flat.png
│       ├── cyberpunk.png
│       └── arcade.png
├── src/
│   ├── types/
│   │   └── keyboard.ts              (new) - Type definitions
│   ├── data/
│   │   └── keyboards.ts             (new) - Keyboard metadata
│   ├── components/
│   │   ├── Keyboard.tsx             (modify) - Add dynamic styling
│   │   ├── Key.tsx                  (new) - Individual key component
│   │   ├── KeyboardCustomizer.tsx   (new) - Customization modal
│   │   └── KeyboardPreview.tsx      (new) - Preview component
│   ├── styles/
│   │   └── keyboards.css            (new) - All keyboard styles
│   └── App.tsx                      (modify) - Integration
└── convex/
    ├── schema.ts                    (modify) - Add keyboard fields
    └── users.ts                     (modify) - Add keyboard functions
```

---

## Implementation Order

1. **Types & Data** - Create keyboard type definitions and metadata
2. **Schema** - Update Convex schema with keyboard fields
3. **Backend** - Add keyboard config and purchase mutations
4. **CSS Foundation** - Build base keyboard styles and animations
5. **Key Component** - Create individual key component
6. **Keyboard Component** - Update main keyboard with dynamic styling
7. **Preview Component** - Build keyboard preview component
8. **Customizer Modal** - Create full customization interface
9. **Unlock System** - Implement achievement and purchase unlocks
10. **Integration** - Connect to App.tsx and test all flows
11. **Preview Images** - Generate preview images for each style
12. **Polish** - Refine animations, transitions, responsiveness
13. **Testing** - Test all combinations, persistence, unlocks

---

## Notes

- **Performance**: Use CSS transforms and will-change for smooth 60fps animations
- **Accessibility**: Maintain high contrast between keys and labels
- **Mobile**: Keyboard scales appropriately on smaller screens
- **Persistence**: All preferences saved to Convex and loaded on mount
- **Preview System**: Users can preview before applying to avoid surprises
- **Unlock Progression**: Balance between free unlocks (level/achievement) and paid (coins)
- **Extensibility**: Easy to add new styles, colors, or key cap shapes
- **Fallback**: Always defaults to classic style if config is missing
- **Image Rendering**: Use `image-rendering: pixelated` for crisp pixel art
- **CSS Variables**: Dynamic color application via CSS custom properties
- **Animation Classes**: Each style has unique animation on key press
- **Monetization**: Coin-based purchases create in-game economy opportunity
