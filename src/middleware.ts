import { NextRequest, NextResponse } from "next/server"
import { getSessionCookie } from "better-auth/cookies"
import { getHostedPageDomain } from "@/lib/hosted-page/constants"
import { normalizeHostedSlug } from "@/lib/hosted-page/slug"

const PROTECTED_PREFIXES = ["/app", "/admin/dashboard", "/affiliate", "/onboarding"]

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
}

function rewriteHostedDomain(request: NextRequest): NextResponse | null {
  const hostHeader = request.headers.get("host")?.toLowerCase() ?? ""
  const host = hostHeader.split(":")[0]
  const hostedDomain = getHostedPageDomain()

  if (host !== hostedDomain && !host.endsWith(`.${hostedDomain}`)) {
    return null
  }

  // Apex / www: unlisted announcement marketing page for t2ms.live
  if (host === hostedDomain || host === `www.${hostedDomain}`) {
    const { pathname } = request.nextUrl
    if (pathname === "/" || pathname === "") {
      const url = request.nextUrl.clone()
      url.pathname = "/announce"
      return NextResponse.rewrite(url)
    }
    return null
  }

  const subdomain = host.slice(0, -(hostedDomain.length + 1))
  const slug = normalizeHostedSlug(subdomain.split(".")[0] ?? "")

  if (!slug) {
    return null
  }

  const url = request.nextUrl.clone()
  url.pathname = `/p/${slug}`
  return NextResponse.rewrite(url)
}

export async function middleware(request: NextRequest) {
  const hostedRewrite = rewriteHostedDomain(request)
  if (hostedRewrite) {
    return hostedRewrite
  }

  const { pathname } = request.nextUrl

  if (!isProtectedPath(pathname)) {
    return NextResponse.next()
  }

  const cookies = getSessionCookie(request)
  if (!cookies) {
    return NextResponse.redirect(new URL("/sign-in", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
