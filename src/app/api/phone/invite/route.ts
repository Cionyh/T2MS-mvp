import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { verifyClientAccess } from "@/lib/organization-helpers";
import { randomBytes } from "crypto";

/**
 * POST /api/phone/invite
 * Generate an invite link/token for phone number verification
 * This allows phone verification via invite link instead of PIN
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { clientId, phone } = body;

    if (!clientId || !phone) {
      return NextResponse.json(
        { error: "Missing required fields: clientId and phone" },
        { status: 400 }
      );
    }

    // Verify user has access to this client
    const access = await verifyClientAccess(session.user.id, clientId);
    if (!access.hasAccess) {
      return NextResponse.json(
        { error: "Unauthorized: You don't have access to this client" },
        { status: 403 }
      );
    }

    // Generate a secure invite token (32 bytes, hex encoded = 64 characters)
    const inviteToken = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    // Check if phone number already exists for this client
    let phoneNumber = await prisma.phoneNumber.findFirst({
      where: {
        clientId,
        phone,
      },
    });

    if (phoneNumber) {
      // Update existing phone number with invite token
      phoneNumber = await prisma.phoneNumber.update({
        where: { id: phoneNumber.id },
        data: {
          pinCode: inviteToken, // Store invite token in pinCode field temporarily
          pinExpiresAt: expiresAt,
          verificationMethod: "INVITE",
          verified: false, // Reset verification status
          invitedBy: session.user.id,
        },
      });
    } else {
      // Create new phone number record with invite token
      phoneNumber = await prisma.phoneNumber.create({
        data: {
          clientId,
          phone,
          pinCode: inviteToken, // Store invite token in pinCode field temporarily
          pinExpiresAt: expiresAt,
          verificationMethod: "INVITE",
          verified: false,
          invitedBy: session.user.id,
        },
      });
    }

    // Generate invite link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const inviteLink = `${baseUrl}/verify-phone/${phoneNumber.id}?token=${inviteToken}`;

    return NextResponse.json({
      success: true,
      message: "Invite link generated successfully",
      phoneNumberId: phoneNumber.id,
      inviteLink,
      inviteToken,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error("Error generating phone invite:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/phone/invite?phoneNumberId=xxx&token=xxx
 * Verify an invite token and mark phone number as verified
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const phoneNumberId = searchParams.get("phoneNumberId");
    const token = searchParams.get("token");

    if (!phoneNumberId || !token) {
      return NextResponse.json(
        { error: "Missing required parameters: phoneNumberId and token" },
        { status: 400 }
      );
    }

    // Get phone number record
    const phoneNumber = await prisma.phoneNumber.findUnique({
      where: { id: phoneNumberId },
    });

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number not found" },
        { status: 404 }
      );
    }

    // Verify token matches
    if (phoneNumber.pinCode !== token) {
      return NextResponse.json(
        { error: "Invalid or expired invite token" },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (!phoneNumber.pinExpiresAt || phoneNumber.pinExpiresAt < new Date()) {
      return NextResponse.json(
        { error: "Invite link has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Check if verification method is INVITE
    if (phoneNumber.verificationMethod !== "INVITE") {
      return NextResponse.json(
        { error: "This phone number is not set up for invite verification" },
        { status: 400 }
      );
    }

    // Mark phone number as verified and clear token
    const updatedPhoneNumber = await prisma.phoneNumber.update({
      where: { id: phoneNumberId },
      data: {
        verified: true,
        pinCode: null,
        pinExpiresAt: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Phone number verified successfully via invite",
      phoneNumber: updatedPhoneNumber,
    });
  } catch (error) {
    console.error("Error verifying phone invite:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

