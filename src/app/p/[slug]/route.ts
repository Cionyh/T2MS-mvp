import { NextRequest, NextResponse } from "next/server"
import { getHostedPageBySlug } from "@/lib/hosted-page/get-page-data"
import {
  renderHostedNotFoundHtml,
  renderHostedPageHtml,
} from "@/lib/hosted-page/render-html"
import { normalizeHostedSlug } from "@/lib/hosted-page/slug"

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: rawSlug } = await context.params
    const slug = normalizeHostedSlug(rawSlug)

    if (!slug) {
      return htmlResponse(renderHostedNotFoundHtml(), 404)
    }

    const data = await getHostedPageBySlug(slug)
    if (!data) {
      return htmlResponse(renderHostedNotFoundHtml(), 404)
    }

    const protocol = req.headers.get("x-forwarded-proto") || "https"
    const host =
      req.headers.get("x-forwarded-host") ||
      req.headers.get("host") ||
      "www.t2ms.biz"
    const apiBase = `${protocol}://${host}`

    return htmlResponse(renderHostedPageHtml(data, apiBase), 200)
  } catch (err) {
    console.error("[hosted-page]", err)
    return htmlResponse(renderHostedNotFoundHtml(), 500)
  }
}

function htmlResponse(html: string, status: number) {
  return new NextResponse(html, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=60, s-maxage=120",
    },
  })
}
