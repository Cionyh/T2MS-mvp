# Customer Review Clarity Fixes (Issues 3–10) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship review items 3–10: neutral Starter copy, Messages empty state, Analytics safe labels + local trends, Starter team upgrade dialog, Billing/Setup labels, homepage two-ways section.

**Architecture:** Shared helpers first (`displaySiteLabel`, `planAllowsTeamInvites`, format examples), then wire each UI/API surface. No auth-flow rewrites; no cancel/restore billing changes.

**Tech Stack:** Next.js App Router, React client components, Prisma analytics API, existing `plan-display` / `client-setup` / hosted-page helpers, Tailwind v4.

**Spec:** `docs/superpowers/specs/2026-09-20-customer-review-clarity-fixes-design.md`

## Global Constraints

- Tailwind only in components; no new `tailwind.config.js`
- Do not rewrite auth flows in `src/lib/auth.ts`
- Do not change subscription cancel/restore behavior
- Issues 1–2 already done — leave alone
- Prefer existing helpers (`formatPlanLabel`, `isPlaceholderDomain`, `getHostedPageDomain`)

---

### Task 1: Shared helpers

**Files:**
- Create: `src/lib/site-display.ts`
- Create: `src/lib/message-format-examples.ts`
- Modify: `src/lib/plan-display.ts` — add `planAllowsTeamInvites`

- [x] Add `displaySiteLabel` / `displaySiteHost`
- [x] Add church vs neutral format examples
- [x] Add `planAllowsTeamInvites(plan)`
- [ ] Commit helpers

### Task 2: #3 Neutral / church-aware copy

**Files:**
- Modify: `src/components/app/hosted-page-settings.tsx`
- Modify: `src/components/app/post-by-text-callout.tsx`

- [x] Blank footer placeholder for non-church (plan prop or omit church placeholder)
- [x] Wire format examples by plan
- [ ] Commit

### Task 3: #4 Messages empty state

**Files:**
- Modify: `src/app/app/messages/messages-client.tsx`

- [x] Empty copy when no messages
- [x] Hide pagination / Page 1 of 0
- [x] Use display label for domain column when feasible
- [ ] Commit

### Task 4: #5 + #10 Analytics

**Files:**
- Modify: `src/app/api/analytics/user/route.ts`
- Modify: `src/lib/hooks/useUserAnalytics.ts`
- Modify: `src/components/app/analytics.tsx`
- Create (optional): `src/lib/analytics-local-trends.ts`

- [x] Include `hostedSlug` + `displayLabel` in site/activity payloads
- [x] Return trend timestamps or bucket locally on client
- [x] UI uses display labels; charts use local dates
- [ ] Commit

### Task 5: #6 Team upgrade dialog

**Files:**
- Modify: `src/components/app/team-management.tsx`

- [x] Resolve current plan (billing/onboarding API already used elsewhere)
- [x] If `!planAllowsTeamInvites`: upgrade dialog + link to change-plan
- [x] Guard `handleInviteMember` fail-closed
- [ ] Commit

### Task 6: #7 + #8 Labels

**Files:**
- Modify: `src/components/app/billing.tsx`
- Modify: `src/components/app/setup-details.tsx`

- [x] `Websites:` → `Sites:`
- [x] `formatPlanLabel(planId)`
- [ ] Commit

### Task 7: #9 Homepage two-ways

**Files:**
- Create: `src/components/landing/two-ways.tsx`
- Modify: `src/app/page.tsx`

- [x] Section below Hero
- [ ] Commit

### Task 8: Manual verification

- [ ] Walk checklist from spec §8
