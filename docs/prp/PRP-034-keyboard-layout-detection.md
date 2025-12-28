# PRP-034: Intelligent Keyboard Layout Detection

## Problem Statement

The current keyboard layout detection system changes the displayed layout on every keystroke that matches a detection rule. This causes incorrect behavior when pressing keys that are **shared** between layouts (e.g., 'a' exists in the same position on QWERTY, QWERTZ, and AZERTY), causing the layout to incorrectly revert.

### Example of Current Bug
1. User has QWERTZ keyboard
2. User presses 'ö' → Correctly detects QWERTZ, switches display
3. User presses 'a' → Incorrectly reverts to QWERTY (because 'a' on KeyA matches QWERTY rule)

## Layout Comparison

### Key Differences Between Layouts

| Physical Key | QWERTY | QWERTZ | AZERTY |
|--------------|--------|--------|--------|
| KeyY | y | **z** | y |
| KeyZ | z | **y** | **w** |
| KeyQ | q | q | **a** |
| KeyA | a | a | **q** |
| KeyW | w | w | **z** |
| KeyM | m | m | **,** |
| Semicolon | ; | **ö** | **m** |
| Quote | ' | **ä** | - |
| BracketLeft | [ | **ü** | - |
| Minus | - | **ß** | - |

### Shared Keys (Should NOT Trigger Detection)
Most alphabetic keys (a-x except y/z) produce the same character across QWERTY and QWERTZ. These should never change a detected layout.

### Differentiating Keys (CAN Trigger Detection)

**QWERTY vs QWERTZ:**
- KeyY: 'y' = QWERTY, 'z' = QWERTZ
- KeyZ: 'z' = QWERTY, 'y' = QWERTZ
- Semicolon: ';' = QWERTY, 'ö' = QWERTZ
- Quote: '\'' = QWERTY, 'ä' = QWERTZ
- German-only chars: 'ü', 'ß' = definitively QWERTZ

**QWERTY/QWERTZ vs AZERTY:**
- KeyQ: 'q' = QWERTY/QWERTZ, 'a' = AZERTY
- KeyA: 'a' = QWERTY/QWERTZ, 'q' = AZERTY
- KeyW: 'w' = QWERTY/QWERTZ, 'z' = AZERTY
- KeyZ: 'z' = QWERTY, 'y' = QWERTZ, 'w' = AZERTY
- KeyM: 'm' = QWERTY/QWERTZ, ',' = AZERTY

## Proposed Solution

### Approach: Confidence-Based Sticky Detection

Instead of switching layouts on every matching keystroke, implement a smarter detection system:

#### 1. Detection Categories

**Definitive Keys** (100% confidence, immediate switch):
- German umlauts: ö, ä, ü → QWERTZ
- Eszett: ß → QWERTZ
- KeyY producing 'z' → QWERTZ
- KeyZ producing 'y' → QWERTZ
- KeyQ producing 'a' → AZERTY
- KeyA producing 'q' → AZERTY

**Confirmatory Keys** (Add confidence, don't switch alone):
- KeyY producing 'y' → +1 vote for QWERTY
- KeyZ producing 'z' → +1 vote for QWERTY
- Semicolon producing ';' → +1 vote for QWERTY

**Neutral Keys** (No detection impact):
- All keys that produce the same output across the layouts being compared
- Example: 'a' on KeyA (same for QWERTY and QWERTZ)

#### 2. Layout Lock Mechanism

Once a layout is detected via a **definitive key**:
1. Lock the detected layout
2. Ignore confirmatory keys for other layouts
3. Only unlock if:
   - A contradicting definitive key is pressed
   - User manually changes layout in settings
   - Session ends/resets

#### 3. Visual Feedback States

```
DETECTING...     → No layout detected yet, watching keystrokes
DETECTED: QWERTZ → Layout locked, confident
DETECTED: QWERTY (uncertain) → Detected via confirmatory keys only
```

#### 4. Confidence Scoring Algorithm

```javascript
const layoutConfidence = {
  'QWERTY': 0,
  'QWERTZ': 0,
  'AZERTY': 0
};

let lockedLayout = null;

function processKeystroke(code, key) {
  // If layout is locked, only process contradicting definitive keys
  if (lockedLayout) {
    if (isContradictingDefinitiveKey(code, key, lockedLayout)) {
      // User switched keyboards - unlock and re-detect
      lockedLayout = null;
      resetConfidence();
    } else {
      return lockedLayout; // Keep current layout
    }
  }

  // Check for definitive keys
  const definitiveLayout = getDefinitiveLayout(code, key);
  if (definitiveLayout) {
    lockedLayout = definitiveLayout;
    return definitiveLayout;
  }

  // Check for confirmatory keys (only if not locked)
  const confirmatoryVote = getConfirmatoryVote(code, key);
  if (confirmatoryVote) {
    layoutConfidence[confirmatoryVote.layout] += confirmatoryVote.weight;
  }

  // Return highest confidence layout (or default)
  return getHighestConfidenceLayout();
}
```

### Implementation Details

#### Definitive Key Map
```javascript
const definitiveKeys = {
  // German characters - definitively QWERTZ
  'ö': 'QWERTZ',
  'ä': 'QWERTZ',
  'ü': 'QWERTZ',
  'ß': 'QWERTZ',

  // Physical key + character combinations
  'KeyY+z': 'QWERTZ',
  'KeyZ+y': 'QWERTZ',
  'KeyY+y': 'QWERTY',  // Only definitive if coming FROM QWERTZ
  'KeyZ+z': 'QWERTY',  // Only definitive if coming FROM QWERTZ

  // AZERTY detection
  'KeyQ+a': 'AZERTY',
  'KeyA+q': 'AZERTY',
  'KeyW+z': 'AZERTY',
  'KeyZ+w': 'AZERTY',
  'KeyM+,': 'AZERTY',
};
```

#### Neutral Keys (Ignored for QWERTY vs QWERTZ)
```javascript
const neutralKeysQwertyQwertz = [
  'KeyA', 'KeyB', 'KeyC', 'KeyD', 'KeyE', 'KeyF', 'KeyG', 'KeyH',
  'KeyI', 'KeyJ', 'KeyK', 'KeyL', 'KeyM', 'KeyN', 'KeyO', 'KeyP',
  'KeyQ', 'KeyR', 'KeyS', 'KeyT', 'KeyU', 'KeyV', 'KeyW', 'KeyX'
];
// Note: KeyY and KeyZ are NOT neutral - they differentiate layouts
```

## User Experience Flow

### First-Time User
1. User starts typing practice
2. Display shows "Press any key to detect layout..."
3. User types normally
4. On first definitive key (e.g., 'ö' or 'y'/'z'):
   - Layout locks
   - Display updates
   - Toast: "Keyboard detected: QWERTZ"
5. Layout remains stable for rest of session

### User With Saved Preference
1. Load layout from user profile
2. Skip detection, use saved layout
3. Allow manual override in settings

### User Switches Physical Keyboard
1. User was using QWERTZ, switches to QWERTY keyboard
2. Presses 'y' on KeyY (QWERTZ would produce 'z')
3. System detects contradiction
4. Unlocks and switches to QWERTY
5. Toast: "Keyboard changed: QWERTY"

## Settings Integration

### Manual Layout Selection
```
Keyboard Layout
○ Auto-detect (recommended)
● QWERTY (US/UK)
○ QWERTZ (German)
○ AZERTY (French)
○ Other (basic mode)
```

### Detection Sensitivity
```
Layout Detection
● Smart (only switch on definitive keys)
○ Aggressive (switch on any matching key)
○ Disabled (use manual selection only)
```

## Edge Cases

### 1. Dual-Language Users
Some users switch between layouts frequently. Solution:
- Detect layout switches via contradicting definitive keys
- Provide keyboard shortcut to manually cycle layouts

### 2. Non-Standard Layouts
Dvorak, Colemak, etc. Solution:
- Offer manual selection for non-standard layouts
- Don't auto-detect, as patterns differ significantly

### 3. Virtual/On-Screen Keyboards
May not follow physical key codes. Solution:
- Fall back to character-only detection
- Reduce confidence requirements

## Success Metrics

1. **Detection Accuracy**: >99% correct layout detection within 10 keystrokes
2. **False Positive Rate**: <1% incorrect layout switches after lock
3. **User Override Rate**: <5% of users need manual correction
4. **Time to Detection**: <5 keystrokes for definitive detection

## Implementation Plan

### Phase 1: Fix Current Bug
- Remove shared keys from detection map
- Only detect on truly differentiating keys
- Implement basic layout locking

### Phase 2: Confidence System
- Add confidence scoring
- Implement definitive vs confirmatory key distinction
- Add visual feedback for detection state

### Phase 3: Persistence
- Save detected layout to user profile
- Load on session start
- Sync across devices

### Phase 4: Settings
- Add manual layout selection
- Add detection sensitivity options
- Add layout switch notifications

## Files to Modify

1. `mockups/keyboard-finger-proposals.html` - Prototype implementation
2. `src/utils/keyboardLayout.ts` - New utility for layout detection (to be created)
3. `src/providers/KeyboardLayoutProvider.tsx` - New context provider (to be created)
4. `src/components/KeyboardDisplay.tsx` - Update to use detected layout
5. `convex/schema.ts` - Add keyboard layout to user preferences
6. `convex/users.ts` - Add mutation to save layout preference

## Conclusion

The key insight is that **not all keystrokes are equal** for layout detection. By categorizing keys into definitive, confirmatory, and neutral, and implementing a locking mechanism, we can provide stable, accurate layout detection that doesn't flip-flop on every keystroke.

The recommended immediate fix is to simply remove entries from `layoutDetection` that map shared keys (like 'a' on KeyA) to specific layouts, keeping only truly differentiating keys.
