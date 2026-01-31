# T2MS Phase 2 - Implementation Plan
**Aligned with Requirements Specification**

## Overview
This document outlines the complete implementation approach for Phase 2, covering:
- Paid widget installation system
- Customer onboarding & SMS consent gating
- Philippines worker job queue & assignment
- Installation testing, proof, and completion
- Job-based worker payout tracking
- Multi-user architecture with channel-centric routing
- Scalable architecture (1 → many workers)

**Status:** FINAL – Approved for Implementation  
**Scope Control:** No unapproved features or expansions

---

## Core Principles (Non-Negotiable)

1. **Workers do NOT initiate conversations** - Workers only install widgets, test installations, and reply to inbound messages (when assigned)
2. **Workers are paid per completed job, not hourly** - No job is payable without checklist + proof
3. **System must scale from 1 to 10+ workers** without redesign
4. **Channels — not phone numbers — are the core routing unit** - No customer is ever "hostage" to a single phone number
5. **Message integrity** - Every inbound message belongs to exactly ONE team page/channel at a time

---

## Phase 2 Build Order (Required - No Deviations)

### 1. Install Job Table + Statuses

**Database Schema:**
- Create `InstallJob` model with all required fields
- Create `Worker` model
- Create `Proof` model
- Create `WorkerPayout` model
- Add all job statuses: `QUEUED`, `ASSIGNED`, `IN_PROGRESS`, `BLOCKED_WAITING_CUSTOMER`, `SUBMITTED_FOR_QA`, `NEEDS_FIX`, `COMPLETED`, `CANCELLED`, `HOLD_FINANCE_REVIEW`

**Key Technical Tasks:**
- Add Prisma models for InstallJob, Worker, Proof, WorkerPayout
- Create migration with proper relationships and indexes
- Implement job status enum/constants
- Add database constraints for data integrity

**Acceptance Criteria:**
- ✅ All models created with proper relationships
- ✅ Status transitions are valid
- ✅ Foreign keys enforce integrity

---

### 2. Onboarding + SMS Consent Gate

**Customer Onboarding Flow:**
- Build onboarding form with required fields:
  - Website URL(s)
  - Platform selection
  - Install type (script embed vs iframe)
  - Preferred placement
  - Access method (temporary login, admin invite, instructions only)
  - Notes/constraints

**SMS Consent Confirmation (Hard Gate):**
- Required checkbox + typed confirmation
- Text: "I confirm I have permission to message my contacts using T2MS and understand SMS compliance requirements (TCPA/CTIA)."
- Store `sms_consent_confirmed_at` timestamp
- Block job creation until consent confirmed

**Access Method Validation:**
- Temporary Login: Admin URL, username, password, expiry date/time (required)
- Admin Invite: Email address, invite sender defined
- Instructions Only: Explicit steps required
- Jobs missing required access fields cannot enter queue

**Key Technical Tasks:**
- Create `/app/app/onboarding/page.tsx` component
- Build onboarding form with validation
- Implement SMS consent gate UI
- Create access method conditional forms
- Add validation logic to prevent incomplete jobs
- Store onboarding data in database

**Acceptance Criteria:**
- ✅ Onboarding form captures all required fields
- ✅ SMS consent is required before job creation
- ✅ Access method validation prevents incomplete jobs
- ✅ Onboarding data properly stored

---

### 3. Reminder Email Automation

**Reminder Logic:**
- If install add-on is paid but onboarding incomplete:
  - Send reminder every 24 hours
  - Stop when: onboarding complete, subscription cancelled, customer pauses install
  - Cap reminders (7 daily), then switch to weekly

**Key Technical Tasks:**
- Create email reminder service
- Implement scheduled job/cron for reminders
- Track reminder count per customer
- Add pause/unpause functionality
- Create email templates for reminders
- Integrate with email service (SendGrid/Resend/etc)

**Acceptance Criteria:**
- ✅ Reminders sent every 24 hours for incomplete onboarding
- ✅ Reminders stop when conditions met
- ✅ Reminder cap enforced (7 daily, then weekly)
- ✅ Customer can pause reminders

---

### 4. Job Queue + Claim Logic

**Queue System:**
- Jobs start as `QUEUED` status
- Claim-based assignment (workers manually claim jobs)
- Active job cap: Max 2 active jobs per worker
- Only `ON_SHIFT` workers can claim jobs
- Inactivity safeguard (optional Phase 2.1): If job claimed but no action for X hours → eligible for release

