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
const baseUrl = getEnvVar("NEXT_PUBLIC_BASE_URL");

const twilioClient = twilio.default(twilioAccountSid, twilioAuthToken);

export async function POST(req: NextRequest) {
  console.log("=== Twilio Webhook Debug Start ===");
  
  try {
    const rawBody = await req.text();
    console.log("Raw Body:", rawBody);

    const headers = Object.fromEntries(req.headers.entries());
    const twilioSignature = headers["x-twilio-signature"];
    
    console.log("Headers:", headers);
    console.log("Twilio Signature:", twilioSignature);

    const url = `${baseUrl}/api/twilio`;
    console.log("Expected URL:", url);

    if (!twilioSignature) {
      console.log("Missing signature");
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Log validation parameters
    console.log("Validation Params:");
    console.log("- Auth Token length:", twilioAuthToken.length);
    console.log("- Signature:", twilioSignature);
    console.log("- URL:", url);
    console.log("- Body:", rawBody);

    const isValid = twilio.validateRequestWithBody(
      twilioAuthToken,
      twilioSignature,
      url,
      rawBody
    );

    console.log("Validation Result:", isValid);

    if (!isValid) {
      console.warn("⚠️ Twilio signature validation failed");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse form data
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

    // Find client
    const client = await prisma.client.findUnique({
      where: { phone: from },
    });

    console.log("Client:", client);

    if (!client) {
      console.warn("❌ Unknown phone number:", from);
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Process message
    let type = "banner";
    let content = body;

    if (body.startsWith("popup:")) {
      type = "popup";
      content = body.substring(6).trim();
    }

    console.log("Creating message:", { content, type, clientId: client.id });

    // Save message
    await prisma.message.create({
      data: {
        content,
        type,
        clientId: client.id,
      },
    });

    // Send confirmation
    try {
      await twilioClient.messages.create({
        body: `✅ Your message has been posted to your site!`,
        from: twilioPhoneNumber,
        to: from,
      });
    } catch (e) {
      console.warn("⚠️ Failed to send confirmation SMS:", e);
    }

    // Return TwiML
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
  } finally {
    console.log("=== Twilio Webhook Debug End ===");
  }
}