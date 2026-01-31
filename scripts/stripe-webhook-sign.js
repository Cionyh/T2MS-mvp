#!/usr/bin/env node
/**
 * Generate Stripe-Signature header for testing webhooks in Postman.
 * Usage: node scripts/stripe-webhook-sign.js <STRIPE_WEBHOOK_SECRET> <path-to-payload.json>
 * Or:    STRIPE_WEBHOOK_SECRET=whsec_xxx node scripts/stripe-webhook-sign.js payload.json
 *
 * The payload file should contain the raw JSON body (e.g. a Stripe event).
 * Output: Stripe-Signature value to paste in Postman header.
 */

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const secret = process.env.STRIPE_WEBHOOK_SECRET || process.argv[2];
const payloadPath = process.env.STRIPE_WEBHOOK_SECRET ? process.argv[2] : process.argv[3];

if (!secret || !payloadPath) {
  console.error("Usage: STRIPE_WEBHOOK_SECRET=whsec_xxx node scripts/stripe-webhook-sign.js <payload.json>");
  console.error("   Or: node scripts/stripe-webhook-sign.js <STRIPE_WEBHOOK_SECRET> <payload.json>");
  process.exit(1);
}

const rawBody = fs.readFileSync(path.resolve(payloadPath), "utf8");
const timestamp = Math.floor(Date.now() / 1000);
const signedPayload = `${timestamp}.${rawBody}`;
const signature = crypto.createHmac("sha256", secret).update(signedPayload).digest("hex");

console.log("Stripe-Signature: t=%d,v1=%s", timestamp, signature);
console.log("\nPaste this in Postman as header:");
console.log("  Name:  Stripe-Signature");
console.log("  Value: t=%d,v1=%s", timestamp, signature);
