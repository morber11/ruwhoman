# R U Who, Man?

*Who are you, Man?*

One-time CAPTCHA style link service. No login required

Someone added me on Discord and I had no idea who they were so I made this to check if they're actually a human and not a bot. Only does basic maths as an approximation of a CAPTCHA for now (which any bot can easily break) but I'll add some fancy ones later

Experimenting with a monorepo using Turborepo. React frontend / Nest.js backend

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

Create `apps/api/.env` and `apps/web/.env` before running. See example files (`.env.example`)

**`apps/api/.env`**

- `DATABASE_URL` - PostgreSQL connection string, default `postgres://postgres:password@localhost:5432/ruwhoman`
- `PORT` - API server port, default `3001`
- `FRONTEND_URL` - Frontend origin for CORS, default `http://localhost:5173`

**`apps/web/.env`**

- `VITE_API_URL` - Backend API base URL, default `http://localhost:3001/api`

## Quick start

```bash
# Database - postgres for now
createdb ruwhoman

# Install all dependencies from root
npm install

# Run migrations
npm run migration:run -w apps/api

# Start both apps with Turborepo
npm run dev

# Or start individually
npm run start:dev -w apps/api
npm run dev -w apps/web
```

Almost every script is run with `--env-mode=loose` because Turbo 2 freaks out at global env vars
