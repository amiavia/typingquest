# PRP-047: Funny Default Nicknames for Leaderboard

**Status**: PROPOSED
**Author**: Claude + Anton
**Date**: 2025-12-31
**Priority**: LOW (polish)
**Estimated Effort**: 1-2 hours

---

## Problem Statement

The leaderboard shows "Anonymous" for users who haven't set a nickname. This:
1. Looks boring and repetitive
2. Doesn't encourage users to set a real nickname
3. Misses an opportunity for personality/brand expression

## Solution

Replace "Anonymous" with funny, typing-related nicknames that are:
- Deterministic (same user always gets same nickname)
- Slightly embarrassing (motivates setting a real name)
- On-brand with TypeBit8's retro gaming vibe

## Implementation Approach

### Option A: Frontend-Only (RECOMMENDED - Safest)

Change only the display logic. No database changes.

**Pros:**
- Zero risk to existing data
- Instant rollback (revert one file)
- No migration needed

**Cons:**
- Nickname could theoretically differ across clients (edge case)

**Implementation:**

```typescript
// src/lib/nicknames.ts
const FUNNY_NICKNAMES = [
  'KeySmasher',
  'HuntAndPecker',
  'CapsLockCadet',
  'TypingPadawan',
  'TwoFingerTyrant',
  'BackspaceBandit',
  'SlowPokeTyper',
  'QwertyNinja',
  'HomeRowHero',
  'ShiftHappens',
  'CtrlFreak',
  'TabTapper',
  'PixelPecker',
  'RetroFingers',
  'BufferingBob',
  'KeyboardRookie',
];

/**
 * Get a deterministic funny nickname based on user ID
 * Same user always gets the same nickname
 */
export function getFunnyNickname(oderId: string): string {
  // Simple hash: sum of character codes
  let hash = 0;
  for (let i = 0; i < oderId.length; i++) {
    hash += oderId.charCodeAt(i);
  }
  return FUNNY_NICKNAMES[hash % FUNNY_NICKNAMES.length];
}

/**
 * Get display name for leaderboard
 */
export function getDisplayName(nickname: string | undefined, oderId: string): string {
  if (nickname && nickname.trim() && nickname !== 'Anonymous') {
    return nickname;
  }
  return getFunnyNickname(oderId);
}
```

**Leaderboard component change:**

```tsx
// In LeaderboardEntry or wherever nickname is displayed
import { getDisplayName } from '../lib/nicknames';

// Before:
<span>{entry.nickname || 'Anonymous'}</span>

// After:
<span>{getDisplayName(entry.nickname, entry.oderId)}</span>
```

### Option B: Backend + Database (More Complex)

Generate nickname on user creation and store in database.

**Pros:**
- Consistent across all clients
- Nickname persists even if list changes

**Cons:**
- Requires database migration
- Need to backfill existing users
- More code to maintain

**NOT RECOMMENDED** for this simple feature.

---

## Nickname List Criteria

1. **Typing-related** - Must reference keyboards, typing, or the learning journey
2. **Slightly embarrassing** - Motivates users to set a real nickname
3. **Family-friendly** - No offensive content
4. **Short** - Max 15 characters (fits UI)
5. **Retro/gaming vibe** - Matches TypeBit8 brand

## Final Nickname List

```typescript
const FUNNY_NICKNAMES = [
  // Keyboard puns
  'KeySmasher',
  'QwertyNinja',
  'HomeRowHero',
  'CapsLockCadet',
  'BackspaceBandit',
  'ShiftHappens',
  'CtrlFreak',
  'TabTapper',

  // Self-deprecating (encourages real name)
  'HuntAndPecker',
  'TwoFingerTyrant',
  'TypingPadawan',
  'KeyboardRookie',
  'SlowPokeTyper',
  'BufferingBob',

  // Retro themed
  'PixelPecker',
  'RetroFingers',
];
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/lib/nicknames.ts` | NEW: Nickname utility functions |
| `src/components/Leaderboard.tsx` | Use `getDisplayName()` instead of fallback |

## Testing Plan

1. **No nickname set**: Should show funny name (e.g., "KeySmasher")
2. **Nickname set**: Should show actual nickname
3. **Same user, multiple views**: Should always show same funny name
4. **Empty string nickname**: Should show funny name
5. **"Anonymous" as nickname**: Should show funny name (edge case)

## Rollback Plan

Revert `src/components/Leaderboard.tsx` to use `'Anonymous'` fallback.

```bash
git revert <commit-hash>
```

---

## Success Criteria

- [ ] No "Anonymous" visible on leaderboard
- [ ] Funny nicknames display correctly
- [ ] Same user always gets same nickname
- [ ] Users with real nicknames unaffected
- [ ] Build passes
- [ ] No console errors

---

## Open Questions

1. **Which nicknames to include?** - Need Anton's approval on the list
2. **Should we add a tooltip?** - "Set your nickname in settings" on hover?
3. **Character limit?** - Current UI might need adjustment for longer names

---

## Appendix: Extended Nickname Ideas

If we want more variety:

```typescript
// Additional options (pick favorites)
'EnterEnthusiast',
'DeleteDaniel',
'EscapeArtist',
'InsertIntern',
'ScrollSurfer',
'NumLockNed',
'AltAce',
'FnFanatic',
'ArrowAdventurer',
'TypeTyrant',
'WPMWannabe',
'AccuracyAspirant',
'StreakSeeker',
'ComboChaser',
```
