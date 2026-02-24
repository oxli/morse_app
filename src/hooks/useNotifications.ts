import { useState, useEffect, useCallback } from 'react';
import type { Settings } from '../types';

const SETTINGS_KEY = 'morse-settings';
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;

const defaultSettings: Settings = {
  notificationsEnabled: false,
  notificationTime: '09:00',
};

const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
};

const registerPushSubscription = async (time: string): Promise<void> => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !VAPID_PUBLIC_KEY) return;
  try {
    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }
    await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        notificationTime: time,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        enabled: true,
      }),
    });
  } catch (err) {
    console.error('Push subscription failed:', err);
  }
};

const unregisterPushSubscription = async (): Promise<void> => {
  try {
    await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: false }),
    });
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) await subscription.unsubscribe();
    }
  } catch (err) {
    console.error('Push unsubscription failed:', err);
  }
};

export const useNotifications = () => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    const stored = localStorage.getItem(SETTINGS_KEY);
    let parsed = defaultSettings;
    if (stored) {
      try {
        parsed = JSON.parse(stored);
        if (!parsed.notificationTime) parsed.notificationTime = '09:00';
        setSettings(parsed);
      } catch {
        setSettings(defaultSettings);
      }
    }
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // On iOS, the PWA has a different push endpoint than Safari.
    // Re-register on every PWA launch to ensure Redis has the correct subscription.
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as { standalone?: boolean }).standalone === true;
    if (
      isStandalone &&
      parsed.notificationsEnabled &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      registerPushSubscription(parsed.notificationTime);
    }
  }, []);

  const saveSettings = useCallback((newSettings: Settings) => {
    setSettings(newSettings);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') {
      setPermission('granted');
      return true;
    }
    if (Notification.permission !== 'denied') {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    }
    return false;
  }, []);

  const enableNotifications = useCallback(async () => {
    const granted = await requestPermission();
    if (granted) {
      saveSettings({ ...settings, notificationsEnabled: true });
      await registerPushSubscription(settings.notificationTime);
    }
    return granted;
  }, [requestPermission, saveSettings, settings]);

  const disableNotifications = useCallback(() => {
    saveSettings({ ...settings, notificationsEnabled: false });
    unregisterPushSubscription();
  }, [saveSettings, settings]);

  const setReminderTime = useCallback(async (time: string) => {
    saveSettings({ ...settings, notificationTime: time });
    if (settings.notificationsEnabled) {
      await registerPushSubscription(time);
    }
  }, [saveSettings, settings]);

  const sendTestNotification = useCallback(async () => {
    await fetch('/api/test-push');
  }, []);

  return {
    settings,
    permission,
    requestPermission,
    enableNotifications,
    disableNotifications,
    setReminderTime,
    sendTestNotification,
  };
};
