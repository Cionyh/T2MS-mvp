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

    try {
      await prisma.client.update({
        where: {
          id: id,
        },
        data: body,
      });
    } catch (updateError: any) {
      console.error("Prisma UPDATE error:", updateError);
      return NextResponse.json(
        { error: "Failed to update client" },
        { status: 500 }
      );
    }

    console.log("Received PUT for ID:", id);
    console.log("Body:", body);

    return NextResponse.json({
      message: `Successfully updated client ${id}`,
      data: body,
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

    // Delete the client from the database using Prisma
    try {
      await prisma.client.delete({
        where: {
          id: id,
        },
      });
    } catch (deleteError: any) {
      console.error("Prisma DELETE error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete client" },
        { status: 500 }
      );
    }

    console.log("Successfully deleted client with ID:", id);

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