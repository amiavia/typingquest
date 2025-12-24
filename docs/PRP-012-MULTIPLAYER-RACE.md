# PRP-012: Real-Time Multiplayer Typing Races

**Status**: DRAFT
**Author**: Claude + Anton
**Date**: 2025-12-25
**Priority**: HIGH
**Estimated Effort**: 4 phases, ~40 tasks

---

## Executive Summary

This PRP introduces real-time multiplayer typing races to TypeBit8, allowing players to compete head-to-head in synchronous typing challenges. The system will support 1v1 duels and 4-player races with skill-based matchmaking, live progress visualization, ranked/casual modes, and anti-cheat measures. Using Convex's real-time infrastructure, players will experience low-latency synchronization with countdown timers, live opponent progress bars, and celebratory winner podiums with XP/coin rewards.

---

## Problem Statement

### Current State

1. **Solo Experience Only**: TypeBit8 is currently single-player with no multiplayer interaction
2. **Limited Social Engagement**: Players cannot compete directly with friends or other users
3. **Asynchronous Leaderboards**: Competition is limited to comparing historical scores, not live races
4. **No Real-Time Feedback**: Players don't see how they stack up against others in the moment
5. **Missing Progression Incentive**: Lack of competitive modes reduces replay value

### Impact

| Issue | User Impact |
|-------|-------------|
| No multiplayer | Reduced engagement, limited social features |
| Solo grinding | Less exciting progression, no "clutch" moments |
| Static competition | Leaderboards feel impersonal and disconnected |
| No skill matching | New players discouraged by skill gap |
| Limited retention | Players leave after completing solo content |

### Success Criteria

- [ ] 1v1 and 4-player race modes fully functional
- [ ] Skill-based matchmaking creates fair, balanced matches
- [ ] Real-time progress bars show all racers' positions with <500ms latency
- [ ] 3-2-1 countdown synchronization works across all clients
- [ ] Winner podium displays results with XP/coin rewards
- [ ] Ranked mode with ELO/rating system implemented
- [ ] Casual mode for practice without rating impact
- [ ] Anti-cheat detects suspicious timing/accuracy patterns
- [ ] Graceful handling of disconnections and reconnections
- [ ] Mobile-responsive UI for races on all devices

---

## Multiplayer Race System Overview

### Race Modes

| Mode | Players | Description | Rating Impact |
|------|---------|-------------|---------------|
| **1v1 Duel** | 2 | Head-to-head typing battle | Ranked: Yes, Casual: No |
| **4-Player Race** | 4 | Four-way competitive race | Ranked: Yes, Casual: No |

### Race Flow

1. **Queue Entry**: Player selects mode (1v1/4-player, ranked/casual)
2. **Matchmaking**: System finds opponents within skill range (~200 ELO)
3. **Lobby**: Players see opponents' avatars, levels, ratings (5-second wait)
4. **Countdown**: Synchronized 3-2-1-GO countdown
5. **Race**: All players type the same text passage simultaneously
6. **Real-Time Updates**: Progress bars update every keystroke
7. **Finish**: First to complete wins, others finish or forfeit
8. **Podium**: Results screen shows placements, XP/coin rewards, rating changes

### Skill-Based Matchmaking

- **ELO Rating System**: Track player skill (starting: 1200)
- **Matchmaking Range**: ±200 ELO by default, expands by +50 every 10 seconds waiting
- **Queue Priority**: Longest-waiting players matched first
- **Bot Backfill**: After 30 seconds, fill empty slots with AI opponents (casual only)

---

## Phase 1: Data Schema & Backend Infrastructure

### 1.1 Convex Schema Updates

**Modify: `convex/schema.ts`**

Add new tables for races, matchmaking, and ratings:

