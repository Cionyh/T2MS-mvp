# Customer Review Clarity Fixes (Issues 3–10) — Design

**Status:** Draft for user review  
**Date:** 2026-09-20  
**Source:** Internal customer test findings (Starter Plan walkthrough)  
**Scope structure:** One umbrella design + one combined implementation plan with 8 task groups (option C)  
**Implementation approach:** Shared helpers first, then UI wiring (approach 2)

---

## 1. Context

A fresh Starter customer test found the product largely functional; remaining friction is clarity, navigation, and a few incorrect displays. Issues **1** (hosted-page explainer in onboarding) and **2** (dashboard “I signed up. Now what?”) are **already implemented** and out of scope.

This design covers remaining issues **3–10** only.

### Decisions locked in discovery

| Topic | Choice |
|-------|--------|
| Doc structure | One umbrella design + one combined plan with 8 task groups |
| #6 Team invite | Keep Invite Member; show Growth upgrade UI instead of invite form on non-team plans |
| #5 Analytics domain | Hosted page URL when available, else “Hosted Announcement Page”; never pending/internal |
| #3 Church defaults | Plan-aware: Church keeps church tone; Starter/Growth neutral; non-church footer placeholder blank |
| #9 Homepage | Dedicated “Two ways to use T2MS” section below the hero |
| #10 Trends dates | Bucket by viewer’s local timezone |
| Delivery approach | Shared helpers first, then UI |

---

## 2. Goals

- First-time Starter customers never see church-only copy unless they are on Church Partner.
- Empty Messages and Analytics never show confusing or internal-only values.
- Starter Team UI clearly routes multi-user intent to Growth upgrade.
- Billing/Setup naming matches the rest of the product (“Sites”, “Starter Plan”).
- Homepage states both product paths: widget on an existing site vs included hosted announcement page.
- Message Trends dates match the customer’s local calendar day.

### Non-goals

- Auth flow rewrites (Better Auth signup/login/org core remains untouched).
- Changing Stripe cancel-at-period-end / Restore Subscription behavior (test-coupon specific).
- Re-implementing issues 1–2.
- Adding a stored organization timezone setting.
- Redesigning Pricing or Church Partner marketing pages.

---

## 3. Architecture

Small shared helpers, then thin UI changes. Prefer extending existing modules (`client-setup`, `plan-display`, `hosted-page/constants`) over new frameworks.

```text
┌─────────────────────────────────────────────────────────┐
│  Helpers                                                 │
│  displaySiteLabel()                                      │
│  planAllowsTeamInvites()                                 │
│  getMessageFormatExamples(plan)                          │
│  formatPlanLabel() [existing]                            │
│  local date bucketing for trends                         │
└───────────────────────────┬─────────────────────────────┘
                            │
     ┌──────────────────────┼──────────────────────┐
     ▼                      ▼                      ▼
  App UI                 Landing                APIs
  Messages / Analytics   Two-ways section       analytics trends
  Team / Billing / Setup Hosted settings        (optional invite guard)
  Formatting callout
```

### Global constraints

- Tailwind only in components; no new `tailwind.config.js`; custom CSS only in `globals.css` if needed.
- Align with `requirements.mdc` / V1 hosted-page scope; do not expand Phase 2 worker/routing scope.
- Never touch auth flow logic beyond a minimal pre-check before inviting (no rewrite of `src/lib/auth.ts` invite email / Stripe hooks).
- Do not import packages that are not already in the codebase.

---

## 4. Shared helpers

### 4.1 `displaySiteLabel`

**Purpose:** Customer-facing site identity for Analytics (and reusable elsewhere).

**Input (minimum):** `{ domain?: string | null; hostedSlug?: string | null }`

**Rules (in order):**

1. If `domain` is present and **not** a placeholder (`isPlaceholderDomain` → false) → return the real domain string.
2. Else if `hostedSlug` is non-empty → return display host `"{slug}.{getHostedPageDomain()}"` (optionally full `https://…` for links; Analytics text can use host form consistent with Sites/Dashboard).
3. Else → return `"Hosted Announcement Page"`.

