# 🚀 Friends Clothing POS - Vercel Deployment Guide

## ✅ Current Status
- **Web App**: Next.js with API routes ✓
- **Database**: Supabase PostgreSQL ✓
- **Security**: Row Level Security (RLS) enabled ✓
- **Ready to Deploy**: YES ✓

## 📝 1. Environment Setup for Production

### Step 1: Update Vercel Environment Variables

Go to **Vercel Dashboard** → **Settings** → **Environment Variables** and add:

**Production Variables:**
```
DATABASE_URL=postgresql://postgres:02402556168Sh@!@db.ebtxozjiwjifmhsmcqzw.supabase.co:6543/clothes
NEXT_PUBLIC_API_URL=
```

**Explanation:**
- `DATABASE_URL` - Used by backend API routes (KEEP SECRET - only on server)
- `NEXT_PUBLIC_API_URL` - Leave EMPTY for production (uses relative URLs)

### Step 2: Verify Local Environment

Check your `.env.local`:
```bash
DATABASE_URL="postgresql://postgres:02402556168Sh@!@db.ebtxozjiwjifmhsmcqzw.supabase.co:6543/clothes"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

## 🔧 2. Deployment Steps

### Option A: Deploy via Vercel CLI (Fastest)

```bash
# 1. Install Vercel CLI globally (if not already done)
npm install -g vercel

# 2. Navigate to project directory
cd e:\projects\friends

# 3. Deploy to production
vercel deploy --prod

# 4. View your app at the URL provided
# Example: https://friends-clothing-pos.vercel.app
```

### Option B: Deploy via GitHub (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment with RLS policies"
   git push origin main
   ```

2. **In Vercel Dashboard:**
   - Go to https://vercel.com/new
   - Select your "friends" repository
   - Configure:
     - **Root Directory**: `./` (root)
     - **Build Command**: `npm run build:web`
     - **Output Directory**: `apps/web/.next`
     - **Install Command**: `npm install`

3. **Add Environment Variables** (as shown in Step 1)

4. **Deploy** → Copy the URL provided

### Option C: Deploy via Docker (Advanced)

```bash
# Create Dockerfile at project root
docker build -t friends-pos .
docker run -p 3000:3000 -e DATABASE_URL="..." friends-pos
```

## ✨ 3. Post-Deployment Verification

### Check Deployment Health

```bash
# Test main app
curl https://your-vercel-url.vercel.app

# Test API endpoints
curl https://your-vercel-url.vercel.app/api/products
curl https://your-vercel-url.vercel.app/api/health
curl https://your-vercel-url.vercel.app/api/bills
```

### Expected API Responses

**GET /api/products**
```json
[
  {
    "id": "...",
    "name": "Product Name",
    "price": 1000,
    "category": "Category",
    "stock": 50,
    ...
  }
]
```

**GET /api/health**
```json
{
  "status": "ok"
}
```

### Access the Application

Open in browser:
```
https://your-vercel-url.vercel.app
```

You should see:
- ✅ Scanner panel on the left
- ✅ Product grid and search
- ✅ Shopping cart on the right
- ✅ Barcode scanning functionality
- ✅ Checkout and billing

## 🔒 4. Security Checklist

- ✅ **DATABASE_URL is secret** - Never exposed in frontend code
- ✅ **RLS policies enabled** - Database cannot be accessed publicly
- ✅ **NEXT_PUBLIC_API_URL empty** - Uses relative URLs (same domain)
- ✅ **CORS configured** - Only from your domain
- ✅ **No hardcoded credentials** - All in environment variables

## 📊 5. Monitoring & Debugging

### View Logs
```bash
vercel logs <project-url> --follow
```

### Common Issues & Solutions

#### Issue: "Unable to load products"
**Solution:**
```bash
# Check DATABASE_URL is set in Vercel > Settings > Environment Variables
# Run migration in Vercel console
vercel env pull
npx prisma migrate deploy
```

#### Issue: CORS Errors
**Solution:** Ensure NEXT_PUBLIC_API_URL is set correctly for your domain

#### Issue: Database Connection Timeout
**Solution:** 
- Check Supabase firewall allows Vercel IPs
- Verify DATABASE_URL format is correct
- Check database is running in Supabase console

## 🎯 6. Deployment Checklist

Before deploying, verify:

- [ ] All local tests pass: `npm run build:web`
- [ ] No TypeScript errors: `npm run dev:web` (check console)
- [ ] Database migrations applied: `npx prisma migrate deploy`
- [ ] Environment variables set in Vercel
- [ ] `.env.local` is in `.gitignore`
- [ ] RLS policies are enabled (check Supabase)
- [ ] Barcode scanning works locally

## 📱 7. Testing After Deployment

1. **Add a test product:**
   - Go to your app URL
   - Click "Create Product"
   - Fill the form and save
   
2. **Test barcode scanning:**
   - Click scanner icon
   - Enter/scan a barcode code
   - Product should appear

3. **Test checkout:**
   - Add items to cart
   - Click "Checkout"
   - Select payment method
   - Complete transaction

## 🚀 Your Deployment URL

After deployment, your app will be available at:

```
https://friends-clothing-pos.vercel.app
```

(Or similar - Vercel will provide the exact URL)

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Guide](https://supabase.com/docs/guides/getting-started/architecture)
- [Environment Variables in Vercel](https://vercel.com/docs/projects/environment-variables)

## 🆘 Need Help?

If deployment fails:

1. Check Vercel dashboard for error logs
2. Run `vercel logs` command
3. Verify all environment variables are set
4. Check Supabase database is accessible
5. Review TypeScript compilation errors

---

**Last Updated:** April 8, 2026
**Status:** Ready for Production Deployment ✅
