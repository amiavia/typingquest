# PRP-020: Weekly Progress Reports System

**Status**: DRAFT
**Author**: Claude + Anton
**Date**: 2025-12-25
**Priority**: MEDIUM
**Estimated Effort**: 3 phases, ~20 tasks

---

## Executive Summary

This PRP introduces an automated weekly progress report system for TypeBit8. Users will receive a comprehensive summary of their typing progress every week, including practice time, WPM improvements, lessons completed, and streak maintenance. Reports will be viewable in-app with optional email delivery, providing personalized tips and celebrating achievements to maintain engagement and motivation.

---

## Problem Statement

### Current State

1. **No progress tracking**: Users can't easily see how they've improved over time
2. **Missing motivation triggers**: No regular touchpoints to re-engage users
3. **Unclear goals**: Users don't know what to focus on next
4. **Achievement blindness**: Users may not notice their improvements without explicit feedback
5. **No retention mechanism**: No automated system to bring users back weekly

### Impact

| Issue | User Impact |
|-------|-------------|
| No progress visibility | Users can't celebrate wins or identify areas for improvement |
| Missing weekly touchpoints | Higher churn, lower retention rates |
| Lack of personalized guidance | Users feel lost, don't know what to practice |
| Unnoticed achievements | Reduced sense of accomplishment and motivation |
| No email reminders | Users forget to practice, engagement drops |

### Success Criteria

- [ ] Weekly reports auto-generated every 7 days for active users
- [ ] In-app report card view with clean 8-bit styled design
- [ ] Email delivery system with opt-in/opt-out preferences
- [ ] Track key metrics: practice time, WPM change, lessons completed, streak
- [ ] Show week-over-week comparisons with visual indicators
- [ ] Generate 2-3 personalized tips based on user performance
- [ ] Display achievements earned during the week
- [ ] Set 2-3 goals for the upcoming week
- [ ] 30%+ email open rate (industry standard for engagement emails)

---

## Metrics Tracked

### Core Performance Metrics

| Metric | Description | Calculation |
|--------|-------------|-------------|
| **Total Practice Time** | Minutes spent typing this week | Sum of all lesson durations |
| **Average WPM** | Current typing speed | Average WPM across all lessons this week |
| **WPM Change** | Speed improvement | Current week avg WPM - previous week avg WPM |
| **Lessons Completed** | Number of lessons finished | Count of completed lessons |
| **Current Streak** | Consecutive days practiced | Days in a row with at least 1 lesson |
| **Accuracy Rate** | Average typing accuracy | Average accuracy % across all lessons |
| **Best Score** | Highest lesson score achieved | Max score from any lesson this week |

### Comparison Data

All metrics show week-over-week change with visual indicators:
- Green up arrow: Improvement
- Red down arrow: Decline
- Yellow equals: No change

---

## Phase 1: Data Collection & Backend

### 1.1 Convex Schema Updates

**Modify: `convex/schema.ts`**

Add weekly reports table:

```typescript
weeklyReports: defineTable({
  userId: v.id("users"),
  weekStart: v.number(), // Unix timestamp of Monday 00:00
  weekEnd: v.number(),   // Unix timestamp of Sunday 23:59

  // Core metrics
  totalPracticeMinutes: v.number(),
  averageWPM: v.number(),
  wpmChange: v.number(), // vs previous week
  lessonsCompleted: v.number(),
  streakDays: v.number(),
  averageAccuracy: v.number(),
  bestScore: v.number(),

  // Achievement tracking
  achievementsEarned: v.array(v.string()),

  // Personalized content
  tips: v.array(v.string()),
  goalsForNextWeek: v.array(v.string()),

  // Metadata
  generatedAt: v.number(),
  emailSent: v.optional(v.boolean()),
  emailSentAt: v.optional(v.number()),
  viewedAt: v.optional(v.number()),
})
.index("by_user", ["userId"])
.index("by_week", ["weekStart", "weekEnd"])
.index("by_user_and_week", ["userId", "weekStart"]),

userPreferences: defineTable({
  userId: v.id("users"),
  emailReportsEnabled: v.boolean(), // Default: true
  reportDeliveryDay: v.string(), // "monday", "sunday", etc.
  reportDeliveryTime: v.string(), // "09:00" in user's timezone
  timezone: v.optional(v.string()), // "America/New_York"
})
.index("by_user", ["userId"]),
```

