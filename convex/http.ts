/**
 * PRP-027 Task 5.6: Stripe Webhook Handler
 *
 * HTTP endpoint for processing Stripe webhook events.
 * Uses Stripe SDK for signature verification.
 */

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal, api } from "./_generated/api";

const http = httpRouter();

// Stripe webhook endpoint
http.route({
  path: "/stripe-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // Get the raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return new Response("Missing stripe-signature header", { status: 400 });
    }

    try {
      // Verify webhook signature using Stripe SDK
      const verification = await ctx.runAction(api.stripe.verifyWebhookSignature, {
        payload: body,
        signature,
      });

      if (!verification.valid) {
        console.error("Webhook signature verification failed:", verification.error);
        return new Response("Invalid signature", { status: 401 });
      }

      const event = verification.event as any;
      if (!event) {
        return new Response("No event in verification", { status: 400 });
      }

      // Handle different event types
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as any;
          const clerkId = session.metadata?.clerkId;
          const plan = session.metadata?.plan;

          if (clerkId && plan && session.customer && session.subscription) {
            await ctx.runMutation(internal.premium.handleCheckoutComplete, {
              clerkId,
              stripeCustomerId: String(session.customer),
              stripeSubscriptionId: String(session.subscription),
              plan,
            });
          }
          break;
        }

        case "customer.subscription.updated": {
          const subscription = event.data.object as any;
          await ctx.runMutation(internal.premium.handleSubscriptionUpdate, {
            stripeSubscriptionId: subscription.id,
            status: subscription.status,
            currentPeriodStart: (subscription.current_period_start ?? 0) * 1000,
            currentPeriodEnd: (subscription.current_period_end ?? 0) * 1000,
            cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false,
          });
          break;
        }

        case "customer.subscription.deleted": {
          const subscription = event.data.object as any;
          await ctx.runMutation(internal.premium.handleSubscriptionCanceled, {
            stripeSubscriptionId: subscription.id,
          });
          break;
        }

        case "invoice.payment_failed": {
          const invoice = event.data.object as any;
          const subscriptionId = invoice.subscription;
          if (subscriptionId && typeof subscriptionId === "string") {
            await ctx.runMutation(internal.premium.handlePaymentFailed, {
              stripeSubscriptionId: subscriptionId,
            });
          }
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return new Response("Webhook processed", { status: 200 });
    } catch (error) {
      console.error("Webhook error:", error);
      return new Response("Webhook error", { status: 500 });
    }
  }),
});

// Health check endpoint
http.route({
  path: "/health",
  method: "GET",
  handler: httpAction(async () => {
    return new Response(JSON.stringify({ status: "ok", timestamp: Date.now() }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }),
});

export default http;
