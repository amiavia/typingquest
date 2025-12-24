import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get today's date in YYYY-MM-DD format
function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

// Get yesterday's date in YYYY-MM-DD format
function getYesterdayDate(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split("T")[0];
}

// Calculate streak multiplier based on streak length
function getStreakMultiplier(streak: number): number {
  if (streak >= 30) return 3;
  if (streak >= 7) return 2;
  return 1;
}

// Calculate coins earned for streak activity
function getStreakCoins(streak: number): number {
  const baseCoins = 5;
  const multiplier = getStreakMultiplier(streak);
  return baseCoins * multiplier;
}

// Get streak info for a user
export const getStreak = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const streak = await ctx.db
      .query("streaks")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!streak) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        streakFreezeCount: 0,
        streakFreezeUsedDates: [],
        totalDaysActive: 0,
        isActiveToday: false,
        isAtRisk: false,
        nextMilestone: 7,
        streakMultiplier: 1,
      };
    }

    const today = getTodayDate();
    const yesterday = getYesterdayDate();
    const isActiveToday = streak.lastActivityDate === today;
    const wasActiveYesterday = streak.lastActivityDate === yesterday;

    // Streak is at risk if not active today and was active yesterday
    const isAtRisk = !isActiveToday && wasActiveYesterday;

    // Calculate next milestone
    let nextMilestone = 7;
    if (streak.currentStreak >= 7) nextMilestone = 30;
    if (streak.currentStreak >= 30) nextMilestone = 100;
    if (streak.currentStreak >= 100) nextMilestone = 365;

    return {
      ...streak,
      isActiveToday,
      isAtRisk,
      nextMilestone,
      streakMultiplier: getStreakMultiplier(streak.currentStreak),
    };
  },
});

// Record activity for streak (called when completing a lesson/challenge)
export const recordActivity = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const today = getTodayDate();
    const yesterday = getYesterdayDate();

    let streak = await ctx.db
      .query("streaks")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    // First time user
    if (!streak) {
      const newStreak = await ctx.db.insert("streaks", {
        clerkId: args.clerkId,
        currentStreak: 1,
        longestStreak: 1,
        lastActivityDate: today,
        streakFreezeCount: 0,
        streakFreezeUsedDates: [],
        totalDaysActive: 1,
      });

      return {
        streak: 1,
        isNewDay: true,
        coinsEarned: getStreakCoins(1),
        milestoneReached: null,
      };
    }

    // Already recorded today
    if (streak.lastActivityDate === today) {
      return {
        streak: streak.currentStreak,
        isNewDay: false,
        coinsEarned: 0,
        milestoneReached: null,
      };
    }

    let newStreak = streak.currentStreak;
    let milestoneReached: number | null = null;

    if (streak.lastActivityDate === yesterday) {
      // Continue streak
      newStreak = streak.currentStreak + 1;

      // Check for milestones
      if (newStreak === 7 || newStreak === 30 || newStreak === 100 || newStreak === 365) {
        milestoneReached = newStreak;
      }
    } else {
      // Gap in activity - check if we have a freeze
      const daysSinceActivity = Math.floor(
        (new Date(today).getTime() - new Date(streak.lastActivityDate).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      // Only allow freeze for 1 day gap
      if (daysSinceActivity === 2 && streak.streakFreezeCount > 0) {
        // Auto-use freeze for yesterday
        const yesterdayStr = getYesterdayDate();
        await ctx.db.patch(streak._id, {
          streakFreezeCount: streak.streakFreezeCount - 1,
          streakFreezeUsedDates: [...streak.streakFreezeUsedDates, yesterdayStr],
        });
        newStreak = streak.currentStreak + 1;
      } else {
        // Streak broken - reset
        newStreak = 1;
      }
    }

    const newLongest = Math.max(streak.longestStreak, newStreak);
    const coinsEarned = getStreakCoins(newStreak);

    await ctx.db.patch(streak._id, {
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastActivityDate: today,
      totalDaysActive: streak.totalDaysActive + 1,
    });

    return {
      streak: newStreak,
      isNewDay: true,
      coinsEarned,
      milestoneReached,
    };
  },
});

