# Frontend (Event List First)

This module contains the TypeScript + React + Tailwind frontend for the event registration system.

## Prerequisites

- Node.js 18+
- npm 9+ (or pnpm/yarn equivalent)

## Setup

1. Copy env values:
   - `cp .env.example .env`
2. Install dependencies:
   - `npm install`
3. Start development server:
   - `npm run dev`

## Build

- `npm run build`
- `npm run preview`

## Environment

- `VITE_API_BASE_URL` (default: `/api`)
  - Uses Vite proxy to API Gateway and avoids browser CORS issues in dev.
- `VITE_API_BASE_URLS` (optional fallback list)
  - Example: `/api,/event-api`
  - `/event-api` proxies directly to event-service.

## Dev proxy routes

- `/api/*` -> `http://localhost:8080/*` (gateway)
- `/event-api/*` -> `http://localhost:8082/*` (event-service)

## Implemented

- Event list route at `/events`
- Event filtering with backend query params:
  - `name` (search box)
  - `venue`
  - `minFee`
  - `maxFee`
- Routing structure with public and protected routes:
  - Public: `/`, `/events`, `/sign-in`, `/sign-up`
  - Protected: `/profile`
- Top navigation with Home, Events, Sign In, Sign Up, Profile icon
- Redux Toolkit store with auth slice foundation
- Toast-based API error handling
- Modern colorful Tailwind UI with animations:
  - gradient hero
  - full background image treatment
  - staggered event card entrance
  - hover micro-interactions
  - loading skeletons
