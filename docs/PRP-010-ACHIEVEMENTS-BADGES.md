# PRP-010: Achievement and Badge System

**Status**: DRAFT
**Author**: Claude + Anton
**Date**: 2025-12-25
**Priority**: MEDIUM
**Estimated Effort**: 4 phases, ~40 tasks

---

## Executive Summary

This PRP introduces a comprehensive achievement and badge system for TypeBit8. Users will unlock 50+ achievements across multiple categories (speed, accuracy, consistency, milestones) with varying rarity tiers (Common, Rare, Epic, Legendary). Achievements will display with pixel art popup notifications and be showcased on user profiles. The system includes both public and secret achievements, all tracked via Convex backend.

---

## Problem Statement

### Current State

1. **No Achievement System**: Players have no goals beyond completing levels
2. **Limited Recognition**: No rewards for exceptional performance (speed, accuracy)
3. **No Streak Tracking**: Daily practice habits aren't encouraged or tracked
4. **Missing Progression Feedback**: Players don't see their improvement over time
5. **Reduced Engagement**: No long-term goals to keep players coming back

### Impact

| Issue | User Impact |
|-------|-------------|
| No achievements | Reduced motivation and sense of accomplishment |
| No streak tracking | Less daily engagement and habit formation |
| Missing milestones | Players don't recognize their progress |
| No rarity system | All accomplishments feel equally valuable |
| No showcase | Can't display achievements to others |

### Success Criteria

- [ ] 50+ unique achievements across 5+ categories
- [ ] 4-tier rarity system (Common, Rare, Epic, Legendary)
- [ ] Pixel art popup notifications when achievements unlock
- [ ] Achievement showcase on user profile
- [ ] Secret/hidden achievements for discovery
- [ ] Convex backend tracking all unlocked achievements
- [ ] Progress indicators for multi-step achievements
- [ ] Retroactive achievement grants for existing progress

---

## Achievement Categories

### 1. Speed Achievements (12 achievements)

| Achievement | Requirement | Rarity | Reward |
|-------------|-------------|--------|--------|
| **Keyboard Novice** | Reach 20 WPM | Common | 50 coins |
| **Speed Learner** | Reach 30 WPM | Common | 75 coins |
| **Typing Apprentice** | Reach 40 WPM | Common | 100 coins |
| **Skilled Typist** | Reach 50 WPM | Rare | 150 coins |
| **Speed Demon** | Reach 60 WPM | Rare | 200 coins |
| **Rapid Fire** | Reach 70 WPM | Rare | 250 coins |
| **Velocity Master** | Reach 80 WPM | Epic | 400 coins |
| **Lightning Fingers** | Reach 90 WPM | Epic | 500 coins |
| **Speed of Light** | Reach 100 WPM | Epic | 750 coins |
| **Supersonic** | Reach 120 WPM | Legendary | 1000 coins |
| **Hyperspeed** | Reach 140 WPM | Legendary | 1500 coins |
| **Ultimate Velocity** | Reach 160 WPM | Legendary | 2000 coins |

### 2. Accuracy Achievements (10 achievements)

| Achievement | Requirement | Rarity | Reward |
|-------------|-------------|--------|--------|
| **Eagle Eye** | 95% accuracy in any level | Common | 75 coins |
| **Precision Typer** | 97% accuracy in any level | Rare | 150 coins |
| **Perfect Form** | 99% accuracy in any level | Rare | 200 coins |
| **Flawless Victory** | 100% accuracy in any level | Epic | 500 coins |
| **Accuracy Streak** | 95%+ accuracy for 5 levels in a row | Rare | 250 coins |
| **Perfectionist** | 100% accuracy in 3 different levels | Epic | 750 coins |
| **Zero Mistakes** | Complete 10 levels with 100% accuracy | Epic | 1000 coins |
| **Master of Precision** | 100% accuracy in 25 levels | Legendary | 2000 coins |
| **Untouchable** | 100% accuracy in all levels 1-10 | Legendary | 2500 coins |
| **Pixel Perfect** (Secret) | 100% accuracy in all 30 levels | Legendary | 5000 coins |

