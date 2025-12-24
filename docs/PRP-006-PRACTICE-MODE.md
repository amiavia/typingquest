# PRP-006: Free-Form Practice Mode

**Status**: DRAFT
**Author**: Anton
**Date**: 2025-12-25
**Priority**: MEDIUM
**Estimated Effort**: 6 phases, ~60 tasks

---

## Executive Summary

This PRP adds a free-form practice mode to TypeBit8 that allows users to practice typing without the structured constraints of lessons. Users can practice with random words, custom text, endless mode challenges, or focus on specific weak keys. The practice mode provides a pressure-free environment with optional statistics tracking and quick access from the home page.

Unlike the structured lesson system which enforces progression and scoring requirements, practice mode offers flexibility for users who want to improve their typing skills through casual practice or targeted key training.

---

## Problem Statement

### Current State

1. **No casual practice option**: Users can only practice through structured lessons with fixed progression requirements and scoring thresholds.

2. **Limited word practice**: Users cannot practice with random words outside of lesson context or use their own custom text.

3. **No weak key targeting**: No way for users to specifically practice keys they struggle with.

4. **Pressure-based learning only**: All practice requires meeting WPM and accuracy targets, which can be demotivating.

5. **No custom text support**: Users cannot practice with real-world text like articles, code snippets, or their own content.

### Impact

| Issue | User Impact |
|-------|-------------|
| Lessons only | Cannot practice casually between lessons |
| No custom text | Cannot practice with relevant/interesting content |
| No weak key focus | Slow improvement on problem keys |
| Always scored | Performance anxiety, discouragement |
| Rigid structure | Less engagement, premature abandonment |

### Success Criteria

- [ ] Users can start practice from home page with one click
- [ ] Random word practice uses word databases with language support
- [ ] Custom text input accepts and parses any user text
- [ ] Endless mode tracks mistakes and ends after X errors
- [ ] Specific key focus generates text emphasizing chosen keys
- [ ] Optional statistics tracking (WPM, accuracy, time)
- [ ] No scoring pressure option disables performance metrics
- [ ] Practice sessions save to history (optional)
- [ ] Quick restart/new practice flows

---

## Proposed Solution

### Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PRACTICE MODE ARCHITECTURE                                                  │
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│  │ Practice     │    │  Text        │    │  Statistics  │                  │
│  │ Mode Type    │ +  │  Generator   │ +  │  Tracker     │                  │
│  │ Selection    │    │              │    │  (Optional)  │                  │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘                  │
│         │                   │                   │                           │
│         └───────────────────┼───────────────────┘                           │
│                             ▼                                               │
│                   ┌──────────────────┐                                      │
│                   │ Practice Session │                                      │
│                   │ - Text content   │                                      │
│                   │ - Typing area    │                                      │
│                   │ - Live stats     │                                      │
│                   │ - Quick actions  │                                      │
│                   └────────┬─────────┘                                      │
│                            ▼                                                │
│                   ┌──────────────────┐                                      │
│                   │ Practice History │                                      │
│                   │ (Optional save)  │                                      │
│                   └──────────────────┘                                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Architecture / Design

#### 1. Practice Mode Types

```typescript
// src/types/practice.ts

export type PracticeModeType =
  | 'random-words'
  | 'custom-text'
  | 'endless-mode'
  | 'key-focus';

export interface PracticeConfig {
  mode: PracticeModeType;
  options: PracticeModeOptions;
}

export interface PracticeModeOptions {
  // Random Words options
  wordCount?: number;           // Number of words to practice (10-200)
  language?: LanguageCode;      // Language for word database
  includeThemes?: ThemeId[];    // Include themed words

  // Custom Text options
  customText?: string;          // User-provided text

  // Endless Mode options
  maxMistakes?: number;         // End after X mistakes (1-50)

  // Key Focus options
  targetKeys?: string[];        // Keys to emphasize (e.g., ['y', 'z'])
  focusRatio?: number;          // 0.0-1.0, how much to emphasize keys

  // General options
  showStats?: boolean;          // Show WPM/accuracy
  saveHistory?: boolean;        // Save session to history
  difficulty?: 'easy' | 'medium' | 'hard';  // Word/text complexity
}

export interface PracticeSession {
  id: string;
  mode: PracticeModeType;
  config: PracticeConfig;
  text: string;                 // Generated or custom text
  startTime: number;
  endTime?: number;

  // Statistics (if enabled)
  stats?: {
    wpm: number;
    accuracy: number;
    mistakes: number;
    timeElapsed: number;
    keyStats: Record<string, { correct: number; incorrect: number }>;
  };

  // State
  completed: boolean;
  aborted: boolean;
}
```

