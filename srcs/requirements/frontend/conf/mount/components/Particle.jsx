import React, { useEffect, useRef } from 'react';

const DrawingCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    function draw(e) {
      if (!isDrawing) return; // Stop drawing if not in drawing mode
      ctx.strokeStyle = '#000'; // Set stroke color
      ctx.lineWidth = 5; // Set line width

      ctx.beginPath(); // Start a new path
      ctx.moveTo(lastX, lastY); // Move to the last position
      ctx.lineTo(e.offsetX, e.offsetY); // Draw a line to the current position
      ctx.stroke(); // Stroke the path

      // Update last position to current position
      lastX = e.offsetX;
      lastY = e.offsetY;
    }

    function startDrawing(e) {
      isDrawing = true;
      lastX = e.offsetX;
      lastY = e.offsetY;
    }

    function stopDrawing() {
      isDrawing = false;
    }

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Resize canvas on initial load and window resize
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas(); // Initial resize

    window.addEventListener('resize', resizeCanvas);

    return () => {
      // Cleanup: remove event listeners
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseout', stopDrawing);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: 1 }}></canvas>;
};

export default DrawingCanvas;
