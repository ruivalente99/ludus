# Ludus Extension Troubleshooting

## V8 Engine / Node.js Runtime Errors

If you encounter errors like:

```
FATAL ERROR: v8::ToLocalChecked Empty MaybeLocal
```

### Quick Fix

1. **Clean Build**:

   ```bash
   rm -rf out/ && rm -f *.vsix
   npm run compile
   ```

2. **Fresh Install**:

   ```bash
   ./quick-install.sh
   ```

3. **Reload VS Code**: Press `Ctrl+Shift+P` → "Developer: Reload Window"

### Root Causes

- **Temporary Node.js runtime issues** (most common)
- **Corrupted build cache**
- **VS Code extension host process conflicts**
- **Memory pressure during compilation**

### Advanced Troubleshooting

#### If error persists

1. **Update vsce**:

   ```bash
   npm install -g @vscode/vsce@latest
   ```

2. **Check Node.js version**:

   ```bash
   node --version  # Should be >= 16.x
   ```

3. **VS Code version**:

   ```bash
   code --version  # Should be >= 1.74.0
   ```

4. **Manual clean install**:

   ```bash
   # Uninstall extension completely
   code --uninstall-extension ruivalente.ludus
   
   # Clean build
   rm -rf out/ node_modules/ *.vsix
   npm install
   npm run compile
   
   # Package and install
   npm run package
   code --install-extension ludus-1.1.0.vsix
   ```

#### System-level fixes

1. **Restart VS Code completely**
2. **Clear VS Code extension cache**:
   - Close VS Code
   - Delete `~/.vscode/extensions/.obsolete` (Linux/Mac)
   - Restart VS Code

3. **Increase Node.js memory limit**:

   ```bash
   export NODE_OPTIONS="--max-old-space-size=4096"
   ```

### Prevention

- Use the provided `quick-install.sh` script for updates
- Keep Node.js and VS Code updated
- Avoid running multiple extension builds simultaneously

## Game-Specific Issues

### Games not loading

1. Check browser console in VS Code Dev Tools (`Ctrl+Shift+I`)
2. Verify webview security settings
3. Try opening game in new window button

### Performance issues

1. Close other resource-intensive VS Code extensions
2. Reduce VS Code window count
3. Check system memory usage

## Support

- GitHub Issues: <https://github.com/ruivalente99/ludus/issues>
- Check existing issues before reporting new ones
- Include error messages and VS Code/Node.js versions
