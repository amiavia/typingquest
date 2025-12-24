# PRP-026: In-App Coin Shop & Cosmetics Store

**Status**: DRAFT
**Author**: Claude + Anton
**Date**: 2025-12-25
**Priority**: MEDIUM
**Estimated Effort**: 4 phases, ~35 tasks

---

## Executive Summary

This PRP introduces an in-app coin economy and cosmetics shop for TypeBit8. Players will earn coins through gameplay achievements and can spend them on cosmetic items including avatars, themes, keyboard skins, and power-ups. The shop features multiple categories, item rarity tiers, featured/sale items, and purchase confirmations. All transactions and inventory are managed through Convex backend for persistence and security.

---

## Problem Statement

### Current State

1. **No reward system**: Players complete lessons without tangible rewards beyond scores
2. **Limited monetization**: No virtual economy or premium cosmetics
3. **Minimal personalization**: Few options to customize the gaming experience
4. **No progression incentive**: Players lack motivation to replay lessons or improve scores
5. **Missing engagement loop**: No reason to return daily or pursue long-term goals

### Impact

| Issue | User Impact |
|-------|-------------|
| No rewards | Lower engagement, fewer repeat plays |
| Limited personalization | Generic experience, less emotional investment |
| No progression goals | Players quit after completing lesson sequence |
| Missing daily incentives | Low daily active user retention |
| No spending mechanics | Missed monetization opportunities |

### Success Criteria

- [ ] Players can earn coins through multiple gameplay actions
- [ ] Shop displays 4 categories: avatars, themes, keyboard skins, power-ups
- [ ] Items have rarity tiers (common, rare, epic, legendary) with pricing
- [ ] Featured/sale section highlights limited-time offers
- [ ] Purchase confirmations prevent accidental spending
- [ ] Coin balance prominently displayed in shop and header
- [ ] Summary shows all coin-earning opportunities
- [ ] Convex backend handles purchases, inventory, and transactions securely
- [ ] Owned items are visually indicated in shop
- [ ] Items can be previewed before purchase

---

## Proposed Solution

### Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  COIN SHOP ARCHITECTURE                                                      │
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│  │ Coin Earning │───▶│ Coin Balance │◀───│  Shop UI     │                  │
│  │ - Lessons    │    │  (Convex)    │    │ - Categories │                  │
│  │ - Achievements│    │              │    │ - Items      │                  │
│  │ - Daily login│    │              │    │ - Featured   │                  │
│  └──────────────┘    └──────┬───────┘    └──────┬───────┘                  │
│                             │                   │                           │
│                             ▼                   ▼                           │
│                   ┌──────────────────┐  ┌──────────────────┐               │
│                   │   Transactions   │  │  Item Inventory  │               │
│                   │  - Purchase      │  │  - Owned items   │               │
│                   │  - Validation    │  │  - Equipped      │               │
│                   │  - History       │  │  - Unlocked      │               │
│                   └──────────────────┘  └──────────────────┘               │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Shop Categories                                                       │   │
│  │ • Avatars (pixel art characters)                                      │   │
│  │ • Themes (color schemes, backgrounds)                                 │   │
│  │ • Keyboard Skins (key cap styles, borders)                            │   │
│  │ • Power-ups (2x XP, streak freeze, hint tokens)                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Architecture / Design

#### 1. Coin Economy Design

**Earning Opportunities**:
- **Lesson completion**: 10 coins (base)
- **Perfect accuracy (100%)**: +5 bonus coins
- **Speed bonus (>60 WPM)**: +5 bonus coins
- **First-time lesson**: +10 bonus coins
- **Daily login streak**: 5 coins/day (streak multiplier: 2x at 7 days, 3x at 30 days)
- **Level up**: 50 coins
- **Achievements**: 25-100 coins depending on difficulty
- **Leaderboard position**: Top 10 = 20 coins, Top 3 = 50 coins

**Pricing Tiers**:
| Rarity | Price Range | Items |
|--------|-------------|-------|
| Common | 50-100 coins | Basic avatars, simple themes |
| Rare | 150-300 coins | Animated avatars, gradient themes |
| Epic | 400-600 coins | Premium keyboard skins, particle effects |
| Legendary | 800-1500 coins | Exclusive avatars, unique themes, mega power-ups |

#### 2. Shop Categories

**Category 1: Avatars**
- Pixel art character portraits (building on PRP-003)
- Additional purchasable avatars beyond free defaults
- Animated avatars (rare/epic tiers)
- Seasonal/themed avatars (Halloween, Christmas, etc.)
- Celebrity/gaming icon tributes (8-bit style)

**Category 2: Themes**
- Background color schemes
- UI accent color palettes
- Retro themes (Game Boy, NES, Commodore 64)
- Modern themes (Cyberpunk, Synthwave, Pastel)
- Animated backgrounds (rare tier)

**Category 3: Keyboard Skins**
- Key cap visual styles (wooden, neon, holographic)
- Border decorations
- Sound packs (mechanical, typewriter, silent)
- Key press animations (ripple, glow, bounce)

**Category 4: Power-ups**
- **2x XP Boost** (1 hour): 100 coins
- **Streak Freeze** (saves 1 broken streak): 75 coins
- **Hint Token** (reveals next character): 25 coins
- **Undo Mistake** (corrects last error): 50 coins
- **Auto-Perfect** (guarantees perfect score on practice): 200 coins

#### 3. Shop UI/UX

