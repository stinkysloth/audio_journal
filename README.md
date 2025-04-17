# Audio Journal (Mac Desktop)

A **local-first, AI-powered audio journaling app** for Mac and cross-platform desktop. Your audio, transcripts, and summaries stay on your device—never in the cloud.

---

## Why Audio Journal?

Most audio journaling apps send your private thoughts to the cloud for AI processing. **Audio Journal is different:**
- **Local-first:** All audio, transcription, and summaries are processed and stored on your computer. Nothing leaves your device.
- **Obsidian Integration:** Export entries as Markdown to your Obsidian vault, complete with tags, transcripts, and AI-generated summaries.
- **Own your data:** No accounts, no subscriptions, no vendor lock-in.

---

## Features
- **Record audio journal entries** directly from the app.
- **Import existing audio files** (with smart entry naming).
- **Automatic transcription** using OpenAI Whisper (runs locally).
- **AI-powered summaries** using your choice of local LLM (e.g., GPT4All, llama.cpp).
- **Browse and search** all your entries, transcripts, and summaries.
- **Export to Obsidian** (or any Markdown-based system) with one click.
- **Tag entries** for easy organization.

---

## Installation

### Requirements
- **macOS, Windows, or Linux**
- **Node.js** (for building Electron app)
- **Python 3.11+** (system Python)
- Python packages: `openai-whisper`, `torch` (and optionally your preferred LLM for summarization)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/audio-journal.git
cd audio-journal
```

### 2. Install Node/Electron dependencies
```bash
npm install
cd frontend && npm install && cd ..
```

### 3. Install Python dependencies
```bash
pip3 install -r requirements.txt
```

### 4. Build and run the app
```bash
# Build frontend
cd frontend && npm run build && cd ..
# Package and launch Electron app
npm run dist
```

### 5. First launch setup
- On first launch, the app will check for Python 3.11+ and required packages.
- If missing, you'll see a clear error message with install instructions.
- Set your Obsidian vault path in `obsidian-sync/config.json` before exporting.

---

## Platform Notes

- **macOS:** Fully supported, tested on Apple Silicon and Intel Macs.
- **Windows/Linux:** Supported, but you must have Python 3.11+ and dependencies installed system-wide. Some features (like microphone permissions) may require additional setup.
- **Python:** You must use a system Python install, not a virtual environment, so the Electron app can invoke it.

---

## FAQ

**Q: Is my data private?**  
A: Yes. All audio, transcripts, and summaries are processed and stored locally. Nothing is sent to any server.

**Q: Can I use my own AI model?**  
A: Yes! You can configure the summarization step to use any local LLM that exposes a Python API.

**Q: Does it work with Obsidian?**  
A: Yes, you can export entries as Markdown files directly into your Obsidian vault.

**Q: Can I import old audio files?**  
A: Yes, use the Import tab to add and transcribe existing audio.

---

## Roadmap
- Batch import
- Customizable summary prompts
- More local LLM integrations
- Mobile companion app

---

## Contributing
Pull requests and issues are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## License
MIT
