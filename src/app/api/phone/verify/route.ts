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
const twilioVerifyServiceSid = getEnvVar("TWILIO_VERIFY_SERVICE_SID");

const twilioClient = twilio.default(twilioAccountSid, twilioAuthToken);

/**
 * POST /api/phone/verify
 * Send OTP via Twilio Verify API for owner's first phone, or use invite for team members
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

    // Check if this is the first phone number for this client (owner's phone)
    const existingVerifiedPhones = await prisma.phoneNumber.count({
      where: {
        clientId,
        verified: true,
      },
    });

    const isFirstPhone = existingVerifiedPhones === 0;

    // Check if phone number already exists for this client
    let phoneNumber = await prisma.phoneNumber.findFirst({
      where: {
        clientId,
        phone,
      },
    });

    if (isFirstPhone) {
      // Use Twilio Verify API for owner's first phone
      try {
        // Initiate Twilio Verify verification
        const verification = await twilioClient.verify.v2
          .services(twilioVerifyServiceSid)
          .verifications.create({
            to: phone,
            channel: "sms",
          });

        if (phoneNumber) {
          // Update existing phone number with Twilio Verify SID
          phoneNumber = await prisma.phoneNumber.update({
            where: { id: phoneNumber.id },
            data: {
              twilioVerifySid: verification.sid,
              verificationMethod: "OTP",
              verified: false, // Reset verification status
            },
          });
        } else {
          // Create new phone number record with Twilio Verify SID
          phoneNumber = await prisma.phoneNumber.create({
            data: {
              clientId,
              phone,
              twilioVerifySid: verification.sid,
              verificationMethod: "OTP",
              verified: false,
            },
          });
        }

        return NextResponse.json({
          success: true,
          message: "Verification code sent successfully via Twilio Verify",
          phoneNumberId: phoneNumber.id,
          verificationMethod: "OTP",
        });
      } catch (verifyError: any) {
        console.error("Failed to send Twilio Verify OTP:", verifyError);
        return NextResponse.json(
          { error: `Failed to send verification code: ${verifyError.message || "Please check the phone number and try again."}` },
          { status: 500 }
        );
      }
    } else {
      // For team members (not first phone), use invite system
      // This means the owner should use the invite flow for additional phones
      return NextResponse.json(
        { 
          error: "This phone number requires an invite link. Please use the invite flow for team members.",
          requiresInvite: true 
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error in phone verification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

