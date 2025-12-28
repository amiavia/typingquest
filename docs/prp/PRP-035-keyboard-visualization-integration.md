# PRP-035: Keyboard Visualization Integration (Proposal 1 + Auto-Detection)

## Executive Summary

This PRP details the integration of **Proposal 1: Pixel Hands Below Keyboard** with **PRP-034's intelligent layout detection** into the TypeBit8 web application. The goal is to replace the current modal-based layout selection with a seamless, automatic detection experience that happens naturally as users interact with the app.

### Key Question: Do We Still Need the Layout Selection Modal?

**Short answer: No, not as the primary flow.**

**Why:**
1. PRP-034's detection is automatic - it detects layout from any typing, not just home-row specific input
2. Users can start using the app immediately without configuration
3. The pixel hands provide instant visual feedback on correct finger positioning
4. Layout locks once a definitive key is pressed (ö, ü, ä for German, etc.)

**However, we should keep:**
- Manual layout selection in **Settings** as a fallback/override
- A small "Change Layout" link near the keyboard for quick access

---

## Current State Analysis

### Existing Components

| File | Purpose | Status |
|------|---------|--------|
| `src/components/Keyboard.tsx` | Main keyboard visualization | **REPLACE** with new design |
| `src/components/LayoutSelector.tsx` | Modal: Region → Layout selection | **DEPRECATE** (move to Settings) |
| `src/components/LayoutDetector.tsx` | Modal: Type home-row to detect | **REMOVE** (replaced by auto-detect) |
| `src/providers/KeyboardSkinProvider.tsx` | Keyboard visual themes | **KEEP** (integrate with new design) |
| `src/data/keyboardLayouts.ts` | Layout definitions & transforms | **KEEP** (add detection logic) |

### Current Keyboard Locations

1. **App.tsx** (Home page hero) - Line ~366
2. **LessonView.tsx** (During lessons) - Lines ~180, ~220
3. **Quiz.tsx** (During quiz/boss battles) - Line ~100
4. **DailyChallengeView.tsx** (Daily challenges) - Line ~150
5. **LayoutSelector.tsx** (Layout preview) - Lines 83-99, 207-223
6. **LayoutDetector.tsx** (Detection preview) - Lines 95-111, 208-223, 276-291

### Current First-Visit Flow

```
1. User opens app
2. Check localStorage for 'typingQuestLayout'
3. If not found → Show LayoutSelector modal
4. User must: Select region → Select layout (or use auto-detect)
5. Layout saved → Modal closes → App usable
```

### New First-Visit Flow (After This PRP)

```
1. User opens app
2. Check localStorage for 'typingQuestLayout'
3. If not found → Show keyboard with "DETECTING..." status
4. User starts typing anywhere (lesson, practice, even searching)
5. Layout auto-detected from definitive keys (ö, z on KeyY, etc.)
6. Status changes to "LOCKED: QWERTZ" (green)
7. Layout auto-saved to localStorage + Convex (if authenticated)
8. No modal interruption!
```

---

## New Component Architecture

### 1. KeyboardWithHands.tsx (NEW)

**Purpose:** Unified keyboard visualization with pixel hands and auto-detection

**Location:** `src/components/KeyboardWithHands.tsx`

**Props Interface:**
```typescript
interface KeyboardWithHandsProps {
  // Display options
  layout: KeyboardLayoutType;
  showFingerColors?: boolean;      // Default: true
  showHands?: boolean;             // Default: true
  showDetectionStatus?: boolean;   // Default: false (only on landing)
  compact?: boolean;               // Default: false (smaller for in-game)

  // Key highlighting
  highlightKeys?: string[];        // Keys to highlight (lesson focus)
  activeKey?: string;              // Currently expected key
  pressedKey?: string;             // Key user just pressed
  incorrectKey?: boolean;          // Was last press incorrect?

  // Detection callbacks
  onLayoutDetected?: (layout: KeyboardLayoutType) => void;
  onLayoutLocked?: (layout: KeyboardLayoutType) => void;

  // Skin integration
  skinOverride?: KeyboardSkin;     // Override provider skin
}
```

**Internal State:**
```typescript
// From PRP-034
const [detectionState, setDetectionState] = useState<'DETECTING' | 'DETECTED' | 'LOCKED'>('DETECTING');
const [layoutLocked, setLayoutLocked] = useState(false);
const [layoutConfidence, setLayoutConfidence] = useState({ QWERTY: 0, QWERTZ: 0, AZERTY: 0 });
```

**Structure:**
```
<KeyboardWithHands>
  ├── <DetectionIndicator />      // "LAYOUT: QWERTZ [LOCKED]"
  ├── <KeyboardGrid>
  │     ├── <KeyRow keys={row1} />  // Q W E R T Y U I O P
  │     ├── <KeyRow keys={row2} />  // A S D F G H J K L ;
  │     ├── <KeyRow keys={row3} />  // Z X C V B N M , . /
  │     └── <SpaceBar />
  │
  └── <PixelHands>
        ├── <LeftHand fingers={4} thumb={1} />
        └── <RightHand fingers={4} thumb={1} />
</KeyboardWithHands>
```

### 2. KeyboardLayoutProvider.tsx (NEW)

**Purpose:** Global keyboard layout state + auto-detection logic from PRP-034

**Location:** `src/providers/KeyboardLayoutProvider.tsx`

**Context Value:**
```typescript
interface KeyboardLayoutContextValue {
  // Current state
  layout: KeyboardLayoutType;
  detectionState: 'DETECTING' | 'DETECTED' | 'LOCKED';
  isLocked: boolean;

  // Detection methods
  processKeystroke: (code: string, key: string) => void;
  resetDetection: () => void;

  // Manual override
  setLayout: (layout: KeyboardLayoutType) => void;
  lockLayout: (layout: KeyboardLayoutType) => void;

  // Persistence
  saveLayout: () => Promise<void>;  // Save to Convex + localStorage
}
```

