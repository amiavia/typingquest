# PRP-029: Nickname Privacy System

**Status**: DRAFT
**Author**: Claude + Anton
**Date**: 2025-12-25
**Priority**: HIGH (Privacy/Security)
**Dependencies**: None

---

## Executive Summary

This PRP defines a nickname system that protects user privacy by never exposing email addresses publicly. Users can set a custom nickname, or the system assigns a randomized gaming-themed nickname automatically. Emails are only visible in the user's own profile settings.

---

## Problem Statement

### Current Issues
1. **Email Exposure**: Leaderboard currently shows user emails
2. **Privacy Risk**: Email addresses can be scraped and misused
3. **GDPR Concerns**: Public display of email violates privacy best practices
4. **Poor UX**: Emails aren't fun gaming identities

### Goals
- Never expose email addresses publicly
- Generate fun, gaming-relevant nicknames automatically
- Allow users to customize their display name
- Maintain nickname uniqueness for identification

---

## Nickname Architecture

### Nickname Types
1. **Custom Nickname**: User-chosen display name (3-20 chars)
2. **Auto-Generated**: System-assigned gaming nickname

### Auto-Generated Nickname Format
```
{Adjective}{Noun}{Number}
```

Examples:
- SwiftFalcon42
- NeonNinja99
- PixelWizard17
- TurboTyper88

---

## Word Banks for Random Nicknames

### Adjectives (60 words)
```typescript
const ADJECTIVES = [
  // Speed-related
  'Swift', 'Quick', 'Rapid', 'Flash', 'Turbo', 'Sonic', 'Hyper', 'Nitro',
  // Tech-related
  'Cyber', 'Pixel', 'Neon', 'Digital', 'Binary', 'Quantum', 'Laser', 'Plasma',
  // Gaming-related
  'Elite', 'Pro', 'Epic', 'Mega', 'Ultra', 'Super', 'Power', 'Alpha',
  // Nature-inspired
  'Storm', 'Thunder', 'Fire', 'Ice', 'Shadow', 'Dark', 'Light', 'Crystal',
  // Cool adjectives
  'Stealth', 'Silent', 'Phantom', 'Ghost', 'Mystic', 'Cosmic', 'Stellar', 'Nova',
  // Retro gaming
  'Arcade', 'Retro', 'Classic', 'Vintage', 'Pixel', '8Bit', 'Chiptune', 'Glitch',
  // Positive traits
  'Brave', 'Bold', 'Fierce', 'Mighty', 'Royal', 'Noble', 'Iron', 'Golden',
  // Fun additions
  'Lucky', 'Wild', 'Crazy', 'Mad', 'Funky', 'Groovy', 'Cosmic', 'Astro',
];
```

### Nouns (60 words)
```typescript
const NOUNS = [
  // Animals
  'Falcon', 'Wolf', 'Dragon', 'Phoenix', 'Tiger', 'Eagle', 'Panther', 'Fox',
  'Hawk', 'Viper', 'Cobra', 'Bear', 'Lion', 'Shark', 'Raven', 'Owl',
  // Gaming roles
  'Ninja', 'Knight', 'Wizard', 'Warrior', 'Ranger', 'Mage', 'Rogue', 'Paladin',
  'Hunter', 'Archer', 'Samurai', 'Viking', 'Pirate', 'Hero', 'Champion', 'Legend',
  // Tech terms
  'Coder', 'Hacker', 'Typer', 'Bot', 'Droid', 'Runner', 'Glider', 'Pilot',
  // Objects
  'Blade', 'Storm', 'Strike', 'Bolt', 'Spark', 'Flame', 'Star', 'Comet',
  // Fantasy
  'Specter', 'Wraith', 'Spirit', 'Golem', 'Titan', 'Giant', 'Demon', 'Angel',
  // Misc gaming
  'Gamer', 'Player', 'Master', 'Chief', 'Boss', 'King', 'Queen', 'Duke',
];
```

### Number Generation
- Range: 1-999
- Weighted toward memorable numbers (multiples of 7, 11, etc.)
- Option to include year-like numbers (e.g., 99, 2K)

