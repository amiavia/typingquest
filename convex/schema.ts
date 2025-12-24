import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table - links Clerk user to Convex
  users: defineTable({
    clerkId: v.string(),
    username: v.optional(v.string()),
    email: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
    lastLoginAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),

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
});
