import type { Settings as SettingsType } from '../types';

interface SettingsProps {
  settings: SettingsType;
  permission: NotificationPermission;
  onEnableNotifications: () => Promise<boolean>;
  onDisableNotifications: () => void;
  onSetReminderTime: (time: string) => void;
  onSendTestNotification: () => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export const Settings = ({
  settings,
  permission,
  onEnableNotifications,
  onDisableNotifications,
  onSetReminderTime,
  onSendTestNotification,
  onResetProgress,
  onClose,
}: SettingsProps) => {
  const handleNotificationToggle = async () => {
    if (settings.notificationsEnabled) {
      onDisableNotifications();
    } else {
      await onEnableNotifications();
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-slate-200"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      {/* Notifications Section */}
      <div className="bg-slate-800 rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Notifications</h2>

        {/* Enable/Disable toggle */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-medium">Daily Reminders</p>
            <p className="text-sm text-slate-400">
              {permission === 'denied'
                ? 'Notifications blocked by browser'
                : 'Get reminded to practice'}
            </p>
          </div>
          <button
            onClick={handleNotificationToggle}
            disabled={permission === 'denied'}
            className={`
              w-14 h-8 rounded-full transition-colors relative
              ${settings.notificationsEnabled ? 'bg-emerald-600' : 'bg-slate-600'}
              ${permission === 'denied' ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <div className={`
              w-6 h-6 rounded-full bg-white absolute top-1 transition-transform
              ${settings.notificationsEnabled ? 'translate-x-7' : 'translate-x-1'}
            `} />
          </button>
        </div>

        {/* Time picker */}
        {settings.notificationsEnabled && (
          <div className="mt-4 pt-4 border-t border-slate-700">
            <p className="text-sm text-slate-400 mb-3">Remind me at</p>
            <input
              type="time"
              value={settings.notificationTime}
              onChange={(e) => onSetReminderTime(e.target.value)}
              className="w-full py-2 px-4 rounded-lg bg-slate-700 text-slate-200
                         border border-slate-600 focus:border-amber-400 focus:outline-none
                         text-lg"
            />
          </div>
        )}

        {/* Test notification button */}
        {settings.notificationsEnabled && permission === 'granted' && (
          <button
            onClick={onSendTestNotification}
            className="mt-4 text-sm text-emerald-400 hover:text-emerald-300"
          >
            Send test notification
          </button>
        )}
      </div>

      {/* Danger Zone */}
      <div className="bg-slate-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4 text-red-400">Danger Zone</h2>
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
              onResetProgress();
            }
          }}
          className="w-full py-3 px-4 rounded-lg bg-red-900/50 text-red-300
                     hover:bg-red-900 transition-colors font-medium"
        >
          Reset All Progress
        </button>
        <p className="text-sm text-slate-500 mt-2">
          This will clear all lesson progress and streaks.
        </p>
      </div>

      {/* App Info */}
      <div className="mt-auto pt-8 text-center text-slate-500 text-sm">
        <p>Morse Code Trainer</p>
        <p className="mt-1">Learn morse code one letter at a time</p>
      </div>
    </div>
  );
};
