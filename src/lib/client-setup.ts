/**
 * Helpers for incomplete site registration (optional domain/keyword at onboarding).
 * Safe for client + server import (no Prisma).
 */

/** Placeholder domains created when user skipped website during registration. */
export function isPlaceholderDomain(domain: string | null | undefined): boolean {
  if (!domain?.trim()) return true;
  const d = domain.trim().toLowerCase();
  return d.endsWith(".t2ms.local") || d.startsWith("pending-");
}

export function hasSmsKeyword(keyword: string | null | undefined): boolean {
  return !!keyword?.trim();
}

/** Widget embed needs a real website domain and SMS keyword. */
export function siteReadyForWidget(site: {
  domain?: string | null;
  keyword?: string | null;
}): boolean {
  return !isPlaceholderDomain(site.domain) && hasSmsKeyword(site.keyword);
}

/** What is still missing for widget enable. */
export function getWidgetSetupGaps(site: {
  domain?: string | null;
  keyword?: string | null;
}): { needsDomain: boolean; needsKeyword: boolean } {
  return {
    needsDomain: isPlaceholderDomain(site.domain),
    needsKeyword: !hasSmsKeyword(site.keyword),
  };
}

/** Normalize user-entered domain to hostname without www. Throws on invalid. */
export function normalizeClientDomain(input: string): string {
  const raw = input.trim();
  if (!raw) {
    throw new Error("Domain is required");
  }
  const url = new URL(
    raw.startsWith("http://") || raw.startsWith("https://") ? raw : `https://${raw}`
  );
  const hostname = url.hostname.replace(/^www\./, "");
  if (!hostname) {
    throw new Error("Invalid domain format");
  }
  return hostname;
}
