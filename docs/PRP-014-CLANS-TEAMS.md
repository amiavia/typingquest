# PRP-014: Clans/Teams System

**Status**: DRAFT
**Author**: Claude + Anton
**Date**: 2025-12-25
**Priority**: MEDIUM
**Estimated Effort**: 7 phases, ~85 tasks

---

## Executive Summary

This PRP introduces a comprehensive Clans/Teams system to TypeBit8, enabling players to form communities, compete together, and collaborate in typing challenges. Players can create or join clans (max 50 members), participate in weekly clan challenges, track aggregate clan progress through levels and XP, and communicate via clan chat. The system includes clan leaderboards, customizable badges, role-based permissions (leader, officer, member), and full Convex backend integration for real-time synchronization.

---

## Problem Statement

### Current State

1. **Isolated gameplay**: Players practice typing alone without social interaction or community building.

2. **Limited engagement**: No collaborative features to encourage long-term player retention.

3. **Missing competitive layer**: Individual leaderboards exist, but no team-based competition.

4. **No social features**: Players cannot communicate, collaborate, or build relationships within the game.

### Impact

| Issue | User Impact |
|-------|-------------|
| Solo experience only | Reduced engagement, higher churn rate |
| No team competition | Missing motivational layer for competitive players |
| Lack of community | Players feel isolated, no sense of belonging |
| No collaborative goals | Missing opportunities for shared achievement |

### Success Criteria

- [ ] Players can create clans with unique names and customization
- [ ] Players can join existing clans (max 50 members per clan)
- [ ] Clan XP aggregates from all member activity automatically
- [ ] Clan levels unlock based on accumulated XP
- [ ] Global clan leaderboards rank clans by level, XP, and challenge performance
- [ ] Weekly clan challenges with participation tracking
- [ ] Real-time clan chat for member communication
- [ ] Clan badges and customization options (colors, icons, banners)
- [ ] Role-based permissions (leader, officer, member) with appropriate controls
- [ ] Convex backend handles all clan data with real-time sync
- [ ] Clan activity feeds show member achievements
- [ ] Clan statistics dashboard shows aggregate performance

---

## Proposed Solution

### Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  CLAN SYSTEM ARCHITECTURE                                                    │
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│  │  Clan        │    │  Member      │    │  Challenge   │                  │
│  │  Management  │───▶│  Activity    │───▶│  System      │                  │
│  │              │    │  Tracking    │    │              │                  │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘                  │
│         │                   │                   │                           │
│         │                   ▼                   │                           │
│         │          ┌──────────────────┐         │                           │
│         │          │  Convex Backend  │         │                           │
│         │          │  - Clans table   │         │                           │
│         │          │  - Members table │         │                           │
│         │          │  - Chat table    │         │                           │
│         │          │  - Challenges    │         │                           │
│         │          └────────┬─────────┘         │                           │
│         │                   │                   │                           │
│         └───────────────────┼───────────────────┘                           │
│                             ▼                                               │
│                   ┌──────────────────┐                                      │
│                   │  UI Components   │                                      │
│                   │  - Clan browser  │                                      │
│                   │  - Clan page     │                                      │
│                   │  - Chat panel    │                                      │
│                   │  - Leaderboards  │                                      │
│                   └──────────────────┘                                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Architecture / Design

#### 1. Convex Schema

