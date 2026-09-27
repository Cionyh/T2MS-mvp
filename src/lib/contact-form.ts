export const CONTACT_EMAIL = "support@t2ms.biz";

export const CONTACT_REASONS = [
  "General Question",
  "Sales / Product Information",
  "Technical Support",
  "Billing / Account",
  "Affiliate / Partner Program",
  "Chamber / Association Program",
  "Media / Other",
] as const;

export type ContactReason = (typeof CONTACT_REASONS)[number];

export const CONTACT_LIMITS = {
  name: 100,
  business: 150,
  email: 180,
  phone: 40,
  subject: 160,
  message: 5000,
} as const;

export interface ContactSubmission {
  name: string;
  business: string;
  email: string;
  phone: string;
  reason: ContactReason;
  subject: string;
  message: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function stripTags(value: string): string {
  return value.replace(/<[^>]*>/g, "");
}

function cleanLine(value: unknown): string {
  if (typeof value !== "string") return "";
  return stripTags(value.replace(/[\r\n\0]/g, " ")).trim();
}

function cleanMessage(value: unknown): string {
  if (typeof value !== "string") return "";
  return stripTags(value.replace(/\0/g, "")).trim();
}

export type ContactValidationResult =
  | { ok: true; data: ContactSubmission }
  | { ok: false; error: string };

export function validateContactSubmission(input: Record<string, unknown>): ContactValidationResult {
  const name = cleanLine(input.name);
  const business = cleanLine(input.business);
  const email = typeof input.email === "string" ? input.email.trim() : "";
  const phone = cleanLine(input.phone);
  const reason = cleanLine(input.reason);
  const subject = cleanLine(input.subject);
  const message = cleanMessage(input.message);

  if (!name || !email || !reason || !subject || !message) {
    return { ok: false, error: "Please complete all required fields and try again." };
  }

  if (/[\r\n]/.test(email) || email.length > CONTACT_LIMITS.email || !EMAIL_PATTERN.test(email)) {
    return { ok: false, error: "Please enter a valid email address and try again." };
  }

  if (!(CONTACT_REASONS as readonly string[]).includes(reason)) {
    return { ok: false, error: "Please select a valid contact category and try again." };
  }

  if (message.length > CONTACT_LIMITS.message) {
    return { ok: false, error: "Please shorten your message and try again." };
  }

  if (
    name.length > CONTACT_LIMITS.name ||
    business.length > CONTACT_LIMITS.business ||
    phone.length > CONTACT_LIMITS.phone ||
    subject.length > CONTACT_LIMITS.subject
  ) {
    return { ok: false, error: "Please check your information and try again." };
  }

  return {
    ok: true,
    data: { name, business, email, phone, reason: reason as ContactReason, subject, message },
  };
}
