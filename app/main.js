const { app, BrowserWindow, ipcMain, session, systemPreferences } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn, spawnSync } = require('child_process');
const { ENTRIES_DIR } = require('./constants');
const { listEntries } = require('./entries');

function createWindow() {
  const isDev = process.env.NODE_ENV === 'development' || process.env.ELECTRON_START_URL;
  const preloadPath = isDev
    ? path.join(__dirname, '../frontend/public/preload.js')
    : path.join(__dirname, '../frontend/build/preload.js');
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
    },
    title: 'Audio Journal',
  });

  // Always open DevTools in production for debugging until stable
  win.webContents.openDevTools();

  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    win.webContents.openDevTools();
    console.error('Renderer failed to load:', errorCode, errorDescription);
  });
  win.webContents.on('crashed', () => {
    win.webContents.openDevTools();
    console.error('Renderer process crashed');
  });
  win.webContents.on('did-finish-load', () => {
    console.log('Frontend loaded');
  });

  // Load dev server in development, built index.html in production
  if (isDev) {
    win.loadURL('http://localhost:3000');
  } else {
    win.loadFile(path.join(__dirname, '../frontend/build/index.html'));
  }
}

// Request mic permission at startup
app.whenReady().then(async () => {
  try {
    if (process.platform === 'darwin') {
      const micStatus = systemPreferences.getMediaAccessStatus('microphone');
      if (micStatus !== 'granted') {
        const granted = await systemPreferences.askForMediaAccess('microphone');
        if (!granted) {
          console.error('Microphone access denied by user.');
        }
      }
    }
  } catch (e) {
    console.error('Error requesting microphone access:', e);
  }
  // Ensure entries directory exists (now always userData)
  const userDataPath = app.getPath('userData');
  const entriesDir = path.join(userDataPath, 'entries');
  if (!fs.existsSync(entriesDir)) {
    fs.mkdirSync(entriesDir, { recursive: true });
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
    const filePath = path.join(entriesDir, filename);
    fs.writeFileSync(filePath, buffer);
    // Call transcription script
    const transcript = await transcribeAudio(filePath);
    // Save transcript to .txt file
    const transcriptPath = filePath.replace(/\.webm$/, '.txt');
    fs.writeFileSync(transcriptPath, transcript, 'utf-8');
    // Call summarization script
    const summary = await summarizeTranscript(transcriptPath);
    // Call Obsidian export script
    const obsidianExportPath = path.join(__dirname, '../obsidian-sync/markdown_export.py');
    const configPath = path.join(__dirname, '../obsidian-sync/config.json');
    let obsidianResult = null;
    if (fs.existsSync(configPath)) {
      const exportProc = spawnSync('python3', [obsidianExportPath, filePath, transcriptPath, summary], { encoding: 'utf-8' });
      if (exportProc.status === 0) {
        obsidianResult = exportProc.stdout.trim();
      } else {
        obsidianResult = `Obsidian export failed: ${exportProc.stderr}`;
      }
    } else {
      obsidianResult = 'Obsidian config not found; export skipped.';
    }
    return { success: true, filePath, transcript, summary, obsidianResult };
  } catch (err) {
    console.error('Error saving audio:', err);
    return { success: false, error: err.message };
  }
});

// IPC handler to list all journal entries
ipcMain.handle('list-entries', async () => {
  try {
    const { listEntries } = require('./entries');
    return listEntries();
  } catch (err) {
    console.error('Error listing entries:', err);
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
