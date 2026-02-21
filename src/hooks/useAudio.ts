import { useCallback, useRef } from 'react';

const FREQUENCY = 600; // Hz
const DIT_DURATION = 60; // ms
const DAH_DURATION = DIT_DURATION * 3; // 180ms
const ELEMENT_GAP = DIT_DURATION; // 60ms between dots/dashes
// Letter gap for future word support: DIT_DURATION * 3 (180ms)

export const useAudio = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const isPlayingRef = useRef(false);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }, []);

  const playTone = useCallback((duration: number): Promise<void> => {
    return new Promise((resolve) => {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = FREQUENCY;
      oscillator.type = 'sine';

      // Smooth envelope to avoid clicks
      const now = ctx.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.5, now + 0.01);
      gainNode.gain.setValueAtTime(0.5, now + duration / 1000 - 0.01);
      gainNode.gain.linearRampToValueAtTime(0, now + duration / 1000);

      oscillator.start(now);
      oscillator.stop(now + duration / 1000);

      setTimeout(resolve, duration);
    });
  }, [getAudioContext]);

  const playDit = useCallback(() => playTone(DIT_DURATION), [playTone]);
  const playDah = useCallback(() => playTone(DAH_DURATION), [playTone]);

  const wait = useCallback((ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }, []);

  const playMorse = useCallback(async (morse: string): Promise<void> => {
    if (isPlayingRef.current) return;
    isPlayingRef.current = true;

    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const elements = morse.split('');

    for (let i = 0; i < elements.length; i++) {
      if (!isPlayingRef.current) break;

      if (elements[i] === '.') {
        await playDit();
      } else if (elements[i] === '-') {
        await playDah();
      }

      if (i < elements.length - 1) {
        await wait(ELEMENT_GAP);
      }
    }

    isPlayingRef.current = false;
  }, [getAudioContext, playDit, playDah, wait]);

  const playFeedback = useCallback(async (correct: boolean) => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = correct ? 880 : 220;
    oscillator.type = 'sine';

    const now = ctx.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.02);
    gainNode.gain.linearRampToValueAtTime(0, now + 0.15);

    oscillator.start(now);
    oscillator.stop(now + 0.15);
  }, [getAudioContext]);

  return {
    playMorse,
    playDit,
    playDah,
    playFeedback,
  };
};
