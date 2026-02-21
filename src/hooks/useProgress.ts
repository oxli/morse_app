import { useState, useEffect, useCallback } from 'react';
import type { Progress } from '../types';
import { calculateStreak, getTodayString } from '../utils/streak';

const STORAGE_KEY = 'morse-progress';

const defaultProgress: Progress = {
  completedLessons: [],
  currentLesson: 1,
  lastLessonDate: null,
  currentStreak: 0,
  longestStreak: 0,
};

export const useProgress = () => {
  const [progress, setProgress] = useState<Progress>(defaultProgress);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setProgress(JSON.parse(stored));
      } catch {
        setProgress(defaultProgress);
      }
    }
    setIsLoaded(true);
  }, []);

  const saveProgress = useCallback((newProgress: Progress) => {
    setProgress(newProgress);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
  }, []);

  const completeLesson = useCallback((lessonId: number) => {
    const { newStreak, isNewDay } = calculateStreak(
      progress.lastLessonDate,
      progress.currentStreak
    );

    const updatedProgress: Progress = {
      completedLessons: progress.completedLessons.includes(lessonId)
        ? progress.completedLessons
        : [...progress.completedLessons, lessonId],
      currentLesson: Math.max(progress.currentLesson, lessonId + 1),
      lastLessonDate: getTodayString(),
      currentStreak: isNewDay ? newStreak : progress.currentStreak,
      longestStreak: Math.max(progress.longestStreak, newStreak),
    };

    saveProgress(updatedProgress);
  }, [progress, saveProgress]);

  const resetProgress = useCallback(() => {
    saveProgress(defaultProgress);
  }, [saveProgress]);

  const isLessonUnlocked = useCallback((lessonId: number): boolean => {
    return lessonId <= progress.currentLesson;
  }, [progress.currentLesson]);

  return {
    progress,
    isLoaded,
    completeLesson,
    resetProgress,
    isLessonUnlocked,
  };
};
