const PARTNER_DOMAINS = ["westminster.ac.uk"] as const;

export type PartnerDomain = (typeof PARTNER_DOMAINS)[number];

function extractEmailDomain(email: string): string {
  const atIndex = email.lastIndexOf("@");
  if (atIndex === -1) return "";
  return email.slice(atIndex + 1).toLowerCase();
}

export function isPartnerEmail(email: string): boolean {
  const domain = extractEmailDomain(email);
  return PARTNER_DOMAINS.includes(domain as PartnerDomain);
}

export function getPartnerDomain(email: string): PartnerDomain | null {
  const domain = extractEmailDomain(email);
  if (PARTNER_DOMAINS.includes(domain as PartnerDomain)) {
    return domain as PartnerDomain;
  }
  return null;
}
