export type FingerType = 'left-pinky' | 'left-ring' | 'left-middle' | 'left-index' | 'right-index' | 'right-middle' | 'right-ring' | 'right-pinky' | 'thumb';

export interface KeyInfo {
  key: string;
  finger: FingerType;
  row: number;
  position: number;
  width?: number;
}

export interface Lesson {
  id: number;
  title: string;
  description: string;
  concept: string;
  keys: string[];
  fingers: FingerType[];
  exercises: string[];
  quizWords: string[];
  minWPM: number;
  minAccuracy: number;
}

export interface LessonProgress {
  lessonId: number;
  completed: boolean;
  bestWPM: number;
  bestAccuracy: number;
  attempts: number;
  quizPassed: boolean;
}

export interface TypingStats {
  wpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  totalChars: number;
  timeElapsed: number;
}
