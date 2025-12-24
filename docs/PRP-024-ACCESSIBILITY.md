# PRP-024: Accessibility Improvements

**Status**: DRAFT
**Author**: Claude + Anton
**Date**: 2025-12-25
**Priority**: HIGH
**Estimated Effort**: 5 phases, ~65 tasks

---

## Executive Summary

This PRP enhances TypeBit8 (Type Quest) with comprehensive accessibility features to ensure the typing practice game is usable by players with diverse abilities and preferences. The implementation targets WCAG 2.1 AA compliance and includes screen reader support, high contrast mode, reduced motion options, keyboard-only navigation, customizable font sizes, color blind friendly palettes, enhanced focus indicators, and a dedicated accessibility settings panel.

---

## Problem Statement

### Current State

1. **No screen reader support**: Interactive elements lack ARIA labels and semantic structure, making the game unusable for visually impaired users.

2. **Poor keyboard navigation**: Focus indicators are minimal or missing, and not all interactive elements are keyboard accessible.

3. **Fixed visual design**: No options for users who need high contrast, larger fonts, or different color schemes.

4. **Motion-heavy animations**: Animations may trigger vestibular disorders or motion sensitivity in some users.

5. **Color-dependent UI**: Important information conveyed only through color excludes color blind users.

6. **No accessibility documentation**: Users unaware of available accommodations or how to enable them.

### Impact

| Issue | User Impact |
|-------|-------------|
| No screen reader support | Complete exclusion of blind/visually impaired users |
| Poor keyboard navigation | Difficulty for users who cannot use a mouse |
| Fixed visual design | Eye strain, readability issues for low vision users |
| Motion animations | Nausea, dizziness for users with vestibular disorders |
| Color-only information | Confusion for color blind users (8% of males) |
| Missing documentation | Users may abandon app thinking it's inaccessible |

### Success Criteria

- [ ] WCAG 2.1 AA compliance achieved
- [ ] All interactive elements keyboard accessible with visible focus
- [ ] Screen readers can navigate and understand all game states
- [ ] High contrast mode meets 7:1 contrast ratio for text
- [ ] Reduced motion option disables all non-essential animations
- [ ] Font size adjustable from 75% to 150% without breaking layout
- [ ] Color blind friendly palettes available (Deuteranopia, Protanopia, Tritanopia)
- [ ] Accessibility settings persist across sessions
- [ ] All features testable with keyboard + screen reader
- [ ] Documentation page explains all accessibility features

---

## Proposed Solution

### Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ACCESSIBILITY ARCHITECTURE                                                  │
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│  │ Accessibility│    │   Visual     │    │   Motion     │                  │
│  │   Context    │ +  │   Themes     │ +  │  Preferences │                  │
│  │  (ARIA, SR)  │    │ (Contrast,   │    │  (Reduced    │                  │
│  │              │    │  Color Blind)│    │   Motion)    │                  │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘                  │
│         │                   │                   │                           │
│         └───────────────────┼───────────────────┘                           │
│                             ▼                                               │
│                   ┌──────────────────┐                                      │
│                   │  Settings Panel  │                                      │
│                   │  - Font size     │                                      │
│                   │  - Contrast mode │                                      │
│                   │  - Color palette │                                      │
│                   │  - Motion toggle │                                      │
│                   │  - Focus style   │                                      │
│                   └────────┬─────────┘                                      │
│                            ▼                                                │
│                   ┌──────────────────┐                                      │
│                   │  Enhanced Game   │                                      │
│                   │  - ARIA live     │                                      │
│                   │  - Keyboard nav  │                                      │
│                   │  - Clear focus   │                                      │
│                   │  - Accessible UX │                                      │
│                   └──────────────────┘                                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Architecture / Design

#### 1. Accessibility Context

Centralized state management for accessibility preferences:

