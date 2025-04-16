const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { ENTRIES_DIR } = require('./constants');

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, '../frontend/public/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    title: 'Audio Journal',
  });
  win.loadURL('http://localhost:3000');
}

app.whenReady().then(() => {
  // Ensure entries directory exists
  if (!fs.existsSync(ENTRIES_DIR)) {
    fs.mkdirSync(ENTRIES_DIR, { recursive: true });
  }
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC handler to save audio file (no dialog, auto-save)
ipcMain.handle('save-audio', async (event, arrayBuffer) => {
  try {
    const buffer = Buffer.from(arrayBuffer);
    const filename = `audio-journal-entry-${Date.now()}.webm`;
    const filePath = path.join(ENTRIES_DIR, filename);
    fs.writeFileSync(filePath, buffer);
    // Call transcription script
    const transcript = await transcribeAudio(filePath);
    // Save transcript to .txt file
    const transcriptPath = filePath.replace(/\.webm$/, '.txt');
    fs.writeFileSync(transcriptPath, transcript, 'utf-8');
    // Call summarization script
    const summary = await summarizeTranscript(transcriptPath);
    return { success: true, filePath, transcript, summary };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

function transcribeAudio(audioPath) {
  return new Promise((resolve, reject) => {
    const py = spawn('python3', [path.join(__dirname, '../local-ai/transcribe.py'), audioPath]);
    let out = '';
    let err = '';
    py.stdout.on('data', (data) => { out += data.toString(); });
    py.stderr.on('data', (data) => { err += data.toString(); });
    py.on('close', (code) => {
      if (code === 0) {
        resolve(out.trim());
      } else {
        reject(new Error('Transcription failed: ' + err));
      }
    });
  });
}

function summarizeTranscript(transcriptPath) {
  return new Promise((resolve, reject) => {
    const py = spawn('python3', [path.join(__dirname, '../local-ai/summarize.py'), transcriptPath]);
    let out = '';
    let err = '';
    py.stdout.on('data', (data) => { out += data.toString(); });
    py.stderr.on('data', (data) => { err += data.toString(); });
    py.on('close', (code) => {
      if (code === 0) {
        resolve(out.trim());
      } else {
        reject(new Error('Summarization failed: ' + err));
      }
    });
  });
}
