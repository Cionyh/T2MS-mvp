import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  invitationId: string;
}

export async function GET(_: Request, { params }: { params: Params }) {
  try {
    const { invitationId } = params;

    if (!invitationId) {
      return NextResponse.json({ error: "Invitation ID is required" }, { status: 400 });
    }

    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
      select: {
        id: true,
        email: true,
        status: true,
        role: true,
        expiresAt: true,
        organization: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    return NextResponse.json({
      invitation: {
        id: invitation.id,
        email: invitation.email,
        status: invitation.status,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
        organizationName: invitation.organization?.name ?? "your team",
      },
    });
  } catch (error) {
    console.error("Failed to fetch invitation:", error);
    return NextResponse.json({ error: "Failed to fetch invitation" }, { status: 500 });
  }
}