```typescript
// Player rating system
ratings: defineTable({
  userId: v.id("users"),
  mode: v.union(v.literal("1v1"), v.literal("4player")),
  rating: v.number(), // ELO rating
  wins: v.number(),
  losses: v.number(),
  totalRaces: v.number(),
  lastRaceAt: v.optional(v.number()),
})
.index("by_user_and_mode", ["userId", "mode"])
.index("by_mode_and_rating", ["mode", "rating"]),

// Matchmaking queue
raceQueue: defineTable({
  userId: v.id("users"),
  mode: v.union(v.literal("1v1"), v.literal("4player")),
  ranked: v.boolean(),
  rating: v.number(),
  queuedAt: v.number(),
  status: v.union(
    v.literal("waiting"),
    v.literal("matched"),
    v.literal("cancelled")
  ),
})
.index("by_user", ["userId"])
.index("by_mode_and_status", ["mode", "status", "queuedAt"]),

// Active races
races: defineTable({
  mode: v.union(v.literal("1v1"), v.literal("4player")),
  ranked: v.boolean(),
  status: v.union(
    v.literal("lobby"),      // Waiting for countdown
    v.literal("countdown"),  // 3-2-1-GO
    v.literal("racing"),     // Active race
    v.literal("finished")    // Race complete
  ),
  textPassage: v.string(),   // The text to type
  textPassageId: v.string(), // Reference to passage source
  participants: v.array(v.object({
    userId: v.id("users"),
    username: v.string(),
    avatarId: v.optional(v.string()),
    rating: v.number(),
    slotNumber: v.number(),  // 0-3 for position in UI
  })),
  startTime: v.optional(v.number()), // Race start timestamp
  createdAt: v.number(),
  finishedAt: v.optional(v.number()),
})
.index("by_status", ["status", "createdAt"]),

// Race progress tracking (real-time updates)
raceProgress: defineTable({
  raceId: v.id("races"),
  userId: v.id("users"),
  charactersTyped: v.number(),
  totalCharacters: v.number(),
  accuracy: v.number(),
  wpm: v.number(),
  finished: v.boolean(),
  finishTime: v.optional(v.number()), // Milliseconds from race start
  placement: v.optional(v.number()),  // 1st, 2nd, 3rd, 4th
})
.index("by_race_and_user", ["raceId", "userId"])
.index("by_race", ["raceId"]),

// Race results (persisted after race)
raceResults: defineTable({
  raceId: v.id("races"),
  mode: v.union(v.literal("1v1"), v.literal("4player")),
  ranked: v.boolean(),
  textPassageId: v.string(),
  results: v.array(v.object({
    userId: v.id("users"),
    username: v.string(),
    avatarId: v.optional(v.string()),
    placement: v.number(),
    wpm: v.number(),
    accuracy: v.number(),
    finishTime: v.number(),
    ratingBefore: v.number(),
    ratingAfter: v.number(),
    ratingChange: v.number(),
    xpEarned: v.number(),
    coinsEarned: v.number(),
  })),
  createdAt: v.number(),
})
.index("by_user", ["results.userId", "createdAt"])
.index("by_mode", ["mode", "createdAt"]),
```

### 1.2 Race Text Passages

**New file: `src/data/racePassages.ts`**

Curated typing passages optimized for racing (30-60 seconds at average speed):

```typescript
export interface RacePassage {
  id: string;
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  characterCount: number;
  source?: string;
}

export const RACE_PASSAGES: RacePassage[] = [
  {
    id: 'race-easy-001',
    text: 'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump!',
    difficulty: 'easy',
    characterCount: 123,
  },
  {
    id: 'race-medium-001',
    text: 'Programming is the art of telling another human being what one wants the computer to do. It requires clear thinking, precise language, and patience.',
    difficulty: 'medium',
    characterCount: 162,
  },
  {
    id: 'race-hard-001',
    text: 'The TypeScript compiler performs static type checking at compile-time, catching errors before runtime. It transpiles TypeScript code to JavaScript, enabling modern language features while maintaining compatibility.',
    difficulty: 'hard',
    characterCount: 215,
  },
  // Add 20-30 more passages across difficulty levels
];

export function getRandomPassage(difficulty?: 'easy' | 'medium' | 'hard'): RacePassage {
  const filtered = difficulty
    ? RACE_PASSAGES.filter(p => p.difficulty === difficulty)
    : RACE_PASSAGES;

  return filtered[Math.floor(Math.random() * filtered.length)];
}

export function getPassageById(id: string): RacePassage | undefined {
  return RACE_PASSAGES.find(p => p.id === id);
}
```

### 1.3 Matchmaking Logic

**New file: `convex/matchmaking.ts`**

