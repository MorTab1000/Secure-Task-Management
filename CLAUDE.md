# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an academic web security course assignment (Assignment 4) demonstrating XSS vulnerabilities and defenses. It is a full-stack notes application with a **React/Vite frontend**, an **Express/TypeScript backend**, and a **MongoDB** database. The project intentionally includes attack tooling (`attacker_server.js`, `keyloader-patload.txt`) and a toggleable HTML sanitizer to demonstrate XSS exploits and mitigations.

## Running the Project

All services must be started separately. There is no root-level dev script.

```bash
# Backend (runs on port 3001)
cd backend
npm install
npm run dev

# Frontend (runs on port 3000)
cd frontend
npm install
npm run dev

# Attacker server (runs on port 3002, for XSS demo only)
node attacker_server.js
```

The backend requires a `.env` file with `MONGODB_URI` and a JWT secret.

## Running Tests

```bash
# Frontend: Playwright E2E tests (requires both frontend and backend running)
cd frontend
npm test                    # runs all Playwright tests
npx playwright test --grep "name of test"   # run a single test

# Frontend: Jest unit tests (for the sanitizer)
cd frontend
npm run test:unit

# Backend: Jest tests
cd backend
npm test
```

Playwright tests are in `frontend/playwright-tests/test.spec.ts`. The root-level `playwright.config.ts` points to `./tests` (unused); the active config is `frontend/playwright.config.ts`.

## Architecture

### Backend (`backend/`)

Standard Express layered architecture:

- `server.ts` → loads `.env`, connects MongoDB, starts server
- `expressApp.ts` → configures Express with CORS (origin: `http://localhost:3000`), middleware, and routes
- `routes/` → mounts controllers; note routes apply `tokenExtractor` + `userExtractor` middleware for auth
- `controllers/` → handles HTTP; delegates to `services/`
- `services/` → business logic and Mongoose queries
- `models/` → Mongoose schemas for `User` and `Note`
- `middlewares/` → `tokenExtractor` (Bearer JWT → `req.token`), `userExtractor` (JWT verify → `req.user`), `logger`

Notes have dual access patterns: by MongoDB `_id` (`/notes/:id`) and by zero-based index (`/notes/by-index/:i`). Only POST/PUT/DELETE require auth; GET is public.

### Frontend (`frontend/src/`)

- **State management**: `NoteContext.tsx` uses `useReducer` with a 5-page LRU-style cache (`notesCache`). Pages are pre-fetched on `currentPage` changes.
- **Auth**: `AuthContext.tsx` stores the logged-in user (JWT token + `_id`) in context.
- **API**: `utils.ts` exports `apiRequest` (axios wrapper, base URL `http://localhost:3001/`) and `sanitizeHtml` (custom DOM-based HTML sanitizer).
- **Rich text / XSS demo**: Notes have an `isRichText` flag. When true, content is rendered via `dangerouslySetInnerHTML`. The `sanitizer` boolean in `NoteContext` state controls whether `sanitizeHtml()` is applied before rendering — toggled by a checkbox in the UI (`sanitizer_checkbox`).

### XSS / Security Demo

The sanitizer in `frontend/src/utils.ts` implements tag allowlisting, attribute allowlisting, event handler stripping (`on*`), dangerous URL protocol blocking (`javascript:`, `data:`, `vbscript:`), and style attribute removal.

The Playwright test suite in `frontend/playwright-tests/test.spec.ts` includes tests that explicitly:
1. Verify the sanitizer blocks `<script>` injection when ON
2. Demonstrate a keylogger XSS payload (`<img onerror=...>`) works when sanitizer is OFF, by injecting the payload from `keyloader-patload.txt` and verifying keystrokes reach `attacker_server.js` on port 3002

## Key Configuration

- Backend CORS is locked to `http://localhost:3000`
- JWT secret and MongoDB URI come from `backend/.env` (not committed)
- Frontend API base URL is hardcoded in `frontend/src/utils.ts` as `http://localhost:3001/`
- Notes per page: 10 (frontend) / configured in `backend/config/const.ts`
