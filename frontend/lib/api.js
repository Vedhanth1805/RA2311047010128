const AUTH_API = 'http://20.207.122.201/evaluation-service/auth';
const NOTIF_API = 'http://20.207.122.201/evaluation-service/notifications';

const credentials = {
  email: process.env.NEXT_PUBLIC_EMAIL || '',
  name: process.env.NEXT_PUBLIC_NAME || '',
  rollNo: process.env.NEXT_PUBLIC_ROLL_NO || '',
  accessCode: process.env.NEXT_PUBLIC_ACCESS_CODE || '',
  clientID: process.env.NEXT_PUBLIC_CLIENT_ID || '',
  clientSecret: process.env.NEXT_PUBLIC_CLIENT_SECRET || '',
};

const DEMO_NOTIFICATIONS = [
  {
    ID: 'a1b2c3d4-0001-4abc-8def-111111111111',
    Type: 'Placement',
    Message: 'Amazon is hiring — Software Development Engineer (SDE-1). Apply before May 15.',
    Timestamp: '2026-05-02 10:30:00',
  },
  {
    ID: 'a1b2c3d4-0002-4abc-8def-222222222222',
    Type: 'Placement',
    Message: 'Google is recruiting for Associate Software Engineer role. Drive on May 20 at SRM campus.',
    Timestamp: '2026-05-02 09:45:00',
  },
  {
    ID: 'a1b2c3d4-0003-4abc-8def-333333333333',
    Type: 'Placement',
    Message: 'Infosys hiring for Systems Engineer. Registration open on placement portal now.',
    Timestamp: '2026-05-01 18:00:00',
  },
  {
    ID: 'a1b2c3d4-0004-4abc-8def-444444444444',
    Type: 'Placement',
    Message: 'Wipro is conducting a recruitment drive for B.Tech 2026 batch. Eligible branches: CSE, ECE, IT.',
    Timestamp: '2026-05-01 14:20:00',
  },
  {
    ID: 'a1b2c3d4-0005-4abc-8def-555555555555',
    Type: 'Event',
    Message: 'Cultural Fiesta 2026 — Annual cultural fest at SRM TP Auditorium on May 10, 2026. All students welcome.',
    Timestamp: '2026-05-02 08:00:00',
  },
  {
    ID: 'a1b2c3d4-0006-4abc-8def-666666666666',
    Type: 'Event',
    Message: 'Tech Symposium — Paper presentations and project expo at SRM TP Audi, May 12. Register by May 8.',
    Timestamp: '2026-05-01 16:30:00',
  },
  {
    ID: 'a1b2c3d4-0007-4abc-8def-777777777777',
    Type: 'Event',
    Message: 'Farewell ceremony for 2026 graduating batch. Venue: SRM TP Auditorium, May 18 at 10 AM.',
    Timestamp: '2026-05-01 10:00:00',
  },
  {
    ID: 'a1b2c3d4-0008-4abc-8def-888888888888',
    Type: 'Result',
    Message: 'Semester 6 results declared. Check your portal for grade details.',
    Timestamp: '2026-05-02 11:00:00',
  },
  {
    ID: 'a1b2c3d4-0009-4abc-8def-999999999999',
    Type: 'Result',
    Message: 'Mid-term project review scores published. Contact your faculty for re-evaluation requests.',
    Timestamp: '2026-05-01 09:00:00',
  },
  {
    ID: 'a1b2c3d4-0010-4abc-8def-aaaaaaaaaaaa',
    Type: 'Result',
    Message: 'External lab exam results are now available on the student portal.',
    Timestamp: '2026-04-30 17:30:00',
  },
  {
    ID: 'a1b2c3d4-0011-4abc-8def-bbbbbbbbbbbb',
    Type: 'Placement',
    Message: 'Microsoft hiring for software engineering intern roles (2026 batch). Apply through placement cell.',
    Timestamp: '2026-04-30 15:00:00',
  },
  {
    ID: 'a1b2c3d4-0012-4abc-8def-cccccccccccc',
    Type: 'Event',
    Message: 'Hackathon 2026 — 24-hour coding challenge at SRM TP. Prizes worth ₹1,00,000. Register now.',
    Timestamp: '2026-04-30 12:00:00',
  },
];

let cachedToken = null;
let tokenExpiry = 0;

async function getAuthToken() {
  const now = Math.floor(Date.now() / 1000);

  if (cachedToken && tokenExpiry > now + 60) return cachedToken;

  if (typeof window !== 'undefined') {
    const stored = sessionStorage.getItem('campus_token');
    const storedExpiry = parseInt(sessionStorage.getItem('campus_token_expiry') || '0', 10);
    if (stored && storedExpiry > now + 60) {
      cachedToken = stored;
      tokenExpiry = storedExpiry;
      return cachedToken;
    }
  }

  const hasCredentials = credentials.email && credentials.clientID && credentials.clientSecret;
  if (!hasCredentials) return null;

  const res = await fetch(AUTH_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!res.ok) return null;

  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiry = data.expires_in || now + 3600;

  if (typeof window !== 'undefined') {
    sessionStorage.setItem('campus_token', cachedToken);
    sessionStorage.setItem('campus_token_expiry', String(tokenExpiry));
    localStorage.setItem('auth_token', cachedToken);
  }

  return cachedToken;
}

export async function fetchNotifications(params = {}) {
  try {
    const token = await getAuthToken();

    if (!token) {
      return filterDemo(params);
    }

    const url = new URL(NOTIF_API);
    if (params.limit) url.searchParams.set('limit', String(params.limit));
    if (params.page) url.searchParams.set('page', String(params.page));
    if (params.notification_type) url.searchParams.set('notification_type', params.notification_type);

    const res = await fetch(url.toString(), {
      cache: 'no-store',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return filterDemo(params);

    const body = await res.json();
    const items = Array.isArray(body.notifications) ? body.notifications : [];
    return items.length > 0 ? items : filterDemo(params);
  } catch {
    return filterDemo(params);
  }
}

function filterDemo(params = {}) {
  let items = [...DEMO_NOTIFICATIONS];
  if (params.notification_type) {
    items = items.filter((n) => n.Type === params.notification_type);
  }
  if (params.limit) {
    items = items.slice(0, Number(params.limit));
  }
  return items;
}
