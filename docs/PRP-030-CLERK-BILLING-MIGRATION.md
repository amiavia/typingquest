# PRP-030: Clerk Billing Migration

**Status**: DRAFT
**Author**: Claude + Anton
**Date**: 2025-12-25
**Priority**: MEDIUM
**Estimated Effort**: 3 phases, ~25 tasks

---

## Executive Summary

This PRP migrates TypeBit8's premium subscription system from a custom Stripe integration (PRP-025) to Clerk Billing. This change dramatically simplifies the payment infrastructure by leveraging Clerk's built-in subscription management, eliminating ~500 lines of custom webhook handling code, and providing drop-in UI components for pricing tables and subscription management.

---

## Problem Statement

### Current State

1. **Complex webhook handling**: Custom `/stripe-webhook` endpoint with 4 event handlers
2. **Manual subscription sync**: Separate `subscriptions` table that must stay in sync with Stripe
3. **No billing portal**: Users cannot easily manage their subscription from the app
4. **Redundant user linking**: `clerkId` stored in Stripe metadata, then extracted in webhooks
5. **Potential sync issues**: If webhook fails, user could pay but not get premium access
6. **Maintenance burden**: Custom code for checkout, cancellation, reactivation, expiry

### Current Architecture

```
User (Clerk) → Custom Checkout Action → Stripe Hosted Checkout
                                             ↓
Custom Webhook Handler ← Stripe Webhook Events
        ↓
Convex subscriptions table ← Manual sync
        ↓
isPremium query → Check subscriptions table
```

### Impact

| Issue | Current Pain | With Clerk Billing |
|-------|--------------|-------------------|
| Webhook failures | User pays but no premium | Clerk handles internally |
| Subscription management | Not implemented | Built into `<UserProfile />` |
| Code complexity | ~500 lines across 4 files | ~50 lines total |
| Sync issues | Manual reconciliation needed | Automatic sync |
| Additional features | Must build from scratch | Free trials, portal included |
| Cost per transaction | 2.9% + $0.30 (Stripe only) | 3.6% + $0.30 (Stripe + Clerk) |

### Success Criteria

- [ ] Clerk Billing enabled and connected to existing Stripe account
- [ ] Plans configured in Clerk Dashboard (Monthly $4.99, Yearly $49.99)
- [ ] `<PricingTable />` component replaces custom PremiumPage
- [ ] `has({ plan: 'premium' })` replaces `useQuery(isPremium)`
- [ ] Billing tab appears in `<UserProfile />` component
- [ ] Existing subscribers migrated without service interruption
- [ ] Custom webhook handler removed
- [ ] `subscriptions` table deprecated (keep for historical data)

---

## Clerk Billing Overview

### How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                   CLERK DASHBOARD                            │
│                                                              │
│  1. Enable Billing feature                                   │
│  2. Connect existing Stripe account                          │
│  3. Define plans: "Free", "Premium Monthly", "Premium Yearly"│
│  4. Define features per plan                                 │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                   YOUR APP                                   │
│                                                              │
│  <PricingTable />           → Display plans, handle checkout │
│  <UserProfile />            → Billing tab for management     │
│  <Protect condition={...}>  → Gate premium features          │
│  has({ plan: 'premium' })   → Check in code                  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              CLERK + STRIPE (AUTOMATIC)                      │
│                                                              │
│  - Clerk creates/links Stripe Customer automatically         │
│  - Subscription status in Clerk session (JWT claims)         │
│  - Webhooks handled by Clerk internally                      │
│  - Billing portal built into UserProfile                     │
└─────────────────────────────────────────────────────────────┘
```

### Key Components

| Component | Purpose | Replaces |
|-----------|---------|----------|
| `<PricingTable />` | Display plans, handle checkout | `PremiumPage.tsx` |
| `<Protect />` | Gate features by plan | `PremiumGuard.tsx` |
| `<UserProfile />` | Subscription management | Not implemented |
| `has()` helper | Check plan/feature access | `useQuery(isPremium)` |

### Pricing Impact

| Plan | Current | With Clerk Billing | Difference |
|------|---------|-------------------|------------|
| Monthly $4.99 | $0.145 fee | $0.180 fee | +$0.035/mo |
| Yearly $49.99 | $1.45 fee | $1.80 fee | +$0.35/yr |

**Trade-off**: ~$0.035 more per monthly subscription in exchange for significantly reduced code complexity and maintenance.

---

## Phase 1: Clerk Billing Setup

### Task 1.1: Enable Clerk Billing

```yaml
action: manual
description: |
  In Clerk Dashboard:
  1. Navigate to "Billing" section
  2. Click "Enable Billing"
  3. Connect existing Stripe account (same account as current)
  4. Complete Stripe OAuth flow
