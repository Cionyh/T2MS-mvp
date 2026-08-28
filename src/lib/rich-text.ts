/**
 * Safe subset for hosted intro/footer: <strong>, <em>, <br /> only.
 * Plain text (legacy) is escaped and newlines become <br />.
 */

export function escapeHtmlText(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

function looksLikeHtml(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value)
}

/** Visible character length ignoring tags (for maxLength UX). */
export function richTextPlainLength(html: string): number {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?(strong|em|b|i|p|div)\b[^>]*>/gi, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .length
}

/**
 * Normalize editor / stored content to a safe HTML fragment.
 */
export function sanitizeBasicRichText(
  raw: string,
  maxPlainLength = 1000
): string {
  const trimmed = (raw ?? "").trim()
  if (!trimmed) return ""

  let html: string
  if (!looksLikeHtml(trimmed)) {
    html = escapeHtmlText(trimmed).replace(/\r\n|\r|\n/g, "<br />")
  } else {
    html = trimmed
      .replace(/&nbsp;/gi, " ")
      .replace(/<\/?(b|strong)\b[^>]*>/gi, (m) =>
        m.toLowerCase().startsWith("</") ? "</strong>" : "<strong>"
      )
      .replace(/<\/?(i|em)\b[^>]*>/gi, (m) =>
        m.toLowerCase().startsWith("</") ? "</em>" : "<em>"
      )
      .replace(/<br\s*\/?>/gi, "<br />")
      .replace(/<\/p>\s*<p\b[^>]*>/gi, "<br />")
      .replace(/<\/?p\b[^>]*>/gi, "")
      .replace(/<\/div>\s*<div\b[^>]*>/gi, "<br />")
      .replace(/<\/?div\b[^>]*>/gi, "")
      // Drop any other tags (keeps text content)
      .replace(/<(?!\/?(?:strong|em|br)\b)[^>]*>/gi, "")
      // Collapse empty wrappers
      .replace(/<strong>\s*<\/strong>/gi, "")
      .replace(/<em>\s*<\/em>/gi, "")
      .replace(/(?:<br \/>\s*){3,}/gi, "<br /><br />")
      .trim()

    // Escape any leftover raw < that isn't our allowlist (defense in depth)
    html = html.replace(/<(?!\/?(?:strong|em|br)\b)/gi, "&lt;")
  }

  // Enforce plain-text length budget
  if (richTextPlainLength(html) <= maxPlainLength) return html

  // Truncate by walking characters outside tags
  let plain = 0
  let out = ""
  let i = 0
  while (i < html.length && plain < maxPlainLength) {
    if (html[i] === "<") {
      const end = html.indexOf(">", i)
      if (end === -1) break
      out += html.slice(i, end + 1)
      i = end + 1
      continue
    }
    out += html[i]
    plain += 1
    i += 1
  }
  // Close open tags if truncated mid-wrapper
  const openStrong = (out.match(/<strong>/gi) || []).length
  const closeStrong = (out.match(/<\/strong>/gi) || []).length
  const openEm = (out.match(/<em>/gi) || []).length
  const closeEm = (out.match(/<\/em>/gi) || []).length
  if (openStrong > closeStrong) out += "</strong>".repeat(openStrong - closeStrong)
  if (openEm > closeEm) out += "</em>".repeat(openEm - closeEm)
  return out
}

/** HTML suitable for contentEditable initial value. */
export function richTextToEditorHtml(stored: string): string {
  const safe = sanitizeBasicRichText(stored, 100_000)
  return safe || ""
}
