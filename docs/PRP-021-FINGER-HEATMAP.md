# PRP-021: Finger-Specific Performance Heatmap

**Status**: DRAFT
**Author**: Claude + Anton
**Date**: 2025-12-25
**Priority**: HIGH
**Estimated Effort**: 3 phases, ~20 tasks

---

## Executive Summary

This PRP introduces a finger-specific performance heatmap system for TypeBit8. Users will see a visual keyboard displaying accuracy per key with color-coded feedback (green for good, red for needs practice), finger assignment visualization, and personalized practice recommendations. The system tracks historical data, provides per-hand statistics, includes a touch typing guide, and integrates with practice mode for targeted training on weak fingers.

---

## Problem Statement

### Current State

1. **No granular feedback**: Users only see overall accuracy, not per-key performance
2. **Hidden weak spots**: Users don't know which specific keys they struggle with
3. **No finger tracking**: No visibility into which fingers need improvement
4. **Generic practice**: All practice sessions treat every key equally
5. **Missing guidance**: No touch typing finger placement reference

### Impact

| Issue | User Impact |
|-------|-------------|
| No per-key data | Can't identify specific problem areas |
| Hidden patterns | Misses systematic weaknesses (e.g., pinky finger) |
| Unfocused practice | Wastes time on already-mastered keys |
| No visual feedback | Harder to understand progress and improvement areas |
| Missing guidance | Beginners don't know proper finger placement |

### Success Criteria

- [ ] Visual keyboard heatmap shows accuracy per key with color gradient
- [ ] Finger assignment clearly displayed on keyboard
- [ ] Per-finger and per-hand accuracy statistics calculated
- [ ] Practice recommendations generated based on weak spots
- [ ] Historical comparison shows improvement over time
- [ ] Touch typing guide integrated into UI
- [ ] Practice mode accepts filtered key sets for targeted training
- [ ] Data persists across sessions in Convex

---

## Phase 1: Data Collection & Backend

### 1.1 Convex Schema Update

**Modify: `convex/schema.ts`**

Add keystroke tracking table:

```typescript
keystrokes: defineTable({
  userId: v.id("users"),
  lessonId: v.number(),
  key: v.string(),              // The character typed
  isCorrect: v.boolean(),        // Whether it was typed correctly
  timestamp: v.number(),         // When it was typed
  expectedKey: v.string(),       // What should have been typed
  finger: v.optional(v.string()), // Which finger should type this (e.g., "left-pinky")
  hand: v.optional(v.string()),   // "left" or "right"
})
  .index("by_user", ["userId"])
  .index("by_user_and_lesson", ["userId", "lessonId"])
  .index("by_user_and_key", ["userId", "key"]),

keyStats: defineTable({
  userId: v.id("users"),
  key: v.string(),                    // The character
  totalAttempts: v.number(),          // Total times attempted
  correctAttempts: v.number(),        // Times typed correctly
  accuracy: v.number(),               // Percentage (0-100)
  lastUpdated: v.number(),            // Timestamp
  finger: v.string(),                 // Assigned finger
  hand: v.string(),                   // "left" or "right"
})
  .index("by_user", ["userId"])
  .index("by_user_and_key", ["userId", "key"])
  .index("by_accuracy", ["userId", "accuracy"]),
```

### 1.2 Finger Assignment Mapping

**New file: `src/data/fingerMapping.ts`**

