import { useState, useCallback } from 'react';
import { Home } from './components/Home';
import { Lesson } from './components/Lesson';
import { Settings } from './components/Settings';
import { useProgress } from './hooks/useProgress';
import { useNotifications } from './hooks/useNotifications';
import { getLesson } from './data/curriculum';

type View = 'home' | 'lesson' | 'settings';

function App() {
  const [view, setView] = useState<View>('home');
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);

  const {
    progress,
    isLoaded,
    completeLesson,
    resetProgress,
    isLessonUnlocked,
  } = useProgress();

  const {
    settings,
    permission,
    enableNotifications,
    disableNotifications,
    setReminderTime,
    sendTestNotification,
  } = useNotifications();

  const handleStartLesson = useCallback((lessonId: number) => {
    if (isLessonUnlocked(lessonId)) {
      setActiveLessonId(lessonId);
      setView('lesson');
    }
  }, [isLessonUnlocked]);

  const handleLessonComplete = useCallback((score: number, total: number) => {
    if (activeLessonId !== null) {
      // Consider lesson complete if score is at least 60%
      if (score / total >= 0.6) {
        completeLesson(activeLessonId);
      }
    }
    setView('home');
    setActiveLessonId(null);
  }, [activeLessonId, completeLesson]);

  const handleLessonExit = useCallback(() => {
    setView('home');
    setActiveLessonId(null);
  }, []);

  const handleResetProgress = useCallback(() => {
    resetProgress();
    setView('home');
  }, [resetProgress]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  if (view === 'lesson' && activeLessonId !== null) {
    const lesson = getLesson(activeLessonId);
    if (lesson) {
      return (
        <Lesson
          lesson={lesson}
          onComplete={handleLessonComplete}
          onExit={handleLessonExit}
        />
      );
    }
  }

  if (view === 'settings') {
    return (
      <Settings
        settings={settings}
        permission={permission}
        onEnableNotifications={enableNotifications}
        onDisableNotifications={disableNotifications}
        onSetReminderTime={setReminderTime}
        onSendTestNotification={sendTestNotification}
        onResetProgress={handleResetProgress}
        onClose={() => setView('home')}
      />
    );
  }

  return (
    <Home
      progress={progress}
      onStartLesson={handleStartLesson}
      onOpenSettings={() => setView('settings')}
    />
  );
}

export default App;
