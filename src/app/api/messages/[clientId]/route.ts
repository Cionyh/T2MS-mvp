import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: { clientId: string } }
) {
  const { clientId } = context.params;

  if (!clientId) {
    return NextResponse.json({ error: "Missing clientId" }, { status: 400 });
  }

  const message = await prisma.message.findFirst({
    where: { clientId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ content: message?.content || "" });
}