```typescript
export type Finger =
  | 'left-pinky'
  | 'left-ring'
  | 'left-middle'
  | 'left-index'
  | 'left-thumb'
  | 'right-thumb'
  | 'right-index'
  | 'right-middle'
  | 'right-ring'
  | 'right-pinky';

export type Hand = 'left' | 'right';

export interface KeyMapping {
  key: string;
  finger: Finger;
  hand: Hand;
  row: number; // 0=numbers, 1=top, 2=home, 3=bottom
  position: number; // Position in row
}

// Standard QWERTY touch typing finger assignments
export const FINGER_MAPPING: Record<string, KeyMapping> = {
  // Number row
  '`': { key: '`', finger: 'left-pinky', hand: 'left', row: 0, position: 0 },
  '1': { key: '1', finger: 'left-pinky', hand: 'left', row: 0, position: 1 },
  '2': { key: '2', finger: 'left-ring', hand: 'left', row: 0, position: 2 },
  '3': { key: '3', finger: 'left-middle', hand: 'left', row: 0, position: 3 },
  '4': { key: '4', finger: 'left-index', hand: 'left', row: 0, position: 4 },
  '5': { key: '5', finger: 'left-index', hand: 'left', row: 0, position: 5 },
  '6': { key: '6', finger: 'right-index', hand: 'right', row: 0, position: 6 },
  '7': { key: '7', finger: 'right-index', hand: 'right', row: 0, position: 7 },
  '8': { key: '8', finger: 'right-middle', hand: 'right', row: 0, position: 8 },
  '9': { key: '9', finger: 'right-ring', hand: 'right', row: 0, position: 9 },
  '0': { key: '0', finger: 'right-pinky', hand: 'right', row: 0, position: 10 },
  '-': { key: '-', finger: 'right-pinky', hand: 'right', row: 0, position: 11 },
  '=': { key: '=', finger: 'right-pinky', hand: 'right', row: 0, position: 12 },

  // Top row (QWERTY)
  'q': { key: 'q', finger: 'left-pinky', hand: 'left', row: 1, position: 0 },
  'w': { key: 'w', finger: 'left-ring', hand: 'left', row: 1, position: 1 },
  'e': { key: 'e', finger: 'left-middle', hand: 'left', row: 1, position: 2 },
  'r': { key: 'r', finger: 'left-index', hand: 'left', row: 1, position: 3 },
  't': { key: 't', finger: 'left-index', hand: 'left', row: 1, position: 4 },
  'y': { key: 'y', finger: 'right-index', hand: 'right', row: 1, position: 5 },
  'u': { key: 'u', finger: 'right-index', hand: 'right', row: 1, position: 6 },
  'i': { key: 'i', finger: 'right-middle', hand: 'right', row: 1, position: 7 },
  'o': { key: 'o', finger: 'right-ring', hand: 'right', row: 1, position: 8 },
  'p': { key: 'p', finger: 'right-pinky', hand: 'right', row: 1, position: 9 },
  '[': { key: '[', finger: 'right-pinky', hand: 'right', row: 1, position: 10 },
  ']': { key: ']', finger: 'right-pinky', hand: 'right', row: 1, position: 11 },
  '\\': { key: '\\', finger: 'right-pinky', hand: 'right', row: 1, position: 12 },

  // Home row (ASDF)
  'a': { key: 'a', finger: 'left-pinky', hand: 'left', row: 2, position: 0 },
  's': { key: 's', finger: 'left-ring', hand: 'left', row: 2, position: 1 },
  'd': { key: 'd', finger: 'left-middle', hand: 'left', row: 2, position: 2 },
  'f': { key: 'f', finger: 'left-index', hand: 'left', row: 2, position: 3 },
  'g': { key: 'g', finger: 'left-index', hand: 'left', row: 2, position: 4 },
  'h': { key: 'h', finger: 'right-index', hand: 'right', row: 2, position: 5 },
  'j': { key: 'j', finger: 'right-index', hand: 'right', row: 2, position: 6 },
  'k': { key: 'k', finger: 'right-middle', hand: 'right', row: 2, position: 7 },
  'l': { key: 'l', finger: 'right-ring', hand: 'right', row: 2, position: 8 },
  ';': { key: ';', finger: 'right-pinky', hand: 'right', row: 2, position: 9 },
  "'": { key: "'", finger: 'right-pinky', hand: 'right', row: 2, position: 10 },

  // Bottom row (ZXCV)
  'z': { key: 'z', finger: 'left-pinky', hand: 'left', row: 3, position: 0 },
  'x': { key: 'x', finger: 'left-ring', hand: 'left', row: 3, position: 1 },
  'c': { key: 'c', finger: 'left-middle', hand: 'left', row: 3, position: 2 },
  'v': { key: 'v', finger: 'left-index', hand: 'left', row: 3, position: 3 },
  'b': { key: 'b', finger: 'left-index', hand: 'left', row: 3, position: 4 },
  'n': { key: 'n', finger: 'right-index', hand: 'right', row: 3, position: 5 },
  'm': { key: 'm', finger: 'right-index', hand: 'right', row: 3, position: 6 },
  ',': { key: ',', finger: 'right-middle', hand: 'right', row: 3, position: 7 },
  '.': { key: '.', finger: 'right-ring', hand: 'right', row: 3, position: 8 },
  '/': { key: '/', finger: 'right-pinky', hand: 'right', row: 3, position: 9 },

  // Special keys
  ' ': { key: ' ', finger: 'right-thumb', hand: 'right', row: 4, position: 0 },
};

export function getFingerForKey(key: string): Finger {
  const mapping = FINGER_MAPPING[key.toLowerCase()];
  return mapping?.finger || 'left-index'; // Default fallback
}

export function getHandForKey(key: string): Hand {
  const mapping = FINGER_MAPPING[key.toLowerCase()];
  return mapping?.hand || 'left'; // Default fallback
}

export const FINGER_NAMES: Record<Finger, string> = {
  'left-pinky': 'Left Pinky',
  'left-ring': 'Left Ring',
  'left-middle': 'Left Middle',
  'left-index': 'Left Index',
  'left-thumb': 'Left Thumb',
  'right-thumb': 'Right Thumb',
  'right-index': 'Right Index',
  'right-middle': 'Right Middle',
  'right-ring': 'Right Ring',
  'right-pinky': 'Right Pinky',
};
```

