# PRP-005: Enhanced Boss Battle System

**Status**: DRAFT
**Author**: Claude + Anton
**Date**: 2025-12-25
**Priority**: MEDIUM
**Estimated Effort**: 4 phases, ~35 tasks

---

## Executive Summary

This PRP introduces an enhanced boss battle system to TypeBit8, adding exciting combat encounters with unique bosses that challenge players through varied attack patterns and special abilities. Boss fights combine traditional typing mechanics with RPG-style combat elements including HP bars, special abilities, weaknesses, victory animations, and rewards. Each boss features custom pixel art sprites matching the game's retro 8-bit aesthetic.

---

## Problem Statement

### Current State

1. **No boss battles**: The game lacks climactic challenge moments or boss encounters
2. **Linear progression**: Every lesson feels similar without variety or special events
3. **No combat mechanics**: Missing HP systems, damage calculation, or battle dynamics
4. **Limited engagement**: No special rewards or achievements for completing challenges
5. **Flat difficulty curve**: No difficulty spikes or special encounters to test mastery

### Impact

| Issue | User Impact |
|-------|-------------|
| No boss battles | Missing excitement and memorable moments |
| Linear lessons | Repetitive gameplay, lower engagement |
| No combat system | Missed opportunity for gamification |
| No special rewards | Less motivation to progress |
| Flat difficulty | Advanced players not challenged |

### Success Criteria

- [ ] At least 5 unique bosses with distinct personalities and attack patterns
- [ ] HP bars for both boss and player visible during battle
- [ ] 3+ special boss abilities that modify typing mechanics
- [ ] Boss weaknesses system (key combos deal extra damage)
- [ ] Victory animations with confetti/particle effects
- [ ] Defeat screens with retry option
- [ ] Boss-specific loot drops (XP bonuses, unlockable avatars, titles)
- [ ] 8-bit pixel art boss sprites (64x64 or 128x128)
- [ ] Boss battles appear every 5 lessons (e.g., lessons 5, 10, 15, 20)
- [ ] Battle stats tracked (damage dealt, accuracy, time)

---

## Proposed Solution

### Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  BOSS BATTLE SYSTEM ARCHITECTURE                                             │
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│  │ Boss Data    │    │ Battle State │    │  Abilities   │                  │
│  │ (HP, sprite, │ +  │ Manager      │ +  │  System      │                  │
│  │  attacks)    │    │ (combat logic│    │ (special     │                  │
│  │              │    │  HP tracking)│    │  effects)    │                  │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘                  │
│         │                   │                   │                           │
│         └───────────────────┼───────────────────┘                           │
│                             ▼                                               │
│                   ┌──────────────────┐                                      │
│                   │ Battle Renderer  │                                      │
│                   │ - Boss sprite    │                                      │
│                   │ - HP bars        │                                      │
│                   │ - Effects/anims  │                                      │
│                   └────────┬─────────┘                                      │
│                            ▼                                                │
│         ┌──────────────────┴──────────────────┐                            │
│         ▼                                      ▼                            │
│  ┌──────────────┐                    ┌──────────────┐                      │
│  │  Victory     │                    │   Defeat     │                      │
│  │  Screen      │                    │   Screen     │                      │
│  │  + Rewards   │                    │  + Retry     │                      │
│  └──────────────┘                    └──────────────┘                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Boss Roster

#### The 5 Bosses

| Boss # | Name | Theme | Primary Color | Appears at Lesson |
|--------|------|-------|---------------|-------------------|
| 1 | **Typo Goblin** | Mischievous trickster | Green `#0ead69` | 5 |
| 2 | **Lag Dragon** | Slow, methodical beast | Pink `#ff6b9d` | 10 |
| 3 | **Glitch Wizard** | Reality-bending mage | Cyan `#3bceac` | 15 |
| 4 | **Keyboard Golem** | Mechanical giant | Yellow `#ffd93d` | 20 |
| 5 | **Error King** | Final boss, all abilities | Purple `#9d4edd` | 25 |

### Boss Abilities System

Each boss has 2-3 special abilities that activate at specific HP thresholds:

**Ability Types:**

1. **Speed Surge** - Target words move/scroll faster
2. **Reverse Text** - Words appear backwards (user must type reversed)
3. **Scramble Letters** - Letters in words shuffle positions
4. **Ghost Keys** - Random keys stop working temporarily
5. **Double Strike** - Next word must be typed twice
6. **Shield Phase** - Boss takes reduced damage for 10 seconds
7. **Combo Breaker** - Player combo resets on any mistake

**Example Boss Ability Patterns:**

- **Typo Goblin** (Easy): Speed Surge at 50% HP
- **Lag Dragon** (Medium): Shield Phase at 75% HP, Double Strike at 25% HP
- **Glitch Wizard** (Hard): Scramble Letters at 66% HP, Reverse Text at 33%
- **Keyboard Golem** (Very Hard): Ghost Keys at 75%, Shield Phase at 50%, Speed Surge at 25%
- **Error King** (Ultimate): All abilities rotate every 15 seconds

### Weakness System

Each boss has specific key combinations that deal bonus damage:

