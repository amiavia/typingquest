# PRP-009: Daily Streak System

**Status**: DRAFT
**Author**: Claude + Anton
**Date**: 2025-12-25
**Priority**: MEDIUM
**Estimated Effort**: 6 phases, ~60 tasks

---

## Executive Summary

This PRP introduces a daily login/play streak system to TypeBit8 that encourages consistent practice through streak tracking, reward multipliers, milestone achievements, and recovery mechanisms. The system will track consecutive days of practice, apply XP/coin multipliers based on streak length, reward users at key milestones (7, 30, 100 days), offer purchasable streak freeze items, and provide a grace period for streak recovery.

---

## Problem Statement

### Current State

1. **No retention mechanism**: Users have no incentive to return daily or maintain consistent practice habits.

2. **Flat reward structure**: XP and coins are earned at a constant rate regardless of user dedication or consistency.

3. **Limited engagement**: No gamification elements to encourage daily interaction with the app.

4. **No progress visualization**: Users cannot see their practice consistency or commitment over time.

### Impact

| Issue | User Impact |
|-------|-------------|
| No daily incentive | Lower retention, inconsistent practice |
| Flat rewards | No recognition for dedicated users |
| No streak tracking | Missed opportunity for habit formation |
| No recovery mechanism | Fear of breaking streak discourages users |

### Success Criteria

- [ ] Track consecutive days of practice accurately
- [ ] Apply appropriate XP/coin multipliers based on streak length
- [ ] Award special rewards at milestone streaks (7, 30, 100 days)
- [ ] Provide streak freeze items purchasable with coins
- [ ] Display visual streak counter in header/UI
- [ ] Implement 24-hour grace period for streak recovery
- [ ] Persist streak data reliably using Convex backend
- [ ] Handle timezone differences correctly
- [ ] Prevent streak manipulation/exploitation
- [ ] Support streak history and statistics

---

## Proposed Solution

### Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  DAILY STREAK ARCHITECTURE                                                  │
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│  │  Daily Check │    │   Streak     │    │  Rewards     │                  │
│  │  User logs   │ -> │  Calculator  │ -> │  Multiplier  │                  │
│  │  in/plays    │    │  (Convex)    │    │  System      │                  │
│  └──────────────┘    └──────────────┘    └──────────────┘                  │
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│  │  Milestone   │    │  Streak      │    │  Grace       │                  │
│  │  Detector    │    │  Freeze      │    │  Period      │                  │
│  │  7/30/100    │    │  Items       │    │  Recovery    │                  │
│  └──────────────┘    └──────────────┘    └──────────────┘                  │
│                             │                                               │
│                             ▼                                               │
│                   ┌──────────────────┐                                      │
│                   │ Visual Streak    │                                      │
│                   │ Counter & Stats  │                                      │
│                   └──────────────────┘                                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Architecture / Design

#### 1. Streak Data Model (Convex)

```typescript
// convex/schema.ts

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ... existing tables ...

  streaks: defineTable({
    userId: v.string(),
    currentStreak: v.number(),      // Current consecutive days
    longestStreak: v.number(),      // Personal record
    lastActivityDate: v.string(),   // ISO date string (YYYY-MM-DD)
    lastActivityTimestamp: v.number(), // Unix timestamp for precise tracking
    streakFreezes: v.number(),      // Available freeze items
    totalDaysActive: v.number(),    // Lifetime active days
    milestonesClaimed: v.array(v.number()), // [7, 30, 100] claimed milestones
    graceEndTimestamp: v.optional(v.number()), // Grace period expiry
  }).index("by_user", ["userId"]),

  streakHistory: defineTable({
    userId: v.string(),
    date: v.string(),               // ISO date string (YYYY-MM-DD)
    streakCount: v.number(),        // Streak on that day
    xpEarned: v.number(),           // Total XP that day
    coinsEarned: v.number(),        // Total coins that day
    multiplier: v.number(),         // Active multiplier
    wasFreezed: v.boolean(),        // Used freeze on this day
  }).index("by_user_date", ["userId", "date"]),
});
```

#### 2. Streak Multiplier System

Streaks apply progressive multipliers to XP and coin rewards:

