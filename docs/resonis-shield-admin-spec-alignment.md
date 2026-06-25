# Resonis Shield Admin Dashboard — Spec Alignment Audit

**Date:** June 22, 2026  
**Audited against:** Resonis Shield Admin Dashboard Product Specification (V1)  
**Codebase audited:** T2MS-mvp (`/Users/waqassaeed/Sites/T2MS-mvp`)  
**Method:** Static code review — no code changes made.

---

## Executive Summary

The Resonis Shield admin specification describes an internal operations dashboard for a **senior-protection telephony product** (Shield sessions, protected people, backup codes, grace periods, blocked caller numbers, etc.).

The current codebase is **Text2MySite (T2MS)** — a church/messaging/website-management platform with a different domain model (clients/sites, messages, install jobs, workers, church verification, subscriptions).

**Overall alignment: ~5% implemented as specified.**  
The repo has a functional **T2MS admin dashboard**, but it is not the Resonis Shield admin described in the spec. Most spec sections (3–8) have **no corresponding data models, routes, or UI** in this codebase.

| Status | Count (approx.) |
|--------|-----------------|
| ✅ Aligned / substantially met | 3 items |
| 🟡 Partially aligned | 12 items |
| ❌ Not implemented | 80+ items |

---

## Critical Context

Before section-by-section review, note these fundamental gaps:

| Spec concept | Present in codebase? |
|--------------|---------------------|
| Protected people / seniors | ❌ No model |
| Shield call/SMS sessions | ❌ No model |
| Backup codes | ❌ No model |
| Account status lifecycle (Grace Period, Provisioning Failed, etc.) | ❌ No model |
| Blocked numbers (telephony abuse) | ❌ No model |
| Admin flags table | ❌ No model |
| Audit log table | ❌ No model |
| System health indicators (Twilio/Stripe/Railway) | ❌ No dedicated page |

The Prisma schema (`prisma/schema.prisma`) contains: `User`, `Client`, `Message`, `Subscription`, `InstallJob`, `Worker`, `Onboarding`, `InboundTwilioNumber`, etc. — none of the Shield-specific entities from the spec.

---

## Section 1 — Admin Access & Security

| Requirement | Status | Evidence / Notes |
|-------------|--------|------------------|
| Separate unlisted admin URL (e.g. `admin.resonis.com`, non-obvious path) | 🟡 Partial | Admin lives at `/admin` and `/admin/dashboard` — spec explicitly says **not** to use `/admin` or `/dashboard`. |
| Single admin account only (founder) | ❌ | `POST /api/admin/create-admin` creates/updates `admin@t2ms.com`. Multiple users can have `role: "admin"`. Workers can also log in via `/admin` and are redirected to `/worker/dashboard`. |
| Admin login separate from customer login | 🟡 Partial | Separate pages: `/admin` (admin sign-in) vs `/sign-in` (client). **Same** Better Auth backend, same session/cookie mechanism — not a fully isolated auth system. |
| Email + password + mandatory TOTP | ❌ | Admin sign-in (`src/components/auth/admin-sign-in.tsx`) is email + password only. No TOTP/2FA anywhere in codebase. |
| Admin session expires after 2 hours inactivity | ❌ | No inactivity timeout configured in `src/lib/auth.ts`. Better Auth default session behavior only. |
| Failed login rate limit: 3 attempts → 30-min lockout | ❌ | No admin-specific rate limiting. User `ban` exists but is manual admin action, not login lockout. |
| Every admin login (success/fail) logged with IP + timestamp | ❌ | `Session` model stores `ipAddress` on session creation, but no dedicated admin login audit log. |
| Admin URL not in sitemap, robots.txt, or public links | 🟡 Partial | No `robots.txt` or sitemap files found. Root layout sets `robots: { index: true, follow: true }` globally. Admin login page **displays T2MS branding** ("Sign In to T2MS Admin Ground") — spec says login should not display Resonis Shield branding publicly. |
| Admin login page without product branding | ❌ | Branded T2MS admin login with animations (`src/app/admin/page.tsx`). |

---

## Section 2 — Global Layout

