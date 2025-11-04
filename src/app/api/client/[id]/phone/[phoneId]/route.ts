import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { verifyClientAccess } from "@/lib/organization-helpers";

/**
 * DELETE /api/client/[id]/phone/[phoneId]
 * Remove a phone number from a client
 */
export async function DELETE(
  req: NextRequest,
  context: { params: { id: string; phoneId: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id: clientId, phoneId } = context.params;

    // Verify user has access to this client
    const access = await verifyClientAccess(session.user.id, clientId);
    if (!access.hasAccess) {
      return NextResponse.json(
        { error: "Unauthorized: You don't have access to this client" },
        { status: 403 }
      );
    }

    // Verify the phone number belongs to this client
    const phoneNumber = await prisma.phoneNumber.findFirst({
      where: {
        id: phoneId,
        clientId,
      },
    });

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number not found" },
        { status: 404 }
      );
    }

    // Delete the phone number
    await prisma.phoneNumber.delete({
      where: { id: phoneId },
    });

    return NextResponse.json({
      success: true,
      message: "Phone number removed successfully",
    });
  } catch (error) {
    console.error("Error removing phone number:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

