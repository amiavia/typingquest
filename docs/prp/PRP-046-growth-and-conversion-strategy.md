# PRP-046: Growth & Conversion Strategy

**Status**: DRAFT
**Author**: Claude + Anton
**Date**: 2025-12-30
**Priority**: CRITICAL
**Estimated Effort**: 4 phases, ~35 tasks

---

## CRITICAL: Deployment Safety

> **ALL CHANGES MUST DEPLOY TO STAGING ONLY**
>
> Do NOT deploy to production until explicitly approved by Anton.

### Deployment Rules

1. **Branch**: All work on `feature/prp-046-growth-funnel` (NOT `main`)
2. **Environment**: Deploy to staging only (`staging.typebit8.com` or preview URL)
3. **Database**: Use staging/dev Convex deployment, NOT production
4. **Stripe**: Use Stripe TEST mode keys only
5. **Emails**: Use test email addresses only (no real user emails)

### Pre-Production Checklist

Before ANY production deployment:
- [ ] All features tested on staging
- [ ] Anton has reviewed and approved
- [ ] Stripe products created in LIVE mode
- [ ] Email templates tested with real sending
- [ ] Analytics events verified
- [ ] Rollback plan documented

### Commands

```bash
# Create feature branch (do this first!)
git checkout -b feature/prp-046-growth-funnel

# Deploy to staging only
npm run deploy:staging

# NEVER run these without explicit approval:
# npm run deploy:prod  ← BLOCKED
# git push origin main ← BLOCKED
```

### Environment Detection

```typescript
// src/lib/env.ts
export const isProduction = process.env.NODE_ENV === 'production'
  && !window.location.hostname.includes('staging')
  && !window.location.hostname.includes('preview');

// Block dangerous operations in dev/staging
export function requireProduction(operation: string) {
  if (!isProduction) {
    console.warn(`[BLOCKED] ${operation} - staging environment`);
    return false;
  }
  return true;
}
```

---

## Executive Summary

TypeBit8 has traffic (324 active users, +2,214% growth) but zero conversions. This PRP addresses the conversion problem through funnel optimization, email capture, referral program, community distribution, and platform-specific content strategies. Goal: convert existing traffic into paying customers while building sustainable organic growth channels.

**Key Insight**: This is a conversion problem, not a traffic problem. Fix the funnel before scaling acquisition.

---

## Problem Statement

### Current State

1. **Traffic without conversion**: 324 active users, 312 new users, 0 key events (sales)
2. **Geographic mismatch**: Top traffic from India; pricing may not match market
3. **Free tier too generous**: 9 free levels may satisfy most casual users
4. **No email capture**: Speed test visitors leave forever with no follow-up path
5. **Social channels underperforming**: X.com has no traction, TikTok is slow
6. **No referral mechanism**: Missing viral loop for organic growth
7. **Unclear paywall moment**: No compelling trigger to convert free users

### Traffic Analysis (Dec 2025)

| Metric | Value | Insight |
|--------|-------|---------|
| Active users | 324 | Growing (+2,214%) |
| New users | 312 | High acquisition, low retention |
| Retained users | 3 | Very low retention |
| Key events | 0 | Zero conversions |
| Top country | India | Price-sensitive market |
| Active users/30min | 12 | Decent engagement |

### Traffic Source Analysis (Dec 2-29, 2025)

| Channel | Users | % | New | Returning | Engagement | Sessions/User |
|---------|-------|---|-----|-----------|------------|---------------|
| Direct | 45 | 56% | 44 | 6 (100%) | 1m 45s | 0.8 |
| **Paid Search** | 34 | 42% | 34 | **0 (0%)** | 1m 55s | 0.5 |
| Cross-network | 2 | 2% | 2 | 0 | 2m 49s | 1.0 |
| **Total** | 81 | 100% | 80 | 6 | 1m 51s | 0.6 |

**Critical Finding: Paid ads are underperforming**
- 42% of traffic comes from paid search
- **0% of paid users return** - all 34 paid users bounced permanently
- **100% of returning users are Direct** - organic/direct traffic is the only source of retention
- Paid users have lowest engaged sessions (0.5 vs 0.8 for direct)
- **Return rate: 7.4%** (6/81) - extremely low overall

### Impact

| Issue | User Impact | Business Impact |
|-------|-------------|-----------------|
| No email capture | Can't be re-engaged | Losing all traffic permanently |
| Free tier too generous | Great free experience | No conversion urgency |
| Wrong pricing for market | Can't afford premium | Zero revenue |
| No referral program | Can't share benefits | No viral growth |
| Social not working | Limited discovery | Wasted effort |

### Success Criteria

- [ ] Email capture rate on speed test: >15%
- [ ] Free-to-paid conversion rate: >3%
- [ ] Referral program active users: 50+ in first month
- [ ] First 10 paying customers within 30 days
- [ ] Reddit referral traffic: 500+ users/month
- [ ] Product Hunt launch: 200+ upvotes

---

---

## Phase 0: Paid Ads Audit (URGENT)

### Current State

You're spending money on Google Ads that deliver users who:
- Don't convert (0 sales)
- Don't return (0% retention from paid)
- Don't fully engage (0.5 sessions vs 0.8 for organic)

This is a **leaky bucket** - you're paying to fill a bucket with holes.

### Recommendation: Pause or Drastically Reduce Paid Spend

**Until the funnel is fixed**, paid traffic is wasted money. Here's why:

1. **No email capture** = paid visitors leave forever
2. **No conversion triggers** = paid visitors don't pay
3. **Poor retention hooks** = paid visitors don't return

**Action items:**
- [x] ~~Calculate current CPA~~ - **Infinite** (CHF 32.35 spent, 0 conversions)
- [x] ~~Pause Google Ads~~ - **DONE 2025-12-30** - Campaign "typebit8 - Learn Typing" paused
- [ ] Create dedicated landing page for ad traffic with aggressive email capture
- [ ] Set up retargeting for visitors who engaged but didn't convert
- [ ] Resume ads only after email capture is live and tested

**Paused Campaign Details (for reference when resuming):**
- Campaign name: "typebit8 - Learn Typing"
- Budget was: CHF 14.30/day (~$16/day)
- Type: Search
- Last 7 days before pause: 32 clicks, 179 impressions, CHF 32.35 spent, 0 conversions