| Requirement | Status | Evidence / Notes |
|-------------|--------|------------------|
| Utility-first, functional design | 🟡 Partial | Admin is functional but styled with T2MS branding, animations, charts — more polished than spec's "does not need to be beautiful." |
| Left sidebar with 5 sections: Accounts, Flagged Items, Blocked Numbers, Audit Log, System Status | ❌ | Layout uses **top navigation** (`src/app/admin/dashboard/admin-layout.tsx`) with 13 items: Dashboard, Clients, Sites, Messages, Inbound Numbers, Subscriptions, Church Verifications, Coupon Codes, Analytics, Jobs, Teammembers, Referral Codes, Settings. None match spec nav. |
| Persistent global search bar (email, phone, owner name, protected person) | ❌ | No global search. Per-page search exists on Subscriptions, Messages, Sites, Jobs, Workers only. |
| Instant search results with account link | ❌ | Not implemented. |
| Search performance <500ms with indexed fields | ❌ | Not applicable — global search not built. |

---

## Section 3 — Account View (Core Screen)

The spec's account view is a **single scrollable page** for one Shield customer account. The closest T2MS equivalent would be a unified user/client detail page — **this does not exist**.

| Requirement | Status | Evidence / Notes |
|-------------|--------|------------------|
| Single-page account view (no tabs) | ❌ | Users listed in table at `/admin/dashboard/clients`. No `/clients/[id]` detail page. Client API `GET /api/admin/clients/[id]` returns basic site info only. |
| **3.1 Account Header** (owner name, email copy, phone copy, created, status badge, Stripe link, last login + location, total sessions) | ❌ | Clients table shows email, name, role, banned, createdAt only. No copy buttons, Stripe deep link, last login location, or session totals. |
| **3.2 Account Status Definitions** (Active, Pending Termination, Grace Period, etc.) | ❌ | No Shield account status model or colored badges per spec. |
| **3.3 Protected People cards** | ❌ | Domain does not exist. |
| **3.4 Billing Summary** | 🟡 Partial | Subscriptions page (`/admin/dashboard/subscriptions`) lists plan, status, period dates across all users — not per-account summary on one screen. No payment method last-4, last payment, or Stripe history link per account. |
| **3.5 Session Log** (Shield calls/SMS with outcomes, masked numbers, Twilio SID) | ❌ | Messages page shows T2MS site messages — not Shield telephony sessions. No session outcome fields from spec. |

---

## Section 4 — Admin Actions

Spec requires all actions on the account view with confirmation + audit logging. Current T2MS admin has a **different action set** on the clients list page.

### 4.1 — Account State Actions

| Action | Status | Notes |
|--------|--------|-------|
| Force Activate | ❌ | Not implemented |
| Force Suspend | 🟡 Partial | `banUser` / `unbanUser` via Better Auth admin plugin — different semantics (user ban, not Shield routing suspend) |
| Lift Suspension | 🟡 Partial | `unbanUser` exists |
| Extend Grace Period | ❌ | Not implemented |
| Force Delete Account | 🟡 Partial | `DELETE /api/admin/users/[userId]` with single confirmation dialog. No double confirmation, no mandatory reason, no CCPA email. |
| Reset Lockout | ❌ | Not implemented |
| Clear Same-Day Pause Flag | ❌ | Not implemented |

### 4.2 — Communication Actions

| Action | Status | Notes |
|--------|--------|-------|
| Resend Activation Email | ❌ | Not implemented |
| Resend Cancellation Email | ❌ | Not implemented |
| Resend Contact Intro SMS | ❌ | Not implemented |
| Send Custom Admin Note | ❌ | Not implemented |
| Trigger Post-Session SMS | ❌ | Not implemented |

### 4.3 — Billing Actions

| Action | Status | Notes |
|--------|--------|-------|
| View Full Billing History (Stripe deep link) | ❌ | No Stripe customer dashboard links in admin UI |
| Waive Next Invoice | ❌ | Not implemented |
| Override Subscription End Date | 🟡 Partial | Subscriptions page allows editing subscription records and canceling — not spec-compliant override with audit reason |

### 4.4 — Data & Privacy Actions

