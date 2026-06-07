# DIY Announcement Builder (Base44) — Screenshot Reference

**Live app:** [diy-announcement-builder.base44.app](https://diy-announcement-builder.base44.app)  
**Related discovery:** Ciony’s “DIY Hosted Page / Builder workflow” (see `../../docs/BASE44_DISCOVERY_NOTE.md`, `../../docs/BASE44_DISCOVERY_REPORT.md` in the parent repo)  
**Aligned product doc:** `../../docs/VERSION_1_FINALIZED_BUILD_SCOPE.md`  
**Companion reference:** [SitePilot](./SITEPILOT_SCREENSHOTS.md) (customer update / onboarding UX patterns)

---

## Screenshots captured (May 24, 2026)

These are full-page screencaptures of the **`/generator`** route on the live Base44 app (not the full 4-step wizard PDF walkthrough).

Stored in this project under **`t2ms-hosted/docs/assets/diy-builder/`**:

| Capture time (local) | Reference file |
|----------------------|----------------|
| 14:43:28 | [screencapture … 14_43_28.pdf](./assets/diy-builder/screencapture-diy-announcement-builder-base44-app-generator-2026-05-24-14_43_28.pdf) |
| 14:43:39 | [screencapture … 14_43_39.pdf](./assets/diy-builder/screencapture-diy-announcement-builder-base44-app-generator-2026-05-24-14_43_39.pdf) |
| 14:44:41 | [screencapture … 14_44_41.pdf](./assets/diy-builder/screencapture-diy-announcement-builder-base44-app-generator-2026-05-24-14_44_41.pdf) |

---

## What this app is (from feature / technical spec)

The DIY Announcement Builder on Base44 is a **managed single-page site generator**, not the lean T2MS Version 1 hosted page. It includes:

| Area | Base44 DIY Builder | T2MS Version 1 (finalized) |
|------|--------------------|----------------------------|
| 4-step wizard (template → style → intake → preview) | Yes | **No** — deferred |
| AI HTML generation | Yes | **No** — deferred |
| Industry template catalogs | Yes | **No** — deferred |
| FTP deploy to SiteGround | Yes | **No** — deferred |
| Analytics dashboard | Yes | **No** — deferred |
| `structured_data` + branding fields | Yes | **Reuse concept** — lightweight hosted-page settings |
| `MySiteSettings` (staff pre-config) | Yes | **Reuse concept** — defaults / faster onboarding |
| Preview before publish | Yes | **Reuse concept** — minimal only |
| Widget embed + position | Yes | **Reuse concept** — controlled settings |
| Customer subdomain intent | Yes (`User.subdomain`) | **Reuse concept** — maps to `t2ms.live` slug/subdomain |
| Shareable preview link | Yes | **Reuse concept** — demo/outreach |

The **`/generator`** screen is part of the **generation/build** side of this app (alongside the 4-step customer wizard and admin shell-page flows described in `TEXT2MYSITE - DIY Announcement Builder - Base44.pdf`).

---

## Concepts worth harvesting for T2MS (from this app)

These match what was agreed after discovery — **patterns only**, not porting Base44:

1. **Structured page settings** — business name, headline, logo, colors, contact, widget on/off, widget position (see `Website.structured_data` / `MySiteSettings` in the Base44 spec).
2. **Pre-filled defaults** — staff or system sets initial values so the customer does not start from a blank page.
3. **Simple publish/preview state** — draft vs live, or preview link before go-live (without admin FTP queues).
4. **Subdomain/slug as identity** — customer picks a name; system checks availability and suggests alternatives.
5. **Widget as a setting** — embed script + position, not a full layout builder.

---

## Explicitly not carried into Version 1 from this app

- Full **generator** / AI page builder UX as shown on Base44 `/generator`
- Template picker (restaurant, salon, church, etc.) as a launch requirement
- Multi-language / responsive-fix AI tools
- Admin approval queue + FTP deployment pipeline
- Analytics entity and dashboard

---

## T2MS codebase overlap (why this is “extend,” not “copy”)

The finalized scope assumes building on **existing T2MS** primitives in the parent MVP app:

- Widget/fullscreen/display routes (`../../src/app/widget/`, `../../src/app/display/`)
- Site configuration UI (`../../src/components/app/sites.tsx` — logo, colors, background, widget position, etc.)
- Announcement/message publishing via existing Twilio/update flows

The Base44 `/generator` UI is **inspiration for data shape and flow**, not a target UI to replicate in Version 1.

---

## Next steps (optional)

- [x] PDF screencaptures stored in `t2ms-hosted/docs/assets/diy-builder/`
- [ ] Add short captions per screenshot (what fields/buttons appear on `/generator`) after visual review
- [ ] Map each visible field on `/generator` to a proposed Prisma field for hosted pages

---

*Prepared by Waqas — references client thread and Base44 PDF spec. Screencapture PDFs were image-only; detailed UI labels should be added from manual review of the three files.*
