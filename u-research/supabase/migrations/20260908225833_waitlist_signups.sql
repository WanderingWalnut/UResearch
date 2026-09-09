create table public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table public.waitlist_signups enable row level security;

revoke all on table public.waitlist_signups from anon, authenticated;
grant insert on table public.waitlist_signups to service_role;
