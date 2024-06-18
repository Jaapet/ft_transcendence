import React from 'react';
import Royal from '../components/royal';
import styles from '../styles/base.module.css';
import DrawingCanvas from '../components/Drawing';


const RoyalPage = () => {
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


		  {/* Current leaderboard */}
		  <div
			className={`card ${styles.customCard}`}
			style={{
				position: 'absolute',
				right: '0%',
				top: '3cm', 
				width: '200px',
			}}
		  >
			<div className={`card-body ${styles.cardInfo}`}>
			  <h5>Leaderboard: (coming one day)</h5>
			  {/* Put the leaderboard here */}
			</div>
		  </div>
		
		</div>


		{/* Game canvas */}
		<DrawingCanvas/>
		  <Royal />
		</div>
	);
  };
  
  
export default RoyalPage;