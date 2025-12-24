# PRP-013: Friends and Social Features System

**Status**: DRAFT
**Author**: Claude + Anton
**Date**: 2025-12-25
**Priority**: MEDIUM
**Estimated Effort**: 5 phases, ~40 tasks

---

## Executive Summary

This PRP introduces a comprehensive friends and social features system to TypeBit8. Users will be able to add friends via username or invite link, view friends' online status and progress, challenge friends to typing races, compete on friends-only leaderboards, and follow friend activity through an achievement feed. All friend relationships and social data will be managed through Convex backend for real-time synchronization.

---

## Problem Statement

### Current State

1. **No Social Features**: TypeBit8 is currently a single-player experience with no friend system
2. **Global Leaderboards Only**: Users can only compete against strangers, not friends
3. **No Activity Feed**: No way to see what friends are achieving or how they're progressing
4. **Missing Motivation**: Social features drive engagement and retention in competitive games
5. **No Multiplayer**: No way to challenge or race against friends in real-time

### Impact

| Issue | User Impact |
|-------|-------------|
| No friends | Less motivation to compete and improve |
| No social comparison | Missing the fun of competing with friends |
| No activity awareness | Can't celebrate friend achievements |
| No challenges | Missing competitive multiplayer element |
| Lower retention | Social features proven to increase engagement |

### Success Criteria

- [ ] Users can add friends by username search
- [ ] Users can share invite links to add friends
- [ ] Friends list shows online/offline status in real-time
- [ ] Users can view friends' progress (level, WPM, achievements)
- [ ] Users can challenge friends to typing races
- [ ] Friends-only leaderboard shows top scores among friends
- [ ] Activity feed displays friend achievements and high scores
- [ ] All data syncs in real-time via Convex
- [ ] Friend relationships persist and sync across devices

---

## Proposed Solution

### Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  FRIENDS SYSTEM ARCHITECTURE                                                │
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│  │ Friend       │    │  Activity    │    │  Challenge   │                  │
│  │ Relationships│ +  │  Feed        │ +  │  System      │                  │
│  │ (Convex)     │    │  (Real-time) │    │  (Races)     │                  │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘                  │
│         │                   │                   │                           │
│         └───────────────────┼───────────────────┘                           │
│                             ▼                                               │
│                   ┌──────────────────┐                                      │
│                   │ Friends UI       │                                      │
│                   │ - Friends list   │                                      │
│                   │ - Leaderboard    │                                      │
│                   │ - Activity feed  │                                      │
│                   │ - Challenge modal│                                      │
│                   └──────────────────┘                                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Architecture / Design

#### 1. Friend Relationships Schema

