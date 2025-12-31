/**
 * PRP-048: Direct Stripe Integration
 *
 * Replaces Clerk Billing with direct Stripe Checkout and Customer Portal.
 * Supports regional pricing for emerging markets.
 */

import Stripe from "stripe";
import { action, internalQuery, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// Price IDs - LIVE MODE
export const PRICE_IDS = {
  standard: {
    monthly: "price_1SiAt7RgxsaId95cwy49HI5m", // $4.99/mo
    yearly: "price_1SiAt9RgxsaId95cgBlKm5Fo", // $39.99/yr
  },
  emerging: {
    monthly: "price_1SkLnSRgxsaId95cjhr3uqrP", // $1.99/mo
    yearly: "price_1SkLnTRgxsaId95cKjXeSEN2", // $14.99/yr
  },
};

// Emerging market country codes
export const EMERGING_MARKETS = [
  "IN", // India
  "BR", // Brazil
  "ID", // Indonesia
  "PH", // Philippines
  "VN", // Vietnam
  "PK", // Pakistan
  "BD", // Bangladesh
  "NG", // Nigeria
  "MX", // Mexico
  "CO", // Colombia
  "AR", // Argentina
  "PE", // Peru
  "EG", // Egypt
  "ZA", // South Africa
  "KE", // Kenya
  "TH", // Thailand
  "MY", // Malaysia
  "TR", // Turkey
  "UA", // Ukraine
  "PL", // Poland
];

/**
 * Create Stripe Checkout Session for subscription
 */
export const createCheckoutSession = action({
  args: {
    priceId: v.string(),
    clerkId: v.string(),
    email: v.optional(v.string()),
    successUrl: v.string(),
    cancelUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    // Get or create Stripe customer
    let customerId: string;

    // Check if user already has a Stripe customer ID
    const user = await ctx.runQuery(internal.stripe.getUserByClerkId, {
      clerkId: args.clerkId,
    });

    if (user?.stripeCustomerId) {
      customerId = user.stripeCustomerId;
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: args.email,
        metadata: { clerkId: args.clerkId },
      });
      customerId = customer.id;

      // Save customer ID to user
      await ctx.runMutation(internal.stripe.updateUserStripeCustomer, {
        clerkId: args.clerkId,
        stripeCustomerId: customerId,
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: args.priceId, quantity: 1 }],
      success_url: args.successUrl,
      cancel_url: args.cancelUrl,
      allow_promotion_codes: true, // Enable FRIEND30, WELCOME20
      subscription_data: {
        metadata: { clerkId: args.clerkId },
      },
      metadata: { clerkId: args.clerkId },
    });

    return { url: session.url, sessionId: session.id };
  },
});

/**
 * Create Stripe Customer Portal Session for subscription management
 */
export const createPortalSession = action({
  args: {
    clerkId: v.string(),
    returnUrl: v.string(),
  },
  handler: async (ctx, args): Promise<{ url: string | null }> => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    const user = await ctx.runQuery(internal.stripe.getUserByClerkId, {
      clerkId: args.clerkId,
    });

    if (!user?.stripeCustomerId) {
      throw new Error("No Stripe customer found. Please subscribe first.");
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: args.returnUrl,
    });

    return { url: portalSession.url };
  },
});

/**
 * Get the correct price ID based on country
 */
export const getPriceIdForCountry = action({
  args: {
    country: v.string(),
    interval: v.union(v.literal("monthly"), v.literal("yearly")),
  },
  handler: async (_ctx, args) => {
    const isEmerging = EMERGING_MARKETS.includes(args.country.toUpperCase());
    const prices = isEmerging ? PRICE_IDS.emerging : PRICE_IDS.standard;
    return prices[args.interval];
  },
});

// ═══════════════════════════════════════════════════════════════════
// INTERNAL QUERIES & MUTATIONS
// ═══════════════════════════════════════════════════════════════════

export const getUserByClerkId = internalQuery({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

export const updateUserStripeCustomer = internalMutation({
  args: {
    clerkId: v.string(),
    stripeCustomerId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (user) {
      await ctx.db.patch(user._id, {
        stripeCustomerId: args.stripeCustomerId,
      });
    }
  },
});
