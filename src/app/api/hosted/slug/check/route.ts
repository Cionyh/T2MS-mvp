import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  suggestHostedSlugs,
  validateHostedSlug,
} from "@/lib/hosted-page/slug"

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const slugInput = req.nextUrl.searchParams.get("slug") ?? ""
    const excludeClientId =
      req.nextUrl.searchParams.get("excludeClientId") ?? undefined

    const validated = validateHostedSlug(slugInput)
    if (!validated.ok) {
      return NextResponse.json({
        available: false,
        slug: null,
        error: validated.error,
        suggestions: [],
      })
    }

    const existing = await prisma.client.findFirst({
      where: {
        hostedSlug: validated.slug,
        ...(excludeClientId ? { NOT: { id: excludeClientId } } : {}),
      },
      select: { id: true },
    })

    const available = !existing

    return NextResponse.json({
      available,
      slug: validated.slug,
      error: available ? null : "This page name is already taken.",
      suggestions: available
        ? []
        : suggestHostedSlugs(validated.slug),
    })
  } catch (err) {
    console.error("[hosted/slug/check]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
