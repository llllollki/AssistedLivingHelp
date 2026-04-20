export type LeadStatus =
  | "new"
  | "intake_in_progress"
  | "qualified"
  | "assigned"
  | "matching_in_progress"
  | "matched"
  | "closed_won"
  | "closed_lost";

export type OutreachStatus =
  | "not_contacted"
  | "queued"
  | "contacted"
  | "follow_up_needed"
  | "responded"
  | "declined"
  | "no_response"
  | "waitlisted";

export type AppointmentStatus =
  | "not_started"
  | "requested"
  | "options_received"
  | "proposed_to_family"
  | "confirmed"
  | "reschedule_requested"
  | "cancelled"
  | "completed"
  | "no_show";

export type PartnerStatus =
  | "prospect"
  | "contacted"
  | "interested"
  | "meeting_scheduled"
  | "proposal_sent"
  | "negotiating"
  | "won"
  | "active"
  | "at_risk"
  | "churned";
