// /app/api/messages/[clientId]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { clientId: string } }
) {
  try {
    const { clientId } = params;

    const latestMessage = await prisma.message.findFirst({
      where: { clientId },
      orderBy: { createdAt: "desc" },
      select: { content: true },
    });

    const response = NextResponse.json(
      latestMessage || { content: "No messages available for this client." },
      { status: latestMessage ? 200 : 404 }
    );

    // ✅ Add CORS headers
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type");

    return response;
  } catch (err) {
    console.error("❌ Error fetching latest message:", err);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        }
      }
    );
  }
}

// ✅ Handle OPTIONS preflight requests (important for CORS)
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
