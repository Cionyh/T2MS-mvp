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

// Build the URL Twilio signed against
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

    // Log request details
    console.log("🚩 Headers:");
    for (const [key, value] of req.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }

    console.log("🚩 Environment:");
    console.log("  TWILIO_ACCOUNT_SID:", twilioAccountSid);
    console.log("  TWILIO_AUTH_TOKEN: [REDACTED]");
    console.log("  TWILIO_PHONE_NUMBER:", twilioPhoneNumber);

    console.log("🚩 Request Info:");
    console.log("  Method:", req.method);
    console.log("  Full req.url:", req.url);
    console.log("  Reconstructed Webhook URL:", webhookUrl);
    console.log("  Content-Type:", req.headers.get("content-type"));
    console.log("  Twilio Signature (Header):", twilioSignature);
    console.log("  Raw Body Length:", rawBody.length);
    console.log("  Raw Body Preview:", rawBody.slice(0, 400));

    // Warn if content-type is incorrect
    const contentType = req.headers.get("content-type");
    if (!contentType?.includes("application/x-www-form-urlencoded")) {
      console.warn("⚠️ Content-Type is NOT application/x-www-form-urlencoded — this may break signature verification");
    }

    // Validate signature
    const isValid = twilio.validateRequestWithBody(
      twilioAuthToken,
      twilioSignature ?? "",
      webhookUrl,
      rawBody
    );

    console.log("✅ Signature Validation Result:", isValid);

    if (!isValid) {
      console.error("❌ Twilio signature verification failed.");
      console.log("🧪 Possible Fixes:");
      console.log("- Ensure TWILIO_AUTH_TOKEN matches the one in your Twilio Console.");
      console.log("- Ensure your webhook URL in Twilio console is EXACTLY:", webhookUrl);
      console.log("- Ensure your host and proto headers are forwarded correctly (check Railway config).");
      console.log("- Ensure your server framework doesn’t parse body before verification.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse form body
    const searchParams = new URLSearchParams(rawBody);
    const formData: Record<string, string> = {};
    for (const [key, value] of searchParams.entries()) {
      formData[key] = value;
    }

    const from = formData.From;
    const body = formData.Body?.trim();

    console.log("📨 Parsed SMS From:", from);
    console.log("📨 Parsed SMS Body:", body);

    if (!from || !body) {
      console.warn("⚠️ Missing 'From' or 'Body' field in the form data");
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const client = await prisma.client.findUnique({ where: { phone: from } });

    if (!client) {
      console.warn("❌ No client found with phone number:", from);
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Determine message type
    let type = "banner", content = body;
    if (body.startsWith("popup:")) {
      type = "popup";
      content = body.substring(6).trim();
    }

    console.log("📝 Saving message:", { content, type, clientId: client.id });

    await prisma.message.create({
      data: { content, type, clientId: client.id },
    });

    // Try sending a confirmation message
    try {
      console.log("📤 Sending confirmation SMS...");
      await twilioClient.messages.create({
        body: `✅ Your message has been posted to your site!`,
        from: twilioPhoneNumber,
        to: from,
      });
      console.log("✅ Confirmation SMS sent.");
    } catch (e) {
      console.warn("⚠️ Failed to send confirmation SMS:", e);
    }

    // Return TwiML
    return new NextResponse(
      `<Response><Message>Posted: "${content}"</Message></Response>`,
      { status: 200, headers: { "Content-Type": "text/xml" } }
    );

  } catch (err) {
    console.error("❌ Twilio webhook processing error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    console.log("=== Twilio Webhook Debug End ===");
  }
}