```typescript
// convex/schema.ts

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Existing tables...

  clans: defineTable({
    name: v.string(),                    // Unique clan name
    tag: v.string(),                     // 2-5 character clan tag (e.g., "TQST")
    description: v.string(),             // Clan description
    badge: v.object({
      icon: v.string(),                  // Icon identifier
      color: v.string(),                 // Primary color (hex)
      backgroundColor: v.string(),        // Background color (hex)
    }),
    level: v.number(),                   // Current clan level
    xp: v.number(),                      // Total accumulated XP
    memberCount: v.number(),             // Current member count
    maxMembers: v.number(),              // Max members (default 50)
    isPublic: v.boolean(),               // Can anyone join?
    requiresApproval: v.boolean(),       // Join requests need approval?
    createdAt: v.number(),               // Timestamp
    createdBy: v.id("users"),            // Founder user ID
  })
    .index("by_name", ["name"])
    .index("by_tag", ["tag"])
    .index("by_level", ["level"])
    .index("by_xp", ["xp"]),

  clanMembers: defineTable({
    clanId: v.id("clans"),
    userId: v.id("users"),
    role: v.union(
      v.literal("leader"),
      v.literal("officer"),
      v.literal("member")
    ),
    joinedAt: v.number(),                // Timestamp
    xpContributed: v.number(),           // Total XP contributed to clan
    lastActive: v.number(),              // Last activity timestamp
  })
    .index("by_clan", ["clanId"])
    .index("by_user", ["userId"])
    .index("by_clan_and_user", ["clanId", "userId"]),

  clanJoinRequests: defineTable({
    clanId: v.id("clans"),
    userId: v.id("users"),
    message: v.string(),                 // Optional join message
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    createdAt: v.number(),
    reviewedAt: v.optional(v.number()),
    reviewedBy: v.optional(v.id("users")),
  })
    .index("by_clan", ["clanId"])
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  clanChat: defineTable({
    clanId: v.id("clans"),
    userId: v.id("users"),
    message: v.string(),
    timestamp: v.number(),
    edited: v.optional(v.boolean()),
    editedAt: v.optional(v.number()),
  })
    .index("by_clan", ["clanId"])
    .index("by_clan_and_time", ["clanId", "timestamp"]),

  clanChallenges: defineTable({
    clanId: v.id("clans"),
    type: v.union(
      v.literal("total_xp"),             // Earn X total XP as clan
      v.literal("lessons_completed"),    // Complete X lessons
      v.literal("average_wpm"),          // Achieve X average WPM
      v.literal("active_members"),       // Have X members active
    ),
    targetValue: v.number(),             // Goal to achieve
    currentValue: v.number(),            // Current progress
    startDate: v.number(),               // Week start timestamp
    endDate: v.number(),                 // Week end timestamp
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("failed")
    ),
    reward: v.object({
      xp: v.number(),
      badge: v.optional(v.string()),
    }),
  })
    .index("by_clan", ["clanId"])
    .index("by_status", ["status"])
    .index("by_dates", ["startDate", "endDate"]),

  clanActivity: defineTable({
    clanId: v.id("clans"),
    userId: v.id("users"),
    type: v.union(
      v.literal("member_joined"),
      v.literal("member_left"),
      v.literal("role_changed"),
      v.literal("lesson_completed"),
      v.literal("challenge_completed"),
      v.literal("level_up"),
      v.literal("achievement_earned"),
    ),
    description: v.string(),             // Localized description key
    metadata: v.optional(v.any()),       // Additional data
    timestamp: v.number(),
  })
    .index("by_clan", ["clanId"])
    .index("by_clan_and_time", ["clanId", "timestamp"]),
});
```

#### 2. Convex Mutations & Queries

