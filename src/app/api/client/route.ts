import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const { name, domain, phone, userId } = body;

  if (!userId || !name || !domain || !phone) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const client = await prisma.client.create({
      data: {
        name,
        domain,
        phone,
        userId,
      },
    });

    return NextResponse.json({ id: client.id });
  } catch (error: any) {
    return NextResponse.json({ error: "Client creation failed" }, { status: 500 });
  }
}
