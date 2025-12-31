# PRP-048: Migrate from Clerk Billing to Direct Stripe

**Status**: IN PROGRESS
**Author**: Claude + Anton
**Date**: 2025-12-31
**Priority**: HIGH
**Estimated Effort**: 2-3 days
**Depends On**: PRP-046 (Growth & Conversion)

---

## Executive Summary

Migrate from Clerk Billing to direct Stripe integration to:
1. **Support all countries** - Clerk blocks India, Brazil, Mexico (our top markets)
2. **Enable regional pricing** - Different prices for emerging markets
3. **Full control** - No black-box limitations
4. **Future-proof** - Standard Stripe patterns, easy to extend

---

## Current State Analysis

### Existing Stripe Resources (Live Mode)

```
PRODUCT
├── prod_TfVuYSVuFe1oPe: "TypeQuest Premium"
│
├── PRICES (Standard)
│   ├── price_1SiAt7RgxsaId95cwy49HI5m: $4.99/month
│   └── price_1SiAt9RgxsaId95cgBlKm5Fo: $39.99/year
│
├── PRICES (Emerging) - TO CREATE
│   ├── premium_emerging_monthly: $1.99/month
│   └── premium_emerging_yearly: $14.99/year
│
└── COUPONS
    ├── FRIEND30: 30% off (referral)
    └── WELCOME20: 20% off (nurture email)
```

### Current Clerk Billing Integration

| Component | File | What It Does |
|-----------|------|--------------|
| `usePremium()` | `src/hooks/usePremium.ts` | Checks `has({ plan: "premium_monthly" })` via Clerk |
| `PremiumSyncProvider` | `src/providers/PremiumSyncProvider.tsx` | Syncs Clerk → Convex |
| `<PricingTable />` | `src/components/PremiumPage.tsx` | Clerk's checkout component |
| `openUserProfile()` | `src/components/PremiumPage.tsx` | Clerk's subscription management |
| `convex/premium.ts` | Backend | Helper queries, sync mutation |
| `convex/http.ts` | Backend | No Stripe webhooks (Clerk handles) |

### Database Schema (Already Exists)

```typescript
// convex/schema.ts - Already has these fields
users: {
  isPremium: v.optional(v.boolean()),
  stripeCustomerId: v.optional(v.string()),
  // ...
}

subscriptions: {
  clerkId: v.string(),
  stripeSubscriptionId: v.string(),
  stripeCustomerId: v.string(),
  status: v.string(), // "active" | "canceled" | "past_due"
  plan: v.string(), // "monthly" | "yearly"
  currentPeriodStart: v.number(),
  currentPeriodEnd: v.number(),
  cancelAtPeriodEnd: v.boolean(),
  createdAt: v.number(),
}
```

### Clerk Billing Limitations (Why We're Migrating)

| Limitation | Impact |
|------------|--------|
| **Blocked Countries** | India, Brazil, Malaysia, Mexico, Singapore, Thailand - can't checkout |
| **USD Only** | No local currency support |
| **No API** | Plans created in Dashboard only |
| **No PricingTable Filtering** | Can't show different plans per region |
| **Black Box** | Limited control over checkout flow |

---

## Migration Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│  NEW STRIPE-DIRECT ARCHITECTURE                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  FRONTEND                           BACKEND (Convex)                     │
│  ────────                           ──────────────────                   │
│                                                                          │
│  ┌──────────────────┐              ┌──────────────────┐                 │
│  │ PremiumPage.tsx  │              │ convex/stripe.ts │                 │
│  │                  │              │                  │                 │
│  │ • Custom pricing │──creates────►│ • createCheckout │                 │
│  │   cards          │  session     │ • createPortal   │                 │
│  │ • Regional       │              │                  │                 │
│  │   detection      │              └────────┬─────────┘                 │
│  │ • Checkout       │                       │                            │
│  │   redirect       │                       │ Stripe API                 │
│  └──────────────────┘                       ▼                            │
│                                    ┌──────────────────┐                 │
│  ┌──────────────────┐              │     STRIPE       │                 │
│  │ usePremium.ts    │              │                  │                 │
│  │                  │              │ • Checkout       │                 │
│  │ • Check Convex   │◄─webhooks───│ • Subscriptions  │                 │
│  │   subscription   │              │ • Customer       │                 │
│  │ • No Clerk dep   │              │   Portal         │                 │
│  └──────────────────┘              └────────┬─────────┘                 │
│                                             │                            │
│                                             │ webhooks                   │
│                                             ▼                            │
│                                    ┌──────────────────┐                 │
│                                    │ convex/http.ts   │                 │
│                                    │                  │                 │
│                                    │ /stripe-webhook  │                 │
│                                    │ • checkout.done  │                 │
│                                    │ • sub.created    │                 │
│                                    │ • sub.updated    │                 │
│                                    │ • sub.deleted    │                 │
│                                    │ • payment.failed │                 │
│                                    └──────────────────┘                 │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Create Stripe Resources