depends_on: []
acceptance:
  - Billing section shows "Connected to Stripe"
  - Stripe account ID matches existing
```

### Task 1.2: Configure Plans

```yaml
action: manual
description: |
  In Clerk Dashboard Billing section:

  Create Plan: "Free"
  - Default plan for all users
  - Features: none (base features)

  Create Plan: "Premium Monthly"
  - Price: $4.99/month
  - Stripe Price ID: Use existing price_xxx from current setup
  - Features:
    - double_coins: "2x Coin Earnings"
    - streak_freezes: "3 Monthly Streak Freezes"
    - exclusive_shop: "Exclusive Shop Items"
    - premium_badge: "Premium Badge"
    - ad_free: "Ad-Free Experience"

  Create Plan: "Premium Yearly"
  - Price: $49.99/year
  - Stripe Price ID: Use existing price_xxx from current setup
  - Same features as Monthly
depends_on: [1.1]
acceptance:
  - 3 plans visible in Clerk Dashboard
  - Features listed under each premium plan
  - Stripe Price IDs linked correctly
```

### Task 1.3: Configure Free Trial (Optional)

```yaml
action: manual
description: |
  In Clerk Dashboard, for each premium plan:
  - Enable "Free Trial"
  - Set trial period: 14 days
  - Trial behavior: Require payment method upfront (or not)
depends_on: [1.2]
acceptance:
  - Trial period shows on plans
  - Trial settings match current PRP-025 specs
```

### Task 1.4: Update Clerk SDK

```yaml
file: package.json
action: bash
command: npm install @clerk/clerk-react@latest
description: |
  Ensure latest Clerk SDK with Billing support
depends_on: []
acceptance:
  - @clerk/clerk-react version >= 5.x (with Billing support)
  - No TypeScript errors after update
```

---

## Phase 2: Frontend Migration

### Task 2.1: Replace PremiumPage with PricingTable

```yaml
file: src/components/PremiumPage.tsx
action: replace
description: |
  Replace custom premium page with Clerk's PricingTable:

  import { PricingTable, useAuth } from '@clerk/clerk-react';

  export function PremiumPage({ onClose }: { onClose: () => void }) {
    const { has } = useAuth();
    const isPremium = has?.({ plan: 'premium_monthly' }) || has?.({ plan: 'premium_yearly' });

    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button onClick={onClose} className="pixel-btn" style={{ fontSize: '10px' }}>
              ← BACK
            </button>
            <h1 style={{ fontFamily: "'Press Start 2P'", fontSize: '16px', color: '#ffd93d' }}>
              {isPremium ? 'PREMIUM STATUS' : 'UPGRADE TO PREMIUM'}
            </h1>
            <div style={{ width: '80px' }} />
          </div>

          {/* Benefits Section */}
          <div className="pixel-box p-6 mb-8">
            <h2 style={{ fontFamily: "'Press Start 2P'", fontSize: '12px', color: '#3bceac', marginBottom: '16px' }}>
              PREMIUM BENEFITS
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {PREMIUM_BENEFITS.map(benefit => (
                <div key={benefit.title} className="flex items-center gap-3">
                  <span className="text-2xl">{benefit.icon}</span>
                  <div>
                    <p style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#ffd93d' }}>
                      {benefit.title}
                    </p>
                    <p style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: '#eef5db' }}>
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clerk Pricing Table */}
          <div className="pixel-box p-6">
            <PricingTable />
          </div>
        </div>
      </div>
    );
  }

  const PREMIUM_BENEFITS = [
    { icon: '💰', title: '2X COINS', description: 'Double coin earnings on all activities' },
    { icon: '❄️', title: 'STREAK FREEZES', description: '3 free freezes every month' },
    { icon: '🛒', title: 'EXCLUSIVE ITEMS', description: 'Access premium-only shop items' },
    { icon: '👑', title: 'PREMIUM BADGE', description: 'Show off your premium status' },
    { icon: '🚫', title: 'AD-FREE', description: 'No interruptions while typing' },
    { icon: '⚡', title: 'PRIORITY', description: 'Priority support response' },
  ];
