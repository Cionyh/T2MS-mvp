import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as twilio from "twilio";

// Validate and assign
const getEnvVar = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
};

const twilioAccountSid = getEnvVar("TWILIO_ACCOUNT_SID");
const twilioAuthToken = getEnvVar("TWILIO_AUTH_TOKEN");
const twilioPhoneNumber = getEnvVar("TWILIO_PHONE_NUMBER");
const baseUrl = getEnvVar("NEXT_PUBLIC_BASE_URL");

const twilioClient = twilio.default(twilioAccountSid, twilioAuthToken);

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const headers = Object.fromEntries(req.headers.entries());
    const twilioSignature = headers["x-twilio-signature"];
    const url = `${baseUrl}/api/twilio`;

    if (!twilioSignature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const isValid = twilio.validateRequestWithBody(
      twilioAuthToken,
      twilioSignature,
      url,
      rawBody
    );

    if (!isValid) {
      console.warn("⚠️ Twilio signature validation failed");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }


    const searchParams = new URLSearchParams(rawBody);
    const formData: Record<string, string> = {};
    for (const [key, value] of searchParams.entries()) {
      formData[key] = value;
    }

    const from = formData.From;
    const body = formData.Body?.trim();

    if (!from || !body) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const client = await prisma.client.findUnique({
      where: { phone: from },
    });

    if (!client) {
      console.warn("❌ Unknown phone number:", from);
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    let type = "banner";
    let content = body;

    if (body.startsWith("popup:")) {
      type = "popup";
      content = body.substring(6).trim();
    }

    await prisma.message.create({
      data: {
        content,
        type,
        clientId: client.id,
      },
    });

    try {
      await twilioClient.messages.create({
        body: `✅ Your message has been posted to your site!`,
        from: twilioPhoneNumber,
        to: from,
      });
    } catch (e) {
      console.warn("⚠️ Failed to send confirmation SMS:", e);
    }

    return new NextResponse(
      `<Response><Message>Posted: "${content}"</Message></Response>`,
      {
        status: 200,
        headers: { "Content-Type": "text/xml" },
      }
    );
  } catch (error) {
    console.error("Twilio webhook error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}