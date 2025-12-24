import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get or create user from Clerk authentication
export const getOrCreateUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const clerkId = identity.subject;

    // Check if user exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (existingUser) {
      // Update last login
      await ctx.db.patch(existingUser._id, { lastLoginAt: Date.now() });
      return existingUser._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      clerkId,
      username: identity.name ?? undefined,
      email: identity.email ?? undefined,
      imageUrl: identity.pictureUrl ?? undefined,
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
    });

    // Initialize default game state for new user
    await ctx.db.insert("gameState", {
      userId,
      xp: 0,
      level: 1,
      totalXp: 0,
      combo: 0,
      maxCombo: 0,
      perfectStreak: 0,
      coins: 0,
      achievements: [],
      highScores: {},
      updatedAt: Date.now(),
    });

    // Initialize default settings for new user
    await ctx.db.insert("settings", {
      userId,
      keyboardLayout: "qwerty-us",
      language: "en",
      wordLanguage: undefined,
      mixEnglishWords: true,
      englishMixRatio: 0.3,
      activeThemes: [],
      themeMixRatio: 0.2,
      updatedAt: Date.now(),
    });

    return userId;
  },
});

// Get current user from Clerk identity
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});

// Get user by ID
export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db.get(userId);
  },
});

// Update user profile
export const updateProfile = mutation({
  args: {
    username: v.optional(v.string()),
  },
  handler: async (ctx, { username }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, {
      username: username ?? user.username,
    });

    return user._id;
  },
});

// ═══════════════════════════════════════════════════════════════════
// PRP-003: AVATAR SELECTION
// ═══════════════════════════════════════════════════════════════════

// Get user's selected avatar
export const getAvatar = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return "pixel-knight"; // Default avatar

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    return user?.avatarId || "pixel-knight";
  },
});

// Update user's avatar
export const updateAvatar = mutation({
  args: { avatarId: v.string() },
  handler: async (ctx, { avatarId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, { avatarId });

    return { success: true, avatarId };
  },
});