depends_on: [1.2, 1.4]
acceptance:
  - PricingTable renders with plans from Clerk
  - Clicking plan initiates Clerk checkout flow
  - Benefits section preserved
```

### Task 2.2: Update Premium Status Checks

```yaml
file: src/hooks/usePremium.ts
action: replace
description: |
  Replace Convex query with Clerk's has() helper:

  import { useAuth } from '@clerk/clerk-react';

  export interface PremiumStatus {
    isPremium: boolean;
    plan: 'free' | 'premium_monthly' | 'premium_yearly' | null;
    benefits: PremiumBenefits;
  }

  export interface PremiumBenefits {
    coinMultiplier: number;
    freeStreakFreezes: number;
    exclusiveShopAccess: boolean;
    adFree: boolean;
    prioritySupport: boolean;
  }

  export function usePremium(): PremiumStatus {
    const { has, isLoaded } = useAuth();

    if (!isLoaded || !has) {
      return {
        isPremium: false,
        plan: null,
        benefits: FREE_BENEFITS,
      };
    }

    const isMonthly = has({ plan: 'premium_monthly' });
    const isYearly = has({ plan: 'premium_yearly' });
    const isPremium = isMonthly || isYearly;

    return {
      isPremium,
      plan: isYearly ? 'premium_yearly' : isMonthly ? 'premium_monthly' : 'free',
      benefits: isPremium ? PREMIUM_BENEFITS : FREE_BENEFITS,
    };
  }

  const FREE_BENEFITS: PremiumBenefits = {
    coinMultiplier: 1,
    freeStreakFreezes: 0,
    exclusiveShopAccess: false,
    adFree: false,
    prioritySupport: false,
  };

  const PREMIUM_BENEFITS: PremiumBenefits = {
    coinMultiplier: 2,
    freeStreakFreezes: 3,
    exclusiveShopAccess: true,
    adFree: true,
    prioritySupport: true,
  };
depends_on: [1.4]
acceptance:
  - usePremium returns correct status
  - Benefits match plan
  - Works without Convex query
```

### Task 2.3: Update Premium Guards with Protect

```yaml
file: src/components/Shop.tsx
action: modify
description: |
  Replace manual isPremium checks with Clerk's Protect component:

  import { Protect } from '@clerk/clerk-react';

  // For premium-only items:
  <Protect
    condition={(has) => has({ feature: 'exclusive_shop' })}
    fallback={<LockedItemOverlay />}
  >
    <PremiumShopItem item={item} />
  </Protect>

  // Or inline check:
  const { has } = useAuth();
  const canPurchase = !item.isPremiumOnly || has?.({ feature: 'exclusive_shop' });
depends_on: [2.2]
acceptance:
  - Premium items gated correctly
  - Free users see locked overlay
  - Premium users can purchase
```

### Task 2.4: Update Header Premium Badge

```yaml
file: src/App.tsx
action: modify
description: |
  Update header to use Clerk's has():

  const { has } = useAuth();
  const isPremium = has?.({ plan: 'premium_monthly' }) || has?.({ plan: 'premium_yearly' });

  {/* Premium Badge */}
  {isPremium && <PremiumBadge />}