### 1.3 Keystroke Recording

**Modify: `src/game/GameEngine.ts`**

Track each keystroke during lessons:

```typescript
import { getFingerForKey, getHandForKey } from '../data/fingerMapping';

// In handleKeyPress method:
async recordKeystroke(key: string, expectedKey: string, isCorrect: boolean) {
  const finger = getFingerForKey(expectedKey);
  const hand = getHandForKey(expectedKey);

  await this.convex.mutation(api.keystrokes.recordKeystroke, {
    lessonId: this.currentLesson.id,
    key: key,
    expectedKey: expectedKey,
    isCorrect: isCorrect,
    timestamp: Date.now(),
    finger: finger,
    hand: hand,
  });
}
```

### 1.4 Convex Mutation Functions

**New file: `convex/keystrokes.ts`**

```typescript
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const recordKeystroke = mutation({
  args: {
    lessonId: v.number(),
    key: v.string(),
    expectedKey: v.string(),
    isCorrect: v.boolean(),
    timestamp: v.number(),
    finger: v.string(),
    hand: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    // Record individual keystroke
    await ctx.db.insert("keystrokes", {
      userId: user._id,
      lessonId: args.lessonId,
      key: args.key,
      expectedKey: args.expectedKey,
      isCorrect: args.isCorrect,
      timestamp: args.timestamp,
      finger: args.finger,
      hand: args.hand,
    });

    // Update aggregate stats
    await updateKeyStats(ctx, user._id, args.expectedKey, args.isCorrect, args.finger, args.hand);
  },
});

async function updateKeyStats(ctx: any, userId: any, key: string, isCorrect: boolean, finger: string, hand: string) {
  const existing = await ctx.db
    .query("keyStats")
    .withIndex("by_user_and_key", q => q.eq("userId", userId).eq("key", key))
    .unique();

  if (existing) {
    const newTotal = existing.totalAttempts + 1;
    const newCorrect = existing.correctAttempts + (isCorrect ? 1 : 0);
    const newAccuracy = (newCorrect / newTotal) * 100;

    await ctx.db.patch(existing._id, {
      totalAttempts: newTotal,
      correctAttempts: newCorrect,
      accuracy: newAccuracy,
      lastUpdated: Date.now(),
    });
  } else {
    await ctx.db.insert("keyStats", {
      userId: userId,
      key: key,
      totalAttempts: 1,
      correctAttempts: isCorrect ? 1 : 0,
      accuracy: isCorrect ? 100 : 0,
      lastUpdated: Date.now(),
      finger: finger,
      hand: hand,
    });
  }
}

export const getKeyStats = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    return await ctx.db
      .query("keyStats")
      .withIndex("by_user", q => q.eq("userId", user._id))
      .collect();
  },
});

export const getFingerStats = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return {};

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return {};

    const stats = await ctx.db
      .query("keyStats")
      .withIndex("by_user", q => q.eq("userId", user._id))
      .collect();

    // Aggregate by finger
    const fingerStats: Record<string, { total: number; correct: number; accuracy: number }> = {};

    for (const stat of stats) {
      if (!fingerStats[stat.finger]) {
        fingerStats[stat.finger] = { total: 0, correct: 0, accuracy: 0 };
      }
      fingerStats[stat.finger].total += stat.totalAttempts;
      fingerStats[stat.finger].correct += stat.correctAttempts;
    }

    // Calculate percentages
    for (const finger in fingerStats) {
      const { total, correct } = fingerStats[finger];
      fingerStats[finger].accuracy = total > 0 ? (correct / total) * 100 : 0;
    }

    return fingerStats;
  },
});

export const getWeakKeys = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    const stats = await ctx.db
      .query("keyStats")
      .withIndex("by_user", q => q.eq("userId", user._id))
      .collect();

    // Filter to keys with at least 10 attempts and sort by accuracy
    return stats
      .filter(s => s.totalAttempts >= 10)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, args.limit || 10);
  },
});
```

