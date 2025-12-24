import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get settings for a user
export const getSettings = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("settings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
  },
});

// Upsert all settings
export const upsertSettings = mutation({
  args: {
    userId: v.id("users"),
    keyboardLayout: v.string(),
    language: v.string(),
    wordLanguage: v.optional(v.string()),
    mixEnglishWords: v.boolean(),
    englishMixRatio: v.number(),
    activeThemes: v.array(v.string()),
    themeMixRatio: v.number(),
  },
  handler: async (ctx, args) => {
    const { userId, ...data } = args;

    const existing = await ctx.db
      .query("settings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { ...data, updatedAt: Date.now() });
      return existing._id;
    }

    return await ctx.db.insert("settings", {
      userId,
      ...data,
      updatedAt: Date.now(),
    });
  },
});

// Update a single setting
export const updateSetting = mutation({
  args: {
    userId: v.id("users"),
    key: v.string(),
    value: v.any(),
  },
  handler: async (ctx, { userId, key, value }) => {
    const existing = await ctx.db
      .query("settings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!existing) throw new Error("Settings not found");

    await ctx.db.patch(existing._id, {
      [key]: value,
      updatedAt: Date.now(),
    });

    return existing._id;
  },
});

// Update keyboard layout
export const setKeyboardLayout = mutation({
  args: {
    userId: v.id("users"),
    layout: v.string(),
  },
  handler: async (ctx, { userId, layout }) => {
    const existing = await ctx.db
      .query("settings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!existing) throw new Error("Settings not found");

    await ctx.db.patch(existing._id, {
      keyboardLayout: layout,
      updatedAt: Date.now(),
    });
  },
});

// Update language
export const setLanguage = mutation({
  args: {
    userId: v.id("users"),
    language: v.string(),
  },
  handler: async (ctx, { userId, language }) => {
    const existing = await ctx.db
      .query("settings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!existing) throw new Error("Settings not found");

    await ctx.db.patch(existing._id, {
      language,
      updatedAt: Date.now(),
    });
  },
});

// Toggle a theme
export const toggleTheme = mutation({
  args: {
    userId: v.id("users"),
    themeId: v.string(),
  },
  handler: async (ctx, { userId, themeId }) => {
    const existing = await ctx.db
      .query("settings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!existing) throw new Error("Settings not found");

    const activeThemes = existing.activeThemes.includes(themeId)
      ? existing.activeThemes.filter((t) => t !== themeId)
      : [...existing.activeThemes, themeId];

    await ctx.db.patch(existing._id, {
      activeThemes,
      updatedAt: Date.now(),
    });

    return activeThemes;
  },
});

// Update word mixing settings
export const setWordMixing = mutation({
  args: {
    userId: v.id("users"),
    mixEnglishWords: v.boolean(),
    englishMixRatio: v.number(),
  },
  handler: async (ctx, { userId, mixEnglishWords, englishMixRatio }) => {
    const existing = await ctx.db
      .query("settings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!existing) throw new Error("Settings not found");

    await ctx.db.patch(existing._id, {
      mixEnglishWords,
      englishMixRatio: Math.max(0, Math.min(1, englishMixRatio)),
      updatedAt: Date.now(),
    });
  },
});