**Main Shop Screen**:
```
┌─────────────────────────────────────────────────────┐
│  💰 COIN SHOP            Balance: 1,247 coins       │
├─────────────────────────────────────────────────────┤
│  [Featured] [Avatars] [Themes] [Skins] [Power-ups]  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🌟 FEATURED ITEMS                                   │
│  ┌──────┐ ┌──────┐ ┌──────┐                        │
│  │ 🎃   │ │ 🌈   │ │ ⚡   │                        │
│  │ Epic │ │ Rare │ │ Epic │                        │
│  │ 500💰│ │ 250💰│ │ 400💰│                        │
│  │ SALE │ │ NEW  │ │ HOT  │                        │
│  └──────┘ └──────┘ └──────┘                        │
│                                                     │
│  AVATARS (24 items)                                 │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐              │
│  │  👾  │ │  🤖  │ │  🐉  │ │  🦄  │              │
│  │Common│ │ Rare │ │ Epic │ │Legend│              │
│  │ 75💰 │ │200💰 │ │500💰 │ │1200💰│              │
│  │ BUY  │ │ BUY  │ │ BUY  │ │LOCKED│              │
│  └──────┘ └──────┘ └──────┘ └──────┘              │
│                                                     │
│  [Earn More Coins]                                  │
└─────────────────────────────────────────────────────┘
```

**Purchase Confirmation Modal**:
```
┌─────────────────────────────────┐
│  CONFIRM PURCHASE                │
├─────────────────────────────────┤
│         [Preview Image]          │
│                                 │
│  Item: Cyberpunk Ninja Avatar   │
│  Rarity: Epic                   │
│  Price: 500 coins               │
│                                 │
│  Current Balance: 1,247 coins   │
│  After Purchase: 747 coins      │
│                                 │
│  [ Cancel ]  [ Confirm ]         │
└─────────────────────────────────┘
```

**Coin Earning Opportunities Screen**:
```
┌─────────────────────────────────────┐
│  EARN MORE COINS                     │
├─────────────────────────────────────┤
│  ✅ Complete lessons      10 coins   │
│  ✨ Perfect accuracy      +5 coins   │
│  ⚡ Speed bonus (60+ WPM) +5 coins   │
│  🎯 First-time lesson     +10 coins  │
│  📅 Daily login           5 coins    │
│  📈 Level up              50 coins   │
│  🏆 Achievements          25-100 💰  │
│  👑 Leaderboard top 10    20 coins   │
│                                     │
│  Current streak: 7 days (2x bonus!) │
│  [Close]                            │
└─────────────────────────────────────┘
```

---

## Phase 1: Database Schema & Backend

### 1.1 Convex Schema Updates

**Modify: `convex/schema.ts`**

Add new tables for shop system:

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ... existing tables ...

  users: defineTable({
    clerkId: v.string(),
    email: v.optional(v.string()),
    username: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    avatarId: v.optional(v.string()),
    coins: v.number(), // NEW: Coin balance
    createdAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"]),

  // NEW: Shop Items Catalog
  shopItems: defineTable({
    itemId: v.string(), // unique identifier (e.g., "avatar-ninja-cyberpunk")
    name: v.string(),
    description: v.string(),
    category: v.string(), // "avatar" | "theme" | "keyboard-skin" | "power-up"
    rarity: v.string(), // "common" | "rare" | "epic" | "legendary"
    price: v.number(),
    imageUrl: v.string(),
    previewUrl: v.optional(v.string()), // For themes/skins
    isConsumable: v.boolean(), // Power-ups are consumable
    isFeatured: v.boolean(),
    isOnSale: v.boolean(),
    salePrice: v.optional(v.number()),
    requiredLevel: v.optional(v.number()), // Some items unlock at level X
    seasonalTag: v.optional(v.string()), // "halloween", "christmas", etc.
    createdAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_featured", ["isFeatured"])
    .index("by_rarity", ["rarity"]),

  // NEW: User Inventory
  inventory: defineTable({
    userId: v.id("users"),
    itemId: v.string(),
    quantity: v.number(), // For consumables (power-ups)
    purchasedAt: v.number(),
    isEquipped: v.boolean(), // For avatars/themes/skins
  })
    .index("by_user", ["userId"])
    .index("by_user_item", ["userId", "itemId"]),

  // NEW: Transaction History
  transactions: defineTable({
    userId: v.id("users"),
    transactionType: v.string(), // "purchase" | "earn" | "spend"
    amount: v.number(), // Positive for earning, negative for spending
    itemId: v.optional(v.string()), // If purchase/spend
    source: v.string(), // "lesson_complete", "achievement", "shop_purchase", etc.
    metadata: v.optional(v.any()), // Additional data (lesson ID, achievement ID, etc.)
    balanceBefore: v.number(),
    balanceAfter: v.number(),
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_timestamp", ["timestamp"]),

  // NEW: Daily Streaks (for coin bonuses)
  dailyStreaks: defineTable({
    userId: v.id("users"),
    currentStreak: v.number(),
    longestStreak: v.number(),
    lastLoginDate: v.string(), // ISO date string (YYYY-MM-DD)
    lastRewardClaimed: v.number(), // Timestamp
  })
    .index("by_user", ["userId"]),
});
```

### 1.2 Shop Item Mutations & Queries

**New file: `convex/shop.ts`**

```typescript
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Get all shop items (with filters)
export const getShopItems = query({
  args: {
    category: v.optional(v.string()),
    rarity: v.optional(v.string()),
    featuredOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let items = ctx.db.query("shopItems");

    if (args.category) {
      items = items.withIndex("by_category", (q) =>
        q.eq("category", args.category)
      );
    }

    if (args.featuredOnly) {
      items = items.withIndex("by_featured", (q) =>
        q.eq("isFeatured", true)
      );
    }

    const results = await items.collect();

    if (args.rarity) {
      return results.filter((item) => item.rarity === args.rarity);
    }

    return results;
  },
});

// Get user's coin balance
export const getCoinBalance = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return 0;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    return user?.coins || 0;
  },
});

// Get user's inventory
export const getInventory = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    const inventory = await ctx.db
      .query("inventory")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return inventory;
  },
});

// Check if user owns an item
export const ownsItem = query({
  args: { itemId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return false;

    const inventoryItem = await ctx.db
      .query("inventory")
      .withIndex("by_user_item", (q) =>
        q.eq("userId", user._id).eq("itemId", args.itemId)
      )
      .unique();

    return inventoryItem !== null;
  },
});