#### 1.1 Rename Product (Optional)

```bash
STRIPE_KEY=$(cat /Users/antonsteininger/Workspaces/.secrets/typebit8-stripe-live.key)

# Update product name from TypeQuest to TypeBit8
stripe products update prod_TfVuYSVuFe1oPe \
  --api-key "$STRIPE_KEY" \
  --name="TypeBit8 Premium"
```

#### 1.2 Create Emerging Market Prices

```bash
STRIPE_KEY=$(cat /Users/antonsteininger/Workspaces/.secrets/typebit8-stripe-live.key)

# Monthly - $1.99
stripe prices create --api-key "$STRIPE_KEY" \
  --product=prod_TfVuYSVuFe1oPe \
  --currency=usd \
  --unit-amount=199 \
  --recurring-interval=month \
  --nickname="Monthly Premium (Emerging)" \
  --lookup-key=premium_emerging_monthly

# Yearly - $14.99
stripe prices create --api-key "$STRIPE_KEY" \
  --product=prod_TfVuYSVuFe1oPe \
  --currency=usd \
  --unit-amount=1499 \
  --recurring-interval=year \
  --nickname="Yearly Premium (Emerging)" \
  --lookup-key=premium_emerging_yearly
```

#### 1.3 Add Lookup Keys to Existing Prices

```bash
STRIPE_KEY=$(cat /Users/antonsteininger/Workspaces/.secrets/typebit8-stripe-live.key)

# Add lookup keys for easier reference
stripe prices update price_1SiAt7RgxsaId95cwy49HI5m \
  --api-key "$STRIPE_KEY" \
  --lookup-key=premium_standard_monthly

stripe prices update price_1SiAt9RgxsaId95cgBlKm5Fo \
  --api-key "$STRIPE_KEY" \
  --lookup-key=premium_standard_yearly
```

### Phase 2: Backend - Stripe Integration

#### 2.1 Create `convex/stripe.ts`

```typescript
// convex/stripe.ts
import Stripe from "stripe";
import { action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// Price IDs - LIVE MODE
export const PRICE_IDS = {
  standard: {
    monthly: "price_1SiAt7RgxsaId95cwy49HI5m",  // $4.99/mo
    yearly: "price_1SiAt9RgxsaId95cgBlKm5Fo",   // $39.99/yr
  },
  emerging: {
    monthly: "price_1SkLnSRgxsaId95cjhr3uqrP",  // $1.99/mo
    yearly: "price_1SkLnTRgxsaId95cKjXeSEN2",   // $14.99/yr
  },
};

/**
 * Create Stripe Checkout Session
 */
export const createCheckoutSession = action({
  args: {
    priceId: v.string(),
    clerkId: v.string(),
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
 * Create Stripe Customer Portal Session
 */
export const createPortalSession = action({
  args: {
    clerkId: v.string(),
    returnUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    const user = await ctx.runQuery(internal.stripe.getUserByClerkId, {
      clerkId: args.clerkId,
    });

    if (!user?.stripeCustomerId) {
      throw new Error("No Stripe customer found");
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: args.returnUrl,
    });

    return { url: session.url };
  },
});

// Internal queries/mutations for stripe.ts
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
```

#### 2.2 Add Webhook Handler to `convex/http.ts`

```typescript
// convex/http.ts - Add Stripe webhook route
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import Stripe from "stripe";

const http = httpRouter();

// Existing routes...

// Stripe Webhook Handler
http.route({
  path: "/stripe-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return new Response("No signature", { status: 400 });
    }

    const body = await request.text();

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response("Invalid signature", { status: 400 });
    }

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await ctx.runMutation(internal.stripeWebhooks.handleCheckoutComplete, {
          sessionId: session.id,
          customerId: session.customer as string,
          subscriptionId: session.subscription as string,
          clerkId: session.metadata?.clerkId || "",
        });
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await ctx.runMutation(internal.stripeWebhooks.handleSubscriptionUpdate, {
          subscriptionId: subscription.id,
          customerId: subscription.customer as string,
          status: subscription.status,
          currentPeriodStart: subscription.current_period_start,
          currentPeriodEnd: subscription.current_period_end,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          priceId: subscription.items.data[0]?.price.id || "",
          clerkId: subscription.metadata?.clerkId || "",
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await ctx.runMutation(internal.stripeWebhooks.handleSubscriptionDeleted, {
          subscriptionId: subscription.id,
          clerkId: subscription.metadata?.clerkId || "",
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await ctx.runMutation(internal.stripeWebhooks.handlePaymentFailed, {
          customerId: invoice.customer as string,
          subscriptionId: invoice.subscription as string,
        });
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response("OK", { status: 200 });
  }),
});

export default http;
```

