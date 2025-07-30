import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: { clientId: string } }
) {
  const { clientId } = context.params;

  if (!clientId) {
    const res = NextResponse.json({ error: "Missing clientId" }, { status: 400 });
    res.headers.set("Access-Control-Allow-Origin", "*");
    res.headers.set("Access-Control-Allow-Methods", "GET");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type");
    return res;
  }

  const message = await prisma.message.findFirst({
    where: { clientId },
    orderBy: { createdAt: "desc" },
  });

  const res = NextResponse.json({ content: message?.content || "" });
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");

  return res;
}

// ✅ Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
