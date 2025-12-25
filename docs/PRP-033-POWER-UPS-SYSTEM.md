# PRP-033: Power-Ups System Implementation

**Status**: DRAFT
**Author**: Claude + Anton
**Date**: 2025-12-26
**Priority**: MEDIUM
**Estimated Effort**: 3 phases, ~25 tasks

---

## Executive Summary

This PRP implements the power-ups system, allowing users to activate consumable items purchased from the shop. Power-ups provide temporary gameplay bonuses like XP boosts, streak protection, hints, and coin multipliers. The system tracks active power-ups, their durations, and handles automatic expiration.

---

## Problem Statement

### Current State

1. **Shop sells power-ups** but they cannot be used
2. **Users purchase consumables** that sit unused in inventory
3. **No activation UI** or mechanism to consume power-ups
4. **No effect system** to apply bonuses during gameplay

### Success Criteria

- [ ] Users can activate power-ups from inventory
- [ ] Active power-ups display in UI with remaining time/uses
- [ ] XP Boost doubles XP earned during lessons
- [ ] Streak Freeze protects daily streak once
- [ ] Hint Token reveals next character during typing
- [ ] Coin Magnet doubles coins for duration
- [ ] Power-ups expire correctly (time-based or use-based)
- [ ] Backend validates all power-up effects

---

## Proposed Solution

### Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│  POWER-UPS SYSTEM                                                       │
│                                                                         │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐              │
│  │ Inventory    │───▶│ Activate     │───▶│ Active       │              │
│  │ (Quantity)   │    │ Power-up     │    │ Power-ups    │              │
│  └──────────────┘    └──────────────┘    └──────┬───────┘              │
│                                                 │                       │
│         ┌───────────────────────────────────────┘                       │
│         ▼                                                               │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Effect Application                                               │   │
│  │                                                                  │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐│   │
│  │  │ XP Boost    │ │ Streak      │ │ Hint Token  │ │ Coin Magnet ││   │
│  │  │ 2x XP       │ │ Freeze      │ │ Reveal char │ │ 2x Coins    ││   │
│  │  │ Duration:1h │ │ Uses: 1     │ │ Uses: 1     │ │ Duration:1h ││   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘│   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Power-Up Definitions

### 1. XP Boost 2x (100 coins)

- **Type**: Duration-based
- **Duration**: 1 hour
- **Effect**: Doubles all XP earned from lessons
- **Stackable**: No (extends duration if activated while active)
- **UI**: Timer showing remaining time

### 2. Streak Freeze (75 coins)

- **Type**: Use-based (automatic)
- **Uses**: 1
- **Effect**: Prevents streak reset if user misses a day
- **Trigger**: Automatically consumed when streak would break
- **UI**: Shield icon on streak display

### 3. Hint Token (25 coins)

- **Type**: Use-based (manual)
- **Uses**: 1 per activation
- **Effect**: Reveals the next character to type
- **Trigger**: User presses hint button during lesson
- **UI**: Hint button with quantity badge

### 4. Coin Magnet (150 coins)

- **Type**: Duration-based
- **Duration**: 1 hour
- **Effect**: Doubles all coins earned
- **Stackable**: No (extends duration if activated while active)
- **UI**: Timer showing remaining time

---

## Database Schema

### Active Power-Ups Table

**Modify: `convex/schema.ts`**

```typescript
// NEW: Active Power-ups (time-based effects)
activePowerUps: defineTable({
  clerkId: v.string(),
  powerUpId: v.string(),        // "xp-boost-2x", "coin-magnet"
  activatedAt: v.number(),       // Timestamp
  expiresAt: v.number(),         // Timestamp
  multiplier: v.number(),        // Effect multiplier (2 for 2x)
})
  .index("by_clerk_id", ["clerkId"])
  .index("by_expiry", ["expiresAt"]),

// NEW: Streak Freeze Status
streakProtection: defineTable({
  clerkId: v.string(),
  isProtected: v.boolean(),      // Has active freeze
  protectedUntil: v.string(),    // Date string (YYYY-MM-DD)
})
  .index("by_clerk_id", ["clerkId"]),
```

---

## Implementation

### Phase 1: Backend - Activation & Effect System

#### 1.1 Power-Up Activation Mutation

**New file: `convex/powerups.ts`**