```typescript
// src/contexts/AccessibilityContext.tsx

export interface AccessibilitySettings {
  // Screen reader
  screenReaderMode: boolean;          // Enhanced announcements
  verboseDescriptions: boolean;       // Detailed ARIA descriptions

  // Visual
  fontSize: number;                   // 75-150% (default 100)
  highContrast: boolean;              // High contrast mode
  colorBlindMode: ColorBlindMode;     // 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia'

  // Motion
  reduceMotion: boolean;              // Disable animations
  reduceTransparency: boolean;        // Remove opacity effects

  // Focus
  enhancedFocus: boolean;             // Extra visible focus indicators
  focusOutlineWidth: number;          // 2-4px (default 2)

  // Interaction
  keyboardOnly: boolean;              // Optimize for keyboard navigation
  clickDelay: number;                 // 0-500ms delay for accidental clicks
}

export interface AccessibilityContextValue {
  settings: AccessibilitySettings;
  updateSettings: (partial: Partial<AccessibilitySettings>) => void;
  resetSettings: () => void;
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void;
}

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(loadSettings);

  const updateSettings = (partial: Partial<AccessibilitySettings>) => {
    const newSettings = { ...settings, ...partial };
    setSettings(newSettings);
    saveSettings(newSettings);
    applyAccessibilityStyles(newSettings);
  };

  const announceToScreenReader = (message: string, priority = 'polite') => {
    // Use aria-live region for announcements
    const liveRegion = document.getElementById(`aria-live-${priority}`);
    if (liveRegion) {
      liveRegion.textContent = message;
    }
  };

  return (
    <AccessibilityContext.Provider value={{ settings, updateSettings, resetSettings, announceToScreenReader }}>
      {children}
    </AccessibilityContext.Provider>
  );
};
```

#### 2. ARIA Labels and Semantic HTML

```typescript
// src/components/TypingArea.tsx (enhanced)

export const TypingArea: React.FC<TypingAreaProps> = ({ lesson, onComplete }) => {
  const { settings, announceToScreenReader } = useAccessibility();

  return (
    <section
      role="application"
      aria-label="Typing practice area"
      aria-describedby="typing-instructions"
    >
      <div id="typing-instructions" className="sr-only">
        Type the displayed text. Press Escape to pause. Your progress will be saved.
      </div>

      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {settings.screenReaderMode && (
          <span className="sr-only">
            Lesson {lesson.id}: {lesson.title}.
            {lesson.exercises.length} exercises remaining.
          </span>
        )}
      </div>

      <div
        className="typing-text"
        role="textbox"
        aria-label="Text to type"
        aria-readonly="true"
      >
        {/* Display text with character-by-character status */}
        {currentText.split('').map((char, i) => (
          <span
            key={i}
            className={getCharClassName(i)}
            aria-label={settings.verboseDescriptions ?
              `Character ${i + 1}: ${char}, status: ${getCharStatus(i)}` :
              undefined
            }
          >
            {char}
          </span>
        ))}
      </div>

      <div
        role="timer"
        aria-live="off"
        aria-atomic="true"
      >
        <span className="sr-only">Time elapsed:</span>
        {formatTime(elapsedTime)}
      </div>

      <div
        role="status"
        aria-live="polite"
      >
        <span className="sr-only">
          Accuracy: {accuracy}%. Words per minute: {wpm}.
        </span>
      </div>
    </section>
  );
};
```

#### 3. High Contrast Mode

```typescript
// src/styles/themes/highContrast.ts

export const highContrastTheme = {
  colors: {
    // Text: 7:1 contrast ratio minimum
    text: '#FFFFFF',
    textSecondary: '#E0E0E0',

    // Backgrounds
    background: '#000000',
    backgroundSecondary: '#1A1A1A',

    // Interactive elements
    primary: '#FFFF00',        // Yellow for high visibility
    primaryHover: '#FFFF66',

    // Status colors
    success: '#00FF00',        // Pure green
    error: '#FF0000',          // Pure red
    warning: '#FFA500',        // Orange

    // Focus
    focus: '#00FFFF',          // Cyan for focus ring
    focusWidth: '3px',

    // Borders
    border: '#FFFFFF',
    borderThick: '2px',
  },

  // Disable shadows in high contrast
  shadows: {
    none: 'none',
  },
};

// src/styles/applyAccessibilityStyles.ts

export function applyAccessibilityStyles(settings: AccessibilitySettings) {
  const root = document.documentElement;

  // Font size
  root.style.fontSize = `${settings.fontSize}%`;

  // High contrast
  if (settings.highContrast) {
    Object.entries(highContrastTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  }

  // Reduce motion
  if (settings.reduceMotion) {
    root.style.setProperty('--transition-duration', '0ms');
    root.style.setProperty('--animation-duration', '0ms');
  }

  // Enhanced focus
  if (settings.enhancedFocus) {
    root.style.setProperty('--focus-outline-width', `${settings.focusOutlineWidth}px`);
    root.style.setProperty('--focus-outline-offset', '3px');
  }

  // Reduce transparency
  if (settings.reduceTransparency) {
    root.style.setProperty('--opacity-overlay', '1');
    root.style.setProperty('--opacity-disabled', '0.5');
  }
}
```

