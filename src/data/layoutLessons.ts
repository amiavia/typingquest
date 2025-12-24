import type { Lesson, FingerType } from '../types';
import type { LayoutFamily, LanguageCode } from '../types/settings';
import { getProgression, getAvailableKeys } from './keyProgressions';
import { getWordDatabase } from './wordDatabases';
import { getWordsForNewKeys } from '../utils/wordFilter';

// Get fingers for a set of keys (simplified - all home row for now)
function getFingersForKeys(keys: string[]): FingerType[] {
  const fingers: Set<FingerType> = new Set();
  // For simplicity, include all finger types used
  fingers.add('left-pinky');
  fingers.add('left-ring');
  fingers.add('left-middle');
  fingers.add('left-index');
  fingers.add('right-index');
  fingers.add('right-middle');
  fingers.add('right-ring');
  fingers.add('right-pinky');
  if (keys.includes(' ')) {
    fingers.add('thumb');
  }
  return Array.from(fingers);
}

// Generate key drill exercises (e.g., "asdf jklö")
function generateKeyDrills(keys: string[]): string[] {
  const drills: string[] = [];

  // Split into left and right hand keys (roughly)
  const leftKeys = keys.slice(0, Math.ceil(keys.length / 2));
  const rightKeys = keys.slice(Math.ceil(keys.length / 2));

  // Basic drill: left then right
  if (leftKeys.length > 0 && rightKeys.length > 0) {
    drills.push(`${leftKeys.join('')} ${rightKeys.join('')}`);
    drills.push(`${leftKeys.join('')} ${rightKeys.join('')} ${leftKeys.join('')} ${rightKeys.join('')}`);
  }

  // Alternating pattern
  const alternating: string[] = [];
  for (let i = 0; i < Math.max(leftKeys.length, rightKeys.length); i++) {
    if (leftKeys[i]) alternating.push(leftKeys[i]);
    if (rightKeys[i]) alternating.push(rightKeys[i]);
  }
  if (alternating.length > 0) {
    drills.push(alternating.join('') + ' ' + alternating.reverse().join(''));
  }

  // Repeat each key
  drills.push(keys.map(k => k.repeat(3)).join(' '));

  return drills;
}

// Generate word-based exercises
function generateWordExercises(words: string[], count: number = 8): string[] {
  const exercises: string[] = [];
  const shuffled = [...words].sort(() => Math.random() - 0.5);

  // Short word groups
  for (let i = 0; i < Math.min(3, Math.ceil(shuffled.length / count)); i++) {
    const start = i * count;
    const group = shuffled.slice(start, start + count);
    if (group.length > 0) {
      exercises.push(group.join(' '));
    }
  }

  return exercises;
}

// Lesson titles and concepts (could be i18n keys in future)
const LESSON_META: Record<string, { title: string; description: string; concept: string }> = {
  home_row_basic: {
    title: 'Home Row Introduction',
    description: 'Learn the foundation of touch typing - the home row position',
    concept: `The home row is where your fingers rest when not typing. Place your fingers on these keys.

Notice the small bumps on the index finger keys - these help you find home position without looking!
Your thumbs rest on the space bar.`,
  },
  home_row_extended: {
    title: 'Home Row Extended - G and H',
    description: 'Extend your reach with index fingers to G and H',
    concept: `Your index fingers do double duty! They handle not just the home position, but also reach sideways to G and H.

Practice moving your index finger sideways while keeping other fingers on home row.`,
  },
  top_row_vowels: {
    title: 'Top Row - E and I',
    description: 'Reach up with your middle fingers',
    concept: `Now we'll add the most common vowels! Your middle fingers reach up from the home row.

Keep your hands anchored - only the middle finger moves up, then returns to home.`,
  },
  top_row_index: {
    title: 'Top Row - Index Fingers',
    description: 'Reach up with your index fingers',
    concept: `Your index fingers are the most agile - they handle multiple keys! Now reaching up to more letters.

These are very common letters in most languages.`,
  },
  top_row_ring: {
    title: 'Top Row - Ring Fingers',
    description: 'Ring fingers reach to the top row',
    concept: `Your ring fingers now join the action, reaching up to the top row.

This movement takes practice - focus on returning to home position.`,
  },
  top_row_pinky: {
    title: 'Top Row - Pinky Fingers',
    description: 'Challenge your pinkies with top row keys',
    concept: `The pinky fingers complete the top row! These are challenging reaches.

Pinkies are weaker, so take your time building strength and accuracy.`,
  },
  top_row_complete: {
    title: 'Top Row Complete',
    description: 'Master the remaining top row keys',
    concept: `The last top row keys! Both reached by index fingers.

You now know the entire top row!`,
  },
  bottom_row_middle_index: {
    title: 'Bottom Row Start',
    description: 'Reach down with middle and index fingers',
    concept: `Now we go below the home row! Start with common letters reached by your middle and index fingers.

Keep your wrists steady as you reach down.`,
  },
  bottom_row_index: {
    title: 'Bottom Row - Index Fingers',
    description: 'Index fingers reach down',
    concept: `More index finger work - they really are your workhorse fingers!

The bottom row requires a downward curl of your fingers.`,
  },
  bottom_row_ring: {
    title: 'Bottom Row - Ring Fingers',
    description: 'Ring fingers reach down',
    concept: `Your ring fingers now reach down to the bottom row.

These require a longer reach - practice smooth, controlled movements.`,
  },
  bottom_row_pinky: {
    title: 'Bottom Row - Pinky Fingers',
    description: 'Pinky fingers complete the bottom row',
    concept: `The final bottom row keys! Your pinkies reach down.

This is the ultimate pinky stretch.`,
  },
  complete_keyboard: {
    title: 'Complete Keyboard',
    description: 'The last keys and spacebar mastery',
    concept: `Congratulations! Just a few more keys to complete the keyboard.

The spacebar should be typed with your thumb. You now have access to the full keyboard!`,
  },
  full_practice: {
    title: 'Full Keyboard Practice',
    description: 'Master all keys with real words and sentences',
    concept: `You now know all letter positions! This lesson focuses on building speed and accuracy.

Remember: Accuracy first, then speed. Slow down if you make mistakes.`,
  },
  speed_building: {
    title: 'Speed Building',
    description: 'Push your typing speed with common word patterns',
    concept: `Time to build real speed! Focus on common word patterns and keeping a steady rhythm.

Think of typing like playing music - smooth and rhythmic, not jerky and rushed.`,
  },
  mastery: {
    title: 'Typing Mastery',
    description: 'The final challenge - typing real paragraphs',
    concept: `This is the ultimate test! You will type real paragraphs and sentences.

You are now a touch typist! Keep practicing daily for best results.`,
  },
};

