/**
 * PRP-030/048: Premium Module
 *
 * Helper queries for benefits display and coin multipliers.
 *
 * MIGRATION NOTE (PRP-048):
 * - Subscription management: Now handled by direct Stripe integration (stripe.ts, stripeWebhooks.ts)
 * - Premium status: Synced via Stripe webhooks to Convex subscriptions table
 * - Checkout: Custom Stripe Checkout Session (PremiumPage.tsx)
 * - Portal: Stripe Customer Portal for subscription management
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Premium subscription plans (for display only - actual plans configured in Clerk Dashboard)
export const PLANS = {
  monthly: {
    id: "premium_monthly",
    name: "Monthly Premium",
    price: 4.99,
    interval: "month",
  },
  yearly: {
    id: "premium_yearly",
    name: "Yearly Premium",
    price: 39.99,
    interval: "year",
    savings: "33%",
  },
};

// Premium benefits list (for display)
export const PREMIUM_BENEFITS = [
  { icon: "coin", title: "2x Coin Earnings", description: "Double coins on all activities" },
  { icon: "freeze", title: "3 Free Streak Freezes/Month", description: "Protect your streak" },
  { icon: "shop", title: "Exclusive Shop Items", description: "Access premium-only cosmetics" },
  { icon: "badge", title: "Premium Badge", description: "Show off your supporter status" },
  { icon: "priority", title: "Priority Support", description: "Get help faster" },
  { icon: "ad-free", title: "Ad-Free Experience", description: "No distractions" },
];

// Get available plans (for display purposes)
export const getPlans = query({
  args: {},
  handler: async () => {
    return Object.values(PLANS);
  },
});

// Get premium benefits (for display purposes)
export const getBenefits = query({
  args: {},
  handler: async () => {
    return PREMIUM_BENEFITS;
  },
});

/**
 * Check if user is premium by checking the users table
 * This is used as a backup for Convex mutations that need to check premium status
 * The primary check should be done via Clerk's has() in the frontend
 */
export const isPremiumByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      return false;
    }

    // Check if premium flag is set
    // With Clerk Billing, this should be synced via Clerk webhooks
    return user.isPremium === true;
  },
});

/**
 * @deprecated PRP-048: No longer needed - premium status now synced via Stripe webhooks
 * See stripeWebhooks.ts handleSubscriptionUpdate for the new implementation
 */
export const syncPremiumStatus = mutation({
  args: {
    clerkId: v.string(),
    isPremium: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      console.warn(`User not found for premium sync: ${args.clerkId}`);
      return { success: false, reason: "User not found" };
    }

    await ctx.db.patch(user._id, {
      isPremium: args.isPremium,
    });

    return { success: true };
  },
});

/**
 * Grant monthly premium benefits (streak freezes)
 * This can be triggered by a Clerk subscription webhook or scheduled job
 */
export const grantMonthlyPremiumBenefits = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const MONTHLY_FREE_FREEZES = 3;

    // Get or create streak record
    let streak = await ctx.db
      .query("streaks")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!streak) {
      await ctx.db.insert("streaks", {
        clerkId: args.clerkId,
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: "",
        streakFreezeCount: MONTHLY_FREE_FREEZES,
        streakFreezeUsedDates: [],
        totalDaysActive: 0,
      });
    } else {
      await ctx.db.patch(streak._id, {
        streakFreezeCount: streak.streakFreezeCount + MONTHLY_FREE_FREEZES,
      });
    }

    return { freezesGranted: MONTHLY_FREE_FREEZES };
  },
});

/**
 * Get coin multiplier for a user
 * Uses local isPremium flag which should be synced with Clerk
 */
export const getCoinMultiplier = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      return 1;
    }

    return user.isPremium === true ? 2 : 1;
  },
});

// ═══════════════════════════════════════════════════════════════════
// PRP-048: MIGRATION TO DIRECT STRIPE
// These functions have been replaced by direct Stripe integration
// ═══════════════════════════════════════════════════════════════════

/*
MIGRATED FUNCTIONS (PRP-048):
- Subscription queries: See subscriptions.ts (getActiveSubscription, isPremium)
- Checkout: See stripe.ts (createCheckoutSession)
- Portal: See stripe.ts (createPortalSession)
- Webhooks: See stripeWebhooks.ts (handleSubscriptionUpdate, etc.)
- Premium sync: Now automatic via Stripe webhooks (no PremiumSyncProvider needed)
*/
