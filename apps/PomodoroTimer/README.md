# Pomodoro Timer

A small focus timer: React + Vite on the frontend, Express on the backend to store each saved session duration (in-memory; data is cleared when the server restarts).

## Layout

- `backend/` — `GET` / `POST` `/sessions`, default port **8001**
- `frontend/` — Web UI, Vite dev server, default port **5173**

## Run locally

1. Start the backend (install deps first):

   ```bash
   cd backend && npm install && npm run dev
   ```

2. In another terminal, start the frontend:

   ```bash
   cd frontend && npm install && npm run dev
   ```

3. Open the URL Vite prints (usually `http://localhost:5173`). The app calls `http://localhost:8001`; keep the backend running.

## Build the frontend

```bash
cd frontend && npm run build
```

Output is in `frontend/dist/`. Serve it with any static host; point the API to your backend URL or use a reverse proxy.

## Usage

- **Start / Stop** — Run or pause the timer (elapsed seconds count up).
- **Save** — POST the current elapsed seconds to the backend and reset the local timer.