### 1.2 Report Generation Logic

**New file: `convex/weeklyReports.ts`**

```typescript
import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Get week boundaries (Monday to Sunday)
function getWeekBoundaries(date: Date): { start: number; end: number } {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday

  const weekStart = new Date(date);
  weekStart.setDate(diff);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return {
    start: weekStart.getTime(),
    end: weekEnd.getTime(),
  };
}

// Generate personalized tips based on performance
function generateTips(metrics: {
  wpmChange: number;
  averageAccuracy: number;
  streakDays: number;
  lessonsCompleted: number;
}): string[] {
  const tips: string[] = [];

  if (metrics.averageAccuracy < 90) {
    tips.push("Focus on accuracy over speed. Slow down and aim for 95%+ accuracy.");
  } else if (metrics.averageAccuracy >= 98) {
    tips.push("Your accuracy is excellent! Try increasing your speed.");
  }

  if (metrics.wpmChange < 0) {
    tips.push("Don't worry about the dip. Consistency matters more than speed.");
  } else if (metrics.wpmChange > 5) {
    tips.push("Amazing progress! Keep up the momentum.");
  }

  if (metrics.streakDays === 0) {
    tips.push("Build a streak! Practice daily for better muscle memory.");
  } else if (metrics.streakDays >= 7) {
    tips.push("Your streak is on fire! Daily practice is building strong habits.");
  }

  if (metrics.lessonsCompleted < 3) {
    tips.push("Try to complete at least 5 lessons per week for steady improvement.");
  }

  // Ensure we always return at least 2 tips
  if (tips.length < 2) {
    tips.push("Practice regularly to see the best results.");
    tips.push("Challenge yourself with harder lessons when ready.");
  }

  return tips.slice(0, 3); // Max 3 tips
}

// Generate goals for next week
function generateGoals(metrics: {
  averageWPM: number;
  averageAccuracy: number;
  lessonsCompleted: number;
}): string[] {
  const goals: string[] = [];

  // WPM goal
  const targetWPM = Math.ceil(metrics.averageWPM + 5);
  goals.push(`Reach ${targetWPM} WPM average`);

  // Accuracy goal
  if (metrics.averageAccuracy < 95) {
    goals.push("Achieve 95%+ accuracy on all lessons");
  }

  // Volume goal
  const targetLessons = Math.max(5, metrics.lessonsCompleted + 2);
  goals.push(`Complete ${targetLessons} lessons this week`);

  return goals;
}

export const generateWeeklyReport = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const now = new Date();
    const { start: weekStart, end: weekEnd } = getWeekBoundaries(now);

    // Check if report already exists for this week
    const existingReport = await ctx.db
      .query("weeklyReports")
      .withIndex("by_user_and_week", q =>
        q.eq("userId", args.userId).eq("weekStart", weekStart)
      )
      .unique();

    if (existingReport) {
      return existingReport._id; // Already generated
    }

    // Get this week's practice data
    const thisWeekPractices = await ctx.db
      .query("practices")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .filter(q =>
        q.and(
          q.gte(q.field("timestamp"), weekStart),
          q.lte(q.field("timestamp"), weekEnd)
        )
      )
      .collect();

    if (thisWeekPractices.length === 0) {
      return null; // No activity this week, skip report
    }

    // Calculate this week's metrics
    const totalPracticeMinutes = thisWeekPractices.reduce(
      (sum, p) => sum + (p.duration || 0) / 60,
      0
    );

    const averageWPM = thisWeekPractices.reduce((sum, p) => sum + p.wpm, 0) / thisWeekPractices.length;
    const averageAccuracy = thisWeekPractices.reduce((sum, p) => sum + p.accuracy, 0) / thisWeekPractices.length;
    const bestScore = Math.max(...thisWeekPractices.map(p => p.score || 0));
    const lessonsCompleted = thisWeekPractices.length;

    // Get previous week's data for comparison
    const prevWeekStart = weekStart - 7 * 24 * 60 * 60 * 1000;
    const prevWeekEnd = weekEnd - 7 * 24 * 60 * 60 * 1000;

    const prevWeekPractices = await ctx.db
      .query("practices")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .filter(q =>
        q.and(
          q.gte(q.field("timestamp"), prevWeekStart),
          q.lte(q.field("timestamp"), prevWeekEnd)
        )
      )
      .collect();

    const prevAverageWPM = prevWeekPractices.length > 0
      ? prevWeekPractices.reduce((sum, p) => sum + p.wpm, 0) / prevWeekPractices.length
      : averageWPM;

    const wpmChange = averageWPM - prevAverageWPM;

    // Get current streak
    const user = await ctx.db.get(args.userId);
    const streakDays = user?.currentStreak || 0;

    // Get achievements earned this week
    const achievementsEarned = await ctx.db
      .query("achievements")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .filter(q =>
        q.and(
          q.gte(q.field("earnedAt"), weekStart),
          q.lte(q.field("earnedAt"), weekEnd)
        )
      )
      .collect();

    const achievementIds = achievementsEarned.map(a => a.achievementId);

    // Generate personalized content
    const tips = generateTips({
      wpmChange,
      averageAccuracy,
      streakDays,
      lessonsCompleted,
    });

    const goalsForNextWeek = generateGoals({
      averageWPM,
      averageAccuracy,
      lessonsCompleted,
    });

    // Create report
    const reportId = await ctx.db.insert("weeklyReports", {
      userId: args.userId,
      weekStart,
      weekEnd,
      totalPracticeMinutes: Math.round(totalPracticeMinutes),
      averageWPM: Math.round(averageWPM),
      wpmChange: Math.round(wpmChange),
      lessonsCompleted,
      streakDays,
      averageAccuracy: Math.round(averageAccuracy),
      bestScore,
      achievementsEarned: achievementIds,
      tips,
      goalsForNextWeek,
      generatedAt: Date.now(),
      emailSent: false,
    });

    return reportId;
  },
});

export const getLatestReport = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return null;

    const report = await ctx.db
      .query("weeklyReports")
      .withIndex("by_user", q => q.eq("userId", user._id))
      .order("desc")
      .first();

    return report;
  },
});

export const getReportHistory = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    const reports = await ctx.db
      .query("weeklyReports")
      .withIndex("by_user", q => q.eq("userId", user._id))
      .order("desc")
      .take(args.limit || 10);

    return reports;
  },
});

export const markReportViewed = mutation({
  args: { reportId: v.id("weeklyReports") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.reportId, {
      viewedAt: Date.now(),
    });
  },
});
```

