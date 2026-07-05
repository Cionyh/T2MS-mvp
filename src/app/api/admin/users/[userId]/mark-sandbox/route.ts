import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { markUserAsSandbox } from "@/lib/sandbox-users";

type Params = { params: Promise<{ userId: string }> };

/**
 * POST /api/admin/users/[userId]/mark-sandbox
 * Manually flag a user as sandbox-registered (e.g. legacy accounts).
 */
export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId } = await params;
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const result = await markUserAsSandbox(userId);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to mark user as sandbox";
    const status =
      message === "User not found"
        ? 404
        : message.includes("already") || message.includes("Admin accounts")
          ? 400
          : 500;

    if (status === 500) {
      console.error("[MARK_SANDBOX_USER]", error);
    }

    return NextResponse.json({ error: message }, { status });
  }
}