```typescript
// convex/schema.ts additions

friendships: defineTable({
  // Bidirectional friendship (both users must accept)
  user1Id: v.id("users"),
  user2Id: v.id("users"),
  status: v.union(
    v.literal("pending"),    // One user sent request, waiting for acceptance
    v.literal("accepted"),   // Both users are friends
    v.literal("blocked")     // One user blocked the other
  ),
  initiatorId: v.id("users"), // Who sent the friend request
  createdAt: v.number(),
  acceptedAt: v.optional(v.number()),
})
  .index("by_user1", ["user1Id", "status"])
  .index("by_user2", ["user2Id", "status"])
  .index("by_users", ["user1Id", "user2Id"]);

friendRequests: defineTable({
  fromUserId: v.id("users"),
  toUserId: v.id("users"),
  status: v.union(
    v.literal("pending"),
    v.literal("accepted"),
    v.literal("rejected"),
    v.literal("cancelled")
  ),
  createdAt: v.number(),
  respondedAt: v.optional(v.number()),
})
  .index("by_recipient", ["toUserId", "status"])
  .index("by_sender", ["fromUserId", "status"]);

// Friend activity events for the feed
friendActivity: defineTable({
  userId: v.id("users"),
  username: v.string(),
  avatarId: v.optional(v.string()),
  type: v.union(
    v.literal("achievement"),
    v.literal("high_score"),
    v.literal("level_up"),
    v.literal("lesson_complete")
  ),
  data: v.any(), // Type-specific data (achievement name, score, etc.)
  timestamp: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_timestamp", ["timestamp"]);

// Real-time presence/online status
userPresence: defineTable({
  userId: v.id("users"),
  status: v.union(
    v.literal("online"),
    v.literal("away"),
    v.literal("offline")
  ),
  lastActive: v.number(),
  currentLesson: v.optional(v.number()), // What they're currently typing
})
  .index("by_user", ["userId"])
  .index("by_status", ["status"]);

// Challenge/race invitations
challenges: defineTable({
  fromUserId: v.id("users"),
  toUserId: v.id("users"),
  lessonId: v.number(),
  status: v.union(
    v.literal("pending"),
    v.literal("accepted"),
    v.literal("declined"),
    v.literal("expired"),
    v.literal("completed")
  ),
  // Results (filled after race)
  fromUserScore: v.optional(v.number()), // WPM
  toUserScore: v.optional(v.number()),   // WPM
  winnerId: v.optional(v.id("users")),
  createdAt: v.number(),
  expiresAt: v.number(),
  completedAt: v.optional(v.number()),
})
  .index("by_recipient", ["toUserId", "status"])
  .index("by_sender", ["fromUserId", "status"])
  .index("by_users", ["fromUserId", "toUserId"]);

// Invite links for adding friends
inviteLinks: defineTable({
  code: v.string(), // Random unique code (e.g., "ABC123XYZ")
  userId: v.id("users"),
  uses: v.number(), // How many times it's been used
  maxUses: v.number(), // -1 for unlimited
  expiresAt: v.optional(v.number()), // Optional expiration
  createdAt: v.number(),
})
  .index("by_code", ["code"])
  .index("by_user", ["userId"]);
```

#### 2. Convex Functions

