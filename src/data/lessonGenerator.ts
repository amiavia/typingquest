import type { LayoutFamily, LanguageCode, ThemeId } from '../types/settings';
import { getAvailableKeys, getStage } from './keyProgressions';
import { getWordDatabase } from './wordDatabases';
import { getValidWords, getWordsForNewKeys } from '../utils/wordFilter';

// Generated lesson structure
export interface GeneratedLesson {
  id: number;
  title: string;
  description: string;
  concept: string;
  conceptKey: string;
  keys: string[];
  newKeys: string[];
  exercises: string[];
  quizWords: string[];
  minWPM: number;
  minAccuracy: number;
}

// Options for lesson generation
export interface LessonGeneratorOptions {
  layoutFamily: LayoutFamily;
  language: LanguageCode;
  mixEnglishWords: boolean;
  englishMixRatio: number;
  activeThemes?: ThemeId[];
  themeMixRatio?: number;
}

// Exercise patterns
export type ExercisePattern = 'single_keys' | 'key_pairs' | 'short_words' | 'long_words' | 'mixed';

// Generate exercises from word list
export function generateExercises(
  words: string[],
  newKeys: string[],
  stageId: number
): string[] {
  const exercises: string[] = [];

  // Pattern 1: Single key practice (for early stages)
  if (stageId <= 2 && newKeys.length > 0) {
    const keyPractice = newKeys.map(k => k.repeat(5)).join(' ');
    exercises.push(keyPractice);
  }

  // Pattern 2: Key pairs (alternating new keys with home row)
  if (stageId <= 4 && newKeys.length > 0) {
    const pairs = newKeys.flatMap(k => ['f', 'j', 'd', 'k'].map(h => `${k}${h} ${h}${k}`));
    exercises.push(pairs.slice(0, 8).join(' '));
  }

  // Pattern 3: Short words (2-4 letters)
  const shortWords = words.filter(w => w.length >= 2 && w.length <= 4);
  if (shortWords.length > 0) {
    exercises.push(shuffleAndPick(shortWords, 10).join(' '));
    exercises.push(shuffleAndPick(shortWords, 12).join(' '));
  }

  // Pattern 4: Medium words (5-7 letters)
  const mediumWords = words.filter(w => w.length >= 5 && w.length <= 7);
  if (mediumWords.length > 0) {
    exercises.push(shuffleAndPick(mediumWords, 8).join(' '));
  }

  // Pattern 5: Long words (8+ letters)
  const longWords = words.filter(w => w.length >= 8);
  if (longWords.length > 0) {
    exercises.push(shuffleAndPick(longWords, 5).join(' '));
  }

  // Pattern 6: Mixed practice
  exercises.push(shuffleAndPick(words, 15).join(' '));
  exercises.push(shuffleAndPick(words, 15).join(' '));

  // Pattern 7: Words with new keys emphasized
  if (newKeys.length > 0) {
    const wordsWithNewKeys = words.filter(w =>
      newKeys.some(k => w.toLowerCase().includes(k.toLowerCase()))
    );
    if (wordsWithNewKeys.length > 0) {
      exercises.push(shuffleAndPick(wordsWithNewKeys, 10).join(' '));
    }
  }

  // Ensure we have at least 5 exercises
  while (exercises.length < 5) {
    exercises.push(shuffleAndPick(words, 12).join(' '));
  }

  return exercises;
}

// Select quiz words, prioritizing newly learned keys
export function selectQuizWords(
  words: string[],
  newKeys: string[],
  count: number = 8
): string[] {
  // Prioritize words that use new keys
  const wordsWithNewKeys = words.filter(w =>
    newKeys.some(k => w.toLowerCase().includes(k.toLowerCase()))
  );

  const wordsWithoutNewKeys = words.filter(w =>
    !newKeys.some(k => w.toLowerCase().includes(k.toLowerCase()))
  );

  // 70% words with new keys, 30% reinforcement
  const newKeyCount = Math.ceil(count * 0.7);
  const reinforcementCount = count - newKeyCount;

  const selectedNewKey = shuffleAndPick(wordsWithNewKeys, newKeyCount);
  const selectedReinforcement = shuffleAndPick(wordsWithoutNewKeys, reinforcementCount);

  return shuffleArray([...selectedNewKey, ...selectedReinforcement]);
}

