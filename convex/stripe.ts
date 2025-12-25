/**
 * PRP-025: Stripe Integration Actions
 *
 * Server-side Stripe actions for checkout and billing portal.
 * Uses "use node" directive for Node.js Stripe SDK.
 */

"use node";

import Stripe from "stripe";
import { action } from "./_generated/server";
import { v } from "convex/values";

// Initialize Stripe with secret key
const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY environment variable is not set");
  }
  return new Stripe(secretKey, {
    apiVersion: "2024-12-18.acacia",
  });
};

/**
 * Create a Stripe Checkout Session for subscription
 */
export const createCheckoutSession = action({
  args: {
    clerkId: v.string(),
    email: v.string(),
    plan: v.union(v.literal("monthly"), v.literal("yearly")),
    successUrl: v.string(),
    cancelUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const stripe = getStripe();

    // Get the correct price ID based on plan
    const priceId =
      args.plan === "monthly"
        ? process.env.STRIPE_PRICE_ID_MONTHLY
        : process.env.STRIPE_PRICE_ID_YEARLY;

    if (!priceId) {
      throw new Error(`STRIPE_PRICE_ID_${args.plan.toUpperCase()} environment variable is not set`);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: args.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: args.successUrl,
      cancel_url: args.cancelUrl,
      metadata: {
        clerkId: args.clerkId,
        plan: args.plan,
      },
      subscription_data: {
        metadata: {
          clerkId: args.clerkId,
          plan: args.plan,
        },
      },
    });

    return {
      url: session.url,
      sessionId: session.id,
    };
  },
});

/**
 * Create a Stripe Billing Portal session for managing subscription
 */
export const createPortalSession = action({
  args: {
    stripeCustomerId: v.string(),
    returnUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const stripe = getStripe();

    const session = await stripe.billingPortal.sessions.create({
      customer: args.stripeCustomerId,
      return_url: args.returnUrl,
    });

    return {
      url: session.url,
    };
  },
});

/**
 * Cancel a subscription at period end
 */
export const cancelSubscription = action({
  args: {
    stripeSubscriptionId: v.string(),
  },
  handler: async (ctx, args) => {
    const stripe = getStripe();

    const subscription = await stripe.subscriptions.update(
      args.stripeSubscriptionId,
      {
        cancel_at_period_end: true,
      }
    );

    return {
      success: true,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodEnd: subscription.current_period_end,
    };
  },
});

/**
 * Reactivate a subscription that was set to cancel
 */
export const reactivateSubscription = action({
  args: {
    stripeSubscriptionId: v.string(),
  },
  handler: async (ctx, args) => {
    const stripe = getStripe();

    const subscription = await stripe.subscriptions.update(
      args.stripeSubscriptionId,
      {
        cancel_at_period_end: false,
      }
    );

    return {
      success: true,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    };
  },
});

/**
 * Verify Stripe webhook signature
 * Used by the HTTP webhook handler
 */
export const verifyWebhookSignature = action({
  args: {
    payload: v.string(),
    signature: v.string(),
  },
  handler: async (ctx, args) => {
    const stripe = getStripe();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET environment variable is not set");
    }

    try {
      const event = stripe.webhooks.constructEvent(
        args.payload,
        args.signature,
        webhookSecret
      );
      return { valid: true, event };
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return { valid: false, error: err.message };
    }
  },
});
