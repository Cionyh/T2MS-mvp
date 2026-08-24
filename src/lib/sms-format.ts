/**
 * SMS display formatting. Store messages as typed; apply this only when rendering.
 * Supported tokens (documented on the sites dashboard):
 *   *bold*   → <strong>
 *   _italic_ → <em>
 *   - item   → • item  (line start)
 * Newlines become <br /> unless singleLine is set (ticker).
 * HTML in the SMS is escaped first.
 */

export function escapeSmsHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

export function formatSmsMessageHtml(
  text: string,
  options?: { singleLine?: boolean }
): string {
  const escaped = escapeSmsHtml(text ?? "")
  const withInline = escaped
    .replace(/\*([^*\n]+)\*/g, "<strong>$1</strong>")
    .replace(/_([^_\n]+)_/g, "<em>$1</em>")
  const lines = withInline.split(/\r\n|\r|\n/).map((line) =>
    line.replace(/^\s*-\s+/, "• ")
  )
  return lines.join(options?.singleLine ? " " : "<br />")
}

/** Same formatter for widget / hosted-page poll scripts. */
export const FORMAT_SMS_MESSAGE_CLIENT_JS = `
function formatSmsMessageHtml(text, singleLine) {
  var escaped = String(text == null ? "" : text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
  var withInline = escaped
    .replace(/\\*([^\\*\\n]+)\\*/g, "<strong>$1</strong>")
    .replace(/_([^_\\n]+)_/g, "<em>$1</em>");
  var lines = withInline.split(/\\r\\n|\\r|\\n/);
  var out = [];
  for (var i = 0; i < lines.length; i++) {
    out.push(lines[i].replace(/^\\s*-\\s+/, "• "));
  }
  return out.join(singleLine ? " " : "<br />");
}
`.trim()
