@echo off
REM Development Installation Script for Ludus VS Code Extension (Windows)
REM This script removes the old extension, builds, packages, and installs the new one

setlocal enabledelayedexpansion

echo [INFO] Starting Ludus extension development installation...

REM Check if VS Code is installed
where code >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] VS Code CLI is not available. Please make sure VS Code is installed and 'code' command is in PATH.
    pause
    exit /b 1
)

REM Remove existing Ludus extension
echo [INFO] Checking for existing Ludus extension...
code --list-extensions | findstr "ruivalente99.ludus" >nul 2>nul
if %errorlevel% equ 0 (
    echo [INFO] Removing existing Ludus extension...
    code --uninstall-extension ruivalente99.ludus
    echo [SUCCESS] Existing extension removed
) else (
    echo [WARNING] No existing Ludus extension found
)

REM Clean previous builds
echo [INFO] Cleaning previous builds...
if exist out rmdir /s /q out 2>nul
del ludus-*.vsix 2>nul
echo [SUCCESS] Clean completed

REM Install dependencies if needed
if not exist node_modules (
    echo [INFO] Installing dependencies...
    npm install
    echo [SUCCESS] Dependencies installed
)

REM Compile the project
echo [INFO] Compiling TypeScript and copying assets...
npm run compile
if %errorlevel% neq 0 (
    echo [ERROR] Compilation failed
    pause
    exit /b 1
)
echo [SUCCESS] Compilation completed

REM Validate the project
echo [INFO] Validating project structure...
npm run validate
if %errorlevel% neq 0 (
    echo [ERROR] Validation failed
    pause
    exit /b 1
)
echo [SUCCESS] Validation passed

REM Package the extension
echo [INFO] Packaging extension...
npm run package
if %errorlevel% neq 0 (
    echo [ERROR] Packaging failed
    pause
    exit /b 1
)
echo [SUCCESS] Extension packaged

REM Find the generated .vsix file
for %%f in (ludus-*.vsix) do set VSIX_FILE=%%f
if not defined VSIX_FILE (
    echo [ERROR] No .vsix file found after packaging
    pause
    exit /b 1
)

echo [INFO] Found package: %VSIX_FILE%

REM Install the new extension
echo [INFO] Installing new extension...
code --install-extension "%VSIX_FILE%"
if %errorlevel% neq 0 (
    echo [ERROR] Extension installation failed
    pause
    exit /b 1
)
echo [SUCCESS] Extension installed successfully

REM Optional - Open VS Code
set /p "REPLY=Do you want to open VS Code now? (y/N): "
if /i "%REPLY%"=="y" (
    echo [INFO] Opening VS Code...
    code .
    echo [SUCCESS] VS Code opened
)

echo [SUCCESS] Development installation completed successfully!
echo [INFO] You can now use the Ludus extension in VS Code
echo [INFO] Look for the game controller icon in the Activity Bar

REM Show extension info
echo.
echo [INFO] Extension details:
code --list-extensions --show-versions | findstr ludus

pause