**Detection Logic (from PRP-034):**
```typescript
// Definitive keys - immediately lock
const definitiveKeys = {
  'KeyY': { 'z': 'QWERTZ' },
  'KeyZ': { 'y': 'QWERTZ', 'w': 'AZERTY' },
  'Semicolon': { 'ö': 'QWERTZ', 'm': 'AZERTY' },
  'Quote': { 'ä': 'QWERTZ' },
  'BracketLeft': { 'ü': 'QWERTZ' },
  'Minus': { 'ß': 'QWERTZ' },
  'KeyQ': { 'a': 'AZERTY' },
  'KeyA': { 'q': 'AZERTY' },
  'KeyW': { 'z': 'AZERTY' },
  'KeyM': { ',': 'AZERTY' },
};

// Confirmatory keys - add confidence
const confirmatoryKeys = {
  'KeyY': { 'y': 'QWERTY' },
  'KeyZ': { 'z': 'QWERTY' },
  'Semicolon': { ';': 'QWERTY' },
  // ...
};

// Neutral keys - ignored (same across QWERTY/QWERTZ)
const neutralKeys = new Set(['KeyA', 'KeyB', 'KeyC', ...]);
```

### 3. PixelHands.tsx (NEW)

**Purpose:** Pixel-art hand visualization with finger highlighting

**Location:** `src/components/PixelHands.tsx`

**Props:**
```typescript
interface PixelHandsProps {
  activeFinger?: FingerType;  // Which finger to highlight
  compact?: boolean;          // Smaller version for in-game
}

type FingerType =
  | 'l-pinky' | 'l-ring' | 'l-mid' | 'l-index'
  | 'r-index' | 'r-mid' | 'r-ring' | 'r-pinky'
  | 'thumb';
```

**Finger Colors (matching keyboard key colors):**
```typescript
const fingerColors = {
  'l-pinky': '#e63946',   // Red
  'l-ring': '#ff6b35',    // Orange
  'l-mid': '#ffd93d',     // Yellow
  'l-index': '#0ead69',   // Green
  'r-index': '#3bceac',   // Teal
  'r-mid': '#0f4c75',     // Blue
  'r-ring': '#9d4edd',    // Purple
  'r-pinky': '#ff6b9d',   // Pink
  'thumb': '#6c757d',     // Gray
};
```

### 4. DetectionIndicator.tsx (NEW)

**Purpose:** Shows current detection status with visual feedback

**Location:** `src/components/DetectionIndicator.tsx`

**States:**
```
DETECTING    → Teal border, "Press keys to detect layout"
DETECTED     → Yellow border, "QWERTY (confirming...)"
LOCKED       → Green border, "QWERTZ [LOCKED]" + checkmark
```

---

## File-by-File Integration Plan

### 1. src/main.tsx

**Current:**
```tsx
<ThemeProvider>
  <KeyboardSkinProvider>
    <PowerUpProvider>
      {children}
    </PowerUpProvider>
  </KeyboardSkinProvider>
</ThemeProvider>
```

**Change to:**
```tsx
<ThemeProvider>
  <KeyboardSkinProvider>
    <KeyboardLayoutProvider>  {/* NEW */}
      <PowerUpProvider>
        {children}
      </PowerUpProvider>
    </KeyboardLayoutProvider>
  </KeyboardSkinProvider>
</ThemeProvider>
```

### 2. src/App.tsx

**Remove (lines 65-70):**
```tsx
// DELETE: First-visit modal trigger
useEffect(() => {
  const hasSetLayout = localStorage.getItem('typingQuestLayout');
  if (!hasSetLayout) {
    setShowLayoutSelector(true);
  }
}, []);
```

**Remove state variables:**
```tsx
// DELETE these:
const [showLayoutSelector, setShowLayoutSelector] = useState(false);
const [showLayoutDetector, setShowLayoutDetector] = useState(false);
```

**Remove modal renders (bottom of file):**
```tsx
// DELETE:
{showLayoutSelector && <LayoutSelector ... />}
{showLayoutDetector && <LayoutDetector ... />}
```

**Replace keyboard in hero section (line ~366):**

**Current:**
```tsx
<div style={{ transform: 'scale(0.85)', marginTop: '-10px' }}>
  <Keyboard
    highlightKeys={homeRowKeys}
    showFingerColors={true}
    layout={keyboardLayout}
  />
</div>
```

**Replace with:**
```tsx
<KeyboardWithHands
  layout={layout}
  showFingerColors={true}
  showHands={true}
  showDetectionStatus={true}  // Show on landing page
  highlightKeys={homeRowKeys}
  onLayoutLocked={(newLayout) => {
    // Auto-save when locked
    saveLayout(newLayout);
  }}
/>
```

**Update keyboardLayout to use provider:**
```tsx
// OLD:
const [keyboardLayout, setKeyboardLayout] = useState<KeyboardLayoutType>(() => {
  return (localStorage.getItem('typingQuestLayout') as KeyboardLayoutType) || 'QWERTY-US';
});

// NEW:
const { layout, setLayout, saveLayout } = useKeyboardLayout();
```

### 3. src/components/LessonView.tsx

**Replace Keyboard import and usage:**

**Current (line ~180, intro phase):**
```tsx
<Keyboard
  layout={keyboardLayout}
  highlightKeys={layoutKeys}
  showFingerColors={true}
/>
```

**Replace with:**
```tsx
<KeyboardWithHands
  layout={layout}
  highlightKeys={layoutKeys}
  showFingerColors={true}
  showHands={true}
  compact={false}  // Full size during intro
/>
```

**Current (line ~220, practice phase):**
```tsx
<Keyboard
  layout={keyboardLayout}
  highlightKeys={layoutKeys}
  activeKey={currentExercise.keys[currentIndex]}
  pressedKey={pressedKey}
  incorrectKey={!isCorrect}
  showFingerColors={true}
/>
```

**Replace with:**
```tsx
<KeyboardWithHands
  layout={layout}
  highlightKeys={layoutKeys}
  activeKey={currentExercise.keys[currentIndex]}
  pressedKey={pressedKey}
  incorrectKey={!isCorrect}
  showFingerColors={true}
  showHands={true}
  compact={true}  // Smaller during active practice
/>
```