**Key Technical Tasks:**
- Create job queue API endpoints:
  - `GET /api/jobs` - List available jobs (filtered by status, worker)
  - `PATCH /api/jobs/:id/claim` - Worker claims job
  - `GET /api/jobs/:id` - Get job details
- Implement claim validation:
  - Check worker availability (must be ON_SHIFT)
  - Check active job count (max 2)
  - Update job status to ASSIGNED
- Create worker queue UI:
  - Display available jobs
  - Show job details
  - Claim button (disabled if at cap or offline)
  - Active jobs list

**Acceptance Criteria:**
- ✅ Jobs appear in queue when QUEUED
- ✅ Workers can claim jobs when ON_SHIFT
- ✅ Max 2 active jobs enforced per worker
- ✅ Job status updates correctly on claim

---

### 5. Worker Portal (Queue, Claim, Checklist, Proof)

**Worker Dashboard:**
- Job queue view (available jobs)
- Active jobs view (claimed jobs)
- Job detail view with:
  - Job information
  - Access credentials (decrypted for assigned worker only)
  - QA checklist interface
  - Proof upload interface
  - Submit for QA button

**QA Checklist (Required):**
Worker must confirm:
- ✅ Widget loads on desktop
- ✅ Widget loads on mobile
- ✅ Messaging UI opens
- ✅ Test message sends
- ✅ Incoming message reaches correct channel
- ✅ Reply reaches test phone
- ✅ No layout or console errors

**Proof Upload System:**
- Desktop screenshot (required)
- Mobile/responsive screenshot (required)
- Message send + receive proof (required)
- Upload constraints:
  - Max file size: 10MB
  - Types: PNG, JPG, PDF
  - Storage: secure object storage (S3)
  - Retention: 90 days
- System blocks submission if proof missing

**Key Technical Tasks:**
- Create `/app/worker/dashboard/page.tsx`
- Create `/app/worker/jobs/page.tsx` (queue view)
- Create `/app/worker/jobs/[id]/page.tsx` (job detail)
- Build QA checklist component
- Implement proof upload component
- Integrate with S3 for file storage
- Add credential decryption (KMS-managed)
- Create submit for QA API endpoint

**Acceptance Criteria:**
- ✅ Workers can view and claim jobs
- ✅ QA checklist blocks submission if incomplete
- ✅ Proof upload required before submission
- ✅ Credentials only accessible to assigned worker
- ✅ Files stored securely in S3

---

### 6. Completion Validation

**Auto-Completion Rules:**
Job auto-completes only if:
- Checklist complete
- Proof present (all required types)
- Site URL returns HTTP 200
- Widget container detected (basic check)
- Proof timestamps recorded

**QA Workflow:**
- Worker submits → `SUBMITTED_FOR_QA`
- System validates all criteria
- If valid → `COMPLETED`
- If invalid → `NEEDS_FIX` (returns to same worker)

**Key Technical Tasks:**
- Create QA validation service
- Implement site URL health check
- Add widget container detection (basic DOM check)
- Create auto-completion logic
- Build fix workflow (NEEDS_FIX status)
- Add validation logging

**Acceptance Criteria:**
- ✅ Jobs auto-complete only when all criteria met
- ✅ QA validation blocks incomplete jobs
- ✅ NEEDS_FIX status returns job to worker
- ✅ Validation logs recorded

---

### 7. Payout Ledger

**Worker Payout System:**
- Create `worker_payouts` table
- Track payout status: `EARNED`, `APPROVED`, `PAID`
- Link payouts to completed jobs
- Manual payouts acceptable initially; ledger required

**Key Technical Tasks:**
- Create WorkerPayout model in Prisma
- Add payout calculation logic (based on job type)
- Create payout API endpoints:
  - `GET /api/workers/me/payouts` - Get payout history
  - `POST /api/payouts/:id/approve` - Approve payout (admin)
  - `POST /api/payouts/:id/mark-paid` - Mark as paid (admin)
- Build payout ledger UI (admin)
- Create worker earnings summary UI

**Acceptance Criteria:**
- ✅ Payout ledger tracks all completed jobs
- ✅ Payout status transitions correctly
- ✅ Workers can view earnings summary
- ✅ Admins can approve and mark payouts as paid

---

### 8. Multi-User Architecture

