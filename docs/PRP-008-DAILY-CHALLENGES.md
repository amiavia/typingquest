# PRP-008: Daily Challenge System

**Status**: DRAFT
**Author**: Claude + Anton
**Date**: 2025-12-25
**Priority**: HIGH
**Estimated Effort**: 4 phases, ~40 tasks

---

## Executive Summary

This PRP introduces a daily challenge system to increase user engagement and retention in TypeBit8. Every day at midnight UTC, a new typing challenge will be generated with specific goals (speed, accuracy, endurance, or specific keys). Users who complete challenges earn bonus XP and coins, with tiered rewards based on performance (bronze/silver/gold). A daily leaderboard tracks top performers, and optional push notifications remind users when new challenges are available.

---

## Problem Statement

### Current State

1. **Limited engagement loop**: Users only interact with lessons, no time-gated content
2. **No daily habit formation**: Nothing brings users back daily
3. **Missing competitive element**: Leaderboards exist but no daily competition
4. **Underutilized reward system**: XP and coins only earned through lessons
5. **No push notifications**: Can't remind users to return to the app

### Impact

| Issue | User Impact |
|-------|-------------|
| No daily content | Lower retention, users forget about app |
| No competitive daily events | Missing social/competitive motivation |
| Single reward path | Progression feels monotonous |
| No reminders | Users who would engage don't remember to open app |

### Success Criteria

- [ ] New challenge generated daily at midnight UTC
- [ ] 4 challenge types implemented (speed, accuracy, endurance, specific keys)
- [ ] Tiered rewards system (bronze/silver/gold) based on performance
- [ ] Bonus XP and coins awarded on completion
- [ ] Daily leaderboard showing top 50 performers
- [ ] Push notification system (optional, user preference)
- [ ] Challenge state persists across sessions
- [ ] Convex backend handles generation and tracking
- [ ] Challenges adapt to user's current level

---

## Proposed Solution

### Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  DAILY CHALLENGE SYSTEM ARCHITECTURE                                         │
│                                                                             │
│  ┌──────────────────┐         ┌──────────────────┐                          │
│  │  Cron Scheduler  │────────▶│ Challenge Gen    │                          │
│  │  (Midnight UTC)  │         │ (Convex)         │                          │
│  └──────────────────┘         └────────┬─────────┘                          │
│                                        │                                    │
│                                        ▼                                    │
│                              ┌──────────────────┐                            │
│                              │ Daily Challenge  │                            │
│                              │ - Type           │                            │
│                              │ - Target metrics │                            │
│                              │ - Reward tiers   │                            │
│                              └────────┬─────────┘                            │
│                                       │                                     │
│                 ┌─────────────────────┼─────────────────────┐               │
│                 ▼                     ▼                     ▼               │
│         ┌──────────────┐      ┌──────────────┐     ┌──────────────┐         │
│         │ User Attempt │      │ Leaderboard  │     │ Rewards      │         │
│         │ - Progress   │      │ - Top 50     │     │ - Bonus XP   │         │
│         │ - Best score │      │ - Daily rank │     │ - Bonus coins│         │
│         └──────────────┘      └──────────────┘     └──────────────┘         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Architecture / Design

#### 1. Challenge Types