### 1.3 Scheduled Report Generation

**New file: `convex/crons.ts`**

```typescript
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Generate weekly reports every Monday at 6 AM UTC
crons.weekly(
  "generate weekly reports",
  {
    dayOfWeek: "monday",
    hourUTC: 6,
    minuteUTC: 0,
  },
  internal.weeklyReports.generateAllReports
);

export default crons;
```

**Add to `convex/weeklyReports.ts`:**

```typescript
export const generateAllReports = internalMutation({
  handler: async (ctx) => {
    // Get all active users (practiced in last 7 days)
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    const activeUsers = await ctx.db
      .query("users")
      .filter(q => q.gte(q.field("lastPracticeAt"), sevenDaysAgo))
      .collect();

    for (const user of activeUsers) {
      await ctx.scheduler.runAfter(0, internal.weeklyReports.generateWeeklyReport, {
        userId: user._id,
      });
    }

    return { generatedCount: activeUsers.length };
  },
});
```

---

## Phase 2: In-App Report Card UI

### 2.1 Weekly Report Card Component

**New file: `src/components/WeeklyReportCard.tsx`**

```typescript
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface WeeklyReportCardProps {
  reportId?: Id<"weeklyReports">;
}

function TrendIndicator({ value }: { value: number }) {
  if (value > 0) {
    return (
      <div className="flex items-center gap-1 text-[#0ead69]">
        <TrendingUp size={16} />
        <span style={{ fontFamily: "'Press Start 2P'", fontSize: '8px' }}>
          +{value}
        </span>
      </div>
    );
  } else if (value < 0) {
    return (
      <div className="flex items-center gap-1 text-[#ff6b9d]">
        <TrendingDown size={16} />
        <span style={{ fontFamily: "'Press Start 2P'", fontSize: '8px' }}>
          {value}
        </span>
      </div>
    );
  } else {
    return (
      <div className="flex items-center gap-1 text-[#ffd93d]">
        <Minus size={16} />
        <span style={{ fontFamily: "'Press Start 2P'", fontSize: '8px' }}>0</span>
      </div>
    );
  }
}

export function WeeklyReportCard({ reportId }: WeeklyReportCardProps) {
  const report = useQuery(api.weeklyReports.getLatestReport);
  const markViewed = useMutation(api.weeklyReports.markReportViewed);

  if (!report) {
    return (
      <div className="pixel-box p-6 text-center">
        <p style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: '#eef5db' }}>
          No report available yet. Complete some lessons this week!
        </p>
      </div>
    );
  }

  // Mark as viewed on first load
  if (!report.viewedAt) {
    markViewed({ reportId: report._id });
  }

  const weekStart = new Date(report.weekStart);
  const weekEnd = new Date(report.weekEnd);
  const dateRange = `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;

  return (
    <div className="pixel-box p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 style={{ fontFamily: "'Press Start 2P'", fontSize: '16px', color: '#ffd93d', marginBottom: '8px' }}>
          WEEKLY REPORT
        </h2>
        <p style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#3bceac' }}>
          {dateRange}
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="PRACTICE TIME"
          value={`${report.totalPracticeMinutes} MIN`}
          color="#ffd93d"
        />
        <MetricCard
          label="AVG WPM"
          value={report.averageWPM}
          color="#3bceac"
          trend={report.wpmChange}
        />
        <MetricCard
          label="LESSONS"
          value={report.lessonsCompleted}
          color="#0ead69"
        />
        <MetricCard
          label="STREAK"
          value={`${report.streakDays} DAYS`}
          color="#ff6b9d"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <MetricCard
          label="ACCURACY"
          value={`${report.averageAccuracy}%`}
          color="#eef5db"
        />
        <MetricCard
          label="BEST SCORE"
          value={report.bestScore}
          color="#ffd93d"
        />
      </div>

      {/* Achievements */}
      {report.achievementsEarned.length > 0 && (
        <div className="mb-6 pixel-box p-4 bg-[#1a1a2e]">
          <h3 style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: '#ffd93d', marginBottom: '12px' }}>
            ACHIEVEMENTS EARNED
          </h3>
          <div className="flex gap-3 flex-wrap">
            {report.achievementsEarned.map(achId => (
              <div key={achId} className="pixel-badge">
                {achId}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Personalized Tips */}
      <div className="mb-6 pixel-box p-4 bg-[#1a1a2e]">
        <h3 style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: '#3bceac', marginBottom: '12px' }}>
          TIPS FOR YOU
        </h3>
        <ul className="space-y-2">
          {report.tips.map((tip, i) => (
            <li key={i} style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#eef5db' }}>
              • {tip}
            </li>
          ))}
        </ul>
      </div>

      {/* Goals for Next Week */}
      <div className="pixel-box p-4 bg-[#1a1a2e]">
        <h3 style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: '#0ead69', marginBottom: '12px' }}>
          GOALS FOR NEXT WEEK
        </h3>
        <ul className="space-y-2">
          {report.goalsForNextWeek.map((goal, i) => (
            <li key={i} style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#eef5db' }}>
              □ {goal}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  color,
  trend,
}: {
  label: string;
  value: string | number;
  color: string;
  trend?: number;
}) {
  return (
    <div className="pixel-box p-4 bg-[#1a1a2e]">
      <p style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: '#4a4a6e', marginBottom: '8px' }}>
        {label}
      </p>
      <div className="flex items-center justify-between">
        <p style={{ fontFamily: "'Press Start 2P'", fontSize: '14px', color }}>
          {value}
        </p>
        {trend !== undefined && <TrendIndicator value={trend} />}
      </div>
    </div>
  );
}
```

### 2.2 Report History View

**New file: `src/components/ReportHistory.tsx`**

```typescript
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { WeeklyReportCard } from './WeeklyReportCard';

