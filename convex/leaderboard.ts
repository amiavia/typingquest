import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getDisplayName } from "./lib/nicknames";

// Get top scores for a lesson
// PRP-029: Returns displayName (nickname) instead of email
export const getTopScores = query({
  args: {
    lessonId: v.number(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { lessonId, limit = 10 }) => {
    const scores = await ctx.db
      .query("leaderboard")
      .withIndex("by_lesson_score", (q) => q.eq("lessonId", lessonId))
      .order("desc")
      .take(limit);

    // Fetch user details for each score to get current nickname and avatar
    const enrichedScores = await Promise.all(
      scores.map(async (s, index) => {
        const user = await ctx.db.get(s.userId);
        // PRP-029: Use nickname, NEVER expose real name or email
        // PRP-047: Use funny nickname instead of "Anonymous"
        const userId = s.userId as string;
        return {
          rank: index + 1,
          displayName: getDisplayName(user?.nickname, user?.autoNickname, userId),
          avatarId: user?.avatarId,
          score: s.score,
          accuracy: s.accuracy,
          timestamp: s.timestamp,
        };
      })
    );

    return enrichedScores;
  },
});

// Get global top scores across all lessons
// PRP-029: Returns displayName (nickname) instead of email
export const getGlobalTopScores = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { limit = 10 }) => {
    // Get all leaderboard entries and sort by score
    const allScores = await ctx.db.query("leaderboard").collect();

    // Sort by score descending and take top N
    const sortedScores = allScores
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // Fetch user details for each score to get current nickname and avatar
    const enrichedScores = await Promise.all(
      sortedScores.map(async (s, index) => {
        const user = await ctx.db.get(s.userId);
        // PRP-029: Use nickname, NEVER expose real name or email
        // PRP-047: Use funny nickname instead of "Anonymous"
        const oderId = s.userId as string;
        return {
          rank: index + 1,
          displayName: getDisplayName(user?.nickname, user?.autoNickname, oderId),
          avatarId: user?.avatarId,
          score: s.score,
          accuracy: s.accuracy,
          lessonId: s.lessonId,
          timestamp: s.timestamp,
        };
      })
    );

    return enrichedScores;
  },
});

// Submit a score to the leaderboard
// PRP-029: Uses nickname for username field, NEVER stores email
export const submitScore = mutation({
  args: {
    userId: v.id("users"),
    lessonId: v.number(),
    score: v.number(),
    accuracy: v.number(),
  },
  handler: async (ctx, { userId, lessonId, score, accuracy }) => {
    // Get user info for denormalization
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    // PRP-029: Use nickname, NEVER expose real name or email in leaderboard
    // PRP-047: Use funny nickname instead of "Anonymous"
    const displayName = getDisplayName(user.nickname, user.autoNickname, userId as string);

    // Check if user already has a score for this lesson
    const existing = await ctx.db
      .query("leaderboard")
      .withIndex("by_user_and_lesson", (q) =>
        q.eq("userId", userId).eq("lessonId", lessonId)
      )
      .unique();

    if (existing) {
      // Only update if new score is better
      if (score > existing.score) {
        await ctx.db.patch(existing._id, {
          score,
          accuracy,
          timestamp: Date.now(),
          username: displayName, // Update in case nickname changed
        });
        return { updated: true, previousScore: existing.score };
      }
      return { updated: false, previousScore: existing.score };
    }

    // Insert new score
    await ctx.db.insert("leaderboard", {
      userId,
      lessonId,
      score,
      accuracy,
      timestamp: Date.now(),
      username: displayName,
    });

    return { updated: true, previousScore: null };
  },
});

// Get user's rank for a specific lesson
export const getUserRank = query({
  args: {
    userId: v.id("users"),
    lessonId: v.number(),
  },
  handler: async (ctx, { userId, lessonId }) => {
    // Get user's score for this lesson
    const userScore = await ctx.db
      .query("leaderboard")
      .withIndex("by_user_and_lesson", (q) =>
        q.eq("userId", userId).eq("lessonId", lessonId)
      )
      .unique();

    if (!userScore) return null;

    // Count how many scores are higher
    const allScores = await ctx.db
      .query("leaderboard")
      .withIndex("by_lesson_score", (q) => q.eq("lessonId", lessonId))
      .collect();

    const higherCount = allScores.filter((s) => s.score > userScore.score).length;

    return {
      rank: higherCount + 1,
      score: userScore.score,
      accuracy: userScore.accuracy,
      totalPlayers: allScores.length,
    };
  },
});

// Get user's best scores across all lessons
export const getUserBestScores = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const scores = await ctx.db
      .query("leaderboard")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return scores.map((s) => ({
      lessonId: s.lessonId,
      score: s.score,
      accuracy: s.accuracy,
      timestamp: s.timestamp,
    }));
  },
});

// Get leaderboard stats
export const getLeaderboardStats = query({
  args: {},
  handler: async (ctx) => {
    const allScores = await ctx.db.query("leaderboard").collect();

    // Get unique users
    const uniqueUsers = new Set(allScores.map((s) => s.userId)).size;

    // Get top score overall
    const topScore = allScores.reduce(
      (max, s) => (s.score > max.score ? s : max),
      { score: 0, username: "", lessonId: 0 }
    );

    // Get average score
    const avgScore =
      allScores.length > 0
        ? Math.round(allScores.reduce((sum, s) => sum + s.score, 0) / allScores.length)
        : 0;

    return {
      totalPlayers: uniqueUsers,
      totalScores: allScores.length,
      topScore: topScore.score > 0 ? topScore : null,
      averageScore: avgScore,
    };
  },
});
