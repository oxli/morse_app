import { useMemo } from 'react';
import type { Progress } from '../types';
import { LESSONS, getTotalLessons } from '../data/curriculum';
import { isStreakActive } from '../utils/streak';

interface HomeProps {
  progress: Progress;
  onStartLesson: (lessonId: number) => void;
  onOpenSettings: () => void;
}

export const Home = ({ progress, onStartLesson, onOpenSettings }: HomeProps) => {
  const nextLesson = useMemo(() => {
    return LESSONS.find(l => l.id === progress.currentLesson) || LESSONS[0];
  }, [progress.currentLesson]);

  const streakActive = isStreakActive(progress.lastLessonDate);
  const completedCount = progress.completedLessons.length;
  const totalLessons = getTotalLessons();
  const progressPercentage = Math.round((completedCount / totalLessons) * 100);

  return (
    <div className="min-h-screen flex flex-col">
    <div className="flex-1 flex flex-col w-full max-w-lg mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Morse Code</h1>
        <button
          onClick={onOpenSettings}
          className="p-2 text-slate-400 hover:text-slate-200"
          aria-label="Settings"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Streak Card */}
      <div className="bg-gradient-to-br from-amber-600 to-orange-700 rounded-xl p-3 mb-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-amber-100 text-xs mb-0.5">Current Streak</p>
            <p className="text-2xl font-bold text-white">
              {progress.currentStreak}
              <span className="text-sm ml-1">
                {progress.currentStreak === 1 ? 'day' : 'days'}
              </span>
            </p>
            {progress.longestStreak > progress.currentStreak && (
              <p className="text-amber-200 text-xs mt-0.5">
                Best: {progress.longestStreak} days
              </p>
            )}
            {!streakActive && progress.currentStreak > 0 && (
              <p className="text-amber-200 text-xs mt-0.5">Practice today to keep it!</p>
            )}
          </div>
          <div className="text-4xl">
            {streakActive ? '🔥' : '💤'}
          </div>
        </div>
      </div>

      {/* Progress Card */}
      <div className="bg-slate-800 rounded-xl p-3 mb-4">
        <div className="flex justify-between items-center mb-2">
          <p className="text-slate-300 text-sm">Overall Progress</p>
          <p className="text-slate-400 text-xs">
            {completedCount} / {totalLessons} lessons
          </p>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Start Lesson Button */}
      <button
        onClick={() => onStartLesson(nextLesson.id)}
        className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl p-6 mb-6
                   transition-colors shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div className="text-left">
            <p className="text-emerald-100 text-sm mb-1">
              {progress.completedLessons.includes(nextLesson.id) ? 'Continue' : 'Next Lesson'}
            </p>
            <p className="text-xl font-bold">
              Lesson {nextLesson.id}: {nextLesson.title}
            </p>
          </div>
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </button>

      {/* Lesson List */}
      <div className="flex-1">
        <h2 className="text-lg font-semibold mb-4">All Lessons</h2>
        <div className="space-y-2">
          {LESSONS.map((lesson) => {
            const isCompleted = progress.completedLessons.includes(lesson.id);
            const isUnlocked = lesson.id <= progress.currentLesson;
            const isCurrent = lesson.id === nextLesson.id;

            return (
              <button
                key={lesson.id}
                onClick={() => isUnlocked && onStartLesson(lesson.id)}
                disabled={!isUnlocked}
                className={`
                  w-full text-left p-4 rounded-xl transition-colors
                  ${isCurrent ? 'bg-slate-700 ring-2 ring-emerald-500' :
                    isCompleted ? 'bg-slate-800' :
                    isUnlocked ? 'bg-slate-800 hover:bg-slate-700' :
                    'bg-slate-800/50 opacity-50 cursor-not-allowed'}
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                      ${isCompleted ? 'bg-emerald-600 text-white' :
                        isUnlocked ? 'bg-slate-600 text-slate-300' :
                        'bg-slate-700 text-slate-500'}
                    `}>
                      {isCompleted ? '✓' : lesson.id}
                    </div>
                    <div>
                      <p className={`font-medium ${!isUnlocked && 'text-slate-500'}`}>
                        {lesson.title}
                      </p>
                      <p className="text-sm text-slate-500">
                        {lesson.isReview ? 'Review' :
                          lesson.newLetters.length > 0 ?
                            `New: ${lesson.newLetters.join(', ')}` :
                            'Practice'}
                      </p>
                    </div>
                  </div>
                  {!isUnlocked && (
                    <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
    </div>
  );
};
