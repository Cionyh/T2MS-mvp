import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { clientId: string } }
) {
  const { clientId } = params;

  if (!clientId) {
    return NextResponse.json({ error: "Missing clientId" }, { status: 400 });
  }

  const message = await prisma.message.findFirst({
    where: { clientId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ content: message?.content || "" });
}
