# T2MS Project Setup Guide

This guide will help you set up and run the T2MS (Text2MySite) project locally.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
- **npm** or **yarn** package manager
- **Git** (for cloning the repository)

## Step 1: Clone the Repository

If you haven't already, clone the repository:

```bash
git clone <repository-url>
cd T2MS-mvp
```

## Step 2: Install Dependencies

Install all project dependencies:

```bash
npm install
```

This will automatically:
- Install all npm packages
- Generate Prisma client (`prisma generate`)
- Run database migrations (`prisma migrate deploy`)

## Step 3: Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env  # If you have an example file
# OR
touch .env
```

Add the following environment variables to your `.env` file:

### Required Environment Variables

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/t2ms_db?schema=public"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-change-this-in-production"
BETTER_AUTH_URL="http://localhost:3000"

# Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Widget API URL (used in embed script - defaults to https://www.t2ms.biz if not set)
NEXT_PUBLIC_WIDGET_API_URL="https://www.t2ms.biz"

# Twilio Configuration
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"
# Optional: inbound affiliate SMS number (E.164). When set, SMS to this number is stored separately and never tied to a client. Point this number’s Messaging webhook to the same URL as production: `https://<your-app>/api/twilio`.
TWILIO_AFFILIATE_PHONE_NUMBER="+14244978398"
TWILIO_VERIFY_SERVICE_SID="your-twilio-verify-service-sid"

# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_your-stripe-secret-key"
STRIPE_WEBHOOK_SECRET="whsec_your-webhook-secret"
STRIPE_STARTER_PRICE_ID="price_your-starter-price-id"
STRIPE_PRO_PRICE_ID="price_1Szn8i1ZWEwBpolW1fMI9TQA"   # Standard subscription (product prod_TxiZhc5CBJxTwO)
STRIPE_ENTERPRISE_PRICE_ID="price_your-enterprise-price-id"
# Church / hosted-page plan (optional) — set BOTH so onboarding UI can show the plan in the browser:
STRIPE_CHURCH_STARTER_PRICE_ID="price_your-church-price-id"
NEXT_PUBLIC_STRIPE_CHURCH_STARTER_PRICE_ID="price_your-church-price-id"
NEXT_PUBLIC_CHURCH_INTRO_PRICE_LABEL="$7.99"
# Optional: auto-verify church attestation at signup (skip admin approval). Default: admin must approve.
CHURCH_INTRO_AUTO_VERIFY="false"

# PostHog Analytics (Optional)
NEXT_PUBLIC_POSTHOG_KEY="your-posthog-key"
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"

# SendGrid (optional – used for organization invitation emails)
SENDGRID_API_KEY="your-sendgrid-api-key"
SENDGRID_FROM_EMAIL="noreply@yourdomain.com"
SENDGRID_FROM_NAME="T2MS"
```

### Environment Variable Details

#### Database
- **DATABASE_URL**: PostgreSQL connection string
  - Format: `postgresql://username:password@host:port/database?schema=public`
  - Example: `postgresql://postgres:password@localhost:5432/t2ms_db?schema=public`

#### Better Auth
- **BETTER_AUTH_SECRET**: Secret key for authentication (generate a random string)
  - You can generate one with: `openssl rand -base64 32`
- **BETTER_AUTH_URL**: Base URL of your application
- **NEXT_PUBLIC_APP_URL**: Public URL of your application
- **NEXT_PUBLIC_WIDGET_API_URL**: Base URL for the widget embed script (used in `src` and `data-api` attributes). Defaults to `https://www.t2ms.biz` if not set.

#### Twilio
- **TWILIO_ACCOUNT_SID**: Your Twilio Account SID (from Twilio Console)
- **TWILIO_AUTH_TOKEN**: Your Twilio Auth Token (from Twilio Console)
- **TWILIO_PHONE_NUMBER**: Your Twilio phone number (format: +1234567890)
- **TWILIO_AFFILIATE_PHONE_NUMBER** (optional): A second Twilio number used only for affiliate/partner inbound SMS. Must match the number’s E.164 value in Twilio (e.g. `+14244978398`). Configure that number’s **Messaging** webhook URL to the same path as your main line: `{NEXT_PUBLIC_APP_URL}/api/twilio`. Inbound texts to this number are saved to `affiliate_inbound_sms` and shown under **Admin → Affiliate SMS**; they are not routed to customer sites.
- **TWILIO_VERIFY_SERVICE_SID**: Twilio Verify Service SID (for OTP)

