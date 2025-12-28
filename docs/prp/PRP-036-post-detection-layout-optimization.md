# PRP-036: Post-Detection Layout Optimization

## Summary
Optimize the homepage layout after successful keyboard detection by promoting lessons to the top and moving the daily challenge to a compact header trigger.

## Problem Statement

Currently, the homepage has a fixed layout regardless of whether the user has completed keyboard setup:

1. **Returning users** must scroll past TryItOut, How to Play, Leaderboard, and Daily Challenge sections before reaching the lessons - their primary goal
2. **Daily Challenge section** takes significant vertical space even when users aren't interested in it
3. **No differentiation** between first-time visitors (who need onboarding) and returning users (who want to practice)

## Proposed Solution

### 1. Conditional Layout Based on Detection State

**Before Keyboard Detection (New Users)**:
```
Header HUD
Hero Title + Stats
TryItOutSection (prominent, with keyboard + hands)
How to Play
Level Select (preview)
Footer
```

**After Keyboard Detection (Returning Users)**:
```
Header HUD (with Daily Challenge button)
Compact Keyboard Badge (collapsible)
Level Select (PROMOTED TO TOP)
Leaderboard
How to Play (collapsed/minimal)
Footer
```

### 2. Daily Challenge → Header Button

Replace the full `DailyChallengeSection` with a compact header button:

```
┌─────────────────────────────────────────────────────────────────┐
│ ⌨ TYPEBIT8  │ 🔥 5  │ $ 130 │ 👑 │ LVL 15 │ [⚡ DAILY CHALLENGE] │ 👤 │
└─────────────────────────────────────────────────────────────────┘
```

**Button States**:
- **Not completed today**: `⚡ DAILY CHALLENGE` (pulsing yellow glow)
- **Completed today**: `✓ CHALLENGE DONE` (green, static)
- **On hover**: Show tooltip with reward preview

### 3. Compact Keyboard Badge

After detection, replace the full TryItOut section with a minimal badge:

```
┌──────────────────────────────────────────┐
│  ⌨ QWERTZ CH  │  [Change]  │  [Try It]  │
└──────────────────────────────────────────┘
```

- Shows current layout
- "Change" opens the layout picker inline
- "Try It" expands to full TryItOut section

## Technical Implementation

### Phase 1: State-Based Layout Switching

```tsx
// App.tsx
const { isLocked } = useKeyboardLayout();

return (
  <div>
    <Header
      showDailyChallenge={isLocked}
      onDailyChallenge={() => setView('daily-challenge')}
    />

    {!isLocked ? (
      // New user flow
      <>
        <HeroSection />
        <TryItOutSection />
        <HowToPlay />
        <LevelSelectPreview limit={6} />
      </>
    ) : (
      // Returning user flow
      <>
        <CompactKeyboardBadge />
        <LevelSelect /> {/* Full grid, promoted to top */}
        <Leaderboard />
        <HowToPlayCollapsed />
      </>
    )}

    <Footer />
  </div>
);
```

### Phase 2: DailyChallengeButton Component

```tsx
// components/DailyChallengeButton.tsx
interface DailyChallengeButtonProps {
  onClick: () => void;
}

export function DailyChallengeButton({ onClick }: DailyChallengeButtonProps) {
  const { userId } = useAuth();
  const todayChallenge = useQuery(api.dailyChallenge.getTodayChallenge);
  const userAttempt = useQuery(
    api.dailyChallenge.getUserAttempt,
    userId && todayChallenge ? { clerkId: userId, challengeId: todayChallenge._id } : "skip"
  );

  const isCompleted = userAttempt?.completed;

  return (
    <button
      onClick={onClick}
      className={`daily-challenge-btn ${isCompleted ? 'completed' : 'pending'}`}
      style={{
        fontFamily: "'Press Start 2P'",
        fontSize: '7px',
        padding: '8px 12px',
        border: `2px solid ${isCompleted ? '#0ead69' : '#ffd93d'}`,
        background: isCompleted ? 'rgba(14, 173, 105, 0.2)' : 'transparent',
        color: isCompleted ? '#0ead69' : '#ffd93d',
        animation: !isCompleted ? 'pulse-glow 2s infinite' : 'none',
      }}
    >
      {isCompleted ? '✓ DONE' : '⚡ CHALLENGE'}
    </button>
  );
}
```

### Phase 3: CompactKeyboardBadge Component

```tsx
// components/CompactKeyboardBadge.tsx
export function CompactKeyboardBadge() {
  const { layout, resetDetection } = useKeyboardLayout();
  const [expanded, setExpanded] = useState(false);

  const layoutConfig = KEYBOARD_LAYOUTS[layout];

  if (expanded) {
    return (
      <div className="p-4">
        <TryItOutSection />
        <button onClick={() => setExpanded(false)}>Collapse</button>
      </div>
    );
  }

  return (
    <div className="compact-keyboard-badge p-2 flex items-center justify-center gap-4">
      <span style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#0ead69' }}>
        ⌨ {layoutConfig.name}
      </span>
      <button onClick={resetDetection} className="text-xs text-[#3bceac]">
        Change
      </button>
      <button onClick={() => setExpanded(true)} className="text-xs text-[#3bceac]">
        Try It
      </button>
    </div>
  );
}
```

## User Flow

### New User (First Visit)
```
1. Land on homepage
2. See prominent "TRY IT OUT!" section
3. Type to detect keyboard layout
4. See success message
5. Page transitions to lessons-first layout
6. Start Level 1
```

### Returning User
```
1. Land on homepage
2. See lessons grid immediately at top
3. See compact keyboard badge (layout already locked)
4. Notice pulsing "DAILY CHALLENGE" button in header
5. Choose: Continue lessons OR do daily challenge
```

## Success Metrics

1. **Reduced scroll depth** for returning users to reach lessons
2. **Increased daily challenge participation** via persistent header button
3. **Faster time-to-first-lesson** for new users after detection
4. **Lower bounce rate** by showing relevant content based on user state

## Files to Modify

1. `src/App.tsx` - Layout switching logic
2. `src/components/DailyChallengeButton.tsx` - New component
3. `src/components/CompactKeyboardBadge.tsx` - New component
4. `src/components/Header.tsx` - Extract header into component, add daily challenge button

## Migration Notes

- No data migration required
- Feature flag: `ENABLE_ADAPTIVE_LAYOUT` for gradual rollout
- Preserve existing behavior if flag is off

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Users confused by layout change | Add subtle animation during transition |
| Daily challenge less discoverable | Use pulsing animation + tooltip |
| "How to Play" less visible | Keep collapsed version with expand option |

## Timeline

- Phase 1: State-based layout switching (2-3 hours)
- Phase 2: Daily challenge header button (1-2 hours)
- Phase 3: Compact keyboard badge (1 hour)
- Testing & polish (1-2 hours)

## Open Questions

1. Should we show a mini-leaderboard in the header for returning users?
2. Should the "How to Play" section be completely hidden or just collapsed?
3. Should we add a "Welcome back!" message for returning users?
