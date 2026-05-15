#!/usr/bin/env bash
# smoke-test.sh — Phase 10 production readiness checks
# Run from repo root: bash scripts/smoke-test.sh
# Exits 0 if all checks pass, 1 if any fail.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PASS=0
FAIL=0

green='\033[0;32m'
red='\033[0;31m'
reset='\033[0m'

pass() { echo -e "${green}PASS${reset}  $1"; PASS=$((PASS + 1)); }
fail() { echo -e "${red}FAIL${reset}  $1"; FAIL=$((FAIL + 1)); }

echo "SPD Compliance App — Smoke Test"
echo "================================"
echo ""

# ── 1. package.json exists ──────────────────────────────────────────────────
if [ -f "$REPO_ROOT/package.json" ]; then
  pass "package.json exists"
else
  fail "package.json missing — project may not be a valid Node app"
fi

# ── 2. node_modules installed ──────────────────────────────────────────────
if [ -d "$REPO_ROOT/node_modules" ]; then
  pass "node_modules present"
else
  fail "node_modules missing — run 'pnpm install' before deploying"
fi

# ── 3. Required routes exist ────────────────────────────────────────────────
REQUIRED_ROUTES=(
  "app/(app)/dashboard/page.tsx"
  "app/(app)/audits/page.tsx"
  "app/(app)/audits/[id]/results/page.tsx"
  "app/(app)/checklists/page.tsx"
  "app/(app)/checklists/new/page.tsx"
  "app/(app)/findings/page.tsx"
  "app/(app)/analytics/page.tsx"
  "app/(app)/import/page.tsx"
  "app/(app)/reports/page.tsx"
  "app/(app)/settings/page.tsx"
  "app/(auth)/login/page.tsx"
  "app/(auth)/signup/page.tsx"
  "app/api/generate-report/route.ts"
  "app/checklist/page.tsx"
)

all_routes_ok=true
for route in "${REQUIRED_ROUTES[@]}"; do
  if [ ! -f "$REPO_ROOT/$route" ]; then
    fail "Route missing: $route"
    all_routes_ok=false
  fi
done
if $all_routes_ok; then
  pass "All required route files present (${#REQUIRED_ROUTES[@]} checked)"
fi

# ── 4. .env.example exists and documents ANTHROPIC_API_KEY ─────────────────
if [ -f "$REPO_ROOT/.env.example" ]; then
  pass ".env.example exists"
  if grep -q "ANTHROPIC_API_KEY" "$REPO_ROOT/.env.example"; then
    pass ".env.example documents ANTHROPIC_API_KEY"
  else
    fail ".env.example is missing ANTHROPIC_API_KEY documentation"
  fi
else
  fail ".env.example missing — env vars are undocumented"
  fail ".env.example missing ANTHROPIC_API_KEY documentation (file absent)"
fi

# ── 5. .env.example documents NEXT_PUBLIC_SUPABASE_URL ──────────────────────
if grep -q "NEXT_PUBLIC_SUPABASE_URL" "$REPO_ROOT/.env.example" 2>/dev/null; then
  pass ".env.example documents NEXT_PUBLIC_SUPABASE_URL"
else
  fail ".env.example is missing NEXT_PUBLIC_SUPABASE_URL"
fi

# ── 6. No .env or .env.local committed to git ───────────────────────────────
if git -C "$REPO_ROOT" ls-files | grep -qE '^\.env$|^\.env\.local$|^\.env\.production$'; then
  fail "Secret .env file(s) are tracked by git — remove them immediately"
else
  pass "No secret .env files committed to git"
fi

# ── 7. No NEXT_PUBLIC_ prefix on secret keys ───────────────────────────────
if grep -rq "NEXT_PUBLIC_ANTHROPIC\|NEXT_PUBLIC_.*SECRET\|NEXT_PUBLIC_.*SERVICE_ROLE" \
    "$REPO_ROOT/app/" "$REPO_ROOT/lib/" 2>/dev/null; then
  fail "Secret key exposed via NEXT_PUBLIC_ prefix (would leak to browser bundle)"
else
  pass "No secret keys exposed via NEXT_PUBLIC_ prefix"
fi

# ── 8. middleware.ts protects authenticated routes ──────────────────────────
if [ -f "$REPO_ROOT/middleware.ts" ]; then
  if grep -q "isProtectedRoute" "$REPO_ROOT/middleware.ts" || \
     grep -q "isProtectedRoute" "$REPO_ROOT/lib/supabase/middleware.ts" 2>/dev/null; then
    pass "middleware.ts has route protection logic"
  else
    fail "middleware.ts exists but may not protect authenticated routes"
  fi
else
  fail "middleware.ts missing — all routes are publicly accessible"
fi

# ── 9. API route has auth guard ─────────────────────────────────────────────
if grep -q "Unauthorized\|auth.getUser\|getUser" "$REPO_ROOT/app/api/generate-report/route.ts" 2>/dev/null; then
  pass "generate-report API route has auth guard"
else
  fail "generate-report API route has no auth guard — unauthenticated access possible"
fi

# ── 10. TypeScript check (if tsc is available) ──────────────────────────────
TSC_BIN="$REPO_ROOT/node_modules/.bin/tsc"
if [ -f "$TSC_BIN" ] && [ -f "$REPO_ROOT/tsconfig.json" ]; then
  if "$TSC_BIN" --noEmit --project "$REPO_ROOT/tsconfig.json" 2>/dev/null; then
    pass "tsc --noEmit passed — no TypeScript errors"
  else
    fail "TypeScript errors found — run 'pnpm tsc --noEmit' to see details"
  fi
else
  echo "SKIP  TypeScript check (tsc binary or tsconfig.json not found)"
fi

# ── Summary ─────────────────────────────────────────────────────────────────
echo ""
echo "================================"
echo "Results: ${PASS} passed, ${FAIL} failed"
echo "================================"

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
exit 0
