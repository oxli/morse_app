import { useState, useEffect, useCallback, useMemo } from 'react';
import { getTodayString } from '../utils/streak';

const STORAGE_KEY = 'morse-mistakes';
const RETENTION_DAYS = 30;
const RETENTION_MS = RETENTION_DAYS * 24 * 60 * 60 * 1000;
const REVIEW_COUNT = 2;

export interface MistakeLog {
  [letter: string]: number[]; // timestamps (ms) of incorrect attempts
}

const pruneOldMistakes = (log: MistakeLog): MistakeLog => {
  const cutoff = Date.now() - RETENTION_MS;
  const pruned: MistakeLog = {};
  for (const [letter, timestamps] of Object.entries(log)) {
    const recent = timestamps.filter(t => t >= cutoff);
    if (recent.length > 0) pruned[letter] = recent;
  }
  return pruned;
};

// Small deterministic PRNG so the same seed always produces the same
// sequence (lets the daily pick stay stable for the whole day).
const mulberry32 = (seed: number) => {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const seedFromString = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return hash;
};

// Weighted random pick, without replacement, of `count` letters — letters
// missed more often are more likely to come up, but any missed letter is
// eligible each day.
const weightedSampleWithoutReplacement = (
  items: { letter: string; weight: number }[],
  count: number,
  rng: () => number
): string[] => {
  const pool = [...items];
  const result: string[] = [];
  while (result.length < count && pool.length > 0) {
    const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);
    let r = rng() * totalWeight;
    let index = pool.length - 1;
    for (let i = 0; i < pool.length; i++) {
      r -= pool[i].weight;
      if (r <= 0) {
        index = i;
        break;
      }
    }
    result.push(pool[index].letter);
    pool.splice(index, 1);
  }
  return result;
};

export const useMistakes = () => {
  const [mistakes, setMistakes] = useState<MistakeLog>({});

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setMistakes(pruneOldMistakes(JSON.parse(stored)));
      } catch {
        setMistakes({});
      }
    }
  }, []);

  const recordMistake = useCallback((letter: string) => {
    setMistakes(prev => {
      const pruned = pruneOldMistakes(prev);
      const updated: MistakeLog = {
        ...pruned,
        [letter]: [...(pruned[letter] || []), Date.now()],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Weighted-random pick, seeded by today's date: more-often-missed letters
  // are more likely to show up, but the pick isn't just a fixed top-N — and
  // since the seed and the 30-day window both depend on the current date,
  // the picks reshuffle daily instead of on every render.
  const reviewLetters = useMemo(() => {
    const pruned = pruneOldMistakes(mistakes);
    const items = Object.entries(pruned).map(([letter, timestamps]) => ({
      letter,
      weight: timestamps.length,
    }));
    if (items.length === 0) return [];
    const rng = mulberry32(seedFromString(getTodayString()));
    return weightedSampleWithoutReplacement(items, REVIEW_COUNT, rng);
  }, [mistakes]);

  return { recordMistake, reviewLetters };
};
