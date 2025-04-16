const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveAudio: (audioBlob) => ipcRenderer.invoke('save-audio', audioBlob),
  processImportedFile: (file, entryName) => ipcRenderer.invoke('process-imported-file', file, entryName),
});
