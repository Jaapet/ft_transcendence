import { useEffect } from 'react';
import Script from 'next/script';

const Pong = () => {
  useEffect(() => {
    //Script.async = true;
  }, []);

  return (
    <div>
      <canvas id="pong-canvas" width="1000" height="800"></canvas>
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

export default Pong;

