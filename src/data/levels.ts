/**
 * PRP-027: 30 Levels Data + PRP-041: Themed Levels
 *
 * Organized into 10 tiers:
 * - Tier 1: Home Row (Levels 1-5) - Foundation
 * - Tier 2: Top Row (Levels 6-10) - Expansion
 * - Tier 3: Bottom Row (Levels 11-15) - Completion
 * - Tier 4: Numbers & Symbols (Levels 16-20) - Specialization
 * - Tier 5: Advanced (Levels 21-25) - Mastery
 * - Tier 6: Expert (Levels 26-30) - Excellence
 * - Tier 7: AI Prompts Theme (Levels 31-35) - Speed of Thought
 * - Tier 8: Developer Theme (Levels 36-40) - Code Fluency
 * - Tier 9: Business Theme (Levels 41-45) - Professional Communication
 * - Tier 10: Mixed Expert (Levels 46-50) - Ultimate Mastery
 */

import type { Lesson, FingerType } from "../types";

export type LevelTier = {
  id: number;
  name: string;
  description: string;
  levels: number[];
  color: string;
  unlockRequirement: { level: number; quizPassed: boolean } | null;
};

export const LEVEL_TIERS: LevelTier[] = [
  {
    id: 1,
    name: "HOME ROW",
    description: "Master the foundation of touch typing",
    levels: [1, 2, 3, 4, 5],
    color: "#22c55e", // green
    unlockRequirement: null,
  },
  {
    id: 2,
    name: "TOP ROW",
    description: "Reach up to conquer QWERTY",
    levels: [6, 7, 8, 9, 10],
    color: "#3b82f6", // blue
    unlockRequirement: { level: 5, quizPassed: true },
  },
  {
    id: 3,
    name: "BOTTOM ROW",
    description: "Complete the alphabet",
    levels: [11, 12, 13, 14, 15],
    color: "#8b5cf6", // purple
    unlockRequirement: { level: 10, quizPassed: true },
  },
  {
    id: 4,
    name: "NUMBERS & SYMBOLS",
    description: "Master the number row",
    levels: [16, 17, 18, 19, 20],
    color: "#f97316", // orange
    unlockRequirement: { level: 15, quizPassed: true },
  },
  {
    id: 5,
    name: "ADVANCED",
    description: "Capitalization and sentences",
    levels: [21, 22, 23, 24, 25],
    color: "#ec4899", // pink
    unlockRequirement: { level: 20, quizPassed: true },
  },
  {
    id: 6,
    name: "EXPERT",
    description: "The ultimate challenge",
    levels: [26, 27, 28, 29, 30],
    color: "#ffd93d", // gold
    unlockRequirement: { level: 25, quizPassed: true },
  },
  {
    id: 7,
    name: "AI PROMPTS",
    description: "Master prompting at the speed of thought",
    levels: [31, 32, 33, 34, 35],
    color: "#06b6d4", // cyan
    unlockRequirement: { level: 30, quizPassed: true },
  },
  {
    id: 8,
    name: "DEVELOPER",
    description: "Code patterns and terminal fluency",
    levels: [36, 37, 38, 39, 40],
    color: "#10b981", // emerald
    unlockRequirement: { level: 35, quizPassed: true },
  },
  {
    id: 9,
    name: "BUSINESS",
    description: "Professional communication mastery",
    levels: [41, 42, 43, 44, 45],
    color: "#6366f1", // indigo
    unlockRequirement: { level: 40, quizPassed: true },
  },
  {
    id: 10,
    name: "EXPERT/MIXED",
    description: "Ultimate mastery combining all themes",
    levels: [46, 47, 48, 49, 50],
    color: "#dc2626", // red
    unlockRequirement: { level: 45, quizPassed: true },
  },
];

// Get tier for a level
export function getTierForLevel(levelId: number): LevelTier | undefined {
  return LEVEL_TIERS.find((tier) => tier.levels.includes(levelId));
}

// Check if a level is unlocked
export function isLevelUnlocked(
  levelId: number,
  completedLevels: Set<number>,
  passedQuizzes: Set<number>
): boolean {
  // Level 1 is always unlocked
  if (levelId === 1) return true;

  // Find the tier
  const tier = getTierForLevel(levelId);
  if (!tier) return false;

  // Check tier unlock requirement
  if (tier.unlockRequirement) {
    const { level, quizPassed } = tier.unlockRequirement;
    if (quizPassed && !passedQuizzes.has(level)) return false;
    if (!completedLevels.has(level)) return false;
  }

  // Within a tier, previous level must be completed
  const levelIndex = tier.levels.indexOf(levelId);
  if (levelIndex > 0) {
    const prevLevel = tier.levels[levelIndex - 1];
    if (!completedLevels.has(prevLevel)) return false;
  }

  return true;
}

// All fingers used in lessons
const ALL_FINGERS: FingerType[] = [
  "left-pinky",
  "left-ring",
  "left-middle",
  "left-index",
  "right-index",
  "right-middle",
  "right-ring",
  "right-pinky",
  "thumb",
];

// Full keyboard keys
const FULL_KEYBOARD = [
  "q", "w", "e", "r", "t", "y", "u", "i", "o", "p",
  "a", "s", "d", "f", "g", "h", "j", "k", "l", ";",
  "z", "x", "c", "v", "b", "n", "m", ",", ".", " ",
];

/**
 * 30 Levels - Expanding from original 15 lessons
 */