```typescript
// convex/clans.ts

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new clan
export const create = mutation({
  args: {
    name: v.string(),
    tag: v.string(),
    description: v.string(),
    badge: v.object({
      icon: v.string(),
      color: v.string(),
      backgroundColor: v.string(),
    }),
    isPublic: v.boolean(),
    requiresApproval: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity();
    if (!userId) throw new Error("Not authenticated");

    // Validate name uniqueness
    const existing = await ctx.db
      .query("clans")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (existing) {
      throw new Error("Clan name already taken");
    }

    // Validate tag uniqueness and format
    if (args.tag.length < 2 || args.tag.length > 5) {
      throw new Error("Tag must be 2-5 characters");
    }

    const existingTag = await ctx.db
      .query("clans")
      .withIndex("by_tag", (q) => q.eq("tag", args.tag))
      .first();

    if (existingTag) {
      throw new Error("Clan tag already taken");
    }

    // Create clan
    const clanId = await ctx.db.insert("clans", {
      ...args,
      level: 1,
      xp: 0,
      memberCount: 1,
      maxMembers: 50,
      createdAt: Date.now(),
      createdBy: userId.subject,
    });

    // Add creator as leader
    await ctx.db.insert("clanMembers", {
      clanId,
      userId: userId.subject,
      role: "leader",
      joinedAt: Date.now(),
      xpContributed: 0,
      lastActive: Date.now(),
    });

    // Log activity
    await ctx.db.insert("clanActivity", {
      clanId,
      userId: userId.subject,
      type: "member_joined",
      description: "clan.activity.created",
      timestamp: Date.now(),
    });

    return clanId;
  },
});

// Join a clan
export const join = mutation({
  args: {
    clanId: v.id("clans"),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity();
    if (!userId) throw new Error("Not authenticated");

    const clan = await ctx.db.get(args.clanId);
    if (!clan) throw new Error("Clan not found");

    // Check if already member
    const existing = await ctx.db
      .query("clanMembers")
      .withIndex("by_clan_and_user", (q) =>
        q.eq("clanId", args.clanId).eq("userId", userId.subject)
      )
      .first();

    if (existing) {
      throw new Error("Already a member");
    }

    // Check member limit
    if (clan.memberCount >= clan.maxMembers) {
      throw new Error("Clan is full");
    }

    if (clan.requiresApproval) {
      // Create join request
      await ctx.db.insert("clanJoinRequests", {
        clanId: args.clanId,
        userId: userId.subject,
        message: args.message || "",
        status: "pending",
        createdAt: Date.now(),
      });
      return { status: "pending" };
    } else {
      // Immediately join
      await ctx.db.insert("clanMembers", {
        clanId: args.clanId,
        userId: userId.subject,
        role: "member",
        joinedAt: Date.now(),
        xpContributed: 0,
        lastActive: Date.now(),
      });

      // Update member count
      await ctx.db.patch(args.clanId, {
        memberCount: clan.memberCount + 1,
      });

      // Log activity
      await ctx.db.insert("clanActivity", {
        clanId: args.clanId,
        userId: userId.subject,
        type: "member_joined",
        description: "clan.activity.joined",
        timestamp: Date.now(),
      });

      return { status: "joined" };
    }
  },
});

// Get clan details
export const get = query({
  args: { clanId: v.id("clans") },
  handler: async (ctx, args) => {
    const clan = await ctx.db.get(args.clanId);
    if (!clan) return null;

    // Get member list
    const members = await ctx.db
      .query("clanMembers")
      .withIndex("by_clan", (q) => q.eq("clanId", args.clanId))
      .collect();

    // Get user details for each member
    const memberDetails = await Promise.all(
      members.map(async (member) => {
        const user = await ctx.db.get(member.userId);
        return {
          ...member,
          username: user?.username,
          avatar: user?.avatar,
        };
      })
    );

    return {
      ...clan,
      members: memberDetails,
    };
  },
});

// List all public clans
export const list = query({
  args: {
    limit: v.optional(v.number()),
    sortBy: v.optional(v.union(v.literal("level"), v.literal("members"), v.literal("recent"))),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    let clans = await ctx.db.query("clans").collect();

    // Filter public clans
    clans = clans.filter((clan) => clan.isPublic);

    // Sort
    if (args.sortBy === "level") {
      clans.sort((a, b) => b.level - a.level || b.xp - a.xp);
    } else if (args.sortBy === "members") {
      clans.sort((a, b) => b.memberCount - a.memberCount);
    } else {
      clans.sort((a, b) => b.createdAt - a.createdAt);
    }

    return clans.slice(0, limit);
  },
});

// Add XP to clan (called when member completes lesson)
export const addXP = mutation({
  args: {
    clanId: v.id("clans"),
    xpAmount: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity();
    if (!userId) throw new Error("Not authenticated");

    const clan = await ctx.db.get(args.clanId);
    if (!clan) throw new Error("Clan not found");

    // Verify membership
    const member = await ctx.db
      .query("clanMembers")
      .withIndex("by_clan_and_user", (q) =>
        q.eq("clanId", args.clanId).eq("userId", userId.subject)
      )
      .first();

    if (!member) throw new Error("Not a clan member");

    const newXP = clan.xp + args.xpAmount;
    const newLevel = calculateClanLevel(newXP);
    const leveledUp = newLevel > clan.level;

    // Update clan XP and level
    await ctx.db.patch(args.clanId, {
      xp: newXP,
      level: newLevel,
    });

    // Update member contribution
    await ctx.db.patch(member._id, {
      xpContributed: member.xpContributed + args.xpAmount,
      lastActive: Date.now(),
    });

    // Log level up if applicable
    if (leveledUp) {
      await ctx.db.insert("clanActivity", {
        clanId: args.clanId,
        userId: userId.subject,
        type: "level_up",
        description: "clan.activity.level_up",
        metadata: { newLevel },
        timestamp: Date.now(),
      });
    }

    return { newXP, newLevel, leveledUp };
  },
});

// Helper function to calculate clan level from XP
function calculateClanLevel(xp: number): number {
  // XP required per level: 1000, 2500, 5000, 10000, 20000, ...
  // Formula: level N requires (N * 1000) + ((N-1) * 500) total XP
  let level = 1;
  let requiredXP = 0;

  while (xp >= requiredXP) {
    level++;
    requiredXP += level * 1000 + (level - 1) * 500;
  }

  return Math.max(1, level - 1);
}
```

#### 3. React Components

```typescript
// src/components/Clan/ClanBrowser.tsx

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ClanCard } from "./ClanCard";

export function ClanBrowser() {
  const clans = useQuery(api.clans.list, { sortBy: "level", limit: 50 });
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "open" | "recruiting">("all");

  if (!clans) return <div>Loading clans...</div>;

  const filteredClans = clans
    .filter((clan) => {
      if (searchQuery) {
        return (
          clan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          clan.tag.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      return true;
    })
    .filter((clan) => {
      if (filter === "open") return !clan.requiresApproval;
      if (filter === "recruiting") return clan.memberCount < clan.maxMembers;
      return true;
    });

  return (
    <div className="clan-browser">
      <div className="browser-header">
        <h2>Clans</h2>
        <input
          type="text"
          placeholder="Search clans..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="filter-buttons">
          <button onClick={() => setFilter("all")}>All</button>
          <button onClick={() => setFilter("open")}>Open</button>
          <button onClick={() => setFilter("recruiting")}>Recruiting</button>
        </div>
      </div>

      <div className="clan-grid">
        {filteredClans.map((clan) => (
          <ClanCard key={clan._id} clan={clan} />
        ))}
      </div>
    </div>
  );
}
```