---

## Phase 2: Heatmap Visualization

### 2.1 Keyboard Heatmap Component

**New file: `src/components/KeyboardHeatmap.tsx`**

```typescript
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { FINGER_MAPPING, FINGER_NAMES, type Finger } from '../data/fingerMapping';

interface KeyboardHeatmapProps {
  mode?: 'accuracy' | 'finger-guide';
  showLabels?: boolean;
}

export function KeyboardHeatmap({ mode = 'accuracy', showLabels = true }: KeyboardHeatmapProps) {
  const keyStats = useQuery(api.keystrokes.getKeyStats);

  const getKeyColor = (key: string): string => {
    if (mode === 'finger-guide') {
      return getFingerColor(FINGER_MAPPING[key]?.finger);
    }

    const stat = keyStats?.find(s => s.key === key);
    if (!stat || stat.totalAttempts < 5) return '#2a2a3e'; // Not enough data

    const accuracy = stat.accuracy;
    if (accuracy >= 95) return '#0ead69'; // Green - excellent
    if (accuracy >= 85) return '#3bceac'; // Cyan - good
    if (accuracy >= 75) return '#ffd93d'; // Yellow - okay
    if (accuracy >= 60) return '#ff9f43'; // Orange - needs work
    return '#ff6b9d'; // Pink/red - needs practice
  };

  const getFingerColor = (finger?: Finger): string => {
    const colors: Record<Finger, string> = {
      'left-pinky': '#ff6b9d',
      'left-ring': '#ffd93d',
      'left-middle': '#3bceac',
      'left-index': '#0ead69',
      'left-thumb': '#9b59b6',
      'right-thumb': '#9b59b6',
      'right-index': '#0ead69',
      'right-middle': '#3bceac',
      'right-ring': '#ffd93d',
      'right-pinky': '#ff6b9d',
    };
    return finger ? colors[finger] : '#2a2a3e';
  };

  const rows = [
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
  ];

  return (
    <div className="keyboard-heatmap">
      <style>{`
        .keyboard-heatmap {
          padding: 16px;
          background: #1a1a2e;
          border-radius: 8px;
        }
        .keyboard-row {
          display: flex;
          gap: 4px;
          margin-bottom: 4px;
          justify-content: center;
        }
        .key-cell {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #0f0f1e;
          font-family: 'Press Start 2P';
          font-size: 12px;
          color: #eef5db;
          text-transform: uppercase;
          transition: all 0.2s;
          cursor: help;
          position: relative;
        }
        .key-cell:hover {
          transform: scale(1.1);
          z-index: 10;
          border-color: #ffd93d;
        }
        .key-label {
          font-size: 6px;
          color: #eef5db;
          position: absolute;
          bottom: 2px;
          right: 2px;
          opacity: 0.7;
        }
        .spacebar {
          width: 240px;
        }
      `}</style>

      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="keyboard-row">
          {row.map(key => {
            const stat = keyStats?.find(s => s.key === key);
            const mapping = FINGER_MAPPING[key];

            return (
              <div
                key={key}
                className="key-cell"
                style={{ backgroundColor: getKeyColor(key) }}
                title={
                  mode === 'accuracy' && stat
                    ? `${key}: ${stat.accuracy.toFixed(1)}% (${stat.correctAttempts}/${stat.totalAttempts})`
                    : `${key}: ${mapping ? FINGER_NAMES[mapping.finger] : 'Unknown'}`
                }
              >
                {key === ' ' ? 'SPC' : key}
                {showLabels && mode === 'accuracy' && stat && stat.totalAttempts >= 5 && (
                  <span className="key-label">{stat.accuracy.toFixed(0)}%</span>
                )}
              </div>
            );
          })}
        </div>
      ))}

      {/* Spacebar */}
      <div className="keyboard-row">
        <div
          className="key-cell spacebar"
          style={{ backgroundColor: getKeyColor(' ') }}
          title="Spacebar"
        >
          SPACE
        </div>
      </div>
    </div>
  );
}
```

