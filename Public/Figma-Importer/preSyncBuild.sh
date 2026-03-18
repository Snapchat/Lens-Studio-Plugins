#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

# ============================================================================
# preSyncBuild.sh -- Figma Importer CDS sync build script
#
# Steps:
#   1. npm install + npm run build (compile TypeScript to dist/)
#   2. Package: create figma-importer-wrapper/figma-importer/ zip structure
#   3. Place zip in storage/resources/<version>/package.zip
#   4. Commit storage/ changes in CI (following AiAssistantV2 pattern)
#   5. Copy storage/ -> build/ for CDS upload
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

VERSION=$(node -p "require('./package.json').version")
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

# Safety net: ensure no .ts source files leaked into dist/
find "$INNER_DIR/dist" -name "*.ts" -type f -delete 2>/dev/null || true

# Create the zip
ZIP_DIR="$SCRIPT_DIR/storage/resources/$VERSION"
mkdir -p "$ZIP_DIR"

ZIP_DEST="$ZIP_DIR/package.zip"
rm -f "$ZIP_DEST"

(cd "$STAGE_DIR" && zip -r "$ZIP_DEST" figma-importer-wrapper)

echo "Created: $ZIP_DEST"

# --------------------------------------------------------------------------
# Step 3: Commit storage/ changes in CI (following AiAssistantV2 pattern)
# --------------------------------------------------------------------------
if [ -n "${USER:-}" ] && [ "$USER" == "snapci" ]; then
    REPO_ROOT="$(git rev-parse --show-toplevel)"
    "$REPO_ROOT/ci/commit_as_needed.sh" "./storage/" "Build: Update Figma-Importer storage assets"
else
    echo "Skipping commit (not running in SnapCI)"
fi

# --------------------------------------------------------------------------
# Step 4: Copy storage/ to build/ for CDS upload
# --------------------------------------------------------------------------
echo "--- Step 4: Copying storage/ to build/ ---"

rm -rf "$SCRIPT_DIR/build"
mkdir -p "$SCRIPT_DIR/build"
rsync -av --exclude=".*" "$SCRIPT_DIR/storage/" "$SCRIPT_DIR/build/"

echo "=== Figma-Importer: preSyncBuild.sh completed ==="
