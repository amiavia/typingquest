# PRP-039: Speed Test Detection Isolation Fix

## Status: Implemented

## Problem Statement

The Speed Test (PRP-038) was being interrupted prematurely when the keyboard layout was detected. Instead of running the full 30-second test and completing Phase 2 for QWERTZ variant detection (DE-DE vs DE-CH), the test would:

1. Detect QWERTZ family after ~12 seconds
2. The global `KeyboardLayoutProvider` would immediately lock the layout
3. `keyboardLocked` becoming true caused the SpeedTest component to unmount
4. User was shown the CollapsedHero instead of completing the test
5. No WPM baseline was captured
6. No Phase 2 German text detection occurred for DE/CH differentiation

## Root Cause Analysis

Two competing detection systems were running simultaneously:

1. **KeyboardLayoutProvider** - Global detection that locks layout immediately when definitive keys (y/z position) are detected
2. **SpeedTest** - Should run its own staged detection over 30 seconds with Phase 2 for QWERTZ variants

The SpeedTest was calling `processKeystroke()` from the provider, and the provider's global keyboard listener was also processing keystrokes from the input field, both triggering the instant lock mechanism.

## Solution

### 1. Add Detection Pause Mechanism to KeyboardLayoutProvider

Added new functions to pause/resume global detection:

```typescript
// New state
const [isDetectionPaused, setIsDetectionPaused] = useState(false);

// New context values
pauseDetection: () => void;
resumeDetection: () => void;
isDetectionPaused: boolean;

// processKeystroke now checks pause state
const processKeystroke = useCallback((code: string, key: string) => {
  if (isDetectionPaused) return; // Skip if SpeedTest is running
  // ... rest of detection logic
}, [isDetectionPaused, ...]);
```

### 2. SpeedTest Uses Own Detection During Test

- Removed `processKeystroke` call from SpeedTest's input handler
- SpeedTest uses its own `analyzeKeystrokes()` function for detection
- Calls `pauseDetection()` when entering countdown/testing phase
- Calls `resumeDetection()` when test completes or component unmounts

### 3. Layout Only Locked on User Confirmation

The layout is only locked via `lockLayout()` when the user clicks "CONFIRM" on the results screen, ensuring:
- Full 30-second test completes
- WPM baseline is captured
- Phase 2 German detection runs for QWERTZ users
- User has chance to verify/change detected layout

## Files Modified

- `src/providers/KeyboardLayoutProvider.tsx` - Added pause/resume mechanism
- `src/components/SpeedTest.tsx` - Integrated pause/resume, removed premature processKeystroke calls

## Test Flow After Fix

1. User clicks "START TEST"
2. 3-second countdown begins, detection paused
3. 30-second test runs with English text (Phase 1)
4. At 12 seconds, if QWERTZ detected, switches to German text (Phase 2)
5. Test completes, results shown with detected layout
6. User confirms layout choice
7. `lockLayout()` is called, detection resumes
8. User proceeds to main app

## Implementation Date

2025-12-27
