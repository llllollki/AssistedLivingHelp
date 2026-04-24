import { getSupabaseServiceRoleClient } from "@/lib/supabase";
import Link from "next/link";

export const dynamic = "force-dynamic";

// ── public status labels ──────────────────────────────────────────────────────

type PublicStatus =
  | "received"
  | "under_review"
  | "in_progress"
  | "matches_identified"
  | "coordination_started"
  | "completed"
  | "closed";

const STATUS_LABEL: Record<PublicStatus, string> = {
  received: "Request received",
  under_review: "Under review",
  in_progress: "In progress",
  matches_identified: "Matches identified",
  coordination_started: "Coordination started",
  completed: "Completed",
  closed: "Closed"
};

const STATUS_DETAIL: Record<PublicStatus, string> = {
  received:
    "Our team has received your intake and will be in touch within 1 business day using the contact method you selected.",
  under_review:
    "Our team is reviewing your request and identifying assisted living options that may be a good fit.",
  in_progress:
    "We are actively working on your request and identifying matching facilities.",
  matches_identified:
    "We have identified facilities that may be a good fit. Our team will be in touch to discuss options.",
  coordination_started:
    "Our team is coordinating scheduling with facilities on your behalf. Expect an update soon.",
  completed:
    "A call or tour has been coordinated. Contact us if you need any further assistance.",
  closed:
    "Your request has been closed. Please contact us if you still need help finding assisted living support."
};

const PROGRESS_STEPS: { label: string; statuses: PublicStatus[] }[] = [
  { label: "Request received", statuses: ["received"] },
  { label: "Under review", statuses: ["under_review"] },
  { label: "In progress", statuses: ["in_progress", "matches_identified"] },
  { label: "Coordination started", statuses: ["coordination_started"] },
  { label: "Completed", statuses: ["completed", "closed"] }
];

// ── status derivation ─────────────────────────────────────────────────────────

function derivePublicStatus(
  leadStatus: string,
  appointmentStatuses: string[],
  matchStatuses: string[]
): PublicStatus {
  // Closed states take immediate priority.
  if (leadStatus === "closed_lost") return "closed";
  if (leadStatus === "closed_won") return "completed";

  // Any completed appointment → completed.
  if (appointmentStatuses.includes("completed")) return "completed";

  // Active scheduling in progress → coordination_started.
  const activeApptStatuses = [
    "requested",
    "options_received",
    "proposed_to_family",
    "confirmed",
    "reschedule_requested"
  ];
  if (appointmentStatuses.some((s) => activeApptStatuses.includes(s))) {
    return "coordination_started";
  }

  // Staff-reviewed or shared matches → matches_identified.
  if (leadStatus === "matched") return "matches_identified";
  if (matchStatuses.some((s) => s === "reviewed" || s === "shared")) {
    return "matches_identified";
  }

  // Matching work underway.
  if (leadStatus === "matching_in_progress") return "in_progress";

  // Reviewed / assigned.
  if (leadStatus === "qualified" || leadStatus === "assigned") return "under_review";

  // Default: intake received.
  return "received";
}

function progressStep(status: PublicStatus): number {
  for (let i = 0; i < PROGRESS_STEPS.length; i++) {
    if (PROGRESS_STEPS[i].statuses.includes(status)) return i;
  }
  return 0;
}

// ── verification ──────────────────────────────────────────────────────────────

