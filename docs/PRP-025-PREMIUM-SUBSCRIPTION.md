# PRP-025: Premium Subscription Tier

**Status**: DRAFT
**Author**: Claude + Anton
**Date**: 2025-12-25
**Priority**: HIGH
**Estimated Effort**: 4 phases, ~45 tasks

---

## Executive Summary

This PRP introduces a premium subscription tier for TypeBit8, offering enhanced features and benefits to subscribers. The system will integrate Stripe for payment processing and Clerk for subscription management, providing monthly and yearly subscription options with a free trial period. Premium users will enjoy an ad-free experience, exclusive themes, advanced statistics, premium-only avatars and achievements, unlimited streak freezes, priority support, and early access to new features.

---

## Problem Statement

### Current State

1. **No monetization model**: TypeBit8 currently has no revenue stream
2. **Limited feature differentiation**: All users have access to the same features
3. **No premium incentives**: No compelling reason for users to invest financially
4. **Ads impact experience**: Free users may see ads, degrading UX
5. **No tiered progression**: Missing opportunity to reward committed users

### Impact

| Issue | User Impact | Business Impact |
|-------|-------------|-----------------|
| No monetization | N/A | No sustainable revenue model |
| All features free | Good for users | No conversion funnel |
| Generic experience | Limited personalization | Low user investment |
| Ad-supported only | Potential UX degradation | Single revenue stream |
| No premium content | Limited engagement incentives | Missed upsell opportunities |

### Success Criteria

- [ ] Stripe integration complete with webhook support
- [ ] Subscription management integrated with Clerk
- [ ] Monthly and yearly subscription options available
- [ ] Free trial period (7-14 days) implemented
- [ ] Premium benefits clearly visible and restricted to subscribers
- [ ] Premium-only avatars and achievements unlocked for subscribers
- [ ] Unlimited streak freezes available for premium users
- [ ] Ad-free experience for premium subscribers
- [ ] Priority support system in place
- [ ] Early access features flagged and controlled
- [ ] Subscription status synced across all devices
- [ ] Graceful downgrade handling when subscription expires

---

## Pricing Strategy

### Pricing Tiers

| Tier | Monthly | Yearly | Savings |
|------|---------|--------|---------|
| Free | $0 | $0 | - |
| Premium | $4.99/mo | $49.99/yr | ~17% ($10) |

### Free Trial

- **Duration**: 14 days
- **No credit card required**: Users can start trial without payment method
- **Conversion**: Prompt to add payment method 3 days before trial ends
- **Auto-cancel**: Trial auto-cancels if no payment method added

### Pricing Considerations

- **Market research**: Compare with Duolingo Plus ($6.99/mo), Typing.com Premium ($5/mo)
- **Value perception**: $4.99 hits psychological sweet spot for casual app subscription
- **Yearly discount**: 17% savings incentivizes annual commitment
- **Student discount**: Potential future option at $2.99/mo or $29.99/yr

---

## Premium Benefits

### 1. Ad-Free Experience

**Free Tier**: Banner ads displayed between levels, interstitial ads after completion
**Premium**: Zero ads, uninterrupted typing practice

### 2. Exclusive Themes

**Free Tier**: 3 default themes (Classic, Dark Mode, High Contrast)
**Premium**: 12+ exclusive themes including:
- Cyberpunk Neon
- Retro Game Boy
- Sunset Gradient
- Forest Night
- Ocean Depths
- Cherry Blossom
- Synthwave
- Matrix Code
- Pixel Arcade
- Vaporwave

### 3. Advanced Statistics

**Free Tier**: Basic stats (WPM, accuracy, level progress)
**Premium**: Advanced analytics including:
- Historical WPM trends graph
- Per-key accuracy heatmap
- Weak finger identification
- Time-of-day performance analysis
- Detailed error breakdown
- Progress comparison with past weeks
- Export stats to CSV
- Shareable achievement cards

### 4. Premium Avatars & Achievements

**Free Tier**: 8 basic avatars, standard achievements
**Premium**:
- 20+ premium avatars (exclusive designs)
- Animated avatars with subtle pixel animations
- Premium-only achievement badges (gold tier)
- Custom avatar frames and borders
- Seasonal exclusive avatars (holidays, events)

