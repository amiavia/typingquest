# PRP-038: Initial Speed Test & First Experience Enhancement

## Summary
Replace the current keyboard detection flow with a unified **Speed Test** that serves dual purpose:
1. **Detects keyboard layout** through typing (replaces current "press Z/Y" detection)
2. **Measures baseline WPM** for progress tracking

Users who already have a keyboard layout saved see a **collapsed view** with immediate access to lessons.

## Problem Statement
Currently, we have two separate experiences:
1. Keyboard detection ("type some words" / "press Z or Y")
2. No speed baseline captured

This misses an opportunity to combine these into a single, engaging experience that both detects the keyboard AND establishes a typing baseline.

## Goals
1. **Single Speed Test** for all users without keyboard set (guest or authenticated)
2. Speed test **detects keyboard layout** from typing patterns
3. Speed test **captures WPM baseline** with timestamp
4. **Collapsed view** for returning users with keyboard already set
5. Store results for future statistics and progress tracking

## Non-Goals
- Advanced typing analytics (accuracy breakdown by finger, etc.)
- Comparative statistics with other users
- Multiple speed test difficulty levels

## Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Detection accuracy | >95% users confirm detected layout | `layout_confirmed` analytics |
| Completion rate | >80% complete test (don't skip) | `speed_test_completed` / `speed_test_started` |
| Time to detect | <15 seconds for family detection | `avg_detection_time` metric |
| User satisfaction | <5% retake immediately | `retake_rate` within 1 minute |
| Onboarding improvement | Faster time-to-first-lesson | Compare with current flow |

## Open Questions

1. **Test duration**: 30 seconds feels right, but should we test 20s or 45s?
2. **Skip penalty**: Should skipping disable some features until test taken?
3. **Retake cooldown**: Can users spam retakes? Should there be a limit?
4. **Baseline visibility**: Should baseline WPM be shown on profile/stats page?
5. **Progress notifications**: "You've improved 15% since your first test!" - when to show?

## User Flow Matrix

| User State | Keyboard Set? | Experience |
|------------|---------------|------------|
| Guest (new) | No | Speed Test (detects keyboard + measures WPM) |
| Guest (returning) | Yes (local) | Collapsed View |
| Authenticated (new) | No | Speed Test (detects keyboard + measures WPM) |
| Authenticated (returning) | Yes | Collapsed View |

## Technical Approach

### 1. Speed Test with Keyboard Detection

The speed test will include words that reveal keyboard layout:
- Words containing "z" and "y" (QWERTY vs QWERTZ detection)
- Common letter patterns for layout confirmation

```typescript
// src/components/SpeedTest.tsx

interface SpeedTestProps {
  onComplete: (results: {
    wpm: number;
    accuracy: number;
    detectedLayout: string;
  }) => void;
  onSkip?: () => void;
}

export function SpeedTest({ onComplete, onSkip }: SpeedTestProps) {
  // Phases: 'intro' | 'countdown' | 'testing' | 'results'
  //
  // During 'testing':
  //   - Track keystrokes to detect layout (z/y position)
  //   - Calculate WPM and accuracy
  //   - Show real-time stats
  //
  // On complete:
  //   - Determine layout from keystroke analysis
  //   - Save WPM baseline
  //   - Transition to results screen
}
```

### 2. Database Schema

```typescript
// convex/schema.ts - users table additions
initialSpeedTest: v.optional(v.object({
  wpm: v.number(),
  accuracy: v.number(),
  timestamp: v.number(),
  keyboardLayout: v.string(),
})),
speedTests: v.optional(v.array(v.object({
  wpm: v.number(),
  accuracy: v.number(),
  timestamp: v.number(),
  keyboardLayout: v.string(),
  testType: v.string(), // 'initial' | 'practice' | 'challenge'
}))),
```

### 3. App.tsx Flow

```typescript
// Simplified conditional rendering

const hasKeyboardLayout = keyboardLocked; // From KeyboardLayoutProvider

{!hasKeyboardLayout ? (
  // Speed Test: detects keyboard + measures baseline
  <SpeedTest
    onComplete={({ wpm, accuracy, detectedLayout }) => {
      // 1. Lock keyboard layout
      lockKeyboard(detectedLayout);
      // 2. Save speed test results (if authenticated)
      saveInitialSpeedTest({ wpm, accuracy, keyboardLayout: detectedLayout });
    }}
  />
) : (
  // Collapsed view: keyboard already set
  <>
    <CollapsedHero
      layout={detectedLayout}
      onChangeLayout={() => unlockKeyboard()}
    />
    <LessonsGrid />
  </>
)}
```

### 4. Collapsed Hero Component

```typescript
// src/components/CollapsedHero.tsx

export function CollapsedHero({ layout, onChangeLayout, initialWpm }) {
  return (
    <div className="collapsed-hero">
      <div className="keyboard-info">
        <span className="keyboard-icon">⌨️</span>
        <span className="layout-name">{layout}</span>
        <button onClick={onChangeLayout}>Change</button>
      </div>
      {initialWpm && (
        <div className="baseline-info">
          Starting speed: {initialWpm} WPM
        </div>
      )}
      <button className="continue-btn">START PRACTICING</button>
    </div>
  );
}
```

## Speed Test Design

### Content
- **Duration**: 30 seconds
- **Words**: Carefully crafted sentences that include:
  1. **Layout family detection** (QWERTY vs QWERTZ vs AZERTY)
  2. **Variant detection** within each family (DE vs CH vs AT)
  3. **Special character detection** for precise identification

### Detection Characters

| Detection Goal | Characters Used | Example Words |
|----------------|-----------------|---------------|
| QWERTY vs QWERTZ | y, z | "lazy", "yellow", "zone", "fuzzy" |
| QWERTY vs AZERTY | a, q, w, z | "quick", "away", "wizard" |
| QWERTZ-DE vs QWERTZ-CH | ß, ü, ö, ä | "größe", "süß", "über", "größer" |
| Variant confirmation | Special punctuation | brackets, semicolons, quotes |

### Test Sentence Examples

**Phase 1: Layout family detection (first ~15 seconds)**
```
"the lazy yellow fox jumps quickly over frozen zones"
```
- All users type the same English text
- Detects QWERTY vs QWERTZ vs AZERTY from physical key positions
- No special characters - works for everyone

**Phase 2: Variant detection (remaining time) - ADAPTIVE**

Only triggered AFTER detecting QWERTZ:
```
"größe und maße über die straße"  // Tests for ß → German
"grösse und masse über die strasse"  // No ß available → Swiss
```

For QWERTY/AZERTY users:
```
Continue with English text - no special characters needed
```

### Detection Logic
```typescript
interface KeystrokeEvent {
  expectedChar: string;
  actualKeyCode: string;
  physicalKey: string;  // e.g., "KeyY", "KeyZ"
  timestamp: number;
}

function detectLayout(keystrokes: KeystrokeEvent[]): KeyboardLayout {
  // Step 1: Detect family (QWERTY/QWERTZ/AZERTY)
  const family = detectLayoutFamily(keystrokes);

  // Step 2: Detect variant within family
  const variant = detectVariant(keystrokes, family);

  return { family, variant };  // e.g., { family: "QWERTZ", variant: "CH" }
}

function detectLayoutFamily(keystrokes: KeystrokeEvent[]): string {
  // Count physical key positions when typing y/z
  const yTyped = keystrokes.filter(k => k.expectedChar === 'y');
  const zTyped = keystrokes.filter(k => k.expectedChar === 'z');

  // If 'y' triggers KeyZ physical key → QWERTZ
  // If 'y' triggers KeyY physical key → QWERTY
  // If 'a' triggers KeyQ physical key → AZERTY
}

function detectVariant(keystrokes: KeystrokeEvent[], family: string): string {
  if (family === 'QWERTZ') {
    // Check for ß character usage
    const usesEszett = keystrokes.some(k => k.expectedChar === 'ß');
    const usesSS = !usesEszett; // Swiss German uses 'ss' instead

    // German uses ß, Swiss uses ss
    if (usesEszett) return 'DE';
    if (usesSS) return 'CH';
  }
  return 'default';
}
```

### Adaptive Test Flow
1. **All users**: Start with English text containing y/z (detect family)
2. **Mid-test**: Once family detected (~10-15 seconds in):
   - QWERTZ detected → Switch to German text with öäüß
   - QWERTY detected → Continue with English text
   - AZERTY detected → Continue with English/French text
3. **QWERTZ only**: Detect DE vs CH based on ß availability
4. No confusing special characters for QWERTY users

### UI Elements
1. **Intro screen**: "LET'S SEE HOW FAST YOU TYPE!"
2. **Countdown**: 3... 2... 1... GO!
3. **Test screen**: Typing area + real-time WPM + progress bar + "Detecting layout..." indicator
4. **Results**: WPM score + detected keyboard (with variant) + "Let's improve!" CTA

## Implementation Phases

### Phase 1: Core Speed Test
- [ ] Create SpeedTest component with keyboard detection
- [ ] Replace current onboarding flow in App.tsx
- [ ] Save results to profile (authenticated users)
- [ ] Save results to localStorage (guests)

### Phase 2: Collapsed View
- [ ] Create CollapsedHero component
- [ ] Show baseline WPM if available
- [ ] "Change keyboard" functionality (re-run speed test)

### Phase 3: Data Foundation
- [ ] Query for speed test history
- [ ] Display progress over time (future PRP)

## Benefits

1. **Simpler UX**: One test instead of separate keyboard detection
2. **More engaging**: Speed test is gamified and fun
3. **Valuable data**: Baseline for progress tracking
4. **Unified flow**: Same experience for guests and authenticated users

## Edge Cases & Error Handling

### Skip Flow
- If user clicks "Skip", we still need a keyboard layout
- Show manual keyboard selector as fallback
- Mark `initialSpeedTest` as `null` but still save keyboard choice
- Prompt to take test later (optional banner)

### Inconclusive Detection
- Minimum threshold: At least 3 y/z characters typed for reliable detection
- If insufficient data: Show confirmation dialog with best guess
- "We detected QWERTZ - is this correct?" with options to confirm or change

### Existing Users (Migration)
- Users with keyboard set but no speed test: Show optional "Take speed test" banner
- Don't force them - it's a nice-to-have for returning users
- Can access via settings or collapsed hero "Retake test" link

### Suspiciously Low WPM
- If WPM < 10: Likely AFK or connection issues
- Show "Something went wrong - try again?" prompt
- Don't save as baseline if clearly invalid

### Detection Conflicts
- If user manually selected layout differs from detected: Trust user's choice
- Show "We detected X but you selected Y - keep Y?" confirmation
- Store both for analytics (detected vs selected)

### Mobile/Touch Users
- Speed test requires physical keyboard
- If touch input detected: Skip to manual keyboard selection
- Show message: "For the best experience, use a physical keyboard"

## Confirmation Flow

After speed test completes:
1. Show results: WPM, accuracy, detected layout
2. Layout confirmation: "We detected **QWERTZ Swiss** - is this correct?"
3. Options: ✓ Confirm | ↻ Retake | ✎ Choose Manually
4. Only save after user confirms

```typescript
// Results screen state
interface SpeedTestResults {
  wpm: number;
  accuracy: number;
  detectedLayout: string;
  confirmed: boolean;  // User confirmed the detection
  manualOverride?: string;  // If user chose different layout
}
```

## Localization

### Language-Specific Test Sentences

| Layout Family | Phase 1 (Detection) | Phase 2 (Variant) |
|---------------|---------------------|-------------------|
| QWERTY | English with y/z | Continue English |
| QWERTZ | English with y/z | German with öäüß |
| AZERTY | English with a/q/w | French text (optional) |

### Future: Multi-language Support
- Store user's preferred test language
- Offer English/German/French options
- Detection still works regardless of language (based on physical keys)

## Analytics & Monitoring

Track these metrics to validate detection accuracy:
- `detection_success_rate`: % of users who confirm detected layout
- `manual_override_rate`: % who choose different layout
- `skip_rate`: % who skip the test entirely
- `retake_rate`: % who retake the test
- `avg_detection_time`: How quickly we can reliably detect (seconds)

```typescript
// Analytics events
trackEvent('speed_test_started', { source: 'onboarding' | 'settings' });
trackEvent('speed_test_completed', { wpm, accuracy, detected_layout });
trackEvent('layout_confirmed', { detected, confirmed, match: boolean });
trackEvent('layout_overridden', { detected, selected });
trackEvent('speed_test_skipped', { reason: 'user' | 'mobile' | 'timeout' });
```

## Dependencies & Refactoring

### Current Code to Replace
- `src/components/KeyboardDetection.tsx` - Replace with SpeedTest
- `src/providers/KeyboardLayoutProvider.tsx` - Extend to handle speed test results
- Current "type some words" onboarding flow in `App.tsx`

### Integration Points
- `KeyboardLayoutProvider`: Add `initialSpeedTest` to context
- `useKeyboardLayout` hook: Expose baseline WPM
- Convex `users` table: Add speed test fields

### Backwards Compatibility
- Existing users with keyboard set: Continue working, no speed test required
- New `initialSpeedTest` field is optional in schema
- Graceful degradation if speed test fails

## Accessibility

- **Screen readers**: Announce WPM updates at intervals (not every keystroke)
- **Motor impairments**: No minimum WPM required, just completion
- **Visual**: High contrast mode support, large text option
- **Keyboard navigation**: Full keyboard control, no mouse required

## Testing Considerations

### Unit Tests
- Detection algorithm with mock keystrokes
- Various keyboard layouts (QWERTY-US, QWERTY-UK, QWERTZ-DE, QWERTZ-CH, AZERTY-FR)
- Edge cases: Few keystrokes, mixed signals, special characters

### Integration Tests
- Full flow: Intro → Test → Results → Confirm → Save
- Skip flow with manual selection
- Retake flow from collapsed hero
- Guest → Sign up data migration

### E2E Tests
- Test with actual keyboard input
- Verify correct layout saved to database
- Check collapsed view renders correctly

### Manual QA
- Test on different OS (Windows, Mac, Linux)
- Test with different browser keyboard APIs
- Verify special character input (ß, ö, ä, ü)
