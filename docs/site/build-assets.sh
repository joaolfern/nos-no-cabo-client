#!/usr/bin/env bash
# Renders the v1 diagrams to SVG and copies the v0 picture into the docs site's public folder.
set -euo pipefail

SITE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ARCH_DIR="$SITE_DIR/../architecture"

rm -rf "$SITE_DIR/public/diagrams"
bash "$ARCH_DIR/export-diagrams.sh" "$SITE_DIR/public/diagrams" svg
cp "$ARCH_DIR/v0/architecture.png" "$SITE_DIR/public/v0.png"
