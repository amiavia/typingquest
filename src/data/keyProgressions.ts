import type { LayoutFamily } from '../types/settings';

// Key stage in a progression
export interface KeyStage {
  id: number;
  name: string;
  newKeys: string[];        // Keys introduced this stage
  cumulativeKeys: string[]; // All keys learned up to this stage
  conceptKey: string;       // i18n key for concept explanation
}

// Full progression for a layout family
export interface KeyProgression {
  family: LayoutFamily;
  stages: KeyStage[];
}

// Helper to build cumulative keys
function buildCumulative(stages: Omit<KeyStage, 'cumulativeKeys'>[]): KeyStage[] {
  let cumulative: string[] = [];
  return stages.map(stage => {
    cumulative = [...cumulative, ...stage.newKeys];
    return { ...stage, cumulativeKeys: [...cumulative] };
  });
}

// =============================================================================
// QWERTY PROGRESSION (US/UK/International Standard)
// =============================================================================
export const QWERTY_PROGRESSION: KeyProgression = {
  family: 'qwerty',
  stages: buildCumulative([
    {
      id: 1,
      name: 'home_row_basic',
      newKeys: ['a', 's', 'd', 'f', 'j', 'k', 'l', ';'],
      conceptKey: 'lesson.home_row_basic.concept',
    },
    {
      id: 2,
      name: 'home_row_extended',
      newKeys: ['g', 'h'],
      conceptKey: 'lesson.home_row_extended.concept',
    },
    {
      id: 3,
      name: 'top_row_vowels',
      newKeys: ['e', 'i'],
      conceptKey: 'lesson.top_row_vowels.concept',
    },
    {
      id: 4,
      name: 'top_row_index',
      newKeys: ['r', 'u'],
      conceptKey: 'lesson.top_row_index.concept',
    },
    {
      id: 5,
      name: 'top_row_ring',
      newKeys: ['w', 'o'],
      conceptKey: 'lesson.top_row_ring.concept',
    },
    {
      id: 6,
      name: 'top_row_pinky',
      newKeys: ['q', 'p'],
      conceptKey: 'lesson.top_row_pinky.concept',
    },
    {
      id: 7,
      name: 'top_row_complete',
      newKeys: ['t', 'y'],
      conceptKey: 'lesson.top_row_complete.concept',
    },
    {
      id: 8,
      name: 'bottom_row_middle_index',
      newKeys: ['c', 'm'],
      conceptKey: 'lesson.bottom_row_middle_index.concept',
    },
    {
      id: 9,
      name: 'bottom_row_index',
      newKeys: ['v', 'n'],
      conceptKey: 'lesson.bottom_row_index.concept',
    },
    {
      id: 10,
      name: 'bottom_row_ring',
      newKeys: ['x', ','],
      conceptKey: 'lesson.bottom_row_ring.concept',
    },
    {
      id: 11,
      name: 'bottom_row_pinky',
      newKeys: ['z', '.'],
      conceptKey: 'lesson.bottom_row_pinky.concept',
    },
    {
      id: 12,
      name: 'complete_keyboard',
      newKeys: ['b', ' '],
      conceptKey: 'lesson.complete_keyboard.concept',
    },
    {
      id: 13,
      name: 'full_practice',
      newKeys: [],
      conceptKey: 'lesson.full_practice.concept',
    },
    {
      id: 14,
      name: 'speed_building',
      newKeys: [],
      conceptKey: 'lesson.speed_building.concept',
    },
    {
      id: 15,
      name: 'mastery',
      newKeys: [],
      conceptKey: 'lesson.mastery.concept',
    },
  ]),
};

