#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

npm install --prefix "$SCRIPT_DIR"
npm run build --prefix "$SCRIPT_DIR"
rm -rf "$SCRIPT_DIR/build"
mkdir -p "$SCRIPT_DIR/build"
npm run export --prefix "$SCRIPT_DIR"
