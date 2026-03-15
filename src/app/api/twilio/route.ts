import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkMessageLimit, getOrganizationPlan } from "@/lib/plan-limits";
import { normalizeKeyword } from "@/lib/organization-helpers";

//@ts-ignore
import * as twilio from "twilio";

function getTwilioEnv() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const phoneNumber = process.env.TWILIO_PHONE_NUMBER;
  if (!accountSid) throw new Error("Missing environment variable: TWILIO_ACCOUNT_SID");
  if (!authToken) throw new Error("Missing environment variable: TWILIO_AUTH_TOKEN");
  if (!phoneNumber) throw new Error("Missing environment variable: TWILIO_PHONE_NUMBER");
  return {
    accountSid,
    authToken,
    phoneNumber,
    client: twilio.default(accountSid, authToken),
  };
}

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

function getWebhookUrl(req: NextRequest): string {
  const proto = req.headers.get("x-forwarded-proto") || "https";
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const path = "/api/twilio"; // hardcoded to match Twilio webhook
  return `${proto}://${host}${path}`;
}

export async function POST(req: NextRequest) {
  console.log("=== Twilio Webhook Debug Start ===");

  try {
    const twilioEnv = getTwilioEnv();
    const { client: twilioClient, authToken: twilioAuthToken, phoneNumber: twilioPhoneNumber, accountSid: twilioAccountSid } = twilioEnv;

    const rawBody = await readRawBody(req.body!);
    const twilioSignature = req.headers.get("x-twilio-signature");
    const webhookUrl = getWebhookUrl(req);

    // Log headers
    console.log("🚩 Headers:");
    for (const [key, value] of req.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }

    // Log environment
    console.log("🚩 Environment:");
    console.log("  TWILIO_ACCOUNT_SID:", twilioAccountSid);
    console.log("  TWILIO_AUTH_TOKEN: [REDACTED]");
    console.log("  TWILIO_PHONE_NUMBER:", twilioPhoneNumber);

    // Log request info
    console.log("🚩 Request Info:");
    console.log("  Method:", req.method);
    console.log("  Full req.url:", req.url);
    console.log("  Reconstructed Webhook URL:", webhookUrl);
    console.log("  Content-Type:", req.headers.get("content-type"));
    console.log("  Twilio Signature (Header):", twilioSignature);
    console.log("  Raw Body Length:", rawBody.length);
    console.log("  Raw Body Preview:", rawBody.slice(0, 400));

    const contentType = req.headers.get("content-type");
    if (!contentType?.includes("application/x-www-form-urlencoded")) {
      console.warn("⚠️ Content-Type is NOT application/x-www-form-urlencoded — this may break signature verification");
    }

    // Still log expected signature for comparison
    const formObject: Record<string, string> = {};
    const signatureParams = new URLSearchParams(rawBody);
    for (const [key, value] of signatureParams.entries()) {
      formObject[key] = value;
    }

    const expectedSignature = twilio.getExpectedTwilioSignature(
      twilioAuthToken,
      webhookUrl,
      formObject
    );

    console.log("🔐 Expected Signature:", expectedSignature);
    console.log("🧮 Signature Match:", expectedSignature === twilioSignature);

    // SKIPPED: Signature validation and rejection

    // Parse form-urlencoded body
    const formData: Record<string, string> = {};
    const searchParams = new URLSearchParams(rawBody);
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

    // Parse optional "KEYWORD: message" prefix (case-insensitive)
    let parsedKeyword: string | null = null;
    let content = body;
    const colonIndex = body.indexOf(":");
    if (colonIndex > 0) {
      const before = body.slice(0, colonIndex).trim();
      const after = body.slice(colonIndex + 1).trim();
      if (before.length > 0) {
        parsedKeyword = normalizeKeyword(before);
        content = after;
      }
    }
    // Legacy: popup: prefix still overrides type
    let type = "banner";
    if (content.startsWith("popup:")) {
      type = "popup";
      content = content.substring(6).trim();
    }

    // All verified phone number rows for this sender (one row per client/site)
    const phoneNumbers = await prisma.phoneNumber.findMany({
      where: { phone: from, verified: true },
      include: { client: true },
    });

    if (phoneNumbers.length === 0) {
      console.warn("❌ No verified phone number found:", from);
      return NextResponse.json({ error: "Phone number not found or not verified" }, { status: 404 });
    }

    const organizationId = phoneNumbers[0].client.organizationId;
    const plan = organizationId ? await getOrganizationPlan(organizationId) : "free";
    const isGrowthPlan = plan === "pro";
    const requireKeyword = isGrowthPlan || phoneNumbers.length > 1;

    let client = phoneNumbers[0].client;

    if (requireKeyword) {
      // Growth plan (pro) or multiple sites: require keyword to identify which site
      if (parsedKeyword) {
        const match = phoneNumbers.find(
          (pn) => pn.client.keyword && normalizeKeyword(pn.client.keyword) === parsedKeyword
        );
        if (match) {
          client = match.client;
        } else {
          const reply = "Unknown keyword. Use KEYWORD: your message (e.g. BAKERY: Fresh croissants today).";
          return new NextResponse(
            `<Response><Message>${reply}</Message></Response>`,
            { status: 200, headers: { "Content-Type": "text/xml" } }
          );
        }
      } else {
        // No keyword in message: for growth send polite instructions
        const reply = isGrowthPlan
          ? "Please include your site keyword at the start of your message so we know which site to update. For example: KEYWORD: your message (e.g. BAKERY: Fresh croissants today). You can find your keyword in your site settings."
          : "Use KEYWORD: your message to specify which site (e.g. BAKERY: your message).";
        return new NextResponse(
          `<Response><Message>${reply}</Message></Response>`,
          { status: 200, headers: { "Content-Type": "text/xml" } }
        );
      }
    }

    // Single-site account (not growth): use full body as content (no keyword required)
    if (!requireKeyword) {
      content = body;
      if (body.startsWith("popup:")) {
        type = "popup";
        content = body.substring(6).trim();
      }
    }

    if (!client.organizationId) {
      console.warn("❌ Client has no organization:", client.id);
      return NextResponse.json({ error: "Client not associated with an organization" }, { status: 400 });
    }

    console.log("📝 Saving message:", { content, type, clientId: client.id, organizationId: client.organizationId });

    // Check message limit based on organization's plan
    const messageLimit = await checkMessageLimit(client.organizationId, client.id);
    if (!messageLimit.allowed) {
      console.warn("❌ Message limit exceeded for organization:", client.organizationId);
      return new NextResponse(
        `<Response><Message>Message limit exceeded. You can send up to ${messageLimit.limit === -1 ? 'unlimited' : messageLimit.limit} messages per month on your current plan. You have sent ${messageLimit.current} messages this month. Please upgrade your plan to send more messages.</Message></Response>`,
        { status: 200, headers: { "Content-Type": "text/xml" } }
      );
    }

    await prisma.message.create({
      data: { content, clientId: client.id },
    });

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
