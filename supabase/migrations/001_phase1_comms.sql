-- Phase 1 comms migration
-- Adds: intake_rate_limits, outbound_comms, check_and_increment_rate_limit
-- Apply against your Supabase project via the SQL editor or CLI.

-- ============================================================
-- intake_rate_limits
-- ============================================================

create table if not exists public.intake_rate_limits (
  ip            text        not null,
  window_start  timestamptz not null,
  attempt_count integer     not null default 1,
  updated_at    timestamptz not null default now(),
  primary key (ip, window_start)
);

alter table public.intake_rate_limits enable row level security;

create index if not exists idx_intake_rate_limits_ip_window
  on public.intake_rate_limits (ip, window_start desc);

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

-- ============================================================
-- outbound_comms
-- ============================================================

create table if not exists public.outbound_comms (
  id                   uuid        primary key default gen_random_uuid(),
  lead_id              uuid        references public.leads(id) on delete cascade,
  channel              text        not null,
  recipient            text        not null,
  message_type         text        not null,
  attempted_at         timestamptz not null default now(),
  status               text        not null,
  provider_message_id  text,
  error_message        text,
  consent_source       text,
  consent_basis        text,
  consent_version      text
);

alter table public.outbound_comms enable row level security;

drop policy if exists "staff can read outbound_comms" on public.outbound_comms;
create policy "staff can read outbound_comms"
on public.outbound_comms for select
using (public.is_staff());

create index if not exists idx_outbound_comms_lead_id
  on public.outbound_comms (lead_id, attempted_at desc)
  where lead_id is not null;