### 3. Consistency Achievements (8 achievements)

| Achievement | Requirement | Rarity | Reward |
|-------------|-------------|--------|--------|
| **Daily Warrior** | Practice 2 days in a row | Common | 50 coins |
| **Week Long** | Practice 7 days in a row | Rare | 200 coins |
| **Two Weeks Strong** | Practice 14 days in a row | Epic | 500 coins |
| **Monthly Champion** | Practice 30 days in a row | Legendary | 1500 coins |
| **Century** | Practice 100 days total | Legendary | 2000 coins |
| **Marathon Typist** | Complete 50 lessons | Rare | 300 coins |
| **Dedication** | Complete 100 lessons | Epic | 750 coins |
| **Unstoppable** | Complete 250 lessons | Legendary | 2000 coins |

### 4. Milestone Achievements (12 achievements)

| Achievement | Requirement | Rarity | Reward |
|-------------|-------------|--------|--------|
| **First Steps** | Complete level 1 | Common | 25 coins |
| **Getting Started** | Complete level 5 | Common | 100 coins |
| **Halfway There** | Complete level 15 | Rare | 250 coins |
| **Almost There** | Complete level 25 | Epic | 500 coins |
| **Full Mastery** | Complete all 30 levels | Epic | 1000 coins |
| **Level Master** | Get 3 stars on any level | Common | 100 coins |
| **Star Collector** | Get 3 stars on 10 levels | Rare | 300 coins |
| **Perfect Run** | Get 3 stars on all levels 1-10 | Epic | 750 coins |
| **Total Domination** | Get 3 stars on all 30 levels | Legendary | 3000 coins |
| **Rich Typer** | Earn 1,000 total coins | Rare | 200 coins |
| **Coin Collector** | Earn 5,000 total coins | Epic | 500 coins |
| **Treasure Hunter** | Earn 10,000 total coins | Legendary | 1000 coins |

### 5. Combat Achievements (6 achievements)

| Achievement | Requirement | Rarity | Reward |
|-------------|-------------|--------|--------|
| **Boss Slayer** | Defeat your first boss | Common | 75 coins |
| **Boss Hunter** | Defeat 5 bosses | Rare | 200 coins |
| **Boss Destroyer** | Defeat 15 bosses | Epic | 500 coins |
| **Combo Starter** | Build a 10x combo | Common | 50 coins |
| **Combo Master** | Build a 25x combo | Rare | 200 coins |
| **Ultimate Combo** | Build a 50x combo | Epic | 750 coins |

### 6. Special Achievements (8+ achievements)

| Achievement | Requirement | Rarity | Reward |
|-------------|-------------|--------|--------|
| **Early Bird** (Secret) | Practice before 6 AM | Rare | 200 coins |
| **Night Owl** (Secret) | Practice after midnight | Rare | 200 coins |
| **Speed Run** | Complete any level in under 60 seconds | Rare | 250 coins |
| **Marathon Session** | Practice for 30+ minutes straight | Rare | 300 coins |
| **Social Butterfly** | Share 3 achievements | Common | 100 coins |
| **Welcome Aboard** | Create an account | Common | 50 coins |
| **Avatar Collector** | Unlock 5 different avatars | Rare | 200 coins |
| **Language Master** | Complete levels in 3 different languages | Epic | 500 coins |
| **The Discoverer** (Secret) | Find and unlock all secret achievements | Legendary | 5000 coins |

---

## Rarity Tiers

### Visual Design

Each rarity has distinct colors and visual effects:

| Rarity | Color | Border | Effect | % of Total |
|--------|-------|--------|--------|------------|
| **Common** | Gray `#9ca3af` | 2px solid | None | 30% (15) |
| **Rare** | Blue `#3b82f6` | 3px solid | Subtle glow | 35% (18) |
| **Epic** | Purple `#a855f7` | 4px solid | Animated glow | 25% (13) |
| **Legendary** | Gold `#ffd93d` | 5px solid | Particle effects | 10% (6) |

### Badge Design Template

All achievement badges follow this pixel art style:

```
32x32 or 64x64 pixel art icon
- Medal/trophy base shape
- Icon representing achievement type
- Rarity color as primary
- Dark outline (#1a1a2e)
- TypeBit8 color palette
```

---

## Phase 1: Data Schema & Backend

### 1.1 Convex Schema Updates

**Modify: `convex/schema.ts`**

Add achievements table:

```typescript
achievements: defineTable({
  id: v.string(), // Unique achievement ID (e.g., "speed-demon")
  category: v.string(), // "speed", "accuracy", "consistency", "milestone", "combat", "special"
  name: v.string(),
  description: v.string(),
  rarity: v.string(), // "common", "rare", "epic", "legendary"
  requirement: v.object({
    type: v.string(), // "wpm", "accuracy", "streak", "level_complete", etc.
    value: v.number(),
    operator: v.optional(v.string()), // "gte", "eq", "lte"
  }),
  reward: v.object({
    coins: v.number(),
    xp: v.optional(v.number()),
  }),
  isSecret: v.boolean(),
  iconUrl: v.string(), // Path to badge image
  order: v.number(), // Display order within category
})
.index("by_category", ["category"])
.index("by_id", ["id"]),

userAchievements: defineTable({
  userId: v.id("users"),
  achievementId: v.string(),
  unlockedAt: v.number(), // Timestamp
  progress: v.optional(v.number()), // For progressive achievements
  notificationShown: v.boolean(), // Track if popup was shown
})
.index("by_user", ["userId"])
.index("by_user_achievement", ["userId", "achievementId"]),
```

### 1.2 Achievement Definitions

**New file: `src/data/achievements.ts`**

```typescript
export interface Achievement {
  id: string;
  category: 'speed' | 'accuracy' | 'consistency' | 'milestone' | 'combat' | 'special';
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirement: {
    type: string;
    value: number;
    operator?: 'gte' | 'eq' | 'lte';
  };
  reward: {
    coins: number;
    xp?: number;
  };
  isSecret: boolean;
  iconUrl: string;
  order: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Speed Achievements
  {
    id: 'keyboard-novice',
    category: 'speed',
    name: 'Keyboard Novice',
    description: 'Reach 20 WPM',
    rarity: 'common',
    requirement: { type: 'wpm', value: 20, operator: 'gte' },
    reward: { coins: 50, xp: 25 },
    isSecret: false,
    iconUrl: '/achievements/keyboard-novice.png',
    order: 1,
  },
  {
    id: 'speed-demon',
    category: 'speed',
    name: 'Speed Demon',
    description: 'Reach 60 WPM',
    rarity: 'rare',
    requirement: { type: 'wpm', value: 60, operator: 'gte' },
    reward: { coins: 200, xp: 100 },
    isSecret: false,
    iconUrl: '/achievements/speed-demon.png',
    order: 5,
  },
  {
    id: 'speed-of-light',
    category: 'speed',
    name: 'Speed of Light',
    description: 'Reach 100 WPM',
    rarity: 'epic',
    requirement: { type: 'wpm', value: 100, operator: 'gte' },
    reward: { coins: 750, xp: 300 },
    isSecret: false,
    iconUrl: '/achievements/speed-of-light.png',
    order: 9,
  },

  // Accuracy Achievements
  {
    id: 'flawless-victory',
    category: 'accuracy',
    name: 'Flawless Victory',
    description: 'Complete a level with 100% accuracy',
    rarity: 'epic',
    requirement: { type: 'accuracy', value: 100, operator: 'eq' },
    reward: { coins: 500, xp: 200 },
    isSecret: false,
    iconUrl: '/achievements/flawless-victory.png',
    order: 4,
  },

  // Consistency Achievements
  {
    id: 'week-long',
    category: 'consistency',
    name: 'Week Long',
    description: 'Practice 7 days in a row',
    rarity: 'rare',
    requirement: { type: 'streak', value: 7, operator: 'gte' },
    reward: { coins: 200, xp: 100 },
    isSecret: false,
    iconUrl: '/achievements/week-long.png',
    order: 2,
  },

  // Secret Achievements
  {
    id: 'early-bird',
    category: 'special',
    name: 'Early Bird',
    description: 'Practice before 6 AM',
    rarity: 'rare',
    requirement: { type: 'time_of_day', value: 6, operator: 'lte' },
    reward: { coins: 200, xp: 100 },
    isSecret: true,
    iconUrl: '/achievements/early-bird.png',
    order: 1,
  },

  // ... (additional 44+ achievements)
];
```