### When to Resume Paid Ads

Only restart significant ad spend when:
1. Email capture is live (speed test + signup flow)
2. At least 5% email capture rate achieved
3. Conversion funnel tested with organic traffic
4. Retargeting pixel installed and audiences built

### Paid Ads Landing Page Strategy (Future)

When you resume, paid traffic should go to a dedicated page:
- `/lp/typing-test` - Immediate value (speed test)
- Aggressive email capture before results shown
- Clear CTA to start free lessons
- Social proof (user count, testimonials)
- Exit-intent popup for email

This ensures paid traffic enters your nurture funnel even if they bounce.

---

## Strategy Overview

### Phase 0: Paid Ads Audit (Immediate)
Pause wasteful ad spend until funnel is fixed

### Phase 1: Fix the Funnel (Week 1)
Optimize conversion path before driving more traffic

### Phase 2: Email Capture & Nurture (Week 1-2)
Capture leads, build relationship, convert via email

### Phase 3: Referral Program (Week 2-3)
Create viral loop for organic growth

### Phase 4: Community Distribution (Week 3-4)
Reddit, Product Hunt, targeted communities

### Phase 5: Social Strategy Pivot (Ongoing)
Shift from promotional to engagement-based content

---

## Phase 1: Fix the Funnel

### 1.1 Reduce Free Tier from 9 to 6 Levels

**Rationale**: 9 levels is enough for most casual users to feel "done." Reducing to 6 creates earlier paywall friction while still providing meaningful value.

**Current free content:**
- Levels 1-3: Home Row (ASDF JKL;)
- Levels 4-6: Top Row (QWERTY UIOP)
- Levels 7-9: Bottom Row (ZXCVBNM)

**New free content:**
- Levels 1-3: Home Row (ASDF JKL;)
- Levels 4-6: Top Row (QWERTY UIOP)

**Impact**: Users complete home row and top row, then hit paywall when learning bottom row - a natural "I want to complete this" moment.

**Implementation:**

```typescript
// src/data/levels.ts
export const FREE_LEVEL_LIMIT = 6; // Changed from 9

// src/hooks/useLevelAccess.ts
export function useLevelAccess(levelId: number) {
  const isPremium = useQuery(api.subscriptions.isPremium);
  const isFree = levelId <= FREE_LEVEL_LIMIT;
  const hasAccess = isFree || isPremium;

  return { hasAccess, isFree, isPremium };
}
```

### 1.2 Add Premium Teasers During Free Gameplay

Show what users are missing while they play free content.

**Teaser locations:**
1. **After completing a free level**: "Nice! Unlock 44 more levels with Premium"
2. **In level selector**: Show premium levels with lock icons and preview
3. **On leaderboard**: Premium badge on top players, "Get Premium badge"
4. **In settings**: Premium themes visible but locked

**Implementation:**

```tsx
// src/components/LevelCompleteModal.tsx
function LevelCompleteModal({ level, score }) {
  const isPremium = useQuery(api.subscriptions.isPremium);
  const nextLevelIsPremium = level.id >= FREE_LEVEL_LIMIT;

  return (
    <Modal>
      <h2>LEVEL {level.id} COMPLETE!</h2>
      <p>Score: {score}</p>

      {nextLevelIsPremium && !isPremium && (
        <div className="premium-teaser">
          <p>You've completed all free levels!</p>
          <p>Unlock 44 more levels including:</p>
          <ul>
            <li>Bottom Row Mastery</li>
            <li>Numbers & Symbols</li>
            <li>Programmer Patterns</li>
            <li>AI Prompt Typing</li>
          </ul>
          <Button onClick={() => navigate('/premium')}>
            UNLOCK PREMIUM
          </Button>
        </div>
      )}
    </Modal>
  );
}
```

### 1.3 Progress Bar with Premium Content Preview

Show total progress including locked content.

```tsx
// src/components/ProgressBar.tsx
function ProgressBar() {
  const completedLevels = useQuery(api.progress.getCompletedLevels);
  const totalLevels = 50;
  const freeLimit = 6;

  return (
    <div className="progress-container">
      <div className="progress-bar">
        <div
          className="progress-free"
          style={{ width: `${(completedLevels / totalLevels) * 100}%` }}
        />
        <div
          className="progress-locked"
          style={{
            left: `${(freeLimit / totalLevels) * 100}%`,
            width: `${((totalLevels - freeLimit) / totalLevels) * 100}%`
          }}
        />
      </div>
      <p>
        {completedLevels}/{freeLimit} free levels completed
        <span className="premium-indicator">
          +44 premium levels
        </span>
      </p>
    </div>
  );
}
```

### 1.4 Regional Pricing

Add lower pricing tier for price-sensitive markets.

**Pricing tiers:**

| Region | Monthly | Yearly | Markets |
|--------|---------|--------|---------|
| Standard | $4.99 | $49.99 | US, EU, UK, AU, CA |
| Emerging | $1.99 | $19.99 | India, Brazil, Indonesia, etc. |

**Implementation:**

```typescript
// src/lib/pricing.ts
const EMERGING_MARKETS = [
  'IN', 'BR', 'ID', 'PH', 'VN', 'PK', 'BD', 'NG',
  'MX', 'CO', 'AR', 'PE', 'EG', 'ZA', 'KE'
];

export function getPricingTier(countryCode: string) {
  if (EMERGING_MARKETS.includes(countryCode)) {
    return {
      tier: 'emerging',
      monthly: { amount: 199, currency: 'usd', display: '$1.99' },
      yearly: { amount: 1999, currency: 'usd', display: '$19.99' },
    };
  }
  return {
    tier: 'standard',
    monthly: { amount: 499, currency: 'usd', display: '$4.99' },
    yearly: { amount: 4999, currency: 'usd', display: '$49.99' },
  };
}

// Use IP geolocation or browser locale
export function detectCountry(): string {
  // Option 1: Use Intl API (less accurate)
  const locale = navigator.language;
  // Option 2: IP geolocation via Cloudflare headers or API
  return 'US'; // default
}
```

**Stripe setup:**
- Create separate Price objects for emerging markets
- Use Stripe Checkout with dynamic price selection based on location

