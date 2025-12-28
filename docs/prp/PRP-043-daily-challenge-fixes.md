# PRP-043: Daily Challenge System Fixes

**Status**: IMPLEMENTED
**Author**: Claude + Anton
**Date**: 2025-12-28
**Priority**: HIGH
**Related**: PRP-008 (Daily Challenge System)

---

## Executive Summary

The daily challenge system has several bugs in both target generation and measurement logic. Most critically, accuracy challenges can generate impossible targets (>100%), and the tier threshold system doesn't align with the original PRP design. This document analyzes all issues and proposes fixes.

---

## Problem Statement

### Bug #1: Impossible Accuracy Targets (CRITICAL)

**Location**: `convex/dailyChallenges.ts` lines 54-67

**Current Behavior**:
```typescript
const dayOfMonth = parseInt(date.split("-")[2]);  // e.g., 28
const targetVariation = 1 + (dayOfMonth % 5) * 0.1; // 1.0 to 1.4

const baseTarget = (template as { baseTarget: number }).baseTarget;
targetValue = Math.round(baseTarget * targetVariation);
```

For December 28:
- `dayOfMonth = 28`
- `targetVariation = 1 + (28 % 5) * 0.1 = 1 + 0.3 = 1.3`
- For "FLAWLESS RUN" with `baseTarget = 98`:
  - `targetValue = Math.round(98 * 1.3) = 127`

**Result**: Users see "Complete a lesson with 127% accuracy" - which is impossible.

**Affected Challenge Types**:
| Type | Base Targets | Max with 1.4x multiplier |
|------|--------------|--------------------------|
| PRECISION STRIKE | 95% | 133% (impossible) |
| FLAWLESS RUN | 98% | 137% (impossible) |
| PERFECT AIM | 90% | 126% (impossible) |

---

### Bug #2: Single-Target Tier System vs Original PRP Design (MAJOR)

**Current Implementation** (`convex/dailyChallenges.ts` lines 29-33):
```typescript
const TIERS = {
  bronze: 0.5,   // 50% of target
  silver: 0.75,  // 75% of target
  gold: 1.0,     // 100% of target
};
```

For a 127% accuracy target:
- Bronze = 63.5% accuracy
- Silver = 95.25% accuracy
- Gold = 127% accuracy (impossible)

**Original PRP-008 Design** (lines 128-138):
```typescript
// Accuracy challenges should have FIXED tier thresholds
export interface AccuracyChallengeConfig {
  type: 'accuracy';
  text: string;
  targetAccuracy: {
    bronze: number;  // e.g., 95%
    silver: number;  // e.g., 97%
    gold: number;    // e.g., 99%
  };
  minWPM: number;  // Minimum speed to prevent gaming
}
```

**Problem**: The implementation uses a percentage-of-target system, but the original design called for fixed thresholds per tier. This makes sense for speed (WPM can vary), but NOT for accuracy (which is bounded 0-100%).

---

### Bug #3: Endurance Challenge Measures Characters, Not Words (MEDIUM)

**Challenge Templates** (`convex/dailyChallenges.ts` lines 16-20):
```typescript
endurance: [
  { title: "MARATHON TYPER", description: "Type {target} words without errors", baseTarget: 50 },
  { title: "WORD WARRIOR", description: "Complete {target} words perfectly", baseTarget: 30 },
  { title: "STAMINA TEST", description: "Maintain accuracy for {target} words", baseTarget: 75 },
],
```

**Measurement Logic** (`src/components/DailyChallengeView.tsx` lines 97-98):
```typescript
case "endurance":
  value = stats.correctChars;  // Measures CHARACTERS, not WORDS
  break;
```

**TypingStats Type** (`src/types/index.ts` lines 33-40):
```typescript
export interface TypingStats {
  wpm: number;
  accuracy: number;
  correctChars: number;    // This is characters, not words
  incorrectChars: number;
  totalChars: number;
  timeElapsed: number;
}
```

**Problem**: The UI says "Type 65 words" but actually measures characters. With an average word length of 5 characters:
- Target of 65 "words" → actually needs ~325 characters
- But `correctChars` is compared directly to 65

**Result**: Users can "complete" the challenge by typing just 65 characters instead of 65 words.

---

### Bug #4: Keys Challenge Doesn't Measure Target Keys Specifically (MEDIUM)

**Challenge Purpose**: Practice specific keys (e.g., q, w, e, r)

**Current Measurement** (`src/components/DailyChallengeView.tsx` lines 100-102):
```typescript
case "keys":
  // Keys challenges measure accuracy on the target keys
  value = stats.accuracy;  // Uses OVERALL accuracy, not target key accuracy
  break;
```

