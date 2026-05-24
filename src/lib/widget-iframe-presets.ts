export type IframeEmbedPreset = {
  id: string
  label: string
  width: string
  height: string
  note: string
}

export const IFRAME_EMBED_PRESETS: IframeEmbedPreset[] = [
  {
    id: "wix",
    label: "Wix",
    width: "100%",
    height: "120px",
    note: "Use the HTML iframe embed. Set height to at least 80–120px for banners; increase for fullscreen-style widgets.",
  },
  {
    id: "squarespace",
    label: "Squarespace",
    width: "100%",
    height: "100px",
    note: "Code injection block — paste the iframe snippet; avoid nesting inside very small containers.",
  },
  {
    id: "godaddy",
    label: "GoDaddy",
    width: "100%",
    height: "100px",
    note: "Embed HTML widget — full width recommended.",
  },
  {
    id: "general",
    label: "General / responsive",
    width: "100%",
    height: "min(400px, 50vh)",
    note: "Good default for most sites. Adjust height if content is clipped.",
  },
]