depends_on: [2.2]
acceptance:
  - Premium badge shows for subscribers
  - No Convex query needed
```

### Task 2.5: Add Billing to UserProfile

```yaml
file: src/components/UserButton.tsx
action: modify
description: |
  Ensure UserProfile shows billing tab:

  import { UserButton } from '@clerk/clerk-react';

  // The billing tab is automatically included when Clerk Billing is enabled
  // No additional configuration needed

  <UserButton>
    <UserButton.UserProfilePage label="Billing" url="billing" />
  </UserButton>

  // Or use full UserProfile component elsewhere:
  <UserProfile>
    {/* Billing tab auto-included */}
  </UserProfile>
depends_on: [1.1]
acceptance:
  - Billing tab visible in UserProfile
  - Shows current plan, invoices, payment methods
  - Can cancel/manage subscription
```

### Task 2.6: Update Convex Premium Checks

```yaml
file: convex/coins.ts
action: modify
description: |
  Update coin multiplier to check Clerk JWT claims:

  export const awardCoins = mutation({
    args: { ... },
    handler: async (ctx, args) => {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) throw new Error('Not authenticated');

      // Check premium from Clerk JWT claims
      // Clerk Billing adds plan info to JWT claims automatically
      const isPremium = identity.plan === 'premium_monthly' ||
                        identity.plan === 'premium_yearly';

      const multiplier = isPremium ? 2 : 1;
      const finalAmount = args.amount * multiplier;

      // ... rest of coin awarding logic
    }
  });

  Note: Clerk Billing adds subscription info to JWT claims.
  The exact claim name may vary - check Clerk docs or JWT payload.
depends_on: [1.2]
acceptance:
  - Premium users get 2x coins
  - JWT claims include plan info
  - Works without subscriptions table query
```

### Task 2.7: Update Shop Premium Item Gating

```yaml
file: convex/shop.ts
action: modify
description: |
  Update purchaseItem to check Clerk JWT for premium:

  export const purchaseItem = mutation({
    args: { itemId: v.string() },
    handler: async (ctx, args) => {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) throw new Error('Not authenticated');

      const item = await getShopItem(ctx, args.itemId);

      // Check premium from Clerk JWT claims
      const isPremium = identity.plan === 'premium_monthly' ||
                        identity.plan === 'premium_yearly';

      if (item.isPremiumOnly && !isPremium) {
        return { success: false, reason: 'Premium subscription required' };
      }

      // ... rest of purchase logic
    }
  });
depends_on: [2.6]
acceptance:
  - Premium-only items gated correctly
  - Error message for non-premium users
```

---

## Phase 3: Cleanup & Migration

### Task 3.1: Migrate Existing Subscribers

```yaml
action: manual + script
description: |
  Migrate existing premium subscribers to Clerk Billing:

  Option A: Clerk Migration Tool (Recommended)
  - Clerk provides tools to import existing Stripe subscriptions
  - See: https://clerk.com/docs/billing/migration

  Option B: Manual Migration
  1. Export current subscriptions from Convex:
     - clerkId, stripeCustomerId, stripeSubscriptionId, plan

  2. In Clerk Dashboard or via API:
     - Link each Stripe subscription to Clerk user
     - Clerk will sync status automatically

  3. Verify all users show correct premium status

  Script to export current subscribers:

  // convex/migrations/exportSubscriptions.ts
  export const exportSubscriptions = query({
    handler: async (ctx) => {
      const subs = await ctx.db.query('subscriptions')
        .filter(q => q.eq(q.field('status'), 'active'))
        .collect();

      return subs.map(s => ({
        clerkId: s.clerkId,
        stripeCustomerId: s.stripeCustomerId,
        stripeSubscriptionId: s.stripeSubscriptionId,
        plan: s.plan,
      }));
    }
  });
depends_on: [2.1, 2.2, 2.3]
acceptance:
  - All active subscribers show premium in Clerk
  - No service interruption
  - Premium features work immediately
