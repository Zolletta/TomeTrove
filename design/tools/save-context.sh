#!/bin/bash
# Saves a Figma design-context tool response (overflow file) as a .tsx code file,
# strips the trailing instructions, then downloads referenced assets and rewrites
# the remote asset URLs to local paths.
#
# usage: save-context.sh <overflowFile> <destTsx> <assetsSlug>
# e.g.: save-context.sh /var/.../content.txt design/context/components/shared-list-card-default.tsx shared-list-card-default
set -euo pipefail
OV="$1"; DEST="$2"; SLUG="$3"
TOOLS_DIR="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$(dirname "$DEST")"
# keep everything before the "SUPER CRITICAL:" trailer and drop the trailing image marker
awk '/^SUPER CRITICAL:/{exit} {print}' "$OV" > "$DEST"
node "$TOOLS_DIR/fetch-context-assets.mjs" "$DEST" "$PWD/design/assets/exports/$SLUG" "../../assets/exports/$SLUG"