### 2.2 Color Legend Component

**New file: `src/components/HeatmapLegend.tsx`**

```typescript
export function HeatmapLegend() {
  const legend = [
    { color: '#0ead69', label: '95%+', description: 'Excellent' },
    { color: '#3bceac', label: '85-94%', description: 'Good' },
    { color: '#ffd93d', label: '75-84%', description: 'Okay' },
    { color: '#ff9f43', label: '60-74%', description: 'Needs Work' },
    { color: '#ff6b9d', label: '<60%', description: 'Needs Practice' },
    { color: '#2a2a3e', label: 'N/A', description: 'Not Enough Data' },
  ];

  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap',
      padding: '16px',
      background: '#1a1a2e',
      borderRadius: '8px',
    }}>
      {legend.map(item => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '24px',
            height: '24px',
            backgroundColor: item.color,
            border: '2px solid #0f0f1e',
          }} />
          <div>
            <div style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '8px',
              color: '#eef5db',
            }}>
              {item.label}
            </div>
            <div style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '6px',
              color: '#8e8ea0',
            }}>
              {item.description}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### 2.3 Finger Statistics Display

**New file: `src/components/FingerStats.tsx`**

```typescript
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { FINGER_NAMES, type Finger } from '../data/fingerMapping';

export function FingerStats() {
  const fingerStats = useQuery(api.keystrokes.getFingerStats);

  if (!fingerStats) return <div>Loading...</div>;

  const leftFingers: Finger[] = ['left-pinky', 'left-ring', 'left-middle', 'left-index', 'left-thumb'];
  const rightFingers: Finger[] = ['right-thumb', 'right-index', 'right-middle', 'right-ring', 'right-pinky'];

  const renderFingerBar = (finger: Finger) => {
    const stats = fingerStats[finger] || { accuracy: 0, total: 0 };
    const accuracy = stats.accuracy || 0;
    const hasData = stats.total >= 10;

    return (
      <div key={finger} style={{ marginBottom: '12px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '4px',
        }}>
          <span style={{
            fontFamily: "'Press Start 2P'",
            fontSize: '8px',
            color: '#eef5db',
          }}>
            {FINGER_NAMES[finger]}
          </span>
          <span style={{
            fontFamily: "'Press Start 2P'",
            fontSize: '8px',
            color: hasData ? '#3bceac' : '#4a4a6e',
          }}>
            {hasData ? `${accuracy.toFixed(1)}%` : 'N/A'}
          </span>
        </div>
        <div style={{
          width: '100%',
          height: '16px',
          background: '#0f0f1e',
          border: '2px solid #2a2a3e',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {hasData && (
            <div style={{
              width: `${accuracy}%`,
              height: '100%',
              background: accuracy >= 85 ? '#0ead69' : accuracy >= 70 ? '#ffd93d' : '#ff6b9d',
              transition: 'width 0.3s ease',
            }} />
          )}
        </div>
      </div>
    );
  };

  const leftHandStats = fingerStats['left'] || { accuracy: 0 };
  const rightHandStats = fingerStats['right'] || { accuracy: 0 };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '24px',
      padding: '16px',
      background: '#1a1a2e',
      borderRadius: '8px',
    }}>
      {/* Left Hand */}
      <div>
        <h3 style={{
          fontFamily: "'Press Start 2P'",
          fontSize: '10px',
          color: '#ffd93d',
          marginBottom: '16px',
        }}>
          LEFT HAND
        </h3>
        {leftFingers.map(renderFingerBar)}
      </div>

      {/* Right Hand */}
      <div>
        <h3 style={{
          fontFamily: "'Press Start 2P'",
          fontSize: '10px',
          color: '#ffd93d',
          marginBottom: '16px',
        }}>
          RIGHT HAND
        </h3>
        {rightFingers.map(renderFingerBar)}
      </div>
    </div>
  );
}
```

---

## Phase 3: Practice Integration & Recommendations

### 3.1 Weak Key Recommendations

**New file: `src/components/PracticeRecommendations.tsx`**

```typescript
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { FINGER_MAPPING, FINGER_NAMES } from '../data/fingerMapping';

