import React, { useRef, useEffect } from 'react';

/**
 * WaveformVisualizer renders a real-time wiggly line waveform based on audio input.
 * Args:
 *   audioStream (MediaStream): The live audio stream from getUserMedia.
 *   isActive (boolean): Whether to actively show waveform.
 */
function WaveformVisualizer({ audioStream, isActive }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const audioCtxRef = useRef(null);

  useEffect(() => {
    if (!audioStream || !isActive) return;
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 1024; // Higher value = smoother line
    const source = audioCtx.createMediaStreamSource(audioStream);
    source.connect(analyser);
    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current = analyser;
    dataArrayRef.current = dataArray;
    audioCtxRef.current = audioCtx;

    function draw() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      analyser.getByteTimeDomainData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#1976d2';
      ctx.beginPath();
      const midY = canvas.height / 2;
      const sliceWidth = canvas.width / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0; // 0-2
        const y = midY + (v - 1) * (canvas.height / 2) * 0.85;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }
      ctx.stroke();
      animationRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, [audioStream, isActive]);

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={60}
      style={{ width: '100%', height: 60, background: '#e3f2fd', borderRadius: 8, marginTop: 16 }}
    />
  );
}

export default WaveformVisualizer;
