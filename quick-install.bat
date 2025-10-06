@echo off
REM Quick rebuild and install script for Ludus VS Code Extension (Windows)

setlocal enabledelayedexpansion

echo [INFO] Quick rebuild and install...

REM Compile
echo [INFO] Compiling...
npm run compile
if %errorlevel% neq 0 (
    echo [ERROR] Compilation failed
    pause
    exit /b 1
)

REM Package
echo [INFO] Packaging...
npm run package
if %errorlevel% neq 0 (
    echo [ERROR] Packaging failed
    pause
    exit /b 1
)

REM Find .vsix file
for %%f in (ludus-*.vsix) do set VSIX_FILE=%%f

REM Reinstall
echo [INFO] Reinstalling extension...
code --uninstall-extension ruivalente99.ludus 2>nul
code --install-extension "%VSIX_FILE%"

echo [SUCCESS] Quick install completed! Reload VS Code to see changes.
pause