# PRP-011: Seasonal Events System

**Status**: DRAFT
**Author**: Claude + Anton
**Date**: 2025-12-25
**Priority**: MEDIUM
**Estimated Effort**: 4 phases, ~35 tasks

---

## Executive Summary

This PRP introduces a comprehensive seasonal events system for TypeBit8, enabling time-limited holiday-themed content that drives user engagement and retention. The system will support major holidays (Christmas, Halloween, Easter, Summer) with themed levels, exclusive avatars, special word packs, dedicated leaderboards, and event countdown timers. Past events will be archived for historical viewing.

---

## Problem Statement

### Current State

1. **Static Content**: TypeBit8 offers the same experience year-round with no seasonal variation
2. **No Time-Limited Events**: Missing opportunities for urgency-driven engagement
3. **Limited Reward Variety**: No exclusive or seasonal collectibles
4. **Missed Holiday Traffic**: Can't capitalize on increased usage during holiday periods
5. **No FOMO Mechanics**: Nothing to encourage regular check-ins or time-sensitive participation

### Impact

| Issue | User Impact |
|-------|-------------|
| No seasonal content | Game feels stale, less exciting to return to |
| Missing events | Lower engagement during peak holiday periods |
| No exclusive rewards | Reduced motivation to play during specific windows |
| No time pressure | Missing urgency that drives daily active users |
| Static leaderboards | Can't compete in fresh, limited-time competitions |

### Success Criteria

- [ ] 4 seasonal events implemented (Christmas, Halloween, Easter, Summer)
- [ ] Each event includes 3-5 themed levels with holiday vocabulary
- [ ] 2-3 exclusive seasonal avatars per event
- [ ] Event-specific leaderboards with unique rewards
- [ ] Countdown timers showing time remaining in active events
- [ ] Archive system for viewing past seasonal events
- [ ] Automatic event activation based on calendar dates
- [ ] Visual theme changes during active events

---

## Seasonal Events Calendar

### Event Schedule

| Event | Active Period | Duration | Primary Colors |
|-------|--------------|----------|----------------|
| **Christmas** | Dec 15 - Jan 5 | 3 weeks | Red `#ff0000`, Green `#00ff00`, Gold `#ffd700` |
| **Easter** | 2 weeks before - 1 week after Easter | 3 weeks | Pastel Pink `#ffb3d9`, Cyan `#b3ffff`, Yellow `#ffff99` |
| **Summer** | Jun 15 - Sep 15 | 3 months | Orange `#ff8c00`, Cyan `#00bfff`, Yellow `#ffd93d` |
| **Halloween** | Oct 15 - Nov 5 | 3 weeks | Orange `#ff6600`, Purple `#9933ff`, Black `#1a1a1a` |

### Event Features Matrix

| Feature | Christmas | Halloween | Easter | Summer |
|---------|-----------|-----------|--------|--------|
| Themed Levels | 5 | 5 | 4 | 6 |
| Exclusive Avatars | 3 | 3 | 2 | 3 |
| Word Pack Theme | Holiday greetings, winter | Spooky, horror | Spring, nature | Beach, vacation |
| Special Reward | Santa avatar | Ghost avatar | Bunny avatar | Surfing avatar |
| Background Theme | Snow, trees | Haunted house | Garden, eggs | Beach, sun |

---

## Phase 1: Event Infrastructure

### 1.1 Event Configuration System

**New file: `src/data/seasonalEvents.ts`**

