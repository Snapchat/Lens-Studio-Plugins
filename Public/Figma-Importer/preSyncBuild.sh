#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

# ============================================================================
# preSyncBuild.sh -- Figma Importer CDS sync build script
#
# Steps:
#   1. npm install + npm run build (compile TypeScript to dist/)
#   2. Package: create figma-importer-wrapper/figma-importer/ zip structure
#   3. Place zip in build/resources/<version>/package.zip
# ============================================================================

echo "=== Figma-Importer: preSyncBuild.sh starting ==="

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
echo "--- Step 2: Creating package.zip ---"

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

STAGE_DIR="${TMPDIR:-/tmp}/figma-importer-pkg-$$"
INNER_DIR="$STAGE_DIR/figma-importer-wrapper/figma-importer"

trap 'rm -rf "$STAGE_DIR"' EXIT

mkdir -p "$INNER_DIR"

# Copy required plugin files into the staging structure
cp -r dist "$INNER_DIR/"
cp module.json "$INNER_DIR/"
cp README.md "$INNER_DIR/"

# UI/ contains runtime assets referenced by dist/main.js via ../UI/
if [ -d "UI" ]; then
    cp -r UI "$INNER_DIR/"
    echo "Included UI/ directory (runtime assets for dist/main.js)"
else
    echo "WARNING: UI/ directory not found -- plugin UI assets will be missing"
fi

# assets/ contains shader graphs and scripts referenced at runtime
if [ -d "assets" ]; then
    cp -r assets "$INNER_DIR/"
    echo "Included assets/ directory (shader graphs and scripts)"
else
    echo "WARNING: assets/ directory not found -- shader graphs will be missing"
fi

# Safety net: ensure no .ts source files leaked into dist/
find "$INNER_DIR/dist" -name "*.ts" -type f -delete 2>/dev/null || true

# --------------------------------------------------------------------------
# Step 3: Create zip directly in build/
# --------------------------------------------------------------------------
rm -rf "$SCRIPT_DIR/build"
mkdir -p "$SCRIPT_DIR/build"

ZIP_DIR="$SCRIPT_DIR/build/resources/$VERSION"
mkdir -p "$ZIP_DIR"

ZIP_DEST="$ZIP_DIR/package.zip"
(cd "$STAGE_DIR" && zip -r "$ZIP_DEST" figma-importer-wrapper)

echo "Created: $ZIP_DEST"

echo "=== Figma-Importer: preSyncBuild.sh completed ==="
