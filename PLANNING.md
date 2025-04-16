# Planning: Audio Journal Desktop App

## Architecture
- Electron for desktop shell
- React (frontend)
- Node.js backend (main process)
- Local transcription (Whisper, Python, auto-run after save)
- Local summarization (LLM, Python, auto-run after transcript)
- Obsidian vault Markdown integration

## Directory Structure
- `/app`: Electron main process
- `/frontend`: React UI
- `/local-ai`: Whisper + LLM wrappers
- `/obsidian-sync`: Markdown/Obsidian integration
- `/tests`: Pytest-style tests (backend logic)

## Conventions
- PEP8 for Python (AI scripts)
- Prettier/ESLint for JS/TS
- Pytest for backend tests

## Styling
- Material-UI, modern, dark mode default

## Packaging & Deployment
- The app is distributed as a native Mac `.app` using Electron's packaging tools (electron-builder).
- All dependencies (Node, Python, Whisper, LLM, scripts, and models) are bundled inside the app.
- Python scripts are packaged using PyInstaller for standalone execution.
- On first launch, the app checks/downloads AI models if not present.
- No Docker or external installs required for end users.

## Build Pipeline
- `/build` directory will contain build/package scripts and configuration.
- See README for build instructions.

## Features
- Audio recording UI
- Whisper integration (local transcription)
- LLM summarization (local)
- Obsidian Markdown export after each entry, with attachments and summary
- Master index page auto-updated with links to all entries
- In-app entry viewer: browse, search, and view all journal entries (audio, transcript, summary)

## TODO
- [x] Initial scaffolding
- [x] Audio recording UI
- [x] Whisper integration (local transcription)
- [x] LLM summarization (local)
- [x] Obsidian export (auto Markdown note, attachments)
- [x] Master index page auto-update
- [x] Entry viewer (in-app)
- [ ] Aggregate summaries