---

## Phase 2: Email Capture & Nurture

### 2.1 Speed Test Email Capture

Capture emails when users complete the speed test.

**Flow:**
1. User completes speed test
2. Show results with optional email capture
3. Promise: "Get your results + weekly typing tips"
4. No account required, just email

**Implementation:**

```tsx
// src/pages/TypingSpeedTestPage.tsx
function SpeedTestResults({ wpm, accuracy }) {
  const [email, setEmail] = useState('');
  const [captured, setCaptured] = useState(false);
  const captureEmail = useMutation(api.leads.captureSpeedTestEmail);

  const handleCapture = async () => {
    await captureEmail({
      email,
      wpm,
      accuracy,
      source: 'speed-test'
    });
    setCaptured(true);
  };

  return (
    <div className="results">
      <h2>YOUR TYPING SPEED</h2>
      <div className="wpm-display">{wpm} WPM</div>
      <div className="accuracy">{accuracy}% Accuracy</div>

      {!captured && (
        <div className="email-capture">
          <p>Want to improve? Get your results emailed + weekly typing tips.</p>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button onClick={handleCapture}>
            SEND MY RESULTS
          </Button>
          <p className="disclaimer">No spam. Unsubscribe anytime.</p>
        </div>
      )}

      {captured && (
        <div className="success">
          <p>Results sent! Check your inbox.</p>
          <Button onClick={() => navigate('/lessons')}>
            START IMPROVING NOW
          </Button>
        </div>
      )}
    </div>
  );
}
```

**Backend:**

```typescript
// convex/leads.ts
export const captureSpeedTestEmail = mutation({
  args: {
    email: v.string(),
    wpm: v.number(),
    accuracy: v.number(),
    source: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if email already exists
    const existing = await ctx.db
      .query('leads')
      .withIndex('by_email', q => q.eq('email', args.email))
      .first();

    if (!existing) {
      await ctx.db.insert('leads', {
        email: args.email,
        source: args.source,
        wpm: args.wpm,
        accuracy: args.accuracy,
        capturedAt: Date.now(),
        status: 'new',
      });
    }

    // Trigger welcome email via Resend/Postmark
    await ctx.scheduler.runAfter(0, api.emails.sendSpeedTestResults, {
      email: args.email,
      wpm: args.wpm,
      accuracy: args.accuracy,
    });

    return { success: true };
  },
});
```

### 2.2 Email Nurture Sequence

Automated email sequence to convert leads to users.

**Sequence:**

| Day | Email | Goal |
|-----|-------|------|
| 0 | Speed test results + tips | Deliver promised value |
| 2 | "How to improve 10 WPM in 1 week" | Educational value |
| 5 | "The 10-finger technique explained" | More value |
| 7 | "Ready to level up?" (soft CTA) | Introduce product |
| 14 | "Special offer: 20% off first month" | Conversion push |
| 21 | Final reminder | Last chance |

**Email 0 template:**

```html
Subject: Your typing speed: {wpm} WPM - here's how to improve

Hi there,

You just tested at {wpm} WPM with {accuracy}% accuracy on TypeBit8.

{if wpm < 40}
You're in the beginner range, but don't worry - with practice, you can easily double your speed.
{/if}
{if wpm >= 40 && wpm < 60}
You're at average speed! With focused practice, you could hit 60+ WPM in a few weeks.
{/if}
{if wpm >= 60}
Nice work! You're already above average. Let's push for expert-level 80+ WPM.
{/if}

Quick tips to improve:
1. Learn proper finger placement (home row: ASDF JKL;)
2. Practice 15 minutes daily - consistency beats intensity
3. Focus on accuracy first, speed follows

Ready to start? Our free lessons cover home row and top row basics:
[Start Free Lessons →]

Type fast,
TypeBit8

P.S. Look out for more typing tips in your inbox this week.
```

### 2.3 Lead Database Schema

```typescript
// convex/schema.ts
leads: defineTable({
  email: v.string(),
  source: v.string(), // 'speed-test', 'blog', 'referral'
  wpm: v.optional(v.number()),
  accuracy: v.optional(v.number()),
  capturedAt: v.number(),
  status: v.union(
    v.literal('new'),
    v.literal('nurturing'),
    v.literal('converted'),
    v.literal('unsubscribed')
  ),
  convertedUserId: v.optional(v.id('users')),
  lastEmailSent: v.optional(v.number()),
  emailSequenceStep: v.optional(v.number()),
})
  .index('by_email', ['email'])
  .index('by_status', ['status'])
  .index('by_source', ['source']),
```

---

## Phase 3: Referral Program

### 3.1 Program Structure

**Referral rewards:**
| Who | Reward | When Triggered |
|-----|--------|----------------|
| **Referrer** | 50% off next month | After referee completes first payment |
| **Referee** | 30% off first month | At checkout (auto-applied) |

**Why this structure:**
- Rewards actual conversions, not just signups
- 30% referee discount = attractive but still generates revenue
- 50% referrer reward = strong incentive, 2 referrals = 1 free month
- Referrer only rewarded after payment = no gaming the system

### 3.2 Automation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  REFERRAL AUTOMATION FLOW                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. GENERATE CODE                                                │
│     User A requests referral code                                │
│     → System generates unique code: ANTON-X7K2                   │
│     → Code stored in referralCodes table                         │
│                                                                  │
│  2. SHARE & SIGNUP                                               │
│     User A shares: typebit8.com/?ref=ANTON-X7K2                  │
│     User B clicks link → code stored in URL/cookie               │
│     User B creates account → code attached to user record        │
│     → referralRedemptions entry created (status: "pending")      │
│                                                                  │
│  3. CHECKOUT (Referee Discount)                                  │
│     User B goes to subscribe                                     │
│     → System checks for referral code on account                 │
│     → If found: auto-apply 30% Stripe coupon to checkout         │
│     → User B sees discounted price at checkout                   │
│                                                                  │
│  4. PAYMENT SUCCESS (Referrer Reward)                            │
│     User B completes payment → Stripe webhook fires              │
│     → invoice.payment_succeeded event received                   │
│     → System checks: was this user referred?                     │
│     → If yes:                                                    │
│        - Update redemption status: "pending" → "converted"       │
│        - Find referrer (User A)                                  │
│        - Apply 50% credit to User A's next invoice               │
│        - Send notification emails to both users                  │
│                                                                  │
│  5. REFERRER BILLING                                             │
│     User A's next billing cycle                                  │
│     → Stripe applies credit automatically                        │
│     → User A pays 50% of normal price                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 Clerk Billing Implementation

