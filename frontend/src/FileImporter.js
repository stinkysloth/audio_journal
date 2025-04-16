import React, { useState } from 'react';
import { Box, Typography, Button, TextField, CircularProgress, Stack, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

/**
 * FileImporter allows the user to select a file from disk and run it through the AI pipeline.
 * - Supports searching (browsing) for files on disk.
 * - Shows parsing/progress status.
 */
function extractDateFromFilename(filename) {
  // Look for YYYY-MM-DD or YYYYMMDD or similar
  const re = /(20\d{2}[\-_]?(0[1-9]|1[0-2])[\-_]?(0[1-9]|[12][0-9]|3[01]))/;
  const match = filename.match(re);
  if (match) {
    let dateStr = match[1].replace(/[-_]/g, '');
    return dateStr.length === 8
      ? `${dateStr.slice(0,4)}-${dateStr.slice(4,6)}-${dateStr.slice(6,8)}`
      : match[1];
  }
  return null;
}

function FileImporter() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [status, setStatus] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [proposedName, setProposedName] = useState('');
  const [showNameDialog, setShowNameDialog] = useState(false);

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setResult(null);
      setStatus('');
      // Propose name
      let baseName = file.name.replace(/\.[^/.]+$/, "");
      let date = extractDateFromFilename(baseName);
      if (!date) {
        // Use file's lastModified date
        const d = new Date(file.lastModified);
        date = d.toISOString().slice(0,10);
      }
      let nameSuggestion = `${date} Imported Entry`;
      setProposedName(nameSuggestion);
      setShowNameDialog(true);
    }
  };

  const handleAcceptName = () => {
    setShowNameDialog(false);
  };

  const handleNameChange = (e) => {
    setProposedName(e.target.value);
  };

  const handleProcess = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setStatus('Processing file...');
    setResult(null);
    try {
      const res = await window.electronAPI.processImportedFile(selectedFile, proposedName);
      setResult(res.result || res.summary || JSON.stringify(res));
      setStatus(res.success ? 'File processed.' : 'Processing failed.');
    } catch (err) {
      setStatus('Error processing file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 8, textAlign: 'center' }}>
      <Typography variant="h6" gutterBottom>
        Import and Analyze a File
      </Typography>
      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 2 }}>
        <Button variant="contained" component="label">
          Choose File
          <input type="file" hidden onChange={handleFileChange} />
        </Button>
        <TextField
          value={selectedFile ? selectedFile.name : ''}
          label="Selected File"
          variant="outlined"
          size="small"
          InputProps={{ readOnly: true }}
          sx={{ minWidth: 200 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleProcess}
          disabled={!selectedFile || loading || showNameDialog}
        >
          Run AI
        </Button>
      </Stack>
      {loading && <CircularProgress sx={{ mt: 2 }} />}
      {status && <Typography sx={{ mt: 2 }}>{status}</Typography>}
      {result && (
        <Box sx={{ mt: 4, textAlign: 'left' }}>
          <Typography variant="subtitle1">Result:</Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{result}</Typography>
        </Box>
      )}
      <Dialog open={showNameDialog} onClose={handleAcceptName}>
        <DialogTitle>Confirm Entry Name</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Entry Name"
            type="text"
            fullWidth
            value={proposedName}
            onChange={handleNameChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAcceptName} variant="contained">Accept</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default FileImporter;
