create extension if not exists pgcrypto;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'lead_status' and n.nspname = 'public'
  ) then
    create type public.lead_status as enum (
      'new',
      'intake_in_progress',
      'qualified',
      'assigned',
      'matching_in_progress',
      'matched',
      'closed_won',
      'closed_lost'
    );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'partner_status' and n.nspname = 'public'
  ) then
    create type public.partner_status as enum (
      'prospect',
      'contacted',
      'interested',
      'meeting_scheduled',
      'proposal_sent',
      'negotiating',
      'won',
      'active',
      'at_risk',
      'churned'
    );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'match_status' and n.nspname = 'public'
  ) then
    create type public.match_status as enum (
      'suggested',
      'reviewed',
      'shared',
      'suppressed',
      'declined'
    );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'interaction_type' and n.nspname = 'public'
  ) then
    create type public.interaction_type as enum (
      'note',
      'sms',
      'email',
      'call',
      'share',
      'task',
      'status_change'
    );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'appointment_status' and n.nspname = 'public'
  ) then
    create type public.appointment_status as enum (
      'not_started',
      'requested',
      'options_received',
      'proposed_to_family',
      'confirmed',
      'reschedule_requested',
      'cancelled',
      'completed',
      'no_show'
    );
  end if;
end
$$;

create table if not exists public.staff_users (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.launch_markets (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  hospital_anchor text not null,
  state text not null default 'CA',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.alh_facilities (
  id uuid primary key default gen_random_uuid(),
  source_facility_id text unique,
  source_dataset text not null default 'facilities_ca.sqlite',
  launch_market_id uuid references public.launch_markets(id),
  name text not null,
  address text,
  city text,
  state text not null default 'CA',
  zip text,
  county text,
  phone text,
  license_status text,
  care_category text,
  capacity integer,
  public_visibility boolean not null default true,
  preferred_contact_method text,
  partner_status public.partner_status not null default 'prospect',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.alh_facility_contacts (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references public.alh_facilities(id) on delete cascade,
  contact_name text not null,
  title text,
  email text,
  phone text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  launch_market_id uuid references public.launch_markets(id),
  assigned_staff_user_id uuid references public.staff_users(id),
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  preferred_contact_method text,
  relationship_to_resident text,
  desired_city text,
  move_in_timeframe text,
  general_care_category text,
  budget_min integer,
  budget_max integer,
  wants_scheduling_help boolean not null default false,
  status public.lead_status not null default 'new',
  attribution_channel text,
  attribution_campaign text,
  attribution_ad_set text,
  attribution_ad text,
  landing_page_variant text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lead_profiles (
  lead_id uuid primary key references public.leads(id) on delete cascade,
  mobility_needs text,
  memory_care_needed boolean,
  medication_support_needed boolean,
  urgency text,
  freeform_preferences text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.consents (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  consent_type text not null,
  channel text,
  consent_state text not null,
  consent_text_version text,
  sharing_scope text,
  granted_at timestamptz,
  revoked_at timestamptz,
  source_page text,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

create table if not exists public.alh_matches (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  facility_id uuid not null references public.alh_facilities(id) on delete cascade,
  score numeric(5,2),
  reason_summary text,
  status public.match_status not null default 'suggested',
  manually_overridden boolean not null default false,
  overridden_by_staff_user_id uuid references public.staff_users(id),
  created_at timestamptz not null default now(),
  unique (lead_id, facility_id)
);

create table if not exists public.alh_interactions (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  facility_id uuid references public.alh_facilities(id) on delete cascade,
  created_by_staff_user_id uuid references public.staff_users(id),
  interaction_type public.interaction_type not null,
  channel text,
  direction text,
  outcome text,
  body_summary text,
  due_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.alh_appointments (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  facility_id uuid not null references public.alh_facilities(id) on delete cascade,
  appointment_type text not null,
  status public.appointment_status not null default 'not_started',
  proposed_at timestamptz,
  scheduled_for timestamptz,
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.staff_users enable row level security;
alter table public.launch_markets enable row level security;
alter table public.alh_facilities enable row level security;
alter table public.alh_facility_contacts enable row level security;
alter table public.leads enable row level security;
alter table public.lead_profiles enable row level security;
alter table public.consents enable row level security;
alter table public.alh_matches enable row level security;
alter table public.alh_interactions enable row level security;
alter table public.alh_appointments enable row level security;

-- ============================================================
-- RLS helper functions
-- SECURITY DEFINER lets these functions read staff_users
-- without triggering the policies they're used to enforce,
-- breaking the circular dependency.
-- ============================================================

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.staff_users su
    where su.id = auth.uid()
      and su.is_active = true
  )
$$;

create or replace function public.is_admin_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.staff_users su
    where su.id = auth.uid()
      and su.is_active = true
      and su.role = 'admin'
  )
$$;

-- ============================================================
-- staff_users
-- Any active staff member can read; only admins can write.
-- ============================================================
drop policy if exists "staff can read staff_users" on public.staff_users;
create policy "staff can read staff_users"
on public.staff_users for select
using (public.is_staff());

drop policy if exists "admin can manage staff_users" on public.staff_users;
create policy "admin can manage staff_users"
on public.staff_users for all
using (public.is_admin_staff())
with check (public.is_admin_staff());

-- ============================================================
-- launch_markets
-- Any authenticated user can read (needed for intake form and
-- public facility search). Only staff can write.
-- ============================================================
drop policy if exists "staff can read markets" on public.launch_markets;
create policy "authenticated can read markets"
on public.launch_markets for select
using (auth.role() = 'authenticated');

drop policy if exists "staff can write markets" on public.launch_markets;
create policy "staff can write markets"
on public.launch_markets for insert
with check (public.is_staff());

drop policy if exists "staff can update markets" on public.launch_markets;
create policy "staff can update markets"
on public.launch_markets for update
using (public.is_staff())
with check (public.is_staff());

-- ============================================================
-- alh_facilities
-- Staff: full access.
-- Public authenticated users: read-only on public_visibility=true rows.
-- RLS SELECT policies are OR'd, so staff see everything via the
-- staff policy; public users see only the visible subset.
-- ============================================================
drop policy if exists "staff can manage alh_facilities" on public.alh_facilities;
create policy "staff can manage alh_facilities"
on public.alh_facilities for all
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "public can browse visible facilities" on public.alh_facilities;
create policy "public can browse visible facilities"
on public.alh_facilities for select
using (
  auth.role() = 'authenticated'
  and public_visibility = true
);

-- ============================================================
-- alh_facility_contacts — staff only
-- ============================================================
drop policy if exists "staff can manage alh_facility_contacts" on public.alh_facility_contacts;
create policy "staff can manage alh_facility_contacts"
on public.alh_facility_contacts for all
using (public.is_staff())
with check (public.is_staff());

-- ============================================================
-- leads — staff only
-- ============================================================
drop policy if exists "staff can manage leads" on public.leads;
create policy "staff can manage leads"
on public.leads for all
using (public.is_staff())
with check (public.is_staff());

-- ============================================================
-- lead_profiles — staff only
-- ============================================================
drop policy if exists "staff can manage lead_profiles" on public.lead_profiles;
create policy "staff can manage lead_profiles"
on public.lead_profiles for all
using (public.is_staff())
with check (public.is_staff());

-- ============================================================
-- consents — staff only
-- (intake API writes consents via the service role client,
--  which bypasses RLS; this blocks public session reads)
-- ============================================================
drop policy if exists "staff can manage consents" on public.consents;
create policy "staff can manage consents"
on public.consents for all
using (public.is_staff())
with check (public.is_staff());

-- ============================================================
-- alh_matches — staff only
-- ============================================================
drop policy if exists "staff can manage alh_matches" on public.alh_matches;
create policy "staff can manage alh_matches"
on public.alh_matches for all
using (public.is_staff())
with check (public.is_staff());

-- ============================================================
-- alh_interactions — staff only
-- ============================================================
drop policy if exists "staff can manage alh_interactions" on public.alh_interactions;
create policy "staff can manage alh_interactions"
on public.alh_interactions for all
using (public.is_staff())
with check (public.is_staff());

-- ============================================================
-- alh_appointments — staff only
-- ============================================================
drop policy if exists "staff can manage alh_appointments" on public.alh_appointments;
create policy "staff can manage alh_appointments"
on public.alh_appointments for all
using (public.is_staff())
with check (public.is_staff());
