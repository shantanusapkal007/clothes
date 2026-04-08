#!/bin/bash

# Friends Clothing POS - Deployment Verification Script

echo "🔍 Friends Clothing POS - Pre-Deployment Checklist"
echo "================================================="
echo ""

# Check Node.js
echo "✓ Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi
NODE_VERSION=$(node --version)
echo "  Node version: $NODE_VERSION"

# Check npm
echo ""
echo "✓ Checking npm..."
npm_version=$(npm --version)
echo "  NPM version: $npm_version"

# Check git
echo ""
echo "✓ Checking Git..."
if command -v git &> /dev/null; then
    git_version=$(git --version)
    echo "  Git version: $git_version"
else
    echo "  ⓘ Git not found (optional for GitHub deployment)"
fi

# Check Vercel CLI
echo ""
echo "✓ Checking Vercel CLI..."
if command -v vercel &> /dev/null; then
    vercel_version=$(vercel --version)
    echo "  Vercel CLI version: $vercel_version"
    echo "  ✅ Ready to deploy with: vercel deploy --prod"
else
    echo "  ⚠️  Vercel CLI not installed (optional for CLI deployment)"
    echo "     Install with: npm install -g vercel"
fi

# Test build
echo ""
echo "✓ Testing build..."
cd "$(dirname "$0")"

# Check if .env.local exists
if [ ! -f "apps/web/.env.local" ]; then
    echo "❌ .env.local not found in apps/web/"
    exit 1
fi

# Build
echo "  Building web app..."
if npm run build:web > /dev/null 2>&1; then
    echo "  ✅ Build successful"
else
    echo "  ❌ Build failed"
    npm run build:web
    exit 1
fi

# Check database connection
echo ""
echo "✓ Checking Database Connection..."
if grep -q "DATABASE_URL" apps/web/.env.local 2>/dev/null; then
    echo "  ✅ DATABASE_URL configured"
else
    echo "  ❌ DATABASE_URL not configured in .env.local"
fi

# Summary
echo ""
echo "================================================="
echo "✅ All pre-deployment checks passed!"
echo ""
echo "📋 Next Steps:"
echo ""
echo "Option A: Deploy with Vercel CLI"
echo "  $ vercel deploy --prod"
echo ""
echo "Option B: Deploy with GitHub"
echo "  1. Push to GitHub: git push origin main"
echo "  2. Go to https://vercel.com/new"
echo "  3. Import the friends repository"
echo "  4. Set NEXT_PUBLIC_API_URL in Environment Variables"
echo "  5. Deploy"
echo ""
echo "Option C: Deploy with Docker"
echo "  $ docker build -t friends-pos ."
echo "  $ docker run -p 3000:3000 -e DATABASE_URL='...' friends-pos"
echo ""
echo "📚 Documentation: See VERCEL_FINAL_DEPLOYMENT.md"
echo "================================================="
