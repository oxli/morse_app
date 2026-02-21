import { useState, useCallback, useEffect } from 'react';
import type { Exercise } from '../types';
import { MorseInput } from './MorseInput';

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
          <span>See & Tap</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${(exerciseNumber / totalExercises) * 100}%` }}
          />
        </div>
      </div>

      {/* Content — truly centered vertically */}
      <div className="flex-1 flex flex-col items-center justify-center gap-10 px-6 pb-8">
        <div className="flex flex-col items-center gap-3">
          <p className="text-slate-400 text-sm">Tap to enter morse</p>
          <div className="text-8xl font-bold text-amber-400">
            {exercise.letter}
          </div>
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
              {showAnswer && <p className="text-sm mt-1 opacity-90">{exercise.letter} = {exercise.morse}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
