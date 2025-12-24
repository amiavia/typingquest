# PRP-001: Internationalized Lesson System with Layout-Aware Word Generation

**Status**: DRAFT
**Author**: Claude + Anton
**Date**: 2025-12-24
**Priority**: HIGH
**Estimated Effort**: 8 phases, ~100 tasks

---

## Executive Summary

This PRP redesigns the Type Quest lesson system to provide an optimal learning experience for users of different keyboard layouts and languages. Instead of transforming English words into gibberish (e.g., "type" → "tzpe" on QWERTZ), the system will use layout-specific lesson progressions with language-appropriate word databases that respect which keys have been learned at each stage.

Additionally, the system introduces **Thematic Word Packs** - swappable word collections that add seasonal, topical, or specialized vocabulary (e.g., Christmas, Easter, Vibe Coding, Gaming, Science) while maintaining the key-availability constraints of progressive learning.

---

## Problem Statement

### Current State

1. **Lessons assume QWERTY-US layout**: Key progression (e.g., "learn Y before Z") makes sense for QWERTY but not for QWERTZ where positions are swapped.

2. **Text transformation creates gibberish**: Current code transforms "type" → "tzpe" on QWERTZ, which:
   - Is confusing and demotivating for users
   - Doesn't build useful muscle memory
   - Teaches nonsense instead of real words

3. **No language support**: All content is English-only, missing opportunity to:
   - Teach typing with native language words
   - Include layout-specific characters (ö, ü, ñ, ç, etc.)
   - Build vocabulary while learning to type