// Purchase item
export const purchaseItem = mutation({
  args: { itemId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    // Get shop item
    const shopItem = await ctx.db
      .query("shopItems")
      .filter((q) => q.eq(q.field("itemId"), args.itemId))
      .unique();

    if (!shopItem) throw new Error("Item not found");

    // Check if already owned (for non-consumables)
    if (!shopItem.isConsumable) {
      const existingItem = await ctx.db
        .query("inventory")
        .withIndex("by_user_item", (q) =>
          q.eq("userId", user._id).eq("itemId", args.itemId)
        )
        .unique();

      if (existingItem) throw new Error("Already owned");
    }

    // Calculate final price
    const finalPrice = shopItem.isOnSale && shopItem.salePrice
      ? shopItem.salePrice
      : shopItem.price;

    // Check if user has enough coins
    const currentBalance = user.coins || 0;
    if (currentBalance < finalPrice) {
      throw new Error("Insufficient coins");
    }

    // Deduct coins
    const newBalance = currentBalance - finalPrice;
    await ctx.db.patch(user._id, { coins: newBalance });

    // Add to inventory
    const existingInventoryItem = await ctx.db
      .query("inventory")
      .withIndex("by_user_item", (q) =>
        q.eq("userId", user._id).eq("itemId", args.itemId)
      )
      .unique();

    if (existingInventoryItem && shopItem.isConsumable) {
      // Increment quantity for consumables
      await ctx.db.patch(existingInventoryItem._id, {
        quantity: existingInventoryItem.quantity + 1,
      });
    } else {
      // Create new inventory entry
      await ctx.db.insert("inventory", {
        userId: user._id,
        itemId: args.itemId,
        quantity: shopItem.isConsumable ? 1 : 1,
        purchasedAt: Date.now(),
        isEquipped: false,
      });
    }

    // Record transaction
    await ctx.db.insert("transactions", {
      userId: user._id,
      transactionType: "purchase",
      amount: -finalPrice,
      itemId: args.itemId,
      source: "shop_purchase",
      balanceBefore: currentBalance,
      balanceAfter: newBalance,
      timestamp: Date.now(),
    });

    return { success: true, newBalance };
  },
});

// Equip item (for avatars, themes, keyboard skins)
export const equipItem = mutation({
  args: { itemId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    // Get shop item to determine category
    const shopItem = await ctx.db
      .query("shopItems")
      .filter((q) => q.eq(q.field("itemId"), args.itemId))
      .unique();

    if (!shopItem) throw new Error("Item not found");

    // Verify ownership
    const inventoryItem = await ctx.db
      .query("inventory")
      .withIndex("by_user_item", (q) =>
        q.eq("userId", user._id).eq("itemId", args.itemId)
      )
      .unique();

    if (!inventoryItem) throw new Error("Item not owned");

    // Unequip all items in same category
    const userInventory = await ctx.db
      .query("inventory")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const item of userInventory) {
      const itemDetails = await ctx.db
        .query("shopItems")
        .filter((q) => q.eq(q.field("itemId"), item.itemId))
        .unique();

      if (itemDetails && itemDetails.category === shopItem.category && item.isEquipped) {
        await ctx.db.patch(item._id, { isEquipped: false });
      }
    }

    // Equip the new item
    await ctx.db.patch(inventoryItem._id, { isEquipped: true });

    return { success: true };
  },
});
```

### 1.3 Coin Earning Mutations

**New file: `convex/coins.ts`**

```typescript
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Award coins to user
export const awardCoins = mutation({
  args: {
    amount: v.number(),
    source: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    const currentBalance = user.coins || 0;
    const newBalance = currentBalance + args.amount;

    await ctx.db.patch(user._id, { coins: newBalance });

    // Record transaction
    await ctx.db.insert("transactions", {
      userId: user._id,
      transactionType: "earn",
      amount: args.amount,
      source: args.source,
      metadata: args.metadata,
      balanceBefore: currentBalance,
      balanceAfter: newBalance,
      timestamp: Date.now(),
    });

    return { newBalance };
  },
});

// Get/update daily streak
export const claimDailyReward = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    // Get or create streak record
    let streakRecord = await ctx.db
      .query("dailyStreaks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const now = Date.now();

    if (!streakRecord) {
      // Create new streak
      streakRecord = {
        userId: user._id,
        currentStreak: 1,
        longestStreak: 1,
        lastLoginDate: today,
        lastRewardClaimed: now,
      };
      await ctx.db.insert("dailyStreaks", streakRecord);
    } else {
      const lastLogin = streakRecord.lastLoginDate;
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

      if (lastLogin === today) {
        // Already claimed today
        throw new Error("Daily reward already claimed");
      } else if (lastLogin === yesterday) {
        // Continuing streak
        const newStreak = streakRecord.currentStreak + 1;
        await ctx.db.patch(streakRecord._id, {
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, streakRecord.longestStreak),
          lastLoginDate: today,
          lastRewardClaimed: now,
        });
        streakRecord.currentStreak = newStreak;
      } else {
        // Streak broken
        await ctx.db.patch(streakRecord._id, {
          currentStreak: 1,
          lastLoginDate: today,
          lastRewardClaimed: now,
        });
        streakRecord.currentStreak = 1;
      }
    }

    // Calculate reward (base 5 coins, multipliers at 7 and 30 days)
    let reward = 5;
    if (streakRecord.currentStreak >= 30) reward *= 3;
    else if (streakRecord.currentStreak >= 7) reward *= 2;

    // Award coins
    const currentBalance = user.coins || 0;
    const newBalance = currentBalance + reward;

    await ctx.db.patch(user._id, { coins: newBalance });

    await ctx.db.insert("transactions", {
      userId: user._id,
      transactionType: "earn",
      amount: reward,
      source: "daily_login",
      metadata: { streak: streakRecord.currentStreak },
      balanceBefore: currentBalance,
      balanceAfter: newBalance,
      timestamp: now,
    });

    return {
      reward,
      newBalance,
      currentStreak: streakRecord.currentStreak,
    };
  },
});

