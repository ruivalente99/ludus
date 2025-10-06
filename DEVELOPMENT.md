# Development Scripts

This directory contains scripts to help with development and testing of the Ludus VS Code extension.

## Scripts

### `./dev-install.sh` - Full Development Installation

This is the comprehensive script that performs a complete development installation:

**What it does:**

- ✅ Checks for VS Code CLI availability
- 🗑️ Removes any existing Ludus extension
- 🧹 Cleans previous builds and packages
- 📦 Installs npm dependencies (if needed)
- 🔨 Compiles TypeScript and copies assets
- ✔️ Validates project structure
- 📦 Packages the extension into .vsix
- 🚀 Installs the new extension
- 💻 Optionally opens VS Code

**Usage:**

```bash
./dev-install.sh
```

**When to use:**

- First time setup
- After major changes
- When you want a clean, verified installation
- After changing dependencies or configuration

---

### `./quick-install.sh` - Quick Development Iteration

This is a faster script for rapid development cycles:

**What it does:**

- 🔨 Compiles TypeScript and copies assets
- 📦 Packages the extension
- 🔄 Reinstalls the extension

**Usage:**

```bash
./quick-install.sh
```

**When to use:**

- During active development
- Testing small changes
- Rapid iteration cycles

**Note:** After running either script, you'll need to reload VS Code (Ctrl+Shift+P → "Developer: Reload Window") to see the changes.

---

## Development Workflow

### Initial Setup

```bash
# First time or after major changes
./dev-install.sh
```

### During Development

```bash
# Make your changes to TypeScript files
# Then run quick install
./quick-install.sh

# Reload VS Code window to see changes
# Ctrl+Shift+P → "Developer: Reload Window"
```

### Testing

```bash
# Run tests
npm test

# Run only unit tests
npm run test:unit

# Run with coverage
npm run coverage
```

### Manual Commands

If you prefer manual control:

```bash
# Clean build
npm run clean

# Compile
npm run compile

# Validate
npm run validate

# Package
npm run package

# Install specific version
code --install-extension ludus-1.1.0.vsix
```

## Troubleshooting

### Extension Not Updating

1. Make sure to reload VS Code after installation
2. Check if extension is actually installed: `code --list-extensions | grep ludus`
3. Try uninstalling manually: `code --uninstall-extension ruivalente99.ludus`

### Build Errors

1. Clean everything: `npm run clean && rm -rf node_modules && npm install`
2. Check TypeScript errors: `npm run compile`
3. Validate project: `npm run validate`

### VS Code Not Recognizing Extension

1. Ensure the .vsix file was created: `ls ludus-*.vsix`
2. Check VS Code CLI is working: `code --version`
3. Try installing with full path: `code --install-extension ./ludus-1.1.0.vsix`
