import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const XP_PER_LEVEL = 100;
const COMBO_MULTIPLIER = 0.1;

// Get game state for a user
export const getGameState = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("gameState")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
  },
});

// Upsert entire game state (used for migration)
export const upsertGameState = mutation({
  args: {
    userId: v.id("users"),
    xp: v.number(),
    level: v.number(),
    totalXp: v.number(),
    combo: v.number(),
    maxCombo: v.number(),
    perfectStreak: v.number(),
    coins: v.number(),
    achievements: v.array(v.string()),
    highScores: v.any(),
  },
  handler: async (ctx, args) => {
    const { userId, ...data } = args;

    const existing = await ctx.db
      .query("gameState")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { ...data, updatedAt: Date.now() });
      return existing._id;
    }

    return await ctx.db.insert("gameState", {
      userId,
      ...data,
      updatedAt: Date.now(),
    });
  },
});

// Add XP with combo bonus
export const addXp = mutation({
  args: {
    userId: v.id("users"),
    baseXp: v.number(),
  },
  handler: async (ctx, { userId, baseXp }) => {
    const state = await ctx.db
      .query("gameState")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!state) throw new Error("Game state not found");

    const comboBonus = Math.floor(baseXp * state.combo * COMBO_MULTIPLIER);
    const totalGained = baseXp + comboBonus;
    const newTotalXp = state.totalXp + totalGained;
    let newXp = state.xp + totalGained;
    let newLevel = state.level;

    while (newXp >= XP_PER_LEVEL) {
      newXp -= XP_PER_LEVEL;
      newLevel++;
    }

    await ctx.db.patch(state._id, {
      xp: newXp,
      level: newLevel,
      totalXp: newTotalXp,
      updatedAt: Date.now(),
    });

    return { newXp, newLevel, totalGained };
  },
});

// Add coins
export const addCoins = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
  },
  handler: async (ctx, { userId, amount }) => {
    const state = await ctx.db
      .query("gameState")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!state) throw new Error("Game state not found");

    await ctx.db.patch(state._id, {
      coins: state.coins + amount,
      updatedAt: Date.now(),
    });

    return state.coins + amount;
  },
});

// Update combo (increment or reset)
export const updateCombo = mutation({
  args: {
    userId: v.id("users"),
    action: v.union(v.literal("increment"), v.literal("reset")),
  },
  handler: async (ctx, { userId, action }) => {
    const state = await ctx.db
      .query("gameState")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!state) throw new Error("Game state not found");

    if (action === "increment") {
      const newCombo = state.combo + 1;
      await ctx.db.patch(state._id, {
        combo: newCombo,
        maxCombo: Math.max(state.maxCombo, newCombo),
        updatedAt: Date.now(),
      });
      return newCombo;
    } else {
      await ctx.db.patch(state._id, {
        combo: 0,
        updatedAt: Date.now(),
      });
      return 0;
    }
  },
});

// Update perfect streak
export const updatePerfectStreak = mutation({
  args: {
    userId: v.id("users"),
    action: v.union(v.literal("increment"), v.literal("reset")),
  },
  handler: async (ctx, { userId, action }) => {
    const state = await ctx.db
      .query("gameState")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!state) throw new Error("Game state not found");

    const newStreak = action === "increment" ? state.perfectStreak + 1 : 0;

    await ctx.db.patch(state._id, {
      perfectStreak: newStreak,
      updatedAt: Date.now(),
    });

    return newStreak;
  },
});

// Unlock achievement
export const unlockAchievement = mutation({
  args: {
    userId: v.id("users"),
    achievementId: v.string(),
  },
  handler: async (ctx, { userId, achievementId }) => {
    const state = await ctx.db
      .query("gameState")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!state) throw new Error("Game state not found");
    if (state.achievements.includes(achievementId)) return false;

    await ctx.db.patch(state._id, {
      achievements: [...state.achievements, achievementId],
      updatedAt: Date.now(),
    });

    return true;
  },
});

// Set high score for a lesson
export const setHighScore = mutation({
  args: {
    userId: v.id("users"),
    lessonId: v.number(),
    score: v.number(),
  },
  handler: async (ctx, { userId, lessonId, score }) => {
    const state = await ctx.db
      .query("gameState")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!state) throw new Error("Game state not found");

    const currentHighScore = state.highScores?.[lessonId] ?? 0;
    if (score <= currentHighScore) return false;

    await ctx.db.patch(state._id, {
      highScores: { ...state.highScores, [lessonId]: score },
      updatedAt: Date.now(),
    });

    return true;
  },
});
