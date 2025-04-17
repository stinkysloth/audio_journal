import React, { useRef, useState, useEffect } from 'react';
import { IconButton, Box, Typography, LinearProgress, Stack } from '@mui/material';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import StopIcon from '@mui/icons-material/Stop';
import SaveIcon from '@mui/icons-material/Save';
import WaveformVisualizer from './WaveformVisualizer';

/**
 * AudioRecorder component for recording and saving audio files.
 *
 * Returns:
 *     React element
 */
function AudioRecorder({ prompts = [] }) {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [status, setStatus] = useState('');
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [obsidianMsg, setObsidianMsg] = useState('');
  const [micPermission, setMicPermission] = useState(null); // null=unknown, true=granted, false=denied
  const mediaRecorderRef = useRef(null);
  const chunks = useRef([]);
  const [audioStream, setAudioStream] = useState(null);

  // Prompt display state
  const [promptIdx, setPromptIdx] = useState(0);
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptFade, setPromptFade] = useState('in'); // 'in', 'out', or ''
  const [promptTimer, setPromptTimer] = useState(0);
  const promptTimeoutRef = useRef(null);
  const fadeTimeoutRef = useRef(null);

  useEffect(() => {
    if (!navigator.permissions) return;
    navigator.permissions.query({ name: 'microphone' }).then((result) => {
      setMicPermission(result.state === 'granted');
      result.onchange = () => setMicPermission(result.state === 'granted');
    }).catch(() => setMicPermission(null));
  }, []);

  useEffect(() => {
    if (recording && prompts.length > 0) {
      setPromptIdx(0);
      setShowPrompt(true);
      setPromptFade('in');
      setPromptTimer(prompts[0].duration);
    } else {
      setShowPrompt(false);
      setPromptFade('');
      setPromptTimer(0);
      clearTimeout(promptTimeoutRef.current);
      clearTimeout(fadeTimeoutRef.current);
    }
  }, [recording, prompts]);

  useEffect(() => {
    if (!showPrompt || prompts.length === 0 || !recording) return;
    if (promptTimer > 0) {
      const t = setTimeout(() => setPromptTimer(promptTimer - 1), 1000);
      return () => clearTimeout(t);
    } else {
      // Fade out, then switch to next prompt
      setPromptFade('out');
      fadeTimeoutRef.current = setTimeout(() => {
        const nextIdx = (promptIdx + 1) % prompts.length;
        setPromptIdx(nextIdx);
        setPromptFade('in');
        setPromptTimer(prompts[nextIdx].duration);
      }, 1000);
    }
  }, [promptTimer, showPrompt, promptIdx, prompts, recording]);

  useEffect(() => () => {
    clearTimeout(promptTimeoutRef.current);
    clearTimeout(fadeTimeoutRef.current);
  }, []);

  const startRecording = async () => {
    setStatus('Requesting microphone...');
    if (micPermission === false) {
      setStatus('Microphone access denied. Please enable it in System Settings.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('DEBUG: Stream obtained:', stream);
      const tracks = stream.getAudioTracks();
      console.log(`DEBUG: Found ${tracks.length} audio tracks.`);
      if (!tracks.length) {
        setStatus('No audio input devices detected.');
        console.error('No audio tracks available in stream.');
        return;
      }
      if (!tracks[0].enabled) {
        setStatus('Audio input is disabled. Please check your mic settings.');
        console.error('Audio track is disabled:', tracks[0]);
        return;
      }
      if (tracks[0].muted) {
        setStatus('Audio input is muted. Please unmute your microphone.');
        console.error('Audio track is muted:', tracks[0]);
        return;
      }
      setAudioStream(stream);
      mediaRecorderRef.current = new window.MediaRecorder(stream);
      chunks.current = [];
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log(`DEBUG: ondataavailable - chunk size: ${event.data.size}`);
          chunks.current.push(event.data);
        } else {
          console.log("DEBUG: ondataavailable - received empty chunk.");
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        console.log("DEBUG: Recording stopped. Processing audio chunks.");
        console.log(`DEBUG: Total chunks collected: ${chunks.current.length}`);
        const totalSize = chunks.current.reduce((sum, chunk) => sum + chunk.size, 0);
        console.log(`DEBUG: Total data size before blob: ${totalSize} bytes`);

        if (totalSize === 0) {
          console.error("ERROR: No audio data collected. Recording was likely silent.");
          setStatus('Error: No audio data captured. Check mic & permissions.');
          setAudioURL(null);
          setRecording(false);
          return; // Don't try to save an empty blob
        }

        const audioBlob = new Blob(chunks.current, { type: 'audio/webm' });
        console.log(`DEBUG: Final Blob size: ${audioBlob.size}, type: ${audioBlob.type}`);
        setAudioBlob(audioBlob);
        setAudioURL(URL.createObjectURL(audioBlob));
        setStatus('Recording stopped.');
      };
      mediaRecorderRef.current.start();
      setRecording(true);
      setStatus('Recording...');
    } catch (err) {
      setStatus('Microphone access denied.');
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      setStatus('Processing audio...');
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
        setAudioStream(null);
      }
    }
  };

  const saveRecording = async () => {
    if (!audioBlob) return;
    setStatus('Saving audio...');
    console.log("DEBUG: Saving audio...");
    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      console.log(`DEBUG: Sending ${arrayBuffer.byteLength} bytes via IPC.`);
      const result = await window.electronAPI.saveAudio(arrayBuffer);
      console.log('DEBUG: Save audio result:', result);
      if (result && result.success) {
        if (result.transcript) {
          setTranscript(result.transcript);
        }
        if (result.summary) {
          setSummary(result.summary);
        }
        if (result.obsidianResult) {
          setObsidianMsg(result.obsidianResult);
        }
        setStatus('Audio saved!');
      } else {
        setStatus('Save failed.');
      }
    } catch (err) {
      setStatus('Save failed.');
    }
  };

  return (
    <Box sx={{ mt: 4, textAlign: 'center', position: 'relative' }}>
      <Typography variant="h5">Audio Journal Entry</Typography>
      {micPermission === false && (
        <Typography color="error" sx={{ mt: 2 }}>
          Microphone access is blocked. Please enable it in System Settings &gt; Privacy &amp; Security &gt; Microphone.
        </Typography>
      )}
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
      {recording && (
        <>
          <LinearProgress sx={{ mt: 2 }} />
          <WaveformVisualizer audioStream={audioStream} isActive={recording} />
          {showPrompt && prompts.length > 0 && (
            <Box
              sx={{
                position: 'absolute',
                left: 0, right: 0, top: 90,
                mx: 'auto',
                width: '60%',
                bgcolor: 'background.paper',
                borderRadius: 3,
                py: 2,
                boxShadow: 8,
                opacity: promptFade === 'in' ? 1 : 0,
                transition: 'opacity 1s',
                pointerEvents: 'none',
                zIndex: 10,
              }}
            >
              <Typography variant="h4" color="primary" sx={{ mb: 1 }}>{prompts[promptIdx].label}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                <Box
                  sx={{
                    width: 80,
                    height: 8,
                    bgcolor: promptTimer <= 5 ? 'error.main' : 'grey.400',
                    borderRadius: 4,
                    mr: 1,
                    transition: 'background 0.5s',
                  }}
                >
                  <Box
                    sx={{
                      width: `${(promptTimer / prompts[promptIdx].duration) * 100}%`,
                      height: '100%',
                      bgcolor: promptTimer <= 5 ? 'error.dark' : 'primary.main',
                      borderRadius: 4,
                      transition: 'width 1s',
                    }}
                  />
                </Box>
                <Typography variant="body2" color={promptTimer <= 5 ? 'error' : 'text.secondary'}>
                  {promptTimer}s
                </Typography>
              </Box>
              {promptTimer <= 5 && (
                <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                  Next topic soon...
                </Typography>
              )}
            </Box>
          )}
        </>
      )}
    </Box>
  );
}

export default AudioRecorder;
