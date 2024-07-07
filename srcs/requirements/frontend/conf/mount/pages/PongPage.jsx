import React from 'react';
import { useEffect } from 'react';
import Pong from '../components/pong';
import styles from '../styles/base.module.css';
import { useAuth } from '../context/AuthenticationContext';
import { useGame } from '../context/GameContext';

export default function PongPage({ status, detail }) {
	const { logout } = useAuth();
	const { joinPong2Game } = useGame();

	const handleLogout = async () => {
		await logout();
	}

	if (status === 401 && detail === 'Not logged in') {
		handleLogout();
	}

	if (status !== 200) {
		return (
			<div className={styles.container}>
				<p className="bg-light text-black">Something went wrong...</p>
				<p className="bg-light text-black">Please reload the page.</p>
			</div>
		);
	}

	useEffect(() => {
		joinPong2Game();
	}, []);

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
}

export async function getServerSideProps(context) {
	try {
		const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/user`, {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'Cookie': context.req.headers.cookie
			}
		});
		if (!response) {
			throw new Error('Dummy fetch failed');
		}
		if (response.status === 404) {
			return {
				props: {
					status: 404,
					detail: 'Resource not found'
				}
			}
		}

		const data = await response.json();
		if (!data) {
			throw new Error('Dummy fetch failed');
		}
		if (!response.ok) {
			throw new Error(data.message, 'Dummy fetch failed');
		}

		return {
			props: {
				status: 200,
				detail: 'Success'
			}
		}
	} catch (error) {
		return {
			props: {
				status: 401,
				detail: error.message
			}
		}
	}
}
