# Audio Journal (Mac Desktop)

A local-first, AI-powered audio journaling desktop app for Mac. Features audio recording, transcription, summarization, and seamless integration with Obsidian.

## Features
- Record audio journal entries
- Local transcription (Whisper, Python, auto-run after save)
- Local summarization (LLM, Python, auto-run after transcript)
- Export to Obsidian vault with tags and summaries
- Browse, search, and summarize entries over time
- **Entry Viewer:**
  - Browse all journal entries within the app.
  - See summaries, audio, transcripts, and tags in a modern UI.

## Setup

### Requirements
- Node.js (Electron/React)
- Python 3.8+
- `openai-whisper` Python package for transcription
- Local LLM Python package for summarization (e.g., GPT4All, llama.cpp, or placeholder)

### How it works
1. Record audio in the Electron app
2. Audio is saved locally and transcribed using Whisper
3. Transcript is summarized using a local LLM
4. Both transcript and summary are shown in the UI
5. (Coming soon) Export to Obsidian vault

### Running tests
- Run `pytest tests/` for backend logic

## Packaging, Deployment, and Native Build Approach

### Overview
Our approach to packaging and deployment is designed to provide a seamless user experience while ensuring the security and integrity of the application.

### Key Considerations
- **Native Integration:** We prioritize native integration with the Mac operating system to provide a cohesive user experience.
- **Security:** We ensure that all dependencies and models are bundled securely to prevent any potential vulnerabilities.
- **Ease of Use:** Our goal is to make the application easy to install and run, with minimal setup required.
- **Obsidian Integration:**
  - Each entry is exported as a Markdown note with embedded audio, transcript, and summary.
  - Attachments are copied to the vault.
  - A master index page (`Audio Journal Index.md`) is auto-updated with links to all entries.

## Packaging & Deployment

- **Native Mac App:** Distributed as a single `.app` (or DMG installer) using Electron's packaging tools.
- **All-in-one:** Node, Python, AI scripts, and models are bundled. No Docker or external installs required.
- **Python scripts** use PyInstaller for standalone binaries.
- On first run, models are downloaded if not present.

### Building the App
See `/build/README.md` for build and packaging instructions.
