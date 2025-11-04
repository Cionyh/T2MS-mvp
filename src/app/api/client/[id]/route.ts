/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { verifyClientAccess } from "@/lib/organization-helpers";

export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = context.params;

    if (!id) {
      return NextResponse.json({ error: "Missing client ID" }, { status: 400 });
    }

    // Verify user has access to this client via organization
    const access = await verifyClientAccess(session.user.id, id);
    if (!access.hasAccess) {
      return NextResponse.json(
        { error: "Unauthorized: You don't have access to this client" },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Include pinned and widgetConfig in destructure (phone removed - handled separately)
    const {
      name,
      domain,
      defaultType,
      defaultBgColor,
      defaultTextColor,
      defaultFont,
      defaultDismissAfter,
      pinned,
      widgetConfig,
    } = body;

    const updatedClient = await prisma.client.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(domain && { domain }),
        ...(defaultType && { defaultType }),
        ...(defaultBgColor && { defaultBgColor }),
        ...(defaultTextColor && { defaultTextColor }),
        ...(defaultFont && { defaultFont }),
        ...(defaultDismissAfter && { defaultDismissAfter }),
        ...(pinned !== undefined && { pinned }),
        ...(widgetConfig !== undefined && { widgetConfig }),
      },
    });

    return NextResponse.json({
      message: `Successfully updated client ${id}`,
      data: updatedClient,
    });
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = context.params;

    if (!id) {
      return NextResponse.json({ error: "Missing client ID" }, { status: 400 });
    }

    // Verify user has access to this client via organization
    const access = await verifyClientAccess(session.user.id, id);
    if (!access.hasAccess) {
      return NextResponse.json(
        { error: "Unauthorized: You don't have access to this client" },
        { status: 403 }
      );
    }

    await prisma.client.delete({
      where: { id },
    });

    return NextResponse.json({
      message: `Successfully deleted client ${id}`,
    });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