### 5. Unlimited Streak Freezes

**Free Tier**: 2 streak freezes per month
**Premium**: Unlimited streak freezes to protect daily streak

### 6. Priority Support

**Free Tier**: Community support via email (48-72hr response)
**Premium**: Priority email support (24hr response), dedicated Discord channel

### 7. Early Access Features

**Free Tier**: Features released after testing period
**Premium**: Beta access to new features 2-4 weeks early, ability to provide feedback

### 8. Premium Badge

**Free Tier**: Standard profile
**Premium**: Premium badge on profile, leaderboard, and in-game display

---

## Phase 1: Stripe Integration

### 1.1 Stripe Setup

**Actions:**
1. Create Stripe account for TypeBit8
2. Set up Products and Prices in Stripe Dashboard
3. Configure webhook endpoint
4. Get API keys (test + live)

**Stripe Products:**
```typescript
// Product: TypeBit8 Premium
// Prices:
// - Monthly: $4.99 USD recurring
// - Yearly: $49.99 USD recurring
```

### 1.2 Environment Variables

**Update `.env.local`:**
```bash
# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_MONTHLY=price_...
STRIPE_PRICE_ID_YEARLY=price_...
```

### 1.3 Install Stripe Dependencies

```bash
npm install @stripe/stripe-js stripe
npm install -D @types/stripe
```

### 1.4 Stripe Client Setup

**New file: `src/lib/stripe.ts`**

```typescript
import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};
```

### 1.5 Convex Actions for Stripe

**New file: `convex/stripe.ts`**

```typescript
import { action } from './_generated/server';
import { v } from 'convex/values';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

// Create checkout session
export const createCheckoutSession = action({
  args: {
    priceId: v.string(),
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getById, { id: args.userId });

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: args.priceId,
          quantity: 1,
        },
      ],
      customer_email: user.email,
      metadata: {
        userId: args.userId,
      },
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          userId: args.userId,
        },
      },
      success_url: `${process.env.FRONTEND_URL}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/premium`,
    });

    return { sessionId: session.id, url: session.url };
  },
});

// Create customer portal session
export const createPortalSession = action({
  args: {
    customerId: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await stripe.billingPortal.sessions.create({
      customer: args.customerId,
      return_url: `${process.env.FRONTEND_URL}/settings`,
    });

    return { url: session.url };
  },
});
```

### 1.6 Stripe Webhook Handler

**New file: `convex/http.ts`** (or extend existing)

```typescript
import { httpRouter } from 'convex/server';
import { httpAction } from './_generated/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

const http = httpRouter();

http.route({
  path: '/stripe-webhook',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const signature = request.headers.get('stripe-signature');
    const body = await request.text();

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature!,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response('Webhook Error', { status: 400 });
    }

    // Handle events
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutComplete(ctx, event.data.object);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(ctx, event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(ctx, event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handlePaymentSuccess(ctx, event.data.object);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(ctx, event.data.object);
        break;
    }

    return new Response('OK', { status: 200 });
  }),
});

async function handleCheckoutComplete(ctx, session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  if (!userId) return;

  await ctx.runMutation(internal.subscriptions.createSubscription, {
    userId,
    stripeCustomerId: session.customer as string,
    stripeSubscriptionId: session.subscription as string,
    status: 'trialing',
  });
}

async function handleSubscriptionUpdate(ctx, subscription: Stripe.Subscription) {
  await ctx.runMutation(internal.subscriptions.updateSubscription, {
    stripeSubscriptionId: subscription.id,
    status: subscription.status,
    currentPeriodEnd: subscription.current_period_end,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  });
}

async function handleSubscriptionCanceled(ctx, subscription: Stripe.Subscription) {
  await ctx.runMutation(internal.subscriptions.updateSubscription, {
    stripeSubscriptionId: subscription.id,
    status: 'canceled',
  });
}

export default http;
```

---

## Phase 2: Database Schema & Backend

### 2.1 Convex Schema Updates

**Modify: `convex/schema.ts`**