```typescript
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Power-up configurations
const POWER_UP_CONFIG = {
  'xp-boost-2x': {
    type: 'duration',
    durationMs: 60 * 60 * 1000, // 1 hour
    multiplier: 2,
    effect: 'xp_multiplier',
  },
  'coin-magnet': {
    type: 'duration',
    durationMs: 60 * 60 * 1000, // 1 hour
    multiplier: 2,
    effect: 'coin_multiplier',
  },
  'streak-freeze': {
    type: 'protection',
    uses: 1,
    effect: 'streak_protection',
  },
  'hint-token': {
    type: 'consumable',
    uses: 1,
    effect: 'reveal_hint',
  },
};

// Activate a power-up
export const activatePowerUp = mutation({
  args: {
    clerkId: v.string(),
    powerUpId: v.string(),
  },
  handler: async (ctx, args) => {
    const config = POWER_UP_CONFIG[args.powerUpId as keyof typeof POWER_UP_CONFIG];
    if (!config) {
      return { success: false, reason: "Invalid power-up" };
    }

    // Check inventory
    const inventoryItem = await ctx.db
      .query("inventory")
      .withIndex("by_clerk_item", (q) =>
        q.eq("clerkId", args.clerkId).eq("itemId", args.powerUpId)
      )
      .first();

    if (!inventoryItem || inventoryItem.quantity <= 0) {
      return { success: false, reason: "Power-up not owned" };
    }

    const now = Date.now();

    // Handle duration-based power-ups
    if (config.type === 'duration') {
      // Check if already active
      const existing = await ctx.db
        .query("activePowerUps")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
        .collect();

      const activeOfType = existing.find(
        (p) => p.powerUpId === args.powerUpId && p.expiresAt > now
      );

      if (activeOfType) {
        // Extend duration instead of stacking
        await ctx.db.patch(activeOfType._id, {
          expiresAt: activeOfType.expiresAt + config.durationMs,
        });
      } else {
        // Create new active power-up
        await ctx.db.insert("activePowerUps", {
          clerkId: args.clerkId,
          powerUpId: args.powerUpId,
          activatedAt: now,
          expiresAt: now + config.durationMs,
          multiplier: config.multiplier,
        });
      }
    }

    // Handle streak freeze
    if (config.type === 'protection') {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

      const existing = await ctx.db
        .query("streakProtection")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          isProtected: true,
          protectedUntil: tomorrow,
        });
      } else {
        await ctx.db.insert("streakProtection", {
          clerkId: args.clerkId,
          isProtected: true,
          protectedUntil: tomorrow,
        });
      }
    }

    // Consume from inventory
    if (inventoryItem.quantity === 1) {
      await ctx.db.delete(inventoryItem._id);
    } else {
      await ctx.db.patch(inventoryItem._id, {
        quantity: inventoryItem.quantity - 1,
      });
    }

    return {
      success: true,
      powerUpId: args.powerUpId,
      effect: config.effect,
      expiresAt: config.type === 'duration' ? now + config.durationMs : null,
    };
  },
});

// Get active power-ups for user
export const getActivePowerUps = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const now = Date.now();

    const activePowerUps = await ctx.db
      .query("activePowerUps")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .collect();

    // Filter expired ones
    const active = activePowerUps.filter((p) => p.expiresAt > now);

    // Get streak protection status
    const streakProtection = await ctx.db
      .query("streakProtection")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    return {
      activePowerUps: active,
      streakProtected: streakProtection?.isProtected ?? false,
    };
  },
});

// Get current multipliers (for XP/coin calculations)
export const getActiveMultipliers = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const now = Date.now();

    const activePowerUps = await ctx.db
      .query("activePowerUps")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .collect();

    const active = activePowerUps.filter((p) => p.expiresAt > now);

    let xpMultiplier = 1;
    let coinMultiplier = 1;

    for (const powerUp of active) {
      if (powerUp.powerUpId === 'xp-boost-2x') {
        xpMultiplier = Math.max(xpMultiplier, powerUp.multiplier);
      }
      if (powerUp.powerUpId === 'coin-magnet') {
        coinMultiplier = Math.max(coinMultiplier, powerUp.multiplier);
      }
    }

    return { xpMultiplier, coinMultiplier };
  },
});

// Use hint token (manual activation during lesson)
export const useHintToken = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const inventoryItem = await ctx.db
      .query("inventory")
      .withIndex("by_clerk_item", (q) =>
        q.eq("clerkId", args.clerkId).eq("itemId", "hint-token")
      )
      .first();

    if (!inventoryItem || inventoryItem.quantity <= 0) {
      return { success: false, reason: "No hint tokens available" };
    }

    // Consume one hint token
    if (inventoryItem.quantity === 1) {
      await ctx.db.delete(inventoryItem._id);
    } else {
      await ctx.db.patch(inventoryItem._id, {
        quantity: inventoryItem.quantity - 1,
      });
    }

    return { success: true, remainingHints: inventoryItem.quantity - 1 };
  },
});

// Check and consume streak freeze (called by streak system)
export const consumeStreakFreeze = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const protection = await ctx.db
      .query("streakProtection")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!protection || !protection.isProtected) {
      return { success: false, wasProtected: false };
    }

    // Consume the protection
    await ctx.db.patch(protection._id, {
      isProtected: false,
    });

    return { success: true, wasProtected: true };
  },
});

// Cleanup expired power-ups (can be run periodically)
export const cleanupExpiredPowerUps = mutation({
  handler: async (ctx) => {
    const now = Date.now();

    const expired = await ctx.db
      .query("activePowerUps")
      .withIndex("by_expiry", (q) => q.lt("expiresAt", now))
      .collect();

    for (const powerUp of expired) {
      await ctx.db.delete(powerUp._id);
    }

    return { cleaned: expired.length };
  },
});
```