**Never** return values matching `pending-…` or `*.t2ms.local`.

**Location:** Prefer `src/lib/site-display.ts` importing `isPlaceholderDomain` and `getHostedPageDomain`, to keep `client-setup.ts` focused on setup gaps.

### 4.2 `planAllowsTeamInvites(plan)`

**True** for multi-seat plans: `pro` (Growth), `enterprise` (and any future alias already treated as Growth in billing).

**False** for: `starter`, `free`, `church`, missing/unknown (fail closed → upgrade UI).

### 4.3 Message formatting examples

Extract examples from `post-by-text-callout.tsx` into a small module or inline plan branch:

- **Church (`church`):** keep Sunday Worship / Join us this Sunday / Bible Study.
- **All other plans:** neutral business examples, e.g. `*Weekend sale*`, `_Open until 6pm_`, `- Free parking`.

### 4.4 Plan label

Reuse existing `formatPlanLabel(planId)` from `src/lib/plan-display.ts` (`starter` → `Starter Plan`, `church` → `Church Partner`, etc.).

---

## 5. Per-issue behavior

### #3 — Remove church-specific defaults from regular Starter

| Surface | Behavior |
|---------|----------|
| Hosted page footer placeholder | Non-church: blank placeholder (no “Open Sundays · All welcome”). Church: church-friendly placeholder allowed. |
| Stored default footer | Remains empty/`null` unless user sets it (no auto-fill of church copy for Starter). |
| Sites formatting examples | Plan-aware as in §4.3. |

### #4 — Messages empty state

When there are zero messages:

- Show clear empty copy, e.g.  
  **No messages yet.**  
  Send your first announcement from your verified phone number. Once received, it will appear here and on your announcement page.
- Do not show `Page 1 of 0`.
- Hide Previous/Next (preferred) or keep them disabled without a misleading page label.

When messages exist: keep table + pagination; ensure `totalPages` is at least `1` when `total > 0`, and when `total === 0` skip the page indicator entirely.

Also avoid showing raw placeholder domains in the Domain column when possible (use `displaySiteLabel` if low-cost; otherwise at least empty-state fix is required).

### #5 — Analytics internal domain

- Extend analytics API site/activity payloads to include `hostedSlug` (and optionally a precomputed `displayLabel`) so the UI can resolve labels.
- Site Statistics and Recent Activity render via `displaySiteLabel` (or server-provided `displayLabel`).
- Placeholder domains must never appear in those two sections.

### #6 — Starter Team controls

- Keep **Invite Member** visible for owners/admins (`canManageTeam`).
- If `!planAllowsTeamInvites(plan)`: dialog content is upgrade messaging (“Additional team members require Growth”) + CTA to `/app/change-plan` or Billing. **No** email/role/Send Invitation form.
- If allowed: existing invite form unchanged.
- **Backend fail-closed:** before calling `organization.inviteMember`, client checks plan; additionally add a server-side guard if a lightweight API already wraps invites — without rewriting Better Auth organization plugin. If the only path is the client SDK, document that UI gate + toast on error is the V1 control, and add a small server route guard only if one already exists or can be added without auth rewrite.

### #7 — Billing terminology

- Change visible label `Websites:` → `Sites:` in Billing plan limits.
- Do not change cancel-at-period-end / Restore Subscription logic.

### #8 — Setup plan naming

- Settings Setup / Plan & Add-on: show `Plan: {formatPlanLabel(planId)}` instead of raw `planId`.

### #9 — Homepage two ways

- New section **below Hero**, before existing How/Title flow as inserted in `src/app/page.tsx`.
- Title: **Two ways to use T2MS**
- Two short points:
  1. Already have a website? Add the T2MS widget to it.
  2. Want a standalone announcement page? Your plan includes one. Share the link and start posting without installing anything on a website.
- Match existing landing Tailwind / motion patterns; no new card-heavy dashboard look; keep section simple.

