// Expose Electron APIs to the renderer process (frontend)
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveAudio: (audioBlob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        ipcRenderer.invoke('save-audio', reader.result)
          .then(resolve)
          .catch(reject);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(audioBlob);
    });
  },
  listEntries: () => ipcRenderer.invoke('list-entries'),
});
