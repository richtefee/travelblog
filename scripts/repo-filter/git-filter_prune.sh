#!/usr/bin/env bash
set -euo pipefail

IN=".git/filter-repo/analysis/blob-paths-sorted-human-readable.txt"
OUT=".git/filter-repo/analysis/blobs-to-keep.txt"

awk '
{
  # convert MB to float for numeric comparison
  size = $3
  gsub(" MB","",size)
  path = $1
  sha  = $2

  # store all sizes for each path
  count[path]++
  path_sizes[path,sha] = size
}
END {
  # find smallest blob for each duplicate path
  for (key in path_sizes) {
    split(key, arr, SUBSEP)
    path = arr[1]
    sha  = arr[2]
    size = path_sizes[key]

    if (count[path] > 1) {
      # track smallest
      if (!(path in min_size) || size < min_size[path]) {
        min_size[path] = size
        min_sha[path] = sha
      }
    }
  }

  # print all blobs for duplicate paths except the smallest
  for (key in path_sizes) {
    split(key, arr, SUBSEP)
    path = arr[1]
    sha  = arr[2]

    # consider only duplicates
    if (count[path] > 1 && sha != min_sha[path]) {
      print path "\t" sha "\t" path_sizes[key] " MB"
    }
  }
}
' "$IN" | sort > "$OUT"

echo "Done."
echo "Output (all but smallest blobs of duplicates) written to: $OUT"
