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
- Resend for email
- Twilio for SMS

## Local Setup

1. Install Node.js 20+ and npm.
2. Copy `.env.example` to `.env.local`.
3. Fill in Supabase and messaging credentials.
4. Install dependencies with `npm install`.
5. Run `npm run dev`.

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
- confirmation of whether you want email via Resend and SMS via Twilio for MVP
- GitHub repo URL if you want me to prepare for push/deploy wiring
