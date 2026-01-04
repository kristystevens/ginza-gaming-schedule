# Quick Vercel Postgres Setup

## Step-by-Step Guide

### 1. Create Vercel Postgres Database

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on your project: **ginza-gaming-schedule**
3. Click the **"Storage"** tab
4. Click **"Create Database"**
5. Select **"Postgres"**
6. Choose **"Hobby"** plan (free)
7. Name: `ginza-gaming-db`
8. Click **"Create"**

### 2. Get Connection String

1. Click on your newly created database
2. Go to **"Settings"** tab
3. Scroll to **"Connection String"**
4. Copy the connection string (starts with `postgres://`)

### 3. Add to Vercel Environment Variables

1. In your Vercel project, go to **"Settings"** → **"Environment Variables"**
2. Click **"Add New"**
3. Enter:
   - **Key**: `DATABASE_URL`
   - **Value**: Paste the connection string you copied
   - **Environment**: Select all (Production, Preview, Development)
4. Click **"Save"**

### 4. Deploy

1. Push your code to GitHub
2. Vercel will automatically:
   - Run `prisma generate` during build
   - Connect to your Postgres database

### 5. Run Migrations (First Time)

After your first deployment, you need to run migrations:

**Option A: Using Vercel CLI**
```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Pull environment variables
vercel env pull .env.local

# Run migrations
npx prisma migrate deploy
```

**Option B: Add to Build Script**
Update `package.json`:
```json
"build": "prisma generate && prisma migrate deploy && next build"
```

**Option C: Use Vercel's Post-Deploy Hook**
Add a `vercel.json` script (if needed)

## ✅ Verification

After setup, your app should:
- ✅ Connect to PostgreSQL on Vercel
- ✅ Store events in the database
- ✅ Persist data across deployments

## 🔍 Troubleshooting

**Build fails with "DATABASE_URL not found"**
- Make sure `DATABASE_URL` is set in Vercel environment variables
- Check that it's enabled for the correct environment (Production/Preview)

**Migration errors**
- Run `npx prisma migrate deploy` manually after first deployment
- Or add it to your build script

**Connection timeout**
- Check your Vercel Postgres database is running
- Verify the connection string is correct

