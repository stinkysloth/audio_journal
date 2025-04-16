const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { ENTRIES_DIR } = require('./constants');

/**
 * List all journal entries with metadata.
 * Reads from ENTRIES_DIR, which is now userData in packaged app.
 */
function listEntries() {
  if (!fs.existsSync(ENTRIES_DIR)) return [];
  const files = fs.readdirSync(ENTRIES_DIR).filter(f => f.endsWith('.webm'));
  return files.map(f => {
    const base = f.replace(/\.webm$/, '');
    const transcriptPath = path.join(ENTRIES_DIR, base + '.txt');
    const summaryPath = path.join(ENTRIES_DIR, base + '.summary.txt');
    const metaPath = path.join(ENTRIES_DIR, base + '.yaml');
    let transcript = null, summary = null, tags = [], date = null;
    if (fs.existsSync(transcriptPath)) transcript = fs.readFileSync(transcriptPath, 'utf-8');
    if (fs.existsSync(summaryPath)) summary = fs.readFileSync(summaryPath, 'utf-8');
    if (fs.existsSync(metaPath)) {
      try {
        const meta = yaml.load(fs.readFileSync(metaPath, 'utf-8'));
        tags = meta.tags || [];
        date = meta.date || null;
      } catch (e) { /* ignore */ }
    }
    return {
      file: path.join(ENTRIES_DIR, f),
      transcript,
      summary,
      tags,
      date,
    };
  });
}

module.exports = { listEntries };