#### 2. Random Word Practice Generator

```typescript
// src/utils/practiceGenerator.ts

export interface RandomWordOptions {
  wordCount: number;
  language: LanguageCode;
  difficulty: 'easy' | 'medium' | 'hard';
  includeThemes?: ThemeId[];
  availableKeys?: string[];     // Optional: limit to learned keys
}

export function generateRandomWordPractice(
  options: RandomWordOptions
): string {
  const { wordCount, language, difficulty, includeThemes, availableKeys } = options;

  // Get word database for language
  const wordDB = getWordDatabase(language);

  // Filter by difficulty (word length and frequency)
  let words = wordDB.words.filter(entry => {
    const length = entry.word.length;

    if (difficulty === 'easy') return length >= 2 && length <= 5;
    if (difficulty === 'medium') return length >= 4 && length <= 8;
    return length >= 6; // hard
  });

  // If availableKeys specified, filter to those keys only
  if (availableKeys) {
    const keySet = new Set(availableKeys);
    words = words.filter(entry =>
      Array.from(entry.letters).every(letter => keySet.has(letter))
    );
  }

  // Include themed words if specified
  if (includeThemes && includeThemes.length > 0) {
    const themeWords = includeThemes.flatMap(themeId => {
      const theme = getTheme(themeId);
      return theme.words[language] || [];
    });

    words = [...words, ...themeWords];
  }

  // Shuffle and pick random words
  const shuffled = shuffleArray(words);
  const selectedWords = shuffled
    .slice(0, wordCount)
    .map(entry => entry.word);

  return selectedWords.join(' ');
}
```

#### 3. Custom Text Input

```typescript
// src/components/CustomTextInput.tsx

export function CustomTextInput({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    // Validate text
    if (text.trim().length < 10) {
      setError('Text must be at least 10 characters');
      return;
    }

    if (text.length > 5000) {
      setError('Text must be less than 5000 characters');
      return;
    }

    // Clean and normalize text
    const cleaned = text
      .replace(/\s+/g, ' ')  // Normalize whitespace
      .trim();

    onSubmit(cleaned);
  };

  return (
    <div className="custom-text-input">
      <h3>Paste Your Custom Text</h3>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste any text here: articles, code, quotes, etc."
        rows={10}
        maxLength={5000}
      />

      <div className="character-count">
        {text.length} / 5000 characters
      </div>

      {error && <div className="error">{error}</div>}

      <button onClick={handleSubmit}>
        Start Practice
      </button>
    </div>
  );
}
```

#### 4. Endless Mode

```typescript
// src/components/EndlessPractice.tsx

export function EndlessPractice({ maxMistakes }: { maxMistakes: number }) {
  const [mistakes, setMistakes] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [wordsTyped, setWordsTyped] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    // Generate initial batch of words
    regenerateText();
  }, []);

  const regenerateText = () => {
    // Generate next batch of random words
    const newText = generateRandomWordPractice({
      wordCount: 20,
      language: userSettings.language,
      difficulty: 'medium',
    });

    setCurrentText(newText);
  };

  const handleMistake = () => {
    const newMistakes = mistakes + 1;
    setMistakes(newMistakes);

    if (newMistakes >= maxMistakes) {
      setIsGameOver(true);
    }
  };

  const handleWordComplete = () => {
    setWordsTyped(prev => prev + 1);

    // If near end of current text, append more words
    // (seamless endless experience)
  };

  if (isGameOver) {
    return (
      <div className="game-over">
        <h2>Practice Complete!</h2>
        <p>Words typed: {wordsTyped}</p>
        <p>Mistakes: {mistakes} / {maxMistakes}</p>
        <button onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="endless-practice">
      <div className="mistakes-counter">
        Mistakes: {mistakes} / {maxMistakes}
      </div>

      <TypingArea
        text={currentText}
        onMistake={handleMistake}
        onWordComplete={handleWordComplete}
        showStats={true}
      />
    </div>
  );
}
```

