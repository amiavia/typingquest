/**
 * PRP-027: 30 Levels Data
 *
 * Organized into 6 tiers:
 * - Tier 1: Home Row (Levels 1-5) - Foundation
 * - Tier 2: Top Row (Levels 6-10) - Expansion
 * - Tier 3: Bottom Row (Levels 11-15) - Completion
 * - Tier 4: Numbers & Symbols (Levels 16-20) - Specialization
 * - Tier 5: Advanced (Levels 21-25) - Mastery
 * - Tier 6: Expert (Levels 26-30) - Excellence
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
      "the quick typist wrote stories",
      "our world requires dedication",
      "practice quietly for perfekt results",
      "writers pursue their purpose",
      "quality software requires effort",
      "together we will thrive",
    ],
    quizWords: ["together", "quality", "software", "purpose", "required", "practice", "quietly", "stories"],
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
      "come came came came",
      "cream scream stream",
      "magic music cosmic",
      "commit comment chrome",
      "commercial commitment",
    ],
    quizWords: ["come", "music", "magic", "cream", "cosmic", "chrome", "commit", "compact"],
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
      "even never seven vine",
      "invest invent prevent",
      "convenient invention",
      "environment convince",
      "adventure government",
    ],
    quizWords: ["even", "vine", "never", "seven", "event", "invent", "prevent", "convince"],
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
      "box fox mix fix six",
      "by buy but best be",
      "yes, no, maybe, sure,",
      "about above between",
      "excellent, fantastic,",
    ],
    quizWords: ["box", "mix", "best", "about", "above", "between", "exactly", "excellent"],
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
      "zone zero zoo zip.",
      "fizz buzz jazz fuzz.",
      "The quick fox. Lazy dog.",
      "Amazing prize. Frozen.",
      "zigzag. organize. realize.",
    ],
    quizWords: ["zone", "zero", "lazy", "fizz", "buzz", "prize", "freeze", "organize"],
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
      "Pack my box with five dozen liquor jugs.",
      "How vexingly quick daft zebras jump.",
      "Sphinx of black quartz, judge my vow.",
      "Two driven jocks help fax my big quiz.",
      "The five boxing wizards jump quickly.",
    ],
    quizWords: ["quick", "brown", "jumps", "sphinx", "quartz", "boxing", "wizard", "vexing"],
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
      "11 22 33 44 55",
      "12 23 34 45 51 12 23",
      "I have 5 apples and 3 oranges.",
      "The year is 2025.",
      "Call me at 555 1234.",
    ],
    quizWords: ["1", "2", "3", "4", "5", "12", "23", "45"],
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
      "66 77 88 99 00",
      "67 78 89 90 06 67 78",
      "1234567890 0987654321",
      "The code is 8675309.",
      "Room 101, Floor 7.",
    ],
    quizWords: ["6", "7", "8", "9", "0", "67", "89", "100"],
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
      "Hello! How are you?",
      "Email: test@example.com",
      "Use #hashtag for topics.",
      "Price: $99.99",
      "Sale! 50% off!",
    ],
    quizWords: ["!", "@", "#", "$", "%", "100%", "$50", "test@example.com"],
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
      "function() { return true; }",
      "array[0] list[1] map[key]",
      "if (x > 0) { print(x); }",
      "user_name first-name",
      "<html><body></body></html>",
    ],
    quizWords: ["()", "[]", "{}", "<>", "function()", "array[0]", "<html>", "if(){}"],
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
      "Order #12345 is ready!",
      "Email me at john@test.com today.",
      "The price is $29.99 (50% off)!",
      "Call 555-1234 for support.",
      "Version 2.0.1 is now available!",
      "Score: 100% - Perfect!",
    ],
    quizWords: ["#12345", "$29.99", "50%", "555-1234", "2.0.1", "john@test.com", "100%", "Order#1"],
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
      "Aa Bb Cc Dd Ee Ff Gg",
      "John Smith Mary Jones",
      "New York Los Angeles",
      "Monday Tuesday Wednesday",
      "January February March",
      "Apple Google Microsoft",
    ],
    quizWords: ["John", "Mary", "Monday", "January", "Apple", "Google", "New York", "London"],
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
      "iPhone iPad MacBook Pro",
      "JavaScript TypeScript Python",
      "GitHub GitLab BitBucket",
      "McDonald's Starbucks Nike",
      "NASA FBI CIA UNESCO",
      "firstName lastName userId",
    ],
    quizWords: ["iPhone", "JavaScript", "GitHub", "NASA", "firstName", "lastName", "MacBook", "TypeScript"],
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
      "Hello, how are you today?",
      "I am learning to type faster.",
      "The weather is nice outside.",
      "Would you like some coffee?",
      "Thank you for your help!",
      "Practice makes perfect.",
    ],
    quizWords: ["Hello", "today", "learning", "weather", "coffee", "Thank", "Practice", "perfect"],
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
      "Touch typing is a valuable skill. It allows you to type without looking at the keyboard. With practice, you can reach high speeds.",
      "The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet. It is often used for typing practice.",
      "Learning to type takes time and patience. Start slow and focus on accuracy. Speed will come naturally with practice.",
    ],
    quizWords: ["valuable", "keyboard", "practice", "sentence", "alphabet", "patience", "accuracy", "naturally"],
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
      "Dear Mr. Johnson, Thank you for your email. I will respond by Friday.",
      "The meeting is scheduled for 3:00 PM on Tuesday, March 15th.",
      "Please review the attached document and provide your feedback.",
      "Best regards, Sarah Williams, Senior Developer at TechCorp Inc.",
      "Remember to save your work frequently. You never know when the power might go out!",
      "The project deadline is approaching. Let's make sure we deliver on time.",
    ],
    quizWords: ["Johnson", "scheduled", "Tuesday", "attached", "feedback", "regards", "Developer", "deadline"],
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
      "function const let var return",
      "if else for while switch case",
      "class interface import export",
      "true false null undefined void",
      "async await promise resolve reject",
      "console.log debugger breakpoint",
    ],
    quizWords: ["function", "return", "const", "interface", "import", "export", "async", "await"],
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
      "algorithm database framework",
      "authentication authorization",
      "configuration implementation",
      "optimization performance",
      "infrastructure deployment",
      "documentation specification",
    ],
    quizWords: ["algorithm", "database", "framework", "authentication", "configuration", "optimization", "infrastructure", "documentation"],
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
      "The API returned a 404 error at 14:32:05.",
      "Users.find({ age: { $gte: 18 } })",
      "git commit -m 'Fixed bug #1234'",
      "npm install --save-dev typescript@4.9.5",
      "SELECT * FROM users WHERE id = 42;",
      "curl -X POST https://api.example.com/v1/data",
    ],
    quizWords: ["API", "404", "git", "npm", "SELECT", "curl", "POST", "https"],
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
      "Learning to type efficiently is one of the best investments you can make in yourself. Every day, we communicate more through text than ever before.",
      "The world of technology moves fast. Those who can type quickly and accurately have a significant advantage in today's digital workplace.",
      "Touch typing frees your mind to focus on what you're writing rather than how you're writing it. Your fingers know the way; trust them.",
      "Practice daily, even if just for fifteen minutes. Consistency beats intensity when building any skill. You've got this!",
    ],
    quizWords: ["efficiently", "investments", "communicate", "technology", "significant", "advantage", "workplace", "consistency"],
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
      "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.",
      "Congratulations! You have mastered touch typing. Your fingers dance across the keyboard with precision and grace.",
      "function calculateTotal(items) { return items.reduce((sum, item) => sum + item.price, 0); }",
      "Dear Team, Please review PR #2048 by EOD Friday. Let me know if you have any questions. Thanks!",
      "SELECT u.name, COUNT(o.id) as orders FROM users u JOIN orders o ON u.id = o.user_id GROUP BY u.id;",
      "You are now a certified TypeBit8 Master! Share your achievement and keep practicing every day!",
    ],
    quizWords: ["Congratulations", "mastered", "precision", "calculate", "function", "certified", "achievement", "TypeBit8"],
    minWPM: 40,
    minAccuracy: 95,
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
