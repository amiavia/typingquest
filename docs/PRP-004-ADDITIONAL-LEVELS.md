# PRP-004: 30 Additional Levels System

**Status**: DRAFT
**Author**: Claude + Anton
**Date**: 2025-12-25
**Priority**: HIGH
**Estimated Effort**: 6 phases, ~75 tasks

---

## Executive Summary

TypeBit8 currently provides 15 progressive lessons that teach users all keyboard keys through a structured learning path. This PRP expands the system to 30+ levels organized into skill tiers (Beginner, Intermediate, Advanced, Expert) with progressive difficulty, specialized challenge modes, and unlock requirements. The expansion maintains the existing architecture while introducing complexity progression, special game modes, and advanced typing skills like capitalization, punctuation, numbers, and real-world text patterns.

---

## Problem Statement

### Current State

1. **Limited progression**: Only 15 lessons available, with Lesson 15 being the final "mastery" level at 35 WPM / 95% accuracy
2. **No post-mastery content**: Users who complete all lessons have no further progression or challenges
3. **Single difficulty curve**: Linear difficulty increase without distinct skill tiers or specialization
4. **Missing advanced skills**: No lessons for capitalization, numbers, punctuation, or real-world text patterns
5. **No challenge modes**: No speed-focused, accuracy-focused, or endurance-based special challenges

### Impact

| Issue | User Impact |
|-------|-------------|
| Limited content | Users complete all lessons quickly and lose engagement |
| No post-mastery path | Advanced typists have no goals to work toward |
| Linear progression | Lack of variety and specialization reduces motivation |
| Missing real-world skills | Users can't practice typing actual text formats (emails, code, etc.) |
| No challenge modes | Competitive users have no special challenges to attempt |

### Success Criteria

- [ ] 30+ total levels organized into clear skill tiers
- [ ] Progressive difficulty with distinct tier characteristics
- [ ] New key combinations introduced at each tier (Shift, numbers, symbols, etc.)
- [ ] Word complexity progression: short → long → sentences → paragraphs
- [ ] Special challenge levels: speed runs, accuracy focus, endurance tests
- [ ] Unlock requirements between tiers prevent premature advancement
- [ ] Backward compatibility with existing 15-lesson structure
- [ ] Existing user progress preserved and mapped to new system
- [ ] Replayable challenge modes for ongoing engagement

---

## Proposed Solution

### Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  30-LEVEL PROGRESSION ARCHITECTURE                                          │
│                                                                             │
│  Tier 1: BEGINNER (Lessons 1-12)                                           │
│  ├─ Home row, top row, bottom row progression                              │
│  ├─ Lowercase letters only                                                 │
│  └─ 2-8 letter words, basic punctuation (. , ;)                            │
│                                                                             │
│  Tier 2: INTERMEDIATE (Lessons 13-20)                                      │
│  ├─ Full keyboard mastery & speed building                                 │
│  ├─ Capitalization (Shift key), common punctuation (' " ! ?)               │
│  ├─ 5-12 letter words, simple sentences                                    │
│  └─ Unlock: Complete Lesson 12 with 23 WPM, 85% accuracy                   │
│                                                                             │
│  Tier 3: ADVANCED (Lessons 21-27)                                          │
│  ├─ Numbers, symbols, advanced punctuation (@ # $ % & *)                   │
│  ├─ Complex sentences, paragraph typing                                    │
│  ├─ Real-world text: emails, code snippets, prose                          │
│  └─ Unlock: Complete Lesson 20 with 40 WPM, 92% accuracy                   │
│                                                                             │
│  Tier 4: EXPERT (Lessons 28-30+)                                           │
│  ├─ Speed challenges, accuracy perfection, endurance tests                 │
│  ├─ Full keyboard including special characters                             │
│  ├─ Professional text patterns                                             │
│  └─ Unlock: Complete Lesson 27 with 55 WPM, 95% accuracy                   │
│                                                                             │
│  Challenge Modes (Replayable)                                              │
│  ├─ Speed Sprint: 60-second burst, maximize WPM                            │
│  ├─ Accuracy Perfection: Zero-error typing challenge                       │
│  ├─ Endurance Marathon: 5-minute sustained typing                          │
│  └─ Daily Gauntlet: Random challenge with leaderboard                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Architecture / Design

#### 1. Extended Lesson Structure

Extend the existing `Lesson` type to support new level features:

```typescript
export interface ExtendedLesson extends Lesson {
  // Core properties (existing)
  id: number;
  title: string;
  description: string;
  concept: string;
  keys: string[];
  exercises: string[];
  quizWords: string[];
  minWPM: number;
  minAccuracy: number;

  // New properties for extended levels
  tier: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  difficulty: number; // 1-10 scale
  unlockRequirements?: UnlockRequirement;
  challengeMode?: 'speed' | 'accuracy' | 'endurance' | null;
  textComplexity: 'words' | 'sentences' | 'paragraphs' | 'mixed';
  includesCapitalization: boolean;
  includesNumbers: boolean;
  includesSymbols: boolean;
  replayable?: boolean; // For challenge modes
}

export interface UnlockRequirement {
  previousLessonId: number;
  minWPM: number;
  minAccuracy: number;
}
```

#### 2. Tier Breakdown (Levels 1-30)

**TIER 1: BEGINNER (Lessons 1-12)** - *Foundation Building*
- Existing lessons 1-12 remain unchanged
- Focus: Learn all letter keys progressively
- Keys: a-z, space, basic punctuation (. , ; ')
- Complexity: 2-8 letter words
- WPM Range: 10-25
- Accuracy Target: 85-90%

**TIER 2: INTERMEDIATE (Lessons 13-20)** - *Speed & Capitalization*

| ID | Title | New Keys | Focus | Min WPM | Min Acc |
|----|-------|----------|-------|---------|---------|
| 13 | Full Keyboard Practice | - | Existing lesson | 25 | 90% |
| 14 | Speed Building | - | Existing lesson | 30 | 92% |
| 15 | Typing Mastery | - | Existing lesson | 35 | 95% |
| 16 | Capital Letters - Basics | Shift + vowels | A E I O U capitalization | 30 | 90% |
| 17 | Capital Letters - Full | Shift + all | Full capitalization practice | 32 | 90% |
| 18 | Sentence Structure | . , ! ? | Proper sentences with capitals | 35 | 92% |
| 19 | Speed Challenge I | - | 60-second speed burst | 40 | 88% |
| 20 | Intermediate Mastery | All letters + Shift | Complex sentences | 40 | 92% |

**TIER 3: ADVANCED (Lessons 21-27)** - *Numbers & Symbols*

| ID | Title | New Keys | Focus | Min WPM | Min Acc |
|----|-------|----------|-------|---------|---------|
| 21 | Number Row - Left | 1 2 3 4 5 | Left-hand numbers | 35 | 90% |
| 22 | Number Row - Right | 6 7 8 9 0 | Right-hand numbers | 35 | 90% |
| 23 | Common Symbols | @ # $ % & | Email & social symbols | 38 | 92% |
| 24 | Programming Basics | ( ) { } [ ] < > | Code brackets & comparisons | 40 | 92% |
| 25 | Advanced Punctuation | : ; " ' - _ | Professional text | 42 | 93% |
| 26 | Paragraph Typing | All | Multi-sentence paragraphs | 45 | 94% |
| 27 | Real-World Text | All | Emails, code, prose | 50 | 95% |

**TIER 4: EXPERT (Lessons 28-30+)** - *Mastery Challenges*

| ID | Title | Type | Focus | Min WPM | Min Acc |
|----|-------|------|-------|---------|---------|
| 28 | Speed Sprint | Challenge | 60s burst, max WPM | 55 | 90% |
| 29 | Accuracy Perfection | Challenge | Zero-error typing | 40 | 100% |
| 30 | Endurance Marathon | Challenge | 5-minute sustained | 50 | 95% |
| 31+ | Daily Gauntlet | Challenge | Random daily challenge | Varies | Varies |

#### 3. Progressive Complexity System

**Word Complexity Tiers**:
```typescript
export const COMPLEXITY_LEVELS = {
  beginner: {
    wordLength: { min: 2, max: 8 },
    sentenceLength: null, // Words only
    includeCapitals: false,
    includeNumbers: false,
    includeSymbols: false,
  },
  intermediate: {
    wordLength: { min: 4, max: 12 },
    sentenceLength: { min: 3, max: 8 }, // 3-8 words per sentence
    includeCapitals: true,
    includeNumbers: false,
    includeSymbols: false,
  },
  advanced: {
    wordLength: { min: 3, max: 15 },
    sentenceLength: { min: 5, max: 12 },
    paragraphLength: { min: 2, max: 4 }, // 2-4 sentences per paragraph
    includeCapitals: true,
    includeNumbers: true,
    includeSymbols: true,
  },
  expert: {
    wordLength: { min: 2, max: 20 },
    sentenceLength: { min: 4, max: 15 },
    paragraphLength: { min: 3, max: 6 },
    includeCapitals: true,
    includeNumbers: true,
    includeSymbols: true,
    includeRealWorldText: true,
  },
};
```

#### 4. Challenge Mode System

Challenge modes are **replayable** special lessons that test specific skills:

```typescript
export interface ChallengeMode {
  id: string;
  type: 'speed' | 'accuracy' | 'endurance';
  title: string;
  description: string;
  duration: number; // seconds
  targetMetric: 'wpm' | 'accuracy' | 'both';
  replayable: true;
  leaderboardEnabled: boolean;
}

export const CHALLENGE_MODES: ChallengeMode[] = [
  {
    id: 'speed-sprint',
    type: 'speed',
    title: 'Speed Sprint',
    description: '60-second burst - type as fast as you can!',
    duration: 60,
    targetMetric: 'wpm',
    replayable: true,
    leaderboardEnabled: true,
  },
  {
    id: 'accuracy-perfection',
    type: 'accuracy',
    title: 'Accuracy Perfection',
    description: 'Type perfectly - one mistake and you fail!',
    duration: 120,
    targetMetric: 'accuracy',
    replayable: true,
    leaderboardEnabled: true,
  },
  {
    id: 'endurance-marathon',
    type: 'endurance',
    title: 'Endurance Marathon',
    description: '5 minutes of sustained typing',
    duration: 300,
    targetMetric: 'both',
    replayable: true,
    leaderboardEnabled: true,
  },
];
```

#### 5. Unlock System

Progressive gating ensures users master fundamentals before advancing:

```typescript
export function canUnlockLesson(
  lessonId: number,
  userProgress: LessonProgress[]
): boolean {
  const lesson = getExtendedLesson(lessonId);

  if (!lesson.unlockRequirements) {
    return true; // No requirements (e.g., Lesson 1)
  }

  const { previousLessonId, minWPM, minAccuracy } = lesson.unlockRequirements;
  const previousProgress = userProgress.find(p => p.lessonId === previousLessonId);

  if (!previousProgress || !previousProgress.completed) {
    return false;
  }

  return (
    previousProgress.bestWPM >= minWPM &&
    previousProgress.bestAccuracy >= minAccuracy
  );
}

// Unlock requirements for each tier
export const TIER_UNLOCK_REQUIREMENTS = {
  beginner: null, // Always unlocked
  intermediate: { previousLessonId: 12, minWPM: 23, minAccuracy: 85 },
  advanced: { previousLessonId: 20, minWPM: 40, minAccuracy: 92 },
  expert: { previousLessonId: 27, minWPM: 55, minAccuracy: 95 },
};
```

---

## Phase Breakdown

### Phase 1: Extended Lesson Type System
**Effort**: ~10 tasks

1. Update `types/index.ts` with `ExtendedLesson`, `UnlockRequirement`, `ChallengeMode` types
2. Create `data/lessonTiers.ts` with tier definitions and complexity levels
3. Create `data/challengeModes.ts` with challenge mode configurations
4. Update `data/lessons.ts` to export both legacy and extended lesson arrays
5. Create `utils/lessonUnlock.ts` with unlock logic
6. Add tier badges and visual indicators to UI types
7. Update database schema to support extended lesson progress
8. Create migration script for existing user progress
9. Add unit tests for unlock logic
10. Document type extensions in codebase

### Phase 2: Intermediate Tier (Lessons 16-20)
**Effort**: ~15 tasks

1. **Lesson 16: Capital Letters - Basics**
   - Generate exercises with capitalized vowels (Apple, Eagle, Inside, Open, Under)
   - Quiz words with proper nouns and sentence-starting capitals
   - Teaching concept: Shift key mechanics for vowels

2. **Lesson 17: Capital Letters - Full**
   - All letters with capitalization
   - Mix of lowercase and uppercase practice
   - Teaching concept: Full Shift key mastery

3. **Lesson 18: Sentence Structure**
   - Proper sentences with capitals and punctuation
   - Exercises with . , ! ? punctuation
   - Teaching concept: Real-world sentence typing

4. **Lesson 19: Speed Challenge I**
   - 60-second timed challenge
   - Common word patterns at high speed
   - Replayable with personal best tracking

5. **Lesson 20: Intermediate Mastery**
   - Complex multi-sentence exercises
   - All intermediate skills combined
   - Unlock gate for Advanced tier

### Phase 3: Advanced Tier - Numbers (Lessons 21-22)
**Effort**: ~10 tasks

1. **Lesson 21: Number Row - Left (1-5)**
   - Progressive introduction: 1, 2, 3, 4, 5
   - Exercises mixing letters and numbers (a1, s2, d3, f4, g5)
   - Quiz with dates, counts, simple math

2. **Lesson 22: Number Row - Right (6-0)**
   - Progressive introduction: 6, 7, 8, 9, 0
   - Exercises mixing letters and numbers (h6, j7, k8, l9, ;0)
   - Quiz with phone numbers, addresses, years

### Phase 4: Advanced Tier - Symbols (Lessons 23-25)
**Effort**: ~12 tasks

1. **Lesson 23: Common Symbols (@#$%&)**
   - Email addresses with @
   - Hashtags with #
   - Currency with $
   - Percentages with %
   - Logical AND with &

2. **Lesson 24: Programming Basics**
   - Parentheses ( )
   - Curly braces { }
   - Square brackets [ ]
   - Angle brackets < >
   - Code snippet exercises

3. **Lesson 25: Advanced Punctuation**
   - Colon :
   - Semicolon ; (reinforcement)
   - Double quotes "
   - Single quotes ' (reinforcement)
   - Hyphen - and underscore _

### Phase 5: Advanced Tier - Complex Text (Lessons 26-27)
**Effort**: ~15 tasks

1. **Lesson 26: Paragraph Typing**
   - Multi-sentence paragraphs
   - Full punctuation and capitalization
   - Coherent text excerpts
   - 3-5 sentence paragraphs

2. **Lesson 27: Real-World Text**
   - Email format exercises
   - Code snippet typing (JSON, simple functions)
   - Prose excerpts (quotes, literature)
   - Professional writing patterns
   - Unlock gate for Expert tier

### Phase 6: Expert Tier & Challenge Modes (Lessons 28-30+)
**Effort**: ~13 tasks

1. **Lesson 28: Speed Sprint**
   - 60-second burst challenge
   - Common words optimized for speed
   - Leaderboard integration
   - Replayable with best score tracking

2. **Lesson 29: Accuracy Perfection**
   - Zero-error challenge
   - Fails on first mistake
   - Complex text requiring focus
   - Leaderboard for successful completions

3. **Lesson 30: Endurance Marathon**
   - 5-minute sustained typing
   - Paragraph-based content
   - Consistency scoring (WPM variance)
   - Leaderboard for average WPM

4. **Daily Gauntlet (Optional 31+)**
   - Random daily challenge
   - Rotates between speed/accuracy/endurance
   - Global leaderboard
   - Streak tracking for consecutive days

---

## File Structure (New/Modified)

### New Files
```
src/data/lessonTiers.ts                 # Tier definitions and complexity levels
src/data/challengeModes.ts              # Challenge mode configurations
src/data/extendedLessons.ts             # Lessons 16-30+ definitions
src/utils/lessonUnlock.ts               # Unlock logic and requirements
src/utils/capitalizer.ts                # Utilities for capitalization exercises
src/utils/numberGenerator.ts            # Number-based exercise generation
src/utils/symbolGenerator.ts            # Symbol-based exercise generation
src/utils/paragraphGenerator.ts         # Multi-sentence paragraph creation
src/components/TierBadge.tsx            # Visual tier indicator component
src/components/UnlockGate.tsx           # UI for locked lessons with requirements
src/components/ChallengeCard.tsx        # Special card for challenge modes
src/components/LeaderboardPanel.tsx     # Challenge mode leaderboards
```

### Modified Files
```
src/types/index.ts                      # Add ExtendedLesson, ChallengeMode types
src/data/lessons.ts                     # Export legacy + extended lessons
src/data/lessonGenerator.ts             # Support extended lesson generation
src/hooks/useLessons.ts                 # Handle extended lesson logic
src/hooks/useLessonProgress.ts          # Track extended progress
src/components/LessonCard.tsx           # Show tier badges, lock states
src/components/LessonView.tsx           # Render extended lesson types
src/components/Quiz.tsx                 # Support complex text in quizzes
convex/lessons.ts                       # Database queries for extended lessons
convex/schema.ts                        # Extended lesson progress schema
```

---

## Implementation Order

### Priority 1 (Core Infrastructure)
1. Phase 1: Extended Lesson Type System
2. Create Lesson 16-17 (Capital Letters) for early validation
3. Test unlock system with Tier 2 gate

### Priority 2 (Intermediate Tier)
4. Phase 2: Complete Lessons 16-20
5. UI updates for tier badges and unlock gates
6. Migration script for existing users

### Priority 3 (Advanced Content)
7. Phase 3: Number lessons (21-22)
8. Phase 4: Symbol lessons (23-25)
9. Phase 5: Complex text lessons (26-27)

### Priority 4 (Expert & Polish)
10. Phase 6: Challenge modes (28-30)
11. Leaderboard system integration
12. Daily Gauntlet implementation (optional)

---

## Migration Strategy

### Existing Users (Completed Lessons 1-15)

```typescript
export function migrateLegacyProgress(
  oldProgress: LessonProgress[]
): LessonProgress[] {
  // Lessons 1-15 map directly to new system
  const migratedProgress = [...oldProgress];

  // If user completed Lesson 12, auto-unlock Tier 2
  const lesson12 = oldProgress.find(p => p.lessonId === 12 && p.completed);
  if (lesson12 && lesson12.bestWPM >= 23 && lesson12.bestAccuracy >= 85) {
    // Tier 2 unlocked - no action needed, unlock logic handles this
  }

  // If user completed Lesson 15, auto-unlock some Tier 2 lessons
  const lesson15 = oldProgress.find(p => p.lessonId === 15 && p.completed);
  if (lesson15 && lesson15.bestWPM >= 35 && lesson15.bestAccuracy >= 95) {
    // Suggest Lesson 16 (Capital Letters) as next step
  }

  return migratedProgress;
}
```

### Backward Compatibility
- Lessons 1-15 remain unchanged
- New lessons (16-30) are additive
- Existing API endpoints support both legacy and extended lessons
- UI gracefully handles missing new fields (shows default tier: 'beginner')

---

## Notes

### Content Generation Strategy

1. **Capitalization Exercises**: Use existing word databases with proper noun detection and sentence-starting caps
2. **Number Exercises**: Generate realistic patterns (dates: 1995, 2024; times: 10:30, 3:45; counts: 1-100)
3. **Symbol Exercises**: Context-aware (@ in emails, # in tags, $ in prices, {} in code)
4. **Paragraph Content**: Curated excerpts from public domain texts, technical documentation, common emails

### Difficulty Balancing

- **WPM Targets**: Increase by ~5 WPM per tier
- **Accuracy Targets**: Maintain 90%+ to ensure quality over speed
- **Tier Gates**: Prevent users from skipping fundamentals
- **Challenge Modes**: High targets (55+ WPM, 100% accuracy) for competitive users

### Localization Considerations

- All lessons 16-30 use existing internationalization system from PRP-001
- Capitalization rules respect language (e.g., German noun capitalization)
- Number formats respect locale (European vs American date formats)
- Symbol usage varies by language (« » vs " " for quotes)

### Leaderboard System

- Per-challenge leaderboards (Speed Sprint, Accuracy Perfection, Endurance Marathon)
- Daily/Weekly/All-Time rankings
- Anonymous option for privacy
- Personal best tracking separate from leaderboard

### Replayability

- Challenge modes (28-30) can be replayed unlimited times
- Regular lessons (1-27) can be replayed but progress only updates if improved
- Daily Gauntlet refreshes every 24 hours

### Future Expansion

- Lesson 31+: Additional challenge modes (themed, seasonal, special events)
- Custom challenge creator (community-generated challenges)
- Competitive multiplayer typing races
- Achievement system for milestones (first 100 WPM, perfect accuracy streak)

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| User engagement post-Lesson-15 | 70% | % of users who start Lesson 16 |
| Tier 2 completion rate | 60% | % of users completing Lesson 20 |
| Tier 3 completion rate | 40% | % of users completing Lesson 27 |
| Expert tier participation | 25% | % of users attempting challenges |
| Challenge mode replay rate | 50% | % of users replaying challenges |
| Average final WPM improvement | +20 | WPM gain from Lesson 15 → Lesson 30 |
| User retention at 30 days | 50% | % of users still active after 1 month |

---

## Open Questions

1. **Number Row Teaching Order**: Should we teach 12345 67890 (by hand) or 10 29 38 47 56 (by finger pairs)?
2. **Symbol Prioritization**: Which symbols are most important for general typing vs programming?
3. **Paragraph Sources**: Public domain texts, generated content, or user submissions?
4. **Challenge Difficulty Scaling**: Should challenges adapt to user skill level?
5. **Daily Gauntlet Rewards**: Points, badges, or cosmetic unlocks for motivation?
6. **Lesson 31+ Cap**: Should there be a limit, or endless procedurally-generated challenges?

---

## Dependencies

- PRP-001: Internationalized Lesson System (for word databases and layout support)
- PRP-002: Localization (for multilingual lesson content)
- Existing lesson architecture (Lessons 1-15)
- Convex database schema updates
- Leaderboard infrastructure (may require separate PRP)

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Difficulty spike between tiers | Medium | High | Extensive playtesting, adjustable unlock gates |
| User frustration with locks | Low | Medium | Clear communication of requirements, preview mode |
| Content generation quality | Medium | Medium | Curated word lists, manual review of complex text |
| Migration issues | Low | High | Thorough testing, rollback plan, gradual rollout |
| Leaderboard cheating | Medium | Low | Server-side validation, anomaly detection |
| Performance with 30+ lessons | Low | Low | Lazy loading, efficient queries, caching |

---

**End of PRP-004**
