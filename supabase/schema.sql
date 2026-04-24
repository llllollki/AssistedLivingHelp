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

alter type public.lead_status add value if not exists 'new';
alter type public.lead_status add value if not exists 'intake_in_progress';
alter type public.lead_status add value if not exists 'qualified';
alter type public.lead_status add value if not exists 'assigned';
alter type public.lead_status add value if not exists 'matching_in_progress';
alter type public.lead_status add value if not exists 'matched';
alter type public.lead_status add value if not exists 'closed_won';
alter type public.lead_status add value if not exists 'closed_lost';

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

alter type public.partner_status add value if not exists 'prospect';
alter type public.partner_status add value if not exists 'contacted';
alter type public.partner_status add value if not exists 'interested';
alter type public.partner_status add value if not exists 'meeting_scheduled';
alter type public.partner_status add value if not exists 'proposal_sent';
alter type public.partner_status add value if not exists 'negotiating';
alter type public.partner_status add value if not exists 'won';
alter type public.partner_status add value if not exists 'active';
alter type public.partner_status add value if not exists 'at_risk';
alter type public.partner_status add value if not exists 'churned';

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

alter type public.match_status add value if not exists 'suggested';
alter type public.match_status add value if not exists 'reviewed';
alter type public.match_status add value if not exists 'shared';
alter type public.match_status add value if not exists 'suppressed';
alter type public.match_status add value if not exists 'declined';

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

alter type public.interaction_type add value if not exists 'note';
alter type public.interaction_type add value if not exists 'sms';
alter type public.interaction_type add value if not exists 'email';
alter type public.interaction_type add value if not exists 'call';
alter type public.interaction_type add value if not exists 'share';
alter type public.interaction_type add value if not exists 'task';
alter type public.interaction_type add value if not exists 'status_change';

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

alter type public.appointment_status add value if not exists 'not_started';
alter type public.appointment_status add value if not exists 'requested';
alter type public.appointment_status add value if not exists 'options_received';
alter type public.appointment_status add value if not exists 'proposed_to_family';
alter type public.appointment_status add value if not exists 'confirmed';
alter type public.appointment_status add value if not exists 'reschedule_requested';
alter type public.appointment_status add value if not exists 'cancelled';
alter type public.appointment_status add value if not exists 'completed';
alter type public.appointment_status add value if not exists 'no_show';

