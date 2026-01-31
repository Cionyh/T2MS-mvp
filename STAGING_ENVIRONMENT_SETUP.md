# Staging Environment Setup Guide

## Overview

This document provides step-by-step instructions for setting up a staging environment for Text2MySite™ (T2MS) on Railway.com. The staging environment will be accessible via a subdomain and will serve as a testing environment before deploying changes to production.

---

## Prerequisites

- Railway account with production environment already set up
- Access to DNS provider (if using custom subdomain)
- Stripe test mode account credentials
- Twilio test credentials (optional, for SMS testing)

---

## Step 1: Create Staging Environment on Railway

### 1.1 Create New Environment

1. Log in to your Railway dashboard
2. Navigate to your T2MS project
3. Click on **Settings** → **Environments**
4. Click **"New Environment"**
5. Name it `staging`
6. Choose to **fork from production** environment (this copies all environment variables)
7. Click **"Create Environment"**

### 1.2 Set Up Staging Database

1. In the `staging` environment, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway will automatically create a new PostgreSQL database
4. The `DATABASE_URL` environment variable will be automatically set

**Note:** The staging database is completely separate from production, ensuring safe testing.

---

## Step 2: Configure Deployment Settings

### 2.1 Configure Branch Deployment (Recommended)

1. Go to **Settings** → **Environments** → `staging`
2. Under **Deployment**, configure:
   - **Branch**: `staging` or `develop` (create this branch if it doesn't exist)
   - **Auto Deploy**: Enable to automatically deploy on push

**Alternative:** Deploy from the same branch as production if you want staging to mirror production code.

### 2.2 Create Staging Branch (Optional)

If you want separate branches:

```bash
# Create and switch to staging branch
git checkout -b staging

# Push to remote
git push -u origin staging
```

---

## Step 3: Configure Domain/Subdomain

### Option A: Use Railway Generated Domain (Quick Setup)

1. Railway automatically provides a domain like `staging-production-xxxx.up.railway.app`
2. This works immediately without DNS configuration
3. You can use this for testing right away

### Option B: Use Custom Subdomain (Recommended for Production-like Testing)

1. In Railway, go to your staging service → **Settings** → **Networking**
2. Click **"Custom Domain"** or **"Generate Domain"**
3. Enter your subdomain: `staging.yourdomain.com`
4. Railway will provide you with a CNAME record value
5. Go to your DNS provider (e.g., Cloudflare, Namecheap, GoDaddy)
6. Add a CNAME record:
   ```
   Type: CNAME
   Name: staging
   Value: <the value Railway provides>
   TTL: Auto or 3600
   ```
7. Wait for DNS propagation (usually 5-15 minutes)
8. Railway will automatically provision SSL certificate

---

## Step 4: Configure Environment Variables

Update the following environment variables in your staging environment:

### 4.1 Application URLs

| Variable | Production Value | Staging Value |
|----------|-----------------|---------------|
| `BETTER_AUTH_URL` | `https://yourdomain.com` | `https://staging.yourdomain.com` |
| `NEXT_PUBLIC_APP_URL` | `https://yourdomain.com` | `https://staging.yourdomain.com` |

**How to update:**
1. Go to **Settings** → **Environments** → `staging` → **Variables**
2. Find each variable and click **Edit**
3. Update the value
4. Save changes

### 4.2 Stripe Configuration (Test Mode)

For staging, use Stripe **test mode** credentials:

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `STRIPE_SECRET_KEY` | Test secret key | Stripe Dashboard → Developers → API keys → Test mode → Secret key (starts with `sk_test_`) |
| `STRIPE_PUBLISHABLE_KEY` | Test publishable key | Stripe Dashboard → Developers → API keys → Test mode → Publishable key (starts with `pk_test_`) |
| `STRIPE_WEBHOOK_SECRET` | Test webhook secret | See Step 4.3 below |

**Important:** Never use production Stripe keys in staging environment.

### 4.3 Configure Stripe Webhooks for Staging

1. Log in to Stripe Dashboard
2. Go to **Developers** → **Webhooks**
3. Click **"Add endpoint"**
4. Enter endpoint URL: `https://staging.yourdomain.com/api/webhooks/stripe`
5. Select events to listen to (same as production)
6. Click **"Add endpoint"**
7. Copy the **Signing secret** (starts with `whsec_`)
8. Add this as `STRIPE_WEBHOOK_SECRET` in Railway staging environment variables

### 4.4 Twilio Configuration (Optional)

For SMS testing in staging:

| Variable | Description | Recommendation |
|----------|-------------|---------------|
| `TWILIO_ACCOUNT_SID` | Twilio Account SID | Use test credentials or separate test account |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token | Use test credentials or separate test account |
| `TWILIO_PHONE_NUMBER` | Twilio Phone Number | Consider getting a separate test number |
| `TWILIO_VERIFY_SERVICE_SID` | Twilio Verify Service SID | Use test service or separate service |

**Note:** Update Twilio webhook URLs to point to staging endpoints:
- SMS Webhook: `https://staging.yourdomain.com/api/twilio/webhook`

### 4.5 PostHog Configuration (Optional)

If using PostHog for analytics:

| Variable | Description | Recommendation |
|----------|-------------|---------------|
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog Project Key | Use separate PostHog project for staging |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog Host | Same as production or separate instance |

### 4.6 Database Configuration

The `DATABASE_URL` is automatically set by Railway when you create the PostgreSQL database. Verify it's present in your environment variables.

### 4.7 Other Environment Variables

Review and update these if they contain URLs or environment-specific values:

- `BETTER_AUTH_SECRET` - Generate a new secret for staging (can be different from production)
- Any other API keys or secrets that should differ between environments

---

## Step 5: Database Migration

The staging database will be automatically migrated when Railway deploys:

1. Railway runs `npm install` (or `yarn install`)
2. The `postinstall` script runs: `prisma generate && prisma migrate deploy`
3. This ensures your staging database schema matches your code

**Manual Migration (if needed):**

If you need to manually run migrations:

```bash
# Connect to Railway CLI
railway link

# Run migrations
railway run npx prisma migrate deploy
```

---

## Step 6: Deploy Staging Environment

### 6.1 Initial Deployment

1. Railway will automatically deploy when you:
   - Create the environment (if auto-deploy is enabled)
   - Push to the configured branch
   - Manually trigger deployment

2. Monitor the deployment:
   - Go to **Deployments** tab in Railway
   - Watch the build logs for any errors
   - Verify deployment completes successfully

### 6.2 Verify Deployment

After deployment, check:

- [ ] Application loads at staging URL
- [ ] No build errors in Railway logs
- [ ] Database connection successful
- [ ] Environment variables are correctly set

---

## Step 7: Post-Deployment Verification

### 7.1 Application Functionality

Test the following features:

- [ ] **Authentication**: Sign up, sign in, sign out
- [ ] **Dashboard**: Loads correctly
- [ ] **Client Management**: Create, edit, delete clients
- [ ] **Phone Verification**: OTP verification works (if using Twilio)
- [ ] **Widget**: Widget loads and displays correctly
- [ ] **Messages**: Send test messages and verify they appear
- [ ] **Billing**: Stripe test mode checkout works
- [ ] **Admin Dashboard**: Admin features work correctly

### 7.2 Integration Testing

- [ ] **Stripe Webhooks**: Test subscription creation/updates
- [ ] **Twilio Webhooks**: Test SMS receiving (if configured)
- [ ] **Database**: Verify data is stored correctly
- [ ] **API Endpoints**: Test critical API endpoints

### 7.3 Environment-Specific Checks

- [ ] URLs point to staging domain (not production)
- [ ] Stripe is in test mode (use test card numbers)
- [ ] No production data is accessible
- [ ] Logs show staging environment indicators

---

## Step 8: Ongoing Workflow

### 8.1 Development Workflow

**Recommended workflow:**

1. **Development**: Work on feature branches
2. **Staging**: Merge to `staging` branch → auto-deploys to staging
3. **Testing**: Test thoroughly in staging environment
4. **Production**: Merge to `main` branch → auto-deploys to production

### 8.2 Branch Strategy

```
main (production)
  └── staging (staging environment)
      └── feature/your-feature (development)
```

### 8.3 Deployment Process

1. **Feature Development**:
   ```bash
   git checkout -b feature/new-feature
   # Make changes
   git commit -m "Add new feature"
   git push origin feature/new-feature
   ```

2. **Deploy to Staging**:
   ```bash
   git checkout staging
   git merge feature/new-feature
   git push origin staging
   # Railway auto-deploys to staging
   ```

3. **Test in Staging**:
   - Verify all functionality works
   - Test edge cases
   - Check for regressions

4. **Deploy to Production**:
   ```bash
   git checkout main
   git merge staging
   git push origin main
   # Railway auto-deploys to production
   ```

---

## Step 9: Environment Comparison Checklist

Use this checklist to ensure staging mirrors production setup:

### Infrastructure
- [ ] Separate PostgreSQL database
- [ ] Same Node.js version
- [ ] Same build configuration
- [ ] Same deployment settings

### Environment Variables
- [ ] All required variables are set
- [ ] URLs point to staging domain
- [ ] API keys are test/development keys
- [ ] Secrets are different from production

### Integrations
- [ ] Stripe test mode configured
- [ ] Stripe webhooks configured
- [ ] Twilio test credentials (if applicable)
- [ ] PostHog separate project (if applicable)

### Domain & SSL
- [ ] Subdomain configured
- [ ] DNS records set correctly
- [ ] SSL certificate provisioned
- [ ] Domain resolves correctly

---

## Troubleshooting

### Issue: Staging environment not deploying

**Solution:**
- Check Railway deployment logs
- Verify branch is configured correctly
- Ensure `package.json` scripts are correct
- Check for build errors

### Issue: Database connection errors

**Solution:**
- Verify `DATABASE_URL` is set in environment variables
- Check database is running in Railway
- Verify database credentials are correct

### Issue: Domain not resolving

**Solution:**
- Check DNS propagation: `dig staging.yourdomain.com`
- Verify CNAME record is correct
- Wait for DNS propagation (can take up to 48 hours, usually 5-15 minutes)
- Check Railway custom domain settings

### Issue: SSL certificate not provisioning

**Solution:**
- Ensure DNS is correctly configured
- Wait for DNS propagation
- Check Railway SSL settings
- Contact Railway support if issue persists

### Issue: Environment variables not updating

**Solution:**
- Verify you're editing the correct environment
- Redeploy after changing environment variables
- Check for typos in variable names
- Ensure no conflicting variables exist

---

## Best Practices

### 1. Keep Environments in Sync

- Regularly sync environment variables between staging and production
- Keep database schemas in sync (via migrations)
- Document any environment-specific differences

### 2. Test Before Production

- Always test changes in staging before deploying to production
- Use staging for user acceptance testing (UAT)
- Test database migrations in staging first

### 3. Monitor Staging

- Set up monitoring/alerts for staging (if applicable)
- Review staging logs regularly
- Monitor staging database performance

### 4. Data Management

- Use test data in staging (not production data)
- Regularly reset staging database if needed
- Keep staging data separate from production

### 5. Security

- Never use production API keys in staging
- Use test mode for payment providers
- Keep staging credentials secure
- Don't expose staging URLs publicly if not needed

---

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |
| `BETTER_AUTH_URL` | Application URL for auth | `https://staging.yourdomain.com` |
| `BETTER_AUTH_SECRET` | Auth secret key | `your-secret-key` |
| `NEXT_PUBLIC_APP_URL` | Public application URL | `https://staging.yourdomain.com` |

### Stripe Variables (Test Mode)

| Variable | Description | Example |
|----------|-------------|---------|
| `STRIPE_SECRET_KEY` | Stripe test secret key | `sk_test_...` |
| `STRIPE_PUBLISHABLE_KEY` | Stripe test publishable key | `pk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | `whsec_...` |

### Twilio Variables (Optional)

| Variable | Description | Example |
|----------|-------------|---------|
| `TWILIO_ACCOUNT_SID` | Twilio Account SID | `AC...` |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token | `...` |
| `TWILIO_PHONE_NUMBER` | Twilio Phone Number | `+1234567890` |
| `TWILIO_VERIFY_SERVICE_SID` | Twilio Verify Service SID | `VA...` |

### PostHog Variables (Optional)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog project key | `phc_...` |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog host | `https://app.posthog.com` |

---

## Quick Reference Commands

### Railway CLI Commands

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login

# Link to project
railway link

# View logs
railway logs

# Run command in Railway environment
railway run <command>

# Open Railway dashboard
railway open
```

### Git Commands

```bash
# Create staging branch
git checkout -b staging

# Deploy to staging
git checkout staging
git merge feature/your-feature
git push origin staging

# Deploy to production
git checkout main
git merge staging
git push origin main
```

---

## Support & Resources

- **Railway Documentation**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **Stripe Test Mode**: https://stripe.com/docs/testing
- **Twilio Test Credentials**: https://www.twilio.com/docs/iam/test-credentials

---

## Document Version

**Version**: 1.0  
**Last Updated**: December 2024  
**Maintained By**: T2MS Development Team

---

## Notes

- This document assumes you already have a production environment set up on Railway
- Adjust branch names and workflows according to your team's preferences
- Keep this document updated as your infrastructure evolves
- Document any environment-specific quirks or configurations

---

**Next Steps:**

1. Follow steps 1-7 to set up your staging environment
2. Test thoroughly before deploying to production
3. Establish your team's workflow using staging environment
4. Keep environments in sync and documented