```typescript
// src/components/Clan/ClanPage.tsx

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ClanChat } from "./ClanChat";
import { ClanMembers } from "./ClanMembers";
import { ClanChallenges } from "./ClanChallenges";
import { ClanActivity } from "./ClanActivity";

export function ClanPage({ clanId }: { clanId: Id<"clans"> }) {
  const clan = useQuery(api.clans.get, { clanId });
  const [activeTab, setActiveTab] = useState<"overview" | "members" | "chat" | "challenges">("overview");

  if (!clan) return <div>Loading...</div>;

  return (
    <div className="clan-page">
      <div className="clan-header">
        <div className="clan-badge" style={{
          backgroundColor: clan.badge.backgroundColor,
          color: clan.badge.color,
        }}>
          <span className="badge-icon">{clan.badge.icon}</span>
        </div>
        <div className="clan-info">
          <h1>[{clan.tag}] {clan.name}</h1>
          <p>{clan.description}</p>
          <div className="clan-stats">
            <span>Level {clan.level}</span>
            <span>{clan.memberCount}/{clan.maxMembers} members</span>
            <span>{clan.xp.toLocaleString()} XP</span>
          </div>
        </div>
      </div>

      <div className="clan-tabs">
        <button onClick={() => setActiveTab("overview")}>Overview</button>
        <button onClick={() => setActiveTab("members")}>Members</button>
        <button onClick={() => setActiveTab("chat")}>Chat</button>
        <button onClick={() => setActiveTab("challenges")}>Challenges</button>
      </div>

      <div className="clan-content">
        {activeTab === "overview" && <ClanActivity clanId={clanId} />}
        {activeTab === "members" && <ClanMembers members={clan.members} />}
        {activeTab === "chat" && <ClanChat clanId={clanId} />}
        {activeTab === "challenges" && <ClanChallenges clanId={clanId} />}
      </div>
    </div>
  );
}
```

```typescript
// src/components/Clan/ClanChat.tsx

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";

export function ClanChat({ clanId }: { clanId: Id<"clans"> }) {
  const messages = useQuery(api.clanChat.list, { clanId, limit: 100 });
  const sendMessage = useMutation(api.clanChat.send);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;
    await sendMessage({ clanId, message: input });
    setInput("");
  };

  return (
    <div className="clan-chat">
      <div className="chat-messages">
        {messages?.map((msg) => (
          <div key={msg._id} className="chat-message">
            <span className="message-author">{msg.username}</span>
            <span className="message-time">{formatTime(msg.timestamp)}</span>
            <p className="message-content">{msg.message}</p>
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
```

#### 4. Clan Levels & XP System

```typescript
// src/utils/clanLevels.ts

export interface ClanLevel {
  level: number;
  requiredXP: number;
  cumulativeXP: number;
  benefits: string[];
}

export const CLAN_LEVELS: ClanLevel[] = [
  {
    level: 1,
    requiredXP: 0,
    cumulativeXP: 0,
    benefits: ["Clan chat", "Basic badge customization"],
  },
  {
    level: 2,
    requiredXP: 1000,
    cumulativeXP: 1000,
    benefits: ["Weekly challenges unlocked"],
  },
  {
    level: 3,
    requiredXP: 2500,
    cumulativeXP: 3500,
    benefits: ["Officer role unlocked", "Advanced badge options"],
  },
  {
    level: 5,
    requiredXP: 5000,
    cumulativeXP: 8500,
    benefits: ["Clan announcements", "Custom clan banner"],
  },
  {
    level: 10,
    requiredXP: 15000,
    cumulativeXP: 23500,
    benefits: ["Clan achievements", "Special badge effects"],
  },
  {
    level: 20,
    requiredXP: 50000,
    cumulativeXP: 73500,
    benefits: ["Legendary clan status", "Exclusive challenges"],
  },
];

export function getClanLevel(xp: number): number {
  let level = 1;
  for (const levelData of CLAN_LEVELS) {
    if (xp >= levelData.cumulativeXP) {
      level = levelData.level;
    } else {
      break;
    }
  }
  return level;
}

export function getXPForNextLevel(currentXP: number): number {
  const currentLevel = getClanLevel(currentXP);
  const nextLevel = CLAN_LEVELS.find((l) => l.level > currentLevel);
  return nextLevel ? nextLevel.cumulativeXP - currentXP : 0;
}

export function getLevelProgress(xp: number): number {
  const currentLevel = getClanLevel(xp);
  const currentLevelData = CLAN_LEVELS.find((l) => l.level === currentLevel);
  const nextLevelData = CLAN_LEVELS.find((l) => l.level === currentLevel + 1);

  if (!currentLevelData || !nextLevelData) return 100;

  const xpIntoLevel = xp - currentLevelData.cumulativeXP;
  const xpNeededForLevel = nextLevelData.cumulativeXP - currentLevelData.cumulativeXP;

  return (xpIntoLevel / xpNeededForLevel) * 100;
}
```

