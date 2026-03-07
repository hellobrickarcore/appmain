#!/bin/bash
# Zip all files and move to antigravity folder

echo "📦 Zipping HelloBrick project..."
cd /Users/akeemojuko/Downloads

# Create zip with timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ZIP_NAME="hellobrick_backup_${TIMESTAMP}.zip"

# Zip the entire hellobrick folder
zip -r "$ZIP_NAME" hellobrick/ -x "*.DS_Store" "*/__pycache__/*" "*/node_modules/*" "*/build/*" "*/dist/*" "*.log"

echo "✅ Created: $ZIP_NAME"

# Move to antigravity (create if doesn't exist)
ANTIGRAVITY_DIR="$HOME/antigravity"
mkdir -p "$ANTIGRAVITY_DIR"
mv "$ZIP_NAME" "$ANTIGRAVITY_DIR/"

echo "✅ Moved to: $ANTIGRAVITY_DIR/$ZIP_NAME"
echo "📁 Total size: $(du -h "$ANTIGRAVITY_DIR/$ZIP_NAME" | cut -f1)"