#### 1.2 Modify Coin/XP Award Logic

**Modify: `convex/coins.ts` - awardCoins mutation**

```typescript
export const awardCoins = mutation({
  args: {
    clerkId: v.string(),
    amount: v.number(),
    source: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Get active multipliers
    const multipliers = await ctx.runQuery(api.powerups.getActiveMultipliers, {
      clerkId: args.clerkId,
    });

    // Apply coin multiplier
    const finalAmount = args.amount * multipliers.coinMultiplier;

    // ... rest of coin award logic with finalAmount
  },
});
```

**Modify XP award logic similarly**

---

### Phase 2: Frontend - Activation UI

#### 2.1 Active Power-Ups Display

**New file: `src/components/ActivePowerUps.tsx`**

```typescript
import { useQuery } from 'convex/react';
import { useAuth } from '@clerk/clerk-react';
import { api } from '../../convex/_generated/api';
import { useEffect, useState } from 'react';

export function ActivePowerUps() {
  const { userId } = useAuth();
  const activePowerUps = useQuery(
    api.powerups.getActivePowerUps,
    userId ? { clerkId: userId } : 'skip'
  );

  if (!activePowerUps?.activePowerUps.length) return null;

  return (
    <div className="active-powerups flex gap-2">
      {activePowerUps.activePowerUps.map((powerUp) => (
        <PowerUpBadge key={powerUp._id} powerUp={powerUp} />
      ))}
      {activePowerUps.streakProtected && (
        <div className="powerup-badge streak-freeze">
          🛡️ Streak Protected
        </div>
      )}
    </div>
  );
}

function PowerUpBadge({ powerUp }: { powerUp: any }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const remaining = powerUp.expiresAt - Date.now();
      if (remaining <= 0) {
        setTimeLeft('Expired');
        return;
      }
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [powerUp.expiresAt]);

  const icons: Record<string, string> = {
    'xp-boost-2x': '⚡',
    'coin-magnet': '🧲',
  };

  return (
    <div className="powerup-badge pixel-box px-3 py-1">
      <span>{icons[powerUp.powerUpId] || '✨'}</span>
      <span className="text-xs ml-2">{timeLeft}</span>
    </div>
  );
}
```

#### 2.2 Inventory Power-Up Activation

**New file: `src/components/PowerUpInventory.tsx`**

```typescript
import { useQuery, useMutation } from 'convex/react';
import { useAuth } from '@clerk/clerk-react';
import { api } from '../../convex/_generated/api';

const POWER_UP_INFO = {
  'xp-boost-2x': {
    name: '2x XP Boost',
    icon: '⚡',
    description: 'Double XP for 1 hour',
  },
  'coin-magnet': {
    name: 'Coin Magnet',
    icon: '🧲',
    description: 'Double coins for 1 hour',
  },
  'streak-freeze': {
    name: 'Streak Freeze',
    icon: '🛡️',
    description: 'Protects your streak once',
  },
  'hint-token': {
    name: 'Hint Token',
    icon: '💡',
    description: 'Reveals next character',
  },
};

export function PowerUpInventory() {
  const { userId } = useAuth();
  const inventory = useQuery(
    api.shop.getInventory,
    userId ? { clerkId: userId } : 'skip'
  );
  const activatePowerUp = useMutation(api.powerups.activatePowerUp);

  const powerUps = inventory?.filter((item) =>
    Object.keys(POWER_UP_INFO).includes(item.itemId)
  ) || [];

  if (powerUps.length === 0) return null;

  const handleActivate = async (powerUpId: string) => {
    if (!userId) return;
    const result = await activatePowerUp({ clerkId: userId, powerUpId });
    if (result.success) {
      // Show success toast
    }
  };

  return (
    <div className="powerup-inventory pixel-box p-4">
      <h3 className="text-sm mb-4" style={{ fontFamily: "'Press Start 2P'" }}>
        POWER-UPS
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {powerUps.map((item) => {
          const info = POWER_UP_INFO[item.itemId as keyof typeof POWER_UP_INFO];
          return (
            <button
              key={item.itemId}
              onClick={() => handleActivate(item.itemId)}
              className="powerup-item pixel-box p-3 text-left hover:border-yellow-400"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{info.icon}</span>
                <div>
                  <div className="text-xs font-bold">{info.name}</div>
                  <div className="text-xs text-gray-400">x{item.quantity}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

#### 2.3 Hint Button in Typing Area

**Modify: `src/components/TypingArea.tsx`**

```typescript
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