```typescript
// src/types/challenges.ts

export type ChallengeType = 'speed' | 'accuracy' | 'endurance' | 'specific-keys';

export interface DailyChallenge {
  _id: string;
  _creationTime: number;

  // Challenge metadata
  date: string;                    // YYYY-MM-DD in UTC
  type: ChallengeType;

  // Type-specific configuration
  config: ChallengeConfig;

  // Reward tiers
  rewards: {
    bronze: RewardTier;
    silver: RewardTier;
    gold: RewardTier;
  };
}

export type ChallengeConfig =
  | SpeedChallengeConfig
  | AccuracyChallengeConfig
  | EnduranceChallengeConfig
  | SpecificKeysChallengeConfig;

// Speed Challenge: Type as many words as possible in 60 seconds
export interface SpeedChallengeConfig {
  type: 'speed';
  duration: number;                // seconds (e.g., 60)
  text: string;                    // Long text to type
  targetWPM: {                     // Tier thresholds
    bronze: number;
    silver: number;
    gold: number;
  };
}

// Accuracy Challenge: Maintain 98%+ accuracy while typing
export interface AccuracyChallengeConfig {
  type: 'accuracy';
  text: string;
  targetAccuracy: {
    bronze: number;                // e.g., 95%
    silver: number;                // e.g., 97%
    gold: number;                  // e.g., 99%
  };
  minWPM: number;                  // Minimum speed to prevent gaming
}

// Endurance Challenge: Type continuously for 3 minutes
export interface EnduranceChallengeConfig {
  type: 'endurance';
  duration: number;                // seconds (e.g., 180)
  text: string;                    // Very long text
  targetWords: {                   // Total words typed
    bronze: number;
    silver: number;
    gold: number;
  };
}

// Specific Keys Challenge: Focus on certain keys (e.g., top row, numbers)
export interface SpecificKeysChallengeConfig {
  type: 'specific-keys';
  keys: string[];                  // e.g., ['1','2','3','4','5']
  text: string;                    // Text containing those keys
  targetAccuracy: {
    bronze: number;
    silver: number;
    gold: number;
  };
}

export interface RewardTier {
  xp: number;
  coins: number;
  badge?: string;                  // Optional badge ID
}
```

#### 2. Challenge Generation Algorithm

```typescript
// convex/challenges.ts

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

// Called by cron at midnight UTC
export const generateDailyChallenge = mutation({
  handler: async (ctx) => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Check if challenge already exists for today
    const existing = await ctx.db
      .query("dailyChallenges")
      .withIndex("by_date", q => q.eq("date", today))
      .unique();

    if (existing) {
      return existing._id;
    }

    // Select random challenge type
    const types: ChallengeType[] = ['speed', 'accuracy', 'endurance', 'specific-keys'];
    const type = types[Math.floor(Math.random() * types.length)];

    // Generate config based on type
    const config = await generateConfig(ctx, type);

    // Create challenge
    const challengeId = await ctx.db.insert("dailyChallenges", {
      date: today,
      type,
      config,
      rewards: {
        bronze: { xp: 50, coins: 25 },
        silver: { xp: 100, coins: 50 },
        gold: { xp: 200, coins: 100 },
      },
    });

    return challengeId;
  },
});

// Helper to generate type-specific config
async function generateConfig(ctx: any, type: ChallengeType): Promise<ChallengeConfig> {
  const wordLists = await ctx.db.query("wordDatabases").collect();

  switch (type) {
    case 'speed': {
      const text = generateRandomText(wordLists, 200); // ~200 words
      return {
        type: 'speed',
        duration: 60,
        text,
        targetWPM: { bronze: 30, silver: 50, gold: 70 },
      };
    }

    case 'accuracy': {
      const text = generateRandomText(wordLists, 100);
      return {
        type: 'accuracy',
        text,
        targetAccuracy: { bronze: 95, silver: 97, gold: 99 },
        minWPM: 20,
      };
    }

    case 'endurance': {
      const text = generateRandomText(wordLists, 400); // ~400 words
      return {
        type: 'endurance',
        duration: 180,
        text,
        targetWords: { bronze: 100, silver: 150, gold: 200 },
      };
    }

    case 'specific-keys': {
      // Rotate through different key groups
      const keyGroups = [
        { name: 'top-row', keys: ['q','w','e','r','t','y','u','i','o','p'] },
        { name: 'numbers', keys: ['1','2','3','4','5','6','7','8','9','0'] },
        { name: 'bottom-row', keys: ['z','x','c','v','b','n','m'] },
      ];
      const group = keyGroups[Math.floor(Math.random() * keyGroups.length)];
      const text = generateTextWithKeys(wordLists, group.keys, 100);

      return {
        type: 'specific-keys',
        keys: group.keys,
        text,
        targetAccuracy: { bronze: 90, silver: 95, gold: 98 },
      };
    }
  }
}
```

#### 3. User Attempts & Leaderboard

