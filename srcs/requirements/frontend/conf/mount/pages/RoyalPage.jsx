import React from 'react';
import styles from '../styles/base.module.css';
import DrawingCanvas from '../components/Drawing';
import Royal from '../components/royal';
import { useEffect, useState } from 'react';
import Link from "next/link";
import { useAuth } from '../context/AuthenticationContext';
import { useGame } from '../context/GameContext';

export default function RoyalPage({ status, detail }) {
	const { logout } = useAuth();
	const { joinRoyalGame, resetAll, inQueue, room, players } = useGame();
	const [player1, setPlayer1] = useState(null);
	const [player2, setPlayer2] = useState(null);
	const [player3, setPlayer3] = useState(null);
	const [player4, setPlayer4] = useState(null);
	const [gameEnd, setGameEnd] = useState(false);

	const [gameError, setGameError] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');

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
		joinRoyalGame();

		return () => {
			resetAll();
		}
	}, []);

	useEffect(() => {
		//console.log('PONG PAGE PLAYERS:', players); // debug
		if (players) {
			Object.entries(players).map(([key, player]) => {
				//console.log('PONG PAGE PLAYER ROLE:', player.role); // debug
				if (player.role === '1')
					setPlayer1(player);
				else if (player.role === '2')
					setPlayer2(player);
				else if (player.role === '3')
					setPlayer3(player);
				else if (player.role === '4')
					setPlayer4(player);
			});
		}
	}, [players]);

	if (gameError) {
		return (
			<div className={`${styles.container} pt-5`}>
				<div className={`card ${styles.customCard} mt-5`}>
					<div className={`card-body ${styles.cardInfo}`}>
						{ errorMessage ?
							<h1>{errorMessage}</h1>
						:
							<h1>Something went wrong...</h1>
						}
					</div>
				</div>
				<div className={styles.retrybuttonContainer}>
					<Link href="/chooseGame" passHref className={styles.retrybutton}>
						Play Again
					</Link>
					<Link href="/" passHref className={styles.retrybutton}>
						Main Menu
					</Link>
				</div>
			</div>
		);
	}

	if (gameEnd) {
		return (
			<div className={`${styles.container} pt-5`}>
				<div className={styles.retrybuttonContainer}>
					<Link href="/chooseGame" passHref className={styles.retrybutton}>
						Play Again
					</Link>
					<Link href="/" passHref className={styles.retrybutton}>
						Main Menu
					</Link>
				</div>
			</div>
		);
	}


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

			{ room && !inQueue ?
					<>
						{/* Player 1 */}
						<RoyalPlayerCard nb={1} player={player1} />
					</>
				:
					<></>
			}

			{ room && !inQueue ?
					<>
						{/* Player 2 */}
						<PongPlayerCard nb={2} player={player2} />
					</>
				:
					<></>
			}



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
		  <Royal
				gameEnd={gameEnd} setGameEnd={setGameEnd}
				gameError={gameError} setGameError={setGameError}
				setErrorMessage={setErrorMessage}
			/>
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
