import { CHURCH_PLAN_ID } from "@/lib/church-pricing"

export const CHURCH_VERIFICATION_PENDING = "pending" as const
export const CHURCH_VERIFICATION_VERIFIED = "verified" as const
export const CHURCH_VERIFICATION_REJECTED = "rejected" as const

export type ChurchVerificationStatus =
  | typeof CHURCH_VERIFICATION_PENDING
  | typeof CHURCH_VERIFICATION_VERIFIED
  | typeof CHURCH_VERIFICATION_REJECTED

export const CHURCH_PRICE_LOCK_YEARS = 3

export function isChurchIntroAutoVerifyEnabled(): boolean {
  return process.env.CHURCH_INTRO_AUTO_VERIFY?.trim().toLowerCase() === "true"
}

export function getChurchPriceLockUntil(from: Date = new Date()): Date {
  const lockedUntil = new Date(from)
  lockedUntil.setFullYear(lockedUntil.getFullYear() + CHURCH_PRICE_LOCK_YEARS)
  return lockedUntil
}

export function canSubscribeToChurchPlan(
  churchVerificationStatus: string | null | undefined
): boolean {
  if (isChurchIntroAutoVerifyEnabled()) {
    return churchVerificationStatus !== CHURCH_VERIFICATION_REJECTED
  }
  return churchVerificationStatus === CHURCH_VERIFICATION_VERIFIED
}

export function isChurchPlanId(planId: string | null | undefined): boolean {
  return planId === CHURCH_PLAN_ID
}

export function churchVerificationLabel(
  status: string | null | undefined
): string {
  switch (status) {
    case CHURCH_VERIFICATION_VERIFIED:
      return "Verified"
    case CHURCH_VERIFICATION_PENDING:
      return "Pending review"
    case CHURCH_VERIFICATION_REJECTED:
      return "Not eligible"
    default:
      return "Not submitted"
  }
}
