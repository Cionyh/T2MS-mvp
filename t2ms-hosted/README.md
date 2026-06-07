# t2ms-hosted

**Documentation and reference only** — not the Version 1 production application.

Client-agreed Version 1 (hosted announcement pages on `t2ms.live`) is implemented by **extending the parent app** in [`T2MS-mvp`](../) (widget/display, `Client`, onboarding, Stripe, Twilio). See [`docs/VERSION_1_FINALIZED_BUILD_SCOPE.md`](../docs/VERSION_1_FINALIZED_BUILD_SCOPE.md) — especially **Section 2: Architecture decision**.

## What lives here

| Path | Purpose |
|------|---------|
| [`docs/`](./docs/) | Base44 reference screenshots (DIY Builder, SitePilot) and reuse notes |
| [`docs/assets/`](./docs/assets/) | Captured UI from inspiration apps |
| `src/`, `prisma/` | Scaffold from initial setup — **do not use for V1 launch** unless architecture changes |

## Reference docs

- [DIY Announcement Builder screenshots](./docs/DIY_ANNOUNCEMENT_BUILDER_SCREENSHOTS.md)
- [SitePilot screenshots](./docs/SITEPILOT_SCREENSHOTS.md)

## Parent app development

```bash
cd ..   # T2MS-mvp root
npm run dev
```
