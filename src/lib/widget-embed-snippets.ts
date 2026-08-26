import { IFRAME_EMBED_PRESETS } from "@/lib/widget-iframe-presets"

/** Placeholder shown in generic embed templates on the sites dashboard. */
export const WIDGET_EMBED_CLIENT_ID_PLACEHOLDER = "YOUR_CLIENT_ID"

const DEFAULT_API_BASE = "https://www.t2ms.biz"

export function buildScriptEmbedSnippet(
  apiBase: string,
  clientId: string
): string {
  return `<script
  src="${apiBase}/widget"
  data-client-id="${clientId}"
  data-api="${apiBase}"
  defer
></script>`.trim()
}

export function buildIframeEmbedSnippet(
  apiBase: string,
  clientId: string,
  width: string,
  height: string
): string {
  return `<iframe
  src="${apiBase}/widget/iframe?clientId=${clientId}"
  width="${width}"
  height="${height}"
  style="border:0;width:${width};min-height:80px;max-width:100%;display:block;"
  frameborder="0"
  scrolling="auto"
  allowtransparency="true"
  title="T2MS Announcements"
></iframe>`.trim()
}

export function buildIframeScriptEmbedSnippet(
  apiBase: string,
  clientId: string
): string {
  return `<script
  src="${apiBase}/widget/iframe-script"
  data-client-id="${clientId}"
  data-api="${apiBase}"
  defer
></script>`.trim()
}

export function getDefaultIframePreset() {
  return (
    IFRAME_EMBED_PRESETS.find((p) => p.id === "general") ??
    IFRAME_EMBED_PRESETS[IFRAME_EMBED_PRESETS.length - 1]
  )
}

export function resolveWidgetEmbedApiBase(
  fromBrowser?: string | null
): string {
  const trimmed = fromBrowser?.trim()
  if (trimmed) return trimmed
  const fromEnv = process.env.NEXT_PUBLIC_WIDGET_API_URL?.trim()
  if (fromEnv) return fromEnv
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (appUrl) return appUrl
  return DEFAULT_API_BASE
}
