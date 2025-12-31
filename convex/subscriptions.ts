/**
 * PRP-048: Subscription Queries
 *
 * Public queries for checking subscription status from the frontend.
 * Used by usePremium hook to determine premium access.
 */

import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get active subscription for a user
 * Returns null if no active subscription found
 */
export const getActiveSubscription = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!subscription) return null;

    // Check if subscription is still valid
    const now = Date.now();
    const isExpired =
      subscription.currentPeriodEnd < now &&
      !["active", "trialing"].includes(subscription.status);

    if (isExpired) {
      return null;
    }

    return {
      id: subscription._id,
      status: subscription.status,
      plan: subscription.plan,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
    };
  },
});

/**
 * Check if user has premium access (simplified boolean check)
 */
export const isPremium = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    // First check user's isPremium flag (synced by webhooks)
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (user?.isPremium) {
      // Verify premium hasn't expired
      if (user.premiumExpiresAt && user.premiumExpiresAt > Date.now()) {
        return true;
      }
    }

    // Fallback: check subscription directly
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!subscription) return false;

    return (
      ["active", "trialing"].includes(subscription.status) &&
      subscription.currentPeriodEnd > Date.now()
    );
  },
});

/**
 * Get subscription history for a user
 */
export const getSubscriptionHistory = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const subscriptions = await ctx.db
      .query("subscriptions")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .collect();

    return subscriptions.map((sub) => ({
      id: sub._id,
      status: sub.status,
      plan: sub.plan,
      currentPeriodStart: sub.currentPeriodStart,
      currentPeriodEnd: sub.currentPeriodEnd,
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
      createdAt: sub.createdAt,
    }));
  },
});

/**
 * Get premium benefits for display
 */
export const getPremiumBenefits = query({
  args: {},
  handler: async () => {
    return [
      {
        icon: "coin",
        title: "2x Coin Earnings",
        description: "Double coins on all activities",
      },
      {
        icon: "freeze",
        title: "3 Free Streak Freezes/Month",
        description: "Protect your streak",
      },
      {
        icon: "shop",
        title: "Exclusive Shop Items",
        description: "Access premium-only cosmetics",
      },
      {
        icon: "levels",
        title: "44 Extra Levels",
        description: "Unlock levels 7-50",
      },
      {
        icon: "badge",
        title: "Premium Badge",
        description: "Show off your supporter status",
      },
      {
        icon: "priority",
        title: "Priority Support",
        description: "Get help faster",
      },
    ];
  },
});
