import React from 'react';
import Royal from '../components/royal';
import styles from '../styles/base.module.css';

const RoyalPage = () => {
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
			  <h5>Your ball: (coming soon)</h5>
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
			  <h5>Leaderboard: (coming one day)</h5>
			  {/* Put the leaderboard here */}
			</div>
		  </div>
		</div>


		{/* Game canvas */}
		<div>
		  <Royal />
		</div>
	  </div>
	);
  };
  
  
export default RoyalPage;