#### 5. Weekly Clan Challenges

```typescript
// convex/clanChallenges.ts

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Generate weekly challenges for a clan
export const generateWeeklyChallenges = mutation({
  args: { clanId: v.id("clans") },
  handler: async (ctx, args) => {
    const clan = await ctx.db.get(args.clanId);
    if (!clan) throw new Error("Clan not found");

    const now = Date.now();
    const weekStart = getWeekStart(now);
    const weekEnd = getWeekEnd(now);

    // Check if challenges already exist for this week
    const existing = await ctx.db
      .query("clanChallenges")
      .withIndex("by_clan", (q) => q.eq("clanId", args.clanId))
      .filter((q) =>
        q.and(
          q.gte(q.field("startDate"), weekStart),
          q.lte(q.field("endDate"), weekEnd)
        )
      )
      .collect();

    if (existing.length > 0) {
      return { status: "exists", challenges: existing };
    }

    // Generate 3 random challenges scaled to clan level
    const challengeTemplates = getChallengeTemplates(clan.level);
    const selectedChallenges = shuffleArray(challengeTemplates).slice(0, 3);

    const challengeIds = await Promise.all(
      selectedChallenges.map((template) =>
        ctx.db.insert("clanChallenges", {
          clanId: args.clanId,
          type: template.type,
          targetValue: template.targetValue,
          currentValue: 0,
          startDate: weekStart,
          endDate: weekEnd,
          status: "active",
          reward: template.reward,
        })
      )
    );

    return { status: "created", challengeIds };
  },
});

function getWeekStart(timestamp: number): number {
  const date = new Date(timestamp);
  const day = date.getDay();
  const diff = date.getDate() - day;
  const weekStart = new Date(date.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  return weekStart.getTime();
}

function getWeekEnd(timestamp: number): number {
  const weekStart = getWeekStart(timestamp);
  return weekStart + 7 * 24 * 60 * 60 * 1000 - 1;
}

interface ChallengeTemplate {
  type: "total_xp" | "lessons_completed" | "average_wpm" | "active_members";
  targetValue: number;
  reward: { xp: number; badge?: string };
}

function getChallengeTemplates(clanLevel: number): ChallengeTemplate[] {
  const baseXP = clanLevel * 1000;
  const baseLessons = clanLevel * 10;
  const baseWPM = 40 + clanLevel * 2;
  const baseActive = Math.min(5 + clanLevel, 20);

  return [
    {
      type: "total_xp",
      targetValue: baseXP,
      reward: { xp: baseXP * 0.2 },
    },
    {
      type: "lessons_completed",
      targetValue: baseLessons,
      reward: { xp: baseXP * 0.15 },
    },
    {
      type: "average_wpm",
      targetValue: baseWPM,
      reward: { xp: baseXP * 0.25 },
    },
    {
      type: "active_members",
      targetValue: baseActive,
      reward: { xp: baseXP * 0.3, badge: "team_player" },
    },
  ];
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
```

### Files to Modify

| File | Action | Description |
|------|--------|-------------|
| `convex/schema.ts` | MODIFY | Add clan tables (clans, clanMembers, clanJoinRequests, clanChat, clanChallenges, clanActivity) |
| `convex/clans.ts` | CREATE | Clan management mutations and queries |
| `convex/clanChat.ts` | CREATE | Chat mutations and queries |
| `convex/clanChallenges.ts` | CREATE | Challenge generation and tracking |
| `src/components/Clan/ClanBrowser.tsx` | CREATE | Browse and search clans |
| `src/components/Clan/ClanCard.tsx` | CREATE | Clan preview card component |
| `src/components/Clan/ClanPage.tsx` | CREATE | Main clan page with tabs |
| `src/components/Clan/ClanCreator.tsx` | CREATE | Create new clan form |
| `src/components/Clan/ClanChat.tsx` | CREATE | Real-time clan chat |
| `src/components/Clan/ClanMembers.tsx` | CREATE | Member list with roles |
| `src/components/Clan/ClanChallenges.tsx` | CREATE | Weekly challenges display |
| `src/components/Clan/ClanActivity.tsx` | CREATE | Activity feed |
| `src/components/Clan/ClanLeaderboard.tsx` | CREATE | Global clan leaderboard |
| `src/components/Clan/ClanSettings.tsx` | CREATE | Clan settings (leader/officer only) |
| `src/components/Clan/BadgeCustomizer.tsx` | CREATE | Badge icon/color picker |
| `src/utils/clanLevels.ts` | CREATE | Clan level calculations |
| `src/hooks/useClan.ts` | CREATE | Clan data hooks |
| `src/hooks/useClanChat.ts` | CREATE | Chat hooks with real-time updates |
| `src/types/clan.ts` | CREATE | Clan type definitions |
| `src/App.tsx` | MODIFY | Add clan routes |
| `src/components/Nav.tsx` | MODIFY | Add clan navigation link |
| `src/i18n/locales/en.json` | MODIFY | Add clan-related translations |

