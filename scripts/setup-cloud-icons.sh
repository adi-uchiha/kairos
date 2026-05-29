#!/usr/bin/env bash
# scripts/setup-cloud-icons.sh
# Run once after downloading the icon zips.
# Usage: bash scripts/setup-cloud-icons.sh

set -e

PUBLIC_ICONS="public/icons"
mkdir -p "$PUBLIC_ICONS/aws" "$PUBLIC_ICONS/gcp" "$PUBLIC_ICONS/azure"

if [ -d "./downloads/aws" ]; then
  echo "==> Extracting AWS icons..."
  # AWS icons are nested: Architecture-Service-Icons/.../{ServiceName}/.../{Name}_64.svg
  # We flatten to: public/icons/aws/{normalised-name}.svg
  find ./downloads/aws -name "*_64.svg" | while read -r f; do
    # Extract base name, strip size suffix and whitespace
    base=$(basename "$f" | sed 's/_64\.svg$//' | tr '[:upper:]' '[:lower:]' | tr ' ' '-')
    # Remove "arch-" prefix that AWS uses
    clean=$(echo "$base" | sed 's/^arch-//')
    cp "$f" "$PUBLIC_ICONS/aws/${clean}.svg"
  done
else
  echo "==> No downloads/aws folder found. Skipping AWS extraction."
fi

if [ -d "./downloads/gcp" ]; then
  echo "==> Extracting GCP icons..."
  # GCP icons: flat SVGs named like "cloud_run.svg", "bigquery.svg"
  find ./downloads/gcp -name "*.svg" | while read -r f; do
    base=$(basename "$f" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')
    cp "$f" "$PUBLIC_ICONS/gcp/${base}"
  done
else
  echo "==> No downloads/gcp folder found. Skipping GCP extraction."
fi

echo "==> Done. Icons written to $PUBLIC_ICONS/"