### 1.3 Convex Achievement Functions

**New file: `convex/achievements.ts`**

```typescript
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all achievements (hide secret ones until unlocked)
export const getAchievements = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    const achievements = await ctx.db.query("achievements").collect();

    if (!identity) {
      // Guest: show only non-secret achievements
      return achievements.filter(a => !a.isSecret);
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return achievements.filter(a => !a.isSecret);

    const unlocked = await ctx.db
      .query("userAchievements")
      .withIndex("by_user", q => q.eq("userId", user._id))
      .collect();

    const unlockedIds = new Set(unlocked.map(u => u.achievementId));

    // Show secret achievements only if unlocked
    return achievements.filter(a => !a.isSecret || unlockedIds.has(a.id));
  },
});

// Get user's unlocked achievements
export const getUserAchievements = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    return await ctx.db
      .query("userAchievements")
      .withIndex("by_user", q => q.eq("userId", user._id))
      .collect();
  },
});

// Unlock achievement
export const unlockAchievement = mutation({
  args: {
    achievementId: v.string(),
    autoCheck: v.optional(v.boolean()), // If true, verify requirement first
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    // Check if already unlocked
    const existing = await ctx.db
      .query("userAchievements")
      .withIndex("by_user_achievement", q =>
        q.eq("userId", user._id).eq("achievementId", args.achievementId)
      )
      .unique();

    if (existing) return { alreadyUnlocked: true };

    const achievement = await ctx.db
      .query("achievements")
      .withIndex("by_id", q => q.eq("id", args.achievementId))
      .unique();

    if (!achievement) throw new Error("Achievement not found");

    // Create unlock record
    await ctx.db.insert("userAchievements", {
      userId: user._id,
      achievementId: args.achievementId,
      unlockedAt: Date.now(),
      notificationShown: false,
    });

    // Grant rewards
    const currentCoins = user.coins || 0;
    await ctx.db.patch(user._id, {
      coins: currentCoins + achievement.reward.coins,
    });

    return {
      unlocked: true,
      achievement,
      reward: achievement.reward,
    };
  },
});

// Check and unlock achievements based on current stats
export const checkAchievements = mutation({
  args: {
    wpm: v.optional(v.number()),
    accuracy: v.optional(v.number()),
    streak: v.optional(v.number()),
    levelsCompleted: v.optional(v.number()),
    totalLessons: v.optional(v.number()),
    bossesDefeated: v.optional(v.number()),
    maxCombo: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { newAchievements: [] };

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return { newAchievements: [] };

    const achievements = await ctx.db.query("achievements").collect();
    const unlocked = await ctx.db
      .query("userAchievements")
      .withIndex("by_user", q => q.eq("userId", user._id))
      .collect();

    const unlockedIds = new Set(unlocked.map(u => u.achievementId));
    const newUnlocks = [];

    for (const achievement of achievements) {
      if (unlockedIds.has(achievement.id)) continue;

      let shouldUnlock = false;
      const { type, value, operator = 'gte' } = achievement.requirement;

      const checkValue = (userValue: number | undefined) => {
        if (userValue === undefined) return false;
        if (operator === 'gte') return userValue >= value;
        if (operator === 'eq') return userValue === value;
        if (operator === 'lte') return userValue <= value;
        return false;
      };

      switch (type) {
        case 'wpm':
          shouldUnlock = checkValue(args.wpm);
          break;
        case 'accuracy':
          shouldUnlock = checkValue(args.accuracy);
          break;
        case 'streak':
          shouldUnlock = checkValue(args.streak);
          break;
        case 'level_complete':
          shouldUnlock = checkValue(args.levelsCompleted);
          break;
        case 'total_lessons':
          shouldUnlock = checkValue(args.totalLessons);
          break;
        case 'bosses_defeated':
          shouldUnlock = checkValue(args.bossesDefeated);
          break;
        case 'max_combo':
          shouldUnlock = checkValue(args.maxCombo);
          break;
      }

      if (shouldUnlock) {
        await ctx.db.insert("userAchievements", {
          userId: user._id,
          achievementId: achievement.id,
          unlockedAt: Date.now(),
          notificationShown: false,
        });

        const currentCoins = user.coins || 0;
        await ctx.db.patch(user._id, {
          coins: currentCoins + achievement.reward.coins,
        });

        newUnlocks.push(achievement);
      }
    }

    return { newAchievements: newUnlocks };
  },
});

// Mark achievement notification as shown
export const markNotificationShown = mutation({
  args: { achievementId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return;

    const userAchievement = await ctx.db
      .query("userAchievements")
      .withIndex("by_user_achievement", q =>
        q.eq("userId", user._id).eq("achievementId", args.achievementId)
      )
      .unique();

    if (userAchievement) {
      await ctx.db.patch(userAchievement._id, { notificationShown: true });
    }
  },
});

// Get achievement progress stats
export const getAchievementStats = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return null;

    const allAchievements = await ctx.db.query("achievements").collect();
    const unlocked = await ctx.db
      .query("userAchievements")
      .withIndex("by_user", q => q.eq("userId", user._id))
      .collect();

    const byRarity = {
      common: { total: 0, unlocked: 0 },
      rare: { total: 0, unlocked: 0 },
      epic: { total: 0, unlocked: 0 },
      legendary: { total: 0, unlocked: 0 },
    };

    allAchievements.forEach(a => {
      byRarity[a.rarity as keyof typeof byRarity].total++;
    });

    const unlockedIds = new Set(unlocked.map(u => u.achievementId));
    allAchievements.forEach(a => {
      if (unlockedIds.has(a.id)) {
        byRarity[a.rarity as keyof typeof byRarity].unlocked++;
      }
    });

    return {
      total: allAchievements.length,
      unlocked: unlocked.length,
      percentage: Math.round((unlocked.length / allAchievements.length) * 100),
      byRarity,
    };
  },
});
```