```typescript
// src/utils/streakMultipliers.ts

export interface StreakTier {
  minDays: number;
  xpMultiplier: number;
  coinMultiplier: number;
  tier: string;
  color: string;
}

export const STREAK_TIERS: StreakTier[] = [
  { minDays: 0,   xpMultiplier: 1.0,  coinMultiplier: 1.0,  tier: "Beginner",  color: "#9CA3AF" },
  { minDays: 3,   xpMultiplier: 1.1,  coinMultiplier: 1.1,  tier: "Warming Up", color: "#60A5FA" },
  { minDays: 7,   xpMultiplier: 1.25, coinMultiplier: 1.2,  tier: "On Fire",   color: "#F59E0B" },
  { minDays: 14,  xpMultiplier: 1.4,  coinMultiplier: 1.3,  tier: "Blazing",   color: "#EF4444" },
  { minDays: 30,  xpMultiplier: 1.6,  coinMultiplier: 1.5,  tier: "Legendary", color: "#8B5CF6" },
  { minDays: 60,  xpMultiplier: 1.8,  coinMultiplier: 1.7,  tier: "Master",    color: "#EC4899" },
  { minDays: 100, xpMultiplier: 2.0,  coinMultiplier: 2.0,  tier: "Immortal",  color: "#FBBF24" },
];

export function getStreakTier(streakDays: number): StreakTier {
  // Find highest tier user qualifies for
  const tier = [...STREAK_TIERS]
    .reverse()
    .find(t => streakDays >= t.minDays);
  return tier || STREAK_TIERS[0];
}

export function applyStreakMultiplier(baseAmount: number, streakDays: number, type: 'xp' | 'coins'): number {
  const tier = getStreakTier(streakDays);
  const multiplier = type === 'xp' ? tier.xpMultiplier : tier.coinMultiplier;
  return Math.floor(baseAmount * multiplier);
}
```

#### 3. Milestone Rewards

```typescript
// src/data/milestones.ts

export interface StreakMilestone {
  days: number;
  title: string;           // Localized key
  description: string;     // Localized key
  rewards: {
    coins?: number;
    xp?: number;
    streakFreezes?: number;
    badge?: string;       // Badge ID
  };
  icon: string;
}

export const STREAK_MILESTONES: StreakMilestone[] = [
  {
    days: 7,
    title: "milestone.streak_7.title",
    description: "milestone.streak_7.description",
    rewards: {
      coins: 500,
      xp: 1000,
      streakFreezes: 1,
      badge: "week_warrior"
    },
    icon: "🔥"
  },
  {
    days: 30,
    title: "milestone.streak_30.title",
    description: "milestone.streak_30.description",
    rewards: {
      coins: 2500,
      xp: 5000,
      streakFreezes: 3,
      badge: "month_master"
    },
    icon: "💎"
  },
  {
    days: 100,
    title: "milestone.streak_100.title",
    description: "milestone.streak_100.description",
    rewards: {
      coins: 10000,
      xp: 25000,
      streakFreezes: 10,
      badge: "centurion"
    },
    icon: "👑"
  },
  {
    days: 365,
    title: "milestone.streak_365.title",
    description: "milestone.streak_365.description",
    rewards: {
      coins: 50000,
      xp: 100000,
      streakFreezes: 30,
      badge: "year_champion"
    },
    icon: "🏆"
  }
];
```

#### 4. Streak Freeze Items

```typescript
// convex/streakFreezes.ts

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Purchase streak freeze with coins
export const purchaseStreakFreeze = mutation({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const FREEZE_COST = 500; // coins

    // Get user's coins
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("id"), userId))
      .first();

    if (!user || user.coins < FREEZE_COST) {
      throw new Error("Insufficient coins");
    }

    // Deduct coins
    await ctx.db.patch(user._id, {
      coins: user.coins - FREEZE_COST
    });

    // Add freeze to streak record
    const streak = await ctx.db
      .query("streaks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (streak) {
      await ctx.db.patch(streak._id, {
        streakFreezes: (streak.streakFreezes || 0) + 1
      });
    }

    return { success: true, freezesOwned: (streak?.streakFreezes || 0) + 1 };
  }
});

// Use a freeze (automatic when missing a day)
export const useStreakFreeze = mutation({
  args: { userId: v.string(), date: v.string() },
  handler: async (ctx, { userId, date }) => {
    const streak = await ctx.db
      .query("streaks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!streak || streak.streakFreezes <= 0) {
      throw new Error("No freezes available");
    }

    // Use one freeze
    await ctx.db.patch(streak._id, {
      streakFreezes: streak.streakFreezes - 1,
      lastActivityDate: date // Update to maintain streak
    });

    // Log in history
    await ctx.db.insert("streakHistory", {
      userId,
      date,
      streakCount: streak.currentStreak,
      xpEarned: 0,
      coinsEarned: 0,
      multiplier: 1.0,
      wasFreezed: true
    });

    return { success: true, freezesRemaining: streak.streakFreezes - 1 };
  }
});
```