#### 5. Key Focus Practice

```typescript
// src/utils/keyFocusGenerator.ts

export interface KeyFocusOptions {
  targetKeys: string[];
  focusRatio: number;           // 0.0-1.0
  wordCount: number;
  language: LanguageCode;
}

export function generateKeyFocusPractice(
  options: KeyFocusOptions
): string {
  const { targetKeys, focusRatio, wordCount, language } = options;
  const wordDB = getWordDatabase(language);

  const targetKeySet = new Set(targetKeys.map(k => k.toLowerCase()));

  // Separate words into two groups
  const focusWords = wordDB.words.filter(entry =>
    Array.from(entry.letters).some(letter => targetKeySet.has(letter))
  );

  const regularWords = wordDB.words.filter(entry =>
    !Array.from(entry.letters).some(letter => targetKeySet.has(letter))
  );

  // Calculate mix
  const focusCount = Math.floor(wordCount * focusRatio);
  const regularCount = wordCount - focusCount;

  // Pick random words from each group
  const selectedFocusWords = shuffleArray(focusWords)
    .slice(0, focusCount)
    .map(e => e.word);

  const selectedRegularWords = shuffleArray(regularWords)
    .slice(0, regularCount)
    .map(e => e.word);

  // Mix together
  const allWords = shuffleArray([...selectedFocusWords, ...selectedRegularWords]);

  return allWords.join(' ');
}
```

#### 6. Practice Mode Selector

```typescript
// src/components/PracticeModeSelector.tsx

export function PracticeModeSelector() {
  const [selectedMode, setSelectedMode] = useState<PracticeModeType | null>(null);
  const [config, setConfig] = useState<PracticeConfig | null>(null);

  if (config) {
    // Render practice session
    return <PracticeSession config={config} />;
  }

  return (
    <div className="practice-mode-selector">
      <h2>Choose Practice Mode</h2>

      <div className="mode-cards">
        <div
          className="mode-card"
          onClick={() => setSelectedMode('random-words')}
        >
          <div className="icon">🎲</div>
          <h3>Random Words</h3>
          <p>Practice with random words from the database</p>
        </div>

        <div
          className="mode-card"
          onClick={() => setSelectedMode('custom-text')}
        >
          <div className="icon">📝</div>
          <h3>Custom Text</h3>
          <p>Paste your own text to practice with</p>
        </div>

        <div
          className="mode-card"
          onClick={() => setSelectedMode('endless-mode')}
        >
          <div className="icon">♾️</div>
          <h3>Endless Mode</h3>
          <p>Type until you make X mistakes</p>
        </div>

        <div
          className="mode-card"
          onClick={() => setSelectedMode('key-focus')}
        >
          <div className="icon">🎯</div>
          <h3>Key Focus</h3>
          <p>Practice specific keys you struggle with</p>
        </div>
      </div>

      {selectedMode && (
        <PracticeModeConfig
          mode={selectedMode}
          onConfirm={(cfg) => setConfig(cfg)}
          onCancel={() => setSelectedMode(null)}
        />
      )}
    </div>
  );
}
```

#### 7. Statistics Tracking

