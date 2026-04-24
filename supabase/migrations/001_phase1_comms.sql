-- Phase 1 rate-limiting migration
-- Adds: intake_rate_limits table + check_and_increment_rate_limit function
-- Apply via the Supabase Dashboard SQL editor or the Supabase CLI.
--
-- Communications are manual for Phase 1 MVP:
--   Email — Google Workspace (staff sends manually, logs on the lead)
--   Phone/SMS — Google Voice (staff calls/texts manually, logs on the lead)
-- No automated delivery infrastructure is used.

-- ============================================================
-- intake_rate_limits
-- Per-IP 15-minute bucket counter for /api/intake.
-- Only the service role touches this table (bypasses RLS).
-- ============================================================

create table if not exists public.intake_rate_limits (
  ip            text        not null,
  window_start  timestamptz not null,
  attempt_count integer     not null default 1,
  updated_at    timestamptz not null default now(),
  primary key (ip, window_start)
);

alter table public.intake_rate_limits enable row level security;

-- No public policies — service role bypasses RLS; all other roles are blocked.

create index if not exists idx_intake_rate_limits_ip_window
  on public.intake_rate_limits (ip, window_start desc);

-- Atomically increments the counter and returns the new count.
create or replace function public.check_and_increment_rate_limit(
  p_ip           text,
  p_window_start timestamptz
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  insert into public.intake_rate_limits (ip, window_start, attempt_count, updated_at)
  values (p_ip, p_window_start, 1, now())
  on conflict (ip, window_start)
  do update set
    attempt_count = intake_rate_limits.attempt_count + 1,
    updated_at    = now()
  returning attempt_count into v_count;

  return coalesce(v_count, 1);
end;
$$;

grant execute on function public.check_and_increment_rate_limit(text, timestamptz)
  to service_role;
