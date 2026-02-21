const getDateString = (date: Date = new Date()): string => {
  return date.toISOString().split('T')[0];
};

const getYesterday = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return getDateString(yesterday);
};

export const calculateStreak = (
  lastLessonDate: string | null,
  currentStreak: number
): { newStreak: number; isNewDay: boolean } => {
  const today = getDateString();

  if (lastLessonDate === today) {
    return { newStreak: currentStreak, isNewDay: false };
  }

  if (lastLessonDate === getYesterday()) {
    return { newStreak: currentStreak + 1, isNewDay: true };
  }

  if (lastLessonDate === null) {
    return { newStreak: 1, isNewDay: true };
  }

  // Streak broken - more than a day gap
  return { newStreak: 1, isNewDay: true };
};

export const isStreakActive = (lastLessonDate: string | null): boolean => {
  if (!lastLessonDate) return false;
  const today = getDateString();
  const yesterday = getYesterday();
  return lastLessonDate === today || lastLessonDate === yesterday;
};

export const getTodayString = (): string => getDateString();