```typescript
// convex/friends.ts

export const sendFriendRequest = mutation({
  args: { toUsername: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const fromUser = await getUserByClerkId(ctx, identity.subject);
    const toUser = await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("username"), args.toUsername))
      .unique();

    if (!toUser) throw new Error("User not found");
    if (fromUser._id === toUser._id) throw new Error("Cannot add yourself");

    // Check if request already exists
    const existingRequest = await ctx.db
      .query("friendRequests")
      .withIndex("by_sender", q =>
        q.eq("fromUserId", fromUser._id).eq("toUserId", toUser._id)
      )
      .filter(q => q.eq(q.field("status"), "pending"))
      .unique();

    if (existingRequest) throw new Error("Friend request already sent");

    // Create friend request
    await ctx.db.insert("friendRequests", {
      fromUserId: fromUser._id,
      toUserId: toUser._id,
      status: "pending",
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

export const acceptFriendRequest = mutation({
  args: { requestId: v.id("friendRequests") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await getUserByClerkId(ctx, identity.subject);
    const request = await ctx.db.get(args.requestId);

    if (!request) throw new Error("Request not found");
    if (request.toUserId !== user._id) throw new Error("Not authorized");
    if (request.status !== "pending") throw new Error("Request already responded to");

    // Update request
    await ctx.db.patch(args.requestId, {
      status: "accepted",
      respondedAt: Date.now(),
    });

    // Create friendship (normalized: user1Id < user2Id)
    const [user1Id, user2Id] = [request.fromUserId, request.toUserId].sort();

    await ctx.db.insert("friendships", {
      user1Id,
      user2Id,
      status: "accepted",
      initiatorId: request.fromUserId,
      createdAt: request.createdAt,
      acceptedAt: Date.now(),
    });

    return { success: true };
  },
});

export const getFriends = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await getUserByClerkId(ctx, identity.subject);

    // Get friendships where user is either user1 or user2
    const friendships = await ctx.db
      .query("friendships")
      .filter(q =>
        q.and(
          q.or(
            q.eq(q.field("user1Id"), user._id),
            q.eq(q.field("user2Id"), user._id)
          ),
          q.eq(q.field("status"), "accepted")
        )
      )
      .collect();

    // Get friend user details and presence
    const friends = await Promise.all(
      friendships.map(async (friendship) => {
        const friendId = friendship.user1Id === user._id
          ? friendship.user2Id
          : friendship.user1Id;

        const friendUser = await ctx.db.get(friendId);
        const presence = await ctx.db
          .query("userPresence")
          .withIndex("by_user", q => q.eq("userId", friendId))
          .unique();

        const gameState = await ctx.db
          .query("gameState")
          .withIndex("by_user", q => q.eq("userId", friendId))
          .unique();

        return {
          id: friendUser._id,
          username: friendUser.username,
          avatarId: friendUser.avatarId,
          status: presence?.status || "offline",
          lastActive: presence?.lastActive || 0,
          currentLesson: presence?.currentLesson,
          level: gameState?.level || 1,
          maxCombo: gameState?.maxCombo || 0,
        };
      })
    );

    return friends;
  },
});

export const getFriendActivity = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await getUserByClerkId(ctx, identity.subject);
    const friends = await getFriends(ctx);
    const friendIds = friends.map(f => f.id);

    // Get recent activity from friends
    const activities = await ctx.db
      .query("friendActivity")
      .withIndex("by_timestamp")
      .order("desc")
      .take(args.limit || 50);

    // Filter to only friends' activity
    return activities.filter(a => friendIds.includes(a.userId));
  },
});

export const createInviteLink = mutation({
  args: { maxUses: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await getUserByClerkId(ctx, identity.subject);

    // Generate unique code
    const code = generateInviteCode(); // 8-char alphanumeric

    await ctx.db.insert("inviteLinks", {
      code,
      userId: user._id,
      uses: 0,
      maxUses: args.maxUses || -1,
      createdAt: Date.now(),
    });

    return { code };
  },
});

export const acceptInviteLink = mutation({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await getUserByClerkId(ctx, identity.subject);

    const invite = await ctx.db
      .query("inviteLinks")
      .withIndex("by_code", q => q.eq("code", args.code))
      .unique();

    if (!invite) throw new Error("Invalid invite code");
    if (invite.userId === user._id) throw new Error("Cannot use your own invite");

    // Check if expired or max uses reached
    if (invite.expiresAt && invite.expiresAt < Date.now()) {
      throw new Error("Invite link expired");
    }
    if (invite.maxUses !== -1 && invite.uses >= invite.maxUses) {
      throw new Error("Invite link max uses reached");
    }

    // Increment uses
    await ctx.db.patch(invite._id, { uses: invite.uses + 1 });

    // Send friend request automatically
    await sendFriendRequest(ctx, { toUserId: invite.userId });

    return { success: true };
  },
});

export const sendChallenge = mutation({
  args: {
    toUserId: v.id("users"),
    lessonId: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await getUserByClerkId(ctx, identity.subject);

    // Verify friendship
    const areFriends = await checkFriendship(ctx, user._id, args.toUserId);
    if (!areFriends) throw new Error("Can only challenge friends");

    await ctx.db.insert("challenges", {
      fromUserId: user._id,
      toUserId: args.toUserId,
      lessonId: args.lessonId,
      status: "pending",
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    return { success: true };
  },
});

export const getFriendsLeaderboard = query({
  args: { lessonId: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await getUserByClerkId(ctx, identity.subject);
    const friends = await getFriends(ctx);
    const friendIds = [...friends.map(f => f.id), user._id]; // Include self

    // Get leaderboard entries for friends
    const entries = await ctx.db
      .query("leaderboard")
      .withIndex("by_lesson_score", q => q.eq("lessonId", args.lessonId))
      .order("desc")
      .collect();

    // Filter to friends only and enrich with user data
    return entries
      .filter(e => friendIds.includes(e.userId))
      .map((entry, index) => ({
        rank: index + 1,
        ...entry,
      }));
  },
});
```

#### 3. UI Components

**New file: `src/components/FriendsList.tsx`**