```typescript
import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Join matchmaking queue
export const joinQueue = mutation({
  args: {
    mode: v.union(v.literal("1v1"), v.literal("4player")),
    ranked: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    // Get or create rating
    let rating = await ctx.db
      .query("ratings")
      .withIndex("by_user_and_mode", q =>
        q.eq("userId", user._id).eq("mode", args.mode)
      )
      .unique();

    if (!rating) {
      rating = await ctx.db.insert("ratings", {
        userId: user._id,
        mode: args.mode,
        rating: 1200, // Starting ELO
        wins: 0,
        losses: 0,
        totalRaces: 0,
      });
      rating = await ctx.db.get(rating);
    }

    // Check if already in queue
    const existing = await ctx.db
      .query("raceQueue")
      .withIndex("by_user", q => q.eq("userId", user._id))
      .filter(q => q.eq(q.field("status"), "waiting"))
      .first();

    if (existing) {
      return { queueId: existing._id, alreadyQueued: true };
    }

    // Add to queue
    const queueId = await ctx.db.insert("raceQueue", {
      userId: user._id,
      mode: args.mode,
      ranked: args.ranked,
      rating: rating.rating,
      queuedAt: Date.now(),
      status: "waiting",
    });

    // Trigger matchmaking check
    await ctx.scheduler.runAfter(0, "matchmaking:tryMatchmaking", {
      mode: args.mode,
      ranked: args.ranked,
    });

    return { queueId, alreadyQueued: false };
  },
});

// Leave matchmaking queue
export const leaveQueue = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const queueEntry = await ctx.db
      .query("raceQueue")
      .withIndex("by_user", q => q.eq("userId", user._id))
      .filter(q => q.eq(q.field("status"), "waiting"))
      .first();

    if (queueEntry) {
      await ctx.db.patch(queueEntry._id, { status: "cancelled" });
    }

    return { success: true };
  },
});

// Internal: Try to create matches from queue
export const tryMatchmaking = internalMutation({
  args: {
    mode: v.union(v.literal("1v1"), v.literal("4player")),
    ranked: v.boolean(),
  },
  handler: async (ctx, args) => {
    const playersNeeded = args.mode === "1v1" ? 2 : 4;

    // Get waiting players, sorted by queue time
    const waiting = await ctx.db
      .query("raceQueue")
      .withIndex("by_mode_and_status", q =>
        q.eq("mode", args.mode).eq("status", "waiting")
      )
      .filter(q => q.eq(q.field("ranked"), args.ranked))
      .collect();

    if (waiting.length < playersNeeded) {
      return { matched: false, reason: "not_enough_players" };
    }

    // Sort by queue time
    waiting.sort((a, b) => a.queuedAt - b.queuedAt);

    // Find best match using ELO ranges
    for (let i = 0; i <= waiting.length - playersNeeded; i++) {
      const candidate = waiting[i];
      const timeWaiting = Date.now() - candidate.queuedAt;
      const ratingRange = 200 + Math.floor(timeWaiting / 10000) * 50; // Expand by 50 every 10s

      const matchGroup = [candidate];

      // Find compatible opponents
      for (let j = i + 1; j < waiting.length && matchGroup.length < playersNeeded; j++) {
        const opponent = waiting[j];
        const ratingDiff = Math.abs(candidate.rating - opponent.rating);

        if (ratingDiff <= ratingRange) {
          matchGroup.push(opponent);
        }
      }

      // If we found enough players, create the race
      if (matchGroup.length === playersNeeded) {
        await createRaceFromMatch(ctx, args.mode, args.ranked, matchGroup);
        return { matched: true, playerCount: matchGroup.length };
      }
    }

    return { matched: false, reason: "no_compatible_ratings" };
  },
});

// Helper: Create race from matched players
async function createRaceFromMatch(
  ctx: any,
  mode: "1v1" | "4player",
  ranked: boolean,
  queueEntries: any[]
) {
  // Select random passage
  const passages = await import("../src/data/racePassages");
  const passage = passages.getRandomPassage();

  // Build participants array
  const participants = [];
  for (let i = 0; i < queueEntries.length; i++) {
    const entry = queueEntries[i];
    const user = await ctx.db.get(entry.userId);

    participants.push({
      userId: entry.userId,
      username: user.username || user.email || "Anonymous",
      avatarId: user.avatarId,
      rating: entry.rating,
      slotNumber: i,
    });
  }

  // Create race
  const raceId = await ctx.db.insert("races", {
    mode,
    ranked,
    status: "lobby",
    textPassage: passage.text,
    textPassageId: passage.id,
    participants,
    createdAt: Date.now(),
  });

  // Initialize progress tracking for each player
  for (const participant of participants) {
    await ctx.db.insert("raceProgress", {
      raceId,
      userId: participant.userId,
      charactersTyped: 0,
      totalCharacters: passage.text.length,
      accuracy: 100,
      wpm: 0,
      finished: false,
    });
  }

  // Mark queue entries as matched
  for (const entry of queueEntries) {
    await ctx.db.patch(entry._id, { status: "matched" });
  }

  // Schedule countdown start
  await ctx.scheduler.runAfter(5000, "races:startCountdown", { raceId });

  return raceId;
}
```

### 1.4 Race State Management

**New file: `convex/races.ts`**

