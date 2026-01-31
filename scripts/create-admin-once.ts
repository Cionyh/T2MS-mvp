/**
 * One-time script to create admin user
 * Usage: npx tsx scripts/create-admin-once.ts
 */

import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables
config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), ".env.local") });

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL not found in .env file");
  process.exit(1);
}

import { PrismaClient } from "@prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

const prisma = new PrismaClient();

const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: process.env.BETTER_AUTH_SECRET || "your-secret-key",
  emailAndPassword: {
    enabled: true,
  },
});

const ADMIN_EMAIL = "admin@t2ms.com";
const ADMIN_PASSWORD = "word2pass";
const ADMIN_NAME = "Admin User";

async function createAdmin() {
  try {
    console.log("🚀 Creating admin user...");
    console.log(`📧 Email: ${ADMIN_EMAIL}`);
    console.log(`👤 Name: ${ADMIN_NAME}\n`);

    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
    });

    if (existing) {
      console.log("⚠️  User already exists. Deleting...");
      await prisma.user.delete({ where: { id: existing.id } });
      console.log("✅ User deleted\n");
    }

    // Create user using better-auth (this will hash password correctly)
    console.log("📝 Creating new admin user with better-auth...");
    const result = await auth.api.signUpEmail({
      body: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        name: ADMIN_NAME,
      },
    });

    if (!result?.user) {
      throw new Error("Failed to create user");
    }

    console.log("✅ User created successfully!");

    // Update role to admin
    const adminUser = await prisma.user.update({
      where: { id: result.user.id },
      data: { role: "admin", emailVerified: true },
    });

    console.log("\n✅ Admin user created successfully!");
    console.log("\n📋 User Details:");
    console.log(`   User ID: ${adminUser.id}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Name: ${adminUser.name}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log("\n🔐 Login Credentials:");
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log("\n🌐 Admin Portal URL:");
    console.log(`   http://localhost:3000/admin`);
    console.log("\n✨ Done! You can now log in to the admin portal.");

    await prisma.$disconnect();
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

createAdmin();
