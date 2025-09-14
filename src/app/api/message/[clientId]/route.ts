import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { clientId: string } }
) {
  try {
    const { clientId } = params;

    // Fetch client defaults including pinned and widget config
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: {
        defaultType: true,
        defaultBgColor: true,
        defaultTextColor: true,
        defaultFont: true,
        defaultDismissAfter: true,
        pinned: true,
        widgetConfig: true,
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    // Fetch latest message for this client
    const latestMessage = await prisma.message.findFirst({
      where: { clientId },
      orderBy: { createdAt: "desc" },
      select: { 
        content: true,
        createdAt: true
      },
    });

    const messageData = {
      content: latestMessage?.content || "No messages available for this client.",
      type: client.defaultType || "banner",
      bgColor: client.defaultBgColor || "#222",
      textColor: client.defaultTextColor || "#fff",
      font: client.defaultFont || "sans-serif",
      dismissAfter: client.defaultDismissAfter || 5000,
      pinned: client.pinned || false,
      widgetConfig: client.widgetConfig || {},
    };

    const response = NextResponse.json(messageData, { status: 200 });

    // CORS headers
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type");

    return response;
  } catch (err) {
    console.error("❌ Error fetching latest message:", err);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  }
}

// OPTIONS preflight for CORS
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
