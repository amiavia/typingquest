import { useState, useEffect, useMemo, useCallback } from 'react';
import type { LayoutFamily, LanguageCode, ThemeId } from '../types/settings';
import {
  generateAllLessons,
  generateLesson,
  type GeneratedLesson,
  type LessonGeneratorOptions,
} from '../data/lessonGenerator';

export interface UseLessonsOptions {
  layoutFamily: LayoutFamily;
  language: LanguageCode;
  mixEnglishWords: boolean;
  englishMixRatio: number;
  activeThemes?: ThemeId[];
  themeMixRatio?: number;
}

export interface UseLessonsResult {
  lessons: GeneratedLesson[];
  isLoading: boolean;
  error: Error | null;
  regenerateLesson: (stageId: number) => Promise<void>;
  regenerateAllLessons: () => Promise<void>;
}

// Cache key for lessons
function getCacheKey(options: UseLessonsOptions): string {
  return `${options.layoutFamily}-${options.language}-${options.mixEnglishWords}-${options.englishMixRatio}`;
}

// In-memory cache for generated lessons
const lessonsCache = new Map<string, GeneratedLesson[]>();

export function useLessons(options: UseLessonsOptions): UseLessonsResult {
  const [lessons, setLessons] = useState<GeneratedLesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Memoize the options to prevent unnecessary regeneration
  const memoizedOptions = useMemo<LessonGeneratorOptions>(
    () => ({
      layoutFamily: options.layoutFamily,
      language: options.language,
      mixEnglishWords: options.mixEnglishWords,
      englishMixRatio: options.englishMixRatio,
      activeThemes: options.activeThemes,
      themeMixRatio: options.themeMixRatio,
    }),
    [
      options.layoutFamily,
      options.language,
      options.mixEnglishWords,
      options.englishMixRatio,
      options.activeThemes,
      options.themeMixRatio,
    ]
  );

  // Load lessons on mount and when options change
  useEffect(() => {
    let cancelled = false;

    const loadLessons = async () => {
      setIsLoading(true);
      setError(null);

      const cacheKey = getCacheKey(options);

      // Check cache first
      if (lessonsCache.has(cacheKey)) {
        setLessons(lessonsCache.get(cacheKey)!);
        setIsLoading(false);
        return;
      }

      try {
        const generatedLessons = await generateAllLessons(memoizedOptions);

        if (!cancelled) {
          lessonsCache.set(cacheKey, generatedLessons);
          setLessons(generatedLessons);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to generate lessons'));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadLessons();

    return () => {
      cancelled = true;
    };
  }, [memoizedOptions, options]);

  // Regenerate a single lesson (useful for variety)
  const regenerateLesson = useCallback(
    async (stageId: number) => {
      try {
        const newLesson = await generateLesson(stageId, memoizedOptions);
        setLessons((prev) =>
          prev.map((lesson) => (lesson.id === stageId ? newLesson : lesson))
        );

        // Update cache
        const cacheKey = getCacheKey(options);
        const cached = lessonsCache.get(cacheKey);
        if (cached) {
          lessonsCache.set(
            cacheKey,
            cached.map((lesson) => (lesson.id === stageId ? newLesson : lesson))
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to regenerate lesson'));
      }
    },
    [memoizedOptions, options]
  );

  // Regenerate all lessons
  const regenerateAllLessons = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const generatedLessons = await generateAllLessons(memoizedOptions);
      setLessons(generatedLessons);

      // Update cache
      const cacheKey = getCacheKey(options);
      lessonsCache.set(cacheKey, generatedLessons);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to regenerate lessons'));
    } finally {
      setIsLoading(false);
    }
  }, [memoizedOptions, options]);

  return {
    lessons,
    isLoading,
    error,
    regenerateLesson,
    regenerateAllLessons,
  };
}

// Clear the lessons cache (useful for testing or memory management)
export function clearLessonsCache(): void {
  lessonsCache.clear();
}