export const levels: Lesson[] = [
  // ═══════════════════════════════════════════════════════════════════
  // TIER 1: HOME ROW (Levels 1-5)
  // ═══════════════════════════════════════════════════════════════════

  {
    id: 1,
    title: "Home Row Left",
    description: "Start with your left hand on A, S, D, F",
    concept: `Welcome to touch typing! Place your left hand on the home row:

    Pinky on A, Ring on S, Middle on D, Index on F

    The F key has a small bump - feel it with your index finger.
    This is your anchor point. Keep your fingers curved and relaxed.`,
    keys: ["a", "s", "d", "f"],
    fingers: ["left-pinky", "left-ring", "left-middle", "left-index"],
    exercises: [
      "asdf asdf asdf asdf",
      "fdsa fdsa fdsa fdsa",
      "aaa sss ddd fff",
      "asa asa dfd dfd",
      "sad sad dad dad",
      "adds fads dads sass",
    ],
    quizWords: ["sad", "dad", "add", "fad", "sass", "dads", "adds", "fads"],
    minWPM: 8,
    minAccuracy: 80,
  },
  {
    id: 2,
    title: "Home Row Right",
    description: "Now add your right hand on J, K, L, ;",
    concept: `Now place your right hand on the home row:

    Index on J, Middle on K, Ring on L, Pinky on ;

    The J key also has a bump - your index fingers should always find F and J.
    Together, both hands rest on the home row: ASDF JKL;`,
    keys: ["a", "s", "d", "f", "j", "k", "l", ";"],
    fingers: ["left-pinky", "left-ring", "left-middle", "left-index", "right-index", "right-middle", "right-ring", "right-pinky"],
    exercises: [
      "jkl; jkl; jkl; jkl;",
      ";lkj ;lkj ;lkj ;lkj",
      "asdf jkl; asdf jkl;",
      "fjfj dkdk slsl a;a;",
      "all lads fall flask",
      "saladallas flask asks",
    ],
    quizWords: ["all", "lad", "fall", "ask", "flask", "salad", "allas", "shall"],
    minWPM: 10,
    minAccuracy: 82,
  },
  {
    id: 3,
    title: "Index Fingers Extended",
    description: "Reach sideways to G and H",
    concept: `Your index fingers are the most versatile - they reach sideways too!

    Left index: F (home) and G (reach right)
    Right index: J (home) and H (reach left)

    Practice the sideways reach while keeping other fingers anchored.`,
    keys: ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"],
    fingers: ["left-pinky", "left-ring", "left-middle", "left-index", "right-index", "right-middle", "right-ring", "right-pinky"],
    exercises: [
      "fgfg jhjh fgfg jhjh",
      "ghgh hghg ghgh hghg",
      "gash dash hash lash",
      "half hall hall gall",
      "shall glass flash gash",
      "gladly flashy shaggy",
    ],
    quizWords: ["gash", "dash", "half", "hall", "glad", "flag", "glass", "flash"],
    minWPM: 12,
    minAccuracy: 84,
  },
  {
    id: 4,
    title: "Home Row Words",
    description: "Type real words using only home row",
    concept: `Now let's combine everything into real words!

    You can type many words with just the home row keys.
    Focus on smooth, flowing movements between keys.
    Don't rush - accuracy builds speed.`,
    keys: ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"],
    fingers: ["left-pinky", "left-ring", "left-middle", "left-index", "right-index", "right-middle", "right-ring", "right-pinky"],
    exercises: [
      "dad had lad add sad",
      "ash dash gash flash",
      "as has lass glass slag",
      "a gal shall ask dad",
      "lash hash dash flash",
      "salads galoshes flashdash",
    ],
    quizWords: ["glad", "shall", "flash", "glass", "salad", "galosh", "alfalfa", "flashlag"],
    minWPM: 14,
    minAccuracy: 85,
  },
  {
    id: 5,
    title: "Home Row Challenge",
    description: "Speed test on home row keys",
    concept: `Time to prove your home row mastery!

    This challenge tests your speed and accuracy with all home row keys.
    Remember: Stay relaxed, maintain good posture, and keep a steady rhythm.

    Pass this to unlock the Top Row tier!`,
    keys: ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"],
    fingers: ["left-pinky", "left-ring", "left-middle", "left-index", "right-index", "right-middle", "right-ring", "right-pinky"],
    exercises: [
      "a glad lass had salads",
      "dads shall flash flags",
      "glass slag gash lash",
      "add all ask dad has",
      "half flash shall glass",
      "flashy gladly halfdash",
    ],
    quizWords: ["flash", "glass", "shall", "salad", "alaska", "gladly", "flashlag", "alfalfa"],
    minWPM: 16,
    minAccuracy: 88,
  },

  // ═══════════════════════════════════════════════════════════════════
  // TIER 2: TOP ROW (Levels 6-10)
  // ═══════════════════════════════════════════════════════════════════

  {
    id: 6,
    title: "Top Row - E and I",
    description: "Middle fingers reach up to E and I",
    concept: `The most common vowels! Your middle fingers reach up:

    Left middle: D (home) → E (up)
    Right middle: K (home) → I (up)

    E and I are in almost every word. Master these reaches!`,
    keys: ["a", "s", "d", "e", "f", "g", "h", "i", "j", "k", "l", ";"],
    fingers: ["left-pinky", "left-ring", "left-middle", "left-index", "right-index", "right-middle", "right-ring", "right-pinky"],
    exercises: [
      "dede kiki dede kiki",
      "like hide side file",
      "field shield sailed",
      "idea ideal aisle isle",
      "feel heel died lied",
      "sideliked hideseek",
    ],
    quizWords: ["like", "file", "side", "hide", "feel", "field", "shield", "ideal"],
    minWPM: 15,
    minAccuracy: 85,
  },
  {
    id: 7,
    title: "Top Row - R and U",
    description: "Index fingers reach up to R and U",
    concept: `Your index fingers now reach up too:

    Left index: F → R (up)
    Right index: J → U (up)

    These are very common letters, especially in words like "true", "sure", "fire".`,
    keys: ["a", "s", "d", "e", "r", "f", "g", "h", "u", "i", "j", "k", "l", ";"],
    fingers: ["left-pinky", "left-ring", "left-middle", "left-index", "right-index", "right-middle", "right-ring", "right-pinky"],
    exercises: [
      "frfr juju frfr juju",
      "true rule sure fire",
      "figure failure feature",
      "require desire admire",
      "leisure measure sure",
      "futureguide trueblue",
    ],
    quizWords: ["true", "rule", "sure", "fire", "figure", "require", "desire", "feature"],
    minWPM: 16,
    minAccuracy: 85,
  },
  {
    id: 8,
    title: "Top Row - W and O",
    description: "Ring fingers reach up to W and O",
    concept: `Ring fingers join the top row party:

    Left ring: S (home) → W (up)
    Right ring: L (home) → O (up)

    O is a very common vowel. W starts many question words.`,
    keys: ["a", "s", "w", "d", "e", "r", "f", "g", "h", "u", "i", "o", "j", "k", "l", ";"],
    fingers: ["left-pinky", "left-ring", "left-middle", "left-index", "right-index", "right-middle", "right-ring", "right-pinky"],
    exercises: [
      "swsw lolo swsw lolo",
      "word work slow flow",
      "would could should",
      "follow hollow sorrow",
      "world worded workflow",
      "showoff workflows",
    ],
    quizWords: ["word", "work", "slow", "flow", "world", "would", "follow", "workflow"],
    minWPM: 17,
    minAccuracy: 85,
  },
  {
    id: 9,
    title: "Top Row - Q, T, Y, P",
    description: "Complete the top row with remaining keys",
    concept: `The last top row keys! Pinky and index fingers:

    Left pinky: A → Q (up)    |  Left index: F → T (up-side)
    Right index: J → Y (up)   |  Right pinky: ; → P (up)

    T is one of the most common letters. Q almost always pairs with U.`,
    keys: ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";"],
    fingers: ["left-pinky", "left-ring", "left-middle", "left-index", "right-index", "right-middle", "right-ring", "right-pinky"],
    exercises: [
      "ftft jyjy qaqa p;p;",
      "the that they type",
      "quip equip quote quite",
      "pretty thirty property",
      "people purple popular",
      "typewriter prototype",
    ],
    quizWords: ["type", "they", "quote", "equip", "pretty", "purple", "people", "property"],
    minWPM: 18,
    minAccuracy: 85,
  },
  {
    id: 10,
    title: "Top Row Challenge",
    description: "Speed test with top row mastery",
    concept: `You now know the entire top row! This challenge combines:

    - All home row keys (ASDFGHJKL;)
    - All top row keys (QWERTYUIOP)

    Master this to unlock the Bottom Row tier!`,
    keys: ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";"],
    fingers: ["left-pinky", "left-ring", "left-middle", "left-index", "right-index", "right-middle", "right-ring", "right-pinky"],
    exercises: [
      "the quiet writer seeks the truth",
      "jupiter rises high for twilight",
      "your future requires real effort",
      "swift thought is powerful still",
      "repeat this drill to forge skill",
      "the explorer stood higher yet",
    ],
    quizWords: ["jupiter", "twilight", "thought", "powerful", "explorer", "future", "higher", "swift"],
    minWPM: 20,
    minAccuracy: 88,
  },

  // ═══════════════════════════════════════════════════════════════════
  // TIER 3: BOTTOM ROW (Levels 11-15)
  // ═══════════════════════════════════════════════════════════════════

  {
    id: 11,
    title: "Bottom Row - C and M",
    description: "Reach down to C and M",
    concept: `Now we go below home row! Start with two common letters:

    Left middle: D (home) → C (down)
    Right index: J (home) → M (down)

    Keep your wrists steady as you reach down.`,
    keys: ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "c", "m"],
    fingers: ["left-pinky", "left-ring", "left-middle", "left-index", "right-index", "right-middle", "right-ring", "right-pinky"],
    exercises: [
      "dcdc jmjm dcdc jmjm",
      "climb the cosmic staircase home",
      "cream cheese with my warm toast",
      "music from the old record machine",
      "sometimes magic comes from courage",
      "the camera captured their smiles",
    ],
    quizWords: ["climb", "cosmic", "cheese", "machine", "courage", "camera", "captured", "sometimes"],
    minWPM: 19,
    minAccuracy: 85,
  },
  {
    id: 12,
    title: "Bottom Row - V and N",
    description: "Index fingers reach down to V and N",
    concept: `More index finger work reaching down:

    Left index: F → V (down)
    Right index: J → N (down)

    N is very common. V appears in words like "never", "very", "have".`,
    keys: ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "c", "v", "n", "m"],
    fingers: ["left-pinky", "left-ring", "left-middle", "left-index", "right-index", "right-middle", "right-ring", "right-pinky"],
    exercises: [
      "fvfv jnjn fvfv jnjn",
      "never give in to the mountain wind",
      "seven ravens nested on the ancient vine",
      "driven to invent new and clever things",
      "every adventure means constant motion",
      "the given environment shapes everyone",
    ],
    quizWords: ["driven", "ravens", "motion", "shapes", "clever", "ancient", "everyone", "mountain"],
    minWPM: 20,
    minAccuracy: 85,
  },
  {
    id: 13,
    title: "Bottom Row - X, B, Comma",
    description: "Add X, B and the comma key",
    concept: `Three more bottom row keys:

    Left ring: S → X (down)
    Left index: F → B (down, side)
    Right middle: K → , (comma, down)

    X is rare but important. B completes the alphabet!`,
    keys: ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "z", "x", "c", "v", "b", "n", "m", ","],
    fingers: ["left-pinky", "left-ring", "left-middle", "left-index", "right-index", "right-middle", "right-ring", "right-pinky"],
    exercises: [
      "sxsx fbfb k,k, k,k,",
      "the box held exactly six foxes",
      "be bold, be brave, be brilliant",
      "next, mix the herbs and bake them",
      "above the cabin, birds were singing",
      "explore, experiment, excel beyond limits",
    ],
    quizWords: ["bold", "brave", "cabin", "birds", "herbs", "explore", "experiment", "brilliant"],
    minWPM: 21,
    minAccuracy: 85,
  },
  {
    id: 14,
    title: "Bottom Row - Z and Period",
    description: "Complete with Z and period",
    concept: `The final bottom row keys!

    Left pinky: A → Z (down)
    Right ring: L → . (period, down)

    Z is the least common letter, but periods end every sentence!`,
    keys: ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "z", "x", "c", "v", "b", "n", "m", ",", "."],
    fingers: ["left-pinky", "left-ring", "left-middle", "left-index", "right-index", "right-middle", "right-ring", "right-pinky"],
    exercises: [
      "zaza l.l. zaza l.l.",
      "the wizard gazed at the frozen horizon.",
      "jazz music filled the plaza at dusk.",
      "realize your dreams. organize your goals.",
      "the breeze carried a faint buzzing sound.",
      "amazed by the size of the bronze statue.",
    ],
    quizWords: ["wizard", "frozen", "horizon", "plaza", "breeze", "buzzing", "bronze", "amazed"],
    minWPM: 22,
    minAccuracy: 85,
  },
  {
    id: 15,
    title: "Full Alphabet Challenge",
    description: "Master all 26 letters",
    concept: `Congratulations! You now know all 26 letters!

    This challenge tests your complete alphabet mastery.
    Pass this to unlock the Numbers & Symbols tier!`,
    keys: FULL_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "The quick brown fox jumps over the lazy dog.",
      "Grumpy wizards make toxic brew for evil queen.",
      "Pack my box with five dozen quality jugs.",
      "Jackdaws love my big sphinx of quartz.",
      "How vexingly quick daft zebras jump.",
      "The five boxing wizards jump very quickly.",
    ],
    quizWords: ["grumpy", "wizards", "toxic", "sphinx", "jackdaws", "vexingly", "boxing", "quickly"],
    minWPM: 25,
    minAccuracy: 90,
  },

  // ═══════════════════════════════════════════════════════════════════
  // TIER 4: NUMBERS & SYMBOLS (Levels 16-20)
  // ═══════════════════════════════════════════════════════════════════

  {
    id: 16,
    title: "Numbers 1-5",
    description: "Learn the left side of the number row",
    concept: `Time for numbers! The left hand handles 1-5:

    Pinky: 1  |  Ring: 2  |  Middle: 3  |  Index: 4, 5

    Reach up from the top row while keeping home position.`,
    keys: [...FULL_KEYBOARD, "1", "2", "3", "4", "5"],
    fingers: ALL_FINGERS,
    exercises: [
      "1 2 3 4 5 1 2 3 4 5",
      "The store opens at 5 and closes at 11.",
      "Flight 243 departs from gate 15 today.",
      "Chapter 3 covers pages 42 through 51.",
      "Mix 2 cups flour with 3 eggs and 1 butter.",
      "She scored 45 points in just 23 minutes.",
    ],
    quizWords: ["243", "gate", "chapter", "pages", "scored", "points", "minutes", "butter"],
    minWPM: 18,
    minAccuracy: 85,
  },
  {
    id: 17,
    title: "Numbers 6-0",
    description: "Complete the number row with 6-0",
    concept: `The right hand handles 6-0:

    Index: 6, 7  |  Middle: 8  |  Ring: 9  |  Pinky: 0

    Now you can type any number!`,
    keys: [...FULL_KEYBOARD, "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    fingers: ALL_FINGERS,
    exercises: [
      "6 7 8 9 0 6 7 8 9 0",
      "The package weighs 78 kilograms exactly.",
      "Meeting room 906 is on floor 18.",
      "Her birthday is June 27, born in 1990.",
      "The marathon distance is 42.195 kilometers.",
      "Temperature dropped to 0 degrees at 6 am.",
    ],
    quizWords: ["weighs", "kilograms", "meeting", "birthday", "marathon", "distance", "temperature", "degrees"],
    minWPM: 18,
    minAccuracy: 85,
  },
  {
    id: 18,
    title: "Common Symbols",
    description: "Learn ! @ # $ % basics",
    concept: `Symbols use Shift + Number keys:

    Shift + 1 = !  |  Shift + 2 = @  |  Shift + 3 = #
    Shift + 4 = $  |  Shift + 5 = %

    Hold Shift with the opposite pinky while pressing the number.`,
    keys: [...FULL_KEYBOARD, "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "!", "@", "#", "$", "%"],
    fingers: ALL_FINGERS,
    exercises: [
      "! @ # $ % ! @ # $ %",
      "Amazing! The sale offers 50% off today!",
      "Contact us at support@company.com now.",
      "Trending: #coding #developer #tech",
      "Total: $149.99 plus $12.50 shipping.",
      "Breaking news! 85% of users approved!",
    ],
    quizWords: ["amazing", "trending", "contact", "shipping", "breaking", "approved", "developer", "support"],
    minWPM: 16,
    minAccuracy: 82,
  },
  {
    id: 19,
    title: "Programming Symbols",
    description: "Learn brackets and special characters",
    concept: `Essential for coding! Learn these pairs:

    [ ] (brackets)  |  { } (braces)  |  ( ) (parentheses)
    < > (angle brackets)  |  - _ (dash, underscore)

    These are critical for programming and math.`,
    keys: [...FULL_KEYBOARD, "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "[", "]", "{", "}", "(", ")", "<", ">", "-", "_"],
    fingers: ALL_FINGERS,
    exercises: [
      "() [] {} <> () [] {}",
      "const data = { name: 'Alex', age: 25 };",
      "items.filter((x) => x > 10).map((x) => x * 2)",
      "config[settings] = { enabled: true };",
      "if (count >= 0) { run_task(count); }",
      "<div class='container'><p>Hello</p></div>",
    ],
    quizWords: ["const", "filter", "config", "enabled", "container", "settings", "count", "class"],
    minWPM: 15,
    minAccuracy: 80,
  },
  {
    id: 20,
    title: "Numbers Challenge",
    description: "Master numbers and basic symbols",
    concept: `Time to prove your number skills!

    This challenge combines letters, numbers, and basic symbols.
    Pass this to unlock the Advanced tier!`,
    keys: [...FULL_KEYBOARD, "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "!", "@", "#", "$", "%", "(", ")", "-", "_"],
    fingers: ALL_FINGERS,
    exercises: [
      "Invoice #78542 totals $1,299.00 today!",
      "Contact sarah@startup.io for 25% discount.",
      "Build v3.2.1 passed 100% of all tests!",
      "Support hotline: 1-800-555-0199 (24/7).",
      "Flash sale! Items from $9.99 to $49.99!",
      "User @techguru scored 98% accuracy!",
    ],
    quizWords: ["invoice", "totals", "startup", "discount", "hotline", "accuracy", "passed", "flash"],
    minWPM: 20,
    minAccuracy: 85,
  },

  // ═══════════════════════════════════════════════════════════════════
  // TIER 5: ADVANCED (Levels 21-25)
  // ═══════════════════════════════════════════════════════════════════

  {
    id: 21,
    title: "Capital Letters",
    description: "Master the Shift key for capitals",
    concept: `Capital letters require the Shift key:

    - Use opposite hand Shift (right Shift for left-hand letters)
    - Keep Shift held while pressing the letter
    - Release Shift immediately after

    Proper capitalization is essential for professional writing.`,
    keys: FULL_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "Alice Baker Charlie David Emma Frank",
      "Paris London Tokyo Sydney Berlin Rome",
      "Sunday Monday Tuesday Wednesday Thursday",
      "September October November December",
      "Amazon Netflix Spotify Tesla SpaceX",
      "Harvard Stanford Oxford Cambridge Yale",
    ],
    quizWords: ["Alice", "Paris", "Sunday", "September", "Amazon", "Netflix", "Harvard", "Stanford"],
    minWPM: 22,
    minAccuracy: 88,
  },
  {
    id: 22,
    title: "Mixed Case Words",
    description: "Combine upper and lower case fluidly",
    concept: `Real writing mixes cases constantly:

    - Sentences start with capitals
    - Proper nouns are capitalized
    - Acronyms are all caps
    - CamelCase for programming

    Practice smooth Shift transitions.`,
    keys: FULL_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "LinkedIn YouTube TikTok WhatsApp Instagram",
      "ChatGPT OpenAI DeepMind Anthropic Claude",
      "PostgreSQL MongoDB Redis GraphQL Docker",
      "DevOps DevSecOps SaaS PaaS IaaS",
      "getUserById setUserName isValidEmail",
      "McDonalds JPMorgan eBay PayPal LinkedIn",
    ],
    quizWords: ["LinkedIn", "ChatGPT", "PostgreSQL", "DevOps", "MongoDB", "getUserById", "Anthropic", "GraphQL"],
    minWPM: 23,
    minAccuracy: 88,
  },
  {
    id: 23,
    title: "Sentences",
    description: "Type complete sentences with proper grammar",
    concept: `Sentences require:

    - Capital at start
    - Period, question mark, or exclamation at end
    - Proper spacing after punctuation
    - Commas where needed

    Focus on flow and rhythm.`,
    keys: FULL_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "Can you believe how quickly time flies?",
      "The sunset painted the sky in brilliant colors.",
      "Music has a way of touching our deepest emotions.",
      "Every journey begins with a single step forward.",
      "Knowledge is power, but wisdom is freedom.",
      "Dreams become reality through dedication and effort.",
    ],
    quizWords: ["believe", "sunset", "brilliant", "emotions", "journey", "knowledge", "wisdom", "dedication"],
    minWPM: 25,
    minAccuracy: 90,
  },
  {
    id: 24,
    title: "Paragraphs",
    description: "Type multi-sentence paragraphs",
    concept: `Paragraphs are the building blocks of documents:

    - Multiple sentences on related topics
    - Consistent rhythm across longer text
    - Maintain accuracy even when tired
    - Build endurance for real-world typing`,
    keys: FULL_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "The art of communication lies in clarity and purpose. Choose your words carefully, for they shape how others understand you.",
      "Technology evolves rapidly, transforming how we work and live. Those who adapt quickly will thrive in this changing landscape.",
      "Success is not a destination but a continuous journey. Embrace challenges as opportunities to grow and improve yourself.",
      "Creativity flows from curiosity and experimentation. Never be afraid to try new approaches and learn from your mistakes.",
    ],
    quizWords: ["communication", "clarity", "technology", "transforming", "destination", "continuous", "creativity", "experimentation"],
    minWPM: 28,
    minAccuracy: 90,
  },
  {
    id: 25,
    title: "Advanced Challenge",
    description: "Prove your advanced typing skills",
    concept: `The ultimate typing test!

    This challenge tests everything:
    - Speed and accuracy
    - Mixed case and punctuation
    - Real-world text patterns

    Pass this to unlock the Expert tier!`,
    keys: FULL_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "Dear Dr. Martinez, I hope this message finds you well. I wanted to follow up on our discussion from last week.",
      "The quarterly report shows a 23% increase in revenue compared to the same period last year.",
      "Please confirm your attendance at the Annual Tech Summit in San Francisco on November 8th.",
      "After careful consideration, the committee has decided to approve your proposal for Phase Two.",
      "Attached you will find the revised contract with the updated terms and conditions we discussed.",
      "Looking forward to our collaboration. Please do not hesitate to reach out if you have any questions.",
    ],
    quizWords: ["quarterly", "revenue", "attendance", "committee", "proposal", "collaboration", "hesitate", "consideration"],
    minWPM: 32,
    minAccuracy: 92,
  },

  // ═══════════════════════════════════════════════════════════════════
  // TIER 6: EXPERT (Levels 26-30)
  // ═══════════════════════════════════════════════════════════════════

  {
    id: 26,
    title: "Programming Keywords",
    description: "Master common programming terms",
    concept: `As a developer, you'll type these constantly:

    - function, return, const, let, var
    - if, else, for, while, switch
    - class, interface, import, export
    - true, false, null, undefined

    Build muscle memory for code!`,
    keys: FULL_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "const handleClick = async () => { await fetchData(); };",
      "export interface UserProfile { id: number; name: string; }",
      "if (isValid && !isLoading) { return processData(items); }",
      "try { await saveToDatabase(); } catch (error) { logError(error); }",
      "const result = items.filter(x => x.active).map(x => x.value);",
      "import { useState, useEffect, useCallback } from 'react';",
    ],
    quizWords: ["handleClick", "interface", "isValid", "isLoading", "processData", "useState", "useEffect", "useCallback"],
    minWPM: 30,
    minAccuracy: 90,
  },
  {
    id: 27,
    title: "Technical Terms",
    description: "Type technical vocabulary fluently",
    concept: `Professional typing includes technical terms:

    - Algorithm, database, framework
    - Authentication, authorization
    - Configuration, implementation
    - Optimization, performance

    These words appear in every tech job.`,
    keys: FULL_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "The microservices architecture enables horizontal scalability.",
      "Implement caching to reduce database query latency significantly.",
      "Configure the load balancer for optimal traffic distribution.",
      "Containerization with Docker simplifies deployment workflows.",
      "The authentication middleware validates JWT tokens securely.",
      "Continuous integration ensures automated testing on every commit.",
    ],
    quizWords: ["microservices", "scalability", "caching", "latency", "containerization", "middleware", "validates", "integration"],
    minWPM: 30,
    minAccuracy: 90,
  },
  {
    id: 28,
    title: "Mixed Content",
    description: "Handle diverse content types",
    concept: `Real documents mix everything:

    - Technical code snippets
    - Natural language prose
    - Numbers and dates
    - Special formatting

    Stay consistent across all types.`,
    keys: FULL_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "Error 503: Service temporarily unavailable. Retry in 30 seconds.",
      "git rebase -i HEAD~5 && git push origin feature/auth --force-with-lease",
      "docker run -d -p 8080:80 --name webapp nginx:alpine",
      "kubectl apply -f deployment.yaml --namespace=production",
      "INSERT INTO orders (user_id, total, status) VALUES (42, 299.99, 'pending');",
      "ssh -i ~/.ssh/id_rsa admin@192.168.1.100 -p 2222",
    ],
    quizWords: ["rebase", "docker", "kubectl", "deployment", "namespace", "INSERT", "VALUES", "pending"],
    minWPM: 28,
    minAccuracy: 88,
  },
  {
    id: 29,
    title: "Endurance Challenge",
    description: "Maintain speed over extended typing",
    concept: `Build typing stamina!

    This level tests your ability to maintain:
    - Consistent speed over time
    - High accuracy without fatigue
    - Focus during longer sessions

    Take a deep breath and begin.`,
    keys: FULL_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "In the realm of software development, architecture decisions made early often determine the scalability and maintainability of the entire system.",
      "Effective documentation serves as a bridge between developers, enabling knowledge transfer and reducing onboarding time for new team members.",
      "The best engineers understand that writing clean, readable code is more valuable than clever solutions that only they can understand.",
      "When debugging complex systems, methodical elimination of possibilities will always outperform random guessing, no matter how intuitive.",
      "Performance optimization should be guided by profiling data, not assumptions. Measure first, then improve the bottlenecks that matter.",
    ],
    quizWords: ["architecture", "scalability", "maintainability", "documentation", "onboarding", "debugging", "methodical", "optimization"],
    minWPM: 35,
    minAccuracy: 92,
  },
  {
    id: 30,
    title: "FINAL BOSS",
    description: "The ultimate typing challenge",
    concept: `You've made it to the final level!

    This is the ultimate test of everything you've learned:
    - Maximum speed
    - Perfect accuracy
    - All character types
    - Extended duration

    Prove you are a TYPING MASTER!`,
    keys: FULL_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "The quick brown fox jumps over the lazy dog while sphinx of black quartz judges every vow. Amazing!",
      "export async function fetchUserData(userId: string): Promise<UserProfile | null> { return await api.get(`/users/${userId}`); }",
      "SELECT p.name, SUM(oi.quantity * oi.price) AS total FROM products p JOIN order_items oi ON p.id = oi.product_id GROUP BY p.id;",
      "@keyframes fadeIn { 0% { opacity: 0; transform: translateY(-20px); } 100% { opacity: 1; transform: translateY(0); } }",
      "The TypeBit8 Master certification requires 40+ WPM with 95% accuracy. You have proven your exceptional skills!",
      "Congratulations! You have conquered all 30 levels. Your dedication and persistence have made you a typing champion!",
    ],
    quizWords: ["fetchUserData", "Promise", "keyframes", "translateY", "certification", "exceptional", "conquered", "persistence"],
    minWPM: 40,
    minAccuracy: 95,
  },

  // ═══════════════════════════════════════════════════════════════════
  // TIER 7: AI PROMPTS THEME (Levels 31-35)
  // Type at the Speed of Thought - Learn prompting while building speed
  // ═══════════════════════════════════════════════════════════════════

  {
    id: 31,
    title: "Basic Prompts",
    description: "Learn foundational AI prompt patterns",
    concept: `Welcome to the AI Prompts theme!

    Master the prompts you'll use every day with ChatGPT, Claude, and other AI tools.
    Type these prompts until they become second nature.

    Start with simple, effective prompt starters.`,
    keys: FULL_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "Explain this concept in simple terms",
      "Write a summary of the following text",
      "Create a list of 5 ideas for this topic",
      "Help me brainstorm solutions for this problem",
      "What are the pros and cons of this approach?",
      "Give me three examples of how to use this",
    ],
    quizWords: ["Explain", "summary", "Create", "brainstorm", "solutions", "approach", "examples", "concept"],
    minWPM: 25,
    minAccuracy: 90,
  },
  {
    id: 32,
    title: "Advanced Prompts",
    description: "Master role-based and context-rich prompts",
    concept: `Level up your prompting with advanced techniques!

    Role-based prompts get better results:
    - "Act as a..." sets the AI's expertise
    - Adding context improves accuracy
    - Specific instructions yield specific results

    These prompts will transform your AI interactions.`,
    keys: FULL_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "Act as a senior software engineer and review this code",
      "Write a professional email declining the meeting politely",
      "Create a marketing plan for a B2B SaaS startup",
      "Analyze this data and identify the key trends",
      "Rewrite this paragraph to be more concise and clear",
      "Suggest improvements for this user interface design",
    ],
    quizWords: ["professional", "engineer", "marketing", "analyze", "concise", "interface", "improvements", "identify"],
    minWPM: 28,
    minAccuracy: 90,
  },
  {
    id: 33,
    title: "System Prompts",
    description: "Write powerful system instructions",
    concept: `System prompts shape AI behavior!

    These set the rules for how the AI responds:
    - Define the assistant's role and expertise
    - Specify output formats (JSON, markdown, etc.)
    - Establish constraints and guidelines

    Master these to build custom AI assistants.`,
    keys: FULL_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "You are a helpful assistant that specializes in coding",
      "Respond in JSON format with the following structure",
      "Think step by step and show your reasoning process",
      "Always include code examples in your explanations",
      "Keep your responses concise and under 200 words",
      "If you are unsure, ask clarifying questions first",
    ],
    quizWords: ["assistant", "specializes", "structure", "reasoning", "explanations", "concise", "clarifying", "process"],
    minWPM: 30,
    minAccuracy: 90,
  },
  {
    id: 34,
    title: "Multi-turn Conversations",
    description: "Master follow-up prompts and context",
    concept: `Real AI conversations are multi-turn!

    Build on previous responses effectively:
    - Reference earlier context
    - Request modifications
    - Drill deeper into topics
    - Course-correct when needed

    These prompts keep conversations productive.`,
    keys: FULL_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "Based on our previous discussion about the project",
      "Can you modify the previous response to include more detail?",
      "Let me provide more context about the requirements",
      "That's helpful, but can you focus more on the technical aspects?",
      "Please expand on the third point you mentioned earlier",
      "How would this change if we had a larger budget?",
    ],
    quizWords: ["previous", "discussion", "modify", "context", "requirements", "technical", "expand", "mentioned"],
    minWPM: 32,
    minAccuracy: 90,
  },
  {
    id: 35,
    title: "Power User Prompts",
    description: "Elite prompting techniques for maximum results",
    concept: `You've reached the power user level!

    These advanced prompts unlock AI's full potential:
    - Comprehensive analysis requests
    - Detailed implementation plans
    - Production-ready outputs
    - Complex multi-step tasks

    Type like a pro, prompt like a pro.`,
    keys: FULL_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "Generate a comprehensive analysis comparing these two approaches",
      "Create a detailed implementation plan with milestones and deadlines",
      "Write production-ready code with error handling and documentation",
      "Develop a complete test strategy covering edge cases and integration",
      "Build a step-by-step tutorial that a beginner could follow",
      "Design a scalable architecture diagram with explanations for each component",
    ],
    quizWords: ["comprehensive", "implementation", "milestones", "production", "documentation", "strategy", "integration", "scalable"],
    minWPM: 35,
    minAccuracy: 92,
  },

  // ═══════════════════════════════════════════════════════════════════
  // TIER 8: DEVELOPER THEME (Levels 36-40)
  // Code Fluency Through Repetition
  // ═══════════════════════════════════════════════════════════════════

  {
    id: 36,
    title: "Variables & Functions",
    description: "Type JavaScript/TypeScript declarations",
    concept: `Code fluency starts with declarations!

    Master the patterns you type every day:
    - const, let, function declarations
    - Arrow functions and async syntax
    - TypeScript type annotations

    Build muscle memory for code!`,
    keys: FULL_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "const handleSubmit = async (event) => {",
      "function calculateTotal(items: Item[]): number",
      "export default function HomePage() {",
      "const [count, setCount] = useState(0)",
      "let result = await fetchData()",
      "type Props = { children: React.ReactNode }",
    ],
    quizWords: ["const", "function", "async", "export", "default", "useState", "await", "type"],
    minWPM: 28,
    minAccuracy: 88,
  },
  {
    id: 37,
    title: "Terminal Commands",
    description: "Master CLI and DevOps commands",
    concept: `The terminal is your power tool!

    These commands save you time every day:
    - Git workflows and commit messages
    - npm/yarn package management
    - Docker and deployment commands

    Type commands without thinking!`,
    keys: FULL_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "git commit -m 'feat: add user authentication'",
      "npm install --save-dev @types/react",
      "docker-compose up -d --build",
      "git checkout -b feature/new-dashboard",
      "npm run build && npm run start",
      "kubectl apply -f deployment.yaml",
    ],
    quizWords: ["commit", "install", "docker", "checkout", "feature", "build", "kubectl", "deploy"],
    minWPM: 30,
    minAccuracy: 88,
  },
  {
    id: 38,
    title: "Common Patterns",
    description: "Type everyday code patterns fluently",
    concept: `These patterns appear in every codebase!

    Master the building blocks of modern code:
    - Error handling patterns
    - React hooks and state management
    - Try/catch and async patterns

    Code faster, think less about syntax!`,
    keys: FULL_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "if (error) { console.error(error); return; }",
      "const [state, setState] = useState<T | null>(null)",
      "try { await fetchData() } catch (e) { handleError(e) }",
      "const { data, isLoading } = useQuery(queryKey)",
      "return items.map((item) => <Item key={item.id} />)",
      "Object.entries(config).forEach(([key, value]) => {",
    ],
    quizWords: ["error", "console", "useState", "catch", "useQuery", "isLoading", "forEach", "entries"],
    minWPM: 32,
    minAccuracy: 88,
  },
  {
    id: 39,
    title: "API & Config",
    description: "Type API calls and configuration",
    concept: `APIs and configs are everywhere!

    Master these essential patterns:
    - HTTP headers and auth tokens
    - Environment variables
    - Configuration objects

    Configure with confidence!`,
    keys: FULL_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      '"Authorization": `Bearer ${token}`',
      "process.env.NEXT_PUBLIC_API_URL",
      'export const config = { runtime: "edge" }',
      'headers: { "Content-Type": "application/json" }',
      "const response = await fetch(url, { method: 'POST' })",
      "DATABASE_URL=postgresql://user:pass@localhost:5432/db",
    ],
    quizWords: ["Authorization", "Bearer", "process", "runtime", "headers", "Content", "response", "DATABASE"],
    minWPM: 35,
    minAccuracy: 88,
  },
  {
    id: 40,
    title: "Code Reviews",
    description: "Type comments, TODOs, and documentation",
    concept: `Great developers document their code!

    Master code review language:
    - TODO and FIXME comments
    - JSDoc annotations
    - Inline explanations

    Communicate clearly in code!`,
    keys: FULL_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "// TODO: Refactor this to use a more efficient algorithm",
      "/* This handles the edge case where user is not authenticated */",
      "/** @param {string} userId - The unique identifier */",
      "// FIXME: This will break if the array is empty",
      "/** Returns the calculated total with tax included */",
      "// NOTE: This is intentionally synchronous for backwards compatibility",
    ],
    quizWords: ["TODO", "Refactor", "efficient", "algorithm", "FIXME", "param", "Returns", "NOTE"],
    minWPM: 38,
    minAccuracy: 88,
  },


  // ═══════════════════════════════════════════════════════════════════
  // TIER 9: BUSINESS THEME (Levels 41-45)
  // Professional Communication Mastery
  // ═══════════════════════════════════════════════════════════════════

  {
    id: 41,
    title: "Email Openers",
    description: "Master professional email greetings and openers",
    concept: `Professional emails start with the right tone!

    Learn the most common email opening phrases used in business:
    - Greetings that set a professional tone
    - Follow-up references
    - Thank you openers

    Type these phrases until they become second nature.`,
    keys: FULL_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "I hope this email finds you well.",
      "Thank you for your prompt response.",
      "Following up on our conversation yesterday,",
      "I wanted to reach out regarding our upcoming meeting.",
      "Thank you for getting back to me so quickly.",
      "I hope you had a great weekend.",
    ],
    quizWords: ["email", "prompt", "response", "conversation", "regarding", "upcoming", "quickly", "weekend"],
    minWPM: 30,
    minAccuracy: 90,
  },
  {
    id: 42,
    title: "Slack & Teams Messages",
    description: "Type fast in real-time team communication",
    concept: `Modern workplaces run on instant messaging!

    Master the quick, informal yet professional style of:
    - Channel announcements
    - Quick updates
    - Acknowledgments and reactions

    Speed matters when your team is waiting for a response.`,
    keys: FULL_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "Hey team, quick update on the project status:",
      "@channel Please review the attached document by EOD",
      "Thanks for flagging this! I'll look into it right away.",
      "Just pushed the latest changes to the staging branch.",
      "Can someone take a look at this PR when you have a moment?",
      "Great catch! I'll fix that in the next commit.",
    ],
    quizWords: ["channel", "attached", "flagging", "staging", "branch", "pushed", "commit", "review"],
    minWPM: 32,
    minAccuracy: 88,
  },
  {
    id: 43,
    title: "Meeting Notes",
    description: "Capture decisions and action items efficiently",
    concept: `Good meeting notes drive results!

    Practice typing common meeting documentation patterns:
    - Action items and owners
    - Decisions made
    - Next steps and deadlines

    Clear notes keep everyone aligned and accountable.`,
    keys: FULL_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "Action items from today's standup:",
      "Decision: We will proceed with Option B",
      "Next steps: John to provide estimates by Friday",
      "Attendees: Sarah, Mike, Lisa, and David",
      "Key takeaway: Launch date moved to Q2",
      "Follow-up required: Budget approval from finance team",
    ],
    quizWords: ["standup", "decision", "proceed", "estimates", "attendees", "takeaway", "approval", "finance"],
    minWPM: 34,
    minAccuracy: 88,
  },
  {
    id: 44,
    title: "Professional Requests",
    description: "Make polite and effective asks",
    concept: `Requests are an art in business communication!

    Learn to type professional requests that get results:
    - Meeting invitations
    - Feedback requests
    - Information asks

    Polite, clear requests build strong working relationships.`,
    keys: FULL_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "Would you be available for a quick sync this week?",
      "I'd appreciate your input on this proposal.",
      "Please let me know if you need any additional information.",
      "Could you share your thoughts on the revised timeline?",
      "I was hoping to get your feedback before the deadline.",
      "Would it be possible to reschedule our call to Thursday?",
    ],
    quizWords: ["available", "appreciate", "proposal", "additional", "revised", "timeline", "feedback", "reschedule"],
    minWPM: 36,
    minAccuracy: 90,
  },
  {
    id: 45,
    title: "Formal Communication",
    description: "Master formal business writing",
    concept: `Some situations require formal language!

    Practice the formal phrases used in:
    - Legal and contractual communications
    - Official announcements
    - Executive correspondence

    Formal writing builds trust and professionalism.`,
    keys: FULL_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "Per our agreement dated January 15th, 2025,",
      "We are pleased to inform you that your application",
      "This serves as official confirmation of your request.",
      "In accordance with the terms outlined in Section 3,",
      "Please find attached the quarterly financial report.",
      "We regret to inform you that the position has been filled.",
    ],
    quizWords: ["agreement", "pleased", "confirmation", "accordance", "outlined", "quarterly", "financial", "position"],
    minWPM: 38,
    minAccuracy: 90,
  },

  // ═══════════════════════════════════════════════════════════════════
  // TIER 10: EXPERT/MIXED (Levels 46-50)
  // Combines AI, Developer, and Business themes for expert-level typing
  // ═══════════════════════════════════════════════════════════════════

  {
    id: 46,
    title: "AI + Developer Fusion",
    description: "Combine AI prompts with code snippets",
    concept: `The ultimate developer-AI collaboration!

    In modern development, you constantly switch between:
    - Writing prompts for AI assistants
    - Typing code that AI generates
    - Explaining code requirements in natural language

    Master the seamless blend of prompts and code.`,
    keys: FULL_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "Write a Python function that takes a list and returns the sum of all even numbers.",
      "Create a TypeScript interface for a User with id, name, email, and createdAt fields.",
      "Explain this regex pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/",
      "Generate a React component that displays a loading spinner while data is fetching.",
      "Refactor this function to use async/await instead of .then() chains.",
      "Debug the following code: const result = items.filter(i => i.active).map(i => i.name);",
    ],
    quizWords: ["TypeScript", "interface", "async", "await", "component", "refactor", "regex", "filter"],
    minWPM: 35,
    minAccuracy: 90,
  },
  {
    id: 47,
    title: "Developer + Business Bridge",
    description: "Technical emails and code review comments",
    concept: `Developers communicate constantly!

    From code reviews to stakeholder updates:
    - PR review comments
    - Technical email updates
    - Sprint planning notes
    - Bug reports and documentation

    Type professional technical communication.`,
    keys: FULL_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "Please review the PR for the authentication feature before we merge to main.",
      "LGTM! Consider adding error handling for the edge case when userId is undefined.",
      "Hi Team, The API endpoint is deployed to staging. Please test and provide feedback by EOD.",
      "Bug Report: Login fails on Safari when cookies are disabled. Steps to reproduce attached.",
      "Sprint Retro: We shipped 12 story points. Blockers: CI pipeline slowness, API documentation.",
      "Can we schedule a quick sync to discuss the database migration strategy for v2.0?",
    ],
    quizWords: ["authentication", "merge", "endpoint", "staging", "cookies", "migration", "pipeline", "documentation"],
    minWPM: 38,
    minAccuracy: 90,
  },
  {
    id: 48,
    title: "Speed Challenge I",
    description: "Fast-paced mixed content from all themes",
    concept: `Speed is the name of the game!

    Short, punchy sentences across all domains:
    - Quick AI commands
    - Rapid code snippets
    - Brief business messages

    Stay sharp and type fast!`,
    keys: FULL_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "Summarize this in 3 bullet points. Fix the null check. Meeting at 2pm.",
      "npm run build && git push origin main. LGTM, ship it! Thanks for the update.",
      "Act as a senior dev. const data = await fetch(url); Sounds good, let's proceed.",
      "Explain like I'm 5. return arr.sort((a, b) => b - a); Will circle back tomorrow.",
      "Generate test cases. if (!user) throw new Error(); Per my last email, we need this ASAP.",
      "Optimize for performance. Object.keys(obj).forEach(k => {}); Let's sync offline.",
    ],
    quizWords: ["summarize", "fetch", "optimize", "forEach", "proceed", "generate", "performance", "offline"],
    minWPM: 40,
    minAccuracy: 88,
  },
  {
    id: 49,
    title: "Speed Challenge II",
    description: "Longer sentences requiring sustained focus",
    concept: `Endurance meets complexity!

    Longer sentences with:
    - Complex punctuation
    - Special characters
    - Mixed case throughout
    - Technical terminology

    Maintain your speed over extended text.`,
    keys: FULL_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "The deployment pipeline (CI/CD) automatically runs tests, builds artifacts, and pushes to production on merge.",
      "Please analyze the user engagement metrics for Q4 2024 and provide actionable insights by January 15th, 2025.",
      "You are an expert software architect; design a microservices system with REST APIs, message queues, and caching layers.",
      "const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); await submitForm(formData); };",
      "Dear Stakeholders, Attached is the technical specification document for Project Phoenix (v2.1.0-beta) - please review.",
      "SELECT u.email, COUNT(o.id) AS total_orders FROM users u LEFT JOIN orders o ON u.id = o.user_id GROUP BY u.id;",
    ],
    quizWords: ["deployment", "microservices", "stakeholders", "specification", "artifacts", "engagement", "handleSubmit", "preventDefault"],
    minWPM: 42,
    minAccuracy: 88,
  },
  {
    id: 50,
    title: "Ultimate Mastery",
    description: "The hardest typing challenges - prove your expertise",
    concept: `You've reached the pinnacle!

    This is the ULTIMATE test:
    - Long technical content
    - Complex special characters
    - API endpoints and URLs
    - Production-ready code patterns
    - Executive communications

    Complete this to become a TypeBit8 Legend!`,
    keys: FULL_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "The API endpoint /api/v2/users/{userId}/settings accepts PATCH requests with JSON body: { \"theme\": \"dark\" }",
      "export const fetchUserData = async (id: string): Promise<User | null> => { try { return await api.get(`/users/${id}`); } catch { return null; } };",
      "Write a comprehensive technical design document outlining the authentication flow, including OAuth2.0, JWT tokens, and refresh mechanisms.",
      "Dear Board of Directors, Q4 revenue exceeded projections by 23%. Key drivers: enterprise contracts ($2.4M) and API usage growth (+156%).",
      "git rebase -i HEAD~5 && git push --force-with-lease origin feature/auth-refactor # Careful: force push to feature branch only!",
      "CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL; -- Partial index for active users, ~40% storage savings",
    ],
    quizWords: ["endpoint", "authentication", "OAuth2", "projections", "enterprise", "rebase", "Promise", "comprehensive"],
    minWPM: 45,
    minAccuracy: 90,
  },
];

