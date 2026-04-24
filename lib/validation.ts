export type IntakePayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferredContactMethod: string;
  relationshipToResident: string;
  launchMarketSlug: string;
  desiredCity: string;
  moveInTimeframe: string;
  generalCareCategory: string;
  budgetMin: string;
  budgetMax: string;
  wantsSchedulingHelp: boolean;
  consentPrivacyAcknowledgment: boolean;
  consentEmail: boolean;
  consentSms: boolean;
  consentPhone: boolean;
  consentContactSupport: boolean;
  consentFacilitySharing: boolean;
};

export function parseIntakeForm(formData: FormData): IntakePayload {
  return {
    firstName: String(formData.get("firstName") ?? "").trim(),
    lastName: String(formData.get("lastName") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    preferredContactMethod: String(formData.get("preferredContactMethod") ?? "").trim(),
    relationshipToResident: String(formData.get("relationshipToResident") ?? "").trim(),
    launchMarketSlug: String(formData.get("launchMarketSlug") ?? "").trim(),
    desiredCity: String(formData.get("desiredCity") ?? "").trim(),
    moveInTimeframe: String(formData.get("moveInTimeframe") ?? "").trim(),
    generalCareCategory: String(formData.get("generalCareCategory") ?? "").trim(),
    budgetMin: String(formData.get("budgetMin") ?? "").trim(),
    budgetMax: String(formData.get("budgetMax") ?? "").trim(),
    wantsSchedulingHelp: formData.get("wantsSchedulingHelp") === "on",
    consentPrivacyAcknowledgment:
      formData.get("consentPrivacyAcknowledgment") === "on",
    consentEmail: formData.get("consentEmail") === "on",
    consentSms: formData.get("consentSms") === "on",
    consentPhone: formData.get("consentPhone") === "on",
    consentContactSupport: formData.get("consentContactSupport") === "on",
    consentFacilitySharing: formData.get("consentFacilitySharing") === "on"
  };
}

export function validateIntakePayload(payload: IntakePayload): string[] {
  const errors: string[] = [];

  if (!payload.firstName) errors.push("First name is required.");
  if (!payload.lastName) errors.push("Last name is required.");
  if (!payload.email && !payload.phone) errors.push("Email or phone is required.");
  if (!payload.relationshipToResident) errors.push("Relationship to resident is required.");
  if (!payload.launchMarketSlug) errors.push("Launch market is required.");
  if (!payload.moveInTimeframe) errors.push("Move-in timeframe is required.");
  if (!payload.generalCareCategory) errors.push("General care category is required.");
  if (!payload.consentPrivacyAcknowledgment) {
    errors.push("Privacy notice acknowledgment is required.");
  }
  if (!payload.consentContactSupport) errors.push("Consent to contact for matching and scheduling support is required.");

  return errors;
}