#### 5. Daily Check-in System

```typescript
// convex/streaks.ts

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Check and update streak on user activity
export const checkStreak = mutation({
  args: {
    userId: v.string(),
    xpEarned: v.number(),
    coinsEarned: v.number()
  },
  handler: async (ctx, { userId, xpEarned, coinsEarned }) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const nowTimestamp = now.getTime();

    let streak = await ctx.db
      .query("streaks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    // Initialize streak if doesn't exist
    if (!streak) {
      const newStreak = await ctx.db.insert("streaks", {
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActivityDate: today,
        lastActivityTimestamp: nowTimestamp,
        streakFreezes: 0,
        totalDaysActive: 1,
        milestonesClaimed: []
      });

      await logStreakHistory(ctx, userId, today, 1, xpEarned, coinsEarned, 1.0, false);
      return { currentStreak: 1, isNewMilestone: false, tier: getStreakTier(1) };
    }

    const lastDate = new Date(streak.lastActivityDate);
    const daysDiff = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    let currentStreak = streak.currentStreak;
    let usedFreeze = false;

    if (daysDiff === 0) {
      // Same day activity - no streak change
      await logStreakHistory(ctx, userId, today, currentStreak, xpEarned, coinsEarned,
        getStreakTier(currentStreak).xpMultiplier, false);
      return { currentStreak, isNewMilestone: false, tier: getStreakTier(currentStreak) };
    } else if (daysDiff === 1) {
      // Consecutive day - increment streak
      currentStreak++;
    } else if (daysDiff === 2 && streak.graceEndTimestamp && nowTimestamp <= streak.graceEndTimestamp) {
      // Within grace period - maintain streak
      currentStreak++;
    } else if (daysDiff > 1 && streak.streakFreezes > 0) {
      // Missed day(s) but has freeze - use it
      await useStreakFreeze(ctx, userId, today);
      usedFreeze = true;
      // Streak maintained
    } else {
      // Streak broken - reset to 1
      currentStreak = 1;
    }

    // Update streak record
    const longestStreak = Math.max(streak.longestStreak, currentStreak);
    const graceEndTimestamp = nowTimestamp + (24 * 60 * 60 * 1000); // 24 hours from now

    await ctx.db.patch(streak._id, {
      currentStreak,
      longestStreak,
      lastActivityDate: today,
      lastActivityTimestamp: nowTimestamp,
      totalDaysActive: streak.totalDaysActive + 1,
      graceEndTimestamp
    });

    // Log history
    const tier = getStreakTier(currentStreak);
    await logStreakHistory(ctx, userId, today, currentStreak, xpEarned, coinsEarned,
      tier.xpMultiplier, usedFreeze);

    // Check for milestone rewards
    const milestone = checkMilestone(currentStreak, streak.milestonesClaimed);
    if (milestone) {
      await awardMilestone(ctx, userId, milestone, streak._id);
      return { currentStreak, isNewMilestone: true, milestone, tier };
    }

    return { currentStreak, isNewMilestone: false, tier };
  }
});

// Helper: Log streak history
async function logStreakHistory(
  ctx: any,
  userId: string,
  date: string,
  streakCount: number,
  xpEarned: number,
  coinsEarned: number,
  multiplier: number,
  wasFreezed: boolean
) {
  // Check if already logged today
  const existing = await ctx.db
    .query("streakHistory")
    .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", date))
    .first();

  if (existing) {
    // Update existing record
    await ctx.db.patch(existing._id, {
      xpEarned: existing.xpEarned + xpEarned,
      coinsEarned: existing.coinsEarned + coinsEarned
    });
  } else {
    // Create new record
    await ctx.db.insert("streakHistory", {
      userId,
      date,
      streakCount,
      xpEarned,
      coinsEarned,
      multiplier,
      wasFreezed
    });
  }
}

// Helper: Check if milestone reached
function checkMilestone(currentStreak: number, claimedMilestones: number[]) {
  const milestone = STREAK_MILESTONES.find(m =>
    m.days === currentStreak && !claimedMilestones.includes(m.days)
  );
  return milestone || null;
}

// Helper: Award milestone rewards
async function awardMilestone(ctx: any, userId: string, milestone: StreakMilestone, streakId: any) {
  // Award coins
  if (milestone.rewards.coins) {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("id"), userId))
      .first();
    if (user) {
      await ctx.db.patch(user._id, {
        coins: user.coins + milestone.rewards.coins
      });
    }
  }

  // Award XP
  if (milestone.rewards.xp) {
    // Use existing XP system
  }

  // Award streak freezes
  if (milestone.rewards.streakFreezes) {
    await ctx.db.patch(streakId, {
      streakFreezes: (await ctx.db.get(streakId)).streakFreezes + milestone.rewards.streakFreezes
    });
  }

  // Award badge (implement badge system separately)

  // Mark milestone as claimed
  const streak = await ctx.db.get(streakId);
  await ctx.db.patch(streakId, {
    milestonesClaimed: [...streak.milestonesClaimed, milestone.days]
  });
}

// Query: Get streak stats
export const getStreakStats = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const streak = await ctx.db
      .query("streaks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!streak) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalDaysActive: 0,
        streakFreezes: 0,
        tier: getStreakTier(0),
        nextMilestone: STREAK_MILESTONES[0]
      };
    }

    const tier = getStreakTier(streak.currentStreak);
    const nextMilestone = STREAK_MILESTONES.find(m =>
      m.days > streak.currentStreak && !streak.milestonesClaimed.includes(m.days)
    );

    return {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      totalDaysActive: streak.totalDaysActive,
      streakFreezes: streak.streakFreezes,
      tier,
      nextMilestone,
      lastActivityDate: streak.lastActivityDate
    };
  }
});
```

