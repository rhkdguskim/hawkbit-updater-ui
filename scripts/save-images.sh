#!/bin/bash
# save-images.sh - Export Docker images for offline deployment
# Usage: ./scripts/save-images.sh

set -e

EXPORT_DIR="./docker-images"
mkdir -p "$EXPORT_DIR"

echo "=== Exporting Docker Images for Offline Deployment ==="

# Build updater-ui locally first
echo "Building updater-ui image..."
docker compose build updater-ui

# List of images to export
IMAGES=(
    "updater-ui:latest"
    "hawkbit/hawkbit-update-server:latest"
    "postgres:15-alpine"
    "nginx:alpine"
)

# Export each image
for IMAGE in "${IMAGES[@]}"; do
    FILENAME=$(echo "$IMAGE" | sed 's/[\/:]/_/g')
    echo "Exporting $IMAGE to $EXPORT_DIR/${FILENAME}.tar..."
    docker save -o "$EXPORT_DIR/${FILENAME}.tar" "$IMAGE"
done

echo ""
echo "=== Export Complete ==="
echo "Images exported to: $EXPORT_DIR"
echo ""
echo "To transfer to offline machine:"
echo "  1. Copy the entire '$EXPORT_DIR' folder"
echo "  2. Copy 'docker-compose.yml' and 'docker' folder"
echo "  3. Run 'scripts/load-images.sh' on target machine"