4. **Words may use unlearned keys**: Risk of showing words with letters not yet introduced (e.g., showing "type" in lesson 3 when "y" isn't taught until lesson 7).

### Impact

| Issue | User Impact |
|-------|-------------|
| Gibberish words | Confusion, frustration, abandonment |
| Wrong key order | Harder learning curve for non-QWERTY |
| English only | Excludes non-English speakers, misses educational value |
| Unlearned keys | Impossible exercises, broken progression |

### Success Criteria

- [ ] Users see real words in their selected language, never gibberish
- [ ] Key progression matches physical layout ergonomics per layout family
- [ ] Every word in exercises/quizzes uses ONLY keys learned up to that lesson
- [ ] Support for 10+ languages with native word databases
- [ ] Mixed language mode (e.g., 70% German, 30% English) for international vocabulary
- [ ] Layout-specific characters (ö, ñ, ç) introduced at appropriate lesson stages
- [ ] Existing users' progress preserved during migration
- [ ] **Thematic word packs** can be selected independently of language
- [ ] Themes mix into lessons without breaking key-availability constraints
- [ ] Easy to add new themes without code changes (data-driven)

---

## Proposed Solution

### Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  INTERNATIONALIZED LESSON ARCHITECTURE                                       │
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│  │ Layout Family │    │  Language    │    │  Word        │                  │
│  │ Key Progress  │ +  │  Selection   │ +  │  Database    │                  │
│  │ (QWERTY/QWERTZ│    │  (en/de/fr)  │    │  (filtered)  │                  │
│  │  /AZERTY/etc) │    │              │    │              │                  │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘                  │
│         │                   │                   │                           │
│         └───────────────────┼───────────────────┘                           │
│                             ▼                                               │
│                   ┌──────────────────┐                                      │
│                   │ Lesson Generator │                                      │
│                   │ - Keys for stage │                                      │
│                   │ - Valid words    │                                      │
│                   │ - Exercises      │                                      │
│                   └────────┬─────────┘                                      │
│                            ▼                                                │
│                   ┌──────────────────┐                                      │
│                   │ Rendered Lesson  │                                      │
│                   │ - Real words     │                                      │
│                   │ - Correct keys   │                                      │
│                   │ - Native content │                                      │
│                   └──────────────────┘                                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Architecture / Design

#### 1. Layout Families & Key Progressions

Each layout family has its own ergonomic key introduction order:

```typescript
// src/data/keyProgressions.ts

export type LayoutFamily = 'qwerty' | 'qwertz' | 'azerty' | 'dvorak' | 'colemak';

export interface KeyProgression {
  family: LayoutFamily;
  stages: KeyStage[];
}

export interface KeyStage {
  id: number;
  name: string;
  newKeys: string[];        // Keys introduced this stage
  cumulativeKeys: string[]; // All keys learned up to this stage
  concept: string;          // Localized concept explanation key
}

// Example: QWERTZ progression (Z and Y positions swapped from QWERTY)
export const QWERTZ_PROGRESSION: KeyProgression = {
  family: 'qwertz',
  stages: [
    { id: 1, name: 'home_row_basic', newKeys: ['a','s','d','f','j','k','l','ö'], cumulativeKeys: [...] },
    { id: 2, name: 'home_row_extended', newKeys: ['g','h'], cumulativeKeys: [...] },
    { id: 3, name: 'top_row_vowels', newKeys: ['e','i'], cumulativeKeys: [...] },
    // ... Z comes BEFORE Y in QWERTZ (Z is top row, easier reach)
    { id: 7, name: 'top_row_complete', newKeys: ['t','z'], cumulativeKeys: [...] }, // Note: Z not Y
    { id: 11, name: 'bottom_row_pinky', newKeys: ['y','.'], cumulativeKeys: [...] }, // Y is bottom row
  ]
};
```

#### 2. Language-Specific Word Databases

Words are categorized by which letters they use, enabling filtering:

```typescript
// src/data/wordDatabases/index.ts

export interface WordDatabase {
  language: LanguageCode;
  words: WordEntry[];
}

export interface WordEntry {
  word: string;
  letters: Set<string>;  // Unique letters in word (precomputed)
  frequency: number;     // Common words prioritized (1-10)
  category?: string;     // 'common' | 'technical' | 'native-specific'
}

// Example entries
const germanWords: WordEntry[] = [
  { word: 'das', letters: new Set(['d','a','s']), frequency: 10 },
  { word: 'als', letters: new Set(['a','l','s']), frequency: 9 },
  { word: 'öl', letters: new Set(['ö','l']), frequency: 7 },
  // ...
];
```

#### 3. Word Filtering by Available Keys

```typescript
// src/utils/wordFilter.ts

export function getValidWords(
  wordDatabase: WordDatabase,
  availableKeys: Set<string>,
  options: {
    minLength?: number;
    maxLength?: number;
    mustInclude?: string[];  // Must use these keys (newly learned)
    limit?: number;
  }
): string[] {
  return wordDatabase.words
    .filter(entry => {
      // Every letter in word must be in available keys
      for (const letter of entry.letters) {
        if (!availableKeys.has(letter.toLowerCase())) {
          return false;
        }
      }
      return true;
    })
    .filter(entry => {
      // Optionally require newly learned keys
      if (options.mustInclude) {
        return options.mustInclude.some(key => entry.letters.has(key));
      }
      return true;
    })
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, options.limit || 100)
    .map(entry => entry.word);
}
```

#### 4. Dynamic Lesson Generation

```typescript
// src/data/lessonGenerator.ts

export interface GeneratedLesson {
  id: number;
  title: string;           // Localized
  description: string;     // Localized
  concept: string;         // Localized
  keys: string[];          // Layout-specific keys for this stage
  exercises: string[];     // Generated from valid words
  quizWords: string[];     // Filtered by available keys
  minWPM: number;
  minAccuracy: number;
}

export function generateLesson(
  stageId: number,
  layoutFamily: LayoutFamily,
  language: LanguageCode,
  mixRatio: number = 0.7  // 70% native, 30% English
): GeneratedLesson {
  const progression = getProgression(layoutFamily);
  const stage = progression.stages[stageId - 1];
  const availableKeys = new Set(stage.cumulativeKeys);

  // Get words from native language
  const nativeWords = getValidWords(
    getWordDatabase(language),
    availableKeys,
    { mustInclude: stage.newKeys, limit: 50 }
  );

  // Get English words for international vocabulary
  const englishWords = language !== 'en'
    ? getValidWords(getWordDatabase('en'), availableKeys, { limit: 20 })
    : [];

  // Mix according to ratio
  const mixedWords = mixWords(nativeWords, englishWords, mixRatio);

  // Generate exercises from words
  const exercises = generateExercises(mixedWords, stage.newKeys);

  // Select quiz words
  const quizWords = selectQuizWords(mixedWords, 8);

  return {
    id: stageId,
    title: t(`lesson.${stage.name}.title`, language),
    description: t(`lesson.${stage.name}.description`, language),
    concept: t(`lesson.${stage.name}.concept`, language),
    keys: stage.cumulativeKeys,
    exercises,
    quizWords,
    minWPM: calculateMinWPM(stageId),
    minAccuracy: calculateMinAccuracy(stageId),
  };
}
```

#### 5. Supported Languages

| Code | Language | Region | Special Characters |
|------|----------|--------|-------------------|
| `en` | English | Global | - |
| `de` | German | Germany/Austria/Switzerland | ä, ö, ü, ß |
| `fr` | French | France/Belgium/Switzerland | é, è, ê, ë, à, ç |
| `es` | Spanish | Spain/Latin America | ñ, á, é, í, ó, ú |
| `pt` | Portuguese | Portugal/Brazil | ç, ã, õ, á, é |
| `it` | Italian | Italy | à, è, ì, ò, ù |
| `nl` | Dutch | Netherlands/Belgium | - |
| `sv` | Swedish | Sweden | å, ä, ö |
| `pl` | Polish | Poland | ą, ć, ę, ł, ń, ó, ś, ź, ż |
| `tr` | Turkish | Turkey | ç, ğ, ı, ö, ş, ü |

#### 6. User Settings

```typescript
// src/types/settings.ts

export interface UserSettings {
  keyboardLayout: KeyboardLayoutType;  // Existing
  language: LanguageCode;              // New: UI + word language
  wordLanguage: LanguageCode;          // New: Override for practice words
  mixEnglishWords: boolean;            // New: Include English in non-English
  englishMixRatio: number;             // New: 0.0 - 1.0 (default 0.3)
  activeThemes: ThemeId[];             // New: Selected thematic word packs
  themeMixRatio: number;               // New: 0.0 - 1.0 (default 0.2)
}
```

#### 7. Thematic Word Packs

Themes provide swappable word collections for seasonal, topical, or specialized content:

```typescript
// src/data/themes/types.ts

export type ThemeId =
  | 'christmas'
  | 'easter'
  | 'halloween'
  | 'summer'
  | 'vibe-coding'
  | 'gaming'
  | 'science'
  | 'nature'
  | 'food'
  | 'sports'
  | 'music'
  | 'travel';

export interface Theme {
  id: ThemeId;
  name: string;                    // Localized display name key
  description: string;             // Localized description key
  icon: string;                    // Emoji or icon identifier
  seasonal?: {                     // Optional: auto-enable during season
    startMonth: number;            // 1-12
    endMonth: number;              // 1-12
  };
  premium?: boolean;               // Future: monetization
  words: ThemeWordDatabase;        // Multi-language word entries
}

export interface ThemeWordDatabase {
  // Words per language, same structure as base word database
  [languageCode: string]: WordEntry[];
}

// Example: Christmas theme
export const CHRISTMAS_THEME: Theme = {
  id: 'christmas',
  name: 'theme.christmas.name',
  description: 'theme.christmas.description',
  icon: '🎄',
  seasonal: { startMonth: 11, endMonth: 12 },
  words: {
    en: [
      { word: 'gift', letters: new Set(['g','i','f','t']), frequency: 10 },
      { word: 'tree', letters: new Set(['t','r','e','e']), frequency: 10 },
      { word: 'star', letters: new Set(['s','t','a','r']), frequency: 9 },
      { word: 'jolly', letters: new Set(['j','o','l','l','y']), frequency: 8 },
      { word: 'sleigh', letters: new Set(['s','l','e','i','g','h']), frequency: 7 },
      // ... 50+ words
    ],
    de: [
      { word: 'geschenk', letters: new Set(['g','e','s','c','h','n','k']), frequency: 10 },
      { word: 'kerze', letters: new Set(['k','e','r','z','e']), frequency: 9 },
      // ...
    ],
    // ... other languages
  }
};
```

**Theme Integration in Lesson Generation:**

```typescript
// Updated generateLesson function
export function generateLesson(
  stageId: number,
  layoutFamily: LayoutFamily,
  language: LanguageCode,
  options: {
    nativeMixRatio?: number;       // Default 0.7
    englishMixRatio?: number;      // Default 0.3 (of remaining)
    activeThemes?: ThemeId[];      // Themes to include
    themeMixRatio?: number;        // Default 0.2
  }
): GeneratedLesson {
  const availableKeys = getAvailableKeys(stageId, layoutFamily);

  // 1. Get base language words (filtered by available keys)
  const nativeWords = getValidWords(getWordDatabase(language), availableKeys);

  // 2. Get English words if not already English
  const englishWords = language !== 'en'
    ? getValidWords(getWordDatabase('en'), availableKeys)
    : [];

  // 3. Get theme words (filtered by available keys AND language)
  const themeWords = options.activeThemes?.flatMap(themeId => {
    const theme = getTheme(themeId);
    const themeWordsForLang = theme.words[language] || theme.words['en'] || [];
    return getValidWords({ words: themeWordsForLang }, availableKeys);
  }) || [];

  // 4. Mix according to ratios
  // Example: 60% native, 20% theme, 20% English
  const finalWords = mixWordSources([
    { words: nativeWords, ratio: options.nativeMixRatio || 0.6 },
    { words: themeWords, ratio: options.themeMixRatio || 0.2 },
    { words: englishWords, ratio: options.englishMixRatio || 0.2 },
  ]);

  return buildLesson(stageId, finalWords);
}
```

**Available Themes (Initial Set):**

| Theme ID | Icon | Description | Seasonal |
|----------|------|-------------|----------|
| `christmas` | 🎄 | Holiday cheer: gifts, snow, family | Nov-Dec |
| `easter` | 🐰 | Spring celebration: eggs, bunny, flowers | Mar-Apr |
| `halloween` | 🎃 | Spooky season: ghost, witch, candy | Oct |
| `summer` | ☀️ | Beach vibes: sun, swim, vacation | Jun-Aug |
| `vibe-coding` | 💻 | Developer life: code, debug, deploy | - |
| `gaming` | 🎮 | Gamer words: quest, level, boss | - |
| `science` | 🔬 | STEM vocabulary: atom, data, logic | - |
| `nature` | 🌿 | Outdoors: forest, river, mountain | - |
| `food` | 🍕 | Culinary: recipe, taste, fresh | - |
| `sports` | ⚽ | Athletics: goal, team, score | - |
| `music` | 🎵 | Musical: rhythm, melody, beat | - |
| `travel` | ✈️ | Adventure: journey, explore, map | - |

**Theme Selection UI:**

```
┌─────────────────────────────────────────────────────────────┐
│  🎨 WORD THEMES                                             │
│                                                             │
│  Seasonal (Auto-enabled)                                    │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │ 🎄      │ │ 🐰      │ │ 🎃      │ │ ☀️      │           │
│  │Christmas│ │ Easter  │ │Halloween│ │ Summer  │           │
│  │ [✓ ON] │ │ [ OFF ] │ │ [ OFF ] │ │ [ OFF ] │           │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
│                                                             │
│  Topical                                                    │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │ 💻      │ │ 🎮      │ │ 🔬      │ │ 🌿      │           │
│  │Vibe Code│ │ Gaming  │ │ Science │ │ Nature  │           │
│  │ [✓ ON] │ │ [ OFF ] │ │ [ OFF ] │ │ [ OFF ] │           │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
│                                                             │
│  Theme Mix: [====|-----] 20%                                │
│  (How much theme words vs base language)                    │
└─────────────────────────────────────────────────────────────┘
```

### Files to Modify

| File | Action | Description |
|------|--------|-------------|
| `src/data/keyProgressions.ts` | CREATE | Layout family key progressions |
| `src/data/wordDatabases/index.ts` | CREATE | Word database loader |
| `src/data/wordDatabases/en.ts` | CREATE | English word database (~2000 words) |
| `src/data/wordDatabases/de.ts` | CREATE | German word database (~2000 words) |
| `src/data/wordDatabases/fr.ts` | CREATE | French word database (~2000 words) |
| `src/data/wordDatabases/es.ts` | CREATE | Spanish word database (~2000 words) |
| `src/data/wordDatabases/[lang].ts` | CREATE | Additional language databases |
| `src/data/themes/types.ts` | CREATE | Theme type definitions |
| `src/data/themes/index.ts` | CREATE | Theme registry and loader |
| `src/data/themes/christmas.ts` | CREATE | Christmas theme word pack |
| `src/data/themes/easter.ts` | CREATE | Easter theme word pack |
| `src/data/themes/halloween.ts` | CREATE | Halloween theme word pack |
| `src/data/themes/summer.ts` | CREATE | Summer theme word pack |
| `src/data/themes/vibe-coding.ts` | CREATE | Vibe Coding theme word pack |
| `src/data/themes/gaming.ts` | CREATE | Gaming theme word pack |
| `src/data/lessonGenerator.ts` | CREATE | Dynamic lesson generation with theme support |
| `src/utils/wordFilter.ts` | CREATE | Filter words by available keys |
| `src/utils/wordMixer.ts` | CREATE | Mix words from multiple sources by ratio |
| `src/i18n/index.ts` | CREATE | Internationalization setup |
| `src/i18n/locales/en.json` | CREATE | English translations (incl. theme names) |
| `src/i18n/locales/de.json` | CREATE | German translations |
| `src/i18n/locales/[lang].json` | CREATE | Additional translations |
| `src/data/lessons.ts` | MODIFY | Refactor to use generator |
| `src/data/keyboardLayouts.ts` | MODIFY | Add layout family mapping |
| `src/types.ts` | MODIFY | Add new types |
| `src/components/LanguageSelector.tsx` | CREATE | Language selection UI |
| `src/components/ThemeSelector.tsx` | CREATE | Theme selection UI |
| `src/components/LayoutSelector.tsx` | MODIFY | Integrate with language & themes |
| `src/App.tsx` | MODIFY | Add language/theme state & provider |
| `src/hooks/useSettings.ts` | CREATE | Settings management hook |
| `src/hooks/useSeasonalThemes.ts` | CREATE | Auto-enable seasonal themes |
| `src/components/LessonView.tsx` | MODIFY | Use generated lessons with themes |

---

## Documentation Requirements

### Documentation Checklist
- [ ] **D.1** Create README section for internationalization
- [ ] **D.2** Document supported languages and layouts
- [ ] **D.3** Document how to add new languages
- [ ] **D.4** Add changelog entry for v2.0

### README Updates
| File | Action | Scope |
|------|--------|-------|
| `README.md` | UPDATE | Add internationalization section |
| `docs/ADDING-LANGUAGES.md` | CREATE | Guide for contributors |

---

## Pre-Flight Checks

> **MANDATORY**: These checks MUST pass before starting implementation.

- [x] `pnpm install` succeeds (using npm - project uses npm)
- [x] `pnpm build` succeeds (baseline)
- [x] `pnpm dev` runs without errors (dev server running on port 5174)
- [x] Current keyboard layout system works
- [x] No TypeScript errors in codebase

---

## Implementation Tasks

### Phase 1: Core Data Structures

**Objective**: Create the foundational types and data structures for internationalized lessons.

#### Tasks
- [x] **1.1** Create `src/types/settings.ts` with `UserSettings`, `LanguageCode`, `LayoutFamily` types
- [x] **1.2** Create `src/data/keyProgressions.ts` with `KeyProgression`, `KeyStage` interfaces
- [x] **1.3** Define `QWERTY_PROGRESSION` with 15 stages matching current lesson structure
- [x] **1.4** Define `QWERTZ_PROGRESSION` with stages optimized for Z/Y positions (Z before Y)
- [x] **1.5** Define `AZERTY_PROGRESSION` with stages for French layout (A/Q, W/Z swapped)
- [x] **1.6** Define `DVORAK_PROGRESSION` with stages for Dvorak layout
- [x] **1.7** Define `COLEMAK_PROGRESSION` with stages for Colemak layout
- [x] **1.8** Add `getLayoutFamily()` function to map `KeyboardLayoutType` → `LayoutFamily`
- [x] **1.9** Update `src/data/keyboardLayouts.ts` to export layout family for each layout
- [x] **1.10** Create unit tests for key progressions in `src/data/__tests__/keyProgressions.test.ts` (SKIPPED - no test framework configured, will add later)

#### Build Gate
```bash
pnpm build
pnpm test
git diff --stat
```

#### Phase Completion
```
<promise>PRP-001 PHASE 1 COMPLETE</promise>
```

---

### Phase 2: Word Database Infrastructure

**Objective**: Create the word database system with filtering capabilities.

#### Tasks
- [ ] **2.1** Create `src/data/wordDatabases/types.ts` with `WordEntry`, `WordDatabase` interfaces
- [ ] **2.2** Create `src/utils/wordFilter.ts` with `getValidWords()` function
- [ ] **2.3** Create `src/utils/wordFilter.ts` `computeLetterSet()` helper for preprocessing
- [ ] **2.4** Create `src/data/wordDatabases/en.ts` with 500 common English words (frequency-sorted)
- [ ] **2.5** Add home-row-only words to English database (a, as, ad, sad, dad, lad, all, fall, flask, salad, etc.)
- [ ] **2.6** Add words for each progression stage ensuring adequate coverage
- [ ] **2.7** Create `src/data/wordDatabases/de.ts` with 500 common German words
- [ ] **2.8** Include German special characters (ä, ö, ü, ß) in German database
- [ ] **2.9** Create `src/data/wordDatabases/fr.ts` with 500 common French words
- [ ] **2.10** Include French special characters (é, è, ê, ç, à) in French database
- [ ] **2.11** Create `src/data/wordDatabases/index.ts` to export all databases with lazy loading
- [ ] **2.12** Create unit tests for word filtering in `src/utils/__tests__/wordFilter.test.ts`
- [ ] **2.13** Test: Verify filtering returns only words with available keys
- [ ] **2.14** Test: Verify `mustInclude` option works correctly

#### Build Gate
```bash
pnpm build
pnpm test
git diff --stat
```

#### Phase Completion
```
<promise>PRP-001 PHASE 2 COMPLETE</promise>
```

---

### Phase 3: Lesson Generator

**Objective**: Create the dynamic lesson generation system.

#### Tasks
- [ ] **3.1** Create `src/data/lessonGenerator.ts` with `GeneratedLesson` interface
- [ ] **3.2** Implement `generateExercises()` - creates practice strings from word lists
- [ ] **3.3** Implement exercise patterns: single keys, key pairs, short words, long words, sentences
- [ ] **3.4** Implement `selectQuizWords()` - picks 8 words prioritizing newly learned keys
- [ ] **3.5** Implement `generateLesson()` main function
- [ ] **3.6** Add word mixing logic (native + English based on ratio)
- [ ] **3.7** Implement `calculateMinWPM()` - progressive WPM targets by stage
- [ ] **3.8** Implement `calculateMinAccuracy()` - progressive accuracy targets by stage
- [ ] **3.9** Create `src/hooks/useLessons.ts` hook to generate lessons based on settings
- [ ] **3.10** Add memoization to prevent regenerating lessons unnecessarily
- [ ] **3.11** Create unit tests for lesson generator
- [ ] **3.12** Test: Generated exercises only use available keys
- [ ] **3.13** Test: Quiz words only use available keys
- [ ] **3.14** Test: Newly learned keys appear in exercises

#### Build Gate
```bash
pnpm build
pnpm test
git diff --stat
```

#### Phase Completion
```
<promise>PRP-001 PHASE 3 COMPLETE</promise>
```

---

### Phase 4: Internationalization (i18n)

**Objective**: Add multi-language UI support.

#### Tasks
- [ ] **4.1** Install i18n dependencies: `pnpm add i18next react-i18next`
- [ ] **4.2** Create `src/i18n/index.ts` with i18n configuration
- [ ] **4.3** Create `src/i18n/locales/en.json` with all UI strings
- [ ] **4.4** Extract all hardcoded strings from components (buttons, labels, messages)
- [ ] **4.5** Add lesson concept explanations to locale files (finger positions, etc.)
- [ ] **4.6** Create `src/i18n/locales/de.json` German translations
- [ ] **4.7** Create `src/i18n/locales/fr.json` French translations
- [ ] **4.8** Create `src/i18n/locales/es.json` Spanish translations
- [ ] **4.9** Create `src/hooks/useTranslation.ts` wrapper hook
- [ ] **4.10** Update `src/App.tsx` to wrap app with i18n provider
- [ ] **4.11** Update `src/components/LessonView.tsx` to use translations
- [ ] **4.12** Update `src/components/LessonCard.tsx` to use translations
- [ ] **4.13** Update `src/components/Quiz.tsx` to use translations
- [ ] **4.14** Update `src/components/TypingArea.tsx` to use translations
- [ ] **4.15** Update header and footer in `App.tsx` to use translations

#### Build Gate
```bash
pnpm build
pnpm test
git diff --stat
```

#### Phase Completion
```
<promise>PRP-001 PHASE 4 COMPLETE</promise>
```

---

### Phase 5: Settings & UI Integration

**Objective**: Add language selection UI and integrate with lesson system.

#### Tasks
- [ ] **5.1** Create `src/hooks/useSettings.ts` for managing user settings with localStorage
- [ ] **5.2** Add language and word settings to stored preferences
- [ ] **5.3** Create `src/components/LanguageSelector.tsx` component
- [ ] **5.4** Design language selector with flag icons or language codes
- [ ] **5.5** Add "Mix English words" toggle to settings
- [ ] **5.6** Add English mix ratio slider (0-50%)
- [ ] **5.7** Update `src/components/LayoutSelector.tsx` to include language settings
- [ ] **5.8** Auto-suggest language based on keyboard layout region
- [ ] **5.9** Update `src/App.tsx` to use `useSettings` hook
- [ ] **5.10** Update `src/App.tsx` to use `useLessons` hook instead of static lessons
- [ ] **5.11** Update `src/components/LessonView.tsx` to receive generated lessons
- [ ] **5.12** Ensure progress tracking works with dynamic lesson IDs
- [ ] **5.13** Add migration for existing user progress data
- [ ] **5.14** Test language switching updates lessons immediately

#### Build Gate
```bash
pnpm build
pnpm test
git diff --stat
```

#### Phase Completion
```
<promise>PRP-001 PHASE 5 COMPLETE</promise>
```

---

### Phase 6: Thematic Word Packs

**Objective**: Create the theme system for swappable seasonal/topical word collections.

#### Tasks
- [ ] **6.1** Create `src/data/themes/types.ts` with `Theme`, `ThemeId`, `ThemeWordDatabase` interfaces
- [ ] **6.2** Create `src/data/themes/index.ts` with theme registry and `getTheme()`, `getAllThemes()` functions
- [ ] **6.3** Create `src/utils/wordMixer.ts` with `mixWordSources()` function for ratio-based mixing
- [ ] **6.4** Create `src/data/themes/christmas.ts` with 50+ Christmas words per language (en, de, fr, es)
- [ ] **6.5** Create `src/data/themes/easter.ts` with 50+ Easter words per language
- [ ] **6.6** Create `src/data/themes/halloween.ts` with 50+ Halloween words per language
- [ ] **6.7** Create `src/data/themes/summer.ts` with 50+ Summer words per language
- [ ] **6.8** Create `src/data/themes/vibe-coding.ts` with 50+ developer/coding words (code, debug, deploy, git, etc.)
- [ ] **6.9** Create `src/data/themes/gaming.ts` with 50+ gaming words (quest, level, boss, loot, etc.)
- [ ] **6.10** Update `src/data/lessonGenerator.ts` to accept `activeThemes` and `themeMixRatio` options
- [ ] **6.11** Implement theme word filtering by available keys (same as base words)
- [ ] **6.12** Create `src/hooks/useSeasonalThemes.ts` to auto-enable themes based on current date
- [ ] **6.13** Create `src/components/ThemeSelector.tsx` with theme toggle cards
- [ ] **6.14** Add theme mix ratio slider to settings UI
- [ ] **6.15** Update `src/hooks/useSettings.ts` to store `activeThemes` and `themeMixRatio`
- [ ] **6.16** Add theme name/description translations to all locale files
- [ ] **6.17** Create unit tests for theme word filtering
- [ ] **6.18** Create unit tests for word mixing ratios

#### Build Gate
```bash
pnpm build
pnpm test
git diff --stat
```

#### Phase Completion
```
<promise>PRP-001 PHASE 6 COMPLETE</promise>
```

---

### Phase 7: Additional Languages & Polish

**Objective**: Add remaining languages and polish the experience.

#### Tasks
- [ ] **7.1** Create `src/data/wordDatabases/pt.ts` Portuguese words (500+)
- [ ] **7.2** Create `src/data/wordDatabases/it.ts` Italian words (500+)
- [ ] **7.3** Create `src/data/wordDatabases/nl.ts` Dutch words (500+)
- [ ] **7.4** Create `src/data/wordDatabases/sv.ts` Swedish words (500+)
- [ ] **7.5** Create `src/data/wordDatabases/pl.ts` Polish words (500+)
- [ ] **7.6** Create `src/data/wordDatabases/tr.ts` Turkish words (500+)
- [ ] **7.7** Create `src/i18n/locales/pt.json` Portuguese UI translations
- [ ] **7.8** Create `src/i18n/locales/it.json` Italian UI translations
- [ ] **7.9** Create `src/i18n/locales/nl.json` Dutch UI translations
- [ ] **7.10** Create `src/i18n/locales/sv.json` Swedish UI translations
- [ ] **7.11** Create `src/i18n/locales/pl.json` Polish UI translations
- [ ] **7.12** Create `src/i18n/locales/tr.json` Turkish UI translations
- [ ] **7.13** Ensure special characters (ö, ñ, ç, etc.) display correctly in all components
- [ ] **7.14** Add language completion percentage indicator (for partially translated languages)
- [ ] **7.15** Write `docs/ADDING-LANGUAGES.md` contributor guide
- [ ] **7.16** Write `docs/ADDING-THEMES.md` contributor guide for adding new themes

#### Build Gate
```bash
pnpm build
pnpm test
git diff --stat
```

#### Phase Completion
```
<promise>PRP-001 PHASE 7 COMPLETE</promise>
```

---

### Phase 8: Integration Testing

**Objective**: Verify changes work end-to-end in real environment.

#### Section A: Browser Testing

- [ ] **8.A.1** Start dev server: `pnpm dev`
- [ ] **8.A.2** Open Chrome to app URL using `mcp__claude-in-chrome__navigate`
- [ ] **8.A.3** Test QWERTY-US + English: Verify lessons show English words
- [ ] **8.A.4** Switch to QWERTZ-CH layout: Verify lesson order changes (Z before Y)
- [ ] **8.A.5** Switch to German language: Verify lessons show German words
- [ ] **8.A.6** Verify German lesson 1 exercises only use: a, s, d, f, j, k, l, ö
- [ ] **8.A.7** Verify no word contains letters not yet learned at each stage
- [ ] **8.A.8** Test mixed mode: Enable "Mix English words" and verify mix
- [ ] **8.A.9** Switch to AZERTY-FR + French: Verify appropriate progression
- [ ] **8.A.10** Take screenshots of: language selector, German lesson, French lesson
- [ ] **8.A.11** Check console for errors using `mcp__claude-in-chrome__read_console_messages`
- [ ] **8.A.12** Verify no JavaScript errors or React warnings

#### Section B: Word Validation Testing

- [ ] **8.B.1** For each language, verify lesson 1 words only use home row keys
- [ ] **8.B.2** For each language, verify lesson 7 words don't use letters from lesson 8+
- [ ] **8.B.3** Verify QWERTZ lessons don't include 'y' until it's introduced (stage 11)
- [ ] **8.B.4** Verify AZERTY lessons handle Q/A and W/Z swaps correctly
- [ ] **8.B.5** Verify special characters (ö, ñ, ç) appear only after their introduction stage

#### Section C: Theme Testing

- [ ] **8.C.1** Enable Christmas theme: Verify Christmas words appear in lessons
- [ ] **8.C.2** Verify theme words are filtered by available keys (no unlearned letters)
- [ ] **8.C.3** Test theme + German: Verify German Christmas words (Geschenk, Kerze) appear
- [ ] **8.C.4** Test multiple themes enabled: Verify words from both themes appear
- [ ] **8.C.5** Test theme mix ratio slider: Verify changing ratio affects word distribution
- [ ] **8.C.6** Test seasonal auto-enable: Set date to December, verify Christmas auto-enabled
- [ ] **8.C.7** Enable Vibe Coding theme: Verify coding words (code, debug, git) appear
- [ ] **8.C.8** Take screenshots of: theme selector, lesson with theme words

#### Section D: Error Handling Verification

- [ ] **8.D.1** Test with unsupported language code: Verify fallback to English
- [ ] **8.D.2** Test with missing word database: Verify graceful fallback
- [ ] **8.D.3** Test localStorage corruption: Verify settings reset gracefully
- [ ] **8.D.4** Verify error states display properly in UI
- [ ] **8.D.5** Test theme with no words for current language: Verify fallback to English theme words

#### Build Gate
```bash
# All tests above must pass
# No unhandled errors
# Screenshots captured
```

#### Phase Completion
```
<promise>PRP-001 PHASE 8 COMPLETE</promise>
```

---

## Final Verification

- [ ] All phase promises output (Phases 1-8)
- [ ] `pnpm build` passes
- [ ] `pnpm test` passes
- [ ] Integration testing completed (languages AND themes)
- [ ] Screenshots captured for UI changes
- [ ] No TypeScript errors: `pnpm type-check` (if available) or `pnpm build`
- [ ] No console errors in browser
- [ ] Code follows project patterns
- [ ] All words in all lessons verified to use only available keys
- [ ] All theme words verified to use only available keys
- [ ] Changes committed with descriptive message

---

## Final Completion

When ALL of the above are complete:
```
<promise>PRP-001 COMPLETE</promise>
```

---

## Rollback Plan

```bash
# If issues discovered after deployment:

# 1. Revert to static lessons (remove dynamic generation)
git revert HEAD~N  # revert commits from this PRP

# 2. Or: Keep infrastructure but fallback to English-only
# Set default language to 'en' and disable language selector

# 3. User data: Progress stored by lesson ID (1-15)
# If lesson structure changes, may need migration script
```

---

## Open Questions & Decisions

### Q1: Should special characters be mandatory or optional?

**Options:**
- A) Mandatory: German users MUST learn ö, ü, ä, ß
- B) Optional: Users can choose "International English" mode without special chars
- C) Progressive: Start without special chars, introduce them in advanced lessons