```typescript
export interface SeasonalEvent {
  id: string;
  name: string;
  description: string;
  startDate: string; // ISO date or "YYYY-MM-DD"
  endDate: string;
  theme: EventTheme;
  levels: string[]; // Level IDs
  exclusiveAvatars: string[]; // Avatar IDs
  wordPackId: string;
  leaderboardId: string;
  backgroundImage?: string;
  musicTrack?: string;
}

export interface EventTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundPattern?: string;
  particleEffect?: 'snow' | 'leaves' | 'sparkles' | 'none';
}

export const SEASONAL_EVENTS: SeasonalEvent[] = [
  {
    id: 'christmas-2025',
    name: 'Christmas Typing Festival',
    description: 'Ho ho ho! Type your way through festive levels and unlock Santa avatars!',
    startDate: '2025-12-15',
    endDate: '2026-01-05',
    theme: {
      primaryColor: '#ff0000',
      secondaryColor: '#00ff00',
      accentColor: '#ffd700',
      particleEffect: 'snow',
    },
    levels: ['christmas-1', 'christmas-2', 'christmas-3', 'christmas-4', 'christmas-5'],
    exclusiveAvatars: ['santa-knight', 'snow-wizard', 'reindeer-racer'],
    wordPackId: 'christmas-words',
    leaderboardId: 'christmas-2025-leaderboard',
    backgroundImage: '/events/christmas-bg.png',
  },
  {
    id: 'halloween-2025',
    name: 'Spooky Typing Night',
    description: 'Brave the haunted keyboard and earn ghostly rewards!',
    startDate: '2025-10-15',
    endDate: '2025-11-05',
    theme: {
      primaryColor: '#ff6600',
      secondaryColor: '#9933ff',
      accentColor: '#1a1a1a',
      particleEffect: 'none',
    },
    levels: ['halloween-1', 'halloween-2', 'halloween-3', 'halloween-4', 'halloween-5'],
    exclusiveAvatars: ['pumpkin-knight', 'vampire-coder', 'witch-typer'],
    wordPackId: 'halloween-words',
    leaderboardId: 'halloween-2025-leaderboard',
    backgroundImage: '/events/halloween-bg.png',
  },
  {
    id: 'easter-2026',
    name: 'Easter Egg Hunt',
    description: 'Find hidden typing eggs and unlock spring avatars!',
    startDate: '2026-04-05', // Adjust based on Easter
    endDate: '2026-04-26',
    theme: {
      primaryColor: '#ffb3d9',
      secondaryColor: '#b3ffff',
      accentColor: '#ffff99',
      particleEffect: 'sparkles',
    },
    levels: ['easter-1', 'easter-2', 'easter-3', 'easter-4'],
    exclusiveAvatars: ['bunny-typer', 'chick-coder'],
    wordPackId: 'easter-words',
    leaderboardId: 'easter-2026-leaderboard',
    backgroundImage: '/events/easter-bg.png',
  },
  {
    id: 'summer-2026',
    name: 'Summer Typing Beach Party',
    description: 'Ride the waves of words and unlock beach-themed rewards!',
    startDate: '2026-06-15',
    endDate: '2026-09-15',
    theme: {
      primaryColor: '#ff8c00',
      secondaryColor: '#00bfff',
      accentColor: '#ffd93d',
      particleEffect: 'none',
    },
    levels: ['summer-1', 'summer-2', 'summer-3', 'summer-4', 'summer-5', 'summer-6'],
    exclusiveAvatars: ['surfer-knight', 'beach-cat', 'pirate-coder'],
    wordPackId: 'summer-words',
    leaderboardId: 'summer-2026-leaderboard',
    backgroundImage: '/events/summer-bg.png',
  },
];

export function getActiveEvent(): SeasonalEvent | null {
  const now = new Date();
  return SEASONAL_EVENTS.find(event => {
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    return now >= start && now <= end;
  }) || null;
}

export function getUpcomingEvent(): SeasonalEvent | null {
  const now = new Date();
  const upcoming = SEASONAL_EVENTS
    .filter(event => new Date(event.startDate) > now)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  return upcoming[0] || null;
}

export function getPastEvents(): SeasonalEvent[] {
  const now = new Date();
  return SEASONAL_EVENTS.filter(event => new Date(event.endDate) < now);
}

export function getTimeRemaining(event: SeasonalEvent): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const now = new Date();
  const end = new Date(event.endDate);
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}
```

### 1.2 Convex Schema Updates

**Modify: `convex/schema.ts`**

```typescript
// Add seasonal event progress tracking
seasonalProgress: defineTable({
  userId: v.id("users"),
  eventId: v.string(),
  levelsCompleted: v.array(v.string()),
  avatarsUnlocked: v.array(v.string()),
  bestScore: v.number(),
  lastPlayed: v.number(),
})
  .index("by_user_event", ["userId", "eventId"]),

// Add event-specific leaderboards
eventLeaderboards: defineTable({
  eventId: v.string(),
  userId: v.id("users"),
  username: v.string(),
  avatarId: v.optional(v.string()),
  totalScore: v.number(),
  levelsCompleted: v.number(),
  timestamp: v.number(),
})
  .index("by_event_score", ["eventId", "totalScore"])
  .index("by_user_event", ["userId", "eventId"]),
```

### 1.3 Event State Management

**New file: `src/hooks/useSeasonalEvent.ts`**

```typescript
import { useEffect, useState } from 'react';
import { getActiveEvent, getUpcomingEvent, getTimeRemaining, type SeasonalEvent } from '../data/seasonalEvents';

export function useSeasonalEvent() {
  const [activeEvent, setActiveEvent] = useState<SeasonalEvent | null>(null);
  const [upcomingEvent, setUpcomingEvent] = useState<SeasonalEvent | null>(null);
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const updateEvents = () => {
      const active = getActiveEvent();
      const upcoming = getUpcomingEvent();
      setActiveEvent(active);
      setUpcomingEvent(upcoming);

      if (active) {
        setTimeRemaining(getTimeRemaining(active));
      }
    };

    updateEvents();
    const interval = setInterval(updateEvents, 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    activeEvent,
    upcomingEvent,
    timeRemaining,
    hasActiveEvent: activeEvent !== null,
  };
}
```

---

## Phase 2: Themed Content