// Get current streak info
export const getStreakInfo = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return null;

    const streakRecord = await ctx.db
      .query("dailyStreaks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!streakRecord) return { currentStreak: 0, canClaim: true };

    const today = new Date().toISOString().split("T")[0];
    const canClaim = streakRecord.lastLoginDate !== today;

    return {
      currentStreak: streakRecord.currentStreak,
      longestStreak: streakRecord.longestStreak,
      canClaim,
    };
  },
});

// Get transaction history
export const getTransactionHistory = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(args.limit || 50);

    return transactions;
  },
});
```

---

## Phase 2: Shop Item Seed Data

### 2.1 Initial Shop Items

**New file: `convex/seed-shop-items.ts`**

This script populates the initial shop catalog:

```typescript
import { mutation } from "./_generated/server";

export const seedShopItems = mutation({
  handler: async (ctx) => {
    const items = [
      // AVATARS - Common
      {
        itemId: "avatar-pixel-knight",
        name: "Pixel Knight",
        description: "Classic armored warrior",
        category: "avatar",
        rarity: "common",
        price: 0, // Free default
        imageUrl: "/avatars/pixel-knight.png",
        isConsumable: false,
        isFeatured: false,
        isOnSale: false,
        createdAt: Date.now(),
      },
      {
        itemId: "avatar-robo-typer",
        name: "Robo Typer",
        description: "Friendly typing robot",
        category: "avatar",
        rarity: "common",
        price: 75,
        imageUrl: "/avatars/robo-typer.png",
        isConsumable: false,
        isFeatured: false,
        isOnSale: false,
        createdAt: Date.now(),
      },

      // AVATARS - Rare
      {
        itemId: "avatar-code-wizard",
        name: "Code Wizard",
        description: "Mystical mage of the keyboard",
        category: "avatar",
        rarity: "rare",
        price: 200,
        imageUrl: "/avatars/code-wizard.png",
        isConsumable: false,
        isFeatured: false,
        isOnSale: false,
        createdAt: Date.now(),
      },
      {
        itemId: "avatar-speed-ninja",
        name: "Speed Ninja",
        description: "Lightning-fast warrior",
        category: "avatar",
        rarity: "rare",
        price: 250,
        imageUrl: "/avatars/speed-ninja.png",
        isConsumable: false,
        isFeatured: true,
        isOnSale: false,
        createdAt: Date.now(),
      },

      // AVATARS - Epic
      {
        itemId: "avatar-keyboard-cat",
        name: "Keyboard Cat",
        description: "The legend himself",
        category: "avatar",
        rarity: "epic",
        price: 500,
        imageUrl: "/avatars/keyboard-cat.png",
        isConsumable: false,
        isFeatured: false,
        isOnSale: false,
        createdAt: Date.now(),
      },

      // AVATARS - Legendary
      {
        itemId: "avatar-dragon-coder",
        name: "Dragon Coder",
        description: "Breathes code instead of fire",
        category: "avatar",
        rarity: "legendary",
        price: 1200,
        imageUrl: "/avatars/dragon-coder.png",
        isConsumable: false,
        isFeatured: true,
        isOnSale: false,
        requiredLevel: 10,
        createdAt: Date.now(),
      },

      // THEMES - Common
      {
        itemId: "theme-retro-green",
        name: "Retro Green",
        description: "Classic terminal vibes",
        category: "theme",
        rarity: "common",
        price: 50,
        imageUrl: "/themes/retro-green.png",
        previewUrl: "/themes/retro-green-preview.png",
        isConsumable: false,
        isFeatured: false,
        isOnSale: false,
        createdAt: Date.now(),
      },

      // THEMES - Rare
      {
        itemId: "theme-synthwave",
        name: "Synthwave Sunset",
        description: "80s neon aesthetic",
        category: "theme",
        rarity: "rare",
        price: 300,
        imageUrl: "/themes/synthwave.png",
        previewUrl: "/themes/synthwave-preview.png",
        isConsumable: false,
        isFeatured: true,
        isOnSale: false,
        createdAt: Date.now(),
      },

      // THEMES - Epic
      {
        itemId: "theme-cyberpunk",
        name: "Cyberpunk 2077",
        description: "Futuristic dystopia",
        category: "theme",
        rarity: "epic",
        price: 600,
        imageUrl: "/themes/cyberpunk.png",
        previewUrl: "/themes/cyberpunk-preview.png",
        isConsumable: false,
        isFeatured: false,
        isOnSale: true,
        salePrice: 450,
        createdAt: Date.now(),
      },

      // KEYBOARD SKINS - Common
      {
        itemId: "skin-wooden-keys",
        name: "Wooden Keys",
        description: "Natural wood grain keycaps",
        category: "keyboard-skin",
        rarity: "common",
        price: 100,
        imageUrl: "/skins/wooden-keys.png",
        isConsumable: false,
        isFeatured: false,
        isOnSale: false,
        createdAt: Date.now(),
      },

      // KEYBOARD SKINS - Rare
      {
        itemId: "skin-neon-glow",
        name: "Neon Glow",
        description: "RGB backlit keycaps",
        category: "keyboard-skin",
        rarity: "rare",
        price: 250,
        imageUrl: "/skins/neon-glow.png",
        isConsumable: false,
        isFeatured: false,
        isOnSale: false,
        createdAt: Date.now(),
      },

      // KEYBOARD SKINS - Epic
      {
        itemId: "skin-holographic",
        name: "Holographic Dreams",
        description: "Shimmering rainbow keycaps",
        category: "keyboard-skin",
        rarity: "epic",
        price: 550,
        imageUrl: "/skins/holographic.png",
        isConsumable: false,
        isFeatured: true,
        isOnSale: false,
        createdAt: Date.now(),
      },

      // POWER-UPS - Consumable
      {
        itemId: "powerup-xp-boost",
        name: "2x XP Boost",
        description: "Double XP for 1 hour",
        category: "power-up",
        rarity: "rare",
        price: 100,
        imageUrl: "/powerups/xp-boost.png",
        isConsumable: true,
        isFeatured: false,
        isOnSale: false,
        createdAt: Date.now(),
      },
      {
        itemId: "powerup-streak-freeze",
        name: "Streak Freeze",
        description: "Protects your daily streak once",
        category: "power-up",
        rarity: "rare",
        price: 75,
        imageUrl: "/powerups/streak-freeze.png",
        isConsumable: true,
        isFeatured: false,
        isOnSale: false,
        createdAt: Date.now(),
      },
      {
        itemId: "powerup-hint-token",
        name: "Hint Token",
        description: "Reveals the next character",
        category: "power-up",
        rarity: "common",
        price: 25,
        imageUrl: "/powerups/hint.png",
        isConsumable: true,
        isFeatured: false,
        isOnSale: false,
        createdAt: Date.now(),
      },
      {
        itemId: "powerup-undo-mistake",
        name: "Undo Mistake",
        description: "Corrects your last error",
        category: "power-up",
        rarity: "common",
        price: 50,
        imageUrl: "/powerups/undo.png",
        isConsumable: true,
        isFeatured: false,
        isOnSale: false,
        createdAt: Date.now(),
      },
    ];

    // Insert all items
    for (const item of items) {
      await ctx.db.insert("shopItems", item);
    }

    return { success: true, count: items.length };
  },
});
```

---

## Phase 3: Frontend Components

### 3.1 Shop Main Screen

**New file: `src/components/Shop.tsx`**

```typescript
import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { ShopCategory } from './ShopCategory';
import { CoinBalance } from './CoinBalance';
import { EarnCoinsModal } from './EarnCoinsModal';

