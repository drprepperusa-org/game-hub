# Game Hub — Backend Deployment Guide

The backend is a Node.js + Express + Socket.io WebSocket server located in `server/`.

## Option A: Railway (Recommended — Free tier, WebSocket support)

1. Install Railway CLI: `brew install railway` / `npm i -g @railway/cli`
2. Login: `railway login`
3. From the `server/` directory:
   ```bash
   cd server
   railway init
   railway up
   ```
4. Set environment variable: `PORT=3001`
5. Get your URL from Railway dashboard → copy it
6. Set Vercel env var: `PUBLIC_WS_URL=https://your-app.railway.app`

## Option B: Render (Free tier)

1. Go to https://render.com → New Web Service
2. Connect GitHub repo: `drprepperusa-org/game-hub`
3. Root directory: `server`
4. Build command: `npm install && npm run build`
5. Start command: `npm start`
6. Environment: `PORT=3001`
7. Copy the Render URL → set as `PUBLIC_WS_URL` in Vercel

## Option C: Fly.io

```bash
cd server
flyctl auth login
flyctl launch --name game-hub-server
flyctl deploy
```

## Option D: Local development

```bash
cd server
npm install
npm run dev   # ts-node-dev with auto-reload
```

Server runs on http://localhost:3001

## Frontend ↔ Backend Configuration

Update `PUBLIC_WS_URL` in Vercel:
```
vercel env add PUBLIC_WS_URL production
# Enter: https://your-backend-url.com
```

Then redeploy frontend:
```bash
vercel deploy --prod
```

## WebSocket Events Summary

**Client → Server:**
- `join-party` (roomCode, username, avatar)
- `leave-party`
- `start-game` (gameType: 'hippos' | 'jeopardy' | 'trivia')
- `game-action` (action, data)
- `send-message` (text, username, avatar)
- `ready`

**Server → Client:**
- `player-joined` (players[], roomCode)
- `player-left` (players[], leftId)
- `game-started` (gameType, state)
- `game-state-update` (scores, state, timeRemaining)
- `game-ended` (results, leaderboard)
- `message` (id, username, text, timestamp, avatar)
- `error` (message)

## Health Check

The server exposes:
- `GET /` → `{ status: 'ok', game: 'Game Hub Server' }`
- `GET /health` → `{ status: 'ok' }`

## Notes on WebSocket Deployment

**Important**: Socket.io requires **sticky sessions** on platforms with multiple instances. For single-instance deployments (Railway free, Render free), this is not an issue.

For multi-instance deployments, add Redis adapter:
```bash
npm install @socket.io/redis-adapter ioredis
```