### 2.1 Seasonal Word Packs

**New file: `src/data/seasonalWordPacks.ts`**

```typescript
export interface WordPack {
  id: string;
  name: string;
  words: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export const SEASONAL_WORD_PACKS: Record<string, WordPack[]> = {
  'christmas-words': [
    {
      id: 'christmas-easy',
      name: 'Christmas Basics',
      words: [
        'santa', 'tree', 'gift', 'snow', 'bell', 'star', 'candy', 'light',
        'stocking', 'wreath', 'sleigh', 'reindeer', 'elf', 'cookie', 'carol',
        'present', 'chimney', 'mistletoe', 'ornament', 'fireplace'
      ],
      difficulty: 'easy',
    },
    {
      id: 'christmas-medium',
      name: 'Holiday Greetings',
      words: [
        'merry christmas', 'happy holidays', 'season greetings', 'winter wonderland',
        'jingle bells', 'silent night', 'deck the halls', 'ho ho ho',
        'north pole', 'christmas eve', 'gingerbread', 'snowflake', 'yuletide'
      ],
      difficulty: 'medium',
    },
    {
      id: 'christmas-hard',
      name: 'Festive Phrases',
      words: [
        'tis the season to be jolly', 'rudolph the red nosed reindeer',
        'all i want for christmas', 'walking in a winter wonderland',
        'let it snow let it snow', 'frosty the snowman', 'twelve days of christmas'
      ],
      difficulty: 'hard',
    },
  ],
  'halloween-words': [
    {
      id: 'halloween-easy',
      name: 'Spooky Basics',
      words: [
        'ghost', 'witch', 'bat', 'spider', 'candy', 'mask', 'skull', 'moon',
        'pumpkin', 'costume', 'vampire', 'zombie', 'skeleton', 'haunted', 'scary',
        'black cat', 'graveyard', 'monster', 'werewolf', 'potion'
      ],
      difficulty: 'easy',
    },
    {
      id: 'halloween-medium',
      name: 'Haunted House',
      words: [
        'trick or treat', 'happy halloween', 'haunted house', 'jack o lantern',
        'creepy crawly', 'spooky night', 'full moon', 'dark magic',
        'candy corn', 'boo', 'cobweb', 'cauldron', 'broomstick'
      ],
      difficulty: 'medium',
    },
    {
      id: 'halloween-hard',
      name: 'Horror Stories',
      words: [
        'something wicked this way comes', 'double double toil and trouble',
        'the witching hour approaches', 'beware the creatures of the night',
        'enter if you dare', 'nightmare before halloween'
      ],
      difficulty: 'hard',
    },
  ],
  'easter-words': [
    {
      id: 'easter-easy',
      name: 'Spring Basics',
      words: [
        'egg', 'bunny', 'basket', 'chick', 'flower', 'spring', 'grass', 'hop',
        'carrot', 'nest', 'tulip', 'butterfly', 'rainbow', 'sunny', 'garden',
        'duckling', 'lamb', 'bloom', 'sprout', 'bird'
      ],
      difficulty: 'easy',
    },
    {
      id: 'easter-medium',
      name: 'Easter Hunt',
      words: [
        'easter egg', 'egg hunt', 'chocolate bunny', 'easter basket',
        'spring time', 'pastel colors', 'jelly bean', 'easter bonnet',
        'baby chick', 'easter parade', 'daffodil', 'robin'
      ],
      difficulty: 'medium',
    },
  ],
  'summer-words': [
    {
      id: 'summer-easy',
      name: 'Beach Day',
      words: [
        'beach', 'sun', 'wave', 'sand', 'surf', 'swim', 'shell', 'ocean',
        'vacation', 'summer', 'hot', 'palm', 'ice cream', 'pool', 'boat',
        'island', 'float', 'flip flop', 'sunscreen', 'towel'
      ],
      difficulty: 'easy',
    },
    {
      id: 'summer-medium',
      name: 'Summer Fun',
      words: [
        'beach party', 'summer vacation', 'surfing waves', 'tropical paradise',
        'lazy days', 'beach volleyball', 'barbecue', 'campfire',
        'starfish', 'sandcastle', 'beach umbrella', 'boardwalk'
      ],
      difficulty: 'medium',
    },
    {
      id: 'summer-hard',
      name: 'Endless Summer',
      words: [
        'life is better at the beach', 'endless summer days',
        'catch a wave and you are sitting on top of the world',
        'sun sand and a drink in my hand', 'good vibes only'
      ],
      difficulty: 'hard',
    },
  ],
};
```

### 2.2 Seasonal Avatars

**Extend: `src/data/avatars.ts`**

Add seasonal avatar definitions:

