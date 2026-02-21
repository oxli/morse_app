import { useCallback } from 'react';
import { MorseDisplay } from './MorseDisplay';
import { useAudio } from '../hooks/useAudio';
import { getMorse } from '../data/morseCode';

interface LetterIntroProps {
  letters: string[];
  isReview: boolean;
  onStart: () => void;
}

export const LetterIntro = ({ letters, isReview, onStart }: LetterIntroProps) => {
  const { playMorse } = useAudio();

  const handlePlayLetter = useCallback((letter: string) => {
    playMorse(getMorse(letter));
  }, [playMorse]);

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto">
      <div className="flex flex-col items-center max-w-lg mx-auto w-full">
        <h2 className="text-2xl font-bold mb-2 text-center">
          {isReview ? 'Review Time!' : 'New Letters'}
        </h2>
        <p className="text-slate-400 mb-8 text-center">
          {isReview
            ? 'Practice these letters you\'ve learned'
            : 'Learn these letters before starting exercises'}
        </p>

        <div className="w-full space-y-4 mb-8">
          {letters.map((letter) => {
            const morse = getMorse(letter);
            return (
              <div
                key={letter}
                className="bg-slate-800 rounded-xl p-6 flex items-center gap-6"
              >
                <div className="text-5xl font-bold text-amber-400 w-16 text-center">
                  {letter}
                </div>
                <div className="flex-1">
                  <MorseDisplay morse={morse} size="md" showLabel={true} />
                </div>
                <button
                  onClick={() => handlePlayLetter(letter)}
                  className="p-3 rounded-full bg-slate-700 hover:bg-slate-600
                             text-slate-300 transition-colors"
                  aria-label={`Play morse code for ${letter}`}
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>

        <p className="text-slate-500 text-sm mb-6 text-center">
          Tap the sound icon to hear each letter
        </p>

        <button
          onClick={onStart}
          className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500
                     text-white font-semibold text-lg transition-colors"
        >
          Start Exercises
        </button>
      </div>
    </div>
  );
};
