const YOUTUBE_ID_RE = /^[a-zA-Z0-9_-]{11}$/

/**
 * Accept watch, share, shorts, embed, and raw video IDs.
 * Returns null unless the ID is a valid 11-character YouTube id.
 */
export function parseYoutubeVideoId(
  input: string | null | undefined
): string | null {
  if (!input || typeof input !== "string") return null
  const raw = input.trim()
  if (!raw) return null
  if (YOUTUBE_ID_RE.test(raw)) return raw

  let url: URL
  try {
    url = new URL(raw.includes("://") ? raw : `https://${raw}`)
  } catch {
    return null
  }

  const host = url.hostname.replace(/^www\./, "").toLowerCase()
  const pathParts = url.pathname.split("/").filter(Boolean)

  if (host === "youtu.be") {
    const id = pathParts[0] || ""
    return YOUTUBE_ID_RE.test(id) ? id : null
  }

  const youtubeHosts = new Set([
    "youtube.com",
    "m.youtube.com",
    "music.youtube.com",
    "youtube-nocookie.com",
  ])
  if (!youtubeHosts.has(host)) return null

  const fromQuery = url.searchParams.get("v")
  if (fromQuery && YOUTUBE_ID_RE.test(fromQuery)) return fromQuery

  const prefix = pathParts.findIndex(
    (part) => part === "embed" || part === "shorts" || part === "live" || part === "v"
  )
  const fromPath = prefix >= 0 ? pathParts[prefix + 1] : ""
  return fromPath && YOUTUBE_ID_RE.test(fromPath) ? fromPath : null
}

export function getYoutubeEmbedUrl(
  input: string | null | undefined
): string | null {
  const id = parseYoutubeVideoId(input)
  if (!id) return null
  return `https://www.youtube-nocookie.com/embed/${id}`
}

export function youtubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
}

export function youtubeEmbedHtml(input: string | null | undefined): string {
  const url = getYoutubeEmbedUrl(input)
  if (!url) return ""
  return `<div class="t2ms-youtube"><iframe src="${url}" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe></div>`
}