```typescript
interface BossWeakness {
  combo: string[];        // e.g., ['q', 'u', 'i', 'c', 'k']
  damageMultiplier: number; // e.g., 2.0 (200% damage)
  cooldown: number;        // seconds before can trigger again
}
```

**Example Weaknesses:**

- **Typo Goblin**: Words containing "fix" deal 1.5x damage
- **Lag Dragon**: Typing at >80 WPM deals 2x damage
- **Glitch Wizard**: Perfect accuracy (100%) deals 2x damage
- **Keyboard Golem**: Using home row keys exclusively deals 1.8x damage
- **Error King**: 10+ word combo deals 3x damage

### Combat Stats

**Boss Stats:**
- HP: 1000-5000 (scales with boss level)
- Attack Pattern: Words per minute increase
- Ability Cooldowns: 15-30 seconds

**Player Stats:**
- HP: 100 (loses 10 HP per mistake, 5 HP per timeout)
- Damage: Based on WPM and accuracy
- Combo Multiplier: Consecutive correct words increase damage

**Damage Calculation:**

```typescript
baseDamage = (WPM / 10) * accuracyPercent
comboBonus = min(currentCombo * 0.1, 2.0) // Max 2x from combo
weaknessBonus = isWeaknessTriggered ? weaknessMultiplier : 1.0
totalDamage = baseDamage * comboBonus * weaknessBonus
```

---

## Phase 1: Core Battle System

### 1.1 Boss Data Structure

**New file: `src/types/boss.ts`**

```typescript
export interface BossAbility {
  id: string;
  name: string;
  description: string;
  type: 'speed' | 'reverse' | 'scramble' | 'ghost-keys' | 'double' | 'shield' | 'combo-break';
  triggerHpPercent: number; // 0-100
  duration: number; // seconds
  cooldown: number; // seconds
}

export interface BossWeakness {
  description: string;
  condition: 'word-contains' | 'wpm-above' | 'accuracy-perfect' | 'combo-count';
  value: string | number;
  damageMultiplier: number;
  cooldown: number;
}

export interface BossReward {
  xpBonus: number;
  title?: string; // e.g., "Goblin Slayer"
  avatar?: string; // Unlock special avatar
  badge?: string;
}

export interface Boss {
  id: string;
  name: string;
  title: string; // e.g., "The Typo Goblin"
  description: string;
  sprite: string; // Path to pixel art
  level: number; // 1-5
  maxHp: number;
  abilities: BossAbility[];
  weaknesses: BossWeakness[];
  rewards: BossReward;
  appearAtLesson: number;
  dialogues: {
    intro: string[];
    halfHp: string[];
    defeat: string[];
    victory: string[]; // When player loses
  };
}
```

### 1.2 Boss Definitions

**New file: `src/data/bosses.ts`**