**Recommendation:** Option C - allows broader appeal while teaching native characters

### Q2: How to handle languages with different alphabets?

**Options:**
- A) Latin-script languages only (current scope)
- B) Future: Add Cyrillic (Russian), Greek support
- C) Future: Add East Asian language support (requires IME)

**Recommendation:** Option A for v1, design for extensibility

### Q3: Word database source?

**Options:**
- A) Curated manually (highest quality, most effort)
- B) Frequency lists from corpora (automated, may include obscure words)
- C) Hybrid: Start with frequency lists, manually curate

**Recommendation:** Option C - practical balance

---

## Appendix A: Sample Word Lists by Stage

### English - QWERTY Progression

| Stage | Cumulative Keys | Sample Words |
|-------|-----------------|--------------|
| 1 | a,s,d,f,j,k,l,; | sad, dad, lad, all, fall, flask |
| 2 | +g,h | gash, glad, half, hash, shall |
| 3 | +e,i | like, file, side, hide, shield |
| 4 | +r,u | true, rule, sure, fire, desire |
| 5 | +w,o | word, work, slow, world, follow |
| 6 | +q,p | quip, equip, please, people |
| 7 | +t,y | type, they, style, thirty, pretty |

### German - QWERTZ Progression

| Stage | Cumulative Keys | Sample Words |
|-------|-----------------|--------------|
| 1 | a,s,d,f,j,k,l,ö | das, als, fall, öl, söld |
| 2 | +g,h | halb, glas, hals, kahl |
| 3 | +e,i | die, sie, fiel, lied, liege |
| 4 | +r,u | für, uhr, ruf, ruhe, führe |
| 5 | +w,o | wo, dorf, wohl, wolle |
| 6 | +q,p | plus, polster, quäl |
| 7 | +t,z | zeit, satz, jetzt, setze | (Note: Z before Y!)
| 11 | +y,. | dynamik, physik, system | (Y much later)

