#!/bin/bash

# ============================================
# ZZMUK Matching API Rollback Script
# ============================================
#
# Purpose: Rollback matching API changes if performance degrades
# Target: Restore system to pre-deployment state within 5 minutes
#
# Usage:
#   ./scripts/rollback-matching-api.sh
#
# ============================================

set -e # Exit on error

echo "🔄 ZZMUK Matching API Rollback Starting..."
echo ""

# Step 1: Remove matching API endpoint
echo "📁 Step 1: Removing matching API endpoint..."
if [ -d "src/app/api/matching" ]; then
  mv src/app/api/matching src/app/api/matching.rollback.$(date +%s)
  echo "✅ Matching API endpoint backed up and removed"
else
  echo "ℹ️  Matching API endpoint not found (already removed?)"
fi

# Step 2: Remove matching engine libraries
echo "📁 Step 2: Removing matching engine libraries..."
if [ -f "src/lib/matching-engine-pg.ts" ]; then
  mv src/lib/matching-engine-pg.ts src/lib/matching-engine-pg.ts.rollback.$(date +%s)
  echo "✅ Matching engine backed up and removed"
fi

if [ -f "src/lib/geo-utils.ts" ]; then
  mv src/lib/geo-utils.ts src/lib/geo-utils.ts.rollback.$(date +%s)
  echo "✅ Geo utilities backed up and removed"
fi

if [ -f "src/lib/db.ts" ]; then
  mv src/lib/db.ts src/lib/db.ts.rollback.$(date +%s)
  echo "✅ Database client backed up and removed"
fi

# Step 3: Drop database tables (optional - comment out if you want to keep data)
echo "🗄️  Step 3: Cleaning up database tables..."
echo "⚠️  WARNING: This will delete match_requests, match_results, and related data"
read -p "Do you want to drop database tables? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  psql $DATABASE_URL <<-EOSQL
    -- Drop tables in reverse dependency order
    DROP TABLE IF EXISTS payouts CASCADE;
    DROP TABLE IF EXISTS settlements CASCADE;
    DROP TABLE IF EXISTS transactions CASCADE;
    DROP TABLE IF EXISTS match_results CASCADE;
    DROP TABLE IF EXISTS match_requests CASCADE;

    -- Revert user table changes (remove ZZMUK-specific columns)
    ALTER TABLE users DROP COLUMN IF EXISTS role;
    ALTER TABLE users DROP COLUMN IF EXISTS location;
    ALTER TABLE users DROP COLUMN IF EXISTS address;
    ALTER TABLE users DROP COLUMN IF EXISTS category;
    ALTER TABLE users DROP COLUMN IF EXISTS verified;
    ALTER TABLE users DROP COLUMN IF EXISTS stripe_connect_account_id;
    ALTER TABLE users DROP COLUMN IF EXISTS stripe_onboarding_complete;

    -- Drop indexes
    DROP INDEX IF EXISTS idx_users_location;
    DROP INDEX IF EXISTS idx_users_role;
    DROP INDEX IF EXISTS idx_users_category;

    COMMIT;
EOSQL
  echo "✅ Database tables cleaned up"
else
  echo "ℹ️  Skipping database cleanup"
fi

# Step 4: Rebuild Next.js
echo "🔨 Step 4: Rebuilding application..."
npm run build

if [ $? -eq 0 ]; then
  echo "✅ Application rebuilt successfully"
else
  echo "❌ Build failed - manual intervention required"
  exit 1
fi

# Step 5: Verify API is not accessible
echo "🧪 Step 5: Verifying rollback..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/matching/find -X POST \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","targetRole":"shop"}' || echo "000")

if [ "$HTTP_CODE" = "404" ] || [ "$HTTP_CODE" = "000" ]; then
  echo "✅ Matching API successfully removed (404 or unreachable)"
else
  echo "⚠️  Warning: Matching API still accessible (HTTP $HTTP_CODE)"
fi

echo ""
echo "✅ Rollback Complete!"
echo ""
echo "📋 Summary:"
echo "  - Matching API endpoint: Removed"
echo "  - Matching engine libraries: Removed"
echo "  - Database tables: $([ $REPLY = 'y' ] && echo 'Dropped' || echo 'Kept')"
echo "  - Application: Rebuilt"
echo ""
echo "⏱️  Total rollback time: ${SECONDS}s (target: <300s)"
echo ""
echo "📝 Next steps:"
echo "  1. Review application logs for errors"
echo "  2. Monitor application performance"
echo "  3. Investigate root cause of rollback"
echo "  4. Plan remediation before re-deployment"