```typescript
export interface SeasonalAvatar extends Avatar {
  eventId: string;
  expiresAfterEvent: boolean; // If true, locks after event ends
}

export const SEASONAL_AVATARS: SeasonalAvatar[] = [
  // Christmas Avatars
  {
    id: 'santa-knight',
    name: 'Santa Knight',
    description: 'Armored Santa delivering typing presents',
    src: '/avatars/seasonal/santa-knight.png',
    eventId: 'christmas-2025',
    expiresAfterEvent: false, // Keeps forever once unlocked
    unlockLevel: 1,
  },
  {
    id: 'snow-wizard',
    name: 'Snow Wizard',
    description: 'Ice mage wielding frosty keyboard magic',
    src: '/avatars/seasonal/snow-wizard.png',
    eventId: 'christmas-2025',
    expiresAfterEvent: false,
    unlockLevel: 1,
  },
  {
    id: 'reindeer-racer',
    name: 'Reindeer Racer',
    description: 'Speedy reindeer ready to type',
    src: '/avatars/seasonal/reindeer-racer.png',
    eventId: 'christmas-2025',
    expiresAfterEvent: false,
    unlockLevel: 1,
  },
  // Halloween Avatars
  {
    id: 'pumpkin-knight',
    name: 'Pumpkin Knight',
    description: 'Jack-o-lantern warrior of the keyboard',
    src: '/avatars/seasonal/pumpkin-knight.png',
    eventId: 'halloween-2025',
    expiresAfterEvent: false,
    unlockLevel: 1,
  },
  {
    id: 'vampire-coder',
    name: 'Vampire Coder',
    description: 'Types only at night',
    src: '/avatars/seasonal/vampire-coder.png',
    eventId: 'halloween-2025',
    expiresAfterEvent: false,
    unlockLevel: 1,
  },
  {
    id: 'witch-typer',
    name: 'Witch Typer',
    description: 'Casts spells with every keystroke',
    src: '/avatars/seasonal/witch-typer.png',
    eventId: 'halloween-2025',
    expiresAfterEvent: false,
    unlockLevel: 1,
  },
  // Easter Avatars
  {
    id: 'bunny-typer',
    name: 'Bunny Typer',
    description: 'Hops through lessons with speed',
    src: '/avatars/seasonal/bunny-typer.png',
    eventId: 'easter-2026',
    expiresAfterEvent: false,
    unlockLevel: 1,
  },
  {
    id: 'chick-coder',
    name: 'Chick Coder',
    description: 'Fresh from the egg and ready to type',
    src: '/avatars/seasonal/chick-coder.png',
    eventId: 'easter-2026',
    expiresAfterEvent: false,
    unlockLevel: 1,
  },
  // Summer Avatars
  {
    id: 'surfer-knight',
    name: 'Surfer Knight',
    description: 'Rides waves and keyboard shortcuts',
    src: '/avatars/seasonal/surfer-knight.png',
    eventId: 'summer-2026',
    expiresAfterEvent: false,
    unlockLevel: 1,
  },
  {
    id: 'beach-cat',
    name: 'Beach Cat',
    description: 'Cool cat with sunglasses and surfboard',
    src: '/avatars/seasonal/beach-cat.png',
    eventId: 'summer-2026',
    expiresAfterEvent: false,
    unlockLevel: 1,
  },
  {
    id: 'pirate-coder',
    name: 'Pirate Coder',
    description: 'Sailing the seven seas of code',
    src: '/avatars/seasonal/pirate-coder.png',
    eventId: 'summer-2026',
    expiresAfterEvent: false,
    unlockLevel: 1,
  },
];
```

### 2.3 Themed Levels

**New file: `src/data/seasonalLevels.ts`**

