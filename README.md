# Assisted Living Help MVP

This repo contains the first MVP scaffold for Assisted Living Help:

- public landing pages and intake funnel
- internal operations dashboard shell
- Supabase schema for leads, facilities, matching, outreach, and appointments
- SQLite extraction script for the Phase 1 vetted facility subset

## Recommended Stack

- Next.js App Router
- TypeScript
- Supabase Auth + Postgres
- Google Workspace for MVP email operations
- Google Voice for MVP phone and SMS operations

## Local Setup

1. Install Node.js 20+ and npm.
2. Copy `.env.example` to `.env.local`.
3. Fill in Supabase and messaging credentials.
4. Install dependencies with `npm install`.
5. Run `npm run dev`.

## MVP Communications Plan

For Phase 1 MVP, family and facility communications should assume:

- Google Workspace as the primary email system
- Google Voice as the primary phone number and SMS workflow
- manual concierge follow-up as the default operating model

Do not assume a fully automated transactional email or SMS provider for MVP unless that decision changes later.

## MVP Scope

The scaffold is intentionally narrow:

- public homepage
- market pages
- guided intake page
- confirmation page
- internal dashboard pages for leads, facilities, partners, and schedule
- database schema and import script

## Database Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql`.
3. Run `supabase/seed.sql`.
4. Import Phase 1 facilities with `python scripts/extract_phase1_facilities.py`.

## What I Need From You

- Supabase project URL
- Supabase anon key
- Supabase service role key
- Supabase project ID
- confirmation of the Google Workspace inbox and Google Voice number to use for MVP communications
- GitHub repo URL if you want me to prepare for push/deploy wiring
