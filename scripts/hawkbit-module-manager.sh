#!/bin/bash

set -e

HAWKBIT_DIR="external/hawkbit"
POM_FILE="${HAWKBIT_DIR}/pom.xml"
BACKUP_FILE="${POM_FILE}.backup"

AVAILABLE_MODULES=(
    "hawkbit-ql-jpa"
    "hawkbit-core"
    "hawkbit-artifact"
    "hawkbit-rest"
    "hawkbit-repository"
    "hawkbit-autoconfigure"
    "hawkbit-mgmt"
    "hawkbit-ddi"
    "hawkbit-dmf"
    "hawkbit-monolith"
    "hawkbit-ui"
    "hawkbit-sdk"
)

CORE_MODULES=(
    "hawkbit-ql-jpa"
    "hawkbit-core"
    "hawkbit-artifact"
    "hawkbit-rest"
    "hawkbit-repository"
    "hawkbit-autoconfigure"
    "hawkbit-monolith"
)

show_usage() {
    cat << EOF
hawkBit Module Manager

Usage: $0 <command> [options]

Commands:
    list                List all available modules
    list-active         List currently active modules
    enable <module>     Enable a specific module
    disable <module>    Disable a specific module (if not core)
    reset               Reset to default module configuration
    backup              Create backup of current pom.xml
    restore             Restore pom.xml from backup

Available modules:
EOF
    for module in "${AVAILABLE_MODULES[@]}"; do
        if [[ " ${CORE_MODULES[@]} " =~ " ${module} " ]]; then
            echo "    - $module (core, cannot be disabled)"
        else
            echo "    - $module"
        fi
    done
    echo ""
}

is_core_module() {
    local module=$1
    [[ " ${CORE_MODULES[@]} " =~ " ${module} " ]]
}

is_valid_module() {
    local module=$1
    [[ " ${AVAILABLE_MODULES[@]} " =~ " ${module} " ]]
}

list_modules() {
    echo "Available hawkBit modules:"
    for module in "${AVAILABLE_MODULES[@]}"; do
        if is_core_module "$module"; then
            echo "  [CORE] $module"
        else
            echo "  [OPT ] $module"
        fi
    done
}

list_active_modules() {
    echo "Currently active modules in pom.xml:"
    grep -oP '(?<=<module>)[^<]+(?=</module>)' "$POM_FILE" | grep -v "hawkbit-test-report" | sort -u
}

enable_module() {
    local module=$1
    
    if ! is_valid_module "$module"; then
        echo "Error: '$module' is not a valid module"
        exit 1
    fi
    
    if grep -q "<module>$module</module>" "$POM_FILE"; then
        echo "Module '$module' is already enabled"
        return 0
    fi
    
    echo "Enabling module: $module"
    
    sed -i.bak "/<modules>/a\\
        <module>$module</module>" "$POM_FILE"
    
    echo "Module '$module' has been enabled"
}

disable_module() {
    local module=$1
    
    if ! is_valid_module "$module"; then
        echo "Error: '$module' is not a valid module"
        exit 1
    fi
    
    if is_core_module "$module"; then
        echo "Error: Cannot disable core module '$module'"
        exit 1
    fi
    
    if ! grep -q "<module>$module</module>" "$POM_FILE"; then
        echo "Module '$module' is already disabled"
        return 0
    fi
    
    echo "Disabling module: $module"
    
    sed -i.bak "/<module>$module<\/module>/d" "$POM_FILE"
    
    echo "Module '$module' has been disabled"
}

backup_pom() {
    if [ -f "$POM_FILE" ]; then
        cp "$POM_FILE" "$BACKUP_FILE"
        echo "Backup created: $BACKUP_FILE"
    else
        echo "Error: pom.xml not found at $POM_FILE"
        exit 1
    fi
}

restore_pom() {
    if [ -f "$BACKUP_FILE" ]; then
        cp "$BACKUP_FILE" "$POM_FILE"
        echo "Restored pom.xml from backup"
    else
        echo "Error: Backup file not found at $BACKUP_FILE"
        exit 1
    fi
}

reset_to_default() {
    echo "Resetting to default module configuration..."
    
    if [ ! -f "$HAWKBIT_DIR/.git" ]; then
        echo "Error: hawkbit submodule not initialized"
        exit 1
    fi
    
    cd "$HAWKBIT_DIR"
    git checkout pom.xml
    cd - > /dev/null
    
    echo "Reset complete. All modules restored to default state."
}

case "${1:-}" in
    list)
        list_modules
        ;;
    list-active)
        list_active_modules
        ;;
    enable)
        if [ -z "${2:-}" ]; then
            echo "Error: Module name required"
            show_usage
            exit 1
        fi
        backup_pom
        enable_module "$2"
        ;;
    disable)
        if [ -z "${2:-}" ]; then
            echo "Error: Module name required"
            show_usage
            exit 1
        fi
        backup_pom
        disable_module "$2"
        ;;
    reset)
        reset_to_default
        ;;
    backup)
        backup_pom
        ;;
    restore)
        restore_pom
        ;;
    *)
        show_usage
        exit 1
        ;;
esac