```typescript
import { type Lesson } from './lessons';

export const SEASONAL_LEVELS: Record<string, Lesson[]> = {
  christmas: [
    {
      id: 'christmas-1',
      name: 'Christmas Eve',
      difficulty: 'easy',
      content: 'Practice typing holiday words',
      wordPackId: 'christmas-easy',
      theme: 'christmas',
    },
    {
      id: 'christmas-2',
      name: 'Gift Wrapping',
      difficulty: 'easy',
      content: 'Type festive greetings',
      wordPackId: 'christmas-easy',
      theme: 'christmas',
    },
    {
      id: 'christmas-3',
      name: 'Santa\'s Workshop',
      difficulty: 'medium',
      content: 'Type holiday phrases',
      wordPackId: 'christmas-medium',
      theme: 'christmas',
    },
    {
      id: 'christmas-4',
      name: 'Reindeer Games',
      difficulty: 'medium',
      content: 'Master Christmas vocabulary',
      wordPackId: 'christmas-medium',
      theme: 'christmas',
    },
    {
      id: 'christmas-5',
      name: 'Christmas Carol Challenge',
      difficulty: 'hard',
      content: 'Type complete festive phrases',
      wordPackId: 'christmas-hard',
      theme: 'christmas',
    },
  ],
  halloween: [
    {
      id: 'halloween-1',
      name: 'Haunted Keyboard',
      difficulty: 'easy',
      content: 'Type spooky words',
      wordPackId: 'halloween-easy',
      theme: 'halloween',
    },
    {
      id: 'halloween-2',
      name: 'Graveyard Shift',
      difficulty: 'easy',
      content: 'Practice horror vocabulary',
      wordPackId: 'halloween-easy',
      theme: 'halloween',
    },
    {
      id: 'halloween-3',
      name: 'Witch\'s Cauldron',
      difficulty: 'medium',
      content: 'Type Halloween phrases',
      wordPackId: 'halloween-medium',
      theme: 'halloween',
    },
    {
      id: 'halloween-4',
      name: 'Trick or Type',
      difficulty: 'medium',
      content: 'Master spooky expressions',
      wordPackId: 'halloween-medium',
      theme: 'halloween',
    },
    {
      id: 'halloween-5',
      name: 'Horror Story',
      difficulty: 'hard',
      content: 'Type complete scary phrases',
      wordPackId: 'halloween-hard',
      theme: 'halloween',
    },
  ],
  easter: [
    {
      id: 'easter-1',
      name: 'Egg Hunt',
      difficulty: 'easy',
      content: 'Type spring words',
      wordPackId: 'easter-easy',
      theme: 'easter',
    },
    {
      id: 'easter-2',
      name: 'Bunny Trail',
      difficulty: 'easy',
      content: 'Practice Easter vocabulary',
      wordPackId: 'easter-easy',
      theme: 'easter',
    },
    {
      id: 'easter-3',
      name: 'Spring Garden',
      difficulty: 'medium',
      content: 'Type Easter phrases',
      wordPackId: 'easter-medium',
      theme: 'easter',
    },
    {
      id: 'easter-4',
      name: 'Easter Parade',
      difficulty: 'medium',
      content: 'Master spring expressions',
      wordPackId: 'easter-medium',
      theme: 'easter',
    },
  ],
  summer: [
    {
      id: 'summer-1',
      name: 'Beach Day',
      difficulty: 'easy',
      content: 'Type beach words',
      wordPackId: 'summer-easy',
      theme: 'summer',
    },
    {
      id: 'summer-2',
      name: 'Wave Rider',
      difficulty: 'easy',
      content: 'Practice summer vocabulary',
      wordPackId: 'summer-easy',
      theme: 'summer',
    },
    {
      id: 'summer-3',
      name: 'Tropical Paradise',
      difficulty: 'medium',
      content: 'Type vacation phrases',
      wordPackId: 'summer-medium',
      theme: 'summer',
    },
    {
      id: 'summer-4',
      name: 'Surfing Safari',
      difficulty: 'medium',
      content: 'Master beach expressions',
      wordPackId: 'summer-medium',
      theme: 'summer',
    },
    {
      id: 'summer-5',
      name: 'Beach Party',
      difficulty: 'hard',
      content: 'Type complete summer phrases',
      wordPackId: 'summer-hard',
      theme: 'summer',
    },
    {
      id: 'summer-6',
      name: 'Endless Summer',
      difficulty: 'hard',
      content: 'Ultimate beach challenge',
      wordPackId: 'summer-hard',
      theme: 'summer',
    },
  ],
};
```

---

## Phase 3: UI Components

### 3.1 Event Banner Component

**New file: `src/components/EventBanner.tsx`**

```typescript
import { useSeasonalEvent } from '../hooks/useSeasonalEvent';

export function EventBanner() {
  const { activeEvent, timeRemaining, hasActiveEvent } = useSeasonalEvent();

  if (!hasActiveEvent || !activeEvent) return null;

  const { days, hours, minutes, seconds } = timeRemaining;

  return (
    <div
      className="pixel-box p-4 mb-4"
      style={{
        background: `linear-gradient(135deg, ${activeEvent.theme.primaryColor}20, ${activeEvent.theme.secondaryColor}20)`,
        borderColor: activeEvent.theme.accentColor,
      }}
    >
      <div className="flex justify-between items-center">
        <div>
          <h2
            style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '12px',
              color: activeEvent.theme.primaryColor,
              marginBottom: '8px',
            }}
          >
            {activeEvent.name.toUpperCase()}
          </h2>
          <p
            style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '8px',
              color: '#eef5db',
            }}
          >
            {activeEvent.description}
          </p>
        </div>
        <div className="text-right">
          <p
            style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '8px',
              color: '#eef5db',
              marginBottom: '4px',
            }}
          >
            TIME LEFT
          </p>
          <div
            style={{
              fontFamily: "'Press Start 2P'",
              fontSize: '16px',
              color: activeEvent.theme.accentColor,
            }}
          >
            {days}D {hours}H {minutes}M {seconds}S
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 3.2 Event Leaderboard Component

**New file: `src/components/EventLeaderboard.tsx`**

```typescript
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Avatar } from './Avatar';

interface EventLeaderboardProps {
  eventId: string;
}

