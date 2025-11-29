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
const twilioVerifyServiceSid = getEnvVar("TWILIO_VERIFY_SERVICE_SID");

const twilioClient = twilio.default(twilioAccountSid, twilioAuthToken);

/**
 * POST /api/phone/confirm
 * Verify OTP code using Twilio Verify API (for owner) or PIN code (legacy)
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
    const { phoneNumberId, pinCode } = body;

    if (!phoneNumberId || !pinCode) {
      return NextResponse.json(
        { error: "Missing required fields: phoneNumberId and pinCode" },
        { status: 400 }
      );
    }

    // Get phone number record
    const phoneNumber = await prisma.phoneNumber.findUnique({
      where: { id: phoneNumberId },
      include: {
        client: true,
      },
    });

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number not found" },
        { status: 404 }
      );
    }

    // Verify user has access to this client
    const access = await verifyClientAccess(session.user.id, phoneNumber.clientId);
    if (!access.hasAccess) {
      return NextResponse.json(
        { error: "Unauthorized: You don't have access to this client" },
        { status: 403 }
      );
    }

    // Handle OTP verification using Twilio Verify API
    if (phoneNumber.verificationMethod === "OTP" && phoneNumber.twilioVerifySid) {
      try {
        // Verify the code using Twilio Verify API
        const verificationCheck = await twilioClient.verify.v2
          .services(twilioVerifyServiceSid)
          .verificationChecks.create({
            to: phoneNumber.phone,
            code: pinCode,
          });

        if (verificationCheck.status === "approved") {
          // Mark phone number as verified and clear Twilio Verify SID
          const updatedPhoneNumber = await prisma.phoneNumber.update({
            where: { id: phoneNumberId },
            data: {
              verified: true,
              twilioVerifySid: null,
            },
          });

          return NextResponse.json({
            success: true,
            message: "Phone number verified successfully",
            phoneNumber: updatedPhoneNumber,
          });
        } else {
          return NextResponse.json(
            { error: "Invalid verification code" },
            { status: 400 }
          );
        }
      } catch (verifyError: any) {
        console.error("Twilio Verify check error:", verifyError);
        return NextResponse.json(
          { error: verifyError.message || "Invalid verification code" },
          { status: 400 }
        );
      }
    } else if (phoneNumber.verificationMethod === "PIN") {
      // Legacy PIN verification (for backward compatibility)
      // Check if PIN is correct
      if (phoneNumber.pinCode !== pinCode) {
        return NextResponse.json(
          { error: "Invalid verification code" },
          { status: 400 }
        );
      }

      // Check if PIN has expired
      if (!phoneNumber.pinExpiresAt || phoneNumber.pinExpiresAt < new Date()) {
        return NextResponse.json(
          { error: "Verification code has expired. Please request a new one." },
          { status: 400 }
        );
      }

      // Mark phone number as verified and clear PIN
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
        message: "Phone number verified successfully",
        phoneNumber: updatedPhoneNumber,
      });
    } else {
      return NextResponse.json(
        { error: "Invalid verification method. Please request a new verification code." },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error confirming phone verification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

