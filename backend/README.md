# Backend

This folder contains the separate Supabase-backed API for orders and reviews.

## Environment

Copy `backend/.env.example` to `.env` and fill in:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `FRONTEND_URL`
- `PORT`

## Database

Run `backend/supabase/schema.sql` in your Supabase SQL editor to create the required tables.

## Scripts

From the `backend` folder:
- `pnpm install`
- `pnpm dev`
- `pnpm build`
- `pnpm start`