**Database Schema:**
- Create `Business` (Workspace) model
- Create `TeamPage` (Channel) model
- Create `Customer` model (separate from Client)
- Create `Thread` model
- Create `ChannelAssignment` model
- Create `ChannelPhoneNumber` model
- Update `Message` model to link to Thread

**Core Entities:**
- **Business**: Owner account, one or more team pages, one or more Twilio numbers
- **TeamPage**: Independent inbox, never shares threads, can have multiple users
- **Customer**: Assigned to one page at a time, assignment persists
- **Thread**: Page-bound, cannot exist without team_page_id
- **Message**: Must have thread_id, team_page_id, customer_id

**Key Technical Tasks:**
- Add Prisma models for all entities
- Create migration with proper relationships
- Add foreign key constraints
- Implement data integrity rules:
  - Messages must have customer_id, team_page_id, thread_id
  - Threads are page-bound
  - Customers assigned to one page at a time
- Add required indexes (see requirements.mdc section 18.2)

**Acceptance Criteria:**
- ✅ All models created with proper relationships
- ✅ Foreign keys enforce integrity
- ✅ No messages exist without required fields
- ✅ Threads are page-bound
- ✅ Customers assigned to one page at a time

---

### 9. Channel Routing System

**Core Principle:**
Channels — not phone numbers — are the system of record.

**Routing Engine:**
- Inbound flow: Customer → Twilio → Webhook → Routing Engine
- Routing Engine must:
  1. Identify business_id
  2. Match or create customer_id
  3. Determine team_page_id:
     - If customer already assigned → reuse page
     - Else → default page OR rule-based page
  4. Attach message to correct team_page_id and thread_id

**Phone Number Pooling:**
- Each channel can have multiple phone numbers
- Phone numbers stored as pool
- Routing uses round-robin or least-recently-used
- If phone number fails → mark as TEMP_UNAVAILABLE, skip until healthy
- No message loss

**Texter Assignment:**
- Texters assigned to channels, not phones
- One texter may belong to multiple channels
- One channel may have many texters
- Availability states: OFFLINE, ONLINE, BUSY
- Routing preference: ONLINE texters, least active texter

**Key Technical Tasks:**
- Create routing service (`/lib/services/message-router.ts`)
- Implement channel-to-texter assignment logic
- Build phone number pooling system
- Add round-robin/least-recently-used logic
- Implement failure handling (TEMP_UNAVAILABLE)
- Create routing logs for debugging
- Update Twilio webhook handler to use routing engine

**Acceptance Criteria:**
- ✅ Messages route to correct channel
- ✅ Phone number pooling works (round-robin/LRU)
- ✅ Multiple texters can be assigned to one channel
- ✅ Multiple phone numbers can be assigned to one channel
- ✅ Phone number failure doesn't break messaging
- ✅ No message loss

---

### 10. Permission System

**Role-Based Access Control:**
- **Owner**: All pages, can reassign/escalate, full billing access
- **Team Member**: Assigned pages only, can reply, no billing
- **Worker**: Assigned pages only, can reply (inbound only), no billing, can install widgets

**Permission Matrix:**
| Role | View Threads | Reply | Reassign | Billing | Install Jobs |
|------|--------------|-------|----------|---------|--------------|
| Owner | All pages | Yes | Yes | Yes | No |
| Team Member | Assigned only | Yes | No | No | No |
| Worker | Assigned only | Yes (inbound only) | No | No | Yes |

**Key Technical Tasks:**
- Create permission middleware
- Implement page/channel filtering in APIs
- Add UI-level access restrictions
- Build permission check utilities
- Create owner/team/worker permission matrix enforcement
- Add channel assignment UI (admin)

**Acceptance Criteria:**
- ✅ Team members see only assigned channels
- ✅ Owner sees all channels
- ✅ Workers can only access assigned channels
- ✅ Permission checks enforced at API and UI level

---

### 11. Message Threading

**Thread System:**
- Threads are page-bound
- A thread cannot exist without team_page_id
- Thread visibility determined only by page assignment
- Thread status: open, closed, escalated

**Thread Creation:**
- Create thread on first message from customer
- Link thread to customer and team_page_id
- All subsequent messages link to same thread

**Thread Reassignment (Owner Only):**
- Owner can move customer/thread to another page
- System must:
  - Close old thread
  - Open new thread on target page
  - Preserve full history

**Key Technical Tasks:**
- Update message creation to create/link threads
- Implement thread grouping logic
- Create thread view in UI
- Build thread reassignment API (owner only)
- Add thread status management
- Create thread list component (filtered by channel)

