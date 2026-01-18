#!/bin/bash

# HELP START
# ====================
# Image Resizer Script
# ====================
# Resizes PNG/JPG images in a folder.
# Supports selective processing, dry-run, verbose output, and tracking already processed files.
#
# Options:
#   --content-dir <dir>         Directory containing images (default: ./content)
#   --max-size <px>             Maximum pixel size for largest dimension (default: 1920)
#   --factor <n>                Factor to multiply max-size to set actual resizing limit (default: 2)
#   --jpeg-quality <n>          JPEG quality for resized images (default: 85)
#   --png-compression <n>           PNG compression (default: 9)
#   --dry-run                   Simulate actions, no files modified
#   --verbose, -v               Show per-file actions
#   --ignore-processed=<mode>   How to treat already processed files (default: all)
#                               all     = ignore all previously processed files
#                               smaller = ignore processed files smaller than max size
#                               none    = consider all files, even processed
#   --help, -h                  Show this help message
#
# Selection:
#   After listing images, user can select:
#     [A] all (default)
#     [N] none
#     e.g., 1-3,5,7-end
#   Non-selected files can optionally be marked as ignored for future runs.
# HELP END

# ===== DEFAULT CONFIG =====
CONTENT_DIR="../content"
MAX_SIZE=1920
FACTOR=2
JPEG_QUALITY=85
PNG_COMPRESSION=9
DRY_RUN=false
VERBOSE=false
IGNORE_PROCESSED="all"  # all (default), smaller, none

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
IGNORE_FILE="$SCRIPT_DIR/.ignore"
PROCESSED_FILE="$SCRIPT_DIR/.processed-${MAX_REQUIRED_SIZE}-${FACTOR}-${JPEG_QUALITY}"-${PNG_COMPRESSION}

# ===== COLORS =====
C_RESIZED="\033[38;5;82m"     # Bright, saturated green (resized files)
C_NOTREQ="\033[38;5;28m"     # Softer/darker green (ignored too small)
C_FAILED="\033[38;5;196m"     # Bright red (failed files)
C_NOTSEL="\033[38;5;244m"     # Medium grey (non-selected files)
RESET="\033[0m"               # Reset to terminal default

# ===== PARSE OPTIONS =====
while [[ $# -gt 0 ]]; do
  case $1 in
    --help|-h)
      sed -n '/^# HELP START$/,/^# HELP END$/p' "$0" | sed '1d;$d;s/^# //;s/^#//'
      exit 0
      ;;
    --content-dir) CONTENT_DIR="$2"; shift 2 ;;
    --max-size) MAX_SIZE="$2"; shift 2 ;;
    --factor) FACTOR="$2"; shift 2 ;;
    --jpeg-quality) JPEG_QUALITY="$2"; shift 2 ;;
    --png-compression) PNG_COMPRESSION="$2"; shift 2 ;;
    --dry-run) DRY_RUN=true; shift ;;
    --verbose|-v) VERBOSE=true; shift ;;
    --ignore-processed)
      case "$2" in
        all|smaller|none) IGNORE_PROCESSED="$2" ;;
        *) echo "Invalid value for --ignore-processed: $2 (allowed: all, smaller, none)"; exit 1 ;;
      esac
      shift 2
      ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

MAX_EFFECTIVE_SIZE=$((MAX_SIZE * FACTOR));

mkdir -p "$SCRIPT_DIR"
touch "$IGNORE_FILE"
touch "$PROCESSED_FILE"

short_path() { echo "${1#$CONTENT_DIR/}"; }

