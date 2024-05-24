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

		  {/* Player info */}
		  <div
			className={`card ${styles.customCard}`}
			style={{
			  width: '200px', 
			  marginRight: 'auto',
			}}
		  >
			<div className={`card-body ${styles.cardInfo}`}>
			  <h5>Player 1</h5>
			  {/* Put the ball texture here */}
			</div>
		  </div>


		  {/* Current leaderboard */}
		  <div
			className={`card ${styles.customCard}`}
			style={{
			  width: '200px', 
			  marginLeft: 'auto', 
			}}
		  >
			<div className={`card-body ${styles.cardInfo}`}>
			  <h5>Player 2</h5>
			  {/* Put the leaderboard here */}
			</div>
		  </div>
		</div>


		{/* Game canvas */}
		<div>
		  <Pong />
		</div>
	  </div>
	);
  };
  
  
export default PongPage;