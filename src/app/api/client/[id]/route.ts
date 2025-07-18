import { NextRequest, NextResponse } from "next/server";

interface Params {
  id: string;
}

interface Context {
  params: Params;
  // you can add other properties if needed
}

export async function PUT(
  req: NextRequest,
  context: Context
) {
  try {
    const { id } = context.params;

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