**Inbound SMS webhook URL (critical):** In the Twilio Console, set **A message comes in** to the **exact** public URL your app serves — typically **`https://www.text2mysite.com/api/twilio`** (HTTPS, same host as production, no redirect). Do **not** use `http://` or the bare apex (`text2mysite.com`) if your host redirects to `https://www...`: Twilio’s POST can be turned into a redirect response, and you may get HTML (e.g. the marketing homepage) instead of TwiML, so messages are not stored.

**Twilio warning 12200 (invalid XML):** Usually means Twilio received **HTML** (wrong URL / redirect) or a **JSON** error body. The app responds with valid TwiML for `/api/twilio`; use the canonical **`https://www.../api/twilio`** URL in Twilio and redeploy so error paths also return empty `<Response/>` instead of JSON.

#### Stripe
- **STRIPE_SECRET_KEY**: Your Stripe secret key (starts with `sk_test_` for test mode)
- **STRIPE_WEBHOOK_SECRET**: Webhook secret from Stripe dashboard
- **STRIPE_STARTER_PRICE_ID**: Stripe Price ID for Starter plan (Early Bird)
- **STRIPE_PRO_PRICE_ID**: Stripe Price ID for Pro plan (Standard subscription). Product ID: `prod_TxiZhc5CBJxTwO` — use the recurring price ID from this product.
- **STRIPE_ENTERPRISE_PRICE_ID**: Stripe Price ID for Enterprise plan

#### PostHog (Optional)
- **NEXT_PUBLIC_POSTHOG_KEY**: PostHog project API key
- **NEXT_PUBLIC_POSTHOG_HOST**: PostHog host URL

#### SendGrid (Optional)
- **SENDGRID_API_KEY**: SendGrid API key (Mail Send permission). If not set, invitation emails are skipped (logged only).
- **SENDGRID_FROM_EMAIL**: Sender email (must be verified in SendGrid). Defaults to `noreply@t2ms.biz`.
- **SENDGRID_FROM_NAME**: Sender display name. Defaults to `T2MS`.

## Step 4: Set Up PostgreSQL Database

1. **Create a PostgreSQL database:**

```bash
# Using psql
psql -U postgres
CREATE DATABASE t2ms_db;
\q
```

Or using a GUI tool like pgAdmin or DBeaver.

2. **Update your DATABASE_URL** in `.env` with the correct credentials.

## Step 5: Run Database Migrations

The migrations should run automatically during `npm install` (via the `postinstall` script), but if you need to run them manually:

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# OR for development (creates migration files)
npx prisma migrate dev
```

## Step 6: Start the Development Server

Run the development server:

```bash
npm run dev
```

The application will be available at:
- **Local**: http://localhost:3000
- **Network**: Check the terminal output for the network URL

The dev server uses Turbopack for faster builds.

## Step 7: Access the Application

- **Main Application**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin
- **Sign In**: http://localhost:3000/sign-in
- **Widget Endpoint**: http://localhost:3000/widget

## Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack

# Production
npm run build        # Runs prisma migrate deploy, prisma generate, then next build
npm start            # Start production server

# Database
npx prisma studio    # Open Prisma Studio (database GUI)
npx prisma migrate   # Run database migrations
npx prisma generate  # Generate Prisma Client
```

## Troubleshooting

### Prisma `P2021` — table does not exist (e.g. `affiliate_inbound_sms`)

Production must apply migrations after deploy. The **`npm run build`** script runs **`prisma migrate deploy`** so Railway (and similar) create new tables on each deploy when `DATABASE_URL` is available at build time.

If you deployed before that change or build runs without DB access, run once against production:

```bash
npx prisma migrate deploy
```

(use the same `DATABASE_URL` as production, e.g. Railway shell or `railway run npx prisma migrate deploy`).

