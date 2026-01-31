# Fix P3009: Failed migration on Railway

Prisma says: "The `20260130100000_add_install_job_system` migration started at 2026-01-31... failed". That means a **failed** row exists in the database that Railway uses (gondola.proxy.rlwy.net). You must fix it in **that** database.

## Step 1: Use Railway’s database

- In **Railway** → your project → **Variables**.
- Copy the **`DATABASE_URL`** value (starts with `postgresql://...`).
- Use this **exact** URL to connect (TablePlus, psql, Supabase-style SQL editor, etc.). Do **not** use a local or other project’s DB.

## Step 2: Find the failed row with SQL

Run this in the DB connected with Railway’s `DATABASE_URL`:

```sql
SELECT id, migration_name, started_at, finished_at, rolled_back_at
FROM _prisma_migrations
WHERE finished_at IS NULL
   OR migration_name = '20260130100000_add_install_job_system';
```

- If you see a row for `20260130100000_add_install_job_system` (or any row with `finished_at` NULL), that’s the failed migration.

## Step 3: Delete the failed row

Still in Railway’s DB:

```sql
DELETE FROM _prisma_migrations
WHERE migration_name = '20260130100000_add_install_job_system';
```

(Or delete by the `id` from the query above.)

## Step 4: Redeploy

Trigger a new deploy on Railway. If your build still runs `prisma migrate deploy`, it should now apply the migration (it’s idempotent). If you’ve switched to running migrations in the **Release Command** only, run a new deploy and the release step will apply it.

---

## Option B: Resolve via Railway CLI

If you use Railway CLI and the project is linked:

```bash
railway run npx prisma migrate resolve --rolled-back "20260130100000_add_install_job_system"
```

This uses Railway’s `DATABASE_URL` and marks the migration as rolled back so the next `prisma migrate deploy` can run it again.

Then redeploy.
