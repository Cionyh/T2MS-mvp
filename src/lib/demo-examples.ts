import { getHostedPageDomain } from "@/lib/hosted-page/constants"
import { BUILTIN_DEMO_SLUGS, DEMO_LOGO_PATHS } from "@/lib/hosted-page/demo-pages"

export type DemoExample = {
  slug: string
  label: string
  description: string
  style: "church" | "business" | "general"
  /** Optional preview image shown on the public /demo cards. */
  backgroundImage?: string
}

function isChurchDemoSlug(slug: string): boolean {
  return /church/i.test(slug)
}

function exampleFromSlug(slug: string, index: number): DemoExample {
  const domain = getHostedPageDomain()
  const slugStr = slug.trim()

  if (slugStr === "demo-business") {
    return {
      slug: slugStr,
      label: "Business announcement",
      description: "Hours, promotions, and live updates without a widget install.",
      style: "business",
      backgroundImage: DEMO_LOGO_PATHS.bakery,
    }
  }

  if (slugStr === "demo-church") {
    return {
      slug: slugStr,
      label: "Church announcement",
      description: "Simple hosted page for outreach and weekly updates.",
      style: "church",
    }
  }

  return {
    slug: slugStr,
    label: slugStr.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    description: `Live example at ${slugStr}.${domain}`,
    style: index === 0 ? "church" : "business",
  }
}

/** All configured demos (including church). Prefer getPublicDemoExamples for marketing UI. */
export function getDemoExamples(): DemoExample[] {
  const fromEnv = process.env.NEXT_PUBLIC_DEMO_HOSTED_SLUGS?.trim()

  if (fromEnv) {
    return fromEnv
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((slug, i) => exampleFromSlug(slug, i))
  }

  return BUILTIN_DEMO_SLUGS.map((slug, i) => exampleFromSlug(slug, i))
}

/**
 * Public /demo examples only — church campaign demos are excluded so the
 * special church offer path stays off the general marketing surface.
 */
export function getPublicDemoExamples(): DemoExample[] {
  return getDemoExamples().filter((ex) => !isChurchDemoSlug(ex.slug) && ex.style !== "church")
}

export function getPrimaryDemoSlug(): string {
  const examples = getPublicDemoExamples()
  return examples[0]?.slug ?? "demo-business"
}

export function hostedPublicUrl(slug: string): string {
  const domain = getHostedPageDomain()
  if (typeof window !== "undefined") {
    const host = window.location.host
    if (host.includes("localhost") || host.includes("127.0.0.1")) {
      return `${window.location.origin}/p/${slug}`
    }
  }
  return `https://${slug}.${domain}`
}