interface PracticeRecommendationsProps {
  onStartPractice: (keys: string[]) => void;
}

export function PracticeRecommendations({ onStartPractice }: PracticeRecommendationsProps) {
  const weakKeys = useQuery(api.keystrokes.getWeakKeys, { limit: 10 });

  if (!weakKeys || weakKeys.length === 0) {
    return (
      <div style={{
        padding: '16px',
        background: '#1a1a2e',
        borderRadius: '8px',
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: "'Press Start 2P'",
          fontSize: '8px',
          color: '#8e8ea0',
        }}>
          Complete more lessons to get personalized recommendations!
        </p>
      </div>
    );
  }

  return (
    <div style={{
      padding: '16px',
      background: '#1a1a2e',
      borderRadius: '8px',
    }}>
      <h3 style={{
        fontFamily: "'Press Start 2P'",
        fontSize: '10px',
        color: '#ffd93d',
        marginBottom: '16px',
      }}>
        SUGGESTED PRACTICE
      </h3>

      <div style={{ marginBottom: '16px' }}>
        {weakKeys.slice(0, 5).map(stat => {
          const mapping = FINGER_MAPPING[stat.key];
          return (
            <div
              key={stat.key}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px',
                marginBottom: '8px',
                background: '#0f0f1e',
                border: '2px solid #2a2a3e',
              }}
            >
              <div>
                <span style={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: '12px',
                  color: '#eef5db',
                  marginRight: '12px',
                }}>
                  {stat.key.toUpperCase()}
                </span>
                <span style={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: '7px',
                  color: '#8e8ea0',
                }}>
                  {mapping ? FINGER_NAMES[mapping.finger] : 'Unknown'}
                </span>
              </div>
              <span style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '8px',
                color: '#ff6b9d',
              }}>
                {stat.accuracy.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => onStartPractice(weakKeys.slice(0, 5).map(s => s.key))}
        style={{
          width: '100%',
          padding: '12px',
          fontFamily: "'Press Start 2P'",
          fontSize: '8px',
          color: '#1a1a2e',
          background: '#ffd93d',
          border: '3px solid #0f0f1e',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = '#3bceac';
          e.currentTarget.style.transform = 'scale(1.02)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = '#ffd93d';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        PRACTICE WEAK KEYS
      </button>
    </div>
  );
}
```

### 3.2 Targeted Practice Mode

**Modify: `src/game/PracticeMode.ts`**

Add support for filtered key sets:

```typescript
export interface PracticeConfig {
  mode: 'all' | 'filtered';
  targetKeys?: string[]; // Specific keys to practice
  duration?: number;     // Practice duration in seconds
  repetitions?: number;  // How many times to practice each key
}

export class PracticeMode {
  private config: PracticeConfig;
  private practiceText: string = '';

  constructor(config: PracticeConfig) {
    this.config = config;
    this.generatePracticeText();
  }

  private generatePracticeText() {
    if (this.config.mode === 'filtered' && this.config.targetKeys) {
      // Generate text focused on target keys
      const keys = this.config.targetKeys;
      const repetitions = this.config.repetitions || 10;

      let text = '';
      for (let i = 0; i < repetitions; i++) {
        // Shuffle keys to avoid predictable patterns
        const shuffled = [...keys].sort(() => Math.random() - 0.5);
        text += shuffled.join(' ') + ' ';
      }

      this.practiceText = text.trim();
    } else {
      // Generate normal practice text
      this.practiceText = this.generateRandomText();
    }
  }

  private generateRandomText(): string {
    const words = ['the', 'quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog'];
    return words.sort(() => Math.random() - 0.5).slice(0, 20).join(' ');
  }

