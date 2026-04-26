import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkMessageLimit, getOrganizationPlan } from "@/lib/plan-limits";
import { normalizeKeyword } from "@/lib/organization-helpers";

//@ts-ignore
import * as twilio from "twilio";

/** Twilio always expects TwiML/XML on success paths; JSON triggers warning 12200. */
const TWIML_EMPTY = `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`;

function twimlResponse(body: string = TWIML_EMPTY) {
  return new NextResponse(body, {
    status: 200,
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });
}

export const dynamic = "force-dynamic";

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
  let result = "",
    done = false;
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

/** Normalize for comparison (handles +1, parentheses, spaces). */
function normalizePhoneForCompare(phone: string | undefined): string | null {
  if (!phone?.trim()) return null;
  let d = phone.replace(/\D/g, "");
  if (d.length === 10) d = `1${d}`;
  return d;
}

type InboundTwilioNumberRow = {
  id: string;
  phone: string;
  normalizedPhone: string;
  purpose: string;
  isActive: boolean;
};

/** When true, skip the two success SMS after posting (API confirmation + TwiML reply). Set to false to restore. */
const DISABLE_POST_SUCCESS_REPLY_SMS = true;

export async function POST(req: NextRequest) {
  console.log("=== Twilio Webhook Debug Start ===");

  try {
    const rawBody = await readRawBody(req.body!);

    const formData: Record<string, string> = {};
    const searchParams = new URLSearchParams(rawBody);
    for (const [key, value] of searchParams.entries()) {
      formData[key] = value;
    }

    const from = formData.From;
    const to = formData.To;
    const body = formData.Body?.trim() ?? "";

    console.log("📨 Parsed SMS From:", from);
    console.log("📨 Parsed SMS To:", to);
    console.log("📨 Parsed SMS Body:", body);

    const toNorm = normalizePhoneForCompare(to);
    const managedInbound = await prisma.$queryRaw<InboundTwilioNumberRow[]>`
      SELECT id, phone, "normalizedPhone", purpose, "isActive"
      FROM "inbound_twilio_number"
      WHERE "isActive" = true
    `;
    const matchedInbound = toNorm
      ? managedInbound.find((n: InboundTwilioNumberRow) => n.normalizedPhone === toNorm)
      : undefined;

    // Backward-compatible fallback to env variable while admins migrate to DB-managed numbers.
    const affiliateConfigured = process.env.TWILIO_AFFILIATE_PHONE_NUMBER?.trim();
    const affiliateNorm = normalizePhoneForCompare(affiliateConfigured);
    const isAffiliateDestination =
      matchedInbound?.purpose === "AFFILIATE" ||
      Boolean(affiliateConfigured && affiliateNorm && toNorm === affiliateNorm);

    // If DB-managed numbers exist, ignore inbound traffic to unknown "To" numbers.
    if (managedInbound.length > 0 && !matchedInbound) {
      console.warn("⚠️ Inbound SMS to unconfigured destination number", { to, toNorm });
      return twimlResponse();
    }

    // Affiliate number: no Twilio client needed; always return valid TwiML (never JSON).
    if (isAffiliateDestination) {
      if (!from) {
        console.warn("⚠️ Affiliate inbound: missing From");
        return twimlResponse();
      }
      try {
        const destinationPhone =
          to?.trim() || matchedInbound?.phone || affiliateConfigured || "";
        await prisma.affiliateInboundSms.create({
          data: {
            fromPhone: from,
            toPhone: destinationPhone,
            body,
          },
        });
        console.log("📬 Affiliate inbound SMS stored");
      } catch (e) {
        console.error("📬 Affiliate inbound DB error:", e);
      }
      return twimlResponse();
    }

    const twilioEnv = getTwilioEnv();
    const {
      client: twilioClient,
      authToken: twilioAuthToken,
      phoneNumber: twilioPhoneNumber,
      accountSid: twilioAccountSid,
    } = twilioEnv;

    const twilioSignature = req.headers.get("x-twilio-signature");
    const webhookUrl = getWebhookUrl(req);

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

    const contentType = req.headers.get("content-type");
    if (!contentType?.includes("application/x-www-form-urlencoded")) {
      console.warn(
        "⚠️ Content-Type is NOT application/x-www-form-urlencoded — this may break signature verification"
      );
    }

    const formObject: Record<string, string> = {};
    for (const [key, value] of searchParams.entries()) {
      formObject[key] = value;
    }

    const expectedSignature = twilio.getExpectedTwilioSignature(
      twilioAuthToken,
      webhookUrl,
      formObject
    );

    console.log("🔐 Expected Signature:", expectedSignature);
    console.log("🧮 Signature Match:", expectedSignature === twilioSignature);

    if (!from || !body) {
      console.warn("⚠️ Missing 'From' or 'Body' field in the form data");
      return twimlResponse();
    }

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
    let type = "banner";
    if (content.startsWith("popup:")) {
      type = "popup";
      content = content.substring(6).trim();
    }

    const phoneNumbers = await prisma.phoneNumber.findMany({
      where: { phone: from, verified: true },
      include: { client: true },
    });

    if (phoneNumbers.length === 0) {
      console.warn("❌ No verified phone number found:", from);
      return twimlResponse();
    }

    const organizationId = phoneNumbers[0].client.organizationId;
    const plan = organizationId ? await getOrganizationPlan(organizationId) : "free";
    const isGrowthPlan = plan === "pro";
    const requireKeyword = isGrowthPlan || phoneNumbers.length > 1;

    let client = phoneNumbers[0].client;

    if (requireKeyword) {
      if (parsedKeyword) {
        const match = phoneNumbers.find(
          (pn: (typeof phoneNumbers)[number]) =>
            pn.client.keyword && normalizeKeyword(pn.client.keyword) === parsedKeyword
        );
        if (match) {
          client = match.client;
        } else {
          const reply =
            "Unknown keyword. Use KEYWORD: your message (e.g. BAKERY: Fresh croissants today).";
          return new NextResponse(
            `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(reply)}</Message></Response>`,
            { status: 200, headers: { "Content-Type": "text/xml; charset=utf-8" } }
          );
        }
      } else {
        const reply = isGrowthPlan
          ? "Please include your site keyword at the start of your message so we know which site to update. For example: KEYWORD: your message (e.g. BAKERY: Fresh croissants today). You can find your keyword in your site settings."
          : "Use KEYWORD: your message to specify which site (e.g. BAKERY: your message).";
        return new NextResponse(
          `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(reply)}</Message></Response>`,
          { status: 200, headers: { "Content-Type": "text/xml; charset=utf-8" } }
        );
      }
    }

    if (!requireKeyword) {
      content = body;
      if (body.startsWith("popup:")) {
        type = "popup";
        content = body.substring(6).trim();
      }
    }

    if (!client.organizationId) {
      console.warn("❌ Client has no organization:", client.id);
      return twimlResponse();
    }

    console.log("📝 Saving message:", {
      content,
      type,
      clientId: client.id,
      organizationId: client.organizationId,
    });

    const messageLimit = await checkMessageLimit(client.organizationId, client.id);
    if (!messageLimit.allowed) {
      console.warn("❌ Message limit exceeded for organization:", client.organizationId);
      const msg = `Message limit exceeded. You can send up to ${messageLimit.limit === -1 ? "unlimited" : messageLimit.limit} messages per month on your current plan. You have sent ${messageLimit.current} messages this month. Please upgrade your plan to send more messages.`;
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(msg)}</Message></Response>`,
        { status: 200, headers: { "Content-Type": "text/xml; charset=utf-8" } }
      );
    }

    await prisma.message.create({
      data: { content, clientId: client.id },
    });

    if (!DISABLE_POST_SUCCESS_REPLY_SMS) {
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
    }

    const twiml = DISABLE_POST_SUCCESS_REPLY_SMS
      ? TWIML_EMPTY
      : `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(`Posted: "${content}"`)}</Message></Response>`;

    return new NextResponse(twiml, {
      status: 200,
      headers: { "Content-Type": "text/xml; charset=utf-8" },
    });
  } catch (err) {
    console.error("❌ Twilio webhook processing error:", err);
    return twimlResponse();
  } finally {
    console.log("=== Twilio Webhook Debug End ===");
  }
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
