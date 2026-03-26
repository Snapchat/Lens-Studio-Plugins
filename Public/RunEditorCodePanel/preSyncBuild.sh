#!/usr/bin/env bash
set -euo pipefail

echo "=== Run Editor Code Panel: preSyncBuild.sh starting ==="

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

VERSION=$(node -p "const v = require('./package.json').version; if (!v) { process.exit(1); } v" 2>/dev/null || echo "1.0.0")

npm install --prefix "$SCRIPT_DIR"
npm run pack --prefix "$SCRIPT_DIR"

rm -rf "$SCRIPT_DIR/build"
mkdir -p "$SCRIPT_DIR/build"

ZIP_DIR="$SCRIPT_DIR/build/resources/$VERSION"
mkdir -p "$ZIP_DIR"
mv "$SCRIPT_DIR/run-editor-code-panel-${VERSION}.zip" "$ZIP_DIR/"

echo "=== Run Editor Code Panel: preSyncBuild.sh completed ==="
