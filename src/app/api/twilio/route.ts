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
let webhookUrl = getEnvVar("WEBHOOK_URL"); // Make mutable so we can normalize
if (webhookUrl.endsWith('/')) {
    webhookUrl = webhookUrl.slice(0, -1); // Remove trailing slash
    console.warn("WEBHOOK_URL had a trailing slash, which was removed. Ensure this is correct!");
}

const twilioClient = twilio.default(twilioAccountSid, twilioAuthToken);

// Proper raw body reader
async function readRawBody(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder("utf-8");
  let result = "";
  let done = false;

  while (!done) {
    const { value, done: doneReading } = await reader.read();
    done = doneReading;
    if (value) {
      result += decoder.decode(value, { stream: !done });
    }
  }

  return result;
}

export async function POST(req: NextRequest) {
  console.log("=== Twilio Webhook Debug Start ===");

  try {
    const rawBody = await readRawBody(req.body!);
    const twilioSignature = req.headers.get("x-twilio-signature");

    // Log signature details
    console.log("WEBHOOK_URL (from env):", webhookUrl);
    console.log("Twilio Signature (from header):", twilioSignature);
    console.log("Raw Body Length:", rawBody.length);
    console.log("Raw Body Preview:", rawBody.slice(0, 500));
    console.log("Raw Body (Full):", rawBody);

    //  ADDITIONAL LOGGING:  Log the full URL of the incoming request
    console.log("Full Request URL:", req.url);

    // Validate signature
    const isValid = twilio.validateRequestWithBody(
      twilioAuthToken,
      twilioSignature ?? "",
      webhookUrl,
      rawBody
    );

    console.log("Validation Result:", isValid);

    if (!isValid) {
      console.warn("⚠️ Twilio signature validation failed");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse form-encoded body
    const searchParams = new URLSearchParams(rawBody);
    const formData: Record<string, string> = {};
    for (const [key, value] of searchParams.entries()) {
      formData[key] = value;
    }

    const from = formData.From;
    const body = formData.Body?.trim();

    console.log("Parsed From:", from);
    console.log("Parsed Body:", body);

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

    // Determine message type
    let type = "banner";
    let content = body;

    if (body.startsWith("popup:")) {
      type = "popup";
      content = body.substring(6).trim();
    }

    console.log("Creating message:", { content, type, clientId: client.id });

    // Store message
    await prisma.message.create({
      data: {
        content,
        type,
        clientId: client.id,
      },
    });

    // Send confirmation (non-blocking)
    try {
      await twilioClient.messages.create({
        body: `✅ Your message has been posted to your site!`,
        from: twilioPhoneNumber,
        to: from,
      });
    } catch (e) {
      console.warn("⚠️ Failed to send confirmation SMS:", e);
    }

    // Return TwiML XML response
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