| Action | Status | Notes |
|--------|--------|-------|
| Export Account Data | ❌ | Not implemented |
| Delete Account (CCPA) — double confirm + reason + auto email | 🟡 Partial | User delete exists with single confirm; no `DELETE` typing step, no reason field, no customer confirmation email |
| Remove One Contact | ❌ | Not implemented |
| Remove Verified Number | ❌ | Not implemented |

### 4.5 — Mimic User

| Requirement | Status | Evidence / Notes |
|-------------|--------|------------------|
| Persistent banner: "ADMIN VIEW — Mimicking [Name]" | 🟡 Partial | Banner exists: "Viewing as {name}" (`src/app/app/client-layout.tsx`). Wording differs; shown in **customer app**, not admin panel. |
| Mimic mode is READ ONLY | ❌ | No read-only enforcement during impersonation. User can interact with customer app normally. |
| Changes must be made from admin panel, not mimic mode | ❌ | Not enforced |
| Exit mimic returns to admin account view | 🟡 Partial | "Stop impersonating" returns via Better Auth; routes to customer app flow, not necessarily admin account detail view (which doesn't exist). |
| Mimic sessions logged (account, start, end) | ❌ | `Session.impersonatedBy` field exists but no dedicated mimic audit log entries with start/end times. |

### Cross-cutting: Confirmation on all actions + audit log

| Requirement | Status | Notes |
|-------------|--------|-------|
| Confirmation dialog on every action | 🟡 Partial | Delete user and some other pages use `AlertDialog`. Many actions (impersonate, revoke sessions, ban) have no confirmation. |
| Every action logged to audit log | ❌ | No audit log system exists. |

---

## Section 5 — Flagged Items

| Requirement | Status | Notes |
|-------------|--------|-------|
| Flagged Items nav section | ❌ | Not present |
| Auto-generated flags (11 types in spec) | ❌ | No `flags` table or flag generation logic |
| Flag display with resolve + required note | ❌ | Not implemented |
| Sort by severity then date | ❌ | Not implemented |
| Provisioning Failed triggers external ops alert | ❌ | Not implemented |

**Loose parallel:** Church Verifications page (`/admin/dashboard/church-verifications`) is a manual review queue — conceptually similar to "items needing attention" but different domain, no flag types, no resolution notes, no severity sorting.

---

## Section 6 — Blocked Numbers

| Requirement | Status | Notes |
|-------------|--------|-------|
| Blocked Numbers nav section | ❌ | Not present |
| Blocked numbers list (full number, blocked at, expires, reason, status) | ❌ | No blocked-number model |
| Unblock / Extend Block / Permanent Block actions | ❌ | Not implemented |

**Note:** `InboundTwilioNumber` manages T2MS inbound SMS numbers — not telephony security blocks for abusive callers.

---

## Section 7 — Audit Log

| Requirement | Status | Notes |
|-------------|--------|-------|
| Audit Log nav section | ❌ | Not present |
| Log all admin actions (Section 4) | ❌ | Not implemented |
| Log admin logins (success/fail) with IP | ❌ | Not implemented |
| Log mimic sessions | ❌ | Not implemented |
| Log search queries | ❌ | Not implemented |
| Log backup code reveals | ❌ | Not implemented |
| Log flag resolutions | ❌ | Not implemented |
| Entry fields: timestamp, action type, account, details, IP, session ID | ❌ | No `audit_log` table in Prisma |
| Append-only / no edit or delete | ❌ | Not implemented |
| Searchable by date, action type, account | ❌ | Not implemented |
| CSV export | ❌ | Not implemented |
| Separate table surviving account deletion | ❌ | Not implemented |
| INSERT-only DB permissions on audit table | ❌ | Not implemented |

---

## Section 8 — System Status

| Requirement | Status | Notes |
|-------------|--------|-------|
| System Status nav section | ❌ | Not present |
| Service health indicators (Twilio calls/SMS, Stripe webhooks, DB, email, Railway) | ❌ | Not implemented |
| Green/yellow/red status logic per spec | ❌ | Not implemented |
| Recent alerts (last 10) | ❌ | Not implemented |
| Quick stats: active accounts, protected people, sessions today, failed payments | 🟡 Partial | Admin home (`src/components/admin/home.tsx`) and Analytics page show T2MS metrics (clients, users, messages, subscriptions) — different metrics, not live health checks |
| Auto-refresh every 60 seconds | ❌ | Not implemented on any status page |

---

## Section 10 — Admin QC (Pre-Launch Checklist)

| QC Item | Status |
|---------|--------|
| Admin URL not publicly linked or indexed | 🟡 Partial — uses `/admin`; no explicit exclusion in robots/sitemap |
| Two-factor authentication enforced | ❌ |
| Every Section 4 action tested | ❌ — most actions don't exist |
| Every action logged in audit log | ❌ |
| Mimic mode read-only banner | 🟡 Banner yes; read-only no |
| Force Activate resolves provisioning failure | ❌ |
| CCPA deletion double-confirmation + email | ❌ |
| Provisioning Failed flag generation | ❌ |
| Session log for test account | ❌ |
| Backup code reveal + logging | ❌ |
| Blocked numbers after bot test | ❌ |
| Unblock removes telephony block | ❌ |
| Audit log populated during testing | ❌ |
| Audit log DELETE query fails | ❌ |
| System status reflects real service state | ❌ |

---

## What *Is* Aligned (T2MS Admin — Existing Capabilities)

These are real features in the codebase that overlap **conceptually** with the spec's intent (founder-operable admin), even though they serve T2MS not Resonis Shield:

| Feature | Location | Spec overlap |
|---------|----------|--------------|
| Admin-only route protection | `src/app/admin/dashboard/layout.tsx`, API `verifyAdmin` patterns | ✅ Role-gated admin area |
| Separate admin login page | `/admin` | 🟡 Separate URL, shared auth |
| User impersonation | `client.admin.impersonateUser` on Clients page | 🟡 Mimic user (incomplete vs spec) |
| User ban / unban | Clients page via Better Auth admin plugin | 🟡 Loosely like suspend |
| User deletion with confirmation | Clients page + `DELETE /api/admin/users/[userId]` | 🟡 Loosely like account delete |
| Subscription list + cancel/edit | `/admin/dashboard/subscriptions` | 🟡 Billing visibility only |
| Per-resource admin search | Subscriptions, messages, sites, jobs, workers | 🟡 Not global account search |
| Church verification queue | `/admin/dashboard/church-verifications` | 🟡 Loosely like flagged items |
| Analytics dashboard | `/admin/dashboard/analytics` | 🟡 Operational metrics, not system health |
| Admin API routes | `src/app/api/admin/*` | ✅ Admin backend pattern exists |

---

## Recommended Interpretation

This audit should be read as a **gap analysis for building Resonis Shield admin on top of (or alongside) the T2MS codebase**, not as a failure of the existing T2MS admin — which was built for a different product.

To implement the Resonis Shield spec, the project would need at minimum:

1. **New domain models** — protected people, shield sessions, account status, flags, blocked numbers, audit log  
2. **New admin navigation** — Accounts, Flagged Items, Blocked Numbers, Audit Log, System Status  
3. **Security hardening** — TOTP, admin-specific session policy, login rate limiting, obscure URL, login audit  
4. **Account detail page** — single-screen view per spec Section 3  
5. **Full action suite** — Section 4 with confirmations and mandatory audit logging  
6. **Impersonation rework** — read-only mimic with proper logging and admin return flow  

---

## Files Reviewed (Primary)

| Area | Key paths |
|------|-----------|
| Admin routes | `src/app/admin/`, `src/app/admin/dashboard/` |
| Admin layout & nav | `src/app/admin/dashboard/admin-layout.tsx` |
| Admin auth | `src/components/auth/admin-sign-in.tsx`, `src/lib/auth.ts` |
| Clients / users admin | `src/app/admin/dashboard/clients/page.tsx`, `src/app/api/admin/users/` |
| Impersonation | `src/app/app/client-layout.tsx`, `src/lib/auth-types.ts` |
| Subscriptions | `src/app/admin/dashboard/subscriptions/page.tsx` |
| Analytics | `src/app/admin/dashboard/analytics/page.tsx`, `src/components/admin/home.tsx` |
| Schema | `prisma/schema.prisma` |
| Middleware | `src/middleware.ts` |

---

*Generated by static audit. No application code was modified.*
