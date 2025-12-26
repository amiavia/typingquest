import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

// Challenge templates
const CHALLENGE_TEMPLATES = {
  speed: [
    { title: "SPEED DEMON", description: "Achieve {target} WPM", baseTarget: 40 },
    { title: "QUICK FINGERS", description: "Type at {target} WPM or faster", baseTarget: 35 },
    { title: "VELOCITY MASTER", description: "Reach {target} WPM today", baseTarget: 45 },
  ],
  accuracy: [
    { title: "PRECISION STRIKE", description: "Achieve {target}% accuracy", baseTarget: 95 },
    { title: "FLAWLESS RUN", description: "Complete a lesson with {target}% accuracy", baseTarget: 98 },
    { title: "PERFECT AIM", description: "Type with {target}% accuracy", baseTarget: 90 },
  ],
  endurance: [
    { title: "MARATHON TYPER", description: "Type {target} words without errors", baseTarget: 50 },
    { title: "WORD WARRIOR", description: "Complete {target} words perfectly", baseTarget: 30 },
    { title: "STAMINA TEST", description: "Maintain accuracy for {target} words", baseTarget: 75 },
  ],
  keys: [
    { title: "KEY FOCUS", description: "Master the {keys} keys today", targetKeys: ["q", "w", "e", "r"] },
    { title: "FINGER TRAINING", description: "Practice {keys} until perfect", targetKeys: ["a", "s", "d", "f"] },
    { title: "PINKY POWER", description: "Focus on {keys} keys", targetKeys: ["p", ";", "z", "/"] },
  ],
};

// Tier thresholds (percentage of target)
const TIERS = {
  bronze: 0.5, // 50%
  silver: 0.75, // 75%
  gold: 1.0, // 100%
};

// Get today's date in YYYY-MM-DD format
function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

// Generate a deterministic challenge for a date
function generateChallengeForDate(date: string) {
  // Use date string to create deterministic randomness
  const seed = date.split("-").reduce((acc, val) => acc + parseInt(val), 0);

  const types = ["speed", "accuracy", "endurance", "keys"] as const;
  const typeIndex = seed % types.length;
  const type = types[typeIndex];

  const templates = CHALLENGE_TEMPLATES[type];
  const templateIndex = (seed * 7) % templates.length;
  const template = templates[templateIndex];

  // Vary target based on day
  const dayOfMonth = parseInt(date.split("-")[2]);
  const targetVariation = 1 + (dayOfMonth % 5) * 0.1; // 1.0 to 1.4

  let targetValue = 0;
  let targetKeys: string[] | undefined;

  if (type === "keys") {
    // Keys challenges measure accuracy (%), target 90% with slight variation
    const baseAccuracy = 90;
    targetValue = Math.min(98, Math.round(baseAccuracy + (dayOfMonth % 5) * 2)); // 90-98%
    targetKeys = (template as { targetKeys: string[] }).targetKeys;
  } else {
    const baseTarget = (template as { baseTarget: number }).baseTarget;
    targetValue = Math.round(baseTarget * targetVariation);
  }

  // Generate rewards based on difficulty
  const baseReward = 50 + (seed % 30);
  const rewards = {
    bronze: baseReward,
    silver: Math.round(baseReward * 1.5),
    gold: baseReward * 2,
    xp: Math.round(baseReward * 0.5),
  };

  // Format description with target
  let description = template.description;
  if (targetKeys) {
    description = description.replace("{keys}", targetKeys.join(", ").toUpperCase());
  } else {
    description = description.replace("{target}", targetValue.toString());
  }

  return {
    date,
    challengeType: type,
    title: template.title,
    description,
    targetValue,
    targetKeys,
    rewards,
    createdAt: Date.now(),
  };
}

// Get today's challenge
export const getTodaysChallenge = query({
  args: {},
  handler: async (ctx) => {
    const today = getTodayDate();

    let challenge = await ctx.db
      .query("dailyChallenges")
      .withIndex("by_date", (q) => q.eq("date", today))
      .first();

    if (!challenge) {
      // Return generated challenge (will be created on first interaction)
      return generateChallengeForDate(today);
    }

    return challenge;
  },
});

