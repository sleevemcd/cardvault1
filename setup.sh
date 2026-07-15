#!/usr/bin/env bash
set -euo pipefail

echo "=== CardVault Setup ==="

# Check Node.js
if ! command -v node &>/dev/null; then
  echo "Node.js is required. Install it first:"
  echo "  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -"
  echo "  apt-get install -y nodejs"
  exit 1
fi

echo "Node.js $(node --version) ✓"
echo "npm $(npm --version) ✓"

# Install dependencies
echo ""
echo "Installing dependencies..."
npm install

# Generate Prisma client & push schema
echo ""
echo "Setting up database..."
npm run db:push -w backend 2>/dev/null || npx prisma db push --force-reset -w backend 2>/dev/null || npx -w backend prisma db push --force-reset

# Seed demo data
echo ""
echo "Seeding demo data..."
npm run db:seed -w backend

# Build web app
echo ""
echo "Building web app..."
npm run build:web 2>/dev/null || (cd web && npx vite build)

# Generate JWT secret
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
if grep -q "change-me" backend/.env 2>/dev/null; then
  sed -i "s/JWT_SECRET=\"change-this-to-a-random-string-for-production\"/JWT_SECRET=\"$JWT_SECRET\"/" backend/.env
  echo "JWT secret generated ✓"
fi

echo ""
echo "======================================"
echo "  CardVault is ready to run!"
echo "======================================"
echo ""
echo "  Start it with:  npm start"
echo "  Open in browser: http://YOUR-NAS-IP:3001"
echo ""
echo "  Demo login:  demo@cardvault.app / demo123"
echo ""
echo "  To share with friends, install cloudflared and run:"
echo "    cloudflared tunnel --url http://localhost:3001"
echo ""
