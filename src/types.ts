export interface MorseCode {
  [key: string]: string;
}

export type ExerciseType = 'recognition' | 'production';

export interface Exercise {
  id: number;
  type: ExerciseType;
  letter: string;
  morse: string;
}

export interface LessonData {
  id: number;
  title: string;
  newLetters: string[];
  reviewLetters: string[];
  isReview: boolean;
}

export interface Progress {
  completedLessons: number[];
  currentLesson: number;
  lastLessonDate: string | null;
  currentStreak: number;
  longestStreak: number;
}

export interface Settings {
  notificationsEnabled: boolean;
  notificationTime: string; // "HH:MM" 24-hour format
}