```typescript
import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Get current race for user
export const getCurrentRace = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return null;

    // Find active race
    const races = await ctx.db
      .query("races")
      .filter(q =>
        q.or(
          q.eq(q.field("status"), "lobby"),
          q.eq(q.field("status"), "countdown"),
          q.eq(q.field("status"), "racing")
        )
      )
      .collect();

    for (const race of races) {
      if (race.participants.some(p => p.userId === user._id)) {
        return race;
      }
    }

    return null;
  },
});

// Get real-time progress for a race
export const getRaceProgress = query({
  args: { raceId: v.id("races") },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("raceProgress")
      .withIndex("by_race", q => q.eq("raceId", args.raceId))
      .collect();

    return progress;
  },
});

// Update player progress during race
export const updateProgress = mutation({
  args: {
    raceId: v.id("races"),
    charactersTyped: v.number(),
    accuracy: v.number(),
    wpm: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const race = await ctx.db.get(args.raceId);
    if (!race || race.status !== "racing") {
      throw new Error("Race not active");
    }

    const progress = await ctx.db
      .query("raceProgress")
      .withIndex("by_race_and_user", q =>
        q.eq("raceId", args.raceId).eq("userId", user._id)
      )
      .unique();

    if (!progress) throw new Error("Progress not found");

    // Update progress
    await ctx.db.patch(progress._id, {
      charactersTyped: args.charactersTyped,
      accuracy: args.accuracy,
      wpm: args.wpm,
    });

    // Check if finished
    if (args.charactersTyped >= progress.totalCharacters) {
      const finishTime = Date.now() - (race.startTime || Date.now());

      await ctx.db.patch(progress._id, {
        finished: true,
        finishTime,
      });

      // Check if all players finished
      await ctx.scheduler.runAfter(0, "races:checkRaceCompletion", {
        raceId: args.raceId,
      });
    }

    return { success: true };
  },
});

// Internal: Start countdown
export const startCountdown = internalMutation({
  args: { raceId: v.id("races") },
  handler: async (ctx, args) => {
    const race = await ctx.db.get(args.raceId);
    if (!race || race.status !== "lobby") return;

    await ctx.db.patch(args.raceId, { status: "countdown" });

    // After 3 seconds, start race
    await ctx.scheduler.runAfter(3000, "races:startRace", {
      raceId: args.raceId,
    });
  },
});

// Internal: Start race
export const startRace = internalMutation({
  args: { raceId: v.id("races") },
  handler: async (ctx, args) => {
    const race = await ctx.db.get(args.raceId);
    if (!race || race.status !== "countdown") return;

    await ctx.db.patch(args.raceId, {
      status: "racing",
      startTime: Date.now(),
    });
  },
});

// Internal: Check if race is complete
export const checkRaceCompletion = internalMutation({
  args: { raceId: v.id("races") },
  handler: async (ctx, args) => {
    const race = await ctx.db.get(args.raceId);
    if (!race || race.status !== "racing") return;

    const allProgress = await ctx.db
      .query("raceProgress")
      .withIndex("by_race", q => q.eq("raceId", args.raceId))
      .collect();

    const allFinished = allProgress.every(p => p.finished);

    if (allFinished) {
      await ctx.db.patch(args.raceId, {
        status: "finished",
        finishedAt: Date.now(),
      });

      // Calculate results and rewards
      await ctx.scheduler.runAfter(0, "races:finalizeResults", {
        raceId: args.raceId,
      });
    }
  },
});

// Internal: Finalize results and distribute rewards
export const finalizeResults = internalMutation({
  args: { raceId: v.id("races") },
  handler: async (ctx, args) => {
    const race = await ctx.db.get(args.raceId);
    if (!race) return;

    const allProgress = await ctx.db
      .query("raceProgress")
      .withIndex("by_race", q => q.eq("raceId", args.raceId))
      .collect();

    // Sort by finish time
    const sorted = allProgress
      .filter(p => p.finished)
      .sort((a, b) => (a.finishTime || Infinity) - (b.finishTime || Infinity));

    // Assign placements
    for (let i = 0; i < sorted.length; i++) {
      await ctx.db.patch(sorted[i]._id, { placement: i + 1 });
    }

    // Calculate rewards and rating changes
    const results = [];
    for (const progress of sorted) {
      const participant = race.participants.find(p => p.userId === progress.userId);
      if (!participant) continue;

      const placement = progress.placement || sorted.length + 1;

      // XP/Coins based on placement
      const xpRewards = [100, 70, 50, 30]; // 1st, 2nd, 3rd, 4th
      const coinRewards = [50, 30, 20, 10];
      const xpEarned = xpRewards[placement - 1] || 10;
      const coinsEarned = coinRewards[placement - 1] || 5;

      // Update user XP/coins
      await ctx.db.patch(progress.userId, {
        xp: (await ctx.db.get(progress.userId))?.xp + xpEarned,
        coins: (await ctx.db.get(progress.userId))?.coins + coinsEarned,
      });

      // Calculate ELO change (only for ranked)
      let ratingChange = 0;
      let ratingAfter = participant.rating;

      if (race.ranked) {
        // Simplified ELO (K=32)
        const expectedScore = placement === 1 ? 1 : 0;
        const actualScore = 1.0 / placement;
        ratingChange = Math.round(32 * (actualScore - expectedScore));
        ratingAfter = participant.rating + ratingChange;

        // Update rating
        const rating = await ctx.db
          .query("ratings")
          .withIndex("by_user_and_mode", q =>
            q.eq("userId", progress.userId).eq("mode", race.mode)
          )
          .unique();

        if (rating) {
          await ctx.db.patch(rating._id, {
            rating: ratingAfter,
            wins: rating.wins + (placement === 1 ? 1 : 0),
            losses: rating.losses + (placement > 1 ? 1 : 0),
            totalRaces: rating.totalRaces + 1,
            lastRaceAt: Date.now(),
          });
        }
      }

      results.push({
        userId: progress.userId,
        username: participant.username,
        avatarId: participant.avatarId,
        placement,
        wpm: progress.wpm,
        accuracy: progress.accuracy,
        finishTime: progress.finishTime || 0,
        ratingBefore: participant.rating,
        ratingAfter,
        ratingChange,
        xpEarned,
        coinsEarned,
      });
    }

    // Save results
    await ctx.db.insert("raceResults", {
      raceId: args.raceId,
      mode: race.mode,
      ranked: race.ranked,
      textPassageId: race.textPassageId,
      results,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});
```