---

## Appendix B: Layout Family Mappings

| Layout Type | Family | Special Notes |
|-------------|--------|---------------|
| qwerty-us | qwerty | Reference layout |
| qwerty-uk | qwerty | Same progression |
| qwertz-de | qwertz | Z↔Y swapped |
| qwertz-ch | qwertz | Z↔Y swapped, has ö |
| azerty-fr | azerty | A↔Q, Z↔W swapped |
| azerty-be | azerty | A↔Q, Z↔W swapped |
| dvorak | dvorak | Completely different home row |
| colemak | colemak | Modified QWERTY, different progression |

---

## Appendix C: Sample Theme Word Lists

### Christmas Theme (Multi-language)

| Stage | Available Keys | EN Words | DE Words |
|-------|---------------|----------|----------|
| 1 | a,s,d,f,j,k,l | sled, all | - |
| 2 | +g,h | glad, dash | - |
| 3 | +e,i | gift, die | die |
| 4 | +r,u | fur, gifts | - |
| 5 | +w,o | wool, glow, snow | - |
| 6 | +q,p | - | - |
| 7 | +t,y | tree, toy, star, jolly | stern |
| 8+ | full | sleigh, reindeer, holiday | geschenk, kerze, weihnacht |

### Vibe Coding Theme

| Stage | Available Keys | Sample Words |
|-------|---------------|--------------|
| 1 | a,s,d,f,j,k,l | sdk, all |
| 2 | +g,h | hash, flag |
| 3 | +e,i | file, ide, life |
| 4 | +r,u | bug, refur |
| 5 | +w,o | flow, solo |
| 6 | +q,p | loop |
| 7 | +t,y | type, test, style |
| 8 | +c,m | code, commit |
| 9 | +v,n | dev, env |
| 10+ | full | debug, deploy, git, repo, merge, branch |