---

## Documentation Requirements

### Documentation Checklist
- [ ] **D.1** Create README section for clans system
- [ ] **D.2** Document clan roles and permissions
- [ ] **D.3** Document clan challenge types
- [ ] **D.4** Add changelog entry for clans feature

### README Updates
| File | Action | Scope |
|------|--------|-------|
| `README.md` | UPDATE | Add clans/teams section |
| `docs/CLANS-GUIDE.md` | CREATE | User guide for clan features |

---

## Pre-Flight Checks

> **MANDATORY**: These checks MUST pass before starting implementation.

- [ ] `npm install` succeeds
- [ ] `npm run build` succeeds (baseline)
- [ ] `npm run dev` runs without errors
- [ ] Convex is configured and connected
- [ ] User authentication is working
- [ ] No TypeScript errors in codebase

---

## Implementation Tasks

### Phase 1: Convex Schema & Core Mutations

**Objective**: Set up database schema and core clan management functions.

#### Tasks
- [ ] **1.1** Update `convex/schema.ts` to add `clans` table with all fields
- [ ] **1.2** Add `clanMembers` table with indexes
- [ ] **1.3** Add `clanJoinRequests` table
- [ ] **1.4** Add `clanChat` table with timestamp index
- [ ] **1.5** Add `clanChallenges` table
- [ ] **1.6** Add `clanActivity` table for activity feed
- [ ] **1.7** Create `convex/clans.ts` with `create` mutation
- [ ] **1.8** Implement clan name and tag validation (uniqueness, length)
- [ ] **1.9** Implement `join` mutation with approval logic
- [ ] **1.10** Implement `leave` mutation
- [ ] **1.11** Implement `get` query to fetch clan details with members
- [ ] **1.12** Implement `list` query with sorting options
- [ ] **1.13** Implement `addXP` mutation with level calculation
- [ ] **1.14** Test mutations with Convex dashboard

#### Build Gate
```bash
npm run build
npm run dev
# Verify Convex functions in dashboard
```

#### Phase Completion
```
<promise>PRP-014 PHASE 1 COMPLETE</promise>
```

---

### Phase 2: Clan Management UI

**Objective**: Create UI for browsing, creating, and joining clans.

#### Tasks
- [ ] **2.1** Create `src/types/clan.ts` with TypeScript interfaces
- [ ] **2.2** Create `src/hooks/useClan.ts` for clan data fetching
- [ ] **2.3** Create `src/components/Clan/ClanBrowser.tsx` with search and filters
- [ ] **2.4** Create `src/components/Clan/ClanCard.tsx` for clan previews
- [ ] **2.5** Add clan badge display with icon and colors
- [ ] **2.6** Create `src/components/Clan/ClanCreator.tsx` form
- [ ] **2.7** Add clan name validation (3-30 chars, unique)
- [ ] **2.8** Add clan tag validation (2-5 chars, unique, uppercase)
- [ ] **2.9** Create `src/components/Clan/BadgeCustomizer.tsx` with icon picker
- [ ] **2.10** Add color picker for badge colors (20+ preset colors)
- [ ] **2.11** Add "Join Clan" button with approval flow
- [ ] **2.12** Add "Create Clan" modal dialog
- [ ] **2.13** Create `src/components/Clan/ClanPage.tsx` main page
- [ ] **2.14** Add clan header with badge, name, stats
- [ ] **2.15** Add tab navigation (Overview, Members, Chat, Challenges)
- [ ] **2.16** Style clan components with consistent theme
- [ ] **2.17** Add loading states and error handling
- [ ] **2.18** Add clan routes to `src/App.tsx`

#### Build Gate
```bash
npm run build
npm run dev
# Test: Create clan, browse clans, join clan
```

#### Phase Completion
```
<promise>PRP-014 PHASE 2 COMPLETE</promise>
```

---

### Phase 3: Member Management & Roles

**Objective**: Implement clan member management and role-based permissions.

#### Tasks
- [ ] **3.1** Create `convex/clanMembers.ts` with role management mutations
- [ ] **3.2** Implement `updateRole` mutation (leader/officer only)
- [ ] **3.3** Implement `removeMember` mutation (leader/officer only)
- [ ] **3.4** Implement `approveJoinRequest` mutation
- [ ] **3.5** Implement `rejectJoinRequest` mutation
- [ ] **3.6** Create `src/components/Clan/ClanMembers.tsx` member list
- [ ] **3.7** Display member role badges (leader, officer, member)
- [ ] **3.8** Sort members by role, then XP contribution
- [ ] **3.9** Add member action menu (promote, demote, kick)
- [ ] **3.10** Implement permission checks (only leader can promote to officer)
- [ ] **3.11** Show member stats (XP contributed, join date, last active)
- [ ] **3.12** Create `src/components/Clan/JoinRequests.tsx` for pending requests
- [ ] **3.13** Add approve/reject buttons for join requests
- [ ] **3.14** Add "Leave Clan" button for members
- [ ] **3.15** Add confirmation dialog for destructive actions
- [ ] **3.16** Update member count on join/leave
- [ ] **3.17** Test role-based UI visibility