**Problem**: The challenge says "Master the Q, W, E, R keys today" but measures overall typing accuracy, not accuracy specifically on those keys. Users could get gold by typing other letters perfectly while missing the target keys.

**Original PRP-008 Design** (lines 152-162):
```typescript
// Specific Keys Challenge: Focus on certain keys
export interface SpecificKeysChallengeConfig {
  type: 'specific-keys';
  keys: string[];                  // e.g., ['q','w','e','r']
  text: string;                    // Text containing those keys
  targetAccuracy: {                // Should measure accuracy ON THESE KEYS ONLY
    bronze: number;
    silver: number;
    gold: number;
  };
}
```

---

### Bug #5: Challenge Text is Hardcoded (LOW)

**Current Implementation** (`src/components/DailyChallengeView.tsx` lines 51-67):
```typescript
const getChallengeText = (): string => {
  switch (challenge.challengeType) {
    case "speed":
      return "The quick brown fox jumps over the lazy dog...";
    case "accuracy":
      return "Accuracy is more important than speed...";
    case "endurance":
      return "Endurance typing requires sustained focus...";
    case "keys":
      const keys = challenge.targetKeys?.join(" ") ?? "a s d f j k l ;";
      return `Practice these keys: ${keys} ${keys} ${keys}`;
  }
}
```

**Problems**:
1. Same text every time for each challenge type (boring)
2. Endurance challenge has short text that will repeat
3. Keys challenge text doesn't generate words that USE those keys
4. Speed challenge text (~90 chars) is too short for speed tests

---

### Bug #6: Missing Minimum WPM Check for Accuracy Challenges (LOW)

**Original PRP-008 Design** (lines 403-408):
```typescript
case 'accuracy':
  if (attempt.wpm < config.minWPM) return null; // Didn't meet min speed
  // ... tier check
```

**Current Implementation**: No minimum WPM check exists. Users could achieve "99% accuracy" by typing extremely slowly and carefully, gaming the system.

---

### Bug #7: Inconsistent Icon for Keys Challenge (TRIVIAL)

| Component | Icon |
|-----------|------|
| `DailyChallengeView.tsx` line 201 | ⌨️ |
| `DailyChallengeCard.tsx` line 86 | 🔑 |

---

## Proposed Solution

### Fix #1: Cap Accuracy Targets at 100%

```typescript
// convex/dailyChallenges.ts - generateChallengeForDate()

if (type === "accuracy" || type === "keys") {
  // Accuracy-based challenges should not exceed 100%
  const baseTarget = (template as { baseTarget: number }).baseTarget;
  // Use smaller variation for accuracy (±5%)
  const accuracyVariation = 1 + (dayOfMonth % 3) * 0.02; // 1.0 to 1.04
  targetValue = Math.min(100, Math.round(baseTarget * accuracyVariation));
} else {
  // Speed and endurance can use larger variation
  const baseTarget = (template as { baseTarget: number }).baseTarget;
  targetValue = Math.round(baseTarget * targetVariation);
}
```

### Fix #2: Use Fixed Tier Thresholds for Accuracy Challenges

Option A: Per-challenge-type tier thresholds (Recommended)
```typescript
const TIER_THRESHOLDS = {
  speed: { bronze: 0.5, silver: 0.75, gold: 1.0 },      // % of target WPM
  accuracy: { bronze: 90, silver: 95, gold: 99 },       // Fixed percentages
  endurance: { bronze: 0.5, silver: 0.75, gold: 1.0 },  // % of target words
  keys: { bronze: 85, silver: 92, gold: 98 },           // Fixed percentages
};

// In submitChallengeAttempt:
function calculateTier(challengeType: string, value: number, target: number) {
  const thresholds = TIER_THRESHOLDS[challengeType];

  if (challengeType === "accuracy" || challengeType === "keys") {
    // Fixed thresholds
    if (value >= thresholds.gold) return "gold";
    if (value >= thresholds.silver) return "silver";
    if (value >= thresholds.bronze) return "bronze";
  } else {
    // Percentage of target
    const percentage = value / target;
    if (percentage >= thresholds.gold) return "gold";
    if (percentage >= thresholds.silver) return "silver";
    if (percentage >= thresholds.bronze) return "bronze";
  }
  return "pending";
}
```

### Fix #3: Convert Endurance to Words or Fix Description

Option A: Measure words (calculate from characters)
```typescript
case "endurance":
  const avgWordLength = 5;
  const wordsTyped = Math.floor(stats.correctChars / avgWordLength);
  value = wordsTyped;
  break;
```

