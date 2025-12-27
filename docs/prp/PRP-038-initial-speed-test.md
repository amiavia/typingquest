# PRP-038: Initial Speed Test & First Experience Enhancement

## Summary
Enhance the first-time user experience by requiring a speed test when no keyboard layout is stored in the user's profile. This establishes a baseline typing speed that can be used for progress tracking and statistics. Users who have already set their keyboard layout will see a collapsed onboarding view.

## Problem Statement
Currently, new users see a "type some words" experience which is engaging but doesn't capture any metrics. We're missing an opportunity to:
1. Establish a baseline typing speed for measuring progress
2. Create a more engaging first-time experience
3. Store valuable data for future statistics and personalized recommendations

## Goals
1. Implement a speed test that appears when user has no keyboard layout set
2. Store speed test results with timestamp in user profile
3. Show collapsed onboarding view for returning users with keyboard layout set
4. Create foundation for progress tracking statistics

## Non-Goals
- Advanced typing analytics (accuracy breakdown by finger, etc.)
- Comparative statistics with other users (leaderboard for speed tests)
- Multiple speed test difficulty levels

## Technical Approach

### 1. Database Schema Changes

Add new fields to user document in Convex:

```typescript
// convex/schema.ts - users table updates
speedTests: v.optional(v.array(v.object({
  wpm: v.number(),
  accuracy: v.number(),
  timestamp: v.number(), // Unix timestamp
  keyboardLayout: v.string(), // Layout used during test
  testType: v.string(), // 'initial' | 'practice'
}))),
initialSpeedTest: v.optional(v.object({
  wpm: v.number(),
  accuracy: v.number(),
  timestamp: v.number(),
  keyboardLayout: v.string(),
})),
```

### 2. New Convex Mutations

```typescript
// convex/users.ts

// Save initial speed test
export const saveInitialSpeedTest = mutation({
  args: {
    wpm: v.number(),
    accuracy: v.number(),
    keyboardLayout: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
      .first();

    if (!user) throw new Error('User not found');

    const testResult = {
      wpm: args.wpm,
      accuracy: args.accuracy,
      timestamp: Date.now(),
      keyboardLayout: args.keyboardLayout,
    };

    await ctx.db.patch(user._id, {
      initialSpeedTest: testResult,
      speedTests: [...(user.speedTests || []), { ...testResult, testType: 'initial' }],
    });
  },
});

// Get initial speed test
export const getInitialSpeedTest = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
      .first();

    return user?.initialSpeedTest || null;
  },
});
```

### 3. Speed Test Component

```typescript
// src/components/InitialSpeedTest.tsx

interface InitialSpeedTestProps {
  keyboardLayout: string;
  onComplete: (results: { wpm: number; accuracy: number }) => void;
  onSkip?: () => void;
}

export function InitialSpeedTest({ keyboardLayout, onComplete, onSkip }: InitialSpeedTestProps) {
  // State for test phase: 'ready' | 'countdown' | 'testing' | 'complete'
  // Use existing typing logic from TypeTest component
  // Display engaging retro UI with:
  //   - 3-2-1 countdown animation
  //   - Real-time WPM display during test
  //   - Pixel art keyboard showing which keys to press
  //   - Progress bar
  //   - Results screen with "Your starting speed: XX WPM"
}
```

### 4. App.tsx Flow Changes

```typescript
// Modify the new user flow detection logic

const hasKeyboardLayout = keyboardLocked; // User has set keyboard layout
const hasInitialSpeedTest = useQuery(api.users.getInitialSpeedTest);

// Show full onboarding with speed test if:
// - No keyboard layout set OR
// - Keyboard layout set but no initial speed test
const showFullOnboarding = !hasKeyboardLayout || !hasInitialSpeedTest;

// In the render:
{!hasKeyboardLayout ? (
  // Full onboarding with keyboard detection + speed test
  <OnboardingFlow onComplete={handleOnboardingComplete} />
) : !hasInitialSpeedTest ? (
  // Keyboard set but no speed test - show speed test only
  <InitialSpeedTest
    keyboardLayout={detectedLayout}
    onComplete={handleSpeedTestComplete}
    onSkip={handleSpeedTestSkip}
  />
) : (
  // Returning user - show collapsed view
  <CollapsedOnboarding />
)}
```

### 5. Collapsed Onboarding View

For users who have keyboard layout set, show a minimal collapsed section:

```typescript
// src/components/CollapsedOnboarding.tsx

export function CollapsedOnboarding() {
  return (
    <div className="collapsed-hero">
      {/* Small keyboard layout indicator */}
      {/* Quick "Change keyboard" button */}
      {/* Go straight to lessons */}
    </div>
  );
}
```

## User Experience

### First-Time User Flow
1. User lands on typebit8
2. Keyboard detection runs, user confirms/selects layout
3. **NEW: Speed test appears**
   - "Let's see how fast you type!"
   - 3-2-1 countdown with retro animation
   - 30-second or 1-minute typing test with common words
   - Results displayed: "Your starting speed: 45 WPM, 92% accuracy"
   - "Let's improve that!" CTA to continue
4. User proceeds to lesson selection

### Returning User Flow (keyboard set)
1. User lands on typebit8
2. Collapsed hero section with:
   - Small keyboard layout indicator (e.g., "QWERTZ Swiss")
   - "Start Practicing" primary CTA
   - Optional "Change Keyboard" link
3. Immediate access to lessons

## Speed Test Design

- **Duration**: 30 seconds (short enough to not be tedious)
- **Content**: Common words appropriate for all layouts
- **Metrics captured**:
  - WPM (words per minute)
  - Accuracy percentage
  - Characters typed
  - Errors made
- **Visual style**: Match existing retro aesthetic
- **Skip option**: Available but discouraged via UI

## Future Extensions

This data enables:
1. Progress charts showing WPM improvement over time
2. Weekly/monthly speed test prompts
3. Personalized difficulty recommendations
4. "You've improved by X% since you started!" celebrations

## Implementation Phases

### Phase 1: Core Speed Test
- [ ] Add database schema for speed tests
- [ ] Create InitialSpeedTest component
- [ ] Integrate into App.tsx flow
- [ ] Save results to user profile

### Phase 2: Collapsed Onboarding
- [ ] Create CollapsedOnboarding component
- [ ] Conditionally render based on user state
- [ ] Add "Change keyboard" functionality

### Phase 3: Statistics Foundation
- [ ] Query for speed test history
- [ ] Basic statistics display (optional, can be separate PRP)

## Dependencies
- Existing keyboard detection system (PRP-034, PRP-035)
- User authentication (Clerk + Convex)
- Existing TypeTest component logic (can be reused)

## Testing Considerations
- Test with new users (no profile data)
- Test with users who have keyboard set but no speed test
- Test with returning users (full data)
- Test skip flow
- Test speed test accuracy calculations
