import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Exercise, LessonData } from '../types';
import { getMorse } from '../data/morseCode';
import { ExerciseCard } from './ExerciseCard';
import { LetterIntro } from './LetterIntro';

interface LessonProps {
  lesson: LessonData;
  onComplete: (score: number, total: number) => void;
  onExit: () => void;
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const generateExercises = (lesson: LessonData): Exercise[] => {
  const exercises: Exercise[] = [];
  let exerciseId = 0;

  // New letters: 2 production exercises each to give focused practice
  lesson.newLetters.forEach(letter => {
    for (let i = 0; i < 2; i++) {
      exercises.push({
        id: exerciseId++,
        type: 'production',
        letter,
        morse: getMorse(letter),
      });
    }
  });

  // Review letters: up to 4 production exercises
  const reviewSubset = shuffleArray(lesson.reviewLetters).slice(0, 4);
  reviewSubset.forEach(letter => {
    exercises.push({
      id: exerciseId++,
      type: 'production',
      letter,
      morse: getMorse(letter),
    });
  });

  // Fill remaining slots, weighting new letters 3:1 over review letters
  const targetTotal = Math.max(15, exercises.length);
  const needed = targetTotal - exercises.length;
  if (needed > 0) {
    const newWeight = lesson.newLetters.length > 0 ? 3 : 1;
    const fillPool = [
      ...Array(newWeight).fill(lesson.newLetters).flat(),
      ...lesson.reviewLetters,
    ];
    shuffleArray(fillPool).slice(0, needed).forEach(letter => {
      exercises.push({
        id: exerciseId++,
        type: 'production',
        letter,
        morse: getMorse(letter),
      });
    });
  }

  return shuffleArray(exercises);
};

export const Lesson = ({ lesson, onComplete, onExit }: LessonProps) => {
  const exercises = useMemo(() => generateExercises(lesson), [lesson]);
  const [showIntro, setShowIntro] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const currentExercise = exercises[currentIndex];

  // Determine which letters to show in intro
  const introLetters = useMemo(() => {
    if (lesson.newLetters.length > 0) {
      return lesson.newLetters;
    }
    // For review lessons, show a subset of review letters
    return lesson.reviewLetters.slice(0, 6);
  }, [lesson]);

  const handleExerciseComplete = useCallback((correct: boolean) => {
    if (correct) {
      setScore(prev => prev + 1);
    }

    if (currentIndex >= exercises.length - 1) {
      setIsComplete(true);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, exercises.length]);

  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(() => {
        onComplete(score, exercises.length);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isComplete, score, exercises.length, onComplete]);

  // Show intro screen first
  if (showIntro) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <button
            onClick={onExit}
            className="p-2 text-slate-400 hover:text-slate-200"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold">{lesson.title}</h1>
          <div className="w-10" />
        </div>

        <LetterIntro
          letters={introLetters}
          isReview={lesson.isReview}
          onStart={() => setShowIntro(false)}
        />
      </div>
    );
  }

  if (isComplete) {
    const percentage = Math.round((score / exercises.length) * 100);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Lesson Complete!</h2>
          <div className="text-6xl font-bold text-amber-400 mb-4">
            {percentage}%
          </div>
          <p className="text-slate-400 text-lg mb-8">
            {score} of {exercises.length} correct
          </p>
          {percentage >= 80 ? (
            <p className="text-emerald-400 text-xl">Great work!</p>
          ) : percentage >= 60 ? (
            <p className="text-amber-400 text-xl">Good effort! Keep practicing!</p>
          ) : (
            <p className="text-slate-400 text-xl">Try this lesson again to improve!</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <button
          onClick={onExit}
          className="p-2 text-slate-400 hover:text-slate-200"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold">{lesson.title}</h1>
        <div className="w-10" />
      </div>

      {/* Exercise area */}
      <div className="flex-1 flex flex-col">
        <ExerciseCard
          key={currentExercise.id}
          exercise={currentExercise}
          onComplete={handleExerciseComplete}
          exerciseNumber={currentIndex + 1}
          totalExercises={exercises.length}
        />
      </div>
    </div>
  );
};
