import React from 'react';
import Pong from '../components/pong';
import styles from '../styles/base.module.css';
import DrawingCanvas from '../components/Drawing';


const PongPage = () => {
	return (
	  <div className={styles.container}>
		<div
		  style={{
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center',
			width: '100%', 
		  }}
		>
		</div>

{/* you can put things here if you want */}



		{/* Game canvas */}
		<DrawingCanvas/>
		  <Pong />
	  </div>
	);
  };
  
  
export default PongPage;