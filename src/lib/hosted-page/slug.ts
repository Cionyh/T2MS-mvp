import {
  HOSTED_SLUG_MAX_LENGTH,
  HOSTED_SLUG_MIN_LENGTH,
  RESERVED_HOSTED_SLUGS,
} from "./constants"

export type SlugValidationResult =
  | { ok: true; slug: string }
  | { ok: false; error: string }

export function normalizeHostedSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

export function validateHostedSlug(input: string): SlugValidationResult {
  const slug = normalizeHostedSlug(input)

  if (!slug) {
    return { ok: false, error: "Enter a page name for your URL." }
  }
  if (slug.length < HOSTED_SLUG_MIN_LENGTH) {
    return {
      ok: false,
      error: `Use at least ${HOSTED_SLUG_MIN_LENGTH} characters.`,
    }
  }
  if (slug.length > HOSTED_SLUG_MAX_LENGTH) {
    return {
      ok: false,
      error: `Use at most ${HOSTED_SLUG_MAX_LENGTH} characters.`,
    }
  }
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(slug)) {
    return {
      ok: false,
      error: "Use letters, numbers, and hyphens only (no leading/trailing hyphen).",
    }
  }
  if (RESERVED_HOSTED_SLUGS.has(slug)) {
    return { ok: false, error: "This name is reserved. Choose another." }
  }

  return { ok: true, slug }
}

/** Derive a valid hosted slug from an organization / site name. */
export function slugFromSiteName(siteName: string): string | null {
  const base = normalizeHostedSlug(siteName)
  if (!base) return null

  const direct = validateHostedSlug(base)
  if (direct.ok) return direct.slug

  if (base.length < HOSTED_SLUG_MIN_LENGTH) {
    for (const suffix of ["-page", "-live", "-hq"]) {
      const candidate = `${base}${suffix}`.slice(0, HOSTED_SLUG_MAX_LENGTH)
      const validated = validateHostedSlug(candidate)
      if (validated.ok) return validated.slug
    }
  }

  const truncated = base.slice(0, HOSTED_SLUG_MAX_LENGTH)
  const trimmed = validateHostedSlug(truncated)
  return trimmed.ok ? trimmed.slug : null
}

/** Suggest available alternatives when a slug is taken. */
export function suggestHostedSlugs(baseInput: string, count = 3): string[] {
  const base = normalizeHostedSlug(baseInput)
  if (!base) return []

  const suggestions: string[] = []
  const suffixes = ["-page", "-live", "-announcements", "2", "hq", "info"]

  for (const suffix of suffixes) {
    if (suggestions.length >= count) break
    const candidate = `${base}${suffix}`.slice(0, HOSTED_SLUG_MAX_LENGTH)
    const validated = validateHostedSlug(candidate)
    if (validated.ok && !suggestions.includes(validated.slug)) {
      suggestions.push(validated.slug)
    }
  }

  let n = 1
  while (suggestions.length < count && n < 100) {
    const candidate = `${base}-${n}`.slice(0, HOSTED_SLUG_MAX_LENGTH)
    const validated = validateHostedSlug(candidate)
    if (validated.ok && !suggestions.includes(validated.slug)) {
      suggestions.push(validated.slug)
    }
    n++
  }

  return suggestions
}
