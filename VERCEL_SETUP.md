# Vercel Deployment Guide

This guide will help you deploy your Ginza Gaming Schedule app to Vercel with a database.

## ✅ Vercel Compatibility

Your app is **fully compatible** with Vercel! Here's what's already set up:

- ✅ Prisma Client singleton pattern (serverless-optimized)
- ✅ Build script includes Prisma generation
- ✅ PostgreSQL support (Vercel Postgres compatible)
- ✅ Next.js 16 (fully supported by Vercel)
- ✅ Environment variable configuration

## 🚀 Quick Deploy to Vercel

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Add database support"
   git push origin main
   ```

2. **Go to [vercel.com](https://vercel.com)**
   - Sign up/login
   - Click "Add New Project"
   - Import your GitHub repository

3. **Configure Project**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `prisma generate && next build` (already in package.json)
   - Output Directory: `.next` (default)

4. **Add Vercel Postgres Database**
   - In your project dashboard, go to **Storage** tab
   - Click **Create Database** → **Postgres**
   - Choose plan (Hobby is free)
   - Name it: `ginza-gaming-db`

5. **Set Environment Variables**
   - Go to **Settings** → **Environment Variables**
   - `DATABASE_URL` will be automatically added when you create the Postgres database
   - Add Telegram bot variables (if using):
     - `TELEGRAM_BOT_TOKEN`
     - `TELEGRAM_CHAT_ID`
     - `PROMO_OFFSET_MINUTES=120`
     - `REMINDER_OFFSET_MINUTES=10`

6. **Deploy**
   - Click **Deploy**
   - Wait for build to complete

7. **Run Database Migrations**
   After first deployment:
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login
   vercel login
   
   # Link to your project
   vercel link
   
   # Push database schema
   npx prisma db push
   ```
   
   Or use Vercel's built-in terminal:
   - Go to project → **Deployments** → Click on deployment → **View Function Logs**
   - Or use Vercel's web terminal

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Link to existing project or create new
   - Set up environment variables

4. **Add Postgres Database**
   - Go to Vercel dashboard
   - Storage → Create Database → Postgres
   - Copy connection string

5. **Set Environment Variables**
   ```bash
   vercel env add DATABASE_URL
   # Paste your connection string
   ```

6. **Run Migrations**
   ```bash
   vercel env pull .env.local
   npx prisma db push
   ```

7. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## 🔧 Vercel-Specific Configuration

### Connection String Format

Vercel Postgres provides two connection strings:

1. **Direct Connection** (for migrations):
   ```
   postgres://user:pass@host:5432/dbname
   ```

2. **Pooled Connection** (for production - recommended):
   ```
   postgres://user:pass@host:5432/dbname?pgbouncer=true&connect_timeout=15
   ```

**Important:** Use the **pooled connection** for `DATABASE_URL` in production. Vercel automatically provides this in the environment variables.

### Prisma Configuration

Your `prisma/schema.prisma` is already configured correctly:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Build Configuration

Your `package.json` already includes:
```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"
  }
}
```

This ensures Prisma Client is generated during build.

## 📝 Post-Deployment Steps

### 1. Run Database Migrations

After first deployment, you need to push your schema:

**Option A: Using Vercel CLI**
```bash
vercel env pull .env.local
npx prisma db push
```

**Option B: Using Vercel Dashboard**
- Go to your project
- Use the built-in terminal or SSH
- Run: `npx prisma db push`

### 2. Verify Database Connection

1. Go to your Vercel project dashboard
2. Check **Storage** → Your Postgres database
3. Verify tables are created (should see `Event` table)

### 3. Test Your App

1. Visit your deployed URL (e.g., `https://your-app.vercel.app`)
2. Go to `/admin` to create events
3. Check that events persist after refresh

## 🔍 Troubleshooting

### Issue: "Prisma Client not generated"

**Solution:**
- Make sure `postinstall` script runs: `npm install` should generate Prisma Client
- Check build logs in Vercel dashboard
- Verify `prisma generate` is in build command

### Issue: "Database connection failed"

**Solution:**
- Verify `DATABASE_URL` is set in Vercel environment variables
- Use the **pooled connection** string (not direct)
- Check database is running in Vercel dashboard

### Issue: "Schema not applied"

**Solution:**
- Run `npx prisma db push` after deployment
- Or use migrations: `npx prisma migrate deploy`

### Issue: "Too many database connections"

**Solution:**
- Use the pooled connection string (Vercel provides this automatically)
- The Prisma Client singleton pattern already handles this

## 🎯 Best Practices for Vercel

1. **Use Vercel Postgres** (not external databases) for best performance
2. **Use pooled connections** (Vercel handles this automatically)
3. **Run migrations** after deployment, not during build
4. **Monitor** your database usage in Vercel dashboard
5. **Use environment variables** for all sensitive data

## 📊 Vercel Postgres Plans

- **Hobby (Free)**: 256 MB storage, 60 hours compute/month
- **Pro ($20/month)**: 8 GB storage, unlimited compute
- **Enterprise**: Custom pricing

## 🔗 Useful Links

- [Vercel Postgres Docs](https://vercel.com/docs/storage/vercel-postgres)
- [Prisma + Vercel Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)

## ✅ Checklist

Before deploying:
- [ ] Code pushed to GitHub
- [ ] `package.json` has correct build scripts
- [ ] `prisma/schema.prisma` is configured
- [ ] Environment variables documented

After deploying:
- [ ] Vercel Postgres database created
- [ ] `DATABASE_URL` environment variable set
- [ ] Database migrations run (`npx prisma db push`)
- [ ] App tested and working
- [ ] Events can be created and persist

Your app is ready for Vercel! 🚀


