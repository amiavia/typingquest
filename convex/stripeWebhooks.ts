/**
 * PRP-048: Stripe Webhook Handlers
 *
 * Internal mutations called by the HTTP webhook endpoint.
 * Handles subscription lifecycle events from Stripe.
 */

import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Handle successful checkout completion
 * Called when a customer completes the Stripe Checkout flow
 */
export const handleCheckoutComplete = internalMutation({
  args: {
    sessionId: v.string(),
    customerId: v.string(),
    subscriptionId: v.string(),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("[Stripe Webhook] Checkout complete:", {
      sessionId: args.sessionId,
      customerId: args.customerId,
      subscriptionId: args.subscriptionId,
      clerkId: args.clerkId,
    });

    // Update user's Stripe customer ID if not already set
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (user && !user.stripeCustomerId) {
      await ctx.db.patch(user._id, {
        stripeCustomerId: args.customerId,
      });
    }

    return { success: true };
  },
});

/**
 * Handle subscription created or updated
 * Called on: customer.subscription.created, customer.subscription.updated
 */
export const handleSubscriptionUpdate = internalMutation({
  args: {
    subscriptionId: v.string(),
    customerId: v.string(),
    status: v.string(),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.boolean(),
    priceId: v.string(),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("[Stripe Webhook] Subscription update:", {
      subscriptionId: args.subscriptionId,
      status: args.status,
      clerkId: args.clerkId,
    });

    const isActive = ["active", "trialing"].includes(args.status);

    // Determine plan type from price ID
    const plan = args.priceId.includes("year") ? "yearly" : "monthly";

    // Upsert subscription record
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripe_subscription", (q) =>
        q.eq("stripeSubscriptionId", args.subscriptionId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        currentPeriodStart: args.currentPeriodStart * 1000,
        currentPeriodEnd: args.currentPeriodEnd * 1000,
        cancelAtPeriodEnd: args.cancelAtPeriodEnd,
        plan,
      });
    } else {
      await ctx.db.insert("subscriptions", {
        clerkId: args.clerkId,
        stripeSubscriptionId: args.subscriptionId,
        stripeCustomerId: args.customerId,
        status: args.status,
        plan,
        currentPeriodStart: args.currentPeriodStart * 1000,
        currentPeriodEnd: args.currentPeriodEnd * 1000,
        cancelAtPeriodEnd: args.cancelAtPeriodEnd,
        createdAt: Date.now(),
      });
    }

    // Update user premium status
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (user) {
      await ctx.db.patch(user._id, {
        isPremium: isActive,
        premiumExpiresAt: args.currentPeriodEnd * 1000,
        stripeCustomerId: args.customerId,
      });
    }

    // Grant monthly streak freezes if subscription is newly active
    if (isActive) {
      const streak = await ctx.db
        .query("streaks")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
        .first();

      if (streak) {
        // Only grant if this is a new subscription period
        // (avoid double-granting on updates)
        const lastGrant = streak.streakFreezeUsedDates?.length > 0
          ? Math.max(...streak.streakFreezeUsedDates.map(d => new Date(d).getTime()))
          : 0;
        const periodStart = args.currentPeriodStart * 1000;

        if (periodStart > lastGrant) {
          await ctx.db.patch(streak._id, {
            streakFreezeCount: streak.streakFreezeCount + 3,
          });
          console.log("[Stripe Webhook] Granted 3 streak freezes to:", args.clerkId);
        }
      }
    }

    return { success: true, status: args.status };
  },
});

/**
 * Handle subscription deleted/canceled
 * Called on: customer.subscription.deleted
 */
export const handleSubscriptionDeleted = internalMutation({
  args: {
    subscriptionId: v.string(),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("[Stripe Webhook] Subscription deleted:", {
      subscriptionId: args.subscriptionId,
      clerkId: args.clerkId,
    });

    // Update subscription status
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripe_subscription", (q) =>
        q.eq("stripeSubscriptionId", args.subscriptionId)
      )
      .first();

    if (subscription) {
      await ctx.db.patch(subscription._id, {
        status: "canceled",
      });
    }

    // Update user premium status
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (user) {
      await ctx.db.patch(user._id, {
        isPremium: false,
      });
    }

    return { success: true };
  },
});

/**
 * Handle payment failure
 * Called on: invoice.payment_failed
 */
export const handlePaymentFailed = internalMutation({
  args: {
    customerId: v.string(),
    subscriptionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    console.log("[Stripe Webhook] Payment failed:", {
      customerId: args.customerId,
      subscriptionId: args.subscriptionId,
    });

    if (args.subscriptionId) {
      const subscriptionId = args.subscriptionId;
      const subscription = await ctx.db
        .query("subscriptions")
        .withIndex("by_stripe_subscription", (q) =>
          q.eq("stripeSubscriptionId", subscriptionId)
        )
        .first();

      if (subscription) {
        await ctx.db.patch(subscription._id, {
          status: "past_due",
        });
      }
    }

    // TODO: Send email notification about failed payment

    return { success: true };
  },
});

/**
 * Get clerkId from Stripe customer ID
 * Used when webhook doesn't include clerkId in metadata
 */
export const getClerkIdFromCustomer = internalMutation({
  args: { stripeCustomerId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_stripe_customer", (q) =>
        q.eq("stripeCustomerId", args.stripeCustomerId)
      )
      .first();

    return user?.clerkId || null;
  },
});