#### 4. Color Blind Friendly Palettes

```typescript
// src/styles/themes/colorBlind.ts

export const colorBlindPalettes = {
  deuteranopia: {
    // Red-green color blindness (most common)
    // Use blue-yellow contrast instead
    correct: '#0066CC',      // Blue
    incorrect: '#FFAA00',    // Orange/Gold
    active: '#6600CC',       // Purple
    inactive: '#CCCCCC',     // Gray
  },

  protanopia: {
    // Red color blindness
    // Similar to deuteranopia
    correct: '#0077BB',      // Blue
    incorrect: '#EEAA00',    // Yellow
    active: '#7700BB',       // Purple
    inactive: '#BBBBBB',     // Gray
  },

  tritanopia: {
    // Blue-yellow color blindness (rare)
    // Use red-cyan contrast
    correct: '#00AA88',      // Cyan
    incorrect: '#CC3333',    // Red
    active: '#CC0088',       // Magenta
    inactive: '#999999',     // Gray
  },
};

// Use patterns in addition to colors
export const accessiblePatterns = {
  correct: 'background-image: linear-gradient(45deg, transparent 40%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.1) 60%, transparent 60%)',
  incorrect: 'background-image: repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)',
};
```

#### 5. Keyboard Navigation

```typescript
// src/hooks/useKeyboardNavigation.ts

export function useKeyboardNavigation() {
  const { settings } = useAccessibility();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Global keyboard shortcuts
      switch (e.key) {
        case 'Escape':
          // Pause/unpause
          break;
        case 'Tab':
          // Ensure focus visible
          document.body.classList.add('keyboard-nav');
          break;
        case '?':
          if (e.shiftKey) {
            // Show keyboard shortcuts help
          }
          break;
      }
    };

    const handleMouseDown = () => {
      // Remove keyboard nav indicator on mouse use
      document.body.classList.remove('keyboard-nav');
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [settings]);
}

// src/styles/focus.css

/* Default focus styles */
*:focus {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

/* Enhanced focus for keyboard navigation */
.keyboard-nav *:focus {
  outline-width: var(--focus-outline-width, 3px);
  outline-offset: var(--focus-outline-offset, 3px);
  box-shadow: 0 0 0 4px rgba(var(--color-focus-rgb), 0.3);
}

/* Focus within for complex components */
.lesson-card:focus-within {
  box-shadow: 0 0 0 3px var(--color-focus);
}
```

#### 6. Accessibility Settings Panel

