import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as twilio from "twilio";

// Validate and assign environment variables
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

const twilioClient = twilio.default(twilioAccountSid, twilioAuthToken);

export async function POST(req: NextRequest) {
  console.log("=== Twilio Webhook Debug Start ===");

  try {
    const rawBody = await req.text();
    const url = req.nextUrl.toString();
    const twilioSignature = req.headers.get("x-twilio-signature");

    console.log("Raw Body:", rawBody);
    console.log("Twilio Signature:", twilioSignature);
    console.log("Expected URL:", url);

    // Validate signature
    const isValid = twilio.validateRequestWithBody(
      twilioAuthToken,
      twilioSignature ?? "",
      url,
      rawBody
    );

    console.log("Validation Result:", isValid);
    if (!isValid) {
      console.warn("⚠️ Twilio signature validation failed");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse form data from raw body
    const searchParams = new URLSearchParams(rawBody);
    const formData: Record<string, string> = {};
    for (const [key, value] of searchParams.entries()) {
      formData[key] = value;
    }

    const from = formData.From;
    const body = formData.Body?.trim();

    console.log("From:", from);
    console.log("Body:", body);

    if (!from || !body) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    // Find client by phone number
    const client = await prisma.client.findUnique({
      where: { phone: from },
    });

    console.log("Client:", client);
    if (!client) {
      console.warn("❌ Unknown phone number:", from);
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Process message type
    let type = "banner";
    let content = body;

    if (body.startsWith("popup:")) {
      type = "popup";
      content = body.substring(6).trim();
    }

    console.log("Creating message:", { content, type, clientId: client.id });

    // Save message to database
    await prisma.message.create({
      data: {
        content,
        type,
        clientId: client.id,
      },
    });

    // Optional: Send confirmation SMS
    try {
      await twilioClient.messages.create({
        body: `✅ Your message has been posted to your site!`,
        from: twilioPhoneNumber,
        to: from,
      });
    } catch (e) {
      console.warn("⚠️ Failed to send confirmation SMS:", e);
    }

    // Return TwiML response
    return new NextResponse(
      `<Response><Message>Posted: "${content}"</Message></Response>`,
      {
        status: 200,
        headers: { "Content-Type": "text/xml" },
      }
    );
  } catch (error) {
    console.error("❌ Twilio webhook error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    console.log("=== Twilio Webhook Debug End ===");
  }
}
