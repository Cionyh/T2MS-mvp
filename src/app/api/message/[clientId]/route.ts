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

    if (!latestMessage) {
      return NextResponse.json(
        { content: "No messages available for this client." },
        { status: 404 }
      );
    }

    return NextResponse.json({ content: latestMessage.content });
  } catch (err) {
    console.error("❌ Error fetching latest message:", err);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
