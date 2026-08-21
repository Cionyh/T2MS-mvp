export const REFERRAL_STORAGE_KEY = "t2ms_referral_code";

export function normalizeReferralCode(value: string | null | undefined): string | null {
  if (!value) return null;
  const normalized = value.trim().toUpperCase();
  if (!normalized) return null;
  return /^[A-Z0-9_-]{2,50}$/.test(normalized) ? normalized : null;
}

export function storeReferralCode(code: string | null) {
  if (typeof window === "undefined") return;
  if (!code) {
    window.localStorage.removeItem(REFERRAL_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(REFERRAL_STORAGE_KEY, code);
}

export function getStoredReferralCode(): string | null {
  if (typeof window === "undefined") return null;
  return normalizeReferralCode(window.localStorage.getItem(REFERRAL_STORAGE_KEY));
}

/** Public signup URL that captures this referral code via ?ref= */
export function buildReferralSignupUrl(
  code: string,
  origin?: string
): string {
  const normalized = normalizeReferralCode(code) || code.trim().toUpperCase();
  const base = (
    origin ||
    (typeof window !== "undefined" ? window.location.origin : "") ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://www.text2mysite.com"
  ).replace(/\/$/, "");
  return `${base}/signup?ref=${encodeURIComponent(normalized)}`;
}
