import { useEffect } from 'react';
import Script from 'next/script';

const GamePage = () => {
  useEffect(() => {
    //Script.async = true;
  }, []);

  return (
    <div>
      <canvas id="pong-canvas" width="1000" height="500"></canvas>
      <Script
	  	type='module'
        src="/games/pong/pong.js"
        strategy="afterInteractive"
        onLoad={() => {
          // Initialize your game here if needed
        }}
      />
    </div>
  );
};

export default GamePage;




















/*import React, { useState } from 'react';
import Head from 'next/head';

function Pong({ initialWidth }) {*/
/*   const [canvasWidth, setCanvasWidth] = useState(initialWidth);

  const updateCanvasWidth = () => {
    const newWidth = window.innerWidth;
    setCanvasWidth(newWidth);
  };

  // Mettez à jour la largeur du canvas lors du chargement initial et lors du redimensionnement de la fenêtre
  React.useEffect(() => {
    updateCanvasWidth();
    window.addEventListener('resize', updateCanvasWidth);
    return () => {
      window.removeEventListener('resize', updateCanvasWidth);
    };
  }, []); */
/*
  return (
    <div>
      <canvas id="pong-canvas" width="1000" height="500">
        Votre navigateur ne supporte pas les canvas.
      </canvas>
      <script type="module" src="games/pong/pong.js"></script>
    </div>
  );
}*/
/*
Pong.getInitialProps = async () => {
  // Récupérez la largeur de la fenêtre côté serveur
  return { initialWidth: 1000 }; // Définissez une valeur initiale pour la largeur
};*/

//export default Pong;
