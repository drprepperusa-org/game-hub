# APP3 Parallel 2 — Game Logic (Hippos + Jeopardy)

**Agent**: Kayla (Subagent)
**Date**: 2026-03-24
**Status**: ✅ COMPLETE

## Files Created
- `server/src/games/hippos.ts` — Hippo Frenzy game logic
- `server/src/games/jeopardy.ts` — Jeopardy Quiz game logic

## Hippo Frenzy Logic
- Server spawns hippo targets every 600ms at random positions
- Auto-removes hippos after 3 seconds
- `handleTap()` validates hippo exists + not already popped
- Awards 10 pts per tap, broadcasts updated scores
- 60-second game timer with `stopHippos()` cleanup
- Game state includes: targets[], tappedBy map, timer refs

## Jeopardy Logic
- 7 shuffled questions from 10-question bank
- 30 seconds per question timer
- `handleAnswer()` records first answer per player
- Awards 100 pts for correct answers
- Auto-advance if all players answer before timer
- 3-second gap between questions
- Includes categories: Geography, Science, Art, Math, History, Animals, Literature

## Score Tracking
- `computeLeaderboard()` → sorted GameResult[] with ranks
- `getScores()` → Record<string, number> for broadcast
- `updatePlayerScore()` → direct mutation on party.players

## TypeScript Check
```
npx tsc --noEmit → 0 errors
```
