import { useEffect } from 'react';
import Script from 'next/script';

const GamePage = () => {
  useEffect(() => {
    //Script.async = true;
  }, []);

  return (
    <div>
      <canvas id="royal-canvas" width="1000" height="800"></canvas>
      <Script
	  	type='module'
        src="/games/royal/royal.js"
        strategy="afterInteractive"
        onLoad={() => {
          // Initialize your game here if needed
        }}
      />
    </div>
  );
};

export default GamePage;