```typescript
// src/components/PracticeStats.tsx

export interface PracticeStatsProps {
  session: PracticeSession;
  live?: boolean;  // Show live updating stats
}

export function PracticeStats({ session, live }: PracticeStatsProps) {
  const { stats } = session;

  if (!stats) return null;

  return (
    <div className="practice-stats">
      <div className="stat-item">
        <div className="label">WPM</div>
        <div className="value">{stats.wpm}</div>
      </div>

      <div className="stat-item">
        <div className="label">Accuracy</div>
        <div className="value">{stats.accuracy}%</div>
      </div>

      <div className="stat-item">
        <div className="label">Mistakes</div>
        <div className="value">{stats.mistakes}</div>
      </div>

      <div className="stat-item">
        <div className="label">Time</div>
        <div className="value">{formatTime(stats.timeElapsed)}</div>
      </div>

      {!live && (
        <div className="key-breakdown">
          <h4>Key Accuracy</h4>
          {Object.entries(stats.keyStats)
            .sort((a, b) => {
              const accuracyA = a[1].correct / (a[1].correct + a[1].incorrect);
              const accuracyB = b[1].correct / (b[1].correct + b[1].incorrect);
              return accuracyA - accuracyB;
            })
            .map(([key, data]) => {
              const accuracy = (data.correct / (data.correct + data.incorrect)) * 100;
              return (
                <div key={key} className="key-stat">
                  <span className="key">{key}</span>
                  <div className="accuracy-bar">
                    <div
                      className="fill"
                      style={{ width: `${accuracy}%` }}
                    />
                  </div>
                  <span className="percent">{accuracy.toFixed(0)}%</span>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
```

#### 8. Practice History

```typescript
// src/hooks/usePracticeHistory.ts

export interface PracticeHistoryEntry {
  id: string;
  timestamp: number;
  mode: PracticeModeType;
  stats: PracticeSession['stats'];
  duration: number;
}

export function usePracticeHistory() {
  const [history, setHistory] = useState<PracticeHistoryEntry[]>([]);

  useEffect(() => {
    // Load from localStorage
    const stored = localStorage.getItem('practice-history');
    if (stored) {
      setHistory(JSON.parse(stored));
    }
  }, []);

  const addEntry = (session: PracticeSession) => {
    if (!session.stats || !session.config.options.saveHistory) {
      return;
    }

    const entry: PracticeHistoryEntry = {
      id: session.id,
      timestamp: session.startTime,
      mode: session.mode,
      stats: session.stats,
      duration: (session.endTime || Date.now()) - session.startTime,
    };

    const newHistory = [entry, ...history].slice(0, 50); // Keep last 50
    setHistory(newHistory);
    localStorage.setItem('practice-history', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('practice-history');
  };

  return { history, addEntry, clearHistory };
}
```

### File Structure

| File | Action | Description |
|------|--------|-------------|
| `src/types/practice.ts` | CREATE | Practice mode types and interfaces |
| `src/utils/practiceGenerator.ts` | CREATE | Random word practice generator |
| `src/utils/keyFocusGenerator.ts` | CREATE | Key focus practice generator |
| `src/components/PracticeModeSelector.tsx` | CREATE | Practice mode selection UI |
| `src/components/PracticeModeConfig.tsx` | CREATE | Configuration for each practice mode |
| `src/components/PracticeSession.tsx` | CREATE | Main practice session component |
| `src/components/CustomTextInput.tsx` | CREATE | Custom text input UI |
| `src/components/EndlessPractice.tsx` | CREATE | Endless mode implementation |
| `src/components/KeyFocusPractice.tsx` | CREATE | Key focus mode implementation |
| `src/components/RandomWordPractice.tsx` | CREATE | Random word mode implementation |
| `src/components/PracticeStats.tsx` | CREATE | Statistics display component |
| `src/components/PracticeHistory.tsx` | CREATE | Practice history view |
| `src/hooks/usePracticeHistory.ts` | CREATE | Practice history management |
| `src/hooks/usePracticeSession.ts` | CREATE | Practice session state management |
| `src/App.tsx` | MODIFY | Add practice route |
| `src/components/HomePage.tsx` | MODIFY | Add quick practice button |
| `src/utils/wordFilter.ts` | MODIFY | Add difficulty filtering |

---

## Implementation Order

### Phase 1: Core Practice Infrastructure

**Objective**: Create foundational types and data structures.

