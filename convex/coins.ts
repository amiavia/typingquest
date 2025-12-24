import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get current coin balance for a user
export const getCoinBalance = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      return 0;
    }

    // Get from gameState for existing users
    const gameState = await ctx.db
      .query("gameState")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    return gameState?.coins ?? 0;
  },
});

// Award coins to a user
export const awardCoins = mutation({
  args: {
    clerkId: v.string(),
    amount: v.number(),
    source: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    if (args.amount <= 0) {
      throw new Error("Amount must be positive");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Get current game state
    const gameState = await ctx.db
      .query("gameState")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    const currentBalance = gameState?.coins ?? 0;

    // Check if user is premium for 2x bonus
    const isPremium = user.isPremium === true;
    const finalAmount = isPremium ? args.amount * 2 : args.amount;
    const finalBalance = currentBalance + finalAmount;

    // Update game state
    if (gameState) {
      await ctx.db.patch(gameState._id, {
        coins: finalBalance,
        updatedAt: Date.now(),
      });
    }

    // Record transaction
    await ctx.db.insert("transactions", {
      clerkId: args.clerkId,
      type: isPremium ? "premium_bonus" : "earn",
      amount: finalAmount,
      source: args.source,
      metadata: args.metadata,
      balanceBefore: currentBalance,
      balanceAfter: finalBalance,
      timestamp: Date.now(),
    });

    return {
      newBalance: finalBalance,
      awarded: finalAmount,
      isPremiumBonus: isPremium,
    };
  },
});

// Spend coins
export const spendCoins = mutation({
  args: {
    clerkId: v.string(),
    amount: v.number(),
    source: v.string(),
    itemId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.amount <= 0) {
      throw new Error("Amount must be positive");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Get current game state
    const gameState = await ctx.db
      .query("gameState")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    const currentBalance = gameState?.coins ?? 0;

    if (currentBalance < args.amount) {
      throw new Error("Insufficient coins");
    }

    const newBalance = currentBalance - args.amount;

    // Update game state
    if (gameState) {
      await ctx.db.patch(gameState._id, {
        coins: newBalance,
        updatedAt: Date.now(),
      });
    }

    // Record transaction
    await ctx.db.insert("transactions", {
      clerkId: args.clerkId,
      type: "spend",
      amount: -args.amount,
      source: args.source,
      itemId: args.itemId,
      balanceBefore: currentBalance,
      balanceAfter: newBalance,
      timestamp: Date.now(),
    });

    return { newBalance };
  },
});

// Get transaction history
export const getTransactionHistory = query({
  args: {
    clerkId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .order("desc")
      .take(limit);

    return transactions;
  },
});

// Get coin stats for a user
export const getCoinStats = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .collect();

    const totalEarned = transactions
      .filter((t) => t.type === "earn" || t.type === "premium_bonus")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalSpent = transactions
      .filter((t) => t.type === "spend" || t.type === "purchase")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const premiumBonus = transactions
      .filter((t) => t.type === "premium_bonus")
      .reduce((sum, t) => sum + t.amount / 2, 0); // Half was bonus

    return {
      totalEarned,
      totalSpent,
      premiumBonus,
      transactionCount: transactions.length,
    };
  },
});
