/**
 * Church campaign funnel (obscure public path — not linked from main marketing nav).
 * Share this URL only via outreach channels admins control.
 */
export const CHURCH_FUNNEL_PATH = "/c9471nujd7933ndaouek123" as const

/** Legacy paths that redirect to {@link CHURCH_FUNNEL_PATH}. */
export const CHURCH_FUNNEL_LEGACY_PATHS = [
  "/church-page-announcements",
  "/church-announcement",
] as const

/**
 * Absolute public URL for the church funnel landing page.
 */
export function getChurchFunnelPublicUrl(origin?: string): string {
  const base = (
    origin ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://www.text2mysite.com"
  ).replace(/\/$/, "")
  return `${base}${CHURCH_FUNNEL_PATH}`
}
