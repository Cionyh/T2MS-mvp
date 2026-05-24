/** Base URL for widget/iframe embed snippets (current app origin in browser). */
export function getEmbedApiBase(): string {
  if (typeof window !== "undefined") {
    return window.location.origin
  }
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim()
  return fromEnv || "https://www.t2ms.biz"
}