export function ReportHistory() {
  const reports = useQuery(api.weeklyReports.getReportHistory, { limit: 8 });

  if (!reports || reports.length === 0) {
    return (
      <div className="pixel-box p-6 text-center">
        <p style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: '#eef5db' }}>
          No reports yet. Keep practicing!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 style={{ fontFamily: "'Press Start 2P'", fontSize: '14px', color: '#ffd93d' }}>
        REPORT HISTORY
      </h2>

      {/* Mini cards for historical reports */}
      <div className="grid gap-4">
        {reports.map(report => (
          <div key={report._id} className="pixel-box p-4 bg-[#1a1a2e] hover:bg-[#252540] transition cursor-pointer">
            <div className="flex justify-between items-center mb-2">
              <p style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#3bceac' }}>
                {new Date(report.weekStart).toLocaleDateString()} - {new Date(report.weekEnd).toLocaleDateString()}
              </p>
              {!report.viewedAt && (
                <span className="pixel-badge bg-[#ff6b9d]" style={{ fontSize: '6px' }}>
                  NEW
                </span>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div>
                <p style={{ fontSize: '6px', color: '#4a4a6e' }}>WPM</p>
                <p style={{ fontSize: '10px', color: '#ffd93d' }}>{report.averageWPM}</p>
              </div>
              <div>
                <p style={{ fontSize: '6px', color: '#4a4a6e' }}>LESSONS</p>
                <p style={{ fontSize: '10px', color: '#3bceac' }}>{report.lessonsCompleted}</p>
              </div>
              <div>
                <p style={{ fontSize: '6px', color: '#4a4a6e' }}>STREAK</p>
                <p style={{ fontSize: '10px', color: '#0ead69' }}>{report.streakDays}d</p>
              </div>
              <div>
                <p style={{ fontSize: '6px', color: '#4a4a6e' }}>TIME</p>
                <p style={{ fontSize: '10px', color: '#ff6b9d' }}>{report.totalPracticeMinutes}m</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 2.3 Integration into Dashboard

**Modify: `src/App.tsx` or dashboard page**

Add a "Weekly Report" tab/section:

```typescript
import { WeeklyReportCard } from './components/WeeklyReportCard';
import { ReportHistory } from './components/ReportHistory';

// In navigation or dashboard:
<Tab name="Weekly Report">
  <WeeklyReportCard />
</Tab>

<Tab name="Report History">
  <ReportHistory />
</Tab>
```

---

## Phase 3: Email Delivery System

### 3.1 Email Preferences

**New file: `convex/userPreferences.ts`**

```typescript
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getEmailPreferences = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return null;

    const prefs = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", q => q.eq("userId", user._id))
      .unique();

    // Default preferences
    return prefs || {
      emailReportsEnabled: true,
      reportDeliveryDay: "monday",
      reportDeliveryTime: "09:00",
      timezone: "America/New_York",
    };
  },
});

export const updateEmailPreferences = mutation({
  args: {
    emailReportsEnabled: v.boolean(),
    reportDeliveryDay: v.optional(v.string()),
    reportDeliveryTime: v.optional(v.string()),
    timezone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", q => q.eq("userId", user._id))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, args);
    } else {
      await ctx.db.insert("userPreferences", {
        userId: user._id,
        ...args,
      });
    }
  },
});
```

### 3.2 Email Template (Resend)

**New file: `convex/emails/weeklyReport.tsx`** (using React Email)

```typescript
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface WeeklyReportEmailProps {
  username: string;
  weekRange: string;
  averageWPM: number;
  wpmChange: number;
  lessonsCompleted: number;
  streakDays: number;
  totalPracticeMinutes: number;
  tips: string[];
  goals: string[];
  achievementsEarned: string[];
  reportUrl: string;
}

export function WeeklyReportEmail({
  username,
  weekRange,
  averageWPM,
  wpmChange,
  lessonsCompleted,
  streakDays,
  totalPracticeMinutes,
  tips,
  goals,
  achievementsEarned,
  reportUrl,
}: WeeklyReportEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your TypeBit8 weekly progress report is ready!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>TypeBit8 Weekly Report</Heading>
          <Text style={text}>Hi {username}!</Text>
          <Text style={text}>
            Here's your typing progress for {weekRange}:
          </Text>

          {/* Metrics */}
          <Section style={metricsContainer}>
            <div style={metric}>
              <Text style={metricLabel}>Average WPM</Text>
              <Text style={metricValue}>{averageWPM}</Text>
              {wpmChange !== 0 && (
                <Text style={wpmChange > 0 ? metricPositive : metricNegative}>
                  {wpmChange > 0 ? '+' : ''}{wpmChange}
                </Text>
              )}
            </div>
            <div style={metric}>
              <Text style={metricLabel}>Lessons Completed</Text>
              <Text style={metricValue}>{lessonsCompleted}</Text>
            </div>
            <div style={metric}>
              <Text style={metricLabel}>Current Streak</Text>
              <Text style={metricValue}>{streakDays} days</Text>
            </div>
            <div style={metric}>
              <Text style={metricLabel}>Practice Time</Text>
              <Text style={metricValue}>{totalPracticeMinutes} min</Text>
            </div>
          </Section>

          {/* Achievements */}
          {achievementsEarned.length > 0 && (
            <>
              <Heading style={h2}>Achievements Earned</Heading>
              <ul>
                {achievementsEarned.map((ach, i) => (
                  <li key={i} style={listItem}>{ach}</li>
                ))}
              </ul>
            </>
          )}

          {/* Tips */}
          <Heading style={h2}>Tips for You</Heading>
          <ul>
            {tips.map((tip, i) => (
              <li key={i} style={listItem}>{tip}</li>
            ))}
          </ul>

          {/* Goals */}
          <Heading style={h2}>Goals for Next Week</Heading>
          <ul>
            {goals.map((goal, i) => (
              <li key={i} style={listItem}>{goal}</li>
            ))}
          </ul>

          {/* CTA */}
          <Section style={buttonContainer}>
            <a href={reportUrl} style={button}>
              View Full Report
            </a>
          </Section>

          <Text style={footer}>
            Keep typing! Every practice session makes you faster.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = { backgroundColor: '#1a1a2e', fontFamily: 'Arial, sans-serif' };
const container = { margin: '0 auto', padding: '20px', maxWidth: '600px', backgroundColor: '#eef5db' };
const h1 = { color: '#ffd93d', fontSize: '24px', fontWeight: 'bold' };
const h2 = { color: '#3bceac', fontSize: '18px', marginTop: '20px' };
const text = { color: '#1a1a2e', fontSize: '14px', lineHeight: '24px' };
const metricsContainer = { display: 'flex', gap: '16px', marginTop: '20px' };
const metric = { flex: 1, textAlign: 'center' };
const metricLabel = { fontSize: '12px', color: '#666' };
const metricValue = { fontSize: '24px', fontWeight: 'bold', color: '#1a1a2e' };
const metricPositive = { fontSize: '12px', color: '#0ead69' };
const metricNegative = { fontSize: '12px', color: '#ff6b9d' };
const listItem = { marginBottom: '8px', color: '#1a1a2e' };
const buttonContainer = { textAlign: 'center', marginTop: '32px' };
const button = {
  backgroundColor: '#ffd93d',
  color: '#1a1a2e',
  padding: '12px 24px',
  textDecoration: 'none',
  borderRadius: '4px',
  fontWeight: 'bold',
};
const footer = { fontSize: '12px', color: '#666', marginTop: '32px', textAlign: 'center' };
```

### 3.3 Send Email Action

**Modify: `convex/weeklyReports.ts`**

Add email sending:

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendWeeklyReportEmail = internalMutation({
  args: { reportId: v.id("weeklyReports") },
  handler: async (ctx, args) => {
    const report = await ctx.db.get(args.reportId);
    if (!report || report.emailSent) return;

    const user = await ctx.db.get(report.userId);
    if (!user || !user.email) return;

    // Check email preferences
    const prefs = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", q => q.eq("userId", user._id))
      .unique();

    if (prefs && !prefs.emailReportsEnabled) return;

    const weekStart = new Date(report.weekStart);
    const weekEnd = new Date(report.weekEnd);
    const weekRange = `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;

    await resend.emails.send({
      from: 'TypeBit8 <reports@typebit8.com>',
      to: user.email,
      subject: `Your Weekly Typing Report - ${weekRange}`,
      react: WeeklyReportEmail({
        username: user.username || 'Typer',
        weekRange,
        averageWPM: report.averageWPM,
        wpmChange: report.wpmChange,
        lessonsCompleted: report.lessonsCompleted,
        streakDays: report.streakDays,
        totalPracticeMinutes: report.totalPracticeMinutes,
        tips: report.tips,
        goals: report.goalsForNextWeek,
        achievementsEarned: report.achievementsEarned,
        reportUrl: `https://typebit8.com/reports/${report._id}`,
      }),
    });

    await ctx.db.patch(args.reportId, {
      emailSent: true,
      emailSentAt: Date.now(),
    });
  },
});
```

### 3.4 Update Cron to Send Emails

**Modify: `convex/weeklyReports.ts`**

```typescript
export const generateAllReports = internalMutation({
  handler: async (ctx) => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    const activeUsers = await ctx.db
      .query("users")
      .filter(q => q.gte(q.field("lastPracticeAt"), sevenDaysAgo))
      .collect();

    for (const user of activeUsers) {
      // Generate report
      const reportId = await ctx.scheduler.runAfter(0, internal.weeklyReports.generateWeeklyReport, {
        userId: user._id,
      });

      // Send email 5 minutes later (to avoid rate limits)
      if (reportId) {
        await ctx.scheduler.runAfter(5 * 60 * 1000, internal.weeklyReports.sendWeeklyReportEmail, {
          reportId,
        });
      }
    }

    return { generatedCount: activeUsers.length };
  },
});
```

---

## File Structure (New/Modified)

```
typingquest/
├── convex/
│   ├── schema.ts                       (modify) - Add weeklyReports, userPreferences tables
│   ├── weeklyReports.ts                (new) - Report generation logic
│   ├── userPreferences.ts              (new) - Email preference management
│   ├── crons.ts                        (new) - Scheduled report generation
│   └── emails/
│       └── weeklyReport.tsx            (new) - Email template
├── src/
│   └── components/
│       ├── WeeklyReportCard.tsx        (new) - Main report display
│       ├── ReportHistory.tsx           (new) - Historical reports view
│       └── EmailPreferences.tsx        (new) - Settings for email delivery
└── .env                                (modify) - Add RESEND_API_KEY
```

---

## Implementation Order

1. **Schema Setup** - Update Convex schema with weeklyReports and userPreferences tables
2. **Data Collection** - Implement report generation logic in weeklyReports.ts
3. **Testing Generation** - Manually trigger report generation for test users
4. **UI Components** - Build WeeklyReportCard and ReportHistory components
5. **Dashboard Integration** - Add report views to main dashboard
6. **Email Template** - Design and test email template with React Email
7. **Email Sending** - Implement Resend integration for email delivery
8. **Preferences UI** - Create email preference settings page
9. **Cron Setup** - Configure scheduled weekly report generation
10. **Testing & Refinement** - Test full flow, refine tips/goals logic
11. **Analytics** - Track email open rates, report view rates

---

## Notes

- **Week Definition**: Monday 00:00 to Sunday 23:59 (configurable per user timezone in future)
- **Report Generation**: Runs automatically every Monday at 6 AM UTC via Convex cron
- **Email Delivery**: Uses Resend API with React Email templates
- **Opt-Out**: Users can disable email reports in settings (in-app reports still generated)
- **Privacy**: Reports are private and only accessible to the user
- **Retention**: Keep last 52 weeks of reports (1 year) for historical comparison
- **Performance**: Reports generated asynchronously to avoid blocking
- **Personalization**: Tips and goals dynamically generated based on actual performance data
- **Gamification**: Celebrating achievements earned during the week boosts motivation
- **Re-engagement**: Weekly email touchpoint helps reduce churn and maintain streaks
- **Future Enhancement**: Add "Share Report" feature for social media bragging rights
