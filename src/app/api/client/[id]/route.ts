import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "Missing client ID" }, { status: 400 });
    }

    const body = await req.json();

    console.log("Received PUT for ID:", id);
    console.log("Body:", body);

    return NextResponse.json({
      message: `Successfully received PUT for client ${id}`,
      data: body,
    });
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
