/**
 * Hosted announcement page layout themes.
 * Safe for client + server import (no Prisma).
 */

export const HOSTED_THEME_IDS = [
  "classic",
  "light",
  "spotlight",
  "banner",
  "minimal",
] as const

export type HostedThemeId = (typeof HOSTED_THEME_IDS)[number]

export type HostedThemeMeta = {
  id: HostedThemeId
  name: string
  description: string
  /** Swatch colors for the settings picker preview */
  swatch: {
    bg: string
    card: string
    text: string
    accent: string
  }
}

export const HOSTED_THEMES: HostedThemeMeta[] = [
  {
    id: "classic",
    name: "Classic Dark",
    description: "Centered dark layout with a glass announcement card.",
    swatch: { bg: "#1a1a2e", card: "rgba(255,255,255,0.08)", text: "#ffffff", accent: "#f59e0b" },
  },
  {
    id: "light",
    name: "Clean Light",
    description: "Bright page with soft card and high-contrast text.",
    swatch: { bg: "#f4f6f8", card: "#ffffff", text: "#0f172a", accent: "#0d9488" },
  },
  {
    id: "spotlight",
    name: "Spotlight",
    description: "Bold floating card on a deep gradient backdrop.",
    swatch: { bg: "#0c1222", card: "#141b2d", text: "#f8fafc", accent: "#38bdf8" },
  },
  {
    id: "banner",
    name: "Brand Banner",
    description: "Colored header band with content on a light body.",
    swatch: { bg: "#f8fafc", card: "#ffffff", text: "#111827", accent: "#ea580c" },
  },
  {
    id: "minimal",
    name: "Minimal Type",
    description: "Typography-first, left-aligned, low chrome.",
    swatch: { bg: "#faf9f7", card: "transparent", text: "#1c1917", accent: "#b45309" },
  },
]

export function isHostedThemeId(value: unknown): value is HostedThemeId {
  return (
    typeof value === "string" &&
    (HOSTED_THEME_IDS as readonly string[]).includes(value)
  )
}

export function normalizeHostedTheme(value: unknown): HostedThemeId {
  return isHostedThemeId(value) ? value : "classic"
}

export function getHostedThemeMeta(id: HostedThemeId): HostedThemeMeta {
  return HOSTED_THEMES.find((t) => t.id === id) ?? HOSTED_THEMES[0]
}
