# APP3 Backend Log

**Date**: 2026-03-24
**Status**: ✅ COMPLETE (code) | ⏳ PENDING (deployment — requires auth)

## Architecture
- Express + Socket.io server
- TypeScript strict mode
- In-memory party/game state (Map-based)
- 3 complete game engines

## File Structure
```
server/
├── src/
│   ├── server.ts       — Main server (267 lines)
│   ├── parties.ts      — Room management (120 lines)
│   ├── chat.ts         — Message broadcast
│   ├── types.ts        — Shared interfaces
│   └── games/
│       ├── hippos.ts   — Tap game (120 lines)
│       ├── jeopardy.ts — Quiz game (130 lines)
│       └── trivia.ts   — Speed trivia (160 lines)
├── package.json
├── tsconfig.json
├── Dockerfile
├── Procfile
└── railway.toml
```

## Build Verification
```
cd server && npx tsc --noEmit
→ 0 errors
```

## Deployment Instructions
See BACKEND-DEPLOYMENT.md for step-by-step.
**Fastest path**: Railway (1-click from GitHub)
1. Go to railway.app → New Project → Deploy from GitHub
2. Select drprepperusa-org/game-hub → root dir: server
3. Env var: PORT=3001
4. Copy URL → set as PUBLIC_WS_URL in Vercel

## Socket.io Events
See server/src/server.ts lines 30-200 for full event handler implementation.

## Game State Notes
- Hippos: 60s timer, 10pts/tap, auto-spawn every 600ms
- Jeopardy: 7 questions, 30s each, 100pts correct
- Trivia: 10 questions, 10s each, speed-based 50-200pts
- All games: graceful stop on disconnect/game-end
