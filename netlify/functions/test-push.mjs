import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:morse-trainer@example.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

import { redis } from './_redis.mjs';

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