// =============================================================================
// QWERTZ PROGRESSION (German/Swiss - Z and Y positions swapped)
// Key difference: Z is on top row (easier), Y is on bottom row (harder)
// =============================================================================
export const QWERTZ_PROGRESSION: KeyProgression = {
  family: 'qwertz',
  stages: buildCumulative([
    {
      id: 1,
      name: 'home_row_basic',
      newKeys: ['a', 's', 'd', 'f', 'j', 'k', 'l', 'ö'],  // ö instead of ;
      conceptKey: 'lesson.home_row_basic.concept',
    },
    {
      id: 2,
      name: 'home_row_extended',
      newKeys: ['g', 'h'],
      conceptKey: 'lesson.home_row_extended.concept',
    },
    {
      id: 3,
      name: 'top_row_vowels',
      newKeys: ['e', 'i'],
      conceptKey: 'lesson.top_row_vowels.concept',
    },
    {
      id: 4,
      name: 'top_row_index',
      newKeys: ['r', 'u'],
      conceptKey: 'lesson.top_row_index.concept',
    },
    {
      id: 5,
      name: 'top_row_ring',
      newKeys: ['w', 'o'],
      conceptKey: 'lesson.top_row_ring.concept',
    },
    {
      id: 6,
      name: 'top_row_pinky',
      newKeys: ['q', 'p'],
      conceptKey: 'lesson.top_row_pinky.concept',
    },
    {
      id: 7,
      name: 'top_row_complete',
      newKeys: ['t', 'z'],  // Z instead of Y (Z is on top row in QWERTZ)
      conceptKey: 'lesson.top_row_complete.concept',
    },
    {
      id: 8,
      name: 'bottom_row_middle_index',
      newKeys: ['c', 'm'],
      conceptKey: 'lesson.bottom_row_middle_index.concept',
    },
    {
      id: 9,
      name: 'bottom_row_index',
      newKeys: ['v', 'n'],
      conceptKey: 'lesson.bottom_row_index.concept',
    },
    {
      id: 10,
      name: 'bottom_row_ring',
      newKeys: ['x', ','],
      conceptKey: 'lesson.bottom_row_ring.concept',
    },
    {
      id: 11,
      name: 'bottom_row_pinky',
      newKeys: ['y', '.'],  // Y instead of Z (Y is on bottom row in QWERTZ)
      conceptKey: 'lesson.bottom_row_pinky.concept',
    },
    {
      id: 12,
      name: 'complete_keyboard',
      newKeys: ['b', ' '],
      conceptKey: 'lesson.complete_keyboard.concept',
    },
    {
      id: 13,
      name: 'full_practice',
      newKeys: [],
      conceptKey: 'lesson.full_practice.concept',
    },
    {
      id: 14,
      name: 'speed_building',
      newKeys: [],
      conceptKey: 'lesson.speed_building.concept',
    },
    {
      id: 15,
      name: 'mastery',
      newKeys: [],
      conceptKey: 'lesson.mastery.concept',
    },
  ]),
};

// =============================================================================
// AZERTY PROGRESSION (French/Belgian)
// Key differences: A↔Q swapped, Z↔W swapped, M on home row
// =============================================================================
export const AZERTY_PROGRESSION: KeyProgression = {
  family: 'azerty',
  stages: buildCumulative([
    {
      id: 1,
      name: 'home_row_basic',
      newKeys: ['q', 's', 'd', 'f', 'j', 'k', 'l', 'm'],  // Q instead of A, M instead of ;
      conceptKey: 'lesson.home_row_basic.concept',
    },
    {
      id: 2,
      name: 'home_row_extended',
      newKeys: ['g', 'h'],
      conceptKey: 'lesson.home_row_extended.concept',
    },
    {
      id: 3,
      name: 'top_row_vowels',
      newKeys: ['e', 'i'],
      conceptKey: 'lesson.top_row_vowels.concept',
    },
    {
      id: 4,
      name: 'top_row_index',
      newKeys: ['r', 'u'],
      conceptKey: 'lesson.top_row_index.concept',
    },
    {
      id: 5,
      name: 'top_row_ring',
      newKeys: ['z', 'o'],  // Z instead of W (Z is on top row in AZERTY)
      conceptKey: 'lesson.top_row_ring.concept',
    },
    {
      id: 6,
      name: 'top_row_pinky',
      newKeys: ['a', 'p'],  // A instead of Q (A is on top row in AZERTY)
      conceptKey: 'lesson.top_row_pinky.concept',
    },
    {
      id: 7,
      name: 'top_row_complete',
      newKeys: ['t', 'y'],
      conceptKey: 'lesson.top_row_complete.concept',
    },
    {
      id: 8,
      name: 'bottom_row_middle_index',
      newKeys: ['c', ','],  // Comma position differs
      conceptKey: 'lesson.bottom_row_middle_index.concept',
    },
    {
      id: 9,
      name: 'bottom_row_index',
      newKeys: ['v', 'n'],
      conceptKey: 'lesson.bottom_row_index.concept',
    },
    {
      id: 10,
      name: 'bottom_row_ring',
      newKeys: ['x', ';'],
      conceptKey: 'lesson.bottom_row_ring.concept',
    },
    {
      id: 11,
      name: 'bottom_row_pinky',
      newKeys: ['w', ':'],  // W instead of Z (W is on bottom row in AZERTY)
      conceptKey: 'lesson.bottom_row_pinky.concept',
    },
    {
      id: 12,
      name: 'complete_keyboard',
      newKeys: ['b', ' '],
      conceptKey: 'lesson.complete_keyboard.concept',
    },
    {
      id: 13,
      name: 'full_practice',
      newKeys: [],
      conceptKey: 'lesson.full_practice.concept',
    },
    {
      id: 14,
      name: 'speed_building',
      newKeys: [],
      conceptKey: 'lesson.speed_building.concept',
    },
    {
      id: 15,
      name: 'mastery',
      newKeys: [],
      conceptKey: 'lesson.mastery.concept',
    },
  ]),
};

