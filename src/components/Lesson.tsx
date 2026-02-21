import { useState, useEffect, useMemo, useCallback } from 'react';
import type { LessonData } from '../types';
import { generateExercises } from '../data/curriculum';
import { ExerciseCard } from './ExerciseCard';
import { LetterIntro } from './LetterIntro';

interface LessonProps {
  lesson: LessonData;
  onComplete: (score: number, total: number) => void;
  onExit: () => void;
}

const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const LessonHeader = ({ title, onExit }: { title: string; onExit: () => void }) => (
  <div className="border-b border-slate-700">
    <div className="flex items-center justify-between p-4 max-w-lg mx-auto">
      <button onClick={onExit} className="p-2 text-slate-400 hover:text-slate-200">
        <CloseIcon />
      </button>
      <h1 className="text-lg font-semibold">{title}</h1>
      <div className="w-10" />
    </div>
  </div>
);

export const Lesson = ({ lesson, onComplete, onExit }: LessonProps) => {
  const exercises = useMemo(() => generateExercises(lesson), [lesson]);
  const [showIntro, setShowIntro] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const currentExercise = exercises[currentIndex];

  const introLetters = useMemo(() => {
    return lesson.newLetters.length > 0 ? lesson.newLetters : lesson.reviewLetters.slice(0, 6);
  }, [lesson]);

  const handleExerciseComplete = useCallback((correct: boolean) => {
    if (correct) setScore(prev => prev + 1);
    if (currentIndex >= exercises.length - 1) {
      setIsComplete(true);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, exercises.length]);

  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(() => onComplete(score, exercises.length), 2000);
      return () => clearTimeout(timer);
    }
  }, [isComplete, score, exercises.length, onComplete]);

  if (showIntro) {
    return (
      <div className="min-h-screen flex flex-col">
        <LessonHeader title={lesson.title} onExit={onExit} />
        <LetterIntro letters={introLetters} isReview={lesson.isReview} onStart={() => setShowIntro(false)} />
      </div>
    );
  }

  if (isComplete) {
    const percentage = Math.round((score / exercises.length) * 100);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-sm mx-auto">
          <h2 className="text-3xl font-bold mb-4">Lesson Complete!</h2>
          <div className="text-6xl font-bold text-amber-400 mb-4">{percentage}%</div>
          <p className="text-slate-400 text-lg mb-8">{score} of {exercises.length} correct</p>
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
      <LessonHeader title={lesson.title} onExit={onExit} />
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
