import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as twilio from "twilio";

// Load environment variables safely
const getEnvVar = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
};

const twilioAccountSid = getEnvVar("TWILIO_ACCOUNT_SID");
const twilioAuthToken = getEnvVar("TWILIO_AUTH_TOKEN");
const twilioPhoneNumber = getEnvVar("TWILIO_PHONE_NUMBER");

const twilioClient = twilio.default(twilioAccountSid, twilioAuthToken);

// Read the raw body stream
async function readRawBody(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder("utf-8");
  let result = "", done = false;
  while (!done) {
    const { value, done: doneReading } = await reader.read();
    done = doneReading;
    if (value) result += decoder.decode(value, { stream: !done });
  }
  return result;
}

// Reconstruct the signed webhook URL using proxy headers
function getWebhookUrl(req: NextRequest): string {
  const proto = req.headers.get("x-forwarded-proto") || "https";
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const path = req.nextUrl.pathname;
  return `${proto}://${host}${path}`;
}

export async function POST(req: NextRequest) {
  console.log("=== Twilio Webhook Debug Start ===");

  try {
    const rawBody = await readRawBody(req.body!);
    const twilioSignature = req.headers.get("x-twilio-signature");
    const webhookUrl = getWebhookUrl(req);

    // Log for debugging
    console.log("Reconstructed Webhook URL:", webhookUrl);
    console.log("Twilio Signature (header):", twilioSignature);
    console.log("Raw Body Preview:", rawBody.slice(0, 400));

    // Validate Twilio signature
    const isValid = twilio.validateRequestWithBody(
      twilioAuthToken,
      twilioSignature ?? "",
      webhookUrl,
      rawBody
    );

    console.log("Validation Result:", isValid);

    if (!isValid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse form-urlencoded POST body
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
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Match client by phone number
    const client = await prisma.client.findUnique({ where: { phone: from } });

    if (!client) {
      console.warn("❌ Unknown phone number:", from);
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Infer message type and content
    let type = "banner", content = body;
    if (body.startsWith("popup:")) {
      type = "popup";
      content = body.substring(6).trim();
    }

    await prisma.message.create({
      data: { content, type, clientId: client.id },
    });

    // Send confirmation SMS
    try {
      await twilioClient.messages.create({
        body: `✅ Your message has been posted to your site!`,
        from: twilioPhoneNumber,
        to: from,
      });
    } catch (e) {
      console.warn("⚠️ Failed to send confirmation SMS:", e);
    }

    // Respond with TwiML
    return new NextResponse(
      `<Response><Message>Posted: "${content}"</Message></Response>`,
      { status: 200, headers: { "Content-Type": "text/xml" } }
    );

  } catch (err) {
    console.error("❌ Twilio webhook error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    console.log("=== Twilio Webhook Debug End ===");
  }
}
