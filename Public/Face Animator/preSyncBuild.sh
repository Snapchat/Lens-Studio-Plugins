#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

# ============================================================================
# preSyncBuild.sh -- Face Animator CDS sync build script
#
# Steps:
#   1. npm install + npm run build (compile TypeScript to dist/)
#   2. Package: create "Face Animator/" zip structure (flattened)
#   3. Place zip in build/resources/<version>/Face Animator.zip
#
# STAGING LAYOUT CHOICE:
#   Face Animator uses a FLATTENED single-folder layout (unlike Figma-Importer's
#   dist-prefixed double-wrapper). This is because module.json declares:
#       "main": "Main.js"
#   so the compiled JS must sit directly beside Resources/ and module.json —
#   NOT under a dist/ subfolder.
#
#   Zip contents:
#       Face Animator/
#           Main.js          (and 14 other compiled .js files)
#           AnimatorPage.js
#           ... (all dist/*.js flattened here)
#           Resources/       (runtime assets)
#           module.json
#
#   Zip filename: "Face Animator.zip"  (<PluginDir>.zip convention)
#
#   Wrapper nesting to be confirmed against CDS expectations when `toCDS` is
#   wired (deferred); Figma uses a dist-prefixed double-wrapper variant — ours
#   is flattened single-folder because module.json main is `Main.js`.
# ============================================================================

echo "=== Face Animator: preSyncBuild.sh starting ==="

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
echo "--- Step 2: Creating Face Animator.zip ---"

VERSION=$(node -p "const v = require('./package.json').version; if (!v) { process.exit(1); } v" 2>/dev/null || echo "1.0.0")
echo "Package version: $VERSION"

if [ ! -d "dist" ] || [ -z "$(find dist -name '*.js' -print -quit)" ]; then
    echo "ERROR: dist/ missing or contains no compiled .js after build. Aborting."
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

STAGE_DIR="${TMPDIR:-/tmp}/face-animator-pkg-$$"
MODULE_DIR="$STAGE_DIR/Face Animator"

trap 'rm -rf "$STAGE_DIR"' EXIT

mkdir -p "$MODULE_DIR"

# Copy compiled JS into the module root, preserving any subdirs (cp -r dist/. — NOT cp -r dist,
# which would nest a dist/ folder). Mirrors the runtime layout where Main.js sits beside
# Resources/ and module.json. Matches the AI Portraits / AI-Clips flat-plugin scripts.
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

ZIP_DEST="$ZIP_DIR/Face Animator.zip"
(cd "$STAGE_DIR" && zip -r "$ZIP_DEST" "Face Animator")

echo "Created: $ZIP_DEST"

echo "=== Face Animator: preSyncBuild.sh completed ==="