type Category = 'featured' | 'avatars' | 'themes' | 'keyboard-skins' | 'power-ups';

export function Shop() {
  const [activeCategory, setActiveCategory] = useState<Category>('featured');
  const [showEarnModal, setShowEarnModal] = useState(false);

  const coinBalance = useQuery(api.shop.getCoinBalance);
  const featuredItems = useQuery(api.shop.getShopItems, { featuredOnly: true });
  const inventory = useQuery(api.shop.getInventory);

  const categories: { id: Category; label: string; emoji: string }[] = [
    { id: 'featured', label: 'Featured', emoji: '🌟' },
    { id: 'avatars', label: 'Avatars', emoji: '👾' },
    { id: 'themes', label: 'Themes', emoji: '🎨' },
    { id: 'keyboard-skins', label: 'Skins', emoji: '⌨️' },
    { id: 'power-ups', label: 'Power-ups', emoji: '⚡' },
  ];

  return (
    <div className="shop-container p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 style={{
          fontFamily: "'Press Start 2P'",
          fontSize: '20px',
          color: '#ffd93d',
        }}>
          💰 COIN SHOP
        </h1>
        <div className="flex items-center gap-4">
          <CoinBalance balance={coinBalance || 0} />
          <button
            onClick={() => setShowEarnModal(true)}
            className="pixel-btn text-xs"
            style={{ background: '#0ead69' }}
          >
            EARN MORE
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`pixel-btn text-xs px-4 py-2 ${
              activeCategory === cat.id ? 'ring-2 ring-[#ffd93d]' : ''
            }`}
            style={{
              background: activeCategory === cat.id ? '#ffd93d' : '#1a1a2e',
              color: activeCategory === cat.id ? '#1a1a2e' : '#eef5db',
            }}
          >
            {cat.emoji} {cat.label.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Shop Category Content */}
      <ShopCategory
        category={activeCategory === 'featured' ? undefined : activeCategory}
        featuredOnly={activeCategory === 'featured'}
        inventory={inventory || []}
      />

      {/* Earn Coins Modal */}
      {showEarnModal && (
        <EarnCoinsModal onClose={() => setShowEarnModal(false)} />
      )}
    </div>
  );
}
```

### 3.2 Shop Category Grid

**New file: `src/components/ShopCategory.tsx`**

```typescript
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { ShopItemCard } from './ShopItemCard';

interface ShopCategoryProps {
  category?: string;
  featuredOnly?: boolean;
  inventory: any[];
}

export function ShopCategory({ category, featuredOnly, inventory }: ShopCategoryProps) {
  const items = useQuery(api.shop.getShopItems, {
    category,
    featuredOnly,
  });

  if (!items) return <div>Loading...</div>;

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p style={{
          fontFamily: "'Press Start 2P'",
          fontSize: '12px',
          color: '#4a4a6e',
        }}>
          NO ITEMS AVAILABLE
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map(item => {
        const owned = inventory.some(inv => inv.itemId === item.itemId);
        const equipped = inventory.find(
          inv => inv.itemId === item.itemId && inv.isEquipped
        );

        return (
          <ShopItemCard
            key={item.itemId}
            item={item}
            owned={owned}
            equipped={!!equipped}
          />
        );
      })}
    </div>
  );
}
```

### 3.3 Shop Item Card

**New file: `src/components/ShopItemCard.tsx`**

```typescript
import { useState } from 'react';
import { PurchaseConfirmationModal } from './PurchaseConfirmationModal';

interface ShopItemCardProps {
  item: any;
  owned: boolean;
  equipped: boolean;
}

const RARITY_COLORS = {
  common: '#4a4a6e',
  rare: '#3bceac',
  epic: '#ff6b9d',
  legendary: '#ffd93d',
};

