#!/bin/bash
set -euo pipefail

echo "=== Trying to run preSyncBuild.sh ==="

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Run the command, telling npm where the project root is
echo "Running commands with prefix: $SCRIPT_DIR"

npm install --prefix "$SCRIPT_DIR"
npm run build --prefix "$SCRIPT_DIR"
npm run export --prefix "$SCRIPT_DIR"

echo "=== Copying Storage to Build to prep for uploading ==="

# Remove old build directory to avoid stale artifacts
rm -rf "$SCRIPT_DIR/build"
# Create fresh build directory
mkdir -p "$SCRIPT_DIR/build"
# Copy all non-hidden files and folders from storage to build safely
rsync -av --exclude=".*" "$SCRIPT_DIR/storage/" "$SCRIPT_DIR/build/"

echo "=== preSyncBuild.sh completed ==="
