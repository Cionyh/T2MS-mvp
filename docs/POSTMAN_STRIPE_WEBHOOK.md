# Trigger Stripe Webhook from Postman

Use this to simulate Stripe sending a webhook to your app (e.g. after a subscription checkout) so the Billing page shows the correct plan.

## Testing without signature (dev only)

If you set **`STRIPE_WEBHOOK_SKIP_VERIFY=true`** in your environment, the webhook route will **auto-add** a valid `Stripe-Signature` header from the request body and your `STRIPE_WEBHOOK_SECRET`. You can then call the webhook from Postman **without** sending any `Stripe-Signature` header:

- **Method:** `POST`
- **URL:** `https://t2ms-staging.up.railway.app/api/auth/stripe/webhook` (or your local URL)
- **Headers:** `Content-Type: application/json`
- **Body:** raw JSON (e.g. the sample event below, with `client_reference_id` set to your user id)

**Important:** Only use this for local/staging testing. Do **not** set `STRIPE_WEBHOOK_SKIP_VERIFY` in production.

---

## 1. Get your values (when not using skip-verify)

- **Webhook URL**: `https://t2ms-staging.up.railway.app/api/auth/stripe/webhook` (or your local: `http://localhost:3000/api/auth/stripe/webhook`)
- **STRIPE_WEBHOOK_SECRET**: From Stripe Dashboard → Developers → Webhooks → your endpoint → "Signing secret" (starts with `whsec_`).
- **User ID**: The Better Auth user id for the account that “subscribed” (e.g. from your DB `user` table or from the session after sign-in). You need this in the payload so the subscription is linked to that user.

## 2. Postman request

| Field   | Value |
|--------|--------|
| **Method** | `POST` |
| **URL**    | `https://t2ms-staging.up.railway.app/api/auth/stripe/webhook` |
| **Headers** | See below |

### Headers

| Name             | Value |
|------------------|--------|
| `Content-Type`   | `application/json` |
| `Stripe-Signature` | *(see step 3)* |

You must set **Stripe-Signature** correctly or the webhook will reject the request.

## 3. Generate Stripe-Signature

Stripe signs the body as: `t=<timestamp>,v1=<hmac_sha256(secret, timestamp + "." + raw_body)>`.

**Option A – Node script (recommended)**

1. Put the **exact** JSON body you will send in Postman into a file, e.g. `scripts/stripe-webhook-payload-sample.json`.
2. Replace `REPLACE_WITH_YOUR_USER_ID` in that file with your real user id (cuid from `user` table).
3. Run (replace with your secret and path):

   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxx node scripts/stripe-webhook-sign.js scripts/stripe-webhook-payload-sample.json
   ```

4. Copy the printed `Stripe-Signature` value into Postman as the header value for `Stripe-Signature`.

**Option B – Postman Pre-request Script**

1. In Postman, set the request **Body** to **raw** → **Text** (not JSON) and paste the **exact** JSON string (no extra formatting). Or use **raw** → **JSON** and ensure it matches the file used in Option A exactly.
2. In **Pre-request Script** paste (set `webhookSecret` to your `whsec_...` value):

   ```javascript
   const webhookSecret = pm.environment.get('STRIPE_WEBHOOK_SECRET') || 'whsec_YOUR_SECRET_HERE';
   const rawBody = pm.request.body.raw || '';
   const timestamp = Math.floor(Date.now() / 1000);
   const signedPayload = timestamp + '.' + rawBody;
   const signature = CryptoJS.HmacSHA256(signedPayload, webhookSecret).toString(CryptoJS.enc.Hex);
   pm.request.headers.upsert({ key: 'Stripe-Signature', value: 't=' + timestamp + ',v1=' + signature });
   ```

   If `CryptoJS` is not available in your Postman, use Option A and paste the header manually.

## 4. Body (raw JSON)

Use the same JSON you used to generate the signature (e.g. from `scripts/stripe-webhook-payload-sample.json`). Minimal idea:

- **type**: `checkout.session.completed`
- **data.object.client_reference_id**: your Better Auth **user id** (so the subscription is attached to that user)
- **data.object.subscription**: e.g. `sub_xxx` (can be a placeholder for testing if your app only checks that it exists)
- **data.object.payment_status**: `paid`
- **data.object.status**: `complete`

If Better Auth expects more fields (e.g. `customer`, `customer_email`), add them so the payload matches what Stripe usually sends.

## 5. Send the request

- Send the **POST** request from Postman.
- If the signature and payload are valid, the handler should return **200** and your app should create/update the subscription for that user.
- Reload the Billing page; the plan should reflect the subscription (or you may need to trigger the event type your app actually uses, e.g. `customer.subscription.created`).

## 6. If it still doesn’t sync

Better Auth may listen for **customer.subscription.created** or **invoice.paid** instead of (or in addition to) **checkout.session.completed**. In that case:

- Duplicate the request in Postman.
- Change **type** and **data.object** to match that event (see [Stripe Event types](https://docs.stripe.com/api/events/types)).
- Regenerate **Stripe-Signature** for the new body and send again.

## Reference

- [Stripe – Webhook signature verification](https://docs.stripe.com/webhooks/signature)
- Your webhook route: `src/app/api/auth/stripe/webhook/route.ts`
