import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Power-up configuration
export const POWER_UP_CONFIG = {
  "xp-boost": {
    multiplier: 1.5, // 50% more XP
    duration: 30 * 60 * 1000, // 30 minutes
    type: "timed",
  },
  "coin-magnet": {
    multiplier: 2.0, // Double coins
    duration: 30 * 60 * 1000, // 30 minutes
    type: "timed",
  },
  "hint-token": {
    uses: 3, // 3 hints per token
    type: "consumable",
  },
  "streak-freeze": {
    uses: 1, // Single use
    type: "consumable",
  },
} as const;

// Get all active power-ups for a user
export const getActivePowerUps = query({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const now = Date.now();
    const powerUps = await ctx.db
      .query("activePowerUps")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .collect();

    // Filter to only active ones (not expired, has uses remaining)
    return powerUps.filter((powerUp) => {
      if (powerUp.expiresAt && powerUp.expiresAt < now) {
        return false;
      }
      if (powerUp.remainingUses !== undefined && powerUp.remainingUses <= 0) {
        return false;
      }
      return true;
    });
  },
});

// Check if a specific power-up type is active
export const isPowerUpActive = query({
  args: { clerkId: v.string(), powerUpType: v.string() },
  handler: async (ctx, { clerkId, powerUpType }) => {
    const now = Date.now();
    const powerUp = await ctx.db
      .query("activePowerUps")
      .withIndex("by_clerk_type", (q) =>
        q.eq("clerkId", clerkId).eq("powerUpType", powerUpType)
      )
      .first();

    if (!powerUp) return null;

    // Check if expired
    if (powerUp.expiresAt && powerUp.expiresAt < now) {
      return null;
    }

    // Check if uses remaining
    if (powerUp.remainingUses !== undefined && powerUp.remainingUses <= 0) {
      return null;
    }

    return powerUp;
  },
});

// Get active multipliers for XP and coins
export const getActiveMultipliers = query({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const now = Date.now();
    const powerUps = await ctx.db
      .query("activePowerUps")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .collect();

    let xpMultiplier = 1.0;
    let coinMultiplier = 1.0;

    for (const powerUp of powerUps) {
      // Skip expired
      if (powerUp.expiresAt && powerUp.expiresAt < now) {
        continue;
      }

      if (powerUp.powerUpType === "xp-boost" && powerUp.multiplier) {
        xpMultiplier = Math.max(xpMultiplier, powerUp.multiplier);
      }
      if (powerUp.powerUpType === "coin-magnet" && powerUp.multiplier) {
        coinMultiplier = Math.max(coinMultiplier, powerUp.multiplier);
      }
    }

    return { xpMultiplier, coinMultiplier };
  },
});

// Activate a power-up from inventory
export const activatePowerUp = mutation({
  args: { clerkId: v.string(), itemId: v.string() },
  handler: async (ctx, { clerkId, itemId }) => {
    // Check if user owns this item
    const inventoryItem = await ctx.db
      .query("inventory")
      .withIndex("by_clerk_item", (q) =>
        q.eq("clerkId", clerkId).eq("itemId", itemId)
      )
      .first();

    if (!inventoryItem || inventoryItem.quantity <= 0) {
      throw new Error("You don't own this power-up");
    }

    // Get power-up config
    const config = POWER_UP_CONFIG[itemId as keyof typeof POWER_UP_CONFIG];
    if (!config) {
      throw new Error("Invalid power-up type");
    }

    // Check if already active
    const existing = await ctx.db
      .query("activePowerUps")
      .withIndex("by_clerk_type", (q) =>
        q.eq("clerkId", clerkId).eq("powerUpType", itemId)
      )
      .first();

    const now = Date.now();

    if (existing) {
      // For timed power-ups, extend duration
      if (config.type === "timed" && existing.expiresAt) {
        const newExpiry = Math.max(existing.expiresAt, now) + config.duration;
        await ctx.db.patch(existing._id, { expiresAt: newExpiry });
      }
      // For consumable, add uses
      else if (config.type === "consumable" && "uses" in config) {
        await ctx.db.patch(existing._id, {
          remainingUses: (existing.remainingUses || 0) + config.uses,
        });
      }
    } else {
      // Create new active power-up
      await ctx.db.insert("activePowerUps", {
        clerkId,
        powerUpType: itemId,
        multiplier: "multiplier" in config ? config.multiplier : undefined,
        remainingUses: "uses" in config ? config.uses : undefined,
        expiresAt: "duration" in config ? now + config.duration : undefined,
        activatedAt: now,
      });
    }

    // Decrease quantity in inventory
    if (inventoryItem.quantity <= 1) {
      await ctx.db.delete(inventoryItem._id);
    } else {
      await ctx.db.patch(inventoryItem._id, {
        quantity: inventoryItem.quantity - 1,
      });
    }

    return { success: true };
  },
});

// Use a hint token (consume one use)
export const useHintToken = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const powerUp = await ctx.db
      .query("activePowerUps")
      .withIndex("by_clerk_type", (q) =>
        q.eq("clerkId", clerkId).eq("powerUpType", "hint-token")
      )
      .first();

    if (!powerUp || !powerUp.remainingUses || powerUp.remainingUses <= 0) {
      throw new Error("No hint tokens available");
    }

    await ctx.db.patch(powerUp._id, {
      remainingUses: powerUp.remainingUses - 1,
    });

    return { remainingUses: powerUp.remainingUses - 1 };
  },
});

// Use streak freeze (called when streak would be lost)
export const useStreakFreeze = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const powerUp = await ctx.db
      .query("activePowerUps")
      .withIndex("by_clerk_type", (q) =>
        q.eq("clerkId", clerkId).eq("powerUpType", "streak-freeze")
      )
      .first();

    if (!powerUp || !powerUp.remainingUses || powerUp.remainingUses <= 0) {
      return { success: false, reason: "No streak freeze available" };
    }

    await ctx.db.patch(powerUp._id, {
      remainingUses: powerUp.remainingUses - 1,
    });

    // Also update the streaks table to record freeze usage
    const streak = await ctx.db
      .query("streaks")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();

    if (streak) {
      const today = new Date().toISOString().split("T")[0];
      await ctx.db.patch(streak._id, {
        streakFreezeUsedDates: [...streak.streakFreezeUsedDates, today],
      });
    }

    return { success: true };
  },
});

// Clean up expired power-ups (can be called periodically)
export const cleanupExpiredPowerUps = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const now = Date.now();
    const powerUps = await ctx.db
      .query("activePowerUps")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .collect();

    let cleaned = 0;
    for (const powerUp of powerUps) {
      const shouldDelete =
        (powerUp.expiresAt && powerUp.expiresAt < now) ||
        (powerUp.remainingUses !== undefined && powerUp.remainingUses <= 0);

      if (shouldDelete) {
        await ctx.db.delete(powerUp._id);
        cleaned++;
      }
    }

    return { cleaned };
  },
});