// =============================================================================
// DVORAK PROGRESSION
// Completely different layout optimized for efficiency
// =============================================================================
export const DVORAK_PROGRESSION: KeyProgression = {
  family: 'dvorak',
  stages: buildCumulative([
    {
      id: 1,
      name: 'home_row_basic',
      newKeys: ['a', 'o', 'e', 'u', 'h', 't', 'n', 's'],
      conceptKey: 'lesson.home_row_basic.concept',
    },
    {
      id: 2,
      name: 'home_row_extended',
      newKeys: ['i', 'd'],
      conceptKey: 'lesson.home_row_extended.concept',
    },
    {
      id: 3,
      name: 'top_row_start',
      newKeys: ['.', 'c'],
      conceptKey: 'lesson.top_row_vowels.concept',
    },
    {
      id: 4,
      name: 'top_row_index',
      newKeys: ['p', 'g'],
      conceptKey: 'lesson.top_row_index.concept',
    },
    {
      id: 5,
      name: 'top_row_ring',
      newKeys: [',', 'r'],
      conceptKey: 'lesson.top_row_ring.concept',
    },
    {
      id: 6,
      name: 'top_row_pinky',
      newKeys: ["'", 'l'],
      conceptKey: 'lesson.top_row_pinky.concept',
    },
    {
      id: 7,
      name: 'top_row_complete',
      newKeys: ['y', 'f'],
      conceptKey: 'lesson.top_row_complete.concept',
    },
    {
      id: 8,
      name: 'bottom_row_start',
      newKeys: ['j', 'm'],
      conceptKey: 'lesson.bottom_row_middle_index.concept',
    },
    {
      id: 9,
      name: 'bottom_row_index',
      newKeys: ['k', 'w'],
      conceptKey: 'lesson.bottom_row_index.concept',
    },
    {
      id: 10,
      name: 'bottom_row_ring',
      newKeys: ['q', 'v'],
      conceptKey: 'lesson.bottom_row_ring.concept',
    },
    {
      id: 11,
      name: 'bottom_row_pinky',
      newKeys: [';', 'z'],
      conceptKey: 'lesson.bottom_row_pinky.concept',
    },
    {
      id: 12,
      name: 'complete_keyboard',
      newKeys: ['x', 'b', ' '],
      conceptKey: 'lesson.complete_keyboard.concept',
    },
    {
      id: 13,
      name: 'full_practice',
      newKeys: [],
      conceptKey: 'lesson.full_practice.concept',
    },
    {
      id: 14,
      name: 'speed_building',
      newKeys: [],
      conceptKey: 'lesson.speed_building.concept',
    },
    {
      id: 15,
      name: 'mastery',
      newKeys: [],
      conceptKey: 'lesson.mastery.concept',
    },
  ]),
};