```typescript
import { Boss } from '../types/boss';

export const bosses: Boss[] = [
  {
    id: 'typo-goblin',
    name: 'Gobblin',
    title: 'The Typo Goblin',
    description: 'A mischievous creature that feeds on typing mistakes',
    sprite: '/assets/bosses/typo-goblin.png',
    level: 1,
    maxHp: 1000,
    abilities: [
      {
        id: 'speed-surge-1',
        name: 'Caffeine Rush',
        description: 'Words scroll faster!',
        type: 'speed',
        triggerHpPercent: 50,
        duration: 15,
        cooldown: 30,
      },
    ],
    weaknesses: [
      {
        description: 'Takes extra damage from words containing "fix"',
        condition: 'word-contains',
        value: 'fix',
        damageMultiplier: 1.5,
        cooldown: 5,
      },
    ],
    rewards: {
      xpBonus: 500,
      title: 'Goblin Hunter',
      badge: 'first-boss',
    },
    appearAtLesson: 5,
    dialogues: {
      intro: [
        'Hehehe! You think you can type fast?',
        'I\'ll scramble your words and feast on your errors!',
      ],
      halfHp: [
        'ARRGH! You\'re better than I thought!',
        'Time to speed things up!',
      ],
      defeat: [
        'NOOO! My typos... defeated!',
        'You win this time, human...',
      ],
      victory: [
        'Hahaha! Too slow!',
        'Better luck next time!',
      ],
    },
  },

  {
    id: 'lag-dragon',
    name: 'Latency',
    title: 'The Lag Dragon',
    description: 'An ancient dragon whose breath slows time itself',
    sprite: '/assets/bosses/lag-dragon.png',
    level: 2,
    maxHp: 2000,
    abilities: [
      {
        id: 'shield-phase',
        name: 'Temporal Shield',
        description: 'Damage reduced by 50%',
        type: 'shield',
        triggerHpPercent: 75,
        duration: 10,
        cooldown: 25,
      },
      {
        id: 'double-strike',
        name: 'Echo Attack',
        description: 'Next word must be typed twice',
        type: 'double',
        triggerHpPercent: 25,
        duration: 20,
        cooldown: 30,
      },
    ],
    weaknesses: [
      {
        description: 'Typing above 80 WPM bypasses shields',
        condition: 'wpm-above',
        value: 80,
        damageMultiplier: 2.0,
        cooldown: 3,
      },
    ],
    rewards: {
      xpBonus: 1000,
      title: 'Dragon Slayer',
      avatar: 'dragon-coder-alt', // Unlocks alternate dragon avatar
      badge: 'speed-demon',
    },
    appearAtLesson: 10,
    dialogues: {
      intro: [
        'Mortal... you dare challenge me?',
        'I have slowed empires with my lag...',
      ],
      halfHp: [
        'Impressive speed... but can you maintain it?',
        'Activating temporal shields!',
      ],
      defeat: [
        'Your speed... is legendary...',
        'I yield... for now...',
      ],
      victory: [
        'Too slow, as I predicted.',
        'Better train harder, mortal.',
      ],
    },
  },

  {
    id: 'glitch-wizard',
    name: 'Synthax',
    title: 'The Glitch Wizard',
    description: 'A reality-bending sorcerer who manipulates text itself',
    sprite: '/assets/bosses/glitch-wizard.png',
    level: 3,
    maxHp: 3000,
    abilities: [
      {
        id: 'scramble-letters',
        name: 'Text Warp',
        description: 'Letters scramble in random order',
        type: 'scramble',
        triggerHpPercent: 66,
        duration: 12,
        cooldown: 20,
      },
      {
        id: 'reverse-text',
        name: 'Mirror Spell',
        description: 'All words appear backwards',
        type: 'reverse',
        triggerHpPercent: 33,
        duration: 15,
        cooldown: 25,
      },
    ],
    weaknesses: [
      {
        description: 'Perfect accuracy (100%) breaks his magic',
        condition: 'accuracy-perfect',
        value: 100,
        damageMultiplier: 2.0,
        cooldown: 0,
      },
    ],
    rewards: {
      xpBonus: 1500,
      title: 'Reality Hacker',
      avatar: 'code-wizard-alt',
      badge: 'glitch-master',
    },
    appearAtLesson: 15,
    dialogues: {
      intro: [
        '01010010 01100101 01100001 01101100 01101001 01110100 01111001 00100000 01101001 01110011 00100000 01101101 01100001 01101100 01101100 01100101 01100001 01100010 01101100 01100101...',
        'Let me show you the true nature of text...',
      ],
      halfHp: [
        'Interesting... you adapt quickly.',
        'Time to scramble reality itself!',
      ],
      defeat: [
        'Your precision... has unmade me...',
        'Error 404: Wizard not found...',
      ],
      victory: [
        'Accuracy.exe has stopped working.',
        'You cannot handle true chaos.',
      ],
    },
  },

  {
    id: 'keyboard-golem',
    name: 'QWERTY-9000',
    title: 'The Keyboard Golem',
    description: 'A massive mechanical construct built from ancient keyboards',
    sprite: '/assets/bosses/keyboard-golem.png',
    level: 4,
    maxHp: 4000,
    abilities: [
      {
        id: 'ghost-keys',
        name: 'Key Disable',
        description: 'Random keys stop working',
        type: 'ghost-keys',
        triggerHpPercent: 75,
        duration: 8,
        cooldown: 20,
      },
      {
        id: 'shield-phase-2',
        name: 'Mechanical Armor',
        description: 'Damage reduced by 75%',
        type: 'shield',
        triggerHpPercent: 50,
        duration: 12,
        cooldown: 30,
      },
      {
        id: 'speed-surge-2',
        name: 'Overclock',
        description: 'Words scroll at double speed',
        type: 'speed',
        triggerHpPercent: 25,
        duration: 20,
        cooldown: 25,
      },
    ],
    weaknesses: [
      {
        description: 'Home row keys deal extra damage to mechanical core',
        condition: 'word-contains',
        value: 'asdfjkl', // Any home row key
        damageMultiplier: 1.8,
        cooldown: 2,
      },
    ],
    rewards: {
      xpBonus: 2500,
      title: 'Golem Breaker',
      avatar: 'robo-typer-gold',
      badge: 'mechanical-mastery',
    },
    appearAtLesson: 20,
    dialogues: {
      intro: [
        'SYSTEM ONLINE. INTRUDER DETECTED.',
        'INITIATING TYPING COMBAT PROTOCOLS.',
      ],
      halfHp: [
        'DAMAGE THRESHOLD EXCEEDED. ACTIVATING SHIELDS.',
        'WARNING: CORE INTEGRITY AT 50%.',
      ],
      defeat: [
        'CRITICAL FAILURE. SYSTEMS SHUTTING DOWN.',
        'You... are... superior... *powers off*',
      ],
      victory: [
        'COMBAT COMPLETE. INTRUDER ELIMINATED.',
        'SYSTEM RETURNING TO STANDBY MODE.',
      ],
    },
  },

  {
    id: 'error-king',
    name: 'Syntax Error',
    title: 'The Error King',
    description: 'The ultimate manifestation of all typing mistakes',
    sprite: '/assets/bosses/error-king.png',
    level: 5,
    maxHp: 5000,
    abilities: [
      {
        id: 'all-abilities-rotate',
        name: 'Chaos Cycle',
        description: 'Randomly cycles through all boss abilities',
        type: 'combo-break',
        triggerHpPercent: 90,
        duration: 60,
        cooldown: 15,
      },
      {
        id: 'speed-scramble-reverse',
        name: 'Trinity of Terror',
        description: 'Speed, scramble, AND reverse simultaneously',
        type: 'scramble',
        triggerHpPercent: 30,
        duration: 25,
        cooldown: 40,
      },
    ],
    weaknesses: [
      {
        description: 'Combo of 10+ words shatters his defenses',
        condition: 'combo-count',
        value: 10,
        damageMultiplier: 3.0,
        cooldown: 10,
      },
    ],
    rewards: {
      xpBonus: 5000,
      title: 'Error Destroyer',
      avatar: 'pixel-knight-legendary',
      badge: 'ultimate-champion',
    },
    appearAtLesson: 25,
    dialogues: {
      intro: [
        'I AM THE SUM OF ALL YOUR MISTAKES.',
        'EVERY TYPO. EVERY HESITATION. EVERY ERROR.',
        'NOW FACE YOUR ULTIMATE CHALLENGE!',
      ],
      halfHp: [
        'IMPOSSIBLE! YOU ARE MORE SKILLED THAN I CALCULATED!',
        'ACTIVATING... EVERYTHING!!!',
      ],
      defeat: [
        'NO... THIS CANNOT BE...',
        'YOU HAVE ACHIEVED... PERFECTION...',
        'I... AM... OBSOLETE...',
      ],
      victory: [
        'AS EXPECTED. HUMANS ALWAYS MAKE ERRORS.',
        'BETTER LUCK IN YOUR NEXT COMPILE.',
      ],
    },
  },
];
```

