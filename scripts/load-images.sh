#!/bin/bash
# load-images.sh - Load Docker images from exported tar files
# Usage: ./scripts/load-images.sh

set -e

IMPORT_DIR="./docker-images"

echo "=== Loading Docker Images for Offline Deployment ==="

if [ ! -d "$IMPORT_DIR" ]; then
    echo "Error: Directory '$IMPORT_DIR' not found."
    echo "Please copy the docker-images folder from export machine."
    exit 1
fi

# Load all tar files
for TAR_FILE in "$IMPORT_DIR"/*.tar; do
    if [ -f "$TAR_FILE" ]; then
        echo "Loading $TAR_FILE..."
        docker load -i "$TAR_FILE"
    fi
done

echo ""
echo "=== Load Complete ==="
echo ""
echo "You can now run:"
echo "  docker compose up -d"
