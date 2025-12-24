import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Premium subscription plans
export const PLANS = {
  monthly: {
    id: "monthly",
    name: "Monthly Premium",
    price: 4.99,
    interval: "month",
    stripePriceId: "", // Set via environment
  },
  yearly: {
    id: "yearly",
    name: "Yearly Premium",
    price: 39.99,
    interval: "year",
    stripePriceId: "", // Set via environment
    savings: "33%",
  },
};

// Premium benefits list
export const PREMIUM_BENEFITS = [
  { icon: "coin", title: "2x Coin Earnings", description: "Double coins on all activities" },
  { icon: "freeze", title: "3 Free Streak Freezes/Month", description: "Protect your streak" },
  { icon: "shop", title: "Exclusive Shop Items", description: "Access premium-only cosmetics" },
  { icon: "badge", title: "Premium Badge", description: "Show off your supporter status" },
  { icon: "priority", title: "Priority Support", description: "Get help faster" },
  { icon: "ad-free", title: "Ad-Free Experience", description: "No distractions" },
];

// Check if user is premium
export const isPremium = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      return false;
    }

    // Check if premium and not expired
    if (user.isPremium && user.premiumExpiresAt) {
      return user.premiumExpiresAt > Date.now();
    }

    return user.isPremium === true;
  },
});

// Get full premium status
export const getPremiumStatus = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      return {
        isPremium: false,
        plan: null,
        expiresAt: null,
        cancelAtPeriodEnd: false,
      };
    }

    // Get subscription details
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    const isPremiumActive =
      user.isPremium === true &&
      (!user.premiumExpiresAt || user.premiumExpiresAt > Date.now());

    return {
      isPremium: isPremiumActive,
      plan: subscription?.plan ?? null,
      expiresAt: user.premiumExpiresAt ?? null,
      cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd ?? false,
      stripeCustomerId: user.stripeCustomerId,
      currentPeriodEnd: subscription?.currentPeriodEnd,
    };
  },
});

// Get available plans
export const getPlans = query({
  args: {},
  handler: async () => {
    return Object.values(PLANS);
  },
});

// Get premium benefits
export const getBenefits = query({
  args: {},
  handler: async () => {
    return PREMIUM_BENEFITS;
  },
});

// Update user premium status (called by webhook)
export const updatePremiumStatus = mutation({
  args: {
    clerkId: v.string(),
    isPremium: v.boolean(),
    premiumExpiresAt: v.optional(v.number()),
    stripeCustomerId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      isPremium: args.isPremium,
      premiumExpiresAt: args.premiumExpiresAt,
      stripeCustomerId: args.stripeCustomerId ?? user.stripeCustomerId,
    });

    return { success: true };
  },
});

// Create or update subscription record
export const upsertSubscription = mutation({
  args: {
    clerkId: v.string(),
    stripeSubscriptionId: v.string(),
    stripeCustomerId: v.string(),
    status: v.string(),
    plan: v.string(),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Check for existing subscription
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        stripeSubscriptionId: args.stripeSubscriptionId,
        stripeCustomerId: args.stripeCustomerId,
        status: args.status,
        plan: args.plan,
        currentPeriodStart: args.currentPeriodStart,
        currentPeriodEnd: args.currentPeriodEnd,
        cancelAtPeriodEnd: args.cancelAtPeriodEnd,
      });
      return existing._id;
    }

    return await ctx.db.insert("subscriptions", {
      clerkId: args.clerkId,
      stripeSubscriptionId: args.stripeSubscriptionId,
      stripeCustomerId: args.stripeCustomerId,
      status: args.status,
      plan: args.plan,
      currentPeriodStart: args.currentPeriodStart,
      currentPeriodEnd: args.currentPeriodEnd,
      cancelAtPeriodEnd: args.cancelAtPeriodEnd,
      createdAt: Date.now(),
    });
  },
});

// Get subscription by Stripe subscription ID
export const getSubscriptionByStripeId = query({
  args: { stripeSubscriptionId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_stripe_subscription", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId)
      )
      .first();
  },
});

// Cancel subscription (mark for cancellation at period end)
export const cancelSubscription = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!subscription) {
      return { success: false, reason: "No subscription found" };
    }

    // Mark for cancellation at period end
    await ctx.db.patch(subscription._id, {
      cancelAtPeriodEnd: true,
    });

    return { success: true };
  },
});

// Reactivate a cancelled subscription
export const reactivateSubscription = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!subscription) {
      return { success: false, reason: "No subscription found" };
    }

    if (subscription.status !== "active") {
      return { success: false, reason: "Subscription not active" };
    }

    await ctx.db.patch(subscription._id, {
      cancelAtPeriodEnd: false,
    });

    return { success: true };
  },
});

// Get user by Stripe customer ID
export const getUserByStripeCustomerId = query({
  args: { stripeCustomerId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_stripe_customer", (q) =>
        q.eq("stripeCustomerId", args.stripeCustomerId)
      )
      .first();
  },
});

// Grant monthly premium freezes (called by cron/webhook on subscription renewal)
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

// Check coin multiplier for premium users
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

    // Check if premium and not expired
    if (user.isPremium && user.premiumExpiresAt) {
      if (user.premiumExpiresAt > Date.now()) {
        return 2;
      }
      return 1;
    }

    return user.isPremium === true ? 2 : 1;
  },
});
