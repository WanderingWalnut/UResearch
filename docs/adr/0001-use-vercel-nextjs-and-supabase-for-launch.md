# Use Vercel, Next.js, and Supabase for launch

UResearch will launch as a Next.js application on Vercel with Supabase providing Postgres, Auth, Realtime, vector-search storage, Queues, and Edge Functions. We chose this over `Vercel + Neon + QStash` or an all-Vercel backend because speed and low operational burden matter more than perfect vendor isolation for the UCalgary-only launch.

## Consequences

- The launch stack has fewer services to wire together.
- Supabase becomes the center of persistence, realtime UI state, and background queue processing.
- If Supabase Queue or Edge Function limits become painful, the first migration path is QStash plus Vercel Functions, not a dedicated worker host.