```typescript
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Avatar } from './Avatar';

export function FriendsList() {
  const friends = useQuery(api.friends.getFriends);
  const sendChallenge = useMutation(api.friends.sendChallenge);

  if (!friends) return <div>Loading...</div>;
  if (friends.length === 0) return <div>No friends yet. Add some!</div>;

  return (
    <div className="pixel-box p-4">
      <h2 style={{ fontFamily: "'Press Start 2P'", fontSize: '12px', marginBottom: '16px' }}>
        FRIENDS ({friends.length})
      </h2>

      <div className="space-y-3">
        {friends.map(friend => (
          <div
            key={friend.id}
            className="flex items-center justify-between p-3 bg-[#1a1a2e] rounded"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar avatarId={friend.avatarId} size="sm" />
                {/* Online status indicator */}
                <div
                  className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#1a1a2e]"
                  style={{
                    backgroundColor: friend.status === 'online' ? '#0ead69' : '#4a4a6e'
                  }}
                />
              </div>

              <div>
                <div style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#ffd93d' }}>
                  {friend.username}
                </div>
                <div style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: '#3bceac', marginTop: '2px' }}>
                  LV {friend.level} • COMBO {friend.maxCombo}
                </div>
                {friend.currentLesson && (
                  <div style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: '#ff6b9d', marginTop: '2px' }}>
                    TYPING LESSON {friend.currentLesson}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => sendChallenge({
                toUserId: friend.id,
                lessonId: 1 // TODO: lesson selection modal
              })}
              className="pixel-btn"
              style={{ fontSize: '6px', padding: '4px 8px' }}
            >
              CHALLENGE
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**New file: `src/components/AddFriend.tsx`**

```typescript
import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export function AddFriend() {
  const [username, setUsername] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const sendRequest = useMutation(api.friends.sendFriendRequest);
  const createInvite = useMutation(api.friends.createInviteLink);
  const [inviteCode, setInviteCode] = useState('');

  const handleAddByUsername = async () => {
    try {
      await sendRequest({ toUsername: username });
      setUsername('');
      alert('Friend request sent!');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleCreateInvite = async () => {
    const result = await createInvite({ maxUses: 1 });
    setInviteCode(result.code);
    setShowInvite(true);
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/invite/${inviteCode}`;
    navigator.clipboard.writeText(link);
    alert('Invite link copied!');
  };

  return (
    <div className="pixel-box p-4">
      <h3 style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', marginBottom: '12px' }}>
        ADD FRIEND
      </h3>

      {/* Add by username */}
      <div className="mb-4">
        <label style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', display: 'block', marginBottom: '4px' }}>
          USERNAME
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            className="pixel-input flex-1"
            style={{ fontSize: '8px', padding: '6px' }}
          />
          <button
            onClick={handleAddByUsername}
            className="pixel-btn"
            style={{ fontSize: '7px', padding: '6px 12px' }}
          >
            ADD
          </button>
        </div>
      </div>

      {/* Create invite link */}
      <div>
        <button
          onClick={handleCreateInvite}
          className="pixel-btn w-full"
          style={{ fontSize: '7px', padding: '8px' }}
        >
          CREATE INVITE LINK
        </button>

        {showInvite && inviteCode && (
          <div className="mt-3 p-3 bg-[#1a1a2e] rounded">
            <div style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', marginBottom: '6px' }}>
              INVITE CODE: {inviteCode}
            </div>
            <button
              onClick={copyInviteLink}
              className="pixel-btn w-full"
              style={{ fontSize: '6px', padding: '4px' }}
            >
              COPY LINK
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

**New file: `src/components/ActivityFeed.tsx`**

```typescript
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Avatar } from './Avatar';

export function ActivityFeed() {
  const activities = useQuery(api.friends.getFriendActivity, { limit: 20 });

  if (!activities) return <div>Loading...</div>;
  if (activities.length === 0) return <div>No recent activity</div>;

  return (
    <div className="pixel-box p-4">
      <h2 style={{ fontFamily: "'Press Start 2P'", fontSize: '12px', marginBottom: '16px' }}>
        FRIEND ACTIVITY
      </h2>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {activities.map((activity, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-2 bg-[#1a1a2e] rounded"
          >
            <Avatar avatarId={activity.avatarId} size="sm" />

            <div className="flex-1">
              <div style={{ fontFamily: "'Press Start 2P'", fontSize: '7px', color: '#ffd93d' }}>
                {activity.username}
              </div>
              <div style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', color: '#eef5db', marginTop: '4px' }}>
                {renderActivityMessage(activity)}
              </div>
              <div style={{ fontFamily: "'Press Start 2P'", fontSize: '5px', color: '#4a4a6e', marginTop: '4px' }}>
                {formatTimeAgo(activity.timestamp)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function renderActivityMessage(activity: any) {
  switch (activity.type) {
    case 'achievement':
      return `UNLOCKED: ${activity.data.achievementName}`;
    case 'high_score':
      return `NEW HIGH SCORE: ${activity.data.wpm} WPM on Lesson ${activity.data.lessonId}`;
    case 'level_up':
      return `REACHED LEVEL ${activity.data.level}`;
    case 'lesson_complete':
      return `COMPLETED LESSON ${activity.data.lessonId}`;
    default:
      return 'DID SOMETHING COOL';
  }
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return 'JUST NOW';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}M AGO`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}H AGO`;
  return `${Math.floor(seconds / 86400)}D AGO`;
}
```

**New file: `src/components/FriendsLeaderboard.tsx`**

```typescript
import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Avatar } from './Avatar';

export function FriendsLeaderboard() {
  const [selectedLesson, setSelectedLesson] = useState(1);
  const leaderboard = useQuery(api.friends.getFriendsLeaderboard, {
    lessonId: selectedLesson
  });

  if (!leaderboard) return <div>Loading...</div>;

  return (
    <div className="pixel-box p-4">
      <h2 style={{ fontFamily: "'Press Start 2P'", fontSize: '12px', marginBottom: '16px' }}>
        FRIENDS LEADERBOARD
      </h2>

      {/* Lesson selector */}
      <div className="mb-4">
        <label style={{ fontFamily: "'Press Start 2P'", fontSize: '6px', marginBottom: '4px', display: 'block' }}>
          LESSON
        </label>
        <select
          value={selectedLesson}
          onChange={(e) => setSelectedLesson(Number(e.target.value))}
          className="pixel-input w-full"
          style={{ fontSize: '8px', padding: '6px' }}
        >
          {Array.from({ length: 15 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              Lesson {i + 1}
            </option>
          ))}
        </select>
      </div>

      {/* Leaderboard */}
      <div className="space-y-2">
        {leaderboard.map((entry) => (
          <div
            key={entry.rank}
            className="flex items-center gap-3 p-2 bg-[#1a1a2e] rounded"
          >
            <div style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '10px',
              color: entry.rank === 1 ? '#ffd93d' : '#eef5db',
              minWidth: '24px'
            }}>
              #{entry.rank}
            </div>

            <Avatar avatarId={entry.avatarId} size="sm" />

            <div className="flex-1">
              <div style={{ fontFamily: "'Press Start 2P'", fontSize: '7px', color: '#ffd93d' }}>
                {entry.username}
              </div>
            </div>

            <div style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#3bceac' }}>
              {entry.score} WPM
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## File Structure

```
typingquest/
├── convex/
│   ├── schema.ts                  (modify) - Add friends tables
│   ├── friends.ts                 (new) - Friend management functions
│   ├── challenges.ts              (new) - Challenge/race functions
│   └── presence.ts                (new) - Online status tracking
├── src/
│   ├── components/
│   │   ├── FriendsList.tsx        (new) - Friends list with status
│   │   ├── AddFriend.tsx          (new) - Add friend UI
│   │   ├── ActivityFeed.tsx       (new) - Friend activity feed
│   │   ├── FriendsLeaderboard.tsx (new) - Friends-only leaderboard
│   │   ├── ChallengeModal.tsx     (new) - Challenge friend to race
│   │   └── FriendRequests.tsx     (new) - Pending requests UI
│   ├── hooks/
│   │   ├── useFriends.ts          (new) - Friends management hook
│   │   └── usePresence.ts         (new) - Online status hook
│   └── pages/
│       └── FriendsPage.tsx        (new) - Main friends page
└── public/
    └── invite/
        └── [code].html            (new) - Invite link landing page
```

---

## Implementation Order

### Phase 1: Database Schema & Core Backend

**Objective**: Set up Convex schema and basic friend management functions

#### Tasks
- [ ] **1.1** Update `convex/schema.ts` with friendships table
- [ ] **1.2** Update `convex/schema.ts` with friendRequests table
- [ ] **1.3** Update `convex/schema.ts` with friendActivity table
- [ ] **1.4** Update `convex/schema.ts` with userPresence table
- [ ] **1.5** Update `convex/schema.ts` with challenges table
- [ ] **1.6** Update `convex/schema.ts` with inviteLinks table
- [ ] **1.7** Create `convex/friends.ts` with sendFriendRequest mutation
- [ ] **1.8** Create acceptFriendRequest mutation
- [ ] **1.9** Create rejectFriendRequest mutation
- [ ] **1.10** Create getFriends query
- [ ] **1.11** Create getFriendRequests query (pending requests)
- [ ] **1.12** Create removeFriend mutation

#### Build Gate
```bash
npm run build
```

---

### Phase 2: Presence & Activity Tracking

**Objective**: Implement real-time online status and activity feed

#### Tasks
- [ ] **2.1** Create `convex/presence.ts` with updatePresence mutation
- [ ] **2.2** Create setOnline mutation (called on app mount)
- [ ] **2.3** Create setOffline mutation (called on app unmount)
- [ ] **2.4** Create heartbeat system to keep presence alive
- [ ] **2.5** Create `src/hooks/usePresence.ts` hook
- [ ] **2.6** Integrate presence updates in App.tsx
- [ ] **2.7** Create recordActivity mutation in friends.ts
- [ ] **2.8** Create getFriendActivity query
- [ ] **2.9** Hook activity recording into achievement unlocks
- [ ] **2.10** Hook activity recording into high scores
- [ ] **2.11** Hook activity recording into level ups

#### Build Gate
```bash
npm run build
```

---

### Phase 3: Friend Management UI

**Objective**: Build UI for adding, viewing, and managing friends

#### Tasks
- [ ] **3.1** Create `src/components/FriendsList.tsx`
- [ ] **3.2** Display friends with avatars and online status
- [ ] **3.3** Show current activity (what lesson they're on)
- [ ] **3.4** Create `src/components/AddFriend.tsx`
- [ ] **3.5** Add username search input and send request button
- [ ] **3.6** Create `convex/friends.ts` createInviteLink mutation
- [ ] **3.7** Create acceptInviteLink mutation
- [ ] **3.8** Add invite link creation UI
- [ ] **3.9** Add copy invite link button
- [ ] **3.10** Create `src/components/FriendRequests.tsx`
- [ ] **3.11** Display pending incoming requests
- [ ] **3.12** Add accept/reject buttons
- [ ] **3.13** Create `src/pages/FriendsPage.tsx` main page
- [ ] **3.14** Integrate all friend components into page
- [ ] **3.15** Add navigation to friends page from main app

#### Build Gate
```bash
npm run build
npm run dev # Test in browser
```

---

### Phase 4: Social Features (Leaderboard & Activity Feed)

**Objective**: Implement friends leaderboard and activity feed

#### Tasks
- [ ] **4.1** Create getFriendsLeaderboard query
- [ ] **4.2** Filter global leaderboard to friends only
- [ ] **4.3** Create `src/components/FriendsLeaderboard.tsx`
- [ ] **4.4** Add lesson selector dropdown
- [ ] **4.5** Display ranked friends with scores
- [ ] **4.6** Highlight current user in leaderboard
- [ ] **4.7** Create `src/components/ActivityFeed.tsx`
- [ ] **4.8** Fetch and display recent friend activity
- [ ] **4.9** Format activity messages (achievement, high score, level up)
- [ ] **4.10** Add time ago formatting
- [ ] **4.11** Integrate activity feed into friends page
- [ ] **4.12** Add real-time updates to activity feed

#### Build Gate
```bash
npm run build
npm run dev # Test in browser
```

---

### Phase 5: Challenge System

**Objective**: Allow friends to challenge each other to typing races

#### Tasks
- [ ] **5.1** Create sendChallenge mutation
- [ ] **5.2** Create acceptChallenge mutation
- [ ] **5.3** Create declineChallenge mutation
- [ ] **5.4** Create getChallenges query (pending/active)
- [ ] **5.5** Create recordChallengeResult mutation
- [ ] **5.6** Create `src/components/ChallengeModal.tsx`
- [ ] **5.7** Add lesson selection for challenge
- [ ] **5.8** Add challenge UI in friends list (button per friend)
- [ ] **5.9** Create `src/components/ChallengeNotification.tsx`
- [ ] **5.10** Display incoming challenge notifications
- [ ] **5.11** Add accept/decline actions
- [ ] **5.12** Create synchronized race mode (both users type same lesson)
- [ ] **5.13** Show live opponent progress during race
- [ ] **5.14** Display race results with winner
- [ ] **5.15** Record challenge results to database

#### Build Gate
```bash
npm run build
npm run dev # Test in browser with 2 accounts
```

---

## Final Verification

- [ ] Friend requests can be sent by username
- [ ] Friend requests can be accepted/rejected
- [ ] Invite links can be created and shared
- [ ] Invite links correctly add friendships
- [ ] Friends list shows accurate online/offline status
- [ ] Friends list updates in real-time
- [ ] Friends leaderboard shows correct rankings
- [ ] Activity feed displays friend achievements
- [ ] Challenges can be sent and accepted
- [ ] Race mode works synchronously
- [ ] All data persists correctly in Convex
- [ ] UI matches TypeBit8 retro pixel aesthetic
- [ ] No console errors
- [ ] Build succeeds: `npm run build`

---

## Notes

### Real-time Presence Strategy

Use Convex's real-time subscriptions to update presence:

1. **Heartbeat**: Client sends heartbeat every 30 seconds to update `lastActive`
2. **Auto-offline**: Server marks user offline after 2 minutes of no heartbeat
3. **Away status**: Set to away after 5 minutes of inactivity
4. **Current lesson**: Update when user starts a lesson

### Activity Feed Design

Record activity for:
- New achievements unlocked
- High scores (top 3 for any lesson)
- Level ups
- Lesson completions (first time)

**Privacy**: Users should have option to disable activity sharing in settings (future enhancement)

### Challenge System Flow

```
User A sends challenge to User B for Lesson 5
  ↓
User B receives notification
  ↓
User B accepts challenge
  ↓
Both users enter synchronized race mode
  ↓
Both type Lesson 5 simultaneously
  ↓
Results compared, winner declared
  ↓
Result recorded in challenges table
  ↓
Activity feed updated with challenge outcome
```

### Invite Links

- Generated as 8-character alphanumeric codes (A-Z, 0-9)
- Can be single-use or multi-use
- Optional expiration (default: no expiration)
- Shareable via URL: `typebit8.app/invite/ABC123XY`

### Friend Limit

Consider implementing a friend limit (e.g., 100 friends) to prevent abuse and maintain performance.

---

## Future Enhancements

- **Friend groups**: Organize friends into groups/teams
- **Private messaging**: Chat with friends in-app
- **Global vs Friends toggle**: Quick toggle on main leaderboard
- **Weekly friend challenges**: Auto-generated weekly competitions
- **Friend suggestions**: Based on similar skill level or mutual friends
- **Block/report**: Moderation tools for harassment prevention
- **Privacy settings**: Control who can see activity, send requests
- **Friend streaks**: Track consecutive days racing with friends
