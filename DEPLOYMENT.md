# Database Setup & Deployment Guide

This guide will help you set up a database and deploy your Ginza Gaming Schedule app to a server.

## 🗄️ Database Setup

### Option 1: PostgreSQL (Recommended for Production)

#### Local Development with PostgreSQL

1. **Install PostgreSQL** (if not already installed)
   - Windows: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
   - Mac: `brew install postgresql`
   - Linux: `sudo apt-get install postgresql`

2. **Create a database**
   ```bash
   createdb ginza_gaming
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/ginza_gaming?schema=public"
   ```

4. **Run migrations**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

#### Cloud PostgreSQL Options

**A. Vercel Postgres (Easiest for Vercel deployments)**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Create a new project or select existing
3. Go to Storage → Create Database → Postgres
4. Copy the connection string to your `.env` file

**B. Supabase (Free tier available)**
1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string (format: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`)
5. Add to `.env` as `DATABASE_URL`

**C. Railway (Easy setup)**
1. Sign up at [railway.app](https://railway.app)
2. Create new project → Add PostgreSQL
3. Copy the connection string to `.env`

**D. Neon (Serverless PostgreSQL)**
1. Sign up at [neon.tech](https://neon.tech)
2. Create a project
3. Copy the connection string to `.env`

### Option 2: SQLite (For Local Development Only)

If you want to use SQLite for local development:

1. **Update `prisma/schema.prisma`**
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

2. **Set DATABASE_URL in `.env`**
   ```env
   DATABASE_URL="file:./prisma/dev.db"
   ```

3. **Run migrations**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

## 🚀 Deployment Options

### Option 1: Vercel (Recommended - Easiest)

1. **Install Vercel CLI** (optional)
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```
   Or connect your GitHub repo at [vercel.com](https://vercel.com)

3. **Add Environment Variables**
   - Go to your project settings on Vercel
   - Add `DATABASE_URL` and other env variables
   - Redeploy

4. **Run migrations on Vercel**
   Add a build script in `package.json`:
   ```json
   {
     "scripts": {
       "build": "prisma generate && prisma db push && next build"
     }
   }
   ```

### Option 2: Railway

1. **Install Railway CLI**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login and deploy**
   ```bash
   railway login
   railway init
   railway up
   ```

3. **Add PostgreSQL**
   ```bash
   railway add postgresql
   railway link
   ```

4. **Set environment variables**
   ```bash
   railway variables set DATABASE_URL=$DATABASE_URL
   ```

### Option 3: Render

1. **Create account** at [render.com](https://render.com)

2. **Create new Web Service**
   - Connect your GitHub repo
   - Build command: `npm install && npx prisma generate && npm run build`
   - Start command: `npm start`

3. **Create PostgreSQL database**
   - New → PostgreSQL
   - Copy connection string

4. **Add environment variables**
   - `DATABASE_URL` = your PostgreSQL connection string

### Option 4: DigitalOcean App Platform

1. **Create account** at [digitalocean.com](https://digitalocean.com)

2. **Create App**
   - Connect GitHub repo
   - Add PostgreSQL database component
   - Set build command: `npm install && npx prisma generate && npm run build`

3. **Environment variables** are automatically set for database

### Option 5: AWS (EC2 or App Runner)

#### EC2 Setup
1. Launch EC2 instance (Ubuntu recommended)
2. Install Node.js, PostgreSQL
3. Clone your repo
4. Set up environment variables
5. Run migrations
6. Use PM2 or systemd to run the app

#### App Runner
1. Push code to GitHub
2. Create App Runner service
3. Connect to RDS PostgreSQL
4. Set environment variables

## 📝 Step-by-Step: Complete Setup

### 1. Initialize Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### 2. Environment Variables

Create `.env` file:
```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"

# Telegram Bot (optional)
TELEGRAM_BOT_TOKEN=your_token
TELEGRAM_CHAT_ID=your_chat_id
PROMO_OFFSET_MINUTES=120
REMINDER_OFFSET_MINUTES=10
```

### 3. Update package.json Scripts

Add database scripts:
```json
{
  "scripts": {
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:studio": "prisma studio",
    "db:migrate": "prisma migrate dev",
    "postinstall": "prisma generate"
  }
}
```

### 4. Deploy

**For Vercel:**
```bash
vercel --prod
```

**For Railway:**
```bash
railway up
```

**For Render:**
- Push to GitHub, Render auto-deploys

## 🔧 Troubleshooting

### Database Connection Issues

1. **Check connection string format**
   - PostgreSQL: `postgresql://user:pass@host:port/dbname`
   - SQLite: `file:./path/to/db.db`

2. **Verify environment variables**
   ```bash
   # Check if DATABASE_URL is set
   echo $DATABASE_URL
   ```

3. **Test connection**
   ```bash
   npx prisma db pull
   ```

### Migration Issues

If you get migration errors:
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Or push schema directly
npx prisma db push
```

### Production Build Issues

Make sure Prisma generates before build:
```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"
  }
}
```

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

## 🎯 Quick Start Checklist

- [ ] Choose database provider (PostgreSQL recommended)
- [ ] Set up database (local or cloud)
- [ ] Create `.env` file with `DATABASE_URL`
- [ ] Run `npx prisma generate`
- [ ] Run `npx prisma db push`
- [ ] Test locally with `npm run dev`
- [ ] Choose deployment platform
- [ ] Set environment variables on platform
- [ ] Deploy!
- [ ] Run migrations on production if needed