---

## Implementation

### Database Schema Updates

#### Update `users` table
```typescript
users: defineTable({
  // ... existing fields ...
  nickname: v.optional(v.string()),        // Custom nickname
  autoNickname: v.optional(v.string()),    // System-generated nickname
  nicknameChangedAt: v.optional(v.number()), // When last changed
  isNicknameCustom: v.optional(v.boolean()), // Custom vs auto
})
```

### New Convex Functions

#### `convex/nicknames.ts`
```typescript
// Generate a unique random nickname
export const generateNickname = internalMutation({
  handler: async (ctx) => {
    const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const number = Math.floor(Math.random() * 999) + 1;

    const nickname = `${adjective}${noun}${number}`;

    // Check uniqueness
    const existing = await ctx.db
      .query("users")
      .filter(q => q.or(
        q.eq(q.field("nickname"), nickname),
        q.eq(q.field("autoNickname"), nickname)
      ))
      .first();

    if (existing) {
      // Recursively try again with different number
      return generateNickname(ctx);
    }

    return nickname;
  },
});

// Get user's display name (nickname or auto-generated)
export const getDisplayName = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) return null;

    // Priority: custom nickname > auto nickname > generate new
    return user.nickname || user.autoNickname || null;
  },
});

// Set custom nickname
export const setNickname = mutation({
  args: {
    clerkId: v.string(),
    nickname: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate nickname
    const trimmed = args.nickname.trim();

    if (trimmed.length < 3 || trimmed.length > 20) {
      return { success: false, reason: "Nickname must be 3-20 characters" };
    }

    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      return { success: false, reason: "Only letters, numbers, and underscores allowed" };
    }

    // Check for inappropriate content (basic filter)
    const banned = ['admin', 'mod', 'staff', 'official', 'support'];
    if (banned.some(word => trimmed.toLowerCase().includes(word))) {
      return { success: false, reason: "This nickname is not allowed" };
    }

    // Check uniqueness
    const existing = await ctx.db
      .query("users")
      .filter(q => q.or(
        q.eq(q.field("nickname"), trimmed),
        q.eq(q.field("autoNickname"), trimmed)
      ))
      .first();

    if (existing && existing.clerkId !== args.clerkId) {
      return { success: false, reason: "Nickname already taken" };
    }

    // Update user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      return { success: false, reason: "User not found" };
    }

    await ctx.db.patch(user._id, {
      nickname: trimmed,
      isNicknameCustom: true,
      nicknameChangedAt: Date.now(),
    });

    return { success: true, nickname: trimmed };
  },
});

// Assign auto-nickname to user (called on registration)
export const assignAutoNickname = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) return null;

    // Skip if already has nickname
    if (user.nickname || user.autoNickname) {
      return user.nickname || user.autoNickname;
    }

    // Generate unique nickname
    let attempts = 0;
    let nickname = '';

    while (attempts < 10) {
      const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
      const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
      const num = Math.floor(Math.random() * 999) + 1;
      nickname = `${adj}${noun}${num}`;

      const existing = await ctx.db
        .query("users")
        .filter(q => q.or(
          q.eq(q.field("nickname"), nickname),
          q.eq(q.field("autoNickname"), nickname)
        ))
        .first();

      if (!existing) break;
      attempts++;
    }

    await ctx.db.patch(user._id, {
      autoNickname: nickname,
      isNicknameCustom: false,
    });

    return nickname;
  },
});
```

### Update Leaderboard Query

#### `convex/leaderboard.ts`
```typescript
export const getTopScores = query({
  args: { lessonId: v.optional(v.number()), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    // ... existing query logic ...

    // Map scores to include display name, NOT email
    return scores.map(score => ({
      rank: index + 1,
      displayName: score.user?.nickname || score.user?.autoNickname || 'Anonymous',
      avatarId: score.user?.avatarId,
      score: score.score,
      accuracy: score.accuracy,
      lessonId: score.lessonId,
      // NEVER include email in response
    }));
  },
});
```

---

## UI Components

