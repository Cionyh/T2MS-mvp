import type { HostedPageData } from "./types"

/** Built-in demo slugs served without a database Client record. */
export const BUILTIN_DEMO_SLUGS = ["demo-church", "demo-business"] as const

export type BuiltinDemoSlug = (typeof BUILTIN_DEMO_SLUGS)[number]

/** Public paths for built-in demo logos (served from /public/images/demo). */
export const DEMO_LOGO_PATHS = {
  church: "/images/demo/church-logo.svg",
  bakery: "/images/demo/bakery-logo.svg",
} as const

const STATIC_DEMO_PAGES: Record<BuiltinDemoSlug, HostedPageData> = {
  "demo-church": {
    clientId: "static-demo-church",
    name: "Grace Community Church",
    hostedSlug: "demo-church",
    hostedIntroText:
      "Welcome — see our latest announcement below. This is a live example hosted page.",
    hostedFooterText: null,
    hostedTheme: "banner",
    hostedLogoUrl: DEMO_LOGO_PATHS.church,
    messageContent:
      "Join us this Sunday at 10:00 AM for worship. All are welcome — bring a friend!",
    defaultBgColor: "#1a2744",
    defaultTextColor: "#ffffff",
    defaultFont: "Georgia, serif",
    widgetConfig: {
      companyWebsiteLink: "https://t2ms.biz",
      fontSize: 18,
    },
    isStaticDemo: true,
  },
  "demo-business": {
    clientId: "static-demo-business",
    name: "Main Street Bakery",
    hostedSlug: "demo-business",
    hostedIntroText:
      "Fresh daily — see today's update below. This is a live example hosted page.",
    hostedFooterText: null,
    hostedTheme: "spotlight",
    hostedLogoUrl: DEMO_LOGO_PATHS.bakery,
    messageContent:
      "We're open today 7 AM – 3 PM. Stop by for fresh croissants and coffee!",
    defaultBgColor: "#3d2914",
    defaultTextColor: "#fff8f0",
    defaultFont: "sans-serif",
    widgetConfig: {
      companyWebsiteLink: "https://t2ms.biz",
      fontSize: 18,
    },
    isStaticDemo: true,
  },
}

export function isBuiltinDemoSlug(slug: string): slug is BuiltinDemoSlug {
  return (BUILTIN_DEMO_SLUGS as readonly string[]).includes(slug)
}

export function getStaticDemoPageData(slug: string): HostedPageData | null {
  if (!isBuiltinDemoSlug(slug)) return null
  return STATIC_DEMO_PAGES[slug]
}
