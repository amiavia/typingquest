# PRP-028: 200-Day Daily Challenge Engagement System

**Status**: DRAFT
**Author**: Claude + Anton
**Date**: 2025-12-25
**Priority**: HIGH
**Dependencies**: PRP-008 (Daily Challenges), PRP-009 (Streaks), PRP-026 (Coins)

---

## Executive Summary

This PRP defines a comprehensive daily challenge system designed to keep users engaged for 200+ days. The system combines variety, progression, seasonal themes, and social elements to create a compelling daily reason to return. Each day brings a unique challenge that feels fresh while building toward long-term goals.

---

## Problem Statement

### Current Issues
1. **Button doesn't work**: The "Start Challenge" button does nothing
2. **Limited variety**: Only 4 challenge types, gets repetitive
3. **No progression arc**: Day 1 feels same as Day 100
4. **No narrative**: Challenges feel disconnected
5. **No social element**: Solo experience only

### 200-Day Engagement Goals
- **Days 1-7**: Hook the user with easy wins and quick rewards
- **Days 8-30**: Build habit through consistent structure
- **Days 31-100**: Maintain interest through variety and progression
- **Days 101-200**: Deep engagement through mastery challenges and prestige

---

## Challenge Architecture

### Challenge Types (20 Types)

#### Speed Challenges (5 variants)
| Type | Description | Target | Unlock |
|------|-------------|--------|--------|
| `speed-sprint` | Type 50 words as fast as possible | WPM | Day 1 |
| `speed-burst` | Type 10 words in under 10 seconds | Time | Day 1 |
| `speed-marathon` | Maintain 40+ WPM for 5 minutes | Duration | Day 15 |
| `speed-accelerate` | Start slow, increase WPM each round | WPM Increase | Day 30 |
| `speed-blitz` | 100 words, max speed, no breaks | WPM | Day 60 |

#### Accuracy Challenges (5 variants)
| Type | Description | Target | Unlock |
|------|-------------|--------|--------|
| `accuracy-perfect` | Type 30 words with 100% accuracy | Perfect Words | Day 1 |
| `accuracy-streak` | Perfect 10 words in a row | Streak | Day 1 |
| `accuracy-nightmare` | 50 words, any mistake = restart | Completion | Day 20 |
| `accuracy-zen` | 100 words at 99%+ accuracy | % | Day 45 |
| `accuracy-untouchable` | 200 words, 0 mistakes | Completion | Day 90 |

#### Endurance Challenges (4 variants)
| Type | Description | Target | Unlock |
|------|-------------|--------|--------|
| `endurance-steady` | Type for 3 minutes straight | Duration | Day 1 |
| `endurance-long` | Type for 10 minutes | Duration | Day 25 |
| `endurance-ultra` | Type for 20 minutes, maintain 30+ WPM | Duration + WPM | Day 50 |
| `endurance-iron` | Type for 30 minutes, no pause > 5s | Duration | Day 100 |

#### Key-Focused Challenges (4 variants)
| Type | Description | Target | Unlock |
|------|-------------|--------|--------|
| `keys-home` | Master home row keys only | WPM | Day 1 |
| `keys-weak` | Focus on your weakest keys (AI detected) | Accuracy | Day 10 |
| `keys-numbers` | Number row only | WPM | Day 35 |
| `keys-symbols` | Symbols and punctuation | Accuracy | Day 70 |

#### Special Challenges (2 variants)
| Type | Description | Target | Unlock |
|------|-------------|--------|--------|
| `boss-daily` | Daily boss battle with unique mechanics | Defeat | Day 14 |
| `mystery-box` | Random challenge type, 2x rewards | Varies | Day 7 |

---

## 200-Day Progression Arc

### Week 1: "The Beginning" (Days 1-7)
**Theme**: Easy introduction, guaranteed wins
**Difficulty**: Very Easy (70% of normal)
**Rewards**: 1.5x coins (encouragement bonus)

| Day | Challenge Name | Type | Description |
|-----|----------------|------|-------------|
| 1 | First Steps | `speed-burst` | Type 10 simple words |
| 2 | Home Sweet Home | `keys-home` | Home row mastery |
| 3 | Steady Hands | `accuracy-perfect` | 20 perfect words |
| 4 | Keep Going | `endurance-steady` | 2 minutes of typing |
| 5 | Speed Demon | `speed-sprint` | 30 words fast |
| 6 | Perfect Ten | `accuracy-streak` | 10 perfect in a row |
| 7 | Mystery Day | `mystery-box` | Random + 2x rewards |

### Week 2-4: "Building Foundation" (Days 8-30)
**Theme**: Habit formation, introduce variety
**Difficulty**: Easy → Normal
**Special**: Day 14 = First Boss Challenge