```typescript
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  // ... existing tables ...

  // New subscriptions table
  subscriptions: defineTable({
    userId: v.id('users'),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    stripePriceId: v.optional(v.string()),
    status: v.union(
      v.literal('trialing'),
      v.literal('active'),
      v.literal('past_due'),
      v.literal('canceled'),
      v.literal('unpaid')
    ),
    currentPeriodStart: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
    trialStart: v.optional(v.number()),
    trialEnd: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_user_id', ['userId'])
    .index('by_stripe_customer_id', ['stripeCustomerId'])
    .index('by_stripe_subscription_id', ['stripeSubscriptionId']),

  // Update users table
  users: defineTable({
    // ... existing fields ...
    isPremium: v.optional(v.boolean()), // Denormalized for quick access
    premiumSince: v.optional(v.number()),
    streakFreezes: v.optional(v.number()), // Free users: max 2/month
  }),
});
```

### 2.2 Subscription Mutations & Queries

**New file: `convex/subscriptions.ts`**

```typescript
import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

// Check if user has active premium
export const isPremium = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
      .unique();

    if (!user) return false;

    // Check denormalized flag
    if (user.isPremium) {
      // Verify subscription is still active
      const subscription = await ctx.db
        .query('subscriptions')
        .withIndex('by_user_id', q => q.eq('userId', user._id))
        .order('desc')
        .first();

      if (!subscription) {
        // Fix inconsistent state
        await ctx.db.patch(user._id, { isPremium: false });
        return false;
      }

      const isActive = ['active', 'trialing'].includes(subscription.status);
      if (!isActive) {
        await ctx.db.patch(user._id, { isPremium: false });
        return false;
      }

      return true;
    }

    return false;
  },
});

// Get subscription details
export const getSubscription = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
      .unique();

    if (!user) return null;

    return await ctx.db
      .query('subscriptions')
      .withIndex('by_user_id', q => q.eq('userId', user._id))
      .order('desc')
      .first();
  },
});

// Create subscription (called from webhook)
export const createSubscription = mutation({
  args: {
    userId: v.id('users'),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    await ctx.db.insert('subscriptions', {
      userId: args.userId,
      stripeCustomerId: args.stripeCustomerId,
      stripeSubscriptionId: args.stripeSubscriptionId,
      status: args.status as any,
      createdAt: now,
      updatedAt: now,
    });

    // Update user premium status
    await ctx.db.patch(args.userId, {
      isPremium: ['active', 'trialing'].includes(args.status),
      premiumSince: now,
    });
  },
});

// Update subscription (called from webhook)
export const updateSubscription = mutation({
  args: {
    stripeSubscriptionId: v.string(),
    status: v.string(),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query('subscriptions')
      .withIndex('by_stripe_subscription_id', q =>
        q.eq('stripeSubscriptionId', args.stripeSubscriptionId)
      )
      .unique();

    if (!subscription) {
      console.error('Subscription not found:', args.stripeSubscriptionId);
      return;
    }

    await ctx.db.patch(subscription._id, {
      status: args.status as any,
      currentPeriodEnd: args.currentPeriodEnd,
      cancelAtPeriodEnd: args.cancelAtPeriodEnd,
      updatedAt: Date.now(),
    });

    // Update user premium status
    const isActive = ['active', 'trialing'].includes(args.status);
    await ctx.db.patch(subscription.userId, {
      isPremium: isActive,
    });
  },
});
```

---

## Phase 3: UI Components

### 3.1 Premium Badge Component

**New file: `src/components/PremiumBadge.tsx`**

```typescript
interface PremiumBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PremiumBadge({ size = 'md', className = '' }: PremiumBadgeProps) {
  const sizes = {
    sm: 'text-[6px] px-1 py-0.5',
    md: 'text-[8px] px-2 py-1',
    lg: 'text-[10px] px-3 py-1',
  };

  return (
    <span
      className={`inline-block ${sizes[size]} ${className}`}
      style={{
        fontFamily: "'Press Start 2P'",
        background: 'linear-gradient(135deg, #ffd93d 0%, #ff6b9d 100%)',
        color: '#1a1a2e',
        border: '2px solid #ffd93d',
        boxShadow: '0 0 10px rgba(255, 217, 61, 0.5)',
      }}
    >
      ★ PREMIUM
    </span>
  );
}
```

