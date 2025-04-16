import React, { useRef, useState } from 'react';
import { IconButton, Box, Typography, LinearProgress, Stack } from '@mui/material';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import StopIcon from '@mui/icons-material/Stop';
import SaveIcon from '@mui/icons-material/Save';

/**
 * AudioRecorder component for recording and saving audio files.
 *
 * Returns:
 *     React element
 */
function AudioRecorder() {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [status, setStatus] = useState('');
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [obsidianMsg, setObsidianMsg] = useState('');
  const mediaRecorderRef = useRef(null);
  const chunks = useRef([]);

  const startRecording = async () => {
    setStatus('Requesting microphone...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new window.MediaRecorder(stream);
      chunks.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioURL(URL.createObjectURL(blob));
        setStatus('Recording stopped.');
      };
      mediaRecorderRef.current.start();
      setRecording(true);
      setStatus('Recording...');
    } catch (err) {
      setStatus('Microphone access denied.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      setStatus('Processing audio...');
    }
  };

  const saveRecording = async () => {
    if (!audioBlob) return;
    setStatus('Saving audio...');
    window.electronAPI.saveAudio(audioBlob)
      .then((res) => {
        if (res && res.success) {
          setStatus('Audio saved!');
          if (res.transcript) {
            setTranscript(res.transcript);
          }
          if (res.summary) {
            setSummary(res.summary);
          }
          if (res.obsidianResult) {
            setObsidianMsg(res.obsidianResult);
          }
        } else {
          setStatus('Save failed.');
        }
      })
      .catch(() => setStatus('Save failed.'));
  };

  return (
    <Box sx={{ mt: 4, textAlign: 'center' }}>
      <Typography variant="h5">Audio Journal Entry</Typography>
      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
        <IconButton color="error" onClick={startRecording} disabled={recording} aria-label="Start Recording">
          <FiberManualRecordIcon fontSize="large" />
        </IconButton>
        <IconButton color="primary" onClick={stopRecording} disabled={!recording} aria-label="Stop Recording">
          <StopIcon fontSize="large" />
        </IconButton>
        <IconButton color="success" onClick={saveRecording} disabled={!audioBlob} aria-label="Save Recording">
          <SaveIcon fontSize="large" />
        </IconButton>
      </Stack>
      {status && <Typography sx={{ mt: 2 }}>{status}</Typography>}
      {audioURL && (
        <audio controls src={audioURL} style={{ marginTop: 16, width: '100%' }} />
      )}
      {transcript && (
        <Box sx={{ mt: 3, textAlign: 'left' }}>
          <Typography variant="subtitle1" color="secondary">Transcript:</Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{transcript}</Typography>
        </Box>
      )}
      {summary && (
        <Box sx={{ mt: 3, textAlign: 'left' }}>
          <Typography variant="subtitle1" color="primary">Summary:</Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{summary}</Typography>
        </Box>
      )}
      {obsidianMsg && (
        <Box sx={{ mt: 3, textAlign: 'left' }}>
          <Typography variant="subtitle2" color="secondary">Obsidian Export:</Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{obsidianMsg}</Typography>
        </Box>
      )}
      {recording && <LinearProgress sx={{ mt: 2 }} />}
    </Box>
  );
}

export default AudioRecorder;