// Use a streak freeze to protect streak
export const useStreakFreeze = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const today = getTodayDate();

    const streak = await ctx.db
      .query("streaks")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!streak) {
      return { success: false, reason: "No streak found" };
    }

    if (streak.streakFreezeCount <= 0) {
      return { success: false, reason: "No freezes available" };
    }

    if (streak.streakFreezeUsedDates.includes(today)) {
      return { success: false, reason: "Freeze already used today" };
    }

    await ctx.db.patch(streak._id, {
      streakFreezeCount: streak.streakFreezeCount - 1,
      streakFreezeUsedDates: [...streak.streakFreezeUsedDates, today],
      lastActivityDate: today, // Count as activity
    });

    return {
      success: true,
      remaining: streak.streakFreezeCount - 1,
    };
  },
});

// Purchase a streak freeze with coins
export const purchaseStreakFreeze = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const FREEZE_COST = 75;

    // Get user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      return { success: false, reason: "User not found" };
    }

    // Get game state for coins
    const gameState = await ctx.db
      .query("gameState")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    const currentBalance = gameState?.coins ?? 0;

    if (currentBalance < FREEZE_COST) {
      return { success: false, reason: "Insufficient coins" };
    }

    // Deduct coins
    if (gameState) {
      await ctx.db.patch(gameState._id, {
        coins: currentBalance - FREEZE_COST,
        updatedAt: Date.now(),
      });
    }

    // Record transaction
    await ctx.db.insert("transactions", {
      clerkId: args.clerkId,
      type: "spend",
      amount: -FREEZE_COST,
      source: "streak_freeze_purchase",
      balanceBefore: currentBalance,
      balanceAfter: currentBalance - FREEZE_COST,
      timestamp: Date.now(),
    });

    // Get or create streak
    let streak = await ctx.db
      .query("streaks")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!streak) {
      await ctx.db.insert("streaks", {
        clerkId: args.clerkId,
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: "",
        streakFreezeCount: 1,
        streakFreezeUsedDates: [],
        totalDaysActive: 0,
      });
    } else {
      await ctx.db.patch(streak._id, {
        streakFreezeCount: streak.streakFreezeCount + 1,
      });
    }

    return {
      success: true,
      cost: FREEZE_COST,
      newBalance: currentBalance - FREEZE_COST,
    };
  },
});

// Grant free monthly freezes to premium users
export const grantPremiumFreezes = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const PREMIUM_FREE_FREEZES = 3;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user || !user.isPremium) {
      return { success: false, reason: "User is not premium" };
    }

    let streak = await ctx.db
      .query("streaks")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!streak) {
      await ctx.db.insert("streaks", {
        clerkId: args.clerkId,
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: "",
        streakFreezeCount: PREMIUM_FREE_FREEZES,
        streakFreezeUsedDates: [],
        totalDaysActive: 0,
      });
    } else {
      await ctx.db.patch(streak._id, {
        streakFreezeCount: streak.streakFreezeCount + PREMIUM_FREE_FREEZES,
      });
    }

    return {
      success: true,
      freezesGranted: PREMIUM_FREE_FREEZES,
    };
  },
});

// Get streak leaderboard
export const getStreakLeaderboard = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;

    const streaks = await ctx.db.query("streaks").collect();

    // Sort by current streak and take top N
    const sorted = streaks
      .sort((a, b) => b.currentStreak - a.currentStreak)
      .slice(0, limit);

    // Get usernames
    const leaderboard = await Promise.all(
      sorted.map(async (streak) => {
        const user = await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", streak.clerkId))
          .first();

        return {
          clerkId: streak.clerkId,
          username: user?.username ?? "Anonymous",
          imageUrl: user?.imageUrl,
          currentStreak: streak.currentStreak,
          longestStreak: streak.longestStreak,
        };
      })
    );

    return leaderboard;
  },
});
