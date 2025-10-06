#!/bin/bash

# Quick rebuild and install script for Ludus VS Code Extension
# This is a faster version that skips some checks for rapid development

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

print_status "Quick rebuild and install..."

# Compile
print_status "Compiling..."
npm run compile

# Package
print_status "Packaging..."
npm run package

# Find .vsix file
VSIX_FILE=$(ls ludus-*.vsix 2>/dev/null | head -n 1)

# Reinstall
print_status "Reinstalling extension..."
code --uninstall-extension ruivalente99.ludus 2>/dev/null || true
code --install-extension "$VSIX_FILE"

print_success "Quick install completed! Reload VS Code to see changes."