```typescript
// src/components/AccessibilityPanel.tsx

export const AccessibilityPanel: React.FC = () => {
  const { settings, updateSettings, resetSettings } = useAccessibility();
  const { t } = useTranslation();

  return (
    <section
      className="accessibility-panel"
      role="region"
      aria-labelledby="accessibility-heading"
    >
      <h2 id="accessibility-heading">
        {t('accessibility.title')}
      </h2>

      <div className="settings-section">
        <h3>{t('accessibility.visual.title')}</h3>

        <div className="setting-item">
          <label htmlFor="font-size-slider">
            {t('accessibility.visual.fontSize')}
          </label>
          <input
            id="font-size-slider"
            type="range"
            min="75"
            max="150"
            step="5"
            value={settings.fontSize}
            onChange={(e) => updateSettings({ fontSize: Number(e.target.value) })}
            aria-valuemin={75}
            aria-valuemax={150}
            aria-valuenow={settings.fontSize}
            aria-valuetext={`${settings.fontSize}%`}
          />
          <output>{settings.fontSize}%</output>
        </div>

        <div className="setting-item">
          <input
            id="high-contrast-toggle"
            type="checkbox"
            checked={settings.highContrast}
            onChange={(e) => updateSettings({ highContrast: e.target.checked })}
            aria-describedby="high-contrast-desc"
          />
          <label htmlFor="high-contrast-toggle">
            {t('accessibility.visual.highContrast')}
          </label>
          <p id="high-contrast-desc" className="setting-description">
            {t('accessibility.visual.highContrastDesc')}
          </p>
        </div>

        <div className="setting-item">
          <label htmlFor="color-blind-mode">
            {t('accessibility.visual.colorBlindMode')}
          </label>
          <select
            id="color-blind-mode"
            value={settings.colorBlindMode}
            onChange={(e) => updateSettings({ colorBlindMode: e.target.value as ColorBlindMode })}
          >
            <option value="none">{t('accessibility.visual.colorBlind.none')}</option>
            <option value="deuteranopia">{t('accessibility.visual.colorBlind.deuteranopia')}</option>
            <option value="protanopia">{t('accessibility.visual.colorBlind.protanopia')}</option>
            <option value="tritanopia">{t('accessibility.visual.colorBlind.tritanopia')}</option>
          </select>
        </div>
      </div>

      <div className="settings-section">
        <h3>{t('accessibility.motion.title')}</h3>

        <div className="setting-item">
          <input
            id="reduce-motion-toggle"
            type="checkbox"
            checked={settings.reduceMotion}
            onChange={(e) => updateSettings({ reduceMotion: e.target.checked })}
            aria-describedby="reduce-motion-desc"
          />
          <label htmlFor="reduce-motion-toggle">
            {t('accessibility.motion.reduceMotion')}
          </label>
          <p id="reduce-motion-desc" className="setting-description">
            {t('accessibility.motion.reduceMotionDesc')}
          </p>
        </div>

        <div className="setting-item">
          <input
            id="reduce-transparency-toggle"
            type="checkbox"
            checked={settings.reduceTransparency}
            onChange={(e) => updateSettings({ reduceTransparency: e.target.checked })}
          />
          <label htmlFor="reduce-transparency-toggle">
            {t('accessibility.motion.reduceTransparency')}
          </label>
        </div>
      </div>

      <div className="settings-section">
        <h3>{t('accessibility.interaction.title')}</h3>

        <div className="setting-item">
          <input
            id="enhanced-focus-toggle"
            type="checkbox"
            checked={settings.enhancedFocus}
            onChange={(e) => updateSettings({ enhancedFocus: e.target.checked })}
          />
          <label htmlFor="enhanced-focus-toggle">
            {t('accessibility.interaction.enhancedFocus')}
          </label>
        </div>

        <div className="setting-item">
          <input
            id="screen-reader-mode-toggle"
            type="checkbox"
            checked={settings.screenReaderMode}
            onChange={(e) => updateSettings({ screenReaderMode: e.target.checked })}
          />
          <label htmlFor="screen-reader-mode-toggle">
            {t('accessibility.interaction.screenReaderMode')}
          </label>
        </div>
      </div>

      <div className="settings-actions">
        <button
          onClick={resetSettings}
          className="btn-secondary"
        >
          {t('accessibility.resetToDefaults')}
        </button>
      </div>

      <div className="wcag-compliance">
        <p>
          {t('accessibility.wcagCompliance')}
        </p>
      </div>
    </section>
  );
};
```

#### 7. ARIA Live Regions

```typescript
// src/components/AriaLiveRegions.tsx

export const AriaLiveRegions: React.FC = () => {
  return (
    <>
      {/* Polite announcements (status updates) */}
      <div
        id="aria-live-polite"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {/* Assertive announcements (urgent alerts) */}
      <div
        id="aria-live-assertive"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      />
    </>
  );
};

// Usage in components:
const { announceToScreenReader } = useAccessibility();

// When lesson completes
announceToScreenReader(
  `Lesson ${lessonId} complete! Accuracy: ${accuracy}%, WPM: ${wpm}`,
  'polite'
);

// On error
announceToScreenReader(
  'Error: Failed to save progress. Please try again.',
  'assertive'
);
```

#### 8. Screen Reader Only Content