#### 2.3 Create `convex/stripeWebhooks.ts`

```typescript
// convex/stripeWebhooks.ts
import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const handleCheckoutComplete = internalMutation({
  args: {
    sessionId: v.string(),
    customerId: v.string(),
    subscriptionId: v.string(),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("[Stripe] Checkout complete:", args);

    // Update user's Stripe customer ID if needed
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (user && !user.stripeCustomerId) {
      await ctx.db.patch(user._id, {
        stripeCustomerId: args.customerId,
      });
    }
  },
});

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
    console.log("[Stripe] Subscription update:", args);

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

    // Grant monthly benefits if newly active
    if (isActive) {
      // Grant 3 streak freezes
      const streak = await ctx.db
        .query("streaks")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
        .first();

      if (streak) {
        await ctx.db.patch(streak._id, {
          streakFreezeCount: streak.streakFreezeCount + 3,
        });
      }
    }
  },
});

export const handleSubscriptionDeleted = internalMutation({
  args: {
    subscriptionId: v.string(),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("[Stripe] Subscription deleted:", args);

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
  },
});

export const handlePaymentFailed = internalMutation({
  args: {
    customerId: v.string(),
    subscriptionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    console.log("[Stripe] Payment failed:", args);

    if (args.subscriptionId) {
      const subscription = await ctx.db
        .query("subscriptions")
        .withIndex("by_stripe_subscription", (q) =>
          q.eq("stripeSubscriptionId", args.subscriptionId)
        )
        .first();

      if (subscription) {
        await ctx.db.patch(subscription._id, {
          status: "past_due",
        });
      }
    }
  },
});
```

### Phase 3: Frontend - Replace Clerk Components

#### 3.1 Update `usePremium.ts` (Remove Clerk Dependency)

```typescript
// src/hooks/usePremium.ts - NEW VERSION
import { useAuth } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export interface PremiumBenefits {
  coinMultiplier: number;
  xpMultiplier: number;
  freeStreakFreezes: number;
  exclusiveShopAccess: boolean;
  adFree: boolean;
  prioritySupport: boolean;
}

export interface UsePremiumResult {
  isPremium: boolean;
  isLoading: boolean;
  plan: "free" | "monthly" | "yearly" | null;
  benefits: PremiumBenefits;
  subscription: {
    status: string;
    currentPeriodEnd: number;
    cancelAtPeriodEnd: boolean;
  } | null;
  applyMultiplier: (coins: number) => number;
}

const FREE_BENEFITS: PremiumBenefits = {
  coinMultiplier: 1,
  xpMultiplier: 1,
  freeStreakFreezes: 0,
  exclusiveShopAccess: false,
  adFree: false,
  prioritySupport: false,
};

const PREMIUM_BENEFITS: PremiumBenefits = {
  coinMultiplier: 2,
  xpMultiplier: 1.5,
  freeStreakFreezes: 3,
  exclusiveShopAccess: true,
  adFree: true,
  prioritySupport: true,
};

export function usePremium(): UsePremiumResult {
  const { userId, isLoaded: authLoaded } = useAuth();

  // Query subscription from Convex (populated by Stripe webhooks)
  const subscription = useQuery(
    api.subscriptions.getActiveSubscription,
    userId ? { clerkId: userId } : "skip"
  );

  const isLoading = !authLoaded || subscription === undefined;
  const isPremium = subscription?.status === "active" || subscription?.status === "trialing";
  const plan = isPremium ? (subscription?.plan as "monthly" | "yearly") : "free";

  const benefits = isPremium ? PREMIUM_BENEFITS : FREE_BENEFITS;

  const applyMultiplier = (coins: number): number => {
    return Math.round(coins * benefits.coinMultiplier);
  };

  return {
    isPremium,
    isLoading,
    plan,
    benefits,
    subscription: subscription
      ? {
          status: subscription.status,
          currentPeriodEnd: subscription.currentPeriodEnd,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        }
      : null,
    applyMultiplier,
  };
}
```