- Mix of all basic challenge types
- Introduce "Bonus Objectives" (optional extra goals)
- Day 14: "Keyboard Guardian" boss battle
- Day 21: First "Weekly Challenge" (7-day cumulative goal)
- Day 30: "Month One" celebration challenge

### Month 2: "Finding Your Style" (Days 31-60)
**Theme**: Discover strengths and weaknesses
**Difficulty**: Normal
**Special**: AI-personalized challenges begin

- Challenges adapt to user's typing patterns
- Weak key detection starts influencing challenges
- Day 45: "The Gauntlet" - complete 3 mini-challenges in one session
- Day 50: First Ultra Endurance unlock
- Day 60: "Speed Blitz" unlock celebration

### Month 3: "Rising Challenge" (Days 61-90)
**Theme**: Increased difficulty, prestige begins
**Difficulty**: Normal → Hard
**Special**: Prestige challenges unlock

- Hard mode variants of earlier challenges
- "Flawless" bonus for perfect completion
- Day 75: First "Community Challenge" (beat global average)
- Day 90: "Untouchable" achievement challenge

### Month 4-5: "Master's Path" (Days 91-150)
**Theme**: Mastery challenges, rare rewards
**Difficulty**: Hard
**Special**: Legendary rewards unlock

- Combination challenges (speed + accuracy)
- "Deathless" runs (no mistakes in session)
- Day 100: "Century Challenge" - special boss + exclusive avatar
- Day 120: "Iron Endurance" unlock
- Day 150: "Halfway Hero" celebration

### Month 6+: "Legendary Status" (Days 151-200+)
**Theme**: Prestige, bragging rights, community
**Difficulty**: Very Hard / Custom
**Special**: Create your own challenges

- Design-a-challenge feature
- Mentor challenges (help new users)
- Day 175: "Triple Threat" (3 hard challenges in one day)
- Day 200: "Bicentennial Legend" - exclusive rewards

---

## Challenge Generation Algorithm

### Daily Seed Formula
```typescript
function generateDailyChallenge(date: Date, userId: string, dayNumber: number) {
  // Base challenge selection
  const seed = hashCode(date.toISOString() + userId);
  const availableTypes = getUnlockedTypes(dayNumber);

  // Weight by user weakness (encourages improvement)
  const weights = calculateWeights(userId, availableTypes);
  const challengeType = weightedRandom(availableTypes, weights);

  // Difficulty scaling
  const baseDifficulty = getDifficultyForDay(dayNumber);
  const userSkillModifier = getUserSkillLevel(userId);
  const finalDifficulty = baseDifficulty * userSkillModifier;

  // Special day overrides
  if (isMilestoneDay(dayNumber)) {
    return getMilestoneChallenge(dayNumber);
  }

  if (dayNumber % 7 === 0) {
    return getMysteryChallenge(seed);
  }

  return buildChallenge(challengeType, finalDifficulty);
}
```

### Difficulty Scaling
```
Day 1-7:    0.7x (Easy Mode)
Day 8-30:   0.85x → 1.0x (Gradual increase)
Day 31-60:  1.0x (Normal)
Day 61-90:  1.0x → 1.15x (Building)
Day 91-150: 1.15x → 1.3x (Hard)
Day 151+:   1.3x → 1.5x (Legendary)
```

---

## Reward Structure

### Base Rewards (Scale with day number)
```
Coins:
  Bronze: 50 + (dayNumber * 2)
  Silver: 100 + (dayNumber * 3)
  Gold:   200 + (dayNumber * 5)

XP:
  Bronze: 25 + dayNumber
  Silver: 50 + (dayNumber * 2)
  Gold:   100 + (dayNumber * 3)
```

### Milestone Rewards
| Day | Reward |
|-----|--------|
| 7 | Mystery Avatar Frame |
| 14 | "Dedicated" Badge |
| 30 | 500 Bonus Coins + "Monthly Master" Badge |
| 50 | Exclusive Theme: "Golden Hour" |
| 100 | Legendary Avatar: "Century Champion" |
| 150 | Custom Title Creator |
| 200 | "Bicentennial Legend" Title + 5000 Coins |

### Streak Multipliers
```
7-day streak:   1.1x rewards
14-day streak:  1.25x rewards
30-day streak:  1.5x rewards
60-day streak:  1.75x rewards
100-day streak: 2.0x rewards
```

---

## Special Events

### Weekly Events (Every Sunday)
- **Speed Sunday**: All challenges are speed-focused
- **Perfect Practice**: Accuracy-only challenges
- **Endurance Weekend**: Long-form challenges
- **Community Day**: Beat the global average for bonus

### Monthly Events
- **First Friday**: Double XP day
- **Mid-Month Madness**: Triple challenge day (3 challenges available)
- **Last Day Bonanza**: 3x coin rewards