export function EventLeaderboard({ eventId }: EventLeaderboardProps) {
  const leaderboard = useQuery(api.events.getEventLeaderboard, { eventId });

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <div className="pixel-box p-6 text-center">
        <p style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#eef5db' }}>
          NO SCORES YET
        </p>
      </div>
    );
  }

  return (
    <div className="pixel-box p-4">
      <h3
        style={{
          fontFamily: "'Press Start 2P'",
          fontSize: '10px',
          color: '#ffd93d',
          marginBottom: '16px',
        }}
      >
        EVENT LEADERBOARD
      </h3>
      <div className="space-y-2">
        {leaderboard.map((entry, index) => (
          <div
            key={entry._id}
            className="flex items-center justify-between p-2"
            style={{
              background: index < 3 ? '#ffd93d20' : '#1a1a2e',
              border: '2px solid #4a4a6e',
            }}
          >
            <div className="flex items-center gap-3">
              <span
                style={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: '12px',
                  color: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#eef5db',
                  width: '24px',
                }}
              >
                {index + 1}
              </span>
              <Avatar avatarId={entry.avatarId} size="sm" />
              <span
                style={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: '8px',
                  color: '#eef5db',
                }}
              >
                {entry.username}
              </span>
            </div>
            <div className="text-right">
              <div
                style={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: '10px',
                  color: '#ffd93d',
                }}
              >
                {entry.totalScore}
              </div>
              <div
                style={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: '6px',
                  color: '#4a4a6e',
                }}
              >
                {entry.levelsCompleted} LEVELS
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 3.3 Event Archive Component

**New file: `src/components/EventArchive.tsx`**

```typescript
import { getPastEvents } from '../data/seasonalEvents';

export function EventArchive() {
  const pastEvents = getPastEvents();

  if (pastEvents.length === 0) {
    return (
      <div className="pixel-box p-6 text-center">
        <p style={{ fontFamily: "'Press Start 2P'", fontSize: '8px', color: '#eef5db' }}>
          NO PAST EVENTS YET
        </p>
      </div>
    );
  }

  return (
    <div className="pixel-box p-6">
      <h2
        style={{
          fontFamily: "'Press Start 2P'",
          fontSize: '12px',
          color: '#ffd93d',
          marginBottom: '16px',
        }}
      >
        EVENT ARCHIVE
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pastEvents.map(event => (
          <div
            key={event.id}
            className="p-4 border-2 border-[#4a4a6e] hover:border-[#ffd93d] transition-colors cursor-pointer"
            style={{ background: '#1a1a2e' }}
          >
            <h3
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '10px',
                color: event.theme.primaryColor,
                marginBottom: '8px',
              }}
            >
              {event.name.toUpperCase()}
            </h3>
            <p
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '6px',
                color: '#eef5db',
                marginBottom: '8px',
              }}
            >
              {event.description}
            </p>
            <div
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: '6px',
                color: '#4a4a6e',
              }}
            >
              {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {event.exclusiveAvatars.slice(0, 3).map(avatarId => (
                <div
                  key={avatarId}
                  className="w-8 h-8 bg-[#4a4a6e] opacity-50"
                  title="Event exclusive avatar"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 3.4 Seasonal Theme Wrapper

**New file: `src/components/SeasonalTheme.tsx`**

```typescript
import { useSeasonalEvent } from '../hooks/useSeasonalEvent';
import { useEffect } from 'react';

interface SeasonalThemeProps {
  children: React.ReactNode;
}

export function SeasonalTheme({ children }: SeasonalThemeProps) {
  const { activeEvent } = useSeasonalEvent();

  useEffect(() => {
    if (activeEvent) {
      // Apply theme CSS variables
      document.documentElement.style.setProperty('--event-primary', activeEvent.theme.primaryColor);
      document.documentElement.style.setProperty('--event-secondary', activeEvent.theme.secondaryColor);
      document.documentElement.style.setProperty('--event-accent', activeEvent.theme.accentColor);

      // Add particle effects
      if (activeEvent.theme.particleEffect === 'snow') {
        document.body.classList.add('snow-effect');
      } else if (activeEvent.theme.particleEffect === 'sparkles') {
        document.body.classList.add('sparkle-effect');
      }
    } else {
      // Reset to default
      document.documentElement.style.removeProperty('--event-primary');
      document.documentElement.style.removeProperty('--event-secondary');
      document.documentElement.style.removeProperty('--event-accent');
      document.body.classList.remove('snow-effect', 'sparkle-effect');
    }

    return () => {
      document.body.classList.remove('snow-effect', 'sparkle-effect');
    };
  }, [activeEvent]);

  return <>{children}</>;
}
```

---

## Phase 4: Backend & Progression

### 4.1 Event Progress Tracking

**New file: `convex/events.ts`**

```typescript
import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const recordEventProgress = mutation({
  args: {
    eventId: v.string(),
    levelId: v.string(),
    score: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
      .unique();

    if (!user) throw new Error('User not found');

    // Get or create progress
    const existing = await ctx.db
      .query('seasonalProgress')
      .withIndex('by_user_event', q => q.eq('userId', user._id).eq('eventId', args.eventId))
      .unique();

    if (existing) {
      // Update progress
      const levelsCompleted = existing.levelsCompleted.includes(args.levelId)
        ? existing.levelsCompleted
        : [...existing.levelsCompleted, args.levelId];

      await ctx.db.patch(existing._id, {
        levelsCompleted,
        bestScore: Math.max(existing.bestScore, args.score),
        lastPlayed: Date.now(),
      });
    } else {
      // Create new progress
      await ctx.db.insert('seasonalProgress', {
        userId: user._id,
        eventId: args.eventId,
        levelsCompleted: [args.levelId],
        avatarsUnlocked: [],
        bestScore: args.score,
        lastPlayed: Date.now(),
      });
    }

    // Update event leaderboard
    await updateEventLeaderboard(ctx, user, args.eventId);
  },
});

