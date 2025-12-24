import type { Lesson, KeyInfo, FingerType } from '../types';

export const KEYBOARD_LAYOUT: KeyInfo[] = [
  // Number row (row 0)
  { key: '`', finger: 'left-pinky', row: 0, position: 0 },
  { key: '1', finger: 'left-pinky', row: 0, position: 1 },
  { key: '2', finger: 'left-ring', row: 0, position: 2 },
  { key: '3', finger: 'left-middle', row: 0, position: 3 },
  { key: '4', finger: 'left-index', row: 0, position: 4 },
  { key: '5', finger: 'left-index', row: 0, position: 5 },
  { key: '6', finger: 'right-index', row: 0, position: 6 },
  { key: '7', finger: 'right-index', row: 0, position: 7 },
  { key: '8', finger: 'right-middle', row: 0, position: 8 },
  { key: '9', finger: 'right-ring', row: 0, position: 9 },
  { key: '0', finger: 'right-pinky', row: 0, position: 10 },
  { key: '-', finger: 'right-pinky', row: 0, position: 11 },
  { key: '=', finger: 'right-pinky', row: 0, position: 12 },

  // Top row (row 1) - QWERTY
  { key: 'q', finger: 'left-pinky', row: 1, position: 0 },
  { key: 'w', finger: 'left-ring', row: 1, position: 1 },
  { key: 'e', finger: 'left-middle', row: 1, position: 2 },
  { key: 'r', finger: 'left-index', row: 1, position: 3 },
  { key: 't', finger: 'left-index', row: 1, position: 4 },
  { key: 'y', finger: 'right-index', row: 1, position: 5 },
  { key: 'u', finger: 'right-index', row: 1, position: 6 },
  { key: 'i', finger: 'right-middle', row: 1, position: 7 },
  { key: 'o', finger: 'right-ring', row: 1, position: 8 },
  { key: 'p', finger: 'right-pinky', row: 1, position: 9 },
  { key: '[', finger: 'right-pinky', row: 1, position: 10 },
  { key: ']', finger: 'right-pinky', row: 1, position: 11 },
  { key: '\\', finger: 'right-pinky', row: 1, position: 12 },

  // Home row (row 2) - ASDF JKL;
  { key: 'a', finger: 'left-pinky', row: 2, position: 0 },
  { key: 's', finger: 'left-ring', row: 2, position: 1 },
  { key: 'd', finger: 'left-middle', row: 2, position: 2 },
  { key: 'f', finger: 'left-index', row: 2, position: 3 },
  { key: 'g', finger: 'left-index', row: 2, position: 4 },
  { key: 'h', finger: 'right-index', row: 2, position: 5 },
  { key: 'j', finger: 'right-index', row: 2, position: 6 },
  { key: 'k', finger: 'right-middle', row: 2, position: 7 },
  { key: 'l', finger: 'right-ring', row: 2, position: 8 },
  { key: ';', finger: 'right-pinky', row: 2, position: 9 },
  { key: "'", finger: 'right-pinky', row: 2, position: 10 },

  // Bottom row (row 3) - ZXCV BNM
  { key: 'z', finger: 'left-pinky', row: 3, position: 0 },
  { key: 'x', finger: 'left-ring', row: 3, position: 1 },
  { key: 'c', finger: 'left-middle', row: 3, position: 2 },
  { key: 'v', finger: 'left-index', row: 3, position: 3 },
  { key: 'b', finger: 'left-index', row: 3, position: 4 },
  { key: 'n', finger: 'right-index', row: 3, position: 5 },
  { key: 'm', finger: 'right-index', row: 3, position: 6 },
  { key: ',', finger: 'right-middle', row: 3, position: 7 },
  { key: '.', finger: 'right-ring', row: 3, position: 8 },
  { key: '/', finger: 'right-pinky', row: 3, position: 9 },

  // Space bar
  { key: ' ', finger: 'thumb', row: 4, position: 0, width: 6 },
];

