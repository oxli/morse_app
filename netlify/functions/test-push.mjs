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

export default async () => {
  const subscriptionStr = await redis('GET', 'subscription');
  if (!subscriptionStr) {
    return new Response(JSON.stringify({ error: 'No subscription registered yet' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  await webpush.sendNotification(
    JSON.parse(subscriptionStr),
    JSON.stringify({
      title: 'Morse Code Trainer',
      body: 'Test notification — push is working!',
      icon: '/favicon.svg',
      tag: 'test',
    })
  );

  return new Response(JSON.stringify({ sent: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const config = { path: '/api/test-push' };