  getText(): string {
    return this.practiceText;
  }
}
```

### 3.3 Historical Comparison

**New file: `src/components/ProgressChart.tsx`**

```typescript
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export function ProgressChart() {
  const keyStats = useQuery(api.keystrokes.getKeyStats);

  // Simple text-based progress indicator
  const getOverallAccuracy = () => {
    if (!keyStats || keyStats.length === 0) return 0;

    const totalAttempts = keyStats.reduce((sum, stat) => sum + stat.totalAttempts, 0);
    const totalCorrect = keyStats.reduce((sum, stat) => sum + stat.correctAttempts, 0);

    return totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;
  };

  const accuracy = getOverallAccuracy();

  return (
    <div style={{
      padding: '16px',
      background: '#1a1a2e',
      borderRadius: '8px',
    }}>
      <h3 style={{
        fontFamily: "'Press Start 2P'",
        fontSize: '10px',
        color: '#ffd93d',
        marginBottom: '16px',
      }}>
        OVERALL PROGRESS
      </h3>

      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <div style={{
          fontFamily: "'Press Start 2P'",
          fontSize: '32px',
          color: accuracy >= 90 ? '#0ead69' : accuracy >= 75 ? '#ffd93d' : '#ff6b9d',
        }}>
          {accuracy.toFixed(1)}%
        </div>
        <div style={{
          fontFamily: "'Press Start 2P'",
          fontSize: '7px',
          color: '#8e8ea0',
          marginTop: '8px',
        }}>
          Average Accuracy
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: "'Press Start 2P'",
            fontSize: '16px',
            color: '#3bceac',
          }}>
            {keyStats?.reduce((sum, s) => sum + s.totalAttempts, 0) || 0}
          </div>
          <div style={{
            fontFamily: "'Press Start 2P'",
            fontSize: '6px',
            color: '#8e8ea0',
            marginTop: '4px',
          }}>
            TOTAL KEYS
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: "'Press Start 2P'",
            fontSize: '16px',
            color: '#0ead69',
          }}>
            {keyStats?.filter(s => s.accuracy >= 90 && s.totalAttempts >= 10).length || 0}
          </div>
          <div style={{
            fontFamily: "'Press Start 2P'",
            fontSize: '6px',
            color: '#8e8ea0',
            marginTop: '4px',
          }}>
            MASTERED
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: "'Press Start 2P'",
            fontSize: '16px',
            color: '#ff6b9d',
          }}>
            {keyStats?.filter(s => s.accuracy < 75 && s.totalAttempts >= 10).length || 0}
          </div>
          <div style={{
            fontFamily: "'Press Start 2P'",
            fontSize: '6px',
            color: '#8e8ea0',
            marginTop: '4px',
          }}>
            WEAK SPOTS
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 3.4 Main Performance Dashboard

**New file: `src/pages/PerformanceDashboard.tsx`**

```typescript
import { useState } from 'react';
import { KeyboardHeatmap } from '../components/KeyboardHeatmap';
import { HeatmapLegend } from '../components/HeatmapLegend';
import { FingerStats } from '../components/FingerStats';
import { PracticeRecommendations } from '../components/PracticeRecommendations';
import { ProgressChart } from '../components/ProgressChart';
import { useNavigate } from 'react-router-dom';

export function PerformanceDashboard() {
  const navigate = useNavigate();
  const [heatmapMode, setHeatmapMode] = useState<'accuracy' | 'finger-guide'>('accuracy');

  const handleStartPractice = (keys: string[]) => {
    // Navigate to practice mode with filtered keys
    navigate('/practice', { state: { targetKeys: keys } });
  };

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '24px',
      minHeight: '100vh',
      background: '#0f0f1e',
    }}>
      <h1 style={{
        fontFamily: "'Press Start 2P'",
        fontSize: '20px',
        color: '#ffd93d',
        marginBottom: '24px',
        textAlign: 'center',
      }}>
        PERFORMANCE DASHBOARD
      </h1>

      {/* Mode Toggle */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '12px',
        marginBottom: '24px',
      }}>
        <button
          onClick={() => setHeatmapMode('accuracy')}
          style={{
            padding: '8px 16px',
            fontFamily: "'Press Start 2P'",
            fontSize: '8px',
            background: heatmapMode === 'accuracy' ? '#ffd93d' : '#2a2a3e',
            color: heatmapMode === 'accuracy' ? '#1a1a2e' : '#8e8ea0',
            border: '2px solid #0f0f1e',
            cursor: 'pointer',
          }}
        >
          ACCURACY HEATMAP
        </button>
        <button
          onClick={() => setHeatmapMode('finger-guide')}
          style={{
            padding: '8px 16px',
            fontFamily: "'Press Start 2P'",
            fontSize: '8px',
            background: heatmapMode === 'finger-guide' ? '#ffd93d' : '#2a2a3e',
            color: heatmapMode === 'finger-guide' ? '#1a1a2e' : '#8e8ea0',
            border: '2px solid #0f0f1e',
            cursor: 'pointer',
          }}
        >
          FINGER GUIDE
        </button>
      </div>

      {/* Keyboard Heatmap */}
      <div style={{ marginBottom: '24px' }}>
        <KeyboardHeatmap mode={heatmapMode} showLabels={heatmapMode === 'accuracy'} />
      </div>

      {/* Legend */}
      {heatmapMode === 'accuracy' && (
        <div style={{ marginBottom: '24px' }}>
          <HeatmapLegend />
        </div>
      )}

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '24px',
        marginBottom: '24px',
      }}>
        <ProgressChart />
        <PracticeRecommendations onStartPractice={handleStartPractice} />
      </div>

      {/* Finger Stats */}
      <div style={{ marginBottom: '24px' }}>
        <FingerStats />
      </div>
    </div>
  );
}
```

