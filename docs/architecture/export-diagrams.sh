#!/usr/bin/env bash
# Renders every .puml under docs/architecture to PNG, mirroring the folder layout.
# Uses the plantuml/plantuml Docker image (bundles Graphviz). Pipe mode because the
# container cannot write into a bind-mounted folder on WSL/Docker Desktop.
#
# Usage: docs/architecture/export-diagrams.sh [output-dir] [format]
#   output-dir  default: out/architecture (repo root, gitignored)
#   format      png (default) or svg

set -euo pipefail

ARCH_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$ARCH_DIR/../.." && pwd)"
OUT_DIR="$(realpath -m "${1:-$REPO_ROOT/out/architecture}")"
FORMAT="${2:-png}"
IMAGE="plantuml/plantuml"

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required" >&2
  exit 1
fi

cd "$ARCH_DIR"
mapfile -t diagrams < <(find . -name '*.puml' -not -path './out/*' | sed 's#^\./##' | sort)

failed=0
for diagram in "${diagrams[@]}"; do
  target="$OUT_DIR/${diagram%.puml}.$FORMAT"
  mkdir -p "$(dirname "$target")"

  if docker run --rm -i -v "$ARCH_DIR:/data:ro" -w "/data/$(dirname "$diagram")" \
    "$IMAGE" -pipe -failfast2 "-t$FORMAT" < "$diagram" > "$target"; then
    echo "ok    $diagram"
  else
    echo "FAIL  $diagram" >&2
    failed=$((failed + 1))
  fi
done

echo "${#diagrams[@]} diagrams, $failed failed → $OUT_DIR"
[ "$failed" -eq 0 ]