# ===== COLLECT FILES =====
collect_files() {
  # 1. Get all images
  mapfile -t all_files < <(
    find "$CONTENT_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) | sort
  )

  # 2. Load ignored files
  mapfile -t ignore_list < "$IGNORE_FILE" 2>/dev/null || ignore_list=()

  # 3. Handle processed files based on mode
  if [[ "$IGNORE_PROCESSED" != "none" ]]; then
    for proc_file in "$SCRIPT_DIR"/.processed-*; do
      if [[ -f "$proc_file" ]]; then
        proc_tail="${proc_file##*/.processed-}"
        proc_max_size="${proc_tail%%-*}"
        proc_factor="${proc_tail#*-}"; proc_factor="${proc_factor%%-*}"
        proc_max_effective_size=$(( proc_max_size * proc_factor ))

        if ! [[ "$IGNORE_PROCESSED" == "smaller" && "$proc_max_effective_size" -gt "$MAX_EFFECTIVE_SIZE" ]]; then
          # Load all paths from this processed file into ignore_list
          mapfile -t tmp < "$proc_file"
          ignore_list+=("${tmp[@]}")
        fi
      fi
    done
  fi

  # 4. Remove duplicates from ignore_list
  mapfile -t ignore_list < <(printf '%s\n' "${ignore_list[@]}" | sort -u)

  # 5. Filter all_files using ignore_list
  mapfile -t files < <(
    for f in "${all_files[@]}"; do
      skip=false
      for ign in "${ignore_list[@]}"; do
        [[ "$f" == "$ign" ]] && { skip=true; break; }
      done
      $skip || echo "$f"
    done
  )
}

# ===== SHOW LIST =====
show_file_list() {
  echo ""
  echo "Images available for processing in '$CONTENT_DIR':"
  echo "--------------------------------"
  for i in "${!files[@]}"; do
    idx=$((i+1))
    echo "[$idx] $(short_path "${files[$i]}")"
  done
  echo "--------------------------------"
  echo ""
  echo "Selection options:"
  echo "  [A] all (default)"
  echo "  [N] none"
  echo "  e.g.: 1-3,5,9-end"
  echo ""
}

# ===== SELECTION PARSING =====
parse_ranges() {
  local input="$1"
  local max="$2"
  IFS=',' read -ra parts <<< "$input"
  for part in "${parts[@]}"; do
    if [[ "$part" =~ ^([0-9]+)-end$ ]]; then
      seq "${BASH_REMATCH[1]}" "$max"
    elif [[ "$part" =~ ^([0-9]+)-([0-9]+)$ ]]; then
      seq "${BASH_REMATCH[1]}" "${BASH_REMATCH[2]}"
    elif [[ "$part" =~ ^[0-9]+$ ]]; then
      echo "$part"
    fi
  done
}