```typescript
// convex/challengeAttempts.ts

export const submitAttempt = mutation({
  args: {
    challengeId: v.id("dailyChallenges"),
    wpm: v.number(),
    accuracy: v.number(),
    wordsTyped: v.number(),
    timeSpent: v.number(), // seconds
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    const challenge = await ctx.db.get(args.challengeId);
    if (!challenge) throw new Error("Challenge not found");

    // Calculate tier achieved
    const tier = calculateTier(challenge, args);

    // Check if user has existing attempt
    const existing = await ctx.db
      .query("challengeAttempts")
      .withIndex("by_user_and_challenge", q =>
        q.eq("userId", user._id).eq("challengeId", args.challengeId)
      )
      .unique();

    // Calculate score (normalized 0-1000 based on challenge type)
    const score = calculateScore(challenge, args);

    if (existing) {
      // Update if better score
      if (score > existing.score) {
        await ctx.db.patch(existing._id, {
          wpm: args.wpm,
          accuracy: args.accuracy,
          wordsTyped: args.wordsTyped,
          timeSpent: args.timeSpent,
          score,
          tier,
          timestamp: Date.now(),
        });
      }
    } else {
      // First attempt - insert
      await ctx.db.insert("challengeAttempts", {
        userId: user._id,
        challengeId: args.challengeId,
        wpm: args.wpm,
        accuracy: args.accuracy,
        wordsTyped: args.wordsTyped,
        timeSpent: args.timeSpent,
        score,
        tier,
        timestamp: Date.now(),
      });

      // Award rewards (only on first completion)
      if (tier) {
        const reward = challenge.rewards[tier];
        await ctx.db.patch(user._id, {
          totalXP: (user.totalXP || 0) + reward.xp,
          coins: (user.coins || 0) + reward.coins,
        });
      }
    }

    return { tier, score };
  },
});

// Get daily leaderboard
export const getDailyLeaderboard = query({
  args: { challengeId: v.id("dailyChallenges") },
  handler: async (ctx, args) => {
    const attempts = await ctx.db
      .query("challengeAttempts")
      .withIndex("by_challenge", q => q.eq("challengeId", args.challengeId))
      .order("desc")
      .take(50);

    // Enrich with user data
    const leaderboard = await Promise.all(
      attempts.map(async (attempt) => {
        const user = await ctx.db.get(attempt.userId);
        return {
          rank: 0, // Will be set after sorting
          username: user?.username || "Anonymous",
          avatarId: user?.avatarId,
          score: attempt.score,
          tier: attempt.tier,
          wpm: attempt.wpm,
          accuracy: attempt.accuracy,
        };
      })
    );

    // Sort by score and assign ranks
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return leaderboard;
  },
});

// Helper functions
function calculateTier(challenge: any, attempt: any): 'bronze' | 'silver' | 'gold' | null {
  const config = challenge.config;

  switch (config.type) {
    case 'speed':
      if (attempt.wpm >= config.targetWPM.gold) return 'gold';
      if (attempt.wpm >= config.targetWPM.silver) return 'silver';
      if (attempt.wpm >= config.targetWPM.bronze) return 'bronze';
      return null;

    case 'accuracy':
      if (attempt.wpm < config.minWPM) return null; // Didn't meet min speed
      if (attempt.accuracy >= config.targetAccuracy.gold) return 'gold';
      if (attempt.accuracy >= config.targetAccuracy.silver) return 'silver';
      if (attempt.accuracy >= config.targetAccuracy.bronze) return 'bronze';
      return null;

    case 'endurance':
      if (attempt.wordsTyped >= config.targetWords.gold) return 'gold';
      if (attempt.wordsTyped >= config.targetWords.silver) return 'silver';
      if (attempt.wordsTyped >= config.targetWords.bronze) return 'bronze';
      return null;

    case 'specific-keys':
      if (attempt.accuracy >= config.targetAccuracy.gold) return 'gold';
      if (attempt.accuracy >= config.targetAccuracy.silver) return 'silver';
      if (attempt.accuracy >= config.targetAccuracy.bronze) return 'bronze';
      return null;
  }
}

function calculateScore(challenge: any, attempt: any): number {
  // Normalize to 0-1000 scale for leaderboard ranking
  const config = challenge.config;

  switch (config.type) {
    case 'speed':
      return Math.min(1000, (attempt.wpm / config.targetWPM.gold) * 1000);

    case 'accuracy':
      // Weighted: 70% accuracy, 30% speed
      const accuracyScore = (attempt.accuracy / config.targetAccuracy.gold) * 700;
      const speedScore = (attempt.wpm / 100) * 300; // Normalize to ~100 WPM max
      return Math.min(1000, accuracyScore + speedScore);

    case 'endurance':
      return Math.min(1000, (attempt.wordsTyped / config.targetWords.gold) * 1000);

    case 'specific-keys':
      return Math.min(1000, (attempt.accuracy / config.targetAccuracy.gold) * 1000);
  }
}
```

