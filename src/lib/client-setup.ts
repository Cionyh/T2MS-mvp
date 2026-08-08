/**
 * Helpers for incomplete site registration (optional domain/keyword at onboarding).
 * Safe for client + server import (no Prisma).
 */

import { planRequiresSmsKeyword } from "@/lib/plan-keyword"

/** Placeholder domains created when user skipped website during registration. */
export function isPlaceholderDomain(domain: string | null | undefined): boolean {
  if (!domain?.trim()) return true
  const d = domain.trim().toLowerCase()
  return d.endsWith(".t2ms.local") || d.startsWith("pending-")
}

export function hasSmsKeyword(keyword: string | null | undefined): boolean {
  return !!keyword?.trim()
}

/**
 * Widget embed needs a real website domain.
 * SMS keyword is only required on multi-site plans (pro / growth / enterprise)
 * so messages can be routed to the correct site.
 */
export function siteReadyForWidget(
  site: {
    domain?: string | null
    keyword?: string | null
  },
  plan?: string | null
): boolean {
  if (isPlaceholderDomain(site.domain)) return false
  if (planRequiresSmsKeyword(plan) && !hasSmsKeyword(site.keyword)) return false
  return true
}

/** What is still missing for widget enable on this plan. */
export function getWidgetSetupGaps(
  site: {
    domain?: string | null
    keyword?: string | null
  },
  plan?: string | null
): { needsDomain: boolean; needsKeyword: boolean } {
  return {
    needsDomain: isPlaceholderDomain(site.domain),
    needsKeyword: planRequiresSmsKeyword(plan) && !hasSmsKeyword(site.keyword),
  }
}

export function widgetSetupErrorMessage(
  site: {
    domain?: string | null
    keyword?: string | null
  },
  plan?: string | null
): string {
  const gaps = getWidgetSetupGaps(site, plan)
  if (gaps.needsDomain && gaps.needsKeyword) {
    return "Add your website domain and SMS keyword before enabling the widget."
  }
  if (gaps.needsDomain) {
    return "Add your website domain before enabling the widget."
  }
  if (gaps.needsKeyword) {
    return "Add an SMS keyword before enabling the widget (required for multi-site plans)."
  }
  return "Complete widget setup before enabling the widget."
}

/** Normalize user-entered domain to hostname without www. Throws on invalid. */
export function normalizeClientDomain(input: string): string {
  const raw = input.trim()
  if (!raw) {
    throw new Error("Domain is required")
  }
  const url = new URL(
    raw.startsWith("http://") || raw.startsWith("https://") ? raw : `https://${raw}`
  )
  const hostname = url.hostname.replace(/^www\./, "")
  if (!hostname) {
    throw new Error("Invalid domain format")
  }
  return hostname
}
