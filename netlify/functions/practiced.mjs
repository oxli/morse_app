import { redis } from './_redis.mjs';

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

  const { timeZone } = body;

  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: timeZone || 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  await redis('SET', 'lastPracticed', today);

  return new Response(JSON.stringify({ ok: true, date: today }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const config = { path: '/api/practiced' };
