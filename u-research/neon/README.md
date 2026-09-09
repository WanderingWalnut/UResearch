# Waitlist database

The landing waitlist uses Neon Postgres through a server action. Auth sessions stay on Supabase.

Set `DATABASE_URL` in `u-research/.env.local` for local development (Next.js does not load a root `.env.local`). Use the pooled connection string. Never prefix it with `NEXT_PUBLIC_`.

Apply SQL migrations with the direct `DATABASE_URL_UNPOOLED` connection. The waitlist insert uses the pooled `DATABASE_URL`.
