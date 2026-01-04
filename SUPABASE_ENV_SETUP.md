# Supabase Environment Variables Setup

## ✅ For Vercel

Add these environment variables in Vercel Dashboard → Settings → Environment Variables:

### Required for Prisma/Database:
```
DATABASE_URL=postgres://postgres.onrkxbflwhfbuxiblozt:FflMD8RoQCrD4XRN@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
```

**Note**: Use the `POSTGRES_PRISMA_URL` value as your `DATABASE_URL` - it's optimized for Prisma with connection pooling.

### Optional (if you want to use Supabase client library later):
```
NEXT_PUBLIC_SUPABASE_URL=https://onrkxbflwhfbuxiblozt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ucmt4YmZsd2hmYnV4aWJsb3p0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczMzk5MTcsImV4cCI6MjA4MjkxNTkxN30.w3MVP16bU6fh_kG3Tj2rx6wLlboZCOHz1HqxGiVkNwI
```

## 🏠 For Local Development (.env file)

Add to your `.env` file in the project root:

```env
# Database - Use Prisma URL for connection pooling
DATABASE_URL="postgres://postgres.onrkxbflwhfbuxiblozt:FflMD8RoQCrD4XRN@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"

# Optional: Supabase client (if needed later)
NEXT_PUBLIC_SUPABASE_URL="https://onrkxbflwhfbuxiblozt.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ucmt4YmZsd2hmYnV4aWJsb3p0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczMzk5MTcsImV4cCI6MjA4MjkxNTkxN30.w3MVP16bU6fh_kG3Tj2rx6wLlboZCOHz1HqxGiVkNwI"
```

## 🚀 Next Steps

1. **Add DATABASE_URL to Vercel** (see above)
2. **Add DATABASE_URL to local .env** (for testing)
3. **Test connection**: `npm run db:test`
4. **Create migration**: `npm run db:migrate`
5. **Deploy to Vercel**

## 🔒 Security Note

- Never commit your `.env` file to git
- The `.env` file is already in `.gitignore`
- These keys are safe to use in environment variables (they're designed for client-side use)