### Database Connection Issues

**Error: Can't reach database server**

1. Ensure PostgreSQL is running:
   ```bash
   # macOS
   brew services start postgresql
   
   # Linux
   sudo systemctl start postgresql
   
   # Windows
   # Start PostgreSQL service from Services
   ```

2. Verify your DATABASE_URL is correct
3. Check if the database exists:
   ```bash
   psql -U postgres -l
   ```

### Prisma Issues

**Error: Prisma Client not generated**

```bash
npx prisma generate
```

**Error: Migration issues**

```bash
# Reset database (WARNING: This deletes all data)
npx prisma migrate reset

# Or create a new migration
npx prisma migrate dev --name your_migration_name
```

### Port Already in Use

If port 3000 is already in use:

```bash
# Kill the process using port 3000
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Environment Variables Not Loading

1. Ensure `.env` file is in the root directory
2. Restart the development server after changing `.env`
3. Check for typos in variable names
4. Ensure no spaces around `=` in `.env` file

### Twilio/Stripe Errors

- Verify all API keys are correct
- Check if you're using test/live mode keys consistently
- Ensure webhook URLs are configured correctly in Twilio/Stripe dashboards

## Development Workflow

1. **Make changes** to the code
2. **The dev server** will automatically reload (Hot Module Replacement)
3. **Check the browser console** for any errors
4. **Use Prisma Studio** to view/manage database data:
   ```bash
   npx prisma studio
   ```

## Project Structure

```
T2MS-mvp/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── (auth)/       # Authentication routes
│   │   ├── admin/        # Admin dashboard
│   │   ├── api/          # API routes
│   │   └── widget/       # Widget endpoint
│   ├── components/       # React components
│   │   ├── admin/        # Admin components
│   │   ├── app/          # App components
│   │   ├── auth/         # Auth components
│   │   └── ui/           # UI components
│   └── lib/              # Utilities and helpers
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
├── public/               # Static assets
└── package.json          # Dependencies and scripts
```

## Next Steps

1. **Create an account** at http://localhost:3000/sign-in
2. **Set up a client/site** in the dashboard
3. **Add a phone number** and verify it
4. **Get the embed code** and test the widget
5. **Send a test SMS** to your Twilio number

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Twilio Documentation](https://www.twilio.com/docs)
- [Stripe Documentation](https://stripe.com/docs)

## Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Review the error messages in the terminal/browser console
3. Check the project's issue tracker (if available)
4. Review the Phase 2 documentation files for architecture details

## Resolving failed migrations (P3009)

If the build fails with **P3009** (“migrate found failed migrations in the target database”) or the app returns 500 with “column `install_job.clientId` does not exist”:

**One-time fix (run against your production database):**

```bash
# From your machine with DATABASE_URL set to production (e.g. in .env or export)
npm run db:fix-production-migrations
```

This will:
1. Mark the failed migration `20260130100000_add_install_job_system` as **applied** (so Prisma stops blocking).
2. Run **migrate deploy** to apply pending migrations (e.g. add `install_job.clientId`).

**Where to run it:**
- **Locally:** Ensure `.env` has your production `DATABASE_URL`, then run the command. If you get a TLS/SSL error, try running from your deployment platform (e.g. Railway shell) or add `?sslmode=require` to the URL if your provider supports it.
- **Railway:** Use the project’s shell (e.g. “Run a command” or one-off job) with `DATABASE_URL` available, and run `npm run db:fix-production-migrations`.

After it succeeds, redeploy the app so the new schema is in use.

## Production Deployment

For production deployment:

1. Set all environment variables in your hosting platform
2. Run `npm run build` to create an optimized build
3. Use `npm start` to run the production server
4. Ensure PostgreSQL database is accessible
5. Configure webhooks in Twilio and Stripe for production URLs
6. Set up proper domain and SSL certificates

---

**Note**: This is a development setup. For production, ensure you:
- Use strong, unique secrets
- Set up proper database backups
- Configure production Stripe/Twilio accounts
- Set up monitoring and error tracking
- Configure proper CORS and security headers



