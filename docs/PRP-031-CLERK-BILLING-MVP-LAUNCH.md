# PRP-031: Clerk Billing MVP Launch

**Status**: READY FOR IMPLEMENTATION
**Author**: Claude + Anton
**Date**: 2025-12-25
**Priority**: HIGH
**Estimated Effort**: 1-2 hours

---

## Executive Summary

This PRP details the remaining steps to launch Clerk Billing for the first test user. The code changes are complete (PRP-030). This document covers the Clerk Dashboard configuration and final testing steps.

**Key Decision**: Use Clerk's payment gateway (no Stripe account needed for MVP testing).

---

## Current State

### Code Changes Complete (PRP-030)
- [x] `usePremium` hook uses Clerk's `has()` helper
- [x] `PremiumPage` uses `<PricingTable />` component
- [x] Removed custom Stripe webhook handler
- [x] Removed `convex/stripe.ts`
- [x] Simplified `convex/premium.ts`

### Remaining Tasks
- [ ] Configure Clerk Dashboard (Plans, Features)
- [ ] Test payment flow end-to-end
- [ ] Verify premium features work

---

## Phase 1: Clerk Dashboard Configuration

### Task 1.1: Enable Billing

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **Billing** → **Settings**
3. Click **Enable Billing**
4. Select **Clerk payment gateway** (recommended for testing)

### Task 1.2: Create Plans

Navigate to **Billing** → **Subscription Plans** → **Plans for Users** tab

#### Plan 1: Premium Monthly

| Field | Value |
|-------|-------|
| **Plan Name** | Premium Monthly |
| **Plan ID** | `premium_monthly` |
| **Price** | $4.99 USD |
| **Billing Period** | Monthly |
| **Publicly Available** | Yes |

#### Plan 2: Premium Yearly

| Field | Value |
|-------|-------|
| **Plan Name** | Premium Yearly |
| **Plan ID** | `premium_yearly` |
| **Price** | $39.99 USD |
| **Billing Period** | Yearly |
| **Publicly Available** | Yes |

> **Important**: The Plan IDs must match exactly: `premium_monthly` and `premium_yearly`

### Task 1.3: Create Features

Add these Features to both Premium plans:

| Feature Name | Feature ID | Description |
|--------------|------------|-------------|
| Double Coins | `double_coins` | Earn 2x coins on all activities |
| Streak Freezes | `streak_freezes` | 3 free streak freezes per month |
| Exclusive Shop | `exclusive_shop` | Access premium-only shop items |
| Premium Badge | `premium_badge` | Display premium badge on profile |
| Ad-Free | `ad_free` | No advertisements |
| Priority Support | `priority_support` | Priority customer support |

**Steps to add features:**
1. When creating each Plan, click **Add Feature**
2. Enter Feature name and ID
3. Toggle **Publicly Available** to show in `<PricingTable />`

---

## Phase 2: Code Verification

### Task 2.1: Verify Plan IDs Match

The `usePremium` hook checks for these exact plan IDs:

```typescript
// src/hooks/usePremium.ts
const isMonthly = has?.({ plan: "premium_monthly" }) ?? false;
const isYearly = has?.({ plan: "premium_yearly" }) ?? false;
```

**Ensure Clerk Dashboard Plan IDs match exactly.**

### Task 2.2: Test PricingTable Renders

Start the dev server and navigate to the Premium page:

```bash
npm run dev
```

Verify:
- [ ] `<PricingTable />` displays both plans
- [ ] Prices show correctly ($4.99/month, $39.99/year)
- [ ] Features listed under each plan

### Task 2.3: Verify Premium Check Works

In browser console (while logged in), test:

```javascript
// Check if has() is available
const auth = window.Clerk?.session;
console.log(auth);
```

---

## Phase 3: Test Payment Flow

### Task 3.1: Test Subscription (Development Mode)

1. Log in as a test user
2. Go to Premium page
3. Click on a plan
4. Complete checkout using test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits

### Task 3.2: Verify Premium Status

After successful payment:
- [ ] `usePremium()` returns `isPremium: true`
- [ ] Premium badge appears in header
- [ ] Premium-only shop items are accessible
- [ ] Coin earnings are doubled (2x)

### Task 3.3: Test Subscription Management

1. Click **Manage Subscription** on Premium page
2. Verify `<UserProfile />` shows Billing tab
3. Test cancel subscription flow

---

## Phase 4: Sync Premium to Convex (Optional)

The shop and coin mutations check `user.isPremium` in Convex. To sync:

### Option A: Frontend Sync (Simple)

Add a sync effect when premium status changes:

```typescript
// In App.tsx or a provider
import { usePremium } from './hooks/usePremium';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useAuth } from '@clerk/clerk-react';
import { useEffect } from 'react';

function PremiumSyncProvider({ children }) {
  const { userId } = useAuth();
  const { isPremium } = usePremium();
  const syncPremium = useMutation(api.premium.syncPremiumStatus);

  useEffect(() => {
    if (userId) {
      syncPremium({ clerkId: userId, isPremium });
    }
  }, [userId, isPremium, syncPremium]);

  return children;
}
```

### Option B: Keep Using Clerk Check Only

Modify `convex/coins.ts` and `convex/shop.ts` to not check local `isPremium` flag - rely solely on frontend checks.

---

## Testing Checklist

### Pre-Launch
- [ ] Clerk Billing enabled
- [ ] Plans created with correct IDs
- [ ] Features added to plans
- [ ] Dev server running without errors

### Payment Flow
- [ ] PricingTable displays correctly
- [ ] Can click "Subscribe" button
- [ ] Checkout modal/page opens
- [ ] Test payment completes successfully
- [ ] Redirected back to app

### Premium Features
- [ ] `usePremium()` returns correct status
- [ ] Premium badge displays
- [ ] Shop premium items accessible
- [ ] Coin multiplier works (2x)
- [ ] UserProfile shows Billing tab

### Edge Cases
- [ ] Non-logged-in user sees pricing (public)
- [ ] Cancel subscription works
- [ ] Resubscribe after cancel works

---

## Environment Variables

### Required (Already Set)
```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
```

### No Longer Needed
```bash
# These can be removed after migration
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID_MONTHLY=
STRIPE_PRICE_ID_YEARLY=
```

---

## Go-Live Checklist

When ready for production with real payments:

1. **Create Production Stripe Account**
   - Go to Clerk Dashboard → Billing → Settings
   - Select "Stripe account"
   - Connect a production Stripe account

2. **Update Plan Prices** (if different for production)

3. **Test with Real Card** (in production mode)

4. **Monitor First Transactions**
   - Check Clerk Dashboard for subscription events
   - Verify webhook delivery in Stripe Dashboard

---

## Rollback Plan

If issues arise:

1. **Disable Billing temporarily**
   - Go to Clerk Dashboard → Billing → Settings
   - Toggle off "Enable Billing"
   - PricingTable will show empty/error state

2. **Revert to old code** (if needed)
   - Code is in git history
   - Restore `convex/stripe.ts` and webhook handler

---

## Success Metrics

MVP is successful when:
- [ ] At least 1 test user completes subscription
- [ ] Premium features unlock correctly
- [ ] User can manage subscription via UserProfile
- [ ] No errors in console/logs

---

## Time Estimate

| Task | Time |
|------|------|
| Dashboard configuration | 15 min |
| Code verification | 10 min |
| Test payment flow | 15 min |
| Fix any issues | 30 min |
| **Total** | **~1 hour** |
