/**
 * PRP-030: HTTP Routes
 *
 * Simplified HTTP router - Stripe webhook handling is now done by Clerk Billing.
 */

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

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

// Note: Stripe webhook endpoint removed - now handled by Clerk Billing internally
// The /stripe-webhook route is no longer needed as Clerk manages all Stripe webhooks

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

export default http;