#### 3.2 Add Subscription Query to Convex

```typescript
// convex/subscriptions.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

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
    if (subscription.currentPeriodEnd < now && subscription.status !== "active") {
      return null;
    }

    return subscription;
  },
});
```

#### 3.3 Update `PremiumPage.tsx`

```tsx
// src/components/PremiumPage.tsx - Key changes

import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRegionalPricing } from "../hooks/useRegionalPricing";
import { useAuth } from "@clerk/clerk-react";

// Price IDs - LIVE MODE
const PRICE_IDS = {
  standard: {
    monthly: "price_1SiAt7RgxsaId95cwy49HI5m",  // $4.99/mo
    yearly: "price_1SiAt9RgxsaId95cgBlKm5Fo",   // $39.99/yr
  },
  emerging: {
    monthly: "price_1SkLnSRgxsaId95cjhr3uqrP",  // $1.99/mo
    yearly: "price_1SkLnTRgxsaId95cKjXeSEN2",   // $14.99/yr
  },
};

export function PremiumPage() {
  const { userId } = useAuth();
  const { isPremium, subscription } = usePremium();
  const { pricing, isEmergingMarket } = useRegionalPricing();

  const createCheckout = useAction(api.stripe.createCheckoutSession);
  const createPortal = useAction(api.stripe.createPortalSession);

  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async (interval: "monthly" | "yearly") => {
    if (!userId) return;
    setIsLoading(true);

    try {
      const prices = isEmergingMarket ? PRICE_IDS.emerging : PRICE_IDS.standard;
      const priceId = interval === "monthly" ? prices.monthly : prices.yearly;

      const { url } = await createCheckout({
        priceId,
        clerkId: userId,
        successUrl: `${window.location.origin}/premium?success=true`,
        cancelUrl: `${window.location.origin}/premium`,
      });

      if (url) window.location.href = url;
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!userId) return;

    const { url } = await createPortal({
      clerkId: userId,
      returnUrl: `${window.location.origin}/premium`,
    });

    if (url) window.location.href = url;
  };

  return (
    <div>
      {/* Already Premium */}
      {isPremium && (
        <section>
          <h2>YOU ARE PREMIUM!</h2>
          <p>Plan: {subscription?.plan}</p>
          <p>Renews: {new Date(subscription?.currentPeriodEnd || 0).toLocaleDateString()}</p>
          <button onClick={handleManageSubscription}>
            MANAGE SUBSCRIPTION
          </button>
        </section>
      )}

      {/* Pricing Cards */}
      {!isPremium && (
        <section>
          {isEmergingMarket && (
            <div className="regional-banner">
              🌍 SPECIAL PRICING FOR YOUR REGION
            </div>
          )}

          <div className="pricing-cards">
            {/* Monthly */}
            <div className="pricing-card">
              <h3>MONTHLY</h3>
              <p className="price">{pricing.monthly.display}/mo</p>
              <button
                onClick={() => handleCheckout("monthly")}
                disabled={isLoading}
              >
                {isLoading ? "LOADING..." : "SUBSCRIBE"}
              </button>
            </div>

            {/* Yearly */}
            <div className="pricing-card featured">
              <span className="badge">BEST VALUE</span>
              <h3>YEARLY</h3>
              <p className="price">{pricing.yearly.display}/yr</p>
              <p className="savings">Save {pricing.yearly.savings}%</p>
              <button
                onClick={() => handleCheckout("yearly")}
                disabled={isLoading}
              >
                {isLoading ? "LOADING..." : "SUBSCRIBE"}
              </button>
            </div>
          </div>

          <p className="promo-hint">
            Have a promo code? Enter it at checkout!
          </p>
        </section>
      )}
    </div>
  );
}
```

#### 3.4 Remove PremiumSyncProvider

The `PremiumSyncProvider` is no longer needed - webhooks handle syncing.

```tsx
// src/main.tsx - Remove PremiumSyncProvider from provider stack
// Delete: import { PremiumSyncProvider } from "./providers/PremiumSyncProvider";
// Delete: <PremiumSyncProvider> wrapper
```

### Phase 4: Configuration & Deployment

#### 4.1 Environment Variables

```bash
# Add to Convex environment (npx convex env set)
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Already have
RESEND_API_KEY=xxx
```

#### 4.2 Set Up Stripe Webhook