#### 4. Push Notifications

```typescript
// src/utils/notifications.ts

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export function scheduleDaily ChallengeNotification() {
  // Schedule notification for next midnight UTC + 5 minutes
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 5, 0, 0); // 00:05 UTC

  const delay = tomorrow.getTime() - now.getTime();

  setTimeout(() => {
    if (Notification.permission === 'granted') {
      new Notification('TypeBit8: New Daily Challenge!', {
        body: 'A fresh challenge awaits. Can you beat today\'s high score?',
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        tag: 'daily-challenge',
        requireInteraction: false,
      });
    }

    // Schedule next notification
    scheduleDailyChallengeNotification();
  }, delay);
}

// Save preference
export function setNotificationPreference(enabled: boolean) {
  localStorage.setItem('notifications-enabled', enabled.toString());

  if (enabled) {
    requestNotificationPermission().then(granted => {
      if (granted) {
        scheduleDailyChallengeNotification();
      }
    });
  }
}
```

#### 5. Convex Cron Job

```typescript
// convex/cron.ts

import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Generate daily challenge at midnight UTC
crons.daily(
  "generate daily challenge",
  { hourUTC: 0, minuteUTC: 0 }, // Midnight UTC
  internal.challenges.generateDailyChallenge
);

export default crons;
```

---

## File Structure

```
typingquest/
├── src/
│   ├── types/
│   │   └── challenges.ts                (new) - Challenge types
│   ├── utils/
│   │   └── notifications.ts             (new) - Push notification helpers
│   ├── components/
│   │   ├── DailyChallenge.tsx           (new) - Main challenge UI
│   │   ├── ChallengeCard.tsx            (new) - Challenge preview card
│   │   ├── ChallengeLeaderboard.tsx     (new) - Daily leaderboard
│   │   ├── RewardBadge.tsx              (new) - Bronze/silver/gold badges
│   │   └── NotificationSettings.tsx     (new) - Notification preferences
│   └── App.tsx                          (modify) - Add challenge route
│
├── convex/
│   ├── schema.ts                        (modify) - Add challenge tables
│   ├── challenges.ts                    (new) - Challenge generation
│   ├── challengeAttempts.ts             (new) - Attempt tracking
│   └── cron.ts                          (new) - Cron job configuration
│
└── public/
    ├── icon-192.png                     (new) - Notification icon
    └── badge-72.png                     (new) - Notification badge
```

---

## Implementation Order

### Phase 1: Backend Infrastructure
1. Update Convex schema with dailyChallenges and challengeAttempts tables
2. Create challenge type definitions
3. Implement challenge generation algorithm
4. Set up cron job for midnight UTC generation
5. Test challenge generation manually

### Phase 2: Attempt Tracking & Rewards
6. Implement attempt submission mutation
7. Add tier calculation logic
8. Implement score calculation for leaderboard
9. Add reward distribution (XP + coins)
10. Create leaderboard query
11. Test attempt flow end-to-end

### Phase 3: Frontend UI
12. Create DailyChallenge component with typing interface
13. Build ChallengeCard for home screen preview
14. Implement ChallengeLeaderboard component
15. Add RewardBadge component (bronze/silver/gold)
16. Update App.tsx with challenge route
17. Add challenge notification in header when available
18. Test all challenge types in UI

### Phase 4: Notifications & Polish
19. Implement notification permission request
20. Create NotificationSettings component
21. Add scheduled notification system
22. Store user notification preference
23. Create notification icons (192x192, 72x72)
24. Test notifications across browsers
25. Polish animations and transitions

---

## Phase Implementation Details

### Phase 1: Backend Infrastructure

**Objective**: Set up Convex backend for challenge generation and storage.

