#!/bin/bash

# Create a backup directory
mkdir -p code-backup

# Copy all important files and directories except node_modules, .git, and dist
cp -r client code-backup/
cp -r server code-backup/
cp -r shared code-backup/
cp -r public code-backup/
cp -r netlify code-backup/
cp *.md code-backup/
cp *.json code-backup/
cp *.js code-backup/
cp *.ts code-backup/
cp *.html code-backup/
cp .env code-backup/ 2>/dev/null || true
cp .gitignore code-backup/ 2>/dev/null || true
cp .npmrc code-backup/ 2>/dev/null || true
cp .prettierrc code-backup/ 2>/dev/null || true

echo "Backup created in code-backup directory"
echo "Files backed up:"
ls -la code-backup/
