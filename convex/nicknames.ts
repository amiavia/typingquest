/**
 * PRP-029: Nickname Privacy System
 * Convex functions for managing user nicknames
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { generateRandomNickname, validateNickname } from "./nicknameWords";
import { requireAdmin } from "./auth";

/**
 * Get user's display name (custom nickname > auto nickname > "Anonymous")
 */
export const getDisplayName = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) return null;

    return user.nickname || user.autoNickname || null;
  },
});

/**
 * Get current user's nickname info
 */
export const getNicknameInfo = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return null;

    return {
      displayName: user.nickname || user.autoNickname || null,
      customNickname: user.nickname || null,
      autoNickname: user.autoNickname || null,
      isCustom: user.isNicknameCustom ?? false,
      lastChanged: user.nicknameChangedAt || null,
    };
  },
});

/**
 * Set a custom nickname for the current user
 */
export const setNickname = mutation({
  args: { nickname: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { success: false, reason: "Not authenticated" };
    }

    // Validate nickname
    const validation = validateNickname(args.nickname);
    if (!validation.valid) {
      return { success: false, reason: validation.reason };
    }

    const trimmed = args.nickname.trim();

    // Check uniqueness across both nickname and autoNickname fields
    const existingNickname = await ctx.db
      .query("users")
      .withIndex("by_nickname", (q) => q.eq("nickname", trimmed))
      .first();

    const existingAutoNickname = await ctx.db
      .query("users")
      .withIndex("by_auto_nickname", (q) => q.eq("autoNickname", trimmed))
      .first();

    // Get current user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return { success: false, reason: "User not found" };
    }

    // Check if nickname is taken by someone else
    if (existingNickname && existingNickname._id !== user._id) {
      return { success: false, reason: "Nickname already taken" };
    }
    if (existingAutoNickname && existingAutoNickname._id !== user._id) {
      return { success: false, reason: "Nickname already taken" };
    }

    // Update user
    await ctx.db.patch(user._id, {
      nickname: trimmed,
      isNicknameCustom: true,
      nicknameChangedAt: Date.now(),
    });

    return { success: true, nickname: trimmed };
  },
});

/**
 * Clear custom nickname and revert to auto-generated one
 */
export const clearCustomNickname = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { success: false, reason: "Not authenticated" };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return { success: false, reason: "User not found" };
    }

    // If no auto nickname, generate one
    let autoNickname = user.autoNickname;
    if (!autoNickname) {
      autoNickname = await generateUniqueNickname(ctx);
    }

    await ctx.db.patch(user._id, {
      nickname: undefined,
      isNicknameCustom: false,
      autoNickname: autoNickname,
    });

    return { success: true, nickname: autoNickname };
  },
});

/**
 * Assign an auto-generated nickname to a user (called on registration or when needed)
 */
export const assignAutoNickname = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      return { success: false, reason: "User not found" };
    }

    // Skip if already has a nickname
    if (user.nickname || user.autoNickname) {
      return {
        success: true,
        nickname: user.nickname || user.autoNickname,
        alreadyHad: true,
      };
    }

    // Generate unique nickname
    const nickname = await generateUniqueNickname(ctx);

    await ctx.db.patch(user._id, {
      autoNickname: nickname,
      isNicknameCustom: false,
    });

    return { success: true, nickname, alreadyHad: false };
  },
});

/**
 * Ensure current user has a nickname (auto-assign if missing)
 */
export const ensureNickname = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { success: false, reason: "Not authenticated" };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return { success: false, reason: "User not found" };
    }

    // Already has a nickname
    if (user.nickname || user.autoNickname) {
      return {
        success: true,
        nickname: user.nickname || user.autoNickname,
        wasAssigned: false,
      };
    }

    // Generate and assign
    const nickname = await generateUniqueNickname(ctx);

    await ctx.db.patch(user._id, {
      autoNickname: nickname,
      isNicknameCustom: false,
    });

    return { success: true, nickname, wasAssigned: true };
  },
});

/**
 * Helper: Generate a unique nickname that doesn't exist in the database
 */
async function generateUniqueNickname(ctx: any): Promise<string> {
  let attempts = 0;
  const maxAttempts = 20;

  while (attempts < maxAttempts) {
    const nickname = generateRandomNickname();

    // Check if exists
    const existingNickname = await ctx.db
      .query("users")
      .withIndex("by_nickname", (q: any) => q.eq("nickname", nickname))
      .first();

    const existingAutoNickname = await ctx.db
      .query("users")
      .withIndex("by_auto_nickname", (q: any) => q.eq("autoNickname", nickname))
      .first();

    if (!existingNickname && !existingAutoNickname) {
      return nickname;
    }

    attempts++;
  }

  // Fallback: add timestamp to ensure uniqueness
  const baseNickname = generateRandomNickname();
  return `${baseNickname}${Date.now() % 10000}`;
}

/**
 * Migration: Assign auto-nicknames to all users who don't have one
 */
export const migrateAllUsersNicknames = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const users = await ctx.db.query("users").collect();
    let assigned = 0;
    let skipped = 0;

    for (const user of users) {
      if (user.nickname || user.autoNickname) {
        skipped++;
        continue;
      }

      const nickname = await generateUniqueNickname(ctx);
      await ctx.db.patch(user._id, {
        autoNickname: nickname,
        isNicknameCustom: false,
      });
      assigned++;
    }

    return { assigned, skipped, total: users.length };
  },
});