### 1.3 Battle State Manager

**New file: `src/hooks/useBossBattle.ts`**

```typescript
import { useState, useEffect, useCallback } from 'react';
import { Boss, BossAbility } from '../types/boss';

interface BattleState {
  bossCurrentHp: number;
  playerCurrentHp: number;
  isAbilityActive: boolean;
  activeAbility: BossAbility | null;
  abilityTimeRemaining: number;
  playerCombo: number;
  totalDamageDealt: number;
  battleStartTime: number;
  isVictory: boolean;
  isDefeat: boolean;
}

export const useBossBattle = (boss: Boss) => {
  const [battleState, setBattleState] = useState<BattleState>({
    bossCurrentHp: boss.maxHp,
    playerCurrentHp: 100,
    isAbilityActive: false,
    activeAbility: null,
    abilityTimeRemaining: 0,
    playerCombo: 0,
    totalDamageDealt: 0,
    battleStartTime: Date.now(),
    isVictory: false,
    isDefeat: false,
  });

  const [abilityCooldowns, setAbilityCooldowns] = useState<Map<string, number>>(new Map());

  // Check for ability triggers based on HP thresholds
  useEffect(() => {
    const hpPercent = (battleState.bossCurrentHp / boss.maxHp) * 100;

    for (const ability of boss.abilities) {
      const onCooldown = abilityCooldowns.get(ability.id) || 0;

      if (hpPercent <= ability.triggerHpPercent &&
          !battleState.isAbilityActive &&
          Date.now() - onCooldown > ability.cooldown * 1000) {
        activateAbility(ability);
        break;
      }
    }
  }, [battleState.bossCurrentHp]);

  const activateAbility = useCallback((ability: BossAbility) => {
    setBattleState(prev => ({
      ...prev,
      isAbilityActive: true,
      activeAbility: ability,
      abilityTimeRemaining: ability.duration,
    }));

    setAbilityCooldowns(prev => new Map(prev).set(ability.id, Date.now()));

    // Auto-deactivate after duration
    setTimeout(() => {
      setBattleState(prev => ({
        ...prev,
        isAbilityActive: false,
        activeAbility: null,
        abilityTimeRemaining: 0,
      }));
    }, ability.duration * 1000);
  }, []);

  const dealDamage = useCallback((wpm: number, accuracy: number, word: string) => {
    let baseDamage = (wpm / 10) * (accuracy / 100);

    // Combo multiplier (max 2x)
    const comboBonus = Math.min(battleState.playerCombo * 0.1, 2.0);

    // Check for weakness triggers
    let weaknessBonus = 1.0;
    for (const weakness of boss.weaknesses) {
      if (checkWeakness(weakness, word, wpm, accuracy)) {
        weaknessBonus = weakness.damageMultiplier;
        break;
      }
    }

    // Shield ability reduces damage to boss
    if (battleState.activeAbility?.type === 'shield') {
      baseDamage *= 0.5; // 50% damage reduction
    }

    const totalDamage = baseDamage * comboBonus * weaknessBonus;

    setBattleState(prev => {
      const newHp = Math.max(0, prev.bossCurrentHp - totalDamage);
      const isVictory = newHp <= 0;

      return {
        ...prev,
        bossCurrentHp: newHp,
        playerCombo: prev.playerCombo + 1,
        totalDamageDealt: prev.totalDamageDealt + totalDamage,
        isVictory,
      };
    });
  }, [battleState, boss]);

  const takeDamage = useCallback((amount: number) => {
    setBattleState(prev => {
      const newHp = Math.max(0, prev.playerCurrentHp - amount);
      const isDefeat = newHp <= 0;

      return {
        ...prev,
        playerCurrentHp: newHp,
        playerCombo: 0, // Reset combo on damage
        isDefeat,
      };
    });
  }, []);

  const checkWeakness = (
    weakness: any,
    word: string,
    wpm: number,
    accuracy: number
  ): boolean => {
    switch (weakness.condition) {
      case 'word-contains':
        return word.toLowerCase().includes(weakness.value.toLowerCase());
      case 'wpm-above':
        return wpm > weakness.value;
      case 'accuracy-perfect':
        return accuracy >= weakness.value;
      case 'combo-count':
        return battleState.playerCombo >= weakness.value;
      default:
        return false;
    }
  };

  const resetBattle = useCallback(() => {
    setBattleState({
      bossCurrentHp: boss.maxHp,
      playerCurrentHp: 100,
      isAbilityActive: false,
      activeAbility: null,
      abilityTimeRemaining: 0,
      playerCombo: 0,
      totalDamageDealt: 0,
      battleStartTime: Date.now(),
      isVictory: false,
      isDefeat: false,
    });
    setAbilityCooldowns(new Map());
  }, [boss]);

  return {
    battleState,
    dealDamage,
    takeDamage,
    resetBattle,
  };
};
```

