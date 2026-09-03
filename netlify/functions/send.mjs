import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:morse-trainer@example.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

import { redis } from './_redis.mjs';

const getCurrentTimeInZone = (timeZone) => {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(new Date());
    const hour = parts.find(p => p.type === 'hour')?.value ?? '00';
    const minute = parts.find(p => p.type === 'minute')?.value ?? '00';
    return `${(hour === '24' ? '00' : hour).padStart(2, '0')}:${minute.padStart(2, '0')}`;
  } catch {
    return null;
  }
};

const getTodayInZone = (timeZone) => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date()); // returns "YYYY-MM-DD"
};

export default async () => {
  let enabled, subscriptionStr, notificationTime, timeZone, lastSent, lastPracticed;
  try {
    [enabled, subscriptionStr, notificationTime, timeZone, lastSent, lastPracticed] =
      await Promise.all([
        redis('GET', 'notificationsEnabled'),
        redis('GET', 'subscription'),
        redis('GET', 'notificationTime'),
        redis('GET', 'timeZone'),
        redis('GET', 'lastSent'),
        redis('GET', 'lastPracticed'),
      ]);
  } catch (err) {
    console.error('send: redis read failed:', err);
    return new Response(JSON.stringify({ error: 'Failed to read notification state' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (enabled !== 'true') {
    return new Response(JSON.stringify({ skipped: 'disabled' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!subscriptionStr || !notificationTime || !timeZone) {
    return new Response(JSON.stringify({ skipped: 'not configured' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Runs on a 15-minute schedule, so an exact-minute match would miss the
  // reminder most days. Instead fire on the first tick at or after the
  // target time; the lastSent-today check below stops it firing again on
  // later ticks the same day.
  const currentTime = getCurrentTimeInZone(timeZone);
  if (!currentTime || currentTime < notificationTime) {
    return new Response(JSON.stringify({ skipped: `not time yet (${currentTime})` }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const today = getTodayInZone(timeZone);
  if (lastSent === today) {
    return new Response(JSON.stringify({ skipped: 'already sent today' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (lastPracticed === today) {
    return new Response(JSON.stringify({ skipped: 'already practiced today' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const subscription = JSON.parse(subscriptionStr);
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: 'Morse Code Trainer',
        body: 'Time to practice! Keep your streak going.',
        icon: '/favicon.svg',
        tag: 'daily-reminder',
      })
    );
  } catch (err) {
    console.error('send: push send failed:', err);
    return new Response(JSON.stringify({ error: 'Failed to send push notification' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    await redis('SET', 'lastSent', today);
  } catch (err) {
    // Notification already went out; log loudly since a failure here means
    // the user may get duplicate pushes on the next run(s).
    console.error('send: failed to record lastSent after successful push:', err);
  }

  return new Response(JSON.stringify({ sent: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const config = { schedule: '*/15 * * * *' };
