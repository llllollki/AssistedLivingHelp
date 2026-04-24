import { getSupabaseServiceRoleClient } from "@/lib/supabase";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  new: "Request received",
  intake_in_progress: "Request received",
  qualified: "Under review",
  assigned: "Under review",
  matching_in_progress: "In progress",
  matched: "Matches identified",
  closed_won: "Completed",
  closed_lost: "Closed"
};

const STATUS_DETAIL: Record<string, string> = {
  new: "Our team has received your intake and will be in touch within 1 business day.",
  intake_in_progress:
    "Our team is reviewing your intake and will follow up using the contact methods you selected.",
  qualified:
    "Your request has been reviewed. We are identifying assisted living options that may be a good fit.",
  assigned:
    "A staff member has been assigned to your request and will follow up with you.",
  matching_in_progress:
    "We are actively identifying matching facilities for your needs.",
  matched:
    "We have identified facilities for your needs. Our team is coordinating next steps.",
  closed_won:
    "A placement or appointment has been coordinated. Contact us if you need any further assistance.",
  closed_lost:
    "Your request has been closed. Please contact us if you still need help finding assisted living support."
};

function isValidUUID(s: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

function statusStep(status: string): number {
  const steps = [
    ["new", "intake_in_progress"],
    ["qualified", "assigned"],
    ["matching_in_progress"],
    ["matched"],
    ["closed_won", "closed_lost"]
  ];
  for (let i = 0; i < steps.length; i++) {
    if (steps[i].includes(status)) return i;
  }
  return 0;
}

type SearchParams = Promise<{ lead?: string }>;

export default async function StatusPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const leadParam = (sp.lead ?? "").trim();

  let result: {
    found: boolean;
    firstName?: string;
    status?: string;
    createdAt?: string;
  } | null = null;

  if (leadParam && isValidUUID(leadParam)) {
    const supabase = getSupabaseServiceRoleClient();
    if (supabase) {
      const { data } = await supabase
        .from("leads")
        .select("first_name, status, created_at")
        .eq("id", leadParam)
        .single();

      result = data
        ? {
            found: true,
            firstName: data.first_name,
            status: data.status,
            createdAt: data.created_at
          }
        : { found: false };
    }
  } else if (leadParam) {
    result = { found: false };
  }

  const currentStep = result?.found && result.status ? statusStep(result.status) : -1;
  const steps = [
    "Request received",
    "Under review",
    "In progress",
    "Matches identified",
    "Completed"
  ];

  return (
    <section className="section">
      <div className="container narrow">
        <p className="eyebrow">Assisted Living Help</p>
        <h1>Check your request status</h1>
        <p className="sectionIntro" style={{ marginBottom: "2rem" }}>
          Enter the reference ID you received after submitting your intake request.
        </p>

        <div className="adminCard" style={{ marginBottom: "1.5rem" }}>
          <form method="GET" action="/status">
            <label
              htmlFor="lead-input"
              style={{ display: "block", fontWeight: 600, marginBottom: "0.5rem" }}
            >
              Reference ID
            </label>
            <div className="adminInlineForm">
              <input
                id="lead-input"
                type="text"
                name="lead"
                defaultValue={leadParam}
                placeholder="e.g. 3f2e1b00-…"
                style={{ flex: 1, fontFamily: "monospace" }}
                autoComplete="off"
              />
              <button type="submit" className="adminSmallBtn">
                Check status
              </button>
            </div>
          </form>
        </div>

        {leadParam && result === null && (
          <p className="errorBanner">
            Unable to look up your request. Please check that Supabase is configured.
          </p>
        )}

        {result?.found === false && (
          <div className="infoCard">
            <p style={{ margin: 0, color: "var(--muted)" }}>
              No request found for that reference ID. Please double-check the ID from
              your confirmation page or email. If you need help, contact us directly.
            </p>
          </div>
        )}

        {result?.found && result.status && (
          <>
            <div className="adminCard" style={{ marginBottom: "1.25rem" }}>
              <p style={{ margin: "0 0 0.25rem", color: "var(--muted)", fontSize: "0.9rem" }}>
                {result.firstName ? `Hi ${result.firstName} —` : ""} your current status
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  marginBottom: "0.75rem"
                }}
              >
                <span
                  className={`statusBadge statusBadge--${result.status}`}
                  style={{ fontSize: "0.95rem" }}
                >
                  {STATUS_LABEL[result.status] ?? result.status}
                </span>
              </div>
              <p style={{ margin: 0, lineHeight: 1.6 }}>
                {STATUS_DETAIL[result.status] ??
                  "Our team is working on your request."}
              </p>
              {result.createdAt && (
                <p
                  style={{
                    margin: "0.75rem 0 0",
                    fontSize: "0.85rem",
                    color: "var(--muted)"
                  }}
                >
                  Submitted:{" "}
                  {new Date(result.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  })}
                </p>
              )}
            </div>

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
              <div style={{ display: "flex", gap: 0, flexDirection: "column" }}>
                {steps.map((label, i) => {
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
                        borderBottom: i < steps.length - 1 ? "1px solid var(--line)" : "none"
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
                            : "var(--line)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        {isDone && (
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 10 10"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M1.5 5L4 7.5L8.5 3"
                              stroke="white"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>
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
            </div>

            <div className="infoCard">
              <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.6 }}>
                <strong>Questions?</strong> A staff member will be in touch using the
                contact method you selected. No facility will be contacted without your
                explicit consent. We do not claim live availability or automatic placement.
              </p>
            </div>
          </>
        )}

        <div style={{ marginTop: "2rem" }}>
          <Link href="/" className="backLink">
            {"<- "}Return home
          </Link>
        </div>
      </div>
    </section>
  );
}
