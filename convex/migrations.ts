import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Import all localStorage data in one transaction
export const importLocalStorageData = mutation({
  args: {
    userId: v.id("users"),
    gameState: v.object({
      xp: v.number(),
      level: v.number(),
      totalXp: v.number(),
      combo: v.number(),
      maxCombo: v.number(),
      perfectStreak: v.number(),
      coins: v.number(),
      achievements: v.array(v.string()),
      highScores: v.any(),
    }),
    lessonProgress: v.array(
      v.object({
        lessonId: v.number(),
        completed: v.boolean(),
        bestWPM: v.number(),
        bestAccuracy: v.number(),
        attempts: v.number(),
        quizPassed: v.boolean(),
      })
    ),
    settings: v.object({
      keyboardLayout: v.string(),
      language: v.string(),
      wordLanguage: v.optional(v.string()),
      mixEnglishWords: v.boolean(),
      englishMixRatio: v.number(),
      activeThemes: v.array(v.string()),
      themeMixRatio: v.number(),
    }),
  },
  handler: async (ctx, { userId, gameState, lessonProgress, settings }) => {
    const now = Date.now();

    // Import game state - merge with existing if present
    const existingGameState = await ctx.db
      .query("gameState")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!existingGameState) {
      await ctx.db.insert("gameState", {
        userId,
        ...gameState,
        updatedAt: now,
      });
    } else {
      // Merge - take the better/higher values
      await ctx.db.patch(existingGameState._id, {
        xp: Math.max(gameState.xp, existingGameState.xp),
        level: Math.max(gameState.level, existingGameState.level),
        totalXp: Math.max(gameState.totalXp, existingGameState.totalXp),
        maxCombo: Math.max(gameState.maxCombo, existingGameState.maxCombo),
        perfectStreak: Math.max(
          gameState.perfectStreak,
          existingGameState.perfectStreak
        ),
        coins: Math.max(gameState.coins, existingGameState.coins),
        achievements: [
          ...new Set([
            ...existingGameState.achievements,
            ...gameState.achievements,
          ]),
        ],
        highScores: mergeHighScores(
          existingGameState.highScores ?? {},
          gameState.highScores ?? {}
        ),
        updatedAt: now,
      });
    }

    // Import lesson progress
    for (const progress of lessonProgress) {
      const existing = await ctx.db
        .query("lessonProgress")
        .withIndex("by_user_and_lesson", (q) =>
          q.eq("userId", userId).eq("lessonId", progress.lessonId)
        )
        .unique();

      if (!existing) {
        await ctx.db.insert("lessonProgress", {
          userId,
          ...progress,
          updatedAt: now,
        });
      } else {
        // Merge - take better values
        await ctx.db.patch(existing._id, {
          completed: progress.completed || existing.completed,
          bestWPM: Math.max(progress.bestWPM, existing.bestWPM),
          bestAccuracy: Math.max(progress.bestAccuracy, existing.bestAccuracy),
          attempts: Math.max(progress.attempts, existing.attempts),
          quizPassed: progress.quizPassed || existing.quizPassed,
          updatedAt: now,
        });
      }
    }

    // Import settings (use local settings as they're more recent)
    const existingSettings = await ctx.db
      .query("settings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!existingSettings) {
      await ctx.db.insert("settings", {
        userId,
        ...settings,
        updatedAt: now,
      });
    } else {
      await ctx.db.patch(existingSettings._id, {
        ...settings,
        updatedAt: now,
      });
    }

    return {
      success: true,
      imported: {
        gameState: true,
        lessonProgress: lessonProgress.length,
        settings: true,
      },
    };
  },
});

// Helper function to merge high scores (take the higher score for each lesson)
function mergeHighScores(
  existing: Record<string, number>,
  incoming: Record<string, number>
): Record<string, number> {
  const merged = { ...existing };
  for (const [lessonId, score] of Object.entries(incoming)) {
    if (!merged[lessonId] || score > merged[lessonId]) {
      merged[lessonId] = score;
    }
  }
  return merged;
}

// Check if user has local data to migrate
export const checkMigrationStatus = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const gameState = await ctx.db
      .query("gameState")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    const progressCount = await ctx.db
      .query("lessonProgress")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return {
      hasExistingData: !!gameState && gameState.totalXp > 0,
      existingProgress: progressCount.length,
      existingLevel: gameState?.level ?? 1,
      existingCoins: gameState?.coins ?? 0,
    };
  },
});