---

## Phase 2: UI Components

### 2.1 Achievement Notification Popup

**New file: `src/components/AchievementNotification.tsx`**

```typescript
import { useEffect, useState } from 'react';
import type { Achievement } from '../data/achievements';

interface AchievementNotificationProps {
  achievement: Achievement | null;
  onClose: () => void;
}

const RARITY_COLORS = {
  common: '#9ca3af',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#ffd93d',
};

export function AchievementNotification({
  achievement,
  onClose
}: AchievementNotificationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300); // Wait for animation
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  if (!achievement) return null;

  const rarityColor = RARITY_COLORS[achievement.rarity];

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
      style={{
        width: '320px',
        background: '#1a1a2e',
        border: `${achievement.rarity === 'legendary' ? 5 : achievement.rarity === 'epic' ? 4 : 3}px solid ${rarityColor}`,
        padding: '16px',
        boxShadow: `0 0 ${achievement.rarity === 'legendary' ? 20 : 10}px ${rarityColor}`,
      }}
    >
      <div className="flex items-start gap-3">
        {/* Badge Icon */}
        <div
          style={{
            width: 64,
            height: 64,
            border: `2px solid ${rarityColor}`,
            background: '#0a0a14',
            padding: '4px',
            imageRendering: 'pixelated',
          }}
        >
          <img
            src={achievement.iconUrl}
            alt={achievement.name}
            style={{
              width: '100%',
              height: '100%',
              imageRendering: 'pixelated',
            }}
          />
        </div>

        {/* Text Content */}
        <div className="flex-1">
          <p
            style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '8px',
              color: rarityColor,
              marginBottom: '8px',
              textTransform: 'uppercase',
            }}
          >
            {achievement.rarity} Achievement
          </p>
          <h3
            style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '10px',
              color: '#eef5db',
              marginBottom: '8px',
              lineHeight: '1.4',
            }}
          >
            {achievement.name}
          </h3>
          <p
            style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '6px',
              color: '#9ca3af',
              marginBottom: '8px',
              lineHeight: '1.5',
            }}
          >
            {achievement.description}
          </p>
          <div
            style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '8px',
              color: '#ffd93d',
            }}
          >
            +{achievement.reward.coins} COINS
          </div>
        </div>
      </div>

      {/* Particle effects for Legendary */}
      {achievement.rarity === 'legendary' && (
        <div className="achievement-particles" />
      )}
    </div>
  );
}
```