Since TypeBit8 uses **Clerk Billing** (not direct Stripe), the referral implementation differs:

**How Clerk Billing Works:**
- Checkout happens via `<PricingTable />` component
- Subscriptions managed through Clerk's UI
- Stripe runs behind the scenes (when connected)
- Use Stripe Promotion Codes for discounts

#### Step 1: Create Stripe Promotion Code (in Stripe Dashboard)

When you connect Stripe to Clerk Billing:
1. Go to Stripe Dashboard → Products → Coupons
2. Create coupon: `REFERRAL_30` (30% off, once)
3. Create Promotion Code: `FRIEND30` (or auto-generate unique codes)

#### Step 2: Referral Flow with Clerk Billing

```
┌─────────────────────────────────────────────────────────────────┐
│  CLERK BILLING REFERRAL FLOW                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. SIGNUP WITH REFERRAL CODE                                    │
│     User B signs up via typebit8.com/?ref=ANTON-X7K2             │
│     → Referral code stored in Convex (referralRedemptions)       │
│     → User sees: "You have a 30% discount! Use code FRIEND30"    │
│                                                                  │
│  2. CHECKOUT VIA CLERK                                           │
│     User B clicks Subscribe on <PricingTable />                  │
│     → Clerk checkout opens                                       │
│     → User enters promotion code: FRIEND30                       │
│     → 30% discount applied                                       │
│                                                                  │
│  3. DETECT SUBSCRIPTION (Polling)                                │
│     Frontend polls Clerk's has({ plan: "premium_*" })            │
│     → When true, trigger referral conversion check               │
│     → Update referralRedemptions: "pending" → "converted"        │
│                                                                  │
│  4. REWARD REFERRER                                              │
│     Option A: Store credit in Convex, apply manually             │
│     Option B: Use Stripe API to add invoice credit               │
│     → Send notification emails to both parties                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### Step 3: Frontend Implementation

**Show discount message to referred users:**

```tsx
// src/pages/PremiumPage.tsx
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { PricingTable } from '@clerk/clerk-react';

function PremiumPage() {
  const referral = useQuery(api.referrals.getMyReferral);

  return (
    <div>
      {referral && (
        <div className="referral-banner pixel-box" style={{
          background: '#1a1a2e',
          border: '3px solid #0ead69',
          padding: '16px',
          marginBottom: '24px',
          textAlign: 'center',
        }}>
          <p style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: '#0ead69' }}>
            YOU HAVE A REFERRAL DISCOUNT!
          </p>
          <p style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#eef5db', marginTop: '8px' }}>
            Use code <strong style={{ color: '#ffd93d' }}>FRIEND30</strong> at checkout for 30% off!
          </p>
        </div>
      )}

      <PricingTable />
    </div>
  );
}
```

#### Step 4: Detect Subscription & Process Referral

```tsx
// src/hooks/useReferralConversion.ts
import { useEffect } from 'react';
import { usePremium } from './usePremium';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export function useReferralConversion() {
  const { isPremium } = usePremium();
  const pendingReferral = useQuery(api.referrals.getMyPendingReferral);
  const processConversion = useMutation(api.referrals.processConversion);

  useEffect(() => {
    // User just subscribed AND has a pending referral
    if (isPremium && pendingReferral) {
      processConversion({ redemptionId: pendingReferral._id });
    }
  }, [isPremium, pendingReferral]);
}
```

#### Step 5: Convex Mutation for Conversion

```typescript
// convex/referrals.ts
export const processConversion = mutation({
  args: { redemptionId: v.id('referralRedemptions') },
  handler: async (ctx, args) => {
    const redemption = await ctx.db.get(args.redemptionId);
    if (!redemption || redemption.status !== 'pending') return;

    // 1. Mark as converted
    await ctx.db.patch(args.redemptionId, {
      status: 'converted',
      convertedAt: Date.now(),
    });

    // 2. Credit referrer (store in Convex for now)
    await ctx.db.insert('referralCredits', {
      userId: redemption.referrerId,
      amount: 250, // $2.50 (50% of $4.99)
      reason: 'referral',
      refereeId: redemption.refereeId,
      createdAt: Date.now(),
      applied: false,
    });

    // 3. Schedule notification emails
    await ctx.scheduler.runAfter(0, internal.emails.sendReferralSuccessEmails, {
      referrerId: redemption.referrerId,
      refereeId: redemption.refereeId,
    });

    return { success: true };
  },
});
```

#### Step 6: Apply Referrer Credit (Manual or via Stripe API)

**Option A: Manual Application**
- Admin reviews referral credits in dashboard
- Applies discount via Clerk/Stripe portal

**Option B: Stripe API (if using connected Stripe)**
```typescript
// convex/referrals.ts - applyReferrerCredit (server action)
export const applyReferrerCredit = action({
  args: { creditId: v.id('referralCredits') },
  handler: async (ctx, args) => {
    const credit = await ctx.runQuery(internal.referrals.getCredit, { id: args.creditId });
    if (!credit || credit.applied) return;

    const user = await ctx.runQuery(internal.users.getById, { id: credit.userId });

    // Get Stripe customer ID from Clerk (requires Clerk Backend API)
    // Then apply credit via Stripe API
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Note: Need to get Stripe customer ID - may require Clerk Backend API
    // or storing it when user subscribes

    await ctx.runMutation(internal.referrals.markCreditApplied, { creditId: args.creditId });
  },
});
```

#### Database Schema Addition

```typescript
// convex/schema.ts - add to existing schema
referralCredits: defineTable({
  userId: v.id('users'),
  amount: v.number(), // in cents
  reason: v.string(),
  refereeId: v.optional(v.id('users')),
  createdAt: v.number(),
  applied: v.boolean(),
  appliedAt: v.optional(v.number()),
})
  .index('by_user', ['userId'])
  .index('by_applied', ['applied']),
