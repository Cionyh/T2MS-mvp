import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { verifyClientAccess } from "@/lib/organization-helpers"
import { getHostedPageDomain } from "@/lib/hosted-page/constants"
import { validateHostedSlug } from "@/lib/hosted-page/slug"
import { sendHostedWelcomeEmailForClient } from "@/lib/hosted-welcome-notify"
import {
  isHostedThemeId,
  normalizeHostedTheme,
} from "@/lib/hosted-page/themes"
import { parseYoutubeVideoId } from "@/lib/youtube-embed"

type RouteContext = { params: Promise<{ id: string }> }

function normalizeOptionalUrl(value: unknown): string | null | undefined {
  if (value === undefined) return undefined
  if (value === null) return null
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed ? trimmed.slice(0, 2000) : null
}

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { id } = await context.params
    const access = await verifyClientAccess(session.user.id, id)
    if (!access.hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const client = await prisma.client.findUnique({
      where: { id },
      select: {
        hostedSlug: true,
        hostedEnabled: true,
        hostedIntroText: true,
        hostedFooterText: true,
        hostedTheme: true,
        hostedShowLogo: true,
        hostedShowWebsiteLink: true,
        hostedLogoUrl: true,
        hostedBackgroundImageUrl: true,
        hostedContentImageUrl: true,
        hostedYoutubeUrl: true,
        hostedPublishedAt: true,
        widgetConfig: true,
      },
    })

    if (!client) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const slug = client.hostedSlug
    const publicUrls = slug
      ? {
          path: `/p/${slug}`,
          subdomain: `https://${slug}.${getHostedPageDomain()}`,
        }
      : null

    const config =
      client.widgetConfig && typeof client.widgetConfig === "object"
        ? (client.widgetConfig as Record<string, unknown>)
        : {}
    const companyWebsiteLink =
      typeof config.companyWebsiteLink === "string"
        ? config.companyWebsiteLink.trim()
        : ""

    const { widgetConfig: _widgetConfig, ...rest } = client

    return NextResponse.json({
      ...rest,
      hostedTheme: normalizeHostedTheme(client.hostedTheme),
      companyWebsiteLink: companyWebsiteLink || null,
      publicUrls,
    })
  } catch (err) {
    console.error("[client/hosted GET]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { id } = await context.params
    const access = await verifyClientAccess(session.user.id, id)
    if (!access.hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const {
      hostedSlug,
      hostedEnabled,
      hostedIntroText,
      hostedFooterText,
      hostedTheme,
      hostedShowLogo,
      hostedShowWebsiteLink,
      hostedLogoUrl,
      hostedBackgroundImageUrl,
      hostedContentImageUrl,
      hostedYoutubeUrl,
    } = body as {
      hostedSlug?: string | null
      hostedEnabled?: boolean
      hostedIntroText?: string | null
      hostedFooterText?: string | null
      hostedTheme?: string | null
      hostedShowLogo?: boolean
      hostedShowWebsiteLink?: boolean
      hostedLogoUrl?: string | null
      hostedBackgroundImageUrl?: string | null
      hostedContentImageUrl?: string | null
      hostedYoutubeUrl?: string | null
    }

    const existing = await prisma.client.findUnique({
      where: { id },
      select: {
        hostedSlug: true,
        hostedPublishedAt: true,
        hostedEnabled: true,
      },
    })

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const updateData: {
      hostedSlug?: string | null
      hostedEnabled?: boolean
      hostedIntroText?: string | null
      hostedFooterText?: string | null
      hostedTheme?: string
      hostedShowLogo?: boolean
      hostedShowWebsiteLink?: boolean
      hostedLogoUrl?: string | null
      hostedBackgroundImageUrl?: string | null
      hostedContentImageUrl?: string | null
      hostedYoutubeUrl?: string | null
      hostedPublishedAt?: Date | null
    } = {}

    if (hostedIntroText !== undefined) {
      const trimmed =
        typeof hostedIntroText === "string" ? hostedIntroText.trim() : ""
      updateData.hostedIntroText = trimmed ? trimmed.slice(0, 500) : null
    }

    if (hostedFooterText !== undefined) {
      const trimmed =
        typeof hostedFooterText === "string" ? hostedFooterText.trim() : ""
      updateData.hostedFooterText = trimmed ? trimmed.slice(0, 1000) : null
    }

    if (hostedTheme !== undefined) {
      if (!isHostedThemeId(hostedTheme)) {
        return NextResponse.json(
          {
            error:
              "Invalid page style. Choose classic, light, spotlight, banner, minimal, aurora, or stage.",
          },
          { status: 400 }
        )
      }
      updateData.hostedTheme = hostedTheme
    }

    if (hostedShowLogo !== undefined) {
      updateData.hostedShowLogo = Boolean(hostedShowLogo)
    }

    if (hostedShowWebsiteLink !== undefined) {
      updateData.hostedShowWebsiteLink = Boolean(hostedShowWebsiteLink)
    }

    const logo = normalizeOptionalUrl(hostedLogoUrl)
    if (logo !== undefined) {
      updateData.hostedLogoUrl = logo
    }

    const bg = normalizeOptionalUrl(hostedBackgroundImageUrl)
    if (bg !== undefined) {
      updateData.hostedBackgroundImageUrl = bg
    }

    const contentImage = normalizeOptionalUrl(hostedContentImageUrl)
    if (contentImage !== undefined) {
      updateData.hostedContentImageUrl = contentImage
    }

    if (hostedYoutubeUrl !== undefined) {
      if (hostedYoutubeUrl === null) {
        updateData.hostedYoutubeUrl = null
      } else if (typeof hostedYoutubeUrl === "string") {
        const trimmed = hostedYoutubeUrl.trim()
        if (!trimmed) {
          updateData.hostedYoutubeUrl = null
        } else if (!parseYoutubeVideoId(trimmed)) {
          return NextResponse.json(
            {
              error:
                "Enter a valid YouTube link (youtube.com/watch, youtu.be, Shorts, or embed).",
            },
            { status: 400 }
          )
        } else {
          updateData.hostedYoutubeUrl = trimmed.slice(0, 2000)
        }
      } else {
        updateData.hostedYoutubeUrl = null
      }
    }

    if (hostedSlug !== undefined) {
      if (hostedSlug === null || hostedSlug === "") {
        updateData.hostedSlug = null
        updateData.hostedEnabled = false
        updateData.hostedPublishedAt = null
      } else {
        const validated = validateHostedSlug(hostedSlug)
        if (!validated.ok) {
          return NextResponse.json({ error: validated.error }, { status: 400 })
        }

        const taken = await prisma.client.findFirst({
          where: {
            hostedSlug: validated.slug,
            NOT: { id },
          },
          select: { id: true },
        })

        if (taken) {
          return NextResponse.json(
            { error: "This page name is already taken." },
            { status: 409 }
          )
        }

        updateData.hostedSlug = validated.slug
      }
    }

    if (hostedEnabled !== undefined) {
      updateData.hostedEnabled = Boolean(hostedEnabled)
      if (updateData.hostedEnabled) {
        if (!existing.hostedSlug && !updateData.hostedSlug) {
          return NextResponse.json(
            { error: "Choose a page URL name before enabling the hosted page." },
            { status: 400 }
          )
        }
        if (!existing.hostedPublishedAt) {
          updateData.hostedPublishedAt = new Date()
        }
      }
    }

    const updated = await prisma.client.update({
      where: { id },
      data: updateData,
      select: {
        hostedSlug: true,
        hostedEnabled: true,
        hostedIntroText: true,
        hostedFooterText: true,
        hostedTheme: true,
        hostedShowLogo: true,
        hostedShowWebsiteLink: true,
        hostedLogoUrl: true,
        hostedBackgroundImageUrl: true,
        hostedContentImageUrl: true,
        hostedYoutubeUrl: true,
        hostedPublishedAt: true,
      },
    })

    const slug = updated.hostedSlug
    const publicUrls = slug
      ? {
          path: `/p/${slug}`,
          subdomain: `https://${slug}.${getHostedPageDomain()}`,
        }
      : null

    const isFirstPublish =
      !existing.hostedPublishedAt &&
      updated.hostedEnabled &&
      Boolean(updated.hostedSlug)

    if (isFirstPublish) {
      sendHostedWelcomeEmailForClient(id, session.user.id).catch((err) =>
        console.error("[client/hosted PATCH] Hosted welcome email failed:", err)
      )
    }

    return NextResponse.json({
      message: "Hosted page settings saved",
      data: {
        ...updated,
        hostedTheme: normalizeHostedTheme(updated.hostedTheme),
        publicUrls,
      },
    })
  } catch (err) {
    console.error("[client/hosted PATCH]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
