const path = require('path');

let ENTRIES_DIR;
try {
  // In Electron main process, app is available
  const electron = require('electron');
  ENTRIES_DIR = path.join(electron.app.getPath('userData'), 'entries');
} catch (e) {
  // For scripts or tests, fallback to a local folder
  ENTRIES_DIR = path.join(__dirname, '../entries');
}

module.exports = {
  ENTRIES_DIR,
};