#### Tasks
- [ ] **1.1** Update `convex/schema.ts` to add `dailyChallenges` table
- [ ] **1.2** Update `convex/schema.ts` to add `challengeAttempts` table
- [ ] **1.3** Create `src/types/challenges.ts` with all challenge type definitions
- [ ] **1.4** Create `convex/challenges.ts` with `generateDailyChallenge` mutation
- [ ] **1.5** Implement `generateConfig()` helper for each challenge type
- [ ] **1.6** Create `generateRandomText()` helper using existing word databases
- [ ] **1.7** Create `generateTextWithKeys()` for specific-keys challenges
- [ ] **1.8** Create `convex/cron.ts` and configure midnight UTC cron job
- [ ] **1.9** Add `getTodayChallenge` query to fetch current challenge
- [ ] **1.10** Test challenge generation by manually triggering mutation

#### Build Gate
```bash
npm run build
npx convex dev # Verify schema deployment
```

#### Phase Completion
```
<promise>PRP-008 PHASE 1 COMPLETE</promise>
```

---

### Phase 2: Attempt Tracking & Rewards

**Objective**: Implement attempt submission, scoring, and reward distribution.

#### Tasks
- [ ] **2.1** Create `convex/challengeAttempts.ts` file
- [ ] **2.2** Implement `submitAttempt` mutation with all validation
- [ ] **2.3** Implement `calculateTier()` helper for all challenge types
- [ ] **2.4** Implement `calculateScore()` helper for leaderboard ranking
- [ ] **2.5** Add logic to update existing attempt if better score
- [ ] **2.6** Add reward distribution (XP + coins) on first completion
- [ ] **2.7** Implement `getDailyLeaderboard` query with user enrichment
- [ ] **2.8** Add `getUserAttempt` query to check if user completed today
- [ ] **2.9** Create indexes for efficient querying (by_date, by_user_and_challenge, by_challenge)
- [ ] **2.10** Test attempt submission with mock data
- [ ] **2.11** Verify rewards are correctly awarded
- [ ] **2.12** Test leaderboard sorting and ranking

#### Build Gate
```bash
npm run build
npx convex dev
```

#### Phase Completion
```
<promise>PRP-008 PHASE 2 COMPLETE</promise>
```

---

### Phase 3: Frontend UI

**Objective**: Build user-facing challenge interface and components.

#### Tasks
- [ ] **3.1** Create `src/components/DailyChallenge.tsx` main component
- [ ] **3.2** Add typing interface with timer for timed challenges
- [ ] **3.3** Implement real-time WPM and accuracy tracking
- [ ] **3.4** Add challenge completion modal with tier badge
- [ ] **3.5** Create `src/components/ChallengeCard.tsx` for home screen
- [ ] **3.6** Display challenge type, requirements, and rewards
- [ ] **3.7** Show "Completed" state if user finished today's challenge
- [ ] **3.8** Create `src/components/ChallengeLeaderboard.tsx`
- [ ] **3.9** Display top 50 with ranks, avatars, scores
- [ ] **3.10** Highlight current user's position
- [ ] **3.11** Create `src/components/RewardBadge.tsx` with bronze/silver/gold variants
- [ ] **3.12** Add animations for badge reveal
- [ ] **3.13** Update `src/App.tsx` to add `/challenge` route
- [ ] **3.14** Add challenge notification in header (badge if not completed)
- [ ] **3.15** Test all 4 challenge types in browser
- [ ] **3.16** Verify responsive design on mobile
- [ ] **3.17** Add loading states and error handling

#### Build Gate
```bash
npm run build
npm run dev # Manual browser testing
```

#### Phase Completion
```
<promise>PRP-008 PHASE 3 COMPLETE</promise>
```

---

### Phase 4: Notifications & Polish

**Objective**: Add push notifications and polish the experience.

#### Tasks
- [ ] **4.1** Create `src/utils/notifications.ts` with permission helpers
- [ ] **4.2** Implement `requestNotificationPermission()` function
- [ ] **4.3** Implement `scheduleDailyChallengeNotification()` with timeout logic
- [ ] **4.4** Create `src/components/NotificationSettings.tsx` toggle component
- [ ] **4.5** Add notification preference to user settings
- [ ] **4.6** Store preference in localStorage
- [ ] **4.7** Request permission on first enable
- [ ] **4.8** Create notification icon (192x192 PNG) in `public/icon-192.png`
- [ ] **4.9** Create notification badge (72x72 PNG) in `public/badge-72.png`
- [ ] **4.10** Test notifications in Chrome
- [ ] **4.11** Test notifications in Firefox
- [ ] **4.12** Test notifications in Safari (if supported)
- [ ] **4.13** Add notification test button in settings
- [ ] **4.14** Add smooth transitions to challenge UI
- [ ] **4.15** Add confetti or particle effect on gold tier achievement
- [ ] **4.16** Polish badge reveal animation
- [ ] **4.17** Add sound effects for tier achievements (optional)
- [ ] **4.18** Test full flow: notification → open app → complete challenge → leaderboard