// Inside component:
const inventory = useQuery(api.shop.getInventory, ...);
const useHint = useMutation(api.powerups.useHintToken);

const hintTokens = inventory?.find((i) => i.itemId === 'hint-token')?.quantity || 0;
const [showHint, setShowHint] = useState(false);

const handleUseHint = async () => {
  const result = await useHint({ clerkId: userId });
  if (result.success) {
    setShowHint(true);
    setTimeout(() => setShowHint(false), 2000); // Show for 2 seconds
  }
};

// In render:
{hintTokens > 0 && (
  <button onClick={handleUseHint} className="hint-button pixel-btn">
    💡 HINT ({hintTokens})
  </button>
)}

{showHint && (
  <div className="hint-display">
    Next: <span className="highlight">{text[currentIndex]}</span>
  </div>
)}
```

---

### Phase 3: Integration

#### 3.1 Streak System Integration

**Modify: `convex/streaks.ts` or streak logic**

```typescript
// When checking if streak should break:
export const checkStreak = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    // ... existing streak check logic

    if (shouldBreakStreak) {
      // Check for streak freeze
      const freezeResult = await ctx.runMutation(
        api.powerups.consumeStreakFreeze,
        { clerkId: args.clerkId }
      );

      if (freezeResult.wasProtected) {
        // Streak saved by freeze!
        return { streakBroken: false, savedByFreeze: true };
      }

      // Actually break streak
      // ... existing break logic
      return { streakBroken: true, savedByFreeze: false };
    }
  },
});
```

#### 3.2 Lesson Complete Integration

**Modify lesson complete flow**

```typescript
// When awarding XP/coins after lesson:
const multipliers = await getActiveMultipliers({ clerkId });

const baseXp = calculateBaseXp(lessonResult);
const baseCoin = calculateBaseCoins(lessonResult);

const finalXp = baseXp * multipliers.xpMultiplier;
const finalCoins = baseCoin * multipliers.coinMultiplier;

// Show bonus in UI if multiplier > 1
if (multipliers.xpMultiplier > 1) {
  showBonus(`${multipliers.xpMultiplier}x XP BONUS!`);
}
```

---

## File Structure

```
convex/
├── schema.ts                    (modify) - Add activePowerUps, streakProtection
├── powerups.ts                  (new) - Power-up mutations/queries
├── coins.ts                     (modify) - Apply coin multiplier
├── streaks.ts                   (modify) - Integrate streak freeze
└── xp.ts                        (modify) - Apply XP multiplier

src/
├── components/
│   ├── ActivePowerUps.tsx       (new) - Display active power-ups
│   ├── PowerUpInventory.tsx     (new) - Inventory with activation
│   └── TypingArea.tsx           (modify) - Add hint button
├── hooks/
│   └── usePowerUps.ts           (new) - Power-up state hook
└── main.tsx                     (modify) - Add power-up display to header
```

---

## Testing Checklist

- [ ] XP Boost activation doubles XP for 1 hour
- [ ] XP Boost timer displays correctly
- [ ] XP Boost expires after 1 hour
- [ ] Activating XP Boost while active extends duration
- [ ] Coin Magnet doubles coin earnings
- [ ] Coin Magnet timer displays correctly
- [ ] Streak Freeze activates successfully
- [ ] Streak Freeze protects streak when missing a day
- [ ] Streak Freeze consumed after use
- [ ] Hint Token reveals next character
- [ ] Hint Token quantity decreases after use
- [ ] Inventory updates after using power-ups
- [ ] Multiplier bonuses show in lesson complete screen
- [ ] Expired power-ups cleaned up correctly

---

## UI/UX Considerations

- Show active power-ups in header/status bar
- Display countdown timer for duration-based power-ups
- Show multiplier bonus animation when earning XP/coins
- Confirmation before activating valuable power-ups
- "Streak Saved!" notification when freeze is consumed
- Hint appears as highlighted overlay on next character
- Power-up inventory accessible from profile or sidebar

---

## Notes

- All power-up effects validated server-side
- Duration-based power-ups don't stack (extend instead)
- Streak freeze is automatic (consumed when needed)
- Hint tokens are manual (user decides when to use)
- Consider adding more power-ups in future:
  - "Perfect Shield" - Ignore next 3 typos
  - "Time Freeze" - Pause WPM timer for 10 seconds
  - "Lucky Coin" - Chance for bonus coins on each key
  - "Speed Demon" - Temporary WPM boost visualization
