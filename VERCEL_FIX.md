# Fixing Vercel Deployment Error

## The Problem
You're getting this error during Vercel build:
```
Invalid value undefined for datasource "db" provided to PrismaClient constructor
```

This happens because `DATABASE_URL` is not set in Vercel's environment variables.

## Solution: Set DATABASE_URL on Vercel

### Step 1: Create Vercel Postgres Database

1. Go to your Vercel project dashboard
2. Click on the **Storage** tab
3. Click **Create Database** → **Postgres**
4. Choose a plan (Hobby is free)
5. Name it (e.g., `ginza-gaming-db`)
6. Click **Create**

### Step 2: Get the Connection String

After creating the database:
1. Vercel automatically adds `DATABASE_URL` to your environment variables
2. Go to **Settings** → **Environment Variables**
3. You should see `DATABASE_URL` listed
4. Copy it if you need it for local testing

### Step 3: Verify Environment Variables

Make sure these are set in Vercel:
- ✅ `DATABASE_URL` (automatically added when you create Postgres)
- ✅ `TELEGRAM_BOT_TOKEN` (if using Telegram bot)
- ✅ `TELEGRAM_CHAT_ID` (if using Telegram bot)

### Step 4: Redeploy

1. Go to **Deployments** tab
2. Click the **⋯** menu on your latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger a new deployment

## Alternative: Set DATABASE_URL Manually

If you're using an external database (not Vercel Postgres):

1. Go to **Settings** → **Environment Variables**
2. Click **Add New**
3. Name: `DATABASE_URL`
4. Value: Your PostgreSQL connection string
   ```
   postgresql://user:password@host:5432/dbname?schema=public
   ```
5. Make sure to add it for **Production**, **Preview**, and **Development**
6. Click **Save**
7. Redeploy

## After Setting DATABASE_URL

### Run Database Migrations

After the first successful deployment:

1. **Option A: Using Vercel CLI**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login
   vercel login
   
   # Link to your project
   vercel link
   
   # Pull environment variables
   vercel env pull .env.local
   
   # Push database schema
   npx prisma db push
   ```

2. **Option B: Using Vercel Dashboard**
   - Go to your project
   - Use the built-in terminal (if available)
   - Or use Vercel's database management tools

## Troubleshooting

### Still getting the error?

1. **Check environment variables are set:**
   - Go to Settings → Environment Variables
   - Verify `DATABASE_URL` exists
   - Make sure it's set for the right environment (Production/Preview)

2. **Check the connection string format:**
   - Should start with `postgresql://`
   - Should include username, password, host, port, and database name
   - Vercel Postgres provides this automatically

3. **Clear build cache:**
   - Go to Settings → General
   - Scroll to "Build & Development Settings"
   - Clear the build cache
   - Redeploy

4. **Check build logs:**
   - Go to Deployments
   - Click on the failed deployment
   - Check the build logs for more details

## Quick Checklist

- [ ] Vercel Postgres database created (or external database configured)
- [ ] `DATABASE_URL` environment variable set in Vercel
- [ ] Environment variable set for Production environment
- [ ] Redeployed the application
- [ ] Database schema pushed (`npx prisma db push`)
- [ ] Build completes successfully

## Need Help?

If you're still having issues:
1. Check Vercel build logs for specific error messages
2. Verify your Prisma schema is correct
3. Make sure you're using PostgreSQL (not SQLite) for production
4. Check that your database is accessible from Vercel's servers