#### 6. UI Components

```typescript
// src/components/StreakCounter.tsx

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { getStreakTier } from '../utils/streakMultipliers';

interface StreakCounterProps {
  userId: string;
}

export const StreakCounter: React.FC<StreakCounterProps> = ({ userId }) => {
  const stats = useQuery(api.streaks.getStreakStats, { userId });

  if (!stats) return null;

  const { currentStreak, tier, nextMilestone, streakFreezes } = stats;

  return (
    <div className="streak-counter" style={{
      backgroundColor: tier.color + '20',
      border: `2px solid ${tier.color}`
    }}>
      <div className="streak-flame">🔥</div>
      <div className="streak-info">
        <div className="streak-number" style={{ color: tier.color }}>
          {currentStreak}
        </div>
        <div className="streak-label">{tier.tier}</div>
      </div>

      {nextMilestone && (
        <div className="next-milestone">
          <div className="milestone-progress">
            <div
              className="progress-bar"
              style={{
                width: `${(currentStreak / nextMilestone.days) * 100}%`,
                backgroundColor: tier.color
              }}
            />
          </div>
          <div className="milestone-text">
            {nextMilestone.days - currentStreak} days to {nextMilestone.icon}
          </div>
        </div>
      )}

      {streakFreezes > 0 && (
        <div className="freeze-count">
          ❄️ {streakFreezes}
        </div>
      )}
    </div>
  );
};
```

```typescript
// src/components/StreakStats.tsx

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { STREAK_MILESTONES } from '../data/milestones';

interface StreakStatsProps {
  userId: string;
}

export const StreakStats: React.FC<StreakStatsProps> = ({ userId }) => {
  const stats = useQuery(api.streaks.getStreakStats, { userId });
  const history = useQuery(api.streaks.getStreakHistory, { userId, days: 30 });

  if (!stats) return null;

  return (
    <div className="streak-stats">
      <h2>Streak Statistics</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-value">{stats.currentStreak}</div>
          <div className="stat-label">Current Streak</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-value">{stats.longestStreak}</div>
          <div className="stat-label">Longest Streak</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-value">{stats.totalDaysActive}</div>
          <div className="stat-label">Total Days</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">❄️</div>
          <div className="stat-value">{stats.streakFreezes}</div>
          <div className="stat-label">Freezes</div>
        </div>
      </div>

      <div className="milestones-section">
        <h3>Milestones</h3>
        {STREAK_MILESTONES.map(milestone => (
          <MilestoneCard
            key={milestone.days}
            milestone={milestone}
            isUnlocked={stats.currentStreak >= milestone.days}
            isClaimed={stats.milestonesClaimed?.includes(milestone.days)}
          />
        ))}
      </div>

      <div className="history-calendar">
        <h3>Last 30 Days</h3>
        <StreakCalendar history={history} />
      </div>
    </div>
  );
};
```