// Create today's challenge if it doesn't exist
export const ensureTodaysChallenge = mutation({
  args: {},
  handler: async (ctx) => {
    const today = getTodayDate();

    const existing = await ctx.db
      .query("dailyChallenges")
      .withIndex("by_date", (q) => q.eq("date", today))
      .first();

    if (existing) {
      return existing;
    }

    const challengeData = generateChallengeForDate(today);
    const challengeId = await ctx.db.insert("dailyChallenges", challengeData);

    return { _id: challengeId, ...challengeData };
  },
});

// Internal mutation for cron job to generate daily challenge
export const generateDailyChallenge = internalMutation({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("dailyChallenges")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .first();

    if (existing) {
      return existing._id;
    }

    const challengeData = generateChallengeForDate(args.date);
    return await ctx.db.insert("dailyChallenges", challengeData);
  },
});

// Get user's progress for today's challenge
export const getUserChallengeProgress = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const today = getTodayDate();

    const progress = await ctx.db
      .query("dailyChallengeProgress")
      .withIndex("by_clerk_date", (q) =>
        q.eq("clerkId", args.clerkId).eq("date", today)
      )
      .first();

    if (!progress) {
      return {
        status: "not_started",
        bestValue: 0,
        attempts: 0,
        rewardsClaimed: false,
      };
    }

    return progress;
  },
});

// Submit a challenge attempt
export const submitChallengeAttempt = mutation({
  args: {
    clerkId: v.string(),
    value: v.number(),
  },
  handler: async (ctx, args) => {
    const today = getTodayDate();

    // Ensure challenge exists
    let challenge = await ctx.db
      .query("dailyChallenges")
      .withIndex("by_date", (q) => q.eq("date", today))
      .first();

    if (!challenge) {
      const challengeData = generateChallengeForDate(today);
      const challengeId = await ctx.db.insert("dailyChallenges", challengeData);
      challenge = await ctx.db.get(challengeId);
    }

    if (!challenge) {
      throw new Error("Failed to create or get challenge");
    }

    // Get or create progress
    let progress = await ctx.db
      .query("dailyChallengeProgress")
      .withIndex("by_clerk_date", (q) =>
        q.eq("clerkId", args.clerkId).eq("date", today)
      )
      .first();

    // Calculate tier based on value
    const percentage = args.value / challenge.targetValue;
    let tier = "pending";
    if (percentage >= TIERS.gold) tier = "gold";
    else if (percentage >= TIERS.silver) tier = "silver";
    else if (percentage >= TIERS.bronze) tier = "bronze";

    const isNewBest = !progress || args.value > progress.bestValue;
    const isNewTier = !progress || tier !== progress.status;

    if (!progress) {
      await ctx.db.insert("dailyChallengeProgress", {
        clerkId: args.clerkId,
        challengeId: challenge._id,
        date: today,
        status: tier,
        bestValue: args.value,
        attempts: 1,
        completedAt: tier !== "pending" ? Date.now() : undefined,
        rewardsClaimed: false,
      });
    } else {
      const newStatus =
        tierRank(tier) > tierRank(progress.status) ? tier : progress.status;
      await ctx.db.patch(progress._id, {
        status: newStatus,
        bestValue: Math.max(progress.bestValue, args.value),
        attempts: progress.attempts + 1,
        completedAt:
          newStatus !== "pending" && !progress.completedAt
            ? Date.now()
            : progress.completedAt,
      });
    }

    return {
      tier: tier as "pending" | "bronze" | "silver" | "gold",
      isNewBest,
      isNewTier: isNewTier && tier !== "pending",
      value: args.value,
      target: challenge.targetValue,
      rewards: tier !== "pending" ? challenge.rewards : null,
    };
  },
});

// Helper to rank tiers
function tierRank(tier: string): number {
  switch (tier) {
    case "gold":
      return 3;
    case "silver":
      return 2;
    case "bronze":
      return 1;
    default:
      return 0;
  }
}