---

## Phase 2: UI Components

### 2.1 Matchmaking Screen

**New file: `src/components/multiplayer/MatchmakingScreen.tsx`**

```typescript
import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

type RaceMode = '1v1' | '4player';

export function MatchmakingScreen() {
  const [mode, setMode] = useState<RaceMode>('1v1');
  const [ranked, setRanked] = useState(true);
  const [searching, setSearching] = useState(false);

  const joinQueue = useMutation(api.matchmaking.joinQueue);
  const leaveQueue = useMutation(api.matchmaking.leaveQueue);
  const currentRace = useQuery(api.races.getCurrentRace);

  const handleFindMatch = async () => {
    setSearching(true);
    await joinQueue({ mode, ranked });
  };

  const handleCancel = async () => {
    await leaveQueue();
    setSearching(false);
  };

  if (currentRace) {
    // Redirect to race screen
    return <RaceScreen raceId={currentRace._id} />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="pixel-box p-8 max-w-md w-full">
        <h1 style={{
          fontFamily: "'Press Start 2P'",
          fontSize: '18px',
          color: '#ffd93d',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          MULTIPLAYER RACE
        </h1>

        {!searching ? (
          <>
            {/* Mode Selection */}
            <div className="mb-6">
              <p style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '10px',
                color: '#eef5db',
                marginBottom: '12px'
              }}>
                SELECT MODE
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setMode('1v1')}
                  className={`pixel-btn p-4 ${mode === '1v1' ? 'ring-2 ring-[#ffd93d]' : ''}`}
                >
                  <p style={{ fontFamily: "'Press Start 2P'", fontSize: '12px' }}>
                    1v1 DUEL
                  </p>
                </button>
                <button
                  onClick={() => setMode('4player')}
                  className={`pixel-btn p-4 ${mode === '4player' ? 'ring-2 ring-[#ffd93d]' : ''}`}
                >
                  <p style={{ fontFamily: "'Press Start 2P'", fontSize: '12px' }}>
                    4 PLAYER
                  </p>
                </button>
              </div>
            </div>

            {/* Ranked/Casual Toggle */}
            <div className="mb-6">
              <p style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '10px',
                color: '#eef5db',
                marginBottom: '12px'
              }}>
                GAME TYPE
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setRanked(true)}
                  className={`pixel-btn p-3 ${ranked ? 'ring-2 ring-[#0ead69]' : ''}`}
                >
                  <p style={{ fontFamily: "'Press Start 2P'", fontSize: '10px' }}>
                    RANKED
                  </p>
                </button>
                <button
                  onClick={() => setRanked(false)}
                  className={`pixel-btn p-3 ${!ranked ? 'ring-2 ring-[#3bceac]' : ''}`}
                >
                  <p style={{ fontFamily: "'Press Start 2P'", fontSize: '10px' }}>
                    CASUAL
                  </p>
                </button>
              </div>
            </div>

            {/* Find Match Button */}
            <button
              onClick={handleFindMatch}
              className="pixel-btn w-full p-4"
              style={{ background: '#0ead69' }}
            >
              <p style={{ fontFamily: "'Press Start 2P'", fontSize: '12px', color: '#fff' }}>
                FIND MATCH
              </p>
            </button>
          </>
        ) : (
          <>
            {/* Searching Animation */}
            <div className="text-center mb-6">
              <div className="animate-pulse mb-4">
                <p style={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: '14px',
                  color: '#ffd93d'
                }}>
                  SEARCHING...
                </p>
              </div>
              <p style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '8px',
                color: '#eef5db'
              }}>
                Looking for opponents
              </p>
            </div>

            {/* Cancel Button */}
            <button
              onClick={handleCancel}
              className="pixel-btn w-full p-4"
              style={{ background: '#ff6b9d' }}
            >
              <p style={{ fontFamily: "'Press Start 2P'", fontSize: '12px', color: '#fff' }}>
                CANCEL
              </p>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
```

### 2.2 Race Screen with Real-Time Progress

**New file: `src/components/multiplayer/RaceScreen.tsx`**