### 3.2 Premium Pricing Page

**New file: `src/pages/PremiumPage.tsx`**

```typescript
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { getStripe } from '../lib/stripe';
import { PremiumBadge } from '../components/PremiumBadge';

export function PremiumPage() {
  const isPremium = useQuery(api.subscriptions.isPremium);
  const subscription = useQuery(api.subscriptions.getSubscription);
  const createCheckout = useMutation(api.stripe.createCheckoutSession);

  const handleSubscribe = async (priceId: string) => {
    const { sessionId } = await createCheckout({ priceId });
    const stripe = await getStripe();
    await stripe?.redirectToCheckout({ sessionId });
  };

  if (isPremium) {
    return <PremiumDashboard subscription={subscription} />;
  }

  return (
    <div className="premium-page p-8">
      <div className="text-center mb-12">
        <h1 style={{
          fontFamily: "'Press Start 2P'",
          fontSize: '24px',
          color: '#ffd93d',
          marginBottom: '16px',
        }}>
          UPGRADE TO PREMIUM
        </h1>
        <p style={{
          fontFamily: "'Press Start 2P'",
          fontSize: '10px',
          color: '#eef5db',
        }}>
          UNLOCK EXCLUSIVE FEATURES AND LEVEL UP YOUR TYPING
        </p>
      </div>

      {/* Benefits Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {[
          { icon: '🚫', title: 'AD-FREE', desc: 'Zero distractions, pure typing' },
          { icon: '🎨', title: 'EXCLUSIVE THEMES', desc: '12+ premium themes' },
          { icon: '📊', title: 'ADVANCED STATS', desc: 'Detailed analytics & trends' },
          { icon: '👾', title: 'PREMIUM AVATARS', desc: '20+ exclusive designs' },
          { icon: '🔥', title: 'UNLIMITED FREEZES', desc: 'Protect your streak forever' },
          { icon: '⚡', title: 'EARLY ACCESS', desc: 'Try new features first' },
          { icon: '🏆', title: 'PREMIUM BADGES', desc: 'Show off your status' },
          { icon: '💬', title: 'PRIORITY SUPPORT', desc: '24hr response time' },
        ].map(benefit => (
          <div
            key={benefit.title}
            className="pixel-box p-4"
            style={{ background: '#1a1a2e' }}
          >
            <div className="text-4xl mb-2">{benefit.icon}</div>
            <h3 style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '10px',
              color: '#ffd93d',
              marginBottom: '8px',
            }}>
              {benefit.title}
            </h3>
            <p style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '8px',
              color: '#eef5db',
            }}>
              {benefit.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Monthly */}
        <div className="pixel-box p-6" style={{ background: '#1a1a2e' }}>
          <h3 style={{
            fontFamily: "'Press Start 2P'",
            fontSize: '14px',
            color: '#3bceac',
            marginBottom: '16px',
          }}>
            MONTHLY
          </h3>
          <div className="mb-6">
            <span style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '32px',
              color: '#ffd93d',
            }}>
              $4.99
            </span>
            <span style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '10px',
              color: '#eef5db',
            }}>
              /MONTH
            </span>
          </div>
          <button
            onClick={() => handleSubscribe(import.meta.env.VITE_STRIPE_PRICE_ID_MONTHLY)}
            className="pixel-btn w-full"
            style={{
              background: '#3bceac',
              padding: '12px',
            }}
          >
            START 14-DAY FREE TRIAL
          </button>
          <p style={{
            fontFamily: "'Press Start 2P'",
            fontSize: '6px',
            color: '#4a4a6e',
            marginTop: '8px',
            textAlign: 'center',
          }}>
            CANCEL ANYTIME
          </p>
        </div>

        {/* Yearly (Recommended) */}
        <div
          className="pixel-box p-6 relative"
          style={{
            background: '#1a1a2e',
            border: '3px solid #ffd93d',
            boxShadow: '0 0 20px rgba(255, 217, 61, 0.3)',
          }}
        >
          <div
            className="absolute -top-4 left-1/2 transform -translate-x-1/2"
            style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '8px',
              background: '#ff6b9d',
              color: '#1a1a2e',
              padding: '4px 12px',
              border: '2px solid #ffd93d',
            }}
          >
            BEST VALUE
          </div>
          <h3 style={{
            fontFamily: "'Press Start 2P'",
            fontSize: '14px',
            color: '#3bceac',
            marginBottom: '16px',
          }}>
            YEARLY
          </h3>
          <div className="mb-2">
            <span style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '32px',
              color: '#ffd93d',
            }}>
              $49.99
            </span>
            <span style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '10px',
              color: '#eef5db',
            }}>
              /YEAR
            </span>
          </div>
          <p style={{
            fontFamily: "'Press Start 2P'",
            fontSize: '8px',
            color: '#0ead69',
            marginBottom: '16px',
          }}>
            SAVE $10 (17% OFF)
          </p>
          <button
            onClick={() => handleSubscribe(import.meta.env.VITE_STRIPE_PRICE_ID_YEARLY)}
            className="pixel-btn w-full"
            style={{
              background: '#ffd93d',
              color: '#1a1a2e',
              padding: '12px',
            }}
          >
            START 14-DAY FREE TRIAL
          </button>
          <p style={{
            fontFamily: "'Press Start 2P'",
            fontSize: '6px',
            color: '#4a4a6e',
            marginTop: '8px',
            textAlign: 'center',
          }}>
            CANCEL ANYTIME
          </p>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-16 max-w-2xl mx-auto">
        <h2 style={{
          fontFamily: "'Press Start 2P'",
          fontSize: '16px',
          color: '#ffd93d',
          marginBottom: '24px',
          textAlign: 'center',
        }}>
          FREQUENTLY ASKED QUESTIONS
        </h2>
        {/* FAQ items... */}
      </div>
    </div>
  );
}
```