**Acceptance Criteria:**
- ✅ Threads created on first message
- ✅ Messages grouped by thread
- ✅ Thread reassignment preserves history
- ✅ Thread visibility respects page assignment

---

### 12. Escalation Logic

**Escalation Workflow:**
- Owner can escalate threads
- When escalated:
  - Thread moves to new page
  - Original page no longer sees it
  - Customer continues seamlessly
- Escalation must:
  - Log who escalated
  - Timestamp the action
  - Preserve message history

**Key Technical Tasks:**
- Create escalation API endpoint (owner only)
- Implement thread movement between pages
- Add escalation logging
- Build escalation UI (owner only)
- Ensure history preservation

**Acceptance Criteria:**
- ✅ Owner can escalate threads
- ✅ Escalated threads move to new page
  - Original page no longer sees it
- ✅ Full message history preserved
- ✅ Escalation logged with timestamp and user

---

### 13. Customer Signup + Billing Flow

**Plan + Install Add-On:**
- During signup or immediately after checkout, customer selects:
  - Monthly subscription
  - Optional install add-on
- Install pricing tiers:
  - Standard website install (script embed): $19.99 one-time
  - Restricted platform install (Google Sites / iframe): $39.99 one-time

**Billing Data Model (Stripe-Driven):**
- Store: subscription_id, payment_intent_id, install_addon_sku, install_addon_status (paid | refunded | disputed)
- "Paid" is derived from Stripe state
- On refund or chargeback: Associated job auto-moves to HOLD_FINANCE_REVIEW or CANCELLED

**Confirmation Email:**
- Sent on successful payment
- Receipt + "Complete Setup" CTA linking to onboarding

**Key Technical Tasks:**
- Update signup/checkout flow to include install add-on
- Create Stripe product/SKU for install add-ons
- Implement billing data model
- Create Stripe webhook handlers for refunds/chargebacks
- Build confirmation email template
- Add job status update on payment issues

**Acceptance Criteria:**
- ✅ Install add-on available during signup/checkout
- ✅ Pricing tiers correctly applied
- ✅ Billing status tracked in database
- ✅ Refunds/chargebacks update job status
- ✅ Confirmation email sent on payment

---

### 14. Widget Stabilization

**Fix JS Widget for All Platforms:**
- Create comprehensive cross-platform compatibility test suite
- Identify platform-specific issues
- Implement platform detection and conditional loading
- Add error boundaries and graceful degradation
- Optimize widget initialization

**iFrame Version for Restricted Builders:**
- Create `/app/widget/iframe/page.tsx` endpoint
- Build standalone HTML page that loads widget internally
- Implement postMessage API for communication
- Add responsive sizing and auto-height adjustment

**Performance & Compatibility:**
- Minimize widget bundle size (< 10KB gzipped)
- Implement instant loading with preload hints
- Add mobile-first responsive design
- Eliminate console errors

**Key Technical Tasks:**
- Refactor widget script (namespaced variables)
- Implement lazy loading
- Add CSP compatibility
- Create platform-specific adapters
- Build iframe endpoint
- Optimize bundle size

**Acceptance Criteria:**
- ✅ Widget works on all 6 platforms
- ✅ Both script and iframe embeds functional
- ✅ No console errors
- ✅ Mobile responsive
- ✅ Bundle size < 10KB gzipped

---

### 15. Admin Dashboard Enhancements

**Channel/Team Page Management:**
- Create/edit team pages
- Assign team members to channels
- Add/remove phone numbers from channels
- View channel activity

**Message Management:**
- View all messages (owner) or assigned channels (team)
- Thread view with conversation history
- Reply interface
- Thread reassignment (owner only)
- Escalation (owner only)

**Worker Management:**
- View worker availability
- Assign workers to channels
- View worker job assignments
- Approve payouts

**Key Technical Tasks:**
- Create channel management UI
- Build team member assignment interface
- Add phone number pooling UI
- Create message/thread management interface
- Build worker management dashboard
- Add payout approval interface

**Acceptance Criteria:**
- ✅ Owner can manage channels
- ✅ Team members can be assigned to channels
- ✅ Phone numbers can be added to channels
- ✅ Message/thread management works
- ✅ Worker management functional

---

### 16. Security Requirements

**Credential Encryption:**
- Credentials encrypted at rest using KMS-managed encryption
- Only assigned worker + admins can decrypt
- Passwords masked after initial entry