#### Build Gate
```bash
npm run build
npm run preview # Test production build
```

#### Phase Completion
```
<promise>PRP-008 PHASE 4 COMPLETE</promise>
```

---

## Convex Schema Changes

```typescript
// convex/schema.ts additions

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ... existing tables

  dailyChallenges: defineTable({
    date: v.string(),                    // YYYY-MM-DD
    type: v.string(),                    // 'speed' | 'accuracy' | 'endurance' | 'specific-keys'
    config: v.any(),                     // Challenge-specific config
    rewards: v.object({
      bronze: v.object({ xp: v.number(), coins: v.number() }),
      silver: v.object({ xp: v.number(), coins: v.number() }),
      gold: v.object({ xp: v.number(), coins: v.number() }),
    }),
  })
    .index("by_date", ["date"]),

  challengeAttempts: defineTable({
    userId: v.id("users"),
    challengeId: v.id("dailyChallenges"),
    wpm: v.number(),
    accuracy: v.number(),
    wordsTyped: v.number(),
    timeSpent: v.number(),
    score: v.number(),                   // Normalized 0-1000
    tier: v.optional(v.string()),        // 'bronze' | 'silver' | 'gold'
    timestamp: v.number(),
  })
    .index("by_user_and_challenge", ["userId", "challengeId"])
    .index("by_challenge", ["challengeId"])
    .index("by_score", ["challengeId", "score"]),
});
```

---

## UI Mockups

### Challenge Card (Home Screen)

```
┌─────────────────────────────────────────────────────────┐
│  🏆 DAILY CHALLENGE                                      │
│                                                         │
│  ⚡ SPEED CHALLENGE                                      │
│  Type as fast as you can in 60 seconds!                │
│                                                         │
│  REWARDS                                                │
│  🥉 Bronze: 50 XP, 25 coins (30 WPM)                    │
│  🥈 Silver: 100 XP, 50 coins (50 WPM)                   │
│  🥇 Gold: 200 XP, 100 coins (70 WPM)                    │
│                                                         │
│  [ START CHALLENGE ]                                    │
│                                                         │
│  📊 Today's Top 3:                                      │
│  1. SpeedDemon - 987 pts 🥇                             │
│  2. FastFingers - 892 pts 🥈                            │
│  3. TypeMaster - 856 pts 🥉                             │
└─────────────────────────────────────────────────────────┘
```

### Challenge In Progress

```
┌─────────────────────────────────────────────────────────┐
│  ⏱️ 00:42 remaining          WPM: 62   ACC: 97%         │
│                                                         │
│  The quick brown fox jumps over the lazy dog. Pack     │
│  my box with five dozen liquor jugs.                   │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░                │
│                                                         │
│  TARGET: 🥇 70 WPM                                       │
│  CURRENT: 🥈 Silver pace                                │
└─────────────────────────────────────────────────────────┘
```

### Completion Modal

```
┌─────────────────────────────────────────────────────────┐
│                    CHALLENGE COMPLETE!                  │
│                                                         │
│                         🥇                              │
│                      GOLD TIER                          │
│                                                         │
│  Your Stats:                                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━     │
│  Speed: 72 WPM                                          │
│  Accuracy: 98%                                          │
│  Score: 823 pts                                         │
│                                                         │
│  Rewards Earned:                                        │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━     │
│  +200 XP                                                │
│  +100 Coins                                             │
│                                                         │
│  [ VIEW LEADERBOARD ]    [ CLOSE ]                      │
└─────────────────────────────────────────────────────────┘
```

---

## Testing Checklist

### Backend Testing
- [ ] Challenge generation creates all required fields
- [ ] Cron job triggers at midnight UTC
- [ ] Each challenge type generates valid config
- [ ] Attempt submission calculates correct tier
- [ ] Score calculation produces consistent rankings
- [ ] Rewards only awarded once per challenge
- [ ] Leaderboard returns top 50 sorted by score
- [ ] User can't submit duplicate attempts (updates instead)

