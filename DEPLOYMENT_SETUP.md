# Complete Deployment Guide: Vercel + Supabase

## 🏗️ Architecture Overview - SIMPLIFIED

Since you only have Vercel & Supabase, here's the good news:
- **Everything deploys on ONE Vercel project** (web app + API routes combined)
- **Single database** on Supabase
- **No separate API server needed** - using Next.js API Routes instead

### Project Structure After Migration
```
Vercel:
  └─ apps/web (Next.js frontend + API routes)
       ├─ app/api/health
       ├─ app/api/products
       ├─ app/api/bills
       └─ ... other routes

Supabase:
  └─ PostgreSQL Database
```

---

## ✅ QUICK DEPLOYMENT CHECKLIST

- [x] Supabase database created and configured
- [x] Database migrations applied and baseline created
- [x] Environment variables configured
- [x] API converted to Next.js routes (already done)
- [ ] Install dependencies and build locally (testing)
- [ ] Push code to GitHub
- [ ] Configure Vercel environment variables
- [ ] Deploy to Vercel

---

## 📝 PHASE 1: Local Testing (Before Deployment)

### Step 1: Install Dependencies
```bash
cd e:\projects\friends
npm install
```

### Step 2: Generate Prisma Client
```bash
npm run db:generate
```
This creates the Prisma client for your web app to use.

### Step 3: Test Locally
```bash
npm run dev:web
```
Should start on http://localhost:3000

**Test the API:**
- Open http://localhost:3000/api/health
- Should return: `{"status":"ok"}`

### Step 4: Test Database Connection
Try creating a product in the UI. It should:
1. Send request to `/api/products` (POST)
2. Hit Supabase database
3. Store the product

---

## 🌐 PHASE 2: Deploy Web App to Vercel

### Step 1: Push to GitHub

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Ready for Vercel deployment with Supabase"

# Push to your GitHub repo
git push origin main
```

⚠️ **Make sure your repo is on GitHub** before continuing.

### Step 2: Configure Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com) → Your Project (`web`)
2. Click **Settings** → **Environment Variables**
3. Add these variables for all environments (Production, Preview, Development):

```
DATABASE_URL = postgresql://postgres:02402556168Sh@!@db.ebtxozjiwjifmhsmcqzw.supabase.co:5432/postgres
NEXT_PUBLIC_API_URL = (leave empty - uses same domain)
```

### Step 3: Deploy

**Option A: Automatic (Recommended)**
- Any push to `main` on GitHub auto-deploys to Vercel

**Option B: Manual**
1. Go to Vercel Dashboard
2. Click **Deploy**
3. Wait ~3-5 minutes for build

**Check deployment logs** if build fails:
- Vercel Dashboard → Deployments → Click the failed one → Logs

---

## 🧪 PHASE 3: Test Deployed Application

### Test API Health
```bash
curl https://your-vercel-domain.vercel.app/api/health
```
Should return: `{"status":"ok"}`

### Test Database Connection
1. Open your Vercel domain
2. Try to create/scan a product
3. Check if it appears in Supabase:
   - Open [Supabase Dashboard](https://supabase.com)
   - Go to **SQL Editor**
   - Run: `SELECT * FROM products;`

### Test All Endpoints

| Endpoint | Expected |
|----------|----------|
| `/api/health` | `{"status":"ok"}` |
| `/api/products` | List of products |
| `/api/bills` | List of bills |
| `/api/products/barcode/123` | Product or 404 |

---

## 📦 Environment Variables Reference

### Vercel Dashboard Variables

| Variable | Value | Environment |
|----------|-------|-------------|
| `DATABASE_URL` | Your Supabase URI | All |
| `NEXT_PUBLIC_API_URL` | (empty string) | All |

### Local Development (`.env.local`)

```
DATABASE_URL=postgresql://postgres:02402556168Sh@!@db.ebtxozjiwjifmhsmcqzw.supabase.co:5432/postgres
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## ⚠️ Common Issues & Fixes

### "Database connection refused" on Vercel

**Check:**
1. `DATABASE_URL` is set in Vercel Settings → Environment Variables
2. Supabase project is running (check [supabase.com](https://supabase.com))
3. Redeploy after setting environment variables

**Fix: Redeploy**
```bash
# Via Vercel CLI
vercel --prod --force

# Or via Dashboard: Click Redeploy
```

### "Build failed - Missing dependencies"

**Fix:**
```bash
npm install
npm run build:web
```

Test locally first, then push.

### API calls fail with 404

**Check:**
- You're accessing `https://your-domain.vercel.app/api/products` (not a separate URL)
- `NEXT_PUBLIC_API_URL` is empty (to use same domain)

### Prisma client generation fails

**Fix:**
```bash
npm run db:generate
npm run build:web
```

---

## 🎯 Next Steps

1. **Local Test** ✓ (run `npm run dev:web`)
2. **Push to GitHub** ✓ (git push origin main)
3. **Configure Vercel** ✓ (add DATABASE_URL to env vars)
4. **Deploy** ✓ (automatic or manual trigger)
5. **Test on Production** ✓ (verify endpoints work)

---

## ❓ Need Help?

**Database Issues?**
- Check [Supabase Dashboard](https://supabase.com) → Browser → Your tables
- Verify connection string in environment variables

**Deployment Issues?**
- Check [Vercel Dashboard](https://vercel.com) → Deployments → Logs
- Verify environment variables are set correctly

**Application Not Working?**
- Test API: `curl https://your-domain.vercel.app/api/health`
- Check browser console for JavaScript errors
- Check Vercel logs for server errors

