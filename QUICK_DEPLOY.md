# Quick Vercel Deployment Guide

## ✅ What's Already Done

- ✅ Prisma schema configured for PostgreSQL
- ✅ Local `.env` updated with Supabase connection string
- ✅ Connection tested and working

## 🚀 Deploy to Vercel (3 Steps)

### Step 1: Add DATABASE_URL to Vercel

1. Go to: https://vercel.com/dashboard
2. Select project: **ginza-gaming-schedule**
3. Go to: **Settings** → **Environment Variables**
4. Click: **"Add New"**
5. Enter:
   - **Key**: `DATABASE_URL`
   - **Value**: 
     ```
     postgresql://postgres.onrkxbflwhfbuxiblozt:FflMD8RoQCrD4XRN@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
     ```
   - **Environment**: Select all (Production, Preview, Development)
6. Click: **"Save"**

**⚠️ Important**: Use `postgresql://` (not `postgres://`) to avoid errors!

### Step 2: Push Code to GitHub

```bash
git add .
git commit -m "Configure Supabase database"
git push
```

### Step 3: Tables Will Be Created Automatically

The build script includes `prisma migrate deploy` which will:
- Create the Event table on first deployment
- Run any pending migrations

## ✅ Verify It Works

After deployment:

1. Visit your Vercel URL
2. Go to `/admin` page
3. Try creating an event
4. Check Supabase Dashboard → Table Editor to see the event

## 🔧 If Tables Don't Exist After Deployment

Run this locally (after pulling Vercel env vars):

```bash
# Pull environment variables from Vercel
vercel env pull .env.local

# Run migrations
npx prisma migrate deploy
```

Or manually create via Supabase SQL Editor:

```sql
CREATE TABLE "Event" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "eventName" TEXT NOT NULL,
  "date" TEXT NOT NULL,
  "startTime" TEXT NOT NULL,
  "endTime" TEXT,
  "timezone" TEXT DEFAULT 'EST',
  "stakes" TEXT NOT NULL,
  "gameType" TEXT NOT NULL,
  "description" TEXT,
  "streamingLink" TEXT,
  "gameLink" TEXT,
  "telegramChatLink" TEXT,
  "lumaEventUrl" TEXT,
  "isRecurring" BOOLEAN NOT NULL DEFAULT false,
  "recurrencePattern" TEXT,
  "recurrenceEndDate" TEXT,
  "parentEventId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX "Event_date_idx" ON "Event"("date");
CREATE INDEX "Event_parentEventId_idx" ON "Event"("parentEventId");
```

## 📝 Summary

**For Vercel**: Add `DATABASE_URL` environment variable with `postgresql://` protocol  
**For Local**: Already configured in `.env` file  
**Tables**: Will be created automatically on first Vercel deployment

