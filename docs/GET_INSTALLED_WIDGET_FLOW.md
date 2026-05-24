# Get Installed Widget Flow — When Completed

This document describes what happens when a user completes the **Get Widget Installed** flow at `/app/install-request`: which entities are created or updated, and which actions are performed.

---

## 1. Flow Overview

The flow has three main steps:

| Step | User action | Result |
|------|-------------|--------|
| **1. Choose** | Select install option (Standard $9.99 or Restricted $9.99) and continue | — |
| **2. Setup** | Fill in website URLs, platform, install type, access method, access credentials, and SMS consent; submit form | **Entities created/updated** (see below) |
| **3. Pay** | Redirected to Stripe Checkout; pay $9.99 | **Stripe payment**; then **confirm** updates job |

After payment, the app verifies the Stripe session and updates the install job. The user is then redirected to `/app/install-requests` to see their request.

---

## 2. Entities Touched When the Flow Is Completed

### 2.1 Customer (table: `customer`)

- **Purpose:** One record per user who has completed install setup and SMS consent (used for install jobs and compliance).
- **When created:** On first successful **Setup** form submit (POST `/api/install-request/setup`) for that user.
- **When updated:** On every subsequent Setup submit for the same user (SMS consent and onboarding timestamps refreshed).

**Fields set/updated:**

| Field | Description |
|-------|-------------|
| `id` | CUID (created) |
| `userId` | Logged-in user's ID (from session) |
| `smsConsentConfirmedAt` | Set to current time when user submits the exact SMS consent text |
| `onboardingCompletedAt` | Set to current time (install path treated as “onboarding” for this flow) |
| `createdAt` / `updatedAt` | Auto |

---

### 2.2 InstallJob (table: `install_job`)

- **Purpose:** One install request (one or more website URLs, platform, access method, etc.) that can be assigned to a worker.
- **When created:** On successful **Setup** form submit, linked to the Customer above.
- **Initial status:** `PENDING_PAYMENT`.
- **When updated:** After successful Stripe payment, **Confirm** API sets status to `QUEUED`.

**Fields set at creation (from Setup form):**

| Field | Description |
|-------|-------------|
| `id` | CUID |
| `customerId` | ID of the Customer record above |
| `platform` | e.g. WordPress, Wix, Google Sites, etc. |
| `installType` | `"script"` (Standard) or `"iframe"` (Restricted) |
| `websiteUrls` | Array of URLs to install the widget on |
| `preferredPlacement` | Optional (e.g. placement preference) |
| `accessMethod` | `temporary_login` \| `admin_invite` \| `instructions` |
| `accessCredentials` | JSON string: temp login (adminUrl, username, password, expiry), or invite (email, sender), or instructions (steps) |
| `notes` | Optional free text |
| `status` | `PENDING_PAYMENT` |
| `priority` | `0` |
| `checklistCompleted` | `false` |
| `proofUploaded` | `false` |

**Update after payment (Confirm API):**

| Field | New value |
|-------|-----------|
| `status` | `QUEUED` (job is ready for assignment to a worker) |

---

### 2.3 Stripe (external)

- **Checkout Session** is created by **Checkout** API with:
  - `mode: "payment"` (one-time $9.99)
  - `metadata`: `userId`, `type: "install_job_request"`, `installAddonSku` (standard/restricted), `jobId` (InstallJob id)
  - `client_reference_id`: user id
- No **Customer** or **Subscription** records are created in your app DB for this one-time install add-on; only the InstallJob and Customer (and optionally Onboarding) are used in your backend.

---

## 3. Actions Performed (in order)

### 3.1 User submits Setup form (Step 2)

1. **Validation**
   - At least one website URL, platform, install type (`script` or `iframe`), access method.
   - SMS consent checkbox and exact consent text.
   - If access method = Temporary login: admin URL, username, password, expiry.
   - If access method = Admin invite: invite email.
   - If access method = Instructions only: instructions text.

2. **Customer**
   - Find `Customer` by `userId` (session).
   - If none: **create** Customer with `userId`, `smsConsentConfirmedAt`, `onboardingCompletedAt`.
   - If exists: **update** `smsConsentConfirmedAt` and `onboardingCompletedAt`.

3. **InstallJob**
   - **Create** InstallJob with all form data and `status: PENDING_PAYMENT`.
   - Return `{ jobId }` to the client.

4. **Checkout (immediate, same flow)**
   - Client calls **Checkout** API with `jobId` and chosen `installAddonSku`.
   - Server creates Stripe Checkout Session ($9.99 one-time), returns `{ url }`.
   - User is redirected to Stripe to pay.

### 3.2 User completes payment on Stripe

1. Stripe redirects to:  
   `{origin}/app/install-request?session_id={CHECKOUT_SESSION_ID}`

2. Client calls **Confirm** API:  
   `GET /api/install-request/confirm?session_id=...`

3. **Confirm API**
   - Retrieve Stripe Checkout Session by `session_id`.
   - Ensure `payment_status === "paid"`, `metadata.type === "install_job_request"`, and `client_reference_id` matches current user.
   - Read `metadata.jobId`.
   - Find InstallJob with that id and `status === PENDING_PAYMENT` for this user’s Customer.
   - **Update** that InstallJob: `status = QUEUED`.
   - Return `{ success: true }`.

4. **Client**
   - Shows success toast: “Payment complete. Your install request is queued.”
   - Redirects to **`/app/install-requests`**.

---

## 4. Summary Table (when flow is completed)

| Entity / system | Action | When |
|-----------------|--------|------|
| **Customer** | Create or update | On Setup form submit (SMS consent + onboarding timestamps). |
| **InstallJob** | Create | On Setup form submit; status `PENDING_PAYMENT`. |
| **Stripe** | Create Checkout Session | Right after Setup (client calls Checkout API with `jobId`). |
| **Stripe** | User pays | On Stripe-hosted payment page. |
| **InstallJob** | Update | After payment: status `PENDING_PAYMENT` → `QUEUED` (Confirm API). |
| **User** | Redirect | To `/app/install-requests` after successful confirm. |

---

## 5. API Endpoints Used in This Flow

| Endpoint | Method | Role |
|----------|--------|------|
| `/api/install-request/setup` | POST | Validate form; create/update Customer; create InstallJob (`PENDING_PAYMENT`); client then calls checkout. |
| `/api/install-request/checkout` | POST | Create Stripe Checkout Session for install add-on; return redirect URL. |
| `/api/install-request/confirm` | GET | Verify Stripe session; set InstallJob to `QUEUED`. |

---

## 6. Optional: Resuming payment

If the user left after Setup without paying, they can open **Install requests** (`/app/install-requests`), see the job in a “payment pending” state, and click **Complete payment**. That loads the same install-request page with `?jobId=...` and goes straight to the **Pay** step (Checkout). After payment, the same **Confirm** logic runs and the same InstallJob is updated to `QUEUED`; no new Customer or InstallJob is created.

---

*Document applies to the flow at `http://localhost:3000/app/install-request` (and the same path in staging/production).*
