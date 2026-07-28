#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

# ============================================================================
# preSyncBuild.sh -- Face Mask CDS sync build script
#
# FLAT zip (no wrapper) to reproduce the repo-root default script's output for
# this already-published CDS resource.
#
# Steps:
#   1. npm install + npm run build (compile TypeScript src/ -> dist/, nested)
#   2. Stage a module dir = built dist/ tree (recursive) + all Resources/ trees
#      + module.json + OWNERS
#   3. Zip the module dir's CONTENTS FLAT (entries at zip root, NO wrapper
#      folder) into build/resources/<version>/Face Mask.zip
#
# WHY FLAT (no wrapper):
#   Today Face Mask has no custom preSyncBuild; CDS uses the repo-root default
#   script which zips the (previously committed) module folder's CONTENTS flat
#   -- entries at the zip root: Main.js, common-ui/..., module.json, etc., with
#   NO wrapper folder. This script reproduces that exact layout so the produced
#   package is byte-equivalent to today's live upload. (This differs from Face
#   Animator's wrapped single-folder zip.)
#
#   module.json declares "main": "Main.js", so the compiled JS sits at the zip
#   root beside the Resources/ trees and module.json -- NOT under dist/.
# ============================================================================

echo "=== Face Mask: preSyncBuild.sh starting ==="

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
# Step 2: Read version, validate build outputs, prepare staging area
# --------------------------------------------------------------------------
echo "--- Step 2: Staging module dir ---"

VERSION=$(node -p "const v = require('./package.json').version; if (!v) { process.exit(1); } v" 2>/dev/null || echo "1.0.0")
echo "Package version: $VERSION"

# Pre-flight guards: never zip an incomplete artifact.
if [ ! -d "dist" ] || [ -z "$(find dist -name '*.js' -type f -print -quit)" ]; then
    echo "ERROR: dist/ missing or contains no compiled .js after build. Aborting."
    exit 1
fi

if [ ! -f "module.json" ]; then
    echo "ERROR: module.json not found. Aborting."
    exit 1
fi

STAGE_DIR="${TMPDIR:-/tmp}/face-mask-pkg-$$"
trap 'rm -rf "$STAGE_DIR"' EXIT

mkdir -p "$STAGE_DIR"

# Copy the full built dist/ tree RECURSIVELY (preserves nested subdirs:
# common/, common-ui/, common-ui/controls/, dialog/, generator/, importer/,
# chat-tools/). Use 'cp -r dist/.' (contents), NOT 'cp dist/*.js'.
cp -r dist/. "$STAGE_DIR/"

# Copy ALL shipped Resources trees, mirroring their module-relative positions.
for d in Resources common-ui/Resources dialog/Resources generator/Resources importer/Resources; do
    if [ -d "$d" ]; then
        mkdir -p "$STAGE_DIR/$(dirname "$d")"
        cp -r "$d" "$STAGE_DIR/$(dirname "$d")/"
    fi
done

# Copy the manifest and ownership file.
cp module.json "$STAGE_DIR/"
[ -f OWNERS ] && cp OWNERS "$STAGE_DIR/"

# Safety net: delete any stray .ts that may have leaked into the stage.
find "$STAGE_DIR" -name "*.ts" -type f -delete 2>/dev/null || true

# --------------------------------------------------------------------------
# Step 3: Create FLAT zip in build/resources/<version>/
# --------------------------------------------------------------------------
rm -rf "$SCRIPT_DIR/build"

ZIP_DIR="$SCRIPT_DIR/build/resources/$VERSION"
mkdir -p "$ZIP_DIR"

ZIP_DEST="$ZIP_DIR/Face Mask.zip"

# FLAT: zip the staged dir's CONTENTS with NO wrapper folder (entries at root).
(cd "$STAGE_DIR" && zip -r "$ZIP_DEST" .)

echo "Created: $ZIP_DEST"

echo "=== Face Mask: preSyncBuild.sh completed ==="
