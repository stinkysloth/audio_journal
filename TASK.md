# TASK.md

## Current Tasks
- [x] Project scaffolding (Electron + React + folders) (2025-04-16)
- [x] Audio recording UI (2025-04-16)
- [x] Local transcription with Whisper (2025-04-16)
- [x] Local summarization with LLM (2025-04-16)
- [x] Obsidian Markdown export (2025-04-16)
- [x] Entry viewer
- [x] Master index page auto-update (2025-04-16)
- [x] Aggregate summaries
- [x] Native packaging: Electron + Python + models (2025-04-16)
- [x] Build scripts for all-in-one Mac app (2025-04-16)
- [x] Remove venv from packaging; use system Python for AI features
- [x] Add robust system Python/dependency checks and user-friendly errors
- [x] Document system Python requirement and requirements.txt in README
- [x] Document venv and dependency approach in README
- [x] Document packaging and build process
- [x] Add Import tab for uploading files and running them through AI pipeline (2025-04-16)
- [x] Suggest and confirm entry name for imported files (date from filename or file creation date)
- [x] Ensure Python scripts are run from .asar.unpacked in packaged builds
- [x] Improve error handling for file import and AI pipeline

## Discovered During Work
- [ ] Add AI model download/setup instructions
- [ ] Add Obsidian vault path configuration
- [ ] Improve summary robustness (edge cases, long transcripts)
- [ ] Add error handling for Python script failures
- [ ] Explore PyInstaller or similar for fully bundled AI in future
- [ ] Consider automating venv rebuild as part of packaging script
- [ ] Integrate full AI/Obsidian pipeline for imported files using chosen entry name
- [ ] Add batch import and more file type support
