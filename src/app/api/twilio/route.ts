import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as twilio from 'twilio';  
import { URLSearchParams } from 'url';


const twilioAccountSid: string = process.env.TWILIO_ACCOUNT_SID ?? "";
const twilioAuthToken: string = process.env.TWILIO_AUTH_TOKEN ?? "";

if (!twilioAccountSid || !twilioAuthToken) {
    console.error("Twilio Account SID or Auth Token is missing from environment variables.");
    throw new Error("Twilio configuration is incomplete.");
}

const twilioClient = new twilio.Twilio(twilioAccountSid, twilioAuthToken); // Modified instantiation

// Needed to parse Twilio's `application/x-www-form-urlencoded` payload
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to buffer the request body
async function buffer(req: NextRequest) {
  const body = await req.arrayBuffer();
  const text = new TextDecoder().decode(body);
  return text;
}

export async function POST(req: NextRequest) {
    const rawBody = await buffer(req);
    const headers = Object.fromEntries(req.headers.entries());
    const twilioSignature = headers["x-twilio-signature"];
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/twilio`; // Ensure this matches Twilio webhook URL exactly

    try {
        const searchParams = new URLSearchParams(rawBody);
        const formData: Record<string, string> = {}; // Explicitly type formData
        for (const [key, value] of searchParams.entries()) {
            formData[key] = value;
        }

    const isValid = twilio.validateRequest(
        twilioAuthToken,
        twilioSignature,
        url,
        formData
    );

    if (!isValid) {
      console.warn("⚠️ Twilio signature validation failed");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }


    const from = formData.From;
    const body = formData.Body?.trim();

    if (!from || !body) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    // ✅ Match client by phone number
    const client = await prisma.client.findUnique({
      where: {
        phone: from,
      },
    });

    if (!client) {
      console.warn("❌ Unknown phone number:", from);
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // ✅ Create message (default to 'banner' type — can parse body for more logic later)
     await prisma.message.create({
      data: {
        content: body,
        type: "banner", // Could be parsed from SMS body like: "popup: your message"
        clientId: client.id,
      },
    });

    // ✅ Optional: Send confirmation back
    try {
      await twilioClient.messages.create({
        body: `✅ Your message has been posted to your site!`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: from,
      });
    } catch (e) {
      console.warn("⚠️ Failed to send confirmation SMS:", e);
    }

    // ✅ Twilio expects a valid TwiML response (even if we already replied via API)
    return new NextResponse(
      `<Response><Message>Posted: "${body}"</Message></Response>`,
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