create table if not exists public.staff_users (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.staff_users
  add column if not exists display_name text,
  add column if not exists role text,
  add column if not exists is_active boolean default true,
  add column if not exists created_at timestamptz default now();

create table if not exists public.launch_markets (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  hospital_anchor text not null,
  state text not null default 'CA',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.launch_markets
  add column if not exists slug text,
  add column if not exists name text,
  add column if not exists hospital_anchor text,
  add column if not exists state text default 'CA',
  add column if not exists is_active boolean default true,
  add column if not exists created_at timestamptz default now();

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

alter table public.alh_facilities
  add column if not exists source_facility_id text,
  add column if not exists source_dataset text default 'facilities_ca.sqlite',
  add column if not exists launch_market_id uuid references public.launch_markets(id),
  add column if not exists name text,
  add column if not exists address text,
  add column if not exists city text,
  add column if not exists state text default 'CA',
  add column if not exists zip text,
  add column if not exists county text,
  add column if not exists phone text,
  add column if not exists license_status text,
  add column if not exists care_category text,
  add column if not exists capacity integer,
  add column if not exists public_visibility boolean default true,
  add column if not exists preferred_contact_method text,
  add column if not exists partner_status public.partner_status default 'prospect',
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

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

alter table public.alh_facility_contacts
  add column if not exists facility_id uuid references public.alh_facilities(id) on delete cascade,
  add column if not exists contact_name text,
  add column if not exists title text,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists is_primary boolean default false,
  add column if not exists created_at timestamptz default now();

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

alter table public.leads
  add column if not exists launch_market_id uuid references public.launch_markets(id),
  add column if not exists assigned_staff_user_id uuid references public.staff_users(id),
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists preferred_contact_method text,
  add column if not exists relationship_to_resident text,
  add column if not exists desired_city text,
  add column if not exists move_in_timeframe text,
  add column if not exists general_care_category text,
  add column if not exists budget_min integer,
  add column if not exists budget_max integer,
  add column if not exists wants_scheduling_help boolean default false,
  add column if not exists status public.lead_status default 'new',
  add column if not exists attribution_channel text,
  add column if not exists attribution_campaign text,
  add column if not exists attribution_ad_set text,
  add column if not exists attribution_ad text,
  add column if not exists landing_page_variant text,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

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

alter table public.lead_profiles
  add column if not exists mobility_needs text,
  add column if not exists memory_care_needed boolean,
  add column if not exists medication_support_needed boolean,
  add column if not exists urgency text,
  add column if not exists freeform_preferences text,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

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

alter table public.consents
  add column if not exists lead_id uuid references public.leads(id) on delete cascade,
  add column if not exists consent_type text,
  add column if not exists channel text,
  add column if not exists consent_state text,
  add column if not exists consent_text_version text,
  add column if not exists sharing_scope text,
  add column if not exists granted_at timestamptz,
  add column if not exists revoked_at timestamptz,
  add column if not exists source_page text,
  add column if not exists ip_address text,
  add column if not exists user_agent text,
  add column if not exists created_at timestamptz default now();

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

alter table public.alh_matches
  add column if not exists lead_id uuid references public.leads(id) on delete cascade,
  add column if not exists facility_id uuid references public.alh_facilities(id) on delete cascade,
  add column if not exists score numeric(5,2),
  add column if not exists reason_summary text,
  add column if not exists status public.match_status default 'suggested',
  add column if not exists manually_overridden boolean default false,
  add column if not exists overridden_by_staff_user_id uuid references public.staff_users(id),
  add column if not exists created_at timestamptz default now();

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

alter table public.alh_interactions
  add column if not exists lead_id uuid references public.leads(id) on delete cascade,
  add column if not exists facility_id uuid references public.alh_facilities(id) on delete cascade,
  add column if not exists created_by_staff_user_id uuid references public.staff_users(id),
  add column if not exists interaction_type public.interaction_type,
  add column if not exists channel text,
  add column if not exists direction text,
  add column if not exists outcome text,
  add column if not exists body_summary text,
  add column if not exists due_at timestamptz,
  add column if not exists created_at timestamptz default now();

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

alter table public.alh_appointments
  add column if not exists lead_id uuid references public.leads(id) on delete cascade,
  add column if not exists facility_id uuid references public.alh_facilities(id) on delete cascade,
  add column if not exists appointment_type text,
  add column if not exists status public.appointment_status default 'not_started',
  add column if not exists proposed_at timestamptz,
  add column if not exists scheduled_for timestamptz,
  add column if not exists confirmed_at timestamptz,
  add column if not exists cancelled_at timestamptz,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

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
drop policy if exists "authenticated can read markets" on public.launch_markets;
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

-- ============================================================
-- Performance indexes
-- ============================================================

-- alh_interactions: facility timeline (partners page last-interaction
-- query and facility detail outreach feed both filter/sort by facility_id + created_at)
create index if not exists idx_alh_interactions_facility_created
  on public.alh_interactions (facility_id, created_at desc)
  where facility_id is not null;

-- alh_interactions: lead timeline (lead detail activity feed)
create index if not exists idx_alh_interactions_lead_created
  on public.alh_interactions (lead_id, created_at desc)
  where lead_id is not null;

-- alh_interactions: joint lead+facility lookup (appointment detail
-- activity feed filters on both columns)
create index if not exists idx_alh_interactions_lead_facility_created
  on public.alh_interactions (lead_id, facility_id, created_at desc)
  where lead_id is not null and facility_id is not null;

-- alh_matches: facility lookup (facility detail matched-leads query)
create index if not exists idx_alh_matches_facility_id
  on public.alh_matches (facility_id);

-- alh_appointments: lead and facility lookups
create index if not exists idx_alh_appointments_lead_id
  on public.alh_appointments (lead_id);

create index if not exists idx_alh_appointments_facility_id
  on public.alh_appointments (facility_id);

alter table public.consents
  add column if not exists captured_by_staff_user_id uuid references public.staff_users(id);

alter table public.consents
  add column if not exists consent_source text;

alter table public.consents
  add column if not exists consent_basis text;

create or replace function public.submit_public_intake(
  p_payload jsonb,
  p_ip_address text default null,
  p_user_agent text default null
)
returns table(lead_id uuid, market_slug text)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_variable
declare
  v_market_id uuid;
  v_market_slug text;
  v_lead_id uuid;
  v_now timestamptz := now();
  v_due_at timestamptz := now() + interval '4 hours';
  v_first_name text := nullif(trim(coalesce(p_payload->>'firstName', '')), '');
  v_last_name text := nullif(trim(coalesce(p_payload->>'lastName', '')), '');
  v_email text := nullif(trim(coalesce(p_payload->>'email', '')), '');
  v_phone text := nullif(trim(coalesce(p_payload->>'phone', '')), '');
  v_preferred_contact_method text := nullif(trim(coalesce(p_payload->>'preferredContactMethod', '')), '');
  v_relationship_to_resident text := nullif(trim(coalesce(p_payload->>'relationshipToResident', '')), '');
  v_launch_market_slug text := nullif(trim(coalesce(p_payload->>'launchMarketSlug', '')), '');
  v_desired_city text := nullif(trim(coalesce(p_payload->>'desiredCity', '')), '');
  v_move_in_timeframe text := nullif(trim(coalesce(p_payload->>'moveInTimeframe', '')), '');
  v_general_care_category text := nullif(trim(coalesce(p_payload->>'generalCareCategory', '')), '');
  v_budget_min integer := nullif(trim(coalesce(p_payload->>'budgetMin', '')), '')::integer;
  v_budget_max integer := nullif(trim(coalesce(p_payload->>'budgetMax', '')), '')::integer;
  v_wants_scheduling_help boolean := coalesce((p_payload->>'wantsSchedulingHelp')::boolean, false);
  v_consent_privacy boolean := coalesce((p_payload->>'consentPrivacyAcknowledgment')::boolean, false);
  v_consent_contact boolean := coalesce((p_payload->>'consentContactSupport')::boolean, false);
  v_consent_email boolean := coalesce((p_payload->>'consentEmail')::boolean, false);
  v_consent_sms boolean := coalesce((p_payload->>'consentSms')::boolean, false);
  v_consent_phone boolean := coalesce((p_payload->>'consentPhone')::boolean, false);
  v_consent_facility_sharing boolean := coalesce((p_payload->>'consentFacilitySharing')::boolean, false);
  v_attribution_channel text := nullif(trim(coalesce(p_payload->>'attributionChannel', '')), '');
  v_attribution_campaign text := nullif(trim(coalesce(p_payload->>'attributionCampaign', '')), '');
  v_attribution_ad_set text := nullif(trim(coalesce(p_payload->>'attributionAdSet', '')), '');
  v_attribution_ad text := nullif(trim(coalesce(p_payload->>'attributionAd', '')), '');
  v_landing_page_variant text := nullif(trim(coalesce(p_payload->>'landingPageVariant', '')), '');
begin
  if v_first_name is null or v_last_name is null then
    raise exception 'First and last name are required';
  end if;

  if v_email is null and v_phone is null then
    raise exception 'Email or phone is required';
  end if;

  if v_relationship_to_resident is null then
    raise exception 'Relationship to resident is required';
  end if;

  if v_launch_market_slug is null then
    raise exception 'Launch market is required';
  end if;

  if v_move_in_timeframe is null then
    raise exception 'Move-in timeframe is required';
  end if;

  if v_general_care_category is null then
    raise exception 'General care category is required';
  end if;

  if v_consent_privacy is not true then
    raise exception 'Privacy notice acknowledgment is required';
  end if;

  if v_consent_contact is not true then
    raise exception 'Service contact consent is required';
  end if;

  select id, slug
  into v_market_id, v_market_slug
  from public.launch_markets
  where slug = v_launch_market_slug
    and is_active = true
  limit 1;

  if v_market_id is null then
    raise exception 'Selected market could not be found';
  end if;

  insert into public.leads (
    launch_market_id,
    first_name,
    last_name,
    email,
    phone,
    preferred_contact_method,
    relationship_to_resident,
    desired_city,
    move_in_timeframe,
    general_care_category,
    budget_min,
    budget_max,
    wants_scheduling_help,
    status,
    attribution_channel,
    attribution_campaign,
    attribution_ad_set,
    attribution_ad,
    landing_page_variant
  )
  values (
    v_market_id,
    v_first_name,
    v_last_name,
    v_email,
    v_phone,
    v_preferred_contact_method,
    v_relationship_to_resident,
    v_desired_city,
    v_move_in_timeframe,
    v_general_care_category,
    v_budget_min,
    v_budget_max,
    v_wants_scheduling_help,
    'intake_in_progress',
    coalesce(v_attribution_channel, 'website'),
    v_attribution_campaign,
    v_attribution_ad_set,
    v_attribution_ad,
    v_landing_page_variant
  )
  returning id into v_lead_id;

  insert into public.consents (
    lead_id,
    consent_type,
    channel,
    consent_state,
    consent_text_version,
    sharing_scope,
    granted_at,
    source_page,
    ip_address,
    user_agent,
    consent_source,
    consent_basis
  )
  values
    (
      v_lead_id,
      'privacy_notice_acknowledgment',
      null,
      'granted',
      'mvp-v2',
      'intake_review',
      v_now,
      '/get-help',
      p_ip_address,
      p_user_agent,
      'website_form',
      'checkbox'
    ),
    (
      v_lead_id,
      'service_contact',
      'all',
      'granted',
      'mvp-v2',
      'matching_and_support',
      v_now,
      '/get-help',
      p_ip_address,
      p_user_agent,
      'website_form',
      'checkbox'
    ),
    (
      v_lead_id,
      'email',
      'email',
      case when v_consent_email then 'granted' else 'not_granted' end,
      'mvp-v2',
      'manual_follow_up',
      case when v_consent_email then v_now else null end,
      '/get-help',
      p_ip_address,
      p_user_agent,
      'website_form',
      'checkbox'
    ),
    (
      v_lead_id,
      'sms',
      'sms',
      case when v_consent_sms then 'granted' else 'not_granted' end,
      'mvp-v2',
      'manual_follow_up',
      case when v_consent_sms then v_now else null end,
      '/get-help',
      p_ip_address,
      p_user_agent,
      'website_form',
      'checkbox'
    ),
    (
      v_lead_id,
      'phone_call',
      'phone',
      case when v_consent_phone then 'granted' else 'not_granted' end,
      'mvp-v2',
      'manual_follow_up',
      case when v_consent_phone then v_now else null end,
      '/get-help',
      p_ip_address,
      p_user_agent,
      'website_form',
      'checkbox'
    ),
    (
      v_lead_id,
      'facility_sharing',
      null,
      case when v_consent_facility_sharing then 'granted' else 'not_granted' end,
      'mvp-v2',
      'selected_facility_coordination',
      case when v_consent_facility_sharing then v_now else null end,
      '/get-help',
      p_ip_address,
      p_user_agent,
      'website_form',
      'checkbox'
    );

  insert into public.alh_interactions (
    lead_id,
    interaction_type,
    outcome,
    body_summary,
    created_at
  )
  values (
    v_lead_id,
    'status_change',
    'Public intake submitted',
    'Lead moved into intake_in_progress after public intake submission.',
    v_now
  );

  insert into public.alh_interactions (
    lead_id,
    interaction_type,
    outcome,
    body_summary,
    due_at,
    created_at
  )
  values (
    v_lead_id,
    'task',
    'Review intake and confirm next step',
    'Review contact permissions, confirm triage needs, and decide whether facility sharing is allowed.',
    v_due_at,
    v_now
  );

  insert into public.alh_matches (
    lead_id,
    facility_id,
    score,
    reason_summary,
    status,
    manually_overridden,
    overridden_by_staff_user_id,
    created_at
  )
  select
    v_lead_id,
    ranked.id,
    ranked.score,
    ranked.reason_summary,
    'suggested',
    false,
    null,
    v_now
  from (
    select
      facility.id,
      least(
        95,
        50
        + case
            when v_desired_city is not null
             and facility.city is not null
             and lower(facility.city) = lower(v_desired_city)
            then 20 else 0
          end
        + case
            when v_general_care_category is not null
             and lower(v_general_care_category) <> 'unsure'
             and facility.care_category is not null
             and lower(facility.care_category) like '%' || lower(v_general_care_category) || '%'
            then 15 else 0
          end
        + case when v_budget_max is not null then 5 else 0 end
        + case when facility.capacity is not null then 3 else 0 end
      )::numeric(5,2) as score,
      concat_ws(
        '; ',
        'Same launch market',
        case
          when v_desired_city is not null
           and facility.city is not null
           and lower(facility.city) = lower(v_desired_city)
          then 'desired city match'
          else null
        end,
        case
          when v_general_care_category is not null
           and lower(v_general_care_category) <> 'unsure'
           and facility.care_category is not null
           and lower(facility.care_category) like '%' || lower(v_general_care_category) || '%'
          then 'care category aligned'
          else null
        end,
        case when facility.capacity is not null then 'licensed capacity available' else null end
      ) || '. Automated suggestion only until staff review.' as reason_summary
    from public.alh_facilities facility
    where facility.launch_market_id = v_market_id
      and facility.public_visibility = true
      and (
        v_general_care_category is null
        or lower(v_general_care_category) = 'unsure'
        or facility.care_category is null
        or lower(facility.care_category) like '%' || lower(v_general_care_category) || '%'
      )
    order by
      case
        when v_desired_city is not null
         and facility.city is not null
         and lower(facility.city) = lower(v_desired_city)
        then 0 else 1
      end,
      facility.name
    limit 3
  ) ranked
  on conflict on constraint alh_matches_lead_id_facility_id_key do nothing;

  return query
  select
    v_lead_id as lead_id,
    v_market_slug as market_slug;
end;
$$;

grant execute on function public.submit_public_intake(jsonb, text, text) to anon;
grant execute on function public.submit_public_intake(jsonb, text, text) to authenticated;

-- ============================================================
-- intake_rate_limits
-- Per-IP rate tracking for the public intake endpoint.
-- Only the service role writes/reads this table (bypasses RLS).
-- ============================================================

create table if not exists public.intake_rate_limits (
  ip            text        not null,
  window_start  timestamptz not null,
  attempt_count integer     not null default 1,
  updated_at    timestamptz not null default now(),
  primary key (ip, window_start)
);

alter table public.intake_rate_limits enable row level security;

-- No public policies — service role bypasses RLS; everyone else is blocked.

create index if not exists idx_intake_rate_limits_ip_window
  on public.intake_rate_limits (ip, window_start desc);

-- Atomically increment the attempt counter for an IP+window bucket and
-- return the new count. Called by the service-role client in the API route.
create or replace function public.check_and_increment_rate_limit(
  p_ip          text,
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
