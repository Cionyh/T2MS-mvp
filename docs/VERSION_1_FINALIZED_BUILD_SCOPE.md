# Version 1 — Finalized Build Scope

**Prepared by:** Waqas Saeed  
**Client:** Ciony Holloway (Text2MySite / T2MS)  
**Status:** Agreed direction for implementation (May 2026)  
**Purpose:** Single reference for what was finalized to build after client discussions, discovery review, and scope refinement.

---

## 1. Executive summary

After several rounds of discussion, the client and developer aligned on a **lean Version 1 launch** centered on **hosted standalone announcement pages**, not a widget-install-only product and not a website builder.

Version 1 will extend the **existing T2MS widget/fullscreen and announcement configuration system** into stable, shareable public hosted pages. The **website widget/embed path remains supported** but is **optional**, not the primary launch dependency.

The client confirmed proceeding at a **reduced rate of $16/hr** for Version 1 end-to-end completion. The hosted-page ecosystem will use **`t2ms.live`** for subdomains (e.g. `churchname.t2ms.live` or equivalent routing).

**Implementation:** All Version 1 features are built by **extending this repository (`T2MS-mvp`)** — not a separate production application. See [Section 2](#2-architecture-decision-implementation-repository).

---

## 2. Architecture decision (implementation repository)

This was **not** specified by the client as a second product or codebase. Ciony’s agreement is to **extend the existing T2MS app** (widget/fullscreen, announcements, onboarding, Stripe, Twilio). The architecture below reflects that agreement and supersedes any informal “new app” scaffold used only for documentation.

### 2.1 Where Version 1 is built

| Item | Decision |
|------|----------|
| **Production codebase** | **`T2MS-mvp`** (this repo) — single Next.js application |
| **Extend, don’t replace** | Reuse `Client`, `widgetConfig`, messages, `src/app/display/`, `src/app/widget/`, auth, billing, onboarding |
| **New work in same app** | Public hosted-page routes, slug/subdomain fields, host-based routing for `t2ms.live`, onboarding copy for two paths, Prisma migrations |
| **Deployments** | Existing staging/production targets (e.g. `t2ms.biz`) plus **`t2ms.live`** for public hosted pages (wildcard DNS + TLS + middleware) |

### 2.2 What `t2ms-hosted/` is (and is not)

The folder **`t2ms-hosted/`** at the repo root is **documentation and Base44 reference only** (screenshots, discovery notes). It is **not** the agreed Version 1 delivery app and does **not** need its own production deployment for launch unless the client later requests a split.

| | `T2MS-mvp` | `t2ms-hosted/` |
|---|------------|----------------|
| Version 1 implementation | **Yes** | **No** (docs/reference) |
| Auth, Stripe, Twilio, full dashboard | **Yes** | Scaffold only — not wired for launch |
| Base44 screenshot references | Linked from `docs/` | **`t2ms-hosted/docs/`** |

### 2.3 Technical extension points (in `T2MS-mvp`)

- **Display / announcement rendering:** `src/app/display/`, widget routes — basis for public hosted page HTML
- **Site configuration:** `src/components/app/sites.tsx`, `Client.widgetConfig` in `prisma/schema.prisma`
- **Onboarding / install:** existing flows per `docs/GET_INSTALLED_WIDGET_FLOW.md` — extend for “hosted link only” vs “embed on site”
- **Routing:** add middleware or route handlers to resolve `Host: *.t2ms.live` → correct `Client` / hosted page
- **Database:** extend `Client` (or related model) with public slug, subdomain, publish state, main-website URL — **not** a duplicate schema in `t2ms-hosted/prisma`

### 2.4 Explicitly out of architecture scope for V1

- A second full Next.js product duplicating auth, billing, and admin
- Treating Base44 DIY Builder or SitePilot as codebases to integrate
- Building hosted pages only in `t2ms-hosted` while leaving `T2MS-mvp` unchanged

---

## 3. Product direction (finalized)

### 3.1 Two supported use cases

| Use case | Role in Version 1 |
|----------|-------------------|
| **Hosted standalone / full announcement pages** | **Primary** — customer can use a live hosted page without installing anything on their site; they may link to it from website, social, email, etc. |
| **Website widget** (banner, ticker, popup, fullscreen, iframe embed) | **Optional / additional** — still available for customers who want embed-on-site, but not required for launch success |

### 3.2 Strategic goals

- Reduce installation friction and liability concerns (especially for church outreach)
- Stay **lightweight, stable, easy to onboard, easy to support**
- Visually connect each hosted page to the customer’s identity (name, logo, colors)
- Avoid overbuilding before customer validation and early sales

### 3.3 What Version 1 is **not**

Agreed explicitly — **out of scope** for Version 1:

- Full Wix/Squarespace-style website builder
- Multi-page website creation
- Drag-and-drop page editing
- Complex CMS rebuild
- Heavy template ecosystem (Option B / “enhanced template” path deferred)
- AI-generated pages, translation, FTP deployment pipelines
- Advanced analytics dashboards, reminder systems, large support-center modules
- Rebuilding or integrating Base44 systems as technical foundations

### 3.4 What Version 1 **is**

- A **clean hosted announcement / live page** powered by the **existing widget/announcement data model**
- Customer customization within controlled settings: background, text, links, logos, announcement styles
- A **hosted page URL** (slug and/or subdomain on `t2ms.live`)
- Easy sharing/linking from existing web and social properties
- Optional **“Return to Main Website”** link for companion/tag-along use

---

## 4. Finalized feature scope (what to build)

### 4.1 Hosted announcement page (core)

Build and ship a **stable, public, shareable** hosted page that:

- Displays the **live announcement area** (driven by existing announcement/widget logic)
- Shows **business or church name**
- Supports **logo** (upload/display; cleanup as needed)
- Supports **background and colors** (reuse/extend existing configuration where possible)
- Includes **optional short intro text** only if implementation stays simple
- Is **mobile-friendly / responsive**
- Includes **“Return to Main Website”** button or link when the customer provides a main site URL
- Does **not** require visitors to log in to view

**Technical note (agreed):** This is **not** greenfield platform work — it adapts and extends the current widget/fullscreen/display architecture and related configuration, with **database and structural changes** as needed to support hosted URLs, slugs/subdomains, and publishing.

### 4.2 URL, slug, and subdomain

- Customers can choose a **public slug** with **uniqueness** enforced in the database
- **Reserved names** blocked; **alternatives suggested** when taken
- **Subdomain** support on client domain **`t2ms.live`** (wildcard DNS, TLS, host-based routing in the app)
- Availability checking UX (e.g. suggest alternatives when `churchname.t2ms.live` is unavailable)

*Aligns with originally proposed Milestones 1–3; implementation order may be phased within the lean contract.*

### 4.3 Onboarding (lightweight)

- **Two-path onboarding** clearly explained:
  - **Path A:** Use a **hosted link only** (no embed/install required)
  - **Path B:** **Embed widget** on existing website (install/setup complexity only when chosen)
- Simplify first-time setup; avoid unnecessary fields and builder-style steps
- Reuse discovery insights where practical:
  - Pre-configured defaults
  - Clear setup/connection state (not set up / partial / ready)
  - Strong primary action (“get started” / update flow)
  - Minimal preview-before-go-live if kept very simple

*Phone verification and publishing gating remain part of the existing product direction; extend only as needed for hosted-page flow.*

### 4.4 Widget / embed (secondary, not launch blocker)

- Widget/banner/ticker/popup/fullscreen remains available for customers who choose embed
- **Iframe/platform hardening** (Wix, clipping, constrained containers) was a stated priority; treat as **in-scope for stabilization** where contract hours allow, or **defer post-launch** if needed to protect the lean hosted-page deadline

### 4.5 Demo / outreach (supporting launch)

- **One clean primary demo link** for emails and landing
- **Multiple example styles/pages** for outreach (church and general)
- Better presentation flow for sales/outreach emails

*Scope should stay minimal — examples, not a new product surface.*

### 4.6 Billing and church pricing

- **Unified monthly plan (V1):** One subscription covers **both** the hosted announcement page and the website widget on the same account/site — no double monthly charge. Onboarding path selection is setup-only.
- **Install add-on:** Optional one-time fee when a hosted-only customer later requests professional widget installation (existing `/app/install-request` flow).
- **Church intro pricing** (verified churches / religious organizations during launch):
  - 14-day free trial
  - **$7.99/month**
  - Price locked for up to **3 years** for early church adopters
  - Admin verification at `/admin/dashboard/church-verifications` (or `CHURCH_INTRO_AUTO_VERIFY` for attestation-only)
- Wire church intro offer through **checkout and onboarding** with eligibility gating
- **Stripe / Twilio / SendGrid stabilization** for launch (including addressing webhook reliability on staging/production endpoints)

### 4.7 Launch readiness

- Staging and production validation
- Mobile and cross-browser checks on hosted pages and key embed paths
- UI polish and bug fixes on launch-critical flows
- Basic monitoring/rollback awareness
- Any legal/privacy notes required for **public hosted pages**

---

## 5. Discovery phase (completed — informs build, does not expand scope)

Before full milestone implementation, the client requested a **limited Base44 discovery review** (DIY Hosted Page/Builder + SitePilot). Conclusion agreed with client:

**Reuse for Version 1 (concepts only):**

- Lightweight hosted-page **settings model** (structured fields, not freeform builder)
- Business name, logo, colors, short intro, contact details, widget position as controlled settings
- Pre-configured defaults and clearer onboarding/setup-state UX
- Simple primary action and shortcut entry points
- Minimal preview-before-go-live if simple

**Defer:**

- Full DIY builder, template catalogs, AI pages, translation, FTP deployment, analytics, reminders, large admin/support workflows

**Do not reuse directly:**

- Base44 architecture, mocked integrations, deployment pipelines, builder product scope

Deliverables from that phase: `docs/BASE44_DISCOVERY_NOTE.md`, `docs/BASE44_PRELIMINARY_DISCOVERY_REVIEW.md`, `docs/BASE44_DISCOVERY_REPORT.md`.

**Live app reference captures** (screenshots + reuse notes for implementation):

| App | URL | Documentation |
|-----|-----|----------------|
| DIY Announcement Builder | [diy-announcement-builder.base44.app](https://diy-announcement-builder.base44.app) | `t2ms-hosted/docs/DIY_ANNOUNCEMENT_BUILDER_SCREENSHOTS.md` |
| SitePilot | [sitepilot.base44.app](https://sitepilot.base44.app/) | `t2ms-hosted/docs/SITEPILOT_SCREENSHOTS.md` |

---

## 6. Option decision: Simple vs enhanced template

The client asked for a comparison between:

- **Option A — Simple announcement page (AP):** lean setup (name, URL/subdomain, logo/background, existing announcement system)
- **Option B — Enhanced template:** richer onboarding, more structure and customization

**Final decision:** Proceed with **Option A / simple native T2MS hosted page** on existing widget/fullscreen foundation. **Option B deferred** until after initial validation and sales.

---

## 7. Milestone alignment (reference)

The following **eight-milestone roadmap** was proposed by Waqas and accepted in principle by the client (“structure and direction look very good”). Scope and hours were later **simplified** after internal client review.

| # | Milestone | Summary |
|---|-----------|---------|
| 1 | Hosted announcement page (MVP URL) | Stable public live page; no login to view |
| 2 | Slug + availability | Unique slug, reserved names, alternatives |
| 3 | Custom subdomain | `slug.t2ms.live` (client secured **t2ms.live**) |
| 4 | Two-path onboarding | Hosted-only vs embed paths |
| 5 | Demo & outreach | Primary demo link + example pages |
| 6 | Embed / iframe hardening | Wix, clipping, presets/docs |
| 7 | Stripe & church intro pricing | Church offer in Stripe + checkout/onboarding |
| 8 | Launch readiness | QA, staging/prod, monitoring, legal notes |

A **condensed four-milestone estimate** was later shared (foundation, branding, onboarding/verification/publishing, integration/launch). The client requested identifying **new development vs extension of existing code** and further lean-down. **Final commercial agreement:** proceed at **$16/hr** with intentionally **lightweight** Version 1 scope as listed in Section 4.

Contract/milestone paperwork to be completed on the **client side**.

---

## 8. Commercial terms (finalized)

| Item | Agreement |
|------|-----------|
| Rate | **$16/hr** for Version 1 end-to-end (reduced from earlier estimates to fit budget) |
| Scope posture | Lean launch; avoid feature creep and extra customization layers pre-validation |
| Domain | **`t2ms.live`** secured for hosted announcement subdomain ecosystem |
| Discovery | Preliminary Base44 review (~4–5 hour cap) completed before main build |

---

## 9. Existing codebase — reuse vs new work

**Client understanding:** Widget/fullscreen, styling configuration, and parts of onboarding/verification/publishing **already exist** in **`T2MS-mvp`**.

**Developer position (finalized in discussion):** Frontend and configuration patterns exist, but Version 1 requires **significant database and structural changes** in this repo to support hosted URLs, slugs/subdomains, publishing model, and onboarding paths for the new primary use case.

**Build approach:** Extend the **single `T2MS-mvp` application** ([Section 2](#2-architecture-decision-implementation-repository)); do not fork a separate builder platform or ship Version 1 from `t2ms-hosted/`.

---

## 10. Deferred to post–Version 1

Unless explicitly added by change order:

- Enhanced template / Option B experience
- Full page builder and template catalogs
- Multi-page sites and drag-and-drop editing
- Base44-scale request management, reminders, analytics admin
- Broad iframe/platform matrix beyond launch-critical fixes
- Non-essential customization layers

---

## 11. Operational / admin notes

- Remove **temporary access** for short-term reviewers (e.g. Sintayehu) from GitHub, staging, and admin/test environments after review tasks — standard security cleanup requested by client.
- **Stripe webhook** failures on staging (`https://www.t2ms.biz/api/auth/stripe/webhook`) called out separately; stabilization of webhooks is part of launch-critical integration work.

---

## 12. Success criteria for Version 1 launch

Version 1 is successful when customers can:

1. Sign up and complete a **simple onboarding** path (hosted page and/or optional embed).
2. Obtain a **stable hosted announcement URL** on `t2ms.live` (or interim path per rollout).
3. Customize **name, logo, background/colors**, and see **live announcements** update reliably.
4. Share the page via link; optionally send visitors **back to their main website**.
5. Use widgets/embeds if they choose, without that being mandatory.
6. Pay/subscribe including **church intro pricing** where applicable.
7. Rely on **stable Stripe, Twilio, and SendGrid** behavior in production.

---

## 13. Document history

| Date | Event |
|------|--------|
| May 8–9, 2026 | Strategy shift: hosted pages primary; eight milestones proposed; client approval in principle |
| May 11, 2026 | Base44 discovery phase requested and completed |
| May 12, 2026 | Option A vs B comparison; discovery findings shared; simple native page direction confirmed |
| May 13, 2026 | Four-milestone hours submitted; client asks for leaner scope / new vs extend breakdown |
| May 13–14, 2026 | **$16/hr** agreed; **t2ms.live** secured; lean Version 1 build authorized |
| May 24, 2026 | **Architecture clarified:** implement in **`T2MS-mvp`**; `t2ms-hosted/` = docs/reference only |

---

*This document summarizes finalized client–developer agreements from email/thread discussion. If contract milestones differ in naming or hours, the signed contract takes precedence for billing; this file remains the product scope reference for implementation.*