// =============================================================================
// COLEMAK PROGRESSION
// Modern ergonomic layout, similar to QWERTY but optimized
// =============================================================================
export const COLEMAK_PROGRESSION: KeyProgression = {
  family: 'colemak',
  stages: buildCumulative([
    {
      id: 1,
      name: 'home_row_basic',
      newKeys: ['a', 'r', 's', 't', 'n', 'e', 'i', 'o'],
      conceptKey: 'lesson.home_row_basic.concept',
    },
    {
      id: 2,
      name: 'home_row_extended',
      newKeys: ['d', 'h'],
      conceptKey: 'lesson.home_row_extended.concept',
    },
    {
      id: 3,
      name: 'top_row_start',
      newKeys: ['f', 'u'],
      conceptKey: 'lesson.top_row_vowels.concept',
    },
    {
      id: 4,
      name: 'top_row_index',
      newKeys: ['p', 'l'],
      conceptKey: 'lesson.top_row_index.concept',
    },
    {
      id: 5,
      name: 'top_row_ring',
      newKeys: ['w', 'y'],
      conceptKey: 'lesson.top_row_ring.concept',
    },
    {
      id: 6,
      name: 'top_row_pinky',
      newKeys: ['q', ';'],
      conceptKey: 'lesson.top_row_pinky.concept',
    },
    {
      id: 7,
      name: 'top_row_complete',
      newKeys: ['g', 'j'],
      conceptKey: 'lesson.top_row_complete.concept',
    },
    {
      id: 8,
      name: 'bottom_row_start',
      newKeys: ['c', 'm'],
      conceptKey: 'lesson.bottom_row_middle_index.concept',
    },
    {
      id: 9,
      name: 'bottom_row_index',
      newKeys: ['v', 'k'],
      conceptKey: 'lesson.bottom_row_index.concept',
    },
    {
      id: 10,
      name: 'bottom_row_ring',
      newKeys: ['x', ','],
      conceptKey: 'lesson.bottom_row_ring.concept',
    },
    {
      id: 11,
      name: 'bottom_row_pinky',
      newKeys: ['z', '.'],
      conceptKey: 'lesson.bottom_row_pinky.concept',
    },
    {
      id: 12,
      name: 'complete_keyboard',
      newKeys: ['b', ' '],
      conceptKey: 'lesson.complete_keyboard.concept',
    },
    {
      id: 13,
      name: 'full_practice',
      newKeys: [],
      conceptKey: 'lesson.full_practice.concept',
    },
    {
      id: 14,
      name: 'speed_building',
      newKeys: [],
      conceptKey: 'lesson.speed_building.concept',
    },
    {
      id: 15,
      name: 'mastery',
      newKeys: [],
      conceptKey: 'lesson.mastery.concept',
    },
  ]),
};

// =============================================================================
// PROGRESSION REGISTRY
// =============================================================================
export const PROGRESSIONS: Record<LayoutFamily, KeyProgression> = {
  qwerty: QWERTY_PROGRESSION,
  qwertz: QWERTZ_PROGRESSION,
  azerty: AZERTY_PROGRESSION,
  dvorak: DVORAK_PROGRESSION,
  colemak: COLEMAK_PROGRESSION,
};

// Get progression for a layout family
export function getProgression(family: LayoutFamily): KeyProgression {
  return PROGRESSIONS[family];
}

// Get stage by ID for a layout family
export function getStage(family: LayoutFamily, stageId: number): KeyStage | undefined {
  return PROGRESSIONS[family].stages.find(s => s.id === stageId);
}

// Get available keys at a specific stage
export function getAvailableKeys(family: LayoutFamily, stageId: number): Set<string> {
  const stage = getStage(family, stageId);
  return new Set(stage?.cumulativeKeys || []);
}

// Get total number of stages
export function getTotalStages(family: LayoutFamily): number {
  return PROGRESSIONS[family].stages.length;
}
