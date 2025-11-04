import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { verifyClientAccess } from "@/lib/organization-helpers";

//@ts-ignore
import * as twilio from "twilio";

const getEnvVar = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
};

const twilioAccountSid = getEnvVar("TWILIO_ACCOUNT_SID");
const twilioAuthToken = getEnvVar("TWILIO_AUTH_TOKEN");
const twilioPhoneNumber = getEnvVar("TWILIO_PHONE_NUMBER");

const twilioClient = twilio.default(twilioAccountSid, twilioAuthToken);

/**
 * POST /api/phone/verify
 * Generate a PIN code and send it via SMS for phone verification
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

    // Generate 6-digit PIN
    const pinCode = Math.floor(100000 + Math.random() * 900000).toString();
    const pinExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Check if phone number already exists for this client
    let phoneNumber = await prisma.phoneNumber.findFirst({
      where: {
        clientId,
        phone,
      },
    });

    if (phoneNumber) {
      // Update existing phone number with new PIN
      phoneNumber = await prisma.phoneNumber.update({
        where: { id: phoneNumber.id },
        data: {
          pinCode,
          pinExpiresAt,
          verificationMethod: "PIN",
          verified: false, // Reset verification status
        },
      });
    } else {
      // Create new phone number record
      phoneNumber = await prisma.phoneNumber.create({
        data: {
          clientId,
          phone,
          pinCode,
          pinExpiresAt,
          verificationMethod: "PIN",
          verified: false,
        },
      });
    }

    // Send PIN via SMS
    try {
      await twilioClient.messages.create({
        body: `Your Text2MySite verification code is: ${pinCode}. This code expires in 10 minutes.`,
        from: twilioPhoneNumber,
        to: phone,
      });
    } catch (smsError) {
      console.error("Failed to send verification SMS:", smsError);
      return NextResponse.json(
        { error: "Failed to send verification code. Please check the phone number and try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent successfully",
      phoneNumberId: phoneNumber.id,
    });
  } catch (error) {
    console.error("Error in phone verification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