```bash
# Create webhook endpoint in Stripe Dashboard or via CLI
STRIPE_KEY=$(cat /Users/antonsteininger/Workspaces/.secrets/typebit8-stripe-live.key)

stripe webhook endpoints create --api-key "$STRIPE_KEY" \
  --url="https://YOUR_CONVEX_URL/stripe-webhook" \
  --enabled-events="checkout.session.completed,customer.subscription.created,customer.subscription.updated,customer.subscription.deleted,invoice.payment_failed"
```

#### 4.3 Configure Stripe Customer Portal

In Stripe Dashboard → Settings → Billing → Customer Portal:
- Enable subscription cancellation
- Enable plan switching (if multiple plans)
- Add branding (logo, colors)
- Set return URL

---

## Migration Checklist

### Pre-Migration
- [ ] Verify 0 active Clerk Billing subscribers (confirmed: 0)
- [ ] Back up current codebase
- [ ] Create feature branch: `feature/prp-048-stripe-migration`

### Phase 1: Stripe Setup
- [x] Rename product to "TypeBit8 Premium" ✅
- [x] Add lookup keys to existing prices ✅
- [x] Create emerging market monthly price ($1.99) → `price_1SkLnSRgxsaId95cjhr3uqrP`
- [x] Create emerging market yearly price ($14.99) → `price_1SkLnTRgxsaId95cKjXeSEN2`
- [x] Verify coupons work (FRIEND30, WELCOME20) ✅

### Phase 2: Backend
- [x] Create `convex/stripe.ts` ✅
- [x] Create `convex/stripeWebhooks.ts` ✅
- [x] Create `convex/subscriptions.ts` ✅
- [x] Update `convex/http.ts` with webhook route ✅
- [ ] Set environment variables in Convex
- [ ] Deploy Convex changes

### Phase 3: Frontend
- [x] Update `usePremium.ts` to use Convex ✅
- [x] Update `PremiumPage.tsx` with custom checkout ✅
- [x] Remove `PremiumSyncProvider` ✅
- [x] Remove Clerk `<PricingTable />` import ✅
- [ ] Test checkout flow (standard pricing)
- [ ] Test checkout flow (emerging market)
- [ ] Test subscription management portal
- [ ] Test coupon codes at checkout

### Phase 4: Webhook Setup
- [ ] Create Stripe webhook endpoint
- [ ] Get webhook secret
- [ ] Add `STRIPE_WEBHOOK_SECRET` to Convex
- [ ] Test webhook events:
  - [ ] checkout.session.completed
  - [ ] customer.subscription.created
  - [ ] customer.subscription.updated
  - [ ] customer.subscription.deleted
  - [ ] invoice.payment_failed

### Phase 5: Testing
- [ ] Test new subscription (standard)
- [ ] Test new subscription (emerging)
- [ ] Test subscription cancellation
- [ ] Test subscription reactivation
- [ ] Test payment failure handling
- [ ] Test premium benefits activation
- [ ] Test from India (was blocked by Clerk)
- [ ] Test from US (standard flow)

### Phase 6: Cleanup
- [ ] Remove Clerk Billing plan from Clerk Dashboard
- [ ] Remove unused Clerk Billing imports
- [ ] Update PRP-046 to mark regional pricing complete
- [ ] Document new architecture

---

## Rollback Plan

If issues occur:

1. **Revert code** to pre-migration commit
2. **Keep Stripe subscriptions** - they're independent
3. **Re-enable Clerk Billing** in Clerk Dashboard
4. **Restore PremiumSyncProvider**

Subscriptions created during migration will still work - just need to sync status.

---

## Success Metrics

| Metric | Before | After |
|--------|--------|-------|
| Countries supported | ~180 (minus 6) | All 195 |
| Regional pricing | ❌ | ✅ |
| Checkout control | Limited | Full |
| Webhook visibility | None | Full logging |
| Price flexibility | Dashboard only | API + Dashboard |

---

## Timeline

| Day | Tasks |
|-----|-------|
| **Day 1** | Phase 1 (Stripe setup) + Phase 2 (Backend) |
| **Day 2** | Phase 3 (Frontend) + Phase 4 (Webhooks) |
| **Day 3** | Phase 5 (Testing) + Phase 6 (Cleanup) |

---

## References

- [Stripe Checkout Docs](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe Customer Portal](https://stripe.com/docs/billing/subscriptions/integrating-customer-portal)
- [Convex HTTP Actions](https://docs.convex.dev/functions/http-actions)