```

### Task 3.2: Remove Stripe Webhook Handler

```yaml
file: convex/http.ts
action: modify
description: |
  Remove the /stripe-webhook route since Clerk handles webhooks:

  // DELETE these lines (approximately 80 lines):
  // - POST /stripe-webhook route
  // - handleCheckoutComplete
  // - handleSubscriptionUpdate
  // - handleSubscriptionCanceled
  // - handlePaymentFailed

  // Keep any other HTTP routes that aren't Stripe-related
depends_on: [3.1]
acceptance:
  - /stripe-webhook route removed
  - No webhook-related functions remain
  - Other HTTP routes still work
```

### Task 3.3: Remove Custom Stripe Actions

```yaml
file: convex/stripe.ts
action: delete
description: |
  Delete the entire convex/stripe.ts file:
  - createCheckoutSession (replaced by PricingTable)
  - createPortalSession (replaced by UserProfile billing tab)
  - cancelSubscription (replaced by UserProfile)
  - reactivateSubscription (replaced by UserProfile)
  - verifyWebhookSignature (no longer needed)
depends_on: [3.1, 3.2]
acceptance:
  - convex/stripe.ts deleted
  - No imports referencing it
```

### Task 3.4: Deprecate Subscriptions Table

```yaml
file: convex/schema.ts
action: modify
description: |
  Keep subscriptions table for historical data but mark deprecated:

  // DEPRECATED: Kept for historical data only
  // New subscriptions managed by Clerk Billing
  // Do not write to this table after migration
  subscriptions: defineTable({
    clerkId: v.string(),
    stripeSubscriptionId: v.string(),
    stripeCustomerId: v.string(),
    status: v.string(),
    plan: v.string(),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.boolean(),
    createdAt: v.number(),
    _deprecated: v.optional(v.boolean()), // Mark as deprecated
    _migratedToClerkBilling: v.optional(v.number()), // Migration timestamp
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_stripe_subscription", ["stripeSubscriptionId"]),
depends_on: [3.1]
acceptance:
  - Table preserved for history
  - Marked as deprecated in schema
  - No new writes to this table
```

### Task 3.5: Remove Convex Premium Queries

```yaml
file: convex/premium.ts
action: modify
description: |
  Remove queries that are now handled by Clerk:

  DELETE:
  - isPremium query (use Clerk has())
  - getPremiumStatus query (use Clerk session)
  - getSubscriptionByClerkId (no longer needed)
  - getSubscriptionByStripeId (no longer needed)
  - handleCheckoutComplete internal mutation
  - handleSubscriptionUpdate internal mutation
  - handleSubscriptionCanceled internal mutation
  - handlePaymentFailed internal mutation
  - updatePremiumStatus mutation
  - upsertSubscription mutation

  KEEP:
  - getPlans query (for display purposes, or remove if PricingTable handles)
  - getBenefits query (for display purposes)
  - grantMonthlyPremiumBenefits (if still doing manual streak freeze grants)
depends_on: [3.1, 3.2, 3.3]
acceptance:
  - Only minimal queries remain
  - No subscription management code
  - Clerk handles all subscription logic
```

### Task 3.6: Update Environment Variables

```yaml
file: .env.local
action: modify
description: |
  Remove Stripe-specific variables that are now handled by Clerk:

  REMOVE (Clerk connects to Stripe directly):
  - STRIPE_SECRET_KEY (Clerk manages this)
  - STRIPE_WEBHOOK_SECRET (Clerk handles webhooks)
  - STRIPE_PRICE_ID_MONTHLY (configured in Clerk Dashboard)
  - STRIPE_PRICE_ID_YEARLY (configured in Clerk Dashboard)

  KEEP:
  - VITE_CLERK_PUBLISHABLE_KEY
  - CLERK_SECRET_KEY
  - VITE_CONVEX_URL

  Note: Stripe account remains connected, just managed through Clerk
depends_on: [3.3]
acceptance:
  - Unused env vars removed
  - App still functions with remaining vars
```

### Task 3.7: Update Package Dependencies

```yaml
file: package.json
action: modify
description: |
  Remove direct Stripe dependency (optional):

  The 'stripe' package is no longer needed in your code since Clerk
  handles all Stripe API calls. However, you may keep @stripe/stripe-js
  if you want client-side Stripe Elements for other purposes.

  OPTIONAL REMOVE:
  - stripe (server-side SDK)

  KEEP:
  - @clerk/clerk-react (with billing)
depends_on: [3.3]
acceptance:
  - Unused packages removed
  - Bundle size reduced
```

---

## Rollback Plan

If issues arise during migration:

### Immediate Rollback (< 24 hours)

1. Revert frontend to use `useQuery(api.premium.isPremium)`
2. Re-enable webhook handler in `convex/http.ts`
3. Disable Clerk Billing in dashboard (subscriptions continue in Stripe)
4. Existing subscribers unaffected (still in Stripe)

### Partial Rollback

1. Keep Clerk Billing enabled
2. Add fallback: check both Clerk `has()` AND Convex `subscriptions` table
3. Gradually migrate users to Clerk-only checks

### Data Preservation

- `subscriptions` table kept for historical queries
- All Stripe subscription data remains in Stripe
- Clerk syncs with Stripe, doesn't replace it

---

## Testing Checklist

### Pre-Migration

- [ ] Clerk Billing enabled in test environment
- [ ] Test plans created (use Stripe test mode)
- [ ] PricingTable renders correctly
- [ ] `has()` returns correct values for test users

### During Migration

- [ ] Existing subscriber still shows premium
- [ ] New subscription via PricingTable works
- [ ] Cancellation via UserProfile works
- [ ] Billing tab shows correct info

### Post-Migration

- [ ] All premium features gated correctly
- [ ] 2x coin multiplier works
- [ ] Premium badge displays
- [ ] Shop premium items accessible
- [ ] No console errors related to old code

---

## File Changes Summary

| File | Action | Lines Changed |
|------|--------|---------------|
| `src/components/PremiumPage.tsx` | Replace | -200, +80 |
| `src/hooks/usePremium.ts` | Replace | -50, +40 |
| `src/components/Shop.tsx` | Modify | ~20 |
| `src/components/UserButton.tsx` | Modify | ~10 |
| `src/App.tsx` | Modify | ~10 |
| `convex/coins.ts` | Modify | ~15 |
| `convex/shop.ts` | Modify | ~15 |
| `convex/http.ts` | Modify | -80 |
| `convex/stripe.ts` | Delete | -150 |
| `convex/premium.ts` | Modify | -200, +20 |
| `convex/schema.ts` | Modify | ~5 |
| `.env.local` | Modify | -4 |

**Net change**: ~-500 lines of code removed

---

## Cost Analysis

### Development Cost

| Task | Estimated Hours |
|------|-----------------|
| Clerk setup & configuration | 2h |
| Frontend migration | 4h |
| Backend migration | 3h |
| Testing & QA | 3h |
| Subscriber migration | 2h |
| **Total** | **14h** |

### Ongoing Cost Change

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Transaction fee | 2.9% + $0.30 | 3.6% + $0.30 | +0.7% |
| Monthly fee @ 100 subs | $14.50 | $18.00 | +$3.50/mo |
| Maintenance hours/mo | ~4h | ~0.5h | -3.5h/mo |

**Break-even**: If dev time is worth >$1/hour, the reduced maintenance pays for the increased transaction fees within 1 month.

---

## References

- [Clerk Billing Documentation](https://clerk.com/docs/billing)
- [Clerk Billing Migration Guide](https://clerk.com/docs/billing/migration)
- [PricingTable Component](https://clerk.com/docs/components/pricing-table)
- [Protect Component](https://clerk.com/docs/components/protect)
- [has() Helper](https://clerk.com/docs/references/react/use-auth#has)
- [Stripe Sessions 2025: Clerk + Stripe](https://stripe.com/sessions/2025/instant-zero-integration-saas-billing-with-clerk-stripe)
