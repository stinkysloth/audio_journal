# Building and Packaging Audio Journal (Mac)

This guide describes how to build and package the Audio Journal desktop app as a fully self-contained native Mac application.

## Prerequisites
- MacOS (for building native `.app`)
- Node.js (for Electron/React)
- Python 3.8+ (for PyInstaller, Whisper, LLM)
- PyInstaller (`pip install pyinstaller`)
- electron-builder (`npm install -g electron-builder`)

## Steps

### 1. Bundle Python Scripts
- From the project root:
  ```bash
  pyinstaller --onefile local-ai/transcribe.py
  pyinstaller --onefile local-ai/summarize.py
  mkdir -p app/bin
  mv dist/transcribe app/bin/
  mv dist/summarize app/bin/
  ```
- Ensure `app/main.js` calls these binaries from `app/bin/` instead of `python3 ...`

### 2. Bundle AI Models
- Place Whisper and LLM models in a `models/` directory (or implement a download-on-first-run routine in the app).
- Update Python scripts to look for models in the correct bundled path.

### 3. Build Electron App
- From the project root:
  ```bash
  npm install
  cd frontend && npm install && npm run build && cd ..
  npm run dist
  ```
- This creates a `.app` or DMG installer in the `dist/` directory.

### 4. Test the Packaged App
- Run the packaged `.app` on a clean Mac.
- Confirm audio, transcription, summarization, and UI all work without external installs.

### 5. Troubleshooting
- If models are missing, check the `models/` directory or app logs.
- If binaries fail, ensure PyInstaller output is included and permissions are correct.

---

For further help, see `/build/README.md` or contact the maintainer.