### 4. src/components/Quiz.tsx

**Replace Keyboard usage (line ~100):**

**Current:**
```tsx
<Keyboard
  layout={keyboardLayout}
  highlightKeys={layoutKeys}
  activeKey={activeKey}
  pressedKey={pressedKey}
  incorrectKey={isCorrect}
  showFingerColors={true}
/>
```

**Replace with:**
```tsx
<KeyboardWithHands
  layout={layout}
  highlightKeys={layoutKeys}
  activeKey={activeKey}
  pressedKey={pressedKey}
  incorrectKey={!isCorrect}
  showFingerColors={true}
  showHands={true}
  compact={true}  // Compact during quiz
/>
```

### 5. src/components/DailyChallengeView.tsx

**Replace Keyboard usage (line ~150):**

**Current:**
```tsx
<Keyboard
  keyboardLayout={keyboardLayout}
  highlightKeys={layoutKeys}
  // ...other props
/>
```

**Replace with:**
```tsx
<KeyboardWithHands
  layout={layout}
  highlightKeys={layoutKeys}
  showFingerColors={true}
  showHands={true}
  compact={true}
/>
```

### 6. src/components/Keyboard.tsx

**Action: DEPRECATE**

Keep the file but add deprecation notice:
```tsx
/**
 * @deprecated Use KeyboardWithHands instead. This component will be removed in v2.0.
 * Migration: Replace <Keyboard /> with <KeyboardWithHands showHands={false} />
 */
export function Keyboard(props: KeyboardProps) {
  console.warn('Keyboard is deprecated. Use KeyboardWithHands instead.');
  return <KeyboardWithHands {...props} showHands={false} />;
}
```

### 7. src/components/LayoutSelector.tsx

**Action: MOVE to Settings page**

- Remove modal wrapper
- Keep layout grid UI for manual selection
- Integrate into Settings page as "Keyboard Layout" section

**New location:** `src/components/settings/KeyboardLayoutSettings.tsx`

### 8. src/components/LayoutDetector.tsx

**Action: DELETE**

This file is completely replaced by the auto-detection in KeyboardLayoutProvider.

### 9. Settings Page Integration

