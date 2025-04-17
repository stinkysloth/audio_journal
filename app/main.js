// ---- PATCH: Ensure ffmpeg is in PATH for all subprocesses ----
const homebrewBin = '/opt/homebrew/bin';
const usrLocalBin = '/usr/local/bin';
const pathParts = [homebrewBin, usrLocalBin, process.env.PATH || ''];
process.env.PATH = pathParts.filter(Boolean).join(':');
// -------------------------------------------------------------

// Patch PATH for Homebrew Python on macOS and add debug logging
if (process.platform === 'darwin') {
  process.env.PATH = '/opt/homebrew/bin:/opt/homebrew/opt/python@3.11/bin:' + process.env.PATH;
  const { spawnSync } = require('child_process');
  // console.log('Electron PATH:', process.env.PATH);
  const which = spawnSync('which', ['python3.11'], { encoding: 'utf-8' });
  // console.log('Electron which python3.11:', which.stdout, which.stderr);
  const ver = spawnSync('python3.11', ['--version'], { encoding: 'utf-8' });
  // console.log('Electron python3.11 --version:', ver.stdout, ver.stderr);
}

const { app, BrowserWindow, ipcMain, session, systemPreferences } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn, spawnSync } = require('child_process');
const { ENTRIES_DIR } = require('./constants');
const { listEntries } = require('./entries');

console.time('App Startup');

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

  if (process.env.NODE_ENV === 'development') {
    win.webContents.openDevTools();
  }

  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    win.webContents.openDevTools();
    // console.error('Renderer failed to load:', errorCode, errorDescription);
  });
  win.webContents.on('crashed', () => {
    win.webContents.openDevTools();
    // console.error('Renderer process crashed');
  });
  win.webContents.on('did-finish-load', () => {
    // console.log('Frontend loaded');
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
  createWindow();
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
  console.timeEnd('App Startup');
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

const logErrorToFile = (err, context = '') => {
  try {
    const userDataPath = app.getPath('userData');
    const logPath = path.join(userDataPath, 'audio-journal-error.log');
    let msg = `[${new Date().toISOString()}]`;
    if (context) msg += ` [${context}]`;
    msg += ` ${err && err.stack ? err.stack : err && err.message ? err.message : String(err)}\n`;
    fs.appendFileSync(logPath, msg, 'utf-8');
  } catch (e) { /* Ignore logging errors */ }
};

process.on('uncaughtException', err => {
  // console.error('Uncaught Exception:', err);
  logErrorToFile(err, 'uncaughtException');
});
process.on('unhandledRejection', (reason, promise) => {
  // console.error('Unhandled Rejection:', reason);
  logErrorToFile(reason, 'unhandledRejection');
});

function getSystemPythonPath() {
  // Try python3.11, then python3, then python
  const candidates = ['python3.11', 'python3', 'python'];
  for (const exe of candidates) {
    try {
      const check = spawnSync(exe, ['--version'], { encoding: 'utf-8' });
      if (check.status === 0 && check.stdout.match(/Python (3\.(1[1-9]|[2-9][0-9]))/)) {
        return exe;
      }
    } catch (e) { /* ignore */ }
  }
  return null;
}

function checkPythonAndDependencies() {
  const pythonExe = getSystemPythonPath();
  if (!pythonExe) {
    return 'Python 3.11+ not found. Please install Python 3.11+ from https://www.python.org/downloads/ or via Homebrew.';
  }
  try {
    const check = spawnSync(pythonExe, ['-c', 'import whisper, torch; print("OK")'], { encoding: 'utf-8' });
    if (check.status !== 0 || !check.stdout.includes('OK')) {
      return 'Required Python packages (whisper, torch) not installed.\nRun: pip3 install -r requirements.txt\n' + (check.stderr || check.stdout);
    }
    return true;
  } catch (err) {
    return err.message || String(err);
  }
}

const pythonCheckResult = checkPythonAndDependencies();
if (pythonCheckResult !== true) {
  app.whenReady().then(() => {
    const { dialog } = require('electron');
    dialog.showErrorBox('Python Environment Error',
      `Audio Journal cannot start AI features.\n\n${pythonCheckResult}\n\nSee README.md for help.`
    );
  });
}

function getScriptPath(relPath) {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'app.asar.unpacked', relPath);
  }
  return path.join(__dirname, relPath);
}