```

#### Key Differences from Direct Stripe

| Aspect | Direct Stripe | Clerk Billing |
|--------|---------------|---------------|
| Checkout | Custom checkout session | `<PricingTable />` component |
| Discounts | Apply coupon programmatically | User enters promo code manually |
| Subscription detection | Webhook | Poll `has({ plan })` |
| Credits | Stripe Balance API | Store in Convex, apply manually |

#### Recommendation

For MVP:
1. Create Stripe promo code `FRIEND30` (30% off)
2. Show referred users the code on Premium page
3. Track conversions via `usePremium()` polling
4. Store referrer credits in Convex
5. Apply referrer credits manually via Stripe dashboard

Post-MVP:
- Automate credit application via Stripe API
- Generate unique promo codes per referral
- Add Clerk webhook for instant subscription detection

### 3.4 Database Schema

```typescript
// convex/schema.ts
referralCodes: defineTable({
  code: v.string(),
  userId: v.id('users'),
  createdAt: v.number(),
  usageCount: v.number(),
  maxUses: v.optional(v.number()), // null = unlimited
  isActive: v.boolean(),
})
  .index('by_code', ['code'])
  .index('by_user', ['userId']),

referralRedemptions: defineTable({
  referralCodeId: v.id('referralCodes'),
  referrerId: v.id('users'),
  refereeId: v.id('users'),
  redeemedAt: v.number(),
  status: v.union(
    v.literal('pending'),    // Referee signed up
    v.literal('converted'),  // Referee paid
    v.literal('rewarded')    // Referrer credited
  ),
  referrerRewardId: v.optional(v.string()), // Stripe credit ID
  refereeDiscountId: v.optional(v.string()), // Stripe coupon ID
})
  .index('by_referrer', ['referrerId'])
  .index('by_referee', ['refereeId'])
  .index('by_status', ['status']),
```

### 3.5 Referral Code Generation

```typescript
// convex/referrals.ts
export const getOrCreateReferralCode = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const user = await getUserByClerkId(ctx, identity.subject);

    // Check for existing code
    const existing = await ctx.db
      .query('referralCodes')
      .withIndex('by_user', q => q.eq('userId', user._id))
      .filter(q => q.eq(q.field('isActive'), true))
      .first();

    if (existing) return existing;

    // Generate unique code
    const code = generateReferralCode(user.username);

    const codeId = await ctx.db.insert('referralCodes', {
      code,
      userId: user._id,
      createdAt: Date.now(),
      usageCount: 0,
      isActive: true,
    });

    return { code, id: codeId };
  },
});

function generateReferralCode(username: string): string {
  const base = username.slice(0, 6).toUpperCase();
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${base}-${suffix}`;
}
```

### 3.6 Referral Link & Sharing UI

```tsx
// src/components/ReferralPanel.tsx
function ReferralPanel() {
  const referralCode = useQuery(api.referrals.getOrCreateReferralCode);
  const stats = useQuery(api.referrals.getReferralStats);
  const [copied, setCopied] = useState(false);

  const referralLink = `https://typebit8.com/?ref=${referralCode?.code}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="referral-panel pixel-box p-6">
      <h2>INVITE FRIENDS</h2>

      <div className="reward-info">
        <p>When your friend subscribes, you get:</p>
        <div className="reward">1 FREE MONTH</div>
        <p>They get: 20% OFF first month</p>
      </div>

      <div className="referral-link">
        <input
          type="text"
          value={referralLink}
          readOnly
        />
        <Button onClick={copyLink}>
          {copied ? 'COPIED!' : 'COPY'}
        </Button>
      </div>

      <div className="share-buttons">
        <Button onClick={() => shareToTwitter(referralLink)}>
          SHARE ON X
        </Button>
        <Button onClick={() => shareToWhatsApp(referralLink)}>
          WHATSAPP
        </Button>
      </div>

      <div className="stats">
        <div>
          <span className="number">{stats?.totalReferrals || 0}</span>
          <span className="label">INVITED</span>
        </div>
        <div>
          <span className="number">{stats?.convertedReferrals || 0}</span>
          <span className="label">SUBSCRIBED</span>
        </div>
        <div>
          <span className="number">{stats?.freeMonthsEarned || 0}</span>
          <span className="label">FREE MONTHS</span>
        </div>
      </div>
    </div>
  );
}
```

### 3.7 Referral Processing (Legacy - See 3.3)

```typescript
// convex/referrals.ts
export const processReferralSignup = mutation({
  args: {
    referralCode: v.string(),
    newUserId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const code = await ctx.db
      .query('referralCodes')
      .withIndex('by_code', q => q.eq('code', args.referralCode))
      .first();

    if (!code || !code.isActive) {
      return { success: false, error: 'Invalid referral code' };
    }

    // Don't allow self-referral
    if (code.userId === args.newUserId) {
      return { success: false, error: 'Cannot use own referral code' };
    }

    // Create pending redemption
    await ctx.db.insert('referralRedemptions', {
      referralCodeId: code._id,
      referrerId: code.userId,
      refereeId: args.newUserId,
      redeemedAt: Date.now(),
      status: 'pending',
    });

    // Increment usage count
    await ctx.db.patch(code._id, {
      usageCount: code.usageCount + 1,
    });

    // Create Stripe coupon for referee (20% off)
    const coupon = await createStripeCoupon({
      percentOff: 20,
      duration: 'once',
      metadata: { refereeId: args.newUserId },
    });

    return { success: true, discountCode: coupon.id };
  },
});