```typescript
import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { Avatar } from '../Avatar';

interface RaceScreenProps {
  raceId: Id<"races">;
}

export function RaceScreen({ raceId }: RaceScreenProps) {
  const race = useQuery(api.races.getRaceById, { raceId });
  const progress = useQuery(api.races.getRaceProgress, { raceId });
  const updateProgress = useMutation(api.races.updateProgress);

  const [input, setInput] = useState('');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Countdown timer
  useEffect(() => {
    if (race?.status === 'countdown') {
      setCountdown(3);
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [race?.status]);

  // Start race
  useEffect(() => {
    if (race?.status === 'racing' && !startTime) {
      setStartTime(Date.now());
      inputRef.current?.focus();
    }
  }, [race?.status, startTime]);

  // Handle typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (race?.status !== 'racing') return;

    const typed = e.target.value;
    setInput(typed);

    const charactersTyped = typed.length;
    const correct = typed.split('').filter((char, i) =>
      char === race.textPassage[i]
    ).length;
    const accuracy = charactersTyped > 0
      ? Math.round((correct / charactersTyped) * 100)
      : 100;

    const elapsed = (Date.now() - (startTime || Date.now())) / 1000 / 60;
    const wpm = elapsed > 0
      ? Math.round((charactersTyped / 5) / elapsed)
      : 0;

    updateProgress({
      raceId,
      charactersTyped,
      accuracy,
      wpm,
    });
  };

  if (!race || !progress) {
    return <div>Loading race...</div>;
  }

  return (
    <div className="flex flex-col h-screen p-4">
      {/* Progress Bars */}
      <div className="mb-6 space-y-3">
        {race.participants.map((participant, index) => {
          const playerProgress = progress.find(p => p.userId === participant.userId);
          const progressPercent = playerProgress
            ? (playerProgress.charactersTyped / playerProgress.totalCharacters) * 100
            : 0;

          return (
            <div key={participant.userId} className="flex items-center gap-3">
              <Avatar avatarId={participant.avatarId} size="sm" />
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '8px',
                    color: '#eef5db'
                  }}>
                    {participant.username}
                  </span>
                  <span style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '8px',
                    color: '#ffd93d'
                  }}>
                    {playerProgress?.wpm || 0} WPM
                  </span>
                </div>
                <div className="w-full h-4 bg-[#1a1a2e] border-2 border-[#ffd93d]">
                  <div
                    className="h-full transition-all duration-100"
                    style={{
                      width: `${progressPercent}%`,
                      background: playerProgress?.finished ? '#0ead69' : '#ffd93d',
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Countdown Overlay */}
      {countdown !== null && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <p style={{
            fontFamily: "'Press Start 2P'",
            fontSize: '72px',
            color: '#ffd93d',
            animation: 'pulse 1s ease-in-out'
          }}>
            {countdown === 0 ? 'GO!' : countdown}
          </p>
        </div>
      )}

      {/* Text Passage */}
      <div className="pixel-box p-6 mb-4">
        <p style={{
          fontFamily: "'Press Start 2P'",
          fontSize: '14px',
          color: '#eef5db',
          lineHeight: '1.8'
        }}>
          {race.textPassage.split('').map((char, i) => {
            let color = '#4a4a6e'; // Untyped
            if (i < input.length) {
              color = input[i] === char ? '#0ead69' : '#ff6b9d'; // Correct/Incorrect
            }
            return <span key={i} style={{ color }}>{char}</span>;
          })}
        </p>
      </div>

      {/* Input Field */}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={handleInputChange}
        disabled={race.status !== 'racing'}
        className="pixel-input text-lg p-4"
        placeholder={race.status === 'racing' ? 'Start typing...' : 'Waiting...'}
        autoFocus
      />
    </div>
  );
}
```

### 2.3 Results Podium

**New file: `src/components/multiplayer/ResultsPodium.tsx`**

```typescript
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { Avatar } from '../Avatar';

interface ResultsPodiumProps {
  raceId: Id<"races">;
  onClose: () => void;
}

export function ResultsPodium({ raceId, onClose }: ResultsPodiumProps) {
  const results = useQuery(api.races.getRaceResults, { raceId });

  if (!results) return <div>Loading results...</div>;

  const sortedResults = [...results.results].sort((a, b) => a.placement - b.placement);

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="pixel-box p-8 max-w-2xl w-full">
        <h1 style={{
          fontFamily: "'Press Start 2P'",
          fontSize: '20px',
          color: '#ffd93d',
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          RACE RESULTS
        </h1>

        {/* Podium */}
        <div className="space-y-4 mb-8">
          {sortedResults.map((result, index) => {
            const medals = ['🥇', '🥈', '🥉', ''];
            const bgColors = ['#ffd93d', '#c0c0c0', '#cd7f32', '#4a4a6e'];

            return (
              <div
                key={result.userId}
                className="flex items-center gap-4 p-4"
                style={{
                  background: bgColors[index],
                  border: '3px solid #1a1a2e',
                }}
              >
                <span style={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: '24px',
                }}>
                  {medals[index] || `#${result.placement}`}
                </span>

                <Avatar avatarId={result.avatarId} size="md" />

                <div className="flex-1">
                  <p style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '12px',
                    color: '#1a1a2e'
                  }}>
                    {result.username}
                  </p>
                  <p style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '8px',
                    color: '#1a1a2e',
                    opacity: 0.7,
                    marginTop: '4px'
                  }}>
                    {result.wpm} WPM • {result.accuracy}% ACC
                  </p>
                </div>

                <div className="text-right">
                  <p style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '10px',
                    color: '#0ead69'
                  }}>
                    +{result.xpEarned} XP
                  </p>
                  <p style={{
                    fontFamily: "'Press Start 2P'",
                    fontSize: '10px',
                    color: '#ffd93d',
                    marginTop: '4px'
                  }}>
                    +{result.coinsEarned} coins
                  </p>
                  {results.ranked && (
                    <p style={{
                      fontFamily: "'Press Start 2P'",
                      fontSize: '8px',
                      color: result.ratingChange >= 0 ? '#0ead69' : '#ff6b9d',
                      marginTop: '4px'
                    }}>
                      {result.ratingChange >= 0 ? '+' : ''}{result.ratingChange} ELO
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="pixel-btn w-full p-4"
          style={{ background: '#0ead69' }}
        >
          <p style={{ fontFamily: "'Press Start 2P'", fontSize: '12px', color: '#fff' }}>
            RETURN TO MENU
          </p>
        </button>
      </div>
    </div>
  );
}
```

---

## Phase 3: Anti-Cheat & Edge Cases

### 3.1 Anti-Cheat Detection

**Modify: `convex/races.ts`**

Add cheat detection to `updateProgress` mutation:

```typescript
// Anti-cheat thresholds
const MAX_WPM = 200; // Physically impossible to type faster
const MIN_ACCURACY_FOR_HIGH_WPM = 85; // High speed requires high accuracy
const MAX_CHARACTERS_PER_UPDATE = 50; // Can't type 50+ chars between updates

