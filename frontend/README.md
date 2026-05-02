# Campus Notifications Frontend

This is a React/Next.js frontend for the campus notifications application.

## Run locally

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

## Features

- `All Notifications` page shows all notifications from the API
- `Priority Notifications` page supports `limit` and `notification_type` filters
- New vs viewed notification state is persisted in `localStorage`
- Uses Material UI for responsive UI and consistency
- Error handling for API failures
