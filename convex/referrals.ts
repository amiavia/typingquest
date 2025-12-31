/**
 * PRP-046: Referral System
 *
 * Manages referral codes, redemptions, and credit tracking.
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Generate a unique referral code for a user
 */
function generateReferralCode(username: string): string {
  // Take first 4 chars of username (alphanumeric only) + random suffix
  const prefix = username
    .replace(/[^a-zA-Z0-9]/g, "")
    .substring(0, 4)
    .toUpperCase();
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${suffix}`;
}

/**
 * Get or create a referral code for the current user
 */
export const getMyReferralCode = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("referralCodes")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    return existing;
  },
});

/**
 * Create a referral code for the current user
 */
export const createReferralCode = mutation({
  args: {
    clerkId: v.string(),
    username: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already has a code
    const existing = await ctx.db
      .query("referralCodes")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) {
      return existing;
    }

    // Generate unique code
    let code = generateReferralCode(args.username);
    let attempts = 0;

    // Ensure uniqueness
    while (attempts < 10) {
      const exists = await ctx.db
        .query("referralCodes")
        .withIndex("by_code", (q) => q.eq("code", code))
        .first();

      if (!exists) break;
      code = generateReferralCode(args.username);
      attempts++;
    }

    // Create the referral code
    const id = await ctx.db.insert("referralCodes", {
      clerkId: args.clerkId,
      code,
      totalReferrals: 0,
      totalCreditsEarned: 0,
      createdAt: Date.now(),
    });

    return await ctx.db.get(id);
  },
});

/**
 * Redeem a referral code (when a new user signs up with a code)
 */
export const redeemReferralCode = mutation({
  args: {
    code: v.string(),
    refereeClerkId: v.optional(v.string()),
    refereeEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Find the referral code
    const referralCode = await ctx.db
      .query("referralCodes")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .first();

    if (!referralCode) {
      return { success: false, error: "Invalid referral code" };
    }

    // Check if referee already redeemed a code
    if (args.refereeClerkId) {
      const existingRedemption = await ctx.db
        .query("referralRedemptions")
        .withIndex("by_referee", (q) => q.eq("refereeClerkId", args.refereeClerkId))
        .first();

      if (existingRedemption) {
        return { success: false, error: "You have already used a referral code" };
      }
    }

    // Create redemption record
    const redemptionId = await ctx.db.insert("referralRedemptions", {
      referralCodeId: referralCode._id,
      referrerClerkId: referralCode.clerkId,
      refereeClerkId: args.refereeClerkId,
      refereeEmail: args.refereeEmail,
      status: args.refereeClerkId ? "signed_up" : "pending",
      referrerCreditApplied: false,
      refereeCouponUsed: false,
      createdAt: Date.now(),
    });

    // Update referral code stats
    await ctx.db.patch(referralCode._id, {
      totalReferrals: referralCode.totalReferrals + 1,
    });

    return {
      success: true,
      redemptionId,
      referrerClerkId: referralCode.clerkId,
      discountCode: "FRIEND30", // The promo code for 30% off
    };
  },
});

/**
 * Check if user has a pending referral (for showing discount banner)
 */
export const getMyPendingReferral = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("referralRedemptions")
      .withIndex("by_referee", (q) => q.eq("refereeClerkId", args.clerkId))
      .filter((q) => q.neq(q.field("refereeCouponUsed"), true))
      .first();
  },
});

/**
 * Mark referee coupon as used (after they subscribe)
 */
export const markRefereeCouponUsed = mutation({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const redemption = await ctx.db
      .query("referralRedemptions")
      .withIndex("by_referee", (q) => q.eq("refereeClerkId", args.clerkId))
      .first();

    if (redemption) {
      await ctx.db.patch(redemption._id, {
        refereeCouponUsed: true,
        status: "subscribed",
        subscribedAt: Date.now(),
      });
      return { success: true };
    }

    return { success: false, error: "No referral found" };
  },
});

/**
 * Process referral conversion (when referee subscribes)
 * Awards credit to the referrer
 */
export const processReferralConversion = mutation({
  args: {
    refereeClerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Find the redemption
    const redemption = await ctx.db
      .query("referralRedemptions")
      .withIndex("by_referee", (q) => q.eq("refereeClerkId", args.refereeClerkId))
      .filter((q) => q.eq(q.field("referrerCreditApplied"), false))
      .first();

    if (!redemption) {
      return { success: false, error: "No pending referral credit" };
    }

    // Mark credit as applied
    await ctx.db.patch(redemption._id, {
      referrerCreditApplied: true,
      status: "credit_applied",
    });

    // Update referral code stats
    const referralCode = await ctx.db.get(redemption.referralCodeId);
    if (referralCode) {
      await ctx.db.patch(referralCode._id, {
        totalCreditsEarned: referralCode.totalCreditsEarned + 50, // 50% credit value
      });
    }

    return {
      success: true,
      referrerClerkId: redemption.referrerClerkId,
      creditAmount: 50, // Represents 50% off next month
    };
  },
});

/**
 * Get referral stats for a user (for the referral panel)
 */
export const getMyReferralStats = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const referralCode = await ctx.db
      .query("referralCodes")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!referralCode) {
      return {
        code: null,
        totalReferrals: 0,
        pendingCredits: 0,
        earnedCredits: 0,
        referrals: [],
      };
    }

    // Get all redemptions for this code
    const redemptions = await ctx.db
      .query("referralRedemptions")
      .withIndex("by_referrer", (q) => q.eq("referrerClerkId", args.clerkId))
      .collect();

    const pendingCredits = redemptions.filter(
      (r) => r.status === "subscribed" && !r.referrerCreditApplied
    ).length * 50;

    return {
      code: referralCode.code,
      totalReferrals: referralCode.totalReferrals,
      pendingCredits,
      earnedCredits: referralCode.totalCreditsEarned,
      referrals: redemptions.map((r) => ({
        status: r.status,
        createdAt: r.createdAt,
        subscribedAt: r.subscribedAt,
      })),
    };
  },
});
