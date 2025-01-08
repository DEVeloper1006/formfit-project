'use client';

import React, { useRef, useState } from 'react';

const VideoRecorder = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);

  const FRAME_BATCH_SIZE = 1; // Number of frames per "API" call
  const FRAME_WIDTH = 320; // Desired frame width
  const FRAME_HEIGHT = 240; // Desired frame height

  let frameBuffer = []; // Local buffer for managing frames

  const startRecording = async () => {
    if (isRecording) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      videoRef.current.play();

      setIsRecording(true);
      console.log('Recording started');
      processFrames();
    } catch (err) {
      console.error('Error accessing camera: ', err);
    }
  };

  const stopRecording = () => {
    if (videoRef.current?.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks(); // Get all tracks from the stream
        tracks.forEach((track) => track.stop()); // Stop each track
        videoRef.current.srcObject = null; // Clear the video element's stream
    }
    setIsRecording(false);
    console.log('Recording stopped');
  };

  const processFrames = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
  
    const captureFrame = () => {
      if (!isRecording) return;
  
      console.log("Processing frames...");
  
      // Draw the current video frame onto the canvas
      ctx.drawImage(videoRef.current, 0, 0, FRAME_WIDTH, FRAME_HEIGHT);
      console.log("Frame drawn on canvas");
  
      // Simulate getting the frame as a Blob
      canvas.toBlob = (blob) => {
          if (blob) {
            console.log("Frame captured:", blob);
            frameBuffer.push(blob);
  
            console.log("Buffer size:", frameBuffer.length);
  
            if (frameBuffer.length === FRAME_BATCH_SIZE) {
              console.log("Buffer full. Sending frames:", frameBuffer);
              frameBuffer = []; // Clear buffer
            }
          } else {
            console.log("No blob generated");
          }
        }

  
      // Schedule the next frame capture
      requestAnimationFrame(captureFrame);
    };
  
    captureFrame();
  };

  return (
    <div>
      <video
        ref={videoRef}
        style={{ width: '100%', maxHeight: '400px' }}
        autoPlay
        muted
      />
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
        width={FRAME_WIDTH}
        height={FRAME_HEIGHT}
      />
      <div style={{ marginTop: '10px' }}>
        {isRecording ? (
          <button onClick={stopRecording}>Stop Recording</button>
        ) : (
          <button onClick={startRecording}>Start Recording</button>
        )}
      </div>
    </div>
  );
};

export default VideoRecorder;