### #10 — Analytics Message Trends timezone

- Root cause: daily trends use `createdAt.toISOString().split('T')[0]` (UTC day).
- Fix: bucket by **viewer local** calendar date.
- Preferred implementation:
  1. API returns raw `createdAt` timestamps for trend window (or keep returning counts but stop UTC-pre-bucketing as the only source), **and/or**
  2. Client aggregates daily/weekly/monthly using local date keys from ISO timestamps.
- If payload size is a concern, API may accept a timezone offset / IANA name later; V1 uses client-side local bucketing from message timestamps already fetched for trends, or return `{ createdAt }[]` for the trend window only.

---

## 6. File map

| Area | Files |
|------|--------|
| Helpers | `src/lib/site-display.ts` (new), possibly `src/lib/plan-display.ts` or `src/lib/plan-limits.ts` for team gate; optional `src/lib/message-format-examples.ts` |
| #3 | `src/components/app/hosted-page-settings.tsx`, `src/components/app/post-by-text-callout.tsx` |
| #4 | `src/app/app/messages/messages-client.tsx`, optionally `src/app/api/messages/route.ts` |
| #5/#10 | `src/app/api/analytics/user/route.ts`, `src/components/app/analytics.tsx`, `src/lib/hooks/useUserAnalytics.ts` |
| #6 | `src/components/app/team-management.tsx` (+ minimal invite pre-check only) |
| #7 | `src/components/app/billing.tsx` |
| #8 | `src/components/app/setup-details.tsx` |
| #9 | new `src/components/landing/two-ways.tsx` (name flexible), `src/app/page.tsx` |

---

## 7. Error handling

- Team upgrade dialog: clear copy + link to change plan; cancel closes dialog.
- If invite is attempted on a non-team plan: show toast error; do not leave a half-open invite.
- `displaySiteLabel` always returns a non-empty safe string.

---

## 8. Testing plan

| Case | Expected |
|------|----------|
| Starter + placeholder domain + hosted slug | Analytics shows `slug.t2ms.live` (or configured hosted domain), never `pending-…t2ms.local` |
| Starter + no hosted slug | Analytics shows “Hosted Announcement Page” |
| Starter Team → Invite | Upgrade dialog, no invite form |
| Growth Team → Invite | Existing invite form |
| Church Sites formatting | Church examples |
| Starter Sites formatting | Neutral examples; blank footer placeholder |
| Messages with 0 rows | Empty copy; no “Page 1 of 0”; no useful pagination |
| Near-midnight local message | Trends count on local calendar day |
| Homepage mobile/desktop | Two-ways section under hero |
| Setup | `Starter Plan` not `starter` |
| Billing | `Sites: 1` |

---

## 9. Implementation plan shape (for writing-plans)

One file: `docs/superpowers/plans/2026-09-20-customer-review-clarity-fixes.md` with task groups:

1. Shared helpers (`displaySiteLabel`, `planAllowsTeamInvites`, format examples)
2. #3 Church defaults / neutral copy
3. #4 Messages empty state
4. #5 Analytics display labels (+ API `hostedSlug`)
5. #10 Trends local bucketing (can share Analytics task group if tightly coupled)
6. #6 Team upgrade dialog + fail-closed check
7. #7 + #8 Billing/Setup labels
8. #9 Homepage two-ways section

Each task group: files, steps, manual verify, commit.

---

## 10. Open risks

- Better Auth `inviteMember` may lack an easy server hook without touching auth config; V1 accepts UI gate + client pre-check, with a small dedicated API guard only if it can be added without rewriting auth flows.
- Returning all trend timestamps increases payload size vs pre-bucketed days; acceptable for typical Starter volumes (≤100 messages/month); revisit if needed.

---

## Spec self-review (completed at write time)

- No TBD/TODO placeholders left in requirements.
- Issues 3–10 each have explicit behavior; 1–2 explicitly out of scope.
- Approach 2 and structure C reflected throughout.
- Ambiguity on invite backend: fail-closed preference stated with V1 fallback.
