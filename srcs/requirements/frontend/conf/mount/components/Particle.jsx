import React, { useEffect, useRef } from 'react';

const ParticleCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particlesArray = [];

    const mouse = {
      x: null,
      y: null,
      radius: 100
    }

    const handleMousemove = (event) => {
      mouse.x = event.x;
      mouse.y = event.y;
      for (let i = 0; i < 5; i++) {
        particlesArray.push(new Particle());
      }
    };

    window.addEventListener('mousemove', handleMousemove);

    class Particle {
      constructor() {
        this.x = mouse.x;
        this.y = mouse.y;

        this.size = Math.random() * 10 + 1; /* random size */
        this.speedX = Math.random() * 6 - 3;/* random speeds */
        this.speedY = Math.random() * 6 - 3;
		this.color = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.4)`; // random color 
	}  
		
	update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.size > 0.2) this.size -= 0.1; /* size down */
      }
      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      }
    }

    const handleParticles = () => {
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
        if (particlesArray[i].size <= 0.3) {
          particlesArray.splice(i, 1);
          i--;
        }
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      handleParticles();
      requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });

    return () => {
      window.removeEventListener('mousemove', handleMousemove);
    }
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: 1 }}></canvas>;
};

export default ParticleCanvas;
