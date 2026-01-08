@echo off
REM load-images.bat - Load Docker images from exported tar files (Windows)
REM Usage: scripts\load-images.bat

echo === Loading Docker Images for Offline Deployment ===

if not exist "docker-images" (
    echo Error: Directory 'docker-images' not found.
    echo Please copy the docker-images folder from export machine.
    exit /b 1
)

echo.
echo Expected images (from docker-compose.yml):
echo   - updater-ui:latest
echo   - hawkbit/hawkbit-update-server:latest-mysql
echo   - mysql:8.0
echo   - rabbitmq:3-management
echo   - nginx:alpine
echo.

for %%f in (docker-images\*.tar) do (
    echo Loading %%f...
    docker load -i "%%f"
)

echo.
echo === Load Complete ===
echo.
echo You can now run:
echo   docker compose up -d
pause