export const FINGER_COLORS: Record<FingerType, string> = {
  'left-pinky': '#ef4444',    // red
  'left-ring': '#f97316',     // orange
  'left-middle': '#eab308',   // yellow
  'left-index': '#22c55e',    // green
  'right-index': '#06b6d4',   // cyan
  'right-middle': '#3b82f6',  // blue
  'right-ring': '#8b5cf6',    // purple
  'right-pinky': '#ec4899',   // pink
  'thumb': '#6b7280',         // gray
};

export const FINGER_NAMES: Record<FingerType, string> = {
  'left-pinky': 'Left Pinky',
  'left-ring': 'Left Ring',
  'left-middle': 'Left Middle',
  'left-index': 'Left Index',
  'right-index': 'Right Index',
  'right-middle': 'Right Middle',
  'right-ring': 'Right Ring',
  'right-pinky': 'Right Pinky',
  'thumb': 'Thumbs',
};

export const lessons: Lesson[] = [
  {
    id: 1,
    title: 'Home Row Introduction',
    description: 'Learn the foundation of touch typing - the home row position',
    concept: `The home row is where your fingers rest when not typing. Place your fingers on these keys:

    Left hand: A (pinky), S (ring), D (middle), F (index)
    Right hand: J (index), K (middle), L (ring), ; (pinky)

    Notice the small bumps on F and J - these help you find home position without looking!
    Your thumbs rest on the space bar.`,
    keys: ['a', 's', 'd', 'f', 'j', 'k', 'l', ';'],
    fingers: ['left-pinky', 'left-ring', 'left-middle', 'left-index', 'right-index', 'right-middle', 'right-ring', 'right-pinky'],
    exercises: [
      'asdf jkl;',
      'asdf jkl; asdf jkl;',
      'fjfj dkdk slsl a;a;',
      'aaa sss ddd fff jjj kkk lll ;;;',
      'asdf fdsa jkl; ;lkj',
      'fj fj dk dk sl sl a; a;',
      'ff jj dd kk ss ll aa ;;',
      'asdf jkl; fdsa ;lkj',
    ],
    quizWords: ['sad', 'lad', 'dad', 'add', 'all', 'fall', 'salad', 'flask'],
    minWPM: 10,
    minAccuracy: 85,
  },
  {
    id: 2,
    title: 'Home Row Extended - G and H',
    description: 'Extend your reach with index fingers to G and H',
    concept: `Your index fingers do double duty! They handle not just F and J, but also reach sideways:

    Left index finger: F (home) and G (reach right)
    Right index finger: J (home) and H (reach left)

    Practice moving your index finger sideways while keeping other fingers on home row.`,
    keys: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
    fingers: ['left-pinky', 'left-ring', 'left-middle', 'left-index', 'right-index', 'right-middle', 'right-ring', 'right-pinky'],
    exercises: [
      'fgfg jhjh fgfg jhjh',
      'ghgh fghj fghj hgfd',
      'asdfjkl; asdfghjkl;',
      'gag hah gash dash',
      'half hall fall gall',
      'glad flag shag slag',
    ],
    quizWords: ['gash', 'glad', 'half', 'hash', 'dash', 'flag', 'glass', 'shall'],
    minWPM: 12,
    minAccuracy: 85,
  },
  {
    id: 3,
    title: 'Top Row - E and I',
    description: 'Reach up with your middle fingers',
    concept: `Now we'll add the most common vowels! Your middle fingers reach up from the home row:

    Left middle finger: D (home) → E (reach up)
    Right middle finger: K (home) → I (reach up)

    Keep your hands anchored - only the middle finger moves up, then returns to home.`,
    keys: ['a', 's', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', ';'],
    fingers: ['left-pinky', 'left-ring', 'left-middle', 'left-index', 'right-index', 'right-middle', 'right-ring', 'right-pinky'],
    exercises: [
      'dede kiki dede kiki',
      'fed led like hike',
      'side hide file dial',
      'said like feel deal',
      'life aide file shield',
      'field aside liked hiked',
    ],
    quizWords: ['like', 'file', 'side', 'hide', 'seed', 'feel', 'shield', 'failed'],
    minWPM: 14,
    minAccuracy: 85,
  },
  {
    id: 4,
    title: 'Top Row - R and U',
    description: 'Reach up with your index fingers',
    concept: `Your index fingers are the most agile - they handle four keys each! Now reaching up:

    Left index: F (home), G (side), R (up)
    Right index: J (home), H (side), U (up)

    These are very common letters, especially in words like "the", "use", "true".`,
    keys: ['a', 's', 'd', 'e', 'r', 'f', 'g', 'h', 'u', 'i', 'j', 'k', 'l', ';'],
    fingers: ['left-pinky', 'left-ring', 'left-middle', 'left-index', 'right-index', 'right-middle', 'right-ring', 'right-pinky'],
    exercises: [
      'frfr juju frfr juju',
      'true rule sure fire',
      'furs jure rude dure',
      'rules fires hired dried',
      'desire require failure',
      'furniture agriculture',
    ],
    quizWords: ['true', 'rule', 'sure', 'rude', 'fire', 'hire', 'desire', 'figure'],
    minWPM: 15,
    minAccuracy: 85,
  },
  {
    id: 5,
    title: 'Top Row - W and O',
    description: 'Ring fingers reach to W and O',
    concept: `Your ring fingers now join the action, reaching up to the top row:

    Left ring finger: S (home) → W (up)
    Right ring finger: L (home) → O (up)

    These complete many common words - "work", "word", "how", "low", "old".`,
    keys: ['a', 's', 'w', 'd', 'e', 'r', 'f', 'g', 'h', 'u', 'i', 'o', 'j', 'k', 'l', ';'],
    fingers: ['left-pinky', 'left-ring', 'left-middle', 'left-index', 'right-index', 'right-middle', 'right-ring', 'right-pinky'],
    exercises: [
      'swsw lolo swsw lolo',
      'word work slow flow',
      'show how low row so',
      'world would should',
      'follow holloworrow',
      'owledge workflow would',
    ],
    quizWords: ['word', 'work', 'slow', 'flow', 'world', 'would', 'follow', 'hollow'],
    minWPM: 16,
    minAccuracy: 85,
  },
  {
    id: 6,
    title: 'Top Row - Q and P',
    description: 'Pinky fingers reach to Q and P',
    concept: `The pinky fingers complete the top row! These are challenging reaches:

    Left pinky: A (home) → Q (up)
    Right pinky: ; (home) → P (up)

    Q almost always pairs with U. P is common in words like "please", "people".`,
    keys: ['q', 'a', 's', 'w', 'd', 'e', 'r', 'f', 'g', 'h', 'u', 'i', 'o', 'p', 'j', 'k', 'l', ';'],
    fingers: ['left-pinky', 'left-ring', 'left-middle', 'left-index', 'right-index', 'right-middle', 'right-ring', 'right-pinky'],
    exercises: [
      'qaqa p;p; qaqa p;p;',
      'quip equip please help',
      'queenequiproupeople',
      'qaulified pulsequake',
      'popular require quell',
      'please people purpose',
    ],
    quizWords: ['quip', 'quad', 'help', 'pulp', 'equip', 'queen', 'please', 'people'],
    minWPM: 17,
    minAccuracy: 85,
  },
  {
    id: 7,
    title: 'Top Row - T and Y',
    description: 'Complete the top row with T and Y',
    concept: `The last top row keys! Both reached by index fingers:

    Left index: F (home), G (side), R (up), T (up-side)
    Right index: J (home), H (side), U (up), Y (up-side)

    T is one of the most common letters in English. Y often acts as a vowel.`,
    keys: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
    fingers: ['left-pinky', 'left-ring', 'left-middle', 'left-index', 'right-index', 'right-middle', 'right-ring', 'right-pinky'],
    exercises: [
      'ftft jyjy ftft jyjy',
      'the that they type',
      'style try your year',
      'thirty forty pretty',
      'their there other yet',
      'together yesterday typewriter',
    ],
    quizWords: ['type', 'they', 'your', 'year', 'style', 'thirty', 'pretty', 'together'],
    minWPM: 18,
    minAccuracy: 85,
  },
  {
    id: 8,
    title: 'Bottom Row - C and M',
    description: 'Reach down with middle and index fingers',
    concept: `Now we go below the home row! Start with two common letters:

    Left middle finger: D (home) → C (down)
    Right index finger: J (home) → M (down)

    C and M appear in many common words. Keep your wrists steady as you reach down.`,
    keys: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', 'c', 'm'],
    fingers: ['left-pinky', 'left-ring', 'left-middle', 'left-index', 'right-index', 'right-middle', 'right-ring', 'right-pinky'],
    exercises: [
      'dcdc jmjm dcdc jmjm',
      'come came cram scam',
      'cream claim music magic',
      'crime cosmic metric',
      'comment chrome chrome',
      'democracy commitment commercial',
    ],
    quizWords: ['come', 'magic', 'music', 'cream', 'cosmic', 'chrome', 'commit', 'compact'],
    minWPM: 19,
    minAccuracy: 85,
  },
  {
    id: 9,
    title: 'Bottom Row - V and N',
    description: 'Index fingers reach down to V and N',
    concept: `More index finger work - they really are your workhorse fingers!

    Left index: F (home), G, R, T, V (down)
    Right index: J (home), H, U, Y, N (down)

    These letters are essential for words like "never", "even", "seven".`,
    keys: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', 'c', 'v', 'n', 'm'],
    fingers: ['left-pinky', 'left-ring', 'left-middle', 'left-index', 'right-index', 'right-middle', 'right-ring', 'right-pinky'],
    exercises: [
      'fvfv jnjn fvfv jnjn',
      'even never seven vine',
      'invest invent prevent',
      'convenient invention',
      'environment convince',
      'adventure invention government',
    ],
    quizWords: ['even', 'vine', 'never', 'seven', 'event', 'invent', 'prevent', 'convince'],
    minWPM: 20,
    minAccuracy: 85,
  },
  {
    id: 10,
    title: 'Bottom Row - X and Comma',
    description: 'Ring fingers reach down',
    concept: `Your ring fingers now reach down to the bottom row:

    Left ring finger: S (home) → X (down)
    Right ring finger: L (home) → , (comma, down)

    X is rare but important. The comma is crucial for proper punctuation.`,
    keys: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', 'z', 'x', 'c', 'v', 'n', 'm', ','],
    fingers: ['left-pinky', 'left-ring', 'left-middle', 'left-index', 'right-index', 'right-middle', 'right-ring', 'right-pinky'],
    exercises: [
      'sxsx l,l, sxsx l,l,',
      'mix fix six box fox',
      'next text exit extra',
      'yes, no, maybe, sure,',
      'exactly, externally,',
      'execute, examine, explore,',
    ],
    quizWords: ['mix', 'fix', 'next', 'text', 'exact', 'extra', 'example', 'execute'],
    minWPM: 21,
    minAccuracy: 85,
  },
  {
    id: 11,
    title: 'Bottom Row - Z and Period',
    description: 'Pinky fingers complete the bottom row',
    concept: `The final bottom row keys! Your pinkies reach down:

    Left pinky: A (home) → Z (down)
    Right pinky: ; (home) → . (period, down)

    Z is the least common letter, but periods end every sentence!`,
    keys: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.'],
    fingers: ['left-pinky', 'left-ring', 'left-middle', 'left-index', 'right-index', 'right-middle', 'right-ring', 'right-pinky'],
    exercises: [
      'zaza l.l. zaza l.l.',
      'zone zero zoo zip.',
      'fizz buzz jazz fuzz.',
      'The quick fox. Lazy dog.',
      'Amazing prize. Frozen pizza.',
      'zigzag. organize. realize.',
    ],
    quizWords: ['zone', 'zero', 'lazy', 'fizz', 'buzz', 'prize', 'freeze', 'organize'],
    minWPM: 22,
    minAccuracy: 85,
  },
  {
    id: 12,
    title: 'Complete Keyboard - B',
    description: 'The last letter - B with left index',
    concept: `Congratulations! Just one more letter to complete the alphabet:

    Left index finger: F (home), G, R, T, V, B (down-side)

    B is another index finger key, reached by moving down and slightly right.`,
    keys: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', ' '],
    fingers: ['left-pinky', 'left-ring', 'left-middle', 'left-index', 'right-index', 'right-middle', 'right-ring', 'right-pinky', 'thumb'],
    exercises: [
      'fbfb fbfb fbfb fbfb',
      'be by but buy best',
      'about above below between',
      'trouble double bubble',
      'maybe probably possibly',
      'The brown fox jumped over the lazy dog.',
    ],
    quizWords: ['be', 'but', 'best', 'about', 'above', 'below', 'bubble', 'trouble'],
    minWPM: 23,
    minAccuracy: 85,
  },
  {
    id: 13,
    title: 'Full Keyboard Practice',
    description: 'Master all keys with real words and sentences',
    concept: `You now know all letter positions! This lesson focuses on building speed and accuracy with:

    - Common words
    - Full sentences
    - Proper punctuation

    Remember: Accuracy first, then speed. Slow down if you make mistakes.`,
    keys: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', ' '],
    fingers: ['left-pinky', 'left-ring', 'left-middle', 'left-index', 'right-index', 'right-middle', 'right-ring', 'right-pinky', 'thumb'],
    exercises: [
      'The quick brown fox jumps over the lazy dog.',
      'Pack my box with five dozen liquor jugs.',
      'How vexingly quick daft zebras jump.',
      'Sphinx of black quartz, judge my vow.',
      'Two driven jocks help fax my big quiz.',
      'The five boxing wizards jump quickly.',
    ],
    quizWords: ['quick', 'brown', 'jumps', 'sphinx', 'quartz', 'boxing', 'wizard', 'vexing'],
    minWPM: 25,
    minAccuracy: 90,
  },
  {
    id: 14,
    title: 'Speed Building',
    description: 'Push your typing speed with common word patterns',
    concept: `Time to build real speed! Focus on:

    - Common word patterns (the, and, that, with)
    - Bigrams (frequently paired letters)
    - Keeping a steady rhythm

    Think of typing like playing music - smooth and rhythmic, not jerky and rushed.`,
    keys: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', ' '],
    fingers: ['left-pinky', 'left-ring', 'left-middle', 'left-index', 'right-index', 'right-middle', 'right-ring', 'right-pinky', 'thumb'],
    exercises: [
      'the that this then they there their them',
      'and and and the the the with with with',
      'have has had having has have had having',
      'from form from farm from firm from form',
      'would could should would could should',
      'there their they are there their they are',
    ],
    quizWords: ['the', 'that', 'they', 'their', 'there', 'would', 'could', 'should'],
    minWPM: 30,
    minAccuracy: 92,
  },
  {
    id: 15,
    title: 'Typing Mastery',
    description: 'The final challenge - typing real paragraphs',
    concept: `This is the ultimate test! You will type real paragraphs and sentences.

    Key tips for mastery:
    - Look at the screen, not your hands
    - Maintain proper posture
    - Take breaks if your hands feel tired
    - Practice daily for best results

    You are now a touch typist!`,
    keys: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', ' '],
    fingers: ['left-pinky', 'left-ring', 'left-middle', 'left-index', 'right-index', 'right-middle', 'right-ring', 'right-pinky', 'thumb'],
    exercises: [
      'Learning to type without looking at the keyboard is a valuable skill.',
      'Practice makes perfect. The more you type, the faster you become.',
      'Touch typing allows you to focus on your thoughts, not your fingers.',
      'Keep your fingers on the home row and let them dance across the keys.',
      'You have completed all the lessons. Keep practicing every day.',
      'Congratulations on becoming a touch typist. Your journey begins here.',
    ],
    quizWords: ['learning', 'keyboard', 'practice', 'perfect', 'valuable', 'thoughts', 'fingers', 'journey'],
    minWPM: 35,
    minAccuracy: 95,
  },
];

export const getKeyInfo = (key: string): KeyInfo | undefined => {
  return KEYBOARD_LAYOUT.find(k => k.key.toLowerCase() === key.toLowerCase());
};