// Called from Stripe webhook when referee pays
export const processReferralConversion = mutation({
  args: {
    refereeId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const redemption = await ctx.db
      .query('referralRedemptions')
      .withIndex('by_referee', q => q.eq('refereeId', args.refereeId))
      .filter(q => q.eq(q.field('status'), 'pending'))
      .first();

    if (!redemption) return;

    // Update redemption status
    await ctx.db.patch(redemption._id, { status: 'converted' });

    // Credit referrer with free month via Stripe
    const referrer = await ctx.db.get(redemption.referrerId);
    const subscription = await getActiveSubscription(ctx, referrer._id);

    if (subscription) {
      // Add credit to existing subscription
      await addStripeCredit({
        customerId: subscription.stripeCustomerId,
        amount: subscription.monthlyAmount, // Credit one month
        description: 'Referral reward - 1 free month',
      });
    } else {
      // Store credit for when they subscribe
      await ctx.db.insert('referralCredits', {
        userId: redemption.referrerId,
        amount: 499, // $4.99 credit
        reason: 'referral',
        createdAt: Date.now(),
        used: false,
      });
    }

    // Mark as rewarded
    await ctx.db.patch(redemption._id, { status: 'rewarded' });

    // Send notification to referrer
    await sendReferralRewardEmail(referrer.email);
  },
});
```

---

## Phase 4: Community Distribution

### 4.1 Reddit Strategy

**Target subreddits:**

| Subreddit | Subscribers | Approach |
|-----------|-------------|----------|
| r/typing | 23K | Direct - typing enthusiasts |
| r/learnprogramming | 4.3M | Value posts about typing for devs |
| r/productivity | 2.1M | Typing as productivity skill |
| r/ADHD | 1.6M | Gamification angle |
| r/mechanicalkeyboards | 1.2M | Typing practice content |
| r/KeepWriting | 100K | Writers who need typing speed |

**Content strategy:**

1. **Educational posts** (not promotional):
   - "How I improved from 40 to 80 WPM in 3 months"
   - "The 10-finger technique - a visual guide"
   - "Why developers should learn touch typing"

2. **Engagement first**:
   - Comment helpfully on typing-related posts
   - Build karma and credibility before posting
   - Never lead with product links

3. **Soft mentions**:
   - After providing value: "I've been using [tool] to practice"
   - Only when genuinely relevant

**Example post for r/learnprogramming:**

```markdown
Title: Typing speed matters more than you think for programming

I know this might sound basic, but hear me out.

As a developer, I type around 30,000 keystrokes per day. At 40 WPM,
that's a lot of time just... typing. After focusing on touch typing
for a month, I went from 45 to 75 WPM.

The real benefit isn't speed though - it's that I don't look at the
keyboard anymore. My eyes stay on the code. I catch errors faster.
My flow state is way better.

If you're still hunt-and-pecking or using 4 fingers, learning proper
technique is worth the initial slowdown. It took me about 2 weeks
to get back to my original speed, then it kept improving.

Key things that helped:
- Home row position (ASDF JKL;)
- Practicing symbols and brackets specifically
- 15 min daily practice vs. long sessions

Happy to share more details if anyone's interested.
```

### 4.2 Product Hunt Launch

**Preparation:**
1. Build hunter network 2-3 weeks before
2. Prepare assets: logo, screenshots, video demo
3. Write compelling tagline and description
4. Schedule for Tuesday 12:01 AM PT (best day)

**Tagline options:**
- "Learn touch typing with retro gaming vibes"
- "Master the keyboard. Ship code faster."
- "The typing tutor that doesn't feel like homework"

**Description:**

```
TypeBit8 is a free typing tutor that teaches touch typing through
gamified lessons with retro pixel art style.

Features:
- 50 progressive lessons from home row to advanced
- Daily challenges to build consistency
- Streaks, coins, and leaderboards
- Themes for programmers, writers, and kids
- Multiple keyboard layouts (QWERTY, QWERTZ, AZERTY)

Free to start. Premium unlocks advanced content.

