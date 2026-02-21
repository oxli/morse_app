import { useState, useCallback, useEffect, useRef } from 'react';
import { useAudio } from '../hooks/useAudio';

interface MorseInputProps {
  expectedMorse: string;
  onComplete: (correct: boolean) => void;
  disabled?: boolean;
}

const SUBMIT_DELAY = 500; // ms of silence before auto-submit

export const MorseInput = ({ expectedMorse, onComplete, disabled }: MorseInputProps) => {
  const [input, setInput] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  const { playDit, playDah, playFeedback } = useAudio();

  const isCheckingRef = useRef(false);

  useEffect(() => {
    isCheckingRef.current = isChecking;
  }, [isChecking]);

  // Reset when exercise changes
  useEffect(() => {
    setInput('');
    setIsChecking(false);
    isCheckingRef.current = false;
    setSubmitProgress(0);
  }, [expectedMorse]);

  // Auto-submit: fires SUBMIT_DELAY ms after the last dot/dash
  useEffect(() => {
    if (isChecking || input.length === 0 || disabled) {
      setSubmitProgress(0);
      return;
    }

    const startTime = Date.now();
    setSubmitProgress(0);

    let animId: number;
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / SUBMIT_DELAY) * 100);
      setSubmitProgress(progress);
      if (progress < 100) {
        animId = requestAnimationFrame(animate);
      }
    };
    animId = requestAnimationFrame(animate);

    const timer = setTimeout(async () => {
      cancelAnimationFrame(animId);
      if (isCheckingRef.current) return;
      isCheckingRef.current = true;
      setIsChecking(true);
      setSubmitProgress(0);
      const correct = input === expectedMorse;
      await playFeedback(correct);
      setTimeout(() => {
        onComplete(correct);
        setInput('');
        setIsChecking(false);
        isCheckingRef.current = false;
      }, 300);
    }, SUBMIT_DELAY);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(animId);
    };
  }, [input, isChecking, disabled, expectedMorse, playFeedback, onComplete]);

  const handleDot = useCallback(async () => {
    if (disabled || isCheckingRef.current) return;
    await playDit();
    setInput(prev => prev + '.');
  }, [disabled, playDit]);

  const handleDash = useCallback(async () => {
    if (disabled || isCheckingRef.current) return;
    await playDah();
    setInput(prev => prev + '-');
  }, [disabled, playDah]);

  const handleBackspace = useCallback(() => {
    if (disabled || isCheckingRef.current) return;
    setInput(prev => prev.slice(0, -1));
  }, [disabled]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (disabled || isCheckingRef.current) return;
    if (e.key === '.' || e.key === ',') { e.preventDefault(); handleDot(); }
    else if (e.key === '-' || e.key === '/') { e.preventDefault(); handleDash(); }
    else if (e.key === 'Backspace') { e.preventDefault(); handleBackspace(); }
  }, [disabled, handleDot, handleDash, handleBackspace]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex flex-col items-center gap-4">

      {/* Entered morse — only visible when input exists */}
      {input.length > 0 && (
        <div className="flex items-center justify-center gap-3 min-h-[2rem]">
          {input.split('').map((char, i) => (
            <div
              key={i}
              className={`${char === '.' ? 'w-5 h-5 rounded-full' : 'w-10 h-5 rounded-sm'} bg-amber-400`}
            />
          ))}
        </div>
      )}

      {/* Submit countdown bar — visible while timer is running */}
      <div className="w-full max-w-xs h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-400 rounded-full transition-none"
          style={{ width: `${submitProgress}%` }}
        />
      </div>

      {/* Dot and Dash buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleDot}
          disabled={disabled || isChecking}
          className="w-32 h-32 rounded-full bg-slate-700 hover:bg-slate-600 active:bg-slate-500
                     disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center justify-center"
        >
          <div className="w-12 h-12 rounded-full bg-slate-300" />
        </button>
        <button
          onClick={handleDash}
          disabled={disabled || isChecking}
          className="w-32 h-32 rounded-2xl bg-slate-700 hover:bg-slate-600 active:bg-slate-500
                     disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center justify-center"
        >
          <div className="w-20 h-8 rounded-sm bg-slate-300" />
        </button>
      </div>

    </div>
  );
};
