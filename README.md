# Campus Notification Microservice

This microservice fetches notifications from an upstream API and returns the top prioritized unread notifications.

## Features

- `GET /priority-notifications` returns notifications sorted by type priority and recency
- `GET /health` returns service health status
- Logging middleware records request method, path, response status, and duration

## Priority Rules

1. `Result`
2. `Placement`
3. `Event`
4. Newer notifications appear before older notifications within the same type

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file if you need custom settings:

   ```text
   PORT=4000
   NOTIFICATION_API_URL=http://20.207.122.201/evaluation-service/notifications
   AUTH_TOKEN=your_token_here
   ```

3. Start the service:

   ```bash
   npm start
   ```

## API Usage

- `GET /priority-notifications?limit=5`
- `GET /health`

## Notes

- The service assumes the external notification API returns JSON in the shape:
  ```json
  { "notifications": [ { "ID": "...", "Type": "Result", "Message": "...", "Timestamp": "..." } ] }
  ```
- If `AUTH_TOKEN` is configured, it is sent as a Bearer token.

## Frontend

A separate React/Next.js frontend has been added under `frontend/`.

To run the frontend:

```bash
cd frontend
npm install
npm run dev
```

The frontend supports:
- All Notifications view
- Priority Notifications view with `limit` and notification type filtering
- New vs viewed state persisted in `localStorage`
