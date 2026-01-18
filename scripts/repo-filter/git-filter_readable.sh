#!/usr/bin/env bash
set -euo pipefail

ANALYSIS=".git/filter-repo/analysis"
IN="blob-shas-and-paths.txt"   # this is the file you showed
OUT="blob-paths-sorted-human-readable.txt"

cd "$ANALYSIS"

awk '
# Match real data lines: sha size size [paths]
$1 ~ /^[0-9a-f]{40}$/ {
  sha = $1
  size = $2 / 1024 / 1024   # bytes → MB

  # Extract content inside [ ... ]
  match($0, /\[(.*)\]/, m)
  n = split(m[1], paths, ", ")

  for (i = 1; i <= n; i++) {
    printf "%s\t%s\t%.2f MB\n", paths[i], sha, size
  }
}
' "$IN" | sort > "$OUT"

echo "Done."
echo "Output: $ANALYSIS/$OUT"
