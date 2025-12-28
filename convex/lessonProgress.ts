import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./auth";

// Get all lesson progress for a user
export const getAllProgress = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const progressList = await ctx.db
      .query("lessonProgress")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Convert to Record<number, LessonProgress> format
    return progressList.reduce(
      (acc, p) => {
        acc[p.lessonId] = {
          lessonId: p.lessonId,
          completed: p.completed,
          bestWPM: p.bestWPM,
          bestAccuracy: p.bestAccuracy,
          attempts: p.attempts,
          quizPassed: p.quizPassed,
        };
        return acc;
      },
      {} as Record<
        number,
        {
          lessonId: number;
          completed: boolean;
          bestWPM: number;
          bestAccuracy: number;
          attempts: number;
          quizPassed: boolean;
        }
      >
    );
  },
});

// Get progress for a specific lesson
export const getLessonProgress = query({
  args: {
    userId: v.id("users"),
    lessonId: v.number(),
  },
  handler: async (ctx, { userId, lessonId }) => {
    return await ctx.db
      .query("lessonProgress")
      .withIndex("by_user_and_lesson", (q) =>
        q.eq("userId", userId).eq("lessonId", lessonId)
      )
      .unique();
  },
});

// Update lesson progress (upsert)
export const updateLessonProgress = mutation({
  args: {
    userId: v.id("users"),
    lessonId: v.number(),
    completed: v.boolean(),
    bestWPM: v.number(),
    bestAccuracy: v.number(),
    attempts: v.number(),
    quizPassed: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { userId, lessonId, ...data } = args;

    const existing = await ctx.db
      .query("lessonProgress")
      .withIndex("by_user_and_lesson", (q) =>
        q.eq("userId", userId).eq("lessonId", lessonId)
      )
      .unique();

    if (existing) {
      // Only update if new values are better
      await ctx.db.patch(existing._id, {
        completed: data.completed || existing.completed,
        bestWPM: Math.max(data.bestWPM, existing.bestWPM),
        bestAccuracy: Math.max(data.bestAccuracy, existing.bestAccuracy),
        attempts: data.attempts,
        quizPassed: data.quizPassed || existing.quizPassed,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("lessonProgress", {
      userId,
      lessonId,
      ...data,
      updatedAt: Date.now(),
    });
  },
});

// Bulk import progress (for migration)
// Protected: Users can only import their own progress data
export const bulkImportProgress = mutation({
  args: {
    userId: v.id("users"),
    progressData: v.array(
      v.object({
        lessonId: v.number(),
        completed: v.boolean(),
        bestWPM: v.number(),
        bestAccuracy: v.number(),
        attempts: v.number(),
        quizPassed: v.boolean(),
      })
    ),
  },
  handler: async (ctx, { userId, progressData }) => {
    // Verify authenticated user matches the target userId
    const authenticatedUser = await getAuthenticatedUser(ctx);
    if (authenticatedUser._id !== userId) {
      throw new Error("Unauthorized: Cannot import progress for another user");
    }
    for (const progress of progressData) {
      const existing = await ctx.db
        .query("lessonProgress")
        .withIndex("by_user_and_lesson", (q) =>
          q.eq("userId", userId).eq("lessonId", progress.lessonId)
        )
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, {
          completed: progress.completed || existing.completed,
          bestWPM: Math.max(progress.bestWPM, existing.bestWPM),
          bestAccuracy: Math.max(progress.bestAccuracy, existing.bestAccuracy),
          attempts: Math.max(progress.attempts, existing.attempts),
          quizPassed: progress.quizPassed || existing.quizPassed,
          updatedAt: Date.now(),
        });
      } else {
        await ctx.db.insert("lessonProgress", {
          userId,
          ...progress,
          updatedAt: Date.now(),
        });
      }
    }

    return { imported: progressData.length };
  },
});

// Get count of completed lessons
export const getCompletedCount = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const progressList = await ctx.db
      .query("lessonProgress")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return progressList.filter((p) => p.quizPassed).length;
  },
});