#### Tasks
- [ ] **1.1** Create `src/types/practice.ts` with all practice types
- [ ] **1.2** Create `src/utils/practiceGenerator.ts` with random word generator
- [ ] **1.3** Add difficulty filtering to `src/utils/wordFilter.ts`
- [ ] **1.4** Create `src/hooks/usePracticeSession.ts` for session state
- [ ] **1.5** Test random word generation with different languages
- [ ] **1.6** Test difficulty levels produce appropriate word lengths

#### Build Gate
```bash
npm run build
npm run type-check
```

---

### Phase 2: Random Word Practice

**Objective**: Implement random word practice mode.

#### Tasks
- [ ] **2.1** Create `src/components/RandomWordPractice.tsx`
- [ ] **2.2** Add word count selector (10, 25, 50, 100, 200 words)
- [ ] **2.3** Add difficulty selector (easy, medium, hard)
- [ ] **2.4** Add language selector (uses current language by default)
- [ ] **2.5** Add theme inclusion checkboxes
- [ ] **2.6** Integrate with TypingArea component
- [ ] **2.7** Add restart/new practice buttons
- [ ] **2.8** Test with multiple languages
- [ ] **2.9** Test with themed words

#### Build Gate
```bash
npm run build
npm run dev
# Manual testing in browser
```

---

### Phase 3: Custom Text & Endless Mode

**Objective**: Add custom text input and endless mode.

#### Tasks
- [ ] **3.1** Create `src/components/CustomTextInput.tsx`
- [ ] **3.2** Add text validation (min 10, max 5000 chars)
- [ ] **3.3** Add text cleaning/normalization
- [ ] **3.4** Add character counter
- [ ] **3.5** Create `src/components/EndlessPractice.tsx`
- [ ] **3.6** Implement mistake tracking
- [ ] **3.7** Implement game over condition
- [ ] **3.8** Add seamless text regeneration
- [ ] **3.9** Add word counter
- [ ] **3.10** Test with various text inputs (code, prose, etc.)
- [ ] **3.11** Test endless mode until game over

#### Build Gate
```bash
npm run build
npm run dev
# Manual testing
```

---

### Phase 4: Key Focus Practice

**Objective**: Implement targeted key practice.

#### Tasks
- [ ] **4.1** Create `src/utils/keyFocusGenerator.ts`
- [ ] **4.2** Implement word filtering by target keys
- [ ] **4.3** Implement focus ratio mixing
- [ ] **4.4** Create `src/components/KeyFocusPractice.tsx`
- [ ] **4.5** Add key selector UI (keyboard visual or list)
- [ ] **4.6** Add focus ratio slider (20%-80%)
- [ ] **4.7** Highlight target keys in practice text
- [ ] **4.8** Test with single key focus
- [ ] **4.9** Test with multiple key focus
- [ ] **4.10** Verify words actually contain target keys

#### Build Gate
```bash
npm run build
npm run dev
# Manual testing
```

---

### Phase 5: Statistics & History

**Objective**: Add statistics tracking and history.

#### Tasks
- [ ] **5.1** Create `src/components/PracticeStats.tsx`
- [ ] **5.2** Implement live WPM calculation
- [ ] **5.3** Implement live accuracy tracking
- [ ] **5.4** Implement per-key statistics
- [ ] **5.5** Add time elapsed tracking
- [ ] **5.6** Create `src/hooks/usePracticeHistory.ts`
- [ ] **5.7** Implement localStorage persistence
- [ ] **5.8** Create `src/components/PracticeHistory.tsx`
- [ ] **5.9** Add history filtering/sorting
- [ ] **5.10** Add "save to history" toggle
- [ ] **5.11** Test stats accuracy
- [ ] **5.12** Test history persistence

#### Build Gate
```bash
npm run build
npm run dev
# Manual testing
```

---

### Phase 6: UI Integration & Polish

**Objective**: Integrate practice mode into app and polish UX.