### File Structure

```
typingquest/
├── convex/
│   ├── schema.ts                    # Update with streak tables
│   ├── streaks.ts                   # Streak check-in & stats
│   ├── streakFreezes.ts             # Freeze purchase & usage
│   └── streakHistory.ts             # Historical data queries
├── src/
│   ├── components/
│   │   ├── StreakCounter.tsx        # Header streak display
│   │   ├── StreakStats.tsx          # Detailed stats page
│   │   ├── MilestoneCard.tsx        # Milestone display
│   │   ├── StreakCalendar.tsx       # 30-day calendar view
│   │   └── StreakFreezeShop.tsx     # Purchase freezes
│   ├── data/
│   │   ├── milestones.ts            # Milestone definitions
│   │   └── streakTiers.ts           # Tier configuration
│   ├── utils/
│   │   ├── streakMultipliers.ts     # Multiplier calculations
│   │   ├── dateUtils.ts             # Timezone handling
│   │   └── streakValidator.ts       # Anti-cheat validation
│   ├── hooks/
│   │   ├── useStreak.ts             # Streak state management
│   │   └── useStreakRewards.ts      # Reward calculations
│   └── types/
│       └── streak.ts                # TypeScript types
└── docs/
    └── PRP-009-STREAK-SYSTEM.md     # This document
```

### Implementation Order

1. **Phase 1**: Convex schema & basic tracking
2. **Phase 2**: Streak calculation logic & multipliers
3. **Phase 3**: Milestone system
4. **Phase 4**: Streak freeze mechanics
5. **Phase 5**: UI components & integration
6. **Phase 6**: Testing & anti-cheat measures

---

## Documentation Requirements

### Documentation Checklist
- [ ] **D.1** Update README with streak system overview
- [ ] **D.2** Document streak multiplier tiers
- [ ] **D.3** Document milestone rewards
- [ ] **D.4** Add changelog entry for streak system

### README Updates
| File | Action | Scope |
|------|--------|-------|
| `README.md` | UPDATE | Add streak system section |
| `docs/STREAK-MECHANICS.md` | CREATE | Detailed mechanics guide |

---

## Pre-Flight Checks

> **MANDATORY**: These checks MUST pass before starting implementation.

- [ ] Convex backend is configured and running
- [ ] User authentication is working
- [ ] Coin system exists and is functional
- [ ] XP system exists and is functional
- [ ] `npm build` succeeds (baseline)
- [ ] `npm dev` runs without errors
- [ ] No TypeScript errors in codebase

---

## Implementation Tasks

### Phase 1: Core Data Structures & Schema

**Objective**: Create Convex schema and basic streak tracking infrastructure.

#### Tasks
- [ ] **1.1** Update `convex/schema.ts` with `streaks` table definition
- [ ] **1.2** Update `convex/schema.ts` with `streakHistory` table definition
- [ ] **1.3** Add indexes for efficient querying (`by_user`, `by_user_date`)
- [ ] **1.4** Create `src/types/streak.ts` with TypeScript interfaces
- [ ] **1.5** Create `convex/streaks.ts` with basic query/mutation stubs
- [ ] **1.6** Deploy schema changes to Convex: `npx convex dev`
- [ ] **1.7** Verify tables created in Convex dashboard
- [ ] **1.8** Test basic streak record creation with sample data
- [ ] **1.9** Create `src/utils/dateUtils.ts` for timezone-safe date handling
- [ ] **1.10** Add unit tests for date utilities

#### Build Gate
```bash
npm run build
npm run test
npx convex dev
```

#### Phase Completion
```
<promise>PRP-009 PHASE 1 COMPLETE</promise>
```

---

### Phase 2: Streak Calculation & Multipliers

**Objective**: Implement core streak logic and reward multipliers.

#### Tasks
- [ ] **2.1** Create `src/data/streakTiers.ts` with tier definitions
- [ ] **2.2** Create `src/utils/streakMultipliers.ts` with `getStreakTier()` function
- [ ] **2.3** Implement `applyStreakMultiplier()` for XP and coins
- [ ] **2.4** Implement `checkStreak()` mutation in `convex/streaks.ts`
- [ ] **2.5** Add consecutive day detection logic
- [ ] **2.6** Add streak reset logic for missed days
- [ ] **2.7** Implement `logStreakHistory()` helper function
- [ ] **2.8** Create `getStreakStats()` query in `convex/streaks.ts`
- [ ] **2.9** Add validation to prevent backdating or time manipulation
- [ ] **2.10** Test streak calculation with various scenarios (same day, consecutive, missed)
- [ ] **2.11** Test multiplier application at different streak lengths
- [ ] **2.12** Create `src/hooks/useStreak.ts` React hook

