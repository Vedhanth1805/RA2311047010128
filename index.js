const express = require('express');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const requestLogger = require('./logger');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const NOTIFICATION_API_URL = process.env.NOTIFICATION_API_URL || 'http://20.207.122.201/evaluation-service/notifications';
const AUTH_TOKEN = process.env.AUTH_TOKEN || '';

const typePriority = {
  Result: 1,
  Placement: 2,
  Event: 3,
};

function getPriority(notification) {
  return typePriority[notification.Type] || 99;
}

function parseTimestamp(timestamp) {
  const parsed = new Date(timestamp);
  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed;
}

function sortNotifications(notifications) {
  return notifications.slice().sort((a, b) => {
    const priorityDiff = getPriority(a) - getPriority(b);
    if (priorityDiff !== 0) return priorityDiff;

    const timeA = parseTimestamp(a.Timestamp);
    const timeB = parseTimestamp(b.Timestamp);
    return timeB - timeA;
  });
}

app.use(express.json());
app.use(requestLogger);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.get('/priority-notifications', async (req, res) => {
  const limit = Number(req.query.limit || 10);

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (AUTH_TOKEN) {
      headers.Authorization = `Bearer ${AUTH_TOKEN}`;
    }

    const response = await fetch(NOTIFICATION_API_URL, { headers });
    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: 'Failed to fetch notifications', details: text });
    }

    const payload = await response.json();
    const notifications = Array.isArray(payload.notifications) ? payload.notifications : [];
    const sorted = sortNotifications(notifications);

    res.json({
      count: sorted.length,
      limit,
      notifications: sorted.slice(0, limit),
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Campus notification microservice listening on port ${PORT}`);
  console.log(`Fetching notifications from: ${NOTIFICATION_API_URL}`);
});
