// app/api/messages/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/* ---------- DELETE /api/messages/:id ---------- */
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // Get the message ID from the route
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();
    if (!id) {
      return NextResponse.json({ error: "Message ID is required" }, { status: 400 });
    }

    // Verify the message exists and user has access via organization
    const message = await prisma.message.findUnique({
      where: { id },
      include: { client: true },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Check if user has access to the client via organization
    const { verifyClientAccess } = await import("@/lib/organization-helpers");
    const access = await verifyClientAccess(session.user.id, message.client.id);
    if (!access.hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete the message
    await prisma.message.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE_MESSAGE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
