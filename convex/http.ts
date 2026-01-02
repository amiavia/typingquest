/**
 * PRP-030/048: HTTP Routes
 *
 * HTTP router with Stripe webhook handling for direct Stripe integration.
 */

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import Stripe from "stripe";

const http = httpRouter();

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

// ═══════════════════════════════════════════════════════════════════
// PRP-048: STRIPE WEBHOOK HANDLER
// ═══════════════════════════════════════════════════════════════════

http.route({
  path: "/stripe-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      console.error("[Stripe Webhook] No signature provided");
      return new Response("No signature", { status: 400 });
    }

    const body = await request.text();

    let event: Stripe.Event;
    try {
      // Use constructEventAsync for Convex's async SubtleCrypto environment
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error("[Stripe Webhook] Signature verification failed:", err);
      return new Response("Invalid signature", { status: 400 });
    }

    console.log("[Stripe Webhook] Event received:", event.type);

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          const clerkId = session.metadata?.clerkId || "";

          if (clerkId && session.subscription) {
            await ctx.runMutation(internal.stripeWebhooks.handleCheckoutComplete, {
              sessionId: session.id,
              customerId: session.customer as string,
              subscriptionId: session.subscription as string,
              clerkId,
            });
          }
          break;
        }

        case "customer.subscription.created":
        case "customer.subscription.updated": {
          // Type assertion for webhook data which may have fields not in the SDK types
          const subscription = event.data.object as Stripe.Subscription & {
            current_period_start?: number;
            current_period_end?: number;
          };
          let clerkId: string | undefined = subscription.metadata?.clerkId;

          // If no clerkId in metadata, try to find from customer
          if (!clerkId) {
            const foundClerkId = await ctx.runMutation(
              internal.stripeWebhooks.getClerkIdFromCustomer,
              { stripeCustomerId: subscription.customer as string }
            );
            clerkId = foundClerkId || undefined;
          }

          if (clerkId) {
            // Get period from subscription items if not on main object
            const periodStart = subscription.current_period_start ||
              subscription.items.data[0]?.created ||
              Math.floor(Date.now() / 1000);
            const periodEnd = subscription.current_period_end ||
              (subscription.cancel_at || Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60);

            await ctx.runMutation(internal.stripeWebhooks.handleSubscriptionUpdate, {
              subscriptionId: subscription.id,
              customerId: subscription.customer as string,
              status: subscription.status,
              currentPeriodStart: periodStart,
              currentPeriodEnd: periodEnd,
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
              priceId: subscription.items.data[0]?.price.id || "",
              clerkId,
            });
          } else {
            console.warn("[Stripe Webhook] No clerkId found for subscription:", subscription.id);
          }
          break;
        }

        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;
          let clerkId: string | undefined = subscription.metadata?.clerkId;

          if (!clerkId) {
            const foundClerkId = await ctx.runMutation(
              internal.stripeWebhooks.getClerkIdFromCustomer,
              { stripeCustomerId: subscription.customer as string }
            );
            clerkId = foundClerkId || undefined;
          }

          if (clerkId) {
            await ctx.runMutation(internal.stripeWebhooks.handleSubscriptionDeleted, {
              subscriptionId: subscription.id,
              clerkId,
            });
          }
          break;
        }

        case "invoice.payment_failed": {
          const invoice = event.data.object as Stripe.Invoice;
          // Access subscription from subscription_details if available
          const subscriptionDetails = invoice.parent?.subscription_details;
          const subscriptionId = subscriptionDetails?.subscription
            ? (typeof subscriptionDetails.subscription === 'string'
                ? subscriptionDetails.subscription
                : subscriptionDetails.subscription.id)
            : undefined;
          await ctx.runMutation(internal.stripeWebhooks.handlePaymentFailed, {
            customerId: invoice.customer as string,
            subscriptionId,
          });
          break;
        }

        default:
          console.log("[Stripe Webhook] Unhandled event type:", event.type);
      }

      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("[Stripe Webhook] Error processing event:", error);
      return new Response(JSON.stringify({ error: String(error) }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

// Manual trigger for daily analytics report
http.route({
  path: "/daily-report",
  method: "POST",
  handler: httpAction(async (ctx) => {
    try {
      const result = await ctx.runAction(api.analytics.triggerDailyReport, {});
      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 500,
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: String(e) }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

// Test analytics configuration
http.route({
  path: "/daily-report/test",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const result = await ctx.runAction(api.analytics.testAnalyticsConfig, {});
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// ═══════════════════════════════════════════════════════════════════
// PRP-053: CLAUDE CODE PLUGIN API
// ═══════════════════════════════════════════════════════════════════

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json",
};

// OPTIONS handler for CORS preflight
http.route({
  path: "/api/claude-plugin/auth/init",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }),
});

// Initialize auth link
http.route({
  path: "/api/claude-plugin/auth/init",
  method: "POST",
  handler: httpAction(async (ctx) => {
    try {
      const result = await ctx.runMutation(api.claudePlugin.initAuthLink, {});
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: CORS_HEADERS,
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: String(e) }), {
        status: 500,
        headers: CORS_HEADERS,
      });
    }
  }),
});

// Verify auth link (polled by plugin)
http.route({
  path: "/api/claude-plugin/auth/verify",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }),
});

