#!/usr/bin/env bash
set -euo pipefail

IN=".git/filter-repo/analysis/blobs-to-delete.txt"
OUT=".git/filter-repo/analysis/unique-blob-ids.txt"

awk '{print $2}' "$IN" | sort -u > "$OUT"

echo "Done."
echo "Unique blob IDs written to: $OUT"