Built for the AI age - because typing is your interface to ChatGPT,
Claude, and every AI tool you use.
```

**Launch checklist:**
- [ ] 5+ makers/friends ready to upvote at launch
- [ ] Respond to every comment within 1 hour
- [ ] Share launch link on all social channels
- [ ] Email list notification (if we have one by then)
- [ ] Post in relevant Discord/Slack communities

### 4.3 AlternativeTo Listing

Submit to AlternativeTo.net as alternative to:
- TypingClub
- typing.com
- Keybr
- 10FastFingers
- Ratatype

**Listing content:**
- Accurate feature list
- Screenshots
- Platform info (Web)
- Pricing (Freemium)
- Tags: typing, education, gamification, productivity

### 4.4 Hacker News Strategy

**Approach**: Show HN post when there's something genuinely interesting to share:
- Unique technical approach
- Interesting data/insights
- Open source component

**Not a launch announcement** - HN hates "I built X" posts without substance.

**Better angle**: "What I learned building a typing tutor" or technical deep-dive on the gamification system.

---

## Phase 5: Social Strategy Pivot

### 5.1 X (Twitter) Strategy Overhaul

**Problem**: Current posts are promotional. X algorithm doesn't promote ads.

**New approach**: Engagement-first content

**Content pillars:**

1. **Build in public** (40%)
   - Daily/weekly metrics updates
   - Feature development updates
   - Struggles and wins
   - "Here's what I learned this week"

2. **Engagement bait** (30%)
   - Polls: "What's your WPM?"
   - Questions: "Hottest take: typing speed doesn't matter for programmers"
   - Memes about typing/keyboards

3. **Value content** (20%)
   - Quick tips for typing faster
   - Interesting typing facts/stats
   - Retweets of typing/productivity content

4. **Soft promotion** (10%)
   - Product updates
   - User testimonials
   - "Just shipped X feature"

**Example content calendar:**

| Day | Content Type | Example |
|-----|--------------|---------|
| Mon | Build in public | "Last week: 324 active users, 0 paying. Here's what I'm changing..." |
| Tue | Poll | "What's your typing speed? (Be honest)" |
| Wed | Value tip | "Quick tip: Look at the screen, not the keyboard. Your fingers know where the keys are." |
| Thu | Engagement | Reply to 10+ relevant accounts |
| Fri | Build in public | "Just shipped regional pricing. India users now pay $1.99/mo instead of $4.99" |
| Sat | Meme | Typing-related humor |
| Sun | Rest / engagement only | |

**Reply strategy:**
- Reply to AI/productivity influencers
- Join conversations about typing, keyboards, productivity
- Add value, don't just plug product

### 5.2 TikTok Optimization

**What's probably not working**: Educational content without hook

**What works on TikTok:**
- Satisfying typing sounds (ASMR)
- Speed typing challenges
- Before/after transformations
- Relatable "me when I type" content
- Duets with typing fails

**Content ideas:**
1. "POV: You learn touch typing" (before/after speed)
2. Mechanical keyboard ASMR with typing test
3. "Types of typists" comedy sketch
4. Speed typing challenge (beat my WPM)
5. "How fast can you type this" with trending audio

**Posting strategy:**
- 1-2 posts per day minimum
- Use trending sounds
- Hook in first 1 second
- Text overlays for muted viewing
- Strong CTA: "Link in bio to test your speed"

---

## Implementation Phases

### Week 1: Funnel Optimization
- [x] Reduce free tier to 6 levels (PREMIUM_LEVEL_START = 7)
- [x] Add premium teaser on level 6 completion
- [x] Add progress bar with locked content preview
- [x] Implement regional pricing detection (useRegionalPricing hook)
- [ ] Create emerging market Stripe prices
- [x] Add email capture to speed test page (EmailCapture component)
- [ ] Set up email service (Resend/Postmark)
- [ ] Create speed test results email template

### Week 2: Email & Early Referrals
- [x] Design welcome referral email template (PR #2)
- [x] Create email preview system (PR #2)
- [ ] Build remaining nurture sequence (5 emails)
- [x] Create leads database table (convex/leads.ts)
- [ ] Implement email scheduler
- [x] Design referral code system (convex/referrals.ts)
- [x] Create referral database tables (referralCodes, referralRedemptions)
- [x] Build basic referral UI (ReferralPanel.tsx)
- [x] Test referral code generation

### Week 3: Referral Program Launch
- [x] Complete referral panel UI (ReferralPanel.tsx)
- [ ] Implement Stripe coupon creation
- [x] Build referral conversion tracking (processReferralConversion mutation)
- [x] Add referral credit system (totalCreditsEarned, pendingCredits)
- [ ] Create referral reward emails
- [x] Test end-to-end referral flow
- [ ] Launch referral program

### Week 4: Community & Launch
- [ ] Write 3 Reddit educational posts
- [ ] Build karma in target subreddits
- [ ] Prepare Product Hunt assets
- [ ] Submit to AlternativeTo
- [ ] Schedule Product Hunt launch
- [ ] Execute Reddit posting strategy
- [ ] Monitor and respond to all feedback

### Ongoing: Social Optimization
- [ ] Pivot X content strategy
- [ ] Test TikTok content formats
- [ ] Build in public regularly
- [ ] Engage with relevant communities
- [ ] Track what content performs
- [ ] Iterate based on data

---

## Success Metrics

### Conversion Metrics

| Metric | Current | 30-Day Target | 90-Day Target |
|--------|---------|---------------|---------------|
| Free-to-paid conversion | 0% | 2% | 5% |
| Speed test email capture | 0% | 15% | 25% |
| Email-to-signup | N/A | 10% | 15% |
| Referral program users | 0 | 50 | 200 |
| Paying customers | 0 | 10 | 50 |

### Traffic Metrics

| Metric | Current | 30-Day Target | 90-Day Target |
|--------|---------|---------------|---------------|
| Monthly active users | 324 | 500 | 1,500 |
| Reddit referral traffic | 0 | 200 | 500 |
| Product Hunt traffic | 0 | 500 (launch) | 100/mo |
| Organic search traffic | ~50 | 200 | 1,000 |

### Engagement Metrics

| Metric | Current | 30-Day Target | 90-Day Target |
|--------|---------|---------------|---------------|
| Retained users (week) | 3 | 15 | 50 |
| X followers | ? | +100 | +500 |
| X engagement rate | <1% | 3% | 5% |
| Email open rate | N/A | 40% | 45% |

---

## Tracking & Analytics

### Events to Track

```typescript
// Analytics events
trackEvent('speed_test_completed', { wpm, accuracy });
trackEvent('email_captured', { source: 'speed-test' });
trackEvent('referral_code_created', { userId });
trackEvent('referral_code_used', { code, referrerId });
trackEvent('referral_converted', { referrerId, refereeId });
trackEvent('free_level_completed', { level });
trackEvent('paywall_shown', { trigger: 'level-6-complete' });
trackEvent('premium_page_viewed', { source });
trackEvent('checkout_started', { plan, price });
trackEvent('subscription_created', { plan, price, region });
```

### Dashboards Needed

1. **Conversion funnel**: Speed test → Email → Signup → Premium
2. **Referral metrics**: Codes created, used, converted
3. **Revenue**: MRR, ARPU, churn
4. **Traffic sources**: Reddit, Product Hunt, organic, referral

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Continued paid ad spend** | **High** | **Pause until funnel fixed; 0% retention = wasted money** |
| Reducing free tier angers users | Medium | Grandfather existing users at 9 levels |
| Regional pricing abuse (VPN) | Low | Accept some leakage; not worth fighting |
| Reddit bans for promotion | High | Focus on value, not links; build karma first |
| Product Hunt flop | Medium | Build hunter network; time launch well |
| Email deliverability issues | High | Use reputable ESP; warm up domain |
| Referral fraud | Low | Require payment to trigger reward |

---

## Phase 6: Cookie Consent Banner

### Why Needed

- Google Analytics sets tracking cookies (`_ga`, `_gid`)
- GDPR (EU) requires consent before tracking
- Low enforcement risk for small sites, but good practice

### Implementation: Minimal "Got It" Banner

Simple, non-intrusive banner that:
1. Shows on first visit (bottom of screen)
2. Single "Got it" button to dismiss
3. Stores consent in localStorage
4. Links to privacy policy
5. Matches TypeBit8 pixel-art aesthetic

### Code Implementation

**Add to `src/components/CookieBanner.tsx`:**

```tsx
import { useState, useEffect } from 'react';

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#1a1a2e',
        borderTop: '3px solid #3bceac',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        zIndex: 9999,
        fontFamily: "'Press Start 2P', monospace",
      }}
    >
      <p style={{ fontSize: '8px', color: '#eef5db', margin: 0 }}>
        We use cookies for analytics.{' '}
        <a
          href="/privacy"
          style={{ color: '#3bceac', textDecoration: 'underline' }}
        >
          Learn more
        </a>
      </p>
      <button
        onClick={handleAccept}
        style={{
          background: '#3bceac',
          color: '#1a1a2e',
          border: 'none',
          padding: '8px 16px',
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '8px',
          cursor: 'pointer',
          boxShadow: '3px 3px 0 #000',
        }}
      >
        GOT IT
      </button>
    </div>
  );
}
```

**Add to `App.tsx`:**

```tsx
import { CookieBanner } from './components/CookieBanner';