export const updateProgress = mutation({
  args: { /* ... */ },
  handler: async (ctx, args) => {
    // ... existing code ...

    // ANTI-CHEAT CHECKS
    const suspiciousActivity = [];

    // Check 1: Impossible WPM
    if (args.wpm > MAX_WPM) {
      suspiciousActivity.push('impossible_wpm');
    }

    // Check 2: Too many characters in one update
    const charDiff = args.charactersTyped - (progress?.charactersTyped || 0);
    if (charDiff > MAX_CHARACTERS_PER_UPDATE) {
      suspiciousActivity.push('burst_typing');
    }

    // Check 3: High speed with low accuracy (bot-like)
    if (args.wpm > 120 && args.accuracy < MIN_ACCURACY_FOR_HIGH_WPM) {
      suspiciousActivity.push('speed_accuracy_mismatch');
    }

    // Log suspicious activity
    if (suspiciousActivity.length > 0) {
      await ctx.db.insert("antiCheatLogs", {
        userId: user._id,
        raceId: args.raceId,
        flags: suspiciousActivity,
        wpm: args.wpm,
        accuracy: args.accuracy,
        timestamp: Date.now(),
      });

      // For now, just log. Future: auto-disqualify or flag for review
    }

    // ... continue with update ...
  },
});
```

### 3.2 Disconnection Handling

**Modify: `convex/races.ts`**

Add heartbeat system to detect disconnections:

```typescript
// Player sends heartbeat every 2 seconds during race
export const heartbeat = mutation({
  args: { raceId: v.id("races") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return;

    const progress = await ctx.db
      .query("raceProgress")
      .withIndex("by_race_and_user", q =>
        q.eq("raceId", args.raceId).eq("userId", user._id)
      )
      .unique();

    if (progress) {
      await ctx.db.patch(progress._id, {
        lastHeartbeat: Date.now(),
      });
    }
  },
});

// Background job to check for disconnected players
export const checkDisconnections = internalMutation({
  handler: async (ctx) => {
    const activeRaces = await ctx.db
      .query("races")
      .filter(q => q.eq(q.field("status"), "racing"))
      .collect();

    for (const race of activeRaces) {
      const allProgress = await ctx.db
        .query("raceProgress")
        .withIndex("by_race", q => q.eq("raceId", race._id))
        .collect();

      const now = Date.now();
      const TIMEOUT = 10000; // 10 seconds

      for (const progress of allProgress) {
        if (progress.lastHeartbeat && now - progress.lastHeartbeat > TIMEOUT) {
          // Mark as disconnected
          await ctx.db.patch(progress._id, {
            disconnected: true,
            finished: true, // Auto-finish as DNF
          });
        }
      }
    }
  },
});