---

## File Structure

```
typingquest/
├── src/
│   ├── data/
│   │   └── fingerMapping.ts          (new) - Finger-to-key mapping
│   ├── components/
│   │   ├── KeyboardHeatmap.tsx       (new) - Visual keyboard heatmap
│   │   ├── HeatmapLegend.tsx         (new) - Color legend
│   │   ├── FingerStats.tsx           (new) - Per-finger statistics
│   │   ├── PracticeRecommendations.tsx (new) - Weak key suggestions
│   │   └── ProgressChart.tsx         (new) - Overall progress display
│   ├── pages/
│   │   └── PerformanceDashboard.tsx  (new) - Main dashboard page
│   └── game/
│       ├── GameEngine.ts             (modify) - Track keystrokes
│       └── PracticeMode.ts           (modify) - Add filtered practice
└── convex/
    ├── schema.ts                     (modify) - Add keystrokes & keyStats tables
    └── keystrokes.ts                 (new) - Keystroke recording & queries
```

---

## Implementation Order

1. **Schema** - Update Convex schema with keystrokes and keyStats tables
2. **Finger Mapping** - Create fingerMapping.ts with key-to-finger assignments
3. **Backend** - Implement convex/keystrokes.ts with mutations and queries
4. **Data Collection** - Modify GameEngine to record keystrokes during gameplay
5. **Heatmap Component** - Build KeyboardHeatmap.tsx with color-coded keys
6. **Legend** - Create HeatmapLegend.tsx for color explanations
7. **Finger Stats** - Build FingerStats.tsx with per-finger accuracy bars
8. **Progress Chart** - Create ProgressChart.tsx for overall metrics
9. **Recommendations** - Build PracticeRecommendations.tsx for weak key suggestions
10. **Practice Mode** - Modify PracticeMode.ts to support filtered key sets
11. **Dashboard** - Assemble PerformanceDashboard.tsx with all components
12. **Routing** - Add /performance route in main app router
13. **Navigation** - Add link to performance dashboard from main menu
14. **Testing** - Verify data collection, heatmap accuracy, and practice integration

---

## Notes

- **Minimum Data Threshold**: Require at least 5-10 attempts per key before showing accuracy to avoid misleading data
- **Color Accessibility**: Ensure color gradients are distinguishable for colorblind users (consider adding pattern overlays)
- **Performance**: Aggregate stats in keyStats table to avoid querying thousands of individual keystrokes
- **Privacy**: All keystroke data is user-specific and never shared
- **Touch Typing Standard**: Use standard QWERTY home row finger assignments (ASDF/JKL;)
- **Finger Guide Toggle**: Allow users to switch between accuracy heatmap and finger placement guide
- **Historical Data**: Store timestamps to enable trend analysis and improvement tracking over time
- **Export Feature**: Consider adding CSV export for users who want to analyze data externally
- **Mobile Considerations**: Heatmap may need responsive design for smaller screens
- **Internationalization**: Finger mappings will need adjustment for non-QWERTY layouts (future enhancement)