Option B: Change description to characters
```typescript
endurance: [
  { title: "MARATHON TYPER", description: "Type {target} characters without errors", baseTarget: 250 },
  // ...
],
```

**Recommendation**: Option A (calculate words from characters)

### Fix #4: Track Target Key Accuracy Separately

This requires changes to TypingArea to track per-key accuracy:

```typescript
// Enhanced TypingStats type
export interface TypingStats {
  wpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  totalChars: number;
  timeElapsed: number;
  keyAccuracy?: Record<string, { correct: number; total: number }>;  // NEW
}

// In DailyChallengeView measurement:
case "keys":
  if (stats.keyAccuracy && challenge.targetKeys) {
    // Calculate accuracy only for target keys
    let targetCorrect = 0;
    let targetTotal = 0;
    for (const key of challenge.targetKeys) {
      const keyStats = stats.keyAccuracy[key.toLowerCase()];
      if (keyStats) {
        targetCorrect += keyStats.correct;
        targetTotal += keyStats.total;
      }
    }
    value = targetTotal > 0 ? Math.round((targetCorrect / targetTotal) * 100) : 0;
  } else {
    value = stats.accuracy; // Fallback
  }
  break;
```

### Fix #5: Generate Dynamic Challenge Text

Create text generator that:
1. Uses word databases for variety
2. Generates appropriate length for challenge type
3. For keys challenges, generates text that emphasizes target keys

```typescript
// convex/dailyChallenges.ts
async function generateChallengeText(
  type: string,
  targetKeys?: string[],
  wordCount: number = 50
): Promise<string> {
  // Implementation to generate varied text
  // For keys challenges, filter words containing target keys
}
```

### Fix #6: Add Minimum WPM Check

```typescript
// In submitChallengeAttempt
if (challenge.challengeType === "accuracy") {
  const minWPM = 15; // Configurable
  if (args.wpm && args.wpm < minWPM) {
    return {
      tier: "pending",
      reason: "Minimum WPM not met",
      minRequired: minWPM,
    };
  }
}
```

### Fix #7: Use Consistent Icon

Update `DailyChallengeCard.tsx` line 86:
```typescript
case "keys":
  return "⌨️";  // Match DailyChallengeView
```

---

## Implementation Order

### Phase 1: Critical Fixes (Immediate)
1. [ ] Cap accuracy targets at 100%
2. [ ] Implement fixed tier thresholds for accuracy challenges
3. [ ] Fix icon consistency

### Phase 2: Measurement Fixes (High Priority)
4. [ ] Fix endurance word counting
5. [ ] Add minimum WPM check for accuracy challenges

### Phase 3: Enhanced Measurements (Medium Priority)
6. [ ] Track per-key accuracy in TypingArea
7. [ ] Update keys challenge to use target key accuracy

### Phase 4: Polish (Low Priority)
8. [ ] Generate dynamic challenge text
9. [ ] Add text variety from word databases

---

## Testing Checklist

### Target Generation
- [ ] Accuracy challenges never exceed 100%
- [ ] Speed challenges scale appropriately (40-56 WPM range)
- [ ] Endurance challenges scale appropriately
- [ ] Keys challenges have reasonable accuracy targets (90-98%)

### Tier Calculation
- [ ] Accuracy: Bronze at 90%, Silver at 95%, Gold at 99%
- [ ] Speed: Tiers at 50%, 75%, 100% of target
- [ ] Endurance: Tiers at 50%, 75%, 100% of target
- [ ] Keys: Bronze at 85%, Silver at 92%, Gold at 98%

### Measurements
- [ ] Endurance measures words (not characters)
- [ ] Keys challenge measures target key accuracy
- [ ] Minimum WPM enforced for accuracy challenges

### UI
- [ ] All challenge types show correct icons
- [ ] Target displays are sensible and achievable
- [ ] Tier progress accurately reflects achievable thresholds

---

## Summary Table

| Bug | Severity | Fix Complexity | Phase |
|-----|----------|----------------|-------|
| Impossible accuracy targets | CRITICAL | Low | 1 |
| Wrong tier system for accuracy | MAJOR | Medium | 1 |
| Endurance measures chars not words | MEDIUM | Low | 2 |
| Keys doesn't measure target keys | MEDIUM | High | 3 |
| Hardcoded challenge text | LOW | Medium | 4 |
| Missing min WPM check | LOW | Low | 2 |
| Inconsistent icons | TRIVIAL | Trivial | 1 |

---

## Changelog

| Date | Author | Changes |
|------|--------|---------|
| 2025-12-28 | Claude + Anton | Initial analysis from screenshot bug report |
