import type { LessonData } from '../types';

// Letters ordered by English frequency
const LETTER_ORDER = [
  'E', 'T', // Lesson 1
  'A', 'O', // Lesson 2
  'I', 'N', // Lesson 3
  // Review 1-3
  'S', 'R', // Lesson 5
  'H', 'L', // Lesson 6
  // Review 4-6
  'D', 'C', // Lesson 8
  'U', 'M', // Lesson 9
  // Review 7-9
  'W', 'F', // Lesson 11
  'G', 'Y', // Lesson 12
  // Review 10-12
  'P', 'B', // Lesson 14
  'V', 'K', // Lesson 15
  // Review 13-15
  'J', 'X', // Lesson 17
  'Q', 'Z', // Lesson 18
  // Review all letters
  // Numbers
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
];

export const LESSONS: LessonData[] = [
  { id: 1, title: 'E & T', newLetters: ['E', 'T'], reviewLetters: [], isReview: false },
  { id: 2, title: 'A & O', newLetters: ['A', 'O'], reviewLetters: ['E', 'T'], isReview: false },
  { id: 3, title: 'I & N', newLetters: ['I', 'N'], reviewLetters: ['E', 'T', 'A', 'O'], isReview: false },
  { id: 4, title: 'Review 1-3', newLetters: [], reviewLetters: ['E', 'T', 'A', 'O', 'I', 'N'], isReview: true },
  { id: 5, title: 'S & R', newLetters: ['S', 'R'], reviewLetters: ['E', 'T', 'A', 'O', 'I', 'N'], isReview: false },
  { id: 6, title: 'H & L', newLetters: ['H', 'L'], reviewLetters: ['E', 'T', 'A', 'O', 'I', 'N', 'S', 'R'], isReview: false },
  { id: 7, title: 'Review 4-6', newLetters: [], reviewLetters: ['E', 'T', 'A', 'O', 'I', 'N', 'S', 'R', 'H', 'L'], isReview: true },
  { id: 8, title: 'D & C', newLetters: ['D', 'C'], reviewLetters: ['E', 'T', 'A', 'O', 'I', 'N', 'S', 'R', 'H', 'L'], isReview: false },
  { id: 9, title: 'U & M', newLetters: ['U', 'M'], reviewLetters: ['E', 'T', 'A', 'O', 'I', 'N', 'S', 'R', 'H', 'L', 'D', 'C'], isReview: false },
  { id: 10, title: 'Review 7-9', newLetters: [], reviewLetters: ['E', 'T', 'A', 'O', 'I', 'N', 'S', 'R', 'H', 'L', 'D', 'C', 'U', 'M'], isReview: true },
  { id: 11, title: 'W & F', newLetters: ['W', 'F'], reviewLetters: ['E', 'T', 'A', 'O', 'I', 'N', 'S', 'R', 'H', 'L', 'D', 'C', 'U', 'M'], isReview: false },
  { id: 12, title: 'G & Y', newLetters: ['G', 'Y'], reviewLetters: ['E', 'T', 'A', 'O', 'I', 'N', 'S', 'R', 'H', 'L', 'D', 'C', 'U', 'M', 'W', 'F'], isReview: false },
  { id: 13, title: 'Review 10-12', newLetters: [], reviewLetters: ['E', 'T', 'A', 'O', 'I', 'N', 'S', 'R', 'H', 'L', 'D', 'C', 'U', 'M', 'W', 'F', 'G', 'Y'], isReview: true },
  { id: 14, title: 'P & B', newLetters: ['P', 'B'], reviewLetters: ['E', 'T', 'A', 'O', 'I', 'N', 'S', 'R', 'H', 'L', 'D', 'C', 'U', 'M', 'W', 'F', 'G', 'Y'], isReview: false },
  { id: 15, title: 'V & K', newLetters: ['V', 'K'], reviewLetters: ['E', 'T', 'A', 'O', 'I', 'N', 'S', 'R', 'H', 'L', 'D', 'C', 'U', 'M', 'W', 'F', 'G', 'Y', 'P', 'B'], isReview: false },
  { id: 16, title: 'Review 13-15', newLetters: [], reviewLetters: ['E', 'T', 'A', 'O', 'I', 'N', 'S', 'R', 'H', 'L', 'D', 'C', 'U', 'M', 'W', 'F', 'G', 'Y', 'P', 'B', 'V', 'K'], isReview: true },
  { id: 17, title: 'J & X', newLetters: ['J', 'X'], reviewLetters: ['E', 'T', 'A', 'O', 'I', 'N', 'S', 'R', 'H', 'L', 'D', 'C', 'U', 'M', 'W', 'F', 'G', 'Y', 'P', 'B', 'V', 'K'], isReview: false },
  { id: 18, title: 'Q & Z', newLetters: ['Q', 'Z'], reviewLetters: ['E', 'T', 'A', 'O', 'I', 'N', 'S', 'R', 'H', 'L', 'D', 'C', 'U', 'M', 'W', 'F', 'G', 'Y', 'P', 'B', 'V', 'K', 'J', 'X'], isReview: false },
  { id: 19, title: 'All Letters Review', newLetters: [], reviewLetters: LETTER_ORDER.slice(0, 26), isReview: true },
  { id: 20, title: 'Numbers 0-4', newLetters: ['0', '1', '2', '3', '4'], reviewLetters: LETTER_ORDER.slice(0, 10), isReview: false },
  { id: 21, title: 'Numbers 5-9', newLetters: ['5', '6', '7', '8', '9'], reviewLetters: ['0', '1', '2', '3', '4'], isReview: false },
  { id: 22, title: 'Final Review', newLetters: [], reviewLetters: [...LETTER_ORDER.slice(0, 26), '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], isReview: true },
];

export const getLesson = (id: number): LessonData | undefined => {
  return LESSONS.find(lesson => lesson.id === id);
};

export const getTotalLessons = (): number => LESSONS.length;
