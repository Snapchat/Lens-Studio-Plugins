#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

# ============================================================================
# preSyncBuild.sh -- AI-Video-Transform CDS sync build script
#
# Steps:
#   1. npm install + npm run build (compile TypeScript to dist/)
#   2. Package: create "AI Video Transform/" zip structure (flattened)
#   3. Place zip in build/resources/<version>/AI Video Transform.zip
#
# NAMING NOTE:
#   The plugin DIRECTORY is "AI-Video-Transform" (hyphen) but the shipped MODULE
#   FOLDER and zip file use "AI Video Transform" (space), matching the original
#   module.json name.
#
# STAGING LAYOUT:
#   AI Video Transform uses a FLATTENED single-folder layout.
#   module.json declares "main": "Main.js" so compiled JS must sit directly
#   beside Resources/ and module.json — NOT under a dist/ subfolder.
#
#   Zip contents:
#       AI Video Transform/
#           Main.js          (and 16 other compiled .js files)
#           analytics.js
#           api.js
#           app.js
#           ... (all dist/*.js flattened here)
#           Resources/       (runtime assets)
#           module.json
#
#   Zip filename: "AI Video Transform.zip"
# ============================================================================

echo "=== AI-Video-Transform: preSyncBuild.sh starting ==="

# Resolve to this script's directory (the plugin root)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# --------------------------------------------------------------------------
# Step 1: Install dependencies and compile TypeScript
# --------------------------------------------------------------------------
echo "--- Step 1: npm install + build ---"
npm install --prefix "$SCRIPT_DIR"
npm run build --prefix "$SCRIPT_DIR"

# --------------------------------------------------------------------------
# Step 2: Read version, prepare staging area, create zip
# --------------------------------------------------------------------------
echo "--- Step 2: Creating AI Video Transform.zip ---"

VERSION=$(node -p "const v = require('./package.json').version; if (!v) { process.exit(1); } v" 2>/dev/null || echo "1.0.0")
echo "Package version: $VERSION"

if [ ! -d "dist" ]; then
    echo "ERROR: dist/ directory not found after build. Aborting."
    exit 1
fi

if [ ! -f "module.json" ]; then
    echo "ERROR: module.json not found. Aborting."
    exit 1
fi

if [ ! -d "Resources" ]; then
    echo "ERROR: Resources/ directory not found. Aborting."
    exit 1
fi

STAGE_DIR="${TMPDIR:-/tmp}/ai-video-transform-pkg-$$"
MODULE_DIR="$STAGE_DIR/AI Video Transform"

trap 'rm -rf "$STAGE_DIR"' EXIT

mkdir -p "$MODULE_DIR"

# Flatten: copy compiled .js files directly into the module folder (NOT cp -r dist)
# This mirrors the runtime layout where Main.js sits beside Resources/ and module.json
cp -r dist/. "$MODULE_DIR/"

# Copy runtime assets and manifest
cp -r Resources "$MODULE_DIR/"
cp module.json "$MODULE_DIR/"

# Safety net: delete any stray .ts files that may have leaked into the staged dir
find "$MODULE_DIR" -name "*.ts" -type f -delete 2>/dev/null || true

# --------------------------------------------------------------------------
# Step 3: Create zip in build/resources/<version>/
# --------------------------------------------------------------------------
rm -rf "$SCRIPT_DIR/build"

ZIP_DIR="$SCRIPT_DIR/build/resources/$VERSION"
mkdir -p "$ZIP_DIR"

ZIP_DEST="$ZIP_DIR/AI Video Transform.zip"
(cd "$STAGE_DIR" && zip -r "$ZIP_DEST" "AI Video Transform")

echo "Created: $ZIP_DEST"

echo "=== AI-Video-Transform: preSyncBuild.sh completed ==="
