#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

# Packages public-docs/public-editor.d.ts (public d.ts, no @hidden APIs)
# as a versioned zip for CDS sync. The Lens Studio version comes straight
# from the `@version X.Y.Z` tag in the d.ts header — the d.ts is the
# single source of truth, so a release commit only needs to bump that file.

# Suppress macOS AppleDouble resource forks (`._*`) so they don't get
# embedded in the archive — the Agents-Docs plugin's unzipFirstFile would
# otherwise pick the wrong entry.
export COPYFILE_DISABLE=1

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

DTS="public-editor.d.ts"
ZIP_NAME="editor-types-public.zip"

VERSION=$(grep -m1 -E '@version[[:space:]]+[0-9]+\.[0-9]+\.[0-9]+' "$DTS" \
    | sed -E 's/.*@version[[:space:]]+([0-9]+\.[0-9]+\.[0-9]+).*/\1/' || true)
if [[ ! "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "Could not parse @version X.Y.Z from $DTS (got: '$VERSION')" >&2
    exit 1
fi

ZIP_DIR="$SCRIPT_DIR/build/resources/$VERSION"
rm -rf "$SCRIPT_DIR/build"
mkdir -p "$ZIP_DIR"

# -X strips extra attributes (uid/gid/timestamps) for reproducibility.
# Exclusion globs are defensive — no directory recursion happens here,
# but they document intent and protect against future drift.
zip -Xq "$ZIP_DIR/$ZIP_NAME" "$DTS" \
    -x "*.DS_Store" \
    -x "__MACOSX/*" \
    -x "._*"

# Assert the archive contains exactly the payload — nothing else.
ENTRIES=$(unzip -Z1 "$ZIP_DIR/$ZIP_NAME")
if [ "$ENTRIES" != "$DTS" ]; then
    echo "Unexpected archive contents in $ZIP_NAME:" >&2
    echo "$ENTRIES" >&2
    exit 1
fi

echo "Built $ZIP_DIR/$ZIP_NAME"
unzip -l "$ZIP_DIR/$ZIP_NAME"