### 1. Nickname Display Component
```tsx
// src/components/NicknameDisplay.tsx
interface Props {
  nickname: string;
  avatarId?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function NicknameDisplay({ nickname, avatarId, size = 'md' }) {
  return (
    <div className="flex items-center gap-2">
      <Avatar avatarId={avatarId} size={size} />
      <span className="font-gaming">{nickname}</span>
    </div>
  );
}
```

### 2. Nickname Editor (Profile Settings)
```tsx
// src/components/NicknameEditor.tsx
export function NicknameEditor() {
  const [nickname, setNickname] = useState('');
  const updateNickname = useMutation(api.nicknames.setNickname);
  const currentNickname = useQuery(api.nicknames.getDisplayName, { clerkId });

  return (
    <div className="pixel-box p-4">
      <h3>YOUR NICKNAME</h3>
      <p className="current">{currentNickname}</p>

      <input
        value={nickname}
        onChange={e => setNickname(e.target.value)}
        placeholder="Enter new nickname"
        maxLength={20}
      />

      <button onClick={() => updateNickname({ clerkId, nickname })}>
        SAVE NICKNAME
      </button>

      <p className="hint">3-20 characters, letters/numbers/underscores only</p>
    </div>
  );
}
```

### 3. Update Leaderboard Component
```tsx
// Update existing Leaderboard.tsx
// Replace email display with nickname
<td>{entry.displayName}</td>  // NOT entry.email
```

---

## Migration Plan

### Phase 1: Database Update
1. Add nickname fields to schema
2. Deploy schema changes

### Phase 2: Auto-Assign Existing Users
```typescript
// One-time migration
export const migrateExistingUsers = mutation({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();

    for (const user of users) {
      if (!user.nickname && !user.autoNickname) {
        // Generate and assign nickname
        // ... generation logic ...
        await ctx.db.patch(user._id, { autoNickname: generated });
      }
    }
  },
});
```

### Phase 3: Update All Public Displays
1. Leaderboard
2. Daily challenge results
3. Any future multiplayer features
4. Social sharing

### Phase 4: Add Profile Settings UI
1. Nickname editor in user profile
2. Nickname uniqueness validation
3. Change history tracking

---

## Privacy Rules (CRITICAL)

### Email NEVER Shown In:
- Leaderboard
- Daily challenge results
- Public profiles
- Social shares
- Any API responses (except user's own profile)

### Email ONLY Visible:
- User's own account settings
- Admin dashboard (if exists)
- Internal logging (secure)

### Data Minimization
- Leaderboard queries return ONLY:
  - Display name (nickname)
  - Avatar ID
  - Score data
  - Rank
- NEVER return: email, clerkId, userId, or other PII

---

## File Structure

```
src/
├── components/
│   ├── NicknameDisplay.tsx       (NEW)
│   ├── NicknameEditor.tsx        (NEW)
│   ├── Leaderboard.tsx           (MODIFY - use nickname)
│   └── ProfileSettings.tsx       (NEW or MODIFY)
├── data/
│   └── nicknameWords.ts          (NEW - word banks)

convex/
├── nicknames.ts                  (NEW)
├── leaderboard.ts                (MODIFY)
├── users.ts                      (MODIFY)
└── schema.ts                     (MODIFY)
```

---

## Testing Checklist

- [ ] Auto-nickname generated on new user registration
- [ ] Custom nickname validation (length, characters)
- [ ] Nickname uniqueness enforced
- [ ] Leaderboard shows nicknames, not emails
- [ ] Profile settings allow nickname editing
- [ ] API responses never include email (except own profile)
- [ ] Migration handles existing users without nicknames

---

## Summary

This PRP implements a comprehensive nickname system that:
1. **Protects Privacy**: Email never exposed publicly
2. **Provides Fun Identity**: Gaming-themed auto-generated nicknames
3. **Allows Customization**: Users can set their own nickname
4. **Ensures Uniqueness**: All nicknames are unique across the platform
5. **Migrates Existing Users**: Auto-assigns nicknames to current users

All public-facing displays will use nicknames instead of emails, ensuring user privacy while maintaining a fun, gaming-relevant identity system.
