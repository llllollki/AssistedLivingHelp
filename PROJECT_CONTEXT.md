# Assisted Living Help

## Purpose

Build `Assisted Living Help`, a lead generation and placement-support platform for assisted living focused on selected California launch markets first, with the ability to expand across California and later across the United States.

The Phase 1 product should operate primarily as a guided matching and scheduling service, not just a gated directory.

The platform should have:

- A public-facing website and landing pages for paid social and local search traffic
- A guided questionnaire that captures lead information and care needs
- An automated confirmation flow that tells the family what happens next
- A backend application for lead management, matching, outreach, scheduling, and concierge follow-up
- A business development workflow for recruiting and managing facility partners
- A data layer backed initially by `facilities_ca.sqlite`

## Recommended Product Positioning

The MVP should be framed as a concierge-style assisted living matching service for defined hospital-centered markets.

Primary promise to the lead:

- tell us about your needs
- get matched with likely-fit facilities
- receive help scheduling calls or tours
- stay informed by SMS, email, and phone as needed

Secondary experience:

- signed-in or identified users may browse the vetted facility subset
- facility browsing supports trust and research, but it should not be the main conversion requirement for paid social traffic

Provider-side business goal:

- recruit assisted living facilities in the supported launch markets
- convert them into paying listing partners
- offer premium add-ons that increase visibility and operational support
- create a repeatable local-market business development motion

## Marketing And Acquisition Strategy

Phase 1 acquisition is expected to begin with Meta and other social ads targeting people looking for assisted care in the supported launch markets.

Recommended acquisition flow:

1. User clicks a Meta/social ad or a local landing page
2. User lands on a market-specific page tied to a hospital-centered service area
3. User completes a short guided questionnaire
4. User submits contact information and communication preferences
5. User receives immediate confirmation that the request was received
6. System creates or updates the lead record
7. System matches the lead to likely-fit facilities
8. Internal team and automation begin outreach and scheduling coordination

The platform should track attribution for:

- channel
- campaign
- ad set
- ad creative
- landing page variant
- referral source
- submit timestamp

## Current Data Reality

The current `facilities_ca.sqlite` database is useful, but it should not yet be treated as a fully product-ready directory database.

Important observations from the current SQLite file:

- The database contains ingestion and pipeline-oriented tables, not just clean application tables
- The facility corpus is broader than a pure assisted living directory and includes multiple facility types and naming conventions
- The strongest California-specific structured source currently appears to be the `ca_ccld_registry` table
- Canonical facility records are not yet fully enriched for search and discovery use
- Several desirable consumer-facing fields are currently sparse or empty

Implications:

- The MVP must be built around the subset of data that is reliable today
- Phase 1 should use a vetted operating subset, not the whole raw facility corpus
- Matching should emphasize dependable fields first
- Advanced filters such as pricing, amenities, reviews, websites, and live availability should be treated as future enrichment

## Initial Geographic Scope

- Phase 1: selected California hospital-centered markets only
- Phase 2: broader California expansion
- Phase 3: nationwide expansion across the USA

The architecture, routing, content model, and data model should be state-aware long term, but the product launch should be intentionally narrow.

## Phase 1 Launch Markets

Phase 1 should focus only on specific hospital-centered markets and the surrounding assisted living service area.

Initial hospital anchors:

- Temecula Valley Hospital
- Inland Valley Hospital
- Rancho Springs Hospital
- Loma Linda University Medical Center - Murrieta
- Menifee Global Medical Center

Phase 1 implications:

- The public site should present itself as a focused regional service, not a statewide directory
- Market pages, ad copy, matching, and internal routing should all be tied to these launch markets
- Leads and facilities should be tagged by `launch_market` and `hospital_anchor`
- The Phase 1 facility subset should be filtered to the cities, ZIP codes, and counties that support these hospital-centered markets

## Business Goal

Generate qualified assisted living leads and route those leads to facilities that can accommodate them, while helping families move from inquiry to scheduled calls or tours.

The system should collect enough information from each lead to:

- identify the inquirer and the prospective resident
- capture contact details and communication preferences
- understand care, timing, geography, and budget needs
- match the lead with relevant facilities
- coordinate scheduling for calls or tours
- track which facilities were contacted and how they responded
- support internal follow-up and concierge workflows

The business should also generate revenue by signing facility partners and selling listing and premium service packages.

