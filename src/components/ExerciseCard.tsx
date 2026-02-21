import { useState, useCallback, useEffect } from 'react';
import type { Exercise } from '../types';
import { MorseInput } from './MorseInput';
import { MorseDisplay } from './MorseDisplay';
import { useAudio } from '../hooks/useAudio';

interface ExerciseCardProps {
  exercise: Exercise;
  onComplete: (correct: boolean) => void;
  exerciseNumber: number;
  totalExercises: number;
}

export const ExerciseCard = ({
  exercise,
  onComplete,
  exerciseNumber,
  totalExercises,
}: ExerciseCardProps) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const { playMorse } = useAudio();

  useEffect(() => {
    setShowAnswer(false);
    setFeedback(null);
  }, [exercise]);

  const handleProductionComplete = useCallback((correct: boolean) => {
    setFeedback(correct ? 'correct' : 'incorrect');
    if (!correct) setShowAnswer(true);
    setTimeout(() => onComplete(correct), correct ? 500 : 1500);
  }, [onComplete]);

  return (
    <div className="flex flex-col flex-1 w-full max-w-lg mx-auto">

      {/* Progress bar */}
      <div className="px-6 pt-4 pb-2">
        <div className="flex justify-between text-sm text-slate-400 mb-2">
          <span>Exercise {exerciseNumber} of {totalExercises}</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${(exerciseNumber / totalExercises) * 100}%` }}
          />
        </div>
      </div>

      {/* Content — centered vertically */}
      <div className="flex-1 flex flex-col items-center justify-center gap-10 px-6 pb-8">
        <div className="flex flex-col items-center gap-4">
          <p className="text-slate-400 text-sm">Tap to enter morse</p>
          <div className="text-8xl font-bold text-amber-400">
            {exercise.letter}
          </div>
          <button
            onClick={() => playMorse(exercise.morse)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700
                       hover:bg-slate-600 text-slate-300 text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
            Play sound
          </button>
        </div>
        <MorseInput
          expectedMorse={exercise.morse}
          onComplete={handleProductionComplete}
          disabled={feedback !== null}
        />
      </div>

      {/* Overlay feedback banner */}
      {feedback && (
        <div className={`fixed inset-x-0 top-16 z-50 mx-4 rounded-xl py-3 px-4 text-center shadow-lg ${
          feedback === 'correct' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {feedback === 'correct' ? (
            <p className="text-xl font-bold">Correct!</p>
          ) : (
            <div>
              <p className="text-xl font-bold">Incorrect</p>
              {showAnswer && (
                <div className="mt-2 flex justify-center opacity-90">
                  <MorseDisplay morse={exercise.morse} size="sm" showLabel={false} />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
