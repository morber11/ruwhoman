# R U Who, Man?

*Who are you, Man?*

One-time CAPTCHA style link service. No login required

Someone added me on Discord and I had no idea who they were so I made this to check if they're actually a human and not a bot. Only does basic maths as an approximation of a CAPTCHA for now (which any bot can easily break) but I'll add some fancy ones later

Experimenting with a monorepo + nest.js for backend

## Stack

- **Frontend:** TypeScript + React + Vite
  - Vertical slice architecture separated into features
  - Shared API in `src/api/client.ts` using Tanstack for queries
- **Backend:** TypeScript + NestJS + PostgreSQL
  - Modular NestJS structure
  - TypeORM migrations for schema changes
  - CRON job runs at midnight to clean up expired challenges

Both are using Jest for tests

## Environment

Create `backend/.env` and `frontend/.env` before running. See example files (`.env.example`)

**`backend/.env`**

- `DATABASE_URL` - PostgreSQL connection string, default `postgres://postgres:password@localhost:5432/ruwhoman`
- `PORT` - API server port, default `3001`
- `FRONTEND_URL` - Frontend origin for CORS, default `http://localhost:5173`

**`frontend/.env`**

- `VITE_API_URL` - Backend API base URL, default `http://localhost:3001/api`

## Quick start

```bash
# Database - postgres for now
createdb ruwhoman

# Backend
cd backend && npm install && npm run migration:run && npm run start:dev

# Frontend
cd frontend && npm install && npm run dev
```