// Schedule this to run every 5 seconds (in Convex crons)
```

### 3.3 Reconnection Support

Add reconnection logic to allow players who disconnect to rejoin:

```typescript
export const reconnectToRace = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return null;

    // Find active race for user
    const activeRaces = await ctx.db
      .query("races")
      .filter(q => q.eq(q.field("status"), "racing"))
      .collect();

    for (const race of activeRaces) {
      if (race.participants.some(p => p.userId === user._id)) {
        const progress = await ctx.db
          .query("raceProgress")
          .withIndex("by_race_and_user", q =>
            q.eq("raceId", race._id).eq("userId", user._id)
          )
          .unique();

        if (progress && progress.disconnected && !progress.finished) {
          // Clear disconnected flag
          await ctx.db.patch(progress._id, {
            disconnected: false,
            lastHeartbeat: Date.now(),
          });

          return { raceId: race._id, reconnected: true };
        }
      }
    }

    return null;
  },
});
```

---

## Phase 4: Testing & Polish

### 4.1 Testing Checklist

- [ ] **Matchmaking**
  - [ ] 1v1 matchmaking works with 2 players
  - [ ] 4-player matchmaking works with 4 players
  - [ ] Queue cancellation works correctly
  - [ ] Rating ranges expand over time as expected
  - [ ] Bot backfill works in casual mode (if implemented)

- [ ] **Race Flow**
  - [ ] Countdown timer synchronizes across all clients
  - [ ] Race starts at correct time for all players
  - [ ] Progress bars update in real-time (<500ms latency)
  - [ ] Finish detection works correctly
  - [ ] Results screen displays accurate data

- [ ] **Edge Cases**
  - [ ] Player disconnects during countdown → removed from race
  - [ ] Player disconnects during race → marked as DNF
  - [ ] Player reconnects → can resume race if not finished
  - [ ] All players disconnect → race marked as abandoned
  - [ ] Single player finishes, others AFK → race completes after timeout

- [ ] **Anti-Cheat**
  - [ ] Impossible WPM flagged in logs
  - [ ] Burst typing (copy-paste) detected
  - [ ] Speed/accuracy mismatch flagged

- [ ] **UI/UX**
  - [ ] Mobile responsive layout works
  - [ ] Animations smooth on all devices
  - [ ] Keyboard shortcuts don't interfere with typing
  - [ ] Accessibility: keyboard navigation works

### 4.2 Performance Optimization

- **Convex Query Optimization**: Use indexes for all queries
- **Progress Update Throttling**: Client-side throttle updates to max 10/second
- **Reactive Subscriptions**: Unsubscribe from race queries when leaving screen
- **Image Preloading**: Preload opponent avatars during countdown

### 4.3 Polish Features

- **Sound Effects**: Type sounds, countdown beeps, victory fanfare
- **Particle Effects**: Confetti for 1st place, sparks for personal best
- **Emoji Reactions**: Players can send quick emojis during race
- **Replay System**: Save and replay top races

---

## File Structure

```
typingquest/
├── src/
│   ├── data/
│   │   └── racePassages.ts                  (new) - Race text passages
│   ├── components/
│   │   └── multiplayer/
│   │       ├── MatchmakingScreen.tsx        (new) - Queue and mode selection
│   │       ├── RaceScreen.tsx               (new) - Live race UI
│   │       ├── ResultsPodium.tsx            (new) - Results and rewards
│   │       ├── ProgressBar.tsx              (new) - Real-time progress bar
│   │       └── CountdownOverlay.tsx         (new) - 3-2-1-GO animation
│   └── hooks/
│       ├── useRaceHeartbeat.ts              (new) - Send heartbeats during race
│       └── useRaceProgress.ts               (new) - Subscribe to race progress
└── convex/
    ├── schema.ts                            (modify) - Add race tables
    ├── matchmaking.ts                       (new) - Queue and matching logic
    ├── races.ts                             (new) - Race state management
    ├── antiCheat.ts                         (new) - Cheat detection
    └── crons.ts                             (modify) - Add disconnection checker
```

---

## Implementation Order

1. **Schema Setup** - Add all new tables to Convex schema, deploy
2. **Race Passages** - Create racePassages.ts with 20-30 curated texts
3. **Matchmaking Backend** - Implement queue system, matching logic
4. **Race State Backend** - Build race lifecycle (lobby → countdown → racing → finished)
5. **Matchmaking UI** - Create mode selection and queue screen
6. **Race UI** - Build live race screen with progress bars
7. **Progress Updates** - Wire up real-time progress synchronization
8. **Results Screen** - Display podium with rewards
9. **Anti-Cheat** - Add detection for suspicious patterns
10. **Disconnection Handling** - Implement heartbeat and reconnection
11. **Testing** - Run through all test cases
12. **Polish** - Add sounds, animations, particles
13. **Mobile Optimization** - Ensure responsive design works
14. **Performance Tuning** - Optimize query subscriptions and updates

---

## Notes

- **Real-Time Infrastructure**: Convex's reactive queries provide WebSocket-like real-time updates without custom WebSocket server
- **Latency Target**: <500ms for progress updates is achievable with Convex's edge network
- **Scalability**: Convex automatically scales, no manual infrastructure management needed
- **ELO System**: Simplified K=32 ELO for initial implementation, can be refined later
- **Bot Opponents**: Optional feature for casual mode to fill empty slots after 30s wait
- **Race History**: Save all results in raceResults table for stats and replays
- **Leaderboards**: Can add separate ranked leaderboards showing top-rated players
- **Tournaments**: Future expansion could add bracket-style tournaments
- **Spectator Mode**: Allow players to watch ongoing races (future feature)
- **Custom Lobbies**: Let friends create private race rooms (future feature)
- **Race Modifiers**: Power-ups, handicaps, or special rules (future feature)
- **Mobile Considerations**: Touch typing on mobile is slower; may need separate mobile queues or handicap system
