import React from 'react';
import Pong from '../components/pong';
import styles from '../styles/base.module.css';

const PongPage = () => {
	return (
	  <div className={styles.container}>
		<div
		  style={{
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center',
			width: '100%', 
			marginTop: '8cm',
		  }}
		>

{/* you can put things here if you want */}

		</div>


		{/* Game canvas */}
		<div>
		  <Pong />
		</div>
	  </div>
	);
  };
  
  
export default PongPage;