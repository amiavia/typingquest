/**
 * PRP-030: HTTP Routes
 *
 * Simplified HTTP router - Stripe webhook handling is now done by Clerk Billing.
 */

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

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

export default http;