**API Security:**
- No Stripe or Twilio master keys exposed to workers
- Rate limiting on all endpoints
- Input validation on all user inputs
- CORS properly configured

**Key Technical Tasks:**
- Implement credential encryption (KMS)
- Add decryption logic (worker/admin only)
- Mask passwords in UI
- Add rate limiting middleware
- Implement input validation
- Configure CORS properly

**Acceptance Criteria:**
- ✅ Credentials encrypted at rest
- ✅ Only authorized users can decrypt
- ✅ Passwords masked in UI
- ✅ Rate limiting active
- ✅ Input validation enforced

---

### 17. Multi-Platform Testing

**Platform Testing Checklist:**
- WordPress (various themes)
- Wix
- Shopify (various themes)
- Squarespace
- Google Sites (iframe)
- ClickFunnels

**Testing Areas:**
- Widget loading and display
- Message delivery
- Mobile responsiveness
- Console errors
- Performance
- Cross-browser compatibility

**Device Testing:**
- Desktop (Chrome, Firefox, Safari, Edge)
- Mobile (iOS Safari, Android Chrome)
- Tablet (iPad, Android tablets)

**Key Technical Tasks:**
- Create test checklist
- Test on all platforms
- Document platform-specific issues
- Fix any compatibility issues
- Create platform-specific installation guides

**Acceptance Criteria:**
- ✅ Widget works on all platforms
- ✅ No console errors
- ✅ Mobile responsive
- ✅ Cross-browser compatible
- ✅ Installation guides created

---

### 18. Documentation & Deliverables

**Loom Videos:**
1. Widget installation (all platforms)
2. Customer onboarding walkthrough
3. Worker dashboard walkthrough
4. Admin channel management
5. Message routing setup
6. Troubleshooting common issues

**Install Instructions:**
- Platform-specific installation guides
- Troubleshooting guide
- FAQ document
- API documentation

**Worker Panel Instructions:**
- Worker login process
- Job queue management
- QA checklist completion
- Proof upload process
- Earnings tracking

**Developer Handoff Notes:**
- Architecture overview
- Database schema
- API documentation
- Environment setup
- Deployment process
- Known issues and limitations

**Key Technical Tasks:**
- Create all documentation
- Record Loom videos
- Write installation guides
- Document API endpoints
- Create troubleshooting guides

**Acceptance Criteria:**
- ✅ All documentation complete
- ✅ Loom videos recorded
- ✅ Installation guides written
- ✅ API documentation complete

---

## Implementation Priority (Aligned with Build Order)

### Phase 2A (Critical - Weeks 1-4)
1. Install Job table + statuses
2. Onboarding + SMS consent gate
3. Reminder automation
4. Job queue + claim logic

### Phase 2B (High Priority - Weeks 5-8)
5. Worker portal (queue, claim, checklist, proof)
6. Completion validation
7. Payout ledger
8. Multi-User Architecture

### Phase 2C (Medium Priority - Weeks 9-12)
9. Channel Routing System
10. Permission System
11. Message Threading
12. Escalation Logic

### Phase 2D (Integration - Weeks 13-14)
13. Customer Signup + Billing Flow
14. Widget Stabilization
15. Admin Dashboard Enhancements

### Phase 2E (Final - Weeks 15-16)
16. Security Requirements
17. Multi-Platform Testing
18. Documentation & Deliverables

---

## Success Criteria

### Worker System
- ✅ Workers can claim jobs from queue
- ✅ Workers can only claim when ON_SHIFT
- ✅ Max 2 active jobs per worker enforced
- ✅ QA checklist blocks submission if incomplete
- ✅ Proof upload required before submission
- ✅ Jobs auto-complete only when all criteria met
- ✅ Payout ledger tracks all completed jobs

### Multi-User Architecture
- ✅ Two team members cannot see each other's threads
- ✅ Owner can see all threads
- ✅ One customer cannot appear in two pages simultaneously
- ✅ Message routing remains stable across refresh/logout/login/multiple workers
- ✅ Reassignment preserves history without duplication

### Channel Routing
- ✅ A channel supports multiple texters
- ✅ A channel supports multiple phone numbers
- ✅ Messages route to available texters
- ✅ Replies send from pooled numbers
- ✅ No site depends on a single phone
- ✅ Failure of a phone or texter does not break messaging

