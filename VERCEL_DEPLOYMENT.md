# Vercel Deployment with Supabase

## ✅ Step 1: Add Environment Variables to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: **ginza-gaming-schedule**
3. Go to **Settings** → **Environment Variables**
4. Click **"Add New"**

### Add this variable:

**Key**: `DATABASE_URL`  
**Value**: 
```
postgresql://postgres.onrkxbflwhfbuxiblozt:FflMD8RoQCrD4XRN@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
```

**Important**: 
- Use `postgresql://` (not `postgres://`) to avoid Prisma validation errors
- Select **all environments** (Production, Preview, Development)
- Click **"Save"**

### Optional: Add Supabase Client Variables (if needed later)

**Key**: `NEXT_PUBLIC_SUPABASE_URL`  
**Value**: `https://onrkxbflwhfbuxiblozt.supabase.co`

**Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
**Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ucmt4YmZsd2hmYnV4aWJsb3p0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczMzk5MTcsImV4cCI6MjA4MjkxNTkxN30.w3MVP16bU6fh_kG3Tj2rx6wLlboZCOHz1HqxGiVkNwI`

## 🚀 Step 2: Deploy to Vercel

### Option A: Push to GitHub (Automatic)

1. Commit your changes:
   ```bash
   git add .
   git commit -m "Configure Supabase database"
   git push
   ```

2. Vercel will automatically:
   - Detect the push
   - Run `prisma generate`
   - Run `prisma migrate deploy` (from build script)
   - Build and deploy your app

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI if needed
npm i -g vercel

# Deploy
vercel --prod
```

## 📋 Step 3: Verify Deployment

After deployment:

1. **Check Build Logs**: 
   - Go to Vercel Dashboard → Your Project → Deployments
   - Click on the latest deployment
   - Check the build logs for any errors

2. **Test Your App**:
   - Visit your Vercel URL
   - Go to `/admin` page
   - Try creating an event
   - Check if it saves successfully

3. **Verify Database**:
   - Go to Supabase Dashboard → Table Editor
   - You should see the `Event` table
   - Check if events are being created

## 🔧 Troubleshooting

### "DATABASE_URL must start with postgresql://"
- Make sure you're using `postgresql://` (not `postgres://`) in Vercel environment variables
- The connection string should start with: `postgresql://`

### "Table does not exist"
- The build script includes `prisma migrate deploy` which should create tables
- If tables don't exist, you can manually run migrations:
  ```bash
  vercel env pull .env.local
  npx prisma migrate deploy
  ```

### Build fails
- Check that `DATABASE_URL` is set in Vercel
- Verify the connection string is correct
- Check build logs in Vercel dashboard

## ✅ Checklist

- [ ] `DATABASE_URL` added to Vercel (using `postgresql://`)
- [ ] Code pushed to GitHub
- [ ] Vercel deployment successful
- [ ] Can create events in admin panel
- [ ] Events appear in Supabase Table Editor