function App() {
  return (
    <>
      {/* ... existing app content ... */}
      <CookieBanner />
    </>
  );
}
```

### Optional: Block GA Until Consent

For stricter GDPR compliance, only load GA after consent:

```tsx
// In analytics initialization
const consent = localStorage.getItem('cookie-consent');
if (consent === 'accepted') {
  // Initialize Google Analytics
  gtag('config', 'GA_MEASUREMENT_ID');
}
```

### Task Checklist

- [x] Create CookieBanner component (CookieConsent.tsx)
- [x] Add to App.tsx
- [x] Create /privacy page (already exists in LegalPage.tsx)
- [x] Test banner shows only on first visit
- [x] Test localStorage persistence

---

## Open Questions

1. **Existing users**: Grandfather at 9 free levels or apply new limit?
2. **Email service**: Resend vs Postmark vs SendGrid?
3. **Product Hunt timing**: When to launch? Need minimum feature set?
4. **Referral reward**: DECIDED - Referrer: 50% off, Referee: 30% off (update email template)
5. **TikTok investment**: Worth the effort given slow results?
6. **Paid ads**: How much are you currently spending? What keywords? Should we pause entirely or just reduce?
7. **Retargeting**: Set up Google/Meta retargeting pixels before pausing ads?

---

## Implementation Notes (2025-12-30)

### Completed

**Google Ads Paused** - 2025-12-30
- [x] Paused campaign "typebit8 - Learn Typing" in Google Ads
- Campaign was spending CHF 14.30/day (~$16/day) with 0 conversions
- Last 7 days: 32 clicks, 179 impressions, CHF 32.35 spent
- 0% retention from paid traffic (all 34 paid users bounced permanently)
- Will resume after email capture funnel is live and tested

**Welcome Referral Email Template** - PR #2
- [x] Created `src/emails/welcome-referral.html` - Full retro pixel-art styled email
- [x] Created `src/emails/preview.html` - Interactive preview tool with:
  - Live variable substitution (name, referral code)
  - Desktop/mobile view toggle
  - "Open in new tab" button for full preview

**Email Template Features:**
- Personalized welcome message with `{{FIRST_NAME}}`
- 12-week "Journey to Typing Pro" timeline:
  - Week 1-2: Home row (+15 WPM)
  - Week 3-4: All letters (+25 WPM)
  - Week 5-8: Numbers & symbols (+40 WPM)
  - Week 9-12: Pro status (60-80+ WPM)
- Stats grid: 12 weeks, 50 levels, 2x skills learned
- Personal referral code with shareable link
- 50% off premium reward explanation
- Premium benefits overview
- Pro tips section
- TypeBit8 pixel-art styling throughout

**Files Created:**
```
src/emails/welcome-referral.html   - Welcome email with referral code
src/emails/preview.html            - Interactive preview tool
```

**To Preview:**
```bash
open src/emails/preview.html
```

**Referral Reward Structure (DECIDED):**
- Referrer: 50% off next month (after referee pays)
- Referee: 30% off first month (at checkout)

**Note:** The existing email template shows 50% for both parties. Update the email to reflect:
- Referrer still gets 50% off
- Referee gets 30% off (not 50%)

### Updated Task Status

**Week 2: Email & Early Referrals**
- [x] ~~Design referral welcome email template~~ DONE
- [x] ~~Create email preview system~~ DONE
- [ ] Build email nurture sequence (remaining 5 emails)
- [x] Create leads database table (convex/leads.ts)
- [ ] Implement email scheduler
- [x] Design referral code system (convex/referrals.ts)
- [x] Create referral database tables (referralCodes, referralRedemptions)
- [x] Build basic referral UI (ReferralPanel.tsx)
- [x] Test referral code generation

---

## Appendix: Email Templates

### Template 1: Welcome Referral Email (IMPLEMENTED)

**File:** `src/emails/welcome-referral.html`

**Variables:**
- `{{FIRST_NAME}}` - User's first name
- `{{REFERRAL_CODE}}` - Personal referral code
- `{{UNSUBSCRIBE_URL}}` - Unsubscribe link

**Sections:**
1. Header with TypeBit8 branding
2. Welcome message (personalized)
3. 12-week journey timeline
4. Stats grid (12 weeks / 50 levels / 2X skills)
5. Referral code box with shareable link
6. Reward explanation (50% off when friend subscribes)
7. Premium benefits preview
8. CTAs (Start Typing / View Premium)
9. Pro tips
10. Footer with social links

---

### Template 2: Speed Test Results Email (TODO)

```
Subject: Your typing speed: {wpm} WPM

Hey!

Thanks for testing your typing speed on TypeBit8.

YOUR RESULTS:
Speed: {wpm} WPM
Accuracy: {accuracy}%
Rating: {rating}

{personalized_feedback}

WHAT'S NEXT?
Want to improve? Here are your next steps:

1. Start with the home row (ASDF JKL;)
2. Practice 15 minutes daily
3. Focus on accuracy first - speed follows

[Start Free Lessons →]

More typing tips coming your way this week.

Keep typing,
TypeBit8
```

### Template 3: Referral Reward Email (TODO)

```
Subject: You earned a free month of TypeBit8 Premium!

Hey {name}!

Great news - {referee_name} just subscribed to TypeBit8 Premium using your referral link.

As a thank you, we've added 1 FREE MONTH to your account.

Your new billing date: {new_date}

Want more free months? Share your link again:
{referral_link}

Thanks for spreading the word!
TypeBit8
```

### Template 4-8: Nurture Sequence (TODO)

| Email | Day | Subject | Goal |
|-------|-----|---------|------|
| 2 | Day 2 | "How to improve 10 WPM in 1 week" | Educational value |
| 3 | Day 5 | "The 10-finger technique explained" | More value |
| 4 | Day 7 | "Ready to level up?" | Soft CTA |
| 5 | Day 14 | "Special offer: 20% off first month" | Conversion push |
| 6 | Day 21 | "Last chance: Your typing journey awaits" | Final reminder |