## Core Product Areas

### 1. Public Website

The website is the customer-facing acquisition and trust-building layer.

Goals:

- attract users in the supported launch markets who are looking for assisted living help
- present a trustworthy, professional, conversion-oriented experience
- route visitors into a guided intake flow
- let identified users review matched or relevant facilities

Design direction:

- use [Avvo](https://www.avvo.com/) as a reference for clarity, trust-building structure, and conversion patterns
- do not copy Avvo directly
- borrow only high-level patterns such as strong search/discovery framing, trust sections, and clear calls to action

### 2. Guided Questionnaire And Lead Capture

The Phase 1 conversion flow should be a short guided questionnaire rather than requiring full browsing first.

Recommended first-session questionnaire fields:

- full name
- email address
- phone number
- preferred contact method
- relationship to resident
- hospital area / launch market
- desired city or region
- move-in timeframe
- general care category
- budget comfort or budget range
- whether the family wants help scheduling calls or tours
- best time to contact

Fields that may be captured later through follow-up:

- more detailed care needs
- memory care needs
- mobility needs
- deeper clinical details
- medication support needs
- room preferences
- diagnosis history
- payer details
- special preferences

Questionnaire design requirements:

- optimize for completion rate first
- use progressive profiling instead of asking everything upfront
- apply data minimization at first touch
- clearly distinguish required and optional questions
- allow save-and-resume or follow-up completion where possible
- support both website forms and Meta lead form ingestion
- keep Meta/social lead forms limited to top-of-funnel contact capture and non-sensitive matching inputs

### 3. Automated Confirmation And Customer Communications

When a lead submits information, the platform should immediately confirm receipt and set expectations.

The confirmation layer should support:

- on-screen confirmation page
- email confirmation
- SMS confirmation when the user has given appropriate permission

The confirmation message should say:

- the request was received
- the team will help identify facilities and coordinate calls or tours
- when the family should expect the next update
- how the family can correct details or reply

Customer communication requirements:

- communication timeline must be visible internally
- all outbound communications should be logged
- the system should support SMS, email, and phone-call workflows
- communication preference and opt-out status must be respected

### 4. Facility Discovery And Match Presentation

After submission, leads should be able to see facilities available in the supported Phase 1 markets and/or receive a shortlist of likely-fit matches.

For the MVP, this should be interpreted as a vetted facility subset within the supported launch markets, not the full raw SQLite dataset.

Recommended Phase 1 facility scope:

- prioritize RCFE / elderly residential care records backed by reliable licensing and location data
- use `ca_ccld_registry` as the strongest Phase 1 operating base
- treat broader canonical facility records as enrichment candidates, not automatically display-ready records
- exclude or carefully filter facilities with non-active or non-public statuses
- restrict launch inventory to the geographic catchment areas for the five hospital anchors

Data caveats for v1:

- geographic search is only dependable where location fields are actually populated
- pricing, availability, amenities, services, websites, and reviews should not be treated as consistently available yet
- matching should rely on dependable fields such as city, ZIP, county, facility type, capacity, and licensing status

Discovery experience should support over time:

- search by city, ZIP code, county, or region
- search by hospital service area / launch market
- filter by care level and reliably available attributes first
- facility detail pages
- transparent match explanations

Match presentation requirements:

- state whether matches are automated, human-reviewed, or both
- support no-results and weak-match fallback paths
- avoid implying live availability unless verified
- allow internal overrides and suppressions

### 5. Backend Lead Management Application

The backend application is an internal CRM and operations tool.

Core goals:

- track all submitted leads
- allow internal staff to create leads manually from calls, referrals, or offline inquiries
- allow staff to edit lead information at any time
- update lead status throughout the lifecycle
- manage matching, facility outreach, and scheduling
- record all communication, notes, and outcomes

The backend should support:

- lead list and lead detail views
- manual lead creation
- lead edit capability
- lead status updates
- lead assignment and ownership
- source and attribution tracking
- facility matching workflow
- facility outreach tracking
- appointment / tour tracking
- notes, tasks, reminders, and activity history

### 6. Facility Outreach And Scheduling Orchestration

Scheduling should be treated as a first-class workflow, because facilities will not respond in the same way or at the same speed.

The system should support:

- outreach to facilities by SMS, email, or phone workflow as appropriate
- per-facility preferred communication method
- tracking when a lead was shared with a facility
- tracking whether the facility responded
- tracking proposed times, confirmed times, declines, no response, and waitlists
- reschedule and cancellation handling
- human escalation when facilities do not respond promptly

Recommended operating model:

- automation handles confirmation and standard follow-ups where appropriate
- human staff fills the gaps when facilities are slow, inconsistent, or require manual coordination
- the system should record both automated and manual outreach in one timeline

### 7. Business Development And Facility Partnerships

The platform should include a provider-facing business development motion focused on facilities in the same launch markets served on the consumer side.

Business development goals:

- identify top facilities in each launch market
- reach out to facilities and introduce the family-matching service
- sign facilities up for paid listing packages
- upsell premium service add-ons
- track partner responsiveness, relationship health, and revenue

Phase 1 partner acquisition focus:

- prioritize the strongest and most relevant facilities in the Temecula, Murrieta, Menifee, Inland Valley, and surrounding service areas
- start with facilities that are most likely to benefit from family referrals and scheduling help
- focus on facilities that are operationally responsive and a good fit for concierge coordination

Facility partner value proposition:

- exposure to qualified local families looking for assisted living support
- placement into the vetted matching workflow
- help coordinating calls and tours
- stronger profile visibility in the consumer experience
- opportunity to purchase premium positioning and service support

## Revenue Model

The initial revenue strategy should combine recurring listing fees with optional premium add-ons.

### Core Paid Offering

Each participating facility should be offered a paid listing package.

Core listing package may include:

- presence in the partner facility network
- standard facility profile
- eligibility to receive matched family inquiries
- basic profile information displayed in the consumer experience
- standard reporting on lead and match activity

### Premium Add-Ons

Premium offerings may include:

- scheduling support for calls and visits
- priority listings in match results or directory placement
- more robust facility profiles
- expanded photos, amenities, and descriptive sections
- featured placement on market pages
- faster human follow-up support
- enhanced lead reporting
- responsiveness coaching or account management

### Commercial Principles

- pricing should be simple enough for early sales conversations
- the core package should be easy to explain and easy to buy
- premium add-ons should map to clear business outcomes such as visibility, speed, and coordination support
- premium placement should be disclosed clearly and should not undermine match quality or user trust
- partnership revenue rules should not create misleading claims about guaranteed placement or guaranteed move-ins

## Sales Pitch

The facility sales motion should be simple, local, and outcome-focused.

### Core Positioning

We help assisted living facilities in your market connect with families who are actively looking for support, and we help reduce the friction between lead inquiry and a scheduled call or visit.

### Short Pitch

We work with families in the Temecula, Murrieta, Menifee, and surrounding markets who are actively searching for assisted living support. Instead of just sending cold directory traffic, we qualify families, understand their care needs, and help coordinate the next step. Our goal is to connect your community with better-fit families and help move them toward scheduled calls and tours faster.

### Sales Call Version

We are building a local assisted living matching and placement support platform focused on families who need help finding care in your area. When families come to us, we guide them through a short intake, learn what kind of care and location they need, and match them with facilities that may be a good fit.

For our facility partners, we offer a paid listing that puts your community into that local matching flow. We also offer premium options like scheduling support for calls and visits, stronger profile visibility, priority placement, and more robust community profiles.

The value is not just exposure. We help reduce the back-and-forth by qualifying families, coordinating communication, and helping move interested families toward real conversations and tours.

### Why A Facility Should Care

- access to qualified local families instead of low-intent general traffic
- better visibility in a focused local market
- operational help with scheduling calls and tours
- improved response handling when your staff is busy
- optional premium positioning and profile enhancements

### Suggested Intro Email

Subject: Local assisted living family referrals for [Facility Name]

Hi [Name],

I’m reaching out because we’re building a local assisted living matching and family support platform focused on the Temecula, Murrieta, Menifee, and surrounding areas.

We help families who are actively searching for assisted living by guiding them through intake, understanding their needs, and connecting them with facilities that may be a strong fit. We also help coordinate next steps like calls and tours, which can reduce some of the friction between inquiry and move-in.

We’re speaking with a select group of local facilities about joining as listing partners. Our core package includes placement in the local matching network, and we also offer premium options like scheduling support, priority visibility, and stronger profile presentation.

If this sounds relevant, I’d be happy to schedule a short call and walk you through how it works.

Best,
[Your Name]

### Suggested Phone Opener

Hi, this is [Your Name]. I’m reaching out because we’re building a local assisted living family-matching service for the Temecula, Murrieta, Menifee, and nearby markets. We work with families who are actively looking for care, help qualify their needs, and help coordinate calls and visits with facilities that may be a good fit. I’d love to briefly share how our listing and scheduling support works and see if it could be valuable for your community.

### Suggested Objection Handling

If the facility says they already get referrals:

- That makes sense. Our value is not just another name on a list. We are trying to bring in more qualified local families and help reduce friction by supporting scheduling and follow-up.

If the facility says they are too busy:

- That is exactly where part of the value can help. We can support the coordination side and make it easier to move interested families toward a scheduled next step.

If the facility asks why they should pay a listing fee:

- The listing fee supports qualified local exposure, profile visibility, and access to the matching workflow. The premium options then add more hands-on help and stronger placement benefits.

If the facility asks whether placement is guaranteed:

- No. We do not guarantee move-ins. The goal is to improve visibility, connect you with relevant families, and help move qualified interest toward real calls and tours.

### Suggested Package Framing

Starter listing:

- standard listing profile
- eligibility for local matching
- basic reporting

Growth listing:

- everything in Starter
- stronger profile presentation
- priority visibility in approved placements
- added reporting visibility

Concierge add-on:

- scheduling support for calls and visits
- more active coordination help
- stronger operational follow-up support

### Sales Principles

- keep the pitch local and market-specific
- sell qualified family connection, not just traffic
- sell reduced friction and scheduling support, not just exposure
- never promise guaranteed occupancy or guaranteed move-ins
- clearly explain the difference between standard visibility and sponsored or premium placement

## Business Development Workflow

The platform and operations process should support the full facility-partner lifecycle.

### Partner Acquisition Workflow

1. Identify target facilities within each Phase 1 launch market
2. Prioritize top facilities based on fit, local reputation, responsiveness, and service coverage
3. Reach out by phone, email, and other business development channels
4. Track interest, objections, and follow-up activity
5. Convert facilities into paid listing partners
6. Onboard the partner and configure their listing and service package
7. Monitor lead flow, responsiveness, and upsell opportunities

### Partner Onboarding Workflow

The onboarding process should capture:

- business contact and billing contact
- facility contact methods
- preferred intake and scheduling workflow
- listing tier
- premium add-ons selected
- profile content and media
- service-area and care-fit details
- contract status
- billing status

### Partner Success Workflow

After onboarding, the team should track:

- lead volume
- response speed
- scheduling conversion
- tour completion
- move-in outcomes where available
- renewal likelihood
- upsell opportunities

## Required User Flow

### Lead / Consumer Flow

1. Visitor lands on a market-specific page from ads, search, referral, or direct traffic
2. Visitor sees a clear service promise and begins the guided questionnaire
3. Visitor submits lead details and communication permissions
4. System creates or updates the lead
5. Visitor receives immediate confirmation on-screen, and by email/SMS where permitted
6. System generates initial matches or queues the lead for internal review
7. Team and automation coordinate outreach to one or more facilities
8. Visitor receives updates as scheduling progresses
9. Visitor reviews suggested facilities and scheduled options

### Internal Team Flow

1. New lead appears in backend application
2. Team can also create a lead manually from a phone call, referral, or offline inquiry
3. Team reviews and updates lead profile, attribution, and contact data
4. Team reviews the system-generated matches
5. Team approves, edits, or overrides the facility shortlist
6. Team shares the lead with appropriate facilities
7. System and staff track facility responses and scheduling progress
8. Team communicates updates to the family
9. Team continues editing lead details as new information is learned

### Business Development / Partner Flow

1. Team identifies target facilities in the launch market
2. Team reaches out to facility decision-makers
3. Team tracks outreach, meetings, and follow-ups
4. Facility chooses a listing package and any premium add-ons
5. Team onboards the facility and publishes or upgrades the profile
6. Facility begins receiving or being prioritized for relevant lead opportunities based on package rules and matching rules
7. Team reviews partner performance, renewals, and upsell opportunities

## Suggested Workflow Status Models

One status is not enough. The platform should maintain separate status models.

### Lead Status

- new
- intake_in_progress
- qualified
- unqualified
- assigned
- matching_in_progress
- matched
- closed_won
- closed_lost

### Facility Outreach Status

- not_contacted
- queued
- contacted
- follow_up_needed
- responded
- declined
- no_response
- waitlisted

### Partner Account Status

- prospect
- contacted
- interested
- meeting_scheduled
- proposal_sent
- negotiating
- won
- active
- at_risk
- churned

### Appointment / Tour Status

- not_started
- requested
- options_received
- proposed_to_family
- confirmed
- reschedule_requested
- cancelled
- completed
- no_show

## Data Sources

### Existing Data

- SQLite database containing California facility data in `facilities_ca.sqlite`

Expected usage:

- provide the initial California source dataset
- seed a vetted facility operating subset for the supported Phase 1 markets
- support search and listing pages where data quality is sufficient
- support facility-to-lead matching using dependable fields first
- provide records for later normalization and migration

Important current limitations observed in the SQLite file:

- the `facilities` table contains a broader mixed facility corpus, not a clean assisted living-only directory
- `ca_ccld_registry` currently provides the most dependable city, ZIP, phone, licensing, capacity, and status data
- canonical location fields are not yet consistently populated in `facilities`
- reviews and inspections content are not ready for product promises
- many consumer-facing enrichment fields in `facility_snapshots` are sparse or unpopulated

## Functional Requirements

### Website

- public homepage
- market-specific landing pages for supported launch regions
- guided questionnaire flow
- educational and trust-building content
- confirmation page after submission
- identified-user facility shortlist or browsing experience
- facility detail pages for vetted records
- consent and preference capture
- provider / facility partnership information page

### Backend / Admin

- admin authentication
- lead list view
- lead detail view
- manual lead creation
- lead edit capability
- lead status update capability
- lead contact data update capability
- lead intake/profile update capability
- source and campaign tracking
- facility list view
- lead-to-facility matching workflow
- facility outreach workflow
- appointment / tour workflow
- notes and activity tracking
- tasks, reminders, and follow-up queue
- search and filtering
- partner prospect list
- partner account detail view
- partner outreach and sales pipeline
- package and add-on tracking
- partner onboarding workflow
- billing-status tracking
- partner performance reporting

### Matching Logic

Leads should be matched to facilities based on:

- launch market / hospital service area
- geography
- care level
- memory care and mobility needs
- capacity
- licensing status
- budget when reliable pricing exists
- operational responsiveness over time

Initial matching can be rules-based.

Phase 1 matching should:

- prefer fields that are actually present and dependable
- allow manual overrides
- eventually incorporate facility responsiveness and partnership strength

Commercial safeguards:

- partner status may influence whether a facility is actively worked by the internal team
- premium listing status may influence visibility only within clearly defined and trust-preserving rules
- sponsored or prioritized placement should never override core safety, fit, or compliance constraints

## Suggested Domain Model

### Lead

- id
- first_name
- last_name
- email
- phone
- preferred_contact_method
- sms_opt_in_status
- phone_call_opt_in_status
- email_opt_in_status
- relationship_to_resident
- launch_market
- hospital_anchor
- preferred_location
- budget_min
- budget_max
- care_level
- move_in_timeframe
- urgency
- notes
- status
- source
- campaign_id
- ad_set_id
- ad_id
- landing_page_variant
- assigned_to_user_id
- created_by_user_id
- last_contacted_at
- qualified_at
- created_at
- updated_at

### Resident Profile

- id
- lead_id
- age
- mobility_needs
- memory_care_needs
- medication_support_needs
- special_preferences
- diagnosis_summary

### Facility

- id
- source_id
- name
- address
- city
- state
- zip
- county
- phone
- website
- care_levels
- license_info
- description
- active
- source_status
- capacity
- source_record_type
- source_dataset
- public_visibility
- launch_market
- hospital_anchor
- preferred_contact_method
- response_speed_score
- partner_account_status
- listing_tier
- premium_add_ons
- billing_status
- account_owner_user_id

### Partner Account

- id
- facility_id
- primary_contact_name
- primary_contact_email
- primary_contact_phone
- billing_contact_name
- billing_contact_email
- billing_status
- account_status
- listing_tier
- premium_add_ons
- contract_signed_at
- renewal_date
- assigned_sales_user_id
- assigned_success_user_id
- notes
- created_at
- updated_at

### Sales Activity

- id
- partner_account_id
- user_id
- activity_type
- subject
- notes
- next_step
- due_at
- created_at

### Match

- id
- lead_id
- facility_id
- match_score
- match_reason
- generated_by
- human_reviewed
- status
- shared_with_lead_at
- shared_with_facility_at
- created_at

### Facility Outreach

- id
- lead_id
- facility_id
- outreach_channel
- outreach_status
- first_contact_at
- last_contact_at
- next_follow_up_at
- response_summary
- assigned_to_user_id
- created_at
- updated_at

### Appointment / Tour

- id
- lead_id
- facility_id
- appointment_type
- status
- proposed_at
- scheduled_for
- confirmed_at
- cancelled_at
- reschedule_reason
- created_at
- updated_at

### Consent Log

- id
- lead_id
- consent_type
- consent_text_version
- channel
- seller_scope
- granted_at
- revoked_at
- source_page
- ip_address
- user_agent

### Communication Event

- id
- lead_id
- facility_id
- appointment_id
- channel
- direction
- template_id
- delivery_status
- initiated_by
- body_summary
- created_at

### Activity / Note

- id
- lead_id
- facility_id
- user_id
- activity_type
- body
- created_at

### Internal User

- id
- name
- email
- role
- created_at

## Compliance And Legal Guardrails

This document is a product and implementation brief, not legal advice. Counsel should review the final workflows, consent language, privacy disclosures, vendor setup, and go-live configuration.

### Privacy And Data Collection

The product should be designed as if strong California privacy requirements apply from day one.

Requirements:

- make notice at collection a mandatory launch requirement
- provide a clear notice at or before data collection
- the notice at collection should describe categories collected, purposes, categories of recipients, retention approach, and whether personal information is sold or shared for advertising
- publish a privacy policy that explains collection, use, sharing, retention, and consumer rights handling
- if ad-tech practices could count as selling or sharing, provide a compliant opt-out path and handle Global Privacy Control conservatively
- document retention periods and deletion/correction workflows
- minimize the amount of sensitive information collected upfront
- store communication preferences and opt-out status per channel

### Sensitive Health-Like Intake Data

The questionnaire may collect information that is highly sensitive in practice, even if the business is not a HIPAA-covered entity.

Requirements:

- do not collect detailed diagnosis, medication support, or similar health information during initial signup unless strictly necessary
- do not send questionnaire answers about health, care needs, diagnosis, mobility, or similar sensitive data to ad platforms for targeting or retargeting
- do not upload sensitive intake responses to Meta or similar platforms for audience building
- do not place Meta pixels, session replay, or similar tracking on intake steps, account pages, or pages where sensitive care information is submitted or viewed
- avoid privacy promises the business cannot fully support
- do not claim HIPAA compliance unless counsel confirms it is accurate and operationally true
- define retention limits and deletion rules for sensitive intake data

### Consent For SMS, Calls, Email, And Facility Sharing

Consent should be explicit, logged, and channel-specific.

Requirements:

- collect and log consent for SMS, email, and phone communication separately where appropriate
- disclose that the company may contact the lead to help with matching and scheduling
- obtain clear consent before sharing lead information with third-party facilities
- prefer identified-facility authorization or a tightly defined sharing scope instead of vague partner consent
- if facilities will send automated marketing texts or calls directly, gather seller-specific consent for each facility or keep those contacts manual until a compliant model is in place
- maintain internal do-not-contact suppression and revocation handling
- keep auditable consent records for website forms, Meta lead forms, phone intake, and manual CRM entry
- separate marketing consent from privacy acknowledgment and from any account creation flow
- make sure family-facing lead-sharing permissions and provider-facing marketing/sales outreach permissions are tracked separately

### Advertising And Fairness

Because the service is housing-related, ad targeting and delivery should be reviewed conservatively.

Requirements:

- avoid targeting or excluding audiences in ways that could create unlawful discrimination risk
- review ad copy, lookalike strategies, audience filters, and automation with housing sensitivity in mind
- avoid misleading claims about guaranteed placement, guaranteed availability, or guaranteed timelines
- clearly identify when the platform is a matching and coordination service rather than the facility itself
- avoid ad copy that implies hospital affiliation, medical-provider status, or government endorsement unless true
- clearly disclose any sponsored, featured, or priority placement in the consumer experience

### Email, Calling, And Telemarketing Guardrails

- marketing email must support unsubscribe and suppression handling
- calling and texting workflows must respect consent, revocation, and do-not-call handling
- automated confirmations should be clearly distinguishable from broader marketing campaigns
- the business should keep logs showing what was sent, why, and under what consent state
- maintain written do-not-call and SMS suppression procedures, including internal suppression handling and review of National Do Not Call obligations

### Security And Access Control

- role-based access for staff
- audit logs for lead sharing and edits
- secure storage of lead data
- vendor review for messaging, CRM, and analytics tools
- limited access to sensitive intake fields
- written contracts with facilities and key vendors covering permitted use, security, breach handling, and deletion/return of lead data
- disclosure logs showing what lead information was shared, with whom, when, why, and under what consent basis
- encryption and incident-response planning for lead and care-related data
- partner contracts should also define package terms, billing terms, permitted use of lead data, and restrictions on reuse or resale

## Non-Functional Requirements

- mobile-friendly responsive website
- clear separation between public site and internal backend
- secure authentication and storage of personal information
- extensible architecture for multi-state rollout
- SEO-conscious structure for public content pages
- auditability for lead sharing and follow-up activity
- ability to expand from hospital-centered launch markets to broader regional and statewide coverage

## Early Architecture Direction

This is a starting point, not a locked decision.

### Frontend

- marketing website plus guided intake flow
- market-specific landing pages for paid traffic
- confirmation pages and identified-user shortlist experience
- information architecture centered around launch markets and hospital-area discovery

### Backend

- API layer for leads, facilities, matching, communication, consent, outreach, and scheduling
- admin dashboard for internal staff
- workflows for manual lead entry, lead updates, outreach, and appointment lifecycle management
- partner CRM workflows for sales, onboarding, renewals, and account management

### Database

- read initially from the current SQLite facility dataset
- introduce a primary application database for leads, communications, consent, matches, outreach, appointments, and staff workflows
- build a vetted application-facing facility model from the reliable SQLite subsets
- optionally migrate normalized facility data later

## Open Questions For Later Implementation

- what tech stack should be used for frontend and backend?
- should the public site and admin app live in one monorepo or separate apps?
- what exact city / ZIP / county boundaries define each Phase 1 launch market?
- what service-level promise should be shown to families after submission?
- which facility statuses should be publicly visible in v1?
- what exact consent language will be used for SMS, calls, email, and facility sharing?
- will facilities have their own partner login in a future phase?
- how should no-results and out-of-market requests be handled?
- what data enrichment pipeline is needed before advanced filters are enabled?
- what should the initial listing fee and premium add-on pricing be?
- which premium features will be available at launch versus later?
- what renewal model should be used for partner accounts?

## Recommended Implementation Phases

### Phase 0: Discovery And Setup

- review SQLite schema and field quality
- define the exact Phase 1 facility subset
- define the exact city / ZIP / county coverage around each hospital anchor
- define public visibility rules for facility statuses
- define consent, privacy, and facility-sharing rules with counsel
- choose application stack
- define MVP data model
- define brand direction and landing page strategy
- define partner package structure, sales workflow, and billing approach

Primary roles for Phase 0:

- Product / Program Lead
- Compliance / Privacy Counsel
- Technical Architect
- Data / Matching Specialist
- Operations / Concierge Workflow Lead

### Phase 1: MVP Intake, Matching, And Concierge Ops

- market landing pages
- guided questionnaire
- attribution tracking
- automated confirmation flow
- lead dashboard
- matching workflow
- facility outreach workflow
- tour / appointment workflow
- core communications logging
- partner prospecting workflow
- partner onboarding workflow
- listing tier and add-on configuration

Primary roles for Phase 1:

- Technical Architect
- Developer
- QA / Test Lead
- Data / Matching Specialist
- Operations / Concierge Workflow Lead
- Business Development / Partner Success Lead
- Content / Marketing Operations

### Phase 2: Guided Facility Discovery And Portal

- identified-user shortlist and browsing
- facility detail pages
- richer match presentation
- customer status updates and timeline
- premium profile enhancements
- clearer featured / sponsored placement handling

### Phase 3: Optimization And Expansion

- improved scoring and responsiveness weighting
- reporting and funnel analytics
- deeper automation
- broader California market rollout
- partner performance reporting
- renewals and upsell workflows

### Phase 4: Multi-State Expansion

- state-aware routing and navigation
- national data ingestion
- geographic scaling strategy

Release gate for launch-critical work:

- Compliance / Privacy Counsel reviews launch-blocking consent, privacy, lead-sharing, and ad-tech items
- QA / Test Lead clears launch-blocking defects and regression risks
- Security / DevOps clears launch-blocking security, access, and deployment readiness items

## Delivery Roles, Workstreams, And Handoffs

These roles should be used when applicable throughout planning, implementation, testing, launch, and operations.

The purpose of these roles is to create clear ownership and reliable handoffs across the project.

### Core Roles

- `Product / Program Lead`: owns priorities, scope, acceptance criteria, release readiness, and final business decisions
- `Compliance / Privacy Counsel`: reviews consent language, notice at collection, privacy disclosures, facility-sharing rules, ad-tech use, partner contracts, and launch-risk decisions
- `Technical Architect`: owns system boundaries, data model integrity, security architecture, integration patterns, and cross-cutting technical decisions
- `Developer`: implements features, fixes defects, adds tests, updates technical notes, and hands completed work to QA
- `QA / Test Lead`: validates acceptance criteria, regressions, edge cases, consent behavior, workflow behavior, and release readiness
- `Data / Matching Specialist`: owns SQLite source review, facility subset quality, mapping rules, matching logic validation, and data-quality checks
- `Operations / Concierge Workflow Lead`: owns real-world lead handling, outreach flow, scheduling flow, escalation rules, and operational usability requirements
- `Business Development / Partner Success Lead`: owns partner onboarding, package rules, facility communications, renewals, and provider workflow requirements
- `Content / Marketing Operations`: owns landing-page copy, ad and campaign messaging, confirmation messaging, disclosure placement, and approved funnel variants
- `Security / DevOps`: owns environments, secrets, access control, audit logging, deployment controls, monitoring, and incident readiness

### Role Usage Principles

- every work item should have one primary owner
- every work item should have at least one reviewer when review is needed
- acceptance criteria should be defined before implementation begins
- specialist roles should be pulled in whenever a task touches their area
- legal and compliance review should be performed by real qualified counsel before launch-critical decisions are finalized

### Collaboration Rules

- every work item must have one primary owner, one reviewer when applicable, and explicit acceptance criteria
- Compliance / Privacy Counsel must review any change involving consent, privacy disclosures, lead sharing, SMS/calling flows, ad-tech, or sensitive intake fields before release
- Technical Architect must review any change affecting data model, permissions, integrations, matching logic, or system-wide technical patterns before the work is considered complete
- Developer moves a task to QA only after implementation, relevant automated checks, and implementation notes are complete
- QA / Test Lead tests all completed work against requirements, regression risks, and edge cases
- if QA finds defects, the task returns to Developer with clear findings
- Developer fixes the issues and returns the task to QA for retest
- the Developer -> QA -> Developer -> QA loop continues until QA passes the work
- a task is not complete until QA passes it and the Product / Program Lead accepts it when business validation is required
- data-related changes require validation by the Data / Matching Specialist before release
- workflow changes affecting staff operations or facility coordination require sign-off from the Operations / Concierge Workflow Lead
- no launch-blocking compliance or security issue may be waived informally; the risk owner and Product / Program Lead must record the decision explicitly

### Standard Handoff Flow

1. `Product / Program Lead` defines the task, scope, and acceptance criteria.
2. `Compliance / Privacy Counsel`, `Technical Architect`, `Data / Matching Specialist`, or `Operations / Concierge Workflow Lead` review early when the task touches their area.
3. `Developer` implements the change.
4. `QA / Test Lead` tests the change.
5. If QA finds issues, `Developer` fixes them.
6. `QA / Test Lead` retests the work.
7. `Product / Program Lead` accepts the work for release when business validation is required.
8. `Security / DevOps` handles deployment readiness and production release controls when applicable.

## Immediate Next Step

Before coding, define the MVP around the real SQLite dataset and the real operating model:

- define the exact facility subset for the supported Phase 1 markets
- define the city / ZIP / county boundaries for the five hospital anchors
- define the intake questionnaire and which fields are required on first submit
- define the automated confirmation timeline and communication templates
- define the consent model for SMS, calls, email, and facility sharing
- define the facility outreach and scheduling workflow, including human escalation
- define the partner package structure, listing fees, premium add-ons, and business development workflow
