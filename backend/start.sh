#!/bin/bash
set -e

echo "Starting application..."

# If RESET_DB is set, use db push to force sync schema (ignores migration history)
if [ "$RESET_DB" = "true" ]; then
  echo "Force syncing database schema..."
  npx prisma db push --force-reset --accept-data-loss
  echo "Database schema synced successfully!"
else
  # Try to deploy migrations
  echo "Running database migrations..."
  npx prisma migrate deploy || {
    echo "Migration failed, attempting to resolve failed migrations..."
    # Mark all potentially failed migrations as rolled back
    npx prisma migrate resolve --rolled-back 20260106172033_add_reports_table 2>/dev/null || true
    npx prisma migrate resolve --rolled-back 20260106173500_recreate_payments_table 2>/dev/null || true
    npx prisma migrate resolve --rolled-back 20260106184337_make_due_date_optional 2>/dev/null || true
    npx prisma migrate resolve --rolled-back 20260106200600_add_workouts_table 2>/dev/null || true
    echo "Retrying migrations..."
    npx prisma migrate deploy
  }
fi

echo "Starting Node.js server..."
exec node dist/main
