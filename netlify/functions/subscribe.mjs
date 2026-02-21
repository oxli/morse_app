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

export default async (request) => {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const { subscription, notificationTime, timeZone, enabled } = body;

  if (enabled === false) {
    await redis('SET', 'notificationsEnabled', 'false');
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!subscription?.endpoint || !notificationTime || !timeZone) {
    return new Response('Missing required fields', { status: 400 });
  }

  await Promise.all([
    redis('SET', 'subscription', JSON.stringify(subscription)),
    redis('SET', 'notificationTime', notificationTime),
    redis('SET', 'timeZone', timeZone),
    redis('SET', 'notificationsEnabled', 'true'),
  ]);

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const config = { path: '/api/subscribe' };
