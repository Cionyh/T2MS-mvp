/** Subdomain labels that cannot be claimed for hosted pages. */
export const RESERVED_HOSTED_SLUGS = new Set([
  "www",
  "api",
  "app",
  "admin",
  "dashboard",
  "staging",
  "stage",
  "dev",
  "test",
  "mail",
  "ftp",
  "cdn",
  "static",
  "assets",
  "help",
  "support",
  "billing",
  "login",
  "signin",
  "signup",
  "auth",
  "widget",
  "display",
  "embed",
  "p",
  "hosted",
  "demo",
  "null",
  "undefined",
])

export const HOSTED_SLUG_MIN_LENGTH = 3
export const HOSTED_SLUG_MAX_LENGTH = 48

export function getHostedPageDomain(): string {
  const fromPublic =
    typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_HOSTED_PAGE_DOMAIN?.trim()
  const fromServer =
    typeof process !== "undefined" &&
    process.env.HOSTED_PAGE_DOMAIN?.trim()
  return (fromPublic || fromServer || "t2ms.live").toLowerCase()
}

export function getHostedPageBaseUrl(): string {
  const domain = getHostedPageDomain()
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http"
  return `${protocol}://${domain}`
}
