const LOG_API = 'http://20.207.122.201/evaluation-service/logs';

async function getToken() {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
}

export async function Log(stack, level, pkg, message) {
  try {
    const token = await getToken();
    if (!token) return;

    await fetch(LOG_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        stack,
        level,
        package: pkg,
        message,
      }),
    });
  } catch {
    console.warn('Log dispatch failed silently');
  }
}
