# Vercel Deployment Guide

## ⚠️ Current Issues

Your project has a **monorepo structure** with two separate services:
1. **Web App** - Next.js frontend (apps/web)
2. **API** - Fastify backend (apps/api)

### The Problem
- Vercel can easily deploy the Next.js web app
- But the Fastify API server needs separate hosting
- The web app tries to call `NEXT_PUBLIC_API_URL` which needs to be configured

## ✅ Solution: Deployment Strategy

### Option 1: Simple Setup (Recommended for Quick Start)
**Deploy only the Web App on Vercel** and run API locally or on another server.

### Option 2: Complete Setup
**Deploy both services** on different Vercel projects or use Vercel Serverless Functions for the API.

---

## 📋 Option 1: Deploy Only Web App (Recommended)

### Step 1: Vercel Configuration
✅ Already created `vercel.json` with correct settings

### Step 2: Environment Variables in Vercel

1. Go to Vercel Dashboard → Your Project
2. Settings → Environment Variables
3. Add these variables:

```
NEXT_PUBLIC_API_URL=http://localhost:4000
(for local testing)

OR

NEXT_PUBLIC_API_URL=https://your-api-domain.com
(for production API server)
```

### Step 3: Deploy Web App

**Option A: Via Vercel CLI**
```bash
npm install -g vercel
cd e:\projects\friends
vercel deploy --prod
```

**Option B: Via GitHub (Recommended)**
1. Push to GitHub (already done ✓)
2. Go to Vercel → Add New Project
3. Select "friends" repository
4. Framework: Next.js (auto-detected)
5. Root Directory: `apps/web`
6. Build Command: `npm run build:web`
7. Add Environment Variable: `NEXT_PUBLIC_API_URL`
8. Deploy

### Step 4: Run API Separately

While web runs on Vercel, run the API locally or on another platform:

```bash
# Option A: Local development
npm run dev:api

# Option B: Production build
npm run build:api
npm start --workspace api

# Option C: Docker
docker build -f apps/api/Dockerfile -t friends-api .
docker run -p 4000:4000 friends-api
```

---

## 📋 Option 2: Complete Deployment (Both Services)

### Part A: Deploy API to Railway/Render/Heroku

#### Using Railway.app (Easiest)

1. Go to https://railway.app
2. Create new project
3. Deploy from GitHub
4. Select your repository
5. Add service:
   - Service Name: "api"
   - Root Directory: `apps/api`
   - Build Command: `npm run build`
   - Start Command: `npm start`

6. Add PostgreSQL database
7. Copy the API URL from Railway dashboard (e.g., `https://api-production-xxxx.railway.app`)

#### Using Render.com

1. Go to https://render.com
2. New Web Service
3. Connect GitHub
4. Select repository
5. Settings:
   - Name: friends-api
   - Root Directory: apps/api
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Environment: Node

### Part B: Deploy Web to Vercel

1. Vercel Dashboard → Add New Project
2. Select "friends" repository
3. Settings:
   - Framework: Next.js
   - Root Directory: `apps/web`
   - Build Command: `npm run build:web`
   
4. Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://api-production-xxxx.railway.app
   (use your actual API domain)
   ```

5. Deploy

---

## 🔑 Environment Variables Reference

### For Web App (Vercel)
```
NEXT_PUBLIC_API_URL=<your-api-domain>
```

### For API Server (Railway/Render/Local)
```
DATABASE_URL=<database-connection-string>
PORT=4000
NODE_ENV=production
```

---

## 🚀 Deployment Checklist

### Before Deploying

- [ ] `vercel.json` created ✓
- [ ] `.vercelignore` created ✓
- [ ] Latest code committed to GitHub ✓
- [ ] All dependencies installed
- [ ] Build works locally:
  ```bash
  npm run build:web
  ```

### For Web App

- [ ] Vercel account created
- [ ] GitHub account connected to Vercel
- [ ] Environment variables set in Vercel
- [ ] Root directory set to `apps/web`
- [ ] Build command: `npm run build:web`
- [ ] Install command: `npm install`

### For API Server (if separate deployment)

- [ ] Select hosting platform (Railway/Render/Heroku)
- [ ] Connect GitHub
- [ ] Set environment variables
- [ ] Database created and connected
- [ ] API URL obtained
- [ ] Update `NEXT_PUBLIC_API_URL` in Vercel with API domain

---

## 🔧 Local Testing Before Deploy

### Test web app works with API:

```bash
# Terminal 1: Run API
npm run dev:api

# Terminal 2: Run Web App
npm run dev:web
```

Then open http://localhost:3000

If it works locally, it will work on Vercel!

---

## 🐛 Troubleshooting

### Build fails with "workspace not found"
**Solution**: Make sure root package.json has workspaces defined (✓ already done)

### API calls return 404
**Solution**: Check `NEXT_PUBLIC_API_URL` environment variable is set correctly

### CORS errors
**Solution**: API has CORS enabled. If issues persist, check apps/api/src/app.ts

### Vercel build says "module not found"
**Solution**: 
1. Check `apps/web/package.json` has all dependencies
2. Run `npm install` locally and verify build works
3. Clear Vercel cache and redeploy

### API endpoint not responding
**Solution**: Verify database is connected
```bash
npm run db:migrate:deploy --workspace api
```

---

## 📊 Recommended Architecture

```
Frontend (Web)
├─ Vercel (Next.js)
└─ NEXT_PUBLIC_API_URL → Production API

Backend (API)
├─ Railway / Render / Heroku (Fastify)
├─ PostgreSQL Database
└─ Listening on /api/*
```

---

## 🎯 Quick Start Commands

### For Option 1 (Web only on Vercel):
```bash
# 1. Deploy web to Vercel
vercel deploy --prod

# 2. Run API locally (during development)
npm run dev:api

# 3. Or on production server
npm run build:api && npm start --workspace api
```

### For Option 2 (Both deployed):
```bash
# 1. Deploy API to Railway
# (Follow Railway deployment steps above)

# 2. Add API URL to Vercel env vars

# 3. Deploy web to Vercel
vercel deploy --prod
```

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Railway.app Docs](https://docs.railway.app)
- [Render Deployment](https://render.com/docs)
- [Fastify Production Guide](https://www.fastify.io/docs/latest/Guides/Deploying/)

---

**Status**: Ready to deploy! Choose Option 1 or 2 above and follow the steps.
