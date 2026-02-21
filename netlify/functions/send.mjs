import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:morse-trainer@example.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

const redis = async (command, ...args) => {
  const res = await fetch(process.env.UPSTASH_REDIS_REST_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([command, ...args]),
  });
  const data = await res.json();
  return data.result;
};

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
  const [enabled, subscriptionStr, notificationTime, timeZone, lastSent] =
    await Promise.all([
      redis('GET', 'notificationsEnabled'),
      redis('GET', 'subscription'),
      redis('GET', 'notificationTime'),
      redis('GET', 'timeZone'),
      redis('GET', 'lastSent'),
    ]);

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

  const currentTime = getCurrentTimeInZone(timeZone);
  if (!currentTime || currentTime !== notificationTime) {
    return new Response(JSON.stringify({ skipped: `not time (${currentTime})` }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const today = getTodayInZone(timeZone);
  if (lastSent === today) {
    return new Response(JSON.stringify({ skipped: 'already sent today' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

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

  await redis('SET', 'lastSent', today);

  return new Response(JSON.stringify({ sent: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const config = { schedule: '* * * * *' };