export function ShopItemCard({ item, owned, equipped }: ShopItemCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const finalPrice = item.isOnSale && item.salePrice
    ? item.salePrice
    : item.price;

  return (
    <>
      <div
        className="pixel-box p-4 relative"
        style={{
          borderColor: RARITY_COLORS[item.rarity as keyof typeof RARITY_COLORS],
          borderWidth: '3px',
        }}
      >
        {/* Badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {item.isOnSale && (
            <span className="pixel-badge text-xs bg-[#ff6b9d] text-white px-2 py-1">
              SALE
            </span>
          )}
          {item.isFeatured && (
            <span className="pixel-badge text-xs bg-[#ffd93d] text-[#1a1a2e] px-2 py-1">
              ⭐
            </span>
          )}
          {equipped && (
            <span className="pixel-badge text-xs bg-[#0ead69] text-white px-2 py-1">
              ✓
            </span>
          )}
        </div>

        {/* Image */}
        <div
          className="aspect-square mb-3 flex items-center justify-center"
          style={{ background: '#1a1a2e' }}
        >
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-contain"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>

        {/* Name */}
        <h3 style={{
          fontFamily: "'Press Start 2P'",
          fontSize: '8px',
          color: '#eef5db',
          marginBottom: '8px',
        }}>
          {item.name.toUpperCase()}
        </h3>

        {/* Description */}
        <p style={{
          fontFamily: 'monospace',
          fontSize: '10px',
          color: '#4a4a6e',
          marginBottom: '12px',
        }}>
          {item.description}
        </p>

        {/* Rarity */}
        <div className="mb-3">
          <span
            className="text-xs px-2 py-1"
            style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '7px',
              background: RARITY_COLORS[item.rarity as keyof typeof RARITY_COLORS],
              color: '#fff',
            }}
          >
            {item.rarity.toUpperCase()}
          </span>
        </div>

        {/* Price & Action */}
        <div className="flex justify-between items-center">
          <div>
            {item.isOnSale && (
              <span style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '8px',
                color: '#4a4a6e',
                textDecoration: 'line-through',
              }}>
                {item.price} 💰
              </span>
            )}
            <div style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '10px',
              color: '#ffd93d',
            }}>
              {finalPrice} 💰
            </div>
          </div>

          {owned && !item.isConsumable ? (
            <span className="text-xs text-[#0ead69]">OWNED</span>
          ) : (
            <button
              onClick={() => setShowConfirm(true)}
              className="pixel-btn text-xs"
              style={{ background: '#0ead69', padding: '6px 12px' }}
            >
              BUY
            </button>
          )}
        </div>
      </div>

      {/* Purchase Confirmation Modal */}
      {showConfirm && (
        <PurchaseConfirmationModal
          item={item}
          finalPrice={finalPrice}
          onClose={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}
```

### 3.4 Purchase Confirmation Modal

**New file: `src/components/PurchaseConfirmationModal.tsx`**

```typescript
import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface PurchaseConfirmationModalProps {
  item: any;
  finalPrice: number;
  onClose: () => void;
}

export function PurchaseConfirmationModal({
  item,
  finalPrice,
  onClose,
}: PurchaseConfirmationModalProps) {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const coinBalance = useQuery(api.shop.getCoinBalance);
  const purchaseItem = useMutation(api.shop.purchaseItem);

  const handlePurchase = async () => {
    setIsPurchasing(true);
    setError(null);

    try {
      await purchaseItem({ itemId: item.itemId });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Purchase failed');
    } finally {
      setIsPurchasing(false);
    }
  };

  const afterBalance = (coinBalance || 0) - finalPrice;
  const canAfford = afterBalance >= 0;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="pixel-box p-6 max-w-md w-full">
        <h2 style={{
          fontFamily: "'Press Start 2P'",
          fontSize: '12px',
          color: '#ffd93d',
          marginBottom: '20px',
        }}>
          CONFIRM PURCHASE
        </h2>

        {/* Preview */}
        <div
          className="aspect-square mb-4 flex items-center justify-center"
          style={{ background: '#1a1a2e' }}
        >
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-3/4 h-3/4 object-contain"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>

        {/* Details */}
        <div className="space-y-3 mb-6">
          <div>
            <span style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '8px',
              color: '#4a4a6e',
            }}>
              ITEM:
            </span>
            <p style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '10px',
              color: '#eef5db',
            }}>
              {item.name}
            </p>
          </div>

          <div>
            <span style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '8px',
              color: '#4a4a6e',
            }}>
              RARITY:
            </span>
            <p style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '10px',
              color: '#eef5db',
            }}>
              {item.rarity.toUpperCase()}
            </p>
          </div>

          <div>
            <span style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '8px',
              color: '#4a4a6e',
            }}>
              PRICE:
            </span>
            <p style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '10px',
              color: '#ffd93d',
            }}>
              {finalPrice} 💰
            </p>
          </div>

          <div className="border-t border-[#4a4a6e] pt-3">
            <div className="flex justify-between mb-1">
              <span style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '8px',
                color: '#4a4a6e',
              }}>
                Current Balance:
              </span>
              <span style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '8px',
                color: '#eef5db',
              }}>
                {coinBalance} 💰
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '8px',
                color: '#4a4a6e',
              }}>
                After Purchase:
              </span>
              <span style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '8px',
                color: canAfford ? '#0ead69' : '#ff6b9d',
              }}>
                {afterBalance} 💰
              </span>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-[#ff6b9d]/20 border border-[#ff6b9d]">
            <p style={{
              fontFamily: 'monospace',
              fontSize: '10px',
              color: '#ff6b9d',
            }}>
              {error}
            </p>
          </div>
        )}

        {/* Insufficient funds warning */}
        {!canAfford && (
          <div className="mb-4 p-3 bg-[#ff6b9d]/20 border border-[#ff6b9d]">
            <p style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '8px',
              color: '#ff6b9d',
            }}>
              INSUFFICIENT COINS
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="pixel-btn flex-1"
            style={{ background: '#4a4a6e' }}
          >
            CANCEL
          </button>
          <button
            onClick={handlePurchase}
            disabled={isPurchasing || !canAfford}
            className="pixel-btn flex-1"
            style={{
              background: canAfford ? '#0ead69' : '#4a4a6e',
              opacity: isPurchasing ? 0.6 : 1,
            }}
          >
            {isPurchasing ? 'BUYING...' : 'CONFIRM'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 3.5 Coin Balance Display

**New file: `src/components/CoinBalance.tsx`**

```typescript
interface CoinBalanceProps {
  balance: number;
  size?: 'sm' | 'md' | 'lg';
}

export function CoinBalance({ balance, size = 'md' }: CoinBalanceProps) {
  const fontSize = size === 'sm' ? '10px' : size === 'lg' ? '16px' : '12px';
  const padding = size === 'sm' ? '4px 8px' : size === 'lg' ? '12px 20px' : '8px 16px';

  return (
    <div
      className="pixel-box inline-flex items-center gap-2"
      style={{
        background: '#1a1a2e',
        padding,
      }}
    >
      <span style={{ fontSize: '16px' }}>💰</span>
      <span style={{
        fontFamily: "'Press Start 2P'",
        fontSize,
        color: '#ffd93d',
      }}>
        {balance.toLocaleString()}
      </span>
    </div>
  );
}
```

### 3.6 Earn Coins Modal

**New file: `src/components/EarnCoinsModal.tsx`**

```typescript
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface EarnCoinsModalProps {
  onClose: () => void;
}

export function EarnCoinsModal({ onClose }: EarnCoinsModalProps) {
  const streakInfo = useQuery(api.coins.getStreakInfo);

  const opportunities = [
    { emoji: '✅', action: 'Complete lessons', reward: '10 coins' },
    { emoji: '✨', action: 'Perfect accuracy (100%)', reward: '+5 coins' },
    { emoji: '⚡', action: 'Speed bonus (60+ WPM)', reward: '+5 coins' },
    { emoji: '🎯', action: 'First-time lesson', reward: '+10 coins' },
    { emoji: '📅', action: 'Daily login', reward: '5 coins' },
    { emoji: '📈', action: 'Level up', reward: '50 coins' },
    { emoji: '🏆', action: 'Achievements', reward: '25-100 💰' },
    { emoji: '👑', action: 'Leaderboard top 10', reward: '20 coins' },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="pixel-box p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 style={{
            fontFamily: "'Press Start 2P'",
            fontSize: '12px',
            color: '#ffd93d',
          }}>
            EARN MORE COINS
          </h2>
          <button
            onClick={onClose}
            className="pixel-btn text-xs"
            style={{ padding: '4px 8px' }}
          >
            X
          </button>
        </div>

        <div className="space-y-3 mb-6">
          {opportunities.map((opp, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3"
              style={{ background: '#1a1a2e' }}
            >
              <div className="flex items-center gap-3">
                <span style={{ fontSize: '16px' }}>{opp.emoji}</span>
                <span style={{
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  color: '#eef5db',
                }}>
                  {opp.action}
                </span>
              </div>
              <span style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '8px',
                color: '#ffd93d',
              }}>
                {opp.reward}
              </span>
            </div>
          ))}
        </div>

        {streakInfo && (
          <div
            className="p-4 mb-4"
            style={{
              background: '#0ead69',
              border: '2px solid #ffd93d',
            }}
          >
            <p style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '9px',
              color: '#1a1a2e',
              textAlign: 'center',
            }}>
              Current streak: {streakInfo.currentStreak} days
              {streakInfo.currentStreak >= 7 && ' (2x bonus!)'}
              {streakInfo.currentStreak >= 30 && ' (3x bonus!)'}
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="pixel-btn w-full"
          style={{ background: '#0ead69' }}
        >
          CLOSE
        </button>
      </div>
    </div>
  );
}
```

---

## Phase 4: Integration & Coin Earning Logic

### 4.1 Integrate Coin Earnings into Lesson Completion

**Modify: `src/components/LessonComplete.tsx` (or similar)**

```typescript
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

// Inside component:
const awardCoins = useMutation(api.coins.awardCoins);

const handleLessonComplete = async (lessonData: any) => {
  let totalCoins = 10; // Base reward
  const metadata: any = { lessonId: lessonData.lessonId };

  // Perfect accuracy bonus
  if (lessonData.accuracy === 100) {
    totalCoins += 5;
    metadata.perfectBonus = 5;
  }

  // Speed bonus
  if (lessonData.wpm >= 60) {
    totalCoins += 5;
    metadata.speedBonus = 5;
  }

  // First-time lesson bonus
  if (lessonData.isFirstTime) {
    totalCoins += 10;
    metadata.firstTimeBonus = 10;
  }

  // Award coins
  await awardCoins({
    amount: totalCoins,
    source: 'lesson_complete',
    metadata,
  });
};
```

### 4.2 Add Shop Link to Navigation

**Modify: `src/App.tsx` or `src/components/Header.tsx`**

```typescript
import { Link } from 'react-router-dom';
import { CoinBalance } from './components/CoinBalance';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';

// In header:
const coinBalance = useQuery(api.shop.getCoinBalance);

<nav>
  <Link to="/shop" className="pixel-btn">
    🛒 SHOP
  </Link>
  <CoinBalance balance={coinBalance || 0} size="sm" />
</nav>
```

### 4.3 Daily Login Reward Hook

**New file: `src/hooks/useDailyReward.ts`**

```typescript
import { useEffect, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export function useDailyReward() {
  const [showReward, setShowReward] = useState(false);
  const [reward, setReward] = useState<any>(null);

  const streakInfo = useQuery(api.coins.getStreakInfo);
  const claimDailyReward = useMutation(api.coins.claimDailyReward);

  useEffect(() => {
    if (streakInfo?.canClaim) {
      // Auto-claim on mount if available
      claimDailyReward()
        .then((result) => {
          setReward(result);
          setShowReward(true);
        })
        .catch(() => {
          // Already claimed or error
        });
    }
  }, [streakInfo?.canClaim]);

  return {
    showReward,
    reward,
    dismissReward: () => setShowReward(false),
  };
}
```

---

## File Structure (New/Modified)

```
typingquest/
├── convex/
│   ├── schema.ts                     (modify) - Add shop tables
│   ├── shop.ts                       (new) - Shop queries/mutations
│   ├── coins.ts                      (new) - Coin earning/transactions
│   └── seed-shop-items.ts            (new) - Initial catalog
├── public/
│   ├── avatars/                      (existing) - Avatar images
│   ├── themes/                       (new) - Theme preview images
│   │   ├── retro-green.png
│   │   ├── synthwave.png
│   │   └── cyberpunk.png
│   ├── skins/                        (new) - Keyboard skin images
│   │   ├── wooden-keys.png
│   │   ├── neon-glow.png
│   │   └── holographic.png
│   └── powerups/                     (new) - Power-up icons
│       ├── xp-boost.png
│       ├── streak-freeze.png
│       ├── hint.png
│       └── undo.png
├── src/
│   ├── components/
│   │   ├── Shop.tsx                  (new) - Main shop screen
│   │   ├── ShopCategory.tsx          (new) - Category grid
│   │   ├── ShopItemCard.tsx          (new) - Individual item card
│   │   ├── PurchaseConfirmationModal.tsx (new) - Purchase modal
│   │   ├── CoinBalance.tsx           (new) - Coin display component
│   │   ├── EarnCoinsModal.tsx        (new) - Earning opportunities
│   │   ├── LessonComplete.tsx        (modify) - Add coin rewards
│   │   └── Header.tsx                (modify) - Add shop link, coin balance
│   ├── hooks/
│   │   └── useDailyReward.ts         (new) - Daily login rewards
│   └── App.tsx                       (modify) - Add shop route
└── docs/
    └── PRP-026-COIN-SHOP.md          (this file)
```

---

## Implementation Order

1. **Database Setup** (Phase 1)
   - Update Convex schema with new tables
   - Deploy schema changes
   - Create shop.ts mutations/queries
   - Create coins.ts for earning system
   - Test backend functions in Convex dashboard

2. **Seed Data** (Phase 2)
   - Create seed-shop-items.ts script
   - Run seed script to populate shop catalog
   - Verify items in Convex dashboard

3. **Asset Preparation**
   - Create placeholder images for themes, skins, power-ups
   - Organize in public/ directory structure
   - Ensure avatar images from PRP-003 are available

4. **UI Components** (Phase 3)
   - Build CoinBalance.tsx (smallest, reusable)
   - Build ShopItemCard.tsx
   - Build PurchaseConfirmationModal.tsx
   - Build ShopCategory.tsx
   - Build Shop.tsx (main screen)
   - Build EarnCoinsModal.tsx
   - Test each component in isolation

5. **Integration** (Phase 4)
   - Add shop route to App.tsx
   - Update Header.tsx with shop link and coin balance
   - Integrate coin earning into LessonComplete.tsx
   - Create useDailyReward.ts hook
   - Add daily reward notification UI
   - Test complete user flow

6. **Testing & Polish**
   - Test purchase flow (success, insufficient funds, already owned)
   - Test coin earning from all sources
   - Test daily streak system
   - Test equipped item display
   - Verify transaction history
   - Polish animations and transitions

---

## Future Enhancements

### Phase 5 (Future)

- **Limited Edition Items**: Time-limited seasonal items (Valentine's, Summer, etc.)
- **Bundle Deals**: "Starter Pack" bundles at discounted prices
- **Gifting System**: Send items/coins to friends
- **Wishlist**: Mark items to purchase later
- **Item Preview**: Try before you buy (themes, keyboard skins)
- **Achievements Store**: Special items unlockable only via achievements
- **Animated Power-ups**: Visual effects when power-ups are active
- **Sound Packs**: Different typing sounds (mechanical, typewriter, etc.)
- **Particle Effects**: Cosmetic effects for key presses
- **Profile Badges**: Showcase achievements, streaks, rare items
- **Trading System**: Trade items with other players (with safety limits)
- **Premium Currency**: Optional real-money currency for exclusive items

### Phase 6 (Analytics & Optimization)

- **Item Popularity Tracking**: Which items sell best
- **Price Optimization**: A/B test different pricing tiers
- **Conversion Funnel**: Track shop visits → purchases
- **Coin Economy Balance**: Monitor inflation/deflation
- **User Spending Patterns**: Average coins per user, purchase frequency
- **Featured Item Performance**: Rotate based on engagement

---

## Notes

- **No Real Money**: This is a virtual coin economy only (no IAP in Phase 1)
- **Coin Balance Security**: All transactions validated server-side in Convex
- **Transaction History**: Maintained for debugging and potential customer support
- **Consumable vs Permanent**: Power-ups are consumable (quantity-based), cosmetics are permanent
- **Level Gating**: Some legendary items require minimum level to purchase
- **Streak Protection**: Streak freeze power-up prevents losing daily login streak
- **Featured Items**: Manually curated, can be rotated weekly/monthly
- **Sale Items**: Manual pricing overrides for promotions
- **Equip System**: Only one item per category can be equipped at a time
- **Preview System**: Theme/skin previews help users make informed purchases
- **Rarity Pricing**: Higher rarity = higher price, creates aspiration/progression
- **Daily Login Incentive**: Encourages daily engagement with increasing rewards
- **Multiple Earning Paths**: Players can earn coins through skill (high scores) or consistency (daily login)
- **Fair Economy**: Base lesson rewards (10 coins) ensure all players can eventually afford items
- **Backend-First**: All coin/inventory logic in Convex prevents client-side exploits