### Data Integrity
- ✅ All messages have required foreign keys
- ✅ No messages exist without team_page_id
- ✅ Threads are page-bound
- ✅ Customers assigned to one page at a time
- ✅ Database constraints enforce integrity

### Security
- ✅ Credentials encrypted at rest
- ✅ Workers cannot access billing/Stripe
- ✅ Only assigned workers can decrypt job credentials
- ✅ No master keys exposed to workers

### Widget & Installation
- ✅ Widget works flawlessly on all 6 platforms
- ✅ Both script and iframe embeds functional
- ✅ Paid installation system works end-to-end
- ✅ Onboarding flow complete with SMS consent gate
- ✅ Reminder automation functional

---

## Explicit Phase 2 Exclusions

**Phase 2 does NOT include:**
- ❌ Automated website creation workflows
- ❌ Google Sites template generation
- ❌ Branding, page design, or hosting logic
- ❌ Sales or outbound texting tools
- ❌ Cross-page shared inbox
- ❌ Auto keyword routing beyond default
- ❌ AI reply generation
- ❌ CRM-style reassignment rules
- ❌ Full audit analytics dashboards
- ❌ Manual phone-to-texter binding
- ❌ One-phone-per-site architecture
- ❌ Outbound campaign texting by workers
- ❌ Texters choosing phone numbers manually

**These are separate future modules.**

---

## Database Schema Summary

### New Models Required:
- `InstallJob` - Job tracking with status, credentials, checklist, proof
- `Worker` - Worker profile with availability, max active jobs
- `WorkerPayout` - Payout tracking (EARNED, APPROVED, PAID)
- `Proof` - Proof uploads (desktop, mobile, message screenshots)
- `Business` - Workspace/owner account
- `TeamPage` - Channel/routing destination
- `Customer` - Customer with team page assignment
- `Thread` - Conversation thread (page-bound)
- `ChannelAssignment` - User-to-channel assignments
- `ChannelPhoneNumber` - Phone number pooling per channel

### Updated Models:
- `Message` - Add thread_id, direction, delivery_status
- `User` - Add worker role support
- `Client` - Keep for backward compatibility (widget config)

See `requirements.mdc` section 18 for complete schema definitions.

---

## API Endpoints Summary

### Install Job Endpoints
- `POST /api/jobs` - Create install job
- `GET /api/jobs` - List jobs (filtered by worker/status)
- `GET /api/jobs/:id` - Get job details
- `PATCH /api/jobs/:id/claim` - Worker claims job
- `PATCH /api/jobs/:id/status` - Update job status
- `POST /api/jobs/:id/checklist` - Submit checklist
- `POST /api/jobs/:id/proof` - Upload proof
- `POST /api/jobs/:id/submit` - Submit for QA

### Worker Endpoints
- `GET /api/workers/me` - Get current worker profile
- `PATCH /api/workers/me/availability` - Update availability
- `GET /api/workers/me/jobs` - Get assigned jobs
- `GET /api/workers/me/payouts` - Get payout history

### Channel/Team Page Endpoints
- `GET /api/channels` - List channels (filtered by user)
- `POST /api/channels` - Create channel (owner only)
- `GET /api/channels/:id` - Get channel details
- `POST /api/channels/:id/assign` - Assign user to channel
- `DELETE /api/channels/:id/assign/:userId` - Remove user from channel
- `POST /api/channels/:id/phone-numbers` - Add phone number to channel
- `DELETE /api/channels/:id/phone-numbers/:phoneId` - Remove phone number

### Thread Endpoints
- `GET /api/threads` - List threads (filtered by channel)
- `GET /api/threads/:id` - Get thread with messages
- `POST /api/threads/:id/messages` - Send reply
- `PATCH /api/threads/:id/reassign` - Reassign thread (owner only)
- `PATCH /api/threads/:id/escalate` - Escalate thread (owner only)

### Message Endpoints
- `POST /api/messages/inbound` - Twilio webhook (inbound SMS)
- `POST /api/messages/status` - Twilio status webhook
- `GET /api/messages` - List messages (filtered by thread/channel)

See `requirements.mdc` section 19 for complete endpoint specifications.

---

## Notes

- This plan follows the exact build order specified in the requirements
- All features must align with `requirements.mdc`
- Any deviations require written approval
- Channel and Team Page are equivalent terms
- Routing is channel-centric, not phone- or user-centric
- Workers are restricted users and must respect page isolation

---

**End of Implementation Plan**