export const unlockEventAvatar = mutation({
  args: {
    eventId: v.string(),
    avatarId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
      .unique();

    if (!user) throw new Error('User not found');

    const progress = await ctx.db
      .query('seasonalProgress')
      .withIndex('by_user_event', q => q.eq('userId', user._id).eq('eventId', args.eventId))
      .unique();

    if (!progress) throw new Error('No progress found');

    if (!progress.avatarsUnlocked.includes(args.avatarId)) {
      await ctx.db.patch(progress._id, {
        avatarsUnlocked: [...progress.avatarsUnlocked, args.avatarId],
      });
    }
  },
});

export const getEventProgress = query({
  args: { eventId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
      .unique();

    if (!user) return null;

    return await ctx.db
      .query('seasonalProgress')
      .withIndex('by_user_event', q => q.eq('userId', user._id).eq('eventId', args.eventId))
      .unique();
  },
});

export const getEventLeaderboard = query({
  args: { eventId: v.string() },
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query('eventLeaderboards')
      .withIndex('by_event_score', q => q.eq('eventId', args.eventId))
      .order('desc')
      .take(100);

    return entries;
  },
});

async function updateEventLeaderboard(ctx: any, user: any, eventId: string) {
  const progress = await ctx.db
    .query('seasonalProgress')
    .withIndex('by_user_event', q => q.eq('userId', user._id).eq('eventId', eventId))
    .unique();

  if (!progress) return;

  const existing = await ctx.db
    .query('eventLeaderboards')
    .withIndex('by_user_event', q => q.eq('userId', user._id).eq('eventId', eventId))
    .unique();

  const totalScore = progress.bestScore;
  const levelsCompleted = progress.levelsCompleted.length;

  if (existing) {
    await ctx.db.patch(existing._id, {
      totalScore,
      levelsCompleted,
      timestamp: Date.now(),
    });
  } else {
    await ctx.db.insert('eventLeaderboards', {
      eventId,
      userId: user._id,
      username: user.username || 'Anonymous',
      avatarId: user.avatarId,
      totalScore,
      levelsCompleted,
      timestamp: Date.now(),
    });
  }
}
```

### 4.2 Reward System

**New file: `src/utils/eventRewards.ts`**

```typescript
import { type SeasonalEvent } from '../data/seasonalEvents';

export interface EventReward {
  type: 'avatar' | 'badge' | 'title';
  id: string;
  name: string;
  description: string;
  requirement: string;
}