### 3.3 Premium Dashboard

**New file: `src/components/PremiumDashboard.tsx`**

```typescript
export function PremiumDashboard({ subscription }) {
  const createPortal = useMutation(api.stripe.createPortalSession);

  const handleManageSubscription = async () => {
    const { url } = await createPortal({
      customerId: subscription.stripeCustomerId,
    });
    window.location.href = url;
  };

  return (
    <div className="premium-dashboard p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 style={{
            fontFamily: "'Press Start 2P'",
            fontSize: '20px',
            color: '#ffd93d',
            marginBottom: '8px',
          }}>
            PREMIUM MEMBER
          </h1>
          <PremiumBadge size="lg" />
        </div>
        <button onClick={handleManageSubscription} className="pixel-btn">
          MANAGE SUBSCRIPTION
        </button>
      </div>

      {/* Subscription status */}
      <div className="pixel-box p-6 mb-8" style={{ background: '#1a1a2e' }}>
        <p style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: '#eef5db' }}>
          Status: <span style={{ color: '#0ead69' }}>{subscription.status.toUpperCase()}</span>
        </p>
        {subscription.currentPeriodEnd && (
          <p style={{
            fontFamily: "'Press Start 2P'",
            fontSize: '8px',
            color: '#4a4a6e',
            marginTop: '8px',
          }}>
            Renews on {new Date(subscription.currentPeriodEnd * 1000).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Premium benefits showcase */}
      {/* ... */}
    </div>
  );
}
```

### 3.4 Premium-Only Feature Guard

**New file: `src/components/PremiumGuard.tsx`**

```typescript
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useNavigate } from 'react-router-dom';

interface PremiumGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PremiumGuard({ children, fallback }: PremiumGuardProps) {
  const isPremium = useQuery(api.subscriptions.isPremium);
  const navigate = useNavigate();

  if (isPremium === undefined) {
    return <div>Loading...</div>;
  }

  if (!isPremium) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="pixel-box p-8 text-center">
        <h2 style={{
          fontFamily: "'Press Start 2P'",
          fontSize: '16px',
          color: '#ffd93d',
          marginBottom: '16px',
        }}>
          PREMIUM FEATURE
        </h2>
        <p style={{
          fontFamily: "'Press Start 2P'",
          fontSize: '10px',
          color: '#eef5db',
          marginBottom: '24px',
        }}>
          THIS FEATURE IS ONLY AVAILABLE FOR PREMIUM MEMBERS
        </p>
        <button
          onClick={() => navigate('/premium')}
          className="pixel-btn"
          style={{ background: '#ffd93d', color: '#1a1a2e' }}
        >
          UPGRADE TO PREMIUM
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
```

