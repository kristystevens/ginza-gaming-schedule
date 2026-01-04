# Supabase Setup for Vercel

## ✅ What You Need

1. **Supabase Project** - Already created
2. **Connection String** - From Supabase dashboard
3. **Vercel Environment Variable** - Add `DATABASE_URL` to Vercel

## 🔗 Getting Your Supabase Connection String

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **Database**
4. Scroll to **"Connection string"** section
5. Select **"URI"** tab
6. Copy the connection string (looks like: `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`)

**Important**: Use the **"URI"** connection string, not the "Session mode" or "Transaction mode" ones.

## 🔧 Adding to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: **ginza-gaming-schedule**
3. Go to **Settings** → **Environment Variables**
4. Click **"Add New"**
5. Enter:
   - **Key**: `DATABASE_URL`
   - **Value**: Paste your Supabase connection string
   - **Environment**: Select all (Production, Preview, Development)
6. Click **"Save"**

## 🚀 Next Steps

### 1. Test Connection Locally (Optional)

If you want to test locally first, add to your `.env` file:
```env
DATABASE_URL="your-supabase-connection-string-here"
```

Then test:
```bash
npm run db:test
```

### 2. Create Migration

```bash
npm run db:migrate
```

This will create the Event table in your Supabase database.

### 3. Deploy to Vercel

1. Push your code to GitHub
2. Vercel will automatically:
   - Use the `DATABASE_URL` from environment variables
   - Run `prisma generate` during build
   - Connect to your Supabase database

### 4. Run Migrations on Vercel (First Time)

After your first deployment, you may need to run migrations:

**Option A: Using Vercel CLI**
```bash
# Install Vercel CLI
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

## 🔍 Verify Setup

1. **Check Supabase Dashboard**:
   - Go to **Table Editor** in Supabase
   - You should see the `Event` table after running migrations

2. **Test Your App**:
   - Deploy to Vercel
   - Try creating an event in the admin panel
   - Check Supabase Table Editor to see if it appears

## 📝 Connection String Format

Your Supabase connection string should look like:
```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```

Or for direct connection (without connection pooling):
```
postgresql://postgres.[project-ref]:[password]@db.[project-ref].supabase.co:5432/postgres
```

## ⚠️ Important Notes

- **Connection Pooling**: Supabase uses PgBouncer for connection pooling. The port `6543` uses pooling, port `5432` is direct.
- **Password**: Your database password is shown in Supabase Settings → Database (you can reset it if needed)
- **SSL**: Supabase requires SSL connections. Prisma handles this automatically.

## 🐛 Troubleshooting

**"Connection refused" error**
- Check that your Supabase project is active
- Verify the connection string is correct
- Make sure you're using the right port (6543 for pooling, 5432 for direct)

**"Authentication failed"**
- Verify your database password in Supabase Settings
- Make sure the connection string includes the correct password

**"Table does not exist"**
- Run migrations: `npx prisma migrate deploy`
- Check Supabase Table Editor to verify tables were created