### Frontend Testing
- [ ] Challenge card displays current challenge
- [ ] Timer counts down correctly
- [ ] WPM/accuracy update in real-time
- [ ] Completion modal shows correct tier badge
- [ ] Leaderboard displays with avatars
- [ ] User's rank is highlighted
- [ ] Navigation between challenge and leaderboard works
- [ ] Loading states appear during data fetch

### Notification Testing
- [ ] Permission request appears on first enable
- [ ] Notification fires at midnight UTC + 5 min
- [ ] Notification displays correct text and icon
- [ ] Clicking notification opens app
- [ ] Preference persists across sessions
- [ ] Disabling stops future notifications

### Integration Testing
- [ ] Complete full flow: notification → challenge → completion → leaderboard
- [ ] Test all 4 challenge types end-to-end
- [ ] Verify XP/coins update in profile
- [ ] Test on mobile viewport
- [ ] Test offline behavior (graceful degradation)
- [ ] Test with no internet (show cached challenge if available)

---

## Rollback Plan

```bash
# If issues discovered after deployment:

# 1. Disable cron job
# Edit convex/cron.ts and comment out cron job, redeploy

# 2. Remove challenge route
# Comment out challenge route in App.tsx

# 3. Database cleanup
# Challenges and attempts tables remain but aren't shown to users
# Can delete tables in Convex dashboard if needed

# 4. Revert to previous version
git revert HEAD~N  # Revert commits from this PRP
```

---

## Future Enhancements

### Phase 5 (Future)
- **Weekly Challenges**: Longer, harder challenges with better rewards
- **Challenge Streaks**: Bonus rewards for consecutive days
- **Friend Challenges**: Challenge specific users
- **Custom Challenges**: Users create and share challenges
- **Challenge Badges**: Special badges for achievements (10 day streak, 50 golds, etc.)
- **Challenge Archive**: Browse and replay past challenges
- **Seasonal Events**: Special themed challenges for holidays

---

## Notes

- **UTC Timing**: All challenges use UTC to ensure global consistency
- **Cron Reliability**: Convex cron jobs are reliable, but add monitoring
- **Notification Support**: Not all browsers support push notifications (Safari limited)
- **Fair Play**: Score calculation prevents gaming the system (min WPM for accuracy challenges)
- **Scalability**: Leaderboard limited to top 50 for performance
- **Caching**: Consider caching today's challenge on client to reduce queries
- **Offline**: Store last challenge locally for offline attempt (sync on reconnect)

---

## Open Questions & Decisions

### Q1: Should challenges adapt to user level?

**Options:**
- A) Fixed difficulty for all users (fair competition)
- B) Adaptive difficulty based on user stats (personalized)
- C) Multiple difficulty tiers (beginner/intermediate/advanced)

**Recommendation:** Option A for v1 (simpler, more competitive), add Option C in Phase 5

### Q2: How to handle time zones for notifications?

**Options:**
- A) Fixed midnight UTC (simple, but may fire at odd local times)
- B) User's local midnight (requires timezone storage)
- C) User-selectable notification time

**Recommendation:** Option A for v1, add Option C in Phase 5

### Q3: Should rewards scale with user level?

**Options:**
- A) Fixed rewards (50/100/200 XP)
- B) Scale with level (Level 5 gets 250/500/1000 XP)
- C) Hybrid (base + level bonus)

**Recommendation:** Option A for v1 (simpler to balance)

---

## References

- Convex cron jobs: https://docs.convex.dev/scheduling/cron-jobs
- Web Notifications API: https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API
- Existing lessons system: `src/data/lessons.ts`
- Existing word databases: `src/data/wordDatabases/`

---

## Changelog

| Date | Author | Changes |
|------|--------|---------|
| 2025-12-25 | Claude + Anton | Initial draft |

---

<!--
EXECUTION NOTES:
- Start with Phase 1 (backend) to establish data structures
- Test cron job manually before relying on schedule
- Phase 3 (UI) can be done in parallel with Phase 2 using mock data
- Phase 4 (notifications) is optional but increases engagement
- Consider A/B testing notification timing for optimal engagement
-->
