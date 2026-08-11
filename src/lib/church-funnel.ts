/**
 * Church campaign funnel (obscure public path — not linked from main marketing nav).
 * Share this URL only via outreach channels admins control.
 */
export const CHURCH_FUNNEL_PATH = "/c9471nujd7933ndaouek123" as const

/**
 * Former public paths — must not serve content or redirect to the funnel.
 * Blocked in middleware (404).
 */
export const CHURCH_FUNNEL_DISABLED_PATHS = [
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

export function isDisabledChurchFunnelPath(pathname: string): boolean {
  return CHURCH_FUNNEL_DISABLED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  )
}
