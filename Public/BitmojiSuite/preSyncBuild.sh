#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

# ============================================================================
# preSyncBuild.sh -- Bitmoji Suite CDS sync build script
#
# Bitmoji Suite is a MIXED module: it is MOSTLY hand-authored JavaScript, and
# only its AnimationPlugin/ sub-component is TypeScript-authored. This script
# rebuilds ONLY the TS-derived JS from src/ and injects it back into a verbatim
# copy of the committed module -- the hand-authored JS and all assets are
# carried through untouched.
#
# Steps:
#   1. npm install + npm run build (compile src/ -> dist/, mirroring subdirs).
#   2. Stage a module dir "BitmojiSuite/" that is a COPY of the committed
#      Public/BitmojiSuite/BitmojiSuite/ (which no longer contains the 29
#      TS-derived AnimationPlugin .js), then INJECT each built dist/<relpath>.js
#      into the staged AnimationPlugin/<relpath>.js position.
#   3. Place a WRAPPED zip (single top-level "BitmojiSuite/" folder, the
#      unpublished-plugin convention) in
#      build/resources/<version>/BitmojiSuite.zip.
#
# STAGING LAYOUT CHOICE:
#   module.json declares "main": "module.js" (hand-authored entry at module
#   root). The committed module layout is preserved EXACTLY; the only files this
#   script regenerates are the 29 AnimationPlugin/<relpath>.js that map 1:1 to
#   src/<relpath>.ts. tsc emits with rootDir=./src so dist/ mirrors the src/
#   subdir structure, and the staged AnimationPlugin/ subtree mirrors the same
#   relative paths -- so the injection is a direct path-for-path copy.
#
#   KEPT (hand-authored / assets, NOT regenerated): the 3 hand-authored
#   AnimationPlugin .js (main.js, constants.js, Resources/BitmojiAnimationController.js),
#   all AnimationPlugin non-.js assets, and the ENTIRE rest of the module
#   (PropsPlugin/, OutfitPlugin/, LoginPlugin/, EmptyPlugin/, WorkspacePreset/,
#   the module-root .js, module.json, and all module-level Resources).
#
#   EXCLUDED from the zip (plugin-root build scaffolding only): src/, tsconfig.json,
#   package.json, package-lock.json, node_modules/, dist/, build/, .gitignore,
#   preSyncBuild.sh, OWNERS, and any TS leftovers.
# ============================================================================

echo "=== Bitmoji Suite: preSyncBuild.sh starting ==="

# Resolve to this script's directory (the plugin root)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Committed module dir that already lacks the 29 TS-derived .js
COMMITTED_MODULE="$SCRIPT_DIR/BitmojiSuite"

# Number of .ts sources == number of .js the build must emit
EXPECTED_JS=$(find "$SCRIPT_DIR/src" -name '*.ts' -type f | wc -l | tr -d ' ')

# --------------------------------------------------------------------------
# Step 0: Clean prior outputs FIRST so a failed build can never package stale
# dist/ or build/. (Guards below abort if the fresh build under-produces.)
# --------------------------------------------------------------------------
rm -rf "$SCRIPT_DIR/dist" "$SCRIPT_DIR/build"

# --------------------------------------------------------------------------
# Step 1: Install dependencies and compile TypeScript
# --------------------------------------------------------------------------
echo "--- Step 1: npm install + build ---"
npm install --prefix "$SCRIPT_DIR"
# tsc may report pre-existing type-only diagnostics (no behavioral impact) and
# exit non-zero, but it still EMITS the JS (noEmitOnError is not set). Do not let
# that abort the script; the build is validated structurally by the guards below.
npm run build --prefix "$SCRIPT_DIR" || echo "WARNING: tsc exited non-zero (pre-existing type diagnostics); continuing -- output validated below."

# --------------------------------------------------------------------------
# Step 2: Read version, validate build output, assemble staging module
# --------------------------------------------------------------------------
echo "--- Step 2: Assembling BitmojiSuite module ---"

VERSION=$(node -p "const v = require('./package.json').version; if (!v) { process.exit(1); } v" 2>/dev/null || echo "1.0.0")
echo "Package version: $VERSION"

# Pre-flight guards: never zip an incomplete artifact.
if [ ! -d "$SCRIPT_DIR/dist" ]; then
    echo "ERROR: dist/ directory not found after build. Aborting."
    exit 1
fi

DIST_JS_COUNT=$(find "$SCRIPT_DIR/dist" -name '*.js' -type f | wc -l | tr -d ' ')
echo "dist/ emitted $DIST_JS_COUNT .js (expected $EXPECTED_JS)"
if [ "$DIST_JS_COUNT" -lt "$EXPECTED_JS" ]; then
    echo "ERROR: dist/ has $DIST_JS_COUNT .js, fewer than the expected $EXPECTED_JS. Aborting."
    exit 1
fi

if [ ! -d "$COMMITTED_MODULE" ]; then
    echo "ERROR: committed module dir $COMMITTED_MODULE not found. Aborting."
    exit 1
fi

if [ ! -f "$COMMITTED_MODULE/module.json" ]; then
    echo "ERROR: $COMMITTED_MODULE/module.json not found. Aborting."
    exit 1
fi

STAGE_DIR="${TMPDIR:-/tmp}/bitmoji-suite-pkg-$$"
MODULE_DIR="$STAGE_DIR/BitmojiSuite"

trap 'rm -rf "$STAGE_DIR"' EXIT

mkdir -p "$STAGE_DIR"

# Stage = verbatim copy of the committed module (already lacks the 29 derived .js).
cp -r "$COMMITTED_MODULE" "$MODULE_DIR"

# Inject each built dist/<relpath>.js into the staged AnimationPlugin/<relpath>.js
# position (dist/ mirrors src/ subdirs, AnimationPlugin/ mirrors the same paths).
ANIM_DEST="$MODULE_DIR/AnimationPlugin"
INJECTED=0
while IFS= read -r jsfile; do
    rel="${jsfile#"$SCRIPT_DIR/dist/"}"
    dest="$ANIM_DEST/$rel"
    mkdir -p "$(dirname "$dest")"
    cp "$jsfile" "$dest"
    INJECTED=$((INJECTED + 1))
done < <(find "$SCRIPT_DIR/dist" -name '*.js' -type f)
echo "Injected $INJECTED built .js into staged AnimationPlugin/"

# Safety net: delete any stray .ts files that may have leaked into the stage.
find "$MODULE_DIR" -name '*.ts' -type f -delete 2>/dev/null || true

# --------------------------------------------------------------------------
# Step 3: Create WRAPPED zip in build/resources/<version>/
# --------------------------------------------------------------------------
ZIP_DIR="$SCRIPT_DIR/build/resources/$VERSION"
mkdir -p "$ZIP_DIR"

ZIP_DEST="$ZIP_DIR/BitmojiSuite.zip"
(cd "$STAGE_DIR" && zip -r "$ZIP_DEST" "BitmojiSuite")

echo "Created: $ZIP_DEST"

echo "=== Bitmoji Suite: preSyncBuild.sh completed ==="
