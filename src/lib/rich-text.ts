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

function truncateRichHtml(html: string, maxPlainLength: number): string {
  if (richTextPlainLength(html) <= maxPlainLength) return html

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
  const openStrong = (out.match(/<strong>/gi) || []).length
  const closeStrong = (out.match(/<\/strong>/gi) || []).length
  const openEm = (out.match(/<em>/gi) || []).length
  const closeEm = (out.match(/<\/em>/gi) || []).length
  if (openStrong > closeStrong) out += "</strong>".repeat(openStrong - closeStrong)
  if (openEm > closeEm) out += "</em>".repeat(openEm - closeEm)
  return out
}

/**
 * Normalize editor / stored content to a safe HTML fragment.
 */
export function sanitizeBasicRichText(
  raw: string,
  maxPlainLength = 1000
): string {
  const trimmed = (raw ?? "").replace(/\u200B/g, "").trim()
  if (!trimmed) return ""

  let html: string
  if (!looksLikeHtml(trimmed)) {
    html = escapeHtmlText(trimmed).replace(/\r\n|\r|\n/g, "<br />")
  } else {
    html = trimmed
      .replace(/&nbsp;/gi, " ")
      // Newlines inside HTML (contentEditable / pre-wrap) must become real breaks
      .replace(/\r\n|\r|\n/g, "<br />")
      .replace(/<\/?(b|strong)\b[^>]*>/gi, (m) =>
        m.toLowerCase().startsWith("</") ? "</strong>" : "<strong>"
      )
      .replace(/<\/?(i|em)\b[^>]*>/gi, (m) =>
        m.toLowerCase().startsWith("</") ? "</em>" : "<em>"
      )
      .replace(/<br\s*\/?>/gi, "<br />")
      // Chrome contentEditable uses <div>/<p> for Enter — treat as line breaks
      .replace(/<div\b[^>]*>/gi, "<br />")
      .replace(/<\/div>/gi, "")
      .replace(/<p\b[^>]*>/gi, "<br />")
      .replace(/<\/p>/gi, "")
      // Drop any other tags (keeps text content)
      .replace(/<(?!\/?(?:strong|em|br)\b)[^>]*>/gi, "")
      .replace(/<strong>\s*<\/strong>/gi, "")
      .replace(/<em>\s*<\/em>/gi, "")
      .replace(/^(?:<br \/>\s*)+/i, "")
      .replace(/(?:<br \/>\s*){3,}/gi, "<br /><br />")
      .trim()

    // Escape any leftover raw < that isn't our allowlist
    html = html.replace(/<(?!\/?(?:strong|em|br)\b)/gi, "&lt;")
  }

  return truncateRichHtml(html, maxPlainLength)
}

/**
 * Walk a contentEditable root and build safe HTML with explicit <br /> breaks.
 * Prefer this over reading innerHTML so visual line breaks always persist.
 */
export function serializeContentEditable(root: HTMLElement): string {
  const parts: string[] = []

  const pushBreak = () => {
    if (parts.length === 0) return
    if (parts[parts.length - 1] === "<br />") return
    parts.push("<br />")
  }

  const walk = (node: Node, isRootChild = false) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = (node.textContent ?? "").replace(/\u200B/g, "")
      if (!text) return
      // Preserve explicit newlines in text nodes
      const chunks = text.split(/\r\n|\r|\n/)
      chunks.forEach((chunk, idx) => {
        if (idx > 0) parts.push("<br />")
        if (chunk) parts.push(escapeHtmlText(chunk))
      })
      return
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return
    const el = node as HTMLElement
    const tag = el.tagName.toLowerCase()

    if (tag === "br") {
      parts.push("<br />")
      return
    }

    if (tag === "strong" || tag === "b") {
      parts.push("<strong>")
      Array.from(el.childNodes).forEach((child) => walk(child))
      parts.push("</strong>")
      return
    }

    if (tag === "em" || tag === "i") {
      parts.push("<em>")
      Array.from(el.childNodes).forEach((child) => walk(child))
      parts.push("</em>")
      return
    }

    if (tag === "div" || tag === "p") {
      if (!isRootChild || parts.length > 0) pushBreak()
      // Empty block (Chrome trailing Enter) still counts as a break
      if (el.childNodes.length === 0 || (el.childNodes.length === 1 && (el.firstChild as HTMLElement)?.tagName === "BR")) {
        // pushBreak already added one; empty div with lone <br> is one visual blank line
        const onlyBr =
          el.childNodes.length === 1 &&
          (el.firstChild as HTMLElement)?.tagName === "BR"
        if (onlyBr) {
          // already one break from block start; the inner br is the blank line
          parts.push("<br />")
        }
        return
      }
      Array.from(el.childNodes).forEach((child) => walk(child))
      return
    }

    Array.from(el.childNodes).forEach((child) => walk(child))
  }

  Array.from(root.childNodes).forEach((child) => walk(child, true))

  return parts
    .join("")
    .replace(/^(?:<br \/>)+/i, "")
    .replace(/(?:<br \/>){3,}/gi, "<br /><br />")
}

/** HTML suitable for contentEditable initial value. */
export function richTextToEditorHtml(stored: string): string {
  const safe = sanitizeBasicRichText(stored, 100_000)
  return safe || ""
}