### 2.2 Achievement Grid Display

**New file: `src/components/AchievementGrid.tsx`**

```typescript
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Achievement } from '../data/achievements';

const RARITY_COLORS = {
  common: '#9ca3af',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#ffd93d',
};

interface AchievementCardProps {
  achievement: Achievement;
  unlocked: boolean;
  unlockedAt?: number;
}

function AchievementCard({ achievement, unlocked, unlockedAt }: AchievementCardProps) {
  const rarityColor = RARITY_COLORS[achievement.rarity];

  return (
    <div
      className={`p-3 transition-all ${unlocked ? '' : 'opacity-50 grayscale'}`}
      style={{
        background: '#1a1a2e',
        border: `2px solid ${rarityColor}`,
      }}
    >
      <div className="flex flex-col items-center gap-2">
        {/* Badge */}
        <div
          style={{
            width: 48,
            height: 48,
            border: `2px solid ${rarityColor}`,
            background: '#0a0a14',
            padding: '2px',
            imageRendering: 'pixelated',
          }}
        >
          <img
            src={achievement.iconUrl}
            alt={achievement.name}
            style={{
              width: '100%',
              height: '100%',
              imageRendering: 'pixelated',
              filter: unlocked ? 'none' : 'brightness(0.3)',
            }}
          />
        </div>

        {/* Name */}
        <h4
          style={{
            fontFamily: "'Press Start 2P'",
            fontSize: '6px',
            color: unlocked ? '#eef5db' : '#4a4a6e',
            textAlign: 'center',
            lineHeight: '1.4',
          }}
        >
          {achievement.isSecret && !unlocked ? '???' : achievement.name.toUpperCase()}
        </h4>

        {/* Description */}
        {(!achievement.isSecret || unlocked) && (
          <p
            style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '5px',
              color: '#9ca3af',
              textAlign: 'center',
              lineHeight: '1.4',
            }}
          >
            {achievement.description}
          </p>
        )}

        {/* Rarity */}
        <span
          style={{
            fontFamily: "'Press Start 2P'",
            fontSize: '5px',
            color: rarityColor,
            textTransform: 'uppercase',
          }}
        >
          {achievement.rarity}
        </span>

        {/* Unlock Date */}
        {unlocked && unlockedAt && (
          <span
            style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '4px',
              color: '#6b7280',
            }}
          >
            {new Date(unlockedAt).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}

export function AchievementGrid() {
  const achievements = useQuery(api.achievements.getAchievements);
  const userAchievements = useQuery(api.achievements.getUserAchievements);
  const stats = useQuery(api.achievements.getAchievementStats);

  if (!achievements) return <div>Loading...</div>;

  const unlockedMap = new Map(
    userAchievements?.map(ua => [ua.achievementId, ua.unlockedAt]) || []
  );

  const categories = [
    { id: 'speed', name: 'Speed' },
    { id: 'accuracy', name: 'Accuracy' },
    { id: 'consistency', name: 'Consistency' },
    { id: 'milestone', name: 'Milestones' },
    { id: 'combat', name: 'Combat' },
    { id: 'special', name: 'Special' },
  ];

  return (
    <div className="p-6">
      {/* Stats Header */}
      {stats && (
        <div className="mb-8 p-4" style={{ background: '#1a1a2e', border: '3px solid #ffd93d' }}>
          <h2
            style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '12px',
              color: '#ffd93d',
              marginBottom: '16px',
            }}
          >
            ACHIEVEMENT PROGRESS
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p style={{ fontFamily: "'Press Start 2P'", fontSize: '16px', color: '#eef5db' }}>
                {stats.unlocked}/{stats.total}
              </p>
              <p style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: '#9ca3af' }}>
                TOTAL
              </p>
            </div>
            {Object.entries(stats.byRarity).map(([rarity, data]) => (
              <div key={rarity} className="text-center">
                <p
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '12px',
                    color: RARITY_COLORS[rarity as keyof typeof RARITY_COLORS],
                  }}
                >
                  {data.unlocked}/{data.total}
                </p>
                <p
                  style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '6px',
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                  }}
                >
                  {rarity}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievement Grid by Category */}
      {categories.map(category => {
        const categoryAchievements = achievements.filter(a => a.category === category.id);
        if (categoryAchievements.length === 0) return null;

        return (
          <div key={category.id} className="mb-8">
            <h3
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '10px',
                color: '#3bceac',
                marginBottom: '16px',
              }}
            >
              {category.name.toUpperCase()}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {categoryAchievements
                .sort((a, b) => a.order - b.order)
                .map(achievement => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    unlocked={unlockedMap.has(achievement.id)}
                    unlockedAt={unlockedMap.get(achievement.id)}
                  />
                ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

### 2.3 Profile Achievement Showcase

**New file: `src/components/ProfileShowcase.tsx`**

```typescript
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export function ProfileShowcase() {
  const userAchievements = useQuery(api.achievements.getUserAchievements);
  const achievements = useQuery(api.achievements.getAchievements);

  if (!userAchievements || !achievements) return null;

  const unlockedIds = new Set(userAchievements.map(ua => ua.achievementId));

  // Show latest 3 legendary/epic achievements
  const showcase = achievements
    .filter(a => unlockedIds.has(a.id))
    .filter(a => a.rarity === 'legendary' || a.rarity === 'epic')
    .sort((a, b) => {
      const aTime = userAchievements.find(ua => ua.achievementId === a.id)?.unlockedAt || 0;
      const bTime = userAchievements.find(ua => ua.achievementId === b.id)?.unlockedAt || 0;
      return bTime - aTime;
    })
    .slice(0, 3);

  if (showcase.length === 0) return null;

  return (
    <div className="flex gap-3">
      {showcase.map(achievement => (
        <div
          key={achievement.id}
          style={{
            width: 48,
            height: 48,
            border: `2px solid ${achievement.rarity === 'legendary' ? '#ffd93d' : '#a855f7'}`,
            background: '#1a1a2e',
            padding: '2px',
            imageRendering: 'pixelated',
          }}
          title={achievement.name}
        >
          <img
            src={achievement.iconUrl}
            alt={achievement.name}
            style={{
              width: '100%',
              height: '100%',
              imageRendering: 'pixelated',
            }}
          />
        </div>
      ))}
    </div>
  );
}
```

---

## Phase 3: Achievement Icons

### 3.1 Icon Generation

Use the same Gemini 2.5 Flash Image API approach as avatars:

**New file: `scripts/generate-achievement-icons.ts`**

Similar structure to avatar generation script, but for 50+ achievement badges.

Each icon should be:
- 64x64 pixel art
- Themed to achievement type
- Uses rarity color as primary
- Medal/trophy base design
- TypeBit8 color palette

### 3.2 Icon Storage

```
public/
└── achievements/
    ├── keyboard-novice.png
    ├── speed-demon.png
    ├── flawless-victory.png
    ├── week-long.png
    └── ... (50+ more)
