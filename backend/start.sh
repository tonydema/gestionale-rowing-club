#!/bin/bash
set -e

echo "Starting application..."

# If RESET_DB is set, reset the database
if [ "$RESET_DB" = "true" ]; then
  echo "Resetting database..."
  npx prisma migrate reset --force
else
  # Try to deploy migrations, if it fails due to failed migration, resolve it
  echo "Running database migrations..."
  npx prisma migrate deploy || {
    echo "Migration failed, attempting to resolve..."
    # Get failed migration name and resolve it
    npx prisma migrate resolve --rolled-back 20260106172033_add_reports_table 2>/dev/null || true
    npx prisma migrate deploy
  }
fi

echo "Starting Node.js server..."
exec node dist/main
