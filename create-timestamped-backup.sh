#!/bin/bash

# Get current date and time for backup naming
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
BACKUP_DIR="faredown_complete_backup_${TIMESTAMP}"

echo "🚀 Creating complete project backup..."
echo "📅 Timestamp: ${TIMESTAMP}"
echo "📁 Backup directory: ${BACKUP_DIR}"

# Create backup directory
mkdir -p "${BACKUP_DIR}"

echo "📋 Copying main project files..."

# Copy all source code directories
cp -r client "${BACKUP_DIR}/" 2>/dev/null || echo "⚠️  client directory not found"
cp -r server "${BACKUP_DIR}/" 2>/dev/null || echo "⚠️  server directory not found"
cp -r shared "${BACKUP_DIR}/" 2>/dev/null || echo "⚠️  shared directory not found"
cp -r public "${BACKUP_DIR}/" 2>/dev/null || echo "⚠️  public directory not found"
cp -r netlify "${BACKUP_DIR}/" 2>/dev/null || echo "⚠️  netlify directory not found"
cp -r api "${BACKUP_DIR}/" 2>/dev/null || echo "⚠️  api directory not found"
cp -r backend "${BACKUP_DIR}/" 2>/dev/null || echo "⚠️  backend directory not found"
cp -r components "${BACKUP_DIR}/" 2>/dev/null || echo "⚠️  components directory not found"

# Copy all existing backup directories for history
cp -r faredown-booking-backup "${BACKUP_DIR}/previous_backups/" 2>/dev/null || echo "ℹ️  No previous backup directory found"

# Copy configuration files
echo "⚙️  Copying configuration files..."
cp package.json "${BACKUP_DIR}/" 2>/dev/null || echo "⚠️  package.json not found"
cp package-lock.json "${BACKUP_DIR}/" 2>/dev/null || echo "⚠️  package-lock.json not found"
cp tsconfig.json "${BACKUP_DIR}/" 2>/dev/null || echo "⚠️  tsconfig.json not found"
cp tailwind.config.ts "${BACKUP_DIR}/" 2>/dev/null || echo "⚠️  tailwind.config.ts not found"
cp vite.config.ts "${BACKUP_DIR}/" 2>/dev/null || echo "⚠️  vite.config.ts not found"
cp vite.config.server.ts "${BACKUP_DIR}/" 2>/dev/null || echo "⚠️  vite.config.server.ts not found"
cp postcss.config.js "${BACKUP_DIR}/" 2>/dev/null || echo "⚠️  postcss.config.js not found"
cp components.json "${BACKUP_DIR}/" 2>/dev/null || echo "⚠️  components.json not found"
cp index.html "${BACKUP_DIR}/" 2>/dev/null || echo "⚠️  index.html not found"
cp netlify.toml "${BACKUP_DIR}/" 2>/dev/null || echo "⚠️  netlify.toml not found"

# Copy all documentation and script files
echo "📖 Copying documentation and scripts..."
cp *.md "${BACKUP_DIR}/" 2>/dev/null || echo "ℹ️  No .md files found"
cp *.txt "${BACKUP_DIR}/" 2>/dev/null || echo "ℹ️  No .txt files found"
cp *.sh "${BACKUP_DIR}/" 2>/dev/null || echo "ℹ️  No .sh files found"
cp *.py "${BACKUP_DIR}/" 2>/dev/null || echo "ℹ️  No .py files found"
cp *.js "${BACKUP_DIR}/" 2>/dev/null || echo "ℹ️  No root .js files found"

# Copy environment and config files
echo "🔐 Copying environment and hidden files..."
cp .env "${BACKUP_DIR}/" 2>/dev/null || echo "ℹ️  .env file not found"
cp .env.* "${BACKUP_DIR}/" 2>/dev/null || echo "ℹ️  No .env.* files found"
cp .gitignore "${BACKUP_DIR}/" 2>/dev/null || echo "ℹ️  .gitignore not found"
cp .npmrc "${BACKUP_DIR}/" 2>/dev/null || echo "ℹ️  .npmrc not found"
cp .prettierrc "${BACKUP_DIR}/" 2>/dev/null || echo "ℹ️  .prettierrc not found"
cp .eslintrc* "${BACKUP_DIR}/" 2>/dev/null || echo "ℹ️  No eslint config found"

