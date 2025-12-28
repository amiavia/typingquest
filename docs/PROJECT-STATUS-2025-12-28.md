# Typebit8 Project Status

**Date:** 2025-12-28
**Branch:** main
**Latest Commit:** e2026d2 - fix: Allow dropdown menu to overflow header on desktop

---

## Recent Work Completed

### PRP-038: Speed Test Implementation
- **Status:** Implemented
- Unified speed test that serves dual purpose:
  1. Detects keyboard layout through typing (replaces "press Z/Y" detection)
  2. Measures baseline WPM for progress tracking
- Test duration: 30 seconds (`TEST_DURATION_MS = 30000`)
- Phase 1: English text with y/z for family detection (QWERTY vs QWERTZ vs AZERTY)
- Phase 2 (QWERTZ only): German text with special characters for variant detection
- Detection threshold: 12 seconds (`DETECTION_THRESHOLD_MS = 12000`)
- Files: `src/components/SpeedTest.tsx`

### PRP-039: Speed Test Detection Isolation Fix
- **Status:** Implemented
- Fixed premature test interruption when keyboard layout was detected
- Added pause/resume mechanism to `KeyboardLayoutProvider`
- SpeedTest now uses its own detection during test, only calling `lockLayout()` on user confirmation
- Ensures full 30-second test completes and WPM baseline is captured
- Files: `src/providers/KeyboardLayoutProvider.tsx`, `src/components/SpeedTest.tsx`

### QWERTZ Variant Detection (DE vs CH)
- Implemented based on special character handling
- German keyboards have ß (eszett) key
- Swiss keyboards use "ss" instead of ß
- Phase 2 German text tests for ß availability to differentiate

### Guest Level Restrictions
- Guest users (unauthenticated) can only access levels 1-2
- Constant: `GUEST_LEVEL_LIMIT = 2` (in `/src/App.tsx`)
- Premium content starts at level: `PREMIUM_LEVEL_START = 10` (implied from context)
- After completing level 2, guests see sign-up encouragement modal

### Leaderboard Privacy Fix (PRP-029)
- **Status:** Implemented
- Leaderboards NEVER show real names, only nicknames
- Priority order: `user.nickname || user.autoNickname || "Anonymous"`
- NEVER falls back to `username` (which may contain real name from OAuth)
- Files: `convex/leaderboard.ts`

### PRP-040: Mobile Landing Page
- **Status:** Implemented
- Mobile device detection with external keyboard verification
- Desktop handoff flow for mobile users
- Files: `src/components/MobileLanding.tsx`, `src/hooks/useDeviceDetection.ts`

### PRP-041: Themed Levels and Premium Grouping
- **Status:** Implemented
- Collapsed view for levels 31-50 (themed/premium levels)
- Expandable sections with `expandPremiumLevels` and `expandThemedLevels` state
- Files: `src/App.tsx`, `src/components/LevelGroupCollapsed.tsx`

---

## Current Issue Being Debugged

### Guest Onboarding Screen Not Showing After SpeedTest Completion

**Problem:**
- After a guest completes the SpeedTest, the onboarding/sign-up screen should appear
- Instead, users were being shown the main lesson grid immediately

**Root Cause:**
- Race condition between state updates
- `lockLayout()` triggers a context update which causes re-renders
- `showGuestOnboarding` was being set AFTER `lockLayout()`, getting lost in re-render

**Latest Fix (commit e114c28):**
Controlled state update order in `handleSpeedTestComplete` callback in `App.tsx`:

```typescript
// IMPORTANT: Order matters here to prevent race conditions with re-renders
// 1. For guests, set up the onboarding screen FIRST (before lockLayout triggers re-render)
if (!userId) {
  setShowGuestOnboarding(true);
}

// 2. Exit retake mode
setShowSpeedTest(false);

// 3. NOW lock the layout (this triggers context update and re-renders)
lockLayout(results.detectedLayout as Parameters<typeof lockLayout>[0]);
```

**State Update Order (Critical):**
1. `setShowGuestOnboarding(true)` - FIRST, before lockLayout
2. `setShowSpeedTest(false)` - Exit retake mode
3. `lockLayout()` - LAST, this triggers re-render

**Status:** Just pushed (e114c28), needs testing

**Additional fixes applied:**
- Removed `lockLayout` call from within SpeedTest component (was in PRP-039)
- All layout locking now happens in App.tsx callback

