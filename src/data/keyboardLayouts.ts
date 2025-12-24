export type KeyboardLayoutType =
  | 'qwerty-us'
  | 'qwerty-uk'
  | 'qwertz-de'
  | 'qwertz-ch'
  | 'azerty-fr'
  | 'azerty-be'
  | 'qwerty-br'      // Brazil ABNT2
  | 'qwerty-es'      // Spanish
  | 'qwerty-latam'   // Latin America Spanish
  | 'qwerty-pt'      // Portuguese
  | 'qwerty-it'      // Italian
  | 'qwerty-nl'      // Dutch
  | 'qwerty-nordic'  // Swedish/Finnish/Norwegian/Danish
  | 'qwerty-pl'      // Polish
  | 'qwerty-tr'      // Turkish Q
  | 'qwerty-in'      // India (English)
  | 'qwerty-ca'      // Canadian Multilingual
  | 'dvorak'
  | 'colemak';

export interface KeyboardLayoutConfig {
  id: KeyboardLayoutType;
  name: string;
  description: string;
  region: string;  // For grouping in UI
  rows: string[][];
  homeRowSignature: string;
  family?: string;
}

export const KEYBOARD_LAYOUTS: Record<KeyboardLayoutType, KeyboardLayoutConfig> = {
  // === QWERTY Family ===
  'qwerty-us': {
    id: 'qwerty-us',
    name: 'QWERTY US',
    description: 'United States layout',
    region: 'Americas',
    rows: [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
      [' '],
    ],
    homeRowSignature: 'asdfghjkl;',
    family: 'qwerty',
  },
  'qwerty-uk': {
    id: 'qwerty-uk',
    name: 'QWERTY UK',
    description: 'United Kingdom layout',
    region: 'Europe',
    rows: [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
      [' '],
    ],
    homeRowSignature: 'asdfghjkl;',
    family: 'qwerty',
  },
  'qwerty-in': {
    id: 'qwerty-in',
    name: 'QWERTY India',
    description: 'Indian English layout',
    region: 'Asia',
    rows: [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
      [' '],
    ],
    homeRowSignature: 'asdfghjkl;',
    family: 'qwerty',
  },

  // === Brazil ===
  'qwerty-br': {
    id: 'qwerty-br',
    name: 'ABNT2 Brazil',
    description: 'Brazilian Portuguese layout',
    region: 'Americas',
    rows: [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ç'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', ';'],
      [' '],
    ],
    homeRowSignature: 'asdfghjklç',
    family: 'qwerty-br',
  },

  // === Spanish ===
  'qwerty-es': {
    id: 'qwerty-es',
    name: 'QWERTY Spain',
    description: 'Spanish layout',
    region: 'Europe',
    rows: [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ñ'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '-'],
      [' '],
    ],
    homeRowSignature: 'asdfghjklñ',
    family: 'qwerty-es',
  },
  'qwerty-latam': {
    id: 'qwerty-latam',
    name: 'QWERTY LatAm',
    description: 'Latin America Spanish',
    region: 'Americas',
    rows: [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ñ'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '-'],
      [' '],
    ],
    homeRowSignature: 'asdfghjklñ',
    family: 'qwerty-es',
  },

  // === Portuguese ===
  'qwerty-pt': {
    id: 'qwerty-pt',
    name: 'QWERTY Portugal',
    description: 'Portuguese layout',
    region: 'Europe',
    rows: [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ç'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '-'],
      [' '],
    ],
    homeRowSignature: 'asdfghjklç',
    family: 'qwerty-pt',
  },

  // === Italian ===
  'qwerty-it': {
    id: 'qwerty-it',
    name: 'QWERTY Italy',
    description: 'Italian layout',
    region: 'Europe',
    rows: [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ò'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '-'],
      [' '],
    ],
    homeRowSignature: 'asdfghjklò',
    family: 'qwerty-it',
  },

  // === Dutch ===
  'qwerty-nl': {
    id: 'qwerty-nl',
    name: 'QWERTY Dutch',
    description: 'Netherlands/Belgium',
    region: 'Europe',
    rows: [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', '+'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '-'],
      [' '],
    ],
    homeRowSignature: 'asdfghjkl+',
    family: 'qwerty-nl',
  },

  // === Nordic ===
  'qwerty-nordic': {
    id: 'qwerty-nordic',
    name: 'QWERTY Nordic',
    description: 'Swedish/Finnish/Norwegian',
    region: 'Europe',
    rows: [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ö'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '-'],
      [' '],
    ],
    homeRowSignature: 'asdfghjklö',
    family: 'qwerty-nordic',
  },

  // === Polish ===
  'qwerty-pl': {
    id: 'qwerty-pl',
    name: 'QWERTY Polish',
    description: 'Polish Programmers',
    region: 'Europe',
    rows: [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
      [' '],
    ],
    homeRowSignature: 'asdfghjkl;',
    family: 'qwerty',
  },

  // === Turkish ===
  'qwerty-tr': {
    id: 'qwerty-tr',
    name: 'Turkish Q',
    description: 'Turkish Q layout',
    region: 'Asia',
    rows: [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'ı', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ş'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm', 'ö', 'ç', '.'],
      [' '],
    ],
    homeRowSignature: 'asdfghjklş',
    family: 'qwerty-tr',
  },

  // === Canadian ===
  'qwerty-ca': {
    id: 'qwerty-ca',
    name: 'Canadian Multi',
    description: 'Canadian Multilingual',
    region: 'Americas',
    rows: [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', 'é'],
      [' '],
    ],
    homeRowSignature: 'asdfghjkl;',
    family: 'qwerty',
  },

  // === QWERTZ Family ===
  'qwertz-de': {
    id: 'qwertz-de',
    name: 'QWERTZ Germany',
    description: 'German layout',
    region: 'Europe',
    rows: [
      ['q', 'w', 'e', 'r', 't', 'z', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ö'],
      ['y', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '-'],
      [' '],
    ],
    homeRowSignature: 'asdfghjklö',
    family: 'qwertz',
  },
  'qwertz-ch': {
    id: 'qwertz-ch',
    name: 'QWERTZ Swiss',
    description: 'Swiss layout (DE/FR)',
    region: 'Europe',
    rows: [
      ['q', 'w', 'e', 'r', 't', 'z', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ö'],
      ['y', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '-'],
      [' '],
    ],
    homeRowSignature: 'asdfghjklö',
    family: 'qwertz',
  },

  // === AZERTY Family ===
  'azerty-fr': {
    id: 'azerty-fr',
    name: 'AZERTY France',
    description: 'French layout',
    region: 'Europe',
    rows: [
      ['a', 'z', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['q', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm'],
      ['w', 'x', 'c', 'v', 'b', 'n', ',', ';', ':', '!'],
      [' '],
    ],
    homeRowSignature: 'qsdfghjklm',
    family: 'azerty',
  },
  'azerty-be': {
    id: 'azerty-be',
    name: 'AZERTY Belgium',
    description: 'Belgian French layout',
    region: 'Europe',
    rows: [
      ['a', 'z', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['q', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm'],
      ['w', 'x', 'c', 'v', 'b', 'n', ',', ';', ':', '='],
      [' '],
    ],
    homeRowSignature: 'qsdfghjklm',
    family: 'azerty',
  },

  // === Alternative Layouts ===
  dvorak: {
    id: 'dvorak',
    name: 'DVORAK',
    description: 'Optimized for efficiency',
    region: 'Alternative',
    rows: [
      ["'", ',', '.', 'p', 'y', 'f', 'g', 'c', 'r', 'l'],
      ['a', 'o', 'e', 'u', 'i', 'd', 'h', 't', 'n', 's'],
      [';', 'q', 'j', 'k', 'x', 'b', 'm', 'w', 'v', 'z'],
      [' '],
    ],
    homeRowSignature: 'aoeuidhtns',
    family: 'dvorak',
  },
  colemak: {
    id: 'colemak',
    name: 'COLEMAK',
    description: 'Modern ergonomic',
    region: 'Alternative',
    rows: [
      ['q', 'w', 'f', 'p', 'g', 'j', 'l', 'u', 'y', ';'],
      ['a', 'r', 's', 't', 'd', 'h', 'n', 'e', 'i', 'o'],
      ['z', 'x', 'c', 'v', 'b', 'k', 'm', ',', '.', '/'],
      [' '],
    ],
    homeRowSignature: 'arstdhneio',
    family: 'colemak',
  },
};

// Get unique regions for grouping
export const getLayoutRegions = (): string[] => {
  const regions = new Set(Object.values(KEYBOARD_LAYOUTS).map(l => l.region));
  return Array.from(regions).sort();
};

// Get layouts by region
export const getLayoutsByRegion = (region: string): KeyboardLayoutConfig[] => {
  return Object.values(KEYBOARD_LAYOUTS).filter(l => l.region === region);
};

// Finger mapping stays consistent regardless of layout
export const FINGER_BY_POSITION: Record<number, Record<number, string>> = {
  0: {
    0: 'left-pinky', 1: 'left-ring', 2: 'left-middle', 3: 'left-index', 4: 'left-index',
    5: 'right-index', 6: 'right-index', 7: 'right-middle', 8: 'right-ring', 9: 'right-pinky',
  },
  1: {
    0: 'left-pinky', 1: 'left-ring', 2: 'left-middle', 3: 'left-index', 4: 'left-index',
    5: 'right-index', 6: 'right-index', 7: 'right-middle', 8: 'right-ring', 9: 'right-pinky',
  },
  2: {
    0: 'left-pinky', 1: 'left-ring', 2: 'left-middle', 3: 'left-index', 4: 'left-index',
    5: 'right-index', 6: 'right-index', 7: 'right-middle', 8: 'right-ring', 9: 'right-pinky',
  },
  3: {
    0: 'thumb',
  },
};

export const getHomeRowKeys = (layout: KeyboardLayoutType): string[] => {
  return KEYBOARD_LAYOUTS[layout].rows[1];
};

export const getFingerForPosition = (row: number, col: number): string => {
  return FINGER_BY_POSITION[row]?.[col] || 'thumb';
};

// Detection result type
export interface DetectionResult {
  layout: KeyboardLayoutType | null;
  needsDisambiguation: boolean;
  possibleLayouts: KeyboardLayoutType[];
  family?: string;
}

// Detect keyboard layout from typed home row keys
export function detectLayoutFromInput(input: string): DetectionResult {
  const normalizedInput = input.toLowerCase().trim();

  // Find all layouts whose signature matches the input
  const exactMatches = Object.values(KEYBOARD_LAYOUTS).filter(
    layout => normalizedInput === layout.homeRowSignature
  );

  // If exactly one exact match, we're done
  if (exactMatches.length === 1) {
    return {
      layout: exactMatches[0].id,
      needsDisambiguation: false,
      possibleLayouts: [exactMatches[0].id],
    };
  }

  // If multiple exact matches (same signature, different layouts)
  if (exactMatches.length > 1) {
    // Check if they're in the same family
    const families = new Set(exactMatches.map(l => l.family).filter(Boolean));
    return {
      layout: null,
      needsDisambiguation: true,
      possibleLayouts: exactMatches.map(l => l.id),
      family: families.size === 1 ? exactMatches[0].family : undefined,
    };
  }

  // No exact matches - find partial matches
  const partialMatches = Object.values(KEYBOARD_LAYOUTS).filter(layout =>
    layout.homeRowSignature.startsWith(normalizedInput) ||
    normalizedInput.startsWith(layout.homeRowSignature)
  );

  // If one partial match and input is long enough
  if (partialMatches.length === 1 && normalizedInput.length >= 8) {
    return {
      layout: partialMatches[0].id,
      needsDisambiguation: false,
      possibleLayouts: [partialMatches[0].id],
    };
  }

  // Multiple partial matches - find best scoring one
  if (normalizedInput.length >= 10) {
    let bestMatch: KeyboardLayoutConfig | null = null;
    let bestScore = 0;

    for (const layout of Object.values(KEYBOARD_LAYOUTS)) {
      let score = 0;
      for (let i = 0; i < Math.min(normalizedInput.length, layout.homeRowSignature.length); i++) {
        if (normalizedInput[i] === layout.homeRowSignature[i]) {
          score++;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestMatch = layout;
      }
    }

    if (bestMatch && bestScore >= 8) {
      // Check if there are other layouts with same score
      const sameScoreLayouts = Object.values(KEYBOARD_LAYOUTS).filter(layout => {
        let score = 0;
        for (let i = 0; i < Math.min(normalizedInput.length, layout.homeRowSignature.length); i++) {
          if (normalizedInput[i] === layout.homeRowSignature[i]) score++;
        }
        return score === bestScore;
      });

      if (sameScoreLayouts.length > 1) {
        return {
          layout: null,
          needsDisambiguation: true,
          possibleLayouts: sameScoreLayouts.map(l => l.id),
          family: bestMatch.family,
        };
      }

      return {
        layout: bestMatch.id,
        needsDisambiguation: false,
        possibleLayouts: [bestMatch.id],
      };
    }
  }

  return {
    layout: null,
    needsDisambiguation: partialMatches.length > 0,
    possibleLayouts: partialMatches.map(l => l.id),
  };
}

// Get possible layouts that match partial input
export function getPossibleLayouts(input: string): KeyboardLayoutType[] {
  const normalizedInput = input.toLowerCase();
  const matches: KeyboardLayoutType[] = [];

  for (const layout of Object.values(KEYBOARD_LAYOUTS)) {
    if (layout.homeRowSignature.startsWith(normalizedInput)) {
      matches.push(layout.id);
    }
  }

  return matches;
}

// Get layouts that need disambiguation (same family or same signature)
export function getLayoutsNeedingDisambiguation(family: string): KeyboardLayoutConfig[] {
  return Object.values(KEYBOARD_LAYOUTS).filter(l => l.family === family);
}

// Reference layout for lesson content (lessons are written for QWERTY-US)
const REFERENCE_LAYOUT: KeyboardLayoutType = 'qwerty-us';

// Create a character mapping from QWERTY-US to target layout
export function createLayoutMapping(targetLayout: KeyboardLayoutType): Map<string, string> {
  const mapping = new Map<string, string>();
  const refRows = KEYBOARD_LAYOUTS[REFERENCE_LAYOUT].rows;
  const targetRows = KEYBOARD_LAYOUTS[targetLayout].rows;

  // Map each position from reference to target
  for (let row = 0; row < Math.min(refRows.length, targetRows.length); row++) {
    for (let col = 0; col < Math.min(refRows[row].length, targetRows[row].length); col++) {
      const refChar = refRows[row][col].toLowerCase();
      const targetChar = targetRows[row][col].toLowerCase();
      if (refChar !== targetChar) {
        // Map lowercase version
        mapping.set(refChar, targetChar);
        // Only map uppercase if it's actually different from lowercase
        // (e.g., 'a' → 'A' is different, but ';' → ';' is not)
        const refUpper = refChar.toUpperCase();
        const targetUpper = targetChar.toUpperCase();
        if (refUpper !== refChar) {
          mapping.set(refUpper, targetUpper);
        }
      }
    }
  }

  return mapping;
}

// Transform text from QWERTY-US to target layout
export function transformTextForLayout(text: string, layout: KeyboardLayoutType): string {
  if (layout === REFERENCE_LAYOUT) return text;

  const mapping = createLayoutMapping(layout);
  let result = '';

  for (const char of text) {
    result += mapping.get(char) ?? char;
  }

  return result;
}

// Transform an array of keys from QWERTY-US to target layout
export function transformKeysForLayout(keys: string[], layout: KeyboardLayoutType): string[] {
  if (layout === REFERENCE_LAYOUT) return keys;

  const mapping = createLayoutMapping(layout);
  return keys.map(key => mapping.get(key.toLowerCase()) ?? key);
}

// Get layout-specific lesson keys (transform from QWERTY-US reference)
export function getLessonKeysForLayout(qwertyKeys: string[], layout: KeyboardLayoutType): string[] {
  return transformKeysForLayout(qwertyKeys, layout);
}

// Get layout-specific exercise text
export function getExerciseForLayout(qwertyExercise: string, layout: KeyboardLayoutType): string {
  return transformTextForLayout(qwertyExercise, layout);
}

// Get all exercises transformed for a layout
export function getExercisesForLayout(qwertyExercises: string[], layout: KeyboardLayoutType): string[] {
  return qwertyExercises.map(ex => transformTextForLayout(ex, layout));
}

// Get quiz words transformed for a layout
export function getQuizWordsForLayout(qwertyWords: string[], layout: KeyboardLayoutType): string[] {
  return qwertyWords.map(word => transformTextForLayout(word, layout));
}

// Layout family type (matching settings.ts)
export type LayoutFamily = 'qwerty' | 'qwertz' | 'azerty' | 'dvorak' | 'colemak';

// Mapping from keyboard layout type to layout family
const LAYOUT_FAMILY_MAP: Record<KeyboardLayoutType, LayoutFamily> = {
  'qwerty-us': 'qwerty',
  'qwerty-uk': 'qwerty',
  'qwerty-in': 'qwerty',
  'qwerty-br': 'qwerty',
  'qwerty-es': 'qwerty',
  'qwerty-latam': 'qwerty',
  'qwerty-pt': 'qwerty',
  'qwerty-it': 'qwerty',
  'qwerty-nl': 'qwerty',
  'qwerty-nordic': 'qwerty',
  'qwerty-pl': 'qwerty',
  'qwerty-tr': 'qwerty',
  'qwerty-ca': 'qwerty',
  'qwertz-de': 'qwertz',
  'qwertz-ch': 'qwertz',
  'azerty-fr': 'azerty',
  'azerty-be': 'azerty',
  'dvorak': 'dvorak',
  'colemak': 'colemak',
};

// Get the layout family for a keyboard layout
export function getLayoutFamily(layout: KeyboardLayoutType): LayoutFamily {
  return LAYOUT_FAMILY_MAP[layout];
}
