import React from 'react';
import { CssBaseline, Container, Typography, Box } from '@mui/material';
import AudioRecorder from './AudioRecorder';

function App() {
  return (
    <>
      <CssBaseline />
      <Container maxWidth="sm">
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="h3" color="primary" gutterBottom>
            Audio Journal
          </Typography>
          <Typography variant="h6">
            Welcome! Start recording your audio journal entries.
          </Typography>
          <AudioRecorder />
        </Box>
      </Container>
    </>
  );
}

export default App;
