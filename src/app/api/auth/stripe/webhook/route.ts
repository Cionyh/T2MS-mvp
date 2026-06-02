import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";
import crypto from "crypto";
import { getStripeWebhookSecret } from "@/lib/stripe-config";

const SKIP_SIGNATURE_VERIFY =
  process.env.STRIPE_WEBHOOK_SKIP_VERIFY === "true" ||
  process.env.STRIPE_WEBHOOK_SKIP_VERIFY === "1";

export async function POST(request: NextRequest) {
  try {
    const webhookSecret = getStripeWebhookSecret();
    const body = await request.text();
    let signature = request.headers.get("stripe-signature");

    // For local/testing: auto-add signature so Postman can send without it (remove in production)
    if (!signature && SKIP_SIGNATURE_VERIFY && webhookSecret) {
      const timestamp = Math.floor(Date.now() / 1000);
      const signedPayload = `${timestamp}.${body}`;
      const sig = crypto
        .createHmac("sha256", webhookSecret)
        .update(signedPayload)
        .digest("hex");
      signature = `t=${timestamp},v1=${sig}`;
    }

    if (!signature) {
      return new Response("Missing stripe-signature header", { status: 400 });
    }

    // Reconstruct request with body (consumed above) and signature for auth.handler
    const url = request.url;
    const headers = new Headers(request.headers);
    headers.set("stripe-signature", signature);

    const requestWithSignature = new Request(url, {
      method: "POST",
      body,
      headers,
    });

    const response = await auth.handler(requestWithSignature);

    return response;
  } catch (error: unknown) {
    console.error("Webhook error:", error);
    return new Response(
      `Webhook Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      { status: 400 }
    );
  }
}