```

---

## Phase 4: Integration & Tracking

### 4.1 Auto-Check on Level Complete

**Modify: `src/components/Quiz.tsx` or lesson complete handler**

```typescript
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

// After level completion:
const checkAchievements = useMutation(api.achievements.checkAchievements);

const handleLevelComplete = async (results: LessonResults) => {
  const newAchievements = await checkAchievements({
    wpm: results.wpm,
    accuracy: results.accuracy,
    levelsCompleted: gameState.levelsCompleted + 1,
    // ... other stats
  });

  if (newAchievements.newAchievements.length > 0) {
    // Show notification for each new achievement
    newAchievements.newAchievements.forEach(achievement => {
      setCurrentAchievement(achievement);
    });
  }
};
```

### 4.2 Streak Tracking

**New file: `convex/streaks.ts`**

```typescript
export const updateStreak = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return;

    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const lastPractice = user.lastPracticeDate || 0;
    const daysSince = Math.floor((now - lastPractice) / oneDayMs);

    let newStreak = 1;
    if (daysSince === 0) {
      // Same day, don't increment
      newStreak = user.currentStreak || 1;
    } else if (daysSince === 1) {
      // Next day, increment streak
      newStreak = (user.currentStreak || 0) + 1;
    } else {
      // Streak broken, reset to 1
      newStreak = 1;
    }

    await ctx.db.patch(user._id, {
      currentStreak: newStreak,
      maxStreak: Math.max(user.maxStreak || 0, newStreak),
      lastPracticeDate: now,
    });

    return { currentStreak: newStreak };
  },
});
```

### 4.3 Add to User Schema

**Modify: `convex/schema.ts`**

```typescript
users: defineTable({
  // ... existing fields
  currentStreak: v.optional(v.number()),
  maxStreak: v.optional(v.number()),
  lastPracticeDate: v.optional(v.number()),
  totalLessons: v.optional(v.number()),
  bossesDefeated: v.optional(v.number()),
  maxCombo: v.optional(v.number()),
})
```

### 4.4 Achievement Page Route

**Modify: `src/App.tsx`**

Add achievements page route:

```typescript
<Route path="/achievements" element={<AchievementGrid />} />
```

Add link to header navigation.

---

## File Structure (New/Modified)

```
typingquest/
├── scripts/
│   └── generate-achievement-icons.ts  (new) - Generate badge icons
├── public/
│   └── achievements/                  (new) - Achievement badge images
│       ├── keyboard-novice.png
│       ├── speed-demon.png
│       └── ... (50+ icons)
├── src/
│   ├── data/
│   │   └── achievements.ts            (new) - Achievement definitions
│   ├── components/
│   │   ├── AchievementNotification.tsx (new) - Popup notification
│   │   ├── AchievementGrid.tsx        (new) - Full achievement page
│   │   ├── ProfileShowcase.tsx        (new) - Profile badges
│   │   ├── Quiz.tsx                   (modify) - Auto-check on complete
│   │   └── LessonView.tsx             (modify) - Track stats
│   └── App.tsx                        (modify) - Add achievements route
└── convex/
    ├── schema.ts                      (modify) - Add achievement tables
    ├── achievements.ts                (new) - Achievement queries/mutations
    └── streaks.ts                     (new) - Streak tracking
