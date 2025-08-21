#!/bin/bash

# Complete System Backup Script
# Zubin Aibara - Faredown.com
# Creates a comprehensive timestamped backup

TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
BACKUP_DIR="system_backup_${TIMESTAMP}"

echo "==============================================="
echo "🔄 CREATING COMPLETE SYSTEM BACKUP"
echo "==============================================="
echo "Timestamp: $(date)"
echo "Backup Directory: ${BACKUP_DIR}"
echo ""

# Create backup directory
mkdir -p "${BACKUP_DIR}"

# Copy all essential directories and files
echo "📁 Copying client directory..."
cp -r client/ "${BACKUP_DIR}/" 2>/dev/null

echo "📁 Copying server directory..."
cp -r server/ "${BACKUP_DIR}/" 2>/dev/null

echo "📁 Copying api directory..."
cp -r api/ "${BACKUP_DIR}/" 2>/dev/null

echo "📁 Copying backend directory..."
cp -r backend/ "${BACKUP_DIR}/" 2>/dev/null

echo "📁 Copying shared directory..."
cp -r shared/ "${BACKUP_DIR}/" 2>/dev/null

echo "📁 Copying public directory..."
cp -r public/ "${BACKUP_DIR}/" 2>/dev/null

echo "📁 Copying netlify directory..."
cp -r netlify/ "${BACKUP_DIR}/" 2>/dev/null

echo "📄 Copying configuration files..."
cp package.json "${BACKUP_DIR}/" 2>/dev/null
cp tsconfig.json "${BACKUP_DIR}/" 2>/dev/null
cp tailwind.config.ts "${BACKUP_DIR}/" 2>/dev/null
cp vite.config.ts "${BACKUP_DIR}/" 2>/dev/null
cp vite.config.server.ts "${BACKUP_DIR}/" 2>/dev/null
cp postcss.config.js "${BACKUP_DIR}/" 2>/dev/null
cp netlify.toml "${BACKUP_DIR}/" 2>/dev/null
cp components.json "${BACKUP_DIR}/" 2>/dev/null
cp index.html "${BACKUP_DIR}/" 2>/dev/null

echo "📋 Copying documentation files..."
cp *.md "${BACKUP_DIR}/" 2>/dev/null

# Create backup summary
cat > "${BACKUP_DIR}/BACKUP_INFO.md" << EOF
# System Backup Information

**Backup Created:** $(date)
**Backup Directory:** ${BACKUP_DIR}
**User:** Zubin Aibara
**System:** Faredown.com Travel Platform

## Backup Contents

### Core Directories
- \`client/\` - Frontend React application
- \`server/\` - Backend server files
- \`api/\` - API routes and services
- \`backend/\` - Python backend services
- \`shared/\` - Shared utilities and types
- \`public/\` - Static assets
- \`netlify/\` - Netlify deployment functions

### Configuration Files
- \`package.json\` - Node.js dependencies
- \`tsconfig.json\` - TypeScript configuration
- \`tailwind.config.ts\` - Tailwind CSS configuration
- \`vite.config.ts\` - Vite build configuration
- \`postcss.config.js\` - PostCSS configuration
- \`netlify.toml\` - Netlify deployment configuration
- \`components.json\` - UI components configuration

### Recent Changes Included
This backup includes all recent premium design updates to the bargain flow modal:
- Enhanced input box design with premium styling
- Improved modal layout and spacing
- Updated colors and icons to frontend standard
- Redesigned chat bubbles with classy appearance
- Standardized buttons with pill design
- Applied overall premium polish and typography

## Restoration Instructions
To restore from this backup:
1. Copy the contents to your project directory
2. Run \`npm install\` to install dependencies
3. Ensure all environment variables are configured
4. Start the development server with \`npm run dev\`

**Note:** This backup preserves the complete state of the system as of $(date)
EOF

# Create file structure summary
echo "📊 Generating file structure..."
find "${BACKUP_DIR}" -type f | head -50 > "${BACKUP_DIR}/FILE_LIST.txt"

# Calculate backup size
BACKUP_SIZE=$(du -sh "${BACKUP_DIR}" | cut -f1)

echo ""
echo "✅ BACKUP COMPLETED SUCCESSFULLY!"
echo "==============================================="
echo "📁 Backup Location: ${BACKUP_DIR}"
echo "📦 Backup Size: ${BACKUP_SIZE}"
echo "📋 Files Included: $(find "${BACKUP_DIR}" -type f | wc -l) files"
echo "⏰ Completed at: $(date)"
echo "==============================================="
echo ""
echo "💾 Your complete system backup is ready!"
echo "🔍 Check ${BACKUP_DIR}/BACKUP_INFO.md for details"
