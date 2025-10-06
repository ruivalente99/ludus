#!/bin/bash

# Development Installation Script for Ludus VS Code Extension
# This script removes the old extension, builds, packages, and installs the new one

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

print_status "Starting Ludus extension development installation..."

# Step 1: Check if VS Code is installed
if ! command -v code &> /dev/null; then
    print_error "VS Code CLI is not available. Please make sure VS Code is installed and 'code' command is in PATH."
    exit 1
fi

# Step 2: Remove existing Ludus extension
print_status "Checking for existing Ludus extension..."
if code --list-extensions | grep -q "ruivalente99.ludus"; then
    print_status "Removing existing Ludus extension..."
    code --uninstall-extension ruivalente99.ludus
    print_success "Existing extension removed"
else
    print_warning "No existing Ludus extension found"
fi

# Step 3: Clean previous builds
print_status "Cleaning previous builds..."
npm run clean 2>/dev/null || rm -rf out/ 2>/dev/null || true
rm -f ludus-*.vsix 2>/dev/null || true
print_success "Clean completed"

# Step 4: Install dependencies (if node_modules doesn't exist or package.json changed)
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
    print_status "Installing dependencies..."
    npm install
    print_success "Dependencies installed"
fi

# Step 5: Compile the project
print_status "Compiling TypeScript and copying assets..."
npm run compile
if [ $? -eq 0 ]; then
    print_success "Compilation completed"
else
    print_error "Compilation failed"
    exit 1
fi

# Step 6: Validate the project
print_status "Validating project structure..."
npm run validate
if [ $? -eq 0 ]; then
    print_success "Validation passed"
else
    print_error "Validation failed"
    exit 1
fi

# Step 7: Package the extension
print_status "Packaging extension..."
npm run package
if [ $? -eq 0 ]; then
    print_success "Extension packaged"
else
    print_error "Packaging failed"
    exit 1
fi

# Step 8: Find the generated .vsix file
VSIX_FILE=$(ls ludus-*.vsix 2>/dev/null | head -n 1)
if [ -z "$VSIX_FILE" ]; then
    print_error "No .vsix file found after packaging"
    exit 1
fi

print_status "Found package: $VSIX_FILE"

# Step 9: Install the new extension
print_status "Installing new extension..."
code --install-extension "$VSIX_FILE"
if [ $? -eq 0 ]; then
    print_success "Extension installed successfully"
else
    print_error "Extension installation failed"
    exit 1
fi

# Step 10: Optional - Open VS Code
read -p "Do you want to open VS Code now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Opening VS Code..."
    code .
    print_success "VS Code opened"
fi

print_success "Development installation completed successfully!"
print_status "You can now use the Ludus extension in VS Code"
print_status "Look for the game controller icon in the Activity Bar"

# Optional: Show extension info
echo
print_status "Extension details:"
code --list-extensions --show-versions | grep ludus