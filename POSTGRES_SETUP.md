# PostgreSQL Setup Guide

This guide will help you set up PostgreSQL for both local development and Vercel deployment.

## 🗄️ Option 1: Vercel Postgres (Recommended - Easiest)

### Step 1: Create Vercel Postgres Database

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to your project: `ginza-gaming-schedule`
3. Click on the **"Storage"** tab
4. Click **"Create Database"**
5. Select **"Postgres"**
6. Choose the **"Hobby"** plan (free tier)
7. Name it: `ginza-gaming-db`
8. Select a region (choose closest to you)
9. Click **"Create"**

### Step 2: Get Connection String

1. After creation, click on your database
2. Go to the **"Settings"** tab
3. Find the **"Connection String"** section
4. Copy the connection string (it looks like: `postgres://...`)

### Step 3: Add to Vercel Environment Variables

1. In your Vercel project, go to **"Settings"** → **"Environment Variables"**
2. Add a new variable:
   - **Name**: `DATABASE_URL`
   - **Value**: Paste the connection string you copied
   - **Environment**: Select all (Production, Preview, Development)
3. Click **"Save"**

### Step 4: Update Prisma Schema

The schema is already configured for PostgreSQL. Just make sure it's set to:
```prisma
provider = "postgresql"
```

### Step 5: Run Migrations on Vercel

1. Push your code to GitHub
2. Vercel will automatically run `prisma generate` during build
3. To run migrations, you can:
   - Use Vercel CLI: `vercel env pull` then `npx prisma migrate deploy`
   - Or add a build script that runs migrations

## 🏠 Option 2: Local PostgreSQL Setup

### Option 2A: Using Docker (Easiest for Local)

1. **Install Docker Desktop** (if not already installed)
   - Download from: https://www.docker.com/products/docker-desktop

2. **Run PostgreSQL in Docker**:
   ```bash
   docker run --name ginza-postgres \
     -e POSTGRES_PASSWORD=yourpassword \
     -e POSTGRES_DB=ginza_gaming \
     -p 5432:5432 \
     -d postgres:15
   ```

3. **Update your `.env` file**:
   ```env
   DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/ginza_gaming?schema=public"
   ```

### Option 2B: Using Supabase (Free Cloud Database)

1. Go to [supabase.com](https://supabase.com)
2. Create a free account
3. Create a new project
4. Go to **Settings** → **Database**
5. Copy the connection string (under "Connection string" → "URI")
6. Update your `.env` file with the connection string

### Option 2C: Install PostgreSQL Locally

1. **Download PostgreSQL**:
   - Windows: https://www.postgresql.org/download/windows/
   - Mac: `brew install postgresql@15`
   - Linux: `sudo apt-get install postgresql`

2. **Create Database**:
   ```bash
   # Connect to PostgreSQL
   psql -U postgres
   
   # Create database
   CREATE DATABASE ginza_gaming;
   
   # Exit
   \q
   ```

3. **Update your `.env` file**:
   ```env
   DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/ginza_gaming?schema=public"
   ```

## 🔄 Migration Steps

Once you have PostgreSQL set up:

### 1. Update Prisma Schema
```bash
# The schema should already be set to postgresql
# If not, update prisma/schema.prisma:
# provider = "postgresql"
```

### 2. Create Migration
```bash
npx prisma migrate dev --name init_postgres
```

### 3. Generate Prisma Client
```bash
npx prisma generate
```

### 4. Verify Connection
```bash
npx prisma studio
# This will open a browser where you can see your database
```

## 📝 Environment Variables

### Local Development (.env)
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/ginza_gaming?schema=public"
```

### Vercel (Environment Variables)
- Go to Vercel Dashboard → Your Project → Settings → Environment Variables
- Add `DATABASE_URL` with your Vercel Postgres connection string
- Make sure to select all environments (Production, Preview, Development)

## 🚀 Deployment Checklist

- [ ] Vercel Postgres database created
- [ ] `DATABASE_URL` added to Vercel environment variables
- [ ] Prisma schema updated to `provider = "postgresql"`
- [ ] Migration created and tested locally
- [ ] Code pushed to GitHub
- [ ] Vercel deployment successful

## 🔍 Troubleshooting

### Connection Issues
- Make sure PostgreSQL is running: `docker ps` (for Docker) or check service status
- Verify connection string format
- Check firewall settings if connecting remotely

### Migration Issues
- Run `npx prisma migrate reset` to start fresh (⚠️ deletes all data)
- Check Prisma logs: `npx prisma migrate dev --create-only` to see what will be created

### Vercel Build Issues
- Make sure `DATABASE_URL` is set in Vercel environment variables
- Check build logs in Vercel dashboard
- Ensure `prisma generate` runs in build script

