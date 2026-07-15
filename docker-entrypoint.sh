#!/bin/sh
set -e

DB_FILE="backend/dev.db"

if [ ! -f "$DB_FILE" ]; then
  echo "No database found. Setting up for first run..."
  JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
  export JWT_SECRET
  npx -w backend prisma db push --accept-data-loss
  npx -w backend tsx prisma/seed.ts
  echo "Database initialized and seeded."
else
  echo "Database found. Running migrations..."
  npx -w backend prisma db push --accept-data-loss || true
fi

exec "$@"