### 1.4 Battle Stats Tracking

**Update: `convex/schema.ts`**

Add boss battle stats schema:

```typescript
bossBattles: defineTable({
  userId: v.id('users'),
  bossId: v.string(),
  isVictory: v.boolean(),
  damageDealt: v.number(),
  damageTaken: v.number(),
  maxCombo: v.number(),
  battleDuration: v.number(), // seconds
  wpm: v.number(),
  accuracy: v.number(),
  timestamp: v.number(),
})
  .index('by_user', ['userId'])
  .index('by_boss', ['bossId'])
  .index('by_user_and_boss', ['userId', 'bossId']),
```

---

## Phase 2: Battle UI Components

### 2.1 Boss Battle Screen

**New file: `src/components/BossBattle.tsx`**

```typescript
import React, { useEffect, useState } from 'react';
import { Boss } from '../types/boss';
import { useBossBattle } from '../hooks/useBossBattle';
import { BossSprite } from './BossSprite';
import { HealthBar } from './HealthBar';
import { AbilityIndicator } from './AbilityIndicator';
import { BattleTypingArea } from './BattleTypingArea';
import { VictoryScreen } from './VictoryScreen';
import { DefeatScreen } from './DefeatScreen';

interface BossBattleProps {
  boss: Boss;
  onComplete: (victory: boolean) => void;
}

export const BossBattle: React.FC<BossBattleProps> = ({ boss, onComplete }) => {
  const { battleState, dealDamage, takeDamage, resetBattle } = useBossBattle(boss);
  const [showDialogue, setShowDialogue] = useState(true);
  const [currentDialogue, setCurrentDialogue] = useState(boss.dialogues.intro);
  const [dialogueIndex, setDialogueIndex] = useState(0);

  useEffect(() => {
    // Show intro dialogue on mount
    setShowDialogue(true);
    setTimeout(() => setShowDialogue(false), 4000);
  }, []);

  useEffect(() => {
    const hpPercent = (battleState.bossCurrentHp / boss.maxHp) * 100;

    // Trigger half HP dialogue
    if (hpPercent <= 50 && hpPercent > 45) {
      setCurrentDialogue(boss.dialogues.halfHp);
      setDialogueIndex(0);
      setShowDialogue(true);
      setTimeout(() => setShowDialogue(false), 3000);
    }
  }, [battleState.bossCurrentHp]);

  useEffect(() => {
    if (battleState.isVictory) {
      setCurrentDialogue(boss.dialogues.defeat);
      setShowDialogue(true);
    } else if (battleState.isDefeat) {
      setCurrentDialogue(boss.dialogues.victory);
      setShowDialogue(true);
    }
  }, [battleState.isVictory, battleState.isDefeat]);

  if (battleState.isVictory) {
    return <VictoryScreen boss={boss} battleState={battleState} onContinue={() => onComplete(true)} />;
  }

  if (battleState.isDefeat) {
    return <DefeatScreen boss={boss} onRetry={resetBattle} onQuit={() => onComplete(false)} />;
  }

  return (
    <div className="boss-battle-container">
      {/* Boss Section */}
      <div className="boss-section">
        <BossSprite
          sprite={boss.sprite}
          isAttacking={battleState.isAbilityActive}
          currentHp={battleState.bossCurrentHp}
          maxHp={boss.maxHp}
        />

        <div className="boss-info">
          <h2 className="boss-title">{boss.title}</h2>
          <HealthBar
            current={battleState.bossCurrentHp}
            max={boss.maxHp}
            color="red"
            label="Boss HP"
          />
        </div>

        {battleState.isAbilityActive && (
          <AbilityIndicator
            ability={battleState.activeAbility!}
            timeRemaining={battleState.abilityTimeRemaining}
          />
        )}

        {showDialogue && (
          <div className="boss-dialogue">
            <p>{currentDialogue[dialogueIndex]}</p>
          </div>
        )}
      </div>

      {/* Player Section */}
      <div className="player-section">
        <div className="player-stats">
          <HealthBar
            current={battleState.playerCurrentHp}
            max={100}
            color="green"
            label="Your HP"
          />
          <div className="combo-display">
            Combo: {battleState.playerCombo}x
          </div>
        </div>

        <BattleTypingArea
          boss={boss}
          activeAbility={battleState.activeAbility}
          onWordComplete={(wpm, accuracy, word) => dealDamage(wpm, accuracy, word)}
          onMistake={() => takeDamage(10)}
          onTimeout={() => takeDamage(5)}
        />
      </div>
    </div>
  );
};
```

