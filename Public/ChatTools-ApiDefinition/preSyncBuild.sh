#!/bin/bash

echo "=== Trying to run preSyncBuild.sh ==="

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Run the command, telling npm where the project root is
echo "Running commands with prefix: $SCRIPT_DIR"

npm install --prefix "$SCRIPT_DIR"
npm run build --prefix "$SCRIPT_DIR"

# Remove old build directory to avoid stale artifacts
rm -rf build
mkdir -p build

# Export writes the current version's zip directly into build/resources/$VERSION/
npm run export --prefix "$SCRIPT_DIR"

echo "=== preSyncBuild.sh completed ==="
