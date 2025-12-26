# PRP-037: Muted Accessibility Theme

**Status**: IMPLEMENTED
**Author**: Claude + Anton
**Date**: 2025-12-26
**Priority**: HIGH
**Estimated Effort**: 2 phases, ~15 tasks

---

## Executive Summary

This PRP introduces a muted, low-stimulation monochromatic theme for TypeBit8 designed specifically for users with visual sensitivities, photophobia, migraines, autism spectrum conditions, or other accessibility needs that make bright neon colors uncomfortable or painful. The theme maintains the retro pixel aesthetic while using softer, desaturated colors. A simple toggle in the header allows quick switching between the default vibrant theme and the muted accessibility theme.

---

## Problem Statement

### Current State

1. **High saturation colors only**: The current design uses vibrant neon colors (#3bceac cyan, #ffd93d yellow, #f97316 orange) which can be overwhelming for some users
2. **No quick accessibility toggle**: Users with visual sensitivities cannot quickly reduce visual intensity
3. **Missing low-stimulation option**: No theme designed specifically for users who need reduced visual contrast and saturation

### Impact

| Issue | User Impact |
|-------|-------------|
| Bright neon colors | Eye strain, headaches, or migraines for photosensitive users |
| High saturation | Overwhelming for users with autism spectrum conditions |
| No muted option | Users with visual sensitivities may abandon the app |
| Slow theme switching | Users can't quickly reduce intensity during a session |

### Target Users

- Users with **photophobia** (light sensitivity)
- Users prone to **migraines** triggered by bright colors
- Users on the **autism spectrum** who prefer low-stimulation environments
- Users with **visual processing disorders**
- Users who prefer working in **low-light environments**
- Users experiencing **eye fatigue** from extended screen time

### Success Criteria

- [ ] Muted theme uses desaturated, monochromatic color palette
- [ ] Theme maintains retro pixel aesthetic
- [ ] Quick toggle accessible in header (one-click switching)
- [ ] Theme preference persists across sessions (localStorage)
- [ ] All UI elements remain clearly visible and distinguishable
- [ ] Contrast ratios meet WCAG 2.1 AA standards
- [ ] No performance impact when switching themes

---

## Proposed Solution

### Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  MUTED THEME SYSTEM                                                          │
│                                                                             │
│  ┌──────────────────┐                                                       │
│  │ Header Toggle    │  ☼/☾ icon toggle for quick switching                  │
│  │ (one-click)      │                                                       │
│  └────────┬─────────┘                                                       │
│           │                                                                  │
│           ▼                                                                  │
│  ┌──────────────────┐    ┌──────────────────┐                               │
│  │ Vibrant Theme    │ ←→ │ Muted Theme      │                               │
│  │ (Default)        │    │ (Accessibility)  │                               │
│  │                  │    │                  │                               │
│  │ #3bceac cyan     │    │ #8a9a9a gray     │                               │
│  │ #ffd93d yellow   │    │ #b8b8a8 tan      │                               │
│  │ #f97316 orange   │    │ #a0a090 olive    │                               │
│  │ #1a1a2e dark     │    │ #2a2a2a charcoal │                               │
│  └──────────────────┘    └──────────────────┘                               │
│                                                                             │
│  localStorage: { "theme": "muted" | "vibrant" }                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Color Palette: Muted Monochromatic

The muted theme uses a warm gray/sepia palette that retains the retro feel while being gentle on the eyes:

```
MUTED ACCESSIBILITY PALETTE
═══════════════════════════

Background Tones (dark to light):
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│#1a1a1a │ │#242424 │ │#2e2e2e │ │#383838 │
│ Base   │ │ Card   │ │ Hover  │ │ Active │
└────────┘ └────────┘ └────────┘ └────────┘

Text & UI (contrast-safe):
┌────────┐ ┌────────┐ ┌────────┐
│#d4d4d4 │ │#a0a0a0 │ │#707070 │
│Primary │ │Secondary│ │ Muted  │
└────────┘ └────────┘ └────────┘

Accent Colors (desaturated):
┌────────┐ ┌────────┐ ┌────────┐
│#8a9a9a │ │#b8b8a0 │ │#a09080 │
│ Teal   │ │ Cream  │ │ Warm   │
│(replaces│(replaces│(replaces│
│ cyan)  │ yellow) │ orange) │
└────────┘ └────────┘ └────────┘

Status Colors (muted):
┌────────┐ ┌────────┐ ┌────────┐
│#6a8a6a │ │#9a6a6a │ │#8a8a6a │
│Success │ │ Error  │ │Warning │
│(green) │ │ (red)  │ │(yellow)│
└────────┘ └────────┘ └────────┘
```

### Architecture / Design

#### 1. Theme Context Provider

```typescript
// src/providers/ThemeProvider.tsx

export type ThemeMode = 'vibrant' | 'muted';

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    // Check localStorage first
    const saved = localStorage.getItem('theme-mode');
    if (saved === 'muted' || saved === 'vibrant') return saved;

    // Check system preference for reduced motion (often correlates with visual sensitivity)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return 'muted';
    }

    return 'vibrant';
  });

  useEffect(() => {
    localStorage.setItem('theme-mode', mode);
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  const toggle = () => setMode(m => m === 'vibrant' ? 'muted' : 'vibrant');

  return (
    <ThemeContext.Provider value={{ mode, setMode, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

#### 2. CSS Variables Structure

```css
/* src/styles/themes.css */

:root,
[data-theme="vibrant"] {
  /* Backgrounds */
  --bg-primary: #1a1a2e;
  --bg-secondary: #16213e;
  --bg-card: #0f3460;
  --bg-hover: #1e3a5f;

  /* Text */
  --text-primary: #eef5db;
  --text-secondary: #b8c5a8;
  --text-muted: #6a8a7a;

  /* Accents */
  --accent-primary: #3bceac;    /* Cyan */
  --accent-secondary: #ffd93d;  /* Yellow */
  --accent-tertiary: #f97316;   /* Orange */

  /* Status */
  --color-success: #0ead69;
  --color-error: #ef4444;
  --color-warning: #f59e0b;

  /* Keyboard */
  --key-bg: #2d3561;
  --key-border: #3bceac;
  --key-text: #eef5db;
  --key-highlight: #ffd93d;

  /* Effects */
  --glow-primary: rgba(59, 206, 172, 0.4);
  --glow-secondary: rgba(255, 217, 61, 0.4);
  --border-glow: 0 0 10px var(--glow-primary);
}

[data-theme="muted"] {
  /* Backgrounds - warm charcoal */
  --bg-primary: #1a1a1a;
  --bg-secondary: #222222;
  --bg-card: #2a2a2a;
  --bg-hover: #333333;

  /* Text - soft whites */
  --text-primary: #d4d4d4;
  --text-secondary: #a0a0a0;
  --text-muted: #707070;

  /* Accents - desaturated */
  --accent-primary: #8a9a9a;    /* Muted teal */
  --accent-secondary: #b8b8a0;  /* Cream */
  --accent-tertiary: #a09080;   /* Warm gray */

  /* Status - desaturated */
  --color-success: #6a8a6a;
  --color-error: #9a6a6a;
  --color-warning: #8a8a6a;

  /* Keyboard - monochrome */
  --key-bg: #2a2a2a;
  --key-border: #4a4a4a;
  --key-text: #c0c0c0;
  --key-highlight: #909090;

  /* Effects - subtle/none */
  --glow-primary: rgba(138, 154, 154, 0.2);
  --glow-secondary: rgba(184, 184, 160, 0.2);
  --border-glow: none;
}

/* Reduce intensity of animations in muted mode */
[data-theme="muted"] * {
  animation-duration: 0.5s !important;
}

[data-theme="muted"] .glow-effect {
  filter: saturate(0.3) brightness(0.9);
}
```

#### 3. Header Toggle Component

```typescript
// src/components/ThemeToggle.tsx

export function ThemeToggle() {
  const { mode, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="theme-toggle"
      aria-label={mode === 'vibrant' ? 'Switch to muted theme' : 'Switch to vibrant theme'}
      title={mode === 'vibrant' ? 'Enable low-stimulation mode' : 'Enable vibrant mode'}
      style={{
        fontFamily: "'Press Start 2P'",
        fontSize: '12px',
        padding: '8px 12px',
        background: 'transparent',
        border: `2px solid var(--accent-primary)`,
        color: 'var(--text-primary)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'all 0.2s ease',
      }}
    >
      {mode === 'vibrant' ? (
        <>
          <span style={{ opacity: 0.5 }}>☼</span>
        </>
      ) : (
        <>
          <span style={{ opacity: 0.8 }}>◐</span>
        </>
      )}
    </button>
  );
}
```

### Files to Modify

| File | Action | Description |
|------|--------|-------------|
| `src/providers/ThemeProvider.tsx` | CREATE | Theme context with vibrant/muted switching |
| `src/hooks/useTheme.ts` | CREATE | Hook to access theme context |
| `src/components/ThemeToggle.tsx` | CREATE | Header toggle button component |
| `src/styles/themes.css` | CREATE | CSS variables for both themes |
| `src/App.tsx` | MODIFY | Wrap with ThemeProvider |
| `src/components/Header.tsx` or equivalent | MODIFY | Add ThemeToggle to header |
| `src/index.css` or `src/main.tsx` | MODIFY | Import themes.css |

---

## Pre-Flight Checks

> **MANDATORY**: These checks MUST pass before starting implementation.

- [ ] `npm install` succeeds
- [ ] `npm run build` succeeds (baseline)
- [ ] `npm run dev` runs without errors
- [ ] Current app loads and functions properly
- [ ] No TypeScript errors in codebase

---

## Implementation Tasks

### Phase 1: Theme Infrastructure

**Objective**: Create theme switching system with CSS variables.

#### Tasks
- [ ] **1.1** Create `src/styles/themes.css` with CSS variables for both themes
- [ ] **1.2** Create `src/providers/ThemeProvider.tsx` with context and localStorage persistence
- [ ] **1.3** Create `src/hooks/useTheme.ts` hook
- [ ] **1.4** Update `src/main.tsx` to wrap app with ThemeProvider
- [ ] **1.5** Import themes.css in the app entry point
- [ ] **1.6** Test theme switching via browser devtools (manually set `data-theme`)
- [ ] **1.7** Verify all existing components pick up CSS variables

#### Build Gate
```bash
npm run build
npm run dev
# Manually test: document.documentElement.setAttribute('data-theme', 'muted')
# Verify colors change throughout app
```

#### Phase Completion
```
<promise>PRP-037 PHASE 1 COMPLETE</promise>
```

---

### Phase 2: UI Integration & Polish

**Objective**: Add toggle to header and refine muted theme colors.

#### Tasks
- [ ] **2.1** Create `src/components/ThemeToggle.tsx` component
- [ ] **2.2** Add ThemeToggle to header/navigation area
- [ ] **2.3** Fine-tune muted color palette for optimal contrast
- [ ] **2.4** Verify WCAG 2.1 AA contrast ratios in muted theme
- [ ] **2.5** Reduce/disable glow effects in muted mode
- [ ] **2.6** Test keyboard navigation of toggle
- [ ] **2.7** Add aria-label for accessibility
- [ ] **2.8** Test persistence: refresh page, verify theme persists

#### Build Gate
```bash
npm run build
npm run dev
# Test toggle works
# Test localStorage persistence
# Verify contrast with accessibility tools
```

#### Phase Completion
```
<promise>PRP-037 PHASE 2 COMPLETE</promise>
```

---

## Final Verification

- [ ] All phase promises output (Phases 1-2)
- [ ] `npm run build` passes
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] Theme toggle visible in header
- [ ] Click toggle switches theme instantly
- [ ] Theme persists after page refresh
- [ ] All UI elements visible in muted theme
- [ ] Contrast ratios meet WCAG 2.1 AA
- [ ] Keyboard can access toggle (Tab + Enter)
- [ ] Screen reader announces toggle state
- [ ] No visual glitches during theme transition
- [ ] Changes committed with descriptive message

---

## Final Completion

When ALL of the above are complete:
```
<promise>PRP-037 COMPLETE</promise>
```

---

## Design Reference

### Muted Theme Preview (ASCII mockup)

```
┌─────────────────────────────────────────────────────────────────┐
│  ▪ TYPEBIT8              [◐]    [CHALLENGE] [PREMIUM]  SIGN IN  │  <- Header (dark gray)
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│               LEARN TO TYPE WITH                                │  <- Cream text
│               ALL 10 FINGERS                                    │  <- Muted teal
│                                                                 │
│    ┌─────────┐  ┌─────────┐  ┌─────────┐                       │
│    │   30    │  │    0    │  │   0x    │                       │  <- Soft bordered cards
│    │ LEVELS  │  │ CLEARED │  │  COMBO  │                       │
│    └─────────┘  └─────────┘  └─────────┘                       │
│                                                                 │
│    ┌───────────────────────────────────────────┐               │
│    │           TRY IT OUT!                      │               │  <- Muted card
│    │     ┌─────────────────────────┐           │               │
│    │     │ Try: "hello world"      │           │               │  <- Input field
│    │     └─────────────────────────┘           │               │
│    │  ┌───┬───┬───┬───┬───┬───┬───┬───┬───┐   │               │
│    │  │ Q │ W │ E │ R │ T │ Y │ U │ I │ O │   │               │  <- Monochrome keys
│    │  └───┴───┴───┴───┴───┴───┴───┴───┴───┘   │               │
│    └───────────────────────────────────────────┘               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Color Legend:
 Background:  #1a1a1a (near black)
 Cards:       #2a2a2a (charcoal)
 Borders:     #4a4a4a (gray)
 Primary:     #8a9a9a (muted teal)
 Secondary:   #b8b8a0 (cream)
 Text:        #d4d4d4 (light gray)
```

### Comparison: Vibrant vs Muted

| Element | Vibrant | Muted |
|---------|---------|-------|
| Background | Deep navy #1a1a2e | Charcoal #1a1a1a |
| Primary accent | Neon cyan #3bceac | Muted teal #8a9a9a |
| Secondary accent | Bright yellow #ffd93d | Cream #b8b8a0 |
| Glow effects | Strong (0.4 opacity) | Subtle (0.2 opacity) or none |
| Key borders | Cyan glow | Simple gray border |
| Text | Warm white | Cool gray |
| Overall feel | Energetic, vibrant, gamified | Calm, professional, restful |

---

## Rollback Plan

```bash
# If issues discovered after deployment:

# 1. Revert theme changes
git revert HEAD~N  # revert commits from this PRP

# 2. Or: Remove toggle, keep infrastructure
# Users can still access muted theme via localStorage

# 3. Quick fix: Default to vibrant
# In ThemeProvider, change default from 'muted' check to always 'vibrant'
```

---

## Open Questions

### Q1: Should we auto-detect user preference?

**Options:**
- A) Always default to vibrant, let users toggle
- B) Check `prefers-reduced-motion` and default to muted if true
- C) Check `prefers-color-scheme: dark` and offer muted as dark mode

**Recommendation:** Option B - users with reduced motion preferences often also prefer reduced visual stimulation

### Q2: Toggle icon design?

**Options:**
- A) Sun/Moon icons (☼/☾) - familiar but suggests light/dark mode
- B) Half-circle icon (◐) - represents "dimmed" mode
- C) Eye icon with slash for muted
- D) Brightness icon (high/low)

**Recommendation:** Option B or D - clearer that it's about visual intensity, not light/dark

---

## Accessibility Statement

This theme is specifically designed for users who may experience:
- **Photophobia**: Sensitivity to bright lights and colors
- **Migraine triggers**: Bright colors can trigger or worsen migraines
- **Sensory processing differences**: Including autism spectrum conditions
- **Eye strain**: From extended screen time
- **Visual fatigue**: Reduced tolerance for high-contrast visuals

The muted theme provides a calmer, less stimulating visual experience while maintaining full functionality.

---

## References

- WCAG 2.1 Contrast Requirements: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
- prefers-reduced-motion: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
- Color-Safe Palette Generator: https://colorsafe.co/
- Autism-Friendly Design: https://www.autism.org.uk/advice-and-guidance/professional-practice/website-design

---

## Changelog

| Date | Author | Changes |
|------|--------|---------|
| 2025-12-26 | Claude + Anton | Initial draft |

---

<!--
WIGGUM EXECUTION COMMAND:
/ralph-loop "Execute PRP-037 per docs/PRP-037-MUTED-ACCESSIBILITY-THEME.md. Work through all unchecked tasks sequentially including pre-flight checks. Mark each [x] when done. Run build gates after each phase. Output phase promises after each phase. Output <promise>PRP-037 COMPLETE</promise> when all tasks are done. Do NOT ask for confirmation between tasks." --completion-promise "PRP-037 COMPLETE" --max-iterations 30
-->