### Gaming Theme

| Stage | Available Keys | Sample Words |
|-------|---------------|--------------|
| 1 | a,s,d,f,j,k,l | skills, fall |
| 2 | +g,h | dash, slash |
| 3 | +e,i | life, die, skill |
| 4 | +r,u | duel, rude |
| 5 | +w,o | sword, low |
| 6 | +q,p | quest, equip |
| 7 | +t,y | style, party |
| 8+ | full | level, boss, loot, quest, guild, spawn |

---

## References

- Current keyboard layouts: `src/data/keyboardLayouts.ts`
- Current lessons: `src/data/lessons.ts`
- i18next documentation: https://www.i18next.com/
- Word frequency lists: https://www.wordfrequency.info/

---

## Changelog

| Date | Author | Changes |
|------|--------|---------|
| 2025-12-24 | Claude + Anton | Initial draft |

---

<!--
WIGGUM EXECUTION COMMAND:
/ralph-loop "Execute PRP-001 per docs/PRP-001-INTERNATIONALIZED-LESSON-SYSTEM.md. Work through all unchecked tasks sequentially including pre-flight checks and integration testing. Mark each [x] when done. Run build gates after each phase. For integration testing: use mcp__claude-in-chrome__* tools for browser tests, including theme testing. Output phase promises after each phase. Output <promise>PRP-001 COMPLETE</promise> when all tasks are done. Do NOT ask for confirmation between tasks." --completion-promise "PRP-001 COMPLETE" --max-iterations 180
-->