### 2.2 Health Bar Component

**New file: `src/components/HealthBar.tsx`**

```typescript
import React from 'react';

interface HealthBarProps {
  current: number;
  max: number;
  color: 'red' | 'green' | 'blue';
  label: string;
}

export const HealthBar: React.FC<HealthBarProps> = ({ current, max, color, label }) => {
  const percentage = (current / max) * 100;

  const colorClasses = {
    red: 'bg-red-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
  };

  return (
    <div className="health-bar-container">
      <div className="health-bar-label">
        {label}: {Math.floor(current)} / {max}
      </div>
      <div className="health-bar-track bg-gray-700 rounded-full h-6 relative overflow-hidden">
        <div
          className={`health-bar-fill ${colorClasses[color]} h-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
        {/* Pixelated effect overlay */}
        <div className="health-bar-pixels absolute inset-0 opacity-20"
             style={{
               backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
             }}
        />
      </div>
    </div>
  );
};
```

### 2.3 Boss Sprite Component

**New file: `src/components/BossSprite.tsx`**

```typescript
import React from 'react';
import { motion } from 'framer-motion';

interface BossSpriteProps {
  sprite: string;
  isAttacking: boolean;
  currentHp: number;
  maxHp: number;
}

export const BossSprite: React.FC<BossSpriteProps> = ({
  sprite,
  isAttacking,
  currentHp,
  maxHp
}) => {
  const hpPercent = (currentHp / maxHp) * 100;

  // Flash red when below 25% HP
  const isLowHp = hpPercent < 25;

  return (
    <motion.div
      className="boss-sprite-container"
      animate={{
        scale: isAttacking ? 1.1 : 1,
        x: isAttacking ? [0, -5, 5, -5, 5, 0] : 0,
      }}
      transition={{
        duration: isAttacking ? 0.5 : 0.3,
      }}
    >
      <img
        src={sprite}
        alt="Boss"
        className={`boss-sprite pixel-art ${isLowHp ? 'flash-red' : ''}`}
        style={{
          imageRendering: 'pixelated',
          width: '256px',
          height: '256px',
        }}
      />

      {isAttacking && (
        <motion.div
          className="attack-indicator"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1.5 }}
          exit={{ opacity: 0 }}
        >
          ⚡
        </motion.div>
      )}
    </motion.div>
  );
};
```

### 2.4 Ability Indicator

**New file: `src/components/AbilityIndicator.tsx`**

```typescript
import React, { useEffect, useState } from 'react';
import { BossAbility } from '../types/boss';

interface AbilityIndicatorProps {
  ability: BossAbility;
  timeRemaining: number;
}

