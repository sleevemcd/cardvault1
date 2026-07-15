#!/bin/sh
set -e

DB_FILE="backend/prisma/dev.db"

export DATABASE_URL="${DATABASE_URL:-file:./backend/dev.db}"

if [ ! -f "$DB_FILE" ]; then
  echo "No database found. Setting up for first run..."
  JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
  cat > backend/.env << EOF
DATABASE_URL="$DATABASE_URL"
JWT_SECRET="$JWT_SECRET"
EOF
  npx -w backend prisma db push --accept-data-loss
  npx -w backend tsx prisma/seed.ts
  echo "Database initialized and seeded."
else
  echo "Database found. Running migrations..."
  npx -w backend prisma db push --accept-data-loss || true
fi

exec "$@"
