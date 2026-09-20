import { isPlaceholderDomain } from "@/lib/client-setup"
import { getHostedPageDomain } from "@/lib/hosted-page/constants"

export type SiteDisplayInput = {
  domain?: string | null
  hostedSlug?: string | null
}

/**
 * Customer-facing site label. Never returns pending / *.t2ms.local placeholders.
 */
export function displaySiteLabel(site: SiteDisplayInput): string {
  const domain = site.domain?.trim() ?? ""
  if (domain && !isPlaceholderDomain(domain)) {
    return domain
  }

  const slug = site.hostedSlug?.trim() ?? ""
  if (slug) {
    return `${slug}.${getHostedPageDomain()}`
  }

  return "Hosted Announcement Page"
}

/** Full https URL when a hosted slug exists; otherwise null. */
export function displayHostedPageUrl(hostedSlug?: string | null): string | null {
  const slug = hostedSlug?.trim()
  if (!slug) return null
  return `https://${slug}.${getHostedPageDomain()}`
}