---

## Phase 4: Feature Implementation

### 4.1 Ad-Free Experience

**Modify: `src/App.tsx`**

```typescript
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';

function App() {
  const isPremium = useQuery(api.subscriptions.isPremium);

  return (
    <div>
      {/* Only show ads if not premium */}
      {!isPremium && <AdBanner />}
      {/* Rest of app */}
    </div>
  );
}
```

### 4.2 Premium Themes

**Update: `src/data/themes.ts`**

```typescript
export interface Theme {
  id: string;
  name: string;
  premium: boolean;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    // ... more colors
  };
}

export const THEMES: Theme[] = [
  // Free themes
  {
    id: 'classic',
    name: 'Classic',
    premium: false,
    colors: { /* ... */ },
  },
  // Premium themes
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    premium: true,
    colors: {
      primary: '#ff00ff',
      secondary: '#00ffff',
      background: '#0a0a0a',
      text: '#ffffff',
    },
  },
  // ... more themes
];
```

**New: `src/components/ThemeSelector.tsx`**

```typescript
import { PremiumGuard } from './PremiumGuard';

export function ThemeSelector() {
  const isPremium = useQuery(api.subscriptions.isPremium);
  const [selectedTheme, setSelectedTheme] = useState('classic');

  return (
    <div className="theme-selector">
      {THEMES.map(theme => {
        const isLocked = theme.premium && !isPremium;

        return (
          <button
            key={theme.id}
            disabled={isLocked}
            onClick={() => !isLocked && setSelectedTheme(theme.id)}
            className={`theme-option ${isLocked ? 'locked' : ''}`}
          >
            {theme.name}
            {theme.premium && <PremiumBadge size="sm" />}
            {isLocked && <LockIcon />}
          </button>
        );
      })}
    </div>
  );
}
```

### 4.3 Premium Avatars

**Update: `src/data/avatars.ts`**

```typescript
export interface Avatar {
  id: string;
  name: string;
  description: string;
  src: string;
  unlockLevel?: number;
  premium?: boolean; // NEW
  animated?: boolean; // NEW
}

export const PREMIUM_AVATARS: Avatar[] = [
  {
    id: 'golden-knight',
    name: 'Golden Knight',
    description: 'Legendary warrior in golden armor',
    src: '/avatars/premium/golden-knight.png',
    premium: true,
  },
  // ... more premium avatars
];
```

### 4.4 Advanced Statistics

**New: `src/pages/AdvancedStats.tsx`**

```typescript
import { PremiumGuard } from '../components/PremiumGuard';

export function AdvancedStatsPage() {
  return (
    <PremiumGuard>
      <div className="advanced-stats">
        <h1>ADVANCED STATISTICS</h1>
        {/* WPM trend chart */}
        {/* Per-key accuracy heatmap */}
        {/* Weak finger analysis */}
        {/* Export CSV button */}
      </div>
    </PremiumGuard>
  );
}
```

### 4.5 Unlimited Streak Freezes

**Update: `convex/users.ts`**

```typescript
export const useStreakFreeze = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
      .unique();

    if (!user) throw new Error('User not found');

    // Premium users have unlimited freezes
    if (user.isPremium) {
      // Apply freeze
      return { success: true, unlimited: true };
    }

    // Free users limited to 2 per month
    const freezesUsed = user.streakFreezes || 0;
    if (freezesUsed >= 2) {
      throw new Error('No streak freezes remaining. Upgrade to Premium for unlimited freezes.');
    }

    await ctx.db.patch(user._id, {
      streakFreezes: freezesUsed + 1,
    });

    return { success: true, remaining: 2 - freezesUsed - 1 };
  },
});
```

### 4.6 Premium Badge Display

**Update: `src/components/Leaderboard.tsx`**