#### Build Gate
```bash
npm run build
npm run dev
# Test: Promote member, kick member, approve join request
```

#### Phase Completion
```
<promise>PRP-014 PHASE 3 COMPLETE</promise>
```

---

### Phase 4: Clan Chat System

**Objective**: Implement real-time clan chat with Convex.

#### Tasks
- [ ] **4.1** Create `convex/clanChat.ts` with chat mutations
- [ ] **4.2** Implement `send` mutation to post messages
- [ ] **4.3** Implement `list` query with pagination (last 100 messages)
- [ ] **4.4** Implement `edit` mutation (user can edit own messages)
- [ ] **4.5** Implement `delete` mutation (leader/officer can delete any)
- [ ] **4.6** Create `src/hooks/useClanChat.ts` for real-time chat
- [ ] **4.7** Create `src/components/Clan/ClanChat.tsx` chat UI
- [ ] **4.8** Display messages with username, timestamp, content
- [ ] **4.9** Add message input with send button
- [ ] **4.10** Support Enter key to send messages
- [ ] **4.11** Auto-scroll to bottom on new messages
- [ ] **4.12** Show "edited" indicator for edited messages
- [ ] **4.13** Add message actions menu (edit, delete)
- [ ] **4.14** Implement rate limiting (max 10 messages per minute)
- [ ] **4.15** Add profanity filter or content moderation hooks
- [ ] **4.16** Display user avatars next to messages
- [ ] **4.17** Add typing indicators (optional enhancement)
- [ ] **4.18** Test real-time updates across multiple browser tabs

#### Build Gate
```bash
npm run build
npm run dev
# Test: Send messages, edit messages, real-time sync
```

#### Phase Completion
```
<promise>PRP-014 PHASE 4 COMPLETE</promise>
```

---

### Phase 5: Clan Levels & XP Tracking

**Objective**: Implement clan leveling system and XP aggregation.

#### Tasks
- [ ] **5.1** Create `src/utils/clanLevels.ts` with level definitions
- [ ] **5.2** Define XP requirements for levels 1-20
- [ ] **5.3** Implement `getClanLevel()` function
- [ ] **5.4** Implement `getXPForNextLevel()` function
- [ ] **5.5** Implement `getLevelProgress()` for progress bar
- [ ] **5.6** Update `convex/clans.ts` `addXP` mutation
- [ ] **5.7** Hook into lesson completion to call `addXP`
- [ ] **5.8** Track individual member XP contributions
- [ ] **5.9** Create level-up activity feed entries
- [ ] **5.10** Create `src/components/Clan/ClanLevelProgress.tsx`
- [ ] **5.11** Display current level, XP bar, next level
- [ ] **5.12** Show level-up animations
- [ ] **5.13** Display unlocked benefits per level
- [ ] **5.14** Create `src/components/Clan/MemberContributions.tsx`
- [ ] **5.15** Show top contributors leaderboard within clan
- [ ] **5.16** Add XP gain notifications
- [ ] **5.17** Test XP accumulation from multiple members

#### Build Gate
```bash
npm run build
npm run dev
# Test: Complete lessons, verify XP increases, level up
```

#### Phase Completion
```
<promise>PRP-014 PHASE 5 COMPLETE</promise>
```

---

### Phase 6: Weekly Clan Challenges

**Objective**: Implement weekly challenges system.

#### Tasks
- [ ] **6.1** Create `convex/clanChallenges.ts` with challenge logic
- [ ] **6.2** Implement `generateWeeklyChallenges` mutation
- [ ] **6.3** Define challenge types (total_xp, lessons_completed, average_wpm, active_members)
- [ ] **6.4** Scale challenge difficulty by clan level
- [ ] **6.5** Implement `updateChallengeProgress` mutation
- [ ] **6.6** Implement `listActiveChallenges` query
- [ ] **6.7** Create automatic challenge generation on week rollover
- [ ] **6.8** Create `src/components/Clan/ClanChallenges.tsx`
- [ ] **6.9** Display active weekly challenges
- [ ] **6.10** Show progress bars for each challenge
- [ ] **6.11** Display rewards (XP, badges)
- [ ] **6.12** Show challenge completion status
- [ ] **6.13** Add challenge history view (past weeks)
- [ ] **6.14** Implement challenge completion notifications
- [ ] **6.15** Award challenge rewards to clan XP
- [ ] **6.16** Add badge awards to clan profile
- [ ] **6.17** Test challenge progress tracking
- [ ] **6.18** Test weekly challenge reset