// Claim challenge rewards
export const claimChallengeRewards = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const today = getTodayDate();

    const progress = await ctx.db
      .query("dailyChallengeProgress")
      .withIndex("by_clerk_date", (q) =>
        q.eq("clerkId", args.clerkId).eq("date", today)
      )
      .first();

    if (!progress) {
      return { success: false, reason: "No progress found" };
    }

    if (progress.status === "pending") {
      return { success: false, reason: "Challenge not completed" };
    }

    if (progress.rewardsClaimed) {
      return { success: false, reason: "Rewards already claimed" };
    }

    const challenge = await ctx.db.get(progress.challengeId);
    if (!challenge) {
      return { success: false, reason: "Challenge not found" };
    }

    // Get reward amount based on tier
    let coinReward = 0;
    switch (progress.status) {
      case "gold":
        coinReward = challenge.rewards.gold;
        break;
      case "silver":
        coinReward = challenge.rewards.silver;
        break;
      case "bronze":
        coinReward = challenge.rewards.bronze;
        break;
    }

    // Award coins
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      return { success: false, reason: "User not found" };
    }

    const gameState = await ctx.db
      .query("gameState")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    const currentBalance = gameState?.coins ?? 0;

    // Apply premium bonus
    const isPremium = user.isPremium === true;
    const finalCoinReward = isPremium ? coinReward * 2 : coinReward;
    const xpReward = challenge.rewards.xp;

    // Update game state
    if (gameState) {
      await ctx.db.patch(gameState._id, {
        coins: currentBalance + finalCoinReward,
        xp: gameState.xp + xpReward,
        totalXp: gameState.totalXp + xpReward,
        updatedAt: Date.now(),
      });
    }

    // Record transaction
    await ctx.db.insert("transactions", {
      clerkId: args.clerkId,
      type: isPremium ? "premium_bonus" : "earn",
      amount: finalCoinReward,
      source: `daily_challenge_${progress.status}`,
      metadata: { challengeId: progress.challengeId, tier: progress.status },
      balanceBefore: currentBalance,
      balanceAfter: currentBalance + finalCoinReward,
      timestamp: Date.now(),
    });

    // Mark as claimed
    await ctx.db.patch(progress._id, {
      rewardsClaimed: true,
    });

    return {
      success: true,
      coins: finalCoinReward,
      xp: xpReward,
      tier: progress.status,
      isPremiumBonus: isPremium,
    };
  },
});

// Get challenge history for a user
export const getChallengeHistory = query({
  args: {
    clerkId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 30;

    const progressRecords = await ctx.db
      .query("dailyChallengeProgress")
      .withIndex("by_clerk_date", (q) => q.eq("clerkId", args.clerkId))
      .order("desc")
      .take(limit);

    // Get challenge details
    const history = await Promise.all(
      progressRecords.map(async (progress) => {
        const challenge = await ctx.db.get(progress.challengeId);
        return {
          ...progress,
          challenge,
        };
      })
    );

    return history;
  },
});

// Get challenge stats for a user
export const getChallengeStats = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const progressRecords = await ctx.db
      .query("dailyChallengeProgress")
      .withIndex("by_clerk_date", (q) => q.eq("clerkId", args.clerkId))
      .collect();

    const completed = progressRecords.filter((p) => p.status !== "pending");
    const gold = progressRecords.filter((p) => p.status === "gold").length;
    const silver = progressRecords.filter((p) => p.status === "silver").length;
    const bronze = progressRecords.filter((p) => p.status === "bronze").length;

    return {
      totalCompleted: completed.length,
      gold,
      silver,
      bronze,
      totalAttempts: progressRecords.reduce((sum, p) => sum + p.attempts, 0),
      currentDayStreak: calculateChallengeStreak(progressRecords),
    };
  },
});

// Calculate consecutive days of challenge completion
function calculateChallengeStreak(
  records: Array<{ date: string; status: string }>
): number {
  if (records.length === 0) return 0;

  const today = getTodayDate();
  const sortedDates = records
    .filter((r) => r.status !== "pending")
    .map((r) => r.date)
    .sort()
    .reverse();

  if (sortedDates.length === 0) return 0;

  // Check if completed today or yesterday
  if (sortedDates[0] !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    if (sortedDates[0] !== yesterdayStr) return 0;
  }

  let streak = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1]);
    const currDate = new Date(sortedDates[i]);
    const diffDays = Math.floor(
      (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
