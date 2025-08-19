/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    if (!id) {
      return NextResponse.json({ error: "Missing client ID" }, { status: 400 });
    }

    const body = await req.json();

    // Include pinned in destructure
    const {
      name,
      domain,
      phone,
      defaultType,
      defaultBgColor,
      defaultTextColor,
      defaultFont,
      defaultDismissAfter,
      pinned, // added pinned
    } = body;

    const updatedClient = await prisma.client.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(domain && { domain }),
        ...(phone && { phone }),
        ...(defaultType && { defaultType }),
        ...(defaultBgColor && { defaultBgColor }),
        ...(defaultTextColor && { defaultTextColor }),
        ...(defaultFont && { defaultFont }),
        ...(defaultDismissAfter && { defaultDismissAfter }),
        ...(pinned !== undefined && { pinned }), // safely update pinned
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
    const { id } = context.params;

    if (!id) {
      return NextResponse.json({ error: "Missing client ID" }, { status: 400 });
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
