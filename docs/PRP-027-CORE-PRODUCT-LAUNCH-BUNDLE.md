# PRP-027: Core Product Launch Bundle

**Status**: DRAFT
**Author**: Claude + Anton
**Date**: 2025-12-25
**Priority**: CRITICAL
**Estimated Effort**: 5 phases, ~85 tasks
**Implementation Method**: Ralph Wiggum Automated Loop

---

## Executive Summary

This is a **meta-PRP** that bundles the highest-impact features for TypeBit8's core product launch. It combines:

- **PRP-004**: 30 Additional Levels (Content Foundation)
- **PRP-008**: Daily Challenges (Retention Driver)
- **PRP-009**: Streak System (Engagement Hook)
- **PRP-025**: Premium Subscription (Monetization)
- **PRP-026**: Coin Shop (Virtual Economy)

This PRP provides a unified implementation plan with proper dependency ordering, shared schema updates, and atomic tasks designed for automated implementation via the Ralph Wiggum loop.

---

## Why This Bundle?

```
┌─────────────────────────────────────────────────────────────────────────┐
│  THE RETENTION + MONETIZATION FLYWHEEL                                  │
│                                                                         │
│     ┌──────────────┐                                                   │
│     │  30 Levels   │ ◄─── Content keeps users engaged                  │
│     │  (PRP-004)   │                                                   │
│     └──────┬───────┘                                                   │
│            │                                                           │
│            ▼                                                           │
│     ┌──────────────┐      ┌──────────────┐                            │
│     │    Daily     │ ───► │   Streak     │ ◄─── Don't break it!       │
│     │  Challenges  │      │   System     │                            │
│     │  (PRP-008)   │      │  (PRP-009)   │                            │
│     └──────┬───────┘      └──────┬───────┘                            │
│            │                     │                                     │
│            └──────────┬──────────┘                                     │
│                       │                                                │
│                       ▼                                                │
│     ┌─────────────────────────────────┐                               │
│     │         EARN COINS              │                               │
│     │  • Complete challenges          │                               │
│     │  • Maintain streaks             │                               │
│     │  • Finish levels                │                               │
│     └─────────────────┬───────────────┘                               │
│                       │                                                │
│            ┌──────────┴──────────┐                                     │
│            ▼                     ▼                                     │
│     ┌──────────────┐      ┌──────────────┐                            │
│     │  Coin Shop   │      │   Premium    │                            │
│     │  (PRP-026)   │      │  (PRP-025)   │                            │
│     │              │      │              │                            │
│     │ Spend coins  │      │ Skip grind   │                            │
│     │ on cosmetics │      │ Get perks    │                            │
│     └──────────────┘      └──────────────┘                            │
│                                                                         │
│  RESULT: Users engage daily, earn rewards, optionally pay for perks   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Architecture Overview

### Database Schema (Unified)

All schema changes are made in Phase 1 to avoid multiple migrations:

```typescript
// convex/schema.ts - COMPLETE SCHEMA FOR BUNDLE

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ═══════════════════════════════════════════════════════════════════
  // EXISTING TABLES (with modifications)
  // ═══════════════════════════════════════════════════════════════════

  users: defineTable({
    clerkId: v.string(),
    email: v.optional(v.string()),
    username: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    avatarId: v.optional(v.string()),
    coins: v.number(),                          // PRP-026
    isPremium: v.boolean(),                     // PRP-025
    premiumExpiresAt: v.optional(v.number()),   // PRP-025
    stripeCustomerId: v.optional(v.string()),   // PRP-025
    createdAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_stripe_customer", ["stripeCustomerId"]),

  gameState: defineTable({
    clerkId: v.string(),
    xp: v.number(),
    level: v.number(),
    coins: v.number(),
    maxCombo: v.number(),
    totalWordsTyped: v.optional(v.number()),    // NEW: for stats
    totalTimeSpent: v.optional(v.number()),     // NEW: for stats
  })
    .index("by_clerk_id", ["clerkId"]),

  lessonProgress: defineTable({
    clerkId: v.string(),
    lessonId: v.number(),
    completed: v.boolean(),
    bestWPM: v.number(),
    bestAccuracy: v.number(),
    attempts: v.number(),
    quizPassed: v.boolean(),
    firstCompletedAt: v.optional(v.number()),   // NEW: for first-time bonus
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_lesson", ["lessonId"]),

  // ═══════════════════════════════════════════════════════════════════
  // PRP-008: DAILY CHALLENGES
  // ═══════════════════════════════════════════════════════════════════

  dailyChallenges: defineTable({
    date: v.string(),                           // YYYY-MM-DD
    challengeType: v.string(),                  // "speed" | "accuracy" | "endurance" | "keys"
    title: v.string(),
    description: v.string(),
    targetValue: v.number(),                    // WPM target, accuracy %, etc.
    targetKeys: v.optional(v.array(v.string())), // For key-specific challenges
    lessonId: v.optional(v.number()),           // Optional specific lesson
    rewards: v.object({
      bronze: v.number(),                       // Coins for bronze
      silver: v.number(),                       // Coins for silver
      gold: v.number(),                         // Coins for gold
      xp: v.number(),
    }),
    createdAt: v.number(),
  })
    .index("by_date", ["date"]),

  dailyChallengeProgress: defineTable({
    clerkId: v.string(),
    challengeId: v.id("dailyChallenges"),
    date: v.string(),
    status: v.string(),                         // "pending" | "bronze" | "silver" | "gold"
    bestValue: v.number(),                      // Best attempt value
    attempts: v.number(),
    completedAt: v.optional(v.number()),
    rewardsClaimed: v.boolean(),
  })
    .index("by_clerk_date", ["clerkId", "date"])
    .index("by_challenge", ["challengeId"]),

  // ═══════════════════════════════════════════════════════════════════
  // PRP-009: STREAK SYSTEM
  // ═══════════════════════════════════════════════════════════════════

  streaks: defineTable({
    clerkId: v.string(),
    currentStreak: v.number(),
    longestStreak: v.number(),
    lastActivityDate: v.string(),               // YYYY-MM-DD
    streakFreezeCount: v.number(),              // Available freezes
    streakFreezeUsedDates: v.array(v.string()), // Dates where freeze was used
    totalDaysActive: v.number(),
  })
    .index("by_clerk_id", ["clerkId"]),

  // ═══════════════════════════════════════════════════════════════════
  // PRP-025: PREMIUM SUBSCRIPTION
  // ═══════════════════════════════════════════════════════════════════

  subscriptions: defineTable({
    clerkId: v.string(),
    stripeSubscriptionId: v.string(),
    stripeCustomerId: v.string(),
    status: v.string(),                         // "active" | "canceled" | "past_due"
    plan: v.string(),                           // "monthly" | "yearly"
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_stripe_subscription", ["stripeSubscriptionId"]),

  // ═══════════════════════════════════════════════════════════════════
  // PRP-026: COIN SHOP
  // ═══════════════════════════════════════════════════════════════════

  shopItems: defineTable({
    itemId: v.string(),
    name: v.string(),
    description: v.string(),
    category: v.string(),                       // "avatar" | "theme" | "keyboard-skin" | "power-up"
    rarity: v.string(),                         // "common" | "rare" | "epic" | "legendary"
    price: v.number(),
    imageUrl: v.string(),
    previewUrl: v.optional(v.string()),
    isConsumable: v.boolean(),
    isPremiumOnly: v.boolean(),                 // PRP-025 integration
    isFeatured: v.boolean(),
    isOnSale: v.boolean(),
    salePrice: v.optional(v.number()),
    requiredLevel: v.optional(v.number()),
    seasonalTag: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_featured", ["isFeatured"])
    .index("by_rarity", ["rarity"]),

  inventory: defineTable({
    clerkId: v.string(),
    itemId: v.string(),
    quantity: v.number(),
    purchasedAt: v.number(),
    isEquipped: v.boolean(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_clerk_item", ["clerkId", "itemId"]),

  transactions: defineTable({
    clerkId: v.string(),
    type: v.string(),                           // "earn" | "spend" | "purchase" | "premium_bonus"
    amount: v.number(),
    source: v.string(),
    itemId: v.optional(v.string()),
    metadata: v.optional(v.any()),
    balanceBefore: v.number(),
    balanceAfter: v.number(),
    timestamp: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_timestamp", ["timestamp"]),
});
```

---

## Implementation Phases

### Phase 0: Pre-Implementation Checklist

Before starting, ensure:

```
[ ] Convex project is set up and deployed
[ ] Clerk authentication is working
[ ] Current schema is backed up
[ ] Environment variables are configured:
    - VITE_CONVEX_URL
    - VITE_CLERK_PUBLISHABLE_KEY
    - STRIPE_SECRET_KEY (for PRP-025)
    - STRIPE_WEBHOOK_SECRET (for PRP-025)
```

---

## Phase 1: Schema & Backend Foundation

**Goal**: Deploy unified schema and create all Convex functions

### Task 1.1: Update Schema
```yaml
file: convex/schema.ts
action: replace
description: Replace entire schema with unified version above
depends_on: []
acceptance:
  - npx convex dev runs without errors
  - All tables are created in Convex dashboard
```

### Task 1.2: Create Coins Module
```yaml
file: convex/coins.ts
action: create
description: |
  Create coin management functions:
  - getCoinBalance(clerkId) -> number
  - awardCoins({ clerkId, amount, source, metadata }) -> { newBalance }
  - spendCoins({ clerkId, amount, source, itemId }) -> { newBalance }
  - getTransactionHistory({ clerkId, limit }) -> Transaction[]
depends_on: [1.1]
acceptance:
  - All functions deploy successfully
  - Test awardCoins in Convex dashboard
```

### Task 1.3: Create Streaks Module
```yaml
file: convex/streaks.ts
action: create
description: |
  Create streak management functions:
  - getStreak(clerkId) -> StreakInfo
  - recordActivity(clerkId) -> { streak, isNewDay, coinsEarned }
  - useStreakFreeze(clerkId) -> { success, remaining }
  - purchaseStreakFreeze(clerkId) -> { success, cost }

  Logic:
  - Check if lastActivityDate is today -> no change
  - Check if lastActivityDate is yesterday -> increment streak
  - Otherwise -> reset streak (unless freeze available)
  - Award coins: base 5, 2x at 7 days, 3x at 30 days
depends_on: [1.1, 1.2]
acceptance:
  - Streak increments correctly
  - Streak resets after gap (without freeze)
  - Freeze prevents reset
```

### Task 1.4: Create Daily Challenges Module
```yaml
file: convex/dailyChallenges.ts
action: create
description: |
  Create daily challenge functions:
  - getTodaysChallenge() -> DailyChallenge | null
  - generateChallenge(date) -> DailyChallenge (internal/cron)
  - getUserChallengeProgress(clerkId) -> ChallengeProgress
  - submitChallengeAttempt({ clerkId, value }) -> { tier, coinsEarned }
  - claimChallengeRewards(clerkId) -> { coins, xp }

  Challenge Types:
  - speed: Achieve X WPM
  - accuracy: Achieve X% accuracy
  - endurance: Type X words without error
  - keys: Focus on specific keys (e.g., "Master Q, W, E today")

  Tiers:
  - Bronze: 50% of target
  - Silver: 75% of target
  - Gold: 100% of target
depends_on: [1.1, 1.2]
acceptance:
  - Challenge generates for today
  - Progress tracks correctly
  - Rewards match tier
```

### Task 1.5: Create Shop Module
```yaml
file: convex/shop.ts
action: create
description: |
  Create shop functions:
  - getShopItems({ category?, featured?, rarity? }) -> ShopItem[]
  - getInventory(clerkId) -> InventoryItem[]
  - purchaseItem({ clerkId, itemId }) -> { success, newBalance }
  - equipItem({ clerkId, itemId }) -> { success }
  - unequipItem({ clerkId, itemId }) -> { success }

  Validation:
  - Check coin balance
  - Check if already owned (non-consumable)
  - Check level requirement
  - Check premium-only items
depends_on: [1.1, 1.2]
acceptance:
  - Can browse shop items
  - Purchase deducts coins
  - Equip/unequip works
```

### Task 1.6: Create Premium Module
```yaml
file: convex/premium.ts
action: create
description: |
  Create premium subscription functions:
  - isPremium(clerkId) -> boolean
  - getPremiumStatus(clerkId) -> PremiumStatus
  - createCheckoutSession({ clerkId, plan }) -> { url }
  - handleWebhook(event) -> void
  - cancelSubscription(clerkId) -> { success }

  Premium Benefits:
  - 2x coin earnings
  - Exclusive shop items
  - Ad-free (if ads exist)
  - Priority support badge
  - 3 free streak freezes/month
depends_on: [1.1]
acceptance:
  - Stripe checkout works
  - Webhook updates subscription status
  - isPremium returns correctly
```

### Task 1.7: Create Levels Data Module
```yaml
file: src/data/levels.ts
action: create
description: |
  Expand from ~12 to 30 levels with progressive difficulty:

  Tier 1: Home Row (Levels 1-5)
  - L1: A, S, D, F (left hand)
  - L2: J, K, L, ; (right hand)
  - L3: G, H (index fingers)
  - L4: Home row combined
  - L5: Home row speed challenge

  Tier 2: Top Row (Levels 6-10)
  - L6: Q, W, E, R, T
  - L7: Y, U, I, O, P
  - L8: Top + Home combined
  - L9: Common words (the, that, with)
  - L10: Top row speed challenge

  Tier 3: Bottom Row (Levels 11-15)
  - L11: Z, X, C, V, B
  - L12: N, M, comma, period
  - L13: All letters combined
  - L14: Punctuation basics
  - L15: Full keyboard speed

  Tier 4: Numbers & Symbols (Levels 16-20)
  - L16: Numbers 1-5
  - L17: Numbers 6-0
  - L18: Common symbols (!@#$%)
  - L19: Programming symbols ({}[]<>)
  - L20: Numbers speed challenge

  Tier 5: Advanced (Levels 21-25)
  - L21: Capital letters
  - L22: Mixed case words
  - L23: Sentences
  - L24: Paragraphs
  - L25: Advanced speed challenge

  Tier 6: Mastery (Levels 26-30)
  - L26: Programming keywords
  - L27: Technical terms
  - L28: Mixed content
  - L29: Endurance challenge
  - L30: Final boss - ultimate test

  Each level includes:
  - keys: string[] (keys to practice)
  - words: string[] (practice words)
  - targetWPM: number
  - targetAccuracy: number
  - unlockRequirement: { level: number, quizPassed: boolean }
depends_on: []
acceptance:
  - 30 levels defined
  - Progressive difficulty
  - Words use only available keys
```

### Task 1.8: Seed Shop Items
```yaml
file: convex/seedShopItems.ts
action: create
description: |
  Create mutation to seed initial shop items:

  Avatars (8 items from PRP-003):
  - pixel-knight (free)
  - code-wizard (200 coins)
  - speed-ninja (250 coins)
  - robo-typer (75 coins)
  - keyboard-cat (500 coins)
  - bit-hero (150 coins)
  - arcade-ghost (400 coins)
  - dragon-coder (1200 coins, level 10)

  Themes (6 items):
  - retro-green (50 coins)
  - synthwave (300 coins)
  - cyberpunk (600 coins)
  - ocean-depths (200 coins)
  - forest-zen (200 coins)
  - neon-nights (450 coins, premium only)

  Keyboard Skins (4 items):
  - wooden-keys (100 coins)
  - neon-glow (250 coins)
  - holographic (550 coins)
  - mechanical-rgb (400 coins, premium only)

  Power-ups (4 items):
  - xp-boost-2x (100 coins, consumable)
  - streak-freeze (75 coins, consumable)
  - hint-token (25 coins, consumable)
  - coin-magnet (150 coins, consumable, 2x coins for 1 hour)
depends_on: [1.1]
acceptance:
  - Run mutation in Convex dashboard
  - All items appear in shopItems table
```

---

## Phase 2: Frontend Components - Core UI

**Goal**: Build reusable UI components for all features

### Task 2.1: Coin Balance Component
```yaml
file: src/components/CoinBalance.tsx
action: create
description: |
  Reusable coin display component:
  - Props: { balance: number, size?: 'sm' | 'md' | 'lg', showIcon?: boolean }
  - Animated number change
  - Pixel art coin icon
  - Used in header, shop, rewards
depends_on: []
acceptance:
  - Renders correctly at all sizes
  - Animation on balance change
```

### Task 2.2: Streak Display Component
```yaml
file: src/components/StreakDisplay.tsx
action: create
description: |
  Streak counter component:
  - Props: { streak: number, isOnFire?: boolean }
  - Fire emoji animation when streak > 0
  - Pulsing glow effect for high streaks (7+, 30+)
  - Click to show streak details modal
depends_on: []
acceptance:
  - Shows current streak
  - Visual difference for milestones
```

### Task 2.3: Daily Challenge Card Component
```yaml
file: src/components/DailyChallengeCard.tsx
action: create
description: |
  Daily challenge display:
  - Props: { challenge: DailyChallenge, progress?: ChallengeProgress }
  - Challenge type icon
  - Progress bar with bronze/silver/gold markers
  - Time remaining countdown
  - "Start Challenge" or "Continue" button
  - Rewards preview
depends_on: []
acceptance:
  - Shows challenge details
  - Progress bar updates
  - Correct tier highlighting
```

### Task 2.4: Reward Popup Component
```yaml
file: src/components/RewardPopup.tsx
action: create
description: |
  Animated reward celebration:
  - Props: { coins?: number, xp?: number, streak?: number, items?: string[] }
  - Coin shower animation
  - Sound effect (if enabled)
  - Auto-dismiss after 3 seconds
  - Click to dismiss early
depends_on: []
acceptance:
  - Smooth animations
  - Shows all reward types
  - Dismisses correctly
```

### Task 2.5: Premium Badge Component
```yaml
file: src/components/PremiumBadge.tsx
action: create
description: |
  Premium status indicator:
  - Props: { size?: 'sm' | 'md' }
  - Crown or star icon
  - Glowing effect
  - Tooltip with benefits
depends_on: []
acceptance:
  - Visual distinction
  - Clear premium indicator
```

### Task 2.6: Level Card Component (Updated)
```yaml
file: src/components/LessonCard.tsx
action: modify
description: |
  Update existing LessonCard for 30 levels:
  - Add tier badge (Beginner, Intermediate, Advanced, Expert, Master)
  - Add lock icon for locked levels
  - Add completion stars (1-3 based on performance)
  - Show best WPM and accuracy
  - Add "NEW" badge for recently unlocked
depends_on: []
acceptance:
  - Displays all level states
  - Tier badges correct
  - Performance stars show
```

---

## Phase 3: Frontend Pages & Integration

**Goal**: Build main feature pages and integrate with backend

### Task 3.1: Daily Challenge Section (Home)
```yaml
file: src/components/DailyChallengeSection.tsx
action: create
description: |
  Add to home page - daily challenge widget:
  - Fetches today's challenge
  - Shows progress if started
  - "New Challenge!" animation at midnight
  - Quick-start button
  - Links to full challenge page
depends_on: [1.4, 2.3]
acceptance:
  - Shows on home page
  - Challenge loads correctly
  - Progress syncs
```

### Task 3.2: Streak Section (Home)
```yaml
file: src/components/StreakSection.tsx
action: create
description: |
  Add to home page - streak widget:
  - Current streak count with fire
  - "Keep your streak!" message
  - Next milestone progress
  - Streak freeze count
  - Daily reward claim button (if not claimed)
depends_on: [1.3, 2.2]
acceptance:
  - Shows current streak
  - Claim reward works
  - Freeze count shows
```

### Task 3.3: Shop Page
```yaml
file: src/components/Shop.tsx
action: create
description: |
  Full shop page:
  - Category tabs (Featured, Avatars, Themes, Skins, Power-ups)
  - Item grid with ShopItemCard
  - Filter by rarity
  - Sort by price
  - Coin balance in header
  - "Earn More" link
  - Purchase confirmation modal
  - Success/error feedback
depends_on: [1.5, 2.1]
acceptance:
  - All categories load
  - Purchase flow works
  - Inventory updates
```

### Task 3.4: Levels Page (Updated)
```yaml
file: src/App.tsx
action: modify
description: |
  Update level select for 30 levels:
  - Tier sections (collapsible)
  - Progress per tier
  - Overall completion percentage
  - Quick jump to current level
  - Locked level tooltips
depends_on: [1.7, 2.6]
acceptance:
  - All 30 levels display
  - Tiers organized
  - Progression clear
```

### Task 3.5: Premium Upgrade Page
```yaml
file: src/components/PremiumPage.tsx
action: create
description: |
  Premium subscription page:
  - Benefits list with icons
  - Monthly vs Yearly pricing
  - Savings badge for yearly
  - Stripe checkout button
  - Current status (if premium)
  - Cancel subscription option
  - FAQ section
depends_on: [1.6]
acceptance:
  - Benefits clear
  - Checkout redirects to Stripe
  - Status shows correctly
```

### Task 3.6: Header Update
```yaml
file: src/App.tsx
action: modify
description: |
  Update header with new elements:
  - Coin balance (clickable -> shop)
  - Streak counter (clickable -> streak details)
  - Premium badge (if premium)
  - Daily challenge mini-indicator
  - Notification dot for unclaimed rewards
depends_on: [2.1, 2.2, 2.5]
acceptance:
  - All elements show
  - Click actions work
  - Responsive layout
```

---

## Phase 4: Game Loop Integration

**Goal**: Connect features to core gameplay

### Task 4.1: Lesson Complete Rewards
```yaml
file: src/components/LessonView.tsx
action: modify
description: |
  Award coins/XP on lesson completion:
  - Base: 10 coins
  - Perfect accuracy: +5 coins
  - Speed bonus (>60 WPM): +5 coins
  - First completion: +10 coins
  - Premium: 2x all coins

  Also:
  - Record activity for streak
  - Check daily challenge progress
  - Show RewardPopup
depends_on: [1.2, 1.3, 2.4]
acceptance:
  - Coins awarded correctly
  - Streak updates
  - Popup shows
```

### Task 4.2: Quiz Complete Rewards
```yaml
file: src/components/Quiz.tsx
action: modify
description: |
  Award coins/XP on quiz pass:
  - Base: 50 coins
  - Perfect: +25 coins
  - Speed bonus: +25 coins
  - Premium: 2x coins

  Update daily challenge if applicable
depends_on: [1.2, 1.4]
acceptance:
  - Boss defeat rewards work
  - Challenge progress updates
```

### Task 4.3: Daily Challenge Gameplay
```yaml
file: src/components/DailyChallengeView.tsx
action: create
description: |
  Dedicated challenge gameplay view:
  - Challenge objective display
  - Real-time progress toward tiers
  - Timer (if time-limited challenge)
  - Submit attempt on completion
  - Tier achieved celebration
  - Claim rewards button
depends_on: [1.4, 2.3, 2.4]
acceptance:
  - Challenge gameplay works
  - Tiers calculate correctly
  - Rewards claimable
```

### Task 4.4: Streak Maintenance Logic
```yaml
file: src/hooks/useStreakMaintenance.ts
action: create
description: |
  Hook that runs on app load:
  - Check if activity recorded today
  - If not, check streak status
  - If streak at risk, show warning
  - If streak broken, show recovery option
  - Auto-record activity on any lesson/challenge complete
depends_on: [1.3]
acceptance:
  - Streak warning shows
  - Auto-records on activity
  - Recovery flow works
```

### Task 4.5: Premium Perks Integration
```yaml
file: src/hooks/usePremium.ts
action: create
description: |
  Hook for premium status:
  - isPremium: boolean
  - premiumExpiresAt: Date
  - benefits: string[]
  - 2x coin multiplier logic
  - Premium-only item access
  - Monthly streak freeze grant
depends_on: [1.6]
acceptance:
  - Status accurate
  - Multiplier works
  - Benefits apply
```

---

## Phase 5: Polish & Testing

**Goal**: Final integration, edge cases, and UX polish

### Task 5.1: Offline Handling
```yaml
file: src/hooks/useOfflineQueue.ts
action: create
description: |
  Queue actions when offline:
  - Coin awards
  - Progress updates
  - Sync when back online
  - Show offline indicator
depends_on: []
acceptance:
  - Actions queue
  - Sync on reconnect
```

### Task 5.2: Error Boundaries
```yaml
file: src/components/ErrorBoundary.tsx
action: create
description: |
  Graceful error handling:
  - Catch render errors
  - Show friendly message
  - Retry button
  - Report issue link
depends_on: []
acceptance:
  - Errors caught
  - Recovery possible
```

### Task 5.3: Loading States
```yaml
file: src/components/LoadingStates.tsx
action: create
description: |
  Consistent loading UI:
  - Skeleton loaders for shop items
  - Spinner for actions
  - Progress bar for syncing
  - Pixel art loading animation
depends_on: []
acceptance:
  - All async states covered
  - Consistent style
```

### Task 5.4: Notification System
```yaml
file: src/hooks/useNotifications.ts
action: create
description: |
  In-app notifications:
  - Streak at risk warning
  - New daily challenge available
  - Reward ready to claim
  - Premium expiring soon
  - Achievement unlocked
depends_on: []
acceptance:
  - Notifications show
  - Dismissible
  - Action buttons work
```

### Task 5.5: Analytics Events
```yaml
file: src/lib/analytics.ts
action: create
description: |
  Track key events:
  - level_complete
  - challenge_attempt
  - challenge_complete
  - streak_milestone
  - purchase_item
  - premium_subscribe
  - premium_cancel
depends_on: []
acceptance:
  - Events fire correctly
  - Data accurate
```

### Task 5.6: Stripe Webhook Handler
```yaml
file: convex/http.ts
action: create
description: |
  HTTP endpoint for Stripe webhooks:
  - checkout.session.completed
  - customer.subscription.updated
  - customer.subscription.deleted
  - invoice.payment_failed

  Update user premium status accordingly
depends_on: [1.6]
acceptance:
  - Webhooks received
  - Status updates correctly
  - Handles edge cases
```

---

## Task Dependency Graph

```
Phase 1 (Backend):
  1.1 ──┬── 1.2 ──┬── 1.3 (streaks)
        │         └── 1.4 (challenges)
        ├── 1.5 (shop)
        ├── 1.6 (premium)
        └── 1.8 (seed)
  1.7 (levels - parallel)

Phase 2 (Components):
  2.1, 2.2, 2.3, 2.4, 2.5, 2.6 (all parallel)

Phase 3 (Pages):
  1.3 + 2.2 ── 3.2 (streak section)
  1.4 + 2.3 ── 3.1 (challenge section)
  1.5 + 2.1 ── 3.3 (shop)
  1.6 ──────── 3.5 (premium page)
  1.7 + 2.6 ── 3.4 (levels)
  2.* ──────── 3.6 (header)

Phase 4 (Integration):
  1.2 + 1.3 + 2.4 ── 4.1 (lesson rewards)
  1.2 + 1.4 ──────── 4.2 (quiz rewards)
  1.4 + 2.3 + 2.4 ── 4.3 (challenge view)
  1.3 ──────────────── 4.4 (streak hook)
  1.6 ──────────────── 4.5 (premium hook)

Phase 5 (Polish):
  All parallel, depends on Phase 4 complete
```

---

## Ralph Wiggum Execution Plan

For automated implementation with `/ralph-wiggum`, execute tasks in this order:

```bash
# Phase 1: Backend Foundation
ralph-wiggum execute 1.1  # Schema
ralph-wiggum execute 1.7  # Levels data (parallel)
ralph-wiggum execute 1.2  # Coins
ralph-wiggum execute 1.3 1.4 1.5 1.6  # Parallel modules
ralph-wiggum execute 1.8  # Seed data

# Phase 2: UI Components (all parallel)
ralph-wiggum execute 2.1 2.2 2.3 2.4 2.5 2.6

# Phase 3: Pages
ralph-wiggum execute 3.1 3.2 3.3  # Main sections
ralph-wiggum execute 3.4 3.5 3.6  # Remaining pages

# Phase 4: Integration
ralph-wiggum execute 4.1 4.2  # Reward integration
ralph-wiggum execute 4.3 4.4 4.5  # Feature hooks

# Phase 5: Polish
ralph-wiggum execute 5.1 5.2 5.3 5.4 5.5 5.6
```

---

## Success Metrics

After implementation, measure:

| Metric | Target | Measurement |
|--------|--------|-------------|
| DAU/MAU | >30% | Analytics |
| 7-day retention | >40% | Cohort analysis |
| 30-day retention | >20% | Cohort analysis |
| Avg. session length | >8 min | Analytics |
| Daily challenge completion | >50% | Convex queries |
| Streak >7 days | >25% users | Convex queries |
| Shop conversion | >10% | Transactions/users |
| Premium conversion | >2% | Subscriptions/users |

---

## Rollback Plan

If issues arise:

1. **Schema issues**: Convex supports schema rollback via git
2. **Frontend bugs**: Revert to previous Vercel deployment
3. **Stripe issues**: Disable premium page, refund if needed
4. **Performance issues**: Disable non-critical features via feature flags

---

## Notes for Ralph Wiggum Implementation

1. **Always read existing files before modifying** - preserve existing functionality
2. **Run `npx convex dev`** after schema changes to verify
3. **Test each phase** before moving to next
4. **Commit after each phase** for easy rollback
5. **Use TypeScript strict mode** - fix any type errors
6. **Follow existing code patterns** in the codebase
7. **Keep pixel art aesthetic** - use Press Start 2P font, 8-bit colors
8. **Test on mobile** - responsive design is critical

---

## Related PRPs

- **PRP-004**: 30 Additional Levels (incorporated in 1.7)
- **PRP-008**: Daily Challenges (incorporated in 1.4, 3.1, 4.3)
- **PRP-009**: Streak System (incorporated in 1.3, 3.2, 4.4)
- **PRP-025**: Premium Subscription (incorporated in 1.6, 3.5, 4.5)
- **PRP-026**: Coin Shop (incorporated in 1.5, 3.3)
