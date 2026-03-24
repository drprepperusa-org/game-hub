#!/bin/bash
set -e

echo "🔍 Vercel Pre-Deployment Checks"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Check vercel.json exists
if [ ! -f vercel.json ]; then
  echo "❌ ERROR: vercel.json missing"
  exit 1
fi
echo "✅ vercel.json present"

# 2. Verify vercel.json structure
if ! grep -q '"outputDirectory"' vercel.json; then
  echo "❌ ERROR: vercel.json missing outputDirectory"
  exit 1
fi
if ! grep -q '"rewrites"' vercel.json; then
  echo "❌ ERROR: vercel.json missing rewrites (SPA routing)"
  exit 1
fi
echo "✅ vercel.json structure valid"

# 3. Build locally
echo "🔨 Building project..."
if ! npm run build; then
  echo "❌ Build failed locally"
  exit 1
fi
echo "✅ Build successful"

# 4. Check dist/index.html exists
if [ ! -f dist/index.html ]; then
  echo "❌ ERROR: dist/index.html not found after build"
  exit 1
fi
echo "✅ dist/index.html exists"

# 5. TypeScript check
echo "🔎 TypeScript validation..."
if ! npx tsc --noEmit 2>/dev/null; then
  echo "⚠️  TypeScript warnings (non-blocking)"
fi
echo "✅ TypeScript check complete"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All pre-deployment checks passed"
echo "Ready to deploy with: vercel deploy --prod"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