```typescript
<div className="leaderboard-entry">
  <Avatar avatarId={entry.avatarId} />
  <span>{entry.username}</span>
  {entry.isPremium && <PremiumBadge size="sm" />}
  <span>{entry.score}</span>
</div>
```

**Update: `src/components/UserButton.tsx`**

```typescript
function UserButton() {
  const isPremium = useQuery(api.subscriptions.isPremium);

  return (
    <div className="user-button">
      <Avatar />
      {isPremium && <PremiumBadge size="sm" />}
    </div>
  );
}
```

---

## File Structure

```
typingquest/
├── convex/
│   ├── schema.ts                    (modify) - Add subscriptions table
│   ├── subscriptions.ts             (new) - Subscription queries/mutations
│   ├── stripe.ts                    (new) - Stripe actions
│   ├── http.ts                      (new/modify) - Webhook handler
│   └── users.ts                     (modify) - Streak freeze logic
├── src/
│   ├── lib/
│   │   └── stripe.ts                (new) - Stripe client setup
│   ├── components/
│   │   ├── PremiumBadge.tsx         (new) - Premium badge component
│   │   ├── PremiumGuard.tsx         (new) - Premium feature guard
│   │   ├── PremiumDashboard.tsx     (new) - Subscription management
│   │   ├── ThemeSelector.tsx        (modify) - Lock premium themes
│   │   ├── Leaderboard.tsx          (modify) - Show premium badges
│   │   └── UserButton.tsx           (modify) - Display premium status
│   ├── pages/
│   │   ├── PremiumPage.tsx          (new) - Pricing & benefits
│   │   ├── AdvancedStats.tsx        (new) - Premium stats page
│   │   └── PremiumSuccess.tsx       (new) - Post-checkout success
│   ├── data/
│   │   ├── themes.ts                (modify) - Add premium themes
│   │   └── avatars.ts               (modify) - Add premium avatars
│   └── App.tsx                      (modify) - Conditional ad display
├── public/
│   ├── avatars/
│   │   └── premium/                 (new) - Premium avatar assets
│   └── themes/                      (new) - Theme preview images
└── .env.local                       (modify) - Add Stripe keys
```

---

## Implementation Order

1. **Setup** - Install Stripe dependencies, configure environment variables
2. **Stripe Account** - Create Stripe account, products, and prices
3. **Database** - Update Convex schema with subscriptions table
4. **Backend** - Implement Stripe actions and webhook handler
5. **Subscription Logic** - Create subscription queries and mutations
6. **UI Components** - Build PremiumBadge, PremiumGuard, PremiumPage
7. **Pricing Page** - Complete premium pricing and benefits page
8. **Webhook Testing** - Test Stripe webhooks with Stripe CLI
9. **Feature Gating** - Implement premium-only features (themes, avatars, stats)
10. **Premium Dashboard** - Build subscription management dashboard
11. **Ad Integration** - Add conditional ad display for free users
12. **Streak Freezes** - Implement unlimited freezes for premium
13. **Premium Avatars** - Create and gate premium-only avatars
14. **Advanced Stats** - Build advanced statistics page
15. **Early Access** - Implement feature flags for early access
16. **Testing** - End-to-end testing of subscription flow
17. **Production** - Switch to Stripe live keys, deploy

---

## Notes

- **Free Trial**: 14 days, no credit card required upfront
- **Graceful Degradation**: When subscription expires, disable premium features gracefully
- **Subscription Sync**: Use Stripe webhooks to keep subscription status in sync
- **Customer Portal**: Use Stripe Customer Portal for subscription management
- **Tax Handling**: Configure Stripe Tax for automatic tax calculation
- **Refund Policy**: 30-day money-back guarantee (handled via Stripe portal)
- **Downgrade Flow**: When subscription cancels, keep premium until period end
- **Data Retention**: Premium analytics data retained for 90 days after cancellation
- **Reactivation**: Easy reactivation with one-click in Customer Portal
- **Promo Codes**: Create promotional codes in Stripe Dashboard for marketing
- **Student Discount**: Future consideration for verified students
- **Team Plans**: Future consideration for classroom/corporate licenses
