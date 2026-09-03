import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:morse-trainer@example.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

import { redis } from './_redis.mjs';

export default async () => {
  let subscriptionStr;
  try {
    subscriptionStr = await redis('GET', 'subscription');
  } catch (err) {
    console.error('test-push: redis read failed:', err);
    return new Response(JSON.stringify({ error: 'Failed to read subscription' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!subscriptionStr) {
    return new Response(JSON.stringify({ error: 'No subscription registered yet' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    await webpush.sendNotification(
      JSON.parse(subscriptionStr),
      JSON.stringify({
        title: 'Morse Code Trainer',
        body: 'Test notification — push is working!',
        icon: '/favicon.svg',
        tag: 'test',
      })
    );
  } catch (err) {
    console.error('test-push: send failed:', err);
    return new Response(JSON.stringify({ error: 'Failed to send push notification' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ sent: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const config = { path: '/api/test-push' };
