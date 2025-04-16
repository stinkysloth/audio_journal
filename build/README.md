# Build & Packaging Instructions

This directory contains scripts and instructions for building and packaging the Audio Journal app as a native Mac application with all dependencies bundled.

## Overview
- Uses Electron (electron-builder) to package the app as a `.app` or DMG installer.
- Python scripts for transcription and summarization are bundled using PyInstaller.
- AI models (Whisper, LLM) are included or downloaded on first launch.

## Steps
1. **Bundle Python Scripts:**
   - Use PyInstaller to create standalone binaries for `transcribe.py` and `summarize.py`.
   - Place the binaries in a `/bin` directory inside the app package.
2. **Bundle Models:**
   - Place Whisper and LLM models in `/models` or implement a first-run download routine.
3. **Build Electron App:**
   - Use `electron-builder` to package the app for MacOS.
   - Ensure `bin` and `models` directories are included in the packaged app.
4. **Test:**
   - Run the packaged app on a clean Mac to verify all features work without external dependencies.

## Example Commands

```
# 1. Build Python binaries
pyinstaller --onefile ../local-ai/transcribe.py
pyinstaller --onefile ../local-ai/summarize.py

# 2. Build Electron app
npm run build
npm run dist
```

See BUILDING.md for detailed, step-by-step instructions.