#### Build Gate
```bash
npm run build
npm run test
```

#### Phase Completion
```
<promise>PRP-009 PHASE 2 COMPLETE</promise>
```

---

### Phase 3: Milestone System

**Objective**: Implement milestone detection and reward distribution.

#### Tasks
- [ ] **3.1** Create `src/data/milestones.ts` with milestone definitions
- [ ] **3.2** Implement `checkMilestone()` helper in `convex/streaks.ts`
- [ ] **3.3** Implement `awardMilestone()` helper function
- [ ] **3.4** Add milestone tracking to streak records (`milestonesClaimed`)
- [ ] **3.5** Create mutation to claim milestone rewards
- [ ] **3.6** Add milestone notifications/alerts
- [ ] **3.7** Create `src/components/MilestoneCard.tsx` component
- [ ] **3.8** Add milestone progress display to streak counter
- [ ] **3.9** Test milestone detection at 7, 30, 100 days
- [ ] **3.10** Test reward distribution (coins, XP, freezes)
- [ ] **3.11** Test milestone claim prevention (no double-claiming)
- [ ] **3.12** Add i18n translations for milestone names/descriptions

#### Build Gate
```bash
npm run build
npm run test
```

#### Phase Completion
```
<promise>PRP-009 PHASE 3 COMPLETE</promise>
```

---

### Phase 4: Streak Freeze Mechanics

**Objective**: Implement purchasable streak freeze items and grace period.

#### Tasks
- [ ] **4.1** Create `convex/streakFreezes.ts` with freeze mutations
- [ ] **4.2** Implement `purchaseStreakFreeze()` mutation
- [ ] **4.3** Add coin deduction logic with validation
- [ ] **4.4** Implement `useStreakFreeze()` mutation
- [ ] **4.5** Add automatic freeze usage when missing day
- [ ] **4.6** Implement manual freeze activation (optional feature)
- [ ] **4.7** Add grace period logic (24-hour recovery window)
- [ ] **4.8** Update `checkStreak()` to handle grace period
- [ ] **4.9** Create `src/components/StreakFreezeShop.tsx` component
- [ ] **4.10** Add freeze counter to UI
- [ ] **4.11** Test freeze purchase flow
- [ ] **4.12** Test automatic freeze usage
- [ ] **4.13** Test grace period expiration
- [ ] **4.14** Add freeze cost configuration (default: 500 coins)

#### Build Gate
```bash
npm run build
npm run test
```

#### Phase Completion
```
<promise>PRP-009 PHASE 4 COMPLETE</promise>
```

---

### Phase 5: UI Components & Integration

**Objective**: Build visual components and integrate into main app.

#### Tasks
- [ ] **5.1** Create `src/components/StreakCounter.tsx` for header display
- [ ] **5.2** Add flame icon and streak number
- [ ] **5.3** Add tier-based color styling
- [ ] **5.4** Create `src/components/StreakStats.tsx` full stats page
- [ ] **5.5** Add stat cards (current, longest, total days, freezes)
- [ ] **5.6** Create `src/components/StreakCalendar.tsx` for 30-day view
- [ ] **5.7** Add visual calendar grid with activity markers
- [ ] **5.8** Integrate `StreakCounter` into main app header
- [ ] **5.9** Add streak stats to user profile/dashboard
- [ ] **5.10** Create streak notification system (milestone reached, streak at risk)
- [ ] **5.11** Add streak multiplier display on reward screens
- [ ] **5.12** Update XP/coin earning functions to apply multipliers
- [ ] **5.13** Add animations for streak increases
- [ ] **5.14** Add confetti/celebration effect for milestones
- [ ] **5.15** Test responsive design on mobile/tablet
- [ ] **5.16** Add accessibility labels and keyboard navigation

#### Build Gate
```bash
npm run build
npm run dev
```

#### Phase Completion
```
<promise>PRP-009 PHASE 5 COMPLETE</promise>
```

---

### Phase 6: Testing & Anti-Cheat