```css
/* src/styles/accessibility.css */

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.sr-only-focusable:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

### Files to Modify

| File | Action | Description |
|------|--------|-------------|
| `src/contexts/AccessibilityContext.tsx` | CREATE | Accessibility state management |
| `src/hooks/useAccessibility.ts` | CREATE | Hook for accessing accessibility context |
| `src/hooks/useKeyboardNavigation.ts` | CREATE | Keyboard navigation logic |
| `src/components/AccessibilityPanel.tsx` | CREATE | Settings UI for accessibility options |
| `src/components/AriaLiveRegions.tsx` | CREATE | ARIA live announcement regions |
| `src/styles/themes/highContrast.ts` | CREATE | High contrast color theme |
| `src/styles/themes/colorBlind.ts` | CREATE | Color blind friendly palettes |
| `src/styles/accessibility.css` | CREATE | Accessibility-specific styles |
| `src/styles/focus.css` | CREATE | Enhanced focus indicator styles |
| `src/utils/applyAccessibilityStyles.ts` | CREATE | Dynamic style application |
| `src/utils/detectSystemPreferences.ts` | CREATE | Detect OS-level preferences (prefers-reduced-motion, etc.) |
| `src/components/TypingArea.tsx` | MODIFY | Add ARIA labels and semantic HTML |
| `src/components/LessonCard.tsx` | MODIFY | Add ARIA labels and keyboard navigation |
| `src/components/LessonView.tsx` | MODIFY | Add ARIA labels and screen reader announcements |
| `src/components/Quiz.tsx` | MODIFY | Add ARIA labels and keyboard navigation |
| `src/components/Settings.tsx` | MODIFY | Integrate AccessibilityPanel |
| `src/App.tsx` | MODIFY | Add AccessibilityProvider wrapper |
| `src/i18n/locales/en.json` | MODIFY | Add accessibility-related translations |
| `src/i18n/locales/de.json` | MODIFY | Add accessibility-related translations |
| `src/main.tsx` | MODIFY | Add ARIA live regions to root |
| `src/types/accessibility.ts` | CREATE | Accessibility type definitions |

---

## Documentation Requirements

### Documentation Checklist
- [ ] **D.1** Create accessibility documentation page
- [ ] **D.2** Document keyboard shortcuts
- [ ] **D.3** Document screen reader compatibility
- [ ] **D.4** Add WCAG compliance statement
- [ ] **D.5** Create accessibility testing guide

### README Updates
| File | Action | Scope |
|------|--------|-------|
| `README.md` | UPDATE | Add accessibility section |
| `docs/ACCESSIBILITY.md` | CREATE | Detailed accessibility guide |
| `docs/KEYBOARD-SHORTCUTS.md` | CREATE | Keyboard navigation reference |
| `docs/WCAG-COMPLIANCE.md` | CREATE | WCAG 2.1 AA compliance checklist |

---

## Pre-Flight Checks

> **MANDATORY**: These checks MUST pass before starting implementation.

- [ ] `npm install` succeeds
- [ ] `npm run build` succeeds (baseline)
- [ ] `npm run dev` runs without errors
- [ ] Current app loads and functions properly
- [ ] No TypeScript errors in codebase
- [ ] Browser dev tools show no console errors

---

## Implementation Tasks

### Phase 1: Core Accessibility Infrastructure

**Objective**: Set up accessibility context and foundational utilities.

#### Tasks
- [ ] **1.1** Create `src/types/accessibility.ts` with all accessibility type definitions
- [ ] **1.2** Create `src/contexts/AccessibilityContext.tsx` with context and provider
- [ ] **1.3** Implement `loadSettings()` and `saveSettings()` functions for localStorage persistence
- [ ] **1.4** Create `src/hooks/useAccessibility.ts` hook
- [ ] **1.5** Create `src/utils/applyAccessibilityStyles.ts` for dynamic style application
- [ ] **1.6** Create `src/utils/detectSystemPreferences.ts` to detect prefers-reduced-motion, prefers-contrast
- [ ] **1.7** Implement auto-detection of system preferences on first load
- [ ] **1.8** Create `src/components/AriaLiveRegions.tsx` for screen reader announcements
- [ ] **1.9** Add accessibility CSS variables to `src/styles/variables.css`
- [ ] **1.10** Update `src/App.tsx` to wrap with AccessibilityProvider
- [ ] **1.11** Update `src/main.tsx` to include AriaLiveRegions at root

#### Build Gate
```bash
npm run build
npm run dev
# Verify no errors, accessibility context available
```

#### Phase Completion
```
<promise>PRP-024 PHASE 1 COMPLETE</promise>
```

---

### Phase 2: Visual Accessibility

**Objective**: Implement high contrast mode, font sizing, and color blind palettes.

#### Tasks
- [ ] **2.1** Create `src/styles/themes/highContrast.ts` with high contrast color palette
- [ ] **2.2** Create `src/styles/themes/colorBlind.ts` with color blind palettes (deuteranopia, protanopia, tritanopia)
- [ ] **2.3** Create `src/styles/accessibility.css` with accessibility-specific styles
- [ ] **2.4** Implement font size scaling (75%-150%) using CSS variables
- [ ] **2.5** Implement high contrast mode theme switching
- [ ] **2.6** Implement color blind mode palette switching
- [ ] **2.7** Add reduce transparency option
- [ ] **2.8** Ensure all color combinations meet WCAG AA contrast ratio (4.5:1 for normal text, 3:1 for large text)
- [ ] **2.9** Test high contrast mode with all components
- [ ] **2.10** Test font scaling doesn't break layouts (test at 75%, 100%, 125%, 150%)
- [ ] **2.11** Test each color blind palette for distinguishability
- [ ] **2.12** Add visual patterns in addition to colors for status indicators

#### Build Gate
```bash
npm run build
npm run dev
# Test visual modes work correctly
# Verify contrast ratios with browser dev tools
```

#### Phase Completion
```
<promise>PRP-024 PHASE 2 COMPLETE</promise>
```

---

### Phase 3: Keyboard Navigation & Focus

**Objective**: Implement comprehensive keyboard navigation and enhanced focus indicators.

#### Tasks
- [ ] **3.1** Create `src/styles/focus.css` with focus indicator styles
- [ ] **3.2** Create `src/hooks/useKeyboardNavigation.ts` for global keyboard shortcuts
- [ ] **3.3** Implement focus-visible polyfill or use CSS :focus-visible
- [ ] **3.4** Add keyboard-nav class toggle on Tab key press
- [ ] **3.5** Ensure all interactive elements are keyboard accessible (buttons, links, inputs)
- [ ] **3.6** Implement enhanced focus option with thicker outlines and shadows
- [ ] **3.7** Add focus-within styles for complex components
- [ ] **3.8** Implement skip-to-main-content link for screen readers
- [ ] **3.9** Ensure logical focus order throughout app
- [ ] **3.10** Add keyboard shortcut: Escape to pause/unpause
- [ ] **3.11** Add keyboard shortcut: ? to show keyboard shortcuts help modal
- [ ] **3.12** Test tab navigation through entire app
- [ ] **3.13** Test focus visibility in all themes (default, high contrast, color blind)
- [ ] **3.14** Document all keyboard shortcuts in code and UI

#### Build Gate
```bash
npm run build
npm run dev
# Test keyboard-only navigation
# Verify all elements reachable via Tab
# Verify focus indicators visible
```

#### Phase Completion
```
<promise>PRP-024 PHASE 3 COMPLETE</promise>
```

---

### Phase 4: ARIA Labels & Screen Reader Support

**Objective**: Add comprehensive ARIA labels and screen reader support.

#### Tasks
- [ ] **4.1** Update `src/components/TypingArea.tsx` with ARIA labels and roles
- [ ] **4.2** Add role="application" or role="region" to main typing area
- [ ] **4.3** Add aria-live regions for dynamic content (WPM, accuracy, errors)
- [ ] **4.4** Add aria-label to all buttons (start, pause, next, etc.)
- [ ] **4.5** Update `src/components/LessonCard.tsx` with ARIA labels
- [ ] **4.6** Add aria-describedby for lesson descriptions
- [ ] **4.7** Update `src/components/LessonView.tsx` with semantic headings and landmarks
- [ ] **4.8** Add role="timer" for timer display
- [ ] **4.9** Update `src/components/Quiz.tsx` with ARIA labels for quiz questions
- [ ] **4.10** Add aria-current for current lesson/step
- [ ] **4.11** Implement screen reader announcements for:
  - Lesson start
  - Lesson complete (with stats)
  - Errors/mistakes
  - Progress milestones
  - Settings changes
- [ ] **4.12** Add .sr-only utility class for screen reader only content
- [ ] **4.13** Add hidden instructions for complex interactions
- [ ] **4.14** Ensure all images have alt text (decorative images: alt="")
- [ ] **4.15** Test with NVDA (Windows) or VoiceOver (macOS)
- [ ] **4.16** Test with JAWS if available

#### Build Gate
```bash
npm run build
npm run dev
# Test with screen reader
# Verify all content announced correctly
# Verify interactive elements labeled
```

#### Phase Completion
```
<promise>PRP-024 PHASE 4 COMPLETE</promise>
```

---

### Phase 5: Settings Panel & Motion Preferences

**Objective**: Create accessibility settings panel and implement motion preferences.

#### Tasks
- [ ] **5.1** Create `src/components/AccessibilityPanel.tsx` with settings UI
- [ ] **5.2** Add font size slider (75%-150%)
- [ ] **5.3** Add high contrast toggle
- [ ] **5.4** Add color blind mode selector (dropdown)
- [ ] **5.5** Add reduce motion toggle
- [ ] **5.6** Add reduce transparency toggle
- [ ] **5.7** Add enhanced focus toggle
- [ ] **5.8** Add screen reader mode toggle
- [ ] **5.9** Add reset to defaults button
- [ ] **5.10** Implement reduce motion: disable all transitions and animations
- [ ] **5.11** Use CSS media query prefers-reduced-motion as default
- [ ] **5.12** Add WCAG compliance statement to settings panel
- [ ] **5.13** Update `src/components/Settings.tsx` to include accessibility panel
- [ ] **5.14** Add accessibility tab/section to settings
- [ ] **5.15** Ensure all settings persist to localStorage
- [ ] **5.16** Add i18n translations for all accessibility settings
- [ ] **5.17** Update `src/i18n/locales/en.json` with accessibility strings
- [ ] **5.18** Update `src/i18n/locales/de.json` with accessibility strings
- [ ] **5.19** Update `src/i18n/locales/fr.json` with accessibility strings (if exists)
- [ ] **5.20** Test settings panel with keyboard navigation
- [ ] **5.21** Test settings panel with screen reader

#### Build Gate
```bash
npm run build
npm run dev
# Test all settings work
# Verify settings persist across sessions
# Test with keyboard and screen reader
```

#### Phase Completion
```
<promise>PRP-024 PHASE 5 COMPLETE</promise>
```

---

## Final Verification

- [ ] All phase promises output (Phases 1-5)
- [ ] `npm run build` passes
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] WCAG 2.1 AA compliance checklist completed
- [ ] Keyboard-only navigation tested successfully
- [ ] Screen reader testing completed (NVDA/VoiceOver)
- [ ] High contrast mode tested
- [ ] All color blind palettes tested
- [ ] Font scaling tested (75%, 100%, 150%)
- [ ] Reduce motion tested
- [ ] Focus indicators visible in all modes
- [ ] All interactive elements keyboard accessible
- [ ] ARIA labels present and accurate
- [ ] Documentation created (ACCESSIBILITY.md, KEYBOARD-SHORTCUTS.md)
- [ ] Changes committed with descriptive message

---

## Final Completion

When ALL of the above are complete:
```
<promise>PRP-024 COMPLETE</promise>
```

---

## Rollback Plan

```bash
# If issues discovered after deployment:

# 1. Revert accessibility changes
git revert HEAD~N  # revert commits from this PRP

# 2. Or: Disable specific features via settings
# Add feature flags to disable problematic features

# 3. Settings stored in localStorage
# Users can reset via "Reset to Defaults" button
# Or clear localStorage: localStorage.removeItem('accessibility-settings')
```

---

## Open Questions & Decisions

### Q1: Should accessibility settings be synced across devices?

**Options:**
- A) localStorage only (current scope)
- B) Cloud sync for logged-in users
- C) Export/import settings JSON

**Recommendation:** Option A for v1, Option B for future with user accounts

### Q2: Level of WCAG compliance to target?

**Options:**
- A) WCAG 2.1 A (basic)
- B) WCAG 2.1 AA (standard)
- C) WCAG 2.1 AAA (advanced)

**Recommendation:** Option B (AA) - good balance of accessibility and effort

### Q3: Should we support multiple screen readers?

**Options:**
- A) Test with NVDA only (Windows, free)
- B) Test with NVDA + VoiceOver (macOS, built-in)
- C) Test with NVDA + VoiceOver + JAWS (comprehensive)

**Recommendation:** Option B - covers most users

---

## Appendix A: WCAG 2.1 AA Compliance Checklist

### Perceivable
- [ ] **1.1.1** Non-text Content: All images have alt text
- [ ] **1.3.1** Info and Relationships: Semantic HTML and ARIA
- [ ] **1.3.2** Meaningful Sequence: Logical reading order
- [ ] **1.4.3** Contrast (Minimum): 4.5:1 for normal text, 3:1 for large text
- [ ] **1.4.4** Resize text: Text can be resized to 200% without loss of functionality
- [ ] **1.4.10** Reflow: Content reflows at 320px viewport width
- [ ] **1.4.11** Non-text Contrast: UI components have 3:1 contrast
- [ ] **1.4.12** Text Spacing: Content adapts to increased spacing

### Operable
- [ ] **2.1.1** Keyboard: All functionality available via keyboard
- [ ] **2.1.2** No Keyboard Trap: Focus can move away from all components
- [ ] **2.4.1** Bypass Blocks: Skip to main content link
- [ ] **2.4.3** Focus Order: Logical focus order
- [ ] **2.4.7** Focus Visible: Keyboard focus indicator visible
- [ ] **2.5.1** Pointer Gestures: All functionality available without path-based gestures
- [ ] **2.5.2** Pointer Cancellation: Functions triggered on up-event
- [ ] **2.5.3** Label in Name: Accessible name contains visible text

### Understandable
- [ ] **3.1.1** Language of Page: HTML lang attribute set
- [ ] **3.2.1** On Focus: No context change on focus
- [ ] **3.2.2** On Input: No context change on input
- [ ] **3.3.1** Error Identification: Errors identified in text
- [ ] **3.3.2** Labels or Instructions: Labels provided for inputs
- [ ] **3.3.3** Error Suggestion: Error correction suggestions provided

### Robust
- [ ] **4.1.2** Name, Role, Value: All components have accessible names and roles
- [ ] **4.1.3** Status Messages: Status messages use ARIA live regions

---

## Appendix B: Keyboard Shortcuts Reference

| Key | Action |
|-----|--------|
| Tab | Move focus forward |
| Shift+Tab | Move focus backward |
| Enter | Activate focused element |
| Space | Activate focused button/checkbox |
| Escape | Pause/unpause lesson, close modals |
| ? (Shift+/) | Show keyboard shortcuts help |
| Arrow keys | Navigate within components |

---

## Appendix C: Color Contrast Ratios

| Element Type | WCAG AA | WCAG AAA |
|--------------|---------|----------|
| Normal text (< 18pt) | 4.5:1 | 7:1 |
| Large text (≥ 18pt or ≥ 14pt bold) | 3:1 | 4.5:1 |
| UI components and graphics | 3:1 | Not defined |

---

## Appendix D: Screen Reader Testing Checklist

### NVDA (Windows)
- [ ] All headings announced with correct level
- [ ] All buttons announced with accessible name
- [ ] All form inputs announced with label
- [ ] ARIA live regions announce updates
- [ ] Navigation landmarks announced
- [ ] Current focus position clear

### VoiceOver (macOS)
- [ ] Rotor navigation works (headings, links, form controls)
- [ ] All interactive elements announced
- [ ] ARIA labels announced correctly
- [ ] Live region updates announced
- [ ] Keyboard navigation smooth

---

## References

- WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Color Blind Simulation: https://www.color-blindness.com/coblis-color-blindness-simulator/
- NVDA Screen Reader: https://www.nvaccess.org/download/

---

## Changelog

| Date | Author | Changes |
|------|--------|---------|
| 2025-12-25 | Claude + Anton | Initial draft |

---

<!--
WIGGUM EXECUTION COMMAND:
/ralph-loop "Execute PRP-024 per docs/PRP-024-ACCESSIBILITY.md. Work through all unchecked tasks sequentially including pre-flight checks. Mark each [x] when done. Run build gates after each phase. Output phase promises after each phase. Test with keyboard navigation and verify ARIA labels. Output <promise>PRP-024 COMPLETE</promise> when all tasks are done. Do NOT ask for confirmation between tasks." --completion-promise "PRP-024 COMPLETE" --max-iterations 120
-->
