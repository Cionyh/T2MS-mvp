# Fix: "Failed migrations in the target database"

## Railway: build no longer runs migrations

Migrations are **not** run during `npm install` (postinstall) anymore, so the Railway **build** no longer touches the database and won’t fail on migration errors.

You need to run migrations **at deploy/release time** instead:

1. In **Railway** → your service → **Settings** (or **Variables**).
2. Set **Release Command** to:  
   `npx prisma migrate deploy`  
   (Leave **Start Command** as e.g. `npm start` or `next start`.)
3. Railway will run the release command (migrations) when a new release is deployed; then the app starts.

**One-time fix for the current failed migration**

Before the next deploy, clear the failed migration so `prisma migrate deploy` can run again:

- **Option A – Railway CLI:**  
  `railway run npx prisma migrate resolve --rolled-back "20260130100000_add_install_job_system"`  
  (from your project dir, with the project linked to the right Railway service/environment that has `DATABASE_URL`.)

- **Option B – DB UI:**  
  In your PostgreSQL UI (e.g. Railway Postgres → Data, or any client), open the `_prisma_migrations` table, find the row for `20260130100000_add_install_job_system`, and delete it (or set `rolled_back_at` to now and leave `finished_at` NULL).

Then deploy again. The release command will run `prisma migrate deploy`; the migration is idempotent so it should succeed.

---

## Original error (when migrations ran in postinstall)

When the build failed with:

- **"migrate found failed migrations in the target database, new migrations will not be applied"**
- Migration `20260130100000_add_install_job_system` started but failed (e.g. "relation customer already exists")

Prisma has recorded that migration as **failed** and will not run any new migrations until it is resolved.

## Fix (production/staging DB)

1. **Connect to the same database your deploy uses** (e.g. production or staging `DATABASE_URL`).

2. **Mark the failed migration as rolled back** so Prisma will try it again:

   ```bash
   npx prisma migrate resolve --rolled-back "20260130100000_add_install_job_system"
   ```

   Use the **exact** migration name (the folder name under `prisma/migrations/`).

3. **Redeploy.**  
   On the next deploy, `prisma migrate deploy` will run `20260130100000_add_install_job_system` again. The migration SQL is now idempotent (`CREATE TABLE IF NOT EXISTS`, etc.), so it should succeed even if `customer` or other tables already exist.

## If you can't run CLI against production

If you don’t have a shell that can run Prisma against the production DB:

1. Use your host’s “run command” / “console” / “release phase” that has `DATABASE_URL` set, and run the same command there, or  
2. Manually fix the `_prisma_migrations` table in your DB (same effect as `migrate resolve --rolled-back`):

   - Open the database (e.g. Supabase SQL editor, RDS query editor).
   - Find the row for migration `20260130100000_add_install_job_system` in `_prisma_migrations`.
   - Either delete that row, or set `rolled_back_at` to the current timestamp and keep `finished_at` NULL so Prisma treats it as rolled back and will re-apply it on the next `migrate deploy`.

After that, trigger a new deploy so `prisma migrate deploy` runs again.