export const AbilityIndicator: React.FC<AbilityIndicatorProps> = ({
  ability,
  timeRemaining
}) => {
  const [countdown, setCountdown] = useState(timeRemaining);

  useEffect(() => {
    setCountdown(timeRemaining);

    const interval = setInterval(() => {
      setCountdown(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining]);

  const abilityIcons = {
    speed: '⚡',
    reverse: '🔄',
    scramble: '🌀',
    'ghost-keys': '👻',
    double: '✖️2',
    shield: '🛡️',
    'combo-break': '💥',
  };

  return (
    <div className="ability-indicator bg-purple-900 border-2 border-purple-500 p-4 rounded-lg animate-pulse">
      <div className="text-center">
        <span className="ability-icon text-4xl">{abilityIcons[ability.type]}</span>
        <h3 className="ability-name text-yellow-400 font-bold mt-2">{ability.name}</h3>
        <p className="ability-description text-sm text-gray-300">{ability.description}</p>
        <div className="ability-timer text-2xl text-red-400 mt-2">
          {countdown}s
        </div>
      </div>
    </div>
  );
};
```

---

## Phase 3: Victory & Defeat Screens

### 3.1 Victory Screen

**New file: `src/components/VictoryScreen.tsx`**

```typescript
import React, { useEffect } from 'react';
import Confetti from 'react-confetti';
import { Boss } from '../types/boss';
import { motion } from 'framer-motion';

interface VictoryScreenProps {
  boss: Boss;
  battleState: any;
  onContinue: () => void;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
  boss,
  battleState,
  onContinue
}) => {
  const battleDuration = (Date.now() - battleState.battleStartTime) / 1000;

  useEffect(() => {
    // Play victory sound
    const audio = new Audio('/sounds/victory.mp3');
    audio.play();
  }, []);

  return (
    <div className="victory-screen">
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        recycle={false}
        numberOfPieces={500}
      />

      <motion.div
        className="victory-content"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', duration: 0.8 }}
      >
        <h1 className="victory-title text-6xl font-bold text-yellow-400 mb-4">
          VICTORY!
        </h1>

        <img
          src={boss.sprite}
          alt={boss.name}
          className="boss-defeated opacity-50 grayscale mb-4"
          style={{ width: '128px', height: '128px' }}
        />

        <h2 className="text-3xl text-white mb-2">{boss.title} Defeated!</h2>

        {/* Stats */}
        <div className="battle-stats bg-gray-800 p-6 rounded-lg mb-4">
          <div className="stat-row">
            <span>Total Damage:</span>
            <span className="text-yellow-400">{Math.floor(battleState.totalDamageDealt)}</span>
          </div>
          <div className="stat-row">
            <span>Max Combo:</span>
            <span className="text-green-400">{battleState.playerCombo}x</span>
          </div>
          <div className="stat-row">
            <span>Battle Time:</span>
            <span className="text-blue-400">{battleDuration.toFixed(1)}s</span>
          </div>
          <div className="stat-row">
            <span>HP Remaining:</span>
            <span className="text-red-400">{battleState.playerCurrentHp}/100</span>
          </div>
        </div>

        {/* Rewards */}
        <div className="rewards-section bg-purple-900 p-6 rounded-lg mb-4">
          <h3 className="text-2xl text-yellow-400 mb-4">Rewards</h3>

          <div className="reward-item">
            <span className="text-xl">💰</span>
            <span className="text-white">+{boss.rewards.xpBonus} XP</span>
          </div>

          {boss.rewards.title && (
            <div className="reward-item">
              <span className="text-xl">🏆</span>
              <span className="text-white">Title: "{boss.rewards.title}"</span>
            </div>
          )}

          {boss.rewards.avatar && (
            <div className="reward-item">
              <span className="text-xl">👤</span>
              <span className="text-white">New Avatar Unlocked!</span>
            </div>
          )}

          {boss.rewards.badge && (
            <div className="reward-item">
              <span className="text-xl">🎖️</span>
              <span className="text-white">Badge Earned</span>
            </div>
          )}
        </div>

        <button
          onClick={onContinue}
          className="continue-btn bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-xl font-bold"
        >
          Continue
        </button>
      </motion.div>
    </div>
  );
};
```

### 3.2 Defeat Screen

**New file: `src/components/DefeatScreen.tsx`**

```typescript
import React from 'react';
import { Boss } from '../types/boss';
import { motion } from 'framer-motion';

interface DefeatScreenProps {
  boss: Boss;
  onRetry: () => void;
  onQuit: () => void;
}

export const DefeatScreen: React.FC<DefeatScreenProps> = ({ boss, onRetry, onQuit }) => {
  return (
    <div className="defeat-screen bg-red-900 bg-opacity-50">
      <motion.div
        className="defeat-content"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="defeat-title text-6xl font-bold text-red-500 mb-4">
          DEFEATED
        </h1>

        <img
          src={boss.sprite}
          alt={boss.name}
          className="boss-victorious mb-4 animate-bounce"
          style={{ width: '128px', height: '128px' }}
        />

        <div className="boss-taunt bg-gray-800 p-4 rounded-lg mb-6 max-w-md">
          <p className="text-white italic">"{boss.dialogues.victory[0]}"</p>
        </div>

        <div className="defeat-actions flex gap-4">
          <button
            onClick={onRetry}
            className="retry-btn bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-bold"
          >
            Try Again
          </button>
          <button
            onClick={onQuit}
            className="quit-btn bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-bold"
          >
            Return to Lessons
          </button>
        </div>
      </motion.div>
    </div>
  );
};
```

---

## Phase 4: Boss Art & Integration

### 4.1 Pixel Art Generation

Generate 8-bit boss sprites using AI image generation or manual pixel art tools:

**Sprite Specifications:**
- Size: 128x128 pixels
- Format: PNG with transparency
- Color palette: TypeBit8 colors + boss-specific accents
- Style: Retro NES/Game Boy aesthetic
- Animation frames (optional): Idle, Attack, Hurt

**Asset locations:**
```
public/
  assets/
    bosses/
      typo-goblin.png
      lag-dragon.png
      glitch-wizard.png
      keyboard-golem.png
      error-king.png
```

### 4.2 Lesson Integration

**Update: `src/data/lessons.ts`**

Add boss encounter markers:

```typescript
export const lessons = [
  // ... lessons 1-4
  {
    id: 5,
    title: 'Boss: Typo Goblin',
    isBossBattle: true,
    bossId: 'typo-goblin',
    // ... rest of lesson config
  },
  // ... lessons 6-9
  {
    id: 10,
    title: 'Boss: Lag Dragon',
    isBossBattle: true,
    bossId: 'lag-dragon',
  },
  // ... etc
];
```

### 4.3 Routing & Navigation

**Update: `src/App.tsx`**

Add boss battle routing:

```typescript
import { BossBattle } from './components/BossBattle';
import { bosses } from './data/bosses';

// In lesson view logic:
if (currentLesson.isBossBattle) {
  const boss = bosses.find(b => b.id === currentLesson.bossId);
  return (
    <BossBattle
      boss={boss!}
      onComplete={(victory) => {
        if (victory) {
          // Award rewards, update progress
          handleBossVictory(boss);
        }
        // Return to lesson select
        setView('lessons');
      }}
    />
  );
}
```

### 4.4 Sound Effects

**Audio Assets:**
```
public/
  sounds/
    boss-intro.mp3          // Dramatic entrance music
    ability-activate.mp3    // When boss uses special ability
    player-hit.mp3          // Player takes damage
    boss-hit.mp3            // Boss takes damage
    combo-milestone.mp3     // Every 5 combo
    weakness-trigger.mp3    // Weakness activated
    victory.mp3             // Boss defeated
    defeat.mp3              // Player defeated
```

---

## File Structure

```
src/
  types/
    boss.ts                      # Boss type definitions

  data/
    bosses.ts                    # All 5 boss definitions

  hooks/
    useBossBattle.ts             # Battle state management

  components/
    BossBattle.tsx               # Main battle screen
    BossSprite.tsx               # Animated boss display
    HealthBar.tsx                # HP bar component
    AbilityIndicator.tsx         # Active ability display
    BattleTypingArea.tsx         # Modified typing area for battles
    VictoryScreen.tsx            # Victory celebration
    DefeatScreen.tsx             # Defeat/retry screen

  assets/
    bosses/
      typo-goblin.png
      lag-dragon.png
      glitch-wizard.png
      keyboard-golem.png
      error-king.png

  sounds/
    boss-intro.mp3
    ability-activate.mp3
    player-hit.mp3
    boss-hit.mp3
    combo-milestone.mp3
    weakness-trigger.mp3
    victory.mp3
    defeat.mp3

convex/
  schema.ts                      # Add bossBattles table
  bossBattles.ts                 # Boss battle queries/mutations
```

---

## Implementation Order

### Phase 1: Core Battle System (Days 1-3)
1. Create boss type definitions (`boss.ts`)
2. Define all 5 bosses with abilities (`bosses.ts`)
3. Implement `useBossBattle` hook with combat logic
4. Add `bossBattles` schema to Convex
5. Create boss battle mutations/queries

### Phase 2: Battle UI (Days 4-6)
6. Build `HealthBar` component
7. Build `BossSprite` component with animations
8. Build `AbilityIndicator` component
9. Create `BattleTypingArea` (modified typing area)
10. Build main `BossBattle` screen
11. Add CSS styling for pixel art aesthetic

### Phase 3: Victory & Defeat (Days 7-8)
12. Build `VictoryScreen` with confetti
13. Build `DefeatScreen` with retry
14. Implement reward distribution
15. Add battle stats tracking
16. Test victory/defeat flows

### Phase 4: Assets & Integration (Days 9-10)
17. Generate/create 5 boss pixel art sprites
18. Source or create sound effects
19. Update lesson data with boss markers
20. Integrate boss battles into lesson flow
21. Add boss battle routing in `App.tsx`
22. Test all 5 boss encounters end-to-end

---

## Notes

### Dependencies

```json
{
  "react-confetti": "^6.1.0",
  "framer-motion": "^10.16.0"  // If not already installed
}
```

### Future Enhancements

1. **Boss Variants**: Hard mode versions with more HP and abilities
2. **Boss Rush Mode**: Fight all 5 bosses consecutively
3. **Co-op Battles**: Multiplayer boss fights
4. **Custom Boss Creator**: Let users design bosses
5. **Seasonal Bosses**: Limited-time themed bosses (Halloween, Christmas)
6. **Boss Leaderboards**: Fastest clear times, highest damage
7. **Achievement System**: "No-hit boss", "Speed runner", "Weakness master"
8. **Boss Lore**: Unlockable backstories and dialogue trees

### Accessibility

- High contrast mode for HP bars
- Sound effect toggles
- Colorblind-friendly damage indicators
- Keyboard-only navigation for battle UI
- Screen reader announcements for ability activations

### Performance

- Lazy load boss sprites
- Preload sound effects on boss lesson approach
- Optimize animation frames
- Use CSS transforms for sprite animations (GPU accelerated)
- Debounce ability checks to prevent lag

### Testing Checklist

- [ ] All 5 bosses load correctly
- [ ] HP bars update accurately
- [ ] Abilities trigger at correct HP thresholds
- [ ] Weakness conditions work properly
- [ ] Damage calculations are correct
- [ ] Combo system increments/resets properly
- [ ] Victory screen shows correct stats
- [ ] Defeat screen retry works
- [ ] Rewards are awarded correctly
- [ ] Battle stats save to database
- [ ] Sound effects play at right times
- [ ] Animations perform smoothly
- [ ] Mobile responsive layout works

---

**END OF PRP-005**