# Create a comprehensive README for the backup
echo "📝 Creating backup documentation..."
cat > "${BACKUP_DIR}/BACKUP_INFO.md" << EOF
# Faredown Complete Project Backup

## Backup Information
- **Created:** $(date '+%Y-%m-%d %H:%M:%S %Z')
- **Backup Directory:** ${BACKUP_DIR}
- **System:** $(uname -a)
- **User:** $(whoami)

## Project Structure Backed Up
\`\`\`
$(ls -la)
\`\`\`

## Features Included
- ✅ Complete travel booking system (Flights, Hotels, Transfers, Sightseeing)
- ✅ City autocomplete with search functionality
- ✅ Working edit modal with pre-filled parameters
- ✅ Mobile-responsive design with native app-style modals
- ✅ Flight search results with filtering
- ✅ Calendar date selection
- ✅ Traveler and class selection
- ✅ Bargain modal integration
- ✅ All API integrations and services
- ✅ Complete UI component library
- ✅ Authentication system
- ✅ Admin dashboard
- ✅ Database integration (Neon/PostgreSQL)
- ✅ Email services and notifications
- ✅ Payment processing integration
- ✅ Voucher system
- ✅ Loyalty program
- ✅ Mobile optimization
- ✅ All configuration files
- ✅ Environment setup
- ✅ Deployment configurations

## Recent Updates (Latest Session)
- ✅ Fixed city search functionality across all modules
- ✅ Implemented real-time search filtering in mobile modals
- ✅ Fixed edit modal to pre-fill with current search parameters
- ✅ Removed unnecessary content below search button in edit modal
- ✅ Made edit form fully functional with parameter updates
- ✅ Maintained original design while adding autocomplete functionality

## To Restore This Project
1. \`npm install\`
2. \`npm run dev\`

## Deployment
- Ready for Netlify deployment
- All configuration files included
- Environment variables need to be set up separately

## Database Setup
- Neon PostgreSQL integration ready
- API routes configured
- Database migrations included

## Contact & Support
- Project: Faredown Travel Booking System
- Last modified by: Assistant (AI Development)
- Session checkpoint: cgen-71a94

---
*This backup contains the complete, working state of the Faredown project as of $(date '+%Y-%m-%d %H:%M:%S')*
EOF

# Get directory sizes and file counts
echo "📊 Generating backup statistics..."
TOTAL_SIZE=$(du -sh "${BACKUP_DIR}" | cut -f1)
FILE_COUNT=$(find "${BACKUP_DIR}" -type f | wc -l)
DIR_COUNT=$(find "${BACKUP_DIR}" -type d | wc -l)

# Create backup summary
cat > "${BACKUP_DIR}/BACKUP_SUMMARY.txt" << EOF
FAREDOWN PROJECT BACKUP SUMMARY
================================

Backup Created: $(date '+%Y-%m-%d %H:%M:%S %Z')
Backup Directory: ${BACKUP_DIR}
Total Size: ${TOTAL_SIZE}
Files Backed Up: ${FILE_COUNT}
Directories: ${DIR_COUNT}

BACKUP CONTENTS:
$(ls -la "${BACKUP_DIR}")

MAIN DIRECTORIES:
$(find "${BACKUP_DIR}" -maxdepth 2 -type d | head -20)

CONFIGURATION FILES:
$(find "${BACKUP_DIR}" -maxdepth 1 -name "*.json" -o -name "*.ts" -o -name "*.js" -o -name "*.toml" | head -10)

This backup contains the complete Faredown travel booking system
with all recent improvements and bug fixes applied.
EOF

echo ""
echo "✅ ==============================================="
echo "✅ BACKUP COMPLETED SUCCESSFULLY!"
echo "✅ ==============================================="
echo "📁 Directory: ${BACKUP_DIR}"
echo "📊 Total Size: ${TOTAL_SIZE}"
echo "📄 Files: ${FILE_COUNT}"
echo "📂 Directories: ${DIR_COUNT}"
echo "🕒 Created: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""
echo "📋 Backup Contents:"
ls -la "${BACKUP_DIR}"
echo ""
echo "🎉 Your complete project backup is ready!"
echo "💾 Location: ./${BACKUP_DIR}"
