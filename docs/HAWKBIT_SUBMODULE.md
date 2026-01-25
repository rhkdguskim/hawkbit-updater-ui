# hawkBit Submodule Setup Guide

This document describes how to work with the hawkBit submodule in the updater-ui project.

## Overview

The project uses a forked hawkBit repository as a git submodule to:
- Build hawkBit from source instead of using pre-built Docker images
- Customize hawkBit modules and features
- Maintain control over hawkBit versions and updates

## Repository Structure

```
updater-ui/
├── external/
│   └── hawkbit/          # hawkBit git submodule
│       ├── pom.xml
│       ├── Dockerfile    # Custom Dockerfile for local builds
│       └── ...
├── scripts/
│   └── hawkbit-module-manager.sh  # Module management script
└── docker-compose.yml    # Modified to build hawkBit locally
```

## Initial Setup

### 1. Clone the repository with submodules

```bash
git clone --recurse-submodules https://github.com/rhkdguskim/hawkbit-updater-ui.git
```

Or if already cloned:

```bash
git submodule init
git submodule update
```

### 2. Update submodule to latest version

```bash
cd external/hawkbit
git checkout master
git pull origin master
cd ../..
git add external/hawkbit
git commit -m "chore: update hawkbit submodule"
```

## Module Management

The `hawkbit-module-manager.sh` script allows you to enable/disable hawkBit Maven modules.

### Available Commands

```bash
# List all available modules
./scripts/hawkbit-module-manager.sh list

# List currently active modules
./scripts/hawkbit-module-manager.sh list-active

# Enable a module
./scripts/hawkbit-module-manager.sh enable <module-name>

# Disable a module (non-core only)
./scripts/hawkbit-module-manager.sh disable <module-name>

# Reset to default configuration
./scripts/hawkbit-module-manager.sh reset

# Backup current configuration
./scripts/hawkbit-module-manager.sh backup

# Restore from backup
./scripts/hawkbit-module-manager.sh restore
```

### Module Types

**Core Modules (cannot be disabled):**
- hawkbit-ql-jpa
- hawkbit-core
- hawkbit-artifact
- hawkbit-rest
- hawkbit-repository
- hawkbit-autoconfigure
- hawkbit-monolith

**Optional Modules:**
- hawkbit-mgmt (Management API)
- hawkbit-ddi (Direct Device Integration API)
- hawkbit-dmf (Device Management Federation)
- hawkbit-ui (Web UI)
- hawkbit-sdk (SDK and examples)

### Example: Disable UI Module

If you want to reduce build time and don't need the hawkBit web UI:

```bash
./scripts/hawkbit-module-manager.sh disable hawkbit-ui
```

## Building and Running

### Local Docker Build

The `docker-compose.yml` is configured to build hawkBit from the submodule source:

```bash
# Build and start all services
docker compose up --build

# Build only hawkBit
docker compose build hawkbit

# Start in detached mode
docker compose up -d
```

### Build Process

The Dockerfile uses a multi-stage build:

1. **Build Stage**: Uses Maven to compile hawkBit from source
2. **Runtime Stage**: Creates a minimal runtime image with the built JAR

Build time: ~5-10 minutes (depending on your machine and network)

### Environment Variables

Key environment variables in `docker-compose.yml`:

```yaml
SPRING_PROFILES_ACTIVE: mysql
SPRING_DATASOURCE_URL: jdbc:mariadb://mysql:3306/hawkbit
SPRING_RABBITMQ_HOST: rabbitmq
```

## Customizing hawkBit

### 1. Modify Source Code

```bash
cd external/hawkbit
# Make your changes
git add .
git commit -m "feat: custom modification"
git push origin master
```

### 2. Update Parent Project

```bash
cd ../..
git add external/hawkbit
git commit -m "chore: update hawkbit with custom changes"
```

### 3. Rebuild Docker Image

```bash
docker compose build hawkbit
docker compose up -d hawkbit
```

## Syncing with Upstream

To sync your fork with the official hawkBit repository:

```bash
cd external/hawkbit

# Add upstream remote (only needed once)
git remote add upstream https://github.com/eclipse-hawkbit/hawkbit.git

# Fetch and merge upstream changes
git fetch upstream
git checkout master
git merge upstream/master

# Push to your fork
git push origin master

# Update parent repository
cd ../..
git add external/hawkbit
git commit -m "chore: sync hawkbit with upstream"
```

## Troubleshooting

### Submodule is empty or not initialized

```bash
git submodule update --init --recursive
```

### Build fails due to missing dependencies

```bash
# Clean and rebuild
docker compose build --no-cache hawkbit
```

### Module configuration is corrupted

```bash
# Reset to default
./scripts/hawkbit-module-manager.sh reset

# Or restore from backup
./scripts/hawkbit-module-manager.sh restore
```

### Docker build is too slow

Consider disabling optional modules:

```bash
./scripts/hawkbit-module-manager.sh disable hawkbit-ui
./scripts/hawkbit-module-manager.sh disable hawkbit-sdk
```

## Best Practices

1. **Always create a backup before modifying modules:**
   ```bash
   ./scripts/hawkbit-module-manager.sh backup
   ```

2. **Commit submodule changes separately from parent changes:**
   ```bash
   # In submodule
   cd external/hawkbit
   git commit -m "feat: add custom feature"
   git push
   
   # In parent
   cd ../..
   git add external/hawkbit
   git commit -m "chore: update hawkbit submodule reference"
   ```

3. **Keep your fork synced with upstream regularly** to receive bug fixes and security updates

4. **Test builds locally** before pushing changes:
   ```bash
   docker compose build hawkbit
   docker compose up hawkbit
   ```

## References

- [hawkBit Documentation](https://www.eclipse.dev/hawkbit/)
- [hawkBit GitHub](https://github.com/eclipse-hawkbit/hawkbit)
- [Git Submodules Documentation](https://git-scm.com/book/en/v2/Git-Tools-Submodules)
- [Maven Build Lifecycle](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html)