export function calculateEventRewards(
  event: SeasonalEvent,
  levelsCompleted: number,
  totalScore: number
): EventReward[] {
  const rewards: EventReward[] = [];

  // Avatar unlocks based on levels completed
  if (levelsCompleted >= 1 && event.exclusiveAvatars[0]) {
    rewards.push({
      type: 'avatar',
      id: event.exclusiveAvatars[0],
      name: 'First Avatar',
      description: 'Complete first event level',
      requirement: 'Complete 1 level',
    });
  }

  if (levelsCompleted >= 3 && event.exclusiveAvatars[1]) {
    rewards.push({
      type: 'avatar',
      id: event.exclusiveAvatars[1],
      name: 'Second Avatar',
      description: 'Complete 3 event levels',
      requirement: 'Complete 3 levels',
    });
  }

  if (levelsCompleted >= event.levels.length && event.exclusiveAvatars[2]) {
    rewards.push({
      type: 'avatar',
      id: event.exclusiveAvatars[2],
      name: 'Master Avatar',
      description: 'Complete all event levels',
      requirement: `Complete all ${event.levels.length} levels`,
    });
  }

  // Score-based badges
  if (totalScore >= 1000) {
    rewards.push({
      type: 'badge',
      id: `${event.id}-bronze`,
      name: 'Bronze Participant',
      description: 'Score 1000+ points',
      requirement: '1000+ total score',
    });
  }

  if (totalScore >= 5000) {
    rewards.push({
      type: 'badge',
      id: `${event.id}-silver`,
      name: 'Silver Champion',
      description: 'Score 5000+ points',
      requirement: '5000+ total score',
    });
  }

  if (totalScore >= 10000) {
    rewards.push({
      type: 'badge',
      id: `${event.id}-gold`,
      name: 'Gold Master',
      description: 'Score 10000+ points',
      requirement: '10000+ total score',
    });
  }

  return rewards;
}
```

---

## File Structure

```
typingquest/
├── src/
│   ├── data/
│   │   ├── seasonalEvents.ts          (new) - Event configurations
│   │   ├── seasonalWordPacks.ts       (new) - Holiday-themed words
│   │   ├── seasonalLevels.ts          (new) - Event-specific levels
│   │   └── avatars.ts                 (modify) - Add seasonal avatars
│   ├── hooks/
│   │   └── useSeasonalEvent.ts        (new) - Event state management
│   ├── components/
│   │   ├── EventBanner.tsx            (new) - Active event display
│   │   ├── EventLeaderboard.tsx       (new) - Event-specific leaderboard
│   │   ├── EventArchive.tsx           (new) - Past events viewer
│   │   ├── SeasonalTheme.tsx          (new) - Theme wrapper
│   │   └── AvatarSelector.tsx         (modify) - Show seasonal avatars
│   ├── utils/
│   │   └── eventRewards.ts            (new) - Reward calculation
│   └── App.tsx                        (modify) - Add event banner
├── public/
│   ├── avatars/
│   │   └── seasonal/                  (new) - Seasonal avatar images
│   │       ├── santa-knight.png
│   │       ├── snow-wizard.png
│   │       ├── reindeer-racer.png
│   │       ├── pumpkin-knight.png
│   │       ├── vampire-coder.png
│   │       ├── witch-typer.png
│   │       ├── bunny-typer.png
│   │       ├── chick-coder.png
│   │       ├── surfer-knight.png
│   │       ├── beach-cat.png
│   │       └── pirate-coder.png
│   └── events/                        (new) - Event backgrounds
│       ├── christmas-bg.png
│       ├── halloween-bg.png
│       ├── easter-bg.png
│       └── summer-bg.png
├── convex/
│   ├── schema.ts                      (modify) - Event tables
│   └── events.ts                      (new) - Event backend logic
└── docs/
    └── PRP-011-SEASONAL-EVENTS.md     (this file)
```

---

## Implementation Order

1. **Event Configuration** - Create `seasonalEvents.ts` with event definitions
2. **Schema Updates** - Add `seasonalProgress` and `eventLeaderboards` tables
3. **Word Packs** - Create `seasonalWordPacks.ts` with holiday vocabulary
4. **Themed Levels** - Create `seasonalLevels.ts` with event-specific lessons
5. **Event Hook** - Build `useSeasonalEvent.ts` for state management
6. **Backend Functions** - Implement `convex/events.ts` for progress tracking
7. **Event Banner** - Create `EventBanner.tsx` with countdown timer
8. **Event Leaderboard** - Build `EventLeaderboard.tsx` component
9. **Seasonal Avatars** - Generate and add seasonal avatar assets
10. **Avatar Integration** - Update `avatars.ts` and `AvatarSelector.tsx`
11. **Theme System** - Create `SeasonalTheme.tsx` wrapper
12. **Reward System** - Implement `eventRewards.ts` logic
13. **Event Archive** - Build `EventArchive.tsx` for past events
14. **Visual Assets** - Create event backgrounds and themed graphics
15. **Particle Effects** - Add CSS for snow/sparkle effects
16. **Integration** - Wire up events in `App.tsx`
17. **Testing** - Test event activation, progression, and rewards
18. **Polish** - Add animations, sound effects, visual polish

---

## Notes

- **Automatic Activation**: Events activate/deactivate based on calendar dates
- **Persistent Rewards**: Unlocked avatars remain available after events end
- **Countdown Timers**: Real-time updates every second showing time remaining
- **Past Event Archive**: Users can view (but not replay) previous events
- **Themed Backgrounds**: Full visual transformation during active events
- **Word Pack Variety**: Each event has easy/medium/hard difficulty tiers
- **Leaderboard Reset**: Each event gets fresh leaderboard for fair competition
- **FOMO Mechanics**: Exclusive avatars encourage participation during event windows
- **Calendar Integration**: Could add email notifications before events start
- **Multi-language**: Seasonal word packs should be localized for international users
- **Event Overlap**: System handles multiple simultaneous events (e.g., Summer + special anniversary)
- **Performance**: Event checks cached to avoid constant date calculations
- **Analytics**: Track event participation rates and completion metrics
- **Future Events**: Easy to add new events by extending `SEASONAL_EVENTS` array
