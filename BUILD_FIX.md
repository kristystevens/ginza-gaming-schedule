# Build Fix for Vercel

## Issue
The build is failing because `prisma migrate deploy` requires migrations to exist, and the migration was created for SQLite.

## Solution Applied
Updated the build command to:
1. Try `prisma migrate deploy` first (if migrations exist)
2. Fall back to `prisma db push` if migrations fail (creates tables directly from schema)

## What You Need to Do

### 1. Make Sure DATABASE_URL is Set in Vercel

**This is the most common cause of build failures!**

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify `DATABASE_URL` exists with value:
   ```
   postgresql://postgres.onrkxbflwhfbuxiblozt:FflMD8RoQCrD4XRN@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
   ```
3. Make sure it's enabled for all environments

### 2. Push the Updated Build Command

The build command has been updated to be more resilient. Push this change:

```bash
git add package.json vercel.json
git commit -m "Fix build command to handle migrations gracefully"
git push
```

### 3. Alternative: Use db push Only

If migrations continue to fail, you can simplify the build to just use `db push`:

**In package.json:**
```json
"build": "prisma generate && prisma db push --accept-data-loss && next build"
```

**In vercel.json:**
```json
"buildCommand": "prisma generate && prisma db push --accept-data-loss && next build"
```

## Why This Works

- `prisma db push` creates tables directly from your schema
- It doesn't require migration files
- It's perfect for initial setup
- It will create the Event table on first deployment

## After Fix

1. Push the updated code
2. Vercel will redeploy
3. The build should succeed
4. Tables will be created automatically

