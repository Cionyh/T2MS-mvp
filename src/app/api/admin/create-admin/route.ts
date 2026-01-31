import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

/**
 * POST /api/admin/create-admin
 * 
 * Creates an admin user with the following credentials:
 * - Email: admin@t2ms.com
 * - Password: word2pass
 * - Name: Admin User
 * - Role: admin
 * 
 * This endpoint can be called once to set up the initial admin user.
 * It's safe to call multiple times - it will update existing user if found.
 */
export async function POST(req: NextRequest) {
  try {
    const ADMIN_EMAIL = "admin@t2ms.com";
    const ADMIN_PASSWORD = "word2pass";
    const ADMIN_NAME = "Admin User";

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
      include: {
        accounts: {
          where: {
            providerId: "credential",
          },
        },
      },
    });

    if (existingUser) {
      // Delete existing account to recreate with proper password hashing
      if (existingUser.accounts.length > 0) {
        await prisma.account.deleteMany({
          where: {
            userId: existingUser.id,
            providerId: "credential",
          },
        });
      }

      // Use better-auth's signUpEmail to properly hash the password
      // We'll create a new account with the correct password format
      try {
        // First, try to sign up with better-auth (this will fail if user exists, but that's ok)
        // We'll manually create the account with better-auth's password hash
        const tempResult = await auth.api.signUpEmail({
          body: {
            email: `temp_${Date.now()}@t2ms.com`,
            password: ADMIN_PASSWORD,
            name: "Temp",
          },
        });

        // Get the password hash from the temp account
        if (tempResult?.user) {
          const tempAccount = await prisma.account.findFirst({
            where: {
              userId: tempResult.user.id,
              providerId: "credential",
            },
          });

          if (tempAccount?.password) {
            // Create account for admin user with the correct password hash
            await prisma.account.create({
              data: {
                accountId: existingUser.id,
                providerId: "credential",
                userId: existingUser.id,
                password: tempAccount.password,
              },
            });

            // Clean up temp user
            await prisma.user.delete({
              where: { id: tempResult.user.id },
            });
          }
        }
      } catch (error) {
        // If that fails, use bcrypt as fallback (better-auth also uses bcrypt internally)
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
        await prisma.account.create({
          data: {
            accountId: existingUser.id,
            providerId: "credential",
            userId: existingUser.id,
            password: hashedPassword,
          },
        });
      }

      // Update existing user to admin
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: { role: "admin" },
      });

      return NextResponse.json({
        success: true,
        message: "Admin user updated successfully",
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role,
        },
      });
    }

    // Create new user using better-auth API
    const result = await auth.api.signUpEmail({
      body: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        name: ADMIN_NAME,
      },
    });

    if (!result || !result.user) {
      throw new Error("Failed to create user");
    }

    // Update role to admin
    const adminUser = await prisma.user.update({
      where: { id: result.user.id },
      data: { role: "admin", emailVerified: true },
    });

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
      },
      credentials: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      },
    });
  } catch (error: any) {
    console.error("[CREATE_ADMIN]", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create admin user",
      },
      { status: 500 }
    );
  }
}
