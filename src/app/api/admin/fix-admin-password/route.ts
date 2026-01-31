import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * POST /api/admin/fix-admin-password
 * 
 * Fixes the admin user's password by using better-auth's password hashing
 * This endpoint recreates the account with the correct password format
 */
export async function POST(req: NextRequest) {
  try {
    const ADMIN_EMAIL = "admin@t2ms.com";
    const ADMIN_PASSWORD = "word2pass";

    // Find the admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
      include: {
        accounts: {
          where: {
            providerId: "credential",
          },
        },
      },
    });

    if (!adminUser) {
      return NextResponse.json(
        { error: "Admin user not found" },
        { status: 404 }
      );
    }

    // Delete existing credential account
    if (adminUser.accounts.length > 0) {
      await prisma.account.deleteMany({
        where: {
          userId: adminUser.id,
          providerId: "credential",
        },
      });
    }

    // Create a temporary user to get better-auth's password hash format
    const tempEmail = `temp_fix_${Date.now()}@t2ms.com`;
    const tempResult = await auth.api.signUpEmail({
      body: {
        email: tempEmail,
        password: ADMIN_PASSWORD,
        name: "Temp Fix",
      },
    });

    if (!tempResult?.user) {
      throw new Error("Failed to create temp user for password hash");
    }

    // Get the password hash from the temp account
    const tempAccount = await prisma.account.findFirst({
      where: {
        userId: tempResult.user.id,
        providerId: "credential",
      },
    });

    if (!tempAccount?.password) {
      // Clean up temp user
      await prisma.user.delete({ where: { id: tempResult.user.id } });
      throw new Error("Failed to get password hash from temp account");
    }

    // Create account for admin user with the correct password hash
    await prisma.account.create({
      data: {
        accountId: adminUser.id,
        providerId: "credential",
        userId: adminUser.id,
        password: tempAccount.password,
      },
    });

    // Clean up temp user
    await prisma.user.delete({ where: { id: tempResult.user.id } });

    return NextResponse.json({
      success: true,
      message: "Admin password fixed successfully. You can now log in.",
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
      },
    });
  } catch (error: any) {
    console.error("[FIX_ADMIN_PASSWORD]", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fix admin password",
      },
      { status: 500 }
    );
  }
}