#### Build Gate
```bash
npm run build
npm run dev
# Test: Generate challenges, track progress, complete challenge
```

#### Phase Completion
```
<promise>PRP-014 PHASE 6 COMPLETE</promise>
```

---

### Phase 7: Leaderboards & Activity Feed

**Objective**: Create global clan leaderboard and activity tracking.

#### Tasks
- [ ] **7.1** Create `convex/clanLeaderboard.ts` with ranking queries
- [ ] **7.2** Implement `getTopClansByLevel` query
- [ ] **7.3** Implement `getTopClansByXP` query
- [ ] **7.4** Implement `getTopClansByMembers` query
- [ ] **7.5** Create `src/components/Clan/ClanLeaderboard.tsx`
- [ ] **7.6** Display top 100 clans with ranking
- [ ] **7.7** Add sorting tabs (Level, XP, Members, Challenges)
- [ ] **7.8** Highlight user's clan in leaderboard
- [ ] **7.9** Create `src/components/Clan/ClanActivity.tsx`
- [ ] **7.10** Display recent clan activity feed
- [ ] **7.11** Show member joins, level ups, challenge completions
- [ ] **7.12** Add timestamps to activity items
- [ ] **7.13** Implement activity pagination (load more)
- [ ] **7.14** Create `convex/clanActivity.ts` with activity logging
- [ ] **7.15** Log all significant clan events automatically
- [ ] **7.16** Add activity filters (all, members, challenges, achievements)
- [ ] **7.17** Style activity feed items with icons
- [ ] **7.18** Test leaderboard updates in real-time

#### Build Gate
```bash
npm run build
npm run dev
# Test: View leaderboard, check activity feed
```

#### Phase Completion
```
<promise>PRP-014 PHASE 7 COMPLETE</promise>
```

---

## Final Verification

- [ ] All phase promises output (Phases 1-7)
- [ ] `npm run build` passes
- [ ] `npm run dev` runs without errors
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] Can create clan
- [ ] Can join clan
- [ ] Can promote/demote members
- [ ] Chat works in real-time
- [ ] XP accumulates correctly
- [ ] Levels up correctly
- [ ] Challenges generate and track progress
- [ ] Leaderboard displays top clans
- [ ] Activity feed shows recent events
- [ ] Code follows project patterns
- [ ] Changes committed with descriptive message

---

## Final Completion

When ALL of the above are complete:
```
<promise>PRP-014 COMPLETE</promise>
```

---

## Rollback Plan

```bash
# If issues discovered after deployment:

# 1. Revert Convex schema changes
# - Remove clan tables from schema
# - Redeploy clean schema

# 2. Revert UI changes
git revert HEAD~N  # revert commits from this PRP

# 3. User data: Clan data isolated in separate tables
# - No impact on existing user progress
# - Can safely delete clan tables if needed
```

---

## Open Questions & Decisions

### Q1: Should clan membership be exclusive?

**Options:**
- A) Users can only be in one clan at a time
- B) Users can be in multiple clans (e.g., one per game mode)

**Recommendation:** Option A - clearer identity, simpler implementation

### Q2: How to handle inactive clans?

**Options:**
- A) Auto-disband clans with no activity for 60 days
- B) Mark as inactive but preserve data
- C) No automatic cleanup

**Recommendation:** Option B - preserve history, show inactive badge

### Q3: Should there be clan wars or inter-clan competitions?

**Options:**
- A) Future feature: clan vs clan tournaments
- B) Out of scope for v1
- C) Implement basic challenge matchmaking

**Recommendation:** Option B for v1, design for extensibility

---

## Notes

### Badge Icon Options
Use emoji or icon library for clan badges:
- Sports: ⚽ 🏀 🎮 🎯 🏆
- Animals: 🦁 🐺 🦅 🐉 🐻
- Symbols: ⭐ 🔥 ⚡ 💎 👑
- Objects: 🛡️ ⚔️ 🎪 🎨 🚀

### Color Palette (20 preset colors)
- Red: #FF4444
- Blue: #4444FF
- Green: #44FF44
- Purple: #AA44FF
- Orange: #FF8844
- Pink: #FF44AA
- Yellow: #FFFF44
- Cyan: #44FFFF
- ... (12 more)

### Challenge Types Detail
1. **Total XP**: Clan earns X total XP this week
2. **Lessons Completed**: Members complete X lessons combined
3. **Average WPM**: Maintain X average WPM across all members
4. **Active Members**: Have X members complete at least 1 lesson

---

## References

- Convex documentation: https://docs.convex.dev/
- Current authentication: `convex/auth.ts`
- Current user schema: `convex/schema.ts`
- React Convex hooks: https://docs.convex.dev/client/react

---

## Changelog

| Date | Author | Changes |
|------|--------|---------|
| 2025-12-25 | Claude + Anton | Initial draft |

---