### Seasonal Events (4 per year)
| Season | Theme | Special Challenge | Exclusive Reward |
|--------|-------|-------------------|------------------|
| Spring | Renewal | "Fresh Start" - beat your records | Bloom Avatar Frame |
| Summer | Heat | "Heat Wave" - speed challenges | Sun Theme |
| Autumn | Harvest | "Bounty" - collect word types | Harvest Avatar |
| Winter | Frost | "Frozen Keys" - accuracy focus | Snowflake Theme |

---

## Implementation Phases

### Phase 1: Core Functionality (Priority: CRITICAL)
1. Fix "Start Challenge" button to open challenge view
2. Create DailyChallengeView component
3. Track progress in real-time
4. Save results to Convex
5. Award coins/XP on completion

### Phase 2: Challenge Variety
1. Implement all 20 challenge types
2. Add challenge generation algorithm
3. Implement difficulty scaling
4. Add day number tracking per user

### Phase 3: Milestone System
1. Track user's day number (days since first challenge)
2. Implement milestone challenges
3. Add milestone rewards
4. Create celebration UI for milestones

### Phase 4: Social & Events
1. Global leaderboard for daily challenges
2. Weekly/monthly events
3. Community challenge average tracking
4. Seasonal event framework

---

## Database Schema Updates

### Add to `dailyChallenges` table
```typescript
dailyChallenges: defineTable({
  // ... existing fields ...
  dayNumber: v.optional(v.number()), // Which day in the 200-day journey
  difficulty: v.number(), // 0.7 - 1.5
  isMilestone: v.boolean(),
  milestoneType: v.optional(v.string()),
  bonusObjectives: v.optional(v.array(v.object({
    description: v.string(),
    target: v.number(),
    reward: v.number(),
  }))),
})
```

### Add to `users` table
```typescript
users: defineTable({
  // ... existing fields ...
  firstChallengeDate: v.optional(v.string()), // When they started
  challengeDayNumber: v.optional(v.number()), // Current day in journey
  totalChallengesCompleted: v.optional(v.number()),
  highestTierAchieved: v.optional(v.string()), // gold/silver/bronze
})
```

---

## UI Components Needed

### 1. DailyChallengeView
Full-screen challenge experience with:
- Live WPM/accuracy display
- Progress toward tiers
- Timer (if applicable)
- Words to type
- Real-time feedback

### 2. ChallengeResultModal
Post-challenge celebration:
- Tier achieved (animated)
- Coins/XP earned (animated counter)
- Bonus objectives completed
- "Share" button
- Tomorrow's preview

### 3. JourneyProgress
Show user's 200-day progress:
- Current day number
- Milestones reached
- Next milestone preview
- Calendar view of completed days

### 4. MilestoneUnlock
Special modal for milestone days:
- Big celebration animation
- Exclusive reward reveal
- Share achievement
- Motivational message

---

## Success Metrics

### Engagement Targets
- Day 7 retention: 60%
- Day 30 retention: 40%
- Day 100 retention: 20%
- Day 200 retention: 10%

### Quality Metrics
- Average session length: 5+ minutes
- Challenge completion rate: 80%+
- Gold tier achievement rate: 30%
- Streak maintenance: 50% maintain 7+ day streak

---

## File Structure

```
src/
├── components/
│   ├── DailyChallengeView.tsx      (NEW) - Main challenge UI
│   ├── ChallengeResultModal.tsx    (NEW) - Results celebration
│   ├── JourneyProgress.tsx         (NEW) - 200-day progress
│   ├── MilestoneUnlock.tsx         (NEW) - Milestone celebrations
│   ├── DailyChallengeCard.tsx      (MODIFY) - Add journey info
│   └── DailyChallengeSection.tsx   (MODIFY) - Fix navigation
├── data/
│   ├── challengeTypes.ts           (NEW) - 20 challenge definitions
│   ├── milestones.ts               (NEW) - Milestone definitions
│   └── seasonalEvents.ts           (NEW) - Event calendar
├── hooks/
│   └── useDailyChallenge.ts        (NEW) - Challenge state management
└── App.tsx                          (MODIFY) - Add challenge view route

convex/
├── dailyChallenges.ts              (MODIFY) - Generation algorithm
└── schema.ts                       (MODIFY) - New fields
```

---

## Summary

This PRP transforms daily challenges from a simple feature into a 200-day journey with:
- **20 unique challenge types** for variety
- **Progressive difficulty** that grows with the user
- **Milestone system** with exclusive rewards
- **Seasonal events** for ongoing freshness
- **Social elements** for community engagement

The system is designed to create a compelling daily habit that keeps users returning for 200+ days while continuously improving their typing skills.
