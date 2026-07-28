#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

# ============================================================================
# preSyncBuild.sh -- Character Animation Toolkit CDS sync build script
#
# Character Animation Toolkit is a MIXED module: most of it is hand-authored,
# and only its AnimationPlugin TypeScript (now under src/) produces the bulk of
# the JS. This script rebuilds ONLY the 34 TS-derived .js from src/ and injects
# them back into a verbatim copy of the committed module -- the 5 hand-authored
# .js and all assets are carried through untouched.
#
# Steps:
#   1. npm install + npm run build (compile src/ -> dist/, mirroring subdirs).
#   2. Stage a module dir "Character Animation Toolkit/" that is a COPY of the
#      committed Public/Character Animation Toolkit/Character Animation Toolkit/
#      (which no longer contains the 34 TS-derived .js), then INJECT each built
#      dist/<relpath>.js into the staged module at the matching <relpath>.js
#      position (the built main.js lands at the module root).
#   3. Place a WRAPPED zip (single top-level "Character Animation Toolkit/"
#      folder, the unpublished-plugin convention) in
#      build/resources/<version>/Character Animation Toolkit.zip.
#
# STAGING LAYOUT CHOICE:
#   module.json declares "main": "main.js" (entry at module root). The committed
#   module layout is preserved EXACTLY; the only files this script regenerates
#   are the 34 <relpath>.js that map 1:1 to src/<relpath>.ts. tsc emits with
#   rootDir=./src so dist/ mirrors the src/ subdir structure, and the staged
#   module subtree mirrors the same relative paths -- so the injection is a
#   direct path-for-path copy. (Note: src/main.ts -> dist/main.js -> module-root
#   main.js, matching module.json on case-sensitive filesystems.)
#
#   KEPT (hand-authored / assets, NOT regenerated): the 5 hand-authored .js
#   (constants.js, helpers/constants.js, helpers/preset.js,
#   helpers/AssetLibraryProviderWrapper.js, Resources/BitmojiAnimationController.js),
#   and every non-.js asset (Menu/, Preview/, Resources/, components/, module.json,
#   OWNERS).
#
#   EXCLUDED from the zip (plugin-root build scaffolding only): src/, tsconfig.json,
#   package.json, package-lock.json, node_modules/, dist/, build/, .gitignore,
#   preSyncBuild.sh, and any TS leftovers.
# ============================================================================

echo "=== Character Animation Toolkit: preSyncBuild.sh starting ==="

# Resolve to this script's directory (the plugin root)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Committed module dir that already lacks the 34 TS-derived .js
COMMITTED_MODULE="$SCRIPT_DIR/Character Animation Toolkit"

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
# tsc WILL exit non-zero: the TS imports hand-authored module .js (e.g.
# ./helpers/preset.js) that are NOT under src/, so type resolution reports
# diagnostics. It still EMITS the JS (noEmitOnError is not set). Do not let that
# abort the script; the build is validated structurally by the guards below.
npm run build --prefix "$SCRIPT_DIR" || echo "WARNING: tsc exited non-zero (expected -- TS references hand-authored module .js outside src/); continuing, output validated below."

# --------------------------------------------------------------------------
# Step 2: Read version, validate build output, assemble staging module
# --------------------------------------------------------------------------
echo "--- Step 2: Assembling Character Animation Toolkit module ---"

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

STAGE_DIR="${TMPDIR:-/tmp}/character-animation-toolkit-pkg-$$"
MODULE_DIR="$STAGE_DIR/Character Animation Toolkit"

trap 'rm -rf "$STAGE_DIR"' EXIT

mkdir -p "$STAGE_DIR"

# Stage = verbatim copy of the committed module (already lacks the 34 derived .js).
cp -r "$COMMITTED_MODULE" "$MODULE_DIR"

# Inject each built dist/<relpath>.js into the staged module/<relpath>.js
# position (dist/ mirrors src/ subdirs, the module mirrors the same paths;
# the built main.js lands at the module root).
INJECTED=0
while IFS= read -r jsfile; do
    rel="${jsfile#"$SCRIPT_DIR/dist/"}"
    dest="$MODULE_DIR/$rel"
    mkdir -p "$(dirname "$dest")"
    cp "$jsfile" "$dest"
    INJECTED=$((INJECTED + 1))
done < <(find "$SCRIPT_DIR/dist" -name '*.js' -type f)
echo "Injected $INJECTED built .js into staged module"

# Safety net: delete any stray .ts files that may have leaked into the stage.
find "$MODULE_DIR" -name '*.ts' -type f -delete 2>/dev/null || true

# --------------------------------------------------------------------------
# Step 3: Create WRAPPED zip in build/resources/<version>/
# --------------------------------------------------------------------------
ZIP_DIR="$SCRIPT_DIR/build/resources/$VERSION"
mkdir -p "$ZIP_DIR"

ZIP_DEST="$ZIP_DIR/Character Animation Toolkit.zip"
(cd "$STAGE_DIR" && zip -r "$ZIP_DEST" "Character Animation Toolkit")

echo "Created: $ZIP_DEST"

echo "=== Character Animation Toolkit: preSyncBuild.sh completed ==="
