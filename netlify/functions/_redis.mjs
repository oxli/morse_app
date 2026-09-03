export const redis = async (command, ...args) => {
  const res = await fetch(process.env.UPSTASH_REDIS_REST_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([command, ...args]),
  });

  let data;
  try {
    data = await res.json();
  } catch (err) {
    throw new Error(`Redis ${command} failed: non-JSON response (HTTP ${res.status})`);
  }

  if (!res.ok || data.error) {
    throw new Error(`Redis ${command} failed: ${data.error ?? `HTTP ${res.status}`}`);
  }

  return data.result;
};