// Generate lessons for a specific layout and language
export async function generateLayoutLessons(
  layoutFamily: LayoutFamily,
  language: LanguageCode
): Promise<Lesson[]> {
  const progression = getProgression(layoutFamily);
  const wordDatabase = await getWordDatabase(language);
  const lessons: Lesson[] = [];

  for (const stage of progression.stages) {
    const availableKeys = getAvailableKeys(layoutFamily, stage.id);

    // Get words that can be typed with available keys
    const words = getWordsForNewKeys(
      wordDatabase,
      availableKeys,
      stage.newKeys,
      { minLength: 2, maxLength: 10, limit: 50 }
    );

    // Get meta info
    const meta = LESSON_META[stage.name] || {
      title: `Lesson ${stage.id}`,
      description: `Learn keys: ${stage.newKeys.join(', ')}`,
      concept: `Practice the new keys: ${stage.newKeys.join(', ').toUpperCase()}`,
    };

    // Generate exercises
    const exercises: string[] = [];

    // Key drills for early stages
    if (stage.id <= 3) {
      exercises.push(...generateKeyDrills(stage.cumulativeKeys));
    }

    // Word exercises
    if (words.length > 0) {
      exercises.push(...generateWordExercises(words, 8));
    } else {
      // Fallback: use key patterns if no words available
      exercises.push(...generateKeyDrills(stage.cumulativeKeys));
    }

    // Ensure minimum exercises
    while (exercises.length < 6) {
      exercises.push(generateKeyDrills(stage.cumulativeKeys)[0] || stage.cumulativeKeys.join(' '));
    }

    // Select quiz words (prioritize words with new keys)
    const quizWords = words.slice(0, 8);

    // If not enough quiz words, add some key patterns
    while (quizWords.length < 8 && stage.cumulativeKeys.length > 0) {
      const fallbackWord = stage.cumulativeKeys.slice(0, 4).join('');
      if (!quizWords.includes(fallbackWord)) {
        quizWords.push(fallbackWord);
      } else {
        break;
      }
    }

    const lesson: Lesson = {
      id: stage.id,
      title: meta.title,
      description: meta.description,
      concept: meta.concept,
      keys: stage.cumulativeKeys,
      fingers: getFingersForKeys(stage.cumulativeKeys),
      exercises,
      quizWords,
      minWPM: 10 + (stage.id - 1) * 2,
      minAccuracy: Math.min(95, 80 + stage.id),
    };

    lessons.push(lesson);
  }

  return lessons;
}

// Synchronous version using cached data (for initial render)
// Falls back to generating simple lessons if database not loaded
export function generateLayoutLessonsSync(
  layoutFamily: LayoutFamily
): Lesson[] {
  const progression = getProgression(layoutFamily);
  const lessons: Lesson[] = [];

  for (const stage of progression.stages) {
    const meta = LESSON_META[stage.name] || {
      title: `Lesson ${stage.id}`,
      description: `Learn keys: ${stage.newKeys.join(', ')}`,
      concept: `Practice the new keys: ${stage.newKeys.join(', ').toUpperCase()}`,
    };

    // Generate simple key-based exercises
    const exercises = generateKeyDrills(stage.cumulativeKeys);

    // Simple quiz words from keys
    const quizWords = stage.cumulativeKeys.slice(0, 8);

    const lesson: Lesson = {
      id: stage.id,
      title: meta.title,
      description: meta.description,
      concept: meta.concept,
      keys: stage.cumulativeKeys,
      fingers: getFingersForKeys(stage.cumulativeKeys),
      exercises,
      quizWords,
      minWPM: 10 + (stage.id - 1) * 2,
      minAccuracy: Math.min(95, 80 + stage.id),
    };

    lessons.push(lesson);
  }

  return lessons;
}
