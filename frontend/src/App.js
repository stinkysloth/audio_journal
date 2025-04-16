import React, { useState } from 'react';
import { CssBaseline, Container, Typography, Box, Tabs, Tab } from '@mui/material';
import AudioRecorder from './AudioRecorder';
import EntryViewer from './EntryViewer';
import FileImporter from './FileImporter';

function App() {
  const [tab, setTab] = useState(0);
  return (
    <Container maxWidth="md">
      <CssBaseline />
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" gutterBottom color="primary">Audio Journal</Typography>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
          <Tab label="Record" />
          <Tab label="Entries" />
          <Tab label="Import" />
        </Tabs>
        {tab === 0 && (
          <Box sx={{ mt: 8, textAlign: 'center' }}>
            <Typography variant="h6">
              Welcome! Start recording your audio journal entries.
            </Typography>
            <AudioRecorder />
          </Box>
        )}
        {tab === 1 && <EntryViewer />}
        {tab === 2 && <FileImporter />}
      </Box>
    </Container>
  );
}

export default App;