**Objective**: Verify system integrity and prevent exploitation.

#### Tasks
- [ ] **6.1** Create `src/utils/streakValidator.ts` with validation functions
- [ ] **6.2** Add server-side timestamp validation (prevent backdating)
- [ ] **6.3** Implement rate limiting on streak updates (max 1 per day)
- [ ] **6.4** Add detection for suspicious activity patterns
- [ ] **6.5** Test timezone edge cases (UTC boundaries, DST transitions)
- [ ] **6.6** Test streak persistence across browser sessions
- [ ] **6.7** Test offline behavior and sync when reconnecting
- [ ] **6.8** Test concurrent session handling (multiple tabs/devices)
- [ ] **6.9** Verify streak maintains across user logout/login
- [ ] **6.10** Test freeze usage edge cases (multiple freezes, no freezes)
- [ ] **6.11** Test milestone reward distribution edge cases
- [ ] **6.12** Perform load testing with multiple users
- [ ] **6.13** Test error handling and recovery scenarios
- [ ] **6.14** Add monitoring/logging for streak events
- [ ] **6.15** Create admin tools for streak management (support tickets)
- [ ] **6.16** Document known limitations and edge cases

#### Build Gate
```bash
npm run build
npm run test
npm run lint
```

#### Phase Completion
```
<promise>PRP-009 PHASE 6 COMPLETE</promise>
```

---

## Final Verification

- [ ] All phase promises output (Phases 1-6)
- [ ] `npm build` passes
- [ ] `npm test` passes
- [ ] Integration testing completed
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] Streak tracking works correctly
- [ ] Multipliers apply properly to XP/coins
- [ ] Milestones award correctly
- [ ] Freezes can be purchased and used
- [ ] UI displays streak information clearly
- [ ] Anti-cheat validation works
- [ ] Changes committed with descriptive message

---

## Final Completion

When ALL of the above are complete:
```
<promise>PRP-009 COMPLETE</promise>
```

---

## Rollback Plan

```bash
# If issues discovered after deployment:

# 1. Disable streak multipliers (revert to 1.0x)
# Update streakMultipliers.ts to return 1.0 for all tiers

# 2. Disable milestone rewards
# Comment out awardMilestone() calls

# 3. Preserve streak data
# Data in Convex persists - can re-enable later

# 4. Full rollback
git revert HEAD~N  # revert commits from this PRP
npx convex deploy --prod  # redeploy previous schema
```

---

## Open Questions & Decisions

### Q1: Should streak freeze be automatic or manual?

**Options:**
- A) Automatic: System auto-uses freeze when user misses a day
- B) Manual: User must explicitly activate freeze before missing day
- C) Hybrid: Auto-use with option to disable in settings

**Recommendation:** Option C - user-friendly default with flexibility

### Q2: How strict should timezone handling be?

**Options:**
- A) Server UTC only: Simple but may penalize users in different timezones
- B) User's local timezone: More fair but complex
- C) Configurable timezone in settings

**Recommendation:** Option B with Option C for edge cases

### Q3: Should streaks transfer across device changes?

**Options:**
- A) Account-based: Streak tied to user account (requires auth)
- B) Device-based: Separate streaks per device
- C) Hybrid: Option to sync or keep separate

**Recommendation:** Option A - requires authentication system

### Q4: What happens to streak if user is inactive for months?

**Options:**
- A) Hard reset: Streak becomes 0, cannot recover
- B) Soft reset: Longest streak preserved, current resets to 0
- C) Dormant state: Streak frozen until user returns

**Recommendation:** Option B - preserves achievement while resetting current

---

## Notes

- Streak system encourages daily engagement without being punitive
- Grace period and freeze items reduce frustration from occasional misses
- Multipliers provide meaningful progression without breaking economy
- Milestones create clear goals and celebration moments
- Consider A/B testing different multiplier values to balance retention vs. economy
- Monitor average streak length to calibrate milestone difficulty
- Consider seasonal events with bonus multipliers (e.g., 2x XP weekend)

---

## References

- Duolingo streak system: https://blog.duolingo.com/streaks/
- Habitica habit tracking: https://habitica.com/
- Convex documentation: https://docs.convex.dev/
- Game retention mechanics: https://www.gamedeveloper.com/

---

## Changelog

| Date | Author | Changes |
|------|--------|---------|
| 2025-12-25 | Claude + Anton | Initial draft |

---
