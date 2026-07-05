import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { migrateSandboxUserToLive } from "@/lib/sandbox-users";

type Params = { params: Promise<{ userId: string }> };

/**
 * POST /api/admin/users/[userId]/migrate-to-live
 * Move a sandbox-registered user to live (clears test billing, keeps sites/data).
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

    const result = await migrateSandboxUserToLive(userId);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to migrate user";
    const status =
      message === "User not found"
        ? 404
        : message.includes("already been migrated") ||
            message.includes("not registered from sandbox") ||
            message.includes("Admin accounts")
          ? 400
          : 500;

    if (status === 500) {
      console.error("[MIGRATE_SANDBOX_USER]", error);
    }

    return NextResponse.json({ error: message }, { status });
  }
}
