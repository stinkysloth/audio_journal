import React, { useState, Suspense, lazy } from 'react';
import { CssBaseline, Box, Container, CircularProgress, Paper } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import Sidebar from './Sidebar';
import theme from './theme';
const AudioRecorder = lazy(() => import('./AudioRecorder'));
const EntryViewer = lazy(() => import('./EntryViewer'));
const FileImporter = lazy(() => import('./FileImporter'));
const PromptConfig = lazy(() => import('./PromptConfig'));

const defaultPrompts = [
  { label: 'Career', duration: 30 },
  { label: 'Family', duration: 30 },
  { label: 'Health', duration: 30 },
];

function App() {
  const [tab, setTab] = useState(0);
  const [prompts, setPrompts] = useState(defaultPrompts);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        <Sidebar selected={tab} onSelect={setTab} />
        <Container maxWidth={false} sx={{ flex: 1, p: 0, ml: '220px', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
            <Paper elevation={3} sx={{ width: '100%', maxWidth: 700, p: 4, bgcolor: 'background.paper', borderRadius: 4, boxShadow: 8 }}>
              <Suspense fallback={<Box sx={{ mt: 8, textAlign: 'center' }}><CircularProgress /></Box>}>
                {tab === 0 && <AudioRecorder prompts={prompts} />}
                {tab === 1 && <EntryViewer />}
                {tab === 2 && <FileImporter />}
                {tab === 3 && <PromptConfig prompts={prompts} setPrompts={setPrompts} />}
              </Suspense>
            </Paper>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
