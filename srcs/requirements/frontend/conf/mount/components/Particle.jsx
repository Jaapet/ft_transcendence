import React, { useEffect, useRef, useState } from 'react';

const DrawingCanvas = () => {
  const canvasRef = useRef(null);
  const [currentColor, setCurrentColor] = useState('#000');

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    function draw(e) {
      if (!isDrawing) return;
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = 5;

      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();

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

    // Nettoyage des écouteurs d'événements
    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseout', stopDrawing);
    };
  }, [currentColor]);

  const handleColorChange = (color) => {
    setCurrentColor(color);
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        style={{ position: 'fixed', top: 0, left: 0, zIndex: 1 }}
      ></canvas>
      <div style={{ position: 'fixed', top: '25%', left: '20px', zIndex: 2, display: 'flex', flexDirection: 'column' }}>
        <button style={{ backgroundColor: '#000', width: '30px', height: '30px', marginBottom: '5px' }} onClick={() => handleColorChange('#000')}></button>
        <button style={{ backgroundColor: '#f00', width: '30px', height: '30px', marginBottom: '5px' }} onClick={() => handleColorChange('#f00')}></button>
        <button style={{ backgroundColor: '#0f0', width: '30px', height: '30px', marginBottom: '5px' }} onClick={() => handleColorChange('#0f0')}></button>
        <button style={{ backgroundColor: '#00f', width: '30px', height: '30px', marginBottom: '5px' }} onClick={() => handleColorChange('#00f')}></button>
      </div>
    </div>
  );
};

export default DrawingCanvas;
