#!/usr/bin/env bash
set -euo pipefail

echo "=== Run Editor Code Panel: preSyncBuild.sh starting ==="

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

VERSION=$(node -p "require('./package.json').version")

npm install --prefix "$SCRIPT_DIR"
npm run pack --prefix "$SCRIPT_DIR"

ZIP_DIR="$SCRIPT_DIR/storage/resources/$VERSION"
mkdir -p "$ZIP_DIR"
mv "$SCRIPT_DIR/run-editor-code-panel-${VERSION}.zip" "$ZIP_DIR/"

rm -rf "$SCRIPT_DIR/build"
rsync -a --exclude=".*" "$SCRIPT_DIR/storage/" "$SCRIPT_DIR/build/"

echo "=== Run Editor Code Panel: preSyncBuild.sh completed ==="
