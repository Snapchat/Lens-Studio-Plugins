#!/usr/bin/env bash
set -euo pipefail

echo "=== Spectacles-Overlay: preSyncBuild.sh starting ==="

# Resolve to this script's directory (the plugin root)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Get version from package.json
VERSION=$(node -p "const v = require('./package.json').version; if (!v) { process.exit(1); } v" 2>/dev/null || echo "1.0.0")
echo "Package version: $VERSION"

# Verify required files exist
if [ ! -f "module.json" ]; then
    echo "ERROR: module.json not found. Aborting."
    exit 1
fi

if [ ! -f "main.js" ]; then
    echo "ERROR: main.js not found. Aborting."
    exit 1
fi

if [ ! -f "SpectaclesOverlay.js" ]; then
    echo "ERROR: SpectaclesOverlay.js not found. Aborting."
    exit 1
fi

# Create staging directory
STAGE_DIR="${TMPDIR:-/tmp}/spectacles-overlay-pkg-$$"
INNER_DIR="$STAGE_DIR/spectacles-overlay-wrapper/spectacles-overlay"

trap 'rm -rf "$STAGE_DIR"' EXIT

mkdir -p "$INNER_DIR"

# Copy required plugin files
echo "--- Copying plugin files ---"
cp module.json "$INNER_DIR/"
cp main.js "$INNER_DIR/"
cp SpectaclesOverlay.js "$INNER_DIR/"
cp config.json "$INNER_DIR/"

if [ -f "README.md" ]; then
    cp README.md "$INNER_DIR/"
fi

# Create build directory and versioned zip directly
rm -rf "$SCRIPT_DIR/build"
mkdir -p "$SCRIPT_DIR/build"

ZIP_DIR="$SCRIPT_DIR/build/resources/$VERSION"
mkdir -p "$ZIP_DIR"

ZIP_DEST="$ZIP_DIR/package.zip"
echo "--- Creating package.zip ---"
(cd "$STAGE_DIR" && zip -r "$ZIP_DEST" spectacles-overlay-wrapper)

echo "Created: $ZIP_DEST"

echo "=== Spectacles-Overlay: preSyncBuild.sh completed ==="