**Add to settings (create if doesn't exist):**

```tsx
// src/pages/Settings.tsx or src/components/Settings.tsx

import { useKeyboardLayout } from '../providers/KeyboardLayoutProvider';

function KeyboardSettings() {
  const { layout, setLayout, lockLayout, detectionState, resetDetection } = useKeyboardLayout();

  return (
    <section>
      <h3>Keyboard Layout</h3>

      {/* Current layout with status */}
      <div className="current-layout">
        <span>Current: {layout}</span>
        <span className={`status ${detectionState.toLowerCase()}`}>
          {detectionState === 'LOCKED' ? '🔒 Locked' : '🔍 Detecting'}
        </span>
      </div>

      {/* Manual selection grid */}
      <div className="layout-grid">
        {Object.entries(layoutsByRegion).map(([region, layouts]) => (
          <div key={region} className="region-group">
            <h4>{region}</h4>
            {layouts.map(l => (
              <button
                key={l.id}
                className={layout === l.id ? 'selected' : ''}
                onClick={() => lockLayout(l.id)}
              >
                {l.name}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Reset detection */}
      <button onClick={resetDetection}>
        🔄 Re-detect Layout
      </button>
    </section>
  );
}
```

---

## Global Keyboard Event Handling

### Current Problem
Keyboard events are handled locally in each component (Quiz, LessonView, etc.)

### Solution
Move detection to provider level with global event listener:

```tsx
// In KeyboardLayoutProvider.tsx

useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Only process for detection if not locked
    if (!isLocked) {
      processKeystroke(e.code, e.key);
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [isLocked, processKeystroke]);
```

This means detection happens **anywhere** in the app, not just when focused on the keyboard component.

---

## CSS/Styling Updates

### New CSS File: KeyboardWithHands.css

```css
/* src/components/KeyboardWithHands.css */

.keyboard-with-hands {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

/* Detection indicator */
.detection-indicator {
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  padding: 8px 16px;
  border: 2px solid var(--indicator-color, #3bceac);
  border-radius: 4px;
  background: rgba(26, 26, 46, 0.9);
  transition: border-color 0.3s, background-color 0.3s;
}

.detection-indicator.detecting { --indicator-color: #3bceac; }
.detection-indicator.detected { --indicator-color: #ffd93d; }
.detection-indicator.locked { --indicator-color: #0ead69; }

/* Keyboard grid */
.keyboard-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.keyboard-row {
  display: flex;
  gap: 6px;
  justify-content: center;
}

/* Keys */
.key {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  border: 3px solid var(--key-border, #3bceac);
  border-radius: 4px;
  background: var(--key-bg, #1a1a2e);
  color: var(--key-color, #eef5db);
  transition: all 0.1s ease;
  position: relative;
}

.key.active {
  transform: scale(1.1);
  box-shadow: 0 0 20px var(--key-border);
}

.key.pressed {
  transform: scale(0.95);
  background: var(--key-border);
  color: #0f0f1b;
}

.key.incorrect {
  animation: shake 0.3s;
  border-color: #e63946;
  box-shadow: 0 0 20px #e63946;
}

/* Home row indicators */
.key .home-indicator {
  position: absolute;
  bottom: 4px;
  width: 14px;
  height: 4px;
  background: currentColor;
  border-radius: 2px;
}

/* Space bar */
.key.space {
  width: 220px;
}

/* Finger colors */
.key.finger-l-pinky { --key-border: #e63946; --key-bg: rgba(230, 57, 70, 0.2); }
.key.finger-l-ring { --key-border: #ff6b35; --key-bg: rgba(255, 107, 53, 0.2); }
.key.finger-l-mid { --key-border: #ffd93d; --key-bg: rgba(255, 217, 61, 0.2); }
.key.finger-l-index { --key-border: #0ead69; --key-bg: rgba(14, 173, 105, 0.2); }
.key.finger-r-index { --key-border: #3bceac; --key-bg: rgba(59, 206, 172, 0.2); }
.key.finger-r-mid { --key-border: #0f4c75; --key-bg: rgba(15, 76, 117, 0.2); }
.key.finger-r-ring { --key-border: #9d4edd; --key-bg: rgba(157, 78, 221, 0.2); }
.key.finger-r-pinky { --key-border: #ff6b9d; --key-bg: rgba(255, 107, 157, 0.2); }
.key.finger-thumb { --key-border: #6c757d; --key-bg: rgba(108, 117, 125, 0.3); }

/* Pixel hands */
.pixel-hands {
  display: flex;
  justify-content: center;
  gap: 80px;
  margin-top: 20px;
}

.pixel-hand {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pixel-hand .label {
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  color: #3bceac;
  margin-bottom: 10px;
}

.hand-pixels {
  display: flex;
  gap: 2px;
}

.finger-pixel {
  width: 16px;
  border-radius: 8px 8px 4px 4px;
  transition: all 0.15s ease;
}

.finger-pixel.active {
  transform: scale(1.3);
  box-shadow: 0 0 15px currentColor;
}

.thumb-pixel {
  width: 28px;
  height: 18px;
  background: #6c757d;
  border-radius: 4px;
  margin-top: 8px;
  transition: all 0.15s ease;
}

.thumb-pixel.active {
  transform: scale(1.3);
  box-shadow: 0 0 15px #6c757d;
}

/* Compact mode */
.keyboard-with-hands.compact .keyboard-grid {
  transform: scale(0.75);
}

.keyboard-with-hands.compact .pixel-hands {
  transform: scale(0.7);
  margin-top: 10px;
}

/* Animations */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Types Key                           │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│              KeyboardLayoutProvider (Global Listener)            │
│                                                                 │
│  1. Receive keydown event (code, key)                          │
│  2. Check if layout is locked                                   │
│     - If locked: only check for contradicting definitive keys   │
│     - If not locked: process for detection                      │
│  3. Check definitiveKeys map                                    │
│     - Match found? → Lock layout, update state                  │
│  4. Check confirmatoryKeys map                                  │
│     - Match found? → Increment confidence                       │
│     - Threshold reached? → Update detected layout               │
│  5. Check neutralKeys set                                       │
│     - Match found? → Ignore (no state change)                   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    State Updates (React Context)                 │
│                                                                 │
│  - layout: KeyboardLayoutType                                   │
│  - detectionState: 'DETECTING' | 'DETECTED' | 'LOCKED'         │
│  - isLocked: boolean                                            │
│  - layoutConfidence: { QWERTY: n, QWERTZ: n, AZERTY: n }       │
└─────────────────────────────────────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
┌───────────────────────────┐   ┌───────────────────────────┐
│   KeyboardWithHands       │   │   Persistence             │
│                           │   │                           │
│   - Re-renders with new   │   │   - localStorage update   │
│     layout                │   │   - Convex mutation       │
│   - Updates detection     │   │     (if authenticated)    │
│     indicator             │   │                           │
│   - Highlights fingers    │   │                           │
└───────────────────────────┘   └───────────────────────────┘
```

---

## Migration Checklist

### Phase 1: Create New Components
- [ ] Create `src/providers/KeyboardLayoutProvider.tsx`
- [ ] Create `src/components/KeyboardWithHands.tsx`
- [ ] Create `src/components/PixelHands.tsx`
- [ ] Create `src/components/DetectionIndicator.tsx`
- [ ] Create `src/components/KeyboardWithHands.css`

### Phase 2: Update main.tsx
- [ ] Add KeyboardLayoutProvider to provider tree
- [ ] Position after KeyboardSkinProvider, before PowerUpProvider

### Phase 3: Update App.tsx
- [ ] Remove showLayoutSelector state
- [ ] Remove showLayoutDetector state
- [ ] Remove first-visit useEffect that shows modal
- [ ] Remove LayoutSelector modal render
- [ ] Remove LayoutDetector modal render
- [ ] Replace Keyboard with KeyboardWithHands in hero section
- [ ] Use useKeyboardLayout hook instead of local state

### Phase 4: Update LessonView.tsx
- [ ] Replace Keyboard import with KeyboardWithHands
- [ ] Update props for intro phase keyboard
- [ ] Update props for practice phase keyboard
- [ ] Use useKeyboardLayout hook

### Phase 5: Update Quiz.tsx
- [ ] Replace Keyboard import with KeyboardWithHands
- [ ] Update props
- [ ] Use useKeyboardLayout hook

### Phase 6: Update DailyChallengeView.tsx
- [ ] Replace Keyboard import with KeyboardWithHands
- [ ] Update props
- [ ] Use useKeyboardLayout hook

### Phase 7: Settings Integration
- [ ] Create Settings page if doesn't exist
- [ ] Add KeyboardLayoutSettings section
- [ ] Move layout grid from LayoutSelector
- [ ] Add reset detection button

### Phase 8: Cleanup
- [ ] Mark Keyboard.tsx as deprecated
- [ ] Delete LayoutDetector.tsx
- [ ] Update LayoutSelector.tsx for settings-only use
- [ ] Remove unused imports across codebase

### Phase 9: Testing
- [ ] Test QWERTY detection (pressing y on KeyY)
- [ ] Test QWERTZ detection (pressing ö, z on KeyY)
- [ ] Test AZERTY detection (pressing a on KeyQ)
- [ ] Test that neutral keys (a, b, c...) don't change locked layout
- [ ] Test persistence to localStorage
- [ ] Test persistence to Convex (authenticated users)
- [ ] Test layout switch mid-session
- [ ] Test manual override in settings

---

## Files to Create (Summary)

| File | Lines (Est.) | Description |
|------|-------------|-------------|
| `src/providers/KeyboardLayoutProvider.tsx` | ~200 | Detection logic + context |
| `src/components/KeyboardWithHands.tsx` | ~300 | Main unified component |
| `src/components/PixelHands.tsx` | ~100 | Pixel art hands |
| `src/components/DetectionIndicator.tsx` | ~50 | Status badge |
| `src/components/KeyboardWithHands.css` | ~200 | All styles |
| `src/components/settings/KeyboardLayoutSettings.tsx` | ~100 | Settings section |

**Total new code: ~950 lines**

---

## Files to Modify (Summary)

| File | Changes |
|------|---------|
| `src/main.tsx` | Add provider (+3 lines) |
| `src/App.tsx` | Remove modals, use new component (-50, +20 lines) |
| `src/components/LessonView.tsx` | Replace Keyboard (-10, +15 lines) |
| `src/components/Quiz.tsx` | Replace Keyboard (-10, +15 lines) |
| `src/components/DailyChallengeView.tsx` | Replace Keyboard (-10, +15 lines) |

---

## Files to Delete

| File | Reason |
|------|--------|
| `src/components/LayoutDetector.tsx` | Replaced by auto-detection |

---

## Files to Deprecate

| File | Action |
|------|--------|
| `src/components/Keyboard.tsx` | Add deprecation warning, wrap KeyboardWithHands |
| `src/components/LayoutSelector.tsx` | Move to settings-only use |

---

## Success Criteria

1. **No Modal on First Visit** - Users see keyboard immediately, start typing
2. **Automatic Detection** - Layout detected within first few keypresses
3. **Visual Feedback** - Users see "DETECTING" → "LOCKED: QWERTZ" progression
4. **Finger Guidance** - Pixel hands show which finger to use
5. **Persistence** - Layout saved automatically, survives refresh
6. **Manual Override** - Users can change layout in settings
7. **No Regressions** - All existing features (lessons, quiz, skins) still work

---

## Appendix: Finger-to-Key Mapping Reference

```
LEFT HAND                          RIGHT HAND
─────────                          ──────────
Pinky (Red)    : Q A Z             Index (Teal) : Y H N U J M
Ring (Orange)  : W S X             Middle (Blue): I K ,
Middle (Yellow): E D C             Ring (Purple): O L .
Index (Green)  : R F V T G B       Pinky (Pink) : P ; /

THUMBS (Gray): SPACE BAR
```

---

## Appendix: Layout Detection Keys Quick Reference

| Layout | Definitive Keys | Detection Trigger |
|--------|-----------------|-------------------|
| QWERTZ | ö, ä, ü, ß, z (on KeyY), y (on KeyZ) | Any German character |
| AZERTY | a (on KeyQ), q (on KeyA), z (on KeyW), w (on KeyZ) | French key positions |
| QWERTY | (default) | Confirmed via y (on KeyY), z (on KeyZ), ; (on Semicolon) |

---

## Appendix: First-Button Detection Conflicts Analysis

### The Core Problem

When a user first visits TypeBit8's **landing page**, we want to detect their keyboard layout automatically from any keystrokes they make - **before** they even start a lesson. This creates specific challenges.

### Landing Page Detection Context

**Where detection happens:** The landing page (App.tsx home view)
**When:** User's first visit, before any lesson starts
**How:** Global keydown listener captures ANY typing on the page

```
┌─────────────────────────────────────────────────────────────────┐
│                     LANDING PAGE                                │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │  KEYBOARD VISUALIZATION WITH PIXEL HANDS                │  │
│   │                                                         │  │
│   │  Status: "DETECTING - Press any keys..."               │  │
│   │                                                         │  │
│   │  [Q][W][E][R][T][Y][U][I][O][P]                        │  │
│   │   [A][S][D][F][G][H][J][K][L][;]                       │  │
│   │    [Z][X][C][V][B][N][M][,][.][/]                      │  │
│   │         [        SPACE        ]                        │  │
│   │                                                         │  │
│   │       🖐️ LEFT HAND    RIGHT HAND 🖐️                    │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   User types ANYWHERE on page → Layout detected                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Key Insight: Landing Page vs Lessons

| Context | Expected Text? | Race Condition? | Detection Method |
|---------|----------------|-----------------|------------------|
| **Landing Page** | No | No | Free-form typing, any keys |
| Lessons | Yes | Yes (Conflict #2) | Must match expected text |

On the **landing page**, there's NO expected text - users just type freely. This eliminates the critical race condition (Conflict #2). Detection is pure observation.

### What Triggers Detection on Landing Page?

Users might type on the landing page by:
1. **Accidentally pressing keys** while browsing
2. **Testing the keyboard visualization** (natural curiosity)
3. **Responding to a prompt** we show them
4. **Using keyboard shortcuts** (Ctrl+F, etc.)

### Lesson Curriculum Analysis (Secondary)

Once detection is complete on the landing page, lessons use the saved layout. However, if a user skips the landing page or detection fails, lessons provide backup detection:

| Lesson | Keys Introduced | Detection Keys Present? |
|--------|-----------------|------------------------|
| **1. Home Row** | a, s, d, f, j, k, l, **;** | **YES!** Semicolon key |
| **7. T and Y** | t, **y** | **YES!** KeyY |
| **11. Z and Period** | **z**, . | **YES!** KeyZ |

---

### Conflict 1: First Keystroke on Neutral Key

**Scenario:**
- User's first keystrokes are 'a', 's', 'd', 'f' (home row practice)
- These are **neutral keys** - same across QWERTY and QWERTZ
- No detection possible

**Impact:** Low - detection simply waits for differentiating key

**Solution:** Acceptable delay - detection will happen when ';' is typed in Lesson 1

---

### Conflict 2: User Doesn't Type Differentiating Keys ⚠️ IMPORTANT

**Scenario (Landing Page):**
1. User arrives at landing page
2. User scrolls, clicks around, but doesn't type
3. Or types only neutral keys
4. Detection never completes

**Impact:** HIGH - User might start lessons with incorrect layout

---

## Solution: Fun & Engaging "Try It Out" Experience

Instead of technical "detection", make it a **fun first interaction** with the app. Detection happens invisibly in the background while users have fun typing.

### Design Philosophy

```
❌ OLD: "Press Y, Z, or ; to detect your keyboard"  (Technical, boring)
✅ NEW: "Try typing something fun!"                  (Engaging, playful)
```

### The "Try It Out" Section

Position this prominently on the landing page, below the hero keyboard:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    ✨ TRY IT OUT! ✨                            │
│                                                                 │
│     See your fingers light up as you type!                     │
│                                                                 │
│     ┌─────────────────────────────────────────────────────┐    │
│     │                                                     │    │
│     │  Type here: [____________________________]          │    │
│     │                                                     │    │
│     │  💡 Try typing: "crazy pizza" or your name!        │    │
│     │                                                     │    │
│     └─────────────────────────────────────────────────────┘    │
│                                                                 │
│     [KEYBOARD WITH PIXEL HANDS - fingers light up as you type] │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Fun Typing Prompts (Rotating)

Show different prompts that naturally include detection keys:

```typescript
const funPrompts = [
  // English prompts with Y and Z
  { text: "crazy pizza", hint: "🍕 A classic combo!" },
  { text: "lazy yellow cat", hint: "🐱 Sounds cozy!" },
  { text: "fizzy lemonade", hint: "🍋 Refreshing!" },
  { text: "your name", hint: "👋 Say hello!" },
  { text: "amazing journey", hint: "🚀 Let's go!" },

  // German-friendly prompts (will produce umlauts on QWERTZ)
  { text: "größe spaß", hint: "🇩🇪 German speakers, try this!" },

  // Generic fun prompts
  { text: "the quick brown fox", hint: "📝 A typing classic!" },
  { text: "jazz music rocks", hint: "🎵 Feel the rhythm!" },
];
```

### Component Implementation

```typescript
function TryItOutSection() {
  const { layout, isLocked, detectionState } = useKeyboardLayout();
  const [inputText, setInputText] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState(getRandomPrompt());
  const [showSuccess, setShowSuccess] = useState(false);

  // When layout is detected, show celebration
  useEffect(() => {
    if (isLocked && !showSuccess) {
      setShowSuccess(true);
      confetti(); // Optional: fun celebration effect
    }
  }, [isLocked]);

  return (
    <section className="try-it-out">
      <h2>✨ Try It Out!</h2>
      <p className="subtitle">See your fingers light up as you type</p>

      {/* Fun input area */}
      <div className="typing-playground">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Try typing: "${currentPrompt.text}"`}
          className="fun-input"
          autoComplete="off"
        />
        <p className="hint">{currentPrompt.hint}</p>

        {/* Shuffle button for new prompt */}
        <button onClick={() => setCurrentPrompt(getRandomPrompt())}>
          🎲 New suggestion
        </button>
      </div>

      {/* Keyboard visualization - main attraction! */}
      <KeyboardWithHands
        layout={layout}
        showHands={true}
        showFingerColors={true}
        activeKey={inputText.slice(-1)}  // Highlight last typed key
      />

      {/* Success message - appears after detection */}
      {showSuccess && (
        <div className="success-toast">
          <span className="icon">🎉</span>
          <span>Perfect! Your keyboard is all set up.</span>
          <button onClick={() => scrollToLessons()}>
            Start Learning →
          </button>
        </div>
      )}

      {/* Subtle layout indicator (not the focus) */}
      <div className="layout-badge">
        {isLocked ? (
          <span>✓ {layout}</span>
        ) : (
          <span className="detecting">Setting up...</span>
        )}
        <button className="change-link" onClick={openSettings}>
          Change
        </button>
      </div>
    </section>
  );
}
```

### Visual Design

```css
.try-it-out {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 3px solid #3bceac;
  border-radius: 16px;
  padding: 40px;
  text-align: center;
}

.try-it-out h2 {
  font-size: 24px;
  color: #ffd93d;
  text-shadow: 0 0 20px #ffd93d40;
}

.fun-input {
  width: 100%;
  max-width: 400px;
  padding: 16px 24px;
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  background: #0f0f1b;
  border: 3px solid #3bceac;
  border-radius: 8px;
  color: #eef5db;
  text-align: center;
}

.fun-input:focus {
  border-color: #ffd93d;
  box-shadow: 0 0 20px #ffd93d40;
  outline: none;
}

.hint {
  font-size: 12px;
  color: #6a6a8e;
  margin-top: 8px;
}

.success-toast {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #0ead69;
  color: white;
  padding: 16px 24px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  animation: slideUp 0.3s ease;
}

.layout-badge {
  font-size: 10px;
  color: #6a6a8e;
  margin-top: 20px;
}

.change-link {
  background: none;
  border: none;
  color: #3bceac;
  text-decoration: underline;
  cursor: pointer;
  font-size: 10px;
}
```

### Words That Trigger Detection

The prompts are carefully chosen to include detection keys:

| Prompt | Detection Keys | Detects |
|--------|----------------|---------|
| "crazy pizza" | z, y | QWERTY (z on KeyZ, y on KeyY) |
| "lazy yellow cat" | z, y | QWERTY |
| "fizzy lemonade" | z, y | QWERTY |
| "amazing journey" | z, y | QWERTY |
| "größe spaß" | ö, ß | QWERTZ (German umlauts) |
| "jazz music" | z | Differentiates Y/Z position |

### Persistence & Settings

Once detected, automatically save to user profile:

```typescript
// In KeyboardLayoutProvider
useEffect(() => {
  if (isLocked && layout) {
    // Save to localStorage immediately
    localStorage.setItem('typingQuestLayout', layout);

    // If authenticated, also save to Convex
    if (userId) {
      saveLayoutToProfile({ userId, layout });
    }
  }
}, [isLocked, layout, userId]);
```

### Settings Page: Manual Override

```typescript
// In Settings page
function KeyboardSettings() {
  const { layout, setLayout, lockLayout } = useKeyboardLayout();

  return (
    <section className="settings-section">
      <h3>⌨️ Keyboard Layout</h3>

      <div className="current-layout">
        <span>Current: <strong>{layout}</strong></span>
      </div>

      <div className="layout-options">
        <h4>Change Layout:</h4>
        <div className="layout-grid">
          {['QWERTY-US', 'QWERTY-UK', 'QWERTZ-DE', 'AZERTY-FR'].map(l => (
            <button
              key={l}
              className={layout === l ? 'selected' : ''}
              onClick={() => lockLayout(l)}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <button className="redetect-btn" onClick={resetAndRedetect}>
        🔄 Re-detect my keyboard
      </button>
    </section>
  );
}
```

---

### Conflict 2B: Text Transformation in Lessons (Secondary)

**Note:** This conflict only applies AFTER the user starts a lesson. If detection happens on the landing page first (as intended), this is avoided.

**Scenario (If detection happens during lesson):**
1. User skipped landing page detection
2. Lesson 1 shows exercise: `"asdf jkl;"`
3. User on QWERTZ types 'ö' instead of ';'
4. App marks WRONG, then detects QWERTZ

**Solution:** Accept equivalent keys during detection grace period
```typescript
const equivalents = {
  ';': ['ö', 'm'],
  'y': ['z'],
  'z': ['y', 'w'],
};
```

---

### Conflict 3: Y and Z Are Late in Curriculum

**Scenario:**
- Y is introduced in Lesson 7
- Z is introduced in Lesson 11
- User completes Lessons 1-6 without definitive Y/Z detection

**Impact:** Medium - If user skips ';' detection, layout stays unknown through 6 lessons

**Solution:**
1. **Rely on ';' in Lesson 1** - This provides early detection opportunity
2. **Add Y/Z to detection prompt** - "Press Y and Z to confirm your layout"
3. **Use browser locale as initial hint** (but still require confirmation)

```typescript
// Browser locale hint (not definitive, just starting point)
function getLayoutHint(): KeyboardLayoutType {
  const lang = navigator.language.toLowerCase();
  if (lang.startsWith('de') || lang.startsWith('at') || lang.startsWith('ch')) {
    return 'QWERTZ-DE';  // German-speaking → likely QWERTZ
  }
  if (lang.startsWith('fr') || lang.startsWith('be')) {
    return 'AZERTY-FR';  // French-speaking → likely AZERTY
  }
  return 'QWERTY-US';  // Default
}
```

---

### Conflict 4: Compose Keys / Dead Keys

**Scenario:**
- User types 'ö' using compose sequence (e.g., `" + o` or `AltGr + o`)
- `e.code` might be 'KeyO' or 'Quote', not 'Semicolon'
- Detection based on physical key position fails

**Impact:** Medium - Affects users with non-standard input methods

**Solution:** Dual detection strategy
```typescript
function detectLayout(code: string, key: string) {
  // Strategy 1: Physical key position (primary)
  if (definitiveKeys[code]?.[key]) {
    return lockLayout(definitiveKeys[code][key]);
  }

  // Strategy 2: Character-only detection (fallback for compose keys)
  const charOnlyDefinitive: Record<string, KeyboardLayoutType> = {
    'ö': 'QWERTZ',
    'ä': 'QWERTZ',
    'ü': 'QWERTZ',
    'ß': 'QWERTZ',
    // These characters ONLY exist on QWERTZ, regardless of how typed
  };

  if (charOnlyDefinitive[key]) {
    return lockLayout(charOnlyDefinitive[key]);
  }
}
```

---

### Conflict 5: Fast Typer Visual Jarring

**Scenario:**
1. User types quickly: "asdf jkl"
2. Mid-word, 'ö' is typed (Semicolon key on QWERTZ)
3. Layout detected → Keyboard display immediately switches
4. User sees keyboard change mid-typing - visually jarring

**Impact:** Low - Cosmetic issue, one-time occurrence

**Solution:** Debounced visual update
```typescript
const [pendingLayout, setPendingLayout] = useState<KeyboardLayoutType | null>(null);

function onLayoutDetected(layout: KeyboardLayoutType) {
  setPendingLayout(layout);
}

// Only apply visual change on keyup (end of keystroke)
useEffect(() => {
  const handleKeyUp = () => {
    if (pendingLayout) {
      setDisplayedLayout(pendingLayout);
      setPendingLayout(null);
    }
  };
  window.addEventListener('keyup', handleKeyUp);
  return () => window.removeEventListener('keyup', handleKeyUp);
}, [pendingLayout]);
```

---

### Conflict 6: Mobile / Touch Keyboards

**Scenario:**
- User on mobile device
- Touch keyboard has no physical key codes
- `e.code` is often empty or 'Unidentified'

**Impact:** High for mobile users - Detection fails completely

**Solution:** Mobile-specific handling
```typescript
function isMobileDevice() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function detectLayout(code: string, key: string) {
  // On mobile, use character-only detection
  if (isMobileDevice() || code === 'Unidentified' || !code) {
    return detectFromCharacterOnly(key);
  }

  // On desktop, use physical key + character
  return detectFromPhysicalKey(code, key);
}

function detectFromCharacterOnly(key: string) {
  // German characters → QWERTZ
  if (['ö', 'ä', 'ü', 'ß'].includes(key)) {
    return 'QWERTZ';
  }
  // Mobile keyboards usually match system locale
  // Show manual selection for mobile users
  return null;
}
```

**Mobile UX Recommendation:**
```typescript
if (isMobileDevice()) {
  // Show simplified layout picker on mobile
  showMobileLayoutPicker(['QWERTY', 'QWERTZ', 'AZERTY']);
}
```

---

### Conflict 7: Browser Locale Mismatch

**Scenario:**
- User has German browser (locale: de-DE)
- User has US keyboard (physical QWERTY)
- If we use locale as initial guess, display shows QWERTZ incorrectly

**Impact:** Medium - Incorrect initial display

**Solution:** Locale is hint only, never definitive
```typescript
function initializeLayout() {
  const hint = getLayoutHint();  // From browser locale

  return {
    displayedLayout: hint,           // Show hint initially
    detectedLayout: null,            // Not yet detected
    detectionState: 'DETECTING',     // Still detecting
    isLocked: false,                 // Not locked until confirmed
  };
}

// Visual indicator shows uncertainty
<DetectionIndicator>
  LAYOUT: QWERTZ (detecting...)  // Shows hint but indicates uncertainty
</DetectionIndicator>
```

---

### Conflict 8: QWERTY vs QWERTZ Same-Output Keys

**Scenario:**
- Many keys produce same output on QWERTY and QWERTZ
- User might type 100+ characters without hitting Y, Z, or umlauts
- Detection never completes

**Impact:** Medium - Prolonged uncertainty state

**Solution:** Confidence threshold + eventual assumption
```typescript
const KEYSTROKES_BEFORE_ASSUMPTION = 50;  // After 50 keys without definitive detection
const confirmatoryThreshold = 3;

let keystrokeCount = 0;

function processKeystroke(code: string, key: string) {
  keystrokeCount++;

  // Check definitive keys first
  if (isDefinitiveKey(code, key)) {
    return lockLayout(getLayoutFromKey(code, key));
  }

  // Track confirmatory evidence
  if (isConfirmatoryKey(code, key)) {
    layoutConfidence[getLayoutFromKey(code, key)]++;
  }

  // After threshold, accept highest confidence
  if (keystrokeCount >= KEYSTROKES_BEFORE_ASSUMPTION) {
    const bestGuess = getHighestConfidenceLayout();
    if (layoutConfidence[bestGuess] >= confirmatoryThreshold) {
      return lockLayout(bestGuess);
    }
    // Still uncertain after 50 keys? Show manual picker
    showManualLayoutPicker();
  }
}
```

---

### Summary: Recommended Detection Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER OPENS APP                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  1. Check localStorage for saved layout                         │
│     - Found? → Use saved layout, LOCKED                         │
│     - Not found? → Continue to detection                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. Get browser locale hint                                     │
│     - de/at/ch → Display QWERTZ (uncertain)                    │
│     - fr/be → Display AZERTY (uncertain)                        │
│     - other → Display QWERTY (uncertain)                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. Show keyboard with "DETECTING..." status                    │
│     - User sees layout hint                                     │
│     - Status shows detection is active                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. User starts typing (lesson, anywhere)                       │
│                                                                 │
│  For each keystroke:                                            │
│  ├─ Definitive key? → LOCK immediately                         │
│  ├─ Confirmatory key? → Add confidence                          │
│  ├─ Neutral key? → Ignore                                       │
│  └─ Accept equivalent keys during detection (grace period)      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  5. Detection complete                                          │
│     - Status changes to "LOCKED: QWERTZ"                        │
│     - Save to localStorage + Convex                             │
│     - Transform lesson text for layout                          │
│     - Stop accepting equivalent keys                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  6. Fallback: 50 keystrokes without detection                   │
│     - If confidence threshold met → Lock best guess             │
│     - If still uncertain → Show manual picker                   │
└─────────────────────────────────────────────────────────────────┘
```

---

### Implementation Priority (Landing Page Focus)

| Conflict | Priority | Effort | Recommendation |
|----------|----------|--------|----------------|
| **#2 User doesn't type** | **HIGH** | Low | Add detection prompt on landing page |
| #6 Mobile Keyboards | High | Medium | Show manual picker on mobile |
| #8 Prolonged Uncertainty | Medium | Low | Add keystroke threshold + fallback |
| #4 Compose Keys | Medium | Low | Add character-only fallback |
| #7 Locale Mismatch | Low | Low | Locale is hint only |
| #5 Visual Jarring | Low | Low | Debounce display updates |
| #1 Neutral First Key | Low | None | Acceptable - prompt guides to Y/Z |
| #3 Y/Z Late in Curriculum | N/A | N/A | Not relevant - detection on landing page |
| #2B Text Transform Race | Secondary | Medium | Only if landing detection skipped |

### Landing Page "Try It Out" UX Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                     LANDING PAGE FLOW                           │
└─────────────────────────────────────────────────────────────────┘

1. User arrives → Sees "✨ Try It Out!" section with keyboard
2. Fun prompt: "Type 'crazy pizza' and watch your fingers!"
3. User types for FUN → Keyboard lights up, fingers animate
4. Detection happens INVISIBLY in background
5. Subtle success: "🎉 Perfect! Your keyboard is all set up."
6. Layout saved to profile → Ready for lessons

         ┌────────────────────────────────────────────────┐
         │  PRIMARY: Fun, engaging typing experience      │
         │  SECONDARY: Detection happens automatically    │
         │  ALWAYS: User can change in Settings later    │
         └────────────────────────────────────────────────┘
```

### Complete User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│  FIRST VISIT                                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Landing Page                                                │
│     ├── Hero: "Learn to type with all 10 fingers"              │
│     ├── ✨ TRY IT OUT section                                  │
│     │   ├── Input: "Type 'crazy pizza'..."                     │
│     │   ├── Keyboard: Fingers light up as you type             │
│     │   └── (Detection runs silently)                          │
│     │                                                          │
│     └── On detection:                                          │
│         ├── 🎉 Toast: "Perfect! All set up"                    │
│         ├── Save to localStorage                               │
│         └── Save to Convex (if logged in)                      │
│                                                                 │
│  2. Start Lesson → Correct layout already applied              │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  RETURNING VISIT                                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Load saved layout from localStorage/Convex                  │
│  2. No detection needed → Jump straight to lessons              │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  CHANGE LAYOUT                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Settings → Keyboard Layout                                     │
│  ├── Current: QWERTZ-DE ✓                                      │
│  ├── Options: [QWERTY-US] [QWERTY-UK] [QWERTZ-DE] [AZERTY-FR]  │
│  └── [🔄 Re-detect my keyboard]                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Key Principles

1. **Fun First** - Users type because it's fun, not for configuration
2. **Invisible Detection** - Technical stuff happens in background
3. **Celebrate Success** - "🎉 Perfect!" not "Layout: QWERTZ detected"
4. **Always Changeable** - Settings provides manual override
5. **Persistent** - Saved to profile, synced across devices