http.route({
  path: "/api/claude-plugin/auth/verify",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json() as { linkCode: string };
      const result = await ctx.runQuery(api.claudePlugin.verifyLinkCode, {
        linkCode: body.linkCode,
      });
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: CORS_HEADERS,
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: String(e) }), {
        status: 500,
        headers: CORS_HEADERS,
      });
    }
  }),
});

// Check premium status
http.route({
  path: "/api/claude-plugin/premium-status",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    try {
      const authHeader = request.headers.get("Authorization");
      const apiKey = authHeader?.replace("Bearer ", "") || "";

      const result = await ctx.runQuery(api.claudePlugin.checkPremiumByApiKey, {
        apiKey,
      });
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: CORS_HEADERS,
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: String(e) }), {
        status: 500,
        headers: CORS_HEADERS,
      });
    }
  }),
});

// Get snippet
http.route({
  path: "/api/claude-plugin/snippet",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    try {
      const url = new URL(request.url);
      const duration = parseInt(url.searchParams.get("duration") || "60");
      const type = url.searchParams.get("type") || "code";
      const language = url.searchParams.get("language") || undefined;

      const result = await ctx.runQuery(api.claudePlugin.getSnippet, {
        duration,
        type,
        language,
      });
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: CORS_HEADERS,
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: String(e) }), {
        status: 500,
        headers: CORS_HEADERS,
      });
    }
  }),
});

// Submit result
http.route({
  path: "/api/claude-plugin/result",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }),
});

http.route({
  path: "/api/claude-plugin/result",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const authHeader = request.headers.get("Authorization");
      const apiKey = authHeader?.replace("Bearer ", "") || "";
      const body = await request.json() as {
        snippetId: string;
        wpm: number;
        accuracy: number;
        duration: number;
        characters: number;
        errors: number;
      };

      const result = await ctx.runMutation(api.claudePlugin.submitResult, {
        apiKey,
        snippetId: body.snippetId,
        wpm: body.wpm,
        accuracy: body.accuracy,
        duration: body.duration,
        characters: body.characters,
        errors: body.errors,
      });
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: CORS_HEADERS,
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: String(e) }), {
        status: 500,
        headers: CORS_HEADERS,
      });
    }
  }),
});

// Get stats
http.route({
  path: "/api/claude-plugin/stats",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    try {
      const authHeader = request.headers.get("Authorization");
      const apiKey = authHeader?.replace("Bearer ", "") || "";

      const result = await ctx.runQuery(api.claudePlugin.getStats, {
        apiKey,
      });
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: CORS_HEADERS,
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: String(e) }), {
        status: 500,
        headers: CORS_HEADERS,
      });
    }
  }),
});

export default http;