// Calculate minimum WPM target based on stage
export function calculateMinWPM(stageId: number): number {
  // Start at 10 WPM, increase by ~2 WPM per stage, cap at 40
  const baseWPM = 10;
  const increment = 2;
  return Math.min(40, baseWPM + (stageId - 1) * increment);
}

// Calculate minimum accuracy target based on stage
export function calculateMinAccuracy(stageId: number): number {
  // Start at 80%, increase by ~1% per stage, cap at 95%
  const baseAccuracy = 80;
  const increment = 1;
  return Math.min(95, baseAccuracy + (stageId - 1) * increment);
}

// Mix words from different sources based on ratio
export function mixWords(
  nativeWords: string[],
  englishWords: string[],
  nativeRatio: number = 0.7
): string[] {
  if (englishWords.length === 0) {
    return shuffleArray(nativeWords);
  }

  const totalWords = Math.max(nativeWords.length, 50);
  const nativeCount = Math.floor(totalWords * nativeRatio);
  const englishCount = totalWords - nativeCount;

  const selectedNative = shuffleAndPick(nativeWords, nativeCount);
  const selectedEnglish = shuffleAndPick(englishWords, englishCount);

  return shuffleArray([...selectedNative, ...selectedEnglish]);
}

// Generate a single lesson
export async function generateLesson(
  stageId: number,
  options: LessonGeneratorOptions
): Promise<GeneratedLesson> {
  const { layoutFamily, language, mixEnglishWords, englishMixRatio } = options;

  // Get the stage info
  const stage = getStage(layoutFamily, stageId);
  if (!stage) {
    throw new Error(`Invalid stage ${stageId} for layout family ${layoutFamily}`);
  }

  const availableKeys = getAvailableKeys(layoutFamily, stageId);

  // Get word database for the selected language
  const wordDatabase = await getWordDatabase(language);

  // Get words prioritizing new keys
  let words = getWordsForNewKeys(
    wordDatabase,
    availableKeys,
    stage.newKeys,
    { minLength: 2, limit: 100 }
  );

  // Mix in English words if enabled and language is not English
  if (mixEnglishWords && language !== 'en') {
    const englishDatabase = await getWordDatabase('en');
    const englishWords = getValidWords(
      englishDatabase,
      availableKeys,
      { minLength: 2, limit: 50 }
    );
    words = mixWords(words, englishWords, 1 - englishMixRatio);
  }

  // Generate exercises
  const exercises = generateExercises(words, stage.newKeys, stageId);

  // Select quiz words
  const quizWords = selectQuizWords(words, stage.newKeys, 8);

  // Build lesson title and description
  const title = `Lesson ${stageId}: ${stage.name}`;
  const description = `Learn keys: ${stage.newKeys.join(', ').toUpperCase()}`;

  return {
    id: stageId,
    title,
    description,
    concept: stage.conceptKey,
    conceptKey: stage.conceptKey,
    keys: stage.cumulativeKeys,
    newKeys: stage.newKeys,
    exercises,
    quizWords,
    minWPM: calculateMinWPM(stageId),
    minAccuracy: calculateMinAccuracy(stageId),
  };
}

// Generate all lessons for a layout/language combination
export async function generateAllLessons(
  options: LessonGeneratorOptions
): Promise<GeneratedLesson[]> {
  const lessons: GeneratedLesson[] = [];

  for (let stageId = 1; stageId <= 15; stageId++) {
    const lesson = await generateLesson(stageId, options);
    lessons.push(lesson);
  }

  return lessons;
}

// Helper: Shuffle array using Fisher-Yates
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Helper: Shuffle and pick N items
function shuffleAndPick<T>(array: T[], count: number): T[] {
  const shuffled = shuffleArray(array);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
