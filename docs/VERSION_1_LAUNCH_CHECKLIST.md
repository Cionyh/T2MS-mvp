# Version 1 — Launch readiness checklist

Use this before pointing production traffic at hosted pages on **t2ms.live**.

## Environment

- [ ] `HOSTED_PAGE_DOMAIN` and `NEXT_PUBLIC_HOSTED_PAGE_DOMAIN` set to `t2ms.live`
- [ ] DNS: wildcard `*.t2ms.live` → app host (Vercel or equivalent)
- [ ] `NEXT_PUBLIC_APP_URL` set to production app URL (embed snippets)
- [ ] Optional: `NEXT_PUBLIC_DEMO_HOSTED_SLUGS` for `/demo` example pages
- [ ] Optional church/hosted plan: `STRIPE_CHURCH_STARTER_PRICE_ID` and **`NEXT_PUBLIC_STRIPE_CHURCH_STARTER_PRICE_ID`** (same `price_…` value — required for onboarding/pricing UI) + `NEXT_PUBLIC_CHURCH_INTRO_PRICE_LABEL="$7.99"`
- [ ] Church intro Stripe price: **$7.99/mo** with **14-day trial**; price-lock metadata applied on sync
- [ ] Church verification: admin reviews at `/admin/dashboard/church-verifications` (or set `CHURCH_INTRO_AUTO_VERIFY=true` for attestation-only)
- [ ] Pricing copy reflects **one plan = hosted page + widget** on the same site (no double monthly charge)

## Database

- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] Verify `Client.hostedSlug`, `hostedEnabled`, `Onboarding.setupPath` columns exist

## Hosted pages

- [ ] `{slug}.t2ms.live` rewrites to `/p/{slug}` (middleware)
- [ ] Public page loads without login; polls `/api/message/{clientId}`
- [ ] Slug check rejects reserved names; suggestions work
- [ ] “Return to main website” uses `widgetConfig.companyWebsiteLink`

## Onboarding

- [ ] Path selection: **Hosted page only** vs **Widget embed**
- [ ] Hosted-only path skips install job; completes after hosted slug + publish
- [ ] Embed path still requires install setup form
- [ ] Church plan checkout works when Stripe price ID is configured

## Stripe / integrations

- [ ] Webhook endpoint healthy in production (`/api/auth/stripe/webhook`)
- [ ] Twilio SMS verify + inbound posting tested
- [ ] SendGrid (if used for reminders) configured

## Embed / iframe

- [ ] `/widget/iframe?clientId=` embeddable on Wix/Squarespace (CSP `frame-ancestors *`)
- [ ] Iframe dialog presets copy correct dimensions
- [ ] No clipping on common banner height (100–120px minimum documented)

## QA smoke test

1. Sign up → choose hosted-only → church or starter plan → register site → verify phone → set slug → publish hosted page
2. Open `https://{slug}.t2ms.live` in incognito; post SMS; confirm update within poll interval
3. Optional: embed path → install form → widget on test site
4. Visit `/demo` — example links resolve

## Legal / ops

- [ ] Privacy/terms links on marketing site if required
- [ ] Remove temporary reviewer access (GitHub, staging admin) per client request
- [ ] Monitor error logs for `/p/*` and `/api/message/*` after launch

---

Related: `docs/VERSION_1_FINALIZED_BUILD_SCOPE.md` (milestones 1–8).