---

## Stripe Webhook Issue

**Problem:**
- Screenshot shows 100% error rate on webhook endpoint
- Endpoint: `https://careful-jaguar-818.convex.cloud/stripe-webhook`

**Needs Investigation:**
- Check Convex logs for error details
- Verify webhook secret is correctly configured
- Check if endpoint handler exists in `convex/http.ts`
- Verify Stripe webhook is sending to correct endpoint

**Relevant Files:**
- `convex/http.ts` - HTTP route handlers

---

## Key Files Modified Recently

| File | Purpose |
|------|---------|
| `src/components/SpeedTest.tsx` | Speed test with keyboard detection |
| `src/App.tsx` | Main app flow, guest onboarding state |
| `src/components/LessonCard.tsx` | Level cards with guest/premium lock states |
| `convex/leaderboard.ts` | Leaderboard privacy (nickname only) |
| `convex/streaks.ts` | Streak system |
| `src/providers/KeyboardLayoutProvider.tsx` | Keyboard detection pause/resume |

---

## Key Technical Details

### Constants (in `src/App.tsx`)

```typescript
const LOADING_DURATION = 600;  // Loading screen duration in ms
const GUEST_LEVEL_LIMIT = 2;   // Guest users can only access levels 1-2
```

### State Variables for Guest Flow

```typescript
const [showSpeedTest, setShowSpeedTest] = useState(false);     // For retaking speed test
const [showSignUpModal, setShowSignUpModal] = useState(false); // For post-level-2 encouragement
const [showGuestOnboarding, setShowGuestOnboarding] = useState(false); // For post-SpeedTest sign-up prompt
```

### SpeedTest Configuration (in `src/components/SpeedTest.tsx`)

```typescript
const TEST_DURATION_MS = 30000;        // 30 seconds
const DETECTION_THRESHOLD_MS = 12000;  // Start checking for Phase 2 after 12s
```

### Keyboard Layout Provider Context

```typescript
interface KeyboardLayoutContext {
  layout: KeyboardLayoutType;
  isLocked: boolean;
  lockLayout: (layout: KeyboardLayoutType) => void;
  pauseDetection: () => void;
  resumeDetection: () => void;
  isDetectionPaused: boolean;
}
```

---

## Git History (Recent Commits)

```
e2026d2 fix: Allow dropdown menu to overflow header on desktop
b4cffd0 fix: Remove unused isUnlocked prop from LevelGroupCollapsed
b1b13a6 docs: Mark PRP-040 as Implemented
770a6f9 docs: Mark PRP-041 as Implemented
7b3653a fix: Add expanded view for themed levels (31-50)
703e726 feat: Implement PRP-041 themed levels and premium grouping
a117f23 feat: Implement PRP-041 Phase 1 - Level Grouping UI
c2931fc fix: Mobile header responsiveness for external keyboard users
0a513bf fix: TypeScript build errors blocking deployment
33d3316 fix: Improve iOS Safari detection for mobile landing
8f6e64a fix: Mobile detection and responsive header (PRP-040)
0070fed feat: Mobile landing page with desktop handoff (PRP-040)
e114c28 fix: Control state update order to prevent race condition
e00c883 fix: Add dedicated guest onboarding screen after SpeedTest
059a13d fix: Move sign-up encouragement to separate section after SpeedTest
```

---

## Open Items / Next Steps

### High Priority
1. **Test guest onboarding flow** - Verify the race condition fix works
2. **Investigate Stripe webhook errors** - Check Convex logs, verify configuration

### Medium Priority
3. Review keyboard detection accuracy across different browsers/OS
4. Consider adding analytics for speed test completion/skip rates

### Future Work (from PRPs)
- PRP-007: Typing Tests (practice mode with different text sources)
- PRP-019: Statistics Dashboard
- PRP-020: Weekly Reports

---

## Environment

- **Platform:** macOS (Darwin 25.1.0)
- **Frontend:** React + Vite + TypeScript
- **Backend:** Convex
- **Auth:** Clerk
- **Payments:** Stripe (via Clerk Billing)
- **Repository:** Main branch is `main`

---

## Useful Commands

```bash
# Start development
npm run dev

# Check TypeScript
npm run typecheck

# View Convex logs
npx convex logs

# Deploy Convex
npx convex deploy
```

---

## Contact Points

This document was generated to enable continuity of work on the typebit8 typing tutor project.