#### Tasks
- [ ] **6.1** Create `src/components/PracticeModeSelector.tsx`
- [ ] **6.2** Create `src/components/PracticeModeConfig.tsx`
- [ ] **6.3** Add practice mode cards with icons
- [ ] **6.4** Add routing for practice mode
- [ ] **6.5** Add "Practice" button to home page
- [ ] **6.6** Add "Practice" link to main navigation
- [ ] **6.7** Add keyboard shortcuts (Escape to exit, etc.)
- [ ] **6.8** Add loading states
- [ ] **6.9** Add error states
- [ ] **6.10** Add empty states
- [ ] **6.11** Style all practice components
- [ ] **6.12** Add animations/transitions
- [ ] **6.13** Add responsive design for mobile
- [ ] **6.14** Test full user flow: home -> mode selection -> config -> practice -> results
- [ ] **6.15** Test navigation between modes
- [ ] **6.16** Final visual polish

#### Build Gate
```bash
npm run build
npm run dev
# Full integration testing
```

---

## Notes

### Design Considerations

1. **No Pressure Philosophy**: Practice mode should feel casual and low-stakes. Stats are optional and never compared against requirements.

2. **Quick Access**: One-click practice from home page for returning users who want to "just practice."

3. **Flexibility**: Support multiple practice styles to accommodate different learning preferences.

4. **Integration with Lessons**: Practice mode should complement, not replace, structured lessons. Consider suggesting practice after failed lessons.

5. **Performance**: For endless mode, implement efficient text batching to avoid lag.

### Future Enhancements

- [ ] Multiplayer practice mode (race against friends)
- [ ] Daily practice challenges
- [ ] Practice achievements/badges
- [ ] AI-generated practice text based on user weaknesses
- [ ] Code snippet practice (syntax highlighting)
- [ ] Import text from URLs
- [ ] Practice reminders/notifications

### Open Questions

**Q1: Should practice sessions contribute to overall user statistics?**

**Options:**
- A) Yes, include in global stats (WPM average, etc.)
- B) No, keep practice separate from lessons
- C) Optional, let user choose

**Recommendation:** Option C - give users control over whether practice "counts."

**Q2: Should we track weak keys from practice and suggest focused practice?**

**Options:**
- A) Yes, auto-suggest key focus based on mistakes
- B) No, keep practice modes independent
- C) Show suggestion but don't auto-start

**Recommendation:** Option C - helpful nudge without being pushy.

**Q3: Text length limits for custom text?**

**Options:**
- A) 1000 characters max (short practice)
- B) 5000 characters max (article length)
- C) 10000+ characters (book chapters)

**Recommendation:** Option B - 5000 chars is ~800 words, good for most use cases.

---

## Rollback Plan

```bash
# If issues discovered after deployment:

# 1. Remove practice mode routes
git revert HEAD~N  # revert practice mode commits

# 2. Or: Disable practice mode feature flag
# Add feature flag in settings:
# FEATURES.PRACTICE_MODE = false

# 3. User data: Practice history stored separately
# Can be cleared without affecting lesson progress
localStorage.removeItem('practice-history');
```

---

## Appendix: Practice Mode Examples

### Example 1: Random Word Practice (German, Easy, 25 words)

```
das als fall öl söld halb glas hals die sie
fiel lied für uhr ruf wo dorf plus zeit satz
jetzt hand dies zwei drei
```

### Example 2: Key Focus Practice (Keys: y, z - 80% focus)

```
fuzzy lazy crazy dizzy fizzy style type zealot
zesty analyze try fly sky dry mystify word test
hope jazz puzzle hazy yearly
```

### Example 3: Custom Text (Code Snippet)

```
function calculateWPM(chars, timeSeconds) {
  const words = chars / 5;
  const minutes = timeSeconds / 60;
  return Math.round(words / minutes);
}
```

### Example 4: Endless Mode Session

```
Session starts with 20 random words...
User types correctly -> more words added seamlessly
User makes mistake 1/10
User makes mistake 2/10
... continues ...
User makes mistake 10/10 -> GAME OVER
Final score: 247 words typed, 10 minutes
```

---

## References

- Word databases: `src/data/wordDatabases/`
- Typing area component: `src/components/TypingArea.tsx`
- Current lesson system: `src/data/lessons.ts`
- Theme system: `src/data/themes/`

---

## Changelog

| Date | Author | Changes |
|------|--------|---------|
| 2025-12-25 | Anton | Initial draft |

---
