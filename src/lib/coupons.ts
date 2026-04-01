export const COUPON_STORAGE_KEY = "t2ms_coupon_code";

export function normalizeCouponCode(value: string | null | undefined): string | null {
  if (!value) return null;
  const normalized = value.trim().toUpperCase();
  if (!normalized) return null;
  return /^[A-Z0-9_-]{2,50}$/.test(normalized) ? normalized : null;
}

export function storeCouponCode(code: string | null) {
  if (typeof window === "undefined") return;
  if (!code) {
    window.localStorage.removeItem(COUPON_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(COUPON_STORAGE_KEY, code);
}

export function getStoredCouponCode(): string | null {
  if (typeof window === "undefined") return null;
  return normalizeCouponCode(window.localStorage.getItem(COUPON_STORAGE_KEY));
}

export function formatCouponPlan(plan: string) {
  if (plan === "pro") return "Growth";
  if (!plan) return "";
  return plan.charAt(0).toUpperCase() + plan.slice(1);
}

export function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}
