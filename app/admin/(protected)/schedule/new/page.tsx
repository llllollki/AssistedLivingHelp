import { createSupabaseServerClient } from "@/lib/supabase-server";
import Link from "next/link";
import { toTitleCase } from "@/lib/format";
import { createAppointmentAction } from "./actions";

type Props = {
  searchParams?: Promise<{ error?: string; leadId?: string }>;
};

const APPOINTMENT_TYPES = ["Family call", "Facility tour", "Video call", "In-person visit", "Follow-up call"];

function getSingleRelation<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

export default async function NewAppointmentPage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : {};
  const supabase = await createSupabaseServerClient();
  const selectedLeadId = params.leadId ?? "";

  const [{ data: leads }, { data: selectedLead }] = await Promise.all([
    supabase
      .from("leads")
      .select("id, first_name, last_name, status")
      .not("status", "in", '("closed_won","closed_lost")')
      .order("created_at", { ascending: false })
      .limit(200),
    selectedLeadId
      ? supabase
          .from("leads")
          .select("id, launch_market_id")
          .eq("id", selectedLeadId)
          .maybeSingle()
      : Promise.resolve({ data: null })
  ]);

  const [{ data: leadMatches }, { data: marketFacilities }] = await Promise.all([
    selectedLeadId
      ? supabase
          .from("alh_matches")
          .select("id, status, alh_facilities!facility_id(id, name, city)")
          .eq("lead_id", selectedLeadId)
          .in("status", ["suggested", "reviewed", "shared"])
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] }),
    selectedLeadId && selectedLead?.launch_market_id
      ? supabase
          .from("alh_facilities")
          .select("id, name, city")
          .eq("launch_market_id", selectedLead.launch_market_id)
          .order("name")
          .limit(300)
      : Promise.resolve({ data: [] })
  ]);

  const approvedMatches = (leadMatches ?? []).filter(
    (match) => match.status === "reviewed" || match.status === "shared"
  );
  const suggestedMatches = (leadMatches ?? []).filter((match) => match.status === "suggested");
  const matchedFacilityIds = new Set(
    (leadMatches ?? [])
      .map((match) =>
        getSingleRelation(
          match.alh_facilities as
            | { id: string; name: string; city: string | null }
            | Array<{ id: string; name: string; city: string | null }>
            | null
        )?.id ?? null
      )
      .filter((facilityId): facilityId is string => Boolean(facilityId))
  );
  const fallbackFacilities = (marketFacilities ?? []).filter(
    (facility) => !matchedFacilityIds.has(facility.id)
  );

  return (
    <section className="section">
      <div className="container">
        <Link href="/admin/schedule" className="backLink">
          {"<- "}Back to schedule
        </Link>
        <div style={{ marginTop: "1.25rem" }}>
          <p className="eyebrow">Admin / Schedule</p>
          <h1>New appointment</h1>
          <p className="sectionIntro">
            Appointments require facility-sharing consent. Staff can schedule with an already
            approved match or approve a same-market facility here as part of scheduling.
          </p>
        </div>

        {params.error && (
          <p className="errorBanner" style={{ margin: "1rem 0" }}>
            {params.error}
          </p>
        )}

        <div style={{ maxWidth: 640 }}>
          <form method="get" className="adminCard" style={{ marginBottom: "1.25rem" }}>
            <h2>Select lead</h2>
            <div className="adminInlineForm">
              <select name="leadId" defaultValue={selectedLeadId}>
                <option value="">- Select lead -</option>
                {(leads ?? []).map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.first_name} {lead.last_name}
                  </option>
                ))}
              </select>
              <button type="submit" className="adminSmallBtn adminSmallBtn--ghost">
                Load matched facilities
              </button>
            </div>
          </form>

          <form action={createAppointmentAction}>
            <div className="adminCard">
              <h2>Appointment details</h2>
              <div className="adminFormGrid">
                <label className="fullWidth">
                  Lead *
                  <select name="leadId" required defaultValue={selectedLeadId}>
                    <option value="">- Select lead -</option>
                    {(leads ?? []).map((lead) => (
                      <option key={lead.id} value={lead.id}>
                        {lead.first_name} {lead.last_name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="fullWidth">
                  Facility *
                  <select name="facilityId" required disabled={!selectedLeadId}>
                    <option value="">
                      {selectedLeadId ? "- Select facility -" : "- Select a lead first -"}
                    </option>
                    {approvedMatches.length > 0 && (
                      <optgroup label="Approved matches">
                        {approvedMatches.map((match) => {
                          const facility = getSingleRelation(
                            match.alh_facilities as
                              | { id: string; name: string; city: string | null }
                              | Array<{ id: string; name: string; city: string | null }>
                              | null
                          );

                          if (!facility) {
                            return null;
                          }

                          return (
                            <option key={facility.id} value={facility.id}>
                              {toTitleCase(facility.name)}
                              {facility.city ? ` - ${toTitleCase(facility.city)}` : ""}
                            </option>
                          );
                        })}
                      </optgroup>
                    )}
                    {suggestedMatches.length > 0 && (
                      <optgroup label="Suggested matches to approve">
                        {suggestedMatches.map((match) => {
                          const facility = getSingleRelation(
                            match.alh_facilities as
                              | { id: string; name: string; city: string | null }
                              | Array<{ id: string; name: string; city: string | null }>
                              | null
                          );

                          if (!facility) {
                            return null;
                          }

                          return (
                            <option key={facility.id} value={facility.id}>
                              {toTitleCase(facility.name)}
                              {facility.city ? ` - ${toTitleCase(facility.city)}` : ""} (approve)
                            </option>
                          );
                        })}
                      </optgroup>
                    )}
                    {fallbackFacilities.length > 0 && (
                      <optgroup label="Same-market facilities to approve">
                        {fallbackFacilities.map((facility) => (
                          <option key={facility.id} value={facility.id}>
                            {toTitleCase(facility.name)}
                            {facility.city ? ` - ${toTitleCase(facility.city)}` : ""} (approve)
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </label>
                <label>
                  Type *
                  <select name="appointmentType" required>
                    <option value="">- Select type -</option>
                    {APPOINTMENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Date &amp; time (Pacific)
                  <input type="datetime-local" name="scheduledFor" />
                </label>
              </div>
              {selectedLeadId &&
                approvedMatches.length === 0 &&
                suggestedMatches.length === 0 &&
                fallbackFacilities.length === 0 && (
                <p className="tableSecondary" style={{ marginTop: "1rem" }}>
                  This lead does not have any approved, suggested, or same-market facilities
                  available yet.
                </p>
              )}
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
              <button type="submit" className="primaryButton" disabled={!selectedLeadId}>
                Create appointment
              </button>
              <Link href="/admin/schedule" className="secondaryButton">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