# ===== FILE SELECTION =====
select_files() {
  read -r -p "Your choice: " choice
  choice=${choice:-a}

  if [[ "$choice" =~ ^[aA]$ ]]; then
    selected_indices=($(seq 1 "$COUNT"))
  elif [[ "$choice" =~ ^[nN]$ ]]; then
    echo "Nothing selected."
    exit 0
  else
    mapfile -t selected_indices < <(parse_ranges "$choice" "$COUNT" | sort -n -u)
  fi

  # Calculate non-selected count
  non_selected_count=$((COUNT - ${#selected_indices[@]}))

  # Show non-selected files in verbose mode and prompt to mark ignored
  if [ "$non_selected_count" -gt 0 ]; then
    if $VERBOSE; then
      echo ""
      echo "Non-selected files:"
      for i in "${!files[@]}"; do
        idx=$((i+1))
        if ! printf '%s\n' "${selected_indices[@]}" | grep -qx "$idx"; then
          echo -e "${C_NOTSEL}[$idx] $(short_path "${files[$i]}")${RESET}"
        fi
      done
    fi

    read -r -p "Mark NOT selected files as ignored in future? [y/N]: " mark_ignore
    mark_ignore=${mark_ignore:-n}
    mark_non_selected=$([[ "$mark_ignore" =~ ^[yY]$ ]] && echo true || echo false)
  else
    mark_non_selected=false
  fi
}
# ===== PROCESS UNSELECTED FILES =====
process_unselected_files() {
  if $mark_non_selected; then
    for i in "${!files[@]}"; do
      idx=$((i+1))
      if ! printf '%s\n' "${selected_indices[@]}" | grep -qx "$idx"; then
        if ! $DRY_RUN; then
          echo "${files[$i]}" >> "$IGNORE_FILE"
        fi
      fi
    done
    if ! $DRY_RUN; then
      sort -u -o "$IGNORE_FILE" "$IGNORE_FILE"
    fi
    echo "Ignore file updated: $IGNORE_FILE"
  fi
}
# ===== RESIZE FILE =====
resize_file() {
  local idx="$1"
  local file="$2"
  local display_file
  display_file=$(short_path "$file")

  original_size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file")
  size=$(identify -format "%w %h" "$file" 2>/dev/null || echo "0 0")
  read -r width height <<< "$size"
  max_current=$(( width > height ? width : height ))

  # Skip small images
  if [ "$max_current" -le "$MAX_EFFECTIVE_SIZE" ]; then
    skipped_count=$((skipped_count+1))
    $VERBOSE && echo -e "${C_NOTREQ}[$idx] Ignored (too small): $display_file${RESET}"
    return 0
  fi

  # Try resizing
  if ! $DRY_RUN; then
    if [[ "$file" =~ \.png$|\.PNG$ ]]; then
      if ! magick "$file" -resize "${MAX_EFFECTIVE_SIZE}x${MAX_EFFECTIVE_SIZE}>" -strip -define png:compression-level=$PNG_COMPRESSION "$file"; then
        echo -e "${C_FAILED}[$idx] Failed to resize PNG: $display_file${RESET}"
        return 1
      fi
    else
      if ! magick "$file" -resize "${MAX_EFFECTIVE_SIZE}x${MAX_EFFECTIVE_SIZE}>" -strip -quality "$JPEG_QUALITY" "$file"; then
        echo -e "${C_FAILED}[$idx] Failed to resize JPG: $display_file${RESET}"
        return 1
      fi
    fi
    new_size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file")
  else
    new_size=$original_size
  fi

  saved=$((original_size - new_size))
  resized_summary+=("$file|$original_size|$new_size|$saved")
  resized_count=$((resized_count+1))
  total_saved=$((total_saved+saved))

  $VERBOSE && echo -e "${C_RESIZED}[$idx] Processed: $display_file $(numfmt --to=iec $original_size) → $(numfmt --to=iec $new_size) (-$(numfmt --to=iec $saved))${RESET}"
  return 0
}

# ===== PROGRESS BAR =====
show_progress() {
  local current=$1
  local total=$2
  local width=40
  local progress=$(( current * width / total ))
  local remainder=$(( width - progress ))
  printf "\r${C_PROGRESS}Processing: [%-*s] %d/%d${RESET}" "$width" "$(printf '#%.0s' $(seq 1 $progress))$(printf ' %.0s' $(seq 1 $remainder))" "$current" "$total"
}

# ===== PROCESS  =====
process_selected_files() {
  resized_summary=()
  skipped_count=0
  resized_count=0
  ignored_count=0
  failed_count=0
  total_saved=0

  local total=${#selected_indices[@]}
  local i=0

  for idx in "${selected_indices[@]}"; do
    i=$((i+1))
    file="${files[$((idx-1))]}"

    # Attempt resize
    if resize_file "$idx" "$file"; then
      # Mark as processed if succeeded or skipped
      if ! grep -Fxq "$file" "$PROCESSED_FILE"; then
        if ! $DRY_RUN; then
          echo "$file" >> "$PROCESSED_FILE"
        fi
      fi
    else
      failed_count=$((failed_count+1))
      $VERBOSE || echo -e "${C_FAILED}[$idx] Failed: $(short_path "$file")${RESET}"
    fi

    # Update progress for non-verbose mode
    $VERBOSE || show_progress "$i" "$total"
  done

  # Newline after progress bar
  $VERBOSE || echo ""
}

# ===== SUMMARY =====
print_summary() {
  echo ""
  echo "===== Summary ====="
  echo -e "${C_RESIZED}Resized files: $resized_count${RESET}"
  echo -e "${C_NOTREQ}Skipped files: $skipped_count${RESET}"
  echo -e "${C_FAILED}Failed files: $failed_count${RESET}"
  echo -e "${C_NOTSEL}Non-selected files: $non_selected_count${RESET}"
  echo "Total bytes saved: $(numfmt --to=iec $total_saved)"
  echo "==================="
}

# ===== MAIN SCRIPT =====
collect_files
COUNT=${#files[@]}
if [ "$COUNT" -eq 0 ]; then
  echo "No images to process (all ignored or already processed)."
  exit 0
fi

show_file_list
select_files
$DRY_RUN && echo -e "\n=== DRY RUN: no files will be modified ===\n"
process_unselected_files
process_selected_files
print_summary
$DRY_RUN && echo -e "\n=== DRY RUN COMPLETE: nothing was modified ==="
