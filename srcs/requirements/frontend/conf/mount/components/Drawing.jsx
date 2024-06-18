import React, { useEffect, useRef, useState } from 'react';
import ButtonColor from './ButtonColor';


const DrawingCanvas = () => {
  const canvasRef = useRef(null);
  const [canvasWidth, setCanvasWidth] = useState(800); // default canvas value (only for reload moments)
  const [canvasHeight, setCanvasHeight] = useState(600);// default canvas value (same)
  const [currentColor, setCurrentColor] = useState('#000');

  const colors = [
	'#FFFFFF', // White
	'#FFFF00', // Yellow
	'#FFA500', // Orange
	'#FF0000', // Red
	'#FF69B4', // Pink
	'#901070', // Purple
	'#0000FF', // Dark Blue
	'#00BFFF', // Light Blue
	'#00FF00', // Green
	'#8B4513', // Brown
	'#808080', // Grey
	'#000000', // Black
  ];
  

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

    // clean listeners
    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseout', stopDrawing);
    };
  }, [currentColor]);

  useEffect(() => {
    // I don't need my canvas to be bigger than my window

    const updateCanvasSize = () => {
      const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      const height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
      setCanvasWidth(width);
      setCanvasHeight(height);
    };

	//update size
    updateCanvasSize();

    // listen to resize
    window.addEventListener('resize', updateCanvasSize);

    // clean when it's done
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);

  const handleColorChange = (color) => {
    setCurrentColor(color);
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        style={{ position: 'fixed', top: 0, left: 0, zIndex: 1 }}
      ></canvas>
      
	  {/* arty side */}
	  <div style={{ position: 'fixed', top: '20%', left: '20px', zIndex: 2, display: 'flex', flexDirection: 'column' }}>
	  <img src="images/arrows.webp" alt="ArrowsGif" style={{height: '1.5cm'}}/>
	 
	 {/* mapping color button generation */}
	  {colors.map((color, index) => (
          <ButtonColor key={index} color={color} handleColorChange={handleColorChange} />
        ))}   </div>
    </div>
  );
};

export default DrawingCanvas;
