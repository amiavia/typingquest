import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ═══════════════════════════════════════════════════════════════════
  // EXISTING TABLES (preserved for backward compatibility)
  // ═══════════════════════════════════════════════════════════════════

  // Users table - links Clerk user to Convex
  users: defineTable({
    clerkId: v.string(),
    username: v.optional(v.string()),
    email: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    avatarId: v.optional(v.string()), // PRP-003/026
    isPremium: v.optional(v.boolean()), // PRP-025
    premiumExpiresAt: v.optional(v.number()), // PRP-025
    stripeCustomerId: v.optional(v.string()), // PRP-025
    // PRP-029: Nickname Privacy System
    nickname: v.optional(v.string()), // Custom nickname set by user
    autoNickname: v.optional(v.string()), // System-generated gaming nickname
    isNicknameCustom: v.optional(v.boolean()), // Whether user set custom nickname
    nicknameChangedAt: v.optional(v.number()), // When nickname was last changed
    // PRP-038: Initial Speed Test
    initialSpeedTest: v.optional(
      v.object({
        wpm: v.number(),
        accuracy: v.number(),
        timestamp: v.number(),
        keyboardLayout: v.string(),
        charactersTyped: v.number(),
        testDurationMs: v.number(),
      })
    ),
    speedTests: v.optional(
      v.array(
        v.object({
          wpm: v.number(),
          accuracy: v.number(),
          timestamp: v.number(),
          keyboardLayout: v.string(),
          charactersTyped: v.number(),
          testDurationMs: v.number(),
          testType: v.string(), // 'initial' | 'practice' | 'retake'
        })
      )
    ),
    createdAt: v.number(),
    lastLoginAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_stripe_customer", ["stripeCustomerId"])
    .index("by_nickname", ["nickname"])
    .index("by_auto_nickname", ["autoNickname"]),

  // Game state - mirrors useGameState hook structure
  gameState: defineTable({
    userId: v.id("users"),
    xp: v.number(),
    level: v.number(),
    totalXp: v.number(),
    combo: v.number(),
    maxCombo: v.number(),
    perfectStreak: v.number(),
    coins: v.number(),
    achievements: v.array(v.string()),
    highScores: v.any(), // Record<number, number> - lessonId to WPM
    totalWordsTyped: v.optional(v.number()), // NEW: for stats
    totalTimeSpent: v.optional(v.number()), // NEW: for stats (in seconds)
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Lesson progress - individual records per lesson
  lessonProgress: defineTable({
    userId: v.id("users"),
    lessonId: v.number(),
    completed: v.boolean(),
    bestWPM: v.number(),
    bestAccuracy: v.number(),
    attempts: v.number(),
    quizPassed: v.boolean(),
    firstCompletedAt: v.optional(v.number()), // NEW: for first-time bonus
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_lesson", ["userId", "lessonId"]),

  // User settings - mirrors useSettings hook structure
  settings: defineTable({
    userId: v.id("users"),
    keyboardLayout: v.string(),
    language: v.string(),
    wordLanguage: v.optional(v.string()),
    mixEnglishWords: v.boolean(),
    englishMixRatio: v.number(),
    activeThemes: v.array(v.string()),
    themeMixRatio: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Global leaderboard - stores top scores for each lesson
  leaderboard: defineTable({
    lessonId: v.number(),
    score: v.number(), // WPM
    accuracy: v.number(),
    timestamp: v.number(),
    // User info (denormalized for fast queries)
    userId: v.id("users"),
    username: v.string(),
  })
    .index("by_lesson_score", ["lessonId", "score"])
    .index("by_user", ["userId"])
    .index("by_user_and_lesson", ["userId", "lessonId"]),

  // ═══════════════════════════════════════════════════════════════════
  // PRP-008: DAILY CHALLENGES
  // ═══════════════════════════════════════════════════════════════════

  dailyChallenges: defineTable({
    date: v.string(), // YYYY-MM-DD
    challengeType: v.string(), // "speed" | "accuracy" | "endurance" | "keys"
    title: v.string(),
    description: v.string(),
    targetValue: v.number(), // WPM target, accuracy %, etc.
    targetKeys: v.optional(v.array(v.string())), // For key-specific challenges
    lessonId: v.optional(v.number()), // Optional specific lesson
    rewards: v.object({
      bronze: v.number(), // Coins for bronze
      silver: v.number(), // Coins for silver
      gold: v.number(), // Coins for gold
      xp: v.number(),
    }),
    createdAt: v.number(),
  }).index("by_date", ["date"]),

  dailyChallengeProgress: defineTable({
    clerkId: v.string(),
    challengeId: v.id("dailyChallenges"),
    date: v.string(),
    status: v.string(), // "pending" | "bronze" | "silver" | "gold"
    bestValue: v.number(), // Best attempt value
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
    lastActivityDate: v.string(), // YYYY-MM-DD
    streakFreezeCount: v.number(), // Available freezes
    streakFreezeUsedDates: v.array(v.string()), // Dates where freeze was used
    totalDaysActive: v.number(),
  }).index("by_clerk_id", ["clerkId"]),

  // ═══════════════════════════════════════════════════════════════════
  // PRP-025: PREMIUM SUBSCRIPTION
  // ═══════════════════════════════════════════════════════════════════

  subscriptions: defineTable({
    clerkId: v.string(),
    stripeSubscriptionId: v.string(),
    stripeCustomerId: v.string(),
    status: v.string(), // "active" | "canceled" | "past_due"
    plan: v.string(), // "monthly" | "yearly"
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
    category: v.string(), // "avatar" | "theme" | "keyboard-skin" | "power-up"
    rarity: v.string(), // "common" | "rare" | "epic" | "legendary"
    price: v.number(),
    imageUrl: v.string(),
    previewUrl: v.optional(v.string()),
    isConsumable: v.boolean(),
    isPremiumOnly: v.boolean(), // PRP-025 integration
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
    type: v.string(), // "earn" | "spend" | "purchase" | "premium_bonus"
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

  // ═══════════════════════════════════════════════════════════════════
  // PRP-033: POWER-UPS SYSTEM
  // ═══════════════════════════════════════════════════════════════════

  activePowerUps: defineTable({
    clerkId: v.string(),
    powerUpType: v.string(), // "xp-boost" | "coin-magnet" | "hint-token" | "streak-freeze"
    multiplier: v.optional(v.number()), // e.g., 1.5 for 50% boost
    remainingUses: v.optional(v.number()), // For consumables like hint tokens
    expiresAt: v.optional(v.number()), // Unix timestamp for time-based power-ups
    activatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_clerk_type", ["clerkId", "powerUpType"]),

  // ═══════════════════════════════════════════════════════════════════
  // PRP-046: LEADS / EMAIL CAPTURE
  // ═══════════════════════════════════════════════════════════════════

  leads: defineTable({
    email: v.string(),
    source: v.string(), // "speed_test" | "landing_page" | "level_complete" | "referral"
    speedTestResult: v.optional(
      v.object({
        wpm: v.number(),
        accuracy: v.number(),
      })
    ),
    referralCode: v.optional(v.string()), // If they came via referral
    country: v.optional(v.string()), // Detected country for regional pricing
    marketingConsent: v.boolean(), // GDPR compliance
    convertedToUser: v.boolean(), // Tracks if they signed up
    clerkId: v.optional(v.string()), // Links to user if converted
    createdAt: v.number(),
    lastEmailSent: v.optional(v.number()),
    emailSequenceStep: v.optional(v.number()), // 0=welcome, 1-5=nurture sequence
    unsubscribed: v.optional(v.boolean()), // User opted out of emails
  })
    .index("by_email", ["email"])
    .index("by_source", ["source"])
    .index("by_converted", ["convertedToUser"])
    .index("by_nurture", ["marketingConsent", "convertedToUser", "unsubscribed"]),

  // ═══════════════════════════════════════════════════════════════════
  // PRP-046: REFERRALS
  // ═══════════════════════════════════════════════════════════════════

  referralCodes: defineTable({
    clerkId: v.string(), // Owner of the referral code
    code: v.string(), // Unique referral code (e.g., "JOHN50")
    totalReferrals: v.number(), // Count of successful referrals
    totalCreditsEarned: v.number(), // Total credits earned from referrals
    createdAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_code", ["code"]),

  referralRedemptions: defineTable({
    referralCodeId: v.id("referralCodes"), // Link to the referral code used
    referrerClerkId: v.string(), // Who referred
    refereeClerkId: v.optional(v.string()), // Who was referred (once they sign up)
    refereeEmail: v.optional(v.string()), // Email if not signed up yet
    status: v.string(), // "pending" | "signed_up" | "subscribed" | "credit_applied"
    referrerCreditApplied: v.boolean(), // Has the referrer received their 50% credit?
    refereeCouponUsed: v.boolean(), // Has the referee used their 30% off?
    createdAt: v.number(),
    subscribedAt: v.optional(v.number()),
  })
    .index("by_referrer", ["referrerClerkId"])
    .index("by_referee", ["refereeClerkId"])
    .index("by_code", ["referralCodeId"])
    .index("by_status", ["status"]),
});
