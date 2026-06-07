import { getHostedPageDomain } from "@/lib/hosted-page/constants"

export type DemoExample = {
  slug: string
  label: string
  description: string
  style: "church" | "business" | "general"
}

/** Comma-separated slugs from env, or built-in placeholders for local dev. */
export function getDemoExamples(): DemoExample[] {
  const fromEnv = process.env.NEXT_PUBLIC_DEMO_HOSTED_SLUGS?.trim()
  const domain = getHostedPageDomain()

  if (fromEnv) {
    return fromEnv.split(",").map((slug, i) => {
      const s = slug.trim()
      return {
        slug: s,
        label: s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        description: `Live example at ${s}.${domain}`,
        style: i === 0 ? "church" : "business",
      }
    })
  }

  return [
    {
      slug: "demo-church",
      label: "Church announcement",
      description: "Simple hosted page for outreach and weekly updates.",
      style: "church",
    },
    {
      slug: "demo-business",
      label: "Business announcement",
      description: "Hours, promotions, and live updates without a widget install.",
      style: "business",
    },
  ]
}

export function getPrimaryDemoSlug(): string {
  const examples = getDemoExamples()
  return examples[0]?.slug ?? "demo-church"
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