function isValidUUID(s: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

type VerifyResult =
  | { ok: false }
  | {
      ok: true;
      firstName: string;
      publicStatus: PublicStatus;
      createdAt: string;
    };

async function verifyAndLoad(leadId: string, verifyInput: string): Promise<VerifyResult> {
  const supabase = getSupabaseServiceRoleClient();
  if (!supabase) return { ok: false };

  const { data: lead } = await supabase
    .from("leads")
    .select("first_name, status, created_at, email, phone")
    .eq("id", leadId)
    .single();

  if (!lead) return { ok: false };

  // Verify: email match OR last-4 phone match.
  const input = verifyInput.trim().toLowerCase();
  let verified = false;

  if (input.includes("@")) {
    verified = !!lead.email && lead.email.toLowerCase() === input;
  } else {
    const inputDigits = input.replace(/\D/g, "");
    if (inputDigits.length >= 4) {
      const storedDigits = (lead.phone ?? "").replace(/\D/g, "");
      verified =
        storedDigits.length >= 4 &&
        storedDigits.slice(-4) === inputDigits.slice(-4);
    }
  }

  if (!verified) return { ok: false };

  // Load appointment and match statuses for richer status derivation.
  const [{ data: appointments }, { data: matches }] = await Promise.all([
    supabase
      .from("alh_appointments")
      .select("status")
      .eq("lead_id", leadId),
    supabase
      .from("alh_matches")
      .select("status")
      .eq("lead_id", leadId)
  ]);

  const apptStatuses = (appointments ?? [])
    .map((a) => a.status as string)
    .filter((s) => s !== "cancelled" && s !== "no_show");

  const matchStatuses = (matches ?? []).map((m) => m.status as string);

  return {
    ok: true,
    firstName: lead.first_name,
    publicStatus: derivePublicStatus(lead.status, apptStatuses, matchStatuses),
    createdAt: lead.created_at
  };
}

// ── page ──────────────────────────────────────────────────────────────────────

type SearchParams = Promise<{ lead?: string; verify?: string }>;

export default async function StatusPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const leadParam = (sp.lead ?? "").trim();
  const verifyParam = (sp.verify ?? "").trim();

  // Only attempt a lookup when both params are present and the UUID looks valid.
  const canLookup = isValidUUID(leadParam) && verifyParam.length > 0;
  let result: VerifyResult | null = null;

  if (canLookup) {
    result = await verifyAndLoad(leadParam, verifyParam);
  } else if (leadParam && !isValidUUID(leadParam)) {
    // Non-UUID lead param — treat as not-found without hitting DB.
    result = { ok: false };
  }

  const showStatus = result?.ok === true;
  const showNotFound = canLookup && result?.ok === false;
  const currentStep = showStatus ? progressStep((result as { ok: true; publicStatus: PublicStatus }).publicStatus) : -1;

  return (
    <section className="section">
      <div className="container narrow">
        <p className="eyebrow">Assisted Living Help</p>
        <h1>Check your request status</h1>
        <p className="sectionIntro" style={{ marginBottom: "2rem" }}>
          Enter the reference ID from your confirmation page and confirm your contact
          information to view your current status.
        </p>

        {/* ── search form ── */}
        <div className="adminCard" style={{ marginBottom: "1.5rem" }}>
          <form method="GET" action="/status">
            <div className="adminFormGrid">
              <label className="fullWidth">
                Reference ID
                <input
                  type="text"
                  name="lead"
                  defaultValue={leadParam}
                  placeholder="e.g. 3f2e1b00-…"
                  style={{ fontFamily: "monospace" }}
                  autoComplete="off"
                  spellCheck={false}
                />
              </label>
              <label className="fullWidth">
                Email address or last 4 digits of your phone
                <input
                  type="text"
                  name="verify"
                  defaultValue={verifyParam}
                  placeholder="you@example.com  or  1234"
                  autoComplete="off"
                />
              </label>
            </div>
            <div style={{ marginTop: "1rem" }}>
              <button type="submit" className="primaryButton">
                Check status
              </button>
            </div>
          </form>
        </div>

        {/* ── not found ── */}
        {showNotFound && (
          <div className="infoCard" style={{ marginBottom: "1.25rem" }}>
            <p style={{ margin: 0 }}>
              No request found matching those details. Please double-check the reference
              ID on your confirmation page and the email address or phone number you used
              when submitting. If you need help, contact us directly.
            </p>
          </div>
        )}

        {/* ── status result ── */}
        {showStatus && (() => {
          const r = result as { ok: true; firstName: string; publicStatus: PublicStatus; createdAt: string };
          return (
            <>
              <div className="adminCard" style={{ marginBottom: "1.25rem" }}>
                {r.firstName && (
                  <p style={{ margin: "0 0 0.5rem", color: "var(--muted)", fontSize: "0.9rem" }}>
                    Hi {r.firstName} —
                  </p>
                )}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    marginBottom: "0.75rem"
                  }}
                >
                  <span className={`statusBadge statusBadge--${r.publicStatus}`}>
                    {STATUS_LABEL[r.publicStatus]}
                  </span>
                </div>
                <p style={{ margin: 0, lineHeight: 1.6 }}>
                  {STATUS_DETAIL[r.publicStatus]}
                </p>
                {r.createdAt && (
                  <p style={{ margin: "0.75rem 0 0", fontSize: "0.85rem", color: "var(--muted)" }}>
                    Submitted:{" "}
                    {new Date(r.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </p>
                )}
              </div>

              {/* progress tracker */}
              <div className="adminCard" style={{ marginBottom: "1.25rem" }}>
                <p
                  style={{
                    margin: "0 0 0.75rem",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "var(--muted)"
                  }}
                >
                  Progress
                </p>
                {PROGRESS_STEPS.map(({ label }, i) => {
                  const isDone = i < currentStep;
                  const isActive = i === currentStep;
                  return (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0.5rem 0",
                        borderBottom:
                          i < PROGRESS_STEPS.length - 1
                            ? "1px solid var(--line)"
                            : "none"
                      }}
                    >
                      <span
                        style={{
                          width: "1.25rem",
                          height: "1.25rem",
                          borderRadius: "50%",
                          flexShrink: 0,
                          background: isDone
                            ? "var(--success, #16a34a)"
                            : isActive
                            ? "var(--accent, #2563eb)"
                            : "var(--line)"
                        }}
                      />
                      <span
                        style={{
                          fontSize: "0.9rem",
                          fontWeight: isActive ? 700 : 400,
                          color: isDone || isActive ? "var(--fg)" : "var(--muted)"
                        }}
                      >
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="infoCard" style={{ marginBottom: "1.25rem" }}>
                <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.6 }}>
                  <strong>Questions?</strong> A staff member will follow up using the
                  contact method you selected. No facility will be contacted without your
                  explicit consent. We do not claim live availability or automatic placement.
                </p>
              </div>
            </>
          );
        })()}

        <div style={{ marginTop: "2rem" }}>
          <Link href="/" className="backLink">
            {"<- "}Return home
          </Link>
        </div>
      </div>
    </section>
  );
}
