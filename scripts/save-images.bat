@echo off
REM save-images.bat - Export Docker images for offline deployment (Windows)
REM Usage: scripts\save-images.bat

echo === Exporting Docker Images for Offline Deployment ===

if not exist "docker-images" mkdir docker-images

REM Build updater-ui locally first
echo Building updater-ui image...
docker compose build updater-ui

REM Export images
echo Exporting updater-ui:latest...
docker save -o docker-images\updater-ui_latest.tar updater-ui:latest

echo Exporting hawkbit/hawkbit-update-server:latest...
docker save -o docker-images\hawkbit_hawkbit-update-server_latest.tar hawkbit/hawkbit-update-server:latest

echo Exporting postgres:15-alpine...
docker save -o docker-images\postgres_15-alpine.tar postgres:15-alpine

echo Exporting nginx:alpine...
docker save -o docker-images\nginx_alpine.tar nginx:alpine

echo.
echo === Export Complete ===
echo Images exported to: docker-images
echo.
echo To transfer to offline machine:
echo   1. Copy the entire 'docker-images' folder
echo   2. Copy 'docker-compose.yml' and 'docker' folder
echo   3. Run 'scripts\load-images.bat' on target machine
pause
