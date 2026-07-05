import { prisma } from "@/lib/prisma"
import { getStaticDemoPageData } from "./demo-pages"
import type { HostedPageData, WidgetConfigJson } from "./types"

function parseWidgetConfig(raw: unknown): WidgetConfigJson {
  if (!raw || typeof raw !== "object") return {}
  return raw as WidgetConfigJson
}

export async function getHostedPageBySlug(
  slug: string
): Promise<HostedPageData | null> {
  const client = await prisma.client.findFirst({
    where: {
      hostedSlug: slug,
      hostedEnabled: true,
    },
    select: {
      id: true,
      name: true,
      hostedSlug: true,
      hostedIntroText: true,
      hostedFooterText: true,
      defaultBgColor: true,
      defaultTextColor: true,
      defaultFont: true,
      widgetConfig: true,
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { content: true },
      },
    },
  })

  if (!client?.hostedSlug) {
    return getStaticDemoPageData(slug)
  }

  const widgetConfig = parseWidgetConfig(client.widgetConfig)

  return {
    clientId: client.id,
    name: client.name,
    hostedSlug: client.hostedSlug,
    hostedIntroText: client.hostedIntroText,
    hostedFooterText: client.hostedFooterText,
    messageContent:
      client.messages[0]?.content ??
      "No announcement yet. Check back soon.",
    defaultBgColor: client.defaultBgColor || "#1a1a2e",
    defaultTextColor: client.defaultTextColor || "#ffffff",
    defaultFont: client.defaultFont || "sans-serif",
    widgetConfig,
  }
}