// Calculate XP reward for completing a level
export function getLevelXPReward(levelId: number): number {
  const baseXP = 50;
  const tierMultiplier = Math.ceil(levelId / 5);
  return baseXP * tierMultiplier;
}

// Calculate coin reward for completing a level
export function getLevelCoinReward(
  levelId: number,
  isFirstCompletion: boolean,
  accuracy: number,
  wpm: number,
  targetWPM: number
): number {
  let coins = 10; // base

  // First completion bonus
  if (isFirstCompletion) coins += 10;

  // Accuracy bonus
  if (accuracy >= 100) coins += 10;
  else if (accuracy >= 95) coins += 5;

  // Speed bonus
  if (wpm >= targetWPM * 1.5) coins += 10;
  else if (wpm >= targetWPM * 1.2) coins += 5;

  // Tier multiplier
  const tier = Math.ceil(levelId / 5);
  if (tier >= 5) coins = Math.round(coins * 1.5);
  else if (tier >= 3) coins = Math.round(coins * 1.25);

  return coins;
}

// Get level by ID
export function getLevelById(levelId: number): Lesson | undefined {
  return levels.find((level) => level.id === levelId);
}

// Get next level
export function getNextLevel(currentLevelId: number): Lesson | undefined {
  return levels.find((level) => level.id === currentLevelId + 1);
}

// Get total level count
export function getTotalLevels(): number {
  return levels.length;
}

// Calculate star rating based on performance
export function calculateStarRating(
  accuracy: number,
  wpm: number,
  targetWPM: number,
  targetAccuracy: number
): 1 | 2 | 3 {
  const wpmRatio = wpm / targetWPM;
  const accRatio = accuracy / targetAccuracy;

  // 3 stars: Exceed both targets
  if (wpmRatio >= 1.2 && accRatio >= 1.0) return 3;

  // 2 stars: Meet both targets
  if (wpmRatio >= 1.0 && accRatio >= 1.0) return 2;

  // 1 star: Completed (minimum requirements met)
  return 1;
}