function resolveUnpackedScript(scriptRelativePath) {
  // Always resolve to .asar.unpacked for Python scripts
  const base = process.resourcesPath;
  // Handles both dev and packaged environments
  const unpackedPath = path.join(base, 'app.asar.unpacked', scriptRelativePath);
  const fs = require('fs');
  if (fs.existsSync(unpackedPath)) return unpackedPath;
  // Fallback for dev: use local path
  const devPath = path.join(__dirname, '..', scriptRelativePath);
  if (fs.existsSync(devPath)) return devPath;
  throw new Error(`Script not found: ${scriptRelativePath}`);
}

function transcribeAudio(audioPath) {
  return new Promise((resolve, reject) => {
    const pythonExe = getSystemPythonPath();
    const scriptPath = resolveUnpackedScript('local-ai/transcribe.py');
    const proc = spawn(pythonExe, [scriptPath, audioPath], { encoding: 'utf-8' });
    let output = '';
    let error = '';
    proc.stdout.on('data', data => { output += data; });
    proc.stderr.on('data', data => { error += data; });
    proc.on('close', code => {
      if (code === 0) {
        resolve(output.trim());
      } else {
        reject(new Error(`Transcription failed: ${error}`));
      }
    });
  });
}

function summarizeTranscript(transcriptPath) {
  return new Promise((resolve, reject) => {
    const pythonExe = getSystemPythonPath();
    const scriptPath = resolveUnpackedScript('local-ai/summarize.py');
    const proc = spawn(pythonExe, [scriptPath, transcriptPath], { encoding: 'utf-8' });
    let output = '';
    let error = '';
    proc.stdout.on('data', data => { output += data; });
    proc.stderr.on('data', data => { error += data; });
    proc.on('close', code => {
      if (code === 0) {
        resolve(output.trim());
      } else {
        reject(new Error(`Summarization failed: ${error}`));
      }
    });
  });
}

// IPC handler to save audio file (no dialog, auto-save)
ipcMain.handle('save-audio', async (event, arrayBuffer) => {
  try {
    const buffer = Buffer.from(arrayBuffer);
    const userDataPath = app.getPath('userData');
    const entriesDir = path.join(userDataPath, 'entries');
    if (!fs.existsSync(entriesDir)) {
      fs.mkdirSync(entriesDir, { recursive: true });
    }
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
    const pythonExe = getSystemPythonPath();
    const obsidianExportPath = resolveUnpackedScript('obsidian-sync/markdown_export.py');
    const configPath = resolveUnpackedScript('obsidian-sync/config.json');
    let obsidianResult = null;
    if (fs.existsSync(configPath)) {
      const exportProc = spawnSync(pythonExe, [obsidianExportPath, filePath, transcriptPath, summary], { encoding: 'utf-8' });
      if (exportProc.status === 0) {
        obsidianResult = exportProc.stdout.trim();
      } else {
        obsidianResult = `Obsidian export failed: ${exportProc.stderr}`;
        logErrorToFile(exportProc.stderr, 'obsidian-export-failed');
      }
    } else {
      obsidianResult = 'Obsidian config not found; export skipped.';
    }
    return { success: true, filePath, transcript, summary, obsidianResult };
  } catch (err) {
    // console.error('Error saving audio:', err);
    logErrorToFile(err, 'save-audio');
    return { success: false, error: err && err.stack ? err.stack : err && err.message ? err.message : String(err) };
  }
});

// IPC handler to list all journal entries
ipcMain.handle('list-entries', async () => {
  try {
    const { listEntries } = require('./entries');
    return listEntries();
  } catch (err) {
    // console.error('Error listing entries:', err);
    return { success: false, error: err.message };
  }
});

// IPC handler to process imported file
ipcMain.handle('process-imported-file', async (event, file, entryName) => {
  try {
    const fs = require('fs');
    const os = require('os');
    const { v4: uuidv4 } = require('uuid');
    const tempDir = os.tmpdir();
    const ext = path.extname(file.name);
    const tempPath = path.join(tempDir, `audio-journal-import-${uuidv4()}${ext}`);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(tempPath, buffer);
    // Use correct script path for Python AI pipeline
    let scriptPath;
    try {
      scriptPath = resolveUnpackedScript('local-ai/transcribe.py');
    } catch (e) {
      return { success: false, error: `Python script not found: ${e.message}` };
    }
    // Example: Run Python script (stub, real AI logic to be integrated)
    // const { spawnSync } = require('child_process');
    // const result = spawnSync('python3.11', [scriptPath, tempPath], { encoding: 'utf-8' });
    // if (result.error) throw result.error;
    // if (result.status !== 0) throw new Error(result.stderr);
    // return { success: true, result: result.stdout };
    return { success: true, result: `Imported file saved to ${tempPath} as '${entryName}'. Python script path: ${scriptPath}` };
  } catch (err) {
    return { success: false, error: err.message };
  }
});