```

---

## Implementation Order

1. **Phase 1.1-1.2** - Define achievement data structure and schema
2. **Phase 1.3** - Implement Convex backend functions
3. **Phase 3** - Generate achievement icons (can be done in parallel)
4. **Phase 2.1** - Build notification popup component
5. **Phase 2.2** - Build achievement grid display
6. **Phase 4.1** - Integrate auto-checking on level complete
7. **Phase 4.2-4.3** - Implement streak tracking
8. **Phase 2.3** - Add profile showcase
9. **Phase 4.4** - Add achievements page route
10. **Testing** - Test all achievement unlock conditions
11. **Retroactive** - Script to grant achievements to existing users

---

## Notes

- **Retroactive Unlocks**: Create a script to check all existing user stats and grant appropriate achievements
- **Rate Limiting**: Avoid spamming notifications if multiple achievements unlock at once (queue them)
- **Secret Achievements**: Don't show names/descriptions until unlocked
- **Progress Bars**: For multi-step achievements (e.g., "Complete 50 lessons"), show progress
- **Social Sharing**: Allow sharing achievement unlocks to social media
- **Leaderboards**: Consider achievement-based leaderboards (most achievements, fastest to 100% completion)
- **Seasonal Events**: Plan for limited-time achievements during holidays
- **Balance**: Ensure achievement difficulty is balanced - not too easy or impossibly hard
- **Analytics**: Track which achievements are unlocked most/least to adjust difficulty
- **Localization**: Achievement names and descriptions need translation for all supported languages
