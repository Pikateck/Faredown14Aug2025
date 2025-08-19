#!/bin/bash

# Create backup directory
mkdir -p faredown-booking-backup

# Copy all source code directories
cp -r client faredown-booking-backup/
cp -r server faredown-booking-backup/
cp -r shared faredown-booking-backup/
cp -r public faredown-booking-backup/
cp -r netlify faredown-booking-backup/

# Copy configuration files
cp package.json faredown-booking-backup/
cp package-lock.json faredown-booking-backup/
cp tsconfig.json faredown-booking-backup/
cp tailwind.config.ts faredown-booking-backup/
cp vite.config.ts faredown-booking-backup/
cp vite.config.server.ts faredown-booking-backup/
cp postcss.config.js faredown-booking-backup/
cp components.json faredown-booking-backup/
cp index.html faredown-booking-backup/
cp netlify.toml faredown-booking-backup/

# Copy documentation files
cp *.md faredown-booking-backup/ 2>/dev/null || true

# Copy environment files
cp .env faredown-booking-backup/ 2>/dev/null || true
cp .gitignore faredown-booking-backup/ 2>/dev/null || true
cp .npmrc faredown-booking-backup/ 2>/dev/null || true
cp .prettierrc faredown-booking-backup/ 2>/dev/null || true

echo "✅ Backup created in faredown-booking-backup directory"
echo "📁 Files included:"
ls -la faredown-booking-backup/

# Create a simple README for the backup
cat > faredown-booking-backup/README.md << EOF
# Faredown Booking System - Complete Backup

## Features Included
- ✅ Complete travel booking system
- ✅ Hotel search and booking
- ✅ Working calendar with date selection
- ✅ Share functionality (WhatsApp, Twitter, Facebook)
- ✅ Pricing system (no decimals)
- ✅ Responsive design
- ✅ All components and pages

## To Run This Project
1. npm install
2. npm run dev

## Deployment
- Ready for Netlify deployment
- All configuration files included

Generated on: $(date)
EOF

echo "✅ Backup complete with README!"
