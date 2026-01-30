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
  npx prisma migrate deploy
fi

echo "Starting Node.js server..."
exec node